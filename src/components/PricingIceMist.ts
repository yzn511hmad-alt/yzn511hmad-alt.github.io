import { onFrame } from '../core/FrameLoop';
import { QualityTier } from '../core/QualityTier';

const veilUrl = '/assets/pricing/ice-veil.webp';
const wakeLifetime = 2.1;
const maxWake = 32;

interface WakePoint { x: number; y: number; born: number }

export async function mountPricingIceMist(mist: HTMLElement, signal: AbortSignal): Promise<void> {
  const journey = mist.parentElement;
  if (!journey) return;
  const interactive = matchMedia('(any-hover: hover) and (any-pointer: fine) and (prefers-reduced-motion: no-preference) and (forced-colors: none)');
  const image = new Image();
  image.src = veilUrl;
  await image.decode();
  if (signal.aborted) return;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const brush = document.createElement('canvas');
  brush.width = brush.height = 256;
  const ink = brush.getContext('2d');
  if (!ctx || !ink) return;

  // A clear center with a feathered rim, cached once and reused by the wake.
  const feather = ink.createRadialGradient(128, 128, 0, 128, 128, 127);
  feather.addColorStop(0, '#000');
  feather.addColorStop(.71, '#000');
  feather.addColorStop(.81, '#000e');
  feather.addColorStop(.91, '#0007');
  feather.addColorStop(1, '#0000');
  ink.fillStyle = feather;
  ink.fillRect(0, 0, 256, 256);
  canvas.className = 'pricing-ice-mist-canvas';
  mist.append(canvas);

  // Local aliases keep the checked contexts narrowed inside nested callbacks.
  const surface = ctx;
  const wake: WakePoint[] = Array.from({ length: maxWake }, () => ({ x: 0, y: 0, born: -Infinity }));
  let width = 1, height = 1, radius = 112;
  let imageX = 0, imageY = 0, imageW = 0, imageH = 0;
  let x = 0, y = 0, targetX = 0, targetY = 0, lastX = 0, lastY = 0;
  let alpha = 0, stretch = 1, angle = 0, time = 0, pending = 0, nextWake = 0;
  let hovered = false, visible = false, needsSize = true;
  let stopFrame: (() => void) | undefined;
  let lastFrameTime: number | undefined;

  function stop() {
    stopFrame?.();
    stopFrame = undefined;
    pending = 0;
    lastFrameTime = undefined;
  }

  function reset() {
    stop();
    hovered = false;
    alpha = 0;
    stretch = 1;
    for (const point of wake) point.born = -Infinity;
    delete mist.dataset.veilActive;
  }

  function resize() {
    reset();
    needsSize = true;
  }

  function measure() {
    needsSize = false;
    width = mist.clientWidth || 1;
    height = mist.clientHeight || 1;
    const dpr = Math.min(QualityTier.getBackgroundDPR(), Math.sqrt(1_800_000 / (width * height)));
    canvas.width = Math.max(1, Math.round(width * dpr));
    canvas.height = Math.max(1, Math.round(height * dpr));
    surface.setTransform(canvas.width / width, 0, 0, canvas.height / height, 0, 0);
    radius = Math.max(45, Math.min(84, width * .062));
    const cover = Math.max(width / image.naturalWidth, height / image.naturalHeight);
    imageW = image.naturalWidth * cover;
    imageH = image.naturalHeight * cover;
    imageX = (width - imageW) * .57;
    imageY = (height - imageH) * .5;
  }

  function draw() {
    surface.clearRect(0, 0, width, height);
    surface.drawImage(image, imageX, imageY, imageW, imageH);
    surface.globalCompositeOperation = 'destination-out';
    for (const point of wake) {
      const life = 1 - (time - point.born) / wakeLifetime;
      if (life <= 0) continue;
      const size = radius * (.58 + .27 * life);
      surface.globalAlpha = .4 * life * life * (3 - 2 * life);
      surface.drawImage(brush, point.x - size, point.y - size, size * 2, size * 2);
    }
    if (alpha > 0) {
      surface.save();
      surface.translate(x, y);
      surface.rotate(angle);
      surface.scale(stretch, 1 / Math.sqrt(stretch));
      surface.globalAlpha = alpha;
      surface.drawImage(brush, -radius, -radius, radius * 2, radius * 2);
      surface.restore();
    }
    surface.globalAlpha = 1;
    surface.globalCompositeOperation = 'source-over';
    if (mist.dataset.veilActive === undefined) mist.dataset.veilActive = '';
  }

  function frame(now: number, delta: number) {
    pending += delta;
    if (pending < QualityTier.getFrameInterval() * .82) return;
    // The shared loop caps delta for simulations. Use elapsed ticker time so
    // slow frames cannot make the veil keep rendering well past its fade.
    const dt = pending;
    const elapsed = lastFrameTime === undefined ? dt : now - lastFrameTime;
    lastFrameTime = now;
    pending = 0;
    time = now;
    const dx = targetX - x, dy = targetY - y;
    const distance = Math.hypot(dx, dy);
    const follow = 1 - Math.exp(-15 * dt);
    if (distance > 1) angle = Math.atan2(dy, dx);
    const wantedStretch = 1 + Math.min(.46, distance / (radius * 2.5));
    stretch += (wantedStretch - stretch) * (1 - Math.exp(-12 * dt));
    x += dx * follow;
    y += dy * follow;
    const travelX = x - lastX, travelY = y - lastY;
    const travel = Math.hypot(travelX, travelY);
    if (hovered && travel > radius * .27) {
      // Fill gaps on quick sweeps so the slower fade reads as one soft wake.
      const samples = Math.min(8, Math.ceil(travel / (radius * .38)));
      for (let i = 0; i < samples; i++) {
        const point = wake[nextWake];
        point.x = lastX + travelX * (i / samples);
        point.y = lastY + travelY * (i / samples);
        point.born = time;
        nextWake = (nextWake + 1) % maxWake;
      }
      lastX = x;
      lastY = y;
    }
    const targetAlpha = hovered ? 1 : 0;
    alpha += (targetAlpha - alpha) * (1 - Math.exp(-(hovered ? 22 : 2.5) * elapsed));
    const still = distance < .5 && Math.abs(stretch - 1) < .006 && Math.abs(alpha - targetAlpha) < .006;
    if (still) {
      x = targetX;
      y = targetY;
      stretch = 1;
      alpha = targetAlpha;
    }
    const refilling = wake.some(point => time - point.born < wakeLifetime);
    if (still && !refilling) {
      if (!hovered) { reset(); return; }
      stop();
    }
    draw();
  }

  journey.addEventListener('pointermove', event => {
    if (!interactive.matches || !visible || document.hidden || event.pointerType !== 'mouse' || surface.isContextLost?.()) return;
    if (needsSize) measure();
    targetX = event.clientX;
    targetY = event.clientY;
    if (!hovered && alpha === 0) {
      x = lastX = targetX;
      y = lastY = targetY;
    }
    hovered = true;
    stopFrame ??= onFrame(frame);
  }, { passive: true, signal });
  journey.addEventListener('pointerleave', () => {
    if (!hovered) return;
    hovered = false;
    targetX = x;
    targetY = y;
    stopFrame ??= onFrame(frame);
  }, { signal });
  window.addEventListener('blur', reset, { signal });
  window.addEventListener('resize', resize, { signal });
  document.addEventListener('visibilitychange', reset, { signal });
  interactive.addEventListener('change', reset, { signal });
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (!visible) reset();
  });
  observer.observe(journey);
  canvas.addEventListener('contextlost', reset, { signal });
  canvas.addEventListener('contextrestored', resize, { signal });
  signal.addEventListener('abort', () => {
    reset();
    observer.disconnect();
    canvas.remove();
  }, { once: true });
}
