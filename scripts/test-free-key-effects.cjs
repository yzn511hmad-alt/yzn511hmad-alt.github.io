const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const base=process.argv[2]||'http://localhost:5173',selected=process.argv[3]||'',out=path.resolve(__dirname,'../work/effects-20261105/'+(selected?'dev-checks':'production-checks'));fs.mkdirSync(out,{recursive:true});
const report=[];
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});try{
 const variants=['desktop','mobile-reduced','mask-unavailable','poster-unavailable-policy-blocked'];if(selected&&!variants.includes(selected))throw Error('Unknown test variant');
 for(const variant of variants.filter(variant=>!selected||variant===selected)){
  const mobile=variant==='mobile-reduced',context=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1517,height:693},deviceScaleFactor:1.25,...(mobile?{isMobile:true,hasTouch:true,reducedMotion:'reduce'}:{})});
  await context.addInitScript(blocked=>{
   const now=Date.now();sessionStorage.setItem('snowy:free-key:melt:v1',JSON.stringify({version:1,startedAt:now-60000,key:null,unlockedAt:null}));
   window.__effectQA={workers:0,terminated:0,videoUploads:0,videos:[]};const q=window.__effectQA,create=document.createElement.bind(document),get=HTMLCanvasElement.prototype.getContext,NativeWorker=window.Worker;
   document.createElement=function(tag,...args){const el=create(tag,...args);if(tag.toLowerCase()==='video')q.videos.push(el);return el};
   window.Worker=class extends NativeWorker{constructor(...args){super(...args);q.workers++}terminate(){q.terminated++;super.terminate()}};
   HTMLCanvasElement.prototype.getContext=function(type,...args){const gl=get.call(this,type,...args);if(gl&&/^webgl/.test(type)&&!gl.__effectQA){gl.__effectQA=true;for(const key of ['texImage2D','texSubImage2D']){const original=gl[key].bind(gl);gl[key]=(...values)=>{if(values.some(value=>value instanceof HTMLVideoElement))q.videoUploads++;return original(...values)}}}return gl};
   if(blocked)HTMLMediaElement.prototype.play=function(){return Promise.reject(new DOMException('Intentional test autoplay policy block','NotAllowedError'))};
  },variant==='poster-unavailable-policy-blocked');
  if(variant==='mask-unavailable')await context.route('**/sky-masks-r8-v1/*.ktx2',route=>route.fulfill({status:503,body:'Intentional mask failure'}));
  if(variant==='poster-unavailable-policy-blocked')await context.route('**/quality-v1/fire-hd-poster.webp',route=>route.fulfill({status:503,body:'Intentional poster failure'}));
  const requests=[],errors=[],consoleErrors=[];context.on('request',r=>requests.push(r.url()));
  try{const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&!/503/.test(m.text()))consoleErrors.push(m.text())});
   await page.goto(base+'/free-key.html',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>document.querySelector('#key-access').dataset.scenePresented==='true',null,{timeout:120000});await page.waitForTimeout(500);
   const state=await page.evaluate(()=>{const q=window.__effectQA;return {scene:{...document.querySelector('.ice-scene').dataset},root:{...document.querySelector('#key-access').dataset},workers:q.workers,terminated:q.terminated,videoUploads:q.videoUploads,videos:q.videos.map(v=>({readyState:v.readyState,width:v.videoWidth,height:v.videoHeight,paused:v.paused,time:v.currentTime})),inert:document.querySelector('#app').inert,overflow:document.documentElement.scrollWidth>innerWidth+1,glError:document.querySelector('#ice-vault-canvas').getContext('webgl2').getError()}});
   assert.deepEqual(errors,[]);assert.deepEqual(consoleErrors,[]);assert.equal(state.glError,0);assert.equal(state.inert,false);assert.equal(state.overflow,false);assert.equal(state.workers,1);assert.equal(state.terminated,1);assert.equal(state.scene.auroraDiffuse,'shared-float32');
   assert.equal(requests.some(url=>/basis_transcoder|KTX2Loader|WorkerPool/.test(url)),false);
   if(variant==='mask-unavailable')assert.ok(requests.some(url=>url.endsWith('aurora-sky-landscape-enhanced-mask-v1.webp')));
   if(variant==='poster-unavailable-policy-blocked'){assert.ok(state.videoUploads>0,'Decoded first video frame was not uploaded');assert.equal(state.videos[0].paused,true);assert.equal(state.scene.fireReady,'true');}
   if(variant==='desktop'){await page.locator('#ice-vault-action').click();await page.locator('#lootlabs-link').waitFor({state:'visible',timeout:15000});assert.equal(await page.locator('#key-access').getAttribute('data-reward-pending'),'false');}
   await page.screenshot({path:path.join(out,variant+'.png')});report.push({variant,errors,consoleErrors,state,requests});console.log('PASS',variant,JSON.stringify({workers:state.workers,terminated:state.terminated,videoUploads:state.videoUploads,diffuse:state.scene.auroraDiffuse}));
  }finally{await context.close();}
 }
}finally{await browser.close();fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));}})().catch(error=>{console.error(error);process.exitCode=1});
