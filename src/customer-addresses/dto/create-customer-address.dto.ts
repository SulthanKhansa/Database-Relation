import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateCustomerAddressDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  customerId: string;

  @ApiProperty({ example: 'Budi Santoso' })
  @IsString()
  @MaxLength(150)
  recipientName: string;

  @ApiProperty({ example: '081234567890' })
  @IsString()
  @MaxLength(20)
  phone: string;

  @ApiProperty({ example: 'Jl. Merdeka No. 10, RT 01/RW 02' })
  @IsString()
  address: string;

  @ApiProperty({ example: 'Bandung' })
  @IsString()
  @MaxLength(100)
  city: string;

  @ApiProperty({ example: '40111' })
  @IsString()
  @MaxLength(10)
  postalCode: string;
}
