import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateBookDto {
  @ApiProperty({ example: 'Clean Architecture', maxLength: 150 })
  @IsString()
  @MaxLength(150)
  title: string;

  @ApiProperty({ example: '9780134494166', maxLength: 45 })
  @IsString()
  @MaxLength(45)
  isbn: string;

  @ApiPropertyOptional({ example: 2017, default: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  publishedYear?: number;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  isAvailable?: boolean;

  @ApiPropertyOptional({ example: 150000, default: 0 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  price?: number;

  @ApiPropertyOptional({ example: 10, default: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  stock?: number;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsUUID()
  @IsOptional()
  publisherId?: string;

  @ApiPropertyOptional({
    format: 'uuid',
    isArray: true,
    description: 'Daftar penulis yang terhubung melalui tabel book_authors',
  })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  authorIds?: string[];
}
