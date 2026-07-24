import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Purchase } from './purchase.entity';
import { TrekRoute } from '../routes/route.entity';
import { User } from '../users/user.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { assertTierAccess } from '../common/access';
import type { JwtPayload } from '../auth/jwt.strategy';

@Injectable()
export class PurchasesService {
  constructor(
    @InjectRepository(Purchase) private purchases: Repository<Purchase>,
    @InjectRepository(TrekRoute) private routes: Repository<TrekRoute>,
    private notifications: NotificationsService,
  ) {}

  /**
   * Đặt mua cung. Enforce docs/04 + QĐ-4: Cấp 1 chỉ tự đi cung Dễ; cung Chuẩn cần
   * người hướng dẫn; cung Khó cấm hẳn (assertTierAccess — server chặn THẬT).
   * TODO(payment): nối cổng thanh toán thật (VNPay/MoMo) — hiện auto 'paid' với cung 0đ.
   */
  async buy(user: JwtPayload, routeSlug: string) {
    const route = await this.routes.findOne({
      where: { slug: routeSlug, status: 'published' },
      relations: { seller: true },
    });
    if (!route) throw new NotFoundException('Cung không tồn tại');

    assertTierAccess(user.tier, user.role, route.difficulty);

    const existed = await this.purchases.findOne({
      where: { buyer: { id: user.sub }, route: { id: route.id } },
    });
    if (existed) throw new ConflictException('Bạn đã mua cung này');

    const purchase = await this.purchases.save(
      this.purchases.create({
        buyer: { id: user.sub } as User,
        route,
        priceVnd: route.priceVnd,
        status: route.priceVnd === '0' ? 'paid' : 'pending',
      }),
    );

    // H10: báo người bán có khách mua (best-effort — sendToUser không ném lỗi)
    if (route.seller?.id && route.seller.id !== user.sub) {
      await this.notifications.sendToUser(
        route.seller.id,
        'Có khách mua cung của bạn 🎉',
        `Cung "${route.name}" vừa có 1 lượt đặt. Vào chuẩn bị đón đoàn.`,
        { routeSlug: route.slug, purchaseId: purchase.id },
      );
    }
    return purchase;
  }

  myPurchases(userId: string) {
    return this.purchases.find({
      where: { buyer: { id: userId } },
      relations: { route: true },
      order: { createdAt: 'DESC' },
    });
  }
}
