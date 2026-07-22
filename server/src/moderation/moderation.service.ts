import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report, ReportTargetType } from './report.entity';
import { UserBlock } from './user-block.entity';
import { User } from '../users/user.entity';

@Injectable()
export class ModerationService {
  constructor(
    @InjectRepository(Report) private reports: Repository<Report>,
    @InjectRepository(UserBlock) private blocks: Repository<UserBlock>,
  ) {}

  report(reporterId: string, targetType: ReportTargetType, targetId: string, reason: string) {
    const r = this.reports.create({
      reporter: { id: reporterId } as User,
      targetType,
      targetId,
      reason,
    });
    return this.reports.save(r);
  }

  async block(blockerId: string, blockedId: string) {
    if (blockerId === blockedId) throw new BadRequestException('Không thể tự chặn mình');
    const existed = await this.blocks.findOne({
      where: { blocker: { id: blockerId }, blocked: { id: blockedId } },
    });
    if (existed) throw new ConflictException('Đã chặn user này');
    return this.blocks.save(
      this.blocks.create({ blocker: { id: blockerId } as User, blocked: { id: blockedId } as User }),
    );
  }

  async unblock(blockerId: string, blockedId: string) {
    await this.blocks.delete({ blocker: { id: blockerId }, blocked: { id: blockedId } });
    return { ok: true };
  }

  myBlocks(userId: string) {
    return this.blocks.find({ where: { blocker: { id: userId } }, relations: { blocked: true } });
  }
}
