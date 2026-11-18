// Nav — hides on scroll down, returns on scroll up; anchor links glide via
// Lenis; the mobile menu opens full screen and closes on Escape or a link.
import { lenis, ScrollTrigger } from '../lib/motion.js';

export function initNav() {
  const nav = document.querySelector('[data-nav]');
  const menu = document.querySelector('[data-menu]');
  const toggle = document.querySelector('[data-menu-toggle]');

  // Switch to dark ink while a light section sits under the nav bar.
  document.querySelectorAll('[data-nav-light]').forEach((section) => {
    ScrollTrigger.create({
      trigger: section,
      start: 'top 40px',
      end: 'bottom 40px',
      onToggle: (self) => nav.classList.toggle('is-light', self.isActive),
    });
  });

  let last = 0;
  const onScroll = (y) => {
    nav.classList.toggle('is-hidden', y > last && y > 120);
    last = y;
  };
  if (lenis) lenis.on('scroll', ({ scroll }) => onScroll(scroll));
  else window.addEventListener('scroll', () => onScroll(window.scrollY), { passive: true });

  const setMenu = (open) => {
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', String(!open));
    toggle.setAttribute('aria-expanded', String(open));
    if (open) { lenis?.stop(); menu.querySelector('[data-menu-close]').focus(); }
    else { lenis?.start(); toggle.focus(); }
  };
  toggle?.addEventListener('click', () => setMenu(true));
  menu?.querySelector('[data-menu-close]').addEventListener('click', () => setMenu(false));
  document.addEventListener('keydown', (e) => e.key === 'Escape' && menu.classList.contains('is-open') && setMenu(false));

  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    const hash = link.getAttribute('href');
    const target = hash === '#top' ? 0 : hash.length > 1 && document.querySelector(hash);
    if (target === null || target === false) return;
    e.preventDefault();
    if (link.hasAttribute('data-menu-link')) setMenu(false);
    if (lenis) lenis.scrollTo(target, { duration: 1.4 });
    else window.scrollTo({ top: target === 0 ? 0 : target.getBoundingClientRect().top + window.scrollY, behavior: 'smooth' });
  });
}
