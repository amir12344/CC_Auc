import {
  fileToDbCategoryBiMap,
  fileToDbSubcategoryBiMap,
} from "../../../../amplify/functions/commons/converters/ListingTypeConverter";

import type { ManifestItem } from "../utils/csvExport";

export interface AggregatedManifestData {
  key: string;
  label: string;
  quantity: number;
  extRetail: number;
}

const calcExtRetail = (item: ManifestItem): number => {
  const qty = Number(item.available_quantity) || 0;
  const unit = Number(item.retail_price) || 0;
  return qty * unit;
};

const aggregate = (
  data: ManifestItem[],
  groupBy: (item: ManifestItem) => string,
  labelFn?: (key: string) => string
): AggregatedManifestData[] => {
  const grouped = data.reduce((acc, item) => {
    const key = groupBy(item);
    if (!key || key === "Not specified") return acc;

    if (!acc[key]) {
      acc[key] = {
        key,
        label: labelFn ? labelFn(key) : key,
        quantity: 0,
        extRetail: 0,
      };
    }

    acc[key].quantity += Number(item.available_quantity) || 0;
    acc[key].extRetail += calcExtRetail(item);

    return acc;
  }, {} as Record<string, AggregatedManifestData>);

  return Object.values(grouped).sort((a, b) => b.extRetail - a.extRetail);
};

export const aggregateLotByCategory = (
  data: ManifestItem[]
): AggregatedManifestData[] =>
  aggregate(
    data,
    (item) => {
      if (!item.category) return "Not specified";
      return (
        fileToDbCategoryBiMap.getKey(item.category as never) || "Not specified"
      );
    }
  );

export const aggregateLotBySubcategory = (
  data: ManifestItem[]
): AggregatedManifestData[] =>
  aggregate(
    data,
    (item) => {
      if (!item.subcategory) return "Not specified";
      return (
        fileToDbSubcategoryBiMap.getKey(item.subcategory as never) ||
        "Not specified"
      );
    }
  );

export const aggregateLotByProductClass = (
  data: ManifestItem[]
): AggregatedManifestData[] =>
  aggregate(data, (item) => {
    if (!item.category) return "Not specified";
    const category = fileToDbCategoryBiMap.getKey(item.category as never);
    if (!category) return "Not specified";

    // Derive higher-level class groupings; extend as needed
    const lower = category.toLowerCase();
    if (lower.includes("apparel") || lower.includes("clothing"))
      return "Apparel & Accessories";
    if (lower.includes("electronics")) return "Electronics";
    if (lower.includes("home") || lower.includes("furniture"))
      return "Home & Furniture";
    return category;
  });

