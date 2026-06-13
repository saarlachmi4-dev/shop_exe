// products.controller.ts

import { Body, Controller, Delete, Get, Param, Post, Put, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(FileInterceptor('image'))
  createProduct(@Body() createProductDto: any, @UploadedFile() file?: any) {
    return this.productsService.create(createProductDto, file);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(FileInterceptor('image'))
  updateProduct(
    @Param('id') id: string, 
    @Body() updateProductDto: any,
    @UploadedFile() file?: any
  ) {
    return this.productsService.update(Number(id), updateProductDto, file);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  deleteProduct(@Param('id') id: string) {
    return this.productsService.delete(Number(id));
  }
}