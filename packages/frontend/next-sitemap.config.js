/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_BASE_URL || 'https://rukkola-gomel.by',
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  autoLastmod: true,
  changefreq: 'daily',
  exclude: [
    '/dashboard*',
    '/login*',
    '/api*',
    '/404',
    '/not-found'
  ],
  transform: async (config, path) => {
    if (path === '/') {
      return null;
    }

    let priority = 0.7;
    if (path === '/faq') {
      priority = 0.8;
    } else if (path === '/privacy') {
      priority = 0.3;
    }

    return {
      loc: path,
      changefreq: config.changefreq,
      priority: priority,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
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
          '/dashboard*',
          '/login*',
          '/api*',
          '/*.json$',
          '/_next/'
        ],
      },
      {
        userAgent: 'Yandex',
        cleanParam: 'utm_source&utm_medium&utm_campaign'
      }
    ],
    additionalSitemaps: [
      `${process.env.NEXT_PUBLIC_BASE_URL || 'https://rukkola-gomel.by'}/sitemap.xml`,
    ],
  },
}
