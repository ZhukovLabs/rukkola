import {Products} from './products';
import {getProducts} from "./config";
import type {ProductGroupClientType, ProductClientType} from "./products/types";

type ProductsServerProps = {
    alcoholIsVisible: boolean;
}

type RawGroupedProduct = {
    _id: { toString(): string };
    categoryName: string;
    categoryOrder?: number;
    showGroupTitle?: boolean;
    products: Array<{
        _id: { toString(): string };
        name: string;
        description?: string | null;
        image?: string | null;
        prices?: Array<{ size: string; price: number }>;
        hidden?: boolean;
    }>;
};

type RawProduct = {
    _id: { toString(): string };
    name: string;
    description?: string | null;
    image?: string | null;
    prices?: Array<{ size: string; price: number }>;
    hidden?: boolean;
};

export async function ProductsServer({alcoholIsVisible}: ProductsServerProps) {
    const result = await getProducts({getAlcohol: alcoholIsVisible});

    const grouped: ProductGroupClientType[] = (result.groupedProducts as RawGroupedProduct[]).map((group) => ({
        id: group._id.toString(),
        categoryName: group.categoryName,
        categoryOrder: group.categoryOrder ?? 0,
        showGroupTitle: group.showGroupTitle ?? true,
        products: group.products.map((p): ProductClientType => ({
            id: p._id.toString(),
            name: p.name,
            description: p.description ?? null,
            image: p.image ?? null,
            prices: p.prices ?? [],
            hidden: p.hidden ?? false,
        })),
    }));

    const uncategorized: ProductClientType[] = (result.uncategorizedProduct as RawProduct[]).map((p) => ({
        id: p._id.toString(),
        name: p.name,
        description: p.description ?? null,
        image: p.image ?? null,
        prices: p.prices ?? [],
        hidden: p.hidden ?? false,
    }));

    return <Products grouped={grouped} uncategorized={uncategorized}/>;
}
