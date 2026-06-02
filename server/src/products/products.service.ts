import { Injectable } from '@nestjs/common';
import { Product } from './product.js';

@Injectable()
export class ProductsService {
  private readonly products: Product[] = [
    {
      id: 1,
      name: 'Everyday Backpack',
      description: 'A practical backpack with room for a laptop, charger, and daily essentials.',
      price: 189,
      stock: 12,
      imageUrl:
        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80',
    },
    {
      id: 2,
      name: 'Wireless Headphones',
      description: 'Comfortable over-ear headphones with clean sound and long battery life.',
      price: 329,
      stock: 8,
      imageUrl:
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80',
    },
    {
      id: 3,
      name: 'Desk Lamp',
      description: 'Minimal LED desk lamp with adjustable brightness for focused work.',
      price: 119,
      stock: 18,
      imageUrl:
        'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=80',
    },
  ];

  findAll() {
    return this.products;
  }
}

