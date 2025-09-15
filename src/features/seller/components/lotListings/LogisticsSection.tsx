"use client";

import React, { useMemo } from "react";
import type { UseFormReturn } from "react-hook-form";

import {
  City,
  Country,
  State,
  type ICity,
  type ICountry,
  type IState,
} from "country-state-city";
import { ChevronDown, ChevronRight } from "lucide-react";

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Textarea } from "@/src/components/ui/textarea";

import {
  FREIGHT_TYPES,
  LOT_PACKAGING_OPTIONS,
  SHIPPING_TYPES,
  WEIGHT_TYPES,
} from "../../constants/lotListingsConstants";
import type { LotListingsFormData } from "../../schemas/lotListingsSchema";

interface LogisticsSectionProps {
  form: UseFormReturn<LotListingsFormData>;
  isOpen: boolean;
  onToggleAction: () => void;
}

export const LogisticsSection = React.memo(function LogisticsSection({
  form,
  isOpen,
  onToggleAction,
}: LogisticsSectionProps) {
  const controlClass =
    "min-w-0 w-full max-w-full h-11 rounded-lg border-neutral-300 focus-visible:ring-2 focus-visible:ring-neutral-900/10 focus-visible:ring-offset-0";
  const textareaClass =
    "w-full rounded-lg border-neutral-300 focus-visible:ring-2 focus-visible:ring-neutral-900/10 focus-visible:ring-offset-0";
  const labelClass = "text-sm text-neutral-900 font-medium";
  const helpClass = "text-xs text-neutral-600";
  const countryOptions = useMemo(
    () =>
      Country.getAllCountries().map((c: ICountry) => ({
        value: c.isoCode,
        label: c.name,
      })),
    []
  );
  const selectedCountryCode =
    form.watch("logistics.warehouseCountryCode") || "";
  const stateOptions = useMemo(
    () =>
      selectedCountryCode
        ? State.getStatesOfCountry(selectedCountryCode).map((s: IState) => ({
            value: s.isoCode,
            label: s.name,
          }))
        : [],
    [selectedCountryCode]
  );
  const selectedStateCode = form.watch("logistics.warehouseStateCode") || "";
  const cityOptions = useMemo(
    () =>
      selectedCountryCode && selectedStateCode
        ? City.getCitiesOfState(selectedCountryCode, selectedStateCode).map(
            (c: ICity) => ({ value: c.name, label: c.name })
          )
        : [],
    [selectedCountryCode, selectedStateCode]
  );
  return (
    <Card className="rounded-xl border border-neutral-200 shadow-sm">
      <Collapsible open={isOpen} onOpenChange={onToggleAction}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer transition-colors hover:bg-neutral-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="grid h-7 w-7 place-items-center rounded-full border border-neutral-300 text-xs font-medium text-neutral-900">
                  5
                </div>
                <div>
                  <h3 className="text-base font-semibold text-neutral-900">
                    Logistics
                  </h3>
                  <p className="text-xs text-neutral-600">
                    Shipping and logistics information
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
            {/* Location */}
            <div className="space-y-4">
              <div className="text-xs font-medium text-neutral-700">
                Location
              </div>

              {/* Country / State / City */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="logistics.warehouseCountryCode"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className={labelClass}>
                        Warehouse Country{" "}
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={(v) => {
                          field.onChange(v);
                          form.setValue("logistics.warehouseStateCode", "");
                          form.setValue("logistics.warehouseCityCode", "");
                        }}
                        value={field.value || undefined}
                      >
                        <FormControl>
                          <SelectTrigger className={controlClass}>
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {countryOptions.map((c) => (
                            <SelectItem key={c.value} value={c.value}>
                              {c.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="logistics.warehouseStateCode"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className={labelClass}>
                        Warehouse State <span className="text-red-500">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={(v) => {
                          field.onChange(v);
                          form.setValue("logistics.warehouseCityCode", "");
                        }}
                        value={field.value || undefined}
                      >
                        <FormControl>
                          <SelectTrigger className={controlClass}>
                            <SelectValue placeholder="Select state" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {stateOptions.map((s) => (
                            <SelectItem key={s.value} value={s.value}>
                              {s.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="logistics.warehouseCityCode"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className={labelClass}>
                        Warehouse City <span className="text-red-500">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || undefined}
                      >
                        <FormControl>
                          <SelectTrigger className={controlClass}>
                            <SelectValue
                              placeholder={
                                selectedStateCode
                                  ? "Select city"
                                  : "Select state first"
                              }
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {cityOptions.map((c) => (
                            <SelectItem key={c.value} value={c.value}>
                              {c.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Address lines + Zip */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="logistics.warehouseAddress1"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className={labelClass}>
                        Address Line 1 <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Street address"
                          className={controlClass}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="logistics.warehouseAddress2"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className={labelClass}>
                        Address Line 2
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Apartment, suite, unit, etc. (optional)"
                          className={controlClass}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="logistics.warehouseAddress3"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className={labelClass}>
                        Address Line 3
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Additional address info (optional)"
                          className={controlClass}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="logistics.warehouseZipcode"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className={labelClass}>
                        Zip / Postal Code{" "}
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Zip / Postal Code"
                          className={controlClass}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Shipping & Freight */}
            <div className="border-t border-neutral-200 pt-2">
              <div className="mb-3 text-xs font-medium text-neutral-700">
                Shipping & Freight
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                <FormField
                  control={form.control}
                  name="logistics.shippingType"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className={labelClass}>
                        Shipping Type <span className="text-red-500">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || undefined}
                      >
                        <FormControl>
                          <SelectTrigger className={controlClass}>
                            <SelectValue placeholder="Select shipping type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {SHIPPING_TYPES.map((opt) => (
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

                <FormField
                  control={form.control}
                  name="logistics.freightType"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className={labelClass}>
                        Freight Type <span className="text-red-500">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || undefined}
                      >
                        <FormControl>
                          <SelectTrigger className={controlClass}>
                            <SelectValue placeholder="Select freight type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {FREIGHT_TYPES.map((opt) => (
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

                <FormField
                  control={form.control}
                  name="logistics.lotPackaging"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className={labelClass}>
                        Lot Packaging <span className="text-red-500">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || undefined}
                      >
                        <FormControl>
                          <SelectTrigger className={controlClass}>
                            <SelectValue placeholder="Select lot packaging" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {LOT_PACKAGING_OPTIONS.map((opt) => (
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
            </div>

            {/* Pallet Specs */}
            <div className="border-t border-neutral-200 pt-2">
              <div className="mb-3 text-xs font-medium text-neutral-700">
                Pallet Specs
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                <FormField
                  control={form.control}
                  name="logistics.weightType"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className={labelClass}>
                        Weight Type <span className="text-red-500">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || undefined}
                      >
                        <FormControl>
                          <SelectTrigger className={controlClass}>
                            <SelectValue placeholder="Select weight type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {WEIGHT_TYPES.map((opt) => (
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

                <FormField
                  control={form.control}
                  name="logistics.estimatedWeight"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className={labelClass}>
                        Estimated Weight/Volume{" "}
                        <span className="text-red-500">*</span>
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
                  name="logistics.palletDimension"
                  render={({ field }) => (
                    <FormItem className="col-span-1 min-w-0 space-y-2 md:col-span-2 lg:col-span-3">
                      <FormLabel className={labelClass}>
                        Pallet Dimension (L × W × H in inches){" "}
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="flex w-full flex-nowrap items-center gap-2 md:gap-3">
                          {(() => {
                            const raw = (field.value as string) || "";
                            const [len = "", wid = "", hei = ""] =
                              raw.split("x");
                            const toNum = (v: string) =>
                              v.replace(/[^0-9.]/g, "");
                            const update = (
                              nl?: string,
                              nw?: string,
                              nh?: string
                            ) => {
                              const L = toNum(nl ?? len);
                              const W = toNum(nw ?? wid);
                              const H = toNum(nh ?? hei);
                              const combined = [L, W, H]
                                .filter((v) => v !== "")
                                .join("x");
                              field.onChange(combined);
                              // Also sync individual numeric fields expected by schema/backend
                              const lNum = L === "" ? undefined : Number(L);
                              const wNum = W === "" ? undefined : Number(W);
                              const hNum = H === "" ? undefined : Number(H);
                              form.setValue(
                                "logistics.palletLength",
                                lNum as any,
                                {
                                  shouldValidate: true,
                                  shouldDirty: true,
                                  shouldTouch: true,
                                }
                              );
                              form.setValue(
                                "logistics.palletWidth",
                                wNum as any,
                                {
                                  shouldValidate: true,
                                  shouldDirty: true,
                                  shouldTouch: true,
                                }
                              );
                              form.setValue(
                                "logistics.palletHeight",
                                hNum as any,
                                {
                                  shouldValidate: true,
                                  shouldDirty: true,
                                  shouldTouch: true,
                                }
                              );
                            };
                            return (
                              <>
                                <Input
                                  value={len}
                                  inputMode="decimal"
                                  placeholder="L"
                                  className="h-10 w-14 rounded-md text-center md:w-16 lg:w-20"
                                  onChange={(e) =>
                                    update(e.target.value, undefined, undefined)
                                  }
                                />
                                <span className="text-neutral-500">×</span>
                                <Input
                                  value={wid}
                                  inputMode="decimal"
                                  placeholder="W"
                                  className="h-10 w-14 rounded-md text-center md:w-16 lg:w-20"
                                  onChange={(e) =>
                                    update(undefined, e.target.value, undefined)
                                  }
                                />
                                <span className="text-neutral-500">×</span>
                                <Input
                                  value={hei}
                                  inputMode="decimal"
                                  placeholder="H"
                                  className="h-10 w-14 rounded-md text-center md:w-16 lg:w-20"
                                  onChange={(e) =>
                                    update(undefined, undefined, e.target.value)
                                  }
                                />
                              </>
                            );
                          })()}
                        </div>
                      </FormControl>
                      {/* Surface validation errors from individual numeric fields since UI uses combined inputs */}
                      {(() => {
                        const errors =
                          (form.formState.errors as any)?.logistics || {};
                        const messages = [
                          errors?.palletLength?.message,
                          errors?.palletWidth?.message,
                          errors?.palletHeight?.message,
                        ].filter(Boolean);
                        return messages.length > 0 ? (
                          <div className="mt-1 text-sm text-red-600">
                            {messages.join(" ")}
                          </div>
                        ) : null;
                      })()}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Special Requirements */}
            <div className="border-t border-neutral-200 pt-2">
              <div className="mb-3 text-xs font-medium text-neutral-700">
                Special Requirements
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="logistics.palletStackable"
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
                          Pallet Stackable (Y/N)
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="logistics.isRefrigerated"
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
                          Refrigerated
                        </FormLabel>
                        <p className="text-sm text-neutral-600">
                          Requires temperature control
                        </p>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="logistics.isFdaRegistered"
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
                          FDA Registered
                        </FormLabel>
                        <p className="text-sm text-neutral-600">
                          FDA regulated products
                        </p>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="logistics.isHazmat"
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
                          Hazmat
                        </FormLabel>
                        <p className="text-sm text-neutral-600">
                          Hazardous materials
                        </p>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Quantities */}
            <div className="border-t border-neutral-200 pt-2">
              <div className="mb-3 text-xs font-medium text-neutral-700">
                Quantities
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                <FormField
                  control={form.control}
                  name="logistics.numberOfPallets"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="font-medium text-neutral-900">
                        Number of Pallets{" "}
                        <span className="text-red-500">*</span>
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
                  name="logistics.palletSpaces"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="font-medium text-neutral-900">
                        Pallet Spaces <span className="text-red-500">*</span>
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
                  name="logistics.numberOfTruckloads"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="font-medium text-neutral-900">
                        Number of Truckloads{" "}
                        <span className="text-red-500">*</span>
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
                  name="logistics.numberOfShipments"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="font-medium text-neutral-900">
                        Number of Shipments
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
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-6 border-t border-neutral-200 pt-2">
              <FormField
                control={form.control}
                name="logistics.shippingNotes"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-sm font-medium text-neutral-900">
                      Shipping Notes
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any special shipping instructions or notes"
                        className={`resize-none ${textareaClass}`}
                        rows={2}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="logistics.biddingRequirements"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-sm font-medium text-neutral-900">
                      Bidding Requirements
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any specific requirements for bidders (optional)"
                        className={`resize-none ${textareaClass}`}
                        rows={2}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="logistics.additionalInformation"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-sm font-medium text-neutral-900">
                      Additional Information
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any other relevant information about the listing"
                        className={`resize-none ${textareaClass}`}
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
