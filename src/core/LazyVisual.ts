/** Load expensive modules only near their section. Disposal also covers in-flight imports. */
export function lazyVisual(element: HTMLElement, load: () => Promise<(() => void) | void>): () => void {
  let disposed = false;
  let cleanup: (() => void) | void;
  const observer = new IntersectionObserver(entries => {
    if (!entries.some(entry => entry.isIntersecting)) return;
    observer.disconnect();
    element.dataset.visualState = 'loading';
    load().then(result => {
      if (disposed) result?.();
      else { cleanup = result; element.dataset.visualState = 'ready'; }
    }).catch(error => {
      if (disposed) return;
      element.dataset.visualState = 'error';
      console.error('[Snowy] Visual initialization failed.', error);
    });
  }, { rootMargin: '400px 0px' });
  observer.observe(element);
  return () => { disposed = true; observer.disconnect(); cleanup?.(); };
}
