"use client";

import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";

import { Check, ImageIcon, Plus } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import {
  addAllVariantsToCatalogOffer,
  addToCatalogOffer,
  removeProductFromCatalogOffer,
  selectCurrentCatalogItems,
} from "@/src/features/offer-management/store/offerCartSlice";
import { openOfferModal } from "@/src/features/offer-management/store/offerSlice";
import type { EnhancedProduct } from "@/src/features/offer-management/types";

import type { DetailedCatalogListing } from "../types/catalog";
import {
  transformBulkProductsToCartItems,
  transformEnhancedProductToOfferData,
} from "../utils/catalogToOfferTransform";

interface CatalogProductsListProps {
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

export const CatalogProductsList = ({
  products,
  imageErrors,
  onImageErrorAction,
  catalogListing,
}: CatalogProductsListProps) => {
  const dispatch = useDispatch();
  const offerItems = useSelector(selectCurrentCatalogItems);

  // Check if a product has variants selected in the offer cart
  const hasProductInOffer = (productId: string) => {
    return offerItems.some((item) => item.catalogProductId === productId);
  };

  // Handle row click - opens modal for variant selection (excluding plus button clicks)
  const handleRowClick = (product: EnhancedProduct) => {
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

  // Handle plus button click - auto-selects all variants or removes product
  const handlePlusButtonClick = (
    product: EnhancedProduct,
    event: React.MouseEvent
  ) => {
    // Prevent row click event from firing
    event.stopPropagation();

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
    <div className="overflow-hidden rounded-lg border border-gray-200">
      <div className="w-full overflow-auto">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow className="border-b border-gray-200">
              <TableHead className="w-[60px] px-2 py-3 text-left align-middle text-xs font-medium text-gray-500" />
              <TableHead className="px-2 py-3 text-left align-middle text-xs font-medium text-gray-500">
                PRODUCT NAME
              </TableHead>
              <TableHead className="px-2 py-3 text-right align-middle text-xs font-medium text-gray-500">
                VARIANTS
              </TableHead>
              <TableHead className="px-2 py-3 text-right align-middle text-xs font-medium text-gray-500">
                RETAIL PRICE
              </TableHead>
              <TableHead className="px-2 py-3 text-right align-middle text-xs font-medium text-gray-500">
                OFFER PRICE
              </TableHead>
              <TableHead className="px-2 py-3 text-right align-middle text-xs font-medium text-gray-500">
                TOTAL UNITS
              </TableHead>
              <TableHead className="px-2 py-3 text-right align-middle text-xs font-medium text-gray-500">
                TOTAL PRICE
              </TableHead>
              <TableHead className="w-[50px] px-2 py-3 text-left align-middle text-xs font-medium text-gray-500" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow
                className="cursor-pointer border-b border-gray-200 hover:bg-gray-50"
                key={product.catalogProductId}
                onClick={() => handleRowClick(product)}
              >
                <TableCell className="px-2 py-3 pl-4">
                  {product.imageUrl &&
                  !imageErrors[product.catalogProductId] ? (
                    <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-md bg-gray-100">
                      <Image
                        alt={product.productName}
                        className="object-contain"
                        height={32}
                        onError={() =>
                          onImageErrorAction(product.catalogProductId)
                        }
                        src={product.imageUrl}
                        width={32}
                      />
                    </div>
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gray-100 text-gray-400">
                      <ImageIcon className="h-4 w-4" />
                    </div>
                  )}
                </TableCell>
                <TableCell className="px-2 py-3 font-medium text-gray-900">
                  {product.productName}
                </TableCell>
                <TableCell className="px-2 py-3 text-right text-gray-700">
                  {product.variants}
                </TableCell>
                <TableCell className="px-2 py-3 text-right text-gray-700">
                  {formatCurrency(product.retailPrice)}
                </TableCell>
                <TableCell className="px-2 py-3 text-right text-gray-700">
                  {formatCurrency(product.offerPrice)}
                </TableCell>
                <TableCell className="px-2 py-3 text-right text-gray-700">
                  {formatNumber(product.totalUnits)}
                </TableCell>
                <TableCell className="px-2 py-3 text-right font-semibold text-gray-900">
                  {formatCurrency(product.totalPrice)}
                </TableCell>
                <TableCell className="px-2 py-3 text-right">
                  <button
                    className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-white transition-opacity hover:opacity-90 ${
                      hasProductInOffer(product.catalogProductId)
                        ? "bg-blue-600"
                        : "bg-black"
                    }`}
                    onClick={(event) => handlePlusButtonClick(product, event)}
                    type="button"
                  >
                    {hasProductInOffer(product.catalogProductId) ? (
                      <Check className="h-6 w-6" />
                    ) : (
                      <Plus className="h-6 w-6" />
                    )}
                  </button>
                </TableCell>
              </TableRow>
            ))}

            {products.length === 0 && (
              <TableRow>
                <TableCell
                  className="h-24 text-center text-gray-500"
                  colSpan={8}
                >
                  No products found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
