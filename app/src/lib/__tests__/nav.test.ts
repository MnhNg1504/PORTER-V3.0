import { generateTurns, nextTurn, checkOffRoute, estimateEta } from '../nav';
import { computeStats } from '../gpx';
import type { GpxPoint } from '../gpx';

/** Đường chữ L: đi thẳng lên bắc ~550m rồi rẽ phải sang đông ~550m (mỗi bước ~11m). */
function lShapedTrack(): GpxPoint[] {
  const pts: GpxPoint[] = [];
  for (let i = 0; i <= 50; i++) pts.push({ lat: 21.2 + i * 0.0001, lon: 104.4, ele: 1000 + i });
  for (let i = 1; i <= 50; i++) pts.push({ lat: 21.205, lon: 104.4 + i * 0.0001, ele: 1050 + i });
  return pts;
}

describe('generateTurns', () => {
  it('phát hiện đúng 1 khúc rẽ phải ở góc chữ L', () => {
    const pts = lShapedTrack();
    const { cum } = computeStats(pts);
    const turns = generateTurns(pts, cum);
    expect(turns.length).toBe(1);
    expect(turns[0].dir).toBe('right');
    // Góc thật 90° nhưng cửa sổ bearing ±5 điểm làm góc đo mềm hơn (~54°)
    expect(turns[0].angle).toBeGreaterThan(30);
  });

  it('đường thẳng không có khúc rẽ', () => {
    const pts: GpxPoint[] = [];
    for (let i = 0; i <= 100; i++) pts.push({ lat: 21.2 + i * 0.0001, lon: 104.4, ele: null });
    const { cum } = computeStats(pts);
    expect(generateTurns(pts, cum)).toHaveLength(0);
  });
});

describe('nextTurn', () => {
  it('trả khúc rẽ kế tiếp sau vị trí d', () => {
    const turns = [
      { at: 200, dir: 'left' as const, angle: 45 },
      { at: 700, dir: 'right' as const, angle: 80 },
    ];
    expect(nextTurn(turns, 0)?.at).toBe(200);
    expect(nextTurn(turns, 300)?.at).toBe(700);
    expect(nextTurn(turns, 800)).toBeUndefined();
  });
});

describe('checkOffRoute', () => {
  const pts = lShapedTrack();

  it('điểm nằm trên tuyến -> không lệch', () => {
    const r = checkOffRoute({ lat: 21.202, lon: 104.4 }, pts, false);
    expect(r.offRoute).toBe(false);
    expect(r.distanceToTrack).toBeLessThan(30);
  });

  it('điểm cách tuyến ~1km -> lệch tuyến', () => {
    const r = checkOffRoute({ lat: 21.19, lon: 104.41 }, pts, false);
    expect(r.offRoute).toBe(true);
    expect(r.distanceToTrack).toBeGreaterThan(300);
  });

  it('hysteresis: đang off-route thì ngưỡng RA thấp hơn (35m vẫn tính là off)', () => {
    // Điểm cách tuyến ~35m: chưa VÀO off (ngưỡng enter 50) nhưng chưa RA khi đang off (exit 30)
    const near = { lat: 21.202, lon: 104.40034 }; // ~35m về phía đông
    expect(checkOffRoute(near, pts, false).offRoute).toBe(false);
    expect(checkOffRoute(near, pts, true).offRoute).toBe(true);
  });
});

describe('estimateEta', () => {
  it('2.5km/h: 2500m = "1h00"', () => {
    expect(estimateEta(2500)).toBe('1h00');
  });
  it('dưới 1 giờ trả về phút', () => {
    expect(estimateEta(1250)).toBe('30 phút');
  });
});
