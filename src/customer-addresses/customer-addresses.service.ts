import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository, type FindOptionsWhere } from 'typeorm';
import type { PaginatedResult } from '../common/interfaces/paginated-result.interface.js';
import { paginate } from '../common/utils/paginate.js';
import { Customer } from '../customers/entities/customer.entity.js';
import type { CreateCustomerAddressDto } from './dto/create-customer-address.dto.js';
import type { QueryCustomerAddressDto } from './dto/query-customer-address.dto.js';
import type { UpdateCustomerAddressDto } from './dto/update-customer-address.dto.js';
import { CustomerAddress } from './entities/customer-address.entity.js';

@Injectable()
export class CustomerAddressesService {
  constructor(
    @InjectRepository(CustomerAddress)
    private readonly addressesRepository: Repository<CustomerAddress>,
    @InjectRepository(Customer)
    private readonly customersRepository: Repository<Customer>,
  ) {}

  async create(dto: CreateCustomerAddressDto): Promise<CustomerAddress> {
    await this.ensureCustomerExists(dto.customerId);

    const address = this.addressesRepository.create(dto);
    const saved = await this.addressesRepository.save(address);

    return this.findOne(saved.id);
  }

  async findAll(
    query: QueryCustomerAddressDto,
  ): Promise<PaginatedResult<CustomerAddress>> {
    const base: FindOptionsWhere<CustomerAddress> = {};

    if (query.customerId) {
      base.customerId = query.customerId;
    }

    const where:
      | FindOptionsWhere<CustomerAddress>[]
      | FindOptionsWhere<CustomerAddress> = query.search
      ? [
          { ...base, recipientName: ILike(`%${query.search}%`) },
          { ...base, city: ILike(`%${query.search}%`) },
          { ...base, address: ILike(`%${query.search}%`) },
        ]
      : base;

    return paginate(
      this.addressesRepository,
      {
        where,
        relations: { customer: true },
        order: { createdAt: 'DESC' },
      },
      query.page,
      query.limit,
    );
  }

  async findOne(id: string): Promise<CustomerAddress> {
    const address = await this.addressesRepository.findOne({
      where: { id },
      relations: { customer: true },
    });

    if (!address) {
      throw new NotFoundException('Alamat customer tidak ditemukan');
    }

    return address;
  }

  async update(
    id: string,
    dto: UpdateCustomerAddressDto,
  ): Promise<CustomerAddress> {
    const address = await this.findOne(id);

    if (dto.customerId && dto.customerId !== address.customerId) {
      await this.ensureCustomerExists(dto.customerId);
      address.customerId = dto.customerId;
    }

    if (dto.recipientName !== undefined) {
      address.recipientName = dto.recipientName;
    }

    if (dto.phone !== undefined) {
      address.phone = dto.phone;
    }

    if (dto.address !== undefined) {
      address.address = dto.address;
    }

    if (dto.city !== undefined) {
      address.city = dto.city;
    }

    if (dto.postalCode !== undefined) {
      address.postalCode = dto.postalCode;
    }

    await this.addressesRepository.save(address);
    return this.findOne(id);
  }

  async remove(id: string) {
    const address = await this.findOne(id);
    await this.addressesRepository.remove(address);

    return { id, deleted: true };
  }

  private async ensureCustomerExists(customerId: string) {
    const exists = await this.customersRepository.existsBy({ id: customerId });

    if (!exists) {
      throw new NotFoundException('Customer tidak ditemukan');
    }
  }
}
