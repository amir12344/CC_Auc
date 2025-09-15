"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { ConditionalActionButton } from "@/src/components/ui/ConditionalActionButton";
import {
  BuildOfferModal,
  OfferFooterBar,
} from "@/src/features/offer-management";
import {
  selectCurrentCatalogItems,
  setCatalogContext,
} from "@/src/features/offer-management/store/offerCartSlice";
import { usePublicPageAuth } from "@/src/hooks/useAuthState";

import type { DetailedCatalogListing } from "../types/catalog";
import {
  createCatalogContextFromListing,
  transformCatalogProductToEnhanced,
} from "../utils/catalogToOfferTransform";
import { CatalogDisplay } from "./CatalogDisplay";
import { CatalogMetrics } from "./CatalogMetrics";
import { CatalogProductsTable } from "./CatalogProductsTable";

/**
 * Helper function to calculate total units from all variants
 */
const calculateTotalUnits = (
  catalogListing: DetailedCatalogListing
): number => {
  return (
    catalogListing.catalog_products?.reduce(
      (total, product) =>
        total +
        (product.catalog_product_variants?.reduce(
          (variantTotal, variant) => variantTotal + variant.available_quantity,
          0
        ) || 0),
      0
    ) || 0
  );
};

/**
 * Helper function to calculate average price per unit
 */
const calculateAvgPricePerUnit = (
  catalogListing: DetailedCatalogListing
): number => {
  let totalPrice = 0;
  let totalUnits = 0;

  for (const product of catalogListing.catalog_products || []) {
    for (const variant of product.catalog_product_variants || []) {
      const offerPrice =
        typeof variant.offer_price === "string"
          ? Number.parseFloat(variant.offer_price)
          : variant.offer_price;

      if (offerPrice && !Number.isNaN(offerPrice)) {
        totalPrice += offerPrice * variant.available_quantity;
        totalUnits += variant.available_quantity;
      }
    }
  }

  return totalUnits > 0 ? totalPrice / totalUnits : 0;
};

/**
 * Helper function to parse price value safely
 */
const parsePrice = (price: number | string | null): number => {
  if (!price) {
    return 0;
  }
  const parsed = typeof price === "string" ? Number.parseFloat(price) : price;
  return Number.isNaN(parsed) ? 0 : parsed;
};

/**
 * Helper function to calculate MSRP percentage (discount percentage)
 * Formula: (Retail - Offer) / Retail * 100
 */
const calculateMSRPPercentage = (
  catalogListing: DetailedCatalogListing
): number => {
  let totalOfferPrice = 0;
  let totalRetailPrice = 0;

  for (const product of catalogListing.catalog_products || []) {
    for (const variant of product.catalog_product_variants || []) {
      const offerPrice = parsePrice(variant.offer_price);
      const retailPrice = parsePrice(variant.retail_price);

      if (offerPrice > 0) {
        totalOfferPrice += offerPrice * variant.available_quantity;
      }
      if (retailPrice > 0) {
        totalRetailPrice += retailPrice * variant.available_quantity;
      }
    }
  }

  return totalRetailPrice > 0
    ? ((totalRetailPrice - totalOfferPrice) / totalRetailPrice) * 100
    : 0;
};

/**
 * Helper function to calculate total asking price (sum of all products' total prices)
 */
const calculateTotalAskingPrice = (
  catalogListing: DetailedCatalogListing
): number => {
  let totalUnits = 0;
  let totalWeightedOfferPrice = 0;

  // Calculate total units and average offer price across ALL variants
  for (const product of catalogListing.catalog_products || []) {
    for (const variant of product.catalog_product_variants || []) {
      const variantUnits = Number(variant.available_quantity) || 0;
      const variantOfferPrice = Number(variant.offer_price) || 0;

      totalUnits += variantUnits;
      totalWeightedOfferPrice += variantOfferPrice * variantUnits;
    }
  }

  // Calculate average offer price per unit across all variants
  const avgOfferPrice =
    totalUnits > 0 ? totalWeightedOfferPrice / totalUnits : 0;

  // Formula: total units × average offer price
  return totalUnits * avgOfferPrice;
};

/**
 * Helper function to prepare display data
 */
const prepareDisplayData = (
  catalogListing: DetailedCatalogListing,
  msrpPercentage: number,
  totalAskingPrice: number
) => ({
  imageUrl: catalogListing.image_url || "",
  name: catalogListing.title || "Catalog Listing",
  category: catalogListing.category || "Uncategorized",
  description: catalogListing.description || "No description available.",
  totalAskingPrice: `$${totalAskingPrice.toLocaleString()}`,
  msrpPercentage:
    msrpPercentage > 0
      ? `${msrpPercentage.toFixed(1)}% off on MSRP`
      : "Contact for discount",
  leadTime: catalogListing.shipping_window
    ? `${catalogListing.shipping_window} days`
    : "Contact for availability",
});

/**
 * Helper function to prepare metrics data
 */
const prepareMetricsData = (
  catalogListing: DetailedCatalogListing,
  totalUnits: number,
  avgPricePerUnit: number
) => ({
  totalUnits: totalUnits.toLocaleString(),
  minOrderValue: `$${catalogListing.minimum_order_value?.toLocaleString() || "0"}`,
  location: catalogListing.addresses
    ? `${catalogListing.addresses.city}, ${catalogListing.addresses.province}, ${catalogListing.addresses.country}`
    : "",
  avgPricePerUnit: avgPricePerUnit > 0 ? `$${avgPricePerUnit.toFixed(2)}` : "",
  packaging: catalogListing.packaging || "",
  shipWindow: catalogListing.shipping_window
    ? `${catalogListing.shipping_window} days`
    : "",
});

/**
 * CatalogDetailClient Component
 *
 * Client component for catalog details page that mirrors ProductDetailClient structure.
 * Displays catalog information using CatalogDisplay and CatalogMetrics components.
 * Uses optimized patterns for performance and user experience.
 * Sets catalog context for proper offer management scoping.
 */

interface CatalogDetailClientProps {
  catalogListing: DetailedCatalogListing;
}

export function CatalogDetailClient({
  catalogListing,
}: CatalogDetailClientProps) {
  const dispatch = useDispatch();
  const [isMounted, setIsMounted] = useState(false);
  const offerItems = useSelector(selectCurrentCatalogItems);
  const { userType } = usePublicPageAuth();

  // Set catalog context when component mounts
  useEffect(() => {
    const catalogContext = createCatalogContextFromListing(catalogListing);
    dispatch(setCatalogContext(catalogContext));
  }, [catalogListing, dispatch]);

  // Ensure component is mounted on client-side for consistent hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Calculate metrics
  const totalUnits = calculateTotalUnits(catalogListing);
  const avgPricePerUnit = calculateAvgPricePerUnit(catalogListing);
  const msrpPercentage = calculateMSRPPercentage(catalogListing);
  const totalAskingPrice = calculateTotalAskingPrice(catalogListing);

  // Transform catalog products to enhanced format (same as CatalogProductsTable)
  const allEnhancedProducts = useMemo(() => {
    const products = catalogListing.catalog_products || [];
    return products.map((product) =>
      transformCatalogProductToEnhanced(catalogListing, product)
    );
  }, [catalogListing]);

  // Prepare data for components
  const displayData = prepareDisplayData(
    catalogListing,
    msrpPercentage,
    totalAskingPrice
  );
  const metricsData = prepareMetricsData(
    catalogListing,
    totalUnits,
    avgPricePerUnit
  );

  // Show loading state during hydration
  if (!isMounted) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="mb-6 h-60 rounded-lg bg-gray-200" />
          <div className="mb-4 h-20 rounded bg-gray-200" />
          <div className="h-32 rounded bg-gray-200" />
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Offer Management Modal - Opens when plus icon is clicked */}
      <BuildOfferModal />

      {/* Offer Footer Bar - Shows when products are selected */}
      {offerItems.length > 0 && <OfferFooterBar />}

      <div className="space-y-6" id="catalog-pdf-root">
        {/* Top section - Catalog Display (mirrors ProductDisplay) */}
        <CatalogDisplay
          catalog={displayData}
          catalogListing={catalogListing}
          products={allEnhancedProducts}
        />

        {/* Metrics section - Catalog Metrics (mirrors ProductMetrics) */}
        <CatalogMetrics {...metricsData} />

        {/* Products Table - Catalog Products Table with real data */}
        <div className="relative">
          <div className={`${userType !== "buyer" ? "blur-sm" : ""}`}>
            <CatalogProductsTable catalogListing={catalogListing} />
          </div>
          {userType !== "buyer" && (
            <div
              className="absolute inset-0 z-10 flex items-center justify-center"
              data-pdf-ignore="true"
            >
              <ConditionalActionButton
                className="h-10 rounded-full bg-black px-6 text-white hover:bg-gray-800 hover:opacity-90"
                guestText="Sign In to View Catalog"
                itemName={catalogListing.title}
                onAuthenticatedClick={() => {
                  const el = document.getElementById("catalog-products-table");
                  if (el) {
                    el.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                requiredUserType="buyer"
                triggerAction="view_details"
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
