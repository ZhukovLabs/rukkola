import type {MetadataRoute} from 'next';

const INTERNAL_API = process.env.INTERNAL_API_URL || 'http://localhost:4000/api';

type RawProduct = {
    name: string;
    description?: string | null;
    image?: string | null;
};

type RawMenuGroup = {
    subgroups: Array<{ products: RawProduct[] }>;
    directProducts: RawProduct[];
};

type MenuProductsResponse = {
    success: boolean;
    data: {
        groupedProducts: RawMenuGroup[];
        uncategorizedProduct: RawProduct[];
    };
};

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://rukkola-gomel.by';

    const staticPages: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1.0,
        },
        {
            url: `${baseUrl}/faq`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/privacy`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.3,
        },
    ];

    try {
        const res = await fetch(`${INTERNAL_API}/menu/products?showAlcohol=false`);

        if (res.ok) {
            const json: MenuProductsResponse = await res.json();
            if (json.success && json.data) {
                const allProducts = [
                    ...(json.data.groupedProducts || []).flatMap((g: RawMenuGroup) => [
                        ...(g.directProducts || []),
                        ...(g.subgroups || []).flatMap((s) => s.products || []),
                    ]),
                    ...(json.data.uncategorizedProduct || []),
                ];

                const seen = new Set<string>();
                const images: string[] = [`${baseUrl}/og-image.webp`];

                for (const p of allProducts) {
                    if (p.image && !seen.has(p.image)) {
                        seen.add(p.image);
                        const imageUrl = p.image.startsWith('http') ? p.image : `${baseUrl}${p.image}`;
                        images.push(imageUrl);
                    }
                }

                staticPages[0].images = images;
            }
        }
    } catch (e) {
        console.error('Failed to fetch products for sitemap:', e);
    }

    return staticPages;
}
