const {chromium}=require('playwright');const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');
const base=process.argv[2]||'http://127.0.0.1:5178';const out=path.join(__dirname,'../work/aurora-auto-checks');fs.mkdirSync(out,{recursive:true});
// Readback/GL instrumentation is test-only. The application never reads GPU pixels.
function instrument({lowCPU,saveData,noGPU}){
 try{localStorage.setItem('snowy:aurora-motion','off');}catch{/* Optional storage is unavailable on opaque origins. */}
 Object.defineProperty(navigator,'hardwareConcurrency',{configurable:true,get:()=>lowCPU?2:8});
 const connection=new EventTarget();connection.saveData=!!saveData;Object.defineProperty(navigator,'connection',{configurable:true,get:()=>connection});
 window.__gpu={contexts:0,draws:0,resizes:0,copies:0,samples:[],sampleNext:false};const seen=new WeakSet();
 for(const prop of ['width','height']){const d=Object.getOwnPropertyDescriptor(HTMLCanvasElement.prototype,prop);Object.defineProperty(HTMLCanvasElement.prototype,prop,{...d,set(v){if(d.get.call(this)!==v)window.__gpu.resizes++;return d.set.call(this,v)}});}
 const get=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){
  if(noGPU&&/webgl/.test(type))return null;const gl=get.call(this,type,...args);
  if(gl&&/webgl/.test(type)&&!seen.has(gl)){
   seen.add(gl);window.__gpu.contexts++;window.__gl=gl;let previousPixels;
   for(const method of ['drawArrays','drawElements']){const draw=gl[method].bind(gl);gl[method]=function(...a){const result=draw(...a);window.__gpu.draws++;
    if(window.__gpu.sampleNext){window.__gpu.sampleNext=false;const w=gl.drawingBufferWidth,h=gl.drawingBufferHeight,data=new Uint8Array(w*h*4);gl.readPixels(0,0,w,h,gl.RGBA,gl.UNSIGNED_BYTE,data);
     let hash=2166136261,coverage=0;for(let i=0;i<data.length;i+=32){if(data[i+3]>4){coverage++;for(let k=0;k<4;k++)hash=Math.imul(hash^data[i+k],16777619);}}
     const rect=this.canvas.getBoundingClientRect(),portrait=matchMedia('(orientation:portrait)').matches;
     const sky=this.canvas.closest('[data-polar-world]').querySelector('.polar-layer--sky').getBoundingClientRect();
     const skyAspect=portrait?941/1672:1672/941,sw=Math.max(sky.width,sky.height*skyAspect),sh=sw/skyAspect;
     const moonX=sky.right-sw*(1-(portrait?.856:.842)),moonY=sky.top+(sky.height-sh)*(portrait?1:.5)+sh*(portrait?.46:.381);
     const alpha=(clientX,clientY)=>{const x=Math.round((clientX-rect.left)/rect.width*w),y=Math.round((rect.bottom-clientY)/rect.height*h);if(x<7||x>w-8||y<7||y>h-8)return null;let max=0;for(let yy=y-6;yy<=y+6;yy++)for(let xx=x-6;xx<=x+6;xx++)max=Math.max(max,data[(yy*w+xx)*4+3]);return max;};
     // Check the whole photographed moon, not only its center or the global light bottom.
     const moonRadius=sw*(portrait?.058:.033);let discPixels=0,discCovered=0,discMax=0;
     const discLeft=Math.max(0,Math.floor((moonX-moonRadius-rect.left)/rect.width*w)),discRight=Math.min(w-1,Math.ceil((moonX+moonRadius-rect.left)/rect.width*w));
     const discBottom=Math.max(0,Math.floor((rect.bottom-moonY-moonRadius)/rect.height*h)),discTop=Math.min(h-1,Math.ceil((rect.bottom-moonY+moonRadius)/rect.height*h));
     for(let yy=discBottom;yy<=discTop;yy++)for(let xx=discLeft;xx<=discRight;xx++){
      const cx=rect.left+(xx+.5)/w*rect.width,cy=rect.bottom-(yy+.5)/h*rect.height;
      if(Math.hypot(cx-moonX,cy-moonY)>moonRadius)continue;
      const value=data[(yy*w+xx)*4+3];discPixels++;if(value>0)discCovered++;discMax=Math.max(discMax,value);
     }
     const moonDisc={x:moonX,y:moonY,radius:moonRadius,pixels:discPixels,maxAlpha:discMax,coveredFraction:discCovered/Math.max(1,discPixels)};
     let lightBottom=-Infinity;for(let i=3;i<data.length;i+=32)if(data[i]>4)lightBottom=Math.max(lightBottom,rect.bottom-Math.floor(i/4/w)/h*rect.height);
     let visibleMotion=null;const headerBottom=document.querySelector('header').getBoundingClientRect().bottom;
     if(previousPixels&&previousPixels.length===data.length){let total=0,changed=0,difference=0;for(let y=0;y<h;y+=2){const cy=rect.bottom-y/h*rect.height;if(cy<headerBottom+4||cy>innerHeight*.45)continue;for(let x=0;x<w;x+=2){const i=(y*w+x)*4;if(Math.max(data[i+3],previousPixels[i+3])<12)continue;const delta=(Math.abs(data[i]-previousPixels[i])+Math.abs(data[i+1]-previousPixels[i+1])+Math.abs(data[i+2]-previousPixels[i+2])+Math.abs(data[i+3]-previousPixels[i+3]))/4;total++;difference+=delta;if(delta>=12)changed++;}}visibleMotion={pixels:total,meanDelta:difference/Math.max(1,total),changedFraction:changed/Math.max(1,total)};}previousPixels=data;
     window.__gpu.samples.push({visibleMotion,hash:hash>>>0,coverage,width:w,height:h,moonAlpha:alpha(moonX,moonY),moonDisc,mountainAlpha:alpha(innerWidth*.5,innerHeight*.88),moonY,lightBottom,viewportHeight:innerHeight,at:performance.now()});
    }return result;}.bind(gl);}
  }return gl;
 };
 const copy=CanvasRenderingContext2D.prototype.drawImage;CanvasRenderingContext2D.prototype.drawImage=function(...a){window.__gpu.copies++;return copy.apply(this,a)};
}
const state=p=>p.locator('[data-polar-world]').getAttribute('data-aurora-state');
const waitState=(p,s)=>p.waitForFunction(s=>document.querySelector('[data-polar-world]')?.dataset.auroraState===s,s,{timeout:20000});
const camera=p=>p.locator('[data-depth]').evaluateAll(a=>a.map(e=>({depth:+e.dataset.depth,classes:e.className,transform:e.style.transform,x:new DOMMatrix(getComputedStyle(e).transform).m41,y:new DOMMatrix(getComputedStyle(e).transform).m42})));
const idle=async p=>{await p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));await p.waitForFunction(()=>['idle','paused'].includes(document.querySelector('[data-polar-world]').dataset.parallaxState));await p.waitForTimeout(150);};
const counters=p=>p.evaluate(()=>({...window.__gpu,at:performance.now(),samples:undefined}));
const sample=async p=>{const n=await p.evaluate(()=>{window.__gpu.sampleNext=true;return window.__gpu.samples.length});await p.waitForFunction(n=>window.__gpu.samples.length>n,n);return p.evaluate(()=>window.__gpu.samples.at(-1));};
async function suspended(p){await p.waitForTimeout(150);const first=await counters(p);await p.waitForTimeout(550);const last=await counters(p);assert.equal(last.draws,first.draws,'Suspended GPU drew another frame');return true;}
// Observe an actual native media event before checking the application's response.
// emulateMedia resolves after CDP acknowledgement, before MQL delivery on some Edge runs.
async function setReducedMotion(p,value){
 const expected=value==='reduce';
 const initial=await p.evaluate(expected=>{
  window.__testMotionProbe?.dispose();
  const query=matchMedia('(prefers-reduced-motion: reduce)');
  const probe={query,initial:query.matches,delivered:false,eventMatches:null,expected,dispose:null};
  const listener=event=>{probe.delivered=true;probe.eventMatches=event.matches;};
  probe.dispose=()=>query.removeEventListener('change',listener);
  query.addEventListener('change',listener,{once:true});window.__testMotionProbe=probe;
  return probe.initial;
 },expected);
 assert.notEqual(initial,expected,'Media helper requires a real preference transition');
 try{
  await p.emulateMedia({reducedMotion:value});
  await p.screenshot(); // Force a rendered frame without dispatching application events.
  await p.waitForFunction(expected=>window.__testMotionProbe.delivered&&window.__testMotionProbe.eventMatches===expected&&window.__testMotionProbe.query.matches===expected,expected,{timeout:20000});
  return await p.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>{const probe=window.__testMotionProbe;resolve({initial:probe.initial,nativeEventDelivered:probe.delivered,matches:probe.query.matches});}))));
 }finally{await p.evaluate(()=>{window.__testMotionProbe?.dispose();delete window.__testMotionProbe;});}
}
const configs=[
 {name:'desktop',file:'contact',viewport:{width:1440,height:1000}},
 {name:'laptop',file:'contact',viewport:{width:1920,height:1080},deviceScaleFactor:1.5},
 {name:'mobile',file:'contact',viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:3},
 {name:'mobile-contact',file:'contact',viewport:{width:390,height:844},isMobile:true,hasTouch:true},
 {name:'tablet',file:'contact',viewport:{width:820,height:1180},isMobile:true,hasTouch:true},
 {name:'short-desktop',file:'contact',viewport:{width:1517,height:700}},
 {name:'reduced',file:'contact',viewport:{width:1440,height:1000},reducedMotion:'reduce'},
 {name:'reduced-contact',file:'contact',viewport:{width:390,height:844},reducedMotion:'reduce'},
 {name:'save-data',file:'contact',viewport:{width:1440,height:1000},saveData:true},
 {name:'low-cpu',file:'contact',viewport:{width:1440,height:1000},lowCPU:true},
 {name:'no-webgl',file:'contact',viewport:{width:1440,height:1000},noGPU:true},
 {name:'lifecycle',file:'contact',viewport:{width:1440,height:1000}},
];
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});const report={date:new Date().toISOString(),base,cases:[],scope:[]};try{
 for(const c of configs.filter(c=>!process.argv[3]||c.name===process.argv[3])){const {name,file,saveData,lowCPU,noGPU,...options}=c;const ctx=await browser.newContext(options);await ctx.addInitScript(instrument,{saveData,lowCPU,noGPU});const p=await ctx.newPage();const r={name,page:file,stage:'initial',errors:[],bad:[],shaderErrors:[]};const loads=[];p.on('pageerror',e=>r.errors.push(e.message));p.on('request',q=>loads.push(q.url()));p.on('response',q=>{if(q.url().startsWith(base)&&q.status()>=400)r.bad.push(q.url())});p.on('console',m=>{if(m.type()==='error'&&/Shader|GL_INVALID|VALIDATE_STATUS/.test(m.text()))r.shaderErrors.push(m.text())});
 try{
  await p.goto(`${base}/${file}.html`,{waitUntil:'networkidle'});await idle(p);
  const blocked=!!(saveData||c.reducedMotion);await waitState(p,noGPU?'fallback':blocked?'static':'flowing');
  assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));assert.equal(await p.locator('footer').evaluate(e=>getComputedStyle(e).backgroundColor),'rgb(7, 17, 29)');assert.equal(await p.locator('.polar-moon,.polar-layer--moon').count(),0);assert.equal(await p.locator('[data-aurora-toggle],.aurora-toggle').count(),0,'Aurora controls must be removed');r.noMotionControl=true;r.obsoletePausePreferenceIgnored=!blocked&&!noGPU;
  r.art=await p.locator('.aurora-flow').evaluate(async e=>{const css=getComputedStyle(e),url=css.backgroundImage.match(/url\(["']?([^"')]+)["']?\)/)[1],img=new Image();img.src=url;await img.decode();return{url,width:img.naturalWidth,height:img.naturalHeight}});
  assert.ok(/aurora-master-(960|1920|3840)\.webp/.test(r.art.url));assert.ok(r.art.width>r.art.height,'One full-width ribbon is used on all sizes');
  r.sky=await p.locator('.polar-layer--sky').evaluate(async e=>{const url=getComputedStyle(e).backgroundImage.match(/url\(["']?([^"')]+)["']?\)/)[1],img=new Image();img.src=url;await img.decode();return{url,width:img.naturalWidth,height:img.naturalHeight}});assert.equal(r.sky.height>r.sky.width,c.viewport.height>=c.viewport.width);
  if(blocked||noGPU){assert.equal((await counters(p)).contexts,0);r.static=true;assert.equal(await p.locator('canvas').count(),0);if(!noGPU)assert.equal(loads.some(x=>/AuroraFlow-|vendor-three/.test(x)),false,'Static quality must not download Three.js');}
  else{
   assert.equal(await p.locator('canvas[data-aurora-surface]').count(),1);assert.equal(await p.locator('canvas').getAttribute('data-render-mode'),'direct');
   const firstCamera=await camera(p),first=await sample(p);await p.waitForTimeout(2200);const second=await sample(p);assert.notEqual(first.hash,second.hash,'Aurora pixels did not deform');assert.ok(first.coverage>100);assert.ok(first.moonAlpha===null||first.moonAlpha===0,'Moon is below/clear of the animated surface');assert.ok(first.mountainAlpha===null||first.mountainAlpha===0);assert.ok(second.moonAlpha===null||second.moonAlpha===0);assert.ok(first.lightBottom<first.viewportHeight*.45,'Aurora must stay at the top');for(const pixels of [first,second]){assert.ok(pixels.moonDisc.pixels>0,'Moon-disc ROI must contain sampled pixels');assert.equal(pixels.moonDisc.maxAlpha,0,'Animated light overlaps the photographed moon disc');assert.equal(pixels.moonDisc.coveredFraction,0,'Photographed moon disc must stay fully clear');}assert.deepEqual(await camera(p),firstCamera,'Resting camera should not drift while light flows');r.pixelSamples=[first,second];assert.ok(second.visibleMotion.meanDelta>5,'Visible light changes too little to perceive');assert.ok(second.visibleMotion.changedFraction>.25,'Too little of the visible light moves');
   const before=await counters(p),beforeScale=await p.locator('[data-polar-world]').getAttribute('data-aurora-scale');await p.waitForTimeout(1050);const after=await counters(p),afterScale=await p.locator('[data-polar-world]').getAttribute('data-aurora-scale');r.steadyQuality={beforeScale,afterScale,bufferResizes:after.resizes-before.resizes};r.measuredFPS=(after.draws-before.draws)*1000/(after.at-before.at);assert.ok(r.measuredFPS>0&&r.measuredFPS<=((c.isMobile||lowCPU)?21.5:31.5),`Unexpected draw cadence: ${r.measuredFPS}`);if(beforeScale===afterScale)assert.equal(after.resizes,before.resizes,'Unchanged automatic quality reallocates buffers');else assert.ok(after.resizes-before.resizes<=2,'Automatic quality churned during a one-second window');assert.equal(after.copies,0,'Native renderer must avoid GPU-to-2D copies');assert.equal(after.contexts,1);const lowTier=!!(c.isMobile||lowCPU);r.physicalCaps={width:lowTier?1440:3840,height:lowTier?1000:1440,pixels:lowTier?900000:3200000};assert.ok(second.width<=r.physicalCaps.width&&second.height<=r.physicalCaps.height,'Aurora physical buffer exceeded quality caps');assert.ok(second.width*second.height<=r.physicalCaps.pixels+r.physicalCaps.width+r.physicalCaps.height,'Aurora full surface exceeded the rounded pixel budget');assert.equal(await p.locator('[data-polar-world]').getAttribute('data-aurora-quality'),'auto');
   if(!c.isMobile){await p.mouse.move(80,130);await idle(p);const left=await camera(p);await p.mouse.move(c.viewport.width-80,c.viewport.height-120);await idle(p);const right=await camera(p);r.pointer=right.map((e,i)=>({depth:e.depth,dx:Math.abs(e.x-left[i].x)}));assert.ok(r.pointer.find(x=>x.depth===.58).dx>20);}
   const start=await camera(p);await p.evaluate(()=>scrollTo(0,500));await idle(p);assert.ok((await camera(p)).some((e,i)=>Math.abs(e.y-start[i].y)>1));await p.evaluate(()=>scrollTo(0,0));await idle(p);
   await p.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'))});await waitState(p,'paused');r.hidden=await suspended(p);await p.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'))});await waitState(p,'flowing');
  }
  if(name==='lifecycle'){
   r.stage='dynamic-reduced';
   r.nativeMotionEvents=[await setReducedMotion(p,'reduce')];await waitState(p,'static');assert.equal(await p.locator('canvas').evaluate(e=>getComputedStyle(e).visibility),'hidden');r.dynamicReduced=await suspended(p);r.nativeMotionEvents.push(await setReducedMotion(p,'no-preference'));await waitState(p,'flowing');
   r.stage='dynamic-save-data';await p.evaluate(()=>{navigator.connection.saveData=true;navigator.connection.dispatchEvent(new Event('change'))});await waitState(p,'static');r.dynamicSaveData=await suspended(p);await p.evaluate(()=>{navigator.connection.saveData=false;navigator.connection.dispatchEvent(new Event('change'))});await waitState(p,'flowing');
   r.stage='orientation';await p.setViewportSize({width:390,height:844});await p.waitForTimeout(600);await waitState(p,'flowing');assert.match(await p.locator('.polar-layer--sky').evaluate(e=>getComputedStyle(e).backgroundImage),/portrait/);r.orientationSample=await sample(p);assert.ok(r.orientationSample.lightBottom<r.orientationSample.viewportHeight*.45);assert.equal(r.orientationSample.moonDisc.maxAlpha,0,'Moon disc must stay clear after orientation change');r.orientation=true;await p.setViewportSize({width:1440,height:650});await p.waitForTimeout(600);await waitState(p,'flowing');
   r.stage='offscreen';await p.evaluate(()=>scrollTo(0,document.querySelector('footer').offsetTop+30));await waitState(p,'paused');r.offscreen=await suspended(p);await p.evaluate(()=>scrollTo(0,0));await waitState(p,'flowing');
   r.stage='context-loss';const lost=await p.evaluate(()=>{window.__loss=window.__gl.getExtension('WEBGL_lose_context');window.__loss?.loseContext();return!!window.__loss});assert.ok(lost);await waitState(p,'fallback');r.contextLoss=await suspended(p);await p.evaluate(()=>window.__loss.restoreContext());await waitState(p,'flowing');await sample(p);r.contextRestored=true;
   await p.evaluate(()=>{window.dispatchEvent(new PageTransitionEvent('pagehide',{persisted:true}));window.dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true}))});await waitState(p,'flowing');r.persistedPage=true;await p.setViewportSize(c.viewport);await p.waitForTimeout(400);
  }
  if(name==='save-data'){await p.evaluate(()=>{navigator.connection.saveData=false;navigator.connection.dispatchEvent(new Event('change'))});await waitState(p,'flowing');assert.equal((await counters(p)).contexts,1);r.qualityResume=true;}
  await p.screenshot({path:path.join(out,`natural-${name}.png`)});assert.deepEqual(r.errors,[]);assert.deepEqual(r.bad,[]);assert.deepEqual(r.shaderErrors,[]);r.passed=true;
 }catch(e){r.passed=false;r.failure=e.message;r.failureState=await state(p).catch(()=>null);r.environment=await p.evaluate(()=>({reduced:matchMedia('(prefers-reduced-motion: reduce)').matches,hidden:document.hidden,saveData:navigator.connection?.saveData,paused:document.documentElement.dataset.polarPaused,mode:document.documentElement.dataset.auroraMotion})).catch(()=>null);await p.screenshot({path:path.join(out,`failed-${name}.png`)}).catch(()=>{})}
 report.cases.push(r);console.log(r.passed?'passed':'FAILED',name,r.failure||'');await ctx.close();
 }
 for(const file of ['index','scripts','pricing','free-key']){const p=await browser.newPage();const loads=[];p.on('request',q=>loads.push(q.url()));await p.goto(`${base}/${file}.html`,{waitUntil:'networkidle'});assert.equal(await p.locator('[data-polar-world]').count(),0);assert.equal(loads.some(x=>/\/assets\/atmosphere\/|AuroraFlow-/.test(x)),false);report.scope.push({page:file,noAtmosphere:true});await p.close();}
 report.passed=report.cases.every(c=>c.passed);fs.writeFileSync(path.join(out,'natural-aurora-results.json'),JSON.stringify(report,null,2));console.log('PASS',report.passed);if(!report.passed)process.exitCode=1;
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
