/**
 * DEDICATED SCRIPTS CATALOG PAGE — 3D PARALLAX TILT CINEMATIC CARDS GRID
 * Snowy Studios (getsnowy.net)
 */

import '../styles/tokens.css';
import '../styles/base.css';
import '../styles/sections.css';
import '../styles/themes.css';
import '../styles/pages.css';
import '../styles/polar-night.css';

import gsap from 'gsap';
import { ThemeManager } from '../core/ThemeManager';
import { ScrollManager } from '../core/Scroll';
import { SCRIPTS_DATA, ScriptItem } from '../data/scriptsData';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Theme Manager
  new ThemeManager();

  // 2. Smooth Scroll
  const scrollManager = new ScrollManager();
  window.addEventListener('pagehide', () => scrollManager.destroy(), { once: true });
  if (import.meta.hot) import.meta.hot.dispose(() => scrollManager.destroy());

  // 3. Header scroll state
  const header = document.getElementById('site-header');
  if (header) {
    scrollManager.instance.on('scroll', ({ scroll }: { scroll: number }) => {
      if (scroll > 40) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });
  }

  // 4. Catalog State
  let activeCategory = 'ALL';
  let searchTerm = '';
  let activeInspectGame: ScriptItem | null = null;

  // DOM Elements
  const gridContainer = document.getElementById('scripts-grid') as HTMLDivElement | null;
  const resultsCountEl = document.getElementById('results-count') as HTMLElement | null;
  const searchInput = document.getElementById('script-search-input') as HTMLInputElement | null;
  const searchClearBtn = document.getElementById('search-clear-btn') as HTMLButtonElement | null;
  const categoryPills = document.querySelectorAll<HTMLButtonElement>('.category-pill-btn');

  // Modal Elements
  const inspectModalBackdrop = document.getElementById('inspect-modal') as HTMLDivElement | null;
  const inspectModalContainer = document.getElementById('inspect-modal-container') as HTMLDivElement | null;

  // Toast Element
  const copyToast = document.getElementById('copy-toast') as HTMLDivElement | null;
  const copyToastMsg = document.getElementById('copy-toast-msg') as HTMLElement | null;
  let toastTimeout: number | undefined;

  const showToast = (message: string) => {
    if (!copyToast) return;
    if (copyToastMsg) copyToastMsg.textContent = message;
    copyToast.classList.add('visible');
    window.clearTimeout(toastTimeout);
    toastTimeout = window.setTimeout(() => {
      copyToast.classList.remove('visible');
    }, 2400);
  };

  // Robust Clipboard Copy with Immediate Visual Feedback
  const copyToClipboard = async (text: string, label: string, buttonEl?: HTMLElement) => {
    let success = false;

    // Method 1: Async Clipboard API
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        success = true;
      }
    } catch (e) {
      console.warn('Clipboard API error, trying fallback:', e);
    }

    // Method 2: Document execCommand fallback
    if (!success) {
      try {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        success = document.execCommand('copy');
        document.body.removeChild(textarea);
      } catch (err) {
        console.error('Fallback copy failed:', err);
      }
    }

    if (success) {
      showToast(`${label} copied to clipboard!`);
      if (buttonEl) {
        const originalContent = buttonEl.innerHTML;
        buttonEl.classList.add('copied');
        buttonEl.innerHTML = '<span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-1px;margin-right:4px;"><polyline points="20 6 9 17 4 12"></polyline></svg> Copied!</span>';
        setTimeout(() => {
          buttonEl.classList.remove('copied');
          buttonEl.innerHTML = originalContent;
        }, 2000);
      }
    } else {
      showToast('Failed to copy to clipboard');
    }
  };

  // 5. Filter Logic
  const getFilteredGames = (): ScriptItem[] => {
    return SCRIPTS_DATA.filter((game) => {
      const matchesCategory =
        activeCategory === 'ALL' || game.category.toUpperCase() === activeCategory;

      if (!matchesCategory) return false;
      if (!searchTerm) return true;

      const titleMatch = game.title.toLowerCase().includes(searchTerm);
      const genreMatch = game.subGenre.toLowerCase().includes(searchTerm);
      const featureMatch =
        game.previewFeatures.some((f) => f.toLowerCase().includes(searchTerm)) ||
        game.freeFeatures.some((f) => f.toLowerCase().includes(searchTerm)) ||
        game.premiumFeatures.some((f) => f.toLowerCase().includes(searchTerm));

      return titleMatch || genreMatch || featureMatch;
    });
  };

  // 6. 3D Parallax Tilt Physics Engine (Locked 60 FPS via rAF)
  const attachTiltEffect = (cardWrapper: HTMLElement) => {
    const cardInner = cardWrapper.querySelector<HTMLElement>('.tilt-card-inner');
    if (!cardInner) return;

    let rafId: number | null = null;
    let targetRotateX = 0;
    let targetRotateY = 0;
    let targetGlareX = 50;
    let targetGlareY = 50;
    let isHovering = false;

    const maxTilt = 10; // Maximum rotation angle in degrees

    const updateTransform = () => {
      if (isHovering) {
        cardInner.style.setProperty('--rotate-x', `${targetRotateX.toFixed(2)}deg`);
        cardInner.style.setProperty('--rotate-y', `${targetRotateY.toFixed(2)}deg`);
        cardInner.style.setProperty('--scale', '1.02');
        cardInner.style.setProperty('--mouse-x', `${targetGlareX.toFixed(1)}%`);
        cardInner.style.setProperty('--mouse-y', `${targetGlareY.toFixed(1)}%`);
        cardInner.style.setProperty('--glare-opacity', '1');
      } else {
        cardInner.style.setProperty('--rotate-x', '0deg');
        cardInner.style.setProperty('--rotate-y', '0deg');
        cardInner.style.setProperty('--scale', '1');
        cardInner.style.setProperty('--glare-opacity', '0');
      }
      rafId = null;
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = cardWrapper.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const normX = (e.clientX - centerX) / (rect.width / 2);
      const normY = (e.clientY - centerY) / (rect.height / 2);

      // Clamp normalized values between -1 and 1
      const clampedX = Math.max(-1, Math.min(1, normX));
      const clampedY = Math.max(-1, Math.min(1, normY));

      targetRotateX = -clampedY * maxTilt;
      targetRotateY = clampedX * maxTilt;

      targetGlareX = ((e.clientX - rect.left) / rect.width) * 100;
      targetGlareY = ((e.clientY - rect.top) / rect.height) * 100;

      if (!rafId) {
        rafId = requestAnimationFrame(updateTransform);
      }
    };

    const onMouseEnter = () => {
      isHovering = true;
      cardInner.style.transition = 'none';
    };

    const onMouseLeave = () => {
      isHovering = false;
      cardInner.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.25s ease, box-shadow 0.25s ease';
      if (!rafId) {
        rafId = requestAnimationFrame(updateTransform);
      }
    };

    cardWrapper.addEventListener('mouseenter', onMouseEnter);
    cardWrapper.addEventListener('mousemove', onMouseMove);
    cardWrapper.addEventListener('mouseleave', onMouseLeave);
  };

  // 7. Render 3D Cinematic Cards Grid
  const renderGrid = () => {
    if (!gridContainer) return;

    const filtered = getFilteredGames();

    // Update Counter
    if (resultsCountEl) {
      resultsCountEl.textContent = `${filtered.length}`;
    }

    if (filtered.length === 0) {
      gridContainer.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem;">
          <div style="font-family: var(--font-display); font-size: 1.25rem; font-weight: 700; color: #edf1f8; margin-bottom: 8px;">
            No scripts found
          </div>
          <p style="color: #8d9ab0; font-size: 0.9rem;">
            No matching titles or features found for "${searchTerm}". Try resetting filters.
          </p>
        </div>
      `;
      return;
    }

    gridContainer.innerHTML = filtered
      .map((game) => {
        const version = game.version || 'V3.4';
        const displayedFeatures = game.previewFeatures.slice(0, 5);
        const moreCount = game.previewFeatures.length - displayedFeatures.length;

        return `
          <div class="tilt-card-wrapper" data-id="${game.id}">
            <article class="tilt-card-inner">
              <!-- Specular Holographic Glare Sheen Layer -->
              <div class="tilt-card-glare" aria-hidden="true"></div>

              <!-- Cinematic Game Banner (16:9 / 200px) -->
              <div class="card-banner-wrap">
                <picture>
                  <source srcset="${game.thumbnail.replace(/\.(webp|png)$/, '.avif')}" type="image/avif">
                  <source srcset="${game.thumbnail.replace(/\.png$/, '.webp')}" type="image/webp">
                  <img
                    src="${game.thumbnail}"
                    alt="${game.title}"
                    class="card-banner-img"
                    loading="lazy"
                    width="400"
                    height="200"
                    onerror="this.src='/assets/images/roblox-covers/${game.id}.png'"
                  />
                </picture>
                <div class="card-banner-gradient" aria-hidden="true"></div>

                <!-- Top Pinned Badges -->
                <div class="card-pinned-badges">
                  <span class="card-cat-badge">${game.category}</span>
                  <span class="card-status-badge">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="#10b981" class="shield-micro-icon" aria-hidden="true">
                      <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3z"></path>
                    </svg>
                    <span>UNDETECTED • ${version}</span>
                  </span>
                </div>
              </div>

              <!-- Card Body & Content -->
              <div class="card-content-body">
                <div>
                  <h3 class="card-game-title" data-id="${game.id}" title="Click to view full feature breakdown">${game.title}</h3>
                  <div class="card-game-subgenre">${game.subGenre}</div>
                </div>

                <!-- Feature Tags Matrix -->
                <div class="card-features-matrix" aria-label="Key features">
                  ${displayedFeatures
                    .map((feat) => `<span class="feature-chip">${feat}</span>`)
                    .join('')}
                  ${
                    moreCount > 0
                      ? `<span class="feature-chip more">+${moreCount} more</span>`
                      : ''
                  }
                </div>

                <!-- Stats Row with Clear FREE vs PREMIUM Badges and Milliseconds Latency Pill -->
                <div class="card-stats-row">
                  <div class="card-stats-breakdown">
                    <span class="badge-free-feat">${game.freeFeatures.length} FREE</span>
                    <span class="badge-prem-feat">${game.premiumFeatures.length} PRO</span>
                  </div>
                  <span class="card-latency-tag">${game.latency || '< 12ms'}</span>
                </div>

                <!-- Interactive Action Bar -->
                <div class="card-action-bar">
                  <button class="btn-card-copy" data-id="${game.id}" aria-label="Copy ${game.title} loadstring">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                    <span>Copy Loadstring</span>
                  </button>
                  <button class="btn-card-inspect" data-id="${game.id}" aria-label="Inspect ${game.title} features">
                    <span>Inspect</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M5 12h14m-7-7l7 7-7 7"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </article>
          </div>
        `;
      })
      .join('');

    // Dedicated Functional Click Handlers with strict event decoupling
    const handleCopy = (e: MouseEvent, loadstring: string, title: string, buttonEl?: HTMLElement) => {
      e.stopPropagation(); // Prevent card tilt interference
      copyToClipboard(loadstring, `${title} loadstring`, buttonEl);
    };

    const handleInspect = (e: MouseEvent, gameData: ScriptItem) => {
      e.stopPropagation(); // Prevent card tilt interference
      openInspectModal(gameData);
    };

    // Direct Click Bindings to unblock all button actions 100%
    gridContainer.querySelectorAll<HTMLButtonElement>('.btn-card-copy').forEach((btn) => {
      btn.onclick = (e) => {
        const gameId = btn.getAttribute('data-id');
        const game = SCRIPTS_DATA.find((g) => g.id === gameId);
        if (game) {
          handleCopy(e, game.loadstring, game.title, btn);
        }
      };
    });

    gridContainer.querySelectorAll<HTMLButtonElement>('.btn-card-inspect').forEach((btn) => {
      btn.onclick = (e) => {
        const gameId = btn.getAttribute('data-id');
        const game = SCRIPTS_DATA.find((g) => g.id === gameId);
        if (game) {
          handleInspect(e, game);
        }
      };
    });

    gridContainer.querySelectorAll<HTMLElement>('.card-game-title').forEach((title) => {
      title.onclick = (e) => {
        const gameId = title.getAttribute('data-id');
        const game = SCRIPTS_DATA.find((g) => g.id === gameId);
        if (game) {
          handleInspect(e, game);
        }
      };
    });

    // Attach 3D tilt physics to each card wrapper
    const cardWrappers = gridContainer.querySelectorAll<HTMLElement>('.tilt-card-wrapper');
    cardWrappers.forEach((card) => {
      attachTiltEffect(card);
    });

    // Animate cards appearance smoothly
    gsap.fromTo(
      cardWrappers,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.35, stagger: 0.03, ease: 'power2.out' }
    );
  };

  // 8. Inspect Features Modal Controller (Full Feature Breakdown)
  let isClosingModal = false;

  const openInspectModal = (game: ScriptItem) => {
    if (!inspectModalBackdrop || !inspectModalContainer) return;
    activeInspectGame = game;
    isClosingModal = false;

    renderModalContent();
    inspectModalBackdrop.classList.add('is-open');
    inspectModalBackdrop.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Animate modal open smoothly via GSAP
    gsap.killTweensOf(inspectModalContainer);
    gsap.fromTo(
      inspectModalContainer,
      { scale: 0.95, opacity: 0, y: 14 },
      { scale: 1, opacity: 1, y: 0, duration: 0.28, ease: 'power2.out' }
    );
  };

  const closeInspectModal = () => {
    if (!inspectModalBackdrop || !inspectModalContainer) return;
    if (isClosingModal) return;
    isClosingModal = true;

    gsap.to(inspectModalContainer, {
      scale: 0.95,
      opacity: 0,
      y: 12,
      duration: 0.22,
      ease: 'power2.in',
      onComplete: () => {
        inspectModalBackdrop.classList.remove('is-open');
        inspectModalBackdrop.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        activeInspectGame = null;
        isClosingModal = false;
      },
    });
  };

  const renderModalContent = () => {
    if (!inspectModalContainer || !activeInspectGame) return;
    const game = activeInspectGame;

    const totalFeatures = game.freeFeatures.length + game.premiumFeatures.length;
    const version = game.version || 'V3.4';
    const latency = game.latency || '< 12ms';
    const bypassStatus = game.bypassStatus || '100% Undetected';
    const activeUsers = game.activeUsers || '1,820 Online';

    inspectModalContainer.innerHTML = `
      <!-- Sleek Circular Glass Close Button -->
      <button class="inspect-modal-close" id="modal-close-btn" aria-label="Close feature inspect modal">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>

      <!-- Banner Header -->
      <div class="inspect-banner-box">
        <div class="inspect-banner-backdrop" style="background-image: url('${game.thumbnail}');"></div>
        <picture>
          <source srcset="${game.thumbnail.replace(/\.(webp|png)$/, '.avif')}" type="image/avif">
          <source srcset="${game.thumbnail.replace(/\.png$/, '.webp')}" type="image/webp">
          <img
            src="${game.thumbnail}"
            alt="${game.title}"
            class="inspect-game-thumb"
            width="76"
            height="76"
          />
        </picture>
        <div class="inspect-title-wrap">
          <h2 class="inspect-game-title">${game.title}</h2>
          <div class="inspect-meta-badges">
            <span class="card-cat-badge">${game.category}</span>
            <span class="card-status-badge">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="#10b981" class="shield-micro-icon" aria-hidden="true">
                <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3z"></path>
              </svg>
              <span>${bypassStatus} • ${version}</span>
            </span>
          </div>
        </div>
      </div>

      <!-- Telemetry Metrics Bar with Crisp Vector Icons -->
      <div class="inspect-metrics-bar">
        <div class="inspect-metric-item">
          <span class="inspect-metric-label">Execution Speed</span>
          <span class="inspect-metric-val">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="metric-svg-icon" aria-hidden="true">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
            </svg>
            <span>${latency} (Zero-Delay)</span>
          </span>
        </div>
        <div class="inspect-metric-item">
          <span class="inspect-metric-label">Bypass Status</span>
          <span class="inspect-metric-val green">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="metric-svg-icon" aria-hidden="true">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              <path d="m9 12 2 2 4-4"></path>
            </svg>
            <span>${bypassStatus}</span>
          </span>
        </div>
        <div class="inspect-metric-item">
          <span class="inspect-metric-label">Active Users</span>
          <span class="inspect-metric-val white">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#818cf8" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="metric-svg-icon" aria-hidden="true">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            <span>${activeUsers}</span>
          </span>
        </div>
        <div class="inspect-metric-item">
          <span class="inspect-metric-label">Total Capabilities</span>
          <span class="inspect-metric-val purple">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="metric-svg-icon" aria-hidden="true">
              <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
              <polyline points="2 17 12 22 22 17"></polyline>
              <polyline points="2 12 12 17 22 12"></polyline>
            </svg>
            <span>${totalFeatures} Features</span>
          </span>
        </div>
      </div>

      <!-- Dual-Column Vibrant Feature Breakdown (FREE vs PREMIUM) -->
      <div class="inspect-sections-grid">
        <!-- Left Column: FREE Features -->
        <div class="inspect-section-col free-col">
          <div class="inspect-col-header">
            <span class="inspect-col-title-badge free">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>FREE FEATURES</span>
            </span>
            <span class="inspect-col-count">${game.freeFeatures.length} Available</span>
          </div>
          <ul class="inspect-feature-list">
            ${game.freeFeatures
              .map(
                (feat) => `
              <li class="inspect-feature-item">
                <span class="inspect-feature-icon free" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="m9 12 2 2 4-4"></path>
                  </svg>
                </span>
                <span class="inspect-feature-text">${feat}</span>
              </li>
            `
              )
              .join('')}
          </ul>
        </div>

        <!-- Right Column: PREMIUM Features -->
        <div class="inspect-section-col prem-col">
          <div class="inspect-col-header">
            <span class="inspect-col-title-badge prem">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.26A2 2 0 0 1 17.22 17.75H6.78a2 2 0 0 1-1.928-1.471L2.019 6.02a.5.5 0 0 1 .798-.519l4.277 3.664a1 1 0 0 0 1.516-.294z"></path>
                <path d="M5 21h14"></path>
              </svg>
              <span>PREMIUM FEATURES</span>
            </span>
            <span class="inspect-col-count">${game.premiumFeatures.length} Pro Locked</span>
          </div>
          <ul class="inspect-feature-list">
            ${game.premiumFeatures
              .map(
                (feat) => `
              <li class="inspect-feature-item prem-item">
                <span class="inspect-feature-icon prem" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c084fc" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.26A2 2 0 0 1 17.22 17.75H6.78a2 2 0 0 1-1.928-1.471L2.019 6.02a.5.5 0 0 1 .798-.519l4.277 3.664a1 1 0 0 0 1.516-.294z"></path>
                    <path d="M5 21h14"></path>
                  </svg>
                </span>
                <span class="inspect-feature-text is-premium">${feat}</span>
              </li>
            `
              )
              .join('')}
          </ul>
        </div>
      </div>

      <!-- Action & Execution Deck -->
      <div class="inspect-action-deck">
        <div class="inspect-code-box">
          <div class="inspect-code-header">
            <span>EXECUTOR LOADSTRING</span>
            <span class="snippet-lang">LUA</span>
          </div>
          <code class="inspect-code-content" id="modal-code-snippet">${game.loadstring}</code>
        </div>
        <div class="inspect-btn-row">
          <button class="btn-inspect-copy" id="modal-copy-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            <span>Copy Loadstring</span>
          </button>
          <a href="/pricing.html" class="btn-inspect-prem">
            <span>Get Premium Key</span>
            <span>→</span>
          </a>
        </div>
      </div>
    `;

    // Modal Events
    const closeBtn = document.getElementById('modal-close-btn');
    const copyBtn = document.getElementById('modal-copy-btn');
    const snippetCode = document.getElementById('modal-code-snippet');

    closeBtn?.addEventListener('click', closeInspectModal);

    copyBtn?.addEventListener('click', () => {
      copyToClipboard(game.loadstring, `${game.title} loadstring`, copyBtn);
    });

    snippetCode?.addEventListener('click', () => {
      copyToClipboard(game.loadstring, `${game.title} loadstring`, copyBtn || undefined);
    });
  };

  // 9. Delegated Events on Grid Container
  if (gridContainer) {
    gridContainer.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;

      // Handle Copy Loadstring button
      const copyBtn = target.closest<HTMLButtonElement>('.btn-card-copy');
      if (copyBtn) {
        e.preventDefault();
        e.stopPropagation();
        const gameId = copyBtn.getAttribute('data-id');
        const game = SCRIPTS_DATA.find((g) => g.id === gameId);
        if (game) {
          copyToClipboard(game.loadstring, `${game.title} loadstring`, copyBtn);
        }
        return;
      }

      // Handle Inspect button or card title click
      const inspectBtn = target.closest<HTMLButtonElement>('.btn-card-inspect');
      const cardTitle = target.closest<HTMLElement>('.card-game-title');
      if (inspectBtn || cardTitle) {
        e.preventDefault();
        e.stopPropagation();
        const cardWrapper = target.closest<HTMLElement>('.tilt-card-wrapper');
        const gameId = cardWrapper?.getAttribute('data-id') || inspectBtn?.getAttribute('data-id') || cardTitle?.getAttribute('data-id');
        const game = SCRIPTS_DATA.find((g) => g.id === gameId);
        if (game) {
          openInspectModal(game);
        }
        return;
      }
    });
  }

  // Close modal on click outside
  if (inspectModalBackdrop) {
    inspectModalBackdrop.addEventListener('click', (e) => {
      if (e.target === inspectModalBackdrop) {
        closeInspectModal();
      }
    });
  }

  // Close modal on Escape key
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && inspectModalBackdrop?.classList.contains('is-open')) {
      closeInspectModal();
    }
  });

  // 10. Search Input Events
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchTerm = (e.target as HTMLInputElement).value.trim().toLowerCase();
      if (searchClearBtn) {
        searchClearBtn.classList.toggle('visible', searchTerm.length > 0);
      }
      renderGrid();
    });
  }

  if (searchClearBtn && searchInput) {
    searchClearBtn.addEventListener('click', () => {
      searchInput.value = '';
      searchTerm = '';
      searchClearBtn.classList.remove('visible');
      searchInput.focus();
      renderGrid();
    });
  }

  // 11. Category Filter Pills
  categoryPills.forEach((pill) => {
    pill.addEventListener('click', () => {
      categoryPills.forEach((p) => {
        p.classList.remove('active');
        p.setAttribute('aria-selected', 'false');
      });
      pill.classList.add('active');
      pill.setAttribute('aria-selected', 'true');
      activeCategory = (pill.getAttribute('data-category') || 'ALL').toUpperCase();
      renderGrid();
    });
  });

  // 12. Dynamic Real-Time Calculated Metrics (Derives directly from SCRIPTS_DATA)
  const initHeroMetrics = () => {
    const totalGames = SCRIPTS_DATA.length;
    const totalFree = SCRIPTS_DATA.reduce((acc, g) => acc + g.freeFeatures.length, 0);
    const totalPremium = SCRIPTS_DATA.reduce((acc, g) => acc + g.premiumFeatures.length, 0);

    const heroEyebrow = document.getElementById('hero-eyebrow-tag');
    if (heroEyebrow) heroEyebrow.textContent = `CATALOG // ${totalGames} SUPPORTED GAMES`;

    const supportedGamesEl = document.getElementById('metric-supported-games');
    if (supportedGamesEl) supportedGamesEl.textContent = `${totalGames}`;

    const freeFeaturesEl = document.getElementById('metric-free-features');
    if (freeFeaturesEl) freeFeaturesEl.textContent = `${totalFree}`;

    const premFeaturesEl = document.getElementById('metric-prem-features');
    if (premFeaturesEl) premFeaturesEl.textContent = `${totalPremium}`;

    const detectionsEl = document.getElementById('metric-detections');
    if (detectionsEl) detectionsEl.textContent = '0';
  };

  // Initial Render
  initHeroMetrics();
  renderGrid();
});
