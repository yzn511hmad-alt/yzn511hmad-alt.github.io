import * as THREE from 'three';
import { auroraLightingGLSL, type AuroraLightUniforms } from '../components/AuroraLighting';

/** Re-evaluates the ORIGINAL 48-sample quadrature in one
 * tiny mesh draw, at full float32 precision, rather than per receiver vertex.
 * This is a dynamic per-frame bake, never a static replacement of the aurora.
 * Call before the main scene; retain the original vertex path when unsupported.
 */
export function createAuroraIrradianceBake(renderer: THREE.WebGLRenderer, lighting: AuroraLightUniforms, originalSkyVertex?: string) {
  if (!renderer.extensions.has('EXT_color_buffer_float')) return undefined;
  const target = new THREE.WebGLRenderTarget(1, 1, {
    type: THREE.FloatType, format: THREE.RGBAFormat,
    minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter,
    depthBuffer: false, stencilBuffer: false, generateMipmaps: false,
    colorSpace: THREE.LinearSRGBColorSpace,
  });
  const material = new THREE.ShaderMaterial({
    uniforms: lighting, depthTest: false, depthWrite: false,
    blending: THREE.NoBlending, toneMapped: false,
    // The caller may pass the ORIGINAL sky vertex source before replacing its
    // irradiance expression. Keep both varyings live, as in the original sky.
    vertexShader: originalSkyVertex ?? `varying vec2 vUv;varying vec3 vAuroraIrradiance;
      ${auroraLightingGLSL}
      void main(){vUv=uv;vAuroraIrradiance=auroraDiffuseIrradiance(vec3(0.,1.,0.));gl_Position=vec4(position.xy,.9999999,1.);}`,
    fragmentShader: 'varying vec2 vUv;varying vec3 vAuroraIrradiance;void main(){gl_FragColor=vec4(vAuroraIrradiance,vUv.x);}',
  });
  const geometry = new THREE.PlaneGeometry(2,2);
  const point = new THREE.Mesh(geometry, material);point.frustumCulled = false;
  const scene = new THREE.Scene();scene.add(point);
  const camera = new THREE.Camera();
  const uniform = { value: target.texture };
  let disposed = false;
  let preparation: Promise<boolean> | undefined;
  return {
    target, uniform,
    prepare(): Promise<boolean> {
      if (disposed) return Promise.resolve(false);
      if (preparation) return preparation;
      const saved = {
        target: renderer.getRenderTarget(), face: renderer.getActiveCubeFace(), mip: renderer.getActiveMipmapLevel(),
        viewport: renderer.getViewport(new THREE.Vector4()), scissor: renderer.getScissor(new THREE.Vector4()),
        scissorTest: renderer.getScissorTest(), tone: renderer.toneMapping, xr: renderer.xr.enabled,
      };
      let queued: Promise<THREE.Object3D>;
      try {
        renderer.xr.enabled = false;renderer.toneMapping = THREE.NoToneMapping;
        renderer.setRenderTarget(target);
        // compileAsync captures the target/tone configuration synchronously.
        // Poll completion only AFTER restoring the owner's renderer state.
        queued = renderer.compileAsync(scene, camera);
      } catch (error) {
        return Promise.reject(error);
      } finally {
        renderer.setRenderTarget(saved.target, saved.face, saved.mip);
        renderer.setViewport(saved.viewport);renderer.setScissor(saved.scissor);renderer.setScissorTest(saved.scissorTest);
        renderer.toneMapping = saved.tone;renderer.xr.enabled = saved.xr;
      }
      preparation = queued.then(() => !disposed);
      return preparation;
    },
    update() {
      if (disposed) return;
      const saved = {
        target: renderer.getRenderTarget(), face: renderer.getActiveCubeFace(), mip: renderer.getActiveMipmapLevel(),
        viewport: renderer.getViewport(new THREE.Vector4()), scissor: renderer.getScissor(new THREE.Vector4()),
        scissorTest: renderer.getScissorTest(), autoClear: renderer.autoClear,
        tone: renderer.toneMapping, exposure: renderer.toneMappingExposure, color: renderer.outputColorSpace,
        xr: renderer.xr.enabled,
      };
      try {
        renderer.xr.enabled = false;renderer.autoClear = false;
        renderer.toneMapping = THREE.NoToneMapping;
        renderer.setRenderTarget(target);renderer.setViewport(0, 0, 1, 1);renderer.setScissorTest(false);
        renderer.render(scene, camera);
      } finally {
        renderer.setRenderTarget(saved.target, saved.face, saved.mip);
        renderer.setViewport(saved.viewport);renderer.setScissor(saved.scissor);renderer.setScissorTest(saved.scissorTest);
        renderer.autoClear = saved.autoClear;renderer.toneMapping = saved.tone;
        renderer.toneMappingExposure = saved.exposure;renderer.outputColorSpace = saved.color;renderer.xr.enabled = saved.xr;
      }
    },
    dispose() { if(disposed)return;disposed=true;geometry.dispose();material.dispose();target.dispose();scene.clear(); },
  };
}
