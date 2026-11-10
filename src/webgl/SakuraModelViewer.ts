/**
 * SNOWY HUB 3D MODEL VIEWER
 * Section 02 — Interactive 3D viewer locked to Section 02 right column.
 * Snowy Studios (getsnowy.net)
 *
 * ─── Architecture & Model ───────────────────────────────────────────────────
 *   Asset: /assets/snowy_hub.glb (Scene 4: "Snowy Hub · WEB · auto_farm")
 *   Meshes:
 *     - "Main housing" (PBR graphite chassis)
 *     - "Main UI" (Retina 1536x1536 CanvasTexture — Snowy Hub GUI)
 *     - "Sidebar housing" (Floating left graphite pill chassis)
 *     - "Sidebar UI" (Dynamic 768x768 CanvasTexture — category icons & active pill)
 *
 * ─── Standard Script Hub Terminology ────────────────────────────────────────
 *   - App Title & Subtitle: "Snowy Hub" / "Universal Script"
 *   - Sidebar Categories: "Main", "Combat", "Visuals", "Misc/Settings", "Server Hop", "Profile"
 *   - Active Tab Header: "Main Settings"
 *   - Interactive Rows:
 *       1. "Auto Farm" (Toggle ON)
 *       2. "Auto Collect" (Toggle ON)
 *       3. "Player ESP" (Toggle ON)
 *       4. "Anti-AFK" (Toggle ON)
 *       5. "WalkSpeed Override" (Slider set to 50)
 *       6. "Save Config" (Action button)
 */

import * as THREE from 'three';
import { SharedSurface } from './SharedRenderer';
import { QualityTier } from '../core/QualityTier';
import { onFrame } from '../core/FrameLoop';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';

export type HubTab =
  | 'main'
  | 'combat'
  | 'visuals'
  | 'movement'
  | 'serverhop'
  | 'configs'
  | 'profile'
  | 'misc'
  | 'settings'
  | 'vault'
  | 'stealth'
  | 'domination';

export class SakuraModelViewer {
  private container: HTMLElement | null = null;

  private scene!: THREE.Scene;
  private camera!: THREE.OrthographicCamera;
  private renderer!: SharedSurface;
  private unsubscribe?: () => void;
  private lastFrame = -Infinity;
  private stillSignature = "";
  private events = new AbortController();
  private gpuNormal?: THREE.Texture;
  private dracoLoader: DRACOLoader | null = null;
  private ktx2Loader: KTX2Loader | null = null;

  // Scene hierarchy: scene -> tiltGroup -> baseGroup -> glTF scene 4
  private tiltGroup!: THREE.Group;
  private baseGroup!: THREE.Group;
  private sidebarGroup!: THREE.Group;
  private modelCenter = new THREE.Vector3();

  // Meshes
  private screenMesh: THREE.Mesh | null = null;
  private sidebarMesh: THREE.Mesh | null = null;
  private mainHousingMesh: THREE.Mesh | null = null;
  private sidebarHousingMesh: THREE.Mesh | null = null;

  // Materials
  private graphiteHousingMat!: THREE.MeshStandardMaterial;
  private rimEdgeMat!: THREE.MeshStandardMaterial;

  // Mouse interaction
  private mouseX = 0;
  private mouseY = 0;
  private targetMouseX = 0;
  private targetMouseY = 0;
  private isHovered = false;
  private hoverSpread = 0;

  // RAF / visibility
  private isVisible = true;
  private intersectionObserver: IntersectionObserver | null = null;
  private resizeObserver: ResizeObserver | null = null;

  // Dynamic 2D Canvas Textures
  private screenTexture: THREE.CanvasTexture | null = null;
  private screenCanvas: HTMLCanvasElement | null = null;
  private sidebarTexture: THREE.CanvasTexture | null = null;
  private sidebarCanvas: HTMLCanvasElement | null = null;

  // Interaction & State
  private isCopiedState = false;
  private copyResetTimeout: ReturnType<typeof setTimeout> | null = null;
  private saveConfigTimeout: ReturnType<typeof setTimeout> | null = null;
  private hopTimeout: ReturnType<typeof setTimeout> | null = null;

  private activeTab: HubTab = 'main';
  private raycaster = new THREE.Raycaster();
  private pointerVec = new THREE.Vector2();

  // Tab 1 (Main Settings - User Requested Items)
  private autoFarmToggle = true;      // Auto Farm (ON)
  private autoCollectToggle = true;   // Auto Collect (ON)
  private espToggle = true;           // Player ESP (ON)
  private antiAfkToggle = true;       // Anti-AFK (ON)
  private walkSpeedVal = 50;          // WalkSpeed Override (50)
  private isConfigSaved = false;      // Save Config feedback

  // Tab 2 (Combat Settings - Sliders Icon)
  private silentAimToggle = true;
  private autoTriggerToggle = false;
  private hitboxIdx = 0;              // ['Head', 'Upper Torso', 'HumanoidRootPart']
  private aimSmoothnessVal = 85;
  private fovVal = 120;

  // Tab 3 (Visuals & ESP - Eye Icon)
  private boxEspToggle = true;
  private tracersToggle = true;
  private nameplatesToggle = true;
  private chamsToggle = true;
  private renderDistanceVal = 80;

  // Tab 4 (Movement & Misc - Lightning Bolt Icon ⚡)
  private infiniteJumpToggle = true;
  private noclipToggle = false;
  private flyModeToggle = false;
  private flySpeedVal = 60;
  private gravityVal = 50;

  // Tab 5 (Server Hop - Globe Icon 🌐 - Cleaned of simulator game terms)
  private autoHopToggle = false;
  private avoidFullToggle = true;
  private regionIdx = 0;              // ['Lowest Ping', 'North America', 'Europe', 'Asia']
  private playerThresholdIdx = 0;     // ['5+ Players', '10+ Players', 'Any Server']
  private hopDelayVal = 15;
  private isHopping = false;

  // Tab 6 (Config Manager - Checkmark Icon ✓)
  private autoLoadToggle = true;
  private cloudSyncToggle = true;
  private configProfileIdx = 0;       // ['Default Legit', 'Rage / Speed', 'Farming Profile']
  private autoBackupToggle = true;
  private configSlotVal = 1;

  // Tab 7 (User Profile - Avatar Icon 👤)
  private vipActive = true;
  private discordAlertsToggle = false;
  private streamproofToggle = true;
  private themeIdx = 0;               // ['Indigo Royale', 'Frost Ice', 'Carbon Dark']
  private uiOpacityVal = 95;

  // Floating HUD Callout Coupling
  private activeDockCard = 1;
  private dockTiltX = -0.05;
  private targetDockTiltX = -0.05;
  private dockSpread = 0;
  private targetDockSpread = 0;

  public onPillChanged?: (pillIndex: number) => void;
  public onModuleChanged?: (moduleIndex: number) => void;
  public onDockCardChanged?: (card: number) => void;

  // Camera & Framing Tuning
  private readonly CAMERA_FOV = 36;
  private readonly REQUIRED_WORLD_WIDTH = 13.2;
  private readonly REQUIRED_WORLD_HEIGHT = 11.4;

  // Static locked transform (perfect 2D flat frontal framing in Section 02 right column)
  private readonly STATIC_SCALE = 1.00;
  private readonly BASE_ROT_X = 0.00;
  private readonly BASE_ROT_Y = 0.00;
  private readonly BASE_ROT_Z = 0.00;

  private readonly codeSnippet =
    'loadstring(game:HttpGet("https://raw.githubusercontent.com/0x1s2s/Snowy-Ui-Library/3c23cf0671556d29d588d483498f34e32659c00e/SnowyUi"))()';

  // ────────────────────────────────────────────────────────────────────────────
  // Constructor
  // ────────────────────────────────────────────────────────────────────────────
  private typographyDisposed = false;

  constructor(containerId: string, _copyButtonId: string) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    // 1. Three.js Scene
    this.scene = new THREE.Scene();

    // 2. Orthographic 2D Camera with zero perspective distortion
    const w = this.container.clientWidth || 640;
    const h = this.container.clientHeight || 640;
    const aspect = w / h;
    const requiredW = this.REQUIRED_WORLD_WIDTH;
    const requiredH = this.REQUIRED_WORLD_HEIGHT;
    let left: number, right: number, top: number, bottom: number;
    if (aspect >= requiredW / requiredH) {
      const halfH = requiredH / 2;
      top = halfH;
      bottom = -halfH;
      right = halfH * aspect;
      left = -halfH * aspect;
    } else {
      const halfW = requiredW / 2;
      right = halfW;
      left = -halfW;
      top = halfW / aspect;
      bottom = -halfW / aspect;
    }
    this.camera = new THREE.OrthographicCamera(left, right, top, bottom, 0.1, 100);
    this.camera.position.set(0, 0, 20);
    this.camera.lookAt(0, 0, 0);

    // 3. WebGL Renderer
    this.renderer = new SharedSurface();
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(QualityTier.getDPR());
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.container.appendChild(this.renderer.domElement);

    // 4. Hierarchy Setup
    this.baseGroup = new THREE.Group();
    this.tiltGroup = new THREE.Group();
    this.sidebarGroup = new THREE.Group();
    this.baseGroup.add(this.sidebarGroup);
    this.tiltGroup.add(this.baseGroup);
    this.scene.add(this.tiltGroup);

    // Align baseGroup: +Y local faces camera (+Z world)
    this.baseGroup.rotation.x = Math.PI / 2;

    // Static locked scale & centered position from frame 1 in 2D
    this.tiltGroup.rotation.set(0, 0, 0);
    this.tiltGroup.scale.setScalar(this.STATIC_SCALE);
    this.tiltGroup.position.set(0, 0, 0);

    // 5. Lighting
    this.setupLighting();

    // 6. Load GLB Model
    this.loadModel();

    // 7. Interactive Events
    this.initEvents();

    // Canvas labels need repainting once the shared webfont is available.
    Promise.all([400, 500, 600, 700].map(weight =>
      document.fonts.load(weight + ' 22px "IBM Plex Sans"')
    )).then(() => {
      if (this.typographyDisposed) return;
      if (this.screenCanvas) {
        this.drawScreenUI(false);
        if (this.screenTexture) this.screenTexture.needsUpdate = true;
      }
      if (this.sidebarTexture) {
        this.drawSidebarUI();
        this.sidebarTexture.needsUpdate = true;
      }
    }).catch(() => { /* Keep the browser fallback if the font cannot load. */ });

    // 8. Start Loop
    this.unsubscribe = onFrame(this.update);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Studio Lighting
  // ────────────────────────────────────────────────────────────────────────────
  private setupLighting(): void {
    // Clean, uniform 2D studio illumination without dark perspective falloff
    this.scene.add(new THREE.AmbientLight(0xffffff, 1.20));

    const frontKey = new THREE.DirectionalLight(0xffffff, 0.80);
    frontKey.position.set(0, 2, 10);
    this.scene.add(frontKey);

    const rim = new THREE.DirectionalLight(0x60a5fa, 0.40);
    rim.position.set(5, -2, 5);
    this.scene.add(rim);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Canvas Texture Generators
  // ────────────────────────────────────────────────────────────────────────────
  private createSnowyScreenTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 1536 * QualityTier.getTextureScale();
    canvas.height = 1536 * QualityTier.getTextureScale();
    this.screenCanvas = canvas;

    this.drawScreenUI(false);

    const tex = new THREE.CanvasTexture(canvas);
    tex.flipY = false;
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    this.screenTexture = tex;
    return tex;
  }

  private createSnowySidebarTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 768 * QualityTier.getTextureScale();
    canvas.height = 768 * QualityTier.getTextureScale();
    this.sidebarCanvas = canvas;

    this.drawSidebarUI();

    const tex = new THREE.CanvasTexture(canvas);
    tex.flipY = false;
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    this.sidebarTexture = tex;
    return tex;
  }

  // ────────────────────────────────────────────────────────────────────────────
  // GUI Canvas Drawing: Floating Left Sidebar (768 x 768)
  // Icons representing: Main, Combat, Visuals, Misc/Settings, Server Hop, Profile
  // ────────────────────────────────────────────────────────────────────────────
  // ────────────────────────────────────────────────────────────────────────────
  // GUI Canvas Drawing: Floating Left Sidebar (768 x 768)
  // 7 Distinct Interactive Tabs Matching Snowy UI Library
  // 1. Grid (Main)  2. Sliders (Combat)  3. Eye (Visuals)  4. Lightning (Movement ⚡)
  // 5. Globe (Server Hop 🌐)  6. Checkmark (Configs ✓)  7. Profile (Avatar 👤)
  // ────────────────────────────────────────────────────────────────────────────
  private drawSidebarUI(): void {
    const canvas = this.sidebarCanvas;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.setTransform(canvas.width / 768, 0, 0, canvas.height / 768, 0, 0);
    ctx.clearRect(0, 0, 768, 768);

    // Full vertical pill enclosure: span exact UV range (y = 4 to 764, w = 156, radius = 78)
    const pillX = 306, pillY = 4, pillW = 156, pillH = 760;
    ctx.beginPath();
    ctx.roundRect(pillX, pillY, pillW, pillH, 78);
    ctx.fillStyle = '#0c0e14';
    ctx.fill();

    ctx.strokeStyle = 'rgba(210, 225, 248, 0.08)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    const cx = 384;

    const isTab1 = this.activeTab === 'main' || this.activeTab === 'settings' || this.activeTab === 'vault';
    const isTab2 = this.activeTab === 'combat' || this.activeTab === 'stealth';
    const isTab3 = this.activeTab === 'visuals' || this.activeTab === 'domination';
    const isTab4 = this.activeTab === 'movement' || this.activeTab === 'misc';
    const isTab5 = this.activeTab === 'serverhop';
    const isTab6 = this.activeTab === 'configs';
    const isTab7 = this.activeTab === 'profile';

    // 1. Tab 1: Main Settings (Grid icon ⊞) at cy = 78
    if (isTab1) {
      this.drawActiveIndicator(ctx, pillX, 78);
      this.drawGridIcon(ctx, cx, 78, '#ffffff', 1.15);
    } else {
      this.drawGridIcon(ctx, cx, 78, '#646c84', 1.05);
    }

    // 2. Tab 2: Combat Settings (Sliders icon 🎚️) at cy = 176
    if (isTab2) {
      this.drawActiveIndicator(ctx, pillX, 176);
      this.drawSettingsIcon(ctx, cx, 176, '#ffffff');
    } else {
      this.drawSettingsIcon(ctx, cx, 176, '#646c84');
    }

    // 3. Tab 3: Visuals & ESP (Eye icon 👁️) at cy = 274
    if (isTab3) {
      this.drawActiveIndicator(ctx, pillX, 274);
      this.drawEyeIcon(ctx, cx, 274, '#ffffff');
    } else {
      this.drawEyeIcon(ctx, cx, 274, '#646c84');
    }

    // 4. Tab 4: Movement & Misc (Lightning bolt icon ⚡) at cy = 372
    if (isTab4) {
      this.drawActiveIndicator(ctx, pillX, 372);
      this.drawLightningIcon(ctx, cx, 372, '#ffffff', 1.15);
    } else {
      this.drawLightningIcon(ctx, cx, 372, '#646c84', 1.05);
    }

    // 5. Tab 5: Server Hop (Globe icon 🌐) at cy = 470
    if (isTab5) {
      this.drawActiveIndicator(ctx, pillX, 470);
      this.drawGlobeIcon(ctx, cx, 470, '#ffffff');
    } else {
      this.drawGlobeIcon(ctx, cx, 470, '#646c84');
    }

    // 6. Tab 6: Config Manager (Checkmark icon ✓) at cy = 568
    if (isTab6) {
      this.drawActiveIndicator(ctx, pillX, 568);
      this.drawCheckmarkIcon(ctx, cx, 568, '#ffffff', 1.15);
    } else {
      this.drawCheckmarkIcon(ctx, cx, 568, '#646c84', 1.05);
    }

    // 7. Subtle Divider (y = 626)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(336, 626);
    ctx.lineTo(432, 626);
    ctx.stroke();

    // 8. Tab 7: User Profile Avatar (cy = 684) - Perfectly concentric with bottom curve
    ctx.beginPath();
    ctx.arc(cx, 684, 32, 0, Math.PI * 2);
    ctx.fillStyle = isTab7 ? '#152238' : '#0f111c';
    ctx.fill();
    ctx.strokeStyle = isTab7 ? '#ffffff' : '#3b82f6';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    if (isTab7) {
      ctx.beginPath();
      ctx.roundRect(pillX + 6, 684 - 22, 6, 44, 3);
      ctx.fillStyle = '#3b82f6';
      ctx.fill();
    }

    this.drawProfileIcon(ctx, cx, 684, isTab7 ? '#ffffff' : '#3b82f6', 0.85);
  }

  private drawActiveIndicator(ctx: CanvasRenderingContext2D, pillX: number, cy: number): void {
    // Frost Blue rounded container (74px tall, 120px wide, fits gracefully inside circular caps)
    ctx.beginPath();
    ctx.roundRect(pillX + 18, cy - 37, 120, 74, 22);
    ctx.fillStyle = '#152238';
    ctx.fill();
    ctx.strokeStyle = 'rgba(96, 165, 250, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Left active indicator vertical accent pill
    ctx.beginPath();
    ctx.roundRect(pillX + 6, cy - 22, 6, 44, 3);
    ctx.fillStyle = '#3b82f6';
    ctx.fill();
  }

  private drawLightningIcon(ctx: CanvasRenderingContext2D, cx: number, cy: number, color: string, scale = 1): void {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(cx + 2 * scale, cy - 18 * scale);
    ctx.lineTo(cx - 11 * scale, cy + 1 * scale);
    ctx.lineTo(cx - 1 * scale, cy + 1 * scale);
    ctx.lineTo(cx - 4 * scale, cy + 18 * scale);
    ctx.lineTo(cx + 11 * scale, cy - 1 * scale);
    ctx.lineTo(cx + 1 * scale, cy - 1 * scale);
    ctx.closePath();
    ctx.fill();
  }

  private drawCheckmarkIcon(ctx: CanvasRenderingContext2D, cx: number, cy: number, color: string, scale = 1): void {
    ctx.strokeStyle = color;
    ctx.lineWidth = 3.2 * scale;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(cx - 11 * scale, cy);
    ctx.lineTo(cx - 3 * scale, cy + 8 * scale);
    ctx.lineTo(cx + 12 * scale, cy - 8 * scale);
    ctx.stroke();
  }

  // ────────────────────────────────────────────────────────────────────────────
  // GUI Canvas Drawing: Main Display Screen (1536 x 1536)
  // Clean Script Hub Terminology
  // ────────────────────────────────────────────────────────────────────────────
  private drawScreenUI(copied: boolean): void {
    const canvas = this.screenCanvas;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 1536, H = 1536;
    ctx.setTransform(canvas.width / W, 0, 0, canvas.height / H, 0, 0);

    // ── 1. Seamless Full-Bleed Dark Navy Background ──
    // Fill full canvas so 3D mesh geometry provides 100% smooth, anti-aliased natural curved corners
    ctx.fillStyle = '#0c0e14';
    ctx.fillRect(0, 0, W, H);

    // High-precision inner hairline rim accent (smooth 48px corner radius)
    ctx.beginPath();
    ctx.roundRect(14, 14, W - 28, H - 28, 48);
    ctx.strokeStyle = 'rgba(210, 225, 248, 0.08)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // ── 2. Top Header Bar (y = 60 to 180) ──
    const logoX = 72, logoY = 72, logoSize = 112;
    ctx.beginPath();
    ctx.roundRect(logoX, logoY, logoSize, logoSize, 30);
    ctx.fillStyle = '#121422';
    ctx.fill();
    ctx.strokeStyle = 'rgba(91, 95, 219, 0.35)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Hexagon Logo
    this.drawHexagon(ctx, logoX + logoSize / 2, logoY + logoSize / 2, 28, '#787df6');

    // App Title & Subtitle: "Snowy Hub" / "Universal Script"
    ctx.font = '700 40px "IBM Plex Sans", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText('Snowy Hub', 214, 122);

    ctx.font = '500 22px "IBM Plex Sans", sans-serif';
    ctx.fillStyle = '#6f7793';
    ctx.fillText('Universal Script', 214, 162);

    // Close Button (Circle with X)
    const closeX = 1420, closeY = 128, closeR = 36;
    ctx.beginPath();
    ctx.arc(closeX, closeY, closeR, 0, Math.PI * 2);
    ctx.fillStyle = '#141624';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.strokeStyle = '#8d94ab';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(closeX - 11, closeY - 11);
    ctx.lineTo(closeX + 11, closeY + 11);
    ctx.moveTo(closeX + 11, closeY - 11);
    ctx.lineTo(closeX - 11, closeY + 11);
    ctx.stroke();

    // ── 3. Sub-Header: Active Module Badge ──
    const catBadgeX = 265, catBadgeY = 226, catBadgeSize = 96;
    ctx.beginPath();
    ctx.roundRect(catBadgeX, catBadgeY, catBadgeSize, catBadgeSize, 26);
    ctx.fillStyle = '#2b2f63';
    ctx.fill();
    ctx.strokeStyle = 'rgba(91, 95, 219, 0.45)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    const isTab1 = this.activeTab === 'main' || this.activeTab === 'settings' || this.activeTab === 'vault';
    const isTab2 = this.activeTab === 'combat' || this.activeTab === 'stealth';
    const isTab3 = this.activeTab === 'visuals' || this.activeTab === 'domination';
    const isTab4 = this.activeTab === 'movement' || this.activeTab === 'misc';
    const isTab5 = this.activeTab === 'serverhop';
    const isTab6 = this.activeTab === 'configs';
    const isTab7 = this.activeTab === 'profile';

    if (isTab1) {
      // Tab 1: Main Settings (Grid ⊞)
      this.drawGridIcon(ctx, catBadgeX + catBadgeSize / 2, catBadgeY + catBadgeSize / 2, '#ffffff', 1.25);

      ctx.font = '700 38px "IBM Plex Sans", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('Main Settings', 390, 272);

      ctx.font = '500 22px "IBM Plex Sans", sans-serif';
      ctx.fillStyle = '#6f7793';
      ctx.fillText('General gameplay & automation', 390, 312);

      ctx.font = '700 28px "IBM Plex Sans", sans-serif';
      ctx.fillStyle = '#e2e8f4';
      ctx.fillText('Core features', 265, 428);

    } else if (isTab2) {
      // Tab 2: Combat Settings (Sliders 🎚️)
      this.drawSettingsIcon(ctx, catBadgeX + catBadgeSize / 2, catBadgeY + catBadgeSize / 2, '#ffffff');

      ctx.font = '700 38px "IBM Plex Sans", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('Combat Settings', 390, 272);

      ctx.font = '500 22px "IBM Plex Sans", sans-serif';
      ctx.fillStyle = '#6f7793';
      ctx.fillText('Targeting & weapon assists', 390, 312);

      ctx.font = '700 28px "IBM Plex Sans", sans-serif';
      ctx.fillStyle = '#e2e8f4';
      ctx.fillText('Combat options', 265, 428);

    } else if (isTab3) {
      // Tab 3: Visuals & ESP (Eye 👁️)
      this.drawEyeIcon(ctx, catBadgeX + catBadgeSize / 2, catBadgeY + catBadgeSize / 2, '#ffffff');

      ctx.font = '700 38px "IBM Plex Sans", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('Visuals & ESP', 390, 272);

      ctx.font = '500 22px "IBM Plex Sans", sans-serif';
      ctx.fillStyle = '#6f7793';
      ctx.fillText('Player & item overlays', 390, 312);

      ctx.font = '700 28px "IBM Plex Sans", sans-serif';
      ctx.fillStyle = '#e2e8f4';
      ctx.fillText('Visual options', 265, 428);

    } else if (isTab4) {
      // Tab 4: Movement & Misc (Lightning Bolt ⚡)
      this.drawLightningIcon(ctx, catBadgeX + catBadgeSize / 2, catBadgeY + catBadgeSize / 2, '#ffffff', 1.25);

      ctx.font = '700 38px "IBM Plex Sans", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('Movement & Misc', 390, 272);

      ctx.font = '500 22px "IBM Plex Sans", sans-serif';
      ctx.fillStyle = '#6f7793';
      ctx.fillText('Physics & utility bypasses', 390, 312);

      ctx.font = '700 28px "IBM Plex Sans", sans-serif';
      ctx.fillStyle = '#e2e8f4';
      ctx.fillText('Player physics', 265, 428);

    } else if (isTab5) {
      // Tab 5: Server Hop (Globe 🌐) — Cleaned of simulator game terms
      this.drawGlobeIcon(ctx, catBadgeX + catBadgeSize / 2, catBadgeY + catBadgeSize / 2, '#ffffff');

      ctx.font = '700 38px "IBM Plex Sans", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('Server Hop', 390, 272);

      ctx.font = '500 22px "IBM Plex Sans", sans-serif';
      ctx.fillStyle = '#6f7793';
      ctx.fillText('Server switching & matchmaking', 390, 312);

      ctx.font = '700 28px "IBM Plex Sans", sans-serif';
      ctx.fillStyle = '#e2e8f4';
      ctx.fillText('Server settings', 265, 428);

    } else if (isTab6) {
      // Tab 6: Config Manager (Checkmark ✓)
      this.drawCheckmarkIcon(ctx, catBadgeX + catBadgeSize / 2, catBadgeY + catBadgeSize / 2, '#ffffff', 1.25);

      ctx.font = '700 38px "IBM Plex Sans", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('Config Manager', 390, 272);

      ctx.font = '500 22px "IBM Plex Sans", sans-serif';
      ctx.fillStyle = '#6f7793';
      ctx.fillText('Profile presets & auto-load', 390, 312);

      ctx.font = '700 28px "IBM Plex Sans", sans-serif';
      ctx.fillStyle = '#e2e8f4';
      ctx.fillText('Configuration slots', 265, 428);

    } else if (isTab7) {
      // Tab 7: User Profile (Avatar 👤)
      this.drawProfileIcon(ctx, catBadgeX + catBadgeSize / 2, catBadgeY + catBadgeSize / 2, '#ffffff', 1.15);

      ctx.font = '700 38px "IBM Plex Sans", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('User Profile', 390, 272);

      ctx.font = '500 22px "IBM Plex Sans", sans-serif';
      ctx.fillStyle = '#6f7793';
      ctx.fillText('Snowy VIP account & preferences', 390, 312);

      ctx.font = '700 28px "IBM Plex Sans", sans-serif';
      ctx.fillStyle = '#e2e8f4';
      ctx.fillText('License & telemetry', 265, 428);
    }

    // ── 4. Main Settings Card Container (w = 1006, h = 860) ──
    const cardX = 265, cardY = 466, cardW = 1006, cardH = 860;
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardW, cardH, 32);
    ctx.fillStyle = '#10131d';
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.055)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    const rowH = 138;

    // Divider lines between rows (1 to 4)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    for (let i = 1; i <= 4; i++) {
      ctx.beginPath();
      ctx.moveTo(cardX + 36, cardY + i * rowH);
      ctx.lineTo(cardX + cardW - 36, cardY + i * rowH);
      ctx.stroke();
    }

    if (isTab1) {
      // ════════════ MAIN SETTINGS TAB (Exact User Requirement) ════════════
      // Row 1: Auto Farm (Toggle ON)
      this.drawRowTitleWithInfo(ctx, cardX + 40, cardY + rowH * 0 + 69, 'Auto Farm');
      this.drawToggleSwitch(ctx, cardX + cardW - 136, cardY + rowH * 0 + 45, this.autoFarmToggle);

      // Row 2: Auto Collect (Toggle ON)
      this.drawRowTitleWithInfo(ctx, cardX + 40, cardY + rowH * 1 + 69, 'Auto Collect');
      this.drawToggleSwitch(ctx, cardX + cardW - 136, cardY + rowH * 1 + 45, this.autoCollectToggle);

      // Row 3: Player ESP (Toggle ON)
      this.drawRowTitleWithInfo(ctx, cardX + 40, cardY + rowH * 2 + 69, 'Player ESP');
      this.drawToggleSwitch(ctx, cardX + cardW - 136, cardY + rowH * 2 + 45, this.espToggle);

      // Row 4: Anti-AFK (Toggle ON)
      this.drawRowTitleWithInfo(ctx, cardX + 40, cardY + rowH * 3 + 69, 'Anti-AFK');
      this.drawToggleSwitch(ctx, cardX + cardW - 136, cardY + rowH * 3 + 45, this.antiAfkToggle);

      // Row 5: WalkSpeed Override (Slider set to 50)
      this.drawRowTitleWithInfo(ctx, cardX + 40, cardY + rowH * 4 + 69, 'WalkSpeed Override');
      this.drawSlider(ctx, cardX + cardW - 360, cardY + rowH * 4 + 62, 320, String(this.walkSpeedVal), (this.walkSpeedVal - 16) / 84);

      // Row 6: Save Config (Action button)
      this.drawSaveConfigButton(ctx, cardX + 40, cardY + rowH * 5 + 32, cardW - 80, 68);

    } else if (isTab2) {
      // ════════════ COMBAT SETTINGS TAB ════════════
      this.drawRowTitleWithInfo(ctx, cardX + 40, cardY + rowH * 0 + 69, 'Aimbot Enabled');
      this.drawToggleSwitch(ctx, cardX + cardW - 136, cardY + rowH * 0 + 45, this.silentAimToggle);

      this.drawRowTitleWithInfo(ctx, cardX + 40, cardY + rowH * 1 + 69, 'Auto Trigger');
      this.drawToggleSwitch(ctx, cardX + cardW - 136, cardY + rowH * 1 + 45, this.autoTriggerToggle);

      const hitboxes = ['Head', 'Upper Torso', 'HumanoidRootPart'];
      this.drawRowTitleWithInfo(ctx, cardX + 40, cardY + rowH * 2 + 69, 'Target Hitbox');
      this.drawDropdown(ctx, cardX + cardW - 380, cardY + rowH * 2 + 37, 340, 58, hitboxes[this.hitboxIdx]);

      this.drawRowTitleWithInfo(ctx, cardX + 40, cardY + rowH * 3 + 69, 'Aim Smoothness');
      this.drawSlider(ctx, cardX + cardW - 360, cardY + rowH * 3 + 62, 320, `${this.aimSmoothnessVal}%`, this.aimSmoothnessVal / 100);

      this.drawRowTitleWithInfo(ctx, cardX + 40, cardY + rowH * 4 + 69, 'Field of View (FOV)');
      this.drawSlider(ctx, cardX + cardW - 360, cardY + rowH * 4 + 62, 320, `${this.fovVal}px`, this.fovVal / 200);

      this.drawSaveConfigButton(ctx, cardX + 40, cardY + rowH * 5 + 32, cardW - 80, 68);

    } else if (isTab3) {
      // ════════════ VISUALS & ESP TAB ════════════
      this.drawRowTitleWithInfo(ctx, cardX + 40, cardY + rowH * 0 + 69, 'Box ESP (2D/3D)');
      this.drawToggleSwitch(ctx, cardX + cardW - 136, cardY + rowH * 0 + 45, this.boxEspToggle);

      this.drawRowTitleWithInfo(ctx, cardX + 40, cardY + rowH * 1 + 69, 'Player Tracers');
      this.drawToggleSwitch(ctx, cardX + cardW - 136, cardY + rowH * 1 + 45, this.tracersToggle);

      this.drawRowTitleWithInfo(ctx, cardX + 40, cardY + rowH * 2 + 69, 'Nameplates & Health');
      this.drawToggleSwitch(ctx, cardX + cardW - 136, cardY + rowH * 2 + 45, this.nameplatesToggle);

      this.drawRowTitleWithInfo(ctx, cardX + 40, cardY + rowH * 3 + 69, 'Chams Glow & Outline');
      this.drawToggleSwitch(ctx, cardX + cardW - 136, cardY + rowH * 3 + 45, this.chamsToggle);

      this.drawRowTitleWithInfo(ctx, cardX + 40, cardY + rowH * 4 + 69, 'ESP Distance');
      this.drawSlider(ctx, cardX + cardW - 360, cardY + rowH * 4 + 62, 320, `${this.renderDistanceVal * 10}m`, this.renderDistanceVal / 100);

      this.drawSaveConfigButton(ctx, cardX + 40, cardY + rowH * 5 + 32, cardW - 80, 68);

    } else if (isTab4) {
      // ════════════ MOVEMENT & MISC (⚡ Lightning Tab) ════════════
      this.drawRowTitleWithInfo(ctx, cardX + 40, cardY + rowH * 0 + 69, 'Infinite Jump');
      this.drawToggleSwitch(ctx, cardX + cardW - 136, cardY + rowH * 0 + 45, this.infiniteJumpToggle);

      this.drawRowTitleWithInfo(ctx, cardX + 40, cardY + rowH * 1 + 69, 'NoClip Walls');
      this.drawToggleSwitch(ctx, cardX + cardW - 136, cardY + rowH * 1 + 45, this.noclipToggle);

      this.drawRowTitleWithInfo(ctx, cardX + 40, cardY + rowH * 2 + 69, 'Fly Mode Toggle');
      this.drawToggleSwitch(ctx, cardX + cardW - 136, cardY + rowH * 2 + 45, this.flyModeToggle);

      this.drawRowTitleWithInfo(ctx, cardX + 40, cardY + rowH * 3 + 69, 'Fly Speed');
      this.drawSlider(ctx, cardX + cardW - 360, cardY + rowH * 3 + 62, 320, String(this.flySpeedVal), this.flySpeedVal / 100);

      this.drawRowTitleWithInfo(ctx, cardX + 40, cardY + rowH * 4 + 69, 'Gravity Multiplier');
      this.drawSlider(ctx, cardX + cardW - 360, cardY + rowH * 4 + 62, 320, `${this.gravityVal}%`, this.gravityVal / 100);

      this.drawSaveConfigButton(ctx, cardX + 40, cardY + rowH * 5 + 32, cardW - 80, 68);

    } else if (isTab5) {
      // ════════════ SERVER HOP TAB (Clean Standard Script Hub) ════════════
      this.drawRowTitleWithInfo(ctx, cardX + 40, cardY + rowH * 0 + 69, 'Auto Server Hop');
      this.drawToggleSwitch(ctx, cardX + cardW - 136, cardY + rowH * 0 + 45, this.autoHopToggle);

      this.drawRowTitleWithInfo(ctx, cardX + 40, cardY + rowH * 1 + 69, 'Avoid Full Servers');
      this.drawToggleSwitch(ctx, cardX + cardW - 136, cardY + rowH * 1 + 45, this.avoidFullToggle);

      const regions = ['Lowest Ping', 'North America', 'Europe', 'Asia'];
      this.drawRowTitleWithInfo(ctx, cardX + 40, cardY + rowH * 2 + 69, 'Preferred Region');
      this.drawDropdown(ctx, cardX + cardW - 380, cardY + rowH * 2 + 37, 340, 58, regions[this.regionIdx]);

      const thresholds = ['Min 5 Players', 'Min 10 Players', 'Any Server'];
      this.drawRowTitleWithInfo(ctx, cardX + 40, cardY + rowH * 3 + 69, 'Player Threshold');
      this.drawDropdown(ctx, cardX + cardW - 380, cardY + rowH * 3 + 37, 340, 58, thresholds[this.playerThresholdIdx]);

      this.drawRowTitleWithInfo(ctx, cardX + 40, cardY + rowH * 4 + 69, 'Hop Delay');
      this.drawSlider(ctx, cardX + cardW - 360, cardY + rowH * 4 + 62, 320, `${this.hopDelayVal}s`, this.hopDelayVal / 60);

      // Row 6: Hop now + Action Button
      this.drawRowTitleWithInfo(ctx, cardX + 40, cardY + rowH * 5 + 69, 'Hop now');
      const runW = 240, runH = 60;
      const runX = cardX + cardW - runW - 40;
      const runY = cardY + rowH * 5 + 36;
      ctx.beginPath();
      ctx.roundRect(runX, runY, runW, runH, 16);
      if (this.isHopping) {
        ctx.fillStyle = '#173628';
        ctx.fill();
        ctx.strokeStyle = '#34d399';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.font = '700 22px "IBM Plex Sans", sans-serif';
        ctx.fillStyle = '#34d399';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('✓ Hopping...', runX + runW / 2, runY + runH / 2);
      } else {
        ctx.fillStyle = '#3b82f6';
        ctx.fill();
        ctx.strokeStyle = 'rgba(96, 165, 250, 0.40)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.font = '700 22px "IBM Plex Sans", sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🚀  Hop Server', runX + runW / 2, runY + runH / 2);
      }

    } else if (isTab6) {
      // ════════════ CONFIG MANAGER (✓ Checkmark Tab) ════════════
      this.drawRowTitleWithInfo(ctx, cardX + 40, cardY + rowH * 0 + 69, 'Auto Load Config');
      this.drawToggleSwitch(ctx, cardX + cardW - 136, cardY + rowH * 0 + 45, this.autoLoadToggle);

      this.drawRowTitleWithInfo(ctx, cardX + 40, cardY + rowH * 1 + 69, 'Cloud Sync Profiles');
      this.drawToggleSwitch(ctx, cardX + cardW - 136, cardY + rowH * 1 + 45, this.cloudSyncToggle);

      const presets = ['Default Legit', 'Rage / Speed', 'Farming Profile'];
      this.drawRowTitleWithInfo(ctx, cardX + 40, cardY + rowH * 2 + 69, 'Active Profile');
      this.drawDropdown(ctx, cardX + cardW - 380, cardY + rowH * 2 + 37, 340, 58, presets[this.configProfileIdx]);

      this.drawRowTitleWithInfo(ctx, cardX + 40, cardY + rowH * 3 + 69, 'Auto Backup on Exit');
      this.drawToggleSwitch(ctx, cardX + cardW - 136, cardY + rowH * 3 + 45, this.autoBackupToggle);

      this.drawRowTitleWithInfo(ctx, cardX + 40, cardY + rowH * 4 + 69, 'Config Slot');
      this.drawSlider(ctx, cardX + cardW - 360, cardY + rowH * 4 + 62, 320, `Slot ${this.configSlotVal}`, this.configSlotVal / 5);

      this.drawSaveConfigButton(ctx, cardX + 40, cardY + rowH * 5 + 32, cardW - 80, 68);

    } else if (isTab7) {
      // ════════════ USER PROFILE (👤 Avatar Tab) ════════════
      this.drawRowTitleWithInfo(ctx, cardX + 40, cardY + rowH * 0 + 69, 'Status: Active VIP Lifetime');
      this.drawToggleSwitch(ctx, cardX + cardW - 136, cardY + rowH * 0 + 45, this.vipActive);

      this.drawRowTitleWithInfo(ctx, cardX + 40, cardY + rowH * 1 + 69, 'Discord Webhook Alerts');
      this.drawToggleSwitch(ctx, cardX + cardW - 136, cardY + rowH * 1 + 45, this.discordAlertsToggle);

      this.drawRowTitleWithInfo(ctx, cardX + 40, cardY + rowH * 2 + 69, 'Streamproof Stealth');
      this.drawToggleSwitch(ctx, cardX + cardW - 136, cardY + rowH * 2 + 45, this.streamproofToggle);

      const themes = ['Indigo Royale', 'Frost Ice', 'Carbon Dark'];
      this.drawRowTitleWithInfo(ctx, cardX + 40, cardY + rowH * 3 + 69, 'UI Theme Accent');
      this.drawDropdown(ctx, cardX + cardW - 380, cardY + rowH * 3 + 37, 340, 58, themes[this.themeIdx]);

      this.drawRowTitleWithInfo(ctx, cardX + 40, cardY + rowH * 4 + 69, 'UI Opacity');
      this.drawSlider(ctx, cardX + cardW - 360, cardY + rowH * 4 + 62, 320, `${this.uiOpacityVal}%`, this.uiOpacityVal / 100);

      this.drawSaveConfigButton(ctx, cardX + 40, cardY + rowH * 5 + 32, cardW - 80, 68);
    }

    // ── 5. In-Screen Toast Feedback When Copied ──
    if (copied) {
      const toastW = 760, toastH = 68;
      const toastX = (W - toastW) / 2, toastY = 1380;
      ctx.beginPath();
      ctx.roundRect(toastX, toastY, toastW, toastH, 20);
      ctx.fillStyle = '#14172a';
      ctx.fill();

      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(toastX + 38, toastY + toastH / 2, 7, 0, Math.PI * 2);
      ctx.fillStyle = '#34d399';
      ctx.fill();

      ctx.font = '700 20px "IBM Plex Sans", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText('✓ SNOWY SCRIPT COPIED TO CLIPBOARD', toastX + 62, toastY + toastH / 2);
    }
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Screen Drawing Subcomponents
  // ────────────────────────────────────────────────────────────────────────────
  private drawSaveConfigButton(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): void {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 16);

    if (this.isConfigSaved) {
      ctx.fillStyle = '#173628';
      ctx.fill();
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(x + w / 2 - 120, y + h / 2, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#34d399';
      ctx.fill();

      ctx.font = '700 22px "IBM Plex Sans", sans-serif';
      ctx.fillStyle = '#34d399';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('✓ Configuration Saved Successfully', x + w / 2 + 10, y + h / 2);
    } else {
      ctx.fillStyle = '#3b82f6';
      ctx.fill();
      ctx.strokeStyle = 'rgba(96, 165, 250, 0.40)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.font = '700 22px "IBM Plex Sans", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('💾  Save Config', x + w / 2, y + h / 2);
    }
  }

  private drawRowTitleWithInfo(ctx: CanvasRenderingContext2D, x: number, y: number, title: string): void {
    ctx.font = '700 25px "IBM Plex Sans", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(title, x, y);

    const tw = ctx.measureText(title).width;
    const infoX = x + tw + 18;
    this.drawInfoIcon(ctx, infoX, y);
  }

  private drawInfoIcon(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
    ctx.beginPath();
    ctx.arc(cx, cy, 12, 0, Math.PI * 2);
    ctx.strokeStyle = '#525870';
    ctx.lineWidth = 1.8;
    ctx.stroke();

    ctx.font = '700 13px "IBM Plex Sans", sans-serif';
    ctx.fillStyle = '#6b728d';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('i', cx, cy);
  }

  private drawToggleSwitch(ctx: CanvasRenderingContext2D, x: number, y: number, isOn: boolean): void {
    const swW = 92, swH = 48, r = 24;
    ctx.beginPath();
    ctx.roundRect(x, y, swW, swH, r);
    ctx.fillStyle = isOn ? '#3b82f6' : '#232738';
    ctx.fill();

    if (isOn) {
      ctx.strokeStyle = 'rgba(96, 165, 250, 0.40)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    const knobX = isOn ? x + swW - 24 : x + 24;
    ctx.beginPath();
    ctx.arc(knobX, y + 24, 16, 0, Math.PI * 2);
    ctx.fillStyle = isOn ? '#ffffff' : '#8d94ab';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
    ctx.shadowBlur = 6;
    ctx.fill();
    ctx.shadowColor = 'transparent';
  }

  private drawDropdown(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, text: string): void {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 14);
    ctx.fillStyle = '#161926';
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.font = '600 21px "IBM Plex Sans", sans-serif';
    ctx.fillStyle = '#dce2f4';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x + 22, y + h / 2);

    // Chevron
    ctx.strokeStyle = '#858ba0';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(x + w - 30, y + h / 2 - 4);
    ctx.lineTo(x + w - 21, y + h / 2 + 5);
    ctx.lineTo(x + w - 12, y + h / 2 - 4);
    ctx.stroke();
  }

  private drawSlider(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, valStr: string, pct: number): void {
    // Value label
    ctx.font = '700 24px "IBM Plex Sans", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(valStr, x - 28, y + 5);

    // Track
    ctx.beginPath();
    ctx.roundRect(x, y, w, 10, 5);
    ctx.fillStyle = '#1c1f30';
    ctx.fill();

    // Fill
    const fillW = Math.max(0, w * Math.min(1, Math.max(0, pct)));
    if (fillW > 0) {
      ctx.beginPath();
      ctx.roundRect(x, y, fillW, 10, 5);
      ctx.fillStyle = '#3b82f6';
      ctx.fill();
    }

    // Thumb Knob
    const thumbX = x + fillW;
    ctx.beginPath();
    ctx.arc(thumbX, y + 5, 14, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.40)';
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.shadowColor = 'transparent';
  }

  private drawHexagon(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, color: string): void {
    ctx.strokeStyle = color;
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3 - Math.PI / 6;
      const hx = cx + r * Math.cos(angle);
      const hy = cy + r * Math.sin(angle);
      if (i === 0) ctx.moveTo(hx, hy);
      else ctx.lineTo(hx, hy);
    }
    ctx.closePath();
    ctx.stroke();
  }

  private drawCrosshairIcon(ctx: CanvasRenderingContext2D, cx: number, cy: number, color: string): void {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.arc(cx, cy, 10, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cx - 15, cy); ctx.lineTo(cx - 7, cy);
    ctx.moveTo(cx + 7, cy); ctx.lineTo(cx + 15, cy);
    ctx.moveTo(cx, cy - 15); ctx.lineTo(cx, cy - 7);
    ctx.moveTo(cx, cy + 7); ctx.lineTo(cx, cy + 15);
    ctx.stroke();
  }

  private drawSettingsIcon(ctx: CanvasRenderingContext2D, cx: number, cy: number, color: string): void {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(cx - 15, cy - 8); ctx.lineTo(cx + 15, cy - 8);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx - 5, cy - 8, 4, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(cx - 15, cy); ctx.lineTo(cx + 15, cy);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx + 6, cy, 4, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(cx - 15, cy + 8); ctx.lineTo(cx + 15, cy + 8);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx - 7, cy + 8, 4, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  }

  private drawEyeIcon(ctx: CanvasRenderingContext2D, cx: number, cy: number, color: string): void {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(cx - 15, cy);
    ctx.quadraticCurveTo(cx, cy - 10, cx + 15, cy);
    ctx.quadraticCurveTo(cx, cy + 10, cx - 15, cy);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  }

  private drawGridIcon(ctx: CanvasRenderingContext2D, cx: number, cy: number, color: string, scale = 1): void {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5 * scale;
    const s = 9 * scale, gap = 4 * scale;
    [-1, 1].forEach((dx) => {
      [-1, 1].forEach((dy) => {
        const rx = cx + (dx > 0 ? gap : -s - gap);
        const ry = cy + (dy > 0 ? gap : -s - gap);
        ctx.beginPath();
        ctx.roundRect(rx, ry, s, s, 2 * scale);
        ctx.stroke();
      });
    });
  }

  private drawProfileIcon(ctx: CanvasRenderingContext2D, cx: number, cy: number, color: string, scale = 1): void {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5 * scale;
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.arc(cx, cy - 6 * scale, 7 * scale, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy + 18 * scale, 14 * scale, 1.2 * Math.PI, 1.8 * Math.PI);
    ctx.stroke();
  }

  private drawGlobeIcon(ctx: CanvasRenderingContext2D, cx: number, cy: number, color: string): void {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(cx, cy, 14, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(cx, cy, 6.5, 14, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cx - 14, cy);
    ctx.lineTo(cx + 14, cy);
    ctx.stroke();
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Procedural Pure Pill / Capsule 3D Geometry
  // Eliminates rectangular GLTF artifacts, providing 100% circular semicircular caps
  // ────────────────────────────────────────────────────────────────────────────
  private buildPillGeometries(): { housingGeom: THREE.BufferGeometry; uiGeom: THREE.BufferGeometry } {
    const width = 1.38;
    const height = 6.78;
    const r = width / 2; // 0.69
    const straight = height - width; // 5.40
    const halfStraight = straight / 2; // 2.70

    // 2D Stadium / Pill Shape centered at (0, 0)
    const pillShape = new THREE.Shape();
    pillShape.moveTo(r, -halfStraight);
    // Bottom semicircular cap (from angle 0 to -PI, clockwise)
    pillShape.absarc(0, -halfStraight, r, 0, -Math.PI, true);
    // Left straight tangent
    pillShape.lineTo(-r, halfStraight);
    // Top semicircular cap (from angle PI to 0, clockwise)
    pillShape.absarc(0, halfStraight, r, Math.PI, 0, true);
    // Right straight tangent back to start
    pillShape.lineTo(r, -halfStraight);

    // 1. Housing: Extruded 3D solid with smooth chamfer bevel
    // Extrusion depth = 0.050, bevel = 0.010 -> front face ends at Y = 0.014 + 0.050 + 0.010 = 0.074
    const housingGeom = new THREE.ExtrudeGeometry(pillShape, {
      depth: 0.050,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 1,
      bevelSize: 0.012,
      bevelThickness: 0.010,
      curveSegments: 24,
    });
    housingGeom.rotateX(-Math.PI / 2);
    housingGeom.translate(-4.65, 0.014, 0.525);
    housingGeom.computeVertexNormals();

    // 2. UI Face: Flat matching pill shape sitting cleanly in front of housing face at Y = 0.084
    const uiGeom = new THREE.ShapeGeometry(pillShape, 24);
    uiGeom.rotateX(-Math.PI / 2);
    uiGeom.translate(-4.65, 0.084, 0.525);

    // Precise UV calculation mapping vertex coordinates to the sidebar canvas
    const posAttr = uiGeom.attributes.position;
    const uvAttr = uiGeom.attributes.uv;
    const xMin = -5.34, xMax = -3.96;
    const zMin = -2.865, zMax = 3.915;
    const uMin = 0.399123, uMax = 0.600877;
    const vMin = 0.004386, vMax = 0.995614;

    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i);
      const z = posAttr.getZ(i);
      const u = ((x - xMin) / (xMax - xMin)) * (uMax - uMin) + uMin;
      const v = ((z - zMin) / (zMax - zMin)) * (vMax - vMin) + vMin;
      uvAttr.setXY(i, u, v);
    }
    uvAttr.needsUpdate = true;
    uiGeom.computeVertexNormals();

    return { housingGeom, uiGeom };
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Model Loading
  // ────────────────────────────────────────────────────────────────────────────
  private loadModel(): void {
    const loader = new GLTFLoader();

    // 1. Draco Geometry Decompression
    this.dracoLoader = new DRACOLoader();
    this.dracoLoader.setDecoderPath('/draco/');
    loader.setDRACOLoader(this.dracoLoader);

    // 2. KTX2 / Basis GPU Compressed Texture Transcoding
    this.ktx2Loader = new KTX2Loader();
    this.ktx2Loader.setTranscoderPath('/basis/');
    this.ktx2Loader.detectSupport(this.renderer.engine);
    loader.setKTX2Loader(this.ktx2Loader);

    // 3. Meshopt Geometry Decompression
    loader.setMeshoptDecoder(MeshoptDecoder);

    loader.load(
      QualityTier.getModelURL(),
      (gltf) => {
        if (this.typographyDisposed) {
          gltf.scene.traverse(object => {
            if (object instanceof THREE.Mesh) {
              object.geometry.dispose();
              const materials = Array.isArray(object.material) ? object.material : [object.material];
              materials.forEach(material => {
                Object.values(material).forEach(value => { if (value instanceof THREE.Texture) value.dispose(); });
                material.dispose();
              });
            }
          });
          return;
        }
        const modelScene =
          gltf.scenes[4] ||
          gltf.scenes.find((s) => s.name && s.name.includes('WEB')) ||
          gltf.scene;

        if (!modelScene) {
          console.error('[SakuraModelViewer] Web scene not found in /assets/snowy_hub.glb');
          return;
        }

        // Meshopt quantization adds node scale/translation. Bake those transforms
        // into float positions before replacing sidebar geometry or reparenting.
        // The four source WEB nodes have identity transforms; this restores their
        // original coordinate system and keeps interactive hit testing consistent.
        if (gltf.parser.json.extensionsUsed?.includes('KHR_mesh_quantization')) {
          modelScene.traverse(object => {
            if (!(object instanceof THREE.Mesh)) return;
            object.updateMatrix();
            const positions = object.geometry.getAttribute('position');
            const floats = new Float32Array(positions.count * 3);
            for (let i = 0; i < positions.count; i++) {
              floats[i * 3] = positions.getX(i);
              floats[i * 3 + 1] = positions.getY(i);
              floats[i * 3 + 2] = positions.getZ(i);
            }
            object.geometry.setAttribute('position', new THREE.BufferAttribute(floats, 3));
            object.geometry.applyMatrix4(object.matrix);
            object.position.set(0, 0, 0);
            object.quaternion.identity();
            object.scale.set(1, 1, 1);
            object.updateMatrix();
          });
        }

        // PBR Graphite Chassis Material
        const graphiteHousingMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(0x0e1118),
          metalness: 0.35,
          roughness: 0.42,
          side: THREE.DoubleSide,
        });
        this.graphiteHousingMat = graphiteHousingMat;

        // Frost Blue Rim Bevel Material
        const rimEdgeMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(0x60a5fa),
          emissive: new THREE.Color(0x3b82f6),
          emissiveIntensity: 0.30,
          metalness: 0.90,
          roughness: 0.20,
          side: THREE.DoubleSide,
        });
        this.rimEdgeMat = rimEdgeMat;

        // Initialize Dynamic Textures
        const screenTexture = this.createSnowyScreenTexture();
        const sidebarTexture = this.createSnowySidebarTexture();

        // Screen Material
        const screenMat = new THREE.MeshBasicMaterial({
          map: screenTexture,
          toneMapped: false,
          side: THREE.DoubleSide,
          polygonOffset: true,
          polygonOffsetFactor: -2,
          polygonOffsetUnits: -2,
        });

        // Floating Sidebar Material
        const sidebarMat = new THREE.MeshBasicMaterial({
          map: sidebarTexture,
          toneMapped: false,
          transparent: true,
          side: THREE.DoubleSide,
          depthTest: true,
          depthWrite: false,
          polygonOffset: true,
          polygonOffsetFactor: -4,
          polygonOffsetUnits: -4,
        });

        const sidebarChildren: THREE.Object3D[] = [];

        modelScene.traverse((child) => {
          if (!(child as THREE.Mesh).isMesh) return;
          const mesh = child as THREE.Mesh;
          const previous = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          for (const material of previous) {
            if (material instanceof THREE.MeshStandardMaterial && material.normalMap) {
              this.gpuNormal = material.normalMap;
              graphiteHousingMat.normalMap = this.gpuNormal;
              graphiteHousingMat.normalScale.set(.12, .12);
              graphiteHousingMat.needsUpdate = true;
            }
            Object.values(material).forEach(value => { if (value instanceof THREE.Texture && value !== this.gpuNormal) value.dispose(); });
            material.dispose();
          }

          if (mesh.name === 'Main UI' || mesh.name.includes('Main UI') || mesh.name.includes('Main_UI')) {
            mesh.material = screenMat;
            mesh.renderOrder = 2;
            this.screenMesh = mesh;
          } else if (mesh.name === 'Sidebar UI' || mesh.name.includes('Sidebar UI') || mesh.name.includes('Sidebar_UI')) {
            mesh.material = sidebarMat;
            mesh.renderOrder = 10;
            this.sidebarMesh = mesh;
            sidebarChildren.push(mesh);
          } else if (mesh.name.includes('Sidebar housing') || mesh.name.includes('Sidebar_housing')) {
            mesh.material = graphiteHousingMat;
            mesh.renderOrder = 1;
            this.sidebarHousingMesh = mesh;
            sidebarChildren.push(mesh);
          } else {
            mesh.material = graphiteHousingMat;
            this.mainHousingMesh = mesh;
          }
        });

        sidebarChildren.forEach((obj) => {
          this.sidebarGroup.add(obj);
        });

        // Replace GLTF sidebar rectangular geometry with mathematically pure 3D pill capsule
        const { housingGeom, uiGeom } = this.buildPillGeometries();
        if (this.sidebarHousingMesh) {
          this.sidebarHousingMesh.geometry.dispose();
          this.sidebarHousingMesh.geometry = housingGeom;
        }
        if (this.sidebarMesh) {
          this.sidebarMesh.geometry.dispose();
          this.sidebarMesh.geometry = uiGeom;
        }

        // Center entire model geometry at (0, 0, 0)
        const box = new THREE.Box3().setFromObject(modelScene);
        const center = new THREE.Vector3();
        box.getCenter(center);
        modelScene.position.sub(center);

        this.modelCenter.copy(center);
        this.sidebarGroup.position.set(-center.x, -center.y, -center.z);

        this.baseGroup.add(modelScene);
        this.updateCameraFrame();
        this.container!.dataset.modelState = 'ready';
        this.container!.dataset.modelCodec = QualityTier.lowPower ? 'meshopt' : 'draco';
        this.container!.dataset.gpuTexture = this.gpuNormal instanceof THREE.CompressedTexture ? 'ktx2' : 'missing';
      },
      undefined,
      (err) => {
        if (this.typographyDisposed) return;
        this.container!.dataset.modelState = 'error';
        console.error('[SakuraModelViewer] Model could not load:', err);
      }
    );
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Public Methods
  // ────────────────────────────────────────────────────────────────────────────
  public setScrollProgress(_p: number): void {
    // Scroll-driven scaling is disabled. Model remains fixed at static scale.
  }

  public setFloatingPill(pillIndex: number): void {
    if (pillIndex < 1 || pillIndex > 7) return;
    this.activeDockCard = pillIndex;

    this.targetDockTiltX = 0;
    this.targetDockSpread = 0;

    if (pillIndex === 1) {
      this.activeTab = 'main';
    } else if (pillIndex === 2) {
      this.activeTab = 'combat';
    } else if (pillIndex === 3) {
      this.activeTab = 'visuals';
    } else if (pillIndex === 4) {
      this.activeTab = 'movement';
    } else if (pillIndex === 5) {
      this.activeTab = 'serverhop';
    } else if (pillIndex === 6) {
      this.activeTab = 'configs';
    } else if (pillIndex === 7) {
      this.activeTab = 'profile';
    }

    this.drawScreenUI(false);
    if (this.screenTexture) this.screenTexture.needsUpdate = true;
    this.drawSidebarUI();
    if (this.sidebarTexture) this.sidebarTexture.needsUpdate = true;
  }

  public setTacticalModule(moduleIndex: number): void {
    this.setFloatingPill(moduleIndex);
  }

  public setDockCard(card: number): void {
    this.setFloatingPill(card);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Camera & Viewport Calculations (2D Orthographic)
  // ────────────────────────────────────────────────────────────────────────────
  private updateCameraFrame(): void {
    if (!this.container) return;
    const w = this.container.clientWidth || 640;
    const h = this.container.clientHeight || 640;
    if (w === 0 || h === 0) return;
    const aspect = w / h;
    const requiredW = this.REQUIRED_WORLD_WIDTH;
    const requiredH = this.REQUIRED_WORLD_HEIGHT;

    if (aspect >= requiredW / requiredH) {
      const halfH = requiredH / 2;
      this.camera.top = halfH;
      this.camera.bottom = -halfH;
      this.camera.right = halfH * aspect;
      this.camera.left = -halfH * aspect;
    } else {
      const halfW = requiredW / 2;
      this.camera.right = halfW;
      this.camera.left = -halfW;
      this.camera.top = halfW / aspect;
      this.camera.bottom = -halfW / aspect;
    }
    this.camera.updateProjectionMatrix();
    this.renderer.setPixelRatio(QualityTier.getDPR());
    this.renderer.setSize(w, h);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Event Handlers & Raycasting
  // ────────────────────────────────────────────────────────────────────────────
  private initEvents(): void {
    if (!this.container) return;

    this.container.addEventListener('pointermove', (e: PointerEvent) => {
      const rect = this.container!.getBoundingClientRect();
      this.targetMouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.targetMouseY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    }, { signal: this.events.signal });

    this.container.addEventListener('pointerenter', () => {
      this.isHovered = true;
    }, { signal: this.events.signal });

    this.container.addEventListener('pointerleave', () => {
      this.isHovered = false;
      this.targetMouseX = 0;
      this.targetMouseY = 0;
    }, { signal: this.events.signal });

    this.container.addEventListener('click', (e: MouseEvent) => {
      if (!this.container) return;
      const rect = this.container.getBoundingClientRect();
      this.pointerVec.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.pointerVec.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      this.raycaster.setFromCamera(this.pointerVec, this.camera);

      // ── 1. Check click on Floating Sidebar UI ──
      if (this.sidebarMesh) {
        const sideHits = this.raycaster.intersectObject(this.sidebarMesh);
        if (sideHits.length > 0 && sideHits[0].uv) {
          const v = sideHits[0].uv.y;

          if (v < 0.15) {
            this.setFloatingPill(1); // Main Settings (Grid ⊞)
          } else if (v >= 0.15 && v < 0.28) {
            this.setFloatingPill(2); // Combat Settings (Sliders 🎚️)
          } else if (v >= 0.28 && v < 0.41) {
            this.setFloatingPill(3); // Visuals & ESP (Eye 👁️)
          } else if (v >= 0.41 && v < 0.54) {
            this.setFloatingPill(4); // Movement & Misc (Lightning ⚡)
          } else if (v >= 0.54 && v < 0.67) {
            this.setFloatingPill(5); // Server Hop (Globe 🌐)
          } else if (v >= 0.67 && v < 0.80) {
            this.setFloatingPill(6); // Config Manager (Checkmark ✓)
          } else {
            this.setFloatingPill(7); // User Profile (Avatar 👤)
          }

          this.onPillChanged?.(this.activeDockCard);
          this.onModuleChanged?.(this.activeDockCard);
          this.onDockCardChanged?.(this.activeDockCard);
          return;
        }
      }

      // ── 2. Check click on Main Display Screen ──
      if (this.screenMesh) {
        const hits = this.raycaster.intersectObject(this.screenMesh);
        if (hits.length > 0 && hits[0].uv) {
          const uv = hits[0].uv;
          const px = uv.x * 1536;
          const py = uv.y * 1536;

          // Close button (x ~ 1420, y ~ 128, r ~ 50)
          const distToClose = Math.hypot(px - 1420, py - 128);
          if (distToClose < 50) {
            this.copyToClipboard();
            return;
          }

          // Settings Card Area (x: 265 to 1271, y: 466 to 1326)
          if (px >= 265 && px <= 1271 && py >= 466 && py <= 1326) {
            const relY = py - 466;
            const rowIndex = Math.floor(relY / 138);

            const isTab1 = this.activeTab === 'main' || this.activeTab === 'settings' || this.activeTab === 'vault';
            const isTab2 = this.activeTab === 'combat' || this.activeTab === 'stealth';
            const isTab3 = this.activeTab === 'visuals' || this.activeTab === 'domination';
            const isTab4 = this.activeTab === 'movement' || this.activeTab === 'misc';
            const isTab5 = this.activeTab === 'serverhop';
            const isTab6 = this.activeTab === 'configs';
            const isTab7 = this.activeTab === 'profile';

            if (isTab1) {
              // ════════════ MAIN SETTINGS TAB (User Requested Rows) ════════════
              if (rowIndex === 0) {
                // Row 1: Auto Farm (Toggle ON)
                this.autoFarmToggle = !this.autoFarmToggle;
              } else if (rowIndex === 1) {
                // Row 2: Auto Collect (Toggle ON)
                this.autoCollectToggle = !this.autoCollectToggle;
              } else if (rowIndex === 2) {
                // Row 3: Player ESP (Toggle ON)
                this.espToggle = !this.espToggle;
              } else if (rowIndex === 3) {
                // Row 4: Anti-AFK (Toggle ON)
                this.antiAfkToggle = !this.antiAfkToggle;
              } else if (rowIndex === 4) {
                // Row 5: WalkSpeed Override (Slider set to 50)
                if (px > 860) {
                  const pct = Math.max(0, Math.min(1, (px - 911) / 320));
                  this.walkSpeedVal = Math.round(16 + pct * 84);
                } else {
                  this.walkSpeedVal = this.walkSpeedVal >= 50 ? 25 : 50;
                }
              } else if (rowIndex >= 5 || relY >= 5 * 138) {
                // Row 6: Save Config (Action button)
                this.triggerSaveConfig();
                return;
              }
              this.drawScreenUI(false);
              if (this.screenTexture) this.screenTexture.needsUpdate = true;
              return;

            } else if (isTab2) {
              // ════════════ COMBAT SETTINGS TAB ════════════
              if (rowIndex === 0) {
                this.silentAimToggle = !this.silentAimToggle;
              } else if (rowIndex === 1) {
                this.autoTriggerToggle = !this.autoTriggerToggle;
              } else if (rowIndex === 2) {
                this.hitboxIdx = (this.hitboxIdx + 1) % 3;
              } else if (rowIndex === 3) {
                if (px > 860) {
                  const pct = Math.max(0, Math.min(1, (px - 911) / 320));
                  this.aimSmoothnessVal = Math.round(pct * 100);
                } else {
                  this.aimSmoothnessVal = this.aimSmoothnessVal >= 85 ? 50 : 85;
                }
              } else if (rowIndex === 4) {
                if (px > 860) {
                  const pct = Math.max(0, Math.min(1, (px - 911) / 320));
                  this.fovVal = Math.round(pct * 200);
                } else {
                  this.fovVal = this.fovVal >= 120 ? 60 : 120;
                }
              } else if (rowIndex >= 5 || relY >= 5 * 138) {
                this.triggerSaveConfig();
                return;
              }
              this.drawScreenUI(false);
              if (this.screenTexture) this.screenTexture.needsUpdate = true;
              return;

            } else if (isTab3) {
              // ════════════ VISUALS & ESP TAB ════════════
              if (rowIndex === 0) {
                this.boxEspToggle = !this.boxEspToggle;
              } else if (rowIndex === 1) {
                this.tracersToggle = !this.tracersToggle;
              } else if (rowIndex === 2) {
                this.nameplatesToggle = !this.nameplatesToggle;
              } else if (rowIndex === 3) {
                this.chamsToggle = !this.chamsToggle;
              } else if (rowIndex === 4) {
                if (px > 860) {
                  const pct = Math.max(0, Math.min(1, (px - 911) / 320));
                  this.renderDistanceVal = Math.round(pct * 100);
                } else {
                  this.renderDistanceVal = this.renderDistanceVal >= 80 ? 40 : 80;
                }
              } else if (rowIndex >= 5 || relY >= 5 * 138) {
                this.triggerSaveConfig();
                return;
              }
              this.drawScreenUI(false);
              if (this.screenTexture) this.screenTexture.needsUpdate = true;
              return;

            } else if (isTab4) {
              // ════════════ MOVEMENT & MISC (⚡ Lightning Tab) ════════════
              if (rowIndex === 0) {
                this.infiniteJumpToggle = !this.infiniteJumpToggle;
              } else if (rowIndex === 1) {
                this.noclipToggle = !this.noclipToggle;
              } else if (rowIndex === 2) {
                this.flyModeToggle = !this.flyModeToggle;
              } else if (rowIndex === 3) {
                if (px > 860) {
                  const pct = Math.max(0, Math.min(1, (px - 911) / 320));
                  this.flySpeedVal = Math.round(pct * 100);
                } else {
                  this.flySpeedVal = this.flySpeedVal >= 60 ? 30 : 60;
                }
              } else if (rowIndex === 4) {
                if (px > 860) {
                  const pct = Math.max(0, Math.min(1, (px - 911) / 320));
                  this.gravityVal = Math.round(pct * 100);
                } else {
                  this.gravityVal = this.gravityVal >= 50 ? 25 : 50;
                }
              } else if (rowIndex >= 5 || relY >= 5 * 138) {
                this.triggerSaveConfig();
                return;
              }
              this.drawScreenUI(false);
              if (this.screenTexture) this.screenTexture.needsUpdate = true;
              return;

            } else if (isTab5) {
              // ════════════ SERVER HOP TAB (Clean Standard Script Hub) ════════════
              if (rowIndex === 0) {
                this.autoHopToggle = !this.autoHopToggle;
              } else if (rowIndex === 1) {
                this.avoidFullToggle = !this.avoidFullToggle;
              } else if (rowIndex === 2) {
                this.regionIdx = (this.regionIdx + 1) % 4;
              } else if (rowIndex === 3) {
                this.playerThresholdIdx = (this.playerThresholdIdx + 1) % 3;
              } else if (rowIndex === 4) {
                if (px > 860) {
                  const pct = Math.max(0, Math.min(1, (px - 911) / 320));
                  this.hopDelayVal = Math.round(5 + pct * 55);
                } else {
                  this.hopDelayVal = this.hopDelayVal >= 30 ? 15 : 30;
                }
              } else if (rowIndex >= 5 || relY >= 5 * 138) {
                // Hop now Action Button
                this.isHopping = true;
                this.drawScreenUI(false);
                if (this.screenTexture) this.screenTexture.needsUpdate = true;
                if (this.hopTimeout) clearTimeout(this.hopTimeout);
                this.hopTimeout = setTimeout(() => {
                  this.isHopping = false;
                  this.drawScreenUI(false);
                  if (this.screenTexture) this.screenTexture.needsUpdate = true;
                }, 2200);
                return;
              }
              this.drawScreenUI(false);
              if (this.screenTexture) this.screenTexture.needsUpdate = true;
              return;

            } else if (isTab6) {
              // ════════════ CONFIG MANAGER (✓ Checkmark Tab) ════════════
              if (rowIndex === 0) {
                this.autoLoadToggle = !this.autoLoadToggle;
              } else if (rowIndex === 1) {
                this.cloudSyncToggle = !this.cloudSyncToggle;
              } else if (rowIndex === 2) {
                this.configProfileIdx = (this.configProfileIdx + 1) % 3;
              } else if (rowIndex === 3) {
                this.autoBackupToggle = !this.autoBackupToggle;
              } else if (rowIndex === 4) {
                if (px > 860) {
                  const pct = Math.max(0, Math.min(1, (px - 911) / 320));
                  this.configSlotVal = Math.max(1, Math.min(5, Math.round(1 + pct * 4)));
                } else {
                  this.configSlotVal = (this.configSlotVal % 5) + 1;
                }
              } else if (rowIndex >= 5 || relY >= 5 * 138) {
                this.triggerSaveConfig();
                return;
              }
              this.drawScreenUI(false);
              if (this.screenTexture) this.screenTexture.needsUpdate = true;
              return;

            } else if (isTab7) {
              // ════════════ USER PROFILE (👤 Avatar Tab) ════════════
              if (rowIndex === 0) {
                this.vipActive = !this.vipActive;
              } else if (rowIndex === 1) {
                this.discordAlertsToggle = !this.discordAlertsToggle;
              } else if (rowIndex === 2) {
                this.streamproofToggle = !this.streamproofToggle;
              } else if (rowIndex === 3) {
                this.themeIdx = (this.themeIdx + 1) % 3;
              } else if (rowIndex === 4) {
                if (px > 860) {
                  const pct = Math.max(0, Math.min(1, (px - 911) / 320));
                  this.uiOpacityVal = Math.round(50 + pct * 50);
                } else {
                  this.uiOpacityVal = this.uiOpacityVal >= 90 ? 70 : 95;
                }
              } else if (rowIndex >= 5 || relY >= 5 * 138) {
                this.triggerSaveConfig();
                return;
              }
              this.drawScreenUI(false);
              if (this.screenTexture) this.screenTexture.needsUpdate = true;
              return;
            }
          }
        }
      }

      // Default: copy script to clipboard with in-screen confirmation toast
      this.copyToClipboard();
    }, { signal: this.events.signal });

    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          const wasVisible = this.isVisible;
          this.isVisible = e.isIntersecting;
          if (!wasVisible && this.isVisible) this.lastFrame = -Infinity;
        });
      },
      { threshold: 0.05 }
    );
    this.intersectionObserver.observe(this.container);

    this.resizeObserver = new ResizeObserver(() => {
      this.updateCameraFrame();
    });
    this.resizeObserver.observe(this.container);
  }

  private triggerSaveConfig(): void {
    this.isConfigSaved = true;
    this.drawScreenUI(false);
    if (this.screenTexture) this.screenTexture.needsUpdate = true;

    if (this.saveConfigTimeout) clearTimeout(this.saveConfigTimeout);
    this.saveConfigTimeout = setTimeout(() => {
      this.isConfigSaved = false;
      this.drawScreenUI(false);
      if (this.screenTexture) this.screenTexture.needsUpdate = true;
    }, 2200);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Clipboard Operations
  // ────────────────────────────────────────────────────────────────────────────
  private async copyToClipboard(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.codeSnippet);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = this.codeSnippet;
      ta.style.cssText = 'position:fixed;opacity:0;';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    this.showInScreenFeedback();
  }

  private showInScreenFeedback(): void {
    if (this.isCopiedState) return;
    this.isCopiedState = true;
    this.drawScreenUI(true);
    if (this.screenTexture) this.screenTexture.needsUpdate = true;

    if (this.copyResetTimeout) clearTimeout(this.copyResetTimeout);
    this.copyResetTimeout = setTimeout(() => {
      this.isCopiedState = false;
      this.drawScreenUI(false);
      if (this.screenTexture) this.screenTexture.needsUpdate = true;
    }, 2200);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // RAF Animation Loop: Static Locked Scale & Position + Subtle Mouse Parallax
  // ────────────────────────────────────────────────────────────────────────────
  private update = (time: number): void => {
    if (!this.isVisible || document.hidden || this.typographyDisposed) return;
    if (time - this.lastFrame < QualityTier.getFrameInterval()) return;
    this.lastFrame = time;
    const reduced = QualityTier.reducedMotion;
    const signature = [this.activeTab, this.isCopiedState, this.isConfigSaved, this.renderer.domElement.width, this.renderer.domElement.height, this.container?.dataset.modelState, this.screenTexture?.version, this.sidebarTexture?.version].join(':');
    if (reduced && this.stillSignature === signature) return;
    this.stillSignature = reduced ? signature : '';
    const t = reduced ? 0 : time;
    const LERP = 0.10;

    // Mouse lerp
    this.mouseX += (this.targetMouseX - this.mouseX) * 0.07;
    this.mouseY += (this.targetMouseY - this.mouseY) * 0.07;

    // Sidebar docked cleanly in 2D space
    this.sidebarGroup.position.set(
      -this.modelCenter.x,
      -this.modelCenter.y,
      -this.modelCenter.z
    );

    // Subtle 2D idle float
    const idleY = Math.sin(t * 1.3) * 0.012;

    // 2D Flat view: zero 3D rotation, completely level and upright facing the user
    this.tiltGroup.rotation.set(0, 0, 0);

    // Subtle 2D translation micro-parallax on hover instead of 3D tilt
    this.tiltGroup.position.x = this.mouseX * 0.08;
    this.tiltGroup.position.y = idleY + this.mouseY * 0.08;
    this.tiltGroup.position.z = 0;

    // Scale is strictly fixed (no scroll zooming)
    this.tiltGroup.scale.setScalar(this.STATIC_SCALE);

    this.renderer.render(this.scene, this.camera);
  };

  // ────────────────────────────────────────────────────────────────────────────
  // Cleanup
  // ────────────────────────────────────────────────────────────────────────────
  public destroy(): void {
    this.typographyDisposed = true;
    this.unsubscribe?.();
    this.events.abort();
    this.gpuNormal?.dispose();
    this.scene?.traverse(object => {
      if (object instanceof THREE.Mesh) {
        object.geometry.dispose();
        (Array.isArray(object.material) ? object.material : [object.material]).forEach(material => material.dispose());
      }
    });
    if (this.intersectionObserver) this.intersectionObserver.disconnect();
    if (this.resizeObserver)       this.resizeObserver.disconnect();
    if (this.copyResetTimeout)     clearTimeout(this.copyResetTimeout);
    if (this.saveConfigTimeout)    clearTimeout(this.saveConfigTimeout);
    if (this.hopTimeout)           clearTimeout(this.hopTimeout);
    if (this.screenTexture)        this.screenTexture.dispose();
    if (this.sidebarTexture)       this.sidebarTexture.dispose();
    if (this.dracoLoader) {
      this.dracoLoader.dispose();
      this.dracoLoader = null;
    }
    if (this.ktx2Loader) {
      this.ktx2Loader.dispose();
      this.ktx2Loader = null;
    }
    if (this.graphiteHousingMat)   this.graphiteHousingMat.dispose();
    if (this.rimEdgeMat)           this.rimEdgeMat.dispose();
    if (this.renderer) {
      this.renderer.dispose();
      if (this.renderer.domElement?.parentElement) {
        this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
      }
    }
  }
}
