const events = new AbortController();
const menu = document.querySelector<HTMLButtonElement>('.mobile-menu-toggle');
const nav = document.querySelector<HTMLElement>('#pricing-mobile-menu');
function closeMenu() { menu?.setAttribute('aria-expanded','false'); if(nav) nav.hidden=true; }
menu?.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', String(open)); if(nav) nav.hidden=!open;
}, {signal: events.signal});
document.addEventListener('keydown', e => {if(e.key === 'Escape' && menu?.getAttribute('aria-expanded') === 'true'){ closeMenu(); menu.focus(); }}, {signal: events.signal});
nav?.addEventListener('click', e => {if((e.target as Element).closest('a')) closeMenu();}, {signal: events.signal});
document.querySelector('.signoff-backtop')?.addEventListener('click',()=>{
  const main=document.getElementById('main-content');main?.setAttribute('tabindex','-1');main?.focus({preventScroll:true});
},{signal:events.signal});
if(import.meta.hot) import.meta.hot.dispose(() => events.abort());

const ornaments = new Map<Element, string>();
const openingChapter = document.getElementById('chapter-one');
const lifetimeCard = document.querySelector('html[data-plan-design="carved"] #plans .edition--metal');
if (openingChapter) ornaments.set(openingChapter, 'data-engraving-visible');
if (lifetimeCard) ornaments.set(lifetimeCard, 'data-glint-visible');
const visibleOrnaments = new Set<Element>();
const desktopOrnaments = matchMedia('(min-width: 768px)');
const syncOrnaments = () => {
  for (const [element, attribute] of ornaments) {
    element.toggleAttribute(attribute, desktopOrnaments.matches && visibleOrnaments.has(element) && !document.hidden);
  }
};
const ornamentObserver = new IntersectionObserver(entries => {
  for (const entry of entries) {
    if (entry.isIntersecting) visibleOrnaments.add(entry.target);
    else visibleOrnaments.delete(entry.target);
  }
  syncOrnaments();
});
for (const element of ornaments.keys()) ornamentObserver.observe(element);
document.addEventListener('visibilitychange', syncOrnaments, { signal: events.signal });
desktopOrnaments.addEventListener('change', syncOrnaments, { signal: events.signal });
events.signal.addEventListener('abort', () => {
  ornamentObserver.disconnect();
  for (const [element, attribute] of ornaments) element.removeAttribute(attribute);
}, { once: true });

const header = document.getElementById('site-header');
const syncHeader = () => header?.classList.toggle('scrolled', scrollY > 40);
window.addEventListener('scroll',syncHeader,{passive:true,signal:events.signal});syncHeader();
matchMedia('(min-width:961px)').addEventListener('change',e=>{if(e.matches)closeMenu();},{signal:events.signal});
// The built page preloads this separate scene while the regular page renders.
let disposeJourney: (()=>void)|undefined;
let enhancementCancelled=false;
function showPricingFallback() {
  const root=document.documentElement;
  delete root.dataset.pricingEntrance;
  root.setAttribute('data-pricing-fallback','');
}
const journeyModule=import('../components/PricingJourney').catch(error=>{
  if(!enhancementCancelled){
    showPricingFallback();
    console.warn('Payment artwork unavailable; pricing remains accessible.',error);
  }
  return undefined;
});
requestAnimationFrame(()=>requestAnimationFrame(()=>{
  void journeyModule.then(module=>{
    if(enhancementCancelled||!module)return;
    const host=document.getElementById('payment-stage');
    if(!host)return;
    try{disposeJourney=module.createPricingJourney(host);}
    catch(error){
      showPricingFallback();
      host.dataset.ready='fallback';
      console.warn('Payment artwork unavailable; pricing remains accessible.',error);
    }
  });
}));
if(import.meta.hot)import.meta.hot.dispose(()=>{enhancementCancelled=true;disposeJourney?.();});

