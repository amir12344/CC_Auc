import { Skeleton } from "@/src/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-6 w-48 lg:h-8 lg:w-64" />
        <Skeleton className="h-4 w-64 lg:h-5 lg:w-80" />
      </div>

      {/* Dashboard stats cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        {Array(4)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="animate-pulse rounded-lg border p-4 lg:p-6">
              <div className="mb-4 flex items-start justify-between">
                <Skeleton className="h-4 w-20 lg:h-5 lg:w-24" />
                <Skeleton className="h-8 w-8 rounded-full lg:h-10 lg:w-10" />
              </div>
              <Skeleton className="mb-2 h-6 w-16 lg:h-8 lg:w-20" />
              <Skeleton className="h-3 w-24 lg:h-4 lg:w-32" />
            </div>
          ))}
      </div>

      {/* Content skeleton */}
      <div className="space-y-4">
        <div className="space-y-3">
          {Array(3)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-6 w-6 rounded-full lg:h-8 lg:w-8" />
                <div className="grid flex-1 grid-cols-2 gap-2 lg:grid-cols-4 lg:gap-4">
                  <Skeleton className="h-3 lg:h-4" />
                  <Skeleton className="h-3 lg:h-4" />
                  <Skeleton className="hidden h-3 lg:block lg:h-4" />
                  <Skeleton className="hidden h-3 lg:block lg:h-4" />
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
