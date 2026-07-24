/**
 * POTTER 3.0 — Client gọi module PAYMENTS (đặt cung có người dẫn + escrow, docs/16).
 * Bọc các endpoint sandbox CEO đang dựng ở server/src/payments.
 *
 * Kiểu tiền: server lưu bigint VND nguyên -> TypeORM trả về STRING trong JSON.
 * Vì vậy các field tiền trên `Order` để `string`, còn `Pricing` (từ payments.logic,
 * tính runtime) là `number`. Dùng `toVnd()` / `formatVnd()` khi hiển thị cho an toàn.
 *
 * TODO(verify): shape JSON thực tế của response chưa chạy được (controller chưa merge) —
 * đã bám đúng order.entity.ts / escrow-entry.entity.ts / payments.logic.ts hiện có.
 */

// ==== CẤU HÌNH (base URL + JWT) ============================================
// App chưa có lớp config tập trung; giữ đơn giản: biến module + setter.
// CEO nối vào lúc đăng nhập: configurePaymentsApi({ baseUrl, token }).
let API_BASE_URL = 'http://localhost:3000'; // TODO(verify): trỏ về API sandbox thật
let AUTH_TOKEN: string | null = null;
// DEMO1: mặc định BẬT — app chạy độc lập trên iPhone không cần server (booking mô phỏng
// cục bộ, KHÔNG tiền thật). Nối backend thật: configurePaymentsApi({ baseUrl, demo:false }).
let DEMO_MODE = true;

export function configurePaymentsApi(cfg: { baseUrl?: string; token?: string | null; demo?: boolean }): void {
  if (cfg.baseUrl !== undefined) API_BASE_URL = cfg.baseUrl.replace(/\/+$/, '');
  if (cfg.token !== undefined) AUTH_TOKEN = cfg.token;
  if (cfg.demo !== undefined) DEMO_MODE = cfg.demo;
}

export function isDemoMode(): boolean {
  return DEMO_MODE;
}

export function setAuthToken(token: string | null): void {
  AUTH_TOKEN = token;
}

// ==== KIỂU DỮ LIỆU (bám server/src/payments) ================================

/** Máy trạng thái đơn (payments.logic.ts). */
export type OrderStatus =
  | 'pending' | 'deposited' | 'confirmed' | 'completed'
  | 'cancelled' | 'refunded' | 'disputed';

/** Thang hoàn cọc khi hủy (QĐ-1 / QĐ-5). */
export type RefundTier = '100' | '50' | '0' | 'force_majeure';

/** Loại bút toán trên sổ escrow (escrow-entry.entity.ts). */
export type EscrowKind =
  | 'deposit_in' | 'refund_out' | 'seller_forfeit' | 'potter_fee' | 'payout_out';

/** Bảng giá (payments.logic.ts `Pricing`) — số VND nguyên. */
export interface Pricing {
  unitVnd: number;
  headcount: number;
  subtotalVnd: number;
  buyerTotalVnd: number;   // khách trả = subtotal * 1.05
  sellerPayoutVnd: number; // người bán nhận = subtotal * 0.95
  potterFeeVnd: number;    // Potter giữ = subtotal * 0.10
  depositVnd: number;      // cọc = 30% buyerTotal
}

/** Một đơn đặt cung (order.entity.ts). Field tiền là STRING (bigint TypeORM). */
export interface Order {
  id: string;
  tripDate: string; // YYYY-MM-DD
  headcount: number;
  unitVnd: string;
  subtotalVnd: string;
  buyerTotalVnd: string;
  sellerPayoutVnd: string;
  potterFeeVnd: string;
  depositVnd: string;
  status: OrderStatus;
  pspRef?: string | null;
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

/** Một dòng sổ escrow (escrow-entry.entity.ts). */
export interface EscrowEntry {
  id: string;
  kind: EscrowKind;
  amountVnd: string; // luôn ≥0; hướng tiền suy từ kind
  note?: string | null;
  createdAt: string;
}

/** GET /orders/:id — đơn kèm sổ escrow. */
export interface OrderWithLedger extends Order {
  escrow: EscrowEntry[]; // TODO(verify): tên field ledger từ server
}

/** POST /orders — kết quả tạo đơn 'pending'. */
export interface CreateOrderResult {
  order: Order;
  pricing: Pricing;
  sandboxPayRef: string;
}

/** POST /orders/:id/cancel — kết quả hoàn cọc. */
export interface CancelResult {
  refundVnd: number;
  tier: RefundTier;
}

export interface CreateOrderInput {
  routeSlug: string;
  tripDate: string; // YYYY-MM-DD
  headcount: number;
  /** DEMO1: đơn giá 1 suất để tính đơn cục bộ khi chưa có backend (server bỏ qua field này). */
  demoUnitVnd?: number;
}

// ==== HẰNG SỐ LUẬT TIỀN (mirror payments.logic.ts — cho preview client) =====
export const BUYER_SURCHARGE_RATE = 0.05; // khách +5%
export const SELLER_DEDUCT_RATE = 0.05;   // người bán -5%
export const DEPOSIT_RATE = 0.3;          // cọc 30% buyerTotal
export const PENDING_TTL_MINUTES = 30;    // TTL đơn chưa cọc (vá H1)

/**
 * Tính giá PREVIEW phía client (mirror computePricing của server) để hiện bảng
 * giá trước khi bấm đặt cọc. Server vẫn là nguồn sự thật cuối cùng.
 */
export function previewPricing(unitVnd: number, headcount: number): Pricing {
  const unit = Math.max(0, Math.trunc(unitVnd));
  const n = Math.max(1, Math.trunc(headcount));
  const subtotal = unit * n;
  const buyerTotal = Math.round(subtotal * (1 + BUYER_SURCHARGE_RATE));
  const sellerPayout = Math.round(subtotal * (1 - SELLER_DEDUCT_RATE));
  const potterFee = buyerTotal - sellerPayout;
  const deposit = Math.round(buyerTotal * DEPOSIT_RATE);
  return {
    unitVnd: unit, headcount: n, subtotalVnd: subtotal,
    buyerTotalVnd: buyerTotal, sellerPayoutVnd: sellerPayout,
    potterFeeVnd: potterFee, depositVnd: deposit,
  };
}

/**
 * Preview thang hoàn cọc khi hủy (mirror refundOnCancel) — hiện CHO KHÁCH XEM
 * trước khi xác nhận hủy. Server tính lại con số cuối.
 * ≥7 ngày 100% · 3–7 ngày 50% · <72h 0% · bão = 100%.
 */
export function previewRefund(
  depositVnd: number,
  tripDate: string,
  now: Date = new Date(),
  forceMajeure = false,
): { tier: RefundTier; refundVnd: number; forfeitVnd: number } {
  const dep = Math.max(0, Math.trunc(depositVnd));
  const days = (new Date(tripDate).getTime() - now.getTime()) / 86_400_000;
  let tier: RefundTier;
  let refund: number;
  if (forceMajeure) { tier = 'force_majeure'; refund = dep; }
  else if (days >= 7) { tier = '100'; refund = dep; }
  else if (days >= 3) { tier = '50'; refund = Math.round(dep * 0.5); }
  else { tier = '0'; refund = 0; }
  return { tier, refundVnd: refund, forfeitVnd: dep - refund };
}

// ==== TIỆN ÍCH TIỀN =========================================================

/** Ép field tiền (string bigint hoặc number) về number an toàn. */
export function toVnd(v: string | number | null | undefined): number {
  if (v == null) return 0;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

/** Định dạng VND kiểu "1.234.567đ". */
export function formatVnd(v: string | number | null | undefined): string {
  return `${toVnd(v).toLocaleString('vi-VN')}đ`;
}

// ==== LỚP GỌI HTTP ==========================================================

/** Lỗi API có kèm mã HTTP để UI xử lý (409 idempotent, 422 sai trạng thái...). */
export class PaymentsApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = 'PaymentsApiError';
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(init?.headers as Record<string, string> | undefined),
  };
  if (AUTH_TOKEN) headers.Authorization = `Bearer ${AUTH_TOKEN}`;

  const res = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });
  const text = await res.text();
  const body = text ? safeJson(text) : null;

  if (!res.ok) {
    const msg =
      (body && (body.message || body.error)) ||
      `Yêu cầu thất bại (${res.status})`;
    throw new PaymentsApiError(res.status, Array.isArray(msg) ? msg.join(', ') : String(msg));
  }
  return body as T;
}

function safeJson(text: string): any {
  try { return JSON.parse(text); } catch { return null; }
}

// ==== DEMO1: store cục bộ (mô phỏng backend, KHÔNG tiền thật) ================
// Cho phép demo trọn luồng đặt cọc trên iPhone mà không cần chạy server NestJS.
const demoStore = new Map<string, OrderWithLedger>();
let demoSeq = 0;

function demoNow(): string {
  return new Date().toISOString();
}

function demoOrderNotFound(id: string): PaymentsApiError {
  return new PaymentsApiError(404, `Đơn ${id} không tồn tại (demo)`);
}

function demoCreate(input: CreateOrderInput): CreateOrderResult {
  const p = previewPricing(input.demoUnitVnd ?? 0, input.headcount);
  const id = `demo_${++demoSeq}`;
  const now = demoNow();
  const order: OrderWithLedger = {
    id, tripDate: input.tripDate, headcount: p.headcount,
    unitVnd: String(p.unitVnd), subtotalVnd: String(p.subtotalVnd),
    buyerTotalVnd: String(p.buyerTotalVnd), sellerPayoutVnd: String(p.sellerPayoutVnd),
    potterFeeVnd: String(p.potterFeeVnd), depositVnd: String(p.depositVnd),
    status: 'pending', pspRef: `sbx_${id}`, createdAt: now, updatedAt: now, escrow: [],
  };
  demoStore.set(id, order);
  return { order, pricing: p, sandboxPayRef: order.pspRef! };
}

function demoGet(id: string): OrderWithLedger {
  const o = demoStore.get(id);
  if (!o) throw demoOrderNotFound(id);
  return o;
}

function demoLedger(o: OrderWithLedger, kind: EscrowKind, amountVnd: number, note: string) {
  if (amountVnd <= 0) return;
  o.escrow.push({ id: `e_${o.escrow.length + 1}`, kind, amountVnd: String(amountVnd), note, createdAt: demoNow() });
}

// ==== ENDPOINT ==============================================================

/** POST /orders — tạo đơn 'pending'. */
export function createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
  if (DEMO_MODE) return Promise.resolve(demoCreate(input));
  return request<CreateOrderResult>('/orders', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

/** POST /orders/:id/pay-sandbox — mô phỏng PSP callback (pending → deposited, idempotent). */
export function paySandbox(orderId: string): Promise<Order> {
  if (DEMO_MODE) {
    const o = demoGet(orderId);
    if (o.status === 'pending') {
      o.status = 'deposited'; o.updatedAt = demoNow();
      demoLedger(o, 'deposit_in', toVnd(o.depositVnd), 'Khách nạp cọc vào escrow (demo)');
    }
    return Promise.resolve(o);
  }
  return request<Order>(`/orders/${orderId}/pay-sandbox`, { method: 'POST' });
}

/** POST /orders/:id/confirm — người bán xác nhận (deposited → confirmed). */
export function confirmOrder(orderId: string): Promise<Order> {
  if (DEMO_MODE) {
    const o = demoGet(orderId);
    if (o.status === 'deposited') { o.status = 'confirmed'; o.updatedAt = demoNow(); }
    return Promise.resolve(o);
  }
  return request<Order>(`/orders/${orderId}/confirm`, { method: 'POST' });
}

/** POST /orders/:id/complete — khách xác nhận xong (confirmed → completed). */
export function completeOrder(orderId: string): Promise<Order> {
  if (DEMO_MODE) {
    const o = demoGet(orderId);
    if (o.status === 'confirmed') {
      o.status = 'completed'; o.updatedAt = demoNow();
      demoLedger(o, 'payout_out', toVnd(o.sellerPayoutVnd), 'Trả người bán (demo)');
      demoLedger(o, 'potter_fee', toVnd(o.potterFeeVnd), 'Phí Potter 10% (demo)');
    }
    return Promise.resolve(o);
  }
  return request<Order>(`/orders/${orderId}/complete`, { method: 'POST' });
}

/** POST /orders/:id/cancel — khách hủy, tính hoàn cọc QĐ-1. */
export function cancelOrder(orderId: string): Promise<CancelResult> {
  if (DEMO_MODE) {
    const o = demoGet(orderId);
    if (o.status === 'pending') {
      o.status = 'cancelled'; o.updatedAt = demoNow();
      return Promise.resolve({ refundVnd: 0, tier: '100' });
    }
    const r = previewRefund(toVnd(o.depositVnd), o.tripDate);
    o.status = 'refunded'; o.updatedAt = demoNow();
    demoLedger(o, 'refund_out', r.refundVnd, `Hoàn cọc demo (${r.tier})`);
    return Promise.resolve({ refundVnd: r.refundVnd, tier: r.tier });
  }
  return request<CancelResult>(`/orders/${orderId}/cancel`, { method: 'POST' });
}

/** GET /orders/mine — danh sách đơn của khách. */
export function getMyOrders(): Promise<Order[]> {
  if (DEMO_MODE) {
    return Promise.resolve([...demoStore.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  }
  return request<Order[]>('/orders/mine', { method: 'GET' });
}

/** GET /orders/:id — chi tiết đơn kèm sổ escrow. */
export function getOrder(orderId: string): Promise<OrderWithLedger> {
  if (DEMO_MODE) return Promise.resolve(demoGet(orderId));
  return request<OrderWithLedger>(`/orders/${orderId}`, { method: 'GET' });
}
