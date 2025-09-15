/**
 * Navigation & Filtering Shared Types
 *
 * PURPOSE:
 * Centralized type definitions for the navigation and filtering system across the application.
 * These types ensure consistency between components, services, and API integrations.
 *
 * TYPE HIERARCHY:
 * 1. Base Product Types - Core product structure with all possible properties
 * 2. Filter Types - Comprehensive filtering options for products and collections
 * 3. Navigation Types - Collection and category navigation structures
 * 4. API Response Types - Standardized response formats for data fetching
 * 5. Component Props Types - Reusable interface definitions for components
 *
 * INTEGRATION POINTS:
 * - Collections system (categories, special events, filtering)
 * - Search functionality (query parsing, result filtering)
 * - Product display (cards, grids, lists)
 * - URL state management (parameter serialization/deserialization)
 * - API services (request/response formats)
 *
 * DESIGN PRINCIPLES:
 * - Extensible: Easy to add new filter types and product properties
 * - Type-safe: Full TypeScript coverage with strict type checking
 * - Consistent: Unified naming conventions and structure patterns
 * - Maintainable: Clear documentation and logical grouping
 */
// =============================================================================
// BASE PRODUCT TYPES
// =============================================================================
// Import Product type from the canonical location to avoid duplication
import type { Product } from "@/src/types";

/**
 * Seller Information Interface
 *
 * Represents seller/retailer information associated with products.
 */
export interface Seller {
  id: string;
  name: string;
  rating?: number;
  reviewCount?: number;
  verified?: boolean;
  location?: string;
  logo?: string;
}

// =============================================================================
// FILTER TYPES
// =============================================================================

/**
 * Comprehensive Filter Interface
 *
 * Unified filter structure supporting all filtering scenarios across the platform.
 * Used by collections, search, and marketplace components.
 *
 * FILTER CATEGORIES:
 * - Range Filters: price, discount (min-max ranges)
 * - Select Filters: condition, category (single selection)
 * - Multi-Select: categories, specialEvents, tags (multiple selections)
 * - Boolean Filters: inStock, featured, trending
 * - Sorting: sortBy with direction options
 *
 * URL SERIALIZATION:
 * All filters can be serialized to/from URL parameters for:
 * - Bookmarking filtered views
 * - Sharing filtered collections
 * - Navigation state persistence
 * - SEO-friendly URLs
 */
export interface ProductFilters {
  // Range-based filters
  priceRange?: [number, number]; // [min, max] price range
  discountRange?: [number, number]; // [min, max] discount percentage

  // Single-selection filters
  condition?: "new" | "refurbished" | "used";
  category?: string;
  retailer?: string;

  // Multi-selection filters
  categories?: string[]; // Multiple category filtering
  specialEvents?: string[]; // e.g., ['clearance', 'doorbusters']
  tags?: string[]; // Product tags
  brands?: string[]; // Multiple brand filtering

  // Boolean filters
  inStock?: boolean; // Only show in-stock items
  inStockOnly?: boolean; // Alternative naming for consistency
  featured?: boolean; // Only featured products
  trending?: boolean; // Only trending products
  newArrivals?: boolean; // Only new arrivals

  // Sorting and ordering
  sortBy?: SortOption;
  sortOrder?: "asc" | "desc";

  // Search-specific
  query?: string; // Search query string
  searchInDescription?: boolean; // Include description in search

  // Special event filtering (Phase 3.4 compatibility)
  specialEvent?: string | string[]; // Legacy support for single/multiple events
}

/**
 * Sort Options Enum
 *
 * Standardized sorting options across all product displays.
 * Provides consistent sorting behavior and clear option labeling.
 */
export type SortOption =
  | "relevance" // Default for search results
  | "featured" // Featured products first
  | "price-asc" // Price: Low to High
  | "price-desc" // Price: High to Low
  | "discount-desc" // Highest Discount First
  | "discount-asc" // Lowest Discount First
  | "newest" // Newest arrivals first
  | "popularity" // Most popular first
  | "rating" // Highest rated first
  | "alphabetical" // A-Z alphabetical
  | "units-available"; // Most units available first

/**
 * Active Filter Display Type
 *
 * Represents a single active filter for display in filter chips/tags.
 * Used by ActiveFilterChips component to show removable filter indicators.
 */
export interface ActiveFilter {
  key: string; // Unique identifier for the filter
  label: string; // User-friendly display text
  value: string | number | boolean; // The actual filter value
  removeKey: string; // URL parameter key for removal
  removable?: boolean; // Whether this filter can be removed
  category?: string; // Filter category for grouping
}

// =============================================================================
// COLLECTION TYPES
// =============================================================================

/**
 * Collection Definition Interface
 *
 * Represents a curated collection or category of products.
 * Collections can be category-based (Electronics) or theme-based (Trending).
 */
export interface Collection {
  id: string;
  name: string;
  slug: string; // URL-friendly identifier
  description: string;
  image: string;
  productCount: number;
  featured?: boolean;

  // Collection metadata
  categories?: string[]; // Associated product categories
  tags?: string[]; // Collection tags for discovery

  // Display configuration
  displayType?: "grid" | "list" | "carousel";
  itemsPerPage?: number;

  // SEO and metadata
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
}

/**
 * Collection with Products
 *
 * Extended collection interface including the actual product data.
 * Used when displaying collection contents.
 */
export interface CollectionWithProducts extends Collection {
  products: Product[];
  appliedFilters?: ProductFilters;
  totalProducts?: number; // Total before filtering
  hasMore?: boolean; // Pagination indicator
}

// =============================================================================
// API RESPONSE TYPES
// =============================================================================

/**
 * Standardized API Response Format
 *
 * Consistent response structure for all product-related API calls.
 * Includes data, pagination, and metadata for comprehensive client handling.
 */
export interface ProductsResponse {
  products: Product[];
  pagination: PaginationInfo;
  filters?: {
    applied: ProductFilters;
    available: AvailableFilters;
  };
  metadata?: {
    totalProducts: number;
    searchQuery?: string;
    executionTime?: number;
    resultCount: number;
  };
}

/**
 * Pagination Information
 *
 * Standardized pagination data for consistent handling across components.
 */
export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Available Filters Response
 *
 * Provides information about available filter options based on current data set.
 * Used to populate filter UI with relevant options and counts.
 */
export interface AvailableFilters {
  categories: FilterOption[];
  brands: FilterOption[];
  conditions: FilterOption[];
  priceRange: {
    min: number;
    max: number;
  };
  discountRange: {
    min: number;
    max: number;
  };
  specialEvents: FilterOption[];
}

/**
 * Filter Option with Count
 *
 * Represents a single filter option with its availability count.
 * Used in filter dropdowns and checkboxes to show option relevance.
 */
export interface FilterOption {
  value: string;
  label: string;
  count: number; // Number of products matching this filter
  disabled?: boolean; // Whether this option is currently selectable
}

// =============================================================================
// COMPONENT PROPS TYPES
// =============================================================================

/**
 * Base Filter Component Props
 *
 * Common props interface for all filter-related components.
 * Ensures consistent API across FilterSidebar, ActiveFilterChips, etc.
 */
export interface BaseFilterProps {
  filters: ProductFilters;
  onFiltersChange: (filters: ProductFilters) => void;
  availableFilters?: AvailableFilters;
  className?: string;
  disabled?: boolean;
}

/**
 * Navigation Component Props
 *
 * Props for navigation components like breadcrumbs, category filters, etc.
 */
export interface NavigationProps {
  currentCategory?: string;
  currentCollection?: string;
  breadcrumbs?: BreadcrumbItem[];
  onNavigate?: (path: string) => void;
  className?: string;
}

/**
 * Breadcrumb Item
 *
 * Individual breadcrumb navigation item.
 */
export interface BreadcrumbItem {
  label: string;
  href: string;
  current?: boolean;
}

// =============================================================================
// URL STATE MANAGEMENT TYPES
// =============================================================================

/**
 * URL Search Parameters
 *
 * Type-safe representation of URL search parameters for filter state management.
 * Ensures consistent parameter naming and value formatting across the application.
 */
export interface URLSearchParams {
  // Search and category
  q?: string; // Search query
  category?: string; // Category filter

  // Range filters (serialized as "min-max")
  price?: string; // "100-500"
  discount?: string; // "20-50"

  // Single selection filters
  condition?: string; // "new" | "refurbished" | "used"
  sort?: string; // Sort option

  // Multi-selection filters (serialized as comma-separated)
  categories?: string; // "electronics,furniture"
  specialEvent?: string; // "clearance,doorbusters"
  brands?: string; // "apple,samsung"

  // Boolean filters (serialized as "true" | "false")
  inStock?: string;
  featured?: string;
  trending?: string;

  // Pagination
  page?: string;
  limit?: string;
}

/**
 * Filter URL Serialization Utilities Type
 *
 * Type definitions for utility functions that handle filter <-> URL conversion.
 */
export interface FilterURLUtils {
  filtersToURL: (filters: ProductFilters) => URLSearchParams;
  urlToFilters: (params: URLSearchParams) => ProductFilters;
  mergeFilters: (
    current: ProductFilters,
    updates: Partial<ProductFilters>
  ) => ProductFilters;
  clearFilters: (preserveQuery?: boolean) => ProductFilters;
}

// =============================================================================
// SEARCH TYPES
// =============================================================================

/**
 * Search Configuration
 *
 * Configuration options for search functionality across the platform.
 */
export interface SearchConfig {
  minQueryLength: number; // Minimum characters for search
  maxSuggestions: number; // Maximum search suggestions
  searchFields: (keyof Product)[]; // Fields to search in
  fuzzySearch: boolean; // Enable fuzzy matching
  searchHistory: boolean; // Enable search history
  autoComplete: boolean; // Enable autocomplete
}

/**
 * Search Suggestion
 *
 * Individual search suggestion item with metadata.
 */
export interface SearchSuggestion {
  query: string;
  type: "product" | "category" | "brand" | "history";
  count?: number; // Number of matching products
  highlighted?: string; // Query with highlighted matches
}

/**
 * Search Results Metadata
 *
 * Additional information about search results for display and analytics.
 */
export interface SearchMetadata {
  query: string;
  resultCount: number;
  executionTime: number;
  suggestions?: SearchSuggestion[];
  corrections?: string[]; // Suggested query corrections
  relatedQueries?: string[]; // Related search queries
}

// =============================================================================
// EXPORT CONSOLIDATION
// =============================================================================

// Legacy compatibility exports (maintain backward compatibility)
export type { ProductFilters as CollectionFilters };
export type { Product as ProductType };
export type { Collection as CollectionType };

// Re-export Product type for convenience
export type { Product };
