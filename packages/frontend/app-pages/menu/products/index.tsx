'use client';

import {memo} from 'react';
import {Box, Heading} from "@chakra-ui/react";
import {ProductGroup} from "./product-group";
import type {ProductClientType, ProductGroupClientType} from "./types";

type ProductsProps = {
    grouped: ProductGroupClientType[];
    uncategorized: ProductClientType[];
}

const ProductGroupMemo = memo(ProductGroup);

const CategoryHeader = memo(function CategoryHeader({ title, id }: { title: string; id: string }) {
    return (
        <Box position="relative">
            <Box
                id={`section-${id}`}
                position="absolute"
                top="-80px"
                left={0}
                right={0}
            />
            <Heading
                as="h2"
                fontSize={{ base: "2xl", md: "3xl" }}
                mb={6}
                color="teal.300"
                borderBottom="2px solid"
                borderColor="teal.500"
                pb={2}
                id={id}
            >
                {title}
            </Heading>
        </Box>
    );
});

export const Products = memo(function Products({grouped, uncategorized}: ProductsProps) {
    return (
        <Box 
            color="white" 
            minH="100vh" 
            p={2}
            css={{
                WebkitOverflowScrolling: 'touch',
                overscrollBehavior: 'contain',
            }}
        >
            {grouped.map((cat) => (
                <Box as="section" mb={12} key={cat.id}>
                    {cat.showGroupTitle && (
                        <CategoryHeader title={cat.categoryName} id={cat.id} />
                    )}
                    {cat.subgroups.map((sub) => (
                        <ProductGroupMemo
                            key={sub.id}
                            id={sub.id}
                            title={sub.showGroupTitle ? sub.name : undefined}
                            products={sub.products}
                        />
                    ))}
                    {cat.directProducts.length > 0 && (
                        <ProductGroupMemo
                            key={`${cat.id}-direct`}
                            id={`${cat.id}-direct`}
                            products={cat.directProducts}
                        />
                    )}
                </Box>
            ))}

            {uncategorized.length > 0 && (
                <ProductGroupMemo title="Без категории" products={uncategorized}/>
            )}
        </Box>
    );
});
