import type { Metadata } from "next";
import Link from "next/link";

import { ArrowLeft, Package } from "lucide-react";

// MainLayout is provided by seller/layout.tsx - no need to import
import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";

export const metadata: Metadata = {
  title: "Create Catalog Listing - Manual",
  description: "Create a detailed catalog listing manually",
};

export default function CreateCatalogManualPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-8xl container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/seller/listing">
            <Button
              variant="ghost"
              className="mb-4 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </Link>
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            Create Catalog Listing - Manual
          </h1>
          <p className="text-gray-600">
            Manually create a detailed catalog listing for your inventory
          </p>
        </div>

        {/* Placeholder Content */}
        <Card className="border-0 bg-white/90 shadow-lg backdrop-blur-sm">
          <CardContent className="p-12 text-center">
            <Package className="mx-auto mb-6 h-16 w-16 text-gray-400" />
            <h2 className="mb-4 text-2xl font-semibold text-gray-900">
              Catalog Listing Form Coming Soon
            </h2>
            <p className="mx-auto mb-8 max-w-md text-gray-600">
              The manual catalog listing form will be implemented here. For now,
              please use the Excel upload option to create catalog listings.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/seller/listing/create/catalog/upload">
                <Button className="bg-[#43CD66] text-white hover:bg-[#3ab859]">
                  Use Excel Upload Instead
                </Button>
              </Link>
              <Link href="/seller/listing">
                <Button variant="outline">Back to Listings</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
