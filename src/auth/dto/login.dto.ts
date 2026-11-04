import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'admin@bookstore.local' })
  @IsEmail()
  @MaxLength(150)
  email: string;

  @ApiProperty({ example: 'Admin123!' })
  @IsString()
  @MaxLength(72)
  password: string;
}
