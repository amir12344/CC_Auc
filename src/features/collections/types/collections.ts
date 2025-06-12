export interface Collection {
  id: string
  name: string
  slug: string
  description: string
  image: string
  productCount: number
  featured?: boolean
  categories?: string[]
}

export interface CollectionWithProducts extends Collection {
  products: Product[]
}

// Re-export Product type from the existing types
import type { Product } from '@/src/types'
export type { Product } from '@/src/types'

export interface CollectionFilters {
  priceRange?: [number, number]
  categories?: string[]
  condition?: 'new' | 'refurbished' | 'used'
  discountRange?: [number, number]
  inStock?: boolean
  inStockOnly?: boolean
  retailer?: string // For brand/retailer filtering
  sortBy?: 'price-asc' | 'price-desc' | 'discount-desc' | 'newest' | 'popularity'
  // Phase 3.4: Special event filtering support
  specialEvent?: string | string[] // e.g., 'clearance', 'doorbusters', 'flash-sale'
  specialEvents?: string[] // Alternative property name for consistency
}

export interface SearchFilters extends CollectionFilters {
  query: string
} 