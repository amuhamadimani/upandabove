// Entry point for work.html — a title, a sentence and a grid of projects.
// Bundled by esbuild into dist/work.js (IIFE) so the page runs from disk.
import { gsap, reduce, EASE_OUT } from './lib/motion.js';
import { initReveals } from './components/reveals.js';
import { initAnchors, initMenu, initPointer, initTransitions, initWorkCursor } from './components/site.js';

// Project frames unveil as they scroll in; the footer wordmark rises.
function initScene() {
  if (reduce) return;
  gsap.utils.toArray('.home-work-img, .detail-fig').forEach((frame) => {
    gsap.from(frame, { clipPath: 'inset(100% 0 0 0)', duration: 1.4, ease: 'power4.inOut', scrollTrigger: { trigger: frame, start: 'top 90%', once: true } });
  });
  const mark = document.querySelector('[data-home-mark]');
  if (mark) {
    gsap.fromTo(mark, { yPercent: 105, autoAlpha: 1 }, {
      yPercent: 0,
      duration: 1.4,
      ease: EASE_OUT,
      scrollTrigger: { trigger: mark.parentElement, start: 'top bottom', once: true },
    });
  }
}

initAnchors();
initTransitions();
initMenu();
initPointer();
initWorkCursor();
document.fonts.ready.then(() => {
  initScene();
  initReveals();
});
