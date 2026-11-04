import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ILike,
  In,
  Repository,
  type FindOptionsWhere,
} from 'typeorm';
import { Author } from '../authors/entities/author.entity.js';
import { BookAuthor } from '../book-authors/entities/book-author.entity.js';
import { Category } from '../categories/entities/category.entity.js';
import type { PaginatedResult } from '../common/interfaces/paginated-result.interface.js';
import { paginate } from '../common/utils/paginate.js';
import { Publisher } from '../publishers/entities/publisher.entity.js';
import type { CreateBookDto } from './dto/create-book.dto.js';
import type { QueryBookDto } from './dto/query-book.dto.js';
import type { UpdateBookDto } from './dto/update-book.dto.js';
import { Book } from './entities/book.entity.js';

@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(Book)
    private readonly booksRepository: Repository<Book>,
    @InjectRepository(Author)
    private readonly authorsRepository: Repository<Author>,
    @InjectRepository(BookAuthor)
    private readonly bookAuthorsRepository: Repository<BookAuthor>,
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
    @InjectRepository(Publisher)
    private readonly publishersRepository: Repository<Publisher>,
  ) {}

  async create(dto: CreateBookDto): Promise<Book> {
    const isbn = dto.isbn.trim();
    await this.ensureIsbnAvailable(isbn);
    await this.ensureCategoryAndPublisher(dto.categoryId, dto.publisherId);

    const book = this.booksRepository.create({
      title: dto.title.trim(),
      isbn,
      publishedYear: dto.publishedYear ?? 0,
      isAvailable: dto.isAvailable ?? true,
      price: dto.price ?? 0,
      stock: dto.stock ?? 0,
      categoryId: dto.categoryId ?? null,
      publisherId: dto.publisherId ?? null,
    });

    const saved = await this.booksRepository.save(book);

    if (dto.authorIds?.length) {
      await this.replaceAuthors(saved.id, dto.authorIds);
    }

    return this.findOne(saved.id);
  }

  async findAll(query: QueryBookDto): Promise<PaginatedResult<Book>> {
    const base: FindOptionsWhere<Book> = {};

    if (query.categoryId) {
      base.categoryId = query.categoryId;
    }

    if (query.publisherId) {
      base.publisherId = query.publisherId;
    }

    if (query.isAvailable !== undefined) {
      base.isAvailable = query.isAvailable;
    }

    const where: FindOptionsWhere<Book>[] | FindOptionsWhere<Book> =
      query.search
        ? [
            { ...base, title: ILike(`%${query.search}%`) },
            { ...base, isbn: ILike(`%${query.search}%`) },
          ]
        : base;

    return paginate(
      this.booksRepository,
      {
        where,
        relations: {
          category: true,
          publisher: true,
          bookAuthors: { author: true },
        },
        order: { createdAt: 'DESC' },
      },
      query.page,
      query.limit,
    );
  }

  async findOne(id: string): Promise<Book> {
    const book = await this.booksRepository.findOne({
      where: { id },
      relations: {
        category: true,
        publisher: true,
        bookAuthors: { author: true },
      },
    });

    if (!book) {
      throw new NotFoundException('Buku tidak ditemukan');
    }

    return book;
  }

  async update(id: string, dto: UpdateBookDto): Promise<Book> {
    const book = await this.findOne(id);

    if (dto.isbn !== undefined && dto.isbn.trim() !== book.isbn) {
      const isbn = dto.isbn.trim();
      await this.ensureIsbnAvailable(isbn, id);
      book.isbn = isbn;
    }

    await this.ensureCategoryAndPublisher(dto.categoryId, dto.publisherId);

    if (dto.title !== undefined) {
      book.title = dto.title.trim();
    }

    if (dto.publishedYear !== undefined) {
      book.publishedYear = dto.publishedYear;
    }

    if (dto.isAvailable !== undefined) {
      book.isAvailable = dto.isAvailable;
    }

    if (dto.price !== undefined) {
      book.price = dto.price;
    }

    if (dto.stock !== undefined) {
      book.stock = dto.stock;
      book.isAvailable = dto.isAvailable ?? dto.stock > 0;
    }

    if (dto.categoryId !== undefined) {
      book.categoryId = dto.categoryId;
    }

    if (dto.publisherId !== undefined) {
      book.publisherId = dto.publisherId;
    }

    await this.booksRepository.save(book);

    if (dto.authorIds !== undefined) {
      await this.replaceAuthors(id, dto.authorIds);
    }

    return this.findOne(id);
  }

  async remove(id: string) {
    const result = await this.booksRepository.softDelete(id);

    if (!result.affected) {
      throw new NotFoundException('Buku tidak ditemukan');
    }

    return { id, deleted: true };
  }

  private async ensureIsbnAvailable(isbn: string, excludeId?: string) {
    const existing = await this.booksRepository.findOne({ where: { isbn } });

    if (existing && existing.id !== excludeId) {
      throw new ConflictException('ISBN sudah terdaftar');
    }
  }

  private async ensureCategoryAndPublisher(
    categoryId?: string,
    publisherId?: string,
  ) {
    if (categoryId) {
      const exists = await this.categoriesRepository.existsBy({
        id: categoryId,
      });

      if (!exists) {
        throw new NotFoundException('Kategori tidak ditemukan');
      }
    }

    if (publisherId) {
      const exists = await this.publishersRepository.existsBy({
        id: publisherId,
      });

      if (!exists) {
        throw new NotFoundException('Penerbit tidak ditemukan');
      }
    }
  }

  private async replaceAuthors(bookId: string, authorIds: string[]) {
    const uniqueAuthorIds = [...new Set(authorIds)];

    if (uniqueAuthorIds.length) {
      const total = await this.authorsRepository.countBy({
        id: In(uniqueAuthorIds),
      });

      if (total !== uniqueAuthorIds.length) {
        throw new NotFoundException('Sebagian penulis tidak ditemukan');
      }
    }

    await this.bookAuthorsRepository.delete({ bookId });

    if (uniqueAuthorIds.length) {
      await this.bookAuthorsRepository.insert(
        uniqueAuthorIds.map((authorId) => ({ bookId, authorId })),
      );
    }
  }
}
