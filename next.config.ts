import type { NextConfig } from "next";
import withBundleAnalyzer from '@next/bundle-analyzer';
import path from 'path'

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'source.unsplash.com' },
      { protocol: 'https', hostname: 'www.commerce-central.com' },
      { protocol: 'https', hostname: 'randomuser.me' },
      { protocol: 'https', hostname: 'upload.wikimedia.org' },
      { protocol: 'https', hostname: 'unsplash.com' },
      { protocol: 'https', hostname: 'plus.unsplash.com' },
      { protocol: 'https', hostname: 'images.pexels.com' },
      { protocol: 'https', hostname: 'drive.google.com' },
      { protocol: 'https', hostname: 'www.josiemaran.com' },
      { protocol: 'https', hostname: 'www.gosupps.com' },
      { protocol: 'https', hostname: 'i5.walmartimages.com' },
      { protocol: 'https', hostname: 'm.media-amazon.com' },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  async rewrites() {
    return [
      { source: '/', destination: '/website' },
      { source: '/team', destination: '/website/team' },
    ]
  },
  // Add performance optimizations
  reactStrictMode: true,
  output: 'standalone',
  poweredByHeader: false,
  compiler: {
    // Remove development properties in production
    reactRemoveProperties:
      process.env.NODE_ENV === 'production'
        ? { properties: ['^data-test'] }
        : false,
    // Remove console logs in production (except errors and warnings)
    removeConsole:
      process.env.NODE_ENV === 'production'
        ? { exclude: ['error', 'warn'] }
        : false,
  },

  // Enable tree shaking to reduce unused JavaScript
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Enable tree shaking with Terser
      config.optimization.minimizer = config.optimization.minimizer || []
      config.optimization.minimize = true

      // Improved chunk splitting for better caching and performance
      config.optimization.splitChunks = {
        chunks: 'all',
        maxInitialRequests: 30,
        maxAsyncRequests: 30,
        minSize: 20000,
        maxSize: 244000, // ~240kb chunks for better loading
        cacheGroups: {
          // Group React and related packages
          framework: {
            test: /[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription)[\\/]/,
            name: 'framework',
            chunks: 'all',
            priority: 40,
          },
          // Group large third-party libraries
          lib: {
            test: /[\\/]node_modules[\\/]/,
            name(module: { context: string }): string {
              // Get the name of the package
              const packageName: string =
                module.context.match(
                  /[\\/]node_modules[\\/](.*?)([\\/]|$)/
                )?.[1] || 'libs'

              // Group specific large packages separately
              if (['three', 'framer-motion'].includes(packageName)) {
                return `npm.${packageName}`
              }

              return 'libs'
            },
            priority: 30,
            chunks: 'all',
            minChunks: 2,
          },
          // Group smaller common modules
          commons: {
            name: 'commons',
            minChunks: 3,
            priority: 20,
          },
          // Default catch-all group
          default: {
            minChunks: 2,
            priority: 10,
            reuseExistingChunk: true,
          },
        },
      }
    }

    // Optimize development experience
    if (dev) {
      // Add memory cache for faster rebuilds
      config.cache = {
        type: 'filesystem',
        buildDependencies: {
          config: [__filename],
        },
        cacheDirectory: path.resolve('.next/cache/webpack'),
        maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
      }

      // Reduce development build time
      config.infrastructureLogging = {
        level: 'error',
      }
    }

    return config
  },
  // Configure performance optimizations
  experimental: {
    typedRoutes: false,
    // Optimize Fast Refresh
    optimizePackageImports: [
      'framer-motion',
      'react-icons',
      'three',
      '@tanstack/react-query',
      'date-fns',
      'lodash',
    ],
    // Use server actions with optimized settings
    serverActions: {
      bodySizeLimit: '2mb',
    },
    // Improve memory usage
    memoryBasedWorkersCount: true,
    // Optimize CSS loading
    optimizeCss: true,
    // Improve scroll restoration
    scrollRestoration: true,
  },
  // Add Turbopack configuration
  turbopack: {
    // Explicitly configure common extensions (often handled by default)
    resolveExtensions: ['.js', '.jsx', '.ts', '.tsx'],
  },
}

export default bundleAnalyzer(nextConfig);
