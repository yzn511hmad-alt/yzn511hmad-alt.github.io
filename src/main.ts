/**
 * MAIN APPLICATION ENTRYPOINT
 * Snowy Studios (getsnowy.net)
 * Coordinates Unified RAF Loop, Lenis, Scoped Topographic Background, Theme Manager, and Components
 */

// 1. Styles
import './styles/tokens.css';
import './styles/base.css';
import './styles/sections.css';
import './styles/themes.css';
import './styles/snowy-hub-2d.css';
import './styles/polar-night.css';

// 2. Core Modules
import { ScrollManager } from './core/Scroll';
import { ThemeManager } from './core/ThemeManager';
import { UnifiedLoop } from './core/Loop';

// 3. Scoped Topographic Background Controller ([data-topo-bg="true"])
import type { ScopedTopoBackground } from './webgl/ScopedTopoBackground';
import { lazyVisual } from './core/LazyVisual';
import { QualityTier } from './core/QualityTier';

// 4. UI Components
import { CodeCopier } from './components/CodeCopier';
import { GameCarousel } from './components/GameCarousel';
import { Accordion } from './components/Accordion';
import type { SakuraModelViewer } from './webgl/SakuraModelViewer';
import type { RiveInteractive } from './components/RiveInteractive';
import { SplitText } from 'gsap/SplitText';

// 5. GSAP Motion
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, SplitText);
gsap.ticker.lagSmoothing(0);

class SnowyApp {
  private scrollManager: ScrollManager;
  private themeManager: ThemeManager;
  private topoBg?: ScopedTopoBackground;
  private loop: UnifiedLoop;
  private gameCarousel?: GameCarousel;
  private accordion!: Accordion;
  private codeCopier?: CodeCopier;
  private sakuraModelViewer?: SakuraModelViewer;
  private snowyHub2D?: any;
  private cleanups: Array<() => void> = [];
  private splits: SplitText[] = [];
  private disposed = false;
  private events = new AbortController();
  private riveInteractive?: RiveInteractive;
  private splitHeadline?: SplitText;
  private ctx?: gsap.Context;

  constructor() {
    // A. Initialize Core Managers
    this.scrollManager = new ScrollManager();
    this.themeManager = new ThemeManager();

    // B. Create the coordinator before any component can register with it.
    this.loop = new UnifiedLoop(this.scrollManager);
    this.themeManager.onThemeChange(theme => this.topoBg?.setTheme(theme));

    // C. Initialize DOM components; expensive systems are loaded near their sections.
    this.initInteractiveComponents();

    // E. Initialize GSAP Choreography
    this.initScrollChoreography();

    // F. Performance: Off-Screen Rendering Suspension
    this.initPerformanceSuspension();
  }

  private initInteractiveComponents(): void {
    const topoSection = document.querySelector<HTMLElement>('[data-topo-bg="true"]');
    if (topoSection) this.cleanups.push(lazyVisual(topoSection, async () => {
      const { ScopedTopoBackground } = await import('./webgl/ScopedTopoBackground');
      if (this.disposed) return;
      this.topoBg = new ScopedTopoBackground();
      const preset = document.documentElement.dataset.themePreset || 'arctic-snow';
      this.topoBg?.setTheme(preset === 'arctic-snow' ? 'light' : 'dark');
      this.topoBg?.setPreset(Math.max(0, ['arctic-snow', 'cyber-glacial', 'sterling-ice', 'deep-midnight', 'aurora-borealis'].indexOf(preset)));
      this.loop.setTopo(this.topoBg);
      return () => this.topoBg?.destroy();
    }));
    const sakuraContainer = document.getElementById('sakura-canvas-container');
    if (sakuraContainer) {
      this.cleanups.push(lazyVisual(sakuraContainer, async () => {
        const { SnowyHub2D } = await import('./components/SnowyHub2D');
        if (this.disposed || !sakuraContainer) return;
        this.snowyHub2D = new SnowyHub2D('sakura-canvas-container');
        return () => {
          this.snowyHub2D?.destroy();
        };
      }));
    }

    // Section 03: Game Carousel (conditionally initialized if container is present)
    const carouselContainer = document.getElementById('game-carousel-container');
    if (carouselContainer) {
      this.gameCarousel = new GameCarousel('game-carousel-container');
      this.loop.setGameCarousel(this.gameCarousel);
    }

    const riveCanvas = document.getElementById('snowy-rive-canvas');
    if (riveCanvas) this.cleanups.push(lazyVisual(riveCanvas, async () => {
      const { RiveInteractive } = await import('./components/RiveInteractive');
      if (this.disposed) return;
      this.riveInteractive = new RiveInteractive({
        canvasId: 'snowy-rive-canvas', src: '/assets/snowy_beacon.riv',
        stateMachine: 'bumpy', trigger: 'bump', autoplay: true,
      });
      return () => this.riveInteractive?.destroy();
    }));

    // Section 03: Interactive Loader Code Copier
    this.codeCopier = new CodeCopier('copy-loader-btn');

    // Section 05: Accordion
    this.accordion = new Accordion('faq-accordion-container');

    // Section 02: Comparison Switcher (Snowy Apex vs Free Scripts)
    this.initComparisonSwitcher();

    // Floating Theme Presets Switcher
    // Polar Night remains fixed during the current dark design phase.
  }

  /**
   * Floating Theme Preset Switcher (Real-time palette preview across entire site)
   */
  private initThemePresetSwitcher(): void {
    const buttons = document.querySelectorAll<HTMLButtonElement>('.theme-preset-btn');
    if (!buttons.length) return;

    const presetNames = ['arctic-snow', 'cyber-glacial', 'sterling-ice', 'deep-midnight', 'aurora-borealis'];
    const savedPreset = localStorage.getItem('snowy-theme-preset');
    const currentPreset = savedPreset || document.documentElement.dataset.themePreset || 'arctic-snow';
    const initialIndex = Math.max(0, presetNames.indexOf(currentPreset));
    document.documentElement.dataset.themePreset = currentPreset;
    this.topoBg?.setPreset(initialIndex);
    buttons.forEach((b, i) => b.classList.toggle('active', i === initialIndex));

    buttons.forEach((btn, idx) => {
      btn.addEventListener('click', () => {
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const preset = btn.dataset.preset || presetNames[idx] || 'arctic-snow';
        document.documentElement.dataset.themePreset = preset;
        localStorage.setItem('snowy-theme-preset', preset);
        this.topoBg?.setPreset(idx);
      });
    });
  }

  /**
   * Section 02: Interactive Comparison Switcher & Step Synchronization
   */
  private initComparisonSwitcher(): void {
    const switchBtns = document.querySelectorAll<HTMLButtonElement>('.comparison-switch-btn');
    const stepper = document.querySelector<HTMLElement>('.editorial-stepper');
    const telemetry = document.querySelector<HTMLElement>('.stepper-telemetry-pill');
    const steps = document.querySelectorAll<HTMLElement>('.stepper-step');

    const updateMode = (mode: string) => {
      switchBtns.forEach((b) => {
        const bMode = b.getAttribute('data-mode') || b.getAttribute('data-compare') || 'snowy';
        const isActive = bMode === mode;
        b.classList.toggle('active', isActive);
        b.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });

      if (stepper) {
        stepper.setAttribute('data-mode', mode);

        // Smooth GSAP transition for active step contents
        const activeContents = stepper.querySelectorAll<HTMLElement>(
          mode === 'snowy' ? '.step-mode-snowy' : '.step-mode-trash'
        );
        gsap.fromTo(
          activeContents,
          { opacity: 0, x: mode === 'snowy' ? -8 : 8 },
          { opacity: 1, x: 0, duration: 0.35, stagger: 0.05, ease: 'power2.out' }
        );
      }

      if (telemetry) {
        telemetry.setAttribute('data-mode', mode);
      }
    };

    if (switchBtns.length) {
      switchBtns.forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const mode = btn.getAttribute('data-mode') || btn.getAttribute('data-compare') || 'snowy';
          updateMode(mode);
        });
      });
    }

    // Step clicks: completely decoupled local UI state only (never alters right-side 3D panel)
    if (steps.length) {
      steps.forEach((step) => {
        step.style.cursor = 'pointer';
        step.addEventListener('click', () => {
          steps.forEach((s) => s.classList.remove('active-step'));
          step.classList.add('active-step');
        });
      });
    }

    // Section 03: Loader step cards click synchronization
    const loaderSteps = document.querySelectorAll<HTMLElement>('.loader-step');
    if (loaderSteps.length) {
      loaderSteps.forEach((step) => {
        step.addEventListener('click', () => {
          loaderSteps.forEach((s) => s.classList.remove('active-step'));
          step.classList.add('active-step');
        });
      });
    }
  }

  private initScrollChoreography(): void {
    // Ensure deterministic scroll position on page load
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
    this.scrollManager.scrollTo(0, { duration: 0 });

    this.ctx = gsap.context(() => {
      // 1. Sticky Navigation Bar Scroll State
      const header = document.getElementById('site-header');
      if (header) {
        this.scrollManager.instance.on('scroll', ({ scroll }: { scroll: number }) => {
          if (scroll > 40) {
            header.classList.add('scrolled');
          } else {
            header.classList.remove('scrolled');
          }
        });
      }

      if (QualityTier.reducedMotion) return;

      // 2. 3D Model Panel - Initial scroll progress sync (no layout thrashing on scroll)
      const section02 = document.getElementById('how-it-works');
      if (section02 && this.sakuraModelViewer) {
        this.sakuraModelViewer.setScrollProgress(0);
      }

      // 3. Hero Headline & Content Entrance Animation (Kinetic SplitText Typography)
      const heroEyebrow = document.querySelector('.hero-eyebrow-row');
      const heroHeadline = document.querySelector('.hero-editorial-headline');
      const heroRight = document.querySelector('.hero-editorial-right');

      const heroTl = gsap.timeline({ delay: 0 });

      if (heroEyebrow) {
        heroTl.fromTo(heroEyebrow,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }
        );
      }

      if (heroHeadline) {
        this.splitHeadline = new SplitText('.hero-editorial-headline', { type: 'words,chars', aria: 'auto', wordsClass: 'split-word', charsClass: 'split-char' });
        this.splits.push(this.splitHeadline);
        heroTl.fromTo(this.splitHeadline.chars,
          { y: 40, opacity: 0, rotateZ: 2 },
          { y: 0, opacity: 1, rotateZ: 0, duration: 0.75, stagger: 0.015, ease: 'power4.out' },
          '-=0.5'
        );
      }

      if (heroRight) {
        heroTl.fromTo(heroRight,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out' },
          '-=0.7'
        );
      }

      // Section 02 Headline SplitText Reveal
      const sec02Title = document.querySelector('#how-it-works .section-editorial-title');
      if (sec02Title) {
        const splitSec02 = new SplitText(sec02Title as HTMLElement, { type: 'words,chars' });
        this.splits.push(splitSec02);
        gsap.fromTo(splitSec02.chars,
          { y: 35, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.65,
            stagger: 0.012,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: sec02Title,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
          }
        );
      }

      // 4. Staggered reveal for downstream section headers
      const sectionHeadings = document.querySelectorAll(
        '.section-header-split, .pricing-layout-grid, .faq-intro-col, .cta-banner-card'
      );
      sectionHeadings.forEach((el) => {
        gsap.fromTo(el,
          { y: 35, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.85,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
          }
        );
      });
    });

    // 5. Smooth Anchor Scrolling via Lenis
    document.addEventListener('click', (e: MouseEvent) => {
      const link = (e.target as HTMLElement).closest('a[href^="#"]') as HTMLAnchorElement;
      if (link) {
        const targetId = link.getAttribute('href');
        if (targetId && targetId !== '#' && targetId !== '#login-info') {
          e.preventDefault();
          this.scrollManager.scrollTo(targetId, { offset: 0, duration: 1.2 });
        }
      }
    });
  }

  /**
   * Performance requirement: Off-Screen Rendering Suspension
   * Pauses rendering loop when tab is hidden, immediately renders on return
   */
  private initPerformanceSuspension(): void {
    document.addEventListener('visibilitychange', () => {
      const isHidden = document.hidden;
      if (isHidden) {
        this.loop.pause();
      } else {
        this.loop.resume();
        // Zero-delay immediate render on tab reactivation: eliminates waiting for RAF
        this.topoBg?.renderImmediate();
      }
    }, { signal: this.events.signal });
  }

  public destroy(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.events.abort();
    this.cleanups.forEach(cleanup => cleanup());
    this.cleanups = [];
    this.loop.destroy();
    this.ctx?.revert();
    this.splits.forEach(split => split.revert());
    this.gameCarousel?.destroy();
    this.scrollManager.destroy();
  }
}

let appInstance: SnowyApp | null = null;

// Bootstrap when DOM is ready or immediately if already loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    appInstance = new SnowyApp();
  });
} else {
  appInstance = new SnowyApp();
}

window.addEventListener('beforeunload', () => {
  appInstance?.destroy();
});


if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    appInstance?.destroy();
  });
}

// Local account/community placeholder: do not misrepresent an unconfigured OAuth endpoint.
document.addEventListener('click', event => {
  if ((event.target as HTMLElement).closest('a[href="#login-info"]')) {
    event.preventDefault();
    (document.getElementById('login-info') as HTMLDialogElement).showModal();
  }
});
const mobileMenuButton = document.querySelector<HTMLButtonElement>('.mobile-menu-toggle');
const mobileMenu = document.getElementById('mobile-site-menu');
mobileMenuButton?.addEventListener('click', () => {
  const open = mobileMenuButton.getAttribute('aria-expanded') !== 'true';
  mobileMenuButton.setAttribute('aria-expanded', String(open));
  mobileMenu!.hidden = !open;
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && mobileMenu && !mobileMenu.hidden) {
    mobileMenu.hidden = true; mobileMenuButton?.setAttribute('aria-expanded', 'false'); mobileMenuButton?.focus();
  }
});
