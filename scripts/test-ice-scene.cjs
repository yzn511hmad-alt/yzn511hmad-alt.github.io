const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const base=process.argv[2]||'http://127.0.0.1:5178',out=path.join(__dirname,'../work/ice-scene-checks');fs.mkdirSync(out,{recursive:true});
const report={date:new Date().toISOString(),base,cases:[]};
const sharp=require('sharp');
const pngImages=new Map();
const hash=b=>{const h=crypto.createHash('sha256').update(b).digest('hex');pngImages.set(h,b);return h;};
async function renderedDelta(a,b){
 if(a===b)return{changedChannels:0,maxDelta:0};
 const x=await sharp(pngImages.get(a)).raw().toBuffer({resolveWithObject:true}),y=await sharp(pngImages.get(b)).raw().toBuffer({resolveWithObject:true});assert.deepEqual(y.info,x.info);
 let changedChannels=0,maxDelta=0;for(let i=0;i<x.data.length;i++){const d=Math.abs(x.data[i]-y.data[i]);if(d){changedChannels++;maxDelta=Math.max(maxDelta,d);}}
 return{changedChannels,maxDelta};
}
function instrument(){
 window.__iceQA={draws:0,resizes:0,webgl:0};
 const get=HTMLCanvasElement.prototype.getContext;
 HTMLCanvasElement.prototype.getContext=function(type,...args){if(/webgl/.test(type))window.__iceQA.webgl++;return get.call(this,type,...args)};
 for(const method of ['drawImage','clearRect','fillRect']){const original=CanvasRenderingContext2D.prototype[method];CanvasRenderingContext2D.prototype[method]=function(...args){if(this.canvas.closest('#key-access'))window.__iceQA.draws++;return original.apply(this,args)}}
 for(const name of ['width','height']){const descriptor=Object.getOwnPropertyDescriptor(HTMLCanvasElement.prototype,name);Object.defineProperty(HTMLCanvasElement.prototype,name,{...descriptor,set(v){if(this.closest('#key-access')&&descriptor.get.call(this)!==v)window.__iceQA.resizes++;return descriptor.set.call(this,v)}});}
}
async function open(browser,options={},seed=false){
 const context=await browser.newContext({viewport:{width:1517,height:693},deviceScaleFactor:1,permissions:['clipboard-read','clipboard-write'],...options});
 await context.addInitScript(instrument);
 if(seed)await context.addInitScript(()=>{if(!sessionStorage.getItem('snowy:free-key:v2'))sessionStorage.setItem('snowy:free-key:v2',JSON.stringify({version:2,startedAt:Date.now()-31000,strikes:0,openedAt:null,key:null,unlockedAt:null}));});
 const page=await context.newPage(),diagnostics={errors:[],bad:[],assets:[]};
 page.on('pageerror',e=>diagnostics.errors.push(e.message));page.on('request',r=>diagnostics.assets.push(r.url()));page.on('response',r=>{if(r.url().startsWith(base)&&r.status()>=400)diagnostics.bad.push({url:r.url(),status:r.status()});});
 await page.goto(base+'/free-key.html',{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);
 await page.waitForFunction(()=>document.querySelector('#ice-scene')?.dataset.assets==='ready');await idle(page);
 return{page,context,diagnostics};
}
const saved=p=>p.evaluate(()=>JSON.parse(sessionStorage.getItem('snowy:free-key:v2')));
const phase=(p,value)=>p.waitForFunction(value=>document.querySelector('#key-access')?.dataset.phase===value,value);
const action=p=>p.locator('#ice-vault-action');
async function idle(p){await p.waitForFunction(()=>document.querySelector('#ice-scene')?.dataset.renderState==='idle'&&document.querySelector('#key-access')?.dataset.phaseMotion!=='active');await p.waitForTimeout(150);}
async function noKey(p){assert.equal(await p.locator('#key-result').isVisible(),false);assert.equal((await p.locator('#generated-key-display').textContent()).trim(),'');}
async function visual(p){
 const style='.ice-hammer { visibility: hidden !important; }';
 const readback=await p.locator('#ice-vault-canvas').evaluate(c=>{const ctx=c.getContext('2d'),a=ctx.getImageData(0,0,c.width,c.height).data,b=ctx.getImageData(0,0,c.width,c.height).data;let h1=2166136261,h2=2166136261,differences=0,maxDelta=0;for(let i=0;i<a.length;i++){h1=Math.imul(h1^a[i],16777619);h2=Math.imul(h2^b[i],16777619);if(a[i]!==b[i]){differences++;maxDelta=Math.max(maxDelta,Math.abs(a[i]-b[i]));}}return{width:c.width,height:c.height,first:h1>>>0,immediateRepeat:h2>>>0,differences,maxDelta};});
 return{canvasRect:await p.locator('#ice-vault-canvas').boundingBox(),scene:hash(await p.locator('#ice-scene').screenshot({style})),canvas:{width:readback.width,height:readback.height,hash:hash(await p.locator('#ice-vault-canvas').screenshot({style}))},readback};
}
async function pointerStability(p,name){
 await idle(p);await p.mouse.move(5,5);await idle(p);
 const first=await visual(p),before=await p.evaluate(()=>({...window.__iceQA})),scene=await p.locator('#ice-scene').boundingBox();
 for(const [x,y]of [[.08,.18],[.88,.18],[.88,.8],[.12,.8],[.5,.45]])await p.mouse.move(scene.x+scene.width*x,scene.y+scene.height*y,{steps:12});
 await p.waitForTimeout(900);const second=await visual(p),after=await p.evaluate(()=>({...window.__iceQA}));
 console.log(name,JSON.stringify({first,second,before,after}));
 assert.equal(second.canvas.width,first.canvas.width);assert.equal(second.canvas.height,first.canvas.height);
 const sceneDelta=await renderedDelta(first.scene,second.scene);
 // The full-width photographic backdrop can be recomposited by Edge at a
 // slightly different precision: a 12-shot no-input reduced-motion control
 // measured 76,444 changed channels at maxDelta 3. Compare actual canvas readbacks exactly, plus fixed canvas/scene geometry
 // and zero application draws; PNG captures include the backdrop compositor.
 const canvasDelta=await renderedDelta(first.canvas.hash,second.canvas.hash);
 const finalBounds=await p.locator('#ice-scene').boundingBox();
 assert.deepEqual(finalBounds,scene,'Pointer moved the scene');
 assert.equal(second.readback.immediateRepeat,first.readback.immediateRepeat,'Pointer changed actual canvas pixels');
 assert.deepEqual(second.canvasRect,first.canvasRect,'Pointer moved or transformed the canvas');
 assert.ok(canvasDelta.maxDelta<=3,'Canvas compositor exceeded the measured static color precision: '+JSON.stringify(canvasDelta));
 assert.ok(sceneDelta.maxDelta<=3,'Composed scene exceeded the measured no-input color precision: '+JSON.stringify(sceneDelta));
 assert.equal(after.draws-before.draws,0,'Pointer movement woke the canvas');assert.equal(after.resizes-before.resizes,0,'Pointer movement resized canvas');
 await p.screenshot({path:path.join(out,name+'.png')});
 return{sceneHash:first.scene,sceneHashAfter:second.scene,sceneDelta,canvas:first.canvas,canvasAfter:second.canvas,rawReadbackControl:first.readback,pointerDraws:after.draws-before.draws,pointerResizes:after.resizes-before.resizes};
}
async function hit(p,mode='mouse'){
 await action(p).scrollIntoViewIfNeeded();const rect=await action(p).boundingBox();assert.ok(rect);
 if(mode==='touch')await p.touchscreen.tap(rect.x+rect.width*.5,rect.y+rect.height*.5);
 else if(mode==='keyboard'){await action(p).focus();await p.keyboard.press('Enter');}
 else await action(p).click({position:{x:rect.width*.52,y:rect.height*.52}});
}
async function allHits(p,mode='mouse'){for(let i=0;i<5;i++){await hit(p,mode);if(i<4)await p.waitForTimeout(310);}await phase(p,'opened');await noKey(p);assert.equal((await saved(p)).key,null);await p.waitForFunction(()=>!document.getElementById('ice-vault-action').disabled);}
async function common(p,diagnostics){assert.deepEqual(diagnostics.errors,[]);assert.deepEqual(diagnostics.bad,[]);assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,'Horizontal overflow');assert.equal(await p.evaluate(()=>window.__iceQA.webgl),0);assert.equal(diagnostics.assets.some(x=>/AuroraFlow-|\/assets\/atmosphere\//.test(x)),false);}
async function run(name,fn){if(process.argv[3]&&process.argv[3]!==name)return;const result={name};try{await fn(result);result.passed=true;console.log('passed',name);}catch(e){result.passed=false;result.failure=e.stack||String(e);console.log('FAILED',name,e.message);}report.cases.push(result);}
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});try{
 await run('real-wait-static-pointer-full-flow',async r=>{
  const {page:p,context,diagnostics}=await open(browser);try{
   await phase(p,'waiting');const startedAt=(await saved(p)).startedAt;
   r.waiting=await pointerStability(p,'laptop-waiting');await noKey(p);assert.equal(await action(p).isDisabled(),true);
   await p.locator('#key-access').evaluate(e=>{e.dispatchEvent(new CustomEvent('ice-vault-strike'));e.dispatchEvent(new CustomEvent('ice-vault-extract'));});assert.equal((await saved(p)).strikes,0);await noKey(p);
   await p.reload({waitUntil:'networkidle'});assert.equal((await saved(p)).startedAt,startedAt);
   const elapsed=await p.evaluate(start=>Date.now()-start,startedAt);await p.waitForTimeout(Math.max(0,28300-elapsed));assert.equal(await p.locator('#key-access').getAttribute('data-phase'),'waiting');await noKey(p);
   await phase(p,'breakable');r.realUnlockMs=await p.evaluate(start=>Date.now()-start,startedAt);assert.ok(r.realUnlockMs>=30000&&r.realUnlockMs<34500);
   r.breakable=await pointerStability(p,'laptop-breakable');await action(p).hover();assert.equal(await p.locator('.ice-hammer').evaluate(e=>getComputedStyle(e).opacity),'1');const pos1=await p.locator('.ice-hammer').evaluate(e=>e.style.transform);const a=await action(p).boundingBox();await p.mouse.move(a.x+a.width*.6,a.y+a.height*.6);const pos2=await p.locator('.ice-hammer').evaluate(e=>e.style.transform);assert.notEqual(pos1,pos2);r.hammerTracks=true;
   for(let i=0;i<2;i++){await hit(p);await p.waitForTimeout(310);}await p.waitForTimeout(900);r.cracked=await pointerStability(p,'laptop-cracked');assert.equal((await saved(p)).strikes,2);await p.reload({waitUntil:'networkidle'});assert.equal((await saved(p)).strikes,2);
   for(let i=0;i<3;i++){await hit(p);if(i<2)await p.waitForTimeout(310);}await phase(p,'opened');await noKey(p);await p.locator('#key-access').evaluate(e=>e.dispatchEvent(new CustomEvent('ice-vault-extract')));await noKey(p);
   await p.waitForTimeout(2100);r.opened=await pointerStability(p,'laptop-opened');await hit(p);await phase(p,'ready');const key=await p.locator('#generated-key-display').textContent();assert.match(key,/^SNOWY-FREE-[A-Z2-9]{4}-[A-Z2-9]{4}-\d{4}$/);await p.locator('#copy-key-btn').click();assert.equal(await p.evaluate(()=>navigator.clipboard.readText()),key);r.copy=true;
   await p.waitForTimeout(1200);await p.screenshot({path:path.join(out,'laptop-ready.png')});await p.reload({waitUntil:'networkidle'});await phase(p,'ready');assert.equal(await p.locator('#generated-key-display').textContent(),key);r.readyReload=true;
   await p.locator('#reset-key-btn').click();await phase(p,'waiting');await noKey(p);assert.equal((await saved(p)).strikes,0);await idle(p);r.reset=await pointerStability(p,'laptop-reset');await common(p,diagnostics);r.diagnostics=diagnostics;
  }finally{await context.close();}
 });
 for(const viewport of [{width:390,height:844},{width:320,height:740},{width:820,height:1180}])await run('touch-'+viewport.width,async r=>{
  const {page:p,context,diagnostics}=await open(browser,{viewport,deviceScaleFactor:3,isMobile:true,hasTouch:true},true);try{
   await phase(p,'breakable');await p.screenshot({path:path.join(out,'touch-'+viewport.width+'-cube.png')});await allHits(p,'touch');await p.waitForTimeout(150);await hit(p,'touch');await phase(p,'ready');await p.waitForTimeout(1000);await p.screenshot({path:path.join(out,'touch-'+viewport.width+'-ready.png')});await common(p,diagnostics);r.diagnostics=diagnostics;
  }finally{await context.close();}
 });
 await run('keyboard-reduced',async r=>{
  const {page:p,context,diagnostics}=await open(browser,{reducedMotion:'reduce'},true);try{
   await phase(p,'breakable');r.pointer=await pointerStability(p,'reduced-cube');await action(p).hover();const a=await action(p).boundingBox();const before=await p.locator('.ice-hammer').evaluate(e=>e.style.transform);await p.mouse.move(a.x+a.width*.65,a.y+a.height*.6);assert.notEqual(await p.locator('.ice-hammer').evaluate(e=>e.style.transform),before);r.reducedHammerTracks=true;
   await allHits(p,'keyboard');assert.equal(await p.evaluate(()=>document.activeElement?.id),'ice-vault-action');await p.keyboard.press('Enter');await phase(p,'ready');assert.equal(await p.evaluate(()=>document.activeElement?.id),'copy-key-btn');await common(p,diagnostics);r.diagnostics=diagnostics;
  }finally{await context.close();}
 });
 report.passed=report.cases.every(x=>x.passed);fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(report,null,2));console.log('PASS',report.passed);if(!report.passed)process.exitCode=1;
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});
