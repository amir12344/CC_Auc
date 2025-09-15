/**
 * Catalog Offer Service
 * Handles API calls for catalog offer creation from uploaded files
 */
import { generateClient } from "aws-amplify/api";
import { getUrl } from "aws-amplify/storage";

import type { Schema } from "@/amplify/data/resource";
import type { FindUniqueArgs } from "@/src/lib/prisma/PrismaQuery.type";
import { formatBackendError } from "@/src/utils/error-utils";

// Get public URL for S3 image
const getImageUrl = async (s3Key: string): Promise<string | null> => {
  try {
    const publicUrl = await getUrl({
      path: s3Key,
      options: {
        validateObjectExistence: false,
        bucket: "commerce-central-images",
        useAccelerateEndpoint: true,
      },
    });
    return publicUrl.url.toString();
  } catch {
    return null;
  }
};

/**
 * Fetch minimal catalog details for upload offer page
 */
export const fetchCatalogDetailsForUpload = async (
  publicId: string
): Promise<{
  title: string;
  description: string;
  category: string;
  imageUrl: string | null;
} | null> => {
  try {
    const client = generateClient<Schema>();

    type QueryDataInput = {
      modelName: "catalog_listings";
      operation: "findUnique";
      query: string;
    };

    const query: FindUniqueArgs<"catalog_listings"> = {
      relationLoadStrategy: "join",
      where: {
        public_id: publicId,
      },
      select: {
        title: true,
        description: true,
        category: true,
        catalog_listing_images: {
          select: {
            images: {
              select: {
                s3_key: true,
              },
            },
          },
        },
      },
    };

    const input: QueryDataInput = {
      modelName: "catalog_listings",
      operation: "findUnique",
      query: JSON.stringify(query),
    };

    const { data: result } = await client.queries.queryData(input);

    if (result) {
      const parsedData =
        typeof result === "string" ? JSON.parse(result) : result;

      if (parsedData) {
        // Get the first image URL if available
        let imageUrl = null;
        if (
          parsedData.catalog_listing_images &&
          parsedData.catalog_listing_images.length > 0
        ) {
          imageUrl = await getImageUrl(
            parsedData.catalog_listing_images[0].images.s3_key
          );
        }

        return {
          title: parsedData.title || "Untitled Catalog",
          description: parsedData.description || "No description available",
          category: parsedData.category || "Uncategorized",
          imageUrl,
        };
      }
    }

    return null;
  } catch (error) {
    return null;
  }
};

/**
 * Create catalog offer from uploaded file
 */
export const createCatalogOfferFromFile = async (data: {
  offerListingPublicId: string;
  offerFileS3Key: string;
}): Promise<{ success: boolean; error?: string; data?: unknown }> => {
  try {
    const client = generateClient<Schema>({ authMode: "userPool" });

    const { data: result, errors } =
      await client.queries.createCatalogOfferFromFile({
        offerListingPublicId: data.offerListingPublicId,
        offerFileS3Key: data.offerFileS3Key,
      });

    if (errors && errors.length > 0) {
      return {
        success: false,
        error: formatBackendError(errors[0]),
      };
    }

    // Parse the result if it's a string (similar to AuctionBiddingArea)
    if (result) {
      const parsed: unknown =
        typeof result === "string" ? JSON.parse(result) : result;

      // Check if the parsed result indicates failure
      if (
        parsed &&
        typeof parsed === "object" &&
        "success" in parsed &&
        parsed.success === false &&
        "error" in parsed
      ) {
        return {
          success: false,
          error: formatBackendError((parsed as { error: unknown }).error),
        };
      }
    }

    return {
      success: true,
      data: result,
    };
  } catch {
    return {
      success: false,
      error: "An unexpected error occurred while processing your offer.",
    };
  }
};
