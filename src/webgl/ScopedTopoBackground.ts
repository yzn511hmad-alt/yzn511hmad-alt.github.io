import * as THREE from 'three';
import { QualityTier } from '../core/QualityTier';
import { SharedSurface } from './SharedRenderer';
import { ScopedTopoVertexShader, ScopedTopoFragmentShader } from './shaders/ScopedTopoShader';

interface SectionView {
  element: HTMLElement;
  surface: SharedSurface;
  scene: THREE.Scene;
  camera: THREE.OrthographicCamera;
  material: THREE.ShaderMaterial;
  geometry: THREE.PlaneGeometry;
  fast: THREE.Vector2;
  slow: THREE.Vector2;
  target: THREE.Vector2;
  visible: boolean;
  animated: boolean;
  dirty: boolean;
  last: number;
  resize: ResizeObserver;
}

export class ScopedTopoBackground {
  private views: SectionView[] = [];
  private events = new AbortController();
  private observer: IntersectionObserver;
  private theme = 1;
  private preset = 0;
  private pointer: { x: number; y: number } | null = null;
  constructor() {
    this.observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        const view = this.views.find(v => v.element === entry.target);
        if (view) { view.visible = entry.isIntersecting; view.dirty = true; }
      }
    });
    document.querySelectorAll<HTMLElement>('[data-topo-bg="true"]').forEach(element => this.setup(element));
    window.addEventListener('pointermove', event => { this.pointer = { x: event.clientX, y: event.clientY }; }, { passive: true, signal: this.events.signal });
    matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', () => this.renderImmediate(), { signal: this.events.signal });
    document.addEventListener('pointerleave', () => { this.pointer = null; }, { signal: this.events.signal });
  }
  private setup(element: HTMLElement): void {
    element.style.position = 'relative';
    element.style.overflow = 'hidden';
    const surface = new SharedSurface(element.querySelector<HTMLCanvasElement>(':scope > .scoped-topo-canvas') ?? undefined);
    surface.domElement.className = 'scoped-topo-canvas';
    surface.domElement.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:0;';
    element.prepend(surface.domElement);
    const material = new THREE.ShaderMaterial({
      vertexShader: ScopedTopoVertexShader, fragmentShader: ScopedTopoFragmentShader,
      uniforms: {
        uTime: { value: 0 }, uAspect: { value: 1 },
        uMouseFast: { value: new THREE.Vector2(.5, .5) }, uMouseSlow: { value: new THREE.Vector2(.5, .5) },
        uScroll: { value: 0 }, uVelocity: { value: 0 }, uTheme: { value: this.theme },
        uPreset: { value: this.preset }, uLineMult: { value: element.dataset.topoLines === 'true' ? 1 : 0 },
      }, depthTest: false, depthWrite: false,
    });
    const geometry = new THREE.PlaneGeometry(2, 2);
    const scene = new THREE.Scene();
    scene.add(new THREE.Mesh(geometry, material));
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const resize = new ResizeObserver(() => {
      surface.setPixelRatio(QualityTier.getBackgroundDPR());
      surface.setSize(element.clientWidth, element.clientHeight);
      material.uniforms.uAspect.value = element.clientWidth / Math.max(1, element.clientHeight);
      view.dirty = true;
    });
    const view: SectionView = {
      element, surface, material, geometry, scene, camera, resize,
      fast: new THREE.Vector2(.5, .5), slow: new THREE.Vector2(.5, .5), target: new THREE.Vector2(.5, .5),
      visible: false, animated: element.dataset.topoAnimated === 'true', dirty: true, last: -Infinity,
    };
    this.views.push(view);
    resize.observe(element);
    this.observer.observe(element);
  }
  setTheme(theme?: string): void {
    this.theme = theme === 'light' ? 1 : 0;
    this.views.forEach(v => { v.material.uniforms.uTheme.value = this.theme; v.dirty = true; });
  }
  setPreset(preset: number): void {
    this.preset = preset;
    this.views.forEach(v => { v.material.uniforms.uPreset.value = preset; v.dirty = true; });
  }
  update(time: number, delta: number, velocity: number, scroll = 0): void {
    if (document.hidden) return;
    const reduced = QualityTier.reducedMotion;
    const interval = Math.max(QualityTier.getFrameInterval(), 1 / 30);
    for (const view of this.views) {
      if (!view.visible) continue;
      const animate = view.animated && !reduced;
      if (!view.dirty && !animate) continue;
      if (time - view.last + .0001 < interval) continue;
      const uniforms = view.material.uniforms;
      if (animate) {
        const rect = view.element.getBoundingClientRect();
        const target = this.pointer ? view.target.set(
          THREE.MathUtils.clamp((this.pointer.x - rect.left) / rect.width, 0, 1),
          THREE.MathUtils.clamp(1 - (this.pointer.y - rect.top) / rect.height, 0, 1),
        ) : view.target.set(.5, .5);
        view.fast.lerp(target, 1 - Math.exp(-delta * 12));
        view.slow.lerp(target, 1 - Math.exp(-delta * 4));
        uniforms.uMouseFast.value.copy(view.fast);
        uniforms.uMouseSlow.value.copy(view.slow);
        uniforms.uTime.value = time;
        uniforms.uScroll.value = scroll;
        uniforms.uVelocity.value += (THREE.MathUtils.clamp(velocity / 50, -1, 1) - uniforms.uVelocity.value) * .15;
      } else {
        uniforms.uVelocity.value = 0;
      }
      view.surface.render(view.scene, view.camera);
      view.dirty = false;
      view.last = Number.isFinite(view.last) ? time - ((time - view.last) % interval) : time;
    }
  }
  renderImmediate(): void { this.views.forEach(v => { v.dirty = true; }); }
  destroy(): void {
    this.events.abort(); this.observer.disconnect();
    for (const v of this.views) {
      v.resize.disconnect(); v.material.dispose(); v.geometry.dispose();
      v.surface.dispose(); v.surface.domElement.remove();
    }
    this.views = [];
  }
}
