"use client";

import Image from "next/image";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
} from "react";
import { useDispatch, useSelector } from "react-redux";

import { ImageIcon, X } from "lucide-react";

import {
  fileToDbConditionBiMap,
  fileToDbPackagingBiMap,
} from "@/amplify/functions/commons/converters/ListingTypeConverter";
import { Button } from "@/src/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { transformOfferVariantToCartItem } from "@/src/features/marketplace-catalog/utils/catalogToOfferTransform";
import type { RootState } from "@/src/lib/store";

import {
  addToCatalogOffer,
  removeProductFromCatalogOffer,
  selectCurrentCatalogItems,
} from "../store/offerCartSlice";
import {
  closeOfferModal,
  updateVariant,
  updateVariantPrice,
  updateVariantQuantity,
} from "../store/offerSlice";
import type { OfferVariant } from "../types";

// Product Header Component
interface ProductHeaderProps {
  productImage: string;
  productTitle: string;
  subtitle: string;
  onClose: () => void;
}

const ProductHeader: React.FC<ProductHeaderProps> = ({
  productImage,
  productTitle,
  subtitle,
  onClose,
}) => (
  <div className="relative flex items-start gap-4 border-b p-5 md:gap-8 md:p-10">
    <button
      aria-label="Close dialog"
      className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 focus:outline-none"
      onClick={onClose}
      type="button"
    >
      <X size={24} />
    </button>

    <div className="flex items-center justify-center overflow-hidden rounded-md border border-gray-100 bg-white p-2 shadow-sm">
      {productImage ? (
        <Image
          alt={productTitle || "Product"}
          className="h-16 w-16 object-cover md:h-24 md:w-24"
          height={96}
          src={productImage}
          width={96}
        />
      ) : (
        <div className="flex h-16 w-16 items-center justify-center rounded-md bg-gray-100 text-gray-400 md:h-24 md:w-24">
          <ImageIcon className="h-8 w-8 md:h-12 md:w-12" />
        </div>
      )}
    </div>

    <div className="flex flex-col gap-1 md:gap-2">
      <div className="text-lg leading-tight font-semibold text-gray-900 md:text-2xl">
        {productTitle || "Glass Flow 275 ML"}
      </div>
      <div className="flex items-center gap-3 md:gap-4">
        <div className="text-xs text-gray-500 md:text-sm">{subtitle}</div>
        <div className="h-3 w-px bg-gray-300"></div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-red-500"></span>
          <span className="text-xs text-gray-500">
            Amazon Buy Box Price - Pricing coming soon
          </span>
        </div>
      </div>
    </div>
  </div>
);

// Variant Card Component (Mobile)
interface VariantCardProps {
  variant: OfferVariant;
  onVariantSelect: () => void;
  onPriceChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onInventoryChange: (e: ChangeEvent<HTMLInputElement>) => void;
  inputValue?: string;
  onImageHover?: (imageUrl: string, event: React.MouseEvent) => void;
  onImageLeave?: () => void;
}

const VariantCard: React.FC<VariantCardProps> = ({
  variant,
  onVariantSelect,
  onPriceChange,
  onInventoryChange,
  inputValue,
  onImageHover,
  onImageLeave,
}) => (
  <div className="space-y-3 rounded-lg border border-gray-200 bg-white p-4">
    <div className="flex items-center gap-3">
      <input
        aria-label={
          variant.checked
            ? `Unselect variant ${variant.name}`
            : `Select variant ${variant.name}`
        }
        checked={variant.checked}
        className="h-5 w-5 rounded-md border-gray-300 bg-black text-black accent-black focus:ring-black focus:ring-offset-0"
        id={`mobile-variant-${variant.variantSku}`}
        onChange={onVariantSelect}
        type="checkbox"
      />
      <div className="flex items-center gap-2">
        {variant.image ? (
          <button
            className="flex h-6 w-6 cursor-pointer items-center justify-center overflow-hidden rounded-sm bg-gray-100 transition-transform hover:scale-110"
            onMouseEnter={(e) => onImageHover?.(variant.image || "", e)}
            onMouseLeave={onImageLeave}
            type="button"
          >
            <Image
              alt={variant.name}
              className="h-6 w-6 object-cover"
              height={24}
              src={variant.image}
              width={24}
            />
          </button>
        ) : (
          <div className="flex h-6 w-6 items-center justify-center rounded-sm bg-gray-100 text-gray-400">
            <ImageIcon className="h-4 w-4" />
          </div>
        )}
        <span className="font-medium">{variant.name}</span>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-3 text-sm">
      <div>
        <div className="mb-1 text-xs text-gray-500">Inventory</div>
        <div className="mb-1 text-xs text-gray-500">2,000</div>
        <input
          aria-label={`Units for ${variant.name}`}
          className="w-full rounded border px-3 py-2 text-right"
          min={0}
          onChange={onInventoryChange}
          type="number"
          value={variant.totalUnits}
        />
      </div>
      <div>
        <div className="mb-1 text-xs text-gray-500">Price/Unit</div>
        <div className="flex flex-col">
          <div className="relative w-full">
            <span className="absolute top-2 left-3 text-gray-500">$</span>
            <input
              aria-label={`Price per unit for ${variant.name}`}
              className="w-full rounded border py-2 pr-3 pl-6 text-right text-sm font-medium"
              onChange={onPriceChange}
              type="text"
              value={
                inputValue !== undefined
                  ? inputValue
                  : variant.pricePerUnit.toFixed(2)
              }
            />
          </div>
          <span className="text-xs text-gray-500">
            ${variant.offerPrice.toFixed(2)}
          </span>
        </div>
      </div>
      <div>
        <div className="mb-1 text-xs text-gray-500">Total Units</div>
        <div className="text-sm">{variant.totalUnits.toLocaleString()}</div>
      </div>
      <div>
        <div className="mb-1 text-xs text-gray-500">Total Price</div>
        <div className="text-sm font-semibold">
          $
          {(variant.totalPrice || 0).toLocaleString(undefined, {
            minimumFractionDigits: 2,
          })}
        </div>
      </div>
    </div>
  </div>
);

// Variant Row Component (Desktop)
interface VariantRowProps {
  variant: OfferVariant;
  onVariantSelect: () => void;
  onPriceChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onInventoryChange: (e: ChangeEvent<HTMLInputElement>) => void;
  inputValue?: string;
  onImageHover?: (imageUrl: string, event: React.MouseEvent) => void;
  onImageLeave?: () => void;
}

const VariantRow: React.FC<VariantRowProps> = ({
  variant,
  onVariantSelect,
  onPriceChange,
  onInventoryChange,
  inputValue,
  onImageHover,
  onImageLeave,
}) => (
  <tr className="bg-white hover:bg-gray-50">
    <td className="py-4 text-center">
      <div className="flex items-center">
        <input
          aria-label={
            variant.checked
              ? `Unselect variant ${variant.name}`
              : `Select variant ${variant.name}`
          }
          checked={variant.checked}
          className="h-5 w-5 rounded-md border-gray-300 bg-black text-black accent-black focus:ring-black focus:ring-offset-0"
          id={`variant-${variant.variantSku}`}
          onChange={onVariantSelect}
          type="checkbox"
        />
      </div>
    </td>
    <td className="py-4 text-center">
      {variant.image ? (
        <div className="flex justify-center">
          <button
            className="flex h-8 w-8 cursor-pointer items-center justify-center overflow-hidden rounded-md bg-gray-100 transition-transform hover:scale-110"
            onMouseEnter={(e) => onImageHover?.(variant.image || "", e)}
            onMouseLeave={onImageLeave}
            type="button"
          >
            <Image
              alt={variant.name}
              className="h-8 w-8 object-cover"
              height={32}
              src={variant.image}
              width={32}
            />
          </button>
        </div>
      ) : (
        <div className="flex justify-center">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gray-100 text-gray-400">
            <ImageIcon className="h-4 w-4" />
          </div>
        </div>
      )}
    </td>
    <td className="py-4 pl-2 font-medium text-gray-900">
      <span>{variant.name}</span>
    </td>
    <td className="py-4 text-center text-gray-700">
      <div className="flex flex-col items-center gap-1">
        <input
          aria-label={`Inventory for ${variant.name}`}
          className="w-20 rounded border px-2 py-1 text-center text-sm"
          max={variant.availableQuantity || 1000}
          min={0}
          onChange={onInventoryChange}
          type="number"
          value={variant.totalUnits}
        />
        <div className="text-xs text-gray-500">
          {variant.availableQuantity?.toLocaleString() || "N/A"}
        </div>
      </div>
    </td>
    <td className="py-4 text-center text-gray-700">
      <div className="flex flex-col items-center gap-1">
        <div className="relative w-20">
          <span className="absolute top-1 left-2 text-gray-500">$</span>
          <input
            aria-label={`Price per unit for ${variant.name}`}
            className="w-20 rounded border py-1 pr-2 pl-5 text-right text-sm"
            onChange={onPriceChange}
            type="text"
            value={
              inputValue !== undefined
                ? inputValue
                : variant.pricePerUnit.toFixed(2)
            }
          />
        </div>
        <div className="text-xs text-gray-500">
          ${variant.offerPrice.toFixed(2)}
        </div>
      </div>
    </td>
    <td className="py-4 text-center text-gray-700">
      <input
        aria-label={`Total units for ${variant.name}`}
        className="w-20 rounded border bg-gray-50 px-2 py-1 text-center text-sm"
        min={0}
        readOnly
        type="number"
        value={variant.totalUnits}
      />
    </td>
    <td className="py-4 text-center font-semibold text-gray-900">
      $
      {(variant.totalPrice || 0).toLocaleString(undefined, {
        minimumFractionDigits: 2,
      })}
    </td>
  </tr>
);

// Summary Component
// Summary component no longer needed as it's now inline in the footer

// Main Component
export default function BuildOfferModal() {
  const [isMobile, setIsMobile] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [inputValues, setInputValues] = useState<{ [key: string]: string }>({});
  const [hoveredImage, setHoveredImage] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const dispatch = useDispatch();
  const {
    open,
    productTitle,
    variants,
    catalogProductId,
    productImage,
    listingImage,
    productStats,
  } = useSelector((state: RootState) => state.buildOffer);
  const offerItems = useSelector(selectCurrentCatalogItems);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Clear input values when modal opens with new/updated data to ensure sync
  useEffect(() => {
    if (open) {
      setInputValues({});
    }
  }, [open]);

  // Memoized calculations - only include selected variants
  const selectedVariants = useMemo(
    () => variants.filter((v) => v.checked),
    [variants]
  );

  const totalUnits = useMemo(
    () =>
      selectedVariants.reduce((sum, variant) => sum + variant.totalUnits, 0),
    [selectedVariants]
  );

  const totalPrice = useMemo(
    () =>
      selectedVariants.reduce(
        (sum, variant) => sum + (variant.totalPrice || 0),
        0
      ),
    [selectedVariants]
  );

  const avgPricePerUnit = useMemo(
    () => (totalUnits > 0 ? totalPrice / totalUnits : 0),
    [totalUnits, totalPrice]
  );

  // Memoized handlers
  const handleClose = useCallback(() => {
    dispatch(closeOfferModal());
  }, [dispatch]);

  const handleVariantSelect = useCallback(
    (variantSku: string) => {
      const variant = variants.find((v) => v.variantSku === variantSku);
      if (variant) {
        dispatch(updateVariant({ variantSku, checked: !variant.checked }));
      }
    },
    [dispatch, variants]
  );

  const handleSelectAll = useCallback(() => {
    const allSelected = variants.every((v) => v.checked);
    for (const variant of variants) {
      dispatch(
        updateVariant({ variantSku: variant.variantSku, checked: !allSelected })
      );
    }
  }, [dispatch, variants]);

  const allSelected = useMemo(
    () => variants.length > 0 && variants.every((v) => v.checked),
    [variants]
  );

  const someSelected = useMemo(
    () => variants.some((v) => v.checked),
    [variants]
  );

  const handlePriceChange = useCallback(
    (variantSku: string, value: string) => {
      // Store the raw input value
      setInputValues((prev) => ({
        ...prev,
        [variantSku]: value,
      }));

      // Process value for state update
      // Remove non-numeric characters except decimal point
      const numericValue = value.replace(/[^0-9.]/g, "");
      const pricePerUnit = numericValue ? Number.parseFloat(numericValue) : 0;

      if (!Number.isNaN(pricePerUnit)) {
        dispatch(updateVariantPrice({ variantSku, pricePerUnit }));
      }
    },
    [dispatch]
  );

  const handleInventoryChange = useCallback(
    (variantSku: string, inventory: number, maxInventory: number) => {
      // Validate inventory doesn't exceed available quantity
      const validatedInventory = Math.min(Math.max(0, inventory), maxInventory);
      dispatch(
        updateVariantQuantity({ variantSku, quantity: validatedInventory })
      );
    },
    [dispatch]
  );

  // Check if product already has selections (edit mode)
  const isEditMode = useMemo(() => {
    return offerItems.some(
      (item) => item.catalogProductId === catalogProductId
    );
  }, [offerItems, catalogProductId]);

  const handleAddToOffer = () => {
    const checkedVariants = variants.filter((v) => v.checked);

    if (!catalogProductId) {
      return;
    }

    if (isEditMode) {
      // Show confirmation UI within the same modal
      setShowConfirmation(true);
      return;
    }

    // Add new selections directly if not in edit mode
    addVariantsToOffer(checkedVariants);
  };

  const addVariantsToOffer = (checkedVariants: typeof variants) => {
    if (isEditMode) {
      // Remove existing selections for this product first
      dispatch(
        removeProductFromCatalogOffer({
          catalogProductId: catalogProductId || "",
        })
      );
    }

    // Add new selections using proper transform
    for (const variant of checkedVariants) {
      const images = {
        listingImage: listingImage || "",
        productImage: productImage || "",
        variantImage: variant.image,
      };

      // Transform variant to cart item with proper mapping
      const cartItem = transformOfferVariantToCartItem(
        {
          ...variant,
          packaging:
            fileToDbPackagingBiMap.getValue(variant.packaging as never) || null,
          product_condition:
            fileToDbConditionBiMap.getValue(
              variant.product_condition as never
            ) || null,
        },
        productTitle || "",
        images,
        variant.totalUnits
      );

      dispatch(addToCatalogOffer(cartItem));
    }

    handleClose();
  };

  const handleConfirmUpdate = () => {
    const checkedVariants = variants.filter((v) => v.checked);
    setShowConfirmation(false);
    addVariantsToOffer(checkedVariants);
  };

  const handleCancelUpdate = () => {
    setShowConfirmation(false);
  };

  const handleImageHover = useCallback(
    (imageUrl: string, event: React.MouseEvent) => {
      setHoveredImage(imageUrl);
      setMousePosition({ x: event.clientX, y: event.clientY });
    },
    []
  );

  const handleImageLeave = useCallback(() => {
    setHoveredImage(null);
  }, []);

  if (!open) {
    return null;
  }

  return (
    <>
      <Dialog modal onOpenChange={handleClose} open={open}>
        <DialogContent
          className="flex h-[92vh] w-[96vw] flex-col overflow-hidden rounded-lg p-0 shadow-xl sm:h-[92vh] sm:w-[92vw] sm:max-w-none md:h-[90vh] md:w-[90vw] md:max-w-none lg:h-[92vh] lg:w-[85vw] lg:max-w-none xl:h-[92vh] xl:w-[80vw] xl:max-w-none 2xl:h-[92vh] 2xl:w-[75vw] 2xl:max-w-none"
          hideCloseButton
        >
          <DialogHeader className="sr-only">
            <DialogTitle>{productTitle || "Product Details"}</DialogTitle>
            <DialogDescription>
              Select variants and quantities for your offer
            </DialogDescription>
          </DialogHeader>

          <div className="relative flex h-full w-full flex-col overflow-hidden">
            <ProductHeader
              onClose={handleClose}
              productImage={productImage || ""}
              productTitle={productTitle}
              subtitle={
                productStats
                  ? `${productStats.retailPrice} • ${productStats.totalUnits} units • ${productStats.variantCount} variants`
                  : "3 variants"
              }
            />

            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              {isMobile ? (
                <div className="max-h-[35vh] overflow-y-auto p-4 sm:max-h-[35vh] md:max-h-[35vh]">
                  {/* Mobile Select All Header */}
                  <div className="mb-4 flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <div className="flex items-center gap-3">
                      <input
                        aria-label="Select all variants"
                        checked={allSelected}
                        className="h-5 w-5 rounded-md border-gray-300 bg-black text-black accent-black focus:ring-black focus:ring-offset-0"
                        onChange={handleSelectAll}
                        ref={(el) => {
                          if (el) {
                            el.indeterminate = someSelected && !allSelected;
                          }
                        }}
                        type="checkbox"
                      />
                      <span className="text-sm font-medium text-gray-900">
                        Select All Variants
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {variants.filter((v) => v.checked).length} of{" "}
                      {variants.length} selected
                    </span>
                  </div>

                  {/* Variant Cards */}
                  <div className="space-y-4">
                    {variants.map((variant) => (
                      <VariantCard
                        inputValue={inputValues[variant.variantSku]}
                        key={variant.variantSku}
                        onImageHover={handleImageHover}
                        onImageLeave={handleImageLeave}
                        onInventoryChange={(e) =>
                          handleInventoryChange(
                            variant.variantSku,
                            Number(e.target.value),
                            variant.availableQuantity || variant.totalUnits
                          )
                        }
                        onPriceChange={(e) =>
                          handlePriceChange(variant.variantSku, e.target.value)
                        }
                        onVariantSelect={() =>
                          handleVariantSelect(variant.variantSku)
                        }
                        variant={variant}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="max-h-[40vh] overflow-x-auto overflow-y-auto p-3 px-6 pl-8 sm:max-h-[45vh] md:max-h-[48vh] lg:max-h-[50vh] xl:max-h-[55vh] 2xl:max-h-[60vh]">
                  <table className="w-full border-separate border-spacing-y-3">
                    <thead className="sticky top-0 bg-white">
                      <tr className="text-xs font-semibold text-gray-500">
                        <th className="w-12 pb-2 text-left">
                          <input
                            aria-label="Select all variants"
                            checked={allSelected}
                            className="h-5 w-5 rounded-md border-gray-300 bg-black text-black accent-black focus:ring-black focus:ring-offset-0"
                            onChange={handleSelectAll}
                            ref={(el) => {
                              if (el) {
                                el.indeterminate = someSelected && !allSelected;
                              }
                            }}
                            type="checkbox"
                          />
                        </th>
                        <th className="w-16 pb-2 text-center"> </th>
                        <th className="pb-2 pl-2 text-left">Variant</th>
                        <th className="pb-2 text-center">Inventory</th>
                        <th className="pb-2 text-center">Price/Unit</th>
                        <th className="pb-2 text-center">Total Units</th>
                        <th className="pb-2 text-center">Total Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {variants.map((variant) => (
                        <VariantRow
                          inputValue={inputValues[variant.variantSku]}
                          key={variant.variantSku}
                          onImageHover={handleImageHover}
                          onImageLeave={handleImageLeave}
                          onInventoryChange={(e) =>
                            handleInventoryChange(
                              variant.variantSku,
                              Number(e.target.value),
                              variant.availableQuantity || variant.totalUnits
                            )
                          }
                          onPriceChange={(e) =>
                            handlePriceChange(
                              variant.variantSku,
                              e.target.value
                            )
                          }
                          onVariantSelect={() =>
                            handleVariantSelect(variant.variantSku)
                          }
                          variant={variant}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Totals Section - Now in Footer Area */}
            <div className="sticky bottom-0 z-10 flex shrink-0 flex-col items-center justify-between gap-3 border-t bg-white px-4 py-6 sm:flex-row sm:items-center">
              {/* Summary stats inline */}
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-gray-500">Units:</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {totalUnits.toLocaleString()}
                  </span>
                </div>
                <div className="h-3 w-px bg-gray-300" />
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-gray-500">Value:</span>
                  <span className="text-sm font-semibold text-green-600">
                    $
                    {totalPrice.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className="h-3 w-px bg-gray-300" />
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-gray-500">Avg/Unit:</span>
                  <span className="text-sm font-semibold text-gray-700">
                    ${avgPricePerUnit.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                <Button
                  className="rounded-full px-4 md:px-6"
                  onClick={handleClose}
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button
                  className="rounded-full bg-black px-4 text-white hover:bg-gray-800 md:px-6"
                  disabled={!variants.some((v) => v.checked)}
                  onClick={handleAddToOffer}
                >
                  {isEditMode ? "Update Offer" : "Add to Offer"}
                </Button>
              </div>
            </div>

            {/* Confirmation UI within the modal */}
            {showConfirmation && (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
                <div className="mx-4 w-full max-w-md rounded-lg border bg-white p-6 shadow-xl">
                  <h3 className="mb-2 text-lg font-semibold">
                    Update Offer Selections
                  </h3>
                  <p className="mb-4 text-gray-600">
                    Are you sure you want to update your offer selections for
                    this product?
                  </p>
                  <div className="flex justify-end gap-2">
                    <button
                      className="rounded-full border border-gray-300 px-5 py-2 text-sm transition-colors hover:bg-gray-50"
                      onClick={handleCancelUpdate}
                      type="button"
                    >
                      Cancel
                    </button>
                    <button
                      className="rounded-full bg-black px-4 py-2 text-white hover:bg-gray-800"
                      onClick={handleConfirmUpdate}
                      type="button"
                    >
                      Update Selections
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Hover Preview */}
      {open && hoveredImage && (
        <div
          className="pointer-events-none fixed z-[100]"
          style={{
            left: mousePosition.x + 10,
            top: mousePosition.y - 100,
          }}
        >
          <div className="rounded-lg border border-gray-200 bg-white p-2 shadow-lg">
            <Image
              alt="Variant preview"
              className="rounded object-cover"
              height={200}
              src={hoveredImage}
              width={200}
            />
          </div>
        </div>
      )}
    </>
  );
}
