"use client";

import Image from "next/image";
import * as React from "react";

import { Badge } from "@/src/components/ui/badge";
import { useIsMobile } from "@/src/hooks/use-mobile";
import { cn } from "@/src/lib/utils";

import type { SellerOrderItem } from "../types";

interface BuyerVariantsSectionProps {
  orderItems: SellerOrderItem[];
  isLoading?: boolean;
}

export function BuyerVariantsSection({
  orderItems,
  isLoading = false,
}: BuyerVariantsSectionProps) {
  const isMobile = useIsMobile();

  // Filter to show only buyer-selected items
  const buyerItems = React.useMemo(
    () => orderItems.filter((item) => item.isBuyerSelection),
    [orderItems]
  );

  const formatPrice = React.useCallback((price: number, currency: string) => {
    return `${price.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} ${currency}`;
  }, []);

  const calculateItemTotal = React.useCallback((item: SellerOrderItem) => {
    return item.requestedQuantity * item.buyerOfferPrice;
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h3 className={cn("font-medium", isMobile ? "text-base" : "text-lg")}>
            Buyer Selected Items
          </h3>
          <Badge className="text-xs" variant="secondary">
            Loading...
          </Badge>
        </div>
        <div className="animate-pulse rounded-lg bg-blue-50 p-4">
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div className="flex items-center gap-3" key={i}>
                <div className="h-12 w-12 rounded bg-blue-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 rounded bg-blue-200" />
                  <div className="h-3 w-1/2 rounded bg-blue-200" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (buyerItems.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h3 className={cn("font-medium", isMobile ? "text-base" : "text-lg")}>
            Buyer Selected Items
          </h3>
          <Badge className="text-xs" variant="secondary">
            0 items
          </Badge>
        </div>
        <div className="rounded-lg bg-blue-50 p-4">
          <p className="text-center text-sm text-blue-600">
            No items selected by buyer
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h3 className={cn("font-medium", isMobile ? "text-base" : "text-lg")}>
          Buyer Selected Items
        </h3>
        <Badge className="text-xs" variant="secondary">
          {buyerItems.length} {buyerItems.length === 1 ? "item" : "items"}
        </Badge>
      </div>

      {isMobile ? (
        // Mobile Card Layout
        <div className="space-y-3">
          {buyerItems.map((item) => (
            <div
              className="rounded-lg border-l-4 border-blue-400 bg-blue-50 p-4"
              key={item.variantId}
            >
              <div className="flex items-start gap-3">
                {/* Variant Image */}
                <div className="flex-shrink-0">
                  <div className="h-16 w-16 overflow-hidden rounded-md bg-white">
                    {item.imageUrl ? (
                      <Image
                        alt={item.variantName}
                        className="h-full w-full object-cover"
                        height={64}
                        src={item.imageUrl}
                        unoptimized
                        width={64}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gray-200">
                        <span className="text-xs text-gray-400">No image</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Variant Details */}
                <div className="min-w-0 flex-1">
                  <h4
                    className="truncate text-sm font-medium text-gray-900"
                    title={item.variantName}
                  >
                    {item.variantName}
                  </h4>
                  <p className="mt-1 text-xs text-gray-500">
                    SKU: {item.variantSku}
                  </p>

                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Quantity:</span>
                      <span className="font-medium">
                        {item.requestedQuantity}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Price/Unit:</span>
                      <span className="font-medium">
                        {formatPrice(item.buyerOfferPrice, item.currency)}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-blue-200 pt-1 text-sm font-semibold">
                      <span>Total:</span>
                      <span>
                        {formatPrice(calculateItemTotal(item), item.currency)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Desktop Table Layout
        <div className="overflow-hidden rounded-lg bg-blue-50">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-blue-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-blue-800 uppercase">
                    Product
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-blue-800 uppercase">
                    SKU
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium tracking-wider text-blue-800 uppercase">
                    Quantity
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium tracking-wider text-blue-800 uppercase">
                    Price/Unit
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium tracking-wider text-blue-800 uppercase">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-200">
                {buyerItems.map((item) => (
                  <tr className="hover:bg-blue-75" key={item.variantId}>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                          <div className="h-12 w-12 overflow-hidden rounded-md bg-white">
                            {item.imageUrl ? (
                              <Image
                                alt={item.variantName}
                                className="h-full w-full cursor-pointer object-cover transition-transform hover:scale-105"
                                height={48}
                                src={item.imageUrl}
                                title={`Preview: ${item.variantName}`}
                                unoptimized
                                width={48}
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-gray-200">
                                <span className="text-xs text-gray-400">
                                  No image
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p
                            className="truncate text-sm font-medium text-gray-900"
                            title={item.variantName}
                          >
                            {item.variantName}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {item.variantSku}
                    </td>
                    <td className="px-4 py-4 text-right text-sm font-medium text-gray-900">
                      {item.requestedQuantity}
                    </td>
                    <td className="px-4 py-4 text-right text-sm text-gray-900">
                      {formatPrice(item.buyerOfferPrice, item.currency)}
                    </td>
                    <td className="px-4 py-4 text-right text-sm font-semibold text-gray-900">
                      {formatPrice(calculateItemTotal(item), item.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
