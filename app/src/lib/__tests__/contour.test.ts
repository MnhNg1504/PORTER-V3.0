import {
  DemGrid, contourSegments, projectIso, buildContourScene, projectTrack, contourColor, toSvgPoints,
} from '../contour';

/** Lưới 2x2 (3x3 điểm) hình kim tự tháp: đỉnh 100m ở giữa, chân 0m. */
const PYRAMID: DemGrid = {
  n: 2,
  bbox: { minLon: 104, maxLon: 104.02, minLat: 21, maxLat: 21.02 },
  min: 0,
  max: 100,
  zoom: 13,
  elev: [
    0, 0, 0,
    0, 100, 0,
    0, 0, 0,
  ],
};

const ISO = { width: 300, height: 240, azimuth: 0 };

describe('contourSegments (marching squares)', () => {
  it('mức 50m cắt quanh đỉnh -> có đoạn ở cả 4 ô', () => {
    const segs = contourSegments(PYRAMID, 50);
    expect(segs.length).toBeGreaterThanOrEqual(4);
    segs.forEach((s) => expect(s.level).toBe(50));
  });

  it('mức cao hơn đỉnh -> không có đoạn nào', () => {
    expect(contourSegments(PYRAMID, 150)).toHaveLength(0);
  });

  it('toạ độ đoạn nằm trong lưới [0..n]', () => {
    for (const s of contourSegments(PYRAMID, 30)) {
      [s.ax, s.ay, s.bx, s.by].forEach((v) => {
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThanOrEqual(PYRAMID.n);
      });
    }
  });
});

describe('projectIso', () => {
  it('tâm lưới ở độ cao min -> đúng tâm ngang khung', () => {
    const p = projectIso(1, 1, 0, PYRAMID, ISO);
    expect(p.x).toBeCloseTo(150, 5);
  });

  it('độ cao càng lớn -> y càng nhỏ (nâng lên trên)', () => {
    const low = projectIso(1, 1, 0, PYRAMID, ISO);
    const high = projectIso(1, 1, 100, PYRAMID, ISO);
    expect(high.y).toBeLessThan(low.y);
  });
});

describe('buildContourScene', () => {
  it('sắp theo depth tăng dần (xa vẽ trước)', () => {
    const scene = buildContourScene(PYRAMID, 25, ISO);
    expect(scene.length).toBeGreaterThan(0);
    for (let i = 1; i < scene.length; i++) {
      expect(scene[i].depth).toBeGreaterThanOrEqual(scene[i - 1].depth);
    }
  });
});

describe('projectTrack', () => {
  it('điểm giữa bbox -> giữa khung', () => {
    const [p] = projectTrack([{ lon: 104.01, lat: 21.01, ele: 0 }], PYRAMID, ISO);
    expect(p.x).toBeCloseTo(150, 5);
  });
});

describe('contourColor', () => {
  it('hN=1 ra đúng Lime Signal #C9E265 = rgb(201,226,101)', () => {
    expect(contourColor(1)).toBe('rgb(201,226,101)');
  });
  it('hN=0 ra tông rêu tối', () => {
    expect(contourColor(0)).toBe('rgb(100,140,60)');
  });
});

describe('toSvgPoints', () => {
  it('format "x,y x,y" làm tròn 1 chữ số', () => {
    expect(toSvgPoints([{ x: 1.234, y: 5.678 }, { x: 2, y: 3 }])).toBe('1.2,5.7 2,3');
  });
});
