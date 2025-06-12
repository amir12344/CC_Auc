import { Skeleton } from '@/src/components/ui/skeleton';

export default function MessagesLoading() {
  return (
    <div className="flex flex-col gap-4 p-3 py-4 md:gap-6 md:py-6">
      {/* Header skeleton */}
      <div className="flex flex-col mb-6">
        <Skeleton className="h-8 w-32 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Messages list skeleton */}
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg p-4 border animate-pulse">
            <div className="flex items-start gap-4">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </div>
              <Skeleton className="w-3 h-3 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 