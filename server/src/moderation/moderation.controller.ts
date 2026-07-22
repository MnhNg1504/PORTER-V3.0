import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiProperty } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { IsIn, IsString, IsUUID, MinLength, MaxLength } from 'class-validator';
import { ModerationService } from './moderation.service';
import { CurrentUser } from '../common/auth.decorators';
import type { JwtPayload } from '../auth/jwt.strategy';
import type { ReportTargetType } from './report.entity';

class CreateReportDto {
  @ApiProperty({ enum: ['user', 'post', 'route', 'message'] })
  @IsIn(['user', 'post', 'route', 'message'])
  targetType: ReportTargetType;

  @ApiProperty()
  @IsUUID()
  targetId: string;

  @ApiProperty({ example: 'Nội dung lừa đảo bán cung không có thật' })
  @IsString()
  @MinLength(10)
  @MaxLength(1000)
  reason: string;
}

@ApiTags('moderation')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('moderation')
export class ModerationController {
  constructor(private mod: ModerationService) {}

  @Post('reports')
  report(@CurrentUser() user: JwtPayload, @Body() dto: CreateReportDto) {
    return this.mod.report(user.sub, dto.targetType, dto.targetId, dto.reason);
  }

  @Post('blocks/:userId')
  block(@CurrentUser() user: JwtPayload, @Param('userId', ParseUUIDPipe) userId: string) {
    return this.mod.block(user.sub, userId);
  }

  @Delete('blocks/:userId')
  unblock(@CurrentUser() user: JwtPayload, @Param('userId', ParseUUIDPipe) userId: string) {
    return this.mod.unblock(user.sub, userId);
  }

  @Get('blocks')
  myBlocks(@CurrentUser() user: JwtPayload) {
    return this.mod.myBlocks(user.sub);
  }
}
