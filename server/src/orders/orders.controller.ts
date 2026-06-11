import { Body, Controller, Get, Headers, Param, Patch, Post, Put, UnauthorizedException, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly jwtService: JwtService,
  ) {}

  @Post()
  async create(@Headers('authorization') authHeader: string, @Body() body: { items: { productId: number; quantity: number }[] }) {
    const userId = this.extractUserId(authHeader);
    return this.ordersService.createOrder(userId, body.items);
  }

  @Get('my-orders')
  async getMyOrders(@Headers('authorization') authHeader: string) {
    const userId = this.extractUserId(authHeader);
    return this.ordersService.getUserOrders(userId);
  }

  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  getAllOrdersForAdmin() {
    return this.ordersService.findAllOrders();
  }

  @Patch('admin/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  updateStatusForAdmin(@Param('id') id: string, @Body() body: { status: string }) {
    return this.ordersService.updateStatus(Number(id), body.status);
  }

  @Put(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  updateStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.ordersService.updateStatus(Number(id), body.status);
  }

  private extractUserId(authHeader: string): number {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing authentication token');
    }
    try {
      const token = authHeader.split(' ')[1];
      const decoded = this.jwtService.verify(token, { secret: 'SUPER_SECRET_KEY_123' });
      return decoded.sub;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
