"use client";

import { X } from "lucide-react";

import { Button } from "@/src/components/ui/button";

import type { CatalogListingVariant } from "../types";

interface CreateOrderSheetHeaderProps {
  onClose: () => void;
  availableVariants: CatalogListingVariant[];
  onTakeAll: () => void;
}

export function CreateOrderSheetHeader({
  onClose,
  availableVariants,
  onTakeAll,
}: CreateOrderSheetHeaderProps) {
  const handleTakeAll = () => {
    onTakeAll();
  };

  return (
    <header className="sticky top-0 z-10 flex flex-col gap-3 border-b border-gray-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-10 sm:py-4 md:px-12">
      <div className="flex items-center justify-between sm:justify-start">
        <div className="flex-1">
          <h2 className="text-lg font-bold text-gray-900 sm:text-xl">
            Create Order
          </h2>
          <p className="text-xs text-gray-500 sm:text-sm">
            Refill and Modify Buyer Selected Items
          </p>
        </div>
        <Button
          className="rounded-full sm:hidden"
          onClick={onClose}
          size="sm"
          variant="ghost"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex gap-2 sm:gap-3">
        <Button
          className="flex-1 rounded-full text-xs sm:flex-none sm:text-sm"
          onClick={handleTakeAll}
          size="sm"
          variant="outline"
        >
          Take All
        </Button>
        <Button
          className="hidden rounded-full sm:flex"
          onClick={onClose}
          size="sm"
          variant="ghost"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
