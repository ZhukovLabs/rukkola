/** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl: process.env.SITE_URL || 'https://rukkola-gomel.by',
    generateRobotsTxt: true,

    changefreq: 'daily',
    priority: 0.7,
    sitemapBaseFileName: 'sitemap',

    exclude: [
        '/dashboard/**',
        '/dashboard/*',
        '/api/**',
        '/login',
        '/404',
        '/_next/**',
    ],

    transform: async (config, path) => {
        // Исключаем dashboard
        if (path.startsWith('/dashboard')) {
            return null;
        }

        // Для всех остальных страниц (кроме главной)
        return {
            loc: path,
            changefreq: config.changefreq,
            priority: config.priority,
            lastmod: new Date().toISOString(),
        };
    },

    // ← Явно добавляем главную страницу с изображением
    additionalPaths: async (config) => [
        {
            loc: '/',
            changefreq: 'daily',
            priority: 1.0,
            lastmod: new Date().toISOString(),
            images: [
                {
                    loc: 'https://rukkola-gomel.by/og-image.webp',
                    title: 'Кафе Руккола — пицца и суши в Гомеле',
                    caption: 'Уютное кафе в центре Гомеля с авторской пиццей и свежими суши',
                },
            ],
        },
    ],

    robotsTxtOptions: {
        policies: [
            {
                userAgent: '*',
                allow: ['/', '/privacy'],
                disallow: ['/dashboard/', '/dashboard/**', '/api/', '/login', '/404'],
            },
            {userAgent: 'Googlebot', allow: '/'},
            {userAgent: 'Yandex', allow: '/'},
            {userAgent: 'Bingbot', allow: '/'},
        ],
        additionalSitemaps: [
            'https://rukkola-gomel.by/sitemap.xml',
        ],
    },

    twitter: false,
    jsonSitemap: false,
    xml: true,
    outDir: 'public',
};