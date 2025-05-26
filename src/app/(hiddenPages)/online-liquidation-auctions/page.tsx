import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/src/components/ui/button';

export const metadata: Metadata = {
  title: 'Online Liquidation Auctions | Bid & Save on Bulk Lots',
  description: 'Join top online liquidation auctions. Bid on bulk lots and save big on inventory for your business. Trusted auction platform for resellers.',
  keywords: ['online liquidation auctions', 'bulk lots', 'auction platform', 'inventory auctions', 'reseller deals', 'wholesale auctions', 'liquidation sales', 'verified sellers', 'clean inventory'],
  robots: 'index, follow',
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
              Commerce Central runs clean, transparent auctions and liquidations no junk, no mystery pallets, no broker games. Just verified returns and excess inventory you can actually resell.
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
              Commerce Central isn't a marketplace free-for-all. It's a controlled, buyer-first wholesale liquidation platform.
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
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-gray-900 text-center">How Our Liquidation Auctions Work</h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
              <div className="bg-white p-6 rounded-xl text-center shadow-sm">
                <div className="h-12 w-12 rounded-full bg-[#102D21] text-white flex items-center justify-center mx-auto mb-4 text-xl font-bold">1</div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Join the Buyer Network</h3>
                <p className="text-gray-700">Sign up and get verified in minutes.</p>
              </div>

              <div className="bg-white p-6 rounded-xl text-center shadow-sm">
                <div className="h-12 w-12 rounded-full bg-[#102D21] text-white flex items-center justify-center mx-auto mb-4 text-xl font-bold">2</div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Browse Active Auctions</h3>
                <p className="text-gray-700">Filter by category, load size, or condition — every liquidation auction is clearly marked.</p>
              </div>

              <div className="bg-white p-6 rounded-xl text-center shadow-sm">
                <div className="h-12 w-12 rounded-full bg-[#102D21] text-white flex items-center justify-center mx-auto mb-4 text-xl font-bold">3</div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Place Your Bid</h3>
                <p className="text-gray-700">No surprises. No proxy games. What you bid is what you pay.</p>
              </div>

              <div className="bg-white p-6 rounded-xl text-center shadow-sm">
                <div className="h-12 w-12 rounded-full bg-[#102D21] text-white flex items-center justify-center mx-auto mb-4 text-xl font-bold">4</div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Win & Ship Fast</h3>
                <p className="text-gray-700">Our team coordinates freight so you can focus on selling.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-4xl font-bold mb-8 text-gray-900">Not Your Typical Online Liquidation Auction Site</h2>
            <p className="text-lg mb-8 text-gray-700">
              Most online liquidation auctions are built to protect sellers, not buyers.
            </p>
            <p className="text-xl mb-10 text-gray-900">
              Commerce Central is different:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-gray-50 p-6 rounded-xl">
                <div className="flex items-center gap-3 mb-2 justify-center">
                  <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600 font-bold">✅</span>
                  </div>
                  <span className="text-gray-800 font-medium">Every seller is verified</span>
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-xl">
                <div className="flex items-center gap-3 mb-2 justify-center">
                  <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600 font-bold">✅</span>
                  </div>
                  <span className="text-gray-800 font-medium">Every listing is accurate</span>
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-xl">
                <div className="flex items-center gap-3 mb-2 justify-center">
                  <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600 font-bold">✅</span>
                  </div>
                  <span className="text-gray-800 font-medium">Every return is flagged up front</span>
                </div>
              </div>
            </div>

            <p className="text-xl font-medium mb-8 text-gray-900">
              We run auctions the way liquidation should have worked all along.
            </p>
          </div>
        </div>
      </section>

      {/* Ready to Source Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-gray-900">Ready to Source Smarter?</h2>
            <p className="text-lg mb-8 text-gray-700">
              If you're tired of high-risk platforms and low-quality inventory, Commerce Central is the online liquidation auction built for your business.
            </p>
            <p className="text-lg mb-12 text-gray-700">
              Commerce Central is a trusted platform for auctions and liquidations, offering verified shelf pulls, excess inventory, and returns from top-tier brands. Through curated liquidation auctions, organized returns auctions, and transparent online liquidation auctions, we help resellers and retailers buy smarter. Whether you're sourcing pallets or bidding on full loads, our process puts buyers first.
            </p>
            <Link href="/earlyaccess" className="inline-block">
              <Button className="bg-[#43CD66] hover:bg-[#3BB959] font-[400] cursor-pointer text-black text-lg px-8 py-3 h-auto rounded-full">
                🔍 Browse smarter auctions now
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Page;