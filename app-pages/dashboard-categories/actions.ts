'use server'

import {connectToDatabase} from '@/lib/mongoose'
import {Category} from '@/models/category'
import {revalidatePath, revalidateTag} from "next/cache"
import {checkAuth} from '@/lib/auth/check-auth'
import {ActionResponse} from "@/types";
import {ObjectId} from "mongodb";
import {Product} from "@/models/product";
import {CACHE_TAGS} from '@/app-pages/menu/config';

function revalidateMenuCache() {
    revalidatePath('/', 'layout');
    const tags = [
        CACHE_TAGS.CATEGORIES,
        CACHE_TAGS.LUNCHES,
        CACHE_TAGS.MENU_WITH_ALCOHOL,
        CACHE_TAGS.MENU_NO_ALCOHOL,
        CACHE_TAGS.PRODUCTS_WITH_ALCOHOL,
        CACHE_TAGS.PRODUCTS_NO_ALCOHOL,
    ];
    for (const tag of tags) {
        revalidateTag(tag, '');
    }
}

export async function toggleCategoryField(id: string, field: 'isMenuItem' | 'showGroupTitle'): Promise<ActionResponse> {
    const user = await checkAuth();
    if (!user) {
        return {success: false, message: 'Необходима авторизация'};
    }

    await connectToDatabase()
    const category = await Category.findById(id)
    if (!category) return {success: false, message: 'Категория не найдена'}

    category[field] = !category[field]
    await category.save()

    revalidateMenuCache();
    revalidatePath('/dashboard/categories')
    
    return {success: true, message: 'Категория обновлена'}
}

export async function moveCategory(id: string, direction: 'up' | 'down'): Promise<ActionResponse> {
    const user = await checkAuth();
    if (!user) {
        return {success: false, message: 'Необходима авторизация'};
    }

    await connectToDatabase()

    const current = await Category.findById(id)
    if (!current) return {success: false, message: 'Категория не найдена'}

    const siblings = await Category.find({parent: current.parent})
        .sort({order: 1})
        .lean()

    const index = siblings.findIndex((c) => c._id.toString() === current._id.toString())
    const swapIndex = direction === 'up' ? index - 1 : index + 1

    if (swapIndex < 0 || swapIndex >= siblings.length) return {success: false, message: 'Невозможно переместить'}

    const target = siblings[swapIndex]

    const temp = current.order
    await Category.updateOne({_id: current._id}, {$set: {order: -1}})

    await Category.updateOne({_id: target._id}, {$set: {order: temp}})
    await Category.updateOne({_id: current._id}, {$set: {order: target.order}})

    await adjustChildrenOrders(current._id.toString(), temp, direction)

    revalidateMenuCache();
    revalidatePath('/dashboard/categories')
    
    return {success: true, message: 'Категория перемещена'}
}

async function adjustChildrenOrders(parentId: string, baseOrder: number, direction: 'up' | 'down') {
    const children = await Category.find({parent: parentId}).sort({order: 1}).lean()
    if (!children.length) return

    const shift = direction === 'up' ? -0.001 : 0.001

    for (const [i, child] of children.entries()) {
        await Category.updateOne(
            {_id: child._id},
            {$set: {order: baseOrder + (i + 1) * shift}}
        )
        await adjustChildrenOrders(child._id.toString(), baseOrder + (i + 1) * shift, direction)
    }
}

export async function updateCategoryName(id: string, name: string): Promise<ActionResponse> {
    const user = await checkAuth();
    if (!user) {
        return {success: false, message: 'Необходима авторизация'};
    }

    await connectToDatabase()
    const category = await Category.findById(id)
    if (!category) return {success: false, message: 'Категория не найдена'}
    
    category.name = name
    await category.save()
    
    revalidateMenuCache();
    revalidatePath('/dashboard/categories')
    
    return {success: true, message: 'Название обновлено'}
}

export async function deleteCategory(id: string): Promise<ActionResponse> {
    const user = await checkAuth();
    if (!user) {
        return {success: false, message: 'Необходима авторизация'};
    }

    await connectToDatabase()

    const deleteRecursive = async (categoryId: string) => {
        const children = await Category.find({parent: categoryId})
        for (const child of children) {
            await deleteRecursive(child._id.toString())
        }
        await Category.findByIdAndDelete(categoryId)
    }

    await deleteRecursive(id)
    
    revalidateMenuCache();
    revalidatePath('/dashboard/categories')
    
    return {success: true, message: 'Категория удалена'}
}

export async function createCategory({
                                         name,
                                         parentId,
                                         isMenuItem = false,
                                         showGroupTitle = false,
                                     }: {
    name: string
    parentId?: string | null
    isMenuItem?: boolean
    showGroupTitle?: boolean
}): Promise<ActionResponse<{ id: string }>> {
    const user = await checkAuth();
    if (!user) {
        return {success: false, message: 'Необходима авторизация'};
    }

    await connectToDatabase()

    const parent = parentId ? parentId : null

    const top = await Category.find().sort({order: -1}).limit(1).lean()
    const nextOrder = top && top.length ? top[0].order + 1 : 1

    const cat = new Category({
        name,
        parent: parent,
        order: nextOrder,
        isMenuItem,
        showGroupTitle,
    });

    await cat.save();
    
    revalidateMenuCache();
    revalidatePath('/dashboard/categories');

    return {
        success: true,
        message: 'Категория создана',
        data: {id: cat._id.toString()},
    };
}


export async function markCategoryProductsAlcohol(
    categoryId: string,
): Promise<ActionResponse<{ updatedCount: number }>> {
    const user = await checkAuth();
    if (!user) {
        return {success: false, message: 'Необходима авторизация'};
    }
    await connectToDatabase();

    try {
        const categories = await Category.aggregate([
            {$match: {_id: new ObjectId(categoryId)}},
            {
                $graphLookup: {
                    from: 'categories',
                    startWith: '$_id',
                    connectFromField: '_id',
                    connectToField: 'parent',
                    as: 'descendants',
                }
            },
            {
                $project: {
                    allCategoryIds: {
                        $concatArrays: [['$_id'], '$descendants._id']
                    }
                }
            }
        ]);

        if (!categories.length) {
            return {success: false, message: 'Категория не найдена'};
        }

        const categoryIds = categories[0].allCategoryIds;

        const result = await Product.updateMany(
            {
                categories: {$in: categoryIds}
            },
            {
                $set: {isAlcohol: true}
            }
        );

        revalidateMenuCache();

        return {
            success: true,
            message: `Продукты обновлены: ${result.modifiedCount} продуктов помечено как алкогольные`,
            data: {updatedCount: result.modifiedCount}
        };

    } catch (error) {
        console.error('Error marking products as alcohol:', error);
        return {success: false, message: 'Ошибка при обновлении продуктов'};
    }
}

export async function markCategoryProductsNonAlcohol(
    categoryId: string,
): Promise<ActionResponse<{ updatedCount: number }>> {
    const user = await checkAuth();
    if (!user) {
        return {success: false, message: 'Необходима авторизация'};
    }
    await connectToDatabase();

    try {
        const categories = await Category.aggregate([
            {$match: {_id: new ObjectId(categoryId)}},
            {
                $graphLookup: {
                    from: 'categories',
                    startWith: '$_id',
                    connectFromField: '_id',
                    connectToField: 'parent',
                    as: 'descendants',
                }
            },
            {
                $project: {
                    allCategoryIds: {
                        $concatArrays: [['$_id'], '$descendants._id']
                    }
                }
            }
        ]);

        if (!categories.length) {
            return {success: false, message: 'Категория не найдена'};
        }

        const categoryIds = categories[0].allCategoryIds;

        const result = await Product.updateMany(
            {
                categories: {$in: categoryIds}
            },
            {
                $set: {isAlcohol: false}
            }
        );

        revalidateMenuCache();

        return {
            success: true,
            message: `Продукты обновлены: ${result.modifiedCount} продуктов помечено как безалкогольные`,
            data: {updatedCount: result.modifiedCount}
        };

    } catch (error) {
        console.error('Error marking products as non-alcohol:', error);
        return {success: false, message: 'Ошибка при обновлении продуктов'};
    }
}