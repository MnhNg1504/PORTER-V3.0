import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index,
} from 'typeorm';
import { Order } from './order.entity';

/** Loại bút toán escrow — sổ cái dòng tiền giữ hộ (vá H4). */
export type EscrowKind =
  | 'deposit_in' // khách nạp cọc vào escrow
  | 'refund_out' // hoàn cọc cho khách
  | 'seller_forfeit' // phần cọc mất chia cho người bán
  | 'potter_fee' // phần Potter giữ
  | 'payout_out'; // trả người bán khi hoàn tất

/** Một bút toán trên sổ escrow — mọi dòng tiền đều để lại vết (đối soát). */
@Entity('escrow_entries')
export class EscrowEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @ManyToOne(() => Order, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ type: 'varchar' })
  kind: EscrowKind;

  /** Số tiền (VND nguyên). Luôn ≥0; hướng tiền suy từ kind. */
  @Column({ type: 'bigint' })
  amountVnd: string;

  @Column({ type: 'varchar', nullable: true })
  note?: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
