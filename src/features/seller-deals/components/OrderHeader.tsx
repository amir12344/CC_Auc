"use client";

import * as React from "react";

import { X } from "lucide-react";

import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";

interface OrderHeaderProps {
  offerTitle: string;
  offerValue: number;
  currency: string;
  offerStatus: string;
  onClose: () => void;
  className?: string;
}

interface OfferDetailsProps {
  title: string;
  value: number;
  currency: string;
  status: string;
}

interface CloseButtonProps {
  onClose: () => void;
}

// Utility function for price formatting
const formatPrice = (price: number): string => {
  return price.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

// Sub-component for offer details
const OfferDetails = React.memo(
  ({ title, value, currency, status }: OfferDetailsProps) => (
    <div className="min-w-0 flex-1">
      <h2
        className="truncate text-lg font-semibold text-gray-900"
        title={title}
      >
        {title}
      </h2>
      <div className="mt-1 flex items-center gap-3">
        <div className="text-xl font-bold text-gray-900">
          ${formatPrice(value)} {currency}
        </div>
        <Badge variant="outline" className="bg-transparent text-xs font-normal">
          {status}
        </Badge>
      </div>
    </div>
  )
);

OfferDetails.displayName = "OfferDetails";

// Sub-component for close button
const CloseButton = React.memo(({ onClose }: CloseButtonProps) => (
  <Button
    variant="ghost"
    size="sm"
    onClick={onClose}
    className="h-8 w-8 flex-shrink-0 p-0 hover:bg-gray-100"
    aria-label="Close order details"
  >
    <X className="h-4 w-4" />
    <span className="sr-only">Close order details</span>
  </Button>
));

CloseButton.displayName = "CloseButton";

export function OrderHeader({
  offerTitle,
  offerValue,
  currency,
  offerStatus,
  onClose,
  className,
}: OrderHeaderProps) {
  return (
    <header className={cn("border-b bg-white", className)}>
      <div className="flex items-start justify-between gap-4 p-4">
        <OfferDetails
          title={offerTitle}
          value={offerValue}
          currency={currency}
          status={offerStatus}
        />
        <CloseButton onClose={onClose} />
      </div>
    </header>
  );
}
