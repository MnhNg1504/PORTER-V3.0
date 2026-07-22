import { BadRequestException } from '@nestjs/common';
import { parseGpx, haversineM, trackStats } from '../gpx.service';

/** GPX track chuẩn: 3 trkpt cùng kinh tuyến, cách nhau 0.001° vĩ (~111.2m) */
const TRK_GPX = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="test" xmlns="http://www.topografix.com/GPX/1/1">
  <trk><name>Test</name><trkseg>
    <trkpt lat="21.000" lon="103.000"><ele>1000</ele></trkpt>
    <trkpt lat="21.001" lon="103.000"><ele>1100</ele></trkpt>
    <trkpt lat="21.002" lon="103.000"><ele>1050</ele></trkpt>
  </trkseg></trk>
</gpx>`;

/** GPX chỉ có route (rtept) — không có trk */
const RTE_GPX = `<?xml version="1.0"?>
<gpx version="1.1" creator="test">
  <rte>
    <rtept lat="10.5" lon="105.5"></rtept>
    <rtept lat="10.6" lon="105.6"></rtept>
  </rte>
</gpx>`;

describe('parseGpx', () => {
  it('đọc trkpt: đủ 3 điểm, đúng lat/lon/ele', () => {
    const pts = parseGpx(TRK_GPX);
    expect(pts).toHaveLength(3);
    expect(pts[0]).toEqual({ lat: 21, lon: 103, ele: 1000 });
    expect(pts[2]).toEqual({ lat: 21.002, lon: 103, ele: 1050 });
  });

  it('fallback rtept khi không có trk; thiếu ele → null', () => {
    const pts = parseGpx(RTE_GPX);
    expect(pts).toHaveLength(2);
    expect(pts[0]).toEqual({ lat: 10.5, lon: 105.5, ele: null });
  });

  it('XML không phải GPX → BadRequestException', () => {
    expect(() => parseGpx('<html><body>khong phai gpx</body></html>'))
      .toThrow(BadRequestException);
  });

  it('GPX rỗng / dưới 2 điểm hợp lệ → BadRequestException', () => {
    expect(() => parseGpx('<gpx version="1.1"></gpx>')).toThrow(BadRequestException);
    expect(() =>
      parseGpx('<gpx><trk><trkseg><trkpt lat="21" lon="103"/></trkseg></trk></gpx>'),
    ).toThrow(BadRequestException);
  });

  it('lọc bỏ điểm lat/lon không phải số', () => {
    const dirty = `<gpx><trk><trkseg>
      <trkpt lat="21.0" lon="103.0"><ele>10</ele></trkpt>
      <trkpt lat="abc" lon="103.1"><ele>20</ele></trkpt>
      <trkpt lat="21.2" lon="103.2"><ele>30</ele></trkpt>
    </trkseg></trk></gpx>`;
    expect(parseGpx(dirty)).toHaveLength(2);
  });
});

describe('haversineM', () => {
  it('0.001° vĩ trên cùng kinh tuyến ≈ 111.2m', () => {
    const d = haversineM({ lat: 21, lon: 103, ele: null }, { lat: 21.001, lon: 103, ele: null });
    expect(d).toBeGreaterThan(110);
    expect(d).toBeLessThan(112);
  });

  it('cùng điểm = 0', () => {
    expect(haversineM({ lat: 21, lon: 103, ele: 5 }, { lat: 21, lon: 103, ele: 5 })).toBe(0);
  });
});

describe('trackStats — leo/xuống/max/min', () => {
  it('1000→1100→1050: leo 100, xuống 50, max 1100, min 1000, ~222m', () => {
    const stats = trackStats(parseGpx(TRK_GPX));
    expect(stats.ascentM).toBe(100);
    expect(stats.descentM).toBe(50);
    expect(stats.maxEleM).toBe(1100);
    expect(stats.minEleM).toBe(1000);
    expect(stats.distanceM).toBe(222); // 2 đoạn × 111.19m → round
  });

  it('không có ele → leo/xuống 0, max/min 0', () => {
    const stats = trackStats(parseGpx(RTE_GPX));
    expect(stats.ascentM).toBe(0);
    expect(stats.descentM).toBe(0);
    expect(stats.maxEleM).toBe(0);
    expect(stats.minEleM).toBe(0);
    expect(stats.distanceM).toBeGreaterThan(0);
  });
});
