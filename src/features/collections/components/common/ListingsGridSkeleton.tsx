import React from "react";

import { Skeleton } from "@/src/components/ui/skeleton";

interface ListingsGridSkeletonProps {
  items?: number;
  className?: string;
}

export const ListingsGridSkeleton = ({
  items = 16,
  className,
}: ListingsGridSkeletonProps) => {
  return (
    <div
      className={`grid grid-cols-2 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-4 ${className ?? ""}`}
    >
      {Array.from({ length: items }).map((_, i) => (
        <Skeleton
          key={`catalog-skeleton-${i.toString()}-grid`}
          className="aspect-square w-full rounded-lg"
        />
      ))}
    </div>
  );
};
