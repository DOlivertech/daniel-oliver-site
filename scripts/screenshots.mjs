// Capture README screenshots from a running site.
// Usage: BASE=https://danieloliverracing.com node scripts/screenshots.mjs
// Reduced motion is emulated so scroll-reveal content renders statically.
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.BASE ?? 'https://danieloliverracing.com';
const OUT = 'docs/screenshots';
mkdirSync(OUT, { recursive: true });

const shots = [
  { path: '/', name: 'home', full: false },
  { path: '/about', name: 'about', full: false },
  { path: '/schedule', name: 'schedule', full: false },
  { path: '/partnerships', name: 'partnerships', full: false },
];

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
  reducedMotion: 'reduce',
  colorScheme: 'dark',
});
const page = await ctx.newPage();

for (const s of shots) {
  await page.goto(BASE + s.path, { waitUntil: 'networkidle' });
  // Let fonts settle + trigger any reveal observers.
  await page.evaluate(() => window.scrollTo(0, 200));
  await page.waitForTimeout(1200);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${OUT}/${s.name}.png`, fullPage: s.full });
  console.log('captured', s.name);
}

await browser.close();
console.log('done');
