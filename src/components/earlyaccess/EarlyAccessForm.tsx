/// <reference path="../../types/global.d.ts" />
'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { useToast } from '@/src/hooks/use-toast';
// Import Lucide icons
import {
  User,
  Building,
  Mail,
  Phone,
  AlertCircle,
  X,
  Loader2,
} from 'lucide-react'
import { submitEarlyAccessForm } from '@/src/app/earlyaccess/actions'

// Define Zod schema for form validation
const formSchema = z.object({
  firstName: z.string().min(1, { message: 'First name is required' }),
  lastName: z.string().min(1, { message: 'Last name is required' }),
  companyName: z.string().optional(),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  phoneNumber: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (val === undefined || val.trim() === '') return true
        const digitsOnly = val.replace(/\D/g, '')
        return /^\d{10}$/.test(digitsOnly)
      },
      {
        message: 'If provided, phone number must be exactly 10 digits',
      }
    ),
  termsAccepted: z.boolean().refine((value) => value === true, {
    message: 'You must accept the terms and conditions',
  }),
})

// Create type from schema
type FormData = z.infer<typeof formSchema>

export default function EarlyAccessForm() {
  // Define constants for Tailwind CSS class strings
  const welcomeContainerClasses = 'relative flex flex-col justify-center bg-transparent mt-0 md:mt-0 border-none ring-0 px-4 py-5 rounded-2xl md:items-center md:py-8 md:px-6 backdrop-blur-md animate-fade-in-up';
  const earlyAccessBadgeClasses = 'md:block absolute -top-3 md:-top-4 left-1/2 -translate-x-1/2 px-3 md:px-4 py-1 rounded-full bg-gradient-to-r from-[#102d21] to-[#43cd66] text-white text-xs font-semibold shadow-md tracking-wider uppercase z-10';
  const inputBaseClasses = 'block w-full pr-3 py-2 md:py-2.5 text-sm border rounded-lg shadow-xs focus:outline-none focus:ring-[#43CD66] focus:border-[#43CD66] text-gray-900';
  const inputIconClasses = 'h-4 w-4 md:h-5 md:w-5 text-gray-400';
  const labelBaseClasses = 'block font-medium text-gray-700 mb-1';
  const errorTextBaseClasses = 'mt-1 text-red-600';
  const termsCheckboxClasses = 'focus:ring-[#43CD66] h-4 w-4 text-[#43CD66] border-gray-300 rounded';
  const termsLabelSpecificClasses = 'font-medium text-gray-700';
  const termsLinkClasses = 'text-[#43CD66] hover:text-[#102D21]';
  const errorMessageContainerClasses = 'flex items-start gap-3 bg-gradient-to-r from-red-50 to-red-50/70 border-l-4 border-red-500 text-red-800 px-4 py-3 rounded-md shadow-sm mt-3 mb-2 relative overflow-hidden';
  const errorIconContainerClasses = 'relative';
  const errorAlertIconClasses = 'h-4 w-4 md:h-5 md:w-5 text-red-500 mt-0.5 flex-shrink-0 transform transition-all duration-300 ease-in-out';
  const errorTextWrapperClasses = 'flex-1 relative z-10';
  const errorDismissButtonClasses = 'ml-2 text-red-400 hover:text-red-600 focus:outline-none relative z-10 transition-all duration-300 ease-in-out transform hover:scale-110';
  const errorDismissIconClasses = 'h-3 w-3 md:h-4 md:w-4 transition-transform duration-300 hover:rotate-90';
  const submitButtonBaseClasses = 'w-full bg-[#43CD66] hover:bg-[#3ab859] border border-[#1c1e21] hover:border-[#102D21] text-[#1C1E21] font-medium py-3.5 px-6 rounded-full transition-all duration-200 focus:outline-none text-sm text-base flex justify-center items-center';
  const loaderIconClasses = 'animate-spin -ml-1 mr-2 h-3 w-3 md:h-4 md:w-4 text-white';
  const submitButtonTextClasses = 'text-[#1C1E21] text-md md:text-lg';
  const headingClasses = 'text-3xl text-center md:text-4xl mb-2 md:mb-4 font-bold';
  const subheadingContainerClasses = 'text-[#1C1E21] mb-0 text-sm md:text-base';
  const subheadingMobileClasses = 'block text-center md:hidden font-[500]';
  const subheadingMobileUnderlineClasses = 'block md:hidden mx-auto h-1 w-27 md:w-22 bg-[#43CD66] rounded-full mt-1';
  const subheadingDesktopUnderlineClasses = 'hidden md:block h-1 md:w-full bg-[#43CD66] rounded-full mt-1';
  const inputRowClasses = 'flex flex-col md:flex-row gap-3 md:gap-6';
  const inputFieldWrapperClasses = 'w-full md:w-1/2';
  const inputIconWrapperClasses = 'absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none';
  const phonePrefixClasses = 'absolute inset-Y-0 left-9 md:left-10 top-2.5 flex items-center text-[#43CD66] font-medium select-none pointer-events-none text-sm md:text-base';
  const termsLabelWrapperClasses = 'ml-3 mt-0.5 md:mt-0 text-xs md:text-sm';
  const errorMessageShimmerBgClasses = 'absolute inset-0 bg-red-100/40 rounded-r-md';
  const errorMessageTextClasses = 'font-medium text-xs md:text-sm';

  const router = useRouter()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [submissionSucceeded, setSubmissionSucceeded] = useState(false)
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    reset,
    setError,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      companyName: '',
      termsAccepted: false,
    },
  })

  const processForm = async (data: FormData) => {
    setErrorMessage(null)

    const result = await submitEarlyAccessForm(data)

    if (result.success) {
      setSubmissionSucceeded(true)
      toast({
        title: 'Request Sent!',
        description: "We've received your early access application. We'll be in touch soon.",
      })
      // Reddit Pixel SignUp Event Tracking
      if (typeof window !== 'undefined' && typeof window.rdt === 'function') {
        const eventData = {
          fn: data.firstName,
          ln: data.lastName,
          em: data.email,
          ph: data.phoneNumber || '', // Ensure phone is always a string
          company: data.companyName || '', // Ensure company is always a string
          // Add any other relevant fields you collect
        };
        window.rdt('track', 'earlyAccess', eventData);
      }
      reset();
      // Add a small delay to allow the Reddit pixel to fire and toast to be seen before redirecting
      setTimeout(() => {
        router.push('/earlyaccess/thankyou');
      }, 500); // Delay set to 0.5 seconds
    } else {
      setErrorMessage(result.message || 'An unexpected error occurred.')
      setSubmissionSucceeded(false)
    }
  }

  return (
    <div className='mx-auto'>
      {/* Welcome text */}
      <div className='mb-0 md:mb-4'>
        <div
          className={welcomeContainerClasses}
        >
          <span className={earlyAccessBadgeClasses}>
            Early Access
          </span>
          <h2 className={headingClasses}>
            Secure Access to Exclusive Deals
          </h2>
          <div className={subheadingContainerClasses}>
            <span className={subheadingMobileClasses} style={{ fontSize: 'larger' }}>
              This is a highly sought after opportunity.
              <br /> Don&apos;t drop the ball.
            </span>

            <div className={subheadingMobileUnderlineClasses}></div>
            <span className='hidden md:block'>
              This is a highly sought after opportunity. Don&apos;t drop the
              ball.
            </span>
            <div className={subheadingDesktopUnderlineClasses}></div>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(processForm)} className='mobile-card'>
        {/* First Name & Last Name */}
        <div className={inputRowClasses}>
          <div className={inputFieldWrapperClasses}>
            <label
              htmlFor='firstName'
              className={`${labelBaseClasses} text-md`}
            >
              First Name
            </label>
            <div className='relative'>
              <div className={inputIconWrapperClasses}>
                <User className={inputIconClasses} />
              </div>
              <input
                type='text'
                id='firstName'
                {...register('firstName')}
                className={`${inputBaseClasses} pl-9 md:pl-10 ${errors.firstName ? 'border-red-500' : 'border-gray-300'}`}
                placeholder='John'
              />
            </div>
            {errors.firstName && (
              <p className={`${errorTextBaseClasses} text-xs`}>
                {errors.firstName.message}
              </p>
            )}
          </div>
          <div className={inputFieldWrapperClasses}>
            <label
              htmlFor='lastName'
              className={`${labelBaseClasses} text-md`}
            >
              Last Name
            </label>
            <div className='relative'>
              <div className={inputIconWrapperClasses}>
                <User className={inputIconClasses} />
              </div>
              <input
                type='text'
                id='lastName'
                {...register('lastName')}
                className={`${inputBaseClasses} pl-9 md:pl-10 ${errors.lastName ? 'border-red-500' : 'border-gray-300'}`}
                placeholder='Doe'
              />
            </div>
            {errors.lastName && (
              <p className={`${errorTextBaseClasses} text-xs`}>
                {errors.lastName.message}
              </p>
            )}
          </div>
        </div>

        {/* Email & Company Name */}
        <div className={inputRowClasses}>
          <div className={inputFieldWrapperClasses}>
            <label
              htmlFor='email'
              className={`${labelBaseClasses} text-md md:text-sm`}
            >
              Email
            </label>
            <div className='relative'>
              <div className={inputIconWrapperClasses}>
                <Mail className={inputIconClasses} />
              </div>
              <input
                type='email'
                id='email'
                {...register('email')}
                className={`${inputBaseClasses} pl-9 md:pl-10 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                placeholder='you@example.com'
              />
            </div>
            {errors.email && (
              <p className={`${errorTextBaseClasses} text-xs md:text-sm`}>
                {errors.email.message}
              </p>
            )}
          </div>
          <div className={inputFieldWrapperClasses}>
            <label
              htmlFor='companyName'
              className={`${labelBaseClasses} text-md md:text-sm`}
            >
              Company Name (Optional)
            </label>
            <div className='relative'>
              <div className={inputIconWrapperClasses}>
                <Building className={inputIconClasses} />
              </div>
              <input
                type='text'
                id='companyName'
                spellCheck={false}
                {...register('companyName')}
                className={`${inputBaseClasses} pl-9 md:pl-10 ${errors.companyName ? 'border-red-500' : 'border-gray-300'}`}
                placeholder='Your Company LLC'
              />
            </div>
            {errors.companyName && (
              <p className={`${errorTextBaseClasses} text-xs md:text-sm`}>
                {errors.companyName.message}
              </p>
            )}
          </div>
        </div>

        {/* Phone Number */}
        <div>
          <label
            htmlFor='phoneNumber'
            className={`${labelBaseClasses} text-md md:text-sm`}
          >
            Phone number (Optional)
          </label>
          <div className='relative'>
            <div className={inputIconWrapperClasses}>
              <Phone className={inputIconClasses} />
            </div>
            <span className={phonePrefixClasses}>
              +1
            </span>
            <input
              type='tel'
              id='phoneNumber'
              inputMode='tel'
              pattern='^\d{10,15}$'
              maxLength={15}
              {...register('phoneNumber')}
              className={`${inputBaseClasses} pl-14 md:pl-16 ${errors.phoneNumber ? 'border-red-500' : 'border-gray-300'}`}
              placeholder='123 456-7890'
              autoComplete='tel'
            />
          </div>
          {errors.phoneNumber && (
            <p className={`${errorTextBaseClasses} text-xs md:text-sm`}>
              {errors.phoneNumber.message}
            </p>
          )}
        </div>

        {/* Terms Checkbox */}
        <div className='flex items-start' style={{ marginBottom: '10px' }}>
          <div className='flex items-center h-5'>
            <input
              id='termsAccepted'
              type='checkbox'
              {...register('termsAccepted')}
              className={termsCheckboxClasses}
            />
          </div>
          <div className={termsLabelWrapperClasses}>
            <label
              htmlFor='termsAccepted'
              className={termsLabelSpecificClasses}
            >
              I agree to the{' '}
              <Link
                href='/website/legal/terms'
                target='_blank'
                rel='noopener noreferrer'
                className={termsLinkClasses}
              >
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link
                href='/website/legal/privacy-policy'
                target='_blank'
                rel='noopener noreferrer'
                className={termsLinkClasses}
              >
                Privacy Policy
              </Link>
            </label>
            {errors.termsAccepted && (
              <p className={`${errorTextBaseClasses} text-xs md:text-sm font-medium`}>
                {errors.termsAccepted.message}
              </p>
            )}
          </div>
        </div>

        {/* Error message box */}
        {errorMessage && (
          <div
            role='alert'
            className={errorMessageContainerClasses}
            style={{
              animation:
                'slideInFromRight 0.4s ease-out forwards, pulseSubtle 2s ease-in-out infinite',
              transformOrigin: 'center',
            }}
          >
            <div
              className={errorMessageShimmerBgClasses}
              style={{
                animation: 'shimmer 3s infinite',
                backgroundSize: '200% 100%',
                backgroundImage:
                  'linear-gradient(to right, transparent, rgba(255,255,255,0.4), transparent)',
              }}
            />
            <div className={errorIconContainerClasses}>
              <AlertCircle
                className={errorAlertIconClasses}
                style={{ animation: 'pulseIcon 1.5s ease-in-out infinite' }}
                aria-hidden='true'
              />
            </div>
            <div
              className={errorTextWrapperClasses}
              style={{ animation: 'fadeIn 0.6s ease-out' }}
            >
              <span className={errorMessageTextClasses}>
                {errorMessage}
              </span>
            </div>
            <button
              type='button'
              aria-label='Dismiss error'
              className={errorDismissButtonClasses}
              onClick={() => setErrorMessage(null)}
            >
              <X
                className={errorDismissIconClasses}
                aria-hidden='true'
              />
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
            0%,
            100% {
              box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.2);
            }
            50% {
              box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.1);
            }
          }

          @keyframes pulseIcon {
            0%,
            100% {
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
        <div className='pt-3 md:pt-6'>
          <button
            type='submit'
            disabled={!isValid || isSubmitting || submissionSucceeded}
            onClick={() => {
              if (typeof window !== 'undefined' && typeof window.rdt === 'function') {
                window.rdt('track', 'EarlyAccessButtonClick', { buttonName: 'ReserveAccessEarlyAccessForm' });
              }
            }}
            className={`${submitButtonBaseClasses} ${(!isValid || isSubmitting || submissionSucceeded) ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            {(isSubmitting || submissionSucceeded) ? (
              <>
                <Loader2
                  className={loaderIconClasses}
                  aria-hidden='true'
                />
                Processing...
              </>
            ) : (
              <span className={submitButtonTextClasses}>Reserve Access — It's Free & Fast</span>
            )}
          </button>
        </div>
      </form>

      {/* Privacy note - only show on desktop */}
      <div className='mt-0 md:mt-6 text-center text-xs md:text-sm text-gray-600 md:block'>
        Rest assured, your information will be kept in the strictest confidence
        and will only be used to provide information about Commerce Central
        Buyer Membership.
      </div>
      <div className='mt-3 md:mt-6 text-center text-xs md:text-sm text-gray-600'>
        Need help? Email us at{' '}
        <a
          href='mailto:team@commercecentral.io'
          className='font-bold text-[#1C1E21] hover:underline'
        >
          team@commercecentral.io
        </a>
      </div>
    </div>
  )
}
