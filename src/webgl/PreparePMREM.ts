import * as THREE from 'three';

type PreparedGenerator = {
  _setSize: (size: number) => void;
  _allocateTargets: () => THREE.WebGLRenderTarget;
  _pingPongRenderTarget: THREE.WebGLRenderTarget | null;
  _ggxMaterial: THREE.ShaderMaterial | null;
  _blurMaterial: THREE.ShaderMaterial | null;
  _lodMeshes: THREE.Mesh[];
};

/** Optional warmup for the inspected Three r186 PMREM layout. False means that
 * the caller should use its unchanged synchronous fromScene path. No generator
 * material/geometry is replaced, disposed, or edited. Call serially, before
 * fromScene; after awaiting, the owner must still check its disposal flag. */
export async function preparePMREM(
  renderer: THREE.WebGLRenderer,
  generator: THREE.PMREMGenerator,
  room: THREE.Scene,
  stopped: () => boolean = () => false,
): Promise<boolean> {
  if (stopped() || THREE.REVISION !== '186'
    || typeof renderer.compileAsync !== 'function'
    || !renderer.extensions.has('KHR_parallel_shader_compile')) return false;
  const privateGenerator = generator as unknown as Partial<PreparedGenerator>;
  if (typeof privateGenerator._setSize !== 'function'
    || typeof privateGenerator._allocateTargets !== 'function') return false;

  const previous = {
    target: renderer.getRenderTarget(), face: renderer.getActiveCubeFace(),
    mip: renderer.getActiveMipmapLevel(), tone: renderer.toneMapping,
    exposure: renderer.toneMappingExposure, colorSpace: renderer.outputColorSpace,
  };
  let unused: THREE.WebGLRenderTarget | undefined;
  let queued: Promise<unknown>[] = [];
  try {
    privateGenerator._setSize.call(generator, 256);
    unused = privateGenerator._allocateTargets.call(generator);
    const target = privateGenerator._pingPongRenderTarget;
    const ggx = privateGenerator._ggxMaterial, blur = privateGenerator._blurMaterial;
    const geometry = privateGenerator._lodMeshes?.[0]?.geometry;
    if (!target?.isWebGLRenderTarget || target.width !== 768 || target.height !== 1024
      || target.texture.type !== THREE.HalfFloatType
      || target.texture.colorSpace !== THREE.LinearSRGBColorSpace
      || !ggx?.isShaderMaterial || ggx.defines.GGX_SAMPLES !== 256
      || !blur?.isShaderMaterial || blur.defines.SAMPLES !== 20
      || !geometry?.isBufferGeometry || stopped()) return false;
    const filters = new THREE.Scene();
    filters.add(new THREE.Mesh(geometry, ggx), new THREE.Mesh(geometry, blur));
    // PMREM filters render into linear half-float targets without tone mapping.
    // Binding its existing ping-pong target avoids allocating a warmup GPU image.
    renderer.setRenderTarget(target);
    renderer.toneMapping = THREE.NoToneMapping;
    renderer.toneMappingExposure = 1;
    renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    queued = [
      renderer.compileAsync(filters, new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)),
      renderer.compileAsync(room, new THREE.PerspectiveCamera(90, 1, .1, 100)),
    ];
  } catch {
    return false;
  } finally {
    // compileAsync captures render configuration in its synchronous compile()
    // call. Restore it before yielding to its asynchronous completion polling.
    renderer.setRenderTarget(previous.target, previous.face, previous.mip);
    renderer.toneMapping = previous.tone;
    renderer.toneMappingExposure = previous.exposure;
    renderer.outputColorSpace = previous.colorSpace;
    // _allocateTargets returns a separate, never-bound output target. Its GPU
    // storage was never initialized; keep the generator's ping-pong target alive.
    unused?.dispose();
  }
  try {
    const timeout = new Promise<boolean>(resolve => setTimeout(() => resolve(false), 200));
    await Promise.race([Promise.all(queued), timeout]);
    return !stopped();
  } catch {
    return false;
  }
}
