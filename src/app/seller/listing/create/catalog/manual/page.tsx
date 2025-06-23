import type { Metadata } from 'next';
// MainLayout is provided by seller/layout.tsx - no need to import
import { Button } from '@/src/components/ui/button';
import { Card, CardContent } from '@/src/components/ui/card';
import { ArrowLeft, Package } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Create Catalog Listing - Manual',
  description: 'Create a detailed catalog listing manually',
};

export default function CreateCatalogManualPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-8xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/seller/listing">
            <Button
              variant="ghost"
              className="mb-4 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Create Catalog Listing - Manual
          </h1>
          <p className="text-gray-600">
            Manually create a detailed catalog listing for your inventory
          </p>
        </div>

        {/* Placeholder Content */}
        <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
          <CardContent className="p-12 text-center">
            <Package className="w-16 h-16 mx-auto mb-6 text-gray-400" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Catalog Listing Form Coming Soon
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              The manual catalog listing form will be implemented here.
              For now, please use the Excel upload option to create catalog listings.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/seller/listing/create/catalog/upload">
                <Button className="bg-[#43CD66] hover:bg-[#3ab859] text-white">
                  Use Excel Upload Instead
                </Button>
              </Link>
              <Link href="/seller/listing">
                <Button variant="outline">
                  Back to Listings
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 