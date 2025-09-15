import { env } from "$amplify/env/create-catalog-offer";

import type { Schema } from "../../data/resource";
import { importModuleFromLayer } from "../commons/importLayer";
import { CatalogOfferOperations } from "../commons/operations/catalogs/CatalogOfferOperations";
import { UserDatabaseOperations } from "../commons/operations/users/UserDatabaseOperations";
import { notificationService } from "../commons/utilities/UnifiedNotificationService";

type DatabaseConnectionDetails = {
  databaseName: string;
  hostname: string;
  port: number;
  username: string;
  password: string;
};

export const handler: Schema["createCatalogOffer"]["functionHandler"] = async (
  event,
  context
) => {
  console.log(`EVENT: ${JSON.stringify(event)}`);

  // Generate request ID for tracking
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  try {
    // Extract arguments from event
    const {
      catalogListingId: catalogListingPublicId,
      buyerUserId,
      buyerProfileId,
      cognitoId,
      items,
      expiresAt,
      offerMessage,
    } = event.arguments;

    // Rate limiting check (simple implementation)
    const userId = buyerUserId || cognitoId;
    if (userId) {
      // This would typically use Redis or DynamoDB for distributed rate limiting
      // For now, we'll skip this but include the error structure
      const rateLimitKey = `catalog_offer_create:${userId}`;
      // const rateLimitResult = await checkRateLimit(rateLimitKey, 10, 3600); // 10 per hour
      // if (!rateLimitResult.allowed) {
      //   return JSON.stringify({
      //     success: false,
      //     error: {
      //       code: "RATE_LIMIT_EXCEEDED",
      //       message: "Too many requests. Please slow down and try again later",
      //       details: {
      //         rate_limit: "10 requests per hour",
      //         current_usage: rateLimitResult.usage,
      //         reset_time: rateLimitResult.resetTime,
      //         retry_after: rateLimitResult.retryAfter,
      //         endpoint: "/api/v1/catalog-offers",
      //         suggested_actions: [
      //           "Wait before making additional requests",
      //           "Implement exponential backoff",
      //           "Contact support for rate limit increase"
      //         ]
      //       },
      //       timestamp: new Date().toISOString(),
      //       request_id: requestId
      //     },
      //   });
      // }
    }

    // Initialize database connection
    const dbConnectionDetails: DatabaseConnectionDetails = JSON.parse(
      env.DB_CONNECTION_DETAILS
    );
    const prismaDataSourceUrl = `postgresql://${dbConnectionDetails.username}:${dbConnectionDetails.password}@${dbConnectionDetails.hostname}:${dbConnectionDetails.port}/${dbConnectionDetails.databaseName}?schema=public`;

    const prismaClient = (await importModuleFromLayer())?.prismaClient(
      prismaDataSourceUrl
    )!;

    if (!prismaClient) {
      throw new Error("Failed to initialize database connection");
    }

    // Validate required arguments
    if (!catalogListingPublicId || catalogListingPublicId.trim() === "") {
      return JSON.stringify({
        success: false,
        error: {
          code: "MISSING_CATALOG_LISTING_ID",
          message: "catalogListingId is required",
          timestamp: new Date().toISOString(),
          request_id: requestId,
        },
      });
    }

    if (!items || items.length === 0) {
      return JSON.stringify({
        success: false,
        error: {
          code: "NO_ITEMS_PROVIDED",
          message: "At least one item must be included in the offer",
          timestamp: new Date().toISOString(),
          request_id: requestId,
        },
      });
    }

    // Validate items format
    const seenVariants = new Set<string>();
    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      // Add null/undefined check
      if (!item) {
        return JSON.stringify({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Request contains invalid data",
            details: {
              validation_errors: [
                {
                  field: `items[${i}]`,
                  message: "Item cannot be null or undefined",
                  provided_value: item,
                  expected_format: "valid item object",
                },
              ],
              suggested_actions: [
                "Ensure all items in the array are valid objects",
                "Remove any null or undefined items",
              ],
            },
            timestamp: new Date().toISOString(),
            request_id: requestId,
          },
        });
      }

      if (
        !item.catalogProductVariantId ||
        item.catalogProductVariantId.trim() === ""
      ) {
        return JSON.stringify({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Request contains invalid data",
            details: {
              validation_errors: [
                {
                  field: `items[${i}].catalogProductVariantId`,
                  message: "catalogProductVariantId is required",
                  provided_value: item.catalogProductVariantId,
                  expected_format: "non-empty string UUID or public_id",
                },
              ],
              suggested_actions: [
                "Provide valid product variant ID",
                "Check that variant exists in the catalog listing",
              ],
            },
            timestamp: new Date().toISOString(),
            request_id: requestId,
          },
        });
      }

      // Check for duplicate variants
      if (seenVariants.has(item.catalogProductVariantId)) {
        return JSON.stringify({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Request contains invalid data",
            details: {
              validation_errors: [
                {
                  field: `items[${i}].catalogProductVariantId`,
                  message:
                    "Cannot include the same product variant multiple times",
                  provided_value: item.catalogProductVariantId,
                  expected_format: "unique product variant ID per offer",
                },
              ],
              suggested_actions: [
                "Remove duplicate items",
                "Combine quantities for the same variant",
              ],
            },
            timestamp: new Date().toISOString(),
            request_id: requestId,
          },
        });
      }
      seenVariants.add(item.catalogProductVariantId);

      if (!item.requestedQuantity || item.requestedQuantity <= 0) {
        return JSON.stringify({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Request contains invalid data",
            details: {
              validation_errors: [
                {
                  field: `items[${i}].requestedQuantity`,
                  message: "Must be a positive integer",
                  provided_value: item.requestedQuantity,
                  expected_format: "integer > 0",
                },
              ],
              suggested_actions: [
                "Provide a quantity greater than zero",
                "Use whole numbers for quantities",
              ],
            },
            timestamp: new Date().toISOString(),
            request_id: requestId,
          },
        });
      }

      if (!item.buyerOfferPrice || item.buyerOfferPrice <= 0) {
        return JSON.stringify({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Request contains invalid data",
            details: {
              validation_errors: [
                {
                  field: `items[${i}].buyerOfferPrice`,
                  message:
                    "Must be a positive number with up to 4 decimal places",
                  provided_value: item.buyerOfferPrice,
                  expected_format: "decimal(16,4) > 0",
                },
              ],
              suggested_actions: [
                "Provide a price greater than zero",
                "Use valid decimal format",
              ],
            },
            timestamp: new Date().toISOString(),
            request_id: requestId,
          },
        });
      }

      if (
        !item.buyerOfferPriceCurrency ||
        item.buyerOfferPriceCurrency.trim() === ""
      ) {
        return JSON.stringify({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Request contains invalid data",
            details: {
              validation_errors: [
                {
                  field: `items[${i}].buyerOfferPriceCurrency`,
                  message: "Currency code is required",
                  provided_value: item.buyerOfferPriceCurrency,
                  expected_format: "valid currency code (e.g., USD, EUR)",
                },
              ],
              suggested_actions: [
                "Provide valid ISO 4217 currency code",
                "Use supported currencies only",
              ],
            },
            timestamp: new Date().toISOString(),
            request_id: requestId,
          },
        });
      }
    }

    // Check for too many items
    if (items.length > 50) {
      return JSON.stringify({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Request contains invalid data",
          details: {
            validation_errors: [
              {
                field: "items",
                message: "Cannot include more than 50 items in a single offer",
                provided_value: items.length,
                expected_format: "array length <= 50",
              },
            ],
            suggested_actions: [
              "Split large orders into multiple offers",
              "Focus on core products for this offer",
            ],
          },
          timestamp: new Date().toISOString(),
          request_id: requestId,
        },
      });
    }

    // Check currency consistency
    const currencies = new Set(
      items.map((item) => item?.buyerOfferPriceCurrency).filter(Boolean)
    );
    if (currencies.size > 1) {
      return JSON.stringify({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Request contains invalid data",
          details: {
            validation_errors: [
              {
                field: "items[*].buyerOfferPriceCurrency",
                message: "All items must use the same currency",
                provided_value: Array.from(currencies),
                expected_format: "single currency code for all items",
              },
            ],
            suggested_actions: [
              "Convert all prices to a single currency",
              "Create separate offers for different currencies",
            ],
          },
          timestamp: new Date().toISOString(),
          request_id: requestId,
        },
      });
    }

    // Check for catalog listing and variants existence
    const catalogListing = await prismaClient.catalog_listings.findUnique({
      where: { public_id: catalogListingPublicId },
      select: {
        catalog_listing_id: true,
        catalog_products: {
          select: {
            catalog_product_variants: {
              select: {
                catalog_product_variant_id: true,
                public_id: true,
              },
            },
          },
        },
      },
    });
    if (!catalogListing) {
      return JSON.stringify({
        success: false,
        error: {
          code: "CATALOG_LISTING_NOT_FOUND",
          message: `Catalog listing not found for ID: ${catalogListingPublicId}`,
          timestamp: new Date().toISOString(),
          request_id: requestId,
        },
      });
    }

    const catalogListingId = catalogListing.catalog_listing_id;

    // Validate catalogProductVariantId
    const catalogProductVariantPublicToInternalId = new Map<string, string>();
    catalogListing.catalog_products.forEach((product) => {
      product.catalog_product_variants.forEach((variant) => {
        catalogProductVariantPublicToInternalId.set(
          variant.public_id,
          variant.catalog_product_variant_id
        );
      });
    });

    for (const item of items) {
      if (
        !catalogProductVariantPublicToInternalId.has(
          item?.catalogProductVariantId!
        )
      ) {
        return JSON.stringify({
          success: false,
          error: {
            code: "PRODUCT_VARIANT_NOT_FOUND",
            message: `Product variant not found for ID: ${item?.catalogProductVariantId}`,
            timestamp: new Date().toISOString(),
            request_id: requestId,
          },
        });
      }
    }

    // Resolve user and profile IDs if not provided
    let finalBuyerUserId = buyerUserId;
    let finalBuyerProfileId = buyerProfileId;

    if (
      (!buyerUserId || buyerUserId.trim() === "") &&
      (!buyerProfileId || buyerProfileId.trim() === "")
    ) {
      if (cognitoId) {
        const user = await prismaClient.users.findUnique({
          where: {
            cognito_id: cognitoId,
          },
          select: {
            user_id: true,
            buyer_profiles: {
              select: {
                buyer_profile_id: true,
              },
            },
          },
        });

        if (user) {
          finalBuyerUserId = user.user_id;
          finalBuyerProfileId = user.buyer_profiles?.buyer_profile_id;
        } else {
          return JSON.stringify({
            success: false,
            error: {
              code: "USER_NOT_FOUND",
              message: `User not found for cognitoId: ${cognitoId}`,
              timestamp: new Date().toISOString(),
              request_id: requestId,
            },
          });
        }
      } else {
        return JSON.stringify({
          success: false,
          error: {
            code: "MISSING_USER_INFO",
            message:
              "buyerUserId, buyerProfileId, and cognitoId are all missing or empty",
            timestamp: new Date().toISOString(),
            request_id: requestId,
          },
        });
      }
    }

    // Validate that we have all required user information
    if (!finalBuyerUserId || !finalBuyerProfileId) {
      return JSON.stringify({
        success: false,
        error: {
          code: "INCOMPLETE_USER_INFO",
          message: "Could not resolve buyer user ID or buyer profile ID",
          timestamp: new Date().toISOString(),
          request_id: requestId,
        },
      });
    }

    // Initialize catalog offer operations
    const catalogOfferOps = new CatalogOfferOperations(prismaClient);

    // Parse expiresAt if provided
    let parsedExpiresAt: Date | undefined;
    if (expiresAt) {
      parsedExpiresAt = new Date(expiresAt);
      if (isNaN(parsedExpiresAt.getTime())) {
        return JSON.stringify({
          success: false,
          error: {
            code: "INVALID_EXPIRES_AT",
            message: "expiresAt must be a valid ISO 8601 datetime string",
            timestamp: new Date().toISOString(),
            request_id: requestId,
          },
        });
      }

      // Check if expires date is in the future
      if (parsedExpiresAt <= new Date()) {
        return JSON.stringify({
          success: false,
          error: {
            code: "EXPIRES_AT_IN_PAST",
            message: "expiresAt must be a future date",
            timestamp: new Date().toISOString(),
            request_id: requestId,
          },
        });
      }
    }

    // Create the catalog offer
    const result = await catalogOfferOps.createCatalogOffer({
      catalogListingId: catalogListingId,
      buyerUserId: finalBuyerUserId,
      buyerProfileId: finalBuyerProfileId,
      items: items
        .filter((item) => item != null)
        .map((item) => ({
          catalogProductVariantId: catalogProductVariantPublicToInternalId.get(
            item.catalogProductVariantId
          )!,
          requestedQuantity: item.requestedQuantity,
          buyerOfferPrice: item.buyerOfferPrice,
          buyerOfferPriceCurrency: item.buyerOfferPriceCurrency as any, // Type assertion for currency enum
        })),
      expiresAt: parsedExpiresAt,
      offerMessage: offerMessage || undefined,
    });

    if (!result.success) {
      return JSON.stringify({
        success: false,
        error: {
          ...result.error,
          timestamp: new Date().toISOString(),
          request_id: requestId,
        },
      });
    }

    // Send notifications to buyer and seller
    try {
      const userDbOps = new UserDatabaseOperations(prismaClient);

      // Get seller information from catalog listing
      const catalogListingWithSeller =
        await prismaClient.catalog_listings.findUnique({
          where: { catalog_listing_id: catalogListingId },
          select: {
            title: true,
            seller_user_id: true,
            users: {
              select: {
                user_id: true,
                email: true,
                first_name: true,
                last_name: true,
              },
            },
          },
        });

      if (catalogListingWithSeller && result.offerData) {
        const sellerInfo = {
          userId: catalogListingWithSeller.seller_user_id,
          email: catalogListingWithSeller.users.email,
          name:
            `${catalogListingWithSeller.users.first_name || ""} ${catalogListingWithSeller.users.last_name || ""}`.trim() ||
            "Seller",
        };

        // Get buyer information - need to handle the case where cognitoId might be undefined
        const buyer = cognitoId
          ? await userDbOps.getUserWithBuyerProfileByCognitoId(cognitoId)
          : null;
        const buyerInfo = buyer
          ? {
              userId: buyer.user_id,
              email: buyer.email,
              name:
                `${buyer.first_name || ""} ${buyer.last_name || ""}`.trim() ||
                "Buyer",
            }
          : null;

        if (buyerInfo) {
          // Calculate total offer amount
          const totalOfferAmount = result.offerData.items.reduce(
            (sum, item) =>
              sum + item.buyer_offer_price * item.requested_quantity,
            0
          );

          // Send notification to seller
          await notificationService.sendCatalogOfferSellerNotification(
            {
              offerId: result.offerData.catalog_offer_id,
              catalogId: catalogListingPublicId,
              catalogTitle: catalogListingWithSeller.title,
              sellerId: sellerInfo.userId,
              buyerId: buyerInfo.userId,
              buyerEmail: buyerInfo.email,
              buyerName: buyerInfo.name,
              offerAmount: totalOfferAmount,
              currency: result.offerData.total_offer_value_currency,
              itemCount: result.offerData.items.length,
              sellerInfo: sellerInfo,
            },
            ["EMAIL", "WEB", "PUSH"]
          );

          // Send confirmation notification to buyer
          await notificationService.sendCatalogOfferBuyerNotification(
            {
              offerId: result.offerData.catalog_offer_id,
              catalogId: catalogListingPublicId,
              catalogTitle: catalogListingWithSeller.title,
              buyerId: buyerInfo.userId,
              buyerEmail: buyerInfo.email,
              buyerName: buyerInfo.name,
              offerAmount: totalOfferAmount,
              currency: result.offerData.total_offer_value_currency,
              itemCount: result.offerData.items.length,
              sellerInfo: sellerInfo,
            },
            ["EMAIL", "WEB"]
          );
        }
      }
    } catch (notificationError) {
      // Log notification errors but don't fail the offer creation
      console.error(
        "Failed to send catalog offer notifications:",
        notificationError
      );
    }

    // Return success response with offer data
    return JSON.stringify({
      success: true,
      data: result.offerData,
    });
  } catch (err) {
    console.error("Error occurred while creating catalog offer");
    console.error(err);

    // Handle specific database errors
    let errorCode = "INTERNAL_ERROR";
    let errorMessage =
      "An internal error occurred while creating the catalog offer";
    let errorDetails: any = {
      error: err instanceof Error ? err.message : String(err),
      request_id: requestId,
      timestamp: new Date().toISOString(),
    };

    if (err instanceof Error) {
      // Handle Prisma/Database specific errors
      if (err.message.includes("Unique constraint")) {
        errorCode = "CONCURRENT_MODIFICATION";
        errorMessage =
          "The catalog listing was modified while you were creating your offer";
        errorDetails = {
          ...errorDetails,
          suggested_actions: [
            "Refresh catalog listing details",
            "Review latest changes",
            "Retry your offer creation",
          ],
        };
      } else if (err.message.includes("Foreign key constraint")) {
        errorCode = "INVALID_REFERENCE";
        errorMessage = "One or more referenced items no longer exist";
        errorDetails = {
          ...errorDetails,
          suggested_actions: [
            "Verify catalog listing still exists",
            "Check that product variants are still available",
            "Refresh your data and try again",
          ],
        };
      } else if (
        err.message.includes("Connection") ||
        err.message.includes("timeout")
      ) {
        errorCode = "DATABASE_CONNECTION_ERROR";
        errorMessage = "Temporary database connectivity issue";
        errorDetails = {
          ...errorDetails,
          suggested_actions: [
            "Retry the request in a few moments",
            "Contact support if the issue persists",
          ],
        };
      }
    }

    return JSON.stringify({
      success: false,
      error: {
        code: errorCode,
        message: errorMessage,
        details: errorDetails,
      },
    });
  }
};
