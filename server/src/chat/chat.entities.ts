import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index,
} from 'typeorm';
import { User } from '../users/user.entity';

export type ConversationType = 'direct' | 'group';

/** Hội thoại 1-1 / nhóm (api-contract §6). Realtime gateway hoàn thiện GĐ3. */
@Entity('conversations')
export class Conversation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', default: 'direct' })
  type: ConversationType;

  @Column({ nullable: true })
  title?: string;

  /** Danh sách user id tham gia — đơn giản cho scaffold; chuẩn hoá bảng riêng khi scale */
  @Column('uuid', { array: true })
  memberIds: string[];

  @CreateDateColumn()
  createdAt: Date;
}

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @ManyToOne(() => Conversation)
  @JoinColumn({ name: 'conversation_id' })
  conversation: Conversation;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'sender_id' })
  sender: User;

  @Column({ type: 'text' })
  content: string;

  /** Thu hồi tin nhắn (checklist §6): giữ row, ẩn nội dung */
  @Column({ default: false })
  recalled: boolean;

  /** user id đã xem — đơn giản cho scaffold */
  @Column('uuid', { array: true, default: '{}' })
  seenBy: string[];

  @CreateDateColumn()
  createdAt: Date;
}
