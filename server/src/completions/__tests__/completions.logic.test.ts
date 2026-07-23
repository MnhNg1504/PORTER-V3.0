import {
  checkpointThresholdM, evaluateEvidence, speedBetweenKmh, isContinuous,
  computeVerifyScore, CERTIFIED_THRESHOLD,
} from '../completions.logic';

describe('checkpointThresholdM (docs/09 §2)', () => {
  it('GPS tốt (≤20m) -> ngưỡng chuẩn 50m', () => {
    expect(checkpointThresholdM(null)).toBe(50);
    expect(checkpointThresholdM(8)).toBe(50);
    expect(checkpointThresholdM(20)).toBe(50);
  });
  it('GPS yếu -> accuracy+30, trần 80m', () => {
    expect(checkpointThresholdM(35)).toBe(65);
    expect(checkpointThresholdM(60)).toBe(80);
    expect(checkpointThresholdM(200)).toBe(80);
  });
});

describe('evaluateEvidence — 5 bước docs/08 C1', () => {
  const base = {
    dCheckpointM: 20, dRouteM: 15, speedKmh: 3,
    eleDiffM: 40, accuracyM: 10, isMockProvider: false,
  };

  it('đạt cả 5 bước -> verified', () => {
    expect(evaluateEvidence(base).verdict).toBe('verified');
  });
  it('GPS giả lập -> failed ngay (chống spoof)', () => {
    expect(evaluateEvidence({ ...base, isMockProvider: true }).verdict).toBe('failed');
  });
  it('xa checkpoint quá ngưỡng -> failed', () => {
    const r = evaluateEvidence({ ...base, dCheckpointM: 51 });
    expect(r.verdict).toBe('failed');
    expect(r.reason).toContain('checkpoint');
  });
  it('GPS yếu nới ngưỡng: 70m với accuracy 45 -> vẫn verified', () => {
    expect(evaluateEvidence({ ...base, dCheckpointM: 70, accuracyM: 45 }).verdict).toBe('verified');
  });
  it('xa tuyến -> failed', () => {
    expect(evaluateEvidence({ ...base, dRouteM: 90 }).verdict).toBe('failed');
  });
  it('tốc độ >6km/h -> suspect (không failed — GPS drift)', () => {
    expect(evaluateEvidence({ ...base, speedKmh: 9 }).verdict).toBe('suspect');
  });
  it('lệch độ cao >150m -> suspect (chống ngồi nhà spoof toạ độ)', () => {
    expect(evaluateEvidence({ ...base, eleDiffM: 300 }).verdict).toBe('suspect');
  });
  it('thiếu độ cao -> bỏ qua bước 4, vẫn verified', () => {
    expect(evaluateEvidence({ ...base, eleDiffM: null }).verdict).toBe('verified');
  });
  it('evidence đầu tiên (speed null) -> không chặn', () => {
    expect(evaluateEvidence({ ...base, speedKmh: null }).verdict).toBe('verified');
  });
});

describe('speedBetweenKmh', () => {
  it('1km trong 30 phút = 2km/h', () => {
    expect(speedBetweenKmh(1000, '2026-07-22T08:00:00Z', '2026-07-22T08:30:00Z')).toBeCloseTo(2);
  });
  it('thời gian ngược/0 -> null (không tính được)', () => {
    expect(speedBetweenKmh(500, '2026-07-22T08:30:00Z', '2026-07-22T08:00:00Z')).toBeNull();
  });
});

describe('isContinuous (docs/08 C3 — không trống >4h)', () => {
  it('cách nhau 2-3h -> liên tục', () => {
    expect(isContinuous(['2026-07-22T06:00:00Z', '2026-07-22T09:00:00Z', '2026-07-22T11:30:00Z'])).toBe(true);
  });
  it('trống 5h -> đứt (nghi đi hôm khác chụp gộp)', () => {
    expect(isContinuous(['2026-07-22T06:00:00Z', '2026-07-22T11:30:00Z'])).toBe(false);
  });
  it('thứ tự lộn xộn vẫn sort đúng', () => {
    expect(isContinuous(['2026-07-22T11:00:00Z', '2026-07-22T08:00:00Z'])).toBe(true);
  });
});

describe('computeVerifyScore (docs/08 C3: 0.6 + 0.2 + 0.2)', () => {
  it('hoàn hảo = 1.0', () => {
    expect(computeVerifyScore({
      verifiedCheckpoints: 6, totalCheckpoints: 6, kmMarksHit: 8, kmMarksTotal: 8, continuous: true,
    })).toBe(1);
  });
  it('5/6 checkpoint + đủ km + liên tục = 0.9 -> CERTIFIED (khớp demo preview)', () => {
    const s = computeVerifyScore({
      verifiedCheckpoints: 5, totalCheckpoints: 6, kmMarksHit: 8, kmMarksTotal: 8, continuous: true,
    });
    expect(s).toBe(0.9);
    expect(s >= CERTIFIED_THRESHOLD).toBe(true);
  });
  it('chỉ 2/6 checkpoint dù còn lại đủ = 0.6 -> KHÔNG certified', () => {
    const s = computeVerifyScore({
      verifiedCheckpoints: 2, totalCheckpoints: 6, kmMarksHit: 8, kmMarksTotal: 8, continuous: true,
    });
    expect(s).toBe(0.6);
    expect(s >= CERTIFIED_THRESHOLD).toBe(false);
  });
  it('đứt liên tục mất 0.2', () => {
    expect(computeVerifyScore({
      verifiedCheckpoints: 6, totalCheckpoints: 6, kmMarksHit: 8, kmMarksTotal: 8, continuous: false,
    })).toBe(0.8);
  });
  it('cung không có checkpoint -> phần 0.6 = 0 (không tự nhận)', () => {
    expect(computeVerifyScore({
      verifiedCheckpoints: 0, totalCheckpoints: 0, kmMarksHit: 4, kmMarksTotal: 4, continuous: true,
    })).toBe(0.4);
  });
});
