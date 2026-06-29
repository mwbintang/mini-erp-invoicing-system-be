import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { InvoiceItemDto } from './invoice-item.dto';

export class CreateInvoiceDto {
  @ApiProperty({ example: 'customer-uuid' })
  @IsNotEmpty()
  @IsString()
  customerId: string;

  @ApiProperty({ example: '2026-06-28T00:00:00.000Z' })
  @IsNotEmpty()
  @IsDateString()
  issueDate: string;

  @ApiPropertyOptional({ example: '2026-07-28T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiProperty({ type: [InvoiceItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemDto)
  items: InvoiceItemDto[];
}
