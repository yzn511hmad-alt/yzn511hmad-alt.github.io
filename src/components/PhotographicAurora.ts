import {loadSkyMask} from '../webgl/ExactSkyMask';
import * as THREE from 'three';
import { auroraLightingGLSL,type AuroraLightUniforms } from './AuroraLighting';

/** User-supplied original aurora, animated in the shared render loop. */
export function createPhotographicAurora(options:{
  lowPower:boolean;
  maxTextureSize:number;
  assetBase?:string;
  onReady?:()=>void;
  onError?:()=>void;
  intensity?:number;
  skyBlueGate?:[number,number];
}){
  const base=options.assetBase??'/assets/realistic-winter';
  const useUpscaled=options.maxTextureSize>=4108;
  const imageFile=options.lowPower?'aurora-mobile-v1.webp':'aurora-user-original-v1.webp';
  let disposed=false,active=false,loaded=false;
  const maskEvents=new AbortController();
  const crop={value:new THREE.Vector4(1,1,0,0)};
  const artwork=new THREE.Texture();
    const l=new THREE.TextureLoader().load(`${base}/${imageFile}`,()=>{
      if(disposed){l.dispose();return;}
      artwork.image=l.image;artwork.needsUpdate=true;loaded=true;
      options.onReady?.();
    },undefined,(err)=>{ console.error('[SKY TEXTURE ERROR]', err); if(!disposed)options.onError?.();});
  artwork.colorSpace=THREE.NoColorSpace;artwork.generateMipmaps=false;
  artwork.minFilter=artwork.magFilter=THREE.LinearFilter;
  const lighting: AuroraLightUniforms={
    uAuroraMap:{value:artwork},uAuroraIntensity:{value:options.intensity??.62},
    uAuroraGroundStrength:{value:0},uAuroraPortrait:{value:0},uAuroraTime:{value:0},uAuroraNatureBounce:{value:0},uAuroraCrop:crop,
    uAuroraProjection:{value:new THREE.Vector2(1,1)},uAuroraViewToWorld:{value:new THREE.Matrix3()},uAuroraWorldToView:{value:new THREE.Matrix3()},
  };
  const skyMask={value:null as THREE.Texture|null},hasMask={value:0};
  let portrait=false;
  const masks:THREE.Texture[]=[];
  const refreshMask=()=>{const mask=masks[portrait?1:0];skyMask.value=mask;hasMask.value=mask?.image?1:0;};
  const maskLoader=new THREE.TextureLoader();
  const ensureMask=(isPortrait:boolean)=>{
    const index=isPortrait?1:0;
    if(masks[index]?.image)return;
    const maskName=isPortrait?'aurora-sky-portrait-mask.webp':'aurora-sky-landscape-enhanced-mask-v1.webp';
    const ready=(mask:THREE.Texture)=>{if(disposed){mask.dispose();return;}masks[index]?.dispose();masks[index]=mask;refreshMask();options.onReady?.();};
    const fallback=maskLoader.load(base+'/'+maskName,()=> {
      ready(fallback);
    },undefined,()=>{if(!disposed)options.onError?.();});
    fallback.colorSpace=THREE.NoColorSpace;fallback.generateMipmaps=false;fallback.minFilter=fallback.magFilter=THREE.LinearFilter;
  };
  const isInitialPortrait = typeof window !== 'undefined' ? matchMedia('(orientation: portrait), (max-width: 699px)').matches : false;
  ensureMask(isInitialPortrait);
  const material=new THREE.ShaderMaterial({
    transparent:true,blending:THREE.NormalBlending,depthWrite:false,depthTest:true,toneMapped:false,
    uniforms:{...lighting,uPlate:{value:null},uHasPlate:{value:0},uSkyMask:skyMask,uHasSkyMask:hasMask,uSkyGate:{value:new THREE.Vector2(...(options.skyBlueGate??[.68,.90]))},uCrop:crop},
    vertexShader:`varying vec2 vUv;varying vec3 vAuroraIrradiance;
      ${auroraLightingGLSL}
      void main(){vUv=uv;vAuroraIrradiance=vec3(0.);gl_Position=vec4(position.xy,.9999999,1.);}`,
    fragmentShader:`precision highp float;uniform sampler2D uPlate;uniform sampler2D uSkyMask;uniform float uHasSkyMask;uniform vec2 uSkyGate;uniform vec4 uCrop;uniform float uHasPlate;varying vec2 vUv;varying vec3 vAuroraIrradiance;
      ${auroraLightingGLSL}
      void main(){
        if(uHasPlate<.5)discard;
        vec2 plateUv=vUv*uCrop.xy+uCrop.zw;
        vec3 plate=texture2D(uPlate,plateUv).rgb;
        // At forest/horizon boundaries only, distinguish blue sky from branches.
        vec3 maskPlate=texture2D(uPlate,plateUv,2.).rgb;
        float blueSky=smoothstep(uSkyGate.x,uSkyGate.y,(maskPlate.b-maskPlate.r)/max(.001,maskPlate.b));
        blueSky=max(blueSky,smoothstep(.28,.65,max(maskPlate.r,max(maskPlate.g,maskPlate.b))));
        float maskRisk=max(max(1.-smoothstep(.24,.36,plateUv.x),smoothstep(.68,.80,plateUv.x)),1.-smoothstep(.56,.65,plateUv.y));
        float coverage=mix(mix(1.,blueSky,maskRisk),texture2D(uSkyMask,plateUv).r,uHasSkyMask);
        vec3 emission=auroraPlateRadiance(plateUv,true)*coverage;
        // Composite in linear light, then encode once. Additive blending of
        // already encoded pixels was lifting the blue-grey photographic haze.
        // Reuse the existing sky mask: white snow on branches can receive
        // diffuse light, but open sky and dark trunks cannot receive a wash.
        vec3 snowLight=uAuroraGroundStrength>0.?(uAuroraNatureBounce>.5
          ?auroraNatureBackdropLight(plateUv,plate,1.-coverage,vAuroraIrradiance)
          :auroraSnowLight(plateUv,plate,vAuroraIrradiance)):vec3(0.);
        gl_FragColor=vec4(plate+emission+snowLight,1.);
        #include <colorspace_fragment>
      }`,
  });
  const root=new THREE.Mesh(new THREE.PlaneGeometry(2,2),material);
  root.name='user-original-aurora';root.frustumCulled=false;root.renderOrder=-20;
  return{
    root,lighting,
    get textureVariant(){return useUpscaled?'comfyui-upper-local':'original-capability-fallback';},
    get ready(){
      return loaded&&!!masks[portrait?1:0]?.image;
    },
    get time(){return lighting.uAuroraTime.value;},
    update(time:number){if(!disposed&&active)lighting.uAuroraTime.value=time;},
    setCamera(camera:THREE.PerspectiveCamera){
      camera.updateMatrixWorld();
      lighting.uAuroraViewToWorld.value.setFromMatrix4(camera.matrixWorld);
      lighting.uAuroraWorldToView.value.setFromMatrix4(camera.matrixWorldInverse);
      const tangent=Math.tan(THREE.MathUtils.degToRad(camera.fov)*.5);
      lighting.uAuroraProjection.value.set(tangent*camera.aspect,tangent);
    },
    setActive(value:boolean){if(!disposed)active=value;},
    setCrop(texture:THREE.Texture,isPortrait=false){crop.value.set(texture.repeat.x,texture.repeat.y,texture.offset.x,texture.offset.y);material.uniforms.uPlate.value=texture;material.uniforms.uHasPlate.value=1;lighting.uAuroraPortrait.value=isPortrait?1:0;lighting.uAuroraNatureBounce.value=!isPortrait&&texture.userData.highDetail?1:0;portrait=isPortrait;ensureMask(isPortrait);refreshMask();},
    setIrradiance(uniform:{value:THREE.Texture}){
      material.uniforms.uSharedIrradiance=uniform;
      material.vertexShader='uniform sampler2D uSharedIrradiance;\n'+material.vertexShader.replace('vAuroraIrradiance=auroraDiffuseIrradiance(vec3(0.,1.,0.));','vAuroraIrradiance=texelFetch(uSharedIrradiance,ivec2(0),0).rgb;');
      material.needsUpdate=true;
    },
    setIntensity(value:number){lighting.uAuroraIntensity.value=THREE.MathUtils.clamp(value,0,2);},
    get state(){return active&&loaded?'flowing':'still';},
    dispose(){if(disposed)return;disposed=true;maskEvents.abort();artwork.dispose();masks.forEach(mask=>mask.dispose());root.geometry.dispose();material.dispose();},
  };
}
