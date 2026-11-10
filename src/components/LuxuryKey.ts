import * as THREE from 'three';

/** Turned gold key, reconstructed from the supplied single-view reference.
 * All parts are direct children, preserving the existing contact/pose sampler. */
export function buildLuxuryKey(key: THREE.Group, gold: THREE.Material, polish: THREE.Material, satin: THREE.Material, lowPower: boolean, compactGeometry = false) {
  const radial=compactGeometry?(lowPower?32:48):lowPower?40:64;
  const mesh=(name:string,g:THREE.BufferGeometry,m:THREE.Material,x=0,y=0,z=0)=>{
    const part=new THREE.Mesh(g,m);part.name=name;part.position.set(x,y,z);key.add(part);return part;
  };
  // A gently convex annular cross-section gives the broad face changing
  // reflections instead of the uniformly bright face of a flat coin.
  const hoopProfile=[
    [.255,-.030],[.250,0],[.255,.030],[.273,.052],
    [.315,.062],[.355,.057],[.385,.035],[.392,0],
    [.385,-.035],[.355,-.057],[.315,-.062],[.273,-.052],[.255,-.030],
  ].reverse().map(([r,z])=>new THREE.Vector2(r,z));
  const hoop=new THREE.LatheGeometry(hoopProfile,radial);hoop.rotateX(Math.PI/2);
  const ring=mesh('key-ring',hoop,satin,0,1.89,0);
  for(const sign of [-1,1]) {
    mesh('ring-outer-bead',new THREE.TorusGeometry(.385,.006,6,radial),polish,0,1.89,sign*.037);
    mesh('ring-inner-bead',new THREE.TorusGeometry(.255,.005,6,radial),polish,0,1.89,sign*.030);
  }
  const shaft=mesh('key-shaft',new THREE.CylinderGeometry(.056,.062,1.37,radial,1),gold,0,.842,0);
  mesh('shaft-foot',new THREE.SphereGeometry(.062,radial,10),polish,0,.157,0);
  // Continuous turned neck rather than a stack of disconnected discs.
  const profile=[
    [0,1.405],[.056,1.405],[.058,1.425],[.091,1.432],[.104,1.447],
    [.106,1.464],[.090,1.480],[.073,1.488],[.076,1.504],
    [.112,1.516],[.116,1.535],[.098,1.552],[.074,1.563],
    [.070,1.584],[.076,1.606],[0,1.606],
  ].map(([r,y])=>new THREE.Vector2(r,y));
  const collar=mesh('key-turned-neck',new THREE.LatheGeometry(profile,radial),gold);
  for(const y of [1.45,1.532]) {
    const bead=new THREE.TorusGeometry(y===1.45?.100:.110,.009,6,radial);bead.rotateX(Math.PI/2);
    mesh('neck-polished-bead',bead,polish,0,y,0);
  }
  const teeth=new THREE.Shape();teeth.moveTo(.024,.20);teeth.lineTo(.255,.20);
  teeth.lineTo(.255,.305);teeth.lineTo(.132,.305);teeth.lineTo(.132,.393);
  teeth.lineTo(.255,.393);teeth.lineTo(.255,.495);teeth.lineTo(.024,.495);teeth.closePath();
  const bit=mesh('key-bit',new THREE.ExtrudeGeometry(teeth,{depth:.086,bevelEnabled:true,bevelThickness:.009,bevelSize:.009,bevelSegments:3,steps:1}),gold,0,0,-.043);
  return{ring,shaft,bit,collar};
}
