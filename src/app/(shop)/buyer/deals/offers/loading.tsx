import { Skeleton } from "@/src/components/ui/skeleton";

export default function OffersLoading() {
  return (
    <div className="flex flex-col gap-4 p-3 py-4 md:gap-6 md:py-6">
      {/* Header skeleton */}
      <div className="mb-6 flex flex-col">
        <Skeleton className="mb-2 h-8 w-24" />
        <Skeleton className="h-4 w-48" />
      </div>

      {/* Offers list skeleton */}
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="animate-pulse rounded-lg border bg-white p-6">
            <div className="mb-4 flex items-start justify-between">
              <div className="flex-1">
                <Skeleton className="mb-2 h-5 w-3/4" />
                <Skeleton className="mb-2 h-4 w-1/2" />
                <Skeleton className="h-3 w-1/3" />
              </div>
              <div className="text-right">
                <Skeleton className="mb-2 h-6 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-8 w-20 rounded-md" />
              <Skeleton className="h-8 w-20 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
