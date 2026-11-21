import * as THREE from 'three';

function roundedRect(width: number, height: number, r: number) {
  const shape = new THREE.Shape();
  const x = width / 2, y = height / 2;
  shape.moveTo(-x + r, -y);
  shape.lineTo(x - r, -y);
  shape.quadraticCurveTo(x, -y, x, -y + r);
  shape.lineTo(x, y - r);
  shape.quadraticCurveTo(x, y, x - r, y);
  shape.lineTo(-x + r, y);
  shape.quadraticCurveTo(-x, y, -x, y - r);
  shape.lineTo(-x, -y + r);
  shape.quadraticCurveTo(-x, -y, -x + r, -y);
  shape.closePath();
  return shape;
}

/** A tile of rounded pebbles on the molded elastomer, shared by all holders. */
function createHolderGrain() {
  const size = 128;
  const cells = 16;
  const data = new Uint8Array(size * size);
  let seed = 0x51a7c93d;
  const next = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const points = Array.from({ length: cells * cells }, () => ({
    x: 0.18 + next() * 0.64,
    y: 0.18 + next() * 0.64,
    height: 0.8 + next() * 0.2,
  }));
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = (x + 0.5) * cells / size;
      const v = (y + 0.5) * cells / size;
      const cellX = Math.floor(u);
      const cellY = Math.floor(v);
      let nearest = Infinity;
      let second = Infinity;
      let height = 1;
      for (let dy = -1; dy <= 1; dy++) {
        const py = cellY + dy;
        for (let dx = -1; dx <= 1; dx++) {
          const px = cellX + dx;
          const point = points[((py + cells) % cells) * cells + (px + cells) % cells];
          const offsetX = u - (px + point.x);
          const offsetY = v - (py + point.y);
          const distance = offsetX * offsetX + offsetY * offsetY;
          if (distance < nearest) {
            second = nearest;
            nearest = distance;
            height = point.height;
          } else if (distance < second) {
            second = distance;
          }
        }
      }
      const ridge = THREE.MathUtils.smoothstep(second - nearest, 0.02, 0.42);
      const dome = 1 - 0.38 * THREE.MathUtils.smoothstep(nearest, 0, 0.6);
      data[y * size + x] = Math.round((0.2 + 0.8 * ridge * dome * height) * 255);
    }
  }
  const tex = new THREE.DataTexture(data, size, size, THREE.RedFormat);
  tex.colorSpace = THREE.NoColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.magFilter = THREE.LinearFilter;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.generateMipmaps = true;
  tex.needsUpdate = true;
  return tex;
}

/**
 * Builds a sleek Coin Pocket C-clamp silhouette in CCW winding matching the
 * ergonomic slim-spine caliper profile (coin center at (0,0), spine on -X,
 * open semicircular mouth on +X).
 */
function coinPocketShape(innerRadius: number) {
  const s = new THREE.Shape();
  const spineX = -0.80;
  const halfH = 0.675;
  const outerR = 0.14;
  const tipReach = 0.26;

  // Compute exact tangent join between rounded jaw tips and inner circular cradle.
  const arcMeetX = THREE.MathUtils.clamp(innerRadius * 0.28, 0.12, 0.18);
  const arcMeetY = Math.sqrt(Math.max(0.01, innerRadius * innerRadius - arcMeetX * arcMeetX));
  const tipR = Math.max(0.05, (halfH - arcMeetY) / 2);
  const tipCenterX = tipReach - tipR;
  const arcAngle = Math.atan2(arcMeetY, arcMeetX);

  s.moveTo(spineX + outerR, -halfH);
  s.lineTo(tipCenterX, -halfH);
  s.absarc(tipCenterX, -halfH + tipR, tipR, -Math.PI / 2, Math.PI / 2, false);
  if (Math.abs(arcMeetX - tipCenterX) > 1e-4) {
    s.lineTo(arcMeetX, -arcMeetY);
  }
  s.absarc(0, 0, innerRadius, 2 * Math.PI - arcAngle, arcAngle, true);
  if (Math.abs(arcMeetX - tipCenterX) > 1e-4) {
    s.lineTo(tipCenterX, arcMeetY);
  }
  s.absarc(tipCenterX, halfH - tipR, tipR, -Math.PI / 2, Math.PI / 2, false);
  s.lineTo(spineX + outerR, halfH);
  s.quadraticCurveTo(spineX, halfH, spineX, halfH - outerR);
  s.lineTo(spineX, -halfH + outerR);
  s.quadraticCurveTo(spineX, -halfH, spineX + outerR, -halfH);
  s.closePath();
  return s;
}

/**
 * Gently pillows the +Z front cap vertices of an extruded pocket face so studio
 * key & rim lights roll across the silicone body instead of reading flat.
 */
function applySoftPillow(geo: THREE.BufferGeometry, frontZThreshold: number, halfW: number, minY: number, maxY: number, lift: number) {
  const pos = geo.getAttribute('position');
  const midY = (minY + maxY) / 2;
  const halfH = Math.max(0.1, (maxY - minY) / 2);
  for (let i = 0; i < pos.count; i++) {
    const z = pos.getZ(i);
    if (z > frontZThreshold) {
      const nx = THREE.MathUtils.clamp(pos.getX(i) / halfW, -1, 1);
      const ny = THREE.MathUtils.clamp((pos.getY(i) - midY) / halfH, -1, 1);
      const dome = Math.max(0, 1 - nx * nx * 0.72 - ny * ny * 0.55);
      pos.setZ(i, z + dome * lift);
    }
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
}

export interface CoinPocketAnchor {
  readonly matrix: THREE.Matrix4;
  /** Upright coin orientation aligned to the pocket plane (never upside down). */
  readonly coinQuaternion: THREE.Quaternion;
  readonly position: THREE.Vector3;
  /** Unit direction in holder-root space pointing outward through the open C-mouth. */
  readonly slideDir: THREE.Vector3;
}

/**
 * Procedural 3D Snowy holders for #chapter-five:
 * - Center: portrait molded card sleeve with twin upper tabs and asymmetric S-wave cutout.
 * - Left & right: two separate C-clamp Coin Pocket holders (instanced) cradling Bitcoin & PayPal.
 * All pockets are true 3D cavities using standard depth occlusion (no clipping planes).
 */
export function createPricingHolders() {
  const root = new THREE.Group();
  root.name = 'Snowy payment holders';

  const geometries: THREE.BufferGeometry[] = [];
  const materials: THREE.Material[] = [];
  const textures: THREE.Texture[] = [];
  const batches: THREE.InstancedMesh[] = [];

  const grain = createHolderGrain();
  textures.push(grain);

  // Deep glacial-slate soft-touch elastomer (distinct from #00101f bg & #46515d card).
  const elastomer = new THREE.MeshPhysicalMaterial({
    color: 0x172d41,
    metalness: 0.05,
    roughness: 0.56,
    ior: 1.41,
    sheen: 0.36,
    sheenRoughness: 0.6,
    sheenColor: new THREE.Color(0x7ec0dc),
    envMapIntensity: 0.94,
    bumpMap: grain,
    bumpScale: 0.078,
  });
  // Slightly deeper matte polymer for recessed sleeve backplate & U-wall core.
  const elastomerCore = new THREE.MeshPhysicalMaterial({
    color: 0x0f1f2f,
    metalness: 0.05,
    roughness: 0.68,
    ior: 1.38,
    sheen: 0.25,
    sheenRoughness: 0.68,
    sheenColor: new THREE.Color(0x5d99b8),
    envMapIntensity: 0.82,
    bumpMap: grain,
    bumpScale: 0.061,
  });
  // Use the same height data for tonal variation so the grain remains visible
  // on the front faces under soft light, without allocating a color map.
  const shadeGrain: THREE.MeshPhysicalMaterial['onBeforeCompile'] = (shader) => {
    shader.fragmentShader = shader.fragmentShader.replace('#include <color_fragment>', `
      #include <color_fragment>
      float grainHeight = texture2D(bumpMap, vBumpMapUv).r;
      diffuseColor.rgb *= mix(0.60, 1.22, grainHeight);
    `);
  };
  elastomer.onBeforeCompile = shadeGrain;
  elastomerCore.onBeforeCompile = shadeGrain;
  // Velvet-matte dark cavity liner inside the card pocket.
  const liner = new THREE.MeshStandardMaterial({
    color: 0x06101a,
    metalness: 0.04,
    roughness: 0.9,
    envMapIntensity: 0.32,
  });
  // Subtle machined icy-steel accent trim catching studio softbox highlights.
  const machinedTrim = new THREE.MeshStandardMaterial({
    color: 0x769db8,
    metalness: 0.78,
    roughness: 0.25,
    envMapIntensity: 1.1,
  });
  // Satin steel crystal inlay on the card sleeve front.
  const emblemMat = new THREE.MeshStandardMaterial({
    color: 0x8fb9cd,
    metalness: 0.54,
    roughness: 0.34,
    envMapIntensity: 0.9,
  });
  materials.push(elastomer, elastomerCore, liner, machinedTrim, emblemMat);

  function extrude(
    shape: THREE.Shape,
    depth: number,
    bevelSize: number,
    bevelThickness = bevelSize,
    curveSegments = 22,
    bevelSegments = 4,
  ) {
    const g = new THREE.ExtrudeGeometry(shape, {
      depth,
      bevelEnabled: bevelSize > 0,
      bevelSegments,
      bevelSize,
      bevelThickness,
      curveSegments,
      steps: 1,
    });
    geometries.push(g);
    return g;
  }

  // ---------------------------------------------------------------------------
  // 1. CENTRAL PORTRAIT CARD SLEEVE
  // Card docked scale = 0.72 -> width 1.944, height 3.060, centered at (0, +0.06, 0).
  // Card Z envelope: body [-0.042, +0.042], raised EMV chip up to +0.065.
  // ---------------------------------------------------------------------------
  const sleeveGroup = new THREE.Group();
  sleeveGroup.name = 'Snowy card sleeve';
  root.add(sleeveGroup);

  const halfW = 1.15;
  const bottomY = -1.65;
  const earTopY = 1.44;
  const earInnerX = 0.80;
  const notchY = 1.06;
  const botR = 0.24;
  const earR = 0.06;

  // 1a. Backplate with signature twin upper side ears & center cutout (CCW)
  const backShape = new THREE.Shape();
  backShape.moveTo(-halfW + botR, bottomY);
  backShape.lineTo(halfW - botR, bottomY);
  backShape.quadraticCurveTo(halfW, bottomY, halfW, bottomY + botR);
  backShape.lineTo(halfW, earTopY - earR);
  backShape.quadraticCurveTo(halfW, earTopY, halfW - earR, earTopY);
  backShape.lineTo(earInnerX + earR, earTopY);
  backShape.quadraticCurveTo(earInnerX, earTopY, earInnerX, earTopY - earR);
  backShape.lineTo(earInnerX, notchY + 0.08);
  backShape.quadraticCurveTo(earInnerX, notchY, earInnerX - 0.08, notchY);
  backShape.lineTo(-earInnerX + 0.08, notchY);
  backShape.quadraticCurveTo(-earInnerX, notchY, -earInnerX, notchY + 0.08);
  backShape.lineTo(-earInnerX, earTopY - earR);
  backShape.quadraticCurveTo(-earInnerX, earTopY, -earInnerX - earR, earTopY);
  backShape.lineTo(-halfW + earR, earTopY);
  backShape.quadraticCurveTo(-halfW, earTopY, -halfW, earTopY - earR);
  backShape.lineTo(-halfW, bottomY + botR);
  backShape.quadraticCurveTo(-halfW, bottomY, -halfW + botR, bottomY);
  backShape.closePath();

  const backMesh = new THREE.Mesh(extrude(backShape, 0.06, 0.018, 0.018, 22, 4), elastomerCore);
  backMesh.position.z = -0.165;
  sleeveGroup.add(backMesh);

  // Dark inner cavity liner on inside of backplate (z = -0.081).
  const linerGeo = new THREE.ShapeGeometry(roundedRect(2.02, 2.64, 0.14), 16);
  geometries.push(linerGeo);
  const linerMesh = new THREE.Mesh(linerGeo, liner);
  linerMesh.position.set(0, -0.22, -0.081);
  sleeveGroup.add(linerMesh);

  // 1b. Perimeter U-wall forming left/bottom/right pocket rails (hole-free CCW)
  const inX = 1.015;
  const inBotY = -1.51;
  const inR = 0.12;
  const railTopY = 1.40;
  const uWall = new THREE.Shape();
  uWall.moveTo(-halfW + botR, bottomY);
  uWall.lineTo(halfW - botR, bottomY);
  uWall.quadraticCurveTo(halfW, bottomY, halfW, bottomY + botR);
  uWall.lineTo(halfW, railTopY - 0.04);
  uWall.quadraticCurveTo(halfW, railTopY, halfW - 0.04, railTopY);
  uWall.lineTo(inX + 0.04, railTopY);
  uWall.quadraticCurveTo(inX, railTopY, inX, railTopY - 0.04);
  uWall.lineTo(inX, inBotY + inR);
  uWall.quadraticCurveTo(inX, inBotY, inX - inR, inBotY);
  uWall.lineTo(-inX + inR, inBotY);
  uWall.quadraticCurveTo(-inX, inBotY, -inX, inBotY + inR);
  uWall.lineTo(-inX, railTopY - 0.04);
  uWall.quadraticCurveTo(-inX, railTopY, -inX - 0.04, railTopY);
  uWall.lineTo(-halfW + 0.04, railTopY);
  uWall.quadraticCurveTo(-halfW, railTopY, -halfW, railTopY - 0.04);
  uWall.lineTo(-halfW, bottomY + botR);
  uWall.quadraticCurveTo(-halfW, bottomY, -halfW + botR, bottomY);
  uWall.closePath();

  const uWallMesh = new THREE.Mesh(extrude(uWall, 0.20, 0.012, 0.012, 18, 3), elastomerCore);
  uWallMesh.position.z = -0.095;
  sleeveGroup.add(uWallMesh);

  // 1c. Signature Wavy Front Pocket Wall (CCW):
  // Asymmetric S-wave dipping cleanly below the raised gold EMV chip on the left
  // and sweeping gracefully upward toward the right.
  const waveY = (t: number) => {
    const x = THREE.MathUtils.lerp(-halfW, halfW, t);
    const valley = -0.21 * Math.exp(-(((t - 0.24) / 0.24) ** 2));
    const crest = 0.21 * Math.exp(-(((t - 0.76) / 0.26) ** 2));
    return { x, y: 0.50 + valley + crest };
  };

  const frontShape = new THREE.Shape();
  frontShape.moveTo(-halfW + botR, bottomY);
  frontShape.lineTo(halfW - botR, bottomY);
  frontShape.quadraticCurveTo(halfW, bottomY, halfW, bottomY + botR);
  const rightWave = waveY(1);
  frontShape.lineTo(halfW, rightWave.y - 0.05);
  frontShape.quadraticCurveTo(halfW, rightWave.y, halfW - 0.05, rightWave.y);
  const waveSamples = 44;
  for (let i = waveSamples - 1; i >= 1; i--) {
    const pt = waveY(i / waveSamples);
    frontShape.lineTo(pt.x, pt.y);
  }
  const leftWave = waveY(0);
  frontShape.lineTo(-halfW + 0.05, leftWave.y);
  frontShape.quadraticCurveTo(-halfW, leftWave.y, -halfW, leftWave.y - 0.05);
  frontShape.lineTo(-halfW, bottomY + botR);
  frontShape.quadraticCurveTo(-halfW, bottomY, -halfW + botR, bottomY);
  frontShape.closePath();

  const frontGeo = extrude(frontShape, 0.068, 0.022, 0.022, 22, 5);
  applySoftPillow(frontGeo, 0.075, halfW, bottomY, 0.72, 0.024);
  const frontMesh = new THREE.Mesh(frontGeo, elastomer);
  // Inner face sits at 0.108 - 0.022 = +0.086 (0.021 clearance ahead of EMV chip at +0.065).
  frontMesh.position.z = 0.108;
  sleeveGroup.add(frontMesh);

  // 1d. Sleek machined icy-steel contour ribbon following the wavy pocket lip
  const waveStrip = new THREE.Shape();
  const stripInsetX = 0.095;
  const stripOffsetY = 0.072;
  const stripThickness = 0.021;
  const stripSamples = 38;
  for (let i = 0; i <= stripSamples; i++) {
    const t = THREE.MathUtils.lerp(stripInsetX / (halfW * 2), 1 - stripInsetX / (halfW * 2), i / stripSamples);
    const pt = waveY(t);
    if (i === 0) waveStrip.moveTo(pt.x, pt.y - stripOffsetY);
    else waveStrip.lineTo(pt.x, pt.y - stripOffsetY);
  }
  for (let i = stripSamples; i >= 0; i--) {
    const t = THREE.MathUtils.lerp(stripInsetX / (halfW * 2), 1 - stripInsetX / (halfW * 2), i / stripSamples);
    const pt = waveY(t);
    waveStrip.lineTo(pt.x, pt.y - stripOffsetY - stripThickness);
  }
  waveStrip.closePath();
  const waveTrimGeo = extrude(waveStrip, 0.008, 0.004, 0.004, 8, 2);
  applySoftPillow(waveTrimGeo, -0.01, halfW, bottomY, 0.72, 0.024);
  const waveTrimMesh = new THREE.Mesh(waveTrimGeo, machinedTrim);
  waveTrimMesh.position.z = 0.197;
  sleeveGroup.add(waveTrimMesh);

  // 1e. Subtle molded perimeter flange (lower U-contour) echoing tactile silicone seam
  const seamOut = halfW - 0.085;
  const seamBot = bottomY + 0.085;
  const seamW = 0.020;
  const seamTopL = leftWave.y - 0.135;
  const seamTopR = rightWave.y - 0.135;
  const seamR = 0.16;
  const seamShape = new THREE.Shape();
  seamShape.moveTo(-seamOut + seamR, seamBot);
  seamShape.lineTo(seamOut - seamR, seamBot);
  seamShape.quadraticCurveTo(seamOut, seamBot, seamOut, seamBot + seamR);
  seamShape.lineTo(seamOut, seamTopR);
  seamShape.lineTo(seamOut - seamW, seamTopR);
  seamShape.lineTo(seamOut - seamW, seamBot + seamR);
  seamShape.quadraticCurveTo(seamOut - seamW, seamBot + seamW, seamOut - seamR, seamBot + seamW);
  seamShape.lineTo(-seamOut + seamR, seamBot + seamW);
  seamShape.quadraticCurveTo(-seamOut + seamW, seamBot + seamW, -seamOut + seamW, seamBot + seamR);
  seamShape.lineTo(-seamOut + seamW, seamTopL);
  seamShape.lineTo(-seamOut, seamTopL);
  seamShape.lineTo(-seamOut, seamBot + seamR);
  seamShape.quadraticCurveTo(-seamOut, seamBot, -seamOut + seamR, seamBot);
  seamShape.closePath();
  const seamGeo = extrude(seamShape, 0.006, 0.003, 0.003, 14, 2);
  applySoftPillow(seamGeo, -0.01, halfW, bottomY, 0.72, 0.024);
  const seamMesh = new THREE.Mesh(seamGeo, elastomerCore);
  seamMesh.position.z = 0.196;
  sleeveGroup.add(seamMesh);

  // Cut the six branches as a single beveled inlay.
  const flake = new THREE.Shape();
  const branch = [
    [-.018, .049], [-.018, .098], [-.067, .132], [-.060, .154],
    [-.018, .127], [-.018, .161], [-.056, .186], [-.049, .207],
    [-.018, .190], [-.018, .223], [0, .247], [.018, .223],
    [.018, .190], [.049, .207], [.056, .186], [.018, .161],
    [.018, .127], [.060, .154], [.067, .132], [.018, .098], [.018, .049],
  ];
  for (let index = 0; index < 6; index++) {
    const angle = -index * Math.PI / 3;
    const cos = Math.cos(angle), sin = Math.sin(angle);
    branch.forEach(([x, y], point) => {
      const px = x * cos - y * sin, py = x * sin + y * cos;
      if (index === 0 && point === 0) flake.moveTo(px, py);
      else flake.lineTo(px, py);
    });
  }
  flake.closePath();
  const crystal = new THREE.Mesh(extrude(flake, .008, .003, .003, 8, 2), emblemMat);
  crystal.position.set(0, -.56, .219);
  sleeveGroup.add(crystal);

  // ---------------------------------------------------------------------------
  // 2. TWO SEPARATE C-CLAMP COIN POCKET HOLDERS (shared InstancedMesh, count = 2)
  // Docked coin scale = 0.86 -> outer radius 0.533, half-thickness 0.063.
  // Core inner radius = 0.548 (0.015 radial clearance); sleek retaining lips = 0.508
  // gripping only the outer beveled rim shoulder so the full coin face shines cleanly.
  // ---------------------------------------------------------------------------
  const coinCoreGeo = extrude(coinPocketShape(0.548), 0.144, 0.008, 0.008, 32, 3);
  coinCoreGeo.translate(0, 0, -0.072);

  const coinLipGeo = extrude(coinPocketShape(0.508), 0.038, 0.014, 0.014, 32, 4);
  const spineTrimGeo = extrude(roundedRect(0.044, 0.86, 0.020), 0.007, 0.003, 0.003, 12, 2);

  // Two distinct anchors flanking the central card sleeve (positive-determinant rotations only).
  // Index 0: Left pocket (Bitcoin) — open mouth faces outward-left-up; coin stays upright.
  // Index 1: Right pocket (PayPal) — open mouth faces outward-right-up; coin stays upright.
  const pocketConfigs = [
    {
      pos: new THREE.Vector3(-2.14, -0.28, 0.18),
      pocketEuler: new THREE.Euler(0.05, 0.18, Math.PI - 0.22, 'YXZ'),
      coinEuler: new THREE.Euler(0.05, 0.18, -0.12, 'YXZ'),
    },
    {
      pos: new THREE.Vector3(2.14, 0.28, 0.18),
      pocketEuler: new THREE.Euler(-0.05, -0.18, 0.22, 'YXZ'),
      coinEuler: new THREE.Euler(-0.05, -0.18, 0.12, 'YXZ'),
    },
  ] as const;

  const coinAnchors: CoinPocketAnchor[] = pocketConfigs.map(({ pos, pocketEuler, coinEuler }) => {
    const pocketQuat = new THREE.Quaternion().setFromEuler(pocketEuler);
    const coinQuaternion = new THREE.Quaternion().setFromEuler(coinEuler);
    const matrix = new THREE.Matrix4().compose(pos, pocketQuat, new THREE.Vector3(1, 1, 1));
    const slideDir = new THREE.Vector3(1, 0, 0).applyQuaternion(pocketQuat).normalize();
    return { matrix, coinQuaternion, position: pos.clone(), slideDir };
  });

  // Share each base geometry via InstancedMesh (no cloned VBOs for front/back pairs).
  const coreInst = new THREE.InstancedMesh(coinCoreGeo, elastomerCore, 2);
  coreInst.setMatrixAt(0, coinAnchors[0].matrix);
  coreInst.setMatrixAt(1, coinAnchors[1].matrix);
  coreInst.instanceMatrix.needsUpdate = true;
  batches.push(coreInst);
  root.add(coreInst);

  const offset = new THREE.Matrix4();
  const composed = new THREE.Matrix4();
  const addFrontBackPair = (
    geo: THREE.BufferGeometry,
    mat: THREE.Material,
    x: number,
    frontZ: number,
    backZ: number,
  ) => {
    const inst = new THREE.InstancedMesh(geo, mat, 4);
    let idx = 0;
    for (const anchor of coinAnchors) {
      for (const z of [frontZ, backZ]) {
        composed.multiplyMatrices(anchor.matrix, offset.makeTranslation(x, 0, z));
        inst.setMatrixAt(idx++, composed);
      }
    }
    inst.instanceMatrix.needsUpdate = true;
    batches.push(inst);
    root.add(inst);
  };
  // Retaining lips: front inner face at +0.070 (> coin +0.063), back inner face at -0.070.
  addFrontBackPair(coinLipGeo, elastomer, 0, 0.084, -0.122);
  // Spine trim bars on front and back faces of each Coin Pocket spine.
  addFrontBackPair(spineTrimGeo, machinedTrim, -0.675, 0.135, -0.142);

  return {
    root,
    cardAnchor: {
      seatedY: 0.06,
      entryY: 2.28,
      scale: 0.72,
    },
    coinAnchors,
    coinScale: 0.86,
    dispose() {
      root.removeFromParent();
      batches.forEach((b) => b.dispose());
      geometries.forEach((g) => g.dispose());
      materials.forEach((mat) => mat.dispose());
      textures.forEach((t) => t.dispose());
    },
  };
}
