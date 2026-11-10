import '../styles/tokens.css';
import '../styles/base.css';
import '../styles/sections.css';
import '../styles/themes.css';
import '../styles/pages.css';
import '../styles/contact-desk.css';
import '../styles/polar-night.css';
import '../styles/reference-colors.css';
import '../styles/contact-polish.css';
import '../styles/contact-support.css';
import { ThemeManager } from '../core/ThemeManager';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initCloudDrift } from '../components/CloudDrift';

gsap.registerPlugin(ScrollTrigger);

function initContact() {
  const destroyClouds = initCloudDrift();
  new ThemeManager();
  const motion = gsap.matchMedia();
  motion.add('(prefers-reduced-motion: no-preference)', () => {
    const context = gsap.context(() => {
      gsap.from('.support-eyebrow, #support-title, .support-hero > p:last-child', {
        opacity: 0, y: 18, duration: .9, stagger: .09, ease: 'power3.out',
        clearProps: 'transform,opacity',
      });
      document.querySelectorAll<HTMLElement>('.support-email, .support-community-copy, .support-beacon, .support-steps, .support-faq').forEach(element => {
        gsap.from(element, {
          opacity: 0, y: element.classList.contains('support-beacon') ? 0 : 22, duration: .85, ease: 'power3.out',
          clearProps: 'transform,opacity',
          scrollTrigger: {trigger: element, start: 'top 95%', once: true},
        });
      });
    }, document.getElementById('main-content')!);
    return () => context.revert();
  });
  const events = new AbortController(), { signal } = events;
  const header = document.getElementById('site-header');
  const onScroll = () => header?.classList.toggle('scrolled', scrollY > 40);
  window.addEventListener('scroll', onScroll, {passive:true, signal}); onScroll();
  const button = document.querySelector<HTMLButtonElement>('.mobile-menu-toggle');
  const menu = document.getElementById('contact-mobile-menu');
  if(button) button.hidden = false;
  const close = (focus=false) => {if(!menu || !button)return;menu.hidden=true;button.setAttribute('aria-expanded','false');if(focus)button.focus();};
  button?.addEventListener('click',()=>{if(!menu)return;menu.hidden=!menu.hidden;button.setAttribute('aria-expanded',String(!menu.hidden));},{signal});
  document.addEventListener('keydown',e=>{if(e.key==='Escape' && menu && !menu.hidden)close(true);},{signal});
  document.addEventListener('click',e=>{const target=e.target as Node;if(menu&&!menu.hidden&&!menu.contains(target)&&!button?.contains(target))close();},{signal});
  menu?.addEventListener('click',e=>{if((e.target as Element).closest('a'))close();},{signal});
  matchMedia('(min-width:961px)').addEventListener('change',e=>{if(e.matches)close();},{signal});
  const cleanup = () => { destroyClouds(); motion.revert(); events.abort(); };
  window.addEventListener('pagehide',e=>{if(!e.persisted)cleanup();},{signal});
  if(import.meta.hot)import.meta.hot.dispose(cleanup);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initContact,{once:true});else initContact();
