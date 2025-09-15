"use client";

import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";

import { Check, ImageIcon, Plus } from "lucide-react";

import { Card, CardContent, CardFooter } from "@/src/components/ui/card";
import {
  addAllVariantsToCatalogOffer,
  addToCatalogOffer,
  removeProductFromCatalogOffer,
  selectCurrentCatalogItems,
} from "@/src/features/offer-management/store/offerCartSlice";
import { openOfferModal } from "@/src/features/offer-management/store/offerSlice";
// Product data structure for catalog products display - enhanced with calculated fields
import type { EnhancedProduct } from "@/src/features/offer-management/types";

import type { DetailedCatalogListing } from "../types/catalog";
import {
  transformBulkProductsToCartItems,
  transformEnhancedProductToOfferData,
} from "../utils/catalogToOfferTransform";

interface CatalogProductsGridProps {
  products: EnhancedProduct[];
  imageErrors: Record<string, boolean>;
  onImageErrorAction: (id: string) => void;
  catalogListing: DetailedCatalogListing;
}

/**
 * Format currency values for display
 */
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format large numbers with commas
 */
const formatNumber = (num: number) => {
  return new Intl.NumberFormat("en-US").format(num);
};

export const CatalogProductsGrid = ({
  products,
  imageErrors,
  onImageErrorAction,
  catalogListing,
}: CatalogProductsGridProps) => {
  const dispatch = useDispatch();
  const offerItems = useSelector(selectCurrentCatalogItems);

  // Check if a product has variants selected in the offer cart
  const hasProductInOffer = (productId: string | undefined) => {
    if (!productId) {
      return false;
    }
    return offerItems.some((item) => item.catalogProductId === productId);
  };

  // Handle card click - opens modal for variant selection (excluding button clicks)
  const handleCardClick = (product: EnhancedProduct) => {
    try {
      // Transform catalog product data to complete offer data
      const offerData = transformEnhancedProductToOfferData(
        product,
        catalogListing
      );

      // Get existing selections for this product
      const existingSelections = offerItems
        .filter((item) => item.catalogProductId === product.catalogProductId)
        .map((item) => ({
          variantSku: item.variantSku || "",
          quantity: item.selectedQuantity || 0,
          pricePerUnit: item.pricePerUnit,
        }));

      const modalData = {
        catalogProductId: product.catalogProductId,
        productTitle: product.productName || "Catalog Product",
        variants: offerData.variants,
        productImage: offerData.images.productImage,
        listingImage: offerData.images.listingImage,
        productStats: offerData.productStats,
        existingSelections:
          existingSelections.length > 0 ? existingSelections : undefined,
      };

      // Open the existing BuildOfferModal with transformed data
      dispatch(openOfferModal(modalData));
    } catch {
      // Fallback to a simple variant if transformation fails
      const fallbackData = {
        catalogProductId: product.catalogProductId,
        productTitle: product.productName || "Catalog Product",
        variants: [
          {
            catalogProductId: product.catalogProductId,
            variantSku: `${product.catalogProductId}-fallback`,
            variantId: `${product.catalogProductId}-fallback`,
            name: "Product Variant",
            title: "Product Variant",
            retailPrice: product.retailPrice || 0,
            offerPrice: product.offerPrice || 0,
            pricePerUnit: product.offerPrice || 0,
            totalUnits: 100,
            availableQuantity: 100,
            checked: false,
            image: undefined,
            brandName: product.brandName,
            identifier: null,
            identifier_type: null,
            category: null,
            subcategory: null,
            packaging: null,
            product_condition: null,
            totalPrice: (product.offerPrice || 0) * 100,
          },
        ],
      };
      dispatch(openOfferModal(fallbackData));
    }
  };

  // Handle button click - auto-selects all variants or removes product
  const handleButtonClick = (
    product: EnhancedProduct,
    event: React.MouseEvent
  ) => {
    // Prevent card click event from firing
    event.stopPropagation();

    if (!product.catalogProductId) {
      return;
    }

    const hasProductInOfferCart = hasProductInOffer(product.catalogProductId);

    if (hasProductInOfferCart) {
      // Remove all variants of this product from offer
      dispatch(
        removeProductFromCatalogOffer({
          catalogProductId: product.catalogProductId,
        })
      );
    } else {
      // Auto-select all variants and add to offer with proper image handling
      try {
        // Use the bulk transform function to get cart items with images
        const cartItems = transformBulkProductsToCartItems(
          [product],
          catalogListing
        );

        // Add each cart item individually to preserve image data
        for (const cartItem of cartItems) {
          dispatch(addToCatalogOffer(cartItem));
        }
      } catch {
        // Fallback to simple auto-add without images
        dispatch(
          addAllVariantsToCatalogOffer({
            catalogProductId: product.catalogProductId,
            productName: product.productName || "Catalog Product",
            variants: [
              {
                variantSku: `${product.catalogProductId}-fallback`,
                variantId: `${product.catalogProductId}-fallback`,
                name: "Product Variant",
                pricePerUnit: product.offerPrice || 0,
                totalUnits: 100,
                totalPrice: (product.offerPrice || 0) * 100,
              },
            ],
          })
        );
      }
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 xl:grid-cols-5">
      {products.map((product) => (
        <Card
          className="aspect-auto cursor-pointer overflow-hidden bg-white py-0 hover:shadow-lg"
          key={product.catalogProductId || product.id}
          onClick={() => handleCardClick(product)}
        >
          <div className="relative h-40 bg-gray-50">
            {product.imageUrl &&
            !imageErrors[product.catalogProductId || product.id || ""] ? (
              <Image
                alt={product.productName}
                className="bg-[#ebebeb] object-contain p-2"
                fill
                onError={() =>
                  onImageErrorAction(
                    product.catalogProductId || product.id || ""
                  )
                }
                src={product.imageUrl}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <ImageIcon className="h-10 w-10 text-gray-400" />
              </div>
            )}

            {/* Action Button */}
            <div className="absolute right-2 bottom-2">
              <button
                className={`flex h-8 w-8 items-center justify-center rounded-full text-white transition-colors ${
                  hasProductInOffer(product.catalogProductId)
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-black hover:bg-gray-800"
                }`}
                onClick={(event) => handleButtonClick(product, event)}
                type="button"
              >
                {hasProductInOffer(product.catalogProductId) ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <CardContent className="flex-1 p-3">
            <h3 className="mb-2 line-clamp-2 text-sm font-medium text-gray-900">
              {product.productName}
            </h3>

            <div className="space-y-1 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>{formatNumber(product.totalUnits)} units</span>
                <span>{formatCurrency(product.offerPrice)}/unit</span>
              </div>
              <div className="flex justify-between">
                <span>{product.variants} variants</span>
                <span className="font-medium text-gray-900">
                  {formatCurrency(product.totalPrice)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {products.length === 0 && (
        <div className="col-span-full flex h-24 items-center justify-center text-gray-500">
          No products found.
        </div>
      )}
    </div>
  );
};
