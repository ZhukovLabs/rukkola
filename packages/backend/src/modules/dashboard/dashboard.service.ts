import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product } from '../../schemas/product.schema';
import { Category } from '../../schemas/category.schema';
import { User } from '../../schemas/user.schema';

export interface DashboardStats {
  products: number;
  hiddenProducts: number;
  categories: number;
  users: number;
}

interface DashboardUser {
  name?: string;
  surname?: string;
  patronymic?: string;
}

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async getDashboardData(userId?: string): Promise<{
    stats: DashboardStats;
    fullName: string;
  }> {
    const [products, hiddenProducts, categories, users, user] =
      await Promise.all([
        this.productModel.countDocuments(),
        this.productModel.countDocuments({ hidden: true }),
        this.categoryModel.countDocuments(),
        this.userModel.countDocuments(),
        userId
          ? this.userModel
              .findById(userId)
              .select('name surname patronymic')
              .lean<DashboardUser>()
          : null,
      ]);

    const fullName = user
      ? [user.name, user.surname, user.patronymic].filter(Boolean).join(' ')
      : '';

    return {
      stats: {
        products,
        hiddenProducts,
        categories,
        users,
      },
      fullName,
    };
  }
}
