import * as THREE from 'three';
import gsap from 'gsap';

/** A small reusable SVG pool remembers actual projected poses. Fading uses the
 * existing GSAP ticker; it never asks WebGL to render another frame. */
export function createPricingMemory(host:HTMLElement,card:THREE.Group,coins:THREE.Group[],camera:THREE.Camera){
  const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');
  svg.classList.add('metal-memory');svg.setAttribute('aria-hidden','true');
  host.before(svg);
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  const mobile=matchMedia('(max-width:650px)');
  const events=new AbortController();
  const vector=new THREE.Vector3();
  function project(object:THREE.Object3D,x:number,y:number,z=0){
    vector.set(x,y,z).applyMatrix4(object.matrixWorld).project(camera);
    return [(vector.x*.5+.5)*innerWidth,(-vector.y*.5+.5)*innerHeight];
  }
  function outline(){
    const points:number[][]=[];
    for(const [cx,cy,start] of [[1.17,1.945,0],[-1.17,1.945,90],[-1.17,-1.945,180],[1.17,-1.945,270]]){
      for(let n=0;n<=4;n++){const angle=THREE.MathUtils.degToRad(start+n*22.5);points.push(project(card,cx+Math.cos(angle)*.18,cy+Math.sin(angle)*.18));}
    }
    return points.map((p,i)=>`${i?'L':'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')+'Z';
  }
  function arc(coin:THREE.Group,index:number){
    const points:number[][]=[];
    for(let n=0;n<=16;n++){const angle=-.7+n*.085+index*2.4;points.push(project(coin,Math.cos(angle)*.62,Math.sin(angle)*.62));}
    return points.map((p,i)=>`${i?'L':'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
  }
  function slot(kind:string){
    const group=document.createElementNS(ns,'g');group.classList.add('memory-mark',kind);group.style.opacity='0';
    for(const name of ['memory-cut','memory-edge']){const path=document.createElementNS(ns,'path');path.classList.add(name);group.append(path);}
    svg.append(group);return group;
  }
  const cardPool=Array.from({length:6},()=>slot('memory-card'));
  const coinPool=Array.from({length:8},(_,i)=>slot(i%2?'memory-silver':'memory-gold'));
  let cardIndex=0,coinIndex=0,lastTime=-Infinity;
  let previous:{card:string;coins:string[];sample:number[]}|undefined;
  function clear(){for(const item of [...cardPool,...coinPool]){gsap.killTweensOf(item);item.style.opacity='0';}previous=undefined;}
  function stamp(item:SVGGElement,path:string,opacity:number){
    gsap.killTweensOf(item);item.querySelectorAll('path').forEach(p=>p.setAttribute('d',path));
    gsap.fromTo(item,{opacity},{opacity:0,duration:mobile.matches?1.4:2.2,ease:'power2.out',overwrite:true});
  }
  window.addEventListener('resize',clear,{signal:events.signal});
  document.addEventListener('visibilitychange',clear,{signal:events.signal});
  motion.addEventListener('change',clear,{signal:events.signal});
  return {
    clear,
    update(time:number){
      if(motion.matches||document.hidden)return;
      if(time-lastTime<(mobile.matches?.18:.12))return;
      lastTime=time;
      const center=project(card,0,0),corner=project(card,1.35,2.125);
      const sample=[...center,...corner,...project(coins[0],0,0),...project(coins[1],0,0)];
      const frame={card:outline(),coins:coins.map(arc),sample};
      if(previous){
        const movement=Math.max(...sample.map((v,i)=>Math.abs(v-previous!.sample[i])));
        if(movement<3)return;
        stamp(cardPool[cardIndex++%(mobile.matches?3:6)],previous.card,mobile.matches?.16:.28);
        previous.coins.forEach((path,i)=>{
          const index=(coinIndex++%(mobile.matches?4:8));
          stamp(coinPool[index],path,mobile.matches?.2:.34);
        });
      }
      previous=frame;
    },
    dispose(){events.abort();clear();svg.remove();},
  };
}
