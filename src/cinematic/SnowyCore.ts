import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const DRAW_AT = 16;
const NODE_AT = 23;
const STAGGER = 9;
const NODE_DURATION = 5;

/** A reversible assembly timeline, synchronized with the existing cinematic pin. */
export class SnowyCore {
  private timeline?: gsap.core.Timeline;
  private observer: ResizeObserver;
  private visibilityObserver: IntersectionObserver;
  private inView = true;
  private paths: SVGPathElement[];
  private packets: SVGPathElement[];
  private ports: SVGCircleElement[];
  private nodes: HTMLElement[];
  private statuses: HTMLElement[];
  private segments: HTMLElement[];
  private stage: HTMLElement;
  private count: HTMLElement;
  private charge: SVGCircleElement;
  private reactorState: HTMLElement;
  private phaseLabel: HTMLElement;
  private phaseCopy: HTMLElement;
  private scrollLabel: HTMLElement;
  private events = new AbortController();

  constructor(private root: HTMLElement, journey?: ScrollTrigger) {
    this.stage = root.querySelector('.core-assembly')!;
    this.paths = [...root.querySelectorAll<SVGPathElement>('.core-connection')];
    this.packets = [...root.querySelectorAll<SVGPathElement>('.core-packet')];
    this.ports = [...root.querySelectorAll<SVGCircleElement>('.core-port')];
    this.nodes = [...root.querySelectorAll<HTMLElement>('.core-node')];
    this.statuses = this.nodes.map(node => node.querySelector<HTMLElement>('.node-status')!);
    this.segments = [...root.querySelectorAll<HTMLElement>('.core-segments i')];
    this.count = root.querySelector('.core-link-count')!;
    this.charge = root.querySelector('.core-charge')!;
    this.reactorState = root.querySelector('.core-reactor-state')!;
    this.phaseLabel = root.querySelector('.core-phase-label')!;
    this.phaseCopy = root.querySelector('.core-phase-copy')!;
    this.scrollLabel = root.querySelector('.core-scroll-label')!;
    this.visibilityObserver = new IntersectionObserver(([entry]) => {
      this.inView = entry.isIntersecting;
      this.syncMetrics();
    });
    this.visibilityObserver.observe(root);
    this.measure();
    this.observer = new ResizeObserver(() => this.measure());
    this.observer.observe(this.stage);
    this.nodes.forEach(node => this.observer.observe(node));
    document.addEventListener('visibilitychange', () => this.syncMetrics(), {signal:this.events.signal});

    if (!journey) {
      gsap.set(this.nodes, {autoAlpha:1, scale:1});
      gsap.set(this.paths, {strokeDashoffset:0});
      this.syncMetrics();
      return;
    }

    const tl = this.timeline = gsap.timeline({
      defaults: {ease:'none'},
      onUpdate: () => this.syncMetrics(),
      scrollTrigger: {
        id:'snowy-core-assembly', trigger:root.parentElement!,
        start:() => journey.start + (journey.end - journey.start) * 96 / 150,
        end:() => journey.end, scrub:1.2, invalidateOnRefresh:true,
        onRefresh:() => this.syncMetrics(),
      },
    });
    const chrome = root.querySelectorAll('.core-heading,.core-topline,.core-caption,.core-narrative');
    tl.fromTo(chrome, {autoAlpha:0,y:10}, {autoAlpha:1,y:0,duration:8}, 2);
    tl.fromTo(root.querySelector('.core-reactor'), {autoAlpha:0,scale:.45,rotation:-24}, {autoAlpha:1,scale:1,rotation:0,duration:13,ease:'power2.out'}, 1);
    tl.fromTo(root.querySelector('.core-field'), {autoAlpha:0,scale:.6}, {autoAlpha:1,scale:1,duration:15}, 1);
    tl.fromTo(root.querySelector('.core-emblem-label'), {autoAlpha:0}, {autoAlpha:1,duration:5}, 8);
    this.paths.forEach((path, i) => {
      tl.fromTo(path, {strokeDashoffset:1}, {strokeDashoffset:0,duration:8}, DRAW_AT + i * STAGGER);
      tl.fromTo(this.nodes[i], {autoAlpha:0,y:14,scale:.95}, {autoAlpha:1,y:0,scale:1,duration:NODE_DURATION,ease:'power2.out'}, NODE_AT + i * STAGGER);
    });
    // Hold the assembled reactor through pin release; both sections then scroll
    // together in document flow instead of collapsing or cross-fading.
    tl.set({}, {}, 100);
    this.syncMetrics();
  }

  private syncMetrics() {
    const time = this.timeline?.time() ?? 75;
    let connected = 0;
    let total = 0;
    this.nodes.forEach((node,i) => {
      const progress = Math.max(0,Math.min(1,(time - NODE_AT - i * STAGGER) / NODE_DURATION));
      const percent = Math.round(progress * 100);
      const online = progress === 1;
      if (online) connected++;
      total += progress;
      const text = online ? 'CONNECTED / 100%' : `LINK ${percent}%`;
      if (this.statuses[i].textContent !== text) this.statuses[i].textContent = text;
      node.style.setProperty('--link', String(progress));
      for (const element of [this.packets[i],this.ports[i],this.segments[i]]) {
        const state = String(online);
        if (element.dataset.connected !== state) element.dataset.connected = state;
      }
    });
    const text = `${String(connected).padStart(2,'0')} / 05 MODULES ONLINE`;
    if (this.count.textContent !== text) this.count.textContent = text;
    this.charge.style.strokeDashoffset = String(100 - total * 20);
    this.root.classList.toggle('is-active', !!this.timeline && time > 0 && this.inView && !document.hidden);
    const state = connected === 5 ? 'ALL SYSTEMS SYNCHRONIZED' : time < DRAW_AT ? 'INITIALIZING REACTOR' : 'ESTABLISHING CONNECTIONS';
    if (this.reactorState.textContent !== state) this.reactorState.textContent = state;
    const label = connected === 5 ? '03 / SYNCHRONIZED' : time < DRAW_AT ? '01 / INITIALIZE' : '02 / CONNECT';
    const copy = connected === 5 ? 'Five systems. One intelligence.' : time < DRAW_AT ? 'Everything begins at the core.' : 'Building your connected system.';
    if (this.phaseLabel.textContent !== label) this.phaseLabel.textContent = label;
    if (this.phaseCopy.textContent !== copy) this.phaseCopy.textContent = copy;
    this.scrollLabel.textContent = this.timeline ? connected === 5 ? 'SCROLL TO CONTINUE ↓' : 'SCROLL TO ASSEMBLE ↓' : 'ASSEMBLY COMPLETE';
  }

  private measure() {
    // CSS-pixel SVG coordinates keep normalized dashes aligned with pod edges.
    const {width:w,height:h} = this.stage.getBoundingClientRect();
    if (!w || !h) return;
    this.root.querySelector('.core-wires')!.setAttribute('viewBox', `0 0 ${w} ${h}`);
    this.paths.forEach((path,i) => {
      const node = this.nodes[i];
      const x = i === 4 ? w / 2 : node.offsetLeft + (i % 2 === 0 ? node.offsetWidth : 0);
      const y = node.offsetTop + (i === 4 ? 0 : node.offsetHeight / 2);
      const bend = w * (i % 2 === 0 ? (w < 700 ? .425 : .37) : (w < 700 ? .575 : .63));
      const d = i === 4 ? `M${w/2} ${h/2}V${y}` : w < 700 ? `M${w/2} ${h/2}H${bend}V${y}H${x}` : `M${w/2} ${h/2}L${bend} ${y}H${x}`;
      path.setAttribute('d', d);
      this.packets[i].setAttribute('d', d);
      this.ports[i].setAttribute('cx', String(x));
      this.ports[i].setAttribute('cy', String(y));
    });
  }

  refresh() { this.measure(); this.syncMetrics(); }
  destroy() {
    this.events.abort();
    this.observer.disconnect();
    this.visibilityObserver.disconnect();
    this.timeline?.scrollTrigger?.kill();
    this.timeline?.kill();
    this.root.classList.remove('is-active');
  }
}
