import { onFrame } from '../core/FrameLoop';
import { alignMoonArtwork } from './MoonAlignment';

/** On-demand camera for the lunar sky and the preserved snow/ground layers. */
class PolarCamera {
  private events=new AbortController();
  private layers:Array<{element:HTMLElement;depth:number}>;
  private root=document.documentElement;
  private motion=matchMedia('(prefers-reduced-motion: reduce)');
  private coarse=matchMedia('(pointer: coarse), (max-width: 700px)');
  private slow=matchMedia('(update: slow)');
  private width=innerWidth;
  private height=innerHeight;
  private x=0;private y=0;private scroll=0;
  private targetX=0;private targetY=0;private targetScroll=0;
  private unsubscribe?:()=>void;
  private last=-Infinity;
  private disposed=false;
  private contentVisible=true;
  private contentObserver?:IntersectionObserver;
  private moon: ReturnType<typeof alignMoonArtwork>;

  constructor(private host:HTMLElement){
    this.moon = alignMoonArtwork(host);
    this.layers=Array.from(host.querySelectorAll<HTMLElement>('[data-depth]')).map(element=>({element,depth:Number(element.dataset.depth)||0}));
    host.dataset.sky='moonlit-clear-v1';
    const signal=this.events.signal;
    window.addEventListener('pointermove',event=>{
      if(event.pointerType!=='mouse'||this.coarse.matches||this.paused)return;
      this.targetX=event.clientX/this.width*2-1;this.targetY=event.clientY/this.height*2-1;this.wake();
    },{passive:true,signal});
    document.addEventListener('pointerleave',()=>{this.targetX=this.targetY=0;this.wake();},{signal});
    window.addEventListener('scroll',this.onScroll,{passive:true,signal});
    window.addEventListener('resize',()=>{this.width=innerWidth;this.height=innerHeight;this.onScroll();},{passive:true,signal});
    this.motion.addEventListener('change',this.availability,{signal});this.coarse.addEventListener('change',this.availability,{signal});this.slow.addEventListener('change',this.availability,{signal});
    document.addEventListener('visibilitychange',this.availability,{signal});
    window.addEventListener('pageshow',this.availability,{signal});
    window.addEventListener('pagehide',event=>{if(!event.persisted)this.destroy();},{signal});
    const content=document.querySelector('main');if(content){this.contentObserver=new IntersectionObserver(([entry])=>{this.contentVisible=entry.isIntersecting;this.availability();});this.contentObserver.observe(content);}
    this.availability();this.onScroll();
  }
  private get paused():boolean{return document.hidden||!this.contentVisible||this.motion.matches||this.slow.matches;}
  private onScroll=():void=>{this.targetScroll=(1-Math.exp(-Math.max(0,window.scrollY)/1300))*100;this.wake();};
  private availability=():void=>{
    this.root.dataset.polarPaused=String(this.paused);
    if(this.paused){this.sleep();this.host.dataset.parallaxState='paused';if(this.motion.matches||this.slow.matches){this.x=this.y=this.scroll=this.targetX=this.targetY=0;this.layers.forEach(({element})=>element.style.transform='none');this.moon.update(0,0);}}
    else{this.onScroll();this.wake();}
  };
  private wake():void{if(this.disposed||this.paused||this.unsubscribe)return;this.host.dataset.parallaxState='moving';this.host.classList.add('is-moving');this.last=-Infinity;this.unsubscribe=onFrame(this.tick);}
  private sleep():void{this.unsubscribe?.();this.unsubscribe=undefined;this.host.classList.remove('is-moving');}
  private tick=(time:number,delta:number):void=>{
    if(this.paused){this.sleep();return;}const interval=this.coarse.matches?1/30:1/60;if(time-this.last+.0001<interval)return;
    const dt=Number.isFinite(this.last)?Math.min(.06,time-this.last):Math.max(delta,interval),ease=1-Math.exp(-dt*6.8);
    const tx=this.coarse.matches?0:this.targetX,ty=this.coarse.matches?0:this.targetY;this.x+=(tx-this.x)*ease;this.y+=(ty-this.y)*ease;this.scroll+=(this.targetScroll-this.scroll)*ease;
    const mobile=this.coarse.matches?.55:1;
    for(const {element,depth} of this.layers){const x=-this.x*32*depth,y=(-this.y*20-this.scroll*.48)*depth*mobile;element.style.transform=`translate3d(${x.toFixed(3)}px,${y.toFixed(3)}px,0)`;}
    this.moon.update(-this.x*32*.16,(-this.y*20-this.scroll*.48)*.16*mobile);
    this.last=Number.isFinite(this.last)?time-((time-this.last)%interval):time;
    if(Math.abs(tx-this.x)<.0005&&Math.abs(ty-this.y)<.0005&&Math.abs(this.targetScroll-this.scroll)<.025){this.host.dataset.parallaxState='idle';this.sleep();}
  };
  destroy():void{if(this.disposed)return;this.disposed=true;this.sleep();this.events.abort();this.contentObserver?.disconnect();this.moon.destroy();}
}
const host=document.querySelector<HTMLElement>('.polar-atmosphere[data-polar-world]');const camera=host?new PolarCamera(host):undefined;
if(import.meta.hot)import.meta.hot.dispose(()=>camera?.destroy());
