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

  async clearCart(userId: number) {
    // 1. מוצאים את העגלה של המשתמש יחד עם הפריטים שלה והמוצרים שלה
    const cart = await this.cartRepository.findOne({
      where: { user: { id: userId } },
      relations: ['items', 'items.product'],
    });

    if (!cart || !cart.items || cart.items.length === 0) {
      return { message: 'העגלה כבר ריקה' };
    }

    // 2. מחיקת כל הפריטים מתוך טבלת ה-CartItem
    // (בהנחה שיש לך קשר מסוג Cascade או שאתה מוחק ידנית דרך ה-cartItemRepository)
    await this.cartItemRepository.delete({ cart: { id: cart.id } });

    return { message: 'העגלה רוקנה בהצלחה והמלאי עודכן!' };
  }

  // עדכון כמות של פריט ספציפי מתוך העגלה (בזמן אמת)
    async updateItemQuantity(userId: number, cartItemId: number, newQuantity: number) {
    if (newQuantity <= 0) {
        throw new BadRequestException('הכמות חייבת להיות לפחות 1. בשביל להסיר, השתמש במחיקה.');
    }

    // 1. שליפת פריט העגלה יחד עם המוצר המשויך אליו
    const cartItem = await this.cartItemRepository.findOne({
        where: { id: cartItemId, cart: { user: { id: userId } } },
        relations: ['product', 'cart'],
    });

    if (!cartItem) {
        throw new NotFoundException('הפריט לא נמצא בעגלה של המשתמש');
    }

    const product = cartItem.product;
    // חישוב ההפרש: כמה המשתמש מוסיף או מוריד ביחס למה שכבר היה לו בעגלה
    const quantityDifference = newQuantity - cartItem.quantity;

    // 2. אם המשתמש מבקש להגדיל כמות, נבדוק שיש מספיק במלאי של המשתלה
    if (quantityDifference > 0 && product.stock < quantityDifference) {
        throw new BadRequestException(`אין מספיק מלאי. נותרו רק ${product.stock} יחידות זמינות`);
    }

    // 3. עדכון המלאי של המוצר בבסיס הנתונים (החזרה או גריעה)
    product.stock -= quantityDifference;
    await this.productRepository.save(product);

    // 4. עדכון הכמות בפריט העגלה
    cartItem.quantity = newQuantity;
    await this.cartItemRepository.save(cartItem);

    return this.getOrCreateCart(userId);
    }

    // הסרת פריט לחלוטין מהעגלה והחזרת המלאי שלו למשתלה
    async removeItemFromCart(userId: number, cartItemId: number) {
    const cartItem = await this.cartItemRepository.findOne({
        where: { id: cartItemId, cart: { user: { id: userId } } },
        relations: ['product'],
    });

    if (!cartItem) {
        throw new NotFoundException('הפריט לא נמצא בעגלה');
    }

    // החזרת המלאי של הפריט שנמחק חזרה למוצר
    const product = cartItem.product;
    product.stock += cartItem.quantity;
    await this.productRepository.save(product);

    // מחיקת הפריט מהעגלה
    await this.cartItemRepository.remove(cartItem);

    return this.getOrCreateCart(userId);
    }
}