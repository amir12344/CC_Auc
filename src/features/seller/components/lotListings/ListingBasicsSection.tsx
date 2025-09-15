"use client";

import React from "react";
import type { UseFormReturn } from "react-hook-form";

import { ChevronDown, ChevronRight } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/src/components/ui/card";
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
import { TagsInput } from "@/src/components/ui/tags-input";
import { MultiSelectCommand } from "@/src/components/ui/multi-select-command";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import { Textarea } from "@/src/components/ui/textarea";

import {
  CATEGORIES,
  SOURCE_NAMES,
  SOURCE_TYPES,
  SUBCATEGORIES,
} from "../../constants/lotListingsConstants";
import type { LotListingsFormData } from "../../schemas/lotListingsSchema";

interface ListingBasicsSectionProps {
  form: UseFormReturn<LotListingsFormData>;
  isOpen: boolean;
  onToggleAction: () => void;
}

export const ListingBasicsSection = React.memo(function ListingBasicsSection({
  form,
  isOpen,
  onToggleAction,
}: ListingBasicsSectionProps) {
  const controlClass =
    "min-w-0 w-full max-w-full h-11 rounded-lg border-neutral-300 focus-visible:ring-2 focus-visible:ring-neutral-900/10 focus-visible:ring-offset-0";

  // Keep categoryPercentages keys in sync with selected categories
  const selectedCatsForEffect: string[] =
    form.watch("listingBasics.categories") || [];
  React.useEffect(() => {
    const current = (form.getValues("listingBasics.categoryPercentages") ||
      {}) as Record<string, number>;
    const next: Record<string, number> = {};
    for (const c of selectedCatsForEffect) {
      const val = (current as any)[c];
      if (typeof val === "number") {
        next[c] = val;
      }
    }
    if (JSON.stringify(current) !== JSON.stringify(next)) {
      form.setValue("listingBasics.categoryPercentages", next as any, {
        shouldDirty: true,
        shouldTouch: true,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(selectedCatsForEffect)]);

  return (
    <Card className="rounded-xl border border-neutral-200 shadow-sm">
      <Collapsible open={isOpen} onOpenChange={onToggleAction}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer transition-colors hover:bg-neutral-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="grid h-7 w-7 place-items-center rounded-full border border-neutral-300 text-xs font-medium text-neutral-900">
                  1
                </div>
                <div>
                  <h3 className="text-base font-semibold text-neutral-900">
                    Listing Basics
                  </h3>
                  <p className="text-xs text-neutral-600">
                    Essential information about your listing
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
            <div className="mt-2 grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Listing Title */}
              <FormField
                control={form.control}
                name="listingBasics.listingTitle"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="font-medium text-neutral-900">
                      Listing Title <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Headline buyers see on listing page"
                        className={controlClass}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Short Listing Title */}
              <FormField
                control={form.control}
                name="listingBasics.shortListingTitle"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="font-medium text-neutral-900">
                      Short Listing Title{" "}
                      <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Short version for home/category pages"
                        className={controlClass}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Listing Label */}
              <FormField
                control={form.control}
                name="listingBasics.listingLabel"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="font-medium text-neutral-900">
                      Listing Label
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Optional listing label"
                        className={controlClass}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Asking Price */}
              <FormField
                control={form.control}
                name="listingBasics.askingPrice"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="font-medium text-neutral-900">
                      Asking Price ($) <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        inputMode="decimal"
                        className={controlClass}
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          // Allow empty string, numbers, and decimal points
                          if (value === "" || /^\d*\.?\d*$/.test(value)) {
                            field.onChange(
                              value === ""
                                ? undefined
                                : parseFloat(value) || undefined
                            );
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Source Type */}
              <FormField
                control={form.control}
                name="listingBasics.sourceType"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="font-medium text-neutral-900">
                      Source Type <span className="text-red-500">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || undefined}
                    >
                      <FormControl>
                        <SelectTrigger className={controlClass}>
                          <SelectValue placeholder="Select source type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {SOURCE_TYPES.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Source Name */}
              <FormField
                control={form.control}
                name="listingBasics.sourceName"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="font-medium text-neutral-900">
                      Source Name <span className="text-red-500">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || undefined}
                    >
                      <FormControl>
                        <SelectTrigger className={controlClass}>
                          <SelectValue placeholder="Select source name" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {SOURCE_NAMES.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Categories */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Category (Multi-select) */}
              <FormField
                control={form.control}
                name="listingBasics.categories"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="font-medium text-neutral-900">
                      Category <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <MultiSelectCommand
                        hideLabel
                        options={CATEGORIES}
                        selected={field.value || []}
                        onChange={(vals) => {
                          if ((vals?.length || 0) <= 5) field.onChange(vals);
                        }}
                        placeholder="Select 1-5 categories"
                        className={controlClass}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Subcategory (Multi-select) */}
              <FormField
                control={form.control}
                name="listingBasics.subcategories"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="font-medium text-neutral-900">
                      Subcategory <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <MultiSelectCommand
                        hideLabel
                        options={SUBCATEGORIES}
                        selected={field.value || []}
                        onChange={(vals) => {
                          if ((vals?.length || 0) <= 5) field.onChange(vals);
                        }}
                        placeholder="Select 1-5 subcategories"
                        className={controlClass}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Category Percentages and Tags */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Category % Estimates */}
              <FormField
                control={form.control}
                name="listingBasics.categoryPercentages"
                render={() => {
                  const selectedCats: string[] =
                    form.watch("listingBasics.categories") || [];
                  const percentages =
                    form.watch("listingBasics.categoryPercentages") || {};

                  const total = Object.values(percentages || {}).reduce(
                    (sum: number, v: any) =>
                      sum + (typeof v === "number" ? v : 0),
                    0
                  );

                  return (
                    <FormItem className="space-y-2">
                      <FormLabel className="font-medium text-neutral-900">
                        Category % Estimates
                      </FormLabel>
                      <FormControl>
                        <div className="rounded-lg border border-neutral-300">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="px-3">Category</TableHead>
                                <TableHead className="px-3 text-right">
                                  Estimate %
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {selectedCats.length === 0 ? (
                                <TableRow>
                                  <TableCell
                                    colSpan={2}
                                    className="px-3 py-4 text-neutral-500"
                                  >
                                    Select categories to add rows
                                  </TableCell>
                                </TableRow>
                              ) : (
                                selectedCats.map((cat) => {
                                  const label =
                                    CATEGORIES.find((c) => c.value === cat)
                                      ?.label || cat;
                                  const value = (percentages as any)?.[cat];
                                  return (
                                    <TableRow key={cat}>
                                      <TableCell className="px-3 py-2 text-neutral-900">
                                        {label}
                                      </TableCell>
                                      <TableCell className="px-3 py-2 text-right">
                                        <Input
                                          type="number"
                                          min={0}
                                          max={100}
                                          step="1"
                                          placeholder="0"
                                          className="w-28 text-right"
                                          value={
                                            typeof value === "number" ||
                                            value === 0
                                              ? String(value)
                                              : ""
                                          }
                                          onChange={(e) => {
                                            const raw = e.target.value;
                                            const num =
                                              raw === ""
                                                ? undefined
                                                : Number(raw);
                                            const next = {
                                              ...(form.getValues(
                                                "listingBasics.categoryPercentages"
                                              ) || {}),
                                            } as any;
                                            if (num === undefined) {
                                              delete next[cat];
                                            } else if (!Number.isNaN(num)) {
                                              next[cat] = Math.max(
                                                0,
                                                Math.min(100, num)
                                              );
                                            }
                                            // Log next state and running total for verification
                                            const runningTotal = Object.values(
                                              next
                                            ).reduce(
                                              (s: number, v: any) =>
                                                s +
                                                (typeof v === "number" ? v : 0),
                                              0
                                            );
                                            form.setValue(
                                              "listingBasics.categoryPercentages",
                                              next,
                                              {
                                                shouldDirty: true,
                                                shouldTouch: true,
                                              }
                                            );
                                          }}
                                        />
                                      </TableCell>
                                    </TableRow>
                                  );
                                })
                              )}
                              {selectedCats.length > 0 && (
                                <TableRow>
                                  <TableCell className="px-3 py-2 font-medium text-neutral-900">
                                    Total
                                  </TableCell>
                                  <TableCell className="px-3 py-2 text-right font-medium text-neutral-900">
                                    {total}%
                                  </TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              {/* Seasonal/Event Tags */}
              <FormField
                control={form.control}
                name="listingBasics.seasonalEventTags"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="font-medium text-neutral-900">
                      Seasonal/Event Tags
                    </FormLabel>
                    <FormControl>
                      <TagsInput
                        placeholder="Type a tag and press Enter"
                        className={controlClass}
                        value={field.value || []}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Additional Notes Section */}
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="listingBasics.sellerNotes"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="font-medium text-neutral-900">
                      Seller Notes
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Free text: warnings, restrictions, or incentives"
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

            {/* Sample SKU Details */}
            <div>
              <FormField
                control={form.control}
                name="listingBasics.sampleSkuDetails"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="font-medium text-neutral-900">
                      Sample SKU Details
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Upload an image or list of 3-5 representative SKUs or ASINs"
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
