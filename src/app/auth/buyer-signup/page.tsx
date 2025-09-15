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
  Clock,
  Eye,
  EyeOff,
  Loader2,
  Mail,
  Package,
  Phone,
  Shield,
  User,
  X,
} from "lucide-react";
import { z } from "zod";

import Logo from "@/src/features/website/components/ui/Logo";
import { setConfirmationPending } from "@/src/utils/localStorageUtils";

// Move regex to top level
const phoneRegex = /^\d{10}$/;

// Define Zod schema for form validation
const buyerSignupSchema = z.object({
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
type BuyerSignupFormData = z.infer<typeof buyerSignupSchema>;

function BuyerSignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirectTo = searchParams.get("redirect") || "/marketplace";
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<BuyerSignupFormData>({
    resolver: zodResolver(buyerSignupSchema),
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

  const processForm = async (data: BuyerSignupFormData) => {
    setErrorMessage(null);

    try {
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
            "custom:userRole": "buyer",
            "custom:termsAccepted": data.termsAccepted.toString(),
          },
          autoSignIn: {
            enabled: true,
            validateData: true,
          },
        },
      });

      setConfirmationPending({ username: data.email, userType: "buyer" });

      if (nextStep.signUpStep === "COMPLETE_AUTO_SIGN_IN" || isSignUpComplete) {
        router.push(
          `/auth/buyer-signup/certificate-upload?redirect=${encodeURIComponent(redirectTo)}`
        );
      } else if (nextStep.signUpStep === "CONFIRM_SIGN_UP") {
        router.push(
          `/auth/confirm?username=${encodeURIComponent(data.email)}&userType=buyer&redirect=${encodeURIComponent(redirectTo)}`
        );
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
              Buyer Access
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
            <Link
              className="font-bold text-[#1C1E21] transition-colors hover:underline"
              href="mailto:team@commercecentral.io"
            >
              team@commercecentral.io
            </Link>
          </div>
        </div>
      </div>

      {/* Right side - Improved Design */}
      <div className="relative hidden w-1/2 overflow-hidden bg-gradient-to-br from-[#1C1E21] via-[#102d21] to-[#43cd66] lg:block">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 h-32 w-32 rotate-12 rounded-lg border border-white/20" />
          <div className="absolute top-40 right-32 h-24 w-24 rounded-full border border-white/10" />
          <div className="absolute bottom-40 left-16 h-40 w-40 rotate-45 rounded-xl border border-white/15" />
          <div className="absolute right-20 bottom-20 h-20 w-20 -rotate-12 rounded-lg border border-white/10" />
        </div>

        {/* Main Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-10 text-center md:p-12">
          {/* Main Message */}
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 md:mb-10"
            initial={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
              Welcome to Commerce Central
            </h2>
            <p className="mx-auto max-w-lg text-center text-base text-white/80 md:max-w-xl md:text-lg">
              Source surplus, closeouts, and returns you can flip fast all from
              verified sellers, always stress-free, always priced to move.
            </p>
          </motion.div>

          {/* Key Benefits */}
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="grid max-w-sm grid-cols-1 gap-6"
            initial={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            <div className="flex items-center text-white/90">
              <div className="mr-4 flex h-8 w-8 items-center justify-center rounded-lg bg-[#43CD66]/20">
                <Package className="h-4 w-4 text-[#43CD66]" />
              </div>
              <span className="text-md">
                Exclusive Access to in-demand loads
              </span>
            </div>
            <div className="flex items-center text-white/90">
              <div className="mr-4 flex h-8 w-8 items-center justify-center rounded-lg bg-[#43CD66]/20">
                <Shield className="h-4 w-4 text-[#43CD66]" />
              </div>
              <span className="text-md">Verified Sellers you can trust</span>
            </div>
            <div className="flex items-center text-white/90">
              <div className="mr-4 flex h-8 w-8 items-center justify-center rounded-lg bg-[#43CD66]/20">
                <Clock className="h-4 w-4 text-[#43CD66]" />
              </div>
              <span className="text-md">
                Fast, Direct Deals without the guesswork
              </span>
            </div>
          </motion.div>

          {/* Bottom Stats */}
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="mt-10 grid grid-cols-2 gap-8 text-center md:mt-12 md:grid-cols-4"
            initial={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.9 }}
          >
            <div>
              <div className="text-2xl font-bold text-[#43CD66]">1.5K+</div>
              <div className="text-xs text-white/60">Active Buyers</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[#43CD66]">500+</div>
              <div className="text-xs text-white/60">Verified Sellers</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[#43CD66]">45+</div>
              <div className="text-xs text-white/60">Premium Brands</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[#43CD66]">99%</div>
              <div className="text-xs text-white/60">Satisfaction</div>
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
  register: UseFormRegister<BuyerSignupFormData>;
  handleSubmit: UseFormHandleSubmit<BuyerSignupFormData>;
  errors: FieldErrors<BuyerSignupFormData>;
  isSubmitting: boolean;
  isValid: boolean;
  processForm: (data: BuyerSignupFormData) => Promise<void>;
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
      <SubmitSection isSubmitting={isSubmitting} isValid={isValid} />
    </motion.form>
  );
}

function PersonalInfoSection({
  register,
  errors,
  isSubmitting,
}: {
  register: UseFormRegister<BuyerSignupFormData>;
  errors: FieldErrors<BuyerSignupFormData>;
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
            placeholder="Purchasing Manager"
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
  register: UseFormRegister<BuyerSignupFormData>;
  errors: FieldErrors<BuyerSignupFormData>;
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
  register: UseFormRegister<BuyerSignupFormData>;
  errors: FieldErrors<BuyerSignupFormData>;
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
  errors,
  isSubmitting,
}: {
  register: UseFormRegister<BuyerSignupFormData>;
  errors: FieldErrors<BuyerSignupFormData>;
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
        {errors.termsAccepted && (
          <p className="mt-1 text-xs font-medium text-red-600">
            {errors.termsAccepted.message}
          </p>
        )}
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
          "Create Buyer Account"
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

export default function BuyerSignupPage() {
  return (
    <Suspense
      fallback={
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
          <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-[#43CD66]" />
        </div>
      }
    >
      <BuyerSignupContent />
    </Suspense>
  );
}
