import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './order.entity';
import { EscrowEntry } from './escrow-entry.entity';
import { TrekRoute } from '../routes/route.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { PaymentWebhookController } from './webhook.controller';
import { PaymentGateway, SandboxGateway } from './payment-gateway';

/**
 * Module đặt cung + escrow (Giai đoạn 1, sandbox). Cổng thật (VNPay/MoMo) thay
 * SandboxGateway khi có pháp nhân + hợp đồng PSP (docs/17 §0, docs/18).
 */
@Module({
  imports: [TypeOrmModule.forFeature([Order, EscrowEntry, TrekRoute]), NotificationsModule],
  providers: [PaymentsService, { provide: PaymentGateway, useClass: SandboxGateway }],
  controllers: [PaymentsController, PaymentWebhookController],
  exports: [PaymentsService],
})
export class PaymentsModule {}
