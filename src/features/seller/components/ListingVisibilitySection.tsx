import React from "react";
import { FieldErrors, UseFormRegister, UseFormSetValue } from "react-hook-form";

import { Eye, MapPin, Users } from "lucide-react";

import { Badge } from "@/src/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Checkbox } from "@/src/components/ui/checkbox";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";

interface ListingVisibilitySectionProps {
  register: UseFormRegister<any>;
  setValue: UseFormSetValue<any>;
  errors: FieldErrors<any>;
  getErrorMessage: (error: any) => string | undefined;
}

const BUYER_SEGMENTS = [
  "Amazon Resellers",
  "eBay Sellers",
  "Poshmark Sellers",
  "Live Shopping Sellers",
  "Bin Stores",
  "Discount Chains",
  "Off-Price Retailers",
  "Traditional Liquidators",
  "Mom & Pop Stores",
  "Other",
];

export const ListingVisibilitySection: React.FC<
  ListingVisibilitySectionProps
> = ({ register, setValue, errors, getErrorMessage }) => {
  const [isPublic, setIsPublic] = React.useState(true);
  const [isPrivate, setIsPrivate] = React.useState(false);
  const [selectedBuyerSegments, setSelectedBuyerSegments] = React.useState<
    string[]
  >([]);

  const handlePublicChange = (checked: boolean) => {
    setIsPublic(checked);
    setValue("visibilityPublic", checked);

    // If public is checked, uncheck private
    if (checked) {
      setIsPrivate(false);
      setValue("visibilityPrivate", false);
      // Clear buyer segments
      setSelectedBuyerSegments([]);
      setValue("buyerTargeting", []);
    }
  };

  const handlePrivateChange = (checked: boolean) => {
    setIsPrivate(checked);
    setValue("visibilityPrivate", checked);

    // If private is checked, uncheck public
    if (checked) {
      setIsPublic(false);
      setValue("visibilityPublic", false);
    } else {
      // If private is unchecked, clear buyer segments
      setSelectedBuyerSegments([]);
      setValue("buyerTargeting", []);
    }
  };

  const handleBuyerSegmentChange = (segment: string, checked: boolean) => {
    let updatedSegments: string[];

    if (checked) {
      updatedSegments = [...selectedBuyerSegments, segment];
    } else {
      updatedSegments = selectedBuyerSegments.filter((s) => s !== segment);
    }

    setSelectedBuyerSegments(updatedSegments);
    setValue("buyerTargeting", updatedSegments);
  };

  return (
    <Card className="border-0 bg-white/90 shadow-lg backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-purple-100 p-2">
            <Eye className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <CardTitle className="text-xl font-semibold text-gray-900">
              Listing Visibility
            </CardTitle>
            <p className="mt-1 text-sm text-gray-600">
              Control who can see and bid on your auction listing
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
            <Badge variant="destructive" className="text-xs">
              Required
            </Badge>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-3 rounded-lg border p-3 hover:bg-gray-50">
              <Checkbox
                id="visibility-public"
                checked={isPublic}
                onCheckedChange={handlePublicChange}
              />
              <div className="flex-1">
                <Label
                  htmlFor="visibility-public"
                  className="cursor-pointer font-medium text-gray-900"
                >
                  Public (all buyers on Commerce Central can view)
                </Label>
              </div>
            </div>

            <div className="flex items-center space-x-3 rounded-lg border p-3 hover:bg-gray-50">
              <Checkbox
                id="visibility-private"
                checked={isPrivate}
                onCheckedChange={handlePrivateChange}
              />
              <div className="flex-1">
                <Label
                  htmlFor="visibility-private"
                  className="cursor-pointer font-medium text-gray-900"
                >
                  Private (only visible to selected segments)
                </Label>
              </div>
            </div>
          </div>

          {getErrorMessage(errors.visibilityPublic) && (
            <p className="text-sm text-red-600">
              {getErrorMessage(errors.visibilityPublic)}
            </p>
          )}
          {getErrorMessage(errors.visibilityPrivate) && (
            <p className="text-sm text-red-600">
              {getErrorMessage(errors.visibilityPrivate)}
            </p>
          )}
        </div>

        {/* Buyer Targeting (only show if Private is selected) */}
        {isPrivate && (
          <div className="space-y-4 rounded-lg border bg-gray-50 p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-600" />
              <Label className="text-base font-medium text-gray-900">
                Buyer Targeting (for Private Listings)
              </Label>
            </div>
            <p className="text-sm text-gray-600">
              Select which buyer segments can view this private listing
            </p>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {BUYER_SEGMENTS.map((segment) => (
                <div
                  key={segment}
                  className="flex items-center space-x-3 rounded p-2 hover:bg-white"
                >
                  <Checkbox
                    id={`buyer-${segment}`}
                    checked={selectedBuyerSegments.includes(segment)}
                    onCheckedChange={(checked) =>
                      handleBuyerSegmentChange(segment, checked as boolean)
                    }
                  />
                  <Label
                    htmlFor={`buyer-${segment}`}
                    className="cursor-pointer text-sm font-medium text-gray-700"
                  >
                    {segment}
                  </Label>
                </div>
              ))}
            </div>

            {selectedBuyerSegments.length > 0 && (
              <div className="mt-3">
                <p className="mb-2 text-sm text-gray-600">Selected segments:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedBuyerSegments.map((segment) => (
                    <Badge
                      key={segment}
                      variant="secondary"
                      className="text-xs"
                    >
                      {segment}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Geographic Restrictions */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gray-600" />
            <Label className="text-base font-medium text-gray-900">
              Geographic Restrictions (optional)
            </Label>
            <Badge variant="outline" className="text-xs">
              Optional
            </Badge>
          </div>
          <p className="text-sm text-gray-600">
            Restrict bidding to specific geographic areas
          </p>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label
                htmlFor="country"
                className="text-sm font-medium text-gray-700"
              >
                Country
              </Label>
              <Input
                id="country"
                placeholder="e.g., United States"
                {...register("geographicRestrictions.country")}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="state"
                className="text-sm font-medium text-gray-700"
              >
                State/Region
              </Label>
              <Input
                id="state"
                placeholder="e.g., California"
                {...register("geographicRestrictions.state")}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="zipCode"
                className="text-sm font-medium text-gray-700"
              >
                Zip Code Range
              </Label>
              <Input
                id="zipCode"
                placeholder="e.g., 90001-90210"
                {...register("geographicRestrictions.zipCode")}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="deliveryRegion"
                className="text-sm font-medium text-gray-700"
              >
                Delivery Region
              </Label>
              <Input
                id="deliveryRegion"
                placeholder="e.g., West Coast"
                {...register("geographicRestrictions.deliveryRegion")}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
