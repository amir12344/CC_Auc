import {
  catalog_offer_item_status_type,
  currency_code_type,
  offer_negotiation_status_type,
  offer_status_type,
} from "../../lambda-layers/core-layer/nodejs/prisma/generated/client";

/**
 * Excel file parsing types
 */
export interface ExcelFileItem {
  sku: string;
  productName: string;
  variant?: string;
  brand: string;
  category: string;
  subcategory: string;
  selectedQuantity: number;
  pricePerUnit: number;
  identifier?: string;
  idType?: string;
  msrp?: number;
  packaging?: string;
  condition?: string;
}

export interface ExcelParseResult {
  success: boolean;
  items: ExcelFileItem[];
  totalRows: number;
  validItemsCount: number;
  errors: Array<{
    row: number;
    sku?: string;
    error: string;
  }>;
}

/**
 * File upload validation types
 */
export interface FileValidationError {
  code: string;
  message: string;
  details?: any;
}

export interface ValidatedFileItem {
  sku: string;
  catalogProductVariantId: string;
  requestedQuantity: number;
  buyerOfferPrice: number;
  buyerOfferPriceCurrency: currency_code_type;
  variantDetails: {
    productTitle: string;
    brandName: string;
    availableQuantity: number | null;
    minOrderQuantity: number | null;
    maxOrderQuantity: number | null;
  };
  originalFileData: ExcelFileItem;
}

export interface FileValidationResult {
  success: boolean;
  validItems: ValidatedFileItem[];
  totalOfferValue: number;
  currency: currency_code_type;
  errors: FileValidationError[];
  warnings: FileValidationError[];
}

/**
 * API request/response types
 */
export interface CreateOfferFromFileRequest {
  offerListingPublicId: string;
  offerFileS3Key: string;
}

export interface CreateOfferFromFileResponse {
  success: boolean;
  catalogOfferId?: string; // public_id
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  data?: {
    catalog_offer_id: string;
    offer_status: offer_status_type;
    total_offer_value: number;
    total_offer_value_currency: currency_code_type;
    expires_at?: string; // ISO date string
    created_at: string; // ISO date string
    listing_details: {
      listing_title: string;
      seller_company?: string;
    };
    file_processing_summary: {
      file_name: string;
      file_size: number;
      total_rows_processed: number;
      valid_items_found: number;
      items_with_offers: number;
      skipped_items: number;
      parsing_errors_count: number;
      validation_errors_count: number;
      processing_time_ms: number;
    };
    offer_items: Array<{
      sku: string;
      product_title: string;
      brand_name: string;
      variant_name?: string;
      requested_quantity: number;
      buyer_offer_price: number;
      buyer_offer_price_currency: currency_code_type;
      negotiation_status: offer_negotiation_status_type;
      item_status: catalog_offer_item_status_type;
      added_in_round: number;
      estimated_total_value: number;
    }>;
    processing_errors?: Array<{
      type: "PARSING_ERROR" | "VALIDATION_ERROR" | "BUSINESS_RULE_ERROR";
      row?: number;
      sku?: string;
      error_code: string;
      error_message: string;
      suggested_action?: string;
    }>;
  };
}

/**
 * Database operation types
 */
export interface CatalogListingLookup {
  catalog_listing_id: string;
  public_id: string;
  title: string;
  status: string;
  seller_user_id: string;
  seller_profile_id: string;
  minimum_order_value?: number;
  minimum_order_value_currency?: currency_code_type;
  is_private: boolean;
}

export interface VariantLookup {
  catalog_product_variant_id: string;
  variant_sku: string;
  variant_name?: string;
  title?: string;
  available_quantity?: number;
  min_order_quantity?: number;
  max_order_quantity?: number;
  is_active: boolean;
  product_title: string;
  brand_name: string;
  catalog_listing_id: string;
}

export interface BuyerProfileLookup {
  buyer_profile_id: string;
  user_id: string;
  verification_status: string;
  public_id: string;
}

/**
 * Business validation types
 */
export interface BusinessValidationRule {
  rule_name: string;
  rule_type: "INVENTORY" | "QUANTITY" | "PRICING" | "ACCESS" | "BUSINESS_LOGIC";
  validation_function: (
    item: ValidatedFileItem,
    context: any
  ) => ValidationRuleResult;
}

export interface ValidationRuleResult {
  passed: boolean;
  error?: FileValidationError;
  warning?: FileValidationError;
}

/**
 * File processing types
 */
export interface FileProcessingContext {
  startTime: number;
  fileName: string;
  fileSize: number;
  catalogListingId: string;
  buyerUserId: string;
  buyerProfileId: string;
  processingSteps: Array<{
    step: string;
    startTime: number;
    endTime?: number;
    status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    error?: string;
  }>;
}

export interface ProcessingMetrics {
  total_processing_time_ms: number;
  file_read_time_ms: number;
  parsing_time_ms: number;
  validation_time_ms: number;
  database_time_ms: number;
  memory_usage_mb: number;
  rows_processed_per_second: number;
}

/**
 * S3 integration types
 */
export interface S3FileDetails {
  bucket: string;
  key: string;
  size: number;
  contentType: string;
  lastModified: Date;
  etag: string;
}

export interface S3ReadResult {
  buffer: Buffer;
  metadata: S3FileDetails;
}

/**
 * Audit and logging types
 */
export interface FileUploadAuditLog {
  upload_id: string;
  catalog_listing_public_id: string;
  buyer_user_id: string;
  file_name: string;
  file_size: number;
  s3_key: string;
  processing_status:
    | "STARTED"
    | "PARSING"
    | "VALIDATING"
    | "CREATING_OFFER"
    | "COMPLETED"
    | "FAILED";
  success: boolean;
  error_details?: any;
  processing_metrics?: ProcessingMetrics;
  created_at: Date;
  completed_at?: Date;
}

/**
 * Error categorization types
 */
export type ErrorCategory =
  | "FILE_FORMAT_ERROR"
  | "FILE_SIZE_ERROR"
  | "PARSING_ERROR"
  | "VALIDATION_ERROR"
  | "BUSINESS_RULE_ERROR"
  | "INVENTORY_ERROR"
  | "ACCESS_DENIED_ERROR"
  | "DATABASE_ERROR"
  | "S3_ERROR"
  | "AUTHENTICATION_ERROR"
  | "AUTHORIZATION_ERROR"
  | "RATE_LIMIT_ERROR"
  | "TIMEOUT_ERROR"
  | "INTERNAL_ERROR";

export interface CategorizedError {
  category: ErrorCategory;
  code: string;
  message: string;
  details?: any;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  user_friendly_message: string;
  suggested_actions: string[];
}

/**
 * Configuration types
 */
export interface FileProcessingConfig {
  max_file_size_mb: number;
  max_items_per_file: number;
  supported_file_types: string[];
  validation_rules: string[];
  processing_timeout_ms: number;
  enable_detailed_logging: boolean;
  enable_metrics_collection: boolean;
}

export interface DefaultProcessingConfig extends FileProcessingConfig {
  max_file_size_mb: 10;
  max_items_per_file: 1000;
  supported_file_types: [".xlsx", ".xls"];
  validation_rules: [
    "INVENTORY_CHECK",
    "QUANTITY_LIMITS",
    "SKU_VALIDATION",
    "PRICING_VALIDATION",
    "ACCESS_CONTROL",
  ];
  processing_timeout_ms: 300000; // 5 minutes
  enable_detailed_logging: true;
  enable_metrics_collection: true;
}

/**
 * Helper types for type safety
 */
export type RequiredExcelColumns =
  | "SKU"
  | "Product Name"
  | "Selected Qty"
  | "Price/Unit"
  | "Brand"
  | "Category"
  | "Subcategory";

export type OptionalExcelColumns =
  | "Variant"
  | "Identifier"
  | "ID Type"
  | "MSRP"
  | "Packaging"
  | "Condition";

export type ExcelColumnMapping = Record<
  RequiredExcelColumns | OptionalExcelColumns,
  number
>;

/**
 * Response builder types
 */
export interface ResponseBuilder {
  buildSuccessResponse(data: any): CreateOfferFromFileResponse;
  buildErrorResponse(error: CategorizedError): CreateOfferFromFileResponse;
  buildValidationErrorResponse(
    errors: FileValidationError[]
  ): CreateOfferFromFileResponse;
}

/**
 * Utility types
 */
export type NonEmptyArray<T> = [T, ...T[]];

export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredBy<T, K extends keyof T> = T & Required<Pick<T, K>>;
