import { syncAuroraArt } from '../core/AuroraArt';
import * as THREE from 'three';
import { SharedSurface } from './SharedRenderer';
import { onFrame } from '../core/FrameLoop';
import { QualityTier } from '../core/QualityTier';
import { AuroraQuality,AuroraGpuTimer } from './AuroraQuality';

const vertexShader = `varying vec2 vUv;
void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}`;
const fragmentShader = `
precision highp float;
uniform sampler2D uMap;
uniform vec2 uScale;
uniform vec2 uOffset;
uniform vec2 uMoon;
uniform vec2 uMoonRadius;
uniform float uTime;
uniform float uPixelWidth;
uniform float uStrandFrequency;
varying vec2 vUv;
// Smooth irregular one-dimensional density, coherent along each light strand.
float strandHash(float n){return fract(sin(n*127.1+311.7)*43758.5453);}
float strandNoise(float p){
  float i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);
  return mix(strandHash(i),strandHash(i+1.0),f);
}
void main(){
  vec2 uv=uOffset+vUv*uScale;
  // Advect narrow rays within a slowly folding sheet. Different spatial
  // frequencies move independently: the light never travels as one rigid image.
  // All offsets start at zero, matching the static fallback on the first frame.
  float t=uTime;
  float fold=sin(uv.x*11.0+t*.52)-sin(uv.x*11.0);
  float ripple=sin(uv.x*24.0-uv.y*3.0-t*.73)-sin(uv.x*24.0-uv.y*3.0);
  float curl=sin(uv.y*8.0+uv.x*6.0+t*.41)-sin(uv.y*8.0+uv.x*6.0);
  float rays=sin(uv.x*47.0+uv.y*7.0-t*.86)-sin(uv.x*47.0+uv.y*7.0);
  // Suppress displacement at the top boundary; preserve thin vertical filaments.
  float hanging=1.0-smoothstep(.90,1.0,uv.y);
  vec2 bend=vec2(.006*curl+.0015*rays,
                 (.039*fold+.018*ripple)*hanging);
  vec2 flowingUV=vec2(clamp(uv.x+bend.x,0.002,.998),min(uv.y+bend.y,1.0));
  if(flowingUV.y<0.0)discard;
  vec4 flowing=texture2D(uMap,flowingUV);
  flowing*=smoothstep(.8,1.,length((uv-uMoon)/uMoonRadius));
  if(flowing.a<.001)discard;
  // Illumination travels through the curtain, rather than globally flashing.
  float stream=.16*(sin(uv.x*23.0+uv.y*4.0-t*.82)-sin(uv.x*23.0+uv.y*4.0));
  float shimmer=.06*(sin(uv.x*71.0-uv.y*3.0+t*1.12)-sin(uv.x*71.0-uv.y*3.0));
  // Light strands are evaluated inside the moving sheet, so they follow its
  // folds instead of sliding over the sky as a screen-space striped overlay.
  float strandX=flowingUV.x+.010*sin(flowingUV.x*15.0+flowingUV.y*1.8+t*.09)
                             +.003*sin(flowingUV.x*43.0-flowingUV.y*2.4-t*.12);
  // Keep every density cell several physical pixels wide on small surfaces.
  float frequency=uStrandFrequency;
  float fibers=strandNoise(strandX*frequency+strandNoise(strandX*39.0)*.7);
  float bundles=strandNoise(strandX*frequency*.43+7.3);
  float folds=strandNoise(strandX*21.0+t*.025);
  float filaments=smoothstep(.61,.93,fibers)*(.45+.55*bundles);
  float reveal=smoothstep(0.0,1.2,t);
  float interior=smoothstep(.035,.40,flowing.a);
  float detailMix=reveal*interior*smoothstep(1.8,4.0,uPixelWidth/frequency);
  // Dark slits separate the fine curtains; sparse brighter cores sit in front.
  float density=mix(1.0,.64+.36*(.70*fibers+.30*bundles),detailMix*.70);
  flowing*=density;
  float relief=detailMix*(.38*filaments+.10*folds);
  flowing.rgb*=1.0+stream+shimmer+relief;
  gl_FragColor=flowing;
}`;

/** One transparent quad over the still photograph; the shared renderer owns GL. */
export class AuroraFlow {
  private surface: SharedSurface;
  private scene=new THREE.Scene();
  private camera=new THREE.Camera();
  private geometry=new THREE.PlaneGeometry(2,1.12).translate(0,.44,0);
  private material=new THREE.ShaderMaterial({
    vertexShader,fragmentShader,transparent:true,depthTest:false,depthWrite:false,
    toneMapped:false,premultipliedAlpha:true,uniforms:{uMap:{value:null},uScale:{value:new THREE.Vector2(1,1)},uOffset:{value:new THREE.Vector2()},uMoon:{value:new THREE.Vector2(.856,.66)},uMoonRadius:{value:new THREE.Vector2(.1,.09)},uTime:{value:0},uPixelWidth:{value:1100},uStrandFrequency:{value:240}},
  });
  private texture?:THREE.Texture;
  private textureURL='';
  private events=new AbortController();
  private observer:ResizeObserver;
  private unsubscribe?:()=>void;
  private active=false;
  private show=true;
  private ready=false;
  private lost=false;
  private disposed=false;
  private last=-Infinity;
  private lastPhase=-Infinity;
  private elapsed=0;
  private width=1;
  private height=1;
  private quality=new AuroraQuality();
  private gpuTimer:AuroraGpuTimer;
  private deviceLimit={width:4096,height:4096};
  private deviceDPR=devicePixelRatio||1;

  constructor(private element:HTMLElement,private host:HTMLElement){
    const canvas=document.createElement('canvas');
    canvas.className='aurora-canvas';canvas.dataset.auroraSurface='true';canvas.style.visibility='hidden';
    this.surface=new SharedSurface(canvas,{antialias:false});
    this.gpuTimer=new AuroraGpuTimer(this.surface.engine.getContext() as WebGL2RenderingContext);this.readDeviceLimit();
    this.host.dataset.auroraQuality='auto';
    // Only the upper56% contains light, including its maximum displacement.
    const coordinates=this.geometry.getAttribute('uv');
    for(let i=0;i<coordinates.count;i++)coordinates.setY(i,.44+coordinates.getY(i)*.56);
    this.scene.add(new THREE.Mesh(this.geometry,this.material));
    this.element.append(canvas);
    const signal=this.events.signal;
    window.addEventListener('resize',this.resize,{passive:true,signal});
    canvas.addEventListener('webglcontextlost',event=>{
      event.preventDefault();this.lost=true;this.gpuTimer.clear(true);this.stop();canvas.style.visibility='hidden';this.element.dataset.animated='false';this.host.dataset.auroraState='fallback';
    },{signal});
    canvas.addEventListener('webglcontextrestored',()=>{
      this.lost=false;this.gpuTimer.restore();this.readDeviceLimit();if(this.texture)this.texture.needsUpdate=true;this.last=-Infinity;this.resize();this.start();
    },{signal});
    this.observer=new ResizeObserver(()=>this.resize());this.observer.observe(element);
    this.resize();
  }
  setActive(active:boolean,show=true):void{
    this.active=active;this.show=show;
    if(!show){this.surface.domElement.style.visibility='hidden';this.element.dataset.animated='false';}
    if(active)this.start();else{this.stop();if(!this.lost)this.host.dataset.auroraState=show?'paused':'static';}
  }
  resize=():void=>{
    if(this.disposed)return;
    const rect=this.element.getBoundingClientRect();this.width=Math.max(1,rect.width);this.height=Math.max(1,rect.height);
    this.deviceDPR=devicePixelRatio||1;
    this.quality.configure({width:this.width,height:this.height,deviceDPR:this.deviceDPR,
      lowPower:QualityTier.lowPower,maxWidth:this.deviceLimit.width,maxHeight:this.deviceLimit.height},performance.now());
    this.gpuTimer.clear();this.applyResolution();
    // Stable world-space strands do not change their pattern when quality adapts.
    this.material.uniforms.uStrandFrequency.value=Math.min(290,this.width*.18);
    syncAuroraArt(this.element);
    const url=getComputedStyle(this.element).backgroundImage.match(/url\(["']?([^"')]+)["']?\)/)?.[1];
    if(url&&url!==this.textureURL){
      this.textureURL=url;this.ready=false;this.stop();this.surface.domElement.style.visibility='hidden';this.element.dataset.animated='false';this.host.dataset.auroraState='loading';
      new THREE.TextureLoader().load(url,texture=>{
        if(this.disposed||this.textureURL!==url){texture.dispose();return;}
        // Raw sRGB samples are returned unchanged; CSS keeps all non-aurora pixels.
        texture.colorSpace=THREE.NoColorSpace;texture.premultiplyAlpha=true;texture.generateMipmaps=true;texture.minFilter=THREE.LinearMipmapLinearFilter;texture.magFilter=THREE.LinearFilter;
        this.texture?.dispose();this.texture=texture;this.material.uniforms.uMap.value=texture;this.ready=true;this.updateCrop();this.start();
      },undefined,()=>{if(!this.disposed&&this.textureURL===url){this.stop();this.host.dataset.auroraState='fallback';}});
    }else{this.updateCrop();if(this.ready&&this.active&&!this.lost)this.draw();}
  };
  private readDeviceLimit():void{
    const gl=this.surface.engine.getContext();
    this.element.dataset.auroraTextureLimit=String(gl.getParameter(gl.MAX_TEXTURE_SIZE));
    const max=Number(gl.getParameter(gl.MAX_RENDERBUFFER_SIZE));
    const viewport=gl.getParameter(gl.MAX_VIEWPORT_DIMS) as Int32Array;
    this.deviceLimit={width:Math.min(max,viewport[0]),height:Math.min(max,viewport[1])};
  }
  private applyResolution():void{
    const ratio=this.quality.ratio;
    this.surface.setPixelRatio(ratio);this.surface.setSize(this.width,this.height);
    this.material.uniforms.uPixelWidth.value=Math.max(1,Math.round(this.width*ratio));
    this.host.dataset.auroraScale=ratio.toFixed(3);
  }
  private updateCrop():void{
    if(!this.texture)return;
    const image=this.texture.image as HTMLImageElement,aspect=this.width/this.height,source=image.width/image.height;
    const scale=this.material.uniforms.uScale.value as THREE.Vector2;
    const offset=this.material.uniforms.uOffset.value as THREE.Vector2;
    const portrait=matchMedia('(orientation: portrait)').matches;
    const style=getComputedStyle(this.element),stretch=style.getPropertyValue('--aurora-fit').trim()==='stretch';
    if(stretch){const height=Number(style.getPropertyValue('--aurora-height'))||1;scale.set(1,1/height);offset.set(0,1-1/height);}
    else{scale.set(Math.min(1,aspect/source),Math.min(1,source/aspect));offset.set(1-scale.x,portrait?0:(1-scale.y)*.5);}
    // Project the moon from its independent sky plane into the aurora aperture.
    const sky=this.host.querySelector<HTMLElement>('.polar-layer--sky')!;
    const skyRect=sky.getBoundingClientRect(),lightRect=this.element.getBoundingClientRect();
    const skyAspect=portrait?941/1672:1672/941;
    const renderedWidth=Math.max(skyRect.width,skyRect.height*skyAspect),renderedHeight=renderedWidth/skyAspect;
    const moonX=skyRect.right-renderedWidth*(1-(portrait?.856:.842));
    const moonY=skyRect.top+(skyRect.height-renderedHeight)*(portrait?1:.5)+renderedHeight*(portrait?.46:.381);
    (this.material.uniforms.uMoon.value as THREE.Vector2).set(offset.x+(moonX-lightRect.left)/this.width*scale.x,offset.y+(1-(moonY-lightRect.top)/this.height)*scale.y);
    // Protect the whole disc plus a small margin for the independent sky camera.
    const radius=renderedWidth*(portrait?.058:.033)+24;
    (this.material.uniforms.uMoonRadius.value as THREE.Vector2).set(Math.max(.10,radius/this.width*scale.x/.8),Math.max(.09,radius/this.height*scale.y/.8));
  }
  private start():void{
    if(this.disposed||!this.active||!this.ready||this.lost||this.unsubscribe)return;
    this.last=-Infinity;this.quality.hold(performance.now());this.host.dataset.auroraState='flowing';this.unsubscribe=onFrame(this.tick);
  }
  private stop():void{this.unsubscribe?.();this.unsubscribe=undefined;this.last=this.lastPhase=-Infinity;this.gpuTimer.clear(this.lost);this.quality.hold(performance.now());}
  private tick=(time:number):void=>{
    if(!this.active||document.hidden||this.lost){this.stop();return;}
    if(this.deviceDPR!==(devicePixelRatio||1))this.resize();
    const wall=performance.now();this.quality.frame(wall);
    const interval=1/(QualityTier.lowPower?20:30);
    if(time-this.last<interval)return;
    if(Number.isFinite(this.lastPhase))this.elapsed+=Math.min(.12,time-this.lastPhase);
    this.lastPhase=time;
    this.material.uniforms.uTime.value=this.elapsed;this.draw();
    this.last=Number.isFinite(this.last)?time-((time-this.last)%interval):time;
  };
  private draw():void{
    if(this.disposed||!this.ready||this.lost||!this.active||document.hidden)return;
    const wall=performance.now();
    this.gpuTimer.poll(wall,(ms,revision)=>this.quality.gpu(ms,revision));
    if(this.quality.evaluate(wall,!this.host.classList.contains('is-moving'))){this.gpuTimer.clear();this.applyResolution();}
    this.gpuTimer.begin(this.quality.revision,wall);
    const started=performance.now();
    try{this.surface.render(this.scene,this.camera);}finally{this.gpuTimer.end();}
    this.quality.submit(performance.now()-started);
    if(this.show&&this.element.dataset.animated!=='true'){this.surface.domElement.style.visibility='visible';this.element.dataset.animated='true';}
  }
  dispose():void{
    if(this.disposed)return;this.disposed=true;this.stop();this.observer.disconnect();this.events.abort();
    this.texture?.dispose();this.geometry.dispose();this.material.dispose();this.surface.dispose();this.surface.domElement.remove();this.element.dataset.animated='false';
  }
}
