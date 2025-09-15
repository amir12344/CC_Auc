import { Skeleton } from "@/src/components/ui/skeleton";

export default function OrdersLoading() {
  return (
    <div className="flex flex-col gap-4 p-3 py-4 md:gap-6 md:py-6">
      {/* Header skeleton */}
      <div className="mb-6 flex flex-col">
        <Skeleton className="mb-2 h-8 w-24" />
        <Skeleton className="h-4 w-56" />
      </div>

      {/* Filter tabs skeleton */}
      <div className="mb-6 flex gap-2">
        <Skeleton className="h-8 w-16 rounded-full" />
        <Skeleton className="h-8 w-20 rounded-full" />
        <Skeleton className="h-8 w-24 rounded-full" />
        <Skeleton className="h-8 w-20 rounded-full" />
      </div>

      {/* Orders list skeleton */}
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="animate-pulse rounded-lg border bg-white p-6">
            <div className="mb-4 flex items-start justify-between">
              <div className="flex items-center gap-4">
                <Skeleton className="h-16 w-16 rounded-md" />
                <div>
                  <Skeleton className="mb-2 h-5 w-40" />
                  <Skeleton className="mb-1 h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <div className="text-right">
                <Skeleton className="mb-2 h-6 w-24" />
                <Skeleton className="mb-2 h-4 w-20" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            </div>
            <div className="flex items-center justify-between border-t pt-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-8 w-24 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
