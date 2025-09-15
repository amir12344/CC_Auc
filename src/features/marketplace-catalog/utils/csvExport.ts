import {
  fileToDbCategoryBiMap,
  fileToDbConditionBiMap,
  fileToDbFreightBiMap,
  fileToDbLengthUnitTypeBiMap,
  fileToDbShippingBiMap,
  fileToDbSubcategoryBiMap,
} from "../../../../amplify/functions/commons/converters/ListingTypeConverter";

/**
 * Type definition for lot listing manifest items (matching the interface in the component)
 */
export interface ManifestItem {
  title: string;
  description?: string;
  brand_name?: string;
  sku: string;
  model_name?: string;
  product_condition?: string;
  available_quantity?: number;
  retail_price?: number;
  retail_price_currency?: string;
  category?: string;
  subcategory?: string;
}

/**
 * Enhanced interface for lot listing with additional fields
 */
interface LotListingAdditionalInfo {
  lot_shipping_type?: string;
  lot_freight_type?: string;
  number_of_pallets?: number;
  pallet_spaces?: number;
  pallet_length?: number;
  pallet_width?: number;
  pallet_height?: number;
  pallet_dimension_type?: string;
  pallet_stackable?: boolean;
  number_of_truckloads?: number;
  number_of_shipments?: number;
  is_refrigerated?: boolean;
  is_fda_registered?: boolean;
  is_hazmat?: boolean;
  resale_requirement?: string;
  accessories?: string;
  inspection_status?: string;
  seller_notes?: string;
  shipping_notes?: string;
  additional_information?: string;
  offer_requirements?: string;
}

/**
 * CSV column headers matching the lot listing manifest table structure
 */
const CSV_HEADERS = [
  "Product Name",
  "Brand",
  "SKU", 
  "Model Name",
  "Condition",
  "Qty",
  "Unit Price ($)",
  "Ext. Retail ($)",
  "Category",
  "Subcategory", 
  "Description",
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
 * Format currency values for CSV export with proper formatting
 */
const formatCurrencyForCsv = (amount: number | string | undefined | null): string => {
  if (amount === null || amount === undefined) {
    return "$0.00";
  }
  
  // Convert to number if it's a string
  const numericAmount = typeof amount === 'string' ? Number.parseFloat(amount) : amount;
  
  // Check if conversion resulted in a valid number
  if (Number.isNaN(numericAmount) || numericAmount === 0) {
    return "$0.00";
  }
  
  // Format with currency symbol and commas for thousands
  return `$${numericAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

/**
 * Calculate extended retail value for CSV export
 */
const calculateExtRetailForCsv = (item: ManifestItem): string => {
  const quantity = Number(item.available_quantity) || 0;
  const retailPrice = Number(item.retail_price) || 0;
  const extRetail = quantity * retailPrice;
  return formatCurrencyForCsv(extRetail);
};

/**
 * Convert a single ManifestItem to CSV row format
 */
const manifestItemToCsvRow = (item: ManifestItem): string[] => {
  return [
    escapeCsvField(item.title),
    escapeCsvField(item.brand_name || "N/A"),
    escapeCsvField(item.sku),
    escapeCsvField(item.model_name || "N/A"),
    escapeCsvField(
      item.product_condition
        ? fileToDbConditionBiMap.getKey(item.product_condition as any) ||
        item.product_condition
        : "N/A"
    ),
    escapeCsvField(item.available_quantity || 0),
    formatCurrencyForCsv(item.retail_price),
    calculateExtRetailForCsv(item),
    escapeCsvField(
      item.category
        ? fileToDbCategoryBiMap.getKey(item.category as any) || item.category
        : "N/A"
    ),
    escapeCsvField(
      item.subcategory
        ? fileToDbSubcategoryBiMap.getKey(item.subcategory as any) ||
        item.subcategory
        : "N/A"
    ),
    escapeCsvField(item.description || "N/A"),
  ];
};

/**
 * Generate CSV content from manifest data with enhanced formatting
 */
export const generateLotManifestCsv = (
  manifestData: ManifestItem[]
): string => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Calculate totals for summary
  const totals = manifestData.reduce(
    (acc, item) => {
      const quantity = Number(item.available_quantity) || 0;
      const retailPrice = Number(item.retail_price) || 0;
      const extRetail = quantity * retailPrice;
      
      return {
        totalItems: acc.totalItems + 1,
        totalQuantity: acc.totalQuantity + quantity,
        totalValue: acc.totalValue + extRetail
      };
    },
    { totalItems: 0, totalQuantity: 0, totalValue: 0 }
  );

  const csvRows = [
    // Header section with metadata
    "LOT LISTING MANIFEST EXPORT",
    `Generated: ${currentDate}`,
    `Total Products: ${totals.totalItems}`,
    `Total Quantity: ${totals.totalQuantity.toLocaleString()}`,
    `Total Retail Value: $${totals.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    "",
    "═══════════════════════════════════════════════════════════════════════════════════════════",
    "PRODUCT MANIFEST",
    "═══════════════════════════════════════════════════════════════════════════════════════════",
    "",
    // Column headers
    CSV_HEADERS.join(",")
  ];

  // Add data rows
  for (const item of manifestData) {
    const row = manifestItemToCsvRow(item);
    csvRows.push(row.join(","));
  }

  // Add summary section
  csvRows.push("");
  csvRows.push("═══════════════════════════════════════════════════════════════════════════════════════════");
  csvRows.push("SUMMARY");
  csvRows.push("═══════════════════════════════════════════════════════════════════════════════════════════");
  csvRows.push("");
  csvRows.push("Category,Value");
  csvRows.push(`Total Products,${totals.totalItems}`);
  csvRows.push(`Total Quantity,${totals.totalQuantity.toLocaleString()}`);
  csvRows.push(`Total Retail Value,$${totals.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
  csvRows.push(`Average Unit Price,$${totals.totalQuantity > 0 ? (totals.totalValue / totals.totalQuantity).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}`);

  return csvRows.join("\n");
};

/**
 * Generate filename for the Excel export
 */
export const generateExcelFilename = (lotTitle?: string): string => {
  const timestamp = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format
  const baseFilename = lotTitle
    ? `${lotTitle.replace(/[^a-zA-Z0-9]/g, "_")}_lot_manifest_${timestamp}`
    : `lot_manifest_${timestamp}`;

  return `${baseFilename}.xlsx`;
};
/**
 * Build and download a styled Excel (.xlsx) using exceljs (dynamic import)
 */
const buildAndDownloadExcel = async (
  manifestData: ManifestItem[],
  lotTitle?: string,
  lotInfo?: LotListingAdditionalInfo
): Promise<void> => {
  const ExcelJS = await import("exceljs");
  const workbook = new ExcelJS.Workbook();

  // Sheet 1: Product Manifest
  const ws = workbook.addWorksheet("Product Manifest");

  // Header metadata
  const now = new Date().toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  ws.addRow(["LOT LISTING MANIFEST EXPORT"]);
  ws.addRow([`Generated: ${now}`]);
  ws.addRow([`Lot Title: ${lotTitle || "Untitled Lot"}`]);
  ws.addRow([]);

  // Column headers
  const headers = [
    "Product Name",
    "Brand",
    "SKU",
    "Model Name",
    "Condition",
    "Qty",
    "Unit Price ($)",
    "Ext. Retail ($)",
    "Category",
    "Subcategory",
    "Description",
  ];
  ws.addRow(headers);

  // Style header row
  const headerRow = ws.getRow(ws.lastRow!.number);
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1F2937" } }; // slate-800
    cell.border = { top: { style: "thin" }, bottom: { style: "thin" } };
  });
  headerRow.height = 22;

  // Column widths
  const widths = [30, 16, 16, 18, 14, 8, 14, 14, 16, 18, 40];
  ws.columns = widths.map((w) => ({ width: w }));

  // Data rows
  let totalQty = 0;
  let totalValue = 0;
  for (const item of manifestData) {
    const qty = Number(item.available_quantity) || 0;
    const unit = Number(item.retail_price) || 0;
    const ext = qty * unit;
    totalQty += qty;
    totalValue += ext;

    ws.addRow([
      item.title,
      item.brand_name || "N/A",
      item.sku,
      item.model_name || "N/A",
      item.product_condition
        ? fileToDbConditionBiMap.getKey(item.product_condition as never) || item.product_condition
        : "N/A",
      qty,
      unit,
      ext,
      item.category ? fileToDbCategoryBiMap.getKey(item.category as never) || item.category : "N/A",
      item.subcategory
        ? fileToDbSubcategoryBiMap.getKey(item.subcategory as never) || item.subcategory
        : "N/A",
      item.description || "N/A",
    ]);
  }

  // Format number columns
  const firstDataRow = headerRow.number + 1;
  const lastDataRow = ws.lastRow!.number;
  for (let r = firstDataRow; r <= lastDataRow; r++) {
    ws.getCell(r, 6).numFmt = "#,##0"; // Qty
    ws.getCell(r, 7).numFmt = "$#,##0.00"; // Unit
    ws.getCell(r, 8).numFmt = "$#,##0.00"; // Ext
  }

  // Zebra striping
  for (let r = firstDataRow; r <= lastDataRow; r++) {
    if ((r - firstDataRow) % 2 === 0) {
      ws.getRow(r).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFF8FAFC" }, // slate-50
      } as any;
    }
  }

  // Summary block
  ws.addRow([]);
  const summaryTitle = ws.addRow(["SUMMARY"]);
  summaryTitle.font = { bold: true, size: 12 };
  ws.addRow(["Total Products", manifestData.length]);
  ws.addRow(["Total Quantity", totalQty]);
  const totalValueRow = ws.addRow(["Total Retail Value", totalValue]);
  totalValueRow.getCell(2).numFmt = "$#,##0.00";
  const avg = totalQty > 0 ? totalValue / totalQty : 0;
  const avgRow = ws.addRow(["Average Unit Price", avg]);
  avgRow.getCell(2).numFmt = "$#,##0.00";

  // Style summary
  const summaryStart = summaryTitle.number;
  for (let r = summaryStart; r <= ws.lastRow!.number; r++) {
    ws.getRow(r).eachCell((cell, col) => {
      if (col === 1) cell.font = { bold: true };
    });
  }

  // Sheet 2: Lot Information (optional)
  if (lotInfo) {
    const info = workbook.addWorksheet("Lot Information");
    info.columns = [{ width: 28 }, { width: 40 }];
    const title = info.addRow(["LOT INFORMATION & LOGISTICS"]);
    title.font = { bold: true, size: 12 };
    info.addRow([]);
    const add = (label: string, value?: string | number | boolean | null) =>
      info.addRow([label, value ?? "Not Specified"]);

    add("Shipping Type", lotInfo.lot_shipping_type ? (fileToDbShippingBiMap.getKey(lotInfo.lot_shipping_type as never) || lotInfo.lot_shipping_type) : undefined);
    add("Freight Type", lotInfo.lot_freight_type ? (fileToDbFreightBiMap.getKey(lotInfo.lot_freight_type as never) || lotInfo.lot_freight_type) : undefined);
    add("Number of Truckloads", lotInfo.number_of_truckloads);
    add("Number of Shipments", lotInfo.number_of_shipments);
    info.addRow([]);
    add("Number of Pallets", lotInfo.number_of_pallets);
    add("Pallet Spaces", lotInfo.pallet_spaces);
    add("Pallet Length", lotInfo.pallet_length);
    add("Pallet Width", lotInfo.pallet_width);
    add("Pallet Height", lotInfo.pallet_height);
    add("Dimension Unit", lotInfo.pallet_dimension_type ? (fileToDbLengthUnitTypeBiMap.getKey(lotInfo.pallet_dimension_type as never) || lotInfo.pallet_dimension_type) : undefined);
    add("Stackable", lotInfo.pallet_stackable ? "Yes" : "No");
    info.addRow([]);
    add("Refrigerated Required", lotInfo.is_refrigerated ? "Yes" : "No");
    add("FDA Registered", lotInfo.is_fda_registered ? "Yes" : "No");
    add("Hazmat", lotInfo.is_hazmat ? "Yes" : "No");
    add("Resale Requirement", lotInfo.resale_requirement);
    add("Inspection Status", lotInfo.inspection_status);
    add("Seller Notes", lotInfo.seller_notes);
    add("Shipping Notes", lotInfo.shipping_notes);
    add("Additional Information", lotInfo.additional_information);
    add("Offer Requirements", lotInfo.offer_requirements);
  }

  // Download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const filename = generateExcelFilename(lotTitle);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Enhanced function to export lot manifest data as Excel with styling
 */
export const exportLotManifestToCsv = (
  manifestData: ManifestItem[],
  lotTitle?: string,
  lotInfo?: LotListingAdditionalInfo
): void => {
  try {
    // Validate input data
    if (!manifestData || manifestData.length === 0) {
      throw new Error("No manifest data available to export");
    }
    // Build and download Excel (async)
    void buildAndDownloadExcel(manifestData, lotTitle, lotInfo);
  } catch (error) {
    console.error("Export error:", error);
    throw new Error("Failed to export manifest. Please try again or contact support if the issue persists.");
  }
};

/**
 * Generate CSV content for lot information with enhanced formatting
 */
const generateLotInfoCsv = (lotInfo: LotListingAdditionalInfo): string => {
  const lotInfoRows = [
    "",
    "═══════════════════════════════════════════════════════════════════════════════════════════",
    "LOT INFORMATION & LOGISTICS",
    "═══════════════════════════════════════════════════════════════════════════════════════════",
    "",
    "SHIPPING & LOGISTICS",
    "────────────────────────────────────────────────────────────────────────────────────────────",
    "Category,Value",
    `Shipping Type,${escapeCsvField(
      lotInfo.lot_shipping_type
        ? fileToDbShippingBiMap.getKey(lotInfo.lot_shipping_type as any) ||
        lotInfo.lot_shipping_type
        : "Not Specified"
    )}`,
    `Freight Type,${escapeCsvField(
      lotInfo.lot_freight_type
        ? fileToDbFreightBiMap.getKey(lotInfo.lot_freight_type as any) ||
        lotInfo.lot_freight_type
        : "Not Specified"
    )}`,
    `Number of Truckloads,${escapeCsvField(lotInfo.number_of_truckloads || "Not Specified")}`,
    `Number of Shipments,${escapeCsvField(lotInfo.number_of_shipments || "Not Specified")}`,
    "",
    "PALLET SPECIFICATIONS",
    "────────────────────────────────────────────────────────────────────────────────────────────",
    "Category,Value",
    `Number of Pallets,${escapeCsvField(lotInfo.number_of_pallets || "Not Specified")}`,
    `Pallet Spaces,${escapeCsvField(lotInfo.pallet_spaces || "Not Specified")}`,
    `Pallet Length,${escapeCsvField(lotInfo.pallet_length ? `${lotInfo.pallet_length}"` : "Not Specified")}`,
    `Pallet Width,${escapeCsvField(lotInfo.pallet_width ? `${lotInfo.pallet_width}"` : "Not Specified")}`,
    `Pallet Height,${escapeCsvField(lotInfo.pallet_height ? `${lotInfo.pallet_height}"` : "Not Specified")}`,
    `Dimension Unit,${escapeCsvField(
      lotInfo.pallet_dimension_type
        ? fileToDbLengthUnitTypeBiMap.getKey(
          lotInfo.pallet_dimension_type as any
        ) || lotInfo.pallet_dimension_type
        : "Not Specified"
    )}`,
    `Stackable,${escapeCsvField(lotInfo.pallet_stackable ? "✓ Yes" : "✗ No")}`,
    "",
    "COMPLIANCE & REQUIREMENTS",
    "────────────────────────────────────────────────────────────────────────────────────────────",
    "Category,Value",
    `Refrigerated Required,${escapeCsvField(lotInfo.is_refrigerated ? "✓ Yes" : "✗ No")}`,
    `FDA Registered,${escapeCsvField(lotInfo.is_fda_registered ? "✓ Yes" : "✗ No")}`,
    `Hazmat Classification,${escapeCsvField(lotInfo.is_hazmat ? "⚠ Yes" : "✗ No")}`,
    `Resale Requirement,${escapeCsvField(lotInfo.resale_requirement || "Not Specified")}`,
    `Inspection Status,${escapeCsvField(lotInfo.inspection_status || "Not Specified")}`,
    "",
    "ADDITIONAL DETAILS",
    "────────────────────────────────────────────────────────────────────────────────────────────",
    "Category,Value",
    `Accessories Included,${escapeCsvField(lotInfo.accessories || "None specified")}`,
    `Seller Notes,${escapeCsvField(lotInfo.seller_notes || "None provided")}`,
    `Shipping Notes,${escapeCsvField(lotInfo.shipping_notes || "None provided")}`,
    `Additional Information,${escapeCsvField(lotInfo.additional_information || "None provided")}`,
    `Offer Requirements,${escapeCsvField(lotInfo.offer_requirements || "None specified")}`,
  ];

  return lotInfoRows.join("\n");
};
