// Shared motion setup. GSAP's ticker is the single rAF loop: Lenis and the
// WebGL scene both ride it, so ScrollTrigger and smooth scroll never drift.
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger, SplitText);

export const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export const finePointer = window.matchMedia('(pointer: fine)').matches;

// Default easings — power4.out for entrances, power4.inOut for curtains.
export const EASE_OUT = 'power4.out';
export const EASE_IN_OUT = 'power4.inOut';

export const lenis = reduce ? null : new Lenis({ lerp: 0.1, wheelMultiplier: 0.9, touchMultiplier: 1.4 });

if (lenis) {
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

export { gsap, ScrollTrigger, SplitText };
