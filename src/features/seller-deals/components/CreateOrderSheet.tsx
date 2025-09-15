"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { ImageIcon, Loader2, X } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/src/components/ui/alert-dialog";
import { CreateOrderSheetSkeleton } from "@/src/components/ui/CreateOrderSheetSkeleton";
import { QUERY_KEYS } from "@/src/shared/constants/api";
import { formatBackendError } from "@/src/utils/error-utils";

import {
  createOrderFromOffer,
  fetchCatalogListingsVariantsForCreateOrder,
  fetchOrderItemsByOfferId,
} from "../services/sellerQueryService";
import type {
  CatalogListingVariant,
  CreateOrderPayload,
  EnhancedSellerOrderItem,
  ModificationItem,
  SellerOrderItem,
} from "../types";
import { CreateOrderSheetItems } from "./CreateOrderSheetItems";

// Utility function to format currency
const formatCurrency = (amount: number, currency = "USD"): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
};

interface CreateOrderSheetProps {
  open: boolean;
  catalogOfferId: string;
  catalogListingPublicId: string;
  offerPublicId: string; // Required for API call
  shippingAddressPublicId: string; // Required for API call
  billingAddressPublicId: string; // Required for API call
  onCloseAction: () => void;
  onOrderCreated?: (orderId: string) => void; // Success callback
}

export function CreateOrderSheet({
  open,
  catalogOfferId,
  catalogListingPublicId,
  offerPublicId,
  shippingAddressPublicId,
  billingAddressPublicId,
  onCloseAction,
  onOrderCreated,
}: CreateOrderSheetProps) {
  const [orderItems, setOrderItems] = useState<EnhancedSellerOrderItem[]>([]);
  const [inputValues, setInputValues] = useState<{ [key: string]: string }>({});
  const [hoveredImage, setHoveredImage] = useState<{
    url: string;
    x: number;
    y: number;
  } | null>(null);

  const [availableVariants, setAvailableVariants] = useState<
    CatalogListingVariant[]
  >([]);
  const [nextRowId, setNextRowId] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isTakeAllSubmitting, setIsTakeAllSubmitting] =
    useState<boolean>(false);
  const [errorOpen, setErrorOpen] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successOpen, setSuccessOpen] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>("");

  // Lock background scroll when sheet is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  // Fetch buyer-selected items using catalogOfferId
  // Fetch buyer-selected items using catalogOfferId
  const { data: buyerItems = [], isLoading: isLoadingBuyerItems } = useQuery<
    SellerOrderItem[]
  >({
    queryKey: [QUERY_KEYS.ORDER_ITEMS(catalogOfferId)],
    queryFn: () => fetchOrderItemsByOfferId(catalogOfferId),
    enabled: open && Boolean(catalogOfferId),
  });

  // Fetch available variants for the listing
  const { data: variants = [], isLoading: variantsLoading } = useQuery<
    CatalogListingVariant[]
  >({
    queryKey: ["catalog-listing-variants", catalogListingPublicId],
    queryFn: () => {
      if (!catalogListingPublicId) {
        return Promise.resolve([]);
      }
      return fetchCatalogListingsVariantsForCreateOrder(catalogListingPublicId);
    },
    enabled: Boolean(catalogListingPublicId),
  });

  // Handle quantity changes
  const handleQuantityChange = useCallback(
    (itemId: string, newQuantity: number) => {
      const clampedQuantity = Math.max(0, newQuantity);

      setOrderItems((prev) => {
        const updated = prev.map((item) =>
          item.id === itemId
            ? { ...item, requestedQuantity: clampedQuantity }
            : item
        );
        return updated;
      });
    },
    []
  );

  // Handle price changes
  const handlePriceChange = useCallback((itemId: string, value: string) => {
    // Store the raw input value
    setInputValues((prev) => ({
      ...prev,
      [itemId]: value,
    }));

    // Process value for state update
    const numericValue = value.replace(/[^0-9.]/g, "");
    const newPrice = numericValue ? Number.parseFloat(numericValue) : 0;

    if (Number.isNaN(newPrice)) {
      setErrorMessage("❌ Invalid price input - no update applied");
    } else {
      setOrderItems((prev) => {
        const updated = prev.map((item) =>
          item.id === itemId ? { ...item, buyerOfferPrice: newPrice } : item
        );

        // Price updated successfully
        return updated;
      });
    }
  }, []);

  // Handle image hover
  const handleImageHover = useCallback(
    (imageUrl: string, event: React.MouseEvent) => {
      const rect = event.currentTarget.getBoundingClientRect();
      setHoveredImage({
        url: imageUrl,
        x: rect.right + 10,
        y: rect.top,
      });
    },
    []
  );

  const handleImageLeave = useCallback(() => {
    setHoveredImage(null);
  }, []);

  // Handle adding new items (seller can add additional variants)
  const handleAddItem = useCallback(() => {
    setOrderItems((prevOrderItems) => {
      const newItem: EnhancedSellerOrderItem = {
        id: `new-${nextRowId}`,
        catalogOfferItemPublicId: `temp-new-${nextRowId}`, // Temporary ID for new seller items
        variantId: "",
        catalogProductVariantPublicId: "", // Will be set when variant is selected
        variantName: "",
        variantSku: "",
        productTitle: "",
        imageUrl: null,
        requestedQuantity: 0, // Seller-added items start with 0 quantity
        buyerOfferPrice: 0, // Seller-added items start with 0 price
        currency:
          prevOrderItems.length > 0 ? prevOrderItems[0].currency : "USD",
        isBuyerSelection: false, // Not a buyer selection
        isSellerAddition: true, // Mark as seller addition
        catalogListingPublicId,
        availableQuantity: 0,
      };
      return [...prevOrderItems, newItem];
    });
    setNextRowId((prev) => prev + 1);
  }, [nextRowId, catalogListingPublicId]);

  // Helper function to determine modification action type
  const determineModificationAction = useCallback(
    (item: EnhancedSellerOrderItem): "UPDATE_EXISTING" | "ADD_PRODUCT" => {
      // If item was added by seller
      if (item.isSellerAddition) {
        return "ADD_PRODUCT";
      }

      // Find original item
      const originalItem = buyerItems.find(
        (orig) =>
          orig.catalogOfferItemPublicId === item.catalogOfferItemPublicId
      );

      if (!originalItem) {
        return "ADD_PRODUCT"; // Shouldn't happen but safe fallback
      }

      // Check if quantity or price changed
      const quantityChanged =
        item.requestedQuantity !== originalItem.requestedQuantity;
      const priceChanged =
        Math.abs(item.buyerOfferPrice - originalItem.buyerOfferPrice) > 0.01;

      if (quantityChanged || priceChanged) {
        return "UPDATE_EXISTING";
      }

      // If no changes, still mark as UPDATE_EXISTING to include in API call
      return "UPDATE_EXISTING";
    },
    [buyerItems]
  );

  // Helper function to build modifications array
  const buildModificationsArray = useCallback((): ModificationItem[] => {
    const modifications: ModificationItem[] = [];

    // Build modifications array based on changes

    // Handle removed items (items in buyerItems but not in orderItems)
    for (const originalItem of buyerItems) {
      const stillExists = orderItems.find(
        (item) =>
          item.catalogOfferItemPublicId ===
          originalItem.catalogOfferItemPublicId
      );

      if (!stillExists) {
        const removedModification = {
          action: "REMOVE_PRODUCT" as const,
          catalogOfferItemPublicId: originalItem.catalogOfferItemPublicId,
          // Only include action and catalogOfferItemPublicId for REMOVE_PRODUCT
        };
        // Item was removed from order
        modifications.push(removedModification);
      }
    }

    // Handle existing and new items
    for (const item of orderItems) {
      const action = determineModificationAction(item);
      const originalItem = buyerItems.find(
        (orig) =>
          orig.catalogOfferItemPublicId === item.catalogOfferItemPublicId
      );

      let modification: ModificationItem;

      if (action === "ADD_PRODUCT") {
        // For ADD_PRODUCT (seller additions), don't include catalogOfferItemPublicId if it's a temp ID
        modification = {
          action,
          catalogProductVariantPublicId:
            item.catalogProductVariantPublicId || item.variantId,
          quantity: item.requestedQuantity, // Use current quantity, not newQuantity
          sellerPricePerUnit: item.buyerOfferPrice, // Use current price, not newPrice
        };

        // Only include catalogOfferItemPublicId if it's not a temp seller addition
        if (!item.catalogOfferItemPublicId?.startsWith("temp-new-")) {
          modification.catalogOfferItemPublicId = item.catalogOfferItemPublicId;
        }
      } else {
        // For UPDATE_EXISTING, include all fields
        modification = {
          action,
          catalogOfferItemPublicId: item.catalogOfferItemPublicId,
          catalogProductVariantPublicId:
            item.catalogProductVariantPublicId || item.variantId,
          quantity: originalItem?.requestedQuantity || 0,
          sellerPricePerUnit: originalItem?.buyerOfferPrice || 0,
          newQuantity: item.requestedQuantity,
          newSellerPricePerUnit: item.buyerOfferPrice,
        };
      }

      // Process modification for item

      modifications.push(modification);
    }

    // Return final modifications array

    return modifications;
  }, [orderItems, buyerItems, determineModificationAction]);

  // Handle create order submission
  const handleCreateOrder = useCallback(async () => {
    setIsSubmitting(true);

    try {
      const modifications = buildModificationsArray();

      // Build payload - only include fields with values
      const payload: CreateOrderPayload = {
        offerPublicId,
        autoCreateOrder: true,
        shippingAddressPublicId,
        billingAddressPublicId,
        modifications,
      };

      // Only add optional fields if they have values - don't include empty keys
      const sellerMessage = ""; // TODO: Add input field for seller message
      const orderNotes = ""; // TODO: Add input field for order notes

      if (sellerMessage?.trim()) {
        payload.sellerMessage = sellerMessage.trim();
      }
      if (orderNotes?.trim()) {
        payload.orderNotes = orderNotes.trim();
      }

      const response = await createOrderFromOffer(payload);

      if (response.success) {
        // Success - show success message and then close
        const message = response.message || "Order created successfully!";
        setSuccessMessage(message);
        setSuccessOpen(true);

        // Call success callback
        onOrderCreated?.(response.orderId || "");
      } else {
        // Format and show error in alert dialog using error-utils
        const formattedError = response.errors?.length
          ? formatBackendError(response.errors.join("\n"))
          : "Failed to create order";
        setErrorMessage(formattedError);
        setErrorOpen(true);
      }
    } catch (error) {
      // Handle unexpected errors using formatBackendError
      const formattedError = formatBackendError(error);
      setErrorMessage(formattedError);
      setErrorOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  }, [
    buildModificationsArray,
    offerPublicId,
    shippingAddressPublicId,
    billingAddressPublicId,
    onOrderCreated,
  ]);

  // Handle Take All functionality - directly call API with all available variants
  const handleTakeAll = useCallback(async () => {
    setIsTakeAllSubmitting(true);

    try {
      // Build modifications array from all available variants
      // For ADD_PRODUCT, use quantity and sellerPricePerUnit (not newQuantity and newSellerPricePerUnit)
      const takeAllModifications: ModificationItem[] = availableVariants.map(
        (variant) => ({
          action: "ADD_PRODUCT",
          // Don't include catalogOfferItemPublicId for seller additions
          catalogProductVariantPublicId: variant.public_id,
          quantity: variant.available_quantity, // Use current quantity, not newQuantity
          sellerPricePerUnit: Number.parseFloat(variant.offer_price) || 0, // Use current price, not newPrice
          // Don't include newQuantity and newSellerPricePerUnit for ADD_PRODUCT
          // modificationReason: '', // Don't include empty reason
        })
      );

      // Build payload - only include fields with values
      const payload: CreateOrderPayload = {
        offerPublicId,
        autoCreateOrder: true,
        shippingAddressPublicId,
        billingAddressPublicId,
        modifications: takeAllModifications,
      };

      // Only add optional fields if they have values - don't include empty keys
      const sellerMessage = ""; // TODO: Add input field for seller message
      const orderNotes = ""; // TODO: Add input field for order notes

      if (sellerMessage?.trim()) {
        payload.sellerMessage = sellerMessage.trim();
      }
      if (orderNotes?.trim()) {
        payload.orderNotes = orderNotes.trim();
      }

      const response = await createOrderFromOffer(payload);

      if (response.success) {
        // Success - show success message and then close
        const message = response.message || "Order created successfully!";
        setSuccessMessage(message);
        setSuccessOpen(true);

        // Call success callback
        onOrderCreated?.(response.orderId || "");
      } else {
        // Format and show error in alert dialog using error-utils
        const formattedError = response.errors?.length
          ? formatBackendError(response.errors.join("\n"))
          : "Failed to create order";
        setErrorMessage(formattedError);
        setErrorOpen(true);
      }
    } catch (error) {
      const formattedError = formatBackendError(error);
      setErrorMessage(formattedError);
      setErrorOpen(true);
    } finally {
      setIsTakeAllSubmitting(false);
    }
  }, [
    availableVariants,
    offerPublicId,
    shippingAddressPublicId,
    billingAddressPublicId,
    onOrderCreated,
  ]);

  // Handle variant selection from dropdown
  const handleVariantSelection = useCallback(
    (itemId: string, selectedVariant: CatalogListingVariant) => {
      setOrderItems((prev) =>
        prev.map((item) =>
          item.id === itemId
            ? {
                ...item,
                variantId: selectedVariant.public_id,
                variantName: selectedVariant.variant_name,
                variantSku: selectedVariant.variant_sku,
                productTitle: selectedVariant.productTitle || "",
                imageUrl: selectedVariant.imageUrl,
                buyerOfferPrice:
                  Number.parseFloat(selectedVariant.offer_price) || 0,
                retailPrice:
                  Number.parseFloat(selectedVariant.retail_price) || undefined,
                availableQuantity: selectedVariant.available_quantity,
              }
            : item
        )
      );
    },
    []
  );

  // Handle removing items
  const handleRemoveItem = useCallback((itemId: string) => {
    setOrderItems((prev) => {
      const itemToRemove = prev.find((item) => item.id === itemId);
      if (itemToRemove) {
        const updatedItems = prev.filter((item) => item.id !== itemId);
        return updatedItems;
      }
      // Item not found - this shouldn't happen in normal operation
      return prev;
    });

    setInputValues((prev) => {
      const newValues = { ...prev };
      delete newValues[itemId];
      return newValues;
    });
  }, []);

  // Validation for create order - check if any seller additions have invalid quantity or price
  const hasInvalidSellerAdditions = useMemo(() => {
    return orderItems.some((item) => {
      if (item.isSellerAddition) {
        return item.requestedQuantity <= 0 || item.buyerOfferPrice <= 0;
      }
      return false;
    });
  }, [orderItems]);

  // Calculate totals including % off
  const { totalUnits, totalValue, averagePrice, totalPercentOff } =
    useMemo(() => {
      const units = orderItems.reduce(
        (sum, item) => sum + item.requestedQuantity,
        0
      );
      const value = orderItems.reduce(
        (sum, item) => sum + item.requestedQuantity * item.buyerOfferPrice,
        0
      );
      const avgPrice = units > 0 ? value / units : 0;

      // Calculate average % off using formula: ((retailPrice - offerPrice) / retailPrice) * 100
      let totalRetailValue = 0;
      let totalOfferValue = 0;

      for (const item of orderItems) {
        if (item.retailPrice && item.retailPrice > 0) {
          const itemRetailValue = item.requestedQuantity * item.retailPrice;
          const itemOfferValue = item.requestedQuantity * item.buyerOfferPrice;
          totalRetailValue += itemRetailValue;
          totalOfferValue += itemOfferValue;
        }
      }

      const percentOff =
        totalRetailValue > 0
          ? ((totalRetailValue - totalOfferValue) / totalRetailValue) * 100
          : 0;

      return {
        totalUnits: units,
        totalValue: value,
        averagePrice: avgPrice,
        totalPercentOff: percentOff,
      };
    }, [orderItems]);

  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize orderItems when buyerItems loads
  useEffect(() => {
    if (buyerItems.length > 0) {
      // Transform buyer items to enhanced format, preserving original price and quantity
      const enhancedBuyerItems: EnhancedSellerOrderItem[] = buyerItems.map(
        (item, index) => ({
          ...item,
          id: `buyer-${index}`,
          isBuyerSelection: true, // Mark as buyer selection to preserve values
          isSellerAddition: false,
          // Preserve original buyer values - do not reset to 0
          requestedQuantity: item.requestedQuantity || 1,
          buyerOfferPrice: item.buyerOfferPrice || 0,
        })
      );
      setOrderItems(enhancedBuyerItems);
      setNextRowId(enhancedBuyerItems.length + 1);
      setIsInitialized(true);
    } else {
      setIsInitialized(true);
    }
  }, [buyerItems]);

  // Update available variants when variants are fetched
  useEffect(() => {
    if (variants.length > 0) {
      setAvailableVariants(variants);
    }
  }, [variants]);

  if (!open) {
    return null;
  }

  return (
    <div className="fade-in animate-in fixed inset-0 z-50 overflow-hidden duration-500 ease-in-out">
      <div
        className="fade-in animate-in bg-opacity-50 absolute inset-0 bg-black backdrop-blur-sm duration-500 ease-in-out"
        onClick={onCloseAction}
        onKeyDown={(e) => e.key === "Escape" && onCloseAction()}
        role="button"
        tabIndex={0}
      />
      <div
        aria-labelledby="create-order-title"
        aria-modal="true"
        className="slide-in-from-bottom animate-in fixed inset-0 z-50 overflow-y-auto bg-white delay-75 duration-500 ease-out"
        role="dialog"
      >
        {/* Header */}
        <div className="px-8 pt-8 pb-4 sm:px-10">
          <div className="flex justify-end">
            <button
              aria-label="Close"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-gray-700 transition-colors hover:bg-gray-300 focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:outline-none"
              onClick={onCloseAction}
              type="button"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <header className="sticky top-0 z-10 border-b border-gray-200 bg-white">
          <div className="px-6 py-6 sm:px-10 md:px-12">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gray-100">
                    {orderItems.length > 0 &&
                    orderItems[0]?.imageUrl &&
                    orderItems[0].imageUrl.trim() !== "" ? (
                      <div
                        className="h-14 w-14 rounded-lg bg-gray-200"
                        style={{
                          backgroundImage: `url(${orderItems[0].imageUrl})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }}
                      />
                    ) : (
                      <ImageIcon className="h-8 w-8 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <h1
                      className="text-2xl font-semibold text-gray-900"
                      id="create-order-title"
                    >
                      Create Order
                    </h1>
                    <p className="text-base text-gray-600">
                      Review and modify buyer selection items
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
                <button
                  className="w-full rounded-full px-4 py-2.5 text-sm text-gray-600 transition-colors hover:text-gray-900 sm:w-auto"
                  onClick={onCloseAction}
                  type="button"
                >
                  Cancel
                </button>
                <button
                  className="w-full cursor-pointer rounded-full bg-black px-5 py-2.5 text-sm text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                  disabled={isSubmitting || hasInvalidSellerAdditions}
                  onClick={handleCreateOrder}
                  type="button"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating Order...
                    </span>
                  ) : (
                    "Create Order"
                  )}
                </button>
                <button
                  className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-gray-300 px-4 py-2.5 text-sm hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                  disabled={
                    availableVariants.length === 0 || isTakeAllSubmitting
                  }
                  onClick={handleTakeAll}
                  type="button"
                >
                  {isTakeAllSubmitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    "Take All"
                  )}
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="px-6 py-6 sm:px-10 md:px-12">
          {isLoadingBuyerItems || !isInitialized ? (
            <CreateOrderSheetSkeleton />
          ) : (
            <>
              {/* Stats Grid */}
              <div className="mb-0 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border border-gray-200 p-4">
                  <div className="text-sm font-medium text-gray-500">
                    Total Units
                  </div>
                  <div className="text-2xl font-semibold text-gray-900">
                    {totalUnits.toLocaleString()}
                  </div>
                </div>
                <div className="rounded-lg border border-gray-200 p-4">
                  <div className="text-sm font-medium text-gray-500">
                    Total Value
                  </div>
                  <div className="text-2xl font-semibold text-gray-900">
                    {formatCurrency(totalValue)}
                  </div>
                </div>
                <div className="rounded-lg border border-gray-200 p-4">
                  <div className="text-sm font-medium text-gray-500">
                    Average Price
                  </div>
                  <div className="text-2xl font-semibold text-gray-900">
                    {formatCurrency(averagePrice)}
                  </div>
                </div>
                <div className="rounded-lg border border-gray-200 p-4">
                  <div className="text-sm font-medium text-gray-500">
                    % Off MSRP
                  </div>
                  <div className="text-2xl font-semibold text-gray-900">
                    {totalPercentOff > 0
                      ? `${totalPercentOff.toFixed(1)}%`
                      : "N/A"}
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <CreateOrderSheetItems
                availableVariants={availableVariants}
                inputValues={inputValues}
                onAddItem={handleAddItem}
                onImageHover={handleImageHover}
                onImageLeave={handleImageLeave}
                onPriceChange={handlePriceChange}
                onQuantityChange={handleQuantityChange}
                onRemoveItem={handleRemoveItem}
                onVariantSelection={handleVariantSelection}
                orderItems={orderItems}
                variantsLoading={variantsLoading}
              />
            </>
          )}
        </main>

        {/* Image Hover Preview */}
        {hoveredImage && (
          <div
            className="pointer-events-none fixed z-[60] rounded-lg border border-gray-200 bg-white p-2 shadow-lg"
            style={{
              left: hoveredImage.x,
              top: hoveredImage.y,
              transform: "translateY(-50%)",
            }}
          >
            <Image
              alt="Product preview"
              className="h-32 w-32 rounded object-cover"
              height={148}
              src={hoveredImage.url}
              width={148}
            />
          </div>
        )}
      </div>

      {/* Error Alert Dialog */}
      <AlertDialog onOpenChange={setErrorOpen} open={errorOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Order Creation Error</AlertDialogTitle>
            <AlertDialogDescription className="whitespace-pre-line">
              {errorMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setErrorOpen(false)}>
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Success Alert Dialog */}
      <AlertDialog onOpenChange={setSuccessOpen} open={successOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Order Created Successfully</AlertDialogTitle>
            <AlertDialogDescription className="whitespace-pre-line">
              {successMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => {
                setSuccessOpen(false);
                onCloseAction();
              }}
            >
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
