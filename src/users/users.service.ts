import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { hash } from 'bcryptjs';
import { ILike, Repository, type FindOptionsWhere } from 'typeorm';
import type { PaginationQueryDto } from '../common/dto/pagination-query.dto.js';
import type { PaginatedResult } from '../common/interfaces/paginated-result.interface.js';
import { paginate } from '../common/utils/paginate.js';
import type { CreateUserDto } from './dto/create-user.dto.js';
import type { UpdateUserDto } from './dto/update-user.dto.js';
import { User, UserRole } from './entities/user.entity.js';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    const email = dto.email.trim().toLowerCase();
    const existing = await this.usersRepository.findOne({ where: { email } });

    if (existing) {
      throw new ConflictException('Email sudah terdaftar');
    }

    const user = this.usersRepository.create({
      name: dto.name,
      email,
      password: await hash(dto.password, 10),
      role: dto.role ?? UserRole.Staff,
    });

    const saved = await this.usersRepository.save(user);
    return this.findById(saved.id);
  }

  async findAll(query: PaginationQueryDto): Promise<PaginatedResult<User>> {
    const where: FindOptionsWhere<User>[] | FindOptionsWhere<User> =
      query.search
        ? [
            { name: ILike(`%${query.search}%`) },
            { email: ILike(`%${query.search}%`) },
          ]
        : {};

    return paginate(
      this.usersRepository,
      { where, order: { createdAt: 'DESC' } },
      query.page,
      query.limit,
    );
  }

  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('User tidak ditemukan');
    }

    return user;
  }

  findByIdOrNull(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async findByEmail(email: string, withPassword = false): Promise<User | null> {
    const query = this.usersRepository
      .createQueryBuilder('user')
      .where('LOWER(user.email) = LOWER(:email)', { email: email.trim() });

    if (withPassword) {
      query.addSelect('user.password');
    }

    return query.getOne();
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);
    const email = dto.email?.trim().toLowerCase();

    if (email && email !== user.email) {
      const existing = await this.usersRepository.findOne({
        where: { email },
      });

      if (existing) {
        throw new ConflictException('Email sudah terdaftar');
      }

      user.email = email;
    }

    if (dto.name !== undefined) {
      user.name = dto.name;
    }

    if (dto.role !== undefined) {
      user.role = dto.role;
    }

    if (dto.password) {
      user.password = await hash(dto.password, 10);
    }

    await this.usersRepository.save(user);
    return this.findById(id);
  }

  async remove(id: string, actorId?: string) {
    if (id === actorId) {
      throw new BadRequestException('Tidak dapat menghapus akun sendiri');
    }

    const user = await this.findById(id);
    await this.usersRepository.remove(user);

    return { id, deleted: true };
  }
}
