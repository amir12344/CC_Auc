import { env } from "$amplify/env/set-buyer-preferences";
import { AppSyncIdentityCognito } from "aws-lambda";

import type { Schema } from "../../data/resource";
import { importModuleFromLayer } from "../commons/importLayer";
import { UserDatabaseOperations } from "../commons/operations/users/UserDatabaseOperations";
import { UserPreferencesOperations } from "../commons/operations/users/UserPreferencesOperations";

type DatabaseConnectionDetails = {
  databaseName: string;
  hostname: string;
  port: number;
  username: string;
  password: string;
};

export const handler: Schema["setBuyerPreferences"]["functionHandler"] = async (
  event,
  context
) => {
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

    // Extract arguments
    const {
      requestType,
      preferredCategories,
      preferredSubcategories,
      budgetMin,
      budgetMax,
      budgetCurrency,
      minimumDiscountPercentage,
      listingTypePreferences,
      buyerSegments,
      preferredRegions,
      preferredBrandIds,
    } = event.arguments;

    // Authentication validation
    if (!cognitoId || cognitoId.trim() === "") {
      return JSON.stringify({
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication required",
        },
      });
    }

    // Request type validation
    if (!requestType || !["CREATE", "ADD", "DELETE"].includes(requestType)) {
      return JSON.stringify({
        success: false,
        error: {
          code: "INVALID_REQUEST_TYPE",
          message: "requestType must be one of: CREATE, ADD, DELETE",
        },
      });
    }

    // Budget validation
    if (
      budgetMin !== null &&
      budgetMin !== undefined &&
      budgetMax !== null &&
      budgetMax !== undefined &&
      budgetMin > budgetMax
    ) {
      return JSON.stringify({
        success: false,
        error: {
          code: "INVALID_BUDGET_RANGE",
          message: "Budget minimum cannot be greater than maximum",
        },
      });
    }

    // Discount percentage validation
    if (
      minimumDiscountPercentage !== null &&
      minimumDiscountPercentage !== undefined &&
      (minimumDiscountPercentage < 0 || minimumDiscountPercentage > 100)
    ) {
      return JSON.stringify({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Minimum discount percentage must be between 0 and 100",
          details: [
            {
              field: "minimumDiscountPercentage",
              message: "Value must be between 0 and 100",
            },
          ],
        },
      });
    }

    // Get user by Cognito ID
    const dbOps = new UserDatabaseOperations(prismaClient);
    const user = await dbOps.getUserByCognitoId(cognitoId);

    if (!user) {
      return JSON.stringify({
        success: false,
        error: {
          code: "USER_NOT_FOUND",
          message: "User not found for the authenticated session",
        },
      });
    }

    // Execute preferences operation
    const preferencesOps = new UserPreferencesOperations(prismaClient);
    const result = await preferencesOps.setBuyerPreferences({
      userId: user.user_id,
      requestType: requestType as "CREATE" | "ADD" | "DELETE",
      preferredCategories: preferredCategories?.filter(
        (cat) => cat !== null && cat !== undefined
      ) as string[],
      preferredSubcategories: preferredSubcategories?.filter(
        (subcat) => subcat !== null && subcat !== undefined
      ) as string[],
      budgetMin: budgetMin || undefined,
      budgetMax: budgetMax || undefined,
      budgetCurrency: budgetCurrency || undefined,
      minimumDiscountPercentage: minimumDiscountPercentage || undefined,
      listingTypePreferences: listingTypePreferences?.filter(
        (type) => type !== null && type !== undefined
      ) as string[],
      buyerSegments: buyerSegments?.filter(
        (segment) => segment !== null && segment !== undefined
      ) as string[],
      preferredRegions: preferredRegions?.filter(
        (region) => region !== null && region !== undefined
      ) as string[],
      preferredBrandIds: preferredBrandIds?.filter(
        (id) => id !== null && id !== undefined
      ) as string[],
    });

    // Handle operation result
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
      message: "Buyer preferences updated successfully",
    });
  } catch (err) {
    console.error("Error occurred while setting buyer preferences:", err);

    // Determine error type
    let errorCode = "INTERNAL_ERROR";
    let errorMessage =
      "An internal error occurred while updating buyer preferences";

    if (err instanceof Error) {
      if (err.message.includes("Foreign key constraint")) {
        if (err.message.includes("brand_id")) {
          errorCode = "INVALID_BRAND_IDS";
          errorMessage = "One or more brand IDs are invalid";
        } else {
          errorCode = "INVALID_REFERENCE";
          errorMessage = "Invalid reference to related data";
        }
      } else if (
        err.message.includes("Connection") ||
        err.message.includes("timeout")
      ) {
        errorCode = "DATABASE_CONNECTION_ERROR";
        errorMessage = "Database connectivity issue";
      }
    }

    return JSON.stringify({
      success: false,
      error: {
        code: errorCode,
        message: errorMessage,
        details: {
          error: err instanceof Error ? err.message : String(err),
        },
      },
    });
  }
};
