import { parseGPX, computeStats, haversine, toGpxXml, positionAt, boundsOf } from '../gpx';

// GPX nhỏ tự tạo: 3 điểm quanh Tà Xùa, có <ele> — đúng cấu trúc trkpt.
const SAMPLE_TRK = `<?xml version="1.0"?>
<gpx version="1.1"><trk><trkseg>
  <trkpt lat="21.2000" lon="104.4000"><ele>1500</ele></trkpt>
  <trkpt lat="21.2010" lon="104.4000"><ele>1550</ele></trkpt>
  <trkpt lat="21.2020" lon="104.4000"><ele>1520</ele></trkpt>
</trkseg></trk></gpx>`;

// Biến thể rtept (định dạng Suunto của bộ 15 đỉnh Tây Bắc).
const SAMPLE_RTE = SAMPLE_TRK.replace(/trkpt/g, 'rtept').replace('<trk><trkseg>', '<rte>')
  .replace('</trkseg></trk>', '</rte>');

describe('parseGPX', () => {
  it('đọc trkpt với lat/lon/ele', () => {
    const pts = parseGPX(SAMPLE_TRK);
    expect(pts).toHaveLength(3);
    expect(pts[0]).toEqual({ lat: 21.2, lon: 104.4, ele: 1500 });
  });

  it('fallback rtept khi không có trkpt', () => {
    const pts = parseGPX(SAMPLE_RTE);
    expect(pts).toHaveLength(3);
    expect(pts[2].ele).toBe(1520);
  });

  it('trả mảng rỗng với XML không phải GPX', () => {
    expect(parseGPX('<html></html>')).toHaveLength(0);
  });
});

describe('haversine', () => {
  it('0.001° vĩ tuyến ≈ 111m', () => {
    const d = haversine({ lat: 21.2, lon: 104.4 }, { lat: 21.201, lon: 104.4 });
    expect(d).toBeGreaterThan(105);
    expect(d).toBeLessThan(118);
  });
});

describe('computeStats', () => {
  const stats = computeStats(parseGPX(SAMPLE_TRK));

  it('tổng leo = 50m, tổng xuống = 30m', () => {
    expect(stats.gain).toBe(50);
    expect(stats.loss).toBe(30);
  });

  it('đỉnh 1550m, thấp nhất 1500m', () => {
    expect(stats.maxEle).toBe(1550);
    expect(stats.minEle).toBe(1500);
  });

  it('cự ly luỹ kế tăng dần, tổng ≈ 222m', () => {
    expect(stats.cum).toHaveLength(3);
    expect(stats.distance).toBeGreaterThan(210);
    expect(stats.distance).toBeLessThan(240);
  });
});

describe('positionAt', () => {
  it('nội suy giữa 2 điểm — độ cao trong khoảng [1500,1550]', () => {
    const pts = parseGPX(SAMPLE_TRK);
    const stats = computeStats(pts);
    const coords = pts.map((p) => [p.lon, p.lat] as [number, number]);
    const p = positionAt(pts, stats.cum, coords, stats.distance / 4);
    expect(p.ele).toBeGreaterThanOrEqual(1500);
    expect(p.ele).toBeLessThanOrEqual(1550);
    expect(p.lngLat[0]).toBeCloseTo(104.4, 4);
  });
});

describe('toGpxXml (export) — roundtrip', () => {
  it('parse lại đúng số điểm + ele + escape tên', () => {
    const pts = parseGPX(SAMPLE_TRK);
    const xml = toGpxXml(pts, 'Tà Xùa <test> & "demo"');
    expect(xml).toContain('&lt;test&gt;');
    const back = parseGPX(xml);
    expect(back).toHaveLength(pts.length);
    expect(back[1].ele).toBe(1550);
    expect(back[0].lat).toBeCloseTo(pts[0].lat, 6);
  });
});

describe('boundsOf', () => {
  it('bbox bao trọn track', () => {
    const [minLon, minLat, maxLon, maxLat] = boundsOf(parseGPX(SAMPLE_TRK));
    expect(minLon).toBe(104.4);
    expect(maxLon).toBe(104.4);
    expect(minLat).toBe(21.2);
    expect(maxLat).toBe(21.202);
  });
});
