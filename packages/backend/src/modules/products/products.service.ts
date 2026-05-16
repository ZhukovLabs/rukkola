import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { LRUCache } from 'lru-cache';
import sharp from 'sharp';
import { Product } from '../../schemas/product.schema';
import { Category } from '../../schemas/category.schema';
import { MinioService } from '../minio/minio.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { sanitizeFileName } from '../../common/utils/sanitize';
import { optimizeImage } from '../../common/utils/image-optimize';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const MAX_FILE_SIZE = 10 * 1024 * 1024;

@Injectable()
export class ProductsService {
  private imageCache = new LRUCache<string, { buffer: Buffer; contentType: string }>({
    max: 500,
  });

  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    private minioService: MinioService,
    private auditLogService: AuditLogService,
  ) {}

  async getProducts(
    page = 1,
    limit = 10,
    search?: string,
    category?: string,
    hidden?: string,
  ) {
    const skip = (page - 1) * limit;
    const filter: Record<string, unknown> = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (hidden === 'true') {
      filter.hidden = true;
    } else if (hidden === 'false') {
      filter.hidden = false;
    }

    if (category) {
      try {
        const categoryId = new Types.ObjectId(category);

        const descendants = await this.categoryModel.aggregate(
          [
            { $match: { _id: categoryId } },
            {
              $graphLookup: {
                from: 'categories',
                startWith: '$_id',
                connectFromField: '_id',
                connectToField: 'parent',
                as: 'descendants',
                maxDepth: 10,
                depthField: 'depth',
              },
            },
            {
              $project: {
                allIds: {
                  $concatArrays: [['$_id'], '$descendants._id'],
                },
              },
            },
          ],
          { maxTimeMS: 30000 },
        );

        const allCategoryIds = descendants[0]?.allIds ?? [];

        if (allCategoryIds.length > 0) {
          filter.categories = { $in: allCategoryIds };
        } else {
          return {
            products: [],
            total: 0,
            totalPages: 0,
          };
        }
      } catch (error) {
        console.error('Error processing category filter:', error);
        throw new BadRequestException('Ошибка при обработке фильтра категории');
      }
    }

    const total = await this.productModel.countDocuments(filter);

    const categories = await this.categoryModel
      .find({ isMenuItem: true })
      .sort({ order: 1 })
      .lean();

    const rootCategories = categories.filter((c) => !c.parent);
    const rootCategoryOrderMap = new Map(
      rootCategories.map((c) => [c._id.toString(), c.order]),
    );

    const products = await this.productModel.aggregate([
      { $match: filter },
      {
        $lookup: {
          from: 'categories',
          localField: 'categories',
          foreignField: '_id',
          as: 'productCategories',
        },
      },
      {
        $addFields: {
          sortOrder: { $ifNull: ['$order', 0] },
        },
      },
      {
        $project: {
          _id: 0,
          id: { $toString: '$_id' },
          name: 1,
          description: 1,
          isAlcohol: 1,
          prices: 1,
          image: 1,
          blurDataURL: 1,
          hidden: 1,
          order: { $ifNull: ['$order', 0] },
          createdAt: 1,
          updatedAt: 1,
          tags: 1,
          categories: {
            $map: {
              input: '$productCategories',
              as: 'cat',
              in: {
                _id: 0,
                id: { $toString: '$$cat._id' },
                name: '$$cat.name',
                order: '$$cat.order',
                parent: { $toString: '$$cat.parent' },
              },
            },
          },
          sortOrder: 1,
        },
      },
    ]);

    type CategoryInfo = { id?: string; parent?: string; order?: number };

    const sortedProducts = products
      .map((p: Record<string, unknown>) => {
        const cats: CategoryInfo[] = (p.categories as CategoryInfo[]) || [];
        const subcategory = cats.find(
          (c: CategoryInfo) => c.parent && c.parent !== 'null',
        );
        const rootCategory = cats.find(
          (c: CategoryInfo) => !c.parent || c.parent === 'null',
        );

        const parentCategoryId = subcategory?.parent || rootCategory?.id;
        const categoryOrder = subcategory?.order ?? rootCategory?.order ?? 0;
        const parentCategoryOrder =
          rootCategoryOrderMap.get(parentCategoryId ?? '') ?? 0;
        const sortOrder = (p.sortOrder as number) ?? 0;

        return {
          ...p,
          categoryOrder,
          parentCategoryOrder,
          sortOrder,
        };
      })
      .sort(
        (
          a: { parentCategoryOrder: number; categoryOrder: number; sortOrder: number },
          b: { parentCategoryOrder: number; categoryOrder: number; sortOrder: number },
        ) => {
          if (a.parentCategoryOrder !== b.parentCategoryOrder) {
            return a.parentCategoryOrder - b.parentCategoryOrder;
          }
          if (a.categoryOrder !== b.categoryOrder) {
            return a.categoryOrder - b.categoryOrder;
          }
          return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
        },
      );

    const paginatedProducts = sortedProducts.slice(skip, skip + limit);

    return {
      products: paginatedProducts,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getProductById(id: string) {
    const result = await this.productModel.aggregate([
      { $match: { _id: new Types.ObjectId(id) } },
      {
        $lookup: {
          from: 'categories',
          localField: 'categories',
          foreignField: '_id',
          as: 'categories',
          pipeline: [
            {
              $project: {
                _id: 0,
                id: { $toString: '$_id' },
                name: 1,
              },
            },
          ],
        },
      },
      {
        $project: {
          _id: 0,
          id: { $toString: '$_id' },
          name: 1,
          description: 1,
          prices: 1,
          image: 1,
          blurDataURL: 1,
          categories: 1,
          hidden: 1,
          isAlcohol: 1,
          order: 1,
          tags: 1,
        },
      },
    ]);

    const product = result[0] || null;
    if (!product) {
      throw new NotFoundException('Товар не найден');
    }

    return product;
  }

  async toggleVisibility(productId: string, userId: string) {
    const product = await this.productModel.findById(productId);
    if (!product) throw new NotFoundException('Товар не найден');

    product.hidden = !product.hidden;
    await product.save();

    await this.auditLogService.createLog(
      userId,
      product.hidden ? 'Скрытие товара' : 'Отображение товара',
      `«${product.name}» · ${product.hidden ? 'Скрыт' : 'Показан'}`,
      { entityType: 'product', entityId: productId },
    );

    return {
      id: productId,
      hidden: product.hidden,
    };
  }

  async toggleAlcohol(productId: string, userId: string) {
    const product = await this.productModel.findById(productId);
    if (!product) throw new NotFoundException('Товар не найден');

    product.isAlcohol = !product.isAlcohol;
    await product.save();

    await this.auditLogService.createLog(
      userId,
      'Изменение статуса алкоголя',
      `Товар: ${product.name}, Алкогольный: ${product.isAlcohol ? 'Да' : 'Нет'}`,
      { entityType: 'product', entityId: productId },
    );

    return {
      id: productId,
      isAlcohol: product.isAlcohol,
    };
  }

  async deleteProduct(productId: string, userId: string) {
    const product = await this.productModel.findById(productId);
    if (!product) throw new NotFoundException('Товар не найден');

    const productName = product.name;
    await product.deleteOne();

    await this.auditLogService.createLog(
      userId,
      'Удаление товара',
      `Товар: «${productName}»`,
      { entityType: 'product', entityId: productId },
    );

    return { id: productId };
  }

  async updateProduct(id: string, data: UpdateProductDto, userId: string) {
    const product = await this.productModel.findById(id);
    if (!product) throw new NotFoundException('Товар не найден');

    const updatedData: any = {
      ...data,
      image: product.image,
      blurDataURL: product.blurDataURL,
    };

    const changes: string[] = [];

    if (data.name && data.name !== product.name) {
      changes.push(`Название: «${product.name}» → «${data.name}»`);
    }

    if (data.description !== undefined && data.description !== product.description) {
      const oldDesc = product.description || '(пусто)';
      const newDesc = data.description || '(пусто)';
      changes.push(`Описание: «${oldDesc}» → «${newDesc}»`);
    }

    if (data.prices && data.prices.length > 0) {
      const oldPrices = product.prices || [];
      const priceChanges = data.prices.map(newP => {
        const oldP = oldPrices.find(op => op.size === newP.size);
        if (oldP && oldP.price !== newP.price) {
          return `${newP.size} · ${oldP.price} руб. → ${newP.price} руб.`;
        }
        if (!oldP) {
          return `${newP.size} · ${newP.price} руб. (добавлена)`;
        }
        return null;
      }).filter(Boolean);

      const removedSizes = oldPrices
        .filter(oldP => !data.prices!.some(newP => newP.size === oldP.size))
        .map(p => p.size);
      if (removedSizes.length > 0) {
        priceChanges.push(`${removedSizes.join(', ')} · удалена(ы)`);
      }

      if (priceChanges.length > 0) {
        changes.push(`Цены: ${priceChanges.join('; ')}`);
      }
    }

    if (data.categories) {
      const oldCategoryIds = (product.categories || []).map(c => c.toString());
      const newCategoryIds = data.categories;

      const addedIds = newCategoryIds.filter(c => !oldCategoryIds.includes(c));
      const removedIds = oldCategoryIds.filter(c => !newCategoryIds.includes(c));

      if (addedIds.length > 0 || removedIds.length > 0) {
        const [addedCats, removedCats] = await Promise.all([
          this.categoryModel.find({ _id: { $in: addedIds } }).select('name').lean(),
          this.categoryModel.find({ _id: { $in: removedIds } }).select('name').lean(),
        ]);

        const catParts: string[] = [];
        if (addedCats.length > 0) catParts.push(`добавлены: ${addedCats.map(c => c.name).join(', ')}`);
        if (removedCats.length > 0) catParts.push(`удалены: ${removedCats.map(c => c.name).join(', ')}`);
        changes.push(`Категории: ${catParts.join('; ')}`);
      }
    }

    if (data.hidden !== undefined && data.hidden !== product.hidden) {
      changes.push(`Скрыт: ${product.hidden ? 'Да' : 'Нет'} → ${data.hidden ? 'Да' : 'Нет'}`);
    }
    if (data.isAlcohol !== undefined && data.isAlcohol !== product.isAlcohol) {
      changes.push(`Алкогольный: ${product.isAlcohol ? 'Да' : 'Нет'} → ${data.isAlcohol ? 'Да' : 'Нет'}`);
    }
    if (data.removeImage && product.image) {
      changes.push(`Изображение удалено`);
    }

    if (data.tags !== undefined) {
      const oldTags = product.tags || [];
      const oldTagTexts = oldTags.map((t: any) => t.text);
      const newTagTexts = data.tags.map(t => t.text);

      const addedTags = newTagTexts.filter((t: string) => !oldTagTexts.includes(t));
      const removedTags = oldTagTexts.filter((t: string) => !newTagTexts.includes(t));

      const sameTags = newTagTexts.filter((t: string) => oldTagTexts.includes(t));
      const oldOrder = sameTags.map((t: string) => oldTagTexts.indexOf(t));
      const newOrder = sameTags.map((t: string) => newTagTexts.indexOf(t));
      const orderChanged = oldOrder.some((pos: number, i: number) => pos !== newOrder[i]);

      if (addedTags.length > 0 || removedTags.length > 0) {
        const tagParts: string[] = [];
        if (addedTags.length > 0) tagParts.push(`добавлены: ${addedTags.join(', ')}`);
        if (removedTags.length > 0) tagParts.push(`удалены: ${removedTags.join(', ')}`);
        changes.push(`Теги: ${tagParts.join('; ')}`);
      } else if (orderChanged && sameTags.length > 0) {
        changes.push(`Теги: порядок изменён (${sameTags.join(' → ')})`);
      }
    }

    if (data.removeImage && product.image) {
      const oldFileName = product.image.split('/').pop();
      if (oldFileName) {
        try {
          await this.minioService.deleteFile(
            `products/${decodeURIComponent(oldFileName)}`,
          );
          this.invalidateImageCache(decodeURIComponent(oldFileName));
        } catch (error) {
          console.error('Error deleting image during product update:', error);
        }
      }
      updatedData.image = null;
      updatedData.blurDataURL = null;
    }

    delete updatedData.removeImage;

    await this.productModel.findByIdAndUpdate(id, updatedData);

    const details = changes.length > 0
      ? `«${product.name}»\n${changes.join('\n')}`
      : `«${product.name}»`;

    await this.auditLogService.createLog(
      userId,
      'Обновление товара',
      details,
      { entityType: 'product', entityId: id },
    );

    return { id };
  }

  async createProduct(data: CreateProductDto, userId: string) {
    const product = new this.productModel({
      name: data.name,
      description: data.description ?? '',
      prices: data.prices,
      categories: data.categories ?? [],
      hidden: Boolean(data.hidden),
      isAlcohol: Boolean(data.isAlcohol),
      tags: data.tags ?? [],
    });

    await product.save();

    const details: string[] = [];
    details.push(`Название: «${product.name}»`);
    if (data.description) details.push(`Описание: «${data.description}»`);
    const priceStr = data.prices.map(p => `${p.size} · ${p.price} руб.`).join('; ');
    details.push(`Цены: ${priceStr}`);
    if (data.categories && data.categories.length > 0) {
      const cats = await this.categoryModel.find({ _id: { $in: data.categories } }).select('name').lean();
      details.push(`Категории: ${cats.map(c => c.name).join(', ')}`);
    }
    if (data.hidden) details.push('Скрыт: Да');
    if (data.isAlcohol) details.push('Алкогольный: Да');
    if (data.tags && data.tags.length > 0) {
      details.push(`Теги: ${data.tags.map(t => t.text).join(', ')}`);
    }

    await this.auditLogService.createLog(
      userId,
      'Создание товара',
      details.join('\n'),
      { entityType: 'product', entityId: product._id.toString() },
    );

    return { id: product._id.toString() };
  }

  async moveToPosition(
    productId: string,
    newPosition: number,
    search?: string,
    category?: string,
    userId?: string,
  ) {
    const filter: Record<string, unknown> = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (category) {
      try {
        const categoryId = new Types.ObjectId(category);
        const descendants = await this.categoryModel.aggregate(
          [
            { $match: { _id: categoryId } },
            {
              $graphLookup: {
                from: 'categories',
                startWith: '$_id',
                connectFromField: '_id',
                connectToField: 'parent',
                as: 'descendants',
                maxDepth: 10,
                depthField: 'depth',
              },
            },
            {
              $project: {
                allIds: {
                  $concatArrays: [['$_id'], '$descendants._id'],
                },
              },
            },
          ],
          { maxTimeMS: 30000 },
        );

        const allCategoryIds = descendants[0]?.allIds ?? [];
        if (allCategoryIds.length > 0) {
          filter.categories = { $in: allCategoryIds };
        }
      } catch (error) {
        console.error('Error processing category filter:', error);
      }
    }

    const allProducts = await this.productModel.aggregate([
      { $match: filter },
      {
        $lookup: {
          from: 'categories',
          localField: 'categories',
          foreignField: '_id',
          as: 'categories',
        },
      },
      {
        $addFields: {
          minCategoryOrder: { $min: '$categories.order' },
          sortOrder: { $ifNull: ['$order', 0] },
        },
      },
      { $sort: { minCategoryOrder: 1, sortOrder: 1 } },
      { $project: { _id: 1, name: 1 } },
    ]);

    const productIds = allProducts.map((p: { _id: Types.ObjectId }) =>
      p._id.toString(),
    );
    const currentIndex = productIds.indexOf(productId);

    if (currentIndex === -1) {
      throw new NotFoundException('Товар не найден в списке');
    }

    const product = allProducts.find((p) => p._id.toString() === productId);

    if (newPosition < 0 || newPosition >= productIds.length) {
      throw new BadRequestException('Некорректная позиция');
    }

    if (currentIndex === newPosition) {
      return { success: true };
    }

    const newOrder = [...productIds];
    newOrder.splice(currentIndex, 1);
    newOrder.splice(newPosition, 0, productId);

    const bulkOps = newOrder.map((id: string, index: number) => ({
      updateOne: {
        filter: { _id: new Types.ObjectId(id) },
        update: { $set: { order: index } },
      },
    }));

    if (bulkOps.length > 0) {
      await this.productModel.bulkWrite(bulkOps);
    }

    if (userId) {
      await this.auditLogService.createLog(
        userId,
        'Изменение позиции товара',
        `Товар: «${product?.name}», Новая позиция: ${newPosition + 1}`,
        { entityType: 'product', entityId: productId },
      );
    }

    return { success: true };
  }

  async swapProducts(orderedIds: string[], pageOffset: number, userId: string) {
    if (!orderedIds || orderedIds.length === 0) {
      throw new BadRequestException('Список ID пуст');
    }

    const bulkOps = orderedIds.map((id, index) => ({
      updateOne: {
        filter: { _id: new Types.ObjectId(id) },
        update: { $set: { order: pageOffset + index } },
      },
    }));

    await this.productModel.bulkWrite(bulkOps);

    const productNames = await this.productModel
      .find({ _id: { $in: orderedIds.slice(0, 1).map(id => new Types.ObjectId(id)) } })
      .select('name')
      .lean();
    const primaryName = productNames.length > 0 ? productNames[0].name : 'Неизвестный товар';
    const suffix = orderedIds.length > 1 ? ` и ещё ${orderedIds.length - 1}` : '';

    await this.auditLogService.createLog(
      userId,
      'Перестановка товаров',
      `«${primaryName}»${suffix}`,
      { entityType: 'product' },
    );

    return { success: true };
  }

  async reorderProducts(updates: Array<{ id: string; order: number }>, userId: string) {
    const bulkOps = updates.map(({ id, order }) => ({
      updateOne: {
        filter: { _id: new Types.ObjectId(id) },
        update: { $set: { order } },
      },
    }));

    if (bulkOps.length > 0) {
      await this.productModel.bulkWrite(bulkOps);
    }

    const productNames = await this.productModel
      .find({ _id: { $in: updates.slice(0, 1).map(u => new Types.ObjectId(u.id)) } })
      .select('name')
      .lean();
    const primaryName = productNames.length > 0 ? productNames[0].name : 'Неизвестный товар';
    const suffix = updates.length > 1 ? ` и ещё ${updates.length - 1}` : '';

    await this.auditLogService.createLog(
      userId,
      'Массовое изменение порядка товаров',
      `«${primaryName}»${suffix}`,
      { entityType: 'product' },
    );

    return { success: true };
  }

  async getCategories() {
    const categories = await this.categoryModel.aggregate([
      {
        $project: {
          _id: 0,
          id: { $toString: '$_id' },
          name: 1,
          order: 1,
        },
      },
    ]);

    return categories;
  }

  async uploadImage(productId: string, file: Express.Multer.File, userId: string) {
    if (!file) {
      throw new BadRequestException('Файл не предоставлен');
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException('Размер файла превышает 10MB');
    }

    const ext = file.originalname.split('.').pop()?.toLowerCase() || '';
    if (!ALLOWED_EXTENSIONS.has(`.${ext}`)) {
      throw new BadRequestException('Неподдерживаемый формат файла');
    }

    const product = await this.productModel.findById(productId);
    if (!product) {
      throw new NotFoundException('Продукт не найден');
    }

    // Delete old image if exists
    if (product.image) {
      const oldFileName = product.image.split('/').pop();
      if (oldFileName) {
        try {
          await this.minioService.deleteFile(
            `products/${decodeURIComponent(oldFileName)}`,
          );
          this.invalidateImageCache(decodeURIComponent(oldFileName));
        } catch {
          // Old file may not exist
        }
      }
    }

    const fileName = sanitizeFileName(product.name, '.webp');
    const objectName = `products/${fileName}`;

    const optimizedBuffer = await optimizeImage(file.buffer, { quality: 80 });
    await this.minioService.uploadFile(objectName, optimizedBuffer, 'image/webp');

    product.image = `/api/products/image/${encodeURIComponent(fileName)}`;
    product.blurDataURL = await this.generateBlurDataURL(optimizedBuffer);
    await product.save();

    await this.auditLogService.createLog(
      userId,
      'Загрузка изображения',
      `Товар: «${product.name}»`,
      { entityType: 'product', entityId: productId },
    );

    return { image: product.image, blurDataURL: product.blurDataURL };
  }

  private async generateBlurDataURL(buffer: Buffer): Promise<string> {
    const blurBuffer = await sharp(buffer)
      .resize(10, 10, { fit: 'inside' })
      .webp({ quality: 20 })
      .toBuffer();
    return `data:image/webp;base64,${blurBuffer.toString('base64')}`;
  }

  async serveImage(filename: string, width?: number) {
    if (!filename || typeof filename !== 'string') {
      throw new BadRequestException('Имя файла не указано');
    }

    const decodedFilename = decodeURIComponent(filename);

    if (decodedFilename.includes('..') || decodedFilename.includes('/')) {
      throw new BadRequestException('Некорректное имя файла');
    }

    const objectName = `products/${decodedFilename}`;
    const cacheKey = `${objectName}-${width || 'original'}`;

    const cached = this.imageCache.get(cacheKey);
    if (cached) return cached;

    // Try with products/ prefix first, then without (for backward compat)
    let originalBuffer = await this.minioService.getFile(objectName);
    if (!originalBuffer) {
      originalBuffer = await this.minioService.getFile(decodedFilename);
    }
    if (!originalBuffer) {
      console.error(`[serveImage] File not found in MinIO: "${objectName}" and "${decodedFilename}"`);
      throw new NotFoundException('Файл не найден');
    }

    let fileBuffer = originalBuffer;

    if (width && width > 0) {
      fileBuffer = Buffer.from(
        await sharp(originalBuffer)
          .resize(width, undefined, { fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 80 })
          .toBuffer(),
      );
    }

    const result = { buffer: fileBuffer, contentType: 'image/webp' };
    this.imageCache.set(cacheKey, result);

    return result;
  }

  private invalidateImageCache(filename: string) {
    const keys = [...this.imageCache.keys()].filter((key) =>
      key.startsWith(`products/${filename}`),
    );
    keys.forEach((key) => this.imageCache.delete(key));
  }
}
