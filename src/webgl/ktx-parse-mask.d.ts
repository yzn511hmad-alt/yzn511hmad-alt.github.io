declare module 'three/examples/jsm/libs/ktx-parse.module.js'{
 export interface MaskKTX2Container{
  vkFormat:number;typeSize:number;pixelWidth:number;pixelHeight:number;pixelDepth:number;layerCount:number;faceCount:number;levelCount:number;supercompressionScheme:number;
  levels:{levelData:Uint8Array;uncompressedByteLength:number}[];
  dataFormatDescriptor:{colorModel:number;colorPrimaries:number;transferFunction:number;flags:number}[];
  keyValue:Record<string,string|Uint8Array>;
 }
 export function read(data:Uint8Array):MaskKTX2Container;
}
