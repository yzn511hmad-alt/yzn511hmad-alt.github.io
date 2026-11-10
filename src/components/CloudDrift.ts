import gsap from 'gsap';

const CLOUD_SPEED = 1.1025;

/** A periodic cloud tile moves independently of the photographed lunar sky. */
export function initCloudDrift() {
  const scene = document.querySelector<HTMLElement>('.support-scene');
  const host = scene?.querySelector<HTMLElement>('.polar-atmosphere');
  if (!scene || !host) return () => {};
  const events = new AbortController(), { signal } = events;
  const reduced = matchMedia('(prefers-reduced-motion: reduce), (update: slow)');
  const layer = document.createElement('div');
  layer.className = 'lunar-clouds'; layer.setAttribute('aria-hidden', 'true');
  layer.innerHTML = '<div class="lunar-cloud-band lunar-cloud-band--far"><div class="lunar-cloud-strip"></div></div><div class="lunar-cloud-band lunar-cloud-band--near"><div class="lunar-cloud-strip"></div></div>';
  host.querySelector('.polar-layer--sky')?.after(layer);
  const layers = [{ element: layer, target: scene }];
  for (const section of scene.querySelectorAll<HTMLElement>('.support-community, .support-faq')) {
    const backdrop = document.createElement('div');
    backdrop.className = 'lunar-clouds lunar-clouds--section';
    backdrop.setAttribute('aria-hidden', 'true');
    backdrop.innerHTML = '<div class="lunar-cloud-band"><div class="lunar-cloud-strip"></div></div>';
    section.prepend(backdrop);
    layers.push({ element: backdrop, target: backdrop });
  }
  const drift = layers.map(({element, target}, index) => {
    const tweens = [...element.querySelectorAll('.lunar-cloud-strip')].map((strip, band) => {
      const duration = index ? 144 + index * 12 : band ? 176 : 132;
      // Half the strip width is exactly one tile.
      const tween = gsap.fromTo(strip, { xPercent: 0 }, {
        xPercent: -50, duration, repeat: -1, ease: 'none', paused: true,
      });
      tween.timeScale(CLOUD_SPEED);
      tween.totalTime(duration * (index ? .22 * index : band ? .61 : .17));
      return tween;
    });
    return {element, target, tweens, visible: false};
  });
  let destroyed = false;
  const sync = () => {
    for (const {element, tweens, visible} of drift) {
      const active = visible && !document.hidden && !reduced.matches;
      element.dataset.motion = active ? 'running' : 'paused';
      tweens.forEach(tween => active ? tween.resume() : tween.pause());
    }
  };
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      const band = drift.find(({target}) => target === entry.target);
      if (band) band.visible = entry.isIntersecting;
    }
    sync();
  });
  drift.forEach(({target}) => observer.observe(target));
  reduced.addEventListener('change', sync, { signal });
  document.addEventListener('visibilitychange', sync, { signal });
  window.addEventListener('pageshow', sync, { signal });
  const destroy = () => {
    if (destroyed) return; destroyed = true;
    observer.disconnect(); events.abort();
    for (const {element, tweens} of drift) {
      tweens.forEach(tween => tween.kill());
      element.remove();
    }
  };
  window.addEventListener('pagehide', event => { if (!event.persisted) destroy(); }, { signal });
  sync(); return destroy;
}
