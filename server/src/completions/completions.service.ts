import {
  Injectable, NotFoundException, ForbiddenException, ConflictException, BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { RouteCheckpoint, Completion, CheckpointEvidence, CheckpointKind } from './completions.entities';
import { TrekRoute } from '../routes/route.entity';
import { Purchase } from '../purchases/purchase.entity';
import { User } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import { NotificationsService } from '../notifications/notifications.service';
import {
  evaluateEvidence, speedBetweenKmh, isContinuous, computeVerifyScore,
  CERTIFIED_THRESHOLD, REPUTATION_CERTIFIED,
} from './completions.logic';
import { haversineM } from '../gpx/gpx.service';
import type { JwtPayload } from '../auth/jwt.strategy';

/**
 * Xác minh hoàn thành cung — server-side của docs/08 (A2 FINISHED→CERTIFIED, C1, C3).
 * Client validate cục bộ khi offline; server RE-VALIDATE khi sync (docs/09 §3 — không tin client).
 */
@Injectable()
export class CompletionsService {
  constructor(
    @InjectRepository(RouteCheckpoint) private checkpoints: Repository<RouteCheckpoint>,
    @InjectRepository(Completion) private completions: Repository<Completion>,
    @InjectRepository(CheckpointEvidence) private evidences: Repository<CheckpointEvidence>,
    @InjectRepository(TrekRoute) private routes: Repository<TrekRoute>,
    @InjectRepository(Purchase) private purchases: Repository<Purchase>,
    private users: UsersService,
    private notifications: NotificationsService,
    private dataSource: DataSource,
  ) {}

  private async routeBySlug(slug: string): Promise<TrekRoute> {
    const route = await this.routes.findOne({ where: { slug, status: 'published' } });
    if (!route) throw new NotFoundException('Cung không tồn tại');
    return route;
  }

  private async assertAccess(user: JwtPayload, route: TrekRoute): Promise<void> {
    if (route.priceVnd === '0' || user.role === 'admin') return;
    const paid = await this.purchases.findOne({
      where: { route: { id: route.id }, buyer: { id: user.sub }, status: 'paid' },
    });
    if (!paid) throw new ForbiddenException('Cần mua cung trước');
  }

  /** Danh sách checkpoint của cung (sau khi mua) — kèm toạ độ để app dẫn đường */
  async listCheckpoints(user: JwtPayload, slug: string) {
    const route = await this.routeBySlug(slug);
    await this.assertAccess(user, route);
    const rows: Array<{ id: string; orderIdx: number; kind: string; photoUrl: string | null;
      note: string | null; eleM: number | null; lon: number; lat: number }> =
      await this.dataSource.query(
        `SELECT c."id", c."orderIdx", c."kind", c."photoUrl", c."note", c."eleM",
                ST_X(c."point") AS lon, ST_Y(c."point") AS lat
         FROM route_checkpoints c WHERE c."route_id" = $1 ORDER BY c."orderIdx"`,
        [route.id],
      );
    return rows;
  }

  /** Seller/admin thêm checkpoint (docs/08 B2 — ảnh giữa đường của người tạo cung) */
  async addCheckpoint(
    user: JwtPayload, slug: string,
    dto: { lat: number; lon: number; eleM?: number; kind: CheckpointKind; photoUrl?: string; note?: string; orderIdx: number },
  ) {
    const route = await this.routes.findOne({ where: { slug }, relations: { seller: true } });
    if (!route) throw new NotFoundException('Cung không tồn tại');
    if (user.role !== 'admin' && route.seller?.id !== user.sub) {
      throw new ForbiddenException('Chỉ người mở cung hoặc admin được thêm checkpoint');
    }
    // Checkpoint phải nằm gần tuyến (≤80m) — người tạo cũng không được đặt bừa
    const d = await this.distanceToRouteM(route.id, dto.lon, dto.lat);
    if (d > 80) throw new BadRequestException(`Checkpoint cách tuyến ${Math.round(d)}m (>80m)`);
    const rows: { id: string }[] = await this.dataSource.query(
      `INSERT INTO route_checkpoints ("route_id","orderIdx","point","eleM","kind","photoUrl","note")
       VALUES ($1,$2, ST_SetSRID(ST_MakePoint($3,$4),4326), $5,$6,$7,$8) RETURNING id`,
      [route.id, dto.orderIdx, dto.lon, dto.lat, dto.eleM ?? null, dto.kind, dto.photoUrl ?? null, dto.note ?? null],
    );
    return { id: rows[0].id };
  }

  /** Bắt đầu 1 lần đi cung (docs/08 A2 — sau PREP) */
  async start(user: JwtPayload, slug: string) {
    const route = await this.routeBySlug(slug);
    await this.assertAccess(user, route);
    const active = await this.completions.findOne({
      where: { user: { id: user.sub }, route: { id: route.id }, status: 'active' },
    });
    if (active) return active; // idempotent — resume lần đang đi
    return this.completions.save(
      this.completions.create({ user: { id: user.sub } as User, route }),
    );
  }

  /** Khoảng cách điểm -> polyline cung (m) qua PostGIS geography */
  private async distanceToRouteM(routeId: string, lon: number, lat: number): Promise<number> {
    const rows: { d: number }[] = await this.dataSource.query(
      `SELECT ST_Distance(r."geom"::geography, ST_SetSRID(ST_MakePoint($2,$3),4326)::geography) AS d
       FROM trek_routes r WHERE r."id" = $1`,
      [routeId, lon, lat],
    );
    return rows[0]?.d ?? Infinity;
  }

  /** Nộp bằng chứng checkpoint — server RE-VALIDATE 5 bước (docs/08 C1) */
  async submitEvidence(
    user: JwtPayload, completionId: string,
    dto: {
      checkpointId: string; photoKey: string; lat: number; lon: number;
      eleM?: number; accuracyM?: number; capturedAt: string; isMockProvider?: boolean;
    },
  ) {
    const completion = await this.completions.findOne({
      where: { id: completionId }, relations: { user: true, route: true },
    });
    if (!completion) throw new NotFoundException('Lần đi không tồn tại');
    if (completion.user.id !== user.sub) throw new ForbiddenException();
    if (completion.status !== 'active') {
      throw new ConflictException('Đã kết thúc — không nộp thêm được (docs/09 §4: không chụp bù sau FINISHED)');
    }
    const cp = await this.dataSource.query(
      `SELECT ST_X("point") AS lon, ST_Y("point") AS lat, "eleM" FROM route_checkpoints WHERE id = $1 AND route_id = $2`,
      [dto.checkpointId, completion.route.id],
    );
    if (!cp.length) throw new NotFoundException('Checkpoint không thuộc cung này');

    const dCheckpointM = haversineM(
      { lat: dto.lat, lon: dto.lon, ele: null },
      { lat: cp[0].lat, lon: cp[0].lon, ele: null },
    );
    const dRouteM = await this.distanceToRouteM(completion.route.id, dto.lon, dto.lat);

    // Tốc độ so evidence gần nhất
    const prev = await this.evidences.findOne({
      where: { completion: { id: completionId } }, order: { capturedAt: 'DESC' },
    });
    let speedKmh: number | null = null;
    if (prev) {
      const dPrev = haversineM(
        { lat: dto.lat, lon: dto.lon, ele: null },
        { lat: prev.lat, lon: prev.lon, ele: null },
      );
      speedKmh = speedBetweenKmh(dPrev, prev.capturedAt, dto.capturedAt);
    }
    const eleDiffM = dto.eleM != null && cp[0].eleM != null ? Math.abs(dto.eleM - cp[0].eleM) : null;

    const { verdict, reason } = evaluateEvidence({
      dCheckpointM, dRouteM, speedKmh, eleDiffM,
      accuracyM: dto.accuracyM ?? null,
      isMockProvider: !!dto.isMockProvider,
    });

    const saved = await this.evidences.save(
      this.evidences.create({
        completion, checkpoint: { id: dto.checkpointId } as RouteCheckpoint,
        photoKey: dto.photoKey, lat: dto.lat, lon: dto.lon,
        eleM: dto.eleM ?? null, accuracyM: dto.accuracyM ?? null,
        capturedAt: new Date(dto.capturedAt), verdict, reason,
        dCheckpointM: Math.round(dCheckpointM * 10) / 10,
        dRouteM: Math.round(dRouteM * 10) / 10,
      }),
    );
    return { id: saved.id, verdict, reason, dCheckpointM: saved.dCheckpointM, dRouteM: saved.dRouteM };
  }

  /** Kết thúc + tính điểm (docs/08 C3) → CERTIFIED + uy tín + push */
  async finish(user: JwtPayload, completionId: string, kmMarksHit: number) {
    const completion = await this.completions.findOne({
      where: { id: completionId }, relations: { user: true, route: true },
    });
    if (!completion) throw new NotFoundException('Lần đi không tồn tại');
    if (completion.user.id !== user.sub) throw new ForbiddenException();
    if (completion.status !== 'active') throw new ConflictException('Đã kết thúc trước đó');

    const totalCheckpoints = await this.checkpoints.count({ where: { route: { id: completion.route.id } } });
    const evs = await this.evidences.find({ where: { completion: { id: completionId } } });
    const verified = new Set(
      evs.filter((e) => e.verdict === 'verified' && e.checkpoint).map((e) => (e.checkpoint as RouteCheckpoint).id),
    ).size;
    const kmMarksTotal = Math.max(1, Math.floor(completion.route.distanceM / 2000)); // mốc 2km (docs/05 §8)
    const continuous = isContinuous(evs.map((e) => e.capturedAt));

    const score = computeVerifyScore({
      verifiedCheckpoints: verified, totalCheckpoints,
      kmMarksHit: Math.min(kmMarksHit, kmMarksTotal), kmMarksTotal, continuous,
    });
    const certified = score >= CERTIFIED_THRESHOLD;

    await this.completions.update(completionId, {
      status: 'finished', finishedAt: new Date(), verifyScore: score, certified,
    });
    if (certified) {
      await this.users.addReputation(user.sub, REPUTATION_CERTIFIED);
      await this.notifications.sendToUser(
        user.sub, 'CERTIFIED — hoàn thành có xác minh 🏔',
        `${completion.route.name}: điểm xác minh ${score.toFixed(2)} · +${REPUTATION_CERTIFIED} uy tín`,
        { completionId, routeSlug: completion.route.slug },
      );
    }
    return { completionId, verifyScore: score, certified, verified, totalCheckpoints, continuous };
  }

  mine(userId: string) {
    return this.completions.find({
      where: { user: { id: userId } }, relations: { route: true }, order: { startedAt: 'DESC' },
    });
  }
}
