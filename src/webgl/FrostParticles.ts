/**
 * SUB-ZERO FLOATING FROST PARTICLES
 * Snowy Studios (getsnowy.net)
 * 
 * Cinematic, weightless micro-ice dust and crystalline frost motes drifting
 * in deep 3D perspective space behind sections 02-05 and footer.
 * Fully interactive with mouse parallax and scroll momentum.
 * Zero impact on the Hero section (strictly hidden when in Hero).
 */

interface FrostParticle {
  x: number;
  y: number;
  z: number; // 0.2 (distant) to 1.0 (foreground)
  size: number;
  baseAlpha: number;
  alpha: number;
  twinkleSpeed: number;
  twinkleOffset: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  type: 'mote' | 'crystal' | 'bokeh';
}

export class FrostParticles {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private particles: FrostParticle[] = [];
  private numParticles: number = 95;
  private width: number = window.innerWidth;
  private height: number = window.innerHeight;
  private mouseX: number = 0;
  private mouseY: number = 0;
  private targetMouseX: number = 0;
  private targetMouseY: number = 0;
  private scrollY: number = window.scrollY;
  private lastScrollY: number = window.scrollY;
  private scrollVelocity: number = 0;
  private heroHeight: number = window.innerHeight;
  private visibilityOpacity: number = 0;
  private isRunning: boolean = true;
  private animId: number = 0;

  constructor() {
    // 1. Create or query canvas
    let existing = document.getElementById('frost-particles-canvas') as HTMLCanvasElement;
    if (existing) {
      this.canvas = existing;
    } else {
      this.canvas = document.createElement('canvas');
      this.canvas.id = 'frost-particles-canvas';
      this.canvas.className = 'frost-particles-canvas';
      this.canvas.setAttribute('aria-hidden', 'true');
      document.body.prepend(this.canvas);
    }

    const ctx = this.canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get 2D context for FrostParticles');
    this.ctx = ctx;

    // 2. Setup Dimensions
    this.handleResize();
    this.initParticles();

    // 3. Attach Listeners
    window.addEventListener('resize', this.onResize, { passive: true });
    window.addEventListener('mousemove', this.onMouseMove, { passive: true });
    window.addEventListener('scroll', this.onScroll, { passive: true });

    // 4. Start RAF Loop
    this.tick();
  }

  private onResize = () => {
    this.handleResize();
  };

  private onMouseMove = (e: MouseEvent) => {
    const nx = (e.clientX / this.width) * 2 - 1;
    const ny = (e.clientY / this.height) * 2 - 1;
    this.targetMouseX = nx * 35; // 35px max parallax offset
    this.targetMouseY = ny * 35;
  };

  private onScroll = () => {
    this.scrollY = window.scrollY;
  };

  private handleResize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const hero = document.getElementById('hero');
    if (hero) {
      this.heroHeight = hero.offsetHeight;
    } else {
      this.heroHeight = this.height;
    }
  }

  private initParticles() {
    this.particles = [];
    for (let i = 0; i < this.numParticles; i++) {
      this.particles.push(this.createParticle(true));
    }
  }

  private createParticle(randomY: boolean = false): FrostParticle {
    const z = 0.25 + Math.random() * 0.75; // depth
    const rand = Math.random();

    let type: 'mote' | 'crystal' | 'bokeh';
    let size: number;
    let baseAlpha: number;

    if (rand < 0.70) {
      // Micro-ice motes
      type = 'mote';
      size = 0.8 + z * 1.5;
      baseAlpha = 0.20 + z * 0.45;
    } else if (rand < 0.90) {
      // Crystalline micro-flakes
      type = 'crystal';
      size = 2.0 + z * 2.5;
      baseAlpha = 0.35 + z * 0.45;
    } else {
      // Soft depth bokeh orbs in background
      type = 'bokeh';
      size = 6.0 + z * 10.0;
      baseAlpha = 0.04 + (1 - z) * 0.08;
    }

    return {
      type,
      x: Math.random() * this.width,
      y: randomY ? Math.random() * this.height : this.height + 20,
      z,
      size,
      baseAlpha,
      alpha: baseAlpha,
      twinkleSpeed: 0.8 + Math.random() * 2.2,
      twinkleOffset: Math.random() * Math.PI * 2,
      vx: (Math.random() - 0.5) * 0.25 * z,
      vy: -(0.18 + Math.random() * 0.35) * z, // gentle upward drift
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.02,
    };
  }

  private tick = () => {
    if (!this.isRunning) return;

    this.update();
    this.render();

    this.animId = requestAnimationFrame(this.tick);
  };

  private update() {
    // 1. Smooth mouse parallax interpolation
    this.mouseX += (this.targetMouseX - this.mouseX) * 0.05;
    this.mouseY += (this.targetMouseY - this.mouseY) * 0.05;

    // 2. Scroll velocity impulse
    const scrollDelta = this.scrollY - this.lastScrollY;
    this.lastScrollY = this.scrollY;
    this.scrollVelocity += (scrollDelta * 0.04 - this.scrollVelocity) * 0.1;

    // 3. Visibility fade: strictly hidden when in Hero section
    // Starts fading in when scroll passes 40% of Hero, fully visible at 85%
    const fadeStart = this.heroHeight * 0.35;
    const fadeEnd = this.heroHeight * 0.85;
    let targetOpacity = 0;

    if (this.scrollY > fadeStart) {
      targetOpacity = Math.min((this.scrollY - fadeStart) / (fadeEnd - fadeStart), 1);
    }
    this.visibilityOpacity += (targetOpacity - this.visibilityOpacity) * 0.08;

    if (this.visibilityOpacity < 0.005) {
      this.visibilityOpacity = 0;
      return; // Save draw calls while in hero section
    }

    // 4. Update each particle
    const now = performance.now() * 0.001;
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];

      // Drift motion
      p.x += p.vx + Math.sin(now * 0.5 + p.twinkleOffset) * 0.12 * p.z;
      p.y += p.vy - this.scrollVelocity * p.z;
      p.rotation += p.rotationSpeed;

      // Subtle twinkle
      const twinkle = Math.sin(now * p.twinkleSpeed + p.twinkleOffset);
      p.alpha = Math.max(0.05, p.baseAlpha * (0.75 + 0.35 * twinkle));

      // Wrap around screen edges
      if (p.y < -30) {
        p.y = this.height + 20;
        p.x = Math.random() * this.width;
      } else if (p.y > this.height + 30) {
        p.y = -20;
        p.x = Math.random() * this.width;
      }

      if (p.x < -30) p.x = this.width + 20;
      else if (p.x > this.width + 30) p.x = -20;
    }
  }

  private render() {
    if (this.visibilityOpacity <= 0) {
      this.ctx.clearRect(0, 0, this.width, this.height);
      return;
    }

    this.ctx.clearRect(0, 0, this.width, this.height);

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      // Parallax position
      const px = p.x + this.mouseX * p.z;
      const py = p.y + this.mouseY * p.z;
      const finalAlpha = p.alpha * this.visibilityOpacity;

      if (finalAlpha <= 0.005) continue;

      if (p.type === 'mote') {
        // Crisp micro ice mote
        this.ctx.beginPath();
        this.ctx.arc(px, py, p.size, 0, Math.PI * 2);
        this.ctx.fillStyle = `rgba(215, 235, 255, ${finalAlpha})`;
        this.ctx.fill();
      } else if (p.type === 'crystal') {
        // Diamond crystalline flake
        this.ctx.save();
        this.ctx.translate(px, py);
        this.ctx.rotate(p.rotation);
        
        this.ctx.beginPath();
        this.ctx.moveTo(0, -p.size);
        this.ctx.lineTo(p.size * 0.55, 0);
        this.ctx.lineTo(0, p.size);
        this.ctx.lineTo(-p.size * 0.55, 0);
        this.ctx.closePath();

        // Shimmering Frost Blue crystalline tint
        this.ctx.fillStyle = `rgba(96, 165, 250, ${finalAlpha})`;
        this.ctx.fill();

        // Crisp micro center point
        this.ctx.fillStyle = `rgba(255, 255, 255, ${finalAlpha * 1.2})`;
        this.ctx.fillRect(-0.75, -0.75, 1.5, 1.5);
        this.ctx.restore();
      } else if (p.type === 'bokeh') {
        // Deep background bokeh orb
        const grad = this.ctx.createRadialGradient(px, py, 0, px, py, p.size);
        grad.addColorStop(0, `rgba(96, 165, 250, ${finalAlpha * 1.4})`);
        grad.addColorStop(0.5, `rgba(59, 130, 246, ${finalAlpha * 0.5})`);
        grad.addColorStop(1, 'rgba(4, 10, 24, 0)');

        this.ctx.beginPath();
        this.ctx.arc(px, py, p.size, 0, Math.PI * 2);
        this.ctx.fillStyle = grad;
        this.ctx.fill();
      }
    }
  }

  public destroy() {
    this.isRunning = false;
    cancelAnimationFrame(this.animId);
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('scroll', this.onScroll);
    if (this.canvas && this.canvas.parentElement) {
      this.canvas.parentElement.removeChild(this.canvas);
    }
  }
}
