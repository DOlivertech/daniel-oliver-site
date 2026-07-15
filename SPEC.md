# Daniel Oliver Racing — Site Build Spec

Modern personal site for racing driver **Daniel Oliver** (#25), replacing the current Squarespace site
(danieloliverracing.com). Inspired by landonorris.com: bold display typography, premium full-bleed
photography, an animated hamburger overlay menu, a signature as a branding element, smooth section flow.

## Stack (already installed)
- Astro 5 (static output), Tailwind CSS 4 via `@tailwindcss/vite`
- Decap CMS at `/admin` (CDN script build; `local_backend: true` for local editing via `npm run cms`)
- Deploy target: Netlify static (`netlify.toml`, publish `dist`)
- No React/heavy frameworks. Animations = CSS + small vanilla JS (IntersectionObserver etc).

## Brand / design system
- Dark base: near-black navy (#0b0b14 range), subtle grain/gradient depth. Light text.
- Accents pulled from his actual livery + suit: **hot pink (#ff2d87-ish), electric cyan/blue (#38bdf8-ish), violet (#8b5cf6-ish)**. Use gradient sweeps (pink→purple→cyan) for headings, glows, rules, hover states. Attractive, not vaporwave-kitsch — think premium motorsport brand.
- Display font: a bold modern face (e.g. `Unbounded`, `Space Grotesk` or `Archivo` black weights, via Google Fonts). Body: clean sans (Inter or Space Grotesk).
- Signature: cursive font (e.g. `Mr Dafoe` or `Great Vibes`) rendering "Daniel Oliver" as an SVG `<text>` with stroke-dasharray **handwriting draw-on animation** on page load (stroke draws, then fill fades in). Used in hero + footer. Respect `prefers-reduced-motion` everywhere (fall back to visible static state).
- Recurring motifs: `#25` in pink, `DO` monogram, thin gradient rules, chevron/racing-line accents.

## Facts (source: current site — do not invent beyond this)
- Racing driver & software engineer. No family racing pedigree; came from sim racing + engineering.
- Earned an FIA international racing license within ~6 months of starting, with multiple wins.
- Approach: "every lap is a dataset, every mistake an experiment" — data-driven, sim-to-real methodology.
- **2026: IMSA VP Racing SportsCar Challenge debut** (endurance rounds with a co-driver) — this is the marquee announcement.
- Races a **Praga** prototype in UK events (Brands Hatch, Silverstone) — see galleries.
- Project Limit Break / Limit Break Engineering: his initiative — student exposure program at IMSA race
  weekends (students work alongside engineers/strategists/media/mechanics) + sim-to-real driver coaching.
- Partners: Race Control, Elite Detail Pros, Monza Detail Works, Nick's Auto Transport, Demia Motorsports,
  Sim Racing Nation, PLB SimToReal, Forseti. Logos in `public/images/sponsors/` (webp).
- Socials: Instagram `@daniel.oliver25`, YouTube `@DanielOliverRacing`, TikTok `@danieloliverracing`.
- Contact: via the site's contact form. Partnership pitch: "more than a logo on a car — building a story together"; TV + digital exposure, media production, trackside presence.
- Store: external link to https://www.danieloliverracing.com/store (do not build a store).

## Images (already downloaded, all .webp, in `public/images/`)
- `hero/` — 4 hero-grade shots (emsphotocam-1 = portrait sitting on Praga in pink/blue suit; brands-hatch-06/37/39 = car action shots).
- `galleries/silverstone-national-equipe-sports/` (7), `galleries/praga-brands-hatch/` (19),
  `galleries/praga-brands-hatch-uk-tour/` (59), `galleries/praga-silverstone-gp/` (38).
- `sponsors/` — 8 logos (white-on-transparent mostly; display on dark, normalize with consistent height, subtle hover lift/brighten).
- `build/` — Project Limit Break build/paddock shots.
- Enumerate actual filenames with `ls` when seeding content.

## Pages
1. `/` Home:
   - Full-viewport hero: photo, name in huge display type, "Racing Driver × Software Engineer" line, animated signature, #25, scroll cue, CTA to schedule/partnerships.
   - Quick-stats strip (FIA International License · Multiple Wins · IMSA VP Challenge 2026 · Praga Cup UK).
   - About teaser (photo + short bio → /about).
   - "Sim → Real" section: his tech/engineering angle (data-driven, telemetry, sim training). Give it a techy treatment (mono font details, subtle grid/telemetry-line SVG animation).
   - Next race / calendar preview (from events collection) → /schedule.
   - Media: gallery cards (cover + count) → /media.
   - Latest blog posts (2–3 cards) → /blog.
   - Partners marquee (infinite scroll logo loop, pauses on hover).
2. `/about` — full bio narrative (write ~4 short sections from the facts: origins/no pedigree, sim-to-real leap in 6 months, the engineering mindset, what's next: IMSA 2026 + Project Limit Break).
3. `/media` + `/media/[slug]` — gallery index and detail w/ responsive masonry-ish grid, lightbox (vanilla JS: click to open, arrows/keys/swipe, close).
4. `/blog` + `/blog/[slug]` — markdown posts, tags, prose styling on dark.
5. `/schedule` — season calendar: upcoming (highlight next event with countdown timer JS) + past with results.
6. `/partnerships` — pitch copy from facts, what partners get, partner logo grid, CTA email + link to deck placeholder.
7. `/contact` — email CTA, socials, Netlify form (`data-netlify="true"`) for inquiries.
8. `404` — on-brand ("off track").

## Global components
- Fixed translucent-blur header: monogram/wordmark left, hamburger right (animated 3-line → X). Full-screen overlay menu: gradient/dark backdrop, big staggered slide-in links (Home, About, Media, Blog, Schedule, Partnerships, Store↗, Contact) + socials + signature small. Body scroll locked while open; Escape closes.
- Footer: signature (static small), nav links, socials, **sponsor logo grid** (all 8, linked), "Partner with Daniel" CTA, copyright. This is the sponsor home — make it feel curated, not an afterthought.
- Scroll-reveal utility (IntersectionObserver adds class; CSS transitions; stagger via delay custom property).
- SEO: per-page titles/descriptions, OG tags using hero image, favicon (simple `25`/`DO` SVG in brand gradient).

## Content collections (`src/content/`, Astro glob loaders + zod schemas in `src/content.config.ts`)
- `posts/*.md` — title, date, excerpt, cover (optional), tags, draft. Seed 3 posts from real facts: IMSA 2026 announcement; "From sim to grid in six months"; "Why I treat every lap as a dataset". 150–300 words each, honest tone, no invented results.
- `galleries/*.md` (or json) — title, date, cover, images[]. Seed the 4 real galleries (titles: "Silverstone National — Equipe Sports", "Praga at Brands Hatch", "Brands Hatch — UK Tour Finale", "Silverstone GP — Praga Cup"); enumerate real files.
- `events/*.md` — title, date, circuit, location, series, status (upcoming/completed), result?, link?. Seed: 2025 past events matching the galleries (series "Praga Cup UK", results left as "—" or omitted) + 2026 IMSA VP Racing SportsCar Challenge entries as upcoming TBA (e.g. "Season opener — TBA").
- `data/site.json` — singleton: name, tagline, heroImage, heroHeadline, bioShort, email, socials{}, storeUrl, sponsors[{name, logo, url}]. Everything the layout reads should come from here so the CMS can edit it.

## Decap CMS (`public/admin/`)
- `index.html` loading decap-cms via CDN; `config.yml`: `backend: git-gateway`, `local_backend: true`, `media_folder: public/images/uploads`, `public_folder: /images/uploads`; collections mirroring the above (posts, galleries, events, and a "Site Settings" file collection for site.json). Editorial workflow on.
- README section: how to run locally (`npm run dev` + `npm run cms` → localhost:4321/admin), how to enable on Netlify (Identity + Git Gateway, invite user), how to deploy (connect repo, build `npm run build`, publish `dist`).

## Quality bar
- `npm run build` must pass clean; check output for all pages.
- Fully responsive 375px→1440px; hamburger is the only nav on all sizes (Lando-style) — desktop gets the same overlay.
- Lighthouse-conscious: lazy-load gallery images, `loading="eager"` + `fetchpriority` only for hero, explicit width/height or aspect ratios to avoid CLS.
- No console errors. Keyboard accessible (menu focus trap, lightbox Esc/arrows, skip link).
