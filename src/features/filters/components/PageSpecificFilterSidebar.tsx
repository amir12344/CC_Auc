"use client";

import React, { useEffect, useMemo, useState } from "react";

import type { CombinedListing } from "@/src/features/marketplace-catalog/types/combined-listing";

import type {
  PageContext,
  PageSpecificFilterState,
} from "../types/filterTypes";
import {
  applyFiltersToListings,
  createDefaultFilterState,
  hasActiveFilters,
  resetAllFilters,
} from "../utils/filterApplicators";
import {
  generateCatalogFilterSections,
  generateCategoryFilterSections,
  generateNearYouFilterSections,
  generatePrivateOffersFilterSections,
  generateSegmentFilterSections,
} from "../utils/filterExtractors";
import { generateSearchFilterSections } from "../utils/searchFilterExtractor";
import { CheckboxFilter } from "./CheckboxFilter";
import { PriceRangeFilter } from "./PriceRangeFilter";

interface PageSpecificFilterSidebarProps {
  listings: CombinedListing[];
  onFilteredListingsChangeAction: (filteredListings: CombinedListing[]) => void;
  pageContext: PageContext;
  className?: string;
}

export const PageSpecificFilterSidebar: React.FC<
  PageSpecificFilterSidebarProps
> = ({
  listings,
  onFilteredListingsChangeAction,
  pageContext,
  className = "",
}) => {
  const [filterState, setFilterState] = useState<PageSpecificFilterState>(
    createDefaultFilterState()
  );

  // Generate filter sections based on current listings
  let filterSections: any[] = [];

  try {
    if (pageContext.type === "catalog" && listings.length > 0) {
      filterSections = generateCatalogFilterSections(listings);
    } else if (pageContext.type === "category" && listings.length > 0) {
      filterSections = generateCategoryFilterSections(listings);
    } else if (pageContext.type === "near-you" && listings.length > 0) {
      filterSections = generateNearYouFilterSections(listings);
    } else if (pageContext.type === "segment" && listings.length > 0) {
      filterSections = generateSegmentFilterSections(listings);
    } else if (pageContext.type === "private-offers" && listings.length > 0) {
      filterSections = generatePrivateOffersFilterSections(listings);
    } else if (pageContext.type === "search" && listings.length > 0) {
      filterSections = generateSearchFilterSections(listings);
    }
  } catch (error: unknown) {
    filterSections = [];
  }

  // Update filter state when listings change (reset price range to new bounds)
  useEffect(() => {
    if (listings.length > 0) {
      const prices = listings
        .map((l) => l.minimum_order_value)
        .filter((p): p is number => p !== null && p !== undefined && p > 0);

      if (prices.length > 0) {
        const min = Math.min(...prices);
        const max = Math.max(...prices);

        setFilterState((prev) => ({
          ...prev,
          priceRange: { min, max },
        }));
      }
    }
  }, [listings]);

  // Apply filters whenever filter state changes
  useEffect(() => {
    const filteredListings = applyFiltersToListings(listings, filterState);
    onFilteredListingsChangeAction(filteredListings);
  }, [listings, filterState, onFilteredListingsChangeAction]);

  const handlePriceRangeChange = (range: { min: number; max: number }) => {
    setFilterState((prev) => ({
      ...prev,
      priceRange: range,
    }));
  };

  const handleCategoriesChange = (categories: string[]) => {
    setFilterState((prev) => ({
      ...prev,
      categories,
    }));
  };

  const handleSubcategoriesChange = (subcategories: string[]) => {
    setFilterState((prev) => ({
      ...prev,
      subcategories,
    }));
  };

  const handleListingFormatsChange = (listingFormats: string[]) => {
    setFilterState((prev) => ({
      ...prev,
      listingFormats: listingFormats as ("catalog" | "auction")[],
    }));
  };

  const handleLocationsChange = (locations: string[]) => {
    setFilterState((prev) => ({
      ...prev,
      locations,
    }));
  };

  const handleBrandsChange = (brands: string[]) => {
    setFilterState((prev) => ({
      ...prev,
      brands,
    }));
  };

  const handleConditionsChange = (conditions: string[]) => {
    setFilterState((prev) => ({
      ...prev,
      conditions,
    }));
  };

  const handlePackagingChange = (packaging: string[]) => {
    setFilterState((prev) => ({
      ...prev,
      packaging,
    }));
  };

  const handleClearAllFilters = () => {
    const resetState = resetAllFilters(listings);
    setFilterState(resetState);
  };

  const hasFiltersApplied = hasActiveFilters(filterState);

  if (listings.length === 0) {
    return (
      <div className={`w-80 ${className}`}>
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="text-center text-sm text-gray-500">
            No listings available for filtering
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-80 ${className}`}>
      {/* Modern Header - Clean and Minimal */}
      <div className="mb-8 px-0 py-0">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-lg font-medium tracking-tight text-black">
            Filters
          </h2>
          {hasFiltersApplied && (
            <button
              className="flex items-center text-sm font-medium text-gray-600 transition-colors duration-200 hover:text-black"
              onClick={handleClearAllFilters}
              type="button"
            >
              Clear all
            </button>
          )}
        </div>
        <p className="text-sm font-normal text-gray-500">
          {listings.length.toLocaleString()} results
        </p>
      </div>

      {/* Scrollable Filter Sections Container */}
      <div
        className="max-h-[calc(100vh-12rem)] overflow-y-auto pr-1"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "#e5e7eb transparent",
        }}
      >
        <div className="scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {filterSections.map((section, index) => {
            if (section.type === "range") {
              // Price Range Filter
              return (
                <div
                  className={`${index > 0 ? "border-t border-gray-200 pt-6" : ""}`}
                  key={section.id}
                >
                  <h3 className="mb-4 text-sm font-medium tracking-wide text-black uppercase">
                    {section.title}
                  </h3>
                  <PriceRangeFilter
                    collapsible={false}
                    defaultExpanded={true}
                    max={section.max || 1000}
                    min={section.min || 0}
                    onChange={handlePriceRangeChange}
                    title={section.title}
                    value={filterState.priceRange}
                  />
                </div>
              );
            }
            if (section.type === "checkbox") {
              // Checkbox Filters
              let selectedValues: string[] = [];
              let onChange: (values: string[]) => void = () => {};

              if (section.id === "categories") {
                selectedValues = filterState.categories;
                onChange = handleCategoriesChange;
              } else if (section.id === "subcategories") {
                selectedValues = filterState.subcategories;
                onChange = handleSubcategoriesChange;
              } else if (section.id === "listingFormats") {
                selectedValues = filterState.listingFormats;
                onChange = handleListingFormatsChange;
              } else if (section.id === "locations") {
                selectedValues = filterState.locations || [];
                onChange = handleLocationsChange;
              } else if (section.id === "brands") {
                selectedValues = filterState.brands || [];
                onChange = handleBrandsChange;
              } else if (section.id === "conditions") {
                selectedValues = filterState.conditions || [];
                onChange = handleConditionsChange;
              } else if (section.id === "packaging") {
                selectedValues = filterState.packaging || [];
                onChange = handlePackagingChange;
              }

              return (
                <div
                  className={`${index > 0 ? "border-t border-gray-200 pt-6" : ""} pb-6`}
                  key={section.id}
                >
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium tracking-wide text-black uppercase">
                      {section.title}
                    </h3>
                    <CheckboxFilter
                      collapsible={false}
                      defaultExpanded={true}
                      onChange={onChange}
                      options={section.options || []}
                      selectedValues={selectedValues}
                      title={section.title}
                    />
                  </div>
                </div>
              );
            }

            return null;
          })}

          {/* Empty State */}
          {filterSections.length === 0 && (
            <div className="py-8 text-center text-sm text-gray-400">
              No filters available
            </div>
          )}
        </div>

        {/* Modern Footer - Active Filters Count */}
        {hasFiltersApplied && (
          <div className="mt-8 pt-6">
            <div className="text-xs font-medium tracking-wide text-gray-500 uppercase">
              Active Filters
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {filterState.categories.length > 0 && (
                <span className="inline-flex items-center bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
                  Categories ({filterState.categories.length})
                </span>
              )}
              {filterState.subcategories.length > 0 && (
                <span className="inline-flex items-center bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
                  Subcategories ({filterState.subcategories.length})
                </span>
              )}
              {filterState.listingFormats.length > 0 && (
                <span className="inline-flex items-center bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
                  Formats ({filterState.listingFormats.length})
                </span>
              )}
              {filterState.locations && filterState.locations.length > 0 && (
                <span className="inline-flex items-center bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
                  Locations ({filterState.locations.length})
                </span>
              )}
              {filterState.brands && filterState.brands.length > 0 && (
                <span className="inline-flex items-center bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
                  Brands ({filterState.brands.length})
                </span>
              )}
              {filterState.conditions && filterState.conditions.length > 0 && (
                <span className="inline-flex items-center bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
                  Conditions ({filterState.conditions.length})
                </span>
              )}
              {filterState.packaging && filterState.packaging.length > 0 && (
                <span className="inline-flex items-center bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
                  Packaging ({filterState.packaging.length})
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
