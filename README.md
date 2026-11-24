# Up+Above website

Static site: plain HTML pages with Tailwind CSS, GSAP and Lenis (built into `dist/`).

## Pages

- `index.html` — home
- `work.html` — all work
- `work-detail.html` — the page every work gets

The works, the home page's featured works and the client logos come from `content/site.json`.
These pages are the templates: `npm run build` fills the parts between `<!-- content:x -->` and
`<!-- /content:x -->` and writes the finished site to `_site/`, with one page per work under
`_site/works/`. Images under `content/` are converted to WebP there; `assets/` is copied as it is.

## Develop

```bash
npm install
npm run dev      # watch CSS and JS
npm run build    # CSS, JS and the finished site in _site/
```

`dist/` is committed, and the pages at the root still open directly with the current content.

## Deploy (Cloudflare Pages)

- Framework preset: None
- Build command: `npm run build`
- Build output directory: `_site`
