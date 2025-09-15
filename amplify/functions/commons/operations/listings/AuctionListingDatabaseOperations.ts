import { v4 as uuidv4 } from "uuid";
import * as XLSX from "xlsx";

import {
  bid_increment_type,
  Prisma,
  PrismaClient,
} from "../../../lambda-layers/core-layer/nodejs/prisma/generated/client";
import {
  fileToDbCategoryBiMap,
  fileToDbConditionBiMap,
  fileToDbFreightBiMap,
  fileToDbLengthUnitTypeBiMap,
  fileToDbLotConditionBiMap,
  fileToDbLotPackagingBiMap,
  fileToDbShippingBiMap,
  fileToDbSubcategoryBiMap,
  fileToDbWeightUnitTypeBiMap,
} from "../../converters/ListingTypeConverter";
import {
  AuctionListingData,
  ManifestData,
} from "../../types/AuctionListingFileTypes";
import { setupAuctionCompletionSchedule } from "../../utilities/AuctionEventBridgeHelper";
import { ExcelCurrencyExtractor } from "../../utilities/ExcelCurrencyExtractor";
import {
  ImageProcessor,
  S3AuctionImportConfig,
  S3DataTransformer,
} from "./ListingOperations";

// Helper function to get or create brand
export async function getOrCreateBrand(
  brandName: string,
  prismaClient: PrismaClient
): Promise<string> {
  const existing = await prismaClient.brands.findFirst({
    where: { brand_name: brandName },
  });

  if (existing) {
    return existing.brand_id;
  }

  const newBrand = await prismaClient.brands.create({
    data: {
      brand_id: uuidv4(),
      brand_name: brandName,
      created_at: new Date(),
    },
  });

  return newBrand.brand_id;
}

export async function createWarehouseAddress(
  auctionItem: AuctionListingData,
  prisma: PrismaClient
): Promise<string | null> {
  const address1 = S3DataTransformer.sanitizeString(
    auctionItem.WAREHOUSE_LOCATION_ADDRESS1
  );
  const city = S3DataTransformer.sanitizeString(
    auctionItem.WAREHOUSE_LOCATION_CITY
  );

  if (!address1 || !city) {
    return null;
  }

  try {
    const address = await prisma.addresses.create({
      data: {
        address_id: uuidv4(),
        address1: S3DataTransformer.sanitizeString(
          auctionItem.WAREHOUSE_LOCATION_ADDRESS1
        )!,
        address2: S3DataTransformer.sanitizeString(
          auctionItem.WAREHOUSE_LOCATION_ADDRESS2
        ),
        address3: S3DataTransformer.sanitizeString(
          auctionItem.WAREHOUSE_LOCATION_ADDRESS3
        ),
        city: S3DataTransformer.sanitizeString(
          auctionItem.WAREHOUSE_LOCATION_CITY
        )!,
        province: S3DataTransformer.sanitizeString(
          auctionItem.WAREHOUSE_LOCATION_STATE
        )!,
        province_code: S3DataTransformer.sanitizeString(
          auctionItem.WAREHOUSE_LOCATION_STATE_CODE
        ),
        country: S3DataTransformer.sanitizeString(
          auctionItem.WAREHOUSE_LOCATION_COUNTRY
        )!,
        country_code: S3DataTransformer.sanitizeString(
          auctionItem.WAREHOUSE_LOCATION_COUNTRY_CODE
        ),
        zip: S3DataTransformer.sanitizeString(
          auctionItem.WAREHOUSE_LOCATION_ZIPCODE
        )!,
        created_at: new Date(),
      },
    });

    console.log(`Created address: ${address.address_id}`);
    return address.address_id;
  } catch (error) {
    console.error("Failed to create address", error);
    return null;
  }
}

export function buildAddressTitle(auctionItem: AuctionListingData): string {
  const parts = [
    S3DataTransformer.sanitizeString(auctionItem.WAREHOUSE_LOCATION_ADDRESS1),
    S3DataTransformer.sanitizeString(auctionItem.WAREHOUSE_LOCATION_ADDRESS2),
    S3DataTransformer.sanitizeString(auctionItem.WAREHOUSE_LOCATION_ADDRESS3),
  ].filter(Boolean);

  return parts.join(", ");
}

export async function createAuctionImages(
  auctionItem: AuctionListingData,
  prisma: PrismaClient,
  imageProcessor: ImageProcessor
): Promise<string[]> {
  const imageUrls = [
    auctionItem.IMAGE1,
    auctionItem.IMAGE2,
    auctionItem.IMAGE3,
    auctionItem.IMAGE4,
    auctionItem.IMAGE5,
    auctionItem.IMAGE6,
  ].filter((url) => S3DataTransformer.sanitizeString(url)) as string[];

  if (imageUrls.length === 0) {
    return [];
  }

  console.log(`Processing ${imageUrls.length} auction listing images`);

  const { imageIds } = await imageProcessor.processImagesAndSaveToDb(
    imageUrls,
    prisma,
    "Auction"
  );

  console.log(
    `Successfully processed ${imageIds.length} auction listing images`
  );
  return imageIds;
}

const mapCategory = (category: string | undefined) =>
  category ? fileToDbCategoryBiMap.getValue(category) : undefined;

const mapSubcategory = (subcategory: string | undefined) =>
  subcategory ? fileToDbSubcategoryBiMap.getValue(subcategory) : undefined;

export async function createAuctionListing(
  auctionItem: AuctionListingData,
  config: S3AuctionImportConfig,
  locationAddressId: string,
  imageIds: string[],
  worksheet: XLSX.WorkSheet,
  rowIndex: number,
  prisma: PrismaClient
): Promise<any> {
  // Create header map for currency extraction
  const headerMap: Record<string, number> = {};
  const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1");
  for (let col = range.s.c; col <= range.e.c; col++) {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
    const cell = worksheet[cellAddress];
    if (cell && cell.v) {
      headerMap[String(cell.v)] = col;
    }
  }

  const shippingCostCurrency =
    ExcelCurrencyExtractor.parseOptionalNumberWithCurrency(
      auctionItem.SHIPPING_COST
    ) !== undefined
      ? ExcelCurrencyExtractor.extractFieldCurrency(
          worksheet,
          rowIndex,
          "SHIPPING_COST",
          headerMap,
          "USD"
        )
      : undefined;

  const totalExRetailPriceCurrency =
    ExcelCurrencyExtractor.parseOptionalNumberWithCurrency(
      auctionItem.TOTAL_EX_RETAIL_PRICE
    ) !== undefined
      ? ExcelCurrencyExtractor.extractFieldCurrency(
          worksheet,
          rowIndex,
          "TOTAL_EX_RETAIL_PRICE",
          headerMap,
          "USD"
        )
      : undefined;

  const auctionListingData: Prisma.auction_listingsCreateInput = {
    auction_listing_id: uuidv4(),
    seller_profiles: {
      connect: {
        seller_profile_id: config.sellerProfileId,
      },
    },
    users_auction_listings_seller_user_idTousers: {
      connect: {
        user_id: config.sellerUserId,
      },
    },
    title: S3DataTransformer.sanitizeString(auctionItem.TITLE)!,
    short_title: S3DataTransformer.sanitizeString(auctionItem.SHORT_TITLE),
    description: S3DataTransformer.sanitizeString(auctionItem.DESCRIPTION),
    category: fileToDbCategoryBiMap.getValue(auctionItem.CATEGORY1!),
    category2: mapCategory(auctionItem.CATEGORY2),
    category3: mapCategory(auctionItem.CATEGORY3),
    subcategory: fileToDbSubcategoryBiMap.getValue(auctionItem.SUBCATEGORY1!),
    subcategory2: mapSubcategory(auctionItem.SUBCATEGORY2),
    subcategory3: mapSubcategory(auctionItem.SUBCATEGORY3),
    subcategory4: mapSubcategory(auctionItem.SUBCATEGORY4),
    subcategory5: mapSubcategory(auctionItem.SUBCATEGORY5),
    status: "ACTIVE" as const,
    is_private: config.isPrivate || false,
    minimum_bid: S3DataTransformer.parseDecimal(config.defaultMinimumBid),
    minimum_bid_currency:
      S3DataTransformer.parseDecimal(config.defaultMinimumBid) !== undefined
        ? "USD"
        : undefined,
    bid_increment_value: S3DataTransformer.parseDecimal(
      config.defaultBidIncrementValue
    ),
    bid_increment_type: config.defaultBidIncrementType as bid_increment_type,
    bid_increment_value_currency:
      config.defaultBidIncrementType === "FIXED" ? "USD" : undefined,
    auction_end_time: config.defaultAuctionEndTime,
    default_image_url:
      imageIds.length > 0
        ? (
            await prisma.images.findUnique({
              where: { image_id: imageIds[0] },
            })
          )?.image_url
        : null,
    lot_condition: fileToDbLotConditionBiMap.getValue(auctionItem.LOT_TYPE!),
    cosmetic_condition: S3DataTransformer.sanitizeString(
      auctionItem.COSMETIC_CONDITION
    ),
    shipping_cost: ExcelCurrencyExtractor.parseOptionalNumberWithCurrency(
      auctionItem.SHIPPING_COST
    ),
    shipping_cost_currency: shippingCostCurrency,
    total_units: S3DataTransformer.parseNumber(auctionItem.TOTAL_UNITS),
    total_ex_retail_price:
      ExcelCurrencyExtractor.parseOptionalNumberWithCurrency(
        auctionItem.TOTAL_EX_RETAIL_PRICE
      ),
    total_ex_retail_price_currency: totalExRetailPriceCurrency,
    estimated_weight: S3DataTransformer.parseDecimal(
      auctionItem.ESTIMATED_WEIGHT,
      2
    ),
    weight_type: fileToDbWeightUnitTypeBiMap.getValue(auctionItem.WEIGHT_TYPE),
    is_refrigerated: S3DataTransformer.parseBoolean(auctionItem.REFRIGERATED),
    is_fda_registered: S3DataTransformer.parseBoolean(
      auctionItem.FDA_REGISTERED
    ),
    is_hazmat: S3DataTransformer.parseBoolean(auctionItem.HAZMAT),
    addresses: {
      connect: {
        address_id: locationAddressId,
      },
    },
    auction_shipping_type: fileToDbShippingBiMap.getValue(
      auctionItem.SHIPPING_TYPE
    ),
    auction_freight_type: fileToDbFreightBiMap.getValue(
      auctionItem.FREIGHT_TYPE
    ),
    piece_count: S3DataTransformer.parseNumber(auctionItem.PIECE_COUNT),
    lot_packaging: fileToDbLotPackagingBiMap.getValue(
      auctionItem.LOT_PACKAGING
    ),
    number_of_pallets: S3DataTransformer.parseNumber(
      auctionItem.NUMBER_OF_PALLETS
    ),
    pallet_spaces: S3DataTransformer.parseNumber(auctionItem.PALLET_SPACES),
    number_of_truckloads: S3DataTransformer.parseNumber(
      auctionItem.NUMBER_OF_TRUCKLOADS
    ),
    number_of_shipments: S3DataTransformer.parseNumber(
      auctionItem.NUMBER_OF_SHIPMENTS
    ),
    resale_requirement: S3DataTransformer.sanitizeString(
      auctionItem.RESALE_REQUIREMENTS
    ),
    accessories: S3DataTransformer.sanitizeString(auctionItem.ACCESSORIES),
    seller_notes: S3DataTransformer.sanitizeString(auctionItem.SELLER_NOTES),
    shipping_notes: S3DataTransformer.sanitizeString(
      auctionItem.SHIPPING_NOTES
    ),
    additional_information: S3DataTransformer.sanitizeString(
      auctionItem.ADDITIONAL_INFORMATION
    ),
    bidding_requirements: S3DataTransformer.sanitizeString(
      auctionItem.BIDDING_REQUIREMENTS
    ),
    auction_status: "ACTIVE",
    created_at: new Date(),
  };

  const auctionListing = await prisma.auction_listings.create({
    data: auctionListingData,
  });

  // Create visibility rules if provided
  if (config.visibilityRules) {
    await createAuctionVisibilityRules(
      auctionListing.auction_listing_id,
      config.visibilityRules,
      prisma
    );
  }

  // Link images to auction listing
  const auctionImagesInputs: Prisma.auction_listing_imagesCreateManyInput[] =
    imageIds
      .filter((imageId) => !!imageId)
      .map((imageId) => {
        return {
          auction_listing_image_id: uuidv4(),
          auction_listing_id: auctionListing.auction_listing_id!,
          image_id: imageId!,
        };
      });

  await prisma.auction_listing_images.createMany({
    skipDuplicates: true,
    data: auctionImagesInputs,
  });

  // Set up EventBridge schedule for auction completion
  if (
    config.enableEventBridgeScheduling &&
    config.completeAuctionFunctionArn &&
    config.eventBridgeSchedulerRoleArn &&
    config.eventBridgeSchedulerGroupName &&
    auctionListing.auction_end_time
  ) {
    try {
      // Add buffer time for last-minute bidding activity
      const bufferMinutes = 5; // 5 minute buffer for last-second bids
      const scheduledEndTime = new Date(
        auctionListing.auction_end_time.getTime() + bufferMinutes * 60 * 1000
      );

      await setupAuctionCompletionSchedule(
        auctionListing.auction_listing_id,
        scheduledEndTime, // Use buffered time instead of exact auction end time
        config.completeAuctionFunctionArn,
        config.eventBridgeSchedulerRoleArn,
        config.eventBridgeSchedulerGroupName,
        config.auctionDLQArn
      );
      console.log(
        `EventBridge completion schedule created for auction: ${auctionListing.auction_listing_id} (scheduled for ${scheduledEndTime.toISOString()}, ${bufferMinutes} minutes after auction end)`
      );
    } catch (error) {
      console.error(
        `Failed to create EventBridge schedule for auction: ${auctionListing.auction_listing_id}`,
        error
      );
      // Don't fail the auction creation if EventBridge setup fails
      // The auction can still be manually completed or handled by other mechanisms
    }
  } else {
    if (!config.enableEventBridgeScheduling) {
      console.log(
        `EventBridge scheduling disabled for auction: ${auctionListing.auction_listing_id}`
      );
    } else if (!config.completeAuctionFunctionArn) {
      console.warn(
        `Missing complete auction function ARN - scheduling disabled for auction: ${auctionListing.auction_listing_id}`
      );
    } else if (!config.eventBridgeSchedulerRoleArn) {
      console.warn(
        `Missing EventBridge scheduler role ARN - scheduling disabled for auction: ${auctionListing.auction_listing_id}`
      );
    } else if (!auctionListing.auction_end_time) {
      console.warn(
        `No auction end time specified - scheduling disabled for auction: ${auctionListing.auction_listing_id}`
      );
    }
  }

  console.log(`Created auction listing: ${auctionListing.auction_listing_id}`);
  return auctionListing;
}

async function createAuctionVisibilityRules(
  auctionListingId: string,
  visibilityRules: NonNullable<S3AuctionImportConfig["visibilityRules"]>,
  prisma: PrismaClient
): Promise<void> {
  const rules: Prisma.auction_listing_visibility_rulesCreateManyInput[] = [];

  // Handle buyer segments
  if (visibilityRules.buyer_segments?.length) {
    for (const segment of visibilityRules.buyer_segments) {
      rules.push({
        rule_id: uuidv4(),
        auction_listing_id: auctionListingId,
        rule_type: "BUYER_SEGMENT",
        rule_value: segment,
        is_inclusion: true,
        created_at: new Date(),
        updated_at: new Date(),
      });
    }
  }

  // Handle location rules
  if (visibilityRules.locations) {
    const { states, countries, zip_codes, cities } = visibilityRules.locations;

    if (states?.length) {
      for (const state of states) {
        rules.push({
          rule_id: uuidv4(),
          auction_listing_id: auctionListingId,
          rule_type: "LOCATION_STATE",
          rule_value: state,
          is_inclusion: true,
          created_at: new Date(),
          updated_at: new Date(),
        });
      }
    }

    if (countries?.length) {
      for (const country of countries) {
        rules.push({
          rule_id: uuidv4(),
          auction_listing_id: auctionListingId,
          rule_type: "LOCATION_COUNTRY",
          rule_value: country,
          is_inclusion: true,
          created_at: new Date(),
          updated_at: new Date(),
        });
      }
    }

    if (zip_codes?.length) {
      for (const zip of zip_codes) {
        rules.push({
          rule_id: uuidv4(),
          auction_listing_id: auctionListingId,
          rule_type: "LOCATION_ZIP",
          rule_value: zip,
          is_inclusion: true,
          created_at: new Date(),
          updated_at: new Date(),
        });
      }
    }

    if (cities?.length) {
      for (const city of cities) {
        rules.push({
          rule_id: uuidv4(),
          auction_listing_id: auctionListingId,
          rule_type: "LOCATION_CITY",
          rule_value: city,
          is_inclusion: true,
          created_at: new Date(),
          updated_at: new Date(),
        });
      }
    }
  }

  if (rules.length > 0) {
    await prisma.auction_listing_visibility_rules.createMany({
      data: rules,
      skipDuplicates: true,
    });
    console.log(`Created ${rules.length} visibility rules for auction listing`);
  }
}

export async function createProductManifest(
  manifestItem: ManifestData,
  auctionListingId: string,
  brandId: string,
  worksheet: XLSX.WorkSheet,
  rowIndex: number,
  prisma: PrismaClient
): Promise<void> {
  // Create header map for currency extraction
  const headerMap: Record<string, number> = {};
  const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1");
  for (let col = range.s.c; col <= range.e.c; col++) {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
    const cell = worksheet[cellAddress];
    if (cell && cell.v) {
      headerMap[String(cell.v)] = col;
    }
  }

  const retailPriceCurrency =
    ExcelCurrencyExtractor.parseOptionalNumberWithCurrency(
      manifestItem.UNIT_RETAIL
    ) !== undefined
      ? ExcelCurrencyExtractor.extractFieldCurrency(
          worksheet,
          rowIndex,
          "UNIT_RETAIL",
          headerMap,
          "USD"
        )
      : undefined;

  const manifestData: Prisma.auction_listing_product_manifestsCreateInput = {
    auction_listing_product_manifest_id: uuidv4(),
    auction_listings: {
      connect: {
        auction_listing_id: auctionListingId,
      },
    },
    category: fileToDbCategoryBiMap.getValue(manifestItem.CATEGORY),
    subcategory: fileToDbSubcategoryBiMap.getValue(manifestItem.SUBCATEGORY),
    title: S3DataTransformer.sanitizeString(manifestItem.TITLE)!,
    description: S3DataTransformer.sanitizeString(
      manifestItem.ITEM_DESCRIPTION
    ),
    brands: {
      connect: {
        brand_id: brandId,
      },
    },
    sku: manifestItem.SKU,
    identifier: S3DataTransformer.sanitizeString(manifestItem.UPC),
    identifier_type: manifestItem.UPC ? ("UPC" as const) : null,
    external_identifier: S3DataTransformer.sanitizeString(manifestItem.ASIN),
    external_identifier_type: manifestItem.ASIN ? ("ASIN" as const) : null,
    part_number: S3DataTransformer.sanitizeString(manifestItem.MPN),
    model_name: S3DataTransformer.sanitizeString(manifestItem.MODEL),
    product_condition: fileToDbConditionBiMap.getValue(manifestItem.CONDITION),
    cosmetic_condition: S3DataTransformer.sanitizeString(
      manifestItem.COSMETIC_CONDITION
    ),
    available_quantity: S3DataTransformer.parseNumber(manifestItem.UNIT_QTY),
    retail_price: ExcelCurrencyExtractor.parseOptionalNumberWithCurrency(
      manifestItem.UNIT_RETAIL
    ),
    retail_price_currency: retailPriceCurrency,
    is_hazmat: S3DataTransformer.parseBoolean(manifestItem.HAZMAT),
    lot_id: S3DataTransformer.sanitizeString(manifestItem.LOT_ID),
    pallet_id: S3DataTransformer.sanitizeString(manifestItem.PALLET_ID),
    department: S3DataTransformer.sanitizeString(manifestItem.DEPARTMENT),
    accessories: S3DataTransformer.sanitizeString(manifestItem.ACCESSORIES),
    weight: S3DataTransformer.parseDecimal(manifestItem.UNIT_WEIGHT, 2),
    product_weight_type: manifestItem.UNIT_WEIGHT_TYPE
      ? fileToDbWeightUnitTypeBiMap.getValue(manifestItem.UNIT_WEIGHT_TYPE)
      : undefined,
    product_height: S3DataTransformer.parseDecimal(manifestItem.UNIT_HEIGHT, 2),
    product_length: S3DataTransformer.parseDecimal(manifestItem.UNIT_LENGTH, 2),
    product_width: S3DataTransformer.parseDecimal(manifestItem.UNIT_WIDTH, 2),
    product_length_type: manifestItem.UNIT_DIMENSION_TYPE
      ? fileToDbLengthUnitTypeBiMap.getValue(manifestItem.UNIT_DIMENSION_TYPE)
      : undefined,
    case_pack: S3DataTransformer.parseNumber(manifestItem.CASE_PACK),
    case_weight_type: manifestItem.CASE_NET_WEIGHT_TYPE
      ? fileToDbWeightUnitTypeBiMap.getValue(manifestItem.CASE_NET_WEIGHT_TYPE)
      : undefined,
    case_weight: S3DataTransformer.parseDecimal(
      manifestItem.CASE_NET_WEIGHT,
      2
    ),
    case_dimension_type: manifestItem.CASE_DIMENSION_TYPE
      ? fileToDbLengthUnitTypeBiMap.getValue(manifestItem.CASE_DIMENSION_TYPE)
      : undefined,
    case_length: S3DataTransformer.parseDecimal(manifestItem.CASE_LENGTH, 2),
    case_width: S3DataTransformer.parseDecimal(manifestItem.CASE_WIDTH, 2),
    case_height: S3DataTransformer.parseDecimal(manifestItem.CASE_HEIGHT, 2),
    created_at: new Date(),
  };

  await prisma.auction_listing_product_manifests.create({
    data: manifestData,
  });

  console.log(`Created product manifest: ${manifestData.sku}`);
}
