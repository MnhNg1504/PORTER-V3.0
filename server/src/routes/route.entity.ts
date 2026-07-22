import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index, ManyToOne, JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

export type Difficulty = 'easy' | 'standard' | 'hard';
export type RouteStatus = 'draft' | 'pending_review' | 'published' | 'archived';

/** Cung đường trekking — geometry THẬT từ GPX (docs/03, api-contract §2) */
@Entity('trek_routes')
export class TrekRoute {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  name: string;

  @Index({ unique: true })
  @Column()
  slug: string;

  @Column({ type: 'varchar' })
  difficulty: Difficulty;

  /** Track 3D thật: LineStringZ (lon lat ele), SRID 4326. Index GIST tạo trong migration. */
  @Column({ type: 'geometry', spatialFeatureType: 'LineStringZ', srid: 4326, select: false })
  geom: string;

  /** Điểm xuất phát — BẮT BUỘC kèm ảnh thực địa (docs/00 §4) */
  @Column({ type: 'geometry', spatialFeatureType: 'Point', srid: 4326 })
  startPoint: string;

  @Column({ nullable: true })
  startPhotoUrl?: string;

  @Column('int')
  distanceM: number;

  @Column('int')
  ascentM: number;

  @Column('int')
  descentM: number;

  @Column('int')
  maxEleM: number;

  @Column('int')
  minEleM: number;

  /** Thời gian ước tính (phút) */
  @Column('int')
  durationEstMin: number;

  /** Mùa đẹp, vd "10-4" (tháng 10 → tháng 4) */
  @Column({ nullable: true })
  season?: string;

  /** Giá bán (VND); 0 = miễn phí */
  @Column({ type: 'bigint', default: 0 })
  priceVnd: string;

  /** Người mở cung (Cấp 2+) — null với cung hệ thống seed */
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'seller_id' })
  seller?: User | null;

  @Column({ type: 'varchar', default: 'published' })
  status: RouteStatus;

  @Column({ type: 'int', default: 0 })
  savedCount: number;

  @CreateDateColumn()
  createdAt: Date;
}
