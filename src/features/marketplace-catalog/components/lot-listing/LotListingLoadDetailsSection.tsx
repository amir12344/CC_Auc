"use client";

import React from "react";

import { Box, Info, Package, ShieldCheck, Tag, Truck } from "lucide-react";

import {
  fileToDbLotConditionBiMap,
  fileToDbLotPackagingBiMap,
  textToListingSourceNameBiMap,
  textToListingSourceTypeBiMap,
  textToLoadProgramTypeBiMap,
  textToLoadTypeBiMap,
  textToLotListingTypeBiMap,
} from "@/amplify/functions/commons/converters/ListingTypeConverter";

import type { DetailedLotListingWithManifest } from "../../services/lotListingQueryService";
import { formatCategoryDisplayName } from "../../utils/catalogUtils";

interface LotListingLoadDetailsSectionProps {
  lotListing: DetailedLotListingWithManifest;
}

/**
 * LotListingLoadDetailsSection Component
 *
 * Load Details & Source Information section using LotListingMetrics design pattern
 * Shows load information, condition, and source details in a clean grid layout
 */
export const LotListingLoadDetailsSection: React.FC<
  LotListingLoadDetailsSectionProps
> = ({ lotListing }) => {
  // Convert enums to human-friendly labels
  const loadType = lotListing.load_type
    ? textToLoadTypeBiMap.getKey(lotListing.load_type as any) ||
      formatCategoryDisplayName(lotListing.load_type)
    : "N/A";
  const numberOfPallets =
    lotListing.number_of_pallets !== undefined &&
    lotListing.number_of_pallets !== null
      ? `${lotListing.number_of_pallets}`
      : "N/A";
  const lotType = lotListing.listing_type
    ? textToLotListingTypeBiMap.getKey(lotListing.listing_type as any) ||
      formatCategoryDisplayName(lotListing.listing_type)
    : "N/A";
  const packaging = lotListing.lot_packaging
    ? fileToDbLotPackagingBiMap.getKey(lotListing.lot_packaging as any) ||
      formatCategoryDisplayName(lotListing.lot_packaging)
    : "N/A";
  const condition = lotListing.lot_condition
    ? fileToDbLotConditionBiMap.getKey(lotListing.lot_condition as any) ||
      formatCategoryDisplayName(lotListing.lot_condition)
    : "N/A";
  const sourceType = lotListing.source_type
    ? textToListingSourceTypeBiMap.getKey(lotListing.source_type as any) ||
      formatCategoryDisplayName(lotListing.source_type)
    : "N/A";
  const sourceName = lotListing.source_name
    ? textToListingSourceNameBiMap.getKey(lotListing.source_name as any) ||
      formatCategoryDisplayName(lotListing.source_name)
    : "N/A";
  const loadProgramType = (lotListing as any).load_program_type
    ? textToLoadProgramTypeBiMap.getKey(
        (lotListing as any).load_program_type
      ) || formatCategoryDisplayName((lotListing as any).load_program_type)
    : "N/A";
  const programType = (lotListing as any).program_type
    ? formatCategoryDisplayName((lotListing as any).program_type)
    : "N/A";

  const metrics = [
    {
      title: "Load Type",
      value: loadType,
      icon: <Truck className="h-4 w-4 text-slate-500" />,
    },
    {
      title: "Number of Pallets",
      value: numberOfPallets,
      icon: <Package className="h-4 w-4 text-slate-500" />,
    },
    {
      title: "Lot Type",
      value: lotType,
      icon: <Tag className="h-4 w-4 text-slate-500" />,
    },
    {
      title: "Packaging",
      value: packaging,
      icon: <Box className="h-4 w-4 text-slate-500" />,
    },
    {
      title: "Condition",
      value: condition,
      icon: <Tag className="h-4 w-4 text-slate-500" />,
    },
    {
      title: "Source Type",
      value: sourceType,
      icon: <Info className="h-4 w-4 text-slate-500" />,
    },
    {
      title: "Source Name",
      value: sourceName,
      icon: <ShieldCheck className="h-4 w-4 text-slate-500" />,
    },
    {
      title: "Load Program Type",
      value: loadProgramType,
      icon: <Tag className="h-4 w-4 text-slate-500" />,
    },
    {
      title: "Program Type",
      value: programType,
      icon: <Tag className="h-4 w-4 text-slate-500" />,
    },
  ];

  return (
    <div className="border-t border-gray-200 py-6">
      <h3 className="mb-4 text-lg font-semibold text-gray-900">
        Load Details & Source Information
      </h3>
      <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.map((metric) => (
          <div className="flex items-start gap-2" key={metric.title}>
            <div className="mt-0.5 shrink-0">{metric.icon}</div>
            <div className="min-w-0">
              <div className="mb-0.5 text-xs font-medium text-slate-500">
                {metric.title}
              </div>
              <div className="text-[15px] font-medium text-slate-800">
                {metric.value}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
