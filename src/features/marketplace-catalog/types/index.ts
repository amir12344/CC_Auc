// Shared types for marketplace catalog functionality
export interface ProductVariant {
  id: string;
  imageUrl?: string;
  productName: string;
  variants: number;
  msrp: number;
  pricePerUnit: number;
  totalUnits: number;
  totalPrice: number;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  brand?: string;
  category?: string;
  imageUrl?: string;
  variants: ProductVariant[];
  featured?: boolean;
  onSale?: boolean;
  tags?: string[];
}



export interface SearchFilters {
  category?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  brands?: string[];
  tags?: string[];
  sortBy?: 'price' | 'name' | 'date' | 'popularity';
  sortOrder?: 'asc' | 'desc';
}

export interface MarketplaceState {
  products: Product[];
  filteredProducts: Product[];
  categories: string[];
  currentFilters: SearchFilters;
  loading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    itemsPerPage: number;
    totalItems: number;
  };
} 