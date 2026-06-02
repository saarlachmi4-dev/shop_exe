import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartItem } from '../entities/cart-item.entity.js';
import { OrderItem } from '../entities/order-item.entity.js';
import { Order } from '../entities/order.entity.js';
import { Product } from '../entities/product.entity.js';
import { User } from '../entities/user.entity.js';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.getOrThrow<string>('DB_HOST'),
        port: Number(configService.getOrThrow<string>('DB_PORT')),
        username: configService.getOrThrow<string>('DB_USERNAME'),
        password: configService.getOrThrow<string>('DB_PASSWORD'),
        database: configService.getOrThrow<string>('DB_NAME'),
        entities: [User, Product, CartItem, Order, OrderItem],
        synchronize: true,
      }),
    }),
  ],
})
export class DatabaseModule {}

