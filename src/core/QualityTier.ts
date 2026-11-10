/** Evaluated on demand so resizing and motion preferences take effect immediately. */
export class QualityTier {
  private static mobileQuery = matchMedia('(max-width: 767px), (pointer: coarse)');
  private static motionQuery = matchMedia('(prefers-reduced-motion: reduce)');
  static get isMobile(): boolean { return this.mobileQuery.matches; }
  static get reducedMotion(): boolean { return this.motionQuery.matches; }
  static get lowPower(): boolean {
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    return this.isMobile || !!connection?.saveData || navigator.hardwareConcurrency <= 4;
  }
  static getDPR(): number { return Math.min(devicePixelRatio || 1, this.lowPower ? 1.25 : 1.75); }
  static getBackgroundDPR(): number { return Math.min(this.getDPR(), this.lowPower ? 1 : 1.25); }
  static getFrameInterval(): number { return 1 / (this.lowPower ? 30 : 60); }
  static getParticleCount(): number { return this.lowPower ? 1200 : 3500; }
  static getTextureScale(): number { return this.lowPower ? 0.5 : 1; }
  static getModelURL(): string {
    return this.lowPower ? '/assets/models/snowy_hub.meshopt.glb' : '/assets/models/snowy_hub.draco.glb';
  }
  static observeVisibility(element: HTMLElement, onVisible: () => void, onHidden: () => void): () => void {
    const observer = new IntersectionObserver(([entry]) => entry.isIntersecting ? onVisible() : onHidden(), { threshold: 0.01 });
    observer.observe(element);
    return () => observer.disconnect();
  }
}
