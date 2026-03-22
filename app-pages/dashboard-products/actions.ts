'use server'

import {ObjectId} from 'mongodb'
import {revalidatePath} from 'next/cache'

import {connectToDatabase} from '@/lib/mongoose'
import {checkAuth} from '@/lib/auth/check-auth'
import {revalidateMenuCache} from '@/lib/cache'

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
    const user = await checkAuth()
    if (!user) {
        return {success: false, message: 'Необходима авторизация'}
    }
    await connectToDatabase()

    const skip = (page - 1) * limit
    const filter: Record<string, unknown> = {}

    if (search) {
        filter.$or = [
            {name: {$regex: search, $options: 'i'}},
            {description: {$regex: search, $options: 'i'}},
        ];
    }

    if (category) {
        try {
            const categoryId = new ObjectId(category);

            const descendants = await Category.aggregate([
                {
                    $match: {_id: categoryId},
                },
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
                            $concatArrays: [
                                ['$_id'],
                                '$descendants._id',
                            ],
                        },
                    },
                },
            ], {maxTimeMS: 30000});

            const allCategoryIds = descendants[0]?.allIds ?? [];

            if (allCategoryIds.length > 0) {
                filter.categories = {$in: allCategoryIds};
            } else {
                return {
                    success: true,
                    message: 'Список товаров получен',
                    data: {
                        products: [],
                        total: 0,
                        totalPages: 0,
                    },
                };
            }
        } catch (error) {
            console.error('Error processing category filter:', error);
            return {
                success: false,
                message: 'Ошибка при обработке фильтра категории',
            };
        }
    }

const total = await Product.countDocuments(filter);

    const categories = await Category.find({ isMenuItem: true })
        .sort({ order: 1 })
        .lean();

    const rootCategories = categories.filter(c => !c.parent);
    const subcategories = categories.filter(c => c.parent);

    const subcategoryIds = new Set(subcategories.map(c => c._id.toString()));

    const products = await Product.aggregate([
        {$match: filter},
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
                sortOrder: {$ifNull: ['$order', 0]},
            },
        },
        {
            $addFields: {
                primarySubcategory: {
                    $first: {
                        $filter: {
                            input: '$productCategories',
                            as: 'cat',
                            cond: {$in: ['$$cat._id', [...subcategoryIds]]}
                        }
                    }
                },
                primaryRootCategory: {
                    $first: {
                        $filter: {
                            input: '$productCategories',
                            as: 'cat',
                            cond: {$and: [
                                {$not: {$in: ['$$cat._id', [...subcategoryIds]]}},
                                {$eq: ['$$cat.parent', null]}
                            ]}
                        }
                    }
                },
            },
        },
        {
            $addFields: {
                parentCategoryId: {
                    $cond: {
                        if: {$and: [
                            {$ne: ['$primarySubcategory', null]},
                            {$ne: ['$primarySubcategory.parent', null]}
                        ]},
                        then: {$toString: '$primarySubcategory.parent'},
                        else: {$toString: '$primaryRootCategory._id'}
                    }
                },
                categoryId: {
                    $cond: {
                        if: {$ne: ['$primarySubcategory', null]},
                        then: {$toString: '$primarySubcategory._id'},
                        else: {$toString: '$primaryRootCategory._id'}
                    }
                },
                categoryOrder: {
                    $cond: {
                        if: {$ne: ['$primarySubcategory', null]},
                        then: {$ifNull: ['$primarySubcategory.order', 0]},
                        else: {$ifNull: ['$primaryRootCategory.order', 0]}
                    }
                },
                parentCategoryOrder: {
                    $ifNull: [
                        {
                            $let: {
                                vars: {
                                    parentId: {
                                        $cond: {
                                            if: {$and: [
                                                {$ne: ['$primarySubcategory', null]},
                                                {$ne: ['$primarySubcategory.parent', null]}
                                            ]},
                                            then: '$primarySubcategory.parent',
                                            else: '$primaryRootCategory._id'
                                        }
                                    }
                                },
                                in: {
                                    $arrayElemAt: [
                                        {
                                            $map: {
                                                input: rootCategories,
                                                as: 'rc',
                                                in: {$cond: [{$eq: ['$$rc._id', '$$parentId']}, '$$rc.order', null]}
                                            }
                                        },
                                        0
                                    ]
                                }
                            }
                        },
                        0
                    ]
                },
            },
        },
        {
            $sort: {
                parentCategoryOrder: 1,
                categoryOrder: 1,
                sortOrder: 1,
            },
        },
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
                order: {$ifNull: ['$order', 0]},
                createdAt: 1,
                updatedAt: 1,
                categoryId: 1,
                parentCategoryId: 1,
                categories: {
                    $map: {
                        input: '$productCategories',
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
    try {
        const user = await checkAuth();
        if (!user) {
            return {success: false, message: 'Необходима авторизация'};
        }
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
                    isAlcohol: 1,
                    order: 1
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
    } catch (error) {
        console.error('getProductById error:', error);
        return {success: false, message: 'Ошибка при получении товара'};
    }
}

export async function toggleProductVisibility(
    productId: string,
): Promise<ActionResponse<{ id: string; hidden: boolean }>> {
    try {
        const user = await checkAuth();
        if (!user) {
            return {success: false, message: 'Необходима авторизация'};
        }
        await connectToDatabase();

        const product = await Product.findById(productId)
        if (!product) return {success: false, message: 'Товар не найден'};

        product.hidden = !product.hidden
        await product.save()

        revalidateMenuCache();
        revalidatePath('/dashboard/products');

        return {
            success: true,
            message: product.hidden ? 'Товар скрыт' : 'Товар отображается',
            data: {
                id: productId,
                hidden: product.hidden,
            },
        }
    } catch (error) {
        console.error('toggleProductVisibility error:', error);
        return {success: false, message: 'Ошибка при изменении видимости товара'};
    }
}

export async function toggleProductAlcohol(
    productId: string,
): Promise<ActionResponse<{ id: string; isAlcohol: boolean }>> {
    try {
        const user = await checkAuth();
        if (!user) {
            return {success: false, message: 'Необходима авторизация'};
        }
        await connectToDatabase();

        const product = await Product.findById(productId)
        if (!product) return {success: false, message: 'Товар не найден'};

        product.isAlcohol = !product.isAlcohol;
        await product.save();

        revalidateMenuCache();
        revalidatePath('/dashboard/products');

        return {
            success: true,
            message: product.isAlcohol ? 'Товар помечен как алкогольный' : 'Товар помечен как безалкогольный',
            data: {
                id: productId,
                isAlcohol: product.isAlcohol,
            },
        }
    } catch (error) {
        console.error('toggleProductAlcohol error:', error);
        return {success: false, message: 'Ошибка при изменении статуса алкоголя'};
    }
}

export async function deleteProduct(productId: string): Promise<ActionResponse<{ id: string }>> {
    try {
        const user = await checkAuth();
        if (!user) {
            return {success: false, message: 'Необходима авторизация'};
        }
        await connectToDatabase();

        const product = await Product.findById(productId);
        if (!product) return {success: false, message: 'Товар не найден'};

        await product.deleteOne();

        revalidateMenuCache();
        revalidatePath('/dashboard/products');

        return {
            success: true,
            message: 'Товар удалён',
            data: {id: productId},
        };
    } catch (error) {
        console.error('deleteProduct error:', error);
        return {success: false, message: 'Ошибка при удалении товара'};
    }
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
    try {
        const user = await checkAuth();
        if (!user) {
            return {success: false, message: 'Необходима авторизация'};
        }
        await connectToDatabase()

        const product = await Product.findById(id);
        if (!product) return {success: false, message: 'Товар не найден'};

        const updatedData = {
            ...data,
            image: product.image,
        }

        await Product.findByIdAndUpdate(id, updatedData)

        revalidateMenuCache();
        revalidatePath('/dashboard/products');

        return {
            success: true,
            message: 'Товар обновлён',
            data: {id},
        }
    } catch (error) {
        console.error('updateProductData error:', error);
        return {success: false, message: 'Ошибка при обновлении товара'};
    }
}

export async function getCategories(): Promise<ActionResponse<CategoryType[]>> {
    const user = await checkAuth();
    if (!user) {
        return {success: false, message: 'Необходима авторизация'};
    }
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
    try {
        const user = await checkAuth();
        if (!user) {
            return {success: false, message: 'Необходима авторизация'};
        }
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

        revalidateMenuCache();
        revalidatePath('/dashboard/products');

        return {
            success: true,
            message: 'Товар создан',
            data: {id: product.id},
        }
    } catch (error) {
        console.error('createProduct error:', error);
        return {success: false, message: 'Ошибка при создании товара'};
    }
}

export async function moveProductToPosition(
    productId: string,
    newPosition: number,
    search?: string,
    category?: string,
): Promise<ActionResponse<{ success: boolean }>> {
    try {
        const user = await checkAuth();
        if (!user) {
            return {success: false, message: 'Необходима авторизация'};
        }
        await connectToDatabase();

        const filter: Record<string, unknown> = {};

        if (search) {
            filter.$or = [
                {name: {$regex: search, $options: 'i'}},
                {description: {$regex: search, $options: 'i'}},
            ];
        }

        if (category) {
            try {
                const categoryId = new ObjectId(category);
                const descendants = await Category.aggregate([
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
                ], { maxTimeMS: 30000 });

                const allCategoryIds = descendants[0]?.allIds ?? [];
                if (allCategoryIds.length > 0) {
                    filter.categories = { $in: allCategoryIds };
                }
            } catch (error) {
                console.error('Error processing category filter:', error);
            }
        }

        const allProducts = await Product.aggregate([
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
            {
                $project: {
                    _id: 1,
                },
            },
        ]);

        const productIds = allProducts.map(p => p._id.toString());
        const currentIndex = productIds.indexOf(productId);

        if (currentIndex === -1) {
            return { success: false, message: 'Товар не найден в списке' };
        }

        if (newPosition < 0 || newPosition >= productIds.length) {
            return { success: false, message: 'Некорректная позиция' };
        }

        if (currentIndex === newPosition) {
            return { success: true, message: 'Позиция не изменилась', data: { success: true } };
        }

        const newOrder = [...productIds];
        newOrder.splice(currentIndex, 1);
        newOrder.splice(newPosition, 0, productId);

        const bulkOps = newOrder.map((id, index) => ({
            updateOne: {
                filter: { _id: new ObjectId(id) },
                update: { $set: { order: index } }
            }
        }));

        if (bulkOps.length > 0) {
            await Product.bulkWrite(bulkOps);
        }

        revalidateMenuCache();
        revalidatePath('/dashboard/products');

        return {
            success: true,
            message: 'Позиция товара обновлена',
            data: { success: true }
        };
    } catch (error) {
        console.error('moveProductToPosition error:', error);
        return { success: false, message: 'Ошибка при обновлении позиции товара' };
    }
}

export async function reorderProducts(
    updates: Array<{ id: string; order: number }>
): Promise<ActionResponse<{ success: boolean }>> {
    try {
        const user = await checkAuth();
        if (!user) {
            return {success: false, message: 'Необходима авторизация'};
        }
        await connectToDatabase();

        const bulkOps = updates.map(({ id, order }) => ({
            updateOne: {
                filter: { _id: new ObjectId(id) },
                update: { $set: { order } }
            }
        }));

        if (bulkOps.length > 0) {
            await Product.bulkWrite(bulkOps);
        }

        revalidateMenuCache();
        revalidatePath('/dashboard/products');

        return {
            success: true,
            message: 'Порядок товаров обновлён',
            data: { success: true }
        };
    } catch (error) {
        console.error('reorderProducts error:', error);
        return {success: false, message: 'Ошибка при обновлении порядка товаров'};
    }
}