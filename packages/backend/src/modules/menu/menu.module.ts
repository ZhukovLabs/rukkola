import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MenuController } from './menu.controller';
import { MenuService } from './menu.service';
import { Product, ProductSchema } from '../../schemas/product.schema';
import { Category, CategorySchema } from '../../schemas/category.schema';
import { Lunch, LunchSchema } from '../../schemas/lunch.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: Category.name, schema: CategorySchema },
      { name: Lunch.name, schema: LunchSchema },
    ]),
  ],
  controllers: [MenuController],
  providers: [MenuService],
})
export class MenuModule {}
