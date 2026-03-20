import { unstable_cache } from 'next/cache';
import { connectToDatabase } from "@/lib/mongoose";
import { Lunch } from "@/models/lunch";
import { Category } from "@/models/category";
import { Product, type ProductType } from "@/models/product";
import type { GroupWithProducts } from "@/app-pages/menu/products/types";

export const CACHE_TAGS = {
    MENU_WITH_ALCOHOL: 'menu_with_alcohol',
    MENU_NO_ALCOHOL: 'menu_no_alcohol',
    PRODUCTS_WITH_ALCOHOL: 'products_with_alcohol',
    PRODUCTS_NO_ALCOHOL: 'products_no_alcohol',
    LUNCHES: 'lunches',
    CATEGORIES: 'categories',
} as const;

export const CACHE_REVALIDATE = 60; // seconds

const getLunch = async () => {
    return Lunch.findOne({ active: true }).lean();
};

const getCategories = async (withAlcohol: boolean) => {
    const productMatch: Record<string, unknown> = {
        hidden: false,
        categories: { $exists: true, $ne: [] }
    };

    if (!withAlcohol) {
        productMatch.$or = [
            { isAlcohol: false },
            { isAlcohol: { $exists: false } }
        ];
    }

    const categoryIdsWithProducts = await Product.distinct('categories', productMatch);

    const parentCategories = await Category.distinct('parent', {
        _id: { $in: categoryIdsWithProducts },
        parent: { $ne: null }
    });

    return Category.find({
        isMenuItem: true,
        _id: { $in: [...categoryIdsWithProducts, ...parentCategories] }
    })
        .sort({ order: 1 })
        .lean();
};

const getGroupedProducts = async (withAlcohol: boolean) => {
    const matchStage: Record<string, unknown> = {
        hidden: { $ne: true },
        categories: { $exists: true, $ne: [], $type: 'array', $not: { $size: 0 } }
    };

    if (!withAlcohol) {
        matchStage.$or = [
            { isAlcohol: false },
            { isAlcohol: { $exists: false } }
        ];
    }

    return Product.aggregate<GroupWithProducts>([
        { $match: matchStage },
        { $unwind: "$categories" },
        {
            $lookup: {
                from: "categories",
                localField: "categories",
                foreignField: "_id",
                as: "categoryInfo",
            },
        },
        { $unwind: "$categoryInfo" },
        { $match: { "categoryInfo.hidden": { $ne: true }, "categoryInfo.isMenuItem": true } },
        {
            $group: {
                _id: "$categoryInfo._id",
                categoryName: { $first: "$categoryInfo.name" },
                categoryOrder: { $first: "$categoryInfo.order" },
                showGroupTitle: { $first: "$categoryInfo.showGroupTitle" },
                products: { $push: "$$ROOT" },
            },
        },
        { $sort: { categoryOrder: 1 } },
    ]);
};

const getUncategorizedProducts = async () => {
    return Product.find({
        $and: [
            { $or: [{ hidden: { $exists: false } }, { hidden: false }] },
            { $or: [{ categories: { $exists: false } }, { categories: { $size: 0 } }] },
        ],
    })
        .lean<ProductType[]>()
        .exec();
};

const cachedGetLunch = (withAlcohol: boolean) => 
    unstable_cache(
        async () => {
            await connectToDatabase();
            return getLunch();
        },
        [CACHE_TAGS.LUNCHES, withAlcohol ? 'with-alcohol' : 'no-alcohol'],
        { 
            revalidate: CACHE_REVALIDATE,
            tags: [CACHE_TAGS.LUNCHES, withAlcohol ? CACHE_TAGS.MENU_WITH_ALCOHOL : CACHE_TAGS.MENU_NO_ALCOHOL] 
        }
    );

const cachedGetCategories = (withAlcohol: boolean) =>
    unstable_cache(
        async () => {
            await connectToDatabase();
            return getCategories(withAlcohol);
        },
        [CACHE_TAGS.CATEGORIES, withAlcohol ? 'with-alcohol' : 'no-alcohol'],
        { 
            revalidate: CACHE_REVALIDATE,
            tags: [CACHE_TAGS.CATEGORIES, withAlcohol ? CACHE_TAGS.MENU_WITH_ALCOHOL : CACHE_TAGS.MENU_NO_ALCOHOL] 
        }
    );

const cachedGetGroupedProducts = (withAlcohol: boolean) =>
    unstable_cache(
        async () => {
            await connectToDatabase();
            return getGroupedProducts(withAlcohol);
        },
        ['grouped-products', withAlcohol ? 'with-alcohol' : 'no-alcohol'],
        { 
            revalidate: CACHE_REVALIDATE,
            tags: [withAlcohol ? CACHE_TAGS.PRODUCTS_WITH_ALCOHOL : CACHE_TAGS.PRODUCTS_NO_ALCOHOL] 
        }
    );

const cachedGetUncategorizedProducts = unstable_cache(
    async () => {
        await connectToDatabase();
        return getUncategorizedProducts();
    },
    ['uncategorized-products'],
    { 
        revalidate: CACHE_REVALIDATE,
        tags: [CACHE_TAGS.PRODUCTS_WITH_ALCOHOL, CACHE_TAGS.PRODUCTS_NO_ALCOHOL] 
    }
);

export const getMenuData = async ({ getAlcohol }: { getAlcohol: boolean }) => {
    const [activeLunch, categories] = await Promise.all([
        cachedGetLunch(getAlcohol)(),
        cachedGetCategories(getAlcohol)()
    ]);

    return { activeLunch, categories };
};

export const getProducts = async ({ getAlcohol }: { getAlcohol: boolean }) => {
    const [groupedProducts, uncategorizedProduct] = await Promise.all([
        cachedGetGroupedProducts(getAlcohol)(),
        cachedGetUncategorizedProducts()
    ]);

    return { groupedProducts, uncategorizedProduct };
};
