import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/src/components/ui/button';

export const metadata: Metadata = {
  title: 'Online Liquidation Auctions | Bid & Save on Bulk Lots',
  description: 'Join top online liquidation auctions. Bid on bulk lots and save big on inventory for your business. Trusted auction platform for resellers.',
  keywords: ['online liquidation auctions', 'bulk lots', 'auction platform', 'inventory auctions', 'reseller deals', 'wholesale auctions', 'liquidation sales', 'verified sellers', 'clean inventory'],
  robots: 'index, follow',
  alternates: {
    canonical: 'https://www.commercecentral.io/online-liquidation-auctions'
  },
  openGraph: {
    url: 'https://www.commercecentral.io/online-liquidation-auctions',
    title: 'Online Liquidation Auctions | Bid & Save on Bulk Lots',
    description: 'Join top online liquidation auctions. Bid on bulk lots and save big on inventory for your business. Trusted auction platform for resellers.',
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
    title: 'Online Liquidation Auctions | Bid & Save on Bulk Lots',
    description: 'Join top online liquidation auctions. Bid on bulk lots and save big on inventory for your business. Trusted auction platform for resellers.',
    images: ['/CC_opengraph.png'],
  },
};

const Page = () => {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-[#102D21] to-[#1A4534] text-[#43CD66]  min-h-screen overflow-hidden flex items-center justify-center py-20 md:py-28">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-black opacity-40"></div>
          <div className="h-full w-full bg-[url('/grid-pattern-light.svg')] bg-repeat opacity-10"></div>
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight tracking-tight">
              The Online Liquidation Auction Platform Built for Buyers
            </h1>
            <p className="text-xl md:text-2xl mb-10 text-gray-200 max-w-3xl mx-auto">
              Commerce Central runs clean, transparent auctions and liquidations no junk, no mystery pallets, no broker games. Just verified returns and <Link href="https://www.commercecentral.io/website/blog/how-to-avoid-getting-burned-buying-liquidation-inventory" className="text-[#43CD66] hover:underline">excess inventory</Link> you can actually resell.
            </p>
            <Link href="/earlyaccess" className="inline-block">
              <Button className="bg-[#43CD66] hover:bg-[#3BB959] font-[400] cursor-pointer text-black text-lg px-8 py-3 h-auto rounded-full">
                🔍 Browse smarter auctions now
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Introduction Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-gray-900 text-center">Smarter Liquidation Auctions, Powered by Commerce Central</h2>
            <div className="space-y-6 text-lg text-gray-700">
              <p>
                Commerce Central is where serious buyers go for smarter online liquidation auctions. We connect verified businesses to shelf-ready inventory from trusted brands, all via curated returns auctions and liquidation auction events built for speed, control, and transparency.
              </p>
              <p>
                Whether you're new to auctions and liquidations or just tired of the mystery-box approach, Commerce Central is changing how inventory gets resold.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-gray-900">Why Commerce Central?</h2>
            <p className="text-xl mb-8 text-gray-700">
              Most liquidation auction sites leave you guessing.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-6 w-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-red-600 font-bold">❌</span>
                  </div>
                  <span className="text-gray-800 font-medium">No condition details</span>
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-6 w-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-red-600 font-bold">❌</span>
                  </div>
                  <span className="text-gray-800 font-medium">No manifests or images</span>
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-6 w-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-red-600 font-bold">❌</span>
                  </div>
                  <span className="text-gray-800 font-medium">Bidding games that inflate costs</span>
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-6 w-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-red-600 font-bold">❌</span>
                  </div>
                  <span className="text-gray-800 font-medium">Surprise fees and freight confusion</span>
                </div>
              </div>
            </div>

            <p className="text-lg text-gray-700 mb-8">
              And worst of all? Truckloads of unsellable goods that don't match the listing.
            </p>

            <p className="text-xl font-medium text-gray-900">
              Commerce Central eliminates the risk. We've rebuilt the liquidation auction experience from the ground up to prioritize you—the buyer.
            </p>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-gray-900">A Better Way to Run Auctions and Liquidations</h2>
            <p className="text-lg mb-8 text-gray-700">
              Commerce Central isn't a marketplace free-for-all. It's a controlled, buyer-first <Link href="https://www.commercecentral.io/wholesale-liquidation-platform" className="text-blue-600 hover:text-blue-800">wholesale liquidation platform</Link>.
            </p>

            <div className="bg-white p-8 rounded-xl shadow-sm mb-10">
              <h3 className="text-2xl font-semibold mb-6 text-gray-900">Our returns auctions give you:</h3>

              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <li className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-700">Verified inventory from real brands and authorized distributors</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-700">Full manifests with condition tags</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-700">Shelf-ready loads or clearly labeled return stock</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-700">Pre-bid freight estimates</span>
                </li>
                <li className="flex items-start gap-3 md:col-span-2">
                  <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-700">Transparent pricing — no proxy bidding, no hidden markups</span>
                </li>
              </ul>
            </div>

            <p className="text-xl font-medium text-center text-gray-900">
              We run online liquidation auctions that respect your time and protect your profit.
            </p>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-gray-900">Why Buyers Use Commerce Central Auctions</h2>
            <p className="text-lg mb-8 text-gray-700">
              When you source through Commerce Central's auctions and liquidations, you gain:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              <div className="bg-gray-50 p-6 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600 font-bold">✅</span>
                  </div>
                  <span className="text-gray-800 font-medium">The ability to set your price</span>
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600 font-bold">✅</span>
                  </div>
                  <span className="text-gray-800 font-medium">Access to partial lots or full truckload liquidation</span>
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600 font-bold">✅</span>
                  </div>
                  <span className="text-gray-800 font-medium">Real-time condition and seller info</span>
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600 font-bold">✅</span>
                  </div>
                  <span className="text-gray-800 font-medium">New inventory drops weekly</span>
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-xl md:col-span-2">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600 font-bold">✅</span>
                  </div>
                  <span className="text-gray-800 font-medium">A clear edge over other liquidation platforms</span>
                </div>
              </div>
            </div>

            <p className="text-xl font-medium text-center text-gray-900">
              Because when the load is clean and the terms are clear, you win—not the broker.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-gray-50 via-gray-50 to-gray-100 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#43CD66] opacity-5 rounded-full transform translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#102D21] opacity-5 rounded-full transform -translate-x-1/3 translate-y-1/3"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-6xl max-h-6xl bg-gradient-to-r from-[#43CD66] via-transparent to-[#102D21] opacity-5 rounded-full blur-3xl"></div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-20">
              <div className="inline-block mb-4 p-2 bg-green-50 rounded-full">
                <div className="bg-green-100 rounded-full px-6 py-2">
                  <span className="text-[#102D21] font-medium">Simple & Transparent</span>
                </div>
              </div>

              <h2 className="text-3xl md:text-5xl font-bold mb-6 text-gray-900 relative inline-block">
                How Our Liquidation Auctions Work
                <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-32 h-1.5 bg-gradient-to-r from-transparent via-[#43CD66] to-transparent rounded-full"></div>
              </h2>

              <p className="text-xl text-gray-700 mt-8 max-w-3xl mx-auto">A simple four-step process designed with buyers in mind</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16 relative">
              {/* Connection line for desktop */}
              <div className="hidden lg:block absolute top-24 left-[15%] right-[15%] h-1 bg-gradient-to-r from-[#102D21] via-[#43CD66] to-[#102D21] opacity-30 z-0"></div>

              {/* Step 1 */}
              <div className="group">
                <div className="bg-white p-8 rounded-2xl text-center shadow-lg hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-2 relative z-10 border border-gray-100 h-full flex flex-col">
                  <div className="relative mb-8 mx-auto">
                    <div className="absolute inset-0 bg-green-200 rounded-full opacity-20 scale-150 group-hover:scale-125 transition-transform duration-300"></div>
                    <div className="h-20 w-20 rounded-full bg-gradient-to-br from-[#102D21] to-[#1A4534] text-white flex items-center justify-center mx-auto text-2xl font-bold ring-8 ring-white relative z-10">
                      1
                    </div>
                  </div>
                  <h3 className="text-2xl font-semibold mb-4 text-gray-900">Join the Buyer Network</h3>
                  <p className="text-gray-700 flex-grow">Sign up and get verified in minutes.</p>
                  <div className="mt-6 w-12 h-1 bg-[#43CD66] mx-auto rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="group">
                <div className="bg-white p-8 rounded-2xl text-center shadow-lg hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-2 relative z-10 border border-gray-100 h-full flex flex-col">
                  <div className="relative mb-8 mx-auto">
                    <div className="absolute inset-0 bg-green-200 rounded-full opacity-20 scale-150 group-hover:scale-125 transition-transform duration-300"></div>
                    <div className="h-20 w-20 rounded-full bg-gradient-to-br from-[#102D21] to-[#1A4534] text-white flex items-center justify-center mx-auto text-2xl font-bold ring-8 ring-white relative z-10">
                      2
                    </div>
                  </div>
                  <h3 className="text-2xl font-semibold mb-4 text-gray-900">Browse Active Auctions</h3>
                  <p className="text-gray-700 flex-grow">Filter by category, load size, or condition — every liquidation auction is clearly marked.</p>
                  <div className="mt-6 w-12 h-1 bg-[#43CD66] mx-auto rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="group">
                <div className="bg-white p-8 rounded-2xl text-center shadow-lg hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-2 relative z-10 border border-gray-100 h-full flex flex-col">
                  <div className="relative mb-8 mx-auto">
                    <div className="absolute inset-0 bg-green-200 rounded-full opacity-20 scale-150 group-hover:scale-125 transition-transform duration-300"></div>
                    <div className="h-20 w-20 rounded-full bg-gradient-to-br from-[#102D21] to-[#1A4534] text-white flex items-center justify-center mx-auto text-2xl font-bold ring-8 ring-white relative z-10">
                      3
                    </div>
                  </div>
                  <h3 className="text-2xl font-semibold mb-4 text-gray-900">Place Your Bid</h3>
                  <p className="text-gray-700 flex-grow">No surprises. No proxy games. What you bid is what you pay.</p>
                  <div className="mt-6 w-12 h-1 bg-[#43CD66] mx-auto rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="group">
                <div className="bg-white p-8 rounded-2xl text-center shadow-lg hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-2 relative z-10 border border-gray-100 h-full flex flex-col">
                  <div className="relative mb-8 mx-auto">
                    <div className="absolute inset-0 bg-green-200 rounded-full opacity-20 scale-150 group-hover:scale-125 transition-transform duration-300"></div>
                    <div className="h-20 w-20 rounded-full bg-gradient-to-br from-[#102D21] to-[#1A4534] text-white flex items-center justify-center mx-auto text-2xl font-bold ring-8 ring-white relative z-10">
                      4
                    </div>
                  </div>
                  <h3 className="text-2xl font-semibold mb-4 text-gray-900">Win & Ship Fast</h3>
                  <p className="text-gray-700 flex-grow">Our team coordinates freight so you can focus on selling.</p>
                  <div className="mt-6 w-12 h-1 bg-[#43CD66] mx-auto rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 md:py-24 bg-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-gray-50 to-white opacity-70"></div>
        <div className="absolute -right-24 -bottom-24 w-96 h-96 bg-[#43CD66] opacity-5 rounded-full"></div>
        <div className="absolute -left-24 -bottom-24 w-64 h-64 bg-[#102D21] opacity-5 rounded-full"></div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block mb-6 p-2 bg-green-50 rounded-full">
              <div className="bg-green-100 rounded-full px-4 py-1">
                <span className="text-[#102D21] font-medium">Trusted by resellers nationwide</span>
              </div>
            </div>

            <h2 className="text-4xl md:text-4xl font-bold mb-8 text-gray-900">Not Your Typical Online Liquidation Auction Site</h2>
            <p className="text-lg mb-8 text-gray-700">
              Most online liquidation auctions are built to protect sellers, not buyers.
            </p>
            <p className="text-xl mb-10 text-gray-900">
              Commerce Central is different:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-gradient-to-br from-white to-gray-50 p-8 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                <div className="h-16 w-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600 font-bold">✅</span>
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">Verified Sellers</h3>
                <p className="text-gray-700">Every seller is thoroughly vetted before they can list inventory</p>
              </div>

              <div className="bg-gradient-to-br from-white to-gray-50 p-8 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                <div className="h-16 w-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600 font-bold">✅</span>
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">Accurate Listings</h3>
                <p className="text-gray-700">Every listing is accurate with detailed manifests and condition reports</p>
              </div>

              <div className="bg-gradient-to-br from-white to-gray-50 p-8 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                <div className="h-16 w-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600 font-bold">✅</span>
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">Transparent Returns</h3>
                <p className="text-gray-700">Every return is flagged up front so you know exactly what you're buying</p>
              </div>
            </div>

            <p className="text-xl font-medium mb-8 text-gray-900 px-4 py-3 bg-green-50 inline-block rounded-lg">
              We run auctions the way liquidation should have worked all along.
            </p>
          </div>
        </div>
      </section>

      {/* Ready to Source Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-gray-50 via-gray-50 to-gray-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#43CD66] opacity-5 rounded-full transform translate-x-1/4 -translate-y-1/4"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#102D21] opacity-5 rounded-full transform -translate-x-1/4 translate-y-1/4"></div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="p-8 md:p-12">
                <div className="text-center mb-10">
                  <div className="inline-block p-2 bg-green-50 rounded-full mb-4">
                    <div className="bg-green-100 rounded-full px-4 py-1">
                      <span className="text-[#102D21] font-medium">Join our buyer network</span>
                    </div>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">Ready to Source Smarter?</h2>
                  <div className="h-1 w-24 bg-[#43CD66] mx-auto rounded-full mb-6"></div>
                  <p className="text-lg mb-8 text-gray-700">
                    If you're tired of high-risk platforms and low-quality inventory, Commerce Central is the online liquidation auction built for your business.
                  </p>
                </div>

                <div className="bg-gray-50 p-6 rounded-xl mb-10">
                  <p className="text-lg text-gray-700">
                    Commerce Central is a trusted platform for auctions and liquidations, offering verified shelf pulls, <Link href="https://www.commercecentral.io/website/blog/how-to-avoid-getting-burned-buying-liquidation-inventory" className="text-blue-600 hover:text-blue-800 underline">excess inventory</Link>, and returns from top-tier brands. Through curated liquidation auctions, organized returns auctions, and transparent online liquidation auctions, we help resellers and retailers buy smarter. Whether you're <Link href="https://www.commercecentral.io/wholesale-pallet-liquidation" className="text-blue-600 hover:text-blue-800 underline">sourcing pallets</Link> or bidding on full loads, our process puts buyers first.
                  </p>
                </div>

                <div className="text-center">
                  <Link href="/earlyaccess" className="inline-block group">
                    <Button className="relative overflow-hidden bg-gradient-to-r from-[#43CD66] to-[#3BB959] hover:from-[#3BB959] hover:to-[#43CD66] font-[500] cursor-pointer text-black text-lg px-12 py-4 h-auto rounded-full shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-transparent hover:border-green-100">
                      <span className="relative z-10 flex items-center gap-2">
                        <span className="text-xl">🔍</span>
                        <span>Browse smarter auctions now</span>
                      </span>
                      <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Page;