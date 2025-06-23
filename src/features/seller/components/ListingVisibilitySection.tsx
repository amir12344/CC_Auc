import React from 'react';
import { UseFormRegister, UseFormSetValue, FieldErrors } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { Label } from '@/src/components/ui/label';
import { Checkbox } from '@/src/components/ui/checkbox';
import { Input } from '@/src/components/ui/input';
import { Eye, Users, MapPin } from 'lucide-react';

interface ListingVisibilitySectionProps {
  register: UseFormRegister<any>;
  setValue: UseFormSetValue<any>;
  errors: FieldErrors<any>;
  getErrorMessage: (error: any) => string | undefined;
}

const BUYER_SEGMENTS = [
  'Amazon Resellers',
  'eBay Sellers', 
  'Poshmark Sellers',
  'Live Shopping Sellers',
  'Bin Stores',
  'Discount Chains',
  'Off-Price Retailers',
  'Traditional Liquidators',
  'Mom & Pop Stores',
  'Other'
];

export const ListingVisibilitySection: React.FC<ListingVisibilitySectionProps> = ({
  register,
  setValue,
  errors,
  getErrorMessage,
}) => {
  const [isPublic, setIsPublic] = React.useState(true);
  const [isPrivate, setIsPrivate] = React.useState(false);
  const [selectedBuyerSegments, setSelectedBuyerSegments] = React.useState<string[]>([]);

  const handlePublicChange = (checked: boolean) => {
    setIsPublic(checked);
    setValue('visibilityPublic', checked);
    
    // If public is checked, uncheck private
    if (checked) {
      setIsPrivate(false);
      setValue('visibilityPrivate', false);
      // Clear buyer segments
      setSelectedBuyerSegments([]);
      setValue('buyerTargeting', []);
    }
  };

  const handlePrivateChange = (checked: boolean) => {
    setIsPrivate(checked);
    setValue('visibilityPrivate', checked);
    
    // If private is checked, uncheck public
    if (checked) {
      setIsPublic(false);
      setValue('visibilityPublic', false);
    } else {
      // If private is unchecked, clear buyer segments
      setSelectedBuyerSegments([]);
      setValue('buyerTargeting', []);
    }
  };

  const handleBuyerSegmentChange = (segment: string, checked: boolean) => {
    let updatedSegments: string[];
    
    if (checked) {
      updatedSegments = [...selectedBuyerSegments, segment];
    } else {
      updatedSegments = selectedBuyerSegments.filter(s => s !== segment);
    }
    
    setSelectedBuyerSegments(updatedSegments);
    setValue('buyerTargeting', updatedSegments);
  };

  return (
    <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Eye className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <CardTitle className="text-xl font-semibold text-gray-900">
              Listing Visibility
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
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
            <Badge variant="destructive" className="text-xs">Required</Badge>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
              <Checkbox
                id="visibility-public"
                checked={isPublic}
                onCheckedChange={handlePublicChange}
              />
              <div className="flex-1">
                <Label htmlFor="visibility-public" className="font-medium text-gray-900 cursor-pointer">
                  Public (all buyers on Commerce Central can view)
                </Label>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
              <Checkbox
                id="visibility-private"
                checked={isPrivate}
                onCheckedChange={handlePrivateChange}
              />
              <div className="flex-1">
                <Label htmlFor="visibility-private" className="font-medium text-gray-900 cursor-pointer">
                  Private (only visible to selected segments)
                </Label>
              </div>
            </div>
          </div>
          
          {getErrorMessage(errors.visibilityPublic) && (
            <p className="text-sm text-red-600">{getErrorMessage(errors.visibilityPublic)}</p>
          )}
          {getErrorMessage(errors.visibilityPrivate) && (
            <p className="text-sm text-red-600">{getErrorMessage(errors.visibilityPrivate)}</p>
          )}
        </div>

        {/* Buyer Targeting (only show if Private is selected) */}
        {isPrivate && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-600" />
              <Label className="text-base font-medium text-gray-900">
                Buyer Targeting (for Private Listings)
              </Label>
            </div>
            <p className="text-sm text-gray-600">
              Select which buyer segments can view this private listing
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {BUYER_SEGMENTS.map((segment) => (
                <div key={segment} className="flex items-center space-x-3 p-2 hover:bg-white rounded">
                  <Checkbox
                    id={`buyer-${segment}`}
                    checked={selectedBuyerSegments.includes(segment)}
                    onCheckedChange={(checked) => 
                      handleBuyerSegmentChange(segment, checked as boolean)
                    }
                  />
                  <Label 
                    htmlFor={`buyer-${segment}`} 
                    className="text-sm font-medium text-gray-700 cursor-pointer"
                  >
                    {segment}
                  </Label>
                </div>
              ))}
            </div>
            
            {selectedBuyerSegments.length > 0 && (
              <div className="mt-3">
                <p className="text-sm text-gray-600 mb-2">Selected segments:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedBuyerSegments.map((segment) => (
                    <Badge key={segment} variant="secondary" className="text-xs">
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
            <MapPin className="w-4 h-4 text-gray-600" />
            <Label className="text-base font-medium text-gray-900">
              Geographic Restrictions (optional)
            </Label>
            <Badge variant="outline" className="text-xs">Optional</Badge>
          </div>
          <p className="text-sm text-gray-600">
            Restrict bidding to specific geographic areas
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="country" className="text-sm font-medium text-gray-700">
                Country
              </Label>
              <Input
                id="country"
                placeholder="e.g., United States"
                {...register('geographicRestrictions.country')}
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="state" className="text-sm font-medium text-gray-700">
                State/Region
              </Label>
              <Input
                id="state"
                placeholder="e.g., California"
                {...register('geographicRestrictions.state')}
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="zipCode" className="text-sm font-medium text-gray-700">
                Zip Code Range
              </Label>
              <Input
                id="zipCode"
                placeholder="e.g., 90001-90210"
                {...register('geographicRestrictions.zipCode')}
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="deliveryRegion" className="text-sm font-medium text-gray-700">
                Delivery Region
              </Label>
              <Input
                id="deliveryRegion"
                placeholder="e.g., West Coast"
                {...register('geographicRestrictions.deliveryRegion')}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 
