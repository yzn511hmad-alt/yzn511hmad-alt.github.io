import { Rive, Layout, Fit, Alignment, RuntimeLoader, StateMachineInputType } from '@rive-app/canvas';
import { QualityTier } from '../core/QualityTier';

RuntimeLoader.setWasmUrl('/rive/rive.wasm');
RuntimeLoader.setWasmFallbackUrl('/rive/rive_fallback.wasm');

export interface RiveConfig {
  canvasId: string;
  src?: string;
  stateMachine?: string;
  trigger?: string;
  autoplay?: boolean;
  onLoad?: () => void;
}

export class RiveInteractive {
  private rive: Rive;
  private resize: ResizeObserver;
  private visible = false;
  private loaded = false;
  private destroyed = false;
  private events = new AbortController();
  private unobserve: () => void;
  private machine: string;
  private canvas: HTMLCanvasElement;
  private sync = () => {
    if (!this.loaded || this.destroyed) return;
    if (this.visible && !document.hidden) {
      this.rive.startRendering();
      if (QualityTier.reducedMotion) { this.rive.drawFrame(); this.rive.stopRendering(); }
    } else this.rive.stopRendering();
  };
  constructor(config: RiveConfig) {
    const canvas = document.getElementById(config.canvasId);
    if (!(canvas instanceof HTMLCanvasElement)) throw new Error('Rive canvas was not found.');
    this.canvas = canvas;
    this.machine = config.stateMachine ?? 'bumpy';
    this.rive = new Rive({
      src: config.src ?? '/assets/snowy_beacon.riv', canvas,
      stateMachine: this.machine, autoplay: config.autoplay ?? true,
      layout: new Layout({ fit: Fit.Contain, alignment: Alignment.Center }),
      onLoad: () => {
        if (this.destroyed) return;
        this.loaded = true;
        canvas.dataset.riveState = 'ready';
        this.rive.resizeDrawingSurfaceToCanvas(QualityTier.getDPR());
        this.sync(); config.onLoad?.();
      },
      onLoadError: error => {
        canvas.dataset.riveState = 'error';
        console.error('[Snowy] Rive could not load.', error);
        canvas.hidden = true;
      },
    });
    this.resize = new ResizeObserver(() => {
      if (this.loaded) this.rive.resizeDrawingSurfaceToCanvas(QualityTier.getDPR());
    });
    this.resize.observe(canvas);
    this.unobserve = QualityTier.observeVisibility(canvas, () => { this.visible = true; this.sync(); }, () => { this.visible = false; this.sync(); });
    document.addEventListener('visibilitychange', this.sync, { signal: this.events.signal });
    matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', this.sync, { signal: this.events.signal });
    const target = canvas.closest<HTMLElement>('.hero-rive-pill') ?? canvas;
    const fire = () => this.fireTrigger(config.trigger ?? 'bump');
    target.addEventListener('pointerenter', fire, { signal: this.events.signal });
    target.addEventListener('click', fire, { signal: this.events.signal });
    target.addEventListener('focus', fire, { signal: this.events.signal });
  }
  fireTrigger(name: string): void {
    if (!this.loaded || QualityTier.reducedMotion) return;
    const input = this.rive.stateMachineInputs(this.machine)?.find(i => i.name === name && i.type === StateMachineInputType.Trigger);
    input?.fire();
    if (input) this.canvas.dataset.riveInteractions = String(Number(this.canvas.dataset.riveInteractions || 0) + 1);
  }
  setBoolean(name: string, value: boolean): void {
    const input = this.loaded && this.rive.stateMachineInputs(this.machine)?.find(i => i.name === name && i.type === StateMachineInputType.Boolean);
    if (input) input.value = value;
  }
  destroy(): void {
    this.destroyed = true; this.events.abort(); this.unobserve(); this.resize.disconnect(); this.rive.cleanup();
  }
}
