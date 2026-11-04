import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { ShipmentStatus } from '../entities/shipment.entity.js';

export class CreateShipmentDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  orderId: string;

  @ApiProperty({ example: 'JNE' })
  @IsString()
  @MaxLength(100)
  courier: string;

  @ApiPropertyOptional({ example: 'JNE1234567890' })
  @IsString()
  @MaxLength(100)
  @IsOptional()
  trackingNumber?: string;

  @ApiPropertyOptional({ enum: ShipmentStatus, default: ShipmentStatus.Pending })
  @IsEnum(ShipmentStatus)
  @IsOptional()
  status?: ShipmentStatus;
}
