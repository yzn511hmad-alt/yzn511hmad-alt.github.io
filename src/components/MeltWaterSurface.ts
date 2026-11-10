import * as THREE from 'three';
import { MELT_TINT } from './MeltPalette';

/**
 * One connected shallow surface. This is an artistic wet-film approximation,
 * not a fluid solver or a claim of conserved ice/water volume.
 * The owner adds mesh to its scene and disposes geometry/material by traversal.
 */
export function createMeltWaterSurface(): {
  mesh: THREE.Mesh<THREE.BufferGeometry, THREE.MeshPhysicalMaterial>;
  update(progress: number, iceScale: number, collect: number): void;
} {
  const sectors = 96;
  const rings = [.20, .40, .62, .80, .92, .945, .967, .984, .995, 1];
  const vertexCount = 1 + sectors * rings.length;
  const positions = new Float32Array(vertexCount * 3);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3).setUsage(THREE.DynamicDrawUsage));
  geometry.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(vertexCount * 3), 3).setUsage(THREE.DynamicDrawUsage));

  const indices: number[] = [];
  for (let i = 0; i < sectors; i++) {
    const next = (i + 1) % sectors;
    indices.push(0, 1 + next, 1 + i);
    for (let ring = 1; ring < rings.length; ring++) {
      const inner = 1 + (ring - 1) * sectors;
      const outer = 1 + ring * sectors;
      indices.push(inner + i, outer + next, outer + i);
      indices.push(inner + i, inner + next, outer + next);
    }
  }
  geometry.setIndex(indices);
  const filmRadius=new Float32Array(vertexCount);
  for(let ring=0;ring<rings.length;ring++)for(let i=0;i<sectors;i++)filmRadius[1+ring*sectors+i]=rings[ring];
  geometry.setAttribute('filmRadius',new THREE.BufferAttribute(filmRadius,1));
  // A stable bound avoids rescanning it on every morph. All shapes fit inside.
  geometry.boundingBox = new THREE.Box3(new THREE.Vector3(-2.2, 0, -1.95), new THREE.Vector3(2.2, .03, 1.95));
  geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, .012, 0), 2.95);

  const material = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0,
    roughness: .045,
    transmission: 1,
    ior: 1.333,
    thickness: .011,
    attenuationColor: MELT_TINT,
    attenuationDistance: .025,
    clearcoat: 0,
    specularColor: 0xffffff,
    specularIntensity: 1,
    envMapIntensity: .75,
    toneMapped: false,
    transparent: true,
    opacity: 0,
    depthWrite: false,
  });
  // The thinner boundary traverses less blue-absorbing volume.
  // Specular reflection and transmission remain on the continuous surface.
  const waterProgress={value:0};
  material.onBeforeCompile=shader=>{
    shader.uniforms.uWaterProgress=waterProgress;
    shader.vertexShader='attribute float filmRadius;varying float vFilmRadius;varying vec2 vWaterPoint;\n'+shader.vertexShader;
    shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n vFilmRadius=filmRadius;vWaterPoint=position.xz;');
    shader.fragmentShader='uniform float uWaterProgress;varying float vFilmRadius;varying vec2 vWaterPoint;\n'+shader.fragmentShader;
    shader.fragmentShader=shader.fragmentShader.replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
      float phase=uWaterProgress*8.;
      vec2 ripple=vec2(sin(vWaterPoint.x*4.3+vWaterPoint.y*.8-phase),cos(vWaterPoint.y*3.9-vWaterPoint.x*.6+phase*.7));
      ripple+=.35*vec2(cos(vWaterPoint.y*7.1+vWaterPoint.x*1.7-phase*.6),sin(vWaterPoint.x*6.2-vWaterPoint.y*1.9+phase*.9));
      normal=normalize(normal+vec3(ripple.x,ripple.y,0.)*.018*sin(vFilmRadius*3.14159265));`);
    // Restrained authored microfacet glints follow the same ripple phase.
    shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>',`
      float waterPhase=uWaterProgress*8.;
      float crossing=sin(vWaterPoint.x*4.3+vWaterPoint.y*.8-waterPhase)*sin(vWaterPoint.y*3.9-vWaterPoint.x*.6+waterPhase*.7);
      float glint=pow(max(0.,.5+.5*crossing),12.)*(1.-smoothstep(.70,1.,vFilmRadius));
      outgoingLight+=vec3(.030,.045,.055)*glint;
      #include <opaque_fragment>`);
    const filmTransmission=THREE.ShaderChunk.transmission_fragment.replace('material.thickness = thickness;', 'material.thickness = thickness * (.12+.88*(1.-smoothstep(.55,1.,vFilmRadius)));');
    shader.fragmentShader=shader.fragmentShader.replace('#include <transmission_fragment>',filmTransmission);
  };
  material.customProgramCacheKey=()=> 'snowy-growing-water-v3';
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = 'melt-water-surface';
  mesh.castShadow = false;
  mesh.receiveShadow = false;

  const cosine = new Float64Array(sectors), sine = new Float64Array(sectors);
  const finalX = new Float64Array(sectors), finalZ = new Float64Array(sectors);
  let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
  for (let i = 0; i < sectors; i++) {
    const angle = i / sectors * Math.PI * 2;
    cosine[i] = Math.cos(angle); sine[i] = Math.sin(angle);
    // Quiet asymmetry: no four-lobed patches and no time-driven waves.
    const organic = 1 - .10*Math.exp(-Math.pow((angle-.8)/.36,2)) + .075 * Math.sin(angle * 3 + .6)
      + .032 * Math.sin(angle * 5 - 1.1) + .008 * Math.cos(angle * 7 + .2)
      + .04 * Math.cos(angle * 2 + .4);
    finalX[i] = cosine[i] * organic; finalZ[i] = sine[i] * organic;
    minX = Math.min(minX, finalX[i]); maxX = Math.max(maxX, finalX[i]);
    minZ = Math.min(minZ, finalZ[i]); maxZ = Math.max(maxZ, finalZ[i]);
  }
  for (let i = 0; i < sectors; i++) {
    finalX[i] = (finalX[i] - (minX + maxX) * .5) * 4.2 / (maxX - minX);
    finalZ[i] = (finalZ[i] - (minZ + maxZ) * .5) * 3.7 / (maxZ - minZ);
  }

  const clamp = (value: number) => THREE.MathUtils.clamp(Number.isFinite(value) ? value : 0, 0, 1);
  const smooth = (start: number, end: number, value: number) => {
    const t = THREE.MathUtils.clamp((value - start) / (end - start), 0, 1);
    return t * t * (3 - 2 * t);
  };
  // Ray/rounded-square intersection, matching the initial cube's .15 corner.
  const squareRadius = (cx: number, sz: number, half: number, corner: number) => {
    const a = Math.abs(cx), b = Math.abs(sz), inner = half - corner;
    const face = half / Math.max(a, b);
    if (Math.min(a, b) * face <= inner) return face;
    const projection = inner * (a + b);
    return projection + Math.sqrt(Math.max(0, projection * projection - 2 * inner * inner + corner * corner));
  };

  let previousProgress = -1, previousScale = -1;
  const update = (progress: number, iceScale: number, collect: number) => {
    const p = clamp(progress), scale = clamp(iceScale), collected = clamp(collect);
    const wetting = smooth(0, .06, p);
    material.opacity = wetting * (1 - collected);
    waterProgress.value=p;
    material.thickness = .001 + .010 * (1 - scale ** 3);
    mesh.visible = material.opacity > .0001;
    if (p === previousProgress && scale === previousScale) return;
    previousProgress = p; previousScale = scale;

    const released = 1 - scale ** 3;
    // No early ease-out: late ice loss must keep pushing the wet boundary out.
    const spread = Math.pow(released,1.35);
    // The original wet footprint stays behind as the cube shrinks. A minute
    // contact allowance also covers a caller that holds the ice at scale1.
    const half = 1 + .014 * wetting;
    const corner = .15;
    const filmHeight = .003 + .021 * released;
    positions[0] = 0; positions[1] = .0006 + filmHeight; positions[2] = 0;
    for (let i = 0; i < sectors; i++) {
      const radius = squareRadius(cosine[i], sine[i], half, corner);
      const boundaryX = THREE.MathUtils.lerp(cosine[i] * radius, finalX[i], spread);
      const boundaryZ = THREE.MathUtils.lerp(sine[i] * radius, finalZ[i], spread);
      for (let ring = 0; ring < rings.length; ring++) {
        const t = rings[ring], x = boundaryX * t, z = boundaryZ * t;
        // A low continuous cap becomes a tight, rounded meniscus over the last
        // 5.5% of its radius. It always slopes DOWN: no raised ring or wall.
        const edge = THREE.MathUtils.clamp((t - .945) / .055, 0, 1);
        const cap = (1 - .12 * t * t) * Math.sqrt(Math.max(0, 1 - edge * edge));
        const quietContour = .0012 * Math.sin(x * 4.3 + z * .7 - p*8)
          * Math.sin(z * 3.9 - x * .5 + p*5) * Math.sin(t * Math.PI) ** 2;
        const offset = (1 + ring * sectors + i) * 3;
        positions[offset] = x;
        positions[offset + 1] = .0006 + filmHeight * cap + quietContour * wetting;
        positions[offset + 2] = z;
      }
    }
    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();
    let twiceArea=0;
    const boundary=1+(rings.length-1)*sectors;
    for(let i=0;i<sectors;i++){
      const a=(boundary+i)*3,b=(boundary+(i+1)%sectors)*3;
      twiceArea+=positions[a]*positions[b+2]-positions[b]*positions[a+2];
    }
    // Visual film measurements only: this is not a conserved-volume solver.
    mesh.userData.area=Math.abs(twiceArea)*.5;
    mesh.userData.visualVolume=mesh.userData.area*filmHeight*.90;
    mesh.userData.filmHeight=filmHeight;
    // These are optical/animation metadata, not physical volume measurements.
    mesh.userData.wetness = wetting;
    mesh.userData.spread = spread;
  };
  update(0, 1, 0);
  return { mesh, update };
}
