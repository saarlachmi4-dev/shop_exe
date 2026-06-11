import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { Product } from '../entities/product.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private orderRepository: Repository<Order>,
    @InjectRepository(Product) private productRepository: Repository<Product>,
  ) {}

  async createOrder(userId: number, itemsData: { productId: number; quantity: number }[]) {
    let totalPrice = 0;
    const orderItems: OrderItem[] = [];

    for (const item of itemsData) {
      const product = await this.productRepository.findOneBy({ id: item.productId });
      if (!product) throw new NotFoundException(`Product with id ${item.productId} was not found`);

      const itemPrice = Number(product.price) * item.quantity;
      totalPrice += itemPrice;

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

  async getUserOrders(userId: number) {
    return this.orderRepository.find({
      where: { user: { id: userId } },
      relations: ['items', 'items.product'],
      order: { createdAt: 'DESC' },
    });
  }

  async updateStatus(orderId: number, status: string) {
    const order = await this.orderRepository.findOneBy({ id: orderId });
    if (!order) throw new NotFoundException('Order not found');

    const allowedStatuses = ['בהכנה', 'בדרך', 'הגיעה'];
    if (!allowedStatuses.includes(status)) {
      throw new BadRequestException('Invalid order status');
    }

    order.status = status;
    return this.orderRepository.save(order);
  }

  async findAllOrders() {
    return this.orderRepository.find({
      relations: ['user', 'items', 'items.product'],
      order: { id: 'DESC' },
    });
  }
}
