"use client";

import React from "react";
import type { UseFormReturn } from "react-hook-form";

import { ChevronDown, ChevronRight } from "lucide-react";

import { Button } from "@/src/components/ui/button";
import { Calendar } from "@/src/components/ui/calendar";
import { Card, CardContent, CardHeader } from "@/src/components/ui/card";
import { Checkbox } from "@/src/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/src/components/ui/collapsible";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/components/ui/form";
import { Input } from "@/src/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Textarea } from "@/src/components/ui/textarea";

import {
  INSPECTION_STATUS,
  LOAD_TYPES,
  LOT_TYPES,
  PACKAGING_TYPES,
} from "../../constants/lotListingsConstants";
import type { LotListingsFormData } from "../../schemas/lotListingsSchema";

interface LoadDetailsSectionProps {
  form: UseFormReturn<LotListingsFormData>;
  isOpen: boolean;
  onToggleAction: () => void;
}

export const LoadDetailsSection = React.memo(function LoadDetailsSection({
  form,
  isOpen,
  onToggleAction,
}: LoadDetailsSectionProps) {
  const controlClass =
    "min-w-0 w-full max-w-full h-11 rounded-lg border-neutral-300 focus-visible:ring-2 focus-visible:ring-neutral-900/10 focus-visible:ring-offset-0";
  const watchAccessoriesCompleteness = form.watch(
    "loadDetails.accessoriesCompleteness"
  );
  const watchHasShelfLifeRisk = form.watch("loadDetails.hasShelfLifeRisk");
  const [expiryOpen, setExpiryOpen] = React.useState(false);

  return (
    <Card className="rounded-xl border border-neutral-200 shadow-sm">
      <Collapsible open={isOpen} onOpenChange={onToggleAction}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer transition-colors hover:bg-neutral-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="grid h-7 w-7 place-items-center rounded-full border border-neutral-300 text-xs font-medium text-neutral-900">
                  3
                </div>
                <div>
                  <h3 className="text-base font-semibold text-neutral-900">
                    Load Details
                  </h3>
                  <p className="text-xs text-neutral-600">
                    Detailed information about your inventory
                  </p>
                </div>
              </div>
              {isOpen ? (
                <ChevronDown className="h-5 w-5 text-neutral-500" />
              ) : (
                <ChevronRight className="h-5 w-5 text-neutral-500" />
              )}
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="space-y-8 pt-0">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Load Type */}
              <FormField
                control={form.control}
                name="loadDetails.loadType"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="font-medium text-neutral-900">
                      Load Type <span className="text-red-500">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || undefined}
                    >
                      <FormControl>
                        <SelectTrigger className={controlClass}>
                          <SelectValue placeholder="Select load type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {LOAD_TYPES.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Lot Type */}
              <FormField
                control={form.control}
                name="loadDetails.lotType"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="font-medium text-neutral-900">
                      Lot Type <span className="text-red-500">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || undefined}
                    >
                      <FormControl>
                        <SelectTrigger className={controlClass}>
                          <SelectValue placeholder="Select lot type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {LOT_TYPES.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Packaging */}
              <FormField
                control={form.control}
                name="loadDetails.packaging"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="font-medium text-gray-900">
                      Packaging <span className="text-red-500">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || undefined}
                    >
                      <FormControl>
                        <SelectTrigger className={controlClass}>
                          <SelectValue placeholder="Select packaging type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PACKAGING_TYPES.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Cosmetic Condition */}
              <FormField
                control={form.control}
                name="loadDetails.cosmeticCondition"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="font-medium text-neutral-900">
                      Cosmetic Condition
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. 'Box Damage Only'"
                        className={controlClass}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Resale Requirements */}
              <FormField
                control={form.control}
                name="loadDetails.resaleRequirements"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="font-medium text-neutral-900">
                      Resale Requirements
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Brand restrictions"
                        className={controlClass}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Inspection Status */}
              <FormField
                control={form.control}
                name="loadDetails.inspectionStatus"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="font-medium text-neutral-900">
                      Inspection Status <span className="text-red-500">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || undefined}
                    >
                      <FormControl>
                        <SelectTrigger className={controlClass}>
                          <SelectValue placeholder="Select inspection status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {INSPECTION_STATUS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Accessories/Completeness */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="loadDetails.accessoriesCompleteness"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-y-0 space-x-3">
                    <FormControl>
                      <Checkbox
                        checked={field.value || false}
                        onCheckedChange={field.onChange}
                        className="border-neutral-300"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="font-medium text-neutral-900">
                        Accessories / Completeness
                      </FormLabel>
                      <p className="text-sm text-neutral-600">
                        Check if accessories are included
                      </p>
                    </div>
                  </FormItem>
                )}
              />

              {watchAccessoriesCompleteness && (
                <FormField
                  control={form.control}
                  name="loadDetails.accessoriesDetails"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="font-medium text-neutral-900">
                        Accessories Details
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe included accessories and completeness"
                          className={`resize-none ${controlClass}`}
                          rows={2}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            {/* Shelf Life / Expiry Risk */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="loadDetails.hasShelfLifeRisk"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-y-0 space-x-3">
                    <FormControl>
                      <Checkbox
                        checked={field.value || false}
                        onCheckedChange={field.onChange}
                        className="border-neutral-300"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="font-medium text-neutral-900">
                        Shelf Life / Expiry Risk
                      </FormLabel>
                      <p className="text-sm text-neutral-600">
                        Check if items have expiry risk
                      </p>
                    </div>
                  </FormItem>
                )}
              />

              {watchHasShelfLifeRisk && (
                <FormField
                  control={form.control}
                  name="loadDetails.expiryDate"
                  render={({ field }) => {
                    const selected = field.value
                      ? new Date(field.value as string)
                      : undefined;
                    return (
                      <FormItem className="space-y-2">
                        <FormLabel className="font-medium text-neutral-900">
                          Expiry Date
                        </FormLabel>
                        <FormControl>
                          <Popover
                            open={expiryOpen}
                            onOpenChange={setExpiryOpen}
                          >
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="h-11 w-full justify-start rounded-lg border-neutral-300 text-left font-normal"
                              >
                                {selected
                                  ? selected.toLocaleDateString()
                                  : "Pick a date"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={selected}
                                onSelect={(date) => {
                                  if (!date) {
                                    field.onChange("");
                                    return;
                                  }
                                  const iso = new Date(
                                    Date.UTC(
                                      date.getFullYear(),
                                      date.getMonth(),
                                      date.getDate()
                                    )
                                  ).toISOString();
                                  field.onChange(iso);
                                  setExpiryOpen(false);
                                }}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              )}
            </div>

            {/* Estimates Row */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <FormField
                control={form.control}
                name="loadDetails.estimatedRetailPrice"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="font-medium text-neutral-900">
                      Estimated Retail Price
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className={controlClass}
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => {
                          const n =
                            e.currentTarget.value === ""
                              ? undefined
                              : e.currentTarget.valueAsNumber;
                          field.onChange(
                            Number.isFinite(n as number) ? n : undefined
                          );
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="loadDetails.estimatedCasePacks"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="font-medium text-neutral-900">
                      Estimated Case Packs
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        className={controlClass}
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => {
                          const n =
                            e.currentTarget.value === ""
                              ? undefined
                              : e.currentTarget.valueAsNumber;
                          field.onChange(
                            Number.isFinite(n as number) ? n : undefined
                          );
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="loadDetails.estimatedTotalUnits"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="font-medium text-neutral-900">
                      Estimated Total Units
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        className={controlClass}
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => {
                          const n =
                            e.currentTarget.value === ""
                              ? undefined
                              : e.currentTarget.valueAsNumber;
                          field.onChange(
                            Number.isFinite(n as number) ? n : undefined
                          );
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/*
                TODO: The following field is intentionally disabled per requirements.
                Field: Estimated Avg. Cost per Unit (loadDetails.estimatedAvgCostPerUnit)
                Reason: Not required for now.

              <FormField
                control={form.control}
                name="loadDetails.estimatedAvgCostPerUnit"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-neutral-900 font-medium">Estimated Avg. Cost per Unit</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className={controlClass}
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) => {
                          const n = e.currentTarget.value === '' ? undefined : e.currentTarget.valueAsNumber
                          field.onChange(Number.isFinite(n as number) ? n : undefined)
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              */}
            </div>

            {/* Short Description */}
            <div>
              <FormField
                control={form.control}
                name="loadDetails.shortDescription"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="font-medium text-neutral-900">
                      Short Description
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Free text: highlights, disclaimers"
                        className={`resize-none ${controlClass}`}
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
});
