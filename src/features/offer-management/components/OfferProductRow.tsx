"use client";

import Image from "next/image";
import type React from "react";
import { useDispatch, useSelector } from "react-redux";

import { ChevronDown, ImageIcon, X } from "lucide-react";

import {
  removeProductFromOffer,
  selectExpandedProducts,
  toggleProductExpansion,
} from "../store/offerCartSlice";

interface OfferProductRowProps {
  productId: string;
  productName: string;
  productImage?: string;
  totalVariants: number;
  msrp: number;
  avgPricePerUnit: number;
  totalUnits: number;
  totalPrice: number;
}

/**
 * OfferProductRow Component
 *
 * Displays a parent product row in the OfferSummarySheet with expand/collapse functionality.
 * Shows aggregated data from all variants of the product.
 *
 * Based on reference design images for pixel-perfect matching.
 */
export const OfferProductRow: React.FC<OfferProductRowProps> = ({
  productId,
  productName,
  productImage,
  totalVariants,
  msrp,
  avgPricePerUnit,
  totalUnits,
  totalPrice,
}) => {
  const dispatch = useDispatch();
  const expandedProducts = useSelector(selectExpandedProducts);
  const isExpanded = expandedProducts[productId];

  const handleToggleExpansion = () => {
    dispatch(toggleProductExpansion({ catalogProductId: productId }));
  };

  const handleRemoveProduct = () => {
    dispatch(removeProductFromOffer({ catalogProductId: productId }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <tr className="hover:bg-gray-50">
      {/* Product Name with expand/collapse */}
      <td className="px-3 py-4 whitespace-nowrap">
        <div className="flex items-center gap-3">
          <button
            aria-label={isExpanded ? "Collapse variants" : "Expand variants"}
            className={`text-gray-400 transition-transform duration-200 ${
              isExpanded ? "rotate-180" : "rotate-0"
            }`}
            onClick={handleToggleExpansion}
            type="button"
          >
            <ChevronDown size={16} />
          </button>

          <div className="flex h-8 w-8 items-center justify-center rounded bg-gray-100">
            {productImage && productImage.trim() !== "" ? (
              <Image
                alt={`${productName} thumbnail`}
                className="h-6 w-6 rounded object-cover"
                height={24}
                onError={() => {
                  // Handle image error by showing icon instead
                }}
                src={productImage}
                width={24}
              />
            ) : (
              <ImageIcon className="h-4 w-4 text-gray-400" />
            )}
          </div>

          <div className="text-sm text-gray-900">{productName}</div>
        </div>
      </td>

      {/* Variants Count */}
      <td className="px-3 py-4 text-center text-sm whitespace-nowrap text-gray-500">
        {totalVariants}
      </td>

      {/* MSRP */}
      <td className="px-3 py-4 text-right text-sm whitespace-nowrap text-gray-500">
        {formatCurrency(msrp)}
      </td>

      {/* Price/Unit (Average) */}
      <td className="px-3 py-4 text-right text-sm whitespace-nowrap text-gray-500">
        {formatCurrency(avgPricePerUnit)}
      </td>

      {/* Total Units */}
      <td className="px-3 py-4 text-right text-sm whitespace-nowrap text-gray-500">
        {totalUnits.toLocaleString()}
      </td>

      {/* Total Price */}
      <td className="px-3 py-4 text-right text-sm font-medium whitespace-nowrap">
        {formatCurrency(totalPrice)}
      </td>

      {/* Remove Button */}
      <td className="px-2 py-4 text-center whitespace-nowrap">
        <button
          aria-label={`Remove ${productName} from offer`}
          className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-black transition-colors hover:text-gray-700"
          onClick={handleRemoveProduct}
          type="button"
        >
          <X className="h-3 w-3" />
        </button>
      </td>
    </tr>
  );
};
