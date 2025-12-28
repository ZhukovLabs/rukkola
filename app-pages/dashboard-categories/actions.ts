'use server'

import { connectToDatabase } from '@/lib/mongoose'
import { Category } from '@/models/category'
import { revalidatePath } from "next/cache"
import { checkAuth } from '@/lib/auth/actions'

export async function toggleCategoryField(id: string, field: 'isMenuItem' | 'showGroupTitle') {
    await checkAuth();

    await connectToDatabase()
    const category = await Category.findById(id)
    if (!category) return

    category[field] = !category[field]
    await category.save()

    revalidatePath('/dashboard/categories')
    revalidatePath('/')
}

export async function moveCategory(id: string, direction: 'up' | 'down') {
    await checkAuth();

    await connectToDatabase()

    const current = await Category.findById(id)
    if (!current) return

    const siblings = await Category.find({ parent: current.parent })
        .sort({ order: 1 })
        .lean()

    const index = siblings.findIndex((c) => c._id.toString() === current._id.toString())
    const swapIndex = direction === 'up' ? index - 1 : index + 1

    if (swapIndex < 0 || swapIndex >= siblings.length) return

    const target = siblings[swapIndex]

    const temp = current.order
    await Category.updateOne({ _id: current._id }, { $set: { order: -1 } })

    await Category.updateOne({ _id: target._id }, { $set: { order: temp } })
    await Category.updateOne({ _id: current._id }, { $set: { order: target.order } })

    await adjustChildrenOrders(current._id.toString(), temp, direction)

    revalidatePath('/dashboard/categories')
    revalidatePath('/')
}

async function adjustChildrenOrders(parentId: string, baseOrder: number, direction: 'up' | 'down') {
    const children = await Category.find({ parent: parentId }).sort({ order: 1 }).lean()
    if (!children.length) return

    const shift = direction === 'up' ? -0.001 : 0.001

    for (const [i, child] of children.entries()) {
        await Category.updateOne(
            { _id: child._id },
            { $set: { order: baseOrder + (i + 1) * shift } }
        )
        await adjustChildrenOrders(child._id.toString(), baseOrder + (i + 1) * shift, direction)
    }
}

export async function updateCategoryName(id: string, name: string) {
    await checkAuth()

    await connectToDatabase()
    const category = await Category.findById(id)
    if (!category) return
    category.name = name
    await category.save()
    revalidatePath('/dashboard/categories')
    revalidatePath('/')
}

export async function deleteCategory(id: string) {
    await checkAuth()

    await connectToDatabase()

    const deleteRecursive = async (categoryId: string) => {
        const children = await Category.find({ parent: categoryId })
        for (const child of children) {
            await deleteRecursive(child._id.toString())
        }
        await Category.findByIdAndDelete(categoryId)
    }

    await deleteRecursive(id)
    revalidatePath('/dashboard/categories')
    revalidatePath('/')
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
}) {
    await checkAuth()

    await connectToDatabase()

    const parent = parentId ? parentId : null

    const top = await Category.find().sort({ order: -1 }).limit(1).lean()
    const nextOrder = top && top.length ? top[0].order + 1 : 1

    const cat = new Category({
        name,
        parent: parent,
        order: nextOrder,
        isMenuItem,
        showGroupTitle,
    });

    await cat.save();
    revalidatePath('/dashboard/categories');

    return cat.toObject();
}