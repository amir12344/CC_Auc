import path from 'node:path'
import withBundleAnalyzer from '@next/bundle-analyzer'
import type { NextConfig } from 'next'

// Define regex patterns at the top level for better performance
const NODE_MODULES_PATTERN = /[\\/]node_modules[\\/]/
const FRAMEWORK_PATTERN =
  /[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription)[\\/]/
const PACKAGE_NAME_PATTERN = /[\\/]node_modules[\\/](.*?)([\\/]|$)/

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  onDemandEntries: {
    maxInactiveAge: 60 * 1000, // Keep pages in memory for 60 seconds (adjust as needed)
    pagesBufferLength: 5, // Buffer up to 5 pages
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
      {
        protocol: 'https',
        hostname:
          'amplify-d2th4a1f69j8pf-ma-commercecentralimagesbuc-fi8rdl1sky5r.s3-accelerate.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname:
          'amplify-d2th4a1f69j8pf-ma-commercecentralimagesbuc-fi8rdl1sky5r.s3.amazonaws.com',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  rewrites() {
    return Promise.resolve([
      { source: '/', destination: '/website' },
      { source: '/team', destination: '/website/team' },
      // Backwards-compatible paths for listing creation
      {
        source: '/seller/listing/create/lotListings',
        destination: '/seller/listing/create/lotlistings',
      },
      {
        source: '/seller/listing/create/unmanifested',
        destination: '/seller/listing/create/lotlistings',
      },
    ]);
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
    if (!(dev || isServer)) {
      // Enable tree shaking with Terser
      config.optimization.minimizer = config.optimization.minimizer || []
      config.optimization.minimize = true

      // Improved chunk splitting for better caching and performance
      config.optimization.splitChunks = {
        chunks: 'all',
        maxInitialRequests: 30,
        maxAsyncRequests: 30,
        minSize: 20_000,
        maxSize: 244_000, // ~240kb chunks for better loading
        cacheGroups: {
          // Group React and related packages
          framework: {
            test: FRAMEWORK_PATTERN,
            name: 'framework',
            chunks: 'all',
            priority: 40,
          },
          // Group large third-party libraries
          lib: {
            test: NODE_MODULES_PATTERN,
            name(module: { context: string }): string {
              // Get the name of the package
              const packageName: string =
                module.context.match(PACKAGE_NAME_PATTERN)?.[1] || 'libs'

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
      // Keep the list minimal and only include packages actually tree-shake well
      'lucide-react',
      'date-fns',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-navigation-menu',
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

export default bundleAnalyzer(nextConfig)
