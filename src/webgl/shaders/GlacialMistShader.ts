/**
 * GLACIAL MIST & LIGHT BEAMS GLSL SHADER (OPTIMIZED & VECTORIZED)
 * Atmospheric mist and subtle radial light beams matching Image 1
 * Snowy Studios (getsnowy.net)
 */

export const MistVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

export const MistFragmentShader = `
  precision highp float;

  uniform float uTime;
  uniform vec2 uResolution;
  uniform float uVelocity;

  varying vec2 vUv;

  // Precomputed constant rotation matrix (eliminates per-pixel cos/sin in fbm)
  const mat2 ROT_FBM = mat2(0.87758, 0.47943, -0.47943, 0.87758);
  const vec2 SHIFT_FBM = vec2(100.0, 100.0);

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), f.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
      f.y
    );
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 3; ++i) { // Reduced octave from 4 to 3 for ~25% shader speedup with indistinguishable visual quality
      v += a * noise(p);
      p = ROT_FBM * p * 2.0 + SHIFT_FBM;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = vUv;
    vec2 aspectUv = (uv - 0.5) * vec2(uResolution.x / uResolution.y, 1.0);

    float speed = uTime * 0.12;
    float mist = fbm(aspectUv * 2.2 + vec2(speed * 0.3, speed * 0.8));

    // Radial light beams radiating from top center
    vec2 lightSource = vec2(0.0, 0.7);
    float beamDist = length(aspectUv - lightSource);
    float beamAngle = atan(aspectUv.x, aspectUv.y - lightSource.y);
    float beam = sin(beamAngle * 8.0 + uTime * 0.3) * 0.5 + 0.5;
    beam = pow(beam, 3.0) * smoothstep(1.8, 0.1, beamDist);

    // Deep Midnight Dark Blue Base (#060b14)
    vec3 darkBase = vec3(0.023, 0.043, 0.078);
    vec3 darkMistColor = mix(vec3(0.04, 0.12, 0.22), vec3(0.16, 0.71, 0.96), mist * 0.4);
    vec3 darkBeamColor = vec3(0.2, 0.6, 0.9) * beam * 0.3;

    vec3 finalColor = darkBase + darkMistColor * 0.35 + darkBeamColor;

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;
