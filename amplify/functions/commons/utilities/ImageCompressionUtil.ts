import { importModuleFromLayer } from "../importLayer";

export interface CompressionResult {
  compressedBuffer: Buffer;
  originalBuffer: Buffer;
}

export interface ImageFormatInfo {
  extension: string;
  mimeType: string;
}

/**
 * Common image compression utility for processing images across the application
 */
export class ImageCompressionUtil {
  /**
   * Smart image compression with format optimization
   * Extracted from ParallelImageProcessor for reuse across the codebase
   */
  static async compressImage(
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
          ImageCompressionUtil.timeoutPromise(4000, "WebP compression timeout"),
        ])) as Buffer;
      } else if (originalSize > 3 * 1024 * 1024) {
        // Large images - Use JPEG for speed
        compressedBuffer = (await Promise.race([
          sharpInstance.jpeg({ quality: 78, progressive: true }).toBuffer(),
          ImageCompressionUtil.timeoutPromise(5000, "JPEG compression timeout"),
        ])) as Buffer;
      } else {
        // Medium images - Try AVIF with timeout, fallback to WebP
        try {
          compressedBuffer = (await Promise.race([
            sharpInstance.avif({ quality: 72, effort: 1 }).toBuffer(),
            ImageCompressionUtil.timeoutPromise(
              6000,
              "AVIF compression timeout"
            ),
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
  static detectOutputFormat(buffer: Buffer): ImageFormatInfo {
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
  static detectImageFormat(buffer: Buffer): string | null {
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
   * Get file extension from URL
   */
  static getFileExtension(url: string): string {
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
  static timeoutPromise<T>(ms: number, message: string): Promise<T> {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error(message)), ms);
    });
  }

  /**
   * Get MIME type from file extension
   */
  static getMimeTypeFromExtension(extension: string): string {
    const mimeTypes: Record<string, string> = {
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
}
