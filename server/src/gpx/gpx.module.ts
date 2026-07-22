import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GpxSubmission } from './gpx-submission.entity';
import { GpxService } from './gpx.service';
import { GpxController } from './gpx.controller';

@Module({
  imports: [TypeOrmModule.forFeature([GpxSubmission])],
  providers: [GpxService],
  controllers: [GpxController],
  exports: [GpxService],
})
export class GpxModule {}
