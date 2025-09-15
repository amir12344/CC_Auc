import { Readable } from "stream";

import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

import { v4 as uuidv4 } from "uuid";
import * as XLSX from "xlsx";

import {
  bid_increment_type,
  Prisma,
  PrismaClient,
} from "../../../lambda-layers/core-layer/nodejs/prisma/generated/client";
import {
  AuctionListingData,
  ManifestData,
} from "../../types/AuctionListingFileTypes";
import {
  CatalogOfferListingData,
  CatalogProductData,
} from "../../types/CatalogListingFileTypes";
import { VisibilityRules } from "../../types/ListingTypes";
import { ExcelCurrencyExtractor } from "../../utilities/ExcelCurrencyExtractor";
import ImageService from "../../utilities/image-downloader";
import {
  ImageCompressionUtil,
  ImageFormatInfo,
} from "../../utilities/ImageCompressionUtil";
import {
  createAuctionListing,
  createProductManifest,
  createWarehouseAddress,
  getOrCreateBrand,
} from "./AuctionListingDatabaseOperations";
import {
  createCatalogAddress,
  createCatalogListing,
  createCatalogListingImages,
  createCatalogProducts,
} from "./CatalogListingDatabaseOperations";
import { cleanupS3Objects } from "./ParallelCatalogOperations";

// AWS S3 Configuration
export interface S3Config {
  region: string;
}

// Enhanced ImportConfig for S3
export interface S3AuctionImportConfig {
  // Required: Existing user and seller profile IDs
  sellerUserId: string;
  sellerPublicUserId: string;
  sellerProfileId: string;

  // S3 file paths
  auctionListingS3Path: string; // e.g., "s3://bucket-name/path/to/auction-file.xlsx"
  manifestS3Path: string; // e.g., "s3://bucket-name/path/to/manifest-file.xlsx"

  // AWS S3 Configuration
  s3Config: S3Config;

  isPrivate?: boolean;
  visibilityRules?: VisibilityRules;

  bucketName: string;
  imageBucketName: string;

  // Optional: Default auction settings
  defaultMinimumBid?: number;
  defaultBidIncrementValue?: number;
  defaultBidIncrementType?: bid_increment_type;
  defaultAuctionEndTime?: Date;
  defaultAuctionDurationHours?: number;
  defaultShippingType?: string;

  // Optional: Validation settings
  validateImages?: boolean;
  skipInvalidRows?: boolean;
  batchSize?: number;

  // EventBridge scheduling configuration (populated from Amplify env)
  enableEventBridgeScheduling?: boolean; // Flag to enable/disable scheduling
  completeAuctionFunctionArn?: string; // ARN of the complete auction function (from Amplify env)
  eventBridgeSchedulerRoleArn?: string; // IAM role for EventBridge Scheduler (from Amplify env)
  eventBridgeSchedulerGroupName?: string; // Group name for EventBridge Scheduler (from Amplify env)
  auctionDLQArn?: string; // Optional DLQ ARN for failed completions (from Amplify env)
}

export interface S3CatalogImportConfig {
  // Required: Existing user and seller profile IDs
  sellerUserId: string;
  sellerPublicUserId: string;
  sellerProfileId: string;

  // S3 file paths
  catalogListingS3Path: string;
  catalogProductsS3Path: string;

  // AWS S3 Configuration
  s3Config: S3Config;

  isPrivate?: boolean;
  visibilityRules?: VisibilityRules;

  bucketName: string;
  imageBucketName: string;

  // Optional: Validation settings
  validateImages?: boolean;
  skipInvalidRows?: boolean;
  batchSize?: number;

  // Duplicate detection settings
  enableDuplicateDetection?: boolean; // Default: true
  duplicateDetectionMode?: "strict" | "warn" | "skip"; // Default: 'strict'
}

export interface ImageProcessingConfig {
  bucketName: string;
  userPublicId: string; // User/seller ID for organizing images
}

// Transaction Context for atomic operations with rollback capability
export interface AuctionTransactionContext {
  uploadedS3Keys: string[];
  createdImageIds: string[];
  createdAddressIds: string[];
  createdBrandIds: string[];
  auctionListingId?: string;
  transaction?: Prisma.TransactionClient;
  startTime: number;
  // Track downloaded images for cleanup
  downloadedImages: Map<string, Buffer>;
  // Track original image URLs for database records
  originalImageUrls: Map<string, string>;
  // Track operation progress for detailed error reporting
  currentOperation?: string;
  processedRows: number;
}

// Enhanced error class for transaction failures with rollback context
export class TransactionRollbackError extends Error {
  public readonly context: AuctionTransactionContext;
  public readonly originalError: Error;
  public readonly rollbackDetails: {
    databaseRolledBack: boolean;
    s3ObjectsDeleted: number;
    s3CleanupFailed: boolean;
    rollbackDurationMs: number;
  };

  constructor(
    originalError: Error,
    context: AuctionTransactionContext,
    rollbackDetails: {
      databaseRolledBack: boolean;
      s3ObjectsDeleted: number;
      s3CleanupFailed: boolean;
      rollbackDurationMs: number;
    }
  ) {
    const message = `Transaction failed and rolled back: ${originalError.message}`;
    super(message);

    this.name = "TransactionRollbackError";
    this.originalError = originalError;
    this.context = context;
    this.rollbackDetails = rollbackDetails;

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, TransactionRollbackError);
    }
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      originalError: {
        name: this.originalError.name,
        message: this.originalError.message,
        stack: this.originalError.stack,
      },
      context: {
        uploadedS3Keys: this.context.uploadedS3Keys.length,
        createdImageIds: this.context.createdImageIds.length,
        createdAddressIds: this.context.createdAddressIds.length,
        createdBrandIds: this.context.createdBrandIds.length,
        auctionListingId: this.context.auctionListingId,
        currentOperation: this.context.currentOperation,
        processedRows: this.context.processedRows,
        durationMs: Date.now() - this.context.startTime,
      },
      rollbackDetails: this.rollbackDetails,
    };
  }
}

// S3 Utilities
export class S3FileHandler {
  private s3Client: S3Client;

  constructor(config: S3Config) {
    this.s3Client = new S3Client({
      region: config.region,
    });
  }

  /**
   * Parse S3 URL to extract bucket and key
   */
  private parseS3Url(s3Url: string): { bucket: string; key: string } {
    const url = s3Url.replace("s3://", "");
    const [bucket, ...keyParts] = url.split("/");
    const key = keyParts.join("/");

    if (!bucket || !key) {
      throw new Error(
        `Invalid S3 URL format: ${s3Url}. Expected format: s3://bucket-name/path/to/file`
      );
    }

    return { bucket, key };
  }

  /**
   * Download file from S3 and return as Buffer
   */
  async downloadFile(s3Url: string): Promise<Buffer> {
    try {
      const { bucket, key } = this.parseS3Url(s3Url);

      console.log(`Downloading from S3: ${bucket}/${key}`);

      const command = new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      });

      const response = await this.s3Client.send(command);

      if (!response.Body) {
        throw new Error(`No data received from S3 for ${s3Url}`);
      }

      // Convert stream to buffer
      const chunks: Uint8Array[] = [];
      const stream = response.Body as Readable;

      return new Promise((resolve, reject) => {
        stream.on("data", (chunk) => chunks.push(chunk));
        stream.on("error", reject);
        stream.on("end", () => {
          const buffer = Buffer.concat(chunks);
          console.log(
            `Successfully downloaded ${buffer.length} bytes from ${s3Url}`
          );
          resolve(buffer);
        });
      });
    } catch (error) {
      console.error(`Failed to download file from S3: ${s3Url}`, error);
      throw error;
    }
  }

  /**
   * Parse Excel file from S3 and return JSON data
   */
  async parseExcelFromS3(
    s3Url: string
  ): Promise<{ data: any[]; worksheet: XLSX.WorkSheet; headers: string[] }> {
    try {
      const buffer = await this.downloadFile(s3Url);

      // Parse Excel file from buffer
      const workbook = XLSX.read(buffer, {
        type: "buffer",
        cellStyles: true,
        cellFormula: true,
        cellDates: true,
        cellNF: true,
        sheetStubs: true,
        raw: false, // Preserve formatting for currency detection
      });

      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // Get raw data with headers as first row
      const rawData = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        rawNumbers: false, // Keep formatted values for currency detection
        raw: false, // Preserve formatting
        blankrows: false,
      }) as any[][];

      // Extract headers from first row
      const headers = rawData[0]?.map((header) => String(header).trim()) || [];

      // Convert to objects using the headers, skipping the header row
      const data = rawData.slice(1).map((row) => {
        const obj: any = {};
        headers.forEach((header, index) => {
          obj[header] = row[index];
        });
        return obj;
      });

      console.log(`Successfully parsed ${data.length} rows from ${s3Url}`);
      console.log(`Headers found: ${headers.join(", ")}`);

      return { data, worksheet, headers };
    } catch (error) {
      console.error(`Failed to parse Excel file from S3: ${s3Url}`, error);
      throw error;
    }
  }
}

// Enhanced Data Transformer for S3 imports
export class S3DataTransformer {
  static sanitizeString(value: any): string | undefined {
    if (value === null || value === undefined || value === "") {
      return undefined;
    }
    return String(value).trim();
  }

  static parseNumber(value: any): number | undefined {
    if (value === null || value === undefined || value === "") {
      return undefined;
    }

    // Handle string values with formatting
    if (typeof value === "string") {
      // Remove common formatting: commas, spaces, currency symbols
      const cleanedValue = value
        .replace(/[$£€¥₹₽¢]/g, "") // Remove currency symbols
        .replace(/[,\s]/g, "") // Remove commas and spaces
        .trim();

      if (cleanedValue === "") {
        return undefined;
      }

      const num = Number(cleanedValue);
      return isNaN(num) ? undefined : num;
    }

    const num = Number(value);
    return isNaN(num) ? undefined : num;
  }

  static parseDecimal(value: any, precision: number = 4): number | undefined {
    if (value === null || value === undefined || value === "") {
      return undefined;
    }

    // Handle string values with formatting for decimals
    if (typeof value === "string") {
      // Remove common formatting: commas, spaces, currency symbols
      const cleanedValue = value
        .replace(/[$£€¥₹₽¢]/g, "") // Remove currency symbols
        .replace(/[,\s]/g, "") // Remove commas and spaces
        .trim();

      if (cleanedValue === "") {
        return undefined;
      }

      const num = parseFloat(cleanedValue);
      if (isNaN(num)) return undefined;
      return Number(num.toFixed(precision));
    }

    const num = this.parseNumber(value);
    if (num === undefined) return undefined;
    return Number(num.toFixed(precision));
  }

  static parseBoolean(value: any): boolean {
    if (typeof value === "boolean") return value;
    if (typeof value === "string") {
      const lower = value.toLowerCase().trim();
      return lower === "yes" || lower === "true" || lower === "1";
    }
    return Boolean(value);
  }

  static generateSKU(prefix: string = "SKU"): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8);
    return `${prefix}-${timestamp}-${random}`.toUpperCase();
  }

  static validateS3Url(url: string): boolean {
    return /^s3:\/\/[a-zA-Z0-9.\-_]+\/.*/.test(url);
  }
}

// Progress tracking for S3 imports
export class S3ImportProgress {
  private total: number = 0;
  private processed: number = 0;
  private errors: number = 0;
  private startTime: Date = new Date();
  private currentFile: string = "";

  setTotal(total: number) {
    this.total = total;
  }

  setCurrentFile(fileName: string) {
    this.currentFile = fileName;
  }

  incrementProcessed() {
    this.processed++;
  }

  incrementErrors() {
    this.errors++;
  }

  getProgress(): {
    total: number;
    processed: number;
    errors: number;
    percentage: number;
    elapsed: number;
    estimated: number;
    currentFile: string;
  } {
    const elapsed = (new Date().getTime() - this.startTime.getTime()) / 1000;
    const percentage = this.total > 0 ? (this.processed / this.total) * 100 : 0;
    const estimated =
      this.processed > 0 ? (elapsed / this.processed) * this.total : 0;

    return {
      total: this.total,
      processed: this.processed,
      errors: this.errors,
      percentage: Math.round(percentage * 100) / 100,
      elapsed: Math.round(elapsed),
      estimated: Math.round(estimated),
      currentFile: this.currentFile,
    };
  }

  printProgress() {
    const progress = this.getProgress();
    console.log(
      `Progress: ${progress.processed}/${progress.total} (${progress.percentage}%) - Errors: ${progress.errors} - Elapsed: ${progress.elapsed}s - Current: ${progress.currentFile}`
    );
  }
}

// Image Pre-validation and Download Functions for Transaction Safety

/**
 * Validates that all image URLs in auction data are accessible
 * Downloads images to memory for later S3 upload within transaction
 */
async function validateAndDownloadAuctionImages(
  auctionData: any[],
  context: AuctionTransactionContext
): Promise<void> {
  context.currentOperation = "Validating and downloading auction images";

  for (const [index, item] of auctionData.entries()) {
    const imageFields = [
      "IMAGE1",
      "IMAGE2",
      "IMAGE3",
      "IMAGE4",
      "IMAGE5",
      "IMAGE6",
    ];

    for (const field of imageFields) {
      const imageUrl = item[field];
      if (!imageUrl || typeof imageUrl !== "string" || imageUrl.trim() === "") {
        continue; // Skip empty image fields
      }

      try {
        console.log(`Pre-validating image: ${imageUrl}`);

        // Download image to memory for validation
        const imageResult = await ImageService.downloadImageAdvanced(imageUrl, {
          maxFileSize: 15 * 1024 * 1024, // 15MB limit
          timeout: 30000, // 30 second timeout
        });

        if (!imageResult?.buffer) {
          throw new Error(`Failed to download image: ${imageUrl}`);
        }

        const imageBuffer = imageResult.buffer;

        if (!imageBuffer || imageBuffer.length === 0) {
          throw new Error(`Downloaded image is empty: ${imageUrl}`);
        }

        // Validate image format and size
        if (imageBuffer.length > 10 * 1024 * 1024) {
          // 10MB limit
          throw new Error(
            `Image too large (${imageBuffer.length} bytes): ${imageUrl}`
          );
        }

        // Store downloaded image for later S3 upload
        const imageKey = `${field}_${index}`;
        context.downloadedImages.set(imageKey, imageBuffer);
        context.originalImageUrls.set(imageKey, imageUrl);

        console.log(
          `Successfully validated and cached image: ${imageUrl} (${imageBuffer.length} bytes)`
        );
      } catch (error) {
        console.error(`Failed to validate image ${imageUrl}:`, error);
        throw new Error(
          `Image validation failed for auction item ${index + 1}, field ${field}: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }
  }

  console.log(
    `Successfully pre-validated ${context.downloadedImages.size} images`
  );
}

/**
 * Validates auction data before starting transaction
 * Checks for required fields and data consistency
 */
async function validateAuctionDataPreTransaction(
  auctionData: any[],
  manifestData: any[]
): Promise<void> {
  if (!auctionData || auctionData.length === 0) {
    throw new Error("Auction data is empty");
  }

  if (!manifestData || manifestData.length === 0) {
    throw new Error("Manifest data is empty");
  }

  // Validate required fields exist
  const requiredAuctionFields = [
    "TITLE",
    "CATEGORY1",
    "SUBCATEGORY1",
    "TOTAL_EX_RETAIL_PRICE",
  ];
  const requiredManifestFields = [
    "SKU",
    "TITLE",
    "BRAND",
    "UNIT_QTY",
    "UNIT_RETAIL",
  ];

  for (const [index, item] of auctionData.entries()) {
    for (const field of requiredAuctionFields) {
      if (!item[field] || String(item[field]).trim() === "") {
        throw new Error(
          `Missing required field '${field}' in auction row ${index + 1}`
        );
      }
    }
  }

  for (const [index, item] of manifestData.entries()) {
    for (const field of requiredManifestFields) {
      if (!item[field] || String(item[field]).trim() === "") {
        throw new Error(
          `Missing required field '${field}' in manifest row ${index + 1}`
        );
      }
    }
  }

  console.log(
    `Pre-transaction validation passed for ${auctionData.length} auction items and ${manifestData.length} manifest items`
  );
}

// Main S3 Import Function with Transaction Rollback
export async function executeS3Import(
  config: S3AuctionImportConfig,
  prisma: PrismaClient
): Promise<void> {
  const s3Handler = new S3FileHandler(config.s3Config);
  const progress = new S3ImportProgress();

  // Initialize transaction context
  const context: AuctionTransactionContext = {
    uploadedS3Keys: [],
    createdImageIds: [],
    createdAddressIds: [],
    createdBrandIds: [],
    startTime: Date.now(),
    downloadedImages: new Map<string, Buffer>(),
    originalImageUrls: new Map<string, string>(),
    processedRows: 0,
  };

  try {
    console.log("Starting S3 auction data import with transaction safety...");

    // Validate S3 URLs
    if (!S3DataTransformer.validateS3Url(config.auctionListingS3Path)) {
      throw new Error(`Invalid S3 URL: ${config.auctionListingS3Path}`);
    }
    if (!S3DataTransformer.validateS3Url(config.manifestS3Path)) {
      throw new Error(`Invalid S3 URL: ${config.manifestS3Path}`);
    }

    // Validate existing data in database (outside transaction)
    context.currentOperation = "Validating existing data";
    await validateExistingData(config, prisma);

    // Download and parse Excel files from S3 (outside transaction)
    console.log("Downloading and parsing Excel files from S3...");

    context.currentOperation = "Downloading auction listing file";
    progress.setCurrentFile("Auction Listing File");
    const auctionResult = await s3Handler.parseExcelFromS3(
      config.auctionListingS3Path
    );
    const auctionData = auctionResult.data;
    const auctionWorksheet = auctionResult.worksheet;

    context.currentOperation = "Downloading manifest file";
    progress.setCurrentFile("Manifest File");
    const manifestResult = await s3Handler.parseExcelFromS3(
      config.manifestS3Path
    );
    const manifestData = manifestResult.data;
    const manifestWorksheet = manifestResult.worksheet;

    console.log(
      `Found ${auctionData.length} auction listings and ${manifestData.length} manifest items`
    );

    // Pre-transaction validation and image download
    context.currentOperation = "Pre-transaction validation";
    await validateAuctionDataPreTransaction(auctionData, manifestData);
    await validateAuctionListingData(auctionData, auctionResult.headers);
    await validateManifestData(manifestData, manifestResult.headers);

    // Download all images before starting transaction
    await validateAndDownloadAuctionImages(auctionData, context);

    // Set up progress tracking
    progress.setTotal(auctionData.length + manifestData.length);

    // Execute entire operation in a single transaction
    console.log("Starting database transaction...");
    await prisma.$transaction(
      async (tx) => {
        context.transaction = tx;
        context.currentOperation = "Processing auction listings in transaction";

        // Process auction listings within transaction
        await processAuctionListingsInTransaction(
          auctionData,
          manifestData,
          auctionWorksheet,
          manifestWorksheet,
          config,
          progress,
          context
        );

        console.log("Transaction completed successfully!");
      },
      {
        timeout: 600000, // 10 minutes timeout
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      }
    );

    console.log("S3 Import completed successfully!");
    console.log(`Total S3 objects uploaded: ${context.uploadedS3Keys.length}`);
    console.log(
      `Total processing time: ${((Date.now() - context.startTime) / 1000).toFixed(2)}s`
    );
    progress.printProgress();
  } catch (error) {
    console.error("S3 Import failed, initiating rollback...", error);

    const rollbackStartTime = Date.now();
    let s3ObjectsDeleted = 0;
    let s3CleanupFailed = false;

    // Cleanup uploaded S3 objects
    if (context.uploadedS3Keys.length > 0) {
      try {
        console.log(
          `ROLLBACK: Cleaning up ${context.uploadedS3Keys.length} S3 objects...`
        );
        await cleanupS3Objects(context.uploadedS3Keys, config.imageBucketName);
        s3ObjectsDeleted = context.uploadedS3Keys.length;
        console.log(
          `ROLLBACK: Successfully deleted ${s3ObjectsDeleted} S3 objects`
        );
      } catch (cleanupError) {
        console.error("ROLLBACK: Failed to cleanup S3 objects:", cleanupError);
        s3CleanupFailed = true;
      }
    }

    const rollbackDurationMs = Date.now() - rollbackStartTime;

    // Create enhanced error with rollback details
    const rollbackError = new TransactionRollbackError(
      error instanceof Error ? error : new Error(String(error)),
      context,
      {
        databaseRolledBack: true, // Prisma automatically rolls back on transaction error
        s3ObjectsDeleted,
        s3CleanupFailed,
        rollbackDurationMs,
      }
    );

    console.error("Transaction rollback completed:", rollbackError.toJSON());
    throw rollbackError;
  } finally {
    // Don't disconnect here as it's handled by the caller
  }
}

// Transaction-aware auction processing function
async function processAuctionListingsInTransaction(
  auctionData: AuctionListingData[],
  manifestData: ManifestData[],
  auctionWorksheet: XLSX.WorkSheet,
  manifestWorksheet: XLSX.WorkSheet,
  config: S3AuctionImportConfig,
  progress: S3ImportProgress,
  context: AuctionTransactionContext
): Promise<void> {
  if (!context.transaction) {
    throw new Error("Transaction client not available in context");
  }

  const imageProcessor = new ImageProcessor(config.s3Config, {
    bucketName: config.imageBucketName,
    userPublicId: config.sellerPublicUserId,
  });

  for (const [index, auctionItem] of auctionData.entries()) {
    try {
      if (!auctionItem.TITLE) {
        console.warn(`Skipping row ${index + 1}: Missing title`);
        continue;
      }

      context.currentOperation = `Processing auction ${index + 1}/${auctionData.length}: ${auctionItem.TITLE}`;
      progress.setCurrentFile(
        `Auction ${index + 1}/${auctionData.length}: ${auctionItem.TITLE}`
      );

      console.log(`Processing: ${auctionItem.TITLE}`);

      // Create warehouse address using transaction client
      const locationAddressId = await createWarehouseAddressInTransaction(
        auctionItem,
        context
      );

      // Create auction images using transaction client and pre-downloaded images
      const imageIds = await createAuctionImagesInTransaction(
        auctionItem,
        index,
        imageProcessor,
        context,
        config
      );

      // Create auction listing using transaction client
      const auctionListing = await createAuctionListingInTransaction(
        auctionItem,
        config,
        locationAddressId!,
        imageIds,
        auctionWorksheet,
        index + 1,
        context
      );

      context.auctionListingId = auctionListing.auction_listing_id;

      // Process manifest items using transaction client
      await processManifestItemsInTransaction(
        manifestData,
        auctionListing.auction_listing_id,
        manifestWorksheet,
        progress,
        context
      );

      context.processedRows++;
      progress.incrementProcessed();

      if ((index + 1) % (config.batchSize || 10) === 0) {
        progress.printProgress();
        console.log(
          `Transaction progress: ${context.processedRows} rows processed`
        );
      }
    } catch (error) {
      console.error(`Failed to process auction item ${index + 1}`, error);
      // Don't increment errors in context as the entire transaction will rollback
      throw error; // Let transaction rollback
    }
  }

  console.log(
    `Successfully processed ${context.processedRows} auction listings in transaction`
  );
}

// Transaction-aware database operation functions

async function createWarehouseAddressInTransaction(
  auctionItem: AuctionListingData,
  context: AuctionTransactionContext
): Promise<string | null> {
  if (!context.transaction) {
    throw new Error("Transaction client not available");
  }

  try {
    // Cast transaction client to PrismaClient interface for compatibility
    // This allows us to reuse the createWarehouseAddress function logic within transaction
    const transactionPrisma = context.transaction as any;

    const addressId = await createWarehouseAddress(
      auctionItem,
      transactionPrisma
    );

    if (addressId) {
      context.createdAddressIds.push(addressId);
      console.log(`Created address in transaction: ${addressId}`);
    }

    return addressId;
  } catch (error) {
    console.error("Failed to create address in transaction", error);
    throw error; // Let transaction rollback
  }
}

// Helper function to upload image to S3
async function uploadImageToS3(
  s3Key: string,
  buffer: Buffer,
  contentType: string,
  config: S3AuctionImportConfig
): Promise<void> {
  const s3Client = new S3Client({ region: config.s3Config.region });

  const command = new PutObjectCommand({
    Bucket: config.imageBucketName,
    Key: s3Key,
    Body: buffer,
    ContentType: contentType,
    CacheControl: "max-age=31536000", // 1 year
  });

  await s3Client.send(command);
}

// Helper function to generate image URL
function generateImageUrl(
  s3Key: string,
  config: S3AuctionImportConfig
): string {
  return `https://${config.imageBucketName}.s3.amazonaws.com/${s3Key}`;
}

async function createAuctionImagesInTransaction(
  _auctionItem: AuctionListingData,
  auctionIndex: number,
  _imageProcessor: ImageProcessor,
  context: AuctionTransactionContext,
  config: S3AuctionImportConfig
): Promise<string[]> {
  if (!context.transaction) {
    throw new Error("Transaction client not available");
  }

  const imageFields = [
    "IMAGE1",
    "IMAGE2",
    "IMAGE3",
    "IMAGE4",
    "IMAGE5",
    "IMAGE6",
  ];
  const imageIds: string[] = [];

  for (const field of imageFields) {
    const imageKey = `${field}_${auctionIndex}`;
    const imageBuffer = context.downloadedImages.get(imageKey);

    if (!imageBuffer) {
      continue; // Skip if no image was downloaded for this field
    }

    try {
      // Compress image before uploading using shared utility
      const detectedFormat =
        ImageCompressionUtil.detectImageFormat(imageBuffer) || "jpeg";
      const compressionResult = await ImageCompressionUtil.compressImage(
        imageBuffer,
        detectedFormat
      );

      // Generate file names and S3 keys
      const imageId = uuidv4();
      const { extension: compressedExtension, mimeType } =
        ImageCompressionUtil.detectOutputFormat(
          compressionResult.compressedBuffer
        );
      const originalExtension = ImageCompressionUtil.getFileExtension(
        `image${detectedFormat}`
      );

      const compressedFileName = `${imageId}${compressedExtension}`;
      const originalFileName = `${imageId}_original${originalExtension}`;

      const compressedS3Key = `Images/Auction/${config.sellerPublicUserId}/${compressedFileName}`;
      const originalS3Key = `Images/Auction/${config.sellerPublicUserId}/originals/${originalFileName}`;

      // Upload compressed image (priority)
      await uploadImageToS3(
        compressedS3Key,
        compressionResult.compressedBuffer,
        mimeType,
        config
      );
      context.uploadedS3Keys.push(compressedS3Key);

      // Upload original image synchronously to ensure both uploads are tracked
      const originalMimeType =
        ImageCompressionUtil.getMimeTypeFromExtension(originalExtension);
      await uploadImageToS3(
        originalS3Key,
        compressionResult.originalBuffer,
        originalMimeType,
        config
      );
      context.uploadedS3Keys.push(originalS3Key);

      // Get the original URL for this image
      const originalUrl = context.originalImageUrls.get(imageKey) || "";

      // Create image record in database using transaction
      await context.transaction.images.create({
        data: {
          image_id: imageId,
          image_url: generateImageUrl(compressedS3Key, config),
          original_url: originalUrl,
          s3_key: compressedS3Key,
          original_s3_key: originalS3Key,
          original_image_url: generateImageUrl(originalS3Key, config),
          sort_order: 0,
          created_at: new Date(),
        },
      });

      context.createdImageIds.push(imageId);
      imageIds.push(imageId);

      console.log(
        `Created image in transaction: ${imageId} -> ${compressedS3Key}`
      );
    } catch (error) {
      console.error(`Failed to create image ${field} in transaction:`, error);
      throw error; // Let transaction rollback
    }
  }

  console.log(`Successfully created ${imageIds.length} images in transaction`);
  return imageIds;
}

async function createAuctionListingInTransaction(
  auctionItem: AuctionListingData,
  config: S3AuctionImportConfig,
  locationAddressId: string,
  imageIds: string[],
  auctionWorksheet: XLSX.WorkSheet,
  rowIndex: number,
  context: AuctionTransactionContext
): Promise<any> {
  if (!context.transaction) {
    throw new Error("Transaction client not available");
  }

  try {
    // Create a temporary prisma-like object that uses the transaction
    // This allows us to reuse the createAuctionListing function logic
    const transactionPrisma = context.transaction as PrismaClient;

    const auctionListing = await createAuctionListing(
      auctionItem,
      config,
      locationAddressId,
      imageIds,
      auctionWorksheet,
      rowIndex,
      transactionPrisma // Cast transaction to work with the function
    );

    console.log(
      `Created auction listing in transaction: ${auctionListing.auction_listing_id}`
    );
    return auctionListing;
  } catch (error) {
    console.error("Failed to create auction listing in transaction", error);
    throw error; // Let transaction rollback
  }
}

async function processManifestItemsInTransaction(
  manifestData: ManifestData[],
  auctionListingId: string,
  manifestWorksheet: XLSX.WorkSheet,
  progress: S3ImportProgress,
  context: AuctionTransactionContext
): Promise<void> {
  if (!context.transaction) {
    throw new Error("Transaction client not available");
  }

  for (const [index, manifestItem] of manifestData.entries()) {
    try {
      if (!manifestItem.TITLE || !manifestItem.SKU || !manifestItem.BRAND) {
        console.warn(`Skipping manifest item: Missing required fields`);
        continue;
      }

      // Get or create brand using transaction
      const brandId = await getOrCreateBrandInTransaction(
        S3DataTransformer.sanitizeString(manifestItem.BRAND)!,
        context
      );

      // Create product manifest using transaction
      await createProductManifestInTransaction(
        manifestItem,
        auctionListingId,
        brandId,
        manifestWorksheet,
        index + 1,
        context
      );

      progress.incrementProcessed();
    } catch (error) {
      console.error(
        `Failed to process manifest item: ${manifestItem.TITLE}`,
        error
      );
      throw error; // Let transaction rollback
    }
  }
}

async function getOrCreateBrandInTransaction(
  brandName: string,
  context: AuctionTransactionContext
): Promise<string> {
  if (!context.transaction) {
    throw new Error("Transaction client not available");
  }

  const existing = await context.transaction.brands.findFirst({
    where: { brand_name: brandName },
  });

  if (existing) {
    return existing.brand_id;
  }

  const brandId = uuidv4();
  const newBrand = await context.transaction.brands.create({
    data: {
      brand_id: brandId,
      brand_name: brandName,
      created_at: new Date(),
    },
  });

  context.createdBrandIds.push(brandId);
  console.log(`Created brand in transaction: ${brandId} -> ${brandName}`);
  return newBrand.brand_id;
}

async function createProductManifestInTransaction(
  manifestItem: ManifestData,
  auctionListingId: string,
  brandId: string,
  manifestWorksheet: XLSX.WorkSheet,
  rowIndex: number,
  context: AuctionTransactionContext
): Promise<void> {
  if (!context.transaction) {
    throw new Error("Transaction client not available");
  }

  try {
    // Cast transaction client to PrismaClient interface for compatibility
    // This allows us to reuse the createProductManifest function logic within transaction
    const transactionPrisma = context.transaction as any;

    await createProductManifest(
      manifestItem,
      auctionListingId,
      brandId,
      manifestWorksheet,
      rowIndex,
      transactionPrisma
    );

    console.log(`Created product manifest in transaction: ${manifestItem.SKU}`);
  } catch (error) {
    console.error("Failed to create product manifest in transaction", error);
    throw error; // Let transaction rollback
  }
}

// Add this function to your ListingOperations.ts file

async function validateAuctionListingData(
  auctionData: any[],
  headers: string[]
): Promise<void> {
  const requiredColumns = [
    "IMAGE1",
    "TITLE",
    "SHORT_TITLE",
    "CATEGORY1",
    "SUBCATEGORY1",
    "LOT_TYPE",
    "TOTAL_EX_RETAIL_PRICE",
    "TOTAL_UNITS",
    "SHIPPING_TYPE",
    "WAREHOUSE_LOCATION_ADDRESS1",
    "WAREHOUSE_LOCATION_CITY",
    "WAREHOUSE_LOCATION_STATE",
    "WAREHOUSE_LOCATION_STATE_CODE",
    "WAREHOUSE_LOCATION_COUNTRY",
    "WAREHOUSE_LOCATION_COUNTRY_CODE",
    "WAREHOUSE_LOCATION_ZIPCODE",
    "FREIGHT_TYPE",
    "PIECE_COUNT",
    "WEIGHT_TYPE",
    "ESTIMATED_WEIGHT",
    "FDA_REGISTERED",
    "HAZMAT",
    "LOT_PACKAGING",
    "NUMBER_OF_PALLETS",
    "PALLET_SPACES",
    "NUMBER_OF_TRUCKLOADS",
    "NUMBER_OF_SHIPMENTS",
  ];

  if (auctionData.length === 0) {
    throw new Error("Auction listing file is empty");
  }

  // Check if all required columns exist in header
  const missingColumns = requiredColumns.filter(
    (column) => !headers.includes(column)
  );

  if (missingColumns.length > 0) {
    throw new Error(
      `Missing required columns in auction listing file: ${missingColumns.join(", ")}`
    );
  }

  // Validate each row has required values
  const validationErrors: string[] = [];

  auctionData.forEach((row, index) => {
    const rowNumber = index + 1;

    // Check required non-empty fields
    const requiredNonEmptyFields = [
      "IMAGE1",
      "TITLE",
      "SHORT_TITLE",
      "CATEGORY1",
      "SUBCATEGORY1",
      "LOT_TYPE",
      "TOTAL_EX_RETAIL_PRICE",
      "TOTAL_UNITS",
      "SHIPPING_TYPE",
      "WAREHOUSE_LOCATION_ADDRESS1",
      "WAREHOUSE_LOCATION_CITY",
      "WAREHOUSE_LOCATION_STATE",
      "WAREHOUSE_LOCATION_STATE_CODE",
      "WAREHOUSE_LOCATION_COUNTRY",
      "WAREHOUSE_LOCATION_COUNTRY_CODE",
      "WAREHOUSE_LOCATION_ZIPCODE",
      "FREIGHT_TYPE",
      "PIECE_COUNT",
      "WEIGHT_TYPE",
      "ESTIMATED_WEIGHT",
      "FDA_REGISTERED",
      "HAZMAT",
      "LOT_PACKAGING",
      "NUMBER_OF_PALLETS",
      "PALLET_SPACES",
      "NUMBER_OF_TRUCKLOADS",
      "NUMBER_OF_SHIPMENTS",
    ];

    requiredNonEmptyFields.forEach((field) => {
      if (!row[field] || String(row[field]).trim() === "") {
        validationErrors.push(
          `Row ${rowNumber}: ${field} is required and cannot be empty`
        );
      }
    });

    // Validate country code format (should be 2 characters - ISO 3166-1 alpha-2)
    if (row["WAREHOUSE_LOCATION_COUNTRY_CODE"]) {
      const countryCode = String(row["WAREHOUSE_LOCATION_COUNTRY_CODE"]).trim();
      if (countryCode.length !== 2) {
        validationErrors.push(
          `Row ${rowNumber}: WAREHOUSE_LOCATION_COUNTRY_CODE should be a 2-character country code (e.g., US, CA, MX)`
        );
      }
    }

    // Validate numeric fields (must be positive numbers) - CURRENCY FIELDS
    const currencyFields = ["TOTAL_EX_RETAIL_PRICE"];

    currencyFields.forEach((field) => {
      if (
        row[field] !== null &&
        row[field] !== undefined &&
        row[field] !== ""
      ) {
        try {
          const numValue = ExcelCurrencyExtractor.parseNumberWithCurrency(
            row[field],
            field
          );
          if (numValue <= 0) {
            validationErrors.push(
              `Row ${rowNumber}: ${field} must be a valid positive number`
            );
          }
        } catch (error) {
          validationErrors.push(
            `Row ${rowNumber}: ${field} must be a valid number (got: ${row[field]})`
          );
        }
      }
    });

    // Validate numeric fields (must be positive numbers) - QUANTITY FIELDS
    const quantityFields = ["TOTAL_UNITS", "PIECE_COUNT", "ESTIMATED_WEIGHT"];

    quantityFields.forEach((field) => {
      if (
        row[field] !== null &&
        row[field] !== undefined &&
        row[field] !== ""
      ) {
        const numValue = S3DataTransformer.parseNumber(row[field]);
        if (numValue === undefined || isNaN(numValue) || numValue <= 0) {
          validationErrors.push(
            `Row ${rowNumber}: ${field} must be a valid positive number`
          );
        }
      }
    });

    // Validate boolean fields (FDA_REGISTERED, HAZMAT)
    const booleanFields = ["FDA_REGISTERED", "HAZMAT"];
    booleanFields.forEach((field) => {
      if (row[field] && row[field] !== "") {
        const boolValue = String(row[field]).toUpperCase();
        if (!["TRUE", "FALSE", "YES", "NO", "1", "0"].includes(boolValue)) {
          validationErrors.push(
            `Row ${rowNumber}: ${field} must be 'TRUE', 'FALSE', 'YES', 'NO', '1', or '0'`
          );
        }
      }
    });

    // Validate enum-like fields against known values
    const enumValidations = [
      {
        field: "SHIPPING_TYPE",
        validValues: [
          "FLAT_RATE",
          "CALCULATED_SHIPPING",
          "BUYER_ARRANGED",
          "FREE_SHIPPING",
          "LOCAL_PICKUP_ONLY",
          "BINDING_SHIPPING",
          "BUYER_PICKUP_ALLOWED",
        ],
      },
      {
        field: "FREIGHT_TYPE",
        validValues: ["SINGLE_BOX", "MULTIPLE_BOXES", "LTL", "FTL"],
      },
      {
        field: "WEIGHT_TYPE",
        validValues: [
          "MICROGRAM",
          "MILLIGRAM",
          "GRAM",
          "KILOGRAM",
          "METRIC_TON",
          "IMPERIAL_TON",
          "US_TON",
          "OUNCE",
          "POUND",
          "STONE",
        ],
      },
      {
        field: "LOT_PACKAGING",
        validValues: ["PALLETS", "FLOOR_LOADED"],
      },
    ];

    enumValidations.forEach(({ field, validValues }) => {
      if (row[field] && row[field] !== "") {
        const fieldValue = String(row[field])
          .toUpperCase()
          .replace(/\s+/g, "_");
        if (!validValues.includes(fieldValue)) {
          validationErrors.push(
            `Row ${rowNumber}: ${field} must be one of: ${validValues.join(", ")}`
          );
        }
      }
    });

    // Business logic validations
    if (row["LOT_PACKAGING"] === "PALLETS") {
      if (!row["NUMBER_OF_PALLETS"] || Number(row["NUMBER_OF_PALLETS"]) <= 0) {
        validationErrors.push(
          `Row ${rowNumber}: NUMBER_OF_PALLETS is required when LOT_PACKAGING is 'PALLETS'`
        );
      }
    }

    // Validate freight type consistency
    const freightType = row["FREIGHT_TYPE"];
    if (
      freightType === "FTL" &&
      row["NUMBER_OF_TRUCKLOADS"] &&
      Number(row["NUMBER_OF_TRUCKLOADS"]) < 1
    ) {
      validationErrors.push(
        `Row ${rowNumber}: NUMBER_OF_TRUCKLOADS should be at least 1 when FREIGHT_TYPE is 'FTL'`
      );
    }
  });

  if (validationErrors.length > 0) {
    throw new Error(
      `Auction listing validation failed:\n${validationErrors.join("\n")}`
    );
  }

  console.log(
    `Auction listing validation passed for ${auctionData.length} rows`
  );
}

// Add this function to your ListingOperations.ts file

async function validateManifestData(
  manifestData: any[],
  headers: string[]
): Promise<void> {
  const requiredColumns = [
    "BRAND",
    "CATEGORY",
    "SUBCATEGORY",
    "TITLE",
    "UPC",
    "SKU",
    "ITEM_DESCRIPTION",
    "UNIT_QTY",
    "UNIT_RETAIL",
    "CONDITION",
    "HAZMAT",
  ];

  if (manifestData.length === 0) {
    throw new Error("Manifest file is empty");
  }

  // Check if all required columns exist in the first row header check
  const missingColumns = requiredColumns.filter(
    (column) => !headers.includes(column)
  );
  if (missingColumns.length > 0) {
    throw new Error(
      `Missing required columns in manifest file: ${missingColumns.join(", ")}`
    );
  }

  // Validate each row has required values
  const validationErrors: string[] = [];
  const skuSet = new Set<string>(); // To check for duplicate SKUs

  manifestData.forEach((row, index) => {
    const rowNumber = index + 1;

    // Check required non-empty fields
    const requiredNonEmptyFields = [
      "BRAND",
      "CATEGORY",
      "SUBCATEGORY",
      "TITLE",
      "UPC",
      "SKU",
      "ITEM_DESCRIPTION",
      "UNIT_QTY",
      "UNIT_RETAIL",
      "CONDITION",
      "HAZMAT",
    ];

    requiredNonEmptyFields.forEach((field) => {
      if (!row[field] || String(row[field]).trim() === "") {
        validationErrors.push(
          `Row ${rowNumber}: ${field} is required and cannot be empty`
        );
      }
    });

    // Check for duplicate SKUs
    if (row["SKU"]) {
      const sku = String(row["SKU"]).trim();
      if (skuSet.has(sku)) {
        validationErrors.push(`Row ${rowNumber}: Duplicate SKU '${sku}' found`);
      } else {
        skuSet.add(sku);
      }
    }

    // Validate numeric fields (must be positive numbers) - CURRENCY FIELDS
    const currencyFields = ["UNIT_RETAIL"];

    currencyFields.forEach((field) => {
      if (
        row[field] !== null &&
        row[field] !== undefined &&
        row[field] !== ""
      ) {
        try {
          const numValue = ExcelCurrencyExtractor.parseNumberWithCurrency(
            row[field],
            field
          );
          if (numValue <= 0) {
            validationErrors.push(
              `Row ${rowNumber}: ${field} must be a valid positive number`
            );
          }
        } catch (error) {
          validationErrors.push(
            `Row ${rowNumber}: ${field} must be a valid number (got: ${row[field]})`
          );
        }
      }
    });

    // Validate numeric fields (must be positive numbers) - QUANTITY FIELDS
    const quantityFields = ["UNIT_QTY"];

    quantityFields.forEach((field) => {
      if (
        row[field] !== null &&
        row[field] !== undefined &&
        row[field] !== ""
      ) {
        const numValue = S3DataTransformer.parseNumber(row[field]);
        if (numValue === undefined || isNaN(numValue) || numValue <= 0) {
          validationErrors.push(
            `Row ${rowNumber}: ${field} must be a valid positive number`
          );
        }
      }
    });

    // Validate HAZMAT field (should be TRUE/FALSE/YES/NO)
    if (row["HAZMAT"] && row["HAZMAT"] !== "") {
      const hazmatValue = String(row["HAZMAT"]).toUpperCase();
      if (!["TRUE", "FALSE", "YES", "NO", "1", "0"].includes(hazmatValue)) {
        validationErrors.push(
          `Row ${rowNumber}: HAZMAT must be 'TRUE', 'FALSE', 'YES', 'NO', '1', or '0'`
        );
      }
    }

    // Validate UPC format (should be numeric and appropriate length if provided)
    if (row["UPC"] && row["UPC"] !== "") {
      const upc = String(row["UPC"]).trim();
      // UPC should be numeric and typically 12 digits, but can be 8, 12, 13, or 14 digits
      if (!/^\d{8}$|^\d{12}$|^\d{13}$|^\d{14}$/.test(upc)) {
        validationErrors.push(
          `Row ${rowNumber}: UPC must be 8, 12, 13, or 14 digits`
        );
      }
    }

    // Validate SKU format (should not contain special characters that might cause issues)
    if (row["SKU"]) {
      const sku = String(row["SKU"]).trim();
      if (sku.length > 100) {
        validationErrors.push(
          `Row ${rowNumber}: SKU cannot exceed 100 characters`
        );
      }
      // Check for potentially problematic characters
      if (/[<>'"&]/.test(sku)) {
        validationErrors.push(
          `Row ${rowNumber}: SKU contains invalid characters (<, >, ', ", &)`
        );
      }
    }

    // Validate CONDITION against known product condition types
    if (row["CONDITION"] && row["CONDITION"] !== "") {
      const validConditions = [
        "NEW_RETAIL_ECOMMERCE_READY",
        "NEW_OPEN_BOX",
        "NEW_DAMAGED_BOX",
        "NEW_BULK_PACKAGED",
        "REFURBISHED_MANUFACTURER_CERTIFIED",
        "REFURBISHED_SELLER_REFURBISHED",
        "USED_LIKE_NEW",
        "USED_GOOD",
        "USED_FAIR",
        "USED_AS_IS",
        "DAMAGED_FUNCTIONAL",
        "DAMAGED_NON_FUNCTIONAL",
        "SALVAGE_PARTS_ONLY",
        "CRACKED_BROKEN",
        "UNINSPECTED_RETURNS",
        "MIXED_CONDITION",
        "SHELF_PULLS",
        "CLOSEOUTS",
        "OVERSTOCK",
        "EXPIRED_SHORT_DATED",
        // Also accept common simplified versions
        "NEW",
        "USED",
        "REFURBISHED",
        "DAMAGED",
        "SALVAGE",
      ];

      const condition = String(row["CONDITION"])
        .toUpperCase()
        .replace(/\s+/g, "_");
      const isValidCondition = validConditions.some(
        (validCond) =>
          validCond === condition ||
          validCond.includes(condition) ||
          condition.includes(validCond.split("_")[0])
      );

      if (!isValidCondition) {
        validationErrors.push(
          `Row ${rowNumber}: CONDITION '${row["CONDITION"]}' is not a recognized condition type`
        );
      }
    }

    // Business logic validations
    // If UNIT_RETAIL is provided, UNIT_QTY should also be provided for proper calculations
    const hasUnitRetail =
      row["UNIT_RETAIL"] &&
      row["UNIT_RETAIL"] !== "" &&
      Number(row["UNIT_RETAIL"]) > 0;
    const hasUnitQty =
      row["UNIT_QTY"] && row["UNIT_QTY"] !== "" && Number(row["UNIT_QTY"]) > 0;

    if (hasUnitRetail && !hasUnitQty) {
      validationErrors.push(
        `Row ${rowNumber}: UNIT_QTY is required when UNIT_RETAIL is provided`
      );
    }

    if (hasUnitQty && !hasUnitRetail) {
      validationErrors.push(
        `Row ${rowNumber}: UNIT_RETAIL is required when UNIT_QTY is provided`
      );
    }
  });

  if (validationErrors.length > 0) {
    throw new Error(
      `Manifest validation failed:\n${validationErrors.join("\n")}`
    );
  }

  console.log(`Manifest validation passed for ${manifestData.length} rows`);
}

async function validateExistingData(
  config: S3AuctionImportConfig,
  prisma: PrismaClient
): Promise<void> {
  try {
    // Check if seller user exists
    const sellerUser = await prisma.users.findUnique({
      where: { user_id: config.sellerUserId },
    });

    if (!sellerUser) {
      throw new Error(`Seller user with ID ${config.sellerUserId} not found`);
    }

    // Check if seller profile exists
    const sellerProfile = await prisma.seller_profiles.findUnique({
      where: { seller_profile_id: config.sellerProfileId },
    });

    if (!sellerProfile) {
      throw new Error(
        `Seller profile with ID ${config.sellerProfileId} not found`
      );
    }

    // Check if seller profile belongs to seller user
    if (sellerProfile.user_id !== sellerUser.user_id) {
      throw new Error(
        "Seller profile does not belong to the specified seller user"
      );
    }

    console.log("Database validation passed");
  } catch (error) {
    console.error("Database validation failed", error);
    throw error;
  }
}

// Catalog Listings

// Main S3 Catalog Import Function
export async function executeS3CatalogImport(
  config: S3CatalogImportConfig,
  prisma: PrismaClient
): Promise<void> {
  const s3Handler = new S3FileHandler(config.s3Config);
  const progress = new S3ImportProgress();

  const imageProcessor = new ImageProcessor(config.s3Config, {
    bucketName: config.imageBucketName,
    userPublicId: config.sellerPublicUserId,
  });

  try {
    console.log("Starting S3 catalog data import...");

    // Validate S3 URLs
    if (!S3DataTransformer.validateS3Url(config.catalogListingS3Path)) {
      throw new Error(`Invalid S3 URL: ${config.catalogListingS3Path}`);
    }
    if (!S3DataTransformer.validateS3Url(config.catalogProductsS3Path)) {
      throw new Error(`Invalid S3 URL: ${config.catalogProductsS3Path}`);
    }

    // Validate existing data in database
    await validateExistingCatalogData(config, prisma);

    // Download and parse Excel files from S3
    console.log("Downloading and parsing Excel files from S3...");

    progress.setCurrentFile("Catalog Listing File");
    progress.setCurrentFile("Catalog Listing File");
    const catalogListingResult = await s3Handler.parseExcelFromS3(
      config.catalogListingS3Path
    );
    const catalogListingData = catalogListingResult.data;
    const catalogListingWorksheet = catalogListingResult.worksheet;

    await validateCatalogListingData(catalogListingData);

    progress.setCurrentFile("Catalog Products File");
    const catalogProductsResult = await s3Handler.parseExcelFromS3(
      config.catalogProductsS3Path
    );
    const catalogProductsData = catalogProductsResult.data;
    const catalogProductsWorksheet = catalogProductsResult.worksheet;

    await validateCatalogProductsData(catalogProductsData);

    console.log(
      `Found ${catalogListingData.length} catalog listings and ${catalogProductsData.length} catalog products`
    );

    // Set up progress tracking
    progress.setTotal(catalogListingData.length + catalogProductsData.length);

    // Process catalog listings
    await processCatalogListings(
      catalogListingData,
      catalogProductsData,
      catalogListingWorksheet,
      catalogProductsWorksheet,
      config,
      progress,
      prisma,
      imageProcessor
    );

    console.log("S3 Catalog Import completed successfully!");
    progress.printProgress();
  } catch (error) {
    console.error("S3 Catalog Import failed", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

async function validateCatalogListingData(
  catalogListingData: any[]
): Promise<void> {
  const requiredColumns = [
    "IMAGE",
    "NAME",
    "DESCRIPTION",
    "CATEGORY1",
    "SUBCATEGORY1",
    "CONDITION",
    "PACKAGING",
    "SHIPPING_WINDOW",
    "MINIMUM_ORDER_VALUE",
    "WAREHOUSE_LOCATION_ADDRESS1",
    "WAREHOUSE_LOCATION_CITY",
    "WAREHOUSE_LOCATION_STATE",
    "WAREHOUSE_LOCATION_COUNTRY",
    "WAREHOUSE_LOCATION_ZIPCODE",
  ];

  if (catalogListingData.length === 0) {
    throw new Error("Catalog listing file is empty");
  }

  // Check if all required columns exist in the first row (header check)
  const firstRow = catalogListingData[0];
  const missingColumns = requiredColumns.filter((col) => !(col in firstRow));

  if (missingColumns.length > 0) {
    throw new Error(
      `Missing required columns in catalog listing file: ${missingColumns.join(", ")}`
    );
  }

  // Validate each row has required values
  const validationErrors: string[] = [];

  catalogListingData.forEach((row, index) => {
    const rowNumber = index + 1;

    // Check required non-empty fields
    const requiredNonEmptyFields = [
      "NAME",
      "WAREHOUSE_LOCATION_ADDRESS1",
      "WAREHOUSE_LOCATION_CITY",
    ];

    requiredNonEmptyFields.forEach((field) => {
      if (!row[field] || String(row[field]).trim() === "") {
        validationErrors.push(
          `Row ${rowNumber}: ${field} is required and cannot be empty`
        );
      }
    });

    // Validate numeric fields - USE CURRENCY PARSER
    const numericFields = ["MINIMUM_ORDER_VALUE"];
    numericFields.forEach((field) => {
      if (
        row[field] !== null &&
        row[field] !== undefined &&
        row[field] !== ""
      ) {
        try {
          // Use CurrencyExtractor to parse currency-formatted numbers
          const numValue = ExcelCurrencyExtractor.parseNumberWithCurrency(
            row[field],
            field
          );
          if (numValue < 0) {
            validationErrors.push(
              `Row ${rowNumber}: ${field} must be a non-negative number`
            );
          }
        } catch (error) {
          validationErrors.push(
            `Row ${rowNumber}: ${field} must be a valid number (got: ${row[field]})`
          );
        }
      }
    });
  });

  if (validationErrors.length > 0) {
    throw new Error(
      `Catalog listing validation failed:\n${validationErrors.join("\n")}`
    );
  }

  console.log(
    `Catalog listing validation passed for ${catalogListingData.length} rows`
  );
}

// Add this function to your ListingOperations.ts file

async function validateCatalogProductsData(
  catalogProductsData: CatalogProductData[]
): Promise<void> {
  const requiredColumns = [
    "IMAGE",
    "BRAND",
    "CATEGORY",
    "SUBCATEGORY",
    "PACKAGING",
    "PRODUCT_NAME",
    "IDENTIFIER",
    "IDENTIFIER_TYPE",
    "SKU",
    "UNIT_RETAIL",
    "OFFER_PRICE",
    "TOTAL_UNITS",
    "TOTAL_OFFER_PRICE",
    "CONDITION",
    "HAZMAT",
  ];

  if (catalogProductsData.length === 0) {
    throw new Error("Catalog products file is empty");
  }

  // Check if all required columns exist in the first row (header check)
  const firstRow = catalogProductsData[0];
  const missingColumns = requiredColumns.filter((col) => !(col in firstRow));

  if (missingColumns.length > 0) {
    throw new Error(
      `Missing required columns in catalog products file: ${missingColumns.join(", ")}`
    );
  }

  // Validate each row has required values
  const validationErrors: string[] = [];
  const skuSet = new Set<string>(); // To check for duplicate SKUs

  catalogProductsData.forEach((row, index) => {
    const rowNumber = index + 1;

    // Check ALL required columns for non-empty values and validate format
    requiredColumns.forEach((field) => {
      const fieldValue = row[field as keyof CatalogProductData];
      if (!fieldValue || String(fieldValue).trim() === "") {
        validationErrors.push(
          `Row ${rowNumber}: ${field} is required and cannot be empty`
        );
      } else {
        // Validate CURRENCY fields - USE CURRENCY PARSER
        if (
          ["UNIT_RETAIL", "OFFER_PRICE", "TOTAL_OFFER_PRICE"].includes(field)
        ) {
          try {
            // Use CurrencyExtractor to parse currency-formatted numbers
            const numValue = ExcelCurrencyExtractor.parseNumberWithCurrency(
              fieldValue,
              field
            );
            if (numValue < 0) {
              validationErrors.push(
                `Row ${rowNumber}: ${field} must be a non-negative number`
              );
            }
          } catch (error) {
            validationErrors.push(
              `Row ${rowNumber}: ${field} must be a valid number (got: ${fieldValue})`
            );
          }
        }

        // Validate QUANTITY fields - USE REGULAR NUMBER PARSER
        if (field === "TOTAL_UNITS") {
          const numValue = Number(fieldValue);
          if (isNaN(numValue) || numValue < 0) {
            validationErrors.push(
              `Row ${rowNumber}: ${field} must be a valid non-negative number`
            );
          }
        }

        if (field === "HAZMAT") {
          const hazmatValue = String(fieldValue).toUpperCase();
          if (!["TRUE", "FALSE", "YES", "NO"].includes(hazmatValue)) {
            validationErrors.push(
              `Row ${rowNumber}: HAZMAT must be 'TRUE', 'FALSE', 'YES', or 'NO'`
            );
          }
        }
      }
    });

    // Check for duplicate SKUs
    if (row["SKU"]) {
      const sku = String(row["SKU"]).trim();
      if (skuSet.has(sku)) {
        validationErrors.push(`Row ${rowNumber}: Duplicate SKU '${sku}' found`);
      } else {
        skuSet.add(sku);
      }
    }

    // Validate parent-child relationship logic
    const isParent = row["IS_PARENT"];
    const hasParentSku =
      row["PARENT_SKU"] && String(row["PARENT_SKU"]).trim() !== "";

    if (isParent && hasParentSku) {
      validationErrors.push(
        `Row ${rowNumber}: Product cannot be both a parent (IS_PARENT=TRUE) and have a PARENT_SKU`
      );
    }

    // If IS_PARENT is explicitly "FALSE", PARENT_SKU should be present
    const isParentExplicitlyFalse =
      row["IS_PARENT"] && String(row["IS_PARENT"]).toUpperCase() === "FALSE";

    if (isParentExplicitlyFalse && !hasParentSku) {
      validationErrors.push(
        `Row ${rowNumber}: PARENT_SKU is required when IS_PARENT is FALSE`
      );
    }

    // If has variation theme, should have variation value
    const hasVariationTheme =
      row["VARIATION_THEME"] && String(row["VARIATION_THEME"]).trim() !== "";
    const hasVariationValue =
      row["VARIATION_VALUE"] && String(row["VARIATION_VALUE"]).trim() !== "";

    if (hasVariationTheme && !hasVariationValue) {
      validationErrors.push(
        `Row ${rowNumber}: VARIATION_VALUE is required when VARIATION_THEME is provided`
      );
    }

    if (hasVariationValue && !hasVariationTheme) {
      validationErrors.push(
        `Row ${rowNumber}: VARIATION_THEME is required when VARIATION_VALUE is provided`
      );
    }
  });

  if (validationErrors.length > 0) {
    throw new Error(
      `Catalog products validation failed:\n${validationErrors.join("\n")}`
    );
  }

  console.log(
    `Catalog products validation passed for ${catalogProductsData.length} rows`
  );
}

async function validateExistingCatalogData(
  config: S3CatalogImportConfig,
  prisma: PrismaClient
): Promise<void> {
  // Reuse the same validation logic as auction listings
  await validateExistingData(
    {
      sellerUserId: config.sellerUserId,
      sellerProfileId: config.sellerProfileId,
    } as any,
    prisma
  );
}

async function processCatalogListings(
  catalogListingData: CatalogOfferListingData[],
  catalogProductsData: CatalogProductData[],
  catalogListingWorksheet: XLSX.WorkSheet,
  catalogProductsWorksheet: XLSX.WorkSheet,
  config: S3CatalogImportConfig,
  progress: S3ImportProgress,
  prisma: PrismaClient,
  imageProcessor: ImageProcessor
): Promise<void> {
  for (const [index, catalogListingItem] of catalogListingData.entries()) {
    try {
      if (!catalogListingItem.NAME) {
        console.warn(`Skipping row ${index + 1}: Missing NAME`);
        progress.incrementErrors();
        continue;
      }

      progress.setCurrentFile(
        `Catalog Listing ${index + 1}/${catalogListingData.length}: ${catalogListingItem.NAME}`
      );
      console.log(`Processing: ${catalogListingItem.NAME}`);

      const locationAddressId = await createCatalogAddress(
        catalogListingItem,
        prisma
      );

      if (!locationAddressId) {
        console.warn(
          `Skipping row ${index + 1}: Missing required address information`
        );
        progress.incrementErrors();
        continue;
      }

      const imageIds = await createCatalogListingImages(
        catalogListingItem,
        prisma,
        imageProcessor
      );

      // Pass worksheet and row index for currency extraction
      const catalogListing = await createCatalogListing(
        catalogListingItem,
        config,
        locationAddressId,
        imageIds,
        catalogListingWorksheet,
        index + 1,
        prisma
      );

      await processCatalogProducts(
        catalogProductsData,
        catalogListing.catalog_listing_id,
        catalogProductsWorksheet,
        progress,
        prisma,
        imageProcessor
      );

      progress.incrementProcessed();

      if ((index + 1) % (config.batchSize || 10) === 0) {
        progress.printProgress();
      }
    } catch (error: any) {
      if (error.message.includes("Possible duplicate listing detected")) {
        console.error(`\n🚫 DUPLICATE DETECTED - Row ${index + 1}:`);
        console.error(error.message);
        console.error(`\nSkipping this listing to prevent duplicates.\n`);
      } else {
        console.error(
          `Failed to process catalog listing item ${index + 1}`,
          error
        );
      }
      progress.incrementErrors();

      if (!config.skipInvalidRows) {
        throw error;
      }
    }
  }
}

export async function processCatalogProducts(
  catalogProductsData: CatalogProductData[],
  catalogListingId: string,
  catalogProductsWorksheet: XLSX.WorkSheet,
  progress: S3ImportProgress,
  prisma: PrismaClient,
  imageProcessor: ImageProcessor
): Promise<void> {
  const sortedProducts = sortProductsByParentChild(catalogProductsData);

  console.log(
    `Processing ${sortedProducts.parents.length} parent products first, then ${sortedProducts.children.length} child products`
  );

  for (const [index, productItem] of sortedProducts.parents.entries()) {
    await processProduct(
      productItem,
      catalogListingId,
      catalogProductsWorksheet,
      index + 1,
      progress,
      prisma,
      imageProcessor
    );
  }

  for (const [index, productItem] of sortedProducts.children.entries()) {
    await processProduct(
      productItem,
      catalogListingId,
      catalogProductsWorksheet,
      sortedProducts.parents.length + index + 1,
      progress,
      prisma,
      imageProcessor
    );
  }
}

function sortProductsByParentChild(catalogProductsData: CatalogProductData[]): {
  parents: any[];
  children: any[];
} {
  const parents: any[] = [];
  const children: any[] = [];

  for (const productItem of catalogProductsData) {
    const isParent = S3DataTransformer.parseBoolean(productItem.IS_PARENT);
    const hasParentSku =
      productItem.PARENT_SKU && productItem.PARENT_SKU.trim() !== "";

    if (isParent && !hasParentSku) {
      // This is a parent product
      parents.push(productItem);
    } else if (!isParent && hasParentSku) {
      // This is a child product with a parent SKU
      children.push(productItem);
    } else if (!isParent && !hasParentSku) {
      // This is a standalone product (treat as parent)
      parents.push(productItem);
    } else {
      // Edge case: marked as parent but has parent SKU - treat as child
      console.warn(
        `Product ${productItem.SKU} is marked as parent but has parent SKU. Treating as child.`
      );
      children.push(productItem);
    }
  }

  return { parents, children };
}

async function processProduct(
  productItem: CatalogProductData,
  catalogListingId: string,
  catalogProductsWorksheet: XLSX.WorkSheet,
  rowIndex: number,
  progress: S3ImportProgress,
  prisma: PrismaClient,
  imageProcessor: ImageProcessor
): Promise<void> {
  try {
    if (!productItem.PRODUCT_NAME || !productItem.SKU || !productItem.BRAND) {
      console.warn(`Skipping catalog product: Missing required fields`);
      return;
    }

    progress.setCurrentFile(`Processing product: ${productItem.PRODUCT_NAME}`);

    const brandId = await getOrCreateBrand(
      S3DataTransformer.sanitizeString(productItem.BRAND)!,
      prisma
    );

    // Pass worksheet and row index for currency extraction
    await createCatalogProducts(
      productItem,
      catalogListingId,
      brandId,
      catalogProductsWorksheet,
      rowIndex,
      prisma,
      imageProcessor
    );

    progress.incrementProcessed();
  } catch (error) {
    console.error(
      `Failed to process catalog product: ${productItem.PRODUCT_NAME}`,
      error
    );
    progress.incrementErrors();
  }
}

interface CompressionResult {
  compressedBuffer: Buffer;
  originalBuffer: Buffer;
}

export class ImageProcessor {
  private s3Client: S3Client;
  private config: ImageProcessingConfig;

  constructor(s3Config: S3Config, imageConfig: ImageProcessingConfig) {
    this.config = imageConfig;
    this.s3Client = new S3Client({
      region: s3Config.region,
    });
  }

  /**
   * Process multiple image URLs and save to S3 and database
   */
  async processImagesAndSaveToDb(
    imageUrls: string[],
    prisma: PrismaClient,
    folder: "Auction" | "Catalog" = "Catalog"
  ): Promise<{ imageIds: string[]; imageUrls: string[] }> {
    const imageIds: string[] = [];
    const publicUrls: string[] = [];

    // Process images with concurrency limit
    const BATCH_SIZE = 3;
    for (let i = 0; i < imageUrls.length; i += BATCH_SIZE) {
      const batch = imageUrls.slice(i, i + BATCH_SIZE);
      const batchPromises = batch
        .filter((url) => url && url.trim() !== "")
        .map((url) => this.downloadAndUploadImage(url.trim(), folder, prisma));

      const batchResults = await Promise.allSettled(batchPromises);

      batchResults.forEach((result) => {
        if (result.status === "fulfilled" && result.value) {
          imageIds.push(result.value.imageId);
          publicUrls.push(result.value.publicUrl);
        }
      });

      // Small delay between batches
      if (i + BATCH_SIZE < imageUrls.length) {
        await this.delay(500);
      }
    }

    return { imageIds, imageUrls: publicUrls };
  }

  // Use shared compression utility for consistency
  async compressImage(
    buffer: Buffer,
    originalFormat: string
  ): Promise<CompressionResult> {
    return ImageCompressionUtil.compressImage(buffer, originalFormat);
  }

  /**
   * Download image from URL, upload to S3, and save to database
   */
  private async downloadAndUploadImage(
    imageUrl: string,
    folder: "Auction" | "Catalog",
    prisma: PrismaClient
  ): Promise<{ imageId: string; publicUrl: string } | null> {
    const startTime = Date.now();

    try {
      if (!this.isValidImageUrl(imageUrl)) {
        console.warn(`Invalid image URL: ${imageUrl}`);
        return null;
      }

      // console.log(`Processing image: ${imageUrl}`);

      // Download with limits to prevent Lambda issues
      const imageBuffer = await ImageService.downloadImageAdvanced(imageUrl, {
        maxFileSize: 15 * 1024 * 1024, // 15MB limit
        timeout: 12000, // 12 second download timeout
      });

      if (!imageBuffer?.buffer) return null;

      const imageId = uuidv4();
      const originalExtension = ImageCompressionUtil.getFileExtension(imageUrl);
      const detectedFormat =
        ImageCompressionUtil.detectImageFormat(imageBuffer.buffer) ||
        originalExtension.substring(1);

      // Smart compression with timeout
      const compressionResult = await this.compressImage(
        imageBuffer.buffer,
        detectedFormat
      );

      // Detect actual output format
      const { extension: compressedExtension, mimeType } =
        ImageCompressionUtil.detectOutputFormat(
          compressionResult.compressedBuffer
        );

      // Generate filenames
      const compressedFileName = `${imageId}${compressedExtension}`;
      const originalFileName = `${imageId}_original${originalExtension}`;

      // Generate S3 keys
      const compressedS3Key = `Images/${folder}/${this.config.userPublicId}/${compressedFileName}`;
      const originalS3Key = `Images/${folder}/${this.config.userPublicId}/originals/${originalFileName}`;

      // Upload compressed image (priority)
      await this.uploadToS3(
        compressedS3Key,
        compressionResult.compressedBuffer,
        mimeType
      );

      // Upload original image asynchronously (don't block)
      this.uploadToS3(
        originalS3Key,
        compressionResult.originalBuffer,
        this.getContentType(originalExtension)
      ).catch((err) =>
        console.error("Background upload of original failed:", err)
      );

      // Generate public URLs
      const compressedPublicUrl = this.generatePublicUrl(compressedS3Key);
      const originalPublicUrl = this.generatePublicUrl(originalS3Key);

      // Save to database
      await prisma.images.create({
        data: {
          image_id: imageId,
          image_url: compressedPublicUrl,
          original_url: imageUrl,
          s3_key: compressedS3Key,
          original_s3_key: originalS3Key,
          original_image_url: originalPublicUrl,
          sort_order: 0,
          created_at: new Date(),
        },
      });

      const totalTime = Date.now() - startTime;
      // console.log(`Total processing time: ${totalTime}ms for ${imageUrl}`);
      // console.log(`Result: ${compressedPublicUrl}`);

      return { imageId, publicUrl: compressedPublicUrl };
    } catch (error) {
      const totalTime = Date.now() - startTime;
      console.error(
        `Processing failed after ${totalTime}ms for ${imageUrl}:`,
        error
      );
      return null;
    }
  }

  private detectOutputFormat(buffer: Buffer): ImageFormatInfo {
    return ImageCompressionUtil.detectOutputFormat(buffer);
  }

  detectImageFormat(buffer: Buffer): string | null {
    return ImageCompressionUtil.detectImageFormat(buffer);
  }

  private async uploadToS3(
    key: string,
    buffer: Buffer,
    contentType: string
  ): Promise<void> {
    const command = new PutObjectCommand({
      Bucket: this.config.bucketName,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      CacheControl: "max-age=31536000", // 1 year
    });

    await this.s3Client.send(command);
  }

  private generatePublicUrl(s3Key: string): string {
    return `https://${this.config.bucketName}.s3.amazonaws.com/${s3Key}`;
  }

  private isValidImageUrl(url: string): boolean {
    try {
      const parsedUrl = new URL(url);

      // Check if it's HTTP/HTTPS
      if (!["http:", "https:"].includes(parsedUrl.protocol)) return false;

      // Check for image file extensions in the URL path
      const imageExtensions = [
        ".jpg",
        ".jpeg",
        ".png",
        ".gif",
        ".webp",
        ".bmp",
        ".svg",
      ];
      const path = parsedUrl.pathname.toLowerCase();

      // Return true if the URL contains any image extension
      return imageExtensions.some((ext) => path.includes(ext));
    } catch {
      return false;
    }
  }

  private getContentType(extension: string): string {
    return ImageCompressionUtil.getMimeTypeFromExtension(extension);
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Upload buffer directly to S3 for transaction-aware operations
   */
  async uploadBufferToS3(buffer: Buffer, fileName: string): Promise<string> {
    const imageId = uuidv4();
    const extension = this.detectOutputFormat(buffer).extension;
    const s3Key = `Images/Auction/${this.config.userPublicId}/${fileName}-${imageId}${extension}`;

    await this.uploadToS3(
      s3Key,
      buffer,
      this.detectOutputFormat(buffer).mimeType
    );

    return s3Key;
  }

  /**
   * Get public URL for S3 key
   */
  getImageUrl(s3Key: string): string {
    return this.generatePublicUrl(s3Key);
  }
}

/**
 * Helper function to extract image URLs from product data
 */
export function extractImageUrls(item: any): string[] {
  const imageUrls: string[] = [];

  // Handle both single IMAGE field and multiple IMAGE1-6 fields
  if (item.IMAGE) {
    imageUrls.push(item.IMAGE);
  }

  // Also check for IMAGE1, IMAGE2, etc.
  for (let i = 1; i <= 6; i++) {
    const imageField = `IMAGE${i}`;
    if (item[imageField]) {
      imageUrls.push(item[imageField]);
    }
  }

  return imageUrls.filter((url) => url && url.trim() !== "");
}
