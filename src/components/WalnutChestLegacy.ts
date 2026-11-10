import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

export interface WalnutChestOptions {
  lowPower?: boolean;
  /** Desktop material detail; false preserves the accepted baseline. */
  highDetail?: boolean;
  assetBase?: string;
  onReady?: () => void;
  onError?: () => void;
}

/** Reference-inspired walnut presentation box. Hidden interior construction and
 * the working lock are inferred additions; they are not an exact scanned asset. */
export function createWalnutChest(options: WalnutChestOptions = {}) {
  const highDetail=options.highDetail??!options.lowPower;
  const root=new THREE.Group();root.name='walnut-chest';root.userData.highDetail=highDetail;
  const lidPivot=new THREE.Group();lidPivot.name='walnut-lid-pivot';
  lidPivot.position.set(0,1.06,-.90);root.add(lidPivot);
  const keySocket=new THREE.Object3D();keySocket.name='walnut-key-socket';
  keySocket.position.set(0,.79,.925);root.add(keySocket);
  const geometries=new Set<THREE.BufferGeometry>(),materials=new Set<THREE.Material>(),textures=new Set<THREE.Texture>();
  const nodes:Record<string,THREE.Object3D>={root,lid:lidPivot,lockSocket:keySocket};
  let disposed=false;
  const walnut=new THREE.MeshPhysicalMaterial({color:highDetail?'#c4a78d':'#b08e71',roughness:highDetail?.58:.68,metalness:0,clearcoat:highDetail?.18:.08,clearcoatRoughness:highDetail?.38:.34,normalScale:new THREE.Vector2(highDetail?.32:.10,highDetail?.32:.10)});
  root.userData.materialReady=false;
  const loader=new THREE.TextureLoader();let mapsSettled=0;
  const base=options.assetBase??'/assets/walnut-chest/';
  const load=(name:string,srgb=false)=>{
    const texture=loader.load(`${base}${name}${options.lowPower?'-mobile':''}.webp`,()=>{
      if(disposed){texture.dispose();return;}
      mapsSettled++;root.userData.materialReady=mapsSettled===3;options.onReady?.();
    },undefined,()=>{if(!disposed){root.userData.materialError=true;options.onError?.();}});
    texture.colorSpace=srgb?THREE.SRGBColorSpace:THREE.NoColorSpace;
    texture.anisotropy=options.lowPower?4:8;texture.wrapS=texture.wrapT=THREE.RepeatWrapping;
    textures.add(texture);return texture;
  };
  walnut.map=load('walnut-color',true);walnut.normalMap=load('walnut-normal');walnut.roughnessMap=load('walnut-roughness');
  walnut.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>
    // Preserve the photographed veneer contrast instead of tinting it flat.
    diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.20,.115,.064),${highDetail?'.055':'.22'});`);};
  walnut.customProgramCacheKey=()=> 'snowy-veneer-detail-v3-'+Number(highDetail);
  const endgrain=walnut.clone();endgrain.color.set(highDetail?'#a58c75':'#947056');
  // clone() does not preserve custom shader callbacks. Keep the inside veneer
  // consistent with the body, including its preserved photographic grain.
  if(highDetail){endgrain.onBeforeCompile=walnut.onBeforeCompile;endgrain.customProgramCacheKey=walnut.customProgramCacheKey;}
  const brass=new THREE.MeshPhysicalMaterial({color:'#b99656',roughness:highDetail?.27:.30,metalness:1,envMapIntensity:1});
  const felt=new THREE.MeshPhysicalMaterial({color:'#171b1e',roughness:.98,metalness:0,sheen:.35,sheenColor:new THREE.Color('#394044'),sheenRoughness:.9});
  materials.add(walnut);materials.add(endgrain);materials.add(brass);materials.add(felt);
  const keep=<T extends THREE.BufferGeometry>(g:T):T=>{geometries.add(g);return g;};
  const woodUV=(g:THREE.BufferGeometry,offset:THREE.Vector3)=>{
    const p=g.getAttribute('position'),n=g.getAttribute('normal'),uv=new Float32Array(p.count*2);
    for(let i=0;i<p.count;i++){
      const x=p.getX(i)+offset.x,y=p.getY(i)+offset.y,z=p.getZ(i)+offset.z;
      const nx=Math.abs(n.getX(i)),ny=Math.abs(n.getY(i)),nz=Math.abs(n.getZ(i));
      if(ny>nx&&ny>nz){uv[i*2]=x/3.3+.5;uv[i*2+1]=(z+.9)/1.8*.42+.44;}
      else if(nx>nz){uv[i*2]=z/3.3+.5;uv[i*2+1]=y/1.535*.46+.15;}
      else {uv[i*2]=x/3.3+.5;uv[i*2+1]=y/1.535*.46+.15;}
    }
    g.setAttribute('uv',new THREE.BufferAttribute(uv,2));
  };
  const part=(name:string,g:THREE.BufferGeometry,m:THREE.Material|THREE.Material[],parent:THREE.Object3D,pos:THREE.Vector3)=>{
    if(m===walnut||m===endgrain)woodUV(g,new THREE.Vector3(pos.x,pos.y+(parent===lidPivot?1.06:0),pos.z+(parent===lidPivot?-.9:0)));
    const mesh=new THREE.Mesh(keep(g),m);mesh.name=name;mesh.position.copy(pos);mesh.castShadow=true;mesh.receiveShadow=true;
    mesh.userData.partId=name;parent.add(mesh);nodes[name]=mesh;return mesh;
  };
  const board=(name:string,w:number,h:number,d:number,x:number,y:number,z:number,parent:THREE.Object3D=root,material:THREE.Material=walnut)=>
    part(name,new RoundedBoxGeometry(w,h,d,options.lowPower?2:3,Math.min(highDetail?.024:.018,w*.12,h*.12,d*.12)),material,parent,new THREE.Vector3(x,y,z));
  // Separate panels make a real hollow body, rather than a solid cube wearing
  // an opening animation. Front wood is extruded with the lock aperture cut out.
  board('bottom',3.02,.14,1.52,0,.07,0);
  board('back',3.3,1.05,.14,0,.525,-.83);
  board('side-left',.14,1.05,1.56,-1.58,.525,0);
  board('side-right',.14,1.05,1.56,1.58,.525,0);
  const outline=(w:number,h:number,r:number)=>{
    const s=new THREE.Shape(),x=-w/2,y=-h/2;
    s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);
    s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
    s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);
    s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);return s;
  };
  const keyhole=(cy:number)=>{
    const hole=new THREE.Path(),radius=.072;
    // Continuous keyhole boundary: circular shaft seat with a tapered slot
    // opening to .18 at the bottom so the E-profile wards can physically pass.
    hole.absarc(0,cy,radius,Math.PI*1.24,Math.PI*1.76,true);
    hole.lineTo(.088,cy-.245);
    hole.quadraticCurveTo(.092,cy-.265,.070,cy-.265);
    hole.lineTo(-.070,cy-.265);
    hole.quadraticCurveTo(-.092,cy-.265,-.088,cy-.245);
    hole.closePath();return hole;
  };
  const frontShape=outline(3.3,1.05,.018);frontShape.holes.push(keyhole(.79-.525));
  const frontGeo=new THREE.ExtrudeGeometry(frontShape,{depth:.14,steps:1,bevelEnabled:true,bevelSegments:2,bevelSize:.006,bevelThickness:.006,curveSegments:options.lowPower?12:20});
  part('front',frontGeo,walnut,root,new THREE.Vector3(0,.525,.76));
  const lockShape=outline(.31,.44,.042);lockShape.holes.push(keyhole(.79-.705));
  const lockGeo=new THREE.ExtrudeGeometry(lockShape,{depth:.018,steps:1,bevelEnabled:true,bevelSegments:2,bevelSize:.004,bevelThickness:.004,curveSegments:options.lowPower?12:24});
  part('lock',lockGeo,brass,root,new THREE.Vector3(0,.705,.906));
  // The lid pivots at the rear lower edge and has a recessed dark underside.
  board('lid',3.3,.475,1.8,0,.2375,.9,lidPivot);
  board('lid-inset',3.0,.018,1.50,0,-.005,.9,lidPivot,endgrain);
  board('interior',3.0,.025,1.50,0,.153,0,root,felt);
  // Restrained back-mounted brass hinges. The front remains an uninterrupted
  // walnut surface, except for the small required lock.
  const hingeRadius=.037;
  for(const [id,x] of [['hinge-a',-1.02],['hinge-b',1.02]] as const){
    const h=new THREE.Group();h.name=id;h.position.set(x,1.05,-.89);root.add(h);nodes[id]=h;
    board(`${id}-base`,.32,.10,.014,0,-.045,-.01,h,brass);
    const barrel=part(`${id}-knuckle`,new THREE.CylinderGeometry(hingeRadius,hingeRadius,.32,options.lowPower?12:20),brass,h,new THREE.Vector3());barrel.rotation.z=Math.PI/2;
  }
  // Repeated screw crowns are instanced, so these micro-details add one draw.
  const screwGeo=keep(new THREE.CylinderGeometry(.014,.014,.007,options.lowPower?8:12));
  const screws=new THREE.InstancedMesh(screwGeo,brass,highDetail?6:4);screws.name='hinge-screws';
  const transform=new THREE.Object3D();let index=0;
  for(const x of[-1.12,-.92,.92,1.12]){transform.position.set(x,1.015,-.913);transform.rotation.set(Math.PI/2,0,0);transform.updateMatrix();screws.setMatrixAt(index++,transform.matrix);}root.add(screws);
  let screwSlots:THREE.InstancedMesh|undefined,joinery:THREE.InstancedMesh|undefined;
  if(highDetail){
    // Small lock fasteners plus their real recessed slots, not a painted icon.
    for(const y of [.89,.51]){transform.position.set(0,y,.932);transform.rotation.set(Math.PI/2,0,0);transform.updateMatrix();screws.setMatrixAt(index++,transform.matrix);}
    const recess=new THREE.MeshStandardMaterial({color:'#30281f',roughness:.85,metalness:.22});materials.add(recess);
    screwSlots=new THREE.InstancedMesh(keep(new THREE.BoxGeometry(.018,.003,.0015)),recess,2);screwSlots.name='lock-screw-slots';
    for(let i=0;i<2;i++){transform.position.set(0,[.89,.51][i],.9365);transform.rotation.set(0,0,i?.36:-.2);transform.updateMatrix();screwSlots.setMatrixAt(i,transform.matrix);}root.add(screwSlots);
    // Fine stopped corner seams suggest assembled panels without decorative
    // trim. Shallow depth keeps them inside the accepted body silhouette.
    joinery=new THREE.InstancedMesh(keep(new THREE.BoxGeometry(.006,.94,.001)),recess,2);joinery.name='front-corner-joinery';
    for(let i=0;i<2;i++){transform.position.set(i?-1.50:1.50,.525,.9065);transform.rotation.set(0,0,0);transform.updateMatrix();joinery.setMatrixAt(i,transform.matrix);}root.add(joinery);
  }
  nodes.lid=lidPivot;nodes['hinge-screws']=screws;
  const meshes:Record<string,THREE.Mesh>={};root.traverse(o=>{if(o instanceof THREE.Mesh)meshes[o.name]=o;});
  const parts=[...root.children].filter(o=>o!==keySocket);
  const center=new THREE.Vector3(0,.75,0);
  root.updateMatrixWorld(true);
  const bases=parts.map(part=>({part,position:part.position.clone(),offset:new THREE.Box3().setFromObject(part).getCenter(new THREE.Vector3()).sub(center)}));
  root.userData.sculptRuntime={nodes,meshes,sockets:{key:keySocket,hinge:lidPivot},colliders:{body:{type:'compound-box',size:[3.3,1.535,1.8]},lid:{type:'box',size:[3.3,.475,1.8]}},destructionGroups:{body:['front','back','side-left','side-right','bottom'].map(id=>nodes[id]),lid:[lidPivot]},explodable:true,clickable:true,
    setExplode(amount:number){const a=THREE.MathUtils.clamp(amount,0,1);for(const b of bases)b.part.position.copy(b.position).addScaledVector(b.offset,a*.65);},
  };
  root.userData.reference='Walnut presentation box: proportional/material inspiration; inferred rear/interior and adapted working lock.';
  const update=(open:number)=>{lidPivot.rotation.x=-THREE.MathUtils.clamp(open,0,1)*1.83;root.userData.openProgress=THREE.MathUtils.clamp(open,0,1);};
  update(0);
  return {root,lidPivot,keySocket,update,dispose(){if(disposed)return;disposed=true;geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());screws.dispose();screwSlots?.dispose();joinery?.dispose();root.clear();}};
}


