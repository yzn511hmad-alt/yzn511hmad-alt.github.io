/** Reuse the existing scene clock; paint cached vectors via transforms only. */
export function createPricingEngraving(root:ParentNode=document){
  const fields=[...root.querySelectorAll<HTMLElement>('.snow-engraving')];
  const layers=fields.map(field=>[...field.querySelectorAll<HTMLElement>('.snow-engraving-weave')]);let phase=0,last:number|undefined;
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  const contrast=matchMedia('(forced-colors: active)');
  const events=new AbortController();
  const visible=new Map<HTMLElement,boolean>();
  const sync=()=>{for(const field of fields)field.dataset.running=String(!!visible.get(field)&&!motion.matches&&!contrast.matches&&!document.hidden);};
  const observer=new IntersectionObserver(entries=>{for(const entry of entries)visible.set(entry.target as HTMLElement,entry.isIntersecting);sync();},{threshold:.05});
  fields.forEach(field=>observer.observe(field));
  motion.addEventListener('change',sync,{signal:events.signal});contrast.addEventListener('change',sync,{signal:events.signal});document.addEventListener('visibilitychange',sync,{signal:events.signal});
  return{
    update(time:number){const delta=last===undefined?0:Math.min(.05,time-last);last=time;
      if(motion.matches||contrast.matches||document.hidden)return;
      phase+=delta;
      fields.forEach((field,index)=>{if(field.dataset.running!=='true')return;layers[index].forEach((layer,n)=>{
        const angle=(phase*(n?-360/61:360/78)+index*19)%360;
        layer.style.transform=`translateZ(0) rotate(${angle.toFixed(4)}deg)`;
      });});
    },
    dispose(){observer.disconnect();events.abort();fields.forEach(field=>delete field.dataset.running);}
  };
}
