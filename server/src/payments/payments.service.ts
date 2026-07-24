import {
  Injectable, NotFoundException, ForbiddenException, ConflictException, BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order } from './order.entity';
import { EscrowEntry, EscrowKind } from './escrow-entry.entity';
import { TrekRoute } from '../routes/route.entity';
import { User } from '../users/user.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { assertCanBook } from '../common/access';
import { PaymentGateway } from './payment-gateway';
import {
  computePricing, refundOnCancel, canTransition, isPendingExpired, OrderStatus,
} from './payments.logic';
import type { JwtPayload } from '../auth/jwt.strategy';

export interface CreateOrderDto {
  routeSlug: string;
  tripDate: string; // YYYY-MM-DD
  headcount: number;
}

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Order) private orders: Repository<Order>,
    @InjectRepository(EscrowEntry) private escrow: Repository<EscrowEntry>,
    @InjectRepository(TrekRoute) private routes: Repository<TrekRoute>,
    private gateway: PaymentGateway,
    private notifications: NotificationsService,
    private dataSource: DataSource,
  ) {}

  /** Tạo đơn 'pending' + phiên cọc sandbox (vá H3 booking: có ngày đi + số người). */
  async createOrder(user: JwtPayload, dto: CreateOrderDto) {
    const route = await this.routes.findOne({
      where: { slug: dto.routeSlug, status: 'published' },
      relations: { seller: true },
    });
    if (!route) throw new NotFoundException('Cung không tồn tại');

    assertCanBook(user.tier, user.role, route.difficulty);

    const trip = new Date(dto.tripDate);
    if (Number.isNaN(trip.getTime())) throw new BadRequestException('Ngày đi không hợp lệ');
    if (trip.getTime() < Date.now()) throw new BadRequestException('Ngày đi phải ở tương lai');
    const headcount = Math.trunc(dto.headcount);
    if (!(headcount >= 1)) throw new BadRequestException('Số người tối thiểu 1');

    const p = computePricing(Number(route.priceVnd), headcount);

    const order = await this.orders.save(
      this.orders.create({
        buyer: { id: user.sub } as User,
        route,
        seller: route.seller ?? null,
        tripDate: dto.tripDate,
        headcount: p.headcount,
        unitVnd: String(p.unitVnd),
        subtotalVnd: String(p.subtotalVnd),
        buyerTotalVnd: String(p.buyerTotalVnd),
        sellerPayoutVnd: String(p.sellerPayoutVnd),
        potterFeeVnd: String(p.potterFeeVnd),
        depositVnd: String(p.depositVnd),
        status: 'pending',
      }),
    );

    const session = await this.gateway.createDeposit({
      orderId: order.id, amountVnd: p.depositVnd,
      description: `Cọc cung ${route.name} (${p.headcount} người)`,
    });
    await this.orders.update(order.id, { pspRef: session.pspRef });

    return { order: { ...order, pspRef: session.pspRef }, pricing: p, sandboxPayRef: session.pspRef, payUrl: session.payUrl };
  }

  /** Chuyển trạng thái ATOMIC (chống race — như H6): chỉ đổi khi đang ở `from`. */
  private async transition(orderId: string, from: OrderStatus, to: OrderStatus): Promise<boolean> {
    if (!canTransition(from, to)) {
      throw new BadRequestException(`Không thể chuyển ${from} → ${to}`);
    }
    const res = await this.orders.update({ id: orderId, status: from }, { status: to });
    return !!res.affected;
  }

  private async ledger(orderId: string, kind: EscrowKind, amountVnd: number, note?: string) {
    if (amountVnd <= 0) return;
    await this.escrow.save(
      this.escrow.create({ order: { id: orderId } as Order, kind, amountVnd: String(amountVnd), note }),
    );
  }

  private async load(orderId: string): Promise<Order> {
    const order = await this.orders.findOne({
      where: { id: orderId }, relations: { buyer: true, seller: true, route: true },
    });
    if (!order) throw new NotFoundException('Đơn không tồn tại');
    return order;
  }

  /** Ghi nhận đã cọc (từ webhook PSP hoặc pay-sandbox). Idempotent theo trạng thái. */
  private async markDeposited(order: Order): Promise<Order> {
    if (order.status === 'deposited') return order; // idempotent — webhook trùng
    if (isPendingExpired(order.createdAt, new Date())) {
      await this.transition(order.id, 'pending', 'cancelled');
      throw new ConflictException('Đơn đã quá hạn cọc (TTL) — vui lòng tạo đơn mới');
    }
    const ok = await this.transition(order.id, 'pending', 'deposited');
    if (!ok) throw new ConflictException('Đơn không ở trạng thái chờ cọc');
    await this.ledger(order.id, 'deposit_in', Number(order.depositVnd), 'Khách nạp cọc vào escrow');

    if (order.seller?.id) {
      try {
        await this.notifications.sendToUser(
          order.seller.id, 'Có đơn mới đã đặt cọc 🎉',
          `Cung "${order.route.name}" · ${order.headcount} người · ngày ${order.tripDate}.`,
          { orderId: order.id },
        );
      } catch { /* best-effort */ }
    }
    return this.load(order.id);
  }

  /** Sandbox: mô phỏng khách trả cọc thành công. */
  async paySandbox(user: JwtPayload, orderId: string) {
    const order = await this.load(orderId);
    if (order.buyer.id !== user.sub) throw new ForbiddenException();
    return this.markDeposited(order);
  }

  /** Webhook cổng thanh toán (idempotent theo pspRef). */
  async handleWebhook(payload: Record<string, unknown>) {
    const { orderId, paid } = this.gateway.verifyWebhook(payload);
    if (!orderId) throw new BadRequestException('Webhook thiếu orderId');
    const order = await this.load(orderId);
    if (!paid) return { ok: true, ignored: true };
    await this.markDeposited(order);
    return { ok: true };
  }

  /** Người bán xác nhận nhận đoàn. */
  async confirm(user: JwtPayload, orderId: string) {
    const order = await this.load(orderId);
    const isSeller = order.seller?.id === user.sub;
    if (!isSeller && user.role !== 'admin') throw new ForbiddenException('Chỉ người bán xác nhận được');
    const ok = await this.transition(orderId, 'deposited', 'confirmed');
    if (!ok) throw new ConflictException('Đơn không ở trạng thái đã cọc');
    return this.load(orderId);
  }

  /** Khách xác nhận chuyến hoàn tất → chốt payout người bán + phí Potter vào sổ. */
  async complete(user: JwtPayload, orderId: string) {
    const order = await this.load(orderId);
    if (order.buyer.id !== user.sub && user.role !== 'admin') throw new ForbiddenException();
    const ok = await this.transition(orderId, 'confirmed', 'completed');
    if (!ok) throw new ConflictException('Đơn chưa ở trạng thái đã xác nhận');
    await this.ledger(orderId, 'payout_out', Number(order.sellerPayoutVnd), 'Trả người bán (T+24h)');
    await this.ledger(orderId, 'potter_fee', Number(order.potterFeeVnd), 'Phí Potter 10%');
    return this.load(orderId);
  }

  /**
   * Khách hủy đơn (QĐ-1). Bão (force majeure) chỉ admin xác nhận được → hoàn 100%.
   * pending: hủy không mất tiền. deposited/confirmed: tính hoàn cọc theo mốc ngày.
   */
  async cancel(user: JwtPayload, orderId: string, forceMajeure = false) {
    const order = await this.load(orderId);
    if (order.buyer.id !== user.sub && user.role !== 'admin') throw new ForbiddenException();
    const fm = forceMajeure && user.role === 'admin'; // chỉ admin áp bão

    if (order.status === 'pending') {
      const ok = await this.transition(orderId, 'pending', 'cancelled');
      if (!ok) throw new ConflictException('Đơn không thể hủy ở trạng thái hiện tại');
      return { order: await this.load(orderId), refund: null };
    }
    if (order.status !== 'deposited' && order.status !== 'confirmed') {
      throw new ConflictException(`Không thể hủy đơn ở trạng thái ${order.status}`);
    }

    const r = refundOnCancel(Number(order.depositVnd), order.tripDate, new Date(), fm);
    const ok = await this.transition(orderId, order.status, 'refunded');
    if (!ok) throw new ConflictException('Trạng thái đơn vừa thay đổi — thử lại');
    await this.ledger(orderId, 'refund_out', r.refundVnd, `Hoàn cọc (${r.tier})`);
    await this.ledger(orderId, 'seller_forfeit', r.sellerKeepVnd, 'Người bán nhận từ cọc mất (50%)');
    await this.ledger(orderId, 'potter_fee', r.potterKeepVnd, 'Potter nhận từ cọc mất (50%)');
    return { order: await this.load(orderId), refund: r };
  }

  async mine(userId: string) {
    return this.orders.find({
      where: { buyer: { id: userId } }, relations: { route: true }, order: { createdAt: 'DESC' },
    });
  }

  async detail(user: JwtPayload, orderId: string) {
    const order = await this.load(orderId);
    const isParty = order.buyer.id === user.sub || order.seller?.id === user.sub || user.role === 'admin';
    if (!isParty) throw new ForbiddenException();
    const ledger = await this.escrow.find({
      where: { order: { id: orderId } }, order: { createdAt: 'ASC' },
    });
    return { order, ledger };
  }
}
