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

type ProductCache = Map<string, Product>;
type TimestampCache = Map<string, number>;

const productCache: ProductCache = new Map();
const cacheTimeout = 5 * 60 * 1000;
const cacheTimestamp: TimestampCache = new Map();

export async function getProductById(id: string): Promise<Product | null> {
    const now = Date.now();
    const cached = productCache.get(id);
    const cachedTime = cacheTimestamp.get(id);

    if (cached && cachedTime && now - cachedTime < cacheTimeout) {
        return cached;
    }

    try {
        const res = await apiClient.get<ProductResponse>(`/menu/product/${id}`);
        if (res.success && res.data) {
            const data: Product = {
                id: res.data.id,
                image: res.data.image ?? null,
                blurDataURL: res.data.blurDataURL ?? null,
                name: res.data.name,
                description: res.data.description ?? null,
                tags: res.data.tags ?? null,
            };
            productCache.set(id, data);
            cacheTimestamp.set(id, now);
            return data;
        }
        return null;
    } catch {
        return null;
    }
}

export async function prefetchProduct(id: string): Promise<Product | null> {
    return getProductById(id);
}
