/** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl: process.env.SITE_URL || 'https://rukkola-production.up.railway.app',
    generateRobotsTxt: true,
    
    changefreq: 'daily',
    priority: 0.7,
    sitemapBaseFileName: 'sitemap',
    
    exclude: [
        '/dashboard/**',
        '/api/**',
        '/login',
        '/404',
        '/_next/**',
    ],
    
    additionalMetaTags: [
        {
            tagName: 'meta',
            attributes: {
                name: 'robots',
                content: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
            },
        },
    ],
    
    additionalPaths: async () => [
        {
            loc: '/',
            lastmod: new Date().toISOString(),
            changefreq: 'daily',
            priority: 1.0,
            images: [
                {
                    loc: 'https://rukkola-production.up.railway.app/og-image.webp',
                    title: 'Кафе Руккола — пицца и суши в Гомеле',
                    caption: 'Уютное кафе в центре Гомеля с авторской пиццей и свежими суши',
                },
            ],
        },
    ],
    
    transform: async (config, path, field) => {
        if (path === '/') {
            return {
                ...field,
                priority: 1.0,
                changefreq: 'daily',
                lastmod: new Date().toISOString(),
            };
        }
        return field;
    },
    
    robotsTxtOptions: {
        policies: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/dashboard/**', '/api/', '/login'],
            },
            {
                userAgent: 'Googlebot',
                allow: '/',
            },
            {
                userAgent: 'Yandex',
                allow: '/',
            },
            {
                userAgent: 'Bingbot',
                allow: '/',
            },
        ],
        additionalSitemaps: [
            'https://rukkola-production.up.railway.app/sitemap.xml',
        ],
    },
    
    twitter: false,
    jsonSitemap: false,
    xml: true,
    outDir: 'public',
};
