'use client';

import React from 'react';
import { UseFormRegister, UseFormSetValue, FieldErrors } from 'react-hook-form';
import { Input } from '@/src/components/ui/input';
import { Textarea } from '@/src/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select';
import { Label } from '@/src/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { Separator } from '@/src/components/ui/separator';
import { FormField } from './shared/FormField';
import { Truck } from 'lucide-react';

// Shipping form data interface based on exact reference specification
export interface ShippingFormData {
  // Required fields marked with * in reference
  shippingType: string;                    // Shipping Type* (SHIVANG - to confirm)
  warehouseAddress1: string;               // Warehouse Address 1* (Hidden from buyer)
  warehouseAddress2?: string;              // Warehouse Address 2 (Hidden from buyer)
  warehouseCity: string;                   // Warehouse City* (Hidden from buyer)
  warehouseState: string;                  // Warehouse State* (Hidden from buyer)
  warehouseZipcode: string;                // Warehouse Zipcode* (Hidden from buyer)
  warehouseCountry: string;                // Warehouse Country* (Hidden from buyer)
  shipFromLocation: string;                // Ship From Location* (e.g., Zip Code: 46131 – Franklin, IN)
  freightType: string;                     // Freight Type*
  estimatedWeight: number;                 // Estimated Weight (lbs)* - derived from manifest
  packagingFormat: string;                 // Packaging Format*
  refrigerated: string;                    // Refrigerated? Yes / No
  containsHazardousMaterials: string;      // Contains Hazardous Materials?* Yes / No

  // Optional fields
  shippingCost?: number;                   // Shipping Cost (if applicable)
  numberOfPallets?: number;                // Number of Pallets
  numberOfTruckloads?: number;             // Number of Truckloads
  shippingNotes?: string;                  // Shipping Notes (with example text)
  numberOfShipments?: number;              // Number of Shipments
  additionalInformation?: string;          // Additional Information (optional)
}

interface ShippingSectionProps {
  register: UseFormRegister<any>;
  setValue: UseFormSetValue<any>;
  errors: FieldErrors<any>;
  getErrorMessage: (error: any) => string | undefined;
}

/**
 * Shipping & Handling Section Component
 * 
 * Complete shipping section extracted from main auction form
 * Based on exact field specifications from reference document
 */
export function ShippingSection({ register, setValue, errors, getErrorMessage }: ShippingSectionProps) {
  return (
    <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
      <CardHeader className="pb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <Truck className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <CardTitle className="text-xl text-gray-900">Shipping & Handling</CardTitle>
            <CardDescription>
              Shipping details and logistics information for your auction listing
            </CardDescription>
          </div>
          <Badge className="ml-auto bg-red-100 text-red-700 border-red-200">Required</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        
        {/* Required Shipping Fields */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="font-semibold text-gray-900">Required Shipping Information</h3>
            <Separator className="flex-1" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Shipping Type* */}
            <FormField label="Shipping Type" required error={getErrorMessage(errors.shippingType)}>
              <Select onValueChange={(value) => setValue('shippingType', value)}>
                <SelectTrigger className="w-full !h-12">
                  <SelectValue placeholder="Select shipping type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small_parcel">Small Parcel</SelectItem>
                  <SelectItem value="ltl_freight">LTL Freight</SelectItem>
                  <SelectItem value="ftl_freight">FTL Freight</SelectItem>
                  <SelectItem value="pickup_only">Pickup Only</SelectItem>
                </SelectContent>
              </Select>
            </FormField>

            {/* Ship From Location* */}
            <FormField label="Ship From Location" required error={getErrorMessage(errors.shipFromLocation)}>
              <Input 
                {...register('shipFromLocation')} 
                placeholder="e.g., Zip Code: 46131 – Franklin, IN" 
                className="h-12" 
              />
            </FormField>

          </div>

          {/* Warehouse / Facility Location Section - Hidden from buyer */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <h3 className="font-semibold text-gray-900">Warehouse / Facility Location</h3>
              <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">Hidden from buyer</Badge>
              <Separator className="flex-1" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Address 1* */}
              <FormField label="Address 1" required error={getErrorMessage(errors.warehouseAddress1)}>
                <Input 
                  {...register('warehouseAddress1')} 
                  placeholder="Street address" 
                  className="h-12" 
                />
              </FormField>

              {/* Address 2 */}
              <FormField label="Address 2" error={getErrorMessage(errors.warehouseAddress2)}>
                <Input 
                  {...register('warehouseAddress2')} 
                  placeholder="Apartment, suite, etc. (optional)" 
                  className="h-12" 
                />
              </FormField>

              {/* City* */}
              <FormField label="City" required error={getErrorMessage(errors.warehouseCity)}>
                <Input 
                  {...register('warehouseCity')} 
                  placeholder="City" 
                  className="h-12" 
                />
              </FormField>

              {/* State* */}
              <FormField label="State" required error={getErrorMessage(errors.warehouseState)}>
                <Input 
                  {...register('warehouseState')} 
                  placeholder="State" 
                  className="h-12" 
                />
              </FormField>

              {/* Zipcode* */}
              <FormField label="Zipcode" required error={getErrorMessage(errors.warehouseZipcode)}>
                <Input 
                  {...register('warehouseZipcode')} 
                  placeholder="Zipcode" 
                  className="h-12" 
                />
              </FormField>

              {/* Country* */}
              <FormField label="Country" required error={getErrorMessage(errors.warehouseCountry)}>
                <Input 
                  {...register('warehouseCountry')} 
                  placeholder="Country" 
                  className="h-12" 
                />
              </FormField>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {/* Freight Type* */}
            <FormField label="Freight Type" required error={getErrorMessage(errors.freightType)} className='h-12'>
              <Select onValueChange={(value) => setValue('freightType', value)} >
                <SelectTrigger className="w-full !h-12">
                  <SelectValue placeholder="Select freight type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="expedited">Expedited</SelectItem>
                  <SelectItem value="white_glove">White Glove</SelectItem>
                  <SelectItem value="appointment">Appointment Required</SelectItem>
                </SelectContent>
              </Select>
            </FormField>

            {/* Estimated Weight (lbs)* - derived from manifest */}
            <FormField label="Estimated Weight (lbs)" required error={getErrorMessage(errors.estimatedWeight)}>
              <Input 
                {...register('estimatedWeight', { valueAsNumber: true })} 
                type="number" 
                step="0.01" 
                placeholder="Enter weight (derived from manifest)"
                className="h-12"
              />
            </FormField>

            {/* Packaging Format* */}
            <FormField label="Packaging Format" required error={getErrorMessage(errors.packagingFormat)}>
              <Select onValueChange={(value) => setValue('packagingFormat', value)}>
                <SelectTrigger className="w-full !h-12">
                  <SelectValue placeholder="Select packaging format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="palletized">Palletized</SelectItem>
                  <SelectItem value="loose_load">Loose Load</SelectItem>
                  <SelectItem value="gaylord">Gaylord</SelectItem>
                  <SelectItem value="individual_boxes">Individual Boxes</SelectItem>
                </SelectContent>
              </Select>
            </FormField>

          </div>

          {/* Yes/No Required Fields Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Refrigerated? Yes / No */}
            <FormField label="Refrigerated" error={getErrorMessage(errors.refrigerated)}>
              <Select onValueChange={(value) => setValue('refrigerated', value)}>
                <SelectTrigger className="w-full !h-12">
                  <SelectValue placeholder="Select refrigeration requirement" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </FormField>

            {/* Contains Hazardous Materials?* Yes / No */}
            <FormField label="Contains Hazardous Materials?" required error={getErrorMessage(errors.containsHazardousMaterials)}>
              <Select onValueChange={(value) => setValue('containsHazardousMaterials', value)}>
                <SelectTrigger className="w-full !h-12">
                  <SelectValue placeholder="Select option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          </div>
        </div>

        {/* Optional Shipping Fields */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="font-semibold text-gray-700">Additional Shipping Details</h3>
            <Badge variant="outline" className="text-xs">Optional</Badge>
            <Separator className="flex-1" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Shipping Cost (if applicable) */}
            <FormField label="Shipping Cost" error={getErrorMessage(errors.shippingCost)}>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <Input 
                  {...register('shippingCost', { valueAsNumber: true })} 
                  type="number" 
                  step="0.01" 
                  placeholder="0.00"
                  className="pl-8 h-12"
                />
              </div>
            </FormField>

            {/* Number of Pallets */}
            <FormField label="Number of Pallets" error={getErrorMessage(errors.numberOfPallets)}>
              <Input 
                {...register('numberOfPallets', { valueAsNumber: true })} 
                type="number" 
                placeholder="Enter number of pallets"
                className="h-12"
              />
            </FormField>

            {/* Number of Truckloads */}
            <FormField label="Number of Truckloads" error={getErrorMessage(errors.numberOfTruckloads)}>
              <Input 
                {...register('numberOfTruckloads', { valueAsNumber: true })} 
                type="number" 
                placeholder="Enter number of truckloads"
                className="h-12"
              />
            </FormField>

            {/* Number of Shipments */}
            <FormField label="Number of Shipments" error={getErrorMessage(errors.numberOfShipments)}>
              <Input 
                {...register('numberOfShipments', { valueAsNumber: true })} 
                type="number" 
                placeholder="Enter number of shipments"
                className="h-12"
              />
            </FormField>

          </div>

          {/* Text Area Fields */}
          <div className="space-y-6">
            {/* Shipping Notes */}
            <FormField label="Shipping Notes" error={getErrorMessage(errors.shippingNotes)}>
              <Textarea 
                {...register('shippingNotes')} 
                placeholder='Example: "This lot ships on 1 pallet. W 40" x L 48" x H 65".' 
                rows={3}
                className="resize-none"
              />
            </FormField>

            {/* Additional Information (optional) */}
            <FormField label="Additional Information" error={getErrorMessage(errors.additionalInformation)}>
              <Textarea 
                {...register('additionalInformation')} 
                placeholder="Enter any additional shipping information" 
                rows={3}
                className="resize-none"
              />
            </FormField>
          </div>
        </div>

      </CardContent>
    </Card>
  );
} 
