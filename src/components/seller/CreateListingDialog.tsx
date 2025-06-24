'use client';

import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Gavel,
  Loader2,
  Package,
  Store,
  Upload,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent } from '@/src/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/src/components/ui/dialog';

interface CreateListingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ListingType = 'catalog' | 'auction' | null;
type CreationMethod = 'manual' | 'upload' | null;

/**
 * Progress indicator component for the listing creation steps
 */
const ProgressIndicator = ({
  currentStep,
  isPending,
}: {
  currentStep: number;
  isPending: boolean;
}) => (
  <div className="flex items-center justify-center space-x-4 py-4">
    <div className="flex items-center">
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-full font-medium text-sm ${currentStep >= 1
          ? 'bg-[#43CD66] text-white'
          : 'bg-gray-200 text-gray-500'
          }`}
      >
        {currentStep > 1 ? <CheckCircle2 className="h-4 w-4" /> : '1'}
      </div>
      <span className="ml-2 font-medium text-gray-700 text-sm">
        Choose Type
      </span>
    </div>
    <div
      className={`h-0.5 w-8 ${currentStep >= 2 ? 'bg-[#43CD66]' : 'bg-gray-200'}`}
    />
    <div className="flex items-center">
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-full font-medium text-sm ${currentStep >= 2
          ? 'bg-[#43CD66] text-white'
          : 'bg-gray-200 text-gray-500'
          }`}
      >
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : '2'}
      </div>
      <span className="ml-2 font-medium text-gray-700 text-sm">
        Choose Method
      </span>
    </div>
  </div>
);

/**
 * Step 1: Choose listing type component
 */
const ListingTypeStep = ({
  listingType,
  setListingType,
  isPending,
}: {
  listingType: ListingType;
  setListingType: (type: ListingType) => void;
  isPending: boolean;
}) => (
  <div className="space-y-4">
    <div className="mb-6 text-center">
      <h3 className="mb-2 font-semibold text-gray-900 text-lg">
        What type of listing would you like to create?
      </h3>
      <p className="text-gray-600">Choose between catalog or auction listing</p>
    </div>

    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {/* Catalog Option */}
      <Card
        className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${listingType === 'catalog'
          ? 'bg-[#43CD66]/5 ring-2 ring-[#43CD66]'
          : 'border-gray-200 hover:border-[#43CD66]'
          } ${isPending ? 'pointer-events-none opacity-50' : ''}`}
        onClick={() => !isPending && setListingType('catalog')}
      >
        <CardContent className="p-6 text-center">
          <Store
            className={`mx-auto mb-3 h-12 w-12 transition-colors duration-200 ${listingType === 'catalog' ? 'text-[#43CD66]' : 'text-gray-600'
              }`}
          />
          <h4 className="mb-2 font-semibold text-gray-900">
            Create Catalog Listing
          </h4>
          <p className="mb-3 text-gray-600 text-sm">
            List products in the catalog for buyers to browse
          </p>
          {listingType === 'catalog' && (
            <CheckCircle2 className="mx-auto h-5 w-5 text-[#43CD66]" />
          )}
        </CardContent>
      </Card>

      {/* Auction Option */}
      <Card
        className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${listingType === 'auction'
          ? 'bg-[#43CD66]/5 ring-2 ring-[#43CD66]'
          : 'border-gray-200 hover:border-[#43CD66]'
          } ${isPending ? 'pointer-events-none opacity-50' : ''}`}
        onClick={() => !isPending && setListingType('auction')}
      >
        <CardContent className="p-6 text-center">
          <Gavel
            className={`mx-auto mb-3 h-12 w-12 transition-colors duration-200 ${listingType === 'auction' ? 'text-[#43CD66]' : 'text-gray-600'
              }`}
          />
          <h4 className="mb-2 font-semibold text-gray-900">
            Create Auction Listing
          </h4>
          <p className="mb-3 text-gray-600 text-sm">
            Create time-based auctions for competitive bidding
          </p>
          {listingType === 'auction' && (
            <CheckCircle2 className="mx-auto h-5 w-5 text-[#43CD66]" />
          )}
        </CardContent>
      </Card>
    </div>
  </div>
);

/**
 * Step 2: Choose creation method component
 */
const CreationMethodStep = ({
  creationMethod,
  setCreationMethod,
  isPending,
}: {
  creationMethod: CreationMethod;
  setCreationMethod: (method: CreationMethod) => void;
  isPending: boolean;
}) => (
  <div className="space-y-4">
    <div className="mb-6 text-center">
      <h3 className="mb-2 font-semibold text-gray-900 text-lg">
        How would you like to create your listing?
      </h3>
      <p className="text-gray-600">Choose your preferred creation method</p>
      {isPending && (
        <div className="mt-4 flex items-center justify-center text-[#43CD66]">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          <span className="font-medium text-sm">
            Navigating to the form...
          </span>
        </div>
      )}
    </div>

    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {/* Manual Creation */}
      <Card
        className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${creationMethod === 'manual'
          ? 'bg-[#43CD66]/5 ring-2 ring-[#43CD66]'
          : 'border-gray-200 hover:border-[#43CD66]'
          } ${isPending ? 'pointer-events-none opacity-50' : ''}`}
        onClick={() => !isPending && setCreationMethod('manual')}
      >
        <CardContent className="p-6 text-center">
          <Package
            className={`mx-auto mb-3 h-12 w-12 transition-colors duration-200 ${creationMethod === 'manual' ? 'text-[#43CD66]' : 'text-gray-600'
              }`}
          />
          <h4 className="mb-2 font-semibold text-gray-900">Create Manually</h4>
          <p className="mb-3 text-gray-600 text-sm">
            Fill out the listing form step by step
          </p>
          {creationMethod === 'manual' && !isPending && (
            <CheckCircle2 className="mx-auto h-5 w-5 text-[#43CD66]" />
          )}
          {creationMethod === 'manual' && isPending && (
            <Loader2 className="mx-auto h-5 w-5 animate-spin text-[#43CD66]" />
          )}
        </CardContent>
      </Card>

      {/* Upload Excel */}
      <Card
        className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${creationMethod === 'upload'
          ? 'bg-[#43CD66]/5 ring-2 ring-[#43CD66]'
          : 'border-gray-200 hover:border-[#43CD66]'
          } ${isPending ? 'pointer-events-none opacity-50' : ''}`}
        onClick={() => !isPending && setCreationMethod('upload')}
      >
        <CardContent className="p-6 text-center">
          <Upload
            className={`mx-auto mb-3 h-12 w-12 transition-colors duration-200 ${creationMethod === 'upload' ? 'text-[#43CD66]' : 'text-gray-600'
              }`}
          />
          <h4 className="mb-2 font-semibold text-gray-900">Upload Excel</h4>
          <p className="mb-3 text-gray-600 text-sm">
            Upload an Excel file to create multiple listings
          </p>
          {creationMethod === 'upload' && !isPending && (
            <CheckCircle2 className="mx-auto h-5 w-5 text-[#43CD66]" />
          )}
          {creationMethod === 'upload' && isPending && (
            <Loader2 className="mx-auto h-5 w-5 animate-spin text-[#43CD66]" />
          )}
        </CardContent>
      </Card>
    </div>
  </div>
);

/**
 * Navigation buttons component
 */
const NavigationButtons = ({
  currentStep,
  canProceed,
  isPending,
  onBack,
  onNext,
  onFinish,
}: {
  currentStep: number;
  canProceed: boolean;
  isPending: boolean;
  onBack: () => void;
  onNext: () => void;
  onFinish: () => void;
}) => (
  <div className="flex justify-between pt-4">
    <Button
      className="flex items-center gap-2"
      disabled={currentStep === 1 || isPending}
      onClick={onBack}
      variant="outline"
    >
      <ArrowLeft className="h-4 w-4" />
      Back
    </Button>

    {currentStep === 1 ? (
      <Button
        className="flex items-center gap-2 bg-[#43CD66] hover:bg-[#43CD66]/90"
        disabled={!canProceed || isPending}
        onClick={onNext}
      >
        Next
        <ArrowRight className="h-4 w-4" />
      </Button>
    ) : (
      <Button
        className="flex items-center gap-2 bg-[#43CD66] hover:bg-[#43CD66]/90"
        disabled={!canProceed || isPending}
        onClick={onFinish}
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading...
          </>
        ) : (
          <>
            Create Listing
            <CheckCircle2 className="h-4 w-4" />
          </>
        )}
      </Button>
    )}
  </div>
);

/**
 * Generate the path for listing creation
 */
const generateListingPath = (
  listingType: ListingType,
  creationMethod: CreationMethod
): string => {
  if (!(listingType && creationMethod)) {
    return '';
  }

  const pathMap = {
    auction: {
      manual: '/seller/listing/create/auction/manual',
      upload: '/seller/listing/create/auction/upload',
    },
    catalog: {
      manual: '/seller/listing/create/catalog/manual',
      upload: '/seller/listing/create/catalog/upload',
    },
  };

  const typeMap = pathMap[listingType];
  if (typeMap && creationMethod in typeMap) {
    return typeMap[creationMethod];
  }

  return '';
};

export const CreateListingDialog = ({
  open,
  onOpenChange,
}: CreateListingDialogProps) => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [listingType, setListingType] = useState<ListingType>(null);
  const [creationMethod, setCreationMethod] = useState<CreationMethod>(null);
  const [isPending, startTransition] = useTransition();

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
    const path = generateListingPath(listingType, creationMethod);
    if (path) {
      startTransition(() => {
        onOpenChange(false);
        resetDialog();
        router.push(path);
      });
    }
  };

  const canProceed =
    currentStep === 1 ? listingType !== null : creationMethod !== null;

  return (
    <Dialog
      onOpenChange={(newOpen) => {
        onOpenChange(newOpen);
        if (!newOpen) {
          resetDialog();
        }
      }}
      open={open}
    >
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Create New Listing</DialogTitle>
          <DialogDescription className="text-gray-600">
            Follow these steps to create your listing
          </DialogDescription>
        </DialogHeader>

        <ProgressIndicator currentStep={currentStep} isPending={isPending} />

        <div className="py-6">
          {currentStep === 1 && (
            <ListingTypeStep
              isPending={isPending}
              listingType={listingType}
              setListingType={setListingType}
            />
          )}

          {currentStep === 2 && (
            <CreationMethodStep
              creationMethod={creationMethod}
              isPending={isPending}
              setCreationMethod={setCreationMethod}
            />
          )}
        </div>

        <NavigationButtons
          canProceed={canProceed}
          currentStep={currentStep}
          isPending={isPending}
          onBack={handleBack}
          onFinish={handleFinish}
          onNext={handleNext}
        />
      </DialogContent>
    </Dialog>
  );
};
