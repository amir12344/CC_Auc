"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { City, Country, State } from "country-state-city";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { z } from "zod";

import { Button } from "@/src/components/ui/button";
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
  createShippingAddress,
  fetchShippingAddress,
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

export function ShippingSection() {
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [shippingAddress, setShippingAddress] =
    useState<ShippingAddress | null>(null);
  const [openCountry, setOpenCountry] = useState(false);
  const [openProvince, setOpenProvince] = useState(false);
  const [openCity, setOpenCity] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("");
  const [addressToPopulate, setAddressToPopulate] =
    useState<ShippingAddress | null>(null);
  const [populationAttempted, setPopulationAttempted] = useState(false);

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
  const provinces = useMemo(
    () => (selectedCountry ? State.getStatesOfCountry(selectedCountry) : []),
    [selectedCountry]
  );
  const cities =
    selectedCountry && selectedProvince
      ? City.getCitiesOfState(selectedCountry, selectedProvince)
      : [];

  const populateFormWithoutProvince = useCallback(() => {
    if (addressToPopulate && !populationAttempted) {
      form.reset({
        firstName: addressToPopulate.firstName,
        lastName: addressToPopulate.lastName,
        company: addressToPopulate.company || "",
        address1: addressToPopulate.address1,
        address2: addressToPopulate.address2 || "",
        address3: addressToPopulate.address3 || "",
        city: addressToPopulate.city,
        province: "", // Leave empty for manual selection
        provinceCode: "",
        country: addressToPopulate.country,
        countryCode: addressToPopulate.countryCode,
        zip: addressToPopulate.zip,
        phone: addressToPopulate.phone || "",
      });
      setPopulationAttempted(true);
      setAddressToPopulate(null);

      toast({
        title: "Address Loaded",
        description: "Please manually select your province from the dropdown.",
        variant: "default",
      });
    }
  }, [addressToPopulate, populationAttempted, form]);

  const loadAddress = useCallback(async () => {
    setIsInitialLoading(true);
    const { data: address, error } = await fetchShippingAddress();
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
      setIsInitialLoading(false);
      return;
    }
    setShippingAddress(address);

    // Reset population state for new address
    setPopulationAttempted(false);

    // Store address data for sequential population
    if (address) {
      setAddressToPopulate(address);
    }
    setIsInitialLoading(false);
  }, []);

  useEffect(() => {
    loadAddress();
  }, [loadAddress]);

  // Step 1: Set country when address data is available
  useEffect(() => {
    if (addressToPopulate?.countryCode) {
      setSelectedCountry(addressToPopulate.countryCode);
    }
  }, [addressToPopulate]);

  // Step 2: Set province when country is set and provinces are available
  useEffect(() => {
    if (
      addressToPopulate &&
      selectedCountry &&
      provinces.length > 0 &&
      !populationAttempted
    ) {
      // Try to match by province code first
      let provinceExists = provinces.find(
        (p) => p.isoCode === addressToPopulate.provinceCode
      );

      // If not found by code, try to match by name
      if (!provinceExists) {
        provinceExists = provinces.find(
          (p) => p.name === addressToPopulate.province
        );
      }

      if (provinceExists) {
        setSelectedProvince(provinceExists.isoCode);
      } else {
        // Province not found, populate form without province
        populateFormWithoutProvince();
      }
    }
  }, [
    selectedCountry,
    provinces,
    addressToPopulate,
    populationAttempted,
    populateFormWithoutProvince,
  ]);

  // Step 3: Populate all form fields when country and province are set
  useEffect(() => {
    if (
      addressToPopulate &&
      selectedCountry &&
      selectedProvince &&
      !populationAttempted
    ) {
      form.reset({
        firstName: addressToPopulate.firstName,
        lastName: addressToPopulate.lastName,
        company: addressToPopulate.company || "",
        address1: addressToPopulate.address1,
        address2: addressToPopulate.address2 || "",
        address3: addressToPopulate.address3 || "",
        city: addressToPopulate.city,
        province: addressToPopulate.province,
        provinceCode: addressToPopulate.provinceCode,
        country: addressToPopulate.country,
        countryCode: addressToPopulate.countryCode,
        zip: addressToPopulate.zip,
        phone: addressToPopulate.phone || "",
      });
      setPopulationAttempted(true);
      setAddressToPopulate(null);
    }
  }, [
    selectedCountry,
    selectedProvince,
    addressToPopulate,
    form,
    populationAttempted,
  ]);

  // Fallback: Populate form without province after timeout
  useEffect(() => {
    if (addressToPopulate && selectedCountry && !populationAttempted) {
      const timer = setTimeout(() => {
        populateFormWithoutProvince();
      }, 3000); // 3 second timeout

      return () => clearTimeout(timer);
    }
  }, [
    addressToPopulate,
    selectedCountry,
    populationAttempted,
    populateFormWithoutProvince,
  ]);

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    const addressData: ShippingAddress = {
      addressType: "DEFAULT",
      ...data,
    };

    const result = await createShippingAddress(addressData);
    setIsLoading(false);

    if (result.success) {
      toast({
        title: "Success",
        description: "Address saved successfully",
      });
      await loadAddress();
    } else {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
    }
  };

  if (isInitialLoading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="flex items-center justify-center p-6 lg:p-8">
          <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
          <span className="ml-2 text-gray-500">
            Loading shipping address...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <div className="p-6 lg:p-8">
        <header className="mb-6 flex items-center gap-3">
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
              Shipping Address
            </h3>
            <p className="text-sm text-gray-500">
              {shippingAddress
                ? "Update your shipping address information"
                : "Add your shipping address information"}
            </p>
          </div>
        </header>

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
                disabled={isLoading || shippingAddress !== null}
                type="submit"
              >
                {isLoading ? "Saving..." : "Save Shipping Address"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
