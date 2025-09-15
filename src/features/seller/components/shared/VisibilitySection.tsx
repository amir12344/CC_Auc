"use client";

import React, { useCallback, useMemo } from "react";
import type {
  FieldErrors,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";

import { Country, State, type ICountry, type IState } from "country-state-city";
import { Eye } from "lucide-react";

import { Badge } from "@/src/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Checkbox } from "@/src/components/ui/checkbox";
import { Label } from "@/src/components/ui/label";
import {
  MultiSelectCommand,
  type Option,
} from "@/src/components/ui/multi-select-command";

import { ACCEPTED_FILE_TYPES } from "../../hooks/useFileUpload";
import { FileUploadArea } from "./FileUploadArea";

// Buyer targeting option interface
interface BuyerTargetingOption {
  code: string;
  name: string;
}

// Shared buyer targeting options with codes and display names
export const BUYER_TARGETING_OPTIONS: BuyerTargetingOption[] = [
  { code: "DISCOUNT_RETAIL", name: "Discount Retail" },
  { code: "STOCKX", name: "StockX" },
  { code: "AMAZON_OR_WALMART", name: "Amazon or Walmart" },
  {
    code: "LIVE_SELLER_MARKETPLACES",
    name: "Live Seller Marketplaces (Whatnot, TikTok etc.)",
  },
  {
    code: "RESELLER_MARKETPLACES",
    name: "Reseller Marketplaces (Poshmark, Depop etc.)",
  },
  { code: "OFF_PRICE_RETAIL", name: "Off-Price Retail" },
  { code: "EXPORTER", name: "Exporter" },
  { code: "REFURBISHER_REPAIR_SHOP", name: "Refurbisher / Repair Shop" },
] as const;

// Base interface for forms using VisibilitySection
interface BaseFormWithVisibility {
  visibilityType: "public" | "private";
  buyerTargeting?: string[];
  geographicRestrictions?: {
    countries?: string[];
    states?: string[];
  };
}

interface VisibilitySectionProps<
  T extends BaseFormWithVisibility = BaseFormWithVisibility,
> {
  title: string;
  description: string;
  visibilityType: "public" | "private";
  selectedBuyerTargeting: string[];
  errors: FieldErrors<T>;
  setValue: UseFormSetValue<T>;
  watch: UseFormWatch<T>;
  onBuyerTargetingChange: (optionCode: string, checked: boolean) => void;
  getErrorMessage: (error: unknown) => string | undefined;
  children?: React.ReactNode;
}

/**
 * Helper function to get display name from code
 */
const getDisplayName = (code: string): string => {
  const option = BUYER_TARGETING_OPTIONS.find((opt) => opt.code === code);
  return option ? option.name : code;
};

/**
 * Reusable visibility section component for both auction and catalog forms
 * Handles public/private visibility settings, buyer targeting, and geographic restrictions
 * Displays user-friendly names but stores/sends standardized codes to backend
 * Geographic restrictions only show for private listings
 */
export const VisibilitySection = <T extends BaseFormWithVisibility>({
  title,
  description,
  visibilityType,
  selectedBuyerTargeting,
  errors,
  setValue,
  watch,
  onBuyerTargetingChange,
  getErrorMessage,
  children,
}: VisibilitySectionProps<T>) => {
  // Get current geographic restrictions from form
  const formData = watch();
  const selectedCountries = useMemo(
    () => (formData.geographicRestrictions?.countries as string[]) || [],
    [formData.geographicRestrictions?.countries]
  );
  const selectedStates =
    (formData.geographicRestrictions?.states as string[]) || [];

  const countries: Option[] = useMemo(() => {
    // Get all countries and filter out any without states
    const allCountries = Country.getAllCountries().filter(
      (country) => State.getStatesOfCountry(country.isoCode).length > 0
    );

    return allCountries.map((country: ICountry) => ({
      value: country.isoCode,
      label: country.name,
    }));
  }, []);

  const states: Option[] = useMemo(() => {
    let allStates: IState[] = [];

    // If countries are selected, get states for those countries
    if (selectedCountries.length > 0) {
      for (const countryCode of selectedCountries) {
        const countryStates = State.getStatesOfCountry(countryCode);
        if (countryStates.length > 0) {
          allStates.push(...countryStates);
        }
      }
    } else {
      // Default to US states if no country is selected
      allStates = State.getStatesOfCountry("US");
    }

    // Map states to options format and ensure unique values
    return allStates.map((state) => ({
      value: `${state.countryCode}-${state.isoCode}`,
      label: `${state.name} (${state.countryCode})`,
    }));
  }, [selectedCountries]);

  const handleCountriesChange = useCallback(
    (newCountries: string[]) => {
      setValue(
        "geographicRestrictions" as never,
        {
          ...formData.geographicRestrictions,
          countries: newCountries,
          // Reset states when countries change
          states: [],
        } as never,
        { shouldValidate: true }
      );
    },
    [setValue, formData.geographicRestrictions]
  );

  const handleStatesChange = useCallback(
    (newStates: string[]) => {
      setValue(
        "geographicRestrictions" as never,
        {
          ...formData.geographicRestrictions,
          states: newStates,
        } as never,
        { shouldValidate: true }
      );
    },
    [setValue, formData.geographicRestrictions]
  );

  return (
    <Card className="border-0 bg-white/90 shadow-lg backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-green-100 p-2">
            <Eye className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <CardTitle className="text-xl font-semibold text-gray-900">
              {title}
            </CardTitle>
            <p className="mt-1 text-sm text-gray-600">{description}</p>
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
            <Badge className="text-xs" variant="destructive">
              Required
            </Badge>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-3 rounded-lg border p-3 hover:bg-gray-50">
              <Checkbox
                checked={visibilityType === "public"}
                id="public"
                onCheckedChange={(checked) => {
                  if (checked) {
                    setValue("visibilityType" as never, "public" as never);
                  }
                }}
              />
              <Label
                className="cursor-pointer font-medium text-gray-900"
                htmlFor="public"
              >
                Public (all buyers on Commerce Central can view)
              </Label>
            </div>

            <div className="flex items-center space-x-3 rounded-lg border p-3 hover:bg-gray-50">
              <Checkbox
                checked={visibilityType === "private"}
                id="private"
                onCheckedChange={(checked) => {
                  if (checked) {
                    setValue("visibilityType" as never, "private" as never);
                  }
                }}
              />
              <Label
                className="cursor-pointer font-medium text-gray-900"
                htmlFor="private"
              >
                Private (only visible to selected segments)
              </Label>
            </div>
          </div>

          {getErrorMessage(errors.visibilityType) && (
            <p className="text-sm text-red-600">
              {getErrorMessage(errors.visibilityType)}
            </p>
          )}
        </div>

        {/* Private Listing Options - Only show if Private is selected */}
        {visibilityType === "private" && (
          <div className="space-y-6 rounded-lg border bg-gray-50 p-6">
            {/* Buyer Targeting */}
            <div className="space-y-4">
              <Label className="text-base font-medium text-gray-900">
                Buyer Targeting (for Private Listings)
              </Label>
              <p className="text-sm text-gray-600">
                Select which buyer segments can view this private listing
              </p>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {BUYER_TARGETING_OPTIONS.map((option) => (
                  <div
                    className="flex items-center space-x-3 rounded p-2 hover:bg-white"
                    key={option.code}
                  >
                    <Checkbox
                      checked={selectedBuyerTargeting.includes(option.code)}
                      id={`buyer-${option.code}`}
                      onCheckedChange={(checked) =>
                        onBuyerTargetingChange(option.code, checked as boolean)
                      }
                    />
                    <Label
                      className="cursor-pointer text-sm font-medium text-gray-700"
                      htmlFor={`buyer-${option.code}`}
                    >
                      {option.name}
                    </Label>
                  </div>
                ))}
              </div>

              {selectedBuyerTargeting.length > 0 && (
                <div className="mt-3">
                  <p className="mb-2 text-sm text-gray-600">
                    Selected segments:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedBuyerTargeting.map((optionCode) => (
                      <Badge
                        className="text-xs"
                        key={optionCode}
                        variant="secondary"
                      >
                        {getDisplayName(optionCode)}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Geographic Restrictions */}
            <div className="space-y-4 border-t pt-6">
              <div>
                <Label className="text-base font-medium text-gray-900">
                  Geographic Restrictions (optional)
                </Label>
                <p className="mt-1 text-sm text-gray-600">
                  Select multiple values for each geographic restriction
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <MultiSelectCommand
                  label="Countries"
                  onChange={handleCountriesChange}
                  options={countries}
                  placeholder="Select countries..."
                  selected={selectedCountries}
                />
                <MultiSelectCommand
                  label="States"
                  onChange={handleStatesChange}
                  options={states}
                  placeholder="Select states..."
                  selected={selectedStates}
                />
              </div>
            </div>

            {/* Buyer List Upload - Only shows for private listings */}
            {visibilityType === "private" && (
              <div className="space-y-4 border-t pt-6">
                <div className="max-w-8xl">
                  <FileUploadArea
                    acceptedTypes={ACCEPTED_FILE_TYPES}
                    description="Excel file with approved buyer list (optional)"
                    file={null}
                    fileInputId="buyerListFile"
                    iconColor="purple"
                    isDragOver={false}
                    onDragLeave={() => {}}
                    onDragOver={() => {}}
                    onDrop={() => {}}
                    onFileRemove={() => {}}
                    onFileSelect={() => {}}
                    title="Upload Buyer List Excel"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Additional content */}
        {children}
      </CardContent>
    </Card>
  );
};
