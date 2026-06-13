import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { ProductsModule } from './products/products.module';
import { CartsModule } from './carts/carts.module';
import { AuthModule } from './auth/auth.module';
import { OrdersModule } from './orders/orders.module'; 

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    ProductsModule,
    CartsModule, 
    AuthModule,
    OrdersModule, 
  ],
})
export class AppModule {}