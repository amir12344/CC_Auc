import { Skeleton } from "@/src/components/ui/skeleton";

export default function LotListingsUploadLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-8xl container mx-auto px-4 py-8">
        <div className="mb-8">
          <Skeleton className="mb-4 h-10 w-20" />
          <Skeleton className="mb-2 h-8 w-96" />
          <Skeleton className="h-4 w-[700px]" />
        </div>

        <div className="space-y-8">
          {/* Progress Indicator Skeleton */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="flex space-x-1">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-3 flex-1 rounded-full" />
              ))}
            </div>
            <div className="mt-2 flex justify-between">
              {["Basics", "Load", "Media", "Logistics"].map((label) => (
                <Skeleton key={label} className="h-3 w-12" />
              ))}
            </div>
          </div>

          {/* Form Sections Skeletons */}
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
                <Skeleton className="h-6 w-32" />
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
                <Skeleton className="h-24 w-full" />
              </div>
            </div>
          ))}

          {/* Form Actions Skeleton */}
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <Skeleton className="mb-1 h-6 w-48" />
                <Skeleton className="h-4 w-64" />
              </div>
              <div className="flex items-center space-x-3">
                <Skeleton className="h-12 w-32" />
                <Skeleton className="h-12 w-48" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
