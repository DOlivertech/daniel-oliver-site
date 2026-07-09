# CLAUDE.md

Agent guide for this repository. Everything here was verified against the code — trust it over guesses, and update it when the facts change.

## What this is

Personal marketing site for racing driver **Daniel Oliver**. Statically generated **Astro 5** site with Tailwind CSS 4 and a **Decap CMS** admin at `/admin` so the owner can edit content via GitHub commits. Content: bio, media galleries, blog, season schedule (2026 IMSA VP Racing SportsCar Challenge debut), partnerships, contact.

- **Live now:** https://daniel-oliver-site.netlify.app (Netlify project `daniel-oliver-site`, team `dolivertech`).
- **Prod domain (planned):** `danieloliverracing.com` — not yet attached in Netlify. The code already treats it as canonical (`astro.config.mjs` `site`, and `site_url`/`display_url` in `config.yml`), so launch = add the custom domain in Netlify; no code change needed.
- The old `#25` car-number branding was intentionally **removed** throughout — don't reintroduce it.

⚠️ **Naming traps**:
- Local dir is `danieloliver-racing`, but the git remote / CMS backend repo is **`DOlivertech/daniel-oliver-site`** (see `public/admin/config.yml`).
- The *sibling* dir `~/Git/daniel-oliver-racing` (extra hyphen) is an unrelated Next.js project. Don't conflate them.

## Commands

| Task | Command | Notes |
|---|---|---|
| Install | `npm install` | CI uses `npm ci` |
| Dev server | `npm run dev` | **http://localhost:4642** — custom port in `astro.config.mjs`, not Astro's 4321 |
| **Edit w/ live preview** | `npm run edit` | runs decap-server + astro together (concurrently); CMS Save hot-reloads the real site. Open `/admin/index.html` + `/` |
| Local CMS only | `npm run cms` (decap-server) alongside `npm run dev` | `local_backend: true` bypasses OAuth |
| Build | `npm run build` | outputs `dist/` — **the primary quality gate; no unit-test or lint script** |
| Verify (Playwright) | `npm run verify:hero`, `npm run verify:reveals` | headless checks; **need the dev server running** on 4642 |

## Structure & the two content systems

```
src/
├── pages/          # index, about, contact, partnerships, schedule, 404,
│                   # blog/{index,[slug]}, media/{index,[slug]}
├── components/     # Header (persistent, hamburger overlay), Footer, Signature,
│                   # RacingLines, AmbientAurora, Lightbox, SocialLinks
├── layouts/BaseLayout.astro   # SEO/fonts + the site-wide motion runtime (one <script>)
├── content/        # SYSTEM 1 — Astro content collections (zod schemas in src/content.config.ts):
│   ├── posts/      #   blog posts (.md)
│   ├── galleries/  #   media galleries (.json)
│   └── events/     #   schedule entries (.md); status upcoming|completed, optional result
├── data/           # SYSTEM 2 — copy imported directly by pages:
│   ├── site.json   #   global singleton (nav, socials, sponsors, footer, brand logos)
│   ├── pages/*.json#   per-page copy (home, about, media, blog, schedule, partnerships, contact, notfound)
│   └── signature.json  # traced SVG path of Daniel's real autograph (see below)
└── styles/global.css   # Tailwind 4 @theme design system
public/admin/       # Decap CMS (index.html + config.yml — the CMS collection map)
public/images/      # hero/, galleries/, sponsors/, brand/, build/, 2026/, uploads/ (CMS upload target)
scripts/            # Playwright verification scripts (dev-only, not shipped)
```

**Every user-facing string/image is CMS-editable** — pages read from `src/data/**`, `.astro` files hold no hardcoded copy. **To change page text, edit the matching `src/data/pages/<page>.json`, not the `.astro`.** All of `data/**` and `content/**` are exposed to Decap as collections in `public/admin/config.yml`. If you add a field to a page, wire it into both the `.astro` and the CMS config.

## Design & motion system (deliberate — don't casually "simplify")

- **Vanilla JS + CSS only.** No React/client frameworks. Interactivity lives in `BaseLayout.astro`'s motion runtime + small per-component `<script>`s. Everything re-inits on `astro:page-load` (View Transitions via `<ClientRouter/>`) and tears down on `astro:before-swap`.
- **Respect `prefers-reduced-motion`** everywhere (static fallbacks). Animate transform/opacity/clip-path/mask only — no layout-affecting props (protect CLS).
- **Signature** (`Signature.astro` + `src/data/signature.json`): Daniel's **real autograph**, traced from a scan to one centreline SVG path. It "writes on" via a soft-edged left-to-right mask reveal driven by a `@property --sig-reveal` custom property. Replays on nav (header, persisted) and loops on the hero. To change the signature, re-trace a scan (autotrace `-centerline`) and replace `signature.json` — not a font.
- **Brand motion (credit-free):** `RacingLines.astro` (gradient racing-line beams + comets, in hero & menu) and `AmbientAurora.astro` (fixed drifting glow behind every page).
- **Hero** (`index.astro`): split layout at `lg+` (portrait right ~62%, type left) and **stacked** below `lg` (portrait panel on top, text under) so text never overlaps the face. `hero.video` (in `home.json`) is an optional CMS background-video slot layered over the image — currently empty (awaiting a Higgsfield clip); poster/reduced-motion fallbacks already wired.
- **Completed events** (`schedule.astro`): past events render as cards with a checkered-flag COMPLETED badge; `result` P1/P2/P3 → gold/silver/bronze medal via the `podium()` classifier.
- **Track maps + flags** (`TrackMap.astro`, `src/lib/tracks.ts`, `src/data/tracks.json`): events have an optional `track` id (CMS dropdown). `trackById()` resolves it to a country flag (shown in the meta line) + a projected SVG circuit outline overlaid in a card corner. `tracks.json` (222 tracks, ~34 with drawn maps) is regenerated from the sibling `track-manager-pro` repo via `node scripts/build-tracks.mjs` — don't hand-edit it. `TrackMap` sets `position:absolute` inline on purpose: the global `.card > *{position:relative}` rule has equal specificity to Tailwind's `.absolute` and would otherwise win by source order (same reason the checkered wash div carries an inline `position:absolute`).

## Gotchas (hard-won — read before touching)

- **Scroll-reveal uses `threshold: 0`, not a ratio.** `.reveal-clip` starts at `clip-path: inset(0 0 100%)`, which pins its *visible* area (and IntersectionObserver `intersectionRatio`) to 0 in Chromium — a ratio threshold never fires and images stay invisible forever. `entry.isIntersecting` (geometry) is what works. `npm run verify:reveals` guards this.
- **Hero must never cover the face.** `scripts/verify-hero.mjs` projects the face box through the live object-fit geometry across 9 viewports and asserts no hero text overlaps it. Run it after hero layout changes.
- **ImageMagick here has no Freetype/rsvg delegate** — it can't render text labels or rasterize SVG. Use Playwright to render/screenshot SVG.
- `dist/`, `.netlify/`, `node_modules/` are gitignored — never edit build output.

## Auth & deployment (current state)

- **CMS login: GitHub OAuth — DONE and working.** `backend: github`, repo `DOlivertech/daniel-oliver-site`, private → the owner (DOlivertech) is the only person who can log in. A GitHub OAuth app (callback `https://api.netlify.com/auth/done`) is installed in Netlify, which brokers the handshake; the client secret lives only in Netlify's dashboard. Editorial workflow is on (drafts land on `cms/*` branches).
- **Deploys are currently MANUAL:** `npm run build && netlify deploy --prod --dir=dist`. A GitHub Actions workflow (`.github/workflows/deploy.yml`) exists to auto-deploy on push to `main`, but it **fails** until the repo secret `NETLIFY_AUTH_TOKEN` is added (only `NETLIFY_SITE_ID` is set). So: after committing, deploy manually unless/until that token is set.
- `netlify.toml`: publish `dist`, Node 20, `X-Frame-Options: SAMEORIGIN` on `/admin/*`, 302 `/store` → external Squarespace store.
- No env vars needed to build/run locally.

## Conventions

- Sponsor entries in `src/data/site.json` are logos only.
- Commit style in this repo: descriptive multi-line messages; `Co-Authored-By: Claude ...` trailer.
- `docs/EDITING.md` is the owner-facing, plain-English CMS guide — keep it in sync with the collections.
