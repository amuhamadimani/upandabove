// Work list hover preview — an image follows the cursor and swaps with a
// zoom-settle as you move between rows. Touch and small screens show each
// row's own thumbnail instead (CSS handles that switch).
import { gsap, reduce } from '../lib/motion.js';

export function initWorks() {
  const list = document.querySelector('[data-work-list]');
  const preview = document.querySelector('[data-work-preview]');
  if (!list || !preview || !window.matchMedia('(hover: hover)').matches) return;

  const rows = Array.from(list.querySelectorAll('[data-work-row]'));
  const imgs = rows.map((row) => {
    const img = document.createElement('img');
    img.src = row.dataset.img;
    img.alt = '';
    img.loading = 'lazy';
    preview.appendChild(img);
    return img;
  });

  const x = gsap.quickTo(preview, 'x', { duration: reduce ? 0 : 0.6, ease: 'power3.out' });
  const y = gsap.quickTo(preview, 'y', { duration: reduce ? 0 : 0.6, ease: 'power3.out' });
  const rot = gsap.quickTo(preview, 'rotation', { duration: 0.8, ease: 'power3.out' });
  let lastX = 0;

  list.addEventListener('pointermove', (e) => {
    const w = preview.offsetWidth;
    const h = preview.offsetHeight;
    x(e.clientX - w / 2);
    y(e.clientY - h / 2);
    // Lean in the direction of travel, a few degrees at most.
    if (!reduce) rot(gsap.utils.clamp(-6, 6, (e.clientX - lastX) * 0.4));
    lastX = e.clientX;
  });

  rows.forEach((row, i) => {
    row.addEventListener('pointerenter', () => {
      imgs.forEach((img, j) => img.classList.toggle('is-active', j === i));
      preview.classList.add('is-visible');
    });
  });
  list.addEventListener('pointerleave', () => preview.classList.remove('is-visible'));
}
