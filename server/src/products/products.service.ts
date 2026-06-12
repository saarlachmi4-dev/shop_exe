import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../entities/product.entity.js';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async findAll() {
    return this.productRepository.find({
      where: { isActive: true },
      order: { id: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Product | null> {
    return this.productRepository.findOne({ where: { id, isActive: true } });
  }

  async create(createProductDto: any, file?: any) {
    const price = Number(createProductDto.price);
    const stock = Number(createProductDto.stock);

    if (!createProductDto.name || Number.isNaN(price) || Number.isNaN(stock)) {
      throw new BadRequestException('Missing or invalid product details');
    }

    const product = this.productRepository.create({
      name: createProductDto.name,
      description: createProductDto.description || '',
      price,
      stock,
      season: createProductDto.season || 'רב-עונתי',
      imageUrl: this.resolveImageUrl(file, createProductDto.imageUrl),
      isActive: true,
    });

    return this.productRepository.save(product);
  }

  async delete(id: number) {
    const product = await this.productRepository.findOneBy({ id });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    product.isActive = false;
    product.stock = 0;
    await this.productRepository.save(product);

    return { message: 'Product removed from catalog' };
  }

  private resolveImageUrl(file?: any, imageUrl?: string) {
    if (file?.buffer && file?.mimetype) {
      return `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
    }

    return imageUrl || 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=800&q=80';
  }

  async update(id: number, updateProductDto: any, file?: any) {
    // 1. מציאת המוצר הקיים
    const product = await this.productRepository.findOneBy({ id, isActive: true });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // 2. המרת מחיר ומלאי במידה ונשלחו
    const price = updateProductDto.price !== undefined ? Number(updateProductDto.price) : product.price;
    const stock = updateProductDto.stock !== undefined ? Number(updateProductDto.stock) : product.stock;

    if (Number.isNaN(price) || Number.isNaN(stock)) {
      throw new BadRequestException('Invalid price or stock values');
    }

    // 3. הגנת תמונה: אם הועלה קובץ חדש או נשלח קישור ישיר (imageUrl או image מה-React)
    // אם לא נשלח כלום, נשמור על ה-imageUrl הקיים בבסיס הנתונים
    let finalImageUrl = product.imageUrl;
    
    // בודק אם ה-React שלח כתובת קיימת במפתח image או imageUrl
    const incomingUrl = updateProductDto.image || updateProductDto.imageUrl;

    if (file) {
      finalImageUrl = this.resolveImageUrl(file);
    } else if (incomingUrl) {
      finalImageUrl = incomingUrl;
    }

    // 4. עדכון השדות בפועל
    product.name = updateProductDto.name || product.name;
    product.description = updateProductDto.description !== undefined ? updateProductDto.description : product.description;
    product.price = price;
    product.stock = stock;
    product.season = updateProductDto.season || product.season;
    product.imageUrl = finalImageUrl;

    // 5. שמירה בבסיס הנתונים
    return this.productRepository.save(product);
  }
}
