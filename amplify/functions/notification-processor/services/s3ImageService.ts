import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";

import { env } from "$amplify/env/notification-processor";

import { importModuleFromLayer } from "../../commons/importLayer";

export interface S3ImageResult {
  success: boolean;
  base64Data?: string;
  mimeType?: string;
  error?: string;
  originalSize?: number;
  processedSize?: number;
}

export class S3ImageService {
  private static s3Client = new S3Client({ region: env.AWS_REGION });

  /**
   * Retrieve an image from S3 using the S3 key and convert it to base64
   */
  static async getImageAsBase64(
    s3Key: string,
    maxWidth: number = 150,
    maxHeight: number = 150,
    quality: number = 80
  ): Promise<S3ImageResult> {
    try {
      if (!s3Key || s3Key.trim() === "") {
        return {
          success: false,
          error: "Invalid S3 key provided",
        };
      }

      const bucketName = env.COMMERCE_CENTRAL_IMAGES_BUCKET_NAME;
      if (!bucketName) {
        return {
          success: false,
          error: "Image bucket name not configured",
        };
      }

      console.log(`Retrieving image from S3: ${bucketName}/${s3Key}`);

      // Get the image from S3
      const getObjectCommand = new GetObjectCommand({
        Bucket: bucketName,
        Key: s3Key,
      });

      const response = await this.s3Client.send(getObjectCommand);

      if (!response.Body) {
        return {
          success: false,
          error: "No image data received from S3",
        };
      }

      // Convert the response body to a buffer
      const imageBuffer = Buffer.from(
        await response.Body.transformToByteArray()
      );
      const originalSize = imageBuffer.length;

      // Determine the content type
      let mimeType = response.ContentType || "image/jpeg";

      // Process the image with Sharp to resize and optimize for Excel
      const sharpInstance = (await importModuleFromLayer())?.sharpInstance(
        imageBuffer
      )!;
      const resizedImage = sharpInstance
        .resize(maxWidth, maxHeight, {
          fit: "inside",
          withoutEnlargement: true,
        })
        .jpeg({ quality }); // Convert to JPEG for better Excel compatibility
      const processedImageBuffer = await resizedImage.toBuffer();

      const processedSize = processedImageBuffer.length;

      // Convert to base64
      const base64Data = processedImageBuffer.toString("base64");

      console.log(
        `Image processed successfully: ${s3Key} (${originalSize} → ${processedSize} bytes)`
      );

      return {
        success: true,
        base64Data,
        mimeType: "image/jpeg", // Always JPEG after processing
        originalSize,
        processedSize,
      };
    } catch (error) {
      console.error(`Failed to retrieve image from S3: ${s3Key}`, error);

      if (error instanceof Error) {
        if (error.name === "NoSuchKey") {
          return {
            success: false,
            error: `Image not found: ${s3Key}`,
          };
        }
        if (error.name === "AccessDenied") {
          return {
            success: false,
            error: `Access denied to image: ${s3Key}`,
          };
        }
      }

      return {
        success: false,
        error: `Failed to retrieve image: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }

  /**
   * Batch retrieve multiple images from S3
   */
  static async getMultipleImagesAsBase64(
    s3Keys: string[],
    maxWidth: number = 150,
    maxHeight: number = 150,
    quality: number = 80,
    onProgress?: (completed: number, total: number) => void
  ): Promise<Map<string, S3ImageResult>> {
    const results = new Map<string, S3ImageResult>();

    for (let i = 0; i < s3Keys.length; i++) {
      const s3Key = s3Keys[i];

      if (s3Key && s3Key.trim() !== "") {
        const result = await this.getImageAsBase64(
          s3Key,
          maxWidth,
          maxHeight,
          quality
        );
        results.set(s3Key, result);
      } else {
        results.set(s3Key || `empty_${i}`, {
          success: false,
          error: "Empty S3 key",
        });
      }

      onProgress?.(i + 1, s3Keys.length);
    }

    return results;
  }

  /**
   * Check if an S3 key exists and is accessible
   */
  static async checkImageExists(s3Key: string): Promise<boolean> {
    try {
      if (!s3Key || s3Key.trim() === "") {
        return false;
      }

      const bucketName = env.COMMERCE_CENTRAL_IMAGES_BUCKET_NAME;
      if (!bucketName) {
        return false;
      }

      const getObjectCommand = new GetObjectCommand({
        Bucket: bucketName,
        Key: s3Key,
      });

      await this.s3Client.send(getObjectCommand);
      return true;
    } catch (error) {
      console.log(`Image does not exist or is not accessible: ${s3Key}`);
      return false;
    }
  }

  /**
   * Get optimized image configuration for Excel embedding
   */
  static getExcelImageConfig() {
    return {
      maxWidth: 120, // Optimal width for Excel cells
      maxHeight: 120, // Optimal height for Excel cells
      quality: 75, // Good balance between quality and file size
    };
  }
}
