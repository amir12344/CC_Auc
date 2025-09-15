"use client";

import Link from "next/link";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import "@aws-amplify/ui-react/styles.css";

import { zodResolver } from "@hookform/resolvers/zod";
import { fetchAuthSession } from "aws-amplify/auth";
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
import { formatBackendError } from "@/src/utils/error-utils";

import { createAuctionListings } from "../services/auctionService";
// Import shared components and utilities
import {
  ACCEPTED_FILE_TYPES,
  AuctionSaleOptions,
  FileUploadArea,
  FormActions,
  getErrorMessage,
  useDragAndDrop,
  useFileUpload,
  VisibilitySection,
} from "./shared";
import { truncateFileName } from "./shared/fileUtils";

// Form validation schema for auction Excel uploads
const auctionExcelUploadSchema = z.object({
  // Listing Visibility
  visibilityType: z.enum(["public", "private"], {
    required_error: "Please select a visibility type",
  }),
  buyerTargeting: z.array(z.string()).optional(),
  geographicRestrictions: z
    .object({
      countries: z.array(z.string()).optional(),
      states: z.array(z.string()).optional(),
    })
    .optional(),

  // Sale Option
  startingBid: z.number().min(0.01, "Starting bid must be greater than 0"),
  bidIncrementType: z.enum(["dollar", "percentage"], {
    required_error: "Please select bid increment type",
  }),
  bidIncrementAmount: z
    .number()
    .min(0.01, "Bid increment amount must be greater than 0"),
  auctionDuration: z
    .number()
    .min(1)
    .max(30, "Auction duration must be between 1-30 days"),
  auctionEndTimestamp: z
    .number()
    .refine((timestamp) => timestamp > Date.now(), {
      message: "Auction end date must be in the future",
    }),
});

type AuctionExcelUploadFormData = z.infer<typeof auctionExcelUploadSchema>;

// API payload type for auction creation
export interface AuctionCreationPayload extends AuctionExcelUploadFormData {
  // Making sellerId optional as per backend requirements
  // The backend will handle authentication and identify the seller
  sellerId?: string;
  listingsFileKey?: string;
  manifestFileKey?: string;
  // Timestamp for auction end date (set by DateTimePicker)
  auctionEndTimestamp: number;
}

/**
 * AuctionExcelUploadForm Component - Refactored with shared components
 *
 * File Storage Structure:
 * - Listings: AuctionListings/private/{sellerId}/
 * - Manifests: AuctionManifests/private/{sellerId}/
 */
export const AuctionExcelUploadForm = React.memo(
  function AuctionExcelUploadForm() {
    const { toast } = useToast();

    // State management with proper typing
    const [selectedBuyerTargeting, setSelectedBuyerTargeting] = useState<
      string[]
    >([]);
    const [listingsFile, setListingsFile] = useState<File | null>(null);
    const [manifestFile, setManifestFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [errorOpen, setErrorOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    // Custom hooks - extracting complex logic into reusable hooks
    const {
      dragState,
      handleDragOver,
      handleDragLeave,
      handleDrop,
      resetDragState,
    } = useDragAndDrop(["listings", "manifest"]);

    const {
      validateFile: validateFileHook,
      uploadFileToS3,
      getCurrentUserAndIdentity,
    } = useFileUpload();

    const {
      register,
      handleSubmit,
      setValue,
      watch,
      reset,
      formState: { errors, isSubmitting },
    } = useForm<AuctionExcelUploadFormData>({
      resolver: zodResolver(auctionExcelUploadSchema),
      defaultValues: {
        visibilityType: "public",
        bidIncrementType: "dollar",
        auctionDuration: 0,
        geographicRestrictions: {},
        auctionEndTimestamp: 0, // No default timestamp - user must select
      },
    });

    const formData = watch();

    useEffect(() => {
      const mockPayload = {
        ...formData,
        listingsFileKey: listingsFile?.name || undefined,
        manifestFileKey: manifestFile?.name || undefined,
        auctionEndTimestamp:
          formData.auctionEndTimestamp ||
          Date.now() + (formData.auctionDuration || 7) * 24 * 60 * 60 * 1000,
      };
    }, [formData, listingsFile, manifestFile]);

    const visibilityType = watch("visibilityType");

    // Memoized computed values
    const areFilesSelected = useMemo(
      () => Boolean(listingsFile && manifestFile),
      [listingsFile, manifestFile]
    );

    const isFormDisabled = useMemo(() => {
      // Check if files are selected
      if (!areFilesSelected || isSubmitting || isUploading) {
        return true;
      }

      // Check required form fields
      const startingBid = formData.startingBid;
      const bidIncrementAmount = formData.bidIncrementAmount;
      const auctionEndTimestamp = formData.auctionEndTimestamp;

      // Validate required fields
      const hasValidStartingBid = startingBid && startingBid > 0;
      const hasValidBidIncrement = bidIncrementAmount && bidIncrementAmount > 0;
      const hasValidEndTimestamp =
        auctionEndTimestamp && auctionEndTimestamp > Date.now();

      return (
        !hasValidStartingBid || !hasValidBidIncrement || !hasValidEndTimestamp
      );
    }, [
      isSubmitting,
      isUploading,
      areFilesSelected,
      formData.startingBid,
      formData.bidIncrementAmount,
      formData.auctionEndTimestamp,
    ]);

    // Simplified event handlers using shared logic
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
      (file: File, type: "listings" | "manifest") => {
        const validationError = validateFileHook(file);

        if (validationError) {
          toast({
            title: "Invalid File",
            description: validationError,
            variant: "destructive",
          });
          return;
        }

        if (type === "listings") {
          setListingsFile(file);
        } else {
          setManifestFile(file);
        }

        toast({
          title: "File Selected",
          description: `${truncateFileName(
            file.name,
            50
          )} selected successfully.`,
        });
      },
      [toast, validateFileHook]
    );

    const removeFile = useCallback((type: "listings" | "manifest") => {
      if (type === "listings") {
        setListingsFile(null);
      } else {
        setManifestFile(null);
      }
    }, []);

    // Reset form function for new listing
    const resetFormForNewListing = useCallback(() => {
      reset({
        visibilityType: "public",
        bidIncrementType: "dollar",
        auctionDuration: 0,
        geographicRestrictions: {},
        auctionEndTimestamp: 0, // No default timestamp - user must select
      });

      setSelectedBuyerTargeting([]);
      setListingsFile(null);
      setManifestFile(null);
      resetDragState();
    }, [reset, resetDragState]);

    const submitAuctionForm = useCallback(
      async (
        payload: AuctionCreationPayload
      ): Promise<{ success: boolean; error?: string }> => {
        try {
          const session = await fetchAuthSession();
          const idToken = session.tokens?.idToken?.toString();

          if (!idToken) {
            return {
              success: false,
              error: "Authentication required. Please sign in again.",
            };
          }

          const result = await createAuctionListings(payload);

          // Handle the service response format: { data: boolean | null, errors: string | null }
          if (result.errors) {
            return {
              success: false,
              error: result.errors,
            };
          }

          if (result.data === null) {
            return {
              success: false,
              error: "Failed to create auction listings. Please try again.",
            };
          }

          return { success: true };
        } catch (error) {
          if (
            error instanceof Error &&
            error.message.includes("Authentication")
          ) {
            return {
              success: false,
              error: "Authentication expired. Please sign in again.",
            };
          }
          return {
            success: false,
            error:
              error instanceof Error
                ? error.message
                : "Failed to create auction listings",
          };
        }
      },
      []
    );

    // Helper function to handle file uploads
    const handleFileUploads = useCallback(async () => {
      const [listingsFileKey, manifestFileKey] = await Promise.all([
        listingsFile
          ? uploadFileToS3(
              listingsFile,
              "AuctionListings/private/",
              "auction-listing",
              "listings"
            )
          : Promise.resolve(""),
        manifestFile
          ? uploadFileToS3(
              manifestFile,
              "AuctionManifests/private/",
              "auction-manifest",
              "manifest"
            )
          : Promise.resolve(""),
      ]);
      return { listingsFileKey, manifestFileKey };
    }, [listingsFile, manifestFile, uploadFileToS3]);

    // Helper function to handle form submission
    const handleFormSubmission = useCallback(
      async (
        data: AuctionExcelUploadFormData,
        listingsFileKey: string,
        manifestFileKey: string
      ): Promise<{ success: boolean; error?: string }> => {
        // Ensure we have a valid auction end timestamp from the form data
        if (!data.auctionEndTimestamp) {
          // If not set by DateTimePicker, calculate based on auction duration
          const now = new Date();
          const endDate = new Date(now);
          endDate.setDate(now.getDate() + (data.auctionDuration || 7)); // Default to 7 days if not set
          data.auctionEndTimestamp = endDate.getTime();
        }

        // Creating payload without sellerId as per backend requirements
        const apiPayload: Omit<AuctionCreationPayload, "sellerId"> = {
          ...data,
          listingsFileKey: listingsFileKey || undefined,
          manifestFileKey: manifestFileKey || undefined,
          auctionEndTimestamp: data.auctionEndTimestamp,
        };

        return await submitAuctionForm(apiPayload);
      },
      [submitAuctionForm]
    );

    // Helper function to handle errors
    const handleSubmissionError = useCallback(
      (error: unknown) => {
        let errorMsg = "Failed to create auction listings. Please try again.";

        if (error instanceof Error) {
          if (error.message.includes("Authentication")) {
            errorMsg = "Your session has expired. Please sign in again.";
          } else if (error.message.includes("Network")) {
            errorMsg =
              "Network error. Please check your connection and try again.";
          } else if (error.message.includes("Storage")) {
            errorMsg = "File upload failed. Please try again.";
          } else {
            errorMsg = formatBackendError(error.message);
          }
        }

        // Show error in AlertDialog for better visibility
        setErrorMessage(errorMsg);
        setErrorOpen(true);

        // Also show toast for additional feedback
        toast({
          title: "Error",
          description: "Please check the error details below.",
          variant: "destructive",
        });
      },
      [toast]
    );

    const onSubmit = useCallback(
      async (data: AuctionExcelUploadFormData) => {
        if (!areFilesSelected || isUploading || isSubmitting) {
          return;
        }

        try {
          setIsUploading(true);
          // No longer need to get userId since we don't send sellerId
          await getCurrentUserAndIdentity(); // Still call this to verify the user is authenticated

          toast({
            title: "Uploading files...",
            description: "Please wait while we upload your files.",
          });

          const { listingsFileKey, manifestFileKey } =
            await handleFileUploads();
          // We don't pass userId to handleFormSubmission anymore as sellerId isn't needed
          const result = await handleFormSubmission(
            data,
            listingsFileKey,
            manifestFileKey
          );

          if (result.success) {
            toast({
              title: "Success! 🎉",
              description:
                "Auction listings created successfully. You can now add another auction listing.",
            });
            resetFormForNewListing();
          } else {
            // Show error in AlertDialog for better visibility
            setErrorMessage(
              result.error
                ? formatBackendError(result.error)
                : "Failed to create auction listings. Please try again."
            );
            setErrorOpen(true);

            // Also show toast for additional feedback
            toast({
              title: "Error",
              description: "Please check the error details below.",
              variant: "destructive",
            });
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
        resetFormForNewListing,
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
              Create Auction Listing - Excel Upload
            </h1>
            <p className="text-gray-600">
              Configure auction settings and upload Excel files to create
              multiple auction listings
            </p>
          </div>

          <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
            {/* Visibility Section - Shared Component (Reduced 100+ lines to 1 component) */}
            <VisibilitySection
              description="Control who can see and bid on your auction listings"
              errors={errors}
              getErrorMessage={getErrorMessage}
              onBuyerTargetingChange={handleBuyerTargetingChange}
              selectedBuyerTargeting={selectedBuyerTargeting}
              setValue={setValue}
              title="Listing Visibility for Auctions"
              visibilityType={visibilityType}
              watch={watch}
            />

            {/* Auction Sale Options - Auction-specific Component (Reduced 120+ lines to 1 component) */}
            <AuctionSaleOptions
              errors={errors}
              getErrorMessage={getErrorMessage}
              register={register}
              setValue={setValue}
              watch={watch}
            />

            {/* File Upload Sections - Shared Components (Reduced 400+ lines to 2 components) */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              <FileUploadArea
                acceptedTypes={ACCEPTED_FILE_TYPES}
                description="Excel file with product details for auction listings"
                file={listingsFile}
                fileInputId="listingsFile"
                iconColor="blue"
                isDragOver={dragState.listings}
                onDragLeave={(e) => handleDragLeave(e, "listings")}
                onDragOver={(e) => handleDragOver(e, "listings")}
                onDrop={(e) =>
                  handleDrop(e, "listings", (file) =>
                    handleFileSelect(file, "listings")
                  )
                }
                onFileRemove={() => removeFile("listings")}
                onFileSelect={(file) => handleFileSelect(file, "listings")}
                title="Upload Listing Details Excel"
              />

              <FileUploadArea
                acceptedTypes={ACCEPTED_FILE_TYPES}
                description="Excel file with manifest data for auction listings"
                file={manifestFile}
                fileInputId="manifestFile"
                iconColor="orange"
                isDragOver={dragState.manifest}
                onDragLeave={(e) => handleDragLeave(e, "manifest")}
                onDragOver={(e) => handleDragOver(e, "manifest")}
                onDrop={(e) =>
                  handleDrop(e, "manifest", (file) =>
                    handleFileSelect(file, "manifest")
                  )
                }
                onFileRemove={() => removeFile("manifest")}
                onFileSelect={(file) => handleFileSelect(file, "manifest")}
                title="Upload Manifest Excel"
              />
            </div>

            {/* Form Actions - Shared Component (Reduced 80+ lines to 1 component) */}
            <FormActions
              areFilesSelected={areFilesSelected}
              isFormDisabled={isFormDisabled}
              isSubmitting={isSubmitting}
              isUploading={isUploading}
              loadingText="Creating Auction Listings..."
              missingFilesMessage="Please select both listing details and manifest Excel files to continue"
              onClearForm={resetFormForNewListing}
              submitButtonText="Create Auction Listings"
            />
          </form>
        </div>

        {/* Error Alert Dialog */}
        <AlertDialog onOpenChange={setErrorOpen} open={errorOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Auction Creation Error</AlertDialogTitle>
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
      </div>
    );
  }
);
