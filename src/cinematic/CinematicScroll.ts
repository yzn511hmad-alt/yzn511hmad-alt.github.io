import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
gsap.ticker.lagSmoothing(1000, 16);

const TOTAL_INTRO_FRAMES = Object.keys(import.meta.glob('/public/assets/intro_frames/frame_*.webp')).length;
const TOTAL_TUNNEL_FRAMES = Object.keys(import.meta.glob('/public/assets/tunnel_frames/frame_*.webp')).length;

/**
 * 50% Frame Optimization (300 frames -> 150 frames):
 * Filter down to alternate frames (1, 3, 5, 7 ... up to 300) to cut GPU/CPU decoding and memory in half.
 * Preserves frame 1 (initial paint) and terminal frame 300 for pixel-perfect transitions.
 */
export const introUrls: string[] = [];
for (let i = 1; i <= TOTAL_INTRO_FRAMES; i += 2) {
  introUrls.push(`/assets/intro_frames/frame_${String(i).padStart(4, '0')}.webp`);
}
if (introUrls.length > 0 && TOTAL_INTRO_FRAMES > 0) {
  introUrls[introUrls.length - 1] = `/assets/intro_frames/frame_${String(TOTAL_INTRO_FRAMES).padStart(4, '0')}.webp`;
}

export const tunnelUrls: string[] = [];
for (let i = 1; i <= TOTAL_TUNNEL_FRAMES; i += 2) {
  tunnelUrls.push(`/assets/tunnel_frames/frame_${String(i).padStart(4, '0')}.webp`);
}
if (tunnelUrls.length > 0 && TOTAL_TUNNEL_FRAMES > 0) {
  tunnelUrls[tunnelUrls.length - 1] = `/assets/tunnel_frames/frame_${String(TOTAL_TUNNEL_FRAMES).padStart(4, '0')}.webp`;
}

export const INTRO_FRAME_COUNT = introUrls.length;
export const TUNNEL_FRAME_COUNT = tunnelUrls.length;

/**
 * High-performance sequential image loader with asynchronous off-thread decoding.
 * - Decodes images using `await img.decode()` on worker threads without blocking main UI.
 * - Flat array storage for instant O(1) frame lookup during ticker render passes.
 * - Eliminates GC churn and frame eviction thrashing.
 */
class SequenceLoader {
  readonly images: (HTMLImageElement | null)[];
  private isPreloading = false;
  private dead = false;

  constructor(
    readonly urls: string[],
    initialPoster?: HTMLImageElement | null
  ) {
    this.images = new Array(urls.length).fill(null);
    if (initialPoster && initialPoster.complete && initialPoster.naturalWidth > 0) {
      this.images[0] = initialPoster;
    }
  }

  public getFrame(index: number, fallbackIndex?: number): HTMLImageElement | null {
    const clamped = Math.max(0, Math.min(this.urls.length - 1, index));
    if (this.images[clamped]) return this.images[clamped];
    if (fallbackIndex !== undefined && this.images[fallbackIndex]) return this.images[fallbackIndex];

    // Search nearest decoded frame within a small neighborhood
    for (let d = 1; d <= 12; d++) {
      if (clamped - d >= 0 && this.images[clamped - d]) return this.images[clamped - d];
      if (clamped + d < this.urls.length && this.images[clamped + d]) return this.images[clamped + d];
    }
    return null;
  }

  public async preloadFirstBatch(count = 12): Promise<void> {
    const limit = Math.min(count, this.urls.length);
    for (let i = 0; i < limit; i++) {
      if (this.dead) break;
      await this.loadSingle(i);
    }
  }

  public startBackgroundPreload(): void {
    if (this.isPreloading || this.dead) return;
    this.isPreloading = true;

    // Load remaining frames with worker thread decode and bounded concurrency
    const concurrency = 4;
    let nextIdx = 0;

    const worker = async () => {
      while (nextIdx < this.urls.length && !this.dead) {
        const idx = nextIdx++;
        if (!this.images[idx]) {
          await this.loadSingle(idx);
        }
      }
    };

    for (let c = 0; c < concurrency; c++) {
      worker();
    }
  }

  private async loadSingle(index: number): Promise<void> {
    if (this.images[index] || this.dead) return;
    try {
      const img = new Image();
      img.src = this.urls[index];
      // CRITICAL: Off-thread background decode unblocks the main rendering thread
      await img.decode();
      if (!this.dead) {
        this.images[index] = img;
      }
    } catch {
      if (!this.dead) {
        const img = new Image();
        img.onload = () => {
          if (!this.dead) this.images[index] = img;
        };
        img.src = this.urls[index];
      }
    }
  }

  public destroy(): void {
    this.dead = true;
    for (let i = 0; i < this.images.length; i++) {
      if (this.images[i]) {
        this.images[i]!.src = '';
        this.images[i] = null;
      }
    }
    this.images.length = 0;
  }
}

export interface CinematicScrollOptions {
  container: HTMLElement;
  canvasIntro: HTMLCanvasElement;
  canvasTunnel: HTMLCanvasElement;
  overlayBox: HTMLElement;
  flash: HTMLElement;
  masterImg?: HTMLImageElement | null;
  hint?: HTMLElement | null;
  carvedTitle?: HTMLElement | null;
  leftTelemetry?: HTMLElement | null;
}

type NavState = 1 | 2 | 3 | 4 | 5;

export class CinematicScrollController {
  private intro: SequenceLoader;
  private tunnel: SequenceLoader;

  /**
   * Proxy object updated ONLY by GSAP ScrollTrigger timeline.
   * Decoupled completely from Canvas drawing calls.
   */
  private scrollState = {
    introFrame: 0,
    tunnelFrame: 0,
  };

  /** Last integer frame actually painted per canvas */
  private lastPaintedIntro = -1;
  private lastPaintedTunnel = -1;
  private tlTime = 0;

  private timeline!: gsap.core.Timeline;
  private resizeTimer = 0;
  private refreshRaf = 0;
  private dead = false;
  private ctxI: CanvasRenderingContext2D;
  private ctxT: CanvasRenderingContext2D;
  private media = gsap.matchMedia();
  private events = new AbortController();
  private firstFrame?: HTMLImageElement;
  private masterReady = false;
  private masterOpacity = { value: 0 };
  private autoScrollTween: gsap.core.Tween | null = null;

  private viewW = 0;
  private viewH = 0;

  private onResize = () => {
    window.clearTimeout(this.resizeTimer);
    this.resizeTimer = window.setTimeout(() => {
      this.resize();
      ScrollTrigger.refresh();
    }, 150);
  };

  /**
   * GSAP Ticker Render Loop (Decoupled from ScrollTrigger)
   * Runs exactly once per screen refresh (typically 60Hz/120Hz).
   * ScrollTrigger updates ONLY proxy values; drawImage is NEVER executed in onUpdate!
   */
  private render = () => {
    if (this.dead || document.hidden) return;

    const t = this.tlTime;

    // 1. Phase 1 (Canvas Intro): active while t < 56
    if (t < 56) {
      const targetFrame = Math.round(this.scrollState.introFrame);
      if (targetFrame !== this.lastPaintedIntro) {
        const img = this.intro.getFrame(targetFrame, this.lastPaintedIntro) || this.firstFrame;
        if (img) {
          this.draw(this.ctxI, img);
          this.lastPaintedIntro = targetFrame;
        }
      }
    }

    // 2. Phase 3 (Canvas Tunnel): active while t > 53 && t < 99
    if (t > 53 && t < 99) {
      const targetFrame = Math.round(this.scrollState.tunnelFrame);
      if (targetFrame !== this.lastPaintedTunnel) {
        const img = this.tunnel.getFrame(targetFrame, this.lastPaintedTunnel);
        if (img) {
          this.draw(this.ctxT, img);
          this.lastPaintedTunnel = targetFrame;
        }
      }
    }
  };

  constructor(private o: CinematicScrollOptions) {
    o.canvasIntro.dataset.controlled = 'true';
    o.canvasTunnel.dataset.controlled = 'true';

    // Canvas Context Optimization: alpha: false saves massive GPU calculation overhead on opaque frames
    this.ctxI = o.canvasIntro.getContext('2d', { alpha: false })!;
    this.ctxT = o.canvasTunnel.getContext('2d', { alpha: false })!;

    const poster = document.querySelector<HTMLImageElement>('.cine-poster');
    this.intro = new SequenceLoader(introUrls, poster);
    this.tunnel = new SequenceLoader(tunnelUrls);

    this.resize();

    // Decode initial poster and master image
    if (poster?.complete && poster.naturalWidth) {
      this.firstFrame = poster;
      this.draw(this.ctxI, poster);
    } else if (poster) {
      poster.decode().then(() => {
        if (!this.dead) {
          this.firstFrame = poster;
          this.draw(this.ctxI, poster);
        }
      }).catch(() => {});
    }

    if (o.masterImg) {
      o.masterImg.decode().then(() => {
        if (this.dead) return;
        this.masterReady = true;
        o.masterImg!.style.opacity = String(this.masterOpacity.value);
        this.resize();
      }).catch(() => {});
    }

    this.intro.preloadFirstBatch(12);
    this.tunnel.preloadFirstBatch(6);

    this.bindHotspots();
    this.build();

    // Register decoupled ticker render loop
    gsap.ticker.add(this.render);

    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.intro.startBackgroundPreload();
      this.tunnel.startBackgroundPreload();
    }

    window.addEventListener('resize', this.onResize, { passive: true, signal: this.events.signal });
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.lastPaintedIntro = -1;
        this.lastPaintedTunnel = -1;
      }
    }, { signal: this.events.signal });
  }

  private draw(ctx: CanvasRenderingContext2D, img: HTMLImageElement): void {
    const sw = img.naturalWidth || 1920;
    const sh = img.naturalHeight || 1080;
    const w = this.viewW;
    const h = this.viewH;
    if (w <= 0 || h <= 0) return;

    const scale = Math.max(w / sw, h / sh);
    const dw = sw * scale;
    const dh = sh * scale;
    const dx = (w - dw) / 2;
    const dy = (h - dh) / 2;
    ctx.drawImage(img, dx, dy, dw, dh);
  }

  private resize(): void {
    const { container, canvasIntro, canvasTunnel, overlayBox } = this.o;
    const w = container.clientWidth || window.innerWidth;
    const h = container.clientHeight || window.innerHeight;
    this.viewW = w;
    this.viewH = h;

    // Device Pixel Ratio (DPR) Capping: Strict cap at 1.5x to prevent 4K fillrate drops
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const pw = Math.round(w * dpr);
    const ph = Math.round(h * dpr);

    for (const c of [canvasIntro, canvasTunnel]) {
      if (c.width !== pw || c.height !== ph) {
        c.width = pw;
        c.height = ph;
      }
    }

    for (const ctx of [this.ctxI, this.ctxT]) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // Scale context to logical CSS pixels
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'medium';
    }

    // Overlay box matches master image cover crop pixel-for-pixel
    const sw = this.o.masterImg?.naturalWidth || 2752, sh = this.o.masterImg?.naturalHeight || 1536;
    const s = Math.max(w / sw, h / sh);
    const boxW = sw * s;
    const boxH = sh * s;
    if (overlayBox) {
      overlayBox.style.width = `${boxW}px`;
      overlayBox.style.height = `${boxH}px`;
      overlayBox.style.left = `${(w - boxW) / 2}px`;
      overlayBox.style.top = `${(h - boxH) / 2}px`;
    }

    this.lastPaintedIntro = -1;
    this.lastPaintedTunnel = -1;
  }

  /**
   * Cinematic Autopilot: Smoothly auto-scrolls the user through the entire 3D sequence
   * with ultra-cinematic slow-motion GSAP easing and automatic interruption support.
   */
  public startAutoScroll(duration = 40): gsap.core.Tween {
    if (this.autoScrollTween) {
      this.autoScrollTween.kill();
      this.autoScrollTween = null;
    }

    const st = this.timeline?.scrollTrigger || ScrollTrigger.getById('snowy-journey');
    const targetElement = document.getElementById('end-of-canvas-section') || document.getElementById('hero');
    const targetY = st ? st.end : (targetElement ? window.scrollY + targetElement.getBoundingClientRect().top : 14000);

    const btn = document.getElementById('btn-follow-journey');
    if (btn) btn.classList.add('is-autopiloting');

    this.autoScrollTween = gsap.to(window, {
      duration, // Majestic, slow-motion 40-second cinematic flythrough
      scrollTo: {
        y: targetY, // Target the end of canvas animation sequence
        autoKill: true, // Allows user to interrupt auto-scroll if they manually scroll
      },
      ease: 'sine.inOut', // Butter-smooth sinusoidal slow-motion easing
      onUpdate: () => {
        // Synchronously drive the existing ScrollTrigger timeline for buttery-smooth 60FPS frames
        ScrollTrigger.update();
      },
      onComplete: () => {
        this.autoScrollTween = null;
        if (btn) btn.classList.remove('is-autopiloting');
      },
      onInterrupt: () => {
        this.autoScrollTween = null;
        if (btn) btn.classList.remove('is-autopiloting');
      },
    });

    return this.autoScrollTween;
  }

  private bindHotspots(): void {
    this.o.container.addEventListener('click', e => {
      // Follow the Journey Autopilot button
      const journeyBtn = (e.target as HTMLElement).closest<HTMLElement>('#btn-follow-journey, [data-follow-journey]');
      if (journeyBtn) {
        e.preventDefault();
        this.startAutoScroll(40);
        return;
      }

      // Skip the intro button
      const target = (e.target as HTMLElement).closest<HTMLElement>('.journey-skip, [data-skip-intro]');
      if (!target) return;
      e.preventDefault();
      if (this.autoScrollTween) {
        this.autoScrollTween.kill();
        this.autoScrollTween = null;
        const btn = document.getElementById('btn-follow-journey');
        if (btn) btn.classList.remove('is-autopiloting');
      }
      const hero = document.getElementById('hero');
      if (!hero) return;
      const y = window.scrollY + hero.getBoundingClientRect().top;
      window.scrollTo({ top: y, behavior: 'smooth' });
      hero.focus({ preventScroll: true });
    }, { signal: this.events.signal });

    // Allow Escape key to interrupt auto-scroll
    window.addEventListener('keydown', e => {
      if (e.key === 'Escape' && this.autoScrollTween) {
        this.autoScrollTween.kill();
        this.autoScrollTween = null;
        const btn = document.getElementById('btn-follow-journey');
        if (btn) btn.classList.remove('is-autopiloting');
      }
    }, { signal: this.events.signal });
  }

  private build(): void {
    const o = this.o;
    const chrome = document.querySelector<HTMLElement>('.journey-chrome');
    const phaseEl = document.getElementById('journey-phase');
    const progressSpan = document.querySelector<HTMLElement>('.journey-progress span');
    const continueEl = document.querySelector<HTMLElement>('.journey-continue');
    const mobileNav = document.querySelector<HTMLElement>('.iceberg-navigation');
    const header = document.getElementById('site-header');

    // Dynamic Navigation Bar Visibility States:
    let navState: NavState = 1;
    let navTween: gsap.core.Tween | undefined;
    const syncNavState = (state: NavState, animate: boolean) => {
      navState = state;
      if (!header) return;
      const visible = state === 1 || state === 3 || state === 5;
      header.inert = !visible;
      header.classList.toggle('nav-hidden', !visible);
      const vars = { y: visible ? 0 : -20, opacity: visible ? 1 : 0, pointerEvents: visible ? 'auto' : 'none' };
      navTween?.kill();
      if (animate) navTween = gsap.to(header, { ...vars, duration: 0.35, ease: 'power2.out', overwrite: 'auto' });
      else gsap.set(header, vars);
    };
    syncNavState(1, false);

    // Change-guarded DOM state: only touch the DOM when a value actually changes.
    let lastCineActive: boolean | null = null;
    let lastOverlayActive: boolean | null = null;
    let lastContinue: boolean | null = null;
    let lastPhase = -1;
    let lastProgressMilli = -1;
    const PHASES = ['01 / THE FRACTURE', '02 / THE ICEBERG', '03 / THE TUNNEL'];

    /**
     * ScrollTrigger update: updates DOM states only when values change.
     * Absolutely NO drawImage calls are performed here!
     */
    const update = () => {
      const t = this.timeline.time();
      this.tlTime = t;
      const st = this.timeline.scrollTrigger;
      const progress = st ? st.progress : t / 100;
      const isComplete = progress >= 0.999;
      const isCineActive = !isComplete;

      if (isCineActive !== lastCineActive) {
        lastCineActive = isCineActive;
        document.body.classList.toggle('cine-active', isCineActive);
        o.container.inert = !isCineActive;
        if (chrome) {
          chrome.style.opacity = isCineActive ? '1' : '0';
          chrome.inert = !isCineActive;
        }
      }

      const nextNav: NavState =
        isComplete ? 5 : t <= 1 ? 1 : t < 41.5 ? 2 : t <= 55 ? 3 : 4;
      if (nextNav !== navState) syncNavState(nextNav, true);

      const overlayActive = t >= 42.5 && t <= 55.5;
      if (overlayActive !== lastOverlayActive) {
        lastOverlayActive = overlayActive;
        o.overlayBox.classList.toggle('is-active', overlayActive);
        o.overlayBox.inert = !overlayActive;
        if (mobileNav) {
          mobileNav.classList.toggle('is-active', overlayActive);
          mobileNav.inert = !overlayActive;
        }
      }

      const phase = t < 42 ? 0 : t < 56 ? 1 : 2;
      if (phase !== lastPhase && phaseEl) {
        lastPhase = phase;
        document.body.dataset.journeyPhase = String(phase);
        phaseEl.textContent = PHASES[phase];
      }

      const showContinue = t >= 42 && t <= 56;
      if (showContinue !== lastContinue && continueEl) {
        lastContinue = showContinue;
        continueEl.style.opacity = showContinue ? '1' : '0';
      }

      const pm = Math.round(Math.min(1, Math.max(0, progress)) * 1000);
      if (pm !== lastProgressMilli && progressSpan) {
        lastProgressMilli = pm;
        progressSpan.style.transform = `scaleX(${pm / 1000})`;
      }
    };

    this.media.add(
      {
        normal: '(prefers-reduced-motion: no-preference)',
        reduced: '(prefers-reduced-motion: reduce)',
      },
      context => {
        if (context.conditions?.reduced) {
          o.container.classList.add('reduced-journey');
          document.body.classList.remove('cine-active', 'journey-enhanced');
          if (header) {
            header.inert = false;
            header.classList.remove('nav-hidden');
            gsap.set(header, { y: 0, opacity: 1, pointerEvents: 'auto' });
          }
          o.container.inert = false;
          gsap.set(o.container, { opacity: 1 });
          return () => {
            o.container.classList.remove('reduced-journey');
          };
        }

        document.body.classList.add('cine-active', 'journey-enhanced');

        const tl = (this.timeline = gsap.timeline({
          defaults: { ease: 'none' },
          onUpdate: update,
          scrollTrigger: {
            id: 'snowy-journey',
            trigger: o.container,
            start: 'top top',
            end: () => `+=${Math.max(12000, window.innerHeight * 14)}`,
            pin: true,
            scrub: 1.2,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onRefresh: () => {
              cancelAnimationFrame(this.refreshRaf);
              this.refreshRaf = requestAnimationFrame(() => {
                if (this.dead || !this.timeline) return;
                update();
                syncNavState(navState, false);
              });
            },
          },
        }));

        // Phase 1: Ice wall fracture → iceberg (Canvas 1)
        // ScrollTrigger updates proxy object ONLY — NO drawImage calls!
        if (o.hint) tl.to(o.hint, { autoAlpha: 0, duration: 4 }, 1);
        if (o.carvedTitle) tl.to(o.carvedTitle, { autoAlpha: 0, y: -25, duration: 6 }, 2);
        tl.to(this.scrollState, { introFrame: INTRO_FRAME_COUNT - 1, duration: 42, ease: 'none' }, 0);

        // Phase 2: Interactive iceberg (native-res master image cross-fade)
        if (o.masterImg) {
          tl.to(
            this.masterOpacity,
            {
              value: 1,
              duration: 1.5,
              onUpdate: () => {
                if (this.masterReady) o.masterImg!.style.opacity = String(this.masterOpacity.value);
              },
            },
            42
          );
        }
        tl.to(o.overlayBox, { opacity: 1, duration: 1.5 }, 42.0);
        tl.to(o.overlayBox, { opacity: 0, duration: 1.5 }, 55.0);
        if (o.masterImg) {
          tl.to(
            this.masterOpacity,
            {
              value: 0,
              duration: 1.5,
              onUpdate: () => {
                if (this.masterReady) o.masterImg!.style.opacity = String(this.masterOpacity.value);
              },
            },
            55
          );
        }

        // Phase 3: Cave ingress & Roblox tunnel (Canvas 2)
        // ScrollTrigger updates proxy object ONLY — NO drawImage calls!
        tl.to(o.canvasTunnel, { opacity: 1, duration: 1.5 }, 55.5);
        tl.to(this.scrollState, { tunnelFrame: TUNNEL_FRAME_COUNT - 1, duration: 38, ease: 'none' }, 56.0);

        // Blinding white flash at tunnel exit, resolving smoothly into Hero section
        tl.to(o.flash, { opacity: 1, duration: 3.5 }, 92.5);
        tl.set([o.canvasIntro, o.canvasTunnel], { opacity: 0 }, 96.0);
        tl.to(o.flash, { opacity: 0, duration: 4.0, ease: 'power2.inOut' }, 96.0);

        tl.set({}, {}, 100);
        update();

        return () => {
          cancelAnimationFrame(this.refreshRaf);
          navTween?.kill();
          tl.scrollTrigger?.kill();
          tl.kill();
        };
      }
    );
  }

  /**
   * Aggressive Memory Cleanup & Resource Teardown
   */
  destroy(): void {
    this.dead = true;
    if (this.autoScrollTween) {
      this.autoScrollTween.kill();
      this.autoScrollTween = null;
    }
    gsap.ticker.remove(this.render);
    this.events.abort();
    this.o.container.inert = false;
    delete document.body.dataset.journeyPhase;
    cancelAnimationFrame(this.refreshRaf);
    clearTimeout(this.resizeTimer);
    window.removeEventListener('resize', this.onResize);
    this.media.revert();

    // Nullify and evict all preloaded images
    this.intro.destroy();
    this.tunnel.destroy();

    // Release GPU canvas buffers
    if (this.ctxI && this.viewW && this.viewH) {
      this.ctxI.clearRect(0, 0, this.viewW, this.viewH);
    }
    if (this.ctxT && this.viewW && this.viewH) {
      this.ctxT.clearRect(0, 0, this.viewW, this.viewH);
    }

    this.firstFrame = undefined;

    document.body.classList.remove('cine-active', 'journey-enhanced');
    const header = document.getElementById('site-header');
    if (header) {
      header.inert = false;
      header.classList.remove('nav-hidden');
      gsap.set(header, { y: 0, opacity: 1, pointerEvents: 'auto' });
    }
  }
}
