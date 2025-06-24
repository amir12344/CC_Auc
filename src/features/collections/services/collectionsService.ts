import { 
  allMockProducts, 
  trendingDeals, 
  featuredDeals, 
  moreDeals, 
  bargainListings, 
  amazonListings 
} from '@/src/mocks/productData'
import type { Collection, Product, CollectionFilters } from '../types/collections'

// Define proper category mappings to consolidate similar categories
const CATEGORY_MAPPINGS: Record<string, string> = {
  // Electronics consolidation
  'Electronics': 'Electronics',
  'Audio Gadgets': 'Electronics',
  'Mobile Electronics': 'Electronics',
  'Electronics Accessories': 'Electronics',
  'Computers': 'Electronics',
  
  // Appliances consolidation
  'Major Appliances': 'Appliances',
  'Home Appliances': 'Appliances',
  'Kitchen Tools': 'Appliances',
  
  // Fashion & Accessories consolidation
  'Fashion Accessory': 'Fashion & Accessories',
  'Wearable Accessory': 'Fashion & Accessories',
  
  // Footwear consolidation
  'Athletic Footwear': 'Footwear',
  'Performance Footwear': 'Footwear',
  'Outdoor Footwear': 'Footwear',
  
  // Beauty & Personal Care consolidation
  'Fragrance Beauty': 'Beauty & Personal Care',
  'Natural Skincare': 'Beauty & Personal Care',
  'Cosmetics Beauty': 'Beauty & Personal Care',
  
  // Home & Garden consolidation
  'Home Goods': 'Home & Garden',
  
  // Office & Business
  'Office Supplies': 'Office & Business',
  
  // General Merchandise (catch-all)
  'General Merchandise': 'General Merchandise'
}

// Define representative images for each consolidated category
const CATEGORY_IMAGES: Record<string, string> = {
  'Electronics': 'https://images.unsplash.com/photo-1596460107916-430662021049?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80', // TV
  'Appliances': 'https://images.unsplash.com/photo-1622434641406-a158123450f9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=704&q=80', // Dyson vacuum
  'Fashion & Accessories': 'https://images.unsplash.com/photo-1667284152823-0b07a791fb79?q=80&w=2126&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // Watch
  'Footwear': 'https://images.unsplash.com/photo-1563635419376-78d400e5588e?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // Hiking boots
  'Beauty & Personal Care': 'https://images.unsplash.com/photo-1618120508902-c8d05e7985ee?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // Skincare
  'Home & Garden': 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80', // Home goods
  'Furniture': 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80', // Furniture
  'Office & Business': 'https://images.unsplash.com/photo-1497493292307-31c376b6e479?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80', // Office supplies
  'General Merchandise': 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=580&q=80' // General
}

// Function to map original categories to consolidated ones
const mapCategory = (originalCategory: string): string => {
  return CATEGORY_MAPPINGS[originalCategory] || originalCategory
}

// Generate collections from existing product data with proper categorization
const generateCollections = (): Collection[] => {
  // Get unique consolidated categories from all products
  const categoryMap = new Map<string, { products: Product[], originalCategories: Set<string> }>()
  
  allMockProducts.forEach(product => {
    if (product.category) {
      const consolidatedCategory = mapCategory(product.category)
      const existing = categoryMap.get(consolidatedCategory)
      
      if (existing) {
        existing.products.push(product)
        existing.originalCategories.add(product.category)
      } else {
        categoryMap.set(consolidatedCategory, {
          products: [product],
          originalCategories: new Set([product.category])
        })
      }
    }
  })

  // Convert to collections array with proper images
  const collections: Collection[] = Array.from(categoryMap.entries()).map(([category, data]) => ({
    id: category.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and'),
    name: category,
    slug: category.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and'),
    description: `Browse our selection of ${category.toLowerCase()} products at discounted prices.`,
    image: CATEGORY_IMAGES[category] || data.products[0]?.image || '',
    productCount: data.products.length,
    categories: Array.from(data.originalCategories)
  }))

  // Add special collections
  const specialCollections: Collection[] = [
    {
      id: 'trending',
      name: 'Trending Now',
      slug: 'trending',
      description:
        "The most popular products right now. Don't miss out on these hot deals!",
      image: trendingDeals[0]?.image || '',
      productCount: trendingDeals.length,
      featured: true,
    },
    {
      id: 'featured',
      name: 'Featured Products',
      slug: 'featured',
      description: 'Handpicked products offering the best value and quality.',
      image: featuredDeals[0]?.image || '',
      productCount: featuredDeals.length,
      featured: true,
    },
    {
      id: 'bargain',
      name: 'Amazon or Walmart',
      slug: 'bargain',
      description: 'Bulk lots and pallet deals for maximum savings.',
      image: bargainListings[0]?.image || '',
      productCount: bargainListings.length,
      featured: true,
    },
    {
      id: 'amazon',
      name: 'Amazon Returns',
      slug: 'amazon',
      description: 'Quality products from Amazon returns and warehouse deals.',
      image: amazonListings[0]?.image || '',
      productCount: amazonListings.length,
    },
  ]

  return [...specialCollections, ...collections].sort((a, b) => {
    if (a.featured && !b.featured) return -1
    if (!a.featured && b.featured) return 1
    return b.productCount - a.productCount
  })
}

// Cache collections for performance
let cachedCollections: Collection[] | null = null

export const getCollections = async (): Promise<Collection[]> => {
  if (!cachedCollections) {
    cachedCollections = generateCollections()
  }
  return cachedCollections
}

export const getCollectionBySlug = async (slug: string): Promise<Collection | null> => {
  const collections = await getCollections()
  return collections.find(collection => collection.slug === slug) || null
}

/**
 * Get products for a specific collection with filtering support
 * 
 * FUNCTION FLOW:
 * 1. Determine product source based on collection slug
 * 2. Apply special event filtering if specified
 * 3. Apply standard filters (price, condition, etc.)
 * 4. Return filtered product array
 * 
 * SPECIAL EVENT SUPPORT (Phase 3.4):
 * - Supports URL parameters like ?specialEvent=clearance
 * - Filters products based on special attributes or labels
 * - Compatible with Overstock.com-style event filtering
 * 
 * @param slug - Collection category slug (e.g., 'electronics', 'trending')
 * @param filters - Optional filters including special events
 * @returns Promise resolving to filtered Product array
 */
export const getProductsByCollection = async (slug: string, filters?: CollectionFilters): Promise<Product[]> => {
  let products: Product[] = []

  // Get products based on collection type
  switch (slug) {
    case 'trending':
      products = [...trendingDeals]
      break
    case 'featured':
      products = [...featuredDeals]
      break
    case 'bargain':
      products = [...bargainListings]
      break
    case 'amazon':
      products = [...amazonListings]
      break
    default:
      // Category-based collection - now handles consolidated categories
      const categoryName = formatCategoryName(slug)
      const consolidatedCategory = Object.entries(CATEGORY_MAPPINGS).find(
        ([_, mapped]) => mapped === categoryName
      )
      
      if (consolidatedCategory) {
        // Find all products that map to this consolidated category
        products = allMockProducts.filter(product => 
          product.category && mapCategory(product.category) === categoryName
        )
      } else {
        // Fallback to direct category match
        products = allMockProducts.filter(product => 
          product.category === categoryName
        )
      }
      break
  }

  // Apply filters (including special events)
  if (filters) {
    products = applyFilters(products, filters)
  }

  return products
}

export const searchProducts = async (query: string, filters?: CollectionFilters): Promise<Product[]> => {
  const searchTerm = query.toLowerCase().trim()
  
  // If no search term but filters are applied, return all products with filters
  if (!searchTerm) {
    return applyFilters(allMockProducts, filters || {})
  }

  // Search in title, category, and retailer
  let results = allMockProducts.filter(product => 
    product.title.toLowerCase().includes(searchTerm) ||
    product.category?.toLowerCase().includes(searchTerm) ||
    product.retailer?.toLowerCase().includes(searchTerm)
  )

  // Apply additional filters
  if (filters) {
    results = applyFilters(results, filters)
  }

  return results
}

const applyFilters = (products: Product[], filters: CollectionFilters): Product[] => {
  let filtered = [...products]

  if (filters.priceRange) {
    const [min, max] = filters.priceRange
    filtered = filtered.filter(p => p.price >= min && p.price <= max)
  }

  if (filters.categories && filters.categories.length > 0) {
    filtered = filtered.filter(p => 
      p.category && filters.categories!.includes(p.category)
    )
  }

  if (filters.condition) {
    switch (filters.condition) {
      case 'refurbished':
        filtered = filtered.filter(p => p.isRefurbished)
        break
      case 'new':
        filtered = filtered.filter(p => !p.isRefurbished)
        break
    }
  }

  if (filters.discountRange) {
    const [min, max] = filters.discountRange
    filtered = filtered.filter(p => 
      p.discount && p.discount >= min && p.discount <= max
    )
  }

  if (filters.inStock) {
    filtered = filtered.filter(p => 
      p.unitsAvailable && p.unitsAvailable > 0
    )
  }

  // Brand/retailer filtering
  if (filters.retailer) {
    const retailerFilters = filters.retailer.split(',').map(r => r.toLowerCase().trim())
    filtered = filtered.filter(p => 
      p.retailer && retailerFilters.some(filter => 
        p.retailer!.toLowerCase().includes(filter)
      )
    )
  }

  // Phase 3.4: Special event filtering
  if (filters.specialEvent) {
    const events = Array.isArray(filters.specialEvent) 
      ? filters.specialEvent 
      : [filters.specialEvent]
    
    filtered = filtered.filter(p => {
      // Check for special event indicators in product data
      return events.some(event => {
        switch (event.toLowerCase()) {
          case 'clearance':
          case 'doorbusters':
            // Products with high discounts (>30%) qualify as clearance/doorbusters
            return p.discount && p.discount > 30
          case 'flash-sale':
            // Products marked with HOT label or almost gone qualify as flash sale
            return p.label === 'HOT' || p.isAlmostGone
          case 'refurbished-special':
            // Special refurbished deals
            return p.isRefurbished && p.discount && p.discount > 25
          default:
            // Check if event matches product label or category
            return p.label?.toLowerCase().includes(event.toLowerCase()) ||
                   p.category?.toLowerCase().includes(event.toLowerCase())
        }
      })
    })
  }

  // Apply sorting
  if (filters.sortBy) {
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'price-asc':
          return a.price - b.price
        case 'price-desc':
          return b.price - a.price
        case 'discount-desc':
          return (b.discount || 0) - (a.discount || 0)
        case 'newest':
          // For demo purposes, use price as proxy for newness
          return b.price - a.price
        case 'popularity':
          // Use units available as proxy for popularity
          return (b.unitsAvailable || 0) - (a.unitsAvailable || 0)
        default:
          return 0
      }
    })
  }

  return filtered
}

export const formatCategoryName = (slug: string): string => {
  return slug
    .split('-')
    .map(word => {
      // Handle special case for 'and'
      if (word === 'and') return '&'
      return word.charAt(0).toUpperCase() + word.slice(1)
    })
    .join(' ')
}

export const getUniqueCategories = async (): Promise<string[]> => {
  const categories = new Set<string>()
  allMockProducts.forEach(product => {
    if (product.category) {
      categories.add(product.category)
    }
  })
  return Array.from(categories).sort()
}

// Get price range for filtering
export const getPriceRange = async (): Promise<[number, number]> => {
  const prices = allMockProducts.map(p => p.price)
  return [Math.min(...prices), Math.max(...prices)]
} 