import * as THREE from 'three';

export function createCampfire(lowPower:boolean){
  const root=new THREE.Group();root.name='campfire';
  let seed=413;const random=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;};
  const time={value:0};
  const bark=new THREE.MeshStandardMaterial({color:0x31241d,roughness:.95});
  bark.onBeforeCompile=s=>{
    s.fragmentShader=s.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>
      float streak=sin(vBarkUv.x*200.+sin(vBarkUv.y*15.)*3.)*.5+.5;
      float charred=1.-smoothstep(.18,.48,abs(vBarkUv.y-.5));
      diffuseColor.rgb*=mix(.55,1.25,streak)*mix(1.,.22,charred);`);
    s.vertexShader='varying vec2 vBarkUv;\n'+s.vertexShader;s.vertexShader=s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n vBarkUv=uv;');
    s.fragmentShader='varying vec2 vBarkUv;\n'+s.fragmentShader;
  };
  const logGeometry=new THREE.CylinderGeometry(.12,.16,1.45,12,4);
  for(let i=0;i<6;i++){
    const a=i*Math.PI/3+.2,log=new THREE.Mesh(logGeometry,bark);
    log.position.set(Math.cos(a)*.20,.17+(i%2)*.12,Math.sin(a)*.20);
    log.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),new THREE.Vector3(Math.cos(a),.12,Math.sin(a)).normalize());
    log.castShadow=true;log.receiveShadow=true;root.add(log);
  }
  const pitMaterial=new THREE.MeshStandardMaterial({color:0x13171b,roughness:1});
  const pit=new THREE.Mesh(new THREE.CylinderGeometry(.75,.78,.018,32),pitMaterial);pit.position.y=.005;root.add(pit);
  const stoneGeometry=new THREE.IcosahedronGeometry(1,2),stoneMaterial=new THREE.MeshStandardMaterial({color:0x56616a,roughness:1});
  const stones=new THREE.InstancedMesh(stoneGeometry,stoneMaterial,15),dummy=new THREE.Object3D();
  for(let i=0;i<15;i++){const a=i/15*Math.PI*2;dummy.position.set(Math.cos(a)*.88,.13,Math.sin(a)*.88);dummy.rotation.set(random(),random()*6,random());dummy.scale.set(.16+random()*.11,.13+random()*.06,.16+random()*.08);dummy.updateMatrix();stones.setMatrixAt(i,dummy.matrix);stones.setColorAt(i,new THREE.Color().setScalar(.45+random()*.4));}
  stones.castShadow=true;stones.receiveShadow=true;root.add(stones);
  const coalMaterial=new THREE.MeshStandardMaterial({color:0x260b03,emissive:0xff3c06,emissiveIntensity:1.6,roughness:1});
  const coalGeometry=new THREE.IcosahedronGeometry(.11,1),coals=new THREE.InstancedMesh(coalGeometry,coalMaterial,22);
  for(let i=0;i<22;i++){const a=random()*Math.PI*2,r=random()*.51;dummy.position.set(Math.cos(a)*r,.06,Math.sin(a)*r);dummy.rotation.set(random(),random(),random());dummy.scale.set(1,.35+random()*.5,1);dummy.updateMatrix();coals.setMatrixAt(i,dummy.matrix);coals.setColorAt(i,new THREE.Color().setScalar(.15+random()*.6));}root.add(coals);
  const flameMaterial=new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,toneMapped:false,
    uniforms:{uTime:time},vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader:`precision highp float;uniform float uTime;varying vec2 vUv;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+1.),f.x),f.y);}
      float fbm(vec2 p){return .57*noise(p)+.28*noise(p*2.07)+.15*noise(p*4.13);}
      void main(){
        float y=vUv.y,x=(vUv.x-.5)*2.;float t=uTime;
        float n=fbm(vec2(x*3.+sin(y*6.-t*3.)*.4,y*4.5-t*2.6));
        float bend=.15*sin(y*7.-t*2.1)*y+.08*sin(t*3.7+y*11.)*y;
        float width=.62*pow(max(0.,1.-y),1.25);
        float field=width-abs(x-bend)+(n-.48)*(.35+.5*y);
        float alpha=smoothstep(-.045,.14,field)*smoothstep(0.,.08,y)*(1.-smoothstep(.77,1.,y));
        float core=smoothstep(.06,.44,field)*(1.-smoothstep(.05,.48,y));
        vec3 colour=mix(vec3(1.,.10,.006),vec3(1.,.53,.035),smoothstep(-.02,.2,field));
        colour=mix(colour,vec3(1.,.88,.37),core);
        gl_FragColor=vec4(colour*1.5,alpha*.85);
        #include <colorspace_fragment>
      }`});
  const flames=new THREE.Group();flames.name='moving-flames';
  const flameGeometry=new THREE.PlaneGeometry(1.9,1.8);
  const mainFlame=new THREE.Mesh(flameGeometry,flameMaterial);mainFlame.position.y=1.;flames.add(mainFlame);root.add(flames);
  const count=lowPower?18:36,embersGeometry=new THREE.BufferGeometry(),embers=new Float32Array(count*3),phases=new Float32Array(count);
  for(let i=0;i<count;i++){embers[i*3]=(random()-.5)*.8;embers[i*3+1]=random()*2.7;embers[i*3+2]=(random()-.5)*.8;phases[i]=random();}
  embersGeometry.setAttribute('position',new THREE.BufferAttribute(embers,3));embersGeometry.setAttribute('phase',new THREE.BufferAttribute(phases,1));
  const emberMaterial=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false,uniforms:{uTime:time},
    vertexShader:`uniform float uTime;attribute float phase;varying float vAlpha;void main(){vec3 p=position;float life=fract(phase+uTime*.21);p.y=.3+life*2.8;p.x+=sin(life*6.+phase*9.)*.18*life;p.z+=cos(life*5.+phase*13.)*.2*life;vAlpha=(1.-life)*smoothstep(0.,.12,life);vec4 v=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*v;gl_PointSize=clamp(34./-v.z,1.,4.);}`,
    fragmentShader:`varying float vAlpha;void main(){float r=length(gl_PointCoord-.5);gl_FragColor=vec4(1.,.40,.06,(1.-smoothstep(.08,.5,r))*vAlpha);}`});
  const sparks=new THREE.Points(embersGeometry,emberMaterial);sparks.frustumCulled=false;root.add(sparks);
  const light=new THREE.PointLight(0xffa34e,18,13,2);light.position.set(0,.85,0);root.add(light);
  return{root,update(t:number,camera:THREE.Camera){time.value=t;flames.rotation.y=Math.atan2(camera.position.x,camera.position.z);light.intensity=18*(1.+.08*Math.sin(t*7.1)+.04*Math.sin(t*13.7));coalMaterial.emissiveIntensity=1.5+.2*Math.sin(t*3.);},dispose(){root.traverse(o=>{if(o instanceof THREE.Mesh||o instanceof THREE.Points){o.geometry.dispose();for(const m of Array.isArray(o.material)?o.material:[o.material])m.dispose();}});root.clear();}};
}
