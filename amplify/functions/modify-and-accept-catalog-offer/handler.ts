import { env } from "$amplify/env/modify-and-accept-catalog-offer";
import { AppSyncIdentityCognito } from "aws-lambda";

import type { Schema } from "../../data/resource";
import { importModuleFromLayer } from "../commons/importLayer";
import { CatalogOfferOperations } from "../commons/operations/catalogs/CatalogOfferOperations";
import { UserDatabaseOperations } from "../commons/operations/users/UserDatabaseOperations";

type DatabaseConnectionDetails = {
  databaseName: string;
  hostname: string;
  port: number;
  username: string;
  password: string;
};

export const handler: Schema["modifyAndAcceptCatalogOffer"]["functionHandler"] =
  async (event, context) => {
    console.log(`EVENT: ${JSON.stringify(event)}`);
    const cognitoId = (event.identity as AppSyncIdentityCognito).sub;

    try {
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

      // Extract and validate arguments
      const {
        offerPublicId,
        sellerMessage,
        autoCreateOrder,
        shippingAddressPublicId,
        billingAddressPublicId,
        orderNotes,
        modifications,
      } = event.arguments;

      // Validate required arguments
      if (!cognitoId || cognitoId.trim() === "") {
        return JSON.stringify({
          success: false,
          error: {
            code: "COGNITO_ID_REQUIRED",
            message: "Cognito ID is required for user authentication",
          },
        });
      }

      if (!offerPublicId || offerPublicId.trim() === "") {
        return JSON.stringify({
          success: false,
          error: {
            code: "OFFER_PUBLIC_ID_REQUIRED",
            message: "Offer public ID is required",
          },
        });
      }

      if (!modifications || modifications.length === 0) {
        return JSON.stringify({
          success: false,
          error: {
            code: "MODIFICATIONS_REQUIRED",
            message: "At least one modification must be provided",
          },
        });
      }

      // Initialize operations
      const userDbOps = new UserDatabaseOperations(prismaClient);
      const catalogOfferOps = new CatalogOfferOperations(prismaClient);

      // Get user by Cognito ID
      const user = await userDbOps.getUserByCognitoId(cognitoId);
      if (!user) {
        return JSON.stringify({
          success: false,
          error: {
            code: "USER_NOT_FOUND",
            message: "User not found for the authenticated session",
          },
        });
      }

      // Validate user type - seller operations require seller profile
      if (!["SELLER", "BUYER_AND_SELLER"].includes(user.user_type)) {
        return JSON.stringify({
          success: false,
          error: {
            code: "INVALID_USER_TYPE",
            message: "Only sellers can modify and auto-accept catalog offers",
            details: {
              current_user_type: user.user_type,
              required_user_types: ["SELLER", "BUYER_AND_SELLER"],
            },
          },
        });
      }

      // Get seller profile
      const sellerProfile = await prismaClient.seller_profiles.findUnique({
        where: { user_id: user.user_id },
      });

      if (!sellerProfile) {
        return JSON.stringify({
          success: false,
          error: {
            code: "SELLER_PROFILE_NOT_FOUND",
            message:
              "Seller profile not found. Please create a seller profile first.",
          },
        });
      }

      // Validate modification structure
      for (let i = 0; i < modifications.length; i++) {
        const modification = modifications[i];

        // Add null/undefined check first
        if (!modification) {
          return JSON.stringify({
            success: false,
            error: {
              code: "INVALID_MODIFICATION_STRUCTURE",
              message: `Modification at index ${i} is null or undefined`,
              details: { modification_index: i },
            },
          });
        }

        if (!modification.action) {
          return JSON.stringify({
            success: false,
            error: {
              code: "INVALID_MODIFICATION_STRUCTURE",
              message: `Modification at index ${i} is missing required 'action' field`,
              details: { modification_index: i },
            },
          });
        }

        if (
          !["ADD_PRODUCT", "UPDATE_EXISTING", "REMOVE_PRODUCT"].includes(
            modification.action
          )
        ) {
          return JSON.stringify({
            success: false,
            error: {
              code: "INVALID_MODIFICATION_ACTION",
              message: `Invalid action '${modification.action}' at index ${i}`,
              details: {
                modification_index: i,
                provided_action: modification.action,
                valid_actions: [
                  "ADD_PRODUCT",
                  "UPDATE_EXISTING",
                  "REMOVE_PRODUCT",
                ],
              },
            },
          });
        }

        // Validate action-specific requirements using else if structure
        if (modification.action === "ADD_PRODUCT") {
          if (
            !modification.catalogProductPublicId &&
            !modification.catalogProductVariantPublicId
          ) {
            return JSON.stringify({
              success: false,
              error: {
                code: "MISSING_PRODUCT_REFERENCE",
                message: `ADD_PRODUCT action at index ${i} requires either catalogProductPublicId or catalogProductVariantPublicId`,
                details: { modification_index: i },
              },
            });
          }

          if (!modification.quantity || modification.quantity <= 0) {
            return JSON.stringify({
              success: false,
              error: {
                code: "INVALID_QUANTITY",
                message: `ADD_PRODUCT action at index ${i} requires a valid quantity greater than 0`,
                details: {
                  modification_index: i,
                  provided_quantity: modification.quantity,
                },
              },
            });
          }

          if (
            !modification.sellerPricePerUnit ||
            modification.sellerPricePerUnit <= 0
          ) {
            return JSON.stringify({
              success: false,
              error: {
                code: "INVALID_PRICE",
                message: `ADD_PRODUCT action at index ${i} requires a valid sellerPricePerUnit greater than 0`,
                details: {
                  modification_index: i,
                  provided_price: modification.sellerPricePerUnit,
                },
              },
            });
          }
        } else if (modification.action === "UPDATE_EXISTING") {
          if (!modification.catalogOfferItemPublicId) {
            return JSON.stringify({
              success: false,
              error: {
                code: "MISSING_ITEM_REFERENCE",
                message: `UPDATE_EXISTING action at index ${i} requires catalogOfferItemPublicId`,
                details: { modification_index: i },
              },
            });
          }

          if (
            (modification.newQuantity === undefined ||
              modification.newQuantity === null) &&
            (modification.newSellerPricePerUnit === undefined ||
              modification.newSellerPricePerUnit === null)
          ) {
            return JSON.stringify({
              success: false,
              error: {
                code: "NO_UPDATES_SPECIFIED",
                message: `UPDATE_EXISTING action at index ${i} requires either newQuantity or newSellerPricePerUnit`,
                details: { modification_index: i },
              },
            });
          }

          if (
            modification.newQuantity !== undefined &&
            modification.newQuantity !== null &&
            modification.newQuantity <= 0
          ) {
            return JSON.stringify({
              success: false,
              error: {
                code: "INVALID_QUANTITY",
                message: `UPDATE_EXISTING action at index ${i} newQuantity must be greater than 0`,
                details: {
                  modification_index: i,
                  provided_quantity: modification.newQuantity,
                },
              },
            });
          }

          if (
            modification.newSellerPricePerUnit !== undefined &&
            modification.newSellerPricePerUnit !== null &&
            modification.newSellerPricePerUnit <= 0
          ) {
            return JSON.stringify({
              success: false,
              error: {
                code: "INVALID_PRICE",
                message: `UPDATE_EXISTING action at index ${i} newSellerPricePerUnit must be greater than 0`,
                details: {
                  modification_index: i,
                  provided_price: modification.newSellerPricePerUnit,
                },
              },
            });
          }
        } else if (modification.action === "REMOVE_PRODUCT") {
          if (!modification.catalogOfferItemPublicId) {
            return JSON.stringify({
              success: false,
              error: {
                code: "MISSING_ITEM_REFERENCE",
                message: `REMOVE_PRODUCT action at index ${i} requires catalogOfferItemPublicId`,
                details: { modification_index: i },
              },
            });
          }
        }
      }

      // Validate addresses if auto-creating order
      if (autoCreateOrder) {
        if (shippingAddressPublicId && shippingAddressPublicId.trim() === "") {
          return JSON.stringify({
            success: false,
            error: {
              code: "INVALID_SHIPPING_ADDRESS",
              message:
                "Shipping address public ID cannot be empty when provided",
            },
          });
        }

        if (billingAddressPublicId && billingAddressPublicId.trim() === "") {
          return JSON.stringify({
            success: false,
            error: {
              code: "INVALID_BILLING_ADDRESS",
              message:
                "Billing address public ID cannot be empty when provided",
            },
          });
        }
      }

      // Execute the modify and accept operation
      const result = await catalogOfferOps.modifyAndAcceptCatalogOffer({
        catalogOfferPublicId: offerPublicId,
        sellerUserId: user.user_id,
        sellerMessage: sellerMessage ?? undefined,
        autoCreateOrder: autoCreateOrder || false,
        shippingAddressPublicId: shippingAddressPublicId ?? undefined,
        billingAddressPublicId: billingAddressPublicId ?? undefined,
        orderNotes: orderNotes ?? undefined,
        modifications: modifications.map((mod: any) => ({
          action: mod.action,
          catalogProductPublicId: mod.catalogProductPublicId,
          catalogProductVariantPublicId: mod.catalogProductVariantPublicId,
          catalogOfferItemPublicId: mod.catalogOfferItemPublicId,
          quantity: mod.quantity,
          sellerPricePerUnit: mod.sellerPricePerUnit,
          newQuantity: mod.newQuantity,
          newSellerPricePerUnit: mod.newSellerPricePerUnit,
          modificationReason: mod.modificationReason,
        })),
      });

      if (!result.success) {
        return JSON.stringify({
          success: false,
          error: result.error,
        });
      }

      // Return success response
      return JSON.stringify({
        success: true,
        data: result.data,
        message: "Catalog offer successfully modified and auto-accepted",
      });
    } catch (err) {
      console.error("Error occurred in modifyAndAcceptCatalogOffer handler:");
      console.error(err);

      // Handle specific database errors
      let errorCode = "INTERNAL_ERROR";
      let errorMessage =
        "An internal error occurred while processing the catalog offer modification";

      if (err instanceof Error) {
        // Handle Prisma-specific errors
        if (err.message.includes("Unique constraint")) {
          errorCode = "DUPLICATE_ENTRY";
          errorMessage = "A duplicate entry was detected during the operation";
        } else if (err.message.includes("Foreign key constraint")) {
          errorCode = "INVALID_REFERENCE";
          errorMessage = "Invalid reference to related data";
        } else if (err.message.includes("Record to update not found")) {
          errorCode = "RECORD_NOT_FOUND";
          errorMessage = "One or more records could not be found for update";
        } else if (err.message.includes("Transaction")) {
          errorCode = "TRANSACTION_FAILED";
          errorMessage = "The operation failed due to a transaction error";
        }
      }

      return JSON.stringify({
        success: false,
        error: {
          code: errorCode,
          message: errorMessage,
          details: {
            error: err instanceof Error ? err.message : String(err),
            timestamp: new Date().toISOString(),
          },
        },
      });
    }
  };
