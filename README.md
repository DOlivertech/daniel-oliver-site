# Daniel Oliver Racing — danieloliverracing.com

Personal site for racing driver **Daniel Oliver** (#25). Built with **Astro 5** + **Tailwind CSS 4**,
content managed via **Decap CMS**, deployed as a static site on **Netlify**.

> No idols. Outwork everyone.

📝 **Editing the site?** See [`docs/EDITING.md`](docs/EDITING.md) — a plain-English guide to the CMS.

## Stack

- [Astro 5](https://astro.build) — static output, content collections (glob loaders + zod schemas)
- [Tailwind CSS 4](https://tailwindcss.com) — via `@tailwindcss/vite`, theme defined in `src/styles/global.css`
- [Decap CMS](https://decapcms.org) — `/admin`, GitHub OAuth backend, editorial workflow
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

### Enabling the CMS on Netlify (GitHub OAuth)

Auth is handled by **GitHub OAuth**, with Netlify brokering the token exchange. You never
store or host a credential — the one secret (a GitHub OAuth app's client secret) is pasted
into Netlify's dashboard once and lives there. **Who can log in = who has push access to the
GitHub repo.** To add or remove an editor, add/remove them as a repo collaborator.

**One-time setup:**

1. **Point the CMS at your repo.** In `public/admin/config.yml`, set `backend.repo` to your
   real `owner/repository` (e.g. `danieloliver/danieloliver-racing`).

2. **Create a GitHub OAuth app.** GitHub → **Settings → Developer settings → OAuth Apps →
   New OAuth App**:
   - *Application name:* `Daniel Oliver Racing CMS`
   - *Homepage URL:* your site (e.g. `https://danieloliverracing.com`)
   - *Authorization callback URL:* `https://api.netlify.com/auth/done`  ← must be exactly this
   - Register, then copy the **Client ID** and generate a **Client Secret**.

3. **Give the credentials to Netlify.** Netlify site → **Site configuration → Access &
   security → OAuth** (older UI: *Site settings → Access control → OAuth*) → **Install
   provider → GitHub**, paste the Client ID + Secret, save. Netlify stores the secret; it
   never touches the repo.

4. **Log in** at `https://<your-site>/admin` → **Login with GitHub** → authorize. Done.

**Adding editors:** add them as collaborators on the GitHub repo (Settings → Collaborators).
Each editor needs a GitHub account — if you want non-technical people editing, have them make
a free GitHub account and add them as collaborators; that's the whole process.

The CMS uses **editorial workflow**: changes land as draft PRs on a `cms/*` branch you can
review before publishing, and each publish triggers a Netlify redeploy.

> **Why not "Login with Google/Discord"?** Decap writes your edits straight to the git repo,
> so the logged-in user needs git access — which GitHub provides and Google/Discord don't.
> Social logins would require Netlify Identity + Git Gateway as a server-side git proxy, and
> Netlify Identity is now in maintenance mode, so GitHub OAuth is the durable choice.

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
