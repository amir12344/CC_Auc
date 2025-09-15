import type { CombinedListing } from "@/src/features/marketplace-catalog/types/combined-listing";

import type { FilterSection } from "../types/filterTypes";
import {
  extractBrands,
  extractCategories,
  extractConditions,
  extractListingFormats,
  extractLocations,
  extractPackaging,
  extractPriceRange,
  extractSubcategories,
} from "./filterExtractors";

/**
 * Generate all filter sections for Search page based on current listing data
 * Handles both catalog and auction listings with unified filtering approach
 */
export const generateSearchFilterSections = (
  listings: CombinedListing[]
): FilterSection[] => {
  if (!listings || listings.length === 0) {
    return [];
  }

  const priceRange = extractPriceRange(listings);
  const categories = extractCategories(listings);
  const subcategories = extractSubcategories(listings);
  const locations = extractLocations(listings);
  const brands = extractBrands(listings);
  const conditions = extractConditions(listings);
  const packaging = extractPackaging(listings);
  const listingFormats = extractListingFormats(listings);

  const sections: FilterSection[] = [];

  // Price Range Filter
  sections.push({
    id: "price",
    title: "Price Range",
    type: "range",
    min: priceRange.min,
    max: priceRange.max,
    defaultExpanded: true,
  });

  // Location Filter
  if (locations.length > 0) {
    sections.push({
      id: "locations",
      title: "Location",
      type: "checkbox",
      options: locations,
      collapsible: true,
      defaultExpanded: false,
    });
  }

  // Category Filter
  if (categories.length > 0) {
    sections.push({
      id: "categories",
      title: "Categories",
      type: "checkbox",
      options: categories,
      collapsible: true,
      defaultExpanded: false,
    });
  }

  // Subcategory Filter
  if (subcategories.length > 0) {
    sections.push({
      id: "subcategories",
      title: "Subcategories",
      type: "checkbox",
      options: subcategories,
      collapsible: true,
      defaultExpanded: false,
    });
  }

  // Brand Filter
  if (brands.length > 0) {
    sections.push({
      id: "brands",
      title: "Brands",
      type: "checkbox",
      options: brands,
      collapsible: true,
      defaultExpanded: false,
    });
  }

  // Condition Filter
  if (conditions.length > 0) {
    sections.push({
      id: "conditions",
      title: "Condition",
      type: "checkbox",
      options: conditions,
      collapsible: true,
      defaultExpanded: false,
    });
  }

  // Packaging Filter
  if (packaging.length > 0) {
    sections.push({
      id: "packaging",
      title: "Packaging",
      type: "checkbox",
      options: packaging,
      collapsible: true,
      defaultExpanded: false,
    });
  }

  // Listing Format Filter
  if (listingFormats.length > 0) {
    sections.push({
      id: "listingFormats",
      title: "Listing Format",
      type: "checkbox",
      options: listingFormats,
      collapsible: true,
      defaultExpanded: false,
    });
  }

  return sections;
};
