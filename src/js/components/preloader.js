// Preloader — counts 0→100 against real image loading (held at least 1.2s),
// spins the brand "+", then lifts like a curtain to reveal the hero.
import { gsap, lenis, reduce, EASE_IN_OUT } from '../lib/motion.js';

const MIN_MS = 1200;
const SAFETY_MS = 8000;

export function initPreloader() {
  const el = document.querySelector('[data-preloader]');
  if (!el || reduce) {
    el?.remove();
    return Promise.resolve();
  }

  const count = el.querySelector('[data-preloader-count]');
  const plus = el.querySelector('[data-preloader-plus]');
  lenis?.stop();
  document.documentElement.style.overflow = 'hidden';

  const imgs = Array.from(document.images).filter((i) => i.loading !== 'lazy');
  let loaded = 0;
  const done = () => { loaded += 1; };
  imgs.forEach((i) => (i.complete ? done() : (i.addEventListener('load', done, { once: true }), i.addEventListener('error', done, { once: true }))));

  const spin = gsap.to(plus, { rotation: 360, duration: 1.6, ease: 'none', repeat: -1 });
  const state = { v: 0 };
  const start = performance.now();

  return new Promise((resolve) => {
    const tick = () => {
      const elapsed = performance.now() - start;
      const real = imgs.length ? loaded / imgs.length : 1;
      const time = Math.min(1, elapsed / MIN_MS);
      const target = Math.min(real, time) * 100;
      state.v += (target - state.v) * 0.12;
      count.textContent = Math.round(state.v);

      const finished = (real >= 1 && time >= 1 && state.v > 99.4) || elapsed > SAFETY_MS;
      if (!finished) return;

      gsap.ticker.remove(tick);
      count.textContent = '100';
      spin.kill();
      gsap.timeline({
        onComplete: () => {
          el.remove();
          document.documentElement.style.overflow = '';
          lenis?.start();
        },
      })
        .to(plus, { rotation: '+=135', scale: 0.6, duration: 0.6, ease: EASE_IN_OUT })
        .to(el, { yPercent: -100, duration: 1.1, ease: EASE_IN_OUT }, '-=0.25')
        .add(resolve, '-=0.75');
    };
    gsap.ticker.add(tick);
  });
}
