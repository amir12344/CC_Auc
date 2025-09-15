"use client";

import { useCallback, useEffect, useState } from "react";

import { format } from "date-fns";
import { CalendarIcon, Loader2, User } from "lucide-react";
import { z } from "zod";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/src/components/ui/alert-dialog";
import { Button } from "@/src/components/ui/button";
import { Calendar } from "@/src/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";
import { cn } from "@/src/lib/utils";
import { formatBackendError } from "@/src/utils/error-utils";

import {
  fetchBuyerDetails,
  updateUserProfile,
  type UserProfile,
} from "./services/profileQueryService";

// Phone regex for validation
const phoneRegex = /^\d{10}$/;

// Zod validation schema
const profileSchema = z.object({
  username: z.string().min(1, "Username is required"),
  email: z.string().email("Please enter a valid email address"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val.trim() === "") {
          return true; // Optional field
        }
        const digitsOnly = val.replace(/\D/g, "");
        return phoneRegex.test(digitsOnly);
      },
      {
        message: "Phone number must be exactly 10 digits",
      }
    ),
  userType: z.string().min(1, "User type is required"),
  company: z.string().min(1, "Company name is required"),
  title: z.string().optional(),
  jobTitle: z.string().min(1, "Job title is required"),
  dateOfBirth: z.date().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export function ProfileSection() {
  const [formData, setFormData] = useState<ProfileFormData>({
    username: "",
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    userType: "",
    company: "",
    title: "",
    jobTitle: "",
    dateOfBirth: undefined,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successOpen, setSuccessOpen] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const transformUserProfileToFormData = useCallback(
    (profile: UserProfile): ProfileFormData => {
      let phoneNumber = profile.phone || "";
      if (phoneNumber.startsWith("+1")) {
        phoneNumber = phoneNumber.substring(2);
      } else if (phoneNumber.startsWith("1") && phoneNumber.length === 11) {
        phoneNumber = phoneNumber.substring(1);
      }
      phoneNumber = phoneNumber.replace(/\D/g, "");

      return {
        username: profile.username || "",
        email: profile.email || "",
        firstName: profile.first_name || "",
        lastName: profile.last_name || "",
        phone: phoneNumber,
        userType: profile.user_type || "",
        company: profile.company || "",
        title: profile.title || "",
        jobTitle: profile.job_title || "",
        dateOfBirth: profile.date_of_birth
          ? new Date(profile.date_of_birth)
          : undefined,
      };
    },
    []
  );

  const loadUserProfile = useCallback(async () => {
    setIsLoading(true);
    try {
      const userProfile = await fetchBuyerDetails();
      if (userProfile && userProfile.length > 0) {
        const transformedData = transformUserProfileToFormData(userProfile[0]);
        setFormData(transformedData);
      }
    } catch (error) {
      setErrorMessage(formatBackendError(error));
      setErrorOpen(true);
    } finally {
      setIsLoading(false);
    }
  }, [transformUserProfileToFormData]);

  useEffect(() => {
    loadUserProfile();
  }, [loadUserProfile]);

  const validateForm = useCallback((): boolean => {
    try {
      profileSchema.parse(formData);
      setValidationErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        for (const err of error.errors) {
          if (err.path.length > 0) {
            errors[err.path[0] as string] = err.message;
          }
        }
        setValidationErrors(errors);
      }
      return false;
    }
  }, [formData]);

  const handleInputChange = useCallback(
    (field: keyof ProfileFormData, value: string) => {
      let processedValue = value;

      if (field === "phone") {
        let digitsOnly = value.replace(/\D/g, "");
        if (digitsOnly.startsWith("1") && digitsOnly.length > 10) {
          digitsOnly = digitsOnly.substring(1);
        }
        if (digitsOnly.length > 10) {
          digitsOnly = digitsOnly.substring(0, 10);
        }
        processedValue = digitsOnly;
      }

      setFormData((prev) => ({ ...prev, [field]: processedValue }));

      if (validationErrors[field]) {
        setValidationErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    },
    [validationErrors]
  );

  const handleFieldBlur = useCallback(() => {
    validateForm();
  }, [validateForm]);

  const handleDateChange = useCallback((date: Date | undefined) => {
    setFormData((prev) => ({ ...prev, dateOfBirth: date }));
  }, []);

  const formatDateForBackend = useCallback(
    (date: Date | undefined): string | null => {
      if (!date) {
        return null;
      }
      return format(date, "yyyy-MM-dd");
    },
    []
  );

  const handleSave = useCallback(async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const apiPayload = {
        username: formData.username,
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone ? `+1${formData.phone}` : undefined,
        userType: formData.userType,
        company: formData.company || undefined,
        title: formData.title || undefined,
        jobTitle: formData.jobTitle,
        dateOfBirth: formData.dateOfBirth,
      };

      const result = await updateUserProfile(apiPayload);

      if (result.success) {
        setSuccessOpen(true);
        // Reload the profile data to reflect any changes
        await loadUserProfile();
      } else {
        // Handle structured error response - parse JSON string if needed
        let errorToFormat = result.error;
        if (typeof result.error === "string") {
          try {
            errorToFormat = JSON.parse(result.error);
          } catch {
            // If parsing fails, use the string as is
            errorToFormat = result.error;
          }
        }
        setErrorMessage(formatBackendError(errorToFormat));
        setErrorOpen(true);
      }
    } catch (error) {
      setErrorMessage(formatBackendError(error));
      setErrorOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm, loadUserProfile]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleSave();
  };

  if (isLoading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="flex items-center justify-center p-6 lg:p-8">
          <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
          <span className="ml-2 text-gray-500">Loading profile...</span>
        </div>
      </div>
    );
  }

  return (
    <form
      className="rounded-lg border border-gray-200 bg-white"
      onSubmit={handleSubmit}
    >
      <div className="p-6 lg:p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
            <User className="h-5 w-5 text-gray-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Profile</h3>
            <p className="text-sm text-gray-500">
              Update your personal information
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-6">
          <div>
            <label
              className="mb-2 block text-sm font-medium text-gray-700"
              htmlFor="username"
            >
              Username *
            </label>
            <input
              className={cn(
                "focus:border-primary focus:ring-primary/20 w-full rounded-lg border px-4 py-3 text-sm transition-colors focus:ring-2",
                validationErrors.username ? "border-red-300" : "border-gray-300"
              )}
              id="username"
              onBlur={handleFieldBlur}
              onChange={(e) => handleInputChange("username", e.target.value)}
              placeholder="Enter your username"
              type="text"
              value={formData.username}
            />
            {validationErrors.username && (
              <p className="mt-1 text-sm text-red-600">
                {validationErrors.username}
              </p>
            )}
          </div>
          <div>
            <label
              className="mb-2 block text-sm font-medium text-gray-700"
              htmlFor="email"
            >
              Email *
            </label>
            <input
              className={cn(
                "focus:border-primary focus:ring-primary/20 w-full cursor-not-allowed rounded-lg border bg-gray-50 px-4 py-3 text-sm transition-colors focus:ring-2",
                validationErrors.email ? "border-red-300" : "border-gray-300"
              )}
              disabled={true}
              id="email"
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="Enter your email"
              type="email"
              value={formData.email}
            />
            {validationErrors.email && (
              <p className="mt-1 text-sm text-red-600">
                {validationErrors.email}
              </p>
            )}
          </div>
          <div>
            <label
              className="mb-2 block text-sm font-medium text-gray-700"
              htmlFor="firstName"
            >
              First Name *
            </label>
            <input
              className={cn(
                "focus:border-primary focus:ring-primary/20 w-full rounded-lg border px-4 py-3 text-sm transition-colors focus:ring-2",
                validationErrors.firstName
                  ? "border-red-300"
                  : "border-gray-300"
              )}
              id="firstName"
              onBlur={handleFieldBlur}
              onChange={(e) => handleInputChange("firstName", e.target.value)}
              placeholder="Enter your first name"
              type="text"
              value={formData.firstName}
            />
            {validationErrors.firstName && (
              <p className="mt-1 text-sm text-red-600">
                {validationErrors.firstName}
              </p>
            )}
          </div>
          <div>
            <label
              className="mb-2 block text-sm font-medium text-gray-700"
              htmlFor="lastName"
            >
              Last Name *
            </label>
            <input
              className={cn(
                "focus:border-primary focus:ring-primary/20 w-full rounded-lg border px-4 py-3 text-sm transition-colors focus:ring-2",
                validationErrors.lastName ? "border-red-300" : "border-gray-300"
              )}
              id="lastName"
              onBlur={handleFieldBlur}
              onChange={(e) => handleInputChange("lastName", e.target.value)}
              placeholder="Enter your last name"
              type="text"
              value={formData.lastName}
            />
            {validationErrors.lastName && (
              <p className="mt-1 text-sm text-red-600">
                {validationErrors.lastName}
              </p>
            )}
          </div>
          <div>
            <label
              className="mb-2 block text-sm font-medium text-gray-700"
              htmlFor="phone"
            >
              Phone Number
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 transform text-sm font-medium text-gray-500">
                +1
              </span>
              <input
                className={cn(
                  "focus:border-primary focus:ring-primary/20 w-full rounded-lg border px-4 py-3 pl-10 text-sm transition-colors focus:ring-2",
                  validationErrors.phone ? "border-red-300" : "border-gray-300"
                )}
                id="phone"
                inputMode="tel"
                onBlur={handleFieldBlur}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="123 456-7890"
                type="tel"
                value={formData.phone || ""}
              />
            </div>
            {validationErrors.phone && (
              <p className="mt-1 text-sm text-red-600">
                {validationErrors.phone}
              </p>
            )}
          </div>
          <div>
            <label
              className="mb-2 block text-sm font-medium text-gray-700"
              htmlFor="userType"
            >
              User Type *
            </label>
            <input
              className={cn(
                "focus:border-primary focus:ring-primary/20 w-full cursor-not-allowed rounded-lg border bg-gray-50 px-4 py-3 text-sm transition-colors focus:ring-2",
                validationErrors.userType ? "border-red-300" : "border-gray-300"
              )}
              disabled={true}
              id="userType"
              onChange={(e) => handleInputChange("userType", e.target.value)}
              placeholder="Enter your user type"
              type="text"
              value={formData.userType}
            />
            {validationErrors.userType && (
              <p className="mt-1 text-sm text-red-600">
                {validationErrors.userType}
              </p>
            )}
          </div>
          <div>
            <label
              className="mb-2 block text-sm font-medium text-gray-700"
              htmlFor="company"
            >
              Company *
            </label>
            <input
              className={cn(
                "focus:border-primary focus:ring-primary/20 w-full rounded-lg border px-4 py-3 text-sm transition-colors focus:ring-2",
                validationErrors.company ? "border-red-300" : "border-gray-300"
              )}
              id="company"
              onBlur={handleFieldBlur}
              onChange={(e) => handleInputChange("company", e.target.value)}
              placeholder="Enter your company"
              type="text"
              value={formData.company}
            />
            {validationErrors.company && (
              <p className="mt-1 text-sm text-red-600">
                {validationErrors.company}
              </p>
            )}
          </div>
          <div>
            <label
              className="mb-2 block text-sm font-medium text-gray-700"
              htmlFor="title"
            >
              Title
            </label>
            <input
              className="focus:border-primary focus:ring-primary/20 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm transition-colors focus:ring-2"
              id="title"
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="e.g., Mr., Mrs., Ms."
              type="text"
              value={formData.title || ""}
            />
          </div>
          <div>
            <label
              className="mb-2 block text-sm font-medium text-gray-700"
              htmlFor="jobTitle"
            >
              Job Title *
            </label>
            <input
              className={cn(
                "focus:border-primary focus:ring-primary/20 w-full rounded-lg border px-4 py-3 text-sm transition-colors focus:ring-2",
                validationErrors.jobTitle ? "border-red-300" : "border-gray-300"
              )}
              id="jobTitle"
              onBlur={handleFieldBlur}
              onChange={(e) => handleInputChange("jobTitle", e.target.value)}
              placeholder="Enter your job title"
              type="text"
              value={formData.jobTitle}
            />
            {validationErrors.jobTitle && (
              <p className="mt-1 text-sm text-red-600">
                {validationErrors.jobTitle}
              </p>
            )}
          </div>
          <div>
            <label
              className="mb-2 block text-sm font-medium text-gray-700"
              htmlFor="dateOfBirth"
            >
              Date of Birth
            </label>
            <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  className={cn(
                    "w-full justify-between text-left font-normal",
                    !formData.dateOfBirth && "text-muted-foreground"
                  )}
                  id="dateOfBirth"
                  type="button"
                  variant={"outline"}
                >
                  {formData.dateOfBirth
                    ? formData.dateOfBirth.toLocaleDateString()
                    : "Select date"}
                  <CalendarIcon className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto overflow-hidden p-0"
                align="start"
              >
                <Calendar
                  mode="single"
                  selected={formData.dateOfBirth}
                  captionLayout="dropdown"
                  onSelect={(date) => {
                    handleDateChange(date || undefined);
                    setDatePickerOpen(false);
                  }}
                  fromYear={1900}
                  toYear={new Date().getFullYear()}
                  defaultMonth={new Date(1990, 0)}
                  disabled={(date) =>
                    date > new Date() || date < new Date("1900-01-01")
                  }
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
      <div className="rounded-b-lg border-gray-200 px-6 py-4 text-right">
        <Button
          className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer rounded-full px-6 py-5 text-sm font-medium transition-colors"
          disabled={true}
          // {will enable this when the form has update api support}
          // disabled={isSubmitting || Object.keys(validationErrors).length > 0}
          type="submit"
        >
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </div>

      {/* Error Dialog */}
      <AlertDialog onOpenChange={setErrorOpen} open={errorOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Error</AlertDialogTitle>
            <AlertDialogDescription>{errorMessage}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Success Dialog */}
      <AlertDialog onOpenChange={setSuccessOpen} open={successOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Success</AlertDialogTitle>
            <AlertDialogDescription>
              Your profile has been updated successfully.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </form>
  );
}
