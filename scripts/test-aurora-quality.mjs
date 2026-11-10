import assert from 'node:assert/strict';
import { AuroraQuality,AuroraGpuTimer,auroraCeiling } from '../src/webgl/AuroraQuality.ts';

const results=[];
const test=(name,fn)=>{try{fn();results.push({name,passed:true});console.log('passed',name);}catch(error){results.push({name,passed:false,failure:error.message});console.error('FAILED',name,error.message);}};
const view=(overrides={})=>({width:2112,height:691.2,deviceDPR:1.5,lowPower:false,maxWidth:16384,maxHeight:16384,...overrides});
const close=(actual,expected,message)=>assert.ok(Math.abs(actual-expected)<1e-8,`${message}: ${actual} != ${expected}`);
function simulator(quality){
 const state={now:0,frame:0,changes:[]};
 state.run=(duration,{cpu=.8,gpu=1,gpuRevision=null,step=1000/60,allowUpgrade=true,renderEvery=2}={})=>{
  const end=state.now+duration;
  while(state.now+step<=end+.000001){
   state.now+=step;state.frame++;quality.frame(state.now);
   if(state.frame%renderEvery===0){
    quality.submit(cpu);if(gpu!==null)quality.gpu(gpu,gpuRevision??quality.revision);
    if(quality.evaluate(state.now,allowUpgrade))state.changes.push({at:state.now,ratio:quality.ratio,revision:quality.revision});
   }
  }
  return state;
 };return state;
}
function bounded(v){
 const ratio=auroraCeiling(v),w=v.width*ratio,h=v.height*ratio;
 assert.ok(ratio>0&&ratio<=v.deviceDPR+1e-9);assert.ok(ratio<=(v.lowPower?1.25:1.5)+1e-9);
 assert.ok(w<=Math.min(v.maxWidth,v.lowPower?1440:3840)+1e-7);
 assert.ok(h<=Math.min(v.maxHeight,v.lowPower?1000:1440)+1e-7);
 assert.ok(w*h<=(v.lowPower?900000:3200000)+1e-5);
 return ratio;
}

test('high-DPI and very large screens obey dimensions and total pixel budget',()=>{
 for(const v of [view(),view({width:8448,height:2764.8,deviceDPR:3}),view({width:7680,height:4320,deviceDPR:4}),view({width:429,height:540.16,deviceDPR:3,lowPower:true}),view({width:902,height:755.2,deviceDPR:2,lowPower:true})])bounded(v);
 const ceiling=auroraCeiling(view());assert.ok(ceiling>1&&ceiling<1.5,'High-DPI laptop should have bounded headroom above native CSS resolution');
});
test('native DPR and actual GPU hardware limits are respected',()=>{
 close(bounded(view({width:1440,height:640,deviceDPR:1})),1,'Never supersample a DPR1 display');
 const hardware=view({width:2112,height:691.2,maxWidth:1024,maxHeight:512});close(bounded(hardware),1024/2112,'Hardware width is the limiting factor');
 const heightLimited=view({width:1440,height:1000,maxWidth:4096,maxHeight:256});close(bounded(heightLimited),.256,'Hardware height is the limiting factor');
});
test('moving to high-DPI keeps current resolution until a measured upgrade',()=>{
 const dimensions={width:1584,height:640};const q=new AuroraQuality();q.configure(view({...dimensions,deviceDPR:1}),0);const sim=simulator(q);sim.run(16000,{gpu:.8});
 const previousRatio=q.ratio,oldCeiling=q.ceiling,changedAt=sim.now;q.configure(view({...dimensions,deviceDPR:2}),changedAt);
 assert.ok(q.ceiling>oldCeiling,'New display should offer more resolution headroom');close(q.ratio,previousRatio,'A DPR increase cannot immediately raise physical resolution');
 sim.run(7800,{gpu:.8});close(q.ratio,previousRatio,'High-DPI headroom still needs stable performance evidence');sim.run(8000,{gpu:.8});assert.ok(q.ratio>previousRatio&&q.ratio<=q.ceiling);assert.ok(sim.changes[0].at>=changedAt+8000);
 q.configure(view({...dimensions,deviceDPR:1}),sim.now);assert.ok(q.ratio<=1,'Returning to a DPR1 screen clamps to its native ceiling');
 const stressed=new AuroraQuality();stressed.configure(view({...dimensions,deviceDPR:1}),0);const slow=simulator(stressed);slow.run(60000,{gpu:30});assert.ok(stressed.ratio<.6);const downshifted=stressed.ratio;stressed.configure(view({...dimensions,deviceDPR:2}),slow.now);close(stressed.ratio,downshifted,'A higher-DPI floor must not undo an earned pressure downshift');
});
test('initial rendering is conservative and always under the ceiling',()=>{
 for(const v of [view(),view({lowPower:true}),view({width:429,height:540.16,lowPower:true,deviceDPR:3}),view({maxWidth:256,maxHeight:256})]){
  const q=new AuroraQuality();q.configure(v,0);assert.ok(q.ratio>0&&q.ratio<=q.ceiling);assert.ok(v.width*q.ratio<=(v.lowPower?900:1800)+1e-7);assert.ok(v.height*q.ratio<=(v.lowPower?700:1000)+1e-7);
 }
});
test('sustained GPU pressure lowers quality without resizing every frame',()=>{
 const q=new AuroraQuality();q.configure(view(),0);const initial=q.ratio,sim=simulator(q);sim.run(1500,{gpu:20});close(q.ratio,initial,'Warm-up cannot lower quality');sim.run(18000,{gpu:20});assert.ok(q.ratio<initial);assert.ok(sim.changes.length>=1&&sim.changes.length<6);for(let i=1;i<sim.changes.length;i++)assert.ok(sim.changes[i].at-sim.changes[i-1].at>=2500);
});
test('slow CPU submissions lower quality when GPU timing is unavailable',()=>{
 const q=new AuroraQuality();q.configure(view(),0);const initial=q.ratio;simulator(q).run(14000,{gpu:null,cpu:17});assert.ok(q.ratio<initial);
});
test('persistent350ms frame gaps are pressure rather than endless warm-up',()=>{
 const q=new AuroraQuality();q.configure(view(),0);const initial=q.ratio;simulator(q).run(14000,{gpu:null,step:350,renderEvery:1});assert.ok(q.ratio<initial,'Severe sustained stalls must eventually lower resolution');
});
test('fast GPU samples earn delayed, bounded upgrades',()=>{
 const q=new AuroraQuality();q.configure(view(),0);const initial=q.ratio,sim=simulator(q);sim.run(7800,{gpu:.8});close(q.ratio,initial,'No fast startup jump');sim.run(8000,{gpu:.8});assert.ok(q.ratio>initial&&q.ratio<=q.ceiling);assert.ok(sim.changes[0].at>=8000);for(let i=1;i<sim.changes.length;i++)assert.ok(sim.changes[i].at-sim.changes[i-1].at>=8000);
});
test('CPU-only calmness requires a longer observation before upgrading',()=>{
 const q=new AuroraQuality();q.configure(view(),0);const initial=q.ratio,sim=simulator(q);sim.run(11800,{gpu:null});close(q.ratio,initial,'CPU fallback must remain conservative');sim.run(7000,{gpu:null});assert.ok(q.ratio>initial&&q.ratio<=q.ceiling);assert.ok(sim.changes[0].at>=12000);
});
test('moving camera blocks upgrades but does not block pressure reductions',()=>{
 const q=new AuroraQuality();q.configure(view(),0);const initial=q.ratio;simulator(q).run(30000,{gpu:.8,allowUpgrade:false});close(q.ratio,initial,'Pointer/scroll motion must not raise resolution');simulator(q).run(10000,{gpu:22,allowUpgrade:false});assert.ok(q.ratio<initial);
});
test('calm rendering at the ceiling and neutral pressure do not churn',()=>{
 const q=new AuroraQuality();q.configure(view({width:1440,height:640,deviceDPR:1}),0);const revision=q.revision,sim=simulator(q);sim.run(90000,{gpu:.8});assert.equal(sim.changes.length,0);assert.equal(q.revision,revision);
 const neutral=new AuroraQuality();neutral.configure(view(),0);const neutralRevision=neutral.revision,other=simulator(neutral);other.run(90000,{cpu:5,gpu:6});assert.equal(other.changes.length,0);assert.equal(neutral.revision,neutralRevision);
});
test('stale GPU revisions cannot cause a downshift',()=>{
 const q=new AuroraQuality();q.configure(view(),0);const stale=q.revision;q.configure(view({width:2000,height:700}),0);const initial=q.ratio;simulator(q).run(7000,{gpu:100,gpuRevision:stale});close(q.ratio,initial,'Old physical-size timing is not current pressure');
});
test('hold excludes pause/resume time and resets performance history',()=>{
 const q=new AuroraQuality();q.configure(view(),0);const sim=simulator(q);sim.run(2500,{gpu:20});const initial=q.ratio;q.hold(sim.now);sim.run(1700,{gpu:20});close(q.ratio,initial,'Resume warm-up must not immediately resize');
 q.frame(sim.now+5000);q.submit(30);assert.equal(q.evaluate(sim.now+5001,false),false,'Debugger-length gaps should begin a fresh warm-up');
});

class FakeGL {
 CURRENT_QUERY=0x8865;QUERY_RESULT_AVAILABLE=0x8867;QUERY_RESULT=0x8866;
 ext={TIME_ELAPSED_EXT:0x88bf,GPU_DISJOINT_EXT:0x8fbb};
 extensionCalls=0;created=[];deleted=[];reads=0;availabilityReads=0;current=null;disjoint=false;availableExtension=true;
 getExtension(name){assert.equal(name,'EXT_disjoint_timer_query_webgl2');this.extensionCalls++;return this.availableExtension?this.ext:null;}
 getQuery(target,property){assert.equal(target,this.ext.TIME_ELAPSED_EXT);assert.equal(property,this.CURRENT_QUERY);return this.current;}
 createQuery(){const q={id:this.created.length+1,available:false,nanoseconds:1500000};this.created.push(q);return q;}
 beginQuery(target,query){assert.equal(target,this.ext.TIME_ELAPSED_EXT);assert.equal(this.current,null,'Cannot nest GPU queries');this.current=query;}
 endQuery(target){assert.equal(target,this.ext.TIME_ELAPSED_EXT);assert.ok(this.current);this.current=null;}
 getQueryParameter(query,property){if(property===this.QUERY_RESULT_AVAILABLE){this.availabilityReads++;return query.available;}assert.equal(property,this.QUERY_RESULT);assert.equal(query.available,true,'GPU result must not be read before availability');this.reads++;return query.nanoseconds;}
 getParameter(property){assert.equal(property,this.ext.GPU_DISJOINT_EXT);return this.disjoint;}
 deleteQuery(query){assert.ok(!this.deleted.includes(query),'Query deleted twice');this.deleted.push(query);}
}
function submitFrames(timer,count,{revision=1,step=10,start=0}={}){for(let i=1;i<=count;i++){timer.begin(revision,start+i*step);timer.end();}}
test('unsupported GPU timer cleanly uses the caller fallback',()=>{
 const gl=new FakeGL();gl.availableExtension=false;const timer=new AuroraGpuTimer(gl),samples=[];submitFrames(timer,80);timer.poll(1000,(...s)=>samples.push(s));timer.clear();assert.equal(gl.created.length,0);assert.equal(gl.reads,0);assert.equal(samples.length,0);
});
test('timer waits for availability, converts nanoseconds and preserves revision',()=>{
 const gl=new FakeGL(),timer=new AuroraGpuTimer(gl),samples=[];submitFrames(timer,24,{revision:7});assert.equal(gl.created.length,1);timer.poll(500,(...s)=>samples.push(s));assert.equal(gl.reads,0);assert.equal(samples.length,0);gl.created[0].available=true;gl.created[0].nanoseconds=2750000;timer.poll(600,(...s)=>samples.push(s));assert.deepEqual(samples,[[2.75,7]]);assert.equal(gl.deleted.length,1);timer.poll(700,(...s)=>samples.push(s));assert.equal(samples.length,1);
});
test('timer has bounded pending work and clears every pending query',()=>{
 const gl=new FakeGL(),timer=new AuroraGpuTimer(gl);submitFrames(timer,96);assert.equal(gl.created.length,3,'Pending timer handles must be bounded');timer.poll(1000,()=>assert.fail('Pending result cannot be accepted'));assert.equal(gl.reads,0);timer.clear();assert.equal(gl.deleted.length,3);submitFrames(timer,16);assert.equal(gl.created.length,3,'Clear restarts timer warm-up');
});
test('disjoint timing is discarded without reading invalid GPU results',()=>{
 const gl=new FakeGL(),timer=new AuroraGpuTimer(gl),samples=[];submitFrames(timer,40);gl.created.forEach(q=>q.available=true);gl.disjoint=true;timer.poll(1000,(...s)=>samples.push(s));assert.equal(samples.length,0);assert.equal(gl.reads,0);assert.equal(gl.deleted.length,gl.created.length);gl.disjoint=false;submitFrames(timer,8,{start:1000});assert.ok(gl.created.length>gl.deleted.length,'Timing can recover after a disjoint interval');timer.clear();
});
test('unresolved queries expire instead of accumulating indefinitely',()=>{
 const gl=new FakeGL(),timer=new AuroraGpuTimer(gl);submitFrames(timer,24);timer.poll(2241,()=>assert.fail('Expired timing cannot be accepted'));assert.equal(gl.deleted.length,1);assert.equal(gl.reads,0);timer.clear();
});
test('context loss abandons handles and restoration reacquires extension',()=>{
 const gl=new FakeGL(),timer=new AuroraGpuTimer(gl);submitFrames(timer,40);const old=gl.created.length;timer.clear(true);assert.equal(gl.deleted.length,0,'Lost-context handles are abandoned without GL deletes');timer.restore();assert.equal(gl.extensionCalls,2);timer.poll(1000,()=>assert.fail('Lost-context sample must not survive'));submitFrames(timer,24,{start:1000});assert.equal(gl.created.length,old+1);timer.clear();assert.equal(gl.deleted.length,1);
});
test('an existing external timer query is never nested or ended',()=>{
 const gl=new FakeGL(),timer=new AuroraGpuTimer(gl),external={external:true};gl.current=external;submitFrames(timer,24);assert.equal(gl.created.length,0);assert.equal(gl.current,external);gl.current=null;submitFrames(timer,8);assert.equal(gl.created.length,1);timer.clear();
});

const summary={passed:results.every(r=>r.passed),cases:results.length,results};
console.log(JSON.stringify(summary,null,2));if(!summary.passed)process.exitCode=1;
