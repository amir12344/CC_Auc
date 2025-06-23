'use client';

import React from 'react';
import { UseFormRegister, UseFormSetValue, FieldErrors } from 'react-hook-form';
import { Input } from '@/src/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { Separator } from '@/src/components/ui/separator';
import { Checkbox } from '@/src/components/ui/checkbox';
import { Label } from '@/src/components/ui/label';
import { FormField } from './shared/FormField';
import { Gavel, Clock, DollarSign, Shield } from 'lucide-react';

interface SaleOptionsSectionProps {
  register: UseFormRegister<any>;
  setValue: UseFormSetValue<any>;
  errors: FieldErrors<any>;
  getErrorMessage: (error: any) => string | undefined;
}

export function SaleOptionsSection({ register, setValue, errors, getErrorMessage }: SaleOptionsSectionProps) {
  return (
    <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
      <CardHeader className="pb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Gavel className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <CardTitle className="text-xl text-gray-900">Sale Options</CardTitle>
            <CardDescription>
              Configure auction settings and bidding requirements
            </CardDescription>
          </div>
          <Badge className="ml-auto bg-red-100 text-red-700 border-red-200">Required</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        
        {/* Starting Bid */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="font-semibold text-gray-900">Starting Bid*</h3>
            <Badge className="bg-red-100 text-red-700 border-red-200 text-xs">Required</Badge>
          </div>
          
          <FormField label="Starting Bid" required error={getErrorMessage(errors.startingBid)}>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <Input 
                {...register('startingBid', { valueAsNumber: true })} 
                type="number" 
                step="0.01" 
                placeholder="0.00"
                className="pl-8 h-11"
              />
            </div>
          </FormField>
        </div>

        {/* Auction Duration */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="font-semibold text-gray-900">Auction Duration*</h3>
            <Badge className="bg-red-100 text-red-700 border-red-200 text-xs">Required</Badge>
          </div>
          
          <FormField label="Fixed (1-X days)" required error={getErrorMessage(errors.auctionDuration)}>
            <Select onValueChange={(value) => setValue('auctionDuration', value)}>
              <SelectTrigger className="w-full !h-12">
                <SelectValue placeholder="Select auction duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 Day</SelectItem>
                <SelectItem value="2">2 Days</SelectItem>
                <SelectItem value="3">3 Days</SelectItem>
                <SelectItem value="4">4 Days</SelectItem>
                <SelectItem value="5">5 Days</SelectItem>
                <SelectItem value="6">6 Days</SelectItem>
                <SelectItem value="7">7 Days</SelectItem>
                <SelectItem value="8">8 Days</SelectItem>
                <SelectItem value="9">9 Days</SelectItem>
                <SelectItem value="10">10 Days</SelectItem>
                <SelectItem value="14">14 Days</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
        </div>

        {/* Minimum Price / Reserve Price (aka "Buy Now" price) */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="font-semibold text-gray-900">Minimum Price / Reserve Price* (aka "Buy Now" price)</h3>
            <Badge className="bg-red-100 text-red-700 border-red-200 text-xs">Required</Badge>
          </div>
          
          <FormField label="Minimum Price / Reserve Price" required error={getErrorMessage(errors.reservePrice)}>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <Input 
                {...register('reservePrice', { valueAsNumber: true })} 
                type="number" 
                step="0.01" 
                placeholder="0.00"
                className="pl-8 h-11"
              />
            </div>
          </FormField>
        </div>

        {/* Bidding Requirements */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="font-semibold text-gray-900">Bidding Requirements</h3>
          </div>
          
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
            <p className="text-sm text-gray-700 mb-3">Optional fields: Buyer rating, business verification, etc.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="require-buyer-rating"
                  onCheckedChange={(checked) => setValue('requireBuyerRating', checked)}
                />
                <Label htmlFor="require-buyer-rating" className="text-sm font-medium text-gray-700">
                  Require minimum buyer rating
                </Label>
              </div>
              
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="require-business-verification"
                  onCheckedChange={(checked) => setValue('requireBusinessVerification', checked)}
                />
                <Label htmlFor="require-business-verification" className="text-sm font-medium text-gray-700">
                  Require business verification
                </Label>
              </div>
              
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="require-deposit"
                  onCheckedChange={(checked) => setValue('requireDeposit', checked)}
                />
                <Label htmlFor="require-deposit" className="text-sm font-medium text-gray-700">
                  Require security deposit
                </Label>
              </div>
              
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="require-prequalification"
                  onCheckedChange={(checked) => setValue('requirePrequalification', checked)}
                />
                <Label htmlFor="require-prequalification" className="text-sm font-medium text-gray-700">
                  Require pre-qualification
                </Label>
              </div>
            </div>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}
