"use client";

import React from "react";
import { FieldErrors, UseFormRegister, UseFormSetValue } from "react-hook-form";

import { Clock, DollarSign, Gavel, Shield } from "lucide-react";

import { Badge } from "@/src/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Checkbox } from "@/src/components/ui/checkbox";
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

import { FormField } from "./shared/FormField";

interface SaleOptionsSectionProps {
  register: UseFormRegister<any>;
  setValue: UseFormSetValue<any>;
  errors: FieldErrors<any>;
  getErrorMessage: (error: any) => string | undefined;
}

export function SaleOptionsSection({
  register,
  setValue,
  errors,
  getErrorMessage,
}: SaleOptionsSectionProps) {
  return (
    <Card className="border-0 bg-white/90 shadow-lg backdrop-blur-sm">
      <CardHeader className="pb-6">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-indigo-100 p-2">
            <Gavel className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <CardTitle className="text-xl text-gray-900">
              Sale Options
            </CardTitle>
            <CardDescription>
              Configure auction settings and bidding requirements
            </CardDescription>
          </div>
          <Badge className="ml-auto border-red-200 bg-red-100 text-red-700">
            Required
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Starting Bid */}
        <div className="space-y-4">
          <div className="mb-4 flex items-center gap-2">
            <h3 className="font-semibold text-gray-900">Starting Bid*</h3>
            <Badge className="border-red-200 bg-red-100 text-xs text-red-700">
              Required
            </Badge>
          </div>

          <FormField
            label="Starting Bid"
            required
            error={getErrorMessage(errors.startingBid)}
          >
            <div className="relative">
              <span className="absolute top-1/2 left-3 -translate-y-1/2 transform text-gray-500">
                $
              </span>
              <Input
                {...register("startingBid", { valueAsNumber: true })}
                type="number"
                step="0.01"
                placeholder="0.00"
                className="h-11 pl-8"
              />
            </div>
          </FormField>
        </div>

        {/* Auction Duration */}
        <div className="space-y-4">
          <div className="mb-4 flex items-center gap-2">
            <h3 className="font-semibold text-gray-900">Auction Duration*</h3>
            <Badge className="border-red-200 bg-red-100 text-xs text-red-700">
              Required
            </Badge>
          </div>

          <FormField
            label="Fixed (1-X days)"
            required
            error={getErrorMessage(errors.auctionDuration)}
          >
            <Select
              onValueChange={(value) => setValue("auctionDuration", value)}
            >
              <SelectTrigger className="!h-12 w-full">
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
          <div className="mb-4 flex items-center gap-2">
            <h3 className="font-semibold text-gray-900">
              Minimum Price / Reserve Price* (aka &quot;Buy Now&quot; price)
            </h3>
            <Badge className="border-red-200 bg-red-100 text-xs text-red-700">
              Required
            </Badge>
          </div>

          <FormField
            label="Minimum Price / Reserve Price"
            required
            error={getErrorMessage(errors.reservePrice)}
          >
            <div className="relative">
              <span className="absolute top-1/2 left-3 -translate-y-1/2 transform text-gray-500">
                $
              </span>
              <Input
                {...register("reservePrice", { valueAsNumber: true })}
                type="number"
                step="0.01"
                placeholder="0.00"
                className="h-11 pl-8"
              />
            </div>
          </FormField>
        </div>

        {/* Bidding Requirements */}
        <div className="space-y-4">
          <div className="mb-4 flex items-center gap-2">
            <h3 className="font-semibold text-gray-900">
              Bidding Requirements
            </h3>
          </div>

          <div className="space-y-4 rounded-lg border bg-gray-50 p-4">
            <p className="mb-3 text-sm text-gray-700">
              Optional fields: Buyer rating, business verification, etc.
            </p>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="require-buyer-rating"
                  onCheckedChange={(checked) =>
                    setValue("requireBuyerRating", checked)
                  }
                />
                <Label
                  htmlFor="require-buyer-rating"
                  className="text-sm font-medium text-gray-700"
                >
                  Require minimum buyer rating
                </Label>
              </div>

              <div className="flex items-center space-x-3">
                <Checkbox
                  id="require-business-verification"
                  onCheckedChange={(checked) =>
                    setValue("requireBusinessVerification", checked)
                  }
                />
                <Label
                  htmlFor="require-business-verification"
                  className="text-sm font-medium text-gray-700"
                >
                  Require business verification
                </Label>
              </div>

              <div className="flex items-center space-x-3">
                <Checkbox
                  id="require-deposit"
                  onCheckedChange={(checked) =>
                    setValue("requireDeposit", checked)
                  }
                />
                <Label
                  htmlFor="require-deposit"
                  className="text-sm font-medium text-gray-700"
                >
                  Require security deposit
                </Label>
              </div>

              <div className="flex items-center space-x-3">
                <Checkbox
                  id="require-prequalification"
                  onCheckedChange={(checked) =>
                    setValue("requirePrequalification", checked)
                  }
                />
                <Label
                  htmlFor="require-prequalification"
                  className="text-sm font-medium text-gray-700"
                >
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
