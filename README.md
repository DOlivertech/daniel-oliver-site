# Daniel Oliver Racing — danieloliverracing.com

Personal site for racing driver **Daniel Oliver** (#25). Built with **Astro 5** + **Tailwind CSS 4**,
content managed via **Decap CMS**, deployed as a static site on **Netlify**.

> No idols. Outwork everyone.

## Stack

- [Astro 5](https://astro.build) — static output, content collections (glob loaders + zod schemas)
- [Tailwind CSS 4](https://tailwindcss.com) — via `@tailwindcss/vite`, theme defined in `src/styles/global.css`
- [Decap CMS](https://decapcms.org) — `/admin`, git-gateway backend, editorial workflow
- Vanilla JS only (menu, lightbox, countdown, scroll reveals) — no client frameworks

## Local development

```bash
npm install
npm run dev        # dev server → http://localhost:4642
```

### Editing content locally with the CMS

Run both in separate terminals:

```bash
npm run dev        # Astro dev server (port 4642)
npm run cms        # decap-server (local git proxy for Decap)
```

Then open **http://localhost:4642/admin**. Because `local_backend: true` is set in
`public/admin/config.yml`, the CMS writes directly to your working tree — commit the
changes with git as usual.

### Build

```bash
npm run build      # outputs static site to dist/
npm run preview    # serve the production build locally
```

## Content model

| Collection | Location | Notes |
|---|---|---|
| Blog posts | `src/content/posts/*.md` | title, date, excerpt, cover, tags, draft |
| Galleries | `src/content/galleries/*.json` | title, date, location, cover, images[] |
| Events | `src/content/events/*.md` | circuit, series, status (upcoming/completed), result, link |
| Site settings | `src/data/site.json` | name, tagline, hero, socials, sponsors — everything the layout reads |

Images live in `public/images/` (galleries, sponsors, hero, brand, build). CMS uploads go
to `public/images/uploads`.

## Deploying to Netlify

1. Push this repo to GitHub/GitLab.
2. In Netlify: **Add new site → Import an existing project**, pick the repo.
   - Build command: `npm run build`
   - Publish directory: `dist`
   (Both are already set in `netlify.toml`.)
3. Deploy. The contact form works automatically (`data-netlify="true"`).

### Enabling the CMS on Netlify

1. Site settings → **Identity** → Enable Identity.
2. Identity → **Registration**: set to *Invite only*.
3. Identity → **Services** → Enable **Git Gateway**.
4. Identity → **Invite users** → invite Daniel's email; he sets a password from the invite link.
5. Log in at `https://<your-site>/admin`.

The CMS uses **editorial workflow**: changes land as draft PRs you can review before publishing.

## Project structure

```
src/
  components/    Header (hamburger + overlay menu), Footer, Signature, Lightbox, SocialLinks
  layouts/       BaseLayout.astro (SEO, fonts, scroll-reveal)
  pages/         index, about, media(+[slug]), blog(+[slug]), schedule, partnerships, contact, 404
  content/       posts/, galleries/, events/ (collections)
  data/          site.json (CMS-editable singleton)
  styles/        global.css (Tailwind 4 @theme, design system)
public/
  admin/         Decap CMS (index.html + config.yml)
  images/        hero/, galleries/, sponsors/, brand/, build/, uploads/
```
