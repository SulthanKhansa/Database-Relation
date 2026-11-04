import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, type FindOptionsWhere } from 'typeorm';
import { Author } from '../authors/entities/author.entity.js';
import type { PaginatedResult } from '../common/interfaces/paginated-result.interface.js';
import { paginate } from '../common/utils/paginate.js';
import { Book } from '../books/entities/book.entity.js';
import type { AssignBookAuthorDto } from './dto/assign-book-author.dto.js';
import type { QueryBookAuthorDto } from './dto/query-book-author.dto.js';
import { BookAuthor } from './entities/book-author.entity.js';

@Injectable()
export class BookAuthorsService {
  constructor(
    @InjectRepository(BookAuthor)
    private readonly bookAuthorsRepository: Repository<BookAuthor>,
    @InjectRepository(Book)
    private readonly booksRepository: Repository<Book>,
    @InjectRepository(Author)
    private readonly authorsRepository: Repository<Author>,
  ) {}

  async assign(dto: AssignBookAuthorDto): Promise<BookAuthor> {
    const [bookExists, authorExists] = await Promise.all([
      this.booksRepository.existsBy({ id: dto.bookId }),
      this.authorsRepository.existsBy({ id: dto.authorId }),
    ]);

    if (!bookExists) {
      throw new NotFoundException('Buku tidak ditemukan');
    }

    if (!authorExists) {
      throw new NotFoundException('Penulis tidak ditemukan');
    }

    const existing = await this.bookAuthorsRepository.findOneBy({
      bookId: dto.bookId,
      authorId: dto.authorId,
    });

    if (existing) {
      throw new ConflictException('Penulis sudah terhubung dengan buku ini');
    }

    const bookAuthor = this.bookAuthorsRepository.create(dto);
    await this.bookAuthorsRepository.save(bookAuthor);

    return this.findOne(dto.bookId, dto.authorId);
  }

  async findAll(
    query: QueryBookAuthorDto,
  ): Promise<PaginatedResult<BookAuthor>> {
    const where: FindOptionsWhere<BookAuthor> = {};

    if (query.bookId) {
      where.bookId = query.bookId;
    }

    if (query.authorId) {
      where.authorId = query.authorId;
    }

    return paginate(
      this.bookAuthorsRepository,
      {
        where,
        relations: { book: true, author: true },
        order: { createdAt: 'DESC' },
      },
      query.page,
      query.limit,
    );
  }

  async findOne(bookId: string, authorId: string): Promise<BookAuthor> {
    const bookAuthor = await this.bookAuthorsRepository.findOne({
      where: { bookId, authorId },
      relations: { book: true, author: true },
    });

    if (!bookAuthor) {
      throw new NotFoundException('Relasi buku dan penulis tidak ditemukan');
    }

    return bookAuthor;
  }

  async remove(bookId: string, authorId: string) {
    const bookAuthor = await this.findOne(bookId, authorId);
    await this.bookAuthorsRepository.remove(bookAuthor);

    return { bookId, authorId, deleted: true };
  }
}
