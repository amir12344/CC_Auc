"use client";

import Link from "next/link";
import React, { useCallback, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
import { z } from "zod";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/src/components/ui/alert-dialog";
import { Button } from "@/src/components/ui/button";
import { useToast } from "@/src/hooks/use-toast";
// Import shared error utilities
import { formatBackendError } from "@/src/utils/error-utils";

// Import catalog service
import {
  createCatalogListings,
  type CatalogCreationPayload,
} from "../services/catalogService";
// Import shared components and utilities
import {
  ACCEPTED_FILE_TYPES,
  FileUploadArea,
  FormActions,
  getErrorMessage,
  useDragAndDrop,
  useFileUpload,
} from "./shared";
import { truncateFileName } from "./shared/fileUtils";
// Import the updated shared components
import { VisibilitySection } from "./shared/VisibilitySection";

// Type definitions for the new backend API
export interface Locations {
  countries?: string[];
  states?: string[];
  cities?: string[];
  zip_codes?: string[];
}

export interface VisibilityRules {
  buyer_segments?: string[];
  locations?: Locations;
}

// Form validation schema for catalog Excel upload
const catalogExcelUploadSchema = z.object({
  visibilityType: z.enum(["public", "private"], {
    required_error: "Please select a visibility type",
  }),
  buyerTargeting: z.array(z.string()).optional(),
  geographicRestrictions: z
    .object({
      countries: z.array(z.string()).optional(),
      states: z.array(z.string()).optional(),
      cities: z.array(z.string()).optional(),
      zip_codes: z.array(z.string()).optional(),
    })
    .optional(),
});

export type CatalogExcelUploadFormData = z.infer<
  typeof catalogExcelUploadSchema
>;

/**
 * Helper function to transform buyer targeting
 */
const transformBuyerSegments = (
  buyerTargeting?: string[]
): string[] | undefined => {
  if (!buyerTargeting || buyerTargeting.length === 0) {
    return;
  }
  return buyerTargeting;
};

/**
 * Helper function to transform geographic restrictions
 */
const transformLocations = (geographicRestrictions?: {
  countries?: string[];
  states?: string[];
  cities?: string[];
  zip_codes?: string[];
}): Locations | undefined => {
  if (!geographicRestrictions) {
    return;
  }

  const locations: Locations = {};
  const { countries, states, cities, zip_codes } = geographicRestrictions;

  if (countries && countries.length > 0) {
    locations.countries = countries;
  }
  if (states && states.length > 0) {
    locations.states = states;
  }
  if (cities && cities.length > 0) {
    locations.cities = cities;
  }
  if (zip_codes && zip_codes.length > 0) {
    locations.zip_codes = zip_codes;
  }

  return Object.keys(locations).length > 0 ? locations : undefined;
};

/**
 * Transform form data into VisibilityRules format
 * Uses the actual user selections from the form
 */
const transformToVisibilityRules = (
  formData: CatalogExcelUploadFormData
): VisibilityRules => {
  const visibilityRules: VisibilityRules = {};

  // Transform buyer targeting
  const buyerSegments = transformBuyerSegments(formData.buyerTargeting);
  if (buyerSegments) {
    visibilityRules.buyer_segments = buyerSegments;
  }

  // Transform geographic restrictions
  const locations = transformLocations(formData.geographicRestrictions);
  if (locations) {
    visibilityRules.locations = locations;
  }

  return visibilityRules;
};

/**
 * CatalogExcelUploadForm Component - Updated for new backend API
 * File Storage Structure:
 * - Listings: CatalogListings/private/{sellerId}/
 * - SKUs: CatalogSKUs/private/{sellerId}/
 */
export const CatalogExcelUploadForm = React.memo(() => {
  const { toast } = useToast();

  // State management with proper typing
  const [selectedBuyerTargeting, setSelectedBuyerTargeting] = useState<
    string[]
  >([]);
  const [listingFile, setListingFile] = useState<File | null>(null);
  const [skuFile, setSkuFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertType, setAlertType] = useState<"error" | "success">("error");
  const [alertMessage, setAlertMessage] = useState("");

  // Custom hooks
  const {
    dragState,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    resetDragState,
  } = useDragAndDrop(["listing", "sku"]);

  const {
    validateFile: validateFileHook,
    uploadFileToS3,
    getCurrentUserAndIdentity,
  } = useFileUpload();

  const {
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CatalogExcelUploadFormData>({
    resolver: zodResolver(catalogExcelUploadSchema),
    defaultValues: {
      visibilityType: "public",
      geographicRestrictions: {
        countries: [],
        states: [],
        cities: [],
        zip_codes: [],
      },
    },
  });

  const visibilityType = watch("visibilityType");

  // Memoized computed values
  const areFilesSelected = useMemo(
    () => Boolean(listingFile && skuFile),
    [listingFile, skuFile]
  );

  const isFormDisabled = useMemo(
    () => isSubmitting || isUploading || !areFilesSelected,
    [isSubmitting, isUploading, areFilesSelected]
  );

  // File handling callbacks
  const handleBuyerTargetingChange = useCallback(
    (option: string, checked: boolean) => {
      setSelectedBuyerTargeting((prev) => {
        const updated = checked
          ? [...prev, option]
          : prev.filter((item) => item !== option);

        setValue("buyerTargeting", updated);
        return updated;
      });
    },
    [setValue]
  );

  const handleFileSelect = useCallback(
    (file: File, type: "listing" | "sku") => {
      const validationError = validateFileHook(file);

      if (validationError) {
        toast({
          title: "Invalid File",
          description: validationError,
          variant: "destructive",
        });
        return;
      }

      if (type === "listing") {
        setListingFile(file);
      } else {
        setSkuFile(file);
      }

      toast({
        title: "File Selected",
        description: `${truncateFileName(file.name, 50)} selected successfully.`,
      });
    },
    [toast, validateFileHook]
  );

  const removeFile = useCallback((type: "listing" | "sku") => {
    if (type === "listing") {
      setListingFile(null);
    } else {
      setSkuFile(null);
    }
  }, []);

  // Reset form function for new listing
  const resetFormForNewListing = useCallback(() => {
    reset({
      visibilityType: "public",
      geographicRestrictions: {
        countries: [],
        states: [],
        cities: [],
        zip_codes: [],
      },
    });

    setSelectedBuyerTargeting([]);
    setListingFile(null);
    setSkuFile(null);
    resetDragState();
  }, [reset, resetDragState]);

  // Alert dialog close handler
  const handleAlertClose = useCallback(() => {
    setAlertOpen(false);
    if (alertType === "success") {
      resetFormForNewListing();
    }
  }, [alertType, resetFormForNewListing]);

  // Helper function to handle file uploads
  const handleFileUploads = useCallback(async () => {
    const [listingFileKey, skuFileKey] = await Promise.all([
      listingFile
        ? uploadFileToS3(
            listingFile,
            "CatalogListings/private/",
            "catalog-listing",
            "listing"
          )
        : Promise.resolve(""),
      skuFile
        ? uploadFileToS3(skuFile, "CatalogSKUs/private/", "catalog-sku", "sku")
        : Promise.resolve(""),
    ]);
    return { listingFileKey, skuFileKey };
  }, [listingFile, skuFile, uploadFileToS3]);

  // Helper function to handle form submission
  const handleFormSubmission = useCallback(
    async (
      data: CatalogExcelUploadFormData,
      userId: string,
      listingFileKey: string,
      skuFileKey: string
    ): Promise<{ success: boolean; error?: string }> => {
      const visibilityRules = transformToVisibilityRules(data);

      const apiPayload: CatalogCreationPayload = {
        catalogListingFileKey: listingFileKey,
        catalogProductsFileKey: skuFileKey,
        cognitoId: userId,
        sellerId: userId,
        isPrivate: data.visibilityType === "private",
        visibilityRules: JSON.stringify(visibilityRules),
      };

      return await createCatalogListings(apiPayload);
    },
    []
  );

  // Helper function to handle errors
  const handleSubmissionError = useCallback(
    (error: unknown) => {
      let errorMessage = "Failed to create catalog listings. Please try again.";

      if (error instanceof Error) {
        if (error.message.includes("Authentication")) {
          errorMessage = "Your session has expired. Please sign in again.";
        } else if (error.message.includes("Network")) {
          errorMessage =
            "Network error. Please check your connection and try again.";
        } else if (error.message.includes("Storage")) {
          errorMessage = "File upload failed. Please try again.";
        } else {
          errorMessage = error.message;
        }
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
    [toast]
  );

  const onSubmit = useCallback(
    async (data: CatalogExcelUploadFormData) => {
      if (!areFilesSelected) {
        toast({
          title: "Missing Files",
          description: "Please select both listing and SKU files.",
          variant: "destructive",
        });
        return;
      }

      if (isUploading || isSubmitting) {
        return;
      }

      try {
        setIsUploading(true);
        const { userId } = await getCurrentUserAndIdentity();

        toast({
          title: "Uploading files...",
          description: "Please wait while we upload your files.",
        });

        const { listingFileKey, skuFileKey } = await handleFileUploads();
        const result = await handleFormSubmission(
          data,
          userId,
          listingFileKey,
          skuFileKey
        );

        if (result.success) {
          setAlertType("success");
          setAlertMessage(
            "Catalog listings created successfully! You can now add another listing."
          );
          setAlertOpen(true);
        } else {
          setAlertType("error");
          // Use shared error utilities for consistent error formatting
          const errorMsg = formatBackendError(result.error as string);
          setAlertMessage(errorMsg);
          setAlertOpen(true);
        }
      } catch (error) {
        handleSubmissionError(error);
      } finally {
        setIsUploading(false);
      }
    },
    [
      areFilesSelected,
      isUploading,
      isSubmitting,
      getCurrentUserAndIdentity,
      handleFileUploads,
      handleFormSubmission,
      toast,
      handleSubmissionError,
    ]
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-8xl container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/seller/dashboard">
            <Button
              className="mb-4 text-gray-600 hover:text-gray-900"
              variant="ghost"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </Link>
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            Create Catalog Listing - Excel Upload
          </h1>
          <p className="text-gray-600">
            Configure visibility settings and upload Excel files to create
            multiple catalog listings
          </p>
        </div>

        <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
          {/* Visibility Section */}
          <VisibilitySection
            description="Control who can see your catalog listings"
            errors={errors}
            getErrorMessage={getErrorMessage}
            onBuyerTargetingChange={handleBuyerTargetingChange}
            selectedBuyerTargeting={selectedBuyerTargeting}
            setValue={setValue}
            title="Listing Visibility"
            visibilityType={visibilityType}
            watch={watch}
          />

          {/* File Upload Sections */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <FileUploadArea
              acceptedTypes={ACCEPTED_FILE_TYPES}
              description="Excel file with product listing data for catalog"
              file={listingFile}
              fileInputId="listingFile"
              iconColor="blue"
              isDragOver={dragState.listing}
              onDragLeave={(e) => handleDragLeave(e, "listing")}
              onDragOver={(e) => handleDragOver(e, "listing")}
              onDrop={(e) =>
                handleDrop(e, "listing", (file) =>
                  handleFileSelect(file, "listing")
                )
              }
              onFileRemove={() => removeFile("listing")}
              onFileSelect={(file) => handleFileSelect(file, "listing")}
              title="Upload Listing Excel"
            />

            <FileUploadArea
              acceptedTypes={ACCEPTED_FILE_TYPES}
              description="Excel file with SKU details for catalog listings"
              file={skuFile}
              fileInputId="skuFile"
              iconColor="purple"
              isDragOver={dragState.sku}
              onDragLeave={(e) => handleDragLeave(e, "sku")}
              onDragOver={(e) => handleDragOver(e, "sku")}
              onDrop={(e) =>
                handleDrop(e, "sku", (file) => handleFileSelect(file, "sku"))
              }
              onFileRemove={() => removeFile("sku")}
              onFileSelect={(file) => handleFileSelect(file, "sku")}
              title="Upload Products Excel"
            />
          </div>

          {/* Form Actions */}
          <FormActions
            areFilesSelected={areFilesSelected}
            isFormDisabled={isFormDisabled}
            isSubmitting={isSubmitting}
            isUploading={isUploading}
            loadingText="Creating Catalog Listings..."
            missingFilesMessage="Please select both listing and SKU Excel files to continue"
            onClearForm={resetFormForNewListing}
            submitButtonText="Create Catalog Listings"
          />
        </form>

        {/* Alert Dialog for Success/Error Messages */}
        <AlertDialog onOpenChange={setAlertOpen} open={alertOpen}>
          <AlertDialogContent className="max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle>
                {alertType === "error" ? "Error" : "Success! 🎉"}
              </AlertDialogTitle>
              <AlertDialogDescription className="max-h-32 overflow-y-auto text-sm leading-relaxed">
                {alertMessage}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={handleAlertClose}>
                OK
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
});

CatalogExcelUploadForm.displayName = "CatalogExcelUploadForm";
