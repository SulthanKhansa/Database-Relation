import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import type { PaginationQueryDto } from '../common/dto/pagination-query.dto.js';
import type { PaginatedResult } from '../common/interfaces/paginated-result.interface.js';
import { paginate } from '../common/utils/paginate.js';
import type { CreateCategoryDto } from './dto/create-category.dto.js';
import type { UpdateCategoryDto } from './dto/update-category.dto.js';
import { Category } from './entities/category.entity.js';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
  ) {}

  async create(dto: CreateCategoryDto): Promise<Category> {
    const name = dto.name.trim();
    const existing = await this.categoriesRepository.findOne({
      where: { name: ILike(name) },
    });

    if (existing) {
      throw new ConflictException('Nama kategori sudah digunakan');
    }

    return this.categoriesRepository.save(
      this.categoriesRepository.create({ name }),
    );
  }

  async findAll(
    query: PaginationQueryDto,
  ): Promise<PaginatedResult<Category>> {
    return paginate(
      this.categoriesRepository,
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

  async findOne(id: string): Promise<Category> {
    const category = await this.categoriesRepository.findOne({
      where: { id },
      relations: { books: true },
    });

    if (!category) {
      throw new NotFoundException('Kategori tidak ditemukan');
    }

    return category;
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findOne(id);

    if (dto.name !== undefined) {
      const name = dto.name.trim();
      const existing = await this.categoriesRepository.findOne({
        where: { name: ILike(name) },
      });

      if (existing && existing.id !== id) {
        throw new ConflictException('Nama kategori sudah digunakan');
      }

      category.name = name;
    }

    await this.categoriesRepository.save(category);
    return this.findOne(id);
  }

  async remove(id: string) {
    const category = await this.findOne(id);
    await this.categoriesRepository.remove(category);

    return { id, deleted: true };
  }
}
