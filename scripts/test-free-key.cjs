const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const base=process.argv[2]||'http://127.0.0.1:5178',out=path.join(__dirname,'../work/ice-vault-checks'),root=path.resolve(__dirname,'..'),storageKey='snowy:free-key:v2';
fs.mkdirSync(out,{recursive:true});
const report={date:new Date().toISOString(),base,cases:[]};
const keyPattern=/^SNOWY-FREE-[A-Z2-9]{4}-[A-Z2-9]{4}-\d{4}$/;
function instrument(){
 window.__iceQA={webgl:0,canvasDraws:0,canvasResizes:0};
 const get=HTMLCanvasElement.prototype.getContext;
 HTMLCanvasElement.prototype.getContext=function(type,...args){if(/webgl/.test(type))window.__iceQA.webgl++;return get.call(this,type,...args)};
 for(const method of ['drawImage','clearRect']){const original=CanvasRenderingContext2D.prototype[method];CanvasRenderingContext2D.prototype[method]=function(...args){if(this.canvas.closest('#key-access'))window.__iceQA.canvasDraws++;return original.apply(this,args)}}
 for(const name of ['width','height']){const descriptor=Object.getOwnPropertyDescriptor(HTMLCanvasElement.prototype,name);Object.defineProperty(HTMLCanvasElement.prototype,name,{...descriptor,set(v){if(this.closest('#key-access')&&descriptor.get.call(this)!==v)window.__iceQA.canvasResizes++;return descriptor.set.call(this,v)}});}
}
const phase=p=>p.locator('#key-access').getAttribute('data-phase');
const waitPhase=(p,value)=>p.waitForFunction(value=>document.querySelector('#key-access')?.dataset.phase===value,value,{timeout:12000});
const saved=p=>p.evaluate(k=>JSON.parse(sessionStorage.getItem(k)),storageKey);
const action=p=>p.locator('#ice-vault-action');
async function noKey(p){assert.equal(await p.locator('#key-result').isVisible(),false);assert.equal((await p.locator('#generated-key-display').textContent()).trim(),'');}
async function nativeHits(p,count,mode='mouse'){
 for(let i=0;i<count;i++){
  if(mode==='keyboard'){await action(p).focus();await p.keyboard.press('Enter');}
  else if(mode==='touch'){const rect=await action(p).boundingBox();assert.ok(rect);await p.touchscreen.tap(rect.x+rect.width*.5,rect.y+rect.height*.5);}
  else await action(p).click({position:{x:Math.max(2,(await action(p).boundingBox()).width*(.38+(i%3)*.11)),y:Math.max(2,(await action(p).boundingBox()).height*(.37+(i%2)*.2))}});
  if(i<count-1)await p.waitForTimeout(310);
 }
}
async function extract(p,mode='mouse'){
 await action(p).waitFor({state:'visible'});await p.waitForFunction(()=>!document.getElementById('ice-vault-action').disabled);await p.waitForTimeout(100);
 if(mode==='keyboard'){await action(p).focus();await p.keyboard.press('Enter');}
 else if(mode==='touch'){const r=await action(p).boundingBox();await p.touchscreen.tap(r.x+r.width*.5,r.y+r.height*.5);}
 else await action(p).click();await waitPhase(p,'ready');
}
function initSeed({payload,blockedStorage,clock}){
 if(payload&&!sessionStorage.getItem('ice-qa-do-not-seed')){const now=Date.now();const data={version:2,startedAt:now-31000,strikes:0,key:null,unlockedAt:null,openedAt:null,...payload};for(const field of ['startedAt','unlockedAt','openedAt'])if(typeof data[field]==='string')data[field]=now+Number(data[field]);sessionStorage.setItem('snowy:free-key:v2',JSON.stringify(data));sessionStorage.setItem('ice-qa-do-not-seed','1');}
 if(blockedStorage)Object.defineProperty(window,'sessionStorage',{configurable:true,get(){throw new DOMException('Storage disabled','SecurityError')}});
 if(clock){const original=Date.now;window.__iceClockOffset=0;Date.now=()=>original()+window.__iceClockOffset;}
}
async function open(browser,options={},seed={}){
 const ctx=await browser.newContext({viewport:{width:1517,height:693},deviceScaleFactor:1,permissions:['clipboard-read','clipboard-write'],...options});
 await ctx.addInitScript(instrument);await ctx.addInitScript(initSeed,seed);const p=await ctx.newPage(),item={errors:[],bad:[],loads:[]};
 p.on('pageerror',e=>item.errors.push(e.message));p.on('request',r=>item.loads.push(r.url()));p.on('response',r=>{if(r.url().startsWith(base)&&r.status()>=400)item.bad.push({url:r.url(),status:r.status()})});
 if(seed.blockIceImage)await p.route('**/assets/ice-vault/cube-room*.webp',route=>route.abort());
 await p.goto(base+'/free-key.html',{waitUntil:'networkidle'});await p.evaluate(()=>document.fonts.ready);await p.waitForFunction(()=>document.querySelector('#ice-scene')?.dataset.assets==='ready'||document.getElementById('key-access')?.dataset.stageFallback==='true',{},{timeout:15000});return{ctx,p,item};
}
async function common(p,item){
 assert.equal(await p.locator('[data-polar-world]').count(),0,'Free Key still mounts aurora world');assert.equal(await p.evaluate(()=>window.__iceQA.webgl),0,'Free Key must not allocate WebGL');
 assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,'Horizontal overflow');
 assert.equal(item.loads.some(x=>/AuroraFlow-|\/assets\/atmosphere\//.test(x)),false,'Free Key downloads prior aurora assets');
 assert.deepEqual(item.errors,[]);assert.deepEqual(item.bad,[]);
}
async function runCase(name,fn){if(process.argv[3]&&process.argv[3]!==name)return;const item={name};try{await fn(item);item.passed=true;console.log('passed',name);}catch(e){item.passed=false;item.failure=e.stack||String(e);console.log('FAILED',name,e.message);}report.cases.push(item);}
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});try{
 await runCase('real-30s-mouse-reload-copy-reset',async r=>{
  const {ctx,p,item}=await open(browser);try{
   assert.equal(await phase(p),'waiting');await noKey(p);assert.equal(await action(p).isDisabled(),true);r.startedAt=(await saved(p)).startedAt;
   await p.locator('#key-access').evaluate(e=>{e.dispatchEvent(new CustomEvent('ice-vault-strike',{detail:{x:.5,y:.5}}));e.dispatchEvent(new CustomEvent('ice-vault-extract'))});
   assert.equal((await saved(p)).strikes,0);await noKey(p);await p.screenshot({path:path.join(out,'laptop-waiting.png')});
   await p.waitForTimeout(7000);await p.reload({waitUntil:'networkidle'});assert.equal((await saved(p)).startedAt,r.startedAt);assert.equal(await phase(p),'waiting');r.partialReload=true;
   const elapsed=await p.evaluate(start=>Date.now()-start,r.startedAt);await p.waitForTimeout(Math.max(0,28200-elapsed));
   r.preDeadlineElapsed=await p.evaluate(start=>Date.now()-start,r.startedAt);assert.ok(r.preDeadlineElapsed<30000);assert.equal(await phase(p),'waiting');await noKey(p);assert.equal((await saved(p)).strikes,0);
   await waitPhase(p,'breakable');r.realElapsed=await p.evaluate(start=>Date.now()-start,r.startedAt);assert.ok(r.realElapsed>=30000&&r.realElapsed<34500);await noKey(p);assert.equal((await saved(p)).key,null);await p.mouse.move(5,5);await action(p).hover();assert.equal(await p.locator('.ice-hammer').evaluate(e=>getComputedStyle(e).opacity),'1');r.hammerCursor=true;
   await nativeHits(p,2);assert.equal((await saved(p)).strikes,2);await p.locator('#key-access').evaluate(e=>e.dispatchEvent(new CustomEvent('ice-vault-extract')));await noKey(p);await p.screenshot({path:path.join(out,'laptop-cracked.png')});
   await p.reload({waitUntil:'networkidle'});assert.equal(await phase(p),'breakable');assert.equal((await saved(p)).strikes,2);r.crackReload=true;
   await nativeHits(p,3);await waitPhase(p,'opened');await noKey(p);assert.equal((await saved(p)).key,null);
   await p.locator('#key-access').evaluate(e=>e.dispatchEvent(new CustomEvent('ice-vault-extract')));await noKey(p);r.settleGuard=true;
   await p.waitForTimeout(1000);await p.screenshot({path:path.join(out,'laptop-opened.png')});await extract(p);r.key=await p.locator('#generated-key-display').textContent();assert.match(r.key,keyPattern);
   await p.locator('#copy-key-btn').click();assert.equal(await p.evaluate(()=>navigator.clipboard.readText()),r.key);r.copy=true;
   await p.locator('#key-access').evaluate(e=>{e.dispatchEvent(new CustomEvent('ice-vault-extract'));e.dispatchEvent(new CustomEvent('ice-vault-strike'));});assert.equal((await saved(p)).key,r.key);r.completedReplayIgnored=true;
   await p.waitForTimeout(1200);await p.screenshot({path:path.join(out,'laptop-ready.png')});await p.reload({waitUntil:'networkidle'});await waitPhase(p,'ready');assert.equal(await p.locator('#generated-key-display').textContent(),r.key);r.readyReload=true;
   await p.waitForTimeout(4500);const first=await p.evaluate(()=>({...window.__iceQA}));await p.waitForTimeout(900);const last=await p.evaluate(()=>({...window.__iceQA}));r.restingDraws=last.canvasDraws-first.canvasDraws;r.restingResizes=last.canvasResizes-first.canvasResizes;assert.equal(r.restingDraws,0,'Settled visual keeps repainting');assert.equal(r.restingResizes,0);
   await p.locator('#reset-key-btn').click();await waitPhase(p,'waiting');await noKey(p);assert.equal((await saved(p)).strikes,0);r.reset=true;await common(p,item);r.diagnostics=item;
  }finally{await ctx.close();}
 });
 await runCase('phone-touch-extraction',async r=>{
  const {ctx,p,item}=await open(browser,{viewport:{width:390,height:844},deviceScaleFactor:3,isMobile:true,hasTouch:true},{payload:{}});try{
   await waitPhase(p,'breakable');await p.screenshot({path:path.join(out,'phone-breakable.png')});await nativeHits(p,5,'touch');await waitPhase(p,'opened');await noKey(p);await extract(p,'touch');assert.match(await p.locator('#generated-key-display').textContent(),keyPattern);await p.waitForTimeout(1200);await p.screenshot({path:path.join(out,'phone-ready.png')});await common(p,item);r.diagnostics=item;
  }finally{await ctx.close();}
 });
 await runCase('keyboard-reduced-motion',async r=>{
  const {ctx,p,item}=await open(browser,{reducedMotion:'reduce'},{payload:{}});try{await waitPhase(p,'breakable');await action(p).focus();await p.keyboard.down('Enter');await p.locator('#key-access').evaluate(e=>{e.dispatchEvent(new CustomEvent('ice-vault-strike'));e.dispatchEvent(new CustomEvent('ice-vault-strike'));});assert.equal((await saved(p)).strikes,1,'Burst repeated strike bypasses cooldown');r.burstGuard=true;await p.waitForTimeout(310);await p.keyboard.down('Enter');await p.waitForTimeout(310);await p.keyboard.down('Enter');await p.keyboard.up('Enter');assert.equal((await saved(p)).strikes,1,'Held Enter repeats must not count as distinct strikes');r.heldKeyGuard=true;await nativeHits(p,4,'keyboard');await waitPhase(p,'opened');await p.waitForFunction(()=>!document.getElementById('ice-vault-action').disabled);assert.equal(await p.evaluate(()=>document.activeElement?.id),'ice-vault-action','Keyboard focus was lost after final strike');r.focusRestoredAfterSettle=true;await p.keyboard.press('Enter');await waitPhase(p,'ready');await p.screenshot({path:path.join(out,'reduced-ready.png')});await common(p,item);r.diagnostics=item;}finally{await ctx.close();}
 });
 await runCase('legacy-ready-migration',async r=>{
  const key='SNOWY-FREE-ABCD-EFGH-2026';const {ctx,p,item}=await open(browser,{}, {payload:{version:1,startedAt:'-60000',key,unlockedAt:'-30000'}});try{await waitPhase(p,'ready');assert.equal(await p.locator('#generated-key-display').textContent(),key);const data=await saved(p);assert.equal(data.version,2);assert.equal(data.strikes,5);await p.addInitScript(()=>{sessionStorage.setItem('ice-qa-do-not-seed','1')});await p.evaluate(()=>sessionStorage.setItem('ice-qa-do-not-seed','1'));await p.reload({waitUntil:'networkidle'});await waitPhase(p,'ready');assert.equal(await p.locator('#generated-key-display').textContent(),key);assert.equal((await saved(p)).version,2);r.migratedReload=true;await common(p,item);r.diagnostics=item;}finally{await ctx.close();}
 });
 await runCase('legacy-waiting-migration',async r=>{
  const {ctx,p,item}=await open(browser,{}, {payload:{version:1,startedAt:'-20000',key:null,unlockedAt:null},clock:true});try{await waitPhase(p,'waiting');await noKey(p);const previous=await saved(p);assert.equal(previous.version,2);assert.equal(previous.strikes,0);r.preservedStart=previous.startedAt;await p.evaluate(()=>window.__iceClockOffset=11000);await waitPhase(p,'breakable');assert.equal((await saved(p)).startedAt,r.preservedStart);await noKey(p);await common(p,item);r.diagnostics=item;}finally{await ctx.close();}
 });
 await runCase('expired-pass-restarts-wait',async r=>{
  const {ctx,p,item}=await open(browser,{}, {payload:{startedAt:'-90060000',strikes:5,key:'SNOWY-FREE-ABCD-EFGH-2026',unlockedAt:'-90030000',openedAt:'-90030000'}});try{await waitPhase(p,'waiting');await noKey(p);assert.equal((await saved(p)).strikes,0);await common(p,item);r.diagnostics=item;}finally{await ctx.close();}
 });
 await runCase('storage-blocked-in-memory',async r=>{
  const {ctx,p,item}=await open(browser,{}, {blockedStorage:true,clock:true});try{await waitPhase(p,'waiting');await p.evaluate(()=>window.__iceClockOffset=31000);await waitPhase(p,'breakable');await nativeHits(p,5);await waitPhase(p,'opened');await extract(p);assert.match(await p.locator('#generated-key-display').textContent(),keyPattern);await p.evaluate(()=>window.__iceClockOffset+=86400001);await p.locator('#copy-key-btn').click();await waitPhase(p,'waiting');await noKey(p);r.liveExpiryBlocksCopy=true;await common(p,item);r.diagnostics=item;}finally{await ctx.close();}
 });
 await runCase('contact-preserved',async r=>{
  // Contact visual dependencies are independently hash-checked during the design change.
  const ctx=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});try{const p=await ctx.newPage();await p.goto(base+'/contact.html',{waitUntil:'networkidle'});assert.equal(await p.locator('[data-polar-world]').count(),1);assert.equal(await p.locator('#ice-vault-action').count(),0);await p.screenshot({path:path.join(out,'contact-unchanged.png')});r.contactRoutePreserved=true;}finally{await ctx.close();}
 });
 await runCase('image-fallback-narrow-phone',async r=>{
  const {ctx,p,item}=await open(browser,{viewport:{width:320,height:740},isMobile:true,hasTouch:true},{payload:{},blockIceImage:true});try{
   await p.waitForFunction(()=>document.getElementById('key-access').dataset.stageFallback==='true');
   await waitPhase(p,'breakable');await noKey(p);assert.equal(await p.locator('#ice-vault-canvas').isVisible(),false);
   await nativeHits(p,5,'touch');await waitPhase(p,'opened');await p.waitForFunction(()=>!document.getElementById('ice-vault-action').disabled);
   assert.equal(await action(p).innerText(),'Lift the key');await extract(p,'touch');assert.match(await p.locator('#generated-key-display').textContent(),keyPattern);await common(p,item);r.narrowFallback=true;
  }finally{await ctx.close();}
 });
 report.passed=report.cases.every(c=>c.passed);fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(report,null,2));console.log('PASS',report.passed);if(!report.passed)process.exitCode=1;
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});
