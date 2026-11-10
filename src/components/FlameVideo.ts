import {campPlateGLSL,campDetailUniforms} from './CampPlate';
import * as THREE from 'three';
import { winterPit } from './WinterComposition';



/** Restrict the original full-screen quad, not its geometry/UV interpolation.
 * Outside this conservative box its existing shader always discards. Apply on
 * the default framebuffer only; unusual offscreen passes retain the full draw.
 */
function installEmberScissor(
  mesh: THREE.Mesh,
  crop: THREE.Vector4,
  pit: THREE.Vector3,
  portrait: () => boolean,
): void {
  const original = new THREE.Vector4(), viewport = new THREE.Vector4();
  let applied = false, test = false;
  mesh.onBeforeRender = renderer => {
    applied = false;
    if (renderer.getRenderTarget() !== null || crop.x <= 0 || crop.y <= 0) return;
    renderer.getCurrentViewport(viewport);
    if (viewport.z <= 0 || viewport.w <= 0) return;
    renderer.getScissor(original); test = renderer.getScissorTest();
    const ratio = renderer.getPixelRatio();
    const rx = portrait() ? .095 : .084, ry = portrait() ? .018 : .027;
    const x = (pit.x - crop.z) / crop.x;
    const y = (1 - pit.y - crop.w) / crop.y;
    const dx = pit.z * rx / crop.x, dy = pit.z * ry / crop.y;
    // Three applies DPR inside setScissor; getCurrentViewport is already in
    // drawing-buffer pixels. Retain two physical pixels beyond ellipse support.
    let x0 = Math.max(viewport.x, Math.floor(viewport.x + (x - dx) * viewport.z) - 2);
    let y0 = Math.max(viewport.y, Math.floor(viewport.y + (y - dy) * viewport.w) - 2);
    let x1 = Math.min(viewport.x + viewport.z, Math.ceil(viewport.x + (x + dx) * viewport.z) + 2);
    let y1 = Math.min(viewport.y + viewport.w, Math.ceil(viewport.y + (y + dy) * viewport.w) + 2);
    if (test) {
      x0 = Math.max(x0, original.x * ratio); y0 = Math.max(y0, original.y * ratio);
      x1 = Math.min(x1, (original.x + original.z) * ratio);
      y1 = Math.min(y1, (original.y + original.w) * ratio);
    }
    renderer.setScissor(x0 / ratio, y0 / ratio, Math.max(0, x1 - x0) / ratio, Math.max(0, y1 - y0) / ratio);
    renderer.setScissorTest(true); applied = true;
  };
  mesh.onAfterRender = renderer => {
    if (!applied) return;
    renderer.setScissor(original); renderer.setScissorTest(test); applied = false;
  };
}


type FlameVideoOptions={
  source?:string;
  poster?:string;
  deferVideo?:boolean;
  onReady?:()=>void;
  onError?:(error:unknown)=>void;
};

/** A photographed flame loop. Root origin is the base of the flame; local
 * height is 1, width is 4/3. Scale/position root to align with the photographed
 * fire pit. Black is removed optically by additive compositing, not chroma-keyed
 * into harsh alpha contours. The stationary source camera is not copied. */
export function createFlameVideo(options:FlameVideoOptions={}){
  const root=new THREE.Group();root.name='photographed-campfire-flame';
  const events=new AbortController();
  let disposed=false,motion=true,active=false,playPending=false,blocked=false;
  let playbackAttempt=0,cancelledAttempt=-1;
  const video=document.createElement('video');
  video.muted=true;video.loop=true;video.playsInline=true;video.preload='auto';
  video.crossOrigin='anonymous';
  video.setAttribute('playsinline','');video.setAttribute('muted','');
  let firstFrame=false,frameCallback:number|undefined;
  if(typeof video.requestVideoFrameCallback==='function')frameCallback=video.requestVideoFrameCallback(()=>{
    frameCallback=undefined;if(disposed)return;firstFrame=true;options.onReady?.();
  });
  const videoTexture=new THREE.VideoTexture(video);videoTexture.colorSpace=THREE.SRGBColorSpace;
  videoTexture.minFilter=videoTexture.magFilter=THREE.LinearFilter;videoTexture.generateMipmaps=false;
  const exposure={value:1.08},closeCamp={value:0};
  const crop={value:new THREE.Vector4(1,1,0,0)},portrait={value:0},plate={value:null as THREE.Texture|null};
  const pitLayout={value:new THREE.Vector3(.6105,.681,.58)};
  const composition=`uniform float uCloseCamp;${campPlateGLSL}
 uniform vec4 uPlateCrop;uniform float uPortrait;uniform vec3 uPitLayout;
    vec2 canonicalFireUv(vec2 photoUv){
      vec2 topUv=vec2(photoUv.x,1.-photoUv.y);
      vec2 original=vec2(.5,uPortrait>.5?.664:.750)+(topUv-uPitLayout.xy)/uPitLayout.z;
      return vec2(original.x,1.-original.y);
    }
    float frontRim(float x){
      // Near-side rock/log boundary in the photographic source, y from top.
      float p=(x-.5)/(uPortrait>.5?.108:.092);
      float y=uPortrait>.5?.670:.758;
      return y+.004*sin(p*8.+.6)+.0025*sin(p*19.-.8)+.004*p*p;
    }
    float fireVisibility(vec2 photoUv){
      if(uPortrait>.5)return 1.0;
      float y=1.-photoUv.y;
      float rim=frontRim(photoUv.x);
      // The photographed foreground stones are opaque: no flame can show over them.
      float occlusion=1.-smoothstep(rim-.0015,rim+.0007,y);
      float anchor=uPortrait>.5?.660:.741;
      float basal=smoothstep(anchor-.025,anchor+.012,y);
      float spread=mix(uPortrait>.5?.14:.115,uPortrait>.5?.053:.044,basal);
      float source=1.-smoothstep(spread*.78,spread,abs(photoUv.x-.5));
      return occlusion*source;
    }`;
  const material=new THREE.MeshBasicMaterial({
    color:0xffffff,map:videoTexture,transparent:true,depthWrite:false,
    side:THREE.DoubleSide,toneMapped:false,fog:false,
    blending:THREE.CustomBlending,blendEquation:THREE.AddEquation,
    blendSrc:THREE.OneFactor,blendDst:THREE.OneFactor,
  });
  material.onBeforeCompile=shader=>{
    Object.assign(shader.uniforms,campDetailUniforms);shader.uniforms.uFlameExposure=exposure;shader.uniforms.uCloseCamp=closeCamp;
    shader.uniforms.uPlateCrop=crop;shader.uniforms.uPortrait=portrait;shader.uniforms.uPitLayout=pitLayout;
    shader.vertexShader='varying vec4 vFlameClip;\n'+shader.vertexShader;
    shader.vertexShader=shader.vertexShader.replace('#include <project_vertex>','#include <project_vertex>\n vFlameClip=gl_Position;');
    shader.fragmentShader='uniform float uFlameExposure;varying vec4 vFlameClip;\n'+composition+'\n'+shader.fragmentShader;
    shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>
      float xMin1=mix(0.00,0.22,uPortrait);
      float xMin2=mix(0.055,0.34,uPortrait);
      float xMax1=mix(0.945,0.68,uPortrait);
      float xMax2=mix(1.00,0.80,uPortrait);
      float edge=smoothstep(xMin1,xMin2,vMapUv.x)*(1.-smoothstep(xMax1,xMax2,vMapUv.x));
      edge*=smoothstep(0.04,.12,vMapUv.y)*(1.-smoothstep(.86,1.,vMapUv.y));
      vec2 photoUv=(vFlameClip.xy/vFlameClip.w*.5+.5)*uPlateCrop.xy+uPlateCrop.zw;
      edge*=fireVisibility(canonicalFireUv(photoUv));
      float lum=dot(diffuseColor.rgb,vec3(0.299,0.587,0.114));
      if(lum<=0.025){
        diffuseColor.rgb=vec3(0.0);
      }else{
        vec3 fireCol=max(diffuseColor.rgb-vec3(0.025),vec3(0.0));
        fireCol*=mix(vec3(1.0),vec3(1.20,0.95,0.65),smoothstep(0.05,0.45,lum));
        fireCol+=vec3(0.9,0.75,0.45)*pow(lum,2.5)*1.4;
        diffuseColor.rgb=fireCol*edge*uFlameExposure;
      }
    `);
  };
  material.customProgramCacheKey=()=> 'snowy-photographed-flame-distant-pit-v4';
  const geometry=new THREE.PlaneGeometry(4/3,1);
  const mesh=new THREE.Mesh(geometry,material);mesh.name='real-flame-footage';mesh.position.y=.32;
  mesh.renderOrder=3;root.add(mesh);
  const light=new THREE.PointLight(0xff9438,12,14,1.3);light.position.set(0,.45,.04);root.add(light);
  let poster:THREE.Texture|undefined;
  const emberMaterial=new THREE.ShaderMaterial({transparent:true,depthTest:false,depthWrite:false,toneMapped:false,blending:THREE.AdditiveBlending,
    uniforms:{...campDetailUniforms,uCloseCamp:closeCamp,uPlate:plate,uPlateCrop:crop,uPortrait:portrait,uPitLayout:pitLayout,uFlames:{value:videoTexture}},
    vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',
    fragmentShader:`uniform sampler2D uPlate;uniform sampler2D uFlames;varying vec2 vUv;${composition}
      void main(){
        vec2 uv=vUv*uPlateCrop.xy+uPlateCrop.zw;vec2 canonical=canonicalFireUv(uv);float y=1.-canonical.y;
        vec2 center=vec2(.5,uPortrait>.5?.664:.750),radii=vec2(uPortrait>.5?.095:.084,uPortrait>.5?.018:.027);
        float region=1.-smoothstep(.65,1.,length((vec2(canonical.x,y)-center)/radii));
        if(region<.001)discard;vec3 colour=campPlateColor(uPlate,uv,uCloseCamp);
        float hot=smoothstep(.012,.12,colour.r-max(colour.g,colour.b));
        float energy=texture2D(uFlames,vec2(.48,.35)).g+texture2D(uFlames,vec2(.56,.47)).g+texture2D(uFlames,vec2(.40,.61)).g;
        vec3 emission=colour*hot*region*(.10+.22*clamp(energy,0.,1.));
        gl_FragColor=vec4(emission,1.);
        #include <colorspace_fragment>
      }`});
  const emberMesh=new THREE.Mesh(new THREE.PlaneGeometry(2,2),emberMaterial);emberMesh.frustumCulled=false;emberMesh.renderOrder=2;root.add(emberMesh);
  installEmberScissor(emberMesh,crop.value,pitLayout.value,()=>portrait.value>.5);
  const sparkCount=20,sparkGeom=new THREE.BufferGeometry(),sparkPositions=new Float32Array(sparkCount*3),sparkPhases=new Float32Array(sparkCount);
  let sparkSeed=413;const sparkRnd=()=>{sparkSeed=(1664525*sparkSeed+1013904223)>>>0;return sparkSeed/4294967296;};
  for(let i=0;i<sparkCount;i++){
    sparkPositions[i*3]=(sparkRnd()-.5)*.40;
    sparkPositions[i*3+1]=sparkRnd()*1.0;
    sparkPositions[i*3+2]=(sparkRnd()-.5)*.40;
    sparkPhases[i]=sparkRnd();
  }
  sparkGeom.setAttribute('position',new THREE.BufferAttribute(sparkPositions,3));
  sparkGeom.setAttribute('phase',new THREE.BufferAttribute(sparkPhases,1));
  const sparkTime={value:0};
  const sparkMat=new THREE.ShaderMaterial({
    transparent:true,depthTest:false,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false,
    uniforms:{uTime:sparkTime},
    vertexShader:`uniform float uTime;attribute float phase;varying float vAlpha;
      void main(){
        vec3 p=position;float life=fract(phase+uTime*0.14);
        p.y=0.10+life*1.1;
        p.x+=sin(life*6.0+phase*8.0)*0.10*life;
        p.z+=cos(life*5.0+phase*10.0)*0.10*life;
        vAlpha=(1.0-life)*smoothstep(0.0,0.12,life);
        vec4 v=modelViewMatrix*vec4(p,1.0);
        gl_Position=projectionMatrix*v;
        gl_PointSize=clamp(45.0/-v.z,1.5,3.5);
      }`,
    fragmentShader:`varying float vAlpha;
      void main(){
        float r=length(gl_PointCoord-vec2(0.5));
        if(r>0.5)discard;
        float spark=pow(1.0-r*2.0,2.0);
        gl_FragColor=vec4(vec3(1.0,0.55,0.12)*2.0,spark*vAlpha);
      }`
  });
  const sparks=new THREE.Points(sparkGeom,sparkMat);sparks.name='rising-sparks';sparks.frustumCulled=false;sparks.renderOrder=4;root.add(sparks);

  const useMap=(texture:THREE.Texture)=>{if(material.map!==texture){material.map=texture;material.needsUpdate=true;}};
  const refresh=()=>{
    if(disposed)return;
    if(motion&&root.userData.videoReady&&!blocked){useMap(videoTexture);emberMaterial.uniforms.uFlames.value=videoTexture;}else if(poster&&root.userData.posterReady){useMap(poster);emberMaterial.uniforms.uFlames.value=poster;}else if(root.userData.videoReady){useMap(videoTexture);emberMaterial.uniforms.uFlames.value=videoTexture;}
    if(!motion||!active){if(playPending)cancelledAttempt=playbackAttempt;if(!video.paused||playPending)video.pause();root.userData.playing=false;return;}
    if(root.userData.videoReady&&video.paused&&!playPending&&!blocked){
      playPending=true;const attempt=++playbackAttempt;
      video.play().then(()=>{
        playPending=false;if(disposed)return;
        root.userData.playing=motion&&active&&!video.paused;
        if(!motion||!active)video.pause();
      },error=>{
        playPending=false;if(disposed)return;
        // An intentional visibility/reduced-motion pause can reject a pending
        // play with AbortError. Retry on the next shared frame, not a microtask
        // loop; that cancellation is not an autoplay-permission failure.
        blocked=!(error?.name==='AbortError'&&attempt===cancelledAttempt);
        root.userData.playing=false;if(blocked&&poster&&root.userData.posterReady)useMap(poster);
      });
    }
  };
  let videoRequested=false;
  const loadVideo=()=>{
    if(disposed||videoRequested)return;
    videoRequested=true;
    video.src=options.source??'/assets/realistic-winter/flames-real-loop.mp4';
    video.load();
  };
  poster=new THREE.TextureLoader().load(options.poster??'/assets/realistic-winter/flames-real-poster.jpg',texture=>{
    if(disposed){texture.dispose();return;}root.userData.posterReady=true;refresh();options.onReady?.();
  },undefined,error=>{if(!disposed){root.userData.posterError=true;loadVideo();options.onError?.(error);}});
  poster.colorSpace=THREE.SRGBColorSpace;poster.generateMipmaps=false;poster.minFilter=THREE.LinearFilter;
  video.addEventListener('loadeddata',()=>{videoTexture.needsUpdate=true;root.userData.videoReady=true;refresh();options.onReady?.();},{signal:events.signal});
  video.addEventListener('error',()=>{root.userData.videoError=true;options.onError?.(video.error);},{signal:events.signal});
  document.addEventListener('pointerdown',()=>{if(blocked){blocked=false;refresh();}},{signal:events.signal,passive:true});
  if(!options.deferVideo)loadVideo();
  const cameraLocal=new THREE.Vector3();
  return{
    root,mesh,light,video,loadVideo,
    get motionBlocked(){return blocked;},
    get framePresented(){return firstFrame||(typeof video.requestVideoFrameCallback!=='function'&&video.readyState>=2&&video.currentTime>0);},
    setComposition(texture:THREE.Texture,isPortrait:boolean){closeCamp.value=texture.userData.closeCamp?1:0;const pit=winterPit(isPortrait,!!texture.userData.closeCamp,texture.userData.compactPit);pitLayout.value.set(pit.x,pit.y,pit.scale);plate.value=texture;portrait.value=isPortrait?1:0;crop.value.set(texture.repeat.x,texture.repeat.y,texture.offset.x,texture.offset.y);},
    setMotion(enabled:boolean){if(motion===enabled)return;motion=enabled;refresh();},
    setExposure(value:number){exposure.value=THREE.MathUtils.clamp(value,.1,3);},
    update(time:number,camera:THREE.Camera,isActive:boolean){
      active=isActive;root.updateWorldMatrix(true,false);camera.getWorldPosition(cameraLocal);root.worldToLocal(cameraLocal);
      mesh.rotation.y=Math.atan2(cameraLocal.x,cameraLocal.z);sparkTime.value=performance.now()*0.001;
      light.intensity=8*(motion&&active?1+.055*Math.sin(time*7.1)+.025*Math.sin(time*13.7):1);
      refresh();
    },
    pause(){active=false;refresh();},
    dispose(){
      if(frameCallback!==undefined)video.cancelVideoFrameCallback(frameCallback);
      if(disposed)return;disposed=true;events.abort();video.pause();video.removeAttribute('src');video.load();
      sparkGeom.dispose();sparkMat.dispose();geometry.dispose();material.dispose();emberMesh.geometry.dispose();emberMaterial.dispose();videoTexture.dispose();poster?.dispose();root.clear();
    },
  };
}

