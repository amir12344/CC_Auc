"use client";

import type React from "react";

import { FileText, Info, Package, Truck } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/src/components/ui/accordion";

import type { Auction } from "../types";

interface AuctionDetailsAccordionProps {
  /** Auction data object */
  auction: Auction;
  /** Optional className for styling */
  className?: string;
  /** Default open sections */
  defaultOpenSections?: string[];
}

/**
 * AuctionDetailsAccordion Component
 *
 * Displays detailed auction information in organized, collapsible sections.
 * Features:
 * - Details section with item specifications
 * - Shipping section with logistics information
 * - Clean key-value pair display
 * - Collapsible sections to save space
 * - Professional styling with icons
 * - Responsive design
 *
 * @param auction - Auction data object
 * @param className - Optional styling
 * @param defaultOpenSections - Sections to open by default
 */
export const AuctionDetailsAccordion: React.FC<
  AuctionDetailsAccordionProps
> = ({ auction, className, defaultOpenSections = ["details"] }) => {
  return (
    <div
      className={`rounded-xl border border-gray-200 bg-white p-8 shadow-sm ${className}`}
    >
      {/* Enhanced Header */}
      <div className="mb-8 flex items-center gap-4">
        <div className="rounded-lg bg-gray-50 p-2">
          <FileText className="h-6 w-6 text-gray-600" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-900">
            Additional Information
          </h3>
          <p className="mt-1 text-gray-600">
            Item details and shipping specifications
          </p>
        </div>
      </div>

      <Accordion
        className="w-full space-y-6"
        defaultValue={defaultOpenSections}
        type="multiple"
      >
        {/* Details Section */}
        <AccordionItem
          className="overflow-hidden rounded-xl border border-gray-200 shadow-sm"
          value="details"
        >
          <AccordionTrigger className="px-8 py-6 transition-colors hover:bg-gray-50 hover:no-underline">
            <div className="flex w-full items-center gap-4">
              <div className="rounded-lg bg-green-50 p-3">
                <Package className="h-6 w-6" style={{ color: "#43CD66" }} />
              </div>
              <div className="text-left">
                <span className="text-xl font-bold text-gray-900">
                  Details & Specifications
                </span>
                <p className="mt-1 text-gray-600">
                  Item condition, quantity, and requirements
                </p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="p-0">
            <div className="bg-gray-50/50">
              <div className="divide-y divide-gray-200">
                {/* Dynamic details from auction properties */}
                {[
                  {
                    key: "DESCRIPTION",
                    value: auction.description || "No description available",
                  },
                  {
                    key: "CONDITION",
                    value: auction.lot_condition || "Not specified",
                  },
                  {
                    key: "COSMETIC CONDITION",
                    value: auction.cosmetic_condition || "Not specified",
                  },
                  {
                    key: "ACCESSORIES",
                    value: auction.accessories || "Not specified",
                  },
                  {
                    key: "QUANTITY",
                    value: auction.total_units
                      ? `${auction.total_units} Units`
                      : "Not specified",
                  },
                  {
                    key: "EXT. RETAIL",
                    value: auction.total_ex_retail_price
                      ? new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: "USD",
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        }).format(auction.total_ex_retail_price)
                      : "Not specified",
                  },
                ].map(({ key, value }, index) => (
                  <div
                    className={`px-8 py-4 ${index % 2 === 0 ? "bg-white" : "bg-gray-50/30"} transition-colors hover:bg-blue-50/30`}
                    key={key}
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
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

              {/* Enhanced Seller Notes */}
              {auction.seller_notes && (
                <div className="border-t border-gray-200 bg-green-50 px-8 py-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 rounded-lg bg-green-100 p-2">
                      <Info className="h-5 w-5" style={{ color: "#43CD66" }} />
                    </div>
                    <div className="flex-1">
                      <h4 className="mb-3 text-sm font-semibold tracking-wide text-gray-900 uppercase">
                        Seller Notes
                      </h4>
                      <p className="leading-relaxed text-gray-700">
                        {auction.seller_notes}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Shipping Section */}
        <AccordionItem
          className="overflow-hidden rounded-xl border border-gray-200 shadow-sm"
          value="shipping"
        >
          <AccordionTrigger className="px-8 py-6 transition-colors hover:bg-gray-50 hover:no-underline">
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
              {/* Dynamic shipping details from auction properties */}
              <div className="divide-y divide-gray-200">
                {[
                  {
                    key: "SHIPPING TYPE",
                    value: auction.auction_shipping_type || "Not specified",
                  },
                  {
                    key: "FREIGHT TYPE",
                    value: auction.auction_freight_type || "Not specified",
                  },
                  {
                    key: "NUMBER OF PALLETS",
                    value: auction.number_of_pallets || "Not specified",
                  },
                  {
                    key: "NUMBER OF SHIPMENTS",
                    value: auction.number_of_shipments || "Not specified",
                  },
                  {
                    key: "NUMBER OF TRUCKLOADS",
                    value: auction.number_of_truckloads || "Not specified",
                  },
                  {
                    key: "ESTIMATED WEIGHT",
                    value:
                      auction.estimated_weight && auction.weight_type
                        ? `${auction.estimated_weight} ${auction.weight_type}`
                        : "Not specified",
                  },
                  {
                    key: "LOT PACKAGING",
                    value: auction.lot_packaging || "Not specified",
                  },
                  { key: "HAZMAT", value: auction.is_hazmat ? "Yes" : "No" },
                  {
                    key: "PALLET SPACES",
                    value: auction.pallet_spaces || "Not specified",
                  },
                ].map(({ key, value }, index) => (
                  <div
                    className={`px-8 py-4 ${index % 2 === 0 ? "bg-white" : "bg-gray-50/30"} transition-colors hover:bg-indigo-50/30`}
                    key={key}
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
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

              {/* Enhanced Shipping Notes */}
              <div className="border-t border-gray-200 bg-green-50 px-8 py-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 rounded-lg bg-green-100 p-2">
                    <Info className="h-5 w-5" style={{ color: "#43CD66" }} />
                  </div>
                  <div className="flex-1">
                    <h4 className="mb-3 text-sm font-semibold tracking-wide text-gray-900 uppercase">
                      Shipping Notes
                    </h4>
                    <p className="leading-relaxed text-gray-700">
                      {auction.shipping_notes || "NA"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Enhanced Shipping Information Link */}
              <div className="border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6">
                <div className="flex items-center gap-4">
                  <div className="rounded-lg bg-green-50 p-2 shadow-sm">
                    <Truck className="h-5 w-5" style={{ color: "#43CD66" }} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">
                      Need more shipping details?
                    </p>
                    <button
                      className="font-semibold text-blue-600 transition-colors hover:text-blue-700 hover:underline"
                      onClick={() => {
                        // Navigate to shipping information page
                      }}
                      type="button"
                    >
                      Visit our Shipping Information Center →
                    </button>
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

AuctionDetailsAccordion.displayName = "AuctionDetailsAccordion";
