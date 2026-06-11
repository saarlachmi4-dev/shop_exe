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
}
