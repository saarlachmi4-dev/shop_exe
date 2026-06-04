import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product } from '../entities/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product])], // רישום הישות עבור המודול הזה
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService], // אם מודולים אחרים (כמו עגלה) יצטרכו לבדוק מוצרים
})
export class ProductsModule {}