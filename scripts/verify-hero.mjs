// Verify: no hero text ever overlaps the face across a matrix of viewports.
// The face box is defined in SOURCE-image coordinates (2000x3000) and projected
// to screen space through the <img>'s actual object-fit:cover + object-position
// geometry, so the check is exact for any crop the CSS produces.
import { chromium } from 'playwright';

const URL = 'http://localhost:4642/';
// Face region in source px (eyes/glasses → chin, incl. a small margin).
// Coords are for the current hero image (hero-pitwall.webp, 1365x2048).
const FACE_SRC = { x1: 780, y1: 320, x2: 1010, y2: 620 };
const SRC_W = 1365, SRC_H = 2048;

const VIEWPORTS = [
  ['iPhone SE',        375,  667],
  ['iPhone 14',        390,  844],
  ['iPhone 15 ProMax', 430,  932],
  ['Pixel 7',          412,  915],
  ['iPad portrait',    768, 1024],
  ['iPad landscape',  1024,  768],
  ['Laptop 13"',      1280,  800],
  ['Desktop',         1440,  900],
  ['Wide',            1920, 1080],
];

const TEXT_SELECTORS = [
  ['eyebrow',   'section.hero-stage .eyebrow'],
  ['title',     'section.hero-stage h1'],
  ['intro',     'section.hero-stage h1 + p'],
  ['tagline',   'section.hero-stage h1 + p + p'],
  ['ctas',      'section.hero-stage .btn-primary'],
  ['signature', 'section.hero-stage svg.signature'],
];

const overlap = (a, b) => {
  const x = Math.max(0, Math.min(a.x2, b.x2) - Math.max(a.x1, b.x1));
  const y = Math.max(0, Math.min(a.y2, b.y2) - Math.max(a.y1, b.y1));
  return x * y;
};

const browser = await chromium.launch();
let failures = 0;

for (const [name, w, h] of VIEWPORTS) {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1600); // let entrance animations settle

  // Project the face box through the img's real geometry.
  const face = await page.evaluate(({ FACE_SRC, SRC_W, SRC_H }) => {
    const img = document.querySelector('section.hero-stage img.hero-media');
    if (!img) return null;
    const r = img.getBoundingClientRect();
    const cs = getComputedStyle(img);
    const [posX, posY] = cs.objectPosition.split(' ').map((v) => parseFloat(v) / 100);
    const scale = Math.max(r.width / SRC_W, r.height / SRC_H); // object-fit: cover
    const drawnW = SRC_W * scale, drawnH = SRC_H * scale;
    const offX = (r.width - drawnW) * posX;
    const offY = (r.height - drawnH) * posY;
    const map = (sx, sy) => ({ x: r.left + offX + sx * scale, y: r.top + offY + sy * scale });
    const tl = map(FACE_SRC.x1, FACE_SRC.y1);
    const br = map(FACE_SRC.x2, FACE_SRC.y2);
    // Clip to the img's own visible box (overflow-hidden wells crop it).
    return {
      x1: Math.max(tl.x, r.left), y1: Math.max(tl.y, r.top),
      x2: Math.min(br.x, r.right), y2: Math.min(br.y, r.bottom),
      visible: br.x > r.left && br.y > r.top && tl.x < r.right && tl.y < r.bottom,
    };
  }, { FACE_SRC, SRC_W, SRC_H });

  if (!face) { console.log(`✗ ${name}: hero image not found`); failures++; await page.close(); continue; }

  const boxes = await page.evaluate((sels) =>
    sels.map(([label, sel]) => {
      const el = document.querySelector(sel);
      if (!el) return [label, null];
      const r = el.getBoundingClientRect();
      return [label, { x1: r.left, y1: r.top, x2: r.right, y2: r.bottom }];
    }), TEXT_SELECTORS);

  let bad = [];
  for (const [label, box] of boxes) {
    if (!box || !face.visible) continue;
    const area = overlap(face, box);
    if (area > 4) bad.push(`${label} (${Math.round(area)}px²)`); // >2x2px = real overlap
  }

  const faceStr = face.visible
    ? `face on screen (${Math.round(face.x1)},${Math.round(face.y1)})–(${Math.round(face.x2)},${Math.round(face.y2)})`
    : 'face fully cropped out';
  if (bad.length) { console.log(`✗ ${name} ${w}x${h}: OVERLAP → ${bad.join(', ')} | ${faceStr}`); failures++; }
  else console.log(`✓ ${name} ${w}x${h}: clear | ${faceStr}`);

  await page.close();
}

await browser.close();
console.log(failures ? `\nFAILED: ${failures} viewport(s) with text over the face` : '\nPASS: face clear at every viewport');
process.exit(failures ? 1 : 0);
