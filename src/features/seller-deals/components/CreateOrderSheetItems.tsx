"use client";

import Image from "next/image";
import { memo, useCallback, useMemo, useState } from "react";

import { ChevronDown, ImageIcon, Plus, Search, Trash2 } from "lucide-react";

import { Button } from "@/src/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { isValidCurrency } from "@/src/features/auctions/services/auctionQueryService";

import type { CatalogListingVariant, EnhancedSellerOrderItem } from "../types";

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

interface CreateOrderSheetItemsProps {
  orderItems: EnhancedSellerOrderItem[];
  availableVariants: CatalogListingVariant[];
  variantsLoading: boolean;
  inputValues: { [key: string]: string };
  onQuantityChange: (itemId: string, newQuantity: number) => void;
  onPriceChange: (itemId: string, value: string) => void;
  onVariantSelection: (
    itemId: string,
    selectedVariant: CatalogListingVariant
  ) => void;
  onRemoveItem: (itemId: string) => void;
  onAddItem: () => void;
  onImageHover: (imageUrl: string, event: React.MouseEvent) => void;
  onImageLeave: () => void;
}

// Memoized display name function with cache to prevent recalculation
const displayNameCache = new Map<string, string>();

const getDisplayName = (
  item: EnhancedSellerOrderItem | CatalogListingVariant
): string => {
  const variantName =
    "variantName" in item ? item.variantName : item.variant_name;
  const cacheKey = variantName || "no-variant";

  if (displayNameCache.has(cacheKey)) {
    return displayNameCache.get(cacheKey)!;
  }

  let displayName: string;
  if (variantName) {
    // Use the variant name directly since it's already transformed in the service layer
    displayName = variantName;
  } else {
    displayName = "Select a variant";
  }

  displayNameCache.set(cacheKey, displayName);
  return displayName;
};

export const CreateOrderSheetItems = memo(function CreateOrderSheetItems({
  orderItems,
  availableVariants,
  variantsLoading,
  inputValues,
  onQuantityChange,
  onPriceChange,
  onVariantSelection,
  onRemoveItem,
  onAddItem,
  onImageHover,
  onImageLeave,
}: CreateOrderSheetItemsProps) {
  const [variantSearchTerm, setVariantSearchTerm] = useState<string>("");
  const [dropdownOpen, setDropdownOpen] = useState<{ [key: string]: boolean }>(
    {}
  );

  // Memoized filtered variants to prevent recalculation on every render
  const filteredVariants = useMemo(() => {
    // Get all variant SKUs that are already selected in orderItems
    const selectedVariantSkus = new Set(
      orderItems
        .filter((item) => item.variantSku) // Only items with variantSku
        .map((item) => item.variantSku)
    );

    return availableVariants.filter((variant) => {
      // Exclude variants that are already selected
      if (selectedVariantSkus.has(variant.variant_sku)) {
        return false;
      }

      // Apply search term filter
      if (variantSearchTerm) {
        return (
          variant.variant_name
            .toLowerCase()
            .includes(variantSearchTerm.toLowerCase()) ||
          variant.variant_sku
            .toLowerCase()
            .includes(variantSearchTerm.toLowerCase())
        );
      }

      return true;
    });
  }, [availableVariants, variantSearchTerm, orderItems]);

  // Memoized total price calculation for each item
  const calculateTotalPrice = useCallback(
    (item: EnhancedSellerOrderItem) => {
      const price = item.isBuyerSelection
        ? item.buyerOfferPrice
        : Number.parseFloat(inputValues[item.id]) || 0;
      return item.requestedQuantity * price;
    },
    [inputValues]
  );

  const handleVariantSelection = useCallback(
    (itemId: string, variant: CatalogListingVariant) => {
      onVariantSelection(itemId, variant);
      setDropdownOpen((prev) => ({ ...prev, [itemId]: false }));
      setVariantSearchTerm("");
    },
    [onVariantSelection]
  );

  const handleDropdownOpenChange = useCallback(
    (itemId: string, open: boolean) => {
      setDropdownOpen((prev) => ({
        ...prev,
        [itemId]: open,
      }));
      if (!open) {
        setVariantSearchTerm("");
      }
    },
    []
  );

  const handleImageHover = useCallback(
    (imageUrl: string, event: React.MouseEvent) => {
      onImageHover(imageUrl, event);
    },
    [onImageHover]
  );

  const handleQuantityChange = useCallback(
    (itemId: string, newQuantity: number) => {
      onQuantityChange(itemId, newQuantity);
    },
    [onQuantityChange]
  );

  const handlePriceChange = useCallback(
    (itemId: string, value: string) => {
      onPriceChange(itemId, value);
    },
    [onPriceChange]
  );

  const handleRemoveItem = useCallback(
    (itemId: string) => {
      onRemoveItem(itemId);
    },
    [onRemoveItem]
  );

  return (
    <main className="flex-1 overflow-y-auto">
      <div className="space-y-6">
        {/* Order Items */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Order Items</h3>

          {orderItems.length === 0 ? (
            <div className="rounded-lg border border-gray-200 p-6 text-center">
              <p className="text-gray-500">No items added yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orderItems.map((item) => (
                <div
                  className="rounded-lg border border-gray-200 p-4"
                  key={item.id}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    {/* Mobile Layout: Image and Details */}
                    <div className="flex gap-4 sm:contents">
                      {/* Item Image */}
                      <div className="flex-shrink-0">
                        {item.imageUrl ? (
                          <div
                            className="relative h-16 w-16 cursor-pointer"
                            onMouseEnter={(e) =>
                              handleImageHover(item.imageUrl!, e)
                            }
                            onMouseLeave={onImageLeave}
                          >
                            <Image
                              alt={getDisplayName(item)}
                              className="rounded object-cover"
                              fill
                              sizes="64px"
                              src={item.imageUrl}
                            />
                          </div>
                        ) : (
                          <div className="flex h-16 w-16 items-center justify-center rounded border bg-gray-100">
                            <ImageIcon className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                      </div>

                      {/* Item Details */}
                      <div className="min-w-0 flex-1">
                        {/* Variant Selection */}
                        {item.isSellerAddition && !item.variantId ? (
                          <div className="w-full">
                            <DropdownMenu
                              onOpenChange={(open) =>
                                handleDropdownOpenChange(item.id, open)
                              }
                              open={dropdownOpen[item.id]}
                            >
                              <DropdownMenuTrigger asChild>
                                <Button
                                  className="w-full justify-between truncate"
                                  title={getDisplayName(item)}
                                  variant="outline"
                                >
                                  <span>{getDisplayName(item)}</span>
                                  <ChevronDown className="h-4 w-4 flex-shrink-0 opacity-50" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="start"
                                avoidCollisions={true}
                                className="max-h-[100vh] w-80 overflow-hidden"
                                collisionPadding={8}
                                side="bottom"
                                sideOffset={4}
                              >
                                {/* Search Input */}
                                <div className="p-2">
                                  <div className="relative">
                                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                    <input
                                      className="w-full rounded border border-gray-300 py-1 pr-2 pl-8 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                      onChange={(e) =>
                                        setVariantSearchTerm(e.target.value)
                                      }
                                      placeholder="Search variants..."
                                      type="text"
                                      value={variantSearchTerm}
                                    />
                                  </div>
                                </div>
                                <div className="max-h-100 overflow-x-hidden overflow-y-auto">
                                  {variantsLoading ? (
                                    <div className="p-2 text-center text-sm text-gray-500">
                                      Loading variants...
                                    </div>
                                  ) : (
                                    filteredVariants.map((variant) => (
                                      <button
                                        className="flex w-full min-w-0 items-center gap-3 border-b p-3 text-left last:border-b-0 hover:bg-gray-50"
                                        key={variant.public_id}
                                        onClick={() =>
                                          handleVariantSelection(
                                            item.id,
                                            variant
                                          )
                                        }
                                        type="button"
                                      >
                                        {variant.imageUrl ? (
                                          <div className="relative h-10 w-10 flex-shrink-0">
                                            <Image
                                              alt={getDisplayName(variant)}
                                              className="rounded border object-cover"
                                              fill
                                              sizes="40px"
                                              src={variant.imageUrl}
                                            />
                                          </div>
                                        ) : (
                                          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded bg-gray-200">
                                            <ImageIcon className="h-5 w-5 text-gray-500" />
                                          </div>
                                        )}
                                        <div className="min-w-0 flex-1">
                                          <div
                                            className="truncate text-sm font-medium"
                                            title={getDisplayName(variant)}
                                          >
                                            {getDisplayName(variant)}
                                          </div>
                                          <div className="truncate text-xs text-gray-500">
                                            SKU: {variant.variant_sku}
                                          </div>
                                        </div>
                                        <div className="flex-shrink-0 text-right">
                                          <div className="text-sm font-medium">
                                            {formatCurrencyAmount(
                                              Number.parseFloat(
                                                variant.retail_price
                                              ) || 0,
                                              "USD" // Assuming USD, adjust if currency is available
                                            )}
                                          </div>
                                          <div className="text-xs text-gray-500">
                                            {variant.available_quantity}{" "}
                                            available
                                          </div>
                                        </div>
                                      </button>
                                    ))
                                  )}
                                </div>
                                {filteredVariants.length === 0 && (
                                  <div className="text-muted-foreground p-4 text-center text-sm">
                                    {variantSearchTerm
                                      ? "No matching variants found"
                                      : "No variants available"}
                                  </div>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">
                                {getDisplayName(item)}
                              </span>
                              <span className="text-xs text-gray-500">
                                SKU: {item.variantSku}
                              </span>
                            </div>
                            {!item.isBuyerSelection && (
                              <p className="text-xs text-blue-600">
                                Seller Addition
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Mobile Layout: Controls */}
                    <div className="space-y-3 sm:flex sm:items-center sm:gap-4 sm:space-y-0">
                      {/* Price and Quantity Row */}
                      <div className="flex gap-3 sm:contents">
                        {/* Price Input */}
                        <div className="flex flex-1 flex-col gap-1">
                          <span className="text-xs font-medium text-gray-500 uppercase">
                            Price/Unit
                          </span>
                          <input
                            aria-label={`Price for ${getDisplayName(item)}`}
                            className="w-full rounded border border-gray-300 px-2 py-1 text-center text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:w-24"
                            disabled={item.isBuyerSelection}
                            onChange={(e) =>
                              handlePriceChange(item.id, e.target.value)
                            }
                            placeholder="0.00"
                            type="text"
                            value={
                              item.isBuyerSelection
                                ? item.buyerOfferPrice.toFixed(2)
                                : inputValues[item.id] || ""
                            }
                          />
                        </div>

                        {/* Quantity Input */}
                        <div className="flex flex-1 flex-col gap-1">
                          <span className="text-xs font-medium text-gray-500 uppercase">
                            Quantity
                          </span>
                          <input
                            aria-label={`Quantity for ${getDisplayName(item)}`}
                            className="w-full rounded border border-gray-300 px-2 py-1 text-center text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:w-24"
                            disabled={item.isSellerAddition && !item.variantId}
                            max={item.availableQuantity || undefined}
                            min="0"
                            onChange={(e) =>
                              handleQuantityChange(
                                item.id,
                                Number.parseInt(e.target.value, 10) || 0
                              )
                            }
                            type="number"
                            value={item.requestedQuantity}
                          />
                        </div>
                      </div>

                      {/* Total Price and Remove Button Row */}
                      <div className="flex items-center justify-between gap-3 sm:contents">
                        {/* Total Price */}
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-medium text-gray-500 uppercase">
                            Total Price
                          </span>
                          <span className="text-sm font-medium">
                            {formatCurrencyAmount(
                              calculateTotalPrice(item),
                              item.currency
                            )}
                          </span>
                          {/* Show % off if retail price is available and valid quantity/price */}
                          {item.retailPrice &&
                            item.retailPrice > 0 &&
                            item.requestedQuantity > 0 &&
                            (() => {
                              const offerPrice = item.isBuyerSelection
                                ? item.buyerOfferPrice
                                : Number.parseFloat(inputValues[item.id]) || 0;

                              // Only show % off if we have a valid offer price
                              if (offerPrice > 0) {
                                const percentOff =
                                  ((item.retailPrice - offerPrice) /
                                    item.retailPrice) *
                                  100;
                                if (percentOff > 0) {
                                  return (
                                    <span className="text-xs font-medium text-green-600">
                                      {percentOff.toFixed(1)}% off MSRP
                                    </span>
                                  );
                                }
                              }
                              return null;
                            })()}
                        </div>

                        {/* Remove Button */}
                        <div className="flex-shrink-0">
                          <Button
                            className="h-7 w-7 cursor-pointer p-0 text-red-500 hover:text-red-700"
                            onClick={() => handleRemoveItem(item.id)}
                            size="sm"
                            variant="ghost"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Additional Items */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Add Additional Items</h3>
          <Button
            className="w-full cursor-pointer transition-all duration-200 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
            disabled={filteredVariants.length === 0 || variantsLoading}
            onClick={onAddItem}
            variant="outline"
          >
            <Plus className="mr-2 h-4 w-4" />
            {variantsLoading
              ? "Loading Variants..."
              : filteredVariants.length === 0
                ? "No More Variants Available"
                : "Add More Variants"}
          </Button>
        </div>
      </div>
    </main>
  );
});
