import { Module } from '@nestjs/common';
import { InvoicesService } from './services/invoices.service';
import { InvoicesController } from './controllers/invoices.controller';

@Module({
  providers: [InvoicesService],
  controllers: [InvoicesController]
})
export class InvoicesModule {}
