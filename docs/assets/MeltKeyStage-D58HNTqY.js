import{n as e}from"./SnowyFooter-Dy0mc3AW.js";import{i as t}from"./vendor-gsap-bXzFIbWr.js";import{n}from"./Scroll-LFdG9vbQ.js";import{$ as r,A as i,B as a,C as o,D as s,E as c,F as l,G as u,H as d,I as f,J as p,K as m,L as h,M as g,N as _,O as v,Q as y,R as b,S as x,T as S,U as C,V as w,W as T,X as E,Y as D,Z as O,_ as k,a as A,b as j,c as M,d as N,et as P,f as ee,g as te,h as ne,i as re,j as ie,k as F,l as ae,m as I,n as L,nt as R,p as z,q as B,r as oe,rt as se,s as ce,t as le,tt as V,u as ue,v as H,w as de,x as fe,y as pe,z as me}from"./vendor-three-D_NgQBH7.js";import{t as he}from"./SharedRenderer-BzNDmtRk.js";var ge={uCampDetail:{value:null},uHasCampDetail:{value:0},uCompactCamp:{value:new R},uPhoneSnow:{value:null},uHasPhoneSnow:{value:0},uPhoneSnowLayout:{value:0}};function _e(e,t=!1,n=t){ge.uPhoneSnow.value=e??null,ge.uHasPhoneSnow.value=e?.image&&t?1:0,ge.uPhoneSnowLayout.value=e?.image&&t&&n?1:0}function ve(e=0,t=0,n=0,r=!1){ge.uCompactCamp.value.set(e,t,n,+!!r)}function ye(e){ge.uCampDetail.value=e??null,ge.uHasCampDetail.value=+!!e}var be=`uniform sampler2D uCampDetail;uniform float uHasCampDetail;uniform vec4 uCompactCamp;uniform sampler2D uPhoneSnow;uniform float uHasPhoneSnow;uniform float uPhoneSnowLayout;
vec3 phoneSnowColor(vec2 uv,vec3 original){
 if(uHasPhoneSnow<.5)return original;
 vec2 snowUv=vec2(mix(.18,.22,uPhoneSnowLayout)+uv.x*.32,uv.y*.90);
 vec3 snow=texture2D(uPhoneSnow,snowUv).rgb;
 float ground=1.-smoothstep(.355,.405,uv.y);
 return mix(original,snow,ground);
}
vec3 campSourceColor(sampler2D plate,vec2 uv){
 vec3 base=texture2D(plate,uv).rgb;
 if(uHasCampDetail<.5||uCompactCamp.w>.5)return base;
 vec2 minCorner=vec2(.514354067,.584484591);
 vec2 q=(vec2(uv.x,1.-uv.y)-minCorner)/vec2(.19138756,.204038257);
 float edge=1.-smoothstep(.72,1.,length((q-.5)/vec2(.5)));
 if(edge<=0.)return base;
 return mix(base,texture2D(uCampDetail,vec2(q.x,1.-q.y)).rgb,edge);
}
vec3 campPlateColor(sampler2D plate,vec2 uv,float closeCamp){
 vec3 result=phoneSnowColor(uv,campSourceColor(plate,uv));
 vec2 p=vec2(uv.x,1.-uv.y);
 if(uCompactCamp.z>0.){
  vec2 sourceCenter=uCompactCamp.w>.5?vec2(.563,.646):vec2(.6105,.681);
  vec2 source=sourceCenter+(p-uCompactCamp.xy)/uCompactCamp.z;
  vec2 oldRadii=uCompactCamp.w>.5?vec2(.110,.044):vec2(.105,.040);
  float oldPit=1.-smoothstep(.65,1.,length((p-sourceCenter)/oldRadii));
  vec3 cleanSnow=phoneSnowColor(uv,texture2D(plate,vec2(uv.x,uv.y-.075)).rgb);
  vec3 cleared=mix(result,cleanSnow,oldPit);
  vec2 patchRadii=vec2(.12,.048);
  float patchWeight=1.-smoothstep(.65,1.,length((source-sourceCenter)/patchRadii));
  result=mix(cleared,campSourceColor(plate,vec2(source.x,1.-source.y)),patchWeight);
 }else if(closeCamp>=.5){
  // Clear duplicate background campfire on hill for laptop
  vec2 oldCenter=vec2(.6105,.681);
  vec2 oldRadii=vec2(.110,.042);
  float oldPit=1.-smoothstep(.60,1.,length((p-oldCenter)/oldRadii));
  if(oldPit>0.){
   vec3 cleanSnow=phoneSnowColor(uv,texture2D(plate,vec2(uv.x,uv.y-.075)).rgb);
   result=mix(result,cleanSnow,oldPit);
  }
  // Foreground high-definition campfire
  vec2 c=vec2(.577,.737);
  float mask=1.-smoothstep(.72,1.,length((p-c)/vec2(.22,.14)))*smoothstep(.595,.625,p.y);
  if(mask>=.001){
   vec2 source=vec2(.6105,.681)+(p-c)/1.5;
   result=mix(result,campSourceColor(plate,vec2(source.x,1.-source.y)),mask);
  }
 }
 return result;
}`;function xe(e){let{surface:t,scene:n,camera:r,sky:i,fire:a}=e,o={value:new R},s={value:null},c={value:0},l=new B({transparent:!0,depthTest:!1,depthWrite:!1,toneMapped:!1,uniforms:{...ge,uPlate:s,uCrop:o,uClose:c},vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}`,fragmentShader:`${be}\nuniform sampler2D uPlate;uniform vec4 uCrop;uniform float uClose;varying vec2 vUv;
 void main(){vec2 uv=vUv*uCrop.xy+uCrop.zw;float coverage=1.-smoothstep(.355,.405,uv.y);
 if(coverage<.001)discard;gl_FragColor=vec4(campPlateColor(uPlate,uv,uClose),coverage);
 #include <colorspace_fragment>
 }`}),u=new v(new b(2,2),l);u.name=`early-camp-ground`,u.frustumCulled=!1,u.renderOrder=-19,u.visible=!1,n.add(u);let d=!1,f=!1,p=``,m=!1,h=!1,g=!0,_=null,y=()=>String(a.mesh.material.map?.uuid)+`:`+String(g),x=async()=>{let o=y(),s=new Set,c=e=>{e instanceof O&&e.image&&!e.isRenderTargetTexture&&!(e instanceof se)&&s.add(e)};c(e.background()),Object.values(ge).forEach(e=>c(e.value)),Object.values(i.root.material.uniforms).forEach(e=>c(e.value)),c(a.mesh.material.map);let l=[];for(let e of s){let t=e.image;t?.decode&&l.push(t.decode().catch(()=>{}))}if(await Promise.all(l),d)return;for(let e of s)t.engine.initTexture(e);let m=new pe;m.add(i.root.clone(!1),u.clone(!1)),a.root.traverse(e=>{e instanceof v&&m.add(e.clone(!1))}),t.engine.toneMapping=t.toneMapping,t.engine.toneMappingExposure=t.toneMappingExposure,t.engine.outputColorSpace=t.outputColorSpace,await t.engine.compileAsync(m,r,n),!d&&(p=o,f=!1,e.onReady())};return{ground:u,get ready(){return p===y()&&!!p},get started(){return m},render(l,v,b){if(g=b,a.setMotion(b),d||!e.ready()||!i.ready||!e.background()?.image||!(a.root.userData.posterReady||a.root.userData.videoReady))return!1;let S=t.engine.getContext();if(_){let t=S.clientWaitSync(_,0,0);if(t===S.TIMEOUT_EXPIRED)return!0;S.deleteSync(_),_=null,h||(h=!0,e.onFirst(t===S.WAIT_FAILED?`frame-fallback`:`fence-complete`))}if(p!==y())return f||(f=!0,x().catch(()=>{d||e.onError()})),!1;let C=e.background();s.value=C,o.value.set(C.repeat.x,C.repeat.y,C.offset.x,C.offset.y),c.value=+!!C.userData.closeCamp,i.setCamera(r),i.setActive(v&&b),i.update(l),a.setMotion(b),a.update(l,r,v&&b),e.irradiance();let w=e.hidden().filter(e=>!!e),T=w.map(e=>e.visible),E=[];n.traverse(e=>{e instanceof ne&&(E.push([e.shadow,e.shadow.needsUpdate]),e.shadow.needsUpdate=!1)});try{w.forEach(e=>e.visible=!1),u.visible=!0,t.render(n,r),m=!0}finally{u.visible=!1,w.forEach((e,t)=>e.visible=T[t]),E.forEach(([e,t])=>e.needsUpdate=t)}return h||(typeof S.fenceSync==`function`?(_=S.fenceSync(S.SYNC_GPU_COMMANDS_COMPLETE,0),_?S.flush():(h=!0,e.onFirst(`frame-fallback`))):(h=!0,e.onFirst(`frame-fallback`))),!0},dispose(){d=!0,cancelAnimationFrame(0),_&&t.engine.getContext().deleteSync(_),n.remove(u),u.geometry.dispose(),l.dispose()}}}function Se(e,t=!1,n){if(n){let t=Se(e);return{...t,x:n.x,y:n.y,scale:t.scale*n.zoom}}return t?{x:.577,y:.737,scale:.87,canonicalY:.75,originalBaseY:.798,originalHeight:.18}:e?{x:.563,y:.646,scale:.64,canonicalY:.664,originalBaseY:.69,originalHeight:.095}:{x:.6105,y:.681,scale:.58,canonicalY:.75,originalBaseY:.798,originalHeight:.18}}function Ce(e,t,n,i,a,s=!1){let c=s?a?32:48:a?40:64,l=(t,n,r,i=0,a=0,o=0)=>{let s=new v(n,r);return s.name=t,s.position.set(i,a,o),e.add(s),s},u=[[.255,-.03],[.25,0],[.255,.03],[.273,.052],[.315,.062],[.355,.057],[.385,.035],[.392,0],[.385,-.035],[.355,-.057],[.315,-.062],[.273,-.052],[.255,-.03]].reverse().map(([e,t])=>new P(e,t)),d=new o(u,c);d.rotateX(Math.PI/2);let f=l(`key-ring`,d,i,0,1.89,0);for(let e of[-1,1])l(`ring-outer-bead`,new r(.385,.006,6,c),n,0,1.89,e*.037),l(`ring-inner-bead`,new r(.255,.005,6,c),n,0,1.89,e*.03);let p=l(`key-shaft`,new I(.056,.062,1.37,c,1),t,0,.842,0);l(`shaft-foot`,new E(.062,c,10),n,0,.157,0);let m=[[0,1.405],[.056,1.405],[.058,1.425],[.091,1.432],[.104,1.447],[.106,1.464],[.09,1.48],[.073,1.488],[.076,1.504],[.112,1.516],[.116,1.535],[.098,1.552],[.074,1.563],[.07,1.584],[.076,1.606],[0,1.606]].map(([e,t])=>new P(e,t)),h=l(`key-turned-neck`,new o(m,c),t);for(let e of[1.45,1.532]){let t=new r(e===1.45?.1:.11,.009,6,c);t.rotateX(Math.PI/2),l(`neck-polished-bead`,t,n,0,e,0)}let g=new D;return g.moveTo(.024,.2),g.lineTo(.255,.2),g.lineTo(.255,.305),g.lineTo(.132,.305),g.lineTo(.132,.393),g.lineTo(.255,.393),g.lineTo(.255,.495),g.lineTo(.024,.495),g.closePath(),{ring:f,shaft:p,bit:l(`key-bit`,new k(g,{depth:.086,bevelEnabled:!0,bevelThickness:.009,bevelSize:.009,bevelSegments:3,steps:1}),t,0,0,-.043),collar:h}}var we=new Map,Te=`snowy_ice_cache_v1`,Ee=`geometries`;function De(){return typeof indexedDB>`u`?Promise.resolve(null):new Promise(e=>{try{let t=indexedDB.open(Te,1);t.onupgradeneeded=()=>{try{t.result.createObjectStore(Ee)}catch{}},t.onsuccess=()=>e(t.result),t.onerror=()=>e(null)}catch{e(null)}})}function Oe(e,t,n){let r=new ue;return r.setAttribute(`position`,new ae(new Float32Array(e),3)),r.setAttribute(`normal`,new ae(new Float32Array(t),3)),r.setIndex(new ae(n.length<=65535?new Uint16Array(n):new Uint32Array(n),1)),r.name=`natural-hewn-ice-watertight`,r.computeBoundingBox(),r.computeBoundingSphere(),r}async function ke(e=40){let t=Number.isFinite(e)?Math.max(8,Math.min(80,Math.round(e))):40;if(we.has(t))return;let n=await De();if(n)try{let e=await new Promise(e=>{let r=n.transaction(Ee,`readonly`).objectStore(Ee).get(`ice_${t}`);r.onsuccess=()=>e(r.result??null),r.onerror=()=>e(null)});if(e&&e.pos&&e.norm&&e.idx){let n=Oe(e.pos,e.norm,e.idx);we.set(t,n);return}}catch{}let r=Ae(t);if(we.set(t,r),n)try{let e=r.getAttribute(`position`).array,i=r.getAttribute(`normal`).array,a=r.getIndex().array;n.transaction(Ee,`readwrite`).objectStore(Ee).put({pos:e,norm:i,idx:a},`ice_${t}`)}catch{}}function Ae(e){let t=new M(2,2,2,e,e,e),n=t.getAttribute(`position`),r=new V,i=new V,a=new V,o=[{normal:new V(.64,.62,.45).normalize(),limit:1.37},{normal:new V(-.74,.49,-.46).normalize(),limit:1.39},{normal:new V(.09,1,-.045).normalize(),limit:.955}],s=e=>Math.abs(e)<=.75?e/.75*.85:Math.sign(e)*(.85+(Math.abs(e)-.75)/.25*.15);for(let e=0;e<n.count;e++){r.set(s(n.getX(e)),s(n.getY(e)),s(n.getZ(e))),i.copy(r).clampScalar(-.85,.85),a.copy(r).sub(i).normalize(),r.copy(i).addScaledVector(a,.15);let t=(r.y+1)*.5;r.x*=1-.036*t,r.z*=1-.024*t;let l=.006*Math.sin(r.x*9+r.y*4)*Math.sin(r.z*7-r.y*3)+.004*Math.sin(r.x*19+r.z*13);r.addScaledVector(a,l*c.smoothstep(t,.04,.2));for(let e of o){let t=r.dot(e.normal)-e.limit;t>0&&r.addScaledVector(e.normal,-t)}n.setXYZ(e,r.x,r.y,r.z)}t.deleteAttribute(`uv`),t.deleteAttribute(`normal`);let l=oe(t,1e-5);return t.dispose(),l.computeVertexNormals(),l.name=`natural-hewn-ice-watertight`,l.computeBoundingBox(),l.computeBoundingSphere(),l}function je(e=40){let t=Number.isFinite(e)?Math.max(8,Math.min(80,Math.round(e))):40,n=we.get(t);if(n)return n.clone();let r=Ae(t);return we.set(t,r.clone()),r}var Me=(e,t,n)=>{let r=c.clamp((n-e)/(t-e),0,1);return r*r*(3-2*r)};function Ne(e){let t=c.clamp(e,0,1),n=t**1.55,r=c.lerp(1-.12*n,.985,Me(.66,1,t));return{x:r,y:1-n,z:r,cx:0,cz:0}}var Pe=`
vec3 meltIce(vec3 p){
  float t=clamp(uMelt,0.,1.);
  float melt=pow(t,1.55);
  float h=(p.y+1.)*.5;
  float finish=smoothstep(.66,1.,t);
  float width=1.-.12*melt-.10*melt*h*h;
  vec3 q=p;
  q.xz*=width;
  float height=2.*(1.-melt);
  float slump=.10*melt*sin(h*3.14159265)*(1.-.20*sin(p.x*3.+p.z*2.));
  q.y=-1.+max(0.,height*h-slump);
  // A watertight truncated superellipsoid: a broad rounded-square cap,
  // with a flat contact patch and convex upper surface. There is no lip.
  vec3 direction=normalize(p);
  float radial=length(direction.xz);
  vec2 heading=direction.xz/max(radial,.00001);
  float squareRadius=pow(max(.00001,pow(abs(heading.x),6.)+pow(abs(heading.y),6.)),-1./6.);
  vec3 cap;
  cap.xz=heading*radial*squareRadius*mix(1.-.12*melt,.985,finish);
  cap.x*=1.+.018*(sin(heading.y*2.7+.7)-sin(.7));
  cap.z*=1.+.015*(sin(heading.x*3.1-.5)+sin(.5));
  cap.y=-1.+height*(max(-.65,direction.y)+.65)/1.65;
  q=mix(q,cap,finish);
  return q;
}`;function Fe(e){let t=new w().setFromEuler(new te(-Math.PI/2,0,-.08)),n=new V,r=1/0;e.traverse(e=>{if(!(e instanceof v))return;e.updateMatrix();let i=e.geometry.getAttribute(`position`);for(let a=0;a<i.count;a++)n.fromBufferAttribute(i,a).applyMatrix4(e.matrix).multiplyScalar(.7).applyQuaternion(t),r=Math.min(r,n.y)});let i=.029-r+.002;return{pose:e=>{let t=c.clamp(e,0,1),n=Me(.64,1,t);return{angle:Math.PI/2*n,y:.14-.045*n+(i-.095)*Me(.78,1,t),z:.08+.68*n}},endY:i}}function Ie(e=40,t=3,n,r,a={}){let o=a.highDetail??e>32,s=o||!!a.naturalClarity,l=new pe;l.name=`melt-key-model`;let u=c.clamp(Math.round(t),1,4),f=!1;l.userData.highDetail=o,l.userData.materialStudy=u,l.userData.materialReady=!1;let m=new y().load(`/assets/ice-studies/study-${u}${e<=32?`-mobile`:``}.webp`,e=>{f?e.dispose():(l.userData.materialReady=!0,n?.())},void 0,()=>{f||r?.()});m.colorSpace=``,m.minFilter=S,m.magFilter=de,m.anisotropy=o?8:4;let h=[.6,.65,.59,.62][u-1],_={value:+!!s},C={value:h*(s?.8:1)},w=new pe;w.name=`key`;let T={uMelt:{value:0},uOpacity:{value:1},uWet:{value:0},uVolumeRoughness:{value:.13},uKeyReveal:{value:0}},E=new ie({color:14936813,metalness:0,roughness:.12,transmission:.98,thickness:1,ior:1.31,attenuationColor:11452359,attenuationDistance:s?4.6:3.8,clearcoat:0,clearcoatRoughness:.36,envMapIntensity:.32,transparent:!0,depthWrite:!1}),D=1967,O=()=>(D=D*1664525+1013904223>>>0,D/4294967296),k=Array.from({length:20},()=>{let e=O()*Math.PI*2,t=Math.sqrt(O())*.49;return new R(Math.cos(e)*t+.04,-.58+O()*1.1,Math.sin(e)*t*.75,.012+O()*.016)});E.onBeforeCompile=e=>{e.uniforms.uMelt=T.uMelt,e.uniforms.uKeyReveal=T.uKeyReveal,e.uniforms.uAirPockets={value:k},e.uniforms.uVolumeRoughness=T.uVolumeRoughness,e.uniforms.uStudyMap={value:m},e.uniforms.uFrostStrength=C,e.uniforms.uNaturalClarity=_,e.uniforms.uClearCentre={value:[.78,.48,.82,.65][u-1]},e.fragmentShader=`uniform float uNaturalClarity;uniform vec4 uAirPockets[${k.length}];uniform sampler2D uStudyMap;uniform float uClearCentre;uniform float uFrostStrength;uniform float uKeyReveal;uniform float uVolumeRoughness;uniform float uMelt;uniform mat3 normalMatrix;varying vec3 vJellyLocal;float iceColorDepth;
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
      }\n`+e.fragmentShader,e.fragmentShader=e.fragmentShader.replace(`#include <roughnessmap_fragment>`,`#include <roughnessmap_fragment>
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
      float fractures=(1.-smoothstep(.002,.010${o?`+fractureAA`:``},min(fractureA,fractureB)))*(.30+.70*mottling);
      ${o?`// Nested, interrupted fine fractures; bounded to sparse patches.
      float fineFracture=abs(dot(vJellyLocal,normalize(vec3(.34,-.28,.89)))+.22+.007*sin(vJellyLocal.y*23.));
      float fineAA=max(fwidth(fineFracture),.0008);
      float microCrack=(1.-smoothstep(fineAA,fineAA*2.5,fineFracture))*smoothstep(.44,.67,mottling);
      fractures=max(fractures,microCrack*.35);`:``}
      frozenDetail.r=max(frozenDetail.r,fractures*.68);
      float frozenAmount=uFrostStrength*(1.-smoothstep(.42,.92,uMelt));
      roughnessFactor=clamp(roughnessFactor+frozenDetail.r*.44*frozenAmount,.07,.48);
      ${o?`// Restrained micro-frost changes the highlight instead of painting
      // the clear viewing window white. Existing mottling bounds the patches.
      roughnessFactor+=fractures*.025*(1.-smoothstep(.45,.88,uMelt));`:``}`),e.fragmentShader=e.fragmentShader.replace(`#include <normal_fragment_maps>`,`#include <normal_fragment_maps>
      vec3 opticalRipple=vec3(sin(vJellyLocal.y*2.4+vJellyLocal.z*.7),sin(vJellyLocal.z*2.1-vJellyLocal.x*.8),sin(vJellyLocal.x*2.3+vJellyLocal.y*.6));
      normal=normalize(normal+normalMatrix*opticalRipple*.003*(1.-.7*smoothstep(.66,1.,uMelt)));
      vec3 sx=dFdx(-vViewPosition),sy=dFdy(-vViewPosition);
      vec3 rx=cross(sy,normal),ry=cross(normal,sx);
      float determinant=dot(sx,rx);
      vec3 gradient=sign(determinant)*(dFdx(frozenDetail.g)*rx+dFdy(frozenDetail.g)*ry);
      normal=normalize(max(abs(determinant),.0000001)*normal-gradient*.0005*frozenAmount);`);let t=A.transmission_pars_fragment.replaceAll(`getVolumeTransmissionRay( n, v, thickness,`,`getVolumeTransmissionRay( n, v, min( thickness, mix(.42,.14,smoothstep(.15,.70,uMelt)) ),`).replaceAll(`volumeAttenuation( length( transmissionRay ),`,`volumeAttenuation( iceColorDepth,`).replace(`vec3 attenuatedColor = transmittance * transmittedLight.rgb;`,`
        vec3 attenuatedColor = transmittance * transmittedLight.rgb;
        // Restore a restrained amount of warmth only where the opaque-buffer
        // sample is gold. White surroundings and blue ice keep their original
        // absorption; surface frost, blur and reflection remain in front.
        float goldChroma=(transmittedLight.r-transmittedLight.b)/max(.05,max(transmittedLight.r,transmittedLight.g));
        float goldMask=smoothstep(.10,.38,goldChroma)*smoothstep(.015,.10,transmittedLight.r);
        float goldReadability=.48*smoothstep(.10,.88,uMelt)*uKeyReveal;
        attenuatedColor=mix(attenuatedColor,transmittedLight.rgb*vec3(1.,.86,.55)+vec3(.035,.018,.002),goldMask*goldReadability);
      `);e.fragmentShader=e.fragmentShader.replace(`#include <transmission_pars_fragment>`,t);let n=A.transmission_fragment.replace(`n, v, material.roughness, material.diffuseContribution`,`n, v, uVolumeRoughness, material.diffuseContribution`);n=n.replace(`vec4 transmitted = getIBLVolumeRefraction(`,`
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
      vec4 transmitted = getIBLVolumeRefraction(`),n=n.replace(`material.transmissionAlpha = mix`,`
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
      for(int bubble=0;bubble<${k.length};bubble++){
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
      material.transmissionAlpha = mix`),e.fragmentShader=e.fragmentShader.replace(`#include <transmission_fragment>`,n),e.fragmentShader=e.fragmentShader.replace(`#include <opaque_fragment>`,`
      float wetEdge=pow(1.-abs(dot(normal,normalize(vViewPosition))),3.);
      outgoingLight+=vec3(.018,.023,.027)*wetEdge*smoothstep(.78,1.,uMelt);
      #include <opaque_fragment>`),e.vertexShader=`uniform float uMelt;varying vec3 vJellyLocal;
`+Pe+`
`+e.vertexShader,e.vertexShader=e.vertexShader.replace(`#include <beginnormal_vertex>`,`#include <beginnormal_vertex>
      vec3 normalAxis=abs(objectNormal.y)<.9?vec3(0.,1.,0.):vec3(1.,0.,0.);
      vec3 tangent=normalize(cross(normalAxis,objectNormal));
      vec3 bitangent=cross(objectNormal,tangent);
      vec3 anchor=meltIce(position);
      vec3 alongT=meltIce(position+tangent*.001)-anchor;
      vec3 alongB=meltIce(position+bitangent*.001)-anchor;
      objectNormal=normalize(cross(alongT,alongB));`),e.vertexShader=e.vertexShader.replace(`#include <begin_vertex>`,`#include <begin_vertex>
      vJellyLocal=position;transformed=meltIce(position);`)},E.customProgramCacheKey=()=>`snowy-natural-hewn-ice-v7-`+k.length+`-`+Number(o)+`-`+Number(s);let j=je(e),M=new v(j,E);M.name=`ice-body`,M.position.y=1.03,l.add(M);let N=new g({color:14476262,roughness:.94,metalness:0,transparent:!0,opacity:s?.66:.92,depthWrite:!1,envMapIntensity:.18});N.onBeforeCompile=e=>{e.uniforms.uMelt=T.uMelt,e.uniforms.uOpacity=T.uOpacity,e.uniforms.uRimeAtlas={value:m},e.vertexShader=`uniform float uMelt;varying vec3 vRimeLocal;
`+Pe+`
`+e.vertexShader,e.vertexShader=e.vertexShader.replace(`#include <begin_vertex>`,`#include <begin_vertex>
      vRimeLocal=position;transformed=meltIce(position)+objectNormal*.0025*(1.-uMelt);`),e.fragmentShader=`uniform sampler2D uRimeAtlas;uniform float uMelt;uniform float uOpacity;varying vec3 vRimeLocal;
      float rimeHash(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
      float rimeNoise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
        return mix(mix(mix(rimeHash(i),rimeHash(i+vec3(1,0,0)),f.x),mix(rimeHash(i+vec3(0,1,0)),rimeHash(i+vec3(1,1,0)),f.x),f.y),mix(mix(rimeHash(i+vec3(0,0,1)),rimeHash(i+vec3(1,0,1)),f.x),mix(rimeHash(i+vec3(0,1,1)),rimeHash(i+1.),f.x),f.y),f.z);}
    `+e.fragmentShader,e.fragmentShader=e.fragmentShader.replace(`#include <alphamap_fragment>`,`#include <alphamap_fragment>
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
      diffuseColor.a*=max(max(max(cortex*clusters*1.05,basal),frostPatch*.62),max(0.,crackle-.20)*1.35)*grain*uOpacity*(1.-smoothstep(.32,.82,uMelt));`)},N.customProgramCacheKey=()=>`snowy-patchy-rime-v3-`+Number(o);let P=new v(j,N);P.name=`surface-hoar`,P.position.copy(M.position),l.add(P);let ee=new ie({color:14003806,roughness:.23,metalness:1,envMapIntensity:1.25,emissive:0}),te=new ie({color:15848076,roughness:.14,metalness:1,envMapIntensity:1.35}),ne=new ie({color:13017434,roughness:.29,metalness:1,envMapIntensity:1.2}),re=e=>`uniform float uKeyReveal;
`+e.replace(`void main() {`,`void main() {
    if(uKeyReveal<.9999){float grain=fract(sin(dot(floor(gl_FragCoord.xy),vec2(12.9898,78.233)))*43758.5453);if(uKeyReveal<=0.||grain>uKeyReveal)discard;}`);for(let e of[ee,te,ne])e.onBeforeCompile=e=>{e.uniforms.uKeyReveal=T.uKeyReveal,e.fragmentShader=re(e.fragmentShader)},e.customProgramCacheKey=()=>`snowy-turned-gold-resolve-v1`;let F=new i({depthPacking:d});F.onBeforeCompile=e=>{e.uniforms.uKeyReveal=T.uKeyReveal,e.fragmentShader=re(e.fragmentShader)},F.customProgramCacheKey=()=>`snowy-key-shadow-resolve-v6`;let{ring:ae,shaft:I,bit:L,collar:z}=Ce(w,ee,te,ne,e<=32,a.compactGeometry);w.position.set(0,.14,.08),w.scale.setScalar(.7),l.add(w);let B=Fe(w),oe=new pe;oe.name=`ambiguous-golden-core`,oe.visible=!1,l.add(oe);let se=new p({color:4810100,opacity:.22,depthWrite:!1});se.onBeforeCompile=e=>{e.uniforms.uMelt=T.uMelt,e.vertexShader=`varying vec2 vShadowFloor;
`+e.vertexShader,e.vertexShader=e.vertexShader.replace(`#include <worldpos_vertex>`,`#include <worldpos_vertex>
 vShadowFloor=(modelMatrix*vec4(transformed,1.)).xz;`),e.fragmentShader=`uniform float uMelt;varying vec2 vShadowFloor;
      float iceFoot(){return .94*(1.-.12*pow(clamp(uMelt,0.,1.),1.55));}
      vec2 iceCenter(){return vec2(0.);}
      float icePenumbra(){float gap=max(0.,max(abs(vShadowFloor.x-iceCenter().x),abs(vShadowFloor.y-iceCenter().y))-iceFoot());return mix(.32,1.,smoothstep(0.,.85,gap));}
    `+e.fragmentShader;let t=A.shadowmask_pars_fragment.replace(`directionalLight.shadowRadius,`,`directionalLight.shadowRadius * mix(icePenumbra(),1.,smoothstep(.80,1.,uMelt)),`);e.fragmentShader=e.fragmentShader.replace(`#include <shadowmask_pars_fragment>`,t),e.fragmentShader=e.fragmentShader.replace(`gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );`,`
      float edge=max(abs(vShadowFloor.x-iceCenter().x),abs(vShadowFloor.y-iceCenter().y));
      float contact=1.-smoothstep(iceFoot()*.83,iceFoot()*1.08,edge);
      float density=mix(.44+.56*contact,1.,smoothstep(.80,1.,uMelt));
      gl_FragColor=vec4(color,opacity*density*(1.-getShadowMask()));`)},se.customProgramCacheKey=()=>`snowy-translucent-contact-shadow-v2`;let ce=new v(new b(200,200),se);ce.name=`shadow-receiver`,ce.rotation.x=-Math.PI/2,ce.receiveShadow=!0,l.add(ce),M.castShadow=!0,w.traverse(e=>{e instanceof v&&(e.castShadow=!0,e.customDepthMaterial=F)});let le=new i({depthPacking:d});le.onBeforeCompile=e=>{e.uniforms.uMelt=T.uMelt,e.vertexShader=`uniform float uMelt;
`+Pe+`
`+e.vertexShader,e.vertexShader=e.vertexShader.replace(`#include <begin_vertex>`,`#include <begin_vertex>
 transformed=meltIce(position);`)},le.customProgramCacheKey=()=>`snowy-complete-vertical-shadow-v11`,M.customDepthMaterial=le;let ue={ice:M,key:w,ring:ae,shaft:I,bit:L,collar:z,floor:ce,core:oe};l.userData.sculptRuntime={nodes:ue,meshes:{root:M,ring:ae,shaft:I,bit:L,collar:z},sockets:{floor:new V(0,.04,0)},colliders:{ice:{type:`box`,size:[2,2,2]},key:{type:`compound`}},explodable:!0,clickable:!0};let H=(e,t,n)=>{let r=c.clamp((n-e)/(t-e),0,1);return r*r*(3-2*r)},fe=(e,t=0)=>{let n=c.clamp(e,0,1);T.uMelt.value=n;let r=Ne(n),i=Math.cbrt(r.x*r.y*r.z);E.roughness=.12+.06*H(.72,1,n);let a=(1-H(.978,1,n))*(1-t);T.uOpacity.value=a,E.opacity=a,M.visible=n<1&&a>1e-5,P.visible=n<.82&&a>1e-5,M.castShadow=M.visible&&n<.978;let o=H(.04,.48,n);T.uVolumeRoughness.value=.13-.05*o,w.visible=!0,T.uKeyReveal.value=H(.04,.18,n),ee.emissiveIntensity=0,l.userData.meltwater={enabled:!1,wetness:0,runoffVisible:!1,dropsVisible:!1,area:0,visualVolume:0,filmHeight:0},l.userData.meltVisual={iceTint:E.attenuationColor.getHexString(),iceScale:i,iceOpacity:E.opacity,keyBlur:T.uVolumeRoughness.value,keyReveal:T.uKeyReveal.value,glowAlpha:1-T.uKeyReveal.value};let s=B.pose(n);w.rotation.set(-s.angle*(1-t),0,-.08*(1-t)),w.position.set(0,s.y+1.45*t,s.z*(1-t)),w.scale.setScalar(.7-.18*t),l.userData.meltDynamics={choreography:`reference-progressive`,keyAngle:s.angle,keyY:s.y,keyZ:s.z,iceCenter:[r.cx,r.cz],iceHalfSize:[r.x,r.y,r.z],remnantHeight:r.y*2},l.updateMatrixWorld(!0)};fe(0);let me=()=>{f=!0,m.dispose();let e=new Set,t=new Set;l.traverse(n=>{n instanceof v&&(e.add(n.geometry),(Array.isArray(n.material)?n.material:[n.material]).forEach(e=>t.add(e)),n instanceof x&&n.dispose())}),le.dispose(),F.dispose(),e.forEach(e=>e.dispose()),t.forEach(e=>e.dispose())};return{root:l,...ue,startupTextures:[m],update:fe,dispose:me,setNaturalClarity(e){let t=o||e;_.value=+!!t,C.value=h*(t?.8:1),E.attenuationDistance=t?4.6:3.8,N.opacity=t?.66:.92}}}function Le(e={}){let t=e.highDetail??!e.lowPower,n=new pe;n.name=`walnut-chest`,n.userData.highDetail=t;let r=new pe;r.name=`walnut-lid-pivot`,r.position.set(0,1.06,-.9),n.add(r);let i=new _;i.name=`walnut-key-socket`,i.position.set(0,.79,.925),n.add(i);let a=new Set,o=new Set,s=new Set,d={root:n,lid:r,lockSocket:i},f=!1,p=new ie({color:t?`#c4a78d`:`#b08e71`,roughness:t?.58:.68,metalness:0,clearcoat:t?.18:.08,clearcoatRoughness:t?.38:.34,normalScale:new P(t?.32:.1,t?.32:.1)});n.userData.materialReady=!1;let m=new y,h=0,b=e.assetBase??`/assets/walnut-chest/`,S=(t,r=!1)=>{let i=m.load(`${b}${t}${e.lowPower?`-mobile`:``}.webp`,()=>{f?i.dispose():(h++,n.userData.materialReady=h===3,e.onReady?.())},void 0,()=>{f||(n.userData.materialError=!0,e.onError?.())});return i.colorSpace=r?u:``,i.anisotropy=e.lowPower?4:8,i.wrapS=i.wrapT=T,s.add(i),i};p.map=S(`walnut-color`,!0),p.normalMap=S(`walnut-normal`),p.roughnessMap=S(`walnut-roughness`),p.onBeforeCompile=e=>{e.fragmentShader=e.fragmentShader.replace(`#include <map_fragment>`,`#include <map_fragment>
    // Preserve the photographed veneer contrast instead of tinting it flat.
    diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.20,.115,.064),${t?`.055`:`.22`});`)},p.customProgramCacheKey=()=>`snowy-veneer-detail-v3-`+Number(t);let C=p.clone();C.color.set(t?`#a58c75`:`#947056`),t&&(C.onBeforeCompile=p.onBeforeCompile,C.customProgramCacheKey=p.customProgramCacheKey);let w=new ie({color:`#b99656`,roughness:t?.27:.3,metalness:1,envMapIntensity:1}),E=new ie({color:`#171b1e`,roughness:.98,metalness:0,sheen:.35,sheenColor:new ee(`#394044`),sheenRoughness:.9});o.add(p),o.add(C),o.add(w),o.add(E);let O=e=>(a.add(e),e),A=(e,t)=>{let n=e.getAttribute(`position`),r=e.getAttribute(`normal`),i=new Float32Array(n.count*2);for(let e=0;e<n.count;e++){let a=n.getX(e)+t.x,o=n.getY(e)+t.y,s=n.getZ(e)+t.z,c=Math.abs(r.getX(e)),l=Math.abs(r.getY(e)),u=Math.abs(r.getZ(e));l>c&&l>u?(i[e*2]=a/3.3+.5,i[e*2+1]=(s+.9)/1.8*.42+.44):c>u?(i[e*2]=s/3.3+.5,i[e*2+1]=o/1.535*.46+.15):(i[e*2]=a/3.3+.5,i[e*2+1]=o/1.535*.46+.15)}e.setAttribute(`uv`,new ae(i,2))},j=(e,t,n,i,a)=>{(n===p||n===C)&&A(t,new V(a.x,a.y+(i===r?1.06:0),a.z+(i===r?-.9:0)));let o=new v(O(t),n);return o.name=e,o.position.copy(a),o.castShadow=!0,o.receiveShadow=!0,o.userData.partId=e,i.add(o),d[e]=o,o},N=(r,i,a,o,s,c,l,u=n,d=p)=>j(r,new le(i,a,o,e.lowPower?2:3,Math.min(t?.024:.018,i*.12,a*.12,o*.12)),d,u,new V(s,c,l));N(`bottom`,3.02,.14,1.52,0,.07,0),N(`back`,3.3,1.05,.14,0,.525,-.83),N(`side-left`,.14,1.05,1.56,-1.58,.525,0),N(`side-right`,.14,1.05,1.56,1.58,.525,0);let te=(e,t,n)=>{let r=new D,i=-e/2,a=-t/2;return r.moveTo(i+n,a),r.lineTo(i+e-n,a),r.quadraticCurveTo(i+e,a,i+e,a+n),r.lineTo(i+e,a+t-n),r.quadraticCurveTo(i+e,a+t,i+e-n,a+t),r.lineTo(i+n,a+t),r.quadraticCurveTo(i,a+t,i,a+t-n),r.lineTo(i,a+n),r.quadraticCurveTo(i,a,i+n,a),r},ne=e=>{let t=new l;return t.absarc(0,e,.072,Math.PI*1.24,Math.PI*1.76,!0),t.lineTo(.088,e-.245),t.quadraticCurveTo(.092,e-.265,.07,e-.265),t.lineTo(-.07,e-.265),t.quadraticCurveTo(-.092,e-.265,-.088,e-.245),t.closePath(),t},re=te(3.3,1.05,.018);re.holes.push(ne(.265)),j(`front`,new k(re,{depth:.14,steps:1,bevelEnabled:!0,bevelSegments:2,bevelSize:.006,bevelThickness:.006,curveSegments:e.lowPower?12:20}),p,n,new V(0,.525,.76));let F=te(.31,.44,.042);F.holes.push(ne(.79-.705)),j(`lock`,new k(F,{depth:.018,steps:1,bevelEnabled:!0,bevelSegments:2,bevelSize:.004,bevelThickness:.004,curveSegments:e.lowPower?12:24}),w,n,new V(0,.705,.906)),N(`lid`,3.3,.475,1.8,0,.2375,.9,r),N(`lid-inset`,3,.018,1.5,0,-.005,.9,r,C),N(`interior`,3,.025,1.5,0,.153,0,n,E);let L=.037;for(let[t,r]of[[`hinge-a`,-1.02],[`hinge-b`,1.02]]){let i=new pe;i.name=t,i.position.set(r,1.05,-.89),n.add(i),d[t]=i,N(`${t}-base`,.32,.1,.014,0,-.045,-.01,i,w);let a=j(`${t}-knuckle`,new I(L,L,.32,e.lowPower?12:20),w,i,new V);a.rotation.z=Math.PI/2}let R=O(new I(.014,.014,.007,e.lowPower?8:12)),z=new x(R,w,t?6:4);z.name=`hinge-screws`;let B=new _,oe=0;for(let e of[-1.12,-.92,.92,1.12])B.position.set(e,1.015,-.913),B.rotation.set(Math.PI/2,0,0),B.updateMatrix(),z.setMatrixAt(oe++,B.matrix);n.add(z);let se,ue;if(t){for(let e of[.89,.51])B.position.set(0,e,.932),B.rotation.set(Math.PI/2,0,0),B.updateMatrix(),z.setMatrixAt(oe++,B.matrix);let e=new g({color:`#30281f`,roughness:.85,metalness:.22});o.add(e),se=new x(O(new M(.018,.003,.0015)),e,2),se.name=`lock-screw-slots`;for(let e=0;e<2;e++)B.position.set(0,[.89,.51][e],.9365),B.rotation.set(0,0,e?.36:-.2),B.updateMatrix(),se.setMatrixAt(e,B.matrix);n.add(se),ue=new x(O(new M(.006,.94,.001)),e,2),ue.name=`front-corner-joinery`;for(let e=0;e<2;e++)B.position.set(e?-1.5:1.5,.525,.9065),B.rotation.set(0,0,0),B.updateMatrix(),ue.setMatrixAt(e,B.matrix);n.add(ue)}d.lid=r,d[`hinge-screws`]=z;let H={};n.traverse(e=>{e instanceof v&&(H[e.name]=e)});let de=[...n.children].filter(e=>e!==i),fe=new V(0,.75,0);n.updateMatrixWorld(!0);let me=de.map(e=>({part:e,position:e.position.clone(),offset:new ce().setFromObject(e).getCenter(new V).sub(fe)}));n.userData.sculptRuntime={nodes:d,meshes:H,sockets:{key:i,hinge:r},colliders:{body:{type:`compound-box`,size:[3.3,1.535,1.8]},lid:{type:`box`,size:[3.3,.475,1.8]}},destructionGroups:{body:[`front`,`back`,`side-left`,`side-right`,`bottom`].map(e=>d[e]),lid:[r]},explodable:!0,clickable:!0,setExplode(e){let t=c.clamp(e,0,1);for(let e of me)e.part.position.copy(e.position).addScaledVector(e.offset,t*.65)}},n.userData.reference=`Walnut presentation box: proportional/material inspiration; inferred rear/interior and adapted working lock.`;let he=e=>{r.rotation.x=-c.clamp(e,0,1)*1.83,n.userData.openProgress=c.clamp(e,0,1)};return he(0),{root:n,lidPivot:r,keySocket:i,update:he,dispose(){f||(f=!0,a.forEach(e=>e.dispose()),o.forEach(e=>e.dispose()),s.forEach(e=>e.dispose()),z.dispose(),se?.dispose(),ue?.dispose(),n.clear())}}}function Re(e){if(e.index||Object.keys(e.morphAttributes).length)return!1;let t=Object.entries(e.attributes);if(!t.length||t.some(([,e])=>!(e instanceof ae)||!(e.array instanceof Float32Array)||`isInstancedBufferAttribute`in e))return!1;let n=t[0][1].count;if(t.some(([,e])=>e.count!==n))return!1;let r=t.map(([e,t])=>({name:e,attribute:t,words:new Uint32Array(t.array.buffer,t.array.byteOffset,t.array.length)})),i=[],a=new Uint32Array(n),o=new Map,s=0;for(let{attribute:e}of r)s+=e.itemSize*4;for(let e=0;e<n;e++){let t=``;for(let{attribute:n,words:i}of r)for(let r=0;r<n.itemSize;r++){let a=i[e*n.itemSize+r];t+=String.fromCharCode(a>>>16,a&65535)}let n=o.get(t);n===void 0&&(n=i.length,i.push(e),o.set(t,n)),a[e]=n}let c=i.length<=65535;if(i.length*s+n*(c?2:4)>=n*s)return!1;for(let{name:t,attribute:n,words:a}of r){let r=new Float32Array(i.length*n.itemSize),o=new Uint32Array(r.buffer);for(let e=0;e<i.length;e++)o.set(a.subarray(i[e]*n.itemSize,(i[e]+1)*n.itemSize),e*n.itemSize);let s=new ae(r,n.itemSize,n.normalized);s.name=n.name,s.gpuType=n.gpuType,s.setUsage(n.usage),e.setAttribute(t,s)}return e.setIndex(new ae(c?new Uint16Array(a):a,1)),!0}function ze(e={}){if(new URLSearchParams(location.search).get(`chest`)===`legacy`)return Le(e);let t=e.highDetail??!e.lowPower,n=new pe;n.name=`walnut-chest`,n.userData.highDetail=t;let r=new pe;r.name=`walnut-lid-pivot`,r.position.set(0,1.06,-.9),n.add(r);let i=new _;i.name=`walnut-key-socket`,i.position.set(0,.79,.925),n.add(i);let a=new Set,o=new Set,s=new Set,d={root:n,lid:r,lockSocket:i},f=!1,p=new ie({color:`#c28452`,roughness:.65,metalness:0,clearcoat:.18,clearcoatRoughness:.32,normalScale:new P(.35,.35)});n.userData.materialReady=!1;let m=new y,h=0,b=e.assetBase??(e.lowPower?`/assets/walnut-chest/`:`/assets/walnut-chest-v2/`),S=(t,r=!1)=>{let i=`${b}${t}${e.lowPower?`-mobile`:``}.webp`,a=e.compactGeometry?1:e.lowPower?3:2,o=()=>{h++,n.userData.materialReady=h===a,e.onReady?.()},c=()=>{f||(n.userData.materialError=!0,e.onError?.())},l=new O;return new fe().setOptions({imageOrientation:`flipY`,premultiplyAlpha:`none`,colorSpaceConversion:r?`default`:`none`}).load(i,e=>{f?e.close():(l.image=e,l.needsUpdate=!0,o())},void 0,()=>{m.load(i,e=>{f?e.dispose():(l.image=e.image,l.needsUpdate=!0,o())},void 0,c)}),l.flipY=!1,l.colorSpace=r?u:``,l.anisotropy=e.lowPower?4:8,l.wrapS=l.wrapT=T,s.add(l),l};p.map=S(`walnut-color`,!0),e.compactGeometry?(p.roughness=.62,p.metalness=0):(p.normalMap=S(e.lowPower?`walnut-normal`:`walnut-normal-roughness`),p.roughnessMap=e.lowPower?S(`walnut-roughness`):p.normalMap),p.onBeforeCompile=t=>{e.lowPower||(t.fragmentShader=t.fragmentShader.replace(`#include <roughnessmap_fragment>`,A.roughnessmap_fragment.replace(`texelRoughness.g`,`texelRoughness.a`))),t.fragmentShader=t.fragmentShader.replace(`#include <map_fragment>`,`#include <map_fragment>
      diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.26, 0.12, 0.05), 0.28);
    `)},p.customProgramCacheKey=()=>`snowy-crafted-walnut-v4-`+Number(!!e.lowPower);let C=p.clone();C.color.set(`#c2a78b`),C.onBeforeCompile=p.onBeforeCompile,C.customProgramCacheKey=p.customProgramCacheKey;let w=new ie({color:`#c29542`,roughness:.32,metalness:.88,clearcoat:.3,envMapIntensity:1.2}),E=new ie({color:`#171b1e`,roughness:.98,metalness:0,sheen:.35,sheenColor:new ee(`#394044`),sheenRoughness:.9});o.add(p),o.add(C),o.add(w),o.add(E);let j=e=>(a.add(e),e),N=(e,t,n)=>{let r=e.getAttribute(`position`),i=e.getAttribute(`normal`),a=new Float32Array(r.count*2);for(let e=0;e<r.count;e++){let o=r.getX(e)+t.x,s=r.getY(e)+t.y,c=r.getZ(e)+t.z,l=Math.abs(i.getX(e)),u=Math.abs(i.getY(e)),d=Math.abs(i.getZ(e)),f=1/3.3;u>l&&u>d?(a[e*2]=(n.includes(`stile`)?c:o)*f+.5,a[e*2+1]=(n.includes(`stile`)?o:c)*f+.48):l>d?(a[e*2]=c*f+.37,a[e*2+1]=s*f+.23):n.includes(`stile`)?(a[e*2]=s*f+.16,a[e*2+1]=o*f+.5):(a[e*2]=o*f+.5,a[e*2+1]=s*f+.15)}e.setAttribute(`uv`,new ae(a,2))},te=(e,t,n,i,a)=>{(n===p||n===C)&&N(t,new V(a.x,a.y+(i===r?1.06:0),a.z+(i===r?-.9:0)),e);let o=new v(j(t),n);return o.name=e,o.position.copy(a),o.castShadow=!0,o.receiveShadow=!0,o.userData.partId=e,i.add(o),d[e]=o,o},ne=new Map,re=(e,t,n,r,i)=>{let a=`${e}_${t}_${n}_${r}_${i}`,o=ne.get(a);return o||(o=new le(e,t,n,r,i),ne.set(a,o)),o.clone()},F=(r,i,a,o,s,c,l,u=n,d=p)=>te(r,re(i,a,o,e.compactGeometry?1:e.lowPower?2:3,Math.min(t?.024:.018,i*.12,a*.12,o*.12)),d,u,new V(s,c,l));F(`bottom`,3.02,.14,1.52,0,.07,0),F(`back`,3.3,1.05,.14,0,.525,-.83),F(`side-left`,.14,1.05,1.56,-1.58,.525,0),F(`side-right`,.14,1.05,1.56,1.58,.525,0);let R=(e,t,n)=>{let r=new D,i=-e/2,a=-t/2;return r.moveTo(i+n,a),r.lineTo(i+e-n,a),r.quadraticCurveTo(i+e,a,i+e,a+n),r.lineTo(i+e,a+t-n),r.quadraticCurveTo(i+e,a+t,i+e-n,a+t),r.lineTo(i+n,a+t),r.quadraticCurveTo(i,a+t,i,a+t-n),r.lineTo(i,a+n),r.quadraticCurveTo(i,a,i+n,a),r},z=e=>{let t=new l;return t.absarc(0,e,.072,Math.PI*1.24,Math.PI*1.76,!0),t.lineTo(.088,e-.245),t.quadraticCurveTo(.092,e-.265,.07,e-.265),t.lineTo(-.07,e-.265),t.quadraticCurveTo(-.092,e-.265,-.088,e-.245),t.closePath(),t},B=R(3.3,1.05,.018);B.holes.push(z(.265)),te(`front`,new k(B,{depth:.14,steps:1,bevelEnabled:!0,bevelSegments:2,bevelSize:.006,bevelThickness:.006,curveSegments:e.lowPower?12:20}),p,n,new V(0,.525,.76));let oe=R(.31,.44,.042);oe.holes.push(z(.79-.705)),te(`lock`,new k(oe,{depth:.018,steps:1,bevelEnabled:!0,bevelSegments:2,bevelSize:.004,bevelThickness:.004,curveSegments:e.lowPower?12:24}),w,n,new V(0,.705,.906)),F(`lid`,3.3,.445,1.8,0,.2225,.9,r),F(`lid-inset`,3,.018,1.5,0,-.005,.9,r,C),F(`interior`,3,.025,1.5,0,.153,0,n,E);let se=[];if(!e.compactGeometry){se.push(F(`lid-panel`,2.99,.018,1.49,0,.449,.9,r));for(let e of[.06,1.74])se.push(F(`lid-rail`,3.3,.03,.12,0,.46,e,r));for(let e of[-1.59,1.59])se.push(F(`lid-stile`,.12,.03,1.56,e,.46,.9,r));for(let e of[.055,.995])se.push(F(`front-rail`,3.15,.09,.022,0,e,.918));for(let e of[-1.575,1.575])se.push(F(`front-stile`,.1,.85,.022,e,.525,.918))}for(let e of[n,r]){let t=se.filter(t=>t.parent===e);if(t.length===0)continue;let r=[];for(let n of t)n.updateMatrix(),r.push(n.geometry.clone().applyMatrix4(n.matrix)),e.remove(n),a.delete(n.geometry),n.geometry.dispose(),d[n.name]===n&&delete d[n.name];let i=L(r);if(r.forEach(e=>e.dispose()),i){let t=new v(j(i),p);t.name=e===n?`crafted-front-frame`:`crafted-lid-frame`,t.castShadow=!0,t.receiveShadow=!0,e.add(t),d[t.name]=t}}let ue=.037,H,de;if(!e.compactGeometry){for(let[t,r]of[[`hinge-a`,-1.02],[`hinge-b`,1.02]]){let i=new pe;i.name=t,i.position.set(r,1.05,-.89),n.add(i),d[t]=i,F(`${t}-base`,.32,.1,.014,0,-.045,-.01,i,w);let a=te(`${t}-knuckle`,new I(ue,ue,.32,e.lowPower?12:20),w,i,new V);a.rotation.z=Math.PI/2}let r=j(new I(.014,.014,.007,e.lowPower?8:12));H=new x(r,w,t?6:4),H.name=`hinge-screws`;let i=new _,a=0;for(let e of[-1.12,-.92,.92,1.12])i.position.set(e,1.015,-.913),i.rotation.set(Math.PI/2,0,0),i.updateMatrix(),H.setMatrixAt(a++,i.matrix);if(n.add(H),t){for(let e of[.89,.51])i.position.set(0,e,.932),i.rotation.set(Math.PI/2,0,0),i.updateMatrix(),H.setMatrixAt(a++,i.matrix);let e=new g({color:`#30281f`,roughness:.85,metalness:.22});o.add(e),de=new x(j(new M(.018,.003,.0015)),e,2),de.name=`lock-screw-slots`;for(let e=0;e<2;e++)i.position.set(0,[.89,.51][e],.9365),i.rotation.set(0,0,e?.36:-.2),i.updateMatrix(),de.setMatrixAt(e,i.matrix);n.add(de)}}d.lid=r,H&&(d[`hinge-screws`]=H),a.forEach(Re);let me={};n.traverse(e=>{e instanceof v&&(me[e.name]=e)});let he=[...n.children].filter(e=>e!==i),ge=new V(0,.75,0);n.updateMatrixWorld(!0);let _e=he.map(e=>({part:e,position:e.position.clone(),offset:new ce().setFromObject(e).getCenter(new V).sub(ge)}));n.userData.sculptRuntime={nodes:d,meshes:me,sockets:{key:i,hinge:r},colliders:{body:{type:`compound-box`,size:[3.3,1.535,1.8]},lid:{type:`box`,size:[3.3,.475,1.8]}},destructionGroups:{body:[`front`,`back`,`side-left`,`side-right`,`bottom`].map(e=>d[e]),lid:[r]},explodable:!0,clickable:!0,setExplode(e){let t=c.clamp(e,0,1);for(let e of _e)e.part.position.copy(e.position).addScaledVector(e.offset,t*.65)}},n.userData.reference=`Walnut presentation box: proportional/material inspiration; inferred rear/interior and adapted working lock.`;let ve=e=>{r.rotation.x=-c.clamp(e,0,1)*1.83,n.userData.openProgress=c.clamp(e,0,1)};return ve(0),{root:n,lidPivot:r,keySocket:i,update:ve,dispose(){f||(f=!0,ne.forEach(e=>e.dispose()),ne.clear(),a.forEach(e=>e.dispose()),o.forEach(e=>e.dispose()),s.forEach(e=>{e.dispose(),e.image instanceof ImageBitmap&&e.image.close()}),H?.dispose(),de?.dispose(),n.clear())}}}var Be=`
  uniform sampler2D uAuroraMap;
  uniform float uAuroraIntensity;
  uniform float uAuroraGroundStrength;
  uniform float uAuroraPortrait;
  uniform float uAuroraTime;
  uniform float uAuroraNatureBounce;
  uniform vec4 uAuroraCrop;
  uniform vec2 uAuroraProjection;
  uniform mat3 uAuroraViewToWorld;
  uniform mat3 uAuroraWorldToView;

  vec3 auroraLinear(vec3 s){
    return mix(s/12.92,pow((s+.055)/1.055,vec3(2.4)),step(vec3(.04045),s));
  }
  float auroraHash(vec2 p){
    p=fract(p*vec2(123.34,456.21));
    p+=dot(p,p+45.32);return fract(p.x*p.y);
  }
  float auroraNoise(vec2 p){
    vec2 i=floor(p),f=fract(p);
    f=f*f*f*(f*(f*6.-15.)+10.);
    return mix(mix(auroraHash(i),auroraHash(i+vec2(1.,0.)),f.x),
               mix(auroraHash(i+vec2(0.,1.)),auroraHash(i+vec2(1.)),f.x),f.y);
  }
  vec3 auroraRadiance(vec2 uv,bool showDetail){
    float t=uAuroraTime*1.4641;
    // Coherent, non-repeating local fold transport. The lower curtain shears
    // more than its upper veil, rather than translating the image rigidly.
    float broad=auroraNoise(vec2(uv.x*3.4-t*.085,uv.y*1.7+t*.033));
    float folds=auroraNoise(vec2(uv.x*7.3+t*.14,uv.y*2.4-t*.047));
    float lift=auroraNoise(vec2(uv.x*4.7-t*.10,uv.y*2.8+t*.041));
    float lower=1.-smoothstep(.15,.92,uv.y);
    vec2 p=uv+vec2((broad-.5)*.030+(folds-.5)*.015*lower,
                   (lift-.5)*.023+(broad-.5)*.008*lower);
    if(p.x<0.||p.x>1.||p.y<0.||p.y>1.)return vec3(0.);
    vec4 texel=texture2D(uAuroraMap,p);
    vec3 linear=auroraLinear(texel.rgb);
    float sourceEnergy=max(linear.r,max(linear.g,linear.b))*texel.a;
    float veilWeight=mix(.78,1.08,smoothstep(.025,.45,sourceEnergy));
    if(showDetail){
      // Reference-image pixel scales stay stable at both1x/2x resolutions. Alpha
      // confidence protects the cutout edge; bright cores receive less contrast.
      vec2 fineOffset=vec2(2.75/2054.,0.);
      vec2 broadOffset=vec2(10./2054.,5./766.);
      vec4 fl=texture2D(uAuroraMap,p-fineOffset),fr=texture2D(uAuroraMap,p+fineOffset);
      vec4 bl=texture2D(uAuroraMap,p-broadOffset),br=texture2D(uAuroraMap,p+broadOffset);
      vec3 weights=vec3(.2126,.7152,.0722);
      float y=dot(linear,weights);
      float fineY=dot((auroraLinear(fl.rgb)+auroraLinear(fr.rgb))*.5,weights);
      float broadY=dot((auroraLinear(bl.rgb)+auroraLinear(br.rgb))*.5,weights);
      float confidence=min(texel.a,min(min(fl.a,fr.a),min(bl.a,br.a)));
      float gate=smoothstep(.40,.85,confidence)*(1.-smoothstep(.45,.75,y));
      float delta=((y-fineY)*.34+(y-broadY)*.55)*gate;
      float ratio=clamp(1.+delta/max(.025,y),.86,1.22);
      linear*=ratio;
    }
    // Retain faint source information while reducing its weakest veil.
    float coverage=pow(texel.a,1.35)*veilWeight;
    float violet=smoothstep(.05,.35,texel.b-texel.g);
    float luminance=dot(linear,vec3(.2126,.7152,.0722));
    vec3 colour=mix(vec3(luminance),linear,.98);
    // Broad travelling patches of emission: no evenly spaced synthetic rays
    // and no scene-wide breathing pulse. Sky and snow share this exact field.
    float transport=auroraNoise(vec2(uv.x*5.6-t*.19,uv.y*.75+t*.026));
    float emission=.90+.19*transport;
    vec3 light=colour*coverage*mix(1.,.75,violet)*emission;
    return light*uAuroraIntensity;
  }
  vec3 auroraRadiance(vec2 uv){return auroraRadiance(uv,true);}

  vec4 auroraSourceBounds(){
    float portraitTop=min(.975,uAuroraCrop.w+uAuroraCrop.y-.035);
    return uAuroraPortrait>.5?vec4(.03,portraitTop-.27,.94,.27):vec4(.11,.470,.78,.545);
  }
  // Identical screen-to-sky mapping for the visible curtain and its lighting.
  vec3 auroraPlateRadiance(vec2 plateUv,bool detail){
    vec4 bounds=auroraSourceBounds();
    vec2 uv=(plateUv-bounds.xy)/bounds.zw;
    if(uv.y<0.||uv.y>1.)return vec3(0.);
    float aperture=smoothstep(.04,.14,plateUv.x)*(1.-smoothstep(.86,.96,plateUv.x));
    aperture*=smoothstep(uAuroraPortrait>.5?.515:.490,uAuroraPortrait>.5?.575:.535,plateUv.y);
    return auroraRadiance(uv,detail)*aperture*smoothstep(.04,.18,uv.y);
  }
  vec3 auroraDirectionFromPlate(vec2 plateUv){
    vec2 ndc=((plateUv-uAuroraCrop.zw)/uAuroraCrop.xy)*2.-1.;
    return normalize(uAuroraViewToWorld*vec3(ndc*uAuroraProjection,-1.));
  }
  vec3 auroraEnvironmentRadiance(vec3 worldDirection){
    vec3 viewDirection=uAuroraWorldToView*worldDirection;
    if(viewDirection.z>=-.0001||worldDirection.y<=0.)return vec3(0.);
    vec2 screenUv=(viewDirection.xy/(-viewDirection.z)/uAuroraProjection)*.5+.5;
    return auroraPlateRadiance(screenUv*uAuroraCrop.xy+uAuroraCrop.zw,false);
  }
  // Cosine/solid-angle quadrature of the actual animated visible sky. Evaluate
  // in the vertex stage: snow has a constant upward normal, so doing this in
  // every fragment would add cost without adding any spatial information.
  vec3 auroraDiffuseIrradiance(vec3 worldNormal){
    vec4 bounds=auroraSourceBounds();
    vec2 extent=2.*uAuroraProjection*bounds.zw/uAuroraCrop.xy;
    vec3 irradiance=vec3(0.);
    for(int row=0;row<6;row++)for(int column=0;column<8;column++){
      vec2 uv=(vec2(float(column),float(row))+.5)/vec2(8.,6.);
      vec2 plateUv=bounds.xy+uv*bounds.zw;
      vec2 ndc=((plateUv-uAuroraCrop.zw)/uAuroraCrop.xy)*2.-1.;
      vec3 viewRay=vec3(ndc*uAuroraProjection,-1.);
      float rayLength=length(viewRay);
      vec3 lightDirection=(uAuroraViewToWorld*viewRay)/rayLength;
      float solidAngle=extent.x*extent.y/(48.*rayLength*rayLength*rayLength);
      float cosine=max(0.,dot(worldNormal,lightDirection));
      irradiance+=auroraPlateRadiance(plateUv,false)*cosine*solidAngle;
    }
    return irradiance;
  }
  vec3 auroraRoughReflection(vec3 direction,float roughness){
    vec3 axis=abs(direction.y)<.95?vec3(0.,1.,0.):vec3(1.,0.,0.);
    vec3 tangent=normalize(cross(direction,axis)),bitangent=cross(direction,tangent);
    float spread=max(.001,roughness*roughness*.65);
    return auroraEnvironmentRadiance(direction)*.40
      +auroraEnvironmentRadiance(normalize(direction+tangent*spread))*.15
      +auroraEnvironmentRadiance(normalize(direction-tangent*spread))*.15
      +auroraEnvironmentRadiance(normalize(direction+bitangent*spread))*.15
      +auroraEnvironmentRadiance(normalize(direction-bitangent*spread))*.15;
  }
  // Preserve the photographed base. Added diffuse light is spatially stationary
  // for equal surface normals: no screen-space travelling pools, colour split,
  // independent noise, brightness threshold or artificial disappearance gate.
  vec3 auroraNatureReceive(vec2 uv,vec3 surface,float localFire,float receiver,vec3 irradiance){
    float snowBrightness=smoothstep(.010,.075,max(surface.g,surface.b));
    float snowColour=smoothstep(.48,.94,min(surface.g,surface.b)/max(.001,surface.r));
    float substrate=snowBrightness*snowColour;
    float albedo=sqrt(max(.001,dot(surface,vec3(.2126,.7152,.0722))));
    // Base photograph is not a measured albedo. This conservative response
    // keeps its grain and exposure; the source itself is LDR, not calibrated HDR.
    vec3 light=vec3(albedo)*irradiance*(1./3.14159265)*uAuroraGroundStrength;
    float warmPriority=1.-.90*clamp(localFire,0.,1.);
    return light*receiver*substrate*warmPriority;
  }

  vec3 auroraNatureBackdropLight(vec2 uv,vec3 surface,float nonSky,vec3 irradiance){
    float ground=1.-smoothstep(.385,.455,uv.y);
    float canopy=smoothstep(.30,.43,uv.y)*(1.-smoothstep(.84,.98,uv.y));
    float receiver=max(ground,canopy*.55)*clamp(nonSky,0.,1.);
    vec2 fireDelta=(uv-vec2(.577,.263))/vec2(.16,.065);
    float localFire=exp(-dot(fireDelta,fireDelta));
    return auroraNatureReceive(uv,surface,localFire,receiver,irradiance);
  }

  vec3 auroraSnowLight(vec2 uv,vec3 snow,vec3 irradiance){
    float ground=1.-smoothstep(.365,.425,uv.y);
    vec2 pit=vec2(.5,uAuroraPortrait>.5?.335:.250);
    vec2 d=(uv-pit)/vec2(uAuroraPortrait>.5?.14:.15,uAuroraPortrait>.5?.035:.060);
    return auroraNatureReceive(uv,snow,exp(-dot(d,d)),ground,irradiance);
  }

  vec3 auroraDiffuseSnowLight(vec2 uv,vec3 snow,float localFire,vec3 irradiance){
    float ground=1.-smoothstep(.385,.455,uv.y);
    return auroraNatureReceive(uv,snow,localFire,ground,irradiance);
  }
`;function Ve(e,t,n,r,i,a){let o=new b(80,80);o.rotateX(-Math.PI/2),o.translate(0,-.006,0);let s={value:e},c={value:new R(1,1,0,0)},l={value:0},u={value:0},d={value:1},f={value:r.position.clone()},p={value:0},m={value:new R},h={value:new R},_={value:new P},y={value:0},x=new g({color:16777215,roughness:1,metalness:0,toneMapped:!1});x.onBeforeCompile=e=>{Object.assign(e.uniforms,{...ge,...i,uPhoneGround:y,uWoodFoot:m,uIceFoot:h,uFootAngles:_,uSnowBackdrop:s,uSnowCrop:c,uCloseCamp:l,uHighDetail:u,uIceStrength:d,uFirePosition:f,uFireFlicker:p}),a&&(e.uniforms.uSharedIrradiance=a),e.vertexShader=(a?`uniform sampler2D uSharedIrradiance;
`:``)+`varying vec3 vSnowWorld;varying vec4 vSnowClip;varying vec3 vAuroraIrradiance;
`+Be+`
`+e.vertexShader,e.vertexShader=e.vertexShader.replace(`#include <project_vertex>`,`#include <project_vertex>
      vSnowWorld=(modelMatrix*vec4(transformed,1.)).xyz;vSnowClip=gl_Position;vAuroraIrradiance=${a?`texelFetch(uSharedIrradiance,ivec2(0),0).rgb`:i.uAuroraGroundStrength.value>0?`auroraDiffuseIrradiance(vec3(0.,1.,0.))`:`vec3(0.)`};`),e.fragmentShader=`uniform float uHighDetail;uniform float uCloseCamp;${be}
 uniform sampler2D uSnowBackdrop;uniform vec4 uSnowCrop;uniform float uIceStrength;uniform vec3 uFirePosition;uniform float uFireFlicker;uniform vec4 uWoodFoot;uniform vec4 uIceFoot;uniform vec2 uFootAngles;uniform float uPhoneGround;
      varying vec3 vSnowWorld;varying vec4 vSnowClip;varying vec3 vAuroraIrradiance;
      ${Be}
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
    `+e.fragmentShader,e.fragmentShader=e.fragmentShader.replace(`#include <shadowmap_pars_fragment>`,`#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>`),e.fragmentShader=e.fragmentShader.replace(`#include <opaque_fragment>`,`
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
      #include <opaque_fragment>`)},x.customProgramCacheKey=()=>`snowy-phone-contact-v3`+(a?`-shared-f32-v1`:``);let S=new pe;S.name=`photographic-snow-ground`;let C=new v(o,x);C.receiveShadow=!0,S.add(C);let w=(e,t,n)=>{let r=[],i=[];for(let e=0;e<=128;e++){let a=e/128*Math.PI*2,o=Math.cos(a),s=Math.sin(a),c=Math.min((t-.018)/Math.max(1e-4,Math.abs(o)),(n-.018)/Math.max(1e-4,Math.abs(s))),l=Math.min((t+.13)/Math.max(1e-4,Math.abs(o)),(n+.13)/Math.max(1e-4,Math.abs(s))),u=.018+.008*Math.sin(a*19)+.005*Math.sin(a*43+1);if(r.push(o*c,u,s*c,o*l,-.006,s*l),e<128){let t=e*2;i.push(t,t+2,t+1,t+1,t+2,t+3)}}let a=new ue;a.setAttribute(`position`,new H(r,3)),a.setIndex(i),a.computeVertexNormals();let o=new v(a,x);return o.position.copy(e.position),o.position.y=0,o.rotation.y=e.rotation.y,o.receiveShadow=!0,S.add(o),o},T=t.scale.x,E=n.scale.x,D=w(t,1.65*T,.9*T),O=w(n,E,E);return{root:S,setBackground(t){e=t,s.value=t},update(i,a,o){m.value.set(t.position.x,t.position.z,1.65*t.scale.x,.9*t.scale.z),h.value.set(n.position.x,n.position.z,n.scale.x,n.scale.z),_.value.set(t.rotation.y,n.rotation.y),y.value=+!!e.userData.integratedPhone,D.visible=y.value<.5,O.visible=y.value<.5,D.position.set(t.position.x,0,t.position.z),D.rotation.y=t.rotation.y,D.scale.set(t.scale.x/T,y.value?t.scale.x*2.5:1,t.scale.z/T),O.position.set(n.position.x,0,n.position.z),O.rotation.y=n.rotation.y,O.scale.set(n.scale.x/E,1,n.scale.z/E),l.value=+!!e.userData.closeCamp,u.value=+!!e.userData.highDetail,d.value=(1-i)*(1-a),O.scale.y=d.value*(y.value?n.scale.x*2.5:1),O.visible=y.value<.5&&d.value>.01,c.value.set(e.repeat.x,e.repeat.y,e.offset.x,e.offset.y),f.value.copy(r.position),p.value=.055*Math.sin(o*7.1)+.025*Math.sin(o*13.7)},dispose(){o.dispose(),D.geometry.dispose(),O.geometry.dispose(),x.dispose()}}}function He(e){let t=e.assetBase??`/assets/realistic-winter`,n=e.maxTextureSize>=4108,r=e.lowPower?`aurora-mobile-v1.webp`:`aurora-user-original-v1.webp`,i=!1,a=!1,o=!1,l=new AbortController,u={value:new R(1,1,0,0)},d=new O,f=new y().load(`${t}/${r}`,()=>{i?f.dispose():(d.image=f.image,d.needsUpdate=!0,o=!0,e.onReady?.())},void 0,t=>{console.error(`[SKY TEXTURE ERROR]`,t),i||e.onError?.()});d.colorSpace=``,d.generateMipmaps=!1,d.minFilter=d.magFilter=de;let p={uAuroraMap:{value:d},uAuroraIntensity:{value:e.intensity??.62},uAuroraGroundStrength:{value:0},uAuroraPortrait:{value:0},uAuroraTime:{value:0},uAuroraNatureBounce:{value:0},uAuroraCrop:u,uAuroraProjection:{value:new P(1,1)},uAuroraViewToWorld:{value:new s},uAuroraWorldToView:{value:new s}},m={value:null},h={value:0},g=!1,_=[],x=()=>{let e=_[+!!g];m.value=e,h.value=+!!e?.image},S=new y,C=n=>{let r=+!!n;if(_[r]?.image)return;let a=n?`aurora-sky-portrait-mask.webp`:`aurora-sky-landscape-enhanced-mask-v1.webp`,o=t=>{i?t.dispose():(_[r]?.dispose(),_[r]=t,x(),e.onReady?.())},s=S.load(t+`/`+a,()=>{o(s)},void 0,()=>{i||e.onError?.()});s.colorSpace=``,s.generateMipmaps=!1,s.minFilter=s.magFilter=de};C(!0),C(!1);let w=new B({transparent:!0,blending:1,depthWrite:!1,depthTest:!0,toneMapped:!1,uniforms:{...p,uPlate:{value:null},uHasPlate:{value:0},uSkyMask:m,uHasSkyMask:h,uSkyGate:{value:new P(...e.skyBlueGate??[.68,.9])},uCrop:u},vertexShader:`varying vec2 vUv;varying vec3 vAuroraIrradiance;
      ${Be}
      void main(){vUv=uv;vAuroraIrradiance=vec3(0.);gl_Position=vec4(position.xy,.9999999,1.);}`,fragmentShader:`precision highp float;uniform sampler2D uPlate;uniform sampler2D uSkyMask;uniform float uHasSkyMask;uniform vec2 uSkyGate;uniform vec4 uCrop;uniform float uHasPlate;varying vec2 vUv;varying vec3 vAuroraIrradiance;
      ${Be}
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
      }`}),T=new v(new b(2,2),w);return T.name=`user-original-aurora`,T.frustumCulled=!1,T.renderOrder=-20,{root:T,lighting:p,get textureVariant(){return n?`comfyui-upper-local`:`original-capability-fallback`},get ready(){return o&&!!_[+!!g]?.image},get time(){return p.uAuroraTime.value},update(e){!i&&a&&(p.uAuroraTime.value=e)},setCamera(e){e.updateMatrixWorld(),p.uAuroraViewToWorld.value.setFromMatrix4(e.matrixWorld),p.uAuroraWorldToView.value.setFromMatrix4(e.matrixWorldInverse);let t=Math.tan(c.degToRad(e.fov)*.5);p.uAuroraProjection.value.set(t*e.aspect,t)},setActive(e){i||(a=e)},setCrop(e,t=!1){u.value.set(e.repeat.x,e.repeat.y,e.offset.x,e.offset.y),w.uniforms.uPlate.value=e,w.uniforms.uHasPlate.value=1,p.uAuroraPortrait.value=+!!t,p.uAuroraNatureBounce.value=!t&&e.userData.highDetail?1:0,g=t,C(t),x()},setIrradiance(e){w.uniforms.uSharedIrradiance=e,w.vertexShader=`uniform sampler2D uSharedIrradiance;
`+w.vertexShader.replace(`vAuroraIrradiance=auroraDiffuseIrradiance(vec3(0.,1.,0.));`,`vAuroraIrradiance=texelFetch(uSharedIrradiance,ivec2(0),0).rgb;`),w.needsUpdate=!0},setIntensity(e){p.uAuroraIntensity.value=c.clamp(e,0,2)},get state(){return a&&o?`flowing`:`still`},dispose(){i||(i=!0,l.abort(),d.dispose(),_.forEach(e=>e.dispose()),T.geometry.dispose(),w.dispose())}}}function Ue(e,t,n,r){let i=new R,a=new R,o=!1,s=!1;e.onBeforeRender=e=>{if(o=!1,e.getRenderTarget()!==null||t.x<=0||t.y<=0||(e.getCurrentViewport(a),a.z<=0||a.w<=0))return;e.getScissor(i),s=e.getScissorTest();let c=e.getPixelRatio(),l=r()?.095:.084,u=r()?.018:.027,d=(n.x-t.z)/t.x,f=(1-n.y-t.w)/t.y,p=n.z*l/t.x,m=n.z*u/t.y,h=Math.max(a.x,Math.floor(a.x+(d-p)*a.z)-2),g=Math.max(a.y,Math.floor(a.y+(f-m)*a.w)-2),_=Math.min(a.x+a.z,Math.ceil(a.x+(d+p)*a.z)+2),v=Math.min(a.y+a.w,Math.ceil(a.y+(f+m)*a.w)+2);s&&(h=Math.max(h,i.x*c),g=Math.max(g,i.y*c),_=Math.min(_,(i.x+i.z)*c),v=Math.min(v,(i.y+i.w)*c)),e.setScissor(h/c,g/c,Math.max(0,_-h)/c,Math.max(0,v-g)/c),e.setScissorTest(!0),o=!0},e.onAfterRender=e=>{o&&=(e.setScissor(i),e.setScissorTest(s),!1)}}function We(e={}){let t=new pe;t.name=`photographed-campfire-flame`;let n=new AbortController,r=!1,i=!0,o=!1,s=!1,l=!1,d=0,f=-1,p=document.createElement(`video`);p.muted=!0,p.loop=!0,p.playsInline=!0,p.preload=`auto`,p.crossOrigin=`anonymous`,p.setAttribute(`playsinline`,``),p.setAttribute(`muted`,``);let m=!1,h;typeof p.requestVideoFrameCallback==`function`&&(h=p.requestVideoFrameCallback(()=>{h=void 0,!r&&(m=!0,e.onReady?.())}));let g=new se(p);g.colorSpace=u,g.minFilter=g.magFilter=de,g.generateMipmaps=!1;let _={value:1.08},x={value:0},S={value:new R(1,1,0,0)},C={value:0},w={value:null},T={value:new V(.6105,.681,.58)},E=`uniform float uCloseCamp;${be}
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
    }`,D=new F({color:16777215,map:g,transparent:!0,depthWrite:!1,side:2,toneMapped:!1,fog:!1,blending:5,blendEquation:100,blendSrc:201,blendDst:201});D.onBeforeCompile=e=>{Object.assign(e.uniforms,ge),e.uniforms.uFlameExposure=_,e.uniforms.uCloseCamp=x,e.uniforms.uPlateCrop=S,e.uniforms.uPortrait=C,e.uniforms.uPitLayout=T,e.vertexShader=`varying vec4 vFlameClip;
`+e.vertexShader,e.vertexShader=e.vertexShader.replace(`#include <project_vertex>`,`#include <project_vertex>
 vFlameClip=gl_Position;`),e.fragmentShader=`uniform float uFlameExposure;varying vec4 vFlameClip;
`+E+`
`+e.fragmentShader,e.fragmentShader=e.fragmentShader.replace(`#include <map_fragment>`,`#include <map_fragment>
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
    `)},D.customProgramCacheKey=()=>`snowy-photographed-flame-distant-pit-v4`;let O=new b(4/3,1),k=new v(O,D);k.name=`real-flame-footage`,k.position.y=.32,k.renderOrder=3,t.add(k);let A=new me(16749624,12,14,1.3);A.position.set(0,.45,.04),t.add(A);let j,M=new B({transparent:!0,depthTest:!1,depthWrite:!1,toneMapped:!1,blending:2,uniforms:{...ge,uCloseCamp:x,uPlate:w,uPlateCrop:S,uPortrait:C,uPitLayout:T,uFlames:{value:g}},vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}`,fragmentShader:`uniform sampler2D uPlate;uniform sampler2D uFlames;varying vec2 vUv;${E}
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
      }`}),N=new v(new b(2,2),M);N.frustumCulled=!1,N.renderOrder=2,t.add(N),Ue(N,S.value,T.value,()=>C.value>.5);let P=new ue,ee=new Float32Array(60),te=new Float32Array(20),ne=413,re=()=>(ne=1664525*ne+1013904223>>>0,ne/4294967296);for(let e=0;e<20;e++)ee[e*3]=(re()-.5)*.4,ee[e*3+1]=re()*1,ee[e*3+2]=(re()-.5)*.4,te[e]=re();P.setAttribute(`position`,new ae(ee,3)),P.setAttribute(`phase`,new ae(te,1));let ie={value:0},I=new B({transparent:!0,depthTest:!1,depthWrite:!1,blending:2,toneMapped:!1,uniforms:{uTime:ie},vertexShader:`uniform float uTime;attribute float phase;varying float vAlpha;
      void main(){
        vec3 p=position;float life=fract(phase+uTime*0.14);
        p.y=0.10+life*1.1;
        p.x+=sin(life*6.0+phase*8.0)*0.10*life;
        p.z+=cos(life*5.0+phase*10.0)*0.10*life;
        vAlpha=(1.0-life)*smoothstep(0.0,0.12,life);
        vec4 v=modelViewMatrix*vec4(p,1.0);
        gl_Position=projectionMatrix*v;
        gl_PointSize=clamp(45.0/-v.z,1.5,3.5);
      }`,fragmentShader:`varying float vAlpha;
      void main(){
        float r=length(gl_PointCoord-vec2(0.5));
        if(r>0.5)discard;
        float spark=pow(1.0-r*2.0,2.0);
        gl_FragColor=vec4(vec3(1.0,0.55,0.12)*2.0,spark*vAlpha);
      }`}),L=new a(P,I);L.name=`rising-sparks`,L.frustumCulled=!1,L.renderOrder=4,t.add(L);let z=e=>{D.map!==e&&(D.map=e,D.needsUpdate=!0)},oe=()=>{if(!r){if(i&&t.userData.videoReady&&!l?(z(g),M.uniforms.uFlames.value=g):j&&t.userData.posterReady?(z(j),M.uniforms.uFlames.value=j):t.userData.videoReady&&(z(g),M.uniforms.uFlames.value=g),!i||!o)s&&(f=d),(!p.paused||s)&&p.pause(),t.userData.playing=!1;else if(t.userData.videoReady&&p.paused&&!s&&!l){s=!0;let e=++d;p.play().then(()=>{s=!1,!r&&(t.userData.playing=i&&o&&!p.paused,i&&o||p.pause())},n=>{s=!1,!r&&(l=n?.name!==`AbortError`||e!==f,t.userData.playing=!1,l&&j&&t.userData.posterReady&&z(j))})}}},ce=!1,le=()=>{r||ce||(ce=!0,p.src=e.source??`/assets/realistic-winter/flames-real-loop.mp4`,p.load())};j=new y().load(e.poster??`/assets/realistic-winter/flames-real-poster.jpg`,n=>{r?n.dispose():(t.userData.posterReady=!0,oe(),e.onReady?.())},void 0,n=>{r||(t.userData.posterError=!0,le(),e.onError?.(n))}),j.colorSpace=u,j.generateMipmaps=!1,j.minFilter=de,p.addEventListener(`loadeddata`,()=>{g.needsUpdate=!0,t.userData.videoReady=!0,oe(),e.onReady?.()},{signal:n.signal}),p.addEventListener(`error`,()=>{t.userData.videoError=!0,e.onError?.(p.error)},{signal:n.signal}),document.addEventListener(`pointerdown`,()=>{l&&(l=!1,oe())},{signal:n.signal,passive:!0}),e.deferVideo||le();let H=new V;return{root:t,mesh:k,light:A,video:p,loadVideo:le,get motionBlocked(){return l},get framePresented(){return m||typeof p.requestVideoFrameCallback!=`function`&&p.readyState>=2&&p.currentTime>0},setComposition(e,t){x.value=+!!e.userData.closeCamp;let n=Se(t,!!e.userData.closeCamp,e.userData.compactPit);T.value.set(n.x,n.y,n.scale),w.value=e,C.value=+!!t,S.value.set(e.repeat.x,e.repeat.y,e.offset.x,e.offset.y)},setMotion(e){i!==e&&(i=e,oe())},setExposure(e){_.value=c.clamp(e,.1,3)},update(e,n,r){o=r,t.updateWorldMatrix(!0,!1),n.getWorldPosition(H),t.worldToLocal(H),k.rotation.y=Math.atan2(H.x,H.z),ie.value=performance.now()*.001,A.intensity=8*(i&&o?1+.055*Math.sin(e*7.1)+.025*Math.sin(e*13.7):1),oe()},pause(){o=!1,oe()},dispose(){h!==void 0&&p.cancelVideoFrameCallback(h),!r&&(r=!0,n.abort(),p.pause(),p.removeAttribute(`src`),p.load(),P.dispose(),I.dispose(),O.dispose(),D.dispose(),N.geometry.dispose(),M.dispose(),g.dispose(),j?.dispose(),t.clear())}}}var Ge=(e,t,n)=>{let r=c.clamp((n-e)/(t-e),0,1);return r*r*(3-2*r)};function Ke(e,t){let n=new V,r=new V,i=new V,a=new w,o=new w,s=new w,l=new V,u=new V,d=new V,f=new w,p=new w,m=new V,h=new V,g=new V,_=new w().setFromAxisAngle(new V(1,0,0),Math.PI/2),v=new w,y=new V(0,1,0),b=new z,x=!1,S=()=>{e.updateWorldMatrix(!0,!1),t.updateWorldMatrix(!0,!1),e.getWorldPosition(n),e.getWorldQuaternion(a),e.getWorldScale(l),t.getWorldPosition(m),t.getWorldQuaternion(s),h.set(0,0,1).applyQuaternion(s).normalize(),o.copy(s).multiply(_).multiply(new w().setFromAxisAngle(y,-Math.PI/2));let u=c.clamp(n.distanceTo(m)*.2,.64,1.8);r.copy(n).add(new V(0,u,0)),g.set(0,.157,0).multiply(l).applyQuaternion(o),i.copy(m).addScaledVector(h,.58).sub(g),b.v0.copy(r),b.v1.copy(r).add(new V(0,.45,0)),b.v2.copy(i).addScaledVector(h,.26).add(new V(0,.9,0)),b.v3.copy(i),x=!0};return{begin:S,apply:t=>{x||S();let i=c.clamp(t,0,1),s=Ge(0,.15,i),_=Ge(.15,.46,i);i<.15?d.lerpVectors(n,r,s):b.getPoint(_,d),f.slerpQuaternions(a,o,Ge(.04,.46,i));let C=Ge(.46,.58,i),w=Ge(.59,.69,i);i>=.46&&(f.copy(o).multiply(v.setFromAxisAngle(y,Math.PI/2*w)),g.set(0,.157,0).multiply(l).applyQuaternion(f),d.copy(m).addScaledVector(h,c.lerp(.58,-.35,C)).sub(g));let T=d.clone();e.parent.updateWorldMatrix(!0,!1),e.position.copy(e.parent.worldToLocal(d)),e.parent.getWorldQuaternion(p).invert(),e.quaternion.copy(p).multiply(f),e.parent.getWorldScale(u),e.scale.copy(l).divide(u),e.visible=!0,e.updateWorldMatrix(!1,!0);let E=g.set(0,.157,0).applyMatrix4(e.matrixWorld);return{lift:s,travel:_,insertion:C,turn:w,lid:Ge(.69,.93,i),card:Ge(.93,1,i),keyTip:E.toArray(),socket:m.toArray(),axisError:1-Math.abs(new V(0,1,0).applyQuaternion(f).dot(h)),keyWorld:T.toArray()}},reset(){x=!1}}}function qe(e){let t=document.createElement(`canvas`);t.width=e?768:1280,t.height=e?432:720;let n=t.getContext(`2d`),r=t.width,i=t.height,a=!1,o=()=>{n.fillStyle=`#0a2030`,n.fillRect(0,0,r,i),n.strokeStyle=`#9acbdf`,n.lineWidth=r*.002,n.strokeRect(r*.035,i*.06,r*.93,i*.88),n.textBaseline=`top`,n.fillStyle=`#a8cada`,n.font=`500 ${r*.026}px "IBM Plex Sans",sans-serif`,n.fillText(`SNOWY STUDIOS`,r*.075,i*.14),n.fillStyle=`#edf8ff`,n.font=`500 ${r*.102}px "IBM Plex Sans",sans-serif`,n.fillText(`LootLabs`,r*.068,i*.36),n.fillStyle=`#a6dff6`,n.fillRect(r*.075,i*.66,r*.11,i*.006),n.font=`500 ${r*.025}px "IBM Plex Sans",sans-serif`,n.fillText(`CONTINUE VIA FLOWAUTH`,r*.075,i*.76),n.fillText(`01 / GATEWAY`,r*.7,i*.76)};o();let s=new N(t);s.colorSpace=u,s.anisotropy=4,document.fonts.load(`500 32px "IBM Plex Sans"`).then(()=>{a||(o(),s.needsUpdate=!0)},()=>{});let l=new ie({color:`#c6a46e`,metalness:.75,roughness:.3}),d=new g({map:s,roughness:.48,metalness:0}),f=new pe;f.name=`free-access-card`;let p=new v(new M(1.9,1.07,.025),[l,l,l,l,d,l]);return p.castShadow=!0,f.add(p),f.visible=!1,{root:f,update(e){f.visible=e>1e-4&&e<.9999,f.position.set(0,c.lerp(.4,2.04,e),.15),f.rotation.x=-.08*e},dispose(){a=!0,p.geometry.dispose(),d.dispose(),l.dispose(),s.dispose(),f.clear()}}}function U(r){let i=r.querySelector(`.ice-scene`),a=r.dataset.geometryTrial,o=i.clientWidth>=900&&i.clientWidth/i.clientHeight>=1.25&&!n.lowPower,s=r.querySelector(`#ice-vault-canvas`),l=r.querySelector(`#ice-vault-action`),d=new AbortController,p=d.signal,_=matchMedia(`(prefers-reduced-motion: reduce)`),S=matchMedia(`(max-width:767px), (pointer:coarse)`),w=navigator.connection,T=!1,D=!1,k=!1,A=1,M=1,N,te=-1/0,ie=-1/0,ae=0,I,L=!1,R=0,z=!1,B=0,oe=!1,le=!1,ue=!1,H=!1,de=``,me,ge=!1,be=!1,Ce=()=>{};new Promise(e=>{Ce=e});let we=0,Te=-1,Ee=NaN,De=NaN,Oe=``,Ae=!1,je=!1,Me=0,Ne=null,Pe=0,Fe=async()=>{let e=new Set,t=t=>{t instanceof O&&t.image&&!t.isRenderTargetTexture&&!(t instanceof se)&&e.add(t)};t(W.background),t(nt),t(tt),q?.startupTextures.forEach(t),W.traverse(e=>{if(e instanceof v)for(let n of Array.isArray(e.material)?e.material:[e.material])Object.values(n).forEach(t),`uniforms`in n&&Object.values(n.uniforms).forEach(e=>t(e.value))});let n=[];for(let t of e){let e=t.image;e?.decode&&n.push(e.decode().catch(()=>{}))}if(await Promise.all(n),!(T||k||!K)){for(let t of e)K.engine.initTexture(t);T||k||(Ae=!0,i.dataset.uploadsReady=`true`,$())}},Le,Re=new Set,Be=()=>{Re.forEach(e=>{e.traverse(e=>{e instanceof v&&(e.geometry.dispose(),(Array.isArray(e.material)?e.material:[e.material]).forEach(e=>e.dispose()))}),e.clear()}),Re.clear(),Le?.dispose(),Le=void 0},Ue={collect:+(r.dataset.phase===`ready`)},Ge=Number(r.dataset.progress)||0,U={phase:r.dataset.phase||`waiting`,progress:Number(r.dataset.progress)||0,remaining:Number(r.dataset.remaining)||30,keyVisible:!1,canAct:!1},W=new m;W.background=new ee(getComputedStyle(r).getPropertyValue(`--melt-floor`).trim()||`#ffffff`);let G=new f(40,1,.1,500),Je=new V(0,3.1,0),Ye=new V(-8.004,.8,12.093);G.position.copy(Je).add(Ye),G.lookAt(Je);let K,q,J,Xe,Ze,Y,Qe,$e,et,X,Z,tt,nt,rt=!1,it=!1,Q,at,ot,st,ct,lt,ut=()=>!(it&&!rt||!Q?.image||!X?.ready||!q?.root.userData.materialReady||o&&!tt?.image||!J?.root.userData.materialReady||!Z?.root.userData.posterReady&&!Z?.root.userData.videoReady),dt=()=>{if(i.dataset.chestLid=String(Y?.lid??0),i.dataset.chestCard=String(Y?.card??0),i.dataset.keyInsertion=String(Y?.insertion??0),i.dataset.keyTurn=String(Y?.turn??0),Y||(delete i.dataset.keyTip,delete i.dataset.keySocket,delete i.dataset.keyAxisError),q&&(i.dataset.keyWorld=q.key.getWorldPosition(new V).toArray().join(`,`)),i.dataset.collectProgress=Ue.collect.toFixed(4),Y&&(i.dataset.chestLid=Y.lid.toFixed(4),i.dataset.chestCard=Y.card.toFixed(4),i.dataset.keyInsertion=Y.insertion.toFixed(4),i.dataset.keyTurn=Y.turn.toFixed(4),i.dataset.keyTip=Y.keyTip.join(`,`),i.dataset.keySocket=Y.socket.join(`,`),i.dataset.keyAxisError=String(Y.axisError)),i.dataset.chestReady=String(!!J),i.dataset.chestMaterialReady=String(J?.root.userData.materialReady??!1),i.dataset.chestMaterialError=String(J?.root.userData.materialError??!1),i.dataset.collecting=String(L),i.dataset.cameraPose=[...G.position.toArray(),...G.quaternion.toArray()].map(e=>e.toFixed(6)).join(`,`),i.dataset.renderCount=String(ae),i.dataset.ambientTime=R.toFixed(3),i.dataset.aurora=X?.state??`still`,i.dataset.auroraLook=`upper-local-v9`,i.dataset.auroraTexture=X?.textureVariant??`loading`,i.dataset.auroraGround=`off`,i.dataset.fire=Z?.root.userData.playing?`burning`:`still`,i.dataset.fireReady=String(Z?.root.userData.videoReady??!1),i.dataset.auroraReady=String(X?.ready??!1),i.dataset.fireVideoTime=String(Z?.video.currentTime??0),i.dataset.fireVideoDuration=String(Z?.video.duration??0),i.dataset.fireResolution=Z?[Z.video.videoWidth,Z.video.videoHeight].join(`x`):``,i.dataset.detailQuality=o?`enhanced`:`baseline`,i.dataset.auroraVideoTime=String(X?.time??0),i.dataset.meltProgress=U.progress.toFixed(3),q){i.dataset.materialStudy=String(q.root.userData.materialStudy),i.dataset.materialReady=String(q.root.userData.materialReady);let e=q.root.userData.meltwater;i.dataset.waterArea=String(e?.area??0),i.dataset.waterVolume=String(e?.visualVolume??0),i.dataset.waterHeight=String(e?.filmHeight??0),i.dataset.waterTint=String(e?.tint??``),i.dataset.waterWetness=String(e?.wetness??0),i.dataset.waterRunoff=String(e?.runoffVisible??!1);let t=q.root.userData.meltVisual;i.dataset.iceTint=String(t?.iceTint??``),i.dataset.keyReveal=String(t?.keyReveal??0),i.dataset.glowAlpha=String(t?.glowAlpha??0),i.dataset.iceScale=String(t?.iceScale??0),i.dataset.iceOpacity=String(t?.iceOpacity??0)}K&&(i.dataset.triangles=String(K.engine.info.render.triangles),i.dataset.drawCalls=String(K.engine.info.render.calls))},ft=(e=`idle`)=>{X?.setActive(!1),Z?.pause(),N?.(),N=void 0,i.dataset.renderState=e,dt()},pt=()=>{T||k||(k=!0,z=!1,L=!1,I?.kill(),ft(`fallback`),s.hidden=!0,r.dataset.effectsPresented=`false`,r.dataset.stageFallback=`true`,r.dataset.meltStage=`fallback`,r.dataset.scenePresented=`false`,cancelAnimationFrame(B),r.dispatchEvent(new CustomEvent(`melt-key-fallback`)))},mt=()=>{if(!q||U.phase!==`available`||k)return;q.root.updateMatrixWorld(!0),G.updateMatrixWorld(!0);let e=new ce().setFromObject(q.key),t=1/0,n=1/0,r=-1/0,i=-1/0;for(let a of[e.min.x,e.max.x])for(let o of[e.min.y,e.max.y])for(let s of[e.min.z,e.max.z]){let e=new V(a,o,s).project(G),c=(e.x*.5+.5)*A,l=(-e.y*.5+.5)*M;t=Math.min(t,c),r=Math.max(r,c),n=Math.min(n,l),i=Math.max(i,l)}let a=Math.max(44,r-t+24),o=Math.max(44,i-n+24);Object.assign(l.style,{left:`${Math.max(0,Math.min(A-a,(t+r-a)/2))}px`,top:`${Math.max(0,Math.min(M-o,(n+i-o)/2))}px`,width:`${Math.min(A,a)}px`,height:`${Math.min(M,o)}px`,borderRadius:`24px`})},ht=new V,gt=-1/0,_t=-1/0,vt=16,yt=96,bt=!0,xt=()=>{if(!Xe||U.phase!==`ready`||Ue.collect>=1&&!L&&!bt)return;bt=!1,Xe.root.getWorldPosition(ht),ht.project(G);let e=i.getBoundingClientRect();i.dataset.cardOrigin=`${(e.left+(ht.x*.5+.5)*A).toFixed(1)},${(e.top+(-ht.y*.5+.5)*M).toFixed(1)}`;let t=Math.min(A<700?280:320,A-32),n=c.clamp((ht.x*.5+.5)*A,Math.min(A-t/2-16,vt+t/2),A-t/2-16),r=c.clamp((-ht.y*.5+.5)*M-18,yt,M-100);(Math.abs(n-gt)>.5||Math.abs(r-_t)>.5)&&(i.style.setProperty(`--loot-x`,`${n.toFixed(1)}px`),i.style.setProperty(`--loot-y`,`${r.toFixed(1)}px`),i.dataset.lootAnchor=`${n.toFixed(1)},${r.toFixed(1)}`,gt=n,_t=r)},St=e=>{z?ft(e):(me?.render(R,D,!_.matches),D||ft(e))},Ct=()=>{if(T||k||!D&&oe||document.hidden||!K)return;if(!q||!le){St(`effects-first`);return}if(!z&&Ne){let e=K.engine.getContext(),t=e.clientWaitSync(Ne,0,0);e.deleteSync(Ne),Ne=null,t===e.WAIT_FAILED?i.dataset.gpuWarmup=`frame-fallback`:(Me++,i.dataset.gpuWarmup=`fence-complete`)}let e=_.matches&&U.phase===`waiting`?Ge:U.progress;G.updateMatrixWorld(),X?.setCamera(G);let t=c.smoothstep(Ue.collect,.46,.72);if((e!==Ee||Ue.collect!==De||U.phase!==Oe||we!==Te)&&(bt=!0,q.update(e,t),J&&Xe&&Ze&&(U.phase===`ready`?(Y=Ze.apply(Ue.collect),J.update(Y.lid),Xe.update(Y.card)):(J.update(0),Xe.update(0),Y=void 0)),Ee=e,De=Ue.collect,Oe=U.phase,Te=we,et&&(et.shadow.needsUpdate=!0)),st?.update(e,t,R),Z?.setMotion(!_.matches),!ut()){St(`loading`);return}if(!Ae){je||(je=!0,Fe().catch(pt)),St(`uploading`);return}let n=String(!!Z?.root.userData.videoReady)+`:`+String(_.matches)+`:`+(U.phase===`ready`?`open`:`ice`);if(!z&&de!==n&&(de=n,Me=0,Ne&&=(K.engine.getContext().deleteSync(Ne),null)),ue=!0,!ue){if(!H){H=!0;let e=n;K.engine.toneMapping=K.toneMapping,K.engine.toneMappingExposure=K.toneMappingExposure,K.engine.outputColorSpace=K.outputColorSpace;let t=K.engine,r=new pe,i=new pe,a=new Set;W.traverse(e=>{if(!(e instanceof v)||e===q.floor||(e===q.ice||e.name===`surface-hoar`)&&!e.visible)return;let t=Array.isArray(e.material)?e.material[0]:e.material;a.has(t)||(a.add(t),i.add(e.clone(!1))),e!==q.ice&&e.name!==`surface-hoar`&&(e.name===`user-original-aurora`||e.name===`snow-terrain`||st&&e.parent===st.root)&&r.add(e.clone(!1))}),(async()=>{let e=Promise.resolve();if(Qe&&q.ice.visible){let n=t.getRenderTarget(),i=t.getActiveCubeFace(),a=t.getActiveMipmapLevel(),o=t.toneMapping;try{t.setRenderTarget(Qe),t.toneMapping=0,e=t.compileAsync(r,G,W)}finally{t.setRenderTarget(n,i,a),t.toneMapping=o}}let n=t.compileAsync(i,G,W);await Promise.all([e,n])})().then(()=>{H=!1,!(T||k)&&(ue=e===String(!!Z?.root.userData.videoReady)+`:`+String(_.matches)+`:`+(U.phase===`ready`?`open`:`ice`),$())}).catch(()=>pt())}St(`compiling`)}else{if(X?.setActive(D&&!_.matches),X?.update(R),Z?.setMotion(!_.matches),Z?.update(R,G,D&&!_.matches),Z){let e=A<700&&J?Math.max(1,J.root.scale.x):1;Z.light.distance=14*e;let t=1+.18*Math.sin(R*6.7)+.12*Math.cos(R*11.3)+.06*Math.sin(R*23.1);Z.light.intensity=(A<700?5:o?9:14)*e*e*t}K.render(W,G),ae++,D?(z&&!_.matches&&Z?.loadVideo(),mt(),xt(),!z&&Q?.image&&X?.ready&&q?.root.userData.materialReady&&(!o||tt?.image)&&J?.root.userData.materialReady&&(Z?.root.userData.posterReady||Z?.root.userData.videoReady)&&(z=!0,r.dataset.scenePresented=`true`,r.dataset.meltStage=`ready`,r.dispatchEvent(new CustomEvent(`melt-key-ready`)),_.matches||Z?.loadVideo())):(oe=!0,i.dataset.prewarmed=`true`,X?.setActive(!1),Z?.pause(),i.dataset.renderState=`prewarmed`,dt())}},wt=e=>{if(T||k||!D||document.hidden){ft(`paused`);return}let t=n.getFrameInterval();e-te+1e-5<t||((z||be)&&!_.matches&&Number.isFinite(te)&&(R+=Math.min(e-te,.1)),te=e,Ct(),e-ie>.25&&(dt(),ie=e),_.matches&&!L&&z&&ft())},Tt=()=>{T||k||!D||document.hidden||N||!me?.ready&&!ut()||(i.dataset.renderState=`active`,te=-1/0,N=e(wt))},$=()=>{T||k||Pe||(Pe=requestAnimationFrame(()=>{Pe=0,!(T||k)&&(Ct(),Tt())}))},Et=e=>{let t=o&&!e?`/assets/quality-v3/snow-restored.webp`:`/assets/realistic-winter/winter-camp-${e?`portrait-v5`:`landscape-v3`}.webp`,n=new O;if(typeof createImageBitmap<`u`)new fe().setOptions({imageOrientation:`flipY`,premultiplyAlpha:`none`,colorSpaceConversion:`default`}).load(t,e=>{T?e.close():(n.image=e,n.needsUpdate=!0,i.dataset.background=`photographic-winter`,Dt())},void 0,pt),n.flipY=!1;else{let e=new y().load(t,()=>{T?e.dispose():(n.image=e.image,n.needsUpdate=!0,i.dataset.background=`photographic-winter`,Dt())},void 0,pt)}return n.colorSpace=u,n},Dt=()=>{if(T||k||!K)return;z||(Me=0,Ne&&=(K.engine.getContext().deleteSync(Ne),null)),we++,cancelAnimationFrame(B),B=0;let e=i.getBoundingClientRect();A=Math.max(1,e.width),M=Math.max(1,e.height);let t=r.querySelector(`.ice-copy`)?.getBoundingClientRect();vt=t&&A>=900?Math.max(16,t.right-e.left+16):16,yt=t&&A>=700&&A<900?Math.min(M-100,t.bottom-e.top+100):96;let a=n.getDPR();K.setPixelRatio(a),K.setSize(A,M),K.engine.transmissionResolutionScale=n.lowPower?.5:1,i.dataset.transmissionScale=String(K.engine.transmissionResolutionScale),i.dataset.qualityDpr=String(a),i.dataset.qualityTier=n.lowPower?`mobile`:`desktop`;let s=A/M<1.25,c=A<900||s||matchMedia(`(pointer:coarse) and (max-width:1366px)`).matches,l=c&&!s&&A>=900,d=A<700;q?.setNaturalClarity(d),it=c,d?rt=!0:it&&!nt&&(nt=new y().load(`/assets/quality-v3/snow-restored.webp`,e=>{T?e.dispose():(rt=!0,_e(e,it,A<700),i.dataset.phoneSnow=it?`laptop-plate`:`inactive`,$())},void 0,()=>{T||(rt=!0,i.dataset.phoneSnow=`unavailable`,$())}),nt.colorSpace=u),_e(nt,it,d),i.dataset.phoneSnow=it&&nt?.image?`laptop-plate`:`inactive`,X&&(X.lighting.uAuroraGroundStrength.value=0),i.dataset.auroraGround=`off`,i.dataset.campFraming=c?`close`:`laptop`,s&&!ot&&(ot=Et(!0)),!s&&!at&&(at=Et(!1));let f=s?ot:at;if(f&&f!==Q&&(Q=f,W.background=Q,st?.setBackground(Q)),Q?.image){let e=Q.image,t=e.width/e.height,n=A/M,r=A>=900&&!s,i=s?0:r?.12:.05;if(Q.repeat.set(Math.min(1,n/t)*(1-i),Math.min(1,t/n)*(1-i)),Q.offset.set((1-Q.repeat.x)/2-i/2,(1-Q.repeat.y)/2),Q.userData.closeCamp=r,Q.userData.highDetail=o&&!s,Q.userData.integratedPhone=d,c){let e=d||s?.51:.7,t=d?.88:s?.82:l?.86:.79,n=e*Q.repeat.x+Q.offset.x,r=1-((1-t)*Q.repeat.y+Q.offset.y),i=d?2.4:l?1.65:2;Q.userData.compactPit={x:n,y:r,zoom:i},ve(n,r,i,s)}else delete Q.userData.compactPit,ve();Q.updateMatrix(),X?.setCrop(Q,s),Z?.setComposition(Q,s)}!z||Q?.image&&X?.ready||(Me=0,Ne&&=(K.engine.getContext().deleteSync(Ne),null),Ae=!1,je=!1,z=!1,r.dataset.scenePresented=`false`,r.dataset.meltStage=`loading`,document.dispatchEvent(new CustomEvent(`melt-key-poster-state`,{detail:U.phase}))),G.aspect=A/M;let p=Math.max(1,1.5/G.aspect),m=Je.clone();!s&&A>=900?m.addScaledVector(new V(.834,0,.552),-2.6):!s&&A>=700&&m.addScaledVector(new V(.834,0,.552),-.8);let g=Ye.clone();if(s&&(m.y=4.2,g.y=-.8),G.position.copy(m).addScaledVector(g,p),G.lookAt(m),G.updateProjectionMatrix(),G.updateMatrixWorld(),q&&J&&ct&&(q.root.position.copy(ct.icePosition),q.root.scale.setScalar(ct.iceScale),J.root.position.copy(ct.chestPosition),J.root.scale.setScalar(ct.chestScale),J.root.rotation.y=-.18,q.root.rotation.y=d?.1:-.24,c)){let e=(e,t,n,r,i,a)=>{let o=new C;o.setFromCamera(new P(t*2-1,1-n*2),G);let s=o.ray.intersectPlane(new h(new V(0,1,0),.01),new V);if(s){e.position.copy(s),e.scale.setScalar(1);for(let t=0;t<2;t++){e.updateMatrixWorld(!0);let t=1/0,n=-1/0;for(let r of[-i,i])for(let i of[-a,a]){let a=new V(r,0,i).applyMatrix4(e.matrixWorld).project(G);t=Math.min(t,a.x),n=Math.max(n,a.x)}e.scale.multiplyScalar(r*2/Math.max(.001,n-t))}}};e(J.root,d?.185:s?.2:.5,d?.83:s?.81:l?.78:.8,d?.35:s?.26:l?.19:.27,1.65,.95),e(q.root,d?.83:s?.82:l?.88:.86,d?.83:s?.81:l?.78:.8,d?.28:s?.22:l?.15:.22,1,1)}if(q&&J&&ct){let e=(e,t,n,r,a)=>{let o=i.querySelector(e);if(!o)return;t.updateWorldMatrix(!0,!1);let s=1/0,c=-1/0,l=1/0,u=-1/0;for(let e of[-n,n])for(let n of[0,a])for(let i of[-r,r]){let r=new V(e,n,i).applyMatrix4(t.matrixWorld).project(G),a=(r.x*.5+.5)*A,o=(-r.y*.5+.5)*M;s=Math.min(s,a),c=Math.max(c,a),l=Math.min(l,o),u=Math.max(u,o)}Object.assign(o.style,{left:`${s}px`,top:`${l}px`,width:`${c-s}px`,height:`${u-l}px`,transform:`none`})};e(`.winter-skeleton-chest`,J.root,1.65,.95,1.25),e(`.winter-skeleton-ice`,q.root,1,1,2)}if(Z&&Q?.image){if(s){let e=d?.878:.818,t=new C;t.setFromCamera(new P(1.016-1,1-e*2),G);let n=t.ray.intersectPlane(new h(new V(0,1,0),-.025),new V);if(n){Z.root.position.copy(n),Z.mesh.position.y=.2;let e=n.clone().project(G),t=n.clone().add(new V(0,1,0)).project(G),r=(d?.138:.145)*2/Math.abs(t.y-e.y);Z.root.scale.setScalar(r),Z.setExposure(1.4)}}else{Z.mesh.position.y=.32;let e=Se(!1,A>=900&&!s,Q.userData.compactPit),t=(1-(e.y+(e.originalBaseY-e.canonicalY)*e.scale)-Q.offset.y)/Q.repeat.y*2-1,n=(e.x-Q.offset.x)/Q.repeat.x*2-1,r=new C;r.setFromCamera(new P(n,t),G);let i=r.ray.intersectPlane(new h(new V(0,1,0),-.025),new V);if(i){Z.root.position.copy(i);let t=i.clone().project(G),n=i.clone().add(new V(0,1,0)).project(G),r=e.originalHeight*e.scale/Q.repeat.y*2/Math.abs(n.y-t.y);Z.root.scale.setScalar(r*1.12),Z.setExposure(1.3)}}}if(et&&J&&q){let e=d?Math.max(1,J.root.scale.x,q.root.scale.x):1,t=d?J.root.position.clone().add(q.root.position).multiplyScalar(.5):new V;et.target.position.copy(t),et.target.updateMatrixWorld(),et.position.copy(t).add(new V(-8,12,4).multiplyScalar(e));let n=et.shadow.camera,r=d?Math.max(3.5,J.root.position.distanceTo(q.root.position)*.5+2):15;Object.assign(n,{left:-r,right:r,top:d?r:11,bottom:d?-r:-11,near:.1,far:45*e}),n.updateProjectionMatrix(),et.shadow.normalBias=.008*e,et.shadow.needsUpdate=!0}$();let _=e=>{if(!e)return null;let t=e.getWorldPosition(new V).project(G);return[+(t.x*.5+.5).toFixed(5),+(-t.y*.5+.5).toFixed(5)]};i.dataset.layoutAnchors=JSON.stringify({ice:_(q?.root),fire:_(Z?.root),chest:_(J?.root)})};r.addEventListener(`melt-key-state`,e=>{let n=e.detail;if(!n||T)return;let i=U.phase,a=U.progress;U=n,_.matches&&n.phase===`waiting`&&(i!==`waiting`||n.progress<a)&&(Ge=n.progress),n.phase===`ready`&&i!==`ready`?(I?.kill(),q?.update(1,0),Ze?.begin(),L=!_.matches&&z,r.dataset.unlocking=String(L),L?I=t.to(Ue,{collect:1,duration:4.4,ease:`none`,onUpdate:Tt,onComplete:()=>{L=!1,I=void 0,r.dataset.unlocking=`false`,$(),dt(),r.dispatchEvent(new CustomEvent(`melt-key-reveal-complete`))}}):(Ue.collect=1,r.dispatchEvent(new CustomEvent(`melt-key-reveal-complete`)))):n.phase!==`ready`&&i===`ready`&&(cancelAnimationFrame(B),B=0,z=!1,ue=!1,Me=0,de=``,Ne&&K&&K.engine.getContext().deleteSync(Ne),Ne=null,r.dataset.scenePresented=`false`,r.dataset.meltStage=`loading`,document.dispatchEvent(new CustomEvent(`melt-key-poster-state`,{detail:n.phase})),L=!1,I?.kill(),I=void 0,Ue.collect=0,Ze?.reset(),r.dataset.unlocking=`false`,Y=void 0),i===n.phase?n.phase===`waiting`&&!_.matches&&Tt():$()},{signal:p}),s.addEventListener(`webglcontextlost`,e=>{e.preventDefault(),pt()},{signal:p}),document.addEventListener(`visibilitychange`,()=>{document.hidden?(I?.pause(),ft(`paused`)):(D&&I?.resume(),$())},{signal:p}),window.addEventListener(`pageshow`,$,{signal:p}),window.addEventListener(`resize`,Dt,{passive:!0,signal:p}),S.addEventListener(`change`,Dt,{signal:p}),w?.addEventListener(`change`,Dt,{signal:p}),_.addEventListener(`change`,()=>{_.matches&&(Ge=U.progress,L=!1,I?.kill(),I=void 0,U.phase===`ready`&&(Ue.collect=1,r.dataset.unlocking=`false`,r.dispatchEvent(new CustomEvent(`melt-key-reveal-complete`)))),$()},{signal:p});let Ot=new ResizeObserver(Dt);Ot.observe(i);let kt=new IntersectionObserver(([e])=>{D=e.isIntersecting&&e.intersectionRatio>=.2,D?(document.hidden||I?.resume(),$()):(I?.pause(),ft(`paused`))},{threshold:.2});return kt.observe(i),(async()=>{try{tt=new y().load(`/assets/quality-v3/camp-detail.webp`,e=>{T?e.dispose():(e.colorSpace=u,ye(e),$())}),tt.colorSpace=u,tt.anisotropy=8,K=new he(s,{antialias:!0}),K.toneMapping=4,K.toneMappingExposure=.95,W.background=new ee(463649);let e=i.clientWidth/i.clientHeight<1.25;e?ot=Et(!0):at=Et(!1),Q=e?ot:at,W.background=Q,X=He({lowPower:n.lowPower,maxTextureSize:K.engine.capabilities.maxTextureSize,onReady:$,onError:pt,intensity:.62}),W.add(X.root),X.lighting.uAuroraGroundStrength.value=0,Z=We({deferVideo:!0,poster:`/assets/quality-v1/fire-hd-poster.webp`,onReady:()=>{oe=!1,$()},onError:()=>{Z?.root.userData.posterError&&Z?.root.userData.videoError&&pt()}}),W.add(Z.root),lt={enabled:K.engine.shadowMap.enabled,type:K.engine.shadowMap.type},K.engine.shadowMap.enabled=!0,K.engine.shadowMap.type=1;let t=new j(7904196,1977664,.35);W.add(t);let o=new ne(10927584,.55);o.position.set(-8,12,4),o.castShadow=!0,et=o,W.add(o.target),o.shadow.autoUpdate=!1,o.shadow.needsUpdate=!0,o.shadow.mapSize.set(n.lowPower?512:1024,n.lowPower?512:1024),Object.assign(o.shadow.camera,{left:-15,right:15,top:11,bottom:-11,near:.1,far:45}),o.shadow.radius=n.lowPower?2.25:4.5,o.shadow.bias=-15e-5,o.shadow.normalBias=.008,W.add(o);let l=new ne(7903422,.26);l.position.set(4,2.8,1.5),W.add(l);let d=new ne(7445451,.32);if(d.position.set(1,4,-3),W.add(d),Dt(),$(),X.lighting.uAuroraGroundStrength.value=0,i.dataset.auroraDiffuse=`off`,ge=!0,me=xe({surface:K,scene:W,camera:G,sky:X,fire:Z,background:()=>Q,ready:()=>ge&&(!it||rt),hidden:()=>[q?.root,J?.root,st?.root],irradiance:()=>{},onReady:$,onError:pt,onFirst:e=>{be=!0,r.dataset.effectsPresented=`true`,i.dataset.effectsFirstFrameAt=String(performance.now()),i.dataset.effectsGpuWarmup=e,Ce(),$()}}),$(),await new Promise(e=>requestAnimationFrame(()=>requestAnimationFrame(()=>e()))),T||k||(await ke(32),T||k))return;q=Ie(32,3,$,pt,{highDetail:!1,naturalClarity:i.clientWidth<700,compactGeometry:!0}),W.add(q.root);let f=new V(.834,0,.552),p=new V(-.552,0,.834),h=i.clientWidth>=900&&i.clientWidth/i.clientHeight>=1.25;q.root.position.copy(f).multiplyScalar(h?-2.6+.58*Math.tan(c.degToRad(20))*(14.5*Math.max(1,1.5/(i.clientWidth/i.clientHeight))-1.2)*(i.clientWidth/i.clientHeight):4.9).addScaledVector(p,h?1.2:-5.2),q.root.scale.setScalar(h?.7:1.2),q.root.rotation.y=-.24,q.root.position.y=-.01;let _=q.floor.material.onBeforeCompile;if(q.floor.material.onBeforeCompile=(e,t)=>{_(e,t),e.fragmentShader=e.fragmentShader.replace(`return .94*(1.-.12*pow`,`return .7332*(1.-.12*pow`).replace(`vec2 iceCenter(){return vec2(0.);}`,`vec2 iceCenter(){return vec2(${q.root.position.x.toFixed(6)},${q.root.position.z.toFixed(6)});}`).replace(`.44+.56*contact`,`.44+.56*max(contact,1.-smoothstep(1.4,2.2,length(vShadowFloor-vec2(${J.root.position.x.toFixed(6)},${J.root.position.z.toFixed(6)}))))`)},q.floor.visible=!1,q.floor.material.customProgramCacheKey=()=>`snowy-chest-layout-contact-v2`,J=ze({highDetail:!1,lowPower:!0,compactGeometry:!1,onReady:$,onError:pt}),J.root.position.copy(f).multiplyScalar(h?-3.45:-1.8).addScaledVector(p,h?.8:-5.2),J.root.position.y=-.01,J.root.rotation.y=-.18,J.root.scale.setScalar(h?.9:1.08),W.add(J.root),a){let e=0,t=0;for(let n of[J.root,q.key])n.traverse(n=>{if(!(n instanceof v))return;let r=n.geometry.getAttribute(`position`).count;t+=r,e+=(n.geometry.index?.count??r)/3*(n instanceof x?n.count:1)});r.dataset.trialPropTriangles=String(e),r.dataset.trialPropVertices=String(t)}if(T||k)return;ct={icePosition:q.root.position.clone(),iceScale:q.root.scale.x,chestPosition:J.root.position.clone(),chestScale:J.root.scale.x},st=Ve(Q,J.root,q.root,Z.root,X.lighting,void 0),W.add(st.root),Xe=qe(n.lowPower),J.root.add(Xe.root),Ze=Ke(q.key,J.keySocket),U.phase===`ready`&&(q.update(1,0),Ze.begin());let S=Le=new re(K.engine),C=new m;Re.add(C),C.background=new ee(.035,.065,.1);for(let[e,t,n,r,i]of[[-4,4,5.5,3,1.1],[4,5,-3,2.8,.6],[-4,2.8,-5,2.4,.8]]){let a=new v(new E(r,24,16),new F({color:new ee(1,.98,.95).multiplyScalar(i),toneMapped:!1}));a.position.set(e,t,n),C.add(a)}let w=new v(new b(3.5,4.5),new F({color:new ee(1,.97,.88).multiplyScalar(.75),side:2,toneMapped:!1}));w.position.set(3.8,2.8,5.5),w.lookAt(0,1,0),C.add(w);let D=new v(new b(5,3),new F({color:new ee(1,.87,.68).multiplyScalar(.9),side:2,toneMapped:!1}));if(D.position.set(-4,-1.8,6),D.lookAt(0,.7,0),C.add(D),T||k)return;Qe=$e=S.fromScene(C,.055),W.environment=Qe.texture,J.root.traverse(e=>{if(e instanceof v)for(let t of Array.isArray(e.material)?e.material:[e.material])t instanceof g&&(t.envMap=Qe.texture,t.envMapIntensity=t.metalness>.5?.75:.45)}),Be(),le=!0,i.dataset.composition=`chest-left-fire-front-ice-right-v2`,i.dataset.chest=`walnut`,i.dataset.camera=`perspective-fixed`,i.dataset.viewAngle=`0`,i.dataset.renderer=`three-webgl`,Dt(),$()}catch(e){pt(),console.warn(`Melt key visual unavailable; native controls remain usable.`,e)}finally{Be()}})(),()=>{T||(T=!0,Be(),cancelAnimationFrame(B),cancelAnimationFrame(0),cancelAnimationFrame(Pe),Ne&&K&&K.engine.getContext().deleteSync(Ne),Ne=null,L=!1,I?.kill(),ft(),d.abort(),Ot.disconnect(),kt.disconnect(),me?.dispose(),_e(),nt?.dispose(),ve(),ye(),tt?.dispose(),st?.dispose(),X?.dispose(),Z?.dispose(),at?.dispose(),ot?.dispose(),Xe?.dispose(),J?.dispose(),q?.dispose(),W.traverse(e=>{e instanceof ne&&e.shadow.dispose()}),W.environment=null,Qe?.dispose(),$e?.dispose(),K&&lt&&(K.engine.shadowMap.enabled=lt.enabled,K.engine.shadowMap.type=lt.type),K?.dispose(),W.clear())}}export{U as initMeltKeyStage};