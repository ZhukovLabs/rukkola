import type {MetadataRoute} from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://rukkola-gomel.by';

    return {
        rules: [
            {
                userAgent: '*',
                allow: ['/', '/api/products/image/', '/api/lunches/image/'],
                disallow: ['/dashboard*', '/login*', '/api*', '/*.json$', '/_next/'],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
        host: baseUrl,
    };
}
