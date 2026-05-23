'use client';

import { Box, Heading, SimpleGrid } from "@chakra-ui/react";
import { Product } from "./product";
import type {ProductClientType} from "./types";

type ProductGroupProps = {
    id?: string;
    title?: string;
    products: ProductClientType[];
};

export function ProductGroup({ id, title, products }: ProductGroupProps) {
    if (!products.length) return null;

    return (
        <Box as="section" mb={12} id={id}>
            {title && (
                <Heading
                    as="h2"
                    fontSize={{ base: "3xl", md: "4xl" }}
                    mb={8}
                    color="white"
                    fontWeight="800"
                    letterSpacing="-0.03em"
                    display="flex"
                    alignItems="center"
                    gap={4}
                >
                    {title}
                    <Box flex={1} h="1px" bg="linear-gradient(to right, whiteAlpha.300, transparent)" />
                </Heading>
            )}

            <SimpleGrid columns={{ base: 1, sm: 2, xl: 3 }} gap={6} alignItems="stretch">
                {products.map((product) => (
                    <Product key={product.id} product={product} />
                ))}
            </SimpleGrid>
        </Box>
    );
}
