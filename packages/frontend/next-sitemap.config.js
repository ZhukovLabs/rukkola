const INTERNAL_API = process.env.INTERNAL_API_URL || 'http://localhost:4000/api';

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
  additionalPaths: async (config) => {
    const images = [
      {
        loc: new URL(`${config.siteUrl}/og-image.webp`),
        title: 'Кафе Руккола — пицца и суши в Гомеле',
        caption: 'Уютное кафе в центре Гомеля с авторской пиццей и свежими суши',
      },
    ];

    try {
      const res = await fetch(`${INTERNAL_API}/menu/products?showAlcohol=false`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const allProducts = [
            ...(json.data.groupedProducts || []).flatMap(g => [
              ...(g.directProducts || []),
              ...(g.subgroups || []).flatMap(s => s.products || []),
            ]),
            ...(json.data.uncategorizedProduct || []),
          ];

          const seen = new Set();
          for (const p of allProducts) {
            if (p.image && !seen.has(p.image)) {
              seen.add(p.image);
              const imageUrl = p.image.startsWith('http') ? p.image : `${config.siteUrl}${p.image}`;
              images.push({
                loc: new URL(imageUrl),
                title: p.name,
                caption: p.description || p.name,
              });
            }
          }
        }
      }
    } catch (e) {
      console.error('Failed to fetch products for sitemap:', e);
    }

    return [
      {
        loc: '/',
        priority: 1.0,
        changefreq: 'daily',
        lastmod: new Date().toISOString(),
        images,
      },
    ];
  },
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/api/products/image/',
          '/api/lunches/image/',
        ],
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
