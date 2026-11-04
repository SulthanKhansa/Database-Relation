import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';
import { ShipmentStatus } from '../entities/shipment.entity.js';

export class QueryShipmentDto extends PaginationQueryDto {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsUUID()
  @IsOptional()
  orderId?: string;

  @ApiPropertyOptional({ enum: ShipmentStatus })
  @IsEnum(ShipmentStatus)
  @IsOptional()
  status?: ShipmentStatus;
}
