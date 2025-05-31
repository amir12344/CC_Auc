import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Buy & Sell Surplus Inventory | Commerce Central Liquidation Platform',
    short_name: 'Commerce Central',
    description: 'Buy and sell surplus inventory through trusted B2B liquidation auctions on Commerce Central. Verified sellers, clean manifests, and fast processing.',
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
        name: 'Buy Surplus & Returned Pallets Online | Commerce Central',
        short_name: 'Buyers',
        description: 'Shop verified surplus pallets with full manifests on Commerce Central. No junk, no surprises — just clean inventory from trusted sellers.',
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
        name: 'Liquidate Excess Inventory Easily | Commerce Central for Sellers',
        short_name: 'Sellers',
        description: 'Effortlessly liquidate your excess and returned inventory with Commerce Central. Sell wholesale pallets directly to verified buyers — no middlemen, no surprises. Faster processing, higher recovery, and full resale control',
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
        name: 'Trusted Access to Wholesale Pallets & Returns | Commerce Central',
        short_name: 'Early Access',
        description: 'Securely source surplus products and wholesale pallets from trusted sellers. Commerce Central connects resellers with verified inventory at scale.',
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