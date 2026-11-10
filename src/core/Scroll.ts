/**
 * LENIS SMOOTH SCROLL & VELOCITY TRACKER
 * Snowy Studios (getsnowy.net)
 */

import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { onFrame } from './FrameLoop';
import { QualityTier } from './QualityTier';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
gsap.ticker.lagSmoothing(0);

export class ScrollManager {
  private lenis: Lenis;
  private unsubscribe: () => void;
  private disposed = false;
  private motion = matchMedia('(prefers-reduced-motion: reduce)');
  private syncMotion = () => { this.lenis.options.smoothWheel = !this.motion.matches; };
  private velocity: number = 0;
  private velocityCallbacks: Array<(v: number) => void> = [];

  constructor() {
    this.lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: !QualityTier.reducedMotion,
      autoRaf: false,
      allowNestedScroll: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
    });

    this.initScrollTriggerSync();
    this.unsubscribe = onFrame(time => this.lenis.raf(time * 1000));
    this.motion.addEventListener('change', this.syncMotion);
  }

  private initScrollTriggerSync(): void {
    this.lenis.on('scroll', (e: { velocity: number; scroll: number }) => {
      this.velocity = e.velocity || 0;
      ScrollTrigger.update();

      for (let i = 0; i < this.velocityCallbacks.length; i++) {
        this.velocityCallbacks[i](this.velocity);
      }
    });
  }

  public raf(time: number): void {
    this.lenis.raf(time);
  }

  public getVelocity(): number {
    return this.velocity;
  }

  public getScroll(): number {
    return this.lenis.scroll || window.scrollY || 0;
  }

  public onVelocity(cb: (v: number) => void): () => void {
    this.velocityCallbacks.push(cb);
    return () => {
      this.velocityCallbacks = this.velocityCallbacks.filter(fn => fn !== cb);
    };
  }

  public scrollTo(target: string | HTMLElement | number, options?: { offset?: number; duration?: number }): void {
    this.lenis.scrollTo(target, QualityTier.reducedMotion ? { ...options, immediate: true } : options);
  }

  /** Freeze smooth scrolling (e.g. while the cinematic intro preloads). */
  public stop(): void {
    this.lenis.stop();
  }

  public start(): void {
    this.lenis.start();
  }

  public destroy(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.unsubscribe();
    this.motion.removeEventListener('change', this.syncMotion);
    this.lenis.destroy();
    this.velocityCallbacks = [];
  }

  public get instance(): Lenis {
    return this.lenis;
  }
}

