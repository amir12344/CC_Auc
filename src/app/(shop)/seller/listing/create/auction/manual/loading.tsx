import { Skeleton } from "@/src/components/ui/skeleton";

export default function AuctionManualLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-8xl container mx-auto px-4 py-8">
        <div className="mb-8">
          <Skeleton className="mb-4 h-10 w-20" />
          <Skeleton className="mb-2 h-8 w-96" />
          <Skeleton className="h-4 w-[600px]" />
        </div>

        <div className="space-y-8">
          {/* Form sections skeleton */}
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-lg bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <Skeleton className="h-9 w-9 rounded-lg" />
                <div>
                  <Skeleton className="mb-1 h-6 w-48" />
                  <Skeleton className="h-4 w-64" />
                </div>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {[1, 2, 3, 4].map((j) => (
                    <div key={j} className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-12 w-full" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
