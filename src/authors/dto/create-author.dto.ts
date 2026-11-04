import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';

export class CreateAuthorDto {
  @ApiProperty({ example: 'Robert C. Martin' })
  @IsString()
  @MaxLength(150)
  name: string;
}
