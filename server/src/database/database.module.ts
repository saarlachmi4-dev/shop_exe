import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

// ייבוא כל הישויות שלך
import { User } from '../entities/user.entity.js';
import { Product } from '../entities/product.entity.js';
import { Cart } from '../entities/cart.entity.js';
import { CartItem } from '../entities/cart-item.entity.js';
import { Order } from '../entities/order.entity.js';
import { OrderItem } from '../entities/order-item.entity.js';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.getOrThrow<string>('DB_HOST'),
        port: configService.getOrThrow<number>('DB_PORT'),
        username: configService.getOrThrow<string>('DB_USERNAME'),
        password: configService.getOrThrow<string>('DB_PASSWORD'),
        database: configService.getOrThrow<string>('DB_NAME'),
        
        // כאן הבעיה! ודא שכל הישויות נמצאות בתוך המערך הזה:
        entities: [User, Product, Cart, CartItem, Order, OrderItem],
        
        synchronize: true, // זמנית לפיתוח
      }),
    }),
  ],
})
export class DatabaseModule {}