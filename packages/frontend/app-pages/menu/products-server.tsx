import {Products} from './products';
import type {ProductGroupClientType, ProductClientType} from "./products/types";
import {ErrorFallback} from "./error-fallback";

const INTERNAL_API = process.env.INTERNAL_API_URL || 'http://localhost:4000/api';

type ProductsServerProps = {
    alcoholIsVisible: boolean;
    hasError?: boolean;
}

type RawProduct = {
    _id: string | { toString(): string };
    name: string;
    description?: string | null;
    image?: string | null;
    prices?: Array<{ size: string; price: number }>;
    hidden?: boolean;
    isAlcohol?: boolean;
    order?: number;
};

type RawMenuGroup = {
    _id: string;
    name: string;
    order: number;
    showGroupTitle: boolean;
    subgroups: Array<{
        _id: string;
        name: string;
        order: number;
        showGroupTitle: boolean;
        products: RawProduct[];
    }>;
    directProducts: RawProduct[];
};

type MenuProductsResponse = {
    success: boolean;
    data: {
        groupedProducts: RawMenuGroup[];
        uncategorizedProduct: RawProduct[];
    };
};

const transformProduct = (p: RawProduct): ProductClientType => ({
    id: typeof p._id === 'string' ? p._id : p._id.toString(),
    name: p.name,
    description: p.description ?? null,
    image: p.image ?? null,
    prices: p.prices ?? [],
    hidden: p.hidden ?? false,
    isAlcohol: p.isAlcohol ?? false,
    order: p.order ?? 0,
});

export async function ProductsServer({alcoholIsVisible, hasError}: ProductsServerProps) {
    let grouped: ProductGroupClientType[] = [];
    let uncategorized: ProductClientType[] = [];
    let fetchError = hasError ?? false;

    try {
        const res = await fetch(`${INTERNAL_API}/menu/products?showAlcohol=${alcoholIsVisible}`, {
            next: {revalidate: 60},
        });

        if (res.ok) {
            const json: MenuProductsResponse = await res.json();
            if (json.success && json.data) {
                grouped = json.data.groupedProducts.map((group) => ({
                    id: group._id,
                    categoryName: group.name,
                    categoryOrder: group.order ?? 0,
                    showGroupTitle: group.showGroupTitle ?? true,
                    subgroups: group.subgroups.map((sub) => ({
                        id: sub._id,
                        name: sub.name,
                        order: sub.order ?? 0,
                        showGroupTitle: sub.showGroupTitle ?? true,
                        products: sub.products.map(transformProduct),
                    })),
                    directProducts: group.directProducts.map(transformProduct),
                }));

                uncategorized = json.data.uncategorizedProduct.map(transformProduct);
            }
        } else {
            fetchError = true;
        }
    } catch (error) {
        console.error('Failed to fetch menu products:', error);
        fetchError = true;
    }

    if (fetchError) {
        return <ErrorFallback />;
    }

    return <Products grouped={grouped} uncategorized={uncategorized}/>;
}