import {
  Injectable, UnauthorizedException, ConflictException, ForbiddenException, Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'node:crypto';
import { User } from '../users/user.entity';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { JwtPayload } from './jwt.strategy';
import type { OauthProfile } from './oauth.service';

const MAX_FAILED_LOGINS = 5;
const LOCK_MINUTES = 15;
const EMAIL_VERIFY_TTL = '24h';

/** Payload token xác thực email — tách purpose để không dùng nhầm làm access token */
interface EmailVerifyPayload {
  sub: string;
  purpose: 'email-verify';
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private users: Repository<User>,
    private jwt: JwtService,
  ) {}

  private log = new Logger('AuthService');

  async register(dto: RegisterDto) {
    const existed = await this.users.findOne({ where: { email: dto.email.toLowerCase() } });
    if (existed) throw new ConflictException('Email đã đăng ký');
    const user = this.users.create({
      email: dto.email.toLowerCase(),
      passwordHash: await bcrypt.hash(dto.password, 10),
      displayName: dto.displayName,
    });
    await this.users.save(user);
    this.sendVerificationEmail(user);
    return this.issueTokens(user);
  }

  /**
   * Đăng nhập OAuth (Google/Apple — profile ĐÃ verify ở OauthService).
   * Lần đầu -> tự tạo tài khoản; email OAuth coi như đã xác thực.
   */
  async oauthLogin(profile: OauthProfile) {
    let user = await this.users.findOne({ where: { email: profile.email } });
    if (!user) {
      user = this.users.create({
        email: profile.email,
        // Không có mật khẩu — sinh ngẫu nhiên (user có thể đặt lại sau). KHÔNG log giá trị này.
        passwordHash: await bcrypt.hash(randomBytes(32).toString('hex'), 10),
        displayName: profile.name,
        emailVerified: true,
      });
      await this.users.save(user);
      this.log.log(`Tạo tài khoản mới qua ${profile.provider}: ${profile.email}`);
    } else if (!user.emailVerified) {
      await this.users.update(user.id, { emailVerified: true });
    }
    return this.issueTokens(user);
  }

  // ---- Xác thực email (checklist §7) ----

  /**
   * Sinh token + "gửi" email xác thực.
   * TODO(mailer): nối SMTP/dịch vụ email thật (Resend/SES/Brevo — cần tài khoản của user).
   * Hiện log link ra console server để test được toàn bộ flow.
   */
  private sendVerificationEmail(user: User) {
    const token = this.jwt.sign(
      { sub: user.id, purpose: 'email-verify' } satisfies EmailVerifyPayload,
      { secret: this.emailSecret(), expiresIn: EMAIL_VERIFY_TTL },
    );
    const link = `${process.env.PUBLIC_API_URL ?? 'http://localhost:3000'}/api/v1/auth/verify-email?token=${token}`;
    this.log.log(`[DEV — TODO(mailer)] Link xác thực cho ${user.email}: ${link}`);
  }

  async verifyEmail(token: string) {
    let payload: EmailVerifyPayload;
    try {
      payload = this.jwt.verify<EmailVerifyPayload>(token, { secret: this.emailSecret() });
    } catch {
      throw new UnauthorizedException('Link xác thực không hợp lệ hoặc đã hết hạn');
    }
    if (payload.purpose !== 'email-verify') {
      throw new UnauthorizedException('Token sai mục đích');
    }
    await this.users.update(payload.sub, { emailVerified: true });
    return { ok: true, message: 'Email đã xác thực thành công' };
  }

  async resendVerification(userId: string) {
    const user = await this.users.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();
    if (user.emailVerified) return { ok: true, message: 'Email đã xác thực từ trước' };
    this.sendVerificationEmail(user);
    return { ok: true, message: 'Đã gửi lại email xác thực' };
  }

  private emailSecret(): string {
    return process.env.JWT_EMAIL_SECRET ?? process.env.JWT_ACCESS_SECRET ?? 'change_me_access_secret';
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
