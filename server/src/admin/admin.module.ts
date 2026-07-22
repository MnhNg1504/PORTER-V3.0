import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GpxSubmission } from '../gpx/gpx-submission.entity';
import { Report } from '../moderation/report.entity';
import { User } from '../users/user.entity';
import { AdminController } from './admin.controller';

@Module({
  imports: [TypeOrmModule.forFeature([GpxSubmission, Report, User])],
  controllers: [AdminController],
})
export class AdminModule {}
