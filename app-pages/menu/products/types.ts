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

export type GroupWithProducts = {
    _id: string;
    categoryName: string;
    categoryOrder: number;
    showGroupTitle: boolean;
    products: ProductClientType[];
};

export type ProductGroupClientType = {
    id: string;
    categoryName: string;
    categoryOrder: number;
    showGroupTitle: boolean;
    products: ProductClientType[];
};
