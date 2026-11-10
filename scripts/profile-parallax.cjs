const {chromium}=require('playwright');const fs=require('node:fs');const path=require('node:path');
(async()=>{const b=await chromium.launch({channel:'msedge',headless:true});const results=[];try{
for(const config of [{name:'desktop',viewport:{width:1440,height:1000}},{name:'mobile',viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:3}]){
const p=await b.newPage(config);await p.goto('http://127.0.0.1:5178/contact.html',{waitUntil:'networkidle'});await p.waitForTimeout(700);
await p.evaluate(()=>{window.__frames=[];window.__run=true;let last=performance.now();const step=t=>{window.__frames.push(t-last);last=t;if(window.__run)requestAnimationFrame(step)};requestAnimationFrame(step);});
if(config.name==='desktop'){for(let round=0;round<4;round++)for(let i=0;i<40;i++){await p.mouse.move(70+(config.viewport.width-140)*(round%2?1-i/39:i/39),200+round*120);await p.waitForTimeout(9);}}
for(let n=0;n<4;n++){await p.mouse.wheel(0,360);await p.waitForTimeout(220);}
const stats=await p.evaluate(()=>{window.__run=false;const a=window.__frames.slice(2).sort((a,b)=>a-b);return{samples:a.length,medianMs:a[Math.floor(a.length*.5)],p95Ms:a[Math.floor(a.length*.95)],over33ms:a.filter(x=>x>33).length};});
await p.waitForFunction(()=>document.querySelector('[data-polar-world]').dataset.parallaxState==='idle');
const transforms=await p.locator('[data-depth]').evaluateAll(els=>els.map(e=>e.style.transform));await p.waitForTimeout(500);const idle=await p.locator('[data-depth]').evaluateAll(els=>els.map(e=>e.style.transform));
results.push({name:config.name,...stats,idleStable:JSON.stringify(transforms)===JSON.stringify(idle)});await p.close();
}fs.mkdirSync(path.join(__dirname,'../work/polar-night-checks'),{recursive:true});fs.writeFileSync(path.join(__dirname,'../work/polar-night-checks/parallax-performance.json'),JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));
}finally{await b.close()}})().catch(e=>{console.error(e);process.exit(1)});
