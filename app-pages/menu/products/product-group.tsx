import { Box, Heading, SimpleGrid } from "@chakra-ui/react";
import type { ProductType } from "@/models/product";
import { ProductWithSuspense } from "./product";

type ProductGroupProps = {
    id?: string;
    title?: string;
    products: ProductType[];
};

export const ProductGroup = ({ id, title, products }: ProductGroupProps) => {
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

            <SimpleGrid
                columns={{ base: 1, sm: 2, xl: 3, "2xl": 4 }}
                gap={6}
                alignItems="stretch"
            >
                {products.map((product) => (
                    <ProductWithSuspense
                        key={product._id.toString()}
                        id={product._id.toString()}
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
};