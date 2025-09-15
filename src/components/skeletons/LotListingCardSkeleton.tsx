import React from "react";
import { Skeleton } from "@/src/components/ui/skeleton";

const LotListingCardSkeleton: React.FC = () => (
  <div className="animate-pulse" aria-hidden="true">
    <Skeleton className="mb-2.5 aspect-square w-full rounded-2xl sm:mb-3" />
    <div className="space-y-1.5">
      <Skeleton className="h-4 w-4/5" />
      <Skeleton className="h-4 w-2/3" />
    </div>
    <div className="mt-2 flex items-center gap-1.5">
      <Skeleton className="h-3 w-3 rounded-full sm:h-3 sm:w-3" />
      <Skeleton className="h-3 w-24 sm:h-3 sm:w-28" />
    </div>
    <div className="mt-1 flex items-center gap-2">
      <Skeleton className="h-3 w-16 sm:h-3 sm:w-20" />
      <Skeleton className="h-3 w-12 sm:h-3 sm:w-16" />
    </div>
  </div>
);

export default LotListingCardSkeleton;
