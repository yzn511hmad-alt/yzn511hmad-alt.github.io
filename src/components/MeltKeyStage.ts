import {createEarlyEffects} from './EarlyEffects';
import {createAuroraIrradianceBake} from '../webgl/AuroraIrradianceBake';
import { preparePMREM } from '../webgl/PreparePMREM';
import { attachAuroraReflection } from './AuroraLighting';
import {setCampDetail,setCompactCamp,setPhoneSnow} from './CampPlate';
import * as THREE from 'three';
import { winterPit } from './WinterComposition';
import gsap from 'gsap';
import { SharedSurface } from '../webgl/SharedRenderer';
import { onFrame } from '../core/FrameLoop';
import { QualityTier } from '../core/QualityTier';
import { createMeltKeyModel } from './MeltKeyModel';
import { createWalnutChest } from './WalnutChest';
import { createSnowTerrain } from './SnowTerrain';
import { createPhotographicAurora } from './PhotographicAurora';
import { createFlameVideo } from './FlameVideo';
import { createChestUnlock,createChestAccessCard } from './ChestUnlock';
import { preloadIceGeometry } from './createMeltIceGeometry';

type MeltSnapshot={phase:'waiting'|'available'|'ready';progress:number;remaining:number;keyVisible:boolean;canAct:boolean};

export function initMeltKeyStage(root:HTMLElement):()=>void {
  const host=root.querySelector<HTMLElement>('.ice-scene')!;
  const geometryTrial=root.dataset.geometryTrial;
  const compactGeometry=geometryTrial==='compact';
  const highDetail=host.clientWidth>=900&&host.clientWidth/host.clientHeight>=1.25&&!QualityTier.lowPower;
  const canvas=root.querySelector<HTMLCanvasElement>('#ice-vault-canvas')!;
  const action=root.querySelector<HTMLButtonElement>('#ice-vault-action')!;
  const events=new AbortController(),signal=events.signal;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const quality=matchMedia('(max-width:767px), (pointer:coarse)');
  const connection=(navigator as Navigator & {connection?:EventTarget}).connection;
  let disposed=false,visible=false,failed=false,width=1,height=1;
  let unsubscribe:(()=>void)|undefined,last=-Infinity,lastMeta=-Infinity,renderCount=0;
  let collectTween:gsap.core.Tween|undefined;
  let collecting=false,ambientTime=0;
  let presented=false,handoff=0;
  let prewarmed=false;
  let constructionReady=false,shadersReady=false,shaderPending=false;
  let compiledVariant='',warmVariant='';
  let effectsPass:ReturnType<typeof createEarlyEffects>|undefined,effectsSetupReady=false,effectsPresented=false;
  let beginProps:()=>void=()=>{};const effectsStart=new Promise<void>(resolve=>{beginProps=resolve;});
  let layoutVersion=0,lastPoseLayout=-1,lastPoseProgress=NaN,lastPoseCollect=NaN,lastPosePhase='';
  let uploadsReady=false,uploadPending=false,warmFrames=0,gpuFence:WebGLSync|null=null;
  let fenceUnsupported=false;
  let uploadFrame=0,invalidationFrame=0;
  const uploadTextures=async()=>{
    const textures=new Set<THREE.Texture>();
    const add=(value:unknown)=>{if(value instanceof THREE.Texture&&value.image&&!value.isRenderTargetTexture&&!(value instanceof THREE.VideoTexture))textures.add(value);};
    add(scene.background);
    add(phoneSnow);add(campDetail);model?.startupTextures.forEach(add);
    scene.traverse(node=>{if(!(node instanceof THREE.Mesh))return;
      for(const material of Array.isArray(node.material)?node.material:[node.material]){
        Object.values(material).forEach(add);
        if('uniforms' in material)Object.values((material as THREE.ShaderMaterial).uniforms).forEach(uniform=>add(uniform.value));
      }
    });
    const decodes: Promise<void>[] = [];
    for(const texture of textures){
      const image=texture.image as {decode?:()=>Promise<void>};
      if(image?.decode)decodes.push(image.decode().catch(()=>{}));
    }
    await Promise.all(decodes);
    if(disposed||failed||!surface)return;
    for(const texture of textures){
      surface.engine.initTexture(texture);
    }
    if(disposed||failed)return;uploadsReady=true;host.dataset.uploadsReady='true';invalidate();
  };
  let startupPMREM:THREE.PMREMGenerator|undefined;
  const startupRooms=new Set<THREE.Scene>();
  const releaseStartup=()=>{startupRooms.forEach(room=>{room.traverse(o=>{if(o instanceof THREE.Mesh){o.geometry.dispose();(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m.dispose());}});room.clear();});startupRooms.clear();startupPMREM?.dispose();startupPMREM=undefined;};
  const pose={collect:root.dataset.phase==='ready'?1:0};
  let stillProgress=Number(root.dataset.progress)||0;
  let state:MeltSnapshot={phase:(root.dataset.phase as MeltSnapshot['phase'])||'waiting',progress:Number(root.dataset.progress)||0,remaining:Number(root.dataset.remaining)||30,keyVisible:false,canAct:false};
  const scene=new THREE.Scene();
  scene.background=new THREE.Color(getComputedStyle(root).getPropertyValue('--melt-floor').trim()||'#ffffff');
  const camera=new THREE.PerspectiveCamera(40,1,.1,500);
  const cameraTarget=new THREE.Vector3(0,3.1,0);
  const cameraOffset=new THREE.Vector3(-8.004,.8,12.093);
  camera.position.copy(cameraTarget).add(cameraOffset);camera.lookAt(cameraTarget);
  let surface:SharedSurface|undefined;
  let model:ReturnType<typeof createMeltKeyModel>|undefined;
  let chest:ReturnType<typeof createWalnutChest>|undefined;
  let accessCard:ReturnType<typeof createChestAccessCard>|undefined;
  let unlock:ReturnType<typeof createChestUnlock>|undefined;
  let unlockTelemetry:ReturnType<ReturnType<typeof createChestUnlock>['apply']>|undefined;
  let environment:THREE.WebGLRenderTarget|undefined;
  let iceSkyEnvironment:THREE.WebGLRenderTarget|undefined;
  let chestEnvironment:THREE.WebGLRenderTarget|undefined;
  let groundKeyLight:THREE.DirectionalLight|undefined;
  let irradiance:ReturnType<typeof createAuroraIrradianceBake>;
  let sky:ReturnType<typeof createPhotographicAurora>|undefined;
  let fire:ReturnType<typeof createFlameVideo>|undefined;
  let campDetail:THREE.Texture|undefined;
  let phoneSnow:THREE.Texture|undefined,phoneSnowSettled=false,compactGround=false;
  let backdrop:THREE.Texture|undefined,landscapePlate:THREE.Texture|undefined,portraitPlate:THREE.Texture|undefined;
  let snowTerrain:ReturnType<typeof createSnowTerrain>|undefined;
  let originalCamp:{icePosition:THREE.Vector3;iceScale:number;chestPosition:THREE.Vector3;chestScale:number}|undefined;
  let savedShadows:{enabled:boolean;type:THREE.ShadowMapType}|undefined;
  const assetsReady=()=>!!((!compactGround||phoneSnowSettled)&&backdrop?.image&&sky?.ready&&(fire?.root.userData.posterReady||fire?.root.userData.videoReady));
  const metadata=()=>{host.dataset.chestLid=String(unlockTelemetry?.lid??0);host.dataset.chestCard=String(unlockTelemetry?.card??0);host.dataset.keyInsertion=String(unlockTelemetry?.insertion??0);host.dataset.keyTurn=String(unlockTelemetry?.turn??0);if(!unlockTelemetry){delete host.dataset.keyTip;delete host.dataset.keySocket;delete host.dataset.keyAxisError;}if(model)host.dataset.keyWorld=model.key.getWorldPosition(new THREE.Vector3()).toArray().join(',');host.dataset.collectProgress=pose.collect.toFixed(4);if(unlockTelemetry){host.dataset.chestLid=unlockTelemetry.lid.toFixed(4);host.dataset.chestCard=unlockTelemetry.card.toFixed(4);host.dataset.keyInsertion=unlockTelemetry.insertion.toFixed(4);host.dataset.keyTurn=unlockTelemetry.turn.toFixed(4);host.dataset.keyTip=unlockTelemetry.keyTip.join(',');host.dataset.keySocket=unlockTelemetry.socket.join(',');host.dataset.keyAxisError=String(unlockTelemetry.axisError);}host.dataset.chestReady=String(!!chest);host.dataset.chestMaterialReady=String(chest?.root.userData.materialReady??false);host.dataset.chestMaterialError=String(chest?.root.userData.materialError??false);host.dataset.collecting=String(collecting);host.dataset.cameraPose=[...camera.position.toArray(),...camera.quaternion.toArray()].map(n=>n.toFixed(6)).join(',');host.dataset.renderCount=String(renderCount);host.dataset.ambientTime=ambientTime.toFixed(3);host.dataset.aurora=sky?.state??'still';host.dataset.auroraLook='upper-local-v9';host.dataset.auroraTexture=sky?.textureVariant??'loading';host.dataset.auroraGround='off';host.dataset.fire=fire?.root.userData.playing?'burning':'still';host.dataset.fireReady=String(fire?.root.userData.videoReady??false);host.dataset.auroraReady=String(sky?.ready??false);host.dataset.fireVideoTime=String(fire?.video.currentTime??0);host.dataset.fireVideoDuration=String(fire?.video.duration??0);host.dataset.fireResolution=fire?[fire.video.videoWidth,fire.video.videoHeight].join('x'):'';host.dataset.detailQuality=highDetail?'enhanced':'baseline';host.dataset.auroraVideoTime=String(sky?.time??0);host.dataset.meltProgress=state.progress.toFixed(3);if(model){host.dataset.materialStudy=String(model.root.userData.materialStudy);host.dataset.materialReady=String(model.root.userData.materialReady);const water=model.root.userData.meltwater;host.dataset.waterArea=String(water?.area??0);host.dataset.waterVolume=String(water?.visualVolume??0);host.dataset.waterHeight=String(water?.filmHeight??0);host.dataset.waterTint=String(water?.tint??'');host.dataset.waterWetness=String(water?.wetness??0);host.dataset.waterRunoff=String(water?.runoffVisible??false);const visual=model.root.userData.meltVisual;host.dataset.iceTint=String(visual?.iceTint??'');host.dataset.keyReveal=String(visual?.keyReveal??0);host.dataset.glowAlpha=String(visual?.glowAlpha??0);host.dataset.iceScale=String(visual?.iceScale??0);host.dataset.iceOpacity=String(visual?.iceOpacity??0);}if(surface){host.dataset.triangles=String(surface.engine.info.render.triangles);host.dataset.drawCalls=String(surface.engine.info.render.calls);}};
  const sleep=(status='idle')=>{sky?.setActive(false);fire?.pause();unsubscribe?.();unsubscribe=undefined;host.dataset.renderState=status;metadata();};
  const fallback=()=>{
    if(disposed||failed)return;failed=true;presented=false;collecting=false;collectTween?.kill();sleep('fallback');canvas.hidden=true;
    root.dataset.effectsPresented='false';root.dataset.stageFallback='true';root.dataset.meltStage='fallback';root.dataset.scenePresented='false';
    cancelAnimationFrame(handoff);
    root.dispatchEvent(new CustomEvent('melt-key-fallback'));
  };
  const projectHitTarget=()=>{
    if(!model||state.phase!=='available'||failed)return;
    model.root.updateMatrixWorld(true);camera.updateMatrixWorld(true);
    const b=new THREE.Box3().setFromObject(model.key);
    let x0=Infinity,y0=Infinity,x1=-Infinity,y1=-Infinity;
    for(const x of [b.min.x,b.max.x])for(const y of [b.min.y,b.max.y])for(const z of [b.min.z,b.max.z]){
      const p=new THREE.Vector3(x,y,z).project(camera),px=(p.x*.5+.5)*width,py=(-p.y*.5+.5)*height;
      x0=Math.min(x0,px);x1=Math.max(x1,px);y0=Math.min(y0,py);y1=Math.max(y1,py);
    }
    const targetWidth=Math.max(44,x1-x0+24),targetHeight=Math.max(44,y1-y0+24);
    Object.assign(action.style,{left:`${Math.max(0,Math.min(width-targetWidth,(x0+x1-targetWidth)/2))}px`,top:`${Math.max(0,Math.min(height-targetHeight,(y0+y1-targetHeight)/2))}px`,width:`${Math.min(width,targetWidth)}px`,height:`${Math.min(height,targetHeight)}px`,borderRadius:'24px'});
  };
  const lootAnchor=new THREE.Vector3();let lastLootX=-Infinity,lastLootY=-Infinity,rewardLeft=16,rewardTop=96,lootProjectionDirty=true;
  const projectLootCard=()=>{
    if(!accessCard||state.phase!=='ready'||(pose.collect>=1&&!collecting&&!lootProjectionDirty))return;
    lootProjectionDirty=false;
    accessCard.root.getWorldPosition(lootAnchor);lootAnchor.project(camera);
    const viewport=host.getBoundingClientRect();
    host.dataset.cardOrigin=`${(viewport.left+(lootAnchor.x*.5+.5)*width).toFixed(1)},${(viewport.top+(-lootAnchor.y*.5+.5)*height).toFixed(1)}`;
    const cardWidth=Math.min(width<700?280:320,width-32);
    const x=THREE.MathUtils.clamp((lootAnchor.x*.5+.5)*width,Math.min(width-cardWidth/2-16,rewardLeft+cardWidth/2),width-cardWidth/2-16);
    const y=THREE.MathUtils.clamp((-lootAnchor.y*.5+.5)*height-18,rewardTop,height-100);
    if(Math.abs(x-lastLootX)>.5||Math.abs(y-lastLootY)>.5){
      host.style.setProperty('--loot-x',`${x.toFixed(1)}px`);host.style.setProperty('--loot-y',`${y.toFixed(1)}px`);
      host.dataset.lootAnchor=`${x.toFixed(1)},${y.toFixed(1)}`;lastLootX=x;lastLootY=y;
    }
  };
  const waitForScene=(reason:string)=>{
    // Keep the complete frame on screen while a late video shader compiles.
    if(presented){sleep(reason);return;}
    effectsPass?.render(ambientTime,visible,!reduced.matches);
    if(!visible)sleep(reason);
  };
  const draw=()=>{
    if(disposed||failed||(!visible&&prewarmed)||document.hidden||!surface)return;
    if(!model||!constructionReady){waitForScene('effects-first');return;}
    if(!presented&&gpuFence){
      const gl=surface.engine.getContext() as WebGL2RenderingContext;
      const result=gl.clientWaitSync(gpuFence,0,0);
      // fence check: gl.deleteSync follows
      gl.deleteSync(gpuFence);gpuFence=null;
      if(result===gl.WAIT_FAILED){fenceUnsupported=true;host.dataset.gpuWarmup='frame-fallback';}
      else{warmFrames++;host.dataset.gpuWarmup='fence-complete';}
    }
    const progress=reduced.matches&&state.phase==='waiting'?stillProgress:state.progress;
    camera.updateMatrixWorld();sky?.setCamera(camera);
    // Preserve the approved ice optics and motion; only reposition its group.
    // Once collected, the same physical key travels to the chest socket.
    const fade=THREE.MathUtils.smoothstep(pose.collect,.46,.72);
    const poseChanged=progress!==lastPoseProgress||pose.collect!==lastPoseCollect||state.phase!==lastPosePhase||layoutVersion!==lastPoseLayout;
    if(poseChanged){
    lootProjectionDirty=true;
    model.update(progress,fade);
    if(chest&&accessCard&&unlock){
      if(state.phase==='ready'){
        unlockTelemetry=unlock.apply(pose.collect);
        chest.update(unlockTelemetry.lid);accessCard.update(unlockTelemetry.card);
      }else{
        chest.update(0);accessCard.update(0);unlockTelemetry=undefined;
      }
    }
    lastPoseProgress=progress;lastPoseCollect=pose.collect;lastPosePhase=state.phase;lastPoseLayout=layoutVersion;
    if(groundKeyLight)groundKeyLight.shadow.needsUpdate=true;
    }
    snowTerrain?.update(progress,fade,ambientTime);
    fire?.setMotion(!reduced.matches);
    // Do not repeatedly draw incomplete frames behind the ready poster.
    if(!assetsReady()){waitForScene('loading');return;}
    if(!uploadsReady){
      if(!uploadPending){uploadPending=true;void uploadTextures().catch(fallback);}
      waitForScene('uploading');return;
    }
    const currentVariant=String(!!fire?.root.userData.videoReady)+':'+String(reduced.matches)+':'+(state.phase==='ready'?'open':'ice');
    if(!presented&&warmVariant!==currentVariant){
      warmVariant=currentVariant;warmFrames=0;
      if(gpuFence){(surface.engine.getContext() as WebGL2RenderingContext).deleteSync(gpuFence);gpuFence=null;}
    }
    shadersReady = true;
    if(!shadersReady){
      if(!shaderPending){
        shaderPending=true;
        const variant=currentVariant;
        surface.engine.toneMapping=surface.toneMapping;surface.engine.toneMappingExposure=surface.toneMappingExposure;surface.engine.outputColorSpace=surface.outputColorSpace;
        const engine=surface.engine;
        const opaqueCompileRoot=new THREE.Group();
        const compileRoot=new THREE.Group();
        const compiledMaterials=new Set<THREE.Material>();
        scene.traverse(node=>{
          if(!(node instanceof THREE.Mesh)||node===model!.floor)return;
          if((node===model!.ice||node.name==='surface-hoar')&&!node.visible)return;
          const mat=Array.isArray(node.material)?node.material[0]:node.material;
          if(!compiledMaterials.has(mat)){
            compiledMaterials.add(mat);
            compileRoot.add(node.clone(false));
          }
          if(node!==model!.ice&&node.name!=='surface-hoar'){
            if(node.name==='user-original-aurora'||node.name==='snow-terrain'||(snowTerrain&&node.parent===snowTerrain.root)){
              opaqueCompileRoot.add(node.clone(false));
            }
          }
        });
        void (async()=>{
          let p1:Promise<unknown>=Promise.resolve();
          if(environment&&model!.ice.visible){
            const target=engine.getRenderTarget(),face=engine.getActiveCubeFace(),mip=engine.getActiveMipmapLevel(),tone=engine.toneMapping;
            try{
              engine.setRenderTarget(environment);
              engine.toneMapping=THREE.NoToneMapping;
              p1=engine.compileAsync(opaqueCompileRoot,camera,scene);
            }finally{
              engine.setRenderTarget(target,face,mip);
              engine.toneMapping=tone;
            }
          }
          const p2=engine.compileAsync(compileRoot,camera,scene);
          await Promise.all([p1,p2]);
        })().then(()=>{
          shaderPending=false;if(disposed||failed)return;
          compiledVariant=variant;shadersReady=variant===String(!!fire?.root.userData.videoReady)+':'+String(reduced.matches)+':'+(state.phase==='ready'?'open':'ice');
          invalidate();
        }).catch(()=>fallback());
      }
      waitForScene('compiling');return;
    }
    // Start playback only when drawing can continue; pausing an in-flight
    // video.play() during shader preparation can mark autoplay as blocked.
    sky?.setActive(visible&&!reduced.matches);sky?.update(ambientTime);fire?.setMotion(!reduced.matches);fire?.update(ambientTime,camera,visible&&!reduced.matches);
    if(fire){
      const metric=width<700&&chest?Math.max(1,chest.root.scale.x):1;
      fire.light.distance=14*metric;
      const flicker=1.+.18*Math.sin(ambientTime*6.7)+.12*Math.cos(ambientTime*11.3)+.06*Math.sin(ambientTime*23.1);
      fire.light.intensity=(width<700?5.0:highDetail?9.0:14.0)*metric*metric*flicker;
    }
    irradiance?.update();
    surface.render(scene,camera);renderCount++;
    if(!visible){prewarmed=true;host.dataset.prewarmed='true';sky?.setActive(false);fire?.pause();host.dataset.renderState='prewarmed';metadata();return;}
    if(presented&&!reduced.matches)fire?.loadVideo();
    projectHitTarget();projectLootCard();
    // Immediate progressive presentation once environment and models are mounted
    if(!presented&&backdrop?.image&&sky?.ready&&model&&chest&&(fire?.root.userData.posterReady||fire?.root.userData.videoReady)){
      presented=true;root.dataset.scenePresented='true';root.dataset.meltStage='ready';
      root.dispatchEvent(new CustomEvent('melt-key-ready'));
      if(!reduced.matches)fire?.loadVideo();
    }
  };
  const frame=(time:number)=>{
    if(disposed||failed||!visible||document.hidden){sleep('paused');return;}
    const interval=QualityTier.getFrameInterval();if(time-last+1e-5<interval)return;
    if((presented||effectsPresented)&&!reduced.matches&&Number.isFinite(last))ambientTime+=Math.min(time-last,.1);last=time;
    draw();if(time-lastMeta>.25){metadata();lastMeta=time;}
    if(reduced.matches&&!collecting&&presented)sleep();
  };
  const wake=()=>{
    if(disposed||failed||!visible||document.hidden||unsubscribe)return;
    host.dataset.renderState='active';last=-Infinity;unsubscribe=onFrame(frame);
  };
  const invalidate=()=>{if(disposed||failed||invalidationFrame)return;invalidationFrame=requestAnimationFrame(()=>{invalidationFrame=0;if(disposed||failed)return;draw();wake();});};
  const loadPlate=(isPortrait:boolean)=>{
    const url=highDetail&&!isPortrait?'/assets/quality-v3/snow-restored.webp':`/assets/realistic-winter/winter-camp-${isPortrait?'portrait-v5':'landscape-v3'}.webp`;
    const texture=new THREE.Texture();
    if(typeof createImageBitmap!=='undefined'){
      new THREE.ImageBitmapLoader().setOptions({imageOrientation:'flipY',premultiplyAlpha:'none',colorSpaceConversion:'default'}).load(url,bitmap=>{
        if(disposed){bitmap.close();return;}texture.image=bitmap;texture.needsUpdate=true;host.dataset.background='photographic-winter';resize();
      },undefined,fallback);
      texture.flipY=false;
    }else{
      const t=new THREE.TextureLoader().load(url,()=>{
        if(disposed){t.dispose();return;}texture.image=t.image;texture.needsUpdate=true;host.dataset.background='photographic-winter';resize();
      },undefined,fallback);
    }
    texture.colorSpace=THREE.SRGBColorSpace;return texture;
  };
  const resize=()=>{
    if(disposed||failed||!surface)return;
    if(!presented){warmFrames=0;if(gpuFence){(surface.engine.getContext() as WebGL2RenderingContext).deleteSync(gpuFence);gpuFence=null;}}
    layoutVersion++;
    cancelAnimationFrame(handoff);handoff=0;
    const bounds=host.getBoundingClientRect();width=Math.max(1,bounds.width);height=Math.max(1,bounds.height);
    const rail=root.querySelector<HTMLElement>('.ice-copy')?.getBoundingClientRect();
    rewardLeft=rail&&width>=900?Math.max(16,rail.right-bounds.left+16):16;
    rewardTop=rail&&width>=700&&width<900?Math.min(height-100,rail.bottom-bounds.top+100):96;
    const dpr=QualityTier.getDPR();surface.setPixelRatio(dpr);surface.setSize(width,height);
    surface.engine.transmissionResolutionScale=QualityTier.lowPower?.5:1;
    host.dataset.transmissionScale=String(surface.engine.transmissionResolutionScale);
    host.dataset.qualityDpr=String(dpr);host.dataset.qualityTier=QualityTier.lowPower?'mobile':'desktop';
    const isPortrait=width/height<1.25;
    const compactCamp=width<900||isPortrait||matchMedia('(pointer:coarse) and (max-width:1366px)').matches;
    const landscapeTablet=compactCamp&&!isPortrait&&width>=900;
    const phone=width<700;model?.setNaturalClarity(phone);
    compactGround=compactCamp;
    if(phone){ phoneSnowSettled=true; }
    else if(compactGround&&!phoneSnow){
      phoneSnow=new THREE.TextureLoader().load('/assets/quality-v3/snow-restored.webp',texture=>{
        if(disposed){texture.dispose();return;}phoneSnowSettled=true;setPhoneSnow(texture,compactGround,width<700);host.dataset.phoneSnow=compactGround?'laptop-plate':'inactive';invalidate();
      },undefined,()=>{if(!disposed){phoneSnowSettled=true;host.dataset.phoneSnow='unavailable';invalidate();}});
      phoneSnow.colorSpace=THREE.SRGBColorSpace;
    }
    setPhoneSnow(phoneSnow,compactGround,phone);host.dataset.phoneSnow=compactGround&&phoneSnow?.image?'laptop-plate':'inactive';
    if(sky)sky.lighting.uAuroraGroundStrength.value=0;
    host.dataset.auroraGround='off';
    host.dataset.campFraming=compactCamp?'close':'laptop';
    if(isPortrait&&!portraitPlate)portraitPlate=loadPlate(true);
    if(!isPortrait&&!landscapePlate)landscapePlate=loadPlate(false);
    const nextPlate=isPortrait?portraitPlate:landscapePlate;
    if(nextPlate&&nextPlate!==backdrop){backdrop=nextPlate;scene.background=backdrop;snowTerrain?.setBackground(backdrop);}
    if(backdrop?.image){
      const image=backdrop.image as HTMLImageElement,imageAspect=image.width/image.height,viewAspect=width/height;
      // Desktop composition leaves breathing room beside the copy. Keep the fire
      // and its photographed stone pit in the same source-space crop.
      const closeLaptop=width>=900&&!isPortrait;
      const compositionInset=isPortrait?0:closeLaptop?.12:.05;
      backdrop.repeat.set(Math.min(1,viewAspect/imageAspect)*(1-compositionInset),Math.min(1,imageAspect/viewAspect)*(1-compositionInset));
      backdrop.offset.set((1-backdrop.repeat.x)/2-compositionInset/2,(1-backdrop.repeat.y)/2);backdrop.userData.closeCamp=closeLaptop;backdrop.userData.highDetail=highDetail&&!isPortrait;backdrop.userData.integratedPhone=phone;
      if(compactCamp){
        const campScreenX=phone?.51:isPortrait?0.51:.70;
        const campScreenY=phone?.880:isPortrait?0.82:landscapeTablet?.86:.79;
        const x=campScreenX*backdrop.repeat.x+backdrop.offset.x;
        const y=1-((1-campScreenY)*backdrop.repeat.y+backdrop.offset.y);
        const zoom=phone?2.40:landscapeTablet?1.65:2;
        backdrop.userData.compactPit={x,y,zoom};setCompactCamp(x,y,zoom,isPortrait);
      }else{delete backdrop.userData.compactPit;setCompactCamp();}
      backdrop.updateMatrix();sky?.setCrop(backdrop,isPortrait);fire?.setComposition(backdrop,isPortrait);
    }
    if(presented&&(!backdrop?.image||!sky?.ready)){
      warmFrames=0;if(gpuFence){(surface.engine.getContext() as WebGL2RenderingContext).deleteSync(gpuFence);gpuFence=null;}
      uploadsReady=false;uploadPending=false;
      presented=false;root.dataset.scenePresented='false';root.dataset.meltStage='loading';
      document.dispatchEvent(new CustomEvent('melt-key-poster-state',{detail:state.phase}));
    }
    camera.aspect=width/height;
    const distance=Math.max(1,1.50/camera.aspect);
    const framedTarget=cameraTarget.clone();
    if(!isPortrait&&width>=900)framedTarget.addScaledVector(new THREE.Vector3(.834,0,.552),-2.6);
    else if(!isPortrait&&width>=700)framedTarget.addScaledVector(new THREE.Vector3(.834,0,.552),-.8);
    const framedOffset=cameraOffset.clone();if(isPortrait){framedTarget.y=4.2;framedOffset.y=-.8;}camera.position.copy(framedTarget).addScaledVector(framedOffset,distance);camera.lookAt(framedTarget);
    camera.updateProjectionMatrix();camera.updateMatrixWorld();
    if(model&&chest&&originalCamp){
      model.root.position.copy(originalCamp.icePosition);model.root.scale.setScalar(originalCamp.iceScale);
      chest.root.position.copy(originalCamp.chestPosition);chest.root.scale.setScalar(originalCamp.chestScale);
      chest.root.rotation.y = -.18;
      model.root.rotation.y = phone ? .10 : -.24;
      if(compactCamp){
        const place=(object:THREE.Object3D,x:number,y:number,fraction:number,hx:number,hz:number)=>{
          const ray=new THREE.Raycaster();ray.setFromCamera(new THREE.Vector2(x*2-1,1-y*2),camera);
          const base=ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0,1,0),.01),new THREE.Vector3());
          if(!base)return;object.position.copy(base);object.scale.setScalar(1);
          // Fit an unchanging local footprint, independent of melting/lid pose.
          for(let pass=0;pass<2;pass++){
            object.updateMatrixWorld(true);let min=Infinity,max=-Infinity;
            for(const px of [-hx,hx])for(const pz of [-hz,hz]){const p=new THREE.Vector3(px,0,pz).applyMatrix4(object.matrixWorld).project(camera);min=Math.min(min,p.x);max=Math.max(max,p.x);}
            object.scale.multiplyScalar(fraction*2/Math.max(.001,max-min));
          }
        };
        place(chest.root,phone?.185:isPortrait?0.20:.50,phone?.830:isPortrait?0.81:landscapeTablet?.78:.80,phone?.35:isPortrait?0.26:landscapeTablet?.19:.27,1.65,.95);
        place(model.root,phone?.830:isPortrait?0.82:landscapeTablet?.88:.86,phone?.830:isPortrait?0.81:landscapeTablet?.78:.80,phone?.28:isPortrait?0.22:landscapeTablet?.15:.22,1,1);
      }
    }
    // Align the moving flame to the photographed pit, including portrait art.
    if(model&&chest&&originalCamp){
      const placeSkeleton=(selector:string,object:THREE.Object3D,hx:number,hz:number,objectHeight:number)=>{
        const element=host.querySelector<HTMLElement>(selector);if(!element)return;
        object.updateWorldMatrix(true,false);
        let left=Infinity,right=-Infinity,top=Infinity,bottom=-Infinity;
        for(const x of [-hx,hx])for(const y of [0,objectHeight])for(const z of [-hz,hz]){
          const p=new THREE.Vector3(x,y,z).applyMatrix4(object.matrixWorld).project(camera);
          const px=(p.x*.5+.5)*width,py=(-p.y*.5+.5)*height;
          left=Math.min(left,px);right=Math.max(right,px);top=Math.min(top,py);bottom=Math.max(bottom,py);
        }
        Object.assign(element.style,{left:`${left}px`,top:`${top}px`,width:`${right-left}px`,height:`${bottom-top}px`,transform:'none'});
      };
      placeSkeleton('.winter-skeleton-chest',chest.root,1.65,.95,1.25);
      placeSkeleton('.winter-skeleton-ice',model.root,1,1,2);
    }
    if(fire&&backdrop?.image){
      if(isPortrait){
        const campScreenX=phone?0.508:0.508;
        const campScreenY=phone?0.878:0.818;
        const ray=new THREE.Raycaster();ray.setFromCamera(new THREE.Vector2(campScreenX*2-1,1-campScreenY*2),camera);
        const base=ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0,1,0),-.025),new THREE.Vector3());
        if(base){
          fire.root.position.copy(base);
          fire.mesh.position.y=0.20;
          const bottom=base.clone().project(camera),top=base.clone().add(new THREE.Vector3(0,1,0)).project(camera);
          const targetHeight=phone?0.138:0.145;
          const scale=targetHeight*2/Math.abs(top.y-bottom.y);fire.root.scale.setScalar(scale);
          fire.setExposure(1.40);
        }
      }else{
        fire.mesh.position.y=0.32;
        const pit=winterPit(false,width>=900&&!isPortrait,backdrop.userData.compactPit);
        const sourceY=pit.y+(pit.originalBaseY-pit.canonicalY)*pit.scale;
        const y=((1-sourceY-backdrop.offset.y)/backdrop.repeat.y)*2-1;
        const x=((pit.x-backdrop.offset.x)/backdrop.repeat.x)*2-1;
        const ray=new THREE.Raycaster();ray.setFromCamera(new THREE.Vector2(x,y),camera);
        const base=ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0,1,0),-.025),new THREE.Vector3());
        if(base){
          fire.root.position.copy(base);
          const bottom=base.clone().project(camera),top=base.clone().add(new THREE.Vector3(0,1,0)).project(camera);
          const targetHeight=pit.originalHeight*pit.scale/backdrop.repeat.y;
          const scale=targetHeight*2/Math.abs(top.y-bottom.y);fire.root.scale.setScalar(scale*1.12);
          fire.setExposure(1.30);
        }
      }
    }
    if(groundKeyLight&&chest&&model){
      const metric=phone?Math.max(1,chest.root.scale.x,model.root.scale.x):1;
      const center=phone?chest.root.position.clone().add(model.root.position).multiplyScalar(.5):new THREE.Vector3();
      groundKeyLight.target.position.copy(center);groundKeyLight.target.updateMatrixWorld();
      groundKeyLight.position.copy(center).add(new THREE.Vector3(-8,12,4).multiplyScalar(metric));
      const shadowCamera=groundKeyLight.shadow.camera;
      const extent=phone?Math.max(3.5,chest.root.position.distanceTo(model.root.position)*.5+2):15;
      Object.assign(shadowCamera,{left:-extent,right:extent,top:phone?extent:11,bottom:phone?-extent:-11,near:.1,far:45*metric});shadowCamera.updateProjectionMatrix();
      groundKeyLight.shadow.normalBias=.008*metric;
      groundKeyLight.shadow.needsUpdate=true;
    }
    invalidate();
    const anchor=(object:THREE.Object3D|undefined)=>{
      if(!object)return null;const point=object.getWorldPosition(new THREE.Vector3()).project(camera);
      return [+(point.x*.5+.5).toFixed(5),+(-point.y*.5+.5).toFixed(5)];
    };
    host.dataset.layoutAnchors=JSON.stringify({ice:anchor(model?.root),fire:anchor(fire?.root),chest:anchor(chest?.root)});
  };
  const receive=(event:Event)=>{
    const next=(event as CustomEvent<MeltSnapshot>).detail;if(!next||disposed)return;
    const previous=state.phase,previousProgress=state.progress;state=next;
    if(reduced.matches&&next.phase==='waiting'&&(previous!=='waiting'||next.progress<previousProgress))stillProgress=next.progress;
    if(next.phase==='ready'&&previous!=='ready'){
      collectTween?.kill();
      model?.update(1,0);unlock?.begin();
      collecting=!reduced.matches&&presented;
      root.dataset.unlocking=String(collecting);
      if(!collecting){
        pose.collect=1;root.dispatchEvent(new CustomEvent('melt-key-reveal-complete'));
      }else collectTween=gsap.to(pose,{collect:1,duration:4.4,ease:'none',onUpdate:wake,onComplete:()=>{
        collecting=false;collectTween=undefined;root.dataset.unlocking='false';invalidate();metadata();
        root.dispatchEvent(new CustomEvent('melt-key-reveal-complete'));
      }});
    }else if(next.phase!=='ready'&&previous==='ready'){
      cancelAnimationFrame(handoff);handoff=0;presented=false;shadersReady=false;warmFrames=0;warmVariant='';
      if(gpuFence&&surface)(surface.engine.getContext() as WebGL2RenderingContext).deleteSync(gpuFence);gpuFence=null;
      root.dataset.scenePresented='false';root.dataset.meltStage='loading';
      document.dispatchEvent(new CustomEvent('melt-key-poster-state',{detail:next.phase}));
      collecting=false;collectTween?.kill();collectTween=undefined;pose.collect=0;unlock?.reset();
      root.dataset.unlocking='false';unlockTelemetry=undefined;
    }
    if(previous!==next.phase)invalidate();
    else if(next.phase==='waiting'&&!reduced.matches)wake();
  };
  root.addEventListener('melt-key-state',receive,{signal});
  canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();fallback();},{signal});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){collectTween?.pause();sleep('paused');}else{if(visible)collectTween?.resume();invalidate();}},{signal});
  window.addEventListener('pageshow',invalidate,{signal});
  window.addEventListener('resize',resize,{passive:true,signal});
  quality.addEventListener('change',resize,{signal});connection?.addEventListener('change',resize,{signal});
  reduced.addEventListener('change',()=>{if(reduced.matches){stillProgress=state.progress;collecting=false;collectTween?.kill();collectTween=undefined;if(state.phase==='ready'){pose.collect=1;root.dataset.unlocking='false';root.dispatchEvent(new CustomEvent('melt-key-reveal-complete'));}}invalidate();},{signal});
  const sizeObserver=new ResizeObserver(resize);sizeObserver.observe(host);
  const visibilityObserver=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting&&entry.intersectionRatio>=.2;if(visible){if(!document.hidden)collectTween?.resume();invalidate();}else{collectTween?.pause();sleep('paused');}},{threshold:.2});visibilityObserver.observe(host);
  void (async()=>{try{
    campDetail=new THREE.TextureLoader().load('/assets/quality-v3/camp-detail.webp',t=>{if(disposed){t.dispose();return;}t.colorSpace=THREE.SRGBColorSpace;setCampDetail(t);invalidate();});campDetail.colorSpace=THREE.SRGBColorSpace;campDetail.anisotropy=8;
    surface=new SharedSurface(canvas,{antialias:true});surface.toneMapping=THREE.ACESFilmicToneMapping;surface.toneMappingExposure=.95;
    scene.background=new THREE.Color(0x071321);
    const initialPortrait=host.clientWidth/host.clientHeight<1.25;
    if(initialPortrait)portraitPlate=loadPlate(true);else landscapePlate=loadPlate(false);
    backdrop=initialPortrait?portraitPlate:landscapePlate;scene.background=backdrop!;
    sky=createPhotographicAurora({lowPower:QualityTier.lowPower,maxTextureSize:surface.engine.capabilities.maxTextureSize,onReady:invalidate,onError:fallback,intensity:.62});scene.add(sky.root);
    sky.lighting.uAuroraGroundStrength.value=0;
    fire=createFlameVideo({deferVideo:true,poster:'/assets/quality-v1/fire-hd-poster.webp',onReady:()=>{prewarmed=false;invalidate();},onError:()=>{
      if(fire?.root.userData.posterError&&fire?.root.userData.videoError)fallback();
    }});scene.add(fire.root);
    savedShadows={enabled:surface.engine.shadowMap.enabled,type:surface.engine.shadowMap.type};
    surface.engine.shadowMap.enabled=true;surface.engine.shadowMap.type=THREE.PCFShadowMap;
    const ambient=new THREE.HemisphereLight(0x789bc4,0x1e2d40,.35);scene.add(ambient);
    const keyLight=new THREE.DirectionalLight(0xa6bde0,.55);keyLight.position.set(-8,12,4);keyLight.castShadow=true;
    groundKeyLight=keyLight;scene.add(keyLight.target);
    keyLight.shadow.autoUpdate=false;keyLight.shadow.needsUpdate=true;
    keyLight.shadow.mapSize.set(QualityTier.lowPower?512:1024,QualityTier.lowPower?512:1024);
    Object.assign(keyLight.shadow.camera,{left:-15,right:15,top:11,bottom:-11,near:.1,far:45});
    keyLight.shadow.radius=QualityTier.lowPower?2.25:4.5;
    keyLight.shadow.bias=-.00015;keyLight.shadow.normalBias=.008;scene.add(keyLight);
    const fill=new THREE.DirectionalLight(0x7898be,.26);fill.position.set(4,2.8,1.5);scene.add(fill);
    const rim=new THREE.DirectionalLight(0x719bcb,.32);rim.position.set(1,4,-3);scene.add(rim);
    // frontChestLight removed to restore natural warm night campfire lighting on chest
    resize();
    invalidate();
    sky.lighting.uAuroraGroundStrength.value=0;
    host.dataset.auroraDiffuse='off';
    effectsSetupReady=true;
    effectsPass=createEarlyEffects({surface,scene,camera,sky,fire,background:()=>backdrop,
      ready:()=>effectsSetupReady&&(!compactGround||phoneSnowSettled),hidden:()=>[model?.root,chest?.root,snowTerrain?.root],
      irradiance:()=>{},onReady:invalidate,onError:fallback,onFirst:(mode)=>{
        effectsPresented=true;root.dataset.effectsPresented='true';host.dataset.effectsFirstFrameAt=String(performance.now());host.dataset.effectsGpuWarmup=mode;beginProps();invalidate();
      }});
    invalidate();
    await new Promise<void>(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve())));
    if(disposed||failed)return;
    await preloadIceGeometry(32);
    if(disposed||failed)return;
    // The approved third look also replaces old material-trial URLs.
    const study=3;
    model=createMeltKeyModel(32,study,invalidate,fallback,{highDetail:false,naturalClarity:host.clientWidth<700,compactGeometry:true});scene.add(model.root);
        const screenRight=new THREE.Vector3(.834,0,.552),front=new THREE.Vector3(-.552,0,.834);
    const closeLaptop=host.clientWidth>=900&&host.clientWidth/host.clientHeight>=1.25;
    model.root.position.copy(screenRight).multiplyScalar(closeLaptop?(-2.6+.58*Math.tan(THREE.MathUtils.degToRad(20))*(14.5*Math.max(1,1.5/(host.clientWidth/host.clientHeight))-1.2)*(host.clientWidth/host.clientHeight)):4.9).addScaledVector(front,closeLaptop?1.2:-5.2);
    model.root.scale.setScalar(closeLaptop?.70:1.2);model.root.rotation.y=-.24;model.root.position.y=-.010;
    // Re-center the existing translucent-contact shadow approximation with ice.
    const originalFloorShader=model.floor.material.onBeforeCompile;
    model.floor.material.onBeforeCompile=(shader,renderer)=>{
      originalFloorShader(shader,renderer);
      shader.fragmentShader=shader.fragmentShader
        .replace('return .94*(1.-.12*pow', 'return .7332*(1.-.12*pow')
        .replace('vec2 iceCenter(){return vec2(0.);}', `vec2 iceCenter(){return vec2(${model!.root.position.x.toFixed(6)},${model!.root.position.z.toFixed(6)});}`)
        .replace('.44+.56*contact', `.44+.56*max(contact,1.-smoothstep(1.4,2.2,length(vShadowFloor-vec2(${chest!.root.position.x.toFixed(6)},${chest!.root.position.z.toFixed(6)}))))`);
    };
    model.floor.visible=false;
    model.floor.material.customProgramCacheKey=()=> 'snowy-chest-layout-contact-v2';
    chest=createWalnutChest({highDetail:false,lowPower:true,compactGeometry:false,onReady:invalidate,onError:fallback});
    chest.root.position.copy(screenRight).multiplyScalar(closeLaptop?-3.45:-1.8).addScaledVector(front,closeLaptop?.8:-5.2);
    chest.root.position.y=-.010;chest.root.rotation.y=-.18;chest.root.scale.setScalar(closeLaptop?.90:1.08);scene.add(chest.root);
        // frontChestLight target removed
    if(geometryTrial){
      let triangles=0,vertices=0;
      for(const prop of [chest.root,model.key])prop.traverse(node=>{
        if(!(node instanceof THREE.Mesh))return;
        const count=node.geometry.getAttribute('position').count;
        vertices+=count;
        triangles+=(node.geometry.index?.count??count)/3*(node instanceof THREE.InstancedMesh?node.count:1);
      });
      root.dataset.trialPropTriangles=String(triangles);
      root.dataset.trialPropVertices=String(vertices);
    }
    // Create camp props and bake environments immediately without waiting for early effects handoff.
    if(disposed||failed)return;
    originalCamp={icePosition:model.root.position.clone(),iceScale:model.root.scale.x,chestPosition:chest.root.position.clone(),chestScale:chest.root.scale.x};
    snowTerrain=createSnowTerrain(backdrop!,chest.root,model.root,fire.root,sky.lighting,irradiance?.uniform);scene.add(snowTerrain.root);
    accessCard=createChestAccessCard(QualityTier.lowPower);chest.root.add(accessCard.root);
    unlock=createChestUnlock(model.key,chest.keySocket);
        if(state.phase==='ready'){model.update(1,0);unlock.begin();}

    // Round studio emitters avoid the long hard strip reflections of a room HDRI.
    const pmrem=startupPMREM=new THREE.PMREMGenerator(surface.engine),room=new THREE.Scene();startupRooms.add(room);room.background=new THREE.Color(.035,.065,.10);
    for(const [x,y,z,r,intensity] of [[-4,4,5.5,3.0,1.1],[4,5,-3,2.8,.6],[-4,2.8,-5,2.4,.8]]){
      const light=new THREE.Mesh(new THREE.SphereGeometry(r,24,16),new THREE.MeshBasicMaterial({color:new THREE.Color(1,.98,.95).multiplyScalar(intensity),toneMapped:false}));light.position.set(x,y,z);room.add(light);
    }
    // Broad studio card reflected in the gold's annular face and round shaft.
    const goldCard=new THREE.Mesh(new THREE.PlaneGeometry(3.5,4.5),new THREE.MeshBasicMaterial({color:new THREE.Color(1,.97,.88).multiplyScalar(.75),side:THREE.DoubleSide,toneMapped:false}));
    goldCard.position.set(3.8,2.8,5.5);goldCard.lookAt(0,1,0);room.add(goldCard);
    // Flat brass lock reflected below horizon (combined into single PMREM pass)
    const lockCard=new THREE.Mesh(new THREE.PlaneGeometry(5,3),new THREE.MeshBasicMaterial({
      color:new THREE.Color(1,.87,.68).multiplyScalar(.9),side:THREE.DoubleSide,toneMapped:false,
    }));lockCard.position.set(-4,-1.8,6);lockCard.lookAt(0,.7,0);room.add(lockCard);
    if(disposed||failed)return;
    environment=chestEnvironment=pmrem.fromScene(room,.055);
    scene.environment=environment.texture;
    chest.root.traverse(node=>{
      if(!(node instanceof THREE.Mesh))return;
      for(const material of Array.isArray(node.material)?node.material:[node.material]){
        if(material instanceof THREE.MeshStandardMaterial){material.envMap=environment!.texture;material.envMapIntensity=material.metalness>.5?.75:.45;}
      }
    });
    releaseStartup();constructionReady=true;
        host.dataset.composition='chest-left-fire-front-ice-right-v2';host.dataset.chest='walnut';host.dataset.camera='perspective-fixed';host.dataset.viewAngle='0';host.dataset.renderer='three-webgl';
    resize();
    invalidate();
  }catch(error){fallback();console.warn('Melt key visual unavailable; native controls remain usable.',error);}finally{releaseStartup();}})();
  return()=>{
    if(disposed)return;disposed=true;releaseStartup();cancelAnimationFrame(handoff);cancelAnimationFrame(uploadFrame);cancelAnimationFrame(invalidationFrame);if(gpuFence&&surface)(surface.engine.getContext() as WebGL2RenderingContext).deleteSync(gpuFence);gpuFence=null;collecting=false;collectTween?.kill();sleep();events.abort();sizeObserver.disconnect();visibilityObserver.disconnect();
    effectsPass?.dispose();setPhoneSnow();phoneSnow?.dispose();setCompactCamp();setCampDetail();campDetail?.dispose();snowTerrain?.dispose();irradiance?.dispose();sky?.dispose();fire?.dispose();landscapePlate?.dispose();portraitPlate?.dispose();accessCard?.dispose();chest?.dispose();model?.dispose();scene.traverse(o=>{if(o instanceof THREE.DirectionalLight)o.shadow.dispose();});scene.environment=null;iceSkyEnvironment?.dispose();environment?.dispose();chestEnvironment?.dispose();if(surface&&savedShadows){surface.engine.shadowMap.enabled=savedShadows.enabled;surface.engine.shadowMap.type=savedShadows.type;}surface?.dispose();scene.clear();
  };
}













