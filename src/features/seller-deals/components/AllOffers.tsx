"use client";

import Image from "next/image";
import { useCallback, useMemo, useState } from "react";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Copy } from "lucide-react";

import { fileToDbCategoryBiMap } from "@/amplify/functions/commons/converters/ListingTypeConverter";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Skeleton } from "@/src/components/ui/skeleton";
import { QUERY_KEYS } from "@/src/shared/constants/api";

import { fetchSellerOffers } from "../services/sellerQueryService";
import type { SellerOffer } from "../types";
import { CreateOrderSheet } from "./CreateOrderSheet";

export default function AllOffers() {
  const queryClient = useQueryClient();
  const { data: deals = [], isLoading } = useQuery<SellerOffer[]>({
    queryKey: [QUERY_KEYS.SELLER_OFFERS],
    queryFn: fetchSellerOffers,
  });

  const [selectedCatalogOfferId, setSelectedCatalogOfferId] = useState<
    string | null
  >(null);
  const [selectedCatalogListingPublicId, setSelectedCatalogListingPublicId] =
    useState<string | null>(null);
  const [selectedOffer, setSelectedOffer] = useState<SellerOffer | null>(null);
  const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false);
  const [copiedOfferId, setCopiedOfferId] = useState<string | null>(null);

  const handleOfferClick = useCallback(
    (catalogOfferId: string, catalogListingPublicId: string) => {
      const offer = deals.find(
        (deal) => deal.catalog_offer_id === catalogOfferId
      );
      if (offer) {
        setSelectedOffer(offer);
        setSelectedCatalogOfferId(catalogOfferId);
        setSelectedCatalogListingPublicId(catalogListingPublicId);
        setIsCreateOrderOpen(true);
      }
    },
    [deals]
  );

  const handleCloseCreateOrder = useCallback(() => {
    setIsCreateOrderOpen(false);
    setSelectedCatalogOfferId(null);
    setSelectedCatalogListingPublicId(null);
    setSelectedOffer(null);
  }, []);

  const formatPrice = useCallback((price: number | null | undefined) => {
    if (typeof price !== "number" || price === null) {
      return null;
    }
    return price.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }, []);

  const handleCopyOfferId = useCallback(async (offerId: string) => {
    try {
      await navigator.clipboard.writeText(offerId);
      setCopiedOfferId(offerId);
      setTimeout(() => setCopiedOfferId(null), 2000);
    } catch {
      // Failed to copy offer ID
    }
  }, []);

  const content = useMemo(() => {
    if (isLoading) {
      return Array.from({ length: 3 }).map((_, i) => (
        <div
          className="animate-pulse rounded-lg bg-white p-4"
          key={`loading-skeleton-${i}-${Date.now()}`}
        >
          <div className="flex items-center space-x-4">
            <Skeleton className="h-20 w-20 rounded-md" />
            <div className="flex-1">
              <Skeleton className="mb-2 h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <div className="flex flex-col items-end gap-1">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-3 w-12" />
            </div>
          </div>
        </div>
      ));
    }

    if (deals.length === 0) {
      return (
        <div className="rounded-lg bg-white p-8 text-center">
          <p className="text-gray-500">No deals found.</p>
        </div>
      );
    }

    return deals.map((deal) => (
      <div
        className="border-b border-gray-200 py-4 hover:bg-gray-50"
        key={deal.id}
      >
        <div className="flex">
          <div className="mr-4 h-24 w-24 flex-shrink-0 overflow-hidden">
            <Image
              alt={deal.title || "Product image"}
              className="h-full w-full rounded-sm object-cover"
              height={96}
              loading="lazy"
              sizes="96px"
              src={deal.imageUrl || "/images/placeholder.png"}
              unoptimized
              width={96}
            />
          </div>

          <div className="min-w-0 flex-1">
            {/* Mobile Layout */}
            <div className="block sm:hidden">
              {/* Title and Category */}
              <div className="mb-3">
                <h3 className="mb-1 text-lg leading-tight font-semibold">
                  {deal.title || "Untitled Deal"}
                </h3>
                <div className="text-xs text-gray-500">
                  <span>
                    {deal.category
                      ? fileToDbCategoryBiMap.getKey(deal.category as never)
                      : "Uncategorized"}
                  </span>
                </div>
              </div>

              {/* Price and Offer Info */}
              <div className="mb-4">
                {formatPrice(deal.totalOfferValue) && (
                  <div className="mb-2 text-lg font-bold">
                    ${formatPrice(deal.totalOfferValue)} {deal.currency}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Badge
                    className="flex-shrink-0 px-2 py-0.5 text-xs"
                    variant="secondary"
                  >
                    Offer ID
                  </Badge>
                  <div className="flex min-w-0 flex-1 items-center gap-1">
                    <span className="truncate text-xs font-medium text-gray-600">
                      {deal.id}
                    </span>
                    <button
                      className="flex-shrink-0 rounded p-1 transition-colors hover:bg-gray-100"
                      onClick={() => handleCopyOfferId(deal.id)}
                      title="Copy Offer ID"
                      type="button"
                    >
                      {copiedOfferId === deal.id ? (
                        <Check className="h-3 w-3 text-green-600" />
                      ) : (
                        <Copy className="h-3 w-3 cursor-pointer text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Status and Button */}
              <div className="flex items-center justify-between gap-3">
                <Badge
                  className="flex-shrink-0 bg-transparent text-xs font-normal"
                  variant="outline"
                >
                  {deal.offerStatus || "Status Unknown"}
                </Badge>

                {deal.offerStatus !== "accepted" && (
                  <Button
                    className="flex-shrink-0 cursor-pointer rounded-full"
                    onClick={() =>
                      handleOfferClick(
                        deal.catalog_offer_id,
                        deal.catalogListingPublicId
                      )
                    }
                    size="sm"
                  >
                    Create Order
                  </Button>
                )}
              </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden sm:block">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1">
                  <h3 className="text-lg leading-tight font-semibold">
                    {deal.title || "Untitled Deal"}
                  </h3>
                  <div className="mt-1 text-xs text-gray-500">
                    <span>
                      {deal.category
                        ? fileToDbCategoryBiMap.getKey(deal.category as never)
                        : "Uncategorized"}
                    </span>
                  </div>
                </div>

                <div className="mt-2 text-right sm:mt-0 sm:ml-4">
                  {formatPrice(deal.totalOfferValue) && (
                    <div className="text-lg font-bold">
                      ${formatPrice(deal.totalOfferValue)} {deal.currency}
                    </div>
                  )}
                  <div className="mt-3 flex items-center justify-end gap-1">
                    <span className="max-w-[100px] truncate text-xs font-medium text-gray-600">
                      Offer ID
                    </span>
                    <div className="flex items-center gap-1">
                      <Badge
                        className="px-2 py-0.5 text-xs"
                        variant="secondary"
                      >
                        {deal.id}
                      </Badge>
                      <button
                        className="flex-shrink-0 rounded p-1 transition-colors hover:bg-gray-100"
                        onClick={() => handleCopyOfferId(deal.id)}
                        title="Copy Offer ID"
                        type="button"
                      >
                        {copiedOfferId === deal.id ? (
                          <Check className="h-3 w-3 text-green-600" />
                        ) : (
                          <Copy className="h-3 w-3 cursor-pointer text-gray-400 hover:text-gray-600" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <Badge
                  className="bg-transparent text-xs font-normal"
                  variant="outline"
                >
                  {deal.offerStatus || "Status Unknown"}
                </Badge>

                {deal.offerStatus !== "accepted" && (
                  <Button
                    className="ml-auto cursor-pointer rounded-full"
                    onClick={() =>
                      handleOfferClick(
                        deal.catalog_offer_id,
                        deal.catalogListingPublicId
                      )
                    }
                    size="sm"
                  >
                    Create Order
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    ));
  }, [
    deals,
    isLoading,
    formatPrice,
    handleOfferClick,
    copiedOfferId,
    handleCopyOfferId,
  ]);

  return (
    <div className="w-full max-w-4xl">
      <div className="space-y-px">{content}</div>

      {/* CreateOrderSheet Modal */}
      {selectedCatalogOfferId &&
        selectedCatalogListingPublicId &&
        selectedOffer && (
          <CreateOrderSheet
            billingAddressPublicId={selectedOffer.billingAddressPublicId || ""}
            catalogListingPublicId={selectedCatalogListingPublicId}
            catalogOfferId={selectedCatalogOfferId}
            offerPublicId={selectedOffer.id}
            onCloseAction={handleCloseCreateOrder}
            onOrderCreated={() => {
              // Order created successfully - invalidate cache to refresh data
              queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.SELLER_OFFERS],
              });
              // Don't close modal immediately - let user see success message first
              // Modal will close when user clicks OK on the success dialog
            }}
            open={isCreateOrderOpen}
            shippingAddressPublicId={
              selectedOffer.shippingAddressPublicId || ""
            }
          />
        )}
    </div>
  );
}
