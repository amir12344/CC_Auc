/**
 * IMAGE PROCESSING SERVICE
 *
 * Handles downloading and processing variant images for Excel export.
 * Focuses ONLY on variant images as specified by user requirements.
 */
import { getUrl } from "@aws-amplify/storage";

import type { OfferCartItem } from "../types";
import type {
  ImageProcessingBatchResult,
  ImageProcessingResult,
} from "../types/export";

/**
 * Convert blob to base64 string
 */
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix (data:image/png;base64,)
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = () =>
      reject(new Error("Failed to convert blob to base64"));
    reader.readAsDataURL(blob);
  });
};

/**
 * Get signed URL for S3 objects with proper options
 */
const getSignedUrl = async (key: string): Promise<string> => {
  try {
    const { url } = await getUrl({
      key,
      options: {
        accessLevel: "guest",
        validateObjectExistence: true,
      },
    });
    return url.toString();
  } catch (error) {
    throw new Error(
      `Failed to get signed URL: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
};

/**
 * Convert AVIF to PNG using canvas
 */
const convertAvifToPng = async (blob: Blob): Promise<Blob> => {
  const blobUrl = URL.createObjectURL(blob);

  try {
    return await new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        canvas.toBlob((pngBlob) => {
          if (pngBlob) {
            resolve(pngBlob);
          } else {
            reject(new Error("Failed to convert image to PNG"));
          }
        }, "image/png");
      };

      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = blobUrl;
    });
  } finally {
    URL.revokeObjectURL(blobUrl);
  }
};

/**
 * Process a batch of image URLs
 */
const processBatch = async (
  batch: string[],
  onProgress: (completed: number) => void
): Promise<{ processedImages: Map<string, string>; errors: string[] }> => {
  const results = await Promise.all(
    batch.map((url) => downloadVariantImageAsBase64(url))
  );

  const processedImages = new Map<string, string>();
  const errors: string[] = [];

  for (const [index, result] of results.entries()) {
    const url = batch[index];
    if (result.success && result.imageData) {
      processedImages.set(url, result.imageData);
    } else {
      errors.push(`Failed to process ${url}: ${result.error}`);
    }
    onProgress(1);
  }

  return { processedImages, errors };
};

/**
 * Download single variant image and convert to base64
 */
export const downloadVariantImageAsBase64 = async (
  imageUrl: string
): Promise<ImageProcessingResult> => {
  if (!imageUrl || imageUrl.trim() === "") {
    return {
      success: false,
      error: "Empty image URL provided",
      originalUrl: imageUrl,
    };
  }

  try {
    let finalUrl = imageUrl;

    // If this is an S3 key, get the signed URL
    if (imageUrl.startsWith("public/") || imageUrl.startsWith("private/")) {
      finalUrl = await getSignedUrl(imageUrl);
    }

    // Use the proxy to fetch the image
    const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(finalUrl)}`;

    // Get image using fetch with credentials
    const response = await fetch(proxyUrl, {
      credentials: "include",
      mode: "cors",
      headers: {
        Accept: "image/avif,image/webp,image/png,image/*",
      },
    });

    if (!response.ok) {
      return {
        success: false,
        error: `Failed to download image: ${response.statusText}`,
        originalUrl: imageUrl,
      };
    }

    // Get the blob
    let imageBlob = await response.blob();

    // If it's an AVIF image, convert to PNG
    if (
      imageBlob.type === "image/avif" ||
      imageUrl.toLowerCase().endsWith(".avif")
    ) {
      try {
        imageBlob = await convertAvifToPng(imageBlob);
      } catch (convError) {
        return {
          success: false,
          error: `Failed to convert AVIF image: ${convError instanceof Error ? convError.message : "Unknown error"}`,
          originalUrl: imageUrl,
        };
      }
    }

    // Convert to base64
    const base64 = await blobToBase64(imageBlob);

    return {
      success: true,
      imageData: base64,
      originalUrl: imageUrl,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to download image",
      originalUrl: imageUrl,
    };
  }
};

/**
 * Process variant images in batches with retries
 */
export const processVariantImages = async (
  offerItems: OfferCartItem[],
  onProgress?: (completed: number, total: number) => void
): Promise<ImageProcessingBatchResult> => {
  // Extract unique variant image URLs
  const variantImageUrls = [
    ...new Set(
      offerItems
        .map((item) => item.variantImage)
        .filter((url): url is string => Boolean(url?.trim()))
    ),
  ];

  if (variantImageUrls.length === 0) {
    return {
      processedImages: new Map(),
      totalImages: 0,
      successfulImages: 0,
      failedImages: 0,
      errors: ["No variant images found in offer items"],
    };
  }

  const BATCH_SIZE = 5;
  const batches: string[][] = [];

  // Split URLs into batches
  for (let i = 0; i < variantImageUrls.length; i += BATCH_SIZE) {
    batches.push(variantImageUrls.slice(i, i + BATCH_SIZE));
  }

  let completed = 0;
  const allProcessedImages = new Map<string, string>();
  const allErrors: string[] = [];

  // Process all batches in parallel with Promise.all
  const batchResults = await Promise.all(
    batches.map((batch) =>
      processBatch(batch, (count) => {
        completed += count;
        onProgress?.(completed, variantImageUrls.length);
      })
    )
  );

  // Combine results from all batches
  for (const { processedImages, errors } of batchResults) {
    for (const [url, data] of processedImages) {
      allProcessedImages.set(url, data);
    }
    allErrors.push(...errors);
  }

  return {
    processedImages: allProcessedImages,
    totalImages: variantImageUrls.length,
    successfulImages: allProcessedImages.size,
    failedImages: variantImageUrls.length - allProcessedImages.size,
    errors: allErrors,
  };
};

/**
 * Get variant image base64 data for specific offer item
 * Now ensures the base64 data is in the correct format for ExcelJS
 */
export const getVariantImageBase64 = (
  item: OfferCartItem,
  processedImages: Map<string, string>
): string | undefined => {
  if (!item.variantImage) {
    return;
  }

  const base64Data = processedImages.get(item.variantImage);
  if (!base64Data) {
    return;
  }

  // ExcelJS expects raw base64 without data URL prefix
  return base64Data;
};

/**
 * Validate image URL format
 */
export const isValidImageUrl = (url: string): boolean => {
  if (!url || url.trim() === "") {
    return false;
  }

  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname.toLowerCase();
    const validExtensions = [
      ".jpg",
      ".jpeg",
      ".png",
      ".gif",
      ".webp",
      ".svg",
      ".avif",
    ];

    return (
      validExtensions.some((ext) => pathname.endsWith(ext)) ||
      pathname.includes("/image") ||
      urlObj.searchParams.has("format") ||
      // Also consider S3 paths valid
      pathname.startsWith("/public/") ||
      pathname.startsWith("/private/")
    );
  } catch {
    return false;
  }
};

/**
 * Get image processing statistics for offer items
 */
export const getVariantImageStats = (offerItems: OfferCartItem[]) => {
  const totalItems = offerItems.length;
  const itemsWithVariantImages = offerItems.filter(
    (item) => item.variantImage
  ).length;
  const uniqueVariantImages = new Set(
    offerItems.map((item) => item.variantImage).filter(Boolean)
  ).size;

  return {
    totalItems,
    itemsWithVariantImages,
    uniqueVariantImages,
    percentageWithImages:
      totalItems > 0 ? (itemsWithVariantImages / totalItems) * 100 : 0,
  };
};
