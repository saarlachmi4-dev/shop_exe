import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../entities/product.entity.js';

@Injectable()
export class ProductsService {
  // הזרקת ה-Repository של ישות המוצר
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  // שליפת כל המוצרים (השתילים) ממסד הנתונים
  async findAll() {
    return this.productRepository.find({
      order: {
        id: 'ASC', // ASC אומר מיון עולה - מה-ID הנמוך לגבוה
      },
    });
  }

  // שירות עזר (אופציונלי) למציאת שתיל ספציפי לפי מזהה
  async findOne(id: number): Promise<Product | null> {
    return await this.productRepository.findOneBy({ id });
  }
}