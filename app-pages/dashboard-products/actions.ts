'use server'

import {ObjectId} from 'mongodb'
import {revalidatePath} from 'next/cache'

import {connectToDatabase} from '@/lib/mongoose'
import {checkAuth} from '@/lib/auth/check-auth'

import {Product, PortionPrice, ProductType} from '@/models/product'
import {Category, CategoryType} from '@/models/category'

import {productSchema} from './validation'
import {ActionResponse} from "@/types";
import {Types} from "mongoose";

export async function getProducts(
    page = 1,
    limit = 10,
    search?: string,
    category?: string,
): Promise<ActionResponse<{
    products: ProductType[]
    total: number
    totalPages: number
}>> {
    await checkAuth()
    await connectToDatabase()

    const skip = (page - 1) * limit
    const filter: Record<string, unknown> = {}

    if (search) filter.name = {$regex: search, $options: 'i'};
    if (category) filter.categories = new ObjectId(category);

    const total = await Product.countDocuments(filter);

    const products = await Product.aggregate([
        {$match: filter},
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
                minCategoryOrder: {$min: '$categories.order'},
            },
        },
        {$sort: {minCategoryOrder: 1}},
        {$skip: skip},
        {$limit: limit},
        {
            $project: {
                _id: 0,
                id: {$toString: '$_id'},
                name: 1,
                description: 1,
                isAlcohol: 1,
                prices: 1,
                image: 1,
                hidden: 1,
                createdAt: 1,
                updatedAt: 1,
                categories: {
                    $map: {
                        input: '$categories',
                        as: 'cat',
                        in: {
                            _id: 0,
                            id: {$toString: '$$cat._id'},
                            name: '$$cat.name',
                            order: '$$cat.order',
                        },
                    },
                },
            },
        },
    ]);

    return {
        success: true,
        message: 'Список товаров получен',
        data: {
            products: products,
            total,
            totalPages: Math.ceil(total / limit),
        },
    }
}

export async function getProductById(id: string): Promise<ActionResponse<ProductType>> {
    await checkAuth();
    await connectToDatabase();

    const result = await Product.aggregate([
        {
            $match: {_id: new Types.ObjectId(id)},
        },
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
                            id: {$toString: '$_id'},
                            name: 1,
                        },
                    },
                ],
            },
        }, {
            $project: {
                _id: 0,
                id: {$toString: '$_id'},
                name: 1,
                description: 1,
                prices: 1,
                image: 1,
                categories: 1,
                hidden: 1,
                isAlcohol: 1
            }
        }
    ]);

    const product = result[0] || null;

    if (!product) return {success: false, message: 'Товар не найден'};

    return {
        success: true,
        message: 'Товар найден',
        data: JSON.parse(JSON.stringify(product)),
    }
}

export async function toggleProductVisibility(
    productId: string,
): Promise<ActionResponse<{ id: string; hidden: boolean }>> {
    await checkAuth();
    await connectToDatabase();

    const product = await Product.findById(productId)
    if (!product) return {success: false, message: 'Товар не найден'};

    product.hidden = !product.hidden
    await product.save()

    revalidatePath('/');

    return {
        success: true,
        message: product.hidden ? 'Товар скрыт' : 'Товар отображается',
        data: {
            id: productId,
            hidden: product.hidden,
        },
    }
}

export async function toggleProductAlcohol(
    productId: string,
): Promise<ActionResponse<{ id: string; isAlcohol: boolean }>> {
    await checkAuth();
    await connectToDatabase();

    const product = await Product.findById(productId)
    if (!product) return {success: false, message: 'Товар не найден'};

    product.isAlcohol = !product.isAlcohol;
    await product.save()

    revalidatePath('/');

    return {
        success: true,
        message: product.isAlcohol ? 'Товар помечен как алкогольный' : 'Товар помечен как безалкогольный',
        data: {
            id: productId,
            isAlcohol: product.isAlcohol,
        },
    }
}

export async function deleteProduct(productId: string): Promise<ActionResponse<{ id: string }>> {
    await checkAuth();
    await connectToDatabase();

    const product = await Product.findById(productId);
    if (!product) return {success: false, message: 'Товар не найден'};

    await product.deleteOne();

    revalidatePath('/');

    return {
        success: true,
        message: 'Товар удалён',
        data: {id: productId},
    };
}

type UpdateProductDataPayload = {
    name: string
    description: string
    prices: { size: string; price: number }[]
    categories: string[]
    hidden: boolean,
    isAlcohol: boolean,
}

export async function updateProductData(
    id: string,
    data: UpdateProductDataPayload,
): Promise<ActionResponse<{ id: string }>> {
    await checkAuth()
    await connectToDatabase()

    const product = await Product.findById(id);
    if (!product) return {success: false, message: 'Товар не найден'};

    const updatedData = {
        ...data,
        image: product.image,
    }

    await Product.findByIdAndUpdate(id, updatedData)
    revalidatePath('/')

    return {
        success: true,
        message: 'Товар обновлён',
        data: {id},
    }
}

export async function getCategories(): Promise<ActionResponse<CategoryType[]>> {
    await checkAuth();
    await connectToDatabase();

    const categories = await Category.aggregate([
        {
            $project: {
                _id: 0,
                id: {$toString: '$_id'},
                name: 1,
                order: 1
            },
        },
    ])

    return {
        success: true,
        message: 'Категории получены',
        data: JSON.parse(JSON.stringify(categories)),
    };
}

export type CreateProductInput = {
    name: string
    description?: string
    prices: PortionPrice[]
    categories: string[]
    hidden?: boolean
    isAlcohol?: boolean
}

export async function createProduct(
    data: CreateProductInput,
): Promise<ActionResponse<{ id: string }>> {
    await checkAuth()
    await connectToDatabase()

    const parsed = productSchema.safeParse(data)
    if (!parsed.success) {
        const messages = parsed.error.issues.map(
            (issue) => `${issue.path.join('.')}: ${issue.message}`,
        )

        return {
            success: false,
            message: `Ошибка валидации: ${messages.join('; ')}`,
        }
    }

    const product = new Product({
        name: parsed.data.name,
        description: parsed.data.description ?? '',
        prices: parsed.data.prices,
        categories: parsed.data.categories ?? [],
        hidden: Boolean(parsed.data.hidden),
        isAlcohol: Boolean(parsed.data.isAlcohol),
    })

    await product.save()

    revalidatePath('/dashboard/products')
    revalidatePath('/')

    return {
        success: true,
        message: 'Товар создан',
        data: {id: product.id},
    }
}
