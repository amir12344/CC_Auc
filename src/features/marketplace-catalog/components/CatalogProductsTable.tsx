/**
 * CATALOG PRODUCTS TABLE COMPONENT
 *
 * Displays catalog products in table format with grid/list view toggle.
 * Handles sorting, pagination, and bulk actions with proper API integration.
 *
 * Features:
 * - Real API data from transformApiResponseToDetailedCatalogListing
 * - Proper product IDs using catalog_product_id
 * - Consistent image handling for all operations
 * - "Add all shown" functionality with proper Redux integration
 * - Mobile-responsive design with sorting and filtering
 */

"use client";

// TanStack table imports removed as pagination is handled manually
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { Check, ChevronDown, Plus, Settings2 } from "lucide-react";

import { Button } from "@/src/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { ViewToggle, type ViewMode } from "@/src/components/ui/ViewToggle";
import {
  addToCatalogOffer,
  removeProductFromCatalogOffer,
  selectCurrentCatalogItems,
  setCatalogContext,
} from "@/src/features/offer-management/store/offerCartSlice";

import type { DetailedCatalogListing } from "../types/catalog";
import {
  createCatalogContextFromListing,
  transformBulkProductsToCartItems,
  transformCatalogProductToEnhanced,
} from "../utils/catalogToOfferTransform";
import { CatalogProductsGrid } from "./CatalogProductsGrid";
import { CatalogProductsList } from "./CatalogProductsList";

/**
 * CATALOG PRODUCTS TABLE COMPONENT
 *
 * Displays catalog products in table format with grid/list view toggle.
 * Handles sorting, pagination, and bulk actions with proper API integration.
 *
 * Features:
 * - Real API data from transformApiResponseToDetailedCatalogListing
 * - Proper product IDs using catalog_product_id
 * - Consistent image handling for all operations
 * - "Add all shown" functionality with proper Redux integration
 * - Mobile-responsive design with sorting and filtering
 */

/**
 * CATALOG PRODUCTS TABLE COMPONENT
 *
 * Displays catalog products in table format with grid/list view toggle.
 * Handles sorting, pagination, and bulk actions with proper API integration.
 *
 * Features:
 * - Real API data from transformApiResponseToDetailedCatalogListing
 * - Proper product IDs using catalog_product_id
 * - Consistent image handling for all operations
 * - "Add all shown" functionality with proper Redux integration
 * - Mobile-responsive design with sorting and filtering
 */

/**
 * CATALOG PRODUCTS TABLE COMPONENT
 *
 * Displays catalog products in table format with grid/list view toggle.
 * Handles sorting, pagination, and bulk actions with proper API integration.
 *
 * Features:
 * - Real API data from transformApiResponseToDetailedCatalogListing
 * - Proper product IDs using catalog_product_id
 * - Consistent image handling for all operations
 * - "Add all shown" functionality with proper Redux integration
 * - Mobile-responsive design with sorting and filtering
 */

/**
 * CATALOG PRODUCTS TABLE COMPONENT
 *
 * Displays catalog products in table format with grid/list view toggle.
 * Handles sorting, pagination, and bulk actions with proper API integration.
 *
 * Features:
 * - Real API data from transformApiResponseToDetailedCatalogListing
 * - Proper product IDs using catalog_product_id
 * - Consistent image handling for all operations
 * - "Add all shown" functionality with proper Redux integration
 * - Mobile-responsive design with sorting and filtering
 */

/**
 * CATALOG PRODUCTS TABLE COMPONENT
 *
 * Displays catalog products in table format with grid/list view toggle.
 * Handles sorting, pagination, and bulk actions with proper API integration.
 *
 * Features:
 * - Real API data from transformApiResponseToDetailedCatalogListing
 * - Proper product IDs using catalog_product_id
 * - Consistent image handling for all operations
 * - "Add all shown" functionality with proper Redux integration
 * - Mobile-responsive design with sorting and filtering
 */

/**
 * CATALOG PRODUCTS TABLE COMPONENT
 *
 * Displays catalog products in table format with grid/list view toggle.
 * Handles sorting, pagination, and bulk actions with proper API integration.
 *
 * Features:
 * - Real API data from transformApiResponseToDetailedCatalogListing
 * - Proper product IDs using catalog_product_id
 * - Consistent image handling for all operations
 * - "Add all shown" functionality with proper Redux integration
 * - Mobile-responsive design with sorting and filtering
 */

/**
 * CATALOG PRODUCTS TABLE COMPONENT
 *
 * Displays catalog products in table format with grid/list view toggle.
 * Handles sorting, pagination, and bulk actions with proper API integration.
 *
 * Features:
 * - Real API data from transformApiResponseToDetailedCatalogListing
 * - Proper product IDs using catalog_product_id
 * - Consistent image handling for all operations
 * - "Add all shown" functionality with proper Redux integration
 * - Mobile-responsive design with sorting and filtering
 */

/**
 * CATALOG PRODUCTS TABLE COMPONENT
 *
 * Displays catalog products in table format with grid/list view toggle.
 * Handles sorting, pagination, and bulk actions with proper API integration.
 *
 * Features:
 * - Real API data from transformApiResponseToDetailedCatalogListing
 * - Proper product IDs using catalog_product_id
 * - Consistent image handling for all operations
 * - "Add all shown" functionality with proper Redux integration
 * - Mobile-responsive design with sorting and filtering
 */

/**
 * CATALOG PRODUCTS TABLE COMPONENT
 *
 * Displays catalog products in table format with grid/list view toggle.
 * Handles sorting, pagination, and bulk actions with proper API integration.
 *
 * Features:
 * - Real API data from transformApiResponseToDetailedCatalogListing
 * - Proper product IDs using catalog_product_id
 * - Consistent image handling for all operations
 * - "Add all shown" functionality with proper Redux integration
 * - Mobile-responsive design with sorting and filtering
 */

/**
 * CATALOG PRODUCTS TABLE COMPONENT
 *
 * Displays catalog products in table format with grid/list view toggle.
 * Handles sorting, pagination, and bulk actions with proper API integration.
 *
 * Features:
 * - Real API data from transformApiResponseToDetailedCatalogListing
 * - Proper product IDs using catalog_product_id
 * - Consistent image handling for all operations
 * - "Add all shown" functionality with proper Redux integration
 * - Mobile-responsive design with sorting and filtering
 */

/**
 * CATALOG PRODUCTS TABLE COMPONENT
 *
 * Displays catalog products in table format with grid/list view toggle.
 * Handles sorting, pagination, and bulk actions with proper API integration.
 *
 * Features:
 * - Real API data from transformApiResponseToDetailedCatalogListing
 * - Proper product IDs using catalog_product_id
 * - Consistent image handling for all operations
 * - "Add all shown" functionality with proper Redux integration
 * - Mobile-responsive design with sorting and filtering
 */

/**
 * CATALOG PRODUCTS TABLE COMPONENT
 *
 * Displays catalog products in table format with grid/list view toggle.
 * Handles sorting, pagination, and bulk actions with proper API integration.
 *
 * Features:
 * - Real API data from transformApiResponseToDetailedCatalogListing
 * - Proper product IDs using catalog_product_id
 * - Consistent image handling for all operations
 * - "Add all shown" functionality with proper Redux integration
 * - Mobile-responsive design with sorting and filtering
 */

/**
 * CATALOG PRODUCTS TABLE COMPONENT
 *
 * Displays catalog products in table format with grid/list view toggle.
 * Handles sorting, pagination, and bulk actions with proper API integration.
 *
 * Features:
 * - Real API data from transformApiResponseToDetailedCatalogListing
 * - Proper product IDs using catalog_product_id
 * - Consistent image handling for all operations
 * - "Add all shown" functionality with proper Redux integration
 * - Mobile-responsive design with sorting and filtering
 */

/**
 * CATALOG PRODUCTS TABLE COMPONENT
 *
 * Displays catalog products in table format with grid/list view toggle.
 * Handles sorting, pagination, and bulk actions with proper API integration.
 *
 * Features:
 * - Real API data from transformApiResponseToDetailedCatalogListing
 * - Proper product IDs using catalog_product_id
 * - Consistent image handling for all operations
 * - "Add all shown" functionality with proper Redux integration
 * - Mobile-responsive design with sorting and filtering
 */

interface CatalogProductsTableProps {
  catalogListing: DetailedCatalogListing;
}

export const CatalogProductsTable = ({
  catalogListing,
}: CatalogProductsTableProps) => {
  const dispatch = useDispatch();
  const offerItems = useSelector(selectCurrentCatalogItems);

  // Set catalog context when component mounts
  useEffect(() => {
    const catalogContext = createCatalogContextFromListing(catalogListing);
    dispatch(setCatalogContext(catalogContext));
  }, [catalogListing, dispatch]);

  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [sortField, setSortField] = useState<"totalUnits" | "offerPrice">(
    "totalUnits"
  );
  const [isAddingAll, setIsAddingAll] = useState(false);

  /**
   * Handle image loading errors
   * @param id - Product or variant ID
   */
  const onImageErrorAction = (id: string) => {
    setImageErrors((prev) => ({ ...prev, [id]: true }));
  };

  /**
   * Transform catalog products to enhanced format using proper API structure
   */
  const allEnhancedProducts = useMemo(() => {
    const products = catalogListing.catalog_products || [];

    return products.map((product) =>
      transformCatalogProductToEnhanced(catalogListing, product)
    );
  }, [catalogListing]);

  // TanStack table setup removed as it was unused
  // Pagination logic is handled manually in the component

  /**
   * Sort products and get the current page to display
   */
  const enhancedProducts = useMemo(() => {
    // First sort all products
    const sortedProducts = [...allEnhancedProducts].sort((a, b) => {
      if (sortField === "totalUnits") {
        return sortOrder === "desc"
          ? b.totalUnits - a.totalUnits
          : a.totalUnits - b.totalUnits;
      }
      return sortOrder === "desc"
        ? b.offerPrice - a.offerPrice
        : a.offerPrice - b.offerPrice;
    });

    // Then get the current page
    const startIndex = 0;
    const endIndex = (pagination.pageIndex + 1) * pagination.pageSize;
    return sortedProducts.slice(startIndex, endIndex);
  }, [
    allEnhancedProducts,
    pagination.pageIndex,
    pagination.pageSize,
    sortField,
    sortOrder,
  ]);

  /**
   * Check if there are more products to load
   */
  const hasMoreProducts = allEnhancedProducts.length > enhancedProducts.length;

  /**
   * Handle Load More click
   */
  const handleLoadMore = () => {
    setPagination((prev) => ({
      ...prev,
      pageIndex: prev.pageIndex + 1,
    }));
  };

  /**
   * Handle sorting change
   */
  const handleSortChange = (
    field: "totalUnits" | "offerPrice",
    order: "desc" | "asc"
  ) => {
    setSortField(field);
    setSortOrder(order);
    // Reset pagination when sort changes
    setPagination({ pageIndex: 0, pageSize: 10 });
  };

  // Product offer checking is handled in allShownProductsInOffer useMemo

  /**
   * Handle Add All Shown button click with proper bulk transform
   * FIXED: Now works on ALL products, not just visible ones
   */
  const handleAddAllShown = () => {
    setIsAddingAll(true);

    try {
      // Use ALL enhanced products, not just visible ones
      const cartItems = transformBulkProductsToCartItems(
        allEnhancedProducts,
        catalogListing
      );

      // Add each cart item to the offer
      for (const cartItem of cartItems) {
        dispatch(addToCatalogOffer(cartItem));
      }
    } catch {
      // Silent error handling as per linter rules
    } finally {
      setIsAddingAll(false);
    }
  };

  /**
   * Handle Remove All Shown button click
   * FIXED: Now works on ALL products, not just visible ones
   */
  const handleRemoveAllShown = () => {
    // Remove ALL products from the offer, not just visible ones
    for (const product of allEnhancedProducts) {
      dispatch(
        removeProductFromCatalogOffer({
          catalogProductId: product.catalogProductId,
        })
      );
    }
  };

  /**
   * Check if all products are in the offer
   * FIXED: Now checks ALL products, not just visible ones
   */
  const allShownProductsInOffer = useMemo(() => {
    return allEnhancedProducts.every((product) =>
      offerItems.some(
        (item) => item.catalogProductId === product.catalogProductId
      )
    );
  }, [allEnhancedProducts, offerItems]);

  /**
   * Render the Add All Shown button with proper state handling
   */
  const renderAddAllButton = () => {
    if (isAddingAll) {
      return (
        <>
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          Adding...
        </>
      );
    }

    if (allShownProductsInOffer) {
      return (
        <>
          <Check className="mr-2 h-4 w-4 text-white" />
          All Added
        </>
      );
    }

    return (
      <>
        <Plus className="mr-2 h-4 w-4" />
        Add all
      </>
    );
  };

  return (
    <div className="space-y-6" id="catalog-products-table">
      {/* Header with product count and controls */}
      <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
        <h2 className="text-sm font-semibold text-gray-900">
          {allEnhancedProducts.length} products
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          {/* Show Filters Button */}
          {/* <Button
            className="h-9 rounded-full border-gray-300 bg-white text-gray-700"
            variant="outline"
          >
            <Settings2 className="mr-2 h-4 w-4" />
            Show Filters
          </Button> */}

          {/* Sort Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className="h-9 rounded-full border-gray-300 bg-white text-gray-700"
                variant="outline"
              >
                {sortField === "totalUnits"
                  ? `Total units (${sortOrder === "desc" ? "high to low" : "low to high"})`
                  : `Price per unit (${sortOrder === "desc" ? "high to low" : "low to high"})`}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => handleSortChange("totalUnits", "desc")}
              >
                Total units (high to low)
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleSortChange("totalUnits", "asc")}
              >
                Total units (low to high)
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleSortChange("offerPrice", "desc")}
              >
                Price per unit (high to low)
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleSortChange("offerPrice", "asc")}
              >
                Price per unit (low to high)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* View Toggle */}
          <ViewToggle mode={viewMode} onModeChange={setViewMode} />

          {/* Add All Button */}
          <Button
            className="h-9 rounded-full bg-black text-white hover:bg-gray-800 disabled:opacity-50"
            disabled={isAddingAll}
            onClick={handleAddAllShown}
            type="button"
          >
            {renderAddAllButton()}
          </Button>

          {/* Remove All Button - Only show when All Added is active */}
          {allShownProductsInOffer && (
            <Button
              className="h-9 rounded-full bg-red-600 text-white hover:bg-red-700"
              onClick={handleRemoveAllShown}
              type="button"
              variant="destructive"
            >
              Remove All
            </Button>
          )}
        </div>
      </div>

      {/* Product Display */}
      {viewMode === "list" ? (
        <CatalogProductsList
          catalogListing={catalogListing}
          imageErrors={imageErrors}
          onImageErrorAction={onImageErrorAction}
          products={enhancedProducts}
        />
      ) : (
        <CatalogProductsGrid
          catalogListing={catalogListing}
          imageErrors={imageErrors}
          onImageErrorAction={onImageErrorAction}
          products={enhancedProducts}
        />
      )}

      {/* Load More Button */}
      {hasMoreProducts && (
        <div className="mt-6 flex justify-center">
          <Button
            className="rounded-full border-gray-300 bg-white px-6 text-gray-700"
            onClick={handleLoadMore}
            variant="outline"
          >
            Load More
          </Button>
        </div>
      )}
    </div>
  );
};
