// Fit each [data-fit] wordmark to its container: set a known size, measure the
// text (the element is inline-block, so it shrink-wraps), then scale so the
// line spans the full content width at every viewport. Refits on resize.
import { ScrollTrigger } from '../lib/motion.js';

function fit() {
  document.querySelectorAll('[data-fit]').forEach((el) => {
    const box = getComputedStyle(el.parentElement);
    const target = el.parentElement.clientWidth - parseFloat(box.paddingLeft) - parseFloat(box.paddingRight);
    el.style.fontSize = '100px';
    el.style.fontSize = `${Math.floor(((100 * target) / el.getBoundingClientRect().width) * 100) / 100}px`;
  });
  ScrollTrigger.refresh();
}

export function initFitMarks() {
  fit();
  let timer;
  window.addEventListener('resize', () => { clearTimeout(timer); timer = setTimeout(fit, 150); });
}
