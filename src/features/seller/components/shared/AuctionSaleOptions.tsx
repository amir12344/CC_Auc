"use client";

import React, { useCallback, useEffect, useState } from "react";
import type {
  FieldErrors,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";

import { DollarSign, Gavel } from "lucide-react";

import { Badge } from "@/src/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Checkbox } from "@/src/components/ui/checkbox";
import { DateTimePicker } from "@/src/components/ui/date-time-picker";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";

// Define the form data interface to match AuctionExcelUploadFormData
interface AuctionFormData {
  // Listing Visibility
  visibilityType: "public" | "private";
  buyerTargeting?: string[];
  geographicRestrictions?: {
    countries?: string[];
    states?: string[];
  };
  // Sale Options
  startingBid: number;
  bidIncrementType: "dollar" | "percentage";
  bidIncrementAmount: number;
  auctionDuration: number;
  auctionEndTimestamp: number;
}

// Define the error type for form fields
type FormFieldError = {
  message?: string;
  type?: string;
};

interface AuctionSaleOptionsProps {
  register: UseFormRegister<AuctionFormData>;
  errors: FieldErrors<AuctionFormData>;
  watch: UseFormWatch<AuctionFormData>;
  setValue: UseFormSetValue<AuctionFormData>;
  getErrorMessage: (error: FormFieldError | undefined) => string | undefined;
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
  // State to track selected date for auction end
  const [date, setDate] = useState<Date | undefined>(undefined);

  // Watch bid increment type with fallback to default
  const bidIncrementType = watch("bidIncrementType") || "dollar";

  // Watch form values to detect resets
  const startingBid = watch("startingBid");

  // Reset internal state when form is reset
  useEffect(() => {
    // Check if form has been reset (startingBid is required, so 0 or undefined indicates reset)
    const isFormReset = startingBid === 0 || !startingBid;

    if (isFormReset) {
      setDate(undefined);
    }
  }, [startingBid]);

  // Optimized date change handler with useCallback
  const handleDateChange = useCallback(
    (selectedDate: Date | undefined) => {
      setDate(selectedDate);

      if (selectedDate) {
        // Validate that the selected date is in the future
        const now = new Date();
        if (selectedDate <= now) {
          return;
        }

        // Set the end date as a timestamp for the backend
        const endTimestamp = selectedDate.getTime();
        setValue("auctionEndTimestamp", endTimestamp);

        // Calculate duration in days for UI display
        const durationMs = selectedDate.getTime() - now.getTime();
        const durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24));

        setValue("auctionDuration", durationDays > 0 ? durationDays : 1);
      } else {
        // Clear the timestamp when no date is selected - don't set defaults
        setValue("auctionEndTimestamp", 0);
        setValue("auctionDuration", 0);
      }
    },
    [setValue]
  );

  // Optimized bid increment type handler with useCallback
  const handleBidIncrementTypeChange = useCallback(
    (type: "dollar" | "percentage", checked: boolean) => {
      if (checked) {
        setValue("bidIncrementType", type);
        // Clear the bid increment amount when switching types for better UX
        setValue("bidIncrementAmount", 0);
      }
    },
    [setValue]
  );

  // Memoized bid increment label
  const bidIncrementLabel =
    bidIncrementType === "dollar" ? "Bid Increment ($)" : "Bid Increment (%)";
  const bidIncrementPlaceholder =
    bidIncrementType === "dollar" ? "Enter amount ($)" : "Enter percentage (%)";

  return (
    <Card className="border-0 bg-white/90 shadow-lg backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-indigo-100 p-2">
            <Gavel className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <CardTitle className="text-xl font-semibold text-gray-900">
              Sale Options
            </CardTitle>
            <p className="mt-1 text-sm text-gray-600">
              Configure auction bidding settings and duration
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Starting Bid */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label
              className="text-base font-medium text-gray-900"
              htmlFor="startingBid"
            >
              Starting Bid *
            </Label>
            <Badge className="text-xs" variant="destructive">
              Required
            </Badge>
          </div>
          <div className="relative">
            <DollarSign className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
            <Input
              {...register("startingBid", { valueAsNumber: true })}
              className="h-12 pl-10"
              id="startingBid"
              min="0.01"
              placeholder="0.00"
              step="0.01"
              type="number"
            />
          </div>
          {getErrorMessage(errors.startingBid) && (
            <p className="text-sm text-red-600">
              {getErrorMessage(errors.startingBid)}
            </p>
          )}
        </div>

        {/* Bid Increment Type with Mutual Exclusion */}
        <div className="space-y-4">
          <Label className="text-base font-medium text-gray-900">
            Bid Increment Type
          </Label>

          <div className="flex gap-6">
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={bidIncrementType === "dollar"}
                id="dollar"
                onCheckedChange={(checked) => {
                  if (checked) {
                    handleBidIncrementTypeChange("dollar", true);
                  }
                }}
              />
              <Label
                className="cursor-pointer font-medium text-gray-900"
                htmlFor="dollar"
              >
                $ (Fixed amount)
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                checked={bidIncrementType === "percentage"}
                id="percentage"
                onCheckedChange={(checked) => {
                  if (checked) {
                    handleBidIncrementTypeChange("percentage", true);
                  }
                }}
              />
              <Label
                className="cursor-pointer font-medium text-gray-900"
                htmlFor="percentage"
              >
                % (Percentage)
              </Label>
            </div>
          </div>
        </div>

        {/* Bid Increment Amount */}
        <div className="space-y-2">
          <Label
            className="text-base font-medium text-gray-900"
            htmlFor="bidIncrementAmount"
          >
            {bidIncrementLabel}
          </Label>
          <Input
            {...register("bidIncrementAmount", { valueAsNumber: true })}
            className="h-12"
            id="bidIncrementAmount"
            min="0.01"
            placeholder={bidIncrementPlaceholder}
            step="0.01"
            type="number"
          />
          {getErrorMessage(errors.bidIncrementAmount) && (
            <p className="text-sm text-red-600">
              {getErrorMessage(errors.bidIncrementAmount)}
            </p>
          )}
        </div>

        {/* Auction Duration with Calendar */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label className="text-base font-medium text-gray-900">
              Auction End Date & Time *
            </Label>
            <Badge className="text-xs" variant="destructive">
              Required
            </Badge>
          </div>

          <DateTimePicker onChange={handleDateChange} value={date} />

          {/* Hidden inputs for form data */}
          <input type="hidden" {...register("auctionEndTimestamp")} />
        </div>
      </CardContent>
    </Card>
  );
};
