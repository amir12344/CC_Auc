/**
 * Navigation Integration Component
 *
 * PURPOSE:
 * Provides seamless navigation integration between the new collections system
 * and existing marketplace functionality. This component ensures consistent
 * user experience across all product discovery and browsing flows.
 *
 * INTEGRATION STRATEGY:
 * 1. URL Structure Consistency - Unified routing patterns across features
 * 2. State Management - Shared filter and navigation state
 * 3. User Flow Optimization - Smooth transitions between different sections
 * 4. Backward Compatibility - Maintains existing marketplace functionality
 * 5. SEO Optimization - Consistent metadata and URL structures
 *
 * NAVIGATION FLOWS:
 * 1. Homepage → Collections → Category → Product Details
 * 2. Homepage → Search → Results → Product Details
 * 3. Marketplace → Product Details (legacy flow)
 * 4. Collections ↔ Search (cross-navigation with filter persistence)
 * 5. Category Navigation (consistent across all contexts)
 *
 * URL STRUCTURE MAPPING:
 * - Homepage: `/` (with product sections and "View All" buttons)
 * - All Collections: `/collections` (overview of all categories)
 * - Category Collection: `/collections/[category]` (filtered products)
 * - Search Results: `/search?q=query&filters...` (search with filters)
 * - Marketplace: `/marketplace` (legacy marketplace page)
 * - Product Details: `/marketplace/product/[id]` (unified product pages)
 *
 * INTEGRATION POINTS:
 * - FilterSidebar: Works across collections and search
 * - ActiveFilterChips: Consistent filter display everywhere
 * - ProductGrid: Shared component for all product displays
 * - SearchBar: Unified search across all contexts
 * - Breadcrumbs: Context-aware navigation trails
 *
 * PERFORMANCE CONSIDERATIONS:
 * - Shared component instances to prevent re-mounting
 * - Filter state persistence across navigation
 * - Optimized data fetching with TanStack Query
 * - Preloading for predicted navigation paths
 */
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { createContext, ReactNode, useContext } from "react";

import { CollectionFilters } from "@/src/features/collections/types/collections";

// Extend CollectionFilters to include query for navigation compatibility
interface ProductFilters extends CollectionFilters {
  query?: string;
}

// =============================================================================
// NAVIGATION CONTEXT
// =============================================================================

/**
 * Navigation Context Interface
 *
 * Provides shared navigation state and utilities across the application.
 * This context ensures consistent behavior and state management for
 * navigation-related operations.
 */
interface NavigationContextType {
  // Current navigation state
  currentPath: string;
  currentSection:
    | "homepage"
    | "collections"
    | "marketplace"
    | "search"
    | "product";
  currentCategory?: string;
  currentQuery?: string;

  // Navigation utilities
  navigateToCollection: (category: string, filters?: ProductFilters) => void;
  navigateToSearch: (query: string, filters?: ProductFilters) => void;
  navigateToProduct: (productId: string, source?: string) => void;
  navigateToMarketplace: () => void;

  // Filter management
  currentFilters: ProductFilters;
  updateFilters: (filters: Partial<ProductFilters>) => void;
  clearFilters: (preserveQuery?: boolean) => void;

  // Breadcrumb generation
  getBreadcrumbs: () => BreadcrumbItem[];

  // Integration utilities
  getBackNavigationPath: () => string;
  isLegacyMarketplace: () => boolean;
  shouldRedirectToCollections: () => boolean;
}

/**
 * Breadcrumb Item Interface
 *
 * Represents a single breadcrumb navigation item with context awareness.
 */
interface BreadcrumbItem {
  label: string;
  href: string;
  current?: boolean;
  category?: string;
}

const NavigationContext = createContext<NavigationContextType | null>(null);

// =============================================================================
// NAVIGATION PROVIDER
// =============================================================================

/**
 * Navigation Provider Component
 *
 * Provides navigation context and utilities to all child components.
 * Manages navigation state, filter persistence, and routing logic.
 *
 * CONTEXT FEATURES:
 * - Automatic section detection based on current path
 * - Filter state management with URL synchronization
 * - Breadcrumb generation with context awareness
 * - Navigation utilities for consistent routing
 * - Legacy marketplace integration
 *
 * @param children - Child components that need navigation context
 */
export const NavigationProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  /**
   * Determine Current Navigation Section
   *
   * Analyzes the current pathname to determine which section of the
   * application the user is currently viewing. This enables context-aware
   * navigation and appropriate component rendering.
   */
  const getCurrentSection = (): NavigationContextType["currentSection"] => {
    if (pathname === "/") return "homepage";
    if (pathname.startsWith("/collections")) return "collections";
    if (pathname.startsWith("/search")) return "search";
    if (pathname.startsWith("/marketplace/product/")) return "product";
    if (pathname.startsWith("/marketplace")) return "marketplace";
    return "homepage"; // Default fallback
  };

  /**
   * Extract Current Category from URL
   *
   * Parses the current URL to extract category information for
   * collections and marketplace pages.
   */
  const getCurrentCategory = (): string | undefined => {
    if (pathname.startsWith("/collections/")) {
      return pathname.split("/collections/")[1]?.split("?")[0];
    }
    if (pathname.startsWith("/marketplace/category/")) {
      return pathname.split("/marketplace/category/")[1]?.split("?")[0];
    }
    return undefined;
  };

  /**
   * Parse Current Filters from URL
   *
   * Extracts filter parameters from the current URL and converts them
   * to the ProductFilters format for consistent state management.
   */
  const getCurrentFilters = (): ProductFilters => {
    const filters: ProductFilters = {};

    // Parse price range
    const price = searchParams.get("price");
    if (price) {
      const [min, max] = price.split("-").map(Number);
      if (!isNaN(min) && !isNaN(max)) {
        filters.priceRange = [min, max];
      }
    }

    // Parse condition
    const condition = searchParams.get("condition");
    if (condition) {
      filters.condition = condition as "new" | "refurbished" | "used";
    }

    // Parse discount range
    const discount = searchParams.get("discount");
    if (discount) {
      const [min, max] = discount.split("-").map(Number);
      if (!isNaN(min) && !isNaN(max)) {
        filters.discountRange = [min, max];
      }
    }

    // Parse special events
    const specialEvent = searchParams.get("specialEvent");
    if (specialEvent) {
      filters.specialEvents = specialEvent.split(",");
    }

    // Parse boolean filters
    if (searchParams.get("inStock") === "true") {
      filters.inStock = true;
    }

    // Parse sort option
    const sort = searchParams.get("sort");
    if (sort) {
      filters.sortBy = sort as ProductFilters["sortBy"];
    }

    // Parse search query
    const query = searchParams.get("q");
    if (query) {
      filters.query = query;
    }

    return filters;
  };

  /**
   * Navigate to Collection Category
   *
   * Navigates to a specific collection category with optional filters.
   * Maintains filter state and provides smooth transitions.
   *
   * @param category - Category slug to navigate to
   * @param filters - Optional filters to apply
   */
  const navigateToCollection = (category: string, filters?: ProductFilters) => {
    const params = new URLSearchParams();

    // Apply provided filters
    if (filters) {
      if (filters.priceRange) {
        params.set(
          "price",
          `${filters.priceRange[0]}-${filters.priceRange[1]}`
        );
      }
      if (filters.condition) {
        params.set("condition", filters.condition);
      }
      if (filters.discountRange) {
        params.set(
          "discount",
          `${filters.discountRange[0]}-${filters.discountRange[1]}`
        );
      }
      if (filters.specialEvents?.length) {
        params.set("specialEvent", filters.specialEvents.join(","));
      }
      if (filters.inStock) {
        params.set("inStock", "true");
      }
      if (filters.sortBy) {
        params.set("sort", filters.sortBy);
      }
    }

    const url = `/collections/${category}${params.toString() ? `?${params.toString()}` : ""}`;
    router.push(url);
  };

  /**
   * Navigate to Search Results
   *
   * Navigates to search results with query and optional filters.
   * Preserves search context and filter state.
   *
   * @param query - Search query string
   * @param filters - Optional filters to apply
   */
  const navigateToSearch = (query: string, filters?: ProductFilters) => {
    const params = new URLSearchParams();
    params.set("q", query);

    // Apply provided filters
    if (filters) {
      if (filters.priceRange) {
        params.set(
          "price",
          `${filters.priceRange[0]}-${filters.priceRange[1]}`
        );
      }
      if (filters.condition) {
        params.set("condition", filters.condition);
      }
      if (filters.discountRange) {
        params.set(
          "discount",
          `${filters.discountRange[0]}-${filters.discountRange[1]}`
        );
      }
      if (filters.specialEvents?.length) {
        params.set("specialEvent", filters.specialEvents.join(","));
      }
      if (filters.inStock) {
        params.set("inStock", "true");
      }
      if (filters.sortBy) {
        params.set("sort", filters.sortBy);
      }
    }

    const url = `/search?${params.toString()}`;
    router.push(url);
  };

  /**
   * Navigate to Product Details
   *
   * Navigates to product details page with source tracking for
   * proper back navigation and analytics.
   *
   * @param productId - Product ID to view
   * @param source - Source context for navigation tracking
   */
  const navigateToProduct = (productId: string, source?: string) => {
    const params = new URLSearchParams();
    if (source) {
      params.set("source", source);
    }

    const url = `/marketplace/product/${productId}${params.toString() ? `?${params.toString()}` : ""}`;
    router.push(url);
  };

  /**
   * Navigate to Marketplace
   *
   * Navigates to the legacy marketplace page. This function provides
   * backward compatibility while the new collections system is being adopted.
   */
  const navigateToMarketplace = () => {
    router.push("/marketplace");
  };

  /**
   * Update Current Filters
   *
   * Updates the current page's filters by merging with existing filters
   * and updating the URL parameters accordingly.
   *
   * @param newFilters - Partial filters to merge with current filters
   */
  const updateFilters = (newFilters: Partial<ProductFilters>) => {
    const currentFilters = getCurrentFilters();
    const mergedFilters = { ...currentFilters, ...newFilters };

    const params = new URLSearchParams();

    // Build URL parameters from merged filters
    if (mergedFilters.priceRange) {
      params.set(
        "price",
        `${mergedFilters.priceRange[0]}-${mergedFilters.priceRange[1]}`
      );
    }
    if (mergedFilters.condition) {
      params.set("condition", mergedFilters.condition);
    }
    if (mergedFilters.discountRange) {
      params.set(
        "discount",
        `${mergedFilters.discountRange[0]}-${mergedFilters.discountRange[1]}`
      );
    }
    if (mergedFilters.specialEvents?.length) {
      params.set("specialEvent", mergedFilters.specialEvents.join(","));
    }
    if (mergedFilters.inStock) {
      params.set("inStock", "true");
    }
    if (mergedFilters.sortBy) {
      params.set("sort", mergedFilters.sortBy);
    }
    if (mergedFilters.query) {
      params.set("q", mergedFilters.query);
    }

    // Update URL while preserving the current path structure
    const basePath = pathname.split("?")[0];
    const newUrl = `${basePath}${params.toString() ? `?${params.toString()}` : ""}`;
    router.push(newUrl);
  };

  /**
   * Clear All Filters
   *
   * Removes all filters from the current page while optionally
   * preserving the search query.
   *
   * @param preserveQuery - Whether to keep the search query
   */
  const clearFilters = (preserveQuery = false) => {
    const params = new URLSearchParams();

    if (preserveQuery) {
      const query = searchParams.get("q");
      if (query) {
        params.set("q", query);
      }
    }

    const basePath = pathname.split("?")[0];
    const newUrl = `${basePath}${params.toString() ? `?${params.toString()}` : ""}`;
    router.push(newUrl);
  };

  /**
   * Generate Breadcrumbs
   *
   * Creates context-aware breadcrumb navigation based on the current
   * location and navigation state.
   */
  const getBreadcrumbs = (): BreadcrumbItem[] => {
    const breadcrumbs: BreadcrumbItem[] = [{ label: "Home", href: "/" }];

    const section = getCurrentSection();
    const category = getCurrentCategory();
    const query = searchParams.get("q");

    switch (section) {
      case "collections":
        breadcrumbs.push({ label: "Collections", href: "/collections" });
        if (category) {
          breadcrumbs.push({
            label: formatCategoryName(category),
            href: `/collections/${category}`,
            current: true,
            category,
          });
        } else {
          breadcrumbs[breadcrumbs.length - 1].current = true;
        }
        break;

      case "search":
        if (query) {
          breadcrumbs.push({
            label: `Search: "${query}"`,
            href: `/search?q=${query}`,
            current: true,
          });
        } else {
          breadcrumbs.push({
            label: "Search",
            href: "/search",
            current: true,
          });
        }
        break;

      case "marketplace":
        breadcrumbs.push({
          label: "Home",
          href: "/marketplace",
          current: true,
        });
        break;

      case "product":
        // Add appropriate parent context based on source
        const source = searchParams.get("source");
        if (source === "collections" && category) {
          breadcrumbs.push({ label: "Collections", href: "/collections" });
          breadcrumbs.push({
            label: formatCategoryName(category),
            href: `/collections/${category}`,
          });
        } else if (source === "search" && query) {
          breadcrumbs.push({
            label: `Search: "${query}"`,
            href: `/search?q=${query}`,
          });
        } else {
          breadcrumbs.push({ label: "Home", href: "/marketplace" });
        }
        breadcrumbs.push({
          label: "Product Details",
          href: pathname,
          current: true,
        });
        break;
    }

    return breadcrumbs;
  };

  /**
   * Get Back Navigation Path
   *
   * Determines the appropriate back navigation path based on the
   * current context and source information.
   */
  const getBackNavigationPath = (): string => {
    const section = getCurrentSection();
    const source = searchParams.get("source");
    const category = getCurrentCategory();
    const query = searchParams.get("q");

    if (section === "product") {
      if (source === "collections" && category) {
        return `/collections/${category}`;
      }
      if (source === "search" && query) {
        return `/search?q=${query}`;
      }
      return "/marketplace"; // Default fallback
    }

    return "/"; // Default to homepage
  };

  /**
   * Check if Current Page is Legacy Marketplace
   *
   * Determines if the user is on the legacy marketplace page,
   * which may need special handling or migration prompts.
   */
  const isLegacyMarketplace = (): boolean => {
    return pathname === "/marketplace";
  };

  /**
   * Check if Should Redirect to Collections
   *
   * Determines if the current marketplace page should redirect
   * to the new collections system based on user preferences
   * and feature flags.
   */
  const shouldRedirectToCollections = (): boolean => {
    // For now, maintain backward compatibility
    // This can be updated based on user feedback and adoption metrics
    return false;
  };

  /**
   * Format Category Name
   *
   * Converts category slugs to user-friendly display names.
   */
  const formatCategoryName = (category: string): string => {
    return category
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Build context value
  const contextValue: NavigationContextType = {
    currentPath: pathname,
    currentSection: getCurrentSection(),
    currentCategory: getCurrentCategory(),
    currentQuery: searchParams.get("q") || undefined,

    navigateToCollection,
    navigateToSearch,
    navigateToProduct,
    navigateToMarketplace,

    currentFilters: getCurrentFilters(),
    updateFilters,
    clearFilters,

    getBreadcrumbs,
    getBackNavigationPath,
    isLegacyMarketplace,
    shouldRedirectToCollections,
  };

  return (
    <NavigationContext.Provider value={contextValue}>
      {children}
    </NavigationContext.Provider>
  );
};

// =============================================================================
// NAVIGATION HOOK
// =============================================================================

/**
 * Use Navigation Hook
 *
 * Custom hook for accessing navigation context and utilities.
 * Provides type-safe access to navigation state and functions.
 *
 * @returns NavigationContextType - Navigation context and utilities
 * @throws Error if used outside NavigationProvider
 */
export const useNavigation = (): NavigationContextType => {
  const context = useContext(NavigationContext);

  if (!context) {
    throw new Error("useNavigation must be used within a NavigationProvider");
  }

  return context;
};

// =============================================================================
// INTEGRATION UTILITIES
// =============================================================================

/**
 * Navigation Integration Utilities
 *
 * Standalone utility functions for navigation integration that can be
 * used outside of the React context system.
 */
export const NavigationUtils = {
  /**
   * Build Collection URL
   *
   * Constructs a properly formatted collection URL with filters.
   */
  buildCollectionUrl: (category: string, filters?: ProductFilters): string => {
    const params = new URLSearchParams();

    if (filters) {
      if (filters.priceRange) {
        params.set(
          "price",
          `${filters.priceRange[0]}-${filters.priceRange[1]}`
        );
      }
      if (filters.condition) {
        params.set("condition", filters.condition);
      }
      if (filters.discountRange) {
        params.set(
          "discount",
          `${filters.discountRange[0]}-${filters.discountRange[1]}`
        );
      }
      if (filters.specialEvents?.length) {
        params.set("specialEvent", filters.specialEvents.join(","));
      }
      if (filters.inStock) {
        params.set("inStock", "true");
      }
      if (filters.sortBy) {
        params.set("sort", filters.sortBy);
      }
    }

    return `/collections/${category}${params.toString() ? `?${params.toString()}` : ""}`;
  },

  /**
   * Build Search URL
   *
   * Constructs a properly formatted search URL with query and filters.
   */
  buildSearchUrl: (query: string, filters?: ProductFilters): string => {
    const params = new URLSearchParams();
    params.set("q", query);

    if (filters) {
      if (filters.priceRange) {
        params.set(
          "price",
          `${filters.priceRange[0]}-${filters.priceRange[1]}`
        );
      }
      if (filters.condition) {
        params.set("condition", filters.condition);
      }
      if (filters.discountRange) {
        params.set(
          "discount",
          `${filters.discountRange[0]}-${filters.discountRange[1]}`
        );
      }
      if (filters.specialEvents?.length) {
        params.set("specialEvent", filters.specialEvents.join(","));
      }
      if (filters.inStock) {
        params.set("inStock", "true");
      }
      if (filters.sortBy) {
        params.set("sort", filters.sortBy);
      }
    }

    return `/search?${params.toString()}`;
  },

  /**
   * Parse URL Filters
   *
   * Extracts filter parameters from a URL string.
   */
  parseUrlFilters: (url: string): ProductFilters => {
    const urlObj = new URL(url, "http://localhost");
    const params = urlObj.searchParams;
    const filters: ProductFilters = {};

    // Parse all filter parameters
    const price = params.get("price");
    if (price) {
      const [min, max] = price.split("-").map(Number);
      if (!isNaN(min) && !isNaN(max)) {
        filters.priceRange = [min, max];
      }
    }

    const condition = params.get("condition");
    if (condition) {
      filters.condition = condition as "new" | "refurbished" | "used";
    }

    const discount = params.get("discount");
    if (discount) {
      const [min, max] = discount.split("-").map(Number);
      if (!isNaN(min) && !isNaN(max)) {
        filters.discountRange = [min, max];
      }
    }

    const specialEvent = params.get("specialEvent");
    if (specialEvent) {
      filters.specialEvents = specialEvent.split(",");
    }

    if (params.get("inStock") === "true") {
      filters.inStock = true;
    }

    const sort = params.get("sort");
    if (sort) {
      filters.sortBy = sort as ProductFilters["sortBy"];
    }

    const query = params.get("q");
    if (query) {
      filters.query = query;
    }

    return filters;
  },
};

// Export the provider and hook for use in the application
export default NavigationProvider;
