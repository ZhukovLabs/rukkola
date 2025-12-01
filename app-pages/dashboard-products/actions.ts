'use server'

import {connectToDatabase} from '@/lib/mongoose'
import {PortionPrice, Product} from '@/models/product'
import {Types} from "mongoose";
import {revalidatePath} from "next/cache";
import {Category} from "@/models/category";
import {ObjectId} from 'mongodb'
import {productSchema} from "./validation";

export async function getProducts(page = 1, limit = 10, search?: string, category?: string) {
    await connectToDatabase()

    const skip = (page - 1) * limit
    const filter: any = {}
    if (search) filter.name = {$regex: search, $options: 'i'}
    if (category) filter.categories = new ObjectId(category)

    const total = await Product.countDocuments(filter)

    const products = await Product.aggregate([
        {$match: filter},
        {
            $lookup: {
                from: 'categories',
                localField: 'categories',
                foreignField: '_id',
                as: 'categories'
            }
        },
        {
            $addFields: {
                minCategoryOrder: {$min: '$categories.order'}
            }
        },
        {$sort: {minCategoryOrder: 1}},
        {$skip: skip},
        {$limit: limit},
        {$project: {minCategoryOrder: 0}}
    ])

    return {
        products: JSON.parse(JSON.stringify(products)),
        total,
        totalPages: Math.ceil(total / limit),
    }
}

export async function toggleProductVisibility(productId: string) {
    if (!Types.ObjectId.isValid(productId)) {
        throw new Error('Invalid product ID');
    }

    await connectToDatabase();

    const product = await Product.findById(productId);
    if (!product) {
        throw new Error('Product not found');
    }

    product.hidden = !product.hidden;
    await product.save();

    revalidatePath('/');

    return null;
}

export async function getProductById(id: string) {
    await connectToDatabase()
    const product = await Product
        .findById(id)
        .populate('categories')
        .lean();
    return JSON.parse(JSON.stringify(product))
}

type UpdateProductDataPayload = {
    name: string;
    description: string;
    prices: { size: string; price: number }[];
    categories: string[];
    hidden: boolean;
};

export async function updateProductData(id: string, data: UpdateProductDataPayload) {
    const product = await Product.findById(id);
    if (!product) throw new Error('Product not found');

    const newObj = {
        ...data,
        image: product.image,
    };

    await Product.findByIdAndUpdate(id, newObj);
    revalidatePath('/');

    return newObj;
}

export async function deleteProduct(productId: string) {
    if (!Types.ObjectId.isValid(productId)) {
        throw new Error("Invalid product ID");
    }

    await connectToDatabase();

    const product = await Product.findById(productId).lean();
    if (!product) {
        throw new Error("Product not found");
    }

    await Product.deleteOne({_id: product._id});

    return {
        ...product,
        _id: product._id.toString(),
        categories: product.categories.map(c => ({_id: c._id.toString()})),
        createdAt: product.createdAt?.toISOString(),
        updatedAt: product.updatedAt?.toISOString(),
    };
}

export async function getCategories() {
    await connectToDatabase()

    const categories = await Category.find().lean()

    return JSON.parse(JSON.stringify(categories))
}

export type CreateProductInput = {
    name: string
    description?: string
    prices: PortionPrice[]
    categories: string[]
    hidden?: boolean
}

export async function createProduct(data: CreateProductInput) {
    await connectToDatabase()

    const parsed = productSchema.safeParse(data)
    if (!parsed.success) {
        const {fieldErrors} = parsed.error.flatten()
        const messages = Object.entries(fieldErrors)
            .flatMap(([field, errs]) => (errs ?? []).map((m) => `${field}: ${m}`))
        throw new Error(`Validation failed: ${messages.join('; ')}`)
    }

    const valid = parsed.data;

    const product = new Product({
        name: valid.name,
        description: valid.description ?? '',
        prices: valid.prices,
        categories: valid.categories ?? [],
        hidden: Boolean(valid.hidden),
    })

    await product.save()

    revalidatePath('/dashboard/products')

    return product.toObject()
}