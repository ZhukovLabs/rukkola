import {apiClient} from '@/lib/api/client';

type ProductResponse = {
    success: boolean;
    data: {
        id: string;
        image?: string;
        blurDataURL?: string;
        name: string;
        description?: string;
        tags?: Array<{text: string; color: string}>;
    };
};

export type Product = NonNullable<Awaited<ReturnType<typeof getProductById>>>;

export async function getProductById(id: string) {
    try {
        const res = await apiClient.get<ProductResponse>(`/menu/product/${id}`);
        if (!res.success || !res.data) return null;
        const d = res.data;
        return {
            id: d.id,
            image: d.image ?? null,
            blurDataURL: d.blurDataURL ?? null,
            name: d.name,
            description: d.description ?? null,
            tags: d.tags ?? null,
        };
    } catch {
        return null;
    }
}
