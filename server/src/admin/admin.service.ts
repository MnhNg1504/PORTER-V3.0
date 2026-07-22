import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { GpxSubmission, SubmissionStatus } from '../gpx/gpx-submission.entity';
import { TrekRoute } from '../routes/route.entity';
import { parseGpx, trackStats } from '../gpx/gpx.service';
import { slugify, estimateMinutes, classifyDifficulty } from '../common/route-utils';
import { NotificationsService } from '../notifications/notifications.service';

/**
 * Nghiệp vụ admin — quan trọng nhất: duyệt GPX của Cấp 2.
 * APPROVED => tự tạo TrekRoute từ rawGpx (đóng vòng marketplace docs/04:
 * Cấp 2 nộp -> admin duyệt -> cung xuất hiện, seller = người nộp) + push báo kết quả.
 */
@Injectable()
export class AdminService {
  private log = new Logger('AdminService');

  constructor(
    @InjectRepository(GpxSubmission) private subs: Repository<GpxSubmission>,
    @InjectRepository(TrekRoute) private routes: Repository<TrekRoute>,
    private dataSource: DataSource,
    private notifications: NotificationsService,
  ) {}

  async reviewGpx(id: string, status: SubmissionStatus, reviewNote?: string) {
    // rawGpx có select:false — lấy tường minh kèm user
    const sub = await this.subs
      .createQueryBuilder('s')
      .addSelect('s.rawGpx')
      .leftJoinAndSelect('s.user', 'user')
      .where('s.id = :id', { id })
      .getOne();
    if (!sub) throw new NotFoundException('Bản nộp GPX không tồn tại');
    if (sub.status !== 'pending') {
      throw new ConflictException(`Bản nộp đã được xử lý (${sub.status})`);
    }

    let createdRoute: TrekRoute | null = null;
    if (status === 'approved') {
      createdRoute = await this.createRouteFromSubmission(sub);
    }
    await this.subs.update(id, { status, reviewNote });

    // Push best-effort — không chặn flow duyệt
    await this.notifications.sendToUser(
      sub.user.id,
      status === 'approved' ? 'Cung của bạn đã được duyệt 🎉' : 'Bản nộp GPX bị từ chối',
      status === 'approved'
        ? `"${sub.routeName}" đã xuất hiện trên POTTER. Vào chỉnh giá bán & thêm ảnh điểm xuất phát.`
        : `"${sub.routeName}": ${reviewNote ?? 'xem ghi chú của admin'}`,
      { submissionId: id, routeSlug: createdRoute?.slug },
    );

    return {
      submission: await this.subs.findOne({ where: { id } }),
      createdRoute: createdRoute ? { id: createdRoute.id, slug: createdRoute.slug } : null,
    };
  }

  /** Tạo TrekRoute PostGIS từ GPX thật của bản nộp (cùng pipeline với seed) */
  private async createRouteFromSubmission(sub: GpxSubmission): Promise<TrekRoute> {
    const pts = parseGpx(sub.rawGpx);
    const stats = trackStats(pts);

    // Slug duy nhất: thêm hậu tố -2, -3... nếu trùng
    const base = slugify(sub.routeName) || `cung-${sub.id.slice(0, 8)}`;
    let slug = base;
    for (let i = 2; await this.routes.findOne({ where: { slug } }); i++) {
      slug = `${base}-${i}`;
    }

    const wkt = `LINESTRING Z(${pts.map((p) => `${p.lon} ${p.lat} ${p.ele ?? 0}`).join(',')})`;
    const start = pts[0];
    const rows: { id: string }[] = await this.dataSource.query(
      `INSERT INTO trek_routes
        ("name","slug","difficulty","geom","startPoint","distanceM","ascentM","descentM",
         "maxEleM","minEleM","durationEstMin","seller_id","status")
       VALUES ($1,$2,$3, ST_GeomFromText($4,4326), ST_SetSRID(ST_MakePoint($5,$6),4326),
               $7,$8,$9,$10,$11,$12,$13,'published')
       RETURNING id`,
      [
        sub.routeName, slug, classifyDifficulty(stats.ascentM, stats.distanceM), wkt,
        start.lon, start.lat,
        stats.distanceM, stats.ascentM, stats.descentM, stats.maxEleM, stats.minEleM,
        estimateMinutes(stats.distanceM, stats.ascentM), sub.user.id,
      ],
    );
    this.log.log(`Duyệt GPX -> tạo cung "${sub.routeName}" (${slug}), seller ${sub.user.id}`);
    const route = await this.routes.findOne({ where: { id: rows[0].id } });
    if (!route) throw new NotFoundException('Tạo cung thất bại');
    return route;
    // TODO(api): seller bổ sung giá bán + ảnh điểm xuất phát (bắt buộc trước khi bán — docs/00 §4)
  }
}
