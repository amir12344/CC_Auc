import * as XLSX from "xlsx";
import { PrismaClient } from "../../../lambda-layers/core-layer/nodejs/prisma/generated/client";
import {
  createAuctionImages,
  createAuctionListing,
  createProductManifest,
  createWarehouseAddress,
  getOrCreateBrand,
} from "./ListingDatabaseOperations";

import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Readable } from "stream";

// AWS S3 Configuration
export interface S3Config {
  region: string;
}

// Enhanced ImportConfig for S3
export interface S3ImportConfig {
  // Required: Existing user and seller profile IDs
  sellerUserId: string;
  sellerProfileId: string;

  // S3 file paths
  auctionListingS3Path: string; // e.g., "s3://bucket-name/path/to/auction-file.xlsx"
  manifestS3Path: string; // e.g., "s3://bucket-name/path/to/manifest-file.xlsx"

  // AWS S3 Configuration
  s3Config: S3Config;

  // Optional: Default auction settings
  defaultMinimumBid?: number;
  defaultAuctionDurationHours?: number;
  defaultShippingType?: string;

  // Optional: Validation settings
  validateImages?: boolean;
  skipInvalidRows?: boolean;
  batchSize?: number;
}

// S3 Utilities
class S3FileHandler {
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
  async parseExcelFromS3(s3Url: string): Promise<any[]> {
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
      });

      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);

      console.log(`Successfully parsed ${data.length} rows from ${s3Url}`);
      return data;
    } catch (error) {
      console.error(`Failed to parse Excel file from S3: ${s3Url}`, error);
      throw error;
    }
  }
}

// Enhanced Data Transformer for S3 imports
export class S3DataTransformer {
  static sanitizeString(value: any): string | null {
    if (value === null || value === undefined || value === "") {
      return null;
    }
    return String(value).trim();
  }

  static parseNumber(value: any): number | null {
    if (value === null || value === undefined || value === "") {
      return null;
    }
    const num = Number(value);
    return isNaN(num) ? null : num;
  }

  static parseDecimal(value: any, precision: number = 4): number | null {
    const num = this.parseNumber(value);
    if (num === null) return null;
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
class S3ImportProgress {
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

// Main S3 Import Function
export async function executeS3Import(
  config: S3ImportConfig,
  prisma: PrismaClient
): Promise<void> {
  const s3Handler = new S3FileHandler(config.s3Config);
  const progress = new S3ImportProgress();

  try {
    console.log("Starting S3 auction data import...");

    // Validate S3 URLs
    if (!S3DataTransformer.validateS3Url(config.auctionListingS3Path)) {
      throw new Error(`Invalid S3 URL: ${config.auctionListingS3Path}`);
    }
    if (!S3DataTransformer.validateS3Url(config.manifestS3Path)) {
      throw new Error(`Invalid S3 URL: ${config.manifestS3Path}`);
    }

    // Validate existing data in database
    await validateExistingData(config, prisma);

    // Download and parse Excel files from S3
    console.log("Downloading and parsing Excel files from S3...");

    progress.setCurrentFile("Auction Listing File");
    const auctionData = await s3Handler.parseExcelFromS3(
      config.auctionListingS3Path
    );

    progress.setCurrentFile("Manifest File");
    const manifestData = await s3Handler.parseExcelFromS3(
      config.manifestS3Path
    );

    console.log(
      `Found ${auctionData.length} auction listings and ${manifestData.length} manifest items`
    );

    // Set up progress tracking
    progress.setTotal(auctionData.length + manifestData.length);

    // Process auction listings
    await processAuctionListings(
      auctionData,
      manifestData,
      config,
      progress,
      prisma
    );

    console.log("S3 Import completed successfully!");
    progress.printProgress();
  } catch (error) {
    console.error("S3 Import failed", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

async function validateExistingData(
  config: S3ImportConfig,
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

async function processAuctionListings(
  auctionData: any[],
  manifestData: any[],
  config: S3ImportConfig,
  progress: S3ImportProgress,
  prisma: PrismaClient
): Promise<void> {
  for (const [index, auctionItem] of auctionData.entries()) {
    try {
      if (!auctionItem.TITLE) {
        console.warn(`Skipping row ${index + 1}: Missing title`);
        progress.incrementErrors();
        continue;
      }

      progress.setCurrentFile(
        `Auction ${index + 1}/${auctionData.length}: ${auctionItem.TITLE}`
      );
      console.log(`Processing: ${auctionItem.TITLE}`);

      // Create warehouse address if data exists
      const locationAddressId = await createWarehouseAddress(
        auctionItem,
        prisma
      );

      // Create images
      const imageIds = await createAuctionImages(auctionItem, prisma);

      // Create auction listing
      const auctionListing = await createAuctionListing(
        auctionItem,
        config,
        locationAddressId!,
        imageIds,
        prisma
      );

      // Process manifest items for this auction
      await processManifestItems(
        manifestData,
        auctionListing.auction_listing_id,
        progress,
        prisma
      );

      progress.incrementProcessed();

      if ((index + 1) % (config.batchSize || 10) === 0) {
        progress.printProgress();
      }
    } catch (error) {
      console.error(`Failed to process auction item ${index + 1}`, error);
      progress.incrementErrors();

      if (!config.skipInvalidRows) {
        throw error;
      }
    }
  }
}

async function processManifestItems(
  manifestData: any[],
  auctionListingId: string,
  progress: S3ImportProgress,
  prisma: PrismaClient
): Promise<void> {
  for (const manifestItem of manifestData) {
    try {
      if (!manifestItem.TITLE || !manifestItem.SKU || !manifestItem.BRAND) {
        console.warn(`Skipping manifest item: Missing required fields`);
        continue;
      }

      progress.setCurrentFile(`Processing manifest: ${manifestItem.TITLE}`);

      // Get or create brand
      const brandId = await getOrCreateBrand(
        S3DataTransformer.sanitizeString(manifestItem.BRAND)!,
        prisma
      );

      // Create product manifest
      await createProductManifest(
        manifestItem,
        auctionListingId,
        brandId,
        prisma
      );

      progress.incrementProcessed();
    } catch (error) {
      console.error(
        `Failed to process manifest item: ${manifestItem.TITLE}`,
        error
      );
      progress.incrementErrors();
    }
  }
}
