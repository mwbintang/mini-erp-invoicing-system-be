import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePermissionDto {
  @ApiPropertyOptional({ example: 'INVOICE_UPDATE' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ example: 'INVOICE' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  module?: string;
}
