import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/src/components/ui/button';

export const metadata: Metadata = {
  title: 'Wholesale Liquidation Platform | Source Bulk Inventory From Trusted Sellers',
  description: 'Access the leading wholesale liquidation platform that puts buyers first. Source clean, verified liquidation pallets from trusted brands and authorized distributors. No middlemen, no mystery manifests.',
  keywords: ['wholesale liquidation platform', 'bulk inventory', 'liquidation suppliers', 'inventory sourcing', 'business growth', 'verified liquidation', 'trusted sellers', 'clean manifests', 'return liquidation', 'truckload liquidation'],
  robots: 'index, follow',
  alternates: {
    canonical: 'https://www.commercecentral.io/wholesale-liquidation-platform'
  },
  openGraph: {
    url: 'https://www.commercecentral.io/wholesale-liquidation-platform',
    title: 'Wholesale Liquidation Platform | Source Bulk Inventory From Trusted Sellers',
    description: 'Access the leading wholesale liquidation platform that puts buyers first. Source clean, verified liquidation pallets from trusted brands and authorized distributors.',
    images: [
      {
        url: '/CC_opengraph.png',
        width: 500,
        height: 500,
        alt: 'Commerce Central Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Wholesale Liquidation Platform | Source Bulk Inventory From Trusted Sellers',
    description: 'Access the leading wholesale liquidation platform that puts buyers first. Source clean, verified liquidation pallets from trusted brands and authorized distributors.',
    images: ['/CC_opengraph.png'],
  },
};

const PlatformPage = () => {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-[#102D21] to-[#1A4534] text-[#43CD66] min-h-screen overflow-hidden flex items-center justify-center py-20 md:py-28">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-black opacity-40"></div>
          <div className="h-full w-full bg-[url('/grid-pattern-light.svg')] bg-repeat opacity-10"></div>
        </div>
        <div className="container mx-auto px-4 py-6 md:py-0 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight tracking-tight">
              Finally — A Wholesale Liquidation Platform That Puts Buyers First
            </h1>
            <p className="text-xl md:text-2xl mb-10 text-gray-200 max-w-3xl mx-auto">
              No more mystery boxes. No more shady brokers. Just clean, verified <Link href="https://www.commercecentral.io/wholesale-pallet-liquidation" className="text-[#43CD66] hover:underline">wholesale liquidation pallets</Link> from trusted brands and authorized distributors.
            </p>
            <Link href="/earlyaccess" className="inline-block">
              <Button className="bg-[#43CD66] hover:bg-[#3BB959] font-[400] cursor-pointer text-black text-lg px-8 py-3 h-auto rounded-full">
                Get Early Access (Free)
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Introduction Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">Smarter Liquidation Starts Here</h2>
            <div className="prose prose-lg max-w-none text-gray-700">
              <p className="mb-6 text-lg">
                Commerce Central is a sourcing platform built for serious buyers who are tired of the guessing game. Whether you're scaling up your operation or looking for your first reliable load, our platform helps you source liquidation inventory that's actually worth your time.
              </p>
              <p className="mb-6 text-lg">
                We connect you directly to authorized sellers, brands, and trusted distributors—no middlemen, no mystery manifests.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Modern Liquidation Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-gray-900">A Modern Liquidation Channel, Built for Buyers</h2>
            <div className="prose prose-lg max-w-none text-gray-700">
              <p className="mb-6 text-lg">
                The liquidation channel has long been broken. Too many platforms flood the market with mislabeled goods, inflated MSRPs, and loads that don't match what was promised.
              </p>
              <p className="mb-6 text-lg font-medium text-gray-900">
                Commerce Central changes that.
              </p>
              <p className="mb-6 text-lg">
                We're rebuilding the liquidation channel from the ground up—with clean manifests, better categorization, and tools that give buyers more control over what, when, and how they buy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Verified Pallets Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-gray-900">Verified Liquidation Pallets You Can Actually Resell</h2>
            <p className="text-lg mb-10 text-gray-700">
              Every day, we post new liquidation pallets from brand-name suppliers across the U.S.—including shelf pulls, overstocks, and returned items that are ready to resell.
            </p>

            <h3 className="text-xl font-semibold mb-6 text-gray-800">All listings include:</h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
              <li className="flex items-start gap-3 p-4 bg-white rounded-lg shadow-sm">
                <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-gray-700">Product condition (new, like new, shelf pulls, or customer returns)</span>
              </li>
              <li className="flex items-start gap-3 p-4 bg-white rounded-lg shadow-sm">
                <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-gray-700">Photos and documentation when available</span>
              </li>
              <li className="flex items-start gap-3 p-4 bg-white rounded-lg shadow-sm">
                <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-gray-700">Freight estimates and location transparency</span>
              </li>
              <li className="flex items-start gap-3 p-4 bg-white rounded-lg shadow-sm">
                <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-gray-700">Brand-level visibility once verified</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Wholesale Without Blind Spots Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-gray-900">Wholesale Liquidation Without the Blind Spots</h2>
            <p className="text-lg mb-6 text-gray-700">
              We focus on wholesale liquidation that works at scale. Whether you're stocking one store or managing a multi-location chain, you get access to consistent supply—without the usual risks.
            </p>
            <p className="text-xl font-medium text-gray-900 mb-10">
              No junk loads. No guessing. No inflated freight surprises.
            </p>
          </div>
        </div>
      </section>

      {/* Trusted Sellers Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-gray-900">Wholesale Liquidation Pallets from Trusted Sellers</h2>
            <p className="text-lg mb-6 text-gray-700">
              Unlike other platforms, we vet every seller before they list. That means when you browse <Link href="https://www.commercecentral.io/wholesale-pallet-liquidation" className="text-blue-600 no-underline hover:underline">wholesale liquidation pallets</Link> on Commerce Central, you know you're sourcing from real businesses—not fly-by-night resellers.
            </p>
            <p className="text-xl font-medium text-gray-900 mb-10">
              It's wholesale without the wild west.
            </p>
          </div>
        </div>
      </section>

      {/* Return Liquidation Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-gray-900">Return Liquidation Done Right</h2>
            <p className="text-lg mb-6 text-gray-700">
              Returns can be gold—or garbage. That's why we built Commerce Central to make <Link href="https://www.commercecentral.io/online-liquidation-auctions" className="text-blue-600 no-underline hover:underline">return liquidation</Link> more transparent.
            </p>
            <p className="text-lg mb-10 text-gray-700">
              We ask sellers to clearly flag return rates and condition levels up front. If there's ever a mismatch between what was listed and what arrives, we make it right.
            </p>
          </div>
        </div>
      </section>

      {/* Truckload Liquidation Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-gray-900">Truckload Liquidation with Freight Visibility</h2>
            <p className="text-lg mb-8 text-gray-700">
              For serious buyers, we offer truckload liquidation options from our network of sellers nationwide. These loads come with:
            </p>

            <ul className="space-y-4 mb-8">
              <li className="flex items-center gap-3">
                <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-gray-700">Manifest previews</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-gray-700">Pallet breakdowns</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-gray-700">Zip-based freight calculations</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-gray-700">Direct support for delivery logistics</span>
              </li>
            </ul>

            <p className="text-lg font-medium text-gray-900 mb-10">
              If you're tired of rolling the dice on blind truckloads, this is a smarter way to buy.
            </p>
          </div>
        </div>
      </section>

      {/* Best Liquidation Website Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-gray-900">Why Buyers Say We're the Best Liquidation Website</h2>
            <p className="text-lg mb-8 text-gray-700">
              Is Commerce Central the best liquidation website? Our buyers seem to think so—and here's why:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Vetted inventory</h3>
                <p className="text-gray-700">Every listing is verified and comes from trusted sources.</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Buyer controls</h3>
                <p className="text-gray-700">Advanced filtering and search tools to find exactly what you need.</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Transparent pricing</h3>
                <p className="text-gray-700">No hidden fees or surprise charges after purchase.</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Limited-access listings</h3>
                <p className="text-gray-700">Protected marketplace that maintains value for all buyers.</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-3 text-gray-900">U.S.-based support</h3>
                <p className="text-gray-700">A team that picks up the phone and solves problems quickly.</p>
              </div>
            </div>

            <p className="text-lg text-gray-700 mb-10">
              We're not just building a marketplace, we're building a better experience for <Link href="https://www.commercecentral.io/website/buyer" className="text-blue-600 no-underline hover:underline">liquidation buyers</Link>.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-[#102D21] to-[#1A4534] text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-8">Looking for liquidation, wholesale liquidation, or trusted liquidation pallets for resale?</h2>
            <p className="text-xl mb-10 text-gray-200 max-w-3xl mx-auto">
              Commerce Central is your modern liquidation platform for verified overstock, returns, and shelf pulls — with options for truckload liquidation, small batch sourcing, and everything in between.
            </p>
            <Link href="/earlyaccess" className="inline-block">
              <Button className="bg-[#43CD66] hover:bg-[#3BB959] font-[400] cursor-pointer text-black text-lg px-8 py-3 h-auto rounded-full">
                Get Early Access (Free)
              </Button>
            </Link>
            <p className="mt-4 text-sm text-gray-300">Contact: team@commercecentral.io</p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default PlatformPage;