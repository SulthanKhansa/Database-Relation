import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository, type FindOptionsWhere } from 'typeorm';
import type { PaginationQueryDto } from '../common/dto/pagination-query.dto.js';
import type { PaginatedResult } from '../common/interfaces/paginated-result.interface.js';
import { paginate } from '../common/utils/paginate.js';
import type { CreateCustomerDto } from './dto/create-customer.dto.js';
import type { UpdateCustomerDto } from './dto/update-customer.dto.js';
import { Customer } from './entities/customer.entity.js';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private readonly customersRepository: Repository<Customer>,
  ) {}

  async create(dto: CreateCustomerDto): Promise<Customer> {
    const email = dto.email.trim().toLowerCase();
    const existing = await this.customersRepository.findOne({
      where: { email },
    });

    if (existing) {
      throw new ConflictException('Email customer sudah terdaftar');
    }

    const customer = this.customersRepository.create({
      name: dto.name,
      email,
      phone: dto.phone ?? null,
    });

    return this.customersRepository.save(customer);
  }

  async findAll(
    query: PaginationQueryDto,
  ): Promise<PaginatedResult<Customer>> {
    const where: FindOptionsWhere<Customer>[] | FindOptionsWhere<Customer> =
      query.search
        ? [
            { name: ILike(`%${query.search}%`) },
            { email: ILike(`%${query.search}%`) },
            { phone: ILike(`%${query.search}%`) },
          ]
        : {};

    return paginate(
      this.customersRepository,
      { where, order: { createdAt: 'DESC' } },
      query.page,
      query.limit,
    );
  }

  async findOne(id: string): Promise<Customer> {
    const customer = await this.customersRepository.findOne({
      where: { id },
      relations: { addresses: true },
    });

    if (!customer) {
      throw new NotFoundException('Customer tidak ditemukan');
    }

    return customer;
  }

  async update(id: string, dto: UpdateCustomerDto): Promise<Customer> {
    const customer = await this.findOne(id);
    const email = dto.email?.trim().toLowerCase();

    if (email && email !== customer.email) {
      const existing = await this.customersRepository.findOne({
        where: { email },
      });

      if (existing) {
        throw new ConflictException('Email customer sudah terdaftar');
      }

      customer.email = email;
    }

    if (dto.name !== undefined) {
      customer.name = dto.name;
    }

    if (dto.phone !== undefined) {
      customer.phone = dto.phone;
    }

    return this.customersRepository.save(customer);
  }

  async remove(id: string) {
    const result = await this.customersRepository.softDelete(id);

    if (!result.affected) {
      throw new NotFoundException('Customer tidak ditemukan');
    }

    return { id, deleted: true };
  }
}
