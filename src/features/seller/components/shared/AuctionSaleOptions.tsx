'use client';

import React from 'react';
import { UseFormRegister, FieldErrors, UseFormWatch, UseFormSetValue } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Label } from '@/src/components/ui/label';
import { Input } from '@/src/components/ui/input';
import { Checkbox } from '@/src/components/ui/checkbox';
import { Badge } from '@/src/components/ui/badge';
import { Gavel, DollarSign, Clock } from 'lucide-react';

interface AuctionSaleOptionsProps {
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  watch: UseFormWatch<any>;
  setValue: UseFormSetValue<any>;
  getErrorMessage: (error: any) => string | undefined;
}

/**
 * Auction-specific sale options component
 * Handles bidding settings and auction duration
 */
export const AuctionSaleOptions: React.FC<AuctionSaleOptionsProps> = ({
  register,
  errors,
  watch,
  setValue,
  getErrorMessage,
}) => {
  return (
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
  );
}; 