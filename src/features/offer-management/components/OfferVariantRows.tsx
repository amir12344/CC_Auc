"use client";

import React, { useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { ImageIcon, X } from "lucide-react";

import {
  removeFromOffer,
  selectExpandedProducts,
  updateVariantInCatalogSummary,
} from "../store/offerCartSlice";
import type { OfferCartItem } from "../types";

interface OfferVariantRowsProps {
  productId: string;
  variants: OfferCartItem[];
  onImageHover?: (imageUrl: string, event: React.MouseEvent) => void;
  onImageLeave?: () => void;
}

/**
 * OfferVariantRows Component
 *
 * Displays editable variant rows under expanded products in the OfferSummarySheet.
 * Each variant row shows editable fields for price/unit and inventory, with proper table structure.
 *
 * Based on BuildOfferModal table design for consistency.
 */
export const OfferVariantRows: React.FC<OfferVariantRowsProps> = ({
  productId,
  variants,
  onImageHover,
  onImageLeave,
}) => {
  const dispatch = useDispatch();
  const expandedProducts = useSelector(selectExpandedProducts);
  const isExpanded = expandedProducts[productId];
  const [inputValues, setInputValues] = useState<{ [key: string]: string }>({});

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const handleVariantPriceChange = useCallback(
    (variantSku: string, value: string) => {
      // Store the raw input value
      setInputValues((prev) => ({
        ...prev,
        [variantSku]: value,
      }));

      // Process value for state update
      // Remove non-numeric characters except decimal point
      const numericValue = value.replace(/[^0-9.]/g, "");
      const newPrice = numericValue ? Number.parseFloat(numericValue) : 0;

      if (!Number.isNaN(newPrice)) {
        const variant = variants.find((v) => v.variantSku === variantSku);
        if (variant) {
          dispatch(
            updateVariantInCatalogSummary({
              catalogProductId: productId,
              variantSku,
              updates: {
                pricePerUnit: newPrice,
                // Recalculate total price based on new price
                totalPrice: variant.selectedQuantity * newPrice,
              },
            })
          );
        }
      }
    },
    [dispatch, productId, variants]
  );

  const handleVariantInventoryChange = useCallback(
    (variantSku: string, newInventory: number, maxInventory: number) => {
      const variant = variants.find((v) => v.variantSku === variantSku);
      if (variant) {
        // Validate inventory doesn't exceed available quantity
        const validatedInventory = Math.min(newInventory, maxInventory);

        dispatch(
          updateVariantInCatalogSummary({
            catalogProductId: productId,
            variantSku,
            updates: {
              selectedQuantity: validatedInventory,
              // Recalculate total price based on new quantity
              totalPrice: validatedInventory * variant.pricePerUnit,
            },
          })
        );
      }
    },
    [dispatch, productId, variants]
  );

  const handleRemoveVariant = useCallback(
    (variantSku: string) => {
      dispatch(removeFromOffer({ catalogProductId: productId, variantSku }));
    },
    [dispatch, productId]
  );

  // Don't render if not expanded
  if (!isExpanded) {
    return null;
  }

  return (
    <>
      {variants.map((variant) => (
        <tr
          className="bg-blue-50 hover:bg-blue-100"
          key={`${productId}-${variant.variantSku}`}
        >
          {/* Variant Column with Indentation, Image and Checkbox */}
          <td className="px-3 py-4 whitespace-nowrap">
            <div className="flex items-center gap-3 pl-8">
              {/* Blue Checkbox to match reference design */}
              <input
                aria-label={`Select variant ${variant.variantName || "variant"}`}
                checked={true} // Always checked since it's in the offer
                className="h-4 w-4 rounded border-gray-300 bg-blue-600 text-blue-600 accent-blue-600 focus:ring-blue-500"
                readOnly
                type="checkbox"
              />

              {/* Variant Image with Hover Preview */}
              <div className="flex h-6 w-6 items-center justify-center rounded bg-gray-100">
                {variant.variantImage && variant.variantImage.trim() !== "" ? (
                  <button
                    className="h-5 w-5 cursor-pointer rounded bg-gray-200 transition-transform hover:scale-110"
                    onMouseEnter={(e) =>
                      onImageHover?.(variant.variantImage || "", e)
                    }
                    onMouseLeave={onImageLeave}
                    style={{
                      backgroundImage: `url(${variant.variantImage})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                    type="button"
                  />
                ) : (
                  <ImageIcon className="h-3 w-3 text-gray-400" />
                )}
              </div>

              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900">
                  {variant.variantName || "Variant"}
                </span>
                <span className="text-xs text-gray-500">
                  SKU: {variant.variantSku}
                </span>
              </div>
            </div>
          </td>

          {/* Inventory Column - Editable quantity input */}
          <td className="px-3 py-4 text-center whitespace-nowrap">
            <div className="flex flex-col items-center gap-1">
              <span className="text-xs font-medium text-gray-500 uppercase">
                Inventory
              </span>
              <input
                aria-label={`Inventory for ${variant.variantName || "variant"}`}
                className="w-20 rounded border border-gray-300 px-2 py-1 text-center text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                max={variant.availableQuantity || 1000}
                min={0}
                onChange={(e) =>
                  handleVariantInventoryChange(
                    variant.variantSku || "",
                    Number.parseInt(e.target.value, 10) || 0,
                    variant.availableQuantity || 1000
                  )
                }
                type="number"
                value={variant.selectedQuantity}
              />
              <span className="text-xs text-gray-500">
                {variant.availableQuantity?.toLocaleString() || "0"}
              </span>
            </div>
          </td>

          {/* MSRP - Empty for variant rows */}
          <td className="px-3 py-4 whitespace-nowrap" />

          {/* Price/Unit Column - Editable price input */}
          <td className="px-3 py-4 text-center whitespace-nowrap">
            <div className="flex flex-col items-center gap-1">
              <span className="text-xs font-medium text-gray-500 uppercase">
                Price/Unit
              </span>
              <div className="relative w-20">
                <span className="absolute top-1 left-2 text-gray-500">$</span>
                <input
                  aria-label={`Price per unit for ${variant.variantName || "variant"}`}
                  className="w-20 rounded border border-gray-300 py-1 pr-2 pl-5 text-right text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  onChange={(e) =>
                    handleVariantPriceChange(
                      variant.variantSku || "",
                      e.target.value
                    )
                  }
                  type="text"
                  value={
                    inputValues[variant.variantSku || ""] !== undefined
                      ? inputValues[variant.variantSku || ""]
                      : variant.pricePerUnit.toFixed(2)
                  }
                />
              </div>
              <span className="text-xs text-gray-500">
                ${variant.offerPrice.toFixed(2)}
              </span>
            </div>
          </td>

          {/* Total Units Column */}
          <td className="px-3 py-4 text-center whitespace-nowrap">
            <div className="flex flex-col items-center gap-1">
              <span className="text-xs font-medium text-gray-500 uppercase">
                Total Units
              </span>
              <span className="text-sm font-medium">
                {variant.selectedQuantity.toLocaleString()}
              </span>
              <span className="text-xs text-gray-500">
                {variant.selectedQuantity.toLocaleString()}
              </span>
            </div>
          </td>

          {/* Total Price Column - Read-only, calculated */}
          <td className="px-3 py-4 text-center whitespace-nowrap">
            <div className="flex flex-col items-center gap-1">
              <span className="text-xs font-medium text-gray-500 uppercase">
                Total Price
              </span>
              <span className="text-sm font-medium">
                {formatCurrency(variant.totalPrice)}
              </span>
              <span className="text-xs text-gray-500">
                {formatCurrency(variant.totalPrice)}
              </span>
            </div>
          </td>

          {/* Remove Button */}
          <td className="px-2 py-4 text-center whitespace-nowrap">
            <button
              aria-label={`Remove ${variant.variantName || "variant"} from offer`}
              className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-black transition-colors hover:bg-red-100 hover:text-red-600"
              onClick={() => handleRemoveVariant(variant.variantSku || "")}
              type="button"
            >
              <X className="h-3 w-3" />
            </button>
          </td>
        </tr>
      ))}
    </>
  );
};
