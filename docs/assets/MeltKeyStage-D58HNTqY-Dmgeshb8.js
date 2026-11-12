import{a as e,n as t}from"./SnowyFooter-BMrOBPYn-BUvaEnj9.js";import{n}from"./vendor-lenis-fOJvfYOR-noqv9dMZ.js";import{$ as r,A as i,B as a,C as o,D as s,E as c,F as l,G as u,H as d,I as f,J as p,K as m,M as h,N as g,O as _,P as v,Q as y,R as b,S as x,T as S,U as C,V as w,W as T,X as E,Y as D,Z as O,_ as ee,a as te,b as k,c as A,d as ne,et as re,f as j,g as ie,h as M,i as N,j as ae,k as P,l as F,m as oe,n as se,nt as I,o as ce,p as L,q as le,r as ue,rt as de,s as R,t as z,tt as B,u as V,v as fe,w as pe,x as me,y as he,z as ge}from"./SharedRenderer-BzNDmtRk-Dmc0QjWK.js";var _e={uCampDetail:{value:null},uHasCampDetail:{value:0},uCompactCamp:{value:new L},uPhoneSnow:{value:null},uHasPhoneSnow:{value:0},uPhoneSnowLayout:{value:0}};function ve(e,t=!1,n=t){_e.uPhoneSnow.value=e??null,_e.uHasPhoneSnow.value=e?.image&&t?1:0,_e.uPhoneSnowLayout.value=e?.image&&t&&n?1:0}function ye(e=0,t=0,n=0,r=!1){_e.uCompactCamp.value.set(e,t,n,+!!r)}function be(e){_e.uCampDetail.value=e??null,_e.uHasCampDetail.value=+!!e}var xe=`uniform sampler2D uCampDetail;uniform float uHasCampDetail;uniform vec4 uCompactCamp;uniform sampler2D uPhoneSnow;uniform float uHasPhoneSnow;uniform float uPhoneSnowLayout;
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
}`;function Se(e){let{surface:t,scene:n,camera:r,sky:i,fire:a}=e,o={value:new L},s={value:null},c={value:0},l=new m({transparent:!0,depthTest:!1,depthWrite:!1,toneMapped:!1,uniforms:{..._e,uPlate:s,uCrop:o,uClose:c},vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}`,fragmentShader:`${xe}\nuniform sampler2D uPlate;uniform vec4 uCrop;uniform float uClose;varying vec2 vUv;
 void main(){vec2 uv=vUv*uCrop.xy+uCrop.zw;float coverage=1.-smoothstep(.355,.405,uv.y);
 if(coverage<.001)discard;gl_FragColor=vec4(campPlateColor(uPlate,uv,uClose),coverage);
 #include <colorspace_fragment>
 }`}),d=new k(new V(2,2),l);d.name=`early-camp-ground`,d.frustumCulled=!1,d.renderOrder=-19,d.visible=!1,n.add(d);let f=!1,p=!1,h=``,g=!1,_=!1,v=!0,y=null,b=()=>String(a.mesh.material.map?.uuid)+`:`+String(v),S=async()=>{let o=b(),s=new Set,c=e=>{e instanceof A&&e.image&&!e.isRenderTargetTexture&&!(e instanceof me)&&s.add(e)};c(e.background()),Object.values(_e).forEach(e=>c(e.value)),Object.values(i.root.material.uniforms).forEach(e=>c(e.value)),c(a.mesh.material.map);let l=[];for(let e of s){let t=e.image;t?.decode&&l.push(t.decode().catch(()=>{}))}if(await Promise.all(l),f)return;for(let e of s)t.engine.initTexture(e);let u=new x;u.add(i.root.clone(!1),d.clone(!1)),a.root.traverse(e=>{e instanceof k&&u.add(e.clone(!1))}),t.engine.toneMapping=t.toneMapping,t.engine.toneMappingExposure=t.toneMappingExposure,t.engine.outputColorSpace=t.outputColorSpace,await t.engine.compileAsync(u,r,n),!f&&(h=o,p=!1,e.onReady())};return{ground:d,get ready(){return h===b()&&!!h},get started(){return g},render(l,m,x){if(v=x,a.setMotion(x),f||!e.ready()||!i.ready||!e.background()?.image||!(a.root.userData.posterReady||a.root.userData.videoReady))return!1;let C=t.engine.getContext();if(y){let t=C.clientWaitSync(y,0,0);if(t===C.TIMEOUT_EXPIRED)return!0;C.deleteSync(y),y=null,_||(_=!0,e.onFirst(t===C.WAIT_FAILED?`frame-fallback`:`fence-complete`))}if(h!==b())return p||(p=!0,S().catch(()=>{f||e.onError()})),!1;let w=e.background();s.value=w,o.value.set(w.repeat.x,w.repeat.y,w.offset.x,w.offset.y),c.value=+!!w.userData.closeCamp,i.setCamera(r),i.setActive(m&&x),i.update(l),a.setMotion(x),a.update(l,r,m&&x),e.irradiance();let T=e.hidden().filter(e=>!!e),E=T.map(e=>e.visible),D=[];n.traverse(e=>{e instanceof u&&(D.push([e.shadow,e.shadow.needsUpdate]),e.shadow.needsUpdate=!1)});try{T.forEach(e=>e.visible=!1),d.visible=!0,t.render(n,r),g=!0}finally{d.visible=!1,T.forEach((e,t)=>e.visible=E[t]),D.forEach(([e,t])=>e.needsUpdate=t)}return _||(typeof C.fenceSync==`function`?(y=C.fenceSync(C.SYNC_GPU_COMMANDS_COMPLETE,0),y?C.flush():(_=!0,e.onFirst(`frame-fallback`))):(_=!0,e.onFirst(`frame-fallback`))),!0},dispose(){f=!0,cancelAnimationFrame(0),y&&t.engine.getContext().deleteSync(y),n.remove(d),d.geometry.dispose(),l.dispose()}}}function Ce(e,t=!1,n){if(n){let t=Ce(e);return{...t,x:n.x,y:n.y,scale:t.scale*n.zoom}}return t?{x:.577,y:.737,scale:.87,canonicalY:.75,originalBaseY:.798,originalHeight:.18}:e?{x:.563,y:.646,scale:.64,canonicalY:.664,originalBaseY:.69,originalHeight:.095}:{x:.6105,y:.681,scale:.58,canonicalY:.75,originalBaseY:.798,originalHeight:.18}}function we(e,t,n,r,i,a=!1){let s=a?i?32:48:i?40:64,l=(t,n,r,i=0,a=0,o=0)=>{let s=new k(n,r);return s.name=t,s.position.set(i,a,o),e.add(s),s},u=[[.255,-.03],[.25,0],[.255,.03],[.273,.052],[.315,.062],[.355,.057],[.385,.035],[.392,0],[.385,-.035],[.355,-.057],[.315,-.062],[.273,-.052],[.255,-.03]].reverse().map(([e,t])=>new R(e,t)),d=new E(u,s);d.rotateX(Math.PI/2);let f=l(`key-ring`,d,r,0,1.89,0);for(let e of[-1,1])l(`ring-outer-bead`,new pe(.385,.006,6,s),n,0,1.89,e*.037),l(`ring-inner-bead`,new pe(.255,.005,6,s),n,0,1.89,e*.03);let p=l(`key-shaft`,new C(.056,.062,1.37,s,1),t,0,.842,0);l(`shaft-foot`,new c(.062,s,10),n,0,.157,0);let m=[[0,1.405],[.056,1.405],[.058,1.425],[.091,1.432],[.104,1.447],[.106,1.464],[.09,1.48],[.073,1.488],[.076,1.504],[.112,1.516],[.116,1.535],[.098,1.552],[.074,1.563],[.07,1.584],[.076,1.606],[0,1.606]].map(([e,t])=>new R(e,t)),h=l(`key-turned-neck`,new E(m,s),t);for(let e of[1.45,1.532]){let t=new pe(e===1.45?.1:.11,.009,6,s);t.rotateX(Math.PI/2),l(`neck-polished-bead`,t,n,0,e,0)}let g=new le;return g.moveTo(.024,.2),g.lineTo(.255,.2),g.lineTo(.255,.305),g.lineTo(.132,.305),g.lineTo(.132,.393),g.lineTo(.255,.393),g.lineTo(.255,.495),g.lineTo(.024,.495),g.closePath(),{ring:f,shaft:p,bit:l(`key-bit`,new o(g,{depth:.086,bevelEnabled:!0,bevelThickness:.009,bevelSize:.009,bevelSegments:3,steps:1}),t,0,0,-.043),collar:h}}var Te=new Map,Ee=`snowy_ice_cache_v1`,De=`geometries`;function Oe(){return typeof indexedDB>`u`?Promise.resolve(null):new Promise(e=>{try{let t=indexedDB.open(Ee,1);t.onupgradeneeded=()=>{try{t.result.createObjectStore(De)}catch{}},t.onsuccess=()=>e(t.result),t.onerror=()=>e(null)}catch{e(null)}})}function ke(e,t,n){let r=new ee;return r.setAttribute(`position`,new p(new Float32Array(e),3)),r.setAttribute(`normal`,new p(new Float32Array(t),3)),r.setIndex(new p(n.length<=65535?new Uint16Array(n):new Uint32Array(n),1)),r.name=`natural-hewn-ice-watertight`,r.computeBoundingBox(),r.computeBoundingSphere(),r}async function Ae(e=40){let t=Number.isFinite(e)?Math.max(8,Math.min(80,Math.round(e))):40;if(Te.has(t))return;let n=await Oe();if(n)try{let e=await new Promise(e=>{let r=n.transaction(De,`readonly`).objectStore(De).get(`ice_${t}`);r.onsuccess=()=>e(r.result??null),r.onerror=()=>e(null)});if(e&&e.pos&&e.norm&&e.idx){let n=ke(e.pos,e.norm,e.idx);Te.set(t,n);return}}catch{}let r=je(t);if(Te.set(t,r),n)try{let e=r.getAttribute(`position`).array,i=r.getAttribute(`normal`).array,a=r.getIndex().array;n.transaction(De,`readwrite`).objectStore(De).put({pos:e,norm:i,idx:a},`ice_${t}`)}catch{}}function je(e){let t=new fe(2,2,2,e,e,e),n=t.getAttribute(`position`),r=new j,i=new j,a=new j,o=[{normal:new j(.64,.62,.45).normalize(),limit:1.37},{normal:new j(-.74,.49,-.46).normalize(),limit:1.39},{normal:new j(.09,1,-.045).normalize(),limit:.955}],s=e=>Math.abs(e)<=.75?e/.75*.85:Math.sign(e)*(.85+(Math.abs(e)-.75)/.25*.15);for(let e=0;e<n.count;e++){r.set(s(n.getX(e)),s(n.getY(e)),s(n.getZ(e))),i.copy(r).clampScalar(-.85,.85),a.copy(r).sub(i).normalize(),r.copy(i).addScaledVector(a,.15);let t=(r.y+1)*.5;r.x*=1-.036*t,r.z*=1-.024*t;let c=.006*Math.sin(r.x*9+r.y*4)*Math.sin(r.z*7-r.y*3)+.004*Math.sin(r.x*19+r.z*13);r.addScaledVector(a,c*N.smoothstep(t,.04,.2));for(let e of o){let t=r.dot(e.normal)-e.limit;t>0&&r.addScaledVector(e.normal,-t)}n.setXYZ(e,r.x,r.y,r.z)}t.deleteAttribute(`uv`),t.deleteAttribute(`normal`);let c=O(t,1e-5);return t.dispose(),c.computeVertexNormals(),c.name=`natural-hewn-ice-watertight`,c.computeBoundingBox(),c.computeBoundingSphere(),c}function Me(e=40){let t=Number.isFinite(e)?Math.max(8,Math.min(80,Math.round(e))):40,n=Te.get(t);if(n)return n.clone();let r=je(t);return Te.set(t,r.clone()),r}var Ne=(e,t,n)=>{let r=N.clamp((n-e)/(t-e),0,1);return r*r*(3-2*r)};function H(e){let t=N.clamp(e,0,1),n=t**1.55,r=N.lerp(1-.12*n,.985,Ne(.66,1,t));return{x:r,y:1-n,z:r,cx:0,cz:0}}var Pe=`
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
}`;function Fe(e){let t=new w().setFromEuler(new y(-Math.PI/2,0,-.08)),n=new j,r=1/0;e.traverse(e=>{if(!(e instanceof k))return;e.updateMatrix();let i=e.geometry.getAttribute(`position`);for(let a=0;a<i.count;a++)n.fromBufferAttribute(i,a).applyMatrix4(e.matrix).multiplyScalar(.7).applyQuaternion(t),r=Math.min(r,n.y)});let i=.029-r+.002;return{pose:e=>{let t=N.clamp(e,0,1),n=Ne(.64,1,t);return{angle:Math.PI/2*n,y:.14-.045*n+(i-.095)*Ne(.78,1,t),z:.08+.68*n}},endY:i}}function Ie(e=40,t=3,n,i,a={}){let o=a.highDetail??e>32,s=o||!!a.naturalClarity,c=new x;c.name=`melt-key-model`;let u=N.clamp(Math.round(t),1,4),f=!1;c.userData.highDetail=o,c.userData.materialStudy=u,c.userData.materialReady=!1;let p=new oe().load(`/assets/ice-studies/study-${u}${e<=32?`-mobile`:``}.webp`,e=>{f?e.dispose():(c.userData.materialReady=!0,n?.())},void 0,()=>{f||i?.()});p.colorSpace=``,p.minFilter=h,p.magFilter=ge,p.anisotropy=o?8:4;let m=[.6,.65,.59,.62][u-1],g={value:+!!s},_={value:m*(s?.8:1)},v=new x;v.name=`key`;let y={uMelt:{value:0},uOpacity:{value:1},uWet:{value:0},uVolumeRoughness:{value:.13},uKeyReveal:{value:0}},b=new T({color:14936813,metalness:0,roughness:.12,transmission:.98,thickness:1,ior:1.31,attenuationColor:11452359,attenuationDistance:s?4.6:3.8,clearcoat:0,clearcoatRoughness:.36,envMapIntensity:.32,transparent:!0,depthWrite:!1}),S=1967,C=()=>(S=S*1664525+1013904223>>>0,S/4294967296),w=Array.from({length:20},()=>{let e=C()*Math.PI*2,t=Math.sqrt(C())*.49;return new L(Math.cos(e)*t+.04,-.58+C()*1.1,Math.sin(e)*t*.75,.012+C()*.016)});b.onBeforeCompile=e=>{e.uniforms.uMelt=y.uMelt,e.uniforms.uKeyReveal=y.uKeyReveal,e.uniforms.uAirPockets={value:w},e.uniforms.uVolumeRoughness=y.uVolumeRoughness,e.uniforms.uStudyMap={value:p},e.uniforms.uFrostStrength=_,e.uniforms.uNaturalClarity=g,e.uniforms.uClearCentre={value:[.78,.48,.82,.65][u-1]},e.fragmentShader=`uniform float uNaturalClarity;uniform vec4 uAirPockets[${w.length}];uniform sampler2D uStudyMap;uniform float uClearCentre;uniform float uFrostStrength;uniform float uKeyReveal;uniform float uVolumeRoughness;uniform float uMelt;uniform mat3 normalMatrix;varying vec3 vJellyLocal;float iceColorDepth;
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
      normal=normalize(max(abs(determinant),.0000001)*normal-gradient*.0005*frozenAmount);`);let t=he.transmission_pars_fragment.replaceAll(`getVolumeTransmissionRay( n, v, thickness,`,`getVolumeTransmissionRay( n, v, min( thickness, mix(.42,.14,smoothstep(.15,.70,uMelt)) ),`).replaceAll(`volumeAttenuation( length( transmissionRay ),`,`volumeAttenuation( iceColorDepth,`).replace(`vec3 attenuatedColor = transmittance * transmittedLight.rgb;`,`
        vec3 attenuatedColor = transmittance * transmittedLight.rgb;
        // Restore a restrained amount of warmth only where the opaque-buffer
        // sample is gold. White surroundings and blue ice keep their original
        // absorption; surface frost, blur and reflection remain in front.
        float goldChroma=(transmittedLight.r-transmittedLight.b)/max(.05,max(transmittedLight.r,transmittedLight.g));
        float goldMask=smoothstep(.10,.38,goldChroma)*smoothstep(.015,.10,transmittedLight.r);
        float goldReadability=.48*smoothstep(.10,.88,uMelt)*uKeyReveal;
        attenuatedColor=mix(attenuatedColor,transmittedLight.rgb*vec3(1.,.86,.55)+vec3(.035,.018,.002),goldMask*goldReadability);
      `);e.fragmentShader=e.fragmentShader.replace(`#include <transmission_pars_fragment>`,t);let n=he.transmission_fragment.replace(`n, v, material.roughness, material.diffuseContribution`,`n, v, uVolumeRoughness, material.diffuseContribution`);n=n.replace(`vec4 transmitted = getIBLVolumeRefraction(`,`
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
      for(int bubble=0;bubble<${w.length};bubble++){
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
      vJellyLocal=position;transformed=meltIce(position);`)},b.customProgramCacheKey=()=>`snowy-natural-hewn-ice-v7-`+w.length+`-`+Number(o)+`-`+Number(s);let E=Me(e),D=new k(E,b);D.name=`ice-body`,D.position.y=1.03,c.add(D);let O=new l({color:14476262,roughness:.94,metalness:0,transparent:!0,opacity:s?.66:.92,depthWrite:!1,envMapIntensity:.18});O.onBeforeCompile=e=>{e.uniforms.uMelt=y.uMelt,e.uniforms.uOpacity=y.uOpacity,e.uniforms.uRimeAtlas={value:p},e.vertexShader=`uniform float uMelt;varying vec3 vRimeLocal;
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
      diffuseColor.a*=max(max(max(cortex*clusters*1.05,basal),frostPatch*.62),max(0.,crackle-.20)*1.35)*grain*uOpacity*(1.-smoothstep(.32,.82,uMelt));`)},O.customProgramCacheKey=()=>`snowy-patchy-rime-v3-`+Number(o);let ee=new k(E,O);ee.name=`surface-hoar`,ee.position.copy(D.position),c.add(ee);let te=new T({color:14003806,roughness:.23,metalness:1,envMapIntensity:1.25,emissive:0}),A=new T({color:15848076,roughness:.14,metalness:1,envMapIntensity:1.35}),ne=new T({color:13017434,roughness:.29,metalness:1,envMapIntensity:1.2}),ie=e=>`uniform float uKeyReveal;
`+e.replace(`void main() {`,`void main() {
    if(uKeyReveal<.9999){float grain=fract(sin(dot(floor(gl_FragCoord.xy),vec2(12.9898,78.233)))*43758.5453);if(uKeyReveal<=0.||grain>uKeyReveal)discard;}`);for(let e of[te,A,ne])e.onBeforeCompile=e=>{e.uniforms.uKeyReveal=y.uKeyReveal,e.fragmentShader=ie(e.fragmentShader)},e.customProgramCacheKey=()=>`snowy-turned-gold-resolve-v1`;let M=new r({depthPacking:d});M.onBeforeCompile=e=>{e.uniforms.uKeyReveal=y.uKeyReveal,e.fragmentShader=ie(e.fragmentShader)},M.customProgramCacheKey=()=>`snowy-key-shadow-resolve-v6`;let{ring:ae,shaft:F,bit:se,collar:I}=we(v,te,A,ne,e<=32,a.compactGeometry);v.position.set(0,.14,.08),v.scale.setScalar(.7),c.add(v);let ce=Fe(v),le=new x;le.name=`ambiguous-golden-core`,le.visible=!1,c.add(le);let ue=new P({color:4810100,opacity:.22,depthWrite:!1});ue.onBeforeCompile=e=>{e.uniforms.uMelt=y.uMelt,e.vertexShader=`varying vec2 vShadowFloor;
`+e.vertexShader,e.vertexShader=e.vertexShader.replace(`#include <worldpos_vertex>`,`#include <worldpos_vertex>
 vShadowFloor=(modelMatrix*vec4(transformed,1.)).xz;`),e.fragmentShader=`uniform float uMelt;varying vec2 vShadowFloor;
      float iceFoot(){return .94*(1.-.12*pow(clamp(uMelt,0.,1.),1.55));}
      vec2 iceCenter(){return vec2(0.);}
      float icePenumbra(){float gap=max(0.,max(abs(vShadowFloor.x-iceCenter().x),abs(vShadowFloor.y-iceCenter().y))-iceFoot());return mix(.32,1.,smoothstep(0.,.85,gap));}
    `+e.fragmentShader;let t=he.shadowmask_pars_fragment.replace(`directionalLight.shadowRadius,`,`directionalLight.shadowRadius * mix(icePenumbra(),1.,smoothstep(.80,1.,uMelt)),`);e.fragmentShader=e.fragmentShader.replace(`#include <shadowmask_pars_fragment>`,t),e.fragmentShader=e.fragmentShader.replace(`gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );`,`
      float edge=max(abs(vShadowFloor.x-iceCenter().x),abs(vShadowFloor.y-iceCenter().y));
      float contact=1.-smoothstep(iceFoot()*.83,iceFoot()*1.08,edge);
      float density=mix(.44+.56*contact,1.,smoothstep(.80,1.,uMelt));
      gl_FragColor=vec4(color,opacity*density*(1.-getShadowMask()));`)},ue.customProgramCacheKey=()=>`snowy-translucent-contact-shadow-v2`;let de=new k(new V(200,200),ue);de.name=`shadow-receiver`,de.rotation.x=-Math.PI/2,de.receiveShadow=!0,c.add(de),D.castShadow=!0,v.traverse(e=>{e instanceof k&&(e.castShadow=!0,e.customDepthMaterial=M)});let R=new r({depthPacking:d});R.onBeforeCompile=e=>{e.uniforms.uMelt=y.uMelt,e.vertexShader=`uniform float uMelt;
`+Pe+`
`+e.vertexShader,e.vertexShader=e.vertexShader.replace(`#include <begin_vertex>`,`#include <begin_vertex>
 transformed=meltIce(position);`)},R.customProgramCacheKey=()=>`snowy-complete-vertical-shadow-v11`,D.customDepthMaterial=R;let z={ice:D,key:v,ring:ae,shaft:F,bit:se,collar:I,floor:de,core:le};c.userData.sculptRuntime={nodes:z,meshes:{root:D,ring:ae,shaft:F,bit:se,collar:I},sockets:{floor:new j(0,.04,0)},colliders:{ice:{type:`box`,size:[2,2,2]},key:{type:`compound`}},explodable:!0,clickable:!0};let B=(e,t,n)=>{let r=N.clamp((n-e)/(t-e),0,1);return r*r*(3-2*r)},fe=(e,t=0)=>{let n=N.clamp(e,0,1);y.uMelt.value=n;let r=H(n),i=Math.cbrt(r.x*r.y*r.z);b.roughness=.12+.06*B(.72,1,n);let a=(1-B(.978,1,n))*(1-t);y.uOpacity.value=a,b.opacity=a,D.visible=n<1&&a>1e-5,ee.visible=n<.82&&a>1e-5,D.castShadow=D.visible&&n<.978;let o=B(.04,.48,n);y.uVolumeRoughness.value=.13-.05*o,v.visible=!0,y.uKeyReveal.value=B(.04,.18,n),te.emissiveIntensity=0,c.userData.meltwater={enabled:!1,wetness:0,runoffVisible:!1,dropsVisible:!1,area:0,visualVolume:0,filmHeight:0},c.userData.meltVisual={iceTint:b.attenuationColor.getHexString(),iceScale:i,iceOpacity:b.opacity,keyBlur:y.uVolumeRoughness.value,keyReveal:y.uKeyReveal.value,glowAlpha:1-y.uKeyReveal.value};let s=ce.pose(n);v.rotation.set(-s.angle*(1-t),0,-.08*(1-t)),v.position.set(0,s.y+1.45*t,s.z*(1-t)),v.scale.setScalar(.7-.18*t),c.userData.meltDynamics={choreography:`reference-progressive`,keyAngle:s.angle,keyY:s.y,keyZ:s.z,iceCenter:[r.cx,r.cz],iceHalfSize:[r.x,r.y,r.z],remnantHeight:r.y*2},c.updateMatrixWorld(!0)};fe(0);let pe=()=>{f=!0,p.dispose();let e=new Set,t=new Set;c.traverse(n=>{n instanceof k&&(e.add(n.geometry),(Array.isArray(n.material)?n.material:[n.material]).forEach(e=>t.add(e)),n instanceof re&&n.dispose())}),R.dispose(),M.dispose(),e.forEach(e=>e.dispose()),t.forEach(e=>e.dispose())};return{root:c,...z,startupTextures:[p],update:fe,dispose:pe,setNaturalClarity(e){let t=o||e;g.value=+!!t,_.value=m*(t?.8:1),b.attenuationDistance=t?4.6:3.8,O.opacity=t?.66:.92}}}function Le(e={}){let t=e.highDetail??!e.lowPower,n=new x;n.name=`walnut-chest`,n.userData.highDetail=t;let r=new x;r.name=`walnut-lid-pivot`,r.position.set(0,1.06,-.9),n.add(r);let i=new I;i.name=`walnut-key-socket`,i.position.set(0,.79,.925),n.add(i);let a=new Set,c=new Set,u=new Set,d={root:n,lid:r,lockSocket:i},m=!1,h=new T({color:t?`#c4a78d`:`#b08e71`,roughness:t?.58:.68,metalness:0,clearcoat:t?.18:.08,clearcoatRoughness:t?.38:.34,normalScale:new R(t?.32:.1,t?.32:.1)});n.userData.materialReady=!1;let _=new oe,v=0,y=e.assetBase??`/assets/walnut-chest/`,b=(t,r=!1)=>{let i=_.load(`${y}${t}${e.lowPower?`-mobile`:``}.webp`,()=>{m?i.dispose():(v++,n.userData.materialReady=v===3,e.onReady?.())},void 0,()=>{m||(n.userData.materialError=!0,e.onError?.())});return i.colorSpace=r?ue:``,i.anisotropy=e.lowPower?4:8,i.wrapS=i.wrapT=f,u.add(i),i};h.map=b(`walnut-color`,!0),h.normalMap=b(`walnut-normal`),h.roughnessMap=b(`walnut-roughness`),h.onBeforeCompile=e=>{e.fragmentShader=e.fragmentShader.replace(`#include <map_fragment>`,`#include <map_fragment>
    // Preserve the photographed veneer contrast instead of tinting it flat.
    diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.20,.115,.064),${t?`.055`:`.22`});`)},h.customProgramCacheKey=()=>`snowy-veneer-detail-v3-`+Number(t);let w=h.clone();w.color.set(t?`#a58c75`:`#947056`),t&&(w.onBeforeCompile=h.onBeforeCompile,w.customProgramCacheKey=h.customProgramCacheKey);let E=new T({color:`#b99656`,roughness:t?.27:.3,metalness:1,envMapIntensity:1}),D=new T({color:`#171b1e`,roughness:.98,metalness:0,sheen:.35,sheenColor:new s(`#394044`),sheenRoughness:.9});c.add(h),c.add(w),c.add(E),c.add(D);let O=e=>(a.add(e),e),ee=(e,t)=>{let n=e.getAttribute(`position`),r=e.getAttribute(`normal`),i=new Float32Array(n.count*2);for(let e=0;e<n.count;e++){let a=n.getX(e)+t.x,o=n.getY(e)+t.y,s=n.getZ(e)+t.z,c=Math.abs(r.getX(e)),l=Math.abs(r.getY(e)),u=Math.abs(r.getZ(e));l>c&&l>u?(i[e*2]=a/3.3+.5,i[e*2+1]=(s+.9)/1.8*.42+.44):c>u?(i[e*2]=s/3.3+.5,i[e*2+1]=o/1.535*.46+.15):(i[e*2]=a/3.3+.5,i[e*2+1]=o/1.535*.46+.15)}e.setAttribute(`uv`,new p(i,2))},te=(e,t,n,i,a)=>{(n===h||n===w)&&ee(t,new j(a.x,a.y+(i===r?1.06:0),a.z+(i===r?-.9:0)));let o=new k(O(t),n);return o.name=e,o.position.copy(a),o.castShadow=!0,o.receiveShadow=!0,o.userData.partId=e,i.add(o),d[e]=o,o},A=(r,i,a,o,s,c,l,u=n,d=h)=>te(r,new S(i,a,o,e.lowPower?2:3,Math.min(t?.024:.018,i*.12,a*.12,o*.12)),d,u,new j(s,c,l));A(`bottom`,3.02,.14,1.52,0,.07,0),A(`back`,3.3,1.05,.14,0,.525,-.83),A(`side-left`,.14,1.05,1.56,-1.58,.525,0),A(`side-right`,.14,1.05,1.56,1.58,.525,0);let ie=(e,t,n)=>{let r=new le,i=-e/2,a=-t/2;return r.moveTo(i+n,a),r.lineTo(i+e-n,a),r.quadraticCurveTo(i+e,a,i+e,a+n),r.lineTo(i+e,a+t-n),r.quadraticCurveTo(i+e,a+t,i+e-n,a+t),r.lineTo(i+n,a+t),r.quadraticCurveTo(i,a+t,i,a+t-n),r.lineTo(i,a+n),r.quadraticCurveTo(i,a,i+n,a),r},M=e=>{let t=new g;return t.absarc(0,e,.072,Math.PI*1.24,Math.PI*1.76,!0),t.lineTo(.088,e-.245),t.quadraticCurveTo(.092,e-.265,.07,e-.265),t.lineTo(-.07,e-.265),t.quadraticCurveTo(-.092,e-.265,-.088,e-.245),t.closePath(),t},ae=ie(3.3,1.05,.018);ae.holes.push(M(.265)),te(`front`,new o(ae,{depth:.14,steps:1,bevelEnabled:!0,bevelSegments:2,bevelSize:.006,bevelThickness:.006,curveSegments:e.lowPower?12:20}),h,n,new j(0,.525,.76));let P=ie(.31,.44,.042);P.holes.push(M(.79-.705)),te(`lock`,new o(P,{depth:.018,steps:1,bevelEnabled:!0,bevelSegments:2,bevelSize:.004,bevelThickness:.004,curveSegments:e.lowPower?12:24}),E,n,new j(0,.705,.906)),A(`lid`,3.3,.475,1.8,0,.2375,.9,r),A(`lid-inset`,3,.018,1.5,0,-.005,.9,r,w),A(`interior`,3,.025,1.5,0,.153,0,n,D);let F=.037;for(let[t,r]of[[`hinge-a`,-1.02],[`hinge-b`,1.02]]){let i=new x;i.name=t,i.position.set(r,1.05,-.89),n.add(i),d[t]=i,A(`${t}-base`,.32,.1,.014,0,-.045,-.01,i,E);let a=te(`${t}-knuckle`,new C(F,F,.32,e.lowPower?12:20),E,i,new j);a.rotation.z=Math.PI/2}let se=O(new C(.014,.014,.007,e.lowPower?8:12)),ce=new re(se,E,t?6:4);ce.name=`hinge-screws`;let L=new I,de=0;for(let e of[-1.12,-.92,.92,1.12])L.position.set(e,1.015,-.913),L.rotation.set(Math.PI/2,0,0),L.updateMatrix(),ce.setMatrixAt(de++,L.matrix);n.add(ce);let z,B;if(t){for(let e of[.89,.51])L.position.set(0,e,.932),L.rotation.set(Math.PI/2,0,0),L.updateMatrix(),ce.setMatrixAt(de++,L.matrix);let e=new l({color:`#30281f`,roughness:.85,metalness:.22});c.add(e),z=new re(O(new fe(.018,.003,.0015)),e,2),z.name=`lock-screw-slots`;for(let e=0;e<2;e++)L.position.set(0,[.89,.51][e],.9365),L.rotation.set(0,0,e?.36:-.2),L.updateMatrix(),z.setMatrixAt(e,L.matrix);n.add(z),B=new re(O(new fe(.006,.94,.001)),e,2),B.name=`front-corner-joinery`;for(let e=0;e<2;e++)L.position.set(e?-1.5:1.5,.525,.9065),L.rotation.set(0,0,0),L.updateMatrix(),B.setMatrixAt(e,L.matrix);n.add(B)}d.lid=r,d[`hinge-screws`]=ce;let V={};n.traverse(e=>{e instanceof k&&(V[e.name]=e)});let pe=[...n.children].filter(e=>e!==i),me=new j(0,.75,0);n.updateMatrixWorld(!0);let he=pe.map(e=>({part:e,position:e.position.clone(),offset:new ne().setFromObject(e).getCenter(new j).sub(me)}));n.userData.sculptRuntime={nodes:d,meshes:V,sockets:{key:i,hinge:r},colliders:{body:{type:`compound-box`,size:[3.3,1.535,1.8]},lid:{type:`box`,size:[3.3,.475,1.8]}},destructionGroups:{body:[`front`,`back`,`side-left`,`side-right`,`bottom`].map(e=>d[e]),lid:[r]},explodable:!0,clickable:!0,setExplode(e){let t=N.clamp(e,0,1);for(let e of he)e.part.position.copy(e.position).addScaledVector(e.offset,t*.65)}},n.userData.reference=`Walnut presentation box: proportional/material inspiration; inferred rear/interior and adapted working lock.`;let ge=e=>{r.rotation.x=-N.clamp(e,0,1)*1.83,n.userData.openProgress=N.clamp(e,0,1)};return ge(0),{root:n,lidPivot:r,keySocket:i,update:ge,dispose(){m||(m=!0,a.forEach(e=>e.dispose()),c.forEach(e=>e.dispose()),u.forEach(e=>e.dispose()),ce.dispose(),z?.dispose(),B?.dispose(),n.clear())}}}function Re(e){if(e.index||Object.keys(e.morphAttributes).length)return!1;let t=Object.entries(e.attributes);if(!t.length||t.some(([,e])=>!(e instanceof p)||!(e.array instanceof Float32Array)||`isInstancedBufferAttribute`in e))return!1;let n=t[0][1].count;if(t.some(([,e])=>e.count!==n))return!1;let r=t.map(([e,t])=>({name:e,attribute:t,words:new Uint32Array(t.array.buffer,t.array.byteOffset,t.array.length)})),i=[],a=new Uint32Array(n),o=new Map,s=0;for(let{attribute:e}of r)s+=e.itemSize*4;for(let e=0;e<n;e++){let t=``;for(let{attribute:n,words:i}of r)for(let r=0;r<n.itemSize;r++){let a=i[e*n.itemSize+r];t+=String.fromCharCode(a>>>16,a&65535)}let n=o.get(t);n===void 0&&(n=i.length,i.push(e),o.set(t,n)),a[e]=n}let c=i.length<=65535;if(i.length*s+n*(c?2:4)>=n*s)return!1;for(let{name:t,attribute:n,words:a}of r){let r=new Float32Array(i.length*n.itemSize),o=new Uint32Array(r.buffer);for(let e=0;e<i.length;e++)o.set(a.subarray(i[e]*n.itemSize,(i[e]+1)*n.itemSize),e*n.itemSize);let s=new p(r,n.itemSize,n.normalized);s.name=n.name,s.gpuType=n.gpuType,s.setUsage(n.usage),e.setAttribute(t,s)}return e.setIndex(new p(c?new Uint16Array(a):a,1)),!0}function ze(e={}){if(new URLSearchParams(location.search).get(`chest`)===`legacy`)return Le(e);let t=e.highDetail??!e.lowPower,n=new x;n.name=`walnut-chest`,n.userData.highDetail=t;let r=new x;r.name=`walnut-lid-pivot`,r.position.set(0,1.06,-.9),n.add(r);let i=new I;i.name=`walnut-key-socket`,i.position.set(0,.79,.925),n.add(i);let c=new Set,u=new Set,d=new Set,m={root:n,lid:r,lockSocket:i},h=!1,_=new T({color:`#c28452`,roughness:.65,metalness:0,clearcoat:.18,clearcoatRoughness:.32,normalScale:new R(.35,.35)});n.userData.materialReady=!1;let v=new oe,y=0,b=e.assetBase??(e.lowPower?`/assets/walnut-chest/`:`/assets/walnut-chest-v2/`),w=(t,r=!1)=>{let i=`${b}${t}${e.lowPower?`-mobile`:``}.webp`,o=e.compactGeometry?1:e.lowPower?3:2,s=()=>{y++,n.userData.materialReady=y===o,e.onReady?.()},c=()=>{h||(n.userData.materialError=!0,e.onError?.())},l=new A;return new a().setOptions({imageOrientation:`flipY`,premultiplyAlpha:`none`,colorSpaceConversion:r?`default`:`none`}).load(i,e=>{h?e.close():(l.image=e,l.needsUpdate=!0,s())},void 0,()=>{v.load(i,e=>{h?e.dispose():(l.image=e.image,l.needsUpdate=!0,s())},void 0,c)}),l.flipY=!1,l.colorSpace=r?ue:``,l.anisotropy=e.lowPower?4:8,l.wrapS=l.wrapT=f,d.add(l),l};_.map=w(`walnut-color`,!0),e.compactGeometry?(_.roughness=.62,_.metalness=0):(_.normalMap=w(e.lowPower?`walnut-normal`:`walnut-normal-roughness`),_.roughnessMap=e.lowPower?w(`walnut-roughness`):_.normalMap),_.onBeforeCompile=t=>{e.lowPower||(t.fragmentShader=t.fragmentShader.replace(`#include <roughnessmap_fragment>`,he.roughnessmap_fragment.replace(`texelRoughness.g`,`texelRoughness.a`))),t.fragmentShader=t.fragmentShader.replace(`#include <map_fragment>`,`#include <map_fragment>
      diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.26, 0.12, 0.05), 0.28);
    `)},_.customProgramCacheKey=()=>`snowy-crafted-walnut-v4-`+Number(!!e.lowPower);let E=_.clone();E.color.set(`#c2a78b`),E.onBeforeCompile=_.onBeforeCompile,E.customProgramCacheKey=_.customProgramCacheKey;let D=new T({color:`#c29542`,roughness:.32,metalness:.88,clearcoat:.3,envMapIntensity:1.2}),O=new T({color:`#171b1e`,roughness:.98,metalness:0,sheen:.35,sheenColor:new s(`#394044`),sheenRoughness:.9});u.add(_),u.add(E),u.add(D),u.add(O);let ee=e=>(c.add(e),e),te=(e,t,n)=>{let r=e.getAttribute(`position`),i=e.getAttribute(`normal`),a=new Float32Array(r.count*2);for(let e=0;e<r.count;e++){let o=r.getX(e)+t.x,s=r.getY(e)+t.y,c=r.getZ(e)+t.z,l=Math.abs(i.getX(e)),u=Math.abs(i.getY(e)),d=Math.abs(i.getZ(e)),f=1/3.3;u>l&&u>d?(a[e*2]=(n.includes(`stile`)?c:o)*f+.5,a[e*2+1]=(n.includes(`stile`)?o:c)*f+.48):l>d?(a[e*2]=c*f+.37,a[e*2+1]=s*f+.23):n.includes(`stile`)?(a[e*2]=s*f+.16,a[e*2+1]=o*f+.5):(a[e*2]=o*f+.5,a[e*2+1]=s*f+.15)}e.setAttribute(`uv`,new p(a,2))},ie=(e,t,n,i,a)=>{(n===_||n===E)&&te(t,new j(a.x,a.y+(i===r?1.06:0),a.z+(i===r?-.9:0)),e);let o=new k(ee(t),n);return o.name=e,o.position.copy(a),o.castShadow=!0,o.receiveShadow=!0,o.userData.partId=e,i.add(o),m[e]=o,o},M=new Map,ae=(e,t,n,r,i)=>{let a=`${e}_${t}_${n}_${r}_${i}`,o=M.get(a);return o||(o=new S(e,t,n,r,i),M.set(a,o)),o.clone()},P=(r,i,a,o,s,c,l,u=n,d=_)=>ie(r,ae(i,a,o,e.compactGeometry?1:e.lowPower?2:3,Math.min(t?.024:.018,i*.12,a*.12,o*.12)),d,u,new j(s,c,l));P(`bottom`,3.02,.14,1.52,0,.07,0),P(`back`,3.3,1.05,.14,0,.525,-.83),P(`side-left`,.14,1.05,1.56,-1.58,.525,0),P(`side-right`,.14,1.05,1.56,1.58,.525,0);let se=(e,t,n)=>{let r=new le,i=-e/2,a=-t/2;return r.moveTo(i+n,a),r.lineTo(i+e-n,a),r.quadraticCurveTo(i+e,a,i+e,a+n),r.lineTo(i+e,a+t-n),r.quadraticCurveTo(i+e,a+t,i+e-n,a+t),r.lineTo(i+n,a+t),r.quadraticCurveTo(i,a+t,i,a+t-n),r.lineTo(i,a+n),r.quadraticCurveTo(i,a,i+n,a),r},ce=e=>{let t=new g;return t.absarc(0,e,.072,Math.PI*1.24,Math.PI*1.76,!0),t.lineTo(.088,e-.245),t.quadraticCurveTo(.092,e-.265,.07,e-.265),t.lineTo(-.07,e-.265),t.quadraticCurveTo(-.092,e-.265,-.088,e-.245),t.closePath(),t},L=se(3.3,1.05,.018);L.holes.push(ce(.265)),ie(`front`,new o(L,{depth:.14,steps:1,bevelEnabled:!0,bevelSegments:2,bevelSize:.006,bevelThickness:.006,curveSegments:e.lowPower?12:20}),_,n,new j(0,.525,.76));let de=se(.31,.44,.042);de.holes.push(ce(.79-.705)),ie(`lock`,new o(de,{depth:.018,steps:1,bevelEnabled:!0,bevelSegments:2,bevelSize:.004,bevelThickness:.004,curveSegments:e.lowPower?12:24}),D,n,new j(0,.705,.906)),P(`lid`,3.3,.445,1.8,0,.2225,.9,r),P(`lid-inset`,3,.018,1.5,0,-.005,.9,r,E),P(`interior`,3,.025,1.5,0,.153,0,n,O);let z=[];if(!e.compactGeometry){z.push(P(`lid-panel`,2.99,.018,1.49,0,.449,.9,r));for(let e of[.06,1.74])z.push(P(`lid-rail`,3.3,.03,.12,0,.46,e,r));for(let e of[-1.59,1.59])z.push(P(`lid-stile`,.12,.03,1.56,e,.46,.9,r));for(let e of[.055,.995])z.push(P(`front-rail`,3.15,.09,.022,0,e,.918));for(let e of[-1.575,1.575])z.push(P(`front-stile`,.1,.85,.022,e,.525,.918))}for(let e of[n,r]){let t=z.filter(t=>t.parent===e);if(t.length===0)continue;let r=[];for(let n of t)n.updateMatrix(),r.push(n.geometry.clone().applyMatrix4(n.matrix)),e.remove(n),c.delete(n.geometry),n.geometry.dispose(),m[n.name]===n&&delete m[n.name];let i=F(r);if(r.forEach(e=>e.dispose()),i){let t=new k(ee(i),_);t.name=e===n?`crafted-front-frame`:`crafted-lid-frame`,t.castShadow=!0,t.receiveShadow=!0,e.add(t),m[t.name]=t}}let B=.037,V,pe;if(!e.compactGeometry){for(let[t,r]of[[`hinge-a`,-1.02],[`hinge-b`,1.02]]){let i=new x;i.name=t,i.position.set(r,1.05,-.89),n.add(i),m[t]=i,P(`${t}-base`,.32,.1,.014,0,-.045,-.01,i,D);let a=ie(`${t}-knuckle`,new C(B,B,.32,e.lowPower?12:20),D,i,new j);a.rotation.z=Math.PI/2}let r=ee(new C(.014,.014,.007,e.lowPower?8:12));V=new re(r,D,t?6:4),V.name=`hinge-screws`;let i=new I,a=0;for(let e of[-1.12,-.92,.92,1.12])i.position.set(e,1.015,-.913),i.rotation.set(Math.PI/2,0,0),i.updateMatrix(),V.setMatrixAt(a++,i.matrix);if(n.add(V),t){for(let e of[.89,.51])i.position.set(0,e,.932),i.rotation.set(Math.PI/2,0,0),i.updateMatrix(),V.setMatrixAt(a++,i.matrix);let e=new l({color:`#30281f`,roughness:.85,metalness:.22});u.add(e),pe=new re(ee(new fe(.018,.003,.0015)),e,2),pe.name=`lock-screw-slots`;for(let e=0;e<2;e++)i.position.set(0,[.89,.51][e],.9365),i.rotation.set(0,0,e?.36:-.2),i.updateMatrix(),pe.setMatrixAt(e,i.matrix);n.add(pe)}}m.lid=r,V&&(m[`hinge-screws`]=V),c.forEach(Re);let me={};n.traverse(e=>{e instanceof k&&(me[e.name]=e)});let ge=[...n.children].filter(e=>e!==i),_e=new j(0,.75,0);n.updateMatrixWorld(!0);let ve=ge.map(e=>({part:e,position:e.position.clone(),offset:new ne().setFromObject(e).getCenter(new j).sub(_e)}));n.userData.sculptRuntime={nodes:m,meshes:me,sockets:{key:i,hinge:r},colliders:{body:{type:`compound-box`,size:[3.3,1.535,1.8]},lid:{type:`box`,size:[3.3,.475,1.8]}},destructionGroups:{body:[`front`,`back`,`side-left`,`side-right`,`bottom`].map(e=>m[e]),lid:[r]},explodable:!0,clickable:!0,setExplode(e){let t=N.clamp(e,0,1);for(let e of ve)e.part.position.copy(e.position).addScaledVector(e.offset,t*.65)}},n.userData.reference=`Walnut presentation box: proportional/material inspiration; inferred rear/interior and adapted working lock.`;let ye=e=>{r.rotation.x=-N.clamp(e,0,1)*1.83,n.userData.openProgress=N.clamp(e,0,1)};return ye(0),{root:n,lidPivot:r,keySocket:i,update:ye,dispose(){h||(h=!0,M.forEach(e=>e.dispose()),M.clear(),c.forEach(e=>e.dispose()),u.forEach(e=>e.dispose()),d.forEach(e=>{e.dispose(),e.image instanceof ImageBitmap&&e.image.close()}),V?.dispose(),pe?.dispose(),n.clear())}}}var Be=`
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
`;function Ve(e,t,n,r,i,a){let o=new V(80,80);o.rotateX(-Math.PI/2),o.translate(0,-.006,0);let s={value:e},c={value:new L(1,1,0,0)},u={value:0},d={value:0},f={value:1},p={value:r.position.clone()},m={value:0},h={value:new L},g={value:new L},_={value:new R},v={value:0},y=new l({color:16777215,roughness:1,metalness:0,toneMapped:!1});y.onBeforeCompile=e=>{Object.assign(e.uniforms,{..._e,...i,uPhoneGround:v,uWoodFoot:h,uIceFoot:g,uFootAngles:_,uSnowBackdrop:s,uSnowCrop:c,uCloseCamp:u,uHighDetail:d,uIceStrength:f,uFirePosition:p,uFireFlicker:m}),a&&(e.uniforms.uSharedIrradiance=a),e.vertexShader=(a?`uniform sampler2D uSharedIrradiance;
`:``)+`varying vec3 vSnowWorld;varying vec4 vSnowClip;varying vec3 vAuroraIrradiance;
`+Be+`
`+e.vertexShader,e.vertexShader=e.vertexShader.replace(`#include <project_vertex>`,`#include <project_vertex>
      vSnowWorld=(modelMatrix*vec4(transformed,1.)).xyz;vSnowClip=gl_Position;vAuroraIrradiance=${a?`texelFetch(uSharedIrradiance,ivec2(0),0).rgb`:i.uAuroraGroundStrength.value>0?`auroraDiffuseIrradiance(vec3(0.,1.,0.))`:`vec3(0.)`};`),e.fragmentShader=`uniform float uHighDetail;uniform float uCloseCamp;${xe}
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
      #include <opaque_fragment>`)},y.customProgramCacheKey=()=>`snowy-phone-contact-v3`+(a?`-shared-f32-v1`:``);let S=new x;S.name=`photographic-snow-ground`;let C=new k(o,y);C.receiveShadow=!0,S.add(C);let w=(e,t,n)=>{let r=[],i=[];for(let e=0;e<=128;e++){let a=e/128*Math.PI*2,o=Math.cos(a),s=Math.sin(a),c=Math.min((t-.018)/Math.max(1e-4,Math.abs(o)),(n-.018)/Math.max(1e-4,Math.abs(s))),l=Math.min((t+.13)/Math.max(1e-4,Math.abs(o)),(n+.13)/Math.max(1e-4,Math.abs(s))),u=.018+.008*Math.sin(a*19)+.005*Math.sin(a*43+1);if(r.push(o*c,u,s*c,o*l,-.006,s*l),e<128){let t=e*2;i.push(t,t+2,t+1,t+1,t+2,t+3)}}let a=new ee;a.setAttribute(`position`,new b(r,3)),a.setIndex(i),a.computeVertexNormals();let o=new k(a,y);return o.position.copy(e.position),o.position.y=0,o.rotation.y=e.rotation.y,o.receiveShadow=!0,S.add(o),o},T=t.scale.x,E=n.scale.x,D=w(t,1.65*T,.9*T),O=w(n,E,E);return{root:S,setBackground(t){e=t,s.value=t},update(i,a,o){h.value.set(t.position.x,t.position.z,1.65*t.scale.x,.9*t.scale.z),g.value.set(n.position.x,n.position.z,n.scale.x,n.scale.z),_.value.set(t.rotation.y,n.rotation.y),v.value=+!!e.userData.integratedPhone,D.visible=v.value<.5,O.visible=v.value<.5,D.position.set(t.position.x,0,t.position.z),D.rotation.y=t.rotation.y,D.scale.set(t.scale.x/T,v.value?t.scale.x*2.5:1,t.scale.z/T),O.position.set(n.position.x,0,n.position.z),O.rotation.y=n.rotation.y,O.scale.set(n.scale.x/E,1,n.scale.z/E),u.value=+!!e.userData.closeCamp,d.value=+!!e.userData.highDetail,f.value=(1-i)*(1-a),O.scale.y=f.value*(v.value?n.scale.x*2.5:1),O.visible=v.value<.5&&f.value>.01,c.value.set(e.repeat.x,e.repeat.y,e.offset.x,e.offset.y),p.value.copy(r.position),m.value=.055*Math.sin(o*7.1)+.025*Math.sin(o*13.7)},dispose(){o.dispose(),D.geometry.dispose(),O.geometry.dispose(),y.dispose()}}}function He(e){let t=e.assetBase??`/assets/realistic-winter`,n=e.maxTextureSize>=4108,r=e.lowPower?`aurora-mobile-v1.webp`:`aurora-user-original-v1.webp`,i=!1,a=!1,o=!1,s=new AbortController,c={value:new L(1,1,0,0)},l=new A,u=new oe().load(`${t}/${r}`,()=>{i?u.dispose():(l.image=u.image,l.needsUpdate=!0,o=!0,e.onReady?.())},void 0,t=>{console.error(`[SKY TEXTURE ERROR]`,t),i||e.onError?.()});l.colorSpace=``,l.generateMipmaps=!1,l.minFilter=l.magFilter=ge;let d={uAuroraMap:{value:l},uAuroraIntensity:{value:e.intensity??.62},uAuroraGroundStrength:{value:0},uAuroraPortrait:{value:0},uAuroraTime:{value:0},uAuroraNatureBounce:{value:0},uAuroraCrop:c,uAuroraProjection:{value:new R(1,1)},uAuroraViewToWorld:{value:new D},uAuroraWorldToView:{value:new D}},f={value:null},p={value:0},h=!1,g=[],_=()=>{let e=g[+!!h];f.value=e,p.value=+!!e?.image},v=new oe,y=n=>{let r=+!!n;if(g[r]?.image)return;let a=n?`aurora-sky-portrait-mask.webp`:`aurora-sky-landscape-enhanced-mask-v1.webp`,o=t=>{i?t.dispose():(g[r]?.dispose(),g[r]=t,_(),e.onReady?.())},s=v.load(t+`/`+a,()=>{o(s)},void 0,()=>{i||e.onError?.()});s.colorSpace=``,s.generateMipmaps=!1,s.minFilter=s.magFilter=ge};y(!0),y(!1);let b=new m({transparent:!0,blending:1,depthWrite:!1,depthTest:!0,toneMapped:!1,uniforms:{...d,uPlate:{value:null},uHasPlate:{value:0},uSkyMask:f,uHasSkyMask:p,uSkyGate:{value:new R(...e.skyBlueGate??[.68,.9])},uCrop:c},vertexShader:`varying vec2 vUv;varying vec3 vAuroraIrradiance;
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
      }`}),x=new k(new V(2,2),b);return x.name=`user-original-aurora`,x.frustumCulled=!1,x.renderOrder=-20,{root:x,lighting:d,get textureVariant(){return n?`comfyui-upper-local`:`original-capability-fallback`},get ready(){return o&&!!g[+!!h]?.image},get time(){return d.uAuroraTime.value},update(e){!i&&a&&(d.uAuroraTime.value=e)},setCamera(e){e.updateMatrixWorld(),d.uAuroraViewToWorld.value.setFromMatrix4(e.matrixWorld),d.uAuroraWorldToView.value.setFromMatrix4(e.matrixWorldInverse);let t=Math.tan(N.degToRad(e.fov)*.5);d.uAuroraProjection.value.set(t*e.aspect,t)},setActive(e){i||(a=e)},setCrop(e,t=!1){c.value.set(e.repeat.x,e.repeat.y,e.offset.x,e.offset.y),b.uniforms.uPlate.value=e,b.uniforms.uHasPlate.value=1,d.uAuroraPortrait.value=+!!t,d.uAuroraNatureBounce.value=!t&&e.userData.highDetail?1:0,h=t,y(t),_()},setIrradiance(e){b.uniforms.uSharedIrradiance=e,b.vertexShader=`uniform sampler2D uSharedIrradiance;
`+b.vertexShader.replace(`vAuroraIrradiance=auroraDiffuseIrradiance(vec3(0.,1.,0.));`,`vAuroraIrradiance=texelFetch(uSharedIrradiance,ivec2(0),0).rgb;`),b.needsUpdate=!0},setIntensity(e){d.uAuroraIntensity.value=N.clamp(e,0,2)},get state(){return a&&o?`flowing`:`still`},dispose(){i||(i=!0,s.abort(),l.dispose(),g.forEach(e=>e.dispose()),x.geometry.dispose(),b.dispose())}}}function Ue(e,t,n,r){let i=new L,a=new L,o=!1,s=!1;e.onBeforeRender=e=>{if(o=!1,e.getRenderTarget()!==null||t.x<=0||t.y<=0||(e.getCurrentViewport(a),a.z<=0||a.w<=0))return;e.getScissor(i),s=e.getScissorTest();let c=e.getPixelRatio(),l=r()?.095:.084,u=r()?.018:.027,d=(n.x-t.z)/t.x,f=(1-n.y-t.w)/t.y,p=n.z*l/t.x,m=n.z*u/t.y,h=Math.max(a.x,Math.floor(a.x+(d-p)*a.z)-2),g=Math.max(a.y,Math.floor(a.y+(f-m)*a.w)-2),_=Math.min(a.x+a.z,Math.ceil(a.x+(d+p)*a.z)+2),v=Math.min(a.y+a.w,Math.ceil(a.y+(f+m)*a.w)+2);s&&(h=Math.max(h,i.x*c),g=Math.max(g,i.y*c),_=Math.min(_,(i.x+i.z)*c),v=Math.min(v,(i.y+i.w)*c)),e.setScissor(h/c,g/c,Math.max(0,_-h)/c,Math.max(0,v-g)/c),e.setScissorTest(!0),o=!0},e.onAfterRender=e=>{o&&=(e.setScissor(i),e.setScissorTest(s),!1)}}function We(e={}){let t=new x;t.name=`photographed-campfire-flame`;let n=new AbortController,r=!1,i=!0,a=!1,o=!1,s=!1,c=0,l=-1,u=document.createElement(`video`);u.muted=!0,u.loop=!0,u.playsInline=!0,u.preload=`auto`,u.crossOrigin=`anonymous`,u.setAttribute(`playsinline`,``),u.setAttribute(`muted`,``);let d=!1,f;typeof u.requestVideoFrameCallback==`function`&&(f=u.requestVideoFrameCallback(()=>{f=void 0,!r&&(d=!0,e.onReady?.())}));let h=new me(u);h.colorSpace=ue,h.minFilter=h.magFilter=ge,h.generateMipmaps=!1;let g={value:1.08},_={value:0},y={value:new L(1,1,0,0)},b={value:0},S={value:null},C={value:new j(.6105,.681,.58)},w=`uniform float uCloseCamp;${xe}
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
    }`,T=new te({color:16777215,map:h,transparent:!0,depthWrite:!1,side:2,toneMapped:!1,fog:!1,blending:5,blendEquation:100,blendSrc:201,blendDst:201});T.onBeforeCompile=e=>{Object.assign(e.uniforms,_e),e.uniforms.uFlameExposure=g,e.uniforms.uCloseCamp=_,e.uniforms.uPlateCrop=y,e.uniforms.uPortrait=b,e.uniforms.uPitLayout=C,e.vertexShader=`varying vec4 vFlameClip;
`+e.vertexShader,e.vertexShader=e.vertexShader.replace(`#include <project_vertex>`,`#include <project_vertex>
 vFlameClip=gl_Position;`),e.fragmentShader=`uniform float uFlameExposure;varying vec4 vFlameClip;
`+w+`
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
    `)},T.customProgramCacheKey=()=>`snowy-photographed-flame-distant-pit-v4`;let E=new V(4/3,1),D=new k(E,T);D.name=`real-flame-footage`,D.position.y=.32,D.renderOrder=3,t.add(D);let O=new se(16749624,12,14,1.3);O.position.set(0,.45,.04),t.add(O);let A,ne=new m({transparent:!0,depthTest:!1,depthWrite:!1,toneMapped:!1,blending:2,uniforms:{..._e,uCloseCamp:_,uPlate:S,uPlateCrop:y,uPortrait:b,uPitLayout:C,uFlames:{value:h}},vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}`,fragmentShader:`uniform sampler2D uPlate;uniform sampler2D uFlames;varying vec2 vUv;${w}
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
      }`}),re=new k(new V(2,2),ne);re.frustumCulled=!1,re.renderOrder=2,t.add(re),Ue(re,y.value,C.value,()=>b.value>.5);let ie=new ee,M=new Float32Array(60),ae=new Float32Array(20),P=413,F=()=>(P=1664525*P+1013904223>>>0,P/4294967296);for(let e=0;e<20;e++)M[e*3]=(F()-.5)*.4,M[e*3+1]=F()*1,M[e*3+2]=(F()-.5)*.4,ae[e]=F();ie.setAttribute(`position`,new p(M,3)),ie.setAttribute(`phase`,new p(ae,1));let I={value:0},ce=new m({transparent:!0,depthTest:!1,depthWrite:!1,blending:2,toneMapped:!1,uniforms:{uTime:I},vertexShader:`uniform float uTime;attribute float phase;varying float vAlpha;
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
      }`}),le=new v(ie,ce);le.name=`rising-sparks`,le.frustumCulled=!1,le.renderOrder=4,t.add(le);let de=e=>{T.map!==e&&(T.map=e,T.needsUpdate=!0)},R=()=>{if(!r){if(i&&t.userData.videoReady&&!s?(de(h),ne.uniforms.uFlames.value=h):A&&t.userData.posterReady?(de(A),ne.uniforms.uFlames.value=A):t.userData.videoReady&&(de(h),ne.uniforms.uFlames.value=h),!i||!a)o&&(l=c),(!u.paused||o)&&u.pause(),t.userData.playing=!1;else if(t.userData.videoReady&&u.paused&&!o&&!s){o=!0;let e=++c;u.play().then(()=>{o=!1,!r&&(t.userData.playing=i&&a&&!u.paused,i&&a||u.pause())},n=>{o=!1,!r&&(s=n?.name!==`AbortError`||e!==l,t.userData.playing=!1,s&&A&&t.userData.posterReady&&de(A))})}}},z=!1,B=()=>{r||z||(z=!0,u.src=e.source??`/assets/realistic-winter/flames-real-loop.mp4`,u.load())};A=new oe().load(e.poster??`/assets/realistic-winter/flames-real-poster.jpg`,n=>{r?n.dispose():(t.userData.posterReady=!0,R(),e.onReady?.())},void 0,n=>{r||(t.userData.posterError=!0,B(),e.onError?.(n))}),A.colorSpace=ue,A.generateMipmaps=!1,A.minFilter=ge,u.addEventListener(`loadeddata`,()=>{h.needsUpdate=!0,t.userData.videoReady=!0,R(),e.onReady?.()},{signal:n.signal}),u.addEventListener(`error`,()=>{t.userData.videoError=!0,e.onError?.(u.error)},{signal:n.signal}),document.addEventListener(`pointerdown`,()=>{s&&(s=!1,R())},{signal:n.signal,passive:!0}),e.deferVideo||B();let fe=new j;return{root:t,mesh:D,light:O,video:u,loadVideo:B,get motionBlocked(){return s},get framePresented(){return d||typeof u.requestVideoFrameCallback!=`function`&&u.readyState>=2&&u.currentTime>0},setComposition(e,t){_.value=+!!e.userData.closeCamp;let n=Ce(t,!!e.userData.closeCamp,e.userData.compactPit);C.value.set(n.x,n.y,n.scale),S.value=e,b.value=+!!t,y.value.set(e.repeat.x,e.repeat.y,e.offset.x,e.offset.y)},setMotion(e){i!==e&&(i=e,R())},setExposure(e){g.value=N.clamp(e,.1,3)},update(e,n,r){a=r,t.updateWorldMatrix(!0,!1),n.getWorldPosition(fe),t.worldToLocal(fe),D.rotation.y=Math.atan2(fe.x,fe.z),I.value=performance.now()*.001,O.intensity=8*(i&&a?1+.055*Math.sin(e*7.1)+.025*Math.sin(e*13.7):1),R()},pause(){a=!1,R()},dispose(){f!==void 0&&u.cancelVideoFrameCallback(f),!r&&(r=!0,n.abort(),u.pause(),u.removeAttribute(`src`),u.load(),ie.dispose(),ce.dispose(),E.dispose(),T.dispose(),re.geometry.dispose(),ne.dispose(),h.dispose(),A?.dispose(),t.clear())}}}var Ge=(e,t,n)=>{let r=N.clamp((n-e)/(t-e),0,1);return r*r*(3-2*r)};function Ke(e,t){let n=new j,r=new j,i=new j,a=new w,o=new w,s=new w,c=new j,l=new j,u=new j,d=new w,f=new w,p=new j,m=new j,h=new j,g=new w().setFromAxisAngle(new j(1,0,0),Math.PI/2),_=new w,v=new j(0,1,0),y=new ae,b=!1,x=()=>{e.updateWorldMatrix(!0,!1),t.updateWorldMatrix(!0,!1),e.getWorldPosition(n),e.getWorldQuaternion(a),e.getWorldScale(c),t.getWorldPosition(p),t.getWorldQuaternion(s),m.set(0,0,1).applyQuaternion(s).normalize(),o.copy(s).multiply(g).multiply(new w().setFromAxisAngle(v,-Math.PI/2));let l=N.clamp(n.distanceTo(p)*.2,.64,1.8);r.copy(n).add(new j(0,l,0)),h.set(0,.157,0).multiply(c).applyQuaternion(o),i.copy(p).addScaledVector(m,.58).sub(h),y.v0.copy(r),y.v1.copy(r).add(new j(0,.45,0)),y.v2.copy(i).addScaledVector(m,.26).add(new j(0,.9,0)),y.v3.copy(i),b=!0};return{begin:x,apply:t=>{b||x();let i=N.clamp(t,0,1),s=Ge(0,.15,i),g=Ge(.15,.46,i);i<.15?u.lerpVectors(n,r,s):y.getPoint(g,u),d.slerpQuaternions(a,o,Ge(.04,.46,i));let S=Ge(.46,.58,i),C=Ge(.59,.69,i);i>=.46&&(d.copy(o).multiply(_.setFromAxisAngle(v,Math.PI/2*C)),h.set(0,.157,0).multiply(c).applyQuaternion(d),u.copy(p).addScaledVector(m,N.lerp(.58,-.35,S)).sub(h));let w=u.clone();e.parent.updateWorldMatrix(!0,!1),e.position.copy(e.parent.worldToLocal(u)),e.parent.getWorldQuaternion(f).invert(),e.quaternion.copy(f).multiply(d),e.parent.getWorldScale(l),e.scale.copy(c).divide(l),e.visible=!0,e.updateWorldMatrix(!1,!0);let T=h.set(0,.157,0).applyMatrix4(e.matrixWorld);return{lift:s,travel:g,insertion:S,turn:C,lid:Ge(.69,.93,i),card:Ge(.93,1,i),keyTip:T.toArray(),socket:p.toArray(),axisError:1-Math.abs(new j(0,1,0).applyQuaternion(d).dot(m)),keyWorld:w.toArray()}},reset(){b=!1}}}function qe(e){let t=document.createElement(`canvas`);t.width=e?768:1280,t.height=e?432:720;let n=t.getContext(`2d`),r=t.width,i=t.height,a=!1,o=()=>{n.fillStyle=`#0a2030`,n.fillRect(0,0,r,i),n.strokeStyle=`#9acbdf`,n.lineWidth=r*.002,n.strokeRect(r*.035,i*.06,r*.93,i*.88),n.textBaseline=`top`,n.fillStyle=`#a8cada`,n.font=`500 ${r*.026}px "IBM Plex Sans",sans-serif`,n.fillText(`SNOWY STUDIOS`,r*.075,i*.14),n.fillStyle=`#edf8ff`,n.font=`500 ${r*.102}px "IBM Plex Sans",sans-serif`,n.fillText(`LootLabs`,r*.068,i*.36),n.fillStyle=`#a6dff6`,n.fillRect(r*.075,i*.66,r*.11,i*.006),n.font=`500 ${r*.025}px "IBM Plex Sans",sans-serif`,n.fillText(`CONTINUE VIA FLOWAUTH`,r*.075,i*.76),n.fillText(`01 / GATEWAY`,r*.7,i*.76)};o();let s=new B(t);s.colorSpace=ue,s.anisotropy=4,document.fonts.load(`500 32px "IBM Plex Sans"`).then(()=>{a||(o(),s.needsUpdate=!0)},()=>{});let c=new T({color:`#c6a46e`,metalness:.75,roughness:.3}),u=new l({map:s,roughness:.48,metalness:0}),d=new x;d.name=`free-access-card`;let f=new k(new fe(1.9,1.07,.025),[c,c,c,c,u,c]);return f.castShadow=!0,d.add(f),d.visible=!1,{root:d,update(e){d.visible=e>1e-4&&e<.9999,d.position.set(0,N.lerp(.4,2.04,e),.15),d.rotation.x=-.08*e},dispose(){a=!0,f.geometry.dispose(),u.dispose(),c.dispose(),s.dispose(),d.clear()}}}function U(r){let o=r.querySelector(`.ice-scene`),d=r.dataset.geometryTrial,f=o.clientWidth>=900&&o.clientWidth/o.clientHeight>=1.25&&!n.lowPower,p=r.querySelector(`#ice-vault-canvas`),m=r.querySelector(`#ice-vault-action`),h=new AbortController,g=h.signal,v=matchMedia(`(prefers-reduced-motion: reduce)`),y=matchMedia(`(max-width:767px), (pointer:coarse)`),b=navigator.connection,S=!1,C=!1,w=!1,T=1,E=1,D,O=-1/0,ee=-1/0,ae=0,P,F=!1,se=0,I=!1,L=0,le=!1,B=!1,fe=!1,pe=!1,he=``,ge,_e=!1,xe=!1,we=()=>{};new Promise(e=>{we=e});let Te=0,Ee=-1,De=NaN,Oe=NaN,ke=``,je=!1,Me=!1,Ne=0,H=null,Pe=0,Fe=async()=>{let e=new Set,t=t=>{t instanceof A&&t.image&&!t.isRenderTargetTexture&&!(t instanceof me)&&e.add(t)};t(W.background),t(nt),t(tt),q?.startupTextures.forEach(t),W.traverse(e=>{if(e instanceof k)for(let n of Array.isArray(e.material)?e.material:[e.material])Object.values(n).forEach(t),`uniforms`in n&&Object.values(n.uniforms).forEach(e=>t(e.value))});let n=[];for(let t of e){let e=t.image;e?.decode&&n.push(e.decode().catch(()=>{}))}if(await Promise.all(n),!(S||w||!K)){for(let t of e)K.engine.initTexture(t);S||w||(je=!0,o.dataset.uploadsReady=`true`,$())}},Le,Re=new Set,Be=()=>{Re.forEach(e=>{e.traverse(e=>{e instanceof k&&(e.geometry.dispose(),(Array.isArray(e.material)?e.material:[e.material]).forEach(e=>e.dispose()))}),e.clear()}),Re.clear(),Le?.dispose(),Le=void 0},Ue={collect:+(r.dataset.phase===`ready`)},Ge=Number(r.dataset.progress)||0,U={phase:r.dataset.phase||`waiting`,progress:Number(r.dataset.progress)||0,remaining:Number(r.dataset.remaining)||30,keyVisible:!1,canAct:!1},W=new ie;W.background=new s(getComputedStyle(r).getPropertyValue(`--melt-floor`).trim()||`#ffffff`);let G=new _(40,1,.1,500),Je=new j(0,3.1,0),Ye=new j(-8.004,.8,12.093);G.position.copy(Je).add(Ye),G.lookAt(Je);let K,q,J,Xe,Ze,Y,Qe,$e,et,X,Z,tt,nt,rt=!1,it=!1,Q,at,ot,st,ct,lt,ut=()=>!(it&&!rt||!Q?.image||!X?.ready||!q?.root.userData.materialReady||f&&!tt?.image||!J?.root.userData.materialReady||!Z?.root.userData.posterReady&&!Z?.root.userData.videoReady),dt=()=>{if(o.dataset.chestLid=String(Y?.lid??0),o.dataset.chestCard=String(Y?.card??0),o.dataset.keyInsertion=String(Y?.insertion??0),o.dataset.keyTurn=String(Y?.turn??0),Y||(delete o.dataset.keyTip,delete o.dataset.keySocket,delete o.dataset.keyAxisError),q&&(o.dataset.keyWorld=q.key.getWorldPosition(new j).toArray().join(`,`)),o.dataset.collectProgress=Ue.collect.toFixed(4),Y&&(o.dataset.chestLid=Y.lid.toFixed(4),o.dataset.chestCard=Y.card.toFixed(4),o.dataset.keyInsertion=Y.insertion.toFixed(4),o.dataset.keyTurn=Y.turn.toFixed(4),o.dataset.keyTip=Y.keyTip.join(`,`),o.dataset.keySocket=Y.socket.join(`,`),o.dataset.keyAxisError=String(Y.axisError)),o.dataset.chestReady=String(!!J),o.dataset.chestMaterialReady=String(J?.root.userData.materialReady??!1),o.dataset.chestMaterialError=String(J?.root.userData.materialError??!1),o.dataset.collecting=String(F),o.dataset.cameraPose=[...G.position.toArray(),...G.quaternion.toArray()].map(e=>e.toFixed(6)).join(`,`),o.dataset.renderCount=String(ae),o.dataset.ambientTime=se.toFixed(3),o.dataset.aurora=X?.state??`still`,o.dataset.auroraLook=`upper-local-v9`,o.dataset.auroraTexture=X?.textureVariant??`loading`,o.dataset.auroraGround=`off`,o.dataset.fire=Z?.root.userData.playing?`burning`:`still`,o.dataset.fireReady=String(Z?.root.userData.videoReady??!1),o.dataset.auroraReady=String(X?.ready??!1),o.dataset.fireVideoTime=String(Z?.video.currentTime??0),o.dataset.fireVideoDuration=String(Z?.video.duration??0),o.dataset.fireResolution=Z?[Z.video.videoWidth,Z.video.videoHeight].join(`x`):``,o.dataset.detailQuality=f?`enhanced`:`baseline`,o.dataset.auroraVideoTime=String(X?.time??0),o.dataset.meltProgress=U.progress.toFixed(3),q){o.dataset.materialStudy=String(q.root.userData.materialStudy),o.dataset.materialReady=String(q.root.userData.materialReady);let e=q.root.userData.meltwater;o.dataset.waterArea=String(e?.area??0),o.dataset.waterVolume=String(e?.visualVolume??0),o.dataset.waterHeight=String(e?.filmHeight??0),o.dataset.waterTint=String(e?.tint??``),o.dataset.waterWetness=String(e?.wetness??0),o.dataset.waterRunoff=String(e?.runoffVisible??!1);let t=q.root.userData.meltVisual;o.dataset.iceTint=String(t?.iceTint??``),o.dataset.keyReveal=String(t?.keyReveal??0),o.dataset.glowAlpha=String(t?.glowAlpha??0),o.dataset.iceScale=String(t?.iceScale??0),o.dataset.iceOpacity=String(t?.iceOpacity??0)}K&&(o.dataset.triangles=String(K.engine.info.render.triangles),o.dataset.drawCalls=String(K.engine.info.render.calls))},ft=(e=`idle`)=>{X?.setActive(!1),Z?.pause(),D?.(),D=void 0,o.dataset.renderState=e,dt()},pt=()=>{S||w||(w=!0,I=!1,F=!1,P?.kill(),ft(`fallback`),p.hidden=!0,r.dataset.effectsPresented=`false`,r.dataset.stageFallback=`true`,r.dataset.meltStage=`fallback`,r.dataset.scenePresented=`false`,cancelAnimationFrame(L),r.dispatchEvent(new CustomEvent(`melt-key-fallback`)))},mt=()=>{if(!q||U.phase!==`available`||w)return;q.root.updateMatrixWorld(!0),G.updateMatrixWorld(!0);let e=new ne().setFromObject(q.key),t=1/0,n=1/0,r=-1/0,i=-1/0;for(let a of[e.min.x,e.max.x])for(let o of[e.min.y,e.max.y])for(let s of[e.min.z,e.max.z]){let e=new j(a,o,s).project(G),c=(e.x*.5+.5)*T,l=(-e.y*.5+.5)*E;t=Math.min(t,c),r=Math.max(r,c),n=Math.min(n,l),i=Math.max(i,l)}let a=Math.max(44,r-t+24),o=Math.max(44,i-n+24);Object.assign(m.style,{left:`${Math.max(0,Math.min(T-a,(t+r-a)/2))}px`,top:`${Math.max(0,Math.min(E-o,(n+i-o)/2))}px`,width:`${Math.min(T,a)}px`,height:`${Math.min(E,o)}px`,borderRadius:`24px`})},ht=new j,gt=-1/0,_t=-1/0,vt=16,yt=96,bt=!0,xt=()=>{if(!Xe||U.phase!==`ready`||Ue.collect>=1&&!F&&!bt)return;bt=!1,Xe.root.getWorldPosition(ht),ht.project(G);let e=o.getBoundingClientRect();o.dataset.cardOrigin=`${(e.left+(ht.x*.5+.5)*T).toFixed(1)},${(e.top+(-ht.y*.5+.5)*E).toFixed(1)}`;let t=Math.min(T<700?280:320,T-32),n=N.clamp((ht.x*.5+.5)*T,Math.min(T-t/2-16,vt+t/2),T-t/2-16),r=N.clamp((-ht.y*.5+.5)*E-18,yt,E-100);(Math.abs(n-gt)>.5||Math.abs(r-_t)>.5)&&(o.style.setProperty(`--loot-x`,`${n.toFixed(1)}px`),o.style.setProperty(`--loot-y`,`${r.toFixed(1)}px`),o.dataset.lootAnchor=`${n.toFixed(1)},${r.toFixed(1)}`,gt=n,_t=r)},St=e=>{I?ft(e):(ge?.render(se,C,!v.matches),C||ft(e))},Ct=()=>{if(S||w||!C&&le||document.hidden||!K)return;if(!q||!B){St(`effects-first`);return}if(!I&&H){let e=K.engine.getContext(),t=e.clientWaitSync(H,0,0);e.deleteSync(H),H=null,t===e.WAIT_FAILED?o.dataset.gpuWarmup=`frame-fallback`:(Ne++,o.dataset.gpuWarmup=`fence-complete`)}let e=v.matches&&U.phase===`waiting`?Ge:U.progress;G.updateMatrixWorld(),X?.setCamera(G);let t=N.smoothstep(Ue.collect,.46,.72);if((e!==De||Ue.collect!==Oe||U.phase!==ke||Te!==Ee)&&(bt=!0,q.update(e,t),J&&Xe&&Ze&&(U.phase===`ready`?(Y=Ze.apply(Ue.collect),J.update(Y.lid),Xe.update(Y.card)):(J.update(0),Xe.update(0),Y=void 0)),De=e,Oe=Ue.collect,ke=U.phase,Ee=Te,et&&(et.shadow.needsUpdate=!0)),st?.update(e,t,se),Z?.setMotion(!v.matches),!ut()){St(`loading`);return}if(!je){Me||(Me=!0,Fe().catch(pt)),St(`uploading`);return}let n=String(!!Z?.root.userData.videoReady)+`:`+String(v.matches)+`:`+(U.phase===`ready`?`open`:`ice`);if(!I&&he!==n&&(he=n,Ne=0,H&&=(K.engine.getContext().deleteSync(H),null)),fe=!0,!fe){if(!pe){pe=!0;let e=n;K.engine.toneMapping=K.toneMapping,K.engine.toneMappingExposure=K.toneMappingExposure,K.engine.outputColorSpace=K.outputColorSpace;let t=K.engine,r=new x,i=new x,a=new Set;W.traverse(e=>{if(!(e instanceof k)||e===q.floor||(e===q.ice||e.name===`surface-hoar`)&&!e.visible)return;let t=Array.isArray(e.material)?e.material[0]:e.material;a.has(t)||(a.add(t),i.add(e.clone(!1))),e!==q.ice&&e.name!==`surface-hoar`&&(e.name===`user-original-aurora`||e.name===`snow-terrain`||st&&e.parent===st.root)&&r.add(e.clone(!1))}),(async()=>{let e=Promise.resolve();if(Qe&&q.ice.visible){let n=t.getRenderTarget(),i=t.getActiveCubeFace(),a=t.getActiveMipmapLevel(),o=t.toneMapping;try{t.setRenderTarget(Qe),t.toneMapping=0,e=t.compileAsync(r,G,W)}finally{t.setRenderTarget(n,i,a),t.toneMapping=o}}let n=t.compileAsync(i,G,W);await Promise.all([e,n])})().then(()=>{pe=!1,!(S||w)&&(fe=e===String(!!Z?.root.userData.videoReady)+`:`+String(v.matches)+`:`+(U.phase===`ready`?`open`:`ice`),$())}).catch(()=>pt())}St(`compiling`)}else{if(X?.setActive(C&&!v.matches),X?.update(se),Z?.setMotion(!v.matches),Z?.update(se,G,C&&!v.matches),Z){let e=T<700&&J?Math.max(1,J.root.scale.x):1;Z.light.distance=14*e;let t=1+.18*Math.sin(se*6.7)+.12*Math.cos(se*11.3)+.06*Math.sin(se*23.1);Z.light.intensity=(T<700?5:f?9:14)*e*e*t}K.render(W,G),ae++,C?(I&&!v.matches&&Z?.loadVideo(),mt(),xt(),!I&&Q?.image&&X?.ready&&q?.root.userData.materialReady&&(!f||tt?.image)&&J?.root.userData.materialReady&&(Z?.root.userData.posterReady||Z?.root.userData.videoReady)&&(I=!0,r.dataset.scenePresented=`true`,r.dataset.meltStage=`ready`,r.dispatchEvent(new CustomEvent(`melt-key-ready`)),v.matches||Z?.loadVideo())):(le=!0,o.dataset.prewarmed=`true`,X?.setActive(!1),Z?.pause(),o.dataset.renderState=`prewarmed`,dt())}},wt=e=>{if(S||w||!C||document.hidden){ft(`paused`);return}let t=n.getFrameInterval();e-O+1e-5<t||((I||xe)&&!v.matches&&Number.isFinite(O)&&(se+=Math.min(e-O,.1)),O=e,Ct(),e-ee>.25&&(dt(),ee=e),v.matches&&!F&&I&&ft())},Tt=()=>{S||w||!C||document.hidden||D||!ge?.ready&&!ut()||(o.dataset.renderState=`active`,O=-1/0,D=t(wt))},$=()=>{S||w||Pe||(Pe=requestAnimationFrame(()=>{Pe=0,!(S||w)&&(Ct(),Tt())}))},Et=e=>{let t=f&&!e?`/assets/quality-v3/snow-restored.webp`:`/assets/realistic-winter/winter-camp-${e?`portrait-v5`:`landscape-v3`}.webp`,n=new A;if(typeof createImageBitmap<`u`)new a().setOptions({imageOrientation:`flipY`,premultiplyAlpha:`none`,colorSpaceConversion:`default`}).load(t,e=>{S?e.close():(n.image=e,n.needsUpdate=!0,o.dataset.background=`photographic-winter`,Dt())},void 0,pt),n.flipY=!1;else{let e=new oe().load(t,()=>{S?e.dispose():(n.image=e.image,n.needsUpdate=!0,o.dataset.background=`photographic-winter`,Dt())},void 0,pt)}return n.colorSpace=ue,n},Dt=()=>{if(S||w||!K)return;I||(Ne=0,H&&=(K.engine.getContext().deleteSync(H),null)),Te++,cancelAnimationFrame(L),L=0;let e=o.getBoundingClientRect();T=Math.max(1,e.width),E=Math.max(1,e.height);let t=r.querySelector(`.ice-copy`)?.getBoundingClientRect();vt=t&&T>=900?Math.max(16,t.right-e.left+16):16,yt=t&&T>=700&&T<900?Math.min(E-100,t.bottom-e.top+100):96;let i=n.getDPR();K.setPixelRatio(i),K.setSize(T,E),K.engine.transmissionResolutionScale=n.lowPower?.5:1,o.dataset.transmissionScale=String(K.engine.transmissionResolutionScale),o.dataset.qualityDpr=String(i),o.dataset.qualityTier=n.lowPower?`mobile`:`desktop`;let a=T/E<1.25,s=T<900||a||matchMedia(`(pointer:coarse) and (max-width:1366px)`).matches,c=s&&!a&&T>=900,l=T<700;q?.setNaturalClarity(l),it=s,l?rt=!0:it&&!nt&&(nt=new oe().load(`/assets/quality-v3/snow-restored.webp`,e=>{S?e.dispose():(rt=!0,ve(e,it,T<700),o.dataset.phoneSnow=it?`laptop-plate`:`inactive`,$())},void 0,()=>{S||(rt=!0,o.dataset.phoneSnow=`unavailable`,$())}),nt.colorSpace=`srgb`),ve(nt,it,l),o.dataset.phoneSnow=it&&nt?.image?`laptop-plate`:`inactive`,X&&(X.lighting.uAuroraGroundStrength.value=0),o.dataset.auroraGround=`off`,o.dataset.campFraming=s?`close`:`laptop`,a&&!ot&&(ot=Et(!0)),!a&&!at&&(at=Et(!1));let u=a?ot:at;if(u&&u!==Q&&(Q=u,W.background=Q,st?.setBackground(Q)),Q?.image){let e=Q.image,t=e.width/e.height,n=T/E,r=T>=900&&!a,i=a?0:r?.12:.05;if(Q.repeat.set(Math.min(1,n/t)*(1-i),Math.min(1,t/n)*(1-i)),Q.offset.set((1-Q.repeat.x)/2-i/2,(1-Q.repeat.y)/2),Q.userData.closeCamp=r,Q.userData.highDetail=f&&!a,Q.userData.integratedPhone=l,s){let e=l||a?.51:.7,t=l?.88:a?.82:c?.86:.79,n=e*Q.repeat.x+Q.offset.x,r=1-((1-t)*Q.repeat.y+Q.offset.y),i=l?2.4:c?1.65:2;Q.userData.compactPit={x:n,y:r,zoom:i},ye(n,r,i,a)}else delete Q.userData.compactPit,ye();Q.updateMatrix(),X?.setCrop(Q,a),Z?.setComposition(Q,a)}!I||Q?.image&&X?.ready||(Ne=0,H&&=(K.engine.getContext().deleteSync(H),null),je=!1,Me=!1,I=!1,r.dataset.scenePresented=`false`,r.dataset.meltStage=`loading`,document.dispatchEvent(new CustomEvent(`melt-key-poster-state`,{detail:U.phase}))),G.aspect=T/E;let d=Math.max(1,1.5/G.aspect),p=Je.clone();!a&&T>=900?p.addScaledVector(new j(.834,0,.552),-2.6):!a&&T>=700&&p.addScaledVector(new j(.834,0,.552),-.8);let m=Ye.clone();if(a&&(p.y=4.2,m.y=-.8),G.position.copy(p).addScaledVector(m,d),G.lookAt(p),G.updateProjectionMatrix(),G.updateMatrixWorld(),q&&J&&ct&&(q.root.position.copy(ct.icePosition),q.root.scale.setScalar(ct.iceScale),J.root.position.copy(ct.chestPosition),J.root.scale.setScalar(ct.chestScale),J.root.rotation.y=-.18,q.root.rotation.y=l?.1:-.24,s)){let e=(e,t,n,r,i,a)=>{let o=new ce;o.setFromCamera(new R(t*2-1,1-n*2),G);let s=o.ray.intersectPlane(new M(new j(0,1,0),.01),new j);if(s){e.position.copy(s),e.scale.setScalar(1);for(let t=0;t<2;t++){e.updateMatrixWorld(!0);let t=1/0,n=-1/0;for(let r of[-i,i])for(let i of[-a,a]){let a=new j(r,0,i).applyMatrix4(e.matrixWorld).project(G);t=Math.min(t,a.x),n=Math.max(n,a.x)}e.scale.multiplyScalar(r*2/Math.max(.001,n-t))}}};e(J.root,l?.185:a?.2:.5,l?.83:a?.81:c?.78:.8,l?.35:a?.26:c?.19:.27,1.65,.95),e(q.root,l?.83:a?.82:c?.88:.86,l?.83:a?.81:c?.78:.8,l?.28:a?.22:c?.15:.22,1,1)}if(q&&J&&ct){let e=(e,t,n,r,i)=>{let a=o.querySelector(e);if(!a)return;t.updateWorldMatrix(!0,!1);let s=1/0,c=-1/0,l=1/0,u=-1/0;for(let e of[-n,n])for(let n of[0,i])for(let i of[-r,r]){let r=new j(e,n,i).applyMatrix4(t.matrixWorld).project(G),a=(r.x*.5+.5)*T,o=(-r.y*.5+.5)*E;s=Math.min(s,a),c=Math.max(c,a),l=Math.min(l,o),u=Math.max(u,o)}Object.assign(a.style,{left:`${s}px`,top:`${l}px`,width:`${c-s}px`,height:`${u-l}px`,transform:`none`})};e(`.winter-skeleton-chest`,J.root,1.65,.95,1.25),e(`.winter-skeleton-ice`,q.root,1,1,2)}if(Z&&Q?.image){if(a){let e=l?.878:.818,t=new ce;t.setFromCamera(new R(1.016-1,1-e*2),G);let n=t.ray.intersectPlane(new M(new j(0,1,0),-.025),new j);if(n){Z.root.position.copy(n),Z.mesh.position.y=.2;let e=n.clone().project(G),t=n.clone().add(new j(0,1,0)).project(G),r=(l?.138:.145)*2/Math.abs(t.y-e.y);Z.root.scale.setScalar(r),Z.setExposure(1.4)}}else{Z.mesh.position.y=.32;let e=Ce(!1,T>=900&&!a,Q.userData.compactPit),t=(1-(e.y+(e.originalBaseY-e.canonicalY)*e.scale)-Q.offset.y)/Q.repeat.y*2-1,n=(e.x-Q.offset.x)/Q.repeat.x*2-1,r=new ce;r.setFromCamera(new R(n,t),G);let i=r.ray.intersectPlane(new M(new j(0,1,0),-.025),new j);if(i){Z.root.position.copy(i);let t=i.clone().project(G),n=i.clone().add(new j(0,1,0)).project(G),r=e.originalHeight*e.scale/Q.repeat.y*2/Math.abs(n.y-t.y);Z.root.scale.setScalar(r*1.12),Z.setExposure(1.3)}}}if(et&&J&&q){let e=l?Math.max(1,J.root.scale.x,q.root.scale.x):1,t=l?J.root.position.clone().add(q.root.position).multiplyScalar(.5):new j;et.target.position.copy(t),et.target.updateMatrixWorld(),et.position.copy(t).add(new j(-8,12,4).multiplyScalar(e));let n=et.shadow.camera,r=l?Math.max(3.5,J.root.position.distanceTo(q.root.position)*.5+2):15;Object.assign(n,{left:-r,right:r,top:l?r:11,bottom:l?-r:-11,near:.1,far:45*e}),n.updateProjectionMatrix(),et.shadow.normalBias=.008*e,et.shadow.needsUpdate=!0}$();let h=e=>{if(!e)return null;let t=e.getWorldPosition(new j).project(G);return[+(t.x*.5+.5).toFixed(5),+(-t.y*.5+.5).toFixed(5)]};o.dataset.layoutAnchors=JSON.stringify({ice:h(q?.root),fire:h(Z?.root),chest:h(J?.root)})};r.addEventListener(`melt-key-state`,t=>{let n=t.detail;if(!n||S)return;let i=U.phase,a=U.progress;U=n,v.matches&&n.phase===`waiting`&&(i!==`waiting`||n.progress<a)&&(Ge=n.progress),n.phase===`ready`&&i!==`ready`?(P?.kill(),q?.update(1,0),Ze?.begin(),F=!v.matches&&I,r.dataset.unlocking=String(F),F?P=e.to(Ue,{collect:1,duration:4.4,ease:`none`,onUpdate:Tt,onComplete:()=>{F=!1,P=void 0,r.dataset.unlocking=`false`,$(),dt(),r.dispatchEvent(new CustomEvent(`melt-key-reveal-complete`))}}):(Ue.collect=1,r.dispatchEvent(new CustomEvent(`melt-key-reveal-complete`)))):n.phase!==`ready`&&i===`ready`&&(cancelAnimationFrame(L),L=0,I=!1,fe=!1,Ne=0,he=``,H&&K&&K.engine.getContext().deleteSync(H),H=null,r.dataset.scenePresented=`false`,r.dataset.meltStage=`loading`,document.dispatchEvent(new CustomEvent(`melt-key-poster-state`,{detail:n.phase})),F=!1,P?.kill(),P=void 0,Ue.collect=0,Ze?.reset(),r.dataset.unlocking=`false`,Y=void 0),i===n.phase?n.phase===`waiting`&&!v.matches&&Tt():$()},{signal:g}),p.addEventListener(`webglcontextlost`,e=>{e.preventDefault(),pt()},{signal:g}),document.addEventListener(`visibilitychange`,()=>{document.hidden?(P?.pause(),ft(`paused`)):(C&&P?.resume(),$())},{signal:g}),window.addEventListener(`pageshow`,$,{signal:g}),window.addEventListener(`resize`,Dt,{passive:!0,signal:g}),y.addEventListener(`change`,Dt,{signal:g}),b?.addEventListener(`change`,Dt,{signal:g}),v.addEventListener(`change`,()=>{v.matches&&(Ge=U.progress,F=!1,P?.kill(),P=void 0,U.phase===`ready`&&(Ue.collect=1,r.dataset.unlocking=`false`,r.dispatchEvent(new CustomEvent(`melt-key-reveal-complete`)))),$()},{signal:g});let Ot=new ResizeObserver(Dt);Ot.observe(o);let kt=new IntersectionObserver(([e])=>{C=e.isIntersecting&&e.intersectionRatio>=.2,C?(document.hidden||P?.resume(),$()):(P?.pause(),ft(`paused`))},{threshold:.2});return kt.observe(o),(async()=>{try{tt=new oe().load(`/assets/quality-v3/camp-detail.webp`,e=>{S?e.dispose():(e.colorSpace=ue,be(e),$())}),tt.colorSpace=ue,tt.anisotropy=8,K=new z(p,{antialias:!0}),K.toneMapping=4,K.toneMappingExposure=.95,W.background=new s(463649);let e=o.clientWidth/o.clientHeight<1.25;e?ot=Et(!0):at=Et(!1),Q=e?ot:at,W.background=Q,X=He({lowPower:n.lowPower,maxTextureSize:K.engine.capabilities.maxTextureSize,onReady:$,onError:pt,intensity:.62}),W.add(X.root),X.lighting.uAuroraGroundStrength.value=0,Z=We({deferVideo:!0,poster:`/assets/quality-v1/fire-hd-poster.webp`,onReady:()=>{le=!1,$()},onError:()=>{Z?.root.userData.posterError&&Z?.root.userData.videoError&&pt()}}),W.add(Z.root),lt={enabled:K.engine.shadowMap.enabled,type:K.engine.shadowMap.type},K.engine.shadowMap.enabled=!0,K.engine.shadowMap.type=1;let t=new de(7904196,1977664,.35);W.add(t);let a=new u(10927584,.55);a.position.set(-8,12,4),a.castShadow=!0,et=a,W.add(a.target),a.shadow.autoUpdate=!1,a.shadow.needsUpdate=!0,a.shadow.mapSize.set(n.lowPower?512:1024,n.lowPower?512:1024),Object.assign(a.shadow.camera,{left:-15,right:15,top:11,bottom:-11,near:.1,far:45}),a.shadow.radius=n.lowPower?2.25:4.5,a.shadow.bias=-15e-5,a.shadow.normalBias=.008,W.add(a);let f=new u(7903422,.26);f.position.set(4,2.8,1.5),W.add(f);let m=new u(7445451,.32);if(m.position.set(1,4,-3),W.add(m),Dt(),$(),X.lighting.uAuroraGroundStrength.value=0,o.dataset.auroraDiffuse=`off`,_e=!0,ge=Se({surface:K,scene:W,camera:G,sky:X,fire:Z,background:()=>Q,ready:()=>_e&&(!it||rt),hidden:()=>[q?.root,J?.root,st?.root],irradiance:()=>{},onReady:$,onError:pt,onFirst:e=>{xe=!0,r.dataset.effectsPresented=`true`,o.dataset.effectsFirstFrameAt=String(performance.now()),o.dataset.effectsGpuWarmup=e,we(),$()}}),$(),await new Promise(e=>requestAnimationFrame(()=>requestAnimationFrame(()=>e()))),S||w||(await Ae(32),S||w))return;q=Ie(32,3,$,pt,{highDetail:!1,naturalClarity:o.clientWidth<700,compactGeometry:!0}),W.add(q.root);let h=new j(.834,0,.552),g=new j(-.552,0,.834),_=o.clientWidth>=900&&o.clientWidth/o.clientHeight>=1.25;q.root.position.copy(h).multiplyScalar(_?-2.6+.58*Math.tan(N.degToRad(20))*(14.5*Math.max(1,1.5/(o.clientWidth/o.clientHeight))-1.2)*(o.clientWidth/o.clientHeight):4.9).addScaledVector(g,_?1.2:-5.2),q.root.scale.setScalar(_?.7:1.2),q.root.rotation.y=-.24,q.root.position.y=-.01;let v=q.floor.material.onBeforeCompile;if(q.floor.material.onBeforeCompile=(e,t)=>{v(e,t),e.fragmentShader=e.fragmentShader.replace(`return .94*(1.-.12*pow`,`return .7332*(1.-.12*pow`).replace(`vec2 iceCenter(){return vec2(0.);}`,`vec2 iceCenter(){return vec2(${q.root.position.x.toFixed(6)},${q.root.position.z.toFixed(6)});}`).replace(`.44+.56*contact`,`.44+.56*max(contact,1.-smoothstep(1.4,2.2,length(vShadowFloor-vec2(${J.root.position.x.toFixed(6)},${J.root.position.z.toFixed(6)}))))`)},q.floor.visible=!1,q.floor.material.customProgramCacheKey=()=>`snowy-chest-layout-contact-v2`,J=ze({highDetail:!1,lowPower:!0,compactGeometry:!1,onReady:$,onError:pt}),J.root.position.copy(h).multiplyScalar(_?-3.45:-1.8).addScaledVector(g,_?.8:-5.2),J.root.position.y=-.01,J.root.rotation.y=-.18,J.root.scale.setScalar(_?.9:1.08),W.add(J.root),d){let e=0,t=0;for(let n of[J.root,q.key])n.traverse(n=>{if(!(n instanceof k))return;let r=n.geometry.getAttribute(`position`).count;t+=r,e+=(n.geometry.index?.count??r)/3*(n instanceof re?n.count:1)});r.dataset.trialPropTriangles=String(e),r.dataset.trialPropVertices=String(t)}if(S||w)return;ct={icePosition:q.root.position.clone(),iceScale:q.root.scale.x,chestPosition:J.root.position.clone(),chestScale:J.root.scale.x},st=Ve(Q,J.root,q.root,Z.root,X.lighting,void 0),W.add(st.root),Xe=qe(n.lowPower),J.root.add(Xe.root),Ze=Ke(q.key,J.keySocket),U.phase===`ready`&&(q.update(1,0),Ze.begin());let y=Le=new i(K.engine),b=new ie;Re.add(b),b.background=new s(.035,.065,.1);for(let[e,t,n,r,i]of[[-4,4,5.5,3,1.1],[4,5,-3,2.8,.6],[-4,2.8,-5,2.4,.8]]){let a=new k(new c(r,24,16),new te({color:new s(1,.98,.95).multiplyScalar(i),toneMapped:!1}));a.position.set(e,t,n),b.add(a)}let x=new k(new V(3.5,4.5),new te({color:new s(1,.97,.88).multiplyScalar(.75),side:2,toneMapped:!1}));x.position.set(3.8,2.8,5.5),x.lookAt(0,1,0),b.add(x);let C=new k(new V(5,3),new te({color:new s(1,.87,.68).multiplyScalar(.9),side:2,toneMapped:!1}));if(C.position.set(-4,-1.8,6),C.lookAt(0,.7,0),b.add(C),S||w)return;Qe=$e=y.fromScene(b,.055),W.environment=Qe.texture,J.root.traverse(e=>{if(e instanceof k)for(let t of Array.isArray(e.material)?e.material:[e.material])t instanceof l&&(t.envMap=Qe.texture,t.envMapIntensity=t.metalness>.5?.75:.45)}),Be(),B=!0,o.dataset.composition=`chest-left-fire-front-ice-right-v2`,o.dataset.chest=`walnut`,o.dataset.camera=`perspective-fixed`,o.dataset.viewAngle=`0`,o.dataset.renderer=`three-webgl`,Dt(),$()}catch(e){pt(),console.warn(`Melt key visual unavailable; native controls remain usable.`,e)}finally{Be()}})(),()=>{S||(S=!0,Be(),cancelAnimationFrame(L),cancelAnimationFrame(0),cancelAnimationFrame(Pe),H&&K&&K.engine.getContext().deleteSync(H),H=null,F=!1,P?.kill(),ft(),h.abort(),Ot.disconnect(),kt.disconnect(),ge?.dispose(),ve(),nt?.dispose(),ye(),be(),tt?.dispose(),st?.dispose(),X?.dispose(),Z?.dispose(),at?.dispose(),ot?.dispose(),Xe?.dispose(),J?.dispose(),q?.dispose(),W.traverse(e=>{e instanceof u&&e.shadow.dispose()}),W.environment=null,Qe?.dispose(),$e?.dispose(),K&&lt&&(K.engine.shadowMap.enabled=lt.enabled,K.engine.shadowMap.type=lt.type),K?.dispose(),W.clear())}}export{U as initMeltKeyStage};