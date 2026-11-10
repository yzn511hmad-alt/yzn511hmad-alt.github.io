/**
 * TOPOGRAPHIC & ORGANIC BACKGROUND SHADER (GLSL)
 * Snowy Studios (getsnowy.net)
 *
 * Layer A: Topographic Contour Lines (1px Anti-Aliased procedurally generated elevation lines)
 * Layer B: Floating Organic Glacial Aurora Blobs (Damped mouse tilt/morph + Lenis scroll parallax & velocity stretch)
 * Dual-Theme: Seamless interpolation between Dark (Midnight Navy + Cyan/Indigo) & Light (Glacial White-Blue + Slate/Frost)
 */

export const TopoVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

export const TopoFragmentShader = `
  precision highp float;

  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec2 uMouse;
  uniform float uScroll;
  uniform float uVelocity;
  uniform float uTheme; // 0.0 = dark mode, 1.0 = light mode

  varying vec2 vUv;

  // -------------------------------------------------------------------------
  // 2D Simplex Noise
  // -------------------------------------------------------------------------
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

  float snoise(vec2 v) {
    const vec4 C = vec4(
      0.211324865405187,  // (3.0-sqrt(3.0))/6.0
      0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
     -0.577350269189626,  // -1.0 + 2.0 * C.x
      0.024390243902439   // 1.0 / 41.0
    );
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
    m = m * m;
    m = m * m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
    vec3 g;
    g.x  = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  // Multi-octave FBM for smooth terrain elevation
  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.52;
    mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);
    for (int i = 0; i < 3; i++) {
      v += a * snoise(p);
      p = rot * p * 2.04 + vec2(11.3, 5.7);
      a *= 0.5;
    }
    return v;
  }

  void main() {
    // Aspect-ratio normalized coordinates centered at 0,0
    vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);
    vec2 p = (vUv - 0.5) * aspect;

    // -----------------------------------------------------------------------
    // Layer A: Topographic Elevation Contour Lines
    // -----------------------------------------------------------------------
    // Subtle mouse tilt + calm time drift (uTime * 0.04) + Lenis scroll phase shift
    vec2 mouseShift = (uMouse - 0.5) * 0.07;
    vec2 topoUV = p * 1.65 + vec2(uTime * 0.04, -uScroll * 0.00035) + mouseShift;

    float elevation = fbm(topoUV) * 0.5 + 0.5; // [0, 1]

    // 16 crisp contour levels across elevation spectrum
    float levels = 16.0;
    float contourVal = elevation * levels;
    float distFromLine = abs(fract(contourVal - 0.5) - 0.5);

    // fwidth provides resolution-independent, crisp 1px anti-aliased line stroke
    float filterW = max(fwidth(contourVal) * 1.15, 0.015);
    float lineMask = 1.0 - smoothstep(0.0, filterW, distFromLine);

    // -----------------------------------------------------------------------
    // Layer B: Floating Organic Shapes (Glacial Aurora Blobs / Petals)
    // -----------------------------------------------------------------------
    // Velocity-based vertical elongation/stretch during active scrolling
    float velStretch = 1.0 + clamp(abs(uVelocity) * 0.0012, 0.0, 0.45);

    // Shape 1: Cyan Petal (Top-Left Drift, Parallax Depth 0.35)
    vec2 c1 = vec2(-0.42 * aspect.x + sin(uTime * 0.14) * 0.12, 0.28 + cos(uTime * 0.18) * 0.09);
    c1.y += uScroll * 0.00022;
    c1 += (uMouse - 0.5) * 0.12;
    vec2 d1 = p - c1;
    d1.y /= velStretch;
    float a1 = uTime * 0.1 + (uMouse.x - 0.5) * 0.35;
    vec2 rot1 = vec2(d1.x * cos(a1) - d1.y * sin(a1), d1.x * sin(a1) + d1.y * cos(a1));
    float th1 = atan(rot1.y, rot1.x);
    float r1 = 0.40 * (1.0 + 0.20 * sin(3.0 * th1 + uTime * 0.28) + 0.12 * cos(2.0 * th1));
    float blob1 = pow(smoothstep(r1, 0.0, length(rot1)), 1.5);

    // Shape 2: Sky-Blue Aurora Blob (Right-Center Drift, Parallax Depth 0.70)
    vec2 c2 = vec2(0.38 * aspect.x + cos(uTime * 0.11) * 0.11, -0.12 + sin(uTime * 0.15) * 0.10);
    c2.y += uScroll * 0.00045;
    c2 += (uMouse - 0.5) * 0.18;
    vec2 d2 = p - c2;
    d2.y /= velStretch;
    float a2 = -uTime * 0.08 - (uMouse.y - 0.5) * 0.4;
    vec2 rot2 = vec2(d2.x * cos(a2) - d2.y * sin(a2), d2.x * sin(a2) + d2.y * cos(a2));
    float th2 = atan(rot2.y, rot2.x);
    float r2 = 0.48 * (1.0 + 0.18 * sin(4.0 * th2 - uTime * 0.22) + 0.14 * cos(th2));
    float blob2 = pow(smoothstep(r2, 0.0, length(rot2)), 1.7);

    // Shape 3: Soft Indigo Aurora Blob (Bottom-Left Drift, Parallax Depth 0.95)
    vec2 c3 = vec2(-0.25 * aspect.x + sin(uTime * 0.16 + 2.0) * 0.13, -0.38 + cos(uTime * 0.12) * 0.09);
    c3.y += uScroll * 0.00065;
    c3 += (uMouse - 0.5) * 0.24;
    vec2 d3 = p - c3;
    d3.y /= velStretch;
    float a3 = uTime * 0.11 + (uMouse.x - 0.5) * 0.45;
    vec2 rot3 = vec2(d3.x * cos(a3) - d3.y * sin(a3), d3.x * sin(a3) + d3.y * cos(a3));
    float th3 = atan(rot3.y, rot3.x);
    float r3 = 0.44 * (1.0 + 0.22 * sin(2.0 * th3 + uTime * 0.3) + 0.10 * cos(5.0 * th3));
    float blob3 = pow(smoothstep(r3, 0.0, length(rot3)), 1.6);

    // Shape 4: Frost Teal Petal (Top-Right Drift, Parallax Depth 0.48)
    vec2 c4 = vec2(0.26 * aspect.x + cos(uTime * 0.13 + 1.4) * 0.12, 0.36 + sin(uTime * 0.19) * 0.08);
    c4.y += uScroll * 0.0003;
    c4 += (uMouse - 0.5) * 0.15;
    vec2 d4 = p - c4;
    d4.y /= velStretch;
    float a4 = uTime * 0.08;
    vec2 rot4 = vec2(d4.x * cos(a4) - d4.y * sin(a4), d4.x * sin(a4) + d4.y * cos(a4));
    float th4 = atan(rot4.y, rot4.x);
    float r4 = 0.36 * (1.0 + 0.20 * sin(3.0 * th4 - uTime * 0.25) + 0.12 * cos(2.0 * th4));
    float blob4 = pow(smoothstep(r4, 0.0, length(rot4)), 1.6);

    // -----------------------------------------------------------------------
    // Dual-Theme Color Palette & Smooth Blending
    // -----------------------------------------------------------------------
    // Base Background:
    // Dark: Deep midnight navy (#060b14 to #0a1324)
    vec3 darkBase = mix(vec3(0.024, 0.043, 0.078), vec3(0.039, 0.075, 0.141), vUv.y);
    // Light: Crisp glacial white-blue (#f0f8ff to #e2f1ff)
    vec3 lightBase = mix(vec3(0.941, 0.973, 1.0), vec3(0.886, 0.945, 1.0), vUv.y);
    vec3 baseBg = mix(darkBase, lightBase, uTheme);

    // Topographic Lines:
    // Dark: Subtle glacial silver (#c8daf0) @ 0.09
    // Light: Soft slate-cyan (#0ea5e9) @ 0.14
    vec3 darkLine = vec3(0.78, 0.85, 0.94);
    vec3 lightLine = vec3(0.055, 0.647, 0.914);
    vec3 lineColor = mix(darkLine, lightLine, uTheme);
    float lineAlpha = mix(0.09, 0.14, uTheme);

    vec3 composite = mix(baseBg, lineColor, lineMask * lineAlpha);

    // Floating Organic Shapes:
    // Shape 1 (Cyan)
    vec3 b1Col = mix(vec3(0.16, 0.71, 0.96), vec3(0.22, 0.74, 0.97), uTheme);
    float b1Alpha = mix(0.07, 0.14, uTheme) * blob1;

    // Shape 2 (Sky-Blue / Frost)
    vec3 b2Col = mix(vec3(0.22, 0.74, 0.97), vec3(0.729, 0.902, 0.992), uTheme);
    float b2Alpha = mix(0.05, 0.32, uTheme) * blob2;

    // Shape 3 (Indigo Aurora)
    vec3 b3Col = mix(vec3(0.388, 0.400, 0.945), vec3(0.486, 0.361, 1.0), uTheme);
    float b3Alpha = mix(0.05, 0.10, uTheme) * blob3;

    // Shape 4 (Frost Teal)
    vec3 b4Col = mix(vec3(0.16, 0.71, 0.96), vec3(0.22, 0.74, 0.97), uTheme);
    float b4Alpha = mix(0.06, 0.15, uTheme) * blob4;

    if (uTheme < 0.5) {
      // Dark Mode: soft translucent additive auras preserving 100% text readability
      composite += b1Col * b1Alpha + b2Col * b2Alpha + b3Col * b3Alpha + b4Col * b4Alpha;
    } else {
      // Light Mode: delicate watercolor frost tinting
      composite = mix(composite, b1Col, b1Alpha);
      composite = mix(composite, b2Col, b2Alpha);
      composite = mix(composite, b3Col, b3Alpha);
      composite = mix(composite, b4Col, b4Alpha);
    }

    gl_FragColor = vec4(composite, 1.0);
  }
`;
