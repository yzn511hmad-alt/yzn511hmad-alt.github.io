/** Measured fire bed in the edited photographic backplates (UV from top-left).
 * scale maps the original flame/stone occlusion into this smaller distant pit. */
export function winterPit(isPortrait:boolean,closeCamp=false,compact?:{x:number;y:number;zoom:number}):{x:number;y:number;scale:number;canonicalY:number;originalBaseY:number;originalHeight:number} {
  if(compact){const source=winterPit(isPortrait);return {...source,x:compact.x,y:compact.y,scale:source.scale*compact.zoom};}
  if(closeCamp)return { x:.577,y:.737,scale:.87,canonicalY:.750,originalBaseY:.798,originalHeight:.180 };
  return isPortrait
    ? { x:.563, y:.646, scale:.64, canonicalY:.664, originalBaseY:.690, originalHeight:.095 }
    : { x:.6105, y:.681, scale:.58, canonicalY:.750, originalBaseY:.798, originalHeight:.180 };
}
