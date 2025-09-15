import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/src/components/ui/button";

export const metadata: Metadata = {
  title: "Wholesale Pallet Liquidation | Verified Pallets From Trusted Sellers",
  description:
    "Find verified wholesale pallet liquidation with clean manifests, trusted sellers, and transparent freight estimates. No surprises, just quality pallets you can actually resell.",
  keywords: [
    "wholesale pallet liquidation",
    "pallet auctions",
    "verified pallets",
    "liquidation sales",
    "bulk pallets",
    "trusted sellers",
    "clean manifests",
    "pallet sourcing",
    "reseller inventory",
  ],
  robots: "index, follow",
  alternates: {
    canonical: "https://www.commercecentral.io/wholesale-pallet-liquidation",
  },
  openGraph: {
    url: "https://www.commercecentral.io/wholesale-pallet-liquidation",
    title:
      "Wholesale Pallet Liquidation | Verified Pallets From Trusted Sellers",
    description:
      "Find verified wholesale pallet liquidation with clean manifests, trusted sellers, and transparent freight estimates. No surprises, just quality pallets you can actually resell.",
    images: [
      {
        url: "/CC_opengraph.png",
        width: 500,
        height: 500,
        alt: "Commerce Central Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Wholesale Pallet Liquidation | Verified Pallets From Trusted Sellers",
    description:
      "Find verified wholesale pallet liquidation with clean manifests, trusted sellers, and transparent freight estimates. No surprises, just quality pallets you can actually resell.",
    images: ["/CC_opengraph.png"],
  },
};

const Page = () => {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-[#102D21] to-[#1A4534] py-20 text-[#43CD66] md:py-28">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-black opacity-40" />
          <div className="h-full w-full bg-[url('/grid-pattern-light.svg')] bg-repeat opacity-10" />
        </div>
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mb-6 text-4xl leading-tight font-bold tracking-tight md:text-5xl lg:text-6xl">
              Tired of Risky Pallet Auctions? Buy Smarter With Commerce Central
            </h1>
            <p className="mx-auto mb-10 max-w-3xl text-xl text-gray-200 md:text-2xl">
              We run verified pallet liquidation sales — with clean manifests,
              trusted sellers, and transparent freight estimates. No surprises.
              Just wholesale pallets for sale you can actually resell.
            </p>
            <Link className="inline-block" href="/marketplace">
              <Button className="h-auto cursor-pointer rounded-full bg-[#43CD66] px-8 py-3 text-lg font-[400] text-black hover:bg-[#3BB959]">
                📦 Explore Verified Pallets
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="bg-gray-50 py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-10 text-3xl font-bold text-gray-900 md:text-4xl">
              The Problem with Most Pallet Auctions
            </h2>

            <p className="mb-8 text-lg text-gray-700">
              If you&apos;ve ever tried to{" "}
              <Link
                className="text-blue-600 no-underline hover:underline"
                href="https://www.commercecentral.io/website/blog/buyer/how-to-buy-apparel-liquidation-deals"
              >
                buy pallets
              </Link>{" "}
              from traditional{" "}
              <Link
                className="text-blue-600 no-underline hover:underline"
                href="https://www.commercecentral.io/online-liquidation-auctions"
              >
                pallet auctions
              </Link>
              , you already know the pain:
            </p>

            <div className="mb-10 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
                <div className="mb-2 flex items-center gap-3">
                  <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-red-100">
                    <svg
                      className="h-4 w-4 text-red-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <title>Problem indicator</title>
                      <path
                        clipRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        fillRule="evenodd"
                      />
                    </svg>
                  </div>
                  <span className="font-medium text-gray-800">
                    No manifest or a confusing one
                  </span>
                </div>
              </div>

              <div className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
                <div className="mb-2 flex items-center gap-3">
                  <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-red-100">
                    <svg
                      className="h-4 w-4 text-red-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <title>Problem indicator</title>
                      <path
                        clipRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        fillRule="evenodd"
                      />
                    </svg>
                  </div>
                  <span className="font-medium text-gray-800">
                    Returns mixed with junk stock
                  </span>
                </div>
              </div>

              <div className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
                <div className="mb-2 flex items-center gap-3">
                  <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-red-100">
                    <svg
                      className="h-4 w-4 text-red-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <title>Problem indicator</title>
                      <path
                        clipRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        fillRule="evenodd"
                      />
                    </svg>
                  </div>
                  <span className="font-medium text-gray-800">
                    Inaccurate quantities
                  </span>
                </div>
              </div>

              <div className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
                <div className="mb-2 flex items-center gap-3">
                  <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-red-100">
                    <svg
                      className="h-4 w-4 text-red-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <title>Problem indicator</title>
                      <path
                        clipRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        fillRule="evenodd"
                      />
                    </svg>
                  </div>
                  <span className="font-medium text-gray-800">
                    Unknown freight charges
                  </span>
                </div>
              </div>

              <div className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm md:col-span-2">
                <div className="mb-2 flex items-center gap-3">
                  <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-red-100">
                    <svg
                      className="h-4 w-4 text-red-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <title>Problem indicator</title>
                      <path
                        clipRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        fillRule="evenodd"
                      />
                    </svg>
                  </div>
                  <span className="font-medium text-gray-800">
                    No accountability when the load arrives
                  </span>
                </div>
              </div>
            </div>

            <p className="mb-6 text-lg text-gray-700">
              And all of it eats into your margins, space, and time.
            </p>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="bg-white py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-8 text-3xl font-bold text-gray-900 md:text-4xl">
              Commerce Central: Pallet Liquidation, Done Right
            </h2>
            <p className="mb-8 text-lg text-gray-700">
              We built Commerce Central to eliminate the guesswork. Whether
              you&apos;re buying one pallet or a truckload, our platform gives
              verified buyers full transparency and control.
            </p>

            <div className="mb-10 rounded-xl bg-gray-50 p-8">
              <h3 className="mb-6 text-2xl font-semibold text-gray-900">
                With Commerce Central&apos;s pallet liquidation wholesale
                listings, you get:
              </h3>

              <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
                    <svg
                      className="h-4 w-4 text-green-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <title>Benefit checkmark</title>
                      <path
                        clipRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        fillRule="evenodd"
                      />
                    </svg>
                  </div>
                  <span className="text-gray-700">
                    Clean, shelf-ready goods (or clearly labeled returns)
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
                    <svg
                      className="h-4 w-4 text-green-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <title>Benefit checkmark</title>
                      <path
                        clipRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        fillRule="evenodd"
                      />
                    </svg>
                  </div>
                  <span className="text-gray-700">
                    Detailed manifests up front
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
                    <svg
                      className="h-4 w-4 text-green-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <title>Benefit checkmark</title>
                      <path
                        clipRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        fillRule="evenodd"
                      />
                    </svg>
                  </div>
                  <span className="text-gray-700">Verified sellers only</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
                    <svg
                      className="h-4 w-4 text-green-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <title>Benefit checkmark</title>
                      <path
                        clipRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        fillRule="evenodd"
                      />
                    </svg>
                  </div>
                  <span className="text-gray-700">
                    Transparent pricing and freight estimates
                  </span>
                </li>
                <li className="flex items-start gap-3 md:col-span-2">
                  <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
                    <svg
                      className="h-4 w-4 text-green-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <title>Benefit checkmark</title>
                      <path
                        clipRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        fillRule="evenodd"
                      />
                    </svg>
                  </div>
                  <span className="text-gray-700">
                    Access to high-performing categories like home, beauty, and
                    electronics
                  </span>
                </li>
              </ul>
            </div>

            <p className="mb-6 text-center text-xl font-medium text-gray-900">
              No more blind buys. Just smarter pallet liquidation sales.
            </p>
          </div>
        </div>
      </section>

      {/* Why Buyers Prefer Section */}
      <section className="bg-gray-50 py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-8 text-3xl font-bold text-gray-900 md:text-4xl">
              Why Buyers Prefer Commerce Central
            </h2>
            <p className="mb-8 text-lg text-gray-700">
              Commerce Central isn&apos;t a broker or warehouse full of mystery
              stock. It&apos;s a verified pallet sourcing platform where serious
              resellers come to grow.
            </p>

            <div className="mb-10 rounded-xl bg-white p-8 shadow-sm">
              <h3 className="mb-6 text-xl font-semibold text-gray-900">
                We host:
              </h3>

              <ul className="space-y-6">
                <li className="flex items-start gap-4">
                  <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#102D21] text-lg font-bold text-white">
                    1
                  </div>
                  <div>
                    <h4 className="mb-1 text-lg font-medium text-gray-900">
                      Weekly pallet auctions
                    </h4>
                    <p className="text-gray-700">
                      With shelf-ready or manifest-return stock
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#102D21] text-lg font-bold text-white">
                    2
                  </div>
                  <div>
                    <h4 className="mb-1 text-lg font-medium text-gray-900">
                      Ongoing wholesale pallets for sale
                    </h4>
                    <p className="text-gray-700">
                      From major brands and distributors
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#102D21] text-lg font-bold text-white">
                    3
                  </div>
                  <div>
                    <h4 className="mb-1 text-lg font-medium text-gray-900">
                      A trusted network of sellers
                    </h4>
                    <p className="text-gray-700">
                      Backed by our buyer protection support
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How to Buy Section */}
      <section className="bg-white py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-12 text-center text-3xl font-bold text-gray-900 md:text-4xl">
              How to Buy Pallets on Commerce Central
            </h2>

            <div className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="rounded-xl bg-gray-50 p-6 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#102D21] text-xl font-bold text-white">
                  1
                </div>
                <h3 className="mb-3 text-xl font-semibold text-gray-900">
                  Sign Up and Get Verified
                </h3>
                <p className="text-gray-700">
                  Join our buyer network — no fees, no games.
                </p>
              </div>

              <div className="rounded-xl bg-gray-50 p-6 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#102D21] text-xl font-bold text-white">
                  2
                </div>
                <h3 className="mb-3 text-xl font-semibold text-gray-900">
                  Browse Verified Pallets
                </h3>
                <p className="text-gray-700">
                  Filter by category, brand, condition, or quantity.
                </p>
              </div>

              <div className="rounded-xl bg-gray-50 p-6 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#102D21] text-xl font-bold text-white">
                  3
                </div>
                <h3 className="mb-3 text-xl font-semibold text-gray-900">
                  Buy or Bid With Confidence
                </h3>
                <p className="text-gray-700">
                  Choose from fixed-price deals or live{" "}
                  <Link
                    className="text-blue-600 no-underline hover:underline"
                    href="https://www.commercecentral.io/wholesale-pallet-liquidation"
                  >
                    pallet auctions
                  </Link>{" "}
                  — both fully transparent.
                </p>
              </div>
            </div>

            <div className="mb-10 rounded-xl bg-gray-50 p-6 text-center">
              <h3 className="mb-2 text-xl font-semibold text-gray-900">
                Freight Calculated Instantly
              </h3>
              <p className="text-gray-700">
                Know your all-in costs before you commit.
              </p>
            </div>

            <div className="text-center">
              <Link className="inline-block" href="/auth/login">
                <Button className="h-auto cursor-pointer rounded-full bg-[#43CD66] px-8 py-3 text-lg font-[400] text-black hover:bg-[#3BB959]">
                  📦 Explore Verified Pallets
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Who It's For Section */}
      <section className="bg-gray-50 py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-8 text-center text-3xl font-bold text-gray-900 md:text-4xl">
              Who It&apos;s For
            </h2>
            <p className="mx-auto mb-12 max-w-2xl text-center text-lg text-gray-700">
              Commerce Central is built for serious buyers who want reliable
              wholesale inventory without the guesswork.
            </p>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <div className="rounded-xl border border-gray-100 bg-white p-8 shadow-sm transition-shadow duration-300 hover:shadow-md">
                <div className="mb-4 flex items-center gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#102D21] text-white">
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <title>Store building icon</title>
                      <path
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Discount Store Owners
                  </h3>
                </div>
                <p className="text-gray-700">
                  Stock your shelves with verified inventory at competitive
                  prices. Perfect for retail arbitrage and local discount
                  stores.
                </p>
              </div>

              <div className="rounded-xl border border-gray-100 bg-white p-8 shadow-sm transition-shadow duration-300 hover:shadow-md">
                <div className="mb-4 flex items-center gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#102D21] text-white">
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <title>Shopping cart icon</title>
                      <path
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Bin & Flea Market Sellers
                  </h3>
                </div>
                <p className="text-gray-700">
                  Source diverse inventory with clear manifests. Ideal for bin
                  stores and market vendors seeking variety and value.
                </p>
              </div>

              <div className="rounded-xl border border-gray-100 bg-white p-8 shadow-sm transition-shadow duration-300 hover:shadow-md">
                <div className="mb-4 flex items-center gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#102D21] text-white">
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <title>Globe icon</title>
                      <path
                        d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Online Resellers
                  </h3>
                </div>
                <p className="text-gray-700">
                  Amazon and eBay sellers can find clean, profitable inventory
                  with detailed condition reports and brand information.
                </p>
              </div>

              <div className="rounded-xl border border-gray-100 bg-white p-8 shadow-sm transition-shadow duration-300 hover:shadow-md">
                <div className="mb-4 flex items-center gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#102D21] text-white">
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <title>Clipboard icon</title>
                      <path
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Regional Wholesalers
                  </h3>
                </div>
                <p className="text-gray-700">
                  Access bulk inventory and truckload quantities with
                  transparent pricing and reliable freight estimates.
                </p>
              </div>

              <div className="rounded-xl border border-gray-100 bg-white p-8 shadow-md transition-shadow duration-300 hover:shadow-lg md:col-span-2">
                <div className="mb-4 flex items-center justify-center gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#43CD66] text-white">
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <title>Lightning bolt icon</title>
                      <path
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                      />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900">
                    Smart Inventory Buyers
                  </h3>
                </div>
                <p className="mx-auto max-w-2xl text-center text-gray-700">
                  Whether you&apos;re just starting out or scaling up, Commerce
                  Central helps you source inventory confidently with verified
                  sellers, clean manifests, and transparent pricing.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ready to Source Section */}
      <section className="bg-white py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="mb-8 text-3xl font-bold text-gray-900 md:text-4xl">
              Ready to Source Smarter?
            </h2>
            <p className="mb-8 text-lg text-gray-700">
              Whether you&apos;re scaling up or just looking for wholesale
              pallets for sale you can trust, Commerce Central gives you the
              tools to source clean inventory, protect your margin, and grow
              faster.
            </p>
            <p className="mb-12 text-lg text-gray-700">
              Commerce Central is a modern sourcing platform offering verified
              pallet{" "}
              <Link
                className="text-blue-600 no-underline hover:underline"
                href="https://www.commercecentral.io/wholesale-liquidation-platform"
              >
                liquidation wholesale
              </Link>{" "}
              opportunities. Browse clean, shelf-ready inventory through curated{" "}
              <Link
                className="text-blue-600 no-underline hover:underline"
                href="https://www.commercecentral.io/online-liquidation-auctions"
              >
                pallet auctions
              </Link>
              , trusted pallet liquidation sales, and exclusive wholesale
              pallets for sale. Whether you&apos;re a reseller, store owner, or
              online seller looking to{" "}
              <Link
                className="text-blue-600 no-underline hover:underline"
                href="https://www.commercecentral.io/website/blog/buyer/how-to-buy-apparel-liquidation-deals"
              >
                buy pallets
              </Link>
              , Commerce Central helps you source smarter—without the risk.
            </p>
            <p className="mb-8 text-xl font-medium text-gray-900">
              👉 Join the smarter pallet buyers at
            </p>
            <Link className="inline-block" href="/auth/login">
              <Button className="h-auto cursor-pointer rounded-full bg-[#43CD66] px-8 py-3 text-lg font-[400] text-black hover:bg-[#3BB959]">
                📦 Explore Verified Pallets
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Page;
