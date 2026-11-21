import * as THREE from 'three';

const capacity = 36;
const lifetime = .55;

export function createPricingLightTrails(scene: THREE.Scene, card: THREE.Group, bitcoin: THREE.Group, paypal: THREE.Group) {
  const emitters = [
    {object: card, edge: new THREE.Vector3(-1.28, 2.09, .04), color: 0xb88aff, start: 0, end: 1.11, strength: 1},
    {object: card, edge: new THREE.Vector3(1.28, -2.09, .04), color: 0xa29aff, start: 0, end: 1.11, strength: .76},
    {object: bitcoin, edge: new THREE.Vector3(-.22, .58, .04), color: 0xffc56b, start: .46, end: 1.43, strength: 1},
    {object: paypal, edge: new THREE.Vector3(.25, .565, .04), color: 0x86bcff, start: .79, end: 1.66, strength: 1},
  ].map(emitter => ({
    ...emitter, head: 0, count: 0,
    points: Array.from({length: capacity}, () => new THREE.Vector3()),
    times: new Float32Array(capacity),
  }));

  const vertices = emitters.length * capacity * 2;
  const dynamic = (size: number) =>
    new THREE.BufferAttribute(new Float32Array(vertices * size), size).setUsage(THREE.DynamicDrawUsage);
  const position = dynamic(3);
  const previous = dynamic(3);
  const next = dynamic(3);
  const opacity = dynamic(1);
  const side = new THREE.BufferAttribute(new Float32Array(vertices), 1);
  const tint = new THREE.BufferAttribute(new Float32Array(vertices * 3), 3);
  const indices: number[] = [];
  for (const [index, emitter] of emitters.entries()) {
    const color = new THREE.Color(emitter.color);
    for (let i = 0; i < capacity; i++) {
      const left = (index * capacity + i) * 2;
      side.setX(left, -1);
      side.setX(left + 1, 1);
      tint.setXYZ(left, color.r, color.g, color.b);
      tint.setXYZ(left + 1, color.r, color.g, color.b);
      if (i < capacity - 1) indices.push(left, left + 1, left + 2, left + 2, left + 1, left + 3);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setIndex(indices);
  geometry.setAttribute('position', position);
  geometry.setAttribute('previousPoint', previous);
  geometry.setAttribute('nextPoint', next);
  geometry.setAttribute('trailOpacity', opacity);
  geometry.setAttribute('trailSide', side);
  geometry.setAttribute('trailColor', tint);
  const viewport = new THREE.Vector2();
  const material = new THREE.ShaderMaterial({
    uniforms: {viewport: {value: viewport}},
    vertexShader: `
      uniform vec2 viewport;
      attribute vec3 previousPoint;
      attribute vec3 nextPoint;
      attribute float trailOpacity;
      attribute float trailSide;
      attribute vec3 trailColor;
      varying float across;
      varying float intensity;
      varying vec3 tint;
      void main() {
        mat4 project = projectionMatrix * modelViewMatrix;
        vec4 center = project * vec4(position, 1.0);
        vec4 before = project * vec4(previousPoint, 1.0);
        vec4 after = project * vec4(nextPoint, 1.0);
        vec2 axis = (after.xy / after.w - before.xy / before.w) * viewport;
        vec2 normal = vec2(-axis.y, axis.x) / max(length(axis), 0.001);
        float radius = mix(1.4, 4.4, sqrt(trailOpacity));
        center.xy += normal * trailSide * radius * 2.0 / viewport * center.w;
        gl_Position = center;
        across = trailSide;
        intensity = trailOpacity;
        tint = trailColor;
      }
    `,
    fragmentShader: `
      varying float across;
      varying float intensity;
      varying vec3 tint;
      void main() {
        float distanceFromCenter = abs(across);
        float core = exp(-distanceFromCenter * distanceFromCenter * 24.0);
        float halo = (1.0 - smoothstep(0.08, 1.0, distanceFromCenter)) * 0.25;
        gl_FragColor = vec4(mix(tint, vec3(0.9, 0.95, 1.0), core * 0.22), intensity * (core * 0.75 + halo));
        #include <colorspace_fragment>
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    forceSinglePass: true,
    depthWrite: false,
    toneMapped: false,
  });
  const ribbon = new THREE.Mesh(geometry, material);
  ribbon.name = 'pricing-entrance-light-trails';
  ribbon.frustumCulled = false;
  ribbon.renderOrder = 10;
  ribbon.visible = false;
  scene.add(ribbon);

  function update(time: number, remaining: number, exposure: number, width: number, height: number) {
    viewport.set(width, height);
    const finish = THREE.MathUtils.smoothstep(remaining, 0, .22) * exposure;
    let visible = false;
    for (const [index, emitter] of emitters.entries()) {
      if (time >= emitter.start && time <= emitter.end) {
        emitter.object.updateWorldMatrix(true, false);
        emitter.points[emitter.head].copy(emitter.edge).applyMatrix4(emitter.object.matrixWorld);
        emitter.times[emitter.head] = time;
        emitter.head = (emitter.head + 1) % capacity;
        emitter.count = Math.min(capacity, emitter.count + 1);
      }
      const newest = emitter.count - 1;
      const first = (emitter.head - emitter.count + capacity) % capacity;
      const pointAt = (offset: number) => emitter.points[(first + offset) % capacity];
      for (let i = 0; i < capacity; i++) {
        // Collapse unused vertices to the last sample so they make no triangles.
        const sample = Math.max(0, Math.min(i, newest));
        const point = pointAt(sample);
        const before = pointAt(Math.max(0, sample - 1));
        const after = pointAt(Math.max(0, Math.min(newest, sample + 1)));
        const age = time - emitter.times[(first + sample) % capacity];
        const fade = i === 0 || newest < 1 ? 0 : 1 - THREE.MathUtils.smoothstep(age, 0, lifetime);
        const light = fade * finish * emitter.strength;
        visible ||= light > 0;
        const left = (index * capacity + i) * 2;
        for (let vertex = left; vertex <= left + 1; vertex++) {
          position.setXYZ(vertex, point.x, point.y, point.z);
          previous.setXYZ(vertex, before.x, before.y, before.z);
          next.setXYZ(vertex, after.x, after.y, after.z);
          opacity.setX(vertex, light);
        }
      }
    }
    ribbon.visible = visible;
    if (visible) {
      position.needsUpdate = previous.needsUpdate = next.needsUpdate = opacity.needsUpdate = true;
    }
  }

  return {
    update,
    hide() { ribbon.visible = false; },
    reset() {
      for (const emitter of emitters) emitter.count = 0;
      ribbon.visible = false;
    },
    dispose() {
      ribbon.removeFromParent();
      geometry.dispose();
      material.dispose();
    },
  };
}
