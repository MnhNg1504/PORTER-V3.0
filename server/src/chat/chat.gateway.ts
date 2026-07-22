import {
  WebSocketGateway, WebSocketServer, SubscribeMessage,
  OnGatewayConnection, OnGatewayDisconnect, MessageBody, ConnectedSocket,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation, Message } from './chat.entities';
import { User } from '../users/user.entity';
import type { JwtPayload } from '../auth/jwt.strategy';

/**
 * Chat realtime scaffold (checklist §6). GĐ3 hoàn thiện: đã xem, typing đầy đủ,
 * gửi ảnh/video, thu hồi, block-aware. Auth qua token trong handshake.
 */
@WebSocketGateway({ cors: { origin: true }, namespace: '/chat' })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private log = new Logger('ChatGateway');
  /** userId -> số socket đang mở (trạng thái Online — checklist §6) */
  private online = new Map<string, number>();

  constructor(
    private jwt: JwtService,
    @InjectRepository(Conversation) private convs: Repository<Conversation>,
    @InjectRepository(Message) private msgs: Repository<Message>,
  ) {}

  handleConnection(client: Socket) {
    try {
      const token = (client.handshake.auth?.token ?? '') as string;
      const payload = this.jwt.verify<JwtPayload>(token, {
        secret: process.env.JWT_ACCESS_SECRET ?? 'change_me_access_secret',
      });
      client.data.user = payload;
      this.online.set(payload.sub, (this.online.get(payload.sub) ?? 0) + 1);
      this.server.emit('presence', { userId: payload.sub, online: true });
    } catch {
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    const user: JwtPayload | undefined = client.data.user;
    if (!user) return;
    const n = (this.online.get(user.sub) ?? 1) - 1;
    if (n <= 0) {
      this.online.delete(user.sub);
      this.server.emit('presence', { userId: user.sub, online: false });
    } else this.online.set(user.sub, n);
  }

  @SubscribeMessage('join')
  async join(@ConnectedSocket() client: Socket, @MessageBody() convId: string) {
    const user: JwtPayload = client.data.user;
    const conv = await this.convs.findOne({ where: { id: convId } });
    if (!conv || !conv.memberIds.includes(user.sub)) return { error: 'Không thuộc hội thoại' };
    await client.join(convId);
    return { ok: true };
  }

  @SubscribeMessage('message')
  async message(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { convId: string; content: string },
  ) {
    const user: JwtPayload = client.data.user;
    const conv = await this.convs.findOne({ where: { id: body.convId } });
    if (!conv || !conv.memberIds.includes(user.sub)) return { error: 'Không thuộc hội thoại' };
    const msg = await this.msgs.save(
      this.msgs.create({
        conversation: conv,
        sender: { id: user.sub } as User,
        content: String(body.content).slice(0, 4000),
      }),
    );
    this.server.to(body.convId).emit('message', {
      id: msg.id, convId: body.convId, senderId: user.sub,
      content: msg.content, createdAt: msg.createdAt,
    });
    return { ok: true, id: msg.id };
  }

  @SubscribeMessage('typing')
  typing(@ConnectedSocket() client: Socket, @MessageBody() convId: string) {
    const user: JwtPayload = client.data.user;
    client.to(convId).emit('typing', { convId, userId: user.sub });
  }
}
