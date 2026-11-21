import * as THREE from 'three';
import {QualityTier} from '../core/QualityTier';
import {PricingFieldPointer} from './PricingFieldPointer';

/** Analytic guilloche, coin wavefronts and restrained specular accents.
 * All layers share the payment scene, depth buffer and animation clock. */
export function createPricingOptics(objects:THREE.Group,card:THREE.Group,coins:THREE.Group[],camera:THREE.Camera){
  const interaction=new PricingFieldPointer(camera);
  const geometries=new Set<THREE.BufferGeometry>(),materials=new Set<THREE.Material>();
  const root=new THREE.Group();root.name='pricing-optical-field';objects.add(root);
  const vertexShader=`varying vec2 vPoint;void main(){vPoint=position.xy;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`;
  const phase={value:0},energy={value:1};
  const viewport={value:new THREE.Vector2(innerWidth,innerHeight)},dpr={value:QualityTier.getDPR()};
  function geometry<T extends THREE.BufferGeometry>(g:T){geometries.add(g);return g;}
  function material(fragmentShader:string,uniforms:Record<string,THREE.IUniform>={}){
    const m=new THREE.ShaderMaterial({vertexShader,fragmentShader,uniforms:{uPhase:phase,uEnergy:energy,uViewport:viewport,uDpr:dpr,...uniforms},transparent:true,depthWrite:false,depthTest:true,toneMapped:false,side:THREE.DoubleSide,forceSinglePass:true});
    materials.add(m);return m;
  }
  function mesh(g:THREE.BufferGeometry,m:THREE.Material,parent:THREE.Object3D=root){const item=new THREE.Mesh(g,m);parent.add(item);return item;}
  const fieldVertexShader=`
    varying vec2 vPoint;varying vec3 vNormal,vView;
    uniform vec3 uPointer;uniform vec4 uWakes[2];uniform vec2 uSpan;uniform float uPhase;
    vec3 surface(vec2 p,out vec3 normal){
      float r=length(p),a=atan(p.y,p.x);
      float t=clamp((r-uSpan.x)/uSpan.y,0.0,1.0);
      vec2 radial=p/max(r,0.001);
      float width=uSpan.x>2.0?0.62:0.48;
      vec2 offset=p-uPointer.xy;float d=length(offset);
      float weight=exp(-dot(offset,offset)/(width*width))*uPointer.z;
      vec2 gradient=-2.0*offset/(width*width)*weight;
      float z=sin(t*3.14159265)*(uSpan.x>2.0?0.065:0.025);
      vec2 dz=radial*cos(t*3.14159265)*3.14159265/uSpan.y*(uSpan.x>2.0?0.065:0.025);
      z+=weight*0.44;
      dz+=gradient*0.44;
      float bend=weight*0.17;
      vec2 bendGradient=gradient*0.17;
      for(int i=0;i<2;i++){
        float distance=length(p-uWakes[i].xy),age=uWakes[i].z;
        float front=(distance-age*0.85)/0.30;
        float envelope=exp(-age*3.8)*exp(-front*front)*uWakes[i].w;
        float q=distance*10.0-age*7.0;
        z+=sin(q)*envelope*0.085;
        dz+=(p-uWakes[i].xy)/max(distance,0.001)*envelope*0.085*(10.0*cos(q)-sin(q)*2.0*front/0.30);
      }
      vec2 dx=vec2(1.0,0.0)+radial*bendGradient.x+bend/max(r,0.001)*(vec2(1.0,0.0)-radial*radial.x);
      vec2 dy=vec2(0.0,1.0)+radial*bendGradient.y+bend/max(r,0.001)*(vec2(0.0,1.0)-radial*radial.y);
      normal=normalize(cross(vec3(dx,dz.x),vec3(dy,dz.y)));
      // Material coordinates stay fixed; the complete surface bends in 3D.
      return vec3(p+radial*bend,z);
    }
    void main(){
      vPoint=position.xy;
      vec3 normal;vec3 p=surface(position.xy,normal);
      vNormal=normalize(normalMatrix*normal);
      vec4 view=modelViewMatrix*vec4(p,1.0);vView=-view.xyz;
      gl_Position=projectionMatrix*view;
    }`;
  const fieldLight=`
    vec3 fieldLighting(vec3 color){
      vec3 n=normalize(vNormal);if(!gl_FrontFacing)n=-n;
      vec3 light=normalize(vec3(-0.45,0.65,1.0));
      float diffuse=max(dot(n,light),0.0);
      vec3 halfway=normalize(light+normalize(vView));
      float specular=pow(max(dot(n,halfway),0.0),36.0);
      return color*(0.50+diffuse*0.70)+vec3(0.22,0.31,0.42)*specular*0.48;
    }`;
  // One radial mesh carries the etching and the local pointer deformation.
  const frameInner=2.97, frameOuter=3.42;
  const bandPresence={value:1};
  const engravingAngle={value:0};
  const positions:number[]=[],indices:number[]=[];
  for(let i=0;i<=384;i++)for(let j=0;j<=12;j++){
    const r=THREE.MathUtils.lerp(frameInner,frameOuter,j/12);
    const angle=i/384*Math.PI*2;positions.push(Math.cos(angle)*r,Math.sin(angle)*r,0);
  }
  for(let i=0;i<384;i++)for(let j=0;j<12;j++){const n=i*13+j;indices.push(n,n+1,n+13,n+1,n+14,n+13);}
  const bandGeometry=geometry(new THREE.BufferGeometry());bandGeometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));bandGeometry.setIndex(indices);bandGeometry.computeBoundingSphere();
  const bands=mesh(bandGeometry,material(`
    varying vec2 vPoint;varying vec3 vNormal,vView;uniform float uEnergy,uDpr,uPresence,uEngravingAngle;uniform vec2 uViewport,uSpan;
    ${fieldLight}
    float thread(float p){float s=sin(p);float aa=max(fwidth(s)*0.65,0.02);return 1.0-smoothstep(0.18-aa,0.18+aa,abs(s));}
    void main(){
      float r=length(vPoint),a=atan(vPoint.y,vPoint.x);
      float t=(r-uSpan.x)/uSpan.y;
      float edge=smoothstep(0.0,0.07,t)*(1.0-smoothstep(0.93,1.0,t));
      // Rotate the engraving in the material so the pointer field stays in place.
      float engraved=a-uEngravingAngle;
      float bend=sin(engraved*5.0)*0.95+cos(engraved*9.0)*0.23;
      float warp=t*16.0+bend;
      float first=thread(engraved*84.0+warp),second=thread(engraved*84.0-warp);
      // Analytic footprint has no atan-derivative seam at +/- pi.
      float footprint=length(fwidth(vPoint))*(84.0/max(r,0.1)+32.0);
      float resolved=1.0-smoothstep(1.5,3.3,footprint);
      float weave=max(first,second)*resolved;
      float lightArc=smoothstep(-0.24,0.93,cos(engraved-0.45));
      float cyanArc=smoothstep(-0.1,0.9,cos(engraved+2.38));
      vec3 deepCyan=vec3(0.024,0.195,0.36), frost=vec3(0.266,0.585,0.644);
      vec3 color=mix(deepCyan,frost,lightArc*0.82);
      color=mix(color,vec3(0.085,0.39,0.48),cyanArc*0.72);
      float borderDistance=min(min(abs(t-0.02),abs(t-0.98)),abs(t-0.16));
      float rim=1.0-smoothstep(0.008,0.008+max(fwidth(t),0.004),borderDistance);
      vec2 pixel=gl_FragCoord.xy/uDpr,margin=min(pixel,uViewport-pixel);
      float frameFade=smoothstep(2.0,26.0,min(margin.x,margin.y));
      gl_FragColor=vec4(fieldLighting(color),(weave*0.57*edge*(0.72+0.28*lightArc)+rim*0.42)*uEnergy*frameFade*uPresence);
      #include <colorspace_fragment>
    }`,{uPresence:bandPresence,uEngravingAngle:engravingAngle}));bands.name='engraved-ice-frame';bands.position.z=-.48;
  const bandMaterial=bands.material as THREE.ShaderMaterial;
  bandMaterial.vertexShader=fieldVertexShader;Object.assign(bandMaterial.uniforms,interaction.attach(bands,frameInner,frameOuter),{uSpan:{value:new THREE.Vector2(frameInner,frameOuter-frameInner)}});
  bandGeometry.boundingSphere!.radius+=.85;
  const rippleGeometry=geometry(new THREE.RingGeometry(.65,1.65,144,12));rippleGeometry.boundingSphere=new THREE.Sphere(new THREE.Vector3(),2.4);
  const ripples=coins.map((coin,index)=>{
    const m=material(`
      varying vec2 vPoint;varying vec3 vNormal,vView;uniform float uPhase,uEnergy,uDpr;uniform vec2 uViewport;uniform vec3 uColor;
      ${fieldLight}
      void main(){
        float r=length(vPoint),d=r-0.65;
        float p=d*44.0-uPhase;
        float s=sin(p),aa=max(fwidth(s)*0.6,0.025);
        float line=1.0-smoothstep(0.15-aa,0.15+aa,abs(s));
        float envelope=pow(clamp(1.0-d,0.0,1.0),1.7)*smoothstep(0.0,0.065,d);
        float inner=exp(-d*14.0)*0.18;
        float resolved=1.0-smoothstep(1.5,3.0,length(fwidth(vPoint))*44.0);
        vec2 pixel=gl_FragCoord.xy/uDpr,margin=min(pixel,uViewport-pixel);
        float frameFade=smoothstep(2.0,26.0,min(margin.x,margin.y));
        gl_FragColor=vec4(fieldLighting(uColor),(line*envelope*0.76*resolved+inner)*uEnergy*frameFade);
        #include <colorspace_fragment>
      }`,{uColor:{value:new THREE.Color(index?'#8dc9d2':'#d8b979')}});
    const ring=mesh(rippleGeometry,m);ring.name=`coin-wavefront-${index}`;
    m.vertexShader=fieldVertexShader;Object.assign(m.uniforms,interaction.attach(ring,.65,1.65),{uSpan:{value:new THREE.Vector2(.65,1)}});
    return{coin,ring};
  });
  function rounded(w:number,h:number,r:number){
    const s=new THREE.Shape(),x=-w/2,y=-h/2;
    s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);return s;
  }
  const outline=rounded(2.81,4.36,.22);outline.holes.push(new THREE.Path(rounded(2.69,4.24,.17).getPoints(48)));
  // Bounded, open-centre falloff around the physical card, never a full-screen
  // silhouette patch. It supplies the reference's soft violet rim radiance.
  const auraShape=rounded(3.36,4.91,.48);auraShape.holes.push(new THREE.Path(rounded(2.7,4.25,.18).getPoints(48)));
  const aura=mesh(geometry(new THREE.ShapeGeometry(auraShape,16)),material(`
    varying vec2 vPoint;uniform float uPhase;
    void main(){
      vec2 q=abs(vPoint)-vec2(1.35,2.125)+0.18;
      float d=length(max(q,0.0))+min(max(q.x,q.y),0.0)-0.18;
      float alpha=exp(-max(d,0.0)*13.0)*smoothstep(0.0,0.025,d)*(1.0-smoothstep(0.20,0.32,d));
      vec3 color=mix(vec3(0.024,0.195,0.36),vec3(0.085,0.39,0.48),0.5+0.5*sin(uPhase));
      gl_FragColor=vec4(color,alpha*0.27);
      #include <colorspace_fragment>
    }`),card);aura.position.z=-.075;aura.name='bounded-card-radiance';
  const rim=mesh(geometry(new THREE.ShapeGeometry(outline,16)),material(`
    varying vec2 vPoint;uniform float uPhase;
    void main(){
      float a=atan(vPoint.y,vPoint.x);
      float crest=pow(0.5+0.5*cos(a*2.0-uPhase),12.0);
      vec3 color=mix(vec3(0.26,0.39,0.82),vec3(0.72,0.85,1.0),crest);
      gl_FragColor=vec4(color,0.32+crest*0.42);
      #include <colorspace_fragment>
    }`),card);rim.name='card-optical-rim';
  const faceGeometry=geometry(new THREE.ShapeGeometry(rounded(2.7,4.25,.18),16));
  const sheenMaterial=material(`
    varying vec2 vPoint;uniform float uPhase;
    void main(){
      float sweep=(uPhase/6.283185)*8.0-4.0;
      float d=vPoint.x+vPoint.y*0.38-sweep;
      float line=exp(-d*d*90.0),shoulder=exp(-d*d*12.0)*0.12;
      vec3 blue=vec3(0.40,0.65,1.0),warm=vec3(0.94,0.78,0.45);
      vec3 color=mix(blue,warm,smoothstep(-0.12,0.12,d));
      gl_FragColor=vec4(color,(line*0.32+shoulder)*smoothstep(-3.7,-3.0,sweep)*(1.0-smoothstep(3.0,3.7,sweep)));
      #include <colorspace_fragment>
    }`);
  const frontSheen=mesh(faceGeometry,sheenMaterial,card);frontSheen.position.z=.063;frontSheen.renderOrder=1;
  const backSheen=mesh(faceGeometry,sheenMaterial,card);backSheen.position.z=-.063;backSheen.rotation.y=Math.PI;backSheen.renderOrder=1;
  const sparkleGeometry=geometry(new THREE.BufferGeometry());sparkleGeometry.setAttribute('position',new THREE.Float32BufferAttribute(new Float32Array(15),3));
  const entranceEdge={value:0};
  const sparkleMaterial=new THREE.ShaderMaterial({
    uniforms:{uPhase:phase,uEntranceEdge:entranceEdge,uDpr:{value:QualityTier.getDPR()}},transparent:true,depthTest:true,depthWrite:false,toneMapped:false,blending:THREE.AdditiveBlending,
    vertexShader:`uniform float uDpr,uEntranceEdge;void main(){gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);gl_PointSize=(40.0+52.0*uEntranceEdge)*uDpr;}`,
    fragmentShader:`uniform float uPhase,uEntranceEdge;void main(){vec2 p=gl_PointCoord-0.5;float core=exp(-dot(p,p)*150.0);float rays=exp(-abs(p.x)*75.0-abs(p.y)*9.0)+exp(-abs(p.y)*75.0-abs(p.x)*9.0);float fade=0.65+0.35*sin(uPhase*2.0);vec2 diagonal=vec2(p.x+p.y,p.x-p.y)*0.7071;float streak=exp(-abs(diagonal.x)*115.0-abs(diagonal.y)*5.5);float edge=mix(1.0,1.0-smoothstep(0.18,0.5,length(p)),uEntranceEdge);vec3 light=mix(vec3(0.8,0.9,1.0),vec3(0.78,0.55,1.0),uEntranceEdge*0.6);gl_FragColor=vec4(light,(core+rays*0.32+streak*uEntranceEdge*0.82)*fade*edge);#include <colorspace_fragment>}`.replace(';#include',';\n#include'),
  });materials.add(sparkleMaterial);
  const sparkles=new THREE.Points(sparkleGeometry,sparkleMaterial);sparkles.frustumCulled=false;sparkles.renderOrder=2;root.add(sparkles);
  const point=new THREE.Vector3();
  const rimPath=rounded(2.77,4.32,.2).getSpacedPoints(192);
  return{
    setVisible(value:boolean){root.visible=value;rim.visible=value;aura.visible=value;frontSheen.visible=value;backSheen.visible=value;if(!value)interaction.suspend();},
    update(time:number,velocity:number,reduced:boolean,bandLift=card.position.y,framePresence=1,bandOffset=0,edgeLight=0,dockAmount=0){
      phase.value=reduced?0:(time%12)/12*Math.PI*2;energy.value=1+Math.min(Math.abs(velocity)/200,.08);
      engravingAngle.value=reduced?0:(time%32)/32*Math.PI*2;
      viewport.value.set(innerWidth,innerHeight);dpr.value=QualityTier.getDPR();
      bands.rotation.set(.08+Math.sin(card.rotation.z)*.04,Math.sin(card.rotation.y)*.13,Math.sin(card.rotation.y)*.04+Math.sin(phase.value)*.015);
      bands.position.y=bandLift*.3*(1-dockAmount)+bandOffset;
      bands.position.z=-.48-.18*dockAmount;
      entranceEdge.value=edgeLight;
      bandPresence.value=framePresence;
      bands.scale.setScalar(.92+.08*framePresence);
      const rippleBack=.13+.15*dockAmount;
      for(const {coin,ring} of ripples){ring.position.copy(coin.position);ring.position.z-=rippleBack;ring.scale.copy(coin.scale);ring.rotation.set(Math.sin(coin.rotation.x)*.1,Math.sin(coin.rotation.y)*.15,0);}
      interaction.update(time,reduced);
      const a=sparkleGeometry.getAttribute('position');
      for(let i=0;i<5;i++){
        const target=i<3?card:coins[i-3];
        if(i<3){const t=((phase.value/(Math.PI*2)+i/3)%1)*192,n=Math.floor(t),f=t-n;point.set(THREE.MathUtils.lerp(rimPath[n].x,rimPath[n+1].x,f),THREE.MathUtils.lerp(rimPath[n].y,rimPath[n+1].y,f),Math.cos(card.rotation.y)>=0?.08:-.08);}
        else point.set(Math.cos(phase.value+i)*.59,Math.sin(phase.value+i)*.59,.09);
        point.multiply(target.scale).applyEuler(target.rotation).add(target.position);a.setXYZ(i,point.x,point.y,point.z);
      }
      a.needsUpdate=true;sparkleMaterial.uniforms.uDpr.value=QualityTier.getDPR();
    },
    dispose(){interaction.dispose();objects.remove(root);card.remove(rim,aura,frontSheen,backSheen);geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());},
  };
}
