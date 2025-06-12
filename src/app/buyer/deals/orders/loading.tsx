import { Skeleton } from '@/src/components/ui/skeleton';

export default function OrdersLoading() {
  return (
    <div className="flex flex-col gap-4 p-3 py-4 md:gap-6 md:py-6">
      {/* Header skeleton */}
      <div className="flex flex-col mb-6">
        <Skeleton className="h-8 w-24 mb-2" />
        <Skeleton className="h-4 w-56" />
      </div>

      {/* Filter tabs skeleton */}
      <div className="flex gap-2 mb-6">
        <Skeleton className="h-8 w-16 rounded-full" />
        <Skeleton className="h-8 w-20 rounded-full" />
        <Skeleton className="h-8 w-24 rounded-full" />
        <Skeleton className="h-8 w-20 rounded-full" />
      </div>

      {/* Orders list skeleton */}
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg p-6 border animate-pulse">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-4">
                <Skeleton className="w-16 h-16 rounded-md" />
                <div>
                  <Skeleton className="h-5 w-40 mb-2" />
                  <Skeleton className="h-4 w-32 mb-1" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <div className="text-right">
                <Skeleton className="h-6 w-24 mb-2" />
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            </div>
            <div className="flex justify-between items-center pt-4 border-t">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-8 w-24 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 