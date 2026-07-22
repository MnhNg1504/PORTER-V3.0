import {
  Injectable, UnauthorizedException, ConflictException, ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User } from '../users/user.entity';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { JwtPayload } from './jwt.strategy';

const MAX_FAILED_LOGINS = 5;
const LOCK_MINUTES = 15;

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private users: Repository<User>,
    private jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existed = await this.users.findOne({ where: { email: dto.email.toLowerCase() } });
    if (existed) throw new ConflictException('Email đã đăng ký');
    const user = this.users.create({
      email: dto.email.toLowerCase(),
      passwordHash: await bcrypt.hash(dto.password, 10),
      displayName: dto.displayName,
    });
    await this.users.save(user);
    // TODO(email): gửi email xác thực (checklist §7) — GĐ3
    return this.issueTokens(user);
  }

  async login(dto: LoginDto) {
    const user = await this.users
      .createQueryBuilder('u')
      .addSelect(['u.passwordHash', 'u.failedLoginCount', 'u.lockedUntil'])
      .where('u.email = :email', { email: dto.email.toLowerCase() })
      .getOne();
    if (!user) throw new UnauthorizedException('Sai email hoặc mật khẩu');

    // Giới hạn đăng nhập sai (checklist §7)
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new ForbiddenException(`Tài khoản tạm khoá tới ${user.lockedUntil.toISOString()}`);
    }

    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) {
      const failed = (user.failedLoginCount ?? 0) + 1;
      await this.users.update(user.id, {
        failedLoginCount: failed,
        lockedUntil:
          failed >= MAX_FAILED_LOGINS ? new Date(Date.now() + LOCK_MINUTES * 60_000) : null,
      });
      throw new UnauthorizedException('Sai email hoặc mật khẩu');
    }

    await this.users.update(user.id, { failedLoginCount: 0, lockedUntil: null });
    return this.issueTokens(user);
  }

  async refresh(refreshToken: string) {
    let payload: JwtPayload;
    try {
      payload = this.jwt.verify<JwtPayload>(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET ?? 'change_me_refresh_secret',
      });
    } catch {
      throw new UnauthorizedException('Refresh token không hợp lệ');
    }
    const user = await this.users
      .createQueryBuilder('u')
      .addSelect('u.refreshTokenHash')
      .where('u.id = :id', { id: payload.sub })
      .getOne();
    if (!user?.refreshTokenHash) throw new UnauthorizedException('Phiên đã đăng xuất');
    const match = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!match) throw new UnauthorizedException('Refresh token không khớp');
    return this.issueTokens(user);
  }

  async logout(userId: string) {
    await this.users.update(userId, { refreshTokenHash: null });
    return { ok: true };
  }

  private async issueTokens(user: User) {
    const payload: JwtPayload = { sub: user.id, role: user.role, tier: user.tier };
    const accessToken = this.jwt.sign(payload, {
      secret: process.env.JWT_ACCESS_SECRET ?? 'change_me_access_secret',
      expiresIn: process.env.JWT_ACCESS_TTL ?? '900s',
    });
    const refreshToken = this.jwt.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET ?? 'change_me_refresh_secret',
      expiresIn: process.env.JWT_REFRESH_TTL ?? '7d',
    });
    await this.users.update(user.id, { refreshTokenHash: await bcrypt.hash(refreshToken, 10) });
    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id, email: user.email, displayName: user.displayName,
        role: user.role, tier: user.tier, reputation: user.reputation,
      },
    };
  }
}
