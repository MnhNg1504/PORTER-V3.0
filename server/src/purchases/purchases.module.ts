import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Purchase } from './purchase.entity';
import { TrekRoute } from '../routes/route.entity';
import { PurchasesService } from './purchases.service';
import { PurchasesController } from './purchases.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Purchase, TrekRoute])],
  providers: [PurchasesService],
  controllers: [PurchasesController],
})
export class PurchasesModule {}
