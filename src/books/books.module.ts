import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Author } from '../authors/entities/author.entity.js';
import { BookAuthor } from '../book-authors/entities/book-author.entity.js';
import { Category } from '../categories/entities/category.entity.js';
import { Publisher } from '../publishers/entities/publisher.entity.js';
import { BooksController } from './books.controller.js';
import { BooksService } from './books.service.js';
import { Book } from './entities/book.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Book,
      Author,
      BookAuthor,
      Category,
      Publisher,
    ]),
  ],
  controllers: [BooksController],
  providers: [BooksService],
  exports: [BooksService],
})
export class BooksModule {}
