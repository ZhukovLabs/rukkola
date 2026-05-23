import {apiClient} from '@/lib/api/client';

type ProductResponse = {
    success: boolean;
    data: {
        id: string;
        image?: string;
        blurDataURL?: string;
        name: string;
        description?: string;
        tags?: Array<{ text: string; color: string }>;
    };
};

export type Product = {
    id: string;
    image: string | null;
    blurDataURL: string | null;
    name: string;
    description: string | null;
    tags?: { text: string; color: string }[] | null;
};

export async function getProductById(id: string): Promise<Product | null> {
    try {
        const res = await apiClient.get<ProductResponse>(`/menu/product/${id}`);
        if (res.success && res.data) {
            return {
                id: res.data.id,
                image: res.data.image ?? null,
                blurDataURL: res.data.blurDataURL ?? null,
                name: res.data.name,
                description: res.data.description ?? null,
                tags: res.data.tags ?? null,
            };
        }
        return null;
    } catch {
        return null;
    }
}
