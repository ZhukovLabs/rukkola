import type {ProductType} from "@/models/product";

export type GroupWithProducts = {
    _id: string;
    categoryName: string;
    categoryOrder: number;
    showGroupTitle: boolean;
    products: ProductType[];
};