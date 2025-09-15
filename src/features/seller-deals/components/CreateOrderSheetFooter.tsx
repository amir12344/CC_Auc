"use client";

import { Button } from "@/src/components/ui/button";
import { isValidCurrency } from "@/src/features/auctions/services/auctionQueryService";
import { useIsMobile } from "@/src/hooks/use-mobile";
import { cn } from "@/src/lib/utils";

import type { EnhancedSellerOrderItem } from "../types";

// Currency formatting function using isValidCurrency validation
const formatCurrencyAmount = (amount: number, currency: string): string => {
  let validCurrency = currency;
  if (!isValidCurrency(currency)) {
    validCurrency = "USD"; // Default to USD if invalid currency
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: validCurrency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

interface CreateOrderSheetFooterProps {
  orderItems: EnhancedSellerOrderItem[];
  totalUnits: number;
  totalValue: number;
  averagePrice: number;
  onClose: () => void;
  onCreateOrder: () => void;
}

export function CreateOrderSheetFooter({
  orderItems,
  totalUnits,
  totalValue,
  averagePrice,
  onClose,
  onCreateOrder,
}: CreateOrderSheetFooterProps) {
  const isMobile = useIsMobile();

  return (
    <footer className="sticky bottom-0 border-t border-gray-200 bg-white px-6 py-4 sm:px-10 md:px-12">
      <div className="flex items-center justify-between gap-4">
        {/* Order Summary - Single Row */}
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Total Units:</span>
            <span className="font-medium">{totalUnits}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Total Value:</span>
            <span className="font-medium">
              {orderItems.length > 0
                ? formatCurrencyAmount(totalValue, orderItems[0].currency)
                : "-"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Avg Price/Unit:</span>
            <span className="font-medium">
              {orderItems.length > 0
                ? formatCurrencyAmount(averagePrice, orderItems[0].currency)
                : "-"}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className={cn("flex gap-2", isMobile ? "flex-col" : "flex-row")}>
          <Button
            className="rounded-full"
            onClick={onClose}
            size={isMobile ? "default" : "sm"}
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            className="rounded-full"
            disabled={orderItems.length === 0}
            onClick={onCreateOrder}
            size={isMobile ? "default" : "sm"}
          >
            Create Order
          </Button>
        </div>
      </div>
    </footer>
  );
}
