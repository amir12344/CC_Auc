'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/src/components/ui/dialog';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { 
  Package, 
  Upload, 
  Store, 
  Gavel,
  ArrowLeft,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

interface CreateListingDialogProps {
  children: React.ReactNode;
}

type ListingType = 'catalog' | 'auction' | null;
type CreationMethod = 'manual' | 'upload' | null;

export const CreateListingDialog = ({ children }: CreateListingDialogProps) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [listingType, setListingType] = useState<ListingType>(null);
  const [creationMethod, setCreationMethod] = useState<CreationMethod>(null);

  const resetDialog = () => {
    setCurrentStep(1);
    setListingType(null);
    setCreationMethod(null);
  };

  const handleNext = () => {
    if (currentStep === 1 && listingType) {
      setCurrentStep(2);
    }
  };

  const handleBack = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
      setCreationMethod(null);
    }
  };

  const handleFinish = () => {
    if (listingType && creationMethod) {
      let path = '';
      
      if (listingType === 'auction') {
        path = creationMethod === 'manual' 
          ? '/seller/listing/create/auction/manual'
          : '/seller/listing/create/auction/upload';
      } else if (listingType === 'catalog') {
        path = creationMethod === 'manual' 
          ? '/seller/listing/create/catalog/manual'
          : '/seller/listing/create/catalog/upload';
      }
      
      setOpen(false);
      resetDialog();
      router.push(path);
    }
  };

  const canProceed = currentStep === 1 ? listingType !== null : creationMethod !== null;

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      setOpen(newOpen);
      if (!newOpen) {
        resetDialog();
      }
    }}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Create New Listing</DialogTitle>
          <DialogDescription className="text-gray-600">
            Follow these steps to create your listing
          </DialogDescription>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center space-x-4 py-4">
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep >= 1 ? 'bg-[#43CD66] text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              {currentStep > 1 ? <CheckCircle2 className="w-4 h-4" /> : '1'}
            </div>
            <span className="ml-2 text-sm font-medium text-gray-700">Choose Type</span>
          </div>
          <div className={`w-8 h-0.5 ${currentStep >= 2 ? 'bg-[#43CD66]' : 'bg-gray-200'}`} />
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep >= 2 ? 'bg-[#43CD66] text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              2
            </div>
            <span className="ml-2 text-sm font-medium text-gray-700">Choose Method</span>
          </div>
        </div>

        <div className="py-6">
          {/* Step 1: Choose Listing Type */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  What type of listing would you like to create?
                </h3>
                <p className="text-gray-600">
                  Choose between catalog or auction listing
                </p>
              </div>
              
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Catalog Option - Now Enabled */}
                <Card 
                  className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                    listingType === 'catalog' 
                      ? 'ring-2 ring-[#43CD66] bg-[#43CD66]/5' 
                      : 'border-gray-200 hover:border-[#43CD66]'
                  }`}
                  onClick={() => setListingType('catalog')}
                >
                  <CardContent className="p-6 text-center">
                    <Store className={`w-12 h-12 mx-auto mb-3 transition-colors duration-200 ${
                      listingType === 'catalog' ? 'text-[#43CD66]' : 'text-gray-600'
                    }`} />
                    <h4 className="font-semibold text-gray-900 mb-2">Create Catalog Listing</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      List products in the catalog for buyers to browse
                    </p>
                    {listingType === 'catalog' && (
                      <CheckCircle2 className="w-5 h-5 mx-auto text-[#43CD66]" />
                    )}
                  </CardContent>
                </Card>

                {/* Auction Option - Enabled */}
                <Card 
                  className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                    listingType === 'auction' 
                      ? 'ring-2 ring-[#43CD66] bg-[#43CD66]/5' 
                      : 'border-gray-200 hover:border-[#43CD66]'
                  }`}
                  onClick={() => setListingType('auction')}
                >
                  <CardContent className="p-6 text-center">
                    <Gavel className={`w-12 h-12 mx-auto mb-3 transition-colors duration-200 ${
                      listingType === 'auction' ? 'text-[#43CD66]' : 'text-gray-600'
                    }`} />
                    <h4 className="font-semibold text-gray-900 mb-2">Create Auction Listing</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Create time-based auctions for competitive bidding
                    </p>
                    {listingType === 'auction' && (
                      <CheckCircle2 className="w-5 h-5 mx-auto text-[#43CD66]" />
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Step 2: Choose Creation Method */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  How would you like to create your listing?
                </h3>
                <p className="text-gray-600">
                  Choose your preferred creation method
                </p>
              </div>
              
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Manual Creation */}
                <Card 
                  className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                    creationMethod === 'manual' 
                      ? 'ring-2 ring-[#43CD66] bg-[#43CD66]/5' 
                      : 'border-gray-200 hover:border-[#43CD66]'
                  }`}
                  onClick={() => setCreationMethod('manual')}
                >
                  <CardContent className="p-6 text-center">
                    <Package className={`w-12 h-12 mx-auto mb-3 transition-colors duration-200 ${
                      creationMethod === 'manual' ? 'text-[#43CD66]' : 'text-gray-600'
                    }`} />
                    <h4 className="font-semibold text-gray-900 mb-2">Create Manually</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Fill out the listing form step by step
                    </p>
                    {creationMethod === 'manual' && (
                      <CheckCircle2 className="w-5 h-5 mx-auto text-[#43CD66]" />
                    )}
                  </CardContent>
                </Card>

                {/* Upload Excel */}
                <Card 
                  className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                    creationMethod === 'upload' 
                      ? 'ring-2 ring-[#43CD66] bg-[#43CD66]/5' 
                      : 'border-gray-200 hover:border-[#43CD66]'
                  }`}
                  onClick={() => setCreationMethod('upload')}
                >
                  <CardContent className="p-6 text-center">
                    <Upload className={`w-12 h-12 mx-auto mb-3 transition-colors duration-200 ${
                      creationMethod === 'upload' ? 'text-[#43CD66]' : 'text-gray-600'
                    }`} />
                    <h4 className="font-semibold text-gray-900 mb-2">Upload Excel</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Upload an Excel file to create multiple listings
                    </p>
                    {creationMethod === 'upload' && (
                      <CheckCircle2 className="w-5 h-5 mx-auto text-[#43CD66]" />
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>

          {currentStep === 1 ? (
            <Button
              onClick={handleNext}
              disabled={!canProceed}
              className="flex items-center gap-2 bg-[#43CD66] hover:bg-[#43CD66]/90"
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={handleFinish}
              disabled={!canProceed}
              className="flex items-center gap-2 bg-[#43CD66] hover:bg-[#43CD66]/90"
            >
              Create Listing
              <CheckCircle2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}; 