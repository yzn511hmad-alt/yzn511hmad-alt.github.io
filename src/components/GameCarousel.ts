/**
 * GAME CAROUSEL COMPONENT
 * Section 03: Script Library infinite horizontal game slider with pause-on-hover
 * Snowy Studios (getsnowy.net)
 */

export interface GameItem {
  category: 'SIMULATOR' | 'ADVENTURE' | 'SHOOTER';
  title: string;
  accentColor: string;
  imageSrc: string;
  universeId: number;
}

export class GameCarousel {
  private container: HTMLElement | null = null;
  private track: HTMLElement | null = null;
  private offset: number = 0;
  private currentSpeed: number = 0.35;
  private isHovered: boolean = false;
  private isVisible: boolean = false;
  private observer: IntersectionObserver | null = null;
  private setWidth: number = 0;
  private resizeHandler: (() => void) | null = null;

  // Real games with official Roblox thumbnails
  private readonly games: GameItem[] = [
    {
      category: 'SIMULATOR',
      title: '+1 Jump Brainrot',
      accentColor: '#38bdf8',
      imageSrc: '/assets/images/games/jump-brainrot.webp',
      universeId: 8280244405,
    },
    {
      category: 'ADVENTURE',
      title: 'Brookhaven',
      accentColor: '#818cf8',
      imageSrc: '/assets/images/games/brookhaven.webp',
      universeId: 1686885941,
    },
    {
      category: 'SIMULATOR',
      title: 'Adopt Me',
      accentColor: '#f472b6',
      imageSrc: '/assets/images/games/adopt-me.webp',
      universeId: 383310974,
    },
    {
      category: 'SHOOTER',
      title: 'MM2',
      accentColor: '#f43f5e',
      imageSrc: '/assets/images/games/mm2.webp',
      universeId: 66654135,
    },
    {
      category: 'SHOOTER',
      title: 'Rivals',
      accentColor: '#f59e0b',
      imageSrc: '/assets/images/games/rivals.webp',
      universeId: 6035872082,
    },
    {
      category: 'ADVENTURE',
      title: 'Blox Fruits',
      accentColor: '#10b981',
      imageSrc: '/assets/images/games/blox-fruits.webp',
      universeId: 994732206,
    },
    {
      category: 'SIMULATOR',
      title: 'Ride a Pet',
      accentColor: '#06b6d4',
      imageSrc: '/assets/images/games/ride-a-pet.webp',
      universeId: 10035204815,
    },
    {
      category: 'SIMULATOR',
      title: 'Steal an Egg Kait...',
      accentColor: '#a855f7',
      imageSrc: '/assets/images/games/steal-an-egg.webp',
      universeId: 10563114921,
    },
  ];

  constructor(containerId: string) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.render();
    this.initEvents();
  }

  private render(): void {
    if (!this.container) return;

    // Render 3 sets of the 8 games for an ultra-smooth, continuous infinite loop
    const allGames = [...this.games, ...this.games, ...this.games];

    const cardsMarkup = allGames.map((game, idx) => `
      <div class="game-card" data-idx="${idx}" role="article" aria-label="${game.title} - ${game.category}">
        <div class="game-cover-wrapper" style="border-color: ${game.accentColor}40;">
          <picture>
            <source srcset="${game.imageSrc.replace(/\.(webp|png)$/, '.avif')}" type="image/avif">
            <source srcset="${game.imageSrc}" type="image/webp">
            <img
              src="${game.imageSrc}"
              alt="${game.title} Cover"
              class="game-cover-img"
              loading="lazy"
              width="68"
              height="68"
            />
          </picture>
        </div>
        <div class="game-info-col">
          <span class="game-category-tag" style="color: ${game.accentColor}; text-shadow: 0 0 10px ${game.accentColor}66;">${game.category}</span>
          <h3 class="game-title-text" title="${game.title}">${game.title}</h3>
        </div>
      </div>
    `).join('');

    this.container.innerHTML = `
      <div class="carousel-track" id="carousel-track">
        ${cardsMarkup}
      </div>
    `;

    this.track = document.getElementById('carousel-track');
    // Measure width after DOM layout settles
    requestAnimationFrame(() => {
      this.measureWidth();
    });
  }

  private measureWidth(): void {
    if (!this.track || this.track.children.length < this.games.length * 2) return;
    const cardFirst = this.track.children[0] as HTMLElement;
    const cardNextSet = this.track.children[this.games.length] as HTMLElement;
    if (cardFirst && cardNextSet) {
      this.setWidth = cardNextSet.offsetLeft - cardFirst.offsetLeft;
    }
  }

  private initEvents(): void {
    if (!this.container) return;

    // Smooth hover pause / deceleration
    this.container.addEventListener('mouseenter', () => { this.isHovered = true; }, { passive: true });
    this.container.addEventListener('mouseleave', () => { this.isHovered = false; }, { passive: true });
    this.container.addEventListener('touchstart', () => { this.isHovered = true; }, { passive: true });
    this.container.addEventListener('touchend', () => { this.isHovered = false; }, { passive: true });

    this.resizeHandler = () => {
      this.measureWidth();
    };
    window.addEventListener('resize', this.resizeHandler, { passive: true });

    // Performance: Only perform DOM transforms when carousel is near/in viewport
    this.observer = new IntersectionObserver((entries) => {
      for (const e of entries) {
        this.isVisible = e.isIntersecting;
      }
    }, { rootMargin: '200px 0px' });
    this.observer.observe(this.container);
  }

  /**
   * Called every frame from UnifiedLoop
   * Auto-scroll speed: slow, smooth glide (0.35px per frame at 60fps)
   * Completely skips DOM transforms when off-screen.
   */
  public update(_timeInSec?: number, delta?: number): void {
    if (!this.track || !this.isVisible) return;

    if (this.setWidth === 0) {
      this.measureWidth();
      if (this.setWidth === 0) return;
    }

    const dt = delta && delta > 0 ? Math.min(delta, 0.1) : 0.016;

    // Smoothly decelerate to 0 when hovered, smoothly accelerate to 0.35px glide
    const targetSpeed = this.isHovered ? 0 : 0.35;
    this.currentSpeed += (targetSpeed - this.currentSpeed) * 0.08;

    const speed = this.currentSpeed * (dt / 0.016);
    this.offset -= speed;

    // Seamless loop: when one full 8-game set has scrolled by, wrap back by setWidth
    if (Math.abs(this.offset) >= this.setWidth && this.setWidth > 0) {
      this.offset += this.setWidth;
    }

    this.track.style.transform = `translate3d(${this.offset}px, 0, 0)`;
  }

  public destroy(): void {
    this.observer?.disconnect();
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
    }
  }
}
