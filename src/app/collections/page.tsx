import { Suspense } from 'react'
import type { Metadata } from 'next'
import MainLayout from '@/src/components/layout/MainLayout'
import { CollectionGrid } from '@/src/features/collections/components/CollectionGrid'
import { DynamicBreadcrumb } from '@/src/components/ui/DynamicBreadcrumb'

export const metadata: Metadata = {
  title: 'Collections | Commerce Central',
  description: 'Browse our curated collections of surplus inventory. Find electronics, furniture, home goods, and more organized by category at unbeatable prices.',
  openGraph: {
    title: 'Collections | Commerce Central',
    description: 'Browse our curated collections of surplus inventory. Quality products organized by category at unbeatable prices.',
  },
}

const CollectionsPage = () => {
  return (
    <MainLayout>
      <div className="min-h-screen bg-white">
        {/* Breadcrumb Navigation */}
        <div className="border-b border-gray-100">
          <div className="max-w-8xl mx-auto px-6 py-4">
            <DynamicBreadcrumb />
          </div>
        </div>
        
        {/* Enhanced Page Header */}
        <div className="bg-gradient-to-r from-blue-50/80 to-purple-50/80 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-16">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-5xl font-bold text-gray-900 mb-6">
                Our Collections
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                Discover curated collections of premium surplus inventory. Each collection features 
                hand-picked products from trusted brands, organized to help you find exactly what you need.
              </p>
              
              {/* Collection Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">8+</div>
                  <div className="text-sm text-gray-600">Curated Collections</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">1000+</div>
                  <div className="text-sm text-gray-600">Quality Products</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">70%</div>
                  <div className="text-sm text-gray-600">Average Savings</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Collections Grid */}
        <div className="py-12">
          <Suspense fallback={<div>Loading collections...</div>}>
            <CollectionGrid />
          </Suspense>
        </div>
      </div>
    </MainLayout>
  )
}

export default CollectionsPage 