import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';

// Enlargements of the actual card's chip, contactless mark, etched curves and
// serial typography. Inline vectors, no image requests, filters or render loop.
export function createPricingEngravings(){
  gsap.registerPlugin(ScrollTrigger);
  const chip='<rect x="280" y="190" width="700" height="540" rx="88"/><path d="M280 370H980M280 550H980M510 190V730M750 190V730M510 280H750M510 640H750"/>';
  const contact='<path d="M410 90C850 260 850 640 410 810M540 15C1095 230 1095 670 540 885M670-60C1340 200 1340 700 670 960"/>';
  const etch=Array.from({length:6},(_,i)=>`<path d="M${600+i*48} -180C${130+i*48} 40 ${145+i*48} 540 ${680+i*48} 1060"/>`).join('');
  const serial='<path d="M110 170H1150M110 220H1150M110 660H1150M110 710H1150"/><text x="180" y="585" font-family="monospace" font-size="290" letter-spacing="-24">2026</text><path stroke-dasharray="4 28" stroke-linecap="round" stroke-width="9" d="M180 300H1000"/>';
  const frame='<path d="M1080 50H340Q240 50 240 150V970M1000 92H366Q282 92 282 176V970"/><path d="M180 170H300M240 110V230M880 710H1000M940 650V770"/>';
  const artwork=[chip,contact,etch,serial,frame,
    `<g data-engraving-part="frame"><rect x="290" y="30" width="570" height="850" rx="43"/><rect x="310" y="50" width="530" height="810" rx="30"/></g><g data-engraving-part="chip" transform="translate(300 200) scale(.18)">${chip}</g><g data-engraving-part="print"><path d="M355 650H745M355 686H595M355 777H510"/><text x="355" y="610" font-family="monospace" font-size="72">2026</text></g>`,etch,serial,contact,chip];
  const sections=[...document.querySelectorAll<HTMLElement>('.pricing-journey>section')];
  const layers=sections.map((section,index)=>{
    const layer=document.createElement('div');layer.className=`engraving-layer engraving-layer--${index+1}`;
    layer.setAttribute('aria-hidden','true');
    layer.innerHTML=`<svg class="engraving-fragment" viewBox="0 0 1100 900" fill="none" xmlns="http://www.w3.org/2000/svg"><g class="engraving-cut">${artwork[index%artwork.length]}</g></svg>`;
    section.prepend(layer);return layer;
  });
  const media=gsap.matchMedia();
  media.add('(prefers-reduced-motion: no-preference)',()=>{
    layers.forEach((layer,index)=>{
      const svg=layer.querySelector('svg')!;
      gsap.fromTo(svg,{yPercent:5},{yPercent:-7,ease:'none',scrollTrigger:{trigger:sections[index],start:'top bottom',end:'bottom top',scrub:.8}});
    });
    const assembly=layers[5];
    if(assembly){
      const timeline=gsap.timeline({scrollTrigger:{trigger:'.plans-intro',start:'top 90%',end:'top 15%',scrub:.8}});
      timeline.from(assembly.querySelector('[data-engraving-part="chip"]'),{x:-220,y:-110,opacity:.12,ease:'power1.out'},0)
        .from(assembly.querySelector('[data-engraving-part="print"]'),{x:230,y:150,opacity:.12,ease:'power1.out'},0)
        .from(assembly.querySelector('[data-engraving-part="frame"]'),{scale:1.15,transformOrigin:'50% 50%',opacity:.1,ease:'power1.out'},0);
    }
  });
  return ()=>{media.revert();layers.forEach(layer=>layer.remove());};
}
