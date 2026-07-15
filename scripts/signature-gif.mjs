// Capture the signature write-on as GIF frames by stepping the --sig-reveal
// custom property deterministically (instead of racing the CSS transition), so
// the result is smooth and reproducible. Assembled into a GIF by magick.
//
// Usage: BASE=http://localhost:4642 node scripts/signature-gif.mjs
//   env: BASE  (default: live site)
//        TONE  gradient|mono  (which page/instance)   default gradient
// Output: docs/screenshots/signature-<tone>.frames/*.png  (assembled by caller)
import { chromium } from 'playwright';
import { mkdirSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const BASE = process.env.BASE ?? 'https://danieloliverracing.com';
const TONE = process.env.TONE ?? 'gradient';
const FRAMES = 52;          // steps across the write-on
const PAD = 60;             // px around the mark to keep the soft glow
const OUTDIR = `docs/screenshots/signature-${TONE}.frames`;

rmSync(OUTDIR, { recursive: true, force: true });
mkdirSync(OUTDIR, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1200, height: 720 },
  deviceScaleFactor: 2,
  colorScheme: 'dark',
  // NOT reduced-motion — we want the animated instance.
});
const page = await ctx.newPage();

// /about closing has the cinematic gradient signature (animate + glow).
await page.goto(`${BASE}/about`, { waitUntil: 'networkidle' });

// The cinematic gradient instance (the /about closing mark), not the small
// quick header signature which is also data-sig-animate.
const sig = page.locator('svg.signature[data-sig-animate][data-sig-speed="cinematic"]').first();
await sig.scrollIntoViewIfNeeded();
await page.waitForTimeout(400);

// Freeze the transition so we control each frame exactly.
await sig.evaluate((el) => { el.style.transition = 'none'; });

// Clip to the actual ink (the <path>'s rendered rect), not the SVG element
// box — the SVG's viewBox leaves empty space that would frame the mark oddly.
const box = await sig.locator('.sig-path').evaluate((p) => {
  const r = p.getBoundingClientRect();
  return { x: r.x, y: r.y, width: r.width, height: r.height };
});
const clip = {
  x: Math.max(0, box.x - PAD),
  y: Math.max(0, box.y - PAD),
  width: Math.min(1200 - Math.max(0, box.x - PAD), box.width + PAD * 2),
  height: Math.min(720 - Math.max(0, box.y - PAD), box.height + PAD * 2),
};

// Isolate the mark: solid ink page, hide the galaxy canvas + aurora + the
// signature's sibling copy/buttons, so only the mark and its glow remain.
await sig.evaluate((el) => {
  document.documentElement.style.background = '#0b0b14';
  document.body.style.background = '#0b0b14';
  document.querySelectorAll('canvas').forEach((c) => (c.style.display = 'none'));
  document
    .querySelectorAll('[class*="aurora" i],[class*="ambient" i],.scroll-progress')
    .forEach((e) => (e.style.display = 'none'));
  const section = el.closest('section');
  if (section) {
    section.style.background = '#0b0b14';
    section.querySelectorAll(':scope > *').forEach((ch) => {
      if (!ch.contains(el)) ch.style.visibility = 'hidden';
    });
  }
});

// -8 (fully un-written) → 120 (fully written), matching the component.
for (let i = 0; i <= FRAMES; i++) {
  const v = -8 + (128 * i) / FRAMES;
  await sig.evaluate((el, val) => {
    el.style.setProperty('--sig-reveal', String(val));
  }, v);
  const n = String(i).padStart(3, '0');
  await page.screenshot({ path: `${OUTDIR}/f${n}.png`, clip });
}

await browser.close();
console.log(`captured ${FRAMES + 1} frames → ${OUTDIR}`);

// Assemble the frames into an optimized, looping GIF (draw + ~2.2s end-hold),
// then discard the frames. Requires ImageMagick (`magick`) on PATH.
const gif = `docs/screenshots/signature-write-on.gif`;
execFileSync('magick', [
  '-delay', '4', '-loop', '0',
  `${OUTDIR}/f*.png`,
  '(', '-clone', '-1', '-set', 'delay', '220', ')',
  '-resize', '760x',
  '-layers', 'OptimizePlus',
  '-fuzz', '3%',
  gif,
], { stdio: 'inherit' });
rmSync(OUTDIR, { recursive: true, force: true });
console.log(`wrote ${gif}`);
