// Entry point — bundled by esbuild into one IIFE (dist/main.js) so index.html
// runs straight from disk with no server.
import { initPreloader } from './components/preloader.js';
import { initNav } from './components/nav.js';
import { initPlus } from './components/plus-scene.js';
import { initHero } from './components/hero.js';
import { initReveals } from './components/reveals.js';
import { initStatement } from './components/statement.js';
import { initWorks } from './components/works.js';
import { initAccordion } from './components/accordion.js';
import { initReviews } from './components/reviews.js';
import { initCursor } from './components/cursor.js';

initNav();
initCursor();
initAccordion();
initReviews();
initWorks();
const plus = initPlus();

// Hero intro and scroll-driven reveals wait for the curtain to lift, so
// nothing animates out of sight behind the preloader.
document.fonts.ready.then(() => {
  initPreloader().then(() => {
    initHero(plus);
    initReveals();
    initStatement();
  });
});
