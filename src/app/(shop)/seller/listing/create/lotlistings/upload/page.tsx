import Link from "next/link";

import { ArrowLeft } from "lucide-react";

import { LotListingsUploadForm } from "@/src/features/seller/components/lotListings/LotListingsUploadForm";

export default function LotListingsUploadPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Page Header */}
      <div className="border-b border-neutral-200 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="max-w-8xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 text-sm text-neutral-600">
            <Link
              href="/seller/listing"
              className="inline-flex items-center gap-2 hover:text-neutral-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Listings
            </Link>
            <span className="select-none">/</span>
            <span className="text-neutral-900">Create Lot Listing</span>
          </div>
          <div className="mt-8">
            <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
              Create Lot Listing
            </h1>
            <p className="mt-1 text-neutral-600">
              Provide clear details about your inventory, logistics and media.
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-8xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <LotListingsUploadForm />
      </div>
    </div>
  );
}
