'use client';

import { memo } from "react";
import { Box, Heading, SimpleGrid } from "@chakra-ui/react";
import { Product } from "./product";
import type {ProductClientType} from "./types";

type ProductGroupProps = {
    id?: string;
    title?: string;
    products: ProductClientType[];
};

export const ProductGroup = memo(function ProductGroup({ id, title, products }: ProductGroupProps) {
    if (!products.length) return null;

    return (
        <Box as="section" mb={12} id={id}>
            {title && (
                <Heading
                    as="h2"
                    fontSize={{ base: "2xl", md: "3xl" }}
                    mb={6}
                    color="gray.300"
                    borderBottom="2px solid"
                    borderColor="gray.500"
                    pb={2}
                >
                    {title}
                </Heading>
            )}

            <Box
                position="relative"
                w="100%"
            >
                <SimpleGrid
                    columns={{ base: 1, sm: 2, xl: 3 }}
                    gap={6}
                    alignItems="stretch"
                >
                    {products.map((product) => (
                        <Product
                            key={product.id}
                            id={product.id}
                            img={product.image}
                            alt={product.name}
                            title={product.name}
                            description={product.description}
                            prices={product.prices}
                        />
                    ))}
                </SimpleGrid>
            </Box>
        </Box>
    );
});
