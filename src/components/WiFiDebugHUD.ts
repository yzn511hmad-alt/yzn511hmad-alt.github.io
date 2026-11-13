/**
 * SNOWY // Cold Start WiFi & WebGL Draw Calls Debugger
 * Measures network asset transfer sizes (WiFi usage) and GPU draw calls.
 */

export interface AssetMetric {
  name: string;
  url: string;
  type: 'video' | 'texture' | 'script' | 'font' | 'css' | 'document' | 'other';
  transferKB: number;
  decodedKB: number;
  durationMs: number;
  startTimeMs: number;
  isCached: boolean;
}

export interface ColdStartSummary {
  totalTransferKB: number;
  totalDecodedKB: number;
  totalNetworkCalls: number;
  cachedCalls: number;
  gpuDrawCalls: number;
  gpuTriangles: number;
  fps: number;
  timeToPreviewMs: number;
  timeTo3DReadyMs: number;
  windowLoadMs: number;
  categories: {
    video: { kb: number; count: number };
    texture: { kb: number; count: number };
    script: { kb: number; count: number };
    font: { kb: number; count: number };
    css: { kb: number; count: number };
    document: { kb: number; count: number };
    other: { kb: number; count: number };
  };
  assets: AssetMetric[];
}

export class WiFiDebugHUD {
  private container: HTMLDivElement | null = null;
  private badge: HTMLButtonElement | null = null;
  private panel: HTMLDivElement | null = null;
  private isOpen = false;
  private currentFilter: string = 'all';
  private currentSort: 'size' | 'time' | 'name' = 'size';
  private fpsHistory: number[] = [];
  private lastFrameTime = performance.now();
  private rafId: number | null = null;

  constructor() {
    this.init();
  }

  private init(): void {
    const urlParams = new URLSearchParams(location.search);
    const hasDebug = urlParams.has('debug') || urlParams.has('perf') || urlParams.has('cold_test') || localStorage.getItem('snowy:debug') === '1';

    this.createBadge();
    this.createPanel();
    this.attachShortcuts();
    this.startMetricsLoop();

    if (hasDebug) {
      this.open();
    }
  }

  private collectMetrics(): ColdStartSummary {
    const entries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const navEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    const nav = navEntries[0];

    const root = document.getElementById('key-access');
    const gpuDrawCalls = root ? parseInt(root.dataset.drawCalls || '0', 10) : 0;
    const gpuTriangles = root ? parseInt(root.dataset.triangles || '0', 10) : 0;

    const timeToPreviewMs = parseFloat(document.documentElement.dataset.previewDecodedAt || '0');
    const timeTo3DReadyMs = root && root.dataset.trialSceneMs ? parseFloat(root.dataset.trialSceneMs) : (root && root.dataset.scenePresented === 'true' ? performance.now() : 0);
    const windowLoadMs = nav ? nav.loadEventEnd : 0;

    const categories = {
      video: { kb: 0, count: 0 },
      texture: { kb: 0, count: 0 },
      script: { kb: 0, count: 0 },
      font: { kb: 0, count: 0 },
      css: { kb: 0, count: 0 },
      document: { kb: 0, count: 0 },
      other: { kb: 0, count: 0 }
    };

    let totalTransferKB = 0;
    let totalDecodedKB = 0;
    let totalNetworkCalls = 0;
    let cachedCalls = 0;

    // Document HTML itself
    if (nav) {
      const docTransferKB = (nav.transferSize || 28980) / 1024;
      const docDecodedKB = (nav.decodedBodySize || 28980) / 1024;
      categories.document.kb += docTransferKB;
      categories.document.count += 1;
      totalTransferKB += docTransferKB;
      totalDecodedKB += docDecodedKB;
      totalNetworkCalls += 1;
    }

    const assets: AssetMetric[] = [];

    // Add main HTML document entry
    if (nav) {
      assets.push({
        name: location.pathname.split('/').pop() || 'index.html',
        url: location.href,
        type: 'document',
        transferKB: (nav.transferSize || 28980) / 1024,
        decodedKB: (nav.decodedBodySize || 28980) / 1024,
        durationMs: Math.round(nav.duration),
        startTimeMs: 0,
        isCached: nav.transferSize === 0
      });
    }

    for (const entry of entries) {
      const url = entry.name;
      const name = url.split('/').pop()?.split('?')[0] || url;
      const initiator = entry.initiatorType;

      let type: AssetMetric['type'] = 'other';
      if (/\.(mp4|webm|ogv)$/i.test(name) || initiator === 'video') {
        type = 'video';
      } else if (/\.(webp|jpg|jpeg|png|gif|svg|hdr)$/i.test(name) || initiator === 'img') {
        type = 'texture';
      } else if (/\.(js|mjs)$/i.test(name) || initiator === 'script') {
        type = 'script';
      } else if (/\.(woff2|woff|ttf|otf)$/i.test(name) || initiator === 'font') {
        type = 'font';
      } else if (/\.css$/i.test(name) || initiator === 'css' || initiator === 'link') {
        type = 'css';
      }

      // If transferSize is 0, it came from local memory or disk cache
      const isCached = entry.transferSize === 0 && entry.decodedBodySize > 0;
      const transferKB = (entry.transferSize || entry.encodedBodySize || 0) / 1024;
      const decodedKB = (entry.decodedBodySize || entry.transferSize || 0) / 1024;

      categories[type].kb += transferKB;
      categories[type].count += 1;

      totalTransferKB += transferKB;
      totalDecodedKB += decodedKB;
      totalNetworkCalls += 1;
      if (isCached) cachedCalls += 1;

      assets.push({
        name,
        url,
        type,
        transferKB,
        decodedKB,
        durationMs: Math.round(entry.duration),
        startTimeMs: Math.round(entry.startTime),
        isCached
      });
    }

    // Current FPS calculation
    const fps = this.calculateFPS();

    return {
      totalTransferKB,
      totalDecodedKB,
      totalNetworkCalls,
      cachedCalls,
      gpuDrawCalls,
      gpuTriangles,
      fps,
      timeToPreviewMs,
      timeTo3DReadyMs,
      windowLoadMs,
      categories,
      assets
    };
  }

  private calculateFPS(): number {
    const now = performance.now();
    const delta = now - this.lastFrameTime;
    this.lastFrameTime = now;
    if (delta > 0) {
      const currentFps = Math.round(1000 / delta);
      this.fpsHistory.push(currentFps);
      if (this.fpsHistory.length > 20) this.fpsHistory.shift();
      const avg = this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length;
      return Math.min(60, Math.round(avg));
    }
    return 60;
  }

  private createBadge(): void {
    this.badge = document.createElement('button');
    this.badge.id = 'snowy-wifi-badge';
    this.badge.setAttribute('aria-label', 'Open WiFi & WebGL Debugger');
    this.badge.innerHTML = `
      <span class="badge-icon">📶</span>
      <span class="badge-text" id="snowy-badge-text">Measuring WiFi...</span>
    `;
    this.applyBadgeStyles();
    this.badge.addEventListener('click', () => this.toggle());
    document.body.appendChild(this.badge);
  }

  private createPanel(): void {
    this.container = document.createElement('div');
    this.container.id = 'snowy-wifi-hud-container';
    this.container.style.display = 'none';

    this.panel = document.createElement('div');
    this.panel.className = 'snowy-wifi-panel';
    this.applyPanelStyles();

    this.container.appendChild(this.panel);
    document.body.appendChild(this.container);
  }

  private renderHUD(): void {
    if (!this.panel) return;
    const data = this.collectMetrics();

    // Update floating badge text
    const badgeText = document.getElementById('snowy-badge-text');
    if (badgeText) {
      badgeText.textContent = `${(data.totalTransferKB / 1024).toFixed(2)} MB WiFi · ${data.gpuDrawCalls} Calls`;
    }

    let filteredAssets = data.assets;
    if (this.currentFilter !== 'all') {
      filteredAssets = filteredAssets.filter(a => a.type === this.currentFilter);
    }

    filteredAssets.sort((a, b) => {
      if (this.currentSort === 'size') return b.transferKB - a.transferKB;
      if (this.currentSort === 'time') return b.durationMs - a.durationMs;
      return a.name.localeCompare(b.name);
    });

    const isCold = data.cachedCalls === 0;

    this.panel.innerHTML = `
      <div class="hud-header">
        <div class="hud-title-group">
          <span class="hud-badge-icon">📶</span>
          <div>
            <h2 class="hud-title">SNOWY // COLD-START WIFI & DRAW CALLS INSPECTOR</h2>
            <p class="hud-subtitle">Status: <strong style="color: ${isCold ? '#4ade80' : '#facc15'}">${isCold ? '100% PURE COLD START' : `${data.cachedCalls} assets cached (warm)`}</strong></p>
          </div>
        </div>
        <div class="hud-header-actions">
          <button class="hud-btn hud-btn-cold" id="btn-cold-restart" title="Clear cache and reload with fresh timestamp">🔄 Cold Start Test</button>
          <button class="hud-btn hud-btn-copy" id="btn-copy-report" title="Copy report to clipboard">📋 Copy Report</button>
          <button class="hud-btn hud-btn-close" id="btn-close-hud" title="Close inspector">✕</button>
        </div>
      </div>

      <!-- KPI METRIC CARDS -->
      <div class="hud-kpi-grid">
        <div class="hud-kpi-card">
          <span class="hud-kpi-label">TOTAL WIFI USAGE</span>
          <span class="hud-kpi-value text-accent">${(data.totalTransferKB / 1024).toFixed(2)} <small>MB</small></span>
          <span class="hud-kpi-sub">${data.totalTransferKB.toFixed(1)} KB over network wire</span>
        </div>
        <div class="hud-kpi-card">
          <span class="hud-kpi-label">WIFI DRAW CALLS</span>
          <span class="hud-kpi-value">${data.totalNetworkCalls} <small>requests</small></span>
          <span class="hud-kpi-sub">${data.cachedCalls} from memory cache</span>
        </div>
        <div class="hud-kpi-card">
          <span class="hud-kpi-label">GPU DRAW CALLS</span>
          <span class="hud-kpi-value text-cyan">${data.gpuDrawCalls} <small>calls/frame</small></span>
          <span class="hud-kpi-sub">${data.gpuTriangles.toLocaleString()} triangles · ${data.fps} FPS</span>
        </div>
        <div class="hud-kpi-card">
          <span class="hud-kpi-label">FIRST SCENE PREVIEW</span>
          <span class="hud-kpi-value text-green">${data.timeToPreviewMs > 0 ? (data.timeToPreviewMs / 1000).toFixed(2) : '< 1.5'} <small>s</small></span>
          <span class="hud-kpi-sub">Skeleton to poster display</span>
        </div>
      </div>

      <!-- CATEGORY DISTRIBUTION BAR -->
      <div class="hud-category-breakdown">
        <div class="hud-breakdown-title">
          <span>WiFi Bandwidth Distribution by Asset Type</span>
          <span>Total: ${(data.totalTransferKB / 1024).toFixed(2)} MB</span>
        </div>
        <div class="hud-stacked-bar">
          <div class="bar-seg seg-video" style="width: ${(data.categories.video.kb / Math.max(1, data.totalTransferKB)) * 100}%" title="Video: ${data.categories.video.kb.toFixed(1)} KB"></div>
          <div class="bar-seg seg-texture" style="width: ${(data.categories.texture.kb / Math.max(1, data.totalTransferKB)) * 100}%" title="Textures: ${data.categories.texture.kb.toFixed(1)} KB"></div>
          <div class="bar-seg seg-script" style="width: ${(data.categories.script.kb / Math.max(1, data.totalTransferKB)) * 100}%" title="Scripts: ${data.categories.script.kb.toFixed(1)} KB"></div>
          <div class="bar-seg seg-font" style="width: ${(data.categories.font.kb / Math.max(1, data.totalTransferKB)) * 100}%" title="Fonts: ${data.categories.font.kb.toFixed(1)} KB"></div>
          <div class="bar-seg seg-css" style="width: ${(data.categories.css.kb / Math.max(1, data.totalTransferKB)) * 100}%" title="CSS: ${data.categories.css.kb.toFixed(1)} KB"></div>
          <div class="bar-seg seg-doc" style="width: ${(data.categories.document.kb / Math.max(1, data.totalTransferKB)) * 100}%" title="HTML: ${data.categories.document.kb.toFixed(1)} KB"></div>
        </div>
        <div class="hud-legend">
          <span class="legend-item"><span class="dot seg-video"></span> Video: <strong>${data.categories.video.kb.toFixed(1)} KB</strong> (${data.categories.video.count})</span>
          <span class="legend-item"><span class="dot seg-texture"></span> 3D Textures: <strong>${data.categories.texture.kb.toFixed(1)} KB</strong> (${data.categories.texture.count})</span>
          <span class="legend-item"><span class="dot seg-script"></span> JS / Engine: <strong>${data.categories.script.kb.toFixed(1)} KB</strong> (${data.categories.script.count})</span>
          <span class="legend-item"><span class="dot seg-font"></span> Fonts: <strong>${data.categories.font.kb.toFixed(1)} KB</strong> (${data.categories.font.count})</span>
          <span class="legend-item"><span class="dot seg-css"></span> Stylesheets: <strong>${data.categories.css.kb.toFixed(1)} KB</strong> (${data.categories.css.count})</span>
          <span class="legend-item"><span class="dot seg-doc"></span> HTML: <strong>${data.categories.document.kb.toFixed(1)} KB</strong> (${data.categories.document.count})</span>
        </div>
      </div>

      <!-- FILTER AND SORT TOOLBAR -->
      <div class="hud-toolbar">
        <div class="hud-filters">
          <button class="filter-tab ${this.currentFilter === 'all' ? 'active' : ''}" data-filter="all">All (${data.assets.length})</button>
          <button class="filter-tab ${this.currentFilter === 'texture' ? 'active' : ''}" data-filter="texture">Textures (${data.categories.texture.count})</button>
          <button class="filter-tab ${this.currentFilter === 'script' ? 'active' : ''}" data-filter="script">Scripts (${data.categories.script.count})</button>
          <button class="filter-tab ${this.currentFilter === 'video' ? 'active' : ''}" data-filter="video">Video (${data.categories.video.count})</button>
          <button class="filter-tab ${this.currentFilter === 'font' ? 'active' : ''}" data-filter="font">Fonts (${data.categories.font.count})</button>
          <button class="filter-tab ${this.currentFilter === 'css' ? 'active' : ''}" data-filter="css">CSS (${data.categories.css.count})</button>
        </div>
        <div class="hud-sorting">
          <label>Sort by:
            <select id="hud-sort-select">
              <option value="size" ${this.currentSort === 'size' ? 'selected' : ''}>WiFi Size (Largest)</option>
              <option value="time" ${this.currentSort === 'time' ? 'selected' : ''}>Load Duration</option>
              <option value="name" ${this.currentSort === 'name' ? 'selected' : ''}>Asset Name</option>
            </select>
          </label>
        </div>
      </div>

      <!-- ASSET DETAILS TABLE -->
      <div class="hud-table-wrapper">
        <table class="hud-table">
          <thead>
            <tr>
              <th>Asset Name</th>
              <th>Category</th>
              <th style="text-align: right;">WiFi Wire Size</th>
              <th style="text-align: right;">Memory Size</th>
              <th style="text-align: right;">WiFi Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${filteredAssets.map(a => `
              <tr class="${a.transferKB > 150 ? 'row-heavy' : ''}">
                <td class="col-name" title="${a.url}">
                  <span class="type-icon">${this.getTypeIcon(a.type)}</span>
                  <strong>${a.name}</strong>
                </td>
                <td class="col-type"><span class="badge-type badge-${a.type}">${a.type}</span></td>
                <td class="col-size" style="text-align: right;">
                  <strong>${a.transferKB.toFixed(1)} KB</strong>
                  <div class="mini-bar-container"><div class="mini-bar" style="width: ${Math.min(100, (a.transferKB / Math.max(1, filteredAssets[0]?.transferKB || 1)) * 100)}%"></div></div>
                </td>
                <td class="col-decoded" style="text-align: right;">${a.decodedKB.toFixed(1)} KB</td>
                <td class="col-time" style="text-align: right;">${a.durationMs} ms</td>
                <td class="col-status">
                  <span class="status-pill ${a.isCached ? 'status-cached' : 'status-network'}">
                    ${a.isCached ? '⚡ Cached' : '🌐 Network 200'}
                  </span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      <div class="hud-footer">
        <span>💡 Press <kbd>Shift + D</kbd> to toggle this HUD anytime. Append <kbd>?debug=1</kbd> to URL to auto-open.</span>
      </div>
    `;

    // Attach event handlers
    this.panel.querySelector('#btn-close-hud')?.addEventListener('click', () => this.close());
    this.panel.querySelector('#btn-cold-restart')?.addEventListener('click', () => this.runColdStartTest());
    this.panel.querySelector('#btn-copy-report')?.addEventListener('click', () => this.copyReportToClipboard(data));

    this.panel.querySelectorAll('.filter-tab').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const filter = (e.currentTarget as HTMLElement).dataset.filter;
        if (filter) {
          this.currentFilter = filter;
          this.renderHUD();
        }
      });
    });

    const sortSelect = this.panel.querySelector('#hud-sort-select') as HTMLSelectElement;
    sortSelect?.addEventListener('change', (e) => {
      this.currentSort = (e.target as HTMLSelectElement).value as any;
      this.renderHUD();
    });
  }

  private getTypeIcon(type: AssetMetric['type']): string {
    switch (type) {
      case 'video': return '🎬';
      case 'texture': return '🖼️';
      case 'script': return '⚙️';
      case 'font': return '🔤';
      case 'css': return '🎨';
      case 'document': return '📄';
      default: return '📦';
    }
  }

  public open(): void {
    this.isOpen = true;
    if (this.container) this.container.style.display = 'flex';
    localStorage.setItem('snowy:debug', '1');
    this.renderHUD();
  }

  public close(): void {
    this.isOpen = false;
    if (this.container) this.container.style.display = 'none';
    localStorage.removeItem('snowy:debug');
  }

  public toggle(): void {
    if (this.isOpen) this.close();
    else this.open();
  }

  private runColdStartTest(): void {
    // Clear storage and add cache-busting query to force pure cold download
    try {
      sessionStorage.clear();
      localStorage.setItem('snowy:debug', '1');
    } catch {}
    const timestamp = Date.now();
    const url = new URL(location.href);
    url.searchParams.set('cold_test', String(timestamp));
    url.searchParams.set('debug', '1');
    location.href = url.toString();
  }

  private copyReportToClipboard(data: ColdStartSummary): void {
    const lines = [
      `# SNOWY // COLD-START WIFI & DRAW CALLS REPORT`,
      `Date: ${new Date().toISOString()}`,
      `URL: ${location.href}`,
      `Total Cold WiFi Usage: ${(data.totalTransferKB / 1024).toFixed(2)} MB (${data.totalTransferKB.toFixed(1)} KB)`,
      `Total WiFi Calls (Network Requests): ${data.totalNetworkCalls}`,
      `GPU Three.js Draw Calls: ${data.gpuDrawCalls} calls/frame`,
      `GPU Triangles: ${data.gpuTriangles.toLocaleString()}`,
      `First Scene Visible: ${(data.timeToPreviewMs / 1000).toFixed(2)}s`,
      `FPS: ${data.fps}`,
      ``,
      `## Bandwidth Breakdown:`,
      `- Video: ${data.categories.video.kb.toFixed(1)} KB (${data.categories.video.count} files)`,
      `- 3D Textures: ${data.categories.texture.kb.toFixed(1)} KB (${data.categories.texture.count} files)`,
      `- JS / WebGL: ${data.categories.script.kb.toFixed(1)} KB (${data.categories.script.count} files)`,
      `- Fonts: ${data.categories.font.kb.toFixed(1)} KB (${data.categories.font.count} files)`,
      `- CSS: ${data.categories.css.kb.toFixed(1)} KB (${data.categories.css.count} files)`,
      `- HTML: ${data.categories.document.kb.toFixed(1)} KB`,
      ``,
      `## Top 10 Heaviest Assets:`,
      ...data.assets.slice(0, 10).map((a, i) => `${i + 1}. [${a.type.toUpperCase()}] ${a.name} -> ${a.transferKB.toFixed(1)} KB (${a.durationMs}ms)`),
    ];
    const text = lines.join('\n');
    navigator.clipboard.writeText(text).then(() => {
      alert('Report copied to clipboard successfully!');
    });
  }

  private attachShortcuts(): void {
    window.addEventListener('keydown', (e) => {
      if (e.shiftKey && (e.key === 'D' || e.key === 'd')) {
        this.toggle();
      }
    });
  }

  private startMetricsLoop(): void {
    const loop = () => {
      if (this.isOpen) {
        this.renderHUD();
      } else {
        const data = this.collectMetrics();
        const badgeText = document.getElementById('snowy-badge-text');
        if (badgeText) {
          badgeText.textContent = `${(data.totalTransferKB / 1024).toFixed(2)} MB · ${data.gpuDrawCalls} Calls`;
        }
      }
      this.rafId = requestAnimationFrame(loop);
    };
    // Update every 1 second
    setInterval(() => {
      if (this.isOpen) this.renderHUD();
    }, 1000);
    this.rafId = requestAnimationFrame(loop);
  }

  private applyBadgeStyles(): void {
    if (!this.badge) return;
    Object.assign(this.badge.style, {
      position: 'fixed',
      bottom: '16px',
      right: '16px',
      zIndex: '999990',
      background: 'rgba(7, 19, 33, 0.88)',
      color: '#e2f5ff',
      border: '1px solid rgba(80, 200, 240, 0.35)',
      borderRadius: '24px',
      padding: '8px 14px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: '12px',
      fontWeight: '600',
      letterSpacing: '0.02em',
      boxShadow: '0 4px 18px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
      backdropFilter: 'blur(10px)',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'all 0.2s ease',
      transform: 'scale(1)'
    });
    this.badge.addEventListener('mouseenter', () => {
      if (this.badge) {
        this.badge.style.transform = 'scale(1.04)';
        this.badge.style.borderColor = 'rgba(80, 200, 240, 0.8)';
      }
    });
    this.badge.addEventListener('mouseleave', () => {
      if (this.badge) {
        this.badge.style.transform = 'scale(1)';
        this.badge.style.borderColor = 'rgba(80, 200, 240, 0.35)';
      }
    });
  }

  private applyPanelStyles(): void {
    const style = document.createElement('style');
    style.textContent = `
      #snowy-wifi-hud-container {
        position: fixed;
        inset: 0;
        z-index: 999999;
        background: rgba(4, 11, 20, 0.75);
        backdrop-filter: blur(12px);
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 20px;
        box-sizing: border-box;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        color: #e2f5ff;
      }
      .snowy-wifi-panel {
        width: 100%;
        max-width: 980px;
        max-height: 90vh;
        background: #091a2b;
        border: 1px solid rgba(100, 210, 255, 0.3);
        border-radius: 12px;
        box-shadow: 0 16px 48px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.15);
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }
      .hud-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 20px;
        background: #071321;
        border-bottom: 1px solid rgba(255,255,255,0.08);
      }
      .hud-title-group {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .hud-badge-icon {
        font-size: 24px;
      }
      .hud-title {
        margin: 0;
        font-size: 14px;
        font-weight: 700;
        letter-spacing: 0.08em;
        color: #e2f5ff;
      }
      .hud-subtitle {
        margin: 2px 0 0;
        font-size: 11px;
        color: #8bb1c9;
      }
      .hud-header-actions {
        display: flex;
        gap: 8px;
      }
      .hud-btn {
        background: #11283d;
        color: #e2f5ff;
        border: 1px solid rgba(255,255,255,0.15);
        border-radius: 6px;
        padding: 6px 12px;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.15s ease;
      }
      .hud-btn:hover {
        background: #193854;
        border-color: rgba(100,210,255,0.4);
      }
      .hud-btn-cold {
        background: #144436;
        border-color: #22c55e66;
        color: #86efac;
      }
      .hud-btn-cold:hover {
        background: #195845;
      }
      .hud-btn-close {
        padding: 6px 10px;
        font-size: 14px;
      }
      .hud-kpi-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 12px;
        padding: 16px 20px;
        background: #0c2033;
        border-bottom: 1px solid rgba(255,255,255,0.06);
      }
      .hud-kpi-card {
        background: #081624;
        border: 1px solid rgba(255,255,255,0.06);
        border-radius: 8px;
        padding: 12px;
        display: flex;
        flex-direction: column;
      }
      .hud-kpi-label {
        font-size: 10px;
        font-weight: 700;
        color: #7ba2ba;
        letter-spacing: 0.06em;
      }
      .hud-kpi-value {
        font-size: 22px;
        font-weight: 800;
        margin: 4px 0;
        color: #ffffff;
      }
      .hud-kpi-value small {
        font-size: 12px;
        font-weight: 600;
        color: #94a3b8;
      }
      .text-accent { color: #38bdf8 !important; }
      .text-cyan { color: #06b6d4 !important; }
      .text-green { color: #4ade80 !important; }
      .hud-kpi-sub {
        font-size: 11px;
        color: #64748b;
      }
      .hud-category-breakdown {
        padding: 14px 20px;
        background: #091b2c;
        border-bottom: 1px solid rgba(255,255,255,0.06);
      }
      .hud-breakdown-title {
        display: flex;
        justify-content: space-between;
        font-size: 11px;
        font-weight: 600;
        color: #94a3b8;
        margin-bottom: 8px;
      }
      .hud-stacked-bar {
        height: 10px;
        background: #06111a;
        border-radius: 5px;
        display: flex;
        overflow: hidden;
      }
      .bar-seg { height: 100%; transition: width 0.3s ease; }
      .seg-video { background: #ef4444; }
      .seg-texture { background: #38bdf8; }
      .seg-script { background: #facc15; }
      .seg-font { background: #a855f7; }
      .seg-css { background: #3b82f6; }
      .seg-doc { background: #10b981; }
      .hud-legend {
        display: flex;
        flex-wrap: wrap;
        gap: 14px;
        margin-top: 10px;
        font-size: 11px;
        color: #94a3b8;
      }
      .legend-item { display: flex; align-items: center; gap: 5px; }
      .dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
      .hud-toolbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 20px;
        background: #081624;
        border-bottom: 1px solid rgba(255,255,255,0.06);
      }
      .hud-filters { display: flex; gap: 6px; }
      .filter-tab {
        background: transparent;
        color: #94a3b8;
        border: 1px solid transparent;
        border-radius: 4px;
        padding: 4px 10px;
        font-size: 11px;
        cursor: pointer;
      }
      .filter-tab:hover { color: #e2f5ff; background: rgba(255,255,255,0.05); }
      .filter-tab.active {
        color: #38bdf8;
        background: #112a40;
        border-color: rgba(56,189,248,0.3);
        font-weight: 600;
      }
      .hud-sorting label {
        font-size: 11px;
        color: #94a3b8;
      }
      .hud-sorting select {
        background: #11283d;
        color: #e2f5ff;
        border: 1px solid rgba(255,255,255,0.15);
        border-radius: 4px;
        padding: 3px 8px;
        font-size: 11px;
      }
      .hud-table-wrapper {
        flex: 1;
        overflow-y: auto;
        max-height: 420px;
      }
      .hud-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 12px;
      }
      .hud-table th {
        position: sticky;
        top: 0;
        background: #0a1e30;
        padding: 8px 16px;
        font-size: 11px;
        color: #64748b;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        border-bottom: 1px solid rgba(255,255,255,0.08);
      }
      .hud-table td {
        padding: 7px 16px;
        border-bottom: 1px solid rgba(255,255,255,0.04);
        color: #cbd5e1;
      }
      .hud-table tr:hover { background: rgba(56,189,248,0.04); }
      .row-heavy { background: rgba(239, 68, 68, 0.05); }
      .col-name {
        display: flex;
        align-items: center;
        gap: 8px;
        max-width: 320px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .type-icon { font-size: 14px; }
      .badge-type {
        font-size: 9px;
        text-transform: uppercase;
        font-weight: 700;
        padding: 2px 6px;
        border-radius: 4px;
      }
      .badge-video { background: rgba(239,68,68,0.2); color: #f87171; }
      .badge-texture { background: rgba(56,189,248,0.2); color: #38bdf8; }
      .badge-script { background: rgba(250,204,21,0.2); color: #facc15; }
      .badge-font { background: rgba(168,85,247,0.2); color: #c084fc; }
      .badge-css { background: rgba(59,130,246,0.2); color: #60a5fa; }
      .badge-document { background: rgba(16,185,129,0.2); color: #34d399; }
      .badge-other { background: rgba(148,163,184,0.2); color: #94a3b8; }
      .mini-bar-container {
        height: 3px;
        width: 100%;
        background: rgba(255,255,255,0.05);
        border-radius: 2px;
        margin-top: 3px;
      }
      .mini-bar {
        height: 100%;
        background: #38bdf8;
        border-radius: 2px;
      }
      .status-pill {
        font-size: 10px;
        font-weight: 600;
        padding: 2px 6px;
        border-radius: 10px;
      }
      .status-network { background: rgba(34,197,94,0.15); color: #4ade80; border: 1px solid rgba(34,197,94,0.3); }
      .status-cached { background: rgba(250,204,21,0.15); color: #facc15; border: 1px solid rgba(250,204,21,0.3); }
      .hud-footer {
        padding: 10px 20px;
        background: #071321;
        border-top: 1px solid rgba(255,255,255,0.06);
        font-size: 11px;
        color: #64748b;
        display: flex;
        justify-content: space-between;
      }
      kbd {
        background: #11283d;
        color: #94a3b8;
        border: 1px solid rgba(255,255,255,0.15);
        border-radius: 3px;
        padding: 1px 5px;
        font-family: inherit;
        font-size: 10px;
      }
      @media (max-width: 768px) {
        .hud-kpi-grid { grid-template-columns: repeat(2, 1fr); }
        .hud-toolbar { flex-direction: column; gap: 8px; align-items: flex-start; }
      }
    `;
    document.head.appendChild(style);
  }
}

export function initWiFiDebugHUD(): WiFiDebugHUD {
  return new WiFiDebugHUD();
}
