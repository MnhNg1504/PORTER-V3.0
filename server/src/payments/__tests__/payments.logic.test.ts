import {
  computePricing, refundOnCancel, daysUntil, canTransition, isPendingExpired,
  BUYER_SURCHARGE_RATE, SELLER_DEDUCT_RATE,
} from '../payments.logic';

describe('computePricing — phí 10% chia đôi (QĐ-2)', () => {
  it('350k × 3 người: khách +5%, người bán −5%, Potter giữ 10%', () => {
    const p = computePricing(350_000, 3);
    expect(p.subtotalVnd).toBe(1_050_000);
    expect(p.buyerTotalVnd).toBe(1_102_500); // ×1.05
    expect(p.sellerPayoutVnd).toBe(997_500); // ×0.95
    expect(p.potterFeeVnd).toBe(105_000); // = 10% subtotal
    expect(p.depositVnd).toBe(330_750); // 30% buyerTotal
  });

  it('phí Potter luôn = khách trả − người bán nhận', () => {
    const p = computePricing(499_999, 4);
    expect(p.potterFeeVnd).toBe(p.buyerTotalVnd - p.sellerPayoutVnd);
  });

  it('tỷ lệ chia đôi đúng hằng số', () => {
    expect(BUYER_SURCHARGE_RATE).toBe(0.05);
    expect(SELLER_DEDUCT_RATE).toBe(0.05);
  });

  it('headcount tối thiểu 1, unit âm về 0', () => {
    expect(computePricing(-5, 0)).toMatchObject({ unitVnd: 0, headcount: 1, subtotalVnd: 0 });
  });
});

describe('refundOnCancel — thang hoàn cọc (QĐ-1)', () => {
  const now = new Date('2026-08-01T00:00:00Z');
  const dep = 300_000;

  it('≥7 ngày trước: hoàn 100%', () => {
    const r = refundOnCancel(dep, '2026-08-10', now);
    expect(r.tier).toBe('100');
    expect(r.refundVnd).toBe(300_000);
    expect(r.forfeitVnd).toBe(0);
  });

  it('3–7 ngày: hoàn 50%, phần mất chia đôi seller/Potter', () => {
    const r = refundOnCancel(dep, '2026-08-05', now); // 4 ngày
    expect(r.tier).toBe('50');
    expect(r.refundVnd).toBe(150_000);
    expect(r.forfeitVnd).toBe(150_000);
    expect(r.sellerKeepVnd).toBe(75_000);
    expect(r.potterKeepVnd).toBe(75_000);
  });

  it('<72h (dưới 3 ngày): hoàn 0%', () => {
    const r = refundOnCancel(dep, '2026-08-02', now); // 1 ngày
    expect(r.tier).toBe('0');
    expect(r.refundVnd).toBe(0);
    expect(r.forfeitVnd).toBe(300_000);
    expect(r.sellerKeepVnd).toBe(150_000);
    expect(r.potterKeepVnd).toBe(150_000);
  });

  it('bão (force majeure) ghi đè: hoàn 100% dù sát ngày', () => {
    const r = refundOnCancel(dep, '2026-08-01T06:00:00Z', now, true);
    expect(r.tier).toBe('force_majeure');
    expect(r.refundVnd).toBe(300_000);
    expect(r.forfeitVnd).toBe(0);
  });

  it('mốc chính xác 7 ngày = 100%, 3 ngày = 50%', () => {
    expect(refundOnCancel(dep, '2026-08-08', now).tier).toBe('100'); // đúng 7
    expect(refundOnCancel(dep, '2026-08-04', now).tier).toBe('50'); // đúng 3
  });
});

describe('daysUntil', () => {
  it('tính đúng số ngày', () => {
    expect(daysUntil('2026-08-08', '2026-08-01')).toBeCloseTo(7, 5);
  });
});

describe('máy trạng thái đơn (vá H1)', () => {
  it('chuyển hợp lệ', () => {
    expect(canTransition('pending', 'deposited')).toBe(true);
    expect(canTransition('deposited', 'confirmed')).toBe(true);
    expect(canTransition('confirmed', 'completed')).toBe(true);
    expect(canTransition('deposited', 'refunded')).toBe(true);
  });
  it('chặn chuyển sai', () => {
    expect(canTransition('pending', 'completed')).toBe(false);
    expect(canTransition('completed', 'pending')).toBe(false);
    expect(canTransition('cancelled', 'deposited')).toBe(false);
  });
  it('pending quá TTL 30 phút → hết hạn', () => {
    const created = new Date('2026-08-01T00:00:00Z');
    expect(isPendingExpired(created, new Date('2026-08-01T00:20:00Z'))).toBe(false);
    expect(isPendingExpired(created, new Date('2026-08-01T00:31:00Z'))).toBe(true);
  });
});
