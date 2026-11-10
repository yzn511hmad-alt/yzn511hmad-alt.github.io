const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});try{
 const page=await browser.newPage();
 await page.route('**/renderer-fixture',r=>r.fulfill({contentType:'text/html',body:'<!DOCTYPE html><body></body>'}));
 await page.goto('http://127.0.0.1:5179/renderer-fixture');
 const result=await page.evaluate(async()=>{
  const {SharedSurface}=await import('/src/webgl/SharedRenderer.ts');
  const THREE=await import('/node_modules/.vite/deps/three.js');
  let resets=0;const registered=new Set();const get=HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext=function(type,...args){const result=get.call(this,type,...args);if(result&&type==='webgl2')registered.add(this);return result};
  for(const key of ['width','height']){const d=Object.getOwnPropertyDescriptor(HTMLCanvasElement.prototype,key);Object.defineProperty(HTMLCanvasElement.prototype,key,{...d,set(v){if(registered.has(this))resets++;return d.set.call(this,v)}})}
  const camera=new THREE.OrthographicCamera(-1,1,1,-1,0,1);
  const red=new THREE.Scene();red.background=new THREE.Color('red');
  const blue=new THREE.Scene();blue.background=new THREE.Color('blue');
  const a=new SharedSurface();document.body.append(a.domElement);a.setSize(80,40);a.render(red,camera);
  const native=a.domElement.dataset.renderMode;
  const b=new SharedSurface();document.body.append(b.domElement);b.setSize(200,90);
  a.render(red,camera);b.render(blue,camera);const initial=resets;
  for(let i=0;i<10;i++){a.render(red,camera);b.render(blue,camera)}
  const stable=resets===initial;
  const pixels=[a,b].map(s=>Array.from(s.domElement.getContext('2d').getImageData(3,3,1,1).data));
  a.setSize(120,110);a.render(red,camera);b.render(blue,camera);const afterResize=resets;
  for(let i=0;i<5;i++){a.render(red,camera);b.render(blue,camera)}
  const resizedStable=resets===afterResize;
  const cropped=[a,b].map(s=>Array.from(s.domElement.getContext('2d').getImageData(3,3,1,1).data));
  const shared=a.engine===b.engine;
  a.dispose();b.dispose();
  return{native,stable,resizedStable,shared,pixels,cropped};
 });
 assert.equal(result.native,'direct');assert.ok(result.shared&&result.stable&&result.resizedStable);
 assert.deepEqual(result.pixels,[[255,0,0,255],[0,0,255,255]]);assert.deepEqual(result.cropped,result.pixels);
 console.log(JSON.stringify(result,null,2));
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
