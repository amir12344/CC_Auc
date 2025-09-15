import { Skeleton } from "@/src/components/ui/skeleton";

export default function CatalogUploadLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-8xl container mx-auto px-4 py-8">
        <div className="mb-8">
          <Skeleton className="mb-4 h-10 w-20" />
          <Skeleton className="mb-2 h-8 w-96" />
          <Skeleton className="h-4 w-[700px]" />
        </div>

        <div className="space-y-8">
          {/* Listing Visibility Skeleton */}
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-lg" />
              <div>
                <Skeleton className="mb-1 h-6 w-48" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
            <div className="space-y-4">
              <Skeleton className="h-6 w-32" />
              <div className="space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            </div>
          </div>

          {/* File Upload Skeletons */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {[1, 2].map((i) => (
              <div key={i} className="rounded-lg bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center gap-3">
                  <Skeleton className="h-9 w-9 rounded-lg" />
                  <div>
                    <Skeleton className="mb-1 h-5 w-48" />
                    <Skeleton className="h-4 w-56" />
                  </div>
                </div>
                <div className="space-y-4">
                  <Skeleton className="h-32 w-full rounded-lg" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            ))}
          </div>

          {/* Form Actions Skeleton */}
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <div className="flex justify-end space-x-4">
              <Skeleton className="h-12 w-32" />
              <Skeleton className="h-12 w-48" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
