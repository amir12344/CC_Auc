'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { signUp } from 'aws-amplify/auth';
import { Suspense } from 'react';
import { User, Mail, Phone, Loader2, AlertCircle, X, ShoppingBag, Package, Shield, Clock, EyeOff, Eye, Briefcase, Building } from 'lucide-react';
import Logo from '@/src/features/website/components/ui/Logo';

// Define Zod schema for form validation
const buyerSignupSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  jobTitle: z.string().min(1, { message: 'Job title is required' }),
  companyName: z.string().min(1, { message: 'Company name is required' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters long' })
    .regex(/[a-zA-Z]/, { message: 'Password must contain at least one letter' })
    .regex(/[0-9]/, { message: 'Password must contain at least one number' })
    .regex(/[^a-zA-Z0-9]/, { message: 'Password must contain at least one special character' }),
  phoneNumber: z
    .string()
    .min(1, { message: 'Phone number is required' })
    .refine(
      (val) => {
        const digitsOnly = val.replace(/\D/g, '');
        return /^\d{10}$/.test(digitsOnly);
      },
      {
        message: 'Phone number must be exactly 10 digits',
      }
    ),
  termsAccepted: z.boolean().refine((value) => value === true, {
    message: 'You must accept the terms and conditions',
  }),
});

// Create type from schema
type BuyerSignupFormData = z.infer<typeof buyerSignupSchema>;

function BuyerSignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get the redirect URL from query params (for returning to product page)
  const redirectTo = searchParams.get('redirect') || '/marketplace';
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    reset,
  } = useForm<BuyerSignupFormData>({
    resolver: zodResolver(buyerSignupSchema),
    defaultValues: {
      name: '',
      jobTitle: '',
      companyName: '',
      email: '',
      password: '',
      phoneNumber: '',
      termsAccepted: false,
    },
  });

  const processForm = async (data: BuyerSignupFormData) => {
    setErrorMessage(null);

    try {
      // Format phone number for E.164 (required now)
      const digitsOnly = data.phoneNumber.replace(/\D/g, '');
      const formattedPhoneNumber = `+1${digitsOnly}`;

      const { isSignUpComplete, userId, nextStep } = await signUp({
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
            "custom:termsAccepted": data.termsAccepted.toString()
          },
          autoSignIn: {
            enabled: true,
            validateData: true
          }
        }
      });

      console.log('Sign up successful', { isSignUpComplete, userId, nextStep });

      if (nextStep.signUpStep === 'COMPLETE_AUTO_SIGN_IN' || isSignUpComplete) {
        // Direct to certificate upload if auto-signin is complete
        router.push(`/auth/buyer-signup/certificate-upload?redirect=${encodeURIComponent(redirectTo)}`);
      } else if (nextStep.signUpStep === 'CONFIRM_SIGN_UP') {
        // Go to confirmation page with next step info
        router.push(`/auth/confirm?username=${encodeURIComponent(data.email)}&userType=buyer&redirect=${encodeURIComponent(redirectTo)}`);
      } else {
        console.log("Unhandled sign up step:", nextStep.signUpStep);
        setErrorMessage("Sign up process is not fully complete. Please check for further instructions.");
      }

    } catch (err: any) {
      console.error('Error signing up:', err);
      setErrorMessage(err.message || "An unexpected error occurred during sign up.");
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-white to-green-50/30">
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

          {/* Simplified Title Section */}
          <div className="mb-8">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-3xl md:text-4xl mb-3 font-bold bg-gradient-to-r from-[#1C1E21] via-[#102d21] to-[#43cd66] bg-clip-text text-transparent"
            >
              Buyer Access
            </motion.h1>
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
            transition={{ duration: 0.8, delay: 0.6 }}
            onSubmit={handleSubmit(processForm)}
            className="space-y-6"
          >
            {/* Name and Job Title - Same Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <User className="h-4 w-4 md:h-5 md:w-5 text-[#43CD66]" />
                  </div>
                  <input
                    type="text"
                    id="name"
                    {...register('name')}
                    className={`w-full pl-10 pr-3 py-3 text-sm border ${errors.name ? 'border-red-500' : 'border-gray-300'
                      } rounded-lg shadow-sm focus:outline-none focus:ring-[#43CD66] focus:border-[#43CD66] text-gray-900 bg-white/80 transition-all duration-200`}
                    placeholder="John Doe"
                    disabled={isSubmitting}
                  />
                </div>
                {errors.name && (
                  <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
                )}
              </div>

              {/* Job Title */}
              <div>
                <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700 mb-2">Job Title</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Briefcase className="h-4 w-4 md:h-5 md:w-5 text-[#43CD66]" />
                  </div>
                  <input
                    type="text"
                    id="jobTitle"
                    {...register('jobTitle')}
                    className={`w-full pl-10 pr-3 py-3 text-sm border ${errors.jobTitle ? 'border-red-500' : 'border-gray-300'
                      } rounded-lg shadow-sm focus:outline-none focus:ring-[#43CD66] focus:border-[#43CD66] text-gray-900 bg-white/80 transition-all duration-200`}
                    placeholder="Purchasing Manager"
                    disabled={isSubmitting}
                  />
                </div>
                {errors.jobTitle && (
                  <p className="mt-1 text-xs text-red-600">{errors.jobTitle.message}</p>
                )}
              </div>
            </div>

            {/* Company Name and Phone Number - Same Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Company Name */}
              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Building className="h-4 w-4 md:h-5 md:w-5 text-[#43CD66]" />
                  </div>
                  <input
                    type="text"
                    id="companyName"
                    {...register('companyName')}
                    className={`w-full pl-10 pr-3 py-3 text-sm border ${errors.companyName ? 'border-red-500' : 'border-gray-300'
                      } rounded-lg shadow-sm focus:outline-none focus:ring-[#43CD66] focus:border-[#43CD66] text-gray-900 bg-white/80 transition-all duration-200`}
                    placeholder="ABC Corp"
                    disabled={isSubmitting}
                  />
                </div>
                {errors.companyName && (
                  <p className="mt-1 text-xs text-red-600">{errors.companyName.message}</p>
                )}
              </div>

              {/* Phone Number */}
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Phone className="h-4 w-4 md:h-5 md:w-5 text-[#43CD66]" />
                  </div>
                  <span className="absolute left-10 top-1/2 -translate-y-1/2 text-[#43CD66] font-medium select-none pointer-events-none text-sm">
                    +1
                  </span>
                  <input
                    type="tel"
                    id="phoneNumber"
                    inputMode="tel"
                    pattern="^\d{10,15}$"
                    maxLength={15}
                    {...register('phoneNumber')}
                    className={`w-full pl-16 pr-3 py-3 text-sm border ${errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                      } rounded-lg shadow-sm focus:outline-none focus:ring-[#43CD66] focus:border-[#43CD66] text-gray-900 bg-white/80 transition-all duration-200`}
                    placeholder="123 456-7890"
                    autoComplete="tel"
                    disabled={isSubmitting}
                  />
                </div>
                {errors.phoneNumber && (
                  <p className="mt-1 text-xs text-red-600">{errors.phoneNumber.message}</p>
                )}
              </div>
            </div>

            {/* Email and Password - Same Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Email */}
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
                    className={`w-full pl-10 pr-3 py-3 text-sm border ${errors.email ? 'border-red-500' : 'border-gray-300'
                      } rounded-lg shadow-sm focus:outline-none focus:ring-[#43CD66] focus:border-[#43CD66] text-gray-900 bg-white/80 transition-all duration-200`}
                    placeholder="you@example.com"
                    disabled={isSubmitting}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    {...register('password')}
                    className={`w-full p-3 text-sm border ${errors.password ? 'border-red-500' : 'border-gray-300'
                      } rounded-lg shadow-sm focus:outline-none focus:ring-[#43CD66] focus:border-[#43CD66] text-gray-900 bg-white/80 transition-all duration-200`}
                    placeholder="Create a secure password"
                    disabled={isSubmitting}
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
                  <div className="mt-1">
                    <p className="text-xs text-red-600">Password must:</p>
                    <ul className="text-xs text-red-600 ml-4">
                      {errors.password.message?.includes('8 characters') && <li>- Be at least 8 characters long</li>}
                      {errors.password.message?.includes('letter') && <li>- Contain at least one letter</li>}
                      {errors.password.message?.includes('number') && <li>- Contain at least one number</li>}
                      {errors.password.message?.includes('special') && <li>- Contain at least one special character</li>}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start mb-0">
              <div className="flex items-center h-5">
                <input
                  id="termsAccepted"
                  type="checkbox"
                  {...register('termsAccepted')}
                  className="focus:ring-[#43CD66] h-4 w-4 text-[#43CD66] border-gray-300 rounded"
                  disabled={isSubmitting}
                />
              </div>
              <div className="ml-3 text-sm">
                <label
                  htmlFor='termsAccepted'
                  className='font-medium text-gray-700'
                >
                  I agree to the{' '}
                  <Link
                    href='/website/legal/terms'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-[#43CD66] hover:text-[#102D21]'
                  >
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link
                    href='/website/legal/privacy-policy'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-[#43CD66] hover:text-[#102D21]'
                  >
                    Privacy Policy
                  </Link>
                </label>
                {errors.termsAccepted && (
                  <p className="mt-1 text-xs text-red-600 font-medium">{errors.termsAccepted.message}</p>
                )}
              </div>
            </div>

            {/* Error message box */}
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
                role="alert"
                className="flex items-start gap-3 bg-gradient-to-r from-red-50 to-red-50/70 border-l-4 border-red-500 text-red-800 px-4 py-3 rounded-md shadow-sm relative overflow-hidden"
              >
                <AlertCircle className="h-4 w-4 md:h-5 md:w-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <span className="font-medium text-xs md:text-sm">{errorMessage}</span>
                </div>
                <button
                  type="button"
                  aria-label="Dismiss error"
                  className="ml-2 text-red-400 hover:text-red-600 focus:outline-none transition-colors"
                  onClick={() => setErrorMessage(null)}
                >
                  <X className="h-3 w-3 md:h-4 md:w-4" />
                </button>
              </motion.div>
            )}

            {/* Submit Button */}
            <div className="pt-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className={`w-full bg-gradient-to-r from-[#43CD66] to-[#3ab859] hover:from-[#3ab859] hover:to-[#2ea043] border border-[#1c1e21] hover:border-[#102D21] text-[#1C1E21] font-medium py-3.5 px-6 rounded-full transition-all duration-200 focus:outline-none text-sm md:text-base flex justify-center items-center shadow-lg hover:shadow-xl ${(!isValid || isSubmitting) ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'
                  }`}
                disabled={!isValid || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-[#1C1E21]" />
                    Creating Your Account...
                  </>
                ) : (
                  'Create Buyer Account'
                )}
              </motion.button>

              <div className="mt-4 text-center">
                <span className="text-sm text-gray-600">Already have an account? </span>
                <Link href="/auth/login" className="text-sm text-[#43CD66] hover:text-[#102D21] font-medium transition-colors">Sign in</Link>
              </div>
            </div>
          </motion.form>

          <div className="mt-8 text-center text-sm text-gray-600">
            Need help? Email us at{' '}
            <a href="mailto:team@commercecentral.io" className="font-bold text-[#1C1E21] hover:underline transition-colors">
              team@commercecentral.io
            </a>
          </div>
        </div>
      </div>

      {/* Right side - Improved Design */}
      <div className="hidden lg:block w-1/2 bg-gradient-to-br from-[#1C1E21] via-[#102d21] to-[#43cd66] relative overflow-hidden">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-32 h-32 border border-white/20 rounded-lg rotate-12"></div>
          <div className="absolute top-40 right-32 w-24 h-24 border border-white/10 rounded-full"></div>
          <div className="absolute bottom-40 left-16 w-40 h-40 border border-white/15 rounded-xl rotate-45"></div>
          <div className="absolute bottom-20 right-20 w-20 h-20 border border-white/10 rounded-lg -rotate-12"></div>
        </div>

        {/* Main Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center">
          {/* Central Logo/Icon */}
          <motion.div
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="mb-12"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-[#43CD66] to-[#3ab859] rounded-2xl flex items-center justify-center shadow-2xl">
              <ShoppingBag className="w-12 h-12 text-[#1C1E21]" />
            </div>
          </motion.div>

          {/* Main Message */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Welcome to Commerce Central
            </h2>
            <p className="text-white/80 text-lg max-w-md">
              Join thousands of buyers accessing premium products at wholesale prices from verified sellers worldwide.
            </p>
          </motion.div>

          {/* Key Benefits */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="grid grid-cols-1 gap-6 max-w-sm"
          >
            <div className="flex items-center text-white/90">
              <div className="w-8 h-8 bg-[#43CD66]/20 rounded-lg flex items-center justify-center mr-4">
                <Package className="w-4 h-4 text-[#43CD66]" />
              </div>
              <span className="text-sm">Exclusive Product Access</span>
            </div>
            <div className="flex items-center text-white/90">
              <div className="w-8 h-8 bg-[#43CD66]/20 rounded-lg flex items-center justify-center mr-4">
                <Shield className="w-4 h-4 text-[#43CD66]" />
              </div>
              <span className="text-sm">Verified Seller Network</span>
            </div>
            <div className="flex items-center text-white/90">
              <div className="w-8 h-8 bg-[#43CD66]/20 rounded-lg flex items-center justify-center mr-4">
                <Clock className="w-4 h-4 text-[#43CD66]" />
              </div>
              <span className="text-sm">Fast & Secure Transactions</span>
            </div>
          </motion.div>

          {/* Bottom Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="mt-12 grid grid-cols-3 gap-8 text-center"
          >
            <div>
              <div className="text-2xl font-bold text-[#43CD66]">10K+</div>
              <div className="text-white/60 text-xs">Active Buyers</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[#43CD66]">500+</div>
              <div className="text-white/60 text-xs">Verified Sellers</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[#43CD66]">99%</div>
              <div className="text-white/60 text-xs">Satisfaction Rate</div>
            </div>
          </motion.div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#43CD66]/10 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-white/5 to-transparent rounded-full blur-2xl"></div>
      </div>
    </div>
  );
}

export default function BuyerSignupPage() {
  return (
    <Suspense fallback={
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#43CD66]"></div>
      </div>
    }>
      <BuyerSignupContent />
    </Suspense>
  );
}

