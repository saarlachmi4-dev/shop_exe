import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { CartsService } from './carts.service';
import { AddToCartDto } from './dto/add-to-cart.dto';

@Controller('cart')
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  // זמנית אנחנו שולחים userId = 1 קבוע בקוד, עד שנחבר את מערכת ה-Auth
  private readonly TEMP_USER_ID = 1;

  @Get()
  getCart() {
    return this.cartsService.getCart(this.TEMP_USER_ID);
  }

  @Post('add')
  addToCart(@Body() addToCartDto: AddToCartDto) {
    return this.cartsService.addToCart(this.TEMP_USER_ID, addToCartDto);
  }

  @Patch('item/:id')
  updateItem(
    @Param('id', ParseIntPipe) cartItemId: number,
    @Body('quantity') quantity: number,
  ) {
    return this.cartsService.updateItemQuantity(this.TEMP_USER_ID, cartItemId, quantity);
  }

  @Delete('item/:id')
  removeItem(@Param('id', ParseIntPipe) cartItemId: number) {
    return this.cartsService.removeItemFromCart(this.TEMP_USER_ID, cartItemId);
  }
}