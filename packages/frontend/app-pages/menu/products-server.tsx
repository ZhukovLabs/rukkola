import {serverFetch} from "@/lib/api/server-fetch";
import { Products } from './products';
import type {ProductGroupClientType, ProductClientType} from "./products/types";
import { ErrorFallback } from "./error-fallback";
import { generateMenuSchema, generateProductSchemas } from "./schema";

type ProductsServerProps = {
    alcoholIsVisible: boolean;
    hasError?: boolean;
}

type RawProduct = {
    _id: string | { toString(): string };
    name: string;
    description?: string | null;
    image?: string | null;
    blurDataURL?: string | null;
    prices?: Array<{ size: string; price: number }>;
    hidden?: boolean;
    isAlcohol?: boolean;
    order?: number;
    tags?: Array<{ text: string; color: string }>;
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

const toProductClient = (p: RawProduct): ProductClientType => ({
    id: typeof p._id === 'string' ? p._id : p._id.toString(),
    name: p.name,
    description: p.description ?? null,
    image: p.image ?? null,
    blurDataURL: p.blurDataURL ?? null,
    prices: p.prices ?? [],
    hidden: p.hidden ?? false,
    isAlcohol: p.isAlcohol ?? false,
    order: p.order ?? 0,
    tags: p.tags ?? null,
});

export async function ProductsServer({alcoholIsVisible, hasError}: ProductsServerProps) {
    if (hasError) return <ErrorFallback />;

    const json = await serverFetch<MenuProductsResponse>(
        `/menu/products?showAlcohol=${alcoholIsVisible}`
    );

    if (!json?.success) return <ErrorFallback />;

    const grouped: ProductGroupClientType[] = json.data.groupedProducts.map((group) => ({
        id: group._id,
        categoryName: group.name,
        categoryOrder: group.order ?? 0,
        showGroupTitle: group.showGroupTitle ?? true,
        subgroups: group.subgroups.map((sub) => ({
            id: sub._id,
            name: sub.name,
            order: sub.order ?? 0,
            showGroupTitle: sub.showGroupTitle ?? true,
            products: sub.products.map(toProductClient),
        })),
        directProducts: group.directProducts.map(toProductClient),
    }));

    const uncategorized = json.data.uncategorizedProduct.map(toProductClient);
    const menuSchema = generateMenuSchema(grouped);
    const productSchemas = generateProductSchemas(grouped);

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(menuSchema) }}
            />
            {productSchemas.map((schema) => (
                <script
                    key={schema.name}
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
                />
            ))}
            <Products grouped={grouped} uncategorized={uncategorized}/>
        </>
    );
}
