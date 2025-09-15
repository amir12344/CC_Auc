"use client";

import Image from "next/image";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { FileSpreadsheet, ImageIcon, Loader2, X } from "lucide-react";

import { fileToDbCategoryBiMap } from "@/amplify/functions/commons/converters/ListingTypeConverter";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/src/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { Progress } from "@/src/components/ui/progress";
import { useBuyerDealsCountsInvalidation } from "@/src/features/buyer-deals/hooks/useBuyerDealsCountsInvalidation";
import { formatBackendError } from "@/src/utils/error-utils";

import { submitCatalogOffer } from "../../marketplace-catalog/services/catalogQueryService";
import { useExcelExport, useExportProgress } from "../hooks/useExcelExport";
import {
  clearCatalogOffer,
  selectCurrentCatalogId,
  selectCurrentCatalogItems,
  selectCurrentCatalogProductsGrouped,
  selectCurrentCatalogTotals,
} from "../store/offerCartSlice";
import { OfferProductRow } from "./OfferProductRow";
import { OfferVariantRows } from "./OfferVariantRows";

interface OfferSummarySheetProps {
  open: boolean;
  onClose: () => void;
}

interface OfferItem {
  variantId: string;
  pricePerUnit: number;
  selectedQuantity: number;
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

const processOfferItems = (items: OfferItem[]) => {
  return items.map((item) => ({
    catalogProductVariantId: item.variantId,
    buyerOfferPrice: item.pricePerUnit,
    buyerOfferPriceCurrency: "USD",
    requestedQuantity: item.selectedQuantity,
  }));
};

const validateOfferSubmission = (
  totalPrice: number,
  minimumOrderValue: number,
  currentCatalogId: string | null
) => {
  if (totalPrice < minimumOrderValue) {
    return {
      isValid: false,
      errorMessage: `Asking price cannot be less than the minimum order value of ${formatCurrency(
        minimumOrderValue
      )}`,
    };
  }

  if (!currentCatalogId) {
    return {
      isValid: false,
      errorMessage: "No catalog selected. Please try again.",
    };
  }

  return { isValid: true, errorMessage: "" };
};

// Extract offer submission logic
const submitOffer = async (
  catalogId: string,
  items: OfferItem[],
  setSubmissionState: (type: "error" | "success", message: string) => void
): Promise<boolean> => {
  try {
    const processedItems = await new Promise<
      ReturnType<typeof processOfferItems>
    >((resolve) => {
      if (window.requestIdleCallback) {
        window.requestIdleCallback(() => resolve(processOfferItems(items)));
      } else {
        setTimeout(() => resolve(processOfferItems(items)), 0);
      }
    });

    const { data: result, errors: createErrors } = await submitCatalogOffer({
      catalogListingId: catalogId,
      items: processedItems,
    });

    if (createErrors) {
      // createErrors is now a formatted string, safe to display directly
      setSubmissionState("error", createErrors as string);
      return false;
    }

    const parsed = typeof result === "string" ? JSON.parse(result) : result;

    if (parsed?.success === false && parsed?.error) {
      setSubmissionState("error", formatBackendError(parsed.error));
      return false;
    }
    setSubmissionState(
      "success",
      "🎉 Offer submitted successfully! The seller will review your offer and respond soon."
    );
    return true;
  } catch {
    setSubmissionState("error", "Failed to submit offer. Please try again.");
    return false;
  }
};

const OfferSummarySheet: React.FC<OfferSummarySheetProps> = ({
  open,
  onClose,
}) => {
  const dispatch = useDispatch();
  const offerItems = useSelector(selectCurrentCatalogItems);
  const currentCatalogId = useSelector(selectCurrentCatalogId);
  const totals = useSelector(selectCurrentCatalogTotals);
  const groupedProducts = useSelector(selectCurrentCatalogProductsGrouped);
  const { invalidateBuyerDealsCounts } = useBuyerDealsCountsInvalidation();

  // Memoize expensive calculations
  const memoizedTotals = useMemo(() => totals, [totals]);
  const {
    avgPricePerUnit,
    totalUnits,
    totalPrice,
    msrpDiscountPercentage,
    minimumOrderValue,
  } = memoizedTotals;

  // State management
  const [offerPrice, setOfferPrice] = useState(formatCurrency(totalPrice));
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertType, setAlertType] = useState<"error" | "success">("error");
  const [alertMessage, setAlertMessage] = useState("");
  const [hoveredImage, setHoveredImage] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Excel export functionality
  const { isExporting, progress, exportOffer, canExport, exportStats } =
    useExcelExport();
  const { formatProgressMessage, getProgressColor, getProgressIcon } =
    useExportProgress();

  // Memoize formatted offer price
  const formattedOfferPrice = useMemo(
    () => formatCurrency(totalPrice),
    [totalPrice]
  );

  // Handle offer price change
  const handleOfferPriceChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (window.requestIdleCallback) {
        window.requestIdleCallback(() => setOfferPrice(value));
      } else {
        setTimeout(() => setOfferPrice(value), 0);
      }
    },
    []
  );

  // Simplified submission state handler
  const setSubmissionState = useCallback(
    (type: "error" | "success", message: string) => {
      setAlertType(type);
      setAlertMessage(message);
      setAlertOpen(true);
    },
    []
  );

  // Simplified submit handler
  const handleSubmitOffer = useCallback(async () => {
    if (isSubmitting) {
      return;
    }

    const validation = validateOfferSubmission(
      totalPrice,
      minimumOrderValue,
      currentCatalogId
    );
    if (!validation.isValid) {
      setSubmissionState("error", validation.errorMessage);
      return;
    }

    setIsSubmitting(true);

    try {
      const success = await submitOffer(
        currentCatalogId as string,
        offerItems,
        setSubmissionState
      );

      if (success) {
        // Invalidate buyer deals counts after successful offer submission
        invalidateBuyerDealsCounts();
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [
    currentCatalogId,
    isSubmitting,
    minimumOrderValue,
    offerItems,
    setSubmissionState,
    totalPrice,
    invalidateBuyerDealsCounts,
  ]);

  // Handle alert dialog close
  const handleAlertClose = useCallback(() => {
    setAlertOpen(false);
    if (alertType === "success") {
      dispatch(clearCatalogOffer());
      setTimeout(() => onClose(), 500);
    }
  }, [alertType, onClose, dispatch]);

  // Image hover handlers
  const handleImageHover = useCallback(
    (imageUrl: string, event: React.MouseEvent) => {
      requestAnimationFrame(() => {
        setHoveredImage(imageUrl);
        setMousePosition({ x: event.clientX, y: event.clientY });
      });
    },
    []
  );

  const handleImageLeave = useCallback(() => {
    requestAnimationFrame(() => setHoveredImage(null));
  }, []);

  // Scroll prevention
  useEffect(() => {
    if (!open) {
      return;
    }

    const originalBodyStyle = document.body.style.overflow;
    const originalHtmlStyle = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    setOfferPrice(formattedOfferPrice);

    return () => {
      document.body.style.overflow = originalBodyStyle;
      document.documentElement.style.overflow = originalHtmlStyle;
    };
  }, [open, formattedOfferPrice]);

  // Memoize first product
  const firstProduct = useMemo(
    () => groupedProducts[0] || null,
    [groupedProducts]
  );

  if (!open) {
    return null;
  }

  return (
    <div className="fade-in animate-in fixed inset-0 z-50 overflow-hidden duration-500 ease-in-out">
      <div
        className="fade-in animate-in bg-opacity-50 absolute inset-0 bg-black backdrop-blur-sm duration-500 ease-in-out"
        onClick={onClose}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
        role="button"
        tabIndex={0}
      />
      <div
        aria-labelledby="offer-summary-title"
        aria-modal="true"
        className="slide-in-from-bottom animate-in fixed inset-0 z-50 overflow-y-auto bg-white delay-75 duration-500 ease-out"
        role="dialog"
        // Remove problematic aria-hidden
      >
        {/* Header */}
        <div className="px-8 pt-8 pb-4 sm:px-10">
          <div className="flex justify-end">
            <button
              aria-label="Close"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-gray-700 transition-colors hover:bg-gray-300 focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:outline-none"
              onClick={onClose}
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
                    {offerItems.length > 0 &&
                    offerItems[0]?.listingImage &&
                    offerItems[0].listingImage.trim() !== "" ? (
                      <div
                        className="h-14 w-14 rounded-lg bg-gray-200"
                        style={{
                          backgroundImage: `url(${offerItems[0].listingImage})`,
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
                      id="offer-summary-title"
                    >
                      {offerItems[0].brandName}
                    </h1>
                    <p className="text-base text-gray-600">
                      {fileToDbCategoryBiMap.getKey(
                        firstProduct?.variants[0].category as never
                      )}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
                <button
                  className="w-full cursor-pointer rounded-full bg-black px-5 py-2.5 text-sm text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                  disabled={isSubmitting}
                  onClick={handleSubmitOffer}
                  type="button"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Submitting...
                    </span>
                  ) : (
                    "Submit Offer"
                  )}
                </button>
                <button
                  className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-gray-300 px-4 py-2.5 text-sm hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                  disabled={!canExport || isExporting}
                  onClick={() => exportOffer()}
                  type="button"
                >
                  {isExporting ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    ""
                  )}
                  {isExporting ? "Exporting..." : "Export Offer"}
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="px-6 py-6 sm:px-10 md:px-12">
          {/* Stats Grid - Memoized for performance */}
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
            <div className="rounded-lg border border-gray-200 p-4">
              <div className="text-sm font-medium text-gray-500">Products</div>
              <div className="text-xl font-semibold">
                {groupedProducts.length}
              </div>
            </div>
            <div className="rounded-lg border border-gray-200 p-4">
              <div className="text-sm font-medium text-gray-500">
                Avg. price per unit
              </div>
              <div className="text-xl font-semibold">
                ${avgPricePerUnit.toFixed(2)}
              </div>
            </div>
            <div className="rounded-lg border border-gray-200 p-4">
              <div className="text-sm font-medium text-gray-500">Units</div>
              <div className="text-xl font-semibold">
                {totalUnits.toLocaleString()}
              </div>
            </div>
            <div className="rounded-lg border border-gray-200 p-4">
              <div className="text-sm font-medium text-gray-500">
                Total asking price
              </div>
              <div className="text-xl font-semibold">
                {formatCurrency(totalPrice)}
              </div>
            </div>
          </div>

          {/* Saved to Draft */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-green-600">
              <svg
                className="h-5 w-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <title>Success checkmark</title>
                <path
                  clipRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  fillRule="evenodd"
                />
              </svg>
              <span className="text-sm font-medium">Saved to Draft</span>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <button
                className="text-sm text-gray-600 transition-colors hover:text-gray-900"
                type="button"
              >
                Reset
              </button>
              <button
                className="flex items-center gap-1 text-sm font-medium text-gray-900 transition-colors hover:text-gray-600"
                type="button"
              >
                <span className="text-lg">+</span> Add more items
              </button>
            </div>
          </div>

          {/* Products Table - Virtualized for large datasets */}
          <div className="mb-8 overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    className="px-3 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
                    scope="col"
                  >
                    Product Name
                  </th>
                  <th
                    className="px-3 py-3 text-center text-xs font-medium tracking-wider text-gray-500 uppercase"
                    scope="col"
                  >
                    Variants
                  </th>
                  <th
                    className="px-3 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase"
                    scope="col"
                  >
                    MSRP
                  </th>
                  <th
                    className="px-3 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase"
                    scope="col"
                  >
                    Price/Unit
                  </th>
                  <th
                    className="px-3 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase"
                    scope="col"
                  >
                    Total Units
                  </th>
                  <th
                    className="px-3 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase"
                    scope="col"
                  >
                    Total Price
                  </th>
                  <th
                    className="w-10 px-2 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase"
                    scope="col"
                  />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {groupedProducts.map((product) => (
                  <React.Fragment key={product.productId}>
                    {/* Main Product Row */}
                    <OfferProductRow
                      avgPricePerUnit={product.avgPricePerUnit}
                      msrp={product.msrp || 0}
                      productId={product.productId || product.catalogProductId}
                      productImage={product.variants[0]?.productImage}
                      productName={product.productName}
                      totalPrice={product.totalPrice}
                      totalUnits={product.totalUnits}
                      totalVariants={product.totalVariants}
                    />

                    {/* Expandable Variant Rows */}
                    <OfferVariantRows
                      onImageHover={handleImageHover}
                      onImageLeave={handleImageLeave}
                      productId={product.productId || product.catalogProductId}
                      variants={product.variants}
                    />
                  </React.Fragment>
                ))}
                {groupedProducts.length === 0 && (
                  <tr>
                    <td
                      className="px-6 py-10 text-center text-gray-500"
                      colSpan={7}
                    >
                      No items in your offer yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </main>

        {/* Footer */}
        <footer className="sticky bottom-0 border-t border-gray-200 bg-white px-6 py-8 sm:px-10 md:px-12">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="grid grid-cols-2 gap-4 sm:flex sm:gap-12">
              <div>
                <span className="text-sm text-gray-500">Min. Order Value</span>
                <div className="text-lg font-medium">
                  {formatCurrency(minimumOrderValue)}
                </div>
              </div>
              <div>
                <span className="text-sm text-gray-500">Total Price</span>
                <div className="text-lg font-medium">
                  {formatCurrency(totalPrice)}
                </div>
              </div>
              <div>
                <span className="text-sm text-gray-500">% Off MSRP</span>
                <div className="text-lg font-medium">
                  {msrpDiscountPercentage.toFixed(1)}%
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative">
                <label
                  className="absolute -top-5 left-0 text-sm text-gray-500"
                  htmlFor="offer-price-input"
                >
                  Offer price
                </label>
                <input
                  className="w-full cursor-not-allowed rounded-full border border-gray-300 bg-gray-50 px-4 py-2.5 sm:w-40"
                  disabled
                  id="offer-price-input"
                  onChange={handleOfferPriceChange}
                  type="text"
                  value={offerPrice}
                />
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* Alert Dialog */}
      <AlertDialog onOpenChange={setAlertOpen} open={alertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {alertType === "error"
                ? "Validation Error"
                : "Offer Submitted Successfully! 🎉"}
            </AlertDialogTitle>
            <AlertDialogDescription className="whitespace-pre-line">
              {alertMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleAlertClose}>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Excel Export Progress Dialog */}
      <Dialog open={isExporting && !!progress}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Exporting Offer to Excel
            </DialogTitle>
            <DialogDescription>
              Processing {exportStats.totalItems} variants with images...
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {progress && (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-lg">
                    {getProgressIcon(progress.stage)}
                  </span>
                  <span
                    className={`text-sm font-medium ${getProgressColor(
                      progress.stage
                    )}`}
                  >
                    {formatProgressMessage(progress)}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{Math.round(progress.progress)}%</span>
                  </div>
                  <Progress className="h-2" value={progress.progress} />
                </div>
                {progress.currentOperation && (
                  <div className="text-xs text-gray-500">
                    {progress.currentOperation}
                  </div>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Hover Preview */}
      {hoveredImage && (
        <div
          className="pointer-events-none fixed z-50"
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
    </div>
  );
};

export default OfferSummarySheet;
