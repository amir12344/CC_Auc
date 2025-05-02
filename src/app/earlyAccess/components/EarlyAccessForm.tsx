'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { submitEarlyAccessForm } from '../actions';
// Import Lucide icons
import {
  User,
  Building,
  Mail,
  Phone,
  AlertCircle,
  X,
  Loader2
} from 'lucide-react';

// Define Zod schema for form validation
const formSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  companyName: z.string().min(1, { message: "Company name is required" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phoneNumber: z.string()
    .refine((val) => {
      if (!val || val.trim() === "") return true; // allow empty
      const phoneRegex = /^\+?\d{10,15}$/;
      return phoneRegex.test(val.replace(/\D/g, ""));
    }, {
      message: "Please enter a valid phone number (10-15 digits)"
    }),
  termsAccepted: z.boolean().refine(value => value === true, {
    message: "You must accept the terms and conditions"
  })
});

// Create type from schema
type FormData = z.infer<typeof formSchema>;

export default function EarlyAccessForm() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      companyName: '',
      termsAccepted: false
    }
  });

  const processForm = async (data: FormData) => {
    setErrorMessage(null);

    const result = await submitEarlyAccessForm(data);

    if (result.success) {
      reset();
      router.push('/earlyAccess/ThankYou');
    } else {
      setErrorMessage(result.message || 'An unexpected error occurred.');
    }
  };

  return (
    <>
      {/* Welcome text */}
      <div className="mb-10">
        <div className="relative flex flex-col items-center justify-center py-8 px-6 rounded-2xl bg-white/80 ring-1 ring-[#43cd66]/20 backdrop-blur-md animate-fade-in-up">
          <span className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-linear-to-r from-[#102d21] to-[#43cd66] text-white text-xs font-semibold shadow-md tracking-wider uppercase z-10">Early Access</span>
          <h2 className="text-3xl mb-4 tracking-tight" style={{ fontWeight: 800 }}>
            <span className="relative inline-block">
              RESERVE YOUR ACCESS
              <span className="absolute -bottom-1 left-0 w-full h-1 bg-[#43CD66]"></span>
            </span>
          </h2>
          <p className="text-[#1C1E21] mb-2 text-lg font-medium text-center">Loads from the world&apos;s <span className="text-[#102D21] font-semibold">best brands</span> are waiting on the other side.</p>
          <p className="text-[#1C1E21] mb-0 text-base text-center">This is a highly sought after opportunity. Don&apos;t drop the ball.</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(processForm)} className="w-full space-y-6 bg-white/80 px-6 py-8 md:px-8 md:py-10 rounded-2xl shadow-lg ring-1 ring-[#43cd66]/20 backdrop-blur-md">
        <div className="mb-6">
          <h3 className="text-base font-semibold text-[#102D21]">Your Information</h3>
          <div className="h-1 w-16 bg-[#43CD66] rounded-full mt-1"></div>
        </div>

        {/* First Name & Last Name */}
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/2">
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="firstName"
                {...register('firstName')}
                className={`block w-full pl-10 pr-3 py-2.5 border ${errors.firstName ? 'border-red-500' : 'border-gray-300'} rounded-lg shadow-xs focus:outline-none focus:ring-[#43CD66] focus:border-[#43CD66] text-gray-900`}
                placeholder="John"
              />
              {errors.firstName && (
                <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
              )}
            </div>
          </div>
          <div className="w-full md:w-1/2">
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="lastName"
                {...register('lastName')}
                className={`block w-full pl-10 pr-3 py-2.5 border ${errors.lastName ? 'border-red-500' : 'border-gray-300'} rounded-lg shadow-xs focus:outline-none focus:ring-[#43CD66] focus:border-[#43CD66] text-gray-900`}
                placeholder="Doe"
              />
              {errors.lastName && (
                <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Company Name */}
        <div>
          <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Building className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="companyName"
              spellCheck={false}
              {...register('companyName')}
              className={`block w-full pl-10 pr-3 py-2.5 border ${errors.companyName ? 'border-red-500' : 'border-gray-300'} rounded-lg shadow-xs focus:outline-none focus:ring-[#43CD66] focus:border-[#43CD66] text-gray-900`}
              placeholder="Your Company LLC"
            />
            {errors.companyName && (
              <p className="mt-1 text-sm text-red-600">{errors.companyName.message}</p>
            )}
          </div>
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="email"
              id="email"
              {...register('email')}
              className={`block w-full pl-10 pr-3 py-2.5 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg shadow-xs focus:outline-none focus:ring-[#43CD66] focus:border-[#43CD66] text-gray-900`}
              placeholder="you@example.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>
        </div>

        {/* Phone Number */}
        <div>
          <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Phone className="h-5 w-5 text-gray-400" />
            </div>
            <span className="absolute inset-Y-0 left-10 top-3 flex items-center text-gray-500 font-medium select-none pointer-events-none text-base">+1</span>
            <input
              type="tel"
              id="phoneNumber"
              inputMode="tel"
              pattern="^\d{10,15}$"
              maxLength={15}
              {...register('phoneNumber')}
              className={`block w-full pl-16 pr-3 py-2.5 border ${errors.phoneNumber ? 'border-red-500' : 'border-gray-300'} rounded-lg shadow-xs focus:outline-none focus:ring-[#43CD66] focus:border-[#43CD66] text-gray-900`}
              placeholder="123 456-7890"
              autoComplete="tel"
            />
            {errors.phoneNumber && (
              <p className="mt-1 text-sm text-red-600">{errors.phoneNumber.message}</p>
            )}
          </div>
        </div>

        {/* Terms Checkbox */}
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="termsAccepted"
              type="checkbox"
              {...register('termsAccepted')}
              className="focus:ring-[#43CD66] h-4 w-4 text-[#43CD66] border-gray-300 rounded"
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="termsAccepted" className="font-medium text-gray-700">
              I agree to the <Link href="/terms" className="text-[#43CD66] hover:text-[#102D21]">Terms of Service</Link> and <Link href="/privacy" className="text-[#43CD66] hover:text-[#102D21]">Privacy Policy</Link>
            </label>
            {errors.termsAccepted && (
              <p className="mt-1.5 text-sm text-red-600 font-medium">{errors.termsAccepted.message}</p>
            )}
          </div>
        </div>

        {/* Error message box */}
        {errorMessage && (
          <div
            role="alert"
            className="flex items-start gap-3 bg-gradient-to-r from-red-50 to-red-50/70 border-l-4 border-red-500 text-red-800 px-4 py-3 rounded-md shadow-sm mt-3 mb-2 relative overflow-hidden"
            style={{
              animation: 'slideInFromRight 0.4s ease-out forwards, pulseSubtle 2s ease-in-out infinite',
              transformOrigin: 'center'
            }}
          >
            <div
              className="absolute inset-0 bg-red-100/40 rounded-r-md"
              style={{
                animation: 'shimmer 3s infinite',
                backgroundSize: '200% 100%',
                backgroundImage: 'linear-gradient(to right, transparent, rgba(255,255,255,0.4), transparent)'
              }}
            />
            <div className="relative">
              <AlertCircle
                className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0 transform transition-all duration-300 ease-in-out"
                style={{ animation: 'pulseIcon 1.5s ease-in-out infinite' }}
                aria-hidden="true"
              />
            </div>
            <div
              className="flex-1 relative z-10"
              style={{ animation: 'fadeIn 0.6s ease-out' }}
            >
              <span className="font-medium">{errorMessage}</span>
            </div>
            <button
              type="button"
              aria-label="Dismiss error"
              className="ml-2 text-red-400 hover:text-red-600 focus:outline-none relative z-10 transition-all duration-300 ease-in-out transform hover:scale-110"
              onClick={() => setErrorMessage(null)}
            >
              <X className="h-4 w-4 transition-transform duration-300 hover:rotate-90" aria-hidden="true" />
            </button>
          </div>
        )}

        {/* Keyframe animations */}
        <style jsx global>{`
          @keyframes slideInFromRight {
            0% {
              transform: translateX(20px);
              opacity: 0;
            }
            100% {
              transform: translateX(0);
              opacity: 1;
            }
          }

          @keyframes pulseSubtle {
            0%, 100% {
              box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.2);
            }
            50% {
              box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.1);
            }
          }

          @keyframes pulseIcon {
            0%, 100% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.1);
            }
          }

          @keyframes fadeIn {
            0% {
              opacity: 0;
            }
            100% {
              opacity: 1;
            }
          }

          @keyframes shimmer {
            0% {
              background-position: -200% 0;
            }
            100% {
              background-position: 200% 0;
            }
          }
        `}</style>

        {/* Submit Button */}
        <div className="pt-6">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#43CD66] hover:bg-[#3ab859]'} text-white font-medium py-3.5 px-6 rounded-full transition-all duration-200 focus:outline-none text-base flex justify-center items-center`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" aria-hidden="true" />
                Processing...
              </>
            ) : (
              'Reserve Access'
            )}
          </button>
        </div>
      </form>

      {/* Privacy note */}
      <div className="mt-6 text-center text-sm text-gray-600">
        Rest assured, your information will be kept in the strictest confidence and will only be used to provide information about Commerce Central Buyer Membership.
      </div>
      <div className="mt-6 text-center text-sm text-gray-600">
        Need help? Email us at <a href="mailto:team@commercecentral.io" className="font-bold text-[#1C1E21] hover:underline">team@commercecentral.io</a>
      </div>
    </>
  );
}