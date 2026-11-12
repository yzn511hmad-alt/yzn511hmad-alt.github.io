import{n as e,t}from"./SnowyFooter-Dy0mc3AW.js";import{i as n}from"./vendor-gsap-bXzFIbWr.js";import{n as r,t as i}from"./Scroll-LFdG9vbQ.js";/* empty css                         */import{$ as a,A as o,B as s,C as c,D as l,E as u,F as d,G as f,H as p,I as m,J as h,K as g,L as _,M as ee,N as v,O as y,Q as b,R as x,S,T as C,U as w,V as T,W as E,X as te,Y as D,Z as ne,_ as O,a as k,b as re,c as A,d as j,et as M,f as N,g as ie,h as P,i as ae,j as F,k as oe,l as I,m as L,n as R,nt as z,p as se,q as B,r as V,rt as ce,s as le,t as ue,tt as H,u as de,v as fe,w as pe,x as me,y as he,z as ge}from"./vendor-three-D_NgQBH7.js";import{t as _e}from"./SharedRenderer-BzNDmtRk.js";var ve=3e4,ye=864e5;function be(){let e=crypto.getRandomValues(new Uint8Array(8)),t=Array.from(e,e=>`ABCDEFGHJKLMNPQRSTUVWXYZ23456789`[e%32]).join(``);return`SNOWY-FREE-${t.slice(0,4)}-${t.slice(4)}-${new Date().getFullYear()}`}var xe={uCampDetail:{value:null},uHasCampDetail:{value:0},uCompactCamp:{value:new z},uPhoneSnow:{value:null},uHasPhoneSnow:{value:0},uPhoneSnowLayout:{value:0}};function Se(e,t=!1,n=t){xe.uPhoneSnow.value=e??null,xe.uHasPhoneSnow.value=e?.image&&t?1:0,xe.uPhoneSnowLayout.value=e?.image&&t&&n?1:0}function Ce(e=0,t=0,n=0,r=!1){xe.uCompactCamp.value.set(e,t,n,+!!r)}function we(e){xe.uCampDetail.value=e??null,xe.uHasCampDetail.value=+!!e}var Te=`uniform sampler2D uCampDetail;uniform float uHasCampDetail;uniform vec4 uCompactCamp;uniform sampler2D uPhoneSnow;uniform float uHasPhoneSnow;uniform float uPhoneSnowLayout;
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
}`;function Ee(e){let{surface:t,scene:n,camera:r,sky:i,fire:a}=e,o={value:new z},s={value:null},c={value:0},l=new B({transparent:!0,depthTest:!1,depthWrite:!1,toneMapped:!1,uniforms:{...xe,uPlate:s,uCrop:o,uClose:c},vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}`,fragmentShader:`${Te}\nuniform sampler2D uPlate;uniform vec4 uCrop;uniform float uClose;varying vec2 vUv;
 void main(){vec2 uv=vUv*uCrop.xy+uCrop.zw;float coverage=1.-smoothstep(.355,.405,uv.y);
 if(coverage<.001)discard;gl_FragColor=vec4(campPlateColor(uPlate,uv,uClose),coverage);
 #include <colorspace_fragment>
 }`}),u=new y(new x(2,2),l);u.name=`early-camp-ground`,u.frustumCulled=!1,u.renderOrder=-19,u.visible=!1,n.add(u);let d=!1,f=!1,p=``,m=!1,h=!1,g=!0,_=null,ee=()=>String(a.mesh.material.map?.uuid)+`:`+String(g),v=async()=>{let o=ee(),s=new Set,c=e=>{e instanceof ne&&e.image&&!e.isRenderTargetTexture&&!(e instanceof ce)&&s.add(e)};c(e.background()),Object.values(xe).forEach(e=>c(e.value)),Object.values(i.root.material.uniforms).forEach(e=>c(e.value)),c(a.mesh.material.map);let l=[];for(let e of s){let t=e.image;t?.decode&&l.push(t.decode().catch(()=>{}))}if(await Promise.all(l),d)return;for(let e of s)t.engine.initTexture(e);let m=new he;m.add(i.root.clone(!1),u.clone(!1)),a.root.traverse(e=>{e instanceof y&&m.add(e.clone(!1))}),t.engine.toneMapping=t.toneMapping,t.engine.toneMappingExposure=t.toneMappingExposure,t.engine.outputColorSpace=t.outputColorSpace,await t.engine.compileAsync(m,r,n),!d&&(p=o,f=!1,e.onReady())};return{ground:u,get ready(){return p===ee()&&!!p},get started(){return m},render(l,y,b){if(g=b,a.setMotion(b),d||!e.ready()||!i.ready||!e.background()?.image||!(a.root.userData.posterReady||a.root.userData.videoReady))return!1;let x=t.engine.getContext();if(_){let t=x.clientWaitSync(_,0,0);if(t===x.TIMEOUT_EXPIRED)return!0;x.deleteSync(_),_=null,h||(h=!0,e.onFirst(t===x.WAIT_FAILED?`frame-fallback`:`fence-complete`))}if(p!==ee())return f||(f=!0,v().catch(()=>{d||e.onError()})),!1;let S=e.background();s.value=S,o.value.set(S.repeat.x,S.repeat.y,S.offset.x,S.offset.y),c.value=+!!S.userData.closeCamp,i.setCamera(r),i.setActive(y&&b),i.update(l),a.setMotion(b),a.update(l,r,y&&b),e.irradiance();let C=e.hidden().filter(e=>!!e),w=C.map(e=>e.visible),T=[];n.traverse(e=>{e instanceof P&&(T.push([e.shadow,e.shadow.needsUpdate]),e.shadow.needsUpdate=!1)});try{C.forEach(e=>e.visible=!1),u.visible=!0,t.render(n,r),m=!0}finally{u.visible=!1,C.forEach((e,t)=>e.visible=w[t]),T.forEach(([e,t])=>e.needsUpdate=t)}return h||(h=!0,e.onFirst(`immediate`)),!0},dispose(){d=!0,cancelAnimationFrame(0),_&&t.engine.getContext().deleteSync(_),n.remove(u),u.geometry.dispose(),l.dispose()}}}function De(e,t=!1,n){if(n){let t=De(e);return{...t,x:n.x,y:n.y,scale:t.scale*n.zoom}}return t?{x:.577,y:.737,scale:.87,canonicalY:.75,originalBaseY:.798,originalHeight:.18}:e?{x:.563,y:.646,scale:.64,canonicalY:.664,originalBaseY:.69,originalHeight:.095}:{x:.6105,y:.681,scale:.58,canonicalY:.75,originalBaseY:.798,originalHeight:.18}}function Oe(e,t,n,r,i,o=!1){let s=o?i?32:48:i?40:64,l=(t,n,r,i=0,a=0,o=0)=>{let s=new y(n,r);return s.name=t,s.position.set(i,a,o),e.add(s),s},u=[[.255,-.03],[.25,0],[.255,.03],[.273,.052],[.315,.062],[.355,.057],[.385,.035],[.392,0],[.385,-.035],[.355,-.057],[.315,-.062],[.273,-.052],[.255,-.03]].reverse().map(([e,t])=>new M(e,t)),d=new c(u,s);d.rotateX(Math.PI/2);let f=l(`key-ring`,d,r,0,1.89,0);for(let e of[-1,1])l(`ring-outer-bead`,new a(.385,.006,6,s),n,0,1.89,e*.037),l(`ring-inner-bead`,new a(.255,.005,6,s),n,0,1.89,e*.03);let p=l(`key-shaft`,new L(.056,.062,1.37,s,1),t,0,.842,0);l(`shaft-foot`,new te(.062,s,10),n,0,.157,0);let m=[[0,1.405],[.056,1.405],[.058,1.425],[.091,1.432],[.104,1.447],[.106,1.464],[.09,1.48],[.073,1.488],[.076,1.504],[.112,1.516],[.116,1.535],[.098,1.552],[.074,1.563],[.07,1.584],[.076,1.606],[0,1.606]].map(([e,t])=>new M(e,t)),h=l(`key-turned-neck`,new c(m,s),t);for(let e of[1.45,1.532]){let t=new a(e===1.45?.1:.11,.009,6,s);t.rotateX(Math.PI/2),l(`neck-polished-bead`,t,n,0,e,0)}let g=new D;return g.moveTo(.024,.2),g.lineTo(.255,.2),g.lineTo(.255,.305),g.lineTo(.132,.305),g.lineTo(.132,.393),g.lineTo(.255,.393),g.lineTo(.255,.495),g.lineTo(.024,.495),g.closePath(),{ring:f,shaft:p,bit:l(`key-bit`,new O(g,{depth:.086,bevelEnabled:!0,bevelThickness:.009,bevelSize:.009,bevelSegments:3,steps:1}),t,0,0,-.043),collar:h}}var ke=new Map,Ae=`snowy_ice_cache_v1`,U=`geometries`;function je(){return typeof indexedDB>`u`?Promise.resolve(null):new Promise(e=>{try{let t=indexedDB.open(Ae,1);t.onupgradeneeded=()=>{try{t.result.createObjectStore(U)}catch{}},t.onsuccess=()=>e(t.result),t.onerror=()=>e(null)}catch{e(null)}})}function Me(e,t,n){let r=new de;return r.setAttribute(`position`,new I(new Float32Array(e),3)),r.setAttribute(`normal`,new I(new Float32Array(t),3)),r.setIndex(new I(n.length<=65535?new Uint16Array(n):new Uint32Array(n),1)),r.name=`natural-hewn-ice-watertight`,r.computeBoundingBox(),r.computeBoundingSphere(),r}async function Ne(e=40){let t=Number.isFinite(e)?Math.max(8,Math.min(80,Math.round(e))):40;if(ke.has(t))return;let n=await je();if(n)try{let e=await new Promise(e=>{let r=n.transaction(U,`readonly`).objectStore(U).get(`ice_${t}`);r.onsuccess=()=>e(r.result??null),r.onerror=()=>e(null)});if(e&&e.pos&&e.norm&&e.idx){let n=Me(e.pos,e.norm,e.idx);ke.set(t,n);return}}catch{}let r=Pe(t);if(ke.set(t,r),n)try{let e=r.getAttribute(`position`).array,i=r.getAttribute(`normal`).array,a=r.getIndex().array;n.transaction(U,`readwrite`).objectStore(U).put({pos:e,norm:i,idx:a},`ice_${t}`)}catch{}}function Pe(e){let t=new A(2,2,2,e,e,e),n=t.getAttribute(`position`),r=new H,i=new H,a=new H,o=[{normal:new H(.64,.62,.45).normalize(),limit:1.37},{normal:new H(-.74,.49,-.46).normalize(),limit:1.39},{normal:new H(.09,1,-.045).normalize(),limit:.955}],s=e=>Math.abs(e)<=.75?e/.75*.85:Math.sign(e)*(.85+(Math.abs(e)-.75)/.25*.15);for(let e=0;e<n.count;e++){r.set(s(n.getX(e)),s(n.getY(e)),s(n.getZ(e))),i.copy(r).clampScalar(-.85,.85),a.copy(r).sub(i).normalize(),r.copy(i).addScaledVector(a,.15);let t=(r.y+1)*.5;r.x*=1-.036*t,r.z*=1-.024*t;let c=.006*Math.sin(r.x*9+r.y*4)*Math.sin(r.z*7-r.y*3)+.004*Math.sin(r.x*19+r.z*13);r.addScaledVector(a,c*u.smoothstep(t,.04,.2));for(let e of o){let t=r.dot(e.normal)-e.limit;t>0&&r.addScaledVector(e.normal,-t)}n.setXYZ(e,r.x,r.y,r.z)}t.deleteAttribute(`uv`),t.deleteAttribute(`normal`);let c=V(t,1e-5);return t.dispose(),c.computeVertexNormals(),c.name=`natural-hewn-ice-watertight`,c.computeBoundingBox(),c.computeBoundingSphere(),c}function Fe(e=40){let t=Number.isFinite(e)?Math.max(8,Math.min(80,Math.round(e))):40,n=ke.get(t);if(n)return n.clone();let r=Pe(t);return ke.set(t,r.clone()),r}var Ie=(e,t,n)=>{let r=u.clamp((n-e)/(t-e),0,1);return r*r*(3-2*r)};function Le(e){let t=u.clamp(e,0,1),n=t**1.55,r=u.lerp(1-.12*n,.985,Ie(.66,1,t));return{x:r,y:1-n,z:r,cx:0,cz:0}}var Re=`
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
}`;function ze(e){let t=new T().setFromEuler(new ie(-Math.PI/2,0,-.08)),n=new H,r=1/0;e.traverse(e=>{if(!(e instanceof y))return;e.updateMatrix();let i=e.geometry.getAttribute(`position`);for(let a=0;a<i.count;a++)n.fromBufferAttribute(i,a).applyMatrix4(e.matrix).multiplyScalar(.7).applyQuaternion(t),r=Math.min(r,n.y)});let i=.029-r+.002;return{pose:e=>{let t=u.clamp(e,0,1),n=Ie(.64,1,t);return{angle:Math.PI/2*n,y:.14-.045*n+(i-.095)*Ie(.78,1,t),z:.08+.68*n}},endY:i}}function Be(e=40,t=3,n,r,i={}){let a=i.highDetail??e>32,s=a||!!i.naturalClarity,c=new he;c.name=`melt-key-model`;let l=u.clamp(Math.round(t),1,4),d=!1;c.userData.highDetail=a,c.userData.materialStudy=l,c.userData.materialReady=!1;let f=new b().load(`/assets/ice-studies/study-${l}${e<=32?`-mobile`:``}.webp`,e=>{d?e.dispose():(c.userData.materialReady=!0,n?.())},void 0,()=>{d||r?.()});f.colorSpace=``,f.minFilter=C,f.magFilter=pe,f.anisotropy=a?8:4;let m=[.6,.65,.59,.62][l-1],g={value:+!!s},_={value:m*(s?.8:1)},v=new he;v.name=`key`;let w={uMelt:{value:0},uOpacity:{value:1},uWet:{value:0},uVolumeRoughness:{value:.13},uKeyReveal:{value:0}},T=new F({color:14936813,metalness:0,roughness:.12,transmission:.98,thickness:1,ior:1.31,attenuationColor:11452359,attenuationDistance:s?4.6:3.8,clearcoat:0,clearcoatRoughness:.36,envMapIntensity:.32,transparent:!0,depthWrite:!1}),E=1967,te=()=>(E=E*1664525+1013904223>>>0,E/4294967296),D=Array.from({length:20},()=>{let e=te()*Math.PI*2,t=Math.sqrt(te())*.49;return new z(Math.cos(e)*t+.04,-.58+te()*1.1,Math.sin(e)*t*.75,.012+te()*.016)});T.onBeforeCompile=e=>{e.uniforms.uMelt=w.uMelt,e.uniforms.uKeyReveal=w.uKeyReveal,e.uniforms.uAirPockets={value:D},e.uniforms.uVolumeRoughness=w.uVolumeRoughness,e.uniforms.uStudyMap={value:f},e.uniforms.uFrostStrength=_,e.uniforms.uNaturalClarity=g,e.uniforms.uClearCentre={value:[.78,.48,.82,.65][l-1]},e.fragmentShader=`uniform float uNaturalClarity;uniform vec4 uAirPockets[${D.length}];uniform sampler2D uStudyMap;uniform float uClearCentre;uniform float uFrostStrength;uniform float uKeyReveal;uniform float uVolumeRoughness;uniform float uMelt;uniform mat3 normalMatrix;varying vec3 vJellyLocal;float iceColorDepth;
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
      float fractures=(1.-smoothstep(.002,.010${a?`+fractureAA`:``},min(fractureA,fractureB)))*(.30+.70*mottling);
      ${a?`// Nested, interrupted fine fractures; bounded to sparse patches.
      float fineFracture=abs(dot(vJellyLocal,normalize(vec3(.34,-.28,.89)))+.22+.007*sin(vJellyLocal.y*23.));
      float fineAA=max(fwidth(fineFracture),.0008);
      float microCrack=(1.-smoothstep(fineAA,fineAA*2.5,fineFracture))*smoothstep(.44,.67,mottling);
      fractures=max(fractures,microCrack*.35);`:``}
      frozenDetail.r=max(frozenDetail.r,fractures*.68);
      float frozenAmount=uFrostStrength*(1.-smoothstep(.42,.92,uMelt));
      roughnessFactor=clamp(roughnessFactor+frozenDetail.r*.44*frozenAmount,.07,.48);
      ${a?`// Restrained micro-frost changes the highlight instead of painting
      // the clear viewing window white. Existing mottling bounds the patches.
      roughnessFactor+=fractures*.025*(1.-smoothstep(.45,.88,uMelt));`:``}`),e.fragmentShader=e.fragmentShader.replace(`#include <normal_fragment_maps>`,`#include <normal_fragment_maps>
      vec3 opticalRipple=vec3(sin(vJellyLocal.y*2.4+vJellyLocal.z*.7),sin(vJellyLocal.z*2.1-vJellyLocal.x*.8),sin(vJellyLocal.x*2.3+vJellyLocal.y*.6));
      normal=normalize(normal+normalMatrix*opticalRipple*.003*(1.-.7*smoothstep(.66,1.,uMelt)));
      vec3 sx=dFdx(-vViewPosition),sy=dFdy(-vViewPosition);
      vec3 rx=cross(sy,normal),ry=cross(normal,sx);
      float determinant=dot(sx,rx);
      vec3 gradient=sign(determinant)*(dFdx(frozenDetail.g)*rx+dFdy(frozenDetail.g)*ry);
      normal=normalize(max(abs(determinant),.0000001)*normal-gradient*.0005*frozenAmount);`);let t=k.transmission_pars_fragment.replaceAll(`getVolumeTransmissionRay( n, v, thickness,`,`getVolumeTransmissionRay( n, v, min( thickness, mix(.42,.14,smoothstep(.15,.70,uMelt)) ),`).replaceAll(`volumeAttenuation( length( transmissionRay ),`,`volumeAttenuation( iceColorDepth,`).replace(`vec3 attenuatedColor = transmittance * transmittedLight.rgb;`,`
        vec3 attenuatedColor = transmittance * transmittedLight.rgb;
        // Restore a restrained amount of warmth only where the opaque-buffer
        // sample is gold. White surroundings and blue ice keep their original
        // absorption; surface frost, blur and reflection remain in front.
        float goldChroma=(transmittedLight.r-transmittedLight.b)/max(.05,max(transmittedLight.r,transmittedLight.g));
        float goldMask=smoothstep(.10,.38,goldChroma)*smoothstep(.015,.10,transmittedLight.r);
        float goldReadability=.48*smoothstep(.10,.88,uMelt)*uKeyReveal;
        attenuatedColor=mix(attenuatedColor,transmittedLight.rgb*vec3(1.,.86,.55)+vec3(.035,.018,.002),goldMask*goldReadability);
      `);e.fragmentShader=e.fragmentShader.replace(`#include <transmission_pars_fragment>`,t);let n=k.transmission_fragment.replace(`n, v, material.roughness, material.diffuseContribution`,`n, v, uVolumeRoughness, material.diffuseContribution`);n=n.replace(`vec4 transmitted = getIBLVolumeRefraction(`,`
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
      for(int bubble=0;bubble<${D.length};bubble++){
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
`+Re+`
`+e.vertexShader,e.vertexShader=e.vertexShader.replace(`#include <beginnormal_vertex>`,`#include <beginnormal_vertex>
      vec3 normalAxis=abs(objectNormal.y)<.9?vec3(0.,1.,0.):vec3(1.,0.,0.);
      vec3 tangent=normalize(cross(normalAxis,objectNormal));
      vec3 bitangent=cross(objectNormal,tangent);
      vec3 anchor=meltIce(position);
      vec3 alongT=meltIce(position+tangent*.001)-anchor;
      vec3 alongB=meltIce(position+bitangent*.001)-anchor;
      objectNormal=normalize(cross(alongT,alongB));`),e.vertexShader=e.vertexShader.replace(`#include <begin_vertex>`,`#include <begin_vertex>
      vJellyLocal=position;transformed=meltIce(position);`)},T.customProgramCacheKey=()=>`snowy-natural-hewn-ice-v7-`+D.length+`-`+Number(a)+`-`+Number(s);let ne=Fe(e),O=new y(ne,T);O.name=`ice-body`,O.position.y=1.03,c.add(O);let re=new ee({color:14476262,roughness:.94,metalness:0,transparent:!0,opacity:s?.66:.92,depthWrite:!1,envMapIntensity:.18});re.onBeforeCompile=e=>{e.uniforms.uMelt=w.uMelt,e.uniforms.uOpacity=w.uOpacity,e.uniforms.uRimeAtlas={value:f},e.vertexShader=`uniform float uMelt;varying vec3 vRimeLocal;
`+Re+`
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
      diffuseColor.a*=max(max(max(cortex*clusters*1.05,basal),frostPatch*.62),max(0.,crackle-.20)*1.35)*grain*uOpacity*(1.-smoothstep(.32,.82,uMelt));`)},re.customProgramCacheKey=()=>`snowy-patchy-rime-v3-`+Number(a);let A=new y(ne,re);A.name=`surface-hoar`,A.position.copy(O.position),c.add(A);let j=new F({color:14003806,roughness:.23,metalness:1,envMapIntensity:1.25,emissive:0}),M=new F({color:15848076,roughness:.14,metalness:1,envMapIntensity:1.35}),N=new F({color:13017434,roughness:.29,metalness:1,envMapIntensity:1.2}),ie=e=>`uniform float uKeyReveal;
`+e.replace(`void main() {`,`void main() {
    if(uKeyReveal<.9999){float grain=fract(sin(dot(floor(gl_FragCoord.xy),vec2(12.9898,78.233)))*43758.5453);if(uKeyReveal<=0.||grain>uKeyReveal)discard;}`);for(let e of[j,M,N])e.onBeforeCompile=e=>{e.uniforms.uKeyReveal=w.uKeyReveal,e.fragmentShader=ie(e.fragmentShader)},e.customProgramCacheKey=()=>`snowy-turned-gold-resolve-v1`;let P=new o({depthPacking:p});P.onBeforeCompile=e=>{e.uniforms.uKeyReveal=w.uKeyReveal,e.fragmentShader=ie(e.fragmentShader)},P.customProgramCacheKey=()=>`snowy-key-shadow-resolve-v6`;let{ring:ae,shaft:oe,bit:I,collar:L}=Oe(v,j,M,N,e<=32,i.compactGeometry);v.position.set(0,.14,.08),v.scale.setScalar(.7),c.add(v);let R=ze(v),se=new he;se.name=`ambiguous-golden-core`,se.visible=!1,c.add(se);let B=new h({color:4810100,opacity:.22,depthWrite:!1});B.onBeforeCompile=e=>{e.uniforms.uMelt=w.uMelt,e.vertexShader=`varying vec2 vShadowFloor;
`+e.vertexShader,e.vertexShader=e.vertexShader.replace(`#include <worldpos_vertex>`,`#include <worldpos_vertex>
 vShadowFloor=(modelMatrix*vec4(transformed,1.)).xz;`),e.fragmentShader=`uniform float uMelt;varying vec2 vShadowFloor;
      float iceFoot(){return .94*(1.-.12*pow(clamp(uMelt,0.,1.),1.55));}
      vec2 iceCenter(){return vec2(0.);}
      float icePenumbra(){float gap=max(0.,max(abs(vShadowFloor.x-iceCenter().x),abs(vShadowFloor.y-iceCenter().y))-iceFoot());return mix(.32,1.,smoothstep(0.,.85,gap));}
    `+e.fragmentShader;let t=k.shadowmask_pars_fragment.replace(`directionalLight.shadowRadius,`,`directionalLight.shadowRadius * mix(icePenumbra(),1.,smoothstep(.80,1.,uMelt)),`);e.fragmentShader=e.fragmentShader.replace(`#include <shadowmask_pars_fragment>`,t),e.fragmentShader=e.fragmentShader.replace(`gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );`,`
      float edge=max(abs(vShadowFloor.x-iceCenter().x),abs(vShadowFloor.y-iceCenter().y));
      float contact=1.-smoothstep(iceFoot()*.83,iceFoot()*1.08,edge);
      float density=mix(.44+.56*contact,1.,smoothstep(.80,1.,uMelt));
      gl_FragColor=vec4(color,opacity*density*(1.-getShadowMask()));`)},B.customProgramCacheKey=()=>`snowy-translucent-contact-shadow-v2`;let V=new y(new x(200,200),B);V.name=`shadow-receiver`,V.rotation.x=-Math.PI/2,V.receiveShadow=!0,c.add(V),O.castShadow=!0,v.traverse(e=>{e instanceof y&&(e.castShadow=!0,e.customDepthMaterial=P)});let ce=new o({depthPacking:p});ce.onBeforeCompile=e=>{e.uniforms.uMelt=w.uMelt,e.vertexShader=`uniform float uMelt;
`+Re+`
`+e.vertexShader,e.vertexShader=e.vertexShader.replace(`#include <begin_vertex>`,`#include <begin_vertex>
 transformed=meltIce(position);`)},ce.customProgramCacheKey=()=>`snowy-complete-vertical-shadow-v11`,O.customDepthMaterial=ce;let le={ice:O,key:v,ring:ae,shaft:oe,bit:I,collar:L,floor:V,core:se};c.userData.sculptRuntime={nodes:le,meshes:{root:O,ring:ae,shaft:oe,bit:I,collar:L},sockets:{floor:new H(0,.04,0)},colliders:{ice:{type:`box`,size:[2,2,2]},key:{type:`compound`}},explodable:!0,clickable:!0};let ue=(e,t,n)=>{let r=u.clamp((n-e)/(t-e),0,1);return r*r*(3-2*r)},de=(e,t=0)=>{let n=u.clamp(e,0,1);w.uMelt.value=n;let r=Le(n),i=Math.cbrt(r.x*r.y*r.z);T.roughness=.12+.06*ue(.72,1,n);let a=(1-ue(.978,1,n))*(1-t);w.uOpacity.value=a,T.opacity=a,O.visible=n<1&&a>1e-5,A.visible=n<.82&&a>1e-5,O.castShadow=O.visible&&n<.978;let o=ue(.04,.48,n);w.uVolumeRoughness.value=.13-.05*o,v.visible=!0,w.uKeyReveal.value=ue(.04,.18,n),j.emissiveIntensity=0,c.userData.meltwater={enabled:!1,wetness:0,runoffVisible:!1,dropsVisible:!1,area:0,visualVolume:0,filmHeight:0},c.userData.meltVisual={iceTint:T.attenuationColor.getHexString(),iceScale:i,iceOpacity:T.opacity,keyBlur:w.uVolumeRoughness.value,keyReveal:w.uKeyReveal.value,glowAlpha:1-w.uKeyReveal.value};let s=R.pose(n);v.rotation.set(-s.angle*(1-t),0,-.08*(1-t)),v.position.set(0,s.y+1.45*t,s.z*(1-t)),v.scale.setScalar(.7-.18*t),c.userData.meltDynamics={choreography:`reference-progressive`,keyAngle:s.angle,keyY:s.y,keyZ:s.z,iceCenter:[r.cx,r.cz],iceHalfSize:[r.x,r.y,r.z],remnantHeight:r.y*2},c.updateMatrixWorld(!0)};de(0);let fe=()=>{d=!0,f.dispose();let e=new Set,t=new Set;c.traverse(n=>{n instanceof y&&(e.add(n.geometry),(Array.isArray(n.material)?n.material:[n.material]).forEach(e=>t.add(e)),n instanceof S&&n.dispose())}),ce.dispose(),P.dispose(),e.forEach(e=>e.dispose()),t.forEach(e=>e.dispose())};return{root:c,...le,startupTextures:[f],update:de,dispose:fe,setNaturalClarity(e){let t=a||e;g.value=+!!t,_.value=m*(t?.8:1),T.attenuationDistance=t?4.6:3.8,re.opacity=t?.66:.92}}}function W(e={}){let t=e.highDetail??!e.lowPower,n=new he;n.name=`walnut-chest`,n.userData.highDetail=t;let r=new he;r.name=`walnut-lid-pivot`,r.position.set(0,1.06,-.9),n.add(r);let i=new v;i.name=`walnut-key-socket`,i.position.set(0,.79,.925),n.add(i);let a=new Set,o=new Set,s=new Set,c={root:n,lid:r,lockSocket:i},l=!1,p=new F({color:t?`#c4a78d`:`#b08e71`,roughness:t?.58:.68,metalness:0,clearcoat:t?.18:.08,clearcoatRoughness:t?.38:.34,normalScale:new M(t?.32:.1,t?.32:.1)});n.userData.materialReady=!1;let m=new b,h=0,g=e.assetBase??`/assets/walnut-chest/`,_=(t,r=!1)=>{let i=m.load(`${g}${t}${e.lowPower?`-mobile`:``}.webp`,()=>{l?i.dispose():(h++,n.userData.materialReady=h===3,e.onReady?.())},void 0,()=>{l||(n.userData.materialError=!0,e.onError?.())});return i.colorSpace=r?f:``,i.anisotropy=e.lowPower?4:8,i.wrapS=i.wrapT=E,s.add(i),i};p.map=_(`walnut-color`,!0),p.normalMap=_(`walnut-normal`),p.roughnessMap=_(`walnut-roughness`),p.onBeforeCompile=e=>{e.fragmentShader=e.fragmentShader.replace(`#include <map_fragment>`,`#include <map_fragment>
    // Preserve the photographed veneer contrast instead of tinting it flat.
    diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.20,.115,.064),${t?`.055`:`.22`});`)},p.customProgramCacheKey=()=>`snowy-veneer-detail-v3-`+Number(t);let x=p.clone();x.color.set(t?`#a58c75`:`#947056`),t&&(x.onBeforeCompile=p.onBeforeCompile,x.customProgramCacheKey=p.customProgramCacheKey);let C=new F({color:`#b99656`,roughness:t?.27:.3,metalness:1,envMapIntensity:1}),w=new F({color:`#171b1e`,roughness:.98,metalness:0,sheen:.35,sheenColor:new N(`#394044`),sheenRoughness:.9});o.add(p),o.add(x),o.add(C),o.add(w);let T=e=>(a.add(e),e),te=(e,t)=>{let n=e.getAttribute(`position`),r=e.getAttribute(`normal`),i=new Float32Array(n.count*2);for(let e=0;e<n.count;e++){let a=n.getX(e)+t.x,o=n.getY(e)+t.y,s=n.getZ(e)+t.z,c=Math.abs(r.getX(e)),l=Math.abs(r.getY(e)),u=Math.abs(r.getZ(e));l>c&&l>u?(i[e*2]=a/3.3+.5,i[e*2+1]=(s+.9)/1.8*.42+.44):c>u?(i[e*2]=s/3.3+.5,i[e*2+1]=o/1.535*.46+.15):(i[e*2]=a/3.3+.5,i[e*2+1]=o/1.535*.46+.15)}e.setAttribute(`uv`,new I(i,2))},ne=(e,t,n,i,a)=>{(n===p||n===x)&&te(t,new H(a.x,a.y+(i===r?1.06:0),a.z+(i===r?-.9:0)));let o=new y(T(t),n);return o.name=e,o.position.copy(a),o.castShadow=!0,o.receiveShadow=!0,o.userData.partId=e,i.add(o),c[e]=o,o},k=(r,i,a,o,s,c,l,u=n,d=p)=>ne(r,new ue(i,a,o,e.lowPower?2:3,Math.min(t?.024:.018,i*.12,a*.12,o*.12)),d,u,new H(s,c,l));k(`bottom`,3.02,.14,1.52,0,.07,0),k(`back`,3.3,1.05,.14,0,.525,-.83),k(`side-left`,.14,1.05,1.56,-1.58,.525,0),k(`side-right`,.14,1.05,1.56,1.58,.525,0);let re=(e,t,n)=>{let r=new D,i=-e/2,a=-t/2;return r.moveTo(i+n,a),r.lineTo(i+e-n,a),r.quadraticCurveTo(i+e,a,i+e,a+n),r.lineTo(i+e,a+t-n),r.quadraticCurveTo(i+e,a+t,i+e-n,a+t),r.lineTo(i+n,a+t),r.quadraticCurveTo(i,a+t,i,a+t-n),r.lineTo(i,a+n),r.quadraticCurveTo(i,a,i+n,a),r},j=e=>{let t=new d;return t.absarc(0,e,.072,Math.PI*1.24,Math.PI*1.76,!0),t.lineTo(.088,e-.245),t.quadraticCurveTo(.092,e-.265,.07,e-.265),t.lineTo(-.07,e-.265),t.quadraticCurveTo(-.092,e-.265,-.088,e-.245),t.closePath(),t},ie=re(3.3,1.05,.018);ie.holes.push(j(.265)),ne(`front`,new O(ie,{depth:.14,steps:1,bevelEnabled:!0,bevelSegments:2,bevelSize:.006,bevelThickness:.006,curveSegments:e.lowPower?12:20}),p,n,new H(0,.525,.76));let P=re(.31,.44,.042);P.holes.push(j(.79-.705)),ne(`lock`,new O(P,{depth:.018,steps:1,bevelEnabled:!0,bevelSegments:2,bevelSize:.004,bevelThickness:.004,curveSegments:e.lowPower?12:24}),C,n,new H(0,.705,.906)),k(`lid`,3.3,.475,1.8,0,.2375,.9,r),k(`lid-inset`,3,.018,1.5,0,-.005,.9,r,x),k(`interior`,3,.025,1.5,0,.153,0,n,w);let ae=.037;for(let[t,r]of[[`hinge-a`,-1.02],[`hinge-b`,1.02]]){let i=new he;i.name=t,i.position.set(r,1.05,-.89),n.add(i),c[t]=i,k(`${t}-base`,.32,.1,.014,0,-.045,-.01,i,C);let a=ne(`${t}-knuckle`,new L(ae,ae,.32,e.lowPower?12:20),C,i,new H);a.rotation.z=Math.PI/2}let oe=T(new L(.014,.014,.007,e.lowPower?8:12)),R=new S(oe,C,t?6:4);R.name=`hinge-screws`;let z=new v,se=0;for(let e of[-1.12,-.92,.92,1.12])z.position.set(e,1.015,-.913),z.rotation.set(Math.PI/2,0,0),z.updateMatrix(),R.setMatrixAt(se++,z.matrix);n.add(R);let B,V;if(t){for(let e of[.89,.51])z.position.set(0,e,.932),z.rotation.set(Math.PI/2,0,0),z.updateMatrix(),R.setMatrixAt(se++,z.matrix);let e=new ee({color:`#30281f`,roughness:.85,metalness:.22});o.add(e),B=new S(T(new A(.018,.003,.0015)),e,2),B.name=`lock-screw-slots`;for(let e=0;e<2;e++)z.position.set(0,[.89,.51][e],.9365),z.rotation.set(0,0,e?.36:-.2),z.updateMatrix(),B.setMatrixAt(e,z.matrix);n.add(B),V=new S(T(new A(.006,.94,.001)),e,2),V.name=`front-corner-joinery`;for(let e=0;e<2;e++)z.position.set(e?-1.5:1.5,.525,.9065),z.rotation.set(0,0,0),z.updateMatrix(),V.setMatrixAt(e,z.matrix);n.add(V)}c.lid=r,c[`hinge-screws`]=R;let ce={};n.traverse(e=>{e instanceof y&&(ce[e.name]=e)});let de=[...n.children].filter(e=>e!==i),fe=new H(0,.75,0);n.updateMatrixWorld(!0);let pe=de.map(e=>({part:e,position:e.position.clone(),offset:new le().setFromObject(e).getCenter(new H).sub(fe)}));n.userData.sculptRuntime={nodes:c,meshes:ce,sockets:{key:i,hinge:r},colliders:{body:{type:`compound-box`,size:[3.3,1.535,1.8]},lid:{type:`box`,size:[3.3,.475,1.8]}},destructionGroups:{body:[`front`,`back`,`side-left`,`side-right`,`bottom`].map(e=>c[e]),lid:[r]},explodable:!0,clickable:!0,setExplode(e){let t=u.clamp(e,0,1);for(let e of pe)e.part.position.copy(e.position).addScaledVector(e.offset,t*.65)}},n.userData.reference=`Walnut presentation box: proportional/material inspiration; inferred rear/interior and adapted working lock.`;let me=e=>{r.rotation.x=-u.clamp(e,0,1)*1.83,n.userData.openProgress=u.clamp(e,0,1)};return me(0),{root:n,lidPivot:r,keySocket:i,update:me,dispose(){l||(l=!0,a.forEach(e=>e.dispose()),o.forEach(e=>e.dispose()),s.forEach(e=>e.dispose()),R.dispose(),B?.dispose(),V?.dispose(),n.clear())}}}function G(e){if(e.index||Object.keys(e.morphAttributes).length)return!1;let t=Object.entries(e.attributes);if(!t.length||t.some(([,e])=>!(e instanceof I)||!(e.array instanceof Float32Array)||`isInstancedBufferAttribute`in e))return!1;let n=t[0][1].count;if(t.some(([,e])=>e.count!==n))return!1;let r=t.map(([e,t])=>({name:e,attribute:t,words:new Uint32Array(t.array.buffer,t.array.byteOffset,t.array.length)})),i=[],a=new Uint32Array(n),o=new Map,s=0;for(let{attribute:e}of r)s+=e.itemSize*4;for(let e=0;e<n;e++){let t=``;for(let{attribute:n,words:i}of r)for(let r=0;r<n.itemSize;r++){let a=i[e*n.itemSize+r];t+=String.fromCharCode(a>>>16,a&65535)}let n=o.get(t);n===void 0&&(n=i.length,i.push(e),o.set(t,n)),a[e]=n}let c=i.length<=65535;if(i.length*s+n*(c?2:4)>=n*s)return!1;for(let{name:t,attribute:n,words:a}of r){let r=new Float32Array(i.length*n.itemSize),o=new Uint32Array(r.buffer);for(let e=0;e<i.length;e++)o.set(a.subarray(i[e]*n.itemSize,(i[e]+1)*n.itemSize),e*n.itemSize);let s=new I(r,n.itemSize,n.normalized);s.name=n.name,s.gpuType=n.gpuType,s.setUsage(n.usage),e.setAttribute(t,s)}return e.setIndex(new I(c?new Uint16Array(a):a,1)),!0}function Ve(e={}){if(new URLSearchParams(location.search).get(`chest`)===`legacy`)return W(e);let t=e.highDetail??!e.lowPower,n=new he;n.name=`walnut-chest`,n.userData.highDetail=t;let r=new he;r.name=`walnut-lid-pivot`,r.position.set(0,1.06,-.9),n.add(r);let i=new v;i.name=`walnut-key-socket`,i.position.set(0,.79,.925),n.add(i);let a=new Set,o=new Set,s=new Set,c={root:n,lid:r,lockSocket:i},l=!1,p=new F({color:`#c28452`,roughness:.65,metalness:0,clearcoat:.18,clearcoatRoughness:.32,normalScale:new M(.35,.35)});n.userData.materialReady=!1;let m=new b,h=0,g=e.assetBase??(e.lowPower?`/assets/walnut-chest/`:`/assets/walnut-chest-v2/`),_=(t,r=!1)=>{let i=`${g}${t}${e.lowPower?`-mobile`:``}.webp`,a=e.compactGeometry?1:e.lowPower?3:2,o=()=>{h++,n.userData.materialReady=h===a,e.onReady?.()},c=()=>{l||(n.userData.materialError=!0,e.onError?.())},u=new ne;return new me().setOptions({imageOrientation:`flipY`,premultiplyAlpha:`none`,colorSpaceConversion:r?`default`:`none`}).load(i,e=>{l?e.close():(u.image=e,u.needsUpdate=!0,o())},void 0,()=>{m.load(i,e=>{l?e.dispose():(u.image=e.image,u.needsUpdate=!0,o())},void 0,c)}),u.flipY=!1,u.colorSpace=r?f:``,u.anisotropy=e.lowPower?4:8,u.wrapS=u.wrapT=E,s.add(u),u};p.map=_(`walnut-color`,!0),e.compactGeometry?(p.roughness=.62,p.metalness=0):(p.normalMap=_(e.lowPower?`walnut-normal`:`walnut-normal-roughness`),p.roughnessMap=e.lowPower?_(`walnut-roughness`):p.normalMap),p.onBeforeCompile=t=>{e.lowPower||(t.fragmentShader=t.fragmentShader.replace(`#include <roughnessmap_fragment>`,k.roughnessmap_fragment.replace(`texelRoughness.g`,`texelRoughness.a`))),t.fragmentShader=t.fragmentShader.replace(`#include <map_fragment>`,`#include <map_fragment>
      diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.26, 0.12, 0.05), 0.28);
    `)},p.customProgramCacheKey=()=>`snowy-crafted-walnut-v4-`+Number(!!e.lowPower);let x=p.clone();x.color.set(`#c2a78b`),x.onBeforeCompile=p.onBeforeCompile,x.customProgramCacheKey=p.customProgramCacheKey;let C=new F({color:`#c29542`,roughness:.32,metalness:.88,clearcoat:.3,envMapIntensity:1.2}),w=new F({color:`#171b1e`,roughness:.98,metalness:0,sheen:.35,sheenColor:new N(`#394044`),sheenRoughness:.9});o.add(p),o.add(x),o.add(C),o.add(w);let T=e=>(a.add(e),e),te=(e,t,n)=>{let r=e.getAttribute(`position`),i=e.getAttribute(`normal`),a=new Float32Array(r.count*2);for(let e=0;e<r.count;e++){let o=r.getX(e)+t.x,s=r.getY(e)+t.y,c=r.getZ(e)+t.z,l=Math.abs(i.getX(e)),u=Math.abs(i.getY(e)),d=Math.abs(i.getZ(e)),f=1/3.3;u>l&&u>d?(a[e*2]=(n.includes(`stile`)?c:o)*f+.5,a[e*2+1]=(n.includes(`stile`)?o:c)*f+.48):l>d?(a[e*2]=c*f+.37,a[e*2+1]=s*f+.23):n.includes(`stile`)?(a[e*2]=s*f+.16,a[e*2+1]=o*f+.5):(a[e*2]=o*f+.5,a[e*2+1]=s*f+.15)}e.setAttribute(`uv`,new I(a,2))},re=(e,t,n,i,a)=>{(n===p||n===x)&&te(t,new H(a.x,a.y+(i===r?1.06:0),a.z+(i===r?-.9:0)),e);let o=new y(T(t),n);return o.name=e,o.position.copy(a),o.castShadow=!0,o.receiveShadow=!0,o.userData.partId=e,i.add(o),c[e]=o,o},j=new Map,ie=(e,t,n,r,i)=>{let a=`${e}_${t}_${n}_${r}_${i}`,o=j.get(a);return o||(o=new ue(e,t,n,r,i),j.set(a,o)),o.clone()},P=(r,i,a,o,s,c,l,u=n,d=p)=>re(r,ie(i,a,o,e.compactGeometry?1:e.lowPower?2:3,Math.min(t?.024:.018,i*.12,a*.12,o*.12)),d,u,new H(s,c,l));P(`bottom`,3.02,.14,1.52,0,.07,0),P(`back`,3.3,1.05,.14,0,.525,-.83),P(`side-left`,.14,1.05,1.56,-1.58,.525,0),P(`side-right`,.14,1.05,1.56,1.58,.525,0);let ae=(e,t,n)=>{let r=new D,i=-e/2,a=-t/2;return r.moveTo(i+n,a),r.lineTo(i+e-n,a),r.quadraticCurveTo(i+e,a,i+e,a+n),r.lineTo(i+e,a+t-n),r.quadraticCurveTo(i+e,a+t,i+e-n,a+t),r.lineTo(i+n,a+t),r.quadraticCurveTo(i,a+t,i,a+t-n),r.lineTo(i,a+n),r.quadraticCurveTo(i,a,i+n,a),r},oe=e=>{let t=new d;return t.absarc(0,e,.072,Math.PI*1.24,Math.PI*1.76,!0),t.lineTo(.088,e-.245),t.quadraticCurveTo(.092,e-.265,.07,e-.265),t.lineTo(-.07,e-.265),t.quadraticCurveTo(-.092,e-.265,-.088,e-.245),t.closePath(),t},z=ae(3.3,1.05,.018);z.holes.push(oe(.265)),re(`front`,new O(z,{depth:.14,steps:1,bevelEnabled:!0,bevelSegments:2,bevelSize:.006,bevelThickness:.006,curveSegments:e.lowPower?12:20}),p,n,new H(0,.525,.76));let se=ae(.31,.44,.042);se.holes.push(oe(.79-.705)),re(`lock`,new O(se,{depth:.018,steps:1,bevelEnabled:!0,bevelSegments:2,bevelSize:.004,bevelThickness:.004,curveSegments:e.lowPower?12:24}),C,n,new H(0,.705,.906)),P(`lid`,3.3,.445,1.8,0,.2225,.9,r),P(`lid-inset`,3,.018,1.5,0,-.005,.9,r,x),P(`interior`,3,.025,1.5,0,.153,0,n,w);let B=[];if(!e.compactGeometry){B.push(P(`lid-panel`,2.99,.018,1.49,0,.449,.9,r));for(let e of[.06,1.74])B.push(P(`lid-rail`,3.3,.03,.12,0,.46,e,r));for(let e of[-1.59,1.59])B.push(P(`lid-stile`,.12,.03,1.56,e,.46,.9,r));for(let e of[.055,.995])B.push(P(`front-rail`,3.15,.09,.022,0,e,.918));for(let e of[-1.575,1.575])B.push(P(`front-stile`,.1,.85,.022,e,.525,.918))}for(let e of[n,r]){let t=B.filter(t=>t.parent===e);if(t.length===0)continue;let r=[];for(let n of t)n.updateMatrix(),r.push(n.geometry.clone().applyMatrix4(n.matrix)),e.remove(n),a.delete(n.geometry),n.geometry.dispose(),c[n.name]===n&&delete c[n.name];let i=R(r);if(r.forEach(e=>e.dispose()),i){let t=new y(T(i),p);t.name=e===n?`crafted-front-frame`:`crafted-lid-frame`,t.castShadow=!0,t.receiveShadow=!0,e.add(t),c[t.name]=t}}let V=.037,ce,de;if(!e.compactGeometry){for(let[t,r]of[[`hinge-a`,-1.02],[`hinge-b`,1.02]]){let i=new he;i.name=t,i.position.set(r,1.05,-.89),n.add(i),c[t]=i,P(`${t}-base`,.32,.1,.014,0,-.045,-.01,i,C);let a=re(`${t}-knuckle`,new L(V,V,.32,e.lowPower?12:20),C,i,new H);a.rotation.z=Math.PI/2}let r=T(new L(.014,.014,.007,e.lowPower?8:12));ce=new S(r,C,t?6:4),ce.name=`hinge-screws`;let i=new v,a=0;for(let e of[-1.12,-.92,.92,1.12])i.position.set(e,1.015,-.913),i.rotation.set(Math.PI/2,0,0),i.updateMatrix(),ce.setMatrixAt(a++,i.matrix);if(n.add(ce),t){for(let e of[.89,.51])i.position.set(0,e,.932),i.rotation.set(Math.PI/2,0,0),i.updateMatrix(),ce.setMatrixAt(a++,i.matrix);let e=new ee({color:`#30281f`,roughness:.85,metalness:.22});o.add(e),de=new S(T(new A(.018,.003,.0015)),e,2),de.name=`lock-screw-slots`;for(let e=0;e<2;e++)i.position.set(0,[.89,.51][e],.9365),i.rotation.set(0,0,e?.36:-.2),i.updateMatrix(),de.setMatrixAt(e,i.matrix);n.add(de)}}c.lid=r,ce&&(c[`hinge-screws`]=ce),a.forEach(G);let fe={};n.traverse(e=>{e instanceof y&&(fe[e.name]=e)});let pe=[...n.children].filter(e=>e!==i),ge=new H(0,.75,0);n.updateMatrixWorld(!0);let _e=pe.map(e=>({part:e,position:e.position.clone(),offset:new le().setFromObject(e).getCenter(new H).sub(ge)}));n.userData.sculptRuntime={nodes:c,meshes:fe,sockets:{key:i,hinge:r},colliders:{body:{type:`compound-box`,size:[3.3,1.535,1.8]},lid:{type:`box`,size:[3.3,.475,1.8]}},destructionGroups:{body:[`front`,`back`,`side-left`,`side-right`,`bottom`].map(e=>c[e]),lid:[r]},explodable:!0,clickable:!0,setExplode(e){let t=u.clamp(e,0,1);for(let e of _e)e.part.position.copy(e.position).addScaledVector(e.offset,t*.65)}},n.userData.reference=`Walnut presentation box: proportional/material inspiration; inferred rear/interior and adapted working lock.`;let ve=e=>{r.rotation.x=-u.clamp(e,0,1)*1.83,n.userData.openProgress=u.clamp(e,0,1)};return ve(0),{root:n,lidPivot:r,keySocket:i,update:ve,dispose(){l||(l=!0,j.forEach(e=>e.dispose()),j.clear(),a.forEach(e=>e.dispose()),o.forEach(e=>e.dispose()),s.forEach(e=>{e.dispose(),e.image instanceof ImageBitmap&&e.image.close()}),ce?.dispose(),de?.dispose(),n.clear())}}}var He=`
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
`;function Ue(e,t,n,r,i,a){let o=new x(80,80);o.rotateX(-Math.PI/2),o.translate(0,-.006,0);let s={value:e},c={value:new z(1,1,0,0)},l={value:0},u={value:0},d={value:1},f={value:r.position.clone()},p={value:0},m={value:new z},h={value:new z},g={value:new M},_={value:0},v=new ee({color:16777215,roughness:1,metalness:0,toneMapped:!1});v.onBeforeCompile=e=>{Object.assign(e.uniforms,{...xe,...i,uPhoneGround:_,uWoodFoot:m,uIceFoot:h,uFootAngles:g,uSnowBackdrop:s,uSnowCrop:c,uCloseCamp:l,uHighDetail:u,uIceStrength:d,uFirePosition:f,uFireFlicker:p}),a&&(e.uniforms.uSharedIrradiance=a),e.vertexShader=(a?`uniform sampler2D uSharedIrradiance;
`:``)+`varying vec3 vSnowWorld;varying vec4 vSnowClip;varying vec3 vAuroraIrradiance;
`+He+`
`+e.vertexShader,e.vertexShader=e.vertexShader.replace(`#include <project_vertex>`,`#include <project_vertex>
      vSnowWorld=(modelMatrix*vec4(transformed,1.)).xyz;vSnowClip=gl_Position;vAuroraIrradiance=${a?`texelFetch(uSharedIrradiance,ivec2(0),0).rgb`:i.uAuroraGroundStrength.value>0?`auroraDiffuseIrradiance(vec3(0.,1.,0.))`:`vec3(0.)`};`),e.fragmentShader=`uniform float uHighDetail;uniform float uCloseCamp;${Te}
 uniform sampler2D uSnowBackdrop;uniform vec4 uSnowCrop;uniform float uIceStrength;uniform vec3 uFirePosition;uniform float uFireFlicker;uniform vec4 uWoodFoot;uniform vec4 uIceFoot;uniform vec2 uFootAngles;uniform float uPhoneGround;
      varying vec3 vSnowWorld;varying vec4 vSnowClip;varying vec3 vAuroraIrradiance;
      ${He}
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
      #include <opaque_fragment>`)},v.customProgramCacheKey=()=>`snowy-phone-contact-v3`+(a?`-shared-f32-v1`:``);let b=new he;b.name=`photographic-snow-ground`;let S=new y(o,v);S.receiveShadow=!0,b.add(S);let C=(e,t,n)=>{let r=[],i=[];for(let e=0;e<=128;e++){let a=e/128*Math.PI*2,o=Math.cos(a),s=Math.sin(a),c=Math.min((t-.018)/Math.max(1e-4,Math.abs(o)),(n-.018)/Math.max(1e-4,Math.abs(s))),l=Math.min((t+.13)/Math.max(1e-4,Math.abs(o)),(n+.13)/Math.max(1e-4,Math.abs(s))),u=.018+.008*Math.sin(a*19)+.005*Math.sin(a*43+1);if(r.push(o*c,u,s*c,o*l,-.006,s*l),e<128){let t=e*2;i.push(t,t+2,t+1,t+1,t+2,t+3)}}let a=new de;a.setAttribute(`position`,new fe(r,3)),a.setIndex(i),a.computeVertexNormals();let o=new y(a,v);return o.position.copy(e.position),o.position.y=0,o.rotation.y=e.rotation.y,o.receiveShadow=!0,b.add(o),o},w=t.scale.x,T=n.scale.x,E=C(t,1.65*w,.9*w),te=C(n,T,T);return{root:b,setBackground(t){e=t,s.value=t},update(i,a,o){m.value.set(t.position.x,t.position.z,1.65*t.scale.x,.9*t.scale.z),h.value.set(n.position.x,n.position.z,n.scale.x,n.scale.z),g.value.set(t.rotation.y,n.rotation.y),_.value=+!!e.userData.integratedPhone,E.visible=_.value<.5,te.visible=_.value<.5,E.position.set(t.position.x,0,t.position.z),E.rotation.y=t.rotation.y,E.scale.set(t.scale.x/w,_.value?t.scale.x*2.5:1,t.scale.z/w),te.position.set(n.position.x,0,n.position.z),te.rotation.y=n.rotation.y,te.scale.set(n.scale.x/T,1,n.scale.z/T),l.value=+!!e.userData.closeCamp,u.value=+!!e.userData.highDetail,d.value=(1-i)*(1-a),te.scale.y=d.value*(_.value?n.scale.x*2.5:1),te.visible=_.value<.5&&d.value>.01,c.value.set(e.repeat.x,e.repeat.y,e.offset.x,e.offset.y),f.value.copy(r.position),p.value=.055*Math.sin(o*7.1)+.025*Math.sin(o*13.7)},dispose(){o.dispose(),E.geometry.dispose(),te.geometry.dispose(),v.dispose()}}}function We(e){let t=e.assetBase??`/assets/realistic-winter`,n=e.maxTextureSize>=4108,r=e.lowPower?`aurora-mobile-v1.webp`:`aurora-user-original-v1.webp`,i=!1,a=!1,o=!1,s=new AbortController,c={value:new z(1,1,0,0)},d=new ne,f=new b().load(`${t}/${r}`,()=>{i?f.dispose():(d.image=f.image,d.needsUpdate=!0,o=!0,e.onReady?.())},void 0,t=>{console.error(`[SKY TEXTURE ERROR]`,t),i||e.onError?.()});d.colorSpace=``,d.generateMipmaps=!1,d.minFilter=d.magFilter=pe;let p={uAuroraMap:{value:d},uAuroraIntensity:{value:e.intensity??.62},uAuroraGroundStrength:{value:0},uAuroraPortrait:{value:0},uAuroraTime:{value:0},uAuroraNatureBounce:{value:0},uAuroraCrop:c,uAuroraProjection:{value:new M(1,1)},uAuroraViewToWorld:{value:new l},uAuroraWorldToView:{value:new l}},m={value:null},h={value:0},g=!1,_=[],ee=()=>{let e=_[+!!g];m.value=e,h.value=+!!e?.image},v=new b,S=n=>{let r=+!!n;if(_[r]?.image)return;let a=n?`aurora-sky-portrait-mask.webp`:`aurora-sky-landscape-enhanced-mask-v1.webp`,o=t=>{i?t.dispose():(_[r]?.dispose(),_[r]=t,ee(),e.onReady?.())},s=v.load(t+`/`+a,()=>{o(s)},void 0,()=>{i||e.onError?.()});s.colorSpace=``,s.generateMipmaps=!1,s.minFilter=s.magFilter=pe};S(typeof window<`u`&&matchMedia(`(orientation: portrait), (max-width: 699px)`).matches);let C=new B({transparent:!0,blending:1,depthWrite:!1,depthTest:!0,toneMapped:!1,uniforms:{...p,uPlate:{value:null},uHasPlate:{value:0},uSkyMask:m,uHasSkyMask:h,uSkyGate:{value:new M(...e.skyBlueGate??[.68,.9])},uCrop:c},vertexShader:`varying vec2 vUv;varying vec3 vAuroraIrradiance;
      ${He}
      void main(){vUv=uv;vAuroraIrradiance=vec3(0.);gl_Position=vec4(position.xy,.9999999,1.);}`,fragmentShader:`precision highp float;uniform sampler2D uPlate;uniform sampler2D uSkyMask;uniform float uHasSkyMask;uniform vec2 uSkyGate;uniform vec4 uCrop;uniform float uHasPlate;varying vec2 vUv;varying vec3 vAuroraIrradiance;
      ${He}
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
      }`}),w=new y(new x(2,2),C);return w.name=`user-original-aurora`,w.frustumCulled=!1,w.renderOrder=-20,{root:w,lighting:p,get textureVariant(){return n?`comfyui-upper-local`:`original-capability-fallback`},get ready(){return o&&!!_[+!!g]?.image},get time(){return p.uAuroraTime.value},update(e){!i&&a&&(p.uAuroraTime.value=e)},setCamera(e){e.updateMatrixWorld(),p.uAuroraViewToWorld.value.setFromMatrix4(e.matrixWorld),p.uAuroraWorldToView.value.setFromMatrix4(e.matrixWorldInverse);let t=Math.tan(u.degToRad(e.fov)*.5);p.uAuroraProjection.value.set(t*e.aspect,t)},setActive(e){i||(a=e)},setCrop(e,t=!1){c.value.set(e.repeat.x,e.repeat.y,e.offset.x,e.offset.y),C.uniforms.uPlate.value=e,C.uniforms.uHasPlate.value=1,p.uAuroraPortrait.value=+!!t,p.uAuroraNatureBounce.value=!t&&e.userData.highDetail?1:0,g=t,S(t),ee()},setIrradiance(e){C.uniforms.uSharedIrradiance=e,C.vertexShader=`uniform sampler2D uSharedIrradiance;
`+C.vertexShader.replace(`vAuroraIrradiance=auroraDiffuseIrradiance(vec3(0.,1.,0.));`,`vAuroraIrradiance=texelFetch(uSharedIrradiance,ivec2(0),0).rgb;`),C.needsUpdate=!0},setIntensity(e){p.uAuroraIntensity.value=u.clamp(e,0,2)},get state(){return a&&o?`flowing`:`still`},dispose(){i||(i=!0,s.abort(),d.dispose(),_.forEach(e=>e.dispose()),w.geometry.dispose(),C.dispose())}}}function Ge(e,t,n,r){let i=new z,a=new z,o=!1,s=!1;e.onBeforeRender=e=>{if(o=!1,e.getRenderTarget()!==null||t.x<=0||t.y<=0||(e.getCurrentViewport(a),a.z<=0||a.w<=0))return;e.getScissor(i),s=e.getScissorTest();let c=e.getPixelRatio(),l=r()?.095:.084,u=r()?.018:.027,d=(n.x-t.z)/t.x,f=(1-n.y-t.w)/t.y,p=n.z*l/t.x,m=n.z*u/t.y,h=Math.max(a.x,Math.floor(a.x+(d-p)*a.z)-2),g=Math.max(a.y,Math.floor(a.y+(f-m)*a.w)-2),_=Math.min(a.x+a.z,Math.ceil(a.x+(d+p)*a.z)+2),ee=Math.min(a.y+a.w,Math.ceil(a.y+(f+m)*a.w)+2);s&&(h=Math.max(h,i.x*c),g=Math.max(g,i.y*c),_=Math.min(_,(i.x+i.z)*c),ee=Math.min(ee,(i.y+i.w)*c)),e.setScissor(h/c,g/c,Math.max(0,_-h)/c,Math.max(0,ee-g)/c),e.setScissorTest(!0),o=!0},e.onAfterRender=e=>{o&&=(e.setScissor(i),e.setScissorTest(s),!1)}}function Ke(e={}){let t=new he;t.name=`photographed-campfire-flame`;let n=new AbortController,r=!1,i=!0,a=!1,o=!1,c=!1,l=0,d=-1,p=document.createElement(`video`);p.muted=!0,p.loop=!0,p.playsInline=!0,p.preload=`auto`,p.crossOrigin=`anonymous`,p.setAttribute(`playsinline`,``),p.setAttribute(`muted`,``);let m=!1,h;typeof p.requestVideoFrameCallback==`function`&&(h=p.requestVideoFrameCallback(()=>{h=void 0,!r&&(m=!0,e.onReady?.())}));let g=new ce(p);g.colorSpace=f,g.minFilter=g.magFilter=pe,g.generateMipmaps=!1;let _={value:1.08},ee={value:0},v={value:new z(1,1,0,0)},S={value:0},C={value:null},w={value:new H(.6105,.681,.58)},T=`uniform float uCloseCamp;${Te}
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
    }`,E=new oe({color:16777215,map:g,transparent:!0,depthWrite:!1,side:2,toneMapped:!1,fog:!1,blending:5,blendEquation:100,blendSrc:201,blendDst:201});E.onBeforeCompile=e=>{Object.assign(e.uniforms,xe),e.uniforms.uFlameExposure=_,e.uniforms.uCloseCamp=ee,e.uniforms.uPlateCrop=v,e.uniforms.uPortrait=S,e.uniforms.uPitLayout=w,e.vertexShader=`varying vec4 vFlameClip;
`+e.vertexShader,e.vertexShader=e.vertexShader.replace(`#include <project_vertex>`,`#include <project_vertex>
 vFlameClip=gl_Position;`),e.fragmentShader=`uniform float uFlameExposure;varying vec4 vFlameClip;
`+T+`
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
    `)},E.customProgramCacheKey=()=>`snowy-photographed-flame-distant-pit-v4`;let te=new x(4/3,1),D=new y(te,E);D.name=`real-flame-footage`,D.position.y=.32,D.renderOrder=3,t.add(D);let ne=new ge(16749624,12,14,1.3);ne.position.set(0,.45,.04),t.add(ne);let O,k=new B({transparent:!0,depthTest:!1,depthWrite:!1,toneMapped:!1,blending:2,uniforms:{...xe,uCloseCamp:ee,uPlate:C,uPlateCrop:v,uPortrait:S,uPitLayout:w,uFlames:{value:g}},vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}`,fragmentShader:`uniform sampler2D uPlate;uniform sampler2D uFlames;varying vec2 vUv;${T}
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
      }`}),re=new y(new x(2,2),k);re.frustumCulled=!1,re.renderOrder=2,t.add(re),Ge(re,v.value,w.value,()=>S.value>.5);let A=new de,j=new Float32Array(60),M=new Float32Array(20),N=413,ie=()=>(N=1664525*N+1013904223>>>0,N/4294967296);for(let e=0;e<20;e++)j[e*3]=(ie()-.5)*.4,j[e*3+1]=ie()*1,j[e*3+2]=(ie()-.5)*.4,M[e]=ie();A.setAttribute(`position`,new I(j,3)),A.setAttribute(`phase`,new I(M,1));let P={value:0},ae=new B({transparent:!0,depthTest:!1,depthWrite:!1,blending:2,toneMapped:!1,uniforms:{uTime:P},vertexShader:`uniform float uTime;attribute float phase;varying float vAlpha;
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
      }`}),F=new s(A,ae);F.name=`rising-sparks`,F.frustumCulled=!1,F.renderOrder=4,t.add(F);let L=e=>{E.map!==e&&(E.map=e,E.needsUpdate=!0)},R=()=>{if(!r){if(i&&t.userData.videoReady&&!c?(L(g),k.uniforms.uFlames.value=g):O&&t.userData.posterReady?(L(O),k.uniforms.uFlames.value=O):t.userData.videoReady&&(L(g),k.uniforms.uFlames.value=g),!i||!a)o&&(d=l),(!p.paused||o)&&p.pause(),t.userData.playing=!1;else if(t.userData.videoReady&&p.paused&&!o&&!c){o=!0;let e=++l;p.play().then(()=>{o=!1,!r&&(t.userData.playing=i&&a&&!p.paused,i&&a||p.pause())},n=>{o=!1,!r&&(c=n?.name!==`AbortError`||e!==d,t.userData.playing=!1,c&&O&&t.userData.posterReady&&L(O))})}}},se=!1,V=()=>{r||se||(se=!0,p.src=e.source??`/assets/realistic-winter/flames-real-loop.mp4`,p.load())};O=new b().load(e.poster??`/assets/realistic-winter/flames-real-poster.jpg`,n=>{r?n.dispose():(t.userData.posterReady=!0,R(),e.onReady?.())},void 0,n=>{r||(t.userData.posterError=!0,V(),e.onError?.(n))}),O.colorSpace=f,O.generateMipmaps=!1,O.minFilter=pe,p.addEventListener(`loadeddata`,()=>{g.needsUpdate=!0,t.userData.videoReady=!0,R(),e.onReady?.()},{signal:n.signal}),p.addEventListener(`error`,()=>{t.userData.videoError=!0,e.onError?.(p.error)},{signal:n.signal}),document.addEventListener(`pointerdown`,()=>{c&&(c=!1,R())},{signal:n.signal,passive:!0}),e.deferVideo||V();let le=new H;return{root:t,mesh:D,light:ne,video:p,loadVideo:V,get motionBlocked(){return c},get framePresented(){return m||typeof p.requestVideoFrameCallback!=`function`&&p.readyState>=2&&p.currentTime>0},setComposition(e,t){ee.value=+!!e.userData.closeCamp;let n=De(t,!!e.userData.closeCamp,e.userData.compactPit);w.value.set(n.x,n.y,n.scale),C.value=e,S.value=+!!t,v.value.set(e.repeat.x,e.repeat.y,e.offset.x,e.offset.y)},setMotion(e){i!==e&&(i=e,R())},setExposure(e){_.value=u.clamp(e,.1,3)},update(e,n,r){a=r,t.updateWorldMatrix(!0,!1),n.getWorldPosition(le),t.worldToLocal(le),D.rotation.y=Math.atan2(le.x,le.z),P.value=performance.now()*.001,ne.intensity=8*(i&&a?1+.055*Math.sin(e*7.1)+.025*Math.sin(e*13.7):1),R()},pause(){a=!1,R()},dispose(){h!==void 0&&p.cancelVideoFrameCallback(h),!r&&(r=!0,n.abort(),p.pause(),p.removeAttribute(`src`),p.load(),A.dispose(),ae.dispose(),te.dispose(),E.dispose(),re.geometry.dispose(),k.dispose(),g.dispose(),O?.dispose(),t.clear())}}}var K=(e,t,n)=>{let r=u.clamp((n-e)/(t-e),0,1);return r*r*(3-2*r)};function qe(e,t){let n=new H,r=new H,i=new H,a=new T,o=new T,s=new T,c=new H,l=new H,d=new H,f=new T,p=new T,m=new H,h=new H,g=new H,_=new T().setFromAxisAngle(new H(1,0,0),Math.PI/2),ee=new T,v=new H(0,1,0),y=new se,b=!1,x=()=>{e.updateWorldMatrix(!0,!1),t.updateWorldMatrix(!0,!1),e.getWorldPosition(n),e.getWorldQuaternion(a),e.getWorldScale(c),t.getWorldPosition(m),t.getWorldQuaternion(s),h.set(0,0,1).applyQuaternion(s).normalize(),o.copy(s).multiply(_).multiply(new T().setFromAxisAngle(v,-Math.PI/2));let l=u.clamp(n.distanceTo(m)*.2,.64,1.8);r.copy(n).add(new H(0,l,0)),g.set(0,.157,0).multiply(c).applyQuaternion(o),i.copy(m).addScaledVector(h,.58).sub(g),y.v0.copy(r),y.v1.copy(r).add(new H(0,.45,0)),y.v2.copy(i).addScaledVector(h,.26).add(new H(0,.9,0)),y.v3.copy(i),b=!0};return{begin:x,apply:t=>{b||x();let i=u.clamp(t,0,1),s=K(0,.15,i),_=K(.15,.46,i);i<.15?d.lerpVectors(n,r,s):y.getPoint(_,d),f.slerpQuaternions(a,o,K(.04,.46,i));let S=K(.46,.58,i),C=K(.59,.69,i);i>=.46&&(f.copy(o).multiply(ee.setFromAxisAngle(v,Math.PI/2*C)),g.set(0,.157,0).multiply(c).applyQuaternion(f),d.copy(m).addScaledVector(h,u.lerp(.58,-.35,S)).sub(g));let w=d.clone();e.parent.updateWorldMatrix(!0,!1),e.position.copy(e.parent.worldToLocal(d)),e.parent.getWorldQuaternion(p).invert(),e.quaternion.copy(p).multiply(f),e.parent.getWorldScale(l),e.scale.copy(c).divide(l),e.visible=!0,e.updateWorldMatrix(!1,!0);let T=g.set(0,.157,0).applyMatrix4(e.matrixWorld);return{lift:s,travel:_,insertion:S,turn:C,lid:K(.69,.93,i),card:K(.93,1,i),keyTip:T.toArray(),socket:m.toArray(),axisError:1-Math.abs(new H(0,1,0).applyQuaternion(f).dot(h)),keyWorld:w.toArray()}},reset(){b=!1}}}function Je(e){let t=document.createElement(`canvas`);t.width=e?768:1280,t.height=e?432:720;let n=t.getContext(`2d`),r=t.width,i=t.height,a=!1,o=()=>{n.fillStyle=`#0a2030`,n.fillRect(0,0,r,i),n.strokeStyle=`#9acbdf`,n.lineWidth=r*.002,n.strokeRect(r*.035,i*.06,r*.93,i*.88),n.textBaseline=`top`,n.fillStyle=`#a8cada`,n.font=`500 ${r*.026}px "IBM Plex Sans",sans-serif`,n.fillText(`SNOWY STUDIOS`,r*.075,i*.14),n.fillStyle=`#edf8ff`,n.font=`500 ${r*.102}px "IBM Plex Sans",sans-serif`,n.fillText(`LootLabs`,r*.068,i*.36),n.fillStyle=`#a6dff6`,n.fillRect(r*.075,i*.66,r*.11,i*.006),n.font=`500 ${r*.025}px "IBM Plex Sans",sans-serif`,n.fillText(`CONTINUE VIA FLOWAUTH`,r*.075,i*.76),n.fillText(`01 / GATEWAY`,r*.7,i*.76)};o();let s=new j(t);s.colorSpace=f,s.anisotropy=4,document.fonts.load(`500 32px "IBM Plex Sans"`).then(()=>{a||(o(),s.needsUpdate=!0)},()=>{});let c=new F({color:`#c6a46e`,metalness:.75,roughness:.3}),l=new ee({map:s,roughness:.48,metalness:0}),d=new he;d.name=`free-access-card`;let p=new y(new A(1.9,1.07,.025),[c,c,c,c,l,c]);return p.castShadow=!0,d.add(p),d.visible=!1,{root:d,update(e){d.visible=e>1e-4&&e<.9999,d.position.set(0,u.lerp(.4,2.04,e),.15),d.rotation.x=-.08*e},dispose(){a=!0,p.geometry.dispose(),l.dispose(),c.dispose(),s.dispose(),d.clear()}}}function q(t){let i=t.querySelector(`.ice-scene`),a=t.dataset.geometryTrial,o=i.clientWidth>=900&&i.clientWidth/i.clientHeight>=1.25&&!r.lowPower,s=t.querySelector(`#ice-vault-canvas`),c=t.querySelector(`#ice-vault-action`),l=new AbortController,d=l.signal,p=matchMedia(`(prefers-reduced-motion: reduce)`),h=matchMedia(`(max-width:767px), (pointer:coarse)`),v=navigator.connection,C=!1,T=!0,E=!1,D=1,O=1,k,A=-1/0,j=-1/0,ie=0,F,I=!1,L=0,R=!1,z=0,se=!1,B=!1,V=!1,ue=!1,de=``,fe,pe=!1,ge=!1,ve=()=>{};new Promise(e=>{ve=e});let ye=0,be=-1,xe=NaN,Te=NaN,Oe=``,ke=!1,Ae=0,U=null,je=0,Me=async()=>{let e=new Set,t=t=>{t instanceof ne&&t.image&&!t.isRenderTargetTexture&&!(t instanceof ce)&&e.add(t)};t(W.background),t(tt),t(et),q?.startupTextures.forEach(t),W.traverse(e=>{if(e instanceof y)for(let n of Array.isArray(e.material)?e.material:[e.material])Object.values(n).forEach(t),`uniforms`in n&&Object.values(n.uniforms).forEach(e=>t(e.value))});let n=[];for(let t of e){let e=t.image;e?.decode&&n.push(e.decode().catch(()=>{}))}if(await Promise.all(n),!(C||E||!K)){for(let t of e)K.engine.initTexture(t);C||E||(i.dataset.uploadsReady=`true`,$())}},Pe,Fe=new Set,Ie=()=>{Fe.forEach(e=>{e.traverse(e=>{e instanceof y&&(e.geometry.dispose(),(Array.isArray(e.material)?e.material:[e.material]).forEach(e=>e.dispose()))}),e.clear()}),Fe.clear(),Pe?.dispose(),Pe=void 0},Le={collect:+(t.dataset.phase===`ready`)},Re=Number(t.dataset.progress)||0,ze={phase:t.dataset.phase||`waiting`,progress:Number(t.dataset.progress)||0,remaining:Number(t.dataset.remaining)||30,keyVisible:!1,canAct:!1},W=new g;W.background=new N(getComputedStyle(t).getPropertyValue(`--melt-floor`).trim()||`#ffffff`);let G=new m(40,1,.1,500),He=new H(0,3.1,0),Ge=new H(-8.004,.8,12.093);G.position.copy(He).add(Ge),G.lookAt(He);let K,q,J,Ye,Xe,Y,Ze,Qe,$e,X,Z,et,tt,nt=!1,rt=!1,Q,it,at,ot,st,ct,lt=()=>!(rt&&!nt||!Q?.image||!Z?.root.userData.posterReady&&!Z?.root.userData.videoReady),ut=()=>{if(i.dataset.chestLid=String(Y?.lid??0),i.dataset.chestCard=String(Y?.card??0),i.dataset.keyInsertion=String(Y?.insertion??0),i.dataset.keyTurn=String(Y?.turn??0),Y||(delete i.dataset.keyTip,delete i.dataset.keySocket,delete i.dataset.keyAxisError),q&&(i.dataset.keyWorld=q.key.getWorldPosition(new H).toArray().join(`,`)),i.dataset.collectProgress=Le.collect.toFixed(4),Y&&(i.dataset.chestLid=Y.lid.toFixed(4),i.dataset.chestCard=Y.card.toFixed(4),i.dataset.keyInsertion=Y.insertion.toFixed(4),i.dataset.keyTurn=Y.turn.toFixed(4),i.dataset.keyTip=Y.keyTip.join(`,`),i.dataset.keySocket=Y.socket.join(`,`),i.dataset.keyAxisError=String(Y.axisError)),i.dataset.chestReady=String(!!J),i.dataset.chestMaterialReady=String(J?.root.userData.materialReady??!1),i.dataset.chestMaterialError=String(J?.root.userData.materialError??!1),i.dataset.collecting=String(I),i.dataset.cameraPose=[...G.position.toArray(),...G.quaternion.toArray()].map(e=>e.toFixed(6)).join(`,`),i.dataset.renderCount=String(ie),i.dataset.ambientTime=L.toFixed(3),i.dataset.aurora=X?.state??`still`,i.dataset.auroraLook=`upper-local-v9`,i.dataset.auroraTexture=X?.textureVariant??`loading`,i.dataset.auroraGround=`off`,i.dataset.fire=Z?.root.userData.playing?`burning`:`still`,i.dataset.fireReady=String(Z?.root.userData.videoReady??!1),i.dataset.auroraReady=String(X?.ready??!1),i.dataset.fireVideoTime=String(Z?.video.currentTime??0),i.dataset.fireVideoDuration=String(Z?.video.duration??0),i.dataset.fireResolution=Z?[Z.video.videoWidth,Z.video.videoHeight].join(`x`):``,i.dataset.detailQuality=o?`enhanced`:`baseline`,i.dataset.auroraVideoTime=String(X?.time??0),i.dataset.meltProgress=ze.progress.toFixed(3),q){i.dataset.materialStudy=String(q.root.userData.materialStudy),i.dataset.materialReady=String(q.root.userData.materialReady);let e=q.root.userData.meltwater;i.dataset.waterArea=String(e?.area??0),i.dataset.waterVolume=String(e?.visualVolume??0),i.dataset.waterHeight=String(e?.filmHeight??0),i.dataset.waterTint=String(e?.tint??``),i.dataset.waterWetness=String(e?.wetness??0),i.dataset.waterRunoff=String(e?.runoffVisible??!1);let t=q.root.userData.meltVisual;i.dataset.iceTint=String(t?.iceTint??``),i.dataset.keyReveal=String(t?.keyReveal??0),i.dataset.glowAlpha=String(t?.glowAlpha??0),i.dataset.iceScale=String(t?.iceScale??0),i.dataset.iceOpacity=String(t?.iceOpacity??0)}K&&(i.dataset.triangles=String(K.engine.info.render.triangles),i.dataset.drawCalls=String(K.engine.info.render.calls))},dt=(e=`idle`)=>{X?.setActive(!1),Z?.pause(),k?.(),k=void 0,i.dataset.renderState=e,ut()},ft=()=>{C||E||(E=!0,R=!1,I=!1,F?.kill(),dt(`fallback`),s.hidden=!0,t.dataset.effectsPresented=`false`,t.dataset.stageFallback=`true`,t.dataset.meltStage=`fallback`,t.dataset.scenePresented=`false`,cancelAnimationFrame(z),t.dispatchEvent(new CustomEvent(`melt-key-fallback`)))},pt=()=>{if(!q||ze.phase!==`available`||E)return;q.root.updateMatrixWorld(!0),G.updateMatrixWorld(!0);let e=new le().setFromObject(q.key),t=1/0,n=1/0,r=-1/0,i=-1/0;for(let a of[e.min.x,e.max.x])for(let o of[e.min.y,e.max.y])for(let s of[e.min.z,e.max.z]){let e=new H(a,o,s).project(G),c=(e.x*.5+.5)*D,l=(-e.y*.5+.5)*O;t=Math.min(t,c),r=Math.max(r,c),n=Math.min(n,l),i=Math.max(i,l)}let a=Math.max(44,r-t+24),o=Math.max(44,i-n+24);Object.assign(c.style,{left:`${Math.max(0,Math.min(D-a,(t+r-a)/2))}px`,top:`${Math.max(0,Math.min(O-o,(n+i-o)/2))}px`,width:`${Math.min(D,a)}px`,height:`${Math.min(O,o)}px`,borderRadius:`24px`})},mt=new H,ht=-1/0,gt=-1/0,_t=16,vt=96,yt=!0,bt=()=>{if(!Ye||ze.phase!==`ready`||Le.collect>=1&&!I&&!yt)return;yt=!1,Ye.root.getWorldPosition(mt),mt.project(G);let e=i.getBoundingClientRect();i.dataset.cardOrigin=`${(e.left+(mt.x*.5+.5)*D).toFixed(1)},${(e.top+(-mt.y*.5+.5)*O).toFixed(1)}`;let t=Math.min(D<700?280:320,D-32),n=u.clamp((mt.x*.5+.5)*D,Math.min(D-t/2-16,_t+t/2),D-t/2-16),r=u.clamp((-mt.y*.5+.5)*O-18,vt,O-100);(Math.abs(n-ht)>.5||Math.abs(r-gt)>.5)&&(i.style.setProperty(`--loot-x`,`${n.toFixed(1)}px`),i.style.setProperty(`--loot-y`,`${r.toFixed(1)}px`),i.dataset.lootAnchor=`${n.toFixed(1)},${r.toFixed(1)}`,ht=n,gt=r)},xt=e=>{R?dt(e):(fe?.render(L,T,!p.matches),T||dt(e))},St=()=>{if(C||E||!T&&se||document.hidden||!K)return;if(!q||!B){xt(`effects-first`);return}if(!R&&U){let e=K.engine.getContext(),t=e.clientWaitSync(U,0,0);e.deleteSync(U),U=null,t===e.WAIT_FAILED?i.dataset.gpuWarmup=`frame-fallback`:(Ae++,i.dataset.gpuWarmup=`fence-complete`)}let e=p.matches&&ze.phase===`waiting`?Re:ze.progress;G.updateMatrixWorld(),X?.setCamera(G);let n=u.smoothstep(Le.collect,.46,.72);if((e!==xe||Le.collect!==Te||ze.phase!==Oe||ye!==be)&&(yt=!0,q.update(e,n),J&&Ye&&Xe&&(ze.phase===`ready`?(Y=Xe.apply(Le.collect),J.update(Y.lid),Ye.update(Y.card)):(J.update(0),Ye.update(0),Y=void 0)),xe=e,Te=Le.collect,Oe=ze.phase,be=ye,$e&&($e.shadow.needsUpdate=!0)),ot?.update(e,n,L),Z?.setMotion(!p.matches),!lt()){xt(`loading`);return}ke||(ke=!0,Me().catch(ft));let r=String(!!Z?.root.userData.videoReady)+`:`+String(p.matches)+`:`+(ze.phase===`ready`?`open`:`ice`);if(!R&&de!==r&&(de=r,Ae=0,U&&=(K.engine.getContext().deleteSync(U),null)),V=!0,!V){if(!ue){ue=!0;let e=r;K.engine.toneMapping=K.toneMapping,K.engine.toneMappingExposure=K.toneMappingExposure,K.engine.outputColorSpace=K.outputColorSpace;let t=K.engine,n=new he,i=new he,a=new Set;W.traverse(e=>{if(!(e instanceof y)||e===q.floor||(e===q.ice||e.name===`surface-hoar`)&&!e.visible)return;let t=Array.isArray(e.material)?e.material[0]:e.material;a.has(t)||(a.add(t),i.add(e.clone(!1))),e!==q.ice&&e.name!==`surface-hoar`&&(e.name===`user-original-aurora`||e.name===`snow-terrain`||ot&&e.parent===ot.root)&&n.add(e.clone(!1))}),(async()=>{let e=Promise.resolve();if(Ze&&q.ice.visible){let r=t.getRenderTarget(),i=t.getActiveCubeFace(),a=t.getActiveMipmapLevel(),o=t.toneMapping;try{t.setRenderTarget(Ze),t.toneMapping=0,e=t.compileAsync(n,G,W)}finally{t.setRenderTarget(r,i,a),t.toneMapping=o}}let r=t.compileAsync(i,G,W);await Promise.all([e,r])})().then(()=>{ue=!1,!(C||E)&&(V=e===String(!!Z?.root.userData.videoReady)+`:`+String(p.matches)+`:`+(ze.phase===`ready`?`open`:`ice`),$())}).catch(()=>ft())}xt(`compiling`)}else{if(X?.setActive(T&&!p.matches),X?.update(L),Z?.setMotion(!p.matches),Z?.update(L,G,T&&!p.matches),Z){let e=D<700&&J?Math.max(1,J.root.scale.x):1;Z.light.distance=14*e;let t=1+.18*Math.sin(L*6.7)+.12*Math.cos(L*11.3)+.06*Math.sin(L*23.1);Z.light.intensity=(D<700?5:o?9:14)*e*e*t}K.render(W,G),ie++,!R&&Q?.image&&q&&(R=!0,t.dataset.scenePresented=`true`,t.dataset.meltStage=`ready`,t.dataset.effectsPresented=`true`,t.dispatchEvent(new CustomEvent(`melt-key-ready`)),p.matches||Z?.loadVideo()),T?(R&&!p.matches&&Z?.loadVideo(),pt(),bt()):(se=!0,i.dataset.prewarmed=`true`,X?.setActive(!1),Z?.pause(),i.dataset.renderState=`prewarmed`,ut())}},Ct=e=>{if(C||E||!T||document.hidden){dt(`paused`);return}let t=r.getFrameInterval();e-A+1e-5<t||((R||ge)&&!p.matches&&Number.isFinite(A)&&(L+=Math.min(e-A,.1)),A=e,St(),e-j>.25&&(ut(),j=e),p.matches&&!I&&R&&dt())},wt=()=>{C||E||!T||document.hidden||k||(i.dataset.renderState=`active`,A=-1/0,k=e(Ct))},$=()=>{C||E||je||(je=requestAnimationFrame(()=>{je=0,!(C||E)&&(St(),wt())}))},Tt=e=>{let t=`/assets/realistic-winter/winter-camp-${e?`portrait-v5`:`landscape-v3`}.webp`,n=new ne;if(typeof createImageBitmap<`u`)new me().setOptions({imageOrientation:`flipY`,premultiplyAlpha:`none`,colorSpaceConversion:`default`}).load(t,e=>{C?e.close():(n.image=e,n.needsUpdate=!0,i.dataset.background=`photographic-winter`,Et())},void 0,ft),n.flipY=!1;else{let e=new b().load(t,()=>{C?e.dispose():(n.image=e.image,n.needsUpdate=!0,i.dataset.background=`photographic-winter`,Et())},void 0,ft)}return n.colorSpace=f,n},Et=()=>{if(C||E||!K)return;R||(Ae=0,U&&=(K.engine.getContext().deleteSync(U),null)),ye++,cancelAnimationFrame(z),z=0;let e=i.getBoundingClientRect();D=Math.max(1,e.width),O=Math.max(1,e.height);let n=t.querySelector(`.ice-copy`)?.getBoundingClientRect();_t=n&&D>=900?Math.max(16,n.right-e.left+16):16,vt=n&&D>=700&&D<900?Math.min(O-100,n.bottom-e.top+100):96;let a=r.getDPR();K.setPixelRatio(a),K.setSize(D,O),K.engine.transmissionResolutionScale=r.lowPower?.5:1,i.dataset.transmissionScale=String(K.engine.transmissionResolutionScale),i.dataset.qualityDpr=String(a),i.dataset.qualityTier=r.lowPower?`mobile`:`desktop`;let s=D/O<1.25,c=D<900||s||matchMedia(`(pointer:coarse) and (max-width:1366px)`).matches,l=c&&!s&&D>=900,u=D<700;q?.setNaturalClarity(u),rt=c,u?nt=!0:rt&&!tt&&(tt=new b().load(`/assets/quality-v3/snow-restored.webp`,e=>{C?e.dispose():(nt=!0,Se(e,rt,D<700),i.dataset.phoneSnow=rt?`laptop-plate`:`inactive`,$())},void 0,()=>{C||(nt=!0,i.dataset.phoneSnow=`unavailable`,$())}),tt.colorSpace=f),Se(tt,rt,u),i.dataset.phoneSnow=rt&&tt?.image?`laptop-plate`:`inactive`,X&&(X.lighting.uAuroraGroundStrength.value=0),i.dataset.auroraGround=`off`,i.dataset.campFraming=c?`close`:`laptop`,s&&!at&&(at=Tt(!0)),!s&&!it&&(it=Tt(!1));let d=s?at:it;if(d&&d!==Q&&(Q=d,W.background=Q,ot?.setBackground(Q)),Q?.image){let e=Q.image,t=e.width/e.height,n=D/O,r=D>=900&&!s,i=s?0:r?.12:.05;if(Q.repeat.set(Math.min(1,n/t)*(1-i),Math.min(1,t/n)*(1-i)),Q.offset.set((1-Q.repeat.x)/2-i/2,(1-Q.repeat.y)/2),Q.userData.closeCamp=r,Q.userData.highDetail=o&&!s,Q.userData.integratedPhone=u,c){let e=u||s?.51:.7,t=u?.88:s?.82:l?.86:.79,n=e*Q.repeat.x+Q.offset.x,r=1-((1-t)*Q.repeat.y+Q.offset.y),i=u?2.4:l?1.65:2;Q.userData.compactPit={x:n,y:r,zoom:i},Ce(n,r,i,s)}else delete Q.userData.compactPit,Ce();Q.updateMatrix(),X?.setCrop(Q,s),Z?.setComposition(Q,s)}!R||Q?.image&&X?.ready||(Ae=0,U&&=(K.engine.getContext().deleteSync(U),null),ke=!1,R=!1,t.dataset.scenePresented=`false`,t.dataset.meltStage=`loading`,document.dispatchEvent(new CustomEvent(`melt-key-poster-state`,{detail:ze.phase}))),G.aspect=D/O;let p=Math.max(1,1.5/G.aspect),m=He.clone();!s&&D>=900?m.addScaledVector(new H(.834,0,.552),-2.6):!s&&D>=700&&m.addScaledVector(new H(.834,0,.552),-.8);let h=Ge.clone();if(s&&(m.y=4.2,h.y=-.8),G.position.copy(m).addScaledVector(h,p),G.lookAt(m),G.updateProjectionMatrix(),G.updateMatrixWorld(),q&&J&&st&&(q.root.position.copy(st.icePosition),q.root.scale.setScalar(st.iceScale),J.root.position.copy(st.chestPosition),J.root.scale.setScalar(st.chestScale),J.root.rotation.y=-.18,q.root.rotation.y=u?.1:-.24,c)){let e=(e,t,n,r,i,a)=>{let o=new w;o.setFromCamera(new M(t*2-1,1-n*2),G);let s=o.ray.intersectPlane(new _(new H(0,1,0),.01),new H);if(s){e.position.copy(s),e.scale.setScalar(1);for(let t=0;t<2;t++){e.updateMatrixWorld(!0);let t=1/0,n=-1/0;for(let r of[-i,i])for(let i of[-a,a]){let a=new H(r,0,i).applyMatrix4(e.matrixWorld).project(G);t=Math.min(t,a.x),n=Math.max(n,a.x)}e.scale.multiplyScalar(r*2/Math.max(.001,n-t))}}};e(J.root,u?.185:s?.2:.5,u?.83:s?.81:l?.78:.8,u?.35:s?.26:l?.19:.27,1.65,.95),e(q.root,u?.83:s?.82:l?.88:.86,u?.83:s?.81:l?.78:.8,u?.28:s?.22:l?.15:.22,1,1)}if(q&&J&&st){let e=(e,t,n,r,a)=>{let o=i.querySelector(e);if(!o)return;t.updateWorldMatrix(!0,!1);let s=1/0,c=-1/0,l=1/0,u=-1/0;for(let e of[-n,n])for(let n of[0,a])for(let i of[-r,r]){let r=new H(e,n,i).applyMatrix4(t.matrixWorld).project(G),a=(r.x*.5+.5)*D,o=(-r.y*.5+.5)*O;s=Math.min(s,a),c=Math.max(c,a),l=Math.min(l,o),u=Math.max(u,o)}Object.assign(o.style,{left:`${s}px`,top:`${l}px`,width:`${c-s}px`,height:`${u-l}px`,transform:`none`})};e(`.winter-skeleton-chest`,J.root,1.65,.95,1.25),e(`.winter-skeleton-ice`,q.root,1,1,2)}if(Z&&Q?.image){if(s){let e=u?.878:.818,t=new w;t.setFromCamera(new M(1.016-1,1-e*2),G);let n=t.ray.intersectPlane(new _(new H(0,1,0),-.025),new H);if(n){Z.root.position.copy(n),Z.mesh.position.y=.2;let e=n.clone().project(G),t=n.clone().add(new H(0,1,0)).project(G),r=(u?.138:.145)*2/Math.abs(t.y-e.y);Z.root.scale.setScalar(r),Z.setExposure(1.4)}}else{Z.mesh.position.y=.32;let e=De(!1,D>=900&&!s,Q.userData.compactPit),t=(1-(e.y+(e.originalBaseY-e.canonicalY)*e.scale)-Q.offset.y)/Q.repeat.y*2-1,n=(e.x-Q.offset.x)/Q.repeat.x*2-1,r=new w;r.setFromCamera(new M(n,t),G);let i=r.ray.intersectPlane(new _(new H(0,1,0),-.025),new H);if(i){Z.root.position.copy(i);let t=i.clone().project(G),n=i.clone().add(new H(0,1,0)).project(G),r=e.originalHeight*e.scale/Q.repeat.y*2/Math.abs(n.y-t.y);Z.root.scale.setScalar(r*1.12),Z.setExposure(1.3)}}}if($e&&J&&q){let e=u?Math.max(1,J.root.scale.x,q.root.scale.x):1,t=u?J.root.position.clone().add(q.root.position).multiplyScalar(.5):new H;$e.target.position.copy(t),$e.target.updateMatrixWorld(),$e.position.copy(t).add(new H(-8,12,4).multiplyScalar(e));let n=$e.shadow.camera,r=u?Math.max(3.5,J.root.position.distanceTo(q.root.position)*.5+2):15;Object.assign(n,{left:-r,right:r,top:u?r:11,bottom:u?-r:-11,near:.1,far:45*e}),n.updateProjectionMatrix(),$e.shadow.normalBias=.008*e,$e.shadow.needsUpdate=!0}$();let g=e=>{if(!e)return null;let t=e.getWorldPosition(new H).project(G);return[+(t.x*.5+.5).toFixed(5),+(-t.y*.5+.5).toFixed(5)]};i.dataset.layoutAnchors=JSON.stringify({ice:g(q?.root),fire:g(Z?.root),chest:g(J?.root)})};t.addEventListener(`melt-key-state`,e=>{let r=e.detail;if(!r||C)return;let i=ze.phase,a=ze.progress;ze=r,p.matches&&r.phase===`waiting`&&(i!==`waiting`||r.progress<a)&&(Re=r.progress),r.phase===`ready`&&i!==`ready`?(F?.kill(),q?.update(1,0),Xe?.begin(),I=!p.matches&&R,t.dataset.unlocking=String(I),I?F=n.to(Le,{collect:1,duration:4.4,ease:`none`,onUpdate:wt,onComplete:()=>{I=!1,F=void 0,t.dataset.unlocking=`false`,$(),ut(),t.dispatchEvent(new CustomEvent(`melt-key-reveal-complete`))}}):(Le.collect=1,t.dispatchEvent(new CustomEvent(`melt-key-reveal-complete`)))):r.phase!==`ready`&&i===`ready`&&(cancelAnimationFrame(z),z=0,R=!1,V=!1,Ae=0,de=``,U&&K&&K.engine.getContext().deleteSync(U),U=null,t.dataset.scenePresented=`false`,t.dataset.meltStage=`loading`,document.dispatchEvent(new CustomEvent(`melt-key-poster-state`,{detail:r.phase})),I=!1,F?.kill(),F=void 0,Le.collect=0,Xe?.reset(),t.dataset.unlocking=`false`,Y=void 0),i===r.phase?r.phase===`waiting`&&!p.matches&&wt():$()},{signal:d}),s.addEventListener(`webglcontextlost`,e=>{e.preventDefault(),ft()},{signal:d}),document.addEventListener(`visibilitychange`,()=>{document.hidden?(F?.pause(),dt(`paused`)):(T&&F?.resume(),$())},{signal:d}),window.addEventListener(`pageshow`,$,{signal:d}),window.addEventListener(`resize`,Et,{passive:!0,signal:d}),h.addEventListener(`change`,Et,{signal:d}),v?.addEventListener(`change`,Et,{signal:d}),p.addEventListener(`change`,()=>{p.matches&&(Re=ze.progress,I=!1,F?.kill(),F=void 0,ze.phase===`ready`&&(Le.collect=1,t.dataset.unlocking=`false`,t.dispatchEvent(new CustomEvent(`melt-key-reveal-complete`)))),$()},{signal:d});let Dt=new ResizeObserver(Et);Dt.observe(i);let Ot=new IntersectionObserver(([e])=>{T=e.isIntersecting,T?(document.hidden||F?.resume(),$()):(F?.pause(),dt(`paused`))},{threshold:.01});return Ot.observe(i),(async()=>{try{et=new b().load(`/assets/quality-v3/camp-detail.webp`,e=>{C?e.dispose():(e.colorSpace=f,we(e),$())}),et.colorSpace=f,et.anisotropy=8,K=new _e(s,{antialias:!0}),K.toneMapping=4,K.toneMappingExposure=.95,W.background=new N(463649);let e=i.clientWidth/i.clientHeight<1.25;e?at=Tt(!0):it=Tt(!1),Q=e?at:it,W.background=Q,X=We({lowPower:r.lowPower,maxTextureSize:K.engine.capabilities.maxTextureSize,onReady:$,onError:ft,intensity:.62}),W.add(X.root),X.lighting.uAuroraGroundStrength.value=0,Z=Ke({deferVideo:!0,poster:`/assets/quality-v1/fire-hd-poster.webp`,onReady:()=>{se=!1,$()},onError:()=>{Z?.root.userData.posterError&&Z?.root.userData.videoError&&ft()}}),W.add(Z.root),ct={enabled:K.engine.shadowMap.enabled,type:K.engine.shadowMap.type},K.engine.shadowMap.enabled=!0,K.engine.shadowMap.type=1;let n=new re(7904196,1977664,.35);W.add(n);let o=new P(10927584,.55);o.position.set(-8,12,4),o.castShadow=!0,$e=o,W.add(o.target),o.shadow.autoUpdate=!1,o.shadow.needsUpdate=!0,o.shadow.mapSize.set(r.lowPower?512:1024,r.lowPower?512:1024),Object.assign(o.shadow.camera,{left:-15,right:15,top:11,bottom:-11,near:.1,far:45}),o.shadow.radius=r.lowPower?2.25:4.5,o.shadow.bias=-15e-5,o.shadow.normalBias=.008,W.add(o);let c=new P(7903422,.26);c.position.set(4,2.8,1.5),W.add(c);let l=new P(7445451,.32);if(l.position.set(1,4,-3),W.add(l),Et(),$(),X.lighting.uAuroraGroundStrength.value=0,i.dataset.auroraDiffuse=`off`,pe=!0,fe=Ee({surface:K,scene:W,camera:G,sky:X,fire:Z,background:()=>Q,ready:()=>pe&&(!rt||nt),hidden:()=>[q?.root,J?.root,ot?.root],irradiance:()=>{},onReady:$,onError:ft,onFirst:e=>{ge=!0,t.dataset.effectsPresented=`true`,i.dataset.effectsFirstFrameAt=String(performance.now()),i.dataset.effectsGpuWarmup=e,ve(),$()}}),$(),await new Promise(e=>requestAnimationFrame(()=>requestAnimationFrame(()=>e()))),C||E||(await Ne(32),C||E))return;q=Be(32,3,$,ft,{highDetail:!1,naturalClarity:i.clientWidth<700,compactGeometry:!0}),W.add(q.root);let d=new H(.834,0,.552),p=new H(-.552,0,.834),m=i.clientWidth>=900&&i.clientWidth/i.clientHeight>=1.25;q.root.position.copy(d).multiplyScalar(m?-2.6+.58*Math.tan(u.degToRad(20))*(14.5*Math.max(1,1.5/(i.clientWidth/i.clientHeight))-1.2)*(i.clientWidth/i.clientHeight):4.9).addScaledVector(p,m?1.2:-5.2),q.root.scale.setScalar(m?.7:1.2),q.root.rotation.y=-.24,q.root.position.y=-.01;let h=q.floor.material.onBeforeCompile;if(q.floor.material.onBeforeCompile=(e,t)=>{h(e,t),e.fragmentShader=e.fragmentShader.replace(`return .94*(1.-.12*pow`,`return .7332*(1.-.12*pow`).replace(`vec2 iceCenter(){return vec2(0.);}`,`vec2 iceCenter(){return vec2(${q.root.position.x.toFixed(6)},${q.root.position.z.toFixed(6)});}`).replace(`.44+.56*contact`,`.44+.56*max(contact,1.-smoothstep(1.4,2.2,length(vShadowFloor-vec2(${J.root.position.x.toFixed(6)},${J.root.position.z.toFixed(6)}))))`)},q.floor.visible=!1,q.floor.material.customProgramCacheKey=()=>`snowy-chest-layout-contact-v2`,J=Ve({highDetail:!1,lowPower:!0,compactGeometry:!1,onReady:$,onError:ft}),J.root.position.copy(d).multiplyScalar(m?-3.45:-1.8).addScaledVector(p,m?.8:-5.2),J.root.position.y=-.01,J.root.rotation.y=-.18,J.root.scale.setScalar(m?.9:1.08),W.add(J.root),a){let e=0,n=0;for(let t of[J.root,q.key])t.traverse(t=>{if(!(t instanceof y))return;let r=t.geometry.getAttribute(`position`).count;n+=r,e+=(t.geometry.index?.count??r)/3*(t instanceof S?t.count:1)});t.dataset.trialPropTriangles=String(e),t.dataset.trialPropVertices=String(n)}if(C||E)return;st={icePosition:q.root.position.clone(),iceScale:q.root.scale.x,chestPosition:J.root.position.clone(),chestScale:J.root.scale.x},ot=Ue(Q,J.root,q.root,Z.root,X.lighting,void 0),W.add(ot.root),Ye=Je(r.lowPower),J.root.add(Ye.root),Xe=qe(q.key,J.keySocket),ze.phase===`ready`&&(q.update(1,0),Xe.begin());let _=Pe=new ae(K.engine),v=new g;Fe.add(v),v.background=new N(.035,.065,.1);for(let[e,t,n,r,i]of[[-4,4,5.5,3,1.1],[4,5,-3,2.8,.6],[-4,2.8,-5,2.4,.8]]){let a=new y(new te(r,24,16),new oe({color:new N(1,.98,.95).multiplyScalar(i),toneMapped:!1}));a.position.set(e,t,n),v.add(a)}let w=new y(new x(3.5,4.5),new oe({color:new N(1,.97,.88).multiplyScalar(.75),side:2,toneMapped:!1}));w.position.set(3.8,2.8,5.5),w.lookAt(0,1,0),v.add(w);let T=new y(new x(5,3),new oe({color:new N(1,.87,.68).multiplyScalar(.9),side:2,toneMapped:!1}));if(T.position.set(-4,-1.8,6),T.lookAt(0,.7,0),v.add(T),C||E)return;Ze=Qe=_.fromScene(v,.055),W.environment=Ze.texture,J.root.traverse(e=>{if(e instanceof y)for(let t of Array.isArray(e.material)?e.material:[e.material])t instanceof ee&&(t.envMap=Ze.texture,t.envMapIntensity=t.metalness>.5?.75:.45)}),Ie(),B=!0,i.dataset.composition=`chest-left-fire-front-ice-right-v2`,i.dataset.chest=`walnut`,i.dataset.camera=`perspective-fixed`,i.dataset.viewAngle=`0`,i.dataset.renderer=`three-webgl`,Et(),$()}catch(e){ft(),console.warn(`Melt key visual unavailable; native controls remain usable.`,e)}finally{Ie()}})(),()=>{C||(C=!0,Ie(),cancelAnimationFrame(z),cancelAnimationFrame(0),cancelAnimationFrame(je),U&&K&&K.engine.getContext().deleteSync(U),U=null,I=!1,F?.kill(),dt(),l.abort(),Dt.disconnect(),Ot.disconnect(),fe?.dispose(),Se(),tt?.dispose(),Ce(),we(),et?.dispose(),ot?.dispose(),X?.dispose(),Z?.dispose(),it?.dispose(),at?.dispose(),Ye?.dispose(),J?.dispose(),q?.dispose(),W.traverse(e=>{e instanceof P&&e.shadow.dispose()}),W.environment=null,Ze?.dispose(),Qe?.dispose(),K&&ct&&(K.engine.shadowMap.enabled=ct.enabled,K.engine.shadowMap.type=ct.type),K?.dispose(),W.clear())}}var J=ve,Ye=`snowy:free-key:melt:v1`,Xe=/^SNOWY-FREE-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}-\d{4}$/,Y=e=>typeof e==`number`&&Number.isSafeInteger(e)&&e>=0&&e<=864e13,Ze=(e,t)=>e.version===1&&Y(t)&&Y(e.startedAt)&&e.startedAt<=t,Qe=(e,t)=>Ze(e,t)&&e.key===null&&e.unlockedAt===null,$e=(e,t)=>Ze(e,t)&&!e.pending&&typeof e.key==`string`&&Xe.test(e.key)&&Y(e.unlockedAt)&&e.unlockedAt>=e.startedAt+J&&e.unlockedAt<=t&&t-e.unlockedAt<864e5;function X(e){if(!Y(e))throw RangeError(`A valid timestamp is required to start the melt.`);return{version:1,startedAt:e,key:null,unlockedAt:null}}function Z(e){return{...X(e),pending:!0}}function et(e,t){return e.pending?X(t):e}function tt(e,t){let n=$e(e,t),r=!e.pending&&(n||Qe(e,t))?t-e.startedAt:0,i=Math.min(1,Math.max(0,r/J)),a=n?`ready`:i===1?`available`:`waiting`;return{phase:a,remaining:Math.max(0,Math.ceil((J-r)/1e3)),progress:i,keyVisible:a!==`waiting`,canAct:a===`available`}}function nt(e,t,n=be){if(e.pending||!Qe(e,t)||t-e.startedAt<J)return e;let r=n();if(!Xe.test(r))throw Error(`The local pass generator returned an invalid pass.`);return{...e,key:r,unlockedAt:t}}function rt(e,t){return e.key!==null&&!$e(e,t)}function Q(e,t,n=!1){let r=()=>n?Z(t):X(t);if(!Y(t)||!e)return r();try{let n=JSON.parse(e);if(!n||typeof n!=`object`||Array.isArray(n))return r();let i=n;return i.pending!==void 0&&i.pending!==!0||i.pending&&(i.key!==null||i.unlockedAt!==null)||!Qe(i,t)&&!$e(i,t)?r():{version:1,startedAt:i.startedAt,key:i.key,unlockedAt:i.unlockedAt,...i.pending?{pending:!0}:{}}}catch{return r()}}var it=new URLSearchParams(location.search).get(`ice-study`),at=it&&/^[1-4]$/.test(it)?`${Ye}:study:${it}`:Ye,ot;function st(){ot?.(),ot=void 0,new t;let a=new i,o=new AbortController,{signal:s}=o,c=document.getElementById(`key-access`),l=new URLSearchParams(location.search).get(`geometry-trial`),u=l===`compact`?`Compact geometry`:`Current geometry`,d;(l===`baseline`||l===`compact`)&&(c.dataset.geometryTrial=l,delete c.dataset.trialSceneMs,d=document.createElement(`output`),d.className=`key-geometry-trial`,d.textContent=u+` · Loading live scene…`,c.append(d)),delete c.dataset.stageFallback,delete c.dataset.meltStage;let f=c.querySelector(`#ice-vault-canvas`);if(f){if(f.dataset.renderMode){let e=f.cloneNode(!1);delete e.dataset.renderMode,e.hidden=!1,f.replaceWith(e)}else f.hidden=!1}c.dataset.scenePresented=`false`,c.dataset.effectsPresented=`false`;let p=c.querySelector(`.ice-loading-note`);p&&(p.hidden=!0);let m=document.getElementById(`ice-vault-action`);m.setAttribute(`aria-label`,`Unlock the box with the key`);let h=document.getElementById(`reset-key-btn`);document.getElementById(`lootlabs-link`);let g=c.querySelector(`.loot-reward-surface`),_=document.getElementById(`key-result`),ee=document.getElementById(`key-reward-slot`),v=c.querySelector(`.ice-scene`),y=()=>{if(c.dataset.stageFallback!==`true`)return;let e=v.getBoundingClientRect(),t=c.querySelector(`.ice-copy`).getBoundingClientRect(),n=Math.min(e.width<700?280:320,e.width-32),r=e.width>=900?Math.min(e.width-n/2-16,t.right-e.left+16+n/2):0,i=e.width>=700&&e.width<900?Math.min(e.height-100,t.bottom-e.top+100):0;v.style.setProperty(`--fallback-reward-min-x`,r+`px`),v.style.setProperty(`--fallback-reward-min-y`,i+`px`)};window.addEventListener(`resize`,y,{passive:!0,signal:s}),ee.appendChild(_);let b=document.getElementById(`key-countdown`),x=document.getElementById(`key-clock-unit`),S=c.querySelector(`.ice-clock-label`),C=document.getElementById(`key-progress`),w=document.getElementById(`key-status-title`),T=document.getElementById(`key-status-description`),E=document.getElementById(`key-announcement`),te=document.getElementById(`ice-gesture`),D=matchMedia(`(prefers-reduced-motion: reduce)`),ne=null;try{ne=sessionStorage.getItem(at)}catch{}let O=Q(ne,Date.now(),!0),k,re,A=!1,j=!0,M,N=!1,ie=-1/0,P=-1/0,ae=-1,F,oe,I,L=e=>{E.textContent=e},R=()=>{try{sessionStorage.setItem(at,JSON.stringify(O))}catch{}},z=()=>{k?.(),k=void 0},se=(e=tt(O,Date.now()))=>{c.dispatchEvent(new CustomEvent(`melt-key-state`,{detail:e}))},B=e=>{let t=e.phase===`ready`?N?`…`:`✓`:String(e.remaining).padStart(2,`0`),n=e.phase===`ready`?N?``:`OPEN`:`SEC`,r=e.phase===`waiting`?`MELTING`:e.phase===`available`?`KEY READY`:N?`UNLOCKING`:`VAULT OPEN`;b.textContent!==t&&(b.textContent=t),x.textContent!==n&&(x.textContent=n),S.textContent!==r&&(S.textContent=r)},V=(e=tt(O,Date.now()))=>{let t=M;M=e.phase,c.dataset.phase=M,document.dispatchEvent(new CustomEvent(`melt-key-poster-state`,{detail:M})),c.dataset.remaining=String(e.remaining),c.dataset.progress=String(e.progress),c.dataset.canAct=String(e.canAct),m.hidden=!0,m.disabled=!0,c.dataset.rewardPending=String(N),_.hidden=h.hidden=M!==`ready`||N,C.hidden=M!==`waiting`,C.value=e.progress*30,B(e),w.textContent=M===`waiting`?`1. Wait for the ice to melt.`:M===`available`?`2. Your key is ready.`:N?`Opening the box...`:`3. Your access is ready.`,T.textContent=M===`waiting`?`The key will open the box automatically when the ice melts.`:M===`available`?`The key will unlock the box automatically.`:N?`Your key is opening the vault. Your access card will arrive here.`:`Continue through LootLabs and follow the steps to get your free key.`,te.textContent=M===`waiting`?`Watch the ice melt. The key opens your reward automatically.`:T.textContent,t!==M&&(F?.kill(),c.dataset.phaseMotion=`idle`,n.set(g,{clearProps:`opacity,visibility,transform`}),_.inert=!1,M===`available`?L(`The key is free. The box will open automatically.`):M===`ready`&&L(N?`Opening your reward.`:`The LootLabs gateway is ready. Continue via FlowAuth to get your key.`)),se(e)},ce=(e=!0)=>{if(!A&&N&&M===`ready`){if(N=!1,c.dataset.unlocking=`false`,V(),e&&!D.matches&&c.dataset.stageFallback!==`true`){F?.kill(),c.dataset.phaseMotion=`active`;let e=_.getBoundingClientRect(),t=(v.dataset.cardOrigin??``).split(`,`).map(Number),r=t.length===2&&t.every(Number.isFinite);_.inert=!0,F=n.timeline({onComplete:()=>{c.dataset.phaseMotion=`idle`,_.inert=!1}}).fromTo(g,{opacity:.2,transformOrigin:`50% 50%`,x:r?t[0]-e.left-e.width/2:0,y:r?t[1]-e.top-e.height/2:22,scale:r?.25:.86},{opacity:1,x:0,y:0,scale:1,duration:1.1,ease:`power3.inOut`,clearProps:`opacity,transform,transformOrigin`})}L(`Your box is open. Your LootLabs access card is in the panel.`)}};c.addEventListener(`melt-key-reveal-complete`,()=>ce(),{signal:s});let le=()=>{I&&clearTimeout(I);let e=()=>{if(A||!O.key||O.unlockedAt===null)return;let t=O.unlockedAt+ye-Date.now();t>0?I=setTimeout(e,t):(pe(),L(`Your previous key has expired. A new cube is melting.`))};O.key&&O.unlockedAt!==null&&(I=setTimeout(e,Math.max(0,O.unlockedAt+ye-Date.now())))},ue=(e=0)=>{if(A)return;if(rt(O,Date.now())){pe(),L(`Your previous key has expired. A new cube is melting.`);return}let t=tt(O,Date.now());t.phase===`available`&&j&&!document.hidden&&me()?he():(t.phase!==M&&(V(t),t.phase!==`waiting`&&z()),B(t),t.remaining!==ae&&(ae=t.remaining,c.dataset.remaining=String(t.remaining),t.phase===`waiting`&&t.remaining>0&&t.remaining%10==0&&L(`${t.remaining} seconds until your key is free.`)),(e===0||e-P>=.1||t.progress===1)&&(C.value=t.progress*30,c.dataset.progress=String(t.progress),P=e),se(t))},H=()=>{O.pending||k||document.hidden||!j||tt(O,Date.now()).phase!==`waiting`||(ie=-1/0,k=e(e=>{let t=D.matches?.25:r.getFrameInterval();e-ie+1e-4<t||(ie=e,ue(e))}))},de=()=>{if(oe&&clearTimeout(oe),O.pending)return;let e=()=>{if(A||O.key)return;let t=O.startedAt+J-Date.now();t>0?oe=setTimeout(e,Math.max(1,t)):ue()};tt(O,Date.now()).phase===`waiting`&&(oe=setTimeout(e,Math.max(1,O.startedAt+J-Date.now())))};function fe(){!A&&O.pending&&!document.hidden&&j&&(O=et(O,Date.now()),ae=-1,P=ie=-1/0,R(),V(),ue(),H(),de())}function pe(){let e=document.activeElement===h;if(z(),oe&&clearTimeout(oe),I&&clearTimeout(I),F?.kill(),N=!1,c.dataset.unlocking=`false`,O=Z(Date.now()),ae=-1,P=ie=-1/0,R(),V(),ue(),H(),de(),fe(),L(`A fresh cube. Your 30-second melt has started.`),e){let e=document.getElementById(`ice-title`);e.setAttribute(`tabindex`,`-1`),e.focus({preventScroll:!0})}}function me(){return!A&&!document.hidden&&j&&(c.dataset.scenePresented===`true`||c.dataset.stageFallback===`true`)}function he(){if(!me())return;let e=nt(O,Date.now());e!==O&&(N=!D.matches&&c.dataset.meltStage===`ready`&&c.dataset.stageFallback!==`true`,O=e,R(),V(),z(),le())}h.addEventListener(`click`,pe,{signal:s});let ge=()=>{fe(),ue(),H(),de(),le()};document.addEventListener(`visibilitychange`,()=>{document.hidden?(z(),F?.pause()):(j&&F?.resume(),ge())},{signal:s}),window.addEventListener(`pageshow`,ge,{signal:s}),D.addEventListener(`change`,()=>{D.matches&&(F?.kill(),c.dataset.phaseMotion=`idle`,n.set(g,{clearProps:`opacity,visibility,transform`}),_.inert=!1,ce(!1)),ue()},{signal:s});let _e=new IntersectionObserver(([e])=>{j=e.isIntersecting,j?(document.hidden||F?.resume(),fe(),ue(),H()):(z(),F?.pause())},{threshold:.01});_e.observe(c);let ve=document.getElementById(`key-menu-toggle`),be=document.getElementById(`key-sign-in`),xe=document.querySelector(`#key-sign-in-dialog`);be?.addEventListener(`click`,()=>xe?.showModal(),{signal:s});let Se=document.getElementById(`key-mobile-menu`),Ce=(e=!1)=>{Se&&ve&&(Se.hidden=!0,ve.setAttribute(`aria-expanded`,`false`),e&&ve.focus())};ve?.addEventListener(`click`,()=>{if(!Se)return;let e=Se.hidden;Se.hidden=!e,ve.setAttribute(`aria-expanded`,String(e))},{signal:s}),Se?.addEventListener(`click`,e=>{e.target.closest(`a`)&&Ce()},{signal:s}),document.addEventListener(`keydown`,e=>{e.key===`Escape`&&Se&&!Se.hidden&&Ce(!0)},{signal:s});let we=matchMedia(`(min-width:961px)`);we.addEventListener(`change`,()=>{we.matches&&Ce()},{signal:s});let Te=document.getElementById(`site-header`),Ee=({scroll:e})=>Te?.classList.toggle(`scrolled`,e>40);a.instance.on(`scroll`,Ee),Ee({scroll:window.scrollY});let De=()=>{if(A)return;c.dataset.stageFallback=`true`,c.dataset.meltStage=`fallback`,c.dataset.scenePresented=`false`,d&&!c.dataset.trialSceneMs&&(d.textContent=u+` · Live scene unavailable`),fe(),y(),document.dispatchEvent(new CustomEvent(`melt-key-poster-state`,{detail:M}));let e=document.getElementById(`ice-vault-canvas`);e&&(e.hidden=!0),N?ce(!1):se()};c.addEventListener(`melt-key-ready`,()=>{if(c.dataset.meltStage=`ready`,d&&!c.dataset.trialSceneMs){let e=Math.round(performance.now());c.dataset.trialSceneMs=String(e),d.textContent=u+` · Live scene `+(e/1e3).toFixed(1)+` s`}fe(),ue(),se()},{signal:s}),c.addEventListener(`melt-key-fallback`,De,{signal:s}),R(),V(),ue(),H(),de(),le();let Oe=!1;(()=>{if(!(Oe||A||c.dataset.stageFallback===`true`)){Oe=!0;try{re=q(c),se()}catch{De()}}})(),ot=()=>{A||(A=!0,F?.kill(),z(),o.abort(),_e.disconnect(),re?.(),d?.remove(),oe&&clearTimeout(oe),I&&clearTimeout(I),a.instance.off(`scroll`,Ee),a.destroy())},window.addEventListener(`pagehide`,e=>{e.persisted||ot?.()},{signal:s})}var ct=new AbortController;document.readyState===`loading`?document.addEventListener(`DOMContentLoaded`,st,{once:!0,signal:ct.signal}):st();