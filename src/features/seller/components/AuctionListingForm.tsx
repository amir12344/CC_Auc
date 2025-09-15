"use client";

import { useRouter } from "next/navigation";
import React, { useCallback, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Save, Send } from "lucide-react";
import { z } from "zod";

import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";

import { useFormPersistence } from "../hooks/useFormPersistence";
import { CoreDetailsSection } from "./CoreDetailsSection";
import { ListingVisibilitySection } from "./ListingVisibilitySection";
import { MediaSection } from "./MediaSection";
import { ProductSpecsSection } from "./ProductSpecsSection";
import { SaleOptionsSection } from "./SaleOptionsSection";
import { ShippingSection } from "./ShippingSection";

// Form validation schema - Updated for all section components
const auctionListingSchema = z.object({
  // Core Details Section - Required fields marked with *
  lotId: z.string().optional(),
  brand: z.string().min(1, "Brand is required"),
  name: z.string().min(1, "Name is required"),
  category: z.string().min(1, "Category is required"),
  subcategory: z.string().min(1, "Subcategory is required"),
  title: z.string().min(1, "Title is required"),
  itemDescription: z.string().optional(),
  upc: z.string().min(1, "UPC is required"),
  model: z.string().optional(),
  skuCodeItemNumber: z.string().min(1, "SKU Code / Item # is required"),
  variant: z.string().optional(),
  parentItemNumber: z.string().optional(),
  mpn: z.string().optional(),
  color: z.string().optional(),
  unitExRetailPrice: z.number().min(0.01, "Unit Ex-Retail Price is required"),
  unitQuantity: z.number().min(1, "Unit Quantity is required"),
  unitWeight: z.number().min(0.01, "Unit Weight is required"),
  unitDimensionsLength: z.number().min(0.01, "Length is required"),
  unitDimensionsWidth: z.number().min(0.01, "Width is required"),
  unitDimensionsHeight: z.number().min(0.01, "Height is required"),
  condition: z.string().min(1, "Condition is required"),
  cosmeticCondition: z.string().optional(),
  accessories: z.string().optional(),
  containsHazardousMaterials: z
    .string()
    .min(1, "Contains Hazardous Materials selection is required"),

  // Media Section - Required fields marked with *
  images: z
    .any()
    .refine((files) => files?.length > 0, "At least one image is required"),
  video: z.any().optional(),

  // Product Specs Section - Required fields marked with *
  resaleRestrictions: z.string().optional(),
  expirationDate: z.string().optional(),
  warrantyInfo: z.string().optional(),
  unitPackagingType: z.string().min(1, "Unit Packaging Type is required"),
  lotCondition: z.string().min(1, "Lot Condition is required"),
  lotCosmeticCondition: z.string().optional(),
  lotAccessories: z.string().optional(),
  inspectionStatus: z.string().optional(),
  lotExRetailValue: z.number().optional(), // Derived from manifest
  lotUnits: z.number().optional(), // Derived from manifest
  lotWeight: z.number().optional(), // Derived from manifest
  finalLotCondition: z.string().min(1, "Final Lot Condition is required"),
  sellerNotes: z.string().optional(),

  // Sale Options Section - Required fields marked with *
  startingBid: z.number().min(0.01, "Starting Bid is required"),
  auctionDuration: z.string().min(1, "Auction Duration is required"),
  reservePrice: z.number().min(0.01, "Reserve Price is required"),

  // Bidding Requirements (optional checkboxes)
  requireBuyerRating: z.boolean().optional(),
  requireBusinessVerification: z.boolean().optional(),
  requireDeposit: z.boolean().optional(),
  requirePrequalification: z.boolean().optional(),

  // Shipping - Required fields marked with * (UPDATED to match reference specification)
  shippingType: z.string().min(1, "Shipping Type is required"),
  warehouseAddress1: z.string().min(1, "Address 1 is required"),
  warehouseAddress2: z.string().optional(),
  warehouseCity: z.string().min(1, "City is required"),
  warehouseState: z.string().min(1, "State is required"),
  warehouseZipcode: z.string().min(1, "Zipcode is required"),
  warehouseCountry: z.string().min(1, "Country is required"),
  shipFromLocation: z.string().min(1, "Ship From Location is required"),
  freightType: z.string().min(1, "Freight Type is required"),
  estimatedWeight: z.number().min(0.01, "Estimated Weight is required"),
  packagingFormat: z.string().min(1, "Packaging Format is required"),

  // Optional fields
  expiration: z.string().optional(),
  warranty: z.string().optional(),
  inspection: z.string().optional(),
  businessUnit: z.string().optional(),
  inventoryType: z.string().optional(),
  warehouse: z.string().optional(),

  // Optional shipping fields (UPDATED to match reference specification)
  shippingCost: z.number().optional(),
  refrigerated: z.string().optional(),
  numberOfPallets: z.number().optional(),
  numberOfTruckloads: z.number().optional(),
  shippingNotes: z.string().optional(),
  numberOfShipments: z.number().optional(),
  additionalInformation: z.string().optional(),

  // Legacy shipping fields (for backward compatibility - to be deprecated)
  shipFrom: z.string().optional(),
  pieceCount: z.number().optional(),
  packagingType: z.string().optional(),
  shippingWidth: z.number().optional(),
  shippingLength: z.number().optional(),
  shippingHeight: z.number().optional(),
  shippingHazardousMaterials: z.string().optional(),

  // Listing Visibility Section - Required fields marked with *
  visibilityPublic: z.boolean().optional(),
  visibilityPrivate: z.boolean().optional(),
  buyerTargeting: z.array(z.string()).optional(),
  geographicRestrictions: z
    .object({
      country: z.string().optional(),
      state: z.string().optional(),
      zipCode: z.string().optional(),
      deliveryRegion: z.string().optional(),
    })
    .optional(),
});

type FormData = z.infer<typeof auctionListingSchema>;

// Move error helper function outside component to prevent recreation
const getErrorMessage = (error: any): string | undefined => {
  if (!error) return undefined;
  if (typeof error === "string") return error;
  if (typeof error === "object" && error.message) return error.message;
  return undefined;
};

/**
 * Enhanced Auction Listing Creation Form
 *
 * Professional, card-based form with improved UI/UX design
 * Optimized for performance with memoized components
 */
export function AuctionListingForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitProgress, setSubmitProgress] = useState(0);
  const [lastSaved, setLastSaved] = useState<Date | undefined>(undefined);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    getValues,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(auctionListingSchema),
    defaultValues: {
      // Core Details Section defaults
      category: "",
      subcategory: "",
      condition: "",
      containsHazardousMaterials: "",
      variant: "",

      // Product Specs Section defaults
      unitPackagingType: "",
      lotCondition: "",
      finalLotCondition: "",

      // Sale Options Section defaults
      auctionDuration: "",

      // Shipping Section defaults
      shippingType: "",
      warehouseAddress1: "",
      warehouseAddress2: "",
      warehouseCity: "",
      warehouseState: "",
      warehouseZipcode: "",
      warehouseCountry: "",
      shipFromLocation: "",
      freightType: "",
      packagingFormat: "",
      refrigerated: "",

      // Listing Visibility Section defaults
      visibilityPublic: true,
      visibilityPrivate: false,
    },
  });

  // Optimized form persistence - only save on manual action, not every keystroke
  const { saveToStorage, loadFromStorage, clearStorage, getLastSaved } =
    useFormPersistence({
      key: "auction-listing-draft",
      data: {}, // Empty object, we'll manage persistence manually
      enabled: false, // Disable auto-persistence to improve performance
    });

  // Load saved data on component mount
  React.useEffect(() => {
    const savedData = loadFromStorage();
    if (savedData) {
      reset(savedData);
      const savedTimestamp = getLastSaved();
      if (savedTimestamp) {
        setLastSaved(savedTimestamp);
      }
    }
  }, [reset, loadFromStorage, getLastSaved]);

  // Auto-save every 30 seconds instead of on every keystroke
  React.useEffect(() => {
    const interval = setInterval(() => {
      const currentData = getValues();
      // Only save if there's actual data
      if (
        currentData.brand ||
        currentData.name ||
        currentData.title ||
        currentData.warehouseAddress1
      ) {
        saveToStorage(currentData);
        setLastSaved(new Date());
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [getValues, saveToStorage]);

  const onSubmit = useCallback(
    async (data: FormData) => {
      setIsSubmitting(true);
      setSubmitProgress(0);
      setSuccess(false);
      try {
        // Simulate progress steps
        setSubmitProgress(25);
        await new Promise((resolve) => setTimeout(resolve, 500));

        setSubmitProgress(50);
        await new Promise((resolve) => setTimeout(resolve, 500));

        setSubmitProgress(75);
        await new Promise((resolve) => setTimeout(resolve, 500));

        setSubmitProgress(100);
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Handle success
        setSuccess(true);
        setLastSaved(new Date());
        clearStorage(); // Clear draft after successful submission

        // TODO: Redirect to listing page or dashboard
        // router.push('/seller/listing/success');
      } catch (error) {
      } finally {
        setIsSubmitting(false);
        setSubmitProgress(0);
      }
    },
    [clearStorage]
  );

  const handleSaveDraft = useCallback(async () => {
    try {
      const currentData = getValues();
      saveToStorage(currentData);
      setLastSaved(new Date());
    } catch (error) {}
  }, [getValues, saveToStorage]);

  // Memoize section props to prevent unnecessary re-renders
  const sectionProps = useMemo(
    () => ({
      register,
      setValue,
      errors,
      getErrorMessage,
    }),
    [register, setValue, errors]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-8xl mx-auto px-6 py-8">
        {/* Go Back Button */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center gap-2 hover:bg-gray-100"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
        </div>

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Create Auction Listing
            </h1>
            <p className="mt-1 text-gray-600">
              Fill out the details below to create your auction listing. Fields
              marked with * are required.
            </p>
          </div>
          <Badge
            variant="outline"
            className="border-green-200 bg-green-50 text-sm text-green-700"
          >
            Auto-saved every 30s
          </Badge>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Core Lot Details Section */}
          <CoreDetailsSection {...sectionProps} />

          {/* Media Upload Section */}
          <MediaSection {...sectionProps} />

          {/* Product Specifications Section */}
          <ProductSpecsSection {...sectionProps} />

          {/* Shipping & Handling Section */}
          <ShippingSection {...sectionProps} />

          {/* Listing Visibility Section */}
          <ListingVisibilitySection {...sectionProps} />

          {/* Sale Options Section */}
          <SaleOptionsSection {...sectionProps} />

          {/* Form Actions */}
          <Card className="border-0 bg-white/90 shadow-lg backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Save className="h-4 w-4" />
                  <span>Auto-saved every 30 seconds</span>
                  {lastSaved && (
                    <span className="text-xs text-gray-500">
                      (Last saved: {lastSaved.toLocaleTimeString()})
                    </span>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSaveDraft}
                    disabled={isSubmitting}
                    className="flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    Save Draft Now
                  </Button>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex min-w-[140px] items-center gap-2 bg-[#43CD66] hover:bg-[#3ab859]"
                  >
                    <Send className="h-4 w-4" />
                    {isSubmitting ? "Creating..." : "Create Listing"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}
