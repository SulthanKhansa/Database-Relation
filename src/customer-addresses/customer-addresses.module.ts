import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from '../customers/entities/customer.entity.js';
import { CustomerAddressesController } from './customer-addresses.controller.js';
import { CustomerAddressesService } from './customer-addresses.service.js';
import { CustomerAddress } from './entities/customer-address.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([CustomerAddress, Customer])],
  controllers: [CustomerAddressesController],
  providers: [CustomerAddressesService],
  exports: [CustomerAddressesService],
})
export class CustomerAddressesModule {}
