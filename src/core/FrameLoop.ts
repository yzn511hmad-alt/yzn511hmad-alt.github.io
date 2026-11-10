import gsap from 'gsap';

export type FrameCallback = (time: number, delta: number) => void;
const callbacks = new Set<FrameCallback>();
const tick = (time: number, deltaMs: number) => {
  if (document.hidden) return;
  const delta = Math.min(deltaMs / 1000, 0.05);
  for (const callback of callbacks) callback(time, delta);
};

/** GSAP's ticker is the only application animation clock. Rive owns its runtime clock. */
export function onFrame(callback: FrameCallback): () => void {
  if (!callbacks.size) gsap.ticker.add(tick, false, true);
  callbacks.add(callback);
  return () => {
    callbacks.delete(callback);
    if (!callbacks.size) gsap.ticker.remove(tick);
  };
}
