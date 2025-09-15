"use client";

import Image from "next/image";
import { useCallback, useState } from "react";

import { Check, ChevronDown, ImageIcon, Loader2 } from "lucide-react";

import {
  fileToDbCategoryBiMap,
  fileToDbPackagingBiMap,
} from "@/amplify/functions/commons/converters/ListingTypeConverter";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/src/components/ui/alert-dialog";
import { Button } from "@/src/components/ui/button";
import { ConditionalActionButton } from "@/src/components/ui/ConditionalActionButton";
import { useBuyerDealsCountsInvalidation } from "@/src/features/buyer-deals/hooks/useBuyerDealsCountsInvalidation";
import type { EnhancedProduct } from "@/src/features/offer-management/types";
import { formatBackendError } from "@/src/utils/error-utils";

import { submitCatalogOffer } from "../services/catalogQueryService";
import { getImageUrl } from "../services/imageService";
import type { DetailedCatalogListing } from "../types/catalog";
import { generateCatalogPdf } from "../utils/catalogPdfGenerator";
import {
  transformBulkProductsToCartItems,
  transformEnhancedProductToOfferVariants,
} from "../utils/catalogToOfferTransform";

/**
 * CatalogDisplay Component
 *
 * Mirrors ProductDisplay component exactly but adapted for catalog data.
 * Displays catalog image, title, category, pricing, and description.
 * Provides action buttons for catalog interaction including Buy All functionality.
 */

interface CatalogDetails {
  imageUrl: string;
  name: string;
  category: string;
  totalAskingPrice: string;
  msrpPercentage: string;
  leadTime: string;
  description: string;
}

interface CatalogDisplayProps {
  catalog: CatalogDetails;
  catalogListing: DetailedCatalogListing;
  products: EnhancedProduct[];
}

export const CatalogDisplay = ({
  catalog,
  catalogListing,
  products,
}: CatalogDisplayProps) => {
  const [imageError, setImageError] = useState(false);
  const [isSubmittingOffer, setIsSubmittingOffer] = useState(false);
  const [offerSubmitted, setOfferSubmitted] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertType, setAlertType] = useState<"error" | "success">("error");
  const [alertMessage, setAlertMessage] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false); // Added: confirmation dialog for Buy All
  const { invalidateBuyerDealsCounts } = useBuyerDealsCountsInvalidation();
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  /**
   * Transform products to API format for submission
   */
  const transformProductsToApiFormat = useCallback(() => {
    const cartItems = transformBulkProductsToCartItems(
      products,
      catalogListing
    );

    return cartItems.map((item) => ({
      catalogProductVariantId: item.variantId,
      buyerOfferPrice: item.offerPrice,
      buyerOfferPriceCurrency: "USD",
      requestedQuantity: item.selectedQuantity,
    }));
  }, [products, catalogListing]);

  /**
   * Handle API response and show appropriate alert messages
   */
  const handleApiResponse = useCallback(
    (result: unknown, offerErrors: unknown) => {
      if (offerErrors) {
        setAlertType("error");
        // offerErrors is now a formatted string, safe to display directly
        setAlertMessage(
          typeof offerErrors === "string"
            ? offerErrors
            : "Unable to submit your offer. Please try again."
        );
        setAlertOpen(true);
        return false;
      }

      const parsed = typeof result === "string" ? JSON.parse(result) : result;

      if (parsed?.success === false && parsed?.error) {
        setAlertType("error");
        setAlertMessage(formatBackendError(parsed.error));
        setAlertOpen(true);
        return false;
      }

      return true;
    },
    []
  );

  /**
   * Handle Buy All functionality - uses same transformation as working table
   */
  const handleBuyAll = useCallback(async () => {
    if (isSubmittingOffer) {
      return;
    }

    setIsSubmittingOffer(true);

    try {
      const allItems = transformProductsToApiFormat();

      if (allItems.length === 0) {
        setAlertType("error");
        setAlertMessage("This catalog has no available products to purchase.");
        setAlertOpen(true);
        return;
      }

      const { data: result, errors: offerErrors } = await submitCatalogOffer({
        catalogListingId: catalogListing.id,
        items: allItems,
      });

      const success = handleApiResponse(result, offerErrors);

      if (success) {
        setOfferSubmitted(true);
        setAlertType("success");
        setAlertMessage(
          `Your offer for all products in "${catalogListing.title}" has been submitted. You'll be notified when the seller responds.`
        );
        setAlertOpen(true);
        invalidateBuyerDealsCounts();
      }
    } catch (error) {
      setAlertType("error");
      setAlertMessage(
        error instanceof Error
          ? error.message
          : "An unexpected error occurred. Please try again."
      );
      setAlertOpen(true);
    } finally {
      setIsSubmittingOffer(false);
    }
  }, [
    transformProductsToApiFormat,
    handleApiResponse,
    catalogListing.id,
    catalogListing.title,
    isSubmittingOffer,
    invalidateBuyerDealsCounts,
  ]);

  // Added: confirm handler that closes the dialog before submitting
  const handleConfirmBuyAll = useCallback(() => {
    setConfirmOpen(false);
    void handleBuyAll();
  }, [handleBuyAll]);

  /**
   * Handle alert dialog close
   */
  const handleAlertClose = useCallback(() => {
    setAlertOpen(false);
  }, []);

  /**
   * Render Buy All button with proper state
   */
  const renderBuyAllButton = () => {
    if (isSubmittingOffer) {
      return (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Submitting Offer...
        </>
      );
    }

    if (offerSubmitted) {
      return (
        <>
          <Check className="mr-2 h-4 w-4" />
          Offer Submitted
        </>
      );
    }

    return "Buy All";
  };

  return (
    <div className="flex flex-col gap-6 md:flex-row">
      {/* Catalog Image - Better container filling */}
      <div className="relative h-60 w-full flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 md:w-60">
        {catalog.imageUrl && !imageError ? (
          <Image
            alt={catalog.name}
            className="object-cover p-0"
            fill
            onError={() => setImageError(true)}
            priority
            sizes="(max-width: 768px) 100vw, 240px"
            src={catalog.imageUrl}
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-gray-100 text-gray-400">
            <ImageIcon className="mb-2 h-12 w-12" />
            <p className="text-sm font-medium">{catalog.name}</p>
          </div>
        )}
      </div>

      {/* Catalog Info & Actions */}
      <div className="flex flex-1 flex-col">
        {/* Category and Name */}
        <div className="mb-2">
          <h1 className="mt-1 text-2xl font-bold text-gray-900">
            {catalog.name}
          </h1>
        </div>

        <div className="mb-2">
          <h1 className="text-sm font-semibold text-gray-900">
            {catalog.category
              ? fileToDbCategoryBiMap.getKey(catalog.category as never)
              : ""}
          </h1>
        </div>

        {/* Catalog Details */}
        <div className="mb-2">
          <div className="mb-1 flex items-center space-x-2">
            <span className="text-sm font-semibold text-gray-900">
              Total asking {catalog.totalAskingPrice}
            </span>
            <span className="text-sm text-gray-600">
              ({catalog.msrpPercentage})
            </span>
          </div>
          <p className="text-sm text-gray-700">
            Lead time: <span className="font-semibold">{catalog.leadTime}</span>
          </p>
        </div>

        {/* Description */}
        <p className="text-dark mb-4 text-sm leading-relaxed">
          {catalog.description}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <ConditionalActionButton
            className={`h-10 rounded-full px-6 text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 ${
              offerSubmitted ? "bg-green-600" : "bg-black hover:bg-gray-800"
            }`}
            disabled={isSubmittingOffer || offerSubmitted}
            guestText="Sign In to Buy All"
            isLoading={isSubmittingOffer}
            itemName={catalogListing.title}
            onAuthenticatedClick={() => setConfirmOpen(true)}
            requiredUserType="buyer"
            triggerAction="buy_now"
          >
            {renderBuyAllButton()}
          </ConditionalActionButton>
          <Button
            className="h-10 rounded-full border-gray-300 px-6 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
            disabled={isGeneratingPdf}
            onClick={async () => {
              try {
                setIsGeneratingPdf(true);

                // Transform products to match PDF template format and include variants
                const pdfProducts = products.map((product) => {
                  const variants = transformEnhancedProductToOfferVariants(
                    product,
                    catalogListing
                  );
                  const pdfVariants = variants.map((v) => ({
                    id: v.variantId,
                    name: v.name,
                    sku: v.variantSku,
                    units: v.availableQuantity,
                    retailPrice: v.retailPrice || 0,
                    offerPrice: v.offerPrice || 0,
                    totalPrice:
                      (v.offerPrice || 0) * (v.availableQuantity || 0),
                    imageUrl: v.image,
                  }));

                  return {
                    id: product.catalogProductId,
                    name: product.productName,
                    totalUnits: product.totalUnits || 0,
                    retailPrice: product.retailPrice || 0,
                    offerPrice: product.offerPrice || product.retailPrice || 0,
                    totalPrice:
                      product.totalPrice ||
                      (product.offerPrice || product.retailPrice || 0) *
                        (product.totalUnits || 0),
                    // Fallback to first variant image if product image is missing
                    imageUrl:
                      product.imageUrl || pdfVariants[0]?.imageUrl || undefined,
                    variants: pdfVariants,
                  };
                });

                // Compute weighted average price per unit across all variants accurately
                let sumWeightedOffer = 0;
                let sumUnits = 0;
                for (const p of catalogListing.catalog_products || []) {
                  for (const v of p.catalog_product_variants || []) {
                    const offer =
                      typeof v.offer_price === "string"
                        ? parseFloat(v.offer_price)
                        : v.offer_price || 0;
                    const units = Number(v.available_quantity) || 0;
                    if (!Number.isNaN(offer) && units > 0) {
                      sumWeightedOffer += offer * units;
                      sumUnits += units;
                    }
                  }
                }
                const avgPricePerUnit =
                  sumUnits > 0
                    ? `$${(sumWeightedOffer / sumUnits).toFixed(2)}`
                    : "";

                // Ensure fully qualified catalog image URL for React-PDF
                let finalCatalogImage = "";

                // Try multiple sources in priority order
                if (catalog.imageUrl && /^https?:\/\//.test(catalog.imageUrl)) {
                  finalCatalogImage = catalog.imageUrl;
                } else if (
                  (catalogListing as any)?.catalog_listing_images?.[0]?.images
                    ?.processed_url
                ) {
                  finalCatalogImage = (catalogListing as any)
                    .catalog_listing_images[0].images.processed_url;
                } else if (catalogListing.image_url) {
                  try {
                    const resolvedUrl = await getImageUrl(
                      catalogListing.image_url
                    );
                    finalCatalogImage = resolvedUrl || "";
                  } catch (error) {
                    finalCatalogImage = "";
                  }
                }

                await generateCatalogPdf({
                  listingId: String(catalogListing.id),
                  listingTitle: catalog.name,
                  catalogData: {
                    catalogName: catalog.name,
                    catalogImage: finalCatalogImage,
                    category: catalog.category
                      ? fileToDbCategoryBiMap.getKey(
                          catalog.category as never
                        ) || catalog.category
                      : catalog.category,
                    totalAskingPrice: catalog.totalAskingPrice,
                    leadTime: catalog.leadTime,
                    description: catalog.description,
                    unitsInListing: products.reduce(
                      (sum, p) => sum + (p.totalUnits || 0),
                      0
                    ),
                    minOrderValue: catalogListing.minimum_order_value || 0,
                    location: catalogListing.addresses
                      ? `${catalogListing.addresses.city}, ${catalogListing.addresses.province}, ${catalogListing.addresses.country}`
                      : "",
                    averagePrice: avgPricePerUnit || "$0.00",
                    msrpPercentage: catalog.msrpPercentage,
                    packaging: catalogListing.packaging
                      ? fileToDbPackagingBiMap.getKey(
                          catalogListing.packaging as never
                        ) || catalogListing.packaging
                      : "",
                    shippingWindow: catalogListing.shipping_window
                      ? `${catalogListing.shipping_window} days`
                      : "",
                    products: pdfProducts,
                  },
                });
              } catch (err) {
                // Keep UX minimal and non-intrusive; log error and alert

                console.error("PDF generation failed:", err);
                if (typeof window !== "undefined") {
                  window.alert("Failed to generate PDF. Please try again.");
                }
              } finally {
                setIsGeneratingPdf(false);
              }
            }}
            variant="outline"
          >
            {isGeneratingPdf ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating PDF...
              </span>
            ) : (
              "Generate PDF"
            )}
          </Button>
          <Button
            className="h-10 rounded-full border-gray-300 px-6 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
            onClick={() => {
              const productsTable = document.getElementById(
                "catalog-products-table"
              );
              if (productsTable) {
                productsTable.scrollIntoView({ behavior: "smooth" });
              }
            }}
            variant="outline"
          >
            <ChevronDown className="mr-2 h-4 w-4" />
            View All Products
          </Button>
        </div>
      </div>

      {/* Alert Dialog */}
      <AlertDialog onOpenChange={setAlertOpen} open={alertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {alertType === "error"
                ? "Offer Submission Error"
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

      {/* Confirm Buy All Dialog - Added to prevent accidental submissions */}
      <AlertDialog onOpenChange={setConfirmOpen} open={confirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Buy All</AlertDialogTitle>
            <AlertDialogDescription>
              This will submit an offer for all available products in &quot;
              {catalogListing.title}&quot; using your current prices and
              quantities. Do you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isSubmittingOffer}
              onClick={handleConfirmBuyAll}
            >
              {isSubmittingOffer ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting...
                </span>
              ) : (
                "Confirm"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
