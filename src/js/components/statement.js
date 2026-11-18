// Statement — the words light up one by one as you scroll through it, so the
// paragraph reads at the pace of the scroll (the noth.in move).
import { gsap, SplitText, reduce } from '../lib/motion.js';

export function initStatement() {
  const el = document.querySelector('[data-statement]');
  if (!el || reduce) return;

  const split = SplitText.create(el, { type: 'words' });
  const chips = el.querySelectorAll('.chip');
  gsap.set([...split.words, ...chips], { opacity: 0.14 });
  gsap.to([...split.words, ...chips], {
    opacity: 1,
    stagger: 0.1,
    ease: 'none',
    scrollTrigger: { trigger: el, start: 'top 75%', end: 'bottom 45%', scrub: true },
  });
}
