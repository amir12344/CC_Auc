import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/src/components/ui/button";

export const metadata: Metadata = {
  title: "Online Liquidation Auctions | Bid & Save on Bulk Lots",
  description:
    "Join top online liquidation auctions. Bid on bulk lots and save big on inventory for your business. Trusted auction platform for resellers.",
  keywords: [
    "online liquidation auctions",
    "bulk lots",
    "auction platform",
    "inventory auctions",
    "reseller deals",
    "wholesale auctions",
    "liquidation sales",
    "verified sellers",
    "clean inventory",
  ],
  robots: "index, follow",
  alternates: {
    canonical: "https://www.commercecentral.io/online-liquidation-auctions",
  },
  openGraph: {
    url: "https://www.commercecentral.io/online-liquidation-auctions",
    title: "Online Liquidation Auctions | Bid & Save on Bulk Lots",
    description:
      "Join top online liquidation auctions. Bid on bulk lots and save big on inventory for your business. Trusted auction platform for resellers.",
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
    title: "Online Liquidation Auctions | Bid & Save on Bulk Lots",
    description:
      "Join top online liquidation auctions. Bid on bulk lots and save big on inventory for your business. Trusted auction platform for resellers.",
    images: ["/CC_opengraph.png"],
  },
};

const Page = () => {
  return (
    <>
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
                The Online Liquidation Auction Platform Built for Buyers
              </h1>
              <p className="mx-auto mb-10 max-w-3xl text-xl text-gray-200 md:text-2xl">
                Commerce Central runs clean, transparent auctions and
                liquidations no junk, no mystery pallets, no broker games. Just
                verified returns and{" "}
                <Link
                  className="text-[#43CD66] hover:underline"
                  href="https://www.commercecentral.io/website/blog/buyer/how-to-avoid-getting-burned-buying-liquidation-inventory"
                >
                  excess inventory
                </Link>{" "}
                you can actually resell.
              </p>
              <Link className="inline-block" href="/auth/login">
                <Button className="h-auto cursor-pointer rounded-full bg-[#43CD66] px-8 py-3 text-lg font-[400] text-black hover:bg-[#3BB959]">
                  🔍 Browse smarter auctions now
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Introduction Section */}
        <section className="bg-gray-50 py-16 md:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl">
              <h2 className="mb-8 text-center text-3xl font-bold text-gray-900 md:text-4xl">
                Smarter Liquidation Auctions, Powered by Commerce Central
              </h2>
              <div className="space-y-6 text-lg text-gray-700">
                <p>
                  Commerce Central is where serious buyers go for smarter online
                  liquidation auctions. We connect verified businesses to
                  shelf-ready inventory from trusted brands, all via curated
                  returns auctions and liquidation auction events built for
                  speed, control, and transparency.
                </p>
                <p>
                  Whether you&apos;re new to auctions and liquidations or just
                  tired of the mystery-box approach, Commerce Central is
                  changing how inventory gets resold.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Problem Section */}
        <section className="bg-white py-16 md:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl">
              <h2 className="mb-8 text-3xl font-bold text-gray-900 md:text-4xl">
                Why Commerce Central?
              </h2>
              <p className="mb-8 text-xl text-gray-700">
                Most liquidation auction sites leave you guessing.
              </p>

              <div className="mb-10 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-lg bg-gray-50 p-6">
                  <div className="mb-2 flex items-center gap-3">
                    <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-red-100">
                      <span className="font-bold text-red-600">❌</span>
                    </div>
                    <span className="font-medium text-gray-800">
                      No condition details
                    </span>
                  </div>
                </div>

                <div className="rounded-lg bg-gray-50 p-6">
                  <div className="mb-2 flex items-center gap-3">
                    <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-red-100">
                      <span className="font-bold text-red-600">❌</span>
                    </div>
                    <span className="font-medium text-gray-800">
                      No manifests or images
                    </span>
                  </div>
                </div>

                <div className="rounded-lg bg-gray-50 p-6">
                  <div className="mb-2 flex items-center gap-3">
                    <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-red-100">
                      <span className="font-bold text-red-600">❌</span>
                    </div>
                    <span className="font-medium text-gray-800">
                      Bidding games that inflate costs
                    </span>
                  </div>
                </div>

                <div className="rounded-lg bg-gray-50 p-6">
                  <div className="mb-2 flex items-center gap-3">
                    <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-red-100">
                      <span className="font-bold text-red-600">❌</span>
                    </div>
                    <span className="font-medium text-gray-800">
                      Surprise fees and freight confusion
                    </span>
                  </div>
                </div>
              </div>

              <p className="mb-8 text-lg text-gray-700">
                And worst of all? Truckloads of unsellable goods that don&apos;t
                match the listing.
              </p>

              <p className="text-xl font-medium text-gray-900">
                Commerce Central eliminates the risk. We&apos;ve rebuilt the
                liquidation auction experience from the ground up to prioritize
                you—the buyer.
              </p>
            </div>
          </div>
        </section>

        {/* Solution Section */}
        <section className="bg-gray-50 py-16 md:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl">
              <h2 className="mb-8 text-3xl font-bold text-gray-900 md:text-4xl">
                A Better Way to Run Auctions and Liquidations
              </h2>
              <p className="mb-8 text-lg text-gray-700">
                Commerce Central isn&apos;t a marketplace free-for-all.
                It&apos;s a controlled, buyer-first{" "}
                <Link
                  className="text-blue-600 hover:text-blue-800"
                  href="https://www.commercecentral.io/wholesale-liquidation-platform"
                >
                  wholesale liquidation platform
                </Link>
                .
              </p>

              <div className="mb-10 rounded-xl bg-white p-8 shadow-sm">
                <h3 className="mb-6 text-2xl font-semibold text-gray-900">
                  Our returns auctions give you:
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
                        <title>Checkmark icon</title>
                        <path
                          clipRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          fillRule="evenodd"
                        />
                      </svg>
                    </div>
                    <span className="text-gray-700">
                      Verified inventory from real brands and authorized
                      distributors
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
                        <title>Checkmark icon</title>
                        <path
                          clipRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          fillRule="evenodd"
                        />
                      </svg>
                    </div>
                    <span className="text-gray-700">
                      Full manifests with condition tags
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
                        <title>Checkmark icon</title>
                        <path
                          clipRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          fillRule="evenodd"
                        />
                      </svg>
                    </div>
                    <span className="text-gray-700">
                      Shelf-ready loads or clearly labeled return stock
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
                        <title>Checkmark icon</title>
                        <path
                          clipRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          fillRule="evenodd"
                        />
                      </svg>
                    </div>
                    <span className="text-gray-700">
                      Pre-bid freight estimates
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
                        <title>Checkmark icon</title>
                        <path
                          clipRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          fillRule="evenodd"
                        />
                      </svg>
                    </div>
                    <span className="text-gray-700">
                      Transparent pricing — no proxy bidding, no hidden markups
                    </span>
                  </li>
                </ul>
              </div>

              <p className="text-center text-xl font-medium text-gray-900">
                We run online liquidation auctions that respect your time and
                protect your profit.
              </p>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="bg-white py-16 md:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl">
              <h2 className="mb-8 text-3xl font-bold text-gray-900 md:text-4xl">
                Why Buyers Use Commerce Central Auctions
              </h2>
              <p className="mb-8 text-lg text-gray-700">
                When you source through Commerce Central&apos;s auctions and
                liquidations, you gain:
              </p>

              <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="rounded-xl bg-gray-50 p-6">
                  <div className="mb-2 flex items-center gap-3">
                    <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
                      <span className="font-bold text-green-600">✅</span>
                    </div>
                    <span className="font-medium text-gray-800">
                      The ability to set your price
                    </span>
                  </div>
                </div>

                <div className="rounded-xl bg-gray-50 p-6">
                  <div className="mb-2 flex items-center gap-3">
                    <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
                      <span className="font-bold text-green-600">✅</span>
                    </div>
                    <span className="font-medium text-gray-800">
                      Access to partial lots or full truckload liquidation
                    </span>
                  </div>
                </div>

                <div className="rounded-xl bg-gray-50 p-6">
                  <div className="mb-2 flex items-center gap-3">
                    <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
                      <span className="font-bold text-green-600">✅</span>
                    </div>
                    <span className="font-medium text-gray-800">
                      Real-time condition and seller info
                    </span>
                  </div>
                </div>

                <div className="rounded-xl bg-gray-50 p-6">
                  <div className="mb-2 flex items-center gap-3">
                    <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
                      <span className="font-bold text-green-600">✅</span>
                    </div>
                    <span className="font-medium text-gray-800">
                      New inventory drops weekly
                    </span>
                  </div>
                </div>

                <div className="rounded-xl bg-gray-50 p-6 md:col-span-2">
                  <div className="mb-2 flex items-center gap-3">
                    <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
                      <span className="font-bold text-green-600">✅</span>
                    </div>
                    <span className="font-medium text-gray-800">
                      A clear edge over other liquidation platforms
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-center text-xl font-medium text-gray-900">
                Because when the load is clean and the terms are clear, you
                win—not the broker.
              </p>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-gray-50 via-gray-50 to-gray-100 py-20 md:py-28">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 h-96 w-96 translate-x-1/3 -translate-y-1/3 transform rounded-full bg-[#43CD66] opacity-5" />
          <div className="absolute bottom-0 left-0 h-96 w-96 -translate-x-1/3 translate-y-1/3 transform rounded-full bg-[#102D21] opacity-5" />
          <div className="max-h-6xl absolute top-1/2 left-1/2 h-full w-full max-w-6xl -translate-x-1/2 -translate-y-1/2 transform rounded-full bg-gradient-to-r from-[#43CD66] via-transparent to-[#102D21] opacity-5 blur-3xl" />

          <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-5xl">
              <div className="mb-20 text-center">
                <div className="mb-4 inline-block rounded-full bg-green-50 p-2">
                  <div className="rounded-full bg-green-100 px-6 py-2">
                    <span className="font-medium text-[#102D21]">
                      Simple & Transparent
                    </span>
                  </div>
                </div>

                <h2 className="relative mb-6 inline-block text-3xl font-bold text-gray-900 md:text-5xl">
                  How Our Liquidation Auctions Work
                  <div className="absolute -bottom-4 left-1/2 h-1.5 w-32 -translate-x-1/2 transform rounded-full bg-gradient-to-r from-transparent via-[#43CD66] to-transparent" />
                </h2>

                <p className="mx-auto mt-8 max-w-3xl text-xl text-gray-700">
                  A simple four-step process designed with buyers in mind
                </p>
              </div>

              <div className="relative mb-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                {/* Connection line for desktop */}
                <div className="absolute top-24 right-[15%] left-[15%] z-0 hidden h-1 bg-gradient-to-r from-[#102D21] via-[#43CD66] to-[#102D21] opacity-30 lg:block" />

                {/* Step 1 */}
                <div className="group">
                  <div className="relative z-10 flex h-full transform flex-col rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-lg transition-all duration-300 group-hover:-translate-y-2 hover:shadow-xl">
                    <div className="relative mx-auto mb-8">
                      <div className="absolute inset-0 scale-150 rounded-full bg-green-200 opacity-20 transition-transform duration-300 group-hover:scale-125" />
                      <div className="relative z-10 mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#102D21] to-[#1A4534] text-2xl font-bold text-white ring-8 ring-white">
                        1
                      </div>
                    </div>
                    <h3 className="mb-4 text-2xl font-semibold text-gray-900">
                      Join the Buyer Network
                    </h3>
                    <p className="flex-grow text-gray-700">
                      Sign up and get verified in minutes.
                    </p>
                    <div className="mx-auto mt-6 h-1 w-12 rounded-full bg-[#43CD66] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  </div>
                </div>

                {/* Step 2 */}
                <div className="group">
                  <div className="relative z-10 flex h-full transform flex-col rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-lg transition-all duration-300 group-hover:-translate-y-2 hover:shadow-xl">
                    <div className="relative mx-auto mb-8">
                      <div className="absolute inset-0 scale-150 rounded-full bg-green-200 opacity-20 transition-transform duration-300 group-hover:scale-125" />
                      <div className="relative z-10 mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#102D21] to-[#1A4534] text-2xl font-bold text-white ring-8 ring-white">
                        2
                      </div>
                    </div>
                    <h3 className="mb-4 text-2xl font-semibold text-gray-900">
                      Browse Active Auctions
                    </h3>
                    <p className="flex-grow text-gray-700">
                      Filter by category, load size, or condition — every
                      liquidation auction is clearly marked.
                    </p>
                    <div className="mx-auto mt-6 h-1 w-12 rounded-full bg-[#43CD66] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  </div>
                </div>

                {/* Step 3 */}
                <div className="group">
                  <div className="relative z-10 flex h-full transform flex-col rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-lg transition-all duration-300 group-hover:-translate-y-2 hover:shadow-xl">
                    <div className="relative mx-auto mb-8">
                      <div className="absolute inset-0 scale-150 rounded-full bg-green-200 opacity-20 transition-transform duration-300 group-hover:scale-125" />
                      <div className="relative z-10 mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#102D21] to-[#1A4534] text-2xl font-bold text-white ring-8 ring-white">
                        3
                      </div>
                    </div>
                    <h3 className="mb-4 text-2xl font-semibold text-gray-900">
                      Place Your Bid
                    </h3>
                    <p className="flex-grow text-gray-700">
                      No surprises. No proxy games. What you bid is what you
                      pay.
                    </p>
                    <div className="mx-auto mt-6 h-1 w-12 rounded-full bg-[#43CD66] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  </div>
                </div>

                {/* Step 4 */}
                <div className="group">
                  <div className="relative z-10 flex h-full transform flex-col rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-lg transition-all duration-300 group-hover:-translate-y-2 hover:shadow-xl">
                    <div className="relative mx-auto mb-8">
                      <div className="absolute inset-0 scale-150 rounded-full bg-green-200 opacity-20 transition-transform duration-300 group-hover:scale-125" />
                      <div className="relative z-10 mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#102D21] to-[#1A4534] text-2xl font-bold text-white ring-8 ring-white">
                        4
                      </div>
                    </div>
                    <h3 className="mb-4 text-2xl font-semibold text-gray-900">
                      Win & Ship Fast
                    </h3>
                    <p className="flex-grow text-gray-700">
                      Our team coordinates freight so you can focus on selling.
                    </p>
                    <div className="mx-auto mt-6 h-1 w-12 rounded-full bg-[#43CD66] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section className="relative overflow-hidden bg-white py-16 md:py-24">
          <div className="absolute top-0 left-0 h-64 w-full bg-gradient-to-b from-gray-50 to-white opacity-70" />
          <div className="absolute -right-24 -bottom-24 h-96 w-96 rounded-full bg-[#43CD66] opacity-5" />
          <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-[#102D21] opacity-5" />

          <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl text-center">
              <div className="mb-6 inline-block rounded-full bg-green-50 p-2">
                <div className="rounded-full bg-green-100 px-4 py-1">
                  <span className="font-medium text-[#102D21]">
                    Trusted by resellers nationwide
                  </span>
                </div>
              </div>

              <h2 className="mb-8 text-4xl font-bold text-gray-900 md:text-4xl">
                Not Your Typical Online Liquidation Auction Site
              </h2>
              <p className="mb-8 text-lg text-gray-700">
                Most online liquidation auctions are built to protect sellers,
                not buyers.
              </p>
              <p className="mb-10 text-xl text-gray-900">
                Commerce Central is different:
              </p>

              <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="transform rounded-xl bg-gradient-to-br from-white to-gray-50 p-8 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
                      <span className="font-bold text-green-600">✅</span>
                    </div>
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-gray-900">
                    Verified Sellers
                  </h3>
                  <p className="text-gray-700">
                    Every seller is thoroughly vetted before they can list
                    inventory
                  </p>
                </div>

                <div className="transform rounded-xl bg-gradient-to-br from-white to-gray-50 p-8 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
                      <span className="font-bold text-green-600">✅</span>
                    </div>
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-gray-900">
                    Accurate Listings
                  </h3>
                  <p className="text-gray-700">
                    Every listing is accurate with detailed manifests and
                    condition reports
                  </p>
                </div>

                <div className="transform rounded-xl bg-gradient-to-br from-white to-gray-50 p-8 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
                      <span className="font-bold text-green-600">✅</span>
                    </div>
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-gray-900">
                    Transparent Returns
                  </h3>
                  <p className="text-gray-700">
                    Every return is flagged up front so you know exactly what
                    you&apos;re buying
                  </p>
                </div>
              </div>

              <p className="mb-8 inline-block rounded-lg bg-green-50 px-4 py-3 text-xl font-medium text-gray-900">
                We run auctions the way liquidation should have worked all
                along.
              </p>
            </div>
          </div>
        </section>

        {/* Ready to Source Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-gray-50 to-gray-100 py-16 md:py-24">
          <div className="absolute top-0 right-0 h-64 w-64 translate-x-1/4 -translate-y-1/4 transform rounded-full bg-[#43CD66] opacity-5" />
          <div className="absolute bottom-0 left-0 h-64 w-64 -translate-x-1/4 translate-y-1/4 transform rounded-full bg-[#102D21] opacity-5" />

          <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl">
              <div className="overflow-hidden rounded-2xl bg-white shadow-xl">
                <div className="p-8 md:p-12">
                  <div className="mb-10 text-center">
                    <div className="mb-4 inline-block rounded-full bg-green-50 p-2">
                      <div className="rounded-full bg-green-100 px-4 py-1">
                        <span className="font-medium text-[#102D21]">
                          Join our buyer network
                        </span>
                      </div>
                    </div>
                    <h2 className="mb-6 text-3xl font-bold text-gray-900 md:text-4xl">
                      Ready to Source Smarter?
                    </h2>
                    <div className="mx-auto mb-6 h-1 w-24 rounded-full bg-[#43CD66]" />
                    <p className="mb-8 text-lg text-gray-700">
                      If you&apos;re tired of high-risk platforms and
                      low-quality inventory, Commerce Central is the online
                      liquidation auction built for your business.
                    </p>
                  </div>

                  <div className="mb-10 rounded-xl bg-gray-50 p-6">
                    <p className="text-lg text-gray-700">
                      Commerce Central is a trusted platform for auctions and
                      liquidations, offering verified shelf pulls,{" "}
                      <Link
                        className="text-blue-600 underline hover:text-blue-800"
                        href="https://www.commercecentral.io/website/blog/buyer/how-to-avoid-getting-burned-buying-liquidation-inventory"
                      >
                        excess inventory
                      </Link>
                      , and returns from top-tier brands. Through curated
                      liquidation auctions, organized returns auctions, and
                      transparent online liquidation auctions, we help resellers
                      and retailers buy smarter. Whether you&apos;re{" "}
                      <Link
                        className="text-blue-600 underline hover:text-blue-800"
                        href="https://www.commercecentral.io/wholesale-pallet-liquidation"
                      >
                        sourcing pallets
                      </Link>{" "}
                      or bidding on full loads, our process puts buyers first.
                    </p>
                  </div>

                  <div className="text-center">
                    <Link className="group inline-block" href="/auth/login">
                      <Button className="relative h-auto transform cursor-pointer overflow-hidden rounded-full border-2 border-transparent bg-gradient-to-r from-[#43CD66] to-[#3BB959] px-12 py-4 text-lg font-[500] text-black shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-green-100 hover:from-[#3BB959] hover:to-[#43CD66] hover:shadow-xl">
                        <span className="relative z-10 flex items-center gap-2">
                          <span className="text-xl">🔍</span>
                          <span>Browse smarter auctions now</span>
                        </span>
                        <span className="absolute inset-0 bg-white/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default Page;
