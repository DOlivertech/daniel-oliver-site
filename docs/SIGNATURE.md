# The animated signature

The site's signature "writes itself" on — a real autograph drawn on left-to-right like a pen moving
across the page.

![Signature write-on](screenshots/signature-write-on.gif)

This guide explains **how it works** and **how to swap in your own signature** for a template of the
site. There's no drawing library and no per-frame animation — it's one SVG path plus a moving CSS
mask, so it stays razor-sharp at any size and falls back gracefully.

---

## How the animation works

The mark is a single SVG `<path>` (a traced centreline of a real signature). The
[`Signature`](../src/components/Signature.astro) component draws it with a **soft-edged mask that
sweeps left → right**:

- A CSS custom property `--sig-reveal` (0–100) is the position of the "wet pen tip".
- Everything left of it is opaque ink; a ~7% band fades to transparent at the tip.
- On load, the component transitions `--sig-reveal` from off-screen-left to fully-written over
  ~2.6s (`cinematic`) or ~1.4s (`quick`). That reads as the signature being written.

> **Why left-to-right ordering matters:** the reveal is a straight horizontal wipe — it does **not**
> follow the pen along the curve. It looks like real writing only because the path's strokes are
> ordered by ascending x. Keep that in mind when preparing your own (see step 3).

**Accessibility:** with `prefers-reduced-motion: reduce` or no JavaScript, the mask jumps to fully
written — the finished signature shows immediately, never a blank space.

### Using it in a page

```astro
---
import Signature from '../components/Signature.astro';
---
<Signature animate glow tone="gradient" class="mx-auto w-[min(72vw,28rem)]" />
```

| Prop | Values | Meaning |
|---|---|---|
| `animate` | boolean | play the write-on (otherwise it's just drawn) |
| `speed` | `cinematic` \| `quick` | hand speed — ~2.6s hero vs ~1.4s header |
| `tone` | `gradient` \| `mono` | pink→violet→cyan, or solid white |
| `glow` | boolean | soft brand glow that gently breathes |
| `loop` | boolean | re-write itself periodically while on screen |

---

## Swap in your own signature

The whole mark lives in one data file — [`src/data/signature.json`](../src/data/signature.json).
Replace its contents and every `<Signature>` on the site updates. No component edits needed.

```json
{
  "d": "M270 89L258 120 …",       // the SVG path data
  "viewBox": "0 0 1601.4 807.3",  // from your traced SVG's root
  "translate": [-0.64, 1.0],      // optional nudge to centre the ink
  "subpaths": 16                   // informational (stroke count)
}
```

### 1. Get a clean signature image

Sign on **white paper with a bold marker** (a Sharpie beats a ballpoint — thick, even strokes).
Scan or photograph it straight-on, crop tight, and boost contrast to near pure black-on-white.
Bigger is better: more resolution → smoother curves.

### 2. Trace it to a single **centreline** path

You want a *centreline* trace (one line following the pen), **not** an outline trace (which gives a
double-edged filled blob).

- **Inkscape:** `Path → Trace Bitmap → Centerline tracing`. Then tidy up:
  `Path → Simplify` (Ctrl+L) to cut node count, and `Path → Combine` (Ctrl+K) to merge the strokes
  into one `<path>`. Save as Plain SVG.
- **CLI alternative:** [`autotrace`](https://github.com/autotrace/autotrace) —
  `autotrace -centerline -output-format svg signature.png > signature.svg`.

### 3. Order strokes left → right

Open the SVG and look at the `d` attribute. Each `M` starts a new sub-stroke.

- One continuous stroke? You're done.
- Separate strokes (a disconnected dot, a cross, a detached first letter)? Reorder the `M…` segments
  so their **starting x increases** left to right. This is what makes the wipe look like writing
  rather than a curtain reveal. (Daniel's mark is 16 strokes sorted this way.)

### 4. Fill in `signature.json`

- **`d`** — paste the path's `d` value.
- **`viewBox`** — copy from the traced SVG's root `<svg viewBox="…">`.
- **`translate`** — usually `[0, 0]`; nudge if the ink sits off-centre in the viewBox.
- **`subpaths`** — the count of `M` commands (informational).

If your line weight looks too thin/thick, adjust `stroke-width` in
[`Signature.astro`](../src/components/Signature.astro) (default `6.5`, in viewBox units).

### 5. Preview and capture a GIF

```bash
npm run dev              # view any page with <Signature animate />
npm run signature:gif    # regenerate docs/screenshots/signature-write-on.gif
```

`npm run signature:gif` drives the reveal frame-by-frame with Playwright and assembles the GIF with
ImageMagick (`magick`), then cleans up the frames. Point it at a local build with
`BASE=http://localhost:4642 npm run signature:gif`.
