/**
 * Logic THUẦN xác minh checkpoint & điểm hoàn thành cung (docs/08 C1 + C3).
 * Không phụ thuộc DB — unit test trực tiếp.
 */

export type EvidenceVerdict = 'verified' | 'suspect' | 'failed';

export interface EvidenceCheckInput {
  dCheckpointM: number; // khoảng cách ảnh -> checkpoint (m)
  dRouteM: number; // khoảng cách ảnh -> polyline cung (m)
  speedKmh: number | null; // tốc độ suy ra từ evidence trước (null = evidence đầu)
  eleDiffM: number | null; // |ele ảnh - ele checkpoint| (null = thiếu dữ liệu độ cao)
  accuracyM: number | null; // sai số GPS client báo
  isMockProvider: boolean; // client phát hiện GPS giả lập
}

/** Ngưỡng docs/08 C1 + docs/09 §2: 50m chuẩn, nới theo accuracy, trần 80m */
export function checkpointThresholdM(accuracyM: number | null): number {
  if (accuracyM == null || accuracyM <= 20) return 50;
  return Math.min(80, accuracyM + 30);
}

/** 5 bước validate 1 evidence (docs/08 C1) */
export function evaluateEvidence(inp: EvidenceCheckInput): { verdict: EvidenceVerdict; reason: string } {
  if (inp.isMockProvider) return { verdict: 'failed', reason: 'GPS giả lập (mock provider)' };

  const th = checkpointThresholdM(inp.accuracyM);
  if (inp.dCheckpointM > th) {
    return { verdict: 'failed', reason: `Cách checkpoint ${Math.round(inp.dCheckpointM)}m > ngưỡng ${th}m` };
  }
  if (inp.dRouteM > th) {
    return { verdict: 'failed', reason: `Cách tuyến ${Math.round(inp.dRouteM)}m > ngưỡng ${th}m` };
  }
  // Tốc độ leo núi hợp lý ≤6km/h (chống teleport/đi xe) — vi phạm = suspect (không failed,
  // vì GPS drift đoạn trước có thể thổi phồng tốc độ)
  if (inp.speedKmh != null && inp.speedKmh > 6) {
    return { verdict: 'suspect', reason: `Tốc độ suy ra ${inp.speedKmh.toFixed(1)}km/h > 6km/h` };
  }
  // Độ cao khớp ±150m (chống spoof toạ độ ngồi nhà) — thiếu dữ liệu thì bỏ qua bước này
  if (inp.eleDiffM != null && inp.eleDiffM > 150) {
    return { verdict: 'suspect', reason: `Lệch độ cao ${Math.round(inp.eleDiffM)}m > 150m` };
  }
  return { verdict: 'verified', reason: 'Đạt cả 5 bước' };
}

/** Tốc độ giữa 2 evidence (km/h); null nếu không tính được */
export function speedBetweenKmh(
  distM: number, t1: Date | string, t2: Date | string,
): number | null {
  const ms = new Date(t2).getTime() - new Date(t1).getTime();
  if (!Number.isFinite(ms) || ms <= 0) return null;
  return distM / 1000 / (ms / 3_600_000);
}

/** Liên tục thời gian (docs/08 C3): không khoảng trống >4h giữa 2 evidence liên tiếp */
export function isContinuous(times: Array<Date | string>, maxGapHours = 4): boolean {
  if (times.length < 2) return true;
  const sorted = times.map((t) => new Date(t).getTime()).sort((a, b) => a - b);
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] - sorted[i - 1] > maxGapHours * 3_600_000) return false;
  }
  return true;
}

/** Điểm xác minh docs/08 C3: 0.6 checkpoint + 0.2 mốc km + 0.2 liên tục */
export function computeVerifyScore(p: {
  verifiedCheckpoints: number;
  totalCheckpoints: number;
  kmMarksHit: number;
  kmMarksTotal: number;
  continuous: boolean;
}): number {
  const cp = p.totalCheckpoints > 0 ? p.verifiedCheckpoints / p.totalCheckpoints : 0;
  const km = p.kmMarksTotal > 0 ? Math.min(1, p.kmMarksHit / p.kmMarksTotal) : 1;
  const score = 0.6 * cp + 0.2 * km + 0.2 * (p.continuous ? 1 : 0);
  return Math.round(score * 100) / 100;
}

export const CERTIFIED_THRESHOLD = 0.7;
/** Uy tín cộng khi CERTIFIED (docs/04 — hoàn thành cung có xác minh) */
export const REPUTATION_CERTIFIED = 25;
