import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { PurchasesService } from './purchases.service';
import { CurrentUser } from '../common/auth.decorators';
import type { JwtPayload } from '../auth/jwt.strategy';

@ApiTags('purchases')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('purchases')
export class PurchasesController {
  constructor(private purchases: PurchasesService) {}

  @Post('routes/:slug')
  buy(@CurrentUser() user: JwtPayload, @Param('slug') slug: string) {
    return this.purchases.buy(user, slug);
  }

  @Get('mine')
  mine(@CurrentUser() user: JwtPayload) {
    return this.purchases.myPurchases(user.sub);
  }
}
