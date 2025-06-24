import { env } from "$amplify/env/create-auction-listing-from-file";
import type { Schema } from "../../data/resource";
import { importModuleFromLayer } from "../commons/importLayer";
import {
  executeS3Import,
  S3ImportConfig,
} from "../commons/operations/listings/ListingOperations";

type DatabaseConnectionDetails = {
  databaseName: string;
  hostname: string;
  port: number;
  username: string;
  password: string;
};

export const handler: Schema["createAuctionListingFromFile"]["functionHandler"] =
  async (event, context) => {
    console.log(`EVENT: ${JSON.stringify(event)}`);
    try {
      const dbConnectionDetails: DatabaseConnectionDetails = JSON.parse(
        env.DB_CONNECTION_DETAILS
      );
      const prismaDataSourceUrl = `postgresql://${dbConnectionDetails.username}:${dbConnectionDetails.password}@${dbConnectionDetails.hostname}:${dbConnectionDetails.port}/${dbConnectionDetails.databaseName}?schema=public`;

      const prismaClient = (await importModuleFromLayer())?.prismaClient(
        prismaDataSourceUrl
      )!;

      const {
        listingDetailsFilePath,
        manifestFilePath,
        sellerId,
        sellerProfileId,
        cognitoId,
      } = event.arguments;

      let finalSellerId = sellerId;
      let finalSellerProfileId = sellerProfileId;

      if (
        (!sellerId || sellerId.trim() === "") &&
        (!sellerProfileId || sellerProfileId.trim() === "")
      ) {
        if (cognitoId) {
          const user = await prismaClient.users.findUnique({
            where: {
              cognito_id: cognitoId,
            },
            select: {
              user_id: true,
            },
          });

          if (user) {
            const sellerProfile = await prismaClient.seller_profiles.findUnique(
              {
                where: {
                  user_id: user?.user_id,
                },
                select: {
                  seller_profile_id: true,
                },
              }
            );

            finalSellerId = user?.user_id;
            finalSellerProfileId = sellerProfile?.seller_profile_id;
          } else {
            throw new Error(`User not found for cognitoId: ${cognitoId}`);
          }
        } else {
          throw new Error(
            "sellerId, sellerProfileId, and cognitoId are all missing or empty"
          );
        }
      }

      const auctionListingS3Path =
        "s3://" +
        env.COMMERCE_CENTRAL_STORAGE_BUCKET_NAME +
        "/" +
        listingDetailsFilePath;
      const manifestS3Path =
        "s3://" +
        env.COMMERCE_CENTRAL_STORAGE_BUCKET_NAME +
        "/" +
        manifestFilePath;
      const config: S3ImportConfig = {
        sellerUserId: finalSellerId!,
        sellerProfileId: finalSellerProfileId!,
        auctionListingS3Path: auctionListingS3Path!,
        manifestS3Path: manifestS3Path!,
        s3Config: {
          region: "us-east-1",
        },
      };

      await executeS3Import(config, prismaClient);
      console.log("S3 import completed successfully!");
      return "SUCCESS";
    } catch (err) {
      console.error("Error occurred while handling event");
      console.error(err);
      throw err;
    }
  };
