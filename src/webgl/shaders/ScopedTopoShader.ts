/**
 * AUTONOMOUS LIQUID TOPOGRAPHIC SHADER — ROBUST LOCAL VELOCITY RIPPLE
 * Snowy Studios (getsnowy.net)
 *
 * Visual System:
 * - 100% Flat #08090b background (Dark) / #f8fafc (Light)
 * - Translucent borderless filled organic petals (#0e1014)
 * - Crisp ultra-subtle topographic contour lines (rgba(255,255,255,0.035))
 * - Continuous autonomous drift/morph with uTime
 * - Local-only velocity ripple under cursor (uMouseFast - uMouseSlow)
 * - ZERO array uniforms, ZERO GLSL loops, ZERO global screen sliding
 */

export const ScopedTopoVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

export const ScopedTopoFragmentShader = `
  precision highp float;

  uniform float uTime;
  uniform float uAspect;
  uniform vec2  uMouseFast;
  uniform vec2  uMouseSlow;
  uniform float uScroll;
  uniform float uVelocity;
  uniform float uTheme; // 0.0 = dark, 1.0 = light
  uniform int   uPreset; // 0: arctic-snow, 1: glacial-cyan, 2: frosted-platinum, 3: deep-midnight
  uniform float uLineMult; // 0.0 = clean, 1.0 = topographic lines enabled

  varying vec2 vUv;

  // ---------------------------------------------------------------------------
  // Standard 3D Simplex Noise (Ian McEwan, Ashima Arts / Stefan Gustavson)
  // ---------------------------------------------------------------------------
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

    // First corner
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);

    // Other corners
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);

    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;

    // Permutations
    i = mod289(i);
    vec4 p = permute( permute( permute(
               i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
             + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
             + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

    float n_ = 0.142857142857; // 1.0 / 7.0
    vec3  ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);

    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);

    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);

    vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
  }

  void main() {
    vec2 aspectUV = vec2(vUv.x * uAspect, vUv.y);

    // -------------------------------------------------------------------------
    // Local-Only Velocity Ripple (No Global Parallax Shift)
    // -------------------------------------------------------------------------
    vec2 mFast = vec2(uMouseFast.x * uAspect, uMouseFast.y);
    vec2 mSlow = vec2(uMouseSlow.x * uAspect, uMouseSlow.y);
    vec2 mVel  = mFast - mSlow; // Decays to (0,0) when mouse stops

    vec2 diff = aspectUV - mFast;
    float distSq = dot(diff, diff);
    float localWeight = exp(-distSq * 7.5);

    // Continuous subtle ambient idle animation (gentle floating/breathing wave loop)
    vec2 ambientIdleWave = vec2(
      sin(uTime * 0.45) * 0.018 + cos(uTime * 0.28) * 0.012,
      cos(uTime * 0.38) * 0.016 + sin(uTime * 0.22) * 0.010
    );

    // Subtle parallax offset layered from mouse position (centered at 0.5, 0.5)
    vec2 mouseOffset = (mSlow - vec2(0.5 * uAspect, 0.5)) * 0.045;

    // Local velocity-only silk ripple right where cursor moves
    vec2 localWake = -mVel * localWeight * 2.8;

    // Composited line and petal UVs: ambient idle + smooth parallax + velocity ripple
    vec2 scrollWake = vec2(sin(aspectUV.y * 5.0 + uTime) * uVelocity * 0.012, uVelocity * 0.018);
    vec2 lineUV = aspectUV + ambientIdleWave + mouseOffset + localWake * 0.75 + scrollWake;
    vec2 petalUV = aspectUV + ambientIdleWave * 0.85 + mouseOffset * 0.75 + localWake * 1.25 + scrollWake * 0.6;

    // -------------------------------------------------------------------------
    // Layer A: Autonomous 1px Topographic Contour Lines
    // -------------------------------------------------------------------------
    vec2 uvA = lineUV * 1.65
             + vec2(uTime * 0.05, -uTime * 0.035)
             + vec2(0.0, -uScroll * 0.00018);

    float nA = snoise(vec3(uvA, uTime * 0.14));
    nA += snoise(vec3(uvA * 0.55 + vec2(3.7, 8.2), uTime * 0.08)) * 0.42;
    float fieldA = clamp(nA * 0.38 + 0.5, 0.0, 1.0);

    float contourVal = fieldA * 5.5;
    float distToLine = abs(fract(contourVal) - 0.5);
    float df = fwidth(contourVal);
    float lineAlpha = clamp(1.0 - smoothstep(0.0, df * 1.35, distToLine), 0.0, 1.0);



    // -------------------------------------------------------------------------
    // 4 Distinct Preset Color Architectures
    // -------------------------------------------------------------------------
    vec3 baseColor;
    vec3 petalColor;
    vec3 lineColor;
    vec3 bloomColor;
    float bloomStrength;
    float lineMult;

    if (uPreset == 0) {
      // 0: Arctic Snow White / Nordic Minimalist (خلفية ثلجية مع خطوط توبوغرافية سماوية واضحة)
      baseColor     = vec3(0.975, 0.985, 0.995); // #f8fafc pristine snow white
      petalColor    = vec3(0.910, 0.950, 0.985); // #e8f2fa subtle ice petal depth
      lineColor     = vec3(0.050, 0.580, 0.900); // #0d94e6 crisp sky-blue topographic contour lines
      bloomColor    = vec3(0.120, 0.700, 0.950); // soft cyan ambient glow
      bloomStrength = 0.12;
      lineMult      = 0.85; // Enable clear topographic contour lines
    } else if (uPreset == 1) {
      // 1: Cyberpunk Glacier (نمط داكن عالي التباين بإضاءات نيون ثلجية حادة)
      baseColor     = vec3(0.012, 0.028, 0.055); // #03070e deep cyber dark void
      petalColor    = vec3(0.020, 0.048, 0.095); // #050c18
      lineColor     = vec3(0.000, 0.940, 1.000); // #00f0ff razor sharp electric neon cyan
      bloomColor    = vec3(0.000, 0.880, 1.000); // intense neon cyber bloom
      bloomStrength = 0.30;
      lineMult      = 0.90;
    } else if (uPreset == 2) {
      // 2: Frosted Sterling Ice (النمط الثلجي الفضي الهادئ)
      baseColor     = vec3(0.047, 0.071, 0.118); // #0c121e matches background seamlessly
      petalColor    = vec3(0.082, 0.122, 0.196); // #151f32
      lineColor     = vec3(0.741, 0.831, 0.937); // #bdd4ef sterling ice
      bloomColor    = vec3(0.480, 0.580, 0.750);
      bloomStrength = 0.12;
      lineMult      = 0.75;
    } else if (uPreset == 3) {
      // 3: High-Contrast Blizzard Dark (خلفية مظلمة باردة مع أزرق كهربائي ثلجي متوهج)
      baseColor     = vec3(0.008, 0.018, 0.038); // #02050a pitch cold dark blizzard abyss
      petalColor    = vec3(0.014, 0.032, 0.065); // #030810
      lineColor     = vec3(0.000, 0.820, 1.000); // #00d2ff vivid electric blizzard blue
      bloomColor    = vec3(0.000, 0.720, 1.000); // electric ice cyan bloom
      bloomStrength = 0.28;
      lineMult      = 0.90;
    } else {
      // 4: Aurora Borealis (دمج تدرجات الشفق القطبي بين الأزرق الجليدي والتركواز ولمسات خضراء باردة)
      baseColor     = vec3(0.018, 0.062, 0.090); // #051017 deep polar abyss
      petalColor    = vec3(0.028, 0.095, 0.130); // #071821
      lineColor     = vec3(0.133, 0.827, 0.720); // #22d3b8 vibrant turquoise / mint
      bloomColor    = vec3(0.080, 0.840, 0.600); // #15d699 luminous emerald turquoise aurora bloom
      bloomStrength = 0.24;
      lineMult      = 0.85;
    }

    vec3 col = baseColor;
    vec2 bloomCenter = vec2(0.35 * uAspect, 0.50);
    float bloomDist = length(aspectUV - bloomCenter);
    float glacialGlow = exp(-bloomDist * (uPreset == 0 ? 1.8 : 1.6)) * bloomStrength;
    col += bloomColor * glacialGlow;
    col = mix(col, lineColor, clamp(lineAlpha * lineMult * uLineMult, 0.0, 1.0));

    gl_FragColor = vec4(col, 1.0);
  }
`;
