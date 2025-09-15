"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { CheckCircle2, Gavel, Loader2, Package, Store } from "lucide-react";

import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";

interface CreateListingDialogProps {
  open: boolean;
  onOpenChangeAction: (open: boolean) => void;
}

type ListingType = "catalog" | "auction" | "lotListings" | null;

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
      <h3 className="mb-2 text-lg font-semibold text-gray-900">
        What type of listing would you like to create?
      </h3>
    </div>

    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {/* Catalog Option */}
      <Card
        className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
          listingType === "catalog"
            ? "bg-[#43CD66]/5 ring-2 ring-[#43CD66]"
            : "border-gray-200 hover:border-[#43CD66]"
        } ${isPending ? "pointer-events-none opacity-50" : ""}`}
        onClick={() => !isPending && setListingType("catalog")}
      >
        <CardContent className="flex min-h-[180px] flex-col items-center justify-center p-6 text-center">
          <Store
            className={`mx-auto mb-3 h-12 w-12 transition-colors duration-200 ${
              listingType === "catalog" ? "text-[#43CD66]" : "text-gray-600"
            }`}
          />
          <h4 className="mb-2 font-semibold text-gray-900">
            Create Catalog Listing
          </h4>
          <p className="mb-3 text-sm text-gray-600">
            List products in the catalog for buyers to browse
          </p>
          {listingType === "catalog" && (
            <CheckCircle2 className="mx-auto h-5 w-5 text-[#43CD66]" />
          )}
        </CardContent>
      </Card>

      {/* Auction Option */}
      <Card
        className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
          listingType === "auction"
            ? "bg-[#43CD66]/5 ring-2 ring-[#43CD66]"
            : "border-gray-200 hover:border-[#43CD66]"
        } ${isPending ? "pointer-events-none opacity-50" : ""}`}
        onClick={() => !isPending && setListingType("auction")}
      >
        <CardContent className="flex min-h-[180px] flex-col items-center justify-center p-6 text-center">
          <Gavel
            className={`mx-auto mb-3 h-12 w-12 transition-colors duration-200 ${
              listingType === "auction" ? "text-[#43CD66]" : "text-gray-600"
            }`}
          />
          <h4 className="mb-2 font-semibold text-gray-900">
            Create Auction Listing
          </h4>
          <p className="mb-3 text-sm text-gray-600">
            Create time-based auctions for competitive bidding
          </p>
          {listingType === "auction" && (
            <CheckCircle2 className="mx-auto h-5 w-5 text-[#43CD66]" />
          )}
        </CardContent>
      </Card>

      {/* Lot Listing Option */}
      <Card
        className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
          listingType === "lotListings"
            ? "bg-[#43CD66]/5 ring-2 ring-[#43CD66]"
            : "border-gray-200 hover:border-[#43CD66]"
        } ${isPending ? "pointer-events-none opacity-50" : ""}`}
        onClick={() => !isPending && setListingType("lotListings")}
      >
        <CardContent className="flex min-h-[180px] flex-col items-center justify-center p-6 text-center">
          <Package
            className={`mx-auto mb-3 h-12 w-12 transition-colors duration-200 ${
              listingType === "lotListings" ? "text-[#43CD66]" : "text-gray-600"
            }`}
          />
          <h4 className="mb-2 font-semibold text-gray-900">
            Create Lot Listing
          </h4>
          <p className="mb-3 text-sm text-gray-600">
            Create detailed lot listing
          </p>
          {listingType === "lotListings" && (
            <CheckCircle2 className="mx-auto h-5 w-5 text-[#43CD66]" />
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
  canProceed,
  isPending,
  onFinish,
}: {
  canProceed: boolean;
  isPending: boolean;
  onFinish: () => void;
}) => (
  <div className="flex justify-end pt-4">
    <Button
      className="bg-[#43CD66] hover:bg-[#43CD66]/90"
      disabled={!canProceed || isPending}
      onClick={onFinish}
    >
      {isPending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Taking you to the listing upload page...
        </>
      ) : (
        "Create Listing"
      )}
    </Button>
  </div>
);

/**
 * Generate the path for listing creation (always uses upload/excel method)
 */
const generateListingPath = (listingType: ListingType): string => {
  if (!listingType) {
    return "";
  }

  const pathMap = {
    auction: "/seller/listing/create/auction/upload",
    catalog: "/seller/listing/create/catalog/upload",
    lotListings: "/seller/listing/create/lotListings/upload",
  } as const;

  return pathMap[listingType] || "";
};

export const CreateListingDialog = ({
  open,
  onOpenChangeAction,
}: CreateListingDialogProps) => {
  const router = useRouter();
  const [listingType, setListingType] = useState<ListingType>(null);
  const [isPending, startTransition] = useTransition();

  const resetDialog = () => {
    setListingType(null);
  };

  const handleFinish = () => {
    const path = generateListingPath(listingType);

    if (path) {
      startTransition(() => {
        onOpenChangeAction(false);
        resetDialog();
        router.push(path);
      });
    } else {
      console.error("No path generated for listing type:", listingType);
    }
  };

  const canProceed = listingType !== null;

  return (
    <Dialog
      onOpenChange={(newOpen) => {
        onOpenChangeAction(newOpen);
        if (!newOpen) {
          resetDialog();
        }
      }}
      open={open}
    >
      <DialogContent className="max-h-[90vh] w-[95vw] overflow-y-auto sm:max-w-[720px] md:max-w-[900px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Create New Listing</DialogTitle>
          <DialogDescription className="text-gray-600">
            Choose your listing type to get started with Excel upload
          </DialogDescription>
        </DialogHeader>

        <div>
          <ListingTypeStep
            isPending={isPending}
            listingType={listingType}
            setListingType={setListingType}
          />
        </div>

        <NavigationButtons
          canProceed={canProceed}
          isPending={isPending}
          onFinish={handleFinish}
        />
      </DialogContent>
    </Dialog>
  );
};
