import { Injectable } from '@nestjs/common';

export interface DepositRequest {
  orderId: string;
  amountVnd: number;
  description: string;
}

export interface DepositSession {
  pspRef: string; // mã giao dịch cổng — dùng cho idempotency
  payUrl: string; // URL app mở để trả tiền (sandbox: giả)
}

export interface WebhookResult {
  orderId: string;
  pspRef: string;
  paid: boolean;
}

/**
 * Cổng thanh toán trừu tượng. Production nối VNPay/MoMo (cần pháp nhân + hợp đồng —
 * docs/17 §0, docs/18). Ở Giai đoạn 1 dùng SandboxGateway để chạy luồng end-to-end
 * mà KHÔNG đụng tiền thật.
 */
export abstract class PaymentGateway {
  abstract createDeposit(req: DepositRequest): Promise<DepositSession>;
  /** Xác thực + giải mã webhook cổng trả về (idempotent theo pspRef ở tầng service). */
  abstract verifyWebhook(payload: Record<string, unknown>): WebhookResult;
  abstract refund(pspRef: string, amountVnd: number): Promise<{ ok: boolean }>;
}

/**
 * Sandbox: không gọi mạng, không tiền thật. pspRef suy diễn từ orderId nên ổn định →
 * webhook lặp lại vẫn cùng ref (idempotency test được). "payUrl" chỉ là chỗ giữ chỗ.
 */
@Injectable()
export class SandboxGateway extends PaymentGateway {
  createDeposit(req: DepositRequest): Promise<DepositSession> {
    const pspRef = `sbx_${req.orderId}`;
    return Promise.resolve({ pspRef, payUrl: `potter-sandbox://pay/${pspRef}` });
  }

  verifyWebhook(payload: Record<string, unknown>): WebhookResult {
    return {
      orderId: String(payload.orderId ?? ''),
      pspRef: String(payload.pspRef ?? `sbx_${payload.orderId ?? ''}`),
      paid: payload.paid !== false,
    };
  }

  refund(): Promise<{ ok: boolean }> {
    return Promise.resolve({ ok: true });
  }
}
