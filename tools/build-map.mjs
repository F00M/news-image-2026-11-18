// Builds the page's two maps from Natural Earth's 1:110m countries (public domain), given as the TopoJSON
// file of the world-atlas package (https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json):
//
//   design/world-map.svg  the "where it happened" locator: Equal Earth, numbered pins for the 16 drawn
//                         stories (story 4, Voyager 1, is off the map), dots for the briefs 17-60, colour by region
//   design/gulf-map.svg   the close-up of the northern Gulf for story 2
//
// Run on the author's machine before render.mjs; the grader never runs it.
//   node tools/build-map.mjs <countries-110m.json>

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const input = process.argv[2];
if (!input) throw new Error('usage: node tools/build-map.mjs <countries-110m.json>');
const designDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'design');

// ---------- regions and stories ----------
export const REGION = {
  asia: '#6b3fa0', mideast: '#c4581b', europe: '#1f5fa8', americas: '#b3121f',
  africa: '#2f7d32', oceania: '#b27a00', global: '#0f7c7c',
};
// Pins: the drawn stories (n, region, [lon, lat], badge offset dx/dy in px). Story 4 (Voyager 1) is off the map.
const PINS = [
  { n: 1, r: 'asia', at: [114.06, 22.54], dx: 4, dy: 6 },        // Shenzhen
  { n: 2, r: 'mideast', at: [47.98, 29.35], dx: 4, dy: 8 },      // Kuwait
  { n: 3, r: 'europe', at: [30.73, 46.48], dx: 8, dy: -8 },      // Odesa (and the EU's offer)
  { n: 5, r: 'mideast', at: [34.4, 31.4], dx: -10, dy: 6 },      // central Gaza
  { n: 6, r: 'americas', at: [-77.04, 38.9], dx: -14, dy: 4 },   // Washington: Jeffries
  { n: 7, r: 'americas', at: [-77.04, 38.9], dx: -6, dy: 14 },   // Washington: Fed minutes
  { n: 8, r: 'americas', at: [-74.0, 40.7], dx: 6, dy: -9 },     // New York: Anthropic
  { n: 9, r: 'global', at: [30.7, 36.9], dx: -6, dy: -12 },      // Antalya: COP31
  { n: 10, r: 'europe', at: [-0.13, 51.5], dx: -10, dy: -8 },    // London: inflation
  { n: 11, r: 'asia', at: [85.8, 19.8], dx: -8, dy: 8 },         // Odisha: Cyclone Akvan
  { n: 12, r: 'asia', at: [90.3, 23.8], dx: 6, dy: -9 },         // Dhaka
  { n: 13, r: 'africa', at: [30.22, 13.18], dx: -4, dy: 10 },    // El Obeid
  { n: 14, r: 'africa', at: [-17.2, 14.6], dx: -6, dy: 8 },      // off Yenne, Senegal
  { n: 15, r: 'oceania', at: [-161.0, -10.4], dx: 0, dy: 0 },    // Manihiki, Cook Islands
  { n: 16, r: 'americas', at: [-74.0, 40.7], dx: 14, dy: 2 },    // New York: Van Gogh
];
// Dots: the briefs that have a place.
const DOTS = [
  ['asia', 135.5, 34.7], ['asia', 126.98, 37.57], ['asia', 106.8, -6.2], ['asia', 67.0, 24.86],
  ['asia', 75.0, 33.6], ['asia', 121.0, 14.6], ['asia', 96.1, 19.8], ['asia', 79.9, 6.9], ['asia', 100.5, 13.75],
  ['mideast', 47.7, 29.0], ['mideast', 44.4, 33.3],
  ['europe', 13.4, 52.5], ['europe', 20.5, 44.8], ['europe', 37.6, 55.75], ['europe', 8.68, 50.11],
  ['europe', 12.45, 41.9], ['europe', -2.6, 53.8], ['europe', 7.7, 45.1],
  ['americas', -66.9, 10.5], ['americas', -122.4, 37.8], ['americas', -80.2, 25.8], ['americas', -47.9, -15.8],
  ['americas', -99.1, 19.4], ['americas', -77.0, -12.5], ['americas', -87.9, 43.0],
  ['africa', 39.4, 14.5], ['africa', 36.8, -1.3], ['africa', 23.6, -2.9], ['africa', 32.6, 0.05], ['africa', 31.2, 30.0],
  ['oceania', 149.1, -35.3], ['oceania', 151.2, -33.87], ['oceania', 178.4, -18.1], ['oceania', 147.3, -42.9],
];
const NEWS_COUNTRIES = new Set([
  'China', 'Kuwait', 'Ukraine', 'Israel', 'Palestine', 'United States of America', 'Turkey', 'United Kingdom',
  'India', 'Bangladesh', 'Sudan', 'Senegal', 'Germany', 'Venezuela', 'Ethiopia', 'Eritrea', 'Kenya',
  'Dem. Rep. Congo', 'Myanmar', 'Philippines', 'Sri Lanka', 'Iraq', 'Serbia', 'Italy', 'Iran', 'Bahrain', 'Russia',
  'Japan', 'South Korea', 'Indonesia', 'Pakistan', 'Thailand', 'Brazil', 'Mexico', 'Peru', 'Haiti', 'Uganda',
  'Tanzania', 'Egypt', 'Australia', 'Fiji', 'New Zealand',
]);

// ---------- projections ----------
const A1 = 1.340264, A2 = -0.081106, A3 = 0.000893, A4 = 0.003796, M = Math.sqrt(3) / 2;
function equalEarth(lon, lat) {
  const l = (lon * Math.PI) / 180;
  const t = Math.asin(M * Math.sin((lat * Math.PI) / 180));
  const t2 = t * t, t6 = t2 * t2 * t2;
  const x = (l * Math.cos(t)) / (M * (A1 + 3 * A2 * t2 + t6 * (7 * A3 + 9 * A4 * t2)));
  const y = t * (A1 + A2 * t2 + t6 * (A3 + A4 * t2));
  return [x, -y];
}
// Plate carree with its x shrunk by cos(mid-latitude): fine for a small regional map.
const localPlate = (lat0) => (lon, lat) => [lon * Math.cos((lat0 * Math.PI) / 180), -lat];

// Fits a projection's window [lonMin, lonMax] x [latMin, latMax] to width x height, centred.
function fit(project, [lonMin, lonMax, latMin, latMax], width, height) {
  const xs = [], ys = [];
  for (let lon = lonMin; lon <= lonMax; lon += (lonMax - lonMin) / 40) {
    for (const lat of [latMin, latMax, (latMin + latMax) / 2]) {
      const [x, y] = project(lon, lat); xs.push(x); ys.push(y);
    }
  }
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  const s = Math.min(width / (x1 - x0), height / (y1 - y0));
  const ox = (width - s * (x1 - x0)) / 2, oy = (height - s * (y1 - y0)) / 2;
  return (lon, lat) => { const [x, y] = project(lon, lat); return [ox + (x - x0) * s, oy + (y - y0) * s]; };
}
const r1 = (v) => Math.round(v * 10) / 10;

// ---------- TopoJSON decoding ----------
const topo = JSON.parse(readFileSync(input, 'utf8'));
const [sx, sy] = topo.transform.scale;
const [tx, ty] = topo.transform.translate;
const arcs = topo.arcs.map((arc) => {
  let x = 0, y = 0;
  return arc.map(([dx, dy]) => { x += dx; y += dy; return [x * sx + tx, y * sy + ty]; });
});
const ring = (indices) => indices.flatMap((i, k) => {
  const a = i >= 0 ? arcs[i] : arcs[~i].slice().reverse();
  return k === 0 ? a : a.slice(1);
});
function geometryPath(g, px) {
  const polygons = g.type === 'Polygon' ? [g.arcs] : g.type === 'MultiPolygon' ? g.arcs : [];
  let d = '';
  for (const rings of polygons) for (const r of rings) {
    let prevLon = null;
    for (const [lon, lat] of ring(r)) {
      const [x, y] = px(lon, lat);
      // Natural Earth cuts its shapes at the antimeridian; never draw a line across the map.
      d += (prevLon === null || Math.abs(lon - prevLon) > 180 ? 'M' : 'L') + r1(x) + ',' + r1(y);
      prevLon = lon;
    }
    d += 'Z';
  }
  return d;
}
function countryPaths(px, highlight) {
  const land = [], news = [];
  for (const g of topo.objects.countries.geometries) {
    if (g.properties?.name === 'Antarctica') continue;
    (highlight.has(g.properties?.name) ? news : land).push(geometryPath(g, px));
  }
  return { land: land.join(''), news: news.join('') };
}

// ---------- the world locator ----------
function worldMap(width) {
  const LAT_TOP = 72, LAT_BOTTOM = -40;
  const X_EDGE = equalEarth(180, 0)[0];
  const scale = width / (2 * X_EDGE);
  const yTop = equalEarth(0, LAT_TOP)[1];
  const height = Math.round((equalEarth(0, LAT_BOTTOM)[1] - yTop) * scale);
  const px = (lon, lat) => { const [x, y] = equalEarth(lon, lat); return [(x + X_EDGE) * scale, (y - yTop) * scale]; };
  const { land, news } = countryPaths(px, NEWS_COUNTRIES);
  const dots = DOTS.map(([r, lon, lat]) => {
    const [x, y] = px(lon, lat);
    return `<circle cx="${r1(x)}" cy="${r1(y)}" r="2.6" fill="${REGION[r]}" stroke="#fff" stroke-width="0.8"/>`;
  });
  const pins = PINS.map((p) => {
    const [x, y] = px(...p.at);
    const bx = x + p.dx, by = y + p.dy;
    const leader = p.dx || p.dy
      ? `<line x1="${r1(x)}" y1="${r1(y)}" x2="${r1(bx)}" y2="${r1(by)}" stroke="#0d1b2a" stroke-width="0.8"/><circle cx="${r1(x)}" cy="${r1(y)}" r="1.4" fill="#0d1b2a"/>`
      : '';
    return `${leader}<circle cx="${r1(bx)}" cy="${r1(by)}" r="6.4" fill="${REGION[p.r]}" stroke="#fff" stroke-width="1.2"/>` +
      `<text x="${r1(bx)}" y="${r1(by + 2.9)}" class="n">${p.n}</text>`;
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<style>.n{font:700 8px "Segoe UI",Arial,sans-serif;fill:#fff;text-anchor:middle}</style>
<rect width="${width}" height="${height}" fill="#e8eef3"/>
<path d="${land}" fill="#d8d3c8" stroke="#f7f5f0" stroke-width="0.4"/>
<path d="${news}" fill="#b9c4d1" stroke="#f7f5f0" stroke-width="0.4"/>
${dots.join('\n')}
${pins.join('\n')}
</svg>
`;
}

// ---------- the Gulf close-up for story 2 ----------
function gulfMap(width, height) {
  const px = fit(localPlate(27), [43.2, 60.2, 24.0, 30.4], width, height);
  const { land, news } = countryPaths(px, new Set(['Iran', 'Kuwait']));
  const P = (lon, lat) => px(lon, lat).map(r1);
  const [kx, ky] = P(47.98, 29.35);   // Ali Al Salem air base, Kuwait
  const [bx, by] = P(50.55, 26.07);   // Bahrain
  const [qx, qy] = P(55.9, 26.8);     // Qeshm Island
  const [ax, ay] = P(51.0, 30.0);     // launch area, Iran
  const [cx, cy] = P(51.6, 28.9);
  const burst = (x, y, color) => {
    let pts = '';
    for (let i = 0; i < 16; i++) {
      const a = (i * Math.PI) / 8, rr = i % 2 ? 3.2 : 7;
      pts += `${r1(x + rr * Math.cos(a))},${r1(y + rr * Math.sin(a))} `;
    }
    return `<polygon points="${pts.trim()}" fill="${color}" stroke="#fff" stroke-width="1"/>`;
  };
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<style>
.lbl{font:800 9.5px "Segoe UI",Arial,sans-serif;letter-spacing:1.5px;fill:#5b6472}
.tag{font:700 8.8px "Segoe UI",Arial,sans-serif;fill:#0d1b2a;paint-order:stroke;stroke:#fff;stroke-width:3;stroke-linejoin:round}
</style>
<rect width="${width}" height="${height}" fill="#dbe7ef"/>
<path d="${land}" fill="#e6dfd0" stroke="#fffaf0" stroke-width="0.8"/>
<path d="${news}" fill="#d6c3a5" stroke="#fffaf0" stroke-width="0.8"/>
<path d="M${ax},${ay} Q${r1((ax + kx) / 2)},${r1(ay - 22)} ${kx},${ky}" fill="none" stroke="#c4581b" stroke-width="2" stroke-dasharray="5 4"/>
<path d="M${cx},${cy} Q${r1((cx + bx) / 2 + 10)},${r1((cy + by) / 2)} ${bx},${by}" fill="none" stroke="#c4581b" stroke-width="2" stroke-dasharray="5 4"/>
${burst(kx, ky, '#c4581b')}
${burst(bx, by, '#0d1b2a')}
<circle cx="${qx}" cy="${qy}" r="4" fill="#1f5fa8" stroke="#fff" stroke-width="1.2"/>
<text x="${r1(width * 0.66)}" y="${r1(height * 0.3)}" class="lbl">IRAN</text>
<text x="${r1(kx - 8)}" y="${r1(ky + 18)}" class="tag" text-anchor="middle">KUWAIT · Ali Al Salem</text>
<text x="${r1(bx - 12)}" y="${r1(by + 20)}" class="tag" text-anchor="middle">BAHRAIN · intercepted</text>
<text x="${r1(qx)}" y="${r1(qy + 17)}" class="tag" text-anchor="middle">QESHM · US strike</text>
</svg>
`;
}

writeFileSync(join(designDir, 'world-map.svg'), worldMap(270));
writeFileSync(join(designDir, 'gulf-map.svg'), gulfMap(238, 92));
console.log('wrote design/world-map.svg and design/gulf-map.svg');
