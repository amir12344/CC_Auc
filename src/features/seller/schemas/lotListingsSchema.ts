import { z } from "zod";
import type { DeepPartial } from "react-hook-form";

import {
  FREIGHT_TYPES,
  INSPECTION_STATUS,
  LISTING_TYPES,
  LOAD_TYPES,
  LOT_PACKAGING_OPTIONS,
  LOT_TYPES,
  PACKAGING_TYPES,
  SHIPPING_TYPES,
  SOURCE_NAMES,
  SOURCE_TYPES,
  WEIGHT_TYPES,
} from "../constants/lotListingsConstants";

// Listing Basics Schema (trimmed to requested fields)
const listingBasicsSchema = z.object({
  listingTitle: z
    .string()
    .min(1, "Listing title is required")
    .max(100, "Title too long"),
  shortListingTitle: z
    .string()
    .min(1, "Short title is required")
    .max(50, "Short title too long"),
  listingLabel: z.string().optional(),
  // REQUIRED: askingPrice and currency are required
  askingPrice: z
    .number()
    .positive("Asking price is required and must be positive"),
  askingPriceCurrency: z.string().min(1, "Currency is required"),
  sourceType: z
    .string({ required_error: "Please select a source type" })
    .refine(
      (v) => SOURCE_TYPES.some((o) => o.value === v),
      "Please select a valid source type"
    ),
  otherSourceType: z.string().optional(),
  sourceName: z
    .string({ required_error: "Please select a source name" })
    .refine(
      (v) => SOURCE_NAMES.some((o) => o.value === v),
      "Please select a valid source name"
    ),
  // Updated: consolidated categories & subcategories with multi-select (min 1, max 5)
  categories: z
    .array(z.string())
    .min(1, "Select at least 1 category")
    .max(5, "You can select up to 5 categories"),
  subcategories: z
    .array(z.string())
    .min(1, "Select at least 1 subcategory")
    .max(5, "You can select up to 5 subcategories"),

  categoryPercentages: z
    .record(z.string(), z.number().min(0).max(100))
    .optional(),
  seasonalEventTags: z.array(z.string()).optional(),
  sellerNotes: z.string().optional(),
  sampleSkuDetails: z.string().optional(),
});

// Manifest Details Schema (new)
const manifestDetailsSchema = z.object({
  listingType: z
    .string({ required_error: "Please select a listing type" })
    .refine(
      (v) => LISTING_TYPES.some((o) => o.value === v),
      "Please select a valid listing type"
    ),
  manifestFile: z.any().optional(),
  partialManifestFile: z.any().optional(),
  // S3 keys for  processing
  manifestFileKey: z.string().optional(),
  partialManifestFileKey: z.string().optional(),
  unmanifestedFileKey: z.string().optional(),
});

// Load Details Schema
const loadDetailsSchema = z.object({
  loadType: z
    .string({ required_error: "Please select a load type" })
    .refine(
      (v) => LOAD_TYPES.some((o) => o.value === v),
      "Please select a valid load type"
    ),
  otherLoadType: z.string().optional(),
  lotType: z
    .string({ required_error: "Please select a lot type" })
    .refine(
      (v) => LOT_TYPES.some((o) => o.value === v),
      "Please select a valid lot type"
    ),
  packaging: z
    .string({ required_error: "Please select packaging type" })
    .refine(
      (v) => PACKAGING_TYPES.some((o) => o.value === v),
      "Please select a valid packaging type"
    ),
  cosmeticCondition: z.string().optional(),
  resaleRequirements: z.string().optional(),
  accessoriesCompleteness: z.boolean().optional(),
  accessoriesDetails: z.string().optional(),
  inspectionStatus: z
    .string()
    .refine(
      (v) => !v || INSPECTION_STATUS.some((o) => o.value === v),
      "Please select a valid inspection status"
    )
    .optional(),
  hasShelfLifeRisk: z.boolean().optional(),
  expiryDate: z.string().optional(),
  // Note: estimatedRetailPrice field doesn't exist in form - making optional for now
  estimatedRetailPrice: z
    .number()
    .positive("Estimated retail value must be positive")
    .optional(),
  estimatedRetailValueCurrency: z
    .string()
    .min(1, "Currency is required")
    .default("USD")
    .optional(),
  estimatedCasePacks: z
    .number()
    .int()
    .positive("Must be a positive integer")
    .optional(),
  estimatedTotalUnits: z
    .number()
    .int()
    .positive("Must be a positive integer")
    .optional(),
  estimatedAvgCostPerUnit: z
    .number()
    .positive("Cost must be positive")
    .optional(),
  shortDescription: z.string().max(500, "Description too long").optional(),
});

// Images/Media Schema
const imagesMediaSchema = z.object({
  heroPhoto: z.any().optional(),
  // We validate count using S3 keys captured from FileUploader events
  requiredPhotos: z.array(z.any()).optional(),
  videoUpload: z.any().optional(),
  heroPhotoKey: z.string().min(1, "Hero photo is required"),
  // Additional photos are optional; allow zero
  requiredPhotoKeys: z.array(z.string()),
  videoUploadKey: z.string().optional(),
});

// Address Schema
const addressSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  address1: z.string().min(1, "Address Line 1 is required"),
  address2: z.string().optional(),
  address3: z.string().optional(),
  city: z.string().min(1, "City is required"),
  province: z.string().min(1, "State/Province is required"),
  provinceCode: z.string().optional(),
  country: z.string().min(1, "Country is required"),
  countryCode: z.string().optional(),
  zip: z.string().min(1, "Zip/Postal Code is required"),
  phone: z.string().optional(),
  company: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  addressType: z.string().optional(),
});

// Logistics Schema
const logisticsSchema = z.object({
  // Keep existing warehouse fields (UI collects these)
  warehouseCountryCode: z.string().min(1, "Country is required"),
  warehouseStateCode: z.string().min(1, "State is required"),
  warehouseCityCode: z.string().min(1, "City is required"),
  warehouseAddress1: z.string().min(1, "Address Line 1 is required"),
  warehouseAddress2: z.string().optional(),
  warehouseAddress3: z.string().optional(),
  warehouseZipcode: z.string().min(1, "Zip/Postal Code is required"),
  shippingType: z
    .string({ required_error: "Please select shipping type" })
    .refine(
      (v) => SHIPPING_TYPES.some((o) => o.value === v),
      "Please select a valid shipping type"
    ),
  freightType: z
    .string({ required_error: "Please select freight type" })
    .refine(
      (v) => FREIGHT_TYPES.some((o) => o.value === v),
      "Please select a valid freight type"
    ),
  //  REQUIRED: weightType is required
  weightType: z
    .string({ required_error: "Please select weight type" })
    .refine(
      (v) => WEIGHT_TYPES.some((o) => o.value === v),
      "Please select a valid weight type"
    ),
  //  REQUIRED: estimatedWeight is required
  estimatedWeight: z
    .number({ required_error: "Estimated weight is required" })
    .positive("Estimated weight is required and must be positive")
    .optional()
    .refine((val) => val !== undefined, "Estimated weight is required"),
  estimatedVolume: z.number().positive("Volume must be positive").optional(),
  //  REQUIRED: All pallet dimensions are required (these ARE the form fields)
  palletLength: z
    .number()
    .positive("Pallet length is required and must be positive"),
  palletWidth: z
    .number()
    .positive("Pallet width is required and must be positive"),
  palletHeight: z
    .number()
    .positive("Pallet height is required and must be positive"),
  palletDimensionType: z
    .string()
    .min(1, "Pallet dimension type is required")
    .default("INCH"),
  //  REQUIRED: palletStackable is required boolean
  palletStackable: z.boolean(),
  palletDimension: z.string().optional(), // Keep for backward compatibility with UI
  //  REQUIRED: refrigeration, FDA, and hazmat flags are required
  isRefrigerated: z.boolean(),
  isFdaRegistered: z.boolean(),
  isHazmat: z.boolean(),
  //  REQUIRED: lotPackaging is required
  lotPackaging: z
    .string({ required_error: "Please select lot packaging" })
    .refine(
      (v) => LOT_PACKAGING_OPTIONS.some((o) => o.value === v),
      "Please select a valid lot packaging option"
    ),
  //  REQUIRED: pallet and truckload counts are required
  numberOfPallets: z
    .number({ required_error: "Number of pallets is required" })
    .int()
    .positive("Number of pallets is required and must be positive")
    .optional()
    .refine((val) => val !== undefined, "Number of pallets is required"),
  palletSpaces: z
    .number({ required_error: "Pallet spaces is required" })
    .int()
    .positive("Pallet spaces is required and must be positive")
    .optional()
    .refine((val) => val !== undefined, "Pallet spaces is required"),
  numberOfTruckloads: z
    .number({ required_error: "Number of truckloads is required" })
    .int()
    .positive("Number of truckloads is required and must be positive")
    .optional()
    .refine((val) => val !== undefined, "Number of truckloads is required"),
  numberOfShipments: z.number().int().positive("Must be positive").optional(),
  shippingNotes: z.string().optional(),
  additionalInformation: z.string().optional(),
  biddingRequirements: z.string().optional(),
});

export const lotListingsSchema = z.object({
  listingBasics: listingBasicsSchema,
  manifestDetails: manifestDetailsSchema,
  loadDetails: loadDetailsSchema,
  imagesMedia: imagesMediaSchema,
  logistics: logisticsSchema,
  // Listing visibility (shared with Auction/Catalog forms)
  visibilityType: z.enum(["public", "private"], {
    required_error: "Please select a visibility type",
  }),
  buyerTargeting: z.array(z.string()).optional(),
  geographicRestrictions: z
    .object({
      countries: z.array(z.string()).optional(),
      states: z.array(z.string()).optional(),
      cities: z.array(z.string()).optional(),
      zip_codes: z.array(z.string()).optional(),
    })
    .optional(),
});

// Use Zod inference but ensure compatibility with react-hook-form
export type LotListingsFormData = z.infer<typeof lotListingsSchema>;

// Default values for form initialization
export const defaultValues: DeepPartial<LotListingsFormData> = {
  listingBasics: {
    listingTitle: "",
    shortListingTitle: "",
    listingLabel: "",
    askingPrice: 0, // Changed from string to number to match schema
    askingPriceCurrency: "USD", // Added -  required
    sourceType: "",
    otherSourceType: "",
    sourceName: "",
    categories: [],
    subcategories: [],
    categoryPercentages: {},
    seasonalEventTags: [],
    sellerNotes: "",
    sampleSkuDetails: "",
  },
  manifestDetails: {
    listingType: "",
    manifestFile: undefined,
    partialManifestFile: undefined,
    manifestFileKey: undefined,
    partialManifestFileKey: undefined,
    unmanifestedFileKey: undefined,
  },
  loadDetails: {
    loadType: "",
    otherLoadType: "",
    lotType: "",
    packaging: "",
    cosmeticCondition: "",
    resaleRequirements: "",
    accessoriesCompleteness: undefined,
    accessoriesDetails: "",
    inspectionStatus: "",
    hasShelfLifeRisk: false,
    expiryDate: "",
    estimatedRetailPrice: undefined, // Field doesn't exist in form - optional
    estimatedRetailValueCurrency: undefined, // Field doesn't exist in form - optional
    estimatedCasePacks: undefined,
    estimatedTotalUnits: undefined,
    estimatedAvgCostPerUnit: undefined,
    shortDescription: "",
  },
  imagesMedia: {
    heroPhoto: undefined,
    requiredPhotos: [],
    videoUpload: undefined,
    heroPhotoKey: "", // Changed from undefined -  required
    requiredPhotoKeys: [], // Keep as array - validation will enforce minimum
    videoUploadKey: undefined,
  },
  logistics: {
    // UI warehouse fields (mapped to  locationAddress)
    warehouseCountryCode: "",
    warehouseStateCode: "",
    warehouseCityCode: "",
    warehouseAddress1: "",
    warehouseAddress2: "",
    warehouseAddress3: "",
    warehouseZipcode: "",
    shippingType: "",
    freightType: "",
    weightType: "",
    estimatedWeight: undefined as number | undefined, // Keep undefined so validation works
    estimatedVolume: undefined,
    palletLength: 0, // Added - required
    palletWidth: 0, // Added -  required
    palletHeight: 0, // Changed from undefined -  required
    palletDimensionType: "INCH", // Added -  required
    palletStackable: false, // Changed from undefined -  required
    palletDimension: "", // Keep for UI compatibility
    isRefrigerated: false,
    isFdaRegistered: false,
    isHazmat: false,
    lotPackaging: "",
    numberOfPallets: undefined as number | undefined, // Keep undefined so validation works
    palletSpaces: undefined as number | undefined, // Keep undefined so validation works
    numberOfTruckloads: undefined as number | undefined, // Keep undefined so validation works
    numberOfShipments: undefined,
    shippingNotes: "",
    additionalInformation: "",
    biddingRequirements: "",
  },
  // Visibility defaults
  visibilityType: "public" as const,
  buyerTargeting: [],
  geographicRestrictions: {
    countries: [],
    states: [],
    cities: [],
    zip_codes: [],
  },
};
