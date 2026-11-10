var e=class{container;activeTab=`main`;state={autoFarm:!0,autoCollect:!0,playerEsp:!0,antiAfk:!0,walkSpeed:50,aimbot:!0,autoTrigger:!1,hitbox:`Head`,aimSmoothness:85,fov:120,boxEsp:!0,tracers:!0,nameplates:!0,chams:!0,espDistance:150,infiniteJump:!0,noclip:!1,flyMode:!1,flySpeed:50,gravity:100,autoHop:!1,avoidFull:!0,region:`Auto Detect`,threshold:12,hopDelay:5,autoLoadConfig:!0,cloudSync:!0,profileName:`Default Config`,autoBackup:!0,discordAlerts:!0,streamproof:!0,accent:`Frost Blue`,opacity:95};tabsMeta={main:{id:`main`,name:`Main Settings`,desc:`General gameplay & automation`,subhead:`Core features`,iconSvg:`<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm10 0h6v6h-6v-6z"/></svg>`},combat:{id:`combat`,name:`Combat Settings`,desc:`Targeting, silent aim & weapon overrides`,subhead:`Aim assistance`,iconSvg:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>`},visuals:{id:`visuals`,name:`Visuals & ESP`,desc:`Wallhacks, chams & player telemetry`,subhead:`ESP modules`,iconSvg:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`},movement:{id:`movement`,name:`Movement & Physics`,desc:`Character velocity & noclip overrides`,subhead:`Physics overrides`,iconSvg:`<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`},serverhop:{id:`serverhop`,name:`Server Hop`,desc:`Automated matchmaking & low-ping routing`,subhead:`Routing settings`,iconSvg:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`},configs:{id:`configs`,name:`Config Manager`,desc:`Cloud profile syncing & slot backups`,subhead:`Storage management`,iconSvg:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`},profile:{id:`profile`,name:`VIP Profile`,desc:`Subscription status & stealth settings`,subhead:`System credentials`,iconSvg:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`}};constructor(e){let t=document.getElementById(e);if(!t)throw Error(`Container #${e} not found.`);this.container=t,this.container.classList.add(`snowy-hub-2d-host`),this.container.setAttribute(`data-model-state`,`ready`),this.container.setAttribute(`data-visual-state`,`ready`),this.render()}setTab(e){this.activeTab=e,this.render()}render(){let e=this.tabsMeta[this.activeTab];this.container.innerHTML=`
      <div class="snowy-hub-2d-root" role="region" aria-label="Snowy Hub 2D Interface">
        <!-- 1. Floating Capsule Sidebar -->
        <nav class="hub-2d-sidebar" aria-label="Snowy Hub Categories">
          <button type="button" class="hub-2d-tab-btn ${this.activeTab===`main`?`active`:``}" data-tab="main" title="Main Settings" aria-label="Main Settings">
            ${this.tabsMeta.main.iconSvg}
          </button>
          <button type="button" class="hub-2d-tab-btn ${this.activeTab===`combat`?`active`:``}" data-tab="combat" title="Combat Settings" aria-label="Combat Settings">
            ${this.tabsMeta.combat.iconSvg}
          </button>
          <button type="button" class="hub-2d-tab-btn ${this.activeTab===`visuals`?`active`:``}" data-tab="visuals" title="Visuals & ESP" aria-label="Visuals & ESP">
            ${this.tabsMeta.visuals.iconSvg}
          </button>
          <button type="button" class="hub-2d-tab-btn ${this.activeTab===`movement`?`active`:``}" data-tab="movement" title="Movement & Physics" aria-label="Movement & Physics">
            ${this.tabsMeta.movement.iconSvg}
          </button>
          <button type="button" class="hub-2d-tab-btn ${this.activeTab===`serverhop`?`active`:``}" data-tab="serverhop" title="Server Hop" aria-label="Server Hop">
            ${this.tabsMeta.serverhop.iconSvg}
          </button>
          <button type="button" class="hub-2d-tab-btn ${this.activeTab===`configs`?`active`:``}" data-tab="configs" title="Config Manager" aria-label="Config Manager">
            ${this.tabsMeta.configs.iconSvg}
          </button>
          <div class="hub-2d-tab-spacer"></div>
          <button type="button" class="hub-2d-tab-btn hub-2d-profile-btn ${this.activeTab===`profile`?`active`:``}" data-tab="profile" title="User Profile" aria-label="User Profile">
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
              ${e.iconSvg}
            </div>
            <div class="hub-2d-cat-text">
              <h3 class="hub-2d-cat-title">${e.name}</h3>
              <span class="hub-2d-cat-desc">${e.desc}</span>
            </div>
          </div>

          <!-- Section Subhead -->
          <div class="hub-2d-subhead">${e.subhead}</div>

          <!-- Settings Rows Card -->
          <div class="hub-2d-card">
            ${this.renderTabRows()}
          </div>
        </div>
      </div>
    `,this.attachEvents()}renderTabRows(){let e=`
      <svg class="hub-2d-info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="16" x2="12" y2="12"></line>
        <line x1="12" y1="8" x2="12.01" y2="8"></line>
      </svg>
    `;switch(this.activeTab){case`main`:return`
          <div class="hub-2d-row">
            <div class="hub-2d-label-wrap">
              <span>Auto Farm</span>${e}
            </div>
            <button type="button" class="hub-2d-toggle ${this.state.autoFarm?`active`:``}" data-key="autoFarm" aria-pressed="${this.state.autoFarm}"></button>
          </div>
          <div class="hub-2d-row">
            <div class="hub-2d-label-wrap">
              <span>Auto Collect</span>${e}
            </div>
            <button type="button" class="hub-2d-toggle ${this.state.autoCollect?`active`:``}" data-key="autoCollect" aria-pressed="${this.state.autoCollect}"></button>
          </div>
          <div class="hub-2d-row">
            <div class="hub-2d-label-wrap">
              <span>Player ESP</span>${e}
            </div>
            <button type="button" class="hub-2d-toggle ${this.state.playerEsp?`active`:``}" data-key="playerEsp" aria-pressed="${this.state.playerEsp}"></button>
          </div>
          <div class="hub-2d-row">
            <div class="hub-2d-label-wrap">
              <span>Anti-AFK</span>${e}
            </div>
            <button type="button" class="hub-2d-toggle ${this.state.antiAfk?`active`:``}" data-key="antiAfk" aria-pressed="${this.state.antiAfk}"></button>
          </div>
          <div class="hub-2d-row">
            <div class="hub-2d-label-wrap">
              <span>WalkSpeed Override</span>${e}
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
        `;case`combat`:return`
          <div class="hub-2d-row">
            <div class="hub-2d-label-wrap">
              <span>Aimbot Enabled</span>${e}
            </div>
            <button type="button" class="hub-2d-toggle ${this.state.aimbot?`active`:``}" data-key="aimbot" aria-pressed="${this.state.aimbot}"></button>
          </div>
          <div class="hub-2d-row">
            <div class="hub-2d-label-wrap">
              <span>Auto Trigger</span>${e}
            </div>
            <button type="button" class="hub-2d-toggle ${this.state.autoTrigger?`active`:``}" data-key="autoTrigger" aria-pressed="${this.state.autoTrigger}"></button>
          </div>
          <div class="hub-2d-row">
            <div class="hub-2d-label-wrap">
              <span>Target Hitbox</span>${e}
            </div>
            <select class="hub-2d-select" data-key="hitbox">
              <option ${this.state.hitbox===`Head`?`selected`:``}>Head</option>
              <option ${this.state.hitbox===`Upper Torso`?`selected`:``}>Upper Torso</option>
              <option ${this.state.hitbox===`HumanoidRootPart`?`selected`:``}>HumanoidRootPart</option>
            </select>
          </div>
          <div class="hub-2d-row">
            <div class="hub-2d-label-wrap">
              <span>Aim Smoothness</span>${e}
            </div>
            <div class="hub-2d-slider-wrap">
              <span class="hub-2d-slider-val" id="val-aimSmoothness">${this.state.aimSmoothness}%</span>
              <input type="range" class="hub-2d-slider" min="10" max="100" value="${this.state.aimSmoothness}" data-key="aimSmoothness">
            </div>
          </div>
          <div class="hub-2d-row">
            <div class="hub-2d-label-wrap">
              <span>Field of View (FOV)</span>${e}
            </div>
            <div class="hub-2d-slider-wrap">
              <span class="hub-2d-slider-val" id="val-fov">${this.state.fov}</span>
              <input type="range" class="hub-2d-slider" min="30" max="360" value="${this.state.fov}" data-key="fov">
            </div>
          </div>
        `;case`visuals`:return`
          <div class="hub-2d-row">
            <div class="hub-2d-label-wrap">
              <span>Box ESP (2D/3D)</span>${e}
            </div>
            <button type="button" class="hub-2d-toggle ${this.state.boxEsp?`active`:``}" data-key="boxEsp"></button>
          </div>
          <div class="hub-2d-row">
            <div class="hub-2d-label-wrap">
              <span>Player Tracers</span>${e}
            </div>
            <button type="button" class="hub-2d-toggle ${this.state.tracers?`active`:``}" data-key="tracers"></button>
          </div>
          <div class="hub-2d-row">
            <div class="hub-2d-label-wrap">
              <span>Nameplates & Health</span>${e}
            </div>
            <button type="button" class="hub-2d-toggle ${this.state.nameplates?`active`:``}" data-key="nameplates"></button>
          </div>
          <div class="hub-2d-row">
            <div class="hub-2d-label-wrap">
              <span>Chams Glow & Outline</span>${e}
            </div>
            <button type="button" class="hub-2d-toggle ${this.state.chams?`active`:``}" data-key="chams"></button>
          </div>
          <div class="hub-2d-row">
            <div class="hub-2d-label-wrap">
              <span>ESP Distance</span>${e}
            </div>
            <div class="hub-2d-slider-wrap">
              <span class="hub-2d-slider-val" id="val-espDistance">${this.state.espDistance}m</span>
              <input type="range" class="hub-2d-slider" min="50" max="500" value="${this.state.espDistance}" data-key="espDistance">
            </div>
          </div>
        `;case`movement`:return`
          <div class="hub-2d-row">
            <div class="hub-2d-label-wrap">
              <span>Infinite Jump</span>${e}
            </div>
            <button type="button" class="hub-2d-toggle ${this.state.infiniteJump?`active`:``}" data-key="infiniteJump"></button>
          </div>
          <div class="hub-2d-row">
            <div class="hub-2d-label-wrap">
              <span>NoClip Walls</span>${e}
            </div>
            <button type="button" class="hub-2d-toggle ${this.state.noclip?`active`:``}" data-key="noclip"></button>
          </div>
          <div class="hub-2d-row">
            <div class="hub-2d-label-wrap">
              <span>Fly Mode Toggle</span>${e}
            </div>
            <button type="button" class="hub-2d-toggle ${this.state.flyMode?`active`:``}" data-key="flyMode"></button>
          </div>
          <div class="hub-2d-row">
            <div class="hub-2d-label-wrap">
              <span>Fly Speed</span>${e}
            </div>
            <div class="hub-2d-slider-wrap">
              <span class="hub-2d-slider-val" id="val-flySpeed">${this.state.flySpeed}</span>
              <input type="range" class="hub-2d-slider" min="10" max="200" value="${this.state.flySpeed}" data-key="flySpeed">
            </div>
          </div>
        `;case`serverhop`:return`
          <div class="hub-2d-row">
            <div class="hub-2d-label-wrap">
              <span>Auto Server Hop</span>${e}
            </div>
            <button type="button" class="hub-2d-toggle ${this.state.autoHop?`active`:``}" data-key="autoHop"></button>
          </div>
          <div class="hub-2d-row">
            <div class="hub-2d-label-wrap">
              <span>Avoid Full Servers</span>${e}
            </div>
            <button type="button" class="hub-2d-toggle ${this.state.avoidFull?`active`:``}" data-key="avoidFull"></button>
          </div>
          <div class="hub-2d-row">
            <div class="hub-2d-label-wrap">
              <span>Preferred Region</span>${e}
            </div>
            <select class="hub-2d-select" data-key="region">
              <option ${this.state.region===`Auto Detect`?`selected`:``}>Auto Detect</option>
              <option ${this.state.region===`US East`?`selected`:``}>US East</option>
              <option ${this.state.region===`Europe`?`selected`:``}>Europe</option>
              <option ${this.state.region===`Asia`?`selected`:``}>Asia</option>
            </select>
          </div>
        `;case`configs`:return`
          <div class="hub-2d-row">
            <div class="hub-2d-label-wrap">
              <span>Auto Load Config</span>${e}
            </div>
            <button type="button" class="hub-2d-toggle ${this.state.autoLoadConfig?`active`:``}" data-key="autoLoadConfig"></button>
          </div>
          <div class="hub-2d-row">
            <div class="hub-2d-label-wrap">
              <span>Cloud Sync Profiles</span>${e}
            </div>
            <button type="button" class="hub-2d-toggle ${this.state.cloudSync?`active`:``}" data-key="cloudSync"></button>
          </div>
          <div class="hub-2d-row">
            <div class="hub-2d-label-wrap">
              <span>Active Profile</span>${e}
            </div>
            <select class="hub-2d-select" data-key="profileName">
              <option ${this.state.profileName===`Default Config`?`selected`:``}>Default Config</option>
              <option ${this.state.profileName===`HvH Rage`?`selected`:``}>HvH Rage</option>
              <option ${this.state.profileName===`Legit Stealth`?`selected`:``}>Legit Stealth</option>
            </select>
          </div>
          <button type="button" class="hub-2d-btn" id="btn-save-config">
            <span>💾</span>
            <span>Save Profile</span>
          </button>
        `;case`profile`:return`
          <div class="hub-2d-row">
            <div class="hub-2d-label-wrap">
              <span>Status</span>
            </div>
            <span style="color: #10b981; font-weight: 700; font-size: 13px;">● Active VIP Lifetime</span>
          </div>
          <div class="hub-2d-row">
            <div class="hub-2d-label-wrap">
              <span>Discord Webhooks</span>${e}
            </div>
            <button type="button" class="hub-2d-toggle ${this.state.discordAlerts?`active`:``}" data-key="discordAlerts"></button>
          </div>
          <div class="hub-2d-row">
            <div class="hub-2d-label-wrap">
              <span>Streamproof Stealth</span>${e}
            </div>
            <button type="button" class="hub-2d-toggle ${this.state.streamproof?`active`:``}" data-key="streamproof"></button>
          </div>
          <div class="hub-2d-row">
            <div class="hub-2d-label-wrap">
              <span>UI Opacity</span>${e}
            </div>
            <div class="hub-2d-slider-wrap">
              <span class="hub-2d-slider-val" id="val-opacity">${this.state.opacity}%</span>
              <input type="range" class="hub-2d-slider" min="50" max="100" value="${this.state.opacity}" data-key="opacity">
            </div>
          </div>
        `}}attachEvents(){this.container.querySelectorAll(`.hub-2d-tab-btn`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.getAttribute(`data-tab`);t&&t!==this.activeTab&&this.setTab(t)})}),this.container.querySelectorAll(`.hub-2d-toggle`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.getAttribute(`data-key`);t&&typeof this.state[t]==`boolean`&&(this.state[t]=!this.state[t],e.classList.toggle(`active`,this.state[t]),e.setAttribute(`aria-pressed`,String(this.state[t])))})}),this.container.querySelectorAll(`.hub-2d-slider`).forEach(e=>{e.addEventListener(`input`,()=>{let t=e.getAttribute(`data-key`),n=this.container.querySelector(`#val-${t}`);t&&(this.state[t]=Number(e.value),n&&(n.textContent=t===`aimSmoothness`||t===`opacity`?`${e.value}%`:t===`espDistance`?`${e.value}m`:e.value))})});let e=this.container.querySelector(`#btn-save-config`);e&&e.addEventListener(`click`,()=>{e.classList.add(`saved`),e.innerHTML=`<span>✓</span><span>Config Saved!</span>`,setTimeout(()=>{e.classList.remove(`saved`),e.innerHTML=`<span>💾</span><span>Save Config</span>`},1800)})}destroy(){this.container.innerHTML=``}};export{e as SnowyHub2D};