import {
  WebSocketGateway, WebSocketServer, SubscribeMessage,
  OnGatewayConnection, OnGatewayDisconnect, MessageBody, ConnectedSocket,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ChatService } from './chat.service';
import type { JwtPayload } from '../auth/jwt.strategy';

/**
 * Chat realtime (checklist §6): message, đã xem, typing, online, thu hồi — block-aware.
 * Auth: JWT trong handshake.auth.token. Logic nghiệp vụ nằm ở ChatService (dùng chung REST).
 */
@WebSocketGateway({ cors: { origin: true }, namespace: '/chat' })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private log = new Logger('ChatGateway');
  /** userId -> số socket đang mở (trạng thái Online) */
  private online = new Map<string, number>();

  constructor(private jwt: JwtService, private chat: ChatService) {}

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
    try {
      await this.chat.history(convId, user.sub, 1); // reuse kiểm tra membership
      await client.join(convId);
      return { ok: true };
    } catch (e) {
      return { error: (e as Error).message };
    }
  }

  @SubscribeMessage('message')
  async message(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { convId: string; content: string },
  ) {
    const user: JwtPayload = client.data.user;
    try {
      const msg = await this.chat.send(body.convId, user.sub, body.content);
      this.server.to(body.convId).emit('message', {
        id: msg.id, convId: body.convId, senderId: user.sub,
        content: msg.content, createdAt: msg.createdAt,
      });
      return { ok: true, id: msg.id };
    } catch (e) {
      return { error: (e as Error).message };
    }
  }

  /** ĐÃ XEM realtime — client gửi khi cuộn tới tin mới nhất */
  @SubscribeMessage('seen')
  async seen(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { convId: string; messageId: string },
  ) {
    const user: JwtPayload = client.data.user;
    try {
      const r = await this.chat.markSeen(body.convId, user.sub, body.messageId);
      client.to(body.convId).emit('seen', {
        convId: body.convId, userId: user.sub, messageId: body.messageId,
      });
      return { ok: true, ...r };
    } catch (e) {
      return { error: (e as Error).message };
    }
  }

  /** THU HỒI realtime — chỉ người gửi, trong cửa sổ cho phép (ChatService enforce) */
  @SubscribeMessage('recall')
  async recall(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { convId: string; messageId: string },
  ) {
    const user: JwtPayload = client.data.user;
    try {
      await this.chat.recall(body.messageId, user.sub);
      this.server.to(body.convId).emit('recall', { convId: body.convId, messageId: body.messageId });
      return { ok: true };
    } catch (e) {
      return { error: (e as Error).message };
    }
  }

  @SubscribeMessage('typing')
  typing(@ConnectedSocket() client: Socket, @MessageBody() convId: string) {
    const user: JwtPayload = client.data.user;
    client.to(convId).emit('typing', { convId, userId: user.sub });
  }
}
