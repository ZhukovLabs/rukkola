import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Res,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getProducts(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('category') category?: string,
  ) {
    const result = await this.productsService.getProducts(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 10,
      search,
      category,
    );
    return {
      success: true,
      message: 'Список товаров получен',
      data: result,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('categories')
  async getCategories() {
    const categories = await this.productsService.getCategories();
    return {
      success: true,
      message: 'Категории получены',
      data: categories,
    };
  }

  // Public image serving - no auth required
  @Get('image/:filename')
  async serveImage(
    @Param('filename') filename: string,
    @Query('w') width: string | undefined,
    @Res() res: Response,
  ) {
    try {
      const parsedWidth = width ? parseInt(width, 10) : undefined;
      if (width && isNaN(parsedWidth as number)) {
        return res.status(400).json({ success: false, message: 'Некорректная ширина' });
      }

      const result = await this.productsService.serveImage(filename, parsedWidth);
      res.set({
        'Content-Type': result.contentType,
        'Cache-Control': 'public, max-age=3600, must-revalidate',
      });
      return res.send(result.buffer);
    } catch (error) {
      const status = error instanceof NotFoundException ? 404 : 500;
      const message = error instanceof Error ? error.message : 'Ошибка сервера';
      if (!res.headersSent) {
        return res.status(status).json({ success: false, message });
      }
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getProductById(@Param('id') id: string) {
    const product = await this.productsService.getProductById(id);
    return {
      success: true,
      message: 'Товар найден',
      data: product,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async createProduct(@Body() data: CreateProductDto) {
    const result = await this.productsService.createProduct(data);
    return {
      success: true,
      message: 'Товар создан',
      data: result,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Patch('reorder')
  async reorderProducts(
    @Body() body: { updates: Array<{ id: string; order: number }> },
  ) {
    const result = await this.productsService.reorderProducts(body.updates);
    return {
      success: true,
      message: 'Порядок товаров обновлён',
      data: result,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Patch('swap')
  async swapProducts(
    @Body() body: { orderedIds: string[]; pageOffset: number },
  ) {
    const result = await this.productsService.swapProducts(
      body.orderedIds,
      body.pageOffset,
    );
    return {
      success: true,
      message: 'Порядок обновлён',
      data: result,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/visibility')
  async toggleVisibility(@Param('id') id: string) {
    const result = await this.productsService.toggleVisibility(id);
    return {
      success: true,
      message: result.hidden ? 'Товар скрыт' : 'Товар отображается',
      data: result,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/alcohol')
  async toggleAlcohol(@Param('id') id: string) {
    const result = await this.productsService.toggleAlcohol(id);
    return {
      success: true,
      message: result.isAlcohol
        ? 'Товар помечен как алкогольный'
        : 'Товар помечен как безалкогольный',
      data: result,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/move')
  async moveToPosition(
    @Param('id') id: string,
    @Body() body: { newPosition: number; search?: string; category?: string },
  ) {
    const result = await this.productsService.moveToPosition(
      id,
      body.newPosition,
      body.search,
      body.category,
    );
    return {
      success: true,
      message: 'Позиция товара обновлена',
      data: result,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async updateProduct(
    @Param('id') id: string,
    @Body() data: UpdateProductDto,
  ) {
    const result = await this.productsService.updateProduct(id, data);
    return {
      success: true,
      message: 'Товар обновлён',
      data: result,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteProduct(@Param('id') id: string) {
    const result = await this.productsService.deleteProduct(id);
    return {
      success: true,
      message: 'Товар удалён',
      data: result,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const result = await this.productsService.uploadImage(id, file);
    return {
      success: true,
      message: 'Изображение загружено',
      data: result,
    };
  }
}
