import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  type Relation,
} from 'typeorm';
import { Category } from '../../categories/entities/category.entity.js';
import { Publisher } from '../../publishers/entities/publisher.entity.js';
import { BookAuthor } from '../../book-authors/entities/book-author.entity.js';
import { OrderItem } from '../../order-items/entities/order-item.entity.js';
import { decimalTransformer } from '../../common/transformers/decimal.transformer.js';

/**
 * Catatan normalisasi:
 * Kolom `author` tidak disimpan di tabel books karena data penulis
 * dikelola melalui tabel authors + book_authors (many-to-many).
 */
@Entity({ name: 'books' })
export class Book {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 150 })
  title: string;

  @Column({ type: 'varchar', length: 45, unique: true })
  isbn: string;

  @Column({ type: 'int', default: 0 })
  publishedYear: number;

  @Column({ type: 'boolean', default: true })
  isAvailable: boolean;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
    transformer: decimalTransformer,
  })
  price: number;

  @Column({ type: 'int', default: 0 })
  stock: number;

  @Column({ name: 'category_id', type: 'uuid', nullable: true })
  categoryId: string | null;

  @Column({ name: 'publisher_id', type: 'uuid', nullable: true })
  publisherId: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date | null;

  @ManyToOne(() => Category, (category) => category.books, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'category_id' })
  category: Relation<Category> | null;

  @ManyToOne(() => Publisher, (publisher) => publisher.books, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'publisher_id' })
  publisher: Relation<Publisher> | null;

  @OneToMany(() => BookAuthor, (bookAuthor) => bookAuthor.book)
  bookAuthors: Relation<BookAuthor[]>;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.book)
  orderItems: Relation<OrderItem[]>;
}
