import { read } from 'three/examples/jsm/libs/ktx-parse.module.js';
import { ZSTDDecoder } from 'three/examples/jsm/libs/zstddec.module.js';

type Request={url:string};
const scope=globalThis as unknown as {onmessage:((event:MessageEvent<Request>)=>void)|null;postMessage:(value:unknown,transfer?:Transferable[])=>void};

// Only the two checked, one-channel, lossless masks. Never transcode Basis or
// change dimensions/filtering. Transfer the decoded allocation to its owner.
scope.onmessage=async({data})=>{
 try{
  const response=await fetch(data.url);if(!response.ok)throw new Error(`Sky mask request failed: ${response.status}`);
  const container=read(new Uint8Array(await response.arrayBuffer()));
  const {pixelWidth:width,pixelHeight:height}=container,dfd=container.dataFormatDescriptor[0],level=container.levels[0];
  const encodedOrientation=container.keyValue?.KTXorientation;
  const orientation=typeof encodedOrientation==='string'?encodedOrientation:new TextDecoder().decode(encodedOrientation);
  const sizeMatches=(width===1672&&height===941)||(width===941&&height===1672);
  if(!sizeMatches||orientation!=='ru'||container.vkFormat!==9||container.typeSize!==1||container.pixelDepth!==0||container.layerCount!==0||container.faceCount!==1
    ||container.levelCount!==1||container.levels.length!==1||container.supercompressionScheme!==2||!level||level.uncompressedByteLength!==width*height
    ||!dfd||dfd.colorModel!==1||dfd.colorPrimaries!==0||dfd.transferFunction!==1||dfd.flags!==0){throw new Error('Unsupported sky mask KTX2 format');}
  const decoder=new ZSTDDecoder();await decoder.init();const decoded=decoder.decode(level.levelData,width*height);
  if(decoded.byteLength!==width*height)throw new Error('Invalid sky mask texel length');
  const buffer=decoded.byteOffset===0&&decoded.byteLength===decoded.buffer.byteLength?decoded.buffer:decoded.slice().buffer;
  scope.postMessage({type:'complete',width,height,buffer},[buffer]);
 }catch(error){scope.postMessage({type:'error',message:error instanceof Error?error.message:String(error)});}
};
