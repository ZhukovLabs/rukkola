import {apiClient} from '@/lib/api/client';

type ProductResponse = {
    success: boolean;
    data: {
        id: string;
        image?: string;
        name: string;
        description?: string;
    };
};

export async function getProductById(id: string) {
    try {
        const res = await apiClient.get<ProductResponse>(`/menu/product/${id}`);
        if (res.success && res.data) {
            return {
                id: res.data.id,
                image: res.data.image ?? null,
                name: res.data.name,
                description: res.data.description ?? null,
            };
        }
        return null;
    } catch {
        return null;
    }
}
