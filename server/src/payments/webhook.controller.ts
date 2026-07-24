import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';

/**
 * Webhook cổng thanh toán — KHÔNG qua JWT (PSP gọi server-to-server).
 * Production: xác thực chữ ký cổng trong gateway.verifyWebhook (docs/18).
 */
@ApiTags('payments')
@Controller('payments')
export class PaymentWebhookController {
  constructor(private payments: PaymentsService) {}

  @Post('webhook')
  webhook(@Body() payload: Record<string, unknown>) {
    return this.payments.handleWebhook(payload);
  }
}
