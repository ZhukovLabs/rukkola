import {connectToDatabase} from "@/lib/mongoose";
import {Lunch} from "@/models/lunch";
import {Category} from "@/models/category";
import {Product, type ProductType} from "@/models/product";
import type {GroupWithProducts} from "@/app-pages/menu/products/types";

const MENU_CACHE_TTL = 30 * 1000;
const MAX_CACHE_SIZE = 10;

export const CACHE_KEYS = {
    MENU_WITH_ALCOHOL: 'menu_with_alcohol',
    MENU_NO_ALCOHOL: 'menu_no_alcohol',
    PRODUCTS_WITH_ALCOHOL: 'products_with_alcohol',
    PRODUCTS_NO_ALCOHOL: 'products_no_alcohol',
} as const;

interface MenuCache {
    lunch: Awaited<ReturnType<typeof getLunch>>;
    categories: Awaited<ReturnType<typeof getCategories>>;
    timestamp: number;
}

interface ProductsCache {
    groupedProducts: unknown[];
    uncategorizedProduct: unknown[];
    timestamp: number;
}

const menuCache = new Map<string, MenuCache | ProductsCache>();

export function clearMenuCache() {
    menuCache.clear();
}

function cleanupCache() {
    if (menuCache.size >= MAX_CACHE_SIZE) {
        const now = Date.now();
        let oldestKey: string | null = null;
        let oldestTime = now;

        for (const [key, value] of menuCache.entries()) {
            if (value.timestamp < oldestTime) {
                oldestTime = value.timestamp;
                oldestKey = key;
            }
        }

        if (oldestKey) {
            menuCache.delete(oldestKey);
        }
    }
}

const getLunch = () => (
    Lunch.findOne({active: true}).lean()
);

const getCategories = async (withAlcohol: boolean) => {
    const productMatch: Record<string, unknown> = {
        hidden: false,
        categories: { $exists: true, $ne: [] }
    };

    if (!withAlcohol) {
        productMatch.$or = [
            {isAlcohol: false},
            {isAlcohol: { $exists: false }}
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

const getGroupedProducts = (withAlcohol: boolean) => {
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

const getUncategorizedProducts = () => (
    Product.find({
        $and: [
            { $or: [{ hidden: { $exists: false } }, { hidden: false }] },
            { $or: [{ categories: { $exists: false } }, { categories: { $size: 0 } }] },
        ],
    })
        .lean<ProductType[]>()
        .exec()
);

function getCacheKey(getAlcohol: boolean): string {
    return getAlcohol ? CACHE_KEYS.MENU_WITH_ALCOHOL : CACHE_KEYS.MENU_NO_ALCOHOL;
}

export const getMenuData = async ({getAlcohol}: { getAlcohol: boolean }) => {
    await connectToDatabase();

    const cacheKey = getCacheKey(getAlcohol);
    const cached = menuCache.get(cacheKey) as MenuCache | undefined;
    
    if (cached && Date.now() - cached.timestamp < MENU_CACHE_TTL) {
        return { activeLunch: cached.lunch, categories: cached.categories };
    }

    const [activeLunch, categories] = await Promise.all([
        getLunch(),
        getCategories(getAlcohol)
    ]);

    cleanupCache();
    menuCache.set(cacheKey, { lunch: activeLunch, categories, timestamp: Date.now() });

    return { activeLunch, categories };
};

export const getProducts = async ({getAlcohol}: { getAlcohol: boolean }) => {
    await connectToDatabase();

    const cacheKey = getAlcohol ? CACHE_KEYS.PRODUCTS_WITH_ALCOHOL : CACHE_KEYS.PRODUCTS_NO_ALCOHOL;
    const cached = menuCache.get(cacheKey) as ProductsCache | undefined;

    if (cached && Date.now() - cached.timestamp < MENU_CACHE_TTL) {
        return {
            groupedProducts: cached.groupedProducts,
            uncategorizedProduct: cached.uncategorizedProduct
        };
    }

    const [groupedProducts, uncategorizedProduct] = await Promise.all([
        getGroupedProducts(getAlcohol),
        getUncategorizedProducts()
    ]);

    cleanupCache();
    menuCache.set(cacheKey, {
        groupedProducts,
        uncategorizedProduct,
        timestamp: Date.now()
    });

    return { groupedProducts, uncategorizedProduct };
};
