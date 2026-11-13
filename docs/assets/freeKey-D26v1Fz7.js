import{n as e,t}from"./SnowyFooter-Dy0mc3AW.js";import{i as n}from"./vendor-gsap-bXzFIbWr.js";import{n as r,t as i}from"./Scroll-LFdG9vbQ.js";/* empty css                         */import{$ as a,A as o,B as s,C as c,D as l,E as u,F as d,G as f,H as p,I as m,J as h,K as g,L as _,M as v,O as y,P as b,Q as x,R as S,S as C,T as w,U as T,V as E,W as D,X as ee,Y as O,Z as te,_ as k,a as A,b as ne,c as j,d as M,et as N,f as P,g as F,h as re,i as ie,j as ae,k as I,l as L,m as R,n as z,nt as B,p as V,q as oe,r as H,s as se,t as ce,tt as U,u as le,v as ue,w as de,x as fe,y as pe,z as me}from"./vendor-three-BBYvWyCA.js";import{t as he}from"./SharedRenderer-DqgNKUun.js";var ge=class{container=null;badge=null;panel=null;tbody=null;isOpen=!1;currentFilter=`all`;currentSort=`size`;fpsHistory=[];lastFrameTime=performance.now();updateTimer=null;cachedData=null;constructor(){this.init()}init(){let e=new URLSearchParams(location.search),t=e.has(`debug`)||e.has(`perf`)||e.has(`cold_test`)||localStorage.getItem(`snowy:debug`)===`1`;this.createBadge(),this.createPanel(),this.attachShortcuts(),this.startBackgroundMetrics(),t&&this.open()}collectMetrics(){let e=performance.getEntriesByType(`resource`),t=performance.getEntriesByType(`navigation`)[0],n=document.getElementById(`key-access`),r=n?parseInt(n.dataset.drawCalls||`0`,10):0,i=n?parseInt(n.dataset.triangles||`0`,10):0,a=parseFloat(document.documentElement.dataset.previewDecodedAt||`0`),o=n&&n.dataset.trialSceneMs?parseFloat(n.dataset.trialSceneMs):n&&n.dataset.scenePresented===`true`?performance.now():0,s=t?t.loadEventEnd:0,c={video:{kb:0,count:0},texture:{kb:0,count:0},script:{kb:0,count:0},font:{kb:0,count:0},css:{kb:0,count:0},document:{kb:0,count:0},other:{kb:0,count:0}},l=0,u=0,d=0,f=0;if(t){let e=(t.transferSize||28980)/1024,n=(t.decodedBodySize||28980)/1024;c.document.kb+=e,c.document.count+=1,l+=e,u+=n,d+=1,t.transferSize===0&&(f+=1)}let p=[];t&&p.push({name:location.pathname.split(`/`).pop()||`free-key.html`,url:location.href,type:`document`,transferKB:(t.transferSize||28980)/1024,decodedKB:(t.decodedBodySize||28980)/1024,durationMs:Math.round(t.duration),startTimeMs:0,isCached:t.transferSize===0});for(let t of e){let e=t.name,n=e.split(`/`).pop()?.split(`?`)[0]||e,r=t.initiatorType,i=`other`;/\.(mp4|webm|ogv)$/i.test(n)||r===`video`?i=`video`:/\.(webp|jpg|jpeg|png|gif|svg|hdr)$/i.test(n)||r===`img`?i=`texture`:/\.(js|mjs)$/i.test(n)||r===`script`?i=`script`:/\.(woff2|woff|ttf|otf)$/i.test(n)||r===`font`?i=`font`:(/\.css$/i.test(n)||r===`css`||r===`link`)&&(i=`css`);let a=t.transferSize===0&&t.decodedBodySize>0,o=(t.transferSize||t.encodedBodySize||0)/1024,s=(t.decodedBodySize||t.transferSize||0)/1024;c[i].kb+=o,c[i].count+=1,l+=o,u+=s,d+=1,a&&(f+=1),p.push({name:n,url:e,type:i,transferKB:o,decodedKB:s,durationMs:Math.round(t.duration),startTimeMs:Math.round(t.startTime),isCached:a})}let m=this.calculateFPS();return{totalTransferKB:l,totalDecodedKB:u,totalNetworkCalls:d,cachedCalls:f,gpuDrawCalls:r,gpuTriangles:i,fps:m,timeToPreviewMs:a,timeTo3DReadyMs:o,windowLoadMs:s,categories:c,assets:p}}calculateFPS(){let e=performance.now(),t=e-this.lastFrameTime;if(this.lastFrameTime=e,t>0){let e=Math.round(1e3/t);this.fpsHistory.push(e),this.fpsHistory.length>20&&this.fpsHistory.shift();let n=this.fpsHistory.reduce((e,t)=>e+t,0)/this.fpsHistory.length;return Math.min(60,Math.round(n))}return 60}createBadge(){this.badge=document.createElement(`button`),this.badge.id=`snowy-wifi-badge`,this.badge.setAttribute(`type`,`button`),this.badge.setAttribute(`aria-label`,`Toggle WiFi & WebGL Debugger`),this.badge.innerHTML=`
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
    `,document.head.appendChild(e)}};function _e(){return new ge}var ve=3e4,ye=864e5;function be(){let e=crypto.getRandomValues(new Uint8Array(8)),t=Array.from(e,e=>`ABCDEFGHJKLMNPQRSTUVWXYZ23456789`[e%32]).join(``);return`SNOWY-FREE-${t.slice(0,4)}-${t.slice(4)}-${new Date().getFullYear()}`}var xe={uCampDetail:{value:null},uHasCampDetail:{value:0},uCompactCamp:{value:new U},uPhoneSnow:{value:null},uHasPhoneSnow:{value:0},uPhoneSnowLayout:{value:0}};function Se(e,t=!1,n=t){xe.uPhoneSnow.value=e??null,xe.uHasPhoneSnow.value=e?.image&&t?1:0,xe.uPhoneSnowLayout.value=e?.image&&t&&n?1:0}function Ce(e=0,t=0,n=0,r=!1){xe.uCompactCamp.value.set(e,t,n,+!!r)}function we(e){xe.uCampDetail.value=e??null,xe.uHasCampDetail.value=+!!e}var Te=`uniform sampler2D uCampDetail;uniform float uHasCampDetail;uniform vec4 uCompactCamp;uniform sampler2D uPhoneSnow;uniform float uHasPhoneSnow;uniform float uPhoneSnowLayout;
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
}`;function Ee(e){let{surface:t,scene:n,camera:r,sky:i,fire:a}=e,o={value:new U},s={value:null},c={value:0},u=new g({transparent:!0,depthTest:!1,depthWrite:!1,toneMapped:!1,uniforms:{...xe,uPlate:s,uCrop:o,uClose:c},vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}`,fragmentShader:`${Te}\nuniform sampler2D uPlate;uniform vec4 uCrop;uniform float uClose;varying vec2 vUv;
 void main(){vec2 uv=vUv*uCrop.xy+uCrop.zw;float coverage=1.-smoothstep(.355,.405,uv.y);
 if(coverage<.001)discard;gl_FragColor=vec4(campPlateColor(uPlate,uv,uClose),coverage);
 #include <colorspace_fragment>
 }`}),d=new l(new _(2,2),u);d.name=`early-camp-ground`,d.frustumCulled=!1,d.renderOrder=-19,d.visible=!1,n.add(d);let f=!1,p=!1,m=``,h=!1,v=!1,y=!0,b=null,x=()=>String(a.mesh.material.map?.uuid)+`:`+String(y),S=async()=>{let o=x(),s=new Set,c=e=>{e instanceof ee&&e.image&&!e.isRenderTargetTexture&&!(e instanceof B)&&s.add(e)};c(e.background()),Object.values(xe).forEach(e=>c(e.value)),Object.values(i.root.material.uniforms).forEach(e=>c(e.value)),c(a.mesh.material.map);let u=[];for(let e of s){let t=e.image;t?.decode&&u.push(t.decode().catch(()=>{}))}if(await Promise.all(u),f)return;for(let e of s)t.engine.initTexture(e);let h=new pe;h.add(i.root.clone(!1),d.clone(!1)),a.root.traverse(e=>{e instanceof l&&h.add(e.clone(!1))}),t.engine.toneMapping=t.toneMapping,t.engine.toneMappingExposure=t.toneMappingExposure,t.engine.outputColorSpace=t.outputColorSpace,await t.engine.compileAsync(h,r,n),!f&&(m=o,p=!1,e.onReady())};return{ground:d,get ready(){return m===x()&&!!m},get started(){return h},render(l,u,g){if(y=g,a.setMotion(g),f||!e.ready()||!i.ready||!e.background()?.image||!(a.root.userData.posterReady||a.root.userData.videoReady))return!1;let _=t.engine.getContext();if(b){let t=_.clientWaitSync(b,0,0);if(t===_.TIMEOUT_EXPIRED)return!0;_.deleteSync(b),b=null,v||(v=!0,e.onFirst(t===_.WAIT_FAILED?`frame-fallback`:`fence-complete`))}if(m!==x())return p||(p=!0,S().catch(()=>{f||e.onError()})),!1;let C=e.background();s.value=C,o.value.set(C.repeat.x,C.repeat.y,C.offset.x,C.offset.y),c.value=+!!C.userData.closeCamp,i.setCamera(r),i.setActive(u&&g),i.update(l),a.setMotion(g),a.update(l,r,u&&g),e.irradiance();let w=e.hidden().filter(e=>!!e),T=w.map(e=>e.visible),E=[];n.traverse(e=>{e instanceof re&&(E.push([e.shadow,e.shadow.needsUpdate]),e.shadow.needsUpdate=!1)});try{w.forEach(e=>e.visible=!1),d.visible=!0,t.render(n,r),h=!0}finally{d.visible=!1,w.forEach((e,t)=>e.visible=T[t]),E.forEach(([e,t])=>e.needsUpdate=t)}return v||(v=!0,e.onFirst(`immediate`)),!0},dispose(){f=!0,cancelAnimationFrame(0),b&&t.engine.getContext().deleteSync(b),n.remove(d),d.geometry.dispose(),u.dispose()}}}function De(e,t=!1,n){if(n){let t=De(e);return{...t,x:n.x,y:n.y,scale:t.scale*n.zoom}}return t?{x:.577,y:.737,scale:.87,canonicalY:.75,originalBaseY:.798,originalHeight:.18}:e?{x:.563,y:.646,scale:.64,canonicalY:.664,originalBaseY:.69,originalHeight:.095}:{x:.6105,y:.681,scale:.58,canonicalY:.75,originalBaseY:.798,originalHeight:.18}}function Oe(e,t,n,r,i,o=!1){let s=o?i?32:48:i?40:64,c=(t,n,r,i=0,a=0,o=0)=>{let s=new l(n,r);return s.name=t,s.position.set(i,a,o),e.add(s),s},u=[[.255,-.03],[.25,0],[.255,.03],[.273,.052],[.315,.062],[.355,.057],[.385,.035],[.392,0],[.385,-.035],[.355,-.057],[.315,-.062],[.273,-.052],[.255,-.03]].reverse().map(([e,t])=>new a(e,t)),d=new C(u,s);d.rotateX(Math.PI/2);let f=c(`key-ring`,d,r,0,1.89,0);for(let e of[-1,1])c(`ring-outer-bead`,new x(.385,.006,6,s),n,0,1.89,e*.037),c(`ring-inner-bead`,new x(.255,.005,6,s),n,0,1.89,e*.03);let p=c(`key-shaft`,new R(.056,.062,1.37,s,1),t,0,.842,0);c(`shaft-foot`,new O(.062,s,10),n,0,.157,0);let m=[[0,1.405],[.056,1.405],[.058,1.425],[.091,1.432],[.104,1.447],[.106,1.464],[.09,1.48],[.073,1.488],[.076,1.504],[.112,1.516],[.116,1.535],[.098,1.552],[.074,1.563],[.07,1.584],[.076,1.606],[0,1.606]].map(([e,t])=>new a(e,t)),g=c(`key-turned-neck`,new C(m,s),t);for(let e of[1.45,1.532]){let t=new x(e===1.45?.1:.11,.009,6,s);t.rotateX(Math.PI/2),c(`neck-polished-bead`,t,n,0,e,0)}let _=new h;return _.moveTo(.024,.2),_.lineTo(.255,.2),_.lineTo(.255,.305),_.lineTo(.132,.305),_.lineTo(.132,.393),_.lineTo(.255,.393),_.lineTo(.255,.495),_.lineTo(.024,.495),_.closePath(),{ring:f,shaft:p,bit:c(`key-bit`,new k(_,{depth:.086,bevelEnabled:!0,bevelThickness:.009,bevelSize:.009,bevelSegments:3,steps:1}),t,0,0,-.043),collar:g}}var W=new Map,ke=`snowy_ice_cache_v1`,Ae=`geometries`;function je(){return typeof indexedDB>`u`?Promise.resolve(null):new Promise(e=>{try{let t=indexedDB.open(ke,1);t.onupgradeneeded=()=>{try{t.result.createObjectStore(Ae)}catch{}},t.onsuccess=()=>e(t.result),t.onerror=()=>e(null)}catch{e(null)}})}function Me(e,t,n){let r=new le;return r.setAttribute(`position`,new L(new Float32Array(e),3)),r.setAttribute(`normal`,new L(new Float32Array(t),3)),r.setIndex(new L(n.length<=65535?new Uint16Array(n):new Uint32Array(n),1)),r.name=`natural-hewn-ice-watertight`,r.computeBoundingBox(),r.computeBoundingSphere(),r}async function Ne(e=40){let t=Number.isFinite(e)?Math.max(8,Math.min(80,Math.round(e))):40;if(W.has(t))return;let n=await je();if(n)try{let e=await new Promise(e=>{let r=n.transaction(Ae,`readonly`).objectStore(Ae).get(`ice_${t}`);r.onsuccess=()=>e(r.result??null),r.onerror=()=>e(null)});if(e&&e.pos&&e.norm&&e.idx){let n=Me(e.pos,e.norm,e.idx);W.set(t,n);return}}catch{}let r=Pe(t);if(W.set(t,r),n)try{let e=r.getAttribute(`position`).array,i=r.getAttribute(`normal`).array,a=r.getIndex().array;n.transaction(Ae,`readwrite`).objectStore(Ae).put({pos:e,norm:i,idx:a},`ice_${t}`)}catch{}}function Pe(e){let t=new j(2,2,2,e,e,e),n=t.getAttribute(`position`),r=new N,i=new N,a=new N,o=[{normal:new N(.64,.62,.45).normalize(),limit:1.37},{normal:new N(-.74,.49,-.46).normalize(),limit:1.39},{normal:new N(.09,1,-.045).normalize(),limit:.955}],s=e=>Math.abs(e)<=.75?e/.75*.85:Math.sign(e)*(.85+(Math.abs(e)-.75)/.25*.15);for(let e=0;e<n.count;e++){r.set(s(n.getX(e)),s(n.getY(e)),s(n.getZ(e))),i.copy(r).clampScalar(-.85,.85),a.copy(r).sub(i).normalize(),r.copy(i).addScaledVector(a,.15);let t=(r.y+1)*.5;r.x*=1-.036*t,r.z*=1-.024*t;let c=.006*Math.sin(r.x*9+r.y*4)*Math.sin(r.z*7-r.y*3)+.004*Math.sin(r.x*19+r.z*13);r.addScaledVector(a,c*w.smoothstep(t,.04,.2));for(let e of o){let t=r.dot(e.normal)-e.limit;t>0&&r.addScaledVector(e.normal,-t)}n.setXYZ(e,r.x,r.y,r.z)}t.deleteAttribute(`uv`),t.deleteAttribute(`normal`);let c=H(t,1e-5);return t.dispose(),c.computeVertexNormals(),c.name=`natural-hewn-ice-watertight`,c.computeBoundingBox(),c.computeBoundingSphere(),c}function Fe(e=40){let t=Number.isFinite(e)?Math.max(8,Math.min(80,Math.round(e))):40,n=W.get(t);if(n)return n.clone();let r=Pe(t);return W.set(t,r.clone()),r}var Ie=(e,t,n)=>{let r=w.clamp((n-e)/(t-e),0,1);return r*r*(3-2*r)};function Le(e){let t=w.clamp(e,0,1),n=t**1.55,r=w.lerp(1-.12*n,.985,Ie(.66,1,t));return{x:r,y:1-n,z:r,cx:0,cz:0}}var G=`
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
}`;function K(e){let t=new s().setFromEuler(new F(-Math.PI/2,0,-.08)),n=new N,r=1/0;e.traverse(e=>{if(!(e instanceof l))return;e.updateMatrix();let i=e.geometry.getAttribute(`position`);for(let a=0;a<i.count;a++)n.fromBufferAttribute(i,a).applyMatrix4(e.matrix).multiplyScalar(.7).applyQuaternion(t),r=Math.min(r,n.y)});let i=.029-r+.002;return{pose:e=>{let t=w.clamp(e,0,1),n=Ie(.64,1,t);return{angle:Math.PI/2*n,y:.14-.045*n+(i-.095)*Ie(.78,1,t),z:.08+.68*n}},endY:i}}function Re(e=40,t=3,n,r,i={}){let a=i.highDetail??e>32,s=a||!!i.naturalClarity,u=new pe;u.name=`melt-key-model`;let d=w.clamp(Math.round(t),1,4),f=!1;u.userData.highDetail=a,u.userData.materialStudy=d,u.userData.materialReady=!1;let p=new te().load(`/assets/ice-studies/study-${d}${e<=32?`-mobile`:``}.webp`,e=>{f?e.dispose():(u.userData.materialReady=!0,n?.())},void 0,()=>{f||r?.()});p.colorSpace=``,p.minFilter=de,p.magFilter=c,p.anisotropy=a?8:4;let m=[.6,.65,.59,.62][d-1],h={value:+!!s},g={value:m*(s?.8:1)},v=new pe;v.name=`key`;let y={uMelt:{value:0},uOpacity:{value:1},uWet:{value:0},uVolumeRoughness:{value:.13},uKeyReveal:{value:0}},b=new o({color:14936813,metalness:0,roughness:.12,transmission:.98,thickness:1,ior:1.31,attenuationColor:11452359,attenuationDistance:s?4.6:3.8,clearcoat:0,clearcoatRoughness:.36,envMapIntensity:.32,transparent:!0,depthWrite:!1}),x=1967,S=()=>(x=x*1664525+1013904223>>>0,x/4294967296),C=Array.from({length:20},()=>{let e=S()*Math.PI*2,t=Math.sqrt(S())*.49;return new U(Math.cos(e)*t+.04,-.58+S()*1.1,Math.sin(e)*t*.75,.012+S()*.016)});b.onBeforeCompile=e=>{e.uniforms.uMelt=y.uMelt,e.uniforms.uKeyReveal=y.uKeyReveal,e.uniforms.uAirPockets={value:C},e.uniforms.uVolumeRoughness=y.uVolumeRoughness,e.uniforms.uStudyMap={value:p},e.uniforms.uFrostStrength=g,e.uniforms.uNaturalClarity=h,e.uniforms.uClearCentre={value:[.78,.48,.82,.65][d-1]},e.fragmentShader=`uniform float uNaturalClarity;uniform vec4 uAirPockets[${C.length}];uniform sampler2D uStudyMap;uniform float uClearCentre;uniform float uFrostStrength;uniform float uKeyReveal;uniform float uVolumeRoughness;uniform float uMelt;uniform mat3 normalMatrix;varying vec3 vJellyLocal;float iceColorDepth;
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
      float fractures=(1.-smoothstep(.002,.010${a?`+fractureAA`:``},min(fractureA,fractureB)))*(.30+.70*mottling);
      ${a?`// Nested, interrupted fine fractures; bounded to sparse patches.
      float fineFracture=abs(dot(vJellyLocal,normalize(vec3(.34,-.28,.89)))+.22+.007*sin(vJellyLocal.y*23.));
      float fineAA=max(fwidth(fineFracture),.0008);
      float microCrack=(1.-smoothstep(fineAA,fineAA*2.5,fineFracture))*smoothstep(.44,.67,mottling);
      fractures=max(fractures,microCrack*.35);`:``}
      frozenDetail.r=max(frozenDetail.r,fractures*.68);
      float frozenAmount=uFrostStrength*(1.-smoothstep(.42,.92,uMelt));
      roughnessFactor=clamp(roughnessFactor+frozenDetail.r*.44*frozenAmount,.07,.48);
      ${a?`// Restrained micro-frost changes the highlight instead of painting
      // the clear viewing window white. Existing mottling bounds the patches.
      roughnessFactor+=fractures*.025*(1.-smoothstep(.45,.88,uMelt));`:``}`),e.fragmentShader=e.fragmentShader.replace(`#include <normal_fragment_maps>`,`#include <normal_fragment_maps>
      vec3 opticalRipple=vec3(sin(vJellyLocal.y*2.4+vJellyLocal.z*.7),sin(vJellyLocal.z*2.1-vJellyLocal.x*.8),sin(vJellyLocal.x*2.3+vJellyLocal.y*.6));
      normal=normalize(normal+normalMatrix*opticalRipple*.003*(1.-.7*smoothstep(.66,1.,uMelt)));
      vec3 sx=dFdx(-vViewPosition),sy=dFdy(-vViewPosition);
      vec3 rx=cross(sy,normal),ry=cross(normal,sx);
      float determinant=dot(sx,rx);
      vec3 gradient=sign(determinant)*(dFdx(frozenDetail.g)*rx+dFdy(frozenDetail.g)*ry);
      normal=normalize(max(abs(determinant),.0000001)*normal-gradient*.0005*frozenAmount);`);let t=A.transmission_pars_fragment.replaceAll(`getVolumeTransmissionRay( n, v, thickness,`,`getVolumeTransmissionRay( n, v, min( thickness, mix(.42,.14,smoothstep(.15,.70,uMelt)) ),`).replaceAll(`volumeAttenuation( length( transmissionRay ),`,`volumeAttenuation( iceColorDepth,`).replace(`vec3 attenuatedColor = transmittance * transmittedLight.rgb;`,`
        vec3 attenuatedColor = transmittance * transmittedLight.rgb;
        // Restore a restrained amount of warmth only where the opaque-buffer
        // sample is gold. White surroundings and blue ice keep their original
        // absorption; surface frost, blur and reflection remain in front.
        float goldChroma=(transmittedLight.r-transmittedLight.b)/max(.05,max(transmittedLight.r,transmittedLight.g));
        float goldMask=smoothstep(.10,.38,goldChroma)*smoothstep(.015,.10,transmittedLight.r);
        float goldReadability=.48*smoothstep(.10,.88,uMelt)*uKeyReveal;
        attenuatedColor=mix(attenuatedColor,transmittedLight.rgb*vec3(1.,.86,.55)+vec3(.035,.018,.002),goldMask*goldReadability);
      `);e.fragmentShader=e.fragmentShader.replace(`#include <transmission_pars_fragment>`,t);let n=A.transmission_fragment.replace(`n, v, material.roughness, material.diffuseContribution`,`n, v, uVolumeRoughness, material.diffuseContribution`);n=n.replace(`vec4 transmitted = getIBLVolumeRefraction(`,`
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
      for(int bubble=0;bubble<${C.length};bubble++){
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
`+G+`
`+e.vertexShader,e.vertexShader=e.vertexShader.replace(`#include <beginnormal_vertex>`,`#include <beginnormal_vertex>
      vec3 normalAxis=abs(objectNormal.y)<.9?vec3(0.,1.,0.):vec3(1.,0.,0.);
      vec3 tangent=normalize(cross(normalAxis,objectNormal));
      vec3 bitangent=cross(objectNormal,tangent);
      vec3 anchor=meltIce(position);
      vec3 alongT=meltIce(position+tangent*.001)-anchor;
      vec3 alongB=meltIce(position+bitangent*.001)-anchor;
      objectNormal=normalize(cross(alongT,alongB));`),e.vertexShader=e.vertexShader.replace(`#include <begin_vertex>`,`#include <begin_vertex>
      vJellyLocal=position;transformed=meltIce(position);`)},b.customProgramCacheKey=()=>`snowy-natural-hewn-ice-v7-`+C.length+`-`+Number(a)+`-`+Number(s);let T=Fe(e),D=new l(T,b);D.name=`ice-body`,D.position.y=1.03,u.add(D);let ee=new ae({color:14476262,roughness:.94,metalness:0,transparent:!0,opacity:s?.66:.92,depthWrite:!1,envMapIntensity:.18});ee.onBeforeCompile=e=>{e.uniforms.uMelt=y.uMelt,e.uniforms.uOpacity=y.uOpacity,e.uniforms.uRimeAtlas={value:p},e.vertexShader=`uniform float uMelt;varying vec3 vRimeLocal;
`+G+`
`+e.vertexShader,e.vertexShader=e.vertexShader.replace(`#include <begin_vertex>`,`#include <begin_vertex>
      vRimeLocal=position;transformed=meltIce(position)+objectNormal*.0025*(1.-uMelt);`),e.fragmentShader=`uniform sampler2D uRimeAtlas;uniform float uMelt;uniform float uOpacity;varying vec3 vRimeLocal;
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
      diffuseColor.a*=max(max(max(cortex*clusters*1.05,basal),frostPatch*.62),max(0.,crackle-.20)*1.35)*grain*uOpacity*(1.-smoothstep(.32,.82,uMelt));`)},ee.customProgramCacheKey=()=>`snowy-patchy-rime-v3-`+Number(a);let O=new l(T,ee);O.name=`surface-hoar`,O.position.copy(D.position),u.add(O);let k=new o({color:14003806,roughness:.23,metalness:1,envMapIntensity:1.25,emissive:0}),ne=new o({color:15848076,roughness:.14,metalness:1,envMapIntensity:1.35}),j=new o({color:13017434,roughness:.29,metalness:1,envMapIntensity:1.2}),M=e=>`uniform float uKeyReveal;
`+e.replace(`void main() {`,`void main() {
    if(uKeyReveal<.9999){float grain=fract(sin(dot(floor(gl_FragCoord.xy),vec2(12.9898,78.233)))*43758.5453);if(uKeyReveal<=0.||grain>uKeyReveal)discard;}`);for(let e of[k,ne,j])e.onBeforeCompile=e=>{e.uniforms.uKeyReveal=y.uKeyReveal,e.fragmentShader=M(e.fragmentShader)},e.customProgramCacheKey=()=>`snowy-turned-gold-resolve-v1`;let P=new I({depthPacking:E});P.onBeforeCompile=e=>{e.uniforms.uKeyReveal=y.uKeyReveal,e.fragmentShader=M(e.fragmentShader)},P.customProgramCacheKey=()=>`snowy-key-shadow-resolve-v6`;let{ring:F,shaft:re,bit:ie,collar:L}=Oe(v,k,ne,j,e<=32,i.compactGeometry);v.position.set(0,.14,.08),v.scale.setScalar(.7),u.add(v);let R=K(v),z=new pe;z.name=`ambiguous-golden-core`,z.visible=!1,u.add(z);let B=new oe({color:4810100,opacity:.22,depthWrite:!1});B.onBeforeCompile=e=>{e.uniforms.uMelt=y.uMelt,e.vertexShader=`varying vec2 vShadowFloor;
`+e.vertexShader,e.vertexShader=e.vertexShader.replace(`#include <worldpos_vertex>`,`#include <worldpos_vertex>
 vShadowFloor=(modelMatrix*vec4(transformed,1.)).xz;`),e.fragmentShader=`uniform float uMelt;varying vec2 vShadowFloor;
      float iceFoot(){return .94*(1.-.12*pow(clamp(uMelt,0.,1.),1.55));}
      vec2 iceCenter(){return vec2(0.);}
      float icePenumbra(){float gap=max(0.,max(abs(vShadowFloor.x-iceCenter().x),abs(vShadowFloor.y-iceCenter().y))-iceFoot());return mix(.32,1.,smoothstep(0.,.85,gap));}
    `+e.fragmentShader;let t=A.shadowmask_pars_fragment.replace(`directionalLight.shadowRadius,`,`directionalLight.shadowRadius * mix(icePenumbra(),1.,smoothstep(.80,1.,uMelt)),`);e.fragmentShader=e.fragmentShader.replace(`#include <shadowmask_pars_fragment>`,t),e.fragmentShader=e.fragmentShader.replace(`gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );`,`
      float edge=max(abs(vShadowFloor.x-iceCenter().x),abs(vShadowFloor.y-iceCenter().y));
      float contact=1.-smoothstep(iceFoot()*.83,iceFoot()*1.08,edge);
      float density=mix(.44+.56*contact,1.,smoothstep(.80,1.,uMelt));
      gl_FragColor=vec4(color,opacity*density*(1.-getShadowMask()));`)},B.customProgramCacheKey=()=>`snowy-translucent-contact-shadow-v2`;let V=new l(new _(200,200),B);V.name=`shadow-receiver`,V.rotation.x=-Math.PI/2,V.receiveShadow=!0,u.add(V),D.castShadow=!0,v.traverse(e=>{e instanceof l&&(e.castShadow=!0,e.customDepthMaterial=P)});let H=new I({depthPacking:E});H.onBeforeCompile=e=>{e.uniforms.uMelt=y.uMelt,e.vertexShader=`uniform float uMelt;
`+G+`
`+e.vertexShader,e.vertexShader=e.vertexShader.replace(`#include <begin_vertex>`,`#include <begin_vertex>
 transformed=meltIce(position);`)},H.customProgramCacheKey=()=>`snowy-complete-vertical-shadow-v11`,D.customDepthMaterial=H;let se={ice:D,key:v,ring:F,shaft:re,bit:ie,collar:L,floor:V,core:z};u.userData.sculptRuntime={nodes:se,meshes:{root:D,ring:F,shaft:re,bit:ie,collar:L},sockets:{floor:new N(0,.04,0)},colliders:{ice:{type:`box`,size:[2,2,2]},key:{type:`compound`}},explodable:!0,clickable:!0};let ce=(e,t,n)=>{let r=w.clamp((n-e)/(t-e),0,1);return r*r*(3-2*r)},le=(e,t=0)=>{let n=w.clamp(e,0,1);y.uMelt.value=n;let r=Le(n),i=Math.cbrt(r.x*r.y*r.z);b.roughness=.12+.06*ce(.72,1,n);let a=(1-ce(.978,1,n))*(1-t);y.uOpacity.value=a,b.opacity=a,D.visible=n<1&&a>1e-5,O.visible=n<.82&&a>1e-5,D.castShadow=D.visible&&n<.978;let o=ce(.04,.48,n);y.uVolumeRoughness.value=.13-.05*o,v.visible=!0,y.uKeyReveal.value=ce(.04,.18,n),k.emissiveIntensity=0,u.userData.meltwater={enabled:!1,wetness:0,runoffVisible:!1,dropsVisible:!1,area:0,visualVolume:0,filmHeight:0},u.userData.meltVisual={iceTint:b.attenuationColor.getHexString(),iceScale:i,iceOpacity:b.opacity,keyBlur:y.uVolumeRoughness.value,keyReveal:y.uKeyReveal.value,glowAlpha:1-y.uKeyReveal.value};let s=R.pose(n);v.rotation.set(-s.angle*(1-t),0,-.08*(1-t)),v.position.set(0,s.y+1.45*t,s.z*(1-t)),v.scale.setScalar(.7-.18*t),u.userData.meltDynamics={choreography:`reference-progressive`,keyAngle:s.angle,keyY:s.y,keyZ:s.z,iceCenter:[r.cx,r.cz],iceHalfSize:[r.x,r.y,r.z],remnantHeight:r.y*2},u.updateMatrixWorld(!0)};le(0);let ue=()=>{f=!0,p.dispose();let e=new Set,t=new Set;u.traverse(n=>{n instanceof l&&(e.add(n.geometry),(Array.isArray(n.material)?n.material:[n.material]).forEach(e=>t.add(e)),n instanceof fe&&n.dispose())}),H.dispose(),P.dispose(),e.forEach(e=>e.dispose()),t.forEach(e=>e.dispose())};return{root:u,...se,startupTextures:[p],update:le,dispose:ue,setNaturalClarity(e){let t=a||e;h.value=+!!t,g.value=m*(t?.8:1),b.attenuationDistance=t?4.6:3.8,ee.opacity=t?.66:.92}}}function ze(e={}){let t=e.highDetail??!e.lowPower,n=new pe;n.name=`walnut-chest`,n.userData.highDetail=t;let r=new pe;r.name=`walnut-lid-pivot`,r.position.set(0,1.06,-.9),n.add(r);let i=new v;i.name=`walnut-key-socket`,i.position.set(0,.79,.925),n.add(i);let s=new Set,c=new Set,u=new Set,d={root:n,lid:r,lockSocket:i},f=!1,p=new o({color:t?`#c4a78d`:`#b08e71`,roughness:t?.58:.68,metalness:0,clearcoat:t?.18:.08,clearcoatRoughness:t?.38:.34,normalScale:new a(t?.32:.1,t?.32:.1)});n.userData.materialReady=!1;let m=new te,g=0,_=e.assetBase??`/assets/walnut-chest/`,y=(t,r=!1)=>{let i=m.load(`${_}${t}${e.lowPower?`-mobile`:``}.webp`,()=>{f?i.dispose():(g++,n.userData.materialReady=g===3,e.onReady?.())},void 0,()=>{f||(n.userData.materialError=!0,e.onError?.())});return i.colorSpace=r?D:``,i.anisotropy=e.lowPower?4:8,i.wrapS=i.wrapT=T,u.add(i),i};p.map=y(`walnut-color`,!0),p.normalMap=y(`walnut-normal`),p.roughnessMap=y(`walnut-roughness`),p.onBeforeCompile=e=>{e.fragmentShader=e.fragmentShader.replace(`#include <map_fragment>`,`#include <map_fragment>
    // Preserve the photographed veneer contrast instead of tinting it flat.
    diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.20,.115,.064),${t?`.055`:`.22`});`)},p.customProgramCacheKey=()=>`snowy-veneer-detail-v3-`+Number(t);let x=p.clone();x.color.set(t?`#a58c75`:`#947056`),t&&(x.onBeforeCompile=p.onBeforeCompile,x.customProgramCacheKey=p.customProgramCacheKey);let S=new o({color:`#b99656`,roughness:t?.27:.3,metalness:1,envMapIntensity:1}),C=new o({color:`#171b1e`,roughness:.98,metalness:0,sheen:.35,sheenColor:new P(`#394044`),sheenRoughness:.9});c.add(p),c.add(x),c.add(S),c.add(C);let E=e=>(s.add(e),e),ee=(e,t)=>{let n=e.getAttribute(`position`),r=e.getAttribute(`normal`),i=new Float32Array(n.count*2);for(let e=0;e<n.count;e++){let a=n.getX(e)+t.x,o=n.getY(e)+t.y,s=n.getZ(e)+t.z,c=Math.abs(r.getX(e)),l=Math.abs(r.getY(e)),u=Math.abs(r.getZ(e));l>c&&l>u?(i[e*2]=a/3.3+.5,i[e*2+1]=(s+.9)/1.8*.42+.44):c>u?(i[e*2]=s/3.3+.5,i[e*2+1]=o/1.535*.46+.15):(i[e*2]=a/3.3+.5,i[e*2+1]=o/1.535*.46+.15)}e.setAttribute(`uv`,new L(i,2))},O=(e,t,n,i,a)=>{(n===p||n===x)&&ee(t,new N(a.x,a.y+(i===r?1.06:0),a.z+(i===r?-.9:0)));let o=new l(E(t),n);return o.name=e,o.position.copy(a),o.castShadow=!0,o.receiveShadow=!0,o.userData.partId=e,i.add(o),d[e]=o,o},A=(r,i,a,o,s,c,l,u=n,d=p)=>O(r,new ce(i,a,o,e.lowPower?2:3,Math.min(t?.024:.018,i*.12,a*.12,o*.12)),d,u,new N(s,c,l));A(`bottom`,3.02,.14,1.52,0,.07,0),A(`back`,3.3,1.05,.14,0,.525,-.83),A(`side-left`,.14,1.05,1.56,-1.58,.525,0),A(`side-right`,.14,1.05,1.56,1.58,.525,0);let ne=(e,t,n)=>{let r=new h,i=-e/2,a=-t/2;return r.moveTo(i+n,a),r.lineTo(i+e-n,a),r.quadraticCurveTo(i+e,a,i+e,a+n),r.lineTo(i+e,a+t-n),r.quadraticCurveTo(i+e,a+t,i+e-n,a+t),r.lineTo(i+n,a+t),r.quadraticCurveTo(i,a+t,i,a+t-n),r.lineTo(i,a+n),r.quadraticCurveTo(i,a,i+n,a),r},M=e=>{let t=new b;return t.absarc(0,e,.072,Math.PI*1.24,Math.PI*1.76,!0),t.lineTo(.088,e-.245),t.quadraticCurveTo(.092,e-.265,.07,e-.265),t.lineTo(-.07,e-.265),t.quadraticCurveTo(-.092,e-.265,-.088,e-.245),t.closePath(),t},F=ne(3.3,1.05,.018);F.holes.push(M(.265)),O(`front`,new k(F,{depth:.14,steps:1,bevelEnabled:!0,bevelSegments:2,bevelSize:.006,bevelThickness:.006,curveSegments:e.lowPower?12:20}),p,n,new N(0,.525,.76));let re=ne(.31,.44,.042);re.holes.push(M(.79-.705)),O(`lock`,new k(re,{depth:.018,steps:1,bevelEnabled:!0,bevelSegments:2,bevelSize:.004,bevelThickness:.004,curveSegments:e.lowPower?12:24}),S,n,new N(0,.705,.906)),A(`lid`,3.3,.475,1.8,0,.2375,.9,r),A(`lid-inset`,3,.018,1.5,0,-.005,.9,r,x),A(`interior`,3,.025,1.5,0,.153,0,n,C);let ie=.037;for(let[t,r]of[[`hinge-a`,-1.02],[`hinge-b`,1.02]]){let i=new pe;i.name=t,i.position.set(r,1.05,-.89),n.add(i),d[t]=i,A(`${t}-base`,.32,.1,.014,0,-.045,-.01,i,S);let a=O(`${t}-knuckle`,new R(ie,ie,.32,e.lowPower?12:20),S,i,new N);a.rotation.z=Math.PI/2}let I=E(new R(.014,.014,.007,e.lowPower?8:12)),z=new fe(I,S,t?6:4);z.name=`hinge-screws`;let B=new v,V=0;for(let e of[-1.12,-.92,.92,1.12])B.position.set(e,1.015,-.913),B.rotation.set(Math.PI/2,0,0),B.updateMatrix(),z.setMatrixAt(V++,B.matrix);n.add(z);let oe,H;if(t){for(let e of[.89,.51])B.position.set(0,e,.932),B.rotation.set(Math.PI/2,0,0),B.updateMatrix(),z.setMatrixAt(V++,B.matrix);let e=new ae({color:`#30281f`,roughness:.85,metalness:.22});c.add(e),oe=new fe(E(new j(.018,.003,.0015)),e,2),oe.name=`lock-screw-slots`;for(let e=0;e<2;e++)B.position.set(0,[.89,.51][e],.9365),B.rotation.set(0,0,e?.36:-.2),B.updateMatrix(),oe.setMatrixAt(e,B.matrix);n.add(oe),H=new fe(E(new j(.006,.94,.001)),e,2),H.name=`front-corner-joinery`;for(let e=0;e<2;e++)B.position.set(e?-1.5:1.5,.525,.9065),B.rotation.set(0,0,0),B.updateMatrix(),H.setMatrixAt(e,B.matrix);n.add(H)}d.lid=r,d[`hinge-screws`]=z;let U={};n.traverse(e=>{e instanceof l&&(U[e.name]=e)});let le=[...n.children].filter(e=>e!==i),ue=new N(0,.75,0);n.updateMatrixWorld(!0);let de=le.map(e=>({part:e,position:e.position.clone(),offset:new se().setFromObject(e).getCenter(new N).sub(ue)}));n.userData.sculptRuntime={nodes:d,meshes:U,sockets:{key:i,hinge:r},colliders:{body:{type:`compound-box`,size:[3.3,1.535,1.8]},lid:{type:`box`,size:[3.3,.475,1.8]}},destructionGroups:{body:[`front`,`back`,`side-left`,`side-right`,`bottom`].map(e=>d[e]),lid:[r]},explodable:!0,clickable:!0,setExplode(e){let t=w.clamp(e,0,1);for(let e of de)e.part.position.copy(e.position).addScaledVector(e.offset,t*.65)}},n.userData.reference=`Walnut presentation box: proportional/material inspiration; inferred rear/interior and adapted working lock.`;let me=e=>{r.rotation.x=-w.clamp(e,0,1)*1.83,n.userData.openProgress=w.clamp(e,0,1)};return me(0),{root:n,lidPivot:r,keySocket:i,update:me,dispose(){f||(f=!0,s.forEach(e=>e.dispose()),c.forEach(e=>e.dispose()),u.forEach(e=>e.dispose()),z.dispose(),oe?.dispose(),H?.dispose(),n.clear())}}}function Be(e){if(e.index||Object.keys(e.morphAttributes).length)return!1;let t=Object.entries(e.attributes);if(!t.length||t.some(([,e])=>!(e instanceof L)||!(e.array instanceof Float32Array)||`isInstancedBufferAttribute`in e))return!1;let n=t[0][1].count;if(t.some(([,e])=>e.count!==n))return!1;let r=t.map(([e,t])=>({name:e,attribute:t,words:new Uint32Array(t.array.buffer,t.array.byteOffset,t.array.length)})),i=[],a=new Uint32Array(n),o=new Map,s=0;for(let{attribute:e}of r)s+=e.itemSize*4;for(let e=0;e<n;e++){let t=``;for(let{attribute:n,words:i}of r)for(let r=0;r<n.itemSize;r++){let a=i[e*n.itemSize+r];t+=String.fromCharCode(a>>>16,a&65535)}let n=o.get(t);n===void 0&&(n=i.length,i.push(e),o.set(t,n)),a[e]=n}let c=i.length<=65535;if(i.length*s+n*(c?2:4)>=n*s)return!1;for(let{name:t,attribute:n,words:a}of r){let r=new Float32Array(i.length*n.itemSize),o=new Uint32Array(r.buffer);for(let e=0;e<i.length;e++)o.set(a.subarray(i[e]*n.itemSize,(i[e]+1)*n.itemSize),e*n.itemSize);let s=new L(r,n.itemSize,n.normalized);s.name=n.name,s.gpuType=n.gpuType,s.setUsage(n.usage),e.setAttribute(t,s)}return e.setIndex(new L(c?new Uint16Array(a):a,1)),!0}function Ve(e={}){if(new URLSearchParams(location.search).get(`chest`)===`legacy`)return ze(e);let t=e.highDetail??!e.lowPower,n=new pe;n.name=`walnut-chest`,n.userData.highDetail=t;let r=new pe;r.name=`walnut-lid-pivot`,r.position.set(0,1.06,-.9),n.add(r);let i=new v;i.name=`walnut-key-socket`,i.position.set(0,.79,.925),n.add(i);let s=new Set,c=new Set,u=new Set,d={root:n,lid:r,lockSocket:i},f=!1,p=new o({color:`#c28452`,roughness:.65,metalness:0,clearcoat:.18,clearcoatRoughness:.32,normalScale:new a(.35,.35)});n.userData.materialReady=!1;let m=new te,g=0,_=e.assetBase??(e.lowPower?`/assets/walnut-chest/`:`/assets/walnut-chest-v2/`),y=(t,r=!1)=>{let i=`${_}${t}${e.lowPower?`-mobile`:``}.webp`,a=e.compactGeometry?1:e.lowPower?3:2,o=()=>{g++,n.userData.materialReady=g===a,e.onReady?.()},s=m.load(i,e=>{f?e.dispose():o()},void 0,()=>{f||(n.userData.materialError=!0,e.onError?.())});return s.colorSpace=r?D:``,s.anisotropy=e.lowPower?4:8,s.wrapS=s.wrapT=T,u.add(s),s};p.map=y(`walnut-color`,!0),e.compactGeometry?(p.roughness=.62,p.metalness=0):(p.normalMap=y(e.lowPower?`walnut-normal`:`walnut-normal-roughness`),p.roughnessMap=e.lowPower?y(`walnut-roughness`):p.normalMap),p.onBeforeCompile=t=>{e.lowPower||(t.fragmentShader=t.fragmentShader.replace(`#include <roughnessmap_fragment>`,A.roughnessmap_fragment.replace(`texelRoughness.g`,`texelRoughness.a`))),t.fragmentShader=t.fragmentShader.replace(`#include <map_fragment>`,`#include <map_fragment>
      diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.26, 0.12, 0.05), 0.28);
    `)},p.customProgramCacheKey=()=>`snowy-crafted-walnut-v4-`+Number(!!e.lowPower);let x=p.clone();x.color.set(`#c2a78b`),x.onBeforeCompile=p.onBeforeCompile,x.customProgramCacheKey=p.customProgramCacheKey;let S=new o({color:`#c29542`,roughness:.32,metalness:.88,clearcoat:.3,envMapIntensity:1.2}),C=new o({color:`#171b1e`,roughness:.98,metalness:0,sheen:.35,sheenColor:new P(`#394044`),sheenRoughness:.9});c.add(p),c.add(x),c.add(S),c.add(C);let E=e=>(s.add(e),e),ee=(e,t,n)=>{let r=e.getAttribute(`position`),i=e.getAttribute(`normal`),a=new Float32Array(r.count*2);for(let e=0;e<r.count;e++){let o=r.getX(e)+t.x,s=r.getY(e)+t.y,c=r.getZ(e)+t.z,l=Math.abs(i.getX(e)),u=Math.abs(i.getY(e)),d=Math.abs(i.getZ(e)),f=1/3.3;u>l&&u>d?(a[e*2]=(n.includes(`stile`)?c:o)*f+.5,a[e*2+1]=(n.includes(`stile`)?o:c)*f+.48):l>d?(a[e*2]=c*f+.37,a[e*2+1]=s*f+.23):n.includes(`stile`)?(a[e*2]=s*f+.16,a[e*2+1]=o*f+.5):(a[e*2]=o*f+.5,a[e*2+1]=s*f+.15)}e.setAttribute(`uv`,new L(a,2))},O=(e,t,n,i,a)=>{(n===p||n===x)&&ee(t,new N(a.x,a.y+(i===r?1.06:0),a.z+(i===r?-.9:0)),e);let o=new l(E(t),n);return o.name=e,o.position.copy(a),o.castShadow=!0,o.receiveShadow=!0,o.userData.partId=e,i.add(o),d[e]=o,o},ne=new Map,M=(e,t,n,r,i)=>{let a=`${e}_${t}_${n}_${r}_${i}`,o=ne.get(a);return o||(o=new ce(e,t,n,r,i),ne.set(a,o)),o.clone()},F=(r,i,a,o,s,c,l,u=n,d=p)=>O(r,M(i,a,o,e.compactGeometry?1:e.lowPower?2:3,Math.min(t?.024:.018,i*.12,a*.12,o*.12)),d,u,new N(s,c,l));F(`bottom`,3.02,.14,1.52,0,.07,0),F(`back`,3.3,1.05,.14,0,.525,-.83),F(`side-left`,.14,1.05,1.56,-1.58,.525,0),F(`side-right`,.14,1.05,1.56,1.58,.525,0);let re=(e,t,n)=>{let r=new h,i=-e/2,a=-t/2;return r.moveTo(i+n,a),r.lineTo(i+e-n,a),r.quadraticCurveTo(i+e,a,i+e,a+n),r.lineTo(i+e,a+t-n),r.quadraticCurveTo(i+e,a+t,i+e-n,a+t),r.lineTo(i+n,a+t),r.quadraticCurveTo(i,a+t,i,a+t-n),r.lineTo(i,a+n),r.quadraticCurveTo(i,a,i+n,a),r},ie=e=>{let t=new b;return t.absarc(0,e,.072,Math.PI*1.24,Math.PI*1.76,!0),t.lineTo(.088,e-.245),t.quadraticCurveTo(.092,e-.265,.07,e-.265),t.lineTo(-.07,e-.265),t.quadraticCurveTo(-.092,e-.265,-.088,e-.245),t.closePath(),t},I=re(3.3,1.05,.018);I.holes.push(ie(.265)),O(`front`,new k(I,{depth:.14,steps:1,bevelEnabled:!0,bevelSegments:2,bevelSize:.006,bevelThickness:.006,curveSegments:e.lowPower?12:20}),p,n,new N(0,.525,.76));let B=re(.31,.44,.042);B.holes.push(ie(.79-.705)),O(`lock`,new k(B,{depth:.018,steps:1,bevelEnabled:!0,bevelSegments:2,bevelSize:.004,bevelThickness:.004,curveSegments:e.lowPower?12:24}),S,n,new N(0,.705,.906)),F(`lid`,3.3,.445,1.8,0,.2225,.9,r),F(`lid-inset`,3,.018,1.5,0,-.005,.9,r,x),F(`interior`,3,.025,1.5,0,.153,0,n,C);let V=[];if(!e.compactGeometry){V.push(F(`lid-panel`,2.99,.018,1.49,0,.449,.9,r));for(let e of[.06,1.74])V.push(F(`lid-rail`,3.3,.03,.12,0,.46,e,r));for(let e of[-1.59,1.59])V.push(F(`lid-stile`,.12,.03,1.56,e,.46,.9,r));for(let e of[.055,.995])V.push(F(`front-rail`,3.15,.09,.022,0,e,.918));for(let e of[-1.575,1.575])V.push(F(`front-stile`,.1,.85,.022,e,.525,.918))}for(let e of[n,r]){let t=V.filter(t=>t.parent===e);if(t.length===0)continue;let r=[];for(let n of t)n.updateMatrix(),r.push(n.geometry.clone().applyMatrix4(n.matrix)),e.remove(n),s.delete(n.geometry),n.geometry.dispose(),d[n.name]===n&&delete d[n.name];let i=z(r);if(r.forEach(e=>e.dispose()),i){let t=new l(E(i),p);t.name=e===n?`crafted-front-frame`:`crafted-lid-frame`,t.castShadow=!0,t.receiveShadow=!0,e.add(t),d[t.name]=t}}let oe=.037,H,U;if(!e.compactGeometry){for(let[t,r]of[[`hinge-a`,-1.02],[`hinge-b`,1.02]]){let i=new pe;i.name=t,i.position.set(r,1.05,-.89),n.add(i),d[t]=i,F(`${t}-base`,.32,.1,.014,0,-.045,-.01,i,S);let a=O(`${t}-knuckle`,new R(oe,oe,.32,e.lowPower?12:20),S,i,new N);a.rotation.z=Math.PI/2}let r=E(new R(.014,.014,.007,e.lowPower?8:12));H=new fe(r,S,t?6:4),H.name=`hinge-screws`;let i=new v,a=0;for(let e of[-1.12,-.92,.92,1.12])i.position.set(e,1.015,-.913),i.rotation.set(Math.PI/2,0,0),i.updateMatrix(),H.setMatrixAt(a++,i.matrix);if(n.add(H),t){for(let e of[.89,.51])i.position.set(0,e,.932),i.rotation.set(Math.PI/2,0,0),i.updateMatrix(),H.setMatrixAt(a++,i.matrix);let e=new ae({color:`#30281f`,roughness:.85,metalness:.22});c.add(e),U=new fe(E(new j(.018,.003,.0015)),e,2),U.name=`lock-screw-slots`;for(let e=0;e<2;e++)i.position.set(0,[.89,.51][e],.9365),i.rotation.set(0,0,e?.36:-.2),i.updateMatrix(),U.setMatrixAt(e,i.matrix);n.add(U)}}d.lid=r,H&&(d[`hinge-screws`]=H),s.forEach(Be);let le={};n.traverse(e=>{e instanceof l&&(le[e.name]=e)});let ue=[...n.children].filter(e=>e!==i),de=new N(0,.75,0);n.updateMatrixWorld(!0);let me=ue.map(e=>({part:e,position:e.position.clone(),offset:new se().setFromObject(e).getCenter(new N).sub(de)}));n.userData.sculptRuntime={nodes:d,meshes:le,sockets:{key:i,hinge:r},colliders:{body:{type:`compound-box`,size:[3.3,1.535,1.8]},lid:{type:`box`,size:[3.3,.475,1.8]}},destructionGroups:{body:[`front`,`back`,`side-left`,`side-right`,`bottom`].map(e=>d[e]),lid:[r]},explodable:!0,clickable:!0,setExplode(e){let t=w.clamp(e,0,1);for(let e of me)e.part.position.copy(e.position).addScaledVector(e.offset,t*.65)}},n.userData.reference=`Walnut presentation box: proportional/material inspiration; inferred rear/interior and adapted working lock.`;let he=e=>{r.rotation.x=-w.clamp(e,0,1)*1.83,n.userData.openProgress=w.clamp(e,0,1)};return he(0),{root:n,lidPivot:r,keySocket:i,update:he,dispose(){f||(f=!0,ne.forEach(e=>e.dispose()),ne.clear(),s.forEach(e=>e.dispose()),c.forEach(e=>e.dispose()),u.forEach(e=>{e.dispose(),e.image instanceof ImageBitmap&&e.image.close()}),H?.dispose(),U?.dispose(),n.clear())}}}var q=`
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
`;function He(e,t,n,r,i,o){let s=new _(80,80);s.rotateX(-Math.PI/2),s.translate(0,-.006,0);let c={value:e},u={value:new U(1,1,0,0)},d={value:0},f={value:0},p={value:1},m={value:r.position.clone()},h={value:0},g={value:new U},v={value:new U},y={value:new a},b={value:0},x=new ae({color:16777215,roughness:1,metalness:0,toneMapped:!1});x.onBeforeCompile=e=>{Object.assign(e.uniforms,{...xe,...i,uPhoneGround:b,uWoodFoot:g,uIceFoot:v,uFootAngles:y,uSnowBackdrop:c,uSnowCrop:u,uCloseCamp:d,uHighDetail:f,uIceStrength:p,uFirePosition:m,uFireFlicker:h}),o&&(e.uniforms.uSharedIrradiance=o),e.vertexShader=(o?`uniform sampler2D uSharedIrradiance;
`:``)+`varying vec3 vSnowWorld;varying vec4 vSnowClip;varying vec3 vAuroraIrradiance;
`+q+`
`+e.vertexShader,e.vertexShader=e.vertexShader.replace(`#include <project_vertex>`,`#include <project_vertex>
      vSnowWorld=(modelMatrix*vec4(transformed,1.)).xyz;vSnowClip=gl_Position;vAuroraIrradiance=${o?`texelFetch(uSharedIrradiance,ivec2(0),0).rgb`:i.uAuroraGroundStrength.value>0?`auroraDiffuseIrradiance(vec3(0.,1.,0.))`:`vec3(0.)`};`),e.fragmentShader=`uniform float uHighDetail;uniform float uCloseCamp;${Te}
 uniform sampler2D uSnowBackdrop;uniform vec4 uSnowCrop;uniform float uIceStrength;uniform vec3 uFirePosition;uniform float uFireFlicker;uniform vec4 uWoodFoot;uniform vec4 uIceFoot;uniform vec2 uFootAngles;uniform float uPhoneGround;
      varying vec3 vSnowWorld;varying vec4 vSnowClip;varying vec3 vAuroraIrradiance;
      ${q}
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
      #include <opaque_fragment>`)},x.customProgramCacheKey=()=>`snowy-phone-contact-v3`+(o?`-shared-f32-v1`:``);let S=new pe;S.name=`photographic-snow-ground`;let C=new l(s,x);C.receiveShadow=!0,S.add(C);let w=(e,t,n)=>{let r=[],i=[];for(let e=0;e<=128;e++){let a=e/128*Math.PI*2,o=Math.cos(a),s=Math.sin(a),c=Math.min((t-.018)/Math.max(1e-4,Math.abs(o)),(n-.018)/Math.max(1e-4,Math.abs(s))),l=Math.min((t+.13)/Math.max(1e-4,Math.abs(o)),(n+.13)/Math.max(1e-4,Math.abs(s))),u=.018+.008*Math.sin(a*19)+.005*Math.sin(a*43+1);if(r.push(o*c,u,s*c,o*l,-.006,s*l),e<128){let t=e*2;i.push(t,t+2,t+1,t+1,t+2,t+3)}}let a=new le;a.setAttribute(`position`,new ue(r,3)),a.setIndex(i),a.computeVertexNormals();let o=new l(a,x);return o.position.copy(e.position),o.position.y=0,o.rotation.y=e.rotation.y,o.receiveShadow=!0,S.add(o),o},T=t.scale.x,E=n.scale.x,D=w(t,1.65*T,.9*T),ee=w(n,E,E);return{root:S,setBackground(t){e=t,c.value=t},update(i,a,o){g.value.set(t.position.x,t.position.z,1.65*t.scale.x,.9*t.scale.z),v.value.set(n.position.x,n.position.z,n.scale.x,n.scale.z),y.value.set(t.rotation.y,n.rotation.y),b.value=+!!e.userData.integratedPhone,D.visible=b.value<.5,ee.visible=b.value<.5,D.position.set(t.position.x,0,t.position.z),D.rotation.y=t.rotation.y,D.scale.set(t.scale.x/T,b.value?t.scale.x*2.5:1,t.scale.z/T),ee.position.set(n.position.x,0,n.position.z),ee.rotation.y=n.rotation.y,ee.scale.set(n.scale.x/E,1,n.scale.z/E),d.value=+!!e.userData.closeCamp,f.value=+!!e.userData.highDetail,p.value=(1-i)*(1-a),ee.scale.y=p.value*(b.value?n.scale.x*2.5:1),ee.visible=b.value<.5&&p.value>.01,u.value.set(e.repeat.x,e.repeat.y,e.offset.x,e.offset.y),m.value.copy(r.position),h.value=.055*Math.sin(o*7.1)+.025*Math.sin(o*13.7)},dispose(){s.dispose(),D.geometry.dispose(),ee.geometry.dispose(),x.dispose()}}}function Ue(e){let t=e.assetBase??`/assets/realistic-winter`,n=e.maxTextureSize>=4108,r=e.lowPower?`aurora-mobile-v1.webp`:`aurora-user-original-v1.webp`,i=!1,o=!1,s=!1,d=new AbortController,f={value:new U(1,1,0,0)},p=new ee,m=new te().load(`${t}/${r}`,()=>{i?m.dispose():(p.image=m.image,p.needsUpdate=!0,s=!0,e.onReady?.())},void 0,t=>{console.error(`[SKY TEXTURE ERROR]`,t),i||e.onError?.()});p.colorSpace=``,p.generateMipmaps=!1,p.minFilter=p.magFilter=c;let h={uAuroraMap:{value:p},uAuroraIntensity:{value:e.intensity??.62},uAuroraGroundStrength:{value:0},uAuroraPortrait:{value:0},uAuroraTime:{value:0},uAuroraNatureBounce:{value:0},uAuroraCrop:f,uAuroraProjection:{value:new a(1,1)},uAuroraViewToWorld:{value:new u},uAuroraWorldToView:{value:new u}},v={value:null},y={value:0},b=!1,x=[],S=()=>{let e=x[+!!b];v.value=e,y.value=+!!e?.image},C=new te,T=n=>{let r=+!!n;if(x[r]?.image)return;let a=n?`aurora-sky-portrait-mask.webp`:`aurora-sky-landscape-enhanced-mask-v1.webp`,o=t=>{i?t.dispose():(x[r]?.dispose(),x[r]=t,S(),e.onReady?.())},s=C.load(t+`/`+a,()=>{o(s)},void 0,()=>{i||e.onError?.()});s.colorSpace=``,s.generateMipmaps=!1,s.minFilter=s.magFilter=c};T(typeof window<`u`&&matchMedia(`(orientation: portrait), (max-width: 699px)`).matches);let E=new g({transparent:!0,blending:1,depthWrite:!1,depthTest:!0,toneMapped:!1,uniforms:{...h,uPlate:{value:null},uHasPlate:{value:0},uSkyMask:v,uHasSkyMask:y,uSkyGate:{value:new a(...e.skyBlueGate??[.68,.9])},uCrop:f},vertexShader:`varying vec2 vUv;varying vec3 vAuroraIrradiance;
      ${q}
      void main(){vUv=uv;vAuroraIrradiance=vec3(0.);gl_Position=vec4(position.xy,.9999999,1.);}`,fragmentShader:`precision highp float;uniform sampler2D uPlate;uniform sampler2D uSkyMask;uniform float uHasSkyMask;uniform vec2 uSkyGate;uniform vec4 uCrop;uniform float uHasPlate;varying vec2 vUv;varying vec3 vAuroraIrradiance;
      ${q}
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
      }`}),D=new l(new _(2,2),E);return D.name=`user-original-aurora`,D.frustumCulled=!1,D.renderOrder=-20,{root:D,lighting:h,get textureVariant(){return n?`comfyui-upper-local`:`original-capability-fallback`},get ready(){return s&&!!x[+!!b]?.image},get time(){return h.uAuroraTime.value},update(e){!i&&o&&(h.uAuroraTime.value=e)},setCamera(e){e.updateMatrixWorld(),h.uAuroraViewToWorld.value.setFromMatrix4(e.matrixWorld),h.uAuroraWorldToView.value.setFromMatrix4(e.matrixWorldInverse);let t=Math.tan(w.degToRad(e.fov)*.5);h.uAuroraProjection.value.set(t*e.aspect,t)},setActive(e){i||(o=e)},setCrop(e,t=!1){f.value.set(e.repeat.x,e.repeat.y,e.offset.x,e.offset.y),E.uniforms.uPlate.value=e,E.uniforms.uHasPlate.value=1,h.uAuroraPortrait.value=+!!t,h.uAuroraNatureBounce.value=!t&&e.userData.highDetail?1:0,b=t,T(t),S()},setIrradiance(e){E.uniforms.uSharedIrradiance=e,E.vertexShader=`uniform sampler2D uSharedIrradiance;
`+E.vertexShader.replace(`vAuroraIrradiance=auroraDiffuseIrradiance(vec3(0.,1.,0.));`,`vAuroraIrradiance=texelFetch(uSharedIrradiance,ivec2(0),0).rgb;`),E.needsUpdate=!0},setIntensity(e){h.uAuroraIntensity.value=w.clamp(e,0,2)},get state(){return o&&s?`flowing`:`still`},dispose(){i||(i=!0,d.abort(),p.dispose(),x.forEach(e=>e.dispose()),D.geometry.dispose(),E.dispose())}}}function J(e,t,n,r){let i=new U,a=new U,o=!1,s=!1;e.onBeforeRender=e=>{if(o=!1,e.getRenderTarget()!==null||t.x<=0||t.y<=0||(e.getCurrentViewport(a),a.z<=0||a.w<=0))return;e.getScissor(i),s=e.getScissorTest();let c=e.getPixelRatio(),l=r()?.095:.084,u=r()?.018:.027,d=(n.x-t.z)/t.x,f=(1-n.y-t.w)/t.y,p=n.z*l/t.x,m=n.z*u/t.y,h=Math.max(a.x,Math.floor(a.x+(d-p)*a.z)-2),g=Math.max(a.y,Math.floor(a.y+(f-m)*a.w)-2),_=Math.min(a.x+a.z,Math.ceil(a.x+(d+p)*a.z)+2),v=Math.min(a.y+a.w,Math.ceil(a.y+(f+m)*a.w)+2);s&&(h=Math.max(h,i.x*c),g=Math.max(g,i.y*c),_=Math.min(_,(i.x+i.z)*c),v=Math.min(v,(i.y+i.w)*c)),e.setScissor(h/c,g/c,Math.max(0,_-h)/c,Math.max(0,v-g)/c),e.setScissorTest(!0),o=!0},e.onAfterRender=e=>{o&&=(e.setScissor(i),e.setScissorTest(s),!1)}}function We(e={}){let t=new pe;t.name=`photographed-campfire-flame`;let n=new AbortController,r=!1,i=!0,a=!1,o=!1,s=!1,u=0,d=-1,f=document.createElement(`video`);f.muted=!0,f.loop=!0,f.playsInline=!0,f.preload=`auto`,f.crossOrigin=`anonymous`,f.setAttribute(`playsinline`,``),f.setAttribute(`muted`,``);let p=!1,m;typeof f.requestVideoFrameCallback==`function`&&(m=f.requestVideoFrameCallback(()=>{m=void 0,!r&&(p=!0,e.onReady?.())}));let h=new B(f);h.colorSpace=D,h.minFilter=h.magFilter=c,h.generateMipmaps=!1;let v={value:1.08},b={value:0},x={value:new U(1,1,0,0)},C={value:0},T={value:null},E={value:new N(.6105,.681,.58)},ee=`uniform float uCloseCamp;${Te}
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
    }`,O=new y({color:16777215,map:h,transparent:!0,depthWrite:!1,side:2,toneMapped:!1,fog:!1,blending:5,blendEquation:100,blendSrc:201,blendDst:201});O.onBeforeCompile=e=>{Object.assign(e.uniforms,xe),e.uniforms.uFlameExposure=v,e.uniforms.uCloseCamp=b,e.uniforms.uPlateCrop=x,e.uniforms.uPortrait=C,e.uniforms.uPitLayout=E,e.vertexShader=`varying vec4 vFlameClip;
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
    `)},O.customProgramCacheKey=()=>`snowy-photographed-flame-distant-pit-v4`;let k=new _(4/3,1),A=new l(k,O);A.name=`real-flame-footage`,A.position.y=.32,A.renderOrder=3,t.add(A);let ne=new S(16749624,12,14,1.3);ne.position.set(0,.45,.04),t.add(ne);let j,M=new g({transparent:!0,depthTest:!1,depthWrite:!1,toneMapped:!1,blending:2,uniforms:{...xe,uCloseCamp:b,uPlate:T,uPlateCrop:x,uPortrait:C,uPitLayout:E,uFlames:{value:h}},vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}`,fragmentShader:`uniform sampler2D uPlate;uniform sampler2D uFlames;varying vec2 vUv;${ee}
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
      }`}),P=new l(new _(2,2),M);P.frustumCulled=!1,P.renderOrder=2,t.add(P),J(P,x.value,E.value,()=>C.value>.5);let F=new le,re=new Float32Array(60),ie=new Float32Array(20),ae=413,I=()=>(ae=1664525*ae+1013904223>>>0,ae/4294967296);for(let e=0;e<20;e++)re[e*3]=(I()-.5)*.4,re[e*3+1]=I()*1,re[e*3+2]=(I()-.5)*.4,ie[e]=I();F.setAttribute(`position`,new L(re,3)),F.setAttribute(`phase`,new L(ie,1));let R={value:0},z=new g({transparent:!0,depthTest:!1,depthWrite:!1,blending:2,toneMapped:!1,uniforms:{uTime:R},vertexShader:`uniform float uTime;attribute float phase;varying float vAlpha;
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
      }`}),V=new me(F,z);V.name=`rising-sparks`,V.frustumCulled=!1,V.renderOrder=4,t.add(V);let oe=e=>{O.map!==e&&(O.map=e,O.needsUpdate=!0)},H=()=>{if(!r){if(i&&t.userData.videoReady&&!s?(oe(h),M.uniforms.uFlames.value=h):j&&t.userData.posterReady?(oe(j),M.uniforms.uFlames.value=j):t.userData.videoReady&&(oe(h),M.uniforms.uFlames.value=h),!i||!a)o&&(d=u),(!f.paused||o)&&f.pause(),t.userData.playing=!1;else if(t.userData.videoReady&&f.paused&&!o&&!s){o=!0;let e=++u;f.play().then(()=>{o=!1,!r&&(t.userData.playing=i&&a&&!f.paused,i&&a||f.pause())},n=>{o=!1,!r&&(s=n?.name!==`AbortError`||e!==d,t.userData.playing=!1,s&&j&&t.userData.posterReady&&oe(j))})}}},se=!1,ce=()=>{r||se||(se=!0,f.src=e.source??`/assets/realistic-winter/flames-real-loop.mp4`,f.load())};j=new te().load(e.poster??`/assets/realistic-winter/flames-real-poster.jpg`,n=>{r?n.dispose():(t.userData.posterReady=!0,H(),e.onReady?.())},void 0,n=>{r||(t.userData.posterError=!0,ce(),e.onError?.(n))}),j.colorSpace=D,j.generateMipmaps=!1,j.minFilter=c,f.addEventListener(`loadeddata`,()=>{h.needsUpdate=!0,t.userData.videoReady=!0,H(),e.onReady?.()},{signal:n.signal}),f.addEventListener(`error`,()=>{t.userData.videoError=!0,e.onError?.(f.error)},{signal:n.signal}),document.addEventListener(`pointerdown`,()=>{s&&(s=!1,H())},{signal:n.signal,passive:!0}),e.deferVideo||ce();let ue=new N;return{root:t,mesh:A,light:ne,video:f,loadVideo:ce,get motionBlocked(){return s},get framePresented(){return p||typeof f.requestVideoFrameCallback!=`function`&&f.readyState>=2&&f.currentTime>0},setComposition(e,t){b.value=+!!e.userData.closeCamp;let n=De(t,!!e.userData.closeCamp,e.userData.compactPit);E.value.set(n.x,n.y,n.scale),T.value=e,C.value=+!!t,x.value.set(e.repeat.x,e.repeat.y,e.offset.x,e.offset.y)},setMotion(e){i!==e&&(i=e,H())},setExposure(e){v.value=w.clamp(e,.1,3)},update(e,n,r){a=r,t.updateWorldMatrix(!0,!1),n.getWorldPosition(ue),t.worldToLocal(ue),A.rotation.y=Math.atan2(ue.x,ue.z),R.value=performance.now()*.001,ne.intensity=8*(i&&a?1+.055*Math.sin(e*7.1)+.025*Math.sin(e*13.7):1),H()},pause(){a=!1,H()},dispose(){m!==void 0&&f.cancelVideoFrameCallback(m),!r&&(r=!0,n.abort(),f.pause(),f.removeAttribute(`src`),f.load(),F.dispose(),z.dispose(),k.dispose(),O.dispose(),P.geometry.dispose(),M.dispose(),h.dispose(),j?.dispose(),t.clear())}}}var Y=(e,t,n)=>{let r=w.clamp((n-e)/(t-e),0,1);return r*r*(3-2*r)};function Ge(e,t){let n=new N,r=new N,i=new N,a=new s,o=new s,c=new s,l=new N,u=new N,d=new N,f=new s,p=new s,m=new N,h=new N,g=new N,_=new s().setFromAxisAngle(new N(1,0,0),Math.PI/2),v=new s,y=new N(0,1,0),b=new V,x=!1,S=()=>{e.updateWorldMatrix(!0,!1),t.updateWorldMatrix(!0,!1),e.getWorldPosition(n),e.getWorldQuaternion(a),e.getWorldScale(l),t.getWorldPosition(m),t.getWorldQuaternion(c),h.set(0,0,1).applyQuaternion(c).normalize(),o.copy(c).multiply(_).multiply(new s().setFromAxisAngle(y,-Math.PI/2));let u=w.clamp(n.distanceTo(m)*.2,.64,1.8);r.copy(n).add(new N(0,u,0)),g.set(0,.157,0).multiply(l).applyQuaternion(o),i.copy(m).addScaledVector(h,.58).sub(g),b.v0.copy(r),b.v1.copy(r).add(new N(0,.45,0)),b.v2.copy(i).addScaledVector(h,.26).add(new N(0,.9,0)),b.v3.copy(i),x=!0};return{begin:S,apply:t=>{x||S();let i=w.clamp(t,0,1),s=Y(0,.15,i),c=Y(.15,.46,i);i<.15?d.lerpVectors(n,r,s):b.getPoint(c,d),f.slerpQuaternions(a,o,Y(.04,.46,i));let _=Y(.46,.58,i),C=Y(.59,.69,i);i>=.46&&(f.copy(o).multiply(v.setFromAxisAngle(y,Math.PI/2*C)),g.set(0,.157,0).multiply(l).applyQuaternion(f),d.copy(m).addScaledVector(h,w.lerp(.58,-.35,_)).sub(g));let T=d.clone();e.parent.updateWorldMatrix(!0,!1),e.position.copy(e.parent.worldToLocal(d)),e.parent.getWorldQuaternion(p).invert(),e.quaternion.copy(p).multiply(f),e.parent.getWorldScale(u),e.scale.copy(l).divide(u),e.visible=!0,e.updateWorldMatrix(!1,!0);let E=g.set(0,.157,0).applyMatrix4(e.matrixWorld);return{lift:s,travel:c,insertion:_,turn:C,lid:Y(.69,.93,i),card:Y(.93,1,i),keyTip:E.toArray(),socket:m.toArray(),axisError:1-Math.abs(new N(0,1,0).applyQuaternion(f).dot(h)),keyWorld:T.toArray()}},reset(){x=!1}}}function Ke(e){let t=document.createElement(`canvas`);t.width=e?768:1280,t.height=e?432:720;let n=t.getContext(`2d`),r=t.width,i=t.height,a=!1,s=()=>{n.fillStyle=`#0a2030`,n.fillRect(0,0,r,i),n.strokeStyle=`#9acbdf`,n.lineWidth=r*.002,n.strokeRect(r*.035,i*.06,r*.93,i*.88),n.textBaseline=`top`,n.fillStyle=`#a8cada`,n.font=`500 ${r*.026}px "IBM Plex Sans",sans-serif`,n.fillText(`SNOWY STUDIOS`,r*.075,i*.14),n.fillStyle=`#edf8ff`,n.font=`500 ${r*.102}px "IBM Plex Sans",sans-serif`,n.fillText(`LootLabs`,r*.068,i*.36),n.fillStyle=`#a6dff6`,n.fillRect(r*.075,i*.66,r*.11,i*.006),n.font=`500 ${r*.025}px "IBM Plex Sans",sans-serif`,n.fillText(`CONTINUE VIA FLOWAUTH`,r*.075,i*.76),n.fillText(`01 / GATEWAY`,r*.7,i*.76)};s();let c=new M(t);c.colorSpace=D,c.anisotropy=4,document.fonts.load(`500 32px "IBM Plex Sans"`).then(()=>{a||(s(),c.needsUpdate=!0)},()=>{});let u=new o({color:`#c6a46e`,metalness:.75,roughness:.3}),d=new ae({map:c,roughness:.48,metalness:0}),f=new pe;f.name=`free-access-card`;let p=new l(new j(1.9,1.07,.025),[u,u,u,u,d,u]);return p.castShadow=!0,f.add(p),f.visible=!1,{root:f,update(e){f.visible=e>1e-4&&e<.9999,f.position.set(0,w.lerp(.4,2.04,e),.15),f.rotation.x=-.08*e},dispose(){a=!0,p.geometry.dispose(),d.dispose(),u.dispose(),c.dispose(),f.clear()}}}function qe(t){let i=t.querySelector(`.ice-scene`),o=t.dataset.geometryTrial,s=i.clientWidth>=900&&i.clientWidth/i.clientHeight>=1.25&&!r.lowPower,c=t.querySelector(`#ice-vault-canvas`),u=t.querySelector(`#ice-vault-action`),h=new AbortController,g=h.signal,v=matchMedia(`(prefers-reduced-motion: reduce)`),b=matchMedia(`(max-width:767px), (pointer:coarse)`),x=navigator.connection,S=!1,C=!0,T=!1,E=1,k=1,A,j=-1/0,M=-1/0,F=0,I,L=!1,R=0,z=!1,V=0,oe=!1,H=!1,ce=!1,U=!1,le=``,ue,de=!1,me=!1,ge=()=>{};new Promise(e=>{ge=e});let _e=0,ve=-1,ye=NaN,be=NaN,xe=``,Te=!1,Oe=0,W=null,ke=0,Ae=async()=>{let e=new Set,t=t=>{t instanceof ee&&t.image&&!t.isRenderTargetTexture&&!(t instanceof B)&&e.add(t)};t(G.background),t(et),t($e),J?.startupTextures.forEach(t),G.traverse(e=>{if(e instanceof l)for(let n of Array.isArray(e.material)?e.material:[e.material])Object.values(n).forEach(t),`uniforms`in n&&Object.values(n.uniforms).forEach(e=>t(e.value))});let n=[];for(let t of e){let e=t.image;e?.decode&&n.push(e.decode().catch(()=>{}))}if(await Promise.all(n),!(S||T||!q)){for(let t of e)q.engine.initTexture(t);S||T||(i.dataset.uploadsReady=`true`,$())}},je,Me=new Set,Pe=()=>{Me.forEach(e=>{e.traverse(e=>{e instanceof l&&(e.geometry.dispose(),(Array.isArray(e.material)?e.material:[e.material]).forEach(e=>e.dispose()))}),e.clear()}),Me.clear(),je?.dispose(),je=void 0},Fe={collect:+(t.dataset.phase===`ready`)},Ie=Number(t.dataset.progress)||0,Le={phase:t.dataset.phase||`waiting`,progress:Number(t.dataset.progress)||0,remaining:Number(t.dataset.remaining)||30,keyVisible:!1,canAct:!1},G=new f;G.background=new P(getComputedStyle(t).getPropertyValue(`--melt-floor`).trim()||`#ffffff`);let K=new d(40,1,.1,500),ze=new N(0,3.1,0),Be=new N(-8.004,.8,12.093);K.position.copy(ze).add(Be),K.lookAt(ze);let q,J,Y,qe,Je,Ye,Xe,Ze,Qe,X,Z,$e,et,tt=!1,nt=!1,Q,rt,it,at,ot,st,ct=()=>!(nt&&!tt||!Q?.image||!Z?.root.userData.posterReady&&!Z?.root.userData.videoReady),lt=()=>{if(i.dataset.chestLid=String(Ye?.lid??0),i.dataset.chestCard=String(Ye?.card??0),i.dataset.keyInsertion=String(Ye?.insertion??0),i.dataset.keyTurn=String(Ye?.turn??0),Ye||(delete i.dataset.keyTip,delete i.dataset.keySocket,delete i.dataset.keyAxisError),J&&(i.dataset.keyWorld=J.key.getWorldPosition(new N).toArray().join(`,`)),i.dataset.collectProgress=Fe.collect.toFixed(4),Ye&&(i.dataset.chestLid=Ye.lid.toFixed(4),i.dataset.chestCard=Ye.card.toFixed(4),i.dataset.keyInsertion=Ye.insertion.toFixed(4),i.dataset.keyTurn=Ye.turn.toFixed(4),i.dataset.keyTip=Ye.keyTip.join(`,`),i.dataset.keySocket=Ye.socket.join(`,`),i.dataset.keyAxisError=String(Ye.axisError)),i.dataset.chestReady=String(!!Y),i.dataset.chestMaterialReady=String(Y?.root.userData.materialReady??!1),i.dataset.chestMaterialError=String(Y?.root.userData.materialError??!1),i.dataset.collecting=String(L),i.dataset.cameraPose=[...K.position.toArray(),...K.quaternion.toArray()].map(e=>e.toFixed(6)).join(`,`),i.dataset.renderCount=String(F),i.dataset.ambientTime=R.toFixed(3),i.dataset.aurora=X?.state??`still`,i.dataset.auroraLook=`upper-local-v9`,i.dataset.auroraTexture=X?.textureVariant??`loading`,i.dataset.auroraGround=`off`,i.dataset.fire=Z?.root.userData.playing?`burning`:`still`,i.dataset.fireReady=String(Z?.root.userData.videoReady??!1),i.dataset.auroraReady=String(X?.ready??!1),i.dataset.fireVideoTime=String(Z?.video.currentTime??0),i.dataset.fireVideoDuration=String(Z?.video.duration??0),i.dataset.fireResolution=Z?[Z.video.videoWidth,Z.video.videoHeight].join(`x`):``,i.dataset.detailQuality=s?`enhanced`:`baseline`,i.dataset.auroraVideoTime=String(X?.time??0),i.dataset.meltProgress=Le.progress.toFixed(3),J){i.dataset.materialStudy=String(J.root.userData.materialStudy),i.dataset.materialReady=String(J.root.userData.materialReady);let e=J.root.userData.meltwater;i.dataset.waterArea=String(e?.area??0),i.dataset.waterVolume=String(e?.visualVolume??0),i.dataset.waterHeight=String(e?.filmHeight??0),i.dataset.waterTint=String(e?.tint??``),i.dataset.waterWetness=String(e?.wetness??0),i.dataset.waterRunoff=String(e?.runoffVisible??!1);let t=J.root.userData.meltVisual;i.dataset.iceTint=String(t?.iceTint??``),i.dataset.keyReveal=String(t?.keyReveal??0),i.dataset.glowAlpha=String(t?.glowAlpha??0),i.dataset.iceScale=String(t?.iceScale??0),i.dataset.iceOpacity=String(t?.iceOpacity??0)}q&&(i.dataset.triangles=String(q.engine.info.render.triangles),i.dataset.drawCalls=String(q.engine.info.render.calls))},ut=(e=`idle`)=>{X?.setActive(!1),Z?.pause(),A?.(),A=void 0,i.dataset.renderState=e,lt()},dt=()=>{S||T||(T=!0,z=!1,L=!1,I?.kill(),ut(`fallback`),c.hidden=!0,t.dataset.effectsPresented=`false`,t.dataset.stageFallback=`true`,t.dataset.meltStage=`fallback`,t.dataset.scenePresented=`false`,cancelAnimationFrame(V),t.dispatchEvent(new CustomEvent(`melt-key-fallback`)))},ft=()=>{if(!J||Le.phase!==`available`||T)return;J.root.updateMatrixWorld(!0),K.updateMatrixWorld(!0);let e=new se().setFromObject(J.key),t=1/0,n=1/0,r=-1/0,i=-1/0;for(let a of[e.min.x,e.max.x])for(let o of[e.min.y,e.max.y])for(let s of[e.min.z,e.max.z]){let e=new N(a,o,s).project(K),c=(e.x*.5+.5)*E,l=(-e.y*.5+.5)*k;t=Math.min(t,c),r=Math.max(r,c),n=Math.min(n,l),i=Math.max(i,l)}let a=Math.max(44,r-t+24),o=Math.max(44,i-n+24);Object.assign(u.style,{left:`${Math.max(0,Math.min(E-a,(t+r-a)/2))}px`,top:`${Math.max(0,Math.min(k-o,(n+i-o)/2))}px`,width:`${Math.min(E,a)}px`,height:`${Math.min(k,o)}px`,borderRadius:`24px`})},pt=new N,mt=-1/0,ht=-1/0,gt=16,_t=96,vt=!0,yt=()=>{if(!qe||Le.phase!==`ready`||Fe.collect>=1&&!L&&!vt)return;vt=!1,qe.root.getWorldPosition(pt),pt.project(K);let e=i.getBoundingClientRect();i.dataset.cardOrigin=`${(e.left+(pt.x*.5+.5)*E).toFixed(1)},${(e.top+(-pt.y*.5+.5)*k).toFixed(1)}`;let t=Math.min(E<700?280:320,E-32),n=w.clamp((pt.x*.5+.5)*E,Math.min(E-t/2-16,gt+t/2),E-t/2-16),r=w.clamp((-pt.y*.5+.5)*k-18,_t,k-100);(Math.abs(n-mt)>.5||Math.abs(r-ht)>.5)&&(i.style.setProperty(`--loot-x`,`${n.toFixed(1)}px`),i.style.setProperty(`--loot-y`,`${r.toFixed(1)}px`),i.dataset.lootAnchor=`${n.toFixed(1)},${r.toFixed(1)}`,mt=n,ht=r)},bt=e=>{z?ut(e):(ue?.render(R,C,!v.matches),C||ut(e))},xt=()=>{if(S||T||!C&&oe||document.hidden||!q)return;if(!J||!H){bt(`effects-first`);return}if(!z&&W){let e=q.engine.getContext(),t=e.clientWaitSync(W,0,0);e.deleteSync(W),W=null,t===e.WAIT_FAILED?i.dataset.gpuWarmup=`frame-fallback`:(Oe++,i.dataset.gpuWarmup=`fence-complete`)}let e=v.matches&&Le.phase===`waiting`?Ie:Le.progress;K.updateMatrixWorld(),X?.setCamera(K);let n=w.smoothstep(Fe.collect,.46,.72);if((e!==ye||Fe.collect!==be||Le.phase!==xe||_e!==ve)&&(vt=!0,J.update(e,n),Y&&qe&&Je&&(Le.phase===`ready`?(Ye=Je.apply(Fe.collect),Y.update(Ye.lid),qe.update(Ye.card)):(Y.update(0),qe.update(0),Ye=void 0)),ye=e,be=Fe.collect,xe=Le.phase,ve=_e,Qe&&(Qe.shadow.needsUpdate=!0)),at?.update(e,n,R),Z?.setMotion(!v.matches),!ct()){bt(`loading`);return}Te||(Te=!0,Ae().catch(dt));let r=String(!!Z?.root.userData.videoReady)+`:`+String(v.matches)+`:`+(Le.phase===`ready`?`open`:`ice`);if(!z&&le!==r&&(le=r,Oe=0,W&&=(q.engine.getContext().deleteSync(W),null)),ce=!0,!ce){if(!U){U=!0;let e=r;q.engine.toneMapping=q.toneMapping,q.engine.toneMappingExposure=q.toneMappingExposure,q.engine.outputColorSpace=q.outputColorSpace;let t=q.engine,n=new pe,i=new pe,a=new Set;G.traverse(e=>{if(!(e instanceof l)||e===J.floor||(e===J.ice||e.name===`surface-hoar`)&&!e.visible)return;let t=Array.isArray(e.material)?e.material[0]:e.material;a.has(t)||(a.add(t),i.add(e.clone(!1))),e!==J.ice&&e.name!==`surface-hoar`&&(e.name===`user-original-aurora`||e.name===`snow-terrain`||at&&e.parent===at.root)&&n.add(e.clone(!1))}),(async()=>{let e=Promise.resolve();if(Xe&&J.ice.visible){let r=t.getRenderTarget(),i=t.getActiveCubeFace(),a=t.getActiveMipmapLevel(),o=t.toneMapping;try{t.setRenderTarget(Xe),t.toneMapping=0,e=t.compileAsync(n,K,G)}finally{t.setRenderTarget(r,i,a),t.toneMapping=o}}let r=t.compileAsync(i,K,G);await Promise.all([e,r])})().then(()=>{U=!1,!(S||T)&&(ce=e===String(!!Z?.root.userData.videoReady)+`:`+String(v.matches)+`:`+(Le.phase===`ready`?`open`:`ice`),$())}).catch(()=>dt())}bt(`compiling`)}else{if(X?.setActive(C&&!v.matches),X?.update(R),Z?.setMotion(!v.matches),Z?.update(R,K,C&&!v.matches),Z){let e=E<700&&Y?Math.max(1,Y.root.scale.x):1;Z.light.distance=14*e;let t=1+.18*Math.sin(R*6.7)+.12*Math.cos(R*11.3)+.06*Math.sin(R*23.1);Z.light.intensity=(E<700?5:s?9:14)*e*e*t}q.render(G,K),F++,!z&&Q?.image&&J&&(z=!0,t.dataset.scenePresented=`true`,t.dataset.meltStage=`ready`,t.dataset.effectsPresented=`true`,t.dispatchEvent(new CustomEvent(`melt-key-ready`)),v.matches||Z?.loadVideo()),C?(z&&!v.matches&&Z?.loadVideo(),ft(),yt()):(oe=!0,i.dataset.prewarmed=`true`,X?.setActive(!1),Z?.pause(),i.dataset.renderState=`prewarmed`,lt())}},St=e=>{if(S||T||!C||document.hidden){ut(`paused`);return}let t=r.getFrameInterval();e-j+1e-5<t||((z||me)&&!v.matches&&Number.isFinite(j)&&(R+=Math.min(e-j,.1)),j=e,xt(),e-M>.25&&(lt(),M=e),v.matches&&!L&&z&&ut())},Ct=()=>{S||T||!C||document.hidden||A||(i.dataset.renderState=`active`,j=-1/0,A=e(St))},$=()=>{S||T||ke||(ke=requestAnimationFrame(()=>{ke=0,!(S||T)&&(xt(),Ct())}))},wt=e=>{let t=`/assets/realistic-winter/winter-camp-${e?`portrait-v5`:`landscape-v3`}.webp`,n=new te().load(t,e=>{S?e.dispose():(i.dataset.background=`photographic-winter`,Tt())},void 0,dt);return n.colorSpace=D,n},Tt=()=>{if(S||T||!q)return;z||(Oe=0,W&&=(q.engine.getContext().deleteSync(W),null)),_e++,cancelAnimationFrame(V),V=0;let e=i.getBoundingClientRect();E=Math.max(1,e.width),k=Math.max(1,e.height);let n=t.querySelector(`.ice-copy`)?.getBoundingClientRect();gt=n&&E>=900?Math.max(16,n.right-e.left+16):16,_t=n&&E>=700&&E<900?Math.min(k-100,n.bottom-e.top+100):96;let o=r.getDPR();q.setPixelRatio(o),q.setSize(E,k),q.engine.transmissionResolutionScale=r.lowPower?.5:1,i.dataset.transmissionScale=String(q.engine.transmissionResolutionScale),i.dataset.qualityDpr=String(o),i.dataset.qualityTier=r.lowPower?`mobile`:`desktop`;let c=E/k<1.25,l=E<900||c||matchMedia(`(pointer:coarse) and (max-width:1366px)`).matches,u=l&&!c&&E>=900,d=E<700;J?.setNaturalClarity(d),nt=l,d?tt=!0:nt&&!et&&(et=new te().load(`/assets/quality-v3/snow-restored.webp`,e=>{S?e.dispose():(tt=!0,Se(e,nt,E<700),i.dataset.phoneSnow=nt?`laptop-plate`:`inactive`,$())},void 0,()=>{S||(tt=!0,i.dataset.phoneSnow=`unavailable`,$())}),et.colorSpace=D),Se(et,nt,d),i.dataset.phoneSnow=nt&&et?.image?`laptop-plate`:`inactive`,X&&(X.lighting.uAuroraGroundStrength.value=0),i.dataset.auroraGround=`off`,i.dataset.campFraming=l?`close`:`laptop`,c&&!it&&(it=wt(!0)),!c&&!rt&&(rt=wt(!1));let f=c?it:rt;if(f&&f!==Q&&(Q=f,G.background=Q,at?.setBackground(Q)),Q?.image){let e=Q.image,t=e.width/e.height,n=E/k,r=E>=900&&!c,i=c?0:r?.12:.05;if(Q.repeat.set(Math.min(1,n/t)*(1-i),Math.min(1,t/n)*(1-i)),Q.offset.set((1-Q.repeat.x)/2-i/2,(1-Q.repeat.y)/2),Q.userData.closeCamp=r,Q.userData.highDetail=s&&!c,Q.userData.integratedPhone=d,l){let e=d||c?.51:.7,t=d?.88:c?.82:u?.86:.79,n=e*Q.repeat.x+Q.offset.x,r=1-((1-t)*Q.repeat.y+Q.offset.y),i=d?2.4:u?1.65:2;Q.userData.compactPit={x:n,y:r,zoom:i},Ce(n,r,i,c)}else delete Q.userData.compactPit,Ce();Q.updateMatrix(),X?.setCrop(Q,c),Z?.setComposition(Q,c)}!z||Q?.image&&X?.ready||(Oe=0,W&&=(q.engine.getContext().deleteSync(W),null),Te=!1,z=!1,t.dataset.scenePresented=`false`,t.dataset.meltStage=`loading`,document.dispatchEvent(new CustomEvent(`melt-key-poster-state`,{detail:Le.phase}))),K.aspect=E/k;let h=Math.max(1,1.5/K.aspect),g=ze.clone();!c&&E>=900?g.addScaledVector(new N(.834,0,.552),-2.6):!c&&E>=700&&g.addScaledVector(new N(.834,0,.552),-.8);let _=Be.clone();if(c&&(g.y=4.2,_.y=-.8),K.position.copy(g).addScaledVector(_,h),K.lookAt(g),K.updateProjectionMatrix(),K.updateMatrixWorld(),J&&Y&&ot&&(J.root.position.copy(ot.icePosition),J.root.scale.setScalar(ot.iceScale),Y.root.position.copy(ot.chestPosition),Y.root.scale.setScalar(ot.chestScale),Y.root.rotation.y=-.18,J.root.rotation.y=d?.1:-.24,l)){let e=(e,t,n,r,i,o)=>{let s=new p;s.setFromCamera(new a(t*2-1,1-n*2),K);let c=s.ray.intersectPlane(new m(new N(0,1,0),.01),new N);if(c){e.position.copy(c),e.scale.setScalar(1);for(let t=0;t<2;t++){e.updateMatrixWorld(!0);let t=1/0,n=-1/0;for(let r of[-i,i])for(let i of[-o,o]){let a=new N(r,0,i).applyMatrix4(e.matrixWorld).project(K);t=Math.min(t,a.x),n=Math.max(n,a.x)}e.scale.multiplyScalar(r*2/Math.max(.001,n-t))}}};e(Y.root,d?.185:c?.2:.5,d?.83:c?.81:u?.78:.8,d?.35:c?.26:u?.19:.27,1.65,.95),e(J.root,d?.83:c?.82:u?.88:.86,d?.83:c?.81:u?.78:.8,d?.28:c?.22:u?.15:.22,1,1)}if(J&&Y&&ot){let e=(e,t,n,r,a)=>{let o=i.querySelector(e);if(!o)return;t.updateWorldMatrix(!0,!1);let s=1/0,c=-1/0,l=1/0,u=-1/0;for(let e of[-n,n])for(let n of[0,a])for(let i of[-r,r]){let r=new N(e,n,i).applyMatrix4(t.matrixWorld).project(K),a=(r.x*.5+.5)*E,o=(-r.y*.5+.5)*k;s=Math.min(s,a),c=Math.max(c,a),l=Math.min(l,o),u=Math.max(u,o)}Object.assign(o.style,{left:`${s}px`,top:`${l}px`,width:`${c-s}px`,height:`${u-l}px`,transform:`none`})};e(`.winter-skeleton-chest`,Y.root,1.65,.95,1.25),e(`.winter-skeleton-ice`,J.root,1,1,2)}if(Z&&Q?.image){if(c){let e=d?.878:.818,t=new p;t.setFromCamera(new a(1.016-1,1-e*2),K);let n=t.ray.intersectPlane(new m(new N(0,1,0),-.025),new N);if(n){Z.root.position.copy(n),Z.mesh.position.y=.2;let e=n.clone().project(K),t=n.clone().add(new N(0,1,0)).project(K),r=(d?.138:.145)*2/Math.abs(t.y-e.y);Z.root.scale.setScalar(r),Z.setExposure(1.4)}}else{Z.mesh.position.y=.32;let e=De(!1,E>=900&&!c,Q.userData.compactPit),t=(1-(e.y+(e.originalBaseY-e.canonicalY)*e.scale)-Q.offset.y)/Q.repeat.y*2-1,n=(e.x-Q.offset.x)/Q.repeat.x*2-1,r=new p;r.setFromCamera(new a(n,t),K);let i=r.ray.intersectPlane(new m(new N(0,1,0),-.025),new N);if(i){Z.root.position.copy(i);let t=i.clone().project(K),n=i.clone().add(new N(0,1,0)).project(K),r=e.originalHeight*e.scale/Q.repeat.y*2/Math.abs(n.y-t.y);Z.root.scale.setScalar(r*1.12),Z.setExposure(1.3)}}}if(Qe&&Y&&J){let e=d?Math.max(1,Y.root.scale.x,J.root.scale.x):1,t=d?Y.root.position.clone().add(J.root.position).multiplyScalar(.5):new N;Qe.target.position.copy(t),Qe.target.updateMatrixWorld(),Qe.position.copy(t).add(new N(-8,12,4).multiplyScalar(e));let n=Qe.shadow.camera,r=d?Math.max(3.5,Y.root.position.distanceTo(J.root.position)*.5+2):15;Object.assign(n,{left:-r,right:r,top:d?r:11,bottom:d?-r:-11,near:.1,far:45*e}),n.updateProjectionMatrix(),Qe.shadow.normalBias=.008*e,Qe.shadow.needsUpdate=!0}$();let v=e=>{if(!e)return null;let t=e.getWorldPosition(new N).project(K);return[+(t.x*.5+.5).toFixed(5),+(-t.y*.5+.5).toFixed(5)]};i.dataset.layoutAnchors=JSON.stringify({ice:v(J?.root),fire:v(Z?.root),chest:v(Y?.root)})};t.addEventListener(`melt-key-state`,e=>{let r=e.detail;if(!r||S)return;let i=Le.phase,a=Le.progress;Le=r,v.matches&&r.phase===`waiting`&&(i!==`waiting`||r.progress<a)&&(Ie=r.progress),r.phase===`ready`&&i!==`ready`?(I?.kill(),J?.update(1,0),Je?.begin(),L=!v.matches&&z,t.dataset.unlocking=String(L),L?I=n.to(Fe,{collect:1,duration:4.4,ease:`none`,onUpdate:Ct,onComplete:()=>{L=!1,I=void 0,t.dataset.unlocking=`false`,$(),lt(),t.dispatchEvent(new CustomEvent(`melt-key-reveal-complete`))}}):(Fe.collect=1,t.dispatchEvent(new CustomEvent(`melt-key-reveal-complete`)))):r.phase!==`ready`&&i===`ready`&&(cancelAnimationFrame(V),V=0,z=!1,ce=!1,Oe=0,le=``,W&&q&&q.engine.getContext().deleteSync(W),W=null,t.dataset.scenePresented=`false`,t.dataset.meltStage=`loading`,document.dispatchEvent(new CustomEvent(`melt-key-poster-state`,{detail:r.phase})),L=!1,I?.kill(),I=void 0,Fe.collect=0,Je?.reset(),t.dataset.unlocking=`false`,Ye=void 0),i===r.phase?r.phase===`waiting`&&!v.matches&&Ct():$()},{signal:g}),c.addEventListener(`webglcontextlost`,e=>{e.preventDefault(),dt()},{signal:g}),document.addEventListener(`visibilitychange`,()=>{document.hidden?(I?.pause(),ut(`paused`)):(C&&I?.resume(),$())},{signal:g}),window.addEventListener(`pageshow`,$,{signal:g}),window.addEventListener(`resize`,Tt,{passive:!0,signal:g}),b.addEventListener(`change`,Tt,{signal:g}),x?.addEventListener(`change`,Tt,{signal:g}),v.addEventListener(`change`,()=>{v.matches&&(Ie=Le.progress,L=!1,I?.kill(),I=void 0,Le.phase===`ready`&&(Fe.collect=1,t.dataset.unlocking=`false`,t.dispatchEvent(new CustomEvent(`melt-key-reveal-complete`)))),$()},{signal:g});let Et=new ResizeObserver(Tt);Et.observe(i);let Dt=new IntersectionObserver(([e])=>{C=e.isIntersecting,C?(document.hidden||I?.resume(),$()):(I?.pause(),ut(`paused`))},{threshold:.01});return Dt.observe(i),(async()=>{try{$e=new te().load(`/assets/quality-v3/camp-detail.webp`,e=>{S?e.dispose():(e.colorSpace=D,we(e),$())}),$e.colorSpace=D,$e.anisotropy=8,q=new he(c,{antialias:!0}),q.toneMapping=4,q.toneMappingExposure=.95,G.background=new P(463649);let e=i.clientWidth/i.clientHeight<1.25;e?it=wt(!0):rt=wt(!1),Q=e?it:rt,G.background=Q,X=Ue({lowPower:r.lowPower,maxTextureSize:q.engine.capabilities.maxTextureSize,onReady:$,onError:dt,intensity:.62}),G.add(X.root),X.lighting.uAuroraGroundStrength.value=0,Z=We({deferVideo:!0,poster:`/assets/quality-v1/fire-hd-poster.webp`,onReady:()=>{oe=!1,$()},onError:()=>{Z?.root.userData.posterError&&Z?.root.userData.videoError&&dt()}}),G.add(Z.root),st={enabled:q.engine.shadowMap.enabled,type:q.engine.shadowMap.type},q.engine.shadowMap.enabled=!0,q.engine.shadowMap.type=1;let n=new ne(7904196,1977664,.35);G.add(n);let a=new re(10927584,.55);a.position.set(-8,12,4),a.castShadow=!0,Qe=a,G.add(a.target),a.shadow.autoUpdate=!1,a.shadow.needsUpdate=!0,a.shadow.mapSize.set(r.lowPower?512:1024,r.lowPower?512:1024),Object.assign(a.shadow.camera,{left:-15,right:15,top:11,bottom:-11,near:.1,far:45}),a.shadow.radius=r.lowPower?2.25:4.5,a.shadow.bias=-15e-5,a.shadow.normalBias=.008,G.add(a);let s=new re(7903422,.26);s.position.set(4,2.8,1.5),G.add(s);let u=new re(7445451,.32);if(u.position.set(1,4,-3),G.add(u),Tt(),$(),X.lighting.uAuroraGroundStrength.value=0,i.dataset.auroraDiffuse=`off`,de=!0,ue=Ee({surface:q,scene:G,camera:K,sky:X,fire:Z,background:()=>Q,ready:()=>de&&(!nt||tt),hidden:()=>[J?.root,Y?.root,at?.root],irradiance:()=>{},onReady:$,onError:dt,onFirst:e=>{me=!0,t.dataset.effectsPresented=`true`,i.dataset.effectsFirstFrameAt=String(performance.now()),i.dataset.effectsGpuWarmup=e,ge(),$()}}),$(),await new Promise(e=>requestAnimationFrame(()=>requestAnimationFrame(()=>e()))),S||T||(await Ne(32),S||T))return;J=Re(32,3,$,dt,{highDetail:!1,naturalClarity:i.clientWidth<700,compactGeometry:!0}),G.add(J.root);let d=new N(.834,0,.552),p=new N(-.552,0,.834),m=i.clientWidth>=900&&i.clientWidth/i.clientHeight>=1.25;J.root.position.copy(d).multiplyScalar(m?-2.6+.58*Math.tan(w.degToRad(20))*(14.5*Math.max(1,1.5/(i.clientWidth/i.clientHeight))-1.2)*(i.clientWidth/i.clientHeight):4.9).addScaledVector(p,m?1.2:-5.2),J.root.scale.setScalar(m?.7:1.2),J.root.rotation.y=-.24,J.root.position.y=-.01;let h=J.floor.material.onBeforeCompile;if(J.floor.material.onBeforeCompile=(e,t)=>{h(e,t),e.fragmentShader=e.fragmentShader.replace(`return .94*(1.-.12*pow`,`return .7332*(1.-.12*pow`).replace(`vec2 iceCenter(){return vec2(0.);}`,`vec2 iceCenter(){return vec2(${J.root.position.x.toFixed(6)},${J.root.position.z.toFixed(6)});}`).replace(`.44+.56*contact`,`.44+.56*max(contact,1.-smoothstep(1.4,2.2,length(vShadowFloor-vec2(${Y.root.position.x.toFixed(6)},${Y.root.position.z.toFixed(6)}))))`)},J.floor.visible=!1,J.floor.material.customProgramCacheKey=()=>`snowy-chest-layout-contact-v2`,Y=Ve({highDetail:!1,lowPower:!0,compactGeometry:!1,onReady:$,onError:dt}),Y.root.position.copy(d).multiplyScalar(m?-3.45:-1.8).addScaledVector(p,m?.8:-5.2),Y.root.position.y=-.01,Y.root.rotation.y=-.18,Y.root.scale.setScalar(m?.9:1.08),G.add(Y.root),o){let e=0,n=0;for(let t of[Y.root,J.key])t.traverse(t=>{if(!(t instanceof l))return;let r=t.geometry.getAttribute(`position`).count;n+=r,e+=(t.geometry.index?.count??r)/3*(t instanceof fe?t.count:1)});t.dataset.trialPropTriangles=String(e),t.dataset.trialPropVertices=String(n)}if(S||T)return;ot={icePosition:J.root.position.clone(),iceScale:J.root.scale.x,chestPosition:Y.root.position.clone(),chestScale:Y.root.scale.x},at=He(Q,Y.root,J.root,Z.root,X.lighting,void 0),G.add(at.root),qe=Ke(r.lowPower),Y.root.add(qe.root),Je=Ge(J.key,Y.keySocket),Le.phase===`ready`&&(J.update(1,0),Je.begin());let g=je=new ie(q.engine),v=new f;Me.add(v),v.background=new P(.035,.065,.1);for(let[e,t,n,r,i]of[[-4,4,5.5,3,1.1],[4,5,-3,2.8,.6],[-4,2.8,-5,2.4,.8]]){let a=new l(new O(r,24,16),new y({color:new P(1,.98,.95).multiplyScalar(i),toneMapped:!1}));a.position.set(e,t,n),v.add(a)}let b=new l(new _(3.5,4.5),new y({color:new P(1,.97,.88).multiplyScalar(.75),side:2,toneMapped:!1}));b.position.set(3.8,2.8,5.5),b.lookAt(0,1,0),v.add(b);let x=new l(new _(5,3),new y({color:new P(1,.87,.68).multiplyScalar(.9),side:2,toneMapped:!1}));if(x.position.set(-4,-1.8,6),x.lookAt(0,.7,0),v.add(x),S||T)return;Xe=Ze=g.fromScene(v,.055),G.environment=Xe.texture,Y.root.traverse(e=>{if(e instanceof l)for(let t of Array.isArray(e.material)?e.material:[e.material])t instanceof ae&&(t.envMap=Xe.texture,t.envMapIntensity=t.metalness>.5?.75:.45)}),Pe(),H=!0,i.dataset.composition=`chest-left-fire-front-ice-right-v2`,i.dataset.chest=`walnut`,i.dataset.camera=`perspective-fixed`,i.dataset.viewAngle=`0`,i.dataset.renderer=`three-webgl`,Tt(),$()}catch(e){dt(),console.warn(`Melt key visual unavailable; native controls remain usable.`,e)}finally{Pe()}})(),()=>{S||(S=!0,Pe(),cancelAnimationFrame(V),cancelAnimationFrame(0),cancelAnimationFrame(ke),W&&q&&q.engine.getContext().deleteSync(W),W=null,L=!1,I?.kill(),ut(),h.abort(),Et.disconnect(),Dt.disconnect(),ue?.dispose(),Se(),et?.dispose(),Ce(),we(),$e?.dispose(),at?.dispose(),X?.dispose(),Z?.dispose(),rt?.dispose(),it?.dispose(),qe?.dispose(),Y?.dispose(),J?.dispose(),G.traverse(e=>{e instanceof re&&e.shadow.dispose()}),G.environment=null,Xe?.dispose(),Ze?.dispose(),q&&st&&(q.engine.shadowMap.enabled=st.enabled,q.engine.shadowMap.type=st.type),q?.dispose(),G.clear())}}var Je=ve,Ye=`snowy:free-key:melt:v1`,Xe=/^SNOWY-FREE-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}-\d{4}$/,Ze=e=>typeof e==`number`&&Number.isSafeInteger(e)&&e>=0&&e<=864e13,Qe=(e,t)=>e.version===1&&Ze(t)&&Ze(e.startedAt)&&e.startedAt<=t,X=(e,t)=>Qe(e,t)&&e.key===null&&e.unlockedAt===null,Z=(e,t)=>Qe(e,t)&&!e.pending&&typeof e.key==`string`&&Xe.test(e.key)&&Ze(e.unlockedAt)&&e.unlockedAt>=e.startedAt+Je&&e.unlockedAt<=t&&t-e.unlockedAt<864e5;function $e(e){if(!Ze(e))throw RangeError(`A valid timestamp is required to start the melt.`);return{version:1,startedAt:e,key:null,unlockedAt:null}}function et(e){return{...$e(e),pending:!0}}function tt(e,t){return e.pending?$e(t):e}function nt(e,t){let n=Z(e,t),r=!e.pending&&(n||X(e,t))?t-e.startedAt:0,i=Math.min(1,Math.max(0,r/Je)),a=n?`ready`:i===1?`available`:`waiting`;return{phase:a,remaining:Math.max(0,Math.ceil((Je-r)/1e3)),progress:i,keyVisible:a!==`waiting`,canAct:a===`available`}}function Q(e,t,n=be){if(e.pending||!X(e,t)||t-e.startedAt<Je)return e;let r=n();if(!Xe.test(r))throw Error(`The local pass generator returned an invalid pass.`);return{...e,key:r,unlockedAt:t}}function rt(e,t){return e.key!==null&&!Z(e,t)}function it(e,t,n=!1){let r=()=>n?et(t):$e(t);if(!Ze(t)||!e)return r();try{let n=JSON.parse(e);if(!n||typeof n!=`object`||Array.isArray(n))return r();let i=n;return i.pending!==void 0&&i.pending!==!0||i.pending&&(i.key!==null||i.unlockedAt!==null)||!X(i,t)&&!Z(i,t)?r():{version:1,startedAt:i.startedAt,key:i.key,unlockedAt:i.unlockedAt,...i.pending?{pending:!0}:{}}}catch{return r()}}var at=new URLSearchParams(location.search).get(`ice-study`),ot=at&&/^[1-4]$/.test(at)?`${Ye}:study:${at}`:Ye,st;function ct(){st?.(),st=void 0,new t,_e();let a=new i,o=new AbortController,{signal:s}=o,c=document.getElementById(`key-access`),l=new URLSearchParams(location.search).get(`geometry-trial`),u=l===`compact`?`Compact geometry`:`Current geometry`,d;(l===`baseline`||l===`compact`)&&(c.dataset.geometryTrial=l,delete c.dataset.trialSceneMs,d=document.createElement(`output`),d.className=`key-geometry-trial`,d.textContent=u+` · Loading live scene…`,c.append(d)),delete c.dataset.stageFallback,delete c.dataset.meltStage;let f=c.querySelector(`#ice-vault-canvas`);if(f){if(f.dataset.renderMode){let e=f.cloneNode(!1);delete e.dataset.renderMode,e.hidden=!1,f.replaceWith(e)}else f.hidden=!1}c.dataset.scenePresented=`false`,c.dataset.effectsPresented=`false`;let p=c.querySelector(`.ice-loading-note`);p&&(p.hidden=!0);let m=document.getElementById(`ice-vault-action`);m.setAttribute(`aria-label`,`Unlock the box with the key`);let h=document.getElementById(`reset-key-btn`);document.getElementById(`lootlabs-link`);let g=c.querySelector(`.loot-reward-surface`),_=document.getElementById(`key-result`),v=document.getElementById(`key-reward-slot`),y=c.querySelector(`.ice-scene`),b=()=>{if(c.dataset.stageFallback!==`true`)return;let e=y.getBoundingClientRect(),t=c.querySelector(`.ice-copy`).getBoundingClientRect(),n=Math.min(e.width<700?280:320,e.width-32),r=e.width>=900?Math.min(e.width-n/2-16,t.right-e.left+16+n/2):0,i=e.width>=700&&e.width<900?Math.min(e.height-100,t.bottom-e.top+100):0;y.style.setProperty(`--fallback-reward-min-x`,r+`px`),y.style.setProperty(`--fallback-reward-min-y`,i+`px`)};window.addEventListener(`resize`,b,{passive:!0,signal:s}),v.appendChild(_);let x=document.getElementById(`key-countdown`),S=document.getElementById(`key-clock-unit`),C=c.querySelector(`.ice-clock-label`),w=document.getElementById(`key-progress`),T=document.getElementById(`key-status-title`),E=document.getElementById(`key-status-description`),D=document.getElementById(`key-announcement`),ee=document.getElementById(`ice-gesture`),O=matchMedia(`(prefers-reduced-motion: reduce)`),te=null;try{te=sessionStorage.getItem(ot)}catch{}let k=it(te,Date.now(),!0),A,ne,j=!1,M=!0,N,P=!1,F=-1/0,re=-1/0,ie=-1,ae,I,L,R=e=>{D.textContent=e},z=()=>{try{sessionStorage.setItem(ot,JSON.stringify(k))}catch{}},B=()=>{A?.(),A=void 0},V=(e=nt(k,Date.now()))=>{c.dispatchEvent(new CustomEvent(`melt-key-state`,{detail:e}))},oe=e=>{let t=e.phase===`ready`?P?`…`:`✓`:String(e.remaining).padStart(2,`0`),n=e.phase===`ready`?P?``:`OPEN`:`SEC`,r=e.phase===`waiting`?`MELTING`:e.phase===`available`?`KEY READY`:P?`UNLOCKING`:`VAULT OPEN`;x.textContent!==t&&(x.textContent=t),S.textContent!==n&&(S.textContent=n),C.textContent!==r&&(C.textContent=r)},H=(e=nt(k,Date.now()))=>{let t=N;N=e.phase,c.dataset.phase=N,document.dispatchEvent(new CustomEvent(`melt-key-poster-state`,{detail:N})),c.dataset.remaining=String(e.remaining),c.dataset.progress=String(e.progress),c.dataset.canAct=String(e.canAct),m.hidden=!0,m.disabled=!0,c.dataset.rewardPending=String(P),_.hidden=h.hidden=N!==`ready`||P,w.hidden=N!==`waiting`,w.value=e.progress*30,oe(e),T.textContent=N===`waiting`?`1. Wait for the ice to melt.`:N===`available`?`2. Your key is ready.`:P?`Opening the box...`:`3. Your access is ready.`,E.textContent=N===`waiting`?`The key will open the box automatically when the ice melts.`:N===`available`?`The key will unlock the box automatically.`:P?`Your key is opening the vault. Your access card will arrive here.`:`Continue through LootLabs and follow the steps to get your free key.`,ee.textContent=N===`waiting`?`Watch the ice melt. The key opens your reward automatically.`:E.textContent,t!==N&&(ae?.kill(),c.dataset.phaseMotion=`idle`,n.set(g,{clearProps:`opacity,visibility,transform`}),_.inert=!1,N===`available`?R(`The key is free. The box will open automatically.`):N===`ready`&&R(P?`Opening your reward.`:`The LootLabs gateway is ready. Continue via FlowAuth to get your key.`)),V(e)},se=(e=!0)=>{if(!j&&P&&N===`ready`){if(P=!1,c.dataset.unlocking=`false`,H(),e&&!O.matches&&c.dataset.stageFallback!==`true`){ae?.kill(),c.dataset.phaseMotion=`active`;let e=_.getBoundingClientRect(),t=(y.dataset.cardOrigin??``).split(`,`).map(Number),r=t.length===2&&t.every(Number.isFinite);_.inert=!0,ae=n.timeline({onComplete:()=>{c.dataset.phaseMotion=`idle`,_.inert=!1}}).fromTo(g,{opacity:.2,transformOrigin:`50% 50%`,x:r?t[0]-e.left-e.width/2:0,y:r?t[1]-e.top-e.height/2:22,scale:r?.25:.86},{opacity:1,x:0,y:0,scale:1,duration:1.1,ease:`power3.inOut`,clearProps:`opacity,transform,transformOrigin`})}R(`Your box is open. Your LootLabs access card is in the panel.`)}};c.addEventListener(`melt-key-reveal-complete`,()=>se(),{signal:s});let ce=()=>{L&&clearTimeout(L);let e=()=>{if(j||!k.key||k.unlockedAt===null)return;let t=k.unlockedAt+ye-Date.now();t>0?L=setTimeout(e,t):(fe(),R(`Your previous key has expired. A new cube is melting.`))};k.key&&k.unlockedAt!==null&&(L=setTimeout(e,Math.max(0,k.unlockedAt+ye-Date.now())))},U=(e=0)=>{if(j)return;if(rt(k,Date.now())){fe(),R(`Your previous key has expired. A new cube is melting.`);return}let t=nt(k,Date.now());t.phase===`available`&&M&&!document.hidden&&pe()?me():(t.phase!==N&&(H(t),t.phase!==`waiting`&&B()),oe(t),t.remaining!==ie&&(ie=t.remaining,c.dataset.remaining=String(t.remaining),t.phase===`waiting`&&t.remaining>0&&t.remaining%10==0&&R(`${t.remaining} seconds until your key is free.`)),(e===0||e-re>=.1||t.progress===1)&&(w.value=t.progress*30,c.dataset.progress=String(t.progress),re=e),V(t))},le=()=>{k.pending||A||document.hidden||!M||nt(k,Date.now()).phase!==`waiting`||(F=-1/0,A=e(e=>{let t=O.matches?.25:r.getFrameInterval();e-F+1e-4<t||(F=e,U(e))}))},ue=()=>{if(I&&clearTimeout(I),k.pending)return;let e=()=>{if(j||k.key)return;let t=k.startedAt+Je-Date.now();t>0?I=setTimeout(e,Math.max(1,t)):U()};nt(k,Date.now()).phase===`waiting`&&(I=setTimeout(e,Math.max(1,k.startedAt+Je-Date.now())))};function de(){!j&&k.pending&&!document.hidden&&M&&(k=tt(k,Date.now()),ie=-1,re=F=-1/0,z(),H(),U(),le(),ue())}function fe(){let e=document.activeElement===h;if(B(),I&&clearTimeout(I),L&&clearTimeout(L),ae?.kill(),P=!1,c.dataset.unlocking=`false`,k=et(Date.now()),ie=-1,re=F=-1/0,z(),H(),U(),le(),ue(),de(),R(`A fresh cube. Your 30-second melt has started.`),e){let e=document.getElementById(`ice-title`);e.setAttribute(`tabindex`,`-1`),e.focus({preventScroll:!0})}}function pe(){return!j&&!document.hidden&&M&&(c.dataset.scenePresented===`true`||c.dataset.stageFallback===`true`)}function me(){if(!pe())return;let e=Q(k,Date.now());e!==k&&(P=!O.matches&&c.dataset.meltStage===`ready`&&c.dataset.stageFallback!==`true`,k=e,z(),H(),B(),ce())}h.addEventListener(`click`,fe,{signal:s});let he=()=>{de(),U(),le(),ue(),ce()};document.addEventListener(`visibilitychange`,()=>{document.hidden?(B(),ae?.pause()):(M&&ae?.resume(),he())},{signal:s}),window.addEventListener(`pageshow`,he,{signal:s}),O.addEventListener(`change`,()=>{O.matches&&(ae?.kill(),c.dataset.phaseMotion=`idle`,n.set(g,{clearProps:`opacity,visibility,transform`}),_.inert=!1,se(!1)),U()},{signal:s});let ge=new IntersectionObserver(([e])=>{M=e.isIntersecting,M?(document.hidden||ae?.resume(),de(),U(),le()):(B(),ae?.pause())},{threshold:.01});ge.observe(c);let ve=document.getElementById(`key-menu-toggle`),be=document.getElementById(`key-sign-in`),xe=document.querySelector(`#key-sign-in-dialog`);be?.addEventListener(`click`,()=>xe?.showModal(),{signal:s});let Se=document.getElementById(`key-mobile-menu`),Ce=(e=!1)=>{Se&&ve&&(Se.hidden=!0,ve.setAttribute(`aria-expanded`,`false`),e&&ve.focus())};ve?.addEventListener(`click`,()=>{if(!Se)return;let e=Se.hidden;Se.hidden=!e,ve.setAttribute(`aria-expanded`,String(e))},{signal:s}),Se?.addEventListener(`click`,e=>{e.target.closest(`a`)&&Ce()},{signal:s}),document.addEventListener(`keydown`,e=>{e.key===`Escape`&&Se&&!Se.hidden&&Ce(!0)},{signal:s});let we=matchMedia(`(min-width:961px)`);we.addEventListener(`change`,()=>{we.matches&&Ce()},{signal:s});let Te=document.getElementById(`site-header`),Ee=({scroll:e})=>Te?.classList.toggle(`scrolled`,e>40);a.instance.on(`scroll`,Ee),Ee({scroll:window.scrollY});let De=()=>{if(j)return;c.dataset.stageFallback=`true`,c.dataset.meltStage=`fallback`,c.dataset.scenePresented=`false`,d&&!c.dataset.trialSceneMs&&(d.textContent=u+` · Live scene unavailable`),de(),b(),document.dispatchEvent(new CustomEvent(`melt-key-poster-state`,{detail:N}));let e=document.getElementById(`ice-vault-canvas`);e&&(e.hidden=!0),P?se(!1):V()};c.addEventListener(`melt-key-ready`,()=>{if(c.dataset.meltStage=`ready`,d&&!c.dataset.trialSceneMs){let e=Math.round(performance.now());c.dataset.trialSceneMs=String(e),d.textContent=u+` · Live scene `+(e/1e3).toFixed(1)+` s`}de(),U(),V()},{signal:s}),c.addEventListener(`melt-key-fallback`,De,{signal:s}),z(),H(),U(),le(),ue(),ce();let Oe=!1;(()=>{if(!(Oe||j||c.dataset.stageFallback===`true`)){Oe=!0;try{ne=qe(c),V()}catch{De()}}})(),st=()=>{j||(j=!0,ae?.kill(),B(),o.abort(),ge.disconnect(),ne?.(),d?.remove(),I&&clearTimeout(I),L&&clearTimeout(L),a.instance.off(`scroll`,Ee),a.destroy())},window.addEventListener(`pagehide`,e=>{e.persisted||st?.()},{signal:s})}var lt=new AbortController;document.readyState===`loading`?document.addEventListener(`DOMContentLoaded`,ct,{once:!0,signal:lt.signal}):ct();