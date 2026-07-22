import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index,
} from 'typeorm';
import { User } from '../users/user.entity';

export type SubmissionStatus = 'pending' | 'approved' | 'rejected';

/** GPX do user Cấp 2+ upload — nguồn trail THẬT của POTTER (docs/01: OSM VN thưa) */
@Entity('gpx_submissions')
export class GpxSubmission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  routeName: string;

  /** GPX gốc — giữ nguyên để kiểm duyệt lại được */
  @Column({ type: 'text', select: false })
  rawGpx: string;

  @Column('int')
  pointCount: number;

  @Column('int')
  distanceM: number;

  @Index()
  @Column({ type: 'varchar', default: 'pending' })
  status: SubmissionStatus;

  /** Ghi chú của admin khi duyệt/từ chối */
  @Column({ nullable: true })
  reviewNote?: string;

  @CreateDateColumn()
  createdAt: Date;
}
