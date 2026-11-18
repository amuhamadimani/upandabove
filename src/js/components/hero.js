// Hero intro (runs once, as the preloader curtain lifts) and the hero's scroll
// exit. The wordmark rises out of its masks, the 3D "+" grows into the gap
// between "Up" and "Above", and the small reel starts cycling work.
import { gsap, ScrollTrigger, reduce, EASE_OUT } from '../lib/motion.js';

const REEL_MS = 3.2;

function initReel() {
  const reel = document.querySelector('[data-reel]');
  if (!reel) return;
  const imgs = Array.from(reel.querySelectorAll('img'));
  const bar = document.querySelector('[data-reel-bar]');
  const label = document.querySelector('[data-reel-label]');
  // Labels follow the work list so the reel and the list name the same work.
  const names = Array.from(document.querySelectorAll('[data-work-row] .work-name')).map((n) => n.textContent);
  let i = 0;

  if (reduce) return;
  const step = () => {
    gsap.fromTo(bar, { scaleX: 0 }, {
      scaleX: 1,
      duration: REEL_MS,
      ease: 'none',
      onComplete: () => {
        const prev = imgs[i];
        i = (i + 1) % imgs.length;
        const next = imgs[i];
        next.classList.add('is-active');
        gsap.fromTo(next, { clipPath: 'inset(100% 0 0 0)', scale: 1.15 }, { clipPath: 'inset(0% 0 0 0)', scale: 1, duration: 1, ease: 'power4.inOut', onComplete: () => prev.classList.remove('is-active') });
        if (label && names[i]) label.textContent = names[i];
        step();
      },
    });
  };
  step();
}

export function initHero(plus) {
  const hero = document.querySelector('[data-hero]');
  if (!hero) return;
  const parts = hero.querySelectorAll('.mark-mask > span');
  const meta = hero.querySelectorAll('[data-hero-meta]');

  if (reduce) {
    initReel();
    return;
  }

  gsap.fromTo(parts, { yPercent: 105, autoAlpha: 1 }, { yPercent: 0, duration: 1.4, stagger: 0.12, ease: EASE_OUT });
  if (plus) gsap.to(plus, { scale: 1, duration: 1.8, delay: 0.25, ease: 'elastic.out(1, 0.6)' });
  gsap.from(meta, { opacity: 0, y: 24, duration: 1, stagger: 0.08, delay: 0.35, ease: EASE_OUT });

  initReel();

  // Scroll exit: the "+" spins a quarter turn and the wordmark drifts down.
  ScrollTrigger.create({
    trigger: hero,
    start: 'top top',
    end: 'bottom top',
    scrub: true,
    onUpdate: (self) => { if (plus) plus.scroll = self.progress; },
  });
  gsap.to(hero.querySelector('.text-mark'), {
    yPercent: 18,
    ease: 'none',
    scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true },
  });
}
