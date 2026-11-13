import * as THREE from 'three';
import { buildLuxuryKey } from './LuxuryKey';
import { createMeltIceGeometry } from './createMeltIceGeometry';
import { MELT_TINT } from './MeltPalette';

import { meltVertex, iceBounds, createKeyChoreography } from './MeltDynamics';

export interface MeltKeyModelOptions { highDetail?:boolean; naturalClarity?:boolean; compactGeometry?:boolean; }

export function createMeltKeyModel(segments=40,study=3,onMaterialReady?:()=>void,onMaterialError?:()=>void,options:MeltKeyModelOptions={}) {
  // The existing <=32-segment mobile path remains unchanged by default.
  const highDetail=options.highDetail??segments>32;
  // Material appearance is independent of geometry/texture/device budgets.
  const naturalClarity=highDetail||!!options.naturalClarity;
  const root = new THREE.Group(); root.name = 'melt-key-model';
  const preset=THREE.MathUtils.clamp(Math.round(study),1,4);
  let disposed=false;
  root.userData.highDetail=highDetail;root.userData.materialStudy=preset;root.userData.materialReady=false;
  const atlas=new THREE.TextureLoader().load(`/assets/ice-studies/study-${preset}${segments<=32?'-mobile':''}.webp`,texture=>{
    if(disposed){texture.dispose();return;}
    root.userData.materialReady=true;onMaterialReady?.();
  },undefined,()=>{if(!disposed)onMaterialError?.();});
  atlas.colorSpace=THREE.NoColorSpace;atlas.minFilter=THREE.LinearMipmapLinearFilter;
  atlas.magFilter=THREE.LinearFilter;atlas.anisotropy=highDetail?8:4;
  const frostBase=[.60,.65,.59,.62][preset-1];
  const clarity={value:naturalClarity?1:0},frost={value:frostBase*(naturalClarity?.80:1)};
  const key = new THREE.Group(); key.name = 'key';
  const uniforms={uMelt:{value:0},uOpacity:{value:1},uWet:{value:0},uVolumeRoughness:{value:.13},uKeyReveal:{value:0}};
  // The outside stays glossy while the early interior remains diffuse. Blue is
  // carried by Beer–Lambert absorption, rather than opaque blue surface paint.
  const iceMaterial=new THREE.MeshPhysicalMaterial({color:0xe3eaed,metalness:0,roughness:.12,transmission:.98,thickness:1,ior:1.31,attenuationColor:0xaebfc7,attenuationDistance:naturalClarity?4.6:3.8,clearcoat:0,clearcoatRoughness:.36,envMapIntensity:.32,transparent:true,depthWrite:false});

  // Sparse, fixed air inclusions occupy the volume, rather than being pasted
  // onto one face. A ray/sphere closest approach preserves a true parallax cue.
  let airSeed=1967;const airRandom=()=>{airSeed=(airSeed*1664525+1013904223)>>>0;return airSeed/4294967296;};
  const airPockets=Array.from({length:20},()=>{const a=airRandom()*Math.PI*2,r=Math.sqrt(airRandom())*.49;return new THREE.Vector4(Math.cos(a)*r+.04,-.58+airRandom()*1.10,Math.sin(a)*r*.75,.012+airRandom()*.016);});
  iceMaterial.onBeforeCompile=shader=>{
    shader.uniforms.uMelt=uniforms.uMelt;shader.uniforms.uKeyReveal=uniforms.uKeyReveal;shader.uniforms.uAirPockets={value:airPockets};
    shader.uniforms.uVolumeRoughness=uniforms.uVolumeRoughness;shader.uniforms.uStudyMap={value:atlas};shader.uniforms.uFrostStrength=frost;shader.uniforms.uNaturalClarity=clarity;shader.uniforms.uClearCentre={value:[.78,.48,.82,.65][preset-1]};
    shader.fragmentShader=`uniform float uNaturalClarity;uniform vec4 uAirPockets[${airPockets.length}];uniform sampler2D uStudyMap;uniform float uClearCentre;uniform float uFrostStrength;uniform float uKeyReveal;uniform float uVolumeRoughness;uniform float uMelt;uniform mat3 normalMatrix;varying vec3 vJellyLocal;float iceColorDepth;
      float iceHash(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
      float iceNoise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
        return mix(mix(mix(iceHash(i),iceHash(i+vec3(1,0,0)),f.x),mix(iceHash(i+vec3(0,1,0)),iceHash(i+vec3(1,1,0)),f.x),f.y),mix(mix(iceHash(i+vec3(0,0,1)),iceHash(i+vec3(1,0,1)),f.x),mix(iceHash(i+vec3(0,1,1)),iceHash(i+1.),f.x),f.y),f.z);}
      vec3 studyField(vec3 p){
        vec3 n=abs(p-clamp(p,vec3(-.85),vec3(.85)));
        n=pow(max(n,vec3(.0001)),vec3(6.));n/=n.x+n.y+n.z;
        vec2 front=clamp(p.xy*.5+.5,vec2(.001),vec2(.999));
        vec2 side=clamp(vec2(-p.z,p.y)*.5+.5,vec2(.001),vec2(.999));
        vec2 top=clamp(p.xz*.5+.5,vec2(.001),vec2(.999));
        return texture2D(uStudyMap,vec2(front.x/3.,front.y)).rgb*n.z+
          texture2D(uStudyMap,vec2((side.x+1.)/3.,side.y)).rgb*n.x+
          texture2D(uStudyMap,vec2((top.x+2.)/3.,top.y)).rgb*n.y;
      }
      float jellyBoundary(vec3 p){
        vec3 q=abs(p)-vec3(.85);
        return length(max(q,vec3(0.)))+min(max(q.x,max(q.y,q.z)),0.)-.15;
      }
      // Bounded root of the matching convex rounded box, not a scene raymarch.
      // The linear root refinement avoids quantized thickness bands.
      float jellyPath(vec3 p,vec3 d){
        float lo=.0001,hi=4.;
        for(int i=0;i<6;i++){float mid=(lo+hi)*.5;if(jellyBoundary(p+d*mid)>0.)hi=mid;else lo=mid;}
        float a=jellyBoundary(p+d*lo),b=jellyBoundary(p+d*hi);
        return clamp(mix(lo,hi,clamp(-a/max(.00001,b-a),0.,1.)),.025,3.5);
      }\n`+shader.fragmentShader;
    // Very shallow optical waviness gives the broad planar faces soft studio
    // reflections without changing the approved silhouette or edge radius.
    shader.fragmentShader=shader.fragmentShader.replace('#include <roughnessmap_fragment>',`#include <roughnessmap_fragment>
      vec3 frozenDetail=studyField(vJellyLocal);
      vec3 faceWeight=pow(abs(vJellyLocal-clamp(vJellyLocal,vec3(-.85),vec3(.85)))+vec3(.00001),vec3(6.));faceWeight/=faceWeight.x+faceWeight.y+faceWeight.z;
      float clearWindow=(1.-smoothstep(.25,.85,max(abs(vJellyLocal.x),abs(vJellyLocal.y))))*faceWeight.z+
        (1.-smoothstep(.25,.85,max(abs(vJellyLocal.z),abs(vJellyLocal.y))))*faceWeight.x;
      frozenDetail.r*=.48*(1.-clearWindow*uClearCentre);
      vec3 ap=abs(vJellyLocal);
      float edgeDistance=min(max(ap.x,ap.y),min(max(ap.x,ap.z),max(ap.y,ap.z)));
      float cortex=smoothstep(.56,.94,edgeDistance);
      float mottling=iceNoise(vJellyLocal*7.7+vec3(.8,0.,2.));
      float lowerFrost=(1.-smoothstep(-.95,-.57,vJellyLocal.y))*.34;
      frozenDetail.r=max(frozenDetail.r,cortex*(.34+.62*mottling)+lowerFrost);
      float fractureA=abs(dot(vJellyLocal,normalize(vec3(.72,.62,.22)))-.47+.018*sin(vJellyLocal.y*13.));
      float fractureB=abs(dot(vJellyLocal,normalize(vec3(-.28,.82,.50)))+.64+.012*sin(vJellyLocal.x*17.));
      float fractureAA=max(fwidth(min(fractureA,fractureB)),.0007);
      float fractures=(1.-smoothstep(.002,.010${highDetail?'+fractureAA':''},min(fractureA,fractureB)))*(.30+.70*mottling);
      ${highDetail?`// Nested, interrupted fine fractures; bounded to sparse patches.
      float fineFracture=abs(dot(vJellyLocal,normalize(vec3(.34,-.28,.89)))+.22+.007*sin(vJellyLocal.y*23.));
      float fineAA=max(fwidth(fineFracture),.0008);
      float microCrack=(1.-smoothstep(fineAA,fineAA*2.5,fineFracture))*smoothstep(.44,.67,mottling);
      fractures=max(fractures,microCrack*.35);`:''}
      frozenDetail.r=max(frozenDetail.r,fractures*.68);
      float frozenAmount=uFrostStrength*(1.-smoothstep(.42,.92,uMelt));
      roughnessFactor=clamp(roughnessFactor+frozenDetail.r*.44*frozenAmount,.07,.48);
      ${highDetail?`// Restrained micro-frost changes the highlight instead of painting
      // the clear viewing window white. Existing mottling bounds the patches.
      roughnessFactor+=fractures*.025*(1.-smoothstep(.45,.88,uMelt));`:''}`);
    shader.fragmentShader=shader.fragmentShader.replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
      vec3 opticalRipple=vec3(sin(vJellyLocal.y*2.4+vJellyLocal.z*.7),sin(vJellyLocal.z*2.1-vJellyLocal.x*.8),sin(vJellyLocal.x*2.3+vJellyLocal.y*.6));
      normal=normalize(normal+normalMatrix*opticalRipple*.003*(1.-.7*smoothstep(.66,1.,uMelt)));
      vec3 sx=dFdx(-vViewPosition),sy=dFdy(-vViewPosition);
      vec3 rx=cross(sy,normal),ry=cross(normal,sx);
      float determinant=dot(sx,rx);
      vec3 gradient=sign(determinant)*(dFdx(frozenDetail.g)*rx+dFdy(frozenDetail.g)*ry);
      normal=normalize(max(abs(determinant),.0000001)*normal-gradient*.0005*frozenAmount);`);
    // Screen-space refraction cannot resolve multiple curved exits through a
    // single opaque buffer. Keep the full volume depth for absorption, while
    // constraining that screen displacement as the true key is revealed.
    const transmissionPars=THREE.ShaderChunk.transmission_pars_fragment
      .replaceAll('getVolumeTransmissionRay( n, v, thickness,','getVolumeTransmissionRay( n, v, min( thickness, mix(.42,.14,smoothstep(.15,.70,uMelt)) ),')
      .replaceAll('volumeAttenuation( length( transmissionRay ),','volumeAttenuation( iceColorDepth,')
      .replace('vec3 attenuatedColor = transmittance * transmittedLight.rgb;',`
        vec3 attenuatedColor = transmittance * transmittedLight.rgb;
        // Restore a restrained amount of warmth only where the opaque-buffer
        // sample is gold. White surroundings and blue ice keep their original
        // absorption; surface frost, blur and reflection remain in front.
        float goldChroma=(transmittedLight.r-transmittedLight.b)/max(.05,max(transmittedLight.r,transmittedLight.g));
        float goldMask=smoothstep(.10,.38,goldChroma)*smoothstep(.015,.10,transmittedLight.r);
        float goldReadability=.48*smoothstep(.10,.88,uMelt)*uKeyReveal;
        attenuatedColor=mix(attenuatedColor,transmittedLight.rgb*vec3(1.,.86,.55)+vec3(.035,.018,.002),goldMask*goldReadability);
      `);
    shader.fragmentShader=shader.fragmentShader.replace('#include <transmission_pars_fragment>',transmissionPars);
    let transmission=THREE.ShaderChunk.transmission_fragment.replace('n, v, material.roughness, material.diffuseContribution','n, v, uVolumeRoughness, material.diffuseContribution');
    transmission=transmission.replace('vec4 transmitted = getIBLVolumeRefraction(',`
      float jellyMelt=pow(clamp(uMelt,0.,1.),1.55);
      float jellyWidth=1.-.12*jellyMelt-.10*jellyMelt*pow((vJellyLocal.y+1.)*.5,2.);
      float jellyHeight=max(.0001,1.-jellyMelt);
      float jellyDepth=jellyWidth;
      vec3 jellyRay=refract(-v,n,1./material.ior)/max(vec3(.005),vec3(jellyWidth,jellyHeight,jellyDepth));
      material.thickness=jellyPath(vJellyLocal,jellyRay);
      // Preserve the blue pigment in the original volume while only the
      // physical body and refraction compress with the melt.
      vec3 pigmentNormal=normalize(vJellyLocal-clamp(vJellyLocal,vec3(-.85),vec3(.85)));
      iceColorDepth=jellyPath(vJellyLocal,refract(-v,pigmentNormal,1./material.ior));
      vec4 transmitted = getIBLVolumeRefraction(`);
    transmission=transmission.replace('material.transmissionAlpha = mix',`
      // A restrained wrapped-backlight approximation supplies the diffusion
      // absent from screen-space physical transmission. It follows ray depth.
      float scatterDepth=1.-exp(-iceColorDepth*1.3);
      vec3 scatterHalf=normalize(vec3(-.25,.35,-1.)+n*.18);
      float scatterLight=.35+.65*pow(max(0.,dot(v,-scatterHalf)),3.);
      float scatterReveal=1.;
      transmitted.rgb+=vec3(.004,.007,.010)*scatterDepth*scatterLight*scatterReveal;
      vec3 airRay=normalize(vec3(dot(-v,normalMatrix[0]),dot(-v,normalMatrix[1]),dot(-v,normalMatrix[2])));
      float airLength=jellyPath(vJellyLocal,airRay);
      float airCloud=0.,airSpecks=0.;
      for(int sampleIndex=0;sampleIndex<4;sampleIndex++){
        vec3 p=vJellyLocal+airRay*airLength*(float(sampleIndex)+.5)*.25;
        vec3 cloudA=(p-vec3(.10,-.29,-.06))/vec3(.64,.61,.49);
        vec3 cloudB=(p-vec3(-.27,.13,.15))/vec3(.31,.42,.32);
        float envelope=exp(-dot(cloudA,cloudA)*1.9)+.45*exp(-dot(cloudB,cloudB)*2.1);
        airCloud+=envelope*smoothstep(.25,.68,iceNoise(p*9.2+vec3(1.,3.,0.)))*.25;
      }
      for(int bubble=0;bubble<${airPockets.length};bubble++){
        vec3 offset=uAirPockets[bubble].xyz-vJellyLocal;float along=dot(offset,airRay);
        vec3 perpendicular=offset-airRay*along;float radius=uAirPockets[bubble].w;
        float distance=length(perpendicular);
        float bead=exp(-pow(distance/(radius*.72),2.));
        float rim=exp(-pow((distance-radius*.78)/(radius*.19),2.));
        airSpecks+=(bead*.25+rim*.6)*step(0.,along)*step(along,airLength);
      }
      float airFade=1.-smoothstep(.68,.97,uMelt);
      vec3 airLight=max(vec3(.17,.195,.21),transmitted.rgb*.55);
      transmitted.rgb=mix(transmitted.rgb,transmitted.rgb*.35+airLight,min((uNaturalClarity>.5?.36:.72),airCloud*(uNaturalClarity>.5?1.9:4.3))*airFade);
      transmitted.rgb+=airLight*min(1.,airSpecks)*(uNaturalClarity>.5?.66:.85)*airFade;
      // Integrate an obscured champagne-gold heart along a continuous viewing
      // ray. Unlike face-dependent refracted rays this cannot split into eyes.
      vec3 coreCenter=vec3(0.,.04,.02);
      vec3 coreRay=-v/max(vec3(.005),vec3(jellyWidth,jellyHeight,jellyDepth));
      float coreT=max(0.,-dot(vJellyLocal-coreCenter,coreRay)/dot(coreRay,coreRay));
      vec3 corePoint=vJellyLocal+coreRay*coreT-coreCenter;
      vec3 coreDelta=corePoint/vec3(.24,.42,.24);
      float coreGlow=exp(-dot(coreDelta,coreDelta)*1.6);
      vec3 heartDelta=(corePoint+vec3(.025*sin(corePoint.y*7.),0.,0.))/vec3(.11,.27,.12);
      float heart=exp(-dot(heartDelta,heartDelta)*1.8);
      vec3 hazeDelta=corePoint/vec3(.43,.58,.43);
      float coreHaze=exp(-dot(hazeDelta,hazeDelta)*2.);
      float coreFade=1.-uKeyReveal;
      transmitted.rgb*=vec3(1.)-vec3(.03,.12,.30)*coreGlow*coreFade;
      transmitted.rgb+=(vec3(.11,.075,.024)*coreGlow+vec3(.10,.079,.045)*heart+vec3(.019,.014,.006)*coreHaze)*coreFade;
      float frozenScatter=clamp(frozenDetail.r*frozenAmount,0.,.85);
      transmitted.rgb=mix(transmitted.rgb,transmitted.rgb*.70+vec3(.012,.014,.016),frozenScatter*.40);
      material.transmission*=1.-frozenScatter*.76;
      material.transmissionAlpha = mix`);
    shader.fragmentShader=shader.fragmentShader.replace('#include <transmission_fragment>',transmission);
    // Broad white-stage fill on grazing wet edges avoids the dark tray-like
    // band of the old end pose; the actual contour remains convex.
    shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>',`
      float wetEdge=pow(1.-abs(dot(normal,normalize(vViewPosition))),3.);
      outgoingLight+=vec3(.018,.023,.027)*wetEdge*smoothstep(.78,1.,uMelt);
      #include <opaque_fragment>`);
    shader.vertexShader='uniform float uMelt;varying vec3 vJellyLocal;\n'+meltVertex+'\n'+shader.vertexShader;
    shader.vertexShader=shader.vertexShader.replace('#include <beginnormal_vertex>',`#include <beginnormal_vertex>
      vec3 normalAxis=abs(objectNormal.y)<.9?vec3(0.,1.,0.):vec3(1.,0.,0.);
      vec3 tangent=normalize(cross(normalAxis,objectNormal));
      vec3 bitangent=cross(objectNormal,tangent);
      vec3 anchor=shapeIce(position);
      vec3 alongT=shapeIce(position+tangent*.001)-anchor;
      vec3 alongB=shapeIce(position+bitangent*.001)-anchor;
      objectNormal=normalize(cross(alongT,alongB));`);
    shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
      vJellyLocal=hewnIce(position);transformed=shapeIce(position);`);
  };
  iceMaterial.customProgramCacheKey=()=> 'snowy-natural-hewn-ice-gpu-v9-'+airPockets.length+'-'+Number(highDetail)+'-'+Number(naturalClarity);
  // Broad, planar faces with rounding confined to a short .15 edge radius.
  const iceGeometry=createMeltIceGeometry(segments);
  const ice = new THREE.Mesh(iceGeometry, iceMaterial);
  ice.name='ice-body';ice.position.y=1.03;root.add(ice);
  // Discontinuous surface hoar catches the actual moon/fire lights. Keeping it
  // separate from absorption gives a clear frozen core and a dry mineral edge.
  const rimeMaterial=new THREE.MeshStandardMaterial({color:0xdce3e6,roughness:.94,metalness:0,transparent:true,opacity:naturalClarity?.66:.92,depthWrite:false,envMapIntensity:.18});
  rimeMaterial.onBeforeCompile=shader=>{
    shader.uniforms.uMelt=uniforms.uMelt;shader.uniforms.uOpacity=uniforms.uOpacity;shader.uniforms.uRimeAtlas={value:atlas};
    shader.vertexShader='uniform float uMelt;varying vec3 vRimeLocal;\n'+meltVertex+'\n'+shader.vertexShader;
    shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
      vRimeLocal=hewnIce(position);transformed=shapeIce(position)+objectNormal*.0025*(1.-uMelt);`);
    shader.fragmentShader=`uniform sampler2D uRimeAtlas;uniform float uMelt;uniform float uOpacity;varying vec3 vRimeLocal;
      float rimeHash(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
      float rimeNoise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
        return mix(mix(mix(rimeHash(i),rimeHash(i+vec3(1,0,0)),f.x),mix(rimeHash(i+vec3(0,1,0)),rimeHash(i+vec3(1,1,0)),f.x),f.y),mix(mix(rimeHash(i+vec3(0,0,1)),rimeHash(i+vec3(1,0,1)),f.x),mix(rimeHash(i+vec3(0,1,1)),rimeHash(i+1.),f.x),f.y),f.z);}
    `+shader.fragmentShader;
    shader.fragmentShader=shader.fragmentShader.replace('#include <alphamap_fragment>',`#include <alphamap_fragment>
      vec3 ap=abs(vRimeLocal);float edge=min(max(ap.x,ap.y),min(max(ap.x,ap.z),max(ap.y,ap.z)));
      float cortex=smoothstep(.56,.91,edge);
      float clusters=smoothstep(.32,.70,rimeNoise(vRimeLocal*8.1+vec3(3.,1.,.7)));
      float grain=.48+.52*rimeNoise(vRimeLocal*95.);
      float basal=(1.-smoothstep(-.92,-.67,vRimeLocal.y))*.35;
      float frostPatch=smoothstep(.54,.77,rimeNoise(vRimeLocal*4.6+vec3(.5,4.,2.)))*smoothstep(-.8,.5,vRimeLocal.y);
      vec3 fw=pow(max(abs(vRimeLocal-clamp(vRimeLocal,vec3(-.85),vec3(.85))),vec3(.0001)),vec3(6.));fw/=fw.x+fw.y+fw.z;
      vec2 fuv=clamp(vRimeLocal.xy*.5+.5,vec2(.001),vec2(.999));
      vec2 suv=clamp(vec2(-vRimeLocal.z,vRimeLocal.y)*.5+.5,vec2(.001),vec2(.999));
      vec2 tuv=clamp(vRimeLocal.xz*.5+.5,vec2(.001),vec2(.999));
      float crackle=texture2D(uRimeAtlas,vec2(fuv.x/3.,fuv.y)).r*fw.z+texture2D(uRimeAtlas,vec2((suv.x+1.)/3.,suv.y)).r*fw.x+texture2D(uRimeAtlas,vec2((tuv.x+2.)/3.,tuv.y)).r*fw.y;
      diffuseColor.a*=max(max(max(cortex*clusters*1.05,basal),frostPatch*.62),max(0.,crackle-.20)*1.35)*grain*uOpacity*(1.-smoothstep(.32,.82,uMelt));`);
  };
  rimeMaterial.customProgramCacheKey=()=> 'snowy-patchy-rime-gpu-v4-'+Number(highDetail);
  const rime=new THREE.Mesh(iceGeometry,rimeMaterial);rime.name='surface-hoar';rime.position.copy(ice.position);root.add(rime);

  const metal = new THREE.MeshPhysicalMaterial({color:0xd5ae5e,roughness:.23,metalness:1,envMapIntensity:1.25,emissive:0x000000});
  const polish=new THREE.MeshPhysicalMaterial({color:0xf1d28c,roughness:.14,metalness:1,envMapIntensity:1.35});
  const satin=new THREE.MeshPhysicalMaterial({color:0xc6a15a,roughness:.29,metalness:1,envMapIntensity:1.20});
  // Opaque-buffer coverage fade lets the key resolve inside transmission,
  // rather than putting a transparent key on top of the ice. Interior blur
  // filters the fixed screen-door pattern before any edge emerges from ice.
  const keyFade=(fragment:string)=>'uniform float uKeyReveal;\n'+fragment.replace('void main() {',`void main() {
    if(uKeyReveal<.9999){float grain=fract(sin(dot(floor(gl_FragCoord.xy),vec2(12.9898,78.233)))*43758.5453);if(uKeyReveal<=0.||grain>uKeyReveal)discard;}`);
  for(const material of [metal,polish,satin]){
    material.onBeforeCompile=shader=>{shader.uniforms.uKeyReveal=uniforms.uKeyReveal;shader.fragmentShader=keyFade(shader.fragmentShader);};
    material.customProgramCacheKey=()=> 'snowy-turned-gold-resolve-v1';
  }
  const keyDepth=new THREE.MeshDepthMaterial({depthPacking:THREE.RGBADepthPacking});
  keyDepth.onBeforeCompile=shader=>{shader.uniforms.uKeyReveal=uniforms.uKeyReveal;shader.fragmentShader=keyFade(shader.fragmentShader);};
  keyDepth.customProgramCacheKey=()=> 'snowy-key-shadow-resolve-v6';
  const {ring,shaft,bit,collar}=buildLuxuryKey(key,metal,polish,satin,segments<=32,options.compactGeometry);
  key.position.set(0,.14,.08);key.scale.setScalar(.70);root.add(key);
  const choreography=createKeyChoreography(key);
  // Kept as an empty named node for the stage/model contract. The early glow is
  // evaluated in the volume shader so refraction cannot split proxy lobes.
  const core=new THREE.Group();core.name='ambiguous-golden-core';
  core.visible=false;root.add(core);
  // The same moving mesh casts its silhouette onto this world-space floor.
  const floorMaterial=new THREE.ShadowMaterial({color:0x496574,opacity:.22,depthWrite:false});
  // Artistic transmission approximation: retain contact density, soften and
  // lighten the ice's projected shadow. The actual mesh still defines its mask.
  // At the end, the opaque key keeps the unattenuated shadow-map response.
  floorMaterial.onBeforeCompile=shader=>{
    shader.uniforms.uMelt=uniforms.uMelt;
    shader.vertexShader='varying vec2 vShadowFloor;\n'+shader.vertexShader;
    shader.vertexShader=shader.vertexShader.replace('#include <worldpos_vertex>','#include <worldpos_vertex>\n vShadowFloor=(modelMatrix*vec4(transformed,1.)).xz;');
    shader.fragmentShader=`uniform float uMelt;varying vec2 vShadowFloor;
      float iceFoot(){return .94*(1.-.12*pow(clamp(uMelt,0.,1.),1.55));}
      vec2 iceCenter(){return vec2(0.);}
      float icePenumbra(){float gap=max(0.,max(abs(vShadowFloor.x-iceCenter().x),abs(vShadowFloor.y-iceCenter().y))-iceFoot());return mix(.32,1.,smoothstep(0.,.85,gap));}
    `+shader.fragmentShader;
    const mask=THREE.ShaderChunk.shadowmask_pars_fragment.replace('directionalLight.shadowRadius,','directionalLight.shadowRadius * mix(icePenumbra(),1.,smoothstep(.80,1.,uMelt)),');
    shader.fragmentShader=shader.fragmentShader.replace('#include <shadowmask_pars_fragment>',mask);
    shader.fragmentShader=shader.fragmentShader.replace('gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );',`
      float edge=max(abs(vShadowFloor.x-iceCenter().x),abs(vShadowFloor.y-iceCenter().y));
      float contact=1.-smoothstep(iceFoot()*.83,iceFoot()*1.08,edge);
      float density=mix(.44+.56*contact,1.,smoothstep(.80,1.,uMelt));
      gl_FragColor=vec4(color,opacity*density*(1.-getShadowMask()));`);
  };
  floorMaterial.customProgramCacheKey=()=> 'snowy-translucent-contact-shadow-v2';
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(200,200),floorMaterial);
  floor.name='shadow-receiver';floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;root.add(floor);
  ice.castShadow=true;
  key.traverse(o=>{if(o instanceof THREE.Mesh){o.castShadow=true;o.customDepthMaterial=keyDepth;}});
  const depth=new THREE.MeshDepthMaterial({depthPacking:THREE.RGBADepthPacking});
  depth.onBeforeCompile=shader=>{shader.uniforms.uMelt=uniforms.uMelt;shader.vertexShader='uniform float uMelt;\n'+meltVertex+'\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n transformed=shapeIce(position);');};
  depth.customProgramCacheKey=()=> 'snowy-complete-vertical-shadow-gpu-v12';ice.customDepthMaterial=depth;
  const parts={ice,key,ring,shaft,bit,collar,floor,core};
  root.userData.sculptRuntime={nodes:parts,meshes:{root:ice,ring,shaft,bit,collar},sockets:{floor:new THREE.Vector3(0,.04,0)},colliders:{ice:{type:'box',size:[2,2,2]},key:{type:'compound'}},explodable:true,clickable:true};
  const smooth=(a:number,b:number,t:number)=>{const x=THREE.MathUtils.clamp((t-a)/(b-a),0,1);return x*x*(3-2*x);};
  const update=(progress:number,collect=0)=>{
    const p=THREE.MathUtils.clamp(progress,0,1);uniforms.uMelt.value=p;
    const bounds=iceBounds(p);
    const scale=Math.cbrt(bounds.x*bounds.y*bounds.z);
    iceMaterial.roughness=.12+.06*smooth(.72,1,p);
    const iceOpacity=(1-smooth(.978,1,p))*(1-collect);
    uniforms.uOpacity.value=iceOpacity;iceMaterial.opacity=iceOpacity;
    ice.visible=p<1&&iceOpacity>.00001;
    rime.visible=p<.82&&iceOpacity>.00001;
    // The nearly flat, translucent film no longer casts a solid ice shadow.
    ice.castShadow=ice.visible&&p<.978;
    const reveal=smooth(.04,.48,p);uniforms.uVolumeRoughness.value=.13-.05*reveal;

    key.visible=true;
    uniforms.uKeyReveal.value=smooth(.04,.18,p);metal.emissiveIntensity=0;


    root.userData.meltwater={enabled:false,wetness:0,runoffVisible:false,dropsVisible:false,area:0,visualVolume:0,filmHeight:0};
    root.userData.meltVisual={iceTint:iceMaterial.attenuationColor.getHexString(),iceScale:scale,iceOpacity:iceMaterial.opacity,keyBlur:uniforms.uVolumeRoughness.value,keyReveal:uniforms.uKeyReveal.value,glowAlpha:1-uniforms.uKeyReveal.value};
    const pose=choreography.pose(p);
    key.rotation.set(-pose.angle*(1-collect),0,-.08*(1-collect));
    key.position.set(0,pose.y+1.45*collect,pose.z*(1-collect));key.scale.setScalar(.70-.18*collect);
    root.userData.meltDynamics={choreography:'reference-progressive',keyAngle:pose.angle,keyY:pose.y,keyZ:pose.z,iceCenter:[bounds.cx,bounds.cz],iceHalfSize:[bounds.x,bounds.y,bounds.z],remnantHeight:bounds.y*2};
    root.updateMatrixWorld(true);
  };
  update(0);
  const dispose=()=>{disposed=true;atlas.dispose();const geometries=new Set<THREE.BufferGeometry>(),materials=new Set<THREE.Material>();root.traverse(o=>{if(o instanceof THREE.Mesh){geometries.add(o.geometry);(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>materials.add(m));if(o instanceof THREE.InstancedMesh)o.dispose();}});depth.dispose();keyDepth.dispose();geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());};
  return {root,...parts,startupTextures:[atlas],update,dispose,setNaturalClarity(enabled:boolean){const clear=highDetail||enabled;clarity.value=clear?1:0;frost.value=frostBase*(clear?.80:1);iceMaterial.attenuationDistance=clear?4.6:3.8;rimeMaterial.opacity=clear?.66:.92;}};
}







