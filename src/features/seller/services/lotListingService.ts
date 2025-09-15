import { generateClient } from "aws-amplify/api";

import type { Schema } from "@/amplify/data/resource";
import { formatBackendError } from "@/src/utils/error-utils";

import type { LotListingsFormData } from "../schemas/lotListingsSchema";

// Remove keys with undefined, null, empty string, or empty array values
function pruneEmpty<T extends Record<string, any>>(
  obj: T,
  preserveKeys: string[] = []
): Partial<T> {
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (preserveKeys.includes(k)) {
      out[k] = v;
      continue;
    }
    if (v === undefined || v === null) continue;
    if (typeof v === "string" && v.trim() === "") continue;
    if (Array.isArray(v) && v.length === 0) continue;
    out[k] = v;
  }
  return out as Partial<T>;
}

// Address type matching backend Address customType
export interface AddressPayload {
  firstName?: string;
  lastName?: string;
  address1: string;
  address2?: string;
  address3?: string;
  city: string;
  province: string;
  provinceCode?: string;
  country: string;
  countryCode?: string;
  zip: string;
  phone?: string;
  company?: string;
  latitude?: number;
  longitude?: number;
  addressType?: string;
}

// API payload type for lot listing creation
export interface LotListingCreationPayload {
  // BACKEND REQUIRED FIELDS
  title: string;
  listingType: string;
  sourceType: string;
  sourceName: string;
  categories: string[];
  lotCondition: string;
  loadType: string;
  estimatedRetailValue: number;
  estimatedRetailValueCurrency: string;
  askingPrice: number;
  askingPriceCurrency: string;
  estimatedWeight: number;
  weightType: string;
  locationAddress: AddressPayload; // CHANGED: from locationAddressId to full Address object
  lotShippingType: string;
  lotFreightType: string;
  lotPackaging: string;
  numberOfPallets: number;
  palletSpaces: number;
  palletLength: number;
  palletWidth: number;
  palletHeight: number;
  palletDimensionType: string;
  palletStackable: boolean;
  numberOfTruckloads: number;
  isRefrigerated: boolean;
  isFdaRegistered: boolean;
  isHazmat: boolean;
  images: { imageS3Key: string; sortOrder: number }[]; // REQUIRED

  // OPTIONAL FIELDS
  shortTitle?: string;
  subHeading?: string;
  description?: string;
  shortDescription?: string;
  listingLabel?: string;
  subcategories?: string[];
  categoryPercentEstimates?: Array<{
    category?: string;
    subcategory?: string;
    percent: number;
  }>;
  defaultImageUrl?: string;
  cosmeticCondition?: string;
  sampleSkuDetails?: string;
  manifestSnapshotFileS3Key?: string;
  manifestFileS3Key?: string;
  expiryDate?: string;
  totalUnits?: number;
  estimatedCasePacks?: number;
  pieceCount?: number;
  shippingCost?: number;
  shippingCostCurrency?: string;
  numberOfShipments?: number;
  isPrivate?: boolean;
  resaleRequirement?: string;
  accessories?: string;
  inspectionStatus?: string;
  sellerNotes?: string;
  shippingNotes?: string;
  additionalInformation?: string;
  offerRequirements?: string;
  tags?: string[];
  visibilityRules?: {
    buyer_segments?: string[];
    locations?: {
      countries?: string[];
      states?: string[];
      cities?: string[];
      zip_codes?: string[];
    };
  };
}

/**
 * Transforms nested form data to API payload, extracting values from label-value pairs
 * @param formData - The nested lot listing form data
 * @param manifestFileS3Key - The S3 key for the uploaded manifest file
 * @param manifestSnapshotFileS3Key - Optional S3 key for manifest snapshot
 * @param images - Array of uploaded images with S3 keys
 * @returns Transformed payload for API submission
 */
export function transformFormDataToPayload(
  formData: LotListingsFormData,
  manifestFileS3Key?: string,
  manifestSnapshotFileS3Key?: string
): LotListingCreationPayload {
  // Helper function to extract value from string or object with value property
  const extractValue = (field: any): string | undefined => {
    if (typeof field === "string") return field;
    if (typeof field === "object" && field && "value" in field)
      return field.value;
    return undefined;
  };

  // Build categoryPercentEstimates from categoryPercentages record (categories only for now; subcategory optional)
  const selectedCategories: string[] = Array.isArray(
    formData.listingBasics.categories
  )
    ? formData.listingBasics.categories
    : [];
  const catPercRecord: Record<string, number> = (formData.listingBasics
    .categoryPercentages || {}) as any;
  const categoryPercentEstimates:
    | LotListingCreationPayload["categoryPercentEstimates"]
    | undefined = (() => {
    const rows = selectedCategories
      .map((cat) => {
        const p = catPercRecord?.[cat];
        if (typeof p === "number" && Number.isFinite(p)) {
          const percent = Math.max(0, Math.min(100, Number(p)));
          return { category: cat as string, percent };
        }
        return undefined;
      })
      .filter(Boolean) as Array<{ category: string; percent: number }>;

    if (!rows.length) return undefined;
    const total = rows.reduce((s, r) => s + r.percent, 0);
    return rows;
  })();

  // Build images with sortOrder (hero first)
  const images: { imageS3Key: string; sortOrder: number }[] = [];
  let order = 0;
  const hero = formData.imagesMedia.heroPhotoKey;
  if (hero) {
    images.push({ imageS3Key: hero, sortOrder: order++ });
  }
  if (formData.imagesMedia.requiredPhotoKeys) {
    formData.imagesMedia.requiredPhotoKeys.forEach((key) => {
      if (key && key !== hero) {
        images.push({ imageS3Key: key, sortOrder: order++ });
      }
    });
  }

  // Parse pallet dimensions from combined LxWxH string (in inches)
  const parsePalletDims = (val?: string) => {
    const out = {
      length: undefined as number | undefined,
      width: undefined as number | undefined,
      height: undefined as number | undefined,
    };
    if (!val) return out;
    const parts = val
      .split("x")
      .map((p) => p.trim())
      .filter(Boolean);
    const toNum = (s?: string) => {
      if (!s) return undefined;
      const cleaned = s.replace(/[^0-9.]/g, "");
      const n = cleaned === "" ? NaN : Number(cleaned);
      return Number.isFinite(n) ? n : undefined;
    };
    out.length = toNum(parts[0]);
    out.width = toNum(parts[1]);
    out.height = toNum(parts[2]);
    return out;
  };

  // Extract pallet dimensions from form data
  const dims = parsePalletDims(formData.logistics.palletDimension as any);

  // Use individual dimension fields if available, otherwise parse from combined string
  const palletLength = formData.logistics.palletLength || dims.length || 0;
  const palletWidth = formData.logistics.palletWidth || dims.width || 0;
  const palletHeight = formData.logistics.palletHeight || dims.height || 0;

  // Visibility transformation
  const isPrivateListing = formData.visibilityType === "private";
  let visibilityRules: LotListingCreationPayload["visibilityRules"] | undefined;
  if (isPrivateListing) {
    const buyerSegments = Array.isArray(formData.buyerTargeting)
      ? formData.buyerTargeting.filter(Boolean)
      : undefined;

    const geo = formData.geographicRestrictions || {};
    const locationCandidates = {
      countries:
        Array.isArray(geo.countries) && geo.countries.length
          ? geo.countries
          : undefined,
      states:
        Array.isArray(geo.states) && geo.states.length ? geo.states : undefined,
      cities:
        Array.isArray(geo.cities) && geo.cities.length ? geo.cities : undefined,
      zip_codes:
        Array.isArray(geo.zip_codes) && geo.zip_codes.length
          ? geo.zip_codes
          : undefined,
    };
    const hasLocations = Object.values(locationCandidates).some(Boolean);

    if ((buyerSegments && buyerSegments.length > 0) || hasLocations) {
      visibilityRules = {
        buyer_segments: buyerSegments,
        locations: hasLocations ? locationCandidates : undefined,
      };
    }
  }

  // Compute listing type and map manifest keys to correct API fields
  const lt = ((): string => {
    const v = formData.manifestDetails.listingType as any;
    if (typeof v === "string") return v;
    if (v && typeof v === "object" && "value" in v)
      return (v as any).value as string;
    return "";
  })();

  let manifestFileKeyOut: string | undefined;
  let manifestSnapshotKeyOut: string | undefined;

  if (lt === "MANIFESTED") {
    // For manifested listings, send the file as manifestFileS3Key
    manifestFileKeyOut =
      manifestFileS3Key || formData.manifestDetails.manifestFileKey;
  } else if (lt === "PARTIALLY_MANIFESTED" || lt === "UNMANIFESTED") {
    // For un/partially manifested listings, send the file as manifestSnapshotFileS3Key
    manifestSnapshotKeyOut =
      manifestSnapshotFileS3Key ||
      formData.manifestDetails.partialManifestFileKey ||
      formData.manifestDetails.unmanifestedFileKey;
  }

  const raw: LotListingCreationPayload = {
    // REQUIRED FIELDS
    title: formData.listingBasics.listingTitle,
    listingType: lt || "",
    sourceType: extractValue(formData.listingBasics.sourceType) || "",
    sourceName: extractValue(formData.listingBasics.sourceName) || "",
    categories:
      formData.listingBasics.categories?.map(
        (cat) => extractValue(cat) || cat
      ) || [],
    lotCondition: extractValue(formData.loadDetails.lotType) || "",
    loadType: extractValue(formData.loadDetails.loadType) || "",
    estimatedRetailValue: formData.loadDetails.estimatedRetailPrice || 0,
    estimatedRetailValueCurrency:
      formData.loadDetails.estimatedRetailValueCurrency || "USD",
    askingPrice: formData.listingBasics.askingPrice || 0,
    askingPriceCurrency: formData.listingBasics.askingPriceCurrency || "USD",
    estimatedWeight: formData.logistics.estimatedWeight || 0,
    weightType: extractValue(formData.logistics.weightType) || "",

    // REQUIRED: locationAddress as Address object (mapping from warehouse fields)
    locationAddress: {
      address1: formData.logistics.warehouseAddress1 || "",
      address2: formData.logistics.warehouseAddress2,
      address3: formData.logistics.warehouseAddress3,
      city: formData.logistics.warehouseCityCode || "",
      province: formData.logistics.warehouseStateCode || "",
      provinceCode: formData.logistics.warehouseStateCode,
      country: formData.logistics.warehouseCountryCode || "",
      countryCode: formData.logistics.warehouseCountryCode,
      zip: formData.logistics.warehouseZipcode || "",
      firstName: undefined,
      lastName: undefined,
      phone: undefined,
      company: undefined,
      latitude: undefined,
      longitude: undefined,
      addressType: undefined,
    },

    lotShippingType: extractValue(formData.logistics.shippingType) || "",
    lotFreightType: extractValue(formData.logistics.freightType) || "",
    lotPackaging: extractValue(formData.logistics.lotPackaging) || "",
    numberOfPallets: formData.logistics.numberOfPallets || 0,
    palletSpaces: formData.logistics.palletSpaces || 0,
    palletLength,
    palletWidth,
    palletHeight,
    palletDimensionType: formData.logistics.palletDimensionType || "INCH",
    palletStackable: formData.logistics.palletStackable || false,
    numberOfTruckloads: formData.logistics.numberOfTruckloads || 0,
    isRefrigerated: formData.logistics.isRefrigerated || false,
    isFdaRegistered: formData.logistics.isFdaRegistered || false,
    isHazmat: formData.logistics.isHazmat || false,
    images, // REQUIRED

    // OPTIONAL FIELDS
    shortTitle: formData.listingBasics.shortListingTitle,
    listingLabel: formData.listingBasics.listingLabel,
    description: formData.loadDetails.shortDescription,
    subcategories: formData.listingBasics.subcategories?.map(
      (subcat) => extractValue(subcat) || subcat
    ),
    categoryPercentEstimates,
    defaultImageUrl: formData.imagesMedia.heroPhotoKey,
    cosmeticCondition: formData.loadDetails.cosmeticCondition,
    sampleSkuDetails: formData.listingBasics.sampleSkuDetails,
    manifestFileS3Key: manifestFileKeyOut,
    manifestSnapshotFileS3Key: manifestSnapshotKeyOut,
    expiryDate: formData.loadDetails.expiryDate,
    totalUnits: formData.loadDetails.estimatedTotalUnits,
    estimatedCasePacks: formData.loadDetails.estimatedCasePacks,
    pieceCount: formData.loadDetails.estimatedTotalUnits,
    numberOfShipments: formData.logistics.numberOfShipments,
    isPrivate: isPrivateListing,
    resaleRequirement: formData.loadDetails.resaleRequirements,
    accessories: formData.loadDetails.accessoriesDetails,
    inspectionStatus: extractValue(formData.loadDetails.inspectionStatus),
    sellerNotes: formData.listingBasics.sellerNotes,
    shippingNotes: formData.logistics.shippingNotes,
    additionalInformation: formData.logistics.additionalInformation,
    offerRequirements: formData.logistics.biddingRequirements,
    tags:
      Array.isArray(formData.listingBasics.seasonalEventTags) &&
      formData.listingBasics.seasonalEventTags.length > 0
        ? formData.listingBasics.seasonalEventTags.filter((t) => !!t && t.trim() !== "")
        : undefined,
    visibilityRules,
  };

  // Do not send empty values; preserve required fields
  const cleaned = pruneEmpty(raw, [
    "title",
    "listingType",
    "sourceType",
    "sourceName",
    "categories",
    "lotCondition",
    "loadType",
    "estimatedRetailValue",
    "estimatedRetailValueCurrency",
    "askingPrice",
    "askingPriceCurrency",
    "estimatedWeight",
    "weightType",
    "locationAddress",
    "lotShippingType",
    "lotFreightType",
    "lotPackaging",
    "numberOfPallets",
    "palletSpaces",
    "palletLength",
    "palletWidth",
    "palletHeight",
    "palletDimensionType",
    "palletStackable",
    "numberOfTruckloads",
    "isRefrigerated",
    "isFdaRegistered",
    "isHazmat",
    "images",
  ]) as LotListingCreationPayload;
  return cleaned;
}

/**
 * Creates a lot listing using the backend API
 * @param payload - The lot listing creation payload
 * @returns Promise with the API response and any errors
 */
export async function createLotListing(
  payload: LotListingCreationPayload
): Promise<{ data: boolean | null; errors: string | null }> {
  try {
    // Initialize API client with userPool auth mode
    const client = generateClient<Schema>({ authMode: "userPool" });

    const args = pruneEmpty(
      {
        // REQUIRED FIELDS
        title: payload.title,
        listingType: payload.listingType as any,
        sourceType: payload.sourceType as any,
        sourceName: payload.sourceName as any,
        categories: payload.categories as any,
        lotCondition: payload.lotCondition as any,
        loadType: payload.loadType as any,
        estimatedRetailValue: payload.estimatedRetailValue,
        estimatedRetailValueCurrency:
          payload.estimatedRetailValueCurrency as any,
        askingPrice: payload.askingPrice,
        askingPriceCurrency: payload.askingPriceCurrency as any,
        estimatedWeight: payload.estimatedWeight,
        weightType: payload.weightType as any,
        locationAddress: payload.locationAddress as any, // CHANGED: from locationAddressId to locationAddress
        lotShippingType: payload.lotShippingType as any,
        lotFreightType: payload.lotFreightType as any,
        lotPackaging: payload.lotPackaging as any,
        numberOfPallets: payload.numberOfPallets,
        palletSpaces: payload.palletSpaces,
        palletLength: payload.palletLength,
        palletWidth: payload.palletWidth,
        palletHeight: payload.palletHeight,
        palletDimensionType: payload.palletDimensionType as any,
        palletStackable: payload.palletStackable,
        numberOfTruckloads: payload.numberOfTruckloads,
        isRefrigerated: payload.isRefrigerated,
        isFdaRegistered: payload.isFdaRegistered,
        isHazmat: payload.isHazmat,
        images: payload.images as any,

        // OPTIONAL FIELDS
        shortTitle: payload.shortTitle,
        subHeading: payload.subHeading,
        description: payload.description,
        shortDescription: payload.shortDescription,
        listingLabel: payload.listingLabel,
        subcategories: payload.subcategories as any,
        categoryPercentEstimates: payload.categoryPercentEstimates as any,
        defaultImageUrl: payload.defaultImageUrl,
        cosmeticCondition: payload.cosmeticCondition,
        sampleSkuDetails: payload.sampleSkuDetails,
        manifestSnapshotFileS3Key: payload.manifestSnapshotFileS3Key,
        manifestFileS3Key: payload.manifestFileS3Key,
        expiryDate: payload.expiryDate,
        totalUnits: payload.totalUnits,
        estimatedCasePacks: payload.estimatedCasePacks,
        pieceCount: payload.pieceCount,
        shippingCost: payload.shippingCost,
        shippingCostCurrency: payload.shippingCostCurrency as any,
        numberOfShipments: payload.numberOfShipments,
        isPrivate: payload.isPrivate,
        resaleRequirement: payload.resaleRequirement,
        accessories: payload.accessories,
        inspectionStatus: payload.inspectionStatus as any,
        sellerNotes: payload.sellerNotes,
        shippingNotes: payload.shippingNotes,
        additionalInformation: payload.additionalInformation,
        offerRequirements: payload.offerRequirements,
        tags: payload.tags,
        visibilityRules: payload.visibilityRules,
      },
      [
        "title",
        "listingType",
        "sourceType",
        "sourceName",
        "categories",
        "lotCondition",
        "loadType",
        "estimatedRetailValue",
        "estimatedRetailValueCurrency",
        "askingPrice",
        "askingPriceCurrency",
        "estimatedWeight",
        "weightType",
        "locationAddress",
        "lotShippingType",
        "lotFreightType",
        "lotPackaging",
        "numberOfPallets",
        "palletSpaces",
        "palletLength",
        "palletWidth",
        "palletHeight",
        "palletDimensionType",
        "palletStackable",
        "numberOfTruckloads",
        "isRefrigerated",
        "isFdaRegistered",
        "isHazmat",
        "images",
      ]
    );

    const { data: result, errors: createErrors } =
      await client.queries.createLotListing(args as any);

    // Handle API errors with proper formatting
    if (createErrors && createErrors.length > 0) {
      return {
        data: null,
        errors: createErrors[0].message || "Failed to create lot listing",
      };
    }

    // Parse the result if it's a string
    const parsed = typeof result === "string" ? JSON.parse(result) : result;

    // Check if the backend returned an error
    if (parsed?.success === false && parsed?.error) {
      return {
        data: null,
        errors: formatBackendError(parsed.error),
      };
    }

    return {
      data: true,
      errors: null,
    };
  } catch (error) {
    // Format any caught errors for consistent error handling
    const formattedError = formatBackendError(error);
    return { data: null, errors: formattedError };
  }
}

/**
 * Validates lot listing form data before submission
 * @param formData - The form data to validate
 * @returns Validation result with any errors
 */
export function validateLotListingData(formData: LotListingsFormData): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Required fields validation
  if (!formData.listingBasics.listingTitle?.trim()) {
    errors.push("Title is required");
  }

  const lt2 = formData.manifestDetails.listingType;
  if (lt2 === "MANIFESTED") {
    if (!formData.manifestDetails.manifestFileKey) {
      errors.push("Please upload the manifest file for a manifested listing.");
    }
  } else if (lt2 === "PARTIALLY_MANIFESTED") {
    if (!formData.manifestDetails.partialManifestFileKey) {
      errors.push(
        "Please upload the partial manifest file for a partially manifested listing."
      );
    }
  } else if (lt2 === "UNMANIFESTED") {
    if (
      !formData.manifestDetails.unmanifestedFileKey &&
      !formData.manifestDetails.partialManifestFileKey
    ) {
      errors.push(
        "Please upload a manifest snapshot for an unmanifested listing."
      );
    }
  }

  // Validate pricing fields
  if (
    formData.listingBasics.askingPrice !== undefined &&
    formData.listingBasics.askingPrice < 0
  ) {
    errors.push("Asking price must be non-negative");
  }

  if (
    formData.loadDetails.estimatedRetailPrice !== undefined &&
    formData.loadDetails.estimatedRetailPrice < 0
  ) {
    errors.push("Estimated retail price must be non-negative");
  }

  if (
    formData.loadDetails.estimatedAvgCostPerUnit !== undefined &&
    formData.loadDetails.estimatedAvgCostPerUnit < 0
  ) {
    errors.push("Estimated cost per unit must be non-negative");
  }

  // Validate quantity fields
  if (
    formData.loadDetails.estimatedTotalUnits !== undefined &&
    formData.loadDetails.estimatedTotalUnits < 0
  ) {
    errors.push("Estimated total units must be non-negative");
  }

  if (
    formData.loadDetails.estimatedCasePacks !== undefined &&
    formData.loadDetails.estimatedCasePacks < 0
  ) {
    errors.push("Estimated case packs must be non-negative");
  }

  // Validate weight
  if (
    formData.logistics.estimatedWeight !== undefined &&
    formData.logistics.estimatedWeight < 0
  ) {
    errors.push("Estimated weight must be non-negative");
  }

  // Validate pallet dimensions
  // Note: Only palletHeight exists in current schema
  if (
    formData.logistics.palletHeight !== undefined &&
    formData.logistics.palletHeight < 0
  ) {
    errors.push("Pallet height must be non-negative");
  }

  // Validate logistics quantities
  if (
    formData.logistics.numberOfPallets !== undefined &&
    formData.logistics.numberOfPallets < 0
  ) {
    errors.push("Number of pallets must be non-negative");
  }

  if (
    formData.logistics.numberOfTruckloads !== undefined &&
    formData.logistics.numberOfTruckloads < 0
  ) {
    errors.push("Number of truckloads must be non-negative");
  }

  // Note: Warehouse-related validations commented out as requested
  // Not sending warehouse data for now:
  // - warehouseCountryCode, warehouseStateCode, warehouseCityCode
  // - warehouseAddress1, warehouseAddress2, warehouseAddress3
  // - warehouseZipcode

  // Note: No visibility/compliance section in current schema
  // Private listing requirements validation not implemented yet

  return {
    isValid: errors.length === 0,
    errors,
  };
}
