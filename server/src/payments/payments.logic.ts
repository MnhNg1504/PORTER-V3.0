/**
 * Logic THUẦN cho đặt cung có người dẫn + escrow (docs/16 QĐ-1,2,5).
 * Không phụ thuộc DB/khung — unit test trực tiếp. Mọi số là VND nguyên (không thập phân).
 */

/** Phí Potter 10%, CHIA ĐÔI (QĐ-2): 5% cộng giá khách, 5% trừ payout người bán. */
export const POTTER_FEE_RATE = 0.1;
export const BUYER_SURCHARGE_RATE = 0.05; // khách trả thêm
export const SELLER_DEDUCT_RATE = 0.05; // người bán bị trừ
/** Cọc 30% giá trị đơn (QĐ đã chốt). */
export const DEPOSIT_RATE = 0.3;

export interface Pricing {
  unitVnd: number; // giá 1 suất người bán đặt
  headcount: number;
  subtotalVnd: number; // giá gốc = unit * headcount
  buyerTotalVnd: number; // khách phải trả = subtotal * 1.05
  sellerPayoutVnd: number; // người bán nhận = subtotal * 0.95
  potterFeeVnd: number; // Potter giữ = subtotal * 0.10
  depositVnd: number; // cọc = 30% buyerTotal
}

/** Tính tiền một đơn (QĐ-2 chia đôi + cọc 30%). */
export function computePricing(unitVnd: number, headcount: number): Pricing {
  const unit = Math.max(0, Math.trunc(unitVnd));
  const n = Math.max(1, Math.trunc(headcount));
  const subtotal = unit * n;
  const buyerTotal = Math.round(subtotal * (1 + BUYER_SURCHARGE_RATE));
  const sellerPayout = Math.round(subtotal * (1 - SELLER_DEDUCT_RATE));
  const potterFee = buyerTotal - sellerPayout; // = subtotal * 0.10 (bù chênh làm tròn)
  const deposit = Math.round(buyerTotal * DEPOSIT_RATE);
  return {
    unitVnd: unit, headcount: n, subtotalVnd: subtotal,
    buyerTotalVnd: buyerTotal, sellerPayoutVnd: sellerPayout,
    potterFeeVnd: potterFee, depositVnd: deposit,
  };
}

export type RefundTier = '100' | '50' | '0' | 'force_majeure';

export interface RefundOutcome {
  tier: RefundTier;
  refundVnd: number; // hoàn lại cho khách
  forfeitVnd: number; // phần cọc mất
  sellerKeepVnd: number; // người bán nhận từ phần mất (50%)
  potterKeepVnd: number; // Potter nhận từ phần mất (50%)
}

const DAY_MS = 86_400_000;

/** Số ngày trước ngày đi (âm nếu đã qua). */
export function daysUntil(tripDate: Date | string, now: Date | string): number {
  const ms = new Date(tripDate).getTime() - new Date(now).getTime();
  return ms / DAY_MS;
}

/**
 * Hoàn cọc khi khách hủy (QĐ-1): ≥7 ngày 100% · 3–7 ngày 50% · <72h (3 ngày) 0%.
 * Bất khả kháng (bão — QĐ-5) ghi đè: hoàn 100% bất kể mốc.
 * Phần cọc mất chia đôi seller/Potter (QĐ-1).
 */
export function refundOnCancel(
  depositVnd: number,
  tripDate: Date | string,
  now: Date | string,
  forceMajeure = false,
): RefundOutcome {
  const dep = Math.max(0, Math.trunc(depositVnd));
  const days = daysUntil(tripDate, now);

  let tier: RefundTier;
  let refund: number;
  if (forceMajeure) {
    tier = 'force_majeure';
    refund = dep;
  } else if (days >= 7) {
    tier = '100';
    refund = dep;
  } else if (days >= 3) {
    tier = '50';
    refund = Math.round(dep * 0.5);
  } else {
    tier = '0';
    refund = 0;
  }

  const forfeit = dep - refund;
  const sellerKeep = Math.round(forfeit * 0.5);
  const potterKeep = forfeit - sellerKeep;
  return { tier, refundVnd: refund, forfeitVnd: forfeit, sellerKeepVnd: sellerKeep, potterKeepVnd: potterKeep };
}

/**
 * Máy trạng thái đơn (vá H1 — pending có TTL, không kẹt vĩnh viễn).
 * pending → deposited → confirmed → completed
 *    ↓(TTL/hủy)          ↓(hủy→hoàn)   ↓
 * cancelled            refunded     (disputed nhánh khiếu nại)
 */
export type OrderStatus =
  | 'pending' | 'deposited' | 'confirmed' | 'completed'
  | 'cancelled' | 'refunded' | 'disputed';

export const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['deposited', 'cancelled'],
  deposited: ['confirmed', 'refunded', 'cancelled', 'disputed'],
  confirmed: ['completed', 'refunded', 'disputed'],
  completed: ['disputed'],
  cancelled: [],
  refunded: [],
  disputed: ['refunded', 'completed'],
};

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return ORDER_TRANSITIONS[from]?.includes(to) ?? false;
}

/** TTL đơn chưa cọc — quá hạn tự hủy (vá H1). */
export const PENDING_TTL_MINUTES = 30;

export function isPendingExpired(createdAt: Date | string, now: Date | string): boolean {
  const ms = new Date(now).getTime() - new Date(createdAt).getTime();
  return ms > PENDING_TTL_MINUTES * 60_000;
}
