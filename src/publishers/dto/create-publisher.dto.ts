import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';

export class CreatePublisherDto {
  @ApiProperty({ example: 'Gramedia Pustaka Utama' })
  @IsString()
  @MaxLength(150)
  name: string;
}
