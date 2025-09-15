import {
  fileToDbCategoryBiMap,
  fileToDbConditionBiMap,
  fileToDbSubcategoryBiMap,
} from "../../../../amplify/functions/commons/converters/ListingTypeConverter";
import type { ManifestItem } from "../types";

/**
 * CSV column headers matching the manifest table structure
 */
const CSV_HEADERS = [
  "Product Name",
  "Description",
  "Retail Price",
  "Ext. Retail",
  "SKU",
  "Qty",
  "Category",
  "Subcategory",
  "Product Condition",
  "Cosmetic Condition",
  "Identifier",
  "ID Type",
  "Hazmat",
  "Model Name",
];

/**
 * Safely escape CSV field values to handle commas, quotes, and newlines
 */
const escapeCsvField = (value: string | number | undefined | null): string => {
  if (value === null || value === undefined) {
    return "";
  }

  const stringValue = String(value);

  // If the field contains comma, quote, or newline, wrap it in quotes and escape internal quotes
  if (
    stringValue.includes(",") ||
    stringValue.includes('"') ||
    stringValue.includes("\n")
  ) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
};

/**
 * Format price values for CSV export
 */
const formatPriceForCsv = (priceString: string | undefined): string => {
  if (!priceString) {
    return "0.00";
  }

  const price = Number.parseFloat(priceString.replace(/[$,]/g, "")) || 0;
  return price.toFixed(2);
};

/**
 * Calculate extended retail value for CSV export
 */
const calculateExtRetailForCsv = (item: ManifestItem): string => {
  // Use ext_retail if available, otherwise calculate from retail_price * quantity
  const extRetail = Number.parseFloat(
    item.ext_retail?.replace(/[$,]/g, "") || "0"
  );
  if (extRetail > 0) {
    return extRetail.toFixed(2);
  }

  const retailPrice = Number.parseFloat(
    item.retail_price?.replace(/[$,]/g, "") || "0"
  );
  const quantity = Number(item.available_quantity) || 0;
  return (retailPrice * quantity).toFixed(2);
};

/**
 * Convert a single ManifestItem to CSV row format
 */
const manifestItemToCsvRow = (item: ManifestItem): string[] => {
  return [
    escapeCsvField(item.title),
    escapeCsvField(item.description),
    formatPriceForCsv(item.retail_price),
    calculateExtRetailForCsv(item),
    escapeCsvField(item.sku),
    escapeCsvField(item.available_quantity),
    escapeCsvField(
      item.category
        ? fileToDbCategoryBiMap.getKey(item.category as never)
        : "Not specified"
    ),
    escapeCsvField(
      item.subcategory
        ? fileToDbSubcategoryBiMap.getKey(item.subcategory as never)
        : "Not specified"
    ),
    escapeCsvField(
      item.product_condition
        ? fileToDbConditionBiMap.getKey(item.product_condition as never)
        : "Not specified"
    ),
    escapeCsvField(item.cosmetic_condition || "Not specified"),
    escapeCsvField(item.identifier),
    escapeCsvField(item.identifier_type),
    escapeCsvField(item.is_hazmat ? "Yes" : "No"),
    escapeCsvField(item.model_name),
  ];
};

/**
 * Generate CSV content from manifest data
 */
export const generateManifestCsv = (manifestData: ManifestItem[]): string => {
  // Start with headers
  const csvRows = [CSV_HEADERS.join(",")];

  // Add data rows
  for (const item of manifestData) {
    const row = manifestItemToCsvRow(item);
    csvRows.push(row.join(","));
  }

  return csvRows.join("\n");
};

/**
 * Generate filename for the CSV export
 */
export const generateCsvFilename = (auctionTitle?: string): string => {
  const timestamp = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format
  const baseFilename = auctionTitle
    ? `${auctionTitle.replace(/[^a-zA-Z0-9]/g, "_")}_manifest_${timestamp}`
    : `auction_manifest_${timestamp}`;

  return `${baseFilename}.csv`;
};

/**
 * Download CSV file using browser APIs
 */
export const downloadCsvFile = (csvContent: string, filename: string): void => {
  try {
    // Create blob with CSV content
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

    // Create download link
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";

    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up the URL object
    URL.revokeObjectURL(url);
  } catch {
    throw new Error("Failed to download CSV file");
  }
};

/**
 * Main function to export manifest data as CSV
 */
export const exportManifestToCsv = (
  manifestData: ManifestItem[],
  auctionTitle?: string
): void => {
  // Generate CSV content
  const csvContent = generateManifestCsv(manifestData);

  // Generate filename
  const filename = generateCsvFilename(auctionTitle);

  // Download file
  downloadCsvFile(csvContent, filename);
};
