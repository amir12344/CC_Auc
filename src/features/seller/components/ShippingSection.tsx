"use client";

import type {
  FieldErrors,
  FieldValues,
  Path,
  PathValue,
  UseFormRegister,
  UseFormSetValue,
} from "react-hook-form";

import { Truck } from "lucide-react";

import { Badge } from "@/src/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Separator } from "@/src/components/ui/separator";
import { Textarea } from "@/src/components/ui/textarea";

import { FormField } from "./shared/FormField";

// Shipping form data interface based on exact reference specification
export interface ShippingFormData {
  // Required fields marked with * in reference
  shippingType: string; // Shipping Type* (SHIVANG - to confirm)
  warehouseAddress1: string; // Warehouse Address 1* (Hidden from buyer)
  warehouseAddress2?: string; // Warehouse Address 2 (Hidden from buyer)
  warehouseCity: string; // Warehouse City* (Hidden from buyer)
  warehouseState: string; // Warehouse State* (Hidden from buyer)
  warehouseZipcode: string; // Warehouse Zipcode* (Hidden from buyer)
  warehouseCountry: string; // Warehouse Country* (Hidden from buyer)
  shipFromLocation: string; // Ship From Location* (e.g., Zip Code: 46131 – Franklin, IN)
  freightType: string; // Freight Type*
  estimatedWeight: number; // Estimated Weight (lbs)* - derived from manifest
  packagingFormat: string; // Packaging Format*
  refrigerated: string; // Refrigerated? Yes / No
  containsHazardousMaterials: string; // Contains Hazardous Materials?* Yes / No

  // Optional fields
  shippingCost?: number; // Shipping Cost (if applicable)
  numberOfPallets?: number; // Number of Pallets
  numberOfTruckloads?: number; // Number of Truckloads
  shippingNotes?: string; // Shipping Notes (with example text)
  numberOfShipments?: number; // Number of Shipments
  additionalInformation?: string; // Additional Information (optional)
}

interface ShippingSectionProps<T extends FieldValues = FieldValues> {
  register: UseFormRegister<T>;
  setValue: UseFormSetValue<T>;
  errors: FieldErrors<T>;
  getErrorMessage: (error: unknown) => string | undefined;
}

/**
 * Shipping & Handling Section Component
 *
 * Complete shipping section extracted from main auction form
 * Based on exact field specifications from reference document
 */
export function ShippingSection<T extends FieldValues = FieldValues>({
  register,
  setValue,
  errors,
  getErrorMessage,
}: ShippingSectionProps<T>) {
  return (
    <Card className="border-0 bg-white/90 shadow-lg backdrop-blur-sm">
      <CardHeader className="pb-6">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-green-100 p-2">
            <Truck className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <CardTitle className="text-xl text-gray-900">
              Shipping & Handling
            </CardTitle>
            <CardDescription>
              Shipping details and logistics information for your auction
              listing
            </CardDescription>
          </div>
          <Badge className="ml-auto border-red-200 bg-red-100 text-red-700">
            Required
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Required Shipping Fields */}
        <div className="space-y-4">
          <div className="mb-4 flex items-center gap-2">
            <h3 className="font-semibold text-gray-900">
              Required Shipping Information
            </h3>
            <Separator className="flex-1" />
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Shipping Type* */}
            <FormField
              error={getErrorMessage(errors.shippingType)}
              label="Shipping Type"
              required
            >
              <Select
                onValueChange={(value) =>
                  setValue(
                    "shippingType" as Path<T>,
                    value as PathValue<T, Path<T>>
                  )
                }
              >
                <SelectTrigger className="!h-12 w-full">
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
            <FormField
              error={getErrorMessage(errors.shipFromLocation)}
              label="Ship From Location"
              required
            >
              <Input
                {...register("shipFromLocation" as Path<T>)}
                className="h-12"
                placeholder="e.g., Zip Code: 46131 – Franklin, IN"
              />
            </FormField>
          </div>

          {/* Warehouse / Facility Location Section - Hidden from buyer */}
          <div className="space-y-4">
            <div className="mb-4 flex items-center gap-2">
              <h3 className="font-semibold text-gray-900">
                Warehouse / Facility Location
              </h3>
              <Badge
                className="border-orange-200 bg-orange-50 text-xs text-orange-700"
                variant="outline"
              >
                Hidden from buyer
              </Badge>
              <Separator className="flex-1" />
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Address 1* */}
              <FormField
                error={getErrorMessage(errors.warehouseAddress1)}
                label="Address 1"
                required
              >
                <Input
                  {...register("warehouseAddress1" as Path<T>)}
                  className="h-12"
                  placeholder="Street address"
                />
              </FormField>

              {/* Address 2 */}
              <FormField
                error={getErrorMessage(errors.warehouseAddress2)}
                label="Address 2"
              >
                <Input
                  {...register("warehouseAddress2" as Path<T>)}
                  className="h-12"
                  placeholder="Apartment, suite, etc. (optional)"
                />
              </FormField>

              {/* City* */}
              <FormField
                error={getErrorMessage(errors.warehouseCity)}
                label="City"
                required
              >
                <Input
                  {...register("warehouseCity" as Path<T>)}
                  className="h-12"
                  placeholder="City"
                />
              </FormField>

              {/* State* */}
              <FormField
                error={getErrorMessage(errors.warehouseState)}
                label="State"
                required
              >
                <Input
                  {...register("warehouseState" as Path<T>)}
                  className="h-12"
                  placeholder="State"
                />
              </FormField>

              {/* Zipcode* */}
              <FormField
                error={getErrorMessage(errors.warehouseZipcode)}
                label="Zipcode"
                required
              >
                <Input
                  {...register("warehouseZipcode" as Path<T>)}
                  className="h-12"
                  placeholder="Zipcode"
                />
              </FormField>

              {/* Country* */}
              <FormField
                error={getErrorMessage(errors.warehouseCountry)}
                label="Country"
                required
              >
                <Input
                  {...register("warehouseCountry" as Path<T>)}
                  className="h-12"
                  placeholder="Country"
                />
              </FormField>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Freight Type* */}
            <FormField
              error={getErrorMessage(errors.freightType)}
              label="Freight Type"
              required
            >
              <Select
                onValueChange={(value) =>
                  setValue(
                    "freightType" as Path<T>,
                    value as PathValue<T, Path<T>>
                  )
                }
              >
                <SelectTrigger className="!h-12 w-full">
                  <SelectValue placeholder="Select freight type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="expedited">Expedited</SelectItem>
                  <SelectItem value="white_glove">White Glove</SelectItem>
                  <SelectItem value="appointment">
                    Appointment Required
                  </SelectItem>
                </SelectContent>
              </Select>
            </FormField>

            {/* Estimated Weight (lbs)* - derived from manifest */}
            <FormField
              error={getErrorMessage(errors.estimatedWeight)}
              label="Estimated Weight (lbs)"
              required
            >
              <Input
                {...register("estimatedWeight" as Path<T>, {
                  valueAsNumber: true,
                })}
                className="h-12"
                placeholder="Enter weight (derived from manifest)"
                step="0.01"
                type="number"
              />
            </FormField>

            {/* Packaging Format* */}
            <FormField
              error={getErrorMessage(errors.packagingFormat)}
              label="Packaging Format"
              required
            >
              <Select
                onValueChange={(value) =>
                  setValue(
                    "packagingFormat" as Path<T>,
                    value as PathValue<T, Path<T>>
                  )
                }
              >
                <SelectTrigger className="!h-12 w-full">
                  <SelectValue placeholder="Select packaging format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="palletized">Palletized</SelectItem>
                  <SelectItem value="loose_load">Loose Load</SelectItem>
                  <SelectItem value="gaylord">Gaylord</SelectItem>
                  <SelectItem value="individual_boxes">
                    Individual Boxes
                  </SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          </div>

          {/* Yes/No Required Fields Row */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Refrigerated? Yes / No */}
            <FormField
              error={getErrorMessage(errors.refrigerated)}
              label="Refrigerated"
            >
              <Select
                onValueChange={(value) =>
                  setValue(
                    "refrigerated" as Path<T>,
                    value as PathValue<T, Path<T>>
                  )
                }
              >
                <SelectTrigger className="!h-12 w-full">
                  <SelectValue placeholder="Select refrigeration requirement" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </FormField>

            {/* Contains Hazardous Materials?* Yes / No */}
            <FormField
              error={getErrorMessage(errors.containsHazardousMaterials)}
              label="Contains Hazardous Materials?"
              required
            >
              <Select
                onValueChange={(value) =>
                  setValue(
                    "containsHazardousMaterials" as Path<T>,
                    value as PathValue<T, Path<T>>
                  )
                }
              >
                <SelectTrigger className="!h-12 w-full">
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
          <div className="mb-4 flex items-center gap-2">
            <h3 className="font-semibold text-gray-700">
              Additional Shipping Details
            </h3>
            <Badge className="text-xs" variant="outline">
              Optional
            </Badge>
            <Separator className="flex-1" />
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Shipping Cost (if applicable) */}
            <FormField
              error={getErrorMessage(errors.shippingCost)}
              label="Shipping Cost"
            >
              <div className="relative">
                <span className="absolute top-1/2 left-3 -translate-y-1/2 transform text-gray-500">
                  $
                </span>
                <Input
                  {...register("shippingCost" as Path<T>, {
                    valueAsNumber: true,
                  })}
                  className="h-12 pl-8"
                  placeholder="0.00"
                  step="0.01"
                  type="number"
                />
              </div>
            </FormField>

            {/* Number of Pallets */}
            <FormField
              error={getErrorMessage(errors.numberOfPallets)}
              label="Number of Pallets"
            >
              <Input
                {...register("numberOfPallets" as Path<T>, {
                  valueAsNumber: true,
                })}
                className="h-12"
                placeholder="Enter number of pallets"
                type="number"
              />
            </FormField>

            {/* Number of Truckloads */}
            <FormField
              error={getErrorMessage(errors.numberOfTruckloads)}
              label="Number of Truckloads"
            >
              <Input
                {...register("numberOfTruckloads" as Path<T>, {
                  valueAsNumber: true,
                })}
                className="h-12"
                placeholder="Enter number of truckloads"
                type="number"
              />
            </FormField>

            {/* Number of Shipments */}
            <FormField
              error={getErrorMessage(errors.numberOfShipments)}
              label="Number of Shipments"
            >
              <Input
                {...register("numberOfShipments" as Path<T>, {
                  valueAsNumber: true,
                })}
                className="h-12"
                placeholder="Enter number of shipments"
                type="number"
              />
            </FormField>
          </div>

          {/* Text Area Fields */}
          <div className="space-y-6">
            {/* Shipping Notes */}
            <FormField
              error={getErrorMessage(errors.shippingNotes)}
              label="Shipping Notes"
            >
              <Textarea
                {...register("shippingNotes" as Path<T>)}
                className="resize-none"
                placeholder='Example: "This lot ships on 1 pallet. W 40" x L 48" x H 65".'
                rows={3}
              />
            </FormField>

            {/* Additional Information (optional) */}
            <FormField
              error={getErrorMessage(errors.additionalInformation)}
              label="Additional Information"
            >
              <Textarea
                {...register("additionalInformation" as Path<T>)}
                className="resize-none"
                placeholder="Enter any additional shipping information"
                rows={3}
              />
            </FormField>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
