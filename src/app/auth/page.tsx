'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function AuthPage() {
  const [selectedOption, setSelectedOption] = useState<'buy' | 'sell' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Prefetch destinations for faster navigation
  useEffect(() => {
    router.prefetch('/auth/buyer-signup');
    router.prefetch('/auth/seller-signup');
    router.prefetch('/auth/login');
  }, [router]);

  const handleOptionSelect = (option: 'buy' | 'sell') => {
    setSelectedOption(option);
    setError(null); // Clear any error when an option is selected
  };

  const handleNextClick = () => {
    if (selectedOption === 'buy') {
      setIsLoading(true);
      router.push('/auth/buyer-signup');
    } else if (selectedOption === 'sell') {
      setIsLoading(true);
      router.push('/auth/seller-signup');
    } else {
      setError('Please select an option.');
    }
  };

  const handleLoginRedirect = () => {
    setIsLoading(true);
    router.push('/auth/login');
  };

  return (
    <div className="flex min-h-screen bg-white relative">
      {/* Loading overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-xs flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      )}

      {/* Left side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col p-8 md:p-16 justify-center">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center">
            <svg width="40" height="40" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <circle cx="15" cy="15" r="7" fill="#202328" />
              <circle cx="30" cy="20" r="5" fill="#202328" opacity="0.8" />
              <circle cx="20" cy="30" r="9" fill="#202328" opacity="0.6" />
              <path d="M15 15L30 20M30 20L20 30" stroke="#202328" strokeWidth="2" />
            </svg>
            <span className="ml-2 text-xl font-bold text-[#202328] font-geist">
              <span className="text-primary">Commerce</span> Central
            </span>
          </Link>
        </div>

        <h1 className="text-3xl font-[600] text-[#1C1E21] mb-6">Welcome To Commerce Central</h1>
        <p className="mb-8 text-[#1C1E21]">What would you like to do on our platform?</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Buy Option */}
          <div
            onClick={() => handleOptionSelect('buy')}
            className={`cursor-pointer ${selectedOption === 'buy' ? 'border-2 border-[#43CD66]' : 'border border-[#43CD66]-200'} rounded-lg transition-all duration-300`}
          >
            <div className="p-[70px] h-full">
              <div className="flex items-center mb-4">
                <svg className="w-8 h-8 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                <h2 className="text-xl font-[500]">Buy</h2>
              </div>
              <p className="text-[#1C1E21] text-[500]">Get access to the best brands at the best prices.</p>
            </div>
          </div>

          {/* Sell Option */}
          <div
            onClick={() => handleOptionSelect('sell')}
            className={`cursor-pointer ${selectedOption === 'sell' ? 'border-2 border-[#43CD66]' : 'border border-gray-200'} rounded-lg transition-all duration-300`}
          >
            <div className="p-[70px] h-full">
              <div className="flex items-center mb-4">
                <svg className="w-8 h-8 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                </svg>
                <h2 className="text-xl font-[500]">Sell</h2>
              </div>
              <p className="text-[500] text-[#1C1E21]">Get cash for your surplus products quickly, conveniently, and discreetly.</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 text-red-500">
            {error}
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-between sm:items-center">
          <button
            onClick={handleLoginRedirect}
            className="px-6 text-[#43CD66] py-2 mb-3 sm:mb-0 text-blue-600 underline hover:text-blue-800 transition-all duration-200"
          >
            Already have an account? Login
          </button>

          <button
            onClick={handleNextClick}
            className="px-6 py-2 rounded-full bg-[#43CD66] text-white font-medium hover:bg-[#102D21] transition-all duration-200"
          >
            Next
          </button>
        </div>

        <div className="mt-6 text-center text-sm text-gray-600">
          Need help? Email us at <a href="mailto:team@commerce-central.com" className="font-bold text-[#1C1E21] hover:underline">team@commerce-central.com</a>
        </div>
      </div>

      {/* Right side - Image/Testimonial */}
      <div className="hidden lg:block w-1/2 bg-black relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full h-full">
            <div className="absolute inset-0 bg-linear-to-br from-black via-transparent to-black opacity-50"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <motion.div
                className="w-64 h-64 rounded-full"
                animate={{
                  rotateZ: 360,
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear"
                }}
              >
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-purple-500 rounded-full blur-md"></div>
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-blue-500 rounded-full blur-md"></div>
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-16 h-16 bg-cyan-500 rounded-full blur-md"></div>
                <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-16 h-16 bg-indigo-500 rounded-full blur-md"></div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Testimonial */}
        <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 w-4/5 bg-black/80 backdrop-blur-xs p-6 rounded-lg shadow-lg">
          <p className="text-white italic mb-4">&quot;Ghost is the most impactful surplus disrupter I&apos;ve seen in my 25 years in business. I view them as an extension of my business.&quot;</p>
          <div className="flex justify-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg key={star} className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

