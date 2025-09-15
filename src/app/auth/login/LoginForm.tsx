"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  fetchUserAttributes,
  signIn,
  type SignInOutput,
} from "aws-amplify/auth";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import { z } from "zod";

import { fetchUserVerificationStatus } from "@/src/app/(shop)/buyer/account/services/profileQueryService";
import {
  fetchVerificationStatus,
  initializeAuth,
  updateVerificationStatus,
} from "@/src/features/authentication/store/authSlice";
import Logo from "@/src/features/website/components/ui/Logo";
import { useToast } from "@/src/hooks/use-toast";
import type { AppDispatch } from "@/src/lib/store";
import { setConfirmationPending } from "@/src/utils/localStorageUtils";
import { authSessionStorage } from "@/src/utils/sessionStorage";
import { 
  forceSessionCleanup, 
  waitForAuthCookies, 
  retryWithBackoff 
} from "@/src/utils/sessionCleanup";

// Define Zod schema for form validation
const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});
// Create type from schema
type LoginFormData = z.infer<typeof loginSchema>;

// Certificate upload functionality removed - using database-driven verification instead
// The verification status is fetched from the database after login and used to
// decide the redirect target. This replaces the older certificate upload flow.
async function getRedirectUrlForUser(): Promise<string> {
  // Determine redirect URL based on user type and verification status
  try {
    const attributes = await fetchUserAttributes();
    const userType = attributes["custom:userRole"] as "buyer" | "seller";
    if (userType === "seller") return "/seller/dashboard";
    if (userType === "buyer") {
      try {
        const verificationResult = await fetchUserVerificationStatus();
        if (verificationResult.data) {
          const { verification_status, account_locked } =
            verificationResult.data;
          if (account_locked) return "/auth/account-locked";
          if (
            verification_status === "pending" ||
            verification_status === "rejected"
          ) {
            return "/buyer/verification-pending";
          }
        }
      } catch {
        return "/buyer/verification-pending";
      }
    }
    return "/marketplace";
  } catch {
    return "/buyer/verification-pending";
  }
}

// Get button content based on loading states
function getButtonContent(isSubmitting: boolean, isRedirecting: boolean) {
  if (isSubmitting) {
    return (
      <>
        <Loader2 className="mr-3 -ml-1 h-5 w-5 animate-spin text-[#1C1E21]" />
        Signing you in...
      </>
    );
  }
  if (isRedirecting) {
    return (
      <>
        <Loader2 className="mr-3 -ml-1 h-5 w-5 animate-spin text-[#1C1E21]" />
        Redirecting...
      </>
    );
  }
  return "Login";
}

export const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch<AppDispatch>();
  const { toast } = useToast();

  const redirectTo =
    searchParams.get("returnUrl") ||
    searchParams.get("redirect") ||
    authSessionStorage.getAndClearRedirectUrl() ||
    "/marketplace";

  const justConfirmed = searchParams.get("justConfirmed") === "true";

  useEffect(() => {
    if (justConfirmed) {
      // Auto-redirect prompt for confirmed users
      toast({
        title: "Account Confirmed! 🎉",
        description: "Please sign in to continue.",
      });
    }
  }, [justConfirmed, toast]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  // Handle successful login with retry logic
  async function handleSuccessfulLogin() {
    try {
      setIsRedirecting(true);
      
      // Wait for auth cookies to be set before proceeding
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Fetch user attributes with retry
      const fetchAttributesWithRetry = async (attempts = 3): Promise<string> => {
        for (let i = 0; i < attempts; i++) {
          try {
            const attributes = await fetchUserAttributes();
            return (attributes["custom:userRole"] as "buyer" | "seller") ?? "buyer";
          } catch (error) {
            if (i === attempts - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
          }
        }
        return "buyer";
      };

      const userType = await fetchAttributesWithRetry();
      
      toast({
        title: "Login Successful! 🎉",
        description:
          userType === "seller"
            ? "Redirecting you to seller dashboard..."
            : "Redirecting you to marketplace...",
      });
      
      // Initialize auth state with retry
      let authInitialized = false;
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          await dispatch(initializeAuth()).unwrap();
          authInitialized = true;
          break;
        } catch (error) {
          console.warn(`Auth initialization attempt ${attempt + 1} failed:`, error);
          if (attempt < 2) {
            await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
          }
        }
      }
      
      if (!authInitialized) {
        throw new Error("Failed to initialize authentication");
      }
      
      // Fetch verification status for buyers with retry
      if (userType === "buyer") {
        let verificationFetched = false;
        for (let attempt = 0; attempt < 3; attempt++) {
          try {
            await dispatch(fetchVerificationStatus()).unwrap();
            verificationFetched = true;
            break;
          } catch (error) {
            console.warn(`Verification fetch attempt ${attempt + 1} failed:`, error);
            if (attempt < 2) {
              await new Promise(resolve => setTimeout(resolve, 1500 * (attempt + 1)));
            }
          }
        }
        
        if (!verificationFetched) {
          // Set default verification status if fetch fails
          dispatch(updateVerificationStatus({ 
            verificationStatus: "pending", 
            accountLocked: false 
          }));
        }
      }
      
      if (redirectTo !== "/marketplace") {
        authSessionStorage.saveRedirectUrl(redirectTo);
      }
      
      const finalUrl = await getRedirectUrlForUser();
      setTimeout(() => router.push(finalUrl), 1500);
    } catch (error) {
      console.error("Login successful but post-login setup failed:", error);
      setIsRedirecting(false);
      toast({
        variant: "destructive",
        title: "Login Error",
        description:
          "Authentication successful but there was an issue setting up your session. Please refresh the page.",
      });
      setTimeout(() => router.push(redirectTo), 2000);
    }
  }

  // Handle different sign-in step results
  function handleSignInResult(output: SignInOutput, email: string) {
    const { nextStep } = output;
    switch (nextStep.signInStep) {
      case "CONFIRM_SIGN_UP": {
        toast({
          variant: "destructive",
          title: "Account Not Confirmed",
          description:
            "Please confirm your sign up first. Redirecting to confirmation page...",
        });
        setTimeout(() => {
          router.push(`/auth/confirm?username=${encodeURIComponent(email)}`);
        }, 2000);
        break;
      }
      case "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED": {
        toast({
          variant: "destructive",
          title: "New Password Required",
          description: "You need to set a new password. Redirecting...",
        });
        setTimeout(() => {
          router.push(
            `/auth/new-password-required?username=${encodeURIComponent(email)}`
          );
        }, 2000);
        break;
      }
      case "CONFIRM_SIGN_IN_WITH_CUSTOM_CHALLENGE": {
        toast({
          variant: "destructive",
          title: "Additional Verification Required",
          description:
            "Custom authentication challenge is required to sign in.",
        });
        break;
      }
      case "RESET_PASSWORD": {
        toast({
          variant: "destructive",
          title: "Password Reset Required",
          description:
            "Your password needs to be reset. Redirecting to forgot password page...",
        });
        setTimeout(() => {
          router.push(
            `/auth/forgot-password?username=${encodeURIComponent(email)}`
          );
        }, 2000);
        break;
      }
      case "DONE": {
        handleSuccessfulLogin();
        break;
      }
      default: {
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description:
            "Unhandled sign in step. Please try again or contact support.",
        });
      }
    }
  }

  // Handle sign-in request + error cases
  async function processForm(data: LoginFormData) {
    try {
      const output = await signIn({
        username: data.email,
        password: data.password,
      });
      handleSignInResult(output, data.email);
    } catch (err) {
      const error = err as Error;
      if (error.name === "UserAlreadyAuthenticatedException") {
        // Handle existing session - force cleanup and retry with new credentials
        toast({
          title: "Switching Accounts",
          description: "Signing out previous session and logging you in...",
        });
        
        try {
          // Force complete session cleanup
          await forceSessionCleanup(dispatch);
          
          // Wait for cleanup to complete
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Retry login with new credentials after cleanup
          const retryOutput = await signIn({
            username: data.email,
            password: data.password,
          });
          
          handleSignInResult(retryOutput, data.email);
          
        } catch (cleanupError) {
          console.error("Session cleanup or retry login failed:", cleanupError);
          toast({
            variant: "destructive",
            title: "Session Conflict",
            description: "Unable to switch accounts. Please refresh the page and try again.",
          });
          
          // Force page refresh as last resort
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        }
        return;
      }
      
      // Handle other authentication errors
      if (
        error.name === "UserNotFoundException" ||
        error.name === "NotAuthorizedException"
      ) {
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: "Incorrect email or password. Please try again.",
        });
      } else if (error.name === "LimitExceededException") {
        toast({
          variant: "destructive",
          title: "Too Many Attempts",
          description: "Attempt limit exceeded, please try after some time.",
        });
      } else if (error.name === "UserNotConfirmedException") {
        // Preserve old behavior: set pending and send user to confirmation
        setConfirmationPending({ username: data.email, userType: "buyer" });
        router.push(
          `/auth/confirm?username=${encodeURIComponent(data.email)}&redirect=${encodeURIComponent(redirectTo)}`
        );
      } else {
        toast({
          variant: "destructive",
          title: "Login Error",
          description:
            error.message || "An unexpected error occurred. Please try again.",
        });
      }
    }
  }

  const buttonContent = getButtonContent(isSubmitting, isRedirecting);
  const isDisabled = !isValid || isSubmitting || isRedirecting;

  return (
    <div className="relative flex w-full flex-col justify-center overflow-hidden p-6 md:p-12 lg:w-1/2">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-green-50/20 via-transparent to-blue-50/20" />
      <div className="pointer-events-none absolute top-0 right-0 h-64 w-64 rounded-full bg-gradient-to-br from-[#43CD66]/5 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-48 w-48 rounded-full bg-gradient-to-tr from-blue-500/5 to-transparent blur-2xl" />

      <div className="relative z-10">
        <div className="mb-8">
          <Logo />
        </div>
        <div className="mb-8">
          <motion.h1
            animate={{ opacity: 1, y: 0 }}
            className="mb-3 bg-gradient-to-r from-[#1C1E21] via-[#102d21] to-[#43cd66] bg-clip-text text-3xl font-bold text-transparent md:text-4xl"
            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Welcome back
          </motion.h1>
          <motion.p
            animate={{ opacity: 1, y: 0 }}
            className="text-lg text-gray-600"
            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            Login to access your Commerce Central account.
          </motion.p>
          <motion.div
            animate={{ opacity: 1, scale: 1 }}
            className="h-1 w-full rounded-full bg-gradient-to-r from-[#43CD66] via-[#43CD66]/60 to-transparent"
            initial={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          />
        </div>

        <motion.form
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
          initial={{ opacity: 0, y: 30 }}
          onSubmit={handleSubmit(processForm)}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
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
                disabled={isSubmitting || isRedirecting}
                placeholder="you@example.com"
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-xs text-red-600">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label
                className="block text-sm font-medium text-gray-700"
                htmlFor="password"
              >
                Password
              </label>
              <Link
                className="text-sm text-[#43CD66] transition-colors hover:text-[#102D21]"
                href="/auth/forgot-password"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <div className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2">
                <Lock className="h-4 w-4 text-[#43CD66] md:h-5 md:w-5" />
              </div>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                {...register("password")}
                className={`w-full border py-3 pr-12 pl-10 text-sm ${errors.password ? "border-red-500" : "border-gray-300"} rounded-lg bg-white/80 text-gray-900 shadow-sm transition-all duration-200 focus:border-[#43CD66] focus:ring-[#43CD66] focus:outline-none`}
                disabled={isSubmitting || isRedirecting}
                placeholder="Enter your password"
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
              <p className="mt-1 text-xs text-red-600">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="pt-6">
            <motion.button
              className={`flex w-full items-center justify-center rounded-full border border-[#1c1e21] bg-gradient-to-r from-[#43CD66] to-[#3ab859] px-6 py-3.5 text-sm font-medium text-[#1C1E21] shadow-lg transition-all duration-200 hover:border-[#102D21] hover:from-[#3ab859] hover:to-[#2ea043] hover:shadow-xl focus:outline-none md:text-base ${isDisabled ? "cursor-not-allowed opacity-70" : "cursor-pointer"}`}
              disabled={isDisabled}
              type="submit"
              whileHover={isDisabled ? undefined : { scale: 1.02 }}
              whileTap={isDisabled ? undefined : { scale: 0.98 }}
            >
              {buttonContent}
            </motion.button>

            <div className="mt-4 text-center">
              <span className="text-sm text-gray-600">
                Don&apos;t have an account?{" "}
              </span>
              <Link
                className="text-sm font-medium text-[#43CD66] transition-colors hover:text-[#102D21]"
                href={`/auth/select-user-type${redirectTo !== "/marketplace" ? `?redirect=${encodeURIComponent(redirectTo)}` : ""}`}
              >
                Sign up here
              </Link>
            </div>
          </div>

          <div className="mt-8 text-center text-sm text-gray-600">
            Need help? Email us at{" "}
            <a
              className="font-bold text-[#1C1E21] transition-colors hover:underline"
              href="mailto:team@commercecentral.io"
            >
              team@commercecentral.io
            </a>
          </div>
        </motion.form>
      </div>
    </div>
  );
};

export default LoginForm;
