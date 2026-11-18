// Entry point for kit-style.html — bundled by esbuild into dist/kit.js (IIFE)
// so the page runs straight from disk. Shares the motion setup and the
// generic reveals with the main page.
import { gsap, ScrollTrigger, lenis, reduce, EASE_OUT } from './lib/motion.js';
import { initReveals } from './components/reveals.js';
import { initCursor } from './components/cursor.js';
import { initFitMarks } from './components/fit-marks.js';
import { initAccordion } from './components/accordion.js';

// Nav: hide on scroll down, show on scroll up, dark ink over lime panels.
function initNav() {
  const nav = document.querySelector('[data-nav]');
  let last = 0;
  const onScroll = (y) => { nav.classList.toggle('is-hidden', y > last && y > 120); last = y; };
  if (lenis) lenis.on('scroll', ({ scroll }) => onScroll(scroll));
  else window.addEventListener('scroll', () => onScroll(window.scrollY), { passive: true });

  document.querySelectorAll('[data-nav-light]').forEach((section) => {
    ScrollTrigger.create({ trigger: section, start: 'top 28px', end: 'bottom 28px', onToggle: (s) => nav.classList.toggle('is-light', s.isActive) });
  });

  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    const hash = link.getAttribute('href');
    const target = hash === '#top' ? 0 : hash.length > 1 && document.querySelector(hash);
    if (target === null || target === false) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(target, { duration: 1.4 });
    else window.scrollTo({ top: target === 0 ? 0 : target.getBoundingClientRect().top + window.scrollY, behavior: 'smooth' });
  });
}

// Select clients: hovering (or focusing) a name wipes its image into the stage.
function initClients() {
  const list = document.querySelector('[data-clients]');
  const stage = document.querySelector('[data-clients-stage]');
  if (!list || !stage) return;
  const first = stage.querySelector('img');
  const cache = new Map([[first.getAttribute('src'), first]]);
  let current = first;

  const show = (src) => {
    let img = cache.get(src);
    if (!img) {
      img = document.createElement('img');
      img.src = src;
      img.alt = '';
      img.className = 'kit-client-img';
      stage.appendChild(img);
      cache.set(src, img);
    }
    if (img === current) return;
    stage.appendChild(img); // newest on top so it wipes over the last
    requestAnimationFrame(() => img.classList.add('is-active'));
    const prev = current;
    current = img;
    setTimeout(() => prev !== current && prev.classList.remove('is-active'), 900);
  };

  list.querySelectorAll('a').forEach((a) => {
    a.addEventListener('pointerenter', () => show(a.dataset.img));
    a.addEventListener('focus', () => show(a.dataset.img));
  });
}

// Intro: both halves of the hero wordmark rise out of their masks, then the
// stacked service words rise as they scroll in.
function initMarks() {
  if (reduce) return;
  const hero = document.querySelectorAll('#top .kit-mask > span');
  gsap.fromTo(hero, { yPercent: 105, autoAlpha: 1 }, { yPercent: 0, duration: 1.4, stagger: 0.14, ease: EASE_OUT, delay: 0.15 });

  const rest = gsap.utils.toArray('.kit-mask > span').filter((s) => !s.closest('#top'));
  rest.forEach((span) => {
    gsap.fromTo(span, { yPercent: 105, autoAlpha: 1 }, {
      yPercent: 0,
      duration: 1.2,
      ease: EASE_OUT,
      scrollTrigger: { trigger: span.parentElement, start: 'top 92%', once: true },
    });
  });
}

// Full-bleed images drift slower than the page; collage tiles unveil once.
function initImages() {
  if (reduce) return;
  gsap.utils.toArray('[data-parallax-img]').forEach((img) => {
    gsap.fromTo(img, { yPercent: -10 }, {
      yPercent: 0,
      ease: 'none',
      scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
    });
  });
  gsap.utils.toArray('.kit-tile').forEach((tile) => {
    gsap.from(tile, {
      clipPath: 'inset(0 0 100% 0)',
      duration: 1.3,
      ease: 'power4.inOut',
      scrollTrigger: { trigger: tile, start: 'top 88%', once: true },
    });
  });
  // Service rows and logo cells stagger in as their sections arrive.
  [['.kit-acc', '.kit-accordion'], ['.kit-logo', '.kit-logos']].forEach(([items, trigger]) => {
    if (!document.querySelector(trigger)) return;
    gsap.from(items, {
      opacity: 0,
      y: 12,
      duration: 0.8,
      stagger: 0.04,
      ease: EASE_OUT,
      scrollTrigger: { trigger, start: 'top 85%', once: true },
    });
  });
}

initNav();
initCursor();
initClients();
initAccordion();
document.fonts.ready.then(() => {
  initFitMarks();
  initMarks();
  initImages();
  initReveals();
});
