import { ForbiddenException } from '@nestjs/common';
import type { Difficulty } from '../routes/route.entity';

export interface TierAccess {
  allowed: boolean;
  requiresGuide: boolean;
  reason?: string;
}

/**
 * Quyền TIẾP CẬN cung theo cấp user (docs/04 + quyết định HĐQT QĐ-4, docs/16).
 *
 * - Admin & Cấp 2+  : tiếp cận mọi cung.
 * - Cấp 1 (Mới)     :
 *     · cung Dễ    → tự đi được.
 *     · cung Chuẩn → BẮT BUỘC đi kèm người hướng dẫn (đặt guide — mở ở GĐ thanh toán);
 *                    tạm chặn tự đi (server chặn THẬT, không chỉ là cờ ở app).
 *     · cung Khó   → cấm hẳn, KỂ CẢ cung miễn phí.
 *
 * Trả về requiresGuide để tầng trên (app) hiển thị đúng; nhưng quyết định chặn/không
 * nằm ở `allowed` và được enforce server-side ở mọi cửa (mua, tải track, đi cung).
 */
export function tierAccess(
  tier: number,
  role: string,
  difficulty: Difficulty,
): TierAccess {
  if (role === 'admin' || tier >= 2) return { allowed: true, requiresGuide: false };
  if (difficulty === 'easy') return { allowed: true, requiresGuide: false };
  if (difficulty === 'hard') {
    return {
      allowed: false,
      requiresGuide: true,
      reason:
        'Cấp 1 không thể đi cung Khó — cần lên Cấp 2 hoặc tham gia tour có tổ chức (docs/04 · QĐ-4)',
    };
  }
  // standard
  return {
    allowed: false,
    requiresGuide: true,
    reason:
      'Cấp 1 cần đi kèm người hướng dẫn cho cung Chuẩn — đặt guide mở ở giai đoạn thanh toán (docs/04 · QĐ-4)',
  };
}

/** Ném ForbiddenException nếu cấp user không được tiếp cận cung này. */
export function assertTierAccess(tier: number, role: string, difficulty: Difficulty): void {
  const a = tierAccess(tier, role, difficulty);
  if (!a.allowed) throw new ForbiddenException(a.reason);
}

/**
 * Quyền ĐẶT ĐƠN có người dẫn (khác tierAccess: đơn LUÔN kèm guide nên Cấp 1 đặt được
 * cung Chuẩn — thoả QĐ-4 "cung Chuẩn bắt buộc đặt guide"). Cung Khó vẫn cấm Cấp 1.
 */
export function assertCanBook(tier: number, role: string, difficulty: Difficulty): void {
  if (role === 'admin' || tier >= 2) return;
  if (difficulty === 'hard') {
    throw new ForbiddenException(
      'Cấp 1 không thể đặt cung Khó — cần lên Cấp 2 hoặc tham gia tour tổ chức (docs/04 · QĐ-4)',
    );
  }
  // easy & standard: được đặt vì đơn đã kèm người dẫn.
}
