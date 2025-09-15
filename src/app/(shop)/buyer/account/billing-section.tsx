"use client";

import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { City, Country, State } from "country-state-city";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { z } from "zod";

import { Button } from "@/src/components/ui/button";
import { Checkbox } from "@/src/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/src/components/ui/command";
import {
  Form,
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
import { toast } from "@/src/hooks/use-toast";
import { cn } from "@/src/lib/utils";

import {
  createBillingAddress,
  fetchBillingAddress,
  fetchShippingAddress,
  type BillingAddress,
  type ShippingAddress,
} from "./services/profileQueryService";

const formSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  company: z.string().optional(),
  address1: z.string().min(1, "Address 1 is required"),
  address2: z.string().optional(),
  address3: z.string().optional(),
  city: z.string().min(1, "City is required"),
  province: z.string().min(1, "Province is required"),
  provinceCode: z.string().min(1, "Province code is required"),
  country: z.string().min(1, "Country is required"),
  countryCode: z.string().min(1, "Country code is required"),
  zip: z.string().min(1, "Zip is required"),
  phone: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function BillingSection() {
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [billingAddress, setBillingAddress] = useState<BillingAddress | null>(
    null
  );
  const [shippingAddress, setShippingAddress] =
    useState<ShippingAddress | null>(null);
  const [sameAsShipping, setSameAsShipping] = useState(false);
  const [openCountry, setOpenCountry] = useState(false);
  const [openProvince, setOpenProvince] = useState(false);
  const [openCity, setOpenCity] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      company: "",
      address1: "",
      address2: "",
      address3: "",
      city: "",
      province: "",
      provinceCode: "",
      country: "",
      countryCode: "",
      zip: "",
      phone: "",
    },
  });

  const countries = Country.getAllCountries();
  const provinces = selectedCountry
    ? State.getStatesOfCountry(selectedCountry)
    : [];
  const cities =
    selectedCountry && selectedProvince
      ? City.getCitiesOfState(selectedCountry, selectedProvince)
      : [];

  const loadBillingAddress = useCallback(async () => {
    const { data: address, error } = await fetchBillingAddress();
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
      return;
    }

    setBillingAddress(address);

    // Immediately populate the form if address exists and not using shipping
    if (address && !sameAsShipping) {
      form.reset({
        firstName: address.firstName,
        lastName: address.lastName,
        company: address.company || "",
        address1: address.address1,
        address2: address.address2 || "",
        address3: address.address3 || "",
        city: address.city,
        province: address.province,
        provinceCode: address.provinceCode,
        country: address.country,
        countryCode: address.countryCode,
        zip: address.zip,
        phone: address.phone || "",
      });
      setSelectedCountry(address.countryCode);
      setSelectedProvince(address.provinceCode);
    }
  }, [sameAsShipping, form]);

  const loadShippingAddress = useCallback(async () => {
    const { data: address, error } = await fetchShippingAddress();
    if (error) {
      return;
    }
    setShippingAddress(address);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setIsInitialLoading(true);
      await Promise.all([loadBillingAddress(), loadShippingAddress()]);
      setIsInitialLoading(false);
    };
    loadData();
  }, [loadBillingAddress, loadShippingAddress]);

  // Helper function to populate form with shipping address
  const populateWithShippingAddress = useCallback(() => {
    if (!shippingAddress) {
      return;
    }

    form.reset({
      firstName: shippingAddress.firstName,
      lastName: shippingAddress.lastName,
      company: shippingAddress.company || "",
      address1: shippingAddress.address1,
      address2: shippingAddress.address2 || "",
      address3: shippingAddress.address3 || "",
      city: shippingAddress.city,
      province: shippingAddress.province,
      provinceCode: shippingAddress.provinceCode,
      country: shippingAddress.country,
      countryCode: shippingAddress.countryCode,
      zip: shippingAddress.zip,
      phone: shippingAddress.phone || "",
    });
    setSelectedCountry(shippingAddress.countryCode);
    setSelectedProvince(shippingAddress.provinceCode);
  }, [shippingAddress, form]);

  // Helper function to populate form with billing address
  const populateWithBillingAddress = useCallback(() => {
    if (!billingAddress) {
      return;
    }

    form.reset({
      firstName: billingAddress.firstName,
      lastName: billingAddress.lastName,
      company: billingAddress.company || "",
      address1: billingAddress.address1,
      address2: billingAddress.address2 || "",
      address3: billingAddress.address3 || "",
      city: billingAddress.city,
      province: billingAddress.province,
      provinceCode: billingAddress.provinceCode,
      country: billingAddress.country,
      countryCode: billingAddress.countryCode,
      zip: billingAddress.zip,
      phone: billingAddress.phone || "",
    });
    setSelectedCountry(billingAddress.countryCode);
    setSelectedProvince(billingAddress.provinceCode);
  }, [billingAddress, form]);

  // Helper function to clear form
  const clearForm = useCallback(() => {
    form.reset({
      firstName: "",
      lastName: "",
      company: "",
      address1: "",
      address2: "",
      address3: "",
      city: "",
      province: "",
      provinceCode: "",
      country: "",
      countryCode: "",
      zip: "",
      phone: "",
    });
    setSelectedCountry("");
    setSelectedProvince("");
  }, [form]);

  // Handle "same as shipping" checkbox
  const handleSameAsShippingChange = useCallback(
    (checked: boolean) => {
      setSameAsShipping(checked);

      if (checked && shippingAddress) {
        populateWithShippingAddress();
      } else if (!checked) {
        if (billingAddress) {
          populateWithBillingAddress();
        } else {
          clearForm();
        }
      }
    },
    [
      shippingAddress,
      billingAddress,
      populateWithShippingAddress,
      populateWithBillingAddress,
      clearForm,
    ]
  );

  // No complex useEffect chains needed - form is populated directly when data loads

  const onSubmit = useCallback(
    async (data: FormValues) => {
      setIsLoading(true);
      const addressData: BillingAddress = {
        addressType: "BILLING",
        ...data,
      };

      const result = await createBillingAddress(addressData);
      setIsLoading(false);

      if (result.success) {
        toast({
          title: "Success",
          description: "Billing address saved successfully",
        });
        await loadBillingAddress();
        // If same as shipping was checked, we don't need to uncheck it
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      }
    },
    [loadBillingAddress]
  );

  if (isInitialLoading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="flex items-center justify-center p-6 lg:p-8">
          <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
          <span className="ml-2 text-gray-500">Loading billing address...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <div className="p-6 lg:p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
            <svg
              aria-hidden="true"
              className="h-5 w-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Billing Address
            </h3>
            <p className="text-sm text-gray-500">
              {billingAddress
                ? "Update your billing address information"
                : "Add your billing address information"}
            </p>
          </div>
        </div>

        {/* Same as shipping checkbox */}
        {shippingAddress && (
          <div className="mb-6 flex items-center space-x-2">
            <Checkbox
              checked={sameAsShipping}
              id="same-as-shipping"
              onCheckedChange={handleSameAsShippingChange}
            />
            <label
              className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              htmlFor="same-as-shipping"
            >
              Same as shipping address
            </label>
          </div>
        )}

        <Form {...form}>
          <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-6">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input
                        className={cn(
                          "focus:border-primary focus:ring-primary/20 w-full rounded-lg border px-4 py-3 text-sm transition-colors focus:ring-2",
                          form.formState.errors.firstName
                            ? "border-red-300"
                            : "border-gray-300"
                        )}
                        placeholder="Enter first name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input
                        className={cn(
                          "focus:border-primary focus:ring-primary/20 w-full rounded-lg border px-4 py-3 text-sm transition-colors focus:ring-2",
                          form.formState.errors.lastName
                            ? "border-red-300"
                            : "border-gray-300"
                        )}
                        placeholder="Enter last name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company</FormLabel>
                    <FormControl>
                      <Input
                        className={cn(
                          "focus:border-primary focus:ring-primary/20 w-full rounded-lg border px-4 py-3 text-sm transition-colors focus:ring-2",
                          form.formState.errors.company
                            ? "border-red-300"
                            : "border-gray-300"
                        )}
                        placeholder="Enter company"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address 1</FormLabel>
                    <FormControl>
                      <Input
                        className={cn(
                          "focus:border-primary focus:ring-primary/20 w-full rounded-lg border px-4 py-3 text-sm transition-colors focus:ring-2",
                          form.formState.errors.address1
                            ? "border-red-300"
                            : "border-gray-300"
                        )}
                        placeholder="Enter address 1"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address 2</FormLabel>
                    <FormControl>
                      <Input
                        className={cn(
                          "focus:border-primary focus:ring-primary/20 w-full rounded-lg border px-4 py-3 text-sm transition-colors focus:ring-2",
                          form.formState.errors.address2
                            ? "border-red-300"
                            : "border-gray-300"
                        )}
                        placeholder="Enter address 2"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address3"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address 3</FormLabel>
                    <FormControl>
                      <Input
                        className={cn(
                          "focus:border-primary focus:ring-primary/20 w-full rounded-lg border px-4 py-3 text-sm transition-colors focus:ring-2",
                          form.formState.errors.address3
                            ? "border-red-300"
                            : "border-gray-300"
                        )}
                        placeholder="Enter address 3"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Country</FormLabel>
                    <Popover onOpenChange={setOpenCountry} open={openCountry}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            className={cn(
                              "focus:border-primary focus:ring-primary/20 w-full justify-between rounded-lg px-4 py-3 text-sm transition-colors focus:ring-2",
                              !field.value && "text-muted-foreground",
                              form.formState.errors.country
                                ? "border-red-300"
                                : "border-gray-300"
                            )}
                            variant="outline"
                          >
                            {field.value
                              ? countries.find(
                                  (country) => country.name === field.value
                                )?.name
                              : "Select country"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Search country..." />
                          <CommandEmpty>No country found.</CommandEmpty>
                          <CommandGroup className="max-h-[200px] overflow-auto">
                            {countries.map((country) => (
                              <CommandItem
                                key={country.isoCode}
                                onSelect={() => {
                                  form.setValue("country", country.name);
                                  form.setValue("countryCode", country.isoCode);
                                  setSelectedCountry(country.isoCode);
                                  form.setValue("province", "");
                                  form.setValue("provinceCode", "");
                                  form.setValue("city", "");
                                  setSelectedProvince("");
                                  setOpenCountry(false);
                                }}
                                value={country.name}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    country.name === field.value
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {country.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="countryCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country Code</FormLabel>
                    <FormControl>
                      <Input
                        className={cn(
                          "focus:border-primary focus:ring-primary/20 w-full cursor-not-allowed rounded-lg border bg-gray-50 px-4 py-3 text-sm transition-colors focus:ring-2",
                          form.formState.errors.countryCode
                            ? "border-red-300"
                            : "border-gray-300"
                        )}
                        disabled
                        placeholder="Auto-filled"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="province"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Province</FormLabel>
                    <Popover onOpenChange={setOpenProvince} open={openProvince}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            className={cn(
                              "focus:border-primary focus:ring-primary/20 w-full justify-between rounded-lg px-4 py-3 text-sm transition-colors focus:ring-2",
                              !field.value && "text-muted-foreground",
                              form.formState.errors.province
                                ? "border-red-300"
                                : "border-gray-300"
                            )}
                            disabled={!selectedCountry}
                            variant="outline"
                          >
                            {field.value
                              ? provinces.find(
                                  (province) => province.name === field.value
                                )?.name
                              : "Select province"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Search province..." />
                          <CommandEmpty>No province found.</CommandEmpty>
                          <CommandGroup className="max-h-[200px] overflow-auto">
                            {provinces.map((province) => (
                              <CommandItem
                                key={province.isoCode}
                                onSelect={() => {
                                  form.setValue("province", province.name);
                                  form.setValue(
                                    "provinceCode",
                                    province.isoCode
                                  );
                                  setSelectedProvince(province.isoCode);
                                  form.setValue("city", "");
                                  setOpenProvince(false);
                                }}
                                value={province.name}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    province.name === field.value
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {province.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="provinceCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Province Code</FormLabel>
                    <FormControl>
                      <Input
                        className={cn(
                          "focus:border-primary focus:ring-primary/20 w-full cursor-not-allowed rounded-lg border bg-gray-50 px-4 py-3 text-sm transition-colors focus:ring-2",
                          form.formState.errors.provinceCode
                            ? "border-red-300"
                            : "border-gray-300"
                        )}
                        disabled
                        placeholder="Auto-filled"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>City</FormLabel>
                    <Popover onOpenChange={setOpenCity} open={openCity}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            className={cn(
                              "focus:border-primary focus:ring-primary/20 w-full justify-between rounded-lg px-4 py-3 text-sm transition-colors focus:ring-2",
                              !field.value && "text-muted-foreground",
                              form.formState.errors.city
                                ? "border-red-300"
                                : "border-gray-300"
                            )}
                            disabled={!selectedProvince}
                            variant="outline"
                          >
                            {field.value || "Select city"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Search city..." />
                          <CommandEmpty>No city found.</CommandEmpty>
                          <CommandGroup className="max-h-[200px] overflow-auto">
                            {cities.map((city) => (
                              <CommandItem
                                key={city.name}
                                onSelect={() => {
                                  form.setValue("city", city.name);
                                  setOpenCity(false);
                                }}
                                value={city.name}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    city.name === field.value
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {city.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="zip"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Zip</FormLabel>
                    <FormControl>
                      <Input
                        className={cn(
                          "focus:border-primary focus:ring-primary/20 w-full rounded-lg border px-4 py-3 text-sm transition-colors focus:ring-2",
                          form.formState.errors.zip
                            ? "border-red-300"
                            : "border-gray-300"
                        )}
                        placeholder="Enter zip"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Phone</FormLabel>
                    <div className="relative">
                      <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 transform text-sm font-medium text-gray-500">
                        +1
                      </span>
                      <FormControl>
                        <Input
                          className={cn(
                            "focus:border-primary focus:ring-primary/20 w-full rounded-lg border px-4 py-3 pl-10 text-sm transition-colors focus:ring-2",
                            form.formState.errors.phone
                              ? "border-red-300"
                              : "border-gray-300"
                          )}
                          placeholder="123 456-7890"
                          {...field}
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="mt-6 flex justify-end border-gray-200">
              <Button
                className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer rounded-full px-6 py-5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isLoading || billingAddress !== null}
                type="submit"
              >
                {isLoading ? "Saving..." : "Save Billing Address"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
