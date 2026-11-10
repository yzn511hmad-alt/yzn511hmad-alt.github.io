const fs=require('node:fs'),assert=require('node:assert/strict');const {stripTypeScriptTypes}=require('node:module');
const root=require('node:path').resolve(__dirname,'../src/components')+'/';
const compile=file=>stripTypeScriptTypes(fs.readFileSync(root+file,'utf8'));
const data=code=>'data:text/javascript;base64,'+Buffer.from(code).toString('base64');
(async()=>{
 const vault=data(compile('VaultState.ts'));const source=compile('IceKeyState.ts').replace("'./VaultState'",JSON.stringify(vault));const state=await import(data(source));
 const {startIceKeyRun,strikeIce,extractIceKey,iceSnapshot,restoreIceKeyRun,emptyIceKeyRun,iceKeyExpired}=state;
 const start=100000,run=startIceKeyRun(start);let generated=0;const generate=()=>{generated++;return 'SNOWY-FREE-ABCD-EFGH-2026'};
 assert.equal(iceSnapshot(run,start+29999).phase,'waiting');assert.equal(iceSnapshot(run,start+29999).remaining,1);
 assert.equal(strikeIce(run,start+29999),run);assert.equal(extractIceKey(run,start+29999,generate),run);assert.equal(generated,0);
 assert.equal(iceSnapshot(run,start+30000).phase,'breakable');assert.equal(iceSnapshot(run,start+30000).remaining,0);
 let broken=run;for(let i=0;i<5;i++){broken=strikeIce(broken,start+30000+i*300);if(i<4){assert.equal(iceSnapshot(broken,start+32000).phase,'breakable');assert.equal(extractIceKey(broken,start+32000,generate),broken);}}
 assert.equal(broken.strikes,5);assert.equal(iceSnapshot(broken,start+31200).phase,'opened');assert.equal(iceSnapshot(broken,start+31999).settling,true);
 assert.equal(extractIceKey(broken,start+31999,generate),broken);assert.equal(generated,0);
 const ready=extractIceKey(broken,start+32000,generate);assert.equal(generated,1);assert.equal(iceSnapshot(ready,start+32000).phase,'ready');assert.equal(extractIceKey(ready,start+33000,generate),ready);assert.equal(generated,1);
 assert.deepEqual(restoreIceKeyRun(JSON.stringify(run),start+10000),run);
 assert.deepEqual(restoreIceKeyRun(JSON.stringify(broken),start+31500),broken);assert.equal(iceSnapshot(restoreIceKeyRun(JSON.stringify(broken),start+31500),start+31500).canAct,false);
 assert.deepEqual(restoreIceKeyRun(JSON.stringify(ready),start+33000),ready);
 const oldWaiting={version:1,startedAt:start,key:null,unlockedAt:null};assert.equal(restoreIceKeyRun(JSON.stringify(oldWaiting),start+15000).startedAt,start);
 const oldReady={...oldWaiting,key:ready.key,unlockedAt:start+30000};const migrated=restoreIceKeyRun(JSON.stringify(oldReady),start+30001);assert.equal(iceSnapshot(migrated,start+30001).phase,'ready');assert.deepEqual(restoreIceKeyRun(JSON.stringify(migrated),start+30002),migrated);
 assert.deepEqual(restoreIceKeyRun('broken',start),emptyIceKeyRun());assert.deepEqual(restoreIceKeyRun(JSON.stringify({...run,startedAt:start+1}),start),emptyIceKeyRun());
 assert.deepEqual(restoreIceKeyRun(JSON.stringify({...run,strikes:5,openedAt:start+100}),start+1000),emptyIceKeyRun());
 assert.deepEqual(restoreIceKeyRun(JSON.stringify({...ready,unlockedAt:broken.openedAt-1}),start+33000),emptyIceKeyRun());
 assert.equal(iceKeyExpired(ready,ready.unlockedAt+24*60*60*1000-1),false);assert.equal(iceKeyExpired(ready,ready.unlockedAt+24*60*60*1000),true);
 assert.deepEqual(restoreIceKeyRun(JSON.stringify(ready),ready.unlockedAt+24*60*60*1000),emptyIceKeyRun());
 console.log('PASS: exact30s boundary;5hits;800mssettle;extraction-only generation;reload/migration;invalid/future state;24hexpiry.');
})().catch(e=>{console.error(e);process.exit(1)});
