import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TrekRoute, Difficulty } from './route.entity';
import { Purchase } from '../purchases/purchase.entity';
import { assertTierAccess } from '../common/access';
import type { JwtPayload } from '../auth/jwt.strategy';

@Injectable()
export class RoutesService {
  constructor(
    @InjectRepository(TrekRoute) private routes: Repository<TrekRoute>,
    @InjectRepository(Purchase) private purchases: Repository<Purchase>,
  ) {}

  /** Danh sách cung (Tab 2) — không trả geometry nặng */
  list(difficulty?: Difficulty) {
    return this.routes.find({
      where: { status: 'published', ...(difficulty ? { difficulty } : {}) },
      order: { savedCount: 'DESC' },
      take: 50,
    });
  }

  async detail(slug: string) {
    const route = await this.routes.findOne({ where: { slug } });
    if (!route) throw new NotFoundException('Cung không tồn tại');
    return route;
  }

  /**
   * Track GeoJSON đầy đủ — CHỈ khi: cung miễn phí, đã mua, là seller, hoặc admin.
   * Enforce cấp (docs/04 + QĐ-4) server-side ở CẢ cung miễn phí (assertTierAccess).
   */
  async fullTrack(slug: string, user: JwtPayload) {
    const route = await this.routes.findOne({ where: { slug }, relations: { seller: true } });
    if (!route) throw new NotFoundException('Cung không tồn tại');

    // H8: chặn theo cấp trước — kể cả cung miễn phí (không chỉ là cờ ở app)
    assertTierAccess(user.tier, user.role, route.difficulty);

    const isFree = route.priceVnd === '0';
    const isAdmin = user.role === 'admin';
    const isSeller = route.seller?.id === user.sub; // H5: seller xem được cung của chính mình
    if (!isFree && !isAdmin && !isSeller) {
      const paid = await this.purchases.findOne({
        where: { route: { id: route.id }, buyer: { id: user.sub }, status: 'paid' },
      });
      if (!paid) throw new ForbiddenException('Cần mua cung để tải track đầy đủ');
    }
    // Sau assertTierAccess, mọi cấp qua được đều không cần guide (Cấp 1 chỉ còn cung Dễ).
    const requiresGuide = false;

    const row: { geojson: string } | undefined = await this.routes
      .createQueryBuilder('r')
      .select('ST_AsGeoJSON(r.geom)', 'geojson')
      .where('r.id = :id', { id: route.id })
      .getRawOne();
    if (!row) throw new NotFoundException('Không đọc được geometry');
    return { route, requiresGuide, track: JSON.parse(row.geojson) };
  }
}
