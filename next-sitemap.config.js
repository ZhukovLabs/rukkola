/** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl: 'https://rukkola-production.up.railway.app',
    generateRobotsTxt: true,
    robotsTxtOptions: {
        policies: [{ userAgent: '*', allow: '/' }],
    },
};