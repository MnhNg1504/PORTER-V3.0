import { ConflictException, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { AuthService } from '../auth.service';

/**
 * Mock Repository<User> + JwtService bằng object literal (không cần DB/Nest DI).
 * createQueryBuilder trả chuỗi chainable đọc `user` hiện hành; update MUTATE user
 * để mô phỏng DB đếm failedLoginCount thật.
 */
function makeMocks(user: any) {
  const users = {
    findOne: jest.fn(async ({ where }: any) =>
      user && where?.email === user.email ? user : null),
    create: jest.fn((x: any) => x),
    save: jest.fn(async (x: any) => ({ id: 'new-id', ...x })),
    update: jest.fn(async (_id: string, patch: any) => Object.assign(user ?? {}, patch)),
    createQueryBuilder: jest.fn(() => ({
      addSelect() { return this; },
      where() { return this; },
      getOne: async () => user,
    })),
  };
  const jwt = {
    sign: jest.fn(() => 'signed.jwt.token'),
    verify: jest.fn(),
  };
  return { users, jwt, svc: new AuthService(users as any, jwt as any) };
}

const HASH_ROUNDS = 4; // đủ cho test, nhanh

describe('AuthService.register', () => {
  it('email đã tồn tại → ConflictException', async () => {
    const { svc } = makeMocks({ id: 'u1', email: 'a@b.vn' });
    await expect(
      svc.register({ email: 'A@B.vn', password: 'x'.repeat(8), displayName: 'A' } as any),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});

describe('AuthService.login — khoá sau 5 lần sai (checklist §7)', () => {
  let user: any;
  beforeEach(async () => {
    user = {
      id: 'u1',
      email: 'trek@potter.vn',
      passwordHash: await bcrypt.hash('mat-khau-dung', HASH_ROUNDS),
      failedLoginCount: 0,
      lockedUntil: null,
      role: 'user',
      tier: 1,
    };
  });

  it('sai 4 lần: chưa khoá; lần 5 → set lockedUntil; lần 6 đúng mật khẩu vẫn bị chặn', async () => {
    const { svc, users } = makeMocks(user);

    for (let i = 1; i <= 5; i++) {
      await expect(
        svc.login({ email: user.email, password: 'sai-roi' } as any),
      ).rejects.toBeInstanceOf(UnauthorizedException);
      expect(user.failedLoginCount).toBe(i);
      if (i < 5) expect(user.lockedUntil).toBeNull();
    }
    expect(user.lockedUntil).toBeInstanceOf(Date);
    expect(user.lockedUntil.getTime()).toBeGreaterThan(Date.now());

    // Đã khoá — kể cả mật khẩu ĐÚNG cũng ForbiddenException
    await expect(
      svc.login({ email: user.email, password: 'mat-khau-dung' } as any),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(users.update).toHaveBeenCalledTimes(5); // không reset khi đang khoá
  });

  it('đăng nhập đúng → reset failedLoginCount + trả cặp token', async () => {
    user.failedLoginCount = 3;
    const { svc } = makeMocks(user);
    const out = await svc.login({ email: user.email, password: 'mat-khau-dung' } as any);
    expect(out.accessToken).toBeDefined();
    expect(out.refreshToken).toBeDefined();
    expect(user.failedLoginCount).toBe(0);
    expect(user.lockedUntil).toBeNull();
  });

  it('email không tồn tại → UnauthorizedException (không lộ lý do)', async () => {
    const { svc } = makeMocks(null);
    await expect(
      svc.login({ email: 'ma@potter.vn', password: 'x' } as any),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});

describe('AuthService.refresh', () => {
  it('token rác (verify ném lỗi) → UnauthorizedException', async () => {
    const { svc, jwt } = makeMocks(null);
    jwt.verify.mockImplementation(() => { throw new Error('jwt malformed'); });
    await expect(svc.refresh('token-rac')).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('payload hợp lệ nhưng đã logout (refreshTokenHash null) → UnauthorizedException', async () => {
    const user: any = { id: 'u1', email: 'a@b.vn', refreshTokenHash: null };
    const { svc, jwt } = makeMocks(user);
    jwt.verify.mockReturnValue({ sub: 'u1', role: 'user', tier: 1 });
    await expect(svc.refresh('token-cu')).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('token không khớp hash trong DB → UnauthorizedException', async () => {
    const user: any = {
      id: 'u1',
      email: 'a@b.vn',
      refreshTokenHash: await bcrypt.hash('token-khac', HASH_ROUNDS),
    };
    const { svc, jwt } = makeMocks(user);
    jwt.verify.mockReturnValue({ sub: 'u1', role: 'user', tier: 1 });
    await expect(svc.refresh('token-bi-danh-cap')).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
