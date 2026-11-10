import { QualityTier } from './QualityTier';

/** Source detail and drawing-buffer quality are independent budgets. */
export function syncAuroraArt(element:HTMLElement):boolean {
  const connection=(navigator as Navigator & {connection?:{saveData?:boolean}}).connection;
  const limit=Number(element.dataset.auroraTextureLimit)||4096;
  const width=innerWidth;
  let source=960;
  if(!connection?.saveData){
    if(width>700)source=1920;
    if(!QualityTier.lowPower&&width>1100&&width*1.1*Math.min(devicePixelRatio||1,2)>2400)source=3840;
  }
  if(source>limit)source=limit>=1920?1920:960;
  if(element.dataset.auroraArt===String(source))return false;
  element.style.backgroundImage=`url('/assets/atmosphere/aurora-master-${source}.webp')`;
  element.dataset.auroraArt=String(source);
  return true;
}
