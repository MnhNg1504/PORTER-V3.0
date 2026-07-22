import {
  Injectable, UnauthorizedException, NotImplementedException, Logger,
} from '@nestjs/common';

/**
 * Xác minh token OAuth (checklist §1 — đăng nhập Google/Apple).
 * QUYẾT ĐỊNH ĐÃ CHỐT (docs/05 §6): code flow TRƯỚC, user điền key SAU vào .env.
 * - Google: hoạt động ngay khi set GOOGLE_CLIENT_ID (verify qua tokeninfo endpoint).
 *   TODO(oauth): production nên chuyển sang google-auth-library (verify chữ ký offline,
 *   không phụ thuộc endpoint debug của Google).
 * - Apple: cần tài khoản Apple Developer ($99/năm) → hiện là stub 501 có hướng dẫn.
 */
export interface OauthProfile {
  email: string;
  name: string;
  provider: 'google' | 'apple';
}

interface GoogleTokenInfo {
  aud?: string;
  email?: string;
  email_verified?: string; // 'true' | 'false' (string theo API)
  name?: string;
  exp?: string;
}

@Injectable()
export class OauthService {
  private log = new Logger('OauthService');

  /** Verify Google ID token (từ Google Sign-In trên app) -> profile */
  async verifyGoogle(idToken: string): Promise<OauthProfile> {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      // Chưa cấu hình — trả lỗi rõ ràng để user biết cần điền .env (không phải bug)
      throw new NotImplementedException(
        'Chưa cấu hình GOOGLE_CLIENT_ID trong server/.env — tạo OAuth Client tại console.cloud.google.com rồi điền vào.',
      );
    }
    const res = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`,
    );
    if (!res.ok) throw new UnauthorizedException('Google ID token không hợp lệ');
    const info = (await res.json()) as GoogleTokenInfo;

    if (info.aud !== clientId) {
      throw new UnauthorizedException('Google token không thuộc app này (sai audience)');
    }
    if (info.email_verified !== 'true' || !info.email) {
      throw new UnauthorizedException('Email Google chưa xác minh');
    }
    return { email: info.email.toLowerCase(), name: info.name ?? info.email, provider: 'google' };
  }

  /** Apple Sign-In — stub có hướng dẫn (cần Apple Developer + jwks verify) */
  async verifyApple(_identityToken: string): Promise<OauthProfile> {
    // TODO(oauth): khi có Apple Developer — verify identityToken RS256 bằng JWKS
    // https://appleid.apple.com/auth/keys (dep gợi ý: jwks-rsa), check iss/aud/exp.
    throw new NotImplementedException(
      'Apple Sign-In cần tài khoản Apple Developer ($99/năm) — sẽ bật khi chuẩn bị lên App Store (docs/05 §6).',
    );
  }
}
