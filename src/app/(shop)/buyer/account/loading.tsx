import { Skeleton } from "@/src/components/ui/skeleton";

export default function AccountLoading() {
  return (
    <div className="flex flex-col gap-4 p-3 py-4 md:gap-6 md:py-6">
      {/* Header skeleton */}
      <div className="mb-6 flex flex-col">
        <Skeleton className="mb-2 h-8 w-32" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Account sections skeleton */}
      <div className="space-y-6">
        {/* Profile section */}
        <div className="rounded-lg border bg-white p-6">
          <Skeleton className="mb-6 h-6 w-32" />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <Skeleton className="mb-2 h-4 w-16" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div>
                <Skeleton className="mb-2 h-4 w-16" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <Skeleton className="mb-2 h-4 w-16" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div>
                <Skeleton className="mb-2 h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </div>
          <Skeleton className="mt-6 h-10 w-24" />
        </div>

        {/* Settings section */}
        <div className="rounded-lg border bg-white p-6">
          <Skeleton className="mb-6 h-6 w-24" />
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                className="flex items-center justify-between border-b py-3 last:border-b-0"
                key={i}
              >
                <div>
                  <Skeleton className="mb-1 h-5 w-32" />
                  <Skeleton className="h-4 w-48" />
                </div>
                <Skeleton className="h-6 w-12 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
