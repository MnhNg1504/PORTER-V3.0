import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RoutesService } from './routes.service';
import { CurrentUser } from '../common/auth.decorators';
import type { JwtPayload } from '../auth/jwt.strategy';
import type { Difficulty } from './route.entity';

@ApiTags('routes')
@Controller('routes')
export class RoutesController {
  constructor(private routes: RoutesService) {}

  @Get()
  @ApiQuery({ name: 'difficulty', required: false, enum: ['easy', 'standard', 'hard'] })
  list(@Query('difficulty') difficulty?: Difficulty) {
    return this.routes.list(difficulty);
  }

  @Get(':slug')
  detail(@Param('slug') slug: string) {
    return this.routes.detail(slug);
  }

  @Get(':slug/track')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  fullTrack(@Param('slug') slug: string, @CurrentUser() user: JwtPayload) {
    return this.routes.fullTrack(slug, user);
  }
}
