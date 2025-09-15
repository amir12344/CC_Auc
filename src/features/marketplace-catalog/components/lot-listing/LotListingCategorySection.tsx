"use client";

import React from "react";

import { Package, Tag as TagIcon, Truck } from "lucide-react";

import {
  fileToDbFreightBiMap,
  fileToDbLotPackagingBiMap,
} from "@/amplify/functions/commons/converters/ListingTypeConverter";

import type { DetailedLotListingWithManifest } from "../../services/lotListingQueryService";
import { formatCategoryDisplayName } from "../../utils/catalogUtils";

interface LotListingCategorySectionProps {
  lotListing: DetailedLotListingWithManifest;
}

/**
 * LotListingCategorySection Component
 *
 * Category & Product Information section using LotListingMetrics design pattern
 * Shows category details, quantities, and additional information in a clean grid layout
 */
export const LotListingCategorySection: React.FC<
  LotListingCategorySectionProps
> = ({ lotListing }) => {
  // Build Category display: comma-separated (Primary, Secondary, Tertiary)
  const categoryNames = [
    lotListing.category,
    lotListing.category2,
    lotListing.category3,
  ]
    .filter(Boolean)
    .map((c) => formatCategoryDisplayName(c as string));
  const categoryDisplay =
    categoryNames.length > 0 ? categoryNames.join(", ") : "Not specified";

  // Build Subcategory display: comma-separated (Primary + Additional)
  const subcategoryNames = [
    lotListing.subcategory,
    lotListing.subcategory2,
    lotListing.subcategory3,
    lotListing.subcategory4,
    lotListing.subcategory5,
  ]
    .filter(Boolean)
    .map((s) => formatCategoryDisplayName(s as string));
  const subcategoryDisplay =
    subcategoryNames.length > 0 ? subcategoryNames.join(", ") : "Not specified";

  // Percent estimates can come for subcategory OR category; prefer subcategory if present
  const subcatEstimates = (lotListing.category_percent_estimates || [])
    .filter((e) => e && (e.subcategory || e.category))
    .map((e) => ({
      name: formatCategoryDisplayName((e.subcategory || e.category) as string),
      percent: e.percent,
    }));

  const seasonalTags = (lotListing.tags || [])
    .map((t) => t.tag_name)
    .filter(Boolean) as string[];

  const numberOfPallets = lotListing.number_of_pallets ?? null;

  // Human labels for enums
  const freightTypeLabel = lotListing.lot_freight_type
    ? fileToDbFreightBiMap.getKey(lotListing.lot_freight_type as any) ||
      formatCategoryDisplayName(lotListing.lot_freight_type)
    : "N/A";
  const packagingLabel = lotListing.lot_packaging
    ? fileToDbLotPackagingBiMap.getKey(lotListing.lot_packaging as any) ||
      formatCategoryDisplayName(lotListing.lot_packaging)
    : "N/A";

  return (
    <div className="border-t border-gray-200 py-6">
      <h3 className="mb-4 text-lg font-semibold text-gray-900">
        Category & Product Information
      </h3>
      <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* 1. Category (Primary, Secondary, Tertiary) */}
        <div className="flex items-start gap-2">
          <div className="mt-0.5 shrink-0">
            <TagIcon className="h-4 w-4 text-slate-500" />
          </div>
          <div className="min-w-0">
            <div className="mb-0.5 text-xs font-medium text-slate-500">
              Category
            </div>
            <div className="text-[15px] font-medium text-slate-800">
              {categoryDisplay}
            </div>
          </div>
        </div>

        {/* 2. Subcategory (Primary, Additional) */}
        <div className="flex items-start gap-2">
          <div className="mt-0.5 shrink-0">
            <TagIcon className="h-4 w-4 text-slate-500" />
          </div>
          <div className="min-w-0">
            <div className="mb-0.5 text-xs font-medium text-slate-500">
              Subcategory
            </div>
            <div className="text-[15px] font-medium text-slate-800">
              {subcategoryDisplay}
            </div>
          </div>
        </div>

        {/* 3. SubCategory % Estimates */}
        <div className="flex items-start gap-2">
          <div className="mt-0.5 shrink-0">
            <TagIcon className="h-4 w-4 text-slate-500" />
          </div>
          <div className="min-w-0">
            <div className="mb-1 text-xs font-medium text-slate-500">
              Category % Estimates
            </div>
            {subcatEstimates.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {subcatEstimates.map((e) => (
                  <span
                    key={e.name}
                    className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs text-slate-700"
                  >
                    {e.name}: {e.percent.toFixed(0)}%
                  </span>
                ))}
              </div>
            ) : (
              <div className="text-[15px] font-medium text-slate-800">N/A</div>
            )}
          </div>
        </div>

        {/* 4. Estimated Total Units (and Case Packs) */}
        <div className="flex items-start gap-2">
          <div className="mt-0.5 shrink-0">
            <Package className="h-4 w-4 text-slate-500" />
          </div>
          <div className="min-w-0">
            <div className="mb-0.5 text-xs font-medium text-slate-500">
              Estimated Total Units
            </div>
            <div className="text-[15px] font-medium text-slate-800">
              {lotListing.total_units
                ? lotListing.total_units.toLocaleString()
                : "N/A"}
            </div>
            {lotListing.estimated_case_packs !== undefined && (
              <div className="text-[13px] text-slate-600">
                Total Case Packs: {lotListing.estimated_case_packs}
              </div>
            )}
          </div>
        </div>

        {/* 5. Number of Pallets */}
        <div className="flex items-start gap-2">
          <div className="mt-0.5 shrink-0">
            <Package className="h-4 w-4 text-slate-500" />
          </div>
          <div className="min-w-0">
            <div className="mb-0.5 text-xs font-medium text-slate-500">
              Number of Pallets
            </div>
            <div className="text-[15px] font-medium text-slate-800">
              {numberOfPallets !== null ? numberOfPallets : "N/A"}
            </div>
          </div>
        </div>

        {/* 6. Freight Type | LOT Packaging */}
        <div className="flex items-start gap-2">
          <div className="mt-0.5 shrink-0">
            <Truck className="h-4 w-4 text-slate-500" />
          </div>
          <div className="min-w-0">
            <div className="mb-0.5 text-xs font-medium text-slate-500">
              Freight Type | LOT Packaging
            </div>
            <div className="text-[15px] font-medium text-slate-800">
              {freightTypeLabel} | {packagingLabel}
            </div>
          </div>
        </div>

        {/* 7. Seasonal/Event Tags */}
        <div className="flex items-start gap-2">
          <div className="mt-0.5 shrink-0">
            <TagIcon className="h-4 w-4 text-slate-500" />
          </div>
          <div className="min-w-0">
            <div className="mb-1 text-xs font-medium text-slate-500">
              Seasonal/Event Tags
            </div>
            {seasonalTags.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {seasonalTags.map((name) => (
                  <span
                    key={name}
                    className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700"
                  >
                    {name}
                  </span>
                ))}
              </div>
            ) : (
              <div className="text-[15px] font-medium text-slate-800">N/A</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
