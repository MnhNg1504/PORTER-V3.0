/**
 * POTTER 3.0 — Contour isometric (THẬT)
 * Port từ prototype/contour-iso.html (đã verify render 15 đỉnh):
 * - Marching squares: lưới độ cao DEM thật -> các đoạn đường bình độ.
 * - Phép chiếu isometric: (i,j,ele) -> (x,y) màn hình, xoay theo azimuth.
 * Lưới DEM sinh offline bằng scripts/gen-dem-grid.mjs từ terrarium tiles (AWS).
 * Thuần hàm — không phụ thuộc RN, test được bằng Jest.
 */

import type { GpxPoint } from './gpx';

// ---- Kiểu dữ liệu ----
/** Lưới độ cao (n+1)×(n+1) sinh từ DEM thật, hàng-trước (row-major, bắc→nam) */
export interface DemGrid {
  n: number; // số ô mỗi chiều (điểm = n+1)
  bbox: { minLon: number; maxLon: number; minLat: number; maxLat: number };
  min: number; // độ cao thấp nhất (m)
  max: number; // độ cao cao nhất (m)
  elev: number[]; // (n+1)*(n+1) giá trị độ cao (m)
  zoom: number; // zoom tile DEM đã dùng (để trace nguồn)
}

/** 1 đoạn thẳng của đường bình độ trong toạ độ lưới [0..n] */
export interface ContourSegment {
  ax: number; ay: number; bx: number; by: number;
  level: number; // mức độ cao (m)
}

export interface ProjectedSegment {
  ax: number; ay: number; bx: number; by: number;
  depth: number; // để sắp thứ tự vẽ (xa vẽ trước)
  hN: number; // độ cao chuẩn hoá 0..1 (đậm nhạt màu)
}

export interface IsoParams {
  width: number; // kích thước khung vẽ (px)
  height: number;
  azimuth: number; // góc xoay (radian)
  tilt?: number; // hệ số ép trục dọc (mặc định 0.52)
  heightScale?: number; // tỉ lệ nâng theo độ cao so với height (mặc định 0.42)
  radiusScale?: number; // bán kính vùng vẽ so với min(w,h) (mặc định 0.46)
  centerYRatio?: number; // tâm Y (mặc định 0.60)
}

// ---- Marching squares (16 case, nội suy tuyến tính trên cạnh) ----
export function contourSegments(grid: DemGrid, level: number): ContourSegment[] {
  const { n, elev } = grid;
  const W = n + 1;
  const segs: ContourSegment[] = [];
  const it = (a: number, b: number) => (level - a) / ((b - a) || 1e-9);

  for (let j = 0; j < n; j++) {
    for (let i = 0; i < n; i++) {
      const tl = elev[j * W + i];
      const tr = elev[j * W + i + 1];
      const br = elev[(j + 1) * W + i + 1];
      const bl = elev[(j + 1) * W + i];
      const c = (tl >= level ? 8 : 0) | (tr >= level ? 4 : 0) | (br >= level ? 2 : 0) | (bl >= level ? 1 : 0);
      if (c === 0 || c === 15) continue;

      const top: [number, number] = [i + it(tl, tr), j];
      const right: [number, number] = [i + 1, j + it(tr, br)];
      const bot: [number, number] = [i + it(bl, br), j + 1];
      const left: [number, number] = [i, j + it(tl, bl)];
      const push = (A: [number, number], B: [number, number]) =>
        segs.push({ ax: A[0], ay: A[1], bx: B[0], by: B[1], level });

      switch (c) {
        case 1: push(left, bot); break;
        case 2: push(bot, right); break;
        case 3: push(left, right); break;
        case 4: push(top, right); break;
        case 5: push(left, top); push(bot, right); break;
        case 6: push(top, bot); break;
        case 7: push(left, top); break;
        case 8: push(top, left); break;
        case 9: push(top, bot); break;
        case 10: push(top, right); push(left, bot); break;
        case 11: push(top, right); break;
        case 12: push(right, left); break;
        case 13: push(bot, right); break;
        case 14: push(left, bot); break;
      }
    }
  }
  return segs;
}

/** Chiếu 1 điểm lưới (pi,pj ∈ [0..n]) + độ cao -> toạ độ màn hình isometric */
export function projectIso(
  pi: number, pj: number, ele: number, grid: DemGrid, p: IsoParams,
): { x: number; y: number; depth: number } {
  const tilt = p.tilt ?? 0.52;
  const hs = p.heightScale ?? 0.42;
  const rs = p.radiusScale ?? 0.46;
  const cy = p.centerYRatio ?? 0.6;

  const u = pi / grid.n - 0.5;
  const v = pj / grid.n - 0.5;
  const rx = u * Math.cos(p.azimuth) - v * Math.sin(p.azimuth);
  const ry = u * Math.sin(p.azimuth) + v * Math.cos(p.azimuth);
  const hN = (ele - grid.min) / ((grid.max - grid.min) || 1);
  const R = Math.min(p.width, p.height) * rs;
  return {
    x: p.width / 2 + rx * R,
    y: p.height * cy + ry * R * tilt - hN * p.height * hs,
    depth: ry,
  };
}

/** Sinh toàn bộ đoạn bình độ đã chiếu, sắp xa->gần, kèm hN để tô màu */
export function buildContourScene(grid: DemGrid, interval: number, p: IsoParams): ProjectedSegment[] {
  const out: ProjectedSegment[] = [];
  const start = Math.ceil(grid.min / interval) * interval;
  for (let level = start; level <= grid.max; level += interval) {
    const hN = (level - grid.min) / ((grid.max - grid.min) || 1);
    for (const s of contourSegments(grid, level)) {
      const A = projectIso(s.ax, s.ay, level, grid, p);
      const B = projectIso(s.bx, s.by, level, grid, p);
      out.push({ ax: A.x, ay: A.y, bx: B.x, by: B.y, depth: (A.depth + B.depth) / 2, hN });
    }
  }
  out.sort((a, b) => a.depth - b.depth);
  return out;
}

/** Chiếu route GPX thật lên lưới -> polyline điểm màn hình (SVG) */
export function projectTrack(points: GpxPoint[], grid: DemGrid, p: IsoParams): { x: number; y: number }[] {
  const { bbox } = grid;
  return points.map((pt) => {
    const pi = ((pt.lon - bbox.minLon) / (bbox.maxLon - bbox.minLon)) * grid.n;
    const pj = ((bbox.maxLat - pt.lat) / (bbox.maxLat - bbox.minLat)) * grid.n;
    const pr = projectIso(pi, pj, pt.ele ?? grid.min, grid, p);
    return { x: pr.x, y: pr.y };
  });
}

/** Màu đường bình độ theo độ cao chuẩn hoá — rêu tối -> Lime Signal (brand PORTER) */
export function contourColor(hN: number): string {
  const r = Math.round(100 + hN * 101);
  const g = Math.round(140 + hN * 86);
  const b = Math.round(60 + hN * 41);
  return `rgb(${r},${g},${b})`;
}

/** Chuỗi "x,y x,y ..." cho <Polyline points=...> của react-native-svg */
export function toSvgPoints(pts: { x: number; y: number }[], round = 10): string {
  return pts.map((p) => `${Math.round(p.x * round) / round},${Math.round(p.y * round) / round}`).join(' ');
}
