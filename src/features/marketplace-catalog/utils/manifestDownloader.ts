import { downloadData } from "aws-amplify/storage";

/**
 * Downloads a manifest file from S3 using the S3 key
 * @param s3Key The S3 key of the manifest file
 * @param filename The filename to save the file as (optional)
 * @returns Promise that resolves when download starts or rejects if error
 */
export const downloadManifestFile = async (
    s3Key: string,
    filename?: string
): Promise<void> => {
    try {
        if (!s3Key) {
            throw new Error("S3 key is required for manifest download");
        }

        // Use a safe default filename when one isn't provided
        const defaultFilename = filename || `manifest-${Date.now()}.xlsx`;

        // In Amplify Storage v6, use `path` when supplying a fully-qualified S3 key
        // (e.g., "LotListingManifests/private/{identityId}/{publicId}/.../file.xlsx").
        const { body } = await downloadData({
            path: s3Key,
            // options: { bucket: undefined } // not needed since default storage is configured
        }).result;

        // Normalize different body shapes across runtimes into a Blob
        let blob: Blob;
        if (typeof Blob !== "undefined" && body instanceof Blob) {
            blob = body;
        } else if (body && typeof (body as any).arrayBuffer === "function") {
            const bytes = await (body as any).arrayBuffer();
            blob = new Blob([bytes]);
        } else if (
            body &&
            typeof (body as any).transformToByteArray === "function"
        ) {
            const bytes = await (body as any).transformToByteArray();
            blob = new Blob([bytes]);
        } else {
            throw new Error("Unsupported download body type");
        }

        // Create a download link and trigger download in the browser
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = defaultFilename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error("Error downloading manifest file:", error);
        throw new Error("Failed to download manifest file. Please try again.");
    }
};

/**
 * Checks if a manifest file is available for download
 * @param s3Key The S3 key to check
 * @returns boolean indicating if file is available
 */
export const isManifestFileAvailable = (s3Key?: string | null): boolean => {
    return Boolean(s3Key && s3Key.trim().length > 0);
};

/**
 * Generates a user-friendly filename for the manifest download
 * @param lotTitle The title of the lot listing
 * @param s3Key The original S3 key (for extracting extension)
 * @returns A clean filename for download
 */
export const generateManifestFilename = (
    lotTitle: string,
    s3Key: string
): string => {
    // Clean the lot title to be filesystem-safe
    const cleanTitle = lotTitle
        .replace(/[^\w\s-]/g, "") // Remove special characters
        .replace(/\s+/g, "-") // Replace spaces with hyphens
        .toLowerCase();

    // Extract file extension from S3 key
    const extension = s3Key.split(".").pop() || "xlsx";

    // Generate timestamp for uniqueness
    const timestamp = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    return `${cleanTitle}-manifest-${timestamp}.${extension}`;
};
