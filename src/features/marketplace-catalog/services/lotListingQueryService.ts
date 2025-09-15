import { generateClient } from "aws-amplify/api";

import type { Schema } from "@/amplify/data/resource";
import type {
    FindManyArgs,
    FindUniqueArgs,
} from "@/src/lib/prisma/PrismaQuery.type";
import { err, ok, type Result } from "@/src/shared/types/result";
import { formatBackendError } from "@/src/utils/error-utils";

import type { CombinedListing } from "../types/combined-listing";
import { getImageUrl as sharedGetImageUrl } from "./imageService";

/**
 * Get public URL for S3 image
 */
export const getImageUrl = (s3Key: string): Promise<string | null> =>
    sharedGetImageUrl(s3Key);

/**
 * Raw API response type for lot listings
 */
export interface ApiLotListingResponse {
    public_id: string;
    title: string;
    description?: string | null;
    category?: string | null;
    subcategory?: string | null;
    asking_price?: number | null;
    asking_price_currency?: string | null;
    estimated_retail_value?: number | null;
    estimated_retail_value_currency?: string | null;
    lot_condition?: string | null;
    listing_type?: string | null;
    source_type?: string | null;
    source_name?: string | null;
    total_units?: number | null;
    piece_count?: number | null;
    estimated_weight?: number | null;
    weight_type?: string | null;
    lot_packaging?: string | null;
    is_private?: boolean | null;
    created_at?: string | null;
    addresses?: {
        city?: string | null;
        province?: string | null;
        province_code?: string | null;
        country?: string | null;
        country_code?: string | null;
    } | null;
    lot_listing_images?: Array<{
        images: { s3_key: string };
    }> | null;
    lot_listing_product_manifests?: Array<{
        title: string;
        description?: string | null;
        brand_id: string;
        sku: string;
        model_name?: string | null;
        product_condition?: string | null;
        available_quantity?: number | null;
        retail_price?: number | null;
        retail_price_currency?: string | null;
        category?: string | null;
        subcategory?: string | null;
        brands?: {
            brand_name?: string | null;
        } | null;
    }> | null;
    lot_listing_tags?: Array<{
        tags: {
            name: string;
            category?: string | null;
        };
    }> | null;
}

/**
 * Minimal lot listing type for marketplace cards
 */
export interface LotListing {
    id: string;
    title: string;
    description?: string;
    category: string;
    subcategory?: string | null;
    image_url?: string;
    asking_price: number;
    asking_price_currency: string;
    total_units?: number;
    discount_percent?: number;
    listing_source: "lot";
    total_manifest_items?: number;
    avg_discount_percent?: number;
}

/**
 * Detailed lot listing type for detail pages
 */
export interface DetailedLotListing {
    id: string;
    title: string;
    description: string;
    category: string;
    subcategory: string | null;
    image_url: string;
    image_urls: string[]; // Added array of all processed image URLs
    asking_price: number;
    asking_price_currency: string;
    estimated_retail_value?: number;
    estimated_retail_value_currency?: string;
    lot_condition?: string;
    listing_type?: string;
    source_type?: string;
    source_name?: string;
    total_units?: number;
    piece_count?: number;
    estimated_weight?: number;
    weight_type?: string;
    lot_packaging?: string;
    is_private?: boolean;
    location?: string;
    lot_listing_images: Array<{
        images: { s3_key: string; processed_url: string };
    }>;
    manifest_items?: Array<{
        title: string;
        description?: string;
        brand_name?: string;
        sku: string;
        model_name?: string;
        product_condition?: string;
        available_quantity?: number;
        retail_price?: number;
        retail_price_currency?: string;
        category?: string;
        subcategory?: string;
    }>;
    tags?: Array<{
        tag_name: string;
        tag_type?: string;
    }>;
    listing_source: "lot";
    total_manifest_items?: number;
    avg_discount_percent?: number;
}

/**
 * Transform API response to LotListing with S3 image processing
 */
export const transformApiResponseToLotListing = async (
    apiResponse: ApiLotListingResponse & {
        lot_listing_images?: Array<{ images: { s3_key: string } }> | null;
    }
): Promise<LotListing> => {
    const images = apiResponse.lot_listing_images;

    // Process first image for primary display
    let primaryImageUrl = "";

    if (
        images &&
        Array.isArray(images) &&
        images.length > 0 &&
        images[0]?.images?.s3_key
    ) {
        const s3Key = images[0].images.s3_key;
        const processedUrl = await getImageUrl(s3Key);
        primaryImageUrl = processedUrl || "";
    }

    // Calculate discount percentage from asking price vs estimated retail value
    let discountPercent = 0;
    if (
        apiResponse.asking_price &&
        apiResponse.estimated_retail_value &&
        apiResponse.estimated_retail_value > 0
    ) {
        discountPercent =
            ((apiResponse.estimated_retail_value - apiResponse.asking_price) /
                apiResponse.estimated_retail_value) *
            100;
    }

    const result = {
        id: apiResponse.public_id,
        title: apiResponse.title,
        description: apiResponse.description || undefined,
        category: apiResponse.category || "Uncategorized",
        subcategory: apiResponse.subcategory || null,
        image_url: primaryImageUrl || "",
        asking_price: apiResponse.asking_price || 0,
        asking_price_currency: apiResponse.asking_price_currency || "USD",
        total_units: apiResponse.total_units || undefined,
        discount_percent: discountPercent,
        listing_source: "lot" as const,
    };
    return result;
};

/**
 * Fetch lot listings for marketplace page
 * Returns clean UI-ready LotListing objects
 */
export const fetchLotListings = async (): Promise<LotListing[]> => {
    try {
        const client = generateClient<Schema>({ authMode: "apiKey" });

        type QueryDataInput = {
            modelName: "lot_listings";
            operation: "findMany";
            query: string;
        };

        const query: FindManyArgs<"lot_listings"> = {
            where: { status: "DRAFT" },
            relationLoadStrategy: "join",
            select: {
                public_id: true,
                title: true,
                category: true,
                subcategory: true,
                asking_price: true,
                asking_price_currency: true,
                estimated_retail_value: true,
                estimated_retail_value_currency: true,
                total_units: true,
                lot_listing_images: {
                    select: {
                        images: {
                            select: {
                                s3_key: true,
                            },
                        },
                    },
                },
            },
            orderBy: { created_at: "desc" },
            take: 10,
        };

        const input: QueryDataInput = {
            modelName: "lot_listings",
            operation: "findMany",
            query: JSON.stringify(query),
        };

        const { data: result } = await client.queries.queryData(input);

        if (result) {
            const parsedData =
                typeof result === "string" ? JSON.parse(result) : result;
            if (Array.isArray(parsedData)) {
                // Process images asynchronously for all listings
                const lotListings = await Promise.all(
                    parsedData.map(transformApiResponseToLotListing)
                );
                return lotListings;
            }
        }
        return [];
    } catch (error) {
        return [];
    }
};

/**
 * Fetch ALL lot listings with comprehensive fields for filtering
 * Used by lot collection page to load all listings and apply client-side filters
 */
export const fetchAllLotListingsForFiltering = async (): Promise<{
    listings: CombinedListing[];
    total: number;
}> => {
    try {
        const client = generateClient<Schema>({ authMode: "apiKey" });
        type QueryDataInput = {
            modelName: "lot_listings";
            operation: "findMany";
            query: string;
        };

        const query: FindManyArgs<"lot_listings"> = {
            relationLoadStrategy: "join",
            where: { status: "ACTIVE" },
            select: {
                public_id: true,
                title: true,
                description: true,
                category: true,
                subcategory: true,
                asking_price: true,
                asking_price_currency: true,
                lot_listing_images: {
                    select: {
                        images: {
                            select: {
                                s3_key: true,
                            },
                        },
                    },
                },
                // Additional fields needed for filtering
                lot_condition: true,
                lot_packaging: true,
                is_private: true,
                addresses: {
                    select: {
                        city: true,
                        province: true,
                        province_code: true,
                        country_code: true,
                    },
                },
                lot_listing_product_manifests: {
                    select: {
                        brands: {
                            select: {
                                brand_name: true,
                            },
                        },
                        available_quantity: true,
                        retail_price: true,
                    },
                },
            },
            // No pagination - fetch all for filtering
        };

        const input: QueryDataInput = {
            modelName: "lot_listings",
            operation: "findMany",
            query: JSON.stringify(query),
        };
        const { data: result } = await client.queries.queryData(input);

        if (result) {
            const parsedData =
                typeof result === "string" ? JSON.parse(result) : result;

            if (Array.isArray(parsedData)) {
                type RawListing = {
                    public_id: string;
                    title: string;
                    description: string | null;
                    category: string | null;
                    subcategory: string | null;
                    asking_price: number | null;
                    asking_price_currency: string | null;
                    lot_listing_images: Array<{ images: { s3_key: string } }> | null;
                    lot_condition?: string | null;
                    lot_packaging?: string | null;
                    is_private?: boolean | null;
                    addresses?: {
                        city?: string | null;
                        province?: string | null;
                        province_code?: string | null;
                        country_code?: string | null;
                    } | null;
                    lot_listing_product_manifests?: Array<{
                        brands?: { brand_name?: string | null } | null;
                        available_quantity?: number | null;
                        retail_price?: number | null;
                    }> | null;
                };

                const transformedListings: CombinedListing[] = (
                    parsedData as RawListing[]
                ).map((listing) => {
                    // Compute metrics from manifest if present
                    let totalUnits = 0;
                    let totalRetail = 0;
                    for (const manifest of listing.lot_listing_product_manifests || []) {
                        const qty = Number(manifest.available_quantity) || 0;
                        const retail = Number(manifest.retail_price) || 0;
                        totalUnits += qty;
                        if (retail > 0) totalRetail += retail * qty;
                    }
                    const askingPrice = listing.asking_price || 0;
                    const discountPercent =
                        totalRetail > 0 && askingPrice > 0
                            ? ((totalRetail - askingPrice) / totalRetail) * 100
                            : null;

                    return {
                        public_id: listing.public_id,
                        title: listing.title,
                        description: listing.description ?? "",
                        category: listing.category ?? "",
                        subcategory: listing.subcategory,
                        minimum_order_value: listing.asking_price ?? 0, // Use asking_price as equivalent
                        images:
                            listing.lot_listing_images?.map((img) => ({
                                s3_key: img.images.s3_key,
                            })) || [],
                        shipping_window: null, // Lot listings don't have shipping_window
                        listing_source: "lot" as const,
                        // Filter fields
                        listing_condition: listing.lot_condition ?? null,
                        packaging: listing.lot_packaging ?? null,
                        is_private: listing.is_private ?? null,
                        addresses: listing.addresses
                            ? {
                                city: listing.addresses.city ?? null,
                                province: listing.addresses.province ?? null,
                                province_code: listing.addresses.province_code ?? null,
                                country_code: listing.addresses.country_code ?? null,
                            }
                            : null,
                        brands:
                            listing.lot_listing_product_manifests?.map((manifest) => ({
                                brand_name: manifest.brands?.brand_name || null,
                            })) || [],
                        total_units: totalUnits || null,
                        msrp_discount_percent: discountPercent,
                    };
                });

                return {
                    listings: transformedListings,
                    total: transformedListings.length,
                };
            }
        }
        return { listings: [], total: 0 };
    } catch (error) {
        return { listings: [], total: 0 };
    }
};

/**
 * Enhanced lot listing type for detail pages with manifest items
 */
export interface DetailedLotListingWithManifest extends LotListing {
    image_urls?: string[]; // Added array of all processed image URLs
    manifest_items?: Array<{
        title: string;
        description?: string;
        brand_name?: string;
        sku: string;
        model_name?: string;
        product_condition?: string;
        available_quantity?: number;
        retail_price?: number;
        retail_price_currency?: string;
        category?: string;
        subcategory?: string;
    }>;
    location?: string;
    lot_packaging?: string;
    lot_condition?: string;
    piece_count?: number;
    estimated_weight?: number;
    weight_type?: string;
    manifest_snapshot_file_s3_key?: string; // S3 key for downloadable manifest file
    
    // Missing properties that are needed by components
    estimated_retail_value?: number;
    estimated_retail_value_currency?: string;
    listing_type?: string;
    source_type?: string;
    source_name?: string;
    
    // Additional lot listing fields
    lot_shipping_type?: string;
    lot_freight_type?: string;
    number_of_pallets?: number;
    pallet_spaces?: number;
    pallet_length?: number;
    pallet_width?: number;
    pallet_height?: number;
    pallet_dimension_type?: string;
    pallet_stackable?: boolean;
    number_of_truckloads?: number;
    number_of_shipments?: number;
    is_refrigerated?: boolean;
    is_fda_registered?: boolean;
    is_hazmat?: boolean;
    inspection_status?: string;
    resale_requirement?: string;
    seller_notes?: string;
    shipping_notes?: string;
    additional_information?: string;
    offer_requirements?: string;
    accessories?: string;
    expiry_date?: string | Date;
    shipping_cost?: number;
    load_type?: string;
    // Program fields
    load_program_type?: string;
    program_type?: string;
    // Extended categorization for richer UI
    category2?: string | null;
    category3?: string | null;
    subcategory2?: string | null;
    subcategory3?: string | null;
    subcategory4?: string | null;
    subcategory5?: string | null;
    estimated_case_packs?: number;
    category_percent_estimates?: Array<{ category?: string | null; subcategory?: string | null; percent: number }>;
    tags?: Array<{ tag_name: string; tag_type?: string | null }>;
}

/**
 * Fetch single lot listing by ID for detail page
 */
export const fetchLotListingById = async (
    publicId: string
): Promise<DetailedLotListingWithManifest | null> => {
    try {
        const client = generateClient<Schema>({ authMode: "apiKey" });

        type QueryDataInput = {
            modelName: "lot_listings";
            operation: "findUnique";
            query: string;
        };

        const query: FindUniqueArgs<"lot_listings"> = {
            relationLoadStrategy: "join",
            where: {
                public_id: publicId,
            },
            select: {
                public_id: true,
                title: true,
                description: true,
                category: true,
                category2: true,
                category3: true,
                subcategory: true,
                subcategory2: true,
                subcategory3: true,
                subcategory4: true,
                subcategory5: true,
                asking_price: true,
                asking_price_currency: true,
                estimated_retail_value: true,
                estimated_retail_value_currency: true,
                lot_condition: true,
                listing_type: true,
                source_type: true,
                source_name: true,
                total_units: true,
                estimated_case_packs: true,
                piece_count: true,
                estimated_weight: true,
                weight_type: true,
                lot_packaging: true,
                is_private: true,
                created_at: true,
                category_percent_estimates: true,
                addresses: {
                    select: {
                        address1: true,
                        address2: true,
                        address3: true,
                        city: true,
                        province: true,
                        country: true,
                        province_code: true,
                        country_code: true,
                    },
                },
                lot_listing_images: {
                    select: {
                        images: {
                            select: {
                                s3_key: true,
                            },
                        },
                    },
                },
                // Additional lot listing fields for the new 5-section layout
                lot_shipping_type: true,
                lot_freight_type: true,
                number_of_pallets: true,
                pallet_spaces: true,
                pallet_length: true,
                pallet_width: true,
                pallet_height: true,
                pallet_dimension_type: true,
                pallet_stackable: true,
                number_of_truckloads: true,
                number_of_shipments: true,
                is_refrigerated: true,
                is_fda_registered: true,
                is_hazmat: true,
                resale_requirement: true,
                accessories: true,
                inspection_status: true,
                seller_notes: true,
                shipping_notes: true,
                additional_information: true,
                offer_requirements: true,
                expiry_date: true,
                manifest_snapshot_file_s3_key: true, // S3 key for downloadable manifest file
                shipping_cost: true,
                load_type: true,
                
                lot_listing_product_manifests: {
                    select: {
                        title: true,
                        description: true,
                        brand_id: true,
                        sku: true,
                        model_name: true,
                        product_condition: true,
                        available_quantity: true,
                        retail_price: true,
                        retail_price_currency: true,
                        category: true,
                        subcategory: true,
                        identifier: true,
                        identifier_type: true,
                        brands: {
                            select: {
                                brand_name: true,
                            },
                        },
                    },
                },
                lot_listing_tags: {
                    select: {
                        tags: {
                            select: {
                                name: true,
                                category: true,
                            },
                        },
                    },
                },
            },
        };

        const input: QueryDataInput = {
            modelName: "lot_listings",
            operation: "findUnique",
            query: JSON.stringify(query),
        };
        const { data: result } = await client.queries.queryData(input);
        if (result) {
            const parsedData =
                typeof result === "string" ? JSON.parse(result) : result;
            if (parsedData) {
                const lotListing = await transformApiResponseToLotListing(parsedData);

                // Process ALL images for the gallery
                const imageUrls: string[] = [];
                if (
                    parsedData.lot_listing_images &&
                    Array.isArray(parsedData.lot_listing_images)
                ) {
                    for (const imageItem of parsedData.lot_listing_images) {
                        if (imageItem?.images?.s3_key) {
                            const processedUrl = await getImageUrl(imageItem.images.s3_key);
                            if (processedUrl) {
                                imageUrls.push(processedUrl);
                            }
                        }
                    }
                }

                // Transform manifest items if present
                const manifestItems =
                    parsedData.lot_listing_product_manifests?.map((item: any) => ({
                        title: item.title,
                        description: item.description || undefined,
                        brand_name: item.brands?.brand_name || undefined,
                        sku: item.sku,
                        model_name: item.model_name || undefined,
                        product_condition: item.product_condition || undefined,
                        available_quantity: item.available_quantity || undefined,
                        retail_price: item.retail_price || undefined,
                        retail_price_currency: item.retail_price_currency || undefined,
                        category: item.category || undefined,
                        subcategory: item.subcategory || undefined,
                    })) || [];

                // Build location string from address data
                let location = "";
                if (parsedData.addresses) {
                    const addressParts = [
                        parsedData.addresses.city,
                        parsedData.addresses.province,
                        parsedData.addresses.country,
                    ].filter(Boolean);
                    location = addressParts.join(", ");
                }

                const enhancedLotListing: DetailedLotListingWithManifest = {
                    ...lotListing,
                    image_urls: imageUrls, // Add processed image URLs for gallery
                    manifest_items: manifestItems,
                    location: location || undefined,
                    listing_type: parsedData.listing_type || undefined,
                    source_type: parsedData.source_type || undefined,
                    source_name: parsedData.source_name || undefined,
                    category2: parsedData.category2 || undefined,
                    category3: parsedData.category3 || undefined,
                    subcategory2: parsedData.subcategory2 || undefined,
                    subcategory3: parsedData.subcategory3 || undefined,
                    subcategory4: parsedData.subcategory4 || undefined,
                    subcategory5: parsedData.subcategory5 || undefined,
                    lot_packaging: parsedData.lot_packaging || undefined,
                    lot_condition: parsedData.lot_condition || undefined,
                    piece_count: parsedData.piece_count || undefined,
                    estimated_weight: parsedData.estimated_weight || undefined,
                    weight_type: parsedData.weight_type || undefined,
                    estimated_case_packs: parsedData.estimated_case_packs || undefined,
                    // Map MSRP/Estimated retail directly from backend so UI can display it
                    estimated_retail_value:
                        parsedData.estimated_retail_value || undefined,
                    estimated_retail_value_currency:
                        parsedData.estimated_retail_value_currency || undefined,
                    category_percent_estimates: parsedData.category_percent_estimates || undefined,
                    // Ensure shipping-related primitives are surfaced to the UI
                    shipping_cost: parsedData.shipping_cost || undefined,
                    load_type: parsedData.load_type || undefined,
                    load_program_type: parsedData.load_program_type || undefined,
                    program_type: parsedData.program_type || undefined,
                    manifest_snapshot_file_s3_key: parsedData.manifest_snapshot_file_s3_key || undefined,
                    // Additional lot listing fields
                    lot_shipping_type: parsedData.lot_shipping_type || undefined,
                    lot_freight_type: parsedData.lot_freight_type || undefined,
                    number_of_pallets: parsedData.number_of_pallets || undefined,
                    pallet_spaces: parsedData.pallet_spaces || undefined,
                    pallet_length: parsedData.pallet_length || undefined,
                    pallet_width: parsedData.pallet_width || undefined,
                    pallet_height: parsedData.pallet_height || undefined,
                    pallet_dimension_type: parsedData.pallet_dimension_type || undefined,
                    pallet_stackable: parsedData.pallet_stackable ?? undefined,
                    number_of_truckloads: parsedData.number_of_truckloads || undefined,
                    number_of_shipments: parsedData.number_of_shipments || undefined,
                    is_refrigerated: parsedData.is_refrigerated ?? undefined,
                    is_fda_registered: parsedData.is_fda_registered ?? undefined,
                    is_hazmat: parsedData.is_hazmat ?? undefined,
                    inspection_status: parsedData.inspection_status || undefined,
                    resale_requirement: parsedData.resale_requirement || undefined,
                    seller_notes: parsedData.seller_notes || undefined,
                    shipping_notes: parsedData.shipping_notes || undefined,
                    additional_information:
                        parsedData.additional_information || undefined,
                    offer_requirements: parsedData.offer_requirements || undefined,
                    accessories: parsedData.accessories || undefined,
                    expiry_date: parsedData.expiry_date || undefined,
                    tags:
                        parsedData.lot_listing_tags?.map((t: any) => ({
                            tag_name: t?.tags?.name,
                            tag_type: t?.tags?.category || null,
                        })) || undefined,
                };

                return enhancedLotListing;
            }
        }
        return null;
    } catch (error) {
        return null;
    }
};

export const fetchLotListingByIdResult = async (
    publicId: string
): Promise<Result<LotListing | null>> => {
    try {
        const data = await fetchLotListingById(publicId);
        return ok(data);
    } catch (e) {
        return err(formatBackendError(e));
    }
};

/**
 * Fetch lot listings with pagination support
 */
export const fetchLotListingsPaginated = async (options?: {
    take?: number;
    skip?: number;
}): Promise<{
    listings: LotListing[];
    hasMore: boolean;
    total: number;
}> => {
    try {
        const client = generateClient<Schema>();
        type QueryDataInput = {
            modelName: "lot_listings";
            operation: "findMany";
            query: string;
        };

        const query: FindManyArgs<"lot_listings"> = {
            relationLoadStrategy: "join",
            where: { status: "ACTIVE" },
            select: {
                public_id: true,
                title: true,
                description: true,
                category: true,
                subcategory: true,
                asking_price: true,
                asking_price_currency: true,
                estimated_retail_value: true,
                estimated_retail_value_currency: true,
                total_units: true,
                lot_listing_images: {
                    select: {
                        images: {
                            select: {
                                s3_key: true,
                            },
                        },
                    },
                },
            },
            orderBy: { created_at: "desc" },
            ...(options?.take && { take: options.take }),
            ...(options?.skip && { skip: options.skip }),
        };

        const input: QueryDataInput = {
            modelName: "lot_listings",
            operation: "findMany",
            query: JSON.stringify(query),
        };

        const { data: result } = await client.queries.queryData(input);
        if (result) {
            const parsedData =
                typeof result === "string" ? JSON.parse(result) : result;
            if (Array.isArray(parsedData)) {
                const transformedListings = await Promise.all(
                    parsedData.map((listing: any) =>
                        transformApiResponseToLotListing(listing)
                    )
                );

                // Calculate if there are more items
                const hasMore = options?.take
                    ? parsedData.length === options.take
                    : false;
                const total = parsedData.length;
                return {
                    listings: transformedListings,
                    hasMore,
                    total: options?.skip ? options.skip + total : total,
                };
            }
        }
        return { listings: [], hasMore: false, total: 0 };
    } catch (error) {
        return { listings: [], hasMore: false, total: 0 };
    }
};

export const fetchLotListingsPaginatedResult = async (options?: {
    take?: number;
    skip?: number;
}): Promise<
    Result<{ listings: LotListing[]; hasMore: boolean; total: number }>
> => {
    try {
        const data = await fetchLotListingsPaginated(options);
        return ok(data);
    } catch (e) {
        return err(formatBackendError(e));
    }
};
