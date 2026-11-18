// Generic scroll reveals.
//   [data-split]    headings: lines rise out of a mask, once, as they enter.
//   [data-reveal]   blocks: fade up 24px, once.
//   [data-parallax] images: drift slightly slower than the page.
import { gsap, SplitText, reduce, EASE_OUT } from '../lib/motion.js';

export function initReveals() {
  if (reduce) return;

  document.querySelectorAll('[data-split]').forEach((el) => {
    // The hero heading is already on screen, so it plays straight away.
    const inHero = !!el.closest('[data-hero]');
    SplitText.create(el, {
      type: 'lines',
      mask: 'lines',
      autoSplit: true,
      onSplit: (self) => {
        el.classList.add('is-split');
        return gsap.from(self.lines, {
          yPercent: 110,
          duration: 1.2,
          stagger: 0.08,
          delay: inHero ? 0.4 : 0,
          ease: EASE_OUT,
          scrollTrigger: inHero ? undefined : { trigger: el, start: 'top 85%', once: true },
        });
      },
    });
  });

  gsap.utils.toArray('[data-reveal]').forEach((el) => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: EASE_OUT,
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    });
  });

  gsap.utils.toArray('[data-parallax]').forEach((el) => {
    gsap.fromTo(el, { yPercent: 8 }, {
      yPercent: -8,
      ease: 'none',
      scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
    });
  });

  // The footer wordmark rises as the footer arrives.
  const mark = document.querySelector('[data-footer-mark]');
  if (mark) {
    gsap.from(mark, {
      yPercent: 40,
      ease: 'none',
      scrollTrigger: { trigger: mark, start: 'top bottom', end: 'bottom bottom', scrub: true },
    });
  }
}
