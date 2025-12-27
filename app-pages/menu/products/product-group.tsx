'use client';

import { Box, Heading, SimpleGrid, useBreakpointValue } from "@chakra-ui/react";
import type { ProductType } from "@/models/product";
import { Product } from "./product";
import { useVirtualizer } from "@tanstack/react-virtual";

type ProductGroupProps = {
    id?: string;
    title?: string;
    products: ProductType[];
};

export const ProductGroup = ({ id, title, products }: ProductGroupProps) => {
    const columnCount = useBreakpointValue({ base: 1, sm: 2, xl: 3 }) ?? 1;
    const rowCount = Math.ceil(products.length / columnCount);

    const virtualizer = useVirtualizer({
        count: rowCount,
        estimateSize: () => 400,
        getScrollElement: () => document.documentElement,
        overscan: 5,
    });

    if (!products.length) return null;

    return (
        <Box as="section" mb={12} id={id}>
            {title && (
                <Heading
                    as="h2"
                    fontSize={{ base: "2xl", md: "3xl" }}
                    mb={6}
                    color="teal.300"
                    borderBottom="2px solid"
                    borderColor="teal.500"
                    pb={2}
                >
                    {title}
                </Heading>
            )}

            <Box
                position="relative"
                w="100%"
                h={`${virtualizer.getTotalSize()}px`}
            >
                {virtualizer.getVirtualItems().map((virtualRow) => {
                    const rowStart = virtualRow.index * columnCount;
                    const rowEnd = Math.min(rowStart + columnCount, products.length);
                    const rowProducts = products.slice(rowStart, rowEnd);

                    return (
                        <Box
                            key={virtualRow.key}
                            ref={virtualizer.measureElement}
                            data-index={virtualRow.index}
                            position="absolute"
                            top={0}
                            left={0}
                            w="100%"
                            transform={`translateY(${virtualRow.start}px)`}
                            pb={6}  // Здесь добавлен вертикальный отступ (padding-bottom) между рядами продуктов
                        >
                            <SimpleGrid
                                columns={columnCount}
                                gap={6}
                                alignItems="stretch"
                            >
                                {rowProducts.map((product) => (
                                    <Product
                                        key={product.id.toString()}
                                        id={product.id.toString()}
                                        img={product.image}
                                        alt={product.name}
                                        title={product.name}
                                        description={product.description}
                                        prices={product.prices}
                                    />
                                ))}
                            </SimpleGrid>
                        </Box>
                    );
                })}
            </Box>
        </Box>
    );
};