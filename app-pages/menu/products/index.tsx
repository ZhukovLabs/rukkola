'use client';

import {memo} from 'react';
import {Box} from "@chakra-ui/react";
import {ProductGroup} from "./product-group";
import type {ProductClientType} from "./types";

type ProductsProps = {
    grouped: Array<{
        id: string;
        categoryName: string;
        categoryOrder: number;
        showGroupTitle: boolean;
        products: ProductClientType[];
    }>;
    uncategorized: ProductClientType[];
}

const ProductGroupMemo = memo(ProductGroup);

export const Products = memo(function Products({grouped, uncategorized}: ProductsProps) {
    return (
        <Box color="white" minH="100vh" p={2}>
            {grouped.map((cat) => (
                <ProductGroupMemo
                    key={cat.id}
                    id={cat.id}
                    title={cat.showGroupTitle ? cat.categoryName : undefined}
                    products={cat.products}
                />
            ))}

            {uncategorized.length > 0 && (
                <ProductGroupMemo title="Без категории" products={uncategorized}/>
            )}
        </Box>
    );
});
