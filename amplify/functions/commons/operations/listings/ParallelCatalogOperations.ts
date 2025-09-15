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
  S3CatalogImportConfig,
  S3DataTransformer,
} from "./ListingOperations";
import { ParallelImageProcessor } from "./ParallelImageProcessor";

// Track S3 uploads for cleanup
interface TransactionContext {
  uploadedS3Keys: string[];
  createdImageIds: string[];
  transaction: PrismaClient;
}

const mapCategory = (category: string | undefined) =>
  category ? fileToDbCategoryBiMap.getValue(category) : undefined;

const mapSubcategory = (subcategory: string | undefined) =>
  subcategory ? fileToDbSubcategoryBiMap.getValue(subcategory) : undefined;

/**
 * Parallel processing of multiple catalog listings
 */
export async function processMultipleCatalogListingsParallel(
  catalogListingData: CatalogOfferListingData[],
  catalogProductsData: CatalogProductData[],
  catalogListingWorksheet: XLSX.WorkSheet,
  catalogProductsWorksheet: XLSX.WorkSheet,
  config: S3CatalogImportConfig,
  prisma: PrismaClient
): Promise<void> {
  const imageProcessor = new ParallelImageProcessor(config.s3Config, {
    bucketName: config.imageBucketName,
    userPublicId: config.sellerPublicUserId,
  });

  const CONCURRENT_LISTINGS = Math.min(5, catalogListingData.length);
  const errors: Array<{ index: number; name: string; error: string }> = [];
  let processed = 0;

  console.log(
    `Processing ${catalogListingData.length} listings with ${CONCURRENT_LISTINGS} concurrent workers`
  );

  for (let i = 0; i < catalogListingData.length; i += CONCURRENT_LISTINGS) {
    const batch = catalogListingData.slice(i, i + CONCURRENT_LISTINGS);

    const batchPromises = batch.map(async (catalogListingItem, batchIndex) => {
      const globalIndex = i + batchIndex;
      const listingName =
        catalogListingItem.NAME || `Listing ${globalIndex + 1}`;

      try {
        console.log(`Starting: ${listingName}`);

        await processCatalogListingParallel(
          catalogListingItem,
          catalogProductsData,
          catalogListingWorksheet,
          catalogProductsWorksheet,
          globalIndex + 1,
          config,
          prisma,
          imageProcessor
        );

        processed++;
        console.log(
          `Completed: ${listingName} (${processed}/${catalogListingData.length})`
        );
      } catch (error: any) {
        errors.push({
          index: globalIndex + 1,
          name: listingName,
          error: error.message || "Unknown error",
        });
        console.error(`Failed: ${listingName} - ${error.message}`);

        if (!config.skipInvalidRows) {
          throw new Error(
            `Import failed on listing "${listingName}": ${error.message}`
          );
        }
      }
    });

    await Promise.allSettled(batchPromises);
    console.log(
      `Batch ${Math.floor(i / CONCURRENT_LISTINGS) + 1} completed. Progress: ${processed}/${catalogListingData.length}`
    );
  }

  console.log(`\nParallel processing completed!`);
  console.log(`Successful: ${processed}, Failed: ${errors.length}`);

  if (errors.length > 0) {
    console.log("\n=== ERRORS ===");
    errors.forEach(({ index, name, error }) => {
      console.log(`${index}. ${name}: ${error}`);
    });

    // THROW to propagate errors up to handler
    throw new Error(
      `Catalog import failed: ${errors.length} listing(s) failed. ` +
        `Errors: ${errors.map((e) => `${e.name}: ${e.error}`).join("; ")}`
    );
  }
}

/**
 * Process a single catalog listing with parallel optimizations
 */
export async function processCatalogListingParallel(
  catalogListingItem: CatalogOfferListingData,
  catalogProductsData: CatalogProductData[],
  catalogListingWorksheet: XLSX.WorkSheet,
  catalogProductsWorksheet: XLSX.WorkSheet,
  listingRowIndex: number,
  config: S3CatalogImportConfig,
  prisma: PrismaClient,
  imageProcessor: ParallelImageProcessor
): Promise<void> {
  const ctx: TransactionContext = {
    uploadedS3Keys: [],
    createdImageIds: [],
    transaction: prisma, // Placeholder for transaction, will be set later
  };

  try {
    console.log(`Processing: ${catalogListingItem.NAME}`);

    // PHASE 1: PREPARE DATA (Outside transaction)
    const [listingImageUrls, allProductImageUrls, addressData, sortedProducts] =
      await Promise.all([
        extractAndValidateImageUrls(catalogListingItem),
        extractAllProductImageUrls(catalogProductsData),
        prepareAddressData(catalogListingItem),
        Promise.resolve(sortProductsByParentChild(catalogProductsData)),
      ]);

    // PHASE 2: PROCESS ALL IMAGES TO S3 (Outside transaction)
    const allImageUrls = [...listingImageUrls, ...allProductImageUrls];
    const uniqueImageUrls = [...new Set(allImageUrls)];

    console.log(
      `Processing ${uniqueImageUrls.length} images to S3 (outside transaction)...`
    );

    // Upload images to S3 and prepare database records (but don't save yet)
    const imageRecordsToCreate = await imageProcessor.processImagesToS3Only(
      uniqueImageUrls,
      "Catalog",
      ctx
    );

    // Create lookup maps for easy access
    const imageUrlToRecord = new Map<string, any>();
    imageRecordsToCreate.forEach((record) => {
      imageUrlToRecord.set(record.original_url, record);
    });

    console.log(
      `Prepared ${imageRecordsToCreate.length} image records for database`
    );

    // PHASE 3: SINGLE TRANSACTION WITH ALL DATABASE OPERATIONS
    await prisma.$transaction(
      async (transaction) => {
        ctx.transaction = transaction as PrismaClient;

        console.log(
          `Starting database transaction for: ${catalogListingItem.NAME}`
        );

        // 3.1: Create all image records first
        console.log(`Creating ${imageRecordsToCreate.length} image records...`);
        await transaction.images.createMany({
          data: imageRecordsToCreate,
          skipDuplicates: true,
        });

        // Track created image IDs for cleanup
        imageRecordsToCreate.forEach((record) => {
          ctx.createdImageIds.push(record.image_id);
        });

        // 3.2: Create brands in parallel
        const brandCacheMap = await extractAndCacheBrandNames(
          catalogProductsData,
          transaction as PrismaClient
        );

        // 3.3: Create address
        const locationAddressId = await createCatalogAddressTransactional(
          catalogListingItem,
          transaction as PrismaClient,
          addressData
        );

        if (!locationAddressId) {
          throw new Error("Failed to create address");
        }

        // 3.4: Get listing image IDs from created records
        const listingImageIds = listingImageUrls
          .map((url) => imageUrlToRecord.get(url)?.image_id)
          .filter(Boolean) as string[];

        // 3.5: Create catalog listing

        const catalogListing = await createCatalogListingTransactional(
          catalogListingItem,
          config,
          locationAddressId,
          listingImageIds,
          imageUrlToRecord.get(listingImageUrls[0])?.image_url,
          catalogListingWorksheet,
          listingRowIndex,
          transaction as PrismaClient
        );

        // 3.6: Create products and link to images
        await processProductsInParallel(
          sortedProducts,
          catalogListing.catalog_listing_id,
          brandCacheMap,
          catalogProductsWorksheet,
          transaction as PrismaClient,
          ctx,
          imageUrlToRecord
        );

        console.log(`Transaction completed for: ${catalogListingItem.NAME}`);
      },
      {
        maxWait: 120000, // 2 minutes max wait
        timeout: 90000, // 90 seconds timeout
      }
    );
  } catch (error) {
    console.error(`Processing failed for: ${catalogListingItem.NAME}`, error);

    // Cleanup S3 objects if transaction failed
    if (ctx.uploadedS3Keys.length > 0) {
      console.log(
        `CLEANUP: Deleting ${ctx.uploadedS3Keys.length} orphaned S3 objects...`
      );
      await ParallelImageProcessor.cleanupS3Objects(
        ctx.uploadedS3Keys,
        config.imageBucketName
      );
      console.log(
        `Cleanup completed: ${ctx.uploadedS3Keys.length} S3 objects deleted`
      );
    }

    throw error;
  }
}

/**
 * Extract and validate image URLs from listing data
 */
async function extractAndValidateImageUrls(
  catalogListingItem: CatalogOfferListingData
): Promise<string[]> {
  const imageUrls = extractImageUrls(catalogListingItem);

  const validationResults = await Promise.all(
    imageUrls.map(async (url) => {
      try {
        new URL(url);
        return url;
      } catch {
        console.warn(`Invalid image URL: ${url}`);
        return null;
      }
    })
  );

  return validationResults.filter(Boolean) as string[];
}

/**
 * Extract all product image URLs in parallel
 */
async function extractAllProductImageUrls(
  catalogProductsData: CatalogProductData[]
): Promise<string[]> {
  const allImageUrls: string[] = [];

  const imageUrlArrays = await Promise.all(
    catalogProductsData.map(async (product) => {
      return extractImageUrls(product);
    })
  );

  imageUrlArrays.forEach((urls) => allImageUrls.push(...urls));
  return [...new Set(allImageUrls)];
}

/**
 * Pre-create all variant attributes to avoid race conditions
 */
async function preCreateVariantAttributes(
  sortedProducts: {
    parents: CatalogProductData[];
    children: CatalogProductData[];
  },
  transaction: PrismaClient
): Promise<void> {
  // Collect all unique variation themes
  const allProducts = [...sortedProducts.parents, ...sortedProducts.children];
  const uniqueVariationThemes = new Set<string>();

  allProducts.forEach((product) => {
    if (product.VARIATION_THEME) {
      uniqueVariationThemes.add(product.VARIATION_THEME.toLowerCase());
    }
  });

  if (uniqueVariationThemes.size === 0) {
    return; // No variant attributes needed
  }

  console.log(
    `Pre-creating ${uniqueVariationThemes.size} variant attributes...`
  );

  // Check which ones already exist
  const existingAttributes = await transaction.variant_attributes.findMany({
    where: {
      name: {
        in: Array.from(uniqueVariationThemes),
      },
    },
    select: { name: true },
  });

  const existingNames = new Set(existingAttributes.map((attr) => attr.name));
  const attributesToCreate = Array.from(uniqueVariationThemes).filter(
    (name) => !existingNames.has(name)
  );

  if (attributesToCreate.length === 0) {
    console.log("All variant attributes already exist");
    return;
  }

  // Create all missing attributes in a single batch operation
  const attributeCreateData = attributesToCreate.map((name) => {
    // Find the original case version for display_name
    const originalCase =
      allProducts.find((p) => p.VARIATION_THEME?.toLowerCase() === name)
        ?.VARIATION_THEME || name.toUpperCase();

    return {
      variant_attribute_id: uuidv4(),
      name: name,
      display_name: originalCase,
      attribute_type:
        fileToDbVariationBiMap.getValue(originalCase.toUpperCase()) || "STYLE",
      is_required: false,
      sort_order: 0,
      is_active: true,
      created_at: new Date(),
    };
  });

  try {
    await transaction.variant_attributes.createMany({
      data: attributeCreateData,
      skipDuplicates: true, // Ensures no duplicates if race condition occurs
    });

    console.log(
      `Successfully pre-created ${attributesToCreate.length} variant attributes`
    );
  } catch (error: any) {
    // If createMany fails due to race condition, that's okay - they exist now
    if (error.code === "P2002") {
      console.log(
        "Some variant attributes were created by another process, continuing..."
      );
    } else {
      throw error;
    }
  }
}

/**
 * Pre-validate and prepare address data
 */
async function prepareAddressData(
  catalogListingItem: CatalogOfferListingData
): Promise<any> {
  const address1 = S3DataTransformer.sanitizeString(
    catalogListingItem.WAREHOUSE_LOCATION_ADDRESS1
  );
  const city = S3DataTransformer.sanitizeString(
    catalogListingItem.WAREHOUSE_LOCATION_CITY
  );

  if (!address1 || !city) {
    throw new Error("Missing required address information");
  }

  return {
    address1,
    address2: S3DataTransformer.sanitizeString(
      catalogListingItem.WAREHOUSE_LOCATION_ADDRESS2
    ),
    address3: S3DataTransformer.sanitizeString(
      catalogListingItem.WAREHOUSE_LOCATION_ADDRESS3
    ),
    city,
    province: S3DataTransformer.sanitizeString(
      catalogListingItem.WAREHOUSE_LOCATION_STATE
    ),
    country: S3DataTransformer.sanitizeString(
      catalogListingItem.WAREHOUSE_LOCATION_COUNTRY
    ),
    zip: S3DataTransformer.sanitizeString(
      catalogListingItem.WAREHOUSE_LOCATION_ZIPCODE
    ),
  };
}

/**
 * Extract and cache all brand names in parallel
 */
/**
 * Extract and cache all brand names with race condition protection
 */
async function extractAndCacheBrandNames(
  catalogProductsData: CatalogProductData[],
  transaction: PrismaClient
): Promise<Map<string, string>> {
  const brandNames = [
    ...new Set(
      catalogProductsData
        .map((product) => S3DataTransformer.sanitizeString(product.BRAND))
        .filter(Boolean) as string[]
    ),
  ];

  console.log(`Processing ${brandNames.length} unique brands...`);

  // STEP 1: Check which brands already exist
  const existingBrands = await transaction.brands.findMany({
    where: {
      brand_name: { in: brandNames },
    },
    select: { brand_name: true, brand_id: true },
  });

  const existingBrandMap = new Map(
    existingBrands.map((brand) => [brand.brand_name, brand.brand_id])
  );

  const newBrandNames = brandNames.filter(
    (name) => !existingBrandMap.has(name)
  );

  // STEP 2: Create missing brands in batch (race condition safe)
  if (newBrandNames.length > 0) {
    console.log(`Creating ${newBrandNames.length} new brands...`);

    const newBrandData = newBrandNames.map((brandName) => ({
      brand_id: uuidv4(),
      brand_name: brandName,
      created_at: new Date(),
    }));

    try {
      await transaction.brands.createMany({
        data: newBrandData,
        skipDuplicates: true, // Handles race conditions gracefully
      });

      console.log(`Successfully created ${newBrandNames.length} brands`);
    } catch (error: any) {
      // If race condition still occurs, that's okay - brands exist now
      if (error.code === "P2002") {
        console.log(
          "Some brands were created by another process, continuing..."
        );
      } else {
        throw error;
      }
    }
  }

  // STEP 3: Fetch all brands to ensure we have complete mapping
  const allBrands = await transaction.brands.findMany({
    where: { brand_name: { in: brandNames } },
    select: { brand_name: true, brand_id: true },
  });

  const brandCache = new Map(
    allBrands.map((brand) => [brand.brand_name, brand.brand_id])
  );

  console.log(`Brand cache populated with ${brandCache.size} brands`);
  return brandCache;
}

/**
 * Process products in parallel while respecting parent-child dependencies
 */
async function processProductsInParallel(
  sortedProducts: {
    parents: CatalogProductData[];
    children: CatalogProductData[];
  },
  catalogListingId: string,
  brandCache: Map<string, string>,
  catalogProductsWorksheet: XLSX.WorkSheet,
  transaction: any,
  ctx: TransactionContext,
  imageUrlToRecord: Map<string, any>
): Promise<void> {
  const PRODUCT_CONCURRENCY = 20; // Higher concurrency since no S3 operations

  // PRE-CREATE ALL VARIANT ATTRIBUTES TO AVOID RACE CONDITIONS
  await preCreateVariantAttributes(sortedProducts, transaction);

  console.log(
    `Processing ${sortedProducts.parents.length} parent products in transaction...`
  );

  // Process parents in parallel batches
  for (let i = 0; i < sortedProducts.parents.length; i += PRODUCT_CONCURRENCY) {
    const batch = sortedProducts.parents.slice(i, i + PRODUCT_CONCURRENCY);

    await Promise.all(
      batch.map((product, batchIndex) =>
        processProductParallel(
          product,
          catalogListingId,
          brandCache,
          catalogProductsWorksheet,
          i + batchIndex + 1, // Row index in worksheet
          transaction,
          ctx,
          imageUrlToRecord
        )
      )
    );
  }

  console.log(
    `Processing ${sortedProducts.children.length} child products in transaction...`
  );

  // Process children in parallel batches
  for (
    let i = 0;
    i < sortedProducts.children.length;
    i += PRODUCT_CONCURRENCY
  ) {
    const batch = sortedProducts.children.slice(i, i + PRODUCT_CONCURRENCY);

    await Promise.all(
      batch.map((product, batchIndex) =>
        processProductParallel(
          product,
          catalogListingId,
          brandCache,
          catalogProductsWorksheet,
          sortedProducts.parents.length + i + batchIndex + 1, // Row index after parents
          transaction,
          ctx,
          imageUrlToRecord
        )
      )
    );
  }
}

/**
 * Process a single product with parallel optimizations
 */
async function processProductParallel(
  productItem: CatalogProductData,
  catalogListingId: string,
  brandCache: Map<string, string>,
  catalogProductsWorksheet: XLSX.WorkSheet,
  rowIndex: number,
  transaction: PrismaClient,
  ctx: TransactionContext,
  imageUrlToRecord: Map<string, any>
): Promise<void> {
  if (!productItem.PRODUCT_NAME || !productItem.SKU || !productItem.BRAND) {
    throw new Error(
      `Missing required fields for product: ${productItem.SKU || "unknown"}`
    );
  }

  const brandName = S3DataTransformer.sanitizeString(productItem.BRAND)!;
  const brandId = brandCache.get(brandName);

  if (!brandId) {
    throw new Error(`Brand not found in cache: ${brandName}`);
  }

  // Get pre-processed image data
  const imageUrls = extractImageUrls(productItem);
  const imageIds = imageUrls
    .map((url) => imageUrlToRecord.get(url)?.image_id)
    .filter(Boolean) as string[];
  const publicUrls = imageUrls
    .map((url) => imageUrlToRecord.get(url)?.image_url)
    .filter(Boolean) as string[];

  const isParent = S3DataTransformer.parseBoolean(productItem.IS_PARENT);
  const parentSku = S3DataTransformer.sanitizeString(productItem.PARENT_SKU);
  const hasParentSku = parentSku && parentSku.trim() !== "";

  if (isParent && !hasParentSku) {
    await createParentProductParallel(
      productItem,
      catalogListingId,
      brandId,
      catalogProductsWorksheet,
      rowIndex,
      transaction,
      imageIds,
      publicUrls
    );
  } else if (!isParent && hasParentSku) {
    await createProductVariantParallel(
      productItem,
      catalogListingId,
      brandId,
      catalogProductsWorksheet,
      rowIndex,
      transaction,
      imageIds,
      publicUrls
    );
  } else if (!isParent && !hasParentSku) {
    await createStandaloneProductParallel(
      productItem,
      catalogListingId,
      brandId,
      catalogProductsWorksheet,
      rowIndex,
      transaction,
      imageIds,
      publicUrls
    );
  } else {
    console.warn(
      `Product ${productItem.SKU} marked as parent but has parent SKU. Treating as child.`
    );
    await createProductVariantParallel(
      productItem,
      catalogListingId,
      brandId,
      catalogProductsWorksheet,
      rowIndex,
      transaction,
      imageIds,
      publicUrls
    );
  }
}

/**
 * Create parent product with pre-downloaded images
 */
async function createParentProductParallel(
  productItem: CatalogProductData,
  catalogListingId: string,
  brandId: string,
  worksheet: XLSX.WorkSheet,
  rowIndex: number,
  transaction: PrismaClient,
  imageIds: string[],
  publicUrls: string[]
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

  // Extract currencies
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
    catalog_listings: { connect: { catalog_listing_id: catalogListingId } },
    title: S3DataTransformer.sanitizeString(productItem.PRODUCT_NAME)!,
    description: S3DataTransformer.sanitizeString(productItem.DESCRIPTION),
    category: fileToDbCategoryBiMap.getValue(productItem.CATEGORY!),
    subcategory: mapSubcategory(productItem.SUBCATEGORY),
    brands: { connect: { brand_id: brandId } },
    product_condition: fileToDbConditionBiMap.getValue(productItem.CONDITION),
    cosmetic_condition: S3DataTransformer.sanitizeString(
      productItem.COSMETIC_CONDITION
    ),
    packaging: fileToDbPackagingBiMap.getValue(productItem.PACKAGING),
    default_image_url: publicUrls.length > 0 ? publicUrls[0] : null,
    sku: productItem.SKU,
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

  const catalogProduct = await transaction.catalog_products.create({
    data: productData,
  });

  if (imageIds.length > 0) {
    const productImagesInputs: Prisma.catalog_product_imagesCreateManyInput[] =
      imageIds.map((imageId) => ({
        catalog_product_image_id: uuidv4(),
        catalog_product_id: catalogProduct.catalog_product_id!,
        image_id: imageId!,
      }));

    await transaction.catalog_product_images.createMany({
      skipDuplicates: true,
      data: productImagesInputs,
    });
  }

  console.log(`Created parent product: ${catalogProduct.sku}`);
}

/**
 * Create standalone product (both parent and variant)
 */
async function createStandaloneProductParallel(
  productItem: CatalogProductData,
  catalogListingId: string,
  brandId: string,
  worksheet: XLSX.WorkSheet,
  rowIndex: number,
  transaction: PrismaClient,
  imageIds: string[],
  publicUrls: string[]
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

  // Extract currencies
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

  // Create parent product
  const parentProduct = await transaction.catalog_products.create({
    data: {
      catalog_product_id: uuidv4(),
      catalog_listings: { connect: { catalog_listing_id: catalogListingId } },
      title: S3DataTransformer.sanitizeString(productItem.PRODUCT_NAME)!,
      description: S3DataTransformer.sanitizeString(productItem.DESCRIPTION),
      category: fileToDbCategoryBiMap.getValue(productItem.CATEGORY!),
      subcategory: mapSubcategory(productItem.SUBCATEGORY),
      brands: { connect: { brand_id: brandId } },
      product_condition: fileToDbConditionBiMap.getValue(productItem.CONDITION),
      cosmetic_condition: S3DataTransformer.sanitizeString(
        productItem.COSMETIC_CONDITION
      ),
      packaging: fileToDbPackagingBiMap.getValue(productItem.PACKAGING),
      default_image_url: publicUrls.length > 0 ? publicUrls[0] : null,
      sku: `${productItem.SKU}-PARENT`,
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
    },
  });

  // Create variant and link images in parallel
  const [variant] = await Promise.all([
    transaction.catalog_product_variants.create({
      data: {
        catalog_product_variant_id: uuidv4(),
        catalog_products: {
          connect: { catalog_product_id: parentProduct.catalog_product_id },
        },
        variant_sku: productItem.SKU,
        variant_name: "Default",
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
        identifier: S3DataTransformer.sanitizeString(productItem.IDENTIFIER),
        identifier_type: productItem.IDENTIFIER_TYPE
          ? fileToDbIdentifierTypeBiMap.getValue(productItem.IDENTIFIER_TYPE)
          : null,
        part_number: S3DataTransformer.sanitizeString(productItem.MPN),
        default_image_url: publicUrls.length > 0 ? publicUrls[0] : null,
        product_condition: fileToDbConditionBiMap.getValue(
          productItem.CONDITION
        ),
        cosmetic_condition: S3DataTransformer.sanitizeString(
          productItem.COSMETIC_CONDITION
        ),
        packaging: fileToDbPackagingBiMap.getValue(productItem.PACKAGING),
        accessories: S3DataTransformer.sanitizeString(productItem.ACCESSORIES),
        is_hazmat: S3DataTransformer.parseBoolean(productItem.HAZMAT),
        is_active: true,
        sort_order: 0,
        created_at: new Date(),
      },
    }),

    // Link parent product images
    imageIds.length > 0
      ? transaction.catalog_product_images.createMany({
          skipDuplicates: true,
          data: imageIds.map((imageId) => ({
            catalog_product_image_id: uuidv4(),
            catalog_product_id: parentProduct.catalog_product_id!,
            image_id: imageId!,
          })),
        })
      : Promise.resolve(null),
  ]);

  // Link variant images
  if (imageIds.length > 0) {
    await transaction.catalog_product_variant_images.createMany({
      data: imageIds.map((imageId, index) => ({
        catalog_product_variant_image_id: uuidv4(),
        catalog_product_variant_id: variant.catalog_product_variant_id,
        image_id: imageId,
        sort_order: index,
        is_primary: index === 0,
        created_at: new Date(),
      })),
      skipDuplicates: true,
    });
  }

  console.log(
    `Created standalone product: ${parentProduct.sku} with variant: ${variant.variant_sku}`
  );
}

/**
 * Create product variant
 */
async function createProductVariantParallel(
  productItem: CatalogProductData,
  catalogListingId: string,
  brandId: string,
  worksheet: XLSX.WorkSheet,
  rowIndex: number,
  transaction: PrismaClient,
  imageIds: string[],
  publicUrls: string[]
): Promise<void> {
  const parentSku = S3DataTransformer.sanitizeString(productItem.PARENT_SKU)!;

  const parentProduct = await transaction.catalog_products.findFirst({
    where: {
      sku: parentSku,
      catalog_listing_id: catalogListingId,
    },
  });

  if (!parentProduct) {
    throw new Error(`Parent product with SKU ${parentSku} not found`);
  }

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

  // Extract currencies
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

  const variant = await transaction.catalog_product_variants.create({
    data: {
      catalog_product_variant_id: uuidv4(),
      catalog_products: {
        connect: { catalog_product_id: parentProduct.catalog_product_id },
      },
      variant_sku: productItem.SKU,
      variant_name: S3DataTransformer.sanitizeString(
        productItem.VARIATION_VALUE
      ),
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
      identifier: S3DataTransformer.sanitizeString(productItem.IDENTIFIER),
      identifier_type: productItem.IDENTIFIER_TYPE
        ? fileToDbIdentifierTypeBiMap.getValue(productItem.IDENTIFIER_TYPE)
        : null,
      part_number: S3DataTransformer.sanitizeString(productItem.MPN),
      default_image_url: publicUrls.length > 0 ? publicUrls[0] : null,
      product_condition: fileToDbConditionBiMap.getValue(productItem.CONDITION),
      cosmetic_condition: S3DataTransformer.sanitizeString(
        productItem.COSMETIC_CONDITION
      ),
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
    },
  });

  // Create variant attributes and link images in parallel
  const postVariantTasks: Promise<any>[] = [];

  if (productItem.VARIATION_THEME && productItem.VARIATION_VALUE) {
    postVariantTasks.push(
      createVariantAttributesParallel(
        variant.catalog_product_variant_id,
        productItem.VARIATION_THEME,
        productItem.VARIATION_VALUE,
        transaction
      )
    );
  }

  if (imageIds.length > 0) {
    postVariantTasks.push(
      transaction.catalog_product_variant_images.createMany({
        data: imageIds.map((imageId, index) => ({
          catalog_product_variant_image_id: uuidv4(),
          catalog_product_variant_id: variant.catalog_product_variant_id,
          image_id: imageId,
          sort_order: index,
          is_primary: index === 0,
          created_at: new Date(),
        })),
        skipDuplicates: true,
      })
    );
  }

  if (postVariantTasks.length > 0) {
    await Promise.all(postVariantTasks);
  }

  console.log(`Created product variant: ${variant.variant_sku}`);
}

/**
 * Create variant attributes with race condition protection
 */
async function createVariantAttributesParallel(
  variantId: string,
  variationTheme: string,
  variationValue: string,
  transaction: any
): Promise<void> {
  const attributeName = variationTheme.toLowerCase();

  // Since we pre-created all attributes, just find the existing one
  const variantAttribute = await transaction.variant_attributes.findUnique({
    where: { name: attributeName },
  });

  if (!variantAttribute) {
    // This should never happen if pre-creation worked correctly
    throw new Error(
      `Variant attribute '${attributeName}' not found. ` +
        `Pre-creation may have failed.`
    );
  }

  // Create the variant attribute relationship
  try {
    await transaction.catalog_product_variant_attributes.create({
      data: {
        catalog_product_variant_attribute_id: uuidv4(),
        catalog_product_variant_id: variantId,
        variant_attribute_id: variantAttribute.variant_attribute_id,
        attribute_value: variationValue.toLowerCase(),
        created_at: new Date(),
      },
    });

    console.log(
      `Linked variant attribute: ${variationTheme} = ${variationValue}`
    );
  } catch (error: any) {
    if (error.code === "P2002") {
      // Duplicate relationship - this variant already has this attribute
      console.log(
        `Variant attribute relationship already exists: ${variationTheme} = ${variationValue}`
      );
    } else {
      throw error;
    }
  }
}

/**
 * Create catalog listing with optimized operations
 */
async function createCatalogListingTransactional(
  catalogItem: CatalogOfferListingData,
  config: S3CatalogImportConfig,
  locationAddressId: string,
  imageIds: string[],
  defaultImageUrl: string | undefined,
  worksheet: XLSX.WorkSheet,
  rowIndex: number,
  transaction: PrismaClient
): Promise<any> {
  // Duplicate check
  const duplicateCheck = await checkForDuplicateListing(
    catalogItem,
    config.sellerUserId,
    transaction
  );

  if (duplicateCheck.isDuplicate) {
    const existing = duplicateCheck.existingListing!;
    throw new Error(
      `Possible duplicate listing detected!\n` +
        `Title: "${S3DataTransformer.sanitizeString(catalogItem.NAME)}"\n` +
        `Existing listing: "${existing.title}" (ID: ${existing.public_id})\n` +
        `Created: ${existing.created_at}\n` +
        `Status: ${existing.status}\n\n` +
        `This listing appears to be very similar to an existing one.`
    );
  }

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

  // Extract currency for minimum order value
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
    seller_profiles: { connect: { seller_profile_id: config.sellerProfileId } },
    users: { connect: { user_id: config.sellerUserId } },
    title: S3DataTransformer.sanitizeString(catalogItem.NAME)!,
    sub_heading: S3DataTransformer.sanitizeString(catalogItem.SUBHEADER),
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
    default_image_url: defaultImageUrl || null,
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
    addresses: { connect: { address_id: locationAddressId } },
    is_private: config.isPrivate || false,
    duplicate_check_hash: duplicateCheckHash,
    created_at: new Date(),
  };

  const catalogListing = await transaction.catalog_listings.create({
    data: catalogListingData,
  });

  // Create listing-image relationships and visibility rules in parallel
  const postListingTasks: Promise<any>[] = [];

  if (config.visibilityRules) {
    postListingTasks.push(
      createCatalogVisibilityRulesParallel(
        catalogListing.catalog_listing_id,
        config.visibilityRules,
        transaction
      )
    );
  }

  if (imageIds.length > 0) {
    const catalogImagesInputs: Prisma.catalog_listing_imagesCreateManyInput[] =
      imageIds.map((imageId) => ({
        catalog_listing_image_id: uuidv4(),
        catalog_listing_id: catalogListing.catalog_listing_id!,
        image_id: imageId!,
      }));

    postListingTasks.push(
      transaction.catalog_listing_images.createMany({
        skipDuplicates: true,
        data: catalogImagesInputs,
      })
    );
  }

  if (postListingTasks.length > 0) {
    await Promise.all(postListingTasks);
  }

  console.log(`Created catalog listing: ${catalogListing.catalog_listing_id}`);
  return catalogListing;
}

/**
 * Create visibility rules with parallel optimization
 */
async function createCatalogVisibilityRulesParallel(
  catalogListingId: string,
  visibilityRules: NonNullable<S3CatalogImportConfig["visibilityRules"]>,
  transaction: PrismaClient
): Promise<void> {
  const rules: Prisma.catalog_listing_visibility_rulesCreateManyInput[] = [];

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
    await transaction.catalog_listing_visibility_rules.createMany({
      data: rules,
      skipDuplicates: true,
    });
    console.log(`Created ${rules.length} visibility rules for catalog listing`);
  }
}

/**
 * Create address with pre-validated data
 */
async function createCatalogAddressTransactional(
  catalogOfferListingData: CatalogOfferListingData,
  transaction: PrismaClient,
  addressData: any
): Promise<string> {
  try {
    const address = await transaction.addresses.create({
      data: {
        address_id: uuidv4(),
        address1: addressData.address1,
        address2: addressData.address2,
        address3: addressData.address3,
        city: addressData.city,
        province: addressData.province,
        province_code: S3DataTransformer.sanitizeString(
          catalogOfferListingData.WAREHOUSE_LOCATION_STATE_CODE
        ),
        country: addressData.country,
        country_code: S3DataTransformer.sanitizeString(
          catalogOfferListingData.WAREHOUSE_LOCATION_COUNTRY_CODE
        ),
        zip: addressData.zip,
        created_at: new Date(),
      },
    });

    console.log(`Created address: ${address.address_id}`);
    return address.address_id;
  } catch (error) {
    console.error("Failed to create address", error);
    throw error;
  }
}

/**
 * Sort products by parent-child relationship for optimal processing
 */
function sortProductsByParentChild(catalogProductsData: CatalogProductData[]): {
  parents: CatalogProductData[];
  children: CatalogProductData[];
} {
  const parents: CatalogProductData[] = [];
  const children: CatalogProductData[] = [];

  for (const productItem of catalogProductsData) {
    const isParent = S3DataTransformer.parseBoolean(productItem.IS_PARENT);
    const hasParentSku =
      productItem.PARENT_SKU && productItem.PARENT_SKU.trim() !== "";

    if (isParent && !hasParentSku) {
      parents.push(productItem);
    } else if (!isParent && hasParentSku) {
      children.push(productItem);
    } else if (!isParent && !hasParentSku) {
      parents.push(productItem);
    } else {
      console.warn(
        `Product ${productItem.SKU} marked as parent but has parent SKU. Treating as child.`
      );
      children.push(productItem);
    }
  }

  return { parents, children };
}

// Helper functions
function parsePositiveDecimal(
  value: any,
  precision: number = 4
): number | undefined {
  const parsed = S3DataTransformer.parseDecimal(value, precision);
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

/**
 * Generate a hash for duplicate detection
 */
function generateDuplicateCheckHash(
  catalogItem: CatalogOfferListingData
): string {
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

  const hashInput = [
    title,
    description,
    category,
    subcategory,
    condition,
    packaging,
  ].join("|");
  return crypto.createHash("sha256").update(hashInput, "utf8").digest("hex");
}

/**
 * Check for potential duplicate listings
 */
async function checkForDuplicateListing(
  catalogItem: CatalogOfferListingData,
  sellerUserId: string,
  transaction: PrismaClient
): Promise<{ isDuplicate: boolean; existingListing?: any }> {
  const duplicateHash = generateDuplicateCheckHash(catalogItem);

  const existingListing = await transaction.catalog_listings.findFirst({
    where: {
      seller_user_id: sellerUserId,
      duplicate_check_hash: duplicateHash,
      status: { in: ["ACTIVE", "DRAFT"] },
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

/**
 * S3 Cleanup utility
 */
export async function cleanupS3Objects(
  s3Keys: string[],
  bucketName: string
): Promise<void> {
  if (s3Keys.length === 0) return;

  const { S3Client, DeleteObjectsCommand } = await import("@aws-sdk/client-s3");

  const s3Client = new S3Client({ region: "us-east-1" });

  try {
    const batchSize = 1000;
    for (let i = 0; i < s3Keys.length; i += batchSize) {
      const batch = s3Keys.slice(i, i + batchSize);

      const deleteCommand = new DeleteObjectsCommand({
        Bucket: bucketName,
        Delete: {
          Objects: batch.map((key) => ({ Key: key })),
          Quiet: true,
        },
      });

      await s3Client.send(deleteCommand);
      console.log(`Deleted ${batch.length} S3 objects from cleanup`);
    }
  } catch (error) {
    console.error("Failed to cleanup S3 objects:", error);
  }
}
