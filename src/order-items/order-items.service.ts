import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, type EntityManager, type FindOptionsWhere } from 'typeorm';
import { Book } from '../books/entities/book.entity.js';
import type { PaginatedResult } from '../common/interfaces/paginated-result.interface.js';
import { paginate } from '../common/utils/paginate.js';
import type { CreateOrderItemDto } from './dto/create-order-item.dto.js';
import type { QueryOrderItemDto } from './dto/query-order-item.dto.js';
import type { UpdateOrderItemDto } from './dto/update-order-item.dto.js';
import { OrderItem } from './entities/order-item.entity.js';
import { Order, OrderStatus } from '../orders/entities/order.entity.js';

@Injectable()
export class OrderItemsService {
  constructor(
    @InjectRepository(OrderItem)
    private readonly orderItemsRepository: Repository<OrderItem>,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateOrderItemDto): Promise<OrderItem> {
    const itemId = await this.dataSource.transaction(async (manager) => {
      const order = await manager.findOneBy(Order, { id: dto.orderId });

      if (!order) {
        throw new NotFoundException('Pesanan tidak ditemukan');
      }

      if (order.status === OrderStatus.Cancelled) {
        throw new BadRequestException(
          'Tidak dapat menambah item pada pesanan yang dibatalkan',
        );
      }

      const book = await manager.findOneBy(Book, { id: dto.bookId });

      if (!book) {
        throw new NotFoundException('Buku tidak ditemukan');
      }

      if (book.stock < dto.quantity) {
        throw new BadRequestException(
          `Stok buku "${book.title}" tidak mencukupi`,
        );
      }

      book.stock -= dto.quantity;
      book.isAvailable = book.stock > 0;

      const subtotal = Number((book.price * dto.quantity).toFixed(2));
      const item = manager.create(OrderItem, {
        orderId: order.id,
        bookId: book.id,
        quantity: dto.quantity,
        price: book.price,
        subtotal,
      });

      const saved = await manager.save(item);
      await manager.save(book);
      await this.recalculateOrderTotal(manager, order.id);

      return saved.id;
    });

    return this.findOne(itemId);
  }

  async findAll(
    query: QueryOrderItemDto,
  ): Promise<PaginatedResult<OrderItem>> {
    const where: FindOptionsWhere<OrderItem> = {};

    if (query.orderId) {
      where.orderId = query.orderId;
    }

    if (query.bookId) {
      where.bookId = query.bookId;
    }

    return paginate(
      this.orderItemsRepository,
      {
        where,
        relations: { book: true, order: true },
        order: { id: 'ASC' },
      },
      query.page,
      query.limit,
    );
  }

  async findOne(id: string): Promise<OrderItem> {
    const item = await this.orderItemsRepository.findOne({
      where: { id },
      relations: { book: true, order: true },
    });

    if (!item) {
      throw new NotFoundException('Item pesanan tidak ditemukan');
    }

    return item;
  }

  async update(id: string, dto: UpdateOrderItemDto): Promise<OrderItem> {
    await this.dataSource.transaction(async (manager) => {
      const item = await manager.findOneBy(OrderItem, { id });

      if (!item) {
        throw new NotFoundException('Item pesanan tidak ditemukan');
      }

      const book = await manager.findOneBy(Book, { id: item.bookId });

      if (!book) {
        throw new NotFoundException('Buku tidak ditemukan');
      }

      const difference = dto.quantity - item.quantity;

      if (difference > 0 && book.stock < difference) {
        throw new BadRequestException(
          `Stok buku "${book.title}" tidak mencukupi`,
        );
      }

      book.stock -= difference;
      book.isAvailable = book.stock > 0;

      item.quantity = dto.quantity;
      item.subtotal = Number((item.price * dto.quantity).toFixed(2));

      await manager.save(book);
      await manager.save(item);
      await this.recalculateOrderTotal(manager, item.orderId);
    });

    return this.findOne(id);
  }

  async remove(id: string) {
    await this.dataSource.transaction(async (manager) => {
      const item = await manager.findOneBy(OrderItem, { id });

      if (!item) {
        throw new NotFoundException('Item pesanan tidak ditemukan');
      }

      const book = await manager.findOneBy(Book, { id: item.bookId });

      if (book) {
        book.stock += item.quantity;
        book.isAvailable = true;
        await manager.save(book);
      }

      await manager.remove(item);
      await this.recalculateOrderTotal(manager, item.orderId);
    });

    return { id, deleted: true };
  }

  private async recalculateOrderTotal(
    manager: EntityManager,
    orderId: string,
  ) {
    const items = await manager.findBy(OrderItem, { orderId });
    const total = items.reduce(
      (sum, item) => sum + Number(item.subtotal),
      0,
    );

    await manager.update(Order, orderId, {
      totalAmount: Number(total.toFixed(2)),
    });
  }
}
