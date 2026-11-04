import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateCustomerDto {
  @ApiProperty({ example: 'Budi Santoso' })
  @IsString()
  @MaxLength(150)
  name: string;

  @ApiProperty({ example: 'budi@example.com' })
  @IsEmail()
  @MaxLength(150)
  email: string;

  @ApiPropertyOptional({ example: '081234567890' })
  @IsString()
  @MaxLength(20)
  @IsOptional()
  phone?: string;
}
