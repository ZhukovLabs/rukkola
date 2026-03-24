export type PortionPrice = {
    size: string;
    price: number;
};

export type ProductClientType = {
    id: string;
    name: string;
    description: string | null;
    image: string | null;
    prices: PortionPrice[];
    hidden?: boolean;
    isAlcohol?: boolean;
    order?: number;
};

export type SubgroupType = {
    id: string;
    name: string;
    order: number;
    showGroupTitle: boolean;
    products: ProductClientType[];
};

export type GroupWithProducts = {
    id: string;
    categoryName: string;
    categoryOrder: number;
    showGroupTitle: boolean;
    subgroups: SubgroupType[];
    directProducts: ProductClientType[];
};

export type ProductGroupClientType = GroupWithProducts;
