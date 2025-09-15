"use client";

import React from "react";
import { FieldErrors, UseFormRegister, UseFormSetValue } from "react-hook-form";

import { Package } from "lucide-react";

import { Badge } from "@/src/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
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

// Core Details form data interface based on exact reference specification
export interface CoreDetailsFormData {
  // Required fields marked with * in reference
  lotId: string; // Lot ID (auto-generated or seller-specified)
  brand: string; // Brand*
  name: string; // Name* (Internal Reference Name)
  category: string; // Category*
  subcategory: string; // Subcategory*
  title: string; // Title* (Buyer-facing listing title)
  itemDescription?: string; // Item Description
  upc: string; // UPC*
  model?: string; // Model
  skuCodeItemNumber: string; // SKU Code / Item #*
  variant: string; // Variant: Yes / No
  parentItemNumber?: string; // Parent Item # (if applicable - not required)
  mpn?: string; // MPN
  color?: string; // Color
  unitExRetailPrice: number; // Unit Ex-Retail Price*
  unitQuantity: number; // Unit Quantity*
  unitWeight: number; // Unit Weight (lbs)*
  unitDimensionsLength: number; // Unit Dimensions (L x W x H in)*
  unitDimensionsWidth: number; // Unit Dimensions Width
  unitDimensionsHeight: number; // Unit Dimensions Height
  condition: string; // Condition*
  cosmeticCondition?: string; // Cosmetic Condition
  accessories?: string; // Accessories
  containsHazardousMaterials: string; // Contains Hazardous Materials?* Yes / No
}

interface CoreDetailsSectionProps {
  register: UseFormRegister<any>;
  setValue: UseFormSetValue<any>;
  errors: FieldErrors<any>;
  getErrorMessage: (error: any) => string | undefined;
}

/**
 * Core Lot Details Section Component (Basically Manifest)
 *
 * Complete core details section extracted from main auction form
 * Based on exact field specifications from reference document
 */
export function CoreDetailsSection({
  register,
  setValue,
  errors,
  getErrorMessage,
}: CoreDetailsSectionProps) {
  return (
    <Card className="border-0 bg-white/90 shadow-lg backdrop-blur-sm">
      <CardHeader className="pb-6">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-blue-100 p-2">
            <Package className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <CardTitle className="text-xl text-gray-900">
              Core Lot Details
            </CardTitle>
            <CardDescription>
              Essential product information and specifications for your auction
              listing
            </CardDescription>
          </div>
          <Badge className="ml-auto border-red-200 bg-red-100 text-red-700">
            Required
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Basic Product Information */}
        <div className="space-y-4">
          <div className="mb-4 flex items-center gap-2">
            <h3 className="font-semibold text-gray-900">
              Basic Product Information
            </h3>
            <Separator className="flex-1" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {/* Lot ID (auto-generated or seller-specified) */}
            <FormField label="Lot ID" error={getErrorMessage(errors.lotId)}>
              <Input
                {...register("lotId")}
                placeholder="Auto-generated or seller-specified"
                className="h-12"
              />
            </FormField>

            {/* Brand* */}
            <FormField
              label="Brand"
              required
              error={getErrorMessage(errors.brand)}
            >
              <Input
                {...register("brand")}
                placeholder="Enter brand name"
                className="h-12"
              />
            </FormField>

            {/* Name* (Internal Reference Name) */}
            <FormField
              label="Name"
              required
              error={getErrorMessage(errors.name)}
            >
              <Input
                {...register("name")}
                placeholder="Internal Reference Name"
                className="h-12"
              />
            </FormField>

            {/* Category* */}
            <FormField
              label="Category"
              required
              error={getErrorMessage(errors.category)}
            >
              <Select onValueChange={(value) => setValue("category", value)}>
                <SelectTrigger className="!h-12 w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="electronics">Electronics</SelectItem>
                  <SelectItem value="clothing">Clothing</SelectItem>
                  <SelectItem value="home_garden">Home & Garden</SelectItem>
                  <SelectItem value="toys_games">Toys & Games</SelectItem>
                  <SelectItem value="health_beauty">Health & Beauty</SelectItem>
                  <SelectItem value="automotive">Automotive</SelectItem>
                  <SelectItem value="books_media">Books & Media</SelectItem>
                  <SelectItem value="sports_outdoors">
                    Sports & Outdoors
                  </SelectItem>
                </SelectContent>
              </Select>
            </FormField>

            {/* Subcategory* */}
            <FormField
              label="Subcategory"
              required
              error={getErrorMessage(errors.subcategory)}
            >
              <Select onValueChange={(value) => setValue("subcategory", value)}>
                <SelectTrigger className="!h-12 w-full">
                  <SelectValue placeholder="Select subcategory" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="smartphones">Smartphones</SelectItem>
                  <SelectItem value="laptops">Laptops</SelectItem>
                  <SelectItem value="tablets">Tablets</SelectItem>
                  <SelectItem value="mens_clothing">
                    Men&apos;s Clothing
                  </SelectItem>
                  <SelectItem value="womens_clothing">
                    Women&apos;s Clothing
                  </SelectItem>
                  <SelectItem value="furniture">Furniture</SelectItem>
                </SelectContent>
              </Select>
            </FormField>

            {/* Title* (Buyer-facing listing title) */}
            <FormField
              label="Title"
              required
              error={getErrorMessage(errors.title)}
            >
              <Input
                {...register("title")}
                placeholder="Buyer-facing listing title"
                className="h-12"
              />
            </FormField>
          </div>

          {/* Item Description - Full width */}
          <FormField
            label="Item Description"
            error={getErrorMessage(errors.itemDescription)}
          >
            <Textarea
              {...register("itemDescription")}
              placeholder="Enter detailed item description"
              rows={3}
              className="resize-none"
            />
          </FormField>
        </div>

        {/* Product Identifiers */}
        <div className="space-y-4">
          <div className="mb-4 flex items-center gap-2">
            <h3 className="font-semibold text-gray-900">Product Identifiers</h3>
            <Separator className="flex-1" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {/* UPC* */}
            <FormField label="UPC" required error={getErrorMessage(errors.upc)}>
              <Input
                {...register("upc")}
                placeholder="Universal Product Code"
                className="h-12"
              />
            </FormField>

            {/* Model */}
            <FormField label="Model" error={getErrorMessage(errors.model)}>
              <Input
                {...register("model")}
                placeholder="Model number"
                className="h-12"
              />
            </FormField>

            {/* SKU Code / Item #* */}
            <FormField
              label="SKU Code / Item #"
              required
              error={getErrorMessage(errors.skuCodeItemNumber)}
            >
              <Input
                {...register("skuCodeItemNumber")}
                placeholder="SKU Code or Item Number"
                className="h-12"
              />
            </FormField>

            {/* MPN */}
            <FormField label="MPN" error={getErrorMessage(errors.mpn)}>
              <Input
                {...register("mpn")}
                placeholder="Manufacturer Part Number"
                className="h-12"
              />
            </FormField>

            {/* Color */}
            <FormField label="Color" error={getErrorMessage(errors.color)}>
              <Input
                {...register("color")}
                placeholder="Product color"
                className="h-12"
              />
            </FormField>

            {/* Parent Item # (if applicable) */}
            <FormField
              label="Parent Item #"
              error={getErrorMessage(errors.parentItemNumber)}
            >
              <Input
                {...register("parentItemNumber")}
                placeholder="If applicable"
                className="h-12"
              />
            </FormField>
          </div>
        </div>

        {/* Variant Selection */}
        <div className="space-y-4">
          <div className="mb-4 flex items-center gap-2">
            <h3 className="font-semibold text-gray-900">Variant Information</h3>
            <Separator className="flex-1" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
            {/* Variant: Yes / No */}
            <FormField
              label="Variant"
              required
              error={getErrorMessage(errors.variant)}
            >
              <Select onValueChange={(value) => setValue("variant", value)}>
                <SelectTrigger className="!h-12 w-full">
                  <SelectValue placeholder="Select if this is a variant" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          </div>
        </div>

        {/* Pricing & Quantity */}
        <div className="space-y-4">
          <div className="mb-4 flex items-center gap-2">
            <h3 className="font-semibold text-gray-900">Pricing & Quantity</h3>
            <Separator className="flex-1" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
            {/* Unit Ex-Retail Price* */}
            <FormField
              label="Unit Ex-Retail Price"
              required
              error={getErrorMessage(errors.unitExRetailPrice)}
            >
              <div className="relative">
                <span className="absolute top-1/2 left-3 -translate-y-1/2 transform text-sm text-gray-500">
                  $
                </span>
                <Input
                  {...register("unitExRetailPrice", { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="h-12 pl-8"
                />
              </div>
            </FormField>

            {/* Unit Quantity* */}
            <FormField
              label="Unit Quantity"
              required
              error={getErrorMessage(errors.unitQuantity)}
            >
              <Input
                {...register("unitQuantity", { valueAsNumber: true })}
                type="number"
                placeholder="Enter quantity"
                className="h-12"
              />
            </FormField>
          </div>
        </div>

        {/* Dimensions & Weight */}
        <div className="space-y-4">
          <div className="mb-4 flex items-center gap-2">
            <h3 className="font-semibold text-gray-900">Dimensions & Weight</h3>
            <Separator className="flex-1" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
            {/* Unit Weight (lbs)* */}
            <FormField
              label="Unit Weight (lbs)"
              required
              error={getErrorMessage(errors.unitWeight)}
            >
              <Input
                {...register("unitWeight", { valueAsNumber: true })}
                type="number"
                step="0.01"
                placeholder="Weight in pounds"
                className="h-12"
              />
            </FormField>

            {/* Unit Dimensions Length* */}
            <FormField
              label="Length (in)"
              required
              error={getErrorMessage(errors.unitDimensionsLength)}
            >
              <Input
                {...register("unitDimensionsLength", { valueAsNumber: true })}
                type="number"
                step="0.01"
                placeholder="Length in inches"
                className="h-12"
              />
            </FormField>

            {/* Unit Dimensions Width* */}
            <FormField
              label="Width (in)"
              required
              error={getErrorMessage(errors.unitDimensionsWidth)}
            >
              <Input
                {...register("unitDimensionsWidth", { valueAsNumber: true })}
                type="number"
                step="0.01"
                placeholder="Width in inches"
                className="h-12"
              />
            </FormField>

            {/* Unit Dimensions Height* */}
            <FormField
              label="Height (in)"
              required
              error={getErrorMessage(errors.unitDimensionsHeight)}
            >
              <Input
                {...register("unitDimensionsHeight", { valueAsNumber: true })}
                type="number"
                step="0.01"
                placeholder="Height in inches"
                className="h-12"
              />
            </FormField>
          </div>
        </div>

        {/* Condition Information */}
        <div className="space-y-4">
          <div className="mb-4 flex items-center gap-2">
            <h3 className="font-semibold text-gray-900">
              Condition Information
            </h3>
            <Separator className="flex-1" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {/* Condition* */}
            <FormField
              label="Condition"
              required
              error={getErrorMessage(errors.condition)}
            >
              <Select onValueChange={(value) => setValue("condition", value)}>
                <SelectTrigger className="!h-12 w-full">
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="like_new">Like New</SelectItem>
                  <SelectItem value="very_good">Very Good</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="acceptable">Acceptable</SelectItem>
                  <SelectItem value="damaged">Damaged</SelectItem>
                </SelectContent>
              </Select>
            </FormField>

            {/* Cosmetic Condition */}
            <FormField
              label="Cosmetic Condition"
              error={getErrorMessage(errors.cosmeticCondition)}
            >
              <Select
                onValueChange={(value) => setValue("cosmeticCondition", value)}
              >
                <SelectTrigger className="!h-12 w-full">
                  <SelectValue placeholder="Select cosmetic condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pristine">Pristine</SelectItem>
                  <SelectItem value="excellent">Excellent</SelectItem>
                  <SelectItem value="very_good">Very Good</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="fair">Fair</SelectItem>
                  <SelectItem value="poor">Poor</SelectItem>
                </SelectContent>
              </Select>
            </FormField>

            {/* Contains Hazardous Materials */}
            <FormField
              label="Contains Hazardous Materials"
              required
              error={getErrorMessage(errors.containsHazardousMaterials)}
            >
              <Select
                onValueChange={(value) =>
                  setValue("containsHazardousMaterials", value)
                }
              >
                <SelectTrigger className="!h-12 w-full">
                  <SelectValue placeholder="Select yes or no" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          </div>

          {/* Accessories - Full width */}
          <FormField
            label="Accessories"
            error={getErrorMessage(errors.accessories)}
          >
            <Textarea
              {...register("accessories")}
              placeholder="List any included accessories or additional items"
              rows={2}
              className="resize-none"
            />
          </FormField>
        </div>
      </CardContent>
    </Card>
  );
}
