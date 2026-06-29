import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePermissionDto {
  @ApiProperty({ example: 'INVOICE_CREATE' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @ApiProperty({ example: 'INVOICE' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  module!: string;
}
