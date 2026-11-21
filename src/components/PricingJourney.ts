import * as THREE from 'three';
import {createPricingMetalwork} from './PricingMetalwork';
import {createPricingOptics} from './PricingOptics';
import {createPricingLightTrails} from './PricingLightTrails';
import {createPricingHolders} from './PricingHolders';
import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import {ScrollManager} from '../core/Scroll';
import {onFrame} from '../core/FrameLoop';
import {QualityTier} from '../core/QualityTier';
import {SharedSurface} from '../webgl/SharedRenderer';

export function createPricingJourney(host:HTMLElement) {
  gsap.registerPlugin(ScrollTrigger);
  const events=new AbortController();
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  const phone=matchMedia('(max-width: 767px)');
  const phoneScreen=Math.min(screen.width,screen.height)<=767;
  const nativeTouch=(phone.matches||phoneScreen)&&matchMedia('(pointer: coarse)').matches;
  // Lenis registers non-passive touch handlers even for its native touch mode.
  const scroll=nativeTouch?undefined:new ScrollManager();
  let surface:SharedSurface;
  try {surface=new SharedSurface(undefined,{antialias:true});}
  catch(error){scroll?.destroy();throw error;}
  host.append(surface.domElement);
  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(36,1,.1,60);camera.position.z=12;
  const objects=new THREE.Group();scene.add(objects);
  let metalwork:ReturnType<typeof createPricingMetalwork>;
  try {metalwork=createPricingMetalwork(scene,objects,surface);}
  catch(error){scroll?.destroy();surface.dispose();surface.domElement.remove();throw error;}
  const {card,bitcoin,paypal}=metalwork;
  let holders:ReturnType<typeof createPricingHolders>|undefined;
  const dockPoint=new THREE.Vector3();
  const dockOrientation=new THREE.Quaternion();
  const coinTilt=new THREE.Quaternion();
  const coinEuler=new THREE.Euler();
  const optics=createPricingOptics(objects,card,[bitcoin,paypal],camera);
  host.dataset.opticalField='interactive-guilloche';
  host.dataset.metalBloom='disabled';
  host.dataset.metalTargetMiB='0';
  host.dataset.cardFinish='graphite';
  host.dataset.materialSetupMs=metalwork.setupMs.toFixed(1);
  host.dataset.studioSize=metalwork.environmentSize.join('x');

  const sections=['#chapter-one','#chapter-two','#chapter-three','#pricing-orbit','#chapter-five','.journey-end'].map(selector=>document.querySelector<HTMLElement>(selector)!);
  const footer=document.querySelector<HTMLElement>('.snowy-signoff')!;
  const library=sections[2];
  const openingArt=document.querySelector<HTMLElement>('.opening-art')!;
  const paymentArt=sections[1].querySelector<HTMLElement>('.pricing-scene-slot')!;
  const arrivalArt=sections[4].querySelector<HTMLElement>('.pricing-scene-slot')!;
  const pose={progress:0},spin={angle:0};
  let dirty=true,visible=true,disposed=false,animateOptics=true;
  let anchors:number[]=[];
  let sectionLayout:Array<{top:number;copyBottom:number|undefined}>=[],footerTop=0;
  let opening={x:0,y:0,size:0,height:0};
  let paymentArtCenter=0;
  let entrancePending=document.documentElement.dataset.pricingEntrance==='pending';
  const lightTrails=entrancePending&&!motion.matches?createPricingLightTrails(scene,card,bitcoin,paypal):undefined;
  let entranceElapsed=0;
  let entranceClip='';
  const entranceDuration=1.93;
  const mobileEntranceTimeScale=2/3;
  let entranceBandOffset=0;
  let entranceBandPresence=1;
  let entranceEdgeLight=0;
  let libraryBounds={top:0,bottom:0,left:0,right:0};
  let arrivalCenter=0;
  let lastOpacity='';
  const mark=()=>{dirty=true;};
  let nativePosition=scrollY,nativeDelta=0,nativeScrollAt=-Infinity;
  function markNativeScroll(){
    const position=scrollY;
    nativeDelta=position-nativePosition;
    nativePosition=position;
    nativeScrollAt=performance.now();
    mark();
  }
  let arrivalWidth=0,arrivalHeight=0,arrivalX=0,orbitHeight=0;
  let viewportWidth=innerWidth,viewportHeight=innerHeight,visibleHeight=innerHeight,viewportDpr=0;
  function measure(){
    sectionLayout=sections.map(section=>({top:section.getBoundingClientRect().top+scrollY,copyBottom:section.querySelector<HTMLElement>('.chapter-copy')?.getBoundingClientRect().bottom}));
    for(const layout of sectionLayout)if(layout.copyBottom!==undefined)layout.copyBottom+=scrollY;
    anchors=sectionLayout.map((layout,index)=>layout.top-(index===0?0:viewportHeight*(index===5?.15:.25)));
    const openingRect=openingArt.getBoundingClientRect();
    opening={x:openingRect.left+openingRect.width/2,y:openingRect.top+scrollY+openingRect.height/2,size:Math.min(openingRect.width,openingRect.height),height:openingRect.height};
    const paymentRect=paymentArt.getBoundingClientRect();
    paymentArtCenter=paymentRect.top+scrollY+paymentRect.height/2;
    const libraryRect=library.getBoundingClientRect();
    libraryBounds={top:libraryRect.top+scrollY,bottom:libraryRect.bottom+scrollY,left:libraryRect.left,right:libraryRect.right};
    orbitHeight=sections[3].getBoundingClientRect().height;
    const arrivalRect=arrivalArt.getBoundingClientRect();
    arrivalWidth=arrivalRect.width;arrivalHeight=arrivalRect.height;arrivalX=arrivalRect.left+arrivalWidth/2;
    arrivalCenter=arrivalRect.top+scrollY+arrivalRect.height/2;
    footerTop=footer.getBoundingClientRect().top+scrollY;
    dirty=true;
  }
  const tween=gsap.to(pose,{progress:1,ease:'none',onUpdate:mark,scrollTrigger:{trigger:sections[0],endTrigger:sections[5],start:'top top',end:'top 15%',scrub:.65,invalidateOnRefresh:true,onUpdate:mark,onRefresh:measure}});
  // Chapter two retains its independent complete local 360 degree turn.
  const spinTween=gsap.to(spin,{angle:Math.PI*2,ease:'none',onUpdate:mark,scrollTrigger:{trigger:sections[1],start:'top 35%',end:'bottom 65%',scrub:.65,invalidateOnRefresh:true,onUpdate:mark,onRefresh:mark}});
  const stops=[
    {x:.25,y:0,r:-.19,ry:-.22,s:1,bx:-1.55,by:-1.05,px:1.45,py:1.1},
    {x:.25,y:0,r:.13,ry:.55,s:.9,bx:1.7,by:-.4,px:-1.65,py:.8},
    {x:0,y:.15,r:-.3,ry:3.3,s:1.03,bx:-2,by:.3,px:1.8,py:-.7},
    {x:.25,y:0,r:1.35,ry:6.05,s:.88,bx:-1.95,by:-.8,px:1.85,py:.9},
    {x:.25,y:0,r:-.14,ry:6.5,s:.91,bx:-1.75,by:-1.1,px:1.7,py:1.15},
    {x:.32,y:1.3,r:.15,ry:6.05,s:.52,bx:-1.7,by:-.4,px:1.6,py:.7},
  ];
  const smooth=(from:number,to:number,value:number)=>THREE.MathUtils.smoothstep(value,from,to);
  const progressBetween=(start:number,length:number,scroll:number)=>THREE.MathUtils.clamp((scroll-start)/length,0,1);
  function resize(){
    const width=phone.matches?host.clientWidth:innerWidth;
    const height=phone.matches?host.clientHeight:innerHeight;
    const dpr=QualityTier.getDPR();
    const nextVisibleHeight=Math.min(height,innerHeight);
    if(visibleHeight!==nextVisibleHeight){visibleHeight=nextVisibleHeight;mark();}
    // Browser chrome can change innerHeight without changing the canvas.
    if(width===viewportWidth&&height===viewportHeight&&dpr===viewportDpr)return;
    viewportWidth=width;viewportHeight=height;viewportDpr=dpr;
    lightTrails?.reset();
    surface.setPixelRatio(dpr);
    surface.setSize(width,height);
    camera.aspect=width/height;
    camera.updateProjectionMatrix();
    measure();
  }
  function drawVisibleArea(renderer:THREE.WebGLRenderer,world:THREE.Scene,view:THREE.Camera,width:number,height:number){
    const visiblePixels=Math.round(height*visibleHeight/viewportHeight);
    renderer.setScissor(0,height-visiblePixels,width,visiblePixels);
    renderer.render(world,view);
  }
  resize();window.addEventListener('resize',resize,{signal:events.signal});
  const layoutObserver=new ResizeObserver(measure);layoutObserver.observe(document.querySelector('#main-content')!);
  for(const element of [openingArt,paymentArt,library,sections[3],arrivalArt])layoutObserver.observe(element);
  document.fonts.ready.then(()=>{if(!disposed)measure();});
  const observer=new IntersectionObserver(e=>{visible=e.some(v=>v.isIntersecting);dirty=true;});observer.observe(document.querySelector('#main-content')!);
  document.addEventListener('visibilitychange',mark,{signal:events.signal});
  motion.addEventListener('change',()=>{ScrollTrigger.refresh();mark();},{signal:events.signal});
  let shown=false,last=-Infinity,framedMobileY=-2.5;
  function setEntranceClip(top:number,bottom=0) {
    const clip=top>0||bottom>0?`inset(${top}px 0 ${bottom}px 0)`:'';
    if(clip===entranceClip)return;
    entranceClip=clip;
    if(clip)host.style.clipPath=clip;
    else host.style.removeProperty('clip-path');
  }

  function applyEntrance(currentScroll:number,viewHeight:number,progress:number,delta:number,stacked:boolean) {
    entranceBandOffset=0;
    entranceBandPresence=1;
    entranceEdgeLight=0;
    if(!entrancePending)return false;

    const artTop=opening.y-opening.height/2-currentScroll;
    const scrollWeight=stacked?1-smooth(.56,.88,progress):1-smooth(32,164,currentScroll);
    if(motion.matches||scrollWeight===0||(stacked&&artTop<48&&entranceElapsed===0)){
      entrancePending=false;
      lightTrails?.hide();
      delete host.dataset.openingMotion;
      setEntranceClip(0);
      return false;
    }
    // Prime the scene under the clip before the first timed frame.
    if(!shown){
      setEntranceClip(viewportHeight);
      return false;
    }

    const progressIn=THREE.MathUtils.clamp(entranceElapsed/entranceDuration,0,1);
    if(progressIn===1){
      entrancePending=false;
      lightTrails?.hide();
      delete host.dataset.openingMotion;
      setEntranceClip(0);
      return false;
    }

    host.dataset.openingMotion='playing';
    // Enter from the viewport edge on phones too, before the artwork slot
    // reaches the screen. Keep the existing landing pose below the plans.
    const clipTop=0;
    setEntranceClip(clipTop);
    const upperEdge=(.5-clipTop/viewportHeight)*viewHeight;
    const above=(upperEdge-objects.position.y)/objects.scale.y;
    const descent=(delay:number,duration:number)=>{
      const t=THREE.MathUtils.clamp((entranceElapsed-delay)/duration,0,1);
      return (1-t)**2.3*scrollWeight;
    };

    const cardFall=descent(0,1.24);
    const goldFall=descent(.46,1.05);
    const silverFall=descent(.79,.94);
    const cardBank=Math.sin(cardFall*Math.PI);
    const goldArc=Math.sin(goldFall*Math.PI);
    const silverArc=Math.sin(silverFall*Math.PI);

    card.position.y=THREE.MathUtils.lerp(card.position.y,above+1.85,cardFall);
    card.rotation.y-=cardFall*(Math.PI*2+1.44);
    card.rotation.x+=cardBank*.26;
    card.rotation.z-=cardBank*.23;

    bitcoin.position.y=THREE.MathUtils.lerp(bitcoin.position.y,above+.7,goldFall);
    bitcoin.position.x-=goldArc*.89;
    bitcoin.rotation.x+=goldFall*Math.PI*2;
    bitcoin.rotation.y+=goldArc*.82;

    paypal.position.y=THREE.MathUtils.lerp(paypal.position.y,above+.7,silverFall);
    paypal.position.x+=silverArc*.58;
    paypal.rotation.x-=silverFall*Math.PI*2;
    paypal.rotation.y-=silverArc*.73;

    entranceEdgeLight=Math.max(cardBank,goldArc,silverArc)*scrollWeight;

    // The engraved band settles behind the metals during the last beat.
    entranceBandOffset=Math.max(0,above+3.8)*descent(1.19,.74);
    entranceBandPresence=1-(1-smooth(1.24,1.84,entranceElapsed))*scrollWeight;
    lightTrails?.update(entranceElapsed,entranceDuration-entranceElapsed,scrollWeight,viewportWidth,viewportHeight);
    entranceElapsed+=delta*(phone.matches?mobileEntranceTimeScale:1);
    return false;
  }

  const remove=onFrame((time)=>{
    if((!dirty&&!animateOptics)||!visible||document.hidden||disposed)return;
    if(time-last<QualityTier.getFrameInterval())return;
    const frameGap=shown?time-last:0;
    const delta=Math.min(.05,frameGap);last=time;
    const travel=tween.scrollTrigger!;
    const easedScroll=THREE.MathUtils.lerp(travel.start,travel.end,pose.progress);
    const reduced=motion.matches;
    const currentScroll=scroll?.getScroll()??scrollY;
    const phoneMotion=phone.matches&&!reduced;
    // Position and rotation use the same scroll sample through the payment
    // sequence; blend back into the existing scrub before the later chapters.
    const paymentHandoff=smooth(paymentArtCenter-viewportHeight*.32,paymentArtCenter+viewportHeight*.21,currentScroll);
    const sceneScroll=phoneMotion?THREE.MathUtils.lerp(currentScroll,easedScroll,paymentHandoff):easedScroll;
    let idx=0;
    while(idx<stops.length-2&&sceneScroll>=anchors[idx+1])idx++;
    const fraction=THREE.MathUtils.clamp((sceneScroll-anchors[idx])/Math.max(1,anchors[idx+1]-anchors[idx]),0,1);
    const p=motion.matches?0:idx+fraction;
    if(motion.matches)idx=0;
    const f=motion.matches?0:smooth(0,1,fraction),a=stops[idx],b=stops[idx+1];
    const lerp=(key:keyof typeof a)=>THREE.MathUtils.lerp(a[key],b[key],f);
    const mobile=viewportWidth<=820;
    // Sample the orbit and arrival from the same eased scroll. The handoff
    // must follow the same path forward and backward, even on fast reversals.
    const orbitProgress=reduced?0:progressBetween(sectionLayout[3].top-viewportHeight*.85,orbitHeight+viewportHeight*.70,easedScroll);
    const arrivalProgress=reduced?0:progressBetween(sectionLayout[4].top-viewportHeight,viewportHeight*.91,easedScroll);
    const orbitWeight=smooth(0,.1,orbitProgress)*(1-smooth(.9,1,orbitProgress));
    const viewH=2*Math.tan(THREE.MathUtils.degToRad(18))*12,viewW=viewH*camera.aspect;
    const scale=(mobile?Math.min(.6,viewW/6.8):Math.min(1,viewH/6.8,viewW/11.5))*lerp('s')*(1-orbitWeight*.08);
    // Reserve space for the reference's broad annular field around the metal.
    const trackStart=opening.y-viewportHeight*.42;
    const trackEnd=paymentArtCenter-viewportHeight*.61;
    const trackProgress=phoneMotion?progressBetween(trackStart,trackEnd-trackStart,currentScroll):0;
    const openingTurn=phoneMotion?smooth(Math.max(0,opening.y-viewportHeight*.91),opening.y-viewportHeight*.28,currentScroll):0;
    const paymentTurn=phoneMotion?smooth(paymentArtCenter-viewportHeight*.93,paymentArtCenter-viewportHeight*.32,currentScroll):0;
    const phoneTurn=openingTurn+paymentTurn;
    const turnAngle=phoneTurn*Math.PI*2;
    const turnEnvelope=Math.abs(Math.sin(phoneTurn*Math.PI));
    let mobileY=-2.5;
    if(mobile){
      const half=2.9*scale*viewportHeight/viewH;
      const paymentBottom=sectionLayout[1].copyBottom??0;
      let paymentCenter=Math.max(viewportHeight*.67,paymentBottom-currentScroll+half+24);
      if(phoneMotion){
        // Join the two document anchors to a slow downward path in screen
        // space. The payment panel covers the same scene as it passes behind.
        const movingCenter=THREE.MathUtils.lerp(.42,.61,trackProgress)*viewportHeight;
        const releaseOpening=smooth(trackStart,trackStart+viewportHeight*.18,currentScroll);
        const reachPayment=smooth(trackEnd-viewportHeight*.18,trackEnd,currentScroll);
        const fromOpening=THREE.MathUtils.lerp(opening.y-currentScroll,movingCenter,releaseOpening);
        paymentCenter=THREE.MathUtils.lerp(fromOpening,paymentArtCenter-currentScroll,reachPayment);
      }
      const fromPayment=phoneMotion?paymentHandoff:smooth(1.65,2.15,p);
      const toKey=smooth(.34,.83,arrivalProgress);
      const center=THREE.MathUtils.lerp(
        THREE.MathUtils.lerp(paymentCenter,viewportHeight*.59,fromPayment),
        THREE.MathUtils.clamp(arrivalCenter-currentScroll,viewportHeight*.45,viewportHeight*.62),
        toKey,
      );
      mobileY=(.5-center/viewportHeight)*viewH;
    }
    // The phone payment art is anchored to document scroll. Damping that
    // position makes it lag behind a fast swipe or a jump to the section.
    const followsPaymentScroll=phoneMotion&&currentScroll<paymentArtCenter+viewportHeight*.21;
    framedMobileY=shown&&!reduced&&!followsPaymentScroll?THREE.MathUtils.damp(framedMobileY,mobileY,12,delta):mobileY;
    const framingSettles=mobile&&Math.abs(framedMobileY-mobileY)>.002;
    if(!framingSettles)framedMobileY=mobileY;

    // Keep the original poses and scroll curves, mapped to the current opening grid.
    const openingWeight=reduced?1:phoneMotion?1-smooth(0,1,trackProgress):1-smooth(mobile?.36:0,1,p);
    const openingScale=opening.size/viewportHeight*viewH/7.3;
    const parkedX=(opening.x/viewportWidth-.5)*viewW;
    const parkedY=(.5-(opening.y-currentScroll)/viewportHeight)*viewH;
    objects.scale.setScalar(THREE.MathUtils.lerp(scale*.84,openingScale,openingWeight));
    objects.position.set(
      THREE.MathUtils.lerp(mobile?0:(lerp('x')-orbitWeight*.02)*viewW,parkedX,openingWeight),
      THREE.MathUtils.lerp(mobile?framedMobileY:lerp('y'),parkedY,phoneMotion?0:openingWeight),0,
    );
    const spinTrigger=spinTween.scrollTrigger!;
    // Drop the completed opening revolution before later Euler blends.
    const sceneSpin=phoneMotion?(openingTurn===1?paymentTurn:phoneTurn)*Math.PI*2:spin.angle;
    const approach=THREE.MathUtils.clamp(currentScroll/Math.max(1,spinTrigger.start),0,1);
    const departure=THREE.MathUtils.clamp((sceneScroll-spinTrigger.end)/Math.max(1,anchors[2]-spinTrigger.end),0,1);
    const cardYaw=p<2?THREE.MathUtils.lerp(-.22,.55,approach)+departure*2.75:lerp('ry');
    card.visible=true;
    card.rotation.set(.1,motion.matches?-.2:cardYaw+sceneSpin,motion.matches?-.12:lerp('r'));
    card.scale.setScalar(1);
    card.position.set(0,0,0);
    bitcoin.scale.setScalar(.94);paypal.scale.setScalar(.94);
    bitcoin.position.set(lerp('bx'),lerp('by'),1.75);
    paypal.position.set(lerp('px'),lerp('py'),1.7);
    bitcoin.rotation.set(.12,motion.matches?0:-.25*approach+sceneSpin-departure*3,-.18);
    paypal.rotation.set(-.2,motion.matches?0:.25*approach-sceneSpin+departure*3,.2);

    if(phoneMotion){
      // Replace the long, mostly hidden chapter spin with one turn in each
      // visible slot. The coins bank in opposite directions around the card.
      objects.position.x+=Math.sin(turnAngle)*turnEnvelope*objects.scale.x*.44;
      card.position.y+=turnEnvelope*.24;
      card.rotation.x+=Math.sin(turnAngle)*.23;
      card.rotation.z-=turnEnvelope*.18;
      bitcoin.position.x-=turnEnvelope*.42;
      paypal.position.x+=turnEnvelope*.42;
      bitcoin.position.y+=Math.sin(turnAngle)*.49;
      paypal.position.y-=Math.sin(turnAngle)*.49;
      bitcoin.rotation.x+=turnEnvelope*.41;
      paypal.rotation.x-=turnEnvelope*.41;
    }

    // Unfold into a single spatial revolution after clearing the library.
    const reveal=smooth(.02,.24,orbitProgress);
    const turn=smooth(.08,.88,orbitProgress);
    const sweep=Math.sin(Math.PI*turn);
    const mix=THREE.MathUtils.lerp;
    if(reveal>0){
      card.position.z=1.05*smooth(.32,.65,orbitProgress);
      card.position.y=-.24*sweep;
      card.rotation.set(
        mix(card.rotation.x,.1+.24*Math.sin(turn*Math.PI*2),reveal),
        mix(card.rotation.y,Math.PI*4+.24+turn*Math.PI*2,reveal),
        mix(card.rotation.z,-.18+.28*Math.sin(turn*Math.PI*2),reveal),
      );
      const radius=mobile?2.35:2.85;
      for(const [coin,phase,direction] of [[bitcoin,Math.PI,1],[paypal,0,-1]] as const){
        const angle=phase+turn*Math.PI*2;
        const x=Math.cos(angle)*radius;
        const y=Math.sin(angle)*1.35-direction*.25;
        const z=1.05+Math.sin(angle)*2.55;
        coin.position.lerp(dockPoint.set(x,y,z),reveal);
        coin.rotation.x=mix(coin.rotation.x,.18*Math.sin(angle),reveal);
        coin.rotation.y=mix(coin.rotation.y,direction*turn*Math.PI*2+.38*Math.sin(angle),reveal);
        coin.rotation.z=mix(coin.rotation.z,direction*(-.18+turn*Math.PI*2),reveal);
      }
    }

    // Static seated holders also illustrate the payment set for reduced-motion readers.
    const keyOnScreen=arrivalCenter-currentScroll<viewportHeight*1.48&&arrivalCenter-currentScroll>-viewportHeight*.48;
    const docking=reduced?(keyOnScreen?1:0):arrivalProgress;
    const orbitHandoff=smooth(.64,1,orbitProgress);
    const arrivalHandoff=smooth(0,.24,docking);
    const rise=1-(1-orbitHandoff)*(1-arrivalHandoff);
    if(!holders&&(orbitProgress>.2||keyOnScreen)){
      holders=createPricingHolders();
      holders.root.rotation.set(-.08,-.10,-.01);
      scene.add(holders.root);
    }
    // Culling the holders must never switch off the actor transform or
    // change the scale of the ornament attached to the actor group.
    const dockScale=Math.min(1,arrivalWidth*viewH/(viewportHeight*6.95),arrivalHeight*viewH/(viewportHeight*5.15));
    const slotX=(arrivalX/viewportWidth-.5)*viewW;
    const slotY=(.5-(arrivalCenter-currentScroll)/viewportHeight)*viewH;
    const approachY=(.5-(arrivalCenter-easedScroll)/viewportHeight)*viewH;
    const attach=smooth(.46,.78,docking);
    objects.scale.lerp(dockPoint.setScalar(dockScale),rise);
    objects.position.x=mix(objects.position.x,slotX,rise);
    objects.position.y=mix(objects.position.y,mix(approachY,slotY,attach),smooth(.24,.78,docking));
    if(holders){
      holders.root.visible=keyOnScreen&&docking>.02;
      const holderAppear=smooth(.02,.28,docking);
      holders.root.scale.setScalar(dockScale*mix(.92,1,holderAppear));
      holders.root.position.set(slotX,slotY-.24*(1-holderAppear)*dockScale,-.25*dockScale);
      holders.root.updateMatrix();
      const holdersMatrix=holders.root.matrix;
      const toActorSpace=()=>dockPoint.applyMatrix4(holdersMatrix)
        .sub(objects.position).divideScalar(objects.scale.x);

      // Card aligns upright above the sleeve mouth, then slides straight down
      // behind the wavy front pocket wall (true Z-buffer occlusion).
      const align=motion.matches?1:smooth(.14,.52,docking);
      const insert=motion.matches?1:smooth(.48,.84,docking);
      const cardY=mix(holders.cardAnchor.entryY,holders.cardAnchor.seatedY,insert);
      dockPoint.set(0,cardY,.18*(1-align));
      card.position.lerp(toActorSpace(),align);
      card.quaternion.slerp(dockOrientation.copy(holders.root.quaternion),align);
      card.scale.setScalar(mix(1,holders.cardAnchor.scale,align));

      // Each coin approaches along the outward axis of its own Coin Pocket and
      // slides sideways into the grooved C-channel with its emblem upright.
      const coinEntries=[
        [bitcoin,holders.coinAnchors[0],0],
        [paypal,holders.coinAnchors[1],.05],
      ] as const;
      for(const [coin,anchor,delay] of coinEntries){
        const approach=motion.matches?1:smooth(.18+delay,.56+delay,docking);
        const seat=motion.matches?1:smooth(.50+delay,.82+delay,docking);
        const slideOut=mix(.96,0,seat);
        const arcLift=.24*Math.sin(Math.PI*approach)*(1-seat);
        dockPoint.copy(anchor.position).addScaledVector(anchor.slideDir,slideOut);
        dockPoint.y+=arcLift;
        dockPoint.z+=.22*(1-approach);
        coin.position.lerp(toActorSpace(),approach);
        const side=Math.sign(anchor.position.x);
        coinEuler.set(-.22*(1-approach),side*.55*(1-approach),-side*.18*(1-approach));
        coinTilt.setFromEuler(coinEuler).premultiply(anchor.coinQuaternion).premultiply(holders.root.quaternion);
        coin.quaternion.slerp(coinTilt,approach);
        coin.scale.setScalar(mix(.94,holders.coinScale,approach));
      }
    }
    // Anchor the shrinking ornament to the shared track, not to the
    // moving card inside its sleeve.
    const bandLift=card.position.y*(1-smooth(.12,.55,docking));
    const entranceStep=host.dataset.openingMotion==='playing'?Math.min(.12,frameGap):0;
    const waitingForOpening=applyEntrance(currentScroll,viewH,p,entranceStep,mobile);
    const pixelScale=objects.scale.x*viewportHeight/viewH;
    const centerX=(objects.position.x/viewW+.5)*viewportWidth;
    const centerY=(.5-objects.position.y/viewH)*viewportHeight+currentScroll;
    const radius=pixelScale*5.2;
    const covered=p>=1.8&&p<3.3&&centerY-radius>=libraryBounds.top+4&&centerY+radius<=libraryBounds.bottom-4&&
      Math.max(0,centerX-radius)>=libraryBounds.left&&Math.min(viewportWidth,centerX+radius)<=libraryBounds.right;
    const opacity=smooth(.05,.36,(footerTop-currentScroll)/viewportHeight);
    const hide=opacity===0||covered;
    if(host.hasAttribute('data-library-covered')!==covered)host.toggleAttribute('data-library-covered',covered);
    const nextOpacity=opacity.toFixed(3);
    if(nextOpacity!==lastOpacity){host.style.opacity=nextOpacity;lastOpacity=nextOpacity;}
    const showOptics=!hide;
    optics.setVisible(showOptics);animateOptics=!hide&&!waitingForOpening&&!motion.matches;
    if(hide||(waitingForOpening&&shown)){dirty=false;return;}
    const scrollVelocity=scroll?.getVelocity()??(performance.now()-nativeScrollAt<400?nativeDelta:0);
    if(showOptics)optics.update(time,reduced?0:scrollVelocity,reduced,bandLift,entranceBandPresence,entranceBandOffset,entranceEdgeLight,docking,viewportWidth,viewportHeight,visibleHeight);
    surface.render(scene,camera,visibleHeight<viewportHeight?drawVisibleArea:undefined);
    dirty=framingSettles;
    host.dataset.frameDrawCalls=String(surface.engine.info.render.calls);
    if(!shown){
      shown=true;
      document.documentElement.dataset.journeyReady='true';
      delete document.documentElement.dataset.pricingEntrance;
      host.dataset.ready='true';
    }
    host.dataset.phase=p.toFixed(3);host.dataset.renderCount=String(Number(host.dataset.renderCount||0)+1);
    host.dataset.sectionTwoTurn=(reduced?0:phoneMotion?paymentTurn:spin.angle/(Math.PI*2)).toFixed(4);
    host.dataset.orbitProgress=orbitProgress.toFixed(4);host.dataset.arrivalProgress=arrivalProgress.toFixed(4);
    host.dataset.localAngles=[card.rotation.y,bitcoin.rotation.y,paypal.rotation.y].map(v=>v.toFixed(4)).join(',');
  });
  if(scroll)scroll.instance.on('scroll',mark);
  else window.addEventListener('scroll',markNativeScroll,{passive:true,signal:events.signal});
  return ()=>{
    disposed=true;events.abort();remove();observer.disconnect();layoutObserver.disconnect();
    for(const animation of [tween,spinTween]){animation.scrollTrigger?.kill();animation.kill();}
    scroll?.destroy();holders?.dispose();lightTrails?.dispose();optics.dispose();metalwork.dispose();surface.dispose();delete document.documentElement.dataset.journeyReady;
    host.removeAttribute('data-library-covered');
    host.style.removeProperty('opacity');
    setEntranceClip(0);
    delete host.dataset.openingMotion;
  };
}
