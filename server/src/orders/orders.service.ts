import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { User } from '../entities/user.entity';
import { Product } from '../entities/product.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private orderRepository: Repository<Order>,
    @InjectRepository(Product) private productRepository: Repository<Product>,
  ) {}

  // 1. יצירת הזמנה חדשה
  async createOrder(userId: number, itemsData: { productId: number; quantity: number }[]) {
    let totalPrice = 0;
    const orderItems: OrderItem[] = [];

    for (const item of itemsData) {
      const product = await this.productRepository.findOneBy({ id: item.productId });
      if (!product) throw new NotFoundException(`מוצר עם מזהה ${item.productId} לא נמצא`);
      
      // חישוב מחיר
      const itemPrice = Number(product.price) * item.quantity;
      totalPrice += itemPrice;

      // יצירת פריט הזמנה
      const orderItem = new OrderItem();
      orderItem.product = product;
      orderItem.quantity = item.quantity;
      orderItem.priceAtOrder = Number(product.price);
      orderItems.push(orderItem);
    }

    const order = new Order();
    order.user = { id: userId } as User;
    order.totalPrice = totalPrice;
    order.items = orderItems;
    order.status = 'בהכנה';

    return this.orderRepository.save(order);
  }

  // 2. משיכת כל ההזמנות של משתמש ספציפי (כולל הפריטים שלהן)
  async getUserOrders(userId: number) {
    return this.orderRepository.find({
      where: { user: { id: userId } },
      relations: ['items'],
      order: { createdAt: 'DESC' }, // החדש ביותר למעלה
    });
  }

  // 3. עדכון סטטוס הזמנה (לשימוש עתידי או למנהל מערכת)
  async updateStatus(orderId: number, status: 'בהכנה' | 'בדרך' | 'הגיעה') {
    const order = await this.orderRepository.findOneBy({ id: orderId });
    if (!order) throw new NotFoundException('ההזמנה לא נמצאה');
    
    order.status = status;
    return this.orderRepository.save(order);
  }
}