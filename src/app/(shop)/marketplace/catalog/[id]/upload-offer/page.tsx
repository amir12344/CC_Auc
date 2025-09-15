"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import { FileUploader } from "@aws-amplify/ui-react-storage";

import "@aws-amplify/ui-react/styles.css";

import { Hub } from "aws-amplify/utils";
import { AlertCircle, CheckCircle, Loader2, Upload } from "lucide-react";

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
import { Card, CardContent } from "@/src/components/ui/card";
import {
  createCatalogOfferFromFile,
  fetchCatalogDetailsForUpload,
} from "@/src/features/marketplace-catalog/services/catalogOfferService";
import { useToast } from "@/src/hooks/use-toast";
import type { RootState } from "@/src/lib/store";

interface UploadOfferPageProps {
  params: Promise<{ id: string }>;
}

interface CatalogDetails {
  title: string;
  description: string;
  category: string;
  imageUrl: string | null;
}

export default function UploadOfferPage({ params }: UploadOfferPageProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useSelector(
    (state: RootState) => state.auth
  );

  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isProcessingOffer, setIsProcessingOffer] = useState(false);
  const [catalogDetails, setCatalogDetails] = useState<CatalogDetails | null>(
    null
  );
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(true);
  const [catalogId, setCatalogId] = useState<string>("");

  // Alert dialog states
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);

  // Extract catalog ID from params and fetch catalog details
  useEffect(() => {
    const loadParamsAndCatalogDetails = async () => {
      try {
        const { id } = await params;
        setCatalogId(id);

        // Fetch catalog details
        const details = await fetchCatalogDetailsForUpload(id);
        if (details) {
          setCatalogDetails(details);
        }
      } catch {
        // Error handled silently - catalog details will remain null
      } finally {
        setIsLoadingCatalog(false);
      }
    };
    loadParamsAndCatalogDetails();
  }, [params]);

  // Listen to Hub events for authentication changes
  useEffect(() => {
    const hubListener = Hub.listen("auth", ({ payload }) => {
      if (payload.event === "signedOut") {
        router.push("/auth/login");
      }
    });

    return () => hubListener();
  }, [router]);

  // Show error state if user doesn't have identityId
  useEffect(() => {
    if (!isLoading && isAuthenticated && !user?.identityId) {
      toast({
        variant: "destructive",
        title: "Authentication Issue",
        description:
          "Your user session is not fully initialized. Please refresh the page or try logging in again.",
      });
    }
  }, [isLoading, isAuthenticated, user, toast]);

  const handleUploadSuccess = async ({ key }: { key?: string | undefined }) => {
    if (!key) {
      toast({
        variant: "destructive",
        title: "Upload Error",
        description:
          "File uploaded, but there was an issue processing the file. Please try again.",
      });
      return;
    }

    setUploadError(null);
    setIsProcessingOffer(true);

    try {
      // Call the API to create catalog offer from uploaded file
      const result = await createCatalogOfferFromFile({
        offerListingPublicId: catalogId,
        offerFileS3Key: key,
      });

      if (result.success) {
        setIsProcessingOffer(false);
        setShowSuccessDialog(true);

        toast({
          title: "Offer Created Successfully! 🎉",
          description: "Your offer has been processed and submitted.",
        });
      } else {
        setIsProcessingOffer(false);
        const errorMessage =
          result.error ||
          "Failed to process your offer file. Please try again.";
        setUploadError(errorMessage);
        setShowErrorDialog(true);
      }
    } catch {
      setIsProcessingOffer(false);
      const errorMessage =
        "An unexpected error occurred while processing your offer.";
      setUploadError(errorMessage);
      setShowErrorDialog(true);
    }
  };

  const handleUploadError = (error: string) => {
    const errorMessage = error || "Failed to upload offer. Please try again.";
    setUploadError(errorMessage);

    toast({
      variant: "destructive",
      title: "Upload Failed",
      description: errorMessage,
    });
  };

  // Show loading state while checking authentication
  if (isLoading || isLoadingCatalog) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="space-y-4 text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-gray-400" />
          <p className="text-gray-600">
            {isLoading
              ? "Verifying authentication..."
              : "Loading catalog details..."}
          </p>
        </div>
      </div>
    );
  }

  // Show error state if not authenticated
  if (!(isAuthenticated && user?.identityId)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="space-y-4 p-8 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
            <h3 className="text-xl font-semibold text-gray-900">
              Authentication Required
            </h3>
            <p className="text-gray-600">Please sign in to upload offers</p>
            <Button
              className="w-full bg-black text-white hover:bg-gray-800"
              onClick={() => router.push("/auth/login")}
            >
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-8">
          {/* Page Title */}
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold text-gray-900">
              Upload Offer
            </h1>
            <p className="text-gray-600">
              Submit your offer for the catalog listing below
            </p>
          </div>

          {catalogDetails ? (
            <>
              {/* Catalog Details Section - Horizontal Layout */}
              <div className="mb-8 overflow-hidden rounded-lg bg-gray-50 p-6">
                <div className="flex flex-col gap-6 md:flex-row md:items-start">
                  {/* Product Image */}
                  <div className="flex-shrink-0">
                    {catalogDetails.imageUrl ? (
                      <div className="aspect-square w-full max-w-[200px] overflow-hidden rounded-lg bg-white shadow-sm">
                        <Image
                          alt={catalogDetails.title}
                          className="h-full w-full object-cover"
                          height={200}
                          src={catalogDetails.imageUrl}
                          width={200}
                        />
                      </div>
                    ) : (
                      <div className="flex aspect-square w-full max-w-[200px] items-center justify-center rounded-lg bg-gray-200">
                        <span className="text-sm text-gray-400">No Image</span>
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 space-y-4">
                    {/* Category */}
                    <div>
                      <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-medium tracking-wide text-blue-800 uppercase">
                        {catalogDetails.category}
                      </span>
                    </div>

                    {/* Title */}
                    <h2 className="text-2xl font-bold text-gray-900">
                      {catalogDetails.title}
                    </h2>

                    {/* Catalog ID */}
                    <p className="text-gray-600">
                      <span className="font-medium">Catalog ID:</span> #
                      {catalogId}
                    </p>

                    {/* Description */}
                    <div>
                      <p className="leading-relaxed text-gray-700">
                        {catalogDetails.description}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3 pt-2">
                      <Button
                        className="rounded-full border-gray-300 text-gray-700 hover:bg-gray-50"
                        onClick={() =>
                          router.push(`/marketplace/catalog/${catalogId}`)
                        }
                        variant="outline"
                      >
                        View All Products
                      </Button>
                      <Button
                        className="rounded-full bg-black text-white hover:bg-gray-800"
                        onClick={() => router.push("/marketplace/")}
                      >
                        Back to Home
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Upload Section */}
              <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
                <div className="mb-6">
                  <h3 className="mb-2 text-xl font-semibold text-gray-900">
                    Submit Your Offer
                  </h3>
                  <p className="text-gray-600">
                    Upload an Excel file (.xlsx or .xls) containing your offer
                    details for this catalog.
                  </p>
                </div>

                {/* Upload Area */}
                <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 transition-all duration-200 hover:border-gray-400">
                  <div className="space-y-4 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm">
                      <Upload className="h-8 w-8 text-gray-500" />
                    </div>

                    <FileUploader
                      acceptedFileTypes={[
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                        "application/vnd.ms-excel",
                      ]}
                      isResumable
                      maxFileCount={1}
                      onUploadError={handleUploadError}
                      onUploadSuccess={handleUploadSuccess}
                      path={({ identityId }) => {
                        if (!identityId) {
                          return "ERROR_MISSING_IDENTITY_ID/";
                        }
                        return `CatalogOffers/private/${identityId}/${catalogId}/`;
                      }}
                    />

                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-700">
                        Drag and drop your file here, or click to browse
                      </p>
                      <p className="text-xs text-gray-500">
                        Accepted formats: .xlsx, .xls • Maximum size: 10MB
                      </p>
                    </div>
                  </div>
                </div>

                {/* Processing State */}
                {isProcessingOffer && (
                  <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                        <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-blue-900">
                          Processing Your Offer
                        </h4>
                        <p className="text-sm text-blue-700">
                          Please wait while we validate and process your file.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Loading State */
            <div className="space-y-8">
              {/* Loading Catalog Details */}
              <div className="overflow-hidden rounded-lg bg-gray-50 p-6">
                <div className="flex flex-col gap-6 md:flex-row md:items-start">
                  <div className="flex-shrink-0">
                    <div className="aspect-square w-full max-w-[200px] animate-pulse rounded-lg bg-gray-200" />
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="h-6 w-24 animate-pulse rounded bg-gray-200" />
                    <div className="h-8 w-3/4 animate-pulse rounded bg-gray-200" />
                    <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
                    <div className="space-y-2">
                      <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
                      <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200" />
                    </div>
                    <div className="flex gap-3 pt-2">
                      <div className="h-10 w-32 animate-pulse rounded bg-gray-200" />
                      <div className="h-10 w-24 animate-pulse rounded bg-gray-200" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Loading Upload Section */}
              <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
                <div className="space-y-4">
                  <div className="h-6 w-48 animate-pulse rounded bg-gray-200" />
                  <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
                  <div className="h-32 w-full animate-pulse rounded-lg bg-gray-100" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Success Dialog */}
      <AlertDialog onOpenChange={setShowSuccessDialog} open={showSuccessDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <AlertDialogTitle className="text-green-900">
              Offer Submitted Successfully!
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              Your offer has been processed and submitted for catalog #
              {catalogId}. You will be redirected back to the catalog page.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center">
            <AlertDialogAction
              className="bg-black text-white hover:bg-gray-800"
              onClick={() => {
                setShowSuccessDialog(false);
                router.push(`/marketplace/catalog/${catalogId}`);
              }}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Error Dialog */}
      <AlertDialog onOpenChange={setShowErrorDialog} open={showErrorDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <AlertDialogTitle className="text-red-900">
              Upload Failed
            </AlertDialogTitle>
            <AlertDialogDescription className="whitespace-pre-line text-gray-600">
              {uploadError ||
                "An error occurred while processing your offer. Please try again."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center">
            <AlertDialogAction
              className="bg-black text-white hover:bg-gray-800"
              onClick={() => {
                setShowErrorDialog(false);
                setUploadError(null);
              }}
            >
              Try Again
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
