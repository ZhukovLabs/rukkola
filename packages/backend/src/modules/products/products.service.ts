import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { LRUCache } from 'lru-cache';
import sharp from 'sharp';
import { Product } from '../../schemas/product.schema';
import { Category } from '../../schemas/category.schema';
import { MinioService } from '../minio/minio.service';
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
  ) {}

  async getProducts(
    page = 1,
    limit = 10,
    search?: string,
    category?: string,
  ) {
    const skip = (page - 1) * limit;
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
          hidden: 1,
          order: { $ifNull: ['$order', 0] },
          createdAt: 1,
          updatedAt: 1,
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
          categories: 1,
          hidden: 1,
          isAlcohol: 1,
          order: 1,
        },
      },
    ]);

    const product = result[0] || null;
    if (!product) {
      throw new NotFoundException('Товар не найден');
    }

    return product;
  }

  async toggleVisibility(productId: string) {
    const product = await this.productModel.findById(productId);
    if (!product) throw new NotFoundException('Товар не найден');

    product.hidden = !product.hidden;
    await product.save();

    return {
      id: productId,
      hidden: product.hidden,
    };
  }

  async toggleAlcohol(productId: string) {
    const product = await this.productModel.findById(productId);
    if (!product) throw new NotFoundException('Товар не найден');

    product.isAlcohol = !product.isAlcohol;
    await product.save();

    return {
      id: productId,
      isAlcohol: product.isAlcohol,
    };
  }

  async deleteProduct(productId: string) {
    const product = await this.productModel.findById(productId);
    if (!product) throw new NotFoundException('Товар не найден');

    await product.deleteOne();

    return { id: productId };
  }

  async updateProduct(id: string, data: UpdateProductDto) {
    const product = await this.productModel.findById(id);
    if (!product) throw new NotFoundException('Товар не найден');

    const updatedData = {
      ...data,
      image: product.image,
    };

    await this.productModel.findByIdAndUpdate(id, updatedData);

    return { id };
  }

  async createProduct(data: CreateProductDto) {
    const product = new this.productModel({
      name: data.name,
      description: data.description ?? '',
      prices: data.prices,
      categories: data.categories ?? [],
      hidden: Boolean(data.hidden),
      isAlcohol: Boolean(data.isAlcohol),
    });

    await product.save();

    return { id: product._id.toString() };
  }

  async moveToPosition(
    productId: string,
    newPosition: number,
    search?: string,
    category?: string,
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
      { $project: { _id: 1 } },
    ]);

    const productIds = allProducts.map((p: { _id: Types.ObjectId }) =>
      p._id.toString(),
    );
    const currentIndex = productIds.indexOf(productId);

    if (currentIndex === -1) {
      throw new NotFoundException('Товар не найден в списке');
    }

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

    return { success: true };
  }

  async swapProducts(orderedIds: string[], pageOffset: number) {
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

    return { success: true };
  }

  async reorderProducts(updates: Array<{ id: string; order: number }>) {
    const bulkOps = updates.map(({ id, order }) => ({
      updateOne: {
        filter: { _id: new Types.ObjectId(id) },
        update: { $set: { order } },
      },
    }));

    if (bulkOps.length > 0) {
      await this.productModel.bulkWrite(bulkOps);
    }

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

  async uploadImage(productId: string, file: Express.Multer.File) {
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
    await product.save();

    return { image: product.image };
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
