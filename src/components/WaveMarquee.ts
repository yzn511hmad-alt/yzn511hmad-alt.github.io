/**
 * WAVE MARQUEE COMPONENT
 * Section 01: Full-width horizontal sine-wave path with continuously traveling icon nodes
 * Snowy Studios (getsnowy.net)
 */

export interface WaveNode {
  title: string;
  iconSvg: string;
}

interface ActiveNodeItem {
  element: HTMLElement;
  x: number;
}

export class WaveMarquee {
  private container: HTMLElement | null = null;
  private track: HTMLElement | null = null;
  private activeNodes: ActiveNodeItem[] = [];
  private totalTrackWidth: number = 0;
  private time: number = 0;
  private currentSpeed: number = 0.45;
  private isHovered: boolean = false;
  private resizeHandler: (() => void) | null = null;

  private static readonly SPACING = 220;
  private static readonly WRAP_THRESHOLD = -120;

  // The 9 feature items in exact specified order
  private readonly nodes: WaveNode[] = [
    {
      title: 'Account protection',
      iconSvg: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/>',
    },
    {
      title: 'Secure by design',
      iconSvg: '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    },
    {
      title: '25+ supported games',
      iconSvg: '<rect x="2" y="6" width="20" height="12" rx="2"/><line x1="6" y1="12" x2="10" y2="12"/><line x1="8" y1="10" x2="8" y2="14"/><line x1="15" y1="13" x2="15.01" y2="13"/><line x1="18" y1="11" x2="18.01" y2="11"/>',
    },
    {
      title: 'Daily revisions',
      iconSvg: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
    },
    {
      title: '24/7 live support',
      iconSvg: '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>',
    },
    {
      title: 'One universal loader',
      iconSvg: '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>',
    },
    {
      title: 'High quality builds',
      iconSvg: '<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>',
    },
    {
      title: 'Fast to launch',
      iconSvg: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
    },
    {
      title: 'Premium access',
      iconSvg: '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>',
    },
  ];

  constructor(containerId: string) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.render();
    this.initEvents();
  }

  private generateWaveSvgPath(width: number): string {
    const centerY = 90;
    const amplitude = 28;
    const frequency = 0.0045;
    let d = `M 0 ${(centerY + Math.sin(0) * amplitude).toFixed(2)}`;
    for (let x = 12; x <= width; x += 12) {
      const y = centerY + Math.sin(x * frequency) * amplitude;
      d += ` L ${x} ${y.toFixed(2)}`;
    }
    return d;
  }

  private render(): void {
    if (!this.container) return;

    // Duplicate 9-item set so total width exceeds window.innerWidth + 600px
    const minWidthNeeded = window.innerWidth + 800;
    const singleSetWidth = this.nodes.length * WaveMarquee.SPACING;
    const repetitions = Math.max(3, Math.ceil(minWidthNeeded / singleSetWidth));

    const combinedNodes: WaveNode[] = [];
    for (let r = 0; r < repetitions; r++) {
      combinedNodes.push(...this.nodes);
    }

    this.totalTrackWidth = combinedNodes.length * WaveMarquee.SPACING;

    // Generate static SVG dashed wave path matching the mathematical formula
    const pathD = this.generateWaveSvgPath(Math.max(3600, this.totalTrackWidth + 400));

    this.container.innerHTML = `
      <div class="wave-marquee-header">DISCOVER SNOWY // CONTINUOUS ADVANTAGE</div>
      <div class="wave-track-viewport">
        <svg class="wave-bg-svg" viewBox="0 0 3600 180" preserveAspectRatio="none" aria-hidden="true">
          <path class="wave-path-line" d="${pathD}" />
        </svg>
        <div class="wave-nodes-track" id="wave-nodes-track"></div>
      </div>
    `;

    this.track = document.getElementById('wave-nodes-track');
    if (!this.track) return;

    this.activeNodes = [];

    // Create DOM element for each node and assign starting x
    combinedNodes.forEach((node, index) => {
      const el = document.createElement('div');
      el.className = 'wave-node-item';
      el.innerHTML = `
        <div class="wave-node-badge" aria-hidden="true">
          <svg class="wave-node-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            ${node.iconSvg}
          </svg>
        </div>
        <span class="wave-node-label">${node.title}</span>
      `;

      const startX = index * WaveMarquee.SPACING;
      this.track!.appendChild(el);
      this.activeNodes.push({
        element: el,
        x: startX,
      });
    });

    // Initial position pass
    this.updatePositions(0, 0);
  }

  private updatePositions(time: number, speed: number): void {
    for (let i = 0; i < this.activeNodes.length; i++) {
      const item = this.activeNodes[i];
      item.x -= speed;

      // Wrap when item moves past x < -120 to far right
      if (item.x < WaveMarquee.WRAP_THRESHOLD) {
        item.x += this.totalTrackWidth;
      }

      // Smooth mathematical sine-wave motion matching the background curve
      const waveY = Math.sin(item.x * 0.0045 + time * 0.6) * 28;
      item.element.style.transform = `translate3d(${item.x}px, ${waveY}px, 0)`;
    }
  }

  private initEvents(): void {
    if (!this.container) return;

    this.container.addEventListener('mouseenter', () => { this.isHovered = true; }, { passive: true });
    this.container.addEventListener('mouseleave', () => { this.isHovered = false; }, { passive: true });
    this.container.addEventListener('touchstart', () => { this.isHovered = true; }, { passive: true });
    this.container.addEventListener('touchend', () => { this.isHovered = false; }, { passive: true });

    this.resizeHandler = () => {
      if (window.innerWidth + 600 > this.totalTrackWidth) {
        this.render();
      }
    };
    window.addEventListener('resize', this.resizeHandler, { passive: true });
  }

  /**
   * Called every frame from UnifiedLoop
   */
  public update(timeInSec?: number, delta?: number): void {
    if (this.activeNodes.length === 0) return;

    const dt = delta && delta > 0 ? Math.min(delta, 0.1) : 0.016;
    this.time = timeInSec !== undefined ? timeInSec : this.time + dt;

    // Smooth deceleration / acceleration on hover
    const targetSpeed = this.isHovered ? 0 : 0.45;
    this.currentSpeed += (targetSpeed - this.currentSpeed) * 0.1;

    const speed = this.currentSpeed * (dt / 0.016);
    this.updatePositions(this.time, speed);
  }

  public destroy(): void {
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
    }
  }
}
