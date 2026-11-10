/**
 * SNOW & FROST PARTICLE GLSL SHADER
 * Atmospheric snow and frost particles with velocity streak stretching
 * Snowy Studios (getsnowy.net)
 */

export const SnowVertexShader = `
  uniform float uTime;
  uniform float uVelocity;
  uniform float uPixelRatio;

  attribute float aScale;
  attribute float aSpeed;
  attribute vec3 aOffset;

  varying float vAlpha;
  varying vec3 vColor;

  void main() {
    vec3 pos = position;

    // Continuous glacial drift
    pos.y -= mod(uTime * aSpeed * 3.0 + aOffset.y, 40.0) - 20.0;
    pos.x += sin(uTime * 0.6 + aOffset.x) * 1.8;
    pos.z += cos(uTime * 0.5 + aOffset.z) * 1.8;

    // Scroll velocity influence
    pos.y -= uVelocity * 0.04 * aSpeed;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    float dist = length(mvPosition.xyz);
    float sizeFactor = (260.0 / dist) * aScale * uPixelRatio;

    // Velocity stretch effect
    gl_PointSize = clamp(sizeFactor * (1.0 + abs(uVelocity) * 0.03), 1.5, 35.0);

    // Alpha fade
    vAlpha = smoothstep(35.0, 4.0, dist) * 0.85;

    // Crisp glacial silver and frost white tint
    if (mod(aOffset.x, 3.0) < 1.0) {
      vColor = vec3(0.78, 0.85, 0.94); // Glacial silver #c8daf0
    } else if (mod(aOffset.x, 3.0) < 2.0) {
      vColor = vec3(0.88, 0.92, 0.97); // Soft metallic frost
    } else {
      vColor = vec3(0.96, 0.98, 1.0);  // Pure frost white
    }
  }
`;

export const SnowFragmentShader = `
  varying float vAlpha;
  varying vec3 vColor;

  void main() {
    vec2 coord = gl_PointCoord - vec2(0.5);
    float dist = length(coord);

    if (dist > 0.5) {
      discard;
    }

    float strength = pow(1.0 - (dist * 2.0), 1.8);
    gl_FragColor = vec4(vColor, strength * vAlpha);
  }
`;
