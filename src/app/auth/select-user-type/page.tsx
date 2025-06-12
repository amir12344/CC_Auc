'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Logo from '@/src/features/website/components/ui/Logo';

function SelectUserTypeContent() {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<'buyer' | 'seller' | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get the redirect URL from query params (for returning to product page)
  const redirectTo = searchParams.get('redirect') || '/marketplace';

  const handleNext = () => {
    if (!selectedType) return;

    setIsLoading(true);
    // Pass the redirect URL to the signup pages
    const redirectParam = redirectTo !== '/marketplace' ? `?redirect=${encodeURIComponent(redirectTo)}` : '';
    router.push(`/auth/${selectedType}-signup${redirectParam}`);
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  return (
    <div className="flex min-h-screen bg-white relative">
      {isLoading && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-xs flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      )}
      <div className="w-full lg:w-1/2 flex flex-col p-8 md:p-16 justify-center">
        <div className="mb-8">
          <Logo />
        </div>

        <div className="mb-8">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-3xl md:text-4xl mb-3 font-bold bg-gradient-to-r from-[#1C1E21] via-[#102d21] to-[#43cd66] bg-clip-text text-transparent"
          >
            Join Commerce Central
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-gray-600 text-lg"
          >
            Choose your account type to get started
          </motion.p>
        </div>

        <motion.div className="mb-8" variants={itemVariants}>
          <div className="space-y-4">
            {/* Buyer Option */}
            <motion.div
              className="relative"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <input
                type="radio"
                id="buyer"
                name="userType"
                value="buyer"
                checked={selectedType === 'buyer'}
                onChange={() => setSelectedType('buyer')}
                className="sr-only"
              />
              <label
                htmlFor="buyer"
                className="flex items-center justify-between w-full p-6 bg-white border-2 border-gray-200 rounded-xl cursor-pointer hover:border-blue-300 hover:bg-blue-50/30 transition-all duration-200 group"
                style={{
                  borderColor: selectedType === 'buyer' ? '#3B82F6' : '',
                  backgroundColor: selectedType === 'buyer' ? 'rgba(59, 130, 246, 0.1)' : ''
                }}
              >
                <div className="flex items-center space-x-4">
                  {/* Icon */}
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      Buyer
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Perfect for discovering and purchasing products
                    </p>
                  </div>
                </div>

                {/* Radio Indicator */}
                <div className="flex-shrink-0 ml-4">
                  <div className={`w-5 h-5 border-2 rounded-full relative transition-all duration-200 ${selectedType === 'buyer'
                    ? 'border-blue-500 bg-blue-500'
                    : 'border-gray-300'
                    }`}>
                    {selectedType === 'buyer' && (
                      <div className="absolute inset-1 rounded-full bg-white"></div>
                    )}
                  </div>
                </div>
              </label>
            </motion.div>

            {/* Seller Option */}
            <motion.div
              className="relative"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <input
                type="radio"
                id="seller"
                name="userType"
                value="seller"
                checked={selectedType === 'seller'}
                onChange={() => setSelectedType('seller')}
                className="sr-only"
              />
              <label
                htmlFor="seller"
                className="flex items-center justify-between w-full p-6 bg-white border-2 border-gray-200 rounded-xl cursor-pointer hover:border-green-300 hover:bg-green-50/30 transition-all duration-200 group"
                style={{
                  borderColor: selectedType === 'seller' ? '#10B981' : '',
                  backgroundColor: selectedType === 'seller' ? 'rgba(16, 185, 129, 0.1)' : ''
                }}
              >
                <div className="flex items-center space-x-4">
                  {/* Icon */}
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
                      Seller
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Advanced features for growing your business
                    </p>
                  </div>
                </div>

                {/* Radio Indicator */}
                <div className="flex-shrink-0 ml-4">
                  <div className={`w-5 h-5 border-2 rounded-full relative transition-all duration-200 ${selectedType === 'seller'
                    ? 'border-green-500 bg-green-500'
                    : 'border-gray-300'
                    }`}>
                    {selectedType === 'seller' && (
                      <div className="absolute inset-1 rounded-full bg-white"></div>
                    )}
                  </div>
                </div>
              </label>
            </motion.div>
          </div>
        </motion.div>

        {/* Next Button - Matching other auth pages */}
        <button
          onClick={handleNext}
          disabled={!selectedType || isLoading}
          className={`w-full bg-gradient-to-r from-[#43CD66] to-[#3ab859] hover:from-[#3ab859] hover:to-[#2ea043] hover:border-[#102D21] text-[#1C1E21] font-medium py-3.5 px-6 rounded-full transition-all duration-200 focus:outline-none flex justify-center items-center shadow-lg hover:shadow-xl ${selectedType && !isLoading
            ? 'bg-blue-600 hover:bg-blue-700 text-[#1C1E21] cursor-pointer shadow-md hover:shadow-lg'
            : 'bg-gray-100 text-[#1C1E21]-400 cursor-not-allowed'
            }`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
              Setting up...
            </div>
          ) : (
            'Next'
          )}
        </button>
      </div>

      <div className="hidden lg:block w-1/2 bg-gradient-to-br from-slate-900 via-blue-900 to-green-900 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 opacity-40" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full p-12">
          {/* Feature Cards */}
          <motion.div
            className="grid grid-cols-1 gap-6 w-full max-w-md mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {/* Buyer Features */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <h3 className="text-white font-semibold text-lg">For Buyers</h3>
              </div>
              <ul className="text-white/70 text-sm space-y-2">
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Secure payment protection
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Global marketplace access
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Order tracking & support
                </li>
              </ul>
            </div>

            {/* Seller Features */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h3 className="text-white font-semibold text-lg">For Sellers</h3>
              </div>
              <ul className="text-white/70 text-sm space-y-2">
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Advanced analytics dashboard
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Inventory management tools
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Multi-channel selling
                </li>
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default function SelectUserTypePage() {
  return (
    <Suspense fallback={
      <div className="fixed inset-0 bg-white/80 backdrop-blur-xs flex items-center justify-center z-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    }>
      <SelectUserTypeContent />
    </Suspense>
  );
} 