import {
  DeleteObjectsCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

import { v4 as uuidv4 } from "uuid";

import { importModuleFromLayer } from "../../importLayer";
import ImageService from "../../utilities/image-downloader";

export interface S3Config {
  region: string;
}

export interface ImageProcessingConfig {
  bucketName: string;
  userPublicId: string;
}

interface TransactionContext {
  uploadedS3Keys: string[];
  createdImageIds: string[];
  transaction: any;
}

interface CompressionResult {
  compressedBuffer: Buffer;
  originalBuffer: Buffer;
}

interface ImageProcessingResult {
  imageId: string;
  publicUrl: string;
  originalUrl: string;
}

interface EnhancedImageProcessingResult extends ImageProcessingResult {
  s3Keys: string[];
  originalImageUrl: string;
  s3Key: string;
  originalS3Key: string;
}

export class ParallelImageProcessor {
  private s3Client: S3Client;
  private config: ImageProcessingConfig;

  constructor(s3Config: S3Config, imageConfig: ImageProcessingConfig) {
    this.config = imageConfig;
    this.s3Client = new S3Client({
      region: s3Config.region,
    });
  }

  /**
   * Download and process ALL images in parallel with maximum concurrency
   * This is the key optimization - we download all images at once
   */
  async downloadAllImagesParallel(
    imageUrls: string[],
    transaction: any,
    folder: "Auction" | "Catalog" = "Catalog",
    ctx: TransactionContext
  ): Promise<Array<ImageProcessingResult | null>> {
    if (imageUrls.length === 0) {
      return [];
    }

    console.log(`Starting parallel download of ${imageUrls.length} images...`);
    const startTime = Date.now();

    // PHASE 1: Download all images in parallel with high concurrency
    const DOWNLOAD_CONCURRENCY = 15; // High concurrency for downloads
    const downloadResults = await this.processInBatches(
      imageUrls,
      DOWNLOAD_CONCURRENCY,
      (url) => this.downloadImageOnly(url)
    );

    const downloadTime = Date.now() - startTime;

    // CRITICAL VALIDATION: Ensure ALL downloads succeeded
    const successfulDownloads = downloadResults.filter((r) => r !== null);
    const failedDownloads = downloadResults.filter((r) => r === null);

    if (failedDownloads.length > 0) {
      throw new Error(
        `CRITICAL: ${failedDownloads.length}/${imageUrls.length} image downloads failed. ` +
          `Transaction will be rolled back and S3 uploads cleaned up. ` +
          `Please verify all image URLs are accessible before retrying.`
      );
    }

    console.log(
      `Downloaded ${successfulDownloads.length}/${imageUrls.length} images in ${downloadTime}ms`
    );

    // PHASE 2: Process and compress all downloaded images in parallel
    const processingStartTime = Date.now();
    const processingResults = await this.processInBatches(
      downloadResults,
      10, // Lower concurrency for CPU-intensive compression
      (downloadResult, index) => {
        if (!downloadResult) return Promise.resolve(null);
        return this.processDownloadedImage(
          downloadResult,
          imageUrls[index],
          folder
        );
      }
    );

    const processingTime = Date.now() - processingStartTime;
    console.log(
      `Processed ${processingResults.filter((r) => r).length} images in ${processingTime}ms`
    );

    // PHASE 3: Upload all processed images to S3 in parallel
    const uploadStartTime = Date.now();
    const uploadResults = await this.processInBatches(
      processingResults,
      20, // High concurrency for uploads
      (processedResult, index) => {
        if (!processedResult) return Promise.resolve(null);
        return this.uploadProcessedImage(
          processedResult,
          imageUrls[index],
          folder,
          ctx
        );
      }
    );

    const uploadTime = Date.now() - uploadStartTime;
    console.log(
      `Uploaded ${uploadResults.filter((r) => r).length} images in ${uploadTime}ms`
    );

    // PHASE 4: Save all image records to database in batches
    const dbStartTime = Date.now();
    const dbResults = await this.saveImageRecordsToDatabase(
      uploadResults.filter((r) => r) as Array<EnhancedImageProcessingResult>,
      transaction,
      ctx
    );

    const dbTime = Date.now() - dbStartTime;
    const totalTime = Date.now() - startTime;

    console.log(`Saved ${dbResults.length} image records in ${dbTime}ms`);
    console.log(
      `Total parallel processing time: ${totalTime}ms for ${imageUrls.length} images`
    );
    console.log(
      `Average time per image: ${(totalTime / imageUrls.length).toFixed(2)}ms`
    );

    return dbResults;
  }

  /**
   * Process images to S3 ONLY - prepare database records but don't save them yet
   * This allows you to upload to S3 outside transaction, then save records inside transaction
   */
  async processImagesToS3Only(
    imageUrls: string[],
    folder: "Auction" | "Catalog" = "Catalog",
    ctx: TransactionContext
  ): Promise<Array<any>> {
    if (imageUrls.length === 0) {
      return [];
    }

    console.log(`Processing ${imageUrls.length} images to S3 only...`);
    const startTime = Date.now();

    // PHASE 1: Download all images in parallel
    const DOWNLOAD_CONCURRENCY = 15;
    const downloadResults = await this.processInBatches(
      imageUrls,
      DOWNLOAD_CONCURRENCY,
      (url) => this.downloadImageOnly(url)
    );

    const downloadTime = Date.now() - startTime;

    // Validate downloads
    const successfulDownloads = downloadResults.filter((r) => r !== null);
    const failedDownloads = downloadResults.filter((r) => r === null);

    if (failedDownloads.length > 0) {
      throw new Error(
        `CRITICAL: ${failedDownloads.length}/${imageUrls.length} image downloads failed. ` +
          `Please verify all image URLs are accessible.`
      );
    }

    console.log(
      `Downloaded ${successfulDownloads.length}/${imageUrls.length} images in ${downloadTime}ms`
    );

    // PHASE 2: Process and compress all downloaded images
    const processingStartTime = Date.now();
    const processingResults = await this.processInBatches(
      downloadResults,
      10,
      (downloadResult, index) => {
        if (!downloadResult) return Promise.resolve(null);
        return this.processDownloadedImage(
          downloadResult,
          imageUrls[index],
          folder
        );
      }
    );

    const processingTime = Date.now() - processingStartTime;
    console.log(
      `Processed ${processingResults.filter((r) => r).length} images in ${processingTime}ms`
    );

    // PHASE 3: Upload all processed images to S3
    const uploadStartTime = Date.now();
    const uploadResults = await this.processInBatches(
      processingResults,
      20,
      (processedResult, index) => {
        if (!processedResult) return Promise.resolve(null);
        return this.uploadProcessedImageToS3Only(
          processedResult,
          imageUrls[index],
          folder,
          ctx
        );
      }
    );

    const uploadTime = Date.now() - uploadStartTime;
    console.log(
      `Uploaded ${uploadResults.filter((r) => r).length} images in ${uploadTime}ms`
    );

    // PHASE 4: Prepare database records (but don't save them yet)
    const dbRecords = uploadResults
      .filter((r) => r !== null)
      .map((result) => ({
        image_id: result!.imageId,
        image_url: result!.publicUrl,
        original_url: result!.originalUrl,
        s3_key: result!.s3Key,
        original_s3_key: result!.originalS3Key,
        original_image_url: result!.originalImageUrl,
        sort_order: 0,
        created_at: new Date(),
      }));

    const totalTime = Date.now() - startTime;
    console.log(
      `Prepared ${dbRecords.length} image records for database in ${totalTime}ms`
    );
    console.log(
      `Average time per image: ${(totalTime / imageUrls.length).toFixed(2)}ms`
    );

    return dbRecords;
  }

  /**
   * Process items in batches with specified concurrency
   */
  private async processInBatches<T, R>(
    items: T[],
    concurrency: number,
    processor: (item: T, index: number) => Promise<R>
  ): Promise<R[]> {
    const results: R[] = [];

    for (let i = 0; i < items.length; i += concurrency) {
      const batch = items.slice(i, i + concurrency);
      const batchPromises = batch.map((item, batchIndex) =>
        processor(item, i + batchIndex)
      );

      const batchResults = await Promise.allSettled(batchPromises);

      // Check for failures in ALL phases
      const failures: { index: number; error: any }[] = [];

      batchResults.forEach((result, batchIndex) => {
        const globalIndex = i + batchIndex;
        if (result.status === "fulfilled") {
          results[globalIndex] = result.value;
        } else {
          failures.push({
            index: globalIndex,
            error: result.reason,
          });
          console.error(`Batch item ${globalIndex} failed:`, result.reason);
        }
      });

      // THROW IMMEDIATELY on any download failures
      if (failures.length > 0) {
        const processorName = processor.toString();
        const isDownloadPhase =
          processorName.includes("downloadImageOnly") ||
          processorName.includes("downloadImage");

        if (isDownloadPhase) {
          const failedUrls = failures.map((f) => `index ${f.index}`).join(", ");
          throw new Error(
            `Critical: Failed to download ${failures.length} image(s) at ${failedUrls}. ` +
              `All database operations will be rolled back and S3 uploads cleaned up.`
          );
        }

        // For non-download phases, still track failures but don't throw
        failures.forEach((failure) => {
          results[failure.index] = null as R;
        });
      }
    }

    return results;
  }

  /**
   * PHASE 1: Download image only (no processing yet)
   */
  private async downloadImageOnly(url: string): Promise<{
    buffer: Buffer;
    contentType: string;
    detectedFormat: string;
    url: string;
  } | null> {
    try {
      if (!this.isValidImageUrl(url)) {
        throw new Error(`Invalid image URL: ${url}`);
      }

      let downloadUrl = url;
      if (this.isGoogleDriveUrl(url)) {
        downloadUrl = this.convertGoogleDriveUrl(url);
      }

      const imageBuffer = await ImageService.downloadImageAdvanced(
        downloadUrl,
        {
          maxFileSize: 15 * 1024 * 1024, // 15MB limit
          timeout: 60000, // 60 second timeout for parallel processing
        }
      );

      if (!imageBuffer?.buffer) {
        throw new Error(`Failed to download image from: ${url}`);
      }

      const detectedFormat =
        this.detectImageFormat(imageBuffer.buffer) || "jpeg";

      return {
        buffer: imageBuffer.buffer,
        contentType: imageBuffer.contentType,
        detectedFormat,
        url: downloadUrl,
      };
    } catch (error) {
      console.error(`Download failed for ${url}:`, error);
      throw error; // Re-throw to trigger rollback
    }
  }

  /**
   * PHASE 2: Process downloaded image (compression, format conversion)
   */
  private async processDownloadedImage(
    downloadResult: {
      buffer: Buffer;
      contentType: string;
      detectedFormat: string;
      url: string;
    },
    originalUrl: string,
    folder: string
  ): Promise<{
    compressedBuffer: Buffer;
    originalBuffer: Buffer;
    compressedExtension: string;
    originalExtension: string;
    compressedMimeType: string;
    originalMimeType: string;
    imageId: string;
  } | null> {
    try {
      const imageId = uuidv4();
      const originalExtension = this.getFileExtension(originalUrl);

      // Smart compression
      const compressionResult = await this.compressImage(
        downloadResult.buffer,
        downloadResult.detectedFormat
      );

      // Detect actual output format
      const { extension: compressedExtension, mimeType: compressedMimeType } =
        this.detectOutputFormat(compressionResult.compressedBuffer);

      return {
        compressedBuffer: compressionResult.compressedBuffer,
        originalBuffer: compressionResult.originalBuffer,
        compressedExtension,
        originalExtension,
        compressedMimeType,
        originalMimeType: downloadResult.contentType,
        imageId,
      };
    } catch (error) {
      console.error(`Processing failed for ${originalUrl}:`, error);
      return null; // Don't throw here, just skip this image
    }
  }

  /**
   * PHASE 3: Upload processed image to S3
   */
  private async uploadProcessedImage(
    processedResult: {
      compressedBuffer: Buffer;
      originalBuffer: Buffer;
      compressedExtension: string;
      originalExtension: string;
      compressedMimeType: string;
      originalMimeType: string;
      imageId: string;
    },
    originalUrl: string,
    folder: string,
    ctx: TransactionContext
  ): Promise<EnhancedImageProcessingResult | null> {
    try {
      const { imageId } = processedResult;

      // Generate filenames
      const compressedFileName = `${imageId}${processedResult.compressedExtension}`;
      const originalFileName = `${imageId}_original${processedResult.originalExtension}`;

      // Generate S3 keys
      const compressedS3Key = `Images/${folder}/${this.config.userPublicId}/${compressedFileName}`;
      const originalS3Key = `Images/${folder}/${this.config.userPublicId}/originals/${originalFileName}`;

      // Upload both compressed and original in parallel
      await Promise.all([
        this.uploadToS3(
          compressedS3Key,
          processedResult.compressedBuffer,
          processedResult.compressedMimeType
        ),
        this.uploadToS3(
          originalS3Key,
          processedResult.originalBuffer,
          processedResult.originalMimeType
        ),
      ]);

      // Track S3 keys for cleanup
      ctx.uploadedS3Keys.push(compressedS3Key, originalS3Key);

      // Generate public URLs
      const compressedPublicUrl = this.generatePublicUrl(compressedS3Key);
      const originalPublicUrl = this.generatePublicUrl(originalS3Key);

      return {
        imageId,
        publicUrl: compressedPublicUrl,
        originalUrl,
        s3Keys: [compressedS3Key, originalS3Key],
        // Additional data for database record
        originalImageUrl: originalPublicUrl!,
        s3Key: compressedS3Key,
        originalS3Key: originalS3Key,
      };
    } catch (error) {
      console.error(`Upload failed for ${originalUrl}:`, error);
      return null; // Don't throw here, just skip this image
    }
  }

  /**
   * Upload processed image to S3 and return data for database record creation
   */
  private async uploadProcessedImageToS3Only(
    processedResult: {
      compressedBuffer: Buffer;
      originalBuffer: Buffer;
      compressedExtension: string;
      originalExtension: string;
      compressedMimeType: string;
      originalMimeType: string;
      imageId: string;
    },
    originalUrl: string,
    folder: string,
    ctx: TransactionContext
  ): Promise<{
    imageId: string;
    publicUrl: string;
    originalUrl: string;
    s3Key: string;
    originalS3Key: string;
    originalImageUrl: string;
  } | null> {
    try {
      const { imageId } = processedResult;

      // Generate filenames
      const compressedFileName = `${imageId}${processedResult.compressedExtension}`;
      const originalFileName = `${imageId}_original${processedResult.originalExtension}`;

      // Generate S3 keys
      const compressedS3Key = `Images/${folder}/${this.config.userPublicId}/${compressedFileName}`;
      const originalS3Key = `Images/${folder}/${this.config.userPublicId}/originals/${originalFileName}`;

      // Upload both compressed and original in parallel
      await Promise.all([
        this.uploadToS3(
          compressedS3Key,
          processedResult.compressedBuffer,
          processedResult.compressedMimeType
        ),
        this.uploadToS3(
          originalS3Key,
          processedResult.originalBuffer,
          processedResult.originalMimeType
        ),
      ]);

      // Track S3 keys for potential cleanup
      ctx.uploadedS3Keys.push(compressedS3Key, originalS3Key);

      // Generate public URLs
      const compressedPublicUrl = this.generatePublicUrl(compressedS3Key);
      const originalPublicUrl = this.generatePublicUrl(originalS3Key);

      return {
        imageId,
        publicUrl: compressedPublicUrl,
        originalUrl,
        s3Key: compressedS3Key,
        originalS3Key: originalS3Key,
        originalImageUrl: originalPublicUrl,
      };
    } catch (error) {
      console.error(`S3 upload failed for ${originalUrl}:`, error);
      return null;
    }
  }

  /**
   * PHASE 4: Save all image records to database in batches
   */
  private async saveImageRecordsToDatabase(
    uploadResults: Array<EnhancedImageProcessingResult>,
    transaction: any,
    ctx: TransactionContext
  ): Promise<Array<ImageProcessingResult>> {
    if (uploadResults.length === 0) {
      return [];
    }

    console.log(`Saving ${uploadResults.length} image records to database...`);

    // Create database records in batches for better performance
    const BATCH_SIZE = 50;
    const savedResults: Array<ImageProcessingResult> = [];

    for (let i = 0; i < uploadResults.length; i += BATCH_SIZE) {
      const batch = uploadResults.slice(i, i + BATCH_SIZE);

      // Prepare batch data
      const imageCreateInputs = batch.map((result) => ({
        image_id: result.imageId,
        image_url: result.publicUrl,
        original_url: result.originalUrl,
        s3_key: result.s3Key,
        original_s3_key: result.originalS3Key,
        original_image_url: result.originalImageUrl,
        sort_order: 0,
        created_at: new Date(),
      }));

      // Insert batch
      await transaction.images.createMany({
        data: imageCreateInputs,
        skipDuplicates: true,
      });

      // Track created image IDs
      batch.forEach((result) => {
        ctx.createdImageIds.push(result.imageId);
        savedResults.push({
          imageId: result.imageId,
          publicUrl: result.publicUrl,
          originalUrl: result.originalUrl,
        });
      });

      console.log(
        `Saved batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(uploadResults.length / BATCH_SIZE)}`
      );
    }

    return savedResults;
  }

  /**
   * Smart image compression with format optimization
   */
  private async compressImage(
    buffer: Buffer,
    originalFormat: string
  ): Promise<CompressionResult> {
    const originalSize = buffer.length;

    try {
      let sharpInstance = (await importModuleFromLayer())?.sharpInstance(
        buffer
      )!;

      // Get image metadata
      const metadata = await sharpInstance.metadata();

      // Resize logic - optimized for parallel processing
      const maxWidth = 1200;
      if (metadata.width && metadata.width > maxWidth) {
        sharpInstance = sharpInstance.resize(maxWidth, null, {
          withoutEnlargement: true,
          fit: "inside",
          kernel: "nearest", // Fastest resize algorithm
        });
      }

      // Smart format selection based on image characteristics
      let compressedBuffer: Buffer;

      if (originalSize < 300 * 1024) {
        // Small images - Use WebP for speed
        compressedBuffer = (await Promise.race([
          sharpInstance.webp({ quality: 85, effort: 2 }).toBuffer(), // Reduced effort for speed
          this.timeoutPromise(4000, "WebP compression timeout"),
        ])) as Buffer;
      } else if (originalSize > 3 * 1024 * 1024) {
        // Large images - Use JPEG for speed
        compressedBuffer = (await Promise.race([
          sharpInstance.jpeg({ quality: 78, progressive: true }).toBuffer(),
          this.timeoutPromise(5000, "JPEG compression timeout"),
        ])) as Buffer;
      } else {
        // Medium images - Try AVIF with timeout, fallback to WebP
        try {
          compressedBuffer = (await Promise.race([
            sharpInstance.avif({ quality: 72, effort: 1 }).toBuffer(),
            this.timeoutPromise(6000, "AVIF compression timeout"),
          ])) as Buffer;
        } catch (avifError) {
          // Quick fallback to WebP
          sharpInstance = (await importModuleFromLayer())?.sharpInstance(
            buffer
          )!;
          if (metadata.width && metadata.width > maxWidth) {
            sharpInstance = sharpInstance.resize(maxWidth, null, {
              withoutEnlargement: true,
              fit: "inside",
              kernel: "nearest",
            });
          }
          compressedBuffer = await sharpInstance
            .webp({ quality: 80, effort: 2 })
            .toBuffer();
        }
      }

      return {
        compressedBuffer,
        originalBuffer: buffer,
      };
    } catch (error) {
      console.error("Compression failed, using original:", error);
      return {
        compressedBuffer: buffer,
        originalBuffer: buffer,
      };
    }
  }

  /**
   * Detect output format from compressed buffer
   */
  private detectOutputFormat(buffer: Buffer): {
    extension: string;
    mimeType: string;
  } {
    const magic = buffer.slice(0, 12);

    // AVIF magic bytes
    if (magic.indexOf(Buffer.from("ftypavif", "ascii")) !== -1) {
      return { extension: ".avif", mimeType: "image/avif" };
    }

    // WebP magic bytes
    if (
      magic[0] === 0x52 &&
      magic[1] === 0x49 &&
      magic[2] === 0x46 &&
      magic[3] === 0x46 &&
      magic[8] === 0x57 &&
      magic[9] === 0x45 &&
      magic[10] === 0x42 &&
      magic[11] === 0x50
    ) {
      return { extension: ".webp", mimeType: "image/webp" };
    }

    // JPEG magic bytes
    if (magic[0] === 0xff && magic[1] === 0xd8 && magic[2] === 0xff) {
      return { extension: ".jpg", mimeType: "image/jpeg" };
    }

    return { extension: ".jpg", mimeType: "image/jpeg" };
  }

  /**
   * Detect image format from buffer
   */
  private detectImageFormat(buffer: Buffer): string | null {
    if (buffer.length < 12) return null;

    // JPEG
    if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
      return "jpeg";
    }

    // PNG
    if (
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47
    ) {
      return "png";
    }

    // GIF
    if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) {
      return "gif";
    }

    // WebP
    if (
      buffer[0] === 0x52 &&
      buffer[1] === 0x49 &&
      buffer[2] === 0x46 &&
      buffer[3] === 0x46 &&
      buffer[8] === 0x57 &&
      buffer[9] === 0x45 &&
      buffer[10] === 0x42 &&
      buffer[11] === 0x50
    ) {
      return "webp";
    }

    // BMP
    if (buffer[0] === 0x42 && buffer[1] === 0x4d) {
      return "bmp";
    }

    return null;
  }

  /**
   * Upload buffer to S3
   */
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

  /**
   * Generate public URL for S3 object
   */
  private generatePublicUrl(s3Key: string): string {
    return `https://${this.config.bucketName}.s3.amazonaws.com/${s3Key}`;
  }

  /**
   * Validate image URL
   */
  private isValidImageUrl(url: string): boolean {
    try {
      const parsedUrl = new URL(url);
      if (!["http:", "https:"].includes(parsedUrl.protocol)) return false;

      // Check for Google Drive URLs
      if (this.isGoogleDriveUrl(url)) {
        return true;
      }

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
      return imageExtensions.some((ext) => path.includes(ext));
    } catch {
      return false;
    }
  }

  /**
   * Check if URL is a Google Drive URL - updated to include usercontent domain
   */
  private isGoogleDriveUrl(url: string): boolean {
    return (
      url.includes("drive.google.com/file/d/") ||
      url.includes("drive.google.com/uc?") ||
      url.includes("drive.usercontent.google.com")
    );
  }

  /**
   * Convert Google Drive sharing URLs to direct download URLs
   */
  private convertGoogleDriveUrl(url: string): string {
    const fileIdMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileIdMatch) {
      const fileId = fileIdMatch[1];
      return `https://drive.usercontent.google.com/download?id=${fileId}&export=download&authuser=0&confirm=t`;
    }

    const ucMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (ucMatch && url.includes("drive.google.com")) {
      const fileId = ucMatch[1];
      return `https://drive.usercontent.google.com/download?id=${fileId}&export=download&authuser=0&confirm=t`;
    }

    return url;
  }
  /**
   * Get file extension from URL
   */
  private getFileExtension(url: string): string {
    try {
      const parsedUrl = new URL(url);
      const path = parsedUrl.pathname;
      const lastDot = path.lastIndexOf(".");

      if (lastDot === -1) return ".jpg";

      const extension = path.substring(lastDot).toLowerCase();
      const validExtensions = [
        ".jpg",
        ".jpeg",
        ".png",
        ".gif",
        ".webp",
        ".bmp",
      ];

      return validExtensions.includes(extension) ? extension : ".jpg";
    } catch {
      return ".jpg";
    }
  }

  /**
   * Create timeout promise for racing against slow operations
   */
  private timeoutPromise<T>(ms: number, message: string): Promise<T> {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error(message)), ms);
    });
  }

  /**
   * Static method for S3 cleanup in case of failures
   */
  static async cleanupS3Objects(
    s3Keys: string[],
    bucketName: string
  ): Promise<void> {
    if (s3Keys.length === 0) return;

    const s3Client = new S3Client({ region: "us-east-1" });

    try {
      console.log(`Cleaning up ${s3Keys.length} S3 objects...`);

      // Delete objects in batches (S3 allows max 1000 per request)
      const batchSize = 1000;
      for (let i = 0; i < s3Keys.length; i += batchSize) {
        const batch = s3Keys.slice(i, i + batchSize);

        const deleteCommand = new DeleteObjectsCommand({
          Bucket: bucketName,
          Delete: {
            Objects: batch.map((key) => ({ Key: key })),
            Quiet: true,
          },
        });

        await s3Client.send(deleteCommand);
        console.log(`Deleted batch of ${batch.length} S3 objects`);
      }

      console.log(`Successfully cleaned up all ${s3Keys.length} S3 objects`);
    } catch (error) {
      console.error("Failed to cleanup S3 objects:", error);
      // Don't throw here as we're already in cleanup mode
    }
  }

  /**
   * Performance monitoring utility
   */
  static measurePerformance<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    const startTime = Date.now();
    return operation().then(
      (result) => {
        const duration = Date.now() - startTime;
        console.log(`${operationName} completed in ${duration}ms`);
        return result;
      },
      (error) => {
        const duration = Date.now() - startTime;
        console.error(`${operationName} failed after ${duration}ms:`, error);
        throw error;
      }
    );
  }
}

/**
 * Helper function to extract image URLs from any object
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
