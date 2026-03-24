import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Category } from '../../schemas/category.schema';
import { Product } from '../../schemas/product.schema';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    @InjectModel(Product.name) private productModel: Model<Product>,
  ) {}

  async getAllCategories() {
    return this.categoryModel.find().sort({ order: 1 }).lean();
  }

  async createCategory(data: {
    name: string;
    parentId?: string | null;
    isMenuItem?: boolean;
    showGroupTitle?: boolean;
  }) {
    const parent = data.parentId ? data.parentId : null;

    const top = await this.categoryModel
      .find()
      .sort({ order: -1 })
      .limit(1)
      .lean();
    const nextOrder = top && top.length ? top[0].order + 1 : 1;

    const cat = new this.categoryModel({
      name: data.name,
      parent,
      order: nextOrder,
      isMenuItem: data.isMenuItem ?? false,
      showGroupTitle: data.showGroupTitle ?? false,
    });

    await cat.save();

    return { id: cat._id.toString() };
  }

  async updateCategoryName(id: string, name: string) {
    const category = await this.categoryModel.findById(id);
    if (!category) throw new NotFoundException('Категория не найдена');

    category.name = name;
    await category.save();

    return { success: true };
  }

  async deleteCategory(id: string) {
    const deleteRecursive = async (categoryId: string) => {
      const children = await this.categoryModel.find({ parent: categoryId });
      for (const child of children) {
        await deleteRecursive(child._id.toString());
      }
      await this.categoryModel.findByIdAndDelete(categoryId);
    };

    await deleteRecursive(id);

    return { success: true };
  }

  async toggleCategoryField(id: string, field: 'isMenuItem' | 'showGroupTitle') {
    const category = await this.categoryModel.findById(id);
    if (!category) throw new NotFoundException('Категория не найдена');

    (category as any)[field] = !(category as any)[field];
    await category.save();

    return { success: true };
  }

  async moveCategory(id: string, direction: 'up' | 'down') {
    const current = await this.categoryModel.findById(id);
    if (!current) throw new NotFoundException('Категория не найдена');

    const siblings = await this.categoryModel
      .find({ parent: current.parent })
      .sort({ order: 1 })
      .lean();

    const index = siblings.findIndex(
      (c) => c._id.toString() === current._id.toString(),
    );
    const swapIndex = direction === 'up' ? index - 1 : index + 1;

    if (swapIndex < 0 || swapIndex >= siblings.length) {
      throw new BadRequestException('Невозможно переместить');
    }

    const target = siblings[swapIndex];

    const temp = current.order;
    await this.categoryModel.updateOne(
      { _id: current._id },
      { $set: { order: -1 } },
    );
    await this.categoryModel.updateOne(
      { _id: target._id },
      { $set: { order: temp } },
    );
    await this.categoryModel.updateOne(
      { _id: current._id },
      { $set: { order: target.order } },
    );

    await this.adjustChildrenOrders(
      current._id.toString(),
      temp,
      direction,
    );

    return { success: true };
  }

  private async adjustChildrenOrders(
    parentId: string,
    baseOrder: number,
    direction: 'up' | 'down',
  ) {
    const children = await this.categoryModel
      .find({ parent: parentId })
      .sort({ order: 1 })
      .lean();
    if (!children.length) return;

    const shift = direction === 'up' ? -0.001 : 0.001;

    for (const [i, child] of children.entries()) {
      await this.categoryModel.updateOne(
        { _id: child._id },
        { $set: { order: baseOrder + (i + 1) * shift } },
      );
      await this.adjustChildrenOrders(
        child._id.toString(),
        baseOrder + (i + 1) * shift,
        direction,
      );
    }
  }

  async moveCategoryToPosition(categoryId: string, newPosition: number) {
    const category = await this.categoryModel.findById(categoryId).lean();
    if (!category) throw new NotFoundException('Категория не найдена');

    const parentId = category.parent?.toString() || null;

    const filter = parentId
      ? { parent: parentId }
      : { $or: [{ parent: null }, { parent: { $exists: false } }] };

    const siblings = await this.categoryModel
      .find(filter)
      .sort({ order: 1 })
      .select('_id')
      .lean();

    const siblingIds = siblings.map((s) => s._id.toString());
    const currentIndex = siblingIds.indexOf(categoryId);

    if (currentIndex === -1) {
      throw new NotFoundException('Категория не найдена в списке');
    }

    if (newPosition < 0 || newPosition >= siblingIds.length) {
      throw new BadRequestException('Некорректная позиция');
    }

    if (currentIndex === newPosition) {
      return { success: true };
    }

    const newOrder = [...siblingIds];
    newOrder.splice(currentIndex, 1);
    newOrder.splice(newPosition, 0, categoryId);

    const bulkOps = newOrder.map((id, index) => ({
      updateOne: {
        filter: { _id: new Types.ObjectId(id) },
        update: { $set: { order: index } },
      },
    }));

    if (bulkOps.length > 0) {
      await this.categoryModel.bulkWrite(bulkOps);
    }

    return { success: true };
  }

  async reorderCategories(updates: { id: string; order: number }[]) {
    const bulkOps = updates.map(({ id, order }) => ({
      updateOne: {
        filter: { _id: new Types.ObjectId(id) },
        update: { $set: { order } },
      },
    }));

    await this.categoryModel.bulkWrite(bulkOps);

    return { success: true };
  }

  async markCategoryProductsAlcohol(categoryId: string) {
    const categories = await this.categoryModel.aggregate([
      { $match: { _id: new Types.ObjectId(categoryId) } },
      {
        $graphLookup: {
          from: 'categories',
          startWith: '$_id',
          connectFromField: '_id',
          connectToField: 'parent',
          as: 'descendants',
        },
      },
      {
        $project: {
          allCategoryIds: {
            $concatArrays: [['$_id'], '$descendants._id'],
          },
        },
      },
    ]);

    if (!categories.length) {
      throw new NotFoundException('Категория не найдена');
    }

    const categoryIds = categories[0].allCategoryIds;

    const result = await this.productModel.updateMany(
      { categories: { $in: categoryIds } },
      { $set: { isAlcohol: true } },
    );

    return { updatedCount: result.modifiedCount };
  }

  async markCategoryProductsNonAlcohol(categoryId: string) {
    const categories = await this.categoryModel.aggregate([
      { $match: { _id: new Types.ObjectId(categoryId) } },
      {
        $graphLookup: {
          from: 'categories',
          startWith: '$_id',
          connectFromField: '_id',
          connectToField: 'parent',
          as: 'descendants',
        },
      },
      {
        $project: {
          allCategoryIds: {
            $concatArrays: [['$_id'], '$descendants._id'],
          },
        },
      },
    ]);

    if (!categories.length) {
      throw new NotFoundException('Категория не найдена');
    }

    const categoryIds = categories[0].allCategoryIds;

    const result = await this.productModel.updateMany(
      { categories: { $in: categoryIds } },
      { $set: { isAlcohol: false } },
    );

    return { updatedCount: result.modifiedCount };
  }
}
