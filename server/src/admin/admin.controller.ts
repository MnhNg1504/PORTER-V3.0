import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiProperty } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IsIn, IsInt, IsOptional, IsString, MaxLength, Max, Min } from 'class-validator';
import { Roles, RolesGuard } from '../common/auth.decorators';
import { GpxSubmission, SubmissionStatus } from '../gpx/gpx-submission.entity';
import { Report, ReportStatus } from '../moderation/report.entity';
import { User } from '../users/user.entity';

class ReviewGpxDto {
  @ApiProperty({ enum: ['approved', 'rejected'] })
  @IsIn(['approved', 'rejected'])
  status: SubmissionStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reviewNote?: string;
}

class ResolveReportDto {
  @ApiProperty({ enum: ['resolved', 'dismissed'] })
  @IsIn(['resolved', 'dismissed'])
  status: ReportStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  resolutionNote?: string;
}

class SetTierDto {
  @ApiProperty({ minimum: 1, maximum: 3, description: 'Cấp user theo docs/04' })
  @IsInt()
  @Min(1)
  @Max(3)
  tier: 1 | 2 | 3;
}

/** Trang quản trị (checklist §1) — API cho web admin GĐ4. Chỉ role=admin. */
@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('admin')
@Controller('admin')
export class AdminController {
  constructor(
    @InjectRepository(GpxSubmission) private subs: Repository<GpxSubmission>,
    @InjectRepository(Report) private reports: Repository<Report>,
    @InjectRepository(User) private users: Repository<User>,
  ) {}

  /** Hàng đợi kiểm duyệt GPX (docs/04 — gate mở cung của Cấp 2) */
  @Get('gpx')
  gpxQueue(@Query('status') status: SubmissionStatus = 'pending') {
    return this.subs.find({ where: { status }, relations: { user: true }, order: { createdAt: 'ASC' } });
  }

  @Patch('gpx/:id')
  async reviewGpx(@Param('id', ParseUUIDPipe) id: string, @Body() dto: ReviewGpxDto) {
    await this.subs.update(id, { status: dto.status, reviewNote: dto.reviewNote });
    // TODO(api): khi approved → tạo TrekRoute từ rawGpx (dùng GpxService.parse + PostGIS insert)
    return this.subs.findOne({ where: { id } });
  }

  @Get('reports')
  reportQueue(@Query('status') status: ReportStatus = 'open') {
    return this.reports.find({ where: { status }, relations: { reporter: true }, order: { createdAt: 'ASC' } });
  }

  @Patch('reports/:id')
  async resolveReport(@Param('id', ParseUUIDPipe) id: string, @Body() dto: ResolveReportDto) {
    await this.reports.update(id, { status: dto.status, resolutionNote: dto.resolutionNote });
    return this.reports.findOne({ where: { id } });
  }

  /** Thăng/giáng cấp thủ công (docs/04: 1→2 gate KYC/GPX; 2→3 thủ công theo pháp nhân) */
  @Patch('users/:id/tier')
  async setTier(@Param('id', ParseUUIDPipe) id: string, @Body() dto: SetTierDto) {
    await this.users.update(id, { tier: dto.tier });
    return this.users.findOne({ where: { id } });
  }
}
