import"./SnowyFooter-Bd8TSNxj.js";import{t as e}from"./ThemeManager-s3GBnTBE.js";import{i as t}from"./vendor-gsap-bXzFIbWr.js";import{t as n}from"./FrameLoop-CZ1V4pNa.js";import{n as r,t as i}from"./Scroll-h6t-kRbY.js";/* empty css                         */import{$ as a,A as o,B as s,C as c,D as l,E as u,F as d,H as f,J as p,K as m,L as h,M as g,N as _,O as v,P as y,Q as b,R as x,S,T as C,U as w,V as T,W as E,X as D,Z as ee,_ as O,at as te,b as k,c as ne,ct as A,d as j,et as M,f as N,h as P,i as F,it as I,j as re,l as L,lt as R,n as z,nt as B,o as ie,ot as V,p as ae,r as oe,rt as H,s as se,st as ce,t as U,u as W,ut as le,v as ue,x as de,y as fe,z as pe}from"./vendor-three-Wuf2JrZ0.js";import{t as me}from"./SharedRenderer-BTZyQqkB.js";var he=class{container=null;badge=null;panel=null;tbody=null;isOpen=!1;currentFilter=`all`;currentSort=`size`;fpsHistory=[];lastFrameTime=performance.now();updateTimer=null;cachedData=null;constructor(){this.init()}init(){let e=new URLSearchParams(location.search),t=e.has(`debug`)||e.has(`perf`)||e.has(`cold_test`)||localStorage.getItem(`snowy:debug`)===`1`;this.createBadge(),this.createPanel(),this.attachShortcuts(),this.startBackgroundMetrics(),t&&this.open()}collectMetrics(){let e=performance.getEntriesByType(`resource`),t=performance.getEntriesByType(`navigation`)[0],n=document.getElementById(`key-access`),r=n?parseInt(n.dataset.drawCalls||`0`,10):0,i=n?parseInt(n.dataset.triangles||`0`,10):0,a=parseFloat(document.documentElement.dataset.previewDecodedAt||`0`),o=n&&n.dataset.trialSceneMs?parseFloat(n.dataset.trialSceneMs):n&&n.dataset.scenePresented===`true`?performance.now():0,s=t?t.loadEventEnd:0,c={video:{kb:0,count:0},texture:{kb:0,count:0},script:{kb:0,count:0},font:{kb:0,count:0},css:{kb:0,count:0},document:{kb:0,count:0},other:{kb:0,count:0}},l=0,u=0,d=0,f=0;if(t){let e=(t.transferSize||28980)/1024,n=(t.decodedBodySize||28980)/1024;c.document.kb+=e,c.document.count+=1,l+=e,u+=n,d+=1,t.transferSize===0&&(f+=1)}let p=[];t&&p.push({name:location.pathname.split(`/`).pop()||`free-key.html`,url:location.href,type:`document`,transferKB:(t.transferSize||28980)/1024,decodedKB:(t.decodedBodySize||28980)/1024,durationMs:Math.round(t.duration),startTimeMs:0,isCached:t.transferSize===0});for(let t of e){let e=t.name,n=e.split(`/`).pop()?.split(`?`)[0]||e,r=t.initiatorType,i=`other`;/\.(mp4|webm|ogv)$/i.test(n)||r===`video`?i=`video`:/\.(webp|jpg|jpeg|png|gif|svg|hdr)$/i.test(n)||r===`img`?i=`texture`:/\.(js|mjs)$/i.test(n)||r===`script`?i=`script`:/\.(woff2|woff|ttf|otf)$/i.test(n)||r===`font`?i=`font`:(/\.css$/i.test(n)||r===`css`||r===`link`)&&(i=`css`);let a=t.transferSize===0&&t.decodedBodySize>0,o=(t.transferSize||t.encodedBodySize||0)/1024,s=(t.decodedBodySize||t.transferSize||0)/1024;c[i].kb+=o,c[i].count+=1,l+=o,u+=s,d+=1,a&&(f+=1),p.push({name:n,url:e,type:i,transferKB:o,decodedKB:s,durationMs:Math.round(t.duration),startTimeMs:Math.round(t.startTime),isCached:a})}let m=this.calculateFPS();return{totalTransferKB:l,totalDecodedKB:u,totalNetworkCalls:d,cachedCalls:f,gpuDrawCalls:r,gpuTriangles:i,fps:m,timeToPreviewMs:a,timeTo3DReadyMs:o,windowLoadMs:s,categories:c,assets:p}}calculateFPS(){let e=performance.now(),t=e-this.lastFrameTime;if(this.lastFrameTime=e,t>0){let e=Math.round(1e3/t);this.fpsHistory.push(e),this.fpsHistory.length>20&&this.fpsHistory.shift();let n=this.fpsHistory.reduce((e,t)=>e+t,0)/this.fpsHistory.length;return Math.min(60,Math.round(n))}return 60}createBadge(){this.badge=document.createElement(`button`),this.badge.id=`snowy-wifi-badge`,this.badge.setAttribute(`type`,`button`),this.badge.setAttribute(`aria-label`,`Toggle WiFi & WebGL Debugger`),this.badge.innerHTML=`
      <span class="badge-icon">📶</span>
      <span class="badge-text" id="snowy-badge-text">WiFi Inspector</span>
    `,this.applyBadgeStyles(),this.badge.addEventListener(`click`,e=>{e.stopPropagation(),this.toggle()}),document.body.appendChild(this.badge)}createPanel(){this.applyStyles(),this.container=document.createElement(`div`),this.container.id=`snowy-wifi-hud-container`,this.container.style.display=`none`,this.container.addEventListener(`click`,e=>{e.target===this.container&&this.close()}),this.panel=document.createElement(`div`),this.panel.className=`snowy-wifi-panel`,this.panel.addEventListener(`click`,e=>e.stopPropagation()),this.panel.innerHTML=`
      <div class="hud-header">
        <div class="hud-title-group">
          <span class="hud-badge-icon">📶</span>
          <div>
            <h2 class="hud-title">SNOWY // COLD-START WIFI & DRAW CALLS INSPECTOR</h2>
            <p class="hud-subtitle">Status: <strong id="hud-status-text" style="color: #4ade80">Calculating...</strong></p>
          </div>
        </div>
        <div class="hud-header-actions">
          <button class="hud-btn hud-btn-cold" id="btn-cold-restart" type="button" title="Clear cache and reload with fresh timestamp">🔄 Cold Start Test</button>
          <button class="hud-btn hud-btn-copy" id="btn-copy-report" type="button" title="Copy report to clipboard">📋 Copy Report</button>
          <button class="hud-btn hud-btn-close" id="btn-close-hud" type="button" title="Close inspector">✕</button>
        </div>
      </div>

      <!-- KPI METRIC CARDS -->
      <div class="hud-kpi-grid">
        <div class="hud-kpi-card">
          <span class="hud-kpi-label">TOTAL WIFI USAGE</span>
          <span class="hud-kpi-value text-accent" id="val-total-wifi">0.00 <small>MB</small></span>
          <span class="hud-kpi-sub" id="sub-total-wifi">0 KB over wire</span>
        </div>
        <div class="hud-kpi-card">
          <span class="hud-kpi-label">WIFI DRAW CALLS</span>
          <span class="hud-kpi-value" id="val-net-calls">0 <small>requests</small></span>
          <span class="hud-kpi-sub" id="sub-net-calls">0 from memory cache</span>
        </div>
        <div class="hud-kpi-card">
          <span class="hud-kpi-label">GPU DRAW CALLS</span>
          <span class="hud-kpi-value text-cyan" id="val-draw-calls">0 <small>calls/frame</small></span>
          <span class="hud-kpi-sub" id="sub-draw-calls">0 triangles · 60 FPS</span>
        </div>
        <div class="hud-kpi-card">
          <span class="hud-kpi-label">FIRST SCENE PREVIEW</span>
          <span class="hud-kpi-value text-green" id="val-preview-time">0.00 <small>s</small></span>
          <span class="hud-kpi-sub">Skeleton to poster display</span>
        </div>
      </div>

      <!-- CATEGORY DISTRIBUTION BAR -->
      <div class="hud-category-breakdown">
        <div class="hud-breakdown-title">
          <span>WiFi Bandwidth Distribution by Asset Type</span>
          <span id="txt-breakdown-total">Total: 0.00 MB</span>
        </div>
        <div class="hud-stacked-bar">
          <div class="bar-seg seg-video" id="bar-video" style="width: 0%" title="Video"></div>
          <div class="bar-seg seg-texture" id="bar-texture" style="width: 0%" title="Textures"></div>
          <div class="bar-seg seg-script" id="bar-script" style="width: 0%" title="Scripts"></div>
          <div class="bar-seg seg-font" id="bar-font" style="width: 0%" title="Fonts"></div>
          <div class="bar-seg seg-css" id="bar-css" style="width: 0%" title="CSS"></div>
          <div class="bar-seg seg-doc" id="bar-doc" style="width: 0%" title="HTML"></div>
        </div>
        <div class="hud-legend" id="hud-legend-container">
          <!-- Filled dynamically -->
        </div>
      </div>

      <!-- FILTER AND SORT TOOLBAR -->
      <div class="hud-toolbar">
        <div class="hud-filters" id="hud-filter-group">
          <button class="filter-tab active" data-filter="all" type="button">All (0)</button>
          <button class="filter-tab" data-filter="texture" type="button">Textures (0)</button>
          <button class="filter-tab" data-filter="script" type="button">Scripts (0)</button>
          <button class="filter-tab" data-filter="video" type="button">Video (0)</button>
          <button class="filter-tab" data-filter="font" type="button">Fonts (0)</button>
          <button class="filter-tab" data-filter="css" type="button">CSS (0)</button>
        </div>
        <div class="hud-sorting">
          <label>Sort by:
            <select id="hud-sort-select">
              <option value="size" selected>WiFi Size (Largest)</option>
              <option value="time">Load Duration</option>
              <option value="name">Asset Name</option>
            </select>
          </label>
        </div>
      </div>

      <!-- ASSET DETAILS TABLE (SCROLLABLE) -->
      <div class="hud-table-wrapper" id="hud-table-wrapper">
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
          <tbody id="hud-table-body">
            <!-- Rows injected here once -->
          </tbody>
        </table>
      </div>
      <div class="hud-footer">
        <span>💡 Click outside or press <kbd>Esc</kbd> / <kbd>Shift + D</kbd> to close. Append <kbd>?debug=1</kbd> to URL to auto-open.</span>
      </div>
    `,this.container.appendChild(this.panel),document.body.appendChild(this.container),this.tbody=this.panel.querySelector(`#hud-table-body`),this.panel.querySelector(`#btn-close-hud`)?.addEventListener(`click`,()=>this.close()),this.panel.querySelector(`#btn-cold-restart`)?.addEventListener(`click`,()=>this.runColdStartTest()),this.panel.querySelector(`#btn-copy-report`)?.addEventListener(`click`,()=>{this.cachedData&&this.copyReportToClipboard(this.cachedData)}),this.panel.querySelectorAll(`.filter-tab`).forEach(e=>{e.addEventListener(`click`,e=>{let t=e.currentTarget.dataset.filter;t&&(this.currentFilter=t,this.panel?.querySelectorAll(`.filter-tab`).forEach(e=>e.classList.remove(`active`)),e.currentTarget.classList.add(`active`),this.renderTableOnly())})}),this.panel.querySelector(`#hud-sort-select`)?.addEventListener(`change`,e=>{this.currentSort=e.target.value,this.renderTableOnly()})}updateHUDValues(){if(!this.panel)return;let e=this.collectMetrics();this.cachedData=e;let t=document.getElementById(`snowy-badge-text`);t&&(t.textContent=`${(e.totalTransferKB/1024).toFixed(2)} MB · ${e.gpuDrawCalls} Calls`);let n=e.cachedCalls===0,r=this.panel.querySelector(`#hud-status-text`);r&&(r.textContent=n?`100% PURE COLD START`:`${e.cachedCalls} assets cached (warm)`,r.style.color=n?`#4ade80`:`#facc15`);let i=this.panel.querySelector(`#val-total-wifi`);i&&(i.innerHTML=`${(e.totalTransferKB/1024).toFixed(2)} <small>MB</small>`);let a=this.panel.querySelector(`#sub-total-wifi`);a&&(a.textContent=`${e.totalTransferKB.toFixed(1)} KB over network wire`);let o=this.panel.querySelector(`#val-net-calls`);o&&(o.innerHTML=`${e.totalNetworkCalls} <small>requests</small>`);let s=this.panel.querySelector(`#sub-net-calls`);s&&(s.textContent=`${e.cachedCalls} from memory cache`);let c=this.panel.querySelector(`#val-draw-calls`);c&&(c.innerHTML=`${e.gpuDrawCalls} <small>calls/frame</small>`);let l=this.panel.querySelector(`#sub-draw-calls`);l&&(l.textContent=`${e.gpuTriangles.toLocaleString()} triangles · ${e.fps} FPS`);let u=this.panel.querySelector(`#val-preview-time`);u&&(u.innerHTML=`${e.timeToPreviewMs>0?(e.timeToPreviewMs/1e3).toFixed(2):`< 1.0`} <small>s</small>`);let d=Math.max(1,e.totalTransferKB),f=(e,t)=>{let n=this.panel?.querySelector(e);n&&(n.style.width=`${t/d*100}%`)};f(`#bar-video`,e.categories.video.kb),f(`#bar-texture`,e.categories.texture.kb),f(`#bar-script`,e.categories.script.kb),f(`#bar-font`,e.categories.font.kb),f(`#bar-css`,e.categories.css.kb),f(`#bar-doc`,e.categories.document.kb);let p=this.panel.querySelector(`#txt-breakdown-total`);p&&(p.textContent=`Total: ${(e.totalTransferKB/1024).toFixed(2)} MB`);let m=this.panel.querySelector(`#hud-legend-container`);m&&(m.innerHTML=`
        <span class="legend-item"><span class="dot seg-video"></span> Video: <strong>${e.categories.video.kb.toFixed(1)} KB</strong> (${e.categories.video.count})</span>
        <span class="legend-item"><span class="dot seg-texture"></span> 3D Textures: <strong>${e.categories.texture.kb.toFixed(1)} KB</strong> (${e.categories.texture.count})</span>
        <span class="legend-item"><span class="dot seg-script"></span> JS / Engine: <strong>${e.categories.script.kb.toFixed(1)} KB</strong> (${e.categories.script.count})</span>
        <span class="legend-item"><span class="dot seg-font"></span> Fonts: <strong>${e.categories.font.kb.toFixed(1)} KB</strong> (${e.categories.font.count})</span>
        <span class="legend-item"><span class="dot seg-css"></span> Stylesheets: <strong>${e.categories.css.kb.toFixed(1)} KB</strong> (${e.categories.css.count})</span>
        <span class="legend-item"><span class="dot seg-doc"></span> HTML: <strong>${e.categories.document.kb.toFixed(1)} KB</strong> (${e.categories.document.count})</span>
      `);let h=(e,t)=>{let n=this.panel?.querySelector(`[data-filter="${e}"]`);n&&(n.textContent=`${e===`all`?`All`:e.charAt(0).toUpperCase()+e.slice(1)} (${t})`)};h(`all`,e.assets.length),h(`texture`,e.categories.texture.count),h(`script`,e.categories.script.count),h(`video`,e.categories.video.count),h(`font`,e.categories.font.count),h(`css`,e.categories.css.count)}renderTableOnly(){if(!this.tbody||!this.cachedData)return;let e=this.cachedData.assets;this.currentFilter!==`all`&&(e=e.filter(e=>e.type===this.currentFilter)),e.sort((e,t)=>this.currentSort===`size`?t.transferKB-e.transferKB:this.currentSort===`time`?t.durationMs-e.durationMs:e.name.localeCompare(t.name));let t=Math.max(1,e[0]?.transferKB||1);this.tbody.innerHTML=e.map(e=>`
      <tr class="${e.transferKB>150?`row-heavy`:``}">
        <td class="col-name" title="${e.url}">
          <span class="type-icon">${this.getTypeIcon(e.type)}</span>
          <strong>${e.name}</strong>
        </td>
        <td class="col-type"><span class="badge-type badge-${e.type}">${e.type}</span></td>
        <td class="col-size" style="text-align: right;">
          <strong>${e.transferKB.toFixed(1)} KB</strong>
          <div class="mini-bar-container"><div class="mini-bar" style="width: ${Math.min(100,e.transferKB/t*100)}%"></div></div>
        </td>
        <td class="col-decoded" style="text-align: right;">${e.decodedKB.toFixed(1)} KB</td>
        <td class="col-time" style="text-align: right;">${e.durationMs} ms</td>
        <td class="col-status">
          <span class="status-pill ${e.isCached?`status-cached`:`status-network`}">
            ${e.isCached?`⚡ Cached`:`🌐 Network 200`}
          </span>
        </td>
      </tr>
    `).join(``)}getTypeIcon(e){switch(e){case`video`:return`🎬`;case`texture`:return`🖼️`;case`script`:return`⚙️`;case`font`:return`🔤`;case`css`:return`🎨`;case`document`:return`📄`;default:return`📦`}}open(){this.isOpen=!0,this.container&&(this.container.style.display=`flex`),localStorage.setItem(`snowy:debug`,`1`),this.updateHUDValues(),this.renderTableOnly()}close(){this.isOpen=!1,this.container&&(this.container.style.display=`none`),localStorage.removeItem(`snowy:debug`)}toggle(){this.isOpen?this.close():this.open()}runColdStartTest(){try{sessionStorage.clear(),localStorage.setItem(`snowy:debug`,`1`)}catch{}let e=Date.now(),t=new URL(location.href);t.searchParams.set(`cold_test`,String(e)),t.searchParams.set(`debug`,`1`),location.href=t.toString()}copyReportToClipboard(e){let t=[`# SNOWY // COLD-START WIFI & DRAW CALLS REPORT`,`Date: ${new Date().toISOString()}`,`URL: ${location.href}`,`Total Cold WiFi Usage: ${(e.totalTransferKB/1024).toFixed(2)} MB (${e.totalTransferKB.toFixed(1)} KB)`,`Total WiFi Calls (Network Requests): ${e.totalNetworkCalls}`,`GPU Three.js Draw Calls: ${e.gpuDrawCalls} calls/frame`,`GPU Triangles: ${e.gpuTriangles.toLocaleString()}`,`First Scene Visible: ${(e.timeToPreviewMs/1e3).toFixed(2)}s`,`FPS: ${e.fps}`,``,`## Bandwidth Breakdown:`,`- Video: ${e.categories.video.kb.toFixed(1)} KB (${e.categories.video.count} files)`,`- 3D Textures: ${e.categories.texture.kb.toFixed(1)} KB (${e.categories.texture.count} files)`,`- JS / WebGL: ${e.categories.script.kb.toFixed(1)} KB (${e.categories.script.count} files)`,`- Fonts: ${e.categories.font.kb.toFixed(1)} KB (${e.categories.font.count} files)`,`- CSS: ${e.categories.css.kb.toFixed(1)} KB (${e.categories.css.count} files)`,`- HTML: ${e.categories.document.kb.toFixed(1)} KB`,``,`## Top 10 Heaviest Assets:`,...e.assets.slice(0,10).map((e,t)=>`${t+1}. [${e.type.toUpperCase()}] ${e.name} -> ${e.transferKB.toFixed(1)} KB (${e.durationMs}ms)`)].join(`
`);navigator.clipboard.writeText(t).then(()=>{alert(`Report copied to clipboard successfully!`)})}attachShortcuts(){window.addEventListener(`keydown`,e=>{e.key===`Escape`&&this.isOpen?this.close():e.shiftKey&&(e.key===`D`||e.key===`d`)&&this.toggle()})}startBackgroundMetrics(){window.addEventListener(`load`,()=>{this.updateHUDValues()}),this.updateTimer=window.setInterval(()=>{this.updateHUDValues()},2e3)}applyBadgeStyles(){this.badge&&(Object.assign(this.badge.style,{position:`fixed`,bottom:`16px`,right:`16px`,zIndex:`999990`,background:`rgba(7, 19, 33, 0.88)`,color:`#e2f5ff`,border:`1px solid rgba(80, 200, 240, 0.35)`,borderRadius:`24px`,padding:`8px 14px`,fontFamily:`system-ui, -apple-system, sans-serif`,fontSize:`12px`,fontWeight:`600`,letterSpacing:`0.02em`,boxShadow:`0 4px 18px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.15)`,backdropFilter:`blur(10px)`,cursor:`pointer`,display:`flex`,alignItems:`center`,gap:`8px`,transition:`all 0.2s ease`,transform:`scale(1)`}),this.badge.addEventListener(`mouseenter`,()=>{this.badge&&(this.badge.style.transform=`scale(1.04)`,this.badge.style.borderColor=`rgba(80, 200, 240, 0.8)`)}),this.badge.addEventListener(`mouseleave`,()=>{this.badge&&(this.badge.style.transform=`scale(1)`,this.badge.style.borderColor=`rgba(80, 200, 240, 0.35)`)}))}applyStyles(){let e=document.createElement(`style`);e.id=`snowy-wifi-hud-styles`,e.textContent=`
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
        user-select: auto;
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
        overflow-y: scroll !important;
        max-height: 400px;
        overscroll-behavior: contain;
      }
      .hud-table-wrapper::-webkit-scrollbar {
        width: 8px;
      }
      .hud-table-wrapper::-webkit-scrollbar-track {
        background: #06111a;
      }
      .hud-table-wrapper::-webkit-scrollbar-thumb {
        background: #1e3d59;
        border-radius: 4px;
      }
      .hud-table-wrapper::-webkit-scrollbar-thumb:hover {
        background: #2b5880;
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
        z-index: 2;
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
    `,document.head.appendChild(e)}};function ge(){return new he}var _e=3e4,ve=864e5;function ye(){let e=crypto.getRandomValues(new Uint8Array(8)),t=Array.from(e,e=>`ABCDEFGHJKLMNPQRSTUVWXYZ23456789`[e%32]).join(``);return`SNOWY-FREE-${t.slice(0,4)}-${t.slice(4)}-${new Date().getFullYear()}`}var be={uCampDetail:{value:null},uHasCampDetail:{value:0},uCompactCamp:{value:new R},uPhoneSnow:{value:null},uHasPhoneSnow:{value:0},uPhoneSnowLayout:{value:0}};function xe(e,t=!1,n=t){be.uPhoneSnow.value=e??null,be.uHasPhoneSnow.value=e?.image&&t?1:0,be.uPhoneSnowLayout.value=e?.image&&t&&n?1:0}function Se(e=0,t=0,n=0,r=!1){be.uCompactCamp.value.set(e,t,n,+!!r)}function Ce(e){be.uCampDetail.value=e??null,be.uHasCampDetail.value=+!!e}var we=`uniform sampler2D uCampDetail;uniform float uHasCampDetail;uniform vec4 uCompactCamp;uniform sampler2D uPhoneSnow;uniform float uHasPhoneSnow;uniform float uPhoneSnowLayout;
vec3 phoneSnowColor(vec2 uv,vec3 original){
 if(uHasPhoneSnow<.5)return original;
 vec2 snowUv=vec2(mix(.18,.22,uPhoneSnowLayout)+uv.x*.32,uv.y*.90);
 vec3 snow=texture2D(uPhoneSnow,snowUv).rgb;
 float ground=1.-smoothstep(.355,.405,uv.y);
 return mix(original,snow,ground);
}
vec3 campSourceColor(sampler2D plate,vec2 uv){
 vec3 base=texture2D(plate,uv).rgb;
 if(uHasCampDetail<.5||uCompactCamp.w>.5)return base;
 vec2 minCorner=vec2(.514354067,.584484591);
 vec2 q=(vec2(uv.x,1.-uv.y)-minCorner)/vec2(.19138756,.204038257);
 float edge=1.-smoothstep(.72,1.,length((q-.5)/vec2(.5)));
 if(edge<=0.)return base;
 return mix(base,texture2D(uCampDetail,vec2(q.x,1.-q.y)).rgb,edge);
}
vec3 campPlateColor(sampler2D plate,vec2 uv,float closeCamp){
 vec3 result=phoneSnowColor(uv,campSourceColor(plate,uv));
 vec2 p=vec2(uv.x,1.-uv.y);
 if(uCompactCamp.z>0.){
  vec2 sourceCenter=uCompactCamp.w>.5?vec2(.563,.646):vec2(.6105,.681);
  vec2 source=sourceCenter+(p-uCompactCamp.xy)/uCompactCamp.z;
  vec2 oldRadii=uCompactCamp.w>.5?vec2(.110,.044):vec2(.105,.040);
  float oldPit=1.-smoothstep(.65,1.,length((p-sourceCenter)/oldRadii));
  vec3 cleanSnow=phoneSnowColor(uv,texture2D(plate,vec2(uv.x,uv.y-.075)).rgb);
  vec3 cleared=mix(result,cleanSnow,oldPit);
  vec2 patchRadii=vec2(.12,.048);
  float patchWeight=1.-smoothstep(.65,1.,length((source-sourceCenter)/patchRadii));
  result=mix(cleared,campSourceColor(plate,vec2(source.x,1.-source.y)),patchWeight);
 }else if(closeCamp>=.5){
  // Clear duplicate background campfire on hill for laptop
  vec2 oldCenter=vec2(.6105,.681);
  vec2 oldRadii=vec2(.110,.042);
  float oldPit=1.-smoothstep(.60,1.,length((p-oldCenter)/oldRadii));
  if(oldPit>0.){
   vec3 cleanSnow=phoneSnowColor(uv,texture2D(plate,vec2(uv.x,uv.y-.075)).rgb);
   result=mix(result,cleanSnow,oldPit);
  }
  // Foreground high-definition campfire
  vec2 c=vec2(.577,.737);
  float mask=1.-smoothstep(.72,1.,length((p-c)/vec2(.22,.14)))*smoothstep(.595,.625,p.y);
  if(mask>=.001){
   vec2 source=vec2(.6105,.681)+(p-c)/1.5;
   result=mix(result,campSourceColor(plate,vec2(source.x,1.-source.y)),mask);
  }
 }
 return result;
}`;function Te(e){let{surface:t,scene:n,camera:r,sky:i,fire:a}=e,c={value:new R},l={value:null},u={value:0},d=new b({transparent:!0,depthTest:!1,depthWrite:!1,toneMapped:!1,uniforms:{...be,uPlate:l,uCrop:c,uClose:u},vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}`,fragmentShader:`${we}\nuniform sampler2D uPlate;uniform vec4 uCrop;uniform float uClose;varying vec2 vUv;
 void main(){vec2 uv=vUv*uCrop.xy+uCrop.zw;float coverage=1.-smoothstep(.355,.405,uv.y);
 if(coverage<.001)discard;gl_FragColor=vec4(campPlateColor(uPlate,uv,uClose),coverage);
 #include <colorspace_fragment>
 }`}),f=new o(new s(2,2),d);f.name=`early-camp-ground`,f.frustumCulled=!1,f.renderOrder=-19,f.visible=!1,n.add(f);let p=!1,m=!1,h=``,g=!1,_=!1,v=!0,y=null,x=()=>String(a.mesh.material.map?.uuid)+`:`+String(v),S=async()=>{let s=x(),c=new Set,l=e=>{e instanceof I&&e.image&&!e.isRenderTargetTexture&&!(e instanceof le)&&c.add(e)};l(e.background()),Object.values(be).forEach(e=>l(e.value)),Object.values(i.root.material.uniforms).forEach(e=>l(e.value)),l(a.mesh.material.map);let u=[];for(let e of c){let t=e.image;t?.decode&&u.push(t.decode().catch(()=>{}))}if(await Promise.all(u),p)return;for(let e of c)t.engine.initTexture(e);let d=new k;d.add(i.root.clone(!1),f.clone(!1)),a.root.traverse(e=>{e instanceof o&&d.add(e.clone(!1))}),t.engine.toneMapping=t.toneMapping,t.engine.toneMappingExposure=t.toneMappingExposure,t.engine.outputColorSpace=t.outputColorSpace,await t.engine.compileAsync(d,r,n),!p&&(h=s,m=!1,e.onReady())};return{ground:f,get ready(){return h===x()&&!!h},get started(){return g},render(o,s,d){if(v=d,a.setMotion(d),p||!e.ready()||!i.ready||!e.background()?.image||!(a.root.userData.posterReady||a.root.userData.videoReady))return!1;let b=t.engine.getContext();if(y){let t=b.clientWaitSync(y,0,0);if(t===b.TIMEOUT_EXPIRED)return!0;b.deleteSync(y),y=null,_||(_=!0,e.onFirst(t===b.WAIT_FAILED?`frame-fallback`:`fence-complete`))}if(h!==x())return m||(m=!0,S().catch(()=>{p||e.onError()})),!1;let C=e.background();l.value=C,c.value.set(C.repeat.x,C.repeat.y,C.offset.x,C.offset.y),u.value=+!!C.userData.closeCamp,i.setCamera(r),i.setActive(s&&d),i.update(o),a.setMotion(d),a.update(o,r,s&&d),e.irradiance();let w=e.hidden().filter(e=>!!e),T=w.map(e=>e.visible),E=[];n.traverse(e=>{e instanceof P&&(E.push([e.shadow,e.shadow.needsUpdate]),e.shadow.needsUpdate=!1)});try{w.forEach(e=>e.visible=!1),f.visible=!0,t.render(n,r),g=!0}finally{f.visible=!1,w.forEach((e,t)=>e.visible=T[t]),E.forEach(([e,t])=>e.needsUpdate=t)}return _||(_=!0,e.onFirst(`immediate`)),!0},dispose(){p=!0,cancelAnimationFrame(0),y&&t.engine.getContext().deleteSync(y),n.remove(f),f.geometry.dispose(),d.dispose()}}}function Ee(e,t=!1,n){if(n){let t=Ee(e);return{...t,x:n.x,y:n.y,scale:t.scale*n.zoom}}return t?{x:.577,y:.737,scale:.87,canonicalY:.75,originalBaseY:.798,originalHeight:.18}:e?{x:.563,y:.646,scale:.64,canonicalY:.664,originalBaseY:.69,originalHeight:.095}:{x:.6105,y:.681,scale:.58,canonicalY:.75,originalBaseY:.798,originalHeight:.18}}function De(e,t,n,r,i,a=!1){let s=a?i?32:48:i?40:64,l=(t,n,r,i=0,a=0,s=0)=>{let c=new o(n,r);return c.name=t,c.position.set(i,a,s),e.add(c),c},u=[[.255,-.03],[.25,0],[.255,.03],[.273,.052],[.315,.062],[.355,.057],[.385,.035],[.392,0],[.385,-.035],[.355,-.057],[.315,-.062],[.273,-.052],[.255,-.03]].reverse().map(([e,t])=>new ce(e,t)),d=new c(u,s);d.rotateX(Math.PI/2);let f=l(`key-ring`,d,r,0,1.89,0);for(let e of[-1,1])l(`ring-outer-bead`,new V(.385,.006,6,s),n,0,1.89,e*.037),l(`ring-inner-bead`,new V(.255,.005,6,s),n,0,1.89,e*.03);let p=l(`key-shaft`,new ae(.056,.062,1.37,s,1),t,0,.842,0);l(`shaft-foot`,new H(.062,s,10),n,0,.157,0);let m=[[0,1.405],[.056,1.405],[.058,1.425],[.091,1.432],[.104,1.447],[.106,1.464],[.09,1.48],[.073,1.488],[.076,1.504],[.112,1.516],[.116,1.535],[.098,1.552],[.074,1.563],[.07,1.584],[.076,1.606],[0,1.606]].map(([e,t])=>new ce(e,t)),h=l(`key-turned-neck`,new c(m,s),t);for(let e of[1.45,1.532]){let t=new V(e===1.45?.1:.11,.009,6,s);t.rotateX(Math.PI/2),l(`neck-polished-bead`,t,n,0,e,0)}let g=new M;return g.moveTo(.024,.2),g.lineTo(.255,.2),g.lineTo(.255,.305),g.lineTo(.132,.305),g.lineTo(.132,.393),g.lineTo(.255,.393),g.lineTo(.255,.495),g.lineTo(.024,.495),g.closePath(),{ring:f,shaft:p,bit:l(`key-bit`,new ue(g,{depth:.086,bevelEnabled:!0,bevelThickness:.009,bevelSize:.009,bevelSegments:3,steps:1}),t,0,0,-.043),collar:h}}var Oe=new Map;function ke(e=32){let t=Math.max(8,Math.min(80,Math.round(e))),n=Oe.get(t);if(n)return n.clone();let r=t+1,i=new Int32Array(r*r*r).fill(-1),a=(t+1)*(t+1)*(t+1)-(t-1)*(t-1)*(t-1),o=new Float32Array(a*3),s=new Float32Array(a*3),c=0;for(let e=0;e<=t;e++)for(let n=0;n<=t;n++)for(let a=0;a<=t;a++)if(e===0||e===t||n===0||n===t||a===0||a===t){let l=e*r*r+n*r+a;i[l]=c;let u=e/t*2-1,d=n/t*2-1,f=a/t*2-1,p=c*3;o[p]=u,o[p+1]=d,o[p+2]=f;let m=Math.hypot(u,d,f)||1;s[p]=u/m,s[p+1]=d/m,s[p+2]=f/m,c++}let l=6*t*t,u=new Uint16Array(l*6),d=0,f=(e,t,n,a,o,s,c,l,f,p,m,h)=>{let g=i[e*r*r+t*r+n],_=i[a*r*r+o*r+s],v=i[c*r*r+l*r+f],y=i[p*r*r+m*r+h];u[d++]=g,u[d++]=_,u[d++]=y,u[d++]=_,u[d++]=v,u[d++]=y};for(let e=0;e<t;e++)for(let n=0;n<t;n++)f(e,n,t,e+1,n,t,e+1,n+1,t,e,n+1,t);for(let e=0;e<t;e++)for(let n=0;n<t;n++)f(e+1,n,0,e,n,0,e,n+1,0,e+1,n+1,0);for(let e=0;e<t;e++)for(let n=0;n<t;n++)f(t,n,e+1,t,n,e,t,n+1,e,t,n+1,e+1);for(let e=0;e<t;e++)for(let n=0;n<t;n++)f(0,n,e,0,n,e+1,0,n+1,e+1,0,n+1,e);for(let e=0;e<t;e++)for(let n=0;n<t;n++)f(e,t,n,e+1,t,n,e+1,t,n+1,e,t,n+1);for(let e=0;e<t;e++)for(let n=0;n<t;n++)f(e,0,n+1,e+1,0,n+1,e+1,0,n,e,0,n);let p=new L;return p.setAttribute(`position`,new ne(o,3)),p.setAttribute(`normal`,new ne(s,3)),p.setIndex(new ne(u,1)),p.name=`natural-hewn-ice-watertight`,p.boundingBox=new ie(new A(-1.05,-1.05,-1.05),new A(1.05,1.05,1.05)),p.boundingSphere=new B(new A(0,0,0),1.732),Oe.set(t,p),p.clone()}async function Ae(e=40){ke(e)}function je(e=40){return ke(e)}var Me=(e,t,n)=>{let r=l.clamp((n-e)/(t-e),0,1);return r*r*(3-2*r)};function Ne(e){let t=l.clamp(e,0,1),n=t**1.55,r=l.lerp(1-.12*n,.985,Me(.66,1,t));return{x:r,y:1-n,z:r,cx:0,cz:0}}var Pe=`
vec3 hewnIce(vec3 p){
  vec3 ap = abs(p);
  vec3 s = sign(p);
  vec3 r = vec3(
    ap.x <= 0.75 ? p.x / 0.75 * 0.85 : s.x * (0.85 + (ap.x - 0.75) / 0.25 * 0.15),
    ap.y <= 0.75 ? p.y / 0.75 * 0.85 : s.y * (0.85 + (ap.y - 0.75) / 0.25 * 0.15),
    ap.z <= 0.75 ? p.z / 0.75 * 0.85 : s.z * (0.85 + (ap.z - 0.75) / 0.25 * 0.15)
  );
  vec3 inner = clamp(r, -0.85, 0.85);
  vec3 diff = r - inner;
  vec3 n = length(diff) > 0.00001 ? normalize(diff) : vec3(0.0, 1.0, 0.0);
  vec3 pt = inner + n * 0.15;
  float h = (pt.y + 1.0) * 0.5;
  pt.x *= 1.0 - 0.036 * h;
  pt.z *= 1.0 - 0.024 * h;
  float weather = 0.006 * sin(pt.x * 9.0 + pt.y * 4.0) * sin(pt.z * 7.0 - pt.y * 3.0) + 0.004 * sin(pt.x * 19.0 + pt.z * 13.0);
  pt += n * (weather * smoothstep(0.04, 0.20, h));

  vec3 c1 = normalize(vec3(0.64, 0.62, 0.45));
  float d1 = dot(pt, c1) - 1.37;
  if (d1 > 0.0) pt -= c1 * d1;

  vec3 c2 = normalize(vec3(-0.74, 0.49, -0.46));
  float d2 = dot(pt, c2) - 1.39;
  if (d2 > 0.0) pt -= c2 * d2;

  vec3 c3 = normalize(vec3(0.09, 1.0, -0.045));
  float d3 = dot(pt, c3) - 0.955;
  if (d3 > 0.0) pt -= c3 * d3;

  return pt;
}

vec3 meltIce(vec3 p){
  float t=clamp(uMelt,0.,1.);
  float melt=pow(t,1.55);
  float h=(p.y+1.)*.5;
  float finish=smoothstep(.66,1.,t);
  float width=1.-.12*melt-.10*melt*h*h;
  vec3 q=p;
  q.xz*=width;
  float height=2.*(1.-melt);
  float slump=.10*melt*sin(h*3.14159265)*(1.-.20*sin(p.x*3.+p.z*2.));
  q.y=-1.+max(0.,height*h-slump);
  // A watertight truncated superellipsoid: a broad rounded-square cap,
  // with a flat contact patch and convex upper surface. There is no lip.
  vec3 direction=normalize(p);
  float radial=length(direction.xz);
  vec2 heading=direction.xz/max(radial,.00001);
  float squareRadius=pow(max(.00001,pow(abs(heading.x),6.)+pow(abs(heading.y),6.)),-1./6.);
  vec3 cap;
  cap.xz=heading*radial*squareRadius*mix(1.-.12*melt,.985,finish);
  cap.x*=1.+.018*(sin(heading.y*2.7+.7)-sin(.7));
  cap.z*=1.+.015*(sin(heading.x*3.1-.5)+sin(.5));
  cap.y=-1.+height*(max(-.65,direction.y)+.65)/1.65;
  q=mix(q,cap,finish);
  return q;
}

vec3 shapeIce(vec3 p){
  return meltIce(hewnIce(p));
}
`;function Fe(e){let t=new w().setFromEuler(new O(-Math.PI/2,0,-.08)),n=new A,r=1/0;e.traverse(e=>{if(!(e instanceof o))return;e.updateMatrix();let i=e.geometry.getAttribute(`position`);for(let a=0;a<i.count;a++)n.fromBufferAttribute(i,a).applyMatrix4(e.matrix).multiplyScalar(.7).applyQuaternion(t),r=Math.min(r,n.y)});let i=.029-r+.002;return{pose:e=>{let t=l.clamp(e,0,1),n=Me(.64,1,t);return{angle:Math.PI/2*n,y:.14-.045*n+(i-.095)*Me(.78,1,t),z:.08+.68*n}},endY:i}}function Ie(e=40,t=3,n,r,i={}){let c=i.highDetail??e>32,d=c||!!i.naturalClarity,f=new k;f.name=`melt-key-model`;let p=l.clamp(Math.round(t),1,4),m=!1;f.userData.highDetail=c,f.userData.materialStudy=p,f.userData.materialReady=!1;let h=new te().load(`/assets/ice-studies/study-${p}${e<=32?`-mobile`:``}.webp`,e=>{m?e.dispose():(f.userData.materialReady=!0,n?.())},void 0,()=>{m||r?.()});h.colorSpace=``,h.minFilter=u,h.magFilter=C,h.anisotropy=c?8:4;let v=[.6,.65,.59,.62][p-1],b={value:+!!d},x={value:v*(d?.8:1)},w=new k;w.name=`key`;let T={uMelt:{value:0},uOpacity:{value:1},uWet:{value:0},uVolumeRoughness:{value:.13},uKeyReveal:{value:0}},D=new _({color:14936813,metalness:0,roughness:.12,transmission:.98,thickness:1,ior:1.31,attenuationColor:11452359,attenuationDistance:d?4.6:3.8,clearcoat:0,clearcoatRoughness:.36,envMapIntensity:.32,transparent:!0,depthWrite:!1}),ee=1967,O=()=>(ee=ee*1664525+1013904223>>>0,ee/4294967296),ne=Array.from({length:20},()=>{let e=O()*Math.PI*2,t=Math.sqrt(O())*.49;return new R(Math.cos(e)*t+.04,-.58+O()*1.1,Math.sin(e)*t*.75,.012+O()*.016)});D.onBeforeCompile=e=>{e.uniforms.uMelt=T.uMelt,e.uniforms.uKeyReveal=T.uKeyReveal,e.uniforms.uAirPockets={value:ne},e.uniforms.uVolumeRoughness=T.uVolumeRoughness,e.uniforms.uStudyMap={value:h},e.uniforms.uFrostStrength=x,e.uniforms.uNaturalClarity=b,e.uniforms.uClearCentre={value:[.78,.48,.82,.65][p-1]},e.fragmentShader=`uniform float uNaturalClarity;uniform vec4 uAirPockets[${ne.length}];uniform sampler2D uStudyMap;uniform float uClearCentre;uniform float uFrostStrength;uniform float uKeyReveal;uniform float uVolumeRoughness;uniform float uMelt;uniform mat3 normalMatrix;varying vec3 vJellyLocal;float iceColorDepth;
      float iceHash(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
      float iceNoise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
        return mix(mix(mix(iceHash(i),iceHash(i+vec3(1,0,0)),f.x),mix(iceHash(i+vec3(0,1,0)),iceHash(i+vec3(1,1,0)),f.x),f.y),mix(mix(iceHash(i+vec3(0,0,1)),iceHash(i+vec3(1,0,1)),f.x),mix(iceHash(i+vec3(0,1,1)),iceHash(i+1.),f.x),f.y),f.z);}
      vec3 studyField(vec3 p){
        vec3 n=abs(p-clamp(p,vec3(-.85),vec3(.85)));
        n=pow(max(n,vec3(.0001)),vec3(6.));n/=n.x+n.y+n.z;
        vec2 front=clamp(p.xy*.5+.5,vec2(.001),vec2(.999));
        vec2 side=clamp(vec2(-p.z,p.y)*.5+.5,vec2(.001),vec2(.999));
        vec2 top=clamp(p.xz*.5+.5,vec2(.001),vec2(.999));
        return texture2D(uStudyMap,vec2(front.x/3.,front.y)).rgb*n.z+
          texture2D(uStudyMap,vec2((side.x+1.)/3.,side.y)).rgb*n.x+
          texture2D(uStudyMap,vec2((top.x+2.)/3.,top.y)).rgb*n.y;
      }
      float jellyBoundary(vec3 p){
        vec3 q=abs(p)-vec3(.85);
        return length(max(q,vec3(0.)))+min(max(q.x,max(q.y,q.z)),0.)-.15;
      }
      // Bounded root of the matching convex rounded box, not a scene raymarch.
      // The linear root refinement avoids quantized thickness bands.
      float jellyPath(vec3 p,vec3 d){
        float lo=.0001,hi=4.;
        for(int i=0;i<6;i++){float mid=(lo+hi)*.5;if(jellyBoundary(p+d*mid)>0.)hi=mid;else lo=mid;}
        float a=jellyBoundary(p+d*lo),b=jellyBoundary(p+d*hi);
        return clamp(mix(lo,hi,clamp(-a/max(.00001,b-a),0.,1.)),.025,3.5);
      }\n`+e.fragmentShader,e.fragmentShader=e.fragmentShader.replace(`#include <roughnessmap_fragment>`,`#include <roughnessmap_fragment>
      vec3 frozenDetail=studyField(vJellyLocal);
      vec3 faceWeight=pow(abs(vJellyLocal-clamp(vJellyLocal,vec3(-.85),vec3(.85)))+vec3(.00001),vec3(6.));faceWeight/=faceWeight.x+faceWeight.y+faceWeight.z;
      float clearWindow=(1.-smoothstep(.25,.85,max(abs(vJellyLocal.x),abs(vJellyLocal.y))))*faceWeight.z+
        (1.-smoothstep(.25,.85,max(abs(vJellyLocal.z),abs(vJellyLocal.y))))*faceWeight.x;
      frozenDetail.r*=.48*(1.-clearWindow*uClearCentre);
      vec3 ap=abs(vJellyLocal);
      float edgeDistance=min(max(ap.x,ap.y),min(max(ap.x,ap.z),max(ap.y,ap.z)));
      float cortex=smoothstep(.56,.94,edgeDistance);
      float mottling=iceNoise(vJellyLocal*7.7+vec3(.8,0.,2.));
      float lowerFrost=(1.-smoothstep(-.95,-.57,vJellyLocal.y))*.34;
      frozenDetail.r=max(frozenDetail.r,cortex*(.34+.62*mottling)+lowerFrost);
      float fractureA=abs(dot(vJellyLocal,normalize(vec3(.72,.62,.22)))-.47+.018*sin(vJellyLocal.y*13.));
      float fractureB=abs(dot(vJellyLocal,normalize(vec3(-.28,.82,.50)))+.64+.012*sin(vJellyLocal.x*17.));
      float fractureAA=max(fwidth(min(fractureA,fractureB)),.0007);
      float fractures=(1.-smoothstep(.002,.010${c?`+fractureAA`:``},min(fractureA,fractureB)))*(.30+.70*mottling);
      ${c?`// Nested, interrupted fine fractures; bounded to sparse patches.
      float fineFracture=abs(dot(vJellyLocal,normalize(vec3(.34,-.28,.89)))+.22+.007*sin(vJellyLocal.y*23.));
      float fineAA=max(fwidth(fineFracture),.0008);
      float microCrack=(1.-smoothstep(fineAA,fineAA*2.5,fineFracture))*smoothstep(.44,.67,mottling);
      fractures=max(fractures,microCrack*.35);`:``}
      frozenDetail.r=max(frozenDetail.r,fractures*.68);
      float frozenAmount=uFrostStrength*(1.-smoothstep(.42,.92,uMelt));
      roughnessFactor=clamp(roughnessFactor+frozenDetail.r*.44*frozenAmount,.07,.48);
      ${c?`// Restrained micro-frost changes the highlight instead of painting
      // the clear viewing window white. Existing mottling bounds the patches.
      roughnessFactor+=fractures*.025*(1.-smoothstep(.45,.88,uMelt));`:``}`),e.fragmentShader=e.fragmentShader.replace(`#include <normal_fragment_maps>`,`#include <normal_fragment_maps>
      vec3 opticalRipple=vec3(sin(vJellyLocal.y*2.4+vJellyLocal.z*.7),sin(vJellyLocal.z*2.1-vJellyLocal.x*.8),sin(vJellyLocal.x*2.3+vJellyLocal.y*.6));
      normal=normalize(normal+normalMatrix*opticalRipple*.003*(1.-.7*smoothstep(.66,1.,uMelt)));
      vec3 sx=dFdx(-vViewPosition),sy=dFdy(-vViewPosition);
      vec3 rx=cross(sy,normal),ry=cross(normal,sx);
      float determinant=dot(sx,rx);
      vec3 gradient=sign(determinant)*(dFdx(frozenDetail.g)*rx+dFdy(frozenDetail.g)*ry);
      normal=normalize(max(abs(determinant),.0000001)*normal-gradient*.0005*frozenAmount);`);let t=F.transmission_pars_fragment.replaceAll(`getVolumeTransmissionRay( n, v, thickness,`,`getVolumeTransmissionRay( n, v, min( thickness, mix(.42,.14,smoothstep(.15,.70,uMelt)) ),`).replaceAll(`volumeAttenuation( length( transmissionRay ),`,`volumeAttenuation( iceColorDepth,`).replace(`vec3 attenuatedColor = transmittance * transmittedLight.rgb;`,`
        vec3 attenuatedColor = transmittance * transmittedLight.rgb;
        // Restore a restrained amount of warmth only where the opaque-buffer
        // sample is gold. White surroundings and blue ice keep their original
        // absorption; surface frost, blur and reflection remain in front.
        float goldChroma=(transmittedLight.r-transmittedLight.b)/max(.05,max(transmittedLight.r,transmittedLight.g));
        float goldMask=smoothstep(.10,.38,goldChroma)*smoothstep(.015,.10,transmittedLight.r);
        float goldReadability=.48*smoothstep(.10,.88,uMelt)*uKeyReveal;
        attenuatedColor=mix(attenuatedColor,transmittedLight.rgb*vec3(1.,.86,.55)+vec3(.035,.018,.002),goldMask*goldReadability);
      `);e.fragmentShader=e.fragmentShader.replace(`#include <transmission_pars_fragment>`,t);let n=F.transmission_fragment.replace(`n, v, material.roughness, material.diffuseContribution`,`n, v, uVolumeRoughness, material.diffuseContribution`);n=n.replace(`vec4 transmitted = getIBLVolumeRefraction(`,`
      float jellyMelt=pow(clamp(uMelt,0.,1.),1.55);
      float jellyWidth=1.-.12*jellyMelt-.10*jellyMelt*pow((vJellyLocal.y+1.)*.5,2.);
      float jellyHeight=max(.0001,1.-jellyMelt);
      float jellyDepth=jellyWidth;
      vec3 jellyRay=refract(-v,n,1./material.ior)/max(vec3(.005),vec3(jellyWidth,jellyHeight,jellyDepth));
      material.thickness=jellyPath(vJellyLocal,jellyRay);
      // Preserve the blue pigment in the original volume while only the
      // physical body and refraction compress with the melt.
      vec3 pigmentNormal=normalize(vJellyLocal-clamp(vJellyLocal,vec3(-.85),vec3(.85)));
      iceColorDepth=jellyPath(vJellyLocal,refract(-v,pigmentNormal,1./material.ior));
      vec4 transmitted = getIBLVolumeRefraction(`),n=n.replace(`material.transmissionAlpha = mix`,`
      // A restrained wrapped-backlight approximation supplies the diffusion
      // absent from screen-space physical transmission. It follows ray depth.
      float scatterDepth=1.-exp(-iceColorDepth*1.3);
      vec3 scatterHalf=normalize(vec3(-.25,.35,-1.)+n*.18);
      float scatterLight=.35+.65*pow(max(0.,dot(v,-scatterHalf)),3.);
      float scatterReveal=1.;
      transmitted.rgb+=vec3(.004,.007,.010)*scatterDepth*scatterLight*scatterReveal;
      vec3 airRay=normalize(vec3(dot(-v,normalMatrix[0]),dot(-v,normalMatrix[1]),dot(-v,normalMatrix[2])));
      float airLength=jellyPath(vJellyLocal,airRay);
      float airCloud=0.,airSpecks=0.;
      for(int sampleIndex=0;sampleIndex<4;sampleIndex++){
        vec3 p=vJellyLocal+airRay*airLength*(float(sampleIndex)+.5)*.25;
        vec3 cloudA=(p-vec3(.10,-.29,-.06))/vec3(.64,.61,.49);
        vec3 cloudB=(p-vec3(-.27,.13,.15))/vec3(.31,.42,.32);
        float envelope=exp(-dot(cloudA,cloudA)*1.9)+.45*exp(-dot(cloudB,cloudB)*2.1);
        airCloud+=envelope*smoothstep(.25,.68,iceNoise(p*9.2+vec3(1.,3.,0.)))*.25;
      }
      for(int bubble=0;bubble<${ne.length};bubble++){
        vec3 offset=uAirPockets[bubble].xyz-vJellyLocal;float along=dot(offset,airRay);
        vec3 perpendicular=offset-airRay*along;float radius=uAirPockets[bubble].w;
        float distance=length(perpendicular);
        float bead=exp(-pow(distance/(radius*.72),2.));
        float rim=exp(-pow((distance-radius*.78)/(radius*.19),2.));
        airSpecks+=(bead*.25+rim*.6)*step(0.,along)*step(along,airLength);
      }
      float airFade=1.-smoothstep(.68,.97,uMelt);
      vec3 airLight=max(vec3(.17,.195,.21),transmitted.rgb*.55);
      transmitted.rgb=mix(transmitted.rgb,transmitted.rgb*.35+airLight,min((uNaturalClarity>.5?.36:.72),airCloud*(uNaturalClarity>.5?1.9:4.3))*airFade);
      transmitted.rgb+=airLight*min(1.,airSpecks)*(uNaturalClarity>.5?.66:.85)*airFade;
      // Integrate an obscured champagne-gold heart along a continuous viewing
      // ray. Unlike face-dependent refracted rays this cannot split into eyes.
      vec3 coreCenter=vec3(0.,.04,.02);
      vec3 coreRay=-v/max(vec3(.005),vec3(jellyWidth,jellyHeight,jellyDepth));
      float coreT=max(0.,-dot(vJellyLocal-coreCenter,coreRay)/dot(coreRay,coreRay));
      vec3 corePoint=vJellyLocal+coreRay*coreT-coreCenter;
      vec3 coreDelta=corePoint/vec3(.24,.42,.24);
      float coreGlow=exp(-dot(coreDelta,coreDelta)*1.6);
      vec3 heartDelta=(corePoint+vec3(.025*sin(corePoint.y*7.),0.,0.))/vec3(.11,.27,.12);
      float heart=exp(-dot(heartDelta,heartDelta)*1.8);
      vec3 hazeDelta=corePoint/vec3(.43,.58,.43);
      float coreHaze=exp(-dot(hazeDelta,hazeDelta)*2.);
      float coreFade=1.-uKeyReveal;
      transmitted.rgb*=vec3(1.)-vec3(.03,.12,.30)*coreGlow*coreFade;
      transmitted.rgb+=(vec3(.11,.075,.024)*coreGlow+vec3(.10,.079,.045)*heart+vec3(.019,.014,.006)*coreHaze)*coreFade;
      float frozenScatter=clamp(frozenDetail.r*frozenAmount,0.,.85);
      transmitted.rgb=mix(transmitted.rgb,transmitted.rgb*.70+vec3(.012,.014,.016),frozenScatter*.40);
      material.transmission*=1.-frozenScatter*.76;
      material.transmissionAlpha = mix`),e.fragmentShader=e.fragmentShader.replace(`#include <transmission_fragment>`,n),e.fragmentShader=e.fragmentShader.replace(`#include <opaque_fragment>`,`
      float wetEdge=pow(1.-abs(dot(normal,normalize(vViewPosition))),3.);
      outgoingLight+=vec3(.018,.023,.027)*wetEdge*smoothstep(.78,1.,uMelt);
      #include <opaque_fragment>`),e.vertexShader=`uniform float uMelt;varying vec3 vJellyLocal;
`+Pe+`
`+e.vertexShader,e.vertexShader=e.vertexShader.replace(`#include <beginnormal_vertex>`,`#include <beginnormal_vertex>
      vec3 normalAxis=abs(objectNormal.y)<.9?vec3(0.,1.,0.):vec3(1.,0.,0.);
      vec3 tangent=normalize(cross(normalAxis,objectNormal));
      vec3 bitangent=cross(objectNormal,tangent);
      vec3 anchor=shapeIce(position);
      vec3 alongT=shapeIce(position+tangent*.001)-anchor;
      vec3 alongB=shapeIce(position+bitangent*.001)-anchor;
      objectNormal=normalize(cross(alongT,alongB));`),e.vertexShader=e.vertexShader.replace(`#include <begin_vertex>`,`#include <begin_vertex>
      vJellyLocal=hewnIce(position);transformed=shapeIce(position);`)},D.customProgramCacheKey=()=>`snowy-natural-hewn-ice-gpu-v9-`+ne.length+`-`+Number(c)+`-`+Number(d);let j=je(e),M=new o(j,D);M.name=`ice-body`,M.position.y=1.03,f.add(M);let N=new y({color:14476262,roughness:.94,metalness:0,transparent:!0,opacity:d?.66:.92,depthWrite:!1,envMapIntensity:.18});N.onBeforeCompile=e=>{e.uniforms.uMelt=T.uMelt,e.uniforms.uOpacity=T.uOpacity,e.uniforms.uRimeAtlas={value:h},e.vertexShader=`uniform float uMelt;varying vec3 vRimeLocal;
`+Pe+`
`+e.vertexShader,e.vertexShader=e.vertexShader.replace(`#include <begin_vertex>`,`#include <begin_vertex>
      vRimeLocal=hewnIce(position);transformed=shapeIce(position)+objectNormal*.0025*(1.-uMelt);`),e.fragmentShader=`uniform sampler2D uRimeAtlas;uniform float uMelt;uniform float uOpacity;varying vec3 vRimeLocal;
      float rimeHash(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
      float rimeNoise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
        return mix(mix(mix(rimeHash(i),rimeHash(i+vec3(1,0,0)),f.x),mix(rimeHash(i+vec3(0,1,0)),rimeHash(i+vec3(1,1,0)),f.x),f.y),mix(mix(rimeHash(i+vec3(0,0,1)),rimeHash(i+vec3(1,0,1)),f.x),mix(rimeHash(i+vec3(0,1,1)),rimeHash(i+1.),f.x),f.y),f.z);}
    `+e.fragmentShader,e.fragmentShader=e.fragmentShader.replace(`#include <alphamap_fragment>`,`#include <alphamap_fragment>
      vec3 ap=abs(vRimeLocal);float edge=min(max(ap.x,ap.y),min(max(ap.x,ap.z),max(ap.y,ap.z)));
      float cortex=smoothstep(.56,.91,edge);
      float clusters=smoothstep(.32,.70,rimeNoise(vRimeLocal*8.1+vec3(3.,1.,.7)));
      float grain=.48+.52*rimeNoise(vRimeLocal*95.);
      float basal=(1.-smoothstep(-.92,-.67,vRimeLocal.y))*.35;
      float frostPatch=smoothstep(.54,.77,rimeNoise(vRimeLocal*4.6+vec3(.5,4.,2.)))*smoothstep(-.8,.5,vRimeLocal.y);
      vec3 fw=pow(max(abs(vRimeLocal-clamp(vRimeLocal,vec3(-.85),vec3(.85))),vec3(.0001)),vec3(6.));fw/=fw.x+fw.y+fw.z;
      vec2 fuv=clamp(vRimeLocal.xy*.5+.5,vec2(.001),vec2(.999));
      vec2 suv=clamp(vec2(-vRimeLocal.z,vRimeLocal.y)*.5+.5,vec2(.001),vec2(.999));
      vec2 tuv=clamp(vRimeLocal.xz*.5+.5,vec2(.001),vec2(.999));
      float crackle=texture2D(uRimeAtlas,vec2(fuv.x/3.,fuv.y)).r*fw.z+texture2D(uRimeAtlas,vec2((suv.x+1.)/3.,suv.y)).r*fw.x+texture2D(uRimeAtlas,vec2((tuv.x+2.)/3.,tuv.y)).r*fw.y;
      diffuseColor.a*=max(max(max(cortex*clusters*1.05,basal),frostPatch*.62),max(0.,crackle-.20)*1.35)*grain*uOpacity*(1.-smoothstep(.32,.82,uMelt));`)},N.customProgramCacheKey=()=>`snowy-patchy-rime-gpu-v4-`+Number(c);let P=new o(j,N);P.name=`surface-hoar`,P.position.copy(M.position),f.add(P);let I=new _({color:14003806,roughness:.23,metalness:1,envMapIntensity:1.25,emissive:0}),re=new _({color:15848076,roughness:.14,metalness:1,envMapIntensity:1.35}),L=new _({color:13017434,roughness:.29,metalness:1,envMapIntensity:1.2}),z=e=>`uniform float uKeyReveal;
`+e.replace(`void main() {`,`void main() {
    if(uKeyReveal<.9999){float grain=fract(sin(dot(floor(gl_FragCoord.xy),vec2(12.9898,78.233)))*43758.5453);if(uKeyReveal<=0.||grain>uKeyReveal)discard;}`);for(let e of[I,re,L])e.onBeforeCompile=e=>{e.uniforms.uKeyReveal=T.uKeyReveal,e.fragmentShader=z(e.fragmentShader)},e.customProgramCacheKey=()=>`snowy-turned-gold-resolve-v1`;let B=new g({depthPacking:E});B.onBeforeCompile=e=>{e.uniforms.uKeyReveal=T.uKeyReveal,e.fragmentShader=z(e.fragmentShader)},B.customProgramCacheKey=()=>`snowy-key-shadow-resolve-v6`;let{ring:ie,shaft:V,bit:ae,collar:oe}=De(w,I,re,L,e<=32,i.compactGeometry);w.position.set(0,.14,.08),w.scale.setScalar(.7),f.add(w);let H=Fe(w),se=new k;se.name=`ambiguous-golden-core`,se.visible=!1,f.add(se);let ce=new a({color:4810100,opacity:.22,depthWrite:!1});ce.onBeforeCompile=e=>{e.uniforms.uMelt=T.uMelt,e.vertexShader=`varying vec2 vShadowFloor;
`+e.vertexShader,e.vertexShader=e.vertexShader.replace(`#include <worldpos_vertex>`,`#include <worldpos_vertex>
 vShadowFloor=(modelMatrix*vec4(transformed,1.)).xz;`),e.fragmentShader=`uniform float uMelt;varying vec2 vShadowFloor;
      float iceFoot(){return .94*(1.-.12*pow(clamp(uMelt,0.,1.),1.55));}
      vec2 iceCenter(){return vec2(0.);}
      float icePenumbra(){float gap=max(0.,max(abs(vShadowFloor.x-iceCenter().x),abs(vShadowFloor.y-iceCenter().y))-iceFoot());return mix(.32,1.,smoothstep(0.,.85,gap));}
    `+e.fragmentShader;let t=F.shadowmask_pars_fragment.replace(`directionalLight.shadowRadius,`,`directionalLight.shadowRadius * mix(icePenumbra(),1.,smoothstep(.80,1.,uMelt)),`);e.fragmentShader=e.fragmentShader.replace(`#include <shadowmask_pars_fragment>`,t),e.fragmentShader=e.fragmentShader.replace(`gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );`,`
      float edge=max(abs(vShadowFloor.x-iceCenter().x),abs(vShadowFloor.y-iceCenter().y));
      float contact=1.-smoothstep(iceFoot()*.83,iceFoot()*1.08,edge);
      float density=mix(.44+.56*contact,1.,smoothstep(.80,1.,uMelt));
      gl_FragColor=vec4(color,opacity*density*(1.-getShadowMask()));`)},ce.customProgramCacheKey=()=>`snowy-translucent-contact-shadow-v2`;let U=new o(new s(200,200),ce);U.name=`shadow-receiver`,U.rotation.x=-Math.PI/2,U.receiveShadow=!0,f.add(U),M.castShadow=!0,w.traverse(e=>{e instanceof o&&(e.castShadow=!0,e.customDepthMaterial=B)});let W=new g({depthPacking:E});W.onBeforeCompile=e=>{e.uniforms.uMelt=T.uMelt,e.vertexShader=`uniform float uMelt;
`+Pe+`
`+e.vertexShader,e.vertexShader=e.vertexShader.replace(`#include <begin_vertex>`,`#include <begin_vertex>
 transformed=shapeIce(position);`)},W.customProgramCacheKey=()=>`snowy-complete-vertical-shadow-gpu-v12`,M.customDepthMaterial=W;let le={ice:M,key:w,ring:ie,shaft:V,bit:ae,collar:oe,floor:U,core:se};f.userData.sculptRuntime={nodes:le,meshes:{root:M,ring:ie,shaft:V,bit:ae,collar:oe},sockets:{floor:new A(0,.04,0)},colliders:{ice:{type:`box`,size:[2,2,2]},key:{type:`compound`}},explodable:!0,clickable:!0};let ue=(e,t,n)=>{let r=l.clamp((n-e)/(t-e),0,1);return r*r*(3-2*r)},de=(e,t=0)=>{let n=l.clamp(e,0,1);T.uMelt.value=n;let r=Ne(n),i=Math.cbrt(r.x*r.y*r.z);D.roughness=.12+.06*ue(.72,1,n);let a=(1-ue(.978,1,n))*(1-t);T.uOpacity.value=a,D.opacity=a,M.visible=n<1&&a>1e-5,P.visible=n<.82&&a>1e-5,M.castShadow=M.visible&&n<.978;let o=ue(.04,.48,n);T.uVolumeRoughness.value=.13-.05*o,w.visible=!0,T.uKeyReveal.value=ue(.04,.18,n),I.emissiveIntensity=0,f.userData.meltwater={enabled:!1,wetness:0,runoffVisible:!1,dropsVisible:!1,area:0,visualVolume:0,filmHeight:0},f.userData.meltVisual={iceTint:D.attenuationColor.getHexString(),iceScale:i,iceOpacity:D.opacity,keyBlur:T.uVolumeRoughness.value,keyReveal:T.uKeyReveal.value,glowAlpha:1-T.uKeyReveal.value};let s=H.pose(n);w.rotation.set(-s.angle*(1-t),0,-.08*(1-t)),w.position.set(0,s.y+1.45*t,s.z*(1-t)),w.scale.setScalar(.7-.18*t),f.userData.meltDynamics={choreography:`reference-progressive`,keyAngle:s.angle,keyY:s.y,keyZ:s.z,iceCenter:[r.cx,r.cz],iceHalfSize:[r.x,r.y,r.z],remnantHeight:r.y*2},f.updateMatrixWorld(!0)};de(0);let fe=()=>{m=!0,h.dispose();let e=new Set,t=new Set;f.traverse(n=>{n instanceof o&&(e.add(n.geometry),(Array.isArray(n.material)?n.material:[n.material]).forEach(e=>t.add(e)),n instanceof S&&n.dispose())}),W.dispose(),B.dispose(),e.forEach(e=>e.dispose()),t.forEach(e=>e.dispose())};return{root:f,...le,startupTextures:[h],update:de,dispose:fe,setNaturalClarity(e){let t=c||e;b.value=+!!t,x.value=v*(t?.8:1),D.attenuationDistance=t?4.6:3.8,N.opacity=t?.66:.92}}}function Le(e={}){let t=e.highDetail??!e.lowPower,n=new k;n.name=`walnut-chest`,n.userData.highDetail=t;let r=new k;r.name=`walnut-lid-pivot`,r.position.set(0,1.06,-.9),n.add(r);let i=new d;i.name=`walnut-key-socket`,i.position.set(0,.79,.925),n.add(i);let a=new Set,s=new Set,c=new Set,u={root:n,lid:r,lockSocket:i},f=!1,m=new _({color:t?`#c4a78d`:`#b08e71`,roughness:t?.58:.68,metalness:0,clearcoat:t?.18:.08,clearcoatRoughness:t?.38:.34,normalScale:new ce(t?.32:.1,t?.32:.1)});n.userData.materialReady=!1;let g=new te,v=0,b=e.assetBase??`/assets/walnut-chest/`,x=(t,r=!1)=>{let i=g.load(`${b}${t}${e.lowPower?`-mobile`:``}.webp`,()=>{f?i.dispose():(v++,n.userData.materialReady=v===3,e.onReady?.())},void 0,()=>{f||(n.userData.materialError=!0,e.onError?.())});return i.colorSpace=r?D:``,i.anisotropy=e.lowPower?4:8,i.wrapS=i.wrapT=p,c.add(i),i};m.map=x(`walnut-color`,!0),m.normalMap=x(`walnut-normal`),m.roughnessMap=x(`walnut-roughness`),m.onBeforeCompile=e=>{e.fragmentShader=e.fragmentShader.replace(`#include <map_fragment>`,`#include <map_fragment>
    // Preserve the photographed veneer contrast instead of tinting it flat.
    diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.20,.115,.064),${t?`.055`:`.22`});`)},m.customProgramCacheKey=()=>`snowy-veneer-detail-v3-`+Number(t);let C=m.clone();C.color.set(t?`#a58c75`:`#947056`),t&&(C.onBeforeCompile=m.onBeforeCompile,C.customProgramCacheKey=m.customProgramCacheKey);let w=new _({color:`#b99656`,roughness:t?.27:.3,metalness:1,envMapIntensity:1}),T=new _({color:`#171b1e`,roughness:.98,metalness:0,sheen:.35,sheenColor:new j(`#394044`),sheenRoughness:.9});s.add(m),s.add(C),s.add(w),s.add(T);let E=e=>(a.add(e),e),ee=(e,t)=>{let n=e.getAttribute(`position`),r=e.getAttribute(`normal`),i=new Float32Array(n.count*2);for(let e=0;e<n.count;e++){let a=n.getX(e)+t.x,o=n.getY(e)+t.y,s=n.getZ(e)+t.z,c=Math.abs(r.getX(e)),l=Math.abs(r.getY(e)),u=Math.abs(r.getZ(e));l>c&&l>u?(i[e*2]=a/3.3+.5,i[e*2+1]=(s+.9)/1.8*.42+.44):c>u?(i[e*2]=s/3.3+.5,i[e*2+1]=o/1.535*.46+.15):(i[e*2]=a/3.3+.5,i[e*2+1]=o/1.535*.46+.15)}e.setAttribute(`uv`,new ne(i,2))},O=(e,t,n,i,a)=>{(n===m||n===C)&&ee(t,new A(a.x,a.y+(i===r?1.06:0),a.z+(i===r?-.9:0)));let s=new o(E(t),n);return s.name=e,s.position.copy(a),s.castShadow=!0,s.receiveShadow=!0,s.userData.partId=e,i.add(s),u[e]=s,s},N=(r,i,a,o,s,c,l,u=n,d=m)=>O(r,new z(i,a,o,e.lowPower?2:3,Math.min(t?.024:.018,i*.12,a*.12,o*.12)),d,u,new A(s,c,l));N(`bottom`,3.02,.14,1.52,0,.07,0),N(`back`,3.3,1.05,.14,0,.525,-.83),N(`side-left`,.14,1.05,1.56,-1.58,.525,0),N(`side-right`,.14,1.05,1.56,1.58,.525,0);let P=(e,t,n)=>{let r=new M,i=-e/2,a=-t/2;return r.moveTo(i+n,a),r.lineTo(i+e-n,a),r.quadraticCurveTo(i+e,a,i+e,a+n),r.lineTo(i+e,a+t-n),r.quadraticCurveTo(i+e,a+t,i+e-n,a+t),r.lineTo(i+n,a+t),r.quadraticCurveTo(i,a+t,i,a+t-n),r.lineTo(i,a+n),r.quadraticCurveTo(i,a,i+n,a),r},F=e=>{let t=new h;return t.absarc(0,e,.072,Math.PI*1.24,Math.PI*1.76,!0),t.lineTo(.088,e-.245),t.quadraticCurveTo(.092,e-.265,.07,e-.265),t.lineTo(-.07,e-.265),t.quadraticCurveTo(-.092,e-.265,-.088,e-.245),t.closePath(),t},I=P(3.3,1.05,.018);I.holes.push(F(.265)),O(`front`,new ue(I,{depth:.14,steps:1,bevelEnabled:!0,bevelSegments:2,bevelSize:.006,bevelThickness:.006,curveSegments:e.lowPower?12:20}),m,n,new A(0,.525,.76));let re=P(.31,.44,.042);re.holes.push(F(.79-.705)),O(`lock`,new ue(re,{depth:.018,steps:1,bevelEnabled:!0,bevelSegments:2,bevelSize:.004,bevelThickness:.004,curveSegments:e.lowPower?12:24}),w,n,new A(0,.705,.906)),N(`lid`,3.3,.475,1.8,0,.2375,.9,r),N(`lid-inset`,3,.018,1.5,0,-.005,.9,r,C),N(`interior`,3,.025,1.5,0,.153,0,n,T);let L=.037;for(let[t,r]of[[`hinge-a`,-1.02],[`hinge-b`,1.02]]){let i=new k;i.name=t,i.position.set(r,1.05,-.89),n.add(i),u[t]=i,N(`${t}-base`,.32,.1,.014,0,-.045,-.01,i,w);let a=O(`${t}-knuckle`,new ae(L,L,.32,e.lowPower?12:20),w,i,new A);a.rotation.z=Math.PI/2}let R=E(new ae(.014,.014,.007,e.lowPower?8:12)),B=new S(R,w,t?6:4);B.name=`hinge-screws`;let V=new d,oe=0;for(let e of[-1.12,-.92,.92,1.12])V.position.set(e,1.015,-.913),V.rotation.set(Math.PI/2,0,0),V.updateMatrix(),B.setMatrixAt(oe++,V.matrix);n.add(B);let H,U;if(t){for(let e of[.89,.51])V.position.set(0,e,.932),V.rotation.set(Math.PI/2,0,0),V.updateMatrix(),B.setMatrixAt(oe++,V.matrix);let e=new y({color:`#30281f`,roughness:.85,metalness:.22});s.add(e),H=new S(E(new se(.018,.003,.0015)),e,2),H.name=`lock-screw-slots`;for(let e=0;e<2;e++)V.position.set(0,[.89,.51][e],.9365),V.rotation.set(0,0,e?.36:-.2),V.updateMatrix(),H.setMatrixAt(e,V.matrix);n.add(H),U=new S(E(new se(.006,.94,.001)),e,2),U.name=`front-corner-joinery`;for(let e=0;e<2;e++)V.position.set(e?-1.5:1.5,.525,.9065),V.rotation.set(0,0,0),V.updateMatrix(),U.setMatrixAt(e,V.matrix);n.add(U)}u.lid=r,u[`hinge-screws`]=B;let W={};n.traverse(e=>{e instanceof o&&(W[e.name]=e)});let le=[...n.children].filter(e=>e!==i),de=new A(0,.75,0);n.updateMatrixWorld(!0);let fe=le.map(e=>({part:e,position:e.position.clone(),offset:new ie().setFromObject(e).getCenter(new A).sub(de)}));n.userData.sculptRuntime={nodes:u,meshes:W,sockets:{key:i,hinge:r},colliders:{body:{type:`compound-box`,size:[3.3,1.535,1.8]},lid:{type:`box`,size:[3.3,.475,1.8]}},destructionGroups:{body:[`front`,`back`,`side-left`,`side-right`,`bottom`].map(e=>u[e]),lid:[r]},explodable:!0,clickable:!0,setExplode(e){let t=l.clamp(e,0,1);for(let e of fe)e.part.position.copy(e.position).addScaledVector(e.offset,t*.65)}},n.userData.reference=`Walnut presentation box: proportional/material inspiration; inferred rear/interior and adapted working lock.`;let pe=e=>{r.rotation.x=-l.clamp(e,0,1)*1.83,n.userData.openProgress=l.clamp(e,0,1)};return pe(0),{root:n,lidPivot:r,keySocket:i,update:pe,dispose(){f||(f=!0,a.forEach(e=>e.dispose()),s.forEach(e=>e.dispose()),c.forEach(e=>e.dispose()),B.dispose(),H?.dispose(),U?.dispose(),n.clear())}}}function Re(e){if(e.index||Object.keys(e.morphAttributes).length)return!1;let t=Object.entries(e.attributes);if(!t.length||t.some(([,e])=>!(e instanceof ne)||!(e.array instanceof Float32Array)||`isInstancedBufferAttribute`in e))return!1;let n=t[0][1].count;if(t.some(([,e])=>e.count!==n))return!1;let r=t.map(([e,t])=>({name:e,attribute:t,words:new Uint32Array(t.array.buffer,t.array.byteOffset,t.array.length)})),i=[],a=new Uint32Array(n),o=new Map,s=0;for(let{attribute:e}of r)s+=e.itemSize*4;for(let e=0;e<n;e++){let t=``;for(let{attribute:n,words:i}of r)for(let r=0;r<n.itemSize;r++){let a=i[e*n.itemSize+r];t+=String.fromCharCode(a>>>16,a&65535)}let n=o.get(t);n===void 0&&(n=i.length,i.push(e),o.set(t,n)),a[e]=n}let c=i.length<=65535;if(i.length*s+n*(c?2:4)>=n*s)return!1;for(let{name:t,attribute:n,words:a}of r){let r=new Float32Array(i.length*n.itemSize),o=new Uint32Array(r.buffer);for(let e=0;e<i.length;e++)o.set(a.subarray(i[e]*n.itemSize,(i[e]+1)*n.itemSize),e*n.itemSize);let s=new ne(r,n.itemSize,n.normalized);s.name=n.name,s.gpuType=n.gpuType,s.setUsage(n.usage),e.setAttribute(t,s)}return e.setIndex(new ne(c?new Uint16Array(a):a,1)),!0}function ze(e={}){if(new URLSearchParams(location.search).get(`chest`)===`legacy`)return Le(e);let t=e.highDetail??!e.lowPower,n=new k;n.name=`walnut-chest`,n.userData.highDetail=t;let r=new k;r.name=`walnut-lid-pivot`,r.position.set(0,1.06,-.9),n.add(r);let i=new d;i.name=`walnut-key-socket`,i.position.set(0,.79,.925),n.add(i);let a=new Set,s=new Set,c=new Set,u={root:n,lid:r,lockSocket:i},f=!1,m=new _({color:`#c28452`,roughness:.65,metalness:0,clearcoat:.18,clearcoatRoughness:.32,normalScale:new ce(.35,.35)});n.userData.materialReady=!1;let g=new te,v=0,b=e.assetBase??(e.lowPower?`/assets/walnut-chest/`:`/assets/walnut-chest-v2/`),x=(t,r=!1)=>{let i=`${b}${t}${e.lowPower?`-mobile`:``}.webp`,a=e.compactGeometry?1:e.lowPower?3:2,o=()=>{v++,n.userData.materialReady=v===a,e.onReady?.()},s=g.load(i,e=>{f?e.dispose():o()},void 0,()=>{f||(n.userData.materialError=!0,e.onError?.())});return s.colorSpace=r?D:``,s.anisotropy=e.lowPower?4:8,s.wrapS=s.wrapT=p,c.add(s),s};m.map=x(`walnut-color`,!0),e.compactGeometry?(m.roughness=.62,m.metalness=0):(m.normalMap=x(e.lowPower?`walnut-normal`:`walnut-normal-roughness`),m.roughnessMap=e.lowPower?x(`walnut-roughness`):m.normalMap),m.onBeforeCompile=t=>{e.lowPower||(t.fragmentShader=t.fragmentShader.replace(`#include <roughnessmap_fragment>`,F.roughnessmap_fragment.replace(`texelRoughness.g`,`texelRoughness.a`))),t.fragmentShader=t.fragmentShader.replace(`#include <map_fragment>`,`#include <map_fragment>
      diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.26, 0.12, 0.05), 0.28);
    `)},m.customProgramCacheKey=()=>`snowy-crafted-walnut-v4-`+Number(!!e.lowPower);let C=m.clone();C.color.set(`#c2a78b`),C.onBeforeCompile=m.onBeforeCompile,C.customProgramCacheKey=m.customProgramCacheKey;let w=new _({color:`#c29542`,roughness:.32,metalness:.88,clearcoat:.3,envMapIntensity:1.2}),T=new _({color:`#171b1e`,roughness:.98,metalness:0,sheen:.35,sheenColor:new j(`#394044`),sheenRoughness:.9});s.add(m),s.add(C),s.add(w),s.add(T);let E=e=>(a.add(e),e),ee=(e,t,n)=>{let r=e.getAttribute(`position`),i=e.getAttribute(`normal`),a=new Float32Array(r.count*2);for(let e=0;e<r.count;e++){let o=r.getX(e)+t.x,s=r.getY(e)+t.y,c=r.getZ(e)+t.z,l=Math.abs(i.getX(e)),u=Math.abs(i.getY(e)),d=Math.abs(i.getZ(e)),f=1/3.3;u>l&&u>d?(a[e*2]=(n.includes(`stile`)?c:o)*f+.5,a[e*2+1]=(n.includes(`stile`)?o:c)*f+.48):l>d?(a[e*2]=c*f+.37,a[e*2+1]=s*f+.23):n.includes(`stile`)?(a[e*2]=s*f+.16,a[e*2+1]=o*f+.5):(a[e*2]=o*f+.5,a[e*2+1]=s*f+.15)}e.setAttribute(`uv`,new ne(a,2))},O=(e,t,n,i,a)=>{(n===m||n===C)&&ee(t,new A(a.x,a.y+(i===r?1.06:0),a.z+(i===r?-.9:0)),e);let s=new o(E(t),n);return s.name=e,s.position.copy(a),s.castShadow=!0,s.receiveShadow=!0,s.userData.partId=e,i.add(s),u[e]=s,s},N=new Map,P=(e,t,n,r,i)=>{let a=`${e}_${t}_${n}_${r}_${i}`,o=N.get(a);return o||(o=new z(e,t,n,r,i),N.set(a,o)),o.clone()},I=(r,i,a,o,s,c,l,u=n,d=m)=>O(r,P(i,a,o,e.compactGeometry?1:e.lowPower?2:3,Math.min(t?.024:.018,i*.12,a*.12,o*.12)),d,u,new A(s,c,l));I(`bottom`,3.02,.14,1.52,0,.07,0),I(`back`,3.3,1.05,.14,0,.525,-.83),I(`side-left`,.14,1.05,1.56,-1.58,.525,0),I(`side-right`,.14,1.05,1.56,1.58,.525,0);let re=(e,t,n)=>{let r=new M,i=-e/2,a=-t/2;return r.moveTo(i+n,a),r.lineTo(i+e-n,a),r.quadraticCurveTo(i+e,a,i+e,a+n),r.lineTo(i+e,a+t-n),r.quadraticCurveTo(i+e,a+t,i+e-n,a+t),r.lineTo(i+n,a+t),r.quadraticCurveTo(i,a+t,i,a+t-n),r.lineTo(i,a+n),r.quadraticCurveTo(i,a,i+n,a),r},L=e=>{let t=new h;return t.absarc(0,e,.072,Math.PI*1.24,Math.PI*1.76,!0),t.lineTo(.088,e-.245),t.quadraticCurveTo(.092,e-.265,.07,e-.265),t.lineTo(-.07,e-.265),t.quadraticCurveTo(-.092,e-.265,-.088,e-.245),t.closePath(),t},R=re(3.3,1.05,.018);R.holes.push(L(.265)),O(`front`,new ue(R,{depth:.14,steps:1,bevelEnabled:!0,bevelSegments:2,bevelSize:.006,bevelThickness:.006,curveSegments:e.lowPower?12:20}),m,n,new A(0,.525,.76));let B=re(.31,.44,.042);B.holes.push(L(.79-.705)),O(`lock`,new ue(B,{depth:.018,steps:1,bevelEnabled:!0,bevelSegments:2,bevelSize:.004,bevelThickness:.004,curveSegments:e.lowPower?12:24}),w,n,new A(0,.705,.906)),I(`lid`,3.3,.445,1.8,0,.2225,.9,r),I(`lid-inset`,3,.018,1.5,0,-.005,.9,r,C),I(`interior`,3,.025,1.5,0,.153,0,n,T);let V=[];if(!e.compactGeometry){V.push(I(`lid-panel`,2.99,.018,1.49,0,.449,.9,r));for(let e of[.06,1.74])V.push(I(`lid-rail`,3.3,.03,.12,0,.46,e,r));for(let e of[-1.59,1.59])V.push(I(`lid-stile`,.12,.03,1.56,e,.46,.9,r));for(let e of[.055,.995])V.push(I(`front-rail`,3.15,.09,.022,0,e,.918));for(let e of[-1.575,1.575])V.push(I(`front-stile`,.1,.85,.022,e,.525,.918))}for(let e of[n,r]){let t=V.filter(t=>t.parent===e);if(t.length===0)continue;let r=[];for(let n of t)n.updateMatrix(),r.push(n.geometry.clone().applyMatrix4(n.matrix)),e.remove(n),a.delete(n.geometry),n.geometry.dispose(),u[n.name]===n&&delete u[n.name];let i=U(r);if(r.forEach(e=>e.dispose()),i){let t=new o(E(i),m);t.name=e===n?`crafted-front-frame`:`crafted-lid-frame`,t.castShadow=!0,t.receiveShadow=!0,e.add(t),u[t.name]=t}}let oe=.037,H,W;if(!e.compactGeometry){for(let[t,r]of[[`hinge-a`,-1.02],[`hinge-b`,1.02]]){let i=new k;i.name=t,i.position.set(r,1.05,-.89),n.add(i),u[t]=i,I(`${t}-base`,.32,.1,.014,0,-.045,-.01,i,w);let a=O(`${t}-knuckle`,new ae(oe,oe,.32,e.lowPower?12:20),w,i,new A);a.rotation.z=Math.PI/2}let r=E(new ae(.014,.014,.007,e.lowPower?8:12));H=new S(r,w,t?6:4),H.name=`hinge-screws`;let i=new d,a=0;for(let e of[-1.12,-.92,.92,1.12])i.position.set(e,1.015,-.913),i.rotation.set(Math.PI/2,0,0),i.updateMatrix(),H.setMatrixAt(a++,i.matrix);if(n.add(H),t){for(let e of[.89,.51])i.position.set(0,e,.932),i.rotation.set(Math.PI/2,0,0),i.updateMatrix(),H.setMatrixAt(a++,i.matrix);let e=new y({color:`#30281f`,roughness:.85,metalness:.22});s.add(e),W=new S(E(new se(.018,.003,.0015)),e,2),W.name=`lock-screw-slots`;for(let e=0;e<2;e++)i.position.set(0,[.89,.51][e],.9365),i.rotation.set(0,0,e?.36:-.2),i.updateMatrix(),W.setMatrixAt(e,i.matrix);n.add(W)}}u.lid=r,H&&(u[`hinge-screws`]=H),a.forEach(Re);let le={};n.traverse(e=>{e instanceof o&&(le[e.name]=e)});let de=[...n.children].filter(e=>e!==i),fe=new A(0,.75,0);n.updateMatrixWorld(!0);let pe=de.map(e=>({part:e,position:e.position.clone(),offset:new ie().setFromObject(e).getCenter(new A).sub(fe)}));n.userData.sculptRuntime={nodes:u,meshes:le,sockets:{key:i,hinge:r},colliders:{body:{type:`compound-box`,size:[3.3,1.535,1.8]},lid:{type:`box`,size:[3.3,.475,1.8]}},destructionGroups:{body:[`front`,`back`,`side-left`,`side-right`,`bottom`].map(e=>u[e]),lid:[r]},explodable:!0,clickable:!0,setExplode(e){let t=l.clamp(e,0,1);for(let e of pe)e.part.position.copy(e.position).addScaledVector(e.offset,t*.65)}},n.userData.reference=`Walnut presentation box: proportional/material inspiration; inferred rear/interior and adapted working lock.`;let me=e=>{r.rotation.x=-l.clamp(e,0,1)*1.83,n.userData.openProgress=l.clamp(e,0,1)};return me(0),{root:n,lidPivot:r,keySocket:i,update:me,dispose(){f||(f=!0,N.forEach(e=>e.dispose()),N.clear(),a.forEach(e=>e.dispose()),s.forEach(e=>e.dispose()),c.forEach(e=>{e.dispose(),e.image instanceof ImageBitmap&&e.image.close()}),H?.dispose(),W?.dispose(),n.clear())}}}var G=`
  uniform sampler2D uAuroraMap;
  uniform float uAuroraIntensity;
  uniform float uAuroraGroundStrength;
  uniform float uAuroraPortrait;
  uniform float uAuroraTime;
  uniform float uAuroraNatureBounce;
  uniform vec4 uAuroraCrop;
  uniform vec2 uAuroraProjection;
  uniform mat3 uAuroraViewToWorld;
  uniform mat3 uAuroraWorldToView;

  vec3 auroraLinear(vec3 s){
    return mix(s/12.92,pow((s+.055)/1.055,vec3(2.4)),step(vec3(.04045),s));
  }
  float auroraHash(vec2 p){
    p=fract(p*vec2(123.34,456.21));
    p+=dot(p,p+45.32);return fract(p.x*p.y);
  }
  float auroraNoise(vec2 p){
    vec2 i=floor(p),f=fract(p);
    f=f*f*f*(f*(f*6.-15.)+10.);
    return mix(mix(auroraHash(i),auroraHash(i+vec2(1.,0.)),f.x),
               mix(auroraHash(i+vec2(0.,1.)),auroraHash(i+vec2(1.)),f.x),f.y);
  }
  vec3 auroraRadiance(vec2 uv,bool showDetail){
    float t=uAuroraTime*1.4641;
    // Coherent, non-repeating local fold transport. The lower curtain shears
    // more than its upper veil, rather than translating the image rigidly.
    float broad=auroraNoise(vec2(uv.x*3.4-t*.085,uv.y*1.7+t*.033));
    float folds=auroraNoise(vec2(uv.x*7.3+t*.14,uv.y*2.4-t*.047));
    float lift=auroraNoise(vec2(uv.x*4.7-t*.10,uv.y*2.8+t*.041));
    float lower=1.-smoothstep(.15,.92,uv.y);
    vec2 p=uv+vec2((broad-.5)*.030+(folds-.5)*.015*lower,
                   (lift-.5)*.023+(broad-.5)*.008*lower);
    if(p.x<0.||p.x>1.||p.y<0.||p.y>1.)return vec3(0.);
    vec4 texel=texture2D(uAuroraMap,p);
    vec3 linear=auroraLinear(texel.rgb);
    float sourceEnergy=max(linear.r,max(linear.g,linear.b))*texel.a;
    float veilWeight=mix(.78,1.08,smoothstep(.025,.45,sourceEnergy));
    if(showDetail){
      // Reference-image pixel scales stay stable at both1x/2x resolutions. Alpha
      // confidence protects the cutout edge; bright cores receive less contrast.
      vec2 fineOffset=vec2(2.75/2054.,0.);
      vec2 broadOffset=vec2(10./2054.,5./766.);
      vec4 fl=texture2D(uAuroraMap,p-fineOffset),fr=texture2D(uAuroraMap,p+fineOffset);
      vec4 bl=texture2D(uAuroraMap,p-broadOffset),br=texture2D(uAuroraMap,p+broadOffset);
      vec3 weights=vec3(.2126,.7152,.0722);
      float y=dot(linear,weights);
      float fineY=dot((auroraLinear(fl.rgb)+auroraLinear(fr.rgb))*.5,weights);
      float broadY=dot((auroraLinear(bl.rgb)+auroraLinear(br.rgb))*.5,weights);
      float confidence=min(texel.a,min(min(fl.a,fr.a),min(bl.a,br.a)));
      float gate=smoothstep(.40,.85,confidence)*(1.-smoothstep(.45,.75,y));
      float delta=((y-fineY)*.34+(y-broadY)*.55)*gate;
      float ratio=clamp(1.+delta/max(.025,y),.86,1.22);
      linear*=ratio;
    }
    // Retain faint source information while reducing its weakest veil.
    float coverage=pow(texel.a,1.35)*veilWeight;
    float violet=smoothstep(.05,.35,texel.b-texel.g);
    float luminance=dot(linear,vec3(.2126,.7152,.0722));
    vec3 colour=mix(vec3(luminance),linear,.98);
    // Broad travelling patches of emission: no evenly spaced synthetic rays
    // and no scene-wide breathing pulse. Sky and snow share this exact field.
    float transport=auroraNoise(vec2(uv.x*5.6-t*.19,uv.y*.75+t*.026));
    float emission=.90+.19*transport;
    vec3 light=colour*coverage*mix(1.,.75,violet)*emission;
    return light*uAuroraIntensity;
  }
  vec3 auroraRadiance(vec2 uv){return auroraRadiance(uv,true);}

  vec4 auroraSourceBounds(){
    float portraitTop=min(.975,uAuroraCrop.w+uAuroraCrop.y-.035);
    return uAuroraPortrait>.5?vec4(.03,portraitTop-.27,.94,.27):vec4(.11,.470,.78,.545);
  }
  // Identical screen-to-sky mapping for the visible curtain and its lighting.
  vec3 auroraPlateRadiance(vec2 plateUv,bool detail){
    vec4 bounds=auroraSourceBounds();
    vec2 uv=(plateUv-bounds.xy)/bounds.zw;
    if(uv.y<0.||uv.y>1.)return vec3(0.);
    float aperture=smoothstep(.04,.14,plateUv.x)*(1.-smoothstep(.86,.96,plateUv.x));
    aperture*=smoothstep(uAuroraPortrait>.5?.515:.490,uAuroraPortrait>.5?.575:.535,plateUv.y);
    return auroraRadiance(uv,detail)*aperture*smoothstep(.04,.18,uv.y);
  }
  vec3 auroraDirectionFromPlate(vec2 plateUv){
    vec2 ndc=((plateUv-uAuroraCrop.zw)/uAuroraCrop.xy)*2.-1.;
    return normalize(uAuroraViewToWorld*vec3(ndc*uAuroraProjection,-1.));
  }
  vec3 auroraEnvironmentRadiance(vec3 worldDirection){
    vec3 viewDirection=uAuroraWorldToView*worldDirection;
    if(viewDirection.z>=-.0001||worldDirection.y<=0.)return vec3(0.);
    vec2 screenUv=(viewDirection.xy/(-viewDirection.z)/uAuroraProjection)*.5+.5;
    return auroraPlateRadiance(screenUv*uAuroraCrop.xy+uAuroraCrop.zw,false);
  }
  // Cosine/solid-angle quadrature of the actual animated visible sky. Evaluate
  // in the vertex stage: snow has a constant upward normal, so doing this in
  // every fragment would add cost without adding any spatial information.
  vec3 auroraDiffuseIrradiance(vec3 worldNormal){
    vec4 bounds=auroraSourceBounds();
    vec2 extent=2.*uAuroraProjection*bounds.zw/uAuroraCrop.xy;
    vec3 irradiance=vec3(0.);
    for(int row=0;row<6;row++)for(int column=0;column<8;column++){
      vec2 uv=(vec2(float(column),float(row))+.5)/vec2(8.,6.);
      vec2 plateUv=bounds.xy+uv*bounds.zw;
      vec2 ndc=((plateUv-uAuroraCrop.zw)/uAuroraCrop.xy)*2.-1.;
      vec3 viewRay=vec3(ndc*uAuroraProjection,-1.);
      float rayLength=length(viewRay);
      vec3 lightDirection=(uAuroraViewToWorld*viewRay)/rayLength;
      float solidAngle=extent.x*extent.y/(48.*rayLength*rayLength*rayLength);
      float cosine=max(0.,dot(worldNormal,lightDirection));
      irradiance+=auroraPlateRadiance(plateUv,false)*cosine*solidAngle;
    }
    return irradiance;
  }
  vec3 auroraRoughReflection(vec3 direction,float roughness){
    vec3 axis=abs(direction.y)<.95?vec3(0.,1.,0.):vec3(1.,0.,0.);
    vec3 tangent=normalize(cross(direction,axis)),bitangent=cross(direction,tangent);
    float spread=max(.001,roughness*roughness*.65);
    return auroraEnvironmentRadiance(direction)*.40
      +auroraEnvironmentRadiance(normalize(direction+tangent*spread))*.15
      +auroraEnvironmentRadiance(normalize(direction-tangent*spread))*.15
      +auroraEnvironmentRadiance(normalize(direction+bitangent*spread))*.15
      +auroraEnvironmentRadiance(normalize(direction-bitangent*spread))*.15;
  }
  // Preserve the photographed base. Added diffuse light is spatially stationary
  // for equal surface normals: no screen-space travelling pools, colour split,
  // independent noise, brightness threshold or artificial disappearance gate.
  vec3 auroraNatureReceive(vec2 uv,vec3 surface,float localFire,float receiver,vec3 irradiance){
    float snowBrightness=smoothstep(.010,.075,max(surface.g,surface.b));
    float snowColour=smoothstep(.48,.94,min(surface.g,surface.b)/max(.001,surface.r));
    float substrate=snowBrightness*snowColour;
    float albedo=sqrt(max(.001,dot(surface,vec3(.2126,.7152,.0722))));
    // Base photograph is not a measured albedo. This conservative response
    // keeps its grain and exposure; the source itself is LDR, not calibrated HDR.
    vec3 light=vec3(albedo)*irradiance*(1./3.14159265)*uAuroraGroundStrength;
    float warmPriority=1.-.90*clamp(localFire,0.,1.);
    return light*receiver*substrate*warmPriority;
  }

  vec3 auroraNatureBackdropLight(vec2 uv,vec3 surface,float nonSky,vec3 irradiance){
    float ground=1.-smoothstep(.385,.455,uv.y);
    float canopy=smoothstep(.30,.43,uv.y)*(1.-smoothstep(.84,.98,uv.y));
    float receiver=max(ground,canopy*.55)*clamp(nonSky,0.,1.);
    vec2 fireDelta=(uv-vec2(.577,.263))/vec2(.16,.065);
    float localFire=exp(-dot(fireDelta,fireDelta));
    return auroraNatureReceive(uv,surface,localFire,receiver,irradiance);
  }

  vec3 auroraSnowLight(vec2 uv,vec3 snow,vec3 irradiance){
    float ground=1.-smoothstep(.365,.425,uv.y);
    vec2 pit=vec2(.5,uAuroraPortrait>.5?.335:.250);
    vec2 d=(uv-pit)/vec2(uAuroraPortrait>.5?.14:.15,uAuroraPortrait>.5?.035:.060);
    return auroraNatureReceive(uv,snow,exp(-dot(d,d)),ground,irradiance);
  }

  vec3 auroraDiffuseSnowLight(vec2 uv,vec3 snow,float localFire,vec3 irradiance){
    float ground=1.-smoothstep(.385,.455,uv.y);
    return auroraNatureReceive(uv,snow,localFire,ground,irradiance);
  }
`;function Be(e,t,n,r,i,a){let c=new s(80,80);c.rotateX(-Math.PI/2),c.translate(0,-.006,0);let l={value:e},u={value:new R(1,1,0,0)},d={value:0},f={value:0},p={value:1},m={value:r.position.clone()},h={value:0},g={value:new R},_={value:new R},v={value:new ce},b={value:0},x=new y({color:16777215,roughness:1,metalness:0,toneMapped:!1});x.onBeforeCompile=e=>{Object.assign(e.uniforms,{...be,...i,uPhoneGround:b,uWoodFoot:g,uIceFoot:_,uFootAngles:v,uSnowBackdrop:l,uSnowCrop:u,uCloseCamp:d,uHighDetail:f,uIceStrength:p,uFirePosition:m,uFireFlicker:h}),a&&(e.uniforms.uSharedIrradiance=a),e.vertexShader=(a?`uniform sampler2D uSharedIrradiance;
`:``)+`varying vec3 vSnowWorld;varying vec4 vSnowClip;varying vec3 vAuroraIrradiance;
`+G+`
`+e.vertexShader,e.vertexShader=e.vertexShader.replace(`#include <project_vertex>`,`#include <project_vertex>
      vSnowWorld=(modelMatrix*vec4(transformed,1.)).xyz;vSnowClip=gl_Position;vAuroraIrradiance=${a?`texelFetch(uSharedIrradiance,ivec2(0),0).rgb`:i.uAuroraGroundStrength.value>0?`auroraDiffuseIrradiance(vec3(0.,1.,0.))`:`vec3(0.)`};`),e.fragmentShader=`uniform float uHighDetail;uniform float uCloseCamp;${we}
 uniform sampler2D uSnowBackdrop;uniform vec4 uSnowCrop;uniform float uIceStrength;uniform vec3 uFirePosition;uniform float uFireFlicker;uniform vec4 uWoodFoot;uniform vec4 uIceFoot;uniform vec2 uFootAngles;uniform float uPhoneGround;
      varying vec3 vSnowWorld;varying vec4 vSnowClip;varying vec3 vAuroraIrradiance;
      ${G}
      vec3 snowSkyBase(vec3 direction){
        vec3 viewDirection=uAuroraWorldToView*direction;
        if(viewDirection.z>=-.0001)return vec3(.012,.023,.040);
        vec2 screenUv=(viewDirection.xy/(-viewDirection.z)/uAuroraProjection)*.5+.5;
        vec2 plateUv=screenUv*uSnowCrop.xy+uSnowCrop.zw;
        if(any(lessThan(plateUv,vec2(0.)))||any(greaterThan(plateUv,vec2(1.))))return vec3(.012,.023,.040);
        return textureLod(uSnowBackdrop,plateUv,4.).rgb;
      }
      float footDistance(vec2 p,vec2 center,vec2 halfSize,float angle){p-=center;float c=cos(angle),s=sin(angle);p=mat2(c,s,-s,c)*p;vec2 q=abs(p)-halfSize;return length(max(q,0.))+min(max(q.x,q.y),0.);}
      float footprint(vec2 p,vec2 center,vec2 halfSize,float angle){return exp(-pow(max(footDistance(p,center,halfSize,angle),0.),2.)*32.);}
    `+e.fragmentShader,e.fragmentShader=e.fragmentShader.replace(`#include <shadowmap_pars_fragment>`,`#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>`),e.fragmentShader=e.fragmentShader.replace(`#include <opaque_fragment>`,`
      vec2 uv=(vSnowClip.xy/vSnowClip.w*.5+.5)*uSnowCrop.xy+uSnowCrop.zw;
      vec3 plate=campPlateColor(uSnowBackdrop,uv,uCloseCamp);
      float wood=footprint(vSnowWorld.xz,uWoodFoot.xy,uWoodFoot.zw,uFootAngles.x);
      float ice=footprint(vSnowWorld.xz,uIceFoot.xy,uIceFoot.zw,uFootAngles.y)*uIceStrength;
      float nearGround=1.-smoothstep(9.,19.,length(vSnowWorld.xz));
      float shadowMask=getShadowMask();
      float attenuation=mix(1.,mix(.60,1.,shadowMask)*(1.-.48*max(wood,ice)),nearGround);
      vec2 fireDelta=vSnowWorld.xz-uFirePosition.xz;
      float fireRadius2=dot(fireDelta,fireDelta);
      float firePool=exp(-fireRadius2*.65);
      if(uPhoneGround>.5){
        float woodScale=max(.05,uWoodFoot.z/1.65),iceScale=max(.05,uIceFoot.z);
        float woodDistance=max(0.,footDistance(vSnowWorld.xz,uWoodFoot.xy,uWoodFoot.zw,uFootAngles.x));
        float iceDistance=max(0.,footDistance(vSnowWorld.xz,uIceFoot.xy,uIceFoot.zw,uFootAngles.y));
        float woodContact=exp(-pow(woodDistance/(woodScale*.32),2.));
        float iceContact=exp(-pow(iceDistance/(iceScale*.25),2.))*uIceStrength;
        // Scale the contact field with the props, rather than world origin.
        // A narrow occlusion seam and broad penumbra seat each base in snow.
        float woodSeam=exp(-pow(woodDistance/(woodScale*.065),2.));
        float iceSeam=exp(-pow(iceDistance/(iceScale*.055),2.))*uIceStrength;
        attenuation=mix(.68,1.,shadowMask)
          *(1.-.30*woodContact-.15*woodSeam)
          *(1.-.19*iceContact-.10*iceSeam);
      }
      if(uCloseCamp<.5||uHighDetail<.5){
        // Retain the portrait/mobile composition and fire response.
        outgoingLight=max(vec3(0.),(plate+auroraSnowLight(uv,plate,vAuroraIrradiance))*attenuation+vec3(.04,.010,.002)*firePool*uFireFlicker);
        if(uPhoneGround>.5){
          float metric=max(1.,uWoodFoot.z/1.65);
          float falloff=exp(-fireRadius2/(metric*metric)*.30);
          vec3 fireBounce=vec3(.060,.019,.004)*pow(max(plate,vec3(0.)),vec3(.55))*falloff*(1.+uFireFlicker);
          outgoingLight+=fireBounce*attenuation;
        }
      }else{
        float fireRadius=sqrt(fireRadius2);
        // Diffuse incidence from a finite-height emitter, plus broad secondary
        // bounce. This is a controlled photographic relight, not a simulation.
        float emitterHeight=.90;
        float sourceDistance2=fireRadius2+emitterHeight*emitterHeight;
        float directFalloff=(emitterHeight*emitterHeight/sourceDistance2)
          *(emitterHeight/sqrt(sourceDistance2));
        float diffuseBounce=1./(1.+fireRadius2*.38);
        float range=1.-smoothstep(4.5,8.,fireRadius);
        float warmFalloff=(.74*directFalloff+.26*diffuseBounce)*range;
        float localFire=exp(-fireRadius2*.20);
        vec3 skyBounce=auroraDiffuseSnowLight(uv,plate,localFire,vAuroraIrradiance);
        vec3 snowResponse=pow(max(plate,vec3(0.)),vec3(.55));
        // Avoid laying a second saturated orange pool over the photograph's
        // already-warm coals. Cool snow can accept a little more bounce.
        float bakedWarm=smoothstep(.015,.10,max(0.,plate.r-plate.b*1.15));
        float warmHeadroom=1.-.65*bakedWarm;
        // The same 7.1/13.7 Hz field already drives FlameVideo's point light;
        // keep the ground in phase, without a separate clock or whole-page pulse.
        float fireEnergy=1.+uFireFlicker;
        vec3 fireBounce=vec3(.110,.034,.007)*snowResponse*warmFalloff
          *warmHeadroom*fireEnergy;
        outgoingLight=max(vec3(0.),(plate+skyBounce+fireBounce)*attenuation);
      }
      // Fixed patches of thin ice crust receive the actual reflected curtain.
      // Coverage/normal variations are material structure, never an animation.
      float crustA=auroraNoise(vSnowWorld.xz*.23+vec2(1.7,4.9));
      float crustB=auroraNoise(vSnowWorld.xz*.67+vec2(8.3,.6));
      float crust=smoothstep(.30,.67,crustA*.70+crustB*.30);
      float snowReceiver=smoothstep(.018,.075,plate.b)*smoothstep(.60,.98,plate.b/max(.001,plate.r));
      float openGround=1.-smoothstep(.375,.445,uv.y);
      openGround*=smoothstep(.18,.32,uv.x)*(1.-smoothstep(.88,.97,uv.x));
      float reflectionWeight=crust*snowReceiver*openGround;
      if(uAuroraGroundStrength>0.&&reflectionWeight>.025){
        // Match the photographed ground horizon. The picture is a projected
        // receiver, so its apparent plane differs slightly from the prop plane.
        float horizonNdc=((.49-uSnowCrop.w)/uSnowCrop.y)*2.-1.;
        vec3 photoNormal=normalize(vec3(0.,1.,horizonNdc*uAuroraProjection.y));
        vec3 snowNormal=normalize(uAuroraViewToWorld*photoNormal+vec3((crustA-.5)*.035,0.,(crustB-.5)*.035));
        vec3 viewer=normalize(cameraPosition-vSnowWorld);
        float grazing=1.-max(0.,dot(snowNormal,viewer));
        float fresnel=.018+(1.-.018)*pow(grazing,5.);
        vec3 reflectedDirection=reflect(-viewer,snowNormal);
        vec3 reflectedSky=auroraRoughReflection(reflectedDirection,.18+.14*(1.-crust));
        float firePriority=1.-.88*firePool;
        float filmWeight=fresnel*reflectionWeight*.85*firePriority;
        vec3 skyBase=snowSkyBase(reflectedDirection);
        outgoingLight=outgoingLight*(1.-filmWeight)+(skyBase+reflectedSky)*(filmWeight*attenuation);
      }
      #include <opaque_fragment>`)},x.customProgramCacheKey=()=>`snowy-phone-contact-v3`+(a?`-shared-f32-v1`:``);let S=new k;S.name=`photographic-snow-ground`;let C=new o(c,x);C.receiveShadow=!0,S.add(C);let w=(e,t,n)=>{let r=[],i=[];for(let e=0;e<=128;e++){let a=e/128*Math.PI*2,o=Math.cos(a),s=Math.sin(a),c=Math.min((t-.018)/Math.max(1e-4,Math.abs(o)),(n-.018)/Math.max(1e-4,Math.abs(s))),l=Math.min((t+.13)/Math.max(1e-4,Math.abs(o)),(n+.13)/Math.max(1e-4,Math.abs(s))),u=.018+.008*Math.sin(a*19)+.005*Math.sin(a*43+1);if(r.push(o*c,u,s*c,o*l,-.006,s*l),e<128){let t=e*2;i.push(t,t+2,t+1,t+1,t+2,t+3)}}let a=new L;a.setAttribute(`position`,new fe(r,3)),a.setIndex(i),a.computeVertexNormals();let s=new o(a,x);return s.position.copy(e.position),s.position.y=0,s.rotation.y=e.rotation.y,s.receiveShadow=!0,S.add(s),s},T=t.scale.x,E=n.scale.x,D=w(t,1.65*T,.9*T),ee=w(n,E,E);return{root:S,setBackground(t){e=t,l.value=t},update(i,a,o){g.value.set(t.position.x,t.position.z,1.65*t.scale.x,.9*t.scale.z),_.value.set(n.position.x,n.position.z,n.scale.x,n.scale.z),v.value.set(t.rotation.y,n.rotation.y),b.value=+!!e.userData.integratedPhone,D.visible=b.value<.5,ee.visible=b.value<.5,D.position.set(t.position.x,0,t.position.z),D.rotation.y=t.rotation.y,D.scale.set(t.scale.x/T,b.value?t.scale.x*2.5:1,t.scale.z/T),ee.position.set(n.position.x,0,n.position.z),ee.rotation.y=n.rotation.y,ee.scale.set(n.scale.x/E,1,n.scale.z/E),d.value=+!!e.userData.closeCamp,f.value=+!!e.userData.highDetail,p.value=(1-i)*(1-a),ee.scale.y=p.value*(b.value?n.scale.x*2.5:1),ee.visible=b.value<.5&&p.value>.01,u.value.set(e.repeat.x,e.repeat.y,e.offset.x,e.offset.y),m.value.copy(r.position),h.value=.055*Math.sin(o*7.1)+.025*Math.sin(o*13.7)},dispose(){c.dispose(),D.geometry.dispose(),ee.geometry.dispose(),x.dispose()}}}function Ve(e){let t=e.assetBase??`/assets/realistic-winter`,n=e.maxTextureSize>=4108,r=e.lowPower?`aurora-mobile-v1.webp`:`aurora-user-original-v1.webp`,i=!1,a=!1,c=!1,u=new AbortController,d={value:new R(1,1,0,0)},f=new I,p=new te().load(`${t}/${r}`,()=>{i?p.dispose():(f.image=p.image,f.needsUpdate=!0,c=!0,e.onReady?.())},void 0,t=>{console.error(`[SKY TEXTURE ERROR]`,t),i||e.onError?.()});f.colorSpace=``,f.generateMipmaps=!1,f.minFilter=f.magFilter=C;let m={uAuroraMap:{value:f},uAuroraIntensity:{value:e.intensity??.62},uAuroraGroundStrength:{value:0},uAuroraPortrait:{value:0},uAuroraTime:{value:0},uAuroraNatureBounce:{value:0},uAuroraCrop:d,uAuroraProjection:{value:new ce(1,1)},uAuroraViewToWorld:{value:new v},uAuroraWorldToView:{value:new v}},h={value:null},g={value:0},_=!1,y=[],x=()=>{let e=y[+!!_];h.value=e,g.value=+!!e?.image},S=new te,w=n=>{let r=+!!n;if(y[r]?.image)return;let a=n?`aurora-sky-portrait-mask.webp`:`aurora-sky-landscape-enhanced-mask-v1.webp`,o=t=>{i?t.dispose():(y[r]?.dispose(),y[r]=t,x(),e.onReady?.())},s=S.load(t+`/`+a,()=>{o(s)},void 0,()=>{i||e.onError?.()});s.colorSpace=``,s.generateMipmaps=!1,s.minFilter=s.magFilter=C};w(typeof window<`u`&&matchMedia(`(orientation: portrait), (max-width: 699px)`).matches);let T=new b({transparent:!0,blending:1,depthWrite:!1,depthTest:!0,toneMapped:!1,uniforms:{...m,uPlate:{value:null},uHasPlate:{value:0},uSkyMask:h,uHasSkyMask:g,uSkyGate:{value:new ce(...e.skyBlueGate??[.68,.9])},uCrop:d},vertexShader:`varying vec2 vUv;varying vec3 vAuroraIrradiance;
      ${G}
      void main(){vUv=uv;vAuroraIrradiance=vec3(0.);gl_Position=vec4(position.xy,.9999999,1.);}`,fragmentShader:`precision highp float;uniform sampler2D uPlate;uniform sampler2D uSkyMask;uniform float uHasSkyMask;uniform vec2 uSkyGate;uniform vec4 uCrop;uniform float uHasPlate;varying vec2 vUv;varying vec3 vAuroraIrradiance;
      ${G}
      void main(){
        if(uHasPlate<.5)discard;
        vec2 plateUv=vUv*uCrop.xy+uCrop.zw;
        vec3 plate=texture2D(uPlate,plateUv).rgb;
        // At forest/horizon boundaries only, distinguish blue sky from branches.
        vec3 maskPlate=texture2D(uPlate,plateUv,2.).rgb;
        float blueSky=smoothstep(uSkyGate.x,uSkyGate.y,(maskPlate.b-maskPlate.r)/max(.001,maskPlate.b));
        blueSky=max(blueSky,smoothstep(.28,.65,max(maskPlate.r,max(maskPlate.g,maskPlate.b))));
        float maskRisk=max(max(1.-smoothstep(.24,.36,plateUv.x),smoothstep(.68,.80,plateUv.x)),1.-smoothstep(.56,.65,plateUv.y));
        float coverage=mix(mix(1.,blueSky,maskRisk),texture2D(uSkyMask,plateUv).r,uHasSkyMask);
        vec3 emission=auroraPlateRadiance(plateUv,true)*coverage;
        // Composite in linear light, then encode once. Additive blending of
        // already encoded pixels was lifting the blue-grey photographic haze.
        // Reuse the existing sky mask: white snow on branches can receive
        // diffuse light, but open sky and dark trunks cannot receive a wash.
        vec3 snowLight=uAuroraGroundStrength>0.?(uAuroraNatureBounce>.5
          ?auroraNatureBackdropLight(plateUv,plate,1.-coverage,vAuroraIrradiance)
          :auroraSnowLight(plateUv,plate,vAuroraIrradiance)):vec3(0.);
        gl_FragColor=vec4(plate+emission+snowLight,1.);
        #include <colorspace_fragment>
      }`}),E=new o(new s(2,2),T);return E.name=`user-original-aurora`,E.frustumCulled=!1,E.renderOrder=-20,{root:E,lighting:m,get textureVariant(){return n?`comfyui-upper-local`:`original-capability-fallback`},get ready(){return c&&!!y[+!!_]?.image},get time(){return m.uAuroraTime.value},update(e){!i&&a&&(m.uAuroraTime.value=e)},setCamera(e){e.updateMatrixWorld(),m.uAuroraViewToWorld.value.setFromMatrix4(e.matrixWorld),m.uAuroraWorldToView.value.setFromMatrix4(e.matrixWorldInverse);let t=Math.tan(l.degToRad(e.fov)*.5);m.uAuroraProjection.value.set(t*e.aspect,t)},setActive(e){i||(a=e)},setCrop(e,t=!1){d.value.set(e.repeat.x,e.repeat.y,e.offset.x,e.offset.y),T.uniforms.uPlate.value=e,T.uniforms.uHasPlate.value=1,m.uAuroraPortrait.value=+!!t,m.uAuroraNatureBounce.value=!t&&e.userData.highDetail?1:0,_=t,w(t),x()},setIrradiance(e){T.uniforms.uSharedIrradiance=e,T.vertexShader=`uniform sampler2D uSharedIrradiance;
`+T.vertexShader.replace(`vAuroraIrradiance=auroraDiffuseIrradiance(vec3(0.,1.,0.));`,`vAuroraIrradiance=texelFetch(uSharedIrradiance,ivec2(0),0).rgb;`),T.needsUpdate=!0},setIntensity(e){m.uAuroraIntensity.value=l.clamp(e,0,2)},get state(){return a&&c?`flowing`:`still`},dispose(){i||(i=!0,u.abort(),f.dispose(),y.forEach(e=>e.dispose()),E.geometry.dispose(),T.dispose())}}}function K(e,t,n,r){let i=new R,a=new R,o=!1,s=!1;e.onBeforeRender=e=>{if(o=!1,e.getRenderTarget()!==null||t.x<=0||t.y<=0||(e.getCurrentViewport(a),a.z<=0||a.w<=0))return;e.getScissor(i),s=e.getScissorTest();let c=e.getPixelRatio(),l=r()?.095:.084,u=r()?.018:.027,d=(n.x-t.z)/t.x,f=(1-n.y-t.w)/t.y,p=n.z*l/t.x,m=n.z*u/t.y,h=Math.max(a.x,Math.floor(a.x+(d-p)*a.z)-2),g=Math.max(a.y,Math.floor(a.y+(f-m)*a.w)-2),_=Math.min(a.x+a.z,Math.ceil(a.x+(d+p)*a.z)+2),v=Math.min(a.y+a.w,Math.ceil(a.y+(f+m)*a.w)+2);s&&(h=Math.max(h,i.x*c),g=Math.max(g,i.y*c),_=Math.min(_,(i.x+i.z)*c),v=Math.min(v,(i.y+i.w)*c)),e.setScissor(h/c,g/c,Math.max(0,_-h)/c,Math.max(0,v-g)/c),e.setScissorTest(!0),o=!0},e.onAfterRender=e=>{o&&=(e.setScissor(i),e.setScissorTest(s),!1)}}function He(e={}){let t=new k;t.name=`photographed-campfire-flame`;let n=new AbortController,r=!1,i=!0,a=!1,c=!1,u=!1,d=0,p=-1,m=document.createElement(`video`);m.muted=!0,m.loop=!0,m.playsInline=!0,m.preload=`auto`,m.crossOrigin=`anonymous`,m.setAttribute(`playsinline`,``),m.setAttribute(`muted`,``);let h=!1,g;typeof m.requestVideoFrameCallback==`function`&&(g=m.requestVideoFrameCallback(()=>{g=void 0,!r&&(h=!0,e.onReady?.())}));let _=new le(m);_.colorSpace=D,_.minFilter=_.magFilter=C,_.generateMipmaps=!1;let v={value:1.08},y={value:0},x={value:new R(1,1,0,0)},S={value:0},w={value:null},E={value:new A(.6105,.681,.58)},ee=`uniform float uCloseCamp;${we}
 uniform vec4 uPlateCrop;uniform float uPortrait;uniform vec3 uPitLayout;
    vec2 canonicalFireUv(vec2 photoUv){
      vec2 topUv=vec2(photoUv.x,1.-photoUv.y);
      vec2 original=vec2(.5,uPortrait>.5?.664:.750)+(topUv-uPitLayout.xy)/uPitLayout.z;
      return vec2(original.x,1.-original.y);
    }
    float frontRim(float x){
      // Near-side rock/log boundary in the photographic source, y from top.
      float p=(x-.5)/(uPortrait>.5?.108:.092);
      float y=uPortrait>.5?.670:.758;
      return y+.004*sin(p*8.+.6)+.0025*sin(p*19.-.8)+.004*p*p;
    }
    float fireVisibility(vec2 photoUv){
      if(uPortrait>.5)return 1.0;
      float y=1.-photoUv.y;
      float rim=frontRim(photoUv.x);
      // The photographed foreground stones are opaque: no flame can show over them.
      float occlusion=1.-smoothstep(rim-.0015,rim+.0007,y);
      float anchor=uPortrait>.5?.660:.741;
      float basal=smoothstep(anchor-.025,anchor+.012,y);
      float spread=mix(uPortrait>.5?.14:.115,uPortrait>.5?.053:.044,basal);
      float source=1.-smoothstep(spread*.78,spread,abs(photoUv.x-.5));
      return occlusion*source;
    }`,O=new re({color:16777215,map:_,transparent:!0,depthWrite:!1,side:2,toneMapped:!1,fog:!1,blending:5,blendEquation:100,blendSrc:201,blendDst:201});O.onBeforeCompile=e=>{Object.assign(e.uniforms,be),e.uniforms.uFlameExposure=v,e.uniforms.uCloseCamp=y,e.uniforms.uPlateCrop=x,e.uniforms.uPortrait=S,e.uniforms.uPitLayout=E,e.vertexShader=`varying vec4 vFlameClip;
`+e.vertexShader,e.vertexShader=e.vertexShader.replace(`#include <project_vertex>`,`#include <project_vertex>
 vFlameClip=gl_Position;`),e.fragmentShader=`uniform float uFlameExposure;varying vec4 vFlameClip;
`+ee+`
`+e.fragmentShader,e.fragmentShader=e.fragmentShader.replace(`#include <map_fragment>`,`#include <map_fragment>
      float xMin1=mix(0.00,0.22,uPortrait);
      float xMin2=mix(0.055,0.34,uPortrait);
      float xMax1=mix(0.945,0.68,uPortrait);
      float xMax2=mix(1.00,0.80,uPortrait);
      float edge=smoothstep(xMin1,xMin2,vMapUv.x)*(1.-smoothstep(xMax1,xMax2,vMapUv.x));
      edge*=smoothstep(0.04,.12,vMapUv.y)*(1.-smoothstep(.86,1.,vMapUv.y));
      vec2 photoUv=(vFlameClip.xy/vFlameClip.w*.5+.5)*uPlateCrop.xy+uPlateCrop.zw;
      edge*=fireVisibility(canonicalFireUv(photoUv));
      float lum=dot(diffuseColor.rgb,vec3(0.299,0.587,0.114));
      if(lum<=0.025){
        diffuseColor.rgb=vec3(0.0);
      }else{
        vec3 fireCol=max(diffuseColor.rgb-vec3(0.025),vec3(0.0));
        fireCol*=mix(vec3(1.0),vec3(1.20,0.95,0.65),smoothstep(0.05,0.45,lum));
        fireCol+=vec3(0.9,0.75,0.45)*pow(lum,2.5)*1.4;
        diffuseColor.rgb=fireCol*edge*uFlameExposure;
      }
    `)},O.customProgramCacheKey=()=>`snowy-photographed-flame-distant-pit-v4`;let j=new s(4/3,1),M=new o(j,O);M.name=`real-flame-footage`,M.position.y=.32,M.renderOrder=3,t.add(M);let N=new T(16749624,12,14,1.3);N.position.set(0,.45,.04),t.add(N);let P,F=new b({transparent:!0,depthTest:!1,depthWrite:!1,toneMapped:!1,blending:2,uniforms:{...be,uCloseCamp:y,uPlate:w,uPlateCrop:x,uPortrait:S,uPitLayout:E,uFlames:{value:_}},vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}`,fragmentShader:`uniform sampler2D uPlate;uniform sampler2D uFlames;varying vec2 vUv;${ee}
      void main(){
        vec2 uv=vUv*uPlateCrop.xy+uPlateCrop.zw;vec2 canonical=canonicalFireUv(uv);float y=1.-canonical.y;
        vec2 center=vec2(.5,uPortrait>.5?.664:.750),radii=vec2(uPortrait>.5?.095:.084,uPortrait>.5?.018:.027);
        float region=1.-smoothstep(.65,1.,length((vec2(canonical.x,y)-center)/radii));
        if(region<.001)discard;vec3 colour=campPlateColor(uPlate,uv,uCloseCamp);
        float hot=smoothstep(.012,.12,colour.r-max(colour.g,colour.b));
        float energy=texture2D(uFlames,vec2(.48,.35)).g+texture2D(uFlames,vec2(.56,.47)).g+texture2D(uFlames,vec2(.40,.61)).g;
        vec3 emission=colour*hot*region*(.10+.22*clamp(energy,0.,1.));
        gl_FragColor=vec4(emission,1.);
        #include <colorspace_fragment>
      }`}),I=new o(new s(2,2),F);I.frustumCulled=!1,I.renderOrder=2,t.add(I),K(I,x.value,E.value,()=>S.value>.5);let z=new L,B=new Float32Array(60),ie=new Float32Array(20),V=413,ae=()=>(V=1664525*V+1013904223>>>0,V/4294967296);for(let e=0;e<20;e++)B[e*3]=(ae()-.5)*.4,B[e*3+1]=ae()*1,B[e*3+2]=(ae()-.5)*.4,ie[e]=ae();z.setAttribute(`position`,new ne(B,3)),z.setAttribute(`phase`,new ne(ie,1));let oe={value:0},H=new b({transparent:!0,depthTest:!1,depthWrite:!1,blending:2,toneMapped:!1,uniforms:{uTime:oe},vertexShader:`uniform float uTime;attribute float phase;varying float vAlpha;
      void main(){
        vec3 p=position;float life=fract(phase+uTime*0.14);
        p.y=0.10+life*1.1;
        p.x+=sin(life*6.0+phase*8.0)*0.10*life;
        p.z+=cos(life*5.0+phase*10.0)*0.10*life;
        vAlpha=(1.0-life)*smoothstep(0.0,0.12,life);
        vec4 v=modelViewMatrix*vec4(p,1.0);
        gl_Position=projectionMatrix*v;
        gl_PointSize=clamp(45.0/-v.z,1.5,3.5);
      }`,fragmentShader:`varying float vAlpha;
      void main(){
        float r=length(gl_PointCoord-vec2(0.5));
        if(r>0.5)discard;
        float spark=pow(1.0-r*2.0,2.0);
        gl_FragColor=vec4(vec3(1.0,0.55,0.12)*2.0,spark*vAlpha);
      }`}),se=new f(z,H);se.name=`rising-sparks`,se.frustumCulled=!1,se.renderOrder=4,t.add(se);let ce=e=>{O.map!==e&&(O.map=e,O.needsUpdate=!0)},U=()=>{if(!r){if(i&&t.userData.videoReady&&!u?(ce(_),F.uniforms.uFlames.value=_):P&&t.userData.posterReady?(ce(P),F.uniforms.uFlames.value=P):t.userData.videoReady&&(ce(_),F.uniforms.uFlames.value=_),!i||!a)c&&(p=d),(!m.paused||c)&&m.pause(),t.userData.playing=!1;else if(t.userData.videoReady&&m.paused&&!c&&!u){c=!0;let e=++d;m.play().then(()=>{c=!1,!r&&(t.userData.playing=i&&a&&!m.paused,i&&a||m.pause())},n=>{c=!1,!r&&(u=n?.name!==`AbortError`||e!==p,t.userData.playing=!1,u&&P&&t.userData.posterReady&&ce(P))})}}},W=!1,ue=()=>{r||W||(W=!0,m.src=e.source??`/assets/realistic-winter/flames-real-loop.mp4`,m.load())};P=new te().load(e.poster??`/assets/realistic-winter/flames-real-poster.jpg`,n=>{r?n.dispose():(t.userData.posterReady=!0,U(),e.onReady?.())},void 0,n=>{r||(t.userData.posterError=!0,ue(),e.onError?.(n))}),P.colorSpace=D,P.generateMipmaps=!1,P.minFilter=C,m.addEventListener(`loadeddata`,()=>{_.needsUpdate=!0,t.userData.videoReady=!0,U(),e.onReady?.()},{signal:n.signal}),m.addEventListener(`error`,()=>{t.userData.videoError=!0,e.onError?.(m.error)},{signal:n.signal}),document.addEventListener(`pointerdown`,()=>{u&&(u=!1,U())},{signal:n.signal,passive:!0}),e.deferVideo||ue();let de=new A;return{root:t,mesh:M,light:N,video:m,loadVideo:ue,get motionBlocked(){return u},get framePresented(){return h||typeof m.requestVideoFrameCallback!=`function`&&m.readyState>=2&&m.currentTime>0},setComposition(e,t){y.value=+!!e.userData.closeCamp;let n=Ee(t,!!e.userData.closeCamp,e.userData.compactPit);E.value.set(n.x,n.y,n.scale),w.value=e,S.value=+!!t,x.value.set(e.repeat.x,e.repeat.y,e.offset.x,e.offset.y)},setMotion(e){i!==e&&(i=e,U())},setExposure(e){v.value=l.clamp(e,.1,3)},update(e,n,r){a=r,t.updateWorldMatrix(!0,!1),n.getWorldPosition(de),t.worldToLocal(de),M.rotation.y=Math.atan2(de.x,de.z),oe.value=performance.now()*.001,N.intensity=8*(i&&a?1+.055*Math.sin(e*7.1)+.025*Math.sin(e*13.7):1),U()},pause(){a=!1,U()},dispose(){g!==void 0&&m.cancelVideoFrameCallback(g),!r&&(r=!0,n.abort(),m.pause(),m.removeAttribute(`src`),m.load(),z.dispose(),H.dispose(),j.dispose(),O.dispose(),I.geometry.dispose(),F.dispose(),_.dispose(),P?.dispose(),t.clear())}}}var Ue=(e,t,n)=>{let r=l.clamp((n-e)/(t-e),0,1);return r*r*(3-2*r)};function We(e,t){let n=new A,r=new A,i=new A,a=new w,o=new w,s=new w,c=new A,u=new A,d=new A,f=new w,p=new w,m=new A,h=new A,g=new A,_=new w().setFromAxisAngle(new A(1,0,0),Math.PI/2),v=new w,y=new A(0,1,0),b=new N,x=!1,S=()=>{e.updateWorldMatrix(!0,!1),t.updateWorldMatrix(!0,!1),e.getWorldPosition(n),e.getWorldQuaternion(a),e.getWorldScale(c),t.getWorldPosition(m),t.getWorldQuaternion(s),h.set(0,0,1).applyQuaternion(s).normalize(),o.copy(s).multiply(_).multiply(new w().setFromAxisAngle(y,-Math.PI/2));let u=l.clamp(n.distanceTo(m)*.2,.64,1.8);r.copy(n).add(new A(0,u,0)),g.set(0,.157,0).multiply(c).applyQuaternion(o),i.copy(m).addScaledVector(h,.58).sub(g),b.v0.copy(r),b.v1.copy(r).add(new A(0,.45,0)),b.v2.copy(i).addScaledVector(h,.26).add(new A(0,.9,0)),b.v3.copy(i),x=!0};return{begin:S,apply:t=>{x||S();let i=l.clamp(t,0,1),s=Ue(0,.15,i),_=Ue(.15,.46,i);i<.15?d.lerpVectors(n,r,s):b.getPoint(_,d),f.slerpQuaternions(a,o,Ue(.04,.46,i));let C=Ue(.46,.58,i),w=Ue(.59,.69,i);i>=.46&&(f.copy(o).multiply(v.setFromAxisAngle(y,Math.PI/2*w)),g.set(0,.157,0).multiply(c).applyQuaternion(f),d.copy(m).addScaledVector(h,l.lerp(.58,-.35,C)).sub(g));let T=d.clone();e.parent.updateWorldMatrix(!0,!1),e.position.copy(e.parent.worldToLocal(d)),e.parent.getWorldQuaternion(p).invert(),e.quaternion.copy(p).multiply(f),e.parent.getWorldScale(u),e.scale.copy(c).divide(u),e.visible=!0,e.updateWorldMatrix(!1,!0);let E=g.set(0,.157,0).applyMatrix4(e.matrixWorld);return{lift:s,travel:_,insertion:C,turn:w,lid:Ue(.69,.93,i),card:Ue(.93,1,i),keyTip:E.toArray(),socket:m.toArray(),axisError:1-Math.abs(new A(0,1,0).applyQuaternion(f).dot(h)),keyWorld:T.toArray()}},reset(){x=!1}}}function Ge(e){let t=document.createElement(`canvas`);t.width=e?768:1280,t.height=e?432:720;let n=t.getContext(`2d`),r=t.width,i=t.height,a=!1,s=()=>{n.fillStyle=`#0a2030`,n.fillRect(0,0,r,i),n.strokeStyle=`#9acbdf`,n.lineWidth=r*.002,n.strokeRect(r*.035,i*.06,r*.93,i*.88),n.textBaseline=`top`,n.fillStyle=`#a8cada`,n.font=`500 ${r*.026}px "IBM Plex Sans",sans-serif`,n.fillText(`SNOWY STUDIOS`,r*.075,i*.14),n.fillStyle=`#edf8ff`,n.font=`500 ${r*.102}px "IBM Plex Sans",sans-serif`,n.fillText(`LootLabs`,r*.068,i*.36),n.fillStyle=`#a6dff6`,n.fillRect(r*.075,i*.66,r*.11,i*.006),n.font=`500 ${r*.025}px "IBM Plex Sans",sans-serif`,n.fillText(`CONTINUE VIA FLOWAUTH`,r*.075,i*.76),n.fillText(`01 / GATEWAY`,r*.7,i*.76)};s();let c=new W(t);c.colorSpace=D,c.anisotropy=4,document.fonts.load(`500 32px "IBM Plex Sans"`).then(()=>{a||(s(),c.needsUpdate=!0)},()=>{});let u=new _({color:`#c6a46e`,metalness:.75,roughness:.3}),d=new y({map:c,roughness:.48,metalness:0}),f=new k;f.name=`free-access-card`;let p=new o(new se(1.9,1.07,.025),[u,u,u,u,d,u]);return p.castShadow=!0,f.add(p),f.visible=!1,{root:f,update(e){f.visible=e>1e-4&&e<.9999,f.position.set(0,l.lerp(.4,2.04,e),.15),f.rotation.x=-.08*e},dispose(){a=!0,p.geometry.dispose(),d.dispose(),u.dispose(),c.dispose(),f.clear()}}}function Ke(e){let i=e.querySelector(`.ice-scene`),a=e.dataset.geometryTrial,c=i.clientWidth>=900&&i.clientWidth/i.clientHeight>=1.25&&!r.lowPower,u=e.querySelector(`#ice-vault-canvas`),d=e.querySelector(`#ice-vault-action`),f=new AbortController,p=f.signal,h=matchMedia(`(prefers-reduced-motion: reduce)`),g=matchMedia(`(max-width:767px), (pointer:coarse)`),_=navigator.connection,v=!1,b=!0,C=!1,w=1,T=1,E,O=-1/0,ne=-1/0,M=0,N,F=!1,L=0,R=!1,z=0,B=!1,V=!1,ae=!1,se=!1,U=``,W,ue=!1,fe=!1,he=()=>{};new Promise(e=>{he=e});let ge=0,_e=-1,ve=NaN,ye=NaN,be=``,we=!1,De=0,Oe=null,ke=0,je=async()=>{let e=new Set,t=t=>{t instanceof I&&t.image&&!t.isRenderTargetTexture&&!(t instanceof le)&&e.add(t)};t(G.background),t($e),t(Qe),J?.startupTextures.forEach(t),G.traverse(e=>{if(e instanceof o)for(let n of Array.isArray(e.material)?e.material:[e.material])Object.values(n).forEach(t),`uniforms`in n&&Object.values(n.uniforms).forEach(e=>t(e.value))});let n=[];for(let t of e){let e=t.image;e?.decode&&n.push(e.decode().catch(()=>{}))}if(await Promise.all(n),!(v||C||!q)){for(let t of e)q.engine.initTexture(t);v||C||(i.dataset.uploadsReady=`true`,Ct())}},Me,Ne=new Set,Pe=()=>{Ne.forEach(e=>{e.traverse(e=>{e instanceof o&&(e.geometry.dispose(),(Array.isArray(e.material)?e.material:[e.material]).forEach(e=>e.dispose()))}),e.clear()}),Ne.clear(),Me?.dispose(),Me=void 0},Fe={collect:+(e.dataset.phase===`ready`)},Le=Number(e.dataset.progress)||0,Re={phase:e.dataset.phase||`waiting`,progress:Number(e.dataset.progress)||0,remaining:Number(e.dataset.remaining)||30,keyVisible:!1,canAct:!1},G=new ee;G.background=new j(getComputedStyle(e).getPropertyValue(`--melt-floor`).trim()||`#ffffff`);let K=new x(40,1,.1,500),Ue=new A(0,3.1,0),Ke=new A(-8.004,.8,12.093);K.position.copy(Ue).add(Ke),K.lookAt(Ue);let q,J,Y,qe,Je,X,Ye,Xe,Ze,Z,Q,Qe,$e,et=!1,tt=!1,$,nt,rt,it,at,ot,st=()=>!(tt&&!et||!$?.image||!Q?.root.userData.posterReady&&!Q?.root.userData.videoReady),ct=()=>{if(i.dataset.chestLid=String(X?.lid??0),i.dataset.chestCard=String(X?.card??0),i.dataset.keyInsertion=String(X?.insertion??0),i.dataset.keyTurn=String(X?.turn??0),X||(delete i.dataset.keyTip,delete i.dataset.keySocket,delete i.dataset.keyAxisError),J&&(i.dataset.keyWorld=J.key.getWorldPosition(new A).toArray().join(`,`)),i.dataset.collectProgress=Fe.collect.toFixed(4),X&&(i.dataset.chestLid=X.lid.toFixed(4),i.dataset.chestCard=X.card.toFixed(4),i.dataset.keyInsertion=X.insertion.toFixed(4),i.dataset.keyTurn=X.turn.toFixed(4),i.dataset.keyTip=X.keyTip.join(`,`),i.dataset.keySocket=X.socket.join(`,`),i.dataset.keyAxisError=String(X.axisError)),i.dataset.chestReady=String(!!Y),i.dataset.chestMaterialReady=String(Y?.root.userData.materialReady??!1),i.dataset.chestMaterialError=String(Y?.root.userData.materialError??!1),i.dataset.collecting=String(F),i.dataset.cameraPose=[...K.position.toArray(),...K.quaternion.toArray()].map(e=>e.toFixed(6)).join(`,`),i.dataset.renderCount=String(M),i.dataset.ambientTime=L.toFixed(3),i.dataset.aurora=Z?.state??`still`,i.dataset.auroraLook=`upper-local-v9`,i.dataset.auroraTexture=Z?.textureVariant??`loading`,i.dataset.auroraGround=`off`,i.dataset.fire=Q?.root.userData.playing?`burning`:`still`,i.dataset.fireReady=String(Q?.root.userData.videoReady??!1),i.dataset.auroraReady=String(Z?.ready??!1),i.dataset.fireVideoTime=String(Q?.video.currentTime??0),i.dataset.fireVideoDuration=String(Q?.video.duration??0),i.dataset.fireResolution=Q?[Q.video.videoWidth,Q.video.videoHeight].join(`x`):``,i.dataset.detailQuality=c?`enhanced`:`baseline`,i.dataset.auroraVideoTime=String(Z?.time??0),i.dataset.meltProgress=Re.progress.toFixed(3),J){i.dataset.materialStudy=String(J.root.userData.materialStudy),i.dataset.materialReady=String(J.root.userData.materialReady);let e=J.root.userData.meltwater;i.dataset.waterArea=String(e?.area??0),i.dataset.waterVolume=String(e?.visualVolume??0),i.dataset.waterHeight=String(e?.filmHeight??0),i.dataset.waterTint=String(e?.tint??``),i.dataset.waterWetness=String(e?.wetness??0),i.dataset.waterRunoff=String(e?.runoffVisible??!1);let t=J.root.userData.meltVisual;i.dataset.iceTint=String(t?.iceTint??``),i.dataset.keyReveal=String(t?.keyReveal??0),i.dataset.glowAlpha=String(t?.glowAlpha??0),i.dataset.iceScale=String(t?.iceScale??0),i.dataset.iceOpacity=String(t?.iceOpacity??0)}q&&(i.dataset.triangles=String(q.engine.info.render.triangles),i.dataset.drawCalls=String(q.engine.info.render.calls))},lt=(e=`idle`)=>{Z?.setActive(!1),Q?.pause(),E?.(),E=void 0,i.dataset.renderState=e,ct()},ut=()=>{v||C||(C=!0,R=!1,F=!1,N?.kill(),lt(`fallback`),u.hidden=!0,e.dataset.effectsPresented=`false`,e.dataset.stageFallback=`true`,e.dataset.meltStage=`fallback`,e.dataset.scenePresented=`false`,cancelAnimationFrame(z),e.dispatchEvent(new CustomEvent(`melt-key-fallback`)))},dt=()=>{if(!J||Re.phase!==`available`||C)return;J.root.updateMatrixWorld(!0),K.updateMatrixWorld(!0);let e=new ie().setFromObject(J.key),t=1/0,n=1/0,r=-1/0,i=-1/0;for(let a of[e.min.x,e.max.x])for(let o of[e.min.y,e.max.y])for(let s of[e.min.z,e.max.z]){let e=new A(a,o,s).project(K),c=(e.x*.5+.5)*w,l=(-e.y*.5+.5)*T;t=Math.min(t,c),r=Math.max(r,c),n=Math.min(n,l),i=Math.max(i,l)}let a=Math.max(44,r-t+24),o=Math.max(44,i-n+24);Object.assign(d.style,{left:`${Math.max(0,Math.min(w-a,(t+r-a)/2))}px`,top:`${Math.max(0,Math.min(T-o,(n+i-o)/2))}px`,width:`${Math.min(w,a)}px`,height:`${Math.min(T,o)}px`,borderRadius:`24px`})},ft=new A,pt=-1/0,mt=-1/0,ht=16,gt=96,_t=!0,vt=()=>{if(!qe||Re.phase!==`ready`||Fe.collect>=1&&!F&&!_t)return;_t=!1,qe.root.getWorldPosition(ft),ft.project(K);let e=i.getBoundingClientRect();i.dataset.cardOrigin=`${(e.left+(ft.x*.5+.5)*w).toFixed(1)},${(e.top+(-ft.y*.5+.5)*T).toFixed(1)}`;let t=Math.min(w<700?280:320,w-32),n=l.clamp((ft.x*.5+.5)*w,Math.min(w-t/2-16,ht+t/2),w-t/2-16),r=l.clamp((-ft.y*.5+.5)*T-18,gt,T-100);(Math.abs(n-pt)>.5||Math.abs(r-mt)>.5)&&(i.style.setProperty(`--loot-x`,`${n.toFixed(1)}px`),i.style.setProperty(`--loot-y`,`${r.toFixed(1)}px`),i.dataset.lootAnchor=`${n.toFixed(1)},${r.toFixed(1)}`,pt=n,mt=r)},yt=e=>{R?lt(e):(W?.render(L,b,!h.matches),b||lt(e))},bt=()=>{if(v||C||!b&&B||document.hidden||!q)return;if(!J||!V){yt(`effects-first`);return}if(!R&&Oe){let e=q.engine.getContext(),t=e.clientWaitSync(Oe,0,0);e.deleteSync(Oe),Oe=null,t===e.WAIT_FAILED?i.dataset.gpuWarmup=`frame-fallback`:(De++,i.dataset.gpuWarmup=`fence-complete`)}let t=h.matches&&Re.phase===`waiting`?Le:Re.progress;K.updateMatrixWorld(),Z?.setCamera(K);let n=l.smoothstep(Fe.collect,.46,.72);if((t!==ve||Fe.collect!==ye||Re.phase!==be||ge!==_e)&&(_t=!0,J.update(t,n),Y&&qe&&Je&&(Re.phase===`ready`?(X=Je.apply(Fe.collect),Y.update(X.lid),qe.update(X.card)):(Y.update(0),qe.update(0),X=void 0)),ve=t,ye=Fe.collect,be=Re.phase,_e=ge,Ze&&(Ze.shadow.needsUpdate=!0)),it?.update(t,n,L),Q?.setMotion(!h.matches),!st()){yt(`loading`);return}we||(we=!0,je().catch(ut));let r=String(!!Q?.root.userData.videoReady)+`:`+String(h.matches)+`:`+(Re.phase===`ready`?`open`:`ice`);if(!R&&U!==r&&(U=r,De=0,Oe&&=(q.engine.getContext().deleteSync(Oe),null)),ae=!0,!ae){if(!se){se=!0;let e=r;q.engine.toneMapping=q.toneMapping,q.engine.toneMappingExposure=q.toneMappingExposure,q.engine.outputColorSpace=q.outputColorSpace;let t=q.engine,n=new k,i=new k,a=new Set;G.traverse(e=>{if(!(e instanceof o)||e===J.floor||(e===J.ice||e.name===`surface-hoar`)&&!e.visible)return;let t=Array.isArray(e.material)?e.material[0]:e.material;a.has(t)||(a.add(t),i.add(e.clone(!1))),e!==J.ice&&e.name!==`surface-hoar`&&(e.name===`user-original-aurora`||e.name===`snow-terrain`||it&&e.parent===it.root)&&n.add(e.clone(!1))}),(async()=>{let e=Promise.resolve();if(Ye&&J.ice.visible){let r=t.getRenderTarget(),i=t.getActiveCubeFace(),a=t.getActiveMipmapLevel(),o=t.toneMapping;try{t.setRenderTarget(Ye),t.toneMapping=0,e=t.compileAsync(n,K,G)}finally{t.setRenderTarget(r,i,a),t.toneMapping=o}}let r=t.compileAsync(i,K,G);await Promise.all([e,r])})().then(()=>{se=!1,!(v||C)&&(ae=e===String(!!Q?.root.userData.videoReady)+`:`+String(h.matches)+`:`+(Re.phase===`ready`?`open`:`ice`),Ct())}).catch(()=>ut())}yt(`compiling`)}else{if(Z?.setActive(b&&!h.matches),Z?.update(L),Q?.setMotion(!h.matches),Q?.update(L,K,b&&!h.matches),Q){let e=w<700&&Y?Math.max(1,Y.root.scale.x):1;Q.light.distance=14*e;let t=1+.18*Math.sin(L*6.7)+.12*Math.cos(L*11.3)+.06*Math.sin(L*23.1);Q.light.intensity=(w<700?5:c?9:14)*e*e*t}q.render(G,K),M++,!R&&$?.image&&J&&(R=!0,e.dataset.scenePresented=`true`,e.dataset.meltStage=`ready`,e.dataset.effectsPresented=`true`,e.dispatchEvent(new CustomEvent(`melt-key-ready`)),h.matches||Q?.loadVideo()),b?(R&&!h.matches&&Q?.loadVideo(),dt(),vt()):(B=!0,i.dataset.prewarmed=`true`,Z?.setActive(!1),Q?.pause(),i.dataset.renderState=`prewarmed`,ct())}},xt=e=>{if(v||C||!b||document.hidden){lt(`paused`);return}let t=r.getFrameInterval();e-O+1e-5<t||((R||fe)&&!h.matches&&Number.isFinite(O)&&(L+=Math.min(e-O,.1)),O=e,bt(),e-ne>.25&&(ct(),ne=e),h.matches&&!F&&R&&lt())},St=()=>{v||C||!b||document.hidden||E||(i.dataset.renderState=`active`,O=-1/0,E=n(xt))},Ct=()=>{v||C||ke||(ke=requestAnimationFrame(()=>{ke=0,!(v||C)&&(bt(),St())}))},wt=e=>{let t=`/assets/realistic-winter/winter-camp-${e?`portrait-v5`:`landscape-v3`}.webp`,n=new te().load(t,e=>{v?e.dispose():(i.dataset.background=`photographic-winter`,Tt())},void 0,ut);return n.colorSpace=D,n},Tt=()=>{if(v||C||!q)return;R||(De=0,Oe&&=(q.engine.getContext().deleteSync(Oe),null)),ge++,cancelAnimationFrame(z),z=0;let t=i.getBoundingClientRect();w=Math.max(1,t.width),T=Math.max(1,t.height);let n=e.querySelector(`.ice-copy`)?.getBoundingClientRect();ht=n&&w>=900?Math.max(16,n.right-t.left+16):16,gt=n&&w>=700&&w<900?Math.min(T-100,n.bottom-t.top+100):96;let a=r.getDPR();q.setPixelRatio(a),q.setSize(w,T),q.engine.transmissionResolutionScale=r.lowPower?.5:1,i.dataset.transmissionScale=String(q.engine.transmissionResolutionScale),i.dataset.qualityDpr=String(a),i.dataset.qualityTier=r.lowPower?`mobile`:`desktop`;let o=w/T<1.25,s=w<900||o||matchMedia(`(pointer:coarse) and (max-width:1366px)`).matches,l=s&&!o&&w>=900,u=w<700;J?.setNaturalClarity(u),tt=s,u?et=!0:tt&&!$e&&($e=new te().load(`/assets/quality-v3/snow-restored.webp`,e=>{v?e.dispose():(et=!0,xe(e,tt,w<700),i.dataset.phoneSnow=tt?`laptop-plate`:`inactive`,Ct())},void 0,()=>{v||(et=!0,i.dataset.phoneSnow=`unavailable`,Ct())}),$e.colorSpace=D),xe($e,tt,u),i.dataset.phoneSnow=tt&&$e?.image?`laptop-plate`:`inactive`,Z&&(Z.lighting.uAuroraGroundStrength.value=0),i.dataset.auroraGround=`off`,i.dataset.campFraming=s?`close`:`laptop`,o&&!rt&&(rt=wt(!0)),!o&&!nt&&(nt=wt(!1));let d=o?rt:nt;if(d&&d!==$&&($=d,G.background=$,it?.setBackground($)),$?.image){let e=$.image,t=e.width/e.height,n=w/T,r=w>=900&&!o,i=o?0:r?.12:.05;if($.repeat.set(Math.min(1,n/t)*(1-i),Math.min(1,t/n)*(1-i)),$.offset.set((1-$.repeat.x)/2-i/2,(1-$.repeat.y)/2),$.userData.closeCamp=r,$.userData.highDetail=c&&!o,$.userData.integratedPhone=u,s){let e=u||o?.51:.7,t=u?.88:o?.82:l?.86:.79,n=e*$.repeat.x+$.offset.x,r=1-((1-t)*$.repeat.y+$.offset.y),i=u?2.4:l?1.65:2;$.userData.compactPit={x:n,y:r,zoom:i},Se(n,r,i,o)}else delete $.userData.compactPit,Se();$.updateMatrix(),Z?.setCrop($,o),Q?.setComposition($,o)}!R||$?.image&&Z?.ready||(De=0,Oe&&=(q.engine.getContext().deleteSync(Oe),null),we=!1,R=!1,e.dataset.scenePresented=`false`,e.dataset.meltStage=`loading`,document.dispatchEvent(new CustomEvent(`melt-key-poster-state`,{detail:Re.phase}))),K.aspect=w/T;let f=Math.max(1,1.5/K.aspect),p=Ue.clone();!o&&w>=900?p.addScaledVector(new A(.834,0,.552),-2.6):!o&&w>=700&&p.addScaledVector(new A(.834,0,.552),-.8);let h=Ke.clone();if(o&&(p.y=4.2,h.y=-.8),K.position.copy(p).addScaledVector(h,f),K.lookAt(p),K.updateProjectionMatrix(),K.updateMatrixWorld(),J&&Y&&at&&(J.root.position.copy(at.icePosition),J.root.scale.setScalar(at.iceScale),Y.root.position.copy(at.chestPosition),Y.root.scale.setScalar(at.chestScale),Y.root.rotation.y=-.18,J.root.rotation.y=u?.1:-.24,s)){let e=(e,t,n,r,i,a)=>{let o=new m;o.setFromCamera(new ce(t*2-1,1-n*2),K);let s=o.ray.intersectPlane(new pe(new A(0,1,0),.01),new A);if(s){e.position.copy(s),e.scale.setScalar(1);for(let t=0;t<2;t++){e.updateMatrixWorld(!0);let t=1/0,n=-1/0;for(let r of[-i,i])for(let i of[-a,a]){let a=new A(r,0,i).applyMatrix4(e.matrixWorld).project(K);t=Math.min(t,a.x),n=Math.max(n,a.x)}e.scale.multiplyScalar(r*2/Math.max(.001,n-t))}}};e(Y.root,u?.185:o?.2:.5,u?.83:o?.81:l?.78:.8,u?.35:o?.26:l?.19:.27,1.65,.95),e(J.root,u?.83:o?.82:l?.88:.86,u?.83:o?.81:l?.78:.8,u?.28:o?.22:l?.15:.22,1,1)}if(J&&Y&&at){let e=(e,t,n,r,a)=>{let o=i.querySelector(e);if(!o)return;t.updateWorldMatrix(!0,!1);let s=1/0,c=-1/0,l=1/0,u=-1/0;for(let e of[-n,n])for(let n of[0,a])for(let i of[-r,r]){let r=new A(e,n,i).applyMatrix4(t.matrixWorld).project(K),a=(r.x*.5+.5)*w,o=(-r.y*.5+.5)*T;s=Math.min(s,a),c=Math.max(c,a),l=Math.min(l,o),u=Math.max(u,o)}Object.assign(o.style,{left:`${s}px`,top:`${l}px`,width:`${c-s}px`,height:`${u-l}px`,transform:`none`})};e(`.winter-skeleton-chest`,Y.root,1.65,.95,1.25),e(`.winter-skeleton-ice`,J.root,1,1,2)}if(Q&&$?.image){if(o){let e=u?.878:.818,t=new m;t.setFromCamera(new ce(1.016-1,1-e*2),K);let n=t.ray.intersectPlane(new pe(new A(0,1,0),-.025),new A);if(n){Q.root.position.copy(n),Q.mesh.position.y=.2;let e=n.clone().project(K),t=n.clone().add(new A(0,1,0)).project(K),r=(u?.138:.145)*2/Math.abs(t.y-e.y);Q.root.scale.setScalar(r),Q.setExposure(1.4)}}else{Q.mesh.position.y=.32;let e=Ee(!1,w>=900&&!o,$.userData.compactPit),t=(1-(e.y+(e.originalBaseY-e.canonicalY)*e.scale)-$.offset.y)/$.repeat.y*2-1,n=(e.x-$.offset.x)/$.repeat.x*2-1,r=new m;r.setFromCamera(new ce(n,t),K);let i=r.ray.intersectPlane(new pe(new A(0,1,0),-.025),new A);if(i){Q.root.position.copy(i);let t=i.clone().project(K),n=i.clone().add(new A(0,1,0)).project(K),r=e.originalHeight*e.scale/$.repeat.y*2/Math.abs(n.y-t.y);Q.root.scale.setScalar(r*1.12),Q.setExposure(1.3)}}}if(Ze&&Y&&J){let e=u?Math.max(1,Y.root.scale.x,J.root.scale.x):1,t=u?Y.root.position.clone().add(J.root.position).multiplyScalar(.5):new A;Ze.target.position.copy(t),Ze.target.updateMatrixWorld(),Ze.position.copy(t).add(new A(-8,12,4).multiplyScalar(e));let n=Ze.shadow.camera,r=u?Math.max(3.5,Y.root.position.distanceTo(J.root.position)*.5+2):15;Object.assign(n,{left:-r,right:r,top:u?r:11,bottom:u?-r:-11,near:.1,far:45*e}),n.updateProjectionMatrix(),Ze.shadow.normalBias=.008*e,Ze.shadow.needsUpdate=!0}Ct();let g=e=>{if(!e)return null;let t=e.getWorldPosition(new A).project(K);return[+(t.x*.5+.5).toFixed(5),+(-t.y*.5+.5).toFixed(5)]};i.dataset.layoutAnchors=JSON.stringify({ice:g(J?.root),fire:g(Q?.root),chest:g(Y?.root)})};e.addEventListener(`melt-key-state`,n=>{let r=n.detail;if(!r||v)return;let i=Re.phase,a=Re.progress;Re=r,h.matches&&r.phase===`waiting`&&(i!==`waiting`||r.progress<a)&&(Le=r.progress),r.phase===`ready`&&i!==`ready`?(N?.kill(),J?.update(1,0),Je?.begin(),F=!h.matches&&R,e.dataset.unlocking=String(F),F?N=t.to(Fe,{collect:1,duration:4.4,ease:`none`,onUpdate:St,onComplete:()=>{F=!1,N=void 0,e.dataset.unlocking=`false`,Ct(),ct(),e.dispatchEvent(new CustomEvent(`melt-key-reveal-complete`))}}):(Fe.collect=1,e.dispatchEvent(new CustomEvent(`melt-key-reveal-complete`)))):r.phase!==`ready`&&i===`ready`&&(cancelAnimationFrame(z),z=0,R=!1,ae=!1,De=0,U=``,Oe&&q&&q.engine.getContext().deleteSync(Oe),Oe=null,e.dataset.scenePresented=`false`,e.dataset.meltStage=`loading`,document.dispatchEvent(new CustomEvent(`melt-key-poster-state`,{detail:r.phase})),F=!1,N?.kill(),N=void 0,Fe.collect=0,Je?.reset(),e.dataset.unlocking=`false`,X=void 0),i===r.phase?r.phase===`waiting`&&!h.matches&&St():Ct()},{signal:p}),u.addEventListener(`webglcontextlost`,e=>{e.preventDefault(),ut()},{signal:p}),document.addEventListener(`visibilitychange`,()=>{document.hidden?(N?.pause(),lt(`paused`)):(b&&N?.resume(),Ct())},{signal:p}),window.addEventListener(`pageshow`,Ct,{signal:p}),window.addEventListener(`resize`,Tt,{passive:!0,signal:p}),g.addEventListener(`change`,Tt,{signal:p}),_?.addEventListener(`change`,Tt,{signal:p}),h.addEventListener(`change`,()=>{h.matches&&(Le=Re.progress,F=!1,N?.kill(),N=void 0,Re.phase===`ready`&&(Fe.collect=1,e.dataset.unlocking=`false`,e.dispatchEvent(new CustomEvent(`melt-key-reveal-complete`)))),Ct()},{signal:p});let Et=new ResizeObserver(Tt);Et.observe(i);let Dt=new IntersectionObserver(([e])=>{b=e.isIntersecting,b?(document.hidden||N?.resume(),Ct()):(N?.pause(),lt(`paused`))},{threshold:.01});return Dt.observe(i),(async()=>{try{Qe=new te().load(`/assets/quality-v3/camp-detail.webp`,e=>{v?e.dispose():(e.colorSpace=D,Ce(e),Ct())}),Qe.colorSpace=D,Qe.anisotropy=8,q=new me(u,{antialias:!0}),q.toneMapping=4,q.toneMappingExposure=.95,G.background=new j(463649);let t=i.clientWidth/i.clientHeight<1.25;t?rt=wt(!0):nt=wt(!1),$=t?rt:nt,G.background=$,Z=Ve({lowPower:r.lowPower,maxTextureSize:q.engine.capabilities.maxTextureSize,onReady:Ct,onError:ut,intensity:.62}),G.add(Z.root),Z.lighting.uAuroraGroundStrength.value=0,Q=He({deferVideo:!0,poster:`/assets/quality-v1/fire-hd-poster.webp`,onReady:()=>{B=!1,Ct()},onError:()=>{Q?.root.userData.posterError&&Q?.root.userData.videoError&&ut()}}),G.add(Q.root),ot={enabled:q.engine.shadowMap.enabled,type:q.engine.shadowMap.type},q.engine.shadowMap.enabled=!0,q.engine.shadowMap.type=1;let n=new de(7904196,1977664,.35);G.add(n);let c=new P(10927584,.55);c.position.set(-8,12,4),c.castShadow=!0,Ze=c,G.add(c.target),c.shadow.autoUpdate=!1,c.shadow.needsUpdate=!0,c.shadow.mapSize.set(r.lowPower?512:1024,r.lowPower?512:1024),Object.assign(c.shadow.camera,{left:-15,right:15,top:11,bottom:-11,near:.1,far:45}),c.shadow.radius=r.lowPower?2.25:4.5,c.shadow.bias=-15e-5,c.shadow.normalBias=.008,G.add(c);let d=new P(7903422,.26);d.position.set(4,2.8,1.5),G.add(d);let f=new P(7445451,.32);if(f.position.set(1,4,-3),G.add(f),Tt(),Ct(),Z.lighting.uAuroraGroundStrength.value=0,i.dataset.auroraDiffuse=`off`,ue=!0,W=Te({surface:q,scene:G,camera:K,sky:Z,fire:Q,background:()=>$,ready:()=>ue&&(!tt||et),hidden:()=>[J?.root,Y?.root,it?.root],irradiance:()=>{},onReady:Ct,onError:ut,onFirst:t=>{fe=!0,e.dataset.effectsPresented=`true`,i.dataset.effectsFirstFrameAt=String(performance.now()),i.dataset.effectsGpuWarmup=t,he(),Ct()}}),Ct(),v||C||(await Ae(32),v||C))return;J=Ie(32,3,Ct,ut,{highDetail:!1,naturalClarity:i.clientWidth<700,compactGeometry:!0}),G.add(J.root);let p=new A(.834,0,.552),m=new A(-.552,0,.834),h=i.clientWidth>=900&&i.clientWidth/i.clientHeight>=1.25;J.root.position.copy(p).multiplyScalar(h?-2.6+.58*Math.tan(l.degToRad(20))*(14.5*Math.max(1,1.5/(i.clientWidth/i.clientHeight))-1.2)*(i.clientWidth/i.clientHeight):4.9).addScaledVector(m,h?1.2:-5.2),J.root.scale.setScalar(h?.7:1.2),J.root.rotation.y=-.24,J.root.position.y=-.01;let g=J.floor.material.onBeforeCompile;if(J.floor.material.onBeforeCompile=(e,t)=>{g(e,t),e.fragmentShader=e.fragmentShader.replace(`return .94*(1.-.12*pow`,`return .7332*(1.-.12*pow`).replace(`vec2 iceCenter(){return vec2(0.);}`,`vec2 iceCenter(){return vec2(${J.root.position.x.toFixed(6)},${J.root.position.z.toFixed(6)});}`).replace(`.44+.56*contact`,`.44+.56*max(contact,1.-smoothstep(1.4,2.2,length(vShadowFloor-vec2(${Y.root.position.x.toFixed(6)},${Y.root.position.z.toFixed(6)}))))`)},J.floor.visible=!1,J.floor.material.customProgramCacheKey=()=>`snowy-chest-layout-contact-v2`,Y=ze({highDetail:!1,lowPower:!0,compactGeometry:!1,onReady:Ct,onError:ut}),Y.root.position.copy(p).multiplyScalar(h?-3.45:-1.8).addScaledVector(m,h?.8:-5.2),Y.root.position.y=-.01,Y.root.rotation.y=-.18,Y.root.scale.setScalar(h?.9:1.08),G.add(Y.root),a){let t=0,n=0;for(let e of[Y.root,J.key])e.traverse(e=>{if(!(e instanceof o))return;let r=e.geometry.getAttribute(`position`).count;n+=r,t+=(e.geometry.index?.count??r)/3*(e instanceof S?e.count:1)});e.dataset.trialPropTriangles=String(t),e.dataset.trialPropVertices=String(n)}if(v||C)return;at={icePosition:J.root.position.clone(),iceScale:J.root.scale.x,chestPosition:Y.root.position.clone(),chestScale:Y.root.scale.x},it=Be($,Y.root,J.root,Q.root,Z.lighting,void 0),G.add(it.root),qe=Ge(r.lowPower),Y.root.add(qe.root),Je=We(J.key,Y.keySocket),Re.phase===`ready`&&(J.update(1,0),Je.begin());let _=Me=new oe(q.engine),b=new ee;Ne.add(b),b.background=new j(.035,.065,.1);for(let[e,t,n,r,i]of[[-4,4,5.5,3,1.1],[4,5,-3,2.8,.6],[-4,2.8,-5,2.4,.8]]){let a=new o(new H(r,24,16),new re({color:new j(1,.98,.95).multiplyScalar(i),toneMapped:!1}));a.position.set(e,t,n),b.add(a)}let x=new o(new s(3.5,4.5),new re({color:new j(1,.97,.88).multiplyScalar(.75),side:2,toneMapped:!1}));x.position.set(3.8,2.8,5.5),x.lookAt(0,1,0),b.add(x);let w=new o(new s(5,3),new re({color:new j(1,.87,.68).multiplyScalar(.9),side:2,toneMapped:!1}));if(w.position.set(-4,-1.8,6),w.lookAt(0,.7,0),b.add(w),v||C)return;Ye=Xe=_.fromScene(b,.055),G.environment=Ye.texture,Y.root.traverse(e=>{if(e instanceof o)for(let t of Array.isArray(e.material)?e.material:[e.material])t instanceof y&&(t.envMap=Ye.texture,t.envMapIntensity=t.metalness>.5?.75:.45)}),Pe(),V=!0,i.dataset.composition=`chest-left-fire-front-ice-right-v2`,i.dataset.chest=`walnut`,i.dataset.camera=`perspective-fixed`,i.dataset.viewAngle=`0`,i.dataset.renderer=`three-webgl`,Tt(),Ct()}catch(e){ut(),console.warn(`Melt key visual unavailable; native controls remain usable.`,e)}finally{Pe()}})(),()=>{v||(v=!0,Pe(),cancelAnimationFrame(z),cancelAnimationFrame(0),cancelAnimationFrame(ke),Oe&&q&&q.engine.getContext().deleteSync(Oe),Oe=null,F=!1,N?.kill(),lt(),f.abort(),Et.disconnect(),Dt.disconnect(),W?.dispose(),xe(),$e?.dispose(),Se(),Ce(),Qe?.dispose(),it?.dispose(),Z?.dispose(),Q?.dispose(),nt?.dispose(),rt?.dispose(),qe?.dispose(),Y?.dispose(),J?.dispose(),G.traverse(e=>{e instanceof P&&e.shadow.dispose()}),G.environment=null,Ye?.dispose(),Xe?.dispose(),q&&ot&&(q.engine.shadowMap.enabled=ot.enabled,q.engine.shadowMap.type=ot.type),q?.dispose(),G.clear())}}var q=_e,J=`snowy:free-key:melt:v1`,Y=/^SNOWY-FREE-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}-\d{4}$/,qe=e=>typeof e==`number`&&Number.isSafeInteger(e)&&e>=0&&e<=864e13,Je=(e,t)=>e.version===1&&qe(t)&&qe(e.startedAt)&&e.startedAt<=t,X=(e,t)=>Je(e,t)&&e.key===null&&e.unlockedAt===null,Ye=(e,t)=>Je(e,t)&&!e.pending&&typeof e.key==`string`&&Y.test(e.key)&&qe(e.unlockedAt)&&e.unlockedAt>=e.startedAt+q&&e.unlockedAt<=t&&t-e.unlockedAt<864e5;function Xe(e){if(!qe(e))throw RangeError(`A valid timestamp is required to start the melt.`);return{version:1,startedAt:e,key:null,unlockedAt:null}}function Ze(e){return{...Xe(e),pending:!0}}function Z(e,t){return e.pending?Xe(t):e}function Q(e,t){let n=Ye(e,t),r=!e.pending&&(n||X(e,t))?t-e.startedAt:0,i=Math.min(1,Math.max(0,r/q)),a=n?`ready`:i===1?`available`:`waiting`;return{phase:a,remaining:Math.max(0,Math.ceil((q-r)/1e3)),progress:i,keyVisible:a!==`waiting`,canAct:a===`available`}}function Qe(e,t,n=ye){if(e.pending||!X(e,t)||t-e.startedAt<q)return e;let r=n();if(!Y.test(r))throw Error(`The local pass generator returned an invalid pass.`);return{...e,key:r,unlockedAt:t}}function $e(e,t){return e.key!==null&&!Ye(e,t)}function et(e,t,n=!1){let r=()=>n?Ze(t):Xe(t);if(!qe(t)||!e)return r();try{let n=JSON.parse(e);if(!n||typeof n!=`object`||Array.isArray(n))return r();let i=n;return i.pending!==void 0&&i.pending!==!0||i.pending&&(i.key!==null||i.unlockedAt!==null)||!X(i,t)&&!Ye(i,t)?r():{version:1,startedAt:i.startedAt,key:i.key,unlockedAt:i.unlockedAt,...i.pending?{pending:!0}:{}}}catch{return r()}}var tt=new URLSearchParams(location.search).get(`ice-study`),$=tt&&/^[1-4]$/.test(tt)?`${J}:study:${tt}`:J,nt;function rt(){nt?.(),nt=void 0,new e,ge();let a=new i,o=new AbortController,{signal:s}=o,c=document.getElementById(`key-access`),l=new URLSearchParams(location.search).get(`geometry-trial`),u=l===`compact`?`Compact geometry`:`Current geometry`,d;(l===`baseline`||l===`compact`)&&(c.dataset.geometryTrial=l,delete c.dataset.trialSceneMs,d=document.createElement(`output`),d.className=`key-geometry-trial`,d.textContent=u+` · Loading live scene…`,c.append(d)),delete c.dataset.stageFallback,delete c.dataset.meltStage;let f=c.querySelector(`#ice-vault-canvas`);if(f){if(f.dataset.renderMode){let e=f.cloneNode(!1);delete e.dataset.renderMode,e.hidden=!1,f.replaceWith(e)}else f.hidden=!1}c.dataset.scenePresented=`false`,c.dataset.effectsPresented=`false`;let p=c.querySelector(`.ice-loading-note`);p&&(p.hidden=!0);let m=document.getElementById(`ice-vault-action`);m.setAttribute(`aria-label`,`Unlock the box with the key`);let h=document.getElementById(`reset-key-btn`);document.getElementById(`lootlabs-link`);let g=c.querySelector(`.loot-reward-surface`),_=document.getElementById(`key-result`),v=document.getElementById(`key-reward-slot`),y=c.querySelector(`.ice-scene`),b=()=>{if(c.dataset.stageFallback!==`true`)return;let e=y.getBoundingClientRect(),t=c.querySelector(`.ice-copy`).getBoundingClientRect(),n=Math.min(e.width<700?280:320,e.width-32),r=e.width>=900?Math.min(e.width-n/2-16,t.right-e.left+16+n/2):0,i=e.width>=700&&e.width<900?Math.min(e.height-100,t.bottom-e.top+100):0;y.style.setProperty(`--fallback-reward-min-x`,r+`px`),y.style.setProperty(`--fallback-reward-min-y`,i+`px`)};window.addEventListener(`resize`,b,{passive:!0,signal:s}),v.appendChild(_);let x=document.getElementById(`key-countdown`),S=document.getElementById(`key-clock-unit`),C=c.querySelector(`.ice-clock-label`),w=document.getElementById(`key-progress`),T=document.getElementById(`key-status-title`),E=document.getElementById(`key-status-description`),D=document.getElementById(`key-announcement`),ee=document.getElementById(`ice-gesture`),O=matchMedia(`(prefers-reduced-motion: reduce)`),te=null;try{te=sessionStorage.getItem($)}catch{}let k=et(te,Date.now(),!0),ne,A,j=!1,M=!0,N,P=!1,F=-1/0,I=-1/0,re=-1,L,R,z,B=e=>{D.textContent=e},ie=()=>{try{sessionStorage.setItem($,JSON.stringify(k))}catch{}},V=()=>{ne?.(),ne=void 0},ae=(e=Q(k,Date.now()))=>{c.dispatchEvent(new CustomEvent(`melt-key-state`,{detail:e}))},oe=e=>{let t=e.phase===`ready`?P?`…`:`✓`:String(e.remaining).padStart(2,`0`),n=e.phase===`ready`?P?``:`OPEN`:`SEC`,r=e.phase===`waiting`?`MELTING`:e.phase===`available`?`KEY READY`:P?`UNLOCKING`:`VAULT OPEN`;x.textContent!==t&&(x.textContent=t),S.textContent!==n&&(S.textContent=n),C.textContent!==r&&(C.textContent=r)},H=(e=Q(k,Date.now()))=>{let n=N;N=e.phase,c.dataset.phase=N,document.dispatchEvent(new CustomEvent(`melt-key-poster-state`,{detail:N})),c.dataset.remaining=String(e.remaining),c.dataset.progress=String(e.progress),c.dataset.canAct=String(e.canAct),m.hidden=!0,m.disabled=!0,c.dataset.rewardPending=String(P),_.hidden=h.hidden=N!==`ready`||P,w.hidden=N!==`waiting`,w.value=e.progress*30,oe(e),T.textContent=N===`waiting`?`1. Wait for the ice to melt.`:N===`available`?`2. Your key is ready.`:P?`Opening the box...`:`3. Your access is ready.`,E.textContent=N===`waiting`?`The key will open the box automatically when the ice melts.`:N===`available`?`The key will unlock the box automatically.`:P?`Your key is opening the vault. Your access card will arrive here.`:`Continue through LootLabs and follow the steps to get your free key.`,ee.textContent=N===`waiting`?`Watch the ice melt. The key opens your reward automatically.`:E.textContent,n!==N&&(L?.kill(),c.dataset.phaseMotion=`idle`,t.set(g,{clearProps:`opacity,visibility,transform`}),_.inert=!1,N===`available`?B(`The key is free. The box will open automatically.`):N===`ready`&&B(P?`Opening your reward.`:`The LootLabs gateway is ready. Continue via FlowAuth to get your key.`)),ae(e)},se=(e=!0)=>{if(!j&&P&&N===`ready`){if(P=!1,c.dataset.unlocking=`false`,H(),e&&!O.matches&&c.dataset.stageFallback!==`true`){L?.kill(),c.dataset.phaseMotion=`active`;let e=_.getBoundingClientRect(),n=(y.dataset.cardOrigin??``).split(`,`).map(Number),r=n.length===2&&n.every(Number.isFinite);_.inert=!0,L=t.timeline({onComplete:()=>{c.dataset.phaseMotion=`idle`,_.inert=!1}}).fromTo(g,{opacity:.2,transformOrigin:`50% 50%`,x:r?n[0]-e.left-e.width/2:0,y:r?n[1]-e.top-e.height/2:22,scale:r?.25:.86},{opacity:1,x:0,y:0,scale:1,duration:1.1,ease:`power3.inOut`,clearProps:`opacity,transform,transformOrigin`})}B(`Your box is open. Your LootLabs access card is in the panel.`)}};c.addEventListener(`melt-key-reveal-complete`,()=>se(),{signal:s});let ce=()=>{z&&clearTimeout(z);let e=()=>{if(j||!k.key||k.unlockedAt===null)return;let t=k.unlockedAt+ve-Date.now();t>0?z=setTimeout(e,t):(de(),B(`Your previous key has expired. A new cube is melting.`))};k.key&&k.unlockedAt!==null&&(z=setTimeout(e,Math.max(0,k.unlockedAt+ve-Date.now())))},U=(e=0)=>{if(j)return;if($e(k,Date.now())){de(),B(`Your previous key has expired. A new cube is melting.`);return}let t=Q(k,Date.now());t.phase===`available`&&M&&!document.hidden&&fe()?pe():(t.phase!==N&&(H(t),t.phase!==`waiting`&&V()),oe(t),t.remaining!==re&&(re=t.remaining,c.dataset.remaining=String(t.remaining),t.phase===`waiting`&&t.remaining>0&&t.remaining%10==0&&B(`${t.remaining} seconds until your key is free.`)),(e===0||e-I>=.1||t.progress===1)&&(w.value=t.progress*30,c.dataset.progress=String(t.progress),I=e),ae(t))},W=()=>{k.pending||ne||document.hidden||!M||Q(k,Date.now()).phase!==`waiting`||(F=-1/0,ne=n(e=>{let t=O.matches?.25:r.getFrameInterval();e-F+1e-4<t||(F=e,U(e))}))},le=()=>{if(R&&clearTimeout(R),k.pending)return;let e=()=>{if(j||k.key)return;let t=k.startedAt+q-Date.now();t>0?R=setTimeout(e,Math.max(1,t)):U()};Q(k,Date.now()).phase===`waiting`&&(R=setTimeout(e,Math.max(1,k.startedAt+q-Date.now())))};function ue(){!j&&k.pending&&!document.hidden&&M&&(k=Z(k,Date.now()),re=-1,I=F=-1/0,ie(),H(),U(),W(),le())}function de(){let e=document.activeElement===h;if(V(),R&&clearTimeout(R),z&&clearTimeout(z),L?.kill(),P=!1,c.dataset.unlocking=`false`,k=Ze(Date.now()),re=-1,I=F=-1/0,ie(),H(),U(),W(),le(),ue(),B(`A fresh cube. Your 30-second melt has started.`),e){let e=document.getElementById(`ice-title`);e.setAttribute(`tabindex`,`-1`),e.focus({preventScroll:!0})}}function fe(){return!j&&!document.hidden&&M&&(c.dataset.scenePresented===`true`||c.dataset.stageFallback===`true`)}function pe(){if(!fe())return;let e=Qe(k,Date.now());e!==k&&(P=!O.matches&&c.dataset.meltStage===`ready`&&c.dataset.stageFallback!==`true`,k=e,ie(),H(),V(),ce())}h.addEventListener(`click`,de,{signal:s});let me=()=>{ue(),U(),W(),le(),ce()};document.addEventListener(`visibilitychange`,()=>{document.hidden?(V(),L?.pause()):(M&&L?.resume(),me())},{signal:s}),window.addEventListener(`pageshow`,me,{signal:s}),O.addEventListener(`change`,()=>{O.matches&&(L?.kill(),c.dataset.phaseMotion=`idle`,t.set(g,{clearProps:`opacity,visibility,transform`}),_.inert=!1,se(!1)),U()},{signal:s});let he=new IntersectionObserver(([e])=>{M=e.isIntersecting,M?(document.hidden||L?.resume(),ue(),U(),W()):(V(),L?.pause())},{threshold:.01});he.observe(c);let _e=document.getElementById(`key-menu-toggle`),ye=document.getElementById(`key-sign-in`),be=document.querySelector(`#key-sign-in-dialog`);ye?.addEventListener(`click`,()=>be?.showModal(),{signal:s});let xe=document.getElementById(`key-mobile-menu`),Se=(e=!1)=>{xe&&_e&&(xe.hidden=!0,_e.setAttribute(`aria-expanded`,`false`),e&&_e.focus())};_e?.addEventListener(`click`,()=>{if(!xe)return;let e=xe.hidden;xe.hidden=!e,_e.setAttribute(`aria-expanded`,String(e))},{signal:s}),xe?.addEventListener(`click`,e=>{e.target.closest(`a`)&&Se()},{signal:s}),document.addEventListener(`keydown`,e=>{e.key===`Escape`&&xe&&!xe.hidden&&Se(!0)},{signal:s});let Ce=matchMedia(`(min-width:961px)`);Ce.addEventListener(`change`,()=>{Ce.matches&&Se()},{signal:s});let we=document.getElementById(`site-header`),Te=({scroll:e})=>we?.classList.toggle(`scrolled`,e>40);a.instance.on(`scroll`,Te),Te({scroll:window.scrollY});let Ee=()=>{if(j)return;c.dataset.stageFallback=`true`,c.dataset.meltStage=`fallback`,c.dataset.scenePresented=`false`,d&&!c.dataset.trialSceneMs&&(d.textContent=u+` · Live scene unavailable`),ue(),b(),document.dispatchEvent(new CustomEvent(`melt-key-poster-state`,{detail:N}));let e=document.getElementById(`ice-vault-canvas`);e&&(e.hidden=!0),P?se(!1):ae()};c.addEventListener(`melt-key-ready`,()=>{if(c.dataset.meltStage=`ready`,d&&!c.dataset.trialSceneMs){let e=Math.round(performance.now());c.dataset.trialSceneMs=String(e),d.textContent=u+` · Live scene `+(e/1e3).toFixed(1)+` s`}ue(),U(),ae()},{signal:s}),c.addEventListener(`melt-key-fallback`,Ee,{signal:s}),ie(),H(),U(),W(),le(),ce();let De=!1;(()=>{if(!(De||j||c.dataset.stageFallback===`true`)){De=!0;try{A=Ke(c),ae()}catch{Ee()}}})(),nt=()=>{j||(j=!0,L?.kill(),V(),o.abort(),he.disconnect(),A?.(),d?.remove(),R&&clearTimeout(R),z&&clearTimeout(z),a.instance.off(`scroll`,Te),a.destroy())},window.addEventListener(`pagehide`,e=>{e.persisted||nt?.()},{signal:s})}var it=new AbortController;document.readyState===`loading`?document.addEventListener(`DOMContentLoaded`,rt,{once:!0,signal:it.signal}):rt();