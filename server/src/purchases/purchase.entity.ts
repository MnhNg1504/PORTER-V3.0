import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Unique,
} from 'typeorm';
import { User } from '../users/user.entity';
import { TrekRoute } from '../routes/route.entity';

export type PurchaseStatus = 'pending' | 'paid' | 'refunded' | 'cancelled';

/** Mua cung (api-contract §4). Cổng thanh toán thật nối ở GĐ sau — TODO(payment). */
@Entity('purchases')
@Unique(['buyer', 'route'])
export class Purchase {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'buyer_id' })
  buyer: User;

  @ManyToOne(() => TrekRoute)
  @JoinColumn({ name: 'route_id' })
  route: TrekRoute;

  @Column({ type: 'bigint' })
  priceVnd: string;

  @Column({ type: 'varchar', default: 'pending' })
  status: PurchaseStatus;

  @CreateDateColumn()
  createdAt: Date;
}
