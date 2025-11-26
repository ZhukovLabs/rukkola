import {Box} from "@chakra-ui/react";
import {ProductGroup} from "./product-group";
import {ProductType} from "@/models/product";

type ProductGroupClientType = {
    id: string;
    categoryName: string;
    categoryOrder: number;
    showGroupTitle: boolean;
    products: ProductType[];
};

type ProductsProps = {
    grouped: ProductGroupClientType[]
    uncategorized: ProductType[]
}

export const Products = ({grouped, uncategorized}: ProductsProps) => {
    return (
        <Box color="white" minH="100vh" p={2}>
            {grouped.map((cat) => (
                <ProductGroup
                    key={cat.id.toString()}
                    id={cat.id.toString()}
                    title={cat.showGroupTitle ? cat.categoryName : undefined}
                    products={cat.products}
                />
            ))}

            {uncategorized.length > 0 && (
                <ProductGroup title="Без категории" products={uncategorized}/>
            )}
        </Box>
    );
};
