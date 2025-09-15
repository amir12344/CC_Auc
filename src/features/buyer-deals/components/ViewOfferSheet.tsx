"use client";

import Image from "next/image";
import { useEffect } from "react";

import { useQuery } from "@tanstack/react-query";
import { ImageIcon, Package, X } from "lucide-react";

import { Badge } from "@/src/components/ui/badge";
import { QUERY_KEYS } from "@/src/shared/constants/api";

import { fetchBuyerOfferDetails } from "../services/offerDetailsService";
import type { BuyerOffer } from "../types";
import type {
  BuyerOfferDetails,
  BuyerOfferItem,
} from "../types/offer-details.types";

// Utility function to format currency
const formatCurrency = (amount: number, currency = "USD"): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
};

// Utility function to format date with "Created on" prefix
const formatOfferDateWithPrefix = (dateString: string): string => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return `Created on ${date.toLocaleDateString("en-US", options)}`;
};

// Utility function to format offer status for display
const formatOfferStatus = (status: string): string => {
  return status
    .replace(/_/g, " ") // Replace underscores with spaces
    .replace(/\b\w/g, (l) => l.toUpperCase()); // Capitalize each word
};

interface ViewOfferSheetProps {
  offer: BuyerOffer;
  isOpen: boolean;
  onCloseAction: () => void;
}

export function ViewOfferSheet({
  offer,
  isOpen,
  onCloseAction,
}: ViewOfferSheetProps) {
  // Lock background scroll when sheet is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [isOpen]);

  // Handle close action
  const handleClose = () => {
    onCloseAction();
  };

  // Fetch offer details
  const { data: offerDetails, isLoading } = useQuery<BuyerOfferDetails | null>({
    queryKey: [QUERY_KEYS.OFFER_DETAILS(offer.id)],
    queryFn: () => fetchBuyerOfferDetails(offer.id),
    enabled: isOpen && Boolean(offer.id),
  });

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={handleClose}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            handleClose();
          }
        }}
        role="button"
        tabIndex={0}
      />

      {/* Sheet */}
      <div className="relative ml-auto flex h-full w-full max-w-lg flex-col bg-white shadow-xl sm:max-w-2xl lg:max-w-4xl">
        {/* Header with close button */}
        <div className="absolute top-4 right-4 z-20">
          <div className="flex items-center gap-2">
            <button
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-black text-white shadow-sm transition-colors hover:bg-gray-800"
              onClick={handleClose}
              type="button"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <header className="sticky top-0 z-10 border-b border-gray-200 bg-white">
          <div className="px-4 py-4 sm:px-6 sm:py-6 lg:px-10 lg:py-6">
            <div className="flex flex-col gap-3 sm:gap-4">
              <div>
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-xl bg-gray-100 sm:h-16 sm:w-16 sm:rounded-2xl">
                    {offerDetails?.imageUrl ? (
                      <div
                        className="h-10 w-10 rounded-xl bg-gray-200 sm:h-14 sm:w-14 sm:rounded-2xl"
                        style={{
                          backgroundImage: `url(${offerDetails.imageUrl})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }}
                      />
                    ) : (
                      <ImageIcon className="h-6 w-6 text-gray-400 sm:h-8 sm:w-8" />
                    )}
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
                      {offerDetails?.title || offer.title}
                    </h1>
                    <p className="text-sm text-gray-500">
                      {formatOfferDateWithPrefix(offerDetails?.createdAt || "")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    className="bg-transparent text-xs font-normal"
                    variant="outline"
                  >
                    {formatOfferStatus(
                      offerDetails?.offerStatus || offer.offerStatus
                    )}
                  </Badge>
                </div>

                <div className="text-right">
                  <div className="text-xl font-bold text-gray-900 sm:text-2xl">
                    {formatCurrency(
                      offerDetails?.totalOfferValue || offer.totalOfferValue,
                      offerDetails?.currency || offer.currency
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    {offerDetails?.currency || offer.currency}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-4 pt-6 pb-24 sm:px-6 sm:pt-6 sm:pb-6 lg:px-10">
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                Loading offer details...
              </div>
            </div>
          )}

          {offerDetails && (
            <>
              {/* Offer Items */}
              <div className="rounded-xl border border-gray-200 p-4 sm:rounded-2xl sm:p-6">
                <h3 className="mb-4 text-base font-semibold text-gray-900 sm:mb-6 sm:text-lg">
                  Offer Items
                </h3>
                <div className="space-y-3 sm:space-y-4">
                  {offerDetails.offerItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 rounded-lg border border-gray-100 p-3 sm:gap-4 sm:rounded-xl sm:p-4"
                    >
                      <div className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-lg bg-gray-100 sm:h-16 sm:w-16 sm:rounded-xl">
                        {item.imageUrl ? (
                          <Image
                            alt={item.productTitle}
                            className="h-10 w-10 rounded-lg object-cover sm:h-14 sm:w-14 sm:rounded-xl"
                            height={56}
                            src={item.imageUrl}
                            width={56}
                          />
                        ) : (
                          <ImageIcon className="h-6 w-6 text-gray-400 sm:h-8 sm:w-8" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="truncate text-sm font-semibold text-gray-900 sm:text-base">
                          {item.variantName}
                        </h4>
                        {item.variantSku && (
                          <p className="text-xs text-gray-500">
                            SKU: {item.variantSku}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900 sm:text-base">
                          {formatCurrency(item.totalPrice, item.currency)}
                        </div>
                        <div className="text-xs text-gray-600 sm:text-sm">
                          {item.quantity} ×{" "}
                          {formatCurrency(item.unitPrice, item.currency)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {!(isLoading || offerDetails) && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="text-lg text-gray-500">Offer not found</div>
                <p className="text-sm text-gray-400">
                  The requested offer could not be loaded.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
