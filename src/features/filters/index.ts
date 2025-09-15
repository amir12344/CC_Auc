// Main filter sidebar component
export { PageSpecificFilterSidebar } from "./components/PageSpecificFilterSidebar";

// Individual filter components
export { CheckboxFilter } from "./components/CheckboxFilter";
export { PriceRangeFilter } from "./components/PriceRangeFilter";

// Filter utilities
export {
  extractPriceRange,
  extractCategories,
  extractSubcategories,
  extractListingFormats,
  generateNearYouFilterSections,
} from "./utils/filterExtractors";

export {
  applyFiltersToListings,
  getFilterOptionCounts,
  hasActiveFilters,
  createDefaultFilterState,
  resetAllFilters,
} from "./utils/filterApplicators";

// Types
export type {
  PageSpecificFilterState,
  FilterOption,
  FilterSection,
  PageContext,
  PageSpecificFilterSidebarProps,
} from "./types/filterTypes";
