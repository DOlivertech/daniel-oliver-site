# Daniel Oliver Racing

Personal site for racing driver **Daniel Oliver**. Built with **Astro 5** + **Tailwind CSS 4**,
content managed via **Decap CMS**, hosted on **Netlify**.

> No idols. Outwork everyone.

- **Live:** https://daniel-oliver-site.netlify.app
- **Prod domain (planned):** `danieloliverracing.com` — see [Going to production](#going-to-production).

📝 **Just want to edit content?** See **[docs/EDITING.md](docs/EDITING.md)** — a plain-English guide.

## Stack

- [Astro 5](https://astro.build) — static output, content collections (glob loaders + zod schemas)
- [Tailwind CSS 4](https://tailwindcss.com) — via `@tailwindcss/vite`, theme in `src/styles/global.css`
- [Decap CMS](https://decapcms.org) — `/admin`, GitHub OAuth backend, editorial workflow
- Vanilla JS + CSS only for motion (View Transitions, scroll reveals, an animated real-signature
  write-on, racing-line/aurora ambience) — no client frameworks

## Local development

```bash
npm install
npm run dev          # site → http://localhost:4642  (custom port, not 4321)
npm run build        # production build → dist/
npm run preview      # serve the production build
```

### Editing content locally (with live preview)

```bash
npm run edit         # starts the CMS + the site together
```

Open **http://localhost:4642/admin/index.html** (editor) and **http://localhost:4642** (site).
`local_backend: true` means no login locally and the CMS writes straight to your working tree —
**every Save hot-reloads the site tab**, so you preview the real, styled result as you go.
Commit + push to publish. (`Ctrl+C` stops both. Prefer two tabs? `npm run dev` + `npm run cms`.)

## Content model

Everything user-facing is CMS-editable; pages read from `src/data/**` (no hardcoded copy).

| Collection | Location | Notes |
|---|---|---|
| Blog posts | `src/content/posts/*.md` | title, date, excerpt, cover, tags, draft, body |
| Galleries | `src/content/galleries/*.json` | title, date, location, cover, images[] |
| Events | `src/content/events/*.md` | circuit, series, `status: upcoming\|completed`, `result` (P1/P2/P3 → medal), link |
| Site settings | `src/data/site.json` | name, tagline, nav, socials, sponsors, footer, brand logos |
| Pages | `src/data/pages/*.json` | per-page copy + images (home, about, media, blog, schedule, partnerships, contact, 404) |

Images live in `public/images/`; CMS uploads go to `public/images/uploads`. The hero can take an
optional background **video** (`home.json` → `hero.video`) layered over the still — currently unused.

## Deployment

The site is live on Netlify (`daniel-oliver-site`). **Deploys are manual via the Netlify CLI —
there is no CI, and pushing to GitHub does _not_ publish the site:**

```bash
npm run build
netlify deploy --prod --dir=dist
```

This builds locally and uploads `dist/` (no GitHub Actions / Netlify build minutes used). Because
it's manual, **CMS edits merged to `main` don't go live until someone runs the command above.**

Optional: connect the repo in Netlify's UI for automatic Git-based builds (Netlify's own build
minutes, independent of GitHub Actions) — not currently enabled.

**Going live on `danieloliverracing.com`:** add the domain in Netlify → Domain management, point DNS,
wait for SSL; then update `publicOrigin` in `src/layouts/BaseLayout.astro` and redeploy; then do
`docs/SEARCH-CONSOLE.md`. Full checklist in **[AGENTS.md](AGENTS.md)**.

## CMS login (GitHub OAuth) — ✅ set up

Login uses **GitHub OAuth**, with Netlify brokering the token exchange (the client secret lives only
in Netlify's dashboard, never in the repo). The repo is **private**, so **who can log in = repo
collaborators** — currently just the owner (`DOlivertech`).

- Log in: `https://<site>/admin` → **Login with GitHub** → authorize.
- The one-time OAuth app + Netlify install is already done. It's **domain-independent** (the callback
  is `https://api.netlify.com/auth/done`), so moving to the custom domain needs no OAuth changes.
- **Add an editor:** add them as a collaborator on `DOlivertech/daniel-oliver-site` (they need a
  GitHub account). Remove access by removing the collaborator.
- **Why not "Login with Google"?** Decap commits straight to git, so the login must grant git access —
  GitHub does, Google can't (it would require the deprecated Netlify Identity + Git Gateway).

Editorial workflow is on: edits land as drafts on `cms/*` branches to review, then Publish.

## Going to production

To launch on `danieloliverracing.com`:

1. In Netlify → **Domain management**, add `danieloliverracing.com` (and `www`) and follow the DNS steps.
2. That's it for code — `astro.config.mjs` `site` and the CMS `site_url` already point at the prod
   domain, and the GitHub OAuth login keeps working unchanged.

## Verification (Playwright)

Dev-only regression checks (require the dev server running on 4642):

```bash
npm run verify:hero      # asserts hero text never overlaps the face across 9 viewports
npm run verify:reveals   # asserts every scroll-reveal section image actually appears
```

## Project structure

```
src/
  components/   Header (persistent hamburger overlay), Footer, Signature (real autograph write-on),
                RacingLines, AmbientAurora, Lightbox, SocialLinks
  layouts/      BaseLayout.astro — SEO/fonts + the site-wide motion runtime
  pages/        index, about, media(+[slug]), blog(+[slug]), schedule, partnerships, contact, 404
  content/      posts/, galleries/, events/  (Astro collections)
  data/         site.json, pages/*.json (CMS-editable copy), signature.json (traced autograph)
  styles/       global.css (Tailwind 4 @theme design system)
public/
  admin/        Decap CMS (index.html + config.yml)
  images/       hero/, galleries/, sponsors/, brand/, build/, 2026/, uploads/
scripts/        Playwright verification (dev-only)
```
