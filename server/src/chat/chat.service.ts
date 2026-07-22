import {
  Injectable, NotFoundException, ForbiddenException, BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation, Message } from './chat.entities';
import { UserBlock } from '../moderation/user-block.entity';
import { User } from '../users/user.entity';

/** Thời hạn cho phép thu hồi tin nhắn (phút) — sau đó chỉ xoá phía mình (GĐ sau) */
const RECALL_WINDOW_MIN = 30;

/**
 * Chat 1-1/nhóm (checklist §6): đã xem, thu hồi, block-aware.
 * Realtime đi qua ChatGateway; REST ở ChatController (lịch sử, danh sách).
 */
@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Conversation) private convs: Repository<Conversation>,
    @InjectRepository(Message) private msgs: Repository<Message>,
    @InjectRepository(UserBlock) private blocks: Repository<UserBlock>,
  ) {}

  /** Có chặn giữa 2 user theo BẤT KỲ chiều nào không (checklist §6 Block) */
  async isBlockedBetween(a: string, b: string): Promise<boolean> {
    const found = await this.blocks
      .createQueryBuilder('bl')
      .where('(bl.blocker_id = :a AND bl.blocked_id = :b) OR (bl.blocker_id = :b AND bl.blocked_id = :a)', { a, b })
      .getOne();
    return !!found;
  }

  private async getConvOrThrow(convId: string, userId: string): Promise<Conversation> {
    const conv = await this.convs.findOne({ where: { id: convId } });
    if (!conv) throw new NotFoundException('Hội thoại không tồn tại');
    if (!conv.memberIds.includes(userId)) throw new ForbiddenException('Không thuộc hội thoại');
    return conv;
  }

  /** Tạo (hoặc trả về) hội thoại 1-1 — chặn nếu 2 bên có block */
  async createDirect(userId: string, otherId: string): Promise<Conversation> {
    if (userId === otherId) throw new BadRequestException('Không thể chat với chính mình');
    if (await this.isBlockedBetween(userId, otherId)) {
      throw new ForbiddenException('Không thể nhắn tin — một trong hai bên đã chặn');
    }
    const existed = await this.convs
      .createQueryBuilder('c')
      .where(`c.type = 'direct'`)
      .andWhere(':a::uuid = ANY(c."memberIds")', { a: userId })
      .andWhere(':b::uuid = ANY(c."memberIds")', { b: otherId })
      .getOne();
    if (existed) return existed;
    return this.convs.save(this.convs.create({ type: 'direct', memberIds: [userId, otherId] }));
  }

  /** Danh sách hội thoại của tôi */
  listMine(userId: string): Promise<Conversation[]> {
    return this.convs
      .createQueryBuilder('c')
      .where(':id::uuid = ANY(c."memberIds")', { id: userId })
      .orderBy('c."createdAt"', 'DESC')
      .getMany();
  }

  /** Lịch sử tin nhắn (mới → cũ, phân trang bằng before=ISO time) */
  async history(convId: string, userId: string, limit = 50, before?: string): Promise<Message[]> {
    await this.getConvOrThrow(convId, userId);
    const qb = this.msgs
      .createQueryBuilder('m')
      .leftJoinAndSelect('m.sender', 'sender')
      .where('m.conversation_id = :convId', { convId })
      .orderBy('m."createdAt"', 'DESC')
      .take(Math.min(limit, 100));
    if (before) qb.andWhere('m."createdAt" < :before', { before });
    const list = await qb.getMany();
    // Thu hồi: không trả nội dung gốc ra ngoài
    return list.map((m) => (m.recalled ? { ...m, content: '' } : m));
  }

  /** Gửi tin nhắn — kiểm tra thành viên + block (hội thoại 1-1) */
  async send(convId: string, senderId: string, content: string): Promise<Message> {
    const conv = await this.getConvOrThrow(convId, senderId);
    const text = String(content ?? '').trim().slice(0, 4000);
    if (!text) throw new BadRequestException('Tin nhắn rỗng');
    if (conv.type === 'direct') {
      const other = conv.memberIds.find((id) => id !== senderId);
      if (other && (await this.isBlockedBetween(senderId, other))) {
        throw new ForbiddenException('Không thể nhắn tin — một trong hai bên đã chặn');
      }
    }
    return this.msgs.save(
      this.msgs.create({ conversation: conv, sender: { id: senderId } as User, content: text }),
    );
  }

  /** Đánh dấu ĐÃ XEM tới messageId (thêm userId vào seenBy các tin chưa xem) */
  async markSeen(convId: string, userId: string, messageId: string): Promise<{ updated: number }> {
    await this.getConvOrThrow(convId, userId);
    const target = await this.msgs.findOne({ where: { id: messageId } });
    if (!target) throw new NotFoundException('Tin nhắn không tồn tại');
    // Cast ::uuid tường minh — node-postgres gửi param dạng text, tránh lỗi "text = uuid"
    const res = await this.msgs
      .createQueryBuilder()
      .update()
      .set({ seenBy: () => `array_append("seenBy", :uid::uuid)` })
      .where('conversation_id = :convId', { convId })
      .andWhere('"createdAt" <= :t', { t: target.createdAt })
      .andWhere('NOT (:uid::uuid = ANY("seenBy"))', { uid: userId })
      .setParameter('uid', userId)
      .execute();
    return { updated: res.affected ?? 0 };
  }

  /** THU HỒI tin nhắn — chỉ người gửi, trong 30 phút; giữ row, xoá nội dung */
  async recall(messageId: string, userId: string): Promise<Message> {
    const msg = await this.msgs.findOne({
      where: { id: messageId },
      relations: { sender: true, conversation: true },
    });
    if (!msg) throw new NotFoundException('Tin nhắn không tồn tại');
    if (msg.sender.id !== userId) throw new ForbiddenException('Chỉ người gửi được thu hồi');
    const ageMin = (Date.now() - new Date(msg.createdAt).getTime()) / 60_000;
    if (ageMin > RECALL_WINDOW_MIN) {
      throw new ForbiddenException(`Chỉ thu hồi được trong ${RECALL_WINDOW_MIN} phút`);
    }
    msg.recalled = true;
    msg.content = '';
    return this.msgs.save(msg);
  }
}
