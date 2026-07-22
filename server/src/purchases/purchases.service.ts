import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Purchase } from './purchase.entity';
import { TrekRoute } from '../routes/route.entity';
import { User } from '../users/user.entity';
import type { JwtPayload } from '../auth/jwt.strategy';

@Injectable()
export class PurchasesService {
  constructor(
    @InjectRepository(Purchase) private purchases: Repository<Purchase>,
    @InjectRepository(TrekRoute) private routes: Repository<TrekRoute>,
  ) {}

  /**
   * Đặt mua cung. Enforce docs/04: Cấp 1 KHÔNG mua được cung khó khi chưa có
   * người hướng dẫn — flow ghép guide xử lý ở GĐ sau, tạm chặn cứng.
   * TODO(payment): nối cổng thanh toán thật (VNPay/MoMo) — hiện auto 'paid' với cung 0đ.
   */
  async buy(user: JwtPayload, routeSlug: string) {
    const route = await this.routes.findOne({ where: { slug: routeSlug, status: 'published' } });
    if (!route) throw new NotFoundException('Cung không tồn tại');

    if (user.tier === 1 && route.difficulty === 'hard') {
      throw new ForbiddenException(
        'User Cấp 1 không thể tự mua cung Khó — cần người hướng dẫn đi kèm (docs/04)',
      );
    }
    const existed = await this.purchases.findOne({
      where: { buyer: { id: user.sub }, route: { id: route.id } },
    });
    if (existed) throw new ConflictException('Bạn đã mua cung này');

    const purchase = this.purchases.create({
      buyer: { id: user.sub } as User,
      route,
      priceVnd: route.priceVnd,
      status: route.priceVnd === '0' ? 'paid' : 'pending',
    });
    return this.purchases.save(purchase);
  }

  myPurchases(userId: string) {
    return this.purchases.find({
      where: { buyer: { id: userId } },
      relations: { route: true },
      order: { createdAt: 'DESC' },
    });
  }
}
