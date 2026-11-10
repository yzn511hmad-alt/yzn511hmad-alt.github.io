import '../styles/tokens.css';
import '../styles/base.css';
import '../styles/sections.css';
import '../styles/themes.css';
import '../styles/polar-night.css';
import '../styles/reference-colors.css';
import '../styles/melt-key.css';
import gsap from 'gsap';
import { ThemeManager } from '../core/ThemeManager';
import { ScrollManager } from '../core/Scroll';
import { onFrame } from '../core/FrameLoop';
import { QualityTier } from '../core/QualityTier';
import { PASS_LIFETIME_MS } from '../components/VaultState';
import {
  MELT_STORAGE_KEY as BASE_MELT_STORAGE_KEY, MELT_WAIT_MS, prepareMeltRun, beginMeltRun, restoreMeltRun,
  meltSnapshot, collectMeltKey, meltKeyExpired,
  type MeltSnapshot, type MeltPhase,
} from '../components/MeltKeyState';

// Explicit material-trial URLs keep independent runs; the normal page retains
// its existing storage key and reload/timer behaviour.
const materialStudy = new URLSearchParams(location.search).get('ice-study');
const MELT_STORAGE_KEY = materialStudy && /^[1-4]$/.test(materialStudy)
  ? `${BASE_MELT_STORAGE_KEY}:study:${materialStudy}` : BASE_MELT_STORAGE_KEY;

let dispose: (() => void) | undefined;
function boot(): void {
  dispose?.();dispose=undefined;
  new ThemeManager();
  const scroll = new ScrollManager();
  const events = new AbortController(), { signal } = events;
  const root = document.getElementById('key-access')!;
  const trial = new URLSearchParams(location.search).get('geometry-trial');
  const trialLabel = trial === 'compact' ? 'Compact geometry' : 'Current geometry';
  let trialOutput: HTMLOutputElement | undefined;
  if (trial === 'baseline' || trial === 'compact') {
    root.dataset.geometryTrial = trial;
    delete root.dataset.trialSceneMs;
    trialOutput = document.createElement('output');
    trialOutput.className = 'key-geometry-trial';
    trialOutput.textContent = trialLabel + ' · Loading live scene…';
    root.append(trialOutput);
  }
  delete root.dataset.stageFallback;delete root.dataset.meltStage;
  const stageCanvas=root.querySelector<HTMLCanvasElement>('#ice-vault-canvas');
  if(stageCanvas){
    // A disposed renderer deliberately loses its GL context. A genuine remount
    // needs a new canvas instead of asking that lost context to render again.
    if(stageCanvas.dataset.renderMode){const fresh=stageCanvas.cloneNode(false) as HTMLCanvasElement;delete fresh.dataset.renderMode;fresh.hidden=false;stageCanvas.replaceWith(fresh);}
    else stageCanvas.hidden=false;
  }
  root.dataset.scenePresented = 'false';
  root.dataset.effectsPresented = 'false';
  const loadingNote = root.querySelector<HTMLElement>('.ice-loading-note');
  if (loadingNote) loadingNote.hidden = true;
  const action = document.getElementById('ice-vault-action') as HTMLButtonElement;
  action.setAttribute('aria-label', 'Unlock the box with the key');
  const reset = document.getElementById('reset-key-btn') as HTMLButtonElement;
  const lootLink = document.getElementById('lootlabs-link') as HTMLAnchorElement;
  const rewardSurface = root.querySelector<HTMLElement>('.loot-reward-surface')!;
  const result = document.getElementById('key-result')!;
  const rewardSlot = document.getElementById('key-reward-slot')!;
  const stageHost = root.querySelector<HTMLElement>('.ice-scene')!;
  const syncFallbackAnchors = () => {
    if (root.dataset.stageFallback !== 'true') return;
    const hostBox = stageHost.getBoundingClientRect();
    const copyBox = root.querySelector<HTMLElement>('.ice-copy')!.getBoundingClientRect();
    const cardWidth = Math.min(hostBox.width < 700 ? 280 : 320, hostBox.width - 32);
    const minX = hostBox.width >= 900 ? Math.min(hostBox.width - cardWidth / 2 - 16, copyBox.right - hostBox.left + 16 + cardWidth / 2) : 0;
    const minY = hostBox.width >= 700 && hostBox.width < 900 ? Math.min(hostBox.height - 100, copyBox.bottom - hostBox.top + 100) : 0;
    stageHost.style.setProperty('--fallback-reward-min-x', minX + 'px');
    stageHost.style.setProperty('--fallback-reward-min-y', minY + 'px');
  };
  window.addEventListener('resize', syncFallbackAnchors, { passive: true, signal });
  const placeReward = () => { rewardSlot.appendChild(result); };
  placeReward();
  const counter = document.getElementById('key-countdown')!;
  const clockUnit = document.getElementById('key-clock-unit')!;
  const clockLabel = root.querySelector('.ice-clock-label')!;
  const progress = document.getElementById('key-progress') as HTMLProgressElement;
  const title = document.getElementById('key-status-title')!;
  const description = document.getElementById('key-status-description')!;
  const announcement = document.getElementById('key-announcement')!;
  const gesture = document.getElementById('ice-gesture')!;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let saved: string | null = null;
  try { saved = sessionStorage.getItem(MELT_STORAGE_KEY); } catch { /* Storage is optional. */ }
  let run = restoreMeltRun(saved, Date.now(), true);
  let unsubscribe: (() => void) | undefined, disposeStage: (() => void) | undefined;
  let destroyed = false, visible = false;
  let phase: MeltPhase | undefined;
  // Persisted ready state and finite reveal choreography are separate.
  // Automatic collection with a healthy visual stage waits for its event.
  let pendingReveal = false;
  let lastFrame = -Infinity, lastProgress = -Infinity, lastSecond = -1;
  let phaseMotion: gsap.core.Timeline | undefined;
  let deadline: ReturnType<typeof setTimeout> | undefined;
  let expiry: ReturnType<typeof setTimeout> | undefined;

  const say = (text: string) => { announcement.textContent = text; };
  const persist = () => { try { sessionStorage.setItem(MELT_STORAGE_KEY, JSON.stringify(run)); } catch { /* Functional without storage. */ } };
  const stopTimer = () => { unsubscribe?.(); unsubscribe = undefined; };
  const publish = (state = meltSnapshot(run, Date.now())) => {
    root.dispatchEvent(new CustomEvent<MeltSnapshot>('melt-key-state', { detail: state }));
  };
  const renderClock = (state: MeltSnapshot) => {
    const value = state.phase === 'ready' ? (pendingReveal ? '\u2026' : '\u2713') : String(state.remaining).padStart(2, '0');
    const unit = state.phase === 'ready' ? (pendingReveal ? '' : 'OPEN') : 'SEC';
    const label = state.phase === 'waiting' ? 'MELTING' : state.phase === 'available' ? 'KEY READY' : pendingReveal ? 'UNLOCKING' : 'VAULT OPEN';
    if (counter.textContent !== value) counter.textContent = value;
    if (clockUnit.textContent !== unit) clockUnit.textContent = unit;
    if (clockLabel.textContent !== label) clockLabel.textContent = label;
  };
  const updateUI = (state = meltSnapshot(run, Date.now())) => {
    const previous = phase;
    phase = state.phase;
    root.dataset.phase = phase;
    document.dispatchEvent(new CustomEvent('melt-key-poster-state', { detail: phase }));
    root.dataset.remaining = String(state.remaining);
    root.dataset.progress = String(state.progress);
    root.dataset.canAct = String(state.canAct);
    action.hidden = true;
    action.disabled = true;
    root.dataset.rewardPending = String(pendingReveal);
    result.hidden = reset.hidden = phase !== 'ready' || pendingReveal;
    progress.hidden = phase !== 'waiting';
    progress.value = state.progress * 30;
    renderClock(state);
    title.textContent = phase === 'waiting' ? '1. Wait for the ice to melt.' : phase === 'available' ? '2. Your key is ready.' : pendingReveal ? 'Opening the box...' : '3. Your access is ready.';
    description.textContent = phase === 'waiting' ? 'The key will open the box automatically when the ice melts.' : phase === 'available' ? 'The key will unlock the box automatically.' : pendingReveal ? 'Your key is opening the vault. Your access card will arrive here.' : 'Continue through LootLabs and follow the steps to get your free key.';
    gesture.textContent = phase === 'waiting' ? 'Watch the ice melt. The key opens your reward automatically.' : description.textContent;
    if (previous !== phase) {
      phaseMotion?.kill();
      root.dataset.phaseMotion = 'idle';
      gsap.set(rewardSurface, { clearProps: 'opacity,visibility,transform' });
      result.inert=false;
      if (phase === 'available') say('The key is free. The box will open automatically.');
      else if (phase === 'ready') say(pendingReveal ? 'Opening your reward.' : 'The LootLabs gateway is ready. Continue via FlowAuth to get your key.');
    }
    publish(state);
  };
  const finishReveal = (animate = true) => {
    if (destroyed || !pendingReveal || phase !== 'ready') return;
    pendingReveal = false;
    root.dataset.unlocking = 'false';
    updateUI();
    if (animate && !reduced.matches && root.dataset.stageFallback !== 'true') {
      phaseMotion?.kill();
      root.dataset.phaseMotion = 'active';
      const target=result.getBoundingClientRect();
      const origin=(stageHost.dataset.cardOrigin??'').split(',').map(Number);
      const hasOrigin=origin.length===2&&origin.every(Number.isFinite);
      result.inert=true;
      phaseMotion = gsap.timeline({ onComplete: () => { root.dataset.phaseMotion = 'idle';result.inert=false; } })
        .fromTo(rewardSurface, { opacity: .2,transformOrigin:'50% 50%', x:hasOrigin?origin[0]-target.left-target.width/2:0,y:hasOrigin?origin[1]-target.top-target.height/2:22,scale:hasOrigin?.25:.86 }, { opacity: 1, x:0,y:0,scale: 1, duration: 1.1, ease: 'power3.inOut', clearProps: 'opacity,transform,transformOrigin' });
    }
    say('Your box is open. Your LootLabs access card is in the panel.');
  };
  // The stage sends this only after its key, lid and card reach the final pose.
  // Fallback/reduced-motion handlers below complete the native UI immediately.
  root.addEventListener('melt-key-reveal-complete', () => finishReveal(), { signal });
  const scheduleExpiry = () => {
    if (expiry) clearTimeout(expiry);
    const finish = () => {
      if (destroyed || !run.key || run.unlockedAt === null) return;
      const remaining = run.unlockedAt + PASS_LIFETIME_MS - Date.now();
      if (remaining > 0) { expiry = setTimeout(finish, remaining); return; }
      resetPass();
      say('Your previous key has expired. A new cube is melting.');
    };
    if (run.key && run.unlockedAt !== null) expiry = setTimeout(finish, Math.max(0, run.unlockedAt + PASS_LIFETIME_MS - Date.now()));
  };
  const tick = (time = 0) => {
    if (destroyed) return;
    if (meltKeyExpired(run, Date.now())) { resetPass(); say('Your previous key has expired. A new cube is melting.'); return; }
    const state = meltSnapshot(run, Date.now());
    if(state.phase==='available'&&visible&&!document.hidden){
      if(canOpenAutomatically()){
        openAutomatically();return;
      }
    }
    if (state.phase !== phase) {
      updateUI(state);
      if (state.phase !== 'waiting') stopTimer();
    }
    renderClock(state);
    if (state.remaining !== lastSecond) {
      lastSecond = state.remaining;
      root.dataset.remaining = String(state.remaining);
      if (state.phase === 'waiting' && state.remaining > 0 && state.remaining % 10 === 0) say(`${state.remaining} seconds until your key is free.`);
    }
    if (time === 0 || time - lastProgress >= .1 || state.progress === 1) {
      progress.value = state.progress * 30;
      root.dataset.progress = String(state.progress);
      lastProgress = time;
    }
    publish(state);
  };
  const startTimer = () => {
    if (run.pending || unsubscribe || document.hidden || !visible || meltSnapshot(run, Date.now()).phase !== 'waiting') return;
    lastFrame = -Infinity;
    unsubscribe = onFrame(time => {
      const interval = reduced.matches ? .25 : QualityTier.getFrameInterval();
      if (time - lastFrame + .0001 < interval) return;
      lastFrame = time;
      tick(time);
    });
  };
  const scheduleDeadline = () => {
    if (deadline) clearTimeout(deadline);
    if (run.pending) return;
    const finish = () => {
      if (destroyed || run.key) return;
      const remaining = run.startedAt + MELT_WAIT_MS - Date.now();
      if (remaining > 0) { deadline = setTimeout(finish, Math.max(1, remaining)); return; }
      tick();
    };
    if (meltSnapshot(run, Date.now()).phase === 'waiting') deadline = setTimeout(finish, Math.max(1, run.startedAt + MELT_WAIT_MS - Date.now()));
  };
  function startVisibleRun(): void {
    if(destroyed||!run.pending||document.hidden||!visible)return;
    run=beginMeltRun(run,Date.now());lastSecond=-1;lastProgress=lastFrame=-Infinity;
    persist();updateUI();tick();startTimer();scheduleDeadline();
  }
  function resetPass(): void {
    const restoreFocus = document.activeElement === reset;
    stopTimer();
    if (deadline) clearTimeout(deadline);
    if (expiry) clearTimeout(expiry);
    phaseMotion?.kill();
    pendingReveal = false;
    root.dataset.unlocking = 'false';
    run = prepareMeltRun(Date.now());
    lastSecond = -1; lastProgress = lastFrame = -Infinity;
    persist(); updateUI(); tick(); startTimer(); scheduleDeadline();
    startVisibleRun();
    say('A fresh cube. Your 30-second melt has started.');
    // The reset button leaves the DOM's focus order when its card closes.
    if (restoreFocus) { const heading=document.getElementById('ice-title')!; heading.setAttribute('tabindex','-1'); heading.focus({preventScroll:true}); }
  }
  function canOpenAutomatically():boolean {
    return !destroyed&&!document.hidden&&visible&&(root.dataset.scenePresented==='true'||root.dataset.stageFallback==='true');
  }
  function openAutomatically():void {
    if(!canOpenAutomatically())return;
    const next = collectMeltKey(run, Date.now());
    if (next === run) return;
    // Set pending before publishing ready: the stage may synchronously fail
    // and dispatch fallback while updateUI() publishes the new snapshot.
    pendingReveal = !reduced.matches && root.dataset.meltStage === 'ready' && root.dataset.stageFallback !== 'true';
    run = next;
    persist(); updateUI(); stopTimer(); scheduleExpiry();
  }
  reset.addEventListener('click', resetPass, { signal });
  const resume = () => { startVisibleRun();tick(); startTimer(); scheduleDeadline(); scheduleExpiry(); };
  document.addEventListener('visibilitychange', () => { if (document.hidden){stopTimer();phaseMotion?.pause();} else {if(visible)phaseMotion?.resume();resume();} }, { signal });
  window.addEventListener('pageshow', resume, { signal });
  reduced.addEventListener('change', () => {
    if (reduced.matches) {
      phaseMotion?.kill(); root.dataset.phaseMotion = 'idle';
      gsap.set(rewardSurface, { clearProps: 'opacity,visibility,transform' });
      result.inert=false;
      finishReveal(false);
    }
    tick();
  }, { signal });
  const visibility = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting && entry.intersectionRatio >= .2;
    if (visible) { if(!document.hidden)phaseMotion?.resume();startVisibleRun();tick(); startTimer(); } else {stopTimer();phaseMotion?.pause();}
  },{threshold:.2});
  visibility.observe(root);
  const menuButton = document.getElementById('key-menu-toggle') as HTMLButtonElement | null;
  const signIn = document.getElementById('key-sign-in');
  const signInDialog = document.querySelector<HTMLDialogElement>('#key-sign-in-dialog');
  signIn?.addEventListener('click', () => signInDialog?.showModal(), {signal});
  const menu = document.getElementById('key-mobile-menu');
  const closeMenu = (focus = false) => { if (!menu || !menuButton) return; menu.hidden = true; menuButton.setAttribute('aria-expanded', 'false'); if (focus) menuButton.focus(); };
  menuButton?.addEventListener('click', () => { if (!menu) return; const open = menu.hidden; menu.hidden = !open; menuButton.setAttribute('aria-expanded', String(open)); }, { signal });
  menu?.addEventListener('click', event => { if ((event.target as Element).closest('a')) closeMenu(); }, { signal });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && menu && !menu.hidden) closeMenu(true); }, { signal });
  const desktop = matchMedia('(min-width:961px)');
  desktop.addEventListener('change', () => { if (desktop.matches) closeMenu(); }, { signal });
  const header = document.getElementById('site-header');
  const headerScroll = ({ scroll: position }: { scroll: number }) => header?.classList.toggle('scrolled', position > 40);
  scroll.instance.on('scroll', headerScroll);
  headerScroll({ scroll: window.scrollY });
  const fallback = () => {
    if (destroyed) return;
    root.dataset.stageFallback = 'true'; root.dataset.meltStage = 'fallback';
    root.dataset.scenePresented = 'false';
    if (trialOutput && !root.dataset.trialSceneMs) trialOutput.textContent = trialLabel + ' · Live scene unavailable';
    startVisibleRun();
    syncFallbackAnchors();
    document.dispatchEvent(new CustomEvent('melt-key-poster-state', { detail: phase }));
    const canvas = document.getElementById('ice-vault-canvas'); if (canvas) canvas.hidden = true;
    // Context loss or import failure during unlocking must never leave a
    // persisted pass hidden behind an unfinished graphical presentation.
    if (pendingReveal) finishReveal(false); else publish();
  };
  root.addEventListener('melt-key-ready', () => {
    root.dataset.meltStage = 'ready';
    if(trialOutput&&!root.dataset.trialSceneMs){
      const elapsed=Math.round(performance.now());
      root.dataset.trialSceneMs=String(elapsed);
      trialOutput.textContent=trialLabel+' · Live scene '+(elapsed/1000).toFixed(1)+' s';
    }
    startVisibleRun();tick();publish();
  }, { signal });
  root.addEventListener('melt-key-fallback', fallback, { signal });
  persist(); updateUI(); tick(); startTimer(); scheduleDeadline(); scheduleExpiry();
  let stageRequested=false;
  const requestStage=()=>{
    if(stageRequested||destroyed||root.dataset.stageFallback==='true')return;stageRequested=true;nearStage.disconnect();
    import('../components/MeltKeyStage').then(module=>{if(destroyed||!module||root.dataset.stageFallback==='true')return;disposeStage=module.initMeltKeyStage(root);publish();}).catch(fallback);
  };
  const nearStage=new IntersectionObserver(([entry])=>{if(entry.isIntersecting)requestStage();},{rootMargin:'300px 0px'});
  nearStage.observe(root);
  requestStage();
  dispose = () => {
    if (destroyed) return;
    destroyed = true;nearStage.disconnect(); phaseMotion?.kill(); stopTimer(); events.abort(); visibility.disconnect(); disposeStage?.();
    trialOutput?.remove();
    if (deadline) clearTimeout(deadline); if (expiry) clearTimeout(expiry);
    scroll.instance.off('scroll', headerScroll); scroll.destroy();
  };
  window.addEventListener('pagehide', event => { if (!event.persisted) dispose?.(); }, { signal });
}
const bootEvents=new AbortController();
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true,signal:bootEvents.signal });
else boot();
if (import.meta.hot) import.meta.hot.dispose(() => {bootEvents.abort();dispose?.();});
