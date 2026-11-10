/**
 * DEDICATED PRICING PAGE
 * Snowy Studios (getsnowy.xyz)
 * Authentic recreation matching reference design 100%
 */

import '../styles/tokens.css';
import '../styles/base.css';
import '../styles/sections.css';
import '../styles/themes.css';
import '../styles/pages.css';
import '../styles/polar-night.css';

import { ThemeManager } from '../core/ThemeManager';
import { ScrollManager } from '../core/Scroll';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Theme Manager
  new ThemeManager();

  // 2. Initialize Smooth Scroll
  const scrollManager = new ScrollManager();
  window.addEventListener('pagehide', () => scrollManager.destroy(), { once: true });
  if (import.meta.hot) import.meta.hot.dispose(() => scrollManager.destroy());

  // 3. Header scroll state listener
  const header = document.getElementById('site-header');
  if (header) {
    scrollManager.instance.on('scroll', ({ scroll }: { scroll: number }) => {
      if (scroll > 30) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });

    // Fallback standard window scroll listener
    window.addEventListener('scroll', () => {
      if (window.scrollY > 30) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }, { passive: true });
  }
});
