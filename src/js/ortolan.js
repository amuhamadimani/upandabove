// Entry point for ortolan-style.html — bundled by esbuild into dist/ortolan.js
// (IIFE) so the page runs straight from disk.
import { gsap, ScrollTrigger, lenis, reduce, EASE_OUT } from './lib/motion.js';
import { initReveals } from './components/reveals.js';
import { initCursor } from './components/cursor.js';
import { initFitMarks } from './components/fit-marks.js';
import { initAccordion } from './components/accordion.js';

// Nav: the links show over the hero and the contact panel; between them a
// small wordmark takes their place. Ink turns dark over the lime panel.
function initNav() {
  const nav = document.querySelector('[data-nav]');
  const hero = document.querySelector('#top');
  const footer = document.querySelector('#contact');

  const setCompact = (on) => {
    nav.classList.toggle('is-compact', on);
    nav.querySelector('.orto-logo').tabIndex = on ? 0 : -1;
  };
  ScrollTrigger.create({
    trigger: hero,
    start: 'bottom 60px',
    endTrigger: footer,
    end: 'top 60px',
    onToggle: (self) => setCompact(self.isActive),
  });
  ScrollTrigger.create({
    trigger: footer,
    start: 'top 40px',
    end: 'bottom top',
    onToggle: (self) => nav.classList.toggle('is-light', self.isActive),
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

// Hero: the photo settles from a slight zoom while the wordmark rises, then
// drifts slower than the page as you scroll away.
function initHero() {
  const img = document.querySelector('[data-hero-img]');
  const kicker = document.querySelector('[data-hero-kicker]');
  const mark = document.querySelectorAll('#top .kit-mask > span');
  if (reduce) {
    gsap.set(img, { scale: 1 });
    return;
  }
  gsap.fromTo(img, { scale: 1.18 }, { scale: 1.08, duration: 2.4, ease: EASE_OUT });
  gsap.fromTo(mark, { yPercent: 105, autoAlpha: 1 }, { yPercent: 0, duration: 1.5, ease: EASE_OUT, delay: 0.2 });
  gsap.from(kicker, { opacity: 0, y: 12, duration: 1.2, delay: 0.6, ease: EASE_OUT });
  gsap.to(img, {
    yPercent: 14,
    ease: 'none',
    scrollTrigger: { trigger: '#top', start: 'top top', end: 'bottom top', scrub: true },
  });
}

// Project tiles unveil upward once; the footer wordmark rises as it arrives.
function initTiles() {
  if (reduce) return;
  gsap.utils.toArray('.orto-tile').forEach((tile) => {
    gsap.from(tile, {
      clipPath: 'inset(100% 0 0 0)',
      duration: 1.4,
      ease: 'power4.inOut',
      scrollTrigger: { trigger: tile, start: 'top 90%', once: true },
    });
    gsap.from(tile.querySelector('img'), {
      scale: 1.2,
      duration: 1.8,
      ease: EASE_OUT,
      scrollTrigger: { trigger: tile, start: 'top 90%', once: true },
    });
  });
  const footMark = document.querySelectorAll('#contact .kit-mask > span');
  gsap.fromTo(footMark, { yPercent: 105, autoAlpha: 1 }, {
    yPercent: 0,
    duration: 1.4,
    ease: EASE_OUT,
    scrollTrigger: { trigger: '#contact .kit-mark', start: 'top 95%', once: true },
  });
}

initNav();
initCursor();
initAccordion();
document.fonts.ready.then(() => {
  initFitMarks();
  initHero();
  initTiles();
  initReveals();
});
