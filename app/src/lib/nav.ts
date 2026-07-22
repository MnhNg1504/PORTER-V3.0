/**
 * POTTER 3.0 — Logic điều hướng (THẬT)
 * Chuyển từ nav-demo.html (đã verify): sinh khúc rẽ turn-by-turn từ HÌNH HỌC thật,
 * + bổ sung off-route detection (docs/03 §4.2) và grade->màu cho elevation profile.
 */

import { bearing, haversine, GpxPoint, LngLat } from './gpx';

// ---- Khúc rẽ ----
export interface Turn {
  at: number; // vị trí (m) dọc tuyến
  dir: 'left' | 'right';
  angle: number; // độ lệch (độ)
}

/**
 * Sinh khúc rẽ từ hình học tuyến: so bearing đoạn trước (i-5..i) và sau (i..i+5).
 * Ngưỡng lệch >32° và cách khúc rẽ trước >150m => 1 khúc rẽ.
 * (Bản đã verify sinh 132 khúc rẽ cho Fansipan.)
 */
export function generateTurns(pts: GpxPoint[], cum: number[]): Turn[] {
  const out: Turn[] = [];
  let last = 0;
  const win = 5;
  for (let i = win; i < pts.length - win; i++) {
    const b1 = bearing(pts[i - win], pts[i]);
    const b2 = bearing(pts[i], pts[i + win]);
    let d = ((b2 - b1 + 540) % 360) - 180; // chuẩn hoá về [-180,180]
    if (Math.abs(d) > 32 && cum[i] - last > 150) {
      out.push({ at: cum[i], dir: d > 0 ? 'right' : 'left', angle: Math.abs(d) });
      last = cum[i];
    }
  }
  return out;
}

/** Khúc rẽ kế tiếp sau quãng d (m). */
export function nextTurn(turns: Turn[], d: number): Turn | undefined {
  return turns.find((t) => t.at > d + 8);
}

// ---- Off-route detection (docs/03 §4.2) ----
export interface OffRouteResult {
  offRoute: boolean;
  distanceToTrack: number; // m — khoảng cách vuông góc gần nhất tới polyline
  nearestIndex: number; // chỉ số điểm gần nhất (điểm re-join)
}

/**
 * Khoảng cách từ 1 vị trí GPS tới polyline GPX (đơn giản hoá: min khoảng cách tới đỉnh).
 * Hysteresis: ngưỡng VÀO off-route (enter) > ngưỡng RA (exit) để tránh cảnh báo rung lắc.
 * Chạy HOÀN TOÀN CỤC BỘ — không cần mạng.
 */
export function checkOffRoute(
  pos: { lat: number; lon: number },
  pts: GpxPoint[],
  wasOffRoute: boolean,
  enterThreshold = 50,
  exitThreshold = 30
): OffRouteResult {
  let min = Infinity;
  let nearestIndex = 0;
  for (let i = 0; i < pts.length; i++) {
    const dd = haversine(pos, pts[i]);
    if (dd < min) {
      min = dd;
      nearestIndex = i;
    }
  }
  const threshold = wasOffRoute ? exitThreshold : enterThreshold;
  return { offRoute: min > threshold, distanceToTrack: min, nearestIndex };
}

/**
 * Màu theo độ dốc cho elevation profile (dốc = đỏ, phẳng = xanh) — từ prototype.
 * grade = chênh cao / cự ly đoạn; chuẩn hoá theo ngưỡng 25%.
 */
export function gradeColor(dEle: number, dDist: number): string {
  const grade = dEle / (dDist || 1);
  const g = Math.min(Math.abs(grade) / 0.25, 1);
  const rC = Math.round(34 + g * 200);
  const gC = Math.round(160 - g * 150);
  const bC = Math.round(70 - g * 40);
  return `rgb(${rC},${gC},${bC})`;
}

/** ETA thô theo tốc độ trung bình đi bộ leo núi (mặc định 2.5 km/h). */
export function estimateEta(remainingMeters: number, speedKmh = 2.5): string {
  const hours = remainingMeters / 1000 / speedKmh;
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return h > 0 ? `${h}h${m.toString().padStart(2, '0')}` : `${m} phút`;
}

/** Điểm tương ứng để đặt marker vị trí "me" khi mô phỏng dẫn đường. */
export function meFeature(lngLat: LngLat) {
  return {
    type: 'FeatureCollection' as const,
    features: [{ type: 'Feature' as const, geometry: { type: 'Point' as const, coordinates: lngLat } }],
  };
}
