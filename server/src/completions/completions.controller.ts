import {
  Body, Controller, Get, Param, ParseUUIDPipe, Post, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiProperty } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import {
  IsBoolean, IsIn, IsISO8601, IsInt, IsLatitude, IsLongitude,
  IsNumber, IsOptional, IsString, IsUUID, Max, MaxLength, Min,
} from 'class-validator';
import { CompletionsService } from './completions.service';
import { CurrentUser, RolesGuard } from '../common/auth.decorators';
import type { JwtPayload } from '../auth/jwt.strategy';
import type { CheckpointKind } from './completions.entities';

class AddCheckpointDto {
  @ApiProperty() @IsLatitude() lat: number;
  @ApiProperty() @IsLongitude() lon: number;
  @ApiProperty({ required: false }) @IsOptional() @IsInt() @Min(0) @Max(9000) eleM?: number;
  @ApiProperty({ enum: ['start', 'check', 'camp', 'water', 'warn', 'summit', 'finish'] })
  @IsIn(['start', 'check', 'camp', 'water', 'warn', 'summit', 'finish'])
  kind: CheckpointKind;
  @ApiProperty({ required: false }) @IsOptional() @IsString() @MaxLength(500) photoUrl?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() @MaxLength(300) note?: string;
  @ApiProperty() @IsInt() @Min(0) orderIdx: number;
}

class SubmitEvidenceDto {
  @ApiProperty() @IsUUID() checkpointId: string;
  @ApiProperty({ description: 'Key ảnh từ /media/upload' }) @IsString() @MaxLength(300) photoKey: string;
  @ApiProperty() @IsLatitude() lat: number;
  @ApiProperty() @IsLongitude() lon: number;
  @ApiProperty({ required: false }) @IsOptional() @IsInt() eleM?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() @Min(0) accuracyM?: number;
  @ApiProperty({ description: 'Thời điểm chụp (GPS live — không tin EXIF)' }) @IsISO8601() capturedAt: string;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() isMockProvider?: boolean;
}

class FinishDto {
  @ApiProperty({ description: 'Số mốc km tự động đã qua (client đếm, server cap theo cự ly)' })
  @IsInt() @Min(0) @Max(500) kmMarksHit: number;
}

@ApiTags('completions')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller()
export class CompletionsController {
  constructor(private completions: CompletionsService) {}

  /** Checkpoint của cung (cần đã mua/miễn phí) — app dùng để dẫn + nhắc chụp */
  @Get('routes/:slug/checkpoints')
  list(@CurrentUser() user: JwtPayload, @Param('slug') slug: string) {
    return this.completions.listCheckpoints(user, slug);
  }

  /** Người mở cung/admin thêm checkpoint (ảnh giữa đường — docs/08 B2) */
  @Post('routes/:slug/checkpoints')
  add(@CurrentUser() user: JwtPayload, @Param('slug') slug: string, @Body() dto: AddCheckpointDto) {
    return this.completions.addCheckpoint(user, slug, dto);
  }

  /** Bắt đầu đi cung (idempotent — trả lần active nếu đang đi) */
  @Post('completions/routes/:slug/start')
  start(@CurrentUser() user: JwtPayload, @Param('slug') slug: string) {
    return this.completions.start(user, slug);
  }

  /** Nộp bằng chứng checkpoint — server re-validate 5 bước docs/08 C1 */
  @Post('completions/:id/evidence')
  evidence(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SubmitEvidenceDto,
  ) {
    return this.completions.submitEvidence(user, id, dto);
  }

  /** Kết thúc → verify_score + CERTIFIED (≥0.7) + uy tín + push */
  @Post('completions/:id/finish')
  finish(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: FinishDto,
  ) {
    return this.completions.finish(user, id, dto.kmMarksHit);
  }

  @Get('completions/mine')
  mine(@CurrentUser() user: JwtPayload) {
    return this.completions.mine(user.sub);
  }
}
