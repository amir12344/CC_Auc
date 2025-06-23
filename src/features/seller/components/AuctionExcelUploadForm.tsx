'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';
import { uploadData } from 'aws-amplify/storage';
import { Button } from '@/src/components/ui/button';
import { AuctionService } from '../services/auctionService';
import { useToast } from '@/src/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Label } from '@/src/components/ui/label';
import { Input } from '@/src/components/ui/input';
import '@aws-amplify/ui-react/styles.css'
import { Checkbox } from '@/src/components/ui/checkbox';
import { Badge } from '@/src/components/ui/badge';
import { ArrowLeft, Upload, FileSpreadsheet, Eye, Gavel, DollarSign, Clock, X } from 'lucide-react';
import Link from 'next/link';

// Helper to get identityId from the auth session
async function getCurrentIdentityId(): Promise<string> {
  try {
    const session = await fetchAuthSession();
    const identityId = session.identityId;
    if (!identityId) {
      throw new Error('Identity ID not found in auth session.');
    }
    return identityId;
  } catch (error) {
    throw new Error('Could not resolve user identity. Please try signing out and back in.');
  }
}

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

// Form validation schema for auction Excel upload
const auctionExcelUploadSchema = z.object({
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

  // Sale Options
  startingBid: z.number().min(0.01, 'Starting bid must be greater than 0'),
  bidIncrementType: z.enum(['dollar', 'percentage'], {
    required_error: 'Please select bid increment type',
  }),
  bidIncrementAmount: z.number().min(0.01, 'Bid increment amount must be greater than 0'),
  auctionDuration: z.number().min(1).max(30, 'Auction duration must be between 1-30 days'),
});

type AuctionExcelUploadFormData = z.infer<typeof auctionExcelUploadSchema>;

// API payload type for auction creation
export interface AuctionCreationPayload extends AuctionExcelUploadFormData {
  sellerId: string;
  listingsFileKey?: string;
  manifestFileKey?: string;
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
 * AuctionExcelUploadForm Component 
 * File Storage Structure:
 * - Listings: AuctionListings/private/{sellerId}/
 * - Manifests: AuctionManifests/private/{sellerId}/
 */
export const AuctionExcelUploadForm = React.memo(() => {
  const router = useRouter();
  const { toast } = useToast();

  // State management with proper typing
  const [selectedBuyerTargeting, setSelectedBuyerTargeting] = useState<string[]>([]);
  const [listingsFile, setListingsFile] = useState<File | null>(null);
  const [manifestFile, setManifestFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ listings: 0, manifest: 0 });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<AuctionExcelUploadFormData>({
    resolver: zodResolver(auctionExcelUploadSchema),
    defaultValues: {
      visibilityType: 'public',
      bidIncrementType: 'dollar',
      auctionDuration: 7,
      geographicRestrictions: {},
    }
  });

  const visibilityType = watch('visibilityType');

  // Memoized computed values
  const areFilesSelected = useMemo(() =>
    Boolean(listingsFile && manifestFile),
    [listingsFile, manifestFile]
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

  const handleFileSelect = useCallback((file: File, type: 'listings' | 'manifest') => {
    const validationError = validateFile(file);

    if (validationError) {
      toast({
        title: "Invalid File",
        description: validationError,
        variant: "destructive",
      });
      return;
    }

    if (type === 'listings') {
      setListingsFile(file);
    } else {
      setManifestFile(file);
    }

    toast({
      title: "File Selected",
      description: `${file.name} selected successfully.`,
    });
  }, [toast]);

  const removeFile = useCallback((type: 'listings' | 'manifest') => {
    if (type === 'listings') {
      setListingsFile(null);
    } else {
      setManifestFile(null);
    }

    // Reset progress
    setUploadProgress(prev => ({ ...prev, [type]: 0 }));
  }, []);

  const uploadFileToS3 = useCallback(async (
    file: File,
    folderPath: string,
    type: 'listings' | 'manifest'
  ): Promise<string> => {
    const fileName = generateFileName(file.name, type === 'listings' ? 'listing-details' : 'manifest');
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

      // const fullS3Url = `https://${S3_BUCKET_NAME}.s3.${S3_REGION}.amazonaws.com/${result.path}`;

      return result.path;
    } catch (error) {
      throw new Error(`Failed to upload ${type} file`);
    }
  }, []);

  const submitAuctionForm = useCallback(async (payload: AuctionCreationPayload) => {
    try {
      const result = await AuctionService.createAuctionListings(payload);
      return result;
    } catch (error) {
      throw error;
    }
  }, []);

  const onSubmit = useCallback(async (data: AuctionExcelUploadFormData) => {
    if (!areFilesSelected) {
      toast({
        title: "Missing Files",
        description: "Please select both listing details and manifest files.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress({ listings: 0, manifest: 0 });

      const user = await getCurrentUser();
      const userId = user.userId;
      const identityId = await getCurrentIdentityId();

      toast({
        title: "Uploading files...",
        description: "Please wait while we upload your files.",
      });

      // Upload files in parallel for better performance
      const [listingsFileKey, manifestFileKey] = await Promise.all([
        listingsFile ? uploadFileToS3(
          listingsFile,
          `AuctionListings/private/${identityId}/`,
          'listings'
        ) : Promise.resolve(''),
        manifestFile ? uploadFileToS3(
          manifestFile,
          `AuctionManifests/private/${identityId}/`,
          'manifest'
        ) : Promise.resolve('')
      ]);

      // Prepare API payload
      const apiPayload: AuctionCreationPayload = {
        ...data,
        sellerId: userId,
        listingsFileKey: listingsFileKey || undefined,
        manifestFileKey: manifestFileKey || undefined,
      };

      // Submit to API
      await submitAuctionForm(apiPayload);

      toast({
        title: "Success!",
        description: "Auction listings created successfully.",
      });

      router.push('/seller/listing');
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create auction listings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress({ listings: 0, manifest: 0 });
    }
  }, [areFilesSelected, listingsFile, manifestFile, uploadFileToS3, submitAuctionForm, toast, router]);

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
            Create Auction Listing - Excel Upload
          </h1>
          <p className="text-gray-600">
            Configure auction settings and upload Excel files to create multiple auction listings
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
                    Listing Visibility for Auctions
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Control who can see and bid on your auction listings
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

          {/* Sale Options Section */}
          <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Gavel className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <CardTitle className="text-xl font-semibold text-gray-900">
                    Sale Options
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Configure auction bidding settings and duration
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Starting Bid */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="startingBid" className="text-base font-medium text-gray-900">
                    Starting Bid *
                  </Label>
                  <Badge variant="destructive" className="text-xs">Required</Badge>
                </div>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    {...register('startingBid', { valueAsNumber: true })}
                    id="startingBid"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    className="h-12 pl-10"
                  />
                </div>
                {getErrorMessage(errors.startingBid) && (
                  <p className="text-sm text-red-600">{getErrorMessage(errors.startingBid)}</p>
                )}
              </div>

              {/* Bid Increment Option */}
              <div className="space-y-4">
                <Label className="text-base font-medium text-gray-900">
                  Bid Increment Option
                </Label>

                <div className="flex gap-6">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="dollar"
                      checked={watch('bidIncrementType') === 'dollar'}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setValue('bidIncrementType', 'dollar');
                        }
                      }}
                    />
                    <Label htmlFor="dollar" className="font-medium text-gray-900 cursor-pointer">
                      $ (Dollar amount)
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="percentage"
                      checked={watch('bidIncrementType') === 'percentage'}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setValue('bidIncrementType', 'percentage');
                        }
                      }}
                    />
                    <Label htmlFor="percentage" className="font-medium text-gray-900 cursor-pointer">
                      % (Percentage)
                    </Label>
                  </div>
                </div>
              </div>

              {/* Bid Increment Amount */}
              <div className="space-y-2">
                <Label htmlFor="bidIncrementAmount" className="text-base font-medium text-gray-900">
                  Bid Increment Amount - Numerical
                </Label>
                <Input
                  {...register('bidIncrementAmount', { valueAsNumber: true })}
                  id="bidIncrementAmount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="Enter amount"
                  className="h-12"
                />
                {getErrorMessage(errors.bidIncrementAmount) && (
                  <p className="text-sm text-red-600">{getErrorMessage(errors.bidIncrementAmount)}</p>
                )}
              </div>

              {/* Auction Duration */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="auctionDuration" className="text-base font-medium text-gray-900">
                    Auction Duration *
                  </Label>
                  <Badge variant="destructive" className="text-xs">Required</Badge>
                </div>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    {...register('auctionDuration', { valueAsNumber: true })}
                    id="auctionDuration"
                    type="number"
                    min="1"
                    max="30"
                    placeholder="7"
                    className="h-12 pl-10"
                  />
                </div>
                <p className="text-sm text-gray-600">Fixed (1-30 days)</p>
                {getErrorMessage(errors.auctionDuration) && (
                  <p className="text-sm text-red-600">{getErrorMessage(errors.auctionDuration)}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* File Upload Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Upload Listing Details Excel */}
            <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-900">
                      Upload Listing Details Excel
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      Excel file with product details for auction listings
                    </p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors bg-gray-50">
                  <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  {!listingsFile ? (
                    <>
                      <p className="text-lg font-medium text-gray-700 mb-2">
                        Upload Listing Details Excel
                      </p>
                      <p className="text-sm text-gray-500 mb-4">
                        Drag and drop your Excel file here or click to browse
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        className="mx-auto"
                        onClick={() => document.getElementById('listingsFile')?.click()}
                      >
                        Browse Files
                      </Button>
                      <Input
                        id="listingsFile"
                        type="file"
                        accept={ACCEPTED_FILE_TYPES}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleFileSelect(file, 'listings');
                          }
                        }}
                        className="hidden"
                      />
                    </>
                  ) : (
                    <div className="space-y-3">
                      <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-800">
                        <FileSpreadsheet className="w-5 h-5 mr-2" />
                        <span className="font-medium">{listingsFile.name}</span>
                        <button
                          type="button"
                          onClick={() => removeFile('listings')}
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

            {/* Upload Manifest Excel */}
            <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <FileSpreadsheet className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-900">
                      Upload Manifest Excel
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      Excel file with manifest data for auction listings
                    </p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-orange-400 transition-colors bg-gray-50">
                  <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  {!manifestFile ? (
                    <>
                      <p className="text-lg font-medium text-gray-700 mb-2">
                        Upload Manifest Excel
                      </p>
                      <p className="text-sm text-gray-500 mb-4">
                        Drag and drop your Excel file here or click to browse
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        className="mx-auto"
                        onClick={() => document.getElementById('manifestFile')?.click()}
                      >
                        Browse Files
                      </Button>
                      <Input
                        id="manifestFile"
                        type="file"
                        accept={ACCEPTED_FILE_TYPES}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleFileSelect(file, 'manifest');
                          }
                        }}
                        className="hidden"
                      />
                    </>
                  ) : (
                    <div className="space-y-3">
                      <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-800">
                        <FileSpreadsheet className="w-5 h-5 mr-2" />
                        <span className="font-medium">{manifestFile.name}</span>
                        <button
                          type="button"
                          onClick={() => removeFile('manifest')}
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
                        Please select both listing details and manifest Excel files to continue
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
                  {isSubmitting || isUploading ? 'Creating Auction Listings...' : 'Create Auction Listings'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}); 