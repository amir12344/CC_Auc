"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import {
  useForm,
  type FieldErrors,
  type UseFormHandleSubmit,
  type UseFormRegister,
} from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { signUp } from "aws-amplify/auth";
import { motion } from "framer-motion";
import {
  AlertCircle,
  Briefcase,
  Building,
  Eye,
  EyeOff,
  Loader2,
  Mail,
  Phone,
  User,
  X,
} from "lucide-react";
import { z } from "zod";

import Logo from "@/src/features/website/components/ui/Logo";
import { setConfirmationPending } from "@/src/utils/localStorageUtils";

// Move regex to top level
const phoneRegex = /^\d{10}$/;

// Define Zod schema for form validation - UNIFIED PATTERN to match buyer signup
const sellerSignupSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  jobTitle: z.string().min(1, { message: "Job title is required" }),
  companyName: z.string().min(1, { message: "Company name is required" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" })
    .regex(/[a-zA-Z]/, { message: "Password must contain at least one letter" })
    .regex(/[0-9]/, { message: "Password must contain at least one number" })
    .regex(/[^a-zA-Z0-9]/, {
      message: "Password must contain at least one special character",
    }),
  phoneNumber: z
    .string()
    .min(1, { message: "Phone number is required" })
    .refine(
      (val) => {
        const digitsOnly = val.replace(/\D/g, "");
        return phoneRegex.test(digitsOnly);
      },
      {
        message: "Phone number must be exactly 10 digits",
      }
    ),
  termsAccepted: z.boolean().refine((value) => value === true, {
    message: "You must accept the terms and conditions",
  }),
});

// Create type from schema
type SellerSignupFormData = z.infer<typeof sellerSignupSchema>;

function SellerSignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get the redirect URL from query params, but sellers typically go to dashboard
  const redirectTo = searchParams.get("redirect") || "/seller/dashboard";
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<SellerSignupFormData>({
    resolver: zodResolver(sellerSignupSchema),
    mode: "onTouched",
    defaultValues: {
      name: "",
      jobTitle: "",
      companyName: "",
      email: "",
      password: "",
      phoneNumber: "",
      termsAccepted: false,
    },
  });

  const processForm = async (data: SellerSignupFormData) => {
    setErrorMessage(null);

    try {
      // Format phone number for E.164 (required now)
      const digitsOnly = data.phoneNumber.replace(/\D/g, "");
      const formattedPhoneNumber = `+1${digitsOnly}`;

      const { isSignUpComplete, nextStep } = await signUp({
        username: data.email,
        password: data.password,
        options: {
          userAttributes: {
            email: data.email,
            "custom:fullName": data.name,
            phone_number: formattedPhoneNumber,
            "custom:jobTitle": data.jobTitle,
            "custom:companyName": data.companyName,
            "custom:userRole": "seller",
            "custom:termsAccepted": data.termsAccepted.toString(),
          },
          autoSignIn: {
            enabled: true,
            validateData: true,
          },
        },
      });

      // Set pending state for potential resumed flows
      setConfirmationPending({ username: data.email, userType: "seller" });

      // Go to confirmation page with next step info
      if (nextStep.signUpStep === "CONFIRM_SIGN_UP") {
        router.push(
          `/auth/confirm?username=${encodeURIComponent(data.email)}&userType=seller&redirect=${encodeURIComponent(redirectTo)}`
        );
      } else if (
        nextStep.signUpStep === "COMPLETE_AUTO_SIGN_IN" ||
        isSignUpComplete
      ) {
        // Direct to the redirect URL or seller dashboard
        router.push(redirectTo);
      } else {
        setErrorMessage(
          "Sign up process is not fully complete. Please check for further instructions."
        );
      }
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMessage(
        error.message || "An unexpected error occurred during sign up."
      );
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-white to-green-50/30">
      {/* Left side - Form */}
      <div className="relative flex w-full flex-col justify-center overflow-hidden p-6 md:p-12 lg:w-1/2">
        {/* Background decoration */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-green-50/20 via-transparent to-blue-50/20" />
        <div className="pointer-events-none absolute top-0 right-0 h-64 w-64 rounded-full bg-gradient-to-br from-[#43CD66]/5 to-transparent blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-48 w-48 rounded-full bg-gradient-to-tr from-blue-500/5 to-transparent blur-2xl" />

        <div className="relative z-10">
          <div className="mb-8">
            <Logo />
          </div>

          {/* Simplified Title Section */}
          <div className="mb-8">
            <motion.h1
              animate={{ opacity: 1, y: 0 }}
              className="mb-3 bg-gradient-to-r from-[#1C1E21] via-[#102d21] to-[#43cd66] bg-clip-text text-3xl font-bold text-transparent md:text-4xl"
              initial={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Seller Access
            </motion.h1>
            <motion.div
              animate={{ opacity: 1, scale: 1 }}
              className="h-1 w-full rounded-full bg-gradient-to-r from-[#43CD66] via-[#43CD66]/60 to-transparent"
              initial={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            />
          </div>

          <SignupForm
            errorMessage={errorMessage}
            errors={errors}
            handleSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            isValid={isValid}
            processForm={processForm}
            register={register}
            setErrorMessage={setErrorMessage}
            setShowPassword={setShowPassword}
            showPassword={showPassword}
          />

          <div className="mt-8 text-center text-sm text-gray-600">
            Need help? Email us at{" "}
            <a
              className="font-bold text-[#1C1E21] transition-colors hover:underline"
              href="mailto:team@commercecentral.io"
            >
              team@commercecentral.io
            </a>
          </div>
        </div>
      </div>

      {/* Right side - Commerce Central Seller Experience */}
      <div className="relative hidden w-1/2 overflow-hidden bg-gradient-to-br from-[#1C1E21] via-[#102d21] to-[#43cd66] lg:block">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          {/* Floating geometric shapes */}
          <motion.div
            animate={{
              y: [0, -20, 0],
              rotate: [0, 5, 0],
            }}
            className="absolute top-20 left-16 h-16 w-16 rounded-xl border-2 border-[#43CD66]/30"
            transition={{
              duration: 6,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />

          <motion.div
            animate={{
              y: [0, 15, 0],
              rotate: [0, -3, 0],
            }}
            className="absolute top-40 right-20 h-12 w-12 rounded-full bg-[#43CD66]/20"
            transition={{
              duration: 8,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
              delay: 1,
            }}
          />

          <motion.div
            animate={{
              y: [0, -10, 0],
              x: [0, 5, 0],
            }}
            className="absolute bottom-32 left-12 h-20 w-20 rotate-45 rounded-lg border border-white/10"
            transition={{
              duration: 7,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
              delay: 2,
            }}
          />
        </div>

        {/* Main Content Container */}
        <div className="absolute inset-0 flex flex-col justify-center p-12">
          {/* Header Section */}
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
            initial={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="mb-4 flex items-center">
              <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#43CD66] to-[#3ab859]">
                <svg
                  className="h-6 w-6 text-[#1C1E21]"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <title>Star Icon</title>
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Commerce Central
                </h2>
                <p className="text-sm font-medium text-[#43CD66]">
                  Seller Platform
                </p>
              </div>
            </div>
            <p className="text-lg leading-relaxed text-white/80">
              Connect with verified buyers, manage inventory seamlessly, and
              grow your revenue with our comprehensive B2B marketplace.
            </p>
          </motion.div>

          {/* Key Features Grid */}
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 grid grid-cols-2 gap-4"
            initial={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
              <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-[#43CD66]/20">
                <svg
                  className="h-4 w-4 text-[#43CD66]"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <title>Check Circle Icon</title>
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </div>
              <h4 className="mb-1 text-sm font-semibold text-white">
                Verified Buyers
              </h4>
              <p className="text-xs text-white/60">
                Pre-qualified business customers
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
              <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-[#43CD66]/20">
                <svg
                  className="h-4 w-4 text-[#43CD66]"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <title>List Icon</title>
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
                </svg>
              </div>
              <h4 className="mb-1 text-sm font-semibold text-white">
                Order Management
              </h4>
              <p className="text-xs text-white/60">
                Streamlined fulfillment process
              </p>
            </div>
          </motion.div>

          {/* Success Story */}
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-white/20 bg-gradient-to-r from-white/10 to-white/5 p-6 backdrop-blur-md"
            initial={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            <div className="mb-4 flex items-start">
              <div className="mr-3 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#43CD66] to-[#3ab859]">
                <span className="text-sm font-bold text-[#1C1E21]">JM</span>
              </div>
              <div>
                <h5 className="text-sm font-semibold text-white">
                  Jessica Martinez
                </h5>
                <p className="text-xs text-white/60">Electronics Wholesaler</p>
              </div>
            </div>
            <p className="mb-4 text-sm leading-relaxed text-white/90 italic">
              &quot;Commerce Central transformed my business. I went from
              struggling to find buyers to having a steady stream of qualified
              customers. My revenue increased by 60% in just 6 months.&quot;
            </p>
            <div className="flex items-center">
              <div className="mr-2 flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <motion.svg
                    animate={{ opacity: 1, scale: 1 }}
                    className="h-4 w-4 text-[#43CD66]"
                    fill="currentColor"
                    initial={{ opacity: 0, scale: 0 }}
                    key={star}
                    transition={{ delay: 0.9 + star * 0.1 }}
                    viewBox="0 0 20 20"
                  >
                    <title>Star Rating</title>
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3 .921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784 .57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81 .588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </motion.svg>
                ))}
              </div>
              <span className="text-xs text-white/60">Verified Review</span>
            </div>
          </motion.div>

          {/* Bottom CTA */}
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 text-center"
            initial={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.9 }}
          >
            <div className="inline-flex items-center rounded-full border border-[#43CD66]/30 bg-[#43CD66]/20 px-4 py-2">
              <div className="mr-2 h-2 w-2 animate-pulse rounded-full bg-[#43CD66]" />
              <span className="text-sm font-medium text-[#43CD66]">
                Join 2,500+ successful sellers
              </span>
            </div>
          </motion.div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-gradient-to-bl from-[#43CD66]/10 to-transparent blur-3xl" />
        <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-gradient-to-tr from-white/5 to-transparent blur-2xl" />
      </div>
    </div>
  );
}

type SignupFormProps = {
  register: UseFormRegister<SellerSignupFormData>;
  handleSubmit: UseFormHandleSubmit<SellerSignupFormData>;
  errors: FieldErrors<SellerSignupFormData>;
  isSubmitting: boolean;
  isValid: boolean;
  processForm: (data: SellerSignupFormData) => Promise<void>;
  showPassword: boolean;
  setShowPassword: (value: boolean) => void;
  errorMessage: string | null;
  setErrorMessage: (value: string | null) => void;
};

function SignupForm(props: SignupFormProps) {
  const {
    register,
    handleSubmit,
    errors,
    isSubmitting,
    isValid,
    processForm,
    showPassword,
    setShowPassword,
    errorMessage,
    setErrorMessage,
  } = props;

  return (
    <motion.form
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
      initial={{ opacity: 0, y: 30 }}
      onSubmit={handleSubmit(processForm)}
      transition={{ duration: 0.8, delay: 0.6 }}
    >
      <PersonalInfoSection
        errors={errors}
        isSubmitting={isSubmitting}
        register={register}
      />
      <CompanyInfoSection
        errors={errors}
        isSubmitting={isSubmitting}
        register={register}
      />
      <CredentialsSection
        errors={errors}
        isSubmitting={isSubmitting}
        register={register}
        setShowPassword={setShowPassword}
        showPassword={showPassword}
      />
      <TermsSection
        errors={errors}
        isSubmitting={isSubmitting}
        register={register}
      />
      <ErrorDisplay
        errorMessage={errorMessage}
        setErrorMessage={setErrorMessage}
      />
      {errors.termsAccepted && (
        <p className="mt-1 text-xs font-medium text-red-600">
          {errors.termsAccepted.message}
        </p>
      )}
      <SubmitSection isSubmitting={isSubmitting} isValid={isValid} />
    </motion.form>
  );
}

function PersonalInfoSection({
  register,
  errors,
  isSubmitting,
}: {
  register: UseFormRegister<SellerSignupFormData>;
  errors: FieldErrors<SellerSignupFormData>;
  isSubmitting: boolean;
}) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {/* Name */}
      <div>
        <label
          className="mb-2 block text-sm font-medium text-gray-700"
          htmlFor="name"
        >
          Name
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2">
            <User className="h-4 w-4 text-[#43CD66] md:h-5 md:w-5" />
          </div>
          <input
            id="name"
            type="text"
            {...register("name")}
            className={`w-full border py-3 pr-3 pl-10 text-sm ${errors.name ? "border-red-500" : "border-gray-300"} rounded-lg bg-white/80 text-gray-900 shadow-sm transition-all duration-200 focus:border-[#43CD66] focus:ring-[#43CD66] focus:outline-none`}
            disabled={isSubmitting}
            placeholder="John Doe"
          />
        </div>
        {errors.name && (
          <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
        )}
      </div>

      {/* Job Title */}
      <div>
        <label
          className="mb-2 block text-sm font-medium text-gray-700"
          htmlFor="jobTitle"
        >
          Job Title
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2">
            <Briefcase className="h-4 w-4 text-[#43CD66] md:h-5 md:w-5" />
          </div>
          <input
            id="jobTitle"
            type="text"
            {...register("jobTitle")}
            className={`w-full border py-3 pr-3 pl-10 text-sm ${errors.jobTitle ? "border-red-500" : "border-gray-300"} rounded-lg bg-white/80 text-gray-900 shadow-sm transition-all duration-200 focus:border-[#43CD66] focus:ring-[#43CD66] focus:outline-none`}
            disabled={isSubmitting}
            placeholder="Sales Manager"
          />
        </div>
        {errors.jobTitle && (
          <p className="mt-1 text-xs text-red-600">{errors.jobTitle.message}</p>
        )}
      </div>
    </div>
  );
}

function CompanyInfoSection({
  register,
  errors,
  isSubmitting,
}: {
  register: UseFormRegister<SellerSignupFormData>;
  errors: FieldErrors<SellerSignupFormData>;
  isSubmitting: boolean;
}) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {/* Company Name */}
      <div>
        <label
          className="mb-2 block text-sm font-medium text-gray-700"
          htmlFor="companyName"
        >
          Company Name
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2">
            <Building className="h-4 w-4 text-[#43CD66] md:h-5 md:w-5" />
          </div>
          <input
            id="companyName"
            type="text"
            {...register("companyName")}
            className={`w-full border py-3 pr-3 pl-10 text-sm ${errors.companyName ? "border-red-500" : "border-gray-300"} rounded-lg bg-white/80 text-gray-900 shadow-sm transition-all duration-200 focus:border-[#43CD66] focus:ring-[#43CD66] focus:outline-none`}
            disabled={isSubmitting}
            placeholder="ABC Corp"
          />
        </div>
        {errors.companyName && (
          <p className="mt-1 text-xs text-red-600">
            {errors.companyName.message}
          </p>
        )}
      </div>

      {/* Phone Number */}
      <div>
        <label
          className="mb-2 block text-sm font-medium text-gray-700"
          htmlFor="phoneNumber"
        >
          Phone Number
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2">
            <Phone className="h-4 w-4 text-[#43CD66] md:h-5 md:w-5" />
          </div>
          <span className="pointer-events-none absolute top-1/2 left-10 -translate-y-1/2 text-sm font-medium text-[#43CD66] select-none">
            +1
          </span>
          <input
            id="phoneNumber"
            inputMode="tel"
            maxLength={15}
            pattern="^\d{10,15}$"
            type="tel"
            {...register("phoneNumber")}
            autoComplete="tel"
            className={`w-full border py-3 pr-3 pl-16 text-sm ${errors.phoneNumber ? "border-red-500" : "border-gray-300"} rounded-lg bg-white/80 text-gray-900 shadow-sm transition-all duration-200 focus:border-[#43CD66] focus:ring-[#43CD66] focus:outline-none`}
            disabled={isSubmitting}
            placeholder="123 456-7890"
          />
        </div>
        {errors.phoneNumber && (
          <p className="mt-1 text-xs text-red-600">
            {errors.phoneNumber.message}
          </p>
        )}
      </div>
    </div>
  );
}

function CredentialsSection({
  register,
  errors,
  isSubmitting,
  showPassword,
  setShowPassword,
}: {
  register: UseFormRegister<SellerSignupFormData>;
  errors: FieldErrors<SellerSignupFormData>;
  isSubmitting: boolean;
  showPassword: boolean;
  setShowPassword: (value: boolean) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {/* Email */}
      <div>
        <label
          className="mb-2 block text-sm font-medium text-gray-700"
          htmlFor="email"
        >
          Email
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2">
            <Mail className="h-4 w-4 text-[#43CD66] md:h-5 md:w-5" />
          </div>
          <input
            id="email"
            type="email"
            {...register("email")}
            className={`w-full border py-3 pr-3 pl-10 text-sm ${errors.email ? "border-red-500" : "border-gray-300"} rounded-lg bg-white/80 text-gray-900 shadow-sm transition-all duration-200 focus:border-[#43CD66] focus:ring-[#43CD66] focus:outline-none`}
            disabled={isSubmitting}
            placeholder="you@example.com"
          />
        </div>
        {errors.email && (
          <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
        )}
      </div>

      {/* Password */}
      <div>
        <label
          className="mb-2 block text-sm font-medium text-gray-700"
          htmlFor="password"
        >
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            {...register("password")}
            className={`w-full border p-3 text-sm ${errors.password ? "border-red-500" : "border-gray-300"} rounded-lg bg-white/80 text-gray-900 shadow-sm transition-all duration-200 focus:border-[#43CD66] focus:ring-[#43CD66] focus:outline-none`}
            disabled={isSubmitting}
            placeholder="Create a secure password"
          />
          <button
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
            onClick={() => setShowPassword(!showPassword)}
            type="button"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {errors.password && (
          <div className="mt-1">
            <p className="text-xs text-red-600">Password must:</p>
            <ul className="ml-4 text-xs text-red-600">
              {errors.password.message?.includes("8 characters") && (
                <li>- Be at least 8 characters long</li>
              )}
              {errors.password.message?.includes("letter") && (
                <li>- Contain at least one letter</li>
              )}
              {errors.password.message?.includes("number") && (
                <li>- Contain at least one number</li>
              )}
              {errors.password.message?.includes("special") && (
                <li>- Contain at least one special character</li>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function TermsSection({
  register,
  isSubmitting,
}: {
  register: UseFormRegister<SellerSignupFormData>;
  errors: FieldErrors<SellerSignupFormData>;
  isSubmitting: boolean;
}) {
  return (
    <div className="mb-0 flex items-start">
      <div className="flex h-5 items-center">
        <input
          id="termsAccepted"
          type="checkbox"
          {...register("termsAccepted")}
          className="h-4 w-4 rounded border-gray-300 text-[#43CD66] focus:ring-[#43CD66]"
          disabled={isSubmitting}
        />
      </div>
      <div className="ml-3 text-sm">
        <label className="font-medium text-gray-700" htmlFor="termsAccepted">
          I agree to the{" "}
          <Link
            className="text-[#43CD66] hover:text-[#102D21]"
            href="/website/legal/terms"
            rel="noopener noreferrer"
            target="_blank"
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            className="text-[#43CD66] hover:text-[#102D21]"
            href="/website/legal/privacy-policy"
            rel="noopener noreferrer"
            target="_blank"
          >
            Privacy Policy
          </Link>
        </label>
      </div>
    </div>
  );
}

function ErrorDisplay({
  errorMessage,
  setErrorMessage,
}: {
  errorMessage: string | null;
  setErrorMessage: (value: string | null) => void;
}) {
  if (!errorMessage) {
    return null;
  }
  return (
    <motion.div
      animate={{ opacity: 1, x: 0 }}
      className="relative flex items-start gap-3 overflow-hidden rounded-md border-l-4 border-red-500 bg-gradient-to-r from-red-50 to-red-50/70 px-4 py-3 text-red-800 shadow-sm"
      initial={{ opacity: 0, x: 20 }}
      role="alert"
      transition={{ duration: 0.4 }}
    >
      <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500 md:h-5 md:w-5" />
      <div className="flex-1">
        <span className="text-xs font-medium md:text-sm">{errorMessage}</span>
      </div>
      <button
        aria-label="Dismiss error"
        className="ml-2 text-red-400 transition-colors hover:text-red-600 focus:outline-none"
        onClick={() => setErrorMessage(null)}
        type="button"
      >
        <X className="h-3 w-3 md:h-4 md:w-4" />
      </button>
    </motion.div>
  );
}

function SubmitSection({
  isSubmitting,
  isValid,
}: {
  isSubmitting: boolean;
  isValid: boolean;
}) {
  return (
    <div className="pt-6">
      <motion.button
        className={`flex w-full items-center justify-center rounded-full border border-[#1c1e21] bg-gradient-to-r from-[#43CD66] to-[#3ab859] px-6 py-3.5 text-sm font-medium text-[#1C1E21] shadow-lg transition-all duration-200 hover:border-[#102D21] hover:from-[#3ab859] hover:to-[#2ea043] hover:shadow-xl focus:outline-none md:text-base ${!isValid || isSubmitting ? "cursor-not-allowed opacity-70" : "cursor-pointer"}`}
        disabled={!isValid || isSubmitting}
        type="submit"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-3 -ml-1 h-5 w-5 animate-spin text-[#1C1E21]" />
            Creating Your Account...
          </>
        ) : (
          "Create Seller Account"
        )}
      </motion.button>
      <div className="mt-4 text-center">
        <span className="text-sm text-gray-600">Already have an account? </span>
        <Link
          className="text-sm font-medium text-[#43CD66] transition-colors hover:text-[#102D21]"
          href="/auth/login"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}

export default function SellerSignupPage() {
  return (
    <Suspense
      fallback={
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-xs">
          <div className="border-primary h-12 w-12 animate-spin rounded-full border-t-2 border-b-2" />
        </div>
      }
    >
      <SellerSignupContent />
    </Suspense>
  );
}
