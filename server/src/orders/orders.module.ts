import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { JwtModule } from '@nestjs/jwt';
import { Order } from '../entities/order.entity'; 
import { OrderItem } from '../entities/order-item.entity'; 
import { Product } from '../entities/product.entity'; 

@Module({
  imports: [
    // 2. השורה הקריטית ביותר: רישום ה-Repositories עבור המודול הנוכחי
    TypeOrmModule.forFeature([Order, OrderItem, Product]), 
    
    // רישום ה-JwtModule כדי שה-JwtService בקונטרולר יעבוד
    JwtModule.register({ 
      secret: 'SUPER_SECRET_KEY_123' 
    }),
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService], // אופציונלי, במידה ומודולים אחרים יצטרכו אותו בעתיד
})
export class OrdersModule {}