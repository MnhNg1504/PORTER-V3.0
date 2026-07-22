/**
 * Seed 15 cung Tây Bắc từ GPX THẬT (thư mục GPX_DIR trong .env).
 * Chạy: npm run seed  (sau khi migration:run). Idempotent — bỏ qua slug đã có.
 */
import 'reflect-metadata';
import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import dataSource from '../config/data-source';
import { parseGpx, trackStats } from '../gpx/gpx.service';
import { slugify, estimateMinutes, classifyDifficulty } from '../common/route-utils';

async function main() {
  const gpxDir = path.resolve(__dirname, '../../', process.env.GPX_DIR ?? '../16 Đỉnh Tây Bắc');
  if (!fs.existsSync(gpxDir)) {
    console.error(`Không thấy thư mục GPX: ${gpxDir}`);
    process.exit(1);
  }
  const ds = await dataSource.initialize();
  const files = fs.readdirSync(gpxDir).filter((f) => f.toLowerCase().endsWith('.gpx'));
  console.log(`Seed ${files.length} GPX từ ${gpxDir}`);

  for (const file of files) {
    const name = path.basename(file, '.gpx').trim();
    const slug = slugify(name);
    const existed = await ds.query(`SELECT id FROM trek_routes WHERE slug = $1`, [slug]);
    if (existed.length) {
      console.log(`- ${name}: đã có, bỏ qua`);
      continue;
    }
    const raw = fs.readFileSync(path.join(gpxDir, file), 'utf8');
    const pts = parseGpx(raw);
    const stats = trackStats(pts);
    // WKT LineStringZ từ điểm thật; ele null → 0
    const wkt = `LINESTRING Z(${pts.map((p) => `${p.lon} ${p.lat} ${p.ele ?? 0}`).join(',')})`;
    const start = pts[0];
    await ds.query(
      `INSERT INTO trek_routes
        ("name","slug","difficulty","geom","startPoint","distanceM","ascentM","descentM",
         "maxEleM","minEleM","durationEstMin","season","status")
       VALUES ($1,$2,$3, ST_GeomFromText($4,4326), ST_SetSRID(ST_MakePoint($5,$6),4326),
               $7,$8,$9,$10,$11,$12,$13,'published')`,
      [
        name, slug, classifyDifficulty(stats.ascentM, stats.distanceM), wkt,
        start.lon, start.lat,
        stats.distanceM, stats.ascentM, stats.descentM, stats.maxEleM, stats.minEleM,
        estimateMinutes(stats.distanceM, stats.ascentM), '10-4',
      ],
    );
    console.log(
      `+ ${name}: ${pts.length} điểm, ${(stats.distanceM / 1000).toFixed(1)}km, +${stats.ascentM}m → ${classifyDifficulty(stats.ascentM, stats.distanceM)}`,
    );
  }
  await ds.destroy();
  console.log('Seed xong.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
