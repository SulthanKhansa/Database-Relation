import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { UserRole } from '../entities/user.entity.js';

export class CreateUserDto {
  @ApiProperty({ example: 'Administrator' })
  @IsString()
  @MaxLength(150)
  name: string;

  @ApiProperty({ example: 'admin@bookstore.local' })
  @IsEmail()
  @MaxLength(150)
  email: string;

  @ApiProperty({ example: 'Admin123!', minLength: 8, maxLength: 72 })
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password: string;

  @ApiPropertyOptional({ enum: UserRole, default: UserRole.Staff })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;
}
