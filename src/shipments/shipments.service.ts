import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, type FindOptionsWhere } from 'typeorm';
import type { PaginatedResult } from '../common/interfaces/paginated-result.interface.js';
import { paginate } from '../common/utils/paginate.js';
import { Order, OrderStatus } from '../orders/entities/order.entity.js';
import type { CreateShipmentDto } from './dto/create-shipment.dto.js';
import type { QueryShipmentDto } from './dto/query-shipment.dto.js';
import type { UpdateShipmentDto } from './dto/update-shipment.dto.js';
import { Shipment, ShipmentStatus } from './entities/shipment.entity.js';

@Injectable()
export class ShipmentsService {
  constructor(
    @InjectRepository(Shipment)
    private readonly shipmentsRepository: Repository<Shipment>,
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
  ) {}

  async create(dto: CreateShipmentDto): Promise<Shipment> {
    const order = await this.ordersRepository.findOneBy({ id: dto.orderId });

    if (!order) {
      throw new NotFoundException('Pesanan tidak ditemukan');
    }

    const existing = await this.shipmentsRepository.findOneBy({
      orderId: dto.orderId,
    });

    if (existing) {
      throw new ConflictException('Pesanan ini sudah memiliki pengiriman');
    }

    const status = dto.status ?? ShipmentStatus.Pending;
    const now = new Date();

    const shipment = this.shipmentsRepository.create({
      orderId: dto.orderId,
      courier: dto.courier,
      trackingNumber: dto.trackingNumber ?? null,
      status,
      shippedAt:
        status === ShipmentStatus.Shipped || status === ShipmentStatus.Delivered
          ? now
          : null,
      deliveredAt: status === ShipmentStatus.Delivered ? now : null,
    });

    const saved = await this.shipmentsRepository.save(shipment);
    await this.syncOrderStatus(saved);

    return this.findOne(saved.id);
  }

  async findAll(
    query: QueryShipmentDto,
  ): Promise<PaginatedResult<Shipment>> {
    const where: FindOptionsWhere<Shipment> = {};

    if (query.orderId) {
      where.orderId = query.orderId;
    }

    if (query.status) {
      where.status = query.status;
    }

    return paginate(
      this.shipmentsRepository,
      {
        where,
        relations: { order: true },
        order: { id: 'DESC' },
      },
      query.page,
      query.limit,
    );
  }

  async findOne(id: string): Promise<Shipment> {
    const shipment = await this.shipmentsRepository.findOne({
      where: { id },
      relations: { order: true },
    });

    if (!shipment) {
      throw new NotFoundException('Pengiriman tidak ditemukan');
    }

    return shipment;
  }

  async update(id: string, dto: UpdateShipmentDto): Promise<Shipment> {
    const shipment = await this.findOne(id);

    if (dto.courier !== undefined) {
      shipment.courier = dto.courier;
    }

    if (dto.trackingNumber !== undefined) {
      shipment.trackingNumber = dto.trackingNumber;
    }

    if (dto.status !== undefined) {
      shipment.status = dto.status;

      if (dto.status === ShipmentStatus.Shipped) {
        shipment.shippedAt = shipment.shippedAt ?? new Date();
      }

      if (dto.status === ShipmentStatus.Delivered) {
        shipment.shippedAt = shipment.shippedAt ?? new Date();
        shipment.deliveredAt = shipment.deliveredAt ?? new Date();
      }
    }

    await this.shipmentsRepository.save(shipment);
    await this.syncOrderStatus(shipment);

    return this.findOne(id);
  }

  async remove(id: string) {
    const shipment = await this.findOne(id);
    await this.shipmentsRepository.remove(shipment);

    await this.ordersRepository.update(
      { id: shipment.orderId, status: OrderStatus.Shipped },
      { status: OrderStatus.Processing },
    );

    return { id, deleted: true };
  }

  private async syncOrderStatus(shipment: Shipment) {
    if (shipment.status === ShipmentStatus.Delivered) {
      await this.ordersRepository.update(shipment.orderId, {
        status: OrderStatus.Completed,
      });
      return;
    }

    if (shipment.status === ShipmentStatus.Shipped) {
      await this.ordersRepository.update(shipment.orderId, {
        status: OrderStatus.Shipped,
      });
    }
  }
}
