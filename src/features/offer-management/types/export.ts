/**
 * EXCEL EXPORT TYPES
 *
 * Type definitions for Excel export functionality using xlsx-populate.
 * Focuses on variant images only as specified by user requirements.
 */

/**
 * Export configuration options
 */
export interface ExportConfig {
  includeImages: boolean;
  includeHiddenData: boolean;
  format: "xlsx" | "csv";
  sheetName: string;
  fileNamePrefix?: string;
  catalogId?: string; // To be used for dynamic URL generation
}

/**
 * Image processing result for individual images
 */
export interface ImageProcessingResult {
  success: boolean;
  imageData?: string; // base64 string
  error?: string;
  originalUrl?: string;
}

/**
 * Result of processing all variant images
 */
export interface ImageProcessingBatchResult {
  processedImages: Map<string, string>; // URL -> base64
  totalImages: number;
  successfulImages: number;
  failedImages: number;
  errors: string[];
}

/**
 * Excel export operation result
 */
export interface ExcelExportResult {
  success: boolean;
  fileName?: string;
  error?: string;
  warnings?: string[];
  fileSize?: number; // in bytes
  processingTime?: number; // in milliseconds
}

/**
 * Summary data for Excel header section
 */
export interface OfferSummaryData {
  totalUnits: number;
  totalPrice: number;
  avgPricePerUnit: number;
  productCount: number;
  variantCount: number;
  catalogTitle: string;
  exportDate: string;
}

/**
 * Excel row data structure for variant rows
 */
export interface VariantExportRow {
  // Basic info
  productName: string;
  variantName: string;
  brandName: string; // Added brand support
  variantSku: string;

  // Quantities
  selectedQuantity: number;
  availableQuantity: number;

  // Pricing
  pricePerUnit: number;
  totalPrice: number;
  retailPrice: number;
  offerPrice: number;
  sellerOfferedPercent: number; // Added seller's offered percentage
  sellerTotalOffer: number; // Added seller's total offer

  // Images (variant only as specified)
  variantImageUrl?: string;
  variantImageBase64?: string;

  // Additional variant information
  identifier: string | null;
  identifier_type: string | null;
  category: string | null;
  subcategory: string | null;
  packaging: string | null;
  product_condition: string | null;

  // Hidden detailed data
  catalogProductId: string;
  listingImageUrl?: string;
  productImageUrl?: string;
}

/**
 * Progress tracking for export operations
 */
export interface ExportProgress {
  stage:
    | "initializing"
    | "processing_images"
    | "generating_excel"
    | "downloading"
    | "complete"
    | "error";
  progress: number; // 0-100
  message: string;
  currentOperation?: string;
}

/**
 * Error types that can occur during export
 */
export type ExportErrorType =
  | "NO_DATA"
  | "IMAGE_PROCESSING_FAILED"
  | "EXCEL_GENERATION_FAILED"
  | "FILE_DOWNLOAD_FAILED"
  | "NETWORK_ERROR"
  | "UNKNOWN_ERROR";

/**
 * Detailed error information
 */
export interface ExportError {
  type: ExportErrorType;
  message: string;
  details?: Record<string, unknown>;
  timestamp: Date;
}

/**
 * Default export configuration
 */
export const DEFAULT_EXPORT_CONFIG: ExportConfig = {
  includeImages: true,
  includeHiddenData: true,
  format: "xlsx",
  sheetName: "Offer Summary",
  fileNamePrefix: "Offer_Export",
  catalogId: undefined, // Add default value for new property
};

/**
 * Column definitions for Excel export
 */
export interface ColumnDefinition {
  key: string;
  header: string;
  width?: number;
  type?: "text" | "number" | "currency" | "image";
  hidden?: boolean;
  formula?: string;
}

/**
 * Excel sheet configuration
 */
export interface SheetConfig {
  name: string;
  columns: ColumnDefinition[];
  includeHeader: boolean;
  includeSummary: boolean;
  rowHeight?: number;
  headerHeight?: number;
}
