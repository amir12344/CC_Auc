import { env } from "$amplify/env/create-buyer-profile";
import { AppSyncIdentityCognito } from "aws-lambda";

import type { Schema } from "../../data/resource";
import { importModuleFromLayer } from "../commons/importLayer";
import { UserDatabaseOperations } from "../commons/operations/users/UserDatabaseOperations";
import { UserOperations } from "../commons/operations/users/UserOperations";

type DatabaseConnectionDetails = {
  databaseName: string;
  hostname: string;
  port: number;
  username: string;
  password: string;
};

export const handler: Schema["createBuyerProfile"]["functionHandler"] = async (
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

    // Extract and validate arguments
    const { resellerTaxId } = event.arguments;

    if (!cognitoId || cognitoId.trim() === "") {
      return JSON.stringify({
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication required",
        },
      });
    }

    // Initialize database operations
    const dbOps = new UserDatabaseOperations(prismaClient);

    // Get user by Cognito ID
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

    // Validate reseller tax ID format if provided
    if (resellerTaxId && resellerTaxId.trim() !== "") {
      // Basic UUID validation for reseller tax ID
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(resellerTaxId)) {
        return JSON.stringify({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid reseller tax ID format",
            details: [
              {
                field: "resellerTaxId",
                message: "Reseller tax ID must be a valid UUID",
              },
            ],
          },
        });
      }
    }

    // Initialize user operations
    const userOps = new UserOperations(prismaClient);

    // Create buyer profile
    const result = await userOps.createBuyerProfile({
      userId: user.user_id,
      resellerTaxId: resellerTaxId?.trim(),
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
      data: {
        buyer_profile: result.data!.buyer_profile,
      },
      message: "Buyer profile created successfully",
    });
  } catch (err) {
    console.error("Error occurred while creating buyer profile");
    console.error(err);

    // Handle specific database errors
    let errorCode = "INTERNAL_ERROR";
    let errorMessage =
      "An internal error occurred while creating the buyer profile";

    if (err instanceof Error) {
      if (err.message.includes("Unique constraint")) {
        errorCode = "PROFILE_EXISTS";
        errorMessage = "Buyer profile already exists for this user";
      } else if (err.message.includes("Foreign key constraint")) {
        if (err.message.includes("reseller_tax_id")) {
          errorCode = "INVALID_RESELLER_TAX_ID";
          errorMessage = "Invalid reseller tax ID reference";
        } else {
          errorCode = "INVALID_REFERENCE";
          errorMessage = "Invalid reference to related data";
        }
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
