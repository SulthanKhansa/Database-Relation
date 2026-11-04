import { ApiPropertyOptional, PartialType, OmitType } from '@nestjs/swagger';
import { IsArray, IsOptional, IsUUID } from 'class-validator';
import { CreateBookDto } from './create-book.dto.js';

export class UpdateBookDto extends PartialType(
  OmitType(CreateBookDto, ['authorIds'] as const),
) {
  @ApiPropertyOptional({ format: 'uuid', isArray: true })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  authorIds?: string[];
}
