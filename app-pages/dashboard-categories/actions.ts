'use server'

import {connectToDatabase} from '@/lib/mongoose'
import {Category} from '@/models/category'
import {revalidatePath} from "next/cache"
import {checkAuth} from '@/lib/auth/check-auth'
import {revalidateMenuCache} from '@/lib/cache'
import {ActionResponse} from "@/types";
import {ObjectId} from "mongodb";
import {Product} from "@/models/product";

export async function toggleCategoryField(id: string, field: 'isMenuItem' | 'showGroupTitle'): Promise<ActionResponse> {
    try {
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
    } catch (error) {
        console.error('toggleCategoryField error:', error);
        return {success: false, message: 'Ошибка при обновлении категории'};
    }
}

export async function moveCategory(id: string, direction: 'up' | 'down'): Promise<ActionResponse> {
    try {
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
    } catch (error) {
        console.error('moveCategory error:', error);
        return {success: false, message: 'Ошибка при перемещении категории'};
    }
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
    try {
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
    } catch (error) {
        console.error('updateCategoryName error:', error);
        return {success: false, message: 'Ошибка при обновлении названия'};
    }
}

export async function deleteCategory(id: string): Promise<ActionResponse> {
    try {
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
    } catch (error) {
        console.error('deleteCategory error:', error);
        return {success: false, message: 'Ошибка при удалении категории'};
    }
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
    try {
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
    } catch (error) {
        console.error('createCategory error:', error);
        return {success: false, message: 'Ошибка при создании категории'};
    }
}


export async function reorderCategories(
    updates: { id: string; order: number }[]
): Promise<ActionResponse> {
    try {
        const user = await checkAuth();
        if (!user) {
            return { success: false, message: 'Необходима авторизация' };
        }

        await connectToDatabase();

        const bulkOps = updates.map(({ id, order }) => ({
            updateOne: {
                filter: { _id: new ObjectId(id) },
                update: { $set: { order } }
            }
        }));

        await Category.bulkWrite(bulkOps);

        revalidateMenuCache();
        revalidatePath('/dashboard/categories');

        return { success: true, message: 'Порядок категорий обновлен' };
    } catch (error) {
        console.error('reorderCategories error:', error);
        return { success: false, message: 'Ошибка при обновлении порядка' };
    }
}

export async function moveCategoryToPosition(
    categoryId: string,
    newPosition: number,
): Promise<ActionResponse> {
    try {
        const user = await checkAuth();
        if (!user) {
            return { success: false, message: 'Необходима авторизация' };
        }

        await connectToDatabase();

        const category = await Category.findById(categoryId).lean();
        if (!category) {
            return { success: false, message: 'Категория не найдена' };
        }

        const parentId = category.parent?.toString() || null;

        const filter = parentId 
            ? { parent: parentId } 
            : { $or: [{ parent: null }, { parent: { $exists: false } }] };

        const siblings = await Category.find(filter)
            .sort({ order: 1 })
            .select('_id')
            .lean();

        const siblingIds = siblings.map(s => s._id.toString());
        const currentIndex = siblingIds.indexOf(categoryId);

        if (currentIndex === -1) {
            return { success: false, message: 'Категория не найдена в списке' };
        }

        if (newPosition < 0 || newPosition >= siblingIds.length) {
            return { success: false, message: 'Некорректная позиция' };
        }

        if (currentIndex === newPosition) {
            return { success: true, message: 'Позиция не изменилась' };
        }

        const newOrder = [...siblingIds];
        newOrder.splice(currentIndex, 1);
        newOrder.splice(newPosition, 0, categoryId);

        const bulkOps = newOrder.map((id, index) => ({
            updateOne: {
                filter: { _id: new ObjectId(id) },
                update: { $set: { order: index } }
            }
        }));

        if (bulkOps.length > 0) {
            await Category.bulkWrite(bulkOps);
        }

        revalidateMenuCache();
        revalidatePath('/dashboard/categories');

        return { success: true, message: 'Позиция категории обновлена' };
    } catch (error) {
        console.error('moveCategoryToPosition error:', error);
        return { success: false, message: 'Ошибка при обновлении позиции' };
    }
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