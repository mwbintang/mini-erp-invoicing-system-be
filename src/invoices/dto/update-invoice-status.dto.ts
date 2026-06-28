import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { InvoiceStatus } from '@prisma/client';

export class UpdateInvoiceStatusDto {
  @ApiProperty({ enum: InvoiceStatus, example: InvoiceStatus.SENT })
  @IsNotEmpty()
  @IsEnum(InvoiceStatus)
  status: InvoiceStatus;
}
