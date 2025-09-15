import { env } from "$amplify/env/create-auction-listing-from-file";
import { AppSyncIdentityCognito } from "aws-lambda";

import type { Schema } from "../../data/resource";
import { importModuleFromLayer } from "../commons/importLayer";
import {
  executeS3Import,
  S3AuctionImportConfig,
  TransactionRollbackError,
} from "../commons/operations/listings/ListingOperations";
import { VisibilityRules } from "../commons/types/ListingTypes";
import { bid_increment_type } from "../lambda-layers/core-layer/nodejs/prisma/generated/client";

type DatabaseConnectionDetails = {
  databaseName: string;
  hostname: string;
  port: number;
  username: string;
  password: string;
};

interface ValidationError {
  field: string;
  message: string;
}

interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: ValidationError[] | any;
  };
}

interface SuccessResponse {
  success: true;
  data: {
    import: {
      totalListings: number;
      processedListings: number;
      failedListings: number;
      totalProcessingTime: number;
      averageTimePerListing: number;
      throughput: number;
      manifestItemsProcessed: number;
    };
    performance: {
      mode: string;
      totalDurationMs: number;
      totalDurationSeconds: number;
    };
    configuration: {
      isPrivate: boolean;
      auctionEndTime: string;
      minimumBid: number;
    };
  };
  message: string;
}

export const handler: Schema["createAuctionListingFromFile"]["functionHandler"] =
  async (event, context) => {
    console.log(`EVENT: ${JSON.stringify(event)}`);
    const cognitoId = (event.identity as AppSyncIdentityCognito).sub;

    let prismaClient: any = null;
    const startTime = Date.now();

    try {
      // ========== VALIDATION PHASE ==========

      // Validate required environment variables
      if (!env.DB_CONNECTION_DETAILS) {
        return JSON.stringify({
          success: false,
          error: {
            code: "CONFIGURATION_ERROR",
            message: "Database connection details not configured",
          },
        } as ErrorResponse);
      }

      if (!env.COMMERCE_CENTRAL_STORAGE_BUCKET_NAME) {
        return JSON.stringify({
          success: false,
          error: {
            code: "CONFIGURATION_ERROR",
            message: "Storage bucket not configured",
          },
        } as ErrorResponse);
      }

      if (!env.COMMERCE_CENTRAL_IMAGES_BUCKET_NAME) {
        return JSON.stringify({
          success: false,
          error: {
            code: "CONFIGURATION_ERROR",
            message: "Images bucket not configured",
          },
        } as ErrorResponse);
      }
      const dbConnectionDetails: DatabaseConnectionDetails = JSON.parse(
        env.DB_CONNECTION_DETAILS
      );
      const prismaDataSourceUrl = `postgresql://${dbConnectionDetails.username}:${dbConnectionDetails.password}@${dbConnectionDetails.hostname}:${dbConnectionDetails.port}/${dbConnectionDetails.databaseName}?schema=public`;

      const prismaClient = (await importModuleFromLayer())?.prismaClient(
        prismaDataSourceUrl
      )!;

      const {
        auctionListingFileKey,
        auctionManifestFileKey,
        // sellerId,
        // sellerProfileId,
        // cognitoId,
        isPrivate,
        visibilityRules,
        minimumBid,
        bidIncrementValue,
        bidIncrementType,
        auctionEndTimestamp,
      } = event.arguments;

      let sellerId: string;
      let sellerProfileId: string;
      let sellerPublicId: string;

      try {
        const user = await prismaClient.users.findUnique({
          relationLoadStrategy: "join",
          where: { cognito_id: cognitoId },
          select: {
            user_id: true,
            public_id: true,
            user_type: true,
            seller_profiles: {
              select: {
                seller_profile_id: true,
              },
            },
          },
        });

        if (!user) {
          return JSON.stringify({
            success: false,
            error: {
              code: "USER_NOT_FOUND",
              message: `User not found for Cognito ID: ${cognitoId}`,
            },
          } as ErrorResponse);
        }

        // Validate user type
        if (!["SELLER", "BUYER_AND_SELLER"].includes(user.user_type)) {
          return JSON.stringify({
            success: false,
            error: {
              code: "INSUFFICIENT_PERMISSIONS",
              message: "User must be a seller to create catalog listings",
              details: { userType: user.user_type },
            },
          } as ErrorResponse);
        }

        if (!user.seller_profiles) {
          return JSON.stringify({
            success: false,
            error: {
              code: "SELLER_PROFILE_NOT_FOUND",
              message:
                "Seller profile not found. Please complete seller onboarding first.",
            },
          } as ErrorResponse);
        }

        sellerId = user.user_id;
        sellerProfileId = user.seller_profiles.seller_profile_id;
        sellerPublicId = user.public_id;
      } catch (userError) {
        return JSON.stringify({
          success: false,
          error: {
            code: "USER_VALIDATION_ERROR",
            message: "Failed to validate user",
            details: {
              userError:
                userError instanceof Error
                  ? userError.message
                  : String(userError),
            },
          },
        } as ErrorResponse);
      }

      let convertedAuctionEndTime: Date | null = null;
      if (auctionEndTimestamp) {
        try {
          // Check if timestamp is in seconds (typical for Unix timestamps)
          // Timestamps in seconds are typically 10 digits, milliseconds are 13 digits
          const timestamp =
            auctionEndTimestamp.toString().length <= 10
              ? auctionEndTimestamp * 1000 // Convert seconds to milliseconds
              : auctionEndTimestamp; // Already in milliseconds

          convertedAuctionEndTime = new Date(timestamp);

          if (isNaN(convertedAuctionEndTime.getTime())) {
            throw new Error("Invalid timestamp provided for auctionEndTime");
          }

          // Validate auction end time is in the future
          const now = new Date();
          if (convertedAuctionEndTime <= now) {
            throw new Error("Auction end time must be in the future");
          }
        } catch (error: any) {
          console.error("Error converting auctionEndTime:", error);
          throw new Error(`Invalid auctionEndTime: ${error.message}`);
        }
      }

      const auctionListingS3Path =
        "s3://" +
        env.COMMERCE_CENTRAL_STORAGE_BUCKET_NAME +
        "/" +
        auctionListingFileKey;
      const manifestS3Path =
        "s3://" +
        env.COMMERCE_CENTRAL_STORAGE_BUCKET_NAME +
        "/" +
        auctionManifestFileKey;

      const config: S3AuctionImportConfig = {
        sellerUserId: sellerId!,
        sellerProfileId: sellerProfileId!,
        sellerPublicUserId: sellerPublicId!,
        bucketName: env.COMMERCE_CENTRAL_STORAGE_BUCKET_NAME,
        imageBucketName: env.COMMERCE_CENTRAL_IMAGES_BUCKET_NAME,
        auctionListingS3Path: auctionListingS3Path!,
        manifestS3Path: manifestS3Path!,
        isPrivate: isPrivate || false,
        visibilityRules: visibilityRules as VisibilityRules,
        defaultMinimumBid: minimumBid,
        defaultBidIncrementValue: bidIncrementValue,
        defaultBidIncrementType: bidIncrementType as bid_increment_type,
        defaultAuctionEndTime: convertedAuctionEndTime!,
        s3Config: {
          region: "us-east-1",
        },
        // EventBridge scheduling configuration from environment variables
        enableEventBridgeScheduling: true, // Enable scheduling by default
        completeAuctionFunctionArn: env.COMPLETE_AUCTION_FUNCTION_ARN,
        eventBridgeSchedulerRoleArn: env.EVENTBRIDGE_SCHEDULER_ROLE_ARN,
        eventBridgeSchedulerGroupName: env.SCHEDULE_GROUP_NAME,
        auctionDLQArn: env.AUCTION_DLQ_ARN, // Optional DLQ
      };

      // ========== EXECUTE IMPORT ==========

      console.log(`INITIATING AUCTION IMPORT`);
      console.log(`Configuration Summary:`);
      console.log(`   • Seller: ${config.sellerUserId}`);
      console.log(`   • Listing File: ${auctionListingFileKey}`);
      console.log(`   • Manifest File: ${auctionManifestFileKey}`);
      console.log(`   • Private: ${config.isPrivate}`);
      console.log(`   • Minimum Bid: ${minimumBid}`);

      try {
        await executeS3Import(config, prismaClient);
        console.log("S3 import completed successfully!");

        // ========== SUCCESS RESPONSE ==========

        const totalDuration = Date.now() - startTime;
        const durationSeconds = totalDuration / 1000;

        console.log(`AUCTION IMPORT COMPLETED SUCCESSFULLY!`);
        console.log(
          `Total Processing Time: ${durationSeconds.toFixed(2)} seconds`
        );

        return JSON.stringify({
          success: true,
          data: {
            import: {
              totalListings: 1,
              processedListings: 1,
              failedListings: 0,
              totalProcessingTime: totalDuration,
              averageTimePerListing: totalDuration,
              throughput: 1 / durationSeconds,
              manifestItemsProcessed: 1,
            },
            performance: {
              mode: "STANDARD_IMPORT",
              totalDurationMs: totalDuration,
              totalDurationSeconds: parseFloat(durationSeconds.toFixed(2)),
            },
            configuration: {
              isPrivate: config.isPrivate!,
              auctionEndTime: convertedAuctionEndTime?.toISOString() || "",
              minimumBid: minimumBid || 0,
            },
          },
          message: `Auction import completed successfully in ${durationSeconds.toFixed(2)} seconds`,
        } as SuccessResponse);
      } catch (importError) {
        console.error(`IMPORT FAILED:`, importError);

        // Handle TransactionRollbackError specifically
        if (importError instanceof TransactionRollbackError) {
          const rollbackDetails = importError.rollbackDetails;
          const contextDetails = importError.toJSON();

          return JSON.stringify({
            success: false,
            error: {
              code: "TRANSACTION_ROLLBACK_ERROR",
              message: "Auction import failed and was rolled back completely",
              details: {
                originalError: importError.originalError.message,
                rollbackStatus: {
                  databaseRolledBack: rollbackDetails.databaseRolledBack,
                  s3ObjectsDeleted: rollbackDetails.s3ObjectsDeleted,
                  s3CleanupFailed: rollbackDetails.s3CleanupFailed,
                  rollbackDurationMs: rollbackDetails.rollbackDurationMs,
                },
                transactionContext: contextDetails.context,
                duration: `${((Date.now() - startTime) / 1000).toFixed(2)} seconds`,
                configuration: {
                  auctionListingFile: auctionListingFileKey,
                  auctionManifestFile: auctionManifestFileKey,
                  isPrivate: config.isPrivate,
                },
                troubleshooting: {
                  rollbackSuccessful:
                    rollbackDetails.databaseRolledBack &&
                    !rollbackDetails.s3CleanupFailed,
                  orphanedS3Objects: rollbackDetails.s3CleanupFailed
                    ? rollbackDetails.s3ObjectsDeleted
                    : 0,
                  dataConsistency: rollbackDetails.databaseRolledBack
                    ? "MAINTAINED"
                    : "COMPROMISED",
                },
              },
            },
          } as ErrorResponse);
        }

        // Handle other specific import errors
        let errorCode = "IMPORT_ERROR";
        let errorMessage = "Auction import failed";

        if (importError instanceof Error) {
          if (
            importError.message.includes("Failed to download") ||
            importError.message.includes("Image validation failed")
          ) {
            errorCode = "IMAGE_DOWNLOAD_ERROR";
            errorMessage =
              "Failed to download or validate one or more images from the provided URLs";
          } else if (importError.message.includes("Missing required")) {
            errorCode = "DATA_VALIDATION_ERROR";
            errorMessage = "Missing required fields in Excel files";
          } else if (importError.message.includes("Invalid S3 URL")) {
            errorCode = "FILE_ACCESS_ERROR";
            errorMessage = "Cannot access the specified Excel files";
          } else if (importError.message.includes("Database")) {
            errorCode = "DATABASE_ERROR";
            errorMessage = "Database operation failed during import";
          } else if (
            importError.message.includes("Pre-transaction validation")
          ) {
            errorCode = "PRE_VALIDATION_ERROR";
            errorMessage = "Data validation failed before starting transaction";
          }
        }

        return JSON.stringify({
          success: false,
          error: {
            code: errorCode,
            message: errorMessage,
            details: {
              error:
                importError instanceof Error
                  ? importError.message
                  : String(importError),
              duration: `${((Date.now() - startTime) / 1000).toFixed(2)} seconds`,
              configuration: {
                auctionListingFile: auctionListingFileKey,
                auctionManifestFile: auctionManifestFileKey,
                isPrivate: config.isPrivate,
              },
            },
          },
        } as ErrorResponse);
      }
    } catch (err: any) {
      const totalDuration = Date.now() - startTime;
      const durationSeconds = (totalDuration / 1000).toFixed(2);

      console.error(`HANDLER ERROR after ${durationSeconds} seconds:`, err);

      // Handle TransactionRollbackError at the top level as well
      if (err instanceof TransactionRollbackError) {
        const rollbackDetails = err.rollbackDetails;
        const contextDetails = err.toJSON();

        return JSON.stringify({
          success: false,
          error: {
            code: "TRANSACTION_ROLLBACK_ERROR",
            message: "Auction import failed and was rolled back completely",
            details: {
              originalError: err.originalError.message,
              rollbackStatus: {
                databaseRolledBack: rollbackDetails.databaseRolledBack,
                s3ObjectsDeleted: rollbackDetails.s3ObjectsDeleted,
                s3CleanupFailed: rollbackDetails.s3CleanupFailed,
                rollbackDurationMs: rollbackDetails.rollbackDurationMs,
              },
              transactionContext: contextDetails.context,
              duration: `${durationSeconds} seconds`,
              timestamp: new Date().toISOString(),
              cognitoId,
              eventArguments: event.arguments,
              troubleshooting: {
                rollbackSuccessful:
                  rollbackDetails.databaseRolledBack &&
                  !rollbackDetails.s3CleanupFailed,
                orphanedS3Objects: rollbackDetails.s3CleanupFailed
                  ? rollbackDetails.s3ObjectsDeleted
                  : 0,
                dataConsistency: rollbackDetails.databaseRolledBack
                  ? "MAINTAINED"
                  : "COMPROMISED",
                recommendedActions: [
                  "Review the original error to understand the root cause",
                  "Check image URLs for accessibility",
                  "Validate Excel file format and required columns",
                  "Ensure sufficient AWS permissions for S3 and database operations",
                  rollbackDetails.s3CleanupFailed
                    ? "Manual S3 cleanup may be required"
                    : "No manual cleanup needed",
                ],
              },
            },
          },
        } as ErrorResponse);
      }

      // Handle specific error types
      let errorCode = "INTERNAL_ERROR";
      let errorMessage = "An internal error occurred during auction import";

      if (err instanceof Error) {
        if (err.message.includes("timeout")) {
          errorCode = "TIMEOUT_ERROR";
          errorMessage = "Import operation timed out";
        } else if (err.message.includes("memory")) {
          errorCode = "MEMORY_ERROR";
          errorMessage = "Insufficient memory for import operation";
        } else if (err.message.includes("network")) {
          errorCode = "NETWORK_ERROR";
          errorMessage = "Network error during import operation";
        } else if (err.message.includes("permission")) {
          errorCode = "PERMISSION_ERROR";
          errorMessage =
            "Insufficient permissions to access required resources";
        }
      }

      return JSON.stringify({
        success: false,
        error: {
          code: errorCode,
          message: errorMessage,
          details: {
            error: err instanceof Error ? err.message : String(err),
            stack: err instanceof Error ? err.stack : undefined,
            duration: `${durationSeconds} seconds`,
            timestamp: new Date().toISOString(),
            cognitoId,
            eventArguments: event.arguments,
            troubleshooting: {
              commonCauses: [
                "Invalid image URLs that cannot be downloaded",
                "Missing required fields in Excel files",
                "Database constraint violations",
                "S3 access permissions issues",
                "Memory/timeout limits exceeded",
                "Network connectivity issues",
              ],
              recommendations: [
                "Check that all image URLs are accessible",
                "Validate Excel file format and required columns",
                "Ensure seller profile exists and is valid",
                "Verify S3 bucket permissions",
                "Consider reducing file sizes for large imports",
                "Check network connectivity",
              ],
            },
          },
        },
      } as ErrorResponse);
    } finally {
      // Ensure Prisma client is properly disconnected
      if (prismaClient) {
        try {
          await prismaClient.$disconnect();
          console.log("Database connection closed successfully");
        } catch (disconnectError) {
          console.error("Error disconnecting from database:", disconnectError);
        }
      }

      const finalDuration = Date.now() - startTime;
      console.log(
        `Handler execution completed in ${(finalDuration / 1000).toFixed(2)}s`
      );
    }
  };
