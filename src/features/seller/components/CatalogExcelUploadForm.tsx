'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { fetchAuthSession } from 'aws-amplify/auth';
import { Button } from '@/src/components/ui/button';
import { useToast } from '@/src/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

// Import shared components and utilities
import {
  FileUploadArea,
  VisibilitySection,
  GeographicRestrictions,
  FormActions,
  useFileUpload,
  useDragAndDrop,
  ACCEPTED_FILE_TYPES,
  getErrorMessage,
} from './shared';

// Constants are now imported from shared utilities

// Form validation schema for catalog Excel upload
const catalogExcelUploadSchema = z.object({
  visibilityType: z.enum(['public', 'private'], {
    required_error: 'Please select a visibility type',
  }),
  buyerTargeting: z.array(z.string()).optional(),
  geographicRestrictions: z.object({
    country: z.string().optional(),
    state: z.string().optional(),
    zip: z.string().optional(),
    deliveryRegion: z.string().optional(),
  }).optional(),
});

type CatalogExcelUploadFormData = z.infer<typeof catalogExcelUploadSchema>;

// API payload type for catalog creation
export interface CatalogCreationPayload extends CatalogExcelUploadFormData {
  sellerId: string;
  listingFileKey?: string;
  skuFileKey?: string;
}

// File validation and upload utilities are now in shared hooks

/**
 * CatalogExcelUploadForm Component - Refactored with shared components
 * File Storage Structure:
 * - Listings: CatalogListings/private/{sellerId}/
 * - SKUs: CatalogSKUs/private/{sellerId}/
 */
export const CatalogExcelUploadForm = React.memo(() => {
  const { toast } = useToast();

  // State management with proper typing
  const [selectedBuyerTargeting, setSelectedBuyerTargeting] = useState<string[]>([]);
  const [listingFile, setListingFile] = useState<File | null>(null);
  const [skuFile, setSkuFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ listing: 0, sku: 0 });

  // Custom hooks
  const { dragState, handleDragOver, handleDragLeave, handleDrop, resetDragState } =
    useDragAndDrop(['listing', 'sku']);

  const { validateFile: validateFileHook, uploadFileToS3, getCurrentUserAndIdentity } = useFileUpload({
    onProgressUpdate: (type, progress) => {
      setUploadProgress(prev => ({ ...prev, [type]: progress }));
    }
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<CatalogExcelUploadFormData>({
    resolver: zodResolver(catalogExcelUploadSchema),
    defaultValues: {
      visibilityType: 'public',
      geographicRestrictions: {},
    }
  });

  const visibilityType = watch('visibilityType');

  // Memoized computed values
  const areFilesSelected = useMemo(() =>
    Boolean(listingFile && skuFile),
    [listingFile, skuFile]
  );

  const isFormDisabled = useMemo(() =>
    isSubmitting || isUploading || !areFilesSelected,
    [isSubmitting, isUploading, areFilesSelected]
  );

  // File handling callbacks
  const handleBuyerTargetingChange = useCallback((option: string, checked: boolean) => {
    setSelectedBuyerTargeting(prev => {
      const updated = checked
        ? [...prev, option]
        : prev.filter(item => item !== option);

      setValue('buyerTargeting', updated);
      return updated;
    });
  }, [setValue]);

  const handleFileSelect = useCallback((file: File, type: 'listing' | 'sku') => {
    const validationError = validateFileHook(file);

    if (validationError) {
      toast({
        title: "Invalid File",
        description: validationError,
        variant: "destructive",
      });
      return;
    }

    if (type === 'listing') {
      setListingFile(file);
    } else {
      setSkuFile(file);
    }

    toast({
      title: "File Selected",
      description: `${file.name} selected successfully.`,
    });
  }, [toast, validateFileHook]);

  const removeFile = useCallback((type: 'listing' | 'sku') => {
    if (type === 'listing') {
      setListingFile(null);
    } else {
      setSkuFile(null);
    }
    setUploadProgress(prev => ({ ...prev, [type]: 0 }));
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
    setUploadProgress({ listing: 0, sku: 0 });
    resetDragState();
  }, [reset, resetDragState]);

  const submitCatalogForm = useCallback(async (payload: CatalogCreationPayload) => {
    try {
      const session = await fetchAuthSession();
      const idToken = session.tokens?.idToken?.toString();

      if (!idToken) {
        throw new Error('Authentication required. Please sign in again.');
      }

      const response = await fetch('/api/catalogs/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error && error.message.includes('Authentication')) {
        throw new Error('Authentication expired. Please sign in again.');
      }
      throw error;
    }
  }, []);

  const onSubmit = useCallback(async (data: CatalogExcelUploadFormData) => {
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
      setUploadProgress({ listing: 0, sku: 0 });

      const { userId } = await getCurrentUserAndIdentity();

      toast({
        title: "Uploading files...",
        description: "Please wait while we upload your files.",
      });

      // Upload files in parallel
      const [listingFileKey, skuFileKey] = await Promise.all([
        listingFile ? uploadFileToS3(
          listingFile,
          `CatalogListings/private/`,
          'catalog-listing',
          'listing'
        ) : Promise.resolve(''),
        skuFile ? uploadFileToS3(
          skuFile,
          `CatalogSKUs/private/`,
          'catalog-sku',
          'sku'
        ) : Promise.resolve('')
      ]);

      const apiPayload: CatalogCreationPayload = {
        ...data,
        sellerId: userId,
        listingFileKey: listingFileKey || undefined,
        skuFileKey: skuFileKey || undefined,
      };

      await submitCatalogForm(apiPayload);

      toast({
        title: "Success! 🎉",
        description: "Catalog listings created successfully. You can now add another listing.",
      });

      resetFormForNewListing();
    } catch (error) {
      let errorMessage = "Failed to create catalog listings. Please try again.";

      if (error instanceof Error) {
        if (error.message.includes('Authentication')) {
          errorMessage = "Your session has expired. Please sign in again.";
        } else if (error.message.includes('Network')) {
          errorMessage = "Network error. Please check your connection and try again.";
        } else if (error.message.includes('Storage')) {
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
    } finally {
      setIsUploading(false);
      setUploadProgress({ listing: 0, sku: 0 });
    }
  }, [areFilesSelected, listingFile, skuFile, uploadFileToS3, submitCatalogForm, toast, resetFormForNewListing, getCurrentUserAndIdentity, isUploading, isSubmitting]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-8xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/seller/listing">
            <Button variant="ghost" className="mb-4 text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Create Catalog Listing - Excel Upload
          </h1>
          <p className="text-gray-600">
            Configure visibility settings and upload Excel files to create multiple catalog listings
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Visibility Section */}
          <VisibilitySection
            title="Listing Visibility"
            description="Control who can see your catalog listings"
            visibilityType={visibilityType}
            selectedBuyerTargeting={selectedBuyerTargeting}
            errors={errors}
            setValue={setValue}
            onBuyerTargetingChange={handleBuyerTargetingChange}
            getErrorMessage={getErrorMessage}
          >
            <GeographicRestrictions register={register} />
          </VisibilitySection>

          {/* File Upload Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <FileUploadArea
              title="Upload Listing Excel"
              description="Excel file with product listing data for catalog"
              file={listingFile}
              fileInputId="listingFile"
              acceptedTypes={ACCEPTED_FILE_TYPES}
              isDragOver={dragState.listing}
              iconColor="blue"
              onFileSelect={(file) => handleFileSelect(file, 'listing')}
              onFileRemove={() => removeFile('listing')}
              onDragOver={(e) => handleDragOver(e, 'listing')}
              onDragLeave={(e) => handleDragLeave(e, 'listing')}
              onDrop={(e) => handleDrop(e, 'listing', (file) => handleFileSelect(file, 'listing'))}
            />

            <FileUploadArea
              title="Upload SKU Excel"
              description="Excel file with SKU details for catalog listings"
              file={skuFile}
              fileInputId="skuFile"
              acceptedTypes={ACCEPTED_FILE_TYPES}
              isDragOver={dragState.sku}
              iconColor="purple"
              onFileSelect={(file) => handleFileSelect(file, 'sku')}
              onFileRemove={() => removeFile('sku')}
              onDragOver={(e) => handleDragOver(e, 'sku')}
              onDragLeave={(e) => handleDragLeave(e, 'sku')}
              onDrop={(e) => handleDrop(e, 'sku', (file) => handleFileSelect(file, 'sku'))}
            />
          </div>

          {/* Form Actions */}
          <FormActions
            areFilesSelected={areFilesSelected}
            isFormDisabled={isFormDisabled}
            isSubmitting={isSubmitting}
            isUploading={isUploading}
            submitButtonText="Create Catalog Listings"
            loadingText="Creating Catalog Listings..."
            missingFilesMessage="Please select both listing and SKU Excel files to continue"
            onClearForm={resetFormForNewListing}
          />
        </form>
      </div>
    </div>
  );
});