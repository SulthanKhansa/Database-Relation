import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Author } from '../authors/entities/author.entity.js';
import { Book } from '../books/entities/book.entity.js';
import { BookAuthorsController } from './book-authors.controller.js';
import { BookAuthorsService } from './book-authors.service.js';
import { BookAuthor } from './entities/book-author.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([BookAuthor, Book, Author])],
  controllers: [BookAuthorsController],
  providers: [BookAuthorsService],
  exports: [BookAuthorsService],
})
export class BookAuthorsModule {}
