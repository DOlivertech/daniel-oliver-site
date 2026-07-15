# AGENTS.md

Guide for any coding agent working in this repository (Claude, Cursor, Codex, Copilot, etc.).
Everything here was verified against the code — trust it over guesses, and update it when the facts change.

## What this is

Personal marketing site for racing driver **Daniel Oliver**. Statically generated **Astro 5** site with Tailwind CSS 4 and a **Decap CMS** admin at `/admin` so the owner can edit content via GitHub commits. Content: bio, media galleries, blog, news, season schedule (2026 IMSA VP Racing SportsCar Challenge debut), partnerships, contact.

- **Live:** https://danieloliverracing.com (Netlify project `daniel-oliver-site`, team `dolivertech`; the `.netlify.app` URL still resolves as the origin). `www` 301-redirects to the apex.
- **Repo / CMS backend:** `DOlivertech/daniel-oliver-site`.
- **Canonical domain** `danieloliverracing.com` is wired throughout: `astro.config.mjs` `site`, `site_url`/`display_url` in `public/admin/config.yml`, `robots.txt`, and the OG/canonical tags (which derive from `Astro.site`, no separate override).

⚠️ **Naming traps**:
- Local dir is `danieloliver-racing`, but the git remote / CMS backend repo is **`DOlivertech/daniel-oliver-site`**.
- The *sibling* dir `~/Git/daniel-oliver-racing` (extra hyphen) is an unrelated Next.js project. Don't conflate them.

## Commands

| Task | Command | Notes |
|---|---|---|
| Install | `npm install` | CI uses `npm ci` |
| Dev server | `npm run dev` | **http://localhost:4642** — custom port in `astro.config.mjs`, not Astro's 4321 |
| **Edit w/ live preview** | `npm run edit` | runs decap-server + astro together (concurrently); CMS Save hot-reloads the real site. Open `/admin/index.html` + `/` |
| Local CMS only | `npm run cms` (decap-server) alongside `npm run dev` | `local_backend: true` bypasses OAuth |
| Build | `npm run build` | outputs `dist/` — **the primary quality gate; no unit-test or lint script** |
| Verify (Playwright) | `npm run verify:hero`, `npm run verify:reveals`, `npm run verify:a11y` | headless checks; **need the dev server running** on 4642 |
| Screenshots | `npm run screenshots` | regenerates `docs/screenshots/*.webp` (defaults to live domain; `BASE=http://localhost:4642` for local) |

## Deploy / publish

**Deploys are MANUAL, via the Netlify CLI. There is no CI** — pushing to GitHub does **not** publish the site (the old GitHub Actions workflow was removed; it never worked). Publishing = building locally and uploading `dist/`.

Prerequisites (already set up on the owner's machine): the Netlify CLI installed and authenticated as the site owner, and this repo linked to Netlify project `daniel-oliver-site`. Verify with `netlify status`.

**To publish the current working tree:**

```bash
npm run build
netlify deploy --prod --dir=dist
```

That builds to `dist/` and uploads it; the command prints the Production URL when live. Uses **no** GitHub Actions minutes and **no** Netlify build minutes (the build happens locally).

- If the CLI isn't linked: `netlify link` (team `dolivertech` → project `daniel-oliver-site`), or export `NETLIFY_SITE_ID`. The site id is also in `.netlify/state.json`.
- If not logged in: `netlify login`.

**CMS edits ≠ live.** When the owner publishes in `/admin`, Decap commits to the GitHub repo (editorial workflow → `cms/*` branch → merge to `main`). Because deploys are manual, **merging a CMS change to `main` does not update the live site** — someone must then run `npm run build && netlify deploy --prod --dir=dist`. (Alternatively, connect the repo in Netlify's UI for automatic Git-based builds — that uses Netlify's own build-minute pool, independent of GitHub Actions. Not currently enabled.)

## Custom domain — done

`danieloliverracing.com` is attached in Netlify (Domain management), SSL is provisioned, and `www`
301-redirects to the apex. Canonical, `og:url`, and `og:image` all derive from `Astro.site`, so they
resolve on the live domain automatically — there's no `publicOrigin` override to maintain anymore.

Remaining owner task (account-side, not code): **Google Search Console** — follow
`docs/SEARCH-CONSOLE.md` to verify the domain, submit `sitemap-index.xml`, and request indexing.

## Structure & the two content systems

```
src/
├── pages/          # index, about, contact, partnerships, schedule, 404,
│                   # blog/{index,[slug]}, news/{index,[slug]}, media/{index,[slug]}
├── components/     # Header (persistent, hamburger overlay), Footer, Signature,
│                   # RacingLines, AmbientAurora, Lightbox, SocialLinks, TrackMap, Flag
├── layouts/BaseLayout.astro   # SEO/OG/fonts + the site-wide motion runtime (one <script>)
├── content/        # SYSTEM 1 — Astro content collections (zod schemas in src/content.config.ts):
│   ├── posts/      #   blog posts (.md)
│   ├── news/       #   news posts (.md)
│   ├── galleries/  #   media galleries (.json)
│   └── events/     #   schedule entries (.md); status upcoming|completed, optional result/track
├── data/           # SYSTEM 2 — copy imported directly by pages:
│   ├── site.json   #   global singleton (nav, socials, sponsors, footer, brand logos)
│   ├── pages/*.json#   per-page copy (home, about, media, blog, schedule, partnerships, contact, notfound, news)
│   ├── tracks.json #   222 circuits (id, name, country, iso, flag, + SVG outline for ~34) — GENERATED, don't hand-edit
│   └── signature.json  # traced SVG path of Daniel's real autograph (see below)
└── styles/global.css   # Tailwind 4 @theme design system
public/admin/       # Decap CMS (index.html + config.yml — the CMS collection map)
public/images/      # hero/, galleries/, sponsors/, brand/, news/, og/, flags/, 2026/, uploads/ (CMS upload target)
scripts/            # build-tracks.mjs (data gen) + Playwright verification scripts (dev-only, not shipped)
```

**Every user-facing string/image is CMS-editable** — pages read from `src/data/**`, `.astro` files hold no hardcoded copy. **To change page text, edit the matching `src/data/pages/<page>.json`, not the `.astro`.** All of `data/**` and `content/**` are exposed to Decap as collections in `public/admin/config.yml`. If you add a field to a page, wire it into both the `.astro` and the CMS config.

## Design & motion system (deliberate — don't casually "simplify")

- **Vanilla JS + CSS only.** No React/client frameworks. Interactivity lives in `BaseLayout.astro`'s motion runtime + small per-component `<script>`s. Everything re-inits on `astro:page-load` (View Transitions via `<ClientRouter/>`) and tears down on `astro:before-swap`.
- **Respect `prefers-reduced-motion`** everywhere (static fallbacks). Animate transform/opacity/clip-path/mask only — no layout-affecting props (protect CLS).
- **Signature** (`Signature.astro` + `src/data/signature.json`): Daniel's **real autograph**, traced from a scan to one centreline SVG path. It "writes on" via a soft-edged left-to-right mask reveal driven by a `@property --sig-reveal` custom property. Replays on nav (header, persisted) and loops on the hero. To change the signature, re-trace a scan (autotrace `-centerline`) and replace `signature.json` — not a font.
- **Brand motion (credit-free):** `RacingLines.astro` (gradient racing-line beams + comets, in hero & menu), `AmbientAurora.astro` (fixed drifting glow behind every page), and `GalaxyField.astro` (site-wide animated starfield canvas: twinkling stars w/ parallax drift, glow-halo brights, occasional brand-tinted shooting star; reduced-motion renders once statically; re-inits on `astro:page-load`).
- ⚠️ **The ink background lives on `html` ONLY — never put an opaque background on `body`.** The fixed `z-index:-1` layers (GalaxyField, AmbientAurora, `bg-depth` washes) live in the ROOT stacking context (body is `position:relative` but `z-index:auto`, so it's not a stacking context) — an opaque body background paints OVER them and silently hides all of them (this happened; the aurora was invisible for weeks).
- **Hero** (`index.astro`): split layout at `lg+` (portrait right ~62%, type left) and **stacked** below `lg` so text never overlaps the face. `hero.video` (in `home.json`) is an optional CMS background-video slot; currently empty (poster/reduced-motion fallbacks wired).
- **Completed events** (`schedule.astro`): past events render as cards with a checkered-flag COMPLETED badge; `result` P1/P2/P3 → gold/silver/bronze medal via the `podium()` classifier.
- **Track maps + flags** (`TrackMap.astro`, `Flag.astro`, `src/lib/tracks.ts`, `src/data/tracks.json`): events **and news/blog posts** have an optional `track` id (CMS dropdown, 222 options). `trackById()` resolves it to a country flag + a projected SVG circuit outline. Events show it as a corner overlay + flag in the meta line; posts show an outline+flag+name panel in the header. Flags are **SVG images** in `public/images/flags/{iso}.svg` via `Flag.astro` — **not emoji** (emoji flags render as "US"/"GB" on Windows). `tracks.json` is regenerated from the sibling `track-manager-pro` repo via `node scripts/build-tracks.mjs` — don't hand-edit it. `TrackMap` defaults to a corner overlay (`position:absolute` inline, to beat the `.card > *{position:relative}` rule); pass **`inline`** to render it in normal flow.
- **Social share card:** default OG/Twitter image is `public/images/og/og-default.jpg` (1200×630 branded JPG). It was generated by screenshotting a temporary `og-card.astro` page with Playwright — re-create that page and re-shoot to update it (emoji flags / WebP don't preview reliably, hence a baked JPG). Per-page covers (posts/galleries) override it via the `ogImage` prop.
- **Article images:** in post bodies, `<figure><img/><figcaption/></figure>` renders styled via `.prose-dark` (rounded, bordered, slight breakout wider than text). Add `class="logos"` to a figure for a centred white logo-lockup card.

## Gotchas (hard-won — read before touching)

- **Scroll-reveal uses `threshold: 0`, not a ratio.** `.reveal-clip` starts at `clip-path: inset(0 0 100%)`, which pins IntersectionObserver `intersectionRatio` to 0 in Chromium — a ratio threshold never fires and images stay invisible. `entry.isIntersecting` (geometry) is what works. `npm run verify:reveals` guards this.
- **Hero must never cover the face.** `scripts/verify-hero.mjs` projects the face box through the live object-fit geometry across 9 viewports and asserts no hero text overlaps it. Run it after hero layout changes.
- **ImageMagick here has no Freetype/rsvg delegate** — it can't render text labels or rasterize SVG. Use Playwright to render/screenshot SVG or text.
- **Playwright scripts must run from the project dir** (not `/tmp`) so the `playwright` module resolves.
- `dist/`, `.netlify/`, `node_modules/` are gitignored — never edit build output.

## Auth & config

- **CMS login: GitHub OAuth — working.** `backend: github`, repo `DOlivertech/daniel-oliver-site`, private → the owner (DOlivertech) is the only person who can log in. A GitHub OAuth app (callback `https://api.netlify.com/auth/done`) is installed in Netlify, which brokers the handshake; the client secret lives only in Netlify's dashboard. Editorial workflow is on (drafts land on `cms/*` branches).
- `netlify.toml`: publish `dist`, Node 20, `X-Frame-Options: SAMEORIGIN` on `/admin/*`. (`/store` is an on-site coming-soon page — the old external Squarespace redirect was removed; it would have looped once the custom domain points here.)
- No env vars needed to build/run locally.

## Conventions

- The old `#25` car-number branding was intentionally **removed** throughout — don't reintroduce it.
- Site copy is **third person** (media-agent voice), never "I/my".
- Sponsor entries in `src/data/site.json` are logos only.
- Commit style: descriptive multi-line messages with a `Co-Authored-By:` trailer.
- `docs/EDITING.md` is the owner-facing, plain-English CMS guide — keep it in sync with the collections.
