"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

import { easeOut, motion } from "framer-motion";

import Logo from "@/src/features/website/components/ui/Logo";

function SelectUserTypeContent() {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<"buyer" | "seller" | null>(
    null
  );
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get the redirect URL from query params (for returning to product page)
  const redirectTo = searchParams.get("redirect") || "/marketplace";

  const handleNext = () => {
    if (!selectedType) {
      return;
    }

    setIsLoading(true);
    // Pass the redirect URL to the signup pages
    const redirectParam =
      redirectTo !== "/marketplace"
        ? `?redirect=${encodeURIComponent(redirectTo)}`
        : "";
    router.push(`/auth/${selectedType}-signup${redirectParam}`);
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: easeOut },
    },
  };

  return (
    <div className="relative flex min-h-screen bg-white">
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-xs">
          <div className="border-primary h-12 w-12 animate-spin rounded-full border-t-2 border-b-2" />
        </div>
      )}
      <div className="flex w-full flex-col justify-center p-8 md:p-16 lg:w-1/2">
        <div className="mb-8">
          <Logo />
        </div>

        <div className="mb-8">
          <motion.h1
            animate={{ opacity: 1, y: 0 }}
            className="mb-3 bg-gradient-to-r from-[#1C1E21] via-[#102d21] to-[#43cd66] bg-clip-text text-3xl font-bold text-transparent md:text-4xl"
            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Join Commerce Central
          </motion.h1>
          <motion.p
            animate={{ opacity: 1, y: 0 }}
            className="text-lg text-gray-600"
            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.8, delay: 0.3 }}
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
                checked={selectedType === "buyer"}
                className="sr-only"
                id="buyer"
                name="userType"
                onChange={() => setSelectedType("buyer")}
                type="radio"
                value="buyer"
              />
              <label
                className="group flex w-full cursor-pointer items-center justify-between rounded-xl border-2 border-gray-200 bg-white p-6 transition-all duration-200 hover:border-blue-300 hover:bg-blue-50/30"
                htmlFor="buyer"
                style={{
                  borderColor: selectedType === "buyer" ? "#3B82F6" : "",
                  backgroundColor:
                    selectedType === "buyer" ? "rgba(59, 130, 246, 0.1)" : "",
                }}
              >
                <div className="flex items-center space-x-4">
                  {/* Icon */}
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 transition-transform duration-200 group-hover:scale-105">
                    <svg
                      aria-labelledby="buyer-icon-title"
                      className="h-6 w-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <title id="buyer-icon-title">
                        Buyer shopping bag icon
                      </title>
                      <path
                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                      />
                    </svg>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 transition-colors group-hover:text-blue-600">
                      Buyer
                    </h3>
                    <p className="text-sm text-gray-600">
                      Perfect for discovering and purchasing products
                    </p>
                  </div>
                </div>

                {/* Radio Indicator */}
                <div className="ml-4 flex-shrink-0">
                  <div
                    className={`relative h-5 w-5 rounded-full border-2 transition-all duration-200 ${
                      selectedType === "buyer"
                        ? "border-blue-500 bg-blue-500"
                        : "border-gray-300"
                    }`}
                  >
                    {selectedType === "buyer" && (
                      <div className="absolute inset-1 rounded-full bg-white" />
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
                checked={selectedType === "seller"}
                className="sr-only"
                id="seller"
                name="userType"
                onChange={() => setSelectedType("seller")}
                type="radio"
                value="seller"
              />
              <label
                className="group flex w-full cursor-pointer items-center justify-between rounded-xl border-2 border-gray-200 bg-white p-6 transition-all duration-200 hover:border-green-300 hover:bg-green-50/30"
                htmlFor="seller"
                style={{
                  borderColor: selectedType === "seller" ? "#10B981" : "",
                  backgroundColor:
                    selectedType === "seller" ? "rgba(16, 185, 129, 0.1)" : "",
                }}
              >
                <div className="flex items-center space-x-4">
                  {/* Icon */}
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-green-600 transition-transform duration-200 group-hover:scale-105">
                    <svg
                      aria-labelledby="seller-icon-title"
                      className="h-6 w-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <title id="seller-icon-title">
                        Seller growth chart icon
                      </title>
                      <path
                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                      />
                    </svg>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 transition-colors group-hover:text-green-600">
                      Seller
                    </h3>
                    <p className="text-sm text-gray-600">
                      Advanced features for growing your business
                    </p>
                  </div>
                </div>

                {/* Radio Indicator */}
                <div className="ml-4 flex-shrink-0">
                  <div
                    className={`relative h-5 w-5 rounded-full border-2 transition-all duration-200 ${
                      selectedType === "seller"
                        ? "border-green-500 bg-green-500"
                        : "border-gray-300"
                    }`}
                  >
                    {selectedType === "seller" && (
                      <div className="absolute inset-1 rounded-full bg-white" />
                    )}
                  </div>
                </div>
              </label>
            </motion.div>
          </div>
        </motion.div>

        {/* Next Button - Matching other auth pages */}
        <button
          className={`flex w-full items-center justify-center rounded-full bg-gradient-to-r from-[#43CD66] to-[#3ab859] px-6 py-3.5 font-medium text-[#1C1E21] shadow-lg transition-all duration-200 hover:border-[#102D21] hover:from-[#3ab859] hover:to-[#2ea043] hover:shadow-xl focus:outline-none ${
            selectedType && !isLoading
              ? "cursor-pointer bg-blue-600 text-[#1C1E21] shadow-md hover:bg-blue-700 hover:shadow-lg"
              : "text-[#1C1E21]-400 cursor-not-allowed bg-gray-100"
          }`}
          disabled={!selectedType || isLoading}
          onClick={handleNext}
          type="button"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="mr-2 h-5 w-5 animate-spin rounded-full border-t-2 border-b-2 border-white" />
              Setting up...
            </div>
          ) : (
            "Next"
          )}
        </button>
      </div>

      <div className="relative hidden w-1/2 overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-green-900 lg:block">
        {/* Background Pattern */}
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        {/* Main Content */}
        <div className="relative z-10 flex h-full flex-col items-center justify-center p-12">
          {/* Feature Cards */}
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 grid w-full max-w-md grid-cols-1 gap-6"
            initial={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {/* Buyer Features */}
            <div className="rounded-xl border border-white/20 bg-white/10 p-6 backdrop-blur-sm">
              <div className="mb-4 flex items-center">
                <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/20">
                  <svg
                    aria-labelledby="buyer-feature-icon-title"
                    className="h-6 w-6 text-blue-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <title id="buyer-feature-icon-title">
                      Buyer shopping bag
                    </title>
                    <path
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white">For Buyers</h3>
              </div>
              <ul className="space-y-2 text-sm text-white/70">
                <li className="flex items-center">
                  <svg
                    aria-labelledby="checkmark1-title"
                    className="mr-2 h-4 w-4 text-green-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <title id="checkmark1-title">Checkmark</title>
                    <path
                      clipRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      fillRule="evenodd"
                    />
                  </svg>
                  Secure payment protection
                </li>
                <li className="flex items-center">
                  <svg
                    aria-labelledby="checkmark2-title"
                    className="mr-2 h-4 w-4 text-green-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <title id="checkmark2-title">Checkmark</title>
                    <path
                      clipRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      fillRule="evenodd"
                    />
                  </svg>
                  Global marketplace access
                </li>
                <li className="flex items-center">
                  <svg
                    aria-labelledby="checkmark3-title"
                    className="mr-2 h-4 w-4 text-green-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <title id="checkmark3-title">Checkmark</title>
                    <path
                      clipRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      fillRule="evenodd"
                    />
                  </svg>
                  Order tracking & support
                </li>
              </ul>
            </div>

            {/* Seller Features */}
            <div className="rounded-xl border border-white/20 bg-white/10 p-6 backdrop-blur-sm">
              <div className="mb-4 flex items-center">
                <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/20">
                  <svg
                    aria-labelledby="seller-feature-icon-title"
                    className="h-6 w-6 text-green-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <title id="seller-feature-icon-title">
                      Seller growth chart
                    </title>
                    <path
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white">
                  For Sellers
                </h3>
              </div>
              <ul className="space-y-2 text-sm text-white/70">
                <li className="flex items-center">
                  <svg
                    aria-labelledby="checkmark4-title"
                    className="mr-2 h-4 w-4 text-green-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <title id="checkmark4-title">Checkmark</title>
                    <path
                      clipRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      fillRule="evenodd"
                    />
                  </svg>
                  Advanced analytics dashboard
                </li>
                <li className="flex items-center">
                  <svg
                    aria-labelledby="checkmark5-title"
                    className="mr-2 h-4 w-4 text-green-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <title id="checkmark5-title">Checkmark</title>
                    <path
                      clipRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      fillRule="evenodd"
                    />
                  </svg>
                  Inventory management tools
                </li>
                <li className="flex items-center">
                  <svg
                    aria-labelledby="checkmark6-title"
                    className="mr-2 h-4 w-4 text-green-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <title id="checkmark6-title">Checkmark</title>
                    <path
                      clipRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      fillRule="evenodd"
                    />
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
    <Suspense
      fallback={
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-xs">
          <div className="border-primary h-12 w-12 animate-spin rounded-full border-t-2 border-b-2" />
        </div>
      }
    >
      <SelectUserTypeContent />
    </Suspense>
  );
}
