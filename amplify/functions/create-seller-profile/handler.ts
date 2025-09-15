import { env } from "$amplify/env/create-seller-profile";
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

export const handler: Schema["createSellerProfile"]["functionHandler"] = async (
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
    // createSellerProfile has no arguments in the schema, so we just need the cognitoId
    const {} = event.arguments;

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

    // Initialize user operations
    const userOps = new UserOperations(prismaClient);

    // Create seller profile
    const result = await userOps.createSellerProfile({
      userId: user.user_id,
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
        seller_profile: result.data!.seller_profile,
      },
      message: "Seller profile created successfully",
    });
  } catch (err) {
    console.error("Error occurred while creating seller profile");
    console.error(err);

    // Handle specific database errors
    let errorCode = "INTERNAL_ERROR";
    let errorMessage =
      "An internal error occurred while creating the seller profile";

    if (err instanceof Error) {
      if (err.message.includes("Unique constraint")) {
        errorCode = "PROFILE_EXISTS";
        errorMessage = "Seller profile already exists for this user";
      } else if (err.message.includes("Foreign key constraint")) {
        errorCode = "INVALID_REFERENCE";
        errorMessage = "Invalid reference to related data";
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
