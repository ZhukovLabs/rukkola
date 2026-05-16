'use client';

import { memo } from "react";
import { Box, Heading, SimpleGrid } from "@chakra-ui/react";
import { Product } from "./product";
import type {ProductClientType} from "./types";

type ProductGroupProps = {
    id?: string;
    title?: string;
    products: ProductClientType[];
    startIndex?: number;
};

export const ProductGroup = memo(function ProductGroup({ id, title, products, startIndex = 0 }: ProductGroupProps) {
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

            <Box
                position="relative"
                w="100%"
            >
                <SimpleGrid
                    columns={{ base: 1, sm: 2, xl: 3 }}
                    gap={6}
                    alignItems="stretch"
                >
                    {products.map((product, index) => (
                        <Product
                            key={product.id}
                            index={startIndex + index}
                            id={product.id}
                            img={product.image}
                            blurDataURL={product.blurDataURL}
                            alt={product.name}
                            title={product.name}
                            description={product.description}
                            prices={product.prices}
                            tags={product.tags}
                        />
                    ))}
                </SimpleGrid>
            </Box>
        </Box>
    );
});
