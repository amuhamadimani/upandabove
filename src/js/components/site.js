// Behaviour shared by every page: anchor scrolling, the "+" pointer and the
// "View detail" cursor over work images.
import { gsap, lenis, reduce, EASE_IN_OUT, EASE_OUT } from '../lib/motion.js';

// The header is 40px on a phone and 48px from 768px up.
const headerHeight = () => (window.matchMedia('(min-width: 768px)').matches ? 48 : 40);

// Anchor links glide via Lenis and stop below the header.
export function initAnchors() {
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    const hash = link.getAttribute('href');
    const target = hash.length > 1 && document.querySelector(hash);
    if (!target) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(target, { offset: -headerHeight(), duration: 1.4 });
    else window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - headerHeight(), behavior: 'smooth' });
  });
}

// Work images: a "View detail" pill replaces the pointer over the image,
// follows it with a little lag, and pops in and out.
export function initWorkCursor() {
  const frames = document.querySelectorAll('.home-work-img');
  if (!frames.length || !window.matchMedia('(pointer: fine)').matches) return;
  const cursor = document.createElement('div');
  cursor.className = 'home-cursor';
  cursor.setAttribute('aria-hidden', 'true');
  cursor.innerHTML = '<span>View detail</span><svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="square"><path d="M3 11L11 3M4.5 3H11v6.5"/></svg>';
  document.body.append(cursor);
  gsap.set(cursor, { xPercent: -50, yPercent: -50, scale: 0 });
  const moveX = gsap.quickTo(cursor, 'x', { duration: 0.4, ease: 'power3.out' });
  const moveY = gsap.quickTo(cursor, 'y', { duration: 0.4, ease: 'power3.out' });
  frames.forEach((frame) => {
    frame.addEventListener('pointerenter', (e) => {
      gsap.set(cursor, { x: e.clientX, y: e.clientY });
      cursor.classList.add('is-on');
      gsap.to(cursor, { autoAlpha: 1, scale: 1, duration: reduce ? 0 : 0.45, ease: 'back.out(1.7)', overwrite: 'auto' });
    });
    frame.addEventListener('pointermove', (e) => { moveX(e.clientX); moveY(e.clientY); });
    frame.addEventListener('pointerleave', () => {
      cursor.classList.remove('is-on');
      gsap.to(cursor, { autoAlpha: 0, scale: 0, duration: reduce ? 0 : 0.25, ease: 'power3.in', overwrite: 'auto' });
    });
  });
}

// Pointer: the brand "+" follows the mouse, turns black over lime sections
// and grows and spins a quarter turn over anything clickable. It steps aside
// while the "View detail" pill is showing.
export function initPointer() {
  if (!window.matchMedia('(pointer: fine)').matches) return;
  const el = document.createElement('div');
  el.className = 'home-pointer';
  el.setAttribute('aria-hidden', 'true');
  el.innerHTML = '<svg viewBox="0 0 24 24"><path d="M9.9727 0H14.7471C14.7505 2.63025 14.8307 5.14353 14.388 7.74646C14.241 8.61351 14.2026 9.52316 14.0437 10.3993C14.6092 10.2476 15.3362 10.2111 15.922 10.1043C18.6297 9.61049 21.259 9.68915 24 9.69265V14.4811H14.1596C14.3536 15.9983 14.6397 17.7462 14.716 19.2522C14.7827 20.5661 14.7493 22.1352 14.7471 23.4683C14.755 23.6825 14.7545 23.7383 14.716 23.9482C14.6075 24.0293 10.4732 23.9912 9.9727 23.9902V14.4811H0V9.69265C1.64926 9.69028 3.4881 9.62003 5.11587 9.75323C6.57807 9.87272 8.54392 10.0905 9.9727 10.4045V0Z"/></svg>';
  document.body.append(el);
  document.documentElement.classList.add('has-pointer');
  gsap.set(el, { xPercent: -50, yPercent: -50 });
  const moveX = gsap.quickTo(el, 'x', { duration: 0.12, ease: 'power3.out' });
  const moveY = gsap.quickTo(el, 'y', { duration: 0.12, ease: 'power3.out' });
  let x = -100;
  let y = -100;
  let inside = false;
  let big = false;
  const show = (on) => gsap.to(el, { autoAlpha: on ? 1 : 0, duration: 0.2, overwrite: 'auto' });

  document.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    x = e.clientX;
    y = e.clientY;
    if (!inside) { inside = true; gsap.set(el, { x, y }); show(true); }
    moveX(x);
    moveY(y);
  });
  document.documentElement.addEventListener('mouseleave', () => { inside = false; show(false); });

  // Colour and size follow whatever is under the pointer, also while the page scrolls.
  let frame = 0;
  gsap.ticker.add(() => {
    frame += 1;
    if (!inside || frame % 3) return;
    const under = document.elementFromPoint(x, y);
    el.classList.toggle('is-dark', !!under?.closest('[data-nav-light]'));
    const pill = !!under?.closest('.home-work-img');
    const link = !pill && !!under?.closest('a, button, [data-svc-trigger], [data-svc-panel] li');
    gsap.to(el, { opacity: pill ? 0 : 1, duration: 0.2, overwrite: 'auto' });
    if (link !== big) {
      big = link;
      gsap.to(el.firstChild, { scale: link ? 1.5 : 1, rotation: link ? 90 : 0, duration: reduce ? 0 : 0.45, ease: 'back.out(2)' });
    }
  });
}

// Page transitions: a lime curtain rises over the page, then the next page
// opens already covered and lifts the curtain off. Links that land on a
// section (page.html#id) jump there while the curtain still hides the page.
export function initTransitions() {
  const curtain = document.querySelector('.page-curtain');
  if (!curtain) return;
  const root = document.documentElement;
  const entering = root.classList.contains('is-entering');

  if (entering && !reduce) {
    gsap.set(curtain, { yPercent: 0 });
    gsap.to(curtain, {
      yPercent: -100,
      duration: 0.9,
      delay: 0.15,
      ease: EASE_IN_OUT,
      onComplete: () => { root.classList.remove('is-entering'); gsap.set(curtain, { yPercent: 100 }); },
    });
  } else {
    root.classList.remove('is-entering');
    gsap.set(curtain, { yPercent: 100 });
  }

  // Arriving on page.html#id: put the section in place, instantly, under the curtain.
  const toHash = () => {
    const target = location.hash.length > 1 && document.querySelector(location.hash);
    if (!target) return;
    if (lenis) lenis.scrollTo(target, { offset: -headerHeight(), immediate: true, force: true });
    else window.scrollTo(0, target.getBoundingClientRect().top + window.scrollY - headerHeight());
  };
  toHash();
  document.fonts.ready.then(toHash);

  // The browser's back button can restore a page from memory with the curtain down.
  window.addEventListener('pageshow', (e) => {
    if (!e.persisted) return;
    root.classList.remove('is-entering', 'is-leaving');
    gsap.set(curtain, { yPercent: 100 });
    lenis?.start();
  });

  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const link = e.target.closest('a[href]');
    if (!link || (link.target && link.target !== '_self') || link.hasAttribute('download')) return;
    const url = new URL(link.href, location.href);
    if (!/^(https?|file):$/.test(url.protocol) || url.origin !== location.origin) return;
    if (url.pathname === location.pathname && url.search === location.search) return;
    e.preventDefault();
    if (reduce) { location.href = url.href; return; }
    try { sessionStorage.setItem('page-transition', '1'); } catch (err) { /* private mode: no entrance curtain */ }
    root.classList.add('is-leaving');
    lenis?.stop();
    gsap.set(curtain, { yPercent: 100 });
    gsap.to(curtain, { yPercent: 0, duration: 0.7, ease: EASE_IN_OUT, onComplete: () => { location.href = url.href; } });
  });
}

// Phone menu: the hamburger opens a card under the header. The card unrolls
// from the top and its rows rise in one by one; it closes on a second tap,
// outside tap, Escape, a link or when the window grows to desktop width.
export function initMenu() {
  const toggle = document.querySelector('[data-menu-toggle]');
  const menu = document.querySelector('[data-menu]');
  if (!toggle || !menu) return;
  const panel = menu.querySelector('.home-menu-panel');
  const rows = menu.querySelectorAll('.home-menu-link, .home-menu-foot');
  let open = false;

  const set = (next) => {
    if (next === open) return;
    open = next;
    toggle.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-hidden', String(!open));
    gsap.killTweensOf([panel, rows]);
    if (open) {
      menu.classList.add('is-open');
      if (reduce) { gsap.set(panel, { clearProps: 'all' }); gsap.set(rows, { clearProps: 'all' }); return; }
      gsap.fromTo(panel, { clipPath: 'inset(0 0 100% 0)', opacity: 0.4 }, { clipPath: 'inset(0 0 0% 0 round 16px)', opacity: 1, duration: 0.7, ease: EASE_OUT });
      gsap.fromTo(rows, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.06, delay: 0.12, ease: EASE_OUT });
    } else if (reduce) {
      menu.classList.remove('is-open');
    } else {
      gsap.to(panel, { clipPath: 'inset(0 0 100% 0 round 16px)', opacity: 0.4, duration: 0.45, ease: 'power3.inOut', onComplete: () => menu.classList.remove('is-open') });
      gsap.to(rows, { opacity: 0, duration: 0.2 });
    }
  };

  toggle.addEventListener('click', () => set(!open));
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) set(false); });
  document.addEventListener('click', (e) => { if (open && !menu.contains(e.target) && !toggle.contains(e.target)) set(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') set(false); });
  window.matchMedia('(min-width: 768px)').addEventListener('change', (e) => { if (e.matches) set(false); });
}
