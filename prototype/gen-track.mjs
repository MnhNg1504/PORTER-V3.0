// Nén track Tà Xùa THẬT (từ GPX) thành mảng nhúng cho app-preview.html
import fs from 'node:fs';

// Cách dùng: node gen-track.mjs [gpxPath] [outFile] [varName]  (mặc định: Tà Xùa)
const [gpxIn, outFile, varName] = process.argv.slice(2);
const t = fs.readFileSync(gpxIn ?? '../app/assets/gpx/ta-xua.gpx', 'utf8');
const tag = /<trkpt[\s>]/.test(t) ? 'trkpt' : 'rtept';
const re = new RegExp(`<${tag}\\b[^>]*lat="([^"]+)"[^>]*lon="([^"]+)"[^>]*>([\\s\\S]*?)</${tag}>`, 'g');
const eleRe = /<ele>\s*([-\d.]+)\s*<\/ele>/;

const pts = [];
let m;
while ((m = re.exec(t))) {
  const e = eleRe.exec(m[3]);
  pts.push([Number(m[2]), Number(m[1]), e ? Math.round(Number(e[1])) : null]);
}
const step = Math.max(1, Math.floor(pts.length / 300));
const ds = pts
  .filter((_, i) => i % step === 0 || i === pts.length - 1)
  .map((p) => [Number(p[0].toFixed(5)), Number(p[1].toFixed(5)), p[2]]);

fs.writeFileSync(
  outFile ?? 'taxua-track.js',
  `// Track THẬT (downsample ${ds.length}/${pts.length} điểm từ GPX)\nconst ${varName ?? 'TAXUA'}=${JSON.stringify(ds)};\n`,
);
console.log('points:', pts.length, '->', ds.length);
