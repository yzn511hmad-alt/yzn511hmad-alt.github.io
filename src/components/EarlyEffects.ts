import * as THREE from 'three';
import {campPlateGLSL,campDetailUniforms} from './CampPlate';
import type {SharedSurface} from '../webgl/SharedRenderer';
import type {createPhotographicAurora} from './PhotographicAurora';
import type {createFlameVideo} from './FlameVideo';

/** Runs the original sky/video without waiting for the interactive props.
 * Resources, renderer, clock and final materials are shared with the full scene. */
export function createEarlyEffects(options:{surface:SharedSurface;scene:THREE.Scene;camera:THREE.PerspectiveCamera;
 sky:ReturnType<typeof createPhotographicAurora>;fire:ReturnType<typeof createFlameVideo>;
 background:()=>THREE.Texture|undefined;ready:()=>boolean;hidden:()=>Array<THREE.Object3D|undefined>;
 irradiance:()=>void;onReady:()=>void;onFirst:(mode:string)=>void;onError:()=>void;}){
 const {surface,scene,camera,sky,fire}=options;
 const crop={value:new THREE.Vector4()},plate={value:null as THREE.Texture|null},close={value:0};
 const material=new THREE.ShaderMaterial({transparent:true,depthTest:false,depthWrite:false,toneMapped:false,
 uniforms:{...campDetailUniforms,uPlate:plate,uCrop:crop,uClose:close},
 vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',
 fragmentShader:`${campPlateGLSL}\nuniform sampler2D uPlate;uniform vec4 uCrop;uniform float uClose;varying vec2 vUv;
 void main(){vec2 uv=vUv*uCrop.xy+uCrop.zw;float coverage=1.-smoothstep(.355,.405,uv.y);
 if(coverage<.001)discard;gl_FragColor=vec4(campPlateColor(uPlate,uv,uClose),coverage);
 #include <colorspace_fragment>
 }`});
 const ground=new THREE.Mesh(new THREE.PlaneGeometry(2,2),material);ground.name='early-camp-ground';ground.frustumCulled=false;ground.renderOrder=-19;ground.visible=false;scene.add(ground);
 let disposed=false,compiling=false,compiled='',started=false,first=false,motionEnabled=true,fence:WebGLSync|null=null;
 let compileFrame=0;
 const variant=()=>String((fire.mesh.material as THREE.MeshBasicMaterial).map?.uuid)+':'+String(motionEnabled);
 const prepare=async()=>{
  const selected=variant(),textures=new Set<THREE.Texture>();
  const add=(v:unknown)=>{if(v instanceof THREE.Texture&&v.image&&!v.isRenderTargetTexture&&!(v instanceof THREE.VideoTexture))textures.add(v)};
  add(options.background());Object.values(campDetailUniforms).forEach(u=>add(u.value));
  Object.values(sky.root.material.uniforms).forEach(u=>add(u.value));add((fire.mesh.material as THREE.MeshBasicMaterial).map);
   const decodes:Promise<void>[]=[];
   for(const texture of textures){const image=texture.image as {decode?:()=>Promise<void>};if(image?.decode)decodes.push(image.decode().catch(()=>{}));}
   await Promise.all(decodes);if(disposed)return;
   for(const texture of textures)surface.engine.initTexture(texture);
  const group=new THREE.Group();group.add(sky.root.clone(false),ground.clone(false));fire.root.traverse(o=>{if(o instanceof THREE.Mesh)group.add(o.clone(false))});
  surface.engine.toneMapping=surface.toneMapping;surface.engine.toneMappingExposure=surface.toneMappingExposure;surface.engine.outputColorSpace=surface.outputColorSpace;
  await surface.engine.compileAsync(group,camera,scene);if(disposed)return;compiled=selected;compiling=false;options.onReady();
 };
 return {ground,get ready(){return compiled===variant()&&!!compiled},get started(){return started},
 render(time:number,active:boolean,motion:boolean){
  motionEnabled=motion;fire.setMotion(motion);
  if(disposed||!options.ready()||!sky.ready||!options.background()?.image||!(fire.root.userData.posterReady||fire.root.userData.videoReady))return false;
  const gl=surface.engine.getContext() as WebGL2RenderingContext;
  if(fence){const status=gl.clientWaitSync(fence,0,0);if(status===gl.TIMEOUT_EXPIRED)return true;gl.deleteSync(fence);fence=null;
   if(!first){first=true;options.onFirst(status===gl.WAIT_FAILED?'frame-fallback':'fence-complete');}}
  if(compiled!==variant()){if(!compiling){compiling=true;void prepare().catch(()=>{if(!disposed)options.onError()})}return false;}
  const background=options.background()!;plate.value=background;crop.value.set(background.repeat.x,background.repeat.y,background.offset.x,background.offset.y);close.value=background.userData.closeCamp?1:0;
  sky.setCamera(camera);sky.setActive(active&&motion);sky.update(time);fire.setMotion(motion);fire.update(time,camera,active&&motion);options.irradiance();
  const hidden=options.hidden().filter((o):o is THREE.Object3D=>!!o),visibility=hidden.map(o=>o.visible);
  const dirty:Array<[THREE.LightShadow,boolean]>=[];scene.traverse(o=>{if(o instanceof THREE.DirectionalLight){dirty.push([o.shadow,o.shadow.needsUpdate]);o.shadow.needsUpdate=false}});
  try{hidden.forEach(o=>o.visible=false);ground.visible=true;surface.render(scene,camera);started=true;}
  finally{ground.visible=false;hidden.forEach((o,i)=>o.visible=visibility[i]);dirty.forEach(([s,value])=>s.needsUpdate=value)}
  if(!first){if(typeof gl.fenceSync==='function'){fence=gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE,0);if(fence)gl.flush();else{first=true;options.onFirst('frame-fallback')}}else{first=true;options.onFirst('frame-fallback')}}
  return true;
 },dispose(){disposed=true;cancelAnimationFrame(compileFrame);if(fence)(surface.engine.getContext() as WebGL2RenderingContext).deleteSync(fence);scene.remove(ground);ground.geometry.dispose();material.dispose();}};
}
