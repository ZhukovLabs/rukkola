/** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl: process.env.SITE_URL || 'https://rukkola-production.up.railway.app',
    generateRobotsTxt: true,
    exclude: ['*'],
    additionalPaths: async () => [
        {
            loc: '/',
            lastmod: new Date().toISOString(),
            changefreq: 'daily',
            priority: 1.0,
        },
    ],
};
