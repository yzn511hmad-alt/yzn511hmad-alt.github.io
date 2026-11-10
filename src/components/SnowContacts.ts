import * as THREE from 'three';

/** Soft ambient contact supplement to the existing geometry shadow map.
 * World-space footprints share the props' perspective and never follow a pointer. */
export function createSnowContacts(chest:THREE.Object3D,ice:THREE.Object3D){
  const root=new THREE.Group();root.name='snow-contact-shadows';
  const make=(object:THREE.Object3D,width:number,depth:number)=>{
    const material=new THREE.ShaderMaterial({transparent:true,depthWrite:false,toneMapped:false,
      uniforms:{halfSize:{value:new THREE.Vector2(width/2,depth/2)},extent:{value:new THREE.Vector2(width+.9,depth+.9)},strength:{value:1}},
      vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
      fragmentShader:`varying vec2 vUv;uniform vec2 halfSize,extent;uniform float strength;
      void main(){vec2 q=abs((vUv-.5)*extent)-halfSize;
        float distance=length(max(q,0.))+min(max(q.x,q.y),0.);
        float soft=exp(-max(0.,distance)*max(0.,distance)*25.);
        float tight=exp(-max(0.,distance)*32.);
        float alpha=(soft*.22+tight*.35)*strength;
        gl_FragColor=vec4(vec3(.12,.19,.25),alpha);
        #include <colorspace_fragment>
      }`});
    const mesh=new THREE.Mesh(new THREE.PlaneGeometry(width+.9,depth+.9),material);
    mesh.rotation.x=-Math.PI/2;mesh.quaternion.premultiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),object.rotation.y));
    mesh.position.copy(object.position);mesh.position.y=.003;mesh.renderOrder=1;root.add(mesh);return mesh;
  };
  const wood=make(chest,2.97,1.62),frozen=make(ice,1.56,1.56);
  return{root,update(progress:number,collect:number){frozen.material.uniforms.strength.value=(1-progress)*(1-collect);},dispose(){for(const mesh of[wood,frozen]){mesh.geometry.dispose();mesh.material.dispose();}root.clear();}};
}
