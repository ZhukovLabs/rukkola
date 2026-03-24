import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product } from '../../schemas/product.schema';
import { Category } from '../../schemas/category.schema';
import { Lunch } from '../../schemas/lunch.schema';

type CategoryDoc = {
  _id: { toString(): string };
  name: string;
  order: number;
  parent: { toString(): string } | null;
  showGroupTitle: boolean;
  hidden?: boolean;
};

type ProductDoc = {
  _id: { toString(): string };
  name: string;
  description?: string | null;
  image?: string | null;
  prices?: Array<{ size: string; price: number }>;
  isAlcohol?: boolean;
  order: number;
};

type MenuGroup = {
  _id: string;
  name: string;
  order: number;
  showGroupTitle: boolean;
  subgroups: Array<{
    _id: string;
    name: string;
    order: number;
    showGroupTitle: boolean;
    products: ProductDoc[];
  }>;
  directProducts: ProductDoc[];
};

@Injectable()
export class MenuService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    @InjectModel(Lunch.name) private lunchModel: Model<Lunch>,
  ) {}

  async getMenuData(showAlcohol: boolean) {
    const [activeLunch, categories] = await Promise.all([
      this.getLunch(),
      this.getCategories(showAlcohol),
    ]);

    return { activeLunch, categories };
  }

  async getGroupedProductsData(showAlcohol: boolean) {
    const [groupedProducts, uncategorizedProduct] = await Promise.all([
      this.getGroupedProducts(showAlcohol),
      this.getUncategorizedProducts(),
    ]);

    return { groupedProducts, uncategorizedProduct };
  }

  async getProductByIdPublic(id: string) {
    const product = await this.productModel.findOne({ _id: id, hidden: { $ne: true } }).lean();
    if (!product) throw new NotFoundException('Товар не найден');

    return {
      id: product._id.toString(),
      image: product.image,
      name: product.name,
      description: product.description,
    };
  }

  private async getLunch() {
    return this.lunchModel.findOne({ active: true }).lean();
  }

  private async getCategories(withAlcohol: boolean) {
    const productMatch: Record<string, unknown> = {
      hidden: { $ne: true },
      categories: { $exists: true, $ne: [] },
    };

    if (!withAlcohol) {
      productMatch.$or = [
        { isAlcohol: false },
        { isAlcohol: { $exists: false } },
      ];
    }

    const categoryIdsWithProducts = await this.productModel.distinct(
      'categories',
      productMatch,
    );

    const parentCategories = await this.categoryModel.distinct('parent', {
      _id: { $in: categoryIdsWithProducts },
      parent: { $ne: null },
    });

    return this.categoryModel
      .find({
        isMenuItem: true,
        _id: { $in: [...categoryIdsWithProducts, ...parentCategories] },
      })
      .sort({ order: 1 })
      .lean();
  }

  private async getGroupedProducts(withAlcohol: boolean): Promise<MenuGroup[]> {
    const matchStage: Record<string, unknown> = {
      hidden: { $ne: true },
      categories: {
        $exists: true,
        $ne: [],
        $type: 'array',
        $not: { $size: 0 },
      },
    };

    if (!withAlcohol) {
      matchStage.$or = [
        { isAlcohol: false },
        { isAlcohol: { $exists: false } },
      ];
    }

    const categories = (await this.categoryModel
      .find({ isMenuItem: true, hidden: { $ne: true } })
      .sort({ order: 1 })
      .lean()) as CategoryDoc[];

    const rootCategories = categories.filter((c) => !c.parent);
    const subcategories = categories.filter((c) => c.parent);

    const categoryMap = new Map<string, CategoryDoc>();
    for (const c of categories) {
      categoryMap.set(c._id.toString(), c);
    }

    const subcategoryByParent = new Map<string, CategoryDoc[]>();
    for (const sub of subcategories) {
      const parentId = sub.parent?.toString() || 'null';
      if (!subcategoryByParent.has(parentId)) {
        subcategoryByParent.set(parentId, []);
      }
      subcategoryByParent.get(parentId)!.push(sub);
    }

    const subcategoryIds = new Set(
      subcategories.map((c) => c._id.toString()),
    );

    const rawProducts = (await this.productModel
      .find(matchStage)
      .lean()) as Array<
      ProductDoc & { categories: Array<{ toString(): string }> }
    >;

    const productGroups = new Map<string, Map<string, ProductDoc[]>>();

    for (const product of rawProducts) {
      let assignedSubcategory: string | null = null;
      let assignedCategory: string | null = null;

      for (const catId of product.categories) {
        const catIdStr = catId.toString();
        if (subcategoryIds.has(catIdStr)) {
          assignedSubcategory = catIdStr;
          const sub = categoryMap.get(catIdStr);
          if (sub?.parent) {
            assignedCategory = sub.parent.toString();
          }
          break;
        }
      }

      if (!assignedSubcategory) {
        for (const catId of product.categories) {
          const catIdStr = catId.toString();
          const cat = categoryMap.get(catIdStr);
          if (cat && !cat.parent && !subcategoryIds.has(catIdStr)) {
            assignedCategory = catIdStr;
            break;
          }
        }
      }

      const productData: ProductDoc = {
        _id: product._id,
        name: product.name,
        description: product.description,
        image: product.image,
        prices: product.prices,
        isAlcohol: product.isAlcohol,
        order: product.order ?? 0,
      };

      if (assignedCategory) {
        if (!productGroups.has(assignedCategory)) {
          productGroups.set(assignedCategory, new Map());
        }
        const categoryGroups = productGroups.get(assignedCategory)!;
        const groupKey = assignedSubcategory || '__direct__';
        if (!categoryGroups.has(groupKey)) {
          categoryGroups.set(groupKey, []);
        }
        categoryGroups.get(groupKey)!.push(productData);
      }
    }

    const result: MenuGroup[] = [];

    for (const rootCat of rootCategories) {
      const rootId = rootCat._id.toString();
      const subs = subcategoryByParent.get(rootId) || [];

      const subgroups: MenuGroup['subgroups'] = [];
      let directProducts: ProductDoc[] = [];

      const categoryGroups = productGroups.get(rootId);

      if (categoryGroups) {
        for (const sub of subs) {
          const subProducts =
            categoryGroups.get(sub._id.toString()) || [];
          if (subProducts.length > 0) {
            subProducts.sort((a, b) => a.order - b.order);
            subgroups.push({
              _id: sub._id.toString(),
              name: sub.name,
              order: sub.order,
              showGroupTitle: sub.showGroupTitle ?? true,
              products: subProducts,
            });
          }
        }

        const direct = categoryGroups.get('__direct__') || [];
        if (direct.length > 0) {
          direct.sort((a, b) => a.order - b.order);
          directProducts = direct;
        }
      }

      subgroups.sort((a, b) => a.order - b.order);

      if (subgroups.length > 0 || directProducts.length > 0) {
        result.push({
          _id: rootId,
          name: rootCat.name,
          order: rootCat.order,
          showGroupTitle: rootCat.showGroupTitle ?? true,
          subgroups,
          directProducts,
        });
      }
    }

    result.sort((a, b) => a.order - b.order);

    return result;
  }

  private async getUncategorizedProducts() {
    return this.productModel
      .find({
        hidden: { $ne: true },
        $or: [
          { categories: { $exists: false } },
          { categories: { $size: 0 } },
        ],
      })
      .lean()
      .exec();
  }
}
