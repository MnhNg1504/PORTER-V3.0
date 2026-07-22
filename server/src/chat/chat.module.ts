import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { Conversation, Message } from './chat.entities';
import { ChatGateway } from './chat.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([Conversation, Message]), JwtModule.register({})],
  providers: [ChatGateway],
})
export class ChatModule {}
