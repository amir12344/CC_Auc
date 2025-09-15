import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

import { v4 as uuidv4 } from "uuid";

import { PrismaClient } from "../../../lambda-layers/core-layer/nodejs/prisma/generated/client";
import { importModuleFromLayer } from "../../importLayer";

export interface LotImageProcessorConfig {
  region: string;
  bucketName: string;
  userPublicId: string;
}

interface ImageProcessingResult {
  imageId: string;
  compressedS3Key: string;
  originalS3Key: string;
  compressedPublicUrl: string;
  originalPublicUrl: string;
}

interface ImageWithMetadata {
  s3Key: string;
  sortOrder: number;
}

export class LotImageProcessor {
  private s3Client: S3Client;
  private config: LotImageProcessorConfig;

  constructor(config: LotImageProcessorConfig) {
    this.config = config;
    this.s3Client = new S3Client({
      region: config.region,
    });
  }

  /**
   * Process images with metadata including sort order
   */
  async processImagesForLot(
    imageData: ImageWithMetadata[],
    transaction: PrismaClient
  ): Promise<ImageProcessingResult[]> {
    if (imageData.length === 0) {
      return [];
    }

    console.log(`Processing ${imageData.length} images for Lot folder...`);
    const startTime = Date.now();

    const results: ImageProcessingResult[] = [];

    // Process images in parallel batches
    const BATCH_SIZE = 10;
    for (let i = 0; i < imageData.length; i += BATCH_SIZE) {
      const batch = imageData.slice(i, i + BATCH_SIZE);

      const batchPromises = batch.map((imageInfo) =>
        this.processIndividualImage(imageInfo, transaction)
      );

      const batchResults = await Promise.allSettled(batchPromises);

      batchResults.forEach((result, index) => {
        if (result.status === "fulfilled" && result.value) {
          results.push(result.value);
        } else {
          console.error(
            `Failed to process image ${batch[index].s3Key}:`,
            result.status === "rejected" ? result.reason : "Unknown error"
          );
        }
      });
    }

    const totalTime = Date.now() - startTime;
    console.log(
      `Processed ${results.length}/${imageData.length} images in ${totalTime}ms`
    );

    return results;
  }

  /**
   * Process a single image: download from existing S3 key, compress, upload to Lot folder, update database
   */
  private async processIndividualImage(
    imageInfo: ImageWithMetadata,
    transaction: PrismaClient
  ): Promise<ImageProcessingResult | null> {
    try {
      const { s3Key: existingS3Key, sortOrder } = imageInfo;
      console.log(
        `Processing image: ${existingS3Key} with sort order: ${sortOrder}`
      );

      // Step 1: Download image from existing S3 key
      const imageBuffer = await this.downloadFromS3(existingS3Key);
      if (!imageBuffer) {
        throw new Error(`Failed to download image from S3: ${existingS3Key}`);
      }

      // Step 2: Compress the image using Sharp
      const compressionResult = await this.compressImage(imageBuffer);

      // Step 3: Generate new S3 keys for Lot folder
      const imageId = uuidv4();
      const extension = this.getFileExtension(existingS3Key);
      const compressedExtension = this.detectOutputFormat(
        compressionResult.compressedBuffer
      ).extension;

      const compressedFileName = `${imageId}${compressedExtension}`;
      const originalFileName = `${imageId}_original${extension}`;

      const compressedS3Key = `Images/Lot/${this.config.userPublicId}/${compressedFileName}`;
      const originalS3Key = `Images/Lot/${this.config.userPublicId}/originals/${originalFileName}`;

      // Step 4: Upload both compressed and original to S3
      await Promise.all([
        this.uploadToS3(
          compressedS3Key,
          compressionResult.compressedBuffer,
          this.getMimeType(compressedExtension)
        ),
        this.uploadToS3(
          originalS3Key,
          compressionResult.originalBuffer,
          this.getMimeType(extension)
        ),
      ]);

      // Step 5: Generate public URLs
      const compressedPublicUrl = this.generatePublicUrl(compressedS3Key);
      const originalPublicUrl = this.generatePublicUrl(originalS3Key);

      // Step 6: Create image record in database with proper sort order
      const imageRecord = await transaction.images.create({
        data: {
          image_url: compressedPublicUrl,
          s3_key: compressedS3Key,
          original_url: originalPublicUrl,
          original_s3_key: originalS3Key,
          original_image_url: originalPublicUrl,
          sort_order: sortOrder,
          created_at: new Date(),
        },
      });

      console.log(
        `Successfully processed image: ${existingS3Key} -> ${compressedS3Key}`
      );

      return {
        imageId: imageRecord.image_id,
        compressedS3Key,
        originalS3Key,
        compressedPublicUrl,
        originalPublicUrl,
      };
    } catch (error) {
      console.error(`Error processing image ${imageInfo.s3Key}:`, error);
      return null;
    }
  }

  /**
   * Download image from S3 using existing S3 key
   */
  private async downloadFromS3(s3Key: string): Promise<Buffer | null> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.config.bucketName,
        Key: s3Key,
      });

      const response = await this.s3Client.send(command);

      if (!response.Body) {
        throw new Error(`No body in S3 response for key: ${s3Key}`);
      }

      // Convert stream to buffer
      const chunks: Uint8Array[] = [];
      const stream = response.Body as any;

      for await (const chunk of stream) {
        chunks.push(chunk);
      }

      return Buffer.concat(chunks);
    } catch (error) {
      console.error(`Failed to download from S3 key ${s3Key}:`, error);
      return null;
    }
  }

  /**
   * Compress image using Sharp library (similar to ParallelImageProcessor)
   */
  private async compressImage(buffer: Buffer): Promise<{
    compressedBuffer: Buffer;
    originalBuffer: Buffer;
  }> {
    const originalSize = buffer.length;

    try {
      let sharpInstance = (await importModuleFromLayer())?.sharpInstance(
        buffer
      )!;

      // Get image metadata
      const metadata = await sharpInstance.metadata();

      // Resize logic
      const maxWidth = 1200;
      if (metadata.width && metadata.width > maxWidth) {
        sharpInstance = sharpInstance.resize(maxWidth, null, {
          withoutEnlargement: true,
          fit: "inside",
          kernel: "nearest",
        });
      }

      // Smart format selection based on image size
      let compressedBuffer: Buffer;

      if (originalSize < 300 * 1024) {
        // Small images - Use WebP
        compressedBuffer = await sharpInstance
          .webp({ quality: 85, effort: 2 })
          .toBuffer();
      } else if (originalSize > 3 * 1024 * 1024) {
        // Large images - Use JPEG
        compressedBuffer = await sharpInstance
          .jpeg({ quality: 78, progressive: true })
          .toBuffer();
      } else {
        // Medium images - Try AVIF with fallback to WebP
        try {
          compressedBuffer = await sharpInstance
            .avif({ quality: 72, effort: 1 })
            .toBuffer();
        } catch (avifError) {
          // Fallback to WebP
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
   * Get file extension from S3 key
   */
  private getFileExtension(s3Key: string): string {
    const lastDot = s3Key.lastIndexOf(".");
    if (lastDot === -1) return ".jpg";

    const extension = s3Key.substring(lastDot).toLowerCase();
    const validExtensions = [
      ".jpg",
      ".jpeg",
      ".png",
      ".gif",
      ".webp",
      ".bmp",
      ".avif",
    ];

    return validExtensions.includes(extension) ? extension : ".jpg";
  }

  /**
   * Get MIME type from file extension
   */
  private getMimeType(extension: string): string {
    const mimeTypes: { [key: string]: string } = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
      ".webp": "image/webp",
      ".bmp": "image/bmp",
      ".avif": "image/avif",
    };

    return mimeTypes[extension.toLowerCase()] || "image/jpeg";
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
}
