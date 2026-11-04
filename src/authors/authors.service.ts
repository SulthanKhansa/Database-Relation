import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import type { PaginationQueryDto } from '../common/dto/pagination-query.dto.js';
import type { PaginatedResult } from '../common/interfaces/paginated-result.interface.js';
import { paginate } from '../common/utils/paginate.js';
import type { CreateAuthorDto } from './dto/create-author.dto.js';
import type { UpdateAuthorDto } from './dto/update-author.dto.js';
import { Author } from './entities/author.entity.js';

@Injectable()
export class AuthorsService {
  constructor(
    @InjectRepository(Author)
    private readonly authorsRepository: Repository<Author>,
  ) {}

  create(dto: CreateAuthorDto): Promise<Author> {
    return this.authorsRepository.save(
      this.authorsRepository.create({ name: dto.name.trim() }),
    );
  }

  async findAll(query: PaginationQueryDto): Promise<PaginatedResult<Author>> {
    return paginate(
      this.authorsRepository,
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

  async findOne(id: string): Promise<Author> {
    const author = await this.authorsRepository.findOne({
      where: { id },
      relations: { bookAuthors: { book: true } },
    });

    if (!author) {
      throw new NotFoundException('Penulis tidak ditemukan');
    }

    return author;
  }

  async update(id: string, dto: UpdateAuthorDto): Promise<Author> {
    const author = await this.findOne(id);

    if (dto.name !== undefined) {
      author.name = dto.name.trim();
    }

    await this.authorsRepository.save(author);
    return this.findOne(id);
  }

  async remove(id: string) {
    const author = await this.findOne(id);
    await this.authorsRepository.remove(author);

    return { id, deleted: true };
  }
}
