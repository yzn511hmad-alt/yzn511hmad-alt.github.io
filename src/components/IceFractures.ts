export type IcePoint={x:number;y:number};
export type IceCrack={points:IcePoint[];strength:number;width:number};
type Face=[IcePoint,IcePoint,IcePoint,IcePoint];
const faces:Face[]=[
  [{x:.055,y:.21},{x:.677,y:.23},{x:.641,y:.938},{x:.072,y:.816}],
  [{x:.677,y:.23},{x:.95,y:.155},{x:.941,y:.746},{x:.641,y:.938}],
  [{x:.423,y:.047},{x:.924,y:.116},{x:.677,y:.23},{x:.055,y:.21}],
];
function random(seed:number):()=>number{return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function project(f:Face,u:number,v:number):IcePoint{return{x:f[0].x*(1-u)*(1-v)+f[1].x*u*(1-v)+f[2].x*u*v+f[3].x*(1-u)*v,y:f[0].y*(1-u)*(1-v)+f[1].y*u*(1-v)+f[2].y*u*v+f[3].y*(1-u)*v};}
function inverse(f:Face,p:IcePoint):IcePoint{
  let u=.5,v=.5;
  for(let i=0;i<7;i++){const q=project(f,u,v),a={x:(f[1].x-f[0].x)*(1-v)+(f[2].x-f[3].x)*v,y:(f[1].y-f[0].y)*(1-v)+(f[2].y-f[3].y)*v},b={x:(f[3].x-f[0].x)*(1-u)+(f[2].x-f[1].x)*u,y:(f[3].y-f[0].y)*(1-u)+(f[2].y-f[1].y)*u};const d=a.x*b.y-a.y*b.x;if(Math.abs(d)<1e-6)break;u-=((q.x-p.x)*b.y-(q.y-p.y)*b.x)/d;v-=(a.x*(q.y-p.y)-a.y*(q.x-p.x))/d;}
  return{x:u,y:v};
}
/** Unequal, branching fractures projected into the struck face's perspective. */
export function createIceFractures(hit:number,p:IcePoint):{cracks:IceCrack[];origin:IcePoint}{
  const rng=random(421+hit*971),candidates=faces.map(face=>({face,uv:inverse(face,p)}));
  const chosen=candidates.find(c=>c.uv.x>=0&&c.uv.x<=1&&c.uv.y>=0&&c.uv.y<=1)||candidates.sort((a,b)=>Math.max(0,-a.uv.x,a.uv.x-1,-a.uv.y,a.uv.y-1)-Math.max(0,-b.uv.x,b.uv.x-1,-b.uv.y,b.uv.y-1))[0];
  const origin={x:Math.max(.018,Math.min(.982,chosen.uv.x)),y:Math.max(.018,Math.min(.982,chosen.uv.y))},cracks:IceCrack[]=[];
  const trace=(start:IcePoint,heading:number,length:number,width:number,strength:number)=>{
    const points=[start];let q={...start},angle=heading;const steps=Math.ceil(length/.015),bend=(rng()-.5)*.9;
    for(let i=0;i<steps;i++){const turn=(rng()-.5)*.60;angle=heading+bend*i/steps+turn;const step=length/steps*(.65+rng()*.7);const next={x:q.x+Math.cos(angle)*step,y:q.y+Math.sin(angle)*step};if(next.x<.007||next.x>.993||next.y<.007||next.y>.993)break;points.push(next);q=next;}
    if(points.length>2)cracks.push({points:points.map(v=>project(chosen.face,v.x,v.y)),width,strength});return points;
  };
  const arms=4+Math.floor(rng()*3),rotation=rng()*Math.PI*2;
  for(let i=0;i<arms;i++){
    const heading=rotation+i*Math.PI*2/arms+(rng()-.5)*.95;
    const length=(.20+rng()*.28)*(1+(hit-1)*.07),width=1.5+rng()*.9;
    const main=trace(origin,heading,length,width,.85+rng()*.15);
    for(let j=0;j<1+Math.floor(rng()*3);j++){if(main.length<5)break;const index=2+Math.floor(rng()*(main.length-3)),base=main[index];trace(base,heading+(rng()<.5?-1:1)*(.45+rng()*.75),length*(.20+rng()*.30),width*(.35+rng()*.2),.60+rng()*.25);}
  }
  return{cracks,origin:project(chosen.face,origin.x,origin.y)};
}
/** Tight interior matte derived from actual alpha, including curved/melting edges. */
export function createIceInterior(image:HTMLImageElement):HTMLCanvasElement{
  const mask=document.createElement('canvas');mask.width=image.naturalWidth;mask.height=image.naturalHeight;
  const c=mask.getContext('2d',{willReadFrequently:true})!;c.drawImage(image,0,0);const pixels=c.getImageData(0,0,mask.width,mask.height),w=mask.width,h=mask.height,horizontal=new Uint8Array(w*h);
  for(let y=0;y<h;y++)for(let x=2;x<w-2;x++){const i=y*w+x,j=i*4+3,d=pixels.data;horizontal[i]=d[j-8]>=220&&d[j-4]>=220&&d[j]>=220&&d[j+4]>=220&&d[j+8]>=220?1:0;}
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=y*w+x,inside=y>=2&&y<h-2&&horizontal[i-w*2]&&horizontal[i-w]&&horizontal[i]&&horizontal[i+w]&&horizontal[i+w*2];pixels.data[i*4]=pixels.data[i*4+1]=pixels.data[i*4+2]=255;pixels.data[i*4+3]=inside?255:0;}
  c.putImageData(pixels,0,0);return mask;
}
export function paintIceFractures(c:CanvasRenderingContext2D,cracks:IceCrack[],impacts:IcePoint[],size:number,mask:HTMLCanvasElement):void{
  c.lineCap='round';c.lineJoin='round';
  for(const crack of cracks){for(let i=1;i<crack.points.length;i++){
    const a=crack.points[i-1],b=crack.points[i],t=(i-.5)/(crack.points.length-1),width=crack.width*(1-t*.82);
    c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.strokeStyle=`rgba(1,14,24,${crack.strength*.62})`;c.lineWidth=width*1.70/size;c.stroke();
    c.strokeStyle=`rgba(223,248,255,${crack.strength*(.98-t*.18)})`;c.lineWidth=width*.86/size;c.stroke();
  }}
  for(let i=0;i<impacts.length;i++){const p=impacts[i],rng=random(901+i*79),glow=c.createRadialGradient(p.x,p.y,0,p.x,p.y,.012);glow.addColorStop(0,'#e0f5ff99');glow.addColorStop(1,'#bce9ff00');c.fillStyle=glow;c.fillRect(p.x-.013,p.y-.013,.026,.026);
    c.fillStyle='#d3eeff66';for(let j=0;j<20;j++){const angle=rng()*Math.PI*2,r=.014*rng()*rng(),s=(.3+rng()*.6)/size;c.fillRect(p.x+Math.cos(angle)*r,p.y+Math.sin(angle)*r,s,s*.7);}
  }
  c.globalCompositeOperation='destination-in';c.drawImage(mask,0,0,1,1);c.globalCompositeOperation='source-over';
}
