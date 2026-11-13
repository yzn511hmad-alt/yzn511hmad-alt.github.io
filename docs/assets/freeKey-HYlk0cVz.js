import{n as e,t}from"./SnowyFooter-Dy0mc3AW.js";import{i as n}from"./vendor-gsap-bXzFIbWr.js";import{n as r,t as i}from"./Scroll-LFdG9vbQ.js";/* empty css                         */import{$ as a,A as o,B as s,C as c,D as l,E as u,F as d,G as f,H as p,I as m,J as h,K as g,L as _,N as v,O as y,P as b,Q as x,R as S,S as C,T as w,U as T,V as E,W as D,X as ee,Y as O,Z as te,_ as k,b as ne,c as re,d as A,et as j,f as M,g as N,h as ie,i as P,j as F,k as I,l as L,m as R,n as z,nt as ae,o as oe,p as se,q as ce,r as B,s as V,t as le,tt as H,u as ue,v as de,w as U,x as fe,y as pe,z as me}from"./vendor-three-OTvdFGlu.js";import{t as he}from"./SharedRenderer-DZgbWjuO.js";var ge=class{container=null;badge=null;panel=null;tbody=null;isOpen=!1;currentFilter=`all`;currentSort=`size`;fpsHistory=[];lastFrameTime=performance.now();updateTimer=null;cachedData=null;constructor(){this.init()}init(){let e=new URLSearchParams(location.search),t=e.has(`debug`)||e.has(`perf`)||e.has(`cold_test`)||localStorage.getItem(`snowy:debug`)===`1`;this.createBadge(),this.createPanel(),this.attachShortcuts(),this.startBackgroundMetrics(),t&&this.open()}collectMetrics(){let e=performance.getEntriesByType(`resource`),t=performance.getEntriesByType(`navigation`)[0],n=document.getElementById(`key-access`),r=n?parseInt(n.dataset.drawCalls||`0`,10):0,i=n?parseInt(n.dataset.triangles||`0`,10):0,a=parseFloat(document.documentElement.dataset.previewDecodedAt||`0`),o=n&&n.dataset.trialSceneMs?parseFloat(n.dataset.trialSceneMs):n&&n.dataset.scenePresented===`true`?performance.now():0,s=t?t.loadEventEnd:0,c={video:{kb:0,count:0},texture:{kb:0,count:0},script:{kb:0,count:0},font:{kb:0,count:0},css:{kb:0,count:0},document:{kb:0,count:0},other:{kb:0,count:0}},l=0,u=0,d=0,f=0;if(t){let e=(t.transferSize||28980)/1024,n=(t.decodedBodySize||28980)/1024;c.document.kb+=e,c.document.count+=1,l+=e,u+=n,d+=1,t.transferSize===0&&(f+=1)}let p=[];t&&p.push({name:location.pathname.split(`/`).pop()||`free-key.html`,url:location.href,type:`document`,transferKB:(t.transferSize||28980)/1024,decodedKB:(t.decodedBodySize||28980)/1024,durationMs:Math.round(t.duration),startTimeMs:0,isCached:t.transferSize===0});for(let t of e){let e=t.name,n=e.split(`/`).pop()?.split(`?`)[0]||e,r=t.initiatorType,i=`other`;/\.(mp4|webm|ogv)$/i.test(n)||r===`video`?i=`video`:/\.(webp|jpg|jpeg|png|gif|svg|hdr)$/i.test(n)||r===`img`?i=`texture`:/\.(js|mjs)$/i.test(n)||r===`script`?i=`script`:/\.(woff2|woff|ttf|otf)$/i.test(n)||r===`font`?i=`font`:(/\.css$/i.test(n)||r===`css`||r===`link`)&&(i=`css`);let a=t.transferSize===0&&t.decodedBodySize>0,o=(t.transferSize||t.encodedBodySize||0)/1024,s=(t.decodedBodySize||t.transferSize||0)/1024;c[i].kb+=o,c[i].count+=1,l+=o,u+=s,d+=1,a&&(f+=1),p.push({name:n,url:e,type:i,transferKB:o,decodedKB:s,durationMs:Math.round(t.duration),startTimeMs:Math.round(t.startTime),isCached:a})}let m=this.calculateFPS();return{totalTransferKB:l,totalDecodedKB:u,totalNetworkCalls:d,cachedCalls:f,gpuDrawCalls:r,gpuTriangles:i,fps:m,timeToPreviewMs:a,timeTo3DReadyMs:o,windowLoadMs:s,categories:c,assets:p}}calculateFPS(){let e=performance.now(),t=e-this.lastFrameTime;if(this.lastFrameTime=e,t>0){let e=Math.round(1e3/t);this.fpsHistory.push(e),this.fpsHistory.length>20&&this.fpsHistory.shift();let n=this.fpsHistory.reduce((e,t)=>e+t,0)/this.fpsHistory.length;return Math.min(60,Math.round(n))}return 60}createBadge(){this.badge=document.createElement(`button`),this.badge.id=`snowy-wifi-badge`,this.badge.setAttribute(`type`,`button`),this.badge.setAttribute(`aria-label`,`Toggle WiFi & WebGL Debugger`),this.badge.innerHTML=`
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
    `,document.head.appendChild(e)}};function _e(){return new ge}var ve=3e4,ye=864e5;function be(){let e=crypto.getRandomValues(new Uint8Array(8)),t=Array.from(e,e=>`ABCDEFGHJKLMNPQRSTUVWXYZ23456789`[e%32]).join(``);return`SNOWY-FREE-${t.slice(0,4)}-${t.slice(4)}-${new Date().getFullYear()}`}var xe={uCampDetail:{value:null},uHasCampDetail:{value:0},uCompactCamp:{value:new H},uPhoneSnow:{value:null},uHasPhoneSnow:{value:0},uPhoneSnowLayout:{value:0}};function Se(e,t=!1,n=t){xe.uPhoneSnow.value=e??null,xe.uHasPhoneSnow.value=e?.image&&t?1:0,xe.uPhoneSnowLayout.value=e?.image&&t&&n?1:0}function Ce(e=0,t=0,n=0,r=!1){xe.uCompactCamp.value.set(e,t,n,+!!r)}function we(e){xe.uCampDetail.value=e??null,xe.uHasCampDetail.value=+!!e}var Te=`uniform sampler2D uCampDetail;uniform float uHasCampDetail;uniform vec4 uCompactCamp;uniform sampler2D uPhoneSnow;uniform float uHasPhoneSnow;uniform float uPhoneSnowLayout;
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
}`;function Ee(e){let{surface:t,scene:n,camera:r,sky:i,fire:a}=e,o={value:new H},s={value:null},c={value:0},l=new f({transparent:!0,depthTest:!1,depthWrite:!1,toneMapped:!1,uniforms:{...xe,uPlate:s,uCrop:o,uClose:c},vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}`,fragmentShader:`${Te}\nuniform sampler2D uPlate;uniform vec4 uCrop;uniform float uClose;varying vec2 vUv;
 void main(){vec2 uv=vUv*uCrop.xy+uCrop.zw;float coverage=1.-smoothstep(.355,.405,uv.y);
 if(coverage<.001)discard;gl_FragColor=vec4(campPlateColor(uPlate,uv,uClose),coverage);
 #include <colorspace_fragment>
 }`}),d=new u(new m(2,2),l);d.name=`early-camp-ground`,d.frustumCulled=!1,d.renderOrder=-19,d.visible=!1,n.add(d);let p=!1,h=!1,g=``,_=!1,v=!1,y=!0,b=null,x=()=>String(a.mesh.material.map?.uuid)+`:`+String(y),S=async()=>{let o=x(),s=new Set,c=e=>{e instanceof ee&&e.image&&!e.isRenderTargetTexture&&!(e instanceof ae)&&s.add(e)};c(e.background()),Object.values(xe).forEach(e=>c(e.value)),Object.values(i.root.material.uniforms).forEach(e=>c(e.value)),c(a.mesh.material.map);let l=[];for(let e of s){let t=e.image;t?.decode&&l.push(t.decode().catch(()=>{}))}if(await Promise.all(l),p)return;for(let e of s)t.engine.initTexture(e);let f=new de;f.add(i.root.clone(!1),d.clone(!1)),a.root.traverse(e=>{e instanceof u&&f.add(e.clone(!1))}),t.engine.toneMapping=t.toneMapping,t.engine.toneMappingExposure=t.toneMappingExposure,t.engine.outputColorSpace=t.outputColorSpace,await t.engine.compileAsync(f,r,n),!p&&(g=o,h=!1,e.onReady())};return{ground:d,get ready(){return g===x()&&!!g},get started(){return _},render(l,u,f){if(y=f,a.setMotion(f),p||!e.ready()||!i.ready||!e.background()?.image||!(a.root.userData.posterReady||a.root.userData.videoReady))return!1;let m=t.engine.getContext();if(b){let t=m.clientWaitSync(b,0,0);if(t===m.TIMEOUT_EXPIRED)return!0;m.deleteSync(b),b=null,v||(v=!0,e.onFirst(t===m.WAIT_FAILED?`frame-fallback`:`fence-complete`))}if(g!==x())return h||(h=!0,S().catch(()=>{p||e.onError()})),!1;let C=e.background();s.value=C,o.value.set(C.repeat.x,C.repeat.y,C.offset.x,C.offset.y),c.value=+!!C.userData.closeCamp,i.setCamera(r),i.setActive(u&&f),i.update(l),a.setMotion(f),a.update(l,r,u&&f),e.irradiance();let w=e.hidden().filter(e=>!!e),T=w.map(e=>e.visible),E=[];n.traverse(e=>{e instanceof R&&(E.push([e.shadow,e.shadow.needsUpdate]),e.shadow.needsUpdate=!1)});try{w.forEach(e=>e.visible=!1),d.visible=!0,t.render(n,r),_=!0}finally{d.visible=!1,w.forEach((e,t)=>e.visible=T[t]),E.forEach(([e,t])=>e.needsUpdate=t)}return v||(v=!0,e.onFirst(`immediate`)),!0},dispose(){p=!0,cancelAnimationFrame(0),b&&t.engine.getContext().deleteSync(b),n.remove(d),d.geometry.dispose(),l.dispose()}}}function De(e,t=!1,n){if(n){let t=De(e);return{...t,x:n.x,y:n.y,scale:t.scale*n.zoom}}return t?{x:.577,y:.737,scale:.87,canonicalY:.75,originalBaseY:.798,originalHeight:.18}:e?{x:.563,y:.646,scale:.64,canonicalY:.664,originalBaseY:.69,originalHeight:.095}:{x:.6105,y:.681,scale:.58,canonicalY:.75,originalBaseY:.798,originalHeight:.18}}function Oe(e,t,n,r,i,o=!1){let s=o?i?32:48:i?40:64,c=(t,n,r,i=0,a=0,o=0)=>{let s=new u(n,r);return s.name=t,s.position.set(i,a,o),e.add(s),s},l=[[.255,-.03],[.25,0],[.255,.03],[.273,.052],[.315,.062],[.355,.057],[.385,.035],[.392,0],[.385,-.035],[.355,-.057],[.315,-.062],[.273,-.052],[.255,-.03]].reverse().map(([e,t])=>new a(e,t)),d=new fe(l,s);d.rotateX(Math.PI/2);let f=c(`key-ring`,d,r,0,1.89,0);for(let e of[-1,1])c(`ring-outer-bead`,new x(.385,.006,6,s),n,0,1.89,e*.037),c(`ring-inner-bead`,new x(.255,.005,6,s),n,0,1.89,e*.03);let p=c(`key-shaft`,new se(.056,.062,1.37,s,1),t,0,.842,0);c(`shaft-foot`,new O(.062,s,10),n,0,.157,0);let m=[[0,1.405],[.056,1.405],[.058,1.425],[.091,1.432],[.104,1.447],[.106,1.464],[.09,1.48],[.073,1.488],[.076,1.504],[.112,1.516],[.116,1.535],[.098,1.552],[.074,1.563],[.07,1.584],[.076,1.606],[0,1.606]].map(([e,t])=>new a(e,t)),h=c(`key-turned-neck`,new fe(m,s),t);for(let e of[1.45,1.532]){let t=new x(e===1.45?.1:.11,.009,6,s);t.rotateX(Math.PI/2),c(`neck-polished-bead`,t,n,0,e,0)}let g=new ce;return g.moveTo(.024,.2),g.lineTo(.255,.2),g.lineTo(.255,.305),g.lineTo(.132,.305),g.lineTo(.132,.393),g.lineTo(.255,.393),g.lineTo(.255,.495),g.lineTo(.024,.495),g.closePath(),{ring:f,shaft:p,bit:c(`key-bit`,new N(g,{depth:.086,bevelEnabled:!0,bevelThickness:.009,bevelSize:.009,bevelSegments:3,steps:1}),t,0,0,-.043),collar:h}}var ke=new Map;function Ae(e=32){let t=Math.max(8,Math.min(80,Math.round(e))),n=ke.get(t);if(n)return n.clone();let r=t+1,i=new Int32Array(r*r*r).fill(-1),a=(t+1)*(t+1)*(t+1)-(t-1)*(t-1)*(t-1),o=new Float32Array(a*3),s=new Float32Array(a*3),c=0;for(let e=0;e<=t;e++)for(let n=0;n<=t;n++)for(let a=0;a<=t;a++)if(e===0||e===t||n===0||n===t||a===0||a===t){let l=e*r*r+n*r+a;i[l]=c;let u=e/t*2-1,d=n/t*2-1,f=a/t*2-1,p=c*3;o[p]=u,o[p+1]=d,o[p+2]=f;let m=Math.hypot(u,d,f)||1;s[p]=u/m,s[p+1]=d/m,s[p+2]=f/m,c++}let l=6*t*t,u=new Uint16Array(l*6),d=0,f=(e,t,n,a,o,s,c,l,f,p,m,h)=>{let g=i[e*r*r+t*r+n],_=i[a*r*r+o*r+s],v=i[c*r*r+l*r+f],y=i[p*r*r+m*r+h];u[d++]=g,u[d++]=_,u[d++]=y,u[d++]=_,u[d++]=v,u[d++]=y};for(let e=0;e<t;e++)for(let n=0;n<t;n++)f(e,n,t,e+1,n,t,e+1,n+1,t,e,n+1,t);for(let e=0;e<t;e++)for(let n=0;n<t;n++)f(e+1,n,0,e,n,0,e,n+1,0,e+1,n+1,0);for(let e=0;e<t;e++)for(let n=0;n<t;n++)f(t,n,e+1,t,n,e,t,n+1,e,t,n+1,e+1);for(let e=0;e<t;e++)for(let n=0;n<t;n++)f(0,n,e,0,n,e+1,0,n+1,e+1,0,n+1,e);for(let e=0;e<t;e++)for(let n=0;n<t;n++)f(e,t,n,e+1,t,n,e+1,t,n+1,e,t,n+1);for(let e=0;e<t;e++)for(let n=0;n<t;n++)f(e,0,n+1,e+1,0,n+1,e+1,0,n,e,0,n);let p=new L;return p.setAttribute(`position`,new re(o,3)),p.setAttribute(`normal`,new re(s,3)),p.setIndex(new re(u,1)),p.name=`natural-hewn-ice-watertight`,p.boundingBox=new oe(new j(-1.05,-1.05,-1.05),new j(1.05,1.05,1.05)),p.boundingSphere=new h(new j(0,0,0),1.732),ke.set(t,p),p.clone()}async function je(e=40){Ae(e)}function Me(e=40){return Ae(e)}var Ne=(e,t,n)=>{let r=U.clamp((n-e)/(t-e),0,1);return r*r*(3-2*r)};function Pe(e){let t=U.clamp(e,0,1),n=t**1.55,r=U.lerp(1-.12*n,.985,Ne(.66,1,t));return{x:r,y:1-n,z:r,cx:0,cz:0}}var Fe=`
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
`;function Ie(e){let t=new me().setFromEuler(new ie(-Math.PI/2,0,-.08)),n=new j,r=1/0;e.traverse(e=>{if(!(e instanceof u))return;e.updateMatrix();let i=e.geometry.getAttribute(`position`);for(let a=0;a<i.count;a++)n.fromBufferAttribute(i,a).applyMatrix4(e.matrix).multiplyScalar(.7).applyQuaternion(t),r=Math.min(r,n.y)});let i=.029-r+.002;return{pose:e=>{let t=U.clamp(e,0,1),n=Ne(.64,1,t);return{angle:Math.PI/2*n,y:.14-.045*n+(i-.095)*Ne(.78,1,t),z:.08+.68*n}},endY:i}}function Le(e=40,t=3,n,r,i={}){let a=i.highDetail??e>32,l=a||!!i.naturalClarity,d=new de;d.name=`melt-key-model`;let f=U.clamp(Math.round(t),1,4),p=!1;d.userData.highDetail=a,d.userData.materialStudy=f,d.userData.materialReady=!1;let h=new te().load(`/assets/ice-studies/study-${f}${e<=32?`-mobile`:``}.webp`,e=>{p?e.dispose():(d.userData.materialReady=!0,n?.())},void 0,()=>{p||r?.()});h.colorSpace=``,h.minFilter=c,h.magFilter=C,h.anisotropy=a?8:4;let _=[.6,.65,.59,.62][f-1],v={value:+!!l},b={value:_*(l?.8:1)},x=new de;x.name=`key`;let S={uMelt:{value:0},uOpacity:{value:1},uWet:{value:0},uVolumeRoughness:{value:.13},uKeyReveal:{value:0}},w=new I({color:14936813,metalness:0,roughness:.12,transmission:.98,thickness:1,ior:1.31,attenuationColor:11452359,attenuationDistance:l?4.6:3.8,clearcoat:0,clearcoatRoughness:.36,envMapIntensity:.32,transparent:!0,depthWrite:!1}),T=1967,E=()=>(T=T*1664525+1013904223>>>0,T/4294967296),D=Array.from({length:20},()=>{let e=E()*Math.PI*2,t=Math.sqrt(E())*.49;return new H(Math.cos(e)*t+.04,-.58+E()*1.1,Math.sin(e)*t*.75,.012+E()*.016)});w.onBeforeCompile=e=>{e.uniforms.uMelt=S.uMelt,e.uniforms.uKeyReveal=S.uKeyReveal,e.uniforms.uAirPockets={value:D},e.uniforms.uVolumeRoughness=S.uVolumeRoughness,e.uniforms.uStudyMap={value:h},e.uniforms.uFrostStrength=b,e.uniforms.uNaturalClarity=v,e.uniforms.uClearCentre={value:[.78,.48,.82,.65][f-1]},e.fragmentShader=`uniform float uNaturalClarity;uniform vec4 uAirPockets[${D.length}];uniform sampler2D uStudyMap;uniform float uClearCentre;uniform float uFrostStrength;uniform float uKeyReveal;uniform float uVolumeRoughness;uniform float uMelt;uniform mat3 normalMatrix;varying vec3 vJellyLocal;float iceColorDepth;
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
      normal=normalize(max(abs(determinant),.0000001)*normal-gradient*.0005*frozenAmount);`);let t=P.transmission_pars_fragment.replaceAll(`getVolumeTransmissionRay( n, v, thickness,`,`getVolumeTransmissionRay( n, v, min( thickness, mix(.42,.14,smoothstep(.15,.70,uMelt)) ),`).replaceAll(`volumeAttenuation( length( transmissionRay ),`,`volumeAttenuation( iceColorDepth,`).replace(`vec3 attenuatedColor = transmittance * transmittedLight.rgb;`,`
        vec3 attenuatedColor = transmittance * transmittedLight.rgb;
        // Restore a restrained amount of warmth only where the opaque-buffer
        // sample is gold. White surroundings and blue ice keep their original
        // absorption; surface frost, blur and reflection remain in front.
        float goldChroma=(transmittedLight.r-transmittedLight.b)/max(.05,max(transmittedLight.r,transmittedLight.g));
        float goldMask=smoothstep(.10,.38,goldChroma)*smoothstep(.015,.10,transmittedLight.r);
        float goldReadability=.48*smoothstep(.10,.88,uMelt)*uKeyReveal;
        attenuatedColor=mix(attenuatedColor,transmittedLight.rgb*vec3(1.,.86,.55)+vec3(.035,.018,.002),goldMask*goldReadability);
      `);e.fragmentShader=e.fragmentShader.replace(`#include <transmission_pars_fragment>`,t);let n=P.transmission_fragment.replace(`n, v, material.roughness, material.diffuseContribution`,`n, v, uVolumeRoughness, material.diffuseContribution`);n=n.replace(`vec4 transmitted = getIBLVolumeRefraction(`,`
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
      for(int bubble=0;bubble<${D.length};bubble++){
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
`+Fe+`
`+e.vertexShader,e.vertexShader=e.vertexShader.replace(`#include <beginnormal_vertex>`,`#include <beginnormal_vertex>
      vec3 normalAxis=abs(objectNormal.y)<.9?vec3(0.,1.,0.):vec3(1.,0.,0.);
      vec3 tangent=normalize(cross(normalAxis,objectNormal));
      vec3 bitangent=cross(objectNormal,tangent);
      vec3 anchor=shapeIce(position);
      vec3 alongT=shapeIce(position+tangent*.001)-anchor;
      vec3 alongB=shapeIce(position+bitangent*.001)-anchor;
      objectNormal=normalize(cross(alongT,alongB));`),e.vertexShader=e.vertexShader.replace(`#include <begin_vertex>`,`#include <begin_vertex>
      vJellyLocal=hewnIce(position);transformed=shapeIce(position);`)},w.customProgramCacheKey=()=>`snowy-natural-hewn-ice-gpu-v9-`+D.length+`-`+Number(a)+`-`+Number(l);let ee=Me(e),O=new u(ee,w);O.name=`ice-body`,O.position.y=1.03,d.add(O);let k=new o({color:14476262,roughness:.94,metalness:0,transparent:!0,opacity:l?.66:.92,depthWrite:!1,envMapIntensity:.18});k.onBeforeCompile=e=>{e.uniforms.uMelt=S.uMelt,e.uniforms.uOpacity=S.uOpacity,e.uniforms.uRimeAtlas={value:h},e.vertexShader=`uniform float uMelt;varying vec3 vRimeLocal;
`+Fe+`
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
      diffuseColor.a*=max(max(max(cortex*clusters*1.05,basal),frostPatch*.62),max(0.,crackle-.20)*1.35)*grain*uOpacity*(1.-smoothstep(.32,.82,uMelt));`)},k.customProgramCacheKey=()=>`snowy-patchy-rime-gpu-v4-`+Number(a);let re=new u(ee,k);re.name=`surface-hoar`,re.position.copy(O.position),d.add(re);let A=new I({color:14003806,roughness:.23,metalness:1,envMapIntensity:1.25,emissive:0}),M=new I({color:15848076,roughness:.14,metalness:1,envMapIntensity:1.35}),N=new I({color:13017434,roughness:.29,metalness:1,envMapIntensity:1.2}),ie=e=>`uniform float uKeyReveal;
`+e.replace(`void main() {`,`void main() {
    if(uKeyReveal<.9999){float grain=fract(sin(dot(floor(gl_FragCoord.xy),vec2(12.9898,78.233)))*43758.5453);if(uKeyReveal<=0.||grain>uKeyReveal)discard;}`);for(let e of[A,M,N])e.onBeforeCompile=e=>{e.uniforms.uKeyReveal=S.uKeyReveal,e.fragmentShader=ie(e.fragmentShader)},e.customProgramCacheKey=()=>`snowy-turned-gold-resolve-v1`;let F=new y({depthPacking:s});F.onBeforeCompile=e=>{e.uniforms.uKeyReveal=S.uKeyReveal,e.fragmentShader=ie(e.fragmentShader)},F.customProgramCacheKey=()=>`snowy-key-shadow-resolve-v6`;let{ring:L,shaft:R,bit:z,collar:ae}=Oe(x,A,M,N,e<=32,i.compactGeometry);x.position.set(0,.14,.08),x.scale.setScalar(.7),d.add(x);let oe=Ie(x),se=new de;se.name=`ambiguous-golden-core`,se.visible=!1,d.add(se);let ce=new g({color:4810100,opacity:.22,depthWrite:!1});ce.onBeforeCompile=e=>{e.uniforms.uMelt=S.uMelt,e.vertexShader=`varying vec2 vShadowFloor;
`+e.vertexShader,e.vertexShader=e.vertexShader.replace(`#include <worldpos_vertex>`,`#include <worldpos_vertex>
 vShadowFloor=(modelMatrix*vec4(transformed,1.)).xz;`),e.fragmentShader=`uniform float uMelt;varying vec2 vShadowFloor;
      float iceFoot(){return .94*(1.-.12*pow(clamp(uMelt,0.,1.),1.55));}
      vec2 iceCenter(){return vec2(0.);}
      float icePenumbra(){float gap=max(0.,max(abs(vShadowFloor.x-iceCenter().x),abs(vShadowFloor.y-iceCenter().y))-iceFoot());return mix(.32,1.,smoothstep(0.,.85,gap));}
    `+e.fragmentShader;let t=P.shadowmask_pars_fragment.replace(`directionalLight.shadowRadius,`,`directionalLight.shadowRadius * mix(icePenumbra(),1.,smoothstep(.80,1.,uMelt)),`);e.fragmentShader=e.fragmentShader.replace(`#include <shadowmask_pars_fragment>`,t),e.fragmentShader=e.fragmentShader.replace(`gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );`,`
      float edge=max(abs(vShadowFloor.x-iceCenter().x),abs(vShadowFloor.y-iceCenter().y));
      float contact=1.-smoothstep(iceFoot()*.83,iceFoot()*1.08,edge);
      float density=mix(.44+.56*contact,1.,smoothstep(.80,1.,uMelt));
      gl_FragColor=vec4(color,opacity*density*(1.-getShadowMask()));`)},ce.customProgramCacheKey=()=>`snowy-translucent-contact-shadow-v2`;let B=new u(new m(200,200),ce);B.name=`shadow-receiver`,B.rotation.x=-Math.PI/2,B.receiveShadow=!0,d.add(B),O.castShadow=!0,x.traverse(e=>{e instanceof u&&(e.castShadow=!0,e.customDepthMaterial=F)});let V=new y({depthPacking:s});V.onBeforeCompile=e=>{e.uniforms.uMelt=S.uMelt,e.vertexShader=`uniform float uMelt;
`+Fe+`
`+e.vertexShader,e.vertexShader=e.vertexShader.replace(`#include <begin_vertex>`,`#include <begin_vertex>
 transformed=shapeIce(position);`)},V.customProgramCacheKey=()=>`snowy-complete-vertical-shadow-gpu-v12`,O.customDepthMaterial=V;let le={ice:O,key:x,ring:L,shaft:R,bit:z,collar:ae,floor:B,core:se};d.userData.sculptRuntime={nodes:le,meshes:{root:O,ring:L,shaft:R,bit:z,collar:ae},sockets:{floor:new j(0,.04,0)},colliders:{ice:{type:`box`,size:[2,2,2]},key:{type:`compound`}},explodable:!0,clickable:!0};let ue=(e,t,n)=>{let r=U.clamp((n-e)/(t-e),0,1);return r*r*(3-2*r)},fe=(e,t=0)=>{let n=U.clamp(e,0,1);S.uMelt.value=n;let r=Pe(n),i=Math.cbrt(r.x*r.y*r.z);w.roughness=.12+.06*ue(.72,1,n);let a=(1-ue(.978,1,n))*(1-t);S.uOpacity.value=a,w.opacity=a,O.visible=n<1&&a>1e-5,re.visible=n<.82&&a>1e-5,O.castShadow=O.visible&&n<.978;let o=ue(.04,.48,n);S.uVolumeRoughness.value=.13-.05*o,x.visible=!0,S.uKeyReveal.value=ue(.04,.18,n),A.emissiveIntensity=0,d.userData.meltwater={enabled:!1,wetness:0,runoffVisible:!1,dropsVisible:!1,area:0,visualVolume:0,filmHeight:0},d.userData.meltVisual={iceTint:w.attenuationColor.getHexString(),iceScale:i,iceOpacity:w.opacity,keyBlur:S.uVolumeRoughness.value,keyReveal:S.uKeyReveal.value,glowAlpha:1-S.uKeyReveal.value};let s=oe.pose(n);x.rotation.set(-s.angle*(1-t),0,-.08*(1-t)),x.position.set(0,s.y+1.45*t,s.z*(1-t)),x.scale.setScalar(.7-.18*t),d.userData.meltDynamics={choreography:`reference-progressive`,keyAngle:s.angle,keyY:s.y,keyZ:s.z,iceCenter:[r.cx,r.cz],iceHalfSize:[r.x,r.y,r.z],remnantHeight:r.y*2},d.updateMatrixWorld(!0)};fe(0);let pe=()=>{p=!0,h.dispose();let e=new Set,t=new Set;d.traverse(n=>{n instanceof u&&(e.add(n.geometry),(Array.isArray(n.material)?n.material:[n.material]).forEach(e=>t.add(e)),n instanceof ne&&n.dispose())}),V.dispose(),F.dispose(),e.forEach(e=>e.dispose()),t.forEach(e=>e.dispose())};return{root:d,...le,startupTextures:[h],update:fe,dispose:pe,setNaturalClarity(e){let t=a||e;v.value=+!!t,b.value=_*(t?.8:1),w.attenuationDistance=t?4.6:3.8,k.opacity=t?.66:.92}}}function Re(e={}){let t=e.highDetail??!e.lowPower,n=new de;n.name=`walnut-chest`,n.userData.highDetail=t;let r=new de;r.name=`walnut-lid-pivot`,r.position.set(0,1.06,-.9),n.add(r);let i=new F;i.name=`walnut-key-socket`,i.position.set(0,.79,.925),n.add(i);let s=new Set,c=new Set,l=new Set,d={root:n,lid:r,lockSocket:i},f=!1,m=new I({color:t?`#c4a78d`:`#b08e71`,roughness:t?.58:.68,metalness:0,clearcoat:t?.18:.08,clearcoatRoughness:t?.38:.34,normalScale:new a(t?.32:.1,t?.32:.1)});n.userData.materialReady=!1;let h=new te,g=0,_=e.assetBase??`/assets/walnut-chest/`,y=(t,r=!1)=>{let i=h.load(`${_}${t}${e.lowPower?`-mobile`:``}.webp`,()=>{f?i.dispose():(g++,n.userData.materialReady=g===3,e.onReady?.())},void 0,()=>{f||(n.userData.materialError=!0,e.onError?.())});return i.colorSpace=r?T:``,i.anisotropy=e.lowPower?4:8,i.wrapS=i.wrapT=p,l.add(i),i};m.map=y(`walnut-color`,!0),m.normalMap=y(`walnut-normal`),m.roughnessMap=y(`walnut-roughness`),m.onBeforeCompile=e=>{e.fragmentShader=e.fragmentShader.replace(`#include <map_fragment>`,`#include <map_fragment>
    // Preserve the photographed veneer contrast instead of tinting it flat.
    diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.20,.115,.064),${t?`.055`:`.22`});`)},m.customProgramCacheKey=()=>`snowy-veneer-detail-v3-`+Number(t);let b=m.clone();b.color.set(t?`#a58c75`:`#947056`),t&&(b.onBeforeCompile=m.onBeforeCompile,b.customProgramCacheKey=m.customProgramCacheKey);let x=new I({color:`#b99656`,roughness:t?.27:.3,metalness:1,envMapIntensity:1}),S=new I({color:`#171b1e`,roughness:.98,metalness:0,sheen:.35,sheenColor:new A(`#394044`),sheenRoughness:.9});c.add(m),c.add(b),c.add(x),c.add(S);let C=e=>(s.add(e),e),w=(e,t)=>{let n=e.getAttribute(`position`),r=e.getAttribute(`normal`),i=new Float32Array(n.count*2);for(let e=0;e<n.count;e++){let a=n.getX(e)+t.x,o=n.getY(e)+t.y,s=n.getZ(e)+t.z,c=Math.abs(r.getX(e)),l=Math.abs(r.getY(e)),u=Math.abs(r.getZ(e));l>c&&l>u?(i[e*2]=a/3.3+.5,i[e*2+1]=(s+.9)/1.8*.42+.44):c>u?(i[e*2]=s/3.3+.5,i[e*2+1]=o/1.535*.46+.15):(i[e*2]=a/3.3+.5,i[e*2+1]=o/1.535*.46+.15)}e.setAttribute(`uv`,new re(i,2))},E=(e,t,n,i,a)=>{(n===m||n===b)&&w(t,new j(a.x,a.y+(i===r?1.06:0),a.z+(i===r?-.9:0)));let o=new u(C(t),n);return o.name=e,o.position.copy(a),o.castShadow=!0,o.receiveShadow=!0,o.userData.partId=e,i.add(o),d[e]=o,o},D=(r,i,a,o,s,c,l,u=n,d=m)=>E(r,new z(i,a,o,e.lowPower?2:3,Math.min(t?.024:.018,i*.12,a*.12,o*.12)),d,u,new j(s,c,l));D(`bottom`,3.02,.14,1.52,0,.07,0),D(`back`,3.3,1.05,.14,0,.525,-.83),D(`side-left`,.14,1.05,1.56,-1.58,.525,0),D(`side-right`,.14,1.05,1.56,1.58,.525,0);let ee=(e,t,n)=>{let r=new ce,i=-e/2,a=-t/2;return r.moveTo(i+n,a),r.lineTo(i+e-n,a),r.quadraticCurveTo(i+e,a,i+e,a+n),r.lineTo(i+e,a+t-n),r.quadraticCurveTo(i+e,a+t,i+e-n,a+t),r.lineTo(i+n,a+t),r.quadraticCurveTo(i,a+t,i,a+t-n),r.lineTo(i,a+n),r.quadraticCurveTo(i,a,i+n,a),r},O=e=>{let t=new v;return t.absarc(0,e,.072,Math.PI*1.24,Math.PI*1.76,!0),t.lineTo(.088,e-.245),t.quadraticCurveTo(.092,e-.265,.07,e-.265),t.lineTo(-.07,e-.265),t.quadraticCurveTo(-.092,e-.265,-.088,e-.245),t.closePath(),t},k=ee(3.3,1.05,.018);k.holes.push(O(.265)),E(`front`,new N(k,{depth:.14,steps:1,bevelEnabled:!0,bevelSegments:2,bevelSize:.006,bevelThickness:.006,curveSegments:e.lowPower?12:20}),m,n,new j(0,.525,.76));let M=ee(.31,.44,.042);M.holes.push(O(.79-.705)),E(`lock`,new N(M,{depth:.018,steps:1,bevelEnabled:!0,bevelSegments:2,bevelSize:.004,bevelThickness:.004,curveSegments:e.lowPower?12:24}),x,n,new j(0,.705,.906)),D(`lid`,3.3,.475,1.8,0,.2375,.9,r),D(`lid-inset`,3,.018,1.5,0,-.005,.9,r,b),D(`interior`,3,.025,1.5,0,.153,0,n,S);let ie=.037;for(let[t,r]of[[`hinge-a`,-1.02],[`hinge-b`,1.02]]){let i=new de;i.name=t,i.position.set(r,1.05,-.89),n.add(i),d[t]=i,D(`${t}-base`,.32,.1,.014,0,-.045,-.01,i,x);let a=E(`${t}-knuckle`,new se(ie,ie,.32,e.lowPower?12:20),x,i,new j);a.rotation.z=Math.PI/2}let P=C(new se(.014,.014,.007,e.lowPower?8:12)),L=new ne(P,x,t?6:4);L.name=`hinge-screws`;let R=new F,ae=0;for(let e of[-1.12,-.92,.92,1.12])R.position.set(e,1.015,-.913),R.rotation.set(Math.PI/2,0,0),R.updateMatrix(),L.setMatrixAt(ae++,R.matrix);n.add(L);let B,le;if(t){for(let e of[.89,.51])R.position.set(0,e,.932),R.rotation.set(Math.PI/2,0,0),R.updateMatrix(),L.setMatrixAt(ae++,R.matrix);let e=new o({color:`#30281f`,roughness:.85,metalness:.22});c.add(e),B=new ne(C(new V(.018,.003,.0015)),e,2),B.name=`lock-screw-slots`;for(let e=0;e<2;e++)R.position.set(0,[.89,.51][e],.9365),R.rotation.set(0,0,e?.36:-.2),R.updateMatrix(),B.setMatrixAt(e,R.matrix);n.add(B),le=new ne(C(new V(.006,.94,.001)),e,2),le.name=`front-corner-joinery`;for(let e=0;e<2;e++)R.position.set(e?-1.5:1.5,.525,.9065),R.rotation.set(0,0,0),R.updateMatrix(),le.setMatrixAt(e,R.matrix);n.add(le)}d.lid=r,d[`hinge-screws`]=L;let H={};n.traverse(e=>{e instanceof u&&(H[e.name]=e)});let ue=[...n.children].filter(e=>e!==i),fe=new j(0,.75,0);n.updateMatrixWorld(!0);let pe=ue.map(e=>({part:e,position:e.position.clone(),offset:new oe().setFromObject(e).getCenter(new j).sub(fe)}));n.userData.sculptRuntime={nodes:d,meshes:H,sockets:{key:i,hinge:r},colliders:{body:{type:`compound-box`,size:[3.3,1.535,1.8]},lid:{type:`box`,size:[3.3,.475,1.8]}},destructionGroups:{body:[`front`,`back`,`side-left`,`side-right`,`bottom`].map(e=>d[e]),lid:[r]},explodable:!0,clickable:!0,setExplode(e){let t=U.clamp(e,0,1);for(let e of pe)e.part.position.copy(e.position).addScaledVector(e.offset,t*.65)}},n.userData.reference=`Walnut presentation box: proportional/material inspiration; inferred rear/interior and adapted working lock.`;let me=e=>{r.rotation.x=-U.clamp(e,0,1)*1.83,n.userData.openProgress=U.clamp(e,0,1)};return me(0),{root:n,lidPivot:r,keySocket:i,update:me,dispose(){f||(f=!0,s.forEach(e=>e.dispose()),c.forEach(e=>e.dispose()),l.forEach(e=>e.dispose()),L.dispose(),B?.dispose(),le?.dispose(),n.clear())}}}function ze(e){if(e.index||Object.keys(e.morphAttributes).length)return!1;let t=Object.entries(e.attributes);if(!t.length||t.some(([,e])=>!(e instanceof re)||!(e.array instanceof Float32Array)||`isInstancedBufferAttribute`in e))return!1;let n=t[0][1].count;if(t.some(([,e])=>e.count!==n))return!1;let r=t.map(([e,t])=>({name:e,attribute:t,words:new Uint32Array(t.array.buffer,t.array.byteOffset,t.array.length)})),i=[],a=new Uint32Array(n),o=new Map,s=0;for(let{attribute:e}of r)s+=e.itemSize*4;for(let e=0;e<n;e++){let t=``;for(let{attribute:n,words:i}of r)for(let r=0;r<n.itemSize;r++){let a=i[e*n.itemSize+r];t+=String.fromCharCode(a>>>16,a&65535)}let n=o.get(t);n===void 0&&(n=i.length,i.push(e),o.set(t,n)),a[e]=n}let c=i.length<=65535;if(i.length*s+n*(c?2:4)>=n*s)return!1;for(let{name:t,attribute:n,words:a}of r){let r=new Float32Array(i.length*n.itemSize),o=new Uint32Array(r.buffer);for(let e=0;e<i.length;e++)o.set(a.subarray(i[e]*n.itemSize,(i[e]+1)*n.itemSize),e*n.itemSize);let s=new re(r,n.itemSize,n.normalized);s.name=n.name,s.gpuType=n.gpuType,s.setUsage(n.usage),e.setAttribute(t,s)}return e.setIndex(new re(c?new Uint16Array(a):a,1)),!0}function Be(e={}){if(new URLSearchParams(location.search).get(`chest`)===`legacy`)return Re(e);let t=e.highDetail??!e.lowPower,n=new de;n.name=`walnut-chest`,n.userData.highDetail=t;let r=new de;r.name=`walnut-lid-pivot`,r.position.set(0,1.06,-.9),n.add(r);let i=new F;i.name=`walnut-key-socket`,i.position.set(0,.79,.925),n.add(i);let s=new Set,c=new Set,l=new Set,d={root:n,lid:r,lockSocket:i},f=!1,m=new I({color:`#c28452`,roughness:.65,metalness:0,clearcoat:.18,clearcoatRoughness:.32,normalScale:new a(.35,.35)});n.userData.materialReady=!1;let h=new te,g=0,_=e.assetBase??(e.lowPower?`/assets/walnut-chest/`:`/assets/walnut-chest-v2/`),y=(t,r=!1)=>{let i=`${_}${t}${e.lowPower?`-mobile`:``}.webp`,a=e.compactGeometry?1:e.lowPower?3:2,o=()=>{g++,n.userData.materialReady=g===a,e.onReady?.()},s=h.load(i,e=>{f?e.dispose():o()},void 0,()=>{f||(n.userData.materialError=!0,e.onError?.())});return s.colorSpace=r?T:``,s.anisotropy=e.lowPower?4:8,s.wrapS=s.wrapT=p,l.add(s),s};m.map=y(`walnut-color`,!0),e.compactGeometry?(m.roughness=.62,m.metalness=0):(m.normalMap=y(e.lowPower?`walnut-normal`:`walnut-normal-roughness`),m.roughnessMap=e.lowPower?y(`walnut-roughness`):m.normalMap),m.onBeforeCompile=t=>{e.lowPower||(t.fragmentShader=t.fragmentShader.replace(`#include <roughnessmap_fragment>`,P.roughnessmap_fragment.replace(`texelRoughness.g`,`texelRoughness.a`))),t.fragmentShader=t.fragmentShader.replace(`#include <map_fragment>`,`#include <map_fragment>
      diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.26, 0.12, 0.05), 0.28);
    `)},m.customProgramCacheKey=()=>`snowy-crafted-walnut-v4-`+Number(!!e.lowPower);let b=m.clone();b.color.set(`#c2a78b`),b.onBeforeCompile=m.onBeforeCompile,b.customProgramCacheKey=m.customProgramCacheKey;let x=new I({color:`#c29542`,roughness:.32,metalness:.88,clearcoat:.3,envMapIntensity:1.2}),S=new I({color:`#171b1e`,roughness:.98,metalness:0,sheen:.35,sheenColor:new A(`#394044`),sheenRoughness:.9});c.add(m),c.add(b),c.add(x),c.add(S);let C=e=>(s.add(e),e),w=(e,t,n)=>{let r=e.getAttribute(`position`),i=e.getAttribute(`normal`),a=new Float32Array(r.count*2);for(let e=0;e<r.count;e++){let o=r.getX(e)+t.x,s=r.getY(e)+t.y,c=r.getZ(e)+t.z,l=Math.abs(i.getX(e)),u=Math.abs(i.getY(e)),d=Math.abs(i.getZ(e)),f=1/3.3;u>l&&u>d?(a[e*2]=(n.includes(`stile`)?c:o)*f+.5,a[e*2+1]=(n.includes(`stile`)?o:c)*f+.48):l>d?(a[e*2]=c*f+.37,a[e*2+1]=s*f+.23):n.includes(`stile`)?(a[e*2]=s*f+.16,a[e*2+1]=o*f+.5):(a[e*2]=o*f+.5,a[e*2+1]=s*f+.15)}e.setAttribute(`uv`,new re(a,2))},E=(e,t,n,i,a)=>{(n===m||n===b)&&w(t,new j(a.x,a.y+(i===r?1.06:0),a.z+(i===r?-.9:0)),e);let o=new u(C(t),n);return o.name=e,o.position.copy(a),o.castShadow=!0,o.receiveShadow=!0,o.userData.partId=e,i.add(o),d[e]=o,o},D=new Map,ee=(e,t,n,r,i)=>{let a=`${e}_${t}_${n}_${r}_${i}`,o=D.get(a);return o||(o=new z(e,t,n,r,i),D.set(a,o)),o.clone()},O=(r,i,a,o,s,c,l,u=n,d=m)=>E(r,ee(i,a,o,e.compactGeometry?1:e.lowPower?2:3,Math.min(t?.024:.018,i*.12,a*.12,o*.12)),d,u,new j(s,c,l));O(`bottom`,3.02,.14,1.52,0,.07,0),O(`back`,3.3,1.05,.14,0,.525,-.83),O(`side-left`,.14,1.05,1.56,-1.58,.525,0),O(`side-right`,.14,1.05,1.56,1.58,.525,0);let k=(e,t,n)=>{let r=new ce,i=-e/2,a=-t/2;return r.moveTo(i+n,a),r.lineTo(i+e-n,a),r.quadraticCurveTo(i+e,a,i+e,a+n),r.lineTo(i+e,a+t-n),r.quadraticCurveTo(i+e,a+t,i+e-n,a+t),r.lineTo(i+n,a+t),r.quadraticCurveTo(i,a+t,i,a+t-n),r.lineTo(i,a+n),r.quadraticCurveTo(i,a,i+n,a),r},M=e=>{let t=new v;return t.absarc(0,e,.072,Math.PI*1.24,Math.PI*1.76,!0),t.lineTo(.088,e-.245),t.quadraticCurveTo(.092,e-.265,.07,e-.265),t.lineTo(-.07,e-.265),t.quadraticCurveTo(-.092,e-.265,-.088,e-.245),t.closePath(),t},ie=k(3.3,1.05,.018);ie.holes.push(M(.265)),E(`front`,new N(ie,{depth:.14,steps:1,bevelEnabled:!0,bevelSegments:2,bevelSize:.006,bevelThickness:.006,curveSegments:e.lowPower?12:20}),m,n,new j(0,.525,.76));let L=k(.31,.44,.042);L.holes.push(M(.79-.705)),E(`lock`,new N(L,{depth:.018,steps:1,bevelEnabled:!0,bevelSegments:2,bevelSize:.004,bevelThickness:.004,curveSegments:e.lowPower?12:24}),x,n,new j(0,.705,.906)),O(`lid`,3.3,.445,1.8,0,.2225,.9,r),O(`lid-inset`,3,.018,1.5,0,-.005,.9,r,b),O(`interior`,3,.025,1.5,0,.153,0,n,S);let R=[];if(!e.compactGeometry){R.push(O(`lid-panel`,2.99,.018,1.49,0,.449,.9,r));for(let e of[.06,1.74])R.push(O(`lid-rail`,3.3,.03,.12,0,.46,e,r));for(let e of[-1.59,1.59])R.push(O(`lid-stile`,.12,.03,1.56,e,.46,.9,r));for(let e of[.055,.995])R.push(O(`front-rail`,3.15,.09,.022,0,e,.918));for(let e of[-1.575,1.575])R.push(O(`front-stile`,.1,.85,.022,e,.525,.918))}for(let e of[n,r]){let t=R.filter(t=>t.parent===e);if(t.length===0)continue;let r=[];for(let n of t)n.updateMatrix(),r.push(n.geometry.clone().applyMatrix4(n.matrix)),e.remove(n),s.delete(n.geometry),n.geometry.dispose(),d[n.name]===n&&delete d[n.name];let i=le(r);if(r.forEach(e=>e.dispose()),i){let t=new u(C(i),m);t.name=e===n?`crafted-front-frame`:`crafted-lid-frame`,t.castShadow=!0,t.receiveShadow=!0,e.add(t),d[t.name]=t}}let ae=.037,B,H;if(!e.compactGeometry){for(let[t,r]of[[`hinge-a`,-1.02],[`hinge-b`,1.02]]){let i=new de;i.name=t,i.position.set(r,1.05,-.89),n.add(i),d[t]=i,O(`${t}-base`,.32,.1,.014,0,-.045,-.01,i,x);let a=E(`${t}-knuckle`,new se(ae,ae,.32,e.lowPower?12:20),x,i,new j);a.rotation.z=Math.PI/2}let r=C(new se(.014,.014,.007,e.lowPower?8:12));B=new ne(r,x,t?6:4),B.name=`hinge-screws`;let i=new F,a=0;for(let e of[-1.12,-.92,.92,1.12])i.position.set(e,1.015,-.913),i.rotation.set(Math.PI/2,0,0),i.updateMatrix(),B.setMatrixAt(a++,i.matrix);if(n.add(B),t){for(let e of[.89,.51])i.position.set(0,e,.932),i.rotation.set(Math.PI/2,0,0),i.updateMatrix(),B.setMatrixAt(a++,i.matrix);let e=new o({color:`#30281f`,roughness:.85,metalness:.22});c.add(e),H=new ne(C(new V(.018,.003,.0015)),e,2),H.name=`lock-screw-slots`;for(let e=0;e<2;e++)i.position.set(0,[.89,.51][e],.9365),i.rotation.set(0,0,e?.36:-.2),i.updateMatrix(),H.setMatrixAt(e,i.matrix);n.add(H)}}d.lid=r,B&&(d[`hinge-screws`]=B),s.forEach(ze);let ue={};n.traverse(e=>{e instanceof u&&(ue[e.name]=e)});let fe=[...n.children].filter(e=>e!==i),pe=new j(0,.75,0);n.updateMatrixWorld(!0);let me=fe.map(e=>({part:e,position:e.position.clone(),offset:new oe().setFromObject(e).getCenter(new j).sub(pe)}));n.userData.sculptRuntime={nodes:d,meshes:ue,sockets:{key:i,hinge:r},colliders:{body:{type:`compound-box`,size:[3.3,1.535,1.8]},lid:{type:`box`,size:[3.3,.475,1.8]}},destructionGroups:{body:[`front`,`back`,`side-left`,`side-right`,`bottom`].map(e=>d[e]),lid:[r]},explodable:!0,clickable:!0,setExplode(e){let t=U.clamp(e,0,1);for(let e of me)e.part.position.copy(e.position).addScaledVector(e.offset,t*.65)}},n.userData.reference=`Walnut presentation box: proportional/material inspiration; inferred rear/interior and adapted working lock.`;let he=e=>{r.rotation.x=-U.clamp(e,0,1)*1.83,n.userData.openProgress=U.clamp(e,0,1)};return he(0),{root:n,lidPivot:r,keySocket:i,update:he,dispose(){f||(f=!0,D.forEach(e=>e.dispose()),D.clear(),s.forEach(e=>e.dispose()),c.forEach(e=>e.dispose()),l.forEach(e=>{e.dispose(),e.image instanceof ImageBitmap&&e.image.close()}),B?.dispose(),H?.dispose(),n.clear())}}}var W=`
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
`;function Ve(e,t,n,r,i,s){let c=new m(80,80);c.rotateX(-Math.PI/2),c.translate(0,-.006,0);let l={value:e},d={value:new H(1,1,0,0)},f={value:0},p={value:0},h={value:1},g={value:r.position.clone()},_={value:0},v={value:new H},y={value:new H},b={value:new a},x={value:0},S=new o({color:16777215,roughness:1,metalness:0,toneMapped:!1});S.onBeforeCompile=e=>{Object.assign(e.uniforms,{...xe,...i,uPhoneGround:x,uWoodFoot:v,uIceFoot:y,uFootAngles:b,uSnowBackdrop:l,uSnowCrop:d,uCloseCamp:f,uHighDetail:p,uIceStrength:h,uFirePosition:g,uFireFlicker:_}),s&&(e.uniforms.uSharedIrradiance=s),e.vertexShader=(s?`uniform sampler2D uSharedIrradiance;
`:``)+`varying vec3 vSnowWorld;varying vec4 vSnowClip;varying vec3 vAuroraIrradiance;
`+W+`
`+e.vertexShader,e.vertexShader=e.vertexShader.replace(`#include <project_vertex>`,`#include <project_vertex>
      vSnowWorld=(modelMatrix*vec4(transformed,1.)).xyz;vSnowClip=gl_Position;vAuroraIrradiance=${s?`texelFetch(uSharedIrradiance,ivec2(0),0).rgb`:i.uAuroraGroundStrength.value>0?`auroraDiffuseIrradiance(vec3(0.,1.,0.))`:`vec3(0.)`};`),e.fragmentShader=`uniform float uHighDetail;uniform float uCloseCamp;${Te}
 uniform sampler2D uSnowBackdrop;uniform vec4 uSnowCrop;uniform float uIceStrength;uniform vec3 uFirePosition;uniform float uFireFlicker;uniform vec4 uWoodFoot;uniform vec4 uIceFoot;uniform vec2 uFootAngles;uniform float uPhoneGround;
      varying vec3 vSnowWorld;varying vec4 vSnowClip;varying vec3 vAuroraIrradiance;
      ${W}
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
      #include <opaque_fragment>`)},S.customProgramCacheKey=()=>`snowy-phone-contact-v3`+(s?`-shared-f32-v1`:``);let C=new de;C.name=`photographic-snow-ground`;let w=new u(c,S);w.receiveShadow=!0,C.add(w);let T=(e,t,n)=>{let r=[],i=[];for(let e=0;e<=128;e++){let a=e/128*Math.PI*2,o=Math.cos(a),s=Math.sin(a),c=Math.min((t-.018)/Math.max(1e-4,Math.abs(o)),(n-.018)/Math.max(1e-4,Math.abs(s))),l=Math.min((t+.13)/Math.max(1e-4,Math.abs(o)),(n+.13)/Math.max(1e-4,Math.abs(s))),u=.018+.008*Math.sin(a*19)+.005*Math.sin(a*43+1);if(r.push(o*c,u,s*c,o*l,-.006,s*l),e<128){let t=e*2;i.push(t,t+2,t+1,t+1,t+2,t+3)}}let a=new L;a.setAttribute(`position`,new k(r,3)),a.setIndex(i),a.computeVertexNormals();let o=new u(a,S);return o.position.copy(e.position),o.position.y=0,o.rotation.y=e.rotation.y,o.receiveShadow=!0,C.add(o),o},E=t.scale.x,D=n.scale.x,ee=T(t,1.65*E,.9*E),O=T(n,D,D);return{root:C,setBackground(t){e=t,l.value=t},update(i,a,o){v.value.set(t.position.x,t.position.z,1.65*t.scale.x,.9*t.scale.z),y.value.set(n.position.x,n.position.z,n.scale.x,n.scale.z),b.value.set(t.rotation.y,n.rotation.y),x.value=+!!e.userData.integratedPhone,ee.visible=x.value<.5,O.visible=x.value<.5,ee.position.set(t.position.x,0,t.position.z),ee.rotation.y=t.rotation.y,ee.scale.set(t.scale.x/E,x.value?t.scale.x*2.5:1,t.scale.z/E),O.position.set(n.position.x,0,n.position.z),O.rotation.y=n.rotation.y,O.scale.set(n.scale.x/D,1,n.scale.z/D),f.value=+!!e.userData.closeCamp,p.value=+!!e.userData.highDetail,h.value=(1-i)*(1-a),O.scale.y=h.value*(x.value?n.scale.x*2.5:1),O.visible=x.value<.5&&h.value>.01,d.value.set(e.repeat.x,e.repeat.y,e.offset.x,e.offset.y),g.value.copy(r.position),_.value=.055*Math.sin(o*7.1)+.025*Math.sin(o*13.7)},dispose(){c.dispose(),ee.geometry.dispose(),O.geometry.dispose(),S.dispose()}}}function He(e){let t=e.assetBase??`/assets/realistic-winter`,n=e.maxTextureSize>=4108,r=e.lowPower?`aurora-mobile-v1.webp`:`aurora-user-original-v1.webp`,i=!1,o=!1,s=!1,c=new AbortController,l={value:new H(1,1,0,0)},d=new ee,p=new te().load(`${t}/${r}`,()=>{i?p.dispose():(d.image=p.image,d.needsUpdate=!0,s=!0,e.onReady?.())},void 0,t=>{console.error(`[SKY TEXTURE ERROR]`,t),i||e.onError?.()});d.colorSpace=``,d.generateMipmaps=!1,d.minFilter=d.magFilter=C;let h={uAuroraMap:{value:d},uAuroraIntensity:{value:e.intensity??.62},uAuroraGroundStrength:{value:0},uAuroraPortrait:{value:0},uAuroraTime:{value:0},uAuroraNatureBounce:{value:0},uAuroraCrop:l,uAuroraProjection:{value:new a(1,1)},uAuroraViewToWorld:{value:new w},uAuroraWorldToView:{value:new w}},g={value:null},_={value:0},v=!1,y=[],b=()=>{let e=y[+!!v];g.value=e,_.value=+!!e?.image},x=new te,S=n=>{let r=+!!n;if(y[r]?.image)return;let a=n?`aurora-sky-portrait-mask.webp`:`aurora-sky-landscape-enhanced-mask-v1.webp`,o=t=>{i?t.dispose():(y[r]?.dispose(),y[r]=t,b(),e.onReady?.())},s=x.load(t+`/`+a,()=>{o(s)},void 0,()=>{i||e.onError?.()});s.colorSpace=``,s.generateMipmaps=!1,s.minFilter=s.magFilter=C};S(typeof window<`u`&&matchMedia(`(orientation: portrait), (max-width: 699px)`).matches);let T=new f({transparent:!0,blending:1,depthWrite:!1,depthTest:!0,toneMapped:!1,uniforms:{...h,uPlate:{value:null},uHasPlate:{value:0},uSkyMask:g,uHasSkyMask:_,uSkyGate:{value:new a(...e.skyBlueGate??[.68,.9])},uCrop:l},vertexShader:`varying vec2 vUv;varying vec3 vAuroraIrradiance;
      ${W}
      void main(){vUv=uv;vAuroraIrradiance=vec3(0.);gl_Position=vec4(position.xy,.9999999,1.);}`,fragmentShader:`precision highp float;uniform sampler2D uPlate;uniform sampler2D uSkyMask;uniform float uHasSkyMask;uniform vec2 uSkyGate;uniform vec4 uCrop;uniform float uHasPlate;varying vec2 vUv;varying vec3 vAuroraIrradiance;
      ${W}
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
      }`}),E=new u(new m(2,2),T);return E.name=`user-original-aurora`,E.frustumCulled=!1,E.renderOrder=-20,{root:E,lighting:h,get textureVariant(){return n?`comfyui-upper-local`:`original-capability-fallback`},get ready(){return s&&!!y[+!!v]?.image},get time(){return h.uAuroraTime.value},update(e){!i&&o&&(h.uAuroraTime.value=e)},setCamera(e){e.updateMatrixWorld(),h.uAuroraViewToWorld.value.setFromMatrix4(e.matrixWorld),h.uAuroraWorldToView.value.setFromMatrix4(e.matrixWorldInverse);let t=Math.tan(U.degToRad(e.fov)*.5);h.uAuroraProjection.value.set(t*e.aspect,t)},setActive(e){i||(o=e)},setCrop(e,t=!1){l.value.set(e.repeat.x,e.repeat.y,e.offset.x,e.offset.y),T.uniforms.uPlate.value=e,T.uniforms.uHasPlate.value=1,h.uAuroraPortrait.value=+!!t,h.uAuroraNatureBounce.value=!t&&e.userData.highDetail?1:0,v=t,S(t),b()},setIrradiance(e){T.uniforms.uSharedIrradiance=e,T.vertexShader=`uniform sampler2D uSharedIrradiance;
`+T.vertexShader.replace(`vAuroraIrradiance=auroraDiffuseIrradiance(vec3(0.,1.,0.));`,`vAuroraIrradiance=texelFetch(uSharedIrradiance,ivec2(0),0).rgb;`),T.needsUpdate=!0},setIntensity(e){h.uAuroraIntensity.value=U.clamp(e,0,2)},get state(){return o&&s?`flowing`:`still`},dispose(){i||(i=!0,c.abort(),d.dispose(),y.forEach(e=>e.dispose()),E.geometry.dispose(),T.dispose())}}}function G(e,t,n,r){let i=new H,a=new H,o=!1,s=!1;e.onBeforeRender=e=>{if(o=!1,e.getRenderTarget()!==null||t.x<=0||t.y<=0||(e.getCurrentViewport(a),a.z<=0||a.w<=0))return;e.getScissor(i),s=e.getScissorTest();let c=e.getPixelRatio(),l=r()?.095:.084,u=r()?.018:.027,d=(n.x-t.z)/t.x,f=(1-n.y-t.w)/t.y,p=n.z*l/t.x,m=n.z*u/t.y,h=Math.max(a.x,Math.floor(a.x+(d-p)*a.z)-2),g=Math.max(a.y,Math.floor(a.y+(f-m)*a.w)-2),_=Math.min(a.x+a.z,Math.ceil(a.x+(d+p)*a.z)+2),v=Math.min(a.y+a.w,Math.ceil(a.y+(f+m)*a.w)+2);s&&(h=Math.max(h,i.x*c),g=Math.max(g,i.y*c),_=Math.min(_,(i.x+i.z)*c),v=Math.min(v,(i.y+i.w)*c)),e.setScissor(h/c,g/c,Math.max(0,_-h)/c,Math.max(0,v-g)/c),e.setScissorTest(!0),o=!0},e.onAfterRender=e=>{o&&=(e.setScissor(i),e.setScissorTest(s),!1)}}function Ue(e={}){let t=new de;t.name=`photographed-campfire-flame`;let n=new AbortController,r=!1,i=!0,a=!1,o=!1,s=!1,c=0,d=-1,p=document.createElement(`video`);p.muted=!0,p.loop=!0,p.playsInline=!0,p.preload=`auto`,p.crossOrigin=`anonymous`,p.setAttribute(`playsinline`,``),p.setAttribute(`muted`,``);let h=!1,g;typeof p.requestVideoFrameCallback==`function`&&(g=p.requestVideoFrameCallback(()=>{g=void 0,!r&&(h=!0,e.onReady?.())}));let v=new ae(p);v.colorSpace=T,v.minFilter=v.magFilter=C,v.generateMipmaps=!1;let y={value:1.08},b={value:0},x={value:new H(1,1,0,0)},w={value:0},E={value:null},D={value:new j(.6105,.681,.58)},ee=`uniform float uCloseCamp;${Te}
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
    }`,O=new l({color:16777215,map:v,transparent:!0,depthWrite:!1,side:2,toneMapped:!1,fog:!1,blending:5,blendEquation:100,blendSrc:201,blendDst:201});O.onBeforeCompile=e=>{Object.assign(e.uniforms,xe),e.uniforms.uFlameExposure=y,e.uniforms.uCloseCamp=b,e.uniforms.uPlateCrop=x,e.uniforms.uPortrait=w,e.uniforms.uPitLayout=D,e.vertexShader=`varying vec4 vFlameClip;
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
    `)},O.customProgramCacheKey=()=>`snowy-photographed-flame-distant-pit-v4`;let k=new m(4/3,1),ne=new u(k,O);ne.name=`real-flame-footage`,ne.position.y=.32,ne.renderOrder=3,t.add(ne);let A=new _(16749624,12,14,1.3);A.position.set(0,.45,.04),t.add(A);let M,N=new f({transparent:!0,depthTest:!1,depthWrite:!1,toneMapped:!1,blending:2,uniforms:{...xe,uCloseCamp:b,uPlate:E,uPlateCrop:x,uPortrait:w,uPitLayout:D,uFlames:{value:v}},vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}`,fragmentShader:`uniform sampler2D uPlate;uniform sampler2D uFlames;varying vec2 vUv;${ee}
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
      }`}),ie=new u(new m(2,2),N);ie.frustumCulled=!1,ie.renderOrder=2,t.add(ie),G(ie,x.value,D.value,()=>w.value>.5);let P=new L,F=new Float32Array(60),I=new Float32Array(20),R=413,z=()=>(R=1664525*R+1013904223>>>0,R/4294967296);for(let e=0;e<20;e++)F[e*3]=(z()-.5)*.4,F[e*3+1]=z()*1,F[e*3+2]=(z()-.5)*.4,I[e]=z();P.setAttribute(`position`,new re(F,3)),P.setAttribute(`phase`,new re(I,1));let oe={value:0},se=new f({transparent:!0,depthTest:!1,depthWrite:!1,blending:2,toneMapped:!1,uniforms:{uTime:oe},vertexShader:`uniform float uTime;attribute float phase;varying float vAlpha;
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
      }`}),ce=new S(P,se);ce.name=`rising-sparks`,ce.frustumCulled=!1,ce.renderOrder=4,t.add(ce);let B=e=>{O.map!==e&&(O.map=e,O.needsUpdate=!0)},V=()=>{if(!r){if(i&&t.userData.videoReady&&!s?(B(v),N.uniforms.uFlames.value=v):M&&t.userData.posterReady?(B(M),N.uniforms.uFlames.value=M):t.userData.videoReady&&(B(v),N.uniforms.uFlames.value=v),!i||!a)o&&(d=c),(!p.paused||o)&&p.pause(),t.userData.playing=!1;else if(t.userData.videoReady&&p.paused&&!o&&!s){o=!0;let e=++c;p.play().then(()=>{o=!1,!r&&(t.userData.playing=i&&a&&!p.paused,i&&a||p.pause())},n=>{o=!1,!r&&(s=n?.name!==`AbortError`||e!==d,t.userData.playing=!1,s&&M&&t.userData.posterReady&&B(M))})}}},le=!1,ue=()=>{r||le||(le=!0,p.src=e.source??`/assets/realistic-winter/flames-real-loop.mp4`,p.load())};M=new te().load(e.poster??`/assets/realistic-winter/flames-real-poster.jpg`,n=>{r?n.dispose():(t.userData.posterReady=!0,V(),e.onReady?.())},void 0,n=>{r||(t.userData.posterError=!0,ue(),e.onError?.(n))}),M.colorSpace=T,M.generateMipmaps=!1,M.minFilter=C,p.addEventListener(`loadeddata`,()=>{v.needsUpdate=!0,t.userData.videoReady=!0,V(),e.onReady?.()},{signal:n.signal}),p.addEventListener(`error`,()=>{t.userData.videoError=!0,e.onError?.(p.error)},{signal:n.signal}),document.addEventListener(`pointerdown`,()=>{s&&(s=!1,V())},{signal:n.signal,passive:!0}),e.deferVideo||ue();let fe=new j;return{root:t,mesh:ne,light:A,video:p,loadVideo:ue,get motionBlocked(){return s},get framePresented(){return h||typeof p.requestVideoFrameCallback!=`function`&&p.readyState>=2&&p.currentTime>0},setComposition(e,t){b.value=+!!e.userData.closeCamp;let n=De(t,!!e.userData.closeCamp,e.userData.compactPit);D.value.set(n.x,n.y,n.scale),E.value=e,w.value=+!!t,x.value.set(e.repeat.x,e.repeat.y,e.offset.x,e.offset.y)},setMotion(e){i!==e&&(i=e,V())},setExposure(e){y.value=U.clamp(e,.1,3)},update(e,n,r){a=r,t.updateWorldMatrix(!0,!1),n.getWorldPosition(fe),t.worldToLocal(fe),ne.rotation.y=Math.atan2(fe.x,fe.z),oe.value=performance.now()*.001,A.intensity=8*(i&&a?1+.055*Math.sin(e*7.1)+.025*Math.sin(e*13.7):1),V()},pause(){a=!1,V()},dispose(){g!==void 0&&p.cancelVideoFrameCallback(g),!r&&(r=!0,n.abort(),p.pause(),p.removeAttribute(`src`),p.load(),P.dispose(),se.dispose(),k.dispose(),O.dispose(),ie.geometry.dispose(),N.dispose(),v.dispose(),M?.dispose(),t.clear())}}}var We=(e,t,n)=>{let r=U.clamp((n-e)/(t-e),0,1);return r*r*(3-2*r)};function Ge(e,t){let n=new j,r=new j,i=new j,a=new me,o=new me,s=new me,c=new j,l=new j,u=new j,d=new me,f=new me,p=new j,m=new j,h=new j,g=new me().setFromAxisAngle(new j(1,0,0),Math.PI/2),_=new me,v=new j(0,1,0),y=new M,b=!1,x=()=>{e.updateWorldMatrix(!0,!1),t.updateWorldMatrix(!0,!1),e.getWorldPosition(n),e.getWorldQuaternion(a),e.getWorldScale(c),t.getWorldPosition(p),t.getWorldQuaternion(s),m.set(0,0,1).applyQuaternion(s).normalize(),o.copy(s).multiply(g).multiply(new me().setFromAxisAngle(v,-Math.PI/2));let l=U.clamp(n.distanceTo(p)*.2,.64,1.8);r.copy(n).add(new j(0,l,0)),h.set(0,.157,0).multiply(c).applyQuaternion(o),i.copy(p).addScaledVector(m,.58).sub(h),y.v0.copy(r),y.v1.copy(r).add(new j(0,.45,0)),y.v2.copy(i).addScaledVector(m,.26).add(new j(0,.9,0)),y.v3.copy(i),b=!0};return{begin:x,apply:t=>{b||x();let i=U.clamp(t,0,1),s=We(0,.15,i),g=We(.15,.46,i);i<.15?u.lerpVectors(n,r,s):y.getPoint(g,u),d.slerpQuaternions(a,o,We(.04,.46,i));let S=We(.46,.58,i),C=We(.59,.69,i);i>=.46&&(d.copy(o).multiply(_.setFromAxisAngle(v,Math.PI/2*C)),h.set(0,.157,0).multiply(c).applyQuaternion(d),u.copy(p).addScaledVector(m,U.lerp(.58,-.35,S)).sub(h));let w=u.clone();e.parent.updateWorldMatrix(!0,!1),e.position.copy(e.parent.worldToLocal(u)),e.parent.getWorldQuaternion(f).invert(),e.quaternion.copy(f).multiply(d),e.parent.getWorldScale(l),e.scale.copy(c).divide(l),e.visible=!0,e.updateWorldMatrix(!1,!0);let T=h.set(0,.157,0).applyMatrix4(e.matrixWorld);return{lift:s,travel:g,insertion:S,turn:C,lid:We(.69,.93,i),card:We(.93,1,i),keyTip:T.toArray(),socket:p.toArray(),axisError:1-Math.abs(new j(0,1,0).applyQuaternion(d).dot(m)),keyWorld:w.toArray()}},reset(){b=!1}}}function Ke(e){let t=document.createElement(`canvas`);t.width=e?768:1280,t.height=e?432:720;let n=t.getContext(`2d`),r=t.width,i=t.height,a=!1,s=()=>{n.fillStyle=`#0a2030`,n.fillRect(0,0,r,i),n.strokeStyle=`#9acbdf`,n.lineWidth=r*.002,n.strokeRect(r*.035,i*.06,r*.93,i*.88),n.textBaseline=`top`,n.fillStyle=`#a8cada`,n.font=`500 ${r*.026}px "IBM Plex Sans",sans-serif`,n.fillText(`SNOWY STUDIOS`,r*.075,i*.14),n.fillStyle=`#edf8ff`,n.font=`500 ${r*.102}px "IBM Plex Sans",sans-serif`,n.fillText(`LootLabs`,r*.068,i*.36),n.fillStyle=`#a6dff6`,n.fillRect(r*.075,i*.66,r*.11,i*.006),n.font=`500 ${r*.025}px "IBM Plex Sans",sans-serif`,n.fillText(`CONTINUE VIA FLOWAUTH`,r*.075,i*.76),n.fillText(`01 / GATEWAY`,r*.7,i*.76)};s();let c=new ue(t);c.colorSpace=T,c.anisotropy=4,document.fonts.load(`500 32px "IBM Plex Sans"`).then(()=>{a||(s(),c.needsUpdate=!0)},()=>{});let l=new I({color:`#c6a46e`,metalness:.75,roughness:.3}),d=new o({map:c,roughness:.48,metalness:0}),f=new de;f.name=`free-access-card`;let p=new u(new V(1.9,1.07,.025),[l,l,l,l,d,l]);return p.castShadow=!0,f.add(p),f.visible=!1,{root:f,update(e){f.visible=e>1e-4&&e<.9999,f.position.set(0,U.lerp(.4,2.04,e),.15),f.rotation.x=-.08*e},dispose(){a=!0,p.geometry.dispose(),d.dispose(),l.dispose(),c.dispose(),f.clear()}}}function qe(t){let i=t.querySelector(`.ice-scene`),s=t.dataset.geometryTrial,c=i.clientWidth>=900&&i.clientWidth/i.clientHeight>=1.25&&!r.lowPower,f=t.querySelector(`#ice-vault-canvas`),p=t.querySelector(`#ice-vault-action`),h=new AbortController,g=h.signal,_=matchMedia(`(prefers-reduced-motion: reduce)`),v=matchMedia(`(max-width:767px), (pointer:coarse)`),y=navigator.connection,x=!1,S=!0,C=!1,w=1,k=1,re,M=-1/0,N=-1/0,ie=0,P,F=!1,I=0,L=!1,z=0,se=!1,ce=!1,V=!1,le=!1,H=``,ue,fe=!1,me=!1,ge=()=>{};new Promise(e=>{ge=e});let _e=0,ve=-1,ye=NaN,be=NaN,xe=``,Te=!1,Oe=0,ke=null,Ae=0,Me=async()=>{let e=new Set,t=t=>{t instanceof ee&&t.image&&!t.isRenderTargetTexture&&!(t instanceof ae)&&e.add(t)};t(W.background),t(et),t($e),q?.startupTextures.forEach(t),W.traverse(e=>{if(e instanceof u)for(let n of Array.isArray(e.material)?e.material:[e.material])Object.values(n).forEach(t),`uniforms`in n&&Object.values(n.uniforms).forEach(e=>t(e.value))});let n=[];for(let t of e){let e=t.image;e?.decode&&n.push(e.decode().catch(()=>{}))}if(await Promise.all(n),!(x||C||!K)){for(let t of e)K.engine.initTexture(t);x||C||(i.dataset.uploadsReady=`true`,$())}},Ne,Pe=new Set,Fe=()=>{Pe.forEach(e=>{e.traverse(e=>{e instanceof u&&(e.geometry.dispose(),(Array.isArray(e.material)?e.material:[e.material]).forEach(e=>e.dispose()))}),e.clear()}),Pe.clear(),Ne?.dispose(),Ne=void 0},Ie={collect:+(t.dataset.phase===`ready`)},Re=Number(t.dataset.progress)||0,ze={phase:t.dataset.phase||`waiting`,progress:Number(t.dataset.progress)||0,remaining:Number(t.dataset.remaining)||30,keyVisible:!1,canAct:!1},W=new D;W.background=new A(getComputedStyle(t).getPropertyValue(`--melt-floor`).trim()||`#ffffff`);let G=new b(40,1,.1,500),We=new j(0,3.1,0),qe=new j(-8.004,.8,12.093);G.position.copy(We).add(qe),G.lookAt(We);let K,q,J,Je,Ye,Y,Xe,Ze,Qe,X,Z,$e,et,tt=!1,nt=!1,Q,rt,it,at,ot,st,ct=()=>!(nt&&!tt||!Q?.image||!Z?.root.userData.posterReady&&!Z?.root.userData.videoReady),lt=()=>{if(i.dataset.chestLid=String(Y?.lid??0),i.dataset.chestCard=String(Y?.card??0),i.dataset.keyInsertion=String(Y?.insertion??0),i.dataset.keyTurn=String(Y?.turn??0),Y||(delete i.dataset.keyTip,delete i.dataset.keySocket,delete i.dataset.keyAxisError),q&&(i.dataset.keyWorld=q.key.getWorldPosition(new j).toArray().join(`,`)),i.dataset.collectProgress=Ie.collect.toFixed(4),Y&&(i.dataset.chestLid=Y.lid.toFixed(4),i.dataset.chestCard=Y.card.toFixed(4),i.dataset.keyInsertion=Y.insertion.toFixed(4),i.dataset.keyTurn=Y.turn.toFixed(4),i.dataset.keyTip=Y.keyTip.join(`,`),i.dataset.keySocket=Y.socket.join(`,`),i.dataset.keyAxisError=String(Y.axisError)),i.dataset.chestReady=String(!!J),i.dataset.chestMaterialReady=String(J?.root.userData.materialReady??!1),i.dataset.chestMaterialError=String(J?.root.userData.materialError??!1),i.dataset.collecting=String(F),i.dataset.cameraPose=[...G.position.toArray(),...G.quaternion.toArray()].map(e=>e.toFixed(6)).join(`,`),i.dataset.renderCount=String(ie),i.dataset.ambientTime=I.toFixed(3),i.dataset.aurora=X?.state??`still`,i.dataset.auroraLook=`upper-local-v9`,i.dataset.auroraTexture=X?.textureVariant??`loading`,i.dataset.auroraGround=`off`,i.dataset.fire=Z?.root.userData.playing?`burning`:`still`,i.dataset.fireReady=String(Z?.root.userData.videoReady??!1),i.dataset.auroraReady=String(X?.ready??!1),i.dataset.fireVideoTime=String(Z?.video.currentTime??0),i.dataset.fireVideoDuration=String(Z?.video.duration??0),i.dataset.fireResolution=Z?[Z.video.videoWidth,Z.video.videoHeight].join(`x`):``,i.dataset.detailQuality=c?`enhanced`:`baseline`,i.dataset.auroraVideoTime=String(X?.time??0),i.dataset.meltProgress=ze.progress.toFixed(3),q){i.dataset.materialStudy=String(q.root.userData.materialStudy),i.dataset.materialReady=String(q.root.userData.materialReady);let e=q.root.userData.meltwater;i.dataset.waterArea=String(e?.area??0),i.dataset.waterVolume=String(e?.visualVolume??0),i.dataset.waterHeight=String(e?.filmHeight??0),i.dataset.waterTint=String(e?.tint??``),i.dataset.waterWetness=String(e?.wetness??0),i.dataset.waterRunoff=String(e?.runoffVisible??!1);let t=q.root.userData.meltVisual;i.dataset.iceTint=String(t?.iceTint??``),i.dataset.keyReveal=String(t?.keyReveal??0),i.dataset.glowAlpha=String(t?.glowAlpha??0),i.dataset.iceScale=String(t?.iceScale??0),i.dataset.iceOpacity=String(t?.iceOpacity??0)}K&&(i.dataset.triangles=String(K.engine.info.render.triangles),i.dataset.drawCalls=String(K.engine.info.render.calls))},ut=(e=`idle`)=>{X?.setActive(!1),Z?.pause(),re?.(),re=void 0,i.dataset.renderState=e,lt()},dt=()=>{x||C||(C=!0,L=!1,F=!1,P?.kill(),ut(`fallback`),f.hidden=!0,t.dataset.effectsPresented=`false`,t.dataset.stageFallback=`true`,t.dataset.meltStage=`fallback`,t.dataset.scenePresented=`false`,cancelAnimationFrame(z),t.dispatchEvent(new CustomEvent(`melt-key-fallback`)))},ft=()=>{if(!q||ze.phase!==`available`||C)return;q.root.updateMatrixWorld(!0),G.updateMatrixWorld(!0);let e=new oe().setFromObject(q.key),t=1/0,n=1/0,r=-1/0,i=-1/0;for(let a of[e.min.x,e.max.x])for(let o of[e.min.y,e.max.y])for(let s of[e.min.z,e.max.z]){let e=new j(a,o,s).project(G),c=(e.x*.5+.5)*w,l=(-e.y*.5+.5)*k;t=Math.min(t,c),r=Math.max(r,c),n=Math.min(n,l),i=Math.max(i,l)}let a=Math.max(44,r-t+24),o=Math.max(44,i-n+24);Object.assign(p.style,{left:`${Math.max(0,Math.min(w-a,(t+r-a)/2))}px`,top:`${Math.max(0,Math.min(k-o,(n+i-o)/2))}px`,width:`${Math.min(w,a)}px`,height:`${Math.min(k,o)}px`,borderRadius:`24px`})},pt=new j,mt=-1/0,ht=-1/0,gt=16,_t=96,vt=!0,yt=()=>{if(!Je||ze.phase!==`ready`||Ie.collect>=1&&!F&&!vt)return;vt=!1,Je.root.getWorldPosition(pt),pt.project(G);let e=i.getBoundingClientRect();i.dataset.cardOrigin=`${(e.left+(pt.x*.5+.5)*w).toFixed(1)},${(e.top+(-pt.y*.5+.5)*k).toFixed(1)}`;let t=Math.min(w<700?280:320,w-32),n=U.clamp((pt.x*.5+.5)*w,Math.min(w-t/2-16,gt+t/2),w-t/2-16),r=U.clamp((-pt.y*.5+.5)*k-18,_t,k-100);(Math.abs(n-mt)>.5||Math.abs(r-ht)>.5)&&(i.style.setProperty(`--loot-x`,`${n.toFixed(1)}px`),i.style.setProperty(`--loot-y`,`${r.toFixed(1)}px`),i.dataset.lootAnchor=`${n.toFixed(1)},${r.toFixed(1)}`,mt=n,ht=r)},bt=e=>{L?ut(e):(ue?.render(I,S,!_.matches),S||ut(e))},xt=()=>{if(x||C||!S&&se||document.hidden||!K)return;if(!q||!ce){bt(`effects-first`);return}if(!L&&ke){let e=K.engine.getContext(),t=e.clientWaitSync(ke,0,0);e.deleteSync(ke),ke=null,t===e.WAIT_FAILED?i.dataset.gpuWarmup=`frame-fallback`:(Oe++,i.dataset.gpuWarmup=`fence-complete`)}let e=_.matches&&ze.phase===`waiting`?Re:ze.progress;G.updateMatrixWorld(),X?.setCamera(G);let n=U.smoothstep(Ie.collect,.46,.72);if((e!==ye||Ie.collect!==be||ze.phase!==xe||_e!==ve)&&(vt=!0,q.update(e,n),J&&Je&&Ye&&(ze.phase===`ready`?(Y=Ye.apply(Ie.collect),J.update(Y.lid),Je.update(Y.card)):(J.update(0),Je.update(0),Y=void 0)),ye=e,be=Ie.collect,xe=ze.phase,ve=_e,Qe&&(Qe.shadow.needsUpdate=!0)),at?.update(e,n,I),Z?.setMotion(!_.matches),!ct()){bt(`loading`);return}Te||(Te=!0,Me().catch(dt));let r=String(!!Z?.root.userData.videoReady)+`:`+String(_.matches)+`:`+(ze.phase===`ready`?`open`:`ice`);if(!L&&H!==r&&(H=r,Oe=0,ke&&=(K.engine.getContext().deleteSync(ke),null)),V=!0,!V){if(!le){le=!0;let e=r;K.engine.toneMapping=K.toneMapping,K.engine.toneMappingExposure=K.toneMappingExposure,K.engine.outputColorSpace=K.outputColorSpace;let t=K.engine,n=new de,i=new de,a=new Set;W.traverse(e=>{if(!(e instanceof u)||e===q.floor||(e===q.ice||e.name===`surface-hoar`)&&!e.visible)return;let t=Array.isArray(e.material)?e.material[0]:e.material;a.has(t)||(a.add(t),i.add(e.clone(!1))),e!==q.ice&&e.name!==`surface-hoar`&&(e.name===`user-original-aurora`||e.name===`snow-terrain`||at&&e.parent===at.root)&&n.add(e.clone(!1))}),(async()=>{let e=Promise.resolve();if(Xe&&q.ice.visible){let r=t.getRenderTarget(),i=t.getActiveCubeFace(),a=t.getActiveMipmapLevel(),o=t.toneMapping;try{t.setRenderTarget(Xe),t.toneMapping=0,e=t.compileAsync(n,G,W)}finally{t.setRenderTarget(r,i,a),t.toneMapping=o}}let r=t.compileAsync(i,G,W);await Promise.all([e,r])})().then(()=>{le=!1,!(x||C)&&(V=e===String(!!Z?.root.userData.videoReady)+`:`+String(_.matches)+`:`+(ze.phase===`ready`?`open`:`ice`),$())}).catch(()=>dt())}bt(`compiling`)}else{if(X?.setActive(S&&!_.matches),X?.update(I),Z?.setMotion(!_.matches),Z?.update(I,G,S&&!_.matches),Z){let e=w<700&&J?Math.max(1,J.root.scale.x):1;Z.light.distance=14*e;let t=1+.18*Math.sin(I*6.7)+.12*Math.cos(I*11.3)+.06*Math.sin(I*23.1);Z.light.intensity=(w<700?5:c?9:14)*e*e*t}K.render(W,G),ie++,!L&&Q?.image&&q&&(L=!0,t.dataset.scenePresented=`true`,t.dataset.meltStage=`ready`,t.dataset.effectsPresented=`true`,t.dispatchEvent(new CustomEvent(`melt-key-ready`)),_.matches||Z?.loadVideo()),S?(L&&!_.matches&&Z?.loadVideo(),ft(),yt()):(se=!0,i.dataset.prewarmed=`true`,X?.setActive(!1),Z?.pause(),i.dataset.renderState=`prewarmed`,lt())}},St=e=>{if(x||C||!S||document.hidden){ut(`paused`);return}let t=r.getFrameInterval();e-M+1e-5<t||((L||me)&&!_.matches&&Number.isFinite(M)&&(I+=Math.min(e-M,.1)),M=e,xt(),e-N>.25&&(lt(),N=e),_.matches&&!F&&L&&ut())},Ct=()=>{x||C||!S||document.hidden||re||(i.dataset.renderState=`active`,M=-1/0,re=e(St))},$=()=>{x||C||Ae||(Ae=requestAnimationFrame(()=>{Ae=0,!(x||C)&&(xt(),Ct())}))},wt=e=>{let t=`/assets/realistic-winter/winter-camp-${e?`portrait-v5`:`landscape-v3`}.webp`,n=new te().load(t,e=>{x?e.dispose():(i.dataset.background=`photographic-winter`,Tt())},void 0,dt);return n.colorSpace=T,n},Tt=()=>{if(x||C||!K)return;L||(Oe=0,ke&&=(K.engine.getContext().deleteSync(ke),null)),_e++,cancelAnimationFrame(z),z=0;let e=i.getBoundingClientRect();w=Math.max(1,e.width),k=Math.max(1,e.height);let n=t.querySelector(`.ice-copy`)?.getBoundingClientRect();gt=n&&w>=900?Math.max(16,n.right-e.left+16):16,_t=n&&w>=700&&w<900?Math.min(k-100,n.bottom-e.top+100):96;let o=r.getDPR();K.setPixelRatio(o),K.setSize(w,k),K.engine.transmissionResolutionScale=r.lowPower?.5:1,i.dataset.transmissionScale=String(K.engine.transmissionResolutionScale),i.dataset.qualityDpr=String(o),i.dataset.qualityTier=r.lowPower?`mobile`:`desktop`;let s=w/k<1.25,l=w<900||s||matchMedia(`(pointer:coarse) and (max-width:1366px)`).matches,u=l&&!s&&w>=900,f=w<700;q?.setNaturalClarity(f),nt=l,f?tt=!0:nt&&!et&&(et=new te().load(`/assets/quality-v3/snow-restored.webp`,e=>{x?e.dispose():(tt=!0,Se(e,nt,w<700),i.dataset.phoneSnow=nt?`laptop-plate`:`inactive`,$())},void 0,()=>{x||(tt=!0,i.dataset.phoneSnow=`unavailable`,$())}),et.colorSpace=T),Se(et,nt,f),i.dataset.phoneSnow=nt&&et?.image?`laptop-plate`:`inactive`,X&&(X.lighting.uAuroraGroundStrength.value=0),i.dataset.auroraGround=`off`,i.dataset.campFraming=l?`close`:`laptop`,s&&!it&&(it=wt(!0)),!s&&!rt&&(rt=wt(!1));let p=s?it:rt;if(p&&p!==Q&&(Q=p,W.background=Q,at?.setBackground(Q)),Q?.image){let e=Q.image,t=e.width/e.height,n=w/k,r=w>=900&&!s,i=s?0:r?.12:.05;if(Q.repeat.set(Math.min(1,n/t)*(1-i),Math.min(1,t/n)*(1-i)),Q.offset.set((1-Q.repeat.x)/2-i/2,(1-Q.repeat.y)/2),Q.userData.closeCamp=r,Q.userData.highDetail=c&&!s,Q.userData.integratedPhone=f,l){let e=f||s?.51:.7,t=f?.88:s?.82:u?.86:.79,n=e*Q.repeat.x+Q.offset.x,r=1-((1-t)*Q.repeat.y+Q.offset.y),i=f?2.4:u?1.65:2;Q.userData.compactPit={x:n,y:r,zoom:i},Ce(n,r,i,s)}else delete Q.userData.compactPit,Ce();Q.updateMatrix(),X?.setCrop(Q,s),Z?.setComposition(Q,s)}!L||Q?.image&&X?.ready||(Oe=0,ke&&=(K.engine.getContext().deleteSync(ke),null),Te=!1,L=!1,t.dataset.scenePresented=`false`,t.dataset.meltStage=`loading`,document.dispatchEvent(new CustomEvent(`melt-key-poster-state`,{detail:ze.phase}))),G.aspect=w/k;let m=Math.max(1,1.5/G.aspect),h=We.clone();!s&&w>=900?h.addScaledVector(new j(.834,0,.552),-2.6):!s&&w>=700&&h.addScaledVector(new j(.834,0,.552),-.8);let g=qe.clone();if(s&&(h.y=4.2,g.y=-.8),G.position.copy(h).addScaledVector(g,m),G.lookAt(h),G.updateProjectionMatrix(),G.updateMatrixWorld(),q&&J&&ot&&(q.root.position.copy(ot.icePosition),q.root.scale.setScalar(ot.iceScale),J.root.position.copy(ot.chestPosition),J.root.scale.setScalar(ot.chestScale),J.root.rotation.y=-.18,q.root.rotation.y=f?.1:-.24,l)){let e=(e,t,n,r,i,o)=>{let s=new E;s.setFromCamera(new a(t*2-1,1-n*2),G);let c=s.ray.intersectPlane(new d(new j(0,1,0),.01),new j);if(c){e.position.copy(c),e.scale.setScalar(1);for(let t=0;t<2;t++){e.updateMatrixWorld(!0);let t=1/0,n=-1/0;for(let r of[-i,i])for(let i of[-o,o]){let a=new j(r,0,i).applyMatrix4(e.matrixWorld).project(G);t=Math.min(t,a.x),n=Math.max(n,a.x)}e.scale.multiplyScalar(r*2/Math.max(.001,n-t))}}};e(J.root,f?.185:s?.2:.5,f?.83:s?.81:u?.78:.8,f?.35:s?.26:u?.19:.27,1.65,.95),e(q.root,f?.83:s?.82:u?.88:.86,f?.83:s?.81:u?.78:.8,f?.28:s?.22:u?.15:.22,1,1)}if(q&&J&&ot){let e=(e,t,n,r,a)=>{let o=i.querySelector(e);if(!o)return;t.updateWorldMatrix(!0,!1);let s=1/0,c=-1/0,l=1/0,u=-1/0;for(let e of[-n,n])for(let n of[0,a])for(let i of[-r,r]){let r=new j(e,n,i).applyMatrix4(t.matrixWorld).project(G),a=(r.x*.5+.5)*w,o=(-r.y*.5+.5)*k;s=Math.min(s,a),c=Math.max(c,a),l=Math.min(l,o),u=Math.max(u,o)}Object.assign(o.style,{left:`${s}px`,top:`${l}px`,width:`${c-s}px`,height:`${u-l}px`,transform:`none`})};e(`.winter-skeleton-chest`,J.root,1.65,.95,1.25),e(`.winter-skeleton-ice`,q.root,1,1,2)}if(Z&&Q?.image){if(s){let e=f?.878:.818,t=new E;t.setFromCamera(new a(1.016-1,1-e*2),G);let n=t.ray.intersectPlane(new d(new j(0,1,0),-.025),new j);if(n){Z.root.position.copy(n),Z.mesh.position.y=.2;let e=n.clone().project(G),t=n.clone().add(new j(0,1,0)).project(G),r=(f?.138:.145)*2/Math.abs(t.y-e.y);Z.root.scale.setScalar(r),Z.setExposure(1.4)}}else{Z.mesh.position.y=.32;let e=De(!1,w>=900&&!s,Q.userData.compactPit),t=(1-(e.y+(e.originalBaseY-e.canonicalY)*e.scale)-Q.offset.y)/Q.repeat.y*2-1,n=(e.x-Q.offset.x)/Q.repeat.x*2-1,r=new E;r.setFromCamera(new a(n,t),G);let i=r.ray.intersectPlane(new d(new j(0,1,0),-.025),new j);if(i){Z.root.position.copy(i);let t=i.clone().project(G),n=i.clone().add(new j(0,1,0)).project(G),r=e.originalHeight*e.scale/Q.repeat.y*2/Math.abs(n.y-t.y);Z.root.scale.setScalar(r*1.12),Z.setExposure(1.3)}}}if(Qe&&J&&q){let e=f?Math.max(1,J.root.scale.x,q.root.scale.x):1,t=f?J.root.position.clone().add(q.root.position).multiplyScalar(.5):new j;Qe.target.position.copy(t),Qe.target.updateMatrixWorld(),Qe.position.copy(t).add(new j(-8,12,4).multiplyScalar(e));let n=Qe.shadow.camera,r=f?Math.max(3.5,J.root.position.distanceTo(q.root.position)*.5+2):15;Object.assign(n,{left:-r,right:r,top:f?r:11,bottom:f?-r:-11,near:.1,far:45*e}),n.updateProjectionMatrix(),Qe.shadow.normalBias=.008*e,Qe.shadow.needsUpdate=!0}$();let _=e=>{if(!e)return null;let t=e.getWorldPosition(new j).project(G);return[+(t.x*.5+.5).toFixed(5),+(-t.y*.5+.5).toFixed(5)]};i.dataset.layoutAnchors=JSON.stringify({ice:_(q?.root),fire:_(Z?.root),chest:_(J?.root)})};t.addEventListener(`melt-key-state`,e=>{let r=e.detail;if(!r||x)return;let i=ze.phase,a=ze.progress;ze=r,_.matches&&r.phase===`waiting`&&(i!==`waiting`||r.progress<a)&&(Re=r.progress),r.phase===`ready`&&i!==`ready`?(P?.kill(),q?.update(1,0),Ye?.begin(),F=!_.matches&&L,t.dataset.unlocking=String(F),F?P=n.to(Ie,{collect:1,duration:4.4,ease:`none`,onUpdate:Ct,onComplete:()=>{F=!1,P=void 0,t.dataset.unlocking=`false`,$(),lt(),t.dispatchEvent(new CustomEvent(`melt-key-reveal-complete`))}}):(Ie.collect=1,t.dispatchEvent(new CustomEvent(`melt-key-reveal-complete`)))):r.phase!==`ready`&&i===`ready`&&(cancelAnimationFrame(z),z=0,L=!1,V=!1,Oe=0,H=``,ke&&K&&K.engine.getContext().deleteSync(ke),ke=null,t.dataset.scenePresented=`false`,t.dataset.meltStage=`loading`,document.dispatchEvent(new CustomEvent(`melt-key-poster-state`,{detail:r.phase})),F=!1,P?.kill(),P=void 0,Ie.collect=0,Ye?.reset(),t.dataset.unlocking=`false`,Y=void 0),i===r.phase?r.phase===`waiting`&&!_.matches&&Ct():$()},{signal:g}),f.addEventListener(`webglcontextlost`,e=>{e.preventDefault(),dt()},{signal:g}),document.addEventListener(`visibilitychange`,()=>{document.hidden?(P?.pause(),ut(`paused`)):(S&&P?.resume(),$())},{signal:g}),window.addEventListener(`pageshow`,$,{signal:g}),window.addEventListener(`resize`,Tt,{passive:!0,signal:g}),v.addEventListener(`change`,Tt,{signal:g}),y?.addEventListener(`change`,Tt,{signal:g}),_.addEventListener(`change`,()=>{_.matches&&(Re=ze.progress,F=!1,P?.kill(),P=void 0,ze.phase===`ready`&&(Ie.collect=1,t.dataset.unlocking=`false`,t.dispatchEvent(new CustomEvent(`melt-key-reveal-complete`)))),$()},{signal:g});let Et=new ResizeObserver(Tt);Et.observe(i);let Dt=new IntersectionObserver(([e])=>{S=e.isIntersecting,S?(document.hidden||P?.resume(),$()):(P?.pause(),ut(`paused`))},{threshold:.01});return Dt.observe(i),(async()=>{try{$e=new te().load(`/assets/quality-v3/camp-detail.webp`,e=>{x?e.dispose():(e.colorSpace=T,we(e),$())}),$e.colorSpace=T,$e.anisotropy=8,K=new he(f,{antialias:!0}),K.toneMapping=4,K.toneMappingExposure=.95,W.background=new A(463649);let e=i.clientWidth/i.clientHeight<1.25;e?it=wt(!0):rt=wt(!1),Q=e?it:rt,W.background=Q,X=He({lowPower:r.lowPower,maxTextureSize:K.engine.capabilities.maxTextureSize,onReady:$,onError:dt,intensity:.62}),W.add(X.root),X.lighting.uAuroraGroundStrength.value=0,Z=Ue({deferVideo:!0,poster:`/assets/quality-v1/fire-hd-poster.webp`,onReady:()=>{se=!1,$()},onError:()=>{Z?.root.userData.posterError&&Z?.root.userData.videoError&&dt()}}),W.add(Z.root),st={enabled:K.engine.shadowMap.enabled,type:K.engine.shadowMap.type},K.engine.shadowMap.enabled=!0,K.engine.shadowMap.type=1;let n=new pe(7904196,1977664,.35);W.add(n);let a=new R(10927584,.55);a.position.set(-8,12,4),a.castShadow=!0,Qe=a,W.add(a.target),a.shadow.autoUpdate=!1,a.shadow.needsUpdate=!0,a.shadow.mapSize.set(r.lowPower?512:1024,r.lowPower?512:1024),Object.assign(a.shadow.camera,{left:-15,right:15,top:11,bottom:-11,near:.1,far:45}),a.shadow.radius=r.lowPower?2.25:4.5,a.shadow.bias=-15e-5,a.shadow.normalBias=.008,W.add(a);let c=new R(7903422,.26);c.position.set(4,2.8,1.5),W.add(c);let d=new R(7445451,.32);if(d.position.set(1,4,-3),W.add(d),Tt(),$(),X.lighting.uAuroraGroundStrength.value=0,i.dataset.auroraDiffuse=`off`,fe=!0,ue=Ee({surface:K,scene:W,camera:G,sky:X,fire:Z,background:()=>Q,ready:()=>fe&&(!nt||tt),hidden:()=>[q?.root,J?.root,at?.root],irradiance:()=>{},onReady:$,onError:dt,onFirst:e=>{me=!0,t.dataset.effectsPresented=`true`,i.dataset.effectsFirstFrameAt=String(performance.now()),i.dataset.effectsGpuWarmup=e,ge(),$()}}),$(),x||C||(await je(32),x||C))return;q=Le(32,3,$,dt,{highDetail:!1,naturalClarity:i.clientWidth<700,compactGeometry:!0}),W.add(q.root);let p=new j(.834,0,.552),h=new j(-.552,0,.834),g=i.clientWidth>=900&&i.clientWidth/i.clientHeight>=1.25;q.root.position.copy(p).multiplyScalar(g?-2.6+.58*Math.tan(U.degToRad(20))*(14.5*Math.max(1,1.5/(i.clientWidth/i.clientHeight))-1.2)*(i.clientWidth/i.clientHeight):4.9).addScaledVector(h,g?1.2:-5.2),q.root.scale.setScalar(g?.7:1.2),q.root.rotation.y=-.24,q.root.position.y=-.01;let _=q.floor.material.onBeforeCompile;if(q.floor.material.onBeforeCompile=(e,t)=>{_(e,t),e.fragmentShader=e.fragmentShader.replace(`return .94*(1.-.12*pow`,`return .7332*(1.-.12*pow`).replace(`vec2 iceCenter(){return vec2(0.);}`,`vec2 iceCenter(){return vec2(${q.root.position.x.toFixed(6)},${q.root.position.z.toFixed(6)});}`).replace(`.44+.56*contact`,`.44+.56*max(contact,1.-smoothstep(1.4,2.2,length(vShadowFloor-vec2(${J.root.position.x.toFixed(6)},${J.root.position.z.toFixed(6)}))))`)},q.floor.visible=!1,q.floor.material.customProgramCacheKey=()=>`snowy-chest-layout-contact-v2`,J=Be({highDetail:!1,lowPower:!0,compactGeometry:!1,onReady:$,onError:dt}),J.root.position.copy(p).multiplyScalar(g?-3.45:-1.8).addScaledVector(h,g?.8:-5.2),J.root.position.y=-.01,J.root.rotation.y=-.18,J.root.scale.setScalar(g?.9:1.08),W.add(J.root),s){let e=0,n=0;for(let t of[J.root,q.key])t.traverse(t=>{if(!(t instanceof u))return;let r=t.geometry.getAttribute(`position`).count;n+=r,e+=(t.geometry.index?.count??r)/3*(t instanceof ne?t.count:1)});t.dataset.trialPropTriangles=String(e),t.dataset.trialPropVertices=String(n)}if(x||C)return;ot={icePosition:q.root.position.clone(),iceScale:q.root.scale.x,chestPosition:J.root.position.clone(),chestScale:J.root.scale.x},at=Ve(Q,J.root,q.root,Z.root,X.lighting,void 0),W.add(at.root),Je=Ke(r.lowPower),J.root.add(Je.root),Ye=Ge(q.key,J.keySocket),ze.phase===`ready`&&(q.update(1,0),Ye.begin());let v=Ne=new B(K.engine),y=new D;Pe.add(y),y.background=new A(.035,.065,.1);for(let[e,t,n,r,i]of[[-4,4,5.5,3,1.1],[4,5,-3,2.8,.6],[-4,2.8,-5,2.4,.8]]){let a=new u(new O(r,24,16),new l({color:new A(1,.98,.95).multiplyScalar(i),toneMapped:!1}));a.position.set(e,t,n),y.add(a)}let b=new u(new m(3.5,4.5),new l({color:new A(1,.97,.88).multiplyScalar(.75),side:2,toneMapped:!1}));b.position.set(3.8,2.8,5.5),b.lookAt(0,1,0),y.add(b);let S=new u(new m(5,3),new l({color:new A(1,.87,.68).multiplyScalar(.9),side:2,toneMapped:!1}));if(S.position.set(-4,-1.8,6),S.lookAt(0,.7,0),y.add(S),x||C)return;Xe=Ze=v.fromScene(y,.055),W.environment=Xe.texture,J.root.traverse(e=>{if(e instanceof u)for(let t of Array.isArray(e.material)?e.material:[e.material])t instanceof o&&(t.envMap=Xe.texture,t.envMapIntensity=t.metalness>.5?.75:.45)}),Fe(),ce=!0,i.dataset.composition=`chest-left-fire-front-ice-right-v2`,i.dataset.chest=`walnut`,i.dataset.camera=`perspective-fixed`,i.dataset.viewAngle=`0`,i.dataset.renderer=`three-webgl`,Tt(),$()}catch(e){dt(),console.warn(`Melt key visual unavailable; native controls remain usable.`,e)}finally{Fe()}})(),()=>{x||(x=!0,Fe(),cancelAnimationFrame(z),cancelAnimationFrame(0),cancelAnimationFrame(Ae),ke&&K&&K.engine.getContext().deleteSync(ke),ke=null,F=!1,P?.kill(),ut(),h.abort(),Et.disconnect(),Dt.disconnect(),ue?.dispose(),Se(),et?.dispose(),Ce(),we(),$e?.dispose(),at?.dispose(),X?.dispose(),Z?.dispose(),rt?.dispose(),it?.dispose(),Je?.dispose(),J?.dispose(),q?.dispose(),W.traverse(e=>{e instanceof R&&e.shadow.dispose()}),W.environment=null,Xe?.dispose(),Ze?.dispose(),K&&st&&(K.engine.shadowMap.enabled=st.enabled,K.engine.shadowMap.type=st.type),K?.dispose(),W.clear())}}var K=ve,q=`snowy:free-key:melt:v1`,J=/^SNOWY-FREE-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}-\d{4}$/,Je=e=>typeof e==`number`&&Number.isSafeInteger(e)&&e>=0&&e<=864e13,Ye=(e,t)=>e.version===1&&Je(t)&&Je(e.startedAt)&&e.startedAt<=t,Y=(e,t)=>Ye(e,t)&&e.key===null&&e.unlockedAt===null,Xe=(e,t)=>Ye(e,t)&&!e.pending&&typeof e.key==`string`&&J.test(e.key)&&Je(e.unlockedAt)&&e.unlockedAt>=e.startedAt+K&&e.unlockedAt<=t&&t-e.unlockedAt<864e5;function Ze(e){if(!Je(e))throw RangeError(`A valid timestamp is required to start the melt.`);return{version:1,startedAt:e,key:null,unlockedAt:null}}function Qe(e){return{...Ze(e),pending:!0}}function X(e,t){return e.pending?Ze(t):e}function Z(e,t){let n=Xe(e,t),r=!e.pending&&(n||Y(e,t))?t-e.startedAt:0,i=Math.min(1,Math.max(0,r/K)),a=n?`ready`:i===1?`available`:`waiting`;return{phase:a,remaining:Math.max(0,Math.ceil((K-r)/1e3)),progress:i,keyVisible:a!==`waiting`,canAct:a===`available`}}function $e(e,t,n=be){if(e.pending||!Y(e,t)||t-e.startedAt<K)return e;let r=n();if(!J.test(r))throw Error(`The local pass generator returned an invalid pass.`);return{...e,key:r,unlockedAt:t}}function et(e,t){return e.key!==null&&!Xe(e,t)}function tt(e,t,n=!1){let r=()=>n?Qe(t):Ze(t);if(!Je(t)||!e)return r();try{let n=JSON.parse(e);if(!n||typeof n!=`object`||Array.isArray(n))return r();let i=n;return i.pending!==void 0&&i.pending!==!0||i.pending&&(i.key!==null||i.unlockedAt!==null)||!Y(i,t)&&!Xe(i,t)?r():{version:1,startedAt:i.startedAt,key:i.key,unlockedAt:i.unlockedAt,...i.pending?{pending:!0}:{}}}catch{return r()}}var nt=new URLSearchParams(location.search).get(`ice-study`),Q=nt&&/^[1-4]$/.test(nt)?`${q}:study:${nt}`:q,rt;function it(){rt?.(),rt=void 0,new t,_e();let a=new i,o=new AbortController,{signal:s}=o,c=document.getElementById(`key-access`),l=new URLSearchParams(location.search).get(`geometry-trial`),u=l===`compact`?`Compact geometry`:`Current geometry`,d;(l===`baseline`||l===`compact`)&&(c.dataset.geometryTrial=l,delete c.dataset.trialSceneMs,d=document.createElement(`output`),d.className=`key-geometry-trial`,d.textContent=u+` · Loading live scene…`,c.append(d)),delete c.dataset.stageFallback,delete c.dataset.meltStage;let f=c.querySelector(`#ice-vault-canvas`);if(f){if(f.dataset.renderMode){let e=f.cloneNode(!1);delete e.dataset.renderMode,e.hidden=!1,f.replaceWith(e)}else f.hidden=!1}c.dataset.scenePresented=`false`,c.dataset.effectsPresented=`false`;let p=c.querySelector(`.ice-loading-note`);p&&(p.hidden=!0);let m=document.getElementById(`ice-vault-action`);m.setAttribute(`aria-label`,`Unlock the box with the key`);let h=document.getElementById(`reset-key-btn`);document.getElementById(`lootlabs-link`);let g=c.querySelector(`.loot-reward-surface`),_=document.getElementById(`key-result`),v=document.getElementById(`key-reward-slot`),y=c.querySelector(`.ice-scene`),b=()=>{if(c.dataset.stageFallback!==`true`)return;let e=y.getBoundingClientRect(),t=c.querySelector(`.ice-copy`).getBoundingClientRect(),n=Math.min(e.width<700?280:320,e.width-32),r=e.width>=900?Math.min(e.width-n/2-16,t.right-e.left+16+n/2):0,i=e.width>=700&&e.width<900?Math.min(e.height-100,t.bottom-e.top+100):0;y.style.setProperty(`--fallback-reward-min-x`,r+`px`),y.style.setProperty(`--fallback-reward-min-y`,i+`px`)};window.addEventListener(`resize`,b,{passive:!0,signal:s}),v.appendChild(_);let x=document.getElementById(`key-countdown`),S=document.getElementById(`key-clock-unit`),C=c.querySelector(`.ice-clock-label`),w=document.getElementById(`key-progress`),T=document.getElementById(`key-status-title`),E=document.getElementById(`key-status-description`),D=document.getElementById(`key-announcement`),ee=document.getElementById(`ice-gesture`),O=matchMedia(`(prefers-reduced-motion: reduce)`),te=null;try{te=sessionStorage.getItem(Q)}catch{}let k=tt(te,Date.now(),!0),ne,re,A=!1,j=!0,M,N=!1,ie=-1/0,P=-1/0,F=-1,I,L,R,z=e=>{D.textContent=e},ae=()=>{try{sessionStorage.setItem(Q,JSON.stringify(k))}catch{}},oe=()=>{ne?.(),ne=void 0},se=(e=Z(k,Date.now()))=>{c.dispatchEvent(new CustomEvent(`melt-key-state`,{detail:e}))},ce=e=>{let t=e.phase===`ready`?N?`…`:`✓`:String(e.remaining).padStart(2,`0`),n=e.phase===`ready`?N?``:`OPEN`:`SEC`,r=e.phase===`waiting`?`MELTING`:e.phase===`available`?`KEY READY`:N?`UNLOCKING`:`VAULT OPEN`;x.textContent!==t&&(x.textContent=t),S.textContent!==n&&(S.textContent=n),C.textContent!==r&&(C.textContent=r)},B=(e=Z(k,Date.now()))=>{let t=M;M=e.phase,c.dataset.phase=M,document.dispatchEvent(new CustomEvent(`melt-key-poster-state`,{detail:M})),c.dataset.remaining=String(e.remaining),c.dataset.progress=String(e.progress),c.dataset.canAct=String(e.canAct),m.hidden=!0,m.disabled=!0,c.dataset.rewardPending=String(N),_.hidden=h.hidden=M!==`ready`||N,w.hidden=M!==`waiting`,w.value=e.progress*30,ce(e),T.textContent=M===`waiting`?`1. Wait for the ice to melt.`:M===`available`?`2. Your key is ready.`:N?`Opening the box...`:`3. Your access is ready.`,E.textContent=M===`waiting`?`The key will open the box automatically when the ice melts.`:M===`available`?`The key will unlock the box automatically.`:N?`Your key is opening the vault. Your access card will arrive here.`:`Continue through LootLabs and follow the steps to get your free key.`,ee.textContent=M===`waiting`?`Watch the ice melt. The key opens your reward automatically.`:E.textContent,t!==M&&(I?.kill(),c.dataset.phaseMotion=`idle`,n.set(g,{clearProps:`opacity,visibility,transform`}),_.inert=!1,M===`available`?z(`The key is free. The box will open automatically.`):M===`ready`&&z(N?`Opening your reward.`:`The LootLabs gateway is ready. Continue via FlowAuth to get your key.`)),se(e)},V=(e=!0)=>{if(!A&&N&&M===`ready`){if(N=!1,c.dataset.unlocking=`false`,B(),e&&!O.matches&&c.dataset.stageFallback!==`true`){I?.kill(),c.dataset.phaseMotion=`active`;let e=_.getBoundingClientRect(),t=(y.dataset.cardOrigin??``).split(`,`).map(Number),r=t.length===2&&t.every(Number.isFinite);_.inert=!0,I=n.timeline({onComplete:()=>{c.dataset.phaseMotion=`idle`,_.inert=!1}}).fromTo(g,{opacity:.2,transformOrigin:`50% 50%`,x:r?t[0]-e.left-e.width/2:0,y:r?t[1]-e.top-e.height/2:22,scale:r?.25:.86},{opacity:1,x:0,y:0,scale:1,duration:1.1,ease:`power3.inOut`,clearProps:`opacity,transform,transformOrigin`})}z(`Your box is open. Your LootLabs access card is in the panel.`)}};c.addEventListener(`melt-key-reveal-complete`,()=>V(),{signal:s});let le=()=>{R&&clearTimeout(R);let e=()=>{if(A||!k.key||k.unlockedAt===null)return;let t=k.unlockedAt+ye-Date.now();t>0?R=setTimeout(e,t):(fe(),z(`Your previous key has expired. A new cube is melting.`))};k.key&&k.unlockedAt!==null&&(R=setTimeout(e,Math.max(0,k.unlockedAt+ye-Date.now())))},H=(e=0)=>{if(A)return;if(et(k,Date.now())){fe(),z(`Your previous key has expired. A new cube is melting.`);return}let t=Z(k,Date.now());t.phase===`available`&&j&&!document.hidden&&pe()?me():(t.phase!==M&&(B(t),t.phase!==`waiting`&&oe()),ce(t),t.remaining!==F&&(F=t.remaining,c.dataset.remaining=String(t.remaining),t.phase===`waiting`&&t.remaining>0&&t.remaining%10==0&&z(`${t.remaining} seconds until your key is free.`)),(e===0||e-P>=.1||t.progress===1)&&(w.value=t.progress*30,c.dataset.progress=String(t.progress),P=e),se(t))},ue=()=>{k.pending||ne||document.hidden||!j||Z(k,Date.now()).phase!==`waiting`||(ie=-1/0,ne=e(e=>{let t=O.matches?.25:r.getFrameInterval();e-ie+1e-4<t||(ie=e,H(e))}))},de=()=>{if(L&&clearTimeout(L),k.pending)return;let e=()=>{if(A||k.key)return;let t=k.startedAt+K-Date.now();t>0?L=setTimeout(e,Math.max(1,t)):H()};Z(k,Date.now()).phase===`waiting`&&(L=setTimeout(e,Math.max(1,k.startedAt+K-Date.now())))};function U(){!A&&k.pending&&!document.hidden&&j&&(k=X(k,Date.now()),F=-1,P=ie=-1/0,ae(),B(),H(),ue(),de())}function fe(){let e=document.activeElement===h;if(oe(),L&&clearTimeout(L),R&&clearTimeout(R),I?.kill(),N=!1,c.dataset.unlocking=`false`,k=Qe(Date.now()),F=-1,P=ie=-1/0,ae(),B(),H(),ue(),de(),U(),z(`A fresh cube. Your 30-second melt has started.`),e){let e=document.getElementById(`ice-title`);e.setAttribute(`tabindex`,`-1`),e.focus({preventScroll:!0})}}function pe(){return!A&&!document.hidden&&j&&(c.dataset.scenePresented===`true`||c.dataset.stageFallback===`true`)}function me(){if(!pe())return;let e=$e(k,Date.now());e!==k&&(N=!O.matches&&c.dataset.meltStage===`ready`&&c.dataset.stageFallback!==`true`,k=e,ae(),B(),oe(),le())}h.addEventListener(`click`,fe,{signal:s});let he=()=>{U(),H(),ue(),de(),le()};document.addEventListener(`visibilitychange`,()=>{document.hidden?(oe(),I?.pause()):(j&&I?.resume(),he())},{signal:s}),window.addEventListener(`pageshow`,he,{signal:s}),O.addEventListener(`change`,()=>{O.matches&&(I?.kill(),c.dataset.phaseMotion=`idle`,n.set(g,{clearProps:`opacity,visibility,transform`}),_.inert=!1,V(!1)),H()},{signal:s});let ge=new IntersectionObserver(([e])=>{j=e.isIntersecting,j?(document.hidden||I?.resume(),U(),H(),ue()):(oe(),I?.pause())},{threshold:.01});ge.observe(c);let ve=document.getElementById(`key-menu-toggle`),be=document.getElementById(`key-sign-in`),xe=document.querySelector(`#key-sign-in-dialog`);be?.addEventListener(`click`,()=>xe?.showModal(),{signal:s});let Se=document.getElementById(`key-mobile-menu`),Ce=(e=!1)=>{Se&&ve&&(Se.hidden=!0,ve.setAttribute(`aria-expanded`,`false`),e&&ve.focus())};ve?.addEventListener(`click`,()=>{if(!Se)return;let e=Se.hidden;Se.hidden=!e,ve.setAttribute(`aria-expanded`,String(e))},{signal:s}),Se?.addEventListener(`click`,e=>{e.target.closest(`a`)&&Ce()},{signal:s}),document.addEventListener(`keydown`,e=>{e.key===`Escape`&&Se&&!Se.hidden&&Ce(!0)},{signal:s});let we=matchMedia(`(min-width:961px)`);we.addEventListener(`change`,()=>{we.matches&&Ce()},{signal:s});let Te=document.getElementById(`site-header`),Ee=({scroll:e})=>Te?.classList.toggle(`scrolled`,e>40);a.instance.on(`scroll`,Ee),Ee({scroll:window.scrollY});let De=()=>{if(A)return;c.dataset.stageFallback=`true`,c.dataset.meltStage=`fallback`,c.dataset.scenePresented=`false`,d&&!c.dataset.trialSceneMs&&(d.textContent=u+` · Live scene unavailable`),U(),b(),document.dispatchEvent(new CustomEvent(`melt-key-poster-state`,{detail:M}));let e=document.getElementById(`ice-vault-canvas`);e&&(e.hidden=!0),N?V(!1):se()};c.addEventListener(`melt-key-ready`,()=>{if(c.dataset.meltStage=`ready`,d&&!c.dataset.trialSceneMs){let e=Math.round(performance.now());c.dataset.trialSceneMs=String(e),d.textContent=u+` · Live scene `+(e/1e3).toFixed(1)+` s`}U(),H(),se()},{signal:s}),c.addEventListener(`melt-key-fallback`,De,{signal:s}),ae(),B(),H(),ue(),de(),le();let Oe=!1;(()=>{if(!(Oe||A||c.dataset.stageFallback===`true`)){Oe=!0;try{re=qe(c),se()}catch{De()}}})(),rt=()=>{A||(A=!0,I?.kill(),oe(),o.abort(),ge.disconnect(),re?.(),d?.remove(),L&&clearTimeout(L),R&&clearTimeout(R),a.instance.off(`scroll`,Ee),a.destroy())},window.addEventListener(`pagehide`,e=>{e.persisted||rt?.()},{signal:s})}var at=new AbortController;document.readyState===`loading`?document.addEventListener(`DOMContentLoaded`,it,{once:!0,signal:at.signal}):it();