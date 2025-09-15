import { Readable } from "stream";

import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";

import { env } from "$amplify/env/create-catalog-offer-from-file";
import { AppSyncIdentityCognito } from "aws-lambda";

import type { Schema } from "../../data/resource";
import { importModuleFromLayer } from "../commons/importLayer";
import { CatalogOfferDatabaseOperations } from "../commons/operations/catalogs/CatalogOfferDatabaseOperation";
import { CatalogOfferOperations } from "../commons/operations/catalogs/CatalogOfferOperations";
import { UserDatabaseOperations } from "../commons/operations/users/UserDatabaseOperations";
import { CatalogOfferExcelFileValidator } from "../commons/utilities/CatalogOfferExcelFileValidator";
import { notificationService } from "../commons/utilities/UnifiedNotificationService";

type DatabaseConnectionDetails = {
  databaseName: string;
  hostname: string;
  port: number;
  username: string;
  password: string;
};

interface S3Config {
  region: string;
}

// S3 File Handler for downloading files
class S3FileHandler {
  private s3Client: S3Client;

  constructor(config: S3Config) {
    this.s3Client = new S3Client({
      region: config.region,
    });
  }

  /**
   * Parse S3 URL to extract bucket and key
   */
  private parseS3Url(s3Url: string): { bucket: string; key: string } {
    const url = s3Url.replace("s3://", "");
    const [bucket, ...keyParts] = url.split("/");
    const key = keyParts.join("/");

    if (!bucket || !key) {
      throw new Error(
        `Invalid S3 URL format: ${s3Url}. Expected format: s3://bucket-name/path/to/file`
      );
    }

    return { bucket, key };
  }

  /**
   * Download file from S3 and return as Buffer
   */
  async downloadFile(s3Url: string): Promise<Buffer> {
    try {
      const { bucket, key } = this.parseS3Url(s3Url);

      console.log(`Downloading from S3: ${bucket}/${key}`);

      const command = new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      });

      const response = await this.s3Client.send(command);

      if (!response.Body) {
        throw new Error(`No data received from S3 for ${s3Url}`);
      }

      // Convert stream to buffer
      const chunks: Uint8Array[] = [];
      const stream = response.Body as Readable;

      return new Promise((resolve, reject) => {
        stream.on("data", (chunk) => chunks.push(chunk));
        stream.on("error", reject);
        stream.on("end", () => {
          const buffer = Buffer.concat(chunks);
          console.log(
            `Successfully downloaded ${buffer.length} bytes from ${s3Url}`
          );
          resolve(buffer);
        });
      });
    } catch (error) {
      console.error(`Failed to download file from S3: ${s3Url}`, error);
      throw error;
    }
  }
}

export const handler: Schema["createCatalogOfferFromFile"]["functionHandler"] =
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
      const { offerListingPublicId, offerFileS3Key } = event.arguments;

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

      if (!offerListingPublicId || offerListingPublicId.trim() === "") {
        return JSON.stringify({
          success: false,
          error: {
            code: "OFFER_LISTING_PUBLIC_ID_REQUIRED",
            message: "Offer listing public ID is required",
          },
        });
      }

      if (!offerFileS3Key || offerFileS3Key.trim() === "") {
        return JSON.stringify({
          success: false,
          error: {
            code: "OFFER_FILE_S3_KEY_REQUIRED",
            message: "Offer file S3 key is required",
          },
        });
      }

      // Initialize operations
      const userDbOps = new UserDatabaseOperations(prismaClient);
      const catalogOfferDbOps = new CatalogOfferDatabaseOperations(
        prismaClient
      );
      const catalogOfferOps = new CatalogOfferOperations(prismaClient);

      // Get user by Cognito ID
      const user =
        await userDbOps.getUserWithBuyerProfileByCognitoId(cognitoId);
      if (!user) {
        return JSON.stringify({
          success: false,
          error: {
            code: "USER_NOT_FOUND",
            message: "User not found for the authenticated session",
          },
        });
      }

      // Validate user type - buyer operations require buyer profile
      if (!user.buyer_profiles) {
        return JSON.stringify({
          success: false,
          error: {
            code: "BUYER_PROFILE_NOT_FOUND",
            message:
              "Buyer profile not found. Please create a buyer profile first.",
            details: {
              user_id: user.public_id,
              user_type: user.user_type,
            },
          },
        });
      }

      console.log(JSON.stringify(user));

      // Check buyer profile verification status
      if (user.buyer_profiles.verification_status !== "VERIFIED") {
        return JSON.stringify({
          success: false,
          error: {
            code: "BUYER_NOT_VERIFIED",
            message:
              "Account verification required to make offers on catalog listings",
            details: {
              verification_status: user.buyer_profiles.verification_status,
            },
          },
        });
      }

      // Check if user account is locked or has high risk score
      if (user.account_locked) {
        return JSON.stringify({
          success: false,
          error: {
            code: "ACCOUNT_LOCKED",
            message: "Your account is locked and cannot create offers",
          },
        });
      }

      if (user.risk_score && Number(user.risk_score) > 80) {
        return JSON.stringify({
          success: false,
          error: {
            code: "HIGH_RISK_ACCOUNT",
            message:
              "Account has high risk score and cannot create offers at this time",
            details: {
              risk_score: Number(user.risk_score),
            },
          },
        });
      }

      // Validate catalog listing
      const catalogListingValidation =
        await catalogOfferDbOps.validateCatalogListingForUpload(
          offerListingPublicId,
          user.user_id
        );

      if (!catalogListingValidation.success) {
        return JSON.stringify({
          success: false,
          error: catalogListingValidation.error,
        });
      }

      // Check for existing active offers
      const existingOfferCheck = await catalogOfferDbOps.checkExistingOffers(
        offerListingPublicId,
        user.user_id
      );

      if (!existingOfferCheck.success) {
        return JSON.stringify({
          success: false,
          error: existingOfferCheck.error,
        });
      }

      if (existingOfferCheck.hasExistingOffer) {
        return JSON.stringify({
          success: false,
          error: {
            code: "EXISTING_ACTIVE_OFFER",
            message: "You already have an active offer on this catalog listing",
            details: {
              existing_offer_id: existingOfferCheck.existingOffer!.public_id,
              existing_offer_status:
                existingOfferCheck.existingOffer!.offer_status,
              created_at: existingOfferCheck.existingOffer!.created_at,
              suggested_actions: [
                "Cancel or withdraw your existing offer first",
                "Wait for seller response to your current offer",
                "Modify your existing offer instead of creating a new one",
              ],
            },
          },
        });
      }

      // Check visibility rules for private listings
      if (catalogListingValidation.catalogListing!.is_private) {
        // TODO
        // Note: You would implement visibility checking logic here
        // For now, we'll assume the buyer has access
        console.log("Private listing access check would be implemented here");
      }

      // Declare variables outside the try block to fix scoping issue
      let fileBuffer: Buffer;
      let fileName: string = "unknown"; // Initialize with default value
      let fileSize: number = 0; // Initialize with default value

      try {
        // Extract filename from S3 key
        fileName = offerFileS3Key.split("/").pop() || "unknown.xlsx";

        // Initialize S3 file handler
        const s3FileHandler = new S3FileHandler({
          region: process.env.AWS_REGION || "us-east-1",
        });

        // Download file from S3
        const bucketName = env.COMMERCE_CENTRAL_STORAGE_BUCKET_NAME;
        const s3Url = `s3://${bucketName}/${offerFileS3Key}`;

        console.log(`Downloading file from S3: ${s3Url}`);
        fileBuffer = await s3FileHandler.downloadFile(s3Url);
        fileSize = fileBuffer.length;

        // Validate file size (max 10MB)
        if (fileSize > 10 * 1024 * 1024) {
          throw new Error("File size exceeds maximum limit of 10MB");
        }

        // Validate file extension
        if (
          !fileName.toLowerCase().endsWith(".xlsx") &&
          !fileName.toLowerCase().endsWith(".xls")
        ) {
          throw new Error("Only Excel files (.xlsx, .xls) are supported");
        }

        console.log(`Successfully downloaded ${fileSize} bytes from S3`);

        // Test Excel parsing to validate structure
        const testResult =
          CatalogOfferExcelFileValidator.testExcelParsing(fileBuffer);
        console.log(
          "Excel parsing test result:",
          CatalogOfferExcelFileValidator.generateSummaryReport(testResult)
        );

        if (!testResult.success) {
          throw new Error(
            `Excel file validation failed: ${testResult.errors.join(", ")}`
          );
        }

        if (
          testResult.extractedItems.filter((item) => item.hasValidOffer)
            .length === 0
        ) {
          throw new Error(
            "No valid offer items found in the Excel file. Please ensure 'Selected Qty' and 'Price/Unit' columns have valid data."
          );
        }
      } catch (error) {
        // Record failed upload attempt - now fileName and fileSize are always defined
        await catalogOfferDbOps.recordFileUploadAttempt(
          offerListingPublicId,
          user.user_id,
          fileName,
          fileSize,
          false,
          { error: error instanceof Error ? error.message : String(error) }
        );

        return JSON.stringify({
          success: false,
          error: {
            code: "FILE_READ_ERROR",
            message: "Failed to read the uploaded file",
            details: {
              s3_key: offerFileS3Key,
              error: error instanceof Error ? error.message : String(error),
            },
          },
        });
      }

      // Record successful file read
      await catalogOfferDbOps.recordFileUploadAttempt(
        offerListingPublicId,
        user.user_id,
        fileName,
        fileSize,
        true
      );

      // Create catalog offer from file
      const result = await catalogOfferOps.createCatalogOfferFromFile({
        catalogListingPublicId: offerListingPublicId,
        buyerUserId: user.user_id,
        buyerProfileId: user.buyer_profiles.buyer_profile_id,
        fileBuffer: fileBuffer!,
        fileName: fileName,
        expiresAt: undefined, // Could be made configurable
        offerMessage: `Offer created from uploaded file: ${fileName}`,
      });

      if (!result.success) {
        return JSON.stringify({
          success: false,
          error: result.error,
        });
      }

      // Send notifications to buyer and seller
      try {
        // Get seller information from catalog listing
        const catalogListingWithSeller =
          await prismaClient.catalog_listings.findUnique({
            where: { public_id: offerListingPublicId },
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

        if (catalogListingWithSeller && result.data) {
          const sellerInfo = {
            userId: catalogListingWithSeller.seller_user_id,
            email: catalogListingWithSeller.users.email,
            name:
              `${catalogListingWithSeller.users.first_name || ""} ${catalogListingWithSeller.users.last_name || ""}`.trim() ||
              "Seller",
          };

          // User information is already available
          const buyerInfo = {
            userId: user.user_id,
            email: user.email,
            name:
              `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
              "Buyer",
          };

          // Calculate total offer amount from result data
          const totalOfferAmount = result.data.total_offer_value || 0;

          // Send notification to seller
          await notificationService.sendCatalogOfferSellerNotification(
            {
              offerId: result.catalogOfferId || "",
              catalogId: offerListingPublicId,
              catalogTitle: catalogListingWithSeller.title,
              sellerId: sellerInfo.userId,
              buyerId: buyerInfo.userId,
              buyerEmail: buyerInfo.email,
              buyerName: buyerInfo.name,
              offerAmount: totalOfferAmount,
              currency: result.data.total_offer_value_currency || "USD",
              itemCount: result.data.items?.length || 0,
              sellerInfo: sellerInfo,
            },
            ["EMAIL", "WEB", "PUSH"]
          );

          // Send confirmation notification to buyer
          await notificationService.sendCatalogOfferBuyerNotification(
            {
              offerId: result.catalogOfferId || "",
              catalogId: offerListingPublicId,
              catalogTitle: catalogListingWithSeller.title,
              buyerId: buyerInfo.userId,
              buyerEmail: buyerInfo.email,
              buyerName: buyerInfo.name,
              offerAmount: totalOfferAmount,
              currency: result.data.total_offer_value_currency || "USD",
              itemCount: result.data.items?.length || 0,
              sellerInfo: sellerInfo,
            },
            ["EMAIL", "WEB"]
          );
        }
      } catch (notificationError) {
        // Log notification errors but don't fail the offer creation
        console.error(
          "Failed to send catalog offer notifications:",
          notificationError
        );
      }

      // Return success response
      return JSON.stringify({
        success: true,
        data: result.data,
        catalog_offer_id: result.catalogOfferId,
        message: "Catalog offer successfully created from uploaded file",
      });
    } catch (err) {
      console.error("Error occurred in createCatalogOfferFromFile handler:");
      console.error(err);

      // Handle specific database errors
      let errorCode = "INTERNAL_ERROR";
      let errorMessage =
        "An internal error occurred while processing the catalog offer creation";

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
        } else if (err.message.includes("S3") || err.message.includes("file")) {
          errorCode = "FILE_PROCESSING_ERROR";
          errorMessage = "Failed to process the uploaded file";
        } else if (
          err.message.includes("Excel") ||
          err.message.includes("XLSX")
        ) {
          errorCode = "FILE_FORMAT_ERROR";
          errorMessage = "Invalid Excel file format or structure";
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
