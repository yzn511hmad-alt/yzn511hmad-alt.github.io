import type { ScrollManager } from './Scroll';
import type { ScopedTopoBackground } from '../webgl/ScopedTopoBackground';
import type { WaveMarquee } from '../components/WaveMarquee';
import type { GameCarousel } from '../components/GameCarousel';
import { onFrame } from './FrameLoop';

export class UnifiedLoop {
  private running = true;
  private unsubscribe: () => void;
  constructor(
    scroll: ScrollManager,
    private topo?: ScopedTopoBackground,
    private waveMarquee?: WaveMarquee,
    private gameCarousel?: GameCarousel,
  ) {
    this.unsubscribe = onFrame((time, delta) => {
      if (!this.running) return;
      this.topo?.update(time, delta, scroll.getVelocity(), scroll.getScroll());
      this.waveMarquee?.update(time, delta);
      this.gameCarousel?.update(time, delta);
    });
  }
  setWaveMarquee(value: WaveMarquee): void { this.waveMarquee = value; }
  setGameCarousel(value: GameCarousel): void { this.gameCarousel = value; }
  setTopo(value: ScopedTopoBackground): void { this.topo = value; }
  pause(): void { this.running = false; }
  resume(): void { this.running = true; }
  destroy(): void { this.unsubscribe(); }
}
