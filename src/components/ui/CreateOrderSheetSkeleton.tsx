import { Skeleton } from "./skeleton";

export function CreateOrderSheetSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Stats Grid Skeleton */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Skeleton className="h-24 rounded-lg bg-gray-200" />
        <Skeleton className="h-24 rounded-lg bg-gray-200" />
        <Skeleton className="h-24 rounded-lg bg-gray-200" />
      </div>

      {/* Table Skeleton */}
      <div className="space-y-4 rounded-lg border border-gray-200 p-4">
        {/* Table Header */}
        <div className="grid grid-cols-12 items-center gap-4 px-4 py-2 text-xs text-gray-500 uppercase">
          <div className="col-span-6 font-medium">Variant</div>
          <div className="col-span-2 text-right font-medium">Price/Unit</div>
          <div className="col-span-2 text-center font-medium">Quantity</div>
          <div className="col-span-2 text-right font-medium">Total Price</div>
        </div>

        {/* Table Rows */}
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            className="grid grid-cols-12 items-center gap-4 border-t border-gray-200 px-4 py-4"
            key={i}
          >
            <div className="col-span-6 flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded bg-gray-200" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4 bg-gray-200" />
                <Skeleton className="h-3 w-1/2 bg-gray-200" />
              </div>
            </div>
            <div className="col-span-2">
              <Skeleton className="ml-auto h-8 w-20 rounded bg-gray-200" />
            </div>
            <div className="col-span-2 flex justify-center">
              <Skeleton className="h-8 w-20 rounded bg-gray-200" />
            </div>
            <div className="col-span-2 flex items-center justify-end gap-4">
              <Skeleton className="h-8 w-24 rounded bg-gray-200" />
              <Skeleton className="h-5 w-5 rounded-full bg-gray-200" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
