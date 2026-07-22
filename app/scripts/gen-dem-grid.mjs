/**
 * Sinh lưới độ cao DEM THẬT cho 1 cung (bundle vào app làm asset offline).
 * Nguồn: terrarium tiles (Mapzen/AWS S3, miễn phí) — decode PNG -> độ cao (m).
 * Cách dùng:  node scripts/gen-dem-grid.mjs <file.gpx> <out.json> [n=96]
 * Ví dụ:      node scripts/gen-dem-grid.mjs assets/gpx/ta-xua.gpx assets/dem/ta-xua-grid.json
 */
import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';

const [gpxPath, outPath, nArg] = process.argv.slice(2);
if (!gpxPath || !outPath) {
  console.error('Usage: node scripts/gen-dem-grid.mjs <file.gpx> <out.json> [n=96]');
  process.exit(1);
}
const N = Number(nArg ?? 96);

// ---- Parse GPX (regex — giống src/lib/gpx.ts) ----
const text = fs.readFileSync(gpxPath, 'utf8');
const tag = /<trkpt[\s>]/.test(text) ? 'trkpt' : 'rtept';
const re = new RegExp(`<${tag}\\b[^>]*lat="([^"]+)"[^>]*lon="([^"]+)"`, 'g');
const pts = [];
let m;
while ((m = re.exec(text))) {
  const lat = Number(m[1]), lon = Number(m[2]);
  if (Number.isFinite(lat) && Number.isFinite(lon)) pts.push({ lat, lon });
}
if (pts.length < 2) { console.error('GPX rỗng'); process.exit(1); }

// ---- BBox vuông + đệm 18% (giống prototype/contour-iso.html) ----
let minLon = Infinity, maxLon = -Infinity, minLat = Infinity, maxLat = -Infinity;
for (const p of pts) {
  minLon = Math.min(minLon, p.lon); maxLon = Math.max(maxLon, p.lon);
  minLat = Math.min(minLat, p.lat); maxLat = Math.max(maxLat, p.lat);
}
const padLon = (maxLon - minLon) * 0.18 || 0.01;
const padLat = (maxLat - minLat) * 0.18 || 0.01;
minLon -= padLon; maxLon += padLon; minLat -= padLat; maxLat += padLat;
const cLon = (minLon + maxLon) / 2, cLat = (minLat + maxLat) / 2;
const cos = Math.cos((cLat * Math.PI) / 180);
const half = Math.max((maxLon - minLon) / 2, (maxLat - minLat) / 2 / cos);
const bbox = {
  minLon: cLon - half, maxLon: cLon + half,
  minLat: cLat - half * cos, maxLat: cLat + half * cos,
};

// ---- Chọn zoom (~<=20 tile) ----
const lon2xf = (lon, z) => ((lon + 180) / 360) * 2 ** z;
const lat2yf = (lat, z) => {
  const r = (lat * Math.PI) / 180;
  return ((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * 2 ** z;
};
let z = 13;
while (z > 9) {
  const nx = Math.floor(lon2xf(bbox.maxLon, z)) - Math.floor(lon2xf(bbox.minLon, z)) + 1;
  const ny = Math.floor(lat2yf(bbox.minLat, z)) - Math.floor(lat2yf(bbox.maxLat, z)) + 1;
  if (nx * ny <= 20) break;
  z--;
}

// ---- Tải + decode tile ----
async function fetchTile(z, x, y) {
  const url = `https://s3.amazonaws.com/elevation-tiles-prod/terrarium/${z}/${x}/${y}.png`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const buf = Buffer.from(await res.arrayBuffer());
  return PNG.sync.read(buf); // {width,height,data RGBA}
}

const need = new Set();
for (let j = 0; j <= N; j++) {
  for (let i = 0; i <= N; i++) {
    const lon = bbox.minLon + ((bbox.maxLon - bbox.minLon) * i) / N;
    const lat = bbox.maxLat - ((bbox.maxLat - bbox.minLat) * j) / N;
    need.add(`${Math.floor(lon2xf(lon, z))}/${Math.floor(lat2yf(lat, z))}`);
  }
}
console.log(`Tải ${need.size} tile DEM (z${z})…`);
const tiles = {};
await Promise.all([...need].map(async (k) => {
  const [x, y] = k.split('/').map(Number);
  tiles[k] = await fetchTile(z, x, y);
}));

// ---- Lấy mẫu lưới ----
const elev = new Array((N + 1) * (N + 1));
let mn = Infinity, mx = -Infinity, holes = 0;
for (let j = 0; j <= N; j++) {
  for (let i = 0; i <= N; i++) {
    const lon = bbox.minLon + ((bbox.maxLon - bbox.minLon) * i) / N;
    const lat = bbox.maxLat - ((bbox.maxLat - bbox.minLat) * j) / N;
    const xf = lon2xf(lon, z), yf = lat2yf(lat, z);
    const t = tiles[`${Math.floor(xf)}/${Math.floor(yf)}`];
    let e = NaN;
    if (t) {
      const ix = Math.min(255, Math.floor((xf - Math.floor(xf)) * 256));
      const iy = Math.min(255, Math.floor((yf - Math.floor(yf)) * 256));
      const o = (iy * 256 + ix) * 4;
      e = t.data[o] * 256 + t.data[o + 1] + t.data[o + 2] / 256 - 32768;
    }
    if (Number.isFinite(e)) { mn = Math.min(mn, e); mx = Math.max(mx, e); }
    else holes++;
    elev[j * (N + 1) + i] = e;
  }
}
// Lấp lỗ tile lỗi bằng đáy thung lũng (không tạo bình độ giả)
for (let k = 0; k < elev.length; k++) if (!Number.isFinite(elev[k])) elev[k] = mn;

const grid = {
  n: N, bbox,
  min: Math.round(mn), max: Math.round(mx),
  zoom: z,
  elev: elev.map((e) => Math.round(e)),
};
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(grid));
console.log(`OK: ${outPath} — ${N}x${N}, ${grid.min}–${grid.max}m, z${z}, lỗ tile: ${holes}`);
