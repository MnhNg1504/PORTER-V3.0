import { ForbiddenException } from '@nestjs/common';
import { tierAccess, assertTierAccess } from '../access';

describe('tierAccess (docs/04 + QĐ-4)', () => {
  it('admin: mọi cung đều được, không cần guide', () => {
    for (const d of ['easy', 'standard', 'hard'] as const) {
      expect(tierAccess(1, 'admin', d)).toEqual({ allowed: true, requiresGuide: false });
    }
  });

  it('Cấp 2+: mọi cung đều được', () => {
    expect(tierAccess(2, 'user', 'hard')).toEqual({ allowed: true, requiresGuide: false });
    expect(tierAccess(3, 'user', 'standard')).toEqual({ allowed: true, requiresGuide: false });
  });

  it('Cấp 1 + cung Dễ: được tự đi', () => {
    expect(tierAccess(1, 'user', 'easy')).toEqual({ allowed: true, requiresGuide: false });
  });

  it('Cấp 1 + cung Chuẩn: chặn, cần guide', () => {
    const a = tierAccess(1, 'user', 'standard');
    expect(a.allowed).toBe(false);
    expect(a.requiresGuide).toBe(true);
    expect(a.reason).toMatch(/hướng dẫn/);
  });

  it('Cấp 1 + cung Khó: cấm hẳn', () => {
    const a = tierAccess(1, 'user', 'hard');
    expect(a.allowed).toBe(false);
    expect(a.reason).toMatch(/Khó/);
  });
});

describe('assertTierAccess', () => {
  it('không ném với cấp được phép', () => {
    expect(() => assertTierAccess(1, 'user', 'easy')).not.toThrow();
    expect(() => assertTierAccess(2, 'user', 'hard')).not.toThrow();
    expect(() => assertTierAccess(1, 'admin', 'hard')).not.toThrow();
  });

  it('ném ForbiddenException khi cấp không đủ (Cấp 1 · Chuẩn/Khó)', () => {
    expect(() => assertTierAccess(1, 'user', 'standard')).toThrow(ForbiddenException);
    expect(() => assertTierAccess(1, 'user', 'hard')).toThrow(ForbiddenException);
  });
});
