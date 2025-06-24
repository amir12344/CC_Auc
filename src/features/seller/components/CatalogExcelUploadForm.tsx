'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import React, { useCallback, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/src/components/ui/button';
import { useToast } from '@/src/hooks/use-toast';

// Import shared components and utilities
import {
  ACCEPTED_FILE_TYPES,
  FileUploadArea,
  FormActions,
  GeographicRestrictions,
  getErrorMessage,
  useDragAndDrop,
  useFileUpload,
  VisibilitySection,
} from './shared';

// Constants are imported from shared utilities

// Form validation schema for catalog Excel upload
const catalogExcelUploadSchema = z.object({
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
});

type CatalogExcelUploadFormData = z.infer<typeof catalogExcelUploadSchema>;

// API payload type for catalog creation
export interface CatalogCreationPayload extends CatalogExcelUploadFormData {
  sellerId: string;
  listingFileKey?: string;
  skuFileKey?: string;
}

// File validation and upload utilities are in shared hooks

/**
 * CatalogExcelUploadForm Component - Refactored with shared components
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

  // Custom hooks
  const {
    dragState,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    resetDragState,
  } = useDragAndDrop(['listing', 'sku']);

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
  } = useForm<CatalogExcelUploadFormData>({
    resolver: zodResolver(catalogExcelUploadSchema),
    defaultValues: {
      visibilityType: 'public',
      geographicRestrictions: {},
    },
  });

  const visibilityType = watch('visibilityType');

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

        setValue('buyerTargeting', updated);
        return updated;
      });
    },
    [setValue]
  );

  const handleFileSelect = useCallback(
    (file: File, type: 'listing' | 'sku') => {
      const validationError = validateFileHook(file);

      if (validationError) {
        toast({
          title: 'Invalid File',
          description: validationError,
          variant: 'destructive',
        });
        return;
      }

      if (type === 'listing') {
        setListingFile(file);
      } else {
        setSkuFile(file);
      }

      toast({
        title: 'File Selected',
        description: `${file.name} selected successfully.`,
      });
    },
    [toast, validateFileHook]
  );

  const removeFile = useCallback((type: 'listing' | 'sku') => {
    if (type === 'listing') {
      setListingFile(null);
    } else {
      setSkuFile(null);
    }
  }, []);

  // Reset form function for new listing
  const resetFormForNewListing = useCallback(() => {
    reset({
      visibilityType: 'public',
      geographicRestrictions: {},
    });

    setSelectedBuyerTargeting([]);
    setListingFile(null);
    setSkuFile(null);
    resetDragState();
  }, [reset, resetDragState]);

  const submitCatalogForm = useCallback(
    async (payload: CatalogCreationPayload) => {
      try {
        const response = await fetch('/api/catalogs/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || `HTTP error! status: ${response.status}`
          );
        }

        return await response.json();
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
    const [listingFileKey, skuFileKey] = await Promise.all([
      listingFile
        ? uploadFileToS3(
          listingFile,
          'CatalogListings/private/',
          'catalog-listing',
          'listing'
        )
        : Promise.resolve(''),
      skuFile
        ? uploadFileToS3(
          skuFile,
          'CatalogSKUs/private/',
          'catalog-sku',
          'sku'
        )
        : Promise.resolve(''),
    ]);
    return { listingFileKey, skuFileKey };
  }, [listingFile, skuFile, uploadFileToS3]);

  // Helper function to handle form submission
  const handleFormSubmission = useCallback(async (
    data: CatalogExcelUploadFormData,
    userId: string,
    listingFileKey: string,
    skuFileKey: string
  ) => {
    const apiPayload: CatalogCreationPayload = {
      ...data,
      sellerId: userId,
      listingFileKey: listingFileKey || undefined,
      skuFileKey: skuFileKey || undefined,
    };

    await submitCatalogForm(apiPayload);
  }, [submitCatalogForm]);

  // Helper function to handle errors
  const handleSubmissionError = useCallback((error: unknown) => {
    let errorMessage = 'Failed to create catalog listings. Please try again.';

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
    async (data: CatalogExcelUploadFormData) => {
      if (!areFilesSelected) {
        toast({
          title: 'Missing Files',
          description: 'Please select both listing and SKU files.',
          variant: 'destructive',
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
          title: 'Uploading files...',
          description: 'Please wait while we upload your files.',
        });

        const { listingFileKey, skuFileKey } = await handleFileUploads();
        await handleFormSubmission(data, userId, listingFileKey, skuFileKey);

        toast({
          title: 'Success! 🎉',
          description:
            'Catalog listings created successfully. You can now add another listing.',
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
          >
            <GeographicRestrictions register={register} />
          </VisibilitySection>

          {/* File Upload Sections */}
          <div className='grid grid-cols-1 gap-8 lg:grid-cols-2'>
            <FileUploadArea
              acceptedTypes={ACCEPTED_FILE_TYPES}
              description="Excel file with product listing data for catalog"
              file={listingFile}
              fileInputId="listingFile"
              iconColor="blue"
              isDragOver={dragState.listing}
              onDragLeave={(e) => handleDragLeave(e, 'listing')}
              onDragOver={(e) => handleDragOver(e, 'listing')}
              onDrop={(e) =>
                handleDrop(e, 'listing', (file) =>
                  handleFileSelect(file, 'listing')
                )
              }
              onFileRemove={() => removeFile('listing')}
              onFileSelect={(file) => handleFileSelect(file, 'listing')}
              title="Upload Listing Excel"
            />

            <FileUploadArea
              acceptedTypes={ACCEPTED_FILE_TYPES}
              description="Excel file with SKU details for catalog listings"
              file={skuFile}
              fileInputId="skuFile"
              iconColor="purple"
              isDragOver={dragState.sku}
              onDragLeave={(e) => handleDragLeave(e, 'sku')}
              onDragOver={(e) => handleDragOver(e, 'sku')}
              onDrop={(e) =>
                handleDrop(e, 'sku', (file) => handleFileSelect(file, 'sku'))
              }
              onFileRemove={() => removeFile('sku')}
              onFileSelect={(file) => handleFileSelect(file, 'sku')}
              title="Upload SKU Excel"
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
      </div>
    </div>
  );
});
