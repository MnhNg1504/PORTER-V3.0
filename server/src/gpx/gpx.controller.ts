import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiProperty } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { IsString, MinLength, MaxLength } from 'class-validator';
import { GpxService } from './gpx.service';
import { CurrentUser, MinTier, RolesGuard } from '../common/auth.decorators';
import type { JwtPayload } from '../auth/jwt.strategy';

class SubmitGpxDto {
  @ApiProperty({ example: 'Lảo Thẩn 2 ngày 1 đêm' })
  @IsString()
  @MinLength(3)
  @MaxLength(120)
  routeName: string;

  @ApiProperty({ description: 'Nội dung file GPX (XML)' })
  @IsString()
  @MinLength(100)
  @MaxLength(20_000_000) // ~20MB text
  rawGpx: string;
}

@ApiTags('gpx')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('gpx')
export class GpxController {
  constructor(private gpx: GpxService) {}

  /** Chỉ Cấp 2+ được mở cung (docs/04 — ma trận phân quyền) */
  @Post('submit')
  @MinTier(2)
  submit(@CurrentUser() user: JwtPayload, @Body() dto: SubmitGpxDto) {
    return this.gpx.submit(user.sub, dto.routeName, dto.rawGpx);
  }

  @Get('mine')
  mine(@CurrentUser() user: JwtPayload) {
    return this.gpx.mySubmissions(user.sub);
  }
}
