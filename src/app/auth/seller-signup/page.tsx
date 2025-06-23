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
import { User, Mail, Phone, Loader2, AlertCircle, X, Eye, EyeOff, Briefcase, Building } from 'lucide-react';
import Logo from '@/src/features/website/components/ui/Logo';

// Define Zod schema for form validation - UNIFIED PATTERN to match buyer signup
const sellerSignupSchema = z.object({
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
type SellerSignupFormData = z.infer<typeof sellerSignupSchema>;

function SellerSignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get the redirect URL from query params, but sellers typically go to dashboard
  const redirectTo = searchParams.get('redirect') || '/seller/dashboard';
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    reset,
  } = useForm<SellerSignupFormData>({
    resolver: zodResolver(sellerSignupSchema),
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

  const processForm = async (data: SellerSignupFormData) => {
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
            "custom:userRole": "seller",
            "custom:termsAccepted": data.termsAccepted.toString()
          },
          autoSignIn: {
            enabled: true,
            validateData: true
          }
        }
      });

      console.log('Sign up successful', { isSignUpComplete, userId, nextStep });

      if (nextStep.signUpStep === 'CONFIRM_SIGN_UP') {
        // Go to confirmation page with next step info
        router.push(`/auth/confirm?username=${encodeURIComponent(data.email)}&userType=seller&redirect=${encodeURIComponent(redirectTo)}`);
      } else if (nextStep.signUpStep === 'COMPLETE_AUTO_SIGN_IN' || isSignUpComplete) {
        // Direct to the redirect URL or seller dashboard
        router.push(redirectTo);
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
              Seller Access
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
                    placeholder="Sales Manager"
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

            {errors.termsAccepted && (
              <p className="mt-1 text-xs text-red-600 font-medium">{errors.termsAccepted.message}</p>
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
                  'Create Seller Account'
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

      {/* Right side - Commerce Central Seller Experience */}
      <div className="hidden lg:block w-1/2 bg-gradient-to-br from-[#1C1E21] via-[#102d21] to-[#43cd66] relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          {/* Floating geometric shapes */}
          <motion.div
            animate={{
              y: [0, -20, 0],
              rotate: [0, 5, 0]
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-20 left-16 w-16 h-16 border-2 border-[#43CD66]/30 rounded-xl"
          ></motion.div>

          <motion.div
            animate={{
              y: [0, 15, 0],
              rotate: [0, -3, 0]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
            className="absolute top-40 right-20 w-12 h-12 bg-[#43CD66]/20 rounded-full"
          ></motion.div>

          <motion.div
            animate={{
              y: [0, -10, 0],
              x: [0, 5, 0]
            }}
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
            className="absolute bottom-32 left-12 w-20 h-20 border border-white/10 rounded-lg rotate-45"
          ></motion.div>
        </div>

        {/* Main Content Container */}
        <div className="absolute inset-0 flex flex-col justify-center p-12">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mb-8"
          >
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#43CD66] to-[#3ab859] rounded-xl flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-[#1C1E21]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Commerce Central</h2>
                <p className="text-[#43CD66] text-sm font-medium">Seller Platform</p>
              </div>
            </div>
            <p className="text-white/80 text-lg leading-relaxed">
              Connect with verified buyers, manage inventory seamlessly, and grow your revenue with our comprehensive B2B marketplace.
            </p>
          </motion.div>

          {/* Key Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="grid grid-cols-2 gap-4 mb-8"
          >

            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div className="w-8 h-8 bg-[#43CD66]/20 rounded-lg flex items-center justify-center mb-3">
                <svg className="w-4 h-4 text-[#43CD66]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </div>
              <h4 className="text-white font-semibold text-sm mb-1">Verified Buyers</h4>
              <p className="text-white/60 text-xs">Pre-qualified business customers</p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div className="w-8 h-8 bg-[#43CD66]/20 rounded-lg flex items-center justify-center mb-3">
                <svg className="w-4 h-4 text-[#43CD66]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
                </svg>
              </div>
              <h4 className="text-white font-semibold text-sm mb-1">Order Management</h4>
              <p className="text-white/60 text-xs">Streamlined fulfillment process</p>
            </div>

          </motion.div>

          {/* Success Story */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-md rounded-xl p-6 border border-white/20"
          >
            <div className="flex items-start mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-[#43CD66] to-[#3ab859] rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                <span className="text-[#1C1E21] font-bold text-sm">JM</span>
              </div>
              <div>
                <h5 className="text-white font-semibold text-sm">Jessica Martinez</h5>
                <p className="text-white/60 text-xs">Electronics Wholesaler</p>
              </div>
            </div>
            <p className="text-white/90 text-sm italic leading-relaxed mb-4">
              "Commerce Central transformed my business. I went from struggling to find buyers to having a steady stream of qualified customers. My revenue increased by 60% in just 6 months."
            </p>
            <div className="flex items-center">
              <div className="flex mr-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <motion.svg
                    key={star}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.9 + star * 0.1 }}
                    className="w-4 h-4 text-[#43CD66]"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </motion.svg>
                ))}
              </div>
              <span className="text-white/60 text-xs">Verified Review</span>
            </div>
          </motion.div>

          {/* Bottom CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="mt-8 text-center"
          >
            <div className="inline-flex items-center bg-[#43CD66]/20 rounded-full px-4 py-2 border border-[#43CD66]/30">
              <div className="w-2 h-2 bg-[#43CD66] rounded-full mr-2 animate-pulse"></div>
              <span className="text-[#43CD66] text-sm font-medium">Join 2,500+ successful sellers</span>
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

export default function SellerSignupPage() {
  return (
    <Suspense fallback={
      <div className="fixed inset-0 bg-white/80 backdrop-blur-xs flex items-center justify-center z-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    }>
      <SellerSignupContent />
    </Suspense>
  );
} 