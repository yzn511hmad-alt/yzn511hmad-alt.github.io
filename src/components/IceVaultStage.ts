import { onFrame } from '../core/FrameLoop';
import gsap from 'gsap';
import type { IceVaultSnapshot } from './IceKeyState';
import { createIceFractures, createIceInterior, paintIceFractures, type IceCrack } from './IceFractures';

type Point={x:number;y:number};
type Shard={canvas:HTMLCanvasElement;x:number;y:number;cx:number;cy:number;vx:number;vy:number;spin:number;angle:number;delay:number};
const ASSETS='/assets/ice-vault/';
const defaults:Point[]=[{x:.43,y:.43},{x:.65,y:.59},{x:.26,y:.66},{x:.72,y:.37},{x:.51,y:.56}];
const outline:Point[]=[{x:.049,y:.216},{x:.078,y:.154},{x:.423,y:.047},{x:.922,y:.116},{x:.953,y:.166},{x:.941,y:.746},{x:.641,y:.938},{x:.072,y:.816},{x:.047,y:.777}];
const now=()=>performance.now()/1000;
function random(seed:number):()=>number{return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function path(ctx:CanvasRenderingContext2D,points:Point[],scale=1):void{ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p.x*scale,p.y*scale):ctx.moveTo(p.x*scale,p.y*scale));ctx.closePath();}
function contains(p:Point):boolean {let yes=false;for(let i=0,j=outline.length-1;i<outline.length;j=i++){const a=outline[i],b=outline[j];if((a.y>p.y)!==(b.y>p.y)&&p.x<(b.x-a.x)*(p.y-a.y)/(b.y-a.y)+a.x)yes=!yes;}return yes;}

/** Photo-derived ice, physical-key layer and finite fracture effects; no WebGL. */
export function initIceVault(root:HTMLElement):()=>void {
  const canvas=root.querySelector<HTMLCanvasElement>('#ice-vault-canvas')!;
  const ctx=canvas.getContext('2d',{alpha:true});if(!ctx)throw Error('Canvas2D unavailable');
  const scene=root.querySelector<HTMLElement>('#ice-scene')!;
  const action=root.querySelector<HTMLButtonElement>('#ice-vault-action')!;
  const gesture=root.querySelector<HTMLElement>('#ice-gesture')!;
  const hammer=root.querySelector<HTMLElement>('.ice-hammer')!;
  const meter=Array.from(root.querySelectorAll<HTMLElement>('.ice-strike-meter i'));
  const events=new AbortController(),signal=events.signal;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)'),coarse=matchMedia('(pointer: coarse), (max-width:700px)');
  const cube=new Image(),key=new Image();cube.decoding=key.decoding='async';
  const ice=document.createElement('canvas'),iceCtx=ice.getContext('2d')!;
  const fractures=document.createElement('canvas'),fractureCtx=fractures.getContext('2d')!;
  const surfaceFlash=document.createElement('canvas'),flashCtx=surfaceFlash.getContext('2d')!;
  let interior:HTMLCanvasElement|undefined;
  const ground=document.createElement('canvas'),groundCtx=ground.getContext('2d')!;
  let state:IceVaultSnapshot={phase:(root.dataset.phase||'waiting') as IceVaultSnapshot['phase'],remaining:Number(root.dataset.remaining)||30,progress:0,strikes:Number(root.dataset.strikes)||0,requiredStrikes:5,keyVisible:false,canAct:root.dataset.canAct==='true',settling:false};
  let width=1,height=1,dpr=1,size=1,ox=0,oy=0,ready=false,disposed=false,visible=true;
  let unsubscribe:(()=>void)|undefined;
  let last=-Infinity;
  let impact:Point|undefined,pendingImpact:Point|undefined,cracks:IceCrack[]=[],damageOrigins:Point[]=[],shards:Shard[]=[];
  let impactAt=-Infinity,shatterAt=-Infinity,collectAt=-Infinity,firstState=true;
  let swingTimer:ReturnType<typeof setTimeout>|undefined;
  const keyPose={progress:1};let collectTween:gsap.core.Tween|undefined;
  let dust:{x:number;y:number;vx:number;vy:number;life:number;size:number}[]=[];
  const sleep=()=>{unsubscribe?.();unsubscribe=undefined;scene.dataset.renderState='idle';};
  const wake=()=>{if(disposed||!ready||!visible||document.hidden||unsubscribe)return;scene.dataset.renderState='active';last=-Infinity;unsubscribe=onFrame(frame);};
  const invalidate=()=>{if(ready&&!disposed&&visible&&!document.hidden){draw(now());wake();}};
  const actionBounds=()=>{
    if(state.phase==='opened')Object.assign(action.style,{left:`${ox+size*.23}px`,top:`${oy+size*.16}px`,width:`${size*.42}px`,height:`${size*.73}px`,borderRadius:'38%'});
    else Object.assign(action.style,{left:`${ox+size*.04}px`,top:`${oy+size*.09}px`,width:`${size*.93}px`,height:`${size*.87}px`,borderRadius:'16%'});
  };
  const makeCracks=(count:number,p?:Point)=>{
    if(count===0){cracks=[];damageOrigins=[];return;}
    const result=createIceFractures(count,p||defaults[(count-1)%defaults.length]);
    cracks.push(...result.cracks);damageOrigins.push(result.origin);
  };
  const buildIce=()=>{
    if(!ready||!interior)return;const px=Math.max(1,Math.ceil(size*dpr));ice.width=ice.height=px;
    iceCtx.setTransform(px,0,0,px,0,0);iceCtx.clearRect(0,0,1,1);iceCtx.drawImage(cube,0,0,1,1);
    fractures.width=fractures.height=px;fractureCtx.setTransform(px,0,0,px,0,0);
    paintIceFractures(fractureCtx,cracks,damageOrigins,size,interior);
    iceCtx.drawImage(fractures,0,0,1,1);
    surfaceFlash.width=surfaceFlash.height=px;flashCtx.setTransform(px,0,0,px,0,0);
    if(impact){const glow=flashCtx.createRadialGradient(impact.x,impact.y,0,impact.x,impact.y,.09);glow.addColorStop(0,'#def6ff66');glow.addColorStop(1,'#a4e5ff00');flashCtx.fillStyle=glow;flashCtx.fillRect(0,0,1,1);flashCtx.globalCompositeOperation='destination-in';flashCtx.drawImage(interior,0,0,1,1);flashCtx.globalCompositeOperation='source-over';}
  };
  const makeShards=()=>{
    shards=[];const rng=random(3191),grid:Point[][]=[];
    for(let row=0;row<=3;row++){grid[row]=[];for(let col=0;col<=3;col++)grid[row][col]={x:col/3+(col>0&&col<3?(rng()-.5)*.11:0),y:row/3+(row>0&&row<3?(rng()-.5)*.11:0)};}
    for(let row=0;row<3;row++)for(let col=0;col<3;col++){
      const a=grid[row][col],b=grid[row][col+1],c=grid[row+1][col],d=grid[row+1][col+1];
      for(const poly of [[a,b,d],[a,d,c]]){
        const minX=Math.min(...poly.map(p=>p.x)),minY=Math.min(...poly.map(p=>p.y)),maxX=Math.max(...poly.map(p=>p.x)),maxY=Math.max(...poly.map(p=>p.y));
        const cache=document.createElement('canvas');cache.width=Math.ceil((maxX-minX)*ice.width)+4;cache.height=Math.ceil((maxY-minY)*ice.height)+4;const cctx=cache.getContext('2d')!;
        cctx.translate(2-minX*ice.width,2-minY*ice.height);path(cctx,poly,ice.width);cctx.clip();cctx.drawImage(ice,0,0);
        const cx=(minX+maxX)/2,cy=(minY+maxY)/2;shards.push({canvas:cache,x:minX,y:minY,cx,cy,vx:(cx-.5)*size*1.3+(rng()-.5)*size*.35,vy:-size*(.20+rng()*.50),spin:(rng()-.5)*5.5,angle:(rng()-.5)*.08,delay:rng()*.07});
      }
    }
  };
  const buildGround=()=>{
    if(!ready)return;ground.width=canvas.width;ground.height=canvas.height;
    groundCtx.setTransform(dpr,0,0,dpr,0,0);groundCtx.clearRect(0,0,width,height);
    const floorPath=(points:Point[])=>path(groundCtx,points.map(p=>({x:ox+p.x*size,y:oy+p.y*size})));
    // Attached footprint and directional cast shadow, cached at layout changes.
    groundCtx.save();groundCtx.filter=`blur(${size*.022}px)`;groundCtx.fillStyle='#0009';
    floorPath([{x:.08,y:.82},{x:.64,y:.95},{x:1.15,y:.77},{x:.57,y:.65}]);groundCtx.fill();groundCtx.restore();
    groundCtx.save();groundCtx.filter=`blur(${size*.005}px)`;groundCtx.strokeStyle='#000d';groundCtx.lineWidth=size*.013;groundCtx.lineJoin='round';
    groundCtx.beginPath();groundCtx.moveTo(ox+size*.072,oy+size*.814);groundCtx.lineTo(ox+size*.641,oy+size*.936);groundCtx.lineTo(ox+size*.941,oy+size*.747);groundCtx.stroke();groundCtx.restore();
  };
  const resize=()=>{
    if(disposed)return;const box=scene.getBoundingClientRect();width=Math.max(1,box.width);height=Math.max(1,box.height);dpr=Math.min(devicePixelRatio||1,coarse.matches?1.5:1.75);
    const w=Math.round(width*dpr),h=Math.round(height*dpr);if(canvas.width!==w)canvas.width=w;if(canvas.height!==h)canvas.height=h;
    size=Math.min(width*.86,height*.84);ox=width*.51-size*.5;oy=height*.89-size;actionBounds();buildIce();buildGround();
    if(shards.length&&now()-shatterAt<2)makeShards();invalidate();
  };
  function draw(t:number):void {
    if(!ready||disposed)return;ctx!.setTransform(dpr,0,0,dpr,0,0);ctx!.clearRect(0,0,width,height);
    const px=ox,py=oy,breakTime=t-shatterAt;
    const keyOpacity=1;
    const exposed=state.phase==='opened'||state.phase==='ready';
    const groundOpacity=exposed?Math.max(0,1-breakTime/.6):1;
    if(groundOpacity){ctx!.save();ctx!.globalAlpha=groundOpacity;ctx!.drawImage(ground,0,0,width,height);ctx!.restore();}
    const lift=exposed?(reduced.matches?size*.035:Math.min(1,Math.max(0,breakTime)/.7)*size*.045):0;
    const normal={x:px+size*.23,y:py+size*.25-lift,w:size*.41,h:size*.615};
    const settledHeight=Math.min(height*.32,220),settledWidth=settledHeight/1.5;
    const settled={x:width*.51-settledWidth*.5,y:height*.07,w:settledWidth,h:settledHeight};
    const blend=state.phase==='ready'?keyPose.progress:0;
    const keyX=normal.x+(settled.x-normal.x)*blend,keyY=normal.y+(settled.y-normal.y)*blend,kw=normal.w+(settled.w-normal.w)*blend,kh=normal.h+(settled.h-normal.h)*blend;
    ctx!.save();ctx!.globalAlpha=keyOpacity*(exposed?1:.70);ctx!.drawImage(key,keyX,keyY,kw,kh);ctx!.restore();
    if(!exposed){
      // The guide is opaque in its center. A deliberate glass/photo blend exposes
      // the independent key; a second frost pass embeds it below the surface.
      ctx!.save();ctx!.globalAlpha=.80;ctx!.drawImage(ice,px,py,size,size);ctx!.restore();
      ctx!.save();path(ctx!,[{x:px+size*.13,y:py+size*.29},{x:px+size*.76,y:py+size*.29},{x:px+size*.76,y:py+size*.88},{x:px+size*.12,y:py+size*.87}]);ctx!.clip();ctx!.globalAlpha=.25;ctx!.drawImage(key,keyX+size*.003,keyY,kw,kh);ctx!.globalAlpha=.21;ctx!.drawImage(ice,px,py,size,size);ctx!.restore();
    }
    if(exposed&&Number.isFinite(shatterAt)&&breakTime<1.9){
      for(const s of shards){const age=Math.max(0,breakTime-s.delay),fade=reduced.matches?Math.max(0,1-age/.35):Math.max(0,1-Math.max(0,age-.8)/.85);if(!fade)continue;
        const dx=reduced.matches?0:s.vx*age,dy=reduced.matches?0:s.vy*age+size*1.6*age*age;
        const angle=reduced.matches?0:s.angle+s.spin*age;
        const bottom=py+s.cy*size+dy+Math.abs(Math.sin(angle))*s.canvas.width/dpr*.5+Math.abs(Math.cos(angle))*s.canvas.height/dpr*.5;
        // Fade the whole fragment before any corner reaches the canvas boundary.
        // Clipping a lit fragment at that boundary otherwise leaves a bright bar.
        const edgeFade=Math.min(1,Math.max(0,(height-18-bottom)/Math.max(36,height*.10)));
        if(!edgeFade)continue;
        ctx!.save();ctx!.globalAlpha=fade*edgeFade*.83;ctx!.translate(px+s.cx*size+dx,py+s.cy*size+dy);ctx!.rotate(angle);ctx!.drawImage(s.canvas,(s.x-s.cx)*size-2/dpr,(s.y-s.cy)*size-2/dpr,s.canvas.width/dpr,s.canvas.height/dpr);ctx!.restore();
      }
    }
    const age=t-impactAt;
    if(age<.65&&impact){
      if(age<.22){ctx!.save();ctx!.globalAlpha=Math.max(0,1-age/.22);ctx!.drawImage(surfaceFlash,px,py,size,size);ctx!.restore();}
      if(!reduced.matches){ctx!.save();ctx!.fillStyle='#dbf5ff';for(const p of dust){const a=Math.max(0,1-age/p.life);ctx!.globalAlpha=a*.7;ctx!.beginPath();const cx=px+p.x*size+p.vx*age,cy=py+p.y*size+p.vy*age+size*.95*age*age;ctx!.moveTo(cx,cy-p.size);ctx!.lineTo(cx+p.size*.7,cy+p.size);ctx!.lineTo(cx-p.size,cy+p.size*.7);ctx!.closePath();ctx!.fill();}ctx!.restore();}
    }
  }
  function frame():void {
    if(disposed||document.hidden||!visible){sleep();return;}
    const t=now(),interval=1/(coarse.matches?30:60);if(t-last<interval)return;last=t;
    draw(t);
    const effects=t-impactAt<.7||t-shatterAt<(reduced.matches?.4:1.9)||t-collectAt<1.05;
    if(!effects)sleep();
  }
  const updateGesture=()=>{
    gesture.textContent=state.phase==='waiting'?'Your key is waiting inside.':state.phase==='breakable'?(state.strikes?`${5-state.strikes} ${5-state.strikes===1?'strike':'strikes'} left. Keep going.`:'Click the ice to break it.'):state.phase==='opened'?(state.canAct?'Click the golden key. It’s yours.':'Let the last pieces fall.'):state.phase==='ready'?'Your next session, unlocked.':'Your key is waiting inside.';
    meter.forEach((dot,i)=>dot.classList.toggle('is-hit',i<state.strikes));
  };
  const receive=(event:Event)=>{
    const next=(event as CustomEvent<IceVaultSnapshot>).detail;if(!next)return;
    const previous=state;state=next;updateGesture();
    if(next.strikes===0&&previous.strikes>0){collectTween?.kill();keyPose.progress=1;cracks=[];damageOrigins=[];shards=[];impactAt=shatterAt=collectAt=-Infinity;dust=[];impact=undefined;buildIce();}
    if(next.strikes>previous.strikes){
      impact=pendingImpact||defaults[(next.strikes-1)%5];makeCracks(next.strikes,impact);buildIce();impactAt=now();
      const rng=random(91+next.strikes);dust=Array.from({length:14},()=>({x:impact!.x,y:impact!.y,vx:(rng()-.5)*size*.7,vy:-rng()*size*.65,life:.35+rng()*.3,size:1+rng()*2.4}));
      hammer.classList.add('is-swinging');if(swingTimer)clearTimeout(swingTimer);swingTimer=setTimeout(()=>hammer.classList.remove('is-swinging'),170);
    }
    if(next.phase==='opened'&&previous.phase!=='opened'&&!firstState){shatterAt=now();makeShards();scene.classList.remove('is-aiming');}
    if(next.phase==='ready'&&previous.phase!=='ready'&&!firstState){collectAt=now();scene.classList.remove('is-aiming');collectTween?.kill();keyPose.progress=reduced.matches?1:0;if(!reduced.matches)collectTween=gsap.to(keyPose,{progress:1,duration:.9,ease:'power3.inOut',onComplete:()=>invalidate()});}
    if(firstState){cracks=[];damageOrigins=[];for(let i=1;i<=state.strikes;i++)makeCracks(i);buildIce();firstState=false;}
    actionBounds();
    if(next.phase!==previous.phase||next.strikes!==previous.strikes)invalidate();
    pendingImpact=undefined;
  };
  root.addEventListener('ice-vault-state',receive,{signal});
  action.addEventListener('click',event=>{
    if(state.phase!=='breakable'||root.dataset.stageFallback==='true')return;
    if(event.detail===0){pendingImpact=defaults[state.strikes%5];return;}
    const box=scene.getBoundingClientRect();const p={x:(event.clientX-box.left-ox)/size,y:(event.clientY-box.top-oy)/size};
    if(!contains(p)){event.preventDefault();event.stopImmediatePropagation();return;}pendingImpact=p;
  },{capture:true,signal});
  scene.addEventListener('pointermove',event=>{
    if(event.pointerType!=='mouse'||coarse.matches||state.phase==='ready')return;
    const box=scene.getBoundingClientRect(),mx=event.clientX-box.left,my=event.clientY-box.top;
    hammer.style.transform=`translate3d(${mx-22}px,${my-18}px,0) rotate(-18deg)`;
  },{passive:true,signal});
  scene.addEventListener('pointerleave',()=>scene.classList.remove('is-aiming'),{signal});
  action.addEventListener('pointerenter',()=>{scene.classList.add('is-aiming');},{signal});action.addEventListener('pointerleave',()=>scene.classList.remove('is-aiming'),{signal});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)sleep();else invalidate();},{signal});
  window.addEventListener('pageshow',()=>invalidate(),{signal});window.addEventListener('resize',resize,{passive:true,signal});
  reduced.addEventListener('change',()=>{if(reduced.matches){collectTween?.kill();keyPose.progress=1;}invalidate();},{signal});
  const observer=new ResizeObserver(resize);observer.observe(scene);
  const visibility=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible)invalidate();else sleep();});visibility.observe(scene);
  cube.src=ASSETS+(coarse.matches?'cube-room-v3-mobile.webp':'cube-room-v3.webp');key.src=ASSETS+'key.webp';
  Promise.all([cube.decode(),key.decode()]).then(()=>{
    if(disposed)return;interior=createIceInterior(cube);ready=true;scene.dataset.assets='ready';scene.dataset.camera='fixed';resize();updateGesture();root.dispatchEvent(new CustomEvent('ice-vault-ready'));
  }).catch(()=>{if(!disposed){root.dataset.stageFallback='true';canvas.hidden=true;scene.dataset.renderState='fallback';}});
  resize();
  return()=>{if(disposed)return;disposed=true;collectTween?.kill();sleep();events.abort();observer.disconnect();visibility.disconnect();if(swingTimer)clearTimeout(swingTimer);shards=[];dust=[];if(interior)interior.width=interior.height=1;ice.width=ice.height=ground.width=ground.height=fractures.width=fractures.height=surfaceFlash.width=surfaceFlash.height=1;};
}
