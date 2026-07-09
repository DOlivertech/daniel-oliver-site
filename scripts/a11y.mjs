import { chromium } from 'playwright';
import { readFileSync } from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const axePath = require.resolve('axe-core/axe.min.js');
const axeSrc = readFileSync(axePath, 'utf8');

const pages = ['/','/about','/schedule','/news/2026-imsa-cota-debut','/contact','/media/sebring-test-2026','/partnerships','/blog'];
const b = await chromium.launch();
const agg = {};
for (const url of pages) {
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  await p.goto('http://localhost:4642'+url, { waitUntil: 'networkidle' });
  await p.addScriptTag({ content: axeSrc });
  const res = await p.evaluate(async () => await window.axe.run(document, {
    runOnly: { type: 'tag', values: ['wcag2a','wcag2aa','wcag21a','wcag21aa','best-practice'] }
  }));
  for (const v of res.violations) {
    const key = v.id;
    agg[key] = agg[key] || { impact: v.impact, help: v.help, pages: new Set(), sampleNodes: [] };
    agg[key].pages.add(url);
    for (const n of v.nodes.slice(0,2)) if (agg[key].sampleNodes.length<3) agg[key].sampleNodes.push(n.target.join(' ')+' | '+(n.failureSummary||'').split('\n').slice(0,2).join(' '));
  }
  await p.close();
}
const order = {critical:0,serious:1,moderate:2,minor:3};
const rows = Object.entries(agg).sort((a,b)=>(order[a[1].impact]??9)-(order[b[1].impact]??9));
if (!rows.length) console.log('✓ No axe violations across', pages.length, 'pages');
for (const [id,v] of rows) {
  console.log(`\n[${(v.impact||'?').toUpperCase()}] ${id} — ${v.help}`);
  console.log('  pages:', [...v.pages].join(', '));
  v.sampleNodes.forEach(n=>console.log('   •', n.slice(0,180)));
}
await b.close();
