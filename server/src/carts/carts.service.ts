import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from '../entities/cart.entity';
import { CartItem } from '../entities/cart-item.entity';
import { Product } from '../entities/product.entity';
import { AddToCartDto } from './dto/add-to-cart.dto';

@Injectable()
export class CartsService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  // פונקציית עזר למציאת או יצירת עגלה למשתמש
  async getOrCreateCart(userId: number): Promise<Cart> {
    let cart = await this.cartRepository.findOne({
      where: { user: { id: userId } },
      relations: ['items', 'items.product'],
    });

    if (!cart) {
      cart = this.cartRepository.create({ user: { id: userId }, items: [] });
      await this.cartRepository.save(cart);
    }
    return cart;
  }

  // הוספת מוצר לעגלה
  async addToCart(userId: number, addToCartDto: AddToCartDto) {
  const { productId, quantity } = addToCartDto;

  if (quantity <= 0) {
    throw new BadRequestException('הכמות חייבת להיות גדולה מ-0');
  }

  // 1. בדיקה שהמוצר קיים ויש מספיק במלאי
  const product = await this.productRepository.findOneBy({ id: productId });
  if (!product) {
    throw new NotFoundException('המוצר לא נמצא');
  }
  if (product.stock < quantity) {
    throw new BadRequestException(`אין מספיק מלאי. נותרו רק ${product.stock} יחידות`);
  }

  // 2. עדכון המלאי של המוצר בזמן אמת!
  product.stock -= quantity;
  await this.productRepository.save(product); // שמירת המלאי החדש ב-Database

  // 3. שליפת העגלה של המשתמש
  const cart = await this.getOrCreateCart(userId);

  // 4. בדיקה אם המוצר כבר נמצא בעגלה הזו
  let cartItem = cart.items.find(item => item.product.id === productId);

  if (cartItem) {
    // אם הוא כבר בעגלה - נוסיף לכמות שלו בעגלה
    cartItem.quantity += quantity;
  } else {
    // אם הוא לא בעגלה - ניצור שורה חדשה
    cartItem = this.cartItemRepository.create({
      cart,
      product,
      quantity,
    });
  }

  // 5. שמירת הפריט בעגלה
  await this.cartItemRepository.save(cartItem);

  // נחזיר את העגלה המעודכנת
  return this.getOrCreateCart(userId);
}

  // שליפת העגלה הנוכחית של המשתמש
  async getCart(userId: number) {
    return this.getOrCreateCart(userId);
  }
}