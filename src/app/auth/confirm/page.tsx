"use client";

import { useRouter, useSearchParams } from "next/navigation";
import React, {
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useDispatch } from "react-redux";

import type { SignInOutput } from "@aws-amplify/auth";

import { fetchUserAttributes } from "aws-amplify/auth";
import {
  AlertCircle,
  CheckCircle,
  CheckCircle2,
  Info,
  Loader2,
  Mail,
} from "lucide-react";

import { fetchUserVerificationStatus } from "@/src/app/(shop)/buyer/account/services/profileQueryService";
import { Alert, AlertDescription, AlertTitle } from "@/src/components/ui/alert";
import { Button } from "@/src/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import {
  createBuyerProfile,
  createSellerProfile,
  createUser,
  splitFullName,
} from "@/src/features/auth/services/userService";
import { authService } from "@/src/features/authentication/services/authService";
import { errorHandlingService } from "@/src/features/authentication/services/errorHandlingService";
import { initializeAuth } from "@/src/features/authentication/store/authSlice";
import Logo from "@/src/features/website/components/ui/Logo";
import type { AppDispatch } from "@/src/lib/store";
import {
  clearConfirmationPending,
  getConfirmationPending,
} from "@/src/utils/localStorageUtils";

/**
 * Profile creation functions mapping
 */
const PROFILE_CREATORS = {
  seller: createSellerProfile,
  buyer: createBuyerProfile,
} as const;

/**
 * Handle post-confirmation API calls (createUser and createProfile)
 */
async function handlePostConfirmationAPIs(
  setAlert: (
    alert: {
      type: "success" | "error" | "info";
      title: string;
      description: string;
    } | null
  ) => void
) {
  try {
    // Add delay to ensure session is fully established
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const userAttributes = await fetchUserAttributes();

    // Skip if already processed
    if (userAttributes["custom:profileCreated"] === "true") {
      return;
    }

    const userRole = userAttributes["custom:userRole"];
    const fullName = userAttributes["custom:fullName"];
    const email = userAttributes.email;

    if (!(userRole && fullName && email)) {
      throw new Error("Missing required user attributes");
    }

    // Create user with try-catch
    try {
      const { firstName, lastName } = splitFullName(fullName);
      const userType = userRole.toUpperCase() as "SELLER" | "BUYER";

      await createUser({
        username: email,
        email,
        firstName,
        lastName,
        userType,
        company: userAttributes["custom:companyName"] || "",
        jobTitle: userAttributes["custom:jobTitle"] || "",
        phone: userAttributes.phone_number || "",
        title: "",
        dateOfBirth: "",
      });
    } catch {
      // Silently handle
    }

    // Create profile with try-catch
    try {
      const profileCreator =
        PROFILE_CREATORS[userRole as keyof typeof PROFILE_CREATORS];
      if (profileCreator) {
        await profileCreator();
      }
    } catch {
      // Silently handle
    }
  } catch {
    setAlert({
      type: "error",
      title: "Profile Setup Error",
      description:
        "Account confirmed but profile setup incomplete. You can complete this later from your profile settings.",
    });
  }
}

/**
 * Handle successful auto sign-in
 */
async function handleAutoSignInSuccess(
  userType: string,
  redirectTo: string,
  router: ReturnType<typeof useRouter>,
  setAlert: (
    alert: {
      type: "success" | "error" | "info";
      title: string;
      description: string;
    } | null
  ) => void,
  dispatch: AppDispatch
) {
  setAlert({
    type: "success",
    title: "Account Confirmed! 🎉",
    description:
      "Your account has been successfully created. Completing sign-in...",
  });

  await new Promise((resolve) => setTimeout(resolve, 1000));
  await dispatch(initializeAuth()).unwrap();

  // Clear the pending data
  clearConfirmationPending();

  // Call APIs in the background (don't block redirect) - this must complete BEFORE verification check
  await handlePostConfirmationAPIs(setAlert);

  // Direct redirect based on user type and verification status
  if (userType === "seller") {
    // Sellers don't need verification - redirect directly
    setAlert({
      type: "info",
      title: "Redirecting...",
      description: "Taking you to seller dashboard.",
    });
    router.push("/seller/dashboard");
    return; // Exit early for sellers
  }

  // Only buyers need verification status check
  if (userType === "buyer") {
    // Check buyer verification status before redirecting
    try {
      const verificationResponse = await fetchUserVerificationStatus();

      if (verificationResponse.error || !verificationResponse.data) {
        // If verification status fetch fails, redirect to verification pending as fallback
        setAlert({
          type: "error",
          title: "Verification Error",
          description:
            "Verification status pending. Please check your verification page for updates.",
        });
        router.push("/buyer/verification-pending");
        return;
      }

      const verificationData = verificationResponse.data;

      if (verificationData.account_locked) {
        router.push("/auth/account-locked");
        return;
      }

      if (
        verificationData.verification_status === "pending" ||
        verificationData.verification_status === "rejected"
      ) {
        setAlert({
          type: "info",
          title: "Redirecting...",
          description: "Taking you to verification page.",
        });
        router.push("/buyer/verification-pending");
        return;
      }

      // Verification status is verified or other valid status
      setAlert({
        type: "info",
        title: "Redirecting...",
        description: "Taking you to marketplace.",
      });
      router.push(redirectTo);
    } catch (_error) {
      // If verification status fetch fails, redirect to verification pending as fallback
      setAlert({
        type: "error",
        title: "Verification Error",
        description:
          "Failed to fetch verification status. Redirecting to verification page.",
      });
      router.push("/buyer/verification-pending");
    }
  } else {
    router.push(redirectTo);
  }
}

/**
 * Handle auto sign-in failure - redirect to login with proper parameters
 */
function handleAutoSignInFailure(
  userType: string,
  redirectTo: string,
  router: ReturnType<typeof useRouter>,
  setAlert: (
    alert: {
      type: "success" | "error" | "info";
      title: string;
      description: string;
    } | null
  ) => void
) {
  setAlert({
    type: "success",
    title: "Account Confirmed! 🎉",
    description: "Please sign in to continue.",
  });

  clearConfirmationPending();

  // Redirect to login with parameters - verification will be handled by middleware
  const params = new URLSearchParams({
    justConfirmed: "true",
    redirect: redirectTo,
    userType,
  });

  router.push(`/auth/login?${params.toString()}`);
}

async function attemptAutoSignIn(): Promise<SignInOutput> {
  // Initial attempt with delay
  await new Promise((resolve) => setTimeout(resolve, 1000));
  try {
    return await authService.autoSignIn();
  } catch {
    // Retry once after additional delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return await authService.autoSignIn();
  }
}

function ConfirmSignUpContent() {
  const [confirmationCode, setConfirmationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [alert, setAlert] = useState<{
    type: "success" | "error" | "info";
    title: string;
    description: string;
  } | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch<AppDispatch>();

  const username = searchParams.get("username") || "";
  const redirectTo = searchParams.get("redirect") || "/marketplace";
  const userType = searchParams.get("userType") || "buyer";

  // Add state for last resend timestamp (for rate limiting)
  const [lastResendTime, setLastResendTime] = useState<number | null>(null);
  const RESEND_COOLDOWN_MS = 60 * 1000; // 1 minute cooldown

  // Add state for hasAutoResent and countdown
  const [hasAutoResent, setHasAutoResent] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  // Add ref to track if auto-resend has been attempted for this component mount
  const autoResendAttemptedRef = useRef(false);

  // Wrap handleResendCode in useCallback
  const handleResendCode = useCallback(async () => {
    if (
      resendCountdown > 0 ||
      (lastResendTime && Date.now() - lastResendTime < RESEND_COOLDOWN_MS)
    ) {
      setAlert({
        type: "info",
        title: "Please Wait",
        description: `You can resend in ${resendCountdown} seconds.`,
      });
      return;
    }

    setIsResending(true);

    try {
      await authService.resendSignUpCode({ username });
      setAlert({
        type: "success",
        title: "Code Resent! 📧",
        description: "A new confirmation code has been sent to your email.",
      });
      setLastResendTime(Date.now());
      setResendCountdown(60);
    } catch (err: unknown) {
      const handledError = errorHandlingService.handleAuthError(err as Error);
      setAlert({
        type: "error",
        title: handledError.title,
        description: handledError.description,
      });
    } finally {
      setIsResending(false);
    }
  }, [resendCountdown, lastResendTime, username, RESEND_COOLDOWN_MS]);

  // Auto-resend logic using useEffect
  useEffect(() => {
    if (resendCountdown > 0) {
      const intervalId = setInterval(() => {
        setResendCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);

      return () => {
        clearInterval(intervalId);
      };
    }

    // Prevent multiple auto-resend attempts per component mount
    if (autoResendAttemptedRef.current) {
      return;
    }

    // Skip auto-resend logic if already ran, if user is typing, or if loading
    if (hasAutoResent || confirmationCode || isLoading || isRedirecting) {
      return;
    }

    // Check pending data and flow type
    const pending = getConfirmationPending();
    const isInitialFlow = pending && Date.now() - pending.timestamp < 60 * 1000; // Less than 1 minute = initial

    // Skip auto-resend for initial flows - they already have a fresh OTP from signup
    if (isInitialFlow) {
      return;
    }

    // Mark that we've attempted auto-resend for this component mount
    autoResendAttemptedRef.current = true;

    let timeoutId: NodeJS.Timeout | null = null;

    const handleAutoResend = async () => {
      // Resumed flow: Check if we have old pending data for this user
      if (pending && pending.username === username) {
        if (
          lastResendTime &&
          Date.now() - lastResendTime < RESEND_COOLDOWN_MS
        ) {
          return;
        }

        await handleResendCode();
        setAlert({
          type: "success",
          title: "Code Sent",
          description: "We've sent a fresh confirmation code to your email.",
        });
        clearConfirmationPending();
        setHasAutoResent(true);
        return;
      }

      // Manual URL access: Fallback timeout only when no pending data exists
      timeoutId = setTimeout(async () => {
        const shouldSkip =
          confirmationCode || isLoading || isRedirecting || hasAutoResent;
        if (shouldSkip) {
          return;
        }

        if (
          lastResendTime &&
          Date.now() - lastResendTime < RESEND_COOLDOWN_MS
        ) {
          return;
        }

        await handleResendCode();
        setAlert({
          type: "success",
          title: "Code Sent",
          description: "Haven't received your code? We've sent a fresh one.",
        });
        setHasAutoResent(true);
      }, 15_000);
    };

    handleAutoResend().catch(() => {
      // Silently handle auto-resend errors to avoid breaking the flow
    });

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [
    resendCountdown,
    hasAutoResent,
    confirmationCode,
    isLoading,
    isRedirecting,
    username,
    lastResendTime,
    handleResendCode,
    RESEND_COOLDOWN_MS,
  ]);

  async function handleConfirmSignUp(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    if (!confirmationCode) {
      setAlert({
        type: "error",
        title: "Validation Error",
        description: "Please enter the confirmation code.",
      });
      setIsLoading(false);
      return;
    }

    try {
      // Step 1: Confirm the sign up
      await authService.confirmSignUp({
        username,
        confirmationCode,
      });

      // Step 2: Try auto sign-in with extracted function
      const signInOutput = await attemptAutoSignIn();

      if (signInOutput.isSignedIn) {
        setIsRedirecting(true);
        await handleAutoSignInSuccess(
          userType,
          redirectTo,
          router,
          setAlert,
          dispatch
        );
      } else {
        // Auto sign-in didn't complete but didn't fail either - try alternative approach
        await handlePostConfirmationAPIs(setAlert);

        // For normal flows where auto sign-in status might be unclear,
        // be more lenient and try to proceed with success flow
        if (signInOutput?.nextStep?.signInStep === "DONE") {
          setIsRedirecting(true);
          await handleAutoSignInSuccess(
            userType,
            redirectTo,
            router,
            setAlert,
            dispatch
          );
        } else {
          // Fallback for incomplete sign-in
          await handlePostConfirmationAPIs(setAlert);
          handleAutoSignInFailure(userType, redirectTo, router, setAlert);
        }
      }
    } catch {
      // Handle all errors as fallback (expected in resumed flows)
      await handlePostConfirmationAPIs(setAlert);
      handleAutoSignInFailure(userType, redirectTo, router, setAlert);
    } finally {
      setIsLoading(false);
    }
  }

  const isButtonDisabled = isLoading || isRedirecting || !confirmationCode;

  let buttonContent: React.ReactNode;
  if (isLoading) {
    buttonContent = (
      <>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Confirming...
      </>
    );
  } else if (isRedirecting) {
    buttonContent = (
      <>
        <CheckCircle className="mr-2 h-4 w-4" />
        Redirecting...
      </>
    );
  } else {
    buttonContent = "Confirm Account";
  }

  let resendButtonContent: React.ReactNode;
  if (isResending) {
    resendButtonContent = (
      <>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Resending...
      </>
    );
  } else if (resendCountdown > 0) {
    resendButtonContent = `Resend (${resendCountdown}s)`;
  } else {
    resendButtonContent = "Resend confirmation code";
  }

  return (
    <div className="relative flex min-h-screen bg-gradient-to-br from-slate-50 via-white to-green-50/30">
      <div className="flex w-full flex-col justify-center p-6 md:p-8 lg:w-1/2">
        <div className="mb-8">
          <Logo />
        </div>

        <div className="mx-auto w-full max-w-md">
          {alert && (
            <div className="mb-4">
              <Alert
                variant={alert.type === "error" ? "destructive" : "default"}
              >
                {alert.type === "error" && <AlertCircle className="h-4 w-4" />}
                {alert.type === "success" && (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                {alert.type === "info" && <Info className="h-4 w-4" />}
                <AlertTitle>{alert.title}</AlertTitle>
                <AlertDescription>{alert.description}</AlertDescription>
              </Alert>
            </div>
          )}
          <Card className="border-0 shadow-xl">
            <CardHeader className="space-y-2 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#43CD66]/10">
                <Mail className="h-6 w-6 text-[#43CD66]" />
              </div>
              <CardTitle className="text-2xl font-semibold">
                Confirm your account
              </CardTitle>
              <CardDescription className="text-gray-600">
                We&apos;ve sent a confirmation code to{" "}
                <strong>{username}</strong>. Please enter the code below to
                verify your account.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <form className="space-y-6" onSubmit={handleConfirmSignUp}>
                <div className="space-y-2">
                  <Label htmlFor="confirmationCode">Confirmation Code</Label>
                  <Input
                    className="text-center font-mono text-lg tracking-widest"
                    disabled={isLoading || isRedirecting}
                    id="confirmationCode"
                    maxLength={6}
                    name="confirmationCode"
                    onChange={(e) => setConfirmationCode(e.target.value)}
                    placeholder="Enter 6-digit code"
                    required
                    type="text"
                    value={confirmationCode}
                  />
                </div>

                <Button
                  className="w-full bg-gradient-to-r from-[#43CD66] to-emerald-500 py-3 text-base font-semibold text-white shadow-lg transition-all duration-300 hover:from-emerald-500 hover:to-[#43CD66]"
                  disabled={isButtonDisabled}
                  type="submit"
                >
                  {buttonContent}
                </Button>

                <div className="space-y-3 text-center">
                  <p className="text-sm text-gray-600">
                    Didn&apos;t receive the code?
                  </p>
                  <Button
                    className="text-sm"
                    disabled={
                      isResending ||
                      isLoading ||
                      isRedirecting ||
                      resendCountdown > 0
                    }
                    onClick={handleResendCode}
                    type="button"
                    variant="outline"
                  >
                    {resendButtonContent}
                  </Button>
                </div>
              </form>

              <div className="border-t pt-4 text-center text-sm text-gray-600">
                Need help? Email us at{" "}
                <a
                  className="font-medium text-[#43CD66] hover:underline"
                  href="mailto:team@commercecentral.io"
                >
                  team@commercecentral.io
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="relative hidden w-1/2 bg-gradient-to-br from-[#43CD66] to-emerald-600 lg:block">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="max-w-md p-8 text-center text-white">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-white/20">
              <Mail className="h-12 w-12" />
            </div>
            <h2 className="mb-4 text-3xl font-bold">Check your email</h2>
            <p className="text-lg leading-relaxed opacity-90">
              We&apos;ve sent a 6-digit confirmation code to your email address.
              This helps us keep your account secure and verify your identity.
            </p>
            <div className="mt-8 flex items-center justify-center space-x-2 text-white/80">
              <CheckCircle className="h-5 w-5" />
              <span className="text-sm">Secure verification process</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ConfirmSignUpPage() {
  return (
    <Suspense
      fallback={
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-xs">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-[#43CD66]" />
            <p className="text-gray-600">Loading confirmation page...</p>
          </div>
        </div>
      }
    >
      <ConfirmSignUpContent />
    </Suspense>
  );
}
