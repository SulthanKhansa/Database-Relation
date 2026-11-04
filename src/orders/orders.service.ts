import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'node:crypto';
import { DataSource, ILike, In, Repository, type FindOptionsWhere } from 'typeorm';
import { Book } from '../books/entities/book.entity.js';
import type { PaginatedResult } from '../common/interfaces/paginated-result.interface.js';
import { paginate } from '../common/utils/paginate.js';
import { Customer } from '../customers/entities/customer.entity.js';
import { OrderItem } from '../order-items/entities/order-item.entity.js';
import type { CreateOrderDto } from './dto/create-order.dto.js';
import type { QueryOrderDto } from './dto/query-order.dto.js';
import type { UpdateOrderStatusDto } from './dto/update-order-status.dto.js';
import { Order, OrderStatus } from './entities/order.entity.js';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Membuat pesanan + order_items dalam satu transaksi:
   * - harga diambil dari books.price sebagai snapshot
   * - stok dikurangi dan divalidasi
   * - total_amount dihitung dari subtotal item
   */
  async create(dto: CreateOrderDto): Promise<Order> {
    const orderId = await this.dataSource.transaction(async (manager) => {
      const customer = await manager.findOneBy(Customer, {
        id: dto.customerId,
      });

      if (!customer) {
        throw new NotFoundException('Customer tidak ditemukan');
      }

      const quantities = new Map<string, number>();

      for (const item of dto.items) {
        quantities.set(
          item.bookId,
          (quantities.get(item.bookId) ?? 0) + item.quantity,
        );
      }

      const books = await manager.findBy(Book, {
        id: In([...quantities.keys()]),
      });

      if (books.length !== quantities.size) {
        throw new NotFoundException('Sebagian buku tidak ditemukan');
      }

      let totalAmount = 0;
      const orderItems: OrderItem[] = [];

      for (const book of books) {
        const quantity = quantities.get(book.id) ?? 0;

        if (book.stock < quantity) {
          throw new BadRequestException(
            `Stok buku "${book.title}" tidak mencukupi`,
          );
        }

        const subtotal = Number((book.price * quantity).toFixed(2));
        totalAmount += subtotal;

        book.stock -= quantity;
        book.isAvailable = book.stock > 0;
        await manager.save(book);

        orderItems.push(
          manager.create(OrderItem, {
            bookId: book.id,
            quantity,
            price: book.price,
            subtotal,
          }),
        );
      }

      const order = manager.create(Order, {
        customerId: dto.customerId,
        orderNumber: this.generateOrderNumber(),
        status: OrderStatus.Pending,
        totalAmount: Number(totalAmount.toFixed(2)),
      });

      const savedOrder = await manager.save(order);

      for (const item of orderItems) {
        item.orderId = savedOrder.id;
      }

      await manager.save(orderItems);
      return savedOrder.id;
    });

    return this.findOne(orderId);
  }

  async findAll(query: QueryOrderDto): Promise<PaginatedResult<Order>> {
    const base: FindOptionsWhere<Order> = {};

    if (query.customerId) {
      base.customerId = query.customerId;
    }

    if (query.status) {
      base.status = query.status;
    }

    const where: FindOptionsWhere<Order>[] | FindOptionsWhere<Order> =
      query.search
        ? [{ ...base, orderNumber: ILike(`%${query.search}%`) }]
        : base;

    return paginate(
      this.ordersRepository,
      {
        where,
        relations: { customer: true },
        order: { createdAt: 'DESC' },
      },
      query.page,
      query.limit,
    );
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.ordersRepository.findOne({
      where: { id },
      relations: {
        customer: true,
        items: { book: true },
        payment: true,
        shipment: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Pesanan tidak ditemukan');
    }

    return order;
  }

  async updateStatus(
    id: string,
    dto: UpdateOrderStatusDto,
  ): Promise<Order> {
    const order = await this.findOne(id);
    order.status = dto.status;
    await this.ordersRepository.save(order);

    return this.findOne(id);
  }

  async remove(id: string) {
    const order = await this.findOne(id);
    await this.ordersRepository.remove(order);

    return { id, deleted: true };
  }

  private generateOrderNumber(): string {
    const date = new Date().toISOString().slice(0, 10).replaceAll('-', '');
    const suffix = randomUUID().slice(0, 8).toUpperCase();

    return `ORD-${date}-${suffix}`;
  }
}
