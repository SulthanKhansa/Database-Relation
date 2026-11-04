import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Book } from '../books/entities/book.entity.js';
import { Order } from '../orders/entities/order.entity.js';
import { OrderItem } from './entities/order-item.entity.js';
import { OrderItemsController } from './order-items.controller.js';
import { OrderItemsService } from './order-items.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([OrderItem, Order, Book])],
  controllers: [OrderItemsController],
  providers: [OrderItemsService],
  exports: [OrderItemsService],
})
export class OrderItemsModule {}
