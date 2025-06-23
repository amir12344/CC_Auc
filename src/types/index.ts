export interface Seller {
  name: string
  logo: string
}

export interface Product {
  id: string
  title: string
  image: string
  price: number
  originalPrice?: number
  discount?: number
  shipping?: string
  daysLeft?: number
  isRefurbished?: boolean
  isAlmostGone?: boolean
  label?: string
  category: string
  retailer?: string
  seller?: Seller
  bids?: number
  timeLeft?: string
  description?: string
  condition?: string
  isNewArrival?: boolean
  isFeatured?: boolean
  isTrending?: boolean
  unitsAvailable?: number
  msrpDiscountPercent?: number
  // Additional properties for search and filtering
  stock?: number
  location?: string
  rating?: number
  reviewCount?: number
  date?: string
}
