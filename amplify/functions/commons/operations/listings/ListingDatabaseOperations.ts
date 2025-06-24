import { v4 as uuidv4 } from "uuid";
import {
  Prisma,
  PrismaClient,
} from "../../../lambda-layers/core-layer/nodejs/prisma/generated/client";
import {
  fileToDbCategoryBiMap,
  fileToDbConditionBiMap,
  fileToDbFreightBiMap,
  fileToDbLotConditionBiMap,
  fileToDbLotPackagingBiMap,
  fileToDbShippingBiMap,
  fileToDbSubcategoryBiMap,
  fileToDbWeightUnitTypeBiMap,
} from "../../converters/ListingTypeConverter";
import { S3DataTransformer, S3ImportConfig } from "./ListingOperations";

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
  auctionItem: any,
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
        ),
        address2: S3DataTransformer.sanitizeString(
          auctionItem.WAREHOUSE_LOCATION_ADDRESS2
        ),
        address3: S3DataTransformer.sanitizeString(
          auctionItem.WAREHOUSE_LOCATION_ADDRESS3
        ),
        city: S3DataTransformer.sanitizeString(
          auctionItem.WAREHOUSE_LOCATION_CITY
        ),
        province: S3DataTransformer.sanitizeString(
          auctionItem.WAREHOUSE_LOCATION_STATE
        ),
        country: S3DataTransformer.sanitizeString(
          auctionItem.WAREHOUSE_LOCATION_COUNTRY
        ),
        zip: S3DataTransformer.sanitizeString(
          auctionItem.WAREHOUSE_LOCATION_ZIPCODE
        ),
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

export function buildAddressTitle(auctionItem: any): string {
  const parts = [
    S3DataTransformer.sanitizeString(auctionItem.WAREHOUSE_LOCATION_ADDRESS1),
    S3DataTransformer.sanitizeString(auctionItem.WAREHOUSE_LOCATION_ADDRESS2),
    S3DataTransformer.sanitizeString(auctionItem.WAREHOUSE_LOCATION_ADDRESS3),
  ].filter(Boolean);

  return parts.join(", ");
}

export async function createAuctionImages(
  auctionItem: any,
  prisma: PrismaClient
): Promise<string[]> {
  const imageUrls = [
    auctionItem.IMAGE1,
    auctionItem.IMAGE2,
    auctionItem.IMAGE3,
    auctionItem.IMAGE4,
    auctionItem.IMAGE5,
    auctionItem.IMAGE6,
  ].filter((url) => S3DataTransformer.sanitizeString(url)) as string[];

  const imageData: Prisma.imagesCreateManyInput[] = imageUrls.map(
    (url, index) => ({
      image_id: uuidv4(),
      image_url: url,
      sort_order: index,
      created_at: new Date(),
    })
  );

  try {
    const result = await prisma.images.createMany({
      data: imageData,
    });

    console.log(`Created ${result.count} images`);

    // Extract the image_ids from the data we created
    const imageIds = imageData.map((item) => item.image_id!);
    return imageIds;
  } catch (error) {
    console.error("Failed to create images:", error);
    return [];
  }
}

export async function createAuctionListing(
  auctionItem: any,
  config: S3ImportConfig,
  locationAddressId: string,
  imageIds: string[],
  prisma: PrismaClient
): Promise<any> {
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
    description: S3DataTransformer.sanitizeString(auctionItem.DESCRIPTION),
    category: fileToDbCategoryBiMap.getValue(auctionItem.CATEGORY1),
    category2: fileToDbCategoryBiMap.getValue(auctionItem.CATEGORY2),
    category3: fileToDbCategoryBiMap.getValue(auctionItem.CATEGORY3),
    subcategory: fileToDbSubcategoryBiMap.getValue(auctionItem.SUBCATEGORY1),
    subcategory2: fileToDbSubcategoryBiMap.getValue(auctionItem.SUBCATEGORY2),
    subcategory3: fileToDbSubcategoryBiMap.getValue(auctionItem.SUBCATEGORY3),
    subcategory4: fileToDbSubcategoryBiMap.getValue(auctionItem.SUBCATEGORY4),
    subcategory5: fileToDbSubcategoryBiMap.getValue(auctionItem.SUBCATEGORY5),
    status: "ACTIVE" as const,
    default_image_url:
      imageIds.length > 0
        ? (
            await prisma.images.findUnique({
              where: { image_id: imageIds[0] },
            })
          )?.image_url
        : null,
    lot_condition: fileToDbLotConditionBiMap.getValue(auctionItem.LOT_TYPE),
    cosmetic_condition: S3DataTransformer.sanitizeString(
      auctionItem.COSMETIC_CONDITION
    ),
    shipping_cost: S3DataTransformer.parseDecimal(auctionItem.SHIPPING_COST),
    total_units: S3DataTransformer.parseNumber(auctionItem.TOTAL_UNITS),
    total_ex_retail_price: S3DataTransformer.parseDecimal(
      auctionItem.TOTAL_EX_RETAIL_PRICE
    ),
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
    minimum_bid: S3DataTransformer.parseDecimal(config.defaultMinimumBid),
    auction_status: "ACTIVE",
    auction_end_time: config.defaultAuctionDurationHours
      ? new Date(
          Date.now() + config.defaultAuctionDurationHours * 60 * 60 * 1000
        )
      : null,
    created_at: new Date(),
  };

  const auctionListing = await prisma.auction_listings.create({
    data: auctionListingData,
  });

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

  console.log(`Created auction listing: ${auctionListing.auction_listing_id}`);
  return auctionListing;
}

export async function createProductManifest(
  manifestItem: any,
  auctionListingId: string,
  brandId: string,
  prisma: PrismaClient
): Promise<void> {
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
      manifestItem["ITEM DESCRIPTION"]
    ),
    brands: {
      connect: {
        brand_id: brandId,
      },
    },
    sku: manifestItem.SKU,
    identifier: S3DataTransformer.sanitizeString(manifestItem.UPC),
    identifier_type: manifestItem.UPC ? ("UPC" as const) : null,
    part_number: S3DataTransformer.sanitizeString(manifestItem.MPN),
    model_name: S3DataTransformer.sanitizeString(manifestItem.MODEL),
    product_condition: fileToDbConditionBiMap.getValue(manifestItem.CONDITION),
    cosmetic_condition: S3DataTransformer.sanitizeString(
      manifestItem["COSMETIC CONDITION"]
    ),
    available_quantity: S3DataTransformer.parseNumber(manifestItem.UNIT_QTY),
    retail_price: S3DataTransformer.parseDecimal(manifestItem.UNIT_RETAIL),
    is_hazmat: S3DataTransformer.parseBoolean(manifestItem.HAZMAT),
    lot_id: S3DataTransformer.sanitizeString(manifestItem.LOT_ID),
    pallet_id: S3DataTransformer.sanitizeString(manifestItem.PALLET_ID),
    department: S3DataTransformer.sanitizeString(manifestItem.DEPARTMENT),
    accessories: S3DataTransformer.sanitizeString(manifestItem.ACCESSORIES),
    weight: S3DataTransformer.parseDecimal(manifestItem.UNIT_WEIGHT, 2),
    product_weight_type: fileToDbWeightUnitTypeBiMap.getValue(
      manifestItem.UNIT_WEIGHT_TYPE
    ),
    product_height: S3DataTransformer.parseDecimal(manifestItem.UNIT_HEIGHT, 2),
    product_length: S3DataTransformer.parseDecimal(manifestItem.UNIT_LENGTH, 2),
    product_width: S3DataTransformer.parseDecimal(manifestItem.UNIT_WIDTH, 2),
    created_at: new Date(),
  };

  await prisma.auction_listing_product_manifests.create({
    data: manifestData,
  });

  console.log(`Created product manifest: ${manifestData.sku}`);
}
