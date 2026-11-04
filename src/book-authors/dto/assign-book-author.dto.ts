import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class AssignBookAuthorDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  bookId: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  authorId: string;
}
