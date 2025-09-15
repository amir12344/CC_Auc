import { generateClient } from "aws-amplify/data";

import type { Schema } from "@/amplify/data/resource";
import { formatBackendError } from "@/src/utils/error-utils";

// API payload type for catalog creation
export interface CatalogCreationPayload {
  catalogListingFileKey: string;
  catalogProductsFileKey: string;
  cognitoId: string;
  sellerId: string;
  isPrivate: boolean;
  visibilityRules: string; // JSON stringified VisibilityRules
}

/**
 * Creates catalog listings from Excel upload form data
 * @param payload - The catalog creation payload including form data and file keys
 * @returns Promise with the API response indicating success/failure
 */
export async function createCatalogListings(
  payload: CatalogCreationPayload
): Promise<{ success: boolean; error?: string }> {
  try {
    const client = generateClient<Schema>({ authMode: "userPool" });

    const { data: result, errors: createErrors } =
      await client.queries.createCatalogListingFromFile({
        catalogListingFileKey: payload.catalogListingFileKey,
        catalogProductsFileKey: payload.catalogProductsFileKey,
        cognitoId: payload.cognitoId,
        isPrivate: payload.isPrivate,
        visibilityRules: payload.visibilityRules,
      });

    if (createErrors && createErrors.length > 0) {
      return {
        success: false,
        error: createErrors[0].message || "Failed to create catalog listing",
      };
    }

    // Parse the result if it's a string
    const parsed = typeof result === "string" ? JSON.parse(result) : result;

    // Check if the backend returned an error
    if (parsed?.success === false && parsed?.error) {
      return {
        success: false,
        error: formatBackendError(parsed.error),
      };
    }

    return { success: true };
  } catch (error) {
    if (error instanceof Error && error.message.includes("Authentication")) {
      return {
        success: false,
        error: "Authentication expired. Please sign in again.",
      };
    }
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create catalog listing",
    };
  }
}

/**
 * Validates catalog file upload before processing
 * @param fileKey - The S3 file key
 * @returns validation result
 */
export function validateCatalogFile(fileKey: string): boolean {
  return Boolean(fileKey);
}
