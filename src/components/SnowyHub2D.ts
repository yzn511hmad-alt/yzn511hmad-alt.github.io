/**
 * SNOWY HUB 2D NATIVE COMPONENT
 * Pure DOM + CSS implementation of the Snowy Hub interface.
 * Zero WebGL overhead, vector-sharp typography, full keyboard/mouse accessibility.
 * Snowy Studios (getsnowy.net)
 */

export type HubTabId = 'main' | 'combat' | 'visuals' | 'movement' | 'serverhop' | 'configs' | 'profile';

interface TabMeta {
  id: HubTabId;
  name: string;
  desc: string;
  subhead: string;
  iconSvg: string;
}

export class SnowyHub2D {
  private container: HTMLElement;
  private activeTab: HubTabId = 'main';

  // State
  private state = {
    // Main
    autoFarm: true,
    autoCollect: true,
    playerEsp: true,
    antiAfk: true,
    walkSpeed: 50,
    // Combat
    aimbot: true,
    autoTrigger: false,
    hitbox: 'Head',
    aimSmoothness: 85,
    fov: 120,
    // Visuals
    boxEsp: true,
    tracers: true,
    nameplates: true,
    chams: true,
    espDistance: 150,
    // Movement
    infiniteJump: true,
    noclip: false,
    flyMode: false,
    flySpeed: 50,
    gravity: 100,
    // Server Hop
    autoHop: false,
    avoidFull: true,
    region: 'Auto Detect',
    threshold: 12,
    hopDelay: 5,
    // Configs
    autoLoadConfig: true,
    cloudSync: true,
    profileName: 'Default Config',
    autoBackup: true,
    // Profile
    discordAlerts: true,
    streamproof: true,
    accent: 'Frost Blue',
    opacity: 95,
  };

  private tabsMeta: Record<HubTabId, TabMeta> = {
    main: {
      id: 'main',
      name: 'Main Settings',
      desc: 'General gameplay & automation',
      subhead: 'Core features',
      iconSvg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm10 0h6v6h-6v-6z"/></svg>',
    },
    combat: {
      id: 'combat',
      name: 'Combat Settings',
      desc: 'Targeting, silent aim & weapon overrides',
      subhead: 'Aim assistance',
      iconSvg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>',
    },
    visuals: {
      id: 'visuals',
      name: 'Visuals & ESP',
      desc: 'Wallhacks, chams & player telemetry',
      subhead: 'ESP modules',
      iconSvg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',
    },
    movement: {
      id: 'movement',
      name: 'Movement & Physics',
      desc: 'Character velocity & noclip overrides',
      subhead: 'Physics overrides',
      iconSvg: '<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
    },
    serverhop: {
      id: 'serverhop',
      name: 'Server Hop',
      desc: 'Automated matchmaking & low-ping routing',
      subhead: 'Routing settings',
      iconSvg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
    },
    configs: {
      id: 'configs',
      name: 'Config Manager',
      desc: 'Cloud profile syncing & slot backups',
      subhead: 'Storage management',
      iconSvg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>',
    },
    profile: {
      id: 'profile',
      name: 'VIP Profile',
      desc: 'Subscription status & stealth settings',
      subhead: 'System credentials',
      iconSvg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
    },
  };

  constructor(containerId: string) {
    const el = document.getElementById(containerId);
    if (!el) throw new Error(`Container #${containerId} not found.`);
    this.container = el;
    this.container.classList.add('snowy-hub-2d-host');
    this.container.setAttribute('data-model-state', 'ready');
    this.container.setAttribute('data-visual-state', 'ready');

    this.render();
  }

  public setTab(tabId: HubTabId): void {
    this.activeTab = tabId;
    this.render();
  }

  private render(): void {
    const tab = this.tabsMeta[this.activeTab];

    this.container.innerHTML = `
      <div class="snowy-hub-2d-root" role="region" aria-label="Snowy Hub 2D Interface">
        <!-- 1. Floating Capsule Sidebar -->
        <nav class="hub-2d-sidebar" aria-label="Snowy Hub Categories">
          <button type="button" class="hub-2d-tab-btn ${this.activeTab === 'main' ? 'active' : ''}" data-tab="main" title="Main Settings" aria-label="Main Settings">
            ${this.tabsMeta.main.iconSvg}
          </button>
          <button type="button" class="hub-2d-tab-btn ${this.activeTab === 'combat' ? 'active' : ''}" data-tab="combat" title="Combat Settings" aria-label="Combat Settings">
            ${this.tabsMeta.combat.iconSvg}
          </button>
          <button type="button" class="hub-2d-tab-btn ${this.activeTab === 'visuals' ? 'active' : ''}" data-tab="visuals" title="Visuals & ESP" aria-label="Visuals & ESP">
            ${this.tabsMeta.visuals.iconSvg}
          </button>
          <button type="button" class="hub-2d-tab-btn ${this.activeTab === 'movement' ? 'active' : ''}" data-tab="movement" title="Movement & Physics" aria-label="Movement & Physics">
            ${this.tabsMeta.movement.iconSvg}
          </button>
          <button type="button" class="hub-2d-tab-btn ${this.activeTab === 'serverhop' ? 'active' : ''}" data-tab="serverhop" title="Server Hop" aria-label="Server Hop">
            ${this.tabsMeta.serverhop.iconSvg}
          </button>
          <button type="button" class="hub-2d-tab-btn ${this.activeTab === 'configs' ? 'active' : ''}" data-tab="configs" title="Config Manager" aria-label="Config Manager">
            ${this.tabsMeta.configs.iconSvg}
          </button>
          <div class="hub-2d-tab-spacer"></div>
          <button type="button" class="hub-2d-tab-btn hub-2d-profile-btn ${this.activeTab === 'profile' ? 'active' : ''}" data-tab="profile" title="User Profile" aria-label="User Profile">
            ${this.tabsMeta.profile.iconSvg}
          </button>
        </nav>

        <!-- 2. Main Window Chassis -->
        <div class="hub-2d-window">
          <!-- Window Header -->
          <div class="hub-2d-header">
            <div class="hub-2d-brand">
              <div class="hub-2d-brand-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" stroke-width="2.2">
                  <polygon points="12 2 21 7.5 21 16.5 12 21 3 16.5 3 7.5 12 2"></polygon>
                </svg>
              </div>
              <div class="hub-2d-brand-text">
                <span class="hub-2d-title">Snowy Hub</span>
                <span class="hub-2d-subtitle">Universal Script</span>
              </div>
            </div>
            <button type="button" class="hub-2d-close-btn" title="Close Hub" aria-label="Close Hub">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <!-- Active Category Banner -->
          <div class="hub-2d-category-banner">
            <div class="hub-2d-cat-icon">
              ${tab.iconSvg}
            </div>
            <div class="hub-2d-cat-text">
              <h3 class="hub-2d-cat-title">${tab.name}</h3>
              <span class="hub-2d-cat-desc">${tab.desc}</span>
            </div>
          </div>

          <!-- Section Subhead -->
          <div class="hub-2d-subhead">${tab.subhead}</div>

          <!-- Settings Rows Card -->
          <div class="hub-2d-card">
            ${this.renderTabRows()}
          </div>
        </div>
      </div>
    `;

    this.attachEvents();
  }

  private renderTabRows(): string {
    const infoSvg = `
      <svg class="hub-2d-info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="16" x2="12" y2="12"></line>
        <line x1="12" y1="8" x2="12.01" y2="8"></line>
      </svg>
    `;

    switch (this.activeTab) {
      case 'main':
        return `
          <div class="hub-2d-row">
            <div class="hub-2d-label-wrap">
              <span>Auto Farm</span>${infoSvg}
            </div>
            <button type="button" class="hub-2d-toggle ${this.state.autoFarm ? 'active' : ''}" data-key="autoFarm" aria-pressed="${this.state.autoFarm}"></button>
          </div>
          <div class="hub-2d-row">
            <div class="hub-2d-label-wrap">
              <span>Auto Collect</span>${infoSvg}
            </div>
            <button type="button" class="hub-2d-toggle ${this.state.autoCollect ? 'active' : ''}" data-key="autoCollect" aria-pressed="${this.state.autoCollect}"></button>
          </div>
          <div class="hub-2d-row">
            <div class="hub-2d-label-wrap">
              <span>Player ESP</span>${infoSvg}
            </div>
            <button type="button" class="hub-2d-toggle ${this.state.playerEsp ? 'active' : ''}" data-key="playerEsp" aria-pressed="${this.state.playerEsp}"></button>
          </div>
          <div class="hub-2d-row">
            <div class="hub-2d-label-wrap">
              <span>Anti-AFK</span>${infoSvg}
            </div>
            <button type="button" class="hub-2d-toggle ${this.state.antiAfk ? 'active' : ''}" data-key="antiAfk" aria-pressed="${this.state.antiAfk}"></button>
          </div>
          <div class="hub-2d-row">
            <div class="hub-2d-label-wrap">
              <span>WalkSpeed Override</span>${infoSvg}
            </div>
            <div class="hub-2d-slider-wrap">
              <span class="hub-2d-slider-val" id="val-walkSpeed">${this.state.walkSpeed}</span>
              <input type="range" class="hub-2d-slider" min="16" max="250" value="${this.state.walkSpeed}" data-key="walkSpeed" aria-label="WalkSpeed Override">
            </div>
          </div>
          <button type="button" class="hub-2d-btn" id="btn-save-config">
            <span>💾</span>
            <span>Save Config</span>
          </button>
        `;

      case 'combat':
        return `
          <div class="hub-2d-row">
            <div class="hub-2d-label-wrap">
              <span>Aimbot Enabled</span>${infoSvg}
            </div>
            <button type="button" class="hub-2d-toggle ${this.state.aimbot ? 'active' : ''}" data-key="aimbot" aria-pressed="${this.state.aimbot}"></button>
          </div>
          <div class="hub-2d-row">
            <div class="hub-2d-label-wrap">
              <span>Auto Trigger</span>${infoSvg}
            </div>
            <button type="button" class="hub-2d-toggle ${this.state.autoTrigger ? 'active' : ''}" data-key="autoTrigger" aria-pressed="${this.state.autoTrigger}"></button>
          </div>
          <div class="hub-2d-row">
            <div class="hub-2d-label-wrap">
              <span>Target Hitbox</span>${infoSvg}
            </div>
            <select class="hub-2d-select" data-key="hitbox">
              <option ${this.state.hitbox === 'Head' ? 'selected' : ''}>Head</option>
              <option ${this.state.hitbox === 'Upper Torso' ? 'selected' : ''}>Upper Torso</option>
              <option ${this.state.hitbox === 'HumanoidRootPart' ? 'selected' : ''}>HumanoidRootPart</option>
            </select>
          </div>
          <div class="hub-2d-row">
            <div class="hub-2d-label-wrap">
              <span>Aim Smoothness</span>${infoSvg}
            </div>
            <div class="hub-2d-slider-wrap">
              <span class="hub-2d-slider-val" id="val-aimSmoothness">${this.state.aimSmoothness}%</span>
              <input type="range" class="hub-2d-slider" min="10" max="100" value="${this.state.aimSmoothness}" data-key="aimSmoothness">
            </div>
          </div>
          <div class="hub-2d-row">
            <div class="hub-2d-label-wrap">
              <span>Field of View (FOV)</span>${infoSvg}
            </div>
            <div class="hub-2d-slider-wrap">
              <span class="hub-2d-slider-val" id="val-fov">${this.state.fov}</span>
              <input type="range" class="hub-2d-slider" min="30" max="360" value="${this.state.fov}" data-key="fov">
            </div>
          </div>
        `;

      case 'visuals':
        return `
          <div class="hub-2d-row">
            <div class="hub-2d-label-wrap">
              <span>Box ESP (2D/3D)</span>${infoSvg}
            </div>
            <button type="button" class="hub-2d-toggle ${this.state.boxEsp ? 'active' : ''}" data-key="boxEsp"></button>
          </div>
          <div class="hub-2d-row">
            <div class="hub-2d-label-wrap">
              <span>Player Tracers</span>${infoSvg}
            </div>
            <button type="button" class="hub-2d-toggle ${this.state.tracers ? 'active' : ''}" data-key="tracers"></button>
          </div>
          <div class="hub-2d-row">
            <div class="hub-2d-label-wrap">
              <span>Nameplates & Health</span>${infoSvg}
            </div>
            <button type="button" class="hub-2d-toggle ${this.state.nameplates ? 'active' : ''}" data-key="nameplates"></button>
          </div>
          <div class="hub-2d-row">
            <div class="hub-2d-label-wrap">
              <span>Chams Glow & Outline</span>${infoSvg}
            </div>
            <button type="button" class="hub-2d-toggle ${this.state.chams ? 'active' : ''}" data-key="chams"></button>
          </div>
          <div class="hub-2d-row">
            <div class="hub-2d-label-wrap">
              <span>ESP Distance</span>${infoSvg}
            </div>
            <div class="hub-2d-slider-wrap">
              <span class="hub-2d-slider-val" id="val-espDistance">${this.state.espDistance}m</span>
              <input type="range" class="hub-2d-slider" min="50" max="500" value="${this.state.espDistance}" data-key="espDistance">
            </div>
          </div>
        `;

      case 'movement':
        return `
          <div class="hub-2d-row">
            <div class="hub-2d-label-wrap">
              <span>Infinite Jump</span>${infoSvg}
            </div>
            <button type="button" class="hub-2d-toggle ${this.state.infiniteJump ? 'active' : ''}" data-key="infiniteJump"></button>
          </div>
          <div class="hub-2d-row">
            <div class="hub-2d-label-wrap">
              <span>NoClip Walls</span>${infoSvg}
            </div>
            <button type="button" class="hub-2d-toggle ${this.state.noclip ? 'active' : ''}" data-key="noclip"></button>
          </div>
          <div class="hub-2d-row">
            <div class="hub-2d-label-wrap">
              <span>Fly Mode Toggle</span>${infoSvg}
            </div>
            <button type="button" class="hub-2d-toggle ${this.state.flyMode ? 'active' : ''}" data-key="flyMode"></button>
          </div>
          <div class="hub-2d-row">
            <div class="hub-2d-label-wrap">
              <span>Fly Speed</span>${infoSvg}
            </div>
            <div class="hub-2d-slider-wrap">
              <span class="hub-2d-slider-val" id="val-flySpeed">${this.state.flySpeed}</span>
              <input type="range" class="hub-2d-slider" min="10" max="200" value="${this.state.flySpeed}" data-key="flySpeed">
            </div>
          </div>
        `;

      case 'serverhop':
        return `
          <div class="hub-2d-row">
            <div class="hub-2d-label-wrap">
              <span>Auto Server Hop</span>${infoSvg}
            </div>
            <button type="button" class="hub-2d-toggle ${this.state.autoHop ? 'active' : ''}" data-key="autoHop"></button>
          </div>
          <div class="hub-2d-row">
            <div class="hub-2d-label-wrap">
              <span>Avoid Full Servers</span>${infoSvg}
            </div>
            <button type="button" class="hub-2d-toggle ${this.state.avoidFull ? 'active' : ''}" data-key="avoidFull"></button>
          </div>
          <div class="hub-2d-row">
            <div class="hub-2d-label-wrap">
              <span>Preferred Region</span>${infoSvg}
            </div>
            <select class="hub-2d-select" data-key="region">
              <option ${this.state.region === 'Auto Detect' ? 'selected' : ''}>Auto Detect</option>
              <option ${this.state.region === 'US East' ? 'selected' : ''}>US East</option>
              <option ${this.state.region === 'Europe' ? 'selected' : ''}>Europe</option>
              <option ${this.state.region === 'Asia' ? 'selected' : ''}>Asia</option>
            </select>
          </div>
        `;

      case 'configs':
        return `
          <div class="hub-2d-row">
            <div class="hub-2d-label-wrap">
              <span>Auto Load Config</span>${infoSvg}
            </div>
            <button type="button" class="hub-2d-toggle ${this.state.autoLoadConfig ? 'active' : ''}" data-key="autoLoadConfig"></button>
          </div>
          <div class="hub-2d-row">
            <div class="hub-2d-label-wrap">
              <span>Cloud Sync Profiles</span>${infoSvg}
            </div>
            <button type="button" class="hub-2d-toggle ${this.state.cloudSync ? 'active' : ''}" data-key="cloudSync"></button>
          </div>
          <div class="hub-2d-row">
            <div class="hub-2d-label-wrap">
              <span>Active Profile</span>${infoSvg}
            </div>
            <select class="hub-2d-select" data-key="profileName">
              <option ${this.state.profileName === 'Default Config' ? 'selected' : ''}>Default Config</option>
              <option ${this.state.profileName === 'HvH Rage' ? 'selected' : ''}>HvH Rage</option>
              <option ${this.state.profileName === 'Legit Stealth' ? 'selected' : ''}>Legit Stealth</option>
            </select>
          </div>
          <button type="button" class="hub-2d-btn" id="btn-save-config">
            <span>💾</span>
            <span>Save Profile</span>
          </button>
        `;

      case 'profile':
        return `
          <div class="hub-2d-row">
            <div class="hub-2d-label-wrap">
              <span>Status</span>
            </div>
            <span style="color: #10b981; font-weight: 700; font-size: 13px;">● Active VIP Lifetime</span>
          </div>
          <div class="hub-2d-row">
            <div class="hub-2d-label-wrap">
              <span>Discord Webhooks</span>${infoSvg}
            </div>
            <button type="button" class="hub-2d-toggle ${this.state.discordAlerts ? 'active' : ''}" data-key="discordAlerts"></button>
          </div>
          <div class="hub-2d-row">
            <div class="hub-2d-label-wrap">
              <span>Streamproof Stealth</span>${infoSvg}
            </div>
            <button type="button" class="hub-2d-toggle ${this.state.streamproof ? 'active' : ''}" data-key="streamproof"></button>
          </div>
          <div class="hub-2d-row">
            <div class="hub-2d-label-wrap">
              <span>UI Opacity</span>${infoSvg}
            </div>
            <div class="hub-2d-slider-wrap">
              <span class="hub-2d-slider-val" id="val-opacity">${this.state.opacity}%</span>
              <input type="range" class="hub-2d-slider" min="50" max="100" value="${this.state.opacity}" data-key="opacity">
            </div>
          </div>
        `;
    }
  }

  private attachEvents(): void {
    // 1. Sidebar tab switching
    const tabBtns = this.container.querySelectorAll<HTMLButtonElement>('.hub-2d-tab-btn');
    tabBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab') as HubTabId;
        if (tab && tab !== this.activeTab) {
          this.setTab(tab);
        }
      });
    });

    // 2. Toggle switches
    const toggles = this.container.querySelectorAll<HTMLButtonElement>('.hub-2d-toggle');
    toggles.forEach((t) => {
      t.addEventListener('click', () => {
        const key = t.getAttribute('data-key') as keyof typeof this.state;
        if (key && typeof this.state[key] === 'boolean') {
          (this.state as any)[key] = !(this.state as any)[key];
          t.classList.toggle('active', (this.state as any)[key]);
          t.setAttribute('aria-pressed', String((this.state as any)[key]));
        }
      });
    });

    // 3. Range Sliders
    const sliders = this.container.querySelectorAll<HTMLInputElement>('.hub-2d-slider');
    sliders.forEach((s) => {
      s.addEventListener('input', () => {
        const key = s.getAttribute('data-key') as keyof typeof this.state;
        const valSpan = this.container.querySelector(`#val-${key}`);
        if (key) {
          (this.state as any)[key] = Number(s.value);
          if (valSpan) {
            valSpan.textContent = key === 'aimSmoothness' || key === 'opacity' ? `${s.value}%` : (key === 'espDistance' ? `${s.value}m` : s.value);
          }
        }
      });
    });

    // 4. Save Config Button feedback
    const saveBtn = this.container.querySelector<HTMLButtonElement>('#btn-save-config');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        saveBtn.classList.add('saved');
        saveBtn.innerHTML = `<span>✓</span><span>Config Saved!</span>`;
        setTimeout(() => {
          saveBtn.classList.remove('saved');
          saveBtn.innerHTML = `<span>💾</span><span>Save Config</span>`;
        }, 1800);
      });
    }
  }

  public destroy(): void {
    this.container.innerHTML = '';
  }
}
