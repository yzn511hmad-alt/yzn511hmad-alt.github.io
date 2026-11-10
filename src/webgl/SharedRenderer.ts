import * as THREE from 'three';

let renderer: THREE.WebGLRenderer | undefined;
let nativeSurface: SharedSurface | undefined;
let bufferWidth = 0;
let bufferHeight = 0;
const surfaces = new Set<SharedSurface>();

/**
 * A sole view draws directly to its DOM canvas: no GPU-to-2D copy. If another
 * view is mounted, retain both DOM surfaces and share one stable drawing buffer.
 * Buffer allocation changes only when the views' physical dimensions change.
 */
export class SharedSurface {
  readonly engine: THREE.WebGLRenderer;
  domElement: HTMLCanvasElement;
  toneMapping: THREE.ToneMapping = THREE.NoToneMapping;
  toneMappingExposure = 1;
  outputColorSpace = THREE.SRGBColorSpace;
  private context: CanvasRenderingContext2D | null = null;
  private width = 1;
  private height = 1;
  private dpr = 1;
  private disposed = false;

  constructor(canvas = document.createElement('canvas'), options: Pick<THREE.WebGLRendererParameters, 'antialias'> = {}) {
    this.domElement = canvas;
    if (!renderer) {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: options.antialias ?? false, powerPreference: 'default' });
      renderer.setPixelRatio(1);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      nativeSurface = this;
      bufferWidth = bufferHeight = 0;
    } else {
      nativeSurface?.retain();
      nativeSurface = undefined;
      this.context = canvas.getContext('2d', { alpha: true });
      if (!this.context) throw new Error('A canvas surface could not be created.');
    }
    this.engine = renderer;
    surfaces.add(this);
    this.domElement.setAttribute('aria-hidden', 'true');
    this.domElement.dataset.renderMode = nativeSurface === this ? 'direct' : 'retained';
  }

  private retain(): void {
    const previous = this.domElement;
    const canvas = previous.cloneNode(false) as HTMLCanvasElement;
    const context = canvas.getContext('2d', { alpha: true });
    if (!context) throw new Error('A canvas surface could not be retained.');
    context.drawImage(previous, 0, 0);
    previous.replaceWith(canvas);
    this.domElement = canvas;
    this.context = context;
    canvas.dataset.renderMode = 'retained';
  }

  setPixelRatio(value: number): void {
    if (this.dpr === value) return;
    this.dpr = value;
    this.resize();
  }
  setSize(width: number, height: number): void {
    this.width = Math.max(1, width);
    this.height = Math.max(1, height);
    this.resize();
    this.domElement.style.width = width + 'px';
    this.domElement.style.height = height + 'px';
  }
  private resize(): void {
    const width = Math.max(1, Math.round(this.width * this.dpr));
    const height = Math.max(1, Math.round(this.height * this.dpr));
    // For the native surface, renderer.setSize owns buffer sizing. Assigning
    // canvas.width here would reset its back buffer outside the render pass.
    if (nativeSurface === this) return;
    if (this.domElement.width !== width) this.domElement.width = width;
    if (this.domElement.height !== height) this.domElement.height = height;
  }
  render(scene: THREE.Scene, camera: THREE.Camera): void {
    if (this.disposed || document.hidden || this.engine.getContext().isContextLost()) return;
    const width = Math.max(1, Math.round(this.width * this.dpr));
    const height = Math.max(1, Math.round(this.height * this.dpr));
    let requiredWidth = width;
    let requiredHeight = height;
    if (nativeSurface !== this) {
      for (const surface of surfaces) {
        requiredWidth = Math.max(requiredWidth, Math.round(surface.width * surface.dpr));
        requiredHeight = Math.max(requiredHeight, Math.round(surface.height * surface.dpr));
      }
    }
    if (bufferWidth !== requiredWidth || bufferHeight !== requiredHeight) {
      this.engine.setSize(requiredWidth, requiredHeight, false);
      bufferWidth = requiredWidth;
      bufferHeight = requiredHeight;
    }
    this.engine.setViewport(0, 0, width, height);
    this.engine.setScissor(0, 0, width, height);
    this.engine.setScissorTest(true);
    this.engine.toneMapping = this.toneMapping;
    this.engine.toneMappingExposure = this.toneMappingExposure;
    this.engine.outputColorSpace = this.outputColorSpace;
    this.engine.setClearColor(0x000000, 0);
    this.engine.render(scene, camera);
    if (this.context) {
      this.context.globalCompositeOperation = 'copy';
      this.context.drawImage(this.engine.domElement, 0, bufferHeight - height, width, height, 0, 0, width, height);
    }
  }
  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    surfaces.delete(this);
    if (nativeSurface === this) nativeSurface = undefined;
    if (!surfaces.size) {
      renderer?.dispose();
      renderer?.forceContextLoss();
      renderer = undefined;
      bufferWidth = bufferHeight = 0;
    }
  }
}
