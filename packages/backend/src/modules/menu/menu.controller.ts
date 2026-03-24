import { Controller, Get, Param, Query } from '@nestjs/common';
import { MenuService } from './menu.service';

@Controller('menu')
export class MenuController {
  constructor(private menuService: MenuService) {}

  @Get()
  async getMenuData(@Query('showAlcohol') showAlcohol?: string) {
    const withAlcohol = showAlcohol === 'true';
    const data = await this.menuService.getMenuData(withAlcohol);
    return {
      success: true,
      message: 'OK',
      data,
    };
  }

  @Get('products')
  async getProducts(@Query('showAlcohol') showAlcohol?: string) {
    const withAlcohol = showAlcohol === 'true';
    const data = await this.menuService.getGroupedProductsData(withAlcohol);
    return {
      success: true,
      message: 'OK',
      data,
    };
  }

  @Get('product/:id')
  async getProductById(@Param('id') id: string) {
    const product = await this.menuService.getProductByIdPublic(id);
    return {
      success: true,
      message: 'OK',
      data: product,
    };
  }
}
