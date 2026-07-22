import {
  Body, Controller, Get, Param, ParseUUIDPipe, Post, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiProperty, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { IsString, IsUUID, MinLength, MaxLength } from 'class-validator';
import { ChatService } from './chat.service';
import { CurrentUser } from '../common/auth.decorators';
import type { JwtPayload } from '../auth/jwt.strategy';

class SeenDto {
  @ApiProperty({ description: 'Đánh dấu đã xem tới tin nhắn này' })
  @IsUUID()
  messageId: string;
}

class SendDto {
  @ApiProperty({ maxLength: 4000 })
  @IsString()
  @MinLength(1)
  @MaxLength(4000)
  content: string;
}

/** REST chat (checklist §6) — realtime tương ứng ở ChatGateway (/chat namespace) */
@ApiTags('chat')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('chat')
export class ChatController {
  constructor(private chat: ChatService) {}

  /** Mở (hoặc lấy) hội thoại 1-1 với user khác — block-aware */
  @Post('direct/:userId')
  direct(@CurrentUser() me: JwtPayload, @Param('userId', ParseUUIDPipe) userId: string) {
    return this.chat.createDirect(me.sub, userId);
  }

  @Get('conversations')
  mine(@CurrentUser() me: JwtPayload) {
    return this.chat.listMine(me.sub);
  }

  @Get('conversations/:id/messages')
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'before', required: false, description: 'ISO time — phân trang lùi' })
  history(
    @CurrentUser() me: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Query('limit') limit?: string,
    @Query('before') before?: string,
  ) {
    return this.chat.history(id, me.sub, limit ? Number(limit) : 50, before);
  }

  /** Gửi qua REST (fallback khi socket rớt — client nên ưu tiên gateway) */
  @Post('conversations/:id/messages')
  send(
    @CurrentUser() me: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SendDto,
  ) {
    return this.chat.send(id, me.sub, dto.content);
  }

  @Post('conversations/:id/seen')
  seen(
    @CurrentUser() me: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SeenDto,
  ) {
    return this.chat.markSeen(id, me.sub, dto.messageId);
  }

  @Post('messages/:id/recall')
  recall(@CurrentUser() me: JwtPayload, @Param('id', ParseUUIDPipe) id: string) {
    return this.chat.recall(id, me.sub);
  }
}
