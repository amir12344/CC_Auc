"use client";

import { useEffect, useState } from "react";

import { ConditionalActionButton } from "@/src/components/ui/ConditionalActionButton";
import { downloadManifestFile } from "@/src/features/marketplace-catalog/utils/manifestDownloader";
import { usePublicPageAuth } from "@/src/hooks/useAuthState";

import type { DetailedLotListingWithManifest } from "../../services/lotListingQueryService";
import { LotListingCategorySection } from "./LotListingCategorySection";
import { LotListingHeroSection } from "./LotListingHeroSection";
import { LotListingLoadDetailsSection } from "./LotListingLoadDetailsSection";
import {
  LotListingManifestTable,
  type LotListingAdditionalInfo,
} from "./LotListingManifestTable";
import { LotListingShippingLogisticsSection } from "./LotListingShippingLogisticsSection";

/**
 * Helper function to prepare lot additional info for the manifest table
 */
const prepareLotInfo = (
  lotListing: DetailedLotListingWithManifest
): LotListingAdditionalInfo => {
  return {
    lot_shipping_type: lotListing.lot_shipping_type,
    lot_freight_type: lotListing.lot_freight_type,
    number_of_pallets: lotListing.number_of_pallets,
    pallet_spaces: lotListing.pallet_spaces,
    pallet_length: lotListing.pallet_length,
    pallet_width: lotListing.pallet_width,
    pallet_height: lotListing.pallet_height,
    pallet_dimension_type: lotListing.pallet_dimension_type,
    pallet_stackable: lotListing.pallet_stackable,
    number_of_truckloads: lotListing.number_of_truckloads,
    number_of_shipments: lotListing.number_of_shipments,
    is_refrigerated: lotListing.is_refrigerated,
    is_fda_registered: lotListing.is_fda_registered,
    is_hazmat: lotListing.is_hazmat,
    inspection_status: lotListing.inspection_status,
    resale_requirement: lotListing.resale_requirement,
    seller_notes: lotListing.seller_notes,
    shipping_notes: lotListing.shipping_notes,
    additional_information: lotListing.additional_information,
    offer_requirements: lotListing.offer_requirements,
    accessories: lotListing.accessories,
  };
};

/**
 * LotListingDetailClient Component
 *
 * Redesigned client component for lot listing details page with 5-section layout:
 * 1. Hero section with image gallery and main listing info
 * 2. Category details, subcategories, estimates, pallets info
 * 3. Load type, packaging, condition, source details
 * 4. Manifest section (if available)
 * 5. Shipping & Logistics + Additional Details
 */

interface LotListingDetailClientProps {
  lotListing: DetailedLotListingWithManifest;
}

export function LotListingDetailClient({
  lotListing,
}: LotListingDetailClientProps) {
  const [isMounted, setIsMounted] = useState(false);
  const { userType } = usePublicPageAuth();

  // Ensure component is mounted on client-side for consistent hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const lotInfo = prepareLotInfo(lotListing);

  // Handle snapshot file download
  const handleDownloadSnapshot = async () => {
    if (!lotListing.manifest_snapshot_file_s3_key) {
      throw new Error("Manifest snapshot is not available");
    }
    await downloadManifestFile(
      lotListing.manifest_snapshot_file_s3_key,
      `${lotListing.title}-snapshot.xlsx`
    );
  };

  // Smooth scroll with sticky header offset utility
  const scrollToIdWithOffset = (id: string, fallbackOffset = 80) => {
    if (typeof window === "undefined") return;
    const el = document.getElementById(id);
    if (!el) return;
    const header = document.querySelector(
      "[data-sticky-header]"
    ) as HTMLElement | null;
    const offset = header?.offsetHeight ?? fallbackOffset;
    const y = el.getBoundingClientRect().top + window.pageYOffset - offset - 8;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  // Show loading state during hydration
  if (!isMounted) {
    return null;
  }

  return (
    <div className="space-y-8" id="lot-listing-root">
      {/* Section 1: Hero Image Gallery + Main Listing Info */}
      <LotListingHeroSection
        lotListing={lotListing}
        onDownloadSnapshot={handleDownloadSnapshot}
      />

      {/* Section 2: Category Details, Subcategories, Estimates, Pallets Info */}
      <LotListingCategorySection lotListing={lotListing} />

      {/* Section 3: Load Type, Packaging, Condition, Source Details */}
      <LotListingLoadDetailsSection lotListing={lotListing} />

      {/* Section 4: Manifest Section (If available) */}
      {lotListing.manifest_items && lotListing.manifest_items.length > 0 && (
        <div className="relative">
          <div className={`${userType !== "buyer" ? "blur-sm" : ""}`}>
            <LotListingManifestTable
              manifestItems={lotListing.manifest_items}
              lotTitle={lotListing.title}
              lotInfo={lotInfo}
            />
          </div>
          {userType !== "buyer" && (
            <div className="absolute inset-0 z-10 flex items-center justify-center">
              <ConditionalActionButton
                className="h-10 rounded-full bg-black px-6 text-white hover:bg-gray-800 hover:opacity-90"
                guestText="Sign In to View Manifest Details"
                itemName={lotListing.title}
                onAuthenticatedClick={() =>
                  scrollToIdWithOffset("lot-manifest-table")
                }
                requiredUserType="buyer"
                triggerAction="view_details"
              />
            </div>
          )}
        </div>
      )}

      {/* Section 5: Shipping & Logistics + Additional Details */}
      <LotListingShippingLogisticsSection lotListing={lotListing} />
    </div>
  );
}
