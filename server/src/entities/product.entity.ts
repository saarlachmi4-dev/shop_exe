import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { OrderItem } from './order-item.entity.js'; // <-- ודא שהנתיב ל-OrderItem נכון

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column('text')
  description!: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price!: number;

  @Column()
  stock!: number;

  @Column()
  imageUrl!: string;

  @Column({ type: 'varchar', nullable: true, default: 'רב-עונתי' })
  season!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.product)
  orderItems!: OrderItem[];
}