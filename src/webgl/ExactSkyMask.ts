import * as THREE from 'three';

type Reply={type:'complete';width:number;height:number;buffer:ArrayBuffer}|{type:'error';message:string};

/** Reversible KTX2/Zstd transport with an R8 GPU image. The source masks are
 * grayscale with opaque alpha, and their only shader consumer reads .r.
 * Original WebP fallback remains the owner's responsibility. Keep returned data
 * for context/reupload compatibility; only the decoder worker is short-lived.
 */
export async function loadSkyMask(url:string,signal?:AbortSignal):Promise<THREE.DataTexture>{
 if(signal?.aborted)throw new Error('Sky mask loading cancelled');
 if(THREE.REVISION!=='186')throw new Error('Sky mask format requires revalidation for this Three revision');
 const result=await new Promise<Extract<Reply,{type:'complete'}>>((resolve,reject)=>{
  let worker:Worker|undefined,settled=false;
  const finish=(error?:Error,value?:Extract<Reply,{type:'complete'}>)=>{
   if(settled)return;settled=true;signal?.removeEventListener('abort',abort);worker?.terminate();
   if(error)reject(error);else resolve(value!);
  };
  const abort=()=>finish(new Error('Sky mask loading cancelled'));
  try{
   worker=new Worker(new URL('./SkyMaskWorker.ts',import.meta.url),{type:'module'});
   worker.onmessage=({data}:MessageEvent<Reply>)=>{
    if(signal?.aborted){abort();return;}
    if(data?.type==='error'){finish(new Error(data.message));return;}
    if(data?.type!=='complete'||!(data.buffer instanceof ArrayBuffer)||!((data.width===1672&&data.height===941)||(data.width===941&&data.height===1672))||data.buffer.byteLength!==data.width*data.height){finish(new Error('Invalid sky mask worker response'));return;}
    finish(undefined,data);
   };
   worker.onerror=event=>{event.preventDefault();finish(new Error(event.message||'Sky mask worker failed'));};
   worker.onmessageerror=()=>finish(new Error('Sky mask worker message failed'));
   signal?.addEventListener('abort',abort,{once:true});if(signal?.aborted){abort();return;}
   worker.postMessage({url:new URL(url,location.href).href});
  }catch(error){finish(error instanceof Error?error:new Error(String(error)));}
 });
 if(signal?.aborted)throw new Error('Sky mask loading cancelled');
 const texture=new THREE.DataTexture(new Uint8Array(result.buffer),result.width,result.height,THREE.RedFormat,THREE.UnsignedByteType);
 texture.colorSpace=THREE.NoColorSpace;texture.minFilter=texture.magFilter=THREE.LinearFilter;
 texture.flipY=false;texture.generateMipmaps=false;texture.unpackAlignment=1;texture.needsUpdate=true;
 texture.name='lossless-r8-sky-mask';return texture;
}
