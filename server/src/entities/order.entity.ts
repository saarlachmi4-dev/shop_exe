import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { OrderItem } from './order-item.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalPrice!: number;

  @Column({ type: 'enum', enum: ['בהכנה', 'בדרך', 'הגיעה'], default: 'בהכנה' })
  status!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @ManyToOne(() => User, (user) => user.orders, { onDelete: 'CASCADE' })
  user!: User;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items!: OrderItem[];
}