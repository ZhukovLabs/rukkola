import {Products} from './products';
import {getProducts} from "./config";
import type {ProductGroupClientType, ProductClientType} from "./products/types";

type ProductsServerProps = {
    alcoholIsVisible: boolean;
}

type RawProduct = {
    _id: { toString(): string };
    name: string;
    description?: string | null;
    image?: string | null;
    prices?: Array<{ size: string; price: number }>;
    hidden?: boolean;
    isAlcohol?: boolean;
};

type RawGroupedProduct = {
    _id: { toString(): string };
    categoryName: string;
    categoryOrder?: number;
    showGroupTitle?: boolean;
    products: RawProduct[];
};

export async function ProductsServer({alcoholIsVisible}: ProductsServerProps) {
    const result = await getProducts({getAlcohol: alcoholIsVisible});

    const grouped: ProductGroupClientType[] = (result.groupedProducts as unknown as RawGroupedProduct[]).map((group) => ({
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
            isAlcohol: p.isAlcohol ?? false,
        })),
    }));

    const uncategorized: ProductClientType[] = (result.uncategorizedProduct as unknown as RawProduct[]).map((p) => ({
        id: p._id.toString(),
        name: p.name,
        description: p.description ?? null,
        image: p.image ?? null,
        prices: p.prices ?? [],
        hidden: p.hidden ?? false,
        isAlcohol: p.isAlcohol ?? false,
    }));

    return <Products grouped={grouped} uncategorized={uncategorized}/>;
}
