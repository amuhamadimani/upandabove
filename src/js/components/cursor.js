// Custom cursor for fine pointers: a lime dot that swells over links and
// becomes a "View" disc over work. The native cursor stays visible.
import { gsap, finePointer } from '../lib/motion.js';

export function initCursor() {
  const el = document.querySelector('[data-cursor]');
  if (!el || !finePointer) return;

  const x = gsap.quickTo(el, 'x', { duration: 0.35, ease: 'power3.out' });
  const y = gsap.quickTo(el, 'y', { duration: 0.35, ease: 'power3.out' });

  // Hidden until the pointer first moves, so it never sits at the top-left.
  window.addEventListener('pointermove', (e) => {
    el.classList.add('is-active');
    x(e.clientX);
    y(e.clientY);
    const view = e.target.closest('[data-cursor-view]');
    const link = !view && e.target.closest('a, button');
    el.classList.toggle('is-view', !!view);
    el.classList.toggle('is-link', !!link);
  }, { passive: true });
}
