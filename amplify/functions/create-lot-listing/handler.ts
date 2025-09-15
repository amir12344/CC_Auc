import { env } from "$amplify/env/create-lot-listing";
import { AppSyncIdentityCognito } from "aws-lambda";
import { Country, State } from "country-state-city";
import { v4 as uuidv4 } from "uuid";
import * as XLSX from "xlsx";

import type { Schema } from "../../data/resource";
import {
  fileToDbCategoryBiMap,
  fileToDbConditionBiMap,
  fileToDbLengthUnitTypeBiMap,
  fileToDbSubcategoryBiMap,
  fileToDbWeightUnitTypeBiMap,
} from "../commons/converters/ListingTypeConverter";
import { importModuleFromLayer } from "../commons/importLayer";
import {
  S3DataTransformer,
  S3FileHandler,
} from "../commons/operations/listings/ListingOperations";
import { LotImageProcessor } from "../commons/operations/listings/LotImageProcessor";
import { UserDatabaseOperations } from "../commons/operations/users/UserDatabaseOperations";
import { ManifestData } from "../commons/types/AuctionListingFileTypes";
import { ExcelCurrencyExtractor } from "../commons/utilities/ExcelCurrencyExtractor";
import {
  freight_type,
  length_type,
  listing_source_name,
  load_type,
  lot_packaging_type,
  PrismaClient,
  shipping_type,
  weight_type,
} from "../lambda-layers/core-layer/nodejs/prisma/generated/client";

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
    lotListing: {
      lotListingId: string;
      publicId: string;
    };
    manifest?: {
      totalItems: number;
      processedItems: number;
      skippedItems: number;
      uniqueBrands: number;
    };
    performance: {
      totalDurationMs: number;
      totalDurationSeconds: number;
    };
  };
  message: string;
}

export const handler: Schema["createLotListing"]["functionHandler"] = async (
  event
) => {
  console.log(`EVENT: ${JSON.stringify(event)}`);
  const cognitoId = (event.identity as AppSyncIdentityCognito).sub;
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
    const {
      title,
      shortTitle,
      subHeading,
      description,
      shortDescription,
      listingLabel,
      listingType,
      sourceType,
      sourceName,
      categories,
      subcategories,
      categoryPercentEstimates,
      defaultImageUrl,
      lotCondition,
      cosmeticCondition,
      sampleSkuDetails,
      manifestSnapshotFileS3Key,
      manifestFileS3Key,
      loadType,
      expiryDate,
      totalUnits,
      estimatedCasePacks,
      pieceCount,
      estimatedRetailValue,
      estimatedRetailValueCurrency,
      askingPrice,
      askingPriceCurrency,
      shippingCost,
      shippingCostCurrency,
      estimatedWeight,
      weightType,
      locationAddress,
      lotShippingType,
      lotFreightType,
      lotPackaging,
      numberOfPallets,
      palletSpaces,
      palletLength,
      palletWidth,
      palletHeight,
      palletDimensionType,
      palletStackable,
      numberOfTruckloads,
      numberOfShipments,
      isRefrigerated,
      isFdaRegistered,
      isHazmat,
      isPrivate,
      resaleRequirement,
      accessories,
      inspectionStatus,
      sellerNotes,
      shippingNotes,
      additionalInformation,
      offerRequirements,
      images,
      tags,
      visibilityRules,
    } = event.arguments;

    if (!cognitoId || cognitoId.trim() === "") {
      return JSON.stringify({
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication required",
        },
      } as ErrorResponse);
    }

    // Validate required fields
    if (!title || title.trim() === "") {
      return JSON.stringify({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Title is required",
        },
      } as ErrorResponse);
    }

    // Validate category percent estimates if provided
    if (categoryPercentEstimates && categoryPercentEstimates.length > 0) {
      const totalPercent = categoryPercentEstimates.reduce((sum, item) => {
        if (
          !item ||
          typeof item.percent !== "number" ||
          item.percent < 0 ||
          item.percent > 100
        ) {
          return NaN;
        }
        if (!item.category && !item.subcategory) {
          return NaN;
        }
        return sum + item.percent;
      }, 0);

      if (isNaN(totalPercent)) {
        return JSON.stringify({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message:
              "Invalid category percentage data. Each entry must have a valid percent (0-100) and either category or subcategory.",
          },
        } as ErrorResponse);
      }

      if (Math.abs(totalPercent - 100) > 0.01) {
        return JSON.stringify({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: `Category percentages must sum to 100%. Current total: ${totalPercent}%`,
          },
        } as ErrorResponse);
      }
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

    // Get seller profile for the user
    const sellerProfile = await prismaClient.seller_profiles.findFirst({
      where: { user_id: user.user_id },
    });

    if (!sellerProfile) {
      return JSON.stringify({
        success: false,
        error: {
          code: "SELLER_PROFILE_NOT_FOUND",
          message: "Seller profile not found for the authenticated user",
        },
      });
    }

    // Process locationAddress to create address record if provided
    let locationAddressId: string | undefined;
    let countryCode: string | undefined;
    let provinceCode: string | undefined;

    if (locationAddress) {
      countryCode = locationAddress.countryCode || undefined;
      provinceCode = locationAddress.provinceCode || undefined;
      const { country, province } = locationAddress;

      // Auto-set countryCode from country name if missing
      if (country && !countryCode) {
        const countryData = Country.getAllCountries().find(
          (c) =>
            c.name.toLowerCase() === country.toLowerCase() ||
            c.name.toLowerCase().includes(country.toLowerCase()) ||
            country.toLowerCase().includes(c.name.toLowerCase())
        );
        if (countryData) {
          countryCode = countryData.isoCode;
        }
      }

      // Auto-set provinceCode from province name if missing (requires countryCode)
      if (province && !provinceCode && countryCode) {
        const stateData = State.getStatesOfCountry(countryCode).find(
          (s) =>
            s.name.toLowerCase() === province.toLowerCase() ||
            s.name.toLowerCase().includes(province.toLowerCase()) ||
            province.toLowerCase().includes(s.name.toLowerCase())
        );
        if (stateData) {
          provinceCode = stateData.isoCode;
        }
      }
    }

    // Execute all database operations in a single transaction
    const result = await prismaClient.$transaction(async (tx) => {
      // Create address record if locationAddress is provided
      if (locationAddress) {
        const newAddress = await tx.addresses.create({
          data: {
            first_name: locationAddress.firstName,
            last_name: locationAddress.lastName,
            address1: locationAddress.address1,
            address2: locationAddress.address2,
            address3: locationAddress.address3,
            city: locationAddress.city,
            province: locationAddress.province,
            province_code: provinceCode,
            country: locationAddress.country,
            country_code: countryCode,
            zip: locationAddress.zip,
            phone: locationAddress.phone,
            company: locationAddress.company,
            latitude: locationAddress.latitude,
            longitude: locationAddress.longitude,
          },
        });
        locationAddressId = newAddress.address_id;
      }

      // Create the lot listing
      const newLotListing = await tx.lot_listings.create({
        data: {
          seller_profile_id: sellerProfile.seller_profile_id,
          seller_user_id: user.user_id,
          title,
          short_title: shortTitle,
          sub_heading: subHeading,
          description,
          short_description: shortDescription,
          listing_label: listingLabel,
          listing_type: listingType,
          source_type: sourceType,
          source_name: sourceName! as listing_source_name,
          category: categories?.[0],
          category2: categories?.[1],
          category3: categories?.[2],
          category4: categories?.[3],
          category5: categories?.[4],
          subcategory: subcategories?.[0],
          subcategory2: subcategories?.[1],
          subcategory3: subcategories?.[2],
          subcategory4: subcategories?.[3],
          subcategory5: subcategories?.[4],
          category_percent_estimates: categoryPercentEstimates
            ? JSON.parse(JSON.stringify(categoryPercentEstimates))
            : undefined,
          default_image_url: defaultImageUrl,
          lot_condition: lotCondition,
          cosmetic_condition: cosmeticCondition,
          sample_sku_details: sampleSkuDetails,
          manifest_snapshot_file_s3_key: manifestSnapshotFileS3Key,
          load_type: loadType! as load_type,
          expiry_date: expiryDate,
          total_units: totalUnits,
          estimated_case_packs: estimatedCasePacks,
          piece_count: pieceCount,
          estimated_retail_value: estimatedRetailValue,
          estimated_retail_value_currency: estimatedRetailValueCurrency,
          asking_price: askingPrice,
          asking_price_currency: askingPriceCurrency,
          shipping_cost: shippingCost,
          shipping_cost_currency: shippingCostCurrency,
          estimated_weight: estimatedWeight,
          weight_type: weightType as weight_type,
          location_address_id: locationAddressId,
          lot_shipping_type: lotShippingType as shipping_type,
          lot_freight_type: lotFreightType as freight_type,
          lot_packaging: lotPackaging as lot_packaging_type,
          number_of_pallets: numberOfPallets,
          pallet_spaces: palletSpaces,
          pallet_length: palletLength,
          pallet_width: palletWidth,
          pallet_height: palletHeight,
          pallet_dimension_type: palletDimensionType as length_type,
          pallet_stackable: palletStackable,
          number_of_truckloads: numberOfTruckloads,
          number_of_shipments: numberOfShipments,
          is_refrigerated: isRefrigerated,
          is_fda_registered: isFdaRegistered,
          is_hazmat: isHazmat,
          is_private: isPrivate,
          resale_requirement: resaleRequirement,
          accessories,
          inspection_status: inspectionStatus,
          seller_notes: sellerNotes,
          shipping_notes: shippingNotes,
          additional_information: additionalInformation,
          offer_requirements: offerRequirements,
          status: "DRAFT", // Default status
        },
      });

      // Create images if provided
      if (images && images.length > 0) {
        // Filter and map images with their metadata
        const imageData = images
          .filter((image) => image && image.imageS3Key)
          .map((image) => ({
            s3Key: image!.imageS3Key,
            sortOrder: image!.sortOrder || 0,
          }));

        if (imageData.length > 0) {
          // Initialize the image processor
          const imageProcessor = new LotImageProcessor({
            region: "us-east-1", // or get from env
            bucketName: env.COMMERCE_CENTRAL_IMAGES_BUCKET_NAME,
            userPublicId: user.public_id,
          });

          // Process images: download, compress, upload to Lot folder, and create database records
          const processedImages = await imageProcessor.processImagesForLot(
            imageData,
            tx as PrismaClient
          );

          // Create associations between lot listing and processed images
          if (processedImages.length > 0) {
            await tx.lot_listing_images.createMany({
              data: processedImages.map((processedImage) => ({
                lot_listing_id: newLotListing.lot_listing_id,
                image_id: processedImage.imageId,
              })),
            });
          }
        }
      }

      // Create tags if provided
      if (tags && tags.length > 0) {
        const tagAssociations: { lot_listing_id: string; tag_id: string }[] =
          [];

        for (const tagName of tags) {
          if (tagName && tagName.trim()) {
            // Generate slug for tag
            const slug = tagName
              .toLowerCase()
              .replace(/\s+/g, "-")
              .replace(/[^a-z0-9-]/g, "");

            // Use upsert to find existing tag or create new one
            const tagRecord = await tx.tags.upsert({
              where: { slug },
              update: {}, // Don't update anything if found
              create: {
                name: tagName.trim(),
                slug,
                is_active: true,
                usage_count: 0,
              },
            });

            // Collect associations for batch creation
            tagAssociations.push({
              lot_listing_id: newLotListing.lot_listing_id,
              tag_id: tagRecord.tag_id,
            });
          }
        }

        // Create all tag associations at once
        if (tagAssociations.length > 0) {
          await tx.lot_listing_tags.createMany({
            data: tagAssociations,
          });
        }
      }

      // Create visibility rules if provided
      if (visibilityRules) {
        // Handle buyer segments
        if (
          visibilityRules.buyer_segments &&
          visibilityRules.buyer_segments.length > 0
        ) {
          for (const segment of visibilityRules.buyer_segments) {
            if (segment && segment.trim()) {
              await tx.lot_listing_visibility_rules.create({
                data: {
                  lot_listing_id: newLotListing.lot_listing_id,
                  rule_type: "BUYER_SEGMENT",
                  rule_value: segment.trim(),
                  is_inclusion: true,
                },
              });
            }
          }
        }

        // Handle locations
        if (visibilityRules.locations) {
          const { states, countries, zip_codes, cities } =
            visibilityRules.locations;

          // Handle states
          if (states && states.length > 0) {
            for (const state of states) {
              if (state && state.trim()) {
                await tx.lot_listing_visibility_rules.create({
                  data: {
                    lot_listing_id: newLotListing.lot_listing_id,
                    rule_type: "LOCATION_STATE",
                    rule_value: state.trim(),
                    is_inclusion: true,
                  },
                });
              }
            }
          }

          // Handle countries
          if (countries && countries.length > 0) {
            for (const country of countries) {
              if (country && country.trim()) {
                await tx.lot_listing_visibility_rules.create({
                  data: {
                    lot_listing_id: newLotListing.lot_listing_id,
                    rule_type: "LOCATION_COUNTRY",
                    rule_value: country.trim(),
                    is_inclusion: true,
                  },
                });
              }
            }
          }

          // Handle zip codes
          if (zip_codes && zip_codes.length > 0) {
            for (const zipCode of zip_codes) {
              if (zipCode && zipCode.trim()) {
                await tx.lot_listing_visibility_rules.create({
                  data: {
                    lot_listing_id: newLotListing.lot_listing_id,
                    rule_type: "LOCATION_ZIP",
                    rule_value: zipCode.trim(),
                    is_inclusion: true,
                  },
                });
              }
            }
          }

          // Handle cities
          if (cities && cities.length > 0) {
            for (const city of cities) {
              if (city && city.trim()) {
                await tx.lot_listing_visibility_rules.create({
                  data: {
                    lot_listing_id: newLotListing.lot_listing_id,
                    rule_type: "LOCATION_CITY",
                    rule_value: city.trim(),
                    is_inclusion: true,
                  },
                });
              }
            }
          }
        }
      }

      // Process manifestFileS3Key if provided
      let manifestResult: ManifestProcessingResult | undefined;
      if (manifestFileS3Key) {
        manifestResult = await processManifestFile(
          manifestFileS3Key,
          newLotListing.lot_listing_id,
          tx as PrismaClient
        );
      }

      // Return the created lot listing data
      return {
        lotListingId: newLotListing.lot_listing_id,
        publicId: newLotListing.public_id,
        manifestResult,
      };
    });

    // Calculate performance metrics
    const totalDuration = Date.now() - startTime;
    const durationSeconds = totalDuration / 1000;

    // Return success response with the created lot listing's public ID
    return JSON.stringify({
      success: true,
      data: {
        lotListing: {
          lotListingId: result.lotListingId,
          publicId: result.publicId,
        },
        manifest: result.manifestResult,
        performance: {
          totalDurationMs: totalDuration,
          totalDurationSeconds: parseFloat(durationSeconds.toFixed(2)),
        },
      },
      message: `Lot listing created successfully${result.manifestResult ? ` with ${result.manifestResult.processedItems} manifest items processed` : ""}`,
    } as SuccessResponse);
  } catch (err) {
    console.error("Error creating lot listing:", err);

    // Calculate performance metrics for error response
    const totalDuration = Date.now() - startTime;
    const durationSeconds = (totalDuration / 1000).toFixed(2);

    // Handle specific database errors
    let errorCode = "INTERNAL_ERROR";
    let errorMessage =
      "An internal error occurred while creating the lot listing";

    if (err instanceof Error) {
      if (err.message.includes("Foreign key constraint")) {
        errorCode = "INVALID_REFERENCE";
        errorMessage = "Invalid reference to related data";
      } else if (err.message.includes("Unique constraint")) {
        errorCode = "DUPLICATE_ENTRY";
        errorMessage = "A lot listing with these details already exists";
      } else if (err.message.includes("invalid input")) {
        errorCode = "VALIDATION_ERROR";
        errorMessage = "Invalid input data provided";
      } else if (err.message.includes("manifest")) {
        errorCode = "MANIFEST_PROCESSING_ERROR";
        errorMessage = "Failed to process manifest file";
      }
    }

    return JSON.stringify({
      success: false,
      error: {
        code: errorCode,
        message: errorMessage,
        details: {
          error: err instanceof Error ? err.message : String(err),
          duration: `${durationSeconds} seconds`,
          timestamp: new Date().toISOString(),
          cognitoId,
        },
      },
    } as ErrorResponse);
  }
};

interface ManifestProcessingResult {
  totalItems: number;
  processedItems: number;
  skippedItems: number;
  uniqueBrands: number;
}

/**
 * Processes manifest file from S3 and creates lot listing product manifest records
 */
async function processManifestFile(
  manifestFileS3Key: string,
  lotListingId: string,
  tx: PrismaClient
): Promise<ManifestProcessingResult> {
  console.log(`Processing manifest file from S3: ${manifestFileS3Key}`);

  try {
    // Initialize S3 file handler
    const s3Handler = new S3FileHandler({ region: "us-east-1" });

    // Construct full S3 path
    const manifestS3Path = `s3://${env.COMMERCE_CENTRAL_STORAGE_BUCKET_NAME}/${manifestFileS3Key}`;

    // Download and parse manifest file
    const manifestResult = await s3Handler.parseExcelFromS3(manifestS3Path);
    const manifestData = manifestResult.data as ManifestData[];
    const manifestWorksheet = manifestResult.worksheet;

    console.log(`Found ${manifestData.length} manifest items to process`);

    // Create header map for currency extraction
    const headerMap: Record<string, number> = {};
    const range = manifestWorksheet["!ref"] || "A1";
    const decodedRange = manifestWorksheet["!ref"]
      ? XLSX.utils.decode_range(range)
      : { s: { c: 0 }, e: { c: 0 } };
    for (let col = decodedRange.s.c; col <= decodedRange.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      const cell = manifestWorksheet[cellAddress];
      if (cell && cell.v) {
        headerMap[String(cell.v)] = col;
      }
    }

    // First, get or create all brands using upsert
    const brandMap = new Map<string, string>();
    const uniqueBrands = [
      ...new Set(
        manifestData
          .filter((item) => item.SKU && item.TITLE && item.BRAND)
          .map((item) => S3DataTransformer.sanitizeString(item.BRAND)!)
          .filter(Boolean)
      ),
    ];

    for (const brandName of uniqueBrands) {
      const brand = await tx.brands.upsert({
        where: { brand_name: brandName },
        update: {}, // Don't update anything if found
        create: {
          brand_id: uuidv4(),
          brand_name: brandName,
          created_at: new Date(),
        },
      });
      brandMap.set(brandName, brand.brand_id);
    }

    // Prepare all manifest records for bulk insert
    const manifestRecords: any[] = [];
    const skippedItems: number[] = [];

    for (const [index, manifestItem] of manifestData.entries()) {
      try {
        if (!manifestItem.SKU || !manifestItem.TITLE || !manifestItem.BRAND) {
          console.warn(
            `Skipping manifest row ${index + 1}: Missing required fields (SKU, TITLE, BRAND)`
          );
          skippedItems.push(index + 1);
          continue;
        }

        const brandName = S3DataTransformer.sanitizeString(manifestItem.BRAND);
        const brandId = brandName ? brandMap.get(brandName) : null;

        if (!brandId) {
          console.warn(
            `Skipping manifest row ${index + 1}: Could not find brand ID for ${brandName}`
          );
          skippedItems.push(index + 1);
          continue;
        }

        // Extract currency for retail price
        const retailPriceCurrency =
          ExcelCurrencyExtractor.parseOptionalNumberWithCurrency(
            manifestItem.UNIT_RETAIL
          ) !== undefined
            ? ExcelCurrencyExtractor.extractFieldCurrency(
                manifestWorksheet,
                index + 2, // +2 because Excel is 1-indexed and we skip header
                "UNIT_RETAIL",
                headerMap,
                "USD"
              )
            : "USD";

        // Add to bulk insert array using S3DataTransformer methods
        manifestRecords.push({
          lot_listing_product_manifest_id: uuidv4(),
          lot_listing_id: lotListingId,
          brand_id: brandId,
          sku: manifestItem.SKU, // Keep as-is since it's required
          title: S3DataTransformer.sanitizeString(manifestItem.TITLE)!,
          category: fileToDbCategoryBiMap.getValue(manifestItem.CATEGORY),
          subcategory: fileToDbSubcategoryBiMap.getValue(
            manifestItem.SUBCATEGORY
          ),

          // Identifiers
          identifier: S3DataTransformer.sanitizeString(manifestItem.UPC),
          identifier_type: manifestItem.UPC ? ("UPC" as const) : null,
          external_identifier: S3DataTransformer.sanitizeString(
            manifestItem.ASIN
          ),
          external_identifier_type: manifestItem.ASIN
            ? ("ASIN" as const)
            : null,
          part_number: S3DataTransformer.sanitizeString(manifestItem.MPN),
          model_name: S3DataTransformer.sanitizeString(manifestItem.MODEL),

          // Description and condition
          description: S3DataTransformer.sanitizeString(
            manifestItem.ITEM_DESCRIPTION
          ),
          product_condition: fileToDbConditionBiMap.getValue(
            manifestItem.CONDITION
          ),
          cosmetic_condition: S3DataTransformer.sanitizeString(
            manifestItem.COSMETIC_CONDITION
          ),

          // Quantities and pricing
          available_quantity: S3DataTransformer.parseNumber(
            manifestItem.UNIT_QTY
          ),
          retail_price: ExcelCurrencyExtractor.parseOptionalNumberWithCurrency(
            manifestItem.UNIT_RETAIL
          ),
          retail_price_currency: retailPriceCurrency,

          // Physical properties
          weight: S3DataTransformer.parseDecimal(manifestItem.UNIT_WEIGHT, 2),
          product_weight_type: manifestItem.UNIT_WEIGHT_TYPE
            ? fileToDbWeightUnitTypeBiMap.getValue(
                manifestItem.UNIT_WEIGHT_TYPE
              )
            : null,
          product_length: S3DataTransformer.parseDecimal(
            manifestItem.UNIT_LENGTH,
            2
          ),
          product_width: S3DataTransformer.parseDecimal(
            manifestItem.UNIT_WIDTH,
            2
          ),
          product_height: S3DataTransformer.parseDecimal(
            manifestItem.UNIT_HEIGHT,
            2
          ),
          product_length_type: manifestItem.UNIT_DIMENSION_TYPE
            ? fileToDbLengthUnitTypeBiMap.getValue(
                manifestItem.UNIT_DIMENSION_TYPE
              )
            : null,

          // Additional fields
          lot_id: S3DataTransformer.sanitizeString(manifestItem.LOT_ID),
          pallet_id: S3DataTransformer.sanitizeString(manifestItem.PALLET_ID),
          department: S3DataTransformer.sanitizeString(manifestItem.DEPARTMENT),
          accessories: S3DataTransformer.sanitizeString(
            manifestItem.ACCESSORIES
          ),
          is_hazmat: S3DataTransformer.parseBoolean(manifestItem.HAZMAT),

          created_at: new Date(),
        });
      } catch (manifestError) {
        console.error(
          `Failed to process manifest item ${index + 1}:`,
          manifestError
        );
        skippedItems.push(index + 1);
      }
    }

    // Bulk insert all manifest records
    if (manifestRecords.length > 0) {
      await tx.lot_listing_product_manifests.createMany({
        data: manifestRecords,
      });

      console.log(
        `Successfully bulk inserted ${manifestRecords.length} lot listing product manifest records`
      );
    }

    if (skippedItems.length > 0) {
      console.log(
        `Skipped ${skippedItems.length} manifest items: rows ${skippedItems.join(", ")}`
      );
    }

    console.log(
      `Successfully processed manifest file with ${manifestData.length} items`
    );

    return {
      totalItems: manifestData.length,
      processedItems: manifestRecords.length,
      skippedItems: skippedItems.length,
      uniqueBrands: uniqueBrands.length,
    };
  } catch (manifestError) {
    console.error("Failed to process manifest file:", manifestError);
    // Fail the entire lot listing creation if manifest processing fails
    throw manifestError;
  }
}
