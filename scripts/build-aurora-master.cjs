/** Native3840x2160 procedural-detail master over the approved photographic guide.
 * The guide is1672x941; this is explicitly a mixed-resolution composite, not native4K photography.
 */
const fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright'),sharp=require('sharp');
const root=path.resolve(__dirname,'..'),assets=path.join(root,'public/assets/atmosphere');
const fragment=`precision highp float;
uniform sampler2D uBase;uniform sampler2D uDetail;varying vec2 vUv;
float hash(float n){return fract(sin(n*127.1+311.7)*43758.5453);}
float noise(float p){float i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(hash(i),hash(i+1.),f);}
void main(){
 vec2 uv=vUv;vec4 base=texture2D(uBase,uv);if(base.a<.001)discard;
 vec4 guide=texture2D(uDetail,uv);
 // Fine vertical bundles follow a gently folded field; every cell is several4K pixels wide.
 float x=uv.x+.0022*sin(uv.x*13.+uv.y*1.7)+.0007*sin(uv.x*39.-uv.y*2.1);
 float fibers=noise(x*760.+noise(x*47.)*.35),bundles=noise(x*253.+13.4);
 float needles=smoothstep(.64,.94,fibers)*smoothstep(.35,.85,bundles);
 float structure=smoothstep(.07,.45,base.a);
 float density=mix(1.,.91+.09*fibers,structure);
 // A little regenerated fine light guides detail, while original alpha fixes the silhouette.
 vec3 colour=mix(base.rgb,guide.rgb*base.a/max(guide.a,.06),.10*structure);
 colour*=density*(1.+structure*(.14*needles+.025*bundles));
 gl_FragColor=vec4(colour,base.a*density);
}`;
(async()=>{const b=await chromium.launch({channel:'msedge',headless:true});try{
 const p=await b.newPage();const inputs=['aurora-natural-fold-v1.webp','aurora-detail-guide.png'].map(name=>'data:image/'+(name.endsWith('png')?'png':'webp')+';base64,'+fs.readFileSync(name.endsWith('png')?path.join(root,'work/aurora-4k-master/detail-guide.png'):path.join(assets,name)).toString('base64'));
 const result=await p.evaluate(async({fragment,inputs})=>{
  const c=document.createElement('canvas');c.width=3840;c.height=2160;
  const gl=c.getContext('webgl',{alpha:true,premultipliedAlpha:true,antialias:false,preserveDrawingBuffer:true});if(!gl)throw Error('WebGL unavailable for asset bake');
  const compile=(type,src)=>{const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;};
  const pr=gl.createProgram();gl.attachShader(pr,compile(gl.VERTEX_SHADER,'attribute vec2 position;varying vec2 vUv;void main(){vUv=position*.5+.5;gl_Position=vec4(position,0.,1.);}'));gl.attachShader(pr,compile(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(pr);if(!gl.getProgramParameter(pr,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(pr));gl.useProgram(pr);
  const buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);const pos=gl.getAttribLocation(pr,'position');gl.enableVertexAttribArray(pos);gl.vertexAttribPointer(pos,2,gl.FLOAT,false,0,0);
  for(let i=0;i<inputs.length;i++){const img=new Image();img.src=inputs[i];await img.decode();const tex=gl.createTexture();gl.activeTexture(gl.TEXTURE0+i);gl.bindTexture(gl.TEXTURE_2D,tex);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,true);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,img);gl.uniform1i(gl.getUniformLocation(pr,i?'uDetail':'uBase'),i);}
  gl.viewport(0,0,3840,2160);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.drawArrays(gl.TRIANGLES,0,6);if(gl.getError()!==gl.NO_ERROR)throw Error('GL bake error');
  const png=c.toDataURL('image/png').split(',')[1];gl.getExtension('WEBGL_lose_context')?.loseContext();return png;
 },{fragment,inputs});
 const png=Buffer.from(result,'base64');const work=path.join(root,'work/aurora-4k-master');fs.mkdirSync(work,{recursive:true});fs.writeFileSync(path.join(work,'aurora-master-4k.png'),png);
 // Uniformly derived alternatives preserve the same fine structure and placement.
 for(const width of [3840,1920,960]){const file=path.join(assets,`aurora-master-${width}.webp`);await sharp(png).resize({width}).webp({quality:90,alphaQuality:95,effort:5}).toFile(file);console.log(JSON.stringify({file,...await sharp(file).metadata(),bytes:fs.statSync(file).size}));}
}finally{await b.close()}})().catch(e=>{console.error(e);process.exit(1)});
