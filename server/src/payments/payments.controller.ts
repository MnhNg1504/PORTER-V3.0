import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiProperty } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { IsString, IsInt, Min, Matches, IsOptional, IsBoolean } from 'class-validator';
import { PaymentsService } from './payments.service';
import { CurrentUser } from '../common/auth.decorators';
import type { JwtPayload } from '../auth/jwt.strategy';

class CreateOrderBody {
  @ApiProperty({ example: 'lao-than' })
  @IsString()
  routeSlug: string;

  @ApiProperty({ example: '2026-09-02', description: 'Ngày đi YYYY-MM-DD' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'tripDate phải dạng YYYY-MM-DD' })
  tripDate: string;

  @ApiProperty({ example: 3 })
  @IsInt()
  @Min(1)
  headcount: number;
}

class CancelBody {
  @ApiProperty({ required: false, description: 'Bão/bất khả kháng — CHỈ admin áp dụng (QĐ-5)' })
  @IsOptional()
  @IsBoolean()
  forceMajeure?: boolean;
}

@ApiTags('payments')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('orders')
export class PaymentsController {
  constructor(private payments: PaymentsService) {}

  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() body: CreateOrderBody) {
    return this.payments.createOrder(user, body);
  }

  @Get('mine')
  mine(@CurrentUser() user: JwtPayload) {
    return this.payments.mine(user.sub);
  }

  @Get(':id')
  detail(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.payments.detail(user, id);
  }

  /** Sandbox: mô phỏng khách trả cọc thành công (thay cho redirect PSP thật). */
  @Post(':id/pay-sandbox')
  paySandbox(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.payments.paySandbox(user, id);
  }

  @Post(':id/confirm')
  confirm(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.payments.confirm(user, id);
  }

  @Post(':id/complete')
  complete(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.payments.complete(user, id);
  }

  @Post(':id/cancel')
  cancel(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() body: CancelBody) {
    return this.payments.cancel(user, id, body.forceMajeure ?? false);
  }
}
