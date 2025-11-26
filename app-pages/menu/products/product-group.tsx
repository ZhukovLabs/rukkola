import { Box, Heading, SimpleGrid } from "@chakra-ui/react";
import type { ProductType } from "@/models/product";
import { Product } from "./product";

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
                columns={{ base: 1, sm: 2, xl: 3 }}
                gap={6}
                alignItems="stretch"
            >
                {products.map((product) => (
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
};