import { Skeleton } from '@/src/components/ui/skeleton';

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-6 lg:h-8 w-48 lg:w-64" />
        <Skeleton className="h-4 lg:h-5 w-64 lg:w-80" />
      </div>
      
      {/* Dashboard stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {Array(4).fill(0).map((_, i) => (
          <div key={i} className="rounded-lg border p-4 lg:p-6 animate-pulse">
            <div className="flex justify-between items-start mb-4">
              <Skeleton className="h-4 lg:h-5 w-20 lg:w-24" />
              <Skeleton className="w-8 h-8 lg:w-10 lg:h-10 rounded-full" />
            </div>
            <Skeleton className="h-6 lg:h-8 w-16 lg:w-20 mb-2" />
            <Skeleton className="h-3 lg:h-4 w-24 lg:w-32" />
          </div>
        ))}
      </div>
      
      {/* Content skeleton */}
      <div className="space-y-4">
        <div className="space-y-3">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <Skeleton className="w-6 h-6 lg:w-8 lg:h-8 rounded-full" />
              <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-4">
                <Skeleton className="h-3 lg:h-4" />
                <Skeleton className="h-3 lg:h-4" />
                <Skeleton className="h-3 lg:h-4 hidden lg:block" />
                <Skeleton className="h-3 lg:h-4 hidden lg:block" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
