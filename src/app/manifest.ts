import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Commerce Central - Surplus Inventory Marketplace',
    short_name: 'Commerce Central',
    description: 'Connect with trusted retailers to access premium surplus inventory and wholesale lots. The most trusted B2B surplus platform.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#202328',
    orientation: 'portrait-primary',
    scope: '/',
    lang: 'en-US',
    categories: ['business', 'wholesale', 'b2b', 'retail', 'inventory', 'marketplace', 'liquidation'],
    icons: [
      {
        src: '/favicon.ico',
        sizes: '16x16 32x32',
        type: 'image/x-icon',
      },
      {
        src: '/favicon-16x16.png',
        sizes: '16x16',
        type: 'image/png',
      },
      {
        src: '/favicon-32x32.png',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        src: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
      {
        src: '/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/commerce_central_logo.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
    ],
    shortcuts: [
      {
        name: 'Buyer Platform',
        short_name: 'Buyers',
        description: 'Access brand-approved excess inventory',
        url: '/website/buyer',
        icons: [
          {
            src: '/CC_opengraph.png',
            sizes: '192x192',
            type: 'image/png',
          },
        ],
      },
      {
        name: 'Seller Platform',
        short_name: 'Sellers',
        description: 'Sell excess inventory with brand protection',
        url: '/website/seller',
        icons: [
          {
            src: '/CC_opengraph.png',
            sizes: '192x192',
            type: 'image/png',
          },
        ],
      },
      {
        name: 'Early Access',
        short_name: 'Join',
        description: 'Request early access to the platform',
        url: '/earlyaccess',
        icons: [
          {
            src: '/CC_opengraph.png',
            sizes: '192x192',
            type: 'image/png',
          },
        ],
      },
    ],
    screenshots: [
      {
        src: '/CC_opengraph.png',
        sizes: '500x500',
        type: 'image/png',
        form_factor: 'wide',
        label: 'Commerce Central Homepage',
      },
    ],
    related_applications: [],
    prefer_related_applications: false,
  }
}