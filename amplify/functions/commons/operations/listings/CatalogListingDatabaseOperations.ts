import crypto from "crypto";

import { v4 as uuidv4 } from "uuid";
import * as XLSX from "xlsx";

import {
  Prisma,
  PrismaClient,
} from "../../../lambda-layers/core-layer/nodejs/prisma/generated/client";
import {
  fileToDbCategoryBiMap,
  fileToDbConditionBiMap,
  fileToDbIdentifierTypeBiMap,
  fileToDbLengthUnitTypeBiMap,
  fileToDbPackagingBiMap,
  fileToDbSubcategoryBiMap,
  fileToDbVariationBiMap,
  fileToDbWeightUnitTypeBiMap,
} from "../../converters/ListingTypeConverter";
import {
  CatalogOfferListingData,
  CatalogProductData,
} from "../../types/CatalogListingFileTypes";
import { ExcelCurrencyExtractor } from "../../utilities/ExcelCurrencyExtractor";
import {
  extractImageUrls,
  ImageProcessor,
  S3CatalogImportConfig,
  S3DataTransformer,
} from "./ListingOperations";

// Re-export common functions
export { getOrCreateBrand } from "./AuctionListingDatabaseOperations";

const mapCategory = (category: string | undefined) =>
  category ? fileToDbCategoryBiMap.getValue(category) : undefined;

const mapSubcategory = (subcategory: string | undefined) =>
  subcategory ? fileToDbSubcategoryBiMap.getValue(subcategory) : undefined;

export async function createCatalogListing(
  catalogItem: CatalogOfferListingData,
  config: S3CatalogImportConfig,
  locationAddressId: string,
  imageIds: string[],
  worksheet: XLSX.WorkSheet,
  rowIndex: number,
  prisma: PrismaClient
): Promise<any> {
  // Check for potential duplicates BEFORE creating
  const duplicateCheck = await checkForDuplicateListing(
    catalogItem,
    config.sellerUserId,
    prisma
  );

  if (duplicateCheck.isDuplicate) {
    const existing = duplicateCheck.existingListing!;
    throw new Error(
      `Possible duplicate listing detected!\n` +
        `Title: "${S3DataTransformer.sanitizeString(catalogItem.NAME)}"\n` +
        `Existing listing: "${existing.title}" (ID: ${existing.public_id})\n` +
        `Created: ${existing.created_at}\n` +
        `Status: ${existing.status}\n\n` +
        `This listing appears to be very similar to an existing one. ` +
        `Please review and modify if this is intentionally different, ` +
        `or skip if this is a duplicate.`
    );
  }

  // Generate the duplicate check hash
  const duplicateCheckHash = generateDuplicateCheckHash(catalogItem);

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

  const minimumOrderValueCurrency =
    ExcelCurrencyExtractor.parseOptionalNumberWithCurrency(
      catalogItem.MINIMUM_ORDER_VALUE
    ) !== undefined
      ? ExcelCurrencyExtractor.extractFieldCurrency(
          worksheet,
          rowIndex,
          "MINIMUM_ORDER_VALUE",
          headerMap,
          "USD"
        )
      : undefined;

  const catalogListingData: Prisma.catalog_listingsCreateInput = {
    catalog_listing_id: uuidv4(),
    seller_profiles: {
      connect: {
        seller_profile_id: config.sellerProfileId,
      },
    },
    users: {
      connect: {
        user_id: config.sellerUserId,
      },
    },
    title: S3DataTransformer.sanitizeString(catalogItem.NAME)!,
    description: S3DataTransformer.sanitizeString(catalogItem.DESCRIPTION)!,
    category: mapCategory(catalogItem.CATEGORY1!)!,
    category2: mapCategory(catalogItem.CATEGORY2),
    category3: mapCategory(catalogItem.CATEGORY3),
    subcategory: mapSubcategory(catalogItem.SUBCATEGORY1)!,
    subcategory2: mapSubcategory(catalogItem.SUBCATEGORY2),
    subcategory3: mapSubcategory(catalogItem.SUBCATEGORY3),
    subcategory4: mapSubcategory(catalogItem.SUBCATEGORY4),
    subcategory5: mapSubcategory(catalogItem.SUBCATEGORY5),
    status: "ACTIVE" as const,
    default_image_url:
      imageIds.length > 0
        ? (
            await prisma.images.findUnique({
              where: { image_id: imageIds[0] },
            })
          )?.image_url
        : null,
    listing_condition: fileToDbConditionBiMap.getValue(catalogItem.CONDITION)!,
    cosmetic_condition: S3DataTransformer.sanitizeString(
      catalogItem.COSMETIC_CONDITION
    ),
    packaging: fileToDbPackagingBiMap.getValue(catalogItem.PACKAGING)!,
    shipping_window: S3DataTransformer.parseNumber(catalogItem.SHIPPING_WINDOW),
    minimum_order_value: ExcelCurrencyExtractor.parseOptionalNumberWithCurrency(
      catalogItem.MINIMUM_ORDER_VALUE
    ),
    minimum_order_value_currency: minimumOrderValueCurrency,
    addresses: {
      connect: {
        address_id: locationAddressId,
      },
    },
    is_private: config.isPrivate || false,
    duplicate_check_hash: duplicateCheckHash,
    created_at: new Date(),
  };

  const catalogListing = await prisma.catalog_listings.create({
    data: catalogListingData,
  });

  // Create visibility rules if provided
  if (config.visibilityRules) {
    await createCatalogVisibilityRules(
      catalogListing.catalog_listing_id,
      config.visibilityRules,
      prisma
    );
  }

  // Link images to catalog listing (existing code remains the same)
  if (imageIds.length > 0) {
    const catalogImagesInputs: Prisma.catalog_listing_imagesCreateManyInput[] =
      imageIds.map((imageId) => ({
        catalog_listing_image_id: uuidv4(),
        catalog_listing_id: catalogListing.catalog_listing_id!,
        image_id: imageId!,
      }));

    await prisma.catalog_listing_images.createMany({
      skipDuplicates: true,
      data: catalogImagesInputs,
    });
  }

  console.log(`Created catalog listing: ${catalogListing.catalog_listing_id}`);
  return catalogListing;
}

async function createCatalogVisibilityRules(
  catalogListingId: string,
  visibilityRules: NonNullable<S3CatalogImportConfig["visibilityRules"]>,
  prisma: PrismaClient
): Promise<void> {
  const rules: Prisma.catalog_listing_visibility_rulesCreateManyInput[] = [];

  // Handle buyer segments
  if (visibilityRules.buyer_segments?.length) {
    for (const segment of visibilityRules.buyer_segments) {
      rules.push({
        rule_id: uuidv4(),
        catalog_listing_id: catalogListingId,
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
          catalog_listing_id: catalogListingId,
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
          catalog_listing_id: catalogListingId,
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
          catalog_listing_id: catalogListingId,
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
          catalog_listing_id: catalogListingId,
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
    await prisma.catalog_listing_visibility_rules.createMany({
      data: rules,
      skipDuplicates: true,
    });
    console.log(`Created ${rules.length} visibility rules for catalog listing`);
  }
}

export async function createCatalogProducts(
  productItem: CatalogProductData,
  catalogListingId: string,
  brandId: string,
  worksheet: XLSX.WorkSheet,
  rowIndex: number,
  prisma: PrismaClient,
  imageProcessor: ImageProcessor
): Promise<void> {
  const isParent = S3DataTransformer.parseBoolean(productItem.IS_PARENT);
  const parentSku = S3DataTransformer.sanitizeString(productItem.PARENT_SKU);
  const hasParentSku = parentSku && parentSku.trim() !== "";

  if (isParent && !hasParentSku) {
    // This is a parent product
    await createParentProduct(
      productItem,
      catalogListingId,
      brandId,
      worksheet,
      rowIndex,
      prisma,
      imageProcessor
    );
  } else if (!isParent && hasParentSku) {
    // This is a child product - create as variant
    await createProductVariant(
      productItem,
      catalogListingId,
      brandId,
      worksheet,
      rowIndex,
      prisma,
      imageProcessor
    );
  } else if (!isParent && !hasParentSku) {
    // This is a standalone product (no variants) - create both parent and variant
    await createStandaloneProduct(
      productItem,
      catalogListingId,
      brandId,
      worksheet,
      rowIndex,
      prisma,
      imageProcessor
    );
  } else {
    // Edge case: marked as parent but has parent SKU - treat as child
    console.warn(
      `Product ${productItem.SKU} is marked as parent but has parent SKU. Treating as child.`
    );
    await createProductVariant(
      productItem,
      catalogListingId,
      brandId,
      worksheet,
      rowIndex,
      prisma,
      imageProcessor
    );
  }
}

async function createStandaloneProduct(
  productItem: CatalogProductData,
  catalogListingId: string,
  brandId: string,
  worksheet: XLSX.WorkSheet,
  rowIndex: number,
  prisma: PrismaClient,
  imageProcessor: ImageProcessor
): Promise<void> {
  // First create the parent product
  const { imageIds: parentProductImageIds, imageUrls: parentImageUrls } =
    await createProductImages(productItem, prisma, imageProcessor);

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
      productItem.UNIT_RETAIL
    ) !== undefined
      ? ExcelCurrencyExtractor.extractFieldCurrency(
          worksheet,
          rowIndex,
          "UNIT_RETAIL",
          headerMap,
          "USD"
        )
      : undefined;

  const offerPriceCurrency =
    ExcelCurrencyExtractor.parseOptionalNumberWithCurrency(
      productItem.OFFER_PRICE
    ) !== undefined
      ? ExcelCurrencyExtractor.extractFieldCurrency(
          worksheet,
          rowIndex,
          "OFFER_PRICE",
          headerMap,
          "USD"
        )
      : undefined;

  const parentProductData: Prisma.catalog_productsCreateInput = {
    catalog_product_id: uuidv4(),
    catalog_listings: {
      connect: {
        catalog_listing_id: catalogListingId,
      },
    },
    title: S3DataTransformer.sanitizeString(productItem.PRODUCT_NAME)!,
    description: S3DataTransformer.sanitizeString(productItem.DESCRIPTION),
    category: fileToDbCategoryBiMap.getValue(productItem.CATEGORY!),
    subcategory: mapSubcategory(productItem.SUBCATEGORY),
    brands: {
      connect: {
        brand_id: brandId,
      },
    },
    product_condition: fileToDbConditionBiMap.getValue(productItem.CONDITION),
    cosmetic_condition: S3DataTransformer.sanitizeString(
      productItem.COSMETIC_CONDITION
    ),
    packaging: fileToDbPackagingBiMap.getValue(productItem.PACKAGING),
    default_image_url: parentImageUrls.length > 0 ? parentImageUrls[0] : null,
    sku: `${productItem.SKU}-PARENT`, // Make parent SKU unique
    part_number: S3DataTransformer.sanitizeString(productItem.MPN),
    model_name: S3DataTransformer.sanitizeString(productItem.MODEL),
    retail_price: ExcelCurrencyExtractor.parseOptionalNumberWithCurrency(
      productItem.UNIT_RETAIL
    ),
    retail_price_currency: retailPriceCurrency,
    offer_price: ExcelCurrencyExtractor.parseOptionalNumberWithCurrency(
      productItem.OFFER_PRICE
    ),
    offer_price_currency: offerPriceCurrency,
    // min_order_quantity:
    //   S3DataTransformer.parseNumber(productItem.MIN_ORDER_QUANTITY) || 1,
    // max_order_quantity: S3DataTransformer.parseNumber(
    //   productItem.MAX_ORDER_QUANTITY
    // ),
    weight: parsePositiveDecimal(productItem.UNIT_NET_WEIGHT, 2),
    weight_unit_type: getWeightUnitType(
      productItem.UNIT_NET_WEIGHT,
      productItem.UNIT_NET_WEIGHT_TYPE
    ),
    product_height: parsePositiveDecimal(productItem.UNIT_HEIGHT, 2),
    product_length: parsePositiveDecimal(productItem.UNIT_LENGTH, 2),
    product_width: parsePositiveDecimal(productItem.UNIT_WIDTH, 2),
    length_unit_type: getLengthUnitType(
      productItem.UNIT_HEIGHT,
      productItem.UNIT_LENGTH,
      productItem.UNIT_WIDTH,
      productItem.UNIT_DIMENSION_TYPE
    ),
    accessories: S3DataTransformer.sanitizeString(productItem.ACCESSORIES),
    is_hazmat: S3DataTransformer.parseBoolean(productItem.HAZMAT),
    status: "ACTIVE",
    created_at: new Date(),
  };

  const catalogProduct = await prisma.catalog_products.create({
    data: parentProductData,
  });

  // Link images to parent catalog product
  if (parentProductImageIds.length > 0) {
    const productImagesInputs: Prisma.catalog_product_imagesCreateManyInput[] =
      parentProductImageIds.map((imageId) => ({
        catalog_product_image_id: uuidv4(),
        catalog_product_id: catalogProduct.catalog_product_id!,
        image_id: imageId!,
      }));

    await prisma.catalog_product_images.createMany({
      skipDuplicates: true,
      data: productImagesInputs,
    });
  }

  console.log(
    `Created catalog product (standalone parent): ${catalogProduct.sku}`
  );

  // Now create the variant with the actual SKU
  const { imageIds: variantImageIds, imageUrls: variantImageUrls } =
    await createProductImages(productItem, prisma, imageProcessor);

  const variantData: Prisma.catalog_product_variantsCreateInput = {
    catalog_product_variant_id: uuidv4(),
    catalog_products: {
      connect: {
        catalog_product_id: catalogProduct.catalog_product_id,
      },
    },
    variant_sku: productItem.SKU, // Use the original SKU for the variant
    variant_name: "Default", // Default name for standalone products

    // Pricing and inventory (variant-specific)
    retail_price: ExcelCurrencyExtractor.parseOptionalNumberWithCurrency(
      productItem.UNIT_RETAIL
    ),
    retail_price_currency: retailPriceCurrency,
    offer_price: ExcelCurrencyExtractor.parseOptionalNumberWithCurrency(
      productItem.OFFER_PRICE
    ),
    offer_price_currency: offerPriceCurrency,
    available_quantity:
      S3DataTransformer.parseNumber(productItem.TOTAL_UNITS) || 0,
    // min_order_quantity: S3DataTransformer.parseNumber(
    //   productItem.MIN_ORDER_QUANTITY
    // ),
    // max_order_quantity: S3DataTransformer.parseNumber(
    //   productItem.MAX_ORDER_QUANTITY
    // ),

    // Physical properties (inherit from parent, but can be overridden)
    weight: parsePositiveDecimal(productItem.UNIT_NET_WEIGHT, 2),
    weight_unit_type: getWeightUnitType(
      productItem.UNIT_NET_WEIGHT,
      productItem.UNIT_NET_WEIGHT_TYPE
    ),
    product_height: parsePositiveDecimal(productItem.UNIT_HEIGHT, 2),
    product_length: parsePositiveDecimal(productItem.UNIT_LENGTH, 2),
    product_width: parsePositiveDecimal(productItem.UNIT_WIDTH, 2),
    length_unit_type: getLengthUnitType(
      productItem.UNIT_HEIGHT,
      productItem.UNIT_LENGTH,
      productItem.UNIT_WIDTH,
      productItem.UNIT_DIMENSION_TYPE
    ),

    // Identifiers (can be different from parent)
    identifier: S3DataTransformer.sanitizeString(productItem.IDENTIFIER),
    identifier_type: productItem.IDENTIFIER_TYPE
      ? fileToDbIdentifierTypeBiMap.getValue(productItem.IDENTIFIER_TYPE)
      : null,
    part_number: S3DataTransformer.sanitizeString(productItem.MPN),

    // Image and condition
    default_image_url: variantImageUrls.length > 0 ? variantImageUrls[0] : null,
    product_condition: fileToDbConditionBiMap.getValue(productItem.CONDITION),
    cosmetic_condition: S3DataTransformer.sanitizeString(
      productItem.COSMETIC_CONDITION
    ),

    // Additional fields
    packaging: fileToDbPackagingBiMap.getValue(productItem.PACKAGING),
    accessories: S3DataTransformer.sanitizeString(productItem.ACCESSORIES),
    is_hazmat: S3DataTransformer.parseBoolean(productItem.HAZMAT),

    // Status
    is_active: true,
    sort_order: 0,
    case_pack: S3DataTransformer.parseNumber(productItem.CASE_PACK),
    case_weight_type: getCaseWeightUnitType(
      productItem.CASE_WEIGHT,
      productItem.CASE_WEIGHT_TYPE
    ),
    case_weight: parsePositiveDecimal(productItem.CASE_WEIGHT, 2),
    case_dimension_type: getCaseLengthUnitType(
      productItem.CASE_HEIGHT,
      productItem.CASE_LENGTH,
      productItem.CASE_WIDTH,
      productItem.CASE_DIMENSION_TYPE
    ),
    case_length: parsePositiveDecimal(productItem.CASE_LENGTH, 2),
    case_width: parsePositiveDecimal(productItem.CASE_WIDTH, 2),
    case_height: parsePositiveDecimal(productItem.CASE_HEIGHT, 2),
    created_at: new Date(),
  };

  const variant = await prisma.catalog_product_variants.create({
    data: variantData,
  });

  // Link variant-specific images
  if (variantImageIds.length > 0) {
    const variantImagesInputs: Prisma.catalog_product_variant_imagesCreateManyInput[] =
      variantImageIds.map((imageId, index) => ({
        catalog_product_variant_image_id: uuidv4(),
        catalog_product_variant_id: variant.catalog_product_variant_id,
        image_id: imageId,
        sort_order: index,
        is_primary: index === 0,
        created_at: new Date(),
      }));

    await prisma.catalog_product_variant_images.createMany({
      data: variantImagesInputs,
      skipDuplicates: true,
    });
  }

  console.log(
    `Created catalog product variant (standalone): ${variant.variant_sku}`
  );
}

function parsePositiveDecimal(
  value: any,
  precision: number = 4
): number | undefined {
  const parsed = S3DataTransformer.parseDecimal(value, precision);
  return parsed && parsed > 0 ? parsed : undefined;
}

function parsePositiveNumber(value: any): number | undefined {
  const parsed = S3DataTransformer.parseNumber(value);
  return parsed && parsed > 0 ? parsed : undefined;
}

function getWeightUnitType(
  weightValue: any,
  weightUnitType: any
): any | undefined {
  const weight = parsePositiveDecimal(weightValue, 2);
  return weight && weightUnitType
    ? fileToDbWeightUnitTypeBiMap.getValue(weightUnitType)
    : undefined;
}

function getLengthUnitType(
  heightValue: any,
  lengthValue: any,
  widthValue: any,
  lengthUnitType: any
): any | undefined {
  const height = parsePositiveDecimal(heightValue, 2);
  const length = parsePositiveDecimal(lengthValue, 2);
  const width = parsePositiveDecimal(widthValue, 2);

  const hasPositiveDimension = height || length || width;
  return hasPositiveDimension && lengthUnitType
    ? fileToDbLengthUnitTypeBiMap.getValue(lengthUnitType)
    : undefined;
}

function getCaseWeightUnitType(
  caseWeightValue: any,
  caseWeightUnitType: any
): any | undefined {
  const weight = parsePositiveDecimal(caseWeightValue, 2);
  return weight && caseWeightUnitType
    ? fileToDbWeightUnitTypeBiMap.getValue(caseWeightUnitType)
    : undefined;
}

function getCaseLengthUnitType(
  caseHeightValue: any,
  caseLengthValue: any,
  caseWidthValue: any,
  caseDimensionType: any
): any | undefined {
  const height = parsePositiveDecimal(caseHeightValue, 2);
  const length = parsePositiveDecimal(caseLengthValue, 2);
  const width = parsePositiveDecimal(caseWidthValue, 2);

  const hasPositiveDimension = height || length || width;
  return hasPositiveDimension && caseDimensionType
    ? fileToDbLengthUnitTypeBiMap.getValue(caseDimensionType)
    : undefined;
}

// UPDATE the createParentProduct function to ensure unique parent SKUs:
async function createParentProduct(
  productItem: CatalogProductData,
  catalogListingId: string,
  brandId: string,
  worksheet: XLSX.WorkSheet,
  rowIndex: number,
  prisma: PrismaClient,
  imageProcessor: ImageProcessor
): Promise<void> {
  // Create product images if IMAGE field has URL
  const { imageIds: productImageIds, imageUrls: productImageUrls } =
    await createProductImages(productItem, prisma, imageProcessor);

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
      productItem.UNIT_RETAIL
    ) !== undefined
      ? ExcelCurrencyExtractor.extractFieldCurrency(
          worksheet,
          rowIndex,
          "UNIT_RETAIL",
          headerMap,
          "USD"
        )
      : undefined;

  const offerPriceCurrency =
    ExcelCurrencyExtractor.parseOptionalNumberWithCurrency(
      productItem.OFFER_PRICE
    ) !== undefined
      ? ExcelCurrencyExtractor.extractFieldCurrency(
          worksheet,
          rowIndex,
          "OFFER_PRICE",
          headerMap,
          "USD"
        )
      : undefined;

  const productData: Prisma.catalog_productsCreateInput = {
    catalog_product_id: uuidv4(),
    catalog_listings: {
      connect: {
        catalog_listing_id: catalogListingId,
      },
    },
    title: S3DataTransformer.sanitizeString(productItem.PRODUCT_NAME)!,
    description: S3DataTransformer.sanitizeString(productItem.DESCRIPTION),
    category: fileToDbCategoryBiMap.getValue(productItem.CATEGORY!),
    subcategory: mapSubcategory(productItem.SUBCATEGORY),
    brands: {
      connect: {
        brand_id: brandId,
      },
    },
    product_condition: fileToDbConditionBiMap.getValue(productItem.CONDITION),
    cosmetic_condition: S3DataTransformer.sanitizeString(
      productItem.COSMETIC_CONDITION
    ),
    packaging: fileToDbPackagingBiMap.getValue(productItem.PACKAGING),
    default_image_url: productImageUrls.length > 0 ? productImageUrls[0] : null,
    sku: productItem.SKU, // Keep original SKU for true parent products
    part_number: S3DataTransformer.sanitizeString(productItem.MPN),
    model_name: S3DataTransformer.sanitizeString(productItem.MODEL),
    retail_price: ExcelCurrencyExtractor.parseOptionalNumberWithCurrency(
      productItem.UNIT_RETAIL
    ),
    retail_price_currency: retailPriceCurrency,
    offer_price: ExcelCurrencyExtractor.parseOptionalNumberWithCurrency(
      productItem.OFFER_PRICE
    ),
    offer_price_currency: offerPriceCurrency,
    // min_order_quantity:
    //   S3DataTransformer.parseNumber(productItem.MIN_ORDER_QUANTITY) || 1,
    // max_order_quantity: S3DataTransformer.parseNumber(
    //   productItem.MAX_ORDER_QUANTITY
    // ),
    weight: parsePositiveDecimal(productItem.UNIT_NET_WEIGHT, 2),
    weight_unit_type: getWeightUnitType(
      productItem.UNIT_NET_WEIGHT,
      productItem.UNIT_NET_WEIGHT_TYPE
    ),
    product_height: parsePositiveDecimal(productItem.UNIT_HEIGHT, 2),
    product_length: parsePositiveDecimal(productItem.UNIT_LENGTH, 2),
    product_width: parsePositiveDecimal(productItem.UNIT_WIDTH, 2),
    length_unit_type: getLengthUnitType(
      productItem.UNIT_HEIGHT,
      productItem.UNIT_LENGTH,
      productItem.UNIT_WIDTH,
      productItem.UNIT_DIMENSION_TYPE
    ),
    accessories: S3DataTransformer.sanitizeString(productItem.ACCESSORIES),
    is_hazmat: S3DataTransformer.parseBoolean(productItem.HAZMAT),
    status: "ACTIVE",
    created_at: new Date(),
  };

  const catalogProduct = await prisma.catalog_products.create({
    data: productData,
  });

  // Link images to catalog product
  if (productImageIds.length > 0) {
    const productImagesInputs: Prisma.catalog_product_imagesCreateManyInput[] =
      productImageIds.map((imageId) => ({
        catalog_product_image_id: uuidv4(),
        catalog_product_id: catalogProduct.catalog_product_id!,
        image_id: imageId!,
      }));

    await prisma.catalog_product_images.createMany({
      skipDuplicates: true,
      data: productImagesInputs,
    });
  }

  console.log(`Created catalog product (parent): ${catalogProduct.sku}`);
}

async function createProductVariant(
  productItem: CatalogProductData,
  catalogListingId: string,
  brandId: string,
  worksheet: XLSX.WorkSheet,
  rowIndex: number,
  prisma: PrismaClient,
  imageProcessor: ImageProcessor
): Promise<void> {
  const parentSku = S3DataTransformer.sanitizeString(productItem.PARENT_SKU)!;

  // Find the parent product
  const parentProduct = await prisma.catalog_products.findFirst({
    where: {
      sku: parentSku,
      catalog_listing_id: catalogListingId,
    },
  });

  if (!parentProduct) {
    console.error(
      `Parent product with SKU ${parentSku} not found. Creating as standalone product.`
    );
    await createParentProduct(
      productItem,
      catalogListingId,
      brandId,
      worksheet,
      rowIndex,
      prisma,
      imageProcessor
    );
    return;
  }

  // Create variant images if IMAGE field has URL
  const { imageIds: variantImageIds, imageUrls: variantImageUrls } =
    await createProductImages(productItem, prisma, imageProcessor);

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
      productItem.UNIT_RETAIL
    ) !== undefined
      ? ExcelCurrencyExtractor.extractFieldCurrency(
          worksheet,
          rowIndex,
          "UNIT_RETAIL",
          headerMap,
          "USD"
        )
      : undefined;

  const offerPriceCurrency =
    ExcelCurrencyExtractor.parseOptionalNumberWithCurrency(
      productItem.OFFER_PRICE
    ) !== undefined
      ? ExcelCurrencyExtractor.extractFieldCurrency(
          worksheet,
          rowIndex,
          "OFFER_PRICE",
          headerMap,
          "USD"
        )
      : undefined;

  const variantData: Prisma.catalog_product_variantsCreateInput = {
    catalog_product_variant_id: uuidv4(),
    catalog_products: {
      connect: {
        catalog_product_id: parentProduct.catalog_product_id,
      },
    },
    variant_sku: productItem.SKU,
    variant_name: S3DataTransformer.sanitizeString(productItem.VARIATION_VALUE),

    // Override fields if different from parent
    title:
      S3DataTransformer.sanitizeString(productItem.PRODUCT_NAME) !==
      parentProduct.title
        ? S3DataTransformer.sanitizeString(productItem.PRODUCT_NAME)
        : null,
    description:
      S3DataTransformer.sanitizeString(productItem.DESCRIPTION) !==
      parentProduct.description
        ? S3DataTransformer.sanitizeString(productItem.DESCRIPTION)
        : null,
    model_name: S3DataTransformer.sanitizeString(productItem.MODEL),
    packaging: fileToDbPackagingBiMap.getValue(productItem.PACKAGING),
    accessories: S3DataTransformer.sanitizeString(productItem.ACCESSORIES),
    is_hazmat: S3DataTransformer.parseBoolean(productItem.HAZMAT),

    // Pricing and inventory (variant-specific)
    retail_price: ExcelCurrencyExtractor.parseOptionalNumberWithCurrency(
      productItem.UNIT_RETAIL
    ),
    retail_price_currency: retailPriceCurrency,
    offer_price: ExcelCurrencyExtractor.parseOptionalNumberWithCurrency(
      productItem.OFFER_PRICE
    ),
    offer_price_currency: offerPriceCurrency,
    available_quantity:
      S3DataTransformer.parseNumber(productItem.TOTAL_UNITS) || 0,
    // min_order_quantity: S3DataTransformer.parseNumber(
    //   productItem.MIN_ORDER_QUANTITY
    // ),
    // max_order_quantity: S3DataTransformer.parseNumber(
    //   productItem.MAX_ORDER_QUANTITY
    // ),

    // Physical properties
    weight: parsePositiveDecimal(productItem.UNIT_NET_WEIGHT, 2),
    weight_unit_type: getWeightUnitType(
      productItem.UNIT_NET_WEIGHT,
      productItem.UNIT_NET_WEIGHT_TYPE
    ),
    product_height: parsePositiveDecimal(productItem.UNIT_HEIGHT, 2),
    product_length: parsePositiveDecimal(productItem.UNIT_LENGTH, 2),
    product_width: parsePositiveDecimal(productItem.UNIT_WIDTH, 2),
    length_unit_type: getLengthUnitType(
      productItem.UNIT_HEIGHT,
      productItem.UNIT_LENGTH,
      productItem.UNIT_WIDTH,
      productItem.UNIT_DIMENSION_TYPE
    ),

    // Identifiers
    identifier: S3DataTransformer.sanitizeString(productItem.IDENTIFIER),
    identifier_type: productItem.IDENTIFIER_TYPE
      ? fileToDbIdentifierTypeBiMap.getValue(productItem.IDENTIFIER_TYPE)
      : null,
    part_number: S3DataTransformer.sanitizeString(productItem.MPN),

    // Image and condition
    default_image_url: variantImageUrls.length > 0 ? variantImageUrls[0] : null,
    product_condition: fileToDbConditionBiMap.getValue(productItem.CONDITION),
    cosmetic_condition: S3DataTransformer.sanitizeString(
      productItem.COSMETIC_CONDITION
    ),

    // Status
    is_active: true,
    sort_order: 0,
    case_pack: S3DataTransformer.parseNumber(productItem.CASE_PACK),
    case_weight_type: getCaseWeightUnitType(
      productItem.CASE_WEIGHT,
      productItem.CASE_WEIGHT_TYPE
    ),
    case_weight: parsePositiveDecimal(productItem.CASE_WEIGHT, 2),
    case_dimension_type: getCaseLengthUnitType(
      productItem.CASE_HEIGHT,
      productItem.CASE_LENGTH,
      productItem.CASE_WIDTH,
      productItem.CASE_DIMENSION_TYPE
    ),
    case_length: parsePositiveDecimal(productItem.CASE_LENGTH, 2),
    case_width: parsePositiveDecimal(productItem.CASE_WIDTH, 2),
    case_height: parsePositiveDecimal(productItem.CASE_HEIGHT, 2),
    created_at: new Date(),
  };

  const variant = await prisma.catalog_product_variants.create({
    data: variantData,
  });

  // Create variant attributes if variation theme and value are provided
  if (productItem.VARIATION_THEME && productItem.VARIATION_VALUE) {
    await createVariantAttributes(
      variant.catalog_product_variant_id,
      productItem.VARIATION_THEME,
      productItem.VARIATION_VALUE,
      prisma
    );
  }

  // Link variant-specific images
  if (variantImageIds.length > 0) {
    const variantImagesInputs: Prisma.catalog_product_variant_imagesCreateManyInput[] =
      variantImageIds.map((imageId, index) => ({
        catalog_product_variant_image_id: uuidv4(),
        catalog_product_variant_id: variant.catalog_product_variant_id,
        image_id: imageId,
        sort_order: index,
        is_primary: index === 0,
        created_at: new Date(),
      }));

    await prisma.catalog_product_variant_images.createMany({
      data: variantImagesInputs,
      skipDuplicates: true,
    });
  }

  console.log(`Created catalog product variant: ${variant.variant_sku}`);
}

async function createVariantAttributes(
  variantId: string,
  variationTheme: string,
  variationValue: string,
  prisma: PrismaClient
): Promise<void> {
  // Find or create the variant attribute
  let variantAttribute = await prisma.variant_attributes.findFirst({
    where: { name: variationTheme.toLowerCase() },
  });

  if (!variantAttribute) {
    variantAttribute = await prisma.variant_attributes.create({
      data: {
        variant_attribute_id: uuidv4(),
        name: variationTheme.toLowerCase(),
        display_name: variationTheme,
        attribute_type:
          fileToDbVariationBiMap.getValue(variationTheme.toUpperCase()) ||
          "STYLE",
        is_required: false,
        sort_order: 0,
        is_active: true,
        created_at: new Date(),
      },
    });
  }

  // Create the variant attribute relationship
  await prisma.catalog_product_variant_attributes.create({
    data: {
      catalog_product_variant_attribute_id: uuidv4(),
      catalog_product_variant_id: variantId,
      variant_attribute_id: variantAttribute.variant_attribute_id,
      attribute_value: variationValue.toLowerCase(),
      created_at: new Date(),
    },
  });

  console.log(
    `Created variant attribute: ${variationTheme} = ${variationValue}`
  );
}

export async function createProductImages(
  productItem: any,
  prisma: PrismaClient,
  imageProcessor: ImageProcessor
): Promise<{ imageIds: string[]; imageUrls: string[] }> {
  const imageUrls = extractImageUrls(productItem);

  if (imageUrls.length === 0) {
    return { imageIds: [], imageUrls: [] };
  }

  console.log(`Processing ${imageUrls.length} product images`);

  const result = await imageProcessor.processImagesAndSaveToDb(
    imageUrls,
    prisma,
    "Catalog"
  );

  console.log(
    `Successfully processed ${result.imageIds.length} product images`
  );
  return result;
}

export async function createCatalogListingImages(
  catalogListingItem: any,
  prisma: PrismaClient,
  imageProcessor: ImageProcessor
): Promise<string[]> {
  const imageUrls = extractImageUrls(catalogListingItem);

  if (imageUrls.length === 0) {
    return [];
  }

  console.log(`Processing ${imageUrls.length} catalog listing images`);

  const { imageIds } = await imageProcessor.processImagesAndSaveToDb(
    imageUrls,
    prisma,
    "Catalog"
  );

  console.log(
    `Successfully processed ${imageIds.length} catalog listing images`
  );
  return imageIds;
}

function buildVariantAttributes(productItem: any): any {
  const attributes: any = {};

  if (productItem.VARIATION_THEME && productItem.VARIATION_VALUE) {
    attributes[productItem.VARIATION_THEME] = productItem.VARIATION_VALUE;
  }

  if (productItem.IS_PARENT === "TRUE" || productItem.IS_PARENT === "true") {
    attributes.is_parent = true;
  }

  return attributes;
}

function parseJsonSafely(value: any): any {
  if (!value) return {};
  if (typeof value === "object") return value;
  try {
    return JSON.parse(String(value));
  } catch {
    return {};
  }
}

function mapCatalogProductStatus(
  status: string | undefined
): "ACTIVE" | "INACTIVE" | "OUT_OF_STOCK" {
  if (!status) return "ACTIVE";

  const statusUpper = status.toUpperCase();
  if (statusUpper === "INACTIVE") return "INACTIVE";
  if (statusUpper === "OUT_OF_STOCK" || statusUpper === "OUT OF STOCK")
    return "OUT_OF_STOCK";
  return "ACTIVE";
}

export async function createCatalogAddress(
  catalogOfferListingData: CatalogOfferListingData,
  prisma: PrismaClient
): Promise<string | null> {
  const address1 = S3DataTransformer.sanitizeString(
    catalogOfferListingData.WAREHOUSE_LOCATION_ADDRESS1
  );
  const city = S3DataTransformer.sanitizeString(
    catalogOfferListingData.WAREHOUSE_LOCATION_CITY
  );

  if (!address1 || !city) {
    return null;
  }

  try {
    const address = await prisma.addresses.create({
      data: {
        address_id: uuidv4(),
        address1: S3DataTransformer.sanitizeString(
          catalogOfferListingData.WAREHOUSE_LOCATION_ADDRESS1
        )!,
        address2: S3DataTransformer.sanitizeString(
          catalogOfferListingData.WAREHOUSE_LOCATION_ADDRESS2
        ),
        address3: S3DataTransformer.sanitizeString(
          catalogOfferListingData.WAREHOUSE_LOCATION_ADDRESS3
        ),
        city: S3DataTransformer.sanitizeString(
          catalogOfferListingData.WAREHOUSE_LOCATION_CITY
        )!,
        province: S3DataTransformer.sanitizeString(
          catalogOfferListingData.WAREHOUSE_LOCATION_STATE
        )!,
        country: S3DataTransformer.sanitizeString(
          catalogOfferListingData.WAREHOUSE_LOCATION_COUNTRY
        )!,
        zip: S3DataTransformer.sanitizeString(
          catalogOfferListingData.WAREHOUSE_LOCATION_ZIPCODE
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

/**
 * Generate a hash for duplicate detection based on key listing attributes
 */
function generateDuplicateCheckHash(
  catalogItem: CatalogOfferListingData
): string {
  // Normalize values for consistent hashing
  const title =
    S3DataTransformer.sanitizeString(catalogItem.NAME)?.toLowerCase().trim() ||
    "";
  const description =
    S3DataTransformer.sanitizeString(catalogItem.DESCRIPTION)
      ?.toLowerCase()
      .trim() || "";
  const category = mapCategory(catalogItem.CATEGORY1!) || "";
  const subcategory = mapSubcategory(catalogItem.SUBCATEGORY1) || "";
  const condition =
    fileToDbConditionBiMap.getValue(catalogItem.CONDITION) || "";
  const packaging =
    fileToDbPackagingBiMap.getValue(catalogItem.PACKAGING) || "";

  // Create a consistent string for hashing
  const hashInput = [
    title,
    description,
    category,
    subcategory,
    condition,
    packaging,
  ].join("|");

  // Generate SHA-256 hash
  return crypto.createHash("sha256").update(hashInput, "utf8").digest("hex");
}

/**
 * Check for potential duplicate listings
 */
async function checkForDuplicateListing(
  catalogItem: CatalogOfferListingData,
  sellerUserId: string,
  prisma: PrismaClient
): Promise<{ isDuplicate: boolean; existingListing?: any }> {
  const duplicateHash = generateDuplicateCheckHash(catalogItem);

  // Look for existing listings with the same hash for this seller
  const existingListing = await prisma.catalog_listings.findFirst({
    where: {
      seller_user_id: sellerUserId,
      duplicate_check_hash: duplicateHash,
      status: {
        in: ["ACTIVE", "DRAFT"], // Only check against active/draft listings
      },
    },
    select: {
      catalog_listing_id: true,
      title: true,
      status: true,
      created_at: true,
      public_id: true,
    },
  });

  return {
    isDuplicate: !!existingListing,
    existingListing,
  };
}
