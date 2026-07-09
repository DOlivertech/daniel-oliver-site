# Editing your site — a plain-English guide

Your whole site is editable from a friendly admin panel. There's **no code involved** — you
fill in fields and click Publish. This guide covers both ways to edit and what every part does.

There are two ways in:

- **Locally** (on your Mac, offline) — fastest, no login. Best for big edits.
- **Live** (from any browser, logged in with GitHub) — edit from anywhere, even your phone.

---

## Option A — Edit locally with **live preview** (no login needed)

Open Terminal, go to the project folder, and run **one** command:

```bash
npm run edit     # starts the editor + the live website together
```

Then open two tabs in your browser:

- **http://localhost:4642/admin/index.html** — the editor
- **http://localhost:4642** — your real website

You'll go straight into the editor (no login locally). **Every time you Save in the CMS, the
website tab refreshes itself with your change** — so you see exactly how it'll look, on the
real site, as you go. (Save shows the preview; Publish/commit is what makes it public.)

Press `Ctrl + C` in the Terminal to stop both when you're done.

To make your local edits live afterwards:

```bash
git add -A
git commit -m "Update content"
git push
```

That push publishes them (see "How publishing works" below).

> Tips: the `/index.html` matters **only** locally — on the live site it's just `/admin`.
> If you'd rather run the two pieces separately, `npm run dev` (website) and `npm run cms`
> (editor's save engine) in two tabs does the same thing.

---

## Option B — Edit the live site (login with GitHub)

Once the site is deployed and OAuth is set up (one-time steps in the main README):

1. Go to **https://your-site-address/admin**
2. Click **Login with GitHub** and authorize.
3. Edit, then click **Publish**. Your change goes live automatically in a minute or two.

Because the repo is private and you're the only person on it, **you are the only one who can
ever log in.** Nothing to manage.

---

## The editor, section by section

When you open the admin you'll see these groups in the left sidebar:

### Pages
One entry per page — **Home, About, Media, Blog, Schedule, Partnerships, Contact, 404.**
Open any page and you can change **every** heading, paragraph, button label, and image on it.
For example, open **Home Page** to swap the big hero photo, rewrite the intro, or edit the
three "Sim → Real" method cards and the stats strip.

### Blog Posts
Your news/journal. Click **＋ New Blog Posts** to write one. Fields:
- **Title**, **Date**, **Excerpt** (the short teaser on cards)
- **Cover Image** (optional)
- **Tags** (optional)
- **Draft** — flip this ON to save without showing it publicly yet
- **Body** — the article, with a rich text toolbar

### Galleries
Your photo albums (they show up under **Media**). Each gallery has a **Title**, **Date**,
**Location**, a **Cover Image**, and an **Images** list. To add photos, click **＋** under
Images and upload — drag to reorder. The lightbox and photo counts update themselves.

### Events
Your race calendar (drives the **Schedule** page and the "next race" countdown). Each event has:
- **Title**, **Date**, and an optional **Date label** (use this for vague dates like `TBA · 2026`)
- **Circuit**, **Location**, **Series**
- **Track** (optional dropdown) — pick the circuit here and the card automatically shows that
  track's **country flag** and, where available, a **drawn track-map outline** in the corner. The
  chosen track's name also becomes the displayed circuit name. Leave it blank to just use the free-text
  **Circuit** field with no flag or map.
- **Status** — `upcoming` or `completed`
- **Result** (optional, for past races) and **Link** (optional, e.g. to a gallery)

The homepage automatically shows the soonest `upcoming` event with a live countdown, and the
Schedule page splits everything into Upcoming vs. Past. Not every track in the dropdown has a drawn
map (about 30 do) — the rest still show the country flag.

### Site Settings
Global things that appear on **every** page — edit once, changes everywhere:
- Your **name, race number, tagline, contact email**
- The **signature text** that gets hand-drawn in the hero and footer
- **Brand logos**, the **navigation menu** links, **social** links
- Your **sponsors** list — name, logo, and link for each. Add or remove sponsors here and
  the footer grid + homepage marquee update automatically.

---

## Working with images

- Anywhere you see an image field, click it to either **upload a new file** or pick one from
  the **media library** of images already in the site.
- Uploaded images land in `public/images/uploads`.
- Prefer web-friendly files (`.webp`, `.jpg`, or `.png`). Very large photos are fine but
  smaller files load faster — around 2000px wide is plenty.

---

## How publishing works (and how to undo)

This site uses an **editorial workflow**, so nothing goes live by accident:

- **Locally:** your edits become file changes; they go live when you `git push`.
- **Live editor:** **Publish** merges the change and the site rebuilds automatically (~1–2 min).

Every change is saved in git history, so **anything can be rolled back**. If something looks
wrong, you (or anyone helping you) can revert to the previous version — nothing is ever truly
lost.

---

## Quick "how do I…" cheatsheet

| I want to… | Where to go |
|---|---|
| Post an update / news | **Blog Posts → ＋ New** |
| Add race photos | **Galleries** → open one, or ＋ New, add to **Images** |
| Add / change a race on the calendar | **Events** |
| Change the big homepage photo or intro | **Pages → Home Page → Hero** |
| Add or remove a sponsor logo | **Site Settings → Sponsors** |
| Update your bio | **Pages → About Page** |
| Change your email or social links | **Site Settings** |
| Rewrite the partnerships pitch | **Pages → Partnerships Page** |

---

Stuck? Everything is stored as plain files in the repo, so any developer can help you out, and
every past version is recoverable from git history.
