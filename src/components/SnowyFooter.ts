const footer = document.querySelector<HTMLElement>('.snowy-signoff');
const events = new AbortController();
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let visible = false;
const sync = () => { if (footer) footer.dataset.inView = String(visible && !document.hidden); };
const observer = new IntersectionObserver(entries => {
  visible = entries.some(entry => entry.isIntersecting);
  sync();
});
if (footer) {
  observer.observe(footer);
  const current = location.pathname.replace(/\/$/, '/index.html');
  footer.querySelectorAll<HTMLAnchorElement>('.signoff-nav a').forEach(link => {
    if (new URL(link.href).pathname === current) link.setAttribute('aria-current', 'page');
  });
  footer.querySelector('.signoff-backtop')?.addEventListener('click', event => {
    event.preventDefault();
    const top = document.getElementById('app');
    if (top) { top.setAttribute('tabindex', '-1'); top.focus({preventScroll:true}); }
    window.scrollTo({top:0, behavior:reduced.matches ? 'instant' : 'smooth'});
  }, {signal:events.signal});
}
document.addEventListener('visibilitychange', sync, {signal:events.signal});
if (import.meta.hot) import.meta.hot.dispose(() => { observer.disconnect(); events.abort(); });
