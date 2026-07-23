import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RouteCheckpoint, Completion, CheckpointEvidence } from './completions.entities';
import { TrekRoute } from '../routes/route.entity';
import { Purchase } from '../purchases/purchase.entity';
import { UsersModule } from '../users/users.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { CompletionsService } from './completions.service';
import { CompletionsController } from './completions.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([RouteCheckpoint, Completion, CheckpointEvidence, TrekRoute, Purchase]),
    UsersModule,
    NotificationsModule,
  ],
  providers: [CompletionsService],
  controllers: [CompletionsController],
  exports: [CompletionsService],
})
export class CompletionsModule {}
