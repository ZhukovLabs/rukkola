import type {NextConfig} from "next";
import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
    enabled: process.env.ANALYZE === 'true',
});

const BACKEND_URL = process.env.INTERNAL_API_URL || 'http://localhost:4000/api';
// Strip trailing /api to get the backend base URL
const BACKEND_BASE = BACKEND_URL.replace(/\/api\/?$/, '');

const nextConfig: NextConfig = {
    output: 'standalone',
    allowedDevOrigins: ['192.168.0.120'],
    async rewrites() {
        return [
            {
                // Proxy product image requests to backend
                source: '/api/products/image/:filename*',
                destination: `${BACKEND_BASE}/api/products/image/:filename*`,
            },
            {
                // Proxy lunch image requests to backend
                source: '/api/lunches/image/:filename*',
                destination: `${BACKEND_BASE}/api/lunches/image/:filename*`,
            },
        ];
    },
    images: {
        remotePatterns: [{
          hostname: "*"
        }],
        formats: ['image/avif', 'image/webp'],
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
        minimumCacheTTL: 60 * 60 * 24,
    },
    compress: true,
    poweredByHeader: false,
    compiler: {
        removeConsole: false,
    },
    productionBrowserSourceMaps: false,
    experimental: {
        optimizePackageImports: ['@chakra-ui/react', 'framer-motion', 'react-icons', 'lucide-react'],
        scrollRestoration: true,
    },
    turbopack: {},
    webpack: (config, {isServer, dev}) => {
        if (!isServer && !dev) {
            config.optimization.splitChunks = {
                chunks: 'all',
                maxInitialRequests: 25,
                minSize: 20000,
                cacheGroups: {
                    default: false,
                    vendors: false,
                    commons: {
                        name: 'commons',
                        chunks: 'all',
                        minChunks: 2,
                    },
                    lib: {
                        test: /[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription)[\\/]/,
                        name: 'react-vendor',
                        chunks: 'all',
                        priority: 20,
                    },
                    chakra: {
                        test: /[\\/]node_modules[\\/]@chakra-ui[\\/]/,
                        name: 'chakra-vendor',
                        chunks: 'all',
                        priority: 15,
                    },
                    framer: {
                        test: /[\\/]node_modules[\\/]framer-motion[\\/]/,
                        name: 'framer-vendor',
                        chunks: 'all',
                        priority: 10,
                    },
                },
            };
        }
        return config;
    },
};

export default withBundleAnalyzer(nextConfig);
