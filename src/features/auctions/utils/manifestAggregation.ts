import {
  fileToDbCategoryBiMap,
  fileToDbSubcategoryBiMap,
} from "../../../../amplify/functions/commons/converters/ListingTypeConverter";
import type { ManifestItem } from "../types";

/**
 * Aggregated data structure for manifest views
 */
export interface AggregatedManifestData {
  key: string;
  label: string;
  quantity: number;
  extRetail: number;
}

/**
 * Helper function to safely parse price strings and convert to numbers
 */
export const parsePrice = (priceString: string | undefined): number => {
  if (!priceString) {
    return 0;
  }
  return Number.parseFloat(priceString.replace(/[$,]/g, "")) || 0;
};

/**
 * Helper function to calculate extended retail value for an item
 */
export const calculateExtRetail = (item: ManifestItem): number => {
  // Use ext_retail if available, otherwise calculate from retail_price * quantity
  const extRetail = parsePrice(item.ext_retail);
  if (extRetail > 0) {
    return extRetail;
  }

  const retailPrice = parsePrice(item.retail_price);
  const quantity = Number(item.available_quantity) || 0;
  return retailPrice * quantity;
};

/**
 * Generic aggregation function for grouping manifest data
 */
export const aggregateManifestData = (
  manifestData: ManifestItem[],
  groupByFn: (item: ManifestItem) => string,
  labelFn?: (key: string) => string
): AggregatedManifestData[] => {
  const grouped = manifestData.reduce(
    (acc, item) => {
      const key = groupByFn(item);
      if (!key || key === "Not specified") {
        return acc;
      }

      if (!acc[key]) {
        acc[key] = {
          key,
          label: labelFn ? labelFn(key) : key,
          quantity: 0,
          extRetail: 0,
        };
      }

      acc[key].quantity += Number(item.available_quantity) || 0;
      acc[key].extRetail += calculateExtRetail(item);

      return acc;
    },
    {} as Record<string, AggregatedManifestData>
  );

  return Object.values(grouped).sort((a, b) => b.extRetail - a.extRetail);
};

/**
 * Aggregate by product class (derived from category)
 */
export const aggregateByProductClass = (
  manifestData: ManifestItem[]
): AggregatedManifestData[] => {
  return aggregateManifestData(manifestData, (item) => {
    if (!item.category) return "Not specified";
    const category = fileToDbCategoryBiMap.getKey(item.category as never);
    // Derive product class from category - group similar categories
    if (
      category?.toLowerCase().includes("apparel") ||
      category?.toLowerCase().includes("clothing")
    ) {
      return "Apparel & Accessories";
    }
    return category || "Not specified";
  });
};

/**
 * Aggregate by GI (General Item) Description
 */
export const aggregateByGIDescription = (
  manifestData: ManifestItem[]
): AggregatedManifestData[] => {
  return aggregateManifestData(manifestData, (item) => {
    const category = item.category
      ? fileToDbCategoryBiMap.getKey(item.category as never)
      : "";
    const title = item.title?.toLowerCase() || "";

    // Derive general item description based on category and title
    if (
      category?.toLowerCase().includes("jewelry") ||
      title.includes("jewelry")
    ) {
      return "Jewelry";
    }
    if (
      category?.toLowerCase().includes("private") ||
      title.includes("private label")
    ) {
      return "Softlines Private Label";
    }
    if (
      category?.toLowerCase().includes("apparel") ||
      category?.toLowerCase().includes("clothing") ||
      title.includes("shirt") ||
      title.includes("dress") ||
      title.includes("pants")
    ) {
      return "Apparel";
    }

    return category || "Other";
  });
};

/**
 * Aggregate by category
 */
export const aggregateByCategory = (
  manifestData: ManifestItem[]
): AggregatedManifestData[] => {
  return aggregateManifestData(manifestData, (item) => {
    if (!item.category) return "Not specified";
    return (
      fileToDbCategoryBiMap.getKey(item.category as never) || "Not specified"
    );
  });
};

/**
 * Aggregate by subcategory
 */
export const aggregateBySubcategory = (
  manifestData: ManifestItem[]
): AggregatedManifestData[] => {
  return aggregateManifestData(manifestData, (item) => {
    if (!item.subcategory) return "Not specified";
    return (
      fileToDbSubcategoryBiMap.getKey(item.subcategory as never) ||
      "Not specified"
    );
  });
};

/**
 * Calculate totals for aggregated data
 */
export const calculateTotals = (data: AggregatedManifestData[]) => {
  return data.reduce(
    (totals, item) => ({
      quantity: totals.quantity + item.quantity,
      extRetail: totals.extRetail + item.extRetail,
    }),
    { quantity: 0, extRetail: 0 }
  );
};

/**
 * Format currency values for display
 */
export const formatCurrency = (value: number): string => {
  return `$${value.toLocaleString()}`;
};
