import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Cart } from './cart.entity.js'; // <-- השורה הזו כנראה חסרה לך!
import { Product } from './product.entity.js';

@Entity('cart_items')
export class CartItem {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Cart, (cart) => cart.items, { onDelete: 'CASCADE' })
  cart!: Cart;

  @ManyToOne(() => Product)
  product!: Product;

  @Column()
  quantity!: number;
}