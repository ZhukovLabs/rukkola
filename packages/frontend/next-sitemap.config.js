/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://rukkola-gomel.by',
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  sitemapSize: 1000,
  changefreq: 'daily',
  priority: 0.7,

  // Exclude administrative and technical pages from sitemap
  exclude: [
    '/dashboard',
    '/dashboard/**',
    '/api/**',
    '/login',
    '/404',
    '/_next/**',
  ],

  transform: async (config, path) => {
    // Custom exclusions
    if (
      path.startsWith('/dashboard') || 
      path.startsWith('/api') || 
      path === '/login' || 
      path === '/404'
    ) {
      return null
    }

    // We handle home page in additionalPaths to ensure it's always included with images
    if (path === '/') {
      return null
    }

    return {
      loc: path,
      changefreq: config.changefreq,
      priority: config.priority,
      lastmod: new Date().toISOString(),
    }
  },

  additionalPaths: async (config) => [
    {
      loc: '/',
      priority: 1.0,
      changefreq: 'daily',
      lastmod: new Date().toISOString(),
      // next-sitemap v4.x requires image.loc to have a .href property
      images: [
        {
          loc: new URL(`${config.siteUrl}/og-image.webp`),
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
        allow: '/',
        disallow: [
          '/dashboard',
          '/api',
          '/login',
          '/404',
          '/_next/',
        ],
      },
    ],
    additionalSitemaps: [
      `${process.env.SITE_URL || 'https://rukkola-gomel.by'}/sitemap.xml`,
    ],
  },
}
