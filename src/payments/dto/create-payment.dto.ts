import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';
import { PaymentStatus } from '../entities/payment.entity.js';

export class CreatePaymentDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  orderId: string;

  @ApiProperty({ example: 'bank_transfer' })
  @IsString()
  @MaxLength(50)
  paymentMethod: string;

  @ApiPropertyOptional({
    example: 150000,
    description: 'Default: total_amount pesanan',
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  amount?: number;

  @ApiPropertyOptional({ enum: PaymentStatus, default: PaymentStatus.Pending })
  @IsEnum(PaymentStatus)
  @IsOptional()
  status?: PaymentStatus;
}
