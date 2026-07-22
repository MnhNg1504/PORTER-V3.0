import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index,
} from 'typeorm';
import { User } from '../users/user.entity';

export type ReportTargetType = 'user' | 'post' | 'route' | 'message';
export type ReportStatus = 'open' | 'resolved' | 'dismissed';

/** Báo cáo nội dung xấu (checklist §1) — admin xử lý ở GĐ4 */
@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'reporter_id' })
  reporter: User;

  @Column({ type: 'varchar' })
  targetType: ReportTargetType;

  @Column('uuid')
  targetId: string;

  @Column()
  reason: string;

  @Index()
  @Column({ type: 'varchar', default: 'open' })
  status: ReportStatus;

  @Column({ nullable: true })
  resolutionNote?: string;

  @CreateDateColumn()
  createdAt: Date;
}
