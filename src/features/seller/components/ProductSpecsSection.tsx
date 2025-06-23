'use client';

import React, { useState } from 'react';
import { UseFormRegister, UseFormSetValue, FieldErrors } from 'react-hook-form';
import { Input } from '@/src/components/ui/input';
import { Textarea } from '@/src/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { Separator } from '@/src/components/ui/separator';
import { Button } from '@/src/components/ui/button';
import { Calendar } from '@/src/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/src/components/ui/popover';
import { FormField } from './shared/FormField';
import { Settings, Package2, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/src/lib/utils';

interface ProductSpecsSectionProps {
  register: UseFormRegister<any>;
  setValue: UseFormSetValue<any>;
  errors: FieldErrors<any>;
  getErrorMessage: (error: any) => string | undefined;
}

export function ProductSpecsSection({ register, setValue, errors, getErrorMessage }: ProductSpecsSectionProps) {
  const [date, setDate] = useState<Date>();

  return (
    <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
      <CardHeader className="pb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Settings className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <CardTitle className="text-xl text-gray-900">Product Specs</CardTitle>
            <CardDescription>
              Detailed product specifications and lot information
            </CardDescription>
          </div>
          <Badge className="ml-auto bg-yellow-100 text-yellow-700 border-yellow-200">Mixed</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        
        {/* Resale Restrictions */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="font-semibold text-gray-900">Resale Restrictions</h3>
            <Separator className="flex-1" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Resale Restrictions Options */}
            <FormField label="Resale Restrictions" error={getErrorMessage(errors.resaleRestrictions)}>
              <Select onValueChange={(value) => setValue('resaleRestrictions', value)}>
                <SelectTrigger className="w-full !h-12">
                  <SelectValue placeholder="Select restrictions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="delabeling_required">Delabeling Required</SelectItem>
                  <SelectItem value="no_exporting">No Exporting</SelectItem>
                  <SelectItem value="amazon_gated">Amazon gated</SelectItem>
                </SelectContent>
              </Select>
            </FormField>

            {/* Expiration Date (if applicable) */}
            <FormField label="Expiration Date" error={getErrorMessage(errors.expirationDate)}>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "h-11 w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(selectedDate) => {
                      setDate(selectedDate);
                      if (selectedDate) {
                        setValue('expirationDate', format(selectedDate, 'yyyy-MM-dd'));
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <p className="text-xs text-gray-500 mt-1">If applicable</p>
            </FormField>

            {/* Warranty Info (if applicable) */}
            <FormField label="Warranty Info" error={getErrorMessage(errors.warrantyInfo)}>
              <Input 
                {...register('warrantyInfo')} 
                placeholder="Enter warranty information" 
                className="h-11" 
              />
              <p className="text-xs text-gray-500 mt-1">If applicable</p>
            </FormField>

          </div>
        </div>

        {/* Unit & Lot Packaging */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="font-semibold text-gray-900">Packaging Information</h3>
            <Separator className="flex-1" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Unit Packaging Type* */}
            <FormField label="Unit Packaging Type" required error={getErrorMessage(errors.unitPackagingType)}>
              <Select onValueChange={(value) => setValue('unitPackagingType', value)}>
                <SelectTrigger className="w-full !h-12">
                  <SelectValue placeholder="Select packaging type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="retail_box">Retail Box</SelectItem>
                  <SelectItem value="bulk_box">Bulk Box</SelectItem>
                  <SelectItem value="polybag">Polybag</SelectItem>
                  <SelectItem value="shrink_wrap">Shrink Wrap</SelectItem>
                  <SelectItem value="loose">Loose</SelectItem>
                  <SelectItem value="display">Display</SelectItem>
                  <SelectItem value="pallet">Pallet</SelectItem>
                  <SelectItem value="case">Case</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </FormField>

          </div>
        </div>

        {/* Lot Condition Details */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="font-semibold text-gray-900">Lot Condition Details</h3>
            <Separator className="flex-1" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Lot Condition* */}
            <FormField label="Lot Condition" required error={getErrorMessage(errors.lotCondition)}>
              <Input 
                {...register('lotCondition')} 
                placeholder="Enter lot condition" 
                className="h-11" 
              />
            </FormField>

            {/* Lot Cosmetic Condition */}
            <FormField label="Lot Cosmetic Condition" error={getErrorMessage(errors.lotCosmeticCondition)}>
              <Input 
                {...register('lotCosmeticCondition')} 
                placeholder="Enter cosmetic condition" 
                className="h-11" 
              />
            </FormField>

            {/* Lot Accessories */}
            <FormField label="Lot Accessories" error={getErrorMessage(errors.lotAccessories)}>
              <Input 
                {...register('lotAccessories')} 
                placeholder="Enter accessories information" 
                className="h-11" 
              />
            </FormField>

            {/* Inspection Status */}
            <FormField label="Inspection Status" error={getErrorMessage(errors.inspectionStatus)}>
              <Input 
                {...register('inspectionStatus')} 
                placeholder="Enter inspection status" 
                className="h-11" 
              />
            </FormField>

          </div>
        </div>

        {/* Derived from Manifest Fields */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="font-semibold text-gray-900">Lot Totals</h3>
            <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs">Required</Badge>
            <Separator className="flex-1" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Lot ex-Retail (Total Retail Value)* - Derived from Manifest */}
            <FormField label="Lot ex-Retail (Total Retail Value)" required error={getErrorMessage(errors.lotExRetailValue)}>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <Input 
                  {...register('lotExRetailValue', { valueAsNumber: true })} 
                  type="number" 
                  step="0.01" 
                  placeholder="Derived from Manifest"
                  className="pl-8 h-11 bg-blue-50"
                />
              </div>
              <p className="text-xs text-blue-600 mt-1">Derived from Manifest</p>
            </FormField>

            {/* Lot Units (Total Units)* - Derived from Manifest */}
            <FormField label="Lot Units (Total Units)" required error={getErrorMessage(errors.lotUnits)}>
              <Input 
                {...register('lotUnits', { valueAsNumber: true })} 
                type="number" 
                placeholder="Derived from Manifest"
                className="h-11 bg-blue-50"
              />
              <p className="text-xs text-blue-600 mt-1">Derived from Manifest</p>
            </FormField>

            {/* Lot Weight (lbs)* (Total weight) - Derived from Manifest */}
            <FormField label="Lot Weight (lbs)" required error={getErrorMessage(errors.lotWeight)}>
              <Input 
                {...register('lotWeight', { valueAsNumber: true })} 
                type="number" 
                step="0.01" 
                placeholder="Derived from Manifest"
                className="h-11 bg-blue-50"
              />
              <p className="text-xs text-blue-600 mt-1">Total weight - Derived from Manifest</p>
            </FormField>

          </div>
        </div>

        {/* Final Lot Condition (SHIVANG - to finalize) */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="font-semibold text-gray-900">Lot Condition*</h3>
            <Badge className="bg-red-100 text-red-700 border-red-200 text-xs">Required</Badge>
            <Separator className="flex-1" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Lot Condition* (Final Selection) */}
            <FormField label="Final Lot Condition" required error={getErrorMessage(errors.finalLotCondition)}>
              <Select onValueChange={(value) => setValue('finalLotCondition', value)}>
                <SelectTrigger className="w-full !h-12">
                  <SelectValue placeholder="Select final condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="like_new">Like New</SelectItem>
                  <SelectItem value="very_good">Very Good</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="acceptable">Acceptable</SelectItem>
                  <SelectItem value="damaged">Damaged</SelectItem>
                  <SelectItem value="untested">Untested</SelectItem>
                  <SelectItem value="mixed">Mixed</SelectItem>
                </SelectContent>
              </Select>
            </FormField>

          </div>
        </div>

        {/* Seller Notes */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="font-semibold text-gray-700">Seller Notes</h3>
            <Badge variant="outline" className="text-xs">Optional</Badge>
            <Separator className="flex-1" />
          </div>
          
          <FormField label="Seller Notes" error={getErrorMessage(errors.sellerNotes)}>
            <Textarea 
              {...register('sellerNotes')} 
              placeholder='Example: "Inventory is provided as-is, where-is. No damage claims accepted. Walmart.com disclaims all warranties."' 
              rows={4}
              className="resize-none"
            />
          </FormField>
        </div>

      </CardContent>
    </Card>
  );
} 
