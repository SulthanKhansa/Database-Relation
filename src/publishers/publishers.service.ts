import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import type { PaginationQueryDto } from '../common/dto/pagination-query.dto.js';
import type { PaginatedResult } from '../common/interfaces/paginated-result.interface.js';
import { paginate } from '../common/utils/paginate.js';
import type { CreatePublisherDto } from './dto/create-publisher.dto.js';
import type { UpdatePublisherDto } from './dto/update-publisher.dto.js';
import { Publisher } from './entities/publisher.entity.js';

@Injectable()
export class PublishersService {
  constructor(
    @InjectRepository(Publisher)
    private readonly publishersRepository: Repository<Publisher>,
  ) {}

  create(dto: CreatePublisherDto): Promise<Publisher> {
    return this.publishersRepository.save(
      this.publishersRepository.create({ name: dto.name.trim() }),
    );
  }

  async findAll(
    query: PaginationQueryDto,
  ): Promise<PaginatedResult<Publisher>> {
    return paginate(
      this.publishersRepository,
      {
        where: query.search
          ? { name: ILike(`%${query.search}%`) }
          : {},
        order: { name: 'ASC' },
      },
      query.page,
      query.limit,
    );
  }

  async findOne(id: string): Promise<Publisher> {
    const publisher = await this.publishersRepository.findOne({
      where: { id },
      relations: { books: true },
    });

    if (!publisher) {
      throw new NotFoundException('Penerbit tidak ditemukan');
    }

    return publisher;
  }

  async update(id: string, dto: UpdatePublisherDto): Promise<Publisher> {
    const publisher = await this.findOne(id);

    if (dto.name !== undefined) {
      publisher.name = dto.name.trim();
    }

    await this.publishersRepository.save(publisher);
    return this.findOne(id);
  }

  async remove(id: string) {
    const publisher = await this.findOne(id);
    await this.publishersRepository.remove(publisher);

    return { id, deleted: true };
  }
}
