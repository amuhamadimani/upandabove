// Kind words — a manual crossfade between quotes (no autoplay).
export function initReviews() {
  const root = document.querySelector('[data-reviews]');
  if (!root) return;
  const slides = Array.from(root.querySelectorAll('[data-review]'));
  const index = root.querySelector('[data-review-index]');
  let i = 0;

  const go = (n) => {
    i = (n + slides.length) % slides.length;
    slides.forEach((s, j) => s.classList.toggle('is-active', j === i));
    index.textContent = String(i + 1).padStart(2, '0');
  };

  root.querySelector('[data-review-prev]').addEventListener('click', () => go(i - 1));
  root.querySelector('[data-review-next]').addEventListener('click', () => go(i + 1));
}
