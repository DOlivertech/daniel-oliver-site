// Build src/data/tracks.json from the track-manager-pro repo:
// - track list (id, name, country, flag) from racingTracks.ts
// - drawn outlines from trackOutlines.ts, projected to an SVG path + viewBox
import { readFileSync, writeFileSync } from 'fs';

const SRC = '/Users/danieloliver/Git/track-manager-pro/ui/expo/data';

// --- extract the literal after `export const NAME ... = ` up to the terminating `;` ---
function extractLiteral(text, name, open, close) {
  const decl = text.indexOf(`export const ${name}`);
  if (decl < 0) throw new Error(`no ${name}`);
  const start = text.indexOf(open, text.indexOf('=', decl));
  // balance brackets to find the matching close (ignoring those in strings/comments is
  // unnecessary here — the data files have no stray unbalanced brackets in strings)
  let depth = 0, i = start;
  for (; i < text.length; i++) {
    const c = text[i];
    if (c === open) depth++;
    else if (c === close) { depth--; if (depth === 0) { i++; break; } }
  }
  return text.slice(start, i);
}

const rtText = readFileSync(`${SRC}/racingTracks.ts`, 'utf8');
const toText = readFileSync(`${SRC}/trackOutlines.ts`, 'utf8');
// eslint-disable-next-line no-eval
const racingTracks = eval(extractLiteral(rtText, 'racingTracks', '[', ']'));
// eslint-disable-next-line no-eval
const trackOutlines = eval('(' + extractLiteral(toText, 'trackOutlines', '{', '}') + ')');

// --- country name → ISO2 → flag emoji ---
const ISO = {
  'United Kingdom': 'GB', 'United States': 'US', 'USA': 'US', 'Italy': 'IT', 'Monaco': 'MC',
  'Japan': 'JP', 'Belgium': 'BE', 'Brazil': 'BR', 'Spain': 'ES', 'France': 'FR', 'Germany': 'DE',
  'Netherlands': 'NL', 'Austria': 'AT', 'Hungary': 'HU', 'Portugal': 'PT', 'Azerbaijan': 'AZ',
  'Bahrain': 'BH', 'Saudi Arabia': 'SA', 'Qatar': 'QA', 'United Arab Emirates': 'AE', 'UAE': 'AE',
  'Australia': 'AU', 'Canada': 'CA', 'Mexico': 'MX', 'China': 'CN', 'Singapore': 'SG',
  'Russia': 'RU', 'Turkey': 'TR', 'Turkiye': 'TR', 'South Korea': 'KR', 'India': 'IN',
  'Malaysia': 'MY', 'South Africa': 'ZA', 'Argentina': 'AR', 'Sweden': 'SE', 'Finland': 'FI',
  'Denmark': 'DK', 'Norway': 'NO', 'Ireland': 'IE', 'Switzerland': 'CH', 'Czech Republic': 'CZ',
  'Czechia': 'CZ', 'Poland': 'PL', 'New Zealand': 'NZ', 'Indonesia': 'ID', 'Thailand': 'TH',
  'Vietnam': 'VN', 'Wales': 'GB', 'Slovakia': 'SK', 'Slovak Republic': 'SK',
};
const flagOf = (country) => {
  const iso = ISO[country];
  if (!iso) return '';
  return String.fromCodePoint(...[...iso].map((c) => 127397 + c.charCodeAt(0)));
};

// --- project lat/lon outline → normalized SVG path + viewBox ---
function outlineToPath(coords) {
  const pts = coords.map((c) => ({ lat: c.lat ?? c[0], lon: c.lon ?? c[1] }));
  const meanLat = pts.reduce((s, p) => s + p.lat, 0) / pts.length;
  const k = Math.cos((meanLat * Math.PI) / 180);
  // x grows east, y grows south (screen coords)
  let xy = pts.map((p) => ({ x: p.lon * k, y: -p.lat }));
  const xs = xy.map((p) => p.x), ys = xy.map((p) => p.y);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const w = maxX - minX || 1, h = maxY - minY || 1;
  const pad = 6;
  const target = 100;
  const scale = (target - pad * 2) / Math.max(w, h);
  const offX = pad + (Math.max(w, h) - w) * scale / 2;
  const offY = pad + (Math.max(w, h) - h) * scale / 2;
  const r = (n) => Math.round(n * 10) / 10;
  const path = xy
    .map((p, i) => `${i ? 'L' : 'M'}${r(offX + (p.x - minX) * scale)} ${r(offY + (p.y - minY) * scale)}`)
    .join(' ') + ' Z';
  return { path, viewBox: `0 0 ${target} ${target}` };
}

const unmapped = new Set();
const tracks = racingTracks
  .map((t) => {
    const flag = flagOf(t.country);
    if (!flag) unmapped.add(t.country);
    const iso = (ISO[t.country] || '').toLowerCase();
    // `flag` (emoji) kept as a fallback; `iso` drives the SVG flag images
    // (emoji flags don't render on Windows — they show "US", "GB", …).
    const rec = { id: t.id, name: t.name, country: t.country, flag, iso };
    const ol = trackOutlines[t.id];
    if (ol && Array.isArray(ol.coordinates) && ol.coordinates.length > 8) {
      const { path, viewBox } = outlineToPath(ol.coordinates);
      rec.viewBox = viewBox;
      rec.path = path;
    }
    return rec;
  })
  .sort((a, b) => a.name.localeCompare(b.name));

writeFileSync(
  new URL('../src/data/tracks.json', import.meta.url),
  JSON.stringify(tracks, null, 0) + '\n'
);
const withMap = tracks.filter((t) => t.path).length;
console.log(`tracks: ${tracks.length} total, ${withMap} with maps`);
if (unmapped.size) console.log('⚠ countries without a flag mapping:', [...unmapped].join(', '));
