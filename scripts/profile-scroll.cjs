const { chromium }=require('playwright');
const fs=require('node:fs');
const label=process.argv[2]||'baseline';
const base=process.argv[3]||'http://127.0.0.1:5178';
const settings=process.argv[4]||'desktop';
const mode=process.argv[5]||'normal';
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 try {
 const page=await browser.newPage({viewport:settings==='mobile'?{width:390,height:844}:{width:1440,height:900},deviceScaleFactor:settings==='mobile'?3:1});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{
  const metrics=window.__profile={resizes:0,copies:0,copyMs:0,copyMax:0,frames:[],longTasks:[],active:false};
  const contexts=new Set();
  const get=HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext=function(type,...args){const c=get.call(this,type,...args);if(c&&(type==='webgl'||type==='webgl2'))contexts.add(this);return c};
  for(const key of ['width','height']){const d=Object.getOwnPropertyDescriptor(HTMLCanvasElement.prototype,key);
   Object.defineProperty(HTMLCanvasElement.prototype,key,{...d,set(value){if(metrics.active&&contexts.has(this))metrics.resizes++;return d.set.call(this,value)}});
  }
  const copy=CanvasRenderingContext2D.prototype.drawImage;
  CanvasRenderingContext2D.prototype.drawImage=function(...args){const t=performance.now();const r=copy.apply(this,args);if(metrics.active&&args[0]instanceof HTMLCanvasElement&&contexts.has(args[0])){const d=performance.now()-t;metrics.copies++;metrics.copyMs+=d;metrics.copyMax=Math.max(metrics.copyMax,d)}return r};
  new PerformanceObserver(list=>{if(metrics.active)metrics.longTasks.push(...list.getEntries().map(e=>e.duration))}).observe({type:'longtask',buffered:false});
  let last=0;function frame(t){if(metrics.active&&last)metrics.frames.push(t-last);last=metrics.active?t:0;requestAnimationFrame(frame)}requestAnimationFrame(frame);
 });
 await page.goto(base,{waitUntil:'networkidle'});
 await page.locator('#sakura-canvas-container').scrollIntoViewIfNeeded();
 await page.locator('#sakura-canvas-container[data-visual-state="ready"]').waitFor({timeout:30000});
 await page.locator('#scripts').scrollIntoViewIfNeeded();await page.waitForTimeout(1500);
 const cdp=await page.context().newCDPSession(page);await cdp.send('Performance.enable');
 const results=[];
 for(const zone of (mode==='normal'?['hero','model','overlap','shader']:['hero','shader'])){
  await page.waitForTimeout(1600);
  await page.evaluate(zone=>{
   const model=document.querySelector('#how-it-works');const shader=document.querySelector('#scripts');
   const modelTop=model.getBoundingClientRect().top+scrollY;const shaderTop=shader.getBoundingClientRect().top+scrollY;
   const y=zone==='hero'?0:zone==='model'?modelTop+160:zone==='overlap'?shaderTop-innerHeight*.55:shaderTop+120;
   window.scrollTo(0,y);
  },zone);
  await page.waitForTimeout(1400);
  console.log('sampling',zone,await page.evaluate(()=>scrollY));
  const before=(await cdp.send('Performance.getMetrics')).metrics;
  await page.evaluate(()=>{Object.assign(window.__profile,{resizes:0,copies:0,copyMs:0,copyMax:0,frames:[],longTasks:[],active:true});});
  await page.mouse.move(1200,450);
  for(let i=0;i<36;i++){await page.mouse.wheel(0,i<18?24:-24);await page.waitForTimeout(65);}
  await page.waitForTimeout(600);
  const raw=await page.evaluate(()=>{window.__profile.active=false;return {...window.__profile,y:scrollY}});
  const after=(await cdp.send('Performance.getMetrics')).metrics;
  const dif=(name)=>after.find(m=>m.name===name).value-before.find(m=>m.name===name).value;
  const intervals=raw.frames.sort((a,b)=>a-b);const p=n=>intervals[Math.floor((intervals.length-1)*n)];
  results.push({zone,frames:intervals.length,p50:p(.5),p95:p(.95),p99:p(.99),over25:intervals.filter(t=>t>25).length,resizes:raw.resizes,copies:raw.copies,copyMs:raw.copyMs,copyMax:raw.copyMax,longTasks:raw.longTasks,taskMs:dif('TaskDuration')*1000,layoutMs:dif('LayoutDuration')*1000,scriptMs:dif('ScriptDuration')*1000,y:raw.y});
 }
 const result={label,settings,errors,results};
 fs.mkdirSync(require('node:path').join(__dirname,'../work/scroll-checks'),{recursive:true});fs.writeFileSync(require('node:path').join(__dirname,'../work/scroll-checks',label+'.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
