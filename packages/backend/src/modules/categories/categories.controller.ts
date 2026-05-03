import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('categories')
@UseGuards(JwtAuthGuard)
export class CategoriesController {
  constructor(private categoriesService: CategoriesService) {}

  @Get()
  async getAll() {
    const categories = await this.categoriesService.getAllCategories();
    return {
      success: true,
      message: 'Категории получены',
      data: categories,
    };
  }

  @Post()
  async create(
    @Body()
    body: {
      name: string;
      parentId?: string | null;
      isMenuItem?: boolean;
      showGroupTitle?: boolean;
    },
    @CurrentUser() user: { id: string },
  ) {
    const result = await this.categoriesService.createCategory(body, user.id);
    return {
      success: true,
      message: 'Категория создана',
      data: result,
    };
  }

  @Patch('reorder')
  async reorder(
    @Body() body: { updates: { id: string; order: number }[] },
    @CurrentUser() user: { id: string },
  ) {
    const result = await this.categoriesService.reorderCategories(body.updates, user.id);
    return {
      success: true,
      message: 'Порядок категорий обновлен',
      data: result,
    };
  }

  @Patch(':id/name')
  async updateName(
    @Param('id') id: string,
    @Body() body: { name: string },
    @CurrentUser() user: { id: string },
  ) {
    const result = await this.categoriesService.updateCategoryName(id, body.name, user.id);
    return {
      success: true,
      message: 'Название обновлено',
      data: result,
    };
  }

  @Patch(':id/toggle')
  async toggleField(
    @Param('id') id: string,
    @Body() body: { field: 'isMenuItem' | 'showGroupTitle' },
    @CurrentUser() user: { id: string },
  ) {
    const result = await this.categoriesService.toggleCategoryField(id, body.field, user.id);
    return {
      success: true,
      message: 'Категория обновлена',
      data: result,
    };
  }

  @Patch(':id/move')
  async move(
    @Param('id') id: string,
    @Body() body: { direction: 'up' | 'down' },
    @CurrentUser() user: { id: string },
  ) {
    const result = await this.categoriesService.moveCategory(id, body.direction, user.id);
    return {
      success: true,
      message: 'Категория перемещена',
      data: result,
    };
  }

  @Patch(':id/move-to-position')
  async moveToPosition(
    @Param('id') id: string,
    @Body() body: { newPosition: number },
    @CurrentUser() user: { id: string },
  ) {
    const result = await this.categoriesService.moveCategoryToPosition(
      id,
      body.newPosition,
      user.id,
    );
    return {
      success: true,
      message: 'Позиция категории обновлена',
      data: result,
    };
  }

  @Patch(':id/mark-alcohol')
  async markAlcohol(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ) {
    const result = await this.categoriesService.markCategoryProductsAlcohol(id, user.id);
    return {
      success: true,
      message: `Продукты обновлены: ${result.updatedCount} продуктов помечено как алкогольные`,
      data: result,
    };
  }

  @Patch(':id/mark-non-alcohol')
  async markNonAlcohol(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ) {
    const result = await this.categoriesService.markCategoryProductsNonAlcohol(id, user.id);
    return {
      success: true,
      message: `Продукты обновлены: ${result.updatedCount} продуктов помечено как безалкогольные`,
      data: result,
    };
  }

  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ) {
    const result = await this.categoriesService.deleteCategory(id, user.id);
    return {
      success: true,
      message: 'Категория удалена',
      data: result,
    };
  }
}
