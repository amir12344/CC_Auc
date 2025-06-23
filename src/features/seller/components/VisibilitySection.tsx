'use client';

import React from 'react';
import { UseFormRegister, UseFormSetValue, FieldErrors } from 'react-hook-form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { Separator } from '@/src/components/ui/separator';
import { FormField } from './shared/FormField';
import { Eye, Users, Globe } from 'lucide-react';

interface VisibilitySectionProps {
  register: UseFormRegister<any>;
  setValue: UseFormSetValue<any>;
  errors: FieldErrors<any>;
  getErrorMessage: (error: any) => string | undefined;
}

export function VisibilitySection({ register, setValue, errors, getErrorMessage }: VisibilitySectionProps) {
  return (
    <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
      <CardHeader className="pb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <Eye className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <CardTitle className="text-xl text-gray-900">Listing Visibility</CardTitle>
            <CardDescription>
              Control who can see and bid on your auction listing
            </CardDescription>
          </div>
          <Badge className="ml-auto bg-green-100 text-green-700 border-green-200">Optional</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        
        {/* Visibility Setting */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="font-semibold text-gray-900">Visibility Setting</h3>
            <Separator className="flex-1" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Visibility Setting" error={getErrorMessage(errors.visibilitySetting)}>
              <Select onValueChange={(value) => setValue('visibilitySetting', value)}>
                <SelectTrigger className="w-full !h-12">
                  <SelectValue placeholder="Select visibility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public - Visible to all users</SelectItem>
                  <SelectItem value="private">Private - Invitation only</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          </div>
        </div>

        {/* Buyer Targeting */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="font-semibold text-gray-900">Buyer Targeting</h3>
            <Separator className="flex-1" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <FormField label="Amazon Resellers" error={getErrorMessage(errors.amazonResellers)}>
              <Select onValueChange={(value) => setValue('amazonResellers', value)}>
                <SelectTrigger className="w-full !h-12">
                  <SelectValue placeholder="Target Amazon sellers?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes - Target Amazon Resellers</SelectItem>
                  <SelectItem value="no">No - Exclude Amazon Resellers</SelectItem>
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="eBay Sellers" error={getErrorMessage(errors.ebaySellers)}>
              <Select onValueChange={(value) => setValue('ebaySellers', value)}>
                <SelectTrigger className="w-full !h-12">
                  <SelectValue placeholder="Target eBay sellers?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes - Target eBay Sellers</SelectItem>
                  <SelectItem value="no">No - Exclude eBay Sellers</SelectItem>
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="Liquidation Resellers" error={getErrorMessage(errors.liquidationResellers)}>
              <Select onValueChange={(value) => setValue('liquidationResellers', value)}>
                <SelectTrigger className="w-full !h-12">
                  <SelectValue placeholder="Target liquidation resellers?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes - Target Liquidation Resellers</SelectItem>
                  <SelectItem value="no">No - Exclude Liquidation Resellers</SelectItem>
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="Export Buyers" error={getErrorMessage(errors.exportBuyers)}>
              <Select onValueChange={(value) => setValue('exportBuyers', value)}>
                <SelectTrigger className="w-full !h-12">
                  <SelectValue placeholder="Target export buyers?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes - Target Export Buyers</SelectItem>
                  <SelectItem value="no">No - Exclude Export Buyers</SelectItem>
                </SelectContent>
              </Select>
            </FormField>

          </div>
        </div>

        {/* Geographic Restrictions */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="font-semibold text-gray-900">Geographic Restrictions</h3>
            <Separator className="flex-1" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <FormField label="Geographic Restrictions" error={getErrorMessage(errors.geographicRestrictions)}>
              <Select onValueChange={(value) => setValue('geographicRestrictions', value)}>
                <SelectTrigger className="w-full !h-12">
                  <SelectValue placeholder="Select geographic restrictions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Restrictions - Worldwide</SelectItem>
                  <SelectItem value="us_only">US Only</SelectItem>
                  <SelectItem value="north_america">North America Only</SelectItem>
                  <SelectItem value="custom">Custom Geographic Restrictions</SelectItem>
                </SelectContent>
              </Select>
            </FormField>

          </div>
        </div>

      </CardContent>
    </Card>
  );
}
