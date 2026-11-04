import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, type FindOptionsWhere } from 'typeorm';
import type { PaginatedResult } from '../common/interfaces/paginated-result.interface.js';
import { paginate } from '../common/utils/paginate.js';
import { Order, OrderStatus } from '../orders/entities/order.entity.js';
import type { CreatePaymentDto } from './dto/create-payment.dto.js';
import type { QueryPaymentDto } from './dto/query-payment.dto.js';
import type { UpdatePaymentDto } from './dto/update-payment.dto.js';
import { Payment, PaymentStatus } from './entities/payment.entity.js';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentsRepository: Repository<Payment>,
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
  ) {}

  async create(dto: CreatePaymentDto): Promise<Payment> {
    const order = await this.ordersRepository.findOneBy({ id: dto.orderId });

    if (!order) {
      throw new NotFoundException('Pesanan tidak ditemukan');
    }

    const existing = await this.paymentsRepository.findOneBy({
      orderId: dto.orderId,
    });

    if (existing) {
      throw new ConflictException('Pesanan ini sudah memiliki pembayaran');
    }

    const status = dto.status ?? PaymentStatus.Pending;
    const amount = dto.amount ?? Number(order.totalAmount);

    if (amount > Number(order.totalAmount)) {
      throw new BadRequestException(
        'Jumlah pembayaran melebihi total pesanan',
      );
    }

    const payment = this.paymentsRepository.create({
      orderId: dto.orderId,
      paymentMethod: dto.paymentMethod,
      amount,
      status,
      paidAt: status === PaymentStatus.Paid ? new Date() : null,
    });

    const saved = await this.paymentsRepository.save(payment);

    if (status === PaymentStatus.Paid) {
      await this.ordersRepository.update(order.id, {
        status: OrderStatus.Paid,
      });
    }

    return this.findOne(saved.id);
  }

  async findAll(
    query: QueryPaymentDto,
  ): Promise<PaginatedResult<Payment>> {
    const where: FindOptionsWhere<Payment> = {};

    if (query.orderId) {
      where.orderId = query.orderId;
    }

    if (query.status) {
      where.status = query.status;
    }

    return paginate(
      this.paymentsRepository,
      {
        where,
        relations: { order: true },
        order: { createdAt: 'DESC' },
      },
      query.page,
      query.limit,
    );
  }

  async findOne(id: string): Promise<Payment> {
    const payment = await this.paymentsRepository.findOne({
      where: { id },
      relations: { order: true },
    });

    if (!payment) {
      throw new NotFoundException('Pembayaran tidak ditemukan');
    }

    return payment;
  }

  async update(id: string, dto: UpdatePaymentDto): Promise<Payment> {
    const payment = await this.findOne(id);

    if (dto.paymentMethod !== undefined) {
      payment.paymentMethod = dto.paymentMethod;
    }

    if (dto.amount !== undefined) {
      const order = await this.ordersRepository.findOneBy({
        id: payment.orderId,
      });

      if (!order) {
        throw new NotFoundException('Pesanan tidak ditemukan');
      }

      if (dto.amount > Number(order.totalAmount)) {
        throw new BadRequestException(
          'Jumlah pembayaran melebihi total pesanan',
        );
      }

      payment.amount = dto.amount;
    }

    if (dto.status !== undefined && dto.status !== payment.status) {
      payment.status = dto.status;
      payment.paidAt =
        dto.status === PaymentStatus.Paid
          ? (payment.paidAt ?? new Date())
          : null;

      if (dto.status === PaymentStatus.Paid) {
        await this.ordersRepository.update(payment.orderId, {
          status: OrderStatus.Paid,
        });
      }
    }

    await this.paymentsRepository.save(payment);
    return this.findOne(id);
  }

  async remove(id: string) {
    const payment = await this.findOne(id);
    await this.paymentsRepository.remove(payment);

    await this.ordersRepository.update(
      { id: payment.orderId, status: OrderStatus.Paid },
      { status: OrderStatus.Pending },
    );

    return { id, deleted: true };
  }
}
