import * as THREE from 'three';
import type {SharedSurface} from '../webgl/SharedRenderer';
import {QualityTier} from '../core/QualityTier';

/** Product lighting and metalwork. All maps are local procedural data: no HDR,
 * model, image decoder or extra renderer is downloaded for these objects. */
export function createPricingMetalwork(scene:THREE.Scene,objects:THREE.Group,surface:SharedSurface) {
  const started=performance.now();
  const textures:THREE.Texture[]=[];
  const materials=new Set<THREE.Material>();
  const geometries=new Set<THREE.BufferGeometry>();
  const faceMaterials:THREE.MeshPhysicalMaterial[]=[];
  const graphite={color:0x46515d,roughness:.41,anisotropy:.76};
  const lowPower=QualityTier.lowPower;
  let environment:THREE.WebGLRenderTarget|undefined;
  const dispose=()=>{scene.environment=null;environment?.dispose();textures.forEach(t=>t.dispose());geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());objects.clear();};
  try {
  function own<T extends THREE.Material>(material:T):T{materials.add(material);return material;}
  function mesh(geometry:THREE.BufferGeometry,material:THREE.Material){geometries.add(geometry);return new THREE.Mesh(geometry,material);}
  function canvas(w:number,h:number){const element=document.createElement('canvas');element.width=w;element.height=h;return element.getContext('2d',{willReadFrequently:true})!;}
  function colorMap(ctx:CanvasRenderingContext2D){const map=new THREE.CanvasTexture(ctx.canvas);map.colorSpace=THREE.SRGBColorSpace;map.anisotropy=4;textures.push(map);return map;}
  // R: engraved height, G: finish roughness, B: metalness. One packed data
  // texture serves three material slots; none of these channels are sRGB.
  function finishMap(ctx:CanvasRenderingContext2D,baseRoughness:number,etchedRoughness:number){
    const {width:w,height:h}=ctx.canvas;
    const image=ctx.getImageData(0,0,w,h);
    const data=image.data;
    const lutR=new Uint8Array(256),lutG=new Uint8Array(256);
    for(let v=0;v<256;v++){
      const stamp=v/255;
      lutR[v]=Math.round(164-stamp*62);
      lutG[v]=Math.round(THREE.MathUtils.lerp(baseRoughness,etchedRoughness,stamp));
    }
    for(let i=0,n=data.length;i<n;i+=4){
      const v=data[i];
      data[i]=lutR[v];data[i+1]=lutG[v];data[i+2]=255;data[i+3]=255;
    }
    const map=new THREE.DataTexture(data,w,h);map.colorSpace=THREE.NoColorSpace;map.flipY=true;map.magFilter=THREE.LinearFilter;map.minFilter=THREE.LinearMipmapLinearFilter;map.generateMipmaps=true;map.needsUpdate=true;textures.push(map);return map;
  }
  // Preserve readable engraved card lettering without procedural microrelief.
  function engravingContrast<T extends THREE.MeshStandardMaterial>(m:T){
    m.onBeforeCompile=shader=>{
      shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec2 vMetalUv;').replace('#include <uv_vertex>','#include <uv_vertex>\nvMetalUv=uv;');
      shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying vec2 vMetalUv;').replace('#include <color_fragment>','#include <color_fragment>\nfloat cut=clamp((0.642-texture2D(bumpMap,vBumpMapUv).r)/0.245,0.0,1.0);cut*=1.0-step(0.72,vMetalUv.x)*(1.0-step(0.18,vMetalUv.y));diffuseColor.rgb=mix(diffuseColor.rgb,vec3(0.34,0.38,0.42),cut*0.68);');
    };
    m.customProgramCacheKey=()=> 'snowy-engraving-contrast-v1';return m;
  }

  // Light cards are visible only through reflection. Dark gaps make the gloss
  // legible; increasing ambient illumination instead would flatten the metal.
  const studio=new THREE.Scene();studio.background=new THREE.Color(.13,.15,.19);
  const lightGeometry=new THREE.PlaneGeometry(1,1);
  const lightMaterials:THREE.MeshBasicMaterial[]=[];
  function softbox(x:number,y:number,z:number,w:number,h:number,power:number,tint:number,roll=0){
    const material=new THREE.MeshBasicMaterial({color:new THREE.Color(tint).multiplyScalar(power),side:THREE.DoubleSide});lightMaterials.push(material);
    const panel=new THREE.Mesh(lightGeometry,material);panel.position.set(x,y,z);panel.scale.set(w,h,1);panel.lookAt(0,0,0);panel.rotateZ(roll);studio.add(panel);
  }
  softbox(-.9,-.8,5,.65,7,3.6,0xf2f7ff,-.38);
  softbox(1.2,-.3,5,.7,7,2.8,0xfff8ea);
  softbox(3.7,.6,4.1,.6,7,7,0xdbefff);
  softbox(.2,5,2.8,5,1.1,4.5,0xffffff);
  softbox(-4,-2,-3,2.5,6,3.5,0xffffff);
  softbox(4,1,-4,1.2,7,6,0xc3deff);
  softbox(0,0,-6,4.5,7,2.2,0xf2f7ff);
  softbox(0,-4,3,3,.8,1.8,0xf9e6c8);
  const generator=new THREE.PMREMGenerator(surface.engine);
  try {environment=generator.fromScene(studio,0,.1,50,{size:lowPower?128:256});}
  finally {generator.dispose();lightGeometry.dispose();lightMaterials.forEach(m=>m.dispose());studio.clear();}
  scene.environment=environment.texture;scene.environmentIntensity=1.1;
  surface.toneMapping=THREE.ACESFilmicToneMapping;surface.toneMappingExposure=1.05;
  surface.engine.toneMapping=THREE.ACESFilmicToneMapping;surface.engine.toneMappingExposure=1.05;
  scene.add(new THREE.HemisphereLight(0xdfeeff,0x101826,.35));
  const key=new THREE.DirectionalLight(0xfff8ef,1.15);key.position.set(-3,5,7);scene.add(key);
  const rim=new THREE.DirectionalLight(0xb9dfff,.65);rim.position.set(4,1,3);scene.add(rim);

  function cardMarks(c:CanvasRenderingContext2D,data=false,back=false){
    c.fillStyle=data?'#fff':'#c9dce6';c.strokeStyle=data?'#888':'#7892a5';
    c.lineWidth=1.3;c.strokeRect(29,29,710,1094);
    // Compact serif wordmark, painted into the existing colour/height maps.
    c.save();c.font='48px Georgia, serif';let pen=65;
    for(const letter of 'SNOWY'){
      const width=c.measureText(letter).width;c.fillText(letter,pen,112);
      if(letter==='O'){
        c.save();c.translate(pen+width/2,95);c.strokeStyle=c.fillStyle;c.lineWidth=1.25;
        for(let arm=0;arm<6;arm++){c.save();c.rotate(arm*Math.PI/3);c.beginPath();c.moveTo(0,0);c.lineTo(0,-10);c.moveTo(0,-6);c.lineTo(-3,-8);c.moveTo(0,-6);c.lineTo(3,-8);c.stroke();c.restore();}c.restore();
      }
      pen+=width+1.5;
    }
    c.textAlign='center';c.font='12px Arial';c.fillText('D E B I T',(65+pen-1.5)/2,141);c.restore();
    if(back){
      c.fillStyle=data?'#111':'#070b10';c.fillRect(29,220,710,133);
      c.fillStyle=data?'#fff':'#c9dce6';
      c.font='26px monospace';c.fillText('YOUR NAME',65,425);
      c.font='bold 38px monospace';c.fillText('2007 **** **** ****',65,665);
      c.font='18px Arial';c.fillText('VALID THRU',65,770);c.fillText('CVV',420,770);
      c.font='32px monospace';c.fillText('03/ 27',65,820);c.fillText('***',420,820);
      return;
    }
    // Fine concentric etching, not painted illumination.
    c.strokeStyle=data?'#333':'#536e83';c.lineWidth=.8;
    for(let n=0;n<5;n++){c.beginPath();c.ellipse(785,500,300+n*31,490+n*28,.5,0,Math.PI*2);c.stroke();}
    c.fillStyle=data?'#ddd':'#adc4d3';
    c.save();c.translate(688,905);c.rotate(-Math.PI/2);c.font='bold 76px Arial';c.fillText('SNOWY',0,0);c.restore();
    c.font='18px Arial';c.fillText('DEBIT',65,1040);
    c.lineWidth=3;c.strokeStyle=data?'#ddd':'#a3bdcf';for(let i=0;i<3;i++){c.beginPath();c.arc(215,329,13+i*10,-.7,.7);c.stroke();}
    c.fillStyle=data?'#aaa':'#cf6754';c.beginPath();c.arc(625,1035,29,0,Math.PI*2);c.fill();c.fillStyle=data?'#aaa':'#d7b46a';c.beginPath();c.arc(664,1035,29,0,Math.PI*2);c.fill();
  }
  function cardFace(back=false){
    const width=lowPower?512:768;
    const color=canvas(width,width*1.5);color.scale(width/768,width/768);color.fillStyle='#737b83';color.fillRect(0,0,768,1152);cardMarks(color,false,back);
    const data=canvas(width,width*1.5);data.scale(width/768,width/768);data.fillStyle='#000';data.fillRect(0,0,768,1152);cardMarks(data,true,back);const finish=finishMap(data,188,124);
    const m=own(engravingContrast(new THREE.MeshPhysicalMaterial({map:colorMap(color),color:graphite.color,metalness:1,metalnessMap:finish,roughness:graphite.roughness,roughnessMap:finish,bumpMap:finish,bumpScale:.025,anisotropy:graphite.anisotropy,anisotropyRotation:0,envMapIntensity:1.05})));
    faceMaterials.push(m);return m;
  }
  const edge=own(new THREE.MeshStandardMaterial({color:0x64727f,metalness:1,roughness:.13,envMapIntensity:1.2}));
  const shape=new THREE.Shape();const w=2.7,h=4.25,r=.18,x=-w/2,y=-h/2;
  shape.moveTo(x+r,y);shape.lineTo(x+w-r,y);shape.quadraticCurveTo(x+w,y,x+w,y+r);shape.lineTo(x+w,y+h-r);shape.quadraticCurveTo(x+w,y+h,x+w-r,y+h);shape.lineTo(x+r,y+h);shape.quadraticCurveTo(x,y+h,x,y+h-r);shape.lineTo(x,y+r);shape.quadraticCurveTo(x,y,x+r,y);
  const card=new THREE.Group();objects.add(card);
  const body=mesh(new THREE.ExtrudeGeometry(shape,{depth:.08,bevelEnabled:true,bevelThickness:.018,bevelSize:.013,bevelSegments:3,steps:1,curveSegments:12}),edge);body.position.z=-.04;card.add(body);
  const faceGeometry=new THREE.ShapeGeometry(shape,12);const pos=faceGeometry.getAttribute('position'),uv=faceGeometry.getAttribute('uv');
  for(let i=0;i<uv.count;i++)uv.setXY(i,(pos.getX(i)+w/2)/w,(pos.getY(i)+h/2)/h);
  const front=mesh(faceGeometry,cardFace());front.position.z=.059;card.add(front);
  const rear=mesh(faceGeometry,cardFace(true));rear.rotation.y=Math.PI;rear.position.z=-.059;card.add(rear);
  // Share MeshStandardMaterial program with edge/coins (BoxGeometry has no vertex tangents).
  const chip=mesh(new THREE.BoxGeometry(.39,.29,.028),own(new THREE.MeshStandardMaterial({color:0xdac491,metalness:1,roughness:.23,envMapIntensity:1.05})));chip.position.set(-.91,.91,.075);chip.name='raised-emv-chip';card.add(chip);
  const chipLines=new THREE.Group();card.add(chipLines);
  const lineMaterial=own(new THREE.MeshStandardMaterial({color:0x6b6042,metalness:1,roughness:.32}));
  for(let n=-1;n<=1;n++){const line=mesh(new THREE.PlaneGeometry(.37,.005),lineMaterial);line.position.set(-.91,.91+n*.079,.090);chipLines.add(line);}
  for(const dx of [-.07,.07]){const line=mesh(new THREE.PlaneGeometry(.004,.28),lineMaterial);line.position.set(-.91+dx,.91,.090);chipLines.add(line);}

  // Contiguous vector outlines adapted from Bitcoin Design and PayPal's mark.
  // They are static paths, not runtime SVG/image loads or shader-generated detail.
  const bitcoinPaths:number[][][]=[[[0,-0.169512,-0.103],[2,-0.172648,-0.110776,-0.180592,-0.122448,-0.19848,-0.118016],[2,-0.197848,-0.118928,-0.24444,-0.106552,-0.24444,-0.106552],[1,-0.2758,-0.17888],[1,-0.19356,-0.199384],[2,-0.178272,-0.203216,-0.163256,-0.207216,-0.148504,-0.211008],[1,-0.17464,-0.316024],[1,-0.111512,-0.331776],[1,-0.085616,-0.22788],[2,-0.068352,-0.232552,-0.051616,-0.23688,-0.035232,-0.240952],[1,-0.06104,-0.34436],[1,0.00216,-0.360112],[1,0.02832,-0.255296],[2,0.136104,-0.27568,0.217152,-0.267456,0.251248,-0.169992],[2,0.278744,-0.091512,0.249888,-0.04624,0.193184,-0.016712],[2,0.234472,-0.007192,0.265592,0.019976,0.273888,0.076072],[2,0.285352,0.152728,0.226984,0.19392,0.147184,0.221408],[1,0.173064,0.325232],[1,0.109872,0.340984],[1,0.084664,0.239896],[2,0.068032,0.24404,0.050984,0.247944,0.034016,0.251808],[1,0.059384,0.353568],[1,-0.003768,0.36932],[1,-0.02968,0.265512],[1,-0.157128,0.29708],[1,-0.173944,0.229584],[2,-0.173944,0.229584,-0.127056,0.21884,-0.128048,0.218168],[2,-0.102448,0.211776,-0.097832,0.19484,-0.0986,0.181416],[1,-0.169512,-0.103]],[[0,0.129496,-0.126416],[2,0.109944,-0.204904,-0.022184,-0.162472,-0.065048,-0.151824],[1,-0.030344,-0.012712],[2,0.012496,-0.023392,0.149896,-0.04456,0.129496,-0.126416]],[[0,0.149016,0.0772],[2,0.131208,0.005808,0.021216,0.042088,-0.014464,0.050984],[1,0.016992,0.17716],[2,0.052664,0.168264,0.167584,0.151664,0.149016,0.0772]]];
  const paypalPaths:number[][][]=[[[0,-0.150032,-0.216],[1,-0.299104,-0.216],[1,-0.209424,0.36],[1,0.032096,0.36],[2,0.113424,0.36,0.177408,0.314672,0.200976,0.25168],[1,0.200976,0.25168],[2,0.207773,0.233365,0.211047,0.213931,0.210624,0.1944],[2,0.271824,0.162816,0.307504,0.098992,0.296544,0.0288],[2,0.28011,-0.071053,0.193676,-0.144245,0.09248,-0.144],[1,0.009184,-0.144],[1,-0.025488,-0.36],[1,-0.17376,-0.36],[1,-0.150032,-0.216]]];
  const paypalFloorsPaths:number[][][]=[[[0,0.210624,0.1944],[2,0.210624,0.105216,0.12832,0.0,0.003792,0.0],[1,-0.11616,0.0],[1,-0.122048,-0.037152],[1,-0.150032,-0.216],[1,-0.299104,-0.216],[1,-0.209424,0.36],[1,0.032096,0.36],[2,0.113424,0.36,0.177408,0.314672,0.200976,0.25168],[1,0.200976,0.25168],[2,0.207773,0.233365,0.211047,0.213931,0.210624,0.1944]],[[0,0.296544,0.0288],[2,0.28011,-0.071053,0.193676,-0.144245,0.09248,-0.144],[1,0.009184,-0.144],[1,-0.025488,-0.36],[1,-0.17376,-0.36],[1,-0.150032,-0.216],[1,-0.122032,-0.037152],[1,-0.11616,0.0],[1,0.003792,0.0],[2,0.12816,0.0,0.210624,0.105216,0.210624,0.1944],[2,0.271824,0.162816,0.307504,0.098992,0.296544,0.0288]],[[0,0.210624,0.1944],[2,0.18496,0.207824,0.15384,0.216,0.119968,0.216],[1,-0.082272,0.216],[1,-0.11616,0.0],[1,0.003792,0.0],[2,0.12816,0.0,0.210624,0.105216,0.210624,0.1944]]];
  function trace(path:THREE.Path,commands:number[][]){
    for(const c of commands){if(c[0]===0)path.moveTo(c[1],c[2]);else if(c[0]===1)path.lineTo(c[1],c[2]);else if(c[0]===2)path.bezierCurveTo(c[1],c[2],c[3],c[4],c[5],c[6]);else path.quadraticCurveTo(c[1],c[2],c[3],c[4]);}path.closePath();return path;
  }
  function symbol(paths:number[][][]){const shape=trace(new THREE.Shape(),paths[0]) as THREE.Shape;for(const hole of paths.slice(1))shape.holes.push(trace(new THREE.Path(),hole));return shape;}
  function coin(kind:'bitcoin'|'paypal'){
    const gold=kind==='bitcoin';
    // metalness: 1 with no clearcoat/sheen/anisotropy is mathematically identical
    // to MeshStandardMaterial, avoiding 2 extra MeshPhysicalMaterial cold shader compiles.
    const polished=own(new THREE.MeshStandardMaterial({color:gold?0xffd891:0xe8eaea,metalness:1,roughness:.17,envMapIntensity:1}));
    const struck=own(new THREE.MeshStandardMaterial({color:gold?0xffd891:0xe3e6e8,metalness:1,roughness:.24,envMapIntensity:1}));
    const floorMaterial=own(new THREE.MeshStandardMaterial({color:gold?0xd1a754:0x88a0b5,metalness:1,roughness:.26,envMapIntensity:1}));
    const pivot=new THREE.Group();pivot.name=kind+'-coin';pivot.scale.setScalar(.94);objects.add(pivot);
    // One continuous lathed shoulder and smooth edge replaces the separate
    // tube-like rim meshes. Outer silhouette retains 96 angular segments.
    const profile=[new THREE.Vector2(.535,-.058),new THREE.Vector2(.572,-.053),new THREE.Vector2(.585,-.068),new THREE.Vector2(.607,-.073),new THREE.Vector2(.62,-.055),new THREE.Vector2(.62,.055),new THREE.Vector2(.607,.073),new THREE.Vector2(.585,.068),new THREE.Vector2(.572,.053),new THREE.Vector2(.535,.058)];
    const shoulderGeometry=new THREE.LatheGeometry(profile,96);shoulderGeometry.deleteAttribute('uv');
    const sp=shoulderGeometry.getAttribute('position'),sn=shoulderGeometry.getAttribute('normal');
    // 48 real machined grooves use the existing 96 angular samples. Split
    // flank normals keep the cuts crisp without a per-pixel detail shader.
    for(let i=0;i<=96;i++)if(i%2)for(const j of [4,5]){const n=i*profile.length+j;sp.setX(n,sp.getX(n)*(.616/.62));sp.setZ(n,sp.getZ(n)*(.616/.62));}
    const edgePositions=Array.from(sp.array),edgeNormals=Array.from(sn.array),edgeIndex:number[]=[];
    const oldIndex=shoulderGeometry.index!;
    for(let i=0;i<96;i++)for(let j=0;j<profile.length-1;j++)if(j!==4)for(let k=0;k<6;k++)edgeIndex.push(oldIndex.getX((i*(profile.length-1)+j)*6+k));
    const p0=new THREE.Vector3(),p1=new THREE.Vector3(),p2=new THREE.Vector3(),p3=new THREE.Vector3(),e1=new THREE.Vector3(),e2=new THREE.Vector3(),nrm=new THREE.Vector3();
    for(let i=0;i<96;i++){
      const n0=i*profile.length+4,n1=(i+1)*profile.length+4,n2=(i+1)*profile.length+5,n3=i*profile.length+5;
      p0.fromBufferAttribute(sp,n0);p1.fromBufferAttribute(sp,n1);p2.fromBufferAttribute(sp,n2);p3.fromBufferAttribute(sp,n3);
      nrm.crossVectors(e1.subVectors(p1,p0),e2.subVectors(p3,p0)).normalize();
      const offset=edgePositions.length/3;
      edgePositions.push(p0.x,p0.y,p0.z,p1.x,p1.y,p1.z,p2.x,p2.y,p2.z,p3.x,p3.y,p3.z);
      edgeNormals.push(nrm.x,nrm.y,nrm.z,nrm.x,nrm.y,nrm.z,nrm.x,nrm.y,nrm.z,nrm.x,nrm.y,nrm.z);
      edgeIndex.push(offset,offset+1,offset+3,offset+2,offset+3,offset+1);
    }
    shoulderGeometry.setAttribute('position',new THREE.Float32BufferAttribute(edgePositions,3));shoulderGeometry.setAttribute('normal',new THREE.Float32BufferAttribute(edgeNormals,3));shoulderGeometry.setIndex(edgeIndex);
    const shoulder=mesh(shoulderGeometry,polished);shoulder.rotation.x=Math.PI/2;pivot.add(shoulder);
    const mark=symbol(gold?bitcoinPaths:paypalPaths);
    const face=new THREE.Shape(Array.from({length:96},(_,i)=>new THREE.Vector2(Math.cos(i/96*Math.PI*2)*.54,Math.sin(i/96*Math.PI*2)*.54)));const pocket=new THREE.Path();pocket.curves=mark.curves;face.holes.push(pocket);
    // Counter islands remain level with the face; the surrounding symbol is cut.
    const islands=mark.holes.map(h=>{const island=new THREE.Shape();island.curves=h.curves;return island;});
    const cut=new THREE.ExtrudeGeometry([face,...islands],{depth:.018,bevelEnabled:true,bevelThickness:.004,bevelSize:.005,bevelSegments:1,curveSegments:12,steps:1});
    // Hidden bottom caps do not contribute to the accepted surface.
    const keep:number[]=[];const position=cut.getAttribute('position'),normal=cut.getAttribute('normal');
    for(let i=0;i<position.count;i+=3){if(normal.getZ(i)<-.99&&normal.getZ(i+1)<-.99&&normal.getZ(i+2)<-.99)continue;if([i,i+1,i+2].every(n=>Math.hypot(position.getX(n),position.getY(n))>.534)&&normal.getZ(i)<.99)continue;for(let j=0;j<3;j++)keep.push(i+j);}
    const cap=new THREE.BufferGeometry();for(const key of ['position','normal'] as const){const source=cut.getAttribute(key),values=new Float32Array(keep.length*3);keep.forEach((n,i)=>values.set([source.getX(n),source.getY(n),source.getZ(n)],i*3));cap.setAttribute(key,new THREE.BufferAttribute(values,3));}cut.dispose();
    // Author a shallow, broad struck-metal normal field on the existing face
    // vertices. It changes reflection flow, not geometry count or shader work.
    const cp=cap.getAttribute('position'),cn=cap.getAttribute('normal');
    for(let i=0;i<cp.count;i++)if(cn.getZ(i)>.99){const n=new THREE.Vector3(cp.getX(i)*.32,cp.getY(i)*.32,1).normalize();cn.setXYZ(i,n.x,n.y,n.z);}
    // Exact bit-level indexing: coalesce only bit-identical position+normal tuples (including -0 vs +0) without string allocations.
    const fbuf=new Float32Array(6),ubuf=new Uint32Array(fbuf.buffer);
    const buckets=new Map<number,number[]>(),vertices:number[]=[],normals:number[]=[],index:number[]=[];
    const storedBits:number[]=[];
    for(let i=0;i<cp.count;i++){
      fbuf[0]=cp.getX(i);fbuf[1]=cp.getY(i);fbuf[2]=cp.getZ(i);
      fbuf[3]=cn.getX(i);fbuf[4]=cn.getY(i);fbuf[5]=cn.getZ(i);
      let h=2166136261>>>0;
      for(let k=0;k<6;k++)h=Math.imul(h^ubuf[k],16777619)>>>0;
      const bucket=buckets.get(h);let found=-1;
      if(bucket){
        for(let b=0;b<bucket.length;b++){
          const cand:number=bucket[b];const off=cand*6;
          if(storedBits[off]===ubuf[0]&&storedBits[off+1]===ubuf[1]&&storedBits[off+2]===ubuf[2]&&storedBits[off+3]===ubuf[3]&&storedBits[off+4]===ubuf[4]&&storedBits[off+5]===ubuf[5]){found=cand;break;}
        }
      }
      if(found===-1){
        found=vertices.length/3;
        vertices.push(fbuf[0],fbuf[1],fbuf[2]);normals.push(fbuf[3],fbuf[4],fbuf[5]);
        storedBits.push(ubuf[0],ubuf[1],ubuf[2],ubuf[3],ubuf[4],ubuf[5]);
        if(bucket)bucket.push(found);else buckets.set(h,[found]);
      }
      index.push(found);
    }
    cap.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));cap.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));cap.setIndex(index);cap.computeBoundingSphere();
    const paypalTones=[0x17498c,0x72bcea,0x347db3];
    const floorParts=gold
      ?[{geo:new THREE.ShapeGeometry(mark,8),mat:floorMaterial}]
      :paypalFloorsPaths.map((p,i)=>{
        const g=new THREE.ShapeGeometry(symbol([p]),8);
        g.translate(0,0,i*.0003);
        g.deleteAttribute('uv');
        return {geo:g,mat:own(new THREE.MeshStandardMaterial({color:paypalTones[i],metalness:1,roughness:.26,envMapIntensity:1}))};
      });
    if(gold)floorParts[0].geo.deleteAttribute('uv');
    for(const reverse of [false,true]){
      const sign=reverse?-1:1;
      const faceMesh=mesh(cap,struck);faceMesh.rotation.y=reverse?Math.PI:0;faceMesh.position.z=.036*sign;pivot.add(faceMesh);
      const recessGroup=new THREE.Group();recessGroup.rotation.y=reverse?Math.PI:0;recessGroup.position.z=.034*sign;recessGroup.name='engraved-'+kind+(reverse?'-back':'-front');
      for(const part of floorParts)recessGroup.add(mesh(part.geo,part.mat));
      pivot.add(recessGroup);
    }
    return pivot;
  }
  const bitcoin=coin('bitcoin'),paypal=coin('paypal');
  // Only metal geometry enters layer1. Later optical fields remain on layer0.
  objects.traverse(node=>{if(node instanceof THREE.Mesh){node.layers.enable(1);node.userData.metalBloom=true;}});
  scene.traverse(node=>{if(node instanceof THREE.Light)node.layers.enable(1);});
  return {card,bitcoin,paypal,finish:'graphite' as const,faceMaterials,environmentSize:[environment.width,environment.height],setupMs:performance.now()-started,dispose};
  } catch(error){dispose();throw error;}
}
