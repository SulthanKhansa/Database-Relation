import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'Staff Toko' })
  @IsString()
  @MaxLength(150)
  name: string;

  @ApiProperty({ example: 'staff@bookstore.local' })
  @IsEmail()
  @MaxLength(150)
  email: string;

  @ApiProperty({ example: 'Staff123!', minLength: 8, maxLength: 72 })
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password: string;
}
