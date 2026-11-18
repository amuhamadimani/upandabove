// Entry point for nothin-style.html — bundled by esbuild into dist/nothin.js
// (IIFE) so the page runs straight from disk.
import { gsap, ScrollTrigger, reduce, EASE_OUT } from './lib/motion.js';
import { initNav } from './components/nav.js';
import { initAccordion } from './components/accordion.js';
import { initReveals } from './components/reveals.js';
import { initCursor } from './components/cursor.js';
import { initFitMarks } from './components/fit-marks.js';
import { initPlus } from './components/plus-scene.js';

// Logo marks: the hero logo rises out of its mask on load; the footer logo
// rises as it scrolls in.
function initWordmarks() {
  if (reduce) return;
  const hero = document.querySelectorAll('#top .kit-mask > span');
  gsap.fromTo(hero, { yPercent: 105, autoAlpha: 1 }, { yPercent: 0, duration: 1.4, ease: EASE_OUT, delay: 0.15 });
  document.querySelectorAll('#contact .kit-mask > span').forEach((span) => {
    gsap.fromTo(span, { yPercent: 105, autoAlpha: 1 }, {
      yPercent: 0,
      duration: 1.4,
      ease: EASE_OUT,
      scrollTrigger: { trigger: span.parentElement, start: 'top 95%', once: true },
    });
  });
  gsap.from('[data-hero-meta]', { opacity: 0, y: 16, duration: 1, stagger: 0.08, delay: 0.5, ease: EASE_OUT });
}

// Collage: the base image unveils, the two insets rise at their own speeds.
function initCollage() {
  const root = document.querySelector('[data-collage]');
  if (!root || reduce) return;
  gsap.from(root.querySelector('[data-collage-img]').parentElement, {
    clipPath: 'inset(0 0 100% 0)',
    duration: 1.4,
    ease: 'power4.inOut',
    scrollTrigger: { trigger: root, start: 'top 85%', once: true },
  });
  root.querySelectorAll('[data-collage-inset]').forEach((inset, i) => {
    gsap.fromTo(inset, { yPercent: 30 + i * 30 }, {
      yPercent: -10 - i * 15,
      ease: 'none',
      scrollTrigger: { trigger: root, start: 'top bottom', end: 'bottom top', scrub: true },
    });
  });
}

// Works and full-bleed images.
function initImages() {
  if (reduce) return;
  gsap.utils.toArray('.noth-work').forEach((tile) => {
    const frame = tile.querySelector('span.block');
    gsap.from(frame, { clipPath: 'inset(100% 0 0 0)', duration: 1.4, ease: 'power4.inOut', scrollTrigger: { trigger: tile, start: 'top 88%', once: true } });
    gsap.from(frame.querySelector('img'), { scale: 1.25, duration: 1.8, ease: EASE_OUT, scrollTrigger: { trigger: tile, start: 'top 88%', once: true } });
  });
  gsap.utils.toArray('[data-parallax-img]').forEach((img) => {
    gsap.fromTo(img, { yPercent: -12 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
  });
}

// The 3D "+" grows in when its section arrives, then turns with the scroll;
// loose letters around it drift at different speeds.
function initObject(plus) {
  const stage = document.querySelector('[data-plus-stage]');
  if (!stage) return;
  if (plus) {
    if (reduce) plus.scale = 1;
    else {
      ScrollTrigger.create({ trigger: stage, start: 'top 80%', once: true, onEnter: () => gsap.to(plus, { scale: 1, duration: 1.8, ease: 'elastic.out(1, 0.6)' }) });
      ScrollTrigger.create({ trigger: stage, start: 'top bottom', end: 'bottom top', scrub: true, onUpdate: (s) => { plus.scroll = s.progress * 2; } });
    }
  }
  if (reduce) return;
  gsap.utils.toArray('[data-float]').forEach((el) => {
    gsap.fromTo(el, { y: 0, rotation: 0 }, {
      y: Number(el.dataset.float) * 2,
      rotation: Number(el.dataset.float) / 3,
      ease: 'none',
      scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
    });
  });
}

// F A Q S: the letters start gathered in the middle and spread to the edges
// as the section scrolls in.
function initSpread() {
  const row = document.querySelector('[data-spread]');
  if (!row || reduce) return;
  const letters = Array.from(row.children);
  gsap.from(letters, {
    x: (i, el) => row.clientWidth / 2 - (el.offsetLeft + el.offsetWidth / 2),
    ease: 'none',
    scrollTrigger: { trigger: row, start: 'top 95%', end: 'top 45%', scrub: true, invalidateOnRefresh: true },
  });
}

initNav();
initCursor();
initAccordion();
const plus = initPlus();
document.fonts.ready.then(() => {
  initWordmarks();
  initFitMarks();
  initCollage();
  initImages();
  initObject(plus);
  initSpread();
  initReveals();
});
