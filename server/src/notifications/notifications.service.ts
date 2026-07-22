import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeviceToken } from './device-token.entity';
import { User } from '../users/user.entity';

/**
 * Push notification qua Expo Push API (https://exp.host/--/api/v2/push/send).
 * KHÔNG cần key server-side cho mức chuẩn — Expo tự nối FCM/APNs.
 * (FCM credential chỉ cần cấu hình 1 lần trong EAS khi build app — phía user.)
 */
@Injectable()
export class NotificationsService {
  private log = new Logger('Notifications');
  private static EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

  constructor(@InjectRepository(DeviceToken) private tokens: Repository<DeviceToken>) {}

  /** App gọi sau khi có Expo push token (upsert theo token) */
  async register(userId: string, token: string, platform: 'android' | 'ios') {
    const existed = await this.tokens.findOne({ where: { token } });
    if (existed) {
      await this.tokens.update(existed.id, { user: { id: userId } as User, platform });
      return { ok: true, updated: true };
    }
    await this.tokens.save(
      this.tokens.create({ user: { id: userId } as User, token, platform }),
    );
    return { ok: true, updated: false };
  }

  async unregister(token: string) {
    await this.tokens.delete({ token });
    return { ok: true };
  }

  /**
   * Gửi push tới mọi thiết bị của user. Không ném lỗi ra ngoài (push là best-effort,
   * không được làm hỏng flow chính); token chết (DeviceNotRegistered) tự dọn.
   */
  async sendToUser(
    userId: string,
    title: string,
    body: string,
    data?: Record<string, unknown>,
  ): Promise<{ sent: number }> {
    const devices = await this.tokens.find({ where: { user: { id: userId } } });
    if (!devices.length) return { sent: 0 };

    const messages = devices.map((d) => ({
      to: d.token,
      title,
      body,
      data,
      sound: 'default',
    }));
    try {
      const res = await fetch(NotificationsService.EXPO_PUSH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messages),
      });
      const json = (await res.json()) as {
        data?: Array<{ status: string; details?: { error?: string } }>;
      };
      // Dọn token chết để lần sau không gửi thừa
      if (json.data) {
        await Promise.all(
          json.data.map(async (r, i) => {
            if (r.status === 'error' && r.details?.error === 'DeviceNotRegistered') {
              await this.tokens.delete({ token: devices[i].token });
            }
          }),
        );
      }
      const ok = json.data?.filter((r) => r.status === 'ok').length ?? 0;
      return { sent: ok };
    } catch (e) {
      this.log.warn(`Push lỗi (bỏ qua, best-effort): ${(e as Error).message}`);
      return { sent: 0 };
    }
  }
}
