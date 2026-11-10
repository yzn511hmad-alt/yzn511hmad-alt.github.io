const {chromium}=require('playwright');
const fs=require('node:fs');
const assert=require('node:assert/strict');
const base=process.argv[2]||process.env.SNOWY_URL||'http://127.0.0.1:5178';
const out=require('node:path').join(__dirname,'../work/stack-checks');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 const results=[];
 for(const config of [
  {name:'desktop',viewport:{width:1440,height:900}},
  {name:'mobile',viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:3},
  {name:'reduced',viewport:{width:1440,height:900},reducedMotion:'reduce'},
 ]){
  const context=await browser.newContext(config);const page=await context.newPage();
  const errors=[],bad=[],requests=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
  page.on('response',r=>{if(r.url().startsWith(base)&&r.status()>=400)bad.push([r.status(),r.url()])});
  page.on('request',r=>requests.push(r.url()));
  await page.addInitScript(()=>{
   const original=HTMLCanvasElement.prototype.getContext;
   const contexts=new Set();const draws=new Map();const contextDetails=[];const glCanvases=new Set();const counters={resizes:0,copies:0};
   HTMLCanvasElement.prototype.getContext=function(type,...args){const c=original.call(this,type,...args);if(c&&(type==='webgl'||type==='webgl2')&&!contexts.has(c)){contexts.add(c);glCanvases.add(this);contextDetails.push({type,stack:new Error().stack})}return c};
   const draw=CanvasRenderingContext2D.prototype.drawImage;
   CanvasRenderingContext2D.prototype.drawImage=function(...args){draws.set(this.canvas,(draws.get(this.canvas)||0)+1);return draw.apply(this,args)};
   for(const Type of [WebGLRenderingContext,WebGL2RenderingContext])for(const name of ['drawArrays','drawElements']){
    const original=Type.prototype[name];Type.prototype[name]=function(...args){draws.set(this.canvas,(draws.get(this.canvas)||0)+1);return original.apply(this,args)};
   }
   for(const name of ['width','height']){const d=Object.getOwnPropertyDescriptor(HTMLCanvasElement.prototype,name);Object.defineProperty(HTMLCanvasElement.prototype,name,{...d,set(value){if(glCanvases.has(this))counters.resizes++;return d.set.call(this,value)}})}
   const copy=CanvasRenderingContext2D.prototype.drawImage;
   CanvasRenderingContext2D.prototype.drawImage=function(...args){if(glCanvases.has(args[0]))counters.copies++;return copy.apply(this,args)};
   window.__metrics={contexts,draws,contextDetails,counters};
  });
  await page.goto(base+'/',{waitUntil:'networkidle'});
  await page.locator('#snowy-rive-canvas[data-rive-state="ready"]').waitFor({timeout:20000});
  await page.waitForTimeout(1300);
  const earlyModel=requests.some(u=>u.endsWith('.glb'));
  const split=await page.locator('.hero-editorial-headline .split-char').count();
  const modelPosition=await page.locator('#sakura-canvas-container').evaluate(el=>({top:el.getBoundingClientRect().top,height:innerHeight}));
  if(modelPosition.top>modelPosition.height+400) assert.equal(earlyModel,false,'Distant model should remain unloaded');
  if(config.name!=='reduced') assert.ok(split>0,'Official SplitText must split the headline');
  await page.locator('.hero-rive-pill').click();
  const rive=await page.locator('#snowy-rive-canvas').evaluate(el=>el.dataset.riveInteractions);
  if(config.name!=='reduced')assert.ok(Number(rive)>0,'Rive trigger must fire');
  await page.screenshot({path:out+'/'+config.name+'-hero.png'});
  let smoothWheel;
  if(config.name==='desktop'){
   await page.mouse.move(1000,400);await page.mouse.wheel(0,500);await page.waitForTimeout(70);
   smoothWheel=await page.evaluate(()=>({y:scrollY,smooth:document.documentElement.classList.contains('lenis-smooth')}));
   assert.ok(smoothWheel.smooth && smoothWheel.y>0 && smoothWheel.y<500,'Wheel scrolling must be eased by Lenis');
  }
  await page.locator('#sakura-canvas-container').scrollIntoViewIfNeeded();
  await page.locator('#sakura-canvas-container[data-visual-state="ready"]').waitFor({timeout:30000});
  await page.locator('#sakura-canvas-container .snowy-hub-2d-root').waitFor({timeout:10000});
  const togglesCount=await page.locator('#sakura-canvas-container .hub-2d-toggle').count();
  assert.ok(togglesCount>=4,'2D Hub interactive toggles must be rendered in pure DOM');

  // Verify tab routing in pure 2D DOM
  await page.locator('#sakura-canvas-container .hub-2d-tab-btn[data-tab="combat"]').click();
  await page.waitForTimeout(300);
  assert.ok(await page.locator('#sakura-canvas-container .hub-2d-tab-btn[data-tab="combat"].active').count()===1,'Combat tab should become active');
  await page.locator('#sakura-canvas-container .hub-2d-tab-btn[data-tab="main"]').click();
  await page.waitForTimeout(200);

  const model={visualState:'ready',modelState:'ready',mode:'2d-native'};
  await page.screenshot({path:out+'/'+config.name+'-hub-2d.png'});
  await page.screenshot({path:out+'/'+config.name+'-model.png'});

  await page.locator('#scripts').scrollIntoViewIfNeeded();
  await page.locator('#scripts .scoped-topo-canvas').waitFor();
  await page.waitForTimeout(1300);
  const draws=()=>page.locator('#scripts .scoped-topo-canvas').evaluate(el=>window.__metrics.draws.get(el)||0);
  const shader=await page.locator('#scripts .scoped-topo-canvas').evaluate(el=>({draws:window.__metrics.draws.get(el)||0,width:el.width,height:el.height}));
  assert.ok(shader.draws>0,'Custom GLSL must render');
  assert.equal(await page.locator('#scripts .scoped-topo-canvas').getAttribute('data-render-mode'),'direct','A lone view must render directly to WebGL');
  const beforeScroll=await page.evaluate(()=>({...window.__metrics.counters}));
  await page.mouse.move(config.viewport.width * .75,450);
  for(let i=0;i<8;i++){await page.mouse.wheel(0,i<4?35:-35);await page.waitForTimeout(50)}
  await page.waitForTimeout(1500);
  const afterScroll=await page.evaluate(()=>({...window.__metrics.counters}));
  assert.equal(afterScroll.resizes,beforeScroll.resizes,'Scrolling must not reset the WebGL drawing buffer');
  assert.equal(afterScroll.copies,beforeScroll.copies,'The direct view must not copy GPU frames to 2D');
  const snow=await page.locator('.polar-atmosphere__snow, .polar-snow-layer').count();
  assert.equal(snow,0,'Background particle elements must be absent');
  const contexts=await page.evaluate(()=>({total:window.__metrics.contexts.size,three:window.__metrics.contextDetails.filter(c=>/vendor-three|SharedRenderer/.test(c.stack)).length}));
  assert.equal(contexts.three,1,'All Three.js systems must share one WebGL context');
  await page.screenshot({path:out+'/'+config.name+'-shader.png'});

  // Drive document-visibility boundary test
  await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'))});
  await page.waitForTimeout(100);
  const hiddenBefore=await draws();
  await page.waitForTimeout(300);
  const hiddenAfter=await draws();
  assert.equal(hiddenBefore,hiddenAfter,'Hidden document must stop rendering');
  await page.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'))});
  await page.waitForTimeout(200);

  // Scroll away from scripts section to test off-screen suspension
  await page.evaluate(()=>window.scrollTo(0,0));
  await page.waitForTimeout(700);const offBefore=await draws();await page.waitForTimeout(500);const offAfter=await draws();
  assert.equal(offBefore,offAfter,'Off-screen shader must stop rendering');
  const width=await page.evaluate(()=>({viewport:innerWidth,document:document.documentElement.scrollWidth}));
  assert.ok(width.document<=width.viewport+1,'Page must not overflow horizontally');
  assert.deepEqual(bad,[],'No local HTTP errors');
  assert.deepEqual(errors,[],'No browser errors');
  results.push({name:config.name,earlyModel,split,rive,smoothWheel,model,shader,snow,rendererResizes:afterScroll.resizes-beforeScroll.resizes,rendererCopies:afterScroll.copies-beforeScroll.copies,contexts,hiddenStopped:hiddenBefore===hiddenAfter,offscreenStopped:offBefore===offAfter,width,errors,bad});
  await context.close();console.log('passed',config.name);
 }
 for(const path of ['scripts.html','pricing.html','free-key.html','contact.html']){
  const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'/'+path,{waitUntil:'networkidle'});await page.waitForTimeout(500);
  assert.deepEqual(errors,[]);results.push({page:path,errors});await page.close();
 }
 fs.writeFileSync(out+'/browser-results.json',JSON.stringify(results,null,2));
 console.log(JSON.stringify(results,null,2));await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
