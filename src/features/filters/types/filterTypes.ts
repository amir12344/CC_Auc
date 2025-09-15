// Filter state interface for page-specific filters
export interface PageSpecificFilterState {
  priceRange: {
    min: number;
    max: number;
  };
  categories: string[]; // Category enums
  subcategories: string[]; // Subcategory enums
  listingFormats: ("catalog" | "auction" | "lot")[]; // Listing source types
  // Additional filters (to be implemented when API is enhanced)
  locations?: string[]; // Province codes
  brands?: string[]; // Brand names
  conditions?: string[]; // Condition enums
  packaging?: string[]; // Packaging enums
}

// Filter option structure for dropdown/checkbox lists
export interface FilterOption {
  value: string;
  label: string;
  count?: number; // Optional count for each option
}

// Filter section configuration
export interface FilterSection {
  id: string;
  title: string;
  type: "checkbox" | "range" | "multiselect";
  options?: FilterOption[];
  min?: number;
  max?: number;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

// Page context for filter sidebar
export interface PageContext {
  type:
    | "near-you"
    | "catalog"
    | "category"
    | "segment"
    | "private-offers"
    | "dynamic"
    | "search";
  value?: string; // For dynamic contexts like search query
  title?: string;
  hideCategories?: boolean; // Hide on category-specific pages
  specialFilters?: string[]; // Page-specific additional filters
}

// Props for the main filter sidebar component
export interface PageSpecificFilterSidebarProps {
  listings: any[]; // Will be typed based on the listing type used
  onFilteredListingsChange: (filteredListings: any[]) => void;
  pageContext: PageContext;
  className?: string;
}
