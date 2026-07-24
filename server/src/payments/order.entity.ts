import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  ManyToOne, JoinColumn, Index,
} from 'typeorm';
import { User } from '../users/user.entity';
import { TrekRoute } from '../routes/route.entity';
import type { OrderStatus } from './payments.logic';

/**
 * Đơn đặt cung có người dẫn + escrow (docs/14 vá H3 booking, docs/16 §C).
 * Tiền lưu bigint (VND nguyên, dạng string trong TypeORM).
 */
@Entity('orders')
@Index(['buyer', 'route'])
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'buyer_id' })
  buyer: User;

  @ManyToOne(() => TrekRoute)
  @JoinColumn({ name: 'route_id' })
  route: TrekRoute;

  /** Người bán nhận payout — null với cung hệ thống seed (Potter giữ toàn bộ). */
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'seller_id' })
  seller?: User | null;

  /** Ngày khởi hành (vá H3) */
  @Column({ type: 'date' })
  tripDate: string;

  @Column({ type: 'int', default: 1 })
  headcount: number;

  @Column({ type: 'bigint' })
  unitVnd: string;

  @Column({ type: 'bigint' })
  subtotalVnd: string;

  @Column({ type: 'bigint' })
  buyerTotalVnd: string;

  @Column({ type: 'bigint' })
  sellerPayoutVnd: string;

  @Column({ type: 'bigint' })
  potterFeeVnd: string;

  @Column({ type: 'bigint' })
  depositVnd: string;

  @Index()
  @Column({ type: 'varchar', default: 'pending' })
  status: OrderStatus;

  /** Tham chiếu giao dịch từ cổng thanh toán (sandbox/PSP) — idempotency */
  @Column({ type: 'varchar', nullable: true })
  pspRef?: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
