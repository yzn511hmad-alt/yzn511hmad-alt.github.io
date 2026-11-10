import * as THREE from 'three';

const hash=(x:number,z:number)=>{const n=Math.sin(x*127.1+z*311.7)*43758.5453;return n-Math.floor(n);};
function noise(x:number,z:number){const i=Math.floor(x),j=Math.floor(z);let u=x-i,v=z-j;u=u*u*(3-2*u);v=v*v*(3-2*v);return THREE.MathUtils.lerp(THREE.MathUtils.lerp(hash(i,j),hash(i+1,j),u),THREE.MathUtils.lerp(hash(i,j+1),hash(i+1,j+1),u),v);}

/** Seeded conifer boughs, a quiet distant ridge, and a retained snowman.
 * All visible silhouettes share the props' perspective and depth buffer. */
export function createWinterLandscape(lowPower:boolean){
  const root=new THREE.Group();root.name='winter-landscape';root.rotation.y=-.585;
  let seed=2184;const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  const dummy=new THREE.Object3D();
  const snow=new THREE.MeshStandardMaterial({color:0xc5d5df,roughness:.94});
  const bark=new THREE.MeshStandardMaterial({color:0x303035,roughness:1});
  const nearTrees:{x:number,z:number,h:number,r:number}[]=[];
  for(let i=0;i<22;i++){
    const side=i%2?1:-1,z=-1-Math.floor(i/2)*2.9-rnd()*3;
    nearTrees.push({x:side*(8.4+rnd()*8+Math.max(0,-z-15)*.13),z,h:5.5+rnd()*4,r:rnd()*6.28});
  }
  // Two closer framing pines, kept outside the interaction area.
  nearTrees.push({x:-10.5,z:-4,h:8.6,r:.3},{x:11.4,z:-6,h:9.3,r:2.1});
  // Closed, irregular layered crowns retain a full canopy between branch tips.
  const crown=(segments:number,levels:number)=>{
    const p:number[]=[],indices:number[]=[],colours:number[]=[];
    for(let j=0;j<=levels;j++)for(let k=0;k<=segments;k++){
      const f=j/levels,a=k/segments*Math.PI*2;
      const fold=Math.sin(f*11.*Math.PI*2+Math.sin(a*3.)*.7);
      const ring=.78+.17*fold;
      const uneven=.90+.10*Math.sin(a*7.+f*17.)+.045*Math.sin(a*13.-f*31.);
      const radius=Math.pow(1-f,.88)*ring*uneven;
      p.push(Math.cos(a)*radius,f+Math.pow(1-f,1.6)*.023*Math.sin(a*6.+f*29.),Math.sin(a)*radius);
      if(j<levels&&k<segments){const n=j*(segments+1)+k;indices.push(n,n+segments+1,n+1,n+1,n+segments+1,n+segments+2);}
    }
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setIndex(indices);g.computeVertexNormals();
    const normals=g.getAttribute('normal');
    for(let j=0;j<normals.count;j++){
      const x=p[j*3],y=p[j*3+1],z=p[j*3+2],a=Math.atan2(z,x);
      const mantle=THREE.MathUtils.smoothstep(normals.getY(j)+.10*Math.sin(a*9.+y*53.),.25,.78);
      const colour=new THREE.Color(0x263c48).lerp(new THREE.Color(0xa5bbce),mantle);
      colour.multiplyScalar(.93+.07*noise(x*30.,z*30.+y*4));colours.push(colour.r,colour.g,colour.b);
    }
    g.setAttribute('color',new THREE.Float32BufferAttribute(colours,3));return g;
  };
  const crownMaterial=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.97});
  const fullCrowns=new THREE.InstancedMesh(crown(lowPower?28:44,lowPower?88:132),crownMaterial,nearTrees.length);
  const trunks=new THREE.InstancedMesh(new THREE.CylinderGeometry(.075,.17,1,9),bark,nearTrees.length);
  nearTrees.forEach((tree,index)=>{
    dummy.position.set(tree.x,tree.h*.42,tree.z);dummy.rotation.set(0,tree.r,0);dummy.scale.set(1,tree.h*.84,1);dummy.updateMatrix();trunks.setMatrixAt(index,dummy.matrix);
    dummy.position.set(tree.x,.42,tree.z);dummy.scale.set(tree.h*.28,tree.h,tree.h*.28);dummy.updateMatrix();fullCrowns.setMatrixAt(index,dummy.matrix);
  });
  fullCrowns.castShadow=trunks.castShadow=true;fullCrowns.receiveShadow=trunks.receiveShadow=true;root.add(fullCrowns,trunks);
  // Dense, small silhouettes only in the distance, where individual boughs are subpixel.
  const farCount=lowPower?180:290;
  const farGreen=new THREE.InstancedMesh(crown(12,48),crownMaterial,farCount);
  for(let i=0;i<farCount;i++){
    const x=(rnd()-.5)*165,z=-55-rnd()*85-(Math.abs(x)<14?35:0),h=4+rnd()*4,w=h*(.22+rnd()*.08);
    dummy.position.set(x,0,z);dummy.rotation.set(0,rnd()*6.28,0);dummy.scale.set(w,h,w);dummy.updateMatrix();farGreen.setMatrixAt(i,dummy.matrix);
  }
  root.add(farGreen);
  for(let layer=0;layer<3;layer++){
    const nx=160,nz=20,pos:number[]=[],idx:number[]=[];
    for(let j=0;j<=nz;j++)for(let i=0;i<=nx;i++){
      const x=(i/nx-.5)*500,z=-190-layer*45-j/nz*50;
      const ridge=6+noise(x*.025+layer*3,layer+2)*15+noise(x*.11,layer+7)*6;
      const y=ridge*Math.sin(j/nz*Math.PI)**.8+noise(x*.19,z*.14)*2-2;
      pos.push(x,y,z);
      if(i<nx&&j<nz){const n=j*(nx+1)+i;idx.push(n,n+1,n+nx+1,n+1,n+nx+2,n+nx+1);}
    }
    const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geometry.setIndex(idx);geometry.computeVertexNormals();
    const colours:number[]=[],normals=geometry.getAttribute('normal');
    for(let i=0;i<normals.count;i++){const c=THREE.MathUtils.lerp(.38,1,THREE.MathUtils.smoothstep(normals.getY(i),.25,.80));colours.push(c,c,c);}
    geometry.setAttribute('color',new THREE.Float32BufferAttribute(colours,3));
    const material=new THREE.MeshStandardMaterial({color:new THREE.Color(0x8aabba).multiplyScalar(1-layer*.14),vertexColors:true,roughness:1});
    const mountain=new THREE.Mesh(geometry,material);mountain.name='distant-snow-ridge';root.add(mountain);
  }
  // Retain the friendly snowman at the left edge, fully modelled in the new world.
  const snowman=new THREE.Group();snowman.position.set(-6.6,0,-3.8);snowman.rotation.y=.06;
  const sphere=new THREE.SphereGeometry(1,24,18);
  const ball=(r:number,x:number,y:number,z:number,mat:THREE.Material)=>{const m=new THREE.Mesh(sphere,mat);m.position.set(x,y,z);m.scale.setScalar(r);m.castShadow=true;m.receiveShadow=true;snowman.add(m);return m;};
  ball(.62,0,.57,0,snow);ball(.45,0,1.37,0,snow);ball(.32,0,1.99,0,snow);
  const coal=new THREE.MeshStandardMaterial({color:0x14232c,roughness:.9});
  for(const x of [-.105,.105])ball(.026,x,2.05,.292,coal);
  for(let i=0;i<7;i++){const a=i/6*Math.PI;ball(.016,Math.cos(a)*.13,1.97-Math.sin(a)*.07,.297,coal);}
  for(let i=0;i<3;i++)ball(.033,0,1.55-i*.16,.43,coal);
  const carrot=new THREE.Mesh(new THREE.ConeGeometry(.045,.25,12),new THREE.MeshStandardMaterial({color:0xc87a39,roughness:.8}));carrot.rotation.x=Math.PI/2;carrot.position.set(.015,2.,.39);snowman.add(carrot);
  const scarfMaterial=new THREE.MeshStandardMaterial({color:0x334552,roughness:1});
  const collar=new THREE.Mesh(new THREE.TorusGeometry(.29,.065,8,30),scarfMaterial);collar.rotation.x=Math.PI/2;collar.position.y=1.73;snowman.add(collar);
  const tail=new THREE.Mesh(new THREE.BoxGeometry(.14,.58,.045),scarfMaterial);tail.position.set(.16,1.43,.43);tail.rotation.z=.10;snowman.add(tail);
  for(const side of [-1,1]){
    const stick=new THREE.Mesh(new THREE.CylinderGeometry(.018,.026,.85,7),bark);stick.position.set(side*.67,1.43,0);stick.rotation.z=-side*1.14;snowman.add(stick);
  }
  root.add(snowman);
  return{root,dispose(){const geometries=new Set<THREE.BufferGeometry>(),materials=new Set<THREE.Material>();root.traverse(o=>{if(o instanceof THREE.Mesh){geometries.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:[o.material])materials.add(m);}});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());root.clear();}};
}
