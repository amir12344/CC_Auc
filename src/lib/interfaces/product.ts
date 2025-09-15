export interface Product {
  id: string;
  title: string;
  price: string;
  originalPrice?: string;
  category: string;
  retailer: string;
  image: string;
  description: string;
  condition: string;
  isNew?: boolean;
  discount?: number;
  rating?: number;
  reviewCount?: number;
  bidding?: {
    isActive: boolean;
    currentBid: string;
    endTime: string;
  };
  manifest?: {
    units: number;
    condition: string;
    details: string;
  };
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
}

export interface ProductFilter {
  category?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  retailer?: string;
  condition?: string;
  bidding?: boolean;
}

export interface ProductBid {
  productId: string;
  userId: string;
  amount: string;
  timestamp: string;
}
