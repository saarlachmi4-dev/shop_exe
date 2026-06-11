import { Controller, Post, Get, Put, Body, Headers, Param, UnauthorizedException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtService } from '@nestjs/jwt';

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly jwtService: JwtService,
  ) {}

  // אנדפוינט ליצירת הזמנה
  @Post()
  async create(@Headers('authorization') authHeader: string, @Body() body: { items: { productId: number; quantity: number }[] }) {
    const userId = this.extractUserId(authHeader);
    return this.ordersService.createOrder(userId, body.items);
  }

  // אנדפוינט למשיכת ההיסטוריה של המשתמש המחובר
  @Get('my-orders')
  async getMyOrders(@Headers('authorization') authHeader: string) {
    const userId = this.extractUserId(authHeader);
    return this.ordersService.getUserOrders(userId);
  }

  // אנדפוינט לעדכון סטטוס (למשל: orders/5/status)
  @Put(':id/status')
  async updateStatus(@Param('id') id: number, @Body() body: { status: 'בהכנה' | 'בדרך' | 'הגיעה' }) {
    return this.ordersService.updateStatus(id, body.status);
  }

  private extractUserId(authHeader: string): number {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('חסר טוקן אימות');
    }
    try {
      const token = authHeader.split(' ')[1];
      const decoded = this.jwtService.verify(token, { secret: 'SUPER_SECRET_KEY_123' });
      return decoded.sub;
    } catch {
      throw new UnauthorizedException('טוקן לא תקין');
    }
  }
}