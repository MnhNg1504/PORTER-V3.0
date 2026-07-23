import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index,
} from 'typeorm';
import { User } from '../users/user.entity';
import { TrekRoute } from '../routes/route.entity';

export type CheckpointKind = 'start' | 'check' | 'camp' | 'water' | 'warn' | 'summit' | 'finish';

/**
 * Checkpoint của cung — do người tạo cung "trồng" bằng ảnh chụp giữa đường
 * khi ghi GPX (docs/08 B2). Icon theo kind (bộ brand icons).
 */
@Entity('route_checkpoints')
export class RouteCheckpoint {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @ManyToOne(() => TrekRoute, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'route_id' })
  route: TrekRoute;

  @Column('int')
  orderIdx: number;

  @Column({ type: 'geometry', spatialFeatureType: 'Point', srid: 4326 })
  point: string;

  @Column('int', { nullable: true })
  eleM?: number | null;

  @Column({ type: 'varchar', default: 'check' })
  kind: CheckpointKind;

  /** Ảnh mẫu của người tạo cung (media key/url) — người đi sau đối chiếu */
  @Column({ nullable: true })
  photoUrl?: string;

  @Column({ nullable: true })
  note?: string;

  @CreateDateColumn()
  createdAt: Date;
}

export type CompletionStatus = 'active' | 'finished' | 'abandoned';

/** Một lần đi cung của user (consumer) — docs/08 A2 */
@Entity('completions')
export class Completion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Index()
  @ManyToOne(() => TrekRoute, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'route_id' })
  route: TrekRoute;

  @Column({ type: 'varchar', default: 'active' })
  status: CompletionStatus;

  /** Điểm xác minh 0..1 (docs/08 C3) — set khi finish */
  @Column({ type: 'real', nullable: true })
  verifyScore?: number | null;

  @Column({ default: false })
  certified: boolean;

  @CreateDateColumn()
  startedAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  finishedAt?: Date | null;
}

export type EvidenceVerdictDb = 'verified' | 'suspect' | 'failed' | 'skipped';

/** Bằng chứng 1 checkpoint: ảnh + toạ độ GPS live lúc chụp (docs/08 C1) */
@Entity('checkpoint_evidences')
export class CheckpointEvidence {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @ManyToOne(() => Completion, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'completion_id' })
  completion: Completion;

  @ManyToOne(() => RouteCheckpoint, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'checkpoint_id' })
  checkpoint?: RouteCheckpoint | null;

  /** Key ảnh đã upload qua /media/upload */
  @Column()
  photoKey: string;

  @Column('double precision')
  lat: number;

  @Column('double precision')
  lon: number;

  @Column('int', { nullable: true })
  eleM?: number | null;

  @Column('real', { nullable: true })
  accuracyM?: number | null;

  @Column({ type: 'timestamptz' })
  capturedAt: Date;

  @Column({ type: 'varchar' })
  verdict: EvidenceVerdictDb;

  @Column({ nullable: true })
  reason?: string;

  /** Khoảng cách tới checkpoint & tuyến lúc validate (m) — minh bạch với user */
  @Column('real', { nullable: true })
  dCheckpointM?: number | null;

  @Column('real', { nullable: true })
  dRouteM?: number | null;

  @CreateDateColumn()
  createdAt: Date;
}
