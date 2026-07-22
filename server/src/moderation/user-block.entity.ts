import {
  Entity, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn, Unique,
} from 'typeorm';
import { User } from '../users/user.entity';

/** Chặn người dùng (checklist §1) — chặn 2 chiều ở tầng query chat/feed */
@Entity('user_blocks')
@Unique(['blocker', 'blocked'])
export class UserBlock {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'blocker_id' })
  blocker: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'blocked_id' })
  blocked: User;

  @CreateDateColumn()
  createdAt: Date;
}
