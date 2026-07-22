/**
 * POTTER 3.0 — Xử lý GPX (THẬT)
 * Chuyển từ logic đã VERIFY trong prototype/map-demo.html + nav-demo.html sang TypeScript.
 * Chức năng: parse GPX (trkpt/rtept), haversine, thống kê (km/tổng leo/xuống/đỉnh),
 * cự ly luỹ kế, lấy vị trí + độ cao tại quãng d, dựng GeoJSON cho MapLibre.
 *
 * KHÔNG có mock ở đây — mọi số liệu tính trực tiếp từ toạ độ & <ele> thật trong GPX.
 */

// ---- Kiểu dữ liệu ----
export interface GpxPoint {
  lon: number;
  lat: number;
  ele: number | null; // độ cao (m) — có thể thiếu ở vài điểm
}

export interface TrackStats {
  distance: number; // tổng cự ly (m)
  gain: number; // tổng leo (m)
  loss: number; // tổng xuống (m)
  maxEle: number; // đỉnh cao nhất (m)
  minEle: number; // điểm thấp nhất / xuất phát (m)
  cum: number[]; // cự ly luỹ kế theo từng điểm (m)
}

export type LngLat = [number, number];

export interface GeoJsonFeature {
  type: 'Feature';
  geometry: { type: 'LineString'; coordinates: LngLat[] } | { type: 'Point'; coordinates: LngLat };
  properties?: Record<string, unknown>;
}

export interface GeoJsonFC {
  type: 'FeatureCollection';
  features: GeoJsonFeature[];
}

/**
 * Parse chuỗi XML GPX -> danh sách điểm.
 * Ưu tiên <trkpt>; nếu không có thì dùng <rtept> (file Suunto của bộ 15 đỉnh dùng rtept).
 * Dùng regex thay cho DOMParser vì React Native không có DOM.
 */
export function parseGPX(text: string): GpxPoint[] {
  // Chọn thẻ điểm: trkpt trước, fallback rtept
  const tag = /<trkpt[\s>]/.test(text) ? 'trkpt' : 'rtept';
  const ptRe = new RegExp(`<${tag}\\b[^>]*?lat="([^"]+)"[^>]*?lon="([^"]+)"[^>]*?>([\\s\\S]*?)</${tag}>|<${tag}\\b[^>]*?lat="([^"]+)"[^>]*?lon="([^"]+)"[^>]*?/>`, 'g');
  const eleRe = /<ele>\s*([-\d.]+)\s*<\/ele>/;

  const out: GpxPoint[] = [];
  let m: RegExpExecArray | null;
  while ((m = ptRe.exec(text)) !== null) {
    // Nhánh có nội dung (m[1..3]) hoặc thẻ tự đóng (m[4..5])
    const lat = parseFloat(m[1] ?? m[4]);
    const lon = parseFloat(m[2] ?? m[5]);
    const inner = m[3] ?? '';
    if (!isFinite(lat) || !isFinite(lon)) continue;
    const eleMatch = inner ? eleRe.exec(inner) : null;
    out.push({ lat, lon, ele: eleMatch ? parseFloat(eleMatch[1]) : null });
  }
  return out;
}

/** Khoảng cách Haversine giữa 2 điểm (mét). */
export function haversine(a: GpxPoint | { lat: number; lon: number }, b: GpxPoint | { lat: number; lon: number }): number {
  const R = 6371000;
  const r = Math.PI / 180;
  const dLat = (b.lat - a.lat) * r;
  const dLon = (b.lon - a.lon) * r;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

/** Góc phương vị (bearing) từ a -> b, độ 0..360. */
export function bearing(a: GpxPoint, b: GpxPoint): number {
  const r = Math.PI / 180;
  const y = Math.sin((b.lon - a.lon) * r) * Math.cos(b.lat * r);
  const x =
    Math.cos(a.lat * r) * Math.sin(b.lat * r) -
    Math.sin(a.lat * r) * Math.cos(b.lat * r) * Math.cos((b.lon - a.lon) * r);
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
}

/** Thống kê tuyến: cự ly, tổng leo/xuống, đỉnh/đáy, mảng cự ly luỹ kế. */
export function computeStats(pts: GpxPoint[]): TrackStats {
  let distance = 0;
  let gain = 0;
  let loss = 0;
  const cum: number[] = [0];
  const eles: number[] = [];

  for (let i = 1; i < pts.length; i++) {
    distance += haversine(pts[i - 1], pts[i]);
    cum.push(distance);
  }
  for (const p of pts) if (p.ele != null) eles.push(p.ele);
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1].ele;
    const b = pts[i].ele;
    if (a != null && b != null) {
      const d = b - a;
      if (d > 0) gain += d;
      else loss -= d;
    }
  }
  return {
    distance,
    gain,
    loss,
    maxEle: eles.length ? Math.max(...eles) : 0,
    minEle: eles.length ? Math.min(...eles) : 0,
    cum,
  };
}

/**
 * Vị trí + độ cao tại quãng đường d (m) dọc theo tuyến (nội suy tuyến tính).
 * Dùng cho: con trỏ elevation, mô phỏng dẫn đường, HUD "còn lại".
 */
export function positionAt(
  pts: GpxPoint[],
  cum: number[],
  coords: LngLat[],
  d: number
): { lngLat: LngLat; ele: number | null; index: number } {
  let i = 1;
  while (i < cum.length && cum[i] < d) i++;
  if (i >= cum.length) {
    return { lngLat: coords[coords.length - 1], ele: pts[pts.length - 1].ele, index: cum.length - 1 };
  }
  const t = (d - cum[i - 1]) / ((cum[i] - cum[i - 1]) || 1);
  const lngLat: LngLat = [
    coords[i - 1][0] + (coords[i][0] - coords[i - 1][0]) * t,
    coords[i - 1][1] + (coords[i][1] - coords[i - 1][1]) * t,
  ];
  const a = pts[i - 1].ele;
  const b = pts[i].ele;
  const ele = a != null && b != null ? a + (b - a) * t : pts[i].ele;
  return { lngLat, ele, index: i };
}

/** GeoJSON LineString cho lớp track trên MapLibre. */
export function toLineFeature(pts: GpxPoint[]): GeoJsonFeature {
  return {
    type: 'Feature',
    geometry: { type: 'LineString', coordinates: pts.map((p) => [p.lon, p.lat] as LngLat) },
  };
}

/** GeoJSON điểm đầu (xanh) & cuối (đỏ). */
export function toEndpointsFC(pts: GpxPoint[]): GeoJsonFC {
  const first: LngLat = [pts[0].lon, pts[0].lat];
  const last: LngLat = [pts[pts.length - 1].lon, pts[pts.length - 1].lat];
  return {
    type: 'FeatureCollection',
    features: [
      { type: 'Feature', geometry: { type: 'Point', coordinates: first }, properties: { role: 'start' } },
      { type: 'Feature', geometry: { type: 'Point', coordinates: last }, properties: { role: 'end' } },
    ],
  };
}

/** Bounding box [minLon, minLat, maxLon, maxLat] để fit khung map. */
export function boundsOf(pts: GpxPoint[]): [number, number, number, number] {
  let minLon = Infinity, minLat = Infinity, maxLon = -Infinity, maxLat = -Infinity;
  for (const p of pts) {
    if (p.lon < minLon) minLon = p.lon;
    if (p.lat < minLat) minLat = p.lat;
    if (p.lon > maxLon) maxLon = p.lon;
    if (p.lat > maxLat) maxLat = p.lat;
  }
  return [minLon, minLat, maxLon, maxLat];
}

/** Định dạng cự ly cho HUD: >=1km -> "x.x km", nhỏ hơn -> làm tròn 10m. */
export function formatDistance(m: number): string {
  return m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${Math.round(m / 10) * 10} m`;
}
