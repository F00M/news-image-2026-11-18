// Builds design/world-map.svg: the locator map of the front page, with a numbered marker on the place
// of each story. Run on the author's machine before render.mjs; the grader never runs it.
//
//   node tools/build-map.mjs <countries-110m.json>
//
// The input is Natural Earth's 1:110m countries (public domain) as TopoJSON, the countries-110m.json
// file of the world-atlas package (https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json).
// Projection: Equal Earth, cropped to latitudes 72N..40S so the map fits the page.

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const input = process.argv[2];
if (!input) throw new Error('usage: node tools/build-map.mjs <countries-110m.json>');
const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'design', 'world-map.svg');

// ---------- the stories, by place ----------
// n: number on the page; at: [lon, lat]; dx/dy: badge offset from the place in pixels (0 = on it);
// label: place name; side: which side of the badge the label goes.
const STORIES = [
  { n: 1, at: [114.06, 22.54], dx: 0, dy: 0, label: 'Shenzhen', side: 'right', lead: true },
  { n: 2, at: [47.98, 29.35], dx: 0, dy: 0, label: 'Kuwait', side: 'left' },
  { n: 3, at: [30.72, 46.48], dx: 0, dy: 0, label: 'Odesa', side: 'right' },
  { n: 4, at: [13.4, 52.52], dx: 0, dy: 0, label: 'Berlin', side: 'left' },
  { n: 5, at: [90.26, 23.85], dx: -10, dy: -28, label: 'Dhaka', side: 'left' },
  { n: 6, at: [39.4, 14.5], dx: 0, dy: 0, label: 'Ethiopia–Eritrea', side: 'left' },
  { n: 7, at: [-149.9, 61.2], dx: 0, dy: 0, label: 'Alaska', side: 'right' },
  { n: 8, at: [174.76, -36.85], dx: -6, dy: -18, label: 'New Zealand', side: 'left' },
  { n: 9, at: [96.08, 19.76], dx: 8, dy: 22, label: 'Myanmar', side: 'right' },
];
const LEAD_COUNTRIES = new Set(['China']);
const NEWS_COUNTRIES = new Set([
  'Kuwait', 'Ukraine', 'Germany', 'Bangladesh', 'Ethiopia', 'Eritrea',
  'United States of America', 'New Zealand', 'Myanmar',
]);

// ---------- Equal Earth projection ----------
const A1 = 1.340264, A2 = -0.081106, A3 = 0.000893, A4 = 0.003796, M = Math.sqrt(3) / 2;
function equalEarth(lon, lat) {
  const l = (lon * Math.PI) / 180;
  const t = Math.asin(M * Math.sin((lat * Math.PI) / 180));
  const t2 = t * t, t6 = t2 * t2 * t2;
  const x = (l * Math.cos(t)) / (M * (A1 + 3 * A2 * t2 + t6 * (7 * A3 + 9 * A4 * t2)));
  const y = t * (A1 + A2 * t2 + t6 * (A3 + A4 * t2));
  return [x, y];
}

const WIDTH = 976;
const LAT_TOP = 72, LAT_BOTTOM = -40;
const X_EDGE = equalEarth(180, 0)[0];
const SCALE = WIDTH / (2 * X_EDGE);
const Y_TOP = equalEarth(0, LAT_TOP)[1];
const HEIGHT = Math.round((Y_TOP - equalEarth(0, LAT_BOTTOM)[1]) * SCALE);
const px = (lon, lat) => {
  const [x, y] = equalEarth(lon, lat);
  return [(x + X_EDGE) * SCALE, (Y_TOP - y) * SCALE];
};
const r1 = (v) => Math.round(v * 10) / 10;

// ---------- TopoJSON decoding ----------
const topo = JSON.parse(readFileSync(input, 'utf8'));
const [sx, sy] = topo.transform.scale;
const [tx, ty] = topo.transform.translate;
const arcs = topo.arcs.map((arc) => {
  let x = 0, y = 0;
  return arc.map(([dx, dy]) => { x += dx; y += dy; return [x * sx + tx, y * sy + ty]; });
});
function ring(indices) {
  const points = [];
  indices.forEach((i, k) => {
    const a = i >= 0 ? arcs[i] : arcs[~i].slice().reverse();
    points.push(...(k === 0 ? a : a.slice(1)));
  });
  return points;
}
function ringPath(points) {
  let d = '', prevLon = null;
  for (const [lon, lat] of points) {
    const [x, y] = px(lon, lat);
    // Natural Earth cuts its shapes at the antimeridian; never draw a line across the map.
    d += (prevLon === null || Math.abs(lon - prevLon) > 180 ? 'M' : 'L') + r1(x) + ',' + r1(y);
    prevLon = lon;
  }
  return d + 'Z';
}
function geometryPath(g) {
  const polygons = g.type === 'Polygon' ? [g.arcs] : g.type === 'MultiPolygon' ? g.arcs : [];
  return polygons.map((rings) => rings.map((r) => ringPath(ring(r))).join('')).join('');
}

const land = [], news = [], lead = [];
for (const g of topo.objects.countries.geometries) {
  const name = g.properties?.name;
  if (name === 'Antarctica') continue;
  const d = geometryPath(g);
  (LEAD_COUNTRIES.has(name) ? lead : NEWS_COUNTRIES.has(name) ? news : land).push(d);
}

// ---------- graticule: meridians every 30 degrees, parallels every 20 ----------
const graticule = [];
for (let lon = -180; lon <= 180; lon += 30) {
  let d = '';
  for (let lat = LAT_BOTTOM; lat <= LAT_TOP; lat += 2) {
    const [x, y] = px(lon, lat);
    d += (lat === LAT_BOTTOM ? 'M' : 'L') + r1(x) + ',' + r1(y);
  }
  graticule.push(d);
}
for (const lat of [-20, 0, 20, 40, 60]) {
  const [x0, y] = px(-180, lat);
  const [x1] = px(180, lat);
  graticule.push(`M${r1(x0)},${r1(y)}L${r1(x1)},${r1(y)}`);
}

// ---------- markers ----------
const markers = STORIES.map((s) => {
  const [x, y] = px(...s.at);
  const bx = x + s.dx, by = y + s.dy;
  const r = s.lead ? 15 : 12;
  const fill = s.lead ? '#c1121f' : '#0d1b2a';
  const lx = s.side === 'right' ? bx + r + 5 : bx - r - 5;
  const anchor = s.side === 'right' ? 'start' : 'end';
  const leader = s.dx || s.dy
    ? `<line x1="${r1(x)}" y1="${r1(y)}" x2="${r1(bx)}" y2="${r1(by)}" class="leader"/><circle cx="${r1(x)}" cy="${r1(y)}" r="2.6" fill="${fill}"/>`
    : '';
  return `<g>${leader}<circle cx="${r1(bx)}" cy="${r1(by)}" r="${r}" fill="${fill}" class="badge"/>` +
    `<text x="${r1(bx)}" y="${r1(by + (s.lead ? 5.5 : 4.6))}" class="num${s.lead ? ' lead' : ''}">${s.n}</text>` +
    `<text x="${r1(lx)}" y="${r1(by + 4.5)}" text-anchor="${anchor}" class="place${s.lead ? ' lead' : ''}">${s.label}</text></g>`;
});

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
<style>
.ocean{fill:#e9eff4}.grat{fill:none;stroke:#d5dee6;stroke-width:0.7}
.land{fill:#d9d4c9;stroke:#f7f5f0;stroke-width:0.5}.news{fill:#9fb0c4;stroke:#f7f5f0;stroke-width:0.5}.leadc{fill:#e3a19a;stroke:#f7f5f0;stroke-width:0.5}
.badge{stroke:#fff;stroke-width:2}.leader{stroke:#0d1b2a;stroke-width:1.4}
.num{font:700 14px "Segoe UI",Arial,sans-serif;fill:#fff;text-anchor:middle}.num.lead{font-size:17px}
.place{font:700 13.5px "Segoe UI",Arial,sans-serif;fill:#0d1b2a;paint-order:stroke;stroke:#fff;stroke-width:3.5;stroke-linejoin:round}.place.lead{fill:#a10f1a;font-size:15px}
</style>
<rect class="ocean" width="${WIDTH}" height="${HEIGHT}"/>
<path class="grat" d="${graticule.join('')}"/>
<path class="land" d="${land.join('')}"/>
<path class="news" d="${news.join('')}"/>
<path class="leadc" d="${lead.join('')}"/>
${markers.join('\n')}
</svg>
`;
writeFileSync(out, svg);
console.log(`world-map.svg: ${WIDTH} x ${HEIGHT}, ${svg.length} bytes`);
