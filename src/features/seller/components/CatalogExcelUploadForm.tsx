'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getCurrentUser } from 'aws-amplify/auth';
import { uploadData } from 'aws-amplify/storage';
import { Button } from '@/src/components/ui/button';
import { useToast } from '@/src/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Label } from '@/src/components/ui/label';
import { Input } from '@/src/components/ui/input';
import { Checkbox } from '@/src/components/ui/checkbox';
import { Badge } from '@/src/components/ui/badge';
import { ArrowLeft, Upload, FileSpreadsheet, Eye, FileText, X } from 'lucide-react';
import Link from 'next/link';

// Constants moved outside component to prevent re-creation
const BUYER_TARGETING_OPTIONS = [
  'Discount Retail',
  'StockX',
  'Amazon or Walmart',
  'Live Seller Marketplaces (Whatnot, TikTok etc.)',
  'Reseller Marketplaces (Poshmark, Depop etc.)',
  'Off-Price Retail',
] as const;

const ACCEPTED_FILE_TYPES = '.xlsx,.xls,.csv';
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

// Form validation schema for catalog Excel upload
const catalogExcelUploadSchema = z.object({
  // Listing Visibility
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

// File validation utility
const validateFile = (file: File): string | null => {
  if (file.size > MAX_FILE_SIZE) {
    return `File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`;
  }

  const allowedTypes = ['.xlsx', '.xls', '.csv'];
  const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();

  if (!allowedTypes.includes(fileExtension)) {
    return 'Please select a valid Excel file (.xlsx, .xls, .csv)';
  }

  return null;
};

// Generate unique filename utility
const generateFileName = (originalName: string, prefix: string): string => {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const fileExtension = originalName.split('.').pop();
  return `${prefix}-${timestamp}-${randomSuffix}.${fileExtension}`;
};

/**
 * CatalogExcelUploadForm Component
 * File Storage Structure:
 * - Listings: CatalogListings/private/{sellerId}/
 * - SKUs: CatalogSKUs/private/{sellerId}/
 */
export const CatalogExcelUploadForm = React.memo(() => {
  const router = useRouter();
  const { toast } = useToast();

  // State management with proper typing
  const [selectedBuyerTargeting, setSelectedBuyerTargeting] = useState<string[]>([]);
  const [listingFile, setListingFile] = useState<File | null>(null);
  const [skuFile, setSkuFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ listing: 0, sku: 0 });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
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

  // Memoized callbacks for performance
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
    const validationError = validateFile(file);

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
  }, [toast]);

  const removeFile = useCallback((type: 'listing' | 'sku') => {
    if (type === 'listing') {
      setListingFile(null);
    } else {
      setSkuFile(null);
    }

    // Reset progress
    setUploadProgress(prev => ({ ...prev, [type]: 0 }));
  }, []);

  const uploadFileToS3 = useCallback(async (
    file: File,
    folderPath: string,
    type: 'listing' | 'sku'
  ): Promise<string> => {
    const fileName = generateFileName(file.name, type === 'listing' ? 'catalog-listing' : 'catalog-sku');
    const path = `${folderPath}${fileName}`;

    try {
      const result = await uploadData({
        path: path,
        data: file,
        options: {
          onProgress: ({ transferredBytes, totalBytes }) => {
            if (totalBytes) {
              const progress = Math.round((transferredBytes / totalBytes) * 100);
              setUploadProgress(prev => ({ ...prev, [type]: progress }));
            }
          },
        },
      }).result;

      return result.path;
    } catch (error) {
      console.error(`Error uploading ${type} file:`, error);
      throw new Error(`Failed to upload ${type} file`);
    }
  }, []);

  const submitCatalogForm = useCallback(async (payload: CatalogCreationPayload) => {
    try {
      // TODO: Create CatalogService similar to AuctionService
      const response = await fetch('/api/catalogs/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API call failed:', error);
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

    try {
      setIsUploading(true);
      setUploadProgress({ listing: 0, sku: 0 });

      const user = await getCurrentUser();
      const userId = user.userId;

      toast({
        title: "Uploading files...",
        description: "Please wait while we upload your files.",
      });

      // Upload files in parallel for better performance
      const [listingFileKey, skuFileKey] = await Promise.all([
        listingFile ? uploadFileToS3(
          listingFile,
          `CatalogListings/private/${userId}/`,
          'listing'
        ) : Promise.resolve(''),
        skuFile ? uploadFileToS3(
          skuFile,
          `CatalogSKUs/private/${userId}/`,
          'sku'
        ) : Promise.resolve('')
      ]);

      // Prepare API payload
      const apiPayload: CatalogCreationPayload = {
        ...data,
        sellerId: userId,
        listingFileKey: listingFileKey || undefined,
        skuFileKey: skuFileKey || undefined,
      };

      // Submit to API
      await submitCatalogForm(apiPayload);

      toast({
        title: "Success!",
        description: "Catalog listings created successfully.",
      });

      router.push('/seller/listing');
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create catalog listings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress({ listing: 0, sku: 0 });
    }
  }, [areFilesSelected, listingFile, skuFile, uploadFileToS3, submitCatalogForm, toast, router]);

  const getErrorMessage = useCallback((error: any): string | undefined => {
    if (typeof error === 'string') return error;
    if (error?.message) return error.message;
    return undefined;
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-8xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/seller/listing">
            <Button
              variant="ghost"
              className="mb-4 text-gray-600 hover:text-gray-900"
            >
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
          {/* Listing Visibility Section */}
          <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Eye className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-xl font-semibold text-gray-900">
                    Listing Visibility
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Control who can see your catalog listings
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Visibility Setting */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Label className="text-base font-medium text-gray-900">
                    Visibility Setting *
                  </Label>
                  <Badge variant="destructive" className="text-xs">Required</Badge>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                    <Checkbox
                      id="public"
                      checked={visibilityType === 'public'}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setValue('visibilityType', 'public');
                        }
                      }}
                    />
                    <Label htmlFor="public" className="font-medium text-gray-900 cursor-pointer">
                      Public (all buyers on Commerce Central can view)
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                    <Checkbox
                      id="private"
                      checked={visibilityType === 'private'}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setValue('visibilityType', 'private');
                        }
                      }}
                    />
                    <Label htmlFor="private" className="font-medium text-gray-900 cursor-pointer">
                      Private (only visible to selected segments)
                    </Label>
                  </div>
                </div>

                {getErrorMessage(errors.visibilityType) && (
                  <p className="text-sm text-red-600">{getErrorMessage(errors.visibilityType)}</p>
                )}
              </div>

              {/* Buyer Targeting (only show if Private is selected) */}
              {visibilityType === 'private' && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
                  <Label className="text-base font-medium text-gray-900">
                    Buyer Targeting (for Private Listings)
                  </Label>
                  <p className="text-sm text-gray-600">
                    Select which buyer segments can view this private listing
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {BUYER_TARGETING_OPTIONS.map((option) => (
                      <div key={option} className="flex items-center space-x-3 p-2 hover:bg-white rounded">
                        <Checkbox
                          id={`buyer-${option}`}
                          checked={selectedBuyerTargeting.includes(option)}
                          onCheckedChange={(checked) =>
                            handleBuyerTargetingChange(option, checked as boolean)
                          }
                        />
                        <Label
                          htmlFor={`buyer-${option}`}
                          className="text-sm font-medium text-gray-700 cursor-pointer"
                        >
                          {option}
                        </Label>
                      </div>
                    ))}
                  </div>

                  {selectedBuyerTargeting.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-600 mb-2">Selected segments:</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedBuyerTargeting.map((option) => (
                          <Badge key={option} variant="secondary" className="text-xs">
                            {option}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Geographic Restrictions */}
              <div className="space-y-4">
                <Label className="text-base font-medium text-gray-900">
                  Geographic Restrictions (optional)
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="country" className="text-sm font-medium text-gray-700">Country</Label>
                    <Input
                      {...register('geographicRestrictions.country')}
                      id="country"
                      placeholder="e.g., USA"
                      className="h-12"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state" className="text-sm font-medium text-gray-700">State</Label>
                    <Input
                      {...register('geographicRestrictions.state')}
                      id="state"
                      placeholder="e.g., CA"
                      className="h-12"
                    />
                  </div>
                  <div>
                    <Label htmlFor="zip" className="text-sm font-medium text-gray-700">Zip</Label>
                    <Input
                      {...register('geographicRestrictions.zip')}
                      id="zip"
                      placeholder="e.g., 90210"
                      className="h-12"
                    />
                  </div>
                  <div>
                    <Label htmlFor="deliveryRegion" className="text-sm font-medium text-gray-700">Delivery Region</Label>
                    <Input
                      {...register('geographicRestrictions.deliveryRegion')}
                      id="deliveryRegion"
                      placeholder="e.g., West Coast"
                      className="h-12"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* File Upload Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Upload Listing Excel */}
            <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-900">
                      Upload Listing Excel
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      Excel file with product listing data for catalog
                    </p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors bg-gray-50">
                  <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  {!listingFile ? (
                    <>
                      <p className="text-lg font-medium text-gray-700 mb-2">
                        Upload Listing Excel
                      </p>
                      <p className="text-sm text-gray-500 mb-4">
                        Drag and drop your Excel file here or click to browse
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        className="mx-auto"
                        onClick={() => document.getElementById('listingFile')?.click()}
                      >
                        Browse Files
                      </Button>
                      <Input
                        id="listingFile"
                        type="file"
                        accept={ACCEPTED_FILE_TYPES}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleFileSelect(file, 'listing');
                          }
                        }}
                        className="hidden"
                      />
                    </>
                  ) : (
                    <div className="space-y-3">
                      <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-800">
                        <FileSpreadsheet className="w-5 h-5 mr-2" />
                        <span className="font-medium">{listingFile.name}</span>
                        <button
                          type="button"
                          onClick={() => removeFile('listing')}
                          className="ml-2 text-green-600 hover:text-green-800"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-sm text-gray-600">File selected successfully</p>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 text-center">
                  Excel files only (.xlsx, .xls, .csv)
                </p>
              </CardContent>
            </Card>

            {/* Upload SKU Excel */}
            <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <FileText className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-900">
                      Upload SKU Excel
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      Excel file with SKU details for catalog listings
                    </p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors bg-gray-50">
                  <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  {!skuFile ? (
                    <>
                      <p className="text-lg font-medium text-gray-700 mb-2">
                        Upload SKU Excel
                      </p>
                      <p className="text-sm text-gray-500 mb-4">
                        Drag and drop your Excel file here or click to browse
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        className="mx-auto"
                        onClick={() => document.getElementById('skuFile')?.click()}
                      >
                        Browse Files
                      </Button>
                      <Input
                        id="skuFile"
                        type="file"
                        accept={ACCEPTED_FILE_TYPES}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleFileSelect(file, 'sku');
                          }
                        }}
                        className="hidden"
                      />
                    </>
                  ) : (
                    <div className="space-y-3">
                      <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-800">
                        <FileText className="w-5 h-5 mr-2" />
                        <span className="font-medium">{skuFile.name}</span>
                        <button
                          type="button"
                          onClick={() => removeFile('sku')}
                          className="ml-2 text-green-600 hover:text-green-800"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-sm text-gray-600">File selected successfully</p>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 text-center">
                  Excel files only (.xlsx, .xls, .csv)
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Form Actions */}
          <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
            <CardContent className="pt-6">
              {!areFilesSelected && (
                <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-orange-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-orange-800">
                        Please select both listing and SKU Excel files to continue
                      </p>
                    </div>
                  </div>
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-4 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/seller/listing')}
                  className="h-12 px-8"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isFormDisabled}
                  className="h-12 px-8 bg-[#43CD66] hover:bg-[#3ab859] text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting || isUploading ? 'Creating Catalog Listings...' : 'Create Catalog Listings'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
});