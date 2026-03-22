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

const transformProduct = (p: RawProduct): ProductClientType => ({
    id: p._id.toString(),
    name: p.name,
    description: p.description ?? null,
    image: p.image ?? null,
    prices: p.prices ?? [],
    hidden: p.hidden ?? false,
    isAlcohol: p.isAlcohol ?? false,
    order: p.order ?? 0,
});

export async function ProductsServer({alcoholIsVisible}: ProductsServerProps) {
    const result = await getProducts({getAlcohol: alcoholIsVisible});

    const grouped: ProductGroupClientType[] = (result.groupedProducts as unknown as RawMenuGroup[]).map((group) => ({
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

    const uncategorized: ProductClientType[] = (result.uncategorizedProduct as unknown as RawProduct[]).map(transformProduct);

    return <Products grouped={grouped} uncategorized={uncategorized}/>;
}
