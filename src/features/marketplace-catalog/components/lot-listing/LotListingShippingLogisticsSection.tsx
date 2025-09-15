"use client";

import type React from "react";

import { AlertTriangle, FileText, Info, Package, Truck } from "lucide-react";

import {
  fileToDbConditionBiMap,
  fileToDbFreightBiMap,
  fileToDbLengthUnitTypeBiMap,
  fileToDbLotConditionBiMap,
  fileToDbLotPackagingBiMap,
  fileToDbShippingBiMap,
  fileToDbWeightUnitTypeBiMap,
  textToInspectionStatusBiMap,
} from "@/amplify/functions/commons/converters/ListingTypeConverter";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/src/components/ui/accordion";

import type { DetailedLotListingWithManifest } from "../../services/lotListingQueryService";
import { formatCategoryDisplayName } from "../../utils/catalogUtils";

interface LotListingShippingLogisticsSectionProps {
  lotListing: DetailedLotListingWithManifest;
}

export const LotListingShippingLogisticsSection: React.FC<
  LotListingShippingLogisticsSectionProps
> = ({ lotListing }) => {
  // Convert enum values to display labels
  const convertEnumToLabel = (
    value: string | undefined,
    biMap: any,
    fallback?: string
  ) => {
    if (!value) return fallback || "Not specified";
    return (
      biMap.getKey(value) ||
      formatCategoryDisplayName(value) ||
      fallback ||
      value
    );
  };
  const formatBoolean = (v?: unknown) => {
    if (v === null || v === undefined) return "Not specified";
    if (typeof v === "boolean") return v ? "Yes" : "No";
    if (typeof v === "number")
      return v === 1 ? "Yes" : v === 0 ? "No" : String(v);
    if (typeof v === "string") {
      const s = v.trim().toLowerCase();
      if (["true", "yes", "y", "1"].includes(s)) return "Yes";
      if (["false", "no", "n", "0"].includes(s)) return "No";
      return s || "Not specified";
    }
    return String(v);
  };
  const formatValue = (v?: string | number | boolean | null) => {
    if (typeof v === "boolean") return formatBoolean(v);
    if (v === null || v === undefined || v === "") return "Not specified";
    return String(v);
  };

  const rows = (items: Array<{ key: string; value: React.ReactNode }>) => (
    <div className="divide-y divide-gray-200">
      {items.map(({ key, value }, index) => (
        <div
          className={`px-4 py-3 sm:px-8 sm:py-4 ${index % 2 === 0 ? "bg-white" : "bg-gray-50/30"} transition-colors hover:bg-blue-50/30`}
          key={key}
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-4">
            <div className="sm:w-1/3">
              <h4 className="text-sm font-semibold tracking-wide text-gray-900 uppercase">
                {key}
              </h4>
            </div>
            <div className="sm:w-2/3">
              <p className="leading-relaxed text-gray-700">{value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Get the actual dimension type value for display
  const dimensionTypeValue =
    convertEnumToLabel(
      lotListing.pallet_dimension_type,
      fileToDbLengthUnitTypeBiMap,
      lotListing.pallet_dimension_type
    ) || "Not specified";

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-8">
      {/* Header */}
      <div className="mb-4 flex items-center gap-4 sm:mb-8">
        <div className="rounded-lg bg-gray-50 p-2">
          <FileText className="h-6 w-6 text-gray-600" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-900">
            Additional Details & Shipping
          </h3>
          <p className="mt-1 text-gray-600">
            Item specifications and logistics information
          </p>
        </div>
      </div>

      <Accordion
        className="w-full space-y-4 sm:space-y-6"
        defaultValue={["additional"]}
        type="multiple"
      >
        {/* Additional Details */}
        <AccordionItem
          className="overflow-hidden rounded-xl border border-gray-200 shadow-sm"
          value="additional"
        >
          <AccordionTrigger className="px-4 py-4 transition-colors hover:bg-gray-50 hover:no-underline sm:px-8 sm:py-6">
            <div className="flex w-full items-center gap-4">
              <div className="rounded-lg bg-green-50 p-3">
                <Package className="h-6 w-6" style={{ color: "#43CD66" }} />
              </div>
              <div className="text-left">
                <span className="text-xl font-bold text-gray-900">
                  Additional Details
                </span>
                <p className="mt-1 text-gray-600">
                  Resale, inspection, and notes
                </p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="p-0">
            <div className="bg-gray-50/50">
              {rows([
                {
                  key: "RESALE REQUIREMENT",
                  value: formatValue(lotListing.resale_requirement),
                },
                {
                  key: "ACCESSORIES / COMPLETENESS",
                  value: formatValue(lotListing.accessories),
                },
                {
                  key: "INSPECTION STATUS",
                  value: convertEnumToLabel(
                    lotListing.inspection_status,
                    textToInspectionStatusBiMap
                  ),
                },
                {
                  key: "COSMETIC CONDITION",
                  value: convertEnumToLabel(
                    lotListing.lot_condition,
                    fileToDbLotConditionBiMap
                  ),
                },
                {
                  key: "EXPIRY DATE",
                  value: lotListing.expiry_date
                    ? new Date(lotListing.expiry_date).toLocaleDateString()
                    : "Not specified",
                },
              ])}

              {(lotListing.seller_notes ||
                lotListing.additional_information ||
                lotListing.offer_requirements) && (
                <div className="border-t border-gray-200 bg-white">
                  {lotListing.seller_notes && (
                    <div className="px-4 py-4 sm:px-8 sm:py-6">
                      <div className="flex items-start gap-4 rounded-lg bg-yellow-50 p-4">
                        <AlertTriangle className="h-5 w-5 text-yellow-600" />
                        <div>
                          <h4 className="mb-2 text-sm font-semibold tracking-wide text-yellow-900 uppercase">
                            Seller Notes
                          </h4>
                          <p className="leading-relaxed text-yellow-800">
                            {lotListing.seller_notes}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  {lotListing.additional_information && (
                    <div className="border-t border-gray-200 px-4 py-4 sm:px-8 sm:py-6">
                      <div className="flex items-start gap-4 rounded-lg bg-gray-50 p-4">
                        <FileText className="h-5 w-5 text-gray-600" />
                        <div>
                          <h4 className="mb-2 text-sm font-semibold tracking-wide text-gray-900 uppercase">
                            Additional Information
                          </h4>
                          <p className="leading-relaxed text-gray-700">
                            {lotListing.additional_information}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  {lotListing.offer_requirements && (
                    <div className="border-t border-gray-200 px-4 py-4 sm:px-8 sm:py-6">
                      <div className="flex items-start gap-4 rounded-lg bg-orange-50 p-4">
                        <AlertTriangle className="h-5 w-5 text-orange-600" />
                        <div>
                          <h4 className="mb-2 text-sm font-semibold tracking-wide text-orange-900 uppercase">
                            Offer Requirements
                          </h4>
                          <p className="leading-relaxed text-orange-800">
                            {lotListing.offer_requirements}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Shipping & Logistics */}
        <AccordionItem
          className="overflow-hidden rounded-xl border border-gray-200 shadow-sm"
          value="shipping"
        >
          <AccordionTrigger className="px-4 py-4 transition-colors hover:bg-gray-50 hover:no-underline sm:px-8 sm:py-6">
            <div className="flex w-full items-center gap-4">
              <div className="rounded-lg bg-green-50 p-3">
                <Truck className="h-6 w-6" style={{ color: "#43CD66" }} />
              </div>
              <div className="text-left">
                <span className="text-xl font-bold text-gray-900">
                  Shipping & Logistics
                </span>
                <p className="mt-1 text-gray-600">
                  Transportation and delivery information
                </p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="p-0">
            <div className="bg-gray-50/50">
              {rows([
                {
                  key: "WAREHOUSE LOCATION",
                  value: formatValue(lotListing.location),
                },
                {
                  key: "SHIPPING TYPE",
                  value: convertEnumToLabel(
                    lotListing.lot_shipping_type,
                    fileToDbShippingBiMap
                  ),
                },
                {
                  key: "FREIGHT TYPE",
                  value: convertEnumToLabel(
                    lotListing.lot_freight_type,
                    fileToDbFreightBiMap
                  ),
                },
                {
                  key: "ESTIMATED WEIGHT",
                  value:
                    lotListing.estimated_weight && lotListing.weight_type
                      ? `${lotListing.estimated_weight} ${convertEnumToLabel(lotListing.weight_type, fileToDbWeightUnitTypeBiMap, lotListing.weight_type)}`
                      : "Not specified",
                },
                {
                  key: "WEIGHT TYPE",
                  value: convertEnumToLabel(
                    lotListing.weight_type,
                    fileToDbWeightUnitTypeBiMap
                  ),
                },
                {
                  key: "LOT PACKAGING",
                  value: convertEnumToLabel(
                    lotListing.lot_packaging,
                    fileToDbLotPackagingBiMap
                  ),
                },
                { key: "HAZMAT", value: formatBoolean(lotListing.is_hazmat) },
                {
                  key: "FDA REGISTERED",
                  value: formatBoolean(lotListing.is_fda_registered),
                },
                {
                  key: "REFRIGERATED",
                  value: formatBoolean(lotListing.is_refrigerated),
                },
                {
                  key: "PALLET STACKABLE",
                  value: formatBoolean(lotListing.pallet_stackable),
                },
                {
                  key: "PALLET DIMENSION (L×W×H)",
                  value:
                    lotListing.pallet_length &&
                    lotListing.pallet_width &&
                    lotListing.pallet_height
                      ? `${lotListing.pallet_length}×${lotListing.pallet_width}×${lotListing.pallet_height} ${dimensionTypeValue}`
                      : "Not specified",
                },
                {
                  key: "PALLET HEIGHT",
                  value: formatValue(lotListing.pallet_height),
                },
                {
                  key: "NUMBER OF PALLETS",
                  value: formatValue(lotListing.number_of_pallets),
                },
                {
                  key: "PALLET SPACES",
                  value: formatValue(lotListing.pallet_spaces),
                },
                {
                  key: "NUMBER OF SHIPMENTS",
                  value: formatValue(lotListing.number_of_shipments),
                },
                {
                  key: "NUMBER OF TRUCKLOADS",
                  value: formatValue(lotListing.number_of_truckloads),
                },
              ])}

              {/* Shipping Notes */}
              <div className="border-t border-gray-200 bg-green-50 px-4 py-4 sm:px-8 sm:py-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 rounded-lg bg-green-100 p-2">
                    <Info className="h-5 w-5" style={{ color: "#43CD66" }} />
                  </div>
                  <div className="flex-1">
                    <h4 className="mb-3 text-sm font-semibold tracking-wide text-gray-900 uppercase">
                      Shipping Notes
                    </h4>
                    <p className="leading-relaxed text-gray-700">
                      {lotListing.shipping_notes || "NA"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

LotListingShippingLogisticsSection.displayName =
  "LotListingShippingLogisticsSection";
