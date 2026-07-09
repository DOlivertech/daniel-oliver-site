import { chromium } from 'playwright';
const browser = await chromium.launch();
let fail = 0;
for (const [url, label] of [['/', 'HOME'], ['/about', 'ABOUT'], ['/partnerships', 'PARTNERSHIPS']]) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:4642' + url, { waitUntil: 'networkidle' });
  // real wheel scroll through the whole page
  for (let k = 0; k < 50; k++) { await page.mouse.wheel(0, 300); await page.waitForTimeout(80); }
  await page.waitForTimeout(800);
  const d = await page.evaluate(() => {
    const clips = [...document.querySelectorAll('.reveal-clip')];
    const hidden = clips.filter((w) => !w.classList.contains('in') || getComputedStyle(w).opacity === '0')
      .map((w) => w.querySelector('img')?.getAttribute('src'));
    return { total: clips.length, hidden };
  });
  const ok = d.hidden.length === 0;
  console.log(`${ok ? '✓' : '✗'} ${label}: ${d.total - d.hidden.length}/${d.total} images revealed` +
    (ok ? '' : ` | STILL HIDDEN: ${d.hidden.join(', ')}`));
  if (!ok) fail++;
  await page.close();
}
await browser.close();
console.log(fail ? `\nFAIL: ${fail} page(s) with hidden images` : '\nPASS: every section image reveals');
process.exit(fail ? 1 : 0);
