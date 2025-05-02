'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Prefetch destinations for faster navigation
  useEffect(() => {
    router.prefetch('/auth');
    router.prefetch('/auth/forgot-password');
    router.prefetch('/dashboard');
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate login process
    setTimeout(() => {
      router.push('/dashboard');
    }, 100);
  };

  const handleAuthRedirect = () => {
    setIsLoading(true);
    router.push('/auth');
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

        <h1 className="text-3xl font-[500] mb-6">Welcome back to Commerce Central</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-md focus:outline-hidden focus:ring-1 focus:ring-black/20 focus:border-black"
              required
            />
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="password" className="block text-sm font-medium">Password</label>
              <button
                type="button"
                onClick={() => {
                  setIsLoading(true);
                  router.push('/auth/forgot-password');
                }}
                className="text-sm text-blue-600 hover:underline"
              >
                Forgot password?
              </button>
            </div>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-md focus:outline-hidden focus:ring-1 focus:ring-black/20 focus:border-black"
              required
            />
          </div>

          {/* Remember Me */}
          <div className="flex items-center">
            <input
              id="rememberMe"
              name="rememberMe"
              type="checkbox"
              checked={formData.rememberMe}
              onChange={handleChange}
              className="h-4 w-4 border-gray-300 rounded focus:ring-black"
            />
            <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
              Remember me
            </label>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full px-6 py-3 rounded-full bg-black text-white font-medium hover:bg-gray-800 transition-all duration-200"
            >
              Login
            </button>
          </div>

          <div className="text-center">
            <span className="text-sm">Don&apos;t have an account? </span>
            <button
              type="button"
              onClick={handleAuthRedirect}
              className="text-sm text-blue-600 hover:underline"
            >
              Sign up
            </button>
          </div>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          Need help? Email us at <a href="mailto:team@commerce-central.com" className="text-blue-600 hover:underline">team@commerce-central.com</a>
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
          <p className="text-white italic mb-4">&quot;Commerce Central has transformed how I manage my inventory. The platform&apos;s ease of use and dedicated support team make it a game-changer.&quot;</p>
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

