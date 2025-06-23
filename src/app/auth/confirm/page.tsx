'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { CheckCircle, Mail, Loader2, AlertCircle } from 'lucide-react';
import Logo from '@/src/features/website/components/ui/Logo';
import { useToast } from '@/src/hooks/use-toast';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/src/lib/store';
import { initializeAuth } from '@/src/features/authentication/store/authSlice';
import { authService } from '@/src/features/authentication/services/authService';
import { errorHandlingService } from '@/src/features/authentication/services/errorHandlingService';

function ConfirmSignUpContent() {
  const [confirmationCode, setConfirmationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch<AppDispatch>();
  const { toast } = useToast();

  const username = searchParams.get('username') || '';
  const redirectTo = searchParams.get('redirect') || '/marketplace';
  const userType = searchParams.get('userType') || 'buyer';

  const handleConfirmSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!confirmationCode) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please enter the confirmation code.",
      });
      setIsLoading(false);
      return;
    }

    try {
      const { isSignUpComplete, nextStep } = await authService.confirmSignUp({
        username,
        confirmationCode
      });

      if (isSignUpComplete) {
        // Show success toast
        toast({
          title: "Account Confirmed! 🎉",
          description: "Your account has been successfully verified.",
        });

        // Attempt auto sign-in for seamless flow
        try {
          const signInResult = await authService.autoSignIn();
          console.log('Auto sign-in successful after OTP confirmation:', signInResult);
        } catch (autoSignInError: any) {
          console.warn('Auto sign-in failed, but this is sometimes expected:', autoSignInError.message);

          // Manual sign-in fallback - for seller flow, we should attempt to sign them in
          if (userType === 'seller') {
            try {
              // We don't have the password here, so we can't do manual sign-in
              // Instead, we'll rely on the auth refresh to detect the confirmed user
              console.log('Attempting manual auth refresh after OTP confirmation...');
            } catch (fallbackError) {
              console.error('Fallback auth also failed:', fallbackError);
            }
          }
        }

        // Refresh auth context to ensure Redux state is updated
        console.log('Refreshing authentication state...');
        await dispatch(initializeAuth()).unwrap();

        // Add extra delay to ensure auth state is fully synchronized
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Set redirecting state and redirect based on user type
        setIsRedirecting(true);

        if (userType === 'buyer') {
          toast({
            title: "Redirecting...",
            description: "Taking you to certificate upload page.",
          });
          setTimeout(() => {
            router.push(`/auth/buyer-signup/certificate-upload?redirect=${encodeURIComponent(redirectTo)}`);
          }, 1500);
        } else if (userType === 'seller') {
          toast({
            title: "Redirecting...",
            description: "Taking you to seller dashboard.",
          });

          // For sellers, add additional delay to ensure auth state is ready
          setTimeout(() => {
            console.log('Redirecting seller to dashboard after OTP confirmation...');
            router.push('/seller/dashboard');
          }, 2000); // Increased delay for sellers
        } else {
          toast({
            title: "Redirecting...",
            description: "Taking you to your dashboard.",
          });
          setTimeout(() => {
            router.push(redirectTo);
          }, 1500);
        }
      } else {
        console.log('Next step:', nextStep);
        toast({
          variant: "destructive",
          title: "Confirmation Incomplete",
          description: "Account confirmation is not complete. Please try again.",
        });
      }
    } catch (err: any) {
      console.error('Error confirming sign up:', err);
      const handledError = errorHandlingService.handleAuthError(err);
      toast({
        variant: "destructive",
        title: handledError.title,
        description: handledError.description,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);

    try {
      await authService.resendSignUpCode({ username });
      toast({
        title: "Code Resent! 📧",
        description: "A new confirmation code has been sent to your email.",
      });
    } catch (err: any) {
      console.error('Error resending code:', err);
      const handledError = errorHandlingService.handleAuthError(err);
      toast({
        variant: "destructive",
        title: handledError.title,
        description: handledError.description,
      });
    } finally {
      setIsResending(false);
    }
  };

  const isButtonDisabled = isLoading || isRedirecting || !confirmationCode;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-white to-green-50/30 relative">
      <div className="w-full lg:w-1/2 flex flex-col p-6 md:p-8 justify-center">
        <div className="mb-8">
          <Logo />
        </div>

        <div className="max-w-md mx-auto w-full">
          <Card className="border-0 shadow-xl">
            <CardHeader className="text-center space-y-2">
              <div className="mx-auto w-12 h-12 bg-[#43CD66]/10 rounded-full flex items-center justify-center mb-4">
                <Mail className="w-6 h-6 text-[#43CD66]" />
              </div>
              <CardTitle className="text-2xl font-semibold">Confirm your account</CardTitle>
              <CardDescription className="text-gray-600">
                We've sent a confirmation code to <strong>{username}</strong>.
                Please enter the code below to verify your account.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <form onSubmit={handleConfirmSignUp} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="confirmationCode">Confirmation Code</Label>
                  <Input
                    type="text"
                    id="confirmationCode"
                    name="confirmationCode"
                    placeholder="Enter 6-digit code"
                    value={confirmationCode}
                    onChange={(e) => setConfirmationCode(e.target.value)}
                    className="text-center text-lg tracking-widest font-mono"
                    maxLength={6}
                    required
                    disabled={isLoading || isRedirecting}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-[#43CD66] to-emerald-500 hover:from-emerald-500 hover:to-[#43CD66] text-white font-semibold py-3 text-base shadow-lg transition-all duration-300"
                  disabled={isButtonDisabled}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Confirming...
                    </>
                  ) : isRedirecting ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Redirecting...
                    </>
                  ) : (
                    'Confirm Account'
                  )}
                </Button>

                <div className="text-center space-y-3">
                  <p className="text-sm text-gray-600">Didn't receive the code?</p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleResendCode}
                    disabled={isResending || isLoading || isRedirecting}
                    className="text-sm"
                  >
                    {isResending ? (
                      <>
                        <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                        Resending...
                      </>
                    ) : (
                      'Resend confirmation code'
                    )}
                  </Button>
                </div>
              </form>

              <div className="text-center text-sm text-gray-600 pt-4 border-t">
                Need help? Email us at{' '}
                <a href="mailto:team@commercecentral.io" className="text-[#43CD66] hover:underline font-medium">
                  team@commercecentral.io
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="hidden lg:block w-1/2 bg-gradient-to-br from-[#43CD66] to-emerald-600 relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white p-8 max-w-md">
            <div className="w-24 h-24 mx-auto mb-6 bg-white/20 rounded-full flex items-center justify-center">
              <Mail className="w-12 h-12" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Check your email</h2>
            <p className="text-lg opacity-90 leading-relaxed">
              We've sent a 6-digit confirmation code to your email address.
              This helps us keep your account secure and verify your identity.
            </p>
            <div className="mt-8 flex items-center justify-center space-x-2 text-white/80">
              <CheckCircle className="w-5 h-5" />
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
    <Suspense fallback={
      <div className="fixed inset-0 bg-white/80 backdrop-blur-xs flex items-center justify-center z-50">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-[#43CD66]" />
          <p className="text-gray-600">Loading confirmation page...</p>
        </div>
      </div>
    }>
      <ConfirmSignUpContent />
    </Suspense>
  );
} 