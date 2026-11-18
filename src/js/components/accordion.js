// Drop-down lists (services, FAQ) — one panel open at a time within each
// [data-accordion] group; panels animate to their natural height. Buttons
// carry aria-expanded for screen readers. A page may hold several groups.
import { gsap, ScrollTrigger, reduce } from '../lib/motion.js';

export function initAccordion() {
  document.querySelectorAll('[data-accordion]').forEach((root) => {
    const items = Array.from(root.querySelectorAll('[data-acc-item]'));

    const set = (item, open) => {
      const panel = item.querySelector('[data-acc-panel]');
      const btn = item.querySelector('[data-acc-trigger]');
      item.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', String(open));
      gsap.to(panel, {
        height: open ? 'auto' : 0,
        duration: reduce ? 0 : 0.8,
        ease: 'power4.inOut',
        onComplete: () => ScrollTrigger.refresh(),
      });
    };

    items.forEach((item) => {
      item.querySelector('[data-acc-trigger]').addEventListener('click', () => {
        const open = !item.classList.contains('is-open');
        items.forEach((other) => other !== item && other.classList.contains('is-open') && set(other, false));
        set(item, open);
      });
    });
  });
}
