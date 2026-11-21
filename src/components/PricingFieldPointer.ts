import * as THREE from 'three';

/** Exact critically damped steps, evaluated by the existing scene clock.
 * Pointer coordinates are projected onto each field's local plane, not picked
 * against thousands of displaced triangles. No DOM measurements or own RAF. */
export class PricingFieldPointer {
  private events=new AbortController();
  private fine=matchMedia('(hover:hover) and (pointer:fine)');
  private cursor=new THREE.Vector2();
  private position=new THREE.Vector2();
  private speed=new THREE.Vector2();
  private raycaster=new THREE.Raycaster();
  private ray=new THREE.Ray();
  private inverse=new THREE.Matrix4();
  private hit=new THREE.Vector3();
  private plane=new THREE.Plane(new THREE.Vector3(0,0,1),0);
  private entered=false;
  private initialized=false;
  private previousTime=-1;
  private lastWake=-1;
  private strength=0;
  private strengthSpeed=0;
  private impulses=Array.from({length:2},()=>({ndc:new THREE.Vector2(),born:-100,gain:0}));
  private nextImpulse=0;
  readonly fields:Array<{mesh:THREE.Mesh;inner:number;outer:number;pointer:THREE.IUniform<THREE.Vector3>;wakes:THREE.IUniform<THREE.Vector4[]>}>=[];
  constructor(private camera:THREE.Camera){
    const signal=this.events.signal;
    window.addEventListener('pointermove',e=>{
      if(e.pointerType!=='mouse'||!this.fine.matches){this.entered=false;return;}
      this.cursor.set(e.clientX/innerWidth*2-1,1-e.clientY/innerHeight*2);
      if(!this.initialized){this.position.copy(this.cursor);this.initialized=true;}
      this.entered=true;
    },{passive:true,signal});
    window.addEventListener('pointerout',e=>{if(!e.relatedTarget)this.entered=false;},{signal});
    window.addEventListener('blur',()=>{this.entered=false;},{signal});
    document.addEventListener('visibilitychange',()=>{if(document.hidden)this.reset();},{signal});
    this.fine.addEventListener('change',()=>this.reset(),{signal});
  }
  attach(mesh:THREE.Mesh,inner:number,outer:number){
    const pointer={value:new THREE.Vector3(100,100,0)},wakes={value:[new THREE.Vector4(100,100,3,0),new THREE.Vector4(100,100,3,0)]};
    this.fields.push({mesh,inner,outer,pointer,wakes});return{uPointer:pointer,uWakes:wakes};
  }
  private project(mesh:THREE.Mesh,ndc:THREE.Vector2){
    this.raycaster.setFromCamera(ndc,this.camera);
    this.inverse.copy(mesh.matrixWorld).invert();this.ray.copy(this.raycaster.ray).applyMatrix4(this.inverse);
    return this.ray.intersectPlane(this.plane,this.hit);
  }
  private reset(){
    this.entered=false;this.initialized=false;this.strength=0;this.strengthSpeed=0;this.speed.set(0,0);this.previousTime=-1;
    for(const impulse of this.impulses)impulse.gain=0;
    for(const field of this.fields){field.pointer.value.z=0;for(const wake of field.wakes.value)wake.w=0;}
  }
  suspend(){this.reset();}
  update(time:number,reduced:boolean){
    if(reduced||!this.fine.matches){this.reset();return;}
    const dt=this.previousTime<0?1/60:THREE.MathUtils.clamp(time-this.previousTime,0,.05);this.previousTime=time;
    // x(t)=(x0+(v0+w*x0)t)e^-wt relative to the target.
    const omega=18,decay=Math.exp(-omega*dt);
    for(const key of ['x','y'] as const){
      const offset=this.position[key]-this.cursor[key],c=this.speed[key]+omega*offset;
      this.position[key]=this.cursor[key]+(offset+c*dt)*decay;
      this.speed[key]=(this.speed[key]-omega*c*dt)*decay;
    }
    this.camera.updateWorldMatrix(true,false);
    let near=false;
    for(const field of this.fields){
      field.mesh.updateWorldMatrix(true,false);
      const hit=this.project(field.mesh,this.position);
      if(hit){const r=Math.hypot(hit.x,hit.y);if(r>field.inner-.48&&r<field.outer+.48)near=true;field.pointer.value.set(hit.x,hit.y,0);}
      else field.pointer.value.set(100,100,0);
    }
    const target=this.entered&&near?1:0,offset=this.strength-target,c=this.strengthSpeed+14*offset,falloff=Math.exp(-14*dt);
    this.strength=target+(offset+c*dt)*falloff;this.strengthSpeed=(this.strengthSpeed-14*c*dt)*falloff;
    if(target&&this.speed.length()>.10&&time-this.lastWake>.16){
      const impulse=this.impulses[this.nextImpulse];impulse.ndc.copy(this.position);impulse.born=time;impulse.gain=Math.min(.65,this.speed.length()*.32);
      this.nextImpulse=(this.nextImpulse+1)%2;this.lastWake=time;
    }
    for(const field of this.fields){
      field.pointer.value.z=this.strength;
      for(let i=0;i<2;i++){
        const impulse=this.impulses[i],age=Math.max(0,time-impulse.born),wake=field.wakes.value[i];
        const hit=age<1.5&&impulse.gain>0?this.project(field.mesh,impulse.ndc):null;
        if(hit)wake.set(hit.x,hit.y,age,impulse.gain);else wake.set(100,100,3,0);
      }
    }
  }
  dispose(){this.events.abort();this.fields.length=0;}
}
