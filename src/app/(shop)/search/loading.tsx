import { Skeleton } from "@/src/components/ui/skeleton";

const SearchLoading = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50/50">
      {/* Breadcrumb Skeleton */}
      <div className="sticky top-0 z-10 border-b border-gray-100 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 md:py-4 lg:px-8">
          <Skeleton className="h-4 w-32 md:w-40" />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 md:py-8 lg:px-8">
        {/* Active Filter Chips Skeleton */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-wrap gap-2 md:gap-3">
            <Skeleton className="h-8 w-20 rounded-full md:w-24" />
            <Skeleton className="h-8 w-24 rounded-full md:w-28" />
            <Skeleton className="h-8 w-16 rounded-full md:w-20" />
          </div>
        </div>

        <div className="flex gap-6 md:gap-8">
          {/* Filter Sidebar Skeleton */}
          <aside className="hidden w-80 flex-shrink-0 lg:block">
            <div className="space-y-8 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
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
          <main className="min-w-0 flex-1">
            <div className="space-y-6 md:space-y-8">
              {/* Results Header */}
              <div className="rounded-lg border border-gray-100 bg-gradient-to-r from-white via-blue-50/30 to-white p-4 shadow-sm md:rounded-xl md:p-6">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center md:gap-4">
                    <Skeleton className="h-8 w-8 flex-shrink-0 rounded-full md:h-10 md:w-10" />
                    <div className="min-w-0 flex-1 space-y-2">
                      <Skeleton className="h-6 w-full max-w-64 md:h-7" />
                      <div className="flex flex-wrap items-center gap-2">
                        <Skeleton className="h-5 w-20 rounded-full md:w-24" />
                        <Skeleton className="h-5 w-16 rounded-full md:w-20" />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 flex-shrink-0 rounded-full" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              </div>

              {/* Results Controls */}
              <div className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm md:rounded-xl md:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <Skeleton className="h-5 w-32 md:w-40" />
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-2 w-2 rounded-full" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center md:gap-3">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-10 w-full rounded-lg sm:w-44" />
                  </div>
                </div>
              </div>

              {/* Results Grid - Matching SimpleProductCard structure */}
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3 xl:grid-cols-4">
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
              <div className="py-6 text-center md:py-8">
                <div className="mb-4 inline-flex items-center gap-2">
                  <Skeleton className="h-px w-8 md:w-12" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-px w-8 md:w-12" />
                </div>
                <Skeleton className="mx-auto h-10 w-full rounded-lg sm:w-40" />
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default SearchLoading;
