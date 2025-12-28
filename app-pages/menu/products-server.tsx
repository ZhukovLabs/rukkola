import { Products } from './products';
import { getMenuData } from "./config";
import { ComponentProps } from "react";

export async function ProductsServer() {
    const { groupedProducts: groupedProductsRaw, uncategorizedProduct: uncategorizedProductRaw } = await getMenuData();

    const grouped = groupedProductsRaw.map(group => ({
        id: group._id.toString(),
        categoryName: group.categoryName,
        categoryOrder: group.categoryOrder ?? 0,
        showGroupTitle: group.showGroupTitle ?? true,
        products: group.products.map(p => ({
            id: p._id.toString(),
            name: p.name,
            description: p.description ?? null,
            image: p.image ?? null,
            prices: p.prices ?? [],
            hidden: p.hidden ?? false,
            categories: Array.isArray(p.categories) ? p.categories.map(String) : [],
        })),
    })) as unknown as ComponentProps<typeof Products>['grouped'];

    const uncategorized = uncategorizedProductRaw.map(p => ({
        id: p._id.toString(),
        name: p.name,
        description: p.description ?? null,
        image: p.image ?? null,
        prices: p.prices ?? [],
        hidden: p.hidden ?? false,
        categories: p.categories?.map(c => c.toString()) ?? [],
    })) as unknown as ComponentProps<typeof Products>['uncategorized'];

    return <Products grouped={grouped} uncategorized={uncategorized} />;
}