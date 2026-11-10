import {campPlateGLSL,campDetailUniforms} from './CampPlate';
import * as THREE from 'three';
import { auroraLightingGLSL,type AuroraLightUniforms } from './AuroraLighting';

/** Level shadow-receiving geometry with camera-projected photographic snow.
 * The backplate retains its exposure; local contact and fire flicker add depth. */
export function createSnowTerrain(background:THREE.Texture,chest:THREE.Object3D,ice:THREE.Object3D,fire:THREE.Object3D,aurora: AuroraLightUniforms,sharedIrradiance?:{value:THREE.Texture}){
  const geometry=new THREE.PlaneGeometry(80,80);geometry.rotateX(-Math.PI/2);geometry.translate(0,-.006,0);
  const backdropUniform={value:background},crop={value:new THREE.Vector4(1,1,0,0)},closeCamp={value:0},detail={value:0},iceStrength={value:1},firePosition={value:fire.position.clone()},flicker={value:0};
  const woodFoot={value:new THREE.Vector4()},iceFoot={value:new THREE.Vector4()},footAngles={value:new THREE.Vector2()},phoneGround={value:0};
  const material=new THREE.MeshStandardMaterial({color:0xffffff,roughness:1,metalness:0,toneMapped:false});
  material.onBeforeCompile=shader=>{
    Object.assign(shader.uniforms,{...campDetailUniforms,...aurora,uPhoneGround:phoneGround,uWoodFoot:woodFoot,uIceFoot:iceFoot,uFootAngles:footAngles,uSnowBackdrop:backdropUniform,uSnowCrop:crop,uCloseCamp:closeCamp,uHighDetail:detail,uIceStrength:iceStrength,uFirePosition:firePosition,uFireFlicker:flicker});
    if(sharedIrradiance)shader.uniforms.uSharedIrradiance=sharedIrradiance;
    shader.vertexShader=(sharedIrradiance?'uniform sampler2D uSharedIrradiance;\n':'')+'varying vec3 vSnowWorld;varying vec4 vSnowClip;varying vec3 vAuroraIrradiance;\n'+auroraLightingGLSL+'\n'+shader.vertexShader;
    shader.vertexShader=shader.vertexShader.replace('#include <project_vertex>',`#include <project_vertex>
      vSnowWorld=(modelMatrix*vec4(transformed,1.)).xyz;vSnowClip=gl_Position;vAuroraIrradiance=${sharedIrradiance?'texelFetch(uSharedIrradiance,ivec2(0),0).rgb':(aurora.uAuroraGroundStrength.value>0?'auroraDiffuseIrradiance(vec3(0.,1.,0.))':'vec3(0.)')};`);
    shader.fragmentShader=`uniform float uHighDetail;uniform float uCloseCamp;${campPlateGLSL}
 uniform sampler2D uSnowBackdrop;uniform vec4 uSnowCrop;uniform float uIceStrength;uniform vec3 uFirePosition;uniform float uFireFlicker;uniform vec4 uWoodFoot;uniform vec4 uIceFoot;uniform vec2 uFootAngles;uniform float uPhoneGround;
      varying vec3 vSnowWorld;varying vec4 vSnowClip;varying vec3 vAuroraIrradiance;
      ${auroraLightingGLSL}
      vec3 snowSkyBase(vec3 direction){
        vec3 viewDirection=uAuroraWorldToView*direction;
        if(viewDirection.z>=-.0001)return vec3(.012,.023,.040);
        vec2 screenUv=(viewDirection.xy/(-viewDirection.z)/uAuroraProjection)*.5+.5;
        vec2 plateUv=screenUv*uSnowCrop.xy+uSnowCrop.zw;
        if(any(lessThan(plateUv,vec2(0.)))||any(greaterThan(plateUv,vec2(1.))))return vec3(.012,.023,.040);
        return textureLod(uSnowBackdrop,plateUv,4.).rgb;
      }
      float footDistance(vec2 p,vec2 center,vec2 halfSize,float angle){p-=center;float c=cos(angle),s=sin(angle);p=mat2(c,s,-s,c)*p;vec2 q=abs(p)-halfSize;return length(max(q,0.))+min(max(q.x,q.y),0.);}
      float footprint(vec2 p,vec2 center,vec2 halfSize,float angle){return exp(-pow(max(footDistance(p,center,halfSize,angle),0.),2.)*32.);}
    `+shader.fragmentShader;
    shader.fragmentShader=shader.fragmentShader.replace('#include <shadowmap_pars_fragment>','#include <shadowmap_pars_fragment>\n#include <shadowmask_pars_fragment>');
    shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>',`
      vec2 uv=(vSnowClip.xy/vSnowClip.w*.5+.5)*uSnowCrop.xy+uSnowCrop.zw;
      vec3 plate=campPlateColor(uSnowBackdrop,uv,uCloseCamp);
      float wood=footprint(vSnowWorld.xz,uWoodFoot.xy,uWoodFoot.zw,uFootAngles.x);
      float ice=footprint(vSnowWorld.xz,uIceFoot.xy,uIceFoot.zw,uFootAngles.y)*uIceStrength;
      float nearGround=1.-smoothstep(9.,19.,length(vSnowWorld.xz));
      float shadowMask=getShadowMask();
      float attenuation=mix(1.,mix(.60,1.,shadowMask)*(1.-.48*max(wood,ice)),nearGround);
      vec2 fireDelta=vSnowWorld.xz-uFirePosition.xz;
      float fireRadius2=dot(fireDelta,fireDelta);
      float firePool=exp(-fireRadius2*.65);
      if(uPhoneGround>.5){
        float woodScale=max(.05,uWoodFoot.z/1.65),iceScale=max(.05,uIceFoot.z);
        float woodDistance=max(0.,footDistance(vSnowWorld.xz,uWoodFoot.xy,uWoodFoot.zw,uFootAngles.x));
        float iceDistance=max(0.,footDistance(vSnowWorld.xz,uIceFoot.xy,uIceFoot.zw,uFootAngles.y));
        float woodContact=exp(-pow(woodDistance/(woodScale*.32),2.));
        float iceContact=exp(-pow(iceDistance/(iceScale*.25),2.))*uIceStrength;
        // Scale the contact field with the props, rather than world origin.
        // A narrow occlusion seam and broad penumbra seat each base in snow.
        float woodSeam=exp(-pow(woodDistance/(woodScale*.065),2.));
        float iceSeam=exp(-pow(iceDistance/(iceScale*.055),2.))*uIceStrength;
        attenuation=mix(.68,1.,shadowMask)
          *(1.-.30*woodContact-.15*woodSeam)
          *(1.-.19*iceContact-.10*iceSeam);
      }
      if(uCloseCamp<.5||uHighDetail<.5){
        // Retain the portrait/mobile composition and fire response.
        outgoingLight=max(vec3(0.),(plate+auroraSnowLight(uv,plate,vAuroraIrradiance))*attenuation+vec3(.04,.010,.002)*firePool*uFireFlicker);
        if(uPhoneGround>.5){
          float metric=max(1.,uWoodFoot.z/1.65);
          float falloff=exp(-fireRadius2/(metric*metric)*.30);
          vec3 fireBounce=vec3(.060,.019,.004)*pow(max(plate,vec3(0.)),vec3(.55))*falloff*(1.+uFireFlicker);
          outgoingLight+=fireBounce*attenuation;
        }
      }else{
        float fireRadius=sqrt(fireRadius2);
        // Diffuse incidence from a finite-height emitter, plus broad secondary
        // bounce. This is a controlled photographic relight, not a simulation.
        float emitterHeight=.90;
        float sourceDistance2=fireRadius2+emitterHeight*emitterHeight;
        float directFalloff=(emitterHeight*emitterHeight/sourceDistance2)
          *(emitterHeight/sqrt(sourceDistance2));
        float diffuseBounce=1./(1.+fireRadius2*.38);
        float range=1.-smoothstep(4.5,8.,fireRadius);
        float warmFalloff=(.74*directFalloff+.26*diffuseBounce)*range;
        float localFire=exp(-fireRadius2*.20);
        vec3 skyBounce=auroraDiffuseSnowLight(uv,plate,localFire,vAuroraIrradiance);
        vec3 snowResponse=pow(max(plate,vec3(0.)),vec3(.55));
        // Avoid laying a second saturated orange pool over the photograph's
        // already-warm coals. Cool snow can accept a little more bounce.
        float bakedWarm=smoothstep(.015,.10,max(0.,plate.r-plate.b*1.15));
        float warmHeadroom=1.-.65*bakedWarm;
        // The same 7.1/13.7 Hz field already drives FlameVideo's point light;
        // keep the ground in phase, without a separate clock or whole-page pulse.
        float fireEnergy=1.+uFireFlicker;
        vec3 fireBounce=vec3(.110,.034,.007)*snowResponse*warmFalloff
          *warmHeadroom*fireEnergy;
        outgoingLight=max(vec3(0.),(plate+skyBounce+fireBounce)*attenuation);
      }
      // Fixed patches of thin ice crust receive the actual reflected curtain.
      // Coverage/normal variations are material structure, never an animation.
      float crustA=auroraNoise(vSnowWorld.xz*.23+vec2(1.7,4.9));
      float crustB=auroraNoise(vSnowWorld.xz*.67+vec2(8.3,.6));
      float crust=smoothstep(.30,.67,crustA*.70+crustB*.30);
      float snowReceiver=smoothstep(.018,.075,plate.b)*smoothstep(.60,.98,plate.b/max(.001,plate.r));
      float openGround=1.-smoothstep(.375,.445,uv.y);
      openGround*=smoothstep(.18,.32,uv.x)*(1.-smoothstep(.88,.97,uv.x));
      float reflectionWeight=crust*snowReceiver*openGround;
      if(uAuroraGroundStrength>0.&&reflectionWeight>.025){
        // Match the photographed ground horizon. The picture is a projected
        // receiver, so its apparent plane differs slightly from the prop plane.
        float horizonNdc=((.49-uSnowCrop.w)/uSnowCrop.y)*2.-1.;
        vec3 photoNormal=normalize(vec3(0.,1.,horizonNdc*uAuroraProjection.y));
        vec3 snowNormal=normalize(uAuroraViewToWorld*photoNormal+vec3((crustA-.5)*.035,0.,(crustB-.5)*.035));
        vec3 viewer=normalize(cameraPosition-vSnowWorld);
        float grazing=1.-max(0.,dot(snowNormal,viewer));
        float fresnel=.018+(1.-.018)*pow(grazing,5.);
        vec3 reflectedDirection=reflect(-viewer,snowNormal);
        vec3 reflectedSky=auroraRoughReflection(reflectedDirection,.18+.14*(1.-crust));
        float firePriority=1.-.88*firePool;
        float filmWeight=fresnel*reflectionWeight*.85*firePriority;
        vec3 skyBase=snowSkyBase(reflectedDirection);
        outgoingLight=outgoingLight*(1.-filmWeight)+(skyBase+reflectedSky)*(filmWeight*attenuation);
      }
      #include <opaque_fragment>`);
  };
  material.customProgramCacheKey=()=> 'snowy-phone-contact-v3'+(sharedIrradiance?'-shared-f32-v1':'');
  const root=new THREE.Group();root.name='photographic-snow-ground';
  const ground=new THREE.Mesh(geometry,material);ground.receiveShadow=true;root.add(ground);
  // Minute snow overlap breaks the perfectly clean prop/ground cut-out seam.
  const rim=(object:THREE.Object3D,hx:number,hz:number)=>{
    const vertices:number[]=[],indices:number[]=[],segments=128;
    for(let i=0;i<=segments;i++){
      const a=i/segments*Math.PI*2,c=Math.cos(a),s=Math.sin(a);
      const inner=Math.min((hx-.018)/Math.max(.0001,Math.abs(c)),(hz-.018)/Math.max(.0001,Math.abs(s)));
      const outer=Math.min((hx+.13)/Math.max(.0001,Math.abs(c)),(hz+.13)/Math.max(.0001,Math.abs(s)));
      const height=.018+.008*Math.sin(a*19.)+.005*Math.sin(a*43.+1.);
      vertices.push(c*inner,height,s*inner,c*outer,-.006,s*outer);
      if(i<segments){const n=i*2;indices.push(n,n+2,n+1,n+1,n+2,n+3);}
    }
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));g.setIndex(indices);g.computeVertexNormals();
    const mesh=new THREE.Mesh(g,material);mesh.position.copy(object.position);mesh.position.y=0;mesh.rotation.y=object.rotation.y;mesh.receiveShadow=true;root.add(mesh);return mesh;
  };
  const woodScale=chest.scale.x,iceScale=ice.scale.x;
  const woodRim=rim(chest,1.65*woodScale,.90*woodScale),iceRim=rim(ice,iceScale,iceScale);
  return{root,setBackground(texture:THREE.Texture){background=texture;backdropUniform.value=texture;},update(progress:number,collect:number,time:number){
    woodFoot.value.set(chest.position.x,chest.position.z,1.65*chest.scale.x,.9*chest.scale.z);
    iceFoot.value.set(ice.position.x,ice.position.z,ice.scale.x,ice.scale.z);footAngles.value.set(chest.rotation.y,ice.rotation.y);
    phoneGround.value=background.userData.integratedPhone?1:0;
    woodRim.visible=phoneGround.value<.5;iceRim.visible=phoneGround.value<.5;
    woodRim.position.set(chest.position.x,0,chest.position.z);woodRim.rotation.y=chest.rotation.y;woodRim.scale.set(chest.scale.x/woodScale,phoneGround.value?chest.scale.x*2.5:1,chest.scale.z/woodScale);
    iceRim.position.set(ice.position.x,0,ice.position.z);iceRim.rotation.y=ice.rotation.y;iceRim.scale.set(ice.scale.x/iceScale,1,ice.scale.z/iceScale);
    closeCamp.value=background.userData.closeCamp?1:0;detail.value=background.userData.highDetail?1:0;iceStrength.value=(1-progress)*(1-collect);iceRim.scale.y=iceStrength.value*(phoneGround.value?ice.scale.x*2.5:1);iceRim.visible=phoneGround.value<.5&&iceStrength.value>.01;crop.value.set(background.repeat.x,background.repeat.y,background.offset.x,background.offset.y);firePosition.value.copy(fire.position);flicker.value=.055*Math.sin(time*7.1)+.025*Math.sin(time*13.7);
  },dispose(){geometry.dispose();woodRim.geometry.dispose();iceRim.geometry.dispose();material.dispose();}};
}
