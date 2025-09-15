interface ImageDownloadOptions {
  timeout?: number;
  maxFileSize?: number;
  allowedFormats?: string[];
  userAgent?: string;
  headers?: Record<string, string>;
  retryAttempts?: number;
  retryDelay?: number;
  enableDebugLogging?: boolean; // New option for debug logging
}

interface ImageDownloadResult {
  buffer: Buffer;
  contentType: string;
  detectedFormat: string;
  size: number;
}

class ImageDownloader {
  private static readonly DEFAULT_OPTIONS: Required<ImageDownloadOptions> = {
    timeout: 45000,
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedFormats: [
      "jpeg",
      "jpg",
      "png",
      "gif",
      "webp",
      "bmp",
      "svg",
      "ico",
      "tiff",
      "avif",
    ],
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    headers: {},
    retryAttempts: 3,
    retryDelay: 1000,
    enableDebugLogging: false, // Disabled by default
  };

  private static readonly IMAGE_SIGNATURES: Array<{
    signature: number[];
    format: string;
    offset?: number;
  }> = [
    { signature: [0xff, 0xd8, 0xff], format: "jpeg" },
    {
      signature: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
      format: "png",
    },
    { signature: [0x47, 0x49, 0x46, 0x38], format: "gif" },
    { signature: [0x42, 0x4d], format: "bmp" },
    { signature: [0x52, 0x49, 0x46, 0x46], format: "webp" }, // RIFF container
    { signature: [0x57, 0x45, 0x42, 0x50], format: "webp", offset: 8 }, // WEBP signature
    { signature: [0x3c, 0x73, 0x76, 0x67], format: "svg" }, // <svg
    { signature: [0x3c, 0x3f, 0x78, 0x6d, 0x6c], format: "svg" }, // <?xml (SVG)
    { signature: [0x00, 0x00, 0x01, 0x00], format: "ico" },
    { signature: [0x49, 0x49, 0x2a, 0x00], format: "tiff" }, // Little endian TIFF
    { signature: [0x4d, 0x4d, 0x00, 0x2a], format: "tiff" }, // Big endian TIFF
    {
      signature: [
        0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70, 0x61, 0x76, 0x69, 0x66,
      ],
      format: "avif",
    },
  ];

  public static async downloadImage(
    url: string,
    options: ImageDownloadOptions = {}
  ): Promise<ImageDownloadResult | null> {
    const opts = { ...this.DEFAULT_OPTIONS, ...options };

    for (let attempt = 1; attempt <= opts.retryAttempts; attempt++) {
      try {
        return await this.attemptDownload(url, opts);
      } catch (error) {
        // Only log warnings for final attempt or if debug logging is enabled
        if (attempt === opts.retryAttempts || opts.enableDebugLogging) {
          console.warn(`Download attempt ${attempt} failed for ${url}:`, error);
        }

        if (attempt === opts.retryAttempts) {
          console.error(
            `All ${opts.retryAttempts} download attempts failed for ${url}`
          );
          return null;
        }

        // Wait before retrying
        await this.delay(opts.retryDelay * attempt);
      }
    }

    return null;
  }

  private static async attemptDownload(
    url: string,
    options: Required<ImageDownloadOptions>
  ): Promise<ImageDownloadResult> {
    // Validate URL
    if (!this.isValidUrl(url)) {
      throw new Error(`Invalid URL: ${url}`);
    }

    // Handle Google Drive URLs specially
    if (
      url.includes("drive.google.com") ||
      url.includes("drive.usercontent.google.com")
    ) {
      return await this.handleGoogleDriveDownload(url, options);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), options.timeout);

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "User-Agent": options.userAgent,
          Accept: "image/*,*/*;q=0.8",
          "Accept-Encoding": "gzip, deflate, br",
          "Cache-Control": "no-cache",
          ...options.headers,
        },
        signal: controller.signal,
        redirect: "follow",
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Check content length
      const contentLength = response.headers.get("content-length");
      if (contentLength && parseInt(contentLength) > options.maxFileSize) {
        throw new Error(
          `File too large: ${contentLength} bytes (max: ${options.maxFileSize})`
        );
      }

      // Download with size limit
      const buffer = await this.downloadWithSizeLimit(
        response,
        options.maxFileSize
      );

      // Detect image format from content
      const detectedFormat = this.detectImageFormat(buffer);
      if (!detectedFormat) {
        throw new Error("Downloaded content is not a valid image");
      }

      // Check if format is allowed
      if (!options.allowedFormats.includes(detectedFormat)) {
        throw new Error(`Image format '${detectedFormat}' not allowed`);
      }

      const contentType =
        response.headers.get("content-type") || `image/${detectedFormat}`;

      return {
        buffer,
        contentType,
        detectedFormat,
        size: buffer.length,
      };
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private static async downloadWithSizeLimit(
    response: Response,
    maxSize: number
  ): Promise<Buffer> {
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("No response body");
    }

    const chunks: Uint8Array[] = [];
    let totalSize = 0;

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        totalSize += value.length;
        if (totalSize > maxSize) {
          throw new Error(`File too large: exceeds ${maxSize} bytes`);
        }

        chunks.push(value);
      }
    } finally {
      reader.releaseLock();
    }

    // Combine all chunks
    const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;

    for (const chunk of chunks) {
      result.set(chunk, offset);
      offset += chunk.length;
    }

    return Buffer.from(result);
  }

  private static async handleGoogleDriveDownload(
    url: string,
    options: Required<ImageDownloadOptions>
  ): Promise<ImageDownloadResult> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), options.timeout);

    try {
      // Extract file ID from URL - handle multiple formats
      let fileId: string | null = null;

      // Format 1: /file/d/{fileId}/view or /file/d/{fileId}/edit
      const fileFormatMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
      if (fileFormatMatch) {
        fileId = fileFormatMatch[1];
      } else {
        // Format 2: ?id={fileId} or &id={fileId}
        const idFormatMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
        if (idFormatMatch) {
          fileId = idFormatMatch[1];
        }
      }

      if (!fileId) {
        throw new Error("Could not extract file ID from Google Drive URL");
      }

      // FALLBACK STRATEGY 1: Try multiple URL formats in order of reliability
      const urlStrategies = [
        {
          name: "usercontent-direct",
          url: `https://drive.usercontent.google.com/download?id=${fileId}&export=download&authuser=0&confirm=t`,
          followRedirects: true,
        },
        {
          name: "usercontent-simple",
          url: `https://drive.usercontent.google.com/download?id=${fileId}&export=download`,
          followRedirects: true,
        },
        {
          name: "legacy-uc-confirm",
          url: `https://drive.google.com/uc?export=download&id=${fileId}&confirm=t`,
          followRedirects: false, // Manual redirect handling for legacy
        },
        {
          name: "legacy-uc-simple",
          url: `https://drive.google.com/uc?id=${fileId}&export=download`,
          followRedirects: false,
        },
        {
          name: "docs-uc",
          url: `https://docs.google.com/uc?export=download&id=${fileId}`,
          followRedirects: false,
        },
      ];

      const browserHeaders = {
        "User-Agent": options.userAgent,
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        DNT: "1",
        Connection: "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "cross-site",
        "Cache-Control": "max-age=0",
        ...options.headers,
      };

      let lastError: Error | null = null;

      // Try each strategy
      for (const strategy of urlStrategies) {
        try {
          if (options.enableDebugLogging) {
            console.log(`Trying ${strategy.name}: ${strategy.url}`);
          }

          const response = await fetch(strategy.url, {
            method: "GET",
            headers: browserHeaders,
            signal: controller.signal,
            redirect: strategy.followRedirects ? "follow" : "manual",
          });

          // FALLBACK STRATEGY 2: Handle different response scenarios
          const result = await this.processGoogleDriveResponse(
            response,
            strategy,
            browserHeaders,
            controller.signal,
            options
          );

          if (result) {
            if (options.enableDebugLogging) {
              console.log(`Success with ${strategy.name}`);
            }
            return result;
          }
        } catch (error) {
          lastError = error as Error;
          if (options.enableDebugLogging) {
            console.log(`Strategy ${strategy.name} failed:`, error);
          }
          continue;
        }
      }

      // FALLBACK STRATEGY 3: Try with different confirmation tokens
      if (options.enableDebugLogging) {
        console.log(
          "All standard strategies failed, trying confirmation tokens"
        );
      }

      const confirmationTokens = ["t", "no_antivirus", "1", "yes"];

      for (const token of confirmationTokens) {
        try {
          const tokenUrl = `https://drive.google.com/uc?export=download&id=${fileId}&confirm=${token}`;

          const response = await fetch(tokenUrl, {
            method: "GET",
            headers: browserHeaders,
            signal: controller.signal,
            redirect: "follow",
          });

          if (response.ok && !response.url.includes("accounts.google.com")) {
            const contentType = response.headers.get("content-type") || "";

            if (!contentType.includes("text/html")) {
              const buffer = await this.downloadWithSizeLimit(
                response,
                options.maxFileSize
              );
              const detectedFormat = this.detectImageFormat(buffer);

              if (detectedFormat) {
                if (options.enableDebugLogging) {
                  console.log(`Success with confirmation token: ${token}`);
                }
                return {
                  buffer,
                  contentType: contentType || `image/${detectedFormat}`,
                  detectedFormat,
                  size: buffer.length,
                };
              }
            }
          }
        } catch (error) {
          continue;
        }
      }

      // If all fallbacks failed, throw the last error with context
      throw new Error(
        `All Google Drive download strategies failed. Last error: ${lastError?.message || "Unknown error"}. ` +
          `File ID: ${fileId}. This may indicate the file requires authentication or is not publicly accessible.`
      );
    } finally {
      clearTimeout(timeoutId);
    }
  }

  // Helper method to process different Google Drive response types
  private static async processGoogleDriveResponse(
    response: Response,
    strategy: { name: string; url: string; followRedirects: boolean },
    headers: Record<string, string>,
    signal: AbortSignal,
    options: Required<ImageDownloadOptions>
  ): Promise<ImageDownloadResult | null> {
    const contentType = response.headers.get("content-type") || "";

    // Case 1: Direct success - got the file
    if (
      response.ok &&
      !response.url.includes("accounts.google.com") &&
      !contentType.includes("text/html")
    ) {
      const buffer = await this.downloadWithSizeLimit(
        response,
        options.maxFileSize
      );
      const detectedFormat = this.detectImageFormat(buffer);

      if (detectedFormat) {
        return {
          buffer,
          contentType: contentType || `image/${detectedFormat}`,
          detectedFormat,
          size: buffer.length,
        };
      }
    }

    // Case 2: Got a redirect (manual redirect handling)
    if (
      !strategy.followRedirects &&
      response.status >= 300 &&
      response.status < 400
    ) {
      const location = response.headers.get("location");

      if (location && !location.includes("accounts.google.com")) {
        const redirectResponse = await fetch(location, {
          method: "GET",
          headers,
          signal,
          redirect: "follow",
        });

        if (redirectResponse.ok) {
          const redirectContentType =
            redirectResponse.headers.get("content-type") || "";

          if (!redirectContentType.includes("text/html")) {
            const buffer = await this.downloadWithSizeLimit(
              redirectResponse,
              options.maxFileSize
            );
            const detectedFormat = this.detectImageFormat(buffer);

            if (detectedFormat) {
              return {
                buffer,
                contentType: redirectContentType || `image/${detectedFormat}`,
                detectedFormat,
                size: buffer.length,
              };
            }
          }
        }
      }
    }

    // Case 3: Got HTML (virus scan warning or other page)
    if (contentType.includes("text/html")) {
      const html = await response.text();

      // Try to extract download link from virus scan warning page
      const downloadLinkMatch = html.match(/href="([^"]*&confirm=[^"]*)"/);
      if (downloadLinkMatch) {
        let downloadLink = downloadLinkMatch[1].replace(/&amp;/g, "&");

        if (!downloadLink.startsWith("http")) {
          downloadLink = "https://drive.google.com" + downloadLink;
        }

        try {
          const downloadResponse = await fetch(downloadLink, {
            method: "GET",
            headers,
            signal,
            redirect: "follow",
          });

          if (downloadResponse.ok) {
            const downloadContentType =
              downloadResponse.headers.get("content-type") || "";

            if (!downloadContentType.includes("text/html")) {
              const buffer = await this.downloadWithSizeLimit(
                downloadResponse,
                options.maxFileSize
              );
              const detectedFormat = this.detectImageFormat(buffer);

              if (detectedFormat) {
                return {
                  buffer,
                  contentType: downloadContentType || `image/${detectedFormat}`,
                  detectedFormat,
                  size: buffer.length,
                };
              }
            }
          }
        } catch (error) {
          // Failed to follow extracted link
        }
      }
    }

    return null; // This strategy didn't work
  }

  private static detectImageFormat(buffer: Buffer): string | null {
    if (buffer.length < 12) return null;

    for (const { signature, format, offset = 0 } of this.IMAGE_SIGNATURES) {
      if (buffer.length >= offset + signature.length) {
        const matches = signature.every(
          (byte, index) => buffer[offset + index] === byte
        );

        if (matches) {
          // Special case for WEBP: must have both RIFF and WEBP signatures
          if (format === "webp" && offset === 0) {
            const hasWebpSig =
              buffer.length >= 12 &&
              buffer[8] === 0x57 &&
              buffer[9] === 0x45 &&
              buffer[10] === 0x42 &&
              buffer[11] === 0x50;
            if (hasWebpSig) return "webp";
          } else if (format === "webp" && offset === 8) {
            // Skip this check, it's handled above
            continue;
          } else {
            return format;
          }
        }
      }
    }

    return null;
  }

  private static isValidUrl(url: string): boolean {
    try {
      const parsed = new URL(url);
      return ["http:", "https:"].includes(parsed.protocol);
    } catch {
      return false;
    }
  }

  private static delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Usage examples:
export default class ImageService {
  // Simple usage
  public static async downloadImage(url: string): Promise<Buffer | null> {
    const result = await ImageDownloader.downloadImage(url);
    return result?.buffer || null;
  }

  // Advanced usage with options
  public static async downloadImageAdvanced(
    url: string,
    options?: ImageDownloadOptions
  ): Promise<ImageDownloadResult | null> {
    return await ImageDownloader.downloadImage(url, options);
  }

  // Example with custom options
  public static async downloadThumbnail(url: string): Promise<Buffer | null> {
    const result = await ImageDownloader.downloadImage(url, {
      maxFileSize: 2 * 1024 * 1024, // 2MB limit for thumbnails
      timeout: 15000, // 15 second timeout
      allowedFormats: ["jpeg", "jpg", "png", "webp"], // Only common web formats
      retryAttempts: 2,
    });

    return result?.buffer || null;
  }

  // Method to enable debug logging when needed
  public static async downloadImageWithDebug(
    url: string,
    options?: ImageDownloadOptions
  ): Promise<ImageDownloadResult | null> {
    return await ImageDownloader.downloadImage(url, {
      ...options,
      enableDebugLogging: true,
    });
  }
}
