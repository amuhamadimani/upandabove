/* Builds the site that goes live into _site/: the home page, the works list and one page per work,
   filled from content/site.json. The pages at the root are the templates: the parts between
   <!-- content:x --> and <!-- /content:x --> are replaced, everything else is copied as it is.
   Images under content/ are turned into WebP; images under assets/ are used as they are. */
import { readFile, writeFile, mkdir, cp, rm, access } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUT = path.join(ROOT, '_site');
const SITE = 'https://upandabove.id';
const HOME_WORKS = 4;
const MAX_WIDTH = 2400;

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const plain = (title) => String(title).replace(/\*/g, '').trim();
const marked = (title) => esc(title).replace(/\*([^*]+)\*/g, '<span class="hl">$1</span>');

/* "Brand Strategy & Positioning" reads as "Brand strategy & positioning"; words in capitals stay. */
const sentence = (name) => String(name).split(/(\s+|-)/)
  .map((part, i) => (i > 0 && /^[A-Z][a-z]+$/.test(part) ? part.toLowerCase() : part)).join('');
const lowerFirst = (s) => (/^[A-Z][a-z]/.test(s) ? s[0].toLowerCase() + s.slice(1) : s);
const andList = (items) => (items.length < 2 ? items.join('') : `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`);

function fill(html, name, inner, file) {
  const pattern = new RegExp(`<!-- content:${name}\\b[^>]*-->[\\s\\S]*?<!-- /content:${name} -->`);
  if (!pattern.test(html)) throw new Error(`${file} has no <!-- content:${name} --> part.`);
  return html.replace(pattern, () => inner.trim());
}

/* Comments are notes for whoever edits the templates, not for visitors. */
const stripComments = (html) => html.replace(/^[ \t]*<!--[\s\S]*?-->[ \t]*\r?\n/gm, '').replace(/<!--[\s\S]*?-->/g, '');

/* Pages under works/ sit one folder down, so their relative links step up first. */
const fromSubfolder = (html) => html.replace(/(\s(?:src|href)=")(?!https?:|#|mailto:|tel:|data:|\/)/g, '$1../');

/* ---- Images ---- */

const images = new Map();
async function image(src) {
  if (!src) return null;
  if (images.has(src)) return images.get(src);
  const file = path.join(ROOT, src);
  try { await access(file); } catch { throw new Error(`Image not found: ${src}`); }

  let out = { src, width: 0, height: 0 };
  if (/\.svg$/i.test(src)) {
    if (src.startsWith('content/')) {
      out.src = `media/${path.basename(src)}`;
      await mkdir(path.join(OUT, 'media'), { recursive: true });
      await cp(file, path.join(OUT, out.src));
    }
  } else if (src.startsWith('content/')) {
    out.src = `media/${path.basename(src, path.extname(src))}.webp`;
    await mkdir(path.join(OUT, 'media'), { recursive: true });
    const info = await sharp(file).rotate().resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .webp({ quality: 82 }).toFile(path.join(OUT, out.src));
    out = { ...out, width: info.width, height: info.height };
  } else {
    const meta = await sharp(file).metadata();
    out = { ...out, width: meta.width, height: meta.height };
  }
  images.set(src, out);
  return out;
}

const size = (img) => (img && img.width ? ` width="${img.width}" height="${img.height}"` : '');

/* ---- Parts ---- */

const workHref = (work) => `works/${work.slug}.html`;

async function card(work) {
  const title = plain(work.title);
  const cover = await image(work.cover || (work.gallery[0] && work.gallery[0].image));
  const scope = work.scope.slice(0, 3).map((s, i) => (i ? lowerFirst(sentence(s)) : sentence(s))).join(', ');
  const desc = [work.client, scope].filter(Boolean).join(' · ');
  return `
        <a href="${workHref(work)}" class="home-work group">
          <span class="home-work-img">${cover ? `<img src="${esc(cover.src)}"${size(cover)} alt="${esc(title)}" loading="lazy">` : ''}</span>
          <span class="home-work-meta">
            <span class="home-work-title">${esc(title)}</span>${desc ? `
            <span class="home-work-desc">${esc(desc)}</span>` : ''}
          </span>
        </a>`;
}

const block = (label, body, cls = 'detail-value') => `
        <div class="detail-block">
          <p class="detail-label">${label}</p>
          <p class="${cls}">${body}</p>
        </div>`;

function info(work) {
  const text = (s) => esc(s).replace(/\r?\n/g, '<br>');
  const meta = [['Client', work.client], ['Year', work.year]].filter(([, v]) => v).map(([label, v]) => `
          <div>
            <p class="detail-label">${label}</p>
            <p class="detail-value">${text(v)}</p>
          </div>`).join('');
  return [
    `\n        <h1 class="detail-title" data-split>${marked(work.title)}</h1>`,
    work.info ? block('Info', text(work.info), 'detail-lede') : '',
    work.scope.length ? block('Areas', work.scope.map((s) => esc(sentence(s))).join(' <span aria-hidden="true">·</span> ')) : '',
    meta ? `\n        <div class="detail-block detail-meta">${meta}\n        </div>` : '',
    work.result ? block('Result', text(work.result)) : '',
  ].filter(Boolean).join('\n');
}

async function gallery(work) {
  const title = plain(work.title);
  const items = work.gallery.length ? work.gallery : work.cover ? [{ image: work.cover, width: 'Wide' }] : [];
  const figures = [];
  for (const [i, g] of items.entries()) {
    const img = await image(g.image);
    figures.push(`        <figure class="detail-fig detail-fig--${g.width === 'Narrow' ? 'tall' : 'wide'}"><img src="${esc(img.src)}" alt="${esc(title)}: image ${i + 1}" loading="lazy"></figure>`);
  }
  return `\n${figures.join('\n')}`;
}

function head(html, work, cover) {
  const title = plain(work.title);
  const areas = work.scope.map((s) => lowerFirst(sentence(s)));
  const description = `${title}${areas.length ? `: ${andList(areas)}` : ''}${work.client ? ` for ${work.client}` : ''}, by Up+Above.`;
  return html
    .replace(/<title>[^<]*<\/title>/, `<title>${esc(title)} — Up+Above</title>`)
    .replace(/(<meta name="description" content=")[^"]*/, `$1${esc(description)}`)
    .replace(/(<meta property="og:title" content=")[^"]*/, `$1${esc(title)} — Up+Above`)
    .replace(/(<meta property="og:description" content=")[^"]*/, `$1${esc(work.info || description)}`)
    .replace(/(<meta property="og:image" content=")[^"]*/, `$1${cover ? `${SITE}/${esc(cover.src)}` : `${SITE}/assets/figma/banner.webp`}`);
}

/* ---- Build ---- */

function check(content) {
  const slugs = new Set();
  content.works.forEach((w, i) => {
    if (!w.title || !w.slug) throw new Error(`Work ${i + 1} needs a title and a web address.`);
    if (!/^[a-z0-9-]+$/.test(w.slug)) throw new Error(`"${w.slug}" is not a usable web address.`);
    if (slugs.has(w.slug)) throw new Error(`Two works share the web address "${w.slug}".`);
    slugs.add(w.slug);
    w.scope = w.scope || [];
    w.gallery = w.gallery || [];
  });
  content.clients = content.clients || [];
}

async function build() {
  const content = JSON.parse(await readFile(path.join(ROOT, 'content/site.json'), 'utf8'));
  check(content);
  const read = (file) => readFile(path.join(ROOT, file), 'utf8');

  await rm(OUT, { recursive: true, force: true });
  await mkdir(path.join(OUT, 'works'), { recursive: true });
  for (const dir of ['assets', 'dist']) await cp(path.join(ROOT, dir), path.join(OUT, dir), { recursive: true });
  await cp(path.join(ROOT, 'favicon.ico'), path.join(OUT, 'favicon.ico'));

  const cards = [];
  for (const w of content.works) cards.push(await card(w));

  // Home: the first works marked for the home page, and the client logos.
  let home = await read('index.html');
  const featured = content.works.map((w, i) => (w.featured ? cards[i] : null)).filter(Boolean).slice(0, HOME_WORKS);
  home = fill(home, 'featured', featured.join(''), 'index.html');
  const logos = [];
  for (const c of content.clients) {
    const logo = await image(c.logo);
    logos.push(`<li><a href="#" aria-label="${esc(c.name)}"><img src="${esc(logo.src)}" alt="" loading="lazy"></a></li>`);
  }
  home = fill(home, 'clients', `          ${logos.join('')}`, 'index.html');
  await writeFile(path.join(OUT, 'index.html'), stripComments(home));

  // All works.
  let list = await read('work.html');
  list = fill(list, 'works', cards.join(''), 'work.html');
  const names = content.works.slice(0, 3).map((w) => plain(w.title));
  if (names.length) list = list.replace(/(campaigns for )[^"]*\./, `$1${esc(andList(names))}.`);
  await writeFile(path.join(OUT, 'work.html'), stripComments(list));

  // One page per work.
  const template = await read('work-detail.html');
  for (const w of content.works) {
    const cover = await image(w.cover);
    let page = head(template, w, cover);
    page = fill(page, 'info', info(w), 'work-detail.html');
    page = fill(page, 'gallery', await gallery(w), 'work-detail.html');
    await writeFile(path.join(OUT, workHref(w)), fromSubfolder(stripComments(page)));
  }

  console.log(`Built _site: home (${featured.length} works, ${logos.length} logos), works list (${content.works.length}), ${content.works.length} work pages.`);
}

build().catch((e) => {
  console.error(`Build failed: ${e.message}`);
  process.exit(1);
});
