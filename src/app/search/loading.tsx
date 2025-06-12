import { Skeleton } from '@/src/components/ui/skeleton'

const SearchLoading = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50/50">
      {/* Breadcrumb Skeleton */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 md:py-4">
          <Skeleton className="h-4 w-32 md:w-40" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        {/* Active Filter Chips Skeleton */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-wrap gap-2 md:gap-3">
            <Skeleton className="h-8 w-20 md:w-24 rounded-full" />
            <Skeleton className="h-8 w-24 md:w-28 rounded-full" />
            <Skeleton className="h-8 w-16 md:w-20 rounded-full" />
          </div>
        </div>

        <div className="flex gap-6 md:gap-8">
          {/* Filter Sidebar Skeleton */}
          <aside className="hidden lg:block w-80 flex-shrink-0">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-8">
              <div className="space-y-4">
                <Skeleton className="h-6 w-24" />
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-3">
                      <Skeleton className="h-4 w-4 rounded" />
                      <Skeleton className="h-4 w-28" />
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-4">
                <Skeleton className="h-6 w-20" />
                <div className="space-y-3">
                  <Skeleton className="h-10 w-full rounded-lg" />
                  <Skeleton className="h-10 w-full rounded-lg" />
                </div>
              </div>

              <div className="space-y-4">
                <Skeleton className="h-6 w-16" />
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-3">
                      <Skeleton className="h-4 w-4 rounded" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Search Results Skeleton */}
          <main className="flex-1 min-w-0">
            <div className="space-y-6 md:space-y-8">
              {/* Results Header */}
              <div className="bg-gradient-to-r from-white via-blue-50/30 to-white rounded-lg md:rounded-xl border border-gray-100 shadow-sm p-4 md:p-6">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 md:gap-4">
                    <Skeleton className="h-8 md:h-10 w-8 md:w-10 rounded-full flex-shrink-0" />
                    <div className="space-y-2 min-w-0 flex-1">
                      <Skeleton className="h-6 md:h-7 w-full max-w-64" />
                      <div className="flex flex-wrap items-center gap-2">
                        <Skeleton className="h-5 w-20 md:w-24 rounded-full" />
                        <Skeleton className="h-5 w-16 md:w-20 rounded-full" />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded-full flex-shrink-0" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              </div>

              {/* Results Controls */}
              <div className="bg-white rounded-lg md:rounded-xl border border-gray-100 shadow-sm p-4 md:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <Skeleton className="h-5 w-32 md:w-40" />
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-2 w-2 rounded-full" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 md:gap-3">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-10 w-full sm:w-44 rounded-lg" />
                  </div>
                </div>
              </div>

              {/* Results Grid - Matching SimpleProductCard structure */}
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

              {/* Load More Skeleton */}
              <div className="text-center py-6 md:py-8">
                <div className="inline-flex items-center gap-2 mb-4">
                  <Skeleton className="h-px w-8 md:w-12" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-px w-8 md:w-12" />
                </div>
                <Skeleton className="h-10 w-full sm:w-40 rounded-lg mx-auto" />
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

export default SearchLoading 