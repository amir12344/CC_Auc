'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { signIn, SignInOutput, getCurrentUser, fetchUserAttributes } from 'aws-amplify/auth';
import { Suspense } from 'react';
import { useDispatch } from 'react-redux';
import { Mail, Lock, Loader2, Eye, EyeOff, CheckCircle } from 'lucide-react';
import Logo from '@/src/features/website/components/ui/Logo';
import { loginWithAmplifyUser, initializeAuth } from '@/src/features/authentication/store/authSlice';
import { authSessionStorage } from '@/src/utils/sessionStorage';
import { useToast } from '@/src/hooks/use-toast';
import type { AmplifyUser } from '@/src/lib/interfaces/auth';
import type { AppDispatch } from '@/src/lib/store';

// Define Zod schema for form validation
const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

// Create type from schema
type LoginFormData = z.infer<typeof loginSchema>;

function LoginPageContent() {
  const [showPassword, setShowPassword] = useState(false);
  const [isCheckingUser, setIsCheckingUser] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch<AppDispatch>();
  const { toast } = useToast();
  
  // Get the redirect URL from query params (supports both returnUrl and redirect for compatibility)
  const redirectTo = searchParams.get('returnUrl') || searchParams.get('redirect') || authSessionStorage.getAndClearRedirectUrl() || '/marketplace';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
    email: '',
    password: '',
    },
  });

  useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (currentUser) {
          // User is already signed in, trigger auth initialization and redirect
          await dispatch(initializeAuth()).unwrap();
          
          // Determine redirect based on user type
          const attributes = await fetchUserAttributes();
          const userType = attributes['custom:userRole'] as 'buyer' | 'seller';
          
          if (userType === 'seller') {
            router.push('/seller/dashboard');
          } else if (userType === 'buyer') {
            router.push(redirectTo);
          } else {
            router.push('/marketplace');
          }
        }
      } catch (e) {
        // Not signed in - this is expected for login page
        console.log('User not authenticated, showing login form');
      } finally {
        setIsCheckingUser(false);
      }
    };
    checkUser();
      }, [router, redirectTo, dispatch]);

  const handleSuccessfulLogin = async (email: string) => {
    try {
      console.log('🎉 Login successful, updating auth state...');
      
      // Show success toast and set redirecting state
      setIsRedirecting(true);
      toast({
        title: "Login Successful! 🎉",
        description: "Redirecting you to your dashboard...",
      });
      
      // Trigger auth initialization to update with new user data
      await dispatch(initializeAuth()).unwrap();
      
      // Get user attributes to determine redirect
      const attributes = await fetchUserAttributes();
      const userType = attributes['custom:userRole'] as 'buyer' | 'seller';
      
      console.log('✅ User type determined:', userType);
      
      // Save redirect URL if needed
      if (redirectTo !== '/marketplace') {
        authSessionStorage.saveRedirectUrl(redirectTo);
      }
      
      // Add a slight delay for better UX
      setTimeout(() => {
        // Redirect based on user type
        if (userType === 'seller') {
          router.push('/seller/dashboard');
        } else if (userType === 'buyer') {
          router.push(redirectTo);
        } else {
          // Fallback for users without proper user type
          router.push('/marketplace');
        }
      }, 1500);
      
    } catch (error) {
      console.error('❌ Error handling successful login:', error);
      setIsRedirecting(false);
      toast({
        variant: "destructive",
        title: "Login Error",
        description: "Authentication successful but there was an issue redirecting. Please try refreshing the page.",
      });
      // Fallback redirect
      setTimeout(() => {
        router.push(redirectTo);
      }, 2000);
    }
  };

  const handleSignInResult = (output: SignInOutput, email: string) => {
    const { nextStep } = output;
    switch (nextStep.signInStep) {
      case 'CONFIRM_SIGN_UP':
        toast({
          variant: "destructive",
          title: "Account Not Confirmed",
          description: "Please confirm your sign up first. Redirecting to confirmation page...",
        });
        setTimeout(() => {
            router.push(`/auth/confirm?username=${encodeURIComponent(email)}`);
        }, 2000);
        break;
      case 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED':
        toast({
          variant: "destructive",
          title: "New Password Required",
          description: "You need to set a new password. Redirecting...",
        });
        setTimeout(() => {
            router.push(`/auth/new-password-required?username=${encodeURIComponent(email)}`);
        }, 2000);
        break;
      case 'CONFIRM_SIGN_IN_WITH_CUSTOM_CHALLENGE':
        toast({
          variant: "destructive",
          title: "Additional Verification Required",
          description: "Custom authentication challenge is required to sign in.",
        });
        break;
      case 'RESET_PASSWORD':
        toast({
          variant: "destructive",
          title: "Password Reset Required",
          description: "Your password needs to be reset. Redirecting to forgot password page...",
        });
        setTimeout(() => {
            router.push(`/auth/forgot-password?username=${encodeURIComponent(email)}`);
        }, 2000);
        break;
      case 'DONE':
        // Login successful - update auth context and redirect
        handleSuccessfulLogin(email);
        break;
      default:
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "Unhandled sign in step. Please try again or contact support.",
        });
        console.log('Unhandled sign in step:', nextStep.signInStep);
    }
  };

  const processForm = async (data: LoginFormData) => {
    try {
      const output = await signIn({ 
        username: data.email, 
        password: data.password 
      });
      handleSignInResult(output, data.email);
    } catch (err: any) {
      console.error('Error signing in:', err);
      if (err.name === 'UserAlreadyAuthenticatedException') {
        toast({
          title: "Already Logged In",
          description: "You are already authenticated. Redirecting...",
        });
        router.push(redirectTo); 
        return;
      } else if (err.name === 'UserNotFoundException') {
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: "Incorrect email or password. Please try again.",
        });
      } else if (err.name === 'NotAuthorizedException') {
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: "Incorrect email or password. Please try again.",
        });
      } else if (err.name === 'LimitExceededException') {
        toast({
          variant: "destructive",
          title: "Too Many Attempts",
          description: "Attempt limit exceeded, please try after some time.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Login Error",
          description: err.message || "An unexpected error occurred. Please try again.",
        });
      }
    }
  };

  if (isCheckingUser) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#43CD66]"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-white to-green-50/30 relative">
      {(isSubmitting || isRedirecting) && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-[#43CD66]" />
            <p className="text-gray-600">
              {isRedirecting ? "Redirecting to your dashboard..." : "Signing you in..."}
            </p>
          </div>
        </div>
      )}

      {/* Left side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col p-6 md:p-12 justify-center relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-50/20 via-transparent to-blue-50/20 pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#43CD66]/5 to-transparent rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-blue-500/5 to-transparent rounded-full blur-2xl pointer-events-none"></div>
        
        <div className="relative z-10">
        <div className="mb-8">
            <Logo />
        </div>

          {/* Title Section */}
          <div className="mb-8">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-3xl md:text-4xl mb-3 font-bold bg-gradient-to-r from-[#1C1E21] via-[#102d21] to-[#43cd66] bg-clip-text text-transparent"
            >
              Welcome back
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-gray-600 text-lg"
            >
              Login to access your Commerce Central account.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="h-1 w-full bg-gradient-to-r from-[#43CD66] via-[#43CD66]/60 to-transparent rounded-full"
            ></motion.div>
          </div>

          <motion.form 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            onSubmit={handleSubmit(processForm)} 
            className="space-y-6"
          >
          <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Mail className="h-4 w-4 md:h-5 md:w-5 text-[#43CD66]" />
                </div>
            <input
              type="email"
              id="email"
                  {...register('email')}
                  className={`w-full pl-10 pr-3 py-3 text-sm border ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg shadow-sm focus:outline-none focus:ring-[#43CD66] focus:border-[#43CD66] text-gray-900 bg-white/80 transition-all duration-200`}
                  placeholder="you@example.com"
                  disabled={isSubmitting || isRedirecting}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.email.message}
                </p>
              )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                <Link
                  href="/auth/forgot-password" 
                  className="text-sm text-[#43CD66] hover:text-[#102D21] transition-colors"
              >
                Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Lock className="h-4 w-4 md:h-5 md:w-5 text-[#43CD66]" />
            </div>
            <input
                  type={showPassword ? "text" : "password"}
              id="password"
                  {...register('password')}
                  className={`w-full pl-10 pr-12 py-3 text-sm border ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg shadow-sm focus:outline-none focus:ring-[#43CD66] focus:border-[#43CD66] text-gray-900 bg-white/80 transition-all duration-200`}
              placeholder="Enter your password"
                  disabled={isSubmitting || isRedirecting}
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  onClick={() => setShowPassword(!showPassword)}
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
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className={`w-full bg-gradient-to-r from-[#43CD66] to-[#3ab859] hover:from-[#3ab859] hover:to-[#2ea043] border border-[#1c1e21] hover:border-[#102D21] text-[#1C1E21] font-medium py-3.5 px-6 rounded-full transition-all duration-200 focus:outline-none text-sm md:text-base flex justify-center items-center shadow-lg hover:shadow-xl ${
                  (!isValid || isSubmitting || isRedirecting) ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'
                }`}
                disabled={!isValid || isSubmitting || isRedirecting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-[#1C1E21]" />
                    Signing you in...
                  </>
                ) : isRedirecting ? (
                  <>
                    <CheckCircle className="w-5 h-5 mr-3 text-[#1C1E21]" />
                    Redirecting...
                  </>
                ) : (
                  'Login'
                )}
              </motion.button>
              
              <div className="mt-4 text-center">
                <span className="text-sm text-gray-600">Don't have an account? </span>
                <Link 
                  href={`/auth/select-user-type${redirectTo !== '/marketplace' ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`}
                  className="text-sm text-[#43CD66] hover:text-[#102D21] font-medium transition-colors"
                >
                  Sign up here
                </Link>
              </div>
          </div>

            <div className="mt-8 text-center text-sm text-gray-600">
              Need help? Email us at{' '}
              <a href="mailto:team@commercecentral.io" className="font-bold text-[#1C1E21] hover:underline transition-colors">
                team@commercecentral.io
              </a>
            </div>
          </motion.form>
        </div>
      </div>

      {/* Right side - Commerce Central Platform Experience */}
      <div className="hidden lg:block w-1/2 bg-gradient-to-br from-[#1C1E21] via-[#102d21] to-[#43cd66] relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <motion.div
            animate={{ 
              y: [0, -15, 0],
              rotate: [0, 3, 0]
            }}
            transition={{ 
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-16 lg:top-24 left-12 lg:left-20 w-16 lg:w-20 h-16 lg:h-20 border-2 border-[#43CD66]/20 rounded-xl"
          ></motion.div>
          
          <motion.div
            animate={{ 
              y: [0, 20, 0],
              rotate: [0, -5, 0]
            }}
            transition={{ 
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
            className="absolute top-48 lg:top-60 right-8 lg:right-16 w-12 lg:w-16 h-12 lg:h-16 bg-[#43CD66]/10 rounded-full"
          ></motion.div>
          
              <motion.div
                animate={{
              y: [0, -12, 0],
              x: [0, 8, 0]
                }}
                transition={{
              duration: 12,
                  repeat: Infinity,
              ease: "easeInOut",
              delay: 4
            }}
            className="absolute bottom-32 lg:bottom-40 left-16 lg:left-24 w-20 lg:w-24 h-20 lg:h-24 border border-white/10 rounded-lg rotate-12"
          ></motion.div>
        </div>

        {/* Main Content */}
        <div className="absolute inset-0 flex flex-col justify-center p-6 lg:p-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mb-8 lg:mb-12 text-center"
          >
            <div className="w-16 lg:w-20 h-16 lg:h-20 bg-gradient-to-br from-[#43CD66] to-[#3ab859] rounded-2xl flex items-center justify-center mx-auto mb-4 lg:mb-6 shadow-2xl">
              <svg className="w-8 lg:w-10 h-8 lg:h-10 text-[#1C1E21]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            
            <h2 className="text-2xl lg:text-3xl font-bold text-white mb-3 lg:mb-4">
              Commerce Central Platform
            </h2>
            <p className="text-white/80 text-base lg:text-lg max-w-sm lg:max-w-md mx-auto leading-relaxed px-2">
              Your unified wholesale marketplace connecting buyers and sellers with enterprise-grade commerce solutions.
            </p>
              </motion.div>

          {/* Platform Features */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mb-8 lg:mb-12"
          >
            {/* First row - Unified Commerce (full width on medium, half on large) */}
            <div className="grid grid-cols-1 xl:grid-cols-1 gap-3 lg:gap-4 mb-4">
              <div className="flex items-center space-x-3 lg:space-x-4">
                <div className="w-10 lg:w-12 h-10 lg:h-12 bg-[#43CD66]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 lg:w-6 h-5 lg:h-6 text-[#43CD66]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-white font-semibold text-sm lg:text-base">Unified Commerce</h4>
                  <p className="text-white/60 text-xs lg:text-sm">Seamless integration across all sales channels</p>
                </div>
              </div>
            </div>

            {/* Second row - Two features side by side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
              <div className="flex items-center space-x-3 lg:space-x-4">
                <div className="w-10 lg:w-12 h-10 lg:h-12 bg-[#43CD66]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 lg:w-6 h-5 lg:h-6 text-[#43CD66]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-white font-semibold text-sm lg:text-base">Verified Network</h4>
                  <p className="text-white/60 text-xs lg:text-sm">Trusted buyers and sellers</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 lg:space-x-4">
                <div className="w-10 lg:w-12 h-10 lg:h-12 bg-[#43CD66]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 lg:w-6 h-5 lg:h-6 text-[#43CD66]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-white font-semibold text-sm lg:text-base">Smart Pricing</h4>
                  <p className="text-white/60 text-xs lg:text-sm">AI-driven optimization</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Platform Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-md rounded-xl p-4 lg:p-6 border border-white/20"
          >
            <div className="grid grid-cols-3 gap-2 lg:gap-4 text-center">
              <div>
                <div className="text-xl lg:text-2xl font-bold text-[#43CD66] mb-1">10K+</div>
                <div className="text-white/60 text-xs">Active Buyers</div>
              </div>
              <div>
                <div className="text-xl lg:text-2xl font-bold text-[#43CD66] mb-1">500+</div>
                <div className="text-white/60 text-xs">Verified Sellers</div>
              </div>
              <div>
                <div className="text-xl lg:text-2xl font-bold text-[#43CD66] mb-1">99%</div>
                <div className="text-white/60 text-xs">Satisfaction Rate</div>
              </div>
            </div>
            
            <div className="mt-3 lg:mt-4 pt-3 lg:pt-4 border-t border-white/10">
              <p className="text-white/90 text-xs lg:text-sm italic text-center leading-relaxed">
                "Commerce Central has transformed our wholesale operations with seamless order management and real-time inventory tracking."
              </p>
              <p className="text-white/60 text-xs text-center mt-2">- Sarah Chen, Supply Chain Director</p>
          </div>
          </motion.div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-48 lg:w-64 h-48 lg:h-64 bg-gradient-to-bl from-[#43CD66]/10 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-32 lg:w-48 h-32 lg:h-48 bg-gradient-to-tr from-white/5 to-transparent rounded-full blur-2xl"></div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="fixed inset-0 bg-white/80 backdrop-blur-xs flex items-center justify-center z-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
} 