const {chromium}=require('playwright');
const fs=require('node:fs');const path=require('node:path');const assert=require('node:assert/strict');
const base=process.argv[2]||'http://127.0.0.1:5178';const output=path.join(__dirname,'../work/polar-night-checks');fs.mkdirSync(output,{recursive:true});
const configs=[
 {name:'desktop',viewport:{width:1440,height:1000}},
 {name:'mobile',viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:3},
 {name:'reduced',viewport:{width:1440,height:1000},reducedMotion:'reduce'},
];
const files=['index.html','scripts.html','pricing.html','free-key.html','contact.html'];
const waitIdle=page=>page.waitForFunction(()=>{const world=document.querySelector('[data-polar-world]');return !world||['idle','paused'].includes(world.dataset.parallaxState);},{},{timeout:10000});
const layers=page=>page.locator('[data-polar-world] [data-depth]').evaluateAll(nodes=>nodes.map(el=>{const m=new DOMMatrix(getComputedStyle(el).transform);return {depth:Number(el.dataset.depth),transform:el.style.transform,x:m.m41,y:m.m42}}));
const differences=(a,b)=>a.map((v,i)=>({depth:v.depth,dx:Math.abs(v.x-b[i].x),dy:Math.abs(v.y-b[i].y)}));
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});const report={base,date:new Date().toISOString(),cases:[],functional:[]};try{
 for(const config of configs)for(const file of files){
  const ctx=await browser.newContext({...config,permissions:['clipboard-read','clipboard-write']});const page=await ctx.newPage();const result={config:config.name,file,errors:[],bad:[],forbidden:[]};
  page.on('pageerror',e=>result.errors.push(e.message));
  page.on('response',r=>{if(r.url().startsWith(base)&&r.status()>=400)result.bad.push({url:r.url(),status:r.status()});});
  page.on('request',r=>{if(/ContactSnow|FrozenVault|\/assets\/vault\/|\/assets\/contact\//i.test(r.url())||(!['contact.html','free-key.html'].includes(file)&&r.url().includes('/assets/atmosphere/')))result.forbidden.push(r.url());});
  await page.addInitScript(()=>{localStorage.setItem('snowy-theme-preset','arctic-snow');});
  try{
   await page.goto(base+'/'+file,{waitUntil:'domcontentloaded'});await page.waitForTimeout(1100);await waitIdle(page);
   const theme=await page.evaluate(()=>({theme:document.documentElement.dataset.theme,preset:document.documentElement.dataset.themePreset,light:document.documentElement.classList.contains('light'),saved:localStorage.getItem('snowy-theme-preset'),width:innerWidth,scrollWidth:document.documentElement.scrollWidth}));
   assert.equal(theme.theme,'dark');assert.equal(theme.preset,'polar-night');assert.equal(theme.light,false);assert.equal(theme.saved,'polar-night');assert.ok(theme.scrollWidth<=theme.width+1,'Horizontal overflow');result.theme=theme;
   if(['contact.html','free-key.html'].includes(file))assert.equal(await page.locator('canvas:not([data-aurora-surface])').count(),0,'Removed interaction canvas remained');
   if(['contact.html','free-key.html'].includes(file)){
   const initial=await layers(page);assert.ok(initial.length>=4,'Insufficient depth layers');
   if(config.name==='reduced'){
    assert.ok(initial.every(l=>l.transform==='none'),'Reduced motion should disable all transforms');
    await page.mouse.move(1300,700);await page.evaluate(()=>window.scrollTo(0,500));await page.waitForTimeout(450);assert.ok((await layers(page)).every(l=>l.transform==='none'));result.reducedMotion=true;
   }else{
    if(config.name==='desktop'){
     await page.mouse.move(100,150);await waitIdle(page);const left=await layers(page);
     await page.mouse.move(1300,750);await waitIdle(page);const right=await layers(page);const d=differences(left,right);
     assert.ok(d.filter(x=>x.dx>.2).length>=3,'Mouse should shift multiple planes');assert.ok(new Set(d.filter(x=>x.dx>.2).map(x=>x.dx.toFixed(1))).size>=3,'Mouse depths should differ');result.mouse=d;
    }
    const before=await layers(page);const scrollY=await page.evaluate(()=>{window.scrollTo(0,Math.min(600,document.documentElement.scrollHeight-innerHeight));return window.scrollY;});await page.waitForTimeout(150);await waitIdle(page);const after=await layers(page);const d=differences(before,after);
    assert.ok(d.filter(x=>x.dy>.1).length>=3,'Scroll should shift multiple planes');assert.ok(new Set(d.filter(x=>x.dy>.1).map(x=>x.dy.toFixed(1))).size>=3,'Scroll depths should differ');result.scroll={scrollY,planes:d};
    const settled=await layers(page);await page.waitForTimeout(350);assert.deepEqual(await layers(page),settled,'Settled camera continues moving');
    await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));});
    const hidden=await layers(page);await page.mouse.move(600,100);await page.evaluate(()=>window.scrollTo(0,800));await page.waitForTimeout(300);assert.deepEqual(await layers(page),hidden,'Hidden camera continues moving');assert.equal(await page.locator('[data-polar-world]').getAttribute('data-parallax-state'),'paused');
    await page.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));});await waitIdle(page);result.hiddenSuspension=true;
   }
   }else{assert.equal(await page.locator('[data-polar-world]').count(),0,'Landscape should only be on Contact and Free Key');}
   const footer=await page.locator('footer.site-footer').evaluate(el=>getComputedStyle(el).backgroundColor);assert.equal(footer,'rgb(7, 17, 29)','Footer must be opaque navy');
   assert.deepEqual(result.errors,[]);assert.deepEqual(result.bad,[]);assert.deepEqual(result.forbidden,[]);
   result.passed=true;
  }catch(error){result.passed=false;result.failure=error.message;await page.screenshot({path:path.join(output,`qa-fail-${config.name}-${file}.png`),fullPage:false}).catch(()=>{});}
  report.cases.push(result);console.log(result.passed?'passed':'FAILED',config.name,file,result.failure||'');await ctx.close();
 }
 // Form and catalog still work after the theme/layout change.
 const ctx=await browser.newContext({viewport:{width:1440,height:1000},permissions:['clipboard-read','clipboard-write']});const page=await ctx.newPage();
 for(const task of ['contact','catalog']){
  const result={task};try{
   if(task==='contact'){
    await page.goto(base+'/contact.html',{waitUntil:'domcontentloaded'});await page.waitForTimeout(350);
    await page.locator('#desk-handle').fill('PolarNightQA');await page.locator('#desk-subject').fill('Parallax and dark mode');await page.locator('#desk-message').fill('The contact form should remain available after removing the snow interaction.');await page.locator('button[type="submit"]').click();
    assert.equal(await page.locator('#desk-draft').isVisible(),true);assert.match(await page.locator('#desk-output').inputValue(),/PolarNightQA/);await page.locator('#desk-copy').click();assert.match(await page.evaluate(()=>navigator.clipboard.readText()),/PolarNightQA/);result.draft=true;result.copy=true;
   }else{
    await page.goto(base+'/scripts.html',{waitUntil:'domcontentloaded'});await page.waitForSelector('.card-game-title');
    const title=(await page.locator('.card-game-title').first().textContent()).trim();const count=await page.locator('.tilt-card-wrapper').count();await page.locator('#script-search-input').fill(title);await page.waitForTimeout(350);assert.ok(await page.locator('.tilt-card-wrapper').count()>=1);assert.ok(await page.locator('.tilt-card-wrapper').count()<=count);await page.locator('.btn-card-inspect').first().click();await page.waitForTimeout(500);assert.equal(await page.locator('#inspect-modal').getAttribute('aria-hidden'),'false');assert.match(await page.locator('.inspect-game-title').textContent(),new RegExp(title.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));await page.locator('#modal-close-btn').click();await page.waitForTimeout(500);assert.equal(await page.locator('#inspect-modal').getAttribute('aria-hidden'),'true');result.search=true;result.modal=true;
   }
   result.passed=true;
  }catch(e){result.passed=false;result.failure=e.message;}
  report.functional.push(result);console.log('functional',JSON.stringify(result));
 }
 await ctx.close();
 report.passed=report.cases.every(x=>x.passed)&&report.functional.every(x=>x.passed);fs.writeFileSync(path.join(output,'site-qa-report.json'),JSON.stringify(report,null,2));console.log('REPORT',path.join(output,'site-qa-report.json'),'PASS',report.passed);if(!report.passed)process.exitCode=1;
 }finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
