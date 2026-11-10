import * as THREE from 'three';

const smooth=(a:number,b:number,value:number)=>{
  const t=THREE.MathUtils.clamp((value-a)/(b-a),0,1);return t*t*(3-2*t);
};

/** Deterministic world-space choreography. The existing ice model draws first;
 * this controller then places its same gold key, retaining the resting pose. */
export function createChestUnlock(key:THREE.Group, socket:THREE.Object3D) {
  const start=new THREE.Vector3(),lift=new THREE.Vector3(),destination=new THREE.Vector3();
  const startQ=new THREE.Quaternion(),alignedQ=new THREE.Quaternion(),socketQ=new THREE.Quaternion();
  const worldScale=new THREE.Vector3(),parentScale=new THREE.Vector3();
  const position=new THREE.Vector3(),rotation=new THREE.Quaternion(),parentQ=new THREE.Quaternion();
  const socketPosition=new THREE.Vector3(),normal=new THREE.Vector3(),tip=new THREE.Vector3();
  const shaftToFront=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0),Math.PI/2);
  const turn=new THREE.Quaternion();
  const localY=new THREE.Vector3(0,1,0);
  const path=new THREE.CubicBezierCurve3();
  let initialized=false;
  const initialize=()=>{
    key.updateWorldMatrix(true,false);socket.updateWorldMatrix(true,false);
    key.getWorldPosition(start);key.getWorldQuaternion(startQ);key.getWorldScale(worldScale);
    socket.getWorldPosition(socketPosition);socket.getWorldQuaternion(socketQ);
    normal.set(0,0,1).applyQuaternion(socketQ).normalize();
    alignedQ.copy(socketQ).multiply(shaftToFront)
      .multiply(new THREE.Quaternion().setFromAxisAngle(localY,-Math.PI/2));
    // The raised route clears the campfire in either direction before descending.
    const liftHeight=THREE.MathUtils.clamp(start.distanceTo(socketPosition)*.20,.64,1.8);
    lift.copy(start).add(new THREE.Vector3(0,liftHeight,0));
    tip.set(0,.157,0).multiply(worldScale).applyQuaternion(alignedQ);
    destination.copy(socketPosition).addScaledVector(normal,.58).sub(tip);
    path.v0.copy(lift);path.v1.copy(lift).add(new THREE.Vector3(0,.45,0));
    path.v2.copy(destination).addScaledVector(normal,.26).add(new THREE.Vector3(0,.90,0));
    path.v3.copy(destination);initialized=true;
  };
  const apply=(value:number)=>{
    if(!initialized)initialize();
    const t=THREE.MathUtils.clamp(value,0,1);
    const liftT=smooth(0,.15,t),travel=smooth(.15,.46,t);
    if(t<.15)position.lerpVectors(start,lift,liftT);
    else path.getPoint(travel,position);
    rotation.slerpQuaternions(startQ,alignedQ,smooth(.04,.46,t));
    const insertion=smooth(.46,.58,t),twist=smooth(.59,.69,t);
    if(t>=.46){
      rotation.copy(alignedQ).multiply(turn.setFromAxisAngle(localY,Math.PI/2*twist));
      tip.set(0,.157,0).multiply(worldScale).applyQuaternion(rotation);
      // .35 past the exterior socket clears both wards behind the .14 wall.
      position.copy(socketPosition).addScaledVector(normal,THREE.MathUtils.lerp(.58,-.35,insertion)).sub(tip);
    }
    const worldPosition=position.clone();
    key.parent!.updateWorldMatrix(true,false);
    key.position.copy(key.parent!.worldToLocal(position));
    key.parent!.getWorldQuaternion(parentQ).invert();
    key.quaternion.copy(parentQ).multiply(rotation);
    key.parent!.getWorldScale(parentScale);
    key.scale.copy(worldScale).divide(parentScale);
    key.visible=true;key.updateWorldMatrix(false,true);
    const tipWorld=tip.set(0,.157,0).applyMatrix4(key.matrixWorld);
    return {
      lift:liftT,travel,insertion,turn:twist,
      lid:smooth(.69,.93,t),card:smooth(.93,1,t),
      keyTip:tipWorld.toArray(),socket:socketPosition.toArray(),
      axisError:1-Math.abs(new THREE.Vector3(0,1,0).applyQuaternion(rotation).dot(normal)),
      keyWorld:worldPosition.toArray(),
    };
  };
  return {begin:initialize,apply,reset(){initialized=false;}};
}

/** Decorative representation only. The actual pass/copy controls remain DOM. */
export function createChestAccessCard(lowPower:boolean) {
  const canvas=document.createElement('canvas');canvas.width=lowPower?768:1280;canvas.height=lowPower?432:720;
  const c=canvas.getContext('2d')!,w=canvas.width,h=canvas.height;
  let disposed=false;
  const paint=()=>{
  c.fillStyle='#0a2030';c.fillRect(0,0,w,h);
  c.strokeStyle='#9acbdf';c.lineWidth=w*.002;c.strokeRect(w*.035,h*.06,w*.93,h*.88);
  c.textBaseline='top';c.fillStyle='#a8cada';c.font=`500 ${w*.026}px "IBM Plex Sans",sans-serif`;
  c.fillText('SNOWY STUDIOS',w*.075,h*.14);
  c.fillStyle='#edf8ff';c.font=`500 ${w*.102}px "IBM Plex Sans",sans-serif`;
  c.fillText('LootLabs',w*.068,h*.36);
  c.fillStyle='#a6dff6';c.fillRect(w*.075,h*.66,w*.11,h*.006);
  c.font=`500 ${w*.025}px "IBM Plex Sans",sans-serif`;c.fillText('CONTINUE VIA FLOWAUTH',w*.075,h*.76);
  c.fillText('01 / GATEWAY',w*.70,h*.76);
  };paint();
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;
  document.fonts.load('500 32px "IBM Plex Sans"').then(()=>{if(!disposed){paint();texture.needsUpdate=true;}},()=>{});
  const edge=new THREE.MeshPhysicalMaterial({color:'#c6a46e',metalness:.75,roughness:.3});
  const face=new THREE.MeshStandardMaterial({map:texture,roughness:.48,metalness:0});
  const root=new THREE.Group();root.name='free-access-card';
  const card=new THREE.Mesh(new THREE.BoxGeometry(1.9,1.07,.025),[edge,edge,edge,edge,face,edge]);
  card.castShadow=true;root.add(card);root.visible=false;
  return {
    root,
    update(p:number){root.visible=p>.0001&&p<.9999;root.position.set(0,THREE.MathUtils.lerp(.40,2.04,p),.15);root.rotation.x=-.08*p;},
    dispose(){disposed=true;card.geometry.dispose();face.dispose();edge.dispose();texture.dispose();root.clear();},
  };
}

