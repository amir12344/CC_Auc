"use client";

import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useState } from "react";

import type { AuctionListingItem } from "@/src/features/auctions/types";
import type { CatalogListing } from "@/src/features/marketplace-catalog/types/catalog";
import type { CombinedListing } from "@/src/features/marketplace-catalog/types/combined-listing";
import { fetchListings } from "@/src/features/search/services/megaMenuQueryService";
import { searchListings } from "@/src/features/search/services/searchQueryService";

import SearchClient, { type SearchClientProps } from "./SearchClient";

// Lazy-load the heavy filter sidebar to keep initial JS light
const PageSpecificFilterSidebar = dynamic(
  () =>
    import("@/src/features/filters/components/PageSpecificFilterSidebar").then(
      (m) => m.PageSpecificFilterSidebar
    ),
  { ssr: false }
);

/**
 * Data transformation utilities for search results
 */

// Transform search results to CombinedListing format for filter integration
const transformSearchResultsToCombinedListings = (
  catalogs: CatalogListing[],
  auctions: AuctionListingItem[]
): CombinedListing[] => {
  const combinedListings: CombinedListing[] = [];

  // Transform catalog listings to CombinedListing format
  catalogs.forEach((catalog: CatalogListing) => {
    // Use brands directly from CatalogListing type
    const brandsArray = catalog.brands || [];

    combinedListings.push({
      public_id: catalog.id,
      title: catalog.title,
      description: catalog.description || "",
      category: catalog.category || "",
      subcategory: catalog.subcategory,
      minimum_order_value: catalog.minimum_order_value,
      listing_source: "catalog", // Identify as catalog listing
      // Card metrics – preserve if present on CatalogListing
      total_units:
        typeof catalog.total_units === "number" ? catalog.total_units : null,
      msrp_discount_percent:
        typeof catalog.msrp_discount_percent === "number"
          ? catalog.msrp_discount_percent
          : null,
      // Filter fields from enhanced API
      listing_condition: catalog.listing_condition || null,
      packaging: catalog.packaging || null,
      is_private: catalog.is_private || null,
      addresses: catalog.addresses || null,
      brands: brandsArray,
      // Image handling (preserve existing S3 URL processing)
      images:
        catalog.catalog_listing_images?.map((img) => ({
          s3_key: img.images.s3_key,
        })) || [],
      catalog_listing_images:
        catalog.catalog_listing_images?.map((img) => ({
          images: {
            s3_key: img.images.s3_key,
            processed_url: img.images.processed_url ?? "",
          },
        })) || [],
      shipping_window: catalog.lead_time_days,
    });
  });

  // Transform auction listings to CombinedListing format
  auctions.forEach((auction: AuctionListingItem) => {
    // Use image URLs provided on the simplified auction type
    const auctionImageUrls = Array.isArray(auction.images)
      ? auction.images
      : [];
    const auctionImages = auctionImageUrls.map((url) => ({ s3_key: url }));

    // For compatibility with catalog image structure
    const catalogCompatibleImages = auctionImageUrls.map((url) => ({
      images: { s3_key: url, processed_url: url },
    }));

    combinedListings.push({
      public_id: auction.id,
      title: auction.title,
      description: `Auction ending ${auction.timeLeft || "soon"}`, // Generate description
      category: auction.category || "",
      subcategory: auction.subcategory || null,
      minimum_order_value: 0, // Auctions don't have minimum order value
      listing_source: "auction", // Identify as auction listing
      // Filter fields from enhanced API
      listing_condition: auction.lot_condition || null,
      packaging: null, // Auctions typically don't have packaging info
      is_private: false, // Auctions are public by default
      addresses: auction.addresses || null,
      brands: [], // Auctions typically don't have brand info in current structure
      // Image handling (preserve existing auction image URLs)
      images: auctionImages,
      catalog_listing_images: catalogCompatibleImages,
      shipping_window: null,
      // Auction-specific fields
      auction_end_time: auction.auction_end_time || null,
      total_bids: auction.totalBids || null,
      time_left: auction.timeLeft || null,
      is_active: auction.isActive || null,
    });
  });

  return combinedListings;
};

// Transform CombinedListing back to display format for SearchClient
const transformCombinedListingsToDisplayFormat = (
  combinedListings: CombinedListing[]
): { catalogs: CatalogListing[]; auctions: AuctionListingItem[] } => {
  const catalogs: CatalogListing[] = [];
  const auctions: AuctionListingItem[] = [];

  combinedListings.forEach((listing) => {
    if (listing.listing_source === "catalog") {
      catalogs.push({
        id: listing.public_id,
        title: listing.title,
        description: listing.description || "",
        category: listing.category || "",
        subcategory: listing.subcategory || null,
        image_url:
          listing.catalog_listing_images?.[0]?.images?.processed_url || "",
        minimum_order_value: listing.minimum_order_value ?? 0,
        lead_time_days: listing.shipping_window ?? null,
        catalog_listing_images: (listing.catalog_listing_images || []).map(
          (img) => ({
            images: {
              s3_key: img.images.s3_key,
              processed_url: img.images.processed_url ?? "",
            },
          })
        ),
        // Card metrics – pass through for CatalogCard
        total_units:
          typeof listing.total_units === "number"
            ? listing.total_units
            : undefined,
        msrp_discount_percent:
          typeof listing.msrp_discount_percent === "number"
            ? listing.msrp_discount_percent
            : undefined,
        // Filter fields
        listing_condition: listing.listing_condition,
        packaging: listing.packaging,
        is_private: listing.is_private,
        addresses: listing.addresses,
        brands: listing.brands,
      });
    } else if (listing.listing_source === "auction") {
      auctions.push({
        id: listing.public_id,
        title: listing.title,
        image:
          listing.catalog_listing_images?.[0]?.images?.processed_url ||
          listing.images?.[0]?.s3_key ||
          "",
        images: listing.images?.map((img) => img.s3_key) || [],
        category: listing.category,
        subcategory: listing.subcategory || undefined,
        timeLeft: listing.time_left || "TBD",
        totalBids: listing.total_bids || 0,
        isActive: true,
        auction_end_time: listing.auction_end_time || undefined,
        // Filter fields
        lot_condition: listing.listing_condition,
        addresses: listing.addresses,
      });
    }
  });

  return { catalogs, auctions };
};

/**
 * Client wrapper component for search page with preference-based filtering.
 * Follows the established pattern from CatalogClientWrapper and NearYouClientWrapper.
 *
 * Features:
 * - Fetches search results using searchListings from searchQueryService
 * - Transforms data between search results and CombinedListing formats
 * - Integrates with PageSpecificFilterSidebar for client-side filtering
 * - Manages loading states and error handling
 * - Preserves existing image URL processing and auction functionality
 */
interface SearchClientWrapperProps {
  query: string;
  initialFilters?: { [key: string]: string | string[] | undefined };
}

const SearchClientWrapper: React.FC<SearchClientWrapperProps> = ({
  query,
  initialFilters,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [allListings, setAllListings] = useState<CombinedListing[]>([]);
  const [filteredListings, setFilteredListings] = useState<CombinedListing[]>(
    []
  );
  const [displayListings, setDisplayListings] = useState<{
    catalogs: CatalogListing[];
    auctions: AuctionListingItem[];
  }>({
    catalogs: [],
    auctions: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Stable reference for initialFilters to prevent useEffect race conditions
  const stableInitialFilters = useMemo(() => initialFilters, [initialFilters]);

  // Fetch search results on mount and when query changes
  useEffect(() => {
    const fetchSearchResults = async () => {
      const hasQuery = query && query.trim().length > 0;
      const hasFilters =
        stableInitialFilters &&
        Object.keys(stableInitialFilters).some(
          (key) =>
            stableInitialFilters[key] &&
            (Array.isArray(stableInitialFilters[key])
              ? stableInitialFilters[key].length > 0
              : true)
        );

      // If neither query nor filters, show empty state
      if (!(hasQuery || hasFilters)) {
        setAllListings([]);
        setFilteredListings([]);
        setDisplayListings({ catalogs: [], auctions: [] });
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        let catalogResults: CatalogListing[] = [];
        let auctionResults: AuctionListingItem[] = [];

        if (hasQuery && !hasFilters) {
          // Query-only search using searchListings
          const searchResult = await searchListings(query, {}, { limit: 50 });
          catalogResults = searchResult.catalogs;
          auctionResults = searchResult.auctions;
        } else if (!hasQuery && hasFilters) {
          // Filter-only search using fetchListings from megaMenuQueryService (mega menu integration)
          // Note: fetchListings already applies proper transformations, so we get CatalogListing[] and AuctionListingItem[] directly
          const filterParams = {
            category: Array.isArray(stableInitialFilters.categories)
              ? stableInitialFilters.categories[0]
              : stableInitialFilters.categories,
            subcategory: Array.isArray(stableInitialFilters.subcategory)
              ? stableInitialFilters.subcategory[0]
              : stableInitialFilters.subcategory,
            condition: Array.isArray(stableInitialFilters.condition)
              ? stableInitialFilters.condition[0]
              : stableInitialFilters.condition,
            region: Array.isArray(stableInitialFilters.region)
              ? stableInitialFilters.region[0]
              : stableInitialFilters.region,
            isPrivate:
              typeof stableInitialFilters.isPrivate === "string"
                ? stableInitialFilters.isPrivate === "true"
                : Boolean(stableInitialFilters.isPrivate),
          };

          const perTypeLimit = Math.ceil(50 / 2);

          // Fetch listings based on type filter
          if (
            stableInitialFilters.type?.toString().toLowerCase() === "auction"
          ) {
            // Only fetch auction listings for Live Auctions
            const auctionFilterResults = await fetchListings(
              "auction_listings",
              filterParams,
              50
            );
            catalogResults = [];
            auctionResults = auctionFilterResults as AuctionListingItem[];
          } else {
            // Fetch both catalog and auction listings for other filters
            const [catalogFilterResults, auctionFilterResults] =
              await Promise.all([
                fetchListings("catalog_listings", filterParams, perTypeLimit),
                fetchListings("auction_listings", filterParams, perTypeLimit),
              ]);
            catalogResults = catalogFilterResults as CatalogListing[];
            auctionResults = auctionFilterResults as AuctionListingItem[];
          }
        } else if (hasQuery && hasFilters) {
          // Combined query + filter search using searchListings with filters
          const searchResult = await searchListings(
            query,
            stableInitialFilters,
            { limit: 50 }
          );
          catalogResults = searchResult.catalogs;
          auctionResults = searchResult.auctions;
        }

        // Handle different data sources appropriately
        let combinedListings: CombinedListing[] = [];
        let displayFormat: {
          catalogs: CatalogListing[];
          auctions: AuctionListingItem[];
        } = {
          catalogs: catalogResults,
          auctions: auctionResults,
        };

        // Always transform to CombinedListing format for filter sidebar functionality
        combinedListings = transformSearchResultsToCombinedListings(
          catalogResults,
          auctionResults
        );

        // Always transform to display format for consistent rendering
        displayFormat =
          transformCombinedListingsToDisplayFormat(combinedListings);

        // Set state with results
        setAllListings(combinedListings);
        setFilteredListings(combinedListings);
        setDisplayListings(displayFormat);
      } catch (err) {
        console.error("Error fetching search results:", err);
        setError("Failed to load search results. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [query, stableInitialFilters]);

  // Handle filtered listings change from PageSpecificFilterSidebar
  const handleFilteredListingsChange = useCallback(
    (newFilteredListings: CombinedListing[]) => {
      setFilteredListings(newFilteredListings);

      // Transform filtered listings back to display format
      const displayFormat =
        transformCombinedListingsToDisplayFormat(newFilteredListings);
      setDisplayListings(displayFormat);
    },
    []
  );

  // Handle sorting change from SearchClient
  const handleSortingChange = useCallback(
    (sortBy: string) => {
      const sortedCatalogs = [...displayListings.catalogs];
      const sortedAuctions = [...displayListings.auctions];

      switch (sortBy) {
        case "price_low":
          sortedCatalogs.sort(
            (a, b) =>
              (a.minimum_order_value || 0) - (b.minimum_order_value || 0)
          );
          break;
        case "price_high":
          sortedCatalogs.sort(
            (a, b) =>
              (b.minimum_order_value || 0) - (a.minimum_order_value || 0)
          );
          break;
        case "newest":
          // Keep original order (newest first by default from API)
          break;
        case "relevance":
        default:
          // Keep original search relevance order
          break;
      }

      setDisplayListings({
        catalogs: sortedCatalogs,
        auctions: sortedAuctions,
      });
    },
    [displayListings]
  );

  return (
    <div className="flex gap-8">
      {/* Page-Specific Filter Sidebar - Desktop Only */}
      <div className="hidden w-80 flex-shrink-0 lg:block">
        <div className="sticky top-6">
          <PageSpecificFilterSidebar
            listings={allListings}
            onFilteredListingsChangeAction={handleFilteredListingsChange}
            pageContext={{
              type: "search",
              value: query,
              title: "Search Results",
              hideCategories: false,
            }}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="min-w-0 flex-1">
        <SearchClient
          auctions={displayListings.auctions}
          catalogs={displayListings.catalogs}
          error={error}
          filteredCount={filteredListings.length}
          loading={loading}
          onSortingChange={handleSortingChange}
          query={query}
          searchParams={
            new URLSearchParams(stableInitialFilters as Record<string, string>)
          }
          totalCount={allListings.length}
        />
      </div>
    </div>
  );
};

export default SearchClientWrapper;
