import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GpxSubmission } from '../gpx/gpx-submission.entity';
import { Report } from '../moderation/report.entity';
import { User } from '../users/user.entity';
import { TrekRoute } from '../routes/route.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [TypeOrmModule.forFeature([GpxSubmission, Report, User, TrekRoute]), NotificationsModule],
  providers: [AdminService],
  controllers: [AdminController],
})
export class AdminModule {}
