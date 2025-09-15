import { DynamicBreadcrumb } from "@/src/components/ui/DynamicBreadcrumb";
import { Skeleton } from "@/src/components/ui/skeleton";
import { FilterSidebar } from "@/src/features/navigation/components/FilterSidebar";

/**
 * Loading component for the private offers page.
 * Shows skeleton placeholders while the page is loading.
 */
export default function PrivateOffersLoading() {
  return (
    <div className="min-h-screen">
      <DynamicBreadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Collections", href: "/collections" },
          { label: "Private Offers", href: "/collections/private-offers" },
        ]}
      />

      <div className="flex min-h-screen">
        {/* Filter Sidebar */}
        <FilterSidebar />

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="mx-auto max-w-7xl">
            {/* Header skeleton */}
            <div className="mb-8 flex items-center justify-between">
              <div>
                <div className="h-8 w-48 animate-pulse rounded-lg bg-gray-200" />
                <div className="mt-2 h-4 w-24 animate-pulse rounded bg-gray-200" />
              </div>
              <div className="h-10 w-32 animate-pulse rounded-lg bg-gray-200" />
            </div>

            {/* Grid skeleton */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-4">
              {Array.from({ length: 16 }).map((_, i) => (
                <Skeleton
                  className="aspect-square w-full rounded-lg"
                  key={`private-offers-loading-skeleton-${i}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
