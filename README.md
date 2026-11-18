# Up+Above website

Static site: plain HTML pages with Tailwind CSS, GSAP and Lenis (built into `dist/`).

## Pages

- `index.html` — home
- `work.html` — all work
- `work-detail.html` — project page (preview)

## Develop

```bash
npm install
npm run dev      # watch CSS and JS
npm run build    # one-off build into dist/
```

`dist/` is committed, so the site also works without a build step.

## Deploy (Cloudflare Pages)

- Framework preset: None
- Build command: `npm run build` (or leave empty to serve the committed `dist/`)
- Build output directory: `/` (the repository root)
