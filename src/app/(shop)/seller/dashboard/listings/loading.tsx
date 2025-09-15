import { Skeleton } from "@/src/components/ui/skeleton";

export default function AllDealsLoading() {
  return (
    <div className="flex flex-col gap-4 p-3 py-4 md:gap-6 md:py-6">
      {/* Header skeleton */}
      <div className="mb-6 flex flex-col">
        <Skeleton className="mb-2 h-8 w-32" />
      </div>

      {/* Controls skeleton */}
      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-8 w-16 rounded-full" />
          <Skeleton className="h-8 w-24 rounded-full" />
          <Skeleton className="h-8 w-16 rounded-full" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-8 w-32" />
        </div>
      </div>

      {/* Deals list skeleton */}
      <div className="space-y-px">
        {Array.from({ length: 5 }).map((_, i) => (
          <div className="animate-pulse rounded-lg border bg-white p-4" key={i}>
            <div className="flex items-center space-x-4">
              <Skeleton className="h-20 w-20 rounded-sm" />
              <div className="flex-1">
                <Skeleton className="mb-2 h-5 w-3/4" />
                <Skeleton className="mb-2 h-4 w-1/2" />
                <Skeleton className="h-3 w-1/3" />
              </div>
              <div className="flex flex-col items-end gap-2">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bargain section skeleton */}
      <div className="mt-8">
        <Skeleton className="mb-6 h-8 w-48" />
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div className="animate-pulse" key={i}>
              <Skeleton className="mb-3 aspect-square w-full rounded-lg" />
              <Skeleton className="mb-2 h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
