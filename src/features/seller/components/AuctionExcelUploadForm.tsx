'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { fetchAuthSession } from 'aws-amplify/auth';
import React, { useCallback, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/src/components/ui/button';
import { useToast } from '@/src/hooks/use-toast';
import { AuctionService } from '../services/auctionService';
import '@aws-amplify/ui-react/styles.css';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

// Import shared components and utilities
import {
  ACCEPTED_FILE_TYPES,
  AuctionSaleOptions,
  FileUploadArea,
  FormActions,
  GeographicRestrictions,
  getErrorMessage,
  useDragAndDrop,
  useFileUpload,
  VisibilitySection,
} from './shared';

// Form validation schema for auction Excel uploads
const auctionExcelUploadSchema = z.object({
  // Listing Visibility
  visibilityType: z.enum(['public', 'private'], {
    required_error: 'Please select a visibility type',
  }),
  buyerTargeting: z.array(z.string()).optional(),
  geographicRestrictions: z
    .object({
      country: z.string().optional(),
      state: z.string().optional(),
      zip: z.string().optional(),
      deliveryRegion: z.string().optional(),
    })
    .optional(),

  // Sale Option
  startingBid: z.number().min(0.01, 'Starting bid must be greater than 0'),
  bidIncrementType: z.enum(['dollar', 'percentage'], {
    required_error: 'Please select bid increment type',
  }),
  bidIncrementAmount: z
    .number()
    .min(0.01, 'Bid increment amount must be greater than 0'),
  auctionDuration: z
    .number()
    .min(1)
    .max(30, 'Auction duration must be between 1-30 days'),
});

type AuctionExcelUploadFormData = z.infer<typeof auctionExcelUploadSchema>;

// API payload type for auction creation
export interface AuctionCreationPayload extends AuctionExcelUploadFormData {
  sellerId: string;
  listingsFileKey?: string;
  manifestFileKey?: string;
}

/**
 * AuctionExcelUploadForm Component - Refactored with shared components
 *
 * File Storage Structure:
 * - Listings: AuctionListings/private/{sellerId}/
 * - Manifests: AuctionManifests/private/{sellerId}/
 */
export const AuctionExcelUploadForm = React.memo(() => {
  const { toast } = useToast();

  // State management with proper typing
  const [selectedBuyerTargeting, setSelectedBuyerTargeting] = useState<
    string[]
  >([]);
  const [listingsFile, setListingsFile] = useState<File | null>(null);
  const [manifestFile, setManifestFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Custom hooks - extracting complex logic into reusable hooks
  const {
    dragState,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    resetDragState,
  } = useDragAndDrop(['listings', 'manifest']);

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
      visibilityType: 'public',
      bidIncrementType: 'dollar',
      auctionDuration: 7,
      geographicRestrictions: {},
    },
  });

  const visibilityType = watch('visibilityType');

  // Memoized computed values
  const areFilesSelected = useMemo(
    () => Boolean(listingsFile && manifestFile),
    [listingsFile, manifestFile]
  );

  const isFormDisabled = useMemo(
    () => isSubmitting || isUploading || !areFilesSelected,
    [isSubmitting, isUploading, areFilesSelected]
  );

  // Simplified event handlers using shared logic
  const handleBuyerTargetingChange = useCallback(
    (option: string, checked: boolean) => {
      setSelectedBuyerTargeting((prev) => {
        const updated = checked
          ? [...prev, option]
          : prev.filter((item) => item !== option);

        setValue('buyerTargeting', updated);
        return updated;
      });
    },
    [setValue]
  );

  const handleFileSelect = useCallback(
    (file: File, type: 'listings' | 'manifest') => {
      const validationError = validateFileHook(file);

      if (validationError) {
        toast({
          title: 'Invalid File',
          description: validationError,
          variant: 'destructive',
        });
        return;
      }

      if (type === 'listings') {
        setListingsFile(file);
      } else {
        setManifestFile(file);
      }

      toast({
        title: 'File Selected',
        description: `${file.name} selected successfully.`,
      });
    },
    [toast, validateFileHook]
  );

  const removeFile = useCallback((type: 'listings' | 'manifest') => {
    if (type === 'listings') {
      setListingsFile(null);
    } else {
      setManifestFile(null);
    }
  }, []);

  // Reset form function for new listing
  const resetFormForNewListing = useCallback(() => {
    reset({
      visibilityType: 'public',
      bidIncrementType: 'dollar',
      auctionDuration: 7,
      geographicRestrictions: {},
    });

    setSelectedBuyerTargeting([]);
    setListingsFile(null);
    setManifestFile(null);
    resetDragState();
  }, [reset, resetDragState]);

  const submitAuctionForm = useCallback(
    async (payload: AuctionCreationPayload) => {
      try {
        const session = await fetchAuthSession();
        const idToken = session.tokens?.idToken?.toString();

        if (!idToken) {
          throw new Error('Authentication required. Please sign in again.');
        }

        const result = await AuctionService.createAuctionListings(payload);
        return result;
      } catch (error) {
        if (
          error instanceof Error &&
          error.message.includes('Authentication')
        ) {
          throw new Error('Authentication expired. Please sign in again.');
        }
        throw error;
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
          'AuctionListings/private/',
          'auction-listing',
          'listings'
        )
        : Promise.resolve(''),
      manifestFile
        ? uploadFileToS3(
          manifestFile,
          'AuctionManifests/private/',
          'auction-manifest',
          'manifest'
        )
        : Promise.resolve(''),
    ]);
    return { listingsFileKey, manifestFileKey };
  }, [listingsFile, manifestFile, uploadFileToS3]);

  // Helper function to handle form submission
  const handleFormSubmission = useCallback(async (
    data: AuctionExcelUploadFormData,
    userId: string,
    listingsFileKey: string,
    manifestFileKey: string
  ) => {
    const apiPayload: AuctionCreationPayload = {
      ...data,
      sellerId: userId,
      listingsFileKey: listingsFileKey || undefined,
      manifestFileKey: manifestFileKey || undefined,
    };

    await submitAuctionForm(apiPayload);
  }, [submitAuctionForm]);

  // Helper function to handle errors
  const handleSubmissionError = useCallback((error: unknown) => {
    let errorMessage = 'Failed to create auction listings. Please try again.';

    if (error instanceof Error) {
      if (error.message.includes('Authentication')) {
        errorMessage = 'Your session has expired. Please sign in again.';
      } else if (error.message.includes('Network')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.message.includes('Storage')) {
        errorMessage = 'File upload failed. Please try again.';
      } else {
        errorMessage = error.message;
      }
    }

    toast({
      title: 'Error',
      description: errorMessage,
      variant: 'destructive',
    });
  }, [toast]);

  const onSubmit = useCallback(
    async (data: AuctionExcelUploadFormData) => {
      if (!areFilesSelected || isUploading || isSubmitting) {
        return;
      }

      try {
        setIsUploading(true);
        const { userId } = await getCurrentUserAndIdentity();

        toast({
          title: 'Uploading files...',
          description: 'Please wait while we upload your files.',
        });

        const { listingsFileKey, manifestFileKey } = await handleFileUploads();
        await handleFormSubmission(data, userId, listingsFileKey, manifestFileKey);

        toast({
          title: 'Success! 🎉',
          description:
            'Auction listings created successfully. You can now add another auction listing.',
        });

        resetFormForNewListing();
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
      <div className='container mx-auto max-w-8xl px-4 py-8'>
        {/* Header */}
        <div className="mb-8">
          <Link href="/seller/listing">
            <Button
              className="mb-4 text-gray-600 hover:text-gray-900"
              variant="ghost"
            >
              <ArrowLeft className='mr-2 h-4 w-4' />
              Go Back
            </Button>
          </Link>
          <h1 className='mb-2 font-bold text-3xl text-gray-900'>
            Create Auction Listing - Excel Upload
          </h1>
          <p className="text-gray-600">
            Configure auction settings and upload Excel files to create multiple
            auction listings
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
          >
            <GeographicRestrictions register={register} />
          </VisibilitySection>

          {/* Auction Sale Options - Auction-specific Component (Reduced 120+ lines to 1 component) */}
          <AuctionSaleOptions
            errors={errors}
            getErrorMessage={getErrorMessage}
            register={register}
            setValue={setValue}
            watch={watch}
          />

          {/* File Upload Sections - Shared Components (Reduced 400+ lines to 2 components) */}
          <div className='grid grid-cols-1 gap-8 lg:grid-cols-2'>
            <FileUploadArea
              acceptedTypes={ACCEPTED_FILE_TYPES}
              description="Excel file with product details for auction listings"
              file={listingsFile}
              fileInputId="listingsFile"
              iconColor="blue"
              isDragOver={dragState.listings}
              onDragLeave={(e) => handleDragLeave(e, 'listings')}
              onDragOver={(e) => handleDragOver(e, 'listings')}
              onDrop={(e) =>
                handleDrop(e, 'listings', (file) =>
                  handleFileSelect(file, 'listings')
                )
              }
              onFileRemove={() => removeFile('listings')}
              onFileSelect={(file) => handleFileSelect(file, 'listings')}
              title="Upload Listing Details Excel"
            />

            <FileUploadArea
              acceptedTypes={ACCEPTED_FILE_TYPES}
              description="Excel file with manifest data for auction listings"
              file={manifestFile}
              fileInputId="manifestFile"
              iconColor="orange"
              isDragOver={dragState.manifest}
              onDragLeave={(e) => handleDragLeave(e, 'manifest')}
              onDragOver={(e) => handleDragOver(e, 'manifest')}
              onDrop={(e) =>
                handleDrop(e, 'manifest', (file) =>
                  handleFileSelect(file, 'manifest')
                )
              }
              onFileRemove={() => removeFile('manifest')}
              onFileSelect={(file) => handleFileSelect(file, 'manifest')}
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
    </div>
  );
});
