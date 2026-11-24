// Entry point for index.html — the page built from the Figma frame (108:2).
// Bundled by esbuild into dist/home.js (IIFE) so the page runs from disk.
import { gsap, ScrollTrigger, lenis, reduce, EASE_OUT } from './lib/motion.js';
import { initReveals } from './components/reveals.js';
import { initAnchors, initMenu, initPointer, initTransitions, initWorkCursor } from './components/site.js';

// The two wordmarks rise out of their masks: the hero on load, the footer
// one as it scrolls in.
function initMarks() {
  if (reduce) return;
  gsap.fromTo('[data-hero-mark]', { yPercent: 105, autoAlpha: 1 }, { yPercent: 0, duration: 1.4, ease: EASE_OUT, delay: 0.15 });
  gsap.fromTo('[data-home-mark]', { yPercent: 105, autoAlpha: 1 }, {
    yPercent: 0,
    duration: 1.4,
    ease: EASE_OUT,
    scrollTrigger: { trigger: document.querySelector('[data-home-mark]')?.parentElement, start: 'top bottom', once: true },
  });
}

// Phone header logo: hidden while the big hero logo is on screen, shown after.
function initBrand() {
  const brand = document.querySelector('.home-brand.is-hidden');
  const hero = document.querySelector('#top');
  if (!brand || !hero) return;
  ScrollTrigger.create({
    trigger: hero,
    start: 'bottom 40px',
    onEnter: () => brand.classList.remove('is-hidden'),
    onLeaveBack: () => brand.classList.add('is-hidden'),
  });
}

// Banner unveils from the top on load and drifts with the scroll; work
// frames unveil as they enter.
function initImages() {
  // Reduced motion: the header video stays on its poster frame.
  const video = document.querySelector('[data-hero-video]');
  if (reduce && video) { video.removeAttribute('autoplay'); video.pause(); }
  if (reduce) return;
  const banner = document.querySelector('[data-reveal-img]');
  gsap.from(banner, { clipPath: 'inset(0 0 100% 0)', duration: 1.4, ease: 'power4.inOut', delay: 0.35 });
  gsap.fromTo('[data-parallax-img]', { yPercent: 0, scale: 1.12 }, {
    yPercent: 8,
    ease: 'none',
    scrollTrigger: { trigger: banner, start: 'top top', end: 'bottom top', scrub: true },
  });
  gsap.utils.toArray('.home-work-img').forEach((frame) => {
    gsap.from(frame, { clipPath: 'inset(100% 0 0 0)', duration: 1.4, ease: 'power4.inOut', scrollTrigger: { trigger: frame, start: 'top 88%', once: true } });
  });
}

// About title and statement: every word starts at 60% and eases up to 100%, one after another,
// as the paragraph scrolls up (the scrub lags a little so it stays smooth); all of
// them are at full strength once its top reaches the upper third of the screen.
function initWords(el) {
  const words = [];
  Array.from(el.childNodes).forEach((node) => {
    if (node.nodeType !== Node.TEXT_NODE) { words.push(node); return; }
    const frag = document.createDocumentFragment();
    node.textContent.split(/(\s+)/).forEach((part) => {
      if (!part) return;
      if (/^\s+$/.test(part)) { frag.append(' '); return; }
      const span = document.createElement('span');
      span.textContent = part;
      frag.append(span);
      words.push(span);
    });
    node.replaceWith(frag);
  });
  gsap.fromTo(words, { opacity: 0.6 }, {
    opacity: 1,
    stagger: 0.05,
    ease: 'none',
    scrollTrigger: { trigger: el, start: 'top 85%', end: 'top 35%', scrub: 0.8 },
  });
}

// The About title and the statement under it both use it, so the title lights up first.
function initStatement() {
  if (reduce) return;
  document.querySelectorAll('[data-words]').forEach(initWords);
}

// Picture frame that swaps its image. Every picture is fetched and decoded up
// front, so a hover never waits. Each new picture becomes a layer above the
// last and wipes up over it; layers are removed only once the newest has fully
// arrived, so a fast pointer can never leave the frame empty.
function makeSwapper(frame) {
  let img = frame.querySelector('img');
  const ready = new Map();
  const load = (src) => {
    if (!ready.has(src)) {
      const pic = new Image();
      pic.src = src;
      ready.set(src, (pic.decode ? pic.decode() : Promise.resolve()).catch(() => {}));
    }
    return ready.get(src);
  };
  const preload = (scope) => scope.querySelectorAll('[data-img]').forEach((el) => load(el.dataset.img));
  let current = img.getAttribute('src');
  let layer = 1;
  let token = 0;
  const show = async (src) => {
    if (!src || src === current) return;
    current = src;
    const mine = ++token;
    await load(src);
    if (mine !== token) return;
    const next = document.createElement('img');
    next.className = img.className;
    next.alt = '';
    next.src = src;
    next.style.zIndex = String(++layer);
    frame.append(next);
    img = next;
    const settle = () => frame.querySelectorAll('img').forEach((el) => el !== img && el.remove());
    if (reduce) { settle(); return; }
    gsap.fromTo(next, { clipPath: 'inset(100% 0 0 0)', scale: 1.15 }, {
      clipPath: 'inset(0% 0 0 0)',
      scale: 1,
      duration: 0.7,
      ease: 'power4.out',
      onComplete: () => { if (next === img) { gsap.set(next, { clearProps: 'clipPath' }); settle(); } },
    });
  };
  return { show, preload };
}

// Services: one open at a time. The open title turns bold and its list
// slides open. Hovering a title fades it from grey to black, wipes the side
// image to that service's picture and moves the picture level with the row.
function initServices() {
  const list = document.querySelector('[data-services]');
  if (!list) return;
  const items = Array.from(list.querySelectorAll('[data-svc]'));
  const frame = document.querySelector('.home-svc-img');
  const desktop = window.matchMedia('(min-width: 768px) and (pointer: fine)');

  const swap = makeSwapper(frame);
  swap.preload(list);
  const show = swap.show;

  // The picture follows the service you point at (or the open one when the
  // pointer is away): its centre glides to that row's centre, kept inside the
  // list's own height. It re-aims every frame while rows open and close.
  const follow = reduce ? null : gsap.quickTo(frame, 'y', { duration: 0.9, ease: 'power3.out' });
  let hovered = null;
  let tracking = 0;
  const aim = () => {
    if (!follow) return;
    if (!desktop.matches) { follow(0); return; }
    const target = hovered || openItem();
    if (!target) return;
    const listBox = list.getBoundingClientRect();
    const rowBox = target.getBoundingClientRect();
    const rest = frame.offsetTop + frame.offsetHeight / 2;
    const hostTop = frame.offsetParent.getBoundingClientRect().top;
    const centre = rowBox.top + rowBox.height / 2 - hostTop;
    const min = listBox.top - hostTop + frame.offsetHeight / 2;
    const max = listBox.bottom - hostTop - frame.offsetHeight / 2;
    follow(Math.min(Math.max(centre, min), Math.max(min, max)) - rest);
  };
  const track = (ms = 1200) => { tracking = performance.now() + ms; };
  gsap.ticker.add(() => { if (performance.now() < tracking) aim(); });
  window.addEventListener('resize', aim);

  const openItem = () => items.find((item) => item.classList.contains('is-open'));

  const set = (item, open) => {
    item.classList.toggle('is-open', open);
    item.querySelector('[data-svc-trigger]').setAttribute('aria-expanded', String(open));
    gsap.to(item.querySelector('[data-svc-panel]'), {
      height: open ? 'auto' : 0,
      duration: reduce ? 0 : 0.7,
      ease: 'power4.inOut',
      onComplete: () => ScrollTrigger.refresh(),
    });
  };

  items.forEach((item) => {
    const trigger = item.querySelector('[data-svc-trigger]');
    trigger.addEventListener('mouseenter', () => { hovered = item; show(item.dataset.img); track(); });
    trigger.addEventListener('focus', () => show(item.dataset.img));
    trigger.addEventListener('click', () => {
      show(item.dataset.img);
      if (item.classList.contains('is-open')) return;
      items.forEach((other) => other.classList.contains('is-open') && set(other, false));
      set(item, true);
      track();
    });
  });

  // Each item inside a service has its own picture too.
  list.querySelectorAll('[data-svc-panel] li[data-img]').forEach((li) => {
    li.addEventListener('mouseenter', () => { hovered = li.closest('[data-svc]'); show(li.dataset.img); track(); });
  });

  // Leaving the list returns the image to the open service.
  list.addEventListener('mouseleave', () => {
    const open = openItem();
    if (open) show(open.dataset.img);
    hovered = null;
    track();
  });
}

// Framework: the flow plays once, when it scrolls into view.
function initFramework() {
  const flow = document.querySelector('[data-framework]');
  if (!flow) return;
  if (reduce) { flow.classList.add('is-in', 'is-done'); return; }
  ScrollTrigger.create({
    trigger: flow,
    start: 'top 80%',
    once: true,
    onEnter: () => {
      flow.classList.add('is-in');
      setTimeout(() => flow.classList.add('is-done'), 2600);
    },
  });
}

// Clients: the row is cloned once so the marquee can loop without a seam
// (the CSS slides the track by exactly half its width).
function initClients() {
  const track = document.querySelector('[data-clients-track]');
  if (!track || reduce) return;
  Array.from(track.children).forEach((li) => {
    const copy = li.cloneNode(true);
    copy.setAttribute('aria-hidden', 'true');
    copy.querySelector('a')?.setAttribute('tabindex', '-1');
    track.append(copy);
  });
}

// Review only: ?fontpreview on the address adds a switch between the two highlight-word fonts
// (1 = Instrument Sans, 2 = Bricolage Grotesque); ?hl=1 or ?hl=2 sets one without the switch.
function initFontPreview() {
  const params = new URLSearchParams(location.search);
  if (!params.has('fontpreview') && !params.has('hl')) return;
  const root = document.documentElement;
  const apply = (value) => {
    if (value === '1') root.dataset.hl = '1'; else delete root.dataset.hl;
    box?.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.hl === (value === '1' ? '1' : '2'))));
  };
  let box = null;
  if (params.has('fontpreview')) {
    box = document.createElement('div');
    box.className = 'hl-switch';
    box.innerHTML = '<span>Highlight font</span><button type="button" data-hl="1">1 Instrument Sans</button><button type="button" data-hl="2">2 Bricolage</button>';
    box.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) apply(b.dataset.hl); });
    document.body.append(box);
  }
  apply(params.get('hl') === '1' ? '1' : '2');
}

initAnchors();
initFontPreview();
initTransitions();
initMenu();
initServices();
initFramework();
initPointer();
initWorkCursor();
initBrand();
document.fonts.ready.then(() => {
  initMarks();
  initImages();
  initStatement();
  initClients();
  initReveals();
});
