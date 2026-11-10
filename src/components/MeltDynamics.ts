import * as THREE from 'three';

const smooth = (a: number, b: number, p: number) => {
  const t = THREE.MathUtils.clamp((p - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

/** Reference choreography: predominantly vertical melt, with a broad ice
 * footprint that thins away completely. This is an authored visual sequence. */
export function iceBounds(progress: number) {
  const p = THREE.MathUtils.clamp(progress, 0, 1), melt = Math.pow(p, 1.55);
  const footprint = THREE.MathUtils.lerp(1 - .12 * melt, .985, smooth(.66, 1, p));
  return { x: footprint, y: 1 - melt, z: footprint, cx: 0, cz: 0 };
}

// One deformation drives both the visible body and its shadow. The early and
// middle stages follow the selected reference; the end becomes a soft, low
// cap with an unbroken footprint, not a raised rectangular lip.
export const meltVertex = `
vec3 meltIce(vec3 p){
  float t=clamp(uMelt,0.,1.);
  float melt=pow(t,1.55);
  float h=(p.y+1.)*.5;
  float finish=smoothstep(.66,1.,t);
  float width=1.-.12*melt-.10*melt*h*h;
  vec3 q=p;
  q.xz*=width;
  float height=2.*(1.-melt);
  float slump=.10*melt*sin(h*3.14159265)*(1.-.20*sin(p.x*3.+p.z*2.));
  q.y=-1.+max(0.,height*h-slump);
  // A watertight truncated superellipsoid: a broad rounded-square cap,
  // with a flat contact patch and convex upper surface. There is no lip.
  vec3 direction=normalize(p);
  float radial=length(direction.xz);
  vec2 heading=direction.xz/max(radial,.00001);
  float squareRadius=pow(max(.00001,pow(abs(heading.x),6.)+pow(abs(heading.y),6.)),-1./6.);
  vec3 cap;
  cap.xz=heading*radial*squareRadius*mix(1.-.12*melt,.985,finish);
  cap.x*=1.+.018*(sin(heading.y*2.7+.7)-sin(.7));
  cap.z*=1.+.015*(sin(heading.x*3.1-.5)+sin(.5));
  cap.y=-1.+height*(max(-.65,direction.y)+.65)/1.65;
  q=mix(q,cap,finish);
  return q;
}`;

/** Preserve the selected reference's progressive lean, rather than the newer
 * release-and-fall sequence. The last pose rests on the wet floor after all ice is gone. */
export function createKeyChoreography(key: THREE.Group) {
  const rotation = new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, -.08));
  const point = new THREE.Vector3();
  let lowest = Infinity;
  key.traverse(node => {
    if (!(node instanceof THREE.Mesh)) return;
    node.updateMatrix();
    const positions = node.geometry.getAttribute('position');
    for (let i = 0; i < positions.count; i++) {
      point.fromBufferAttribute(positions, i).applyMatrix4(node.matrix).multiplyScalar(.70).applyQuaternion(rotation);
      lowest = Math.min(lowest, point.y);
    }
  });
  const endY = .029 - lowest + .002;
  const pose = (progress: number) => {
    const p = THREE.MathUtils.clamp(progress, 0, 1), lean = smooth(.64, 1, p);
    return {
      angle: Math.PI / 2 * lean,
      y: .14 - .045 * lean + (endY - .095) * smooth(.78, 1, p),
      z: .08 + .68 * lean,
    };
  };
  return { pose, endY };
}
