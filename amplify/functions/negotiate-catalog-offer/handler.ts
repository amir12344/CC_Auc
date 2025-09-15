import { env } from "$amplify/env/negotiate-catalog-offer";

import type { Schema } from "../../data/resource";
import { importModuleFromLayer } from "../commons/importLayer";
import {
  AlternativeSuggestion,
  FinalBudgetInfo,
  ItemChange,
  ItemNegotiation,
  ItemRejection,
  NegotiateCatalogOfferOperations,
} from "../commons/operations/catalogs/NegotiateCatalogOfferOperations";

type DatabaseConnectionDetails = {
  databaseName: string;
  hostname: string;
  port: number;
  username: string;
  password: string;
};

type AmplifyItemNegotiation = Schema["ItemNegotiation"]["type"];
type AmplifyItemRejection = Schema["ItemRejection"]["type"];
type AmplifyItemChange = Schema["ItemChange"]["type"];
type AmplifyAlternativeSuggestion = Schema["AlternativeSuggestion"]["type"];
type AmplifyFinalBudgetInfo = Schema["FinalBudgetInfo"]["type"];
type AmplifyRejectionCategory = Schema["RejectionCategory"]["type"];
type AmplifyItemResponseType = Schema["ItemResponseType"]["type"];
type AmplifyItemChangeType = Schema["ItemChangeType"]["type"];

// Helper function to validate public IDs
const isValidPublicId = (id: string): boolean => {
  return Boolean(id) && typeof id === "string" && id.length === 14; // STANDARD_ID_LENGTH
};

// Convert item negotiations from Amplify format to internal format
const convertItemNegotiations = (
  items: (AmplifyItemNegotiation | null | undefined)[] | null | undefined
): ItemNegotiation[] => {
  if (!items) return [];
  return items
    .filter((item): item is NonNullable<AmplifyItemNegotiation> => item != null)
    .map((item) => {
      // Validate that catalogOfferItemId is a public ID
      if (!isValidPublicId(item.catalogOfferItemId)) {
        throw new Error(
          `Invalid catalogOfferItemId format: ${item.catalogOfferItemId}`
        );
      }

      return {
        catalogOfferItemId: item.catalogOfferItemId, // Keep as public_id
        offerPricePerUnit: item.offerPricePerUnit,
        offerQuantity: item.offerQuantity,
        responseType: item.responseType as AmplifyItemResponseType,
        offerMessage: item.offerMessage || undefined,
      };
    });
};

// Convert item rejections from Amplify format to internal format
const convertItemRejections = (
  items: (AmplifyItemRejection | null | undefined)[] | null | undefined
): ItemRejection[] => {
  if (!items) return [];
  return items
    .filter((item): item is NonNullable<AmplifyItemRejection> => item != null)
    .map((item) => {
      // Validate that catalogOfferItemId is a public ID
      if (!isValidPublicId(item.catalogOfferItemId)) {
        throw new Error(
          `Invalid catalogOfferItemId format: ${item.catalogOfferItemId}`
        );
      }

      return {
        catalogOfferItemId: item.catalogOfferItemId, // Keep as public_id
        rejectionReason: item.rejectionReason,
        rejectionCategory: item.rejectionCategory as AmplifyRejectionCategory,
      };
    });
};

// Convert item changes from Amplify format to internal format
const convertItemChanges = (
  items: (AmplifyItemChange | null | undefined)[] | null | undefined
): ItemChange[] => {
  if (!items) return [];
  return items
    .filter((item): item is NonNullable<AmplifyItemChange> => item != null)
    .map((item) => {
      // Validate public IDs if they exist
      if (
        item.catalogOfferItemId &&
        !isValidPublicId(item.catalogOfferItemId)
      ) {
        throw new Error(
          `Invalid catalogOfferItemId format: ${item.catalogOfferItemId}`
        );
      }

      if (
        item.catalogProductVariantId &&
        !isValidPublicId(item.catalogProductVariantId)
      ) {
        throw new Error(
          `Invalid catalogProductVariantId format: ${item.catalogProductVariantId}`
        );
      }

      return {
        changeType: item.changeType as AmplifyItemChangeType,
        catalogOfferItemId: item.catalogOfferItemId || undefined, // Keep as public_id
        catalogProductVariantId: item.catalogProductVariantId || undefined, // Keep as public_id
        newQuantity: item.newQuantity || undefined,
        requestedQuantity: item.requestedQuantity || undefined,
        buyerOfferPrice: item.buyerOfferPrice || undefined,
        buyerOfferPriceCurrency: item.buyerOfferPriceCurrency as any,
        changeReason: item.changeReason || undefined,
      };
    });
};

// Convert alternative suggestion from Amplify format to internal format
const convertAlternativeSuggestion = (
  alt: AmplifyAlternativeSuggestion | null | undefined
): AlternativeSuggestion | undefined => {
  if (!alt) return undefined;

  return {
    message: alt.message,
    suggestedVariants:
      alt.suggestedVariants
        ?.filter((v): v is NonNullable<typeof v> => v != null)
        .map((v) => {
          // Validate that catalogProductVariantId is a public ID
          if (!isValidPublicId(v.catalogProductVariantId)) {
            throw new Error(
              `Invalid catalogProductVariantId format: ${v.catalogProductVariantId}`
            );
          }

          return {
            catalogProductVariantId: v.catalogProductVariantId, // Keep as public_id
            suggestedPrice: v.suggestedPrice,
            availableQuantity: v.availableQuantity,
            productName: v.productName,
          };
        }) || undefined,
    minimumAcceptableTerms: alt.minimumAcceptableTerms
      ? {
          minimumUnitPrice:
            alt.minimumAcceptableTerms.minimumUnitPrice || undefined,
          minimumTotalOrder:
            alt.minimumAcceptableTerms.minimumTotalOrder || undefined,
          minimumQuantity:
            alt.minimumAcceptableTerms.minimumQuantity || undefined,
        }
      : undefined,
  };
};

// Convert final budget info from Amplify format to internal format
const convertFinalBudgetInfo = (
  budget: AmplifyFinalBudgetInfo | null | undefined
): FinalBudgetInfo | undefined => {
  if (!budget) return undefined;

  return {
    maximumTotalBudget: budget.maximumTotalBudget,
    maximumUnitPrices: budget.maximumUnitPrices
      ? (JSON.parse(budget.maximumUnitPrices as string) as Record<
          string,
          number
        >)
      : undefined,
    preferredAlternatives:
      budget.preferredAlternatives?.filter(
        (item): item is string => item != null
      ) || undefined,
  };
};

export const handler: Schema["negotiateCatalogOffer"]["functionHandler"] =
  async (event, context) => {
    console.log(`EVENT: ${JSON.stringify(event)}`);

    // Generate request ID for tracking
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      // Extract arguments from event
      const {
        catalogOfferId: catalogOfferPublicId,
        userId,
        userType,
        cognitoId,
        actionType,
        itemNegotiations,
        itemRejections,
        itemChanges,
        rejectionReason,
        rejectionCategory,
        alternativeSuggestion,
        finalBudgetInfo,
        validUntil,
      } = event.arguments;

      // Validate required arguments
      if (!catalogOfferPublicId || catalogOfferPublicId.trim() === "") {
        return JSON.stringify({
          success: false,
          error: {
            code: "MISSING_CATALOG_OFFER_ID",
            message: "catalogOfferId is required",
            timestamp: new Date().toISOString(),
            request_id: requestId,
          },
        });
      }

      // Validate that catalogOfferId is a valid public ID
      if (!isValidPublicId(catalogOfferPublicId)) {
        return JSON.stringify({
          success: false,
          error: {
            code: "INVALID_CATALOG_OFFER_ID",
            message: "catalogOfferId must be a valid public ID",
            details: { providedId: catalogOfferPublicId },
            timestamp: new Date().toISOString(),
            request_id: requestId,
          },
        });
      }

      if (!actionType || actionType.trim() === "") {
        return JSON.stringify({
          success: false,
          error: {
            code: "MISSING_ACTION_TYPE",
            message: "actionType is required",
            timestamp: new Date().toISOString(),
            request_id: requestId,
          },
        });
      }

      if (!userType || !["BUYER", "SELLER"].includes(userType)) {
        return JSON.stringify({
          success: false,
          error: {
            code: "INVALID_USER_TYPE",
            message: "userType must be either 'BUYER' or 'SELLER'",
            details: { providedUserType: userType },
            timestamp: new Date().toISOString(),
            request_id: requestId,
          },
        });
      }

      // Validate action type format
      const validActionTypes = [
        "SELLER_COUNTER",
        "BUYER_ACCEPT",
        "SELLER_ACCEPT",
        "SELLER_REJECT",
        "BUYER_REJECT",
        "BUYER_COUNTER",
      ];
      if (!validActionTypes.includes(actionType)) {
        return JSON.stringify({
          success: false,
          error: {
            code: "INVALID_ACTION_TYPE",
            message: "Invalid negotiation action type",
            details: {
              providedActionType: actionType,
              validActionTypes,
            },
            timestamp: new Date().toISOString(),
            request_id: requestId,
          },
        });
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

      // Resolve user ID if not provided
      let finalUserId = userId;
      if ((!userId || userId.trim() === "") && cognitoId) {
        const user = await prismaClient.users.findUnique({
          where: { cognito_id: cognitoId },
          select: { user_id: true },
        });

        if (user) {
          finalUserId = user.user_id;
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
      }

      if (!finalUserId || finalUserId.trim() === "") {
        return JSON.stringify({
          success: false,
          error: {
            code: "MISSING_USER_ID",
            message: "userId or cognitoId is required",
            timestamp: new Date().toISOString(),
            request_id: requestId,
          },
        });
      }

      // Validate rejection-specific requirements
      if (["BUYER_REJECT", "SELLER_REJECT"].includes(actionType)) {
        if (!rejectionReason || rejectionReason.trim() === "") {
          return JSON.stringify({
            success: false,
            error: {
              code: "REJECTION_REASON_REQUIRED",
              message:
                "A rejection reason must be provided when rejecting an offer",
              details: {
                rejectionCategory: rejectionCategory,
                requiredFields: ["rejection_reason"],
                minimumReasonLength: 10,
                maximumReasonLength: 1000,
              },
              timestamp: new Date().toISOString(),
              request_id: requestId,
            },
          });
        }

        if (rejectionReason.length < 10) {
          return JSON.stringify({
            success: false,
            error: {
              code: "REJECTION_REASON_TOO_SHORT",
              message: "Rejection reason must be at least 10 characters long",
              details: {
                providedLength: rejectionReason.length,
                minimumLength: 10,
              },
              timestamp: new Date().toISOString(),
              request_id: requestId,
            },
          });
        }

        if (rejectionReason.length > 1000) {
          return JSON.stringify({
            success: false,
            error: {
              code: "REJECTION_REASON_TOO_LONG",
              message: "Rejection reason cannot exceed 1000 characters",
              details: {
                providedLength: rejectionReason.length,
                maximumLength: 1000,
              },
              timestamp: new Date().toISOString(),
              request_id: requestId,
            },
          });
        }
      }

      // Validate counter-offer requirements
      if (["BUYER_COUNTER", "SELLER_COUNTER"].includes(actionType)) {
        if (!itemNegotiations || itemNegotiations.length === 0) {
          return JSON.stringify({
            success: false,
            error: {
              code: "NO_ITEM_NEGOTIATIONS",
              message: "Item negotiations are required for counter-offers",
              details: {
                actionType: actionType,
                requiredFields: ["item_negotiations"],
              },
              timestamp: new Date().toISOString(),
              request_id: requestId,
            },
          });
        }

        // Validate each item negotiation
        for (let i = 0; i < itemNegotiations.length; i++) {
          const itemNeg = itemNegotiations[i];

          if (!itemNeg) {
            return JSON.stringify({
              success: false,
              error: {
                code: "VALIDATION_ERROR",
                message: "Invalid item negotiation data",
                details: {
                  validationErrors: [
                    {
                      field: `itemNegotiations[${i}]`,
                      message: "Item negotiation cannot be null or undefined",
                      providedValue: itemNeg,
                    },
                  ],
                },
                timestamp: new Date().toISOString(),
                request_id: requestId,
              },
            });
          }

          if (
            !itemNeg.catalogOfferItemId ||
            itemNeg.catalogOfferItemId.trim() === ""
          ) {
            return JSON.stringify({
              success: false,
              error: {
                code: "VALIDATION_ERROR",
                message: "Invalid item negotiation data",
                details: {
                  validationErrors: [
                    {
                      field: `itemNegotiations[${i}].catalogOfferItemId`,
                      message: "catalogOfferItemId is required",
                      providedValue: itemNeg.catalogOfferItemId,
                    },
                  ],
                },
                timestamp: new Date().toISOString(),
                request_id: requestId,
              },
            });
          }

          // Validate catalogOfferItemId format
          if (!isValidPublicId(itemNeg.catalogOfferItemId)) {
            return JSON.stringify({
              success: false,
              error: {
                code: "VALIDATION_ERROR",
                message: "Invalid item negotiation data",
                details: {
                  validationErrors: [
                    {
                      field: `itemNegotiations[${i}].catalogOfferItemId`,
                      message: "catalogOfferItemId must be a valid public ID",
                      providedValue: itemNeg.catalogOfferItemId,
                      expectedFormat: "14-character public ID",
                    },
                  ],
                },
                timestamp: new Date().toISOString(),
                request_id: requestId,
              },
            });
          }

          if (!itemNeg.offerPricePerUnit || itemNeg.offerPricePerUnit <= 0) {
            return JSON.stringify({
              success: false,
              error: {
                code: "VALIDATION_ERROR",
                message: "Invalid item negotiation data",
                details: {
                  validationErrors: [
                    {
                      field: `itemNegotiations[${i}].offerPricePerUnit`,
                      message: "Must be a positive number",
                      providedValue: itemNeg.offerPricePerUnit,
                      expectedFormat: "decimal > 0",
                    },
                  ],
                },
                timestamp: new Date().toISOString(),
                request_id: requestId,
              },
            });
          }

          if (!itemNeg.offerQuantity || itemNeg.offerQuantity <= 0) {
            return JSON.stringify({
              success: false,
              error: {
                code: "VALIDATION_ERROR",
                message: "Invalid item negotiation data",
                details: {
                  validationErrors: [
                    {
                      field: `itemNegotiations[${i}].offerQuantity`,
                      message: "Must be a positive integer",
                      providedValue: itemNeg.offerQuantity,
                      expectedFormat: "integer > 0",
                    },
                  ],
                },
                timestamp: new Date().toISOString(),
                request_id: requestId,
              },
            });
          }
        }
      }

      // Validate accept-specific requirements
      if (["BUYER_ACCEPT", "SELLER_ACCEPT"].includes(actionType)) {
        // For accepts, we don't require item negotiations as we accept the current terms
        // But if provided, they should be valid
        if (itemNegotiations && itemNegotiations.length > 0) {
          for (let i = 0; i < itemNegotiations.length; i++) {
            const itemNeg = itemNegotiations[i];

            if (!itemNeg) {
              return JSON.stringify({
                success: false,
                error: {
                  code: "VALIDATION_ERROR",
                  message: "Invalid item negotiation data",
                  details: {
                    validationErrors: [
                      {
                        field: `itemNegotiations[${i}]`,
                        message: "Item negotiation cannot be null or undefined",
                        providedValue: itemNeg,
                      },
                    ],
                  },
                  timestamp: new Date().toISOString(),
                  request_id: requestId,
                },
              });
            }
            if (
              !itemNeg.catalogOfferItemId ||
              itemNeg.catalogOfferItemId.trim() === ""
            ) {
              return JSON.stringify({
                success: false,
                error: {
                  code: "VALIDATION_ERROR",
                  message: "Invalid item negotiation data",
                  details: {
                    validationErrors: [
                      {
                        field: `itemNegotiations[${i}].catalogOfferItemId`,
                        message: "catalogOfferItemId is required when provided",
                        providedValue: itemNeg.catalogOfferItemId,
                      },
                    ],
                  },
                  timestamp: new Date().toISOString(),
                  request_id: requestId,
                },
              });
            }

            // Validate catalogOfferItemId format
            if (!isValidPublicId(itemNeg.catalogOfferItemId)) {
              return JSON.stringify({
                success: false,
                error: {
                  code: "VALIDATION_ERROR",
                  message: "Invalid item negotiation data",
                  details: {
                    validationErrors: [
                      {
                        field: `itemNegotiations[${i}].catalogOfferItemId`,
                        message: "catalogOfferItemId must be a valid public ID",
                        providedValue: itemNeg.catalogOfferItemId,
                        expectedFormat: "14-character public ID",
                      },
                    ],
                  },
                  timestamp: new Date().toISOString(),
                  request_id: requestId,
                },
              });
            }
          }
        }
      }

      // Validate itemChanges if provided
      if (itemChanges && itemChanges.length > 0) {
        for (let i = 0; i < itemChanges.length; i++) {
          const change = itemChanges[i];

          if (!change) {
            return JSON.stringify({
              success: false,
              error: {
                code: "VALIDATION_ERROR",
                message: "Invalid item change data",
                details: {
                  validationErrors: [
                    {
                      field: `itemChanges[${i}]`,
                      message: "Item change cannot be null or undefined",
                      providedValue: change,
                    },
                  ],
                },
                timestamp: new Date().toISOString(),
                request_id: requestId,
              },
            });
          }

          // Validate public IDs in item changes
          if (
            change.catalogOfferItemId &&
            !isValidPublicId(change.catalogOfferItemId)
          ) {
            return JSON.stringify({
              success: false,
              error: {
                code: "VALIDATION_ERROR",
                message: "Invalid item change data",
                details: {
                  validationErrors: [
                    {
                      field: `itemChanges[${i}].catalogOfferItemId`,
                      message: "catalogOfferItemId must be a valid public ID",
                      providedValue: change.catalogOfferItemId,
                      expectedFormat: "14-character public ID",
                    },
                  ],
                },
                timestamp: new Date().toISOString(),
                request_id: requestId,
              },
            });
          }

          if (
            change.catalogProductVariantId &&
            !isValidPublicId(change.catalogProductVariantId)
          ) {
            return JSON.stringify({
              success: false,
              error: {
                code: "VALIDATION_ERROR",
                message: "Invalid item change data",
                details: {
                  validationErrors: [
                    {
                      field: `itemChanges[${i}].catalogProductVariantId`,
                      message:
                        "catalogProductVariantId must be a valid public ID",
                      providedValue: change.catalogProductVariantId,
                      expectedFormat: "14-character public ID",
                    },
                  ],
                },
                timestamp: new Date().toISOString(),
                request_id: requestId,
              },
            });
          }
        }
      }

      // Validate alternativeSuggestion if provided
      if (alternativeSuggestion?.suggestedVariants) {
        for (
          let i = 0;
          i < alternativeSuggestion.suggestedVariants.length;
          i++
        ) {
          const variant = alternativeSuggestion.suggestedVariants[i];
          if (variant && !isValidPublicId(variant.catalogProductVariantId)) {
            return JSON.stringify({
              success: false,
              error: {
                code: "VALIDATION_ERROR",
                message: "Invalid alternative suggestion data",
                details: {
                  validationErrors: [
                    {
                      field: `alternativeSuggestion.suggestedVariants[${i}].catalogProductVariantId`,
                      message:
                        "catalogProductVariantId must be a valid public ID",
                      providedValue: variant.catalogProductVariantId,
                      expectedFormat: "14-character public ID",
                    },
                  ],
                },
                timestamp: new Date().toISOString(),
                request_id: requestId,
              },
            });
          }
        }
      }

      // Parse validUntil if provided
      let parsedValidUntil: Date | undefined;
      if (validUntil) {
        parsedValidUntil = new Date(validUntil);
        if (isNaN(parsedValidUntil.getTime())) {
          return JSON.stringify({
            success: false,
            error: {
              code: "INVALID_VALID_UNTIL",
              message: "validUntil must be a valid ISO 8601 datetime string",
              details: { providedValue: validUntil },
              timestamp: new Date().toISOString(),
              request_id: requestId,
            },
          });
        }

        // Check if valid until date is in the future
        if (parsedValidUntil <= new Date()) {
          return JSON.stringify({
            success: false,
            error: {
              code: "VALID_UNTIL_IN_PAST",
              message: "validUntil must be a future date",
              details: {
                providedDate: parsedValidUntil,
                currentTime: new Date(),
              },
              timestamp: new Date().toISOString(),
              request_id: requestId,
            },
          });
        }
      }

      // Convert Amplify types to internal types with validation
      let convertedItemNegotiations: ItemNegotiation[] = [];
      let convertedItemRejections: ItemRejection[] = [];
      let convertedItemChanges: ItemChange[] = [];
      let convertedAlternativeSuggestion: AlternativeSuggestion | undefined;
      let convertedFinalBudgetInfo: FinalBudgetInfo | undefined;

      try {
        convertedItemNegotiations = convertItemNegotiations(itemNegotiations);
        convertedItemRejections = convertItemRejections(itemRejections);
        convertedItemChanges = convertItemChanges(itemChanges);
        convertedAlternativeSuggestion = convertAlternativeSuggestion(
          alternativeSuggestion
        );
        convertedFinalBudgetInfo = convertFinalBudgetInfo(finalBudgetInfo);
      } catch (conversionError) {
        return JSON.stringify({
          success: false,
          error: {
            code: "DATA_CONVERSION_ERROR",
            message: "Error converting input data",
            details: {
              error:
                conversionError instanceof Error
                  ? conversionError.message
                  : String(conversionError),
            },
            timestamp: new Date().toISOString(),
            request_id: requestId,
          },
        });
      }

      // Initialize negotiation operations
      const negotiationOps = new NegotiateCatalogOfferOperations(prismaClient);

      // Execute the negotiation with public IDs
      const result = await negotiationOps.negotiateCatalogOffer({
        catalogOfferId: catalogOfferPublicId, // Pass public_id
        userId: finalUserId,
        userType: userType as "BUYER" | "SELLER",
        actionType: actionType as any,
        itemNegotiations: convertedItemNegotiations,
        itemRejections: convertedItemRejections,
        itemChanges: convertedItemChanges,
        rejectionReason: rejectionReason || undefined,
        rejectionCategory: rejectionCategory as any,
        alternativeSuggestion: convertedAlternativeSuggestion,
        finalBudgetInfo: convertedFinalBudgetInfo,
        validUntil: parsedValidUntil,
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

      // Return success response
      return JSON.stringify({
        success: true,
        data: result.data,
        metadata: {
          request_id: requestId,
          timestamp: new Date().toISOString(),
          action_type: actionType,
          user_type: userType,
        },
      });
    } catch (err) {
      console.error("Error occurred while negotiating catalog offer");
      console.error(err);

      // Handle specific database errors
      let errorCode = "INTERNAL_ERROR";
      let errorMessage =
        "An internal error occurred while processing the negotiation";
      let errorDetails: any = {
        error: err instanceof Error ? err.message : String(err),
        request_id: requestId,
        timestamp: new Date().toISOString(),
      };

      if (err instanceof Error) {
        // Handle Prisma/Database specific errors
        if (err.message.includes("Unique constraint")) {
          errorCode = "CONCURRENT_MODIFICATION";
          errorMessage = "The offer was modified while you were making changes";
          errorDetails = {
            ...errorDetails,
            suggestedActions: [
              "Refresh offer details",
              "Review latest changes",
              "Retry your negotiation",
            ],
          };
        } else if (err.message.includes("Foreign key constraint")) {
          errorCode = "INVALID_REFERENCE";
          errorMessage = "One or more referenced items no longer exist";
          errorDetails = {
            ...errorDetails,
            suggestedActions: [
              "Verify offer still exists",
              "Check that offer items are still available",
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
            suggestedActions: [
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
