import { Suspense } from 'react'
import type { Metadata } from 'next'
import MainLayout from '@/src/components/layout/MainLayout'
import { SearchResults } from '@/src/features/search/components/SearchResults'
import { FilterSidebar } from '@/src/features/navigation/components/FilterSidebar'
import { ActiveFilterChips } from '@/src/features/navigation/components/ActiveFilterChips'
import { DynamicBreadcrumb } from '@/src/components/ui/DynamicBreadcrumb'
import { Skeleton } from '@/src/components/ui/skeleton'

interface SearchPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export const generateMetadata = async ({ searchParams }: SearchPageProps): Promise<Metadata> => {
  const params = await searchParams
  const query = params.q as string
  
  if (!query) {
    return {
      title: 'Search Products | Commerce Central',
      description: 'Search through thousands of surplus inventory products. Find electronics, furniture, home goods, and more at unbeatable prices.',
    }
  }

  return {
    title: `Search results for "${query}" | Commerce Central`,
    description: `Find "${query}" in our extensive collection of surplus inventory. Quality products at discounted prices with fast shipping.`,
    openGraph: {
      title: `Search results for "${query}" | Commerce Central`,
      description: `Find "${query}" in our extensive collection of surplus inventory.`,
    },
  }
}

const SearchResultsSkeleton = () => (
  <div className="space-y-6 md:space-y-8">
    {/* Header Skeleton */}
    <div className="bg-white rounded-lg md:rounded-xl border border-gray-100 shadow-sm p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <Skeleton className="h-6 md:h-7 w-48 md:w-64" />
        <Skeleton className="h-5 md:h-6 w-20 md:w-24 rounded-full" />
      </div>
    </div>

    {/* Controls Skeleton */}
    <div className="bg-white rounded-lg md:rounded-xl border border-gray-100 shadow-sm p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Skeleton className="h-5 w-40 md:w-48" />
        <Skeleton className="h-10 w-full sm:w-44" />
      </div>
    </div>
    
    {/* Grid Skeleton - Matching SimpleProductCard structure */}
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="space-y-3">
          {/* Product Image - matching rounded-[18px] from SimpleProductCard */}
          <Skeleton className="aspect-square w-full rounded-[18px]" />
          
          {/* Product Info - matching SimpleProductCard structure */}
          <div className="space-y-1">
            {/* Brand/Retailer */}
            <Skeleton className="h-3 w-1/2" />
            
            {/* Product Title - 2 lines */}
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            
            {/* Units and Discount Info */}
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  </div>
)

const SearchPage = async ({ searchParams }: SearchPageProps) => {
  const params = await searchParams
  const query = params.q as string || ''
  
  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50/50">
        {/* Breadcrumb Navigation */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-10">
          <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-3 md:py-4">
            <DynamicBreadcrumb />
          </div>
        </div>
        
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
          {/* Mobile Filter Button - Only visible on mobile */}
          <div className="lg:hidden mb-4 md:mb-6">
            <FilterSidebar searchQuery={query} />
          </div>

          {/* Active Filter Chips */}
          <div className="mb-6 md:mb-8">
            <ActiveFilterChips 
              searchQuery={query}
              className="justify-start"
            />
          </div>

          <div className="flex gap-6 md:gap-8">
            {/* Enhanced Filter Sidebar - Desktop Only */}
            <aside className="hidden lg:block w-80 flex-shrink-0">
              <div className="sticky top-24">
                <FilterSidebar searchQuery={query} />
              </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0">
              <Suspense fallback={<SearchResultsSkeleton />}>
                <SearchResults 
                  query={query}
                  filters={params}
                />
              </Suspense>
            </main>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

export default SearchPage 