import { unstable_cache } from 'next/cache';
import { connectToDatabase } from "@/lib/mongoose";
import { Lunch } from "@/models/lunch";
import { Category } from "@/models/category";
import { Product, type ProductType } from "@/models/product";

export const CACHE_TAGS = {
    MENU_WITH_ALCOHOL: 'menu_with_alcohol',
    MENU_NO_ALCOHOL: 'menu_no_alcohol',
    PRODUCTS_WITH_ALCOHOL: 'products_with_alcohol',
    PRODUCTS_NO_ALCOHOL: 'products_no_alcohol',
    LUNCHES: 'lunches',
    CATEGORIES: 'categories',
} as const;

export const CACHE_REVALIDATE = 60;

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

const getGroupedProducts = async (withAlcohol: boolean): Promise<MenuGroup[]> => {
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

    const categories = await Category.find({ isMenuItem: true, hidden: { $ne: true } })
        .sort({ order: 1 })
        .lean() as CategoryDoc[];

    const rootCategories = categories.filter(c => !c.parent);
    const subcategories = categories.filter(c => c.parent);

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

    const subcategoryIds = new Set(subcategories.map(c => c._id.toString()));

    const rawProducts = await Product.find(matchStage).lean() as Array<ProductDoc & { categories: Array<{ toString(): string }> }>;

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
                const subProducts = categoryGroups.get(sub._id.toString()) || [];
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
