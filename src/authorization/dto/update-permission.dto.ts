import {
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdatePermissionDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  module?: string;
}