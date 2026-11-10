export interface AuroraViewport {
  width:number;height:number;deviceDPR:number;lowPower:boolean;
  maxWidth:number;maxHeight:number;
}

/** Full-surface limits also bound the CSS filter/compositor cost. */
export function auroraCeiling(view:AuroraViewport):number {
  const {width,height,lowPower}=view;
  return Math.min(view.deviceDPR||1,lowPower?1.25:1.5,
    Math.min(view.maxWidth,lowPower?1440:3840)/width,
    Math.min(view.maxHeight,lowPower?1000:1440)/height,
    Math.sqrt((lowPower?900_000:3_200_000)/(width*height)));
}

/** Slow upgrades and faster sustained-pressure reductions, using wall time. */
export class AuroraQuality {
  ratio=1;ceiling=1;revision=0;
  private floor=1;
  private low=false;
  private configured=false;
  private warmUntil=0;
  private lastChange=0;
  private lastFrame=0;
  private windowStart=0;
  private frameCount=0;
  private lateFrames=0;
  private submitCosts:number[]=[];
  private gpuCosts:number[]=[];
  private calmMs=0;
  private pressureMs=0;

  configure(view:AuroraViewport,now:number):void {
    const previousRatio=this.ratio;
    this.low=view.lowPower;this.ceiling=auroraCeiling(view);
    this.floor=Math.min(this.ceiling*.40,this.configured?previousRatio:Infinity);
    // Start at the known working resolution, then earn a higher resolution.
    const initial=Math.min(this.ceiling,this.low?.9:1,
      (this.low?900:1800)/view.width,(this.low?700:1000)/view.height);
    this.ratio=this.configured?Math.max(this.floor,Math.min(this.ceiling,previousRatio)):initial;
    this.configured=true;this.revision++;this.lastChange=now;this.hold(now);
  }
  hold(now:number):void {
    this.warmUntil=now+1800;this.lastFrame=0;this.calmMs=this.pressureMs=0;this.clearWindow(now);
  }
  frame(now:number):void {
    if(now<this.warmUntil){this.lastFrame=now;return;}
    const gap=this.lastFrame?now-this.lastFrame:0;this.lastFrame=now;
    // Hidden/resume and debugger pauses are not rendering-performance samples.
    if(gap>1000){this.hold(now);return;}
    if(gap>0){this.frameCount++;if(gap>34)this.lateFrames++;}
  }
  submit(milliseconds:number):void {
    if(Number.isFinite(milliseconds))this.submitCosts.push(milliseconds);
  }
  gpu(milliseconds:number,revision:number):void {
    if(revision===this.revision&&Number.isFinite(milliseconds)&&milliseconds>=0)this.gpuCosts.push(milliseconds);
  }
  evaluate(now:number,allowUpgrade:boolean):boolean {
    if(now<this.warmUntil){this.clearWindow(now);return false;}
    const duration=now-this.windowStart;
    if(duration<1500||this.frameCount<12||this.submitCosts.length<6)return false;
    const costs=this.submitCosts.sort((a,b)=>a-b);
    const cpu90=costs[Math.floor((costs.length-1)*.9)];
    const late=this.lateFrames/this.frameCount;
    const gpu=this.gpuCosts.length?this.gpuCosts.reduce((sum,n)=>sum+n,0)/this.gpuCosts.length:null;
    const budget=this.low?5:7;
    const pressure=late>.10||cpu90>(this.low?12:9)||(gpu!==null&&gpu>budget);
    const calm=late<.025&&cpu90<3&&(gpu===null||gpu<budget*.65);
    this.pressureMs=pressure?this.pressureMs+duration:0;
    this.calmMs=calm&&allowUpgrade?this.calmMs+duration:0;
    this.clearWindow(now);
    let next=this.ratio;
    if(this.pressureMs>=2500&&now-this.lastChange>=2500){
      next=Math.max(this.floor,this.ratio*.85);
    }else if(this.calmMs>=(gpu===null?12_000:8000)&&now-this.lastChange>=8000){
      next=Math.min(this.ceiling,this.ratio*1.12);
      if(next>this.ceiling*.95)next=this.ceiling;
    }
    if(Math.abs(next-this.ratio)<.015)return false;
    this.ratio=next;this.revision++;this.lastChange=now;this.hold(now);return true;
  }
  private clearWindow(now:number):void {
    this.windowStart=now;this.frameCount=this.lateFrames=0;this.submitCosts=[];this.gpuCosts=[];
  }
}

interface TimerExtension {TIME_ELAPSED_EXT:number;GPU_DISJOINT_EXT:number;}
interface PendingTime {query:WebGLQuery;revision:number;started:number;}

/** Optional asynchronous GPU samples; never waits for a query or reads pixels. */
export class AuroraGpuTimer {
  private gl:WebGL2RenderingContext;
  private extension:TimerExtension|null=null;
  private pending:PendingTime[]=[];
  private active?:PendingTime;
  private frames=0;
  constructor(gl:WebGL2RenderingContext){this.gl=gl;this.restore();}
  restore():void {
    this.pending=[];this.active=undefined;this.frames=0;
    this.extension=this.gl.getExtension('EXT_disjoint_timer_query_webgl2') as TimerExtension|null;
  }
  begin(revision:number,now:number):void {
    const gl=this.gl,ext=this.extension;
    if(!ext||++this.frames<20||this.frames%8!==0||this.pending.length>=3)return;
    if(gl.getQuery(ext.TIME_ELAPSED_EXT,gl.CURRENT_QUERY))return;
    const query=gl.createQuery();if(!query)return;
    gl.beginQuery(ext.TIME_ELAPSED_EXT,query);this.active={query,revision,started:now};
  }
  end():void {
    if(!this.active||!this.extension)return;
    this.gl.endQuery(this.extension.TIME_ELAPSED_EXT);this.pending.push(this.active);this.active=undefined;
  }
  poll(now:number,accept:(milliseconds:number,revision:number)=>void):void {
    const gl=this.gl,ext=this.extension;if(!ext)return;
    const keep:PendingTime[]=[];
    for(const sample of this.pending){
      const available=gl.getQueryParameter(sample.query,gl.QUERY_RESULT_AVAILABLE) as boolean;
      if(available){
        if(!gl.getParameter(ext.GPU_DISJOINT_EXT))accept(Number(gl.getQueryParameter(sample.query,gl.QUERY_RESULT))/1e6,sample.revision);
        gl.deleteQuery(sample.query);
      }else if(now-sample.started>2000){gl.deleteQuery(sample.query);}
      else keep.push(sample);
    }
    this.pending=keep;
  }
  clear(lost=false):void {
    if(!lost){for(const sample of this.pending)this.gl.deleteQuery(sample.query);}
    this.pending=[];this.active=undefined;this.frames=0;
  }
}
