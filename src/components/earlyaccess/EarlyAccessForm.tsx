'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
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
import { submitEarlyAccessForm } from '@/src/app/earlyaccess/actions';

// Define Zod schema for form validation
const formSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  companyName: z.string().optional(),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phoneNumber: z.string()
    .optional()
    .refine((val) => {
      if (val === undefined || val.trim() === "") return true;
      const digitsOnly = val.replace(/\D/g, "");
      return /^\d{10}$/.test(digitsOnly);
    }, {
      message: "If provided, phone number must be exactly 10 digits"
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
      router.push('/earlyaccess/thankyou');
    } else {
      setErrorMessage(result.message || 'An unexpected error occurred.');
    }
  };

  return (
    <div className='mx-auto'>
      {/* Welcome text */}
      <div className='mb-0 md:mb-4'>
        <div
          className='relative flex flex-col justify-center bg-transparent mt-0 md:mt-4 md:mt-0 border-none ring-0 px-4 py-5 rounded-2xl md:items-center md:py-8 md:px-6 backdrop-blur-md animate-fade-in-up'
        >
          <span className='md:block absolute -top-3 md:-top-4 left-1/2 -translate-x-1/2 px-3 md:px-4 py-1 rounded-full bg-gradient-to-r from-[#102d21] to-[#43cd66] text-white text-xs font-semibold shadow-md tracking-wider uppercase z-10'>
            Early Access
          </span>
          <h2 className='text-3xl text-center md:text-center md:text-5xl mb-2 md:mb-4 font-bold'>
            Secure Access to <br />Exclusive Deals
          </h2>
          <div className='text-[#1C1E21] mb-0 text-sm md:text-base text-center'>
            <span className="block text-start md:hidden font-[500]">
              This is a highly sought after opportunity.<br /> Don&apos;t drop the ball.
            </span>

            <div className='block md:hidden h-1 w-22 md:w-22 bg-[#43CD66] rounded-full mt-1'></div>
            <span className='hidden md:block'>
              This is a highly sought after opportunity. Don&apos;t drop the
              ball.
            </span>
            <div className='hidden md:block h-1 md:w-full bg-[#43CD66] rounded-full mt-1'></div>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(processForm)} className='mobile-card'>
        {/* First Name & Last Name */}
        <div className='flex flex-col md:flex-row gap-3 md:gap-6'>
          <div className='w-full md:w-1/2'>
            <label
              htmlFor='firstName'
              className='block text-md font-medium text-gray-700 mb-1'
            >
              First Name
            </label>
            <div className='relative'>
              <div className='absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none'>
                <User className='h-4 w-4 md:h-5 md:w-5 text-gray-400' />
              </div>
              <input
                type='text'
                id='firstName'
                {...register('firstName')}
                className={`block w-full pl-9 md:pl-10 pr-3 py-2 md:py-2.5 text-sm border ${errors.firstName ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg shadow-xs focus:outline-none focus:ring-[#43CD66] focus:border-[#43CD66] text-gray-900`}
                placeholder='John'
              />
            </div>
            {errors.firstName && (
              <p className='mt-1 text-xs text-red-600'>
                {errors.firstName.message}
              </p>
            )}
          </div>
          <div className='w-full md:w-1/2'>
            <label
              htmlFor='lastName'
              className='block text-md font-medium text-gray-700 mb-1'
            >
              Last Name
            </label>
            <div className='relative'>
              <div className='absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none'>
                <User className='h-4 w-4 md:h-5 md:w-5 text-gray-400' />
              </div>
              <input
                type='text'
                id='lastName'
                {...register('lastName')}
                className={`block w-full pl-9 md:pl-10 pr-3 py-2 md:py-2.5 text-sm border ${errors.lastName ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg shadow-xs focus:outline-none focus:ring-[#43CD66] focus:border-[#43CD66] text-gray-900`}
                placeholder='Doe'
              />
            </div>
            {errors.lastName && (
              <p className='mt-1 text-xs text-red-600'>
                {errors.lastName.message}
              </p>
            )}
          </div>
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor='email'
            className='block text-md md:text-sm font-medium text-gray-700 mb-1'
          >
            Email
          </label>
          <div className='relative'>
            <div className='absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none'>
              <Mail className='h-4 w-4 md:h-5 md:w-5 text-gray-400' />
            </div>
            <input
              type='email'
              id='email'
              {...register('email')}
              className={`block w-full pl-9 md:pl-10 pr-3 py-2 md:py-2.5 text-sm border ${errors.email ? 'border-red-500' : 'border-gray-300'
                } rounded-lg shadow-xs focus:outline-none focus:ring-[#43CD66] focus:border-[#43CD66] text-gray-900`}
              placeholder='you@example.com'
            />
          </div>
          {errors.email && (
            <p className='mt-1 text-xs md:text-sm text-red-600'>
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Company Name */}
        <div>
          <label
            htmlFor='companyName'
            className='block text-md md:text-sm font-medium text-gray-700 mb-1'
          >
            Company Name (Optional)
          </label>
          <div className='relative'>
            <div className='absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none'>
              <Building className='h-4 w-4 md:h-5 md:w-5 text-gray-400' />
            </div>
            <input
              type='text'
              id='companyName'
              spellCheck={false}
              {...register('companyName')}
              className={`block w-full pl-9 md:pl-10 pr-3 py-2 md:py-2.5 text-sm border ${errors.companyName ? 'border-red-500' : 'border-gray-300'
                } rounded-lg shadow-xs focus:outline-none focus:ring-[#43CD66] focus:border-[#43CD66] text-gray-900`}
              placeholder='Your Company LLC'
            />
          </div>
          {errors.companyName && (
            <p className='mt-1 text-xs md:text-sm text-red-600'>
              {errors.companyName.message}
            </p>
          )}
        </div>

        {/* Phone Number */}
        <div>
          <label
            htmlFor='phoneNumber'
            className='block text-md md:text-sm font-medium text-gray-700 mb-1'
          >
            Phone number (Optional)
          </label>
          <div className='relative'>
            <div className='absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none'>
              <Phone className='h-4 w-4 md:h-5 md:w-5 text-gray-400' />
            </div>
            <span className='absolute inset-Y-0 left-9 md:left-10 top-2.5 flex items-center text-[#43CD66] font-medium select-none pointer-events-none text-sm md:text-base'>
              +1
            </span>
            <input
              type='tel'
              id='phoneNumber'
              inputMode='tel'
              pattern='^\d{10,15}$'
              maxLength={15}
              {...register('phoneNumber')}
              className={`block w-full pl-14 md:pl-16 pr-3 py-2 md:py-2.5 text-sm border ${errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                } rounded-lg shadow-xs focus:outline-none focus:ring-[#43CD66] focus:border-[#43CD66] text-gray-900`}
              placeholder='123 456-7890'
              autoComplete='tel'
            />
          </div>
          {errors.phoneNumber && (
            <p className='mt-1 text-xs md:text-sm text-red-600'>
              {errors.phoneNumber.message}
            </p>
          )}
        </div>

        {/* Terms Checkbox */}
        <div className='flex items-start'>
          <div className='flex items-center h-5'>
            <input
              id='termsAccepted'
              type='checkbox'
              {...register('termsAccepted')}
              className='focus:ring-[#43CD66] h-4 w-4 text-[#43CD66] border-gray-300 rounded'
            />
          </div>
          <div className='ml-3 text-xs md:text-sm'>
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
              <p className='mt-1 text-xs md:text-sm text-red-600 font-medium'>
                {errors.termsAccepted.message}
              </p>
            )}
          </div>
        </div>

        {/* Error message box */}
        {errorMessage && (
          <div
            role='alert'
            className='flex items-start gap-3 bg-gradient-to-r from-red-50 to-red-50/70 border-l-4 border-red-500 text-red-800 px-4 py-3 rounded-md shadow-sm mt-3 mb-2 relative overflow-hidden'
            style={{
              animation:
                'slideInFromRight 0.4s ease-out forwards, pulseSubtle 2s ease-in-out infinite',
              transformOrigin: 'center',
            }}
          >
            <div
              className='absolute inset-0 bg-red-100/40 rounded-r-md'
              style={{
                animation: 'shimmer 3s infinite',
                backgroundSize: '200% 100%',
                backgroundImage:
                  'linear-gradient(to right, transparent, rgba(255,255,255,0.4), transparent)',
              }}
            />
            <div className='relative'>
              <AlertCircle
                className='h-4 w-4 md:h-5 md:w-5 text-red-500 mt-0.5 flex-shrink-0 transform transition-all duration-300 ease-in-out'
                style={{ animation: 'pulseIcon 1.5s ease-in-out infinite' }}
                aria-hidden='true'
              />
            </div>
            <div
              className='flex-1 relative z-10'
              style={{ animation: 'fadeIn 0.6s ease-out' }}
            >
              <span className='font-medium text-xs md:text-sm'>
                {errorMessage}
              </span>
            </div>
            <button
              type='button'
              aria-label='Dismiss error'
              className='ml-2 text-red-400 hover:text-red-600 focus:outline-none relative z-10 transition-all duration-300 ease-in-out transform hover:scale-110'
              onClick={() => setErrorMessage(null)}
            >
              <X
                className='h-3 w-3 md:h-4 md:w-4 transition-transform duration-300 hover:rotate-90'
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
            disabled={isSubmitting}
            className={`w-full ${isSubmitting
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-[#43CD66] hover:bg-[#3ab859]'
              } text-white cursor-pointer font-medium py-2.5 md:py-3.5 px-6 rounded-full transition-all duration-200 focus:outline-none text-sm md:text-base flex justify-center items-center`}
          >
            {isSubmitting ? (
              <>
                <Loader2
                  className='animate-spin -ml-1 mr-2 h-3 w-3 md:h-4 md:w-4 text-white'
                  aria-hidden='true'
                />
                Processing...
              </>
            ) : (
              'Reserve Access'
            )}
          </button>
        </div>
      </form>

      {/* Privacy note - only show on desktop */}
      <div className='mt-6 text-center text-xs md:text-sm text-gray-600 md:block'>
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