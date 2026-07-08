# CLAUDE.md

Agent guide for this repository. Everything here was verified against the code — trust it over guesses, and update it when the facts change.

## What this is

Personal marketing site for racing driver **Daniel Oliver (#25)** — danieloliverracing.com (Netlify project `daniel-oliver-site`). Statically generated **Astro 5** site with Tailwind CSS 4 and a **Decap CMS** admin at `/admin` so non-technical editors can change content via GitHub commits. Content: bio, media galleries, blog, season schedule (2026 IMSA VP Racing SportsCar Challenge debut), partnerships, contact.

⚠️ **Naming traps**:
- The local dir is `danieloliver-racing`, but the git remote / CMS backend repo is **`DOlivertech/daniel-oliver-site`** (see `public/admin/config.yml`).
- The *sibling* directory `~/Git/daniel-oliver-racing` (extra hyphen) is a completely different, unrelated Next.js project. Don't conflate them.

## Commands

| Task | Command | Notes |
|---|---|---|
| Install | `npm install` | CI uses `npm ci` |
| Dev server | `npm run dev` | **http://localhost:4642** — custom port in `astro.config.mjs`, not Astro's default 4321 |
| Build | `npm run build` | outputs `dist/` — **this is the only quality gate; there is no test or lint script** |
| Preview build | `npm run preview` | |
| Local CMS | `npm run cms` (decap-server) alongside `npm run dev` | then open `localhost:4642/admin`; `local_backend: true` bypasses OAuth |

## Structure & the two content systems

```
src/
├── pages/          # routes: index, about, contact, partnerships, schedule, 404,
│                   # blog/{index,[slug]}, media/{index,[slug]}
├── components/     # Header (hamburger overlay), Footer, Signature (animated SVG),
│                   # Lightbox, SocialLinks
├── layouts/BaseLayout.astro   # SEO/fonts/scroll-reveal shell
├── content/        # SYSTEM 1 — Astro content collections (zod schemas in
│   │               # src/content.config.ts):
│   ├── posts/      #   blog posts (.md)
│   ├── galleries/  #   media galleries (.json)
│   └── events/     #   schedule entries (.md)
├── data/           # SYSTEM 2 — page copy imported directly by pages:
│   ├── site.json   #   global singleton (nav, socials, sponsors)
│   └── pages/*.json#   per-page copy (home, about, media, …)
└── styles/global.css   # Tailwind 4 @theme design system
public/admin/       # Decap CMS (index.html + config.yml — the CMS collection map)
public/images/      # hero/, galleries/, sponsors/, brand/, uploads/ (CMS upload target)
```

**To change page text, edit the matching `src/data/pages/<page>.json` — not the `.astro` file.** Both content systems are exposed to Decap as collections in `public/admin/config.yml`.

## Deployment

- Push to `main` → `.github/workflows/deploy.yml`: Node 20, `npm ci`, `npm run build`, `npx netlify-cli deploy --prod --dir=dist`. Secrets: `NETLIFY_AUTH_TOKEN`, `NETLIFY_SITE_ID`.
- CMS edits commit to `main`, which triggers the same pipeline.
- `netlify.toml`: publish `dist`, `X-Frame-Options: SAMEORIGIN` on `/admin/*`, 302 `/store` → external store.
- No env vars are needed to build/run locally. The single secret (GitHub OAuth app client secret for the CMS) lives only in the Netlify dashboard.

## Conventions & gotchas

- **Vanilla JS only** for interactivity — no React/client frameworks. Respect `prefers-reduced-motion` (the site has a deliberate animation system: view transitions, scroll reveals, animated signature).
- `dist/` and `.netlify/` exist locally but are gitignored — never edit build output.
- No test/lint tooling exists; verification = a clean `npm run build`.
- Sponsor entries in `src/data/site.json` ("Race Control", "Demia Motorsports") are logos only — this repo has no code dependency on any sibling project.
