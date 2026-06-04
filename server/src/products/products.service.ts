import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../entities/product.entity';

@Injectable()
export class ProductsService {
  // הזרקת ה-Repository של ישות המוצר
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  // שליפת כל המוצרים (השתילים) ממסד הנתונים
  async findAll(): Promise<Product[]> {
    return await this.productRepository.find();
  }

  // שירות עזר (אופציונלי) למציאת שתיל ספציפי לפי מזהה
  async findOne(id: number): Promise<Product | null> {
    return await this.productRepository.findOneBy({ id });
  }
}