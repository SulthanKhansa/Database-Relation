import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  type Relation,
} from 'typeorm';
import { Book } from '../../books/entities/book.entity.js';
import { Author } from '../../authors/entities/author.entity.js';

/**
 * Tabel pivot many-to-many books <-> authors.
 * Primary key gabungan: (book_id, author_id).
 */
@Entity({ name: 'book_authors' })
export class BookAuthor {
  @PrimaryColumn({ name: 'book_id', type: 'uuid' })
  bookId: string;

  @PrimaryColumn({ name: 'author_id', type: 'uuid' })
  authorId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Book, (book) => book.bookAuthors, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'book_id' })
  book: Relation<Book>;

  @ManyToOne(() => Author, (author) => author.bookAuthors, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'author_id' })
  author: Relation<Author>;
}
