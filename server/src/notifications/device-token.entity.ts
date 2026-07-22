import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index,
} from 'typeorm';
import { User } from '../users/user.entity';

/**
 * Expo push token của thiết bị (checklist §1 — thông báo đẩy).
 * App đăng ký token qua POST /notifications/register sau khi xin quyền.
 */
@Entity('device_tokens')
export class DeviceToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  /** Dạng "ExponentPushToken[xxxx]" — unique để upsert */
  @Index({ unique: true })
  @Column()
  token: string;

  @Column({ type: 'varchar', default: 'android' })
  platform: 'android' | 'ios';

  @CreateDateColumn()
  createdAt: Date;
}
