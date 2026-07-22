import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TrekRoute, Difficulty } from './route.entity';
import { Purchase } from '../purchases/purchase.entity';
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
   * Enforce cấp 1 không tự đi cung khó (docs/04): trả kèm cờ requiresGuide.
   */
  async fullTrack(slug: string, user: JwtPayload) {
    const route = await this.detail(slug);
    const isFree = route.priceVnd === '0';
    const isAdmin = user.role === 'admin';
    if (!isFree && !isAdmin) {
      const paid = await this.purchases.findOne({
        where: { route: { id: route.id }, buyer: { id: user.sub }, status: 'paid' },
      });
      if (!paid) throw new ForbiddenException('Cần mua cung để tải track đầy đủ');
    }
    // Cấp 1 + cung khó → bắt buộc có hướng dẫn (app chặn điều hướng, docs/04 §1)
    const requiresGuide = user.tier === 1 && route.difficulty !== 'easy';

    const row: { geojson: string } | undefined = await this.routes
      .createQueryBuilder('r')
      .select('ST_AsGeoJSON(r.geom)', 'geojson')
      .where('r.id = :id', { id: route.id })
      .getRawOne();
    if (!row) throw new NotFoundException('Không đọc được geometry');
    return { route, requiresGuide, track: JSON.parse(row.geojson) };
  }
}
