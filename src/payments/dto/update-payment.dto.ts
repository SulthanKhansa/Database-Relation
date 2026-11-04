import { OmitType, PartialType } from '@nestjs/swagger';
import { CreatePaymentDto } from './create-payment.dto.js';

export class UpdatePaymentDto extends PartialType(
  OmitType(CreatePaymentDto, ['orderId'] as const),
) {}
