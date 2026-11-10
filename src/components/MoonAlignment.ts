/** Keep the moon and emblem together inside the reserved illustration space. */
export function alignMoonArtwork(host: HTMLElement) {
  const sky = host.querySelector<HTMLElement>('.polar-layer--sky');
  const art = document.querySelector<HTMLElement>('.support-beacon-art');
  if (!sky || !art) return {update: (_x: number, _y: number) => {}, destroy: () => {}};
  let disposed = false, dx = 0, dy = 0, originX = 0, originY = 0;
  const portrait = matchMedia('(orientation: portrait)');
  const update = (x: number, y: number) => {
    dx = x; dy = y;
    art.style.translate = `${dx.toFixed(3)}px ${dy.toFixed(3)}px`;
    art.dataset.moonX = (originX + dx).toFixed(3);
    art.dataset.moonY = (originY + dy).toFixed(3);
  };
  const measure = () => {
    if (disposed) return;
    const scene = host.getBoundingClientRect(), frame = sky.getBoundingClientRect(), box = art.getBoundingClientRect();
    const [iw, ih, mx, my] = portrait.matches ? [941, 1672, 807.05, 767.91] : [1672, 941, 1396, 400.5];
    originX = box.left - scene.left + box.width / 2 - dx;
    originY = box.top - scene.top + box.height / 2 - dy;
    // Preserve cover and a 16px motion margin while positioning the moon behind
    // the normal-flow emblem. FAQ expansion cannot push the emblem into text.
    const scale = Math.max(frame.width / iw, frame.height / ih,
      (originX + 16) / mx, (scene.width - originX + 16) / (iw - mx),
      (originY + 16) / my, (scene.height - originY + 16) / (ih - my));
    sky.style.backgroundSize = `${iw * scale}px ${ih * scale}px`;
    sky.style.backgroundPosition = `${originX - (frame.left - scene.left - dx) - mx * scale}px ${originY - (frame.top - scene.top - dy) - my * scale}px`;
    const radius = (portrait.matches ? 55.13 : 60.6) * scale;
    art.style.setProperty('--moon-diameter', `${radius * 2}px`);
    art.style.setProperty('--moon-texture', getComputedStyle(sky).backgroundImage);
    art.style.setProperty('--moon-texture-size', `${iw * scale}px ${ih * scale}px`);
    art.style.setProperty('--moon-texture-position', `${radius - mx * scale}px ${radius - my * scale}px`);
    update(dx, dy);
  };
  const observer = new ResizeObserver(measure);
  observer.observe(host); observer.observe(sky); observer.observe(art);
  portrait.addEventListener('change', measure);
  // The sky contains a baked-in moon. Reveal it only after the final font
  // metrics and cover crop agree with the reserved emblem position.
  document.fonts.ready.then(() => {
    if (disposed) return;
    measure();
    host.dataset.moonLayout = 'ready';
    document.documentElement.classList.remove('moon-layout-pending');
  });
  measure();
  return {update, destroy() {
    disposed = true; observer.disconnect(); portrait.removeEventListener('change', measure);
    art.style.removeProperty('translate'); sky.style.removeProperty('background-position'); sky.style.removeProperty('background-size');
    ['--moon-diameter', '--moon-texture', '--moon-texture-size', '--moon-texture-position'].forEach(name => art.style.removeProperty(name));
  }};
}
