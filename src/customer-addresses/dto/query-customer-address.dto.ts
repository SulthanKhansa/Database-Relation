import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';

export class QueryCustomerAddressDto extends PaginationQueryDto {
  @ApiPropertyOptional({ format: 'uuid', description: 'Filter berdasarkan customer' })
  @IsUUID()
  @IsOptional()
  customerId?: string;
}
