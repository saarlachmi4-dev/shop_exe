import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToOne, OneToMany } from 'typeorm';
import { Cart } from './cart.entity.js';
import { Order } from './order.entity.js';

@Entity('users')
export class User { // <-- ודא שכתוב בדיוק export class User
  @PrimaryGeneratedColumn()
  id!: number; 

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column()
  name!: string;

  @Column({ type: 'enum', enum: ['user', 'admin'], default: 'user' })
  role!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @OneToOne(() => Cart, (cart) => cart.user)
  cart!: Cart;

  @OneToMany(() => Order, (order) => order.user)
  orders!: Order[];
}