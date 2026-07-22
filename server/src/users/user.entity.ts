import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index,
} from 'typeorm';

export type UserRole = 'user' | 'admin';
/** 3 cấp theo docs/04: 1 = Mới, 2 = Kinh nghiệm (mở/bán cung), 3 = Doanh nghiệp/Tour */
export type UserTier = 1 | 2 | 3;

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column()
  email: string;

  /** bcrypt hash — KHÔNG bao giờ trả về qua API */
  @Column({ select: false })
  passwordHash: string;

  @Column()
  displayName: string;

  @Column({ nullable: true })
  avatarUrl?: string;

  @Column({ type: 'varchar', default: 'user' })
  role: UserRole;

  @Column({ type: 'int', default: 1 })
  tier: UserTier;

  /** Thang uy tín 0–1000 (docs/04) */
  @Column({ type: 'int', default: 0 })
  reputation: number;

  @Column({ default: false })
  emailVerified: boolean;

  /** Hash refresh token hiện hành (đơn giản, 1 phiên); null = đã logout */
  @Column({ type: 'varchar', nullable: true, select: false })
  refreshTokenHash?: string | null;

  /** Đếm đăng nhập sai liên tiếp (checklist §7 — giới hạn đăng nhập sai) */
  @Column({ type: 'int', default: 0, select: false })
  failedLoginCount: number;

  @Column({ type: 'timestamptz', nullable: true, select: false })
  lockedUntil?: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
