import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";

import { Button } from "@/src/components/ui/button";

export const metadata: Metadata = {
  title:
    "Wholesale Liquidation Platform | Source Bulk Inventory From Trusted Sellers",
  description:
    "Access the leading wholesale liquidation platform that puts buyers first. Source clean, verified liquidation pallets from trusted brands and authorized distributors. No middlemen, no mystery manifests.",
  keywords: [
    "wholesale liquidation platform",
    "bulk inventory",
    "liquidation suppliers",
    "inventory sourcing",
    "business growth",
    "verified liquidation",
    "trusted sellers",
    "clean manifests",
    "return liquidation",
    "truckload liquidation",
  ],
  robots: "index, follow",
  alternates: {
    canonical: "https://www.commercecentral.io/wholesale-liquidation-platform",
  },
  openGraph: {
    url: "https://www.commercecentral.io/wholesale-liquidation-platform",
    title:
      "Wholesale Liquidation Platform | Source Bulk Inventory From Trusted Sellers",
    description:
      "Access the leading wholesale liquidation platform that puts buyers first. Source clean, verified liquidation pallets from trusted brands and authorized distributors.",
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
      "Wholesale Liquidation Platform | Source Bulk Inventory From Trusted Sellers",
    description:
      "Access the leading wholesale liquidation platform that puts buyers first. Source clean, verified liquidation pallets from trusted brands and authorized distributors.",
    images: ["/CC_opengraph.png"],
  },
};

const PlatformPage = () => {
  return (
    <>
      <main className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-[#102D21] to-[#1A4534] py-20 text-[#43CD66] md:py-28">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 bg-black opacity-40" />
            <div className="h-full w-full bg-[url('/grid-pattern-light.svg')] bg-repeat opacity-10" />
          </div>
          <div className="relative z-10 container mx-auto px-4 py-6 sm:px-6 md:py-0 lg:px-8">
            <div className="mx-auto max-w-4xl text-center">
              <h1 className="mb-6 text-4xl leading-tight font-bold tracking-tight md:text-5xl lg:text-6xl">
                Finally — A Wholesale Liquidation Platform That Puts Buyers
                First
              </h1>
              <p className="mx-auto mb-10 max-w-3xl text-xl text-gray-200 md:text-2xl">
                No more mystery boxes. No more shady brokers. Just clean,
                verified{" "}
                <Link
                  className="text-[#43CD66] hover:underline"
                  href="https://www.commercecentral.io/wholesale-pallet-liquidation"
                >
                  wholesale liquidation pallets
                </Link>{" "}
                from trusted brands and authorized distributors.
              </p>
              <Link className="inline-block" href="/auth/select-user-type">
                <Button className="h-auto cursor-pointer rounded-full bg-[#43CD66] px-8 py-3 text-lg font-[400] text-black hover:bg-[#3BB959]">
                  Sign Up Now (Free)
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Introduction Section */}
        <section className="bg-gray-50 py-16 md:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl">
              <h2 className="mb-12 text-center text-3xl font-bold text-gray-900 md:text-4xl">
                Smarter Liquidation Starts Here
              </h2>
              <div className="prose prose-lg max-w-none text-gray-700">
                <p className="mb-6 text-lg">
                  Commerce Central is a sourcing platform built for serious
                  buyers who are tired of the guessing game. Whether you&apos;re
                  scaling up your operation or looking for your first reliable
                  load, our platform helps you source liquidation inventory
                  that&apos;s actually worth your time.
                </p>
                <p className="mb-6 text-lg">
                  We connect you directly to authorized sellers, brands, and
                  trusted distributors—no middlemen, no mystery manifests.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Modern Liquidation Section */}
        <section className="bg-white py-16 md:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl">
              <h2 className="mb-8 text-3xl font-bold text-gray-900 md:text-4xl">
                A Modern Liquidation Channel, Built for Buyers
              </h2>
              <div className="prose prose-lg max-w-none text-gray-700">
                <p className="mb-6 text-lg">
                  The liquidation channel has long been broken. Too many
                  platforms flood the market with mislabeled goods, inflated
                  MSRPs, and loads that don&apos;t match what was promised.
                </p>
                <p className="mb-6 text-lg font-medium text-gray-900">
                  Commerce Central changes that.
                </p>
                <p className="mb-6 text-lg">
                  We&apos;re rebuilding the liquidation channel from the ground
                  up—with clean manifests, better categorization, and tools that
                  give buyers more control over what, when, and how they buy.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Verified Pallets Section */}
        <section className="bg-gray-50 py-16 md:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl">
              <h2 className="mb-8 text-3xl font-bold text-gray-900 md:text-4xl">
                Verified Liquidation Pallets You Can Actually Resell
              </h2>
              <p className="mb-10 text-lg text-gray-700">
                Every day, we post new liquidation pallets from brand-name
                suppliers across the U.S.—including shelf pulls, overstocks, and
                returned items that are ready to resell.
              </p>

              <h3 className="mb-6 text-xl font-semibold text-gray-800">
                All listings include:
              </h3>
              <ul className="mb-10 grid grid-cols-1 gap-4 md:grid-cols-2">
                <li className="flex items-start gap-3 rounded-lg bg-white p-4 shadow-sm">
                  <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
                    <svg
                      className="h-4 w-4 text-green-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <title>Checkmark</title>
                      <path
                        clipRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        fillRule="evenodd"
                      />
                    </svg>
                  </div>
                  <span className="text-gray-700">
                    Product condition (new, like new, shelf pulls, or customer
                    returns)
                  </span>
                </li>
                <li className="flex items-start gap-3 rounded-lg bg-white p-4 shadow-sm">
                  <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
                    <svg
                      className="h-4 w-4 text-green-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <title>Checkmark</title>
                      <path
                        clipRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        fillRule="evenodd"
                      />
                    </svg>
                  </div>
                  <span className="text-gray-700">
                    Photos and documentation when available
                  </span>
                </li>
                <li className="flex items-start gap-3 rounded-lg bg-white p-4 shadow-sm">
                  <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
                    <svg
                      className="h-4 w-4 text-green-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <title>Checkmark</title>
                      <path
                        clipRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        fillRule="evenodd"
                      />
                    </svg>
                  </div>
                  <span className="text-gray-700">
                    Freight estimates and location transparency
                  </span>
                </li>
                <li className="flex items-start gap-3 rounded-lg bg-white p-4 shadow-sm">
                  <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
                    <svg
                      className="h-4 w-4 text-green-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <title>Checkmark</title>
                      <path
                        clipRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        fillRule="evenodd"
                      />
                    </svg>
                  </div>
                  <span className="text-gray-700">
                    Brand-level visibility once verified
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Wholesale Without Blind Spots Section */}
        <section className="bg-white py-16 md:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl">
              <h2 className="mb-8 text-3xl font-bold text-gray-900 md:text-4xl">
                Wholesale Liquidation Without the Blind Spots
              </h2>
              <p className="mb-6 text-lg text-gray-700">
                We focus on wholesale liquidation that works at scale. Whether
                you&apos;re stocking one store or managing a multi-location
                chain, you get access to consistent supply—without the usual
                risks.
              </p>
              <p className="mb-10 text-xl font-medium text-gray-900">
                No junk loads. No guessing. No inflated freight surprises.
              </p>
            </div>
          </div>
        </section>

        {/* Trusted Sellers Section */}
        <section className="bg-gray-50 py-16 md:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl">
              <h2 className="mb-8 text-3xl font-bold text-gray-900 md:text-4xl">
                Wholesale Liquidation Pallets from Trusted Sellers
              </h2>
              <p className="mb-6 text-lg text-gray-700">
                Unlike other platforms, we vet every seller before they list.
                That means when you browse{" "}
                <Link
                  className="text-blue-600 no-underline hover:underline"
                  href="https://www.commercecentral.io/wholesale-pallet-liquidation"
                >
                  wholesale liquidation pallets
                </Link>{" "}
                on Commerce Central, you know you&apos;re sourcing from real
                businesses—not fly-by-night resellers.
              </p>
              <p className="mb-10 text-xl font-medium text-gray-900">
                It&apos;s wholesale without the wild west.
              </p>
            </div>
          </div>
        </section>

        {/* Return Liquidation Section */}
        <section className="bg-white py-16 md:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl">
              <h2 className="mb-8 text-3xl font-bold text-gray-900 md:text-4xl">
                Return Liquidation Done Right
              </h2>
              <p className="mb-6 text-lg text-gray-700">
                Returns can be gold—or garbage. That&apos;s why we built
                Commerce Central to make{" "}
                <Link
                  className="text-blue-600 no-underline hover:underline"
                  href="https://www.commercecentral.io/online-liquidation-auctions"
                >
                  return liquidation
                </Link>{" "}
                more transparent.
              </p>
              <p className="mb-10 text-lg text-gray-700">
                We ask sellers to clearly flag return rates and condition levels
                up front. If there&apos;s ever a mismatch between what was
                listed and what arrives, we make it right.
              </p>
            </div>
          </div>
        </section>

        {/* Truckload Liquidation Section */}
        <section className="bg-gray-50 py-16 md:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl">
              <h2 className="mb-8 text-3xl font-bold text-gray-900 md:text-4xl">
                Truckload Liquidation with Freight Visibility
              </h2>
              <p className="mb-8 text-lg text-gray-700">
                For serious buyers, we offer truckload liquidation options from
                our network of sellers nationwide. These loads come with:
              </p>

              <ul className="mb-8 space-y-4">
                <li className="flex items-center gap-3">
                  <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
                    <svg
                      className="h-4 w-4 text-green-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <title>Checkmark</title>
                      <path
                        clipRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        fillRule="evenodd"
                      />
                    </svg>
                  </div>
                  <span className="text-gray-700">Manifest previews</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
                    <svg
                      className="h-4 w-4 text-green-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <title>Checkmark</title>
                      <path
                        clipRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        fillRule="evenodd"
                      />
                    </svg>
                  </div>
                  <span className="text-gray-700">Pallet breakdowns</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
                    <svg
                      className="h-4 w-4 text-green-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <title>Checkmark</title>
                      <path
                        clipRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        fillRule="evenodd"
                      />
                    </svg>
                  </div>
                  <span className="text-gray-700">
                    Zip-based freight calculations
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
                    <svg
                      className="h-4 w-4 text-green-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <title>Checkmark</title>
                      <path
                        clipRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        fillRule="evenodd"
                      />
                    </svg>
                  </div>
                  <span className="text-gray-700">
                    Direct support for delivery logistics
                  </span>
                </li>
              </ul>

              <p className="mb-10 text-lg font-medium text-gray-900">
                If you&apos;re tired of rolling the dice on blind truckloads,
                this is a smarter way to buy.
              </p>
            </div>
          </div>
        </section>

        {/* Best Liquidation Website Section */}
        <section className="bg-white py-16 md:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl">
              <h2 className="mb-8 text-3xl font-bold text-gray-900 md:text-4xl">
                Why Buyers Say We&apos;re the Best Liquidation Website
              </h2>
              <p className="mb-8 text-lg text-gray-700">
                Is Commerce Central the best liquidation website? Our buyers
                seem to think so—and here&apos;s why:
              </p>

              <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-lg bg-gray-50 p-6">
                  <h3 className="mb-3 text-xl font-semibold text-gray-900">
                    Vetted inventory
                  </h3>
                  <p className="text-gray-700">
                    Every listing is verified and comes from trusted sources.
                  </p>
                </div>
                <div className="rounded-lg bg-gray-50 p-6">
                  <h3 className="mb-3 text-xl font-semibold text-gray-900">
                    Buyer controls
                  </h3>
                  <p className="text-gray-700">
                    Advanced filtering and search tools to find exactly what you
                    need.
                  </p>
                </div>
                <div className="rounded-lg bg-gray-50 p-6">
                  <h3 className="mb-3 text-xl font-semibold text-gray-900">
                    Transparent pricing
                  </h3>
                  <p className="text-gray-700">
                    No hidden fees or surprise charges after purchase.
                  </p>
                </div>
                <div className="rounded-lg bg-gray-50 p-6">
                  <h3 className="mb-3 text-xl font-semibold text-gray-900">
                    Limited-access listings
                  </h3>
                  <p className="text-gray-700">
                    Protected marketplace that maintains value for all buyers.
                  </p>
                </div>
                <div className="rounded-lg bg-gray-50 p-6">
                  <h3 className="mb-3 text-xl font-semibold text-gray-900">
                    U.S.-based support
                  </h3>
                  <p className="text-gray-700">
                    A team that picks up the phone and solves problems quickly.
                  </p>
                </div>
              </div>

              <p className="mb-10 text-lg text-gray-700">
                We&apos;re not just building a marketplace, we&apos;re building
                a better experience for{" "}
                <Link
                  className="text-blue-600 no-underline hover:underline"
                  href="https://www.commercecentral.io/website/buyer"
                >
                  liquidation buyers
                </Link>
                .
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-br from-[#102D21] to-[#1A4534] py-16 text-white md:py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl text-center">
              <h2 className="mb-8 text-3xl font-bold md:text-4xl">
                Looking for liquidation, wholesale liquidation, or trusted
                liquidation pallets for resale?
              </h2>
              <p className="mx-auto mb-10 max-w-3xl text-xl text-gray-200">
                Commerce Central is your modern liquidation platform for
                verified overstock, returns, and shelf pulls — with options for
                truckload liquidation, small batch sourcing, and everything in
                between.
              </p>
              <Link className="inline-block" href="/auth/select-user-type">
                <Button className="h-auto cursor-pointer rounded-full bg-[#43CD66] px-8 py-3 text-lg font-[400] text-black hover:bg-[#3BB959]">
                  Sign Up (Free)
                </Button>
              </Link>
              <p className="mt-4 text-sm text-gray-300">
                Contact: team@commercecentral.io
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default PlatformPage;
