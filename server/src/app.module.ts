import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { ProductsModule } from './products/products.module';
import { CartsModule } from './carts/carts.module'; // <-- ודא שהאימפורט הזה קיים

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    ProductsModule,
    CartsModule, // <-- ודא שהמודול רשום כאן!
  ],
})
export class AppModule {}