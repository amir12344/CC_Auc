"use client";

import { useMemo } from "react";

import type { ManifestItem } from "../../types";
import { aggregateByCategory } from "../../utils/manifestAggregation";
import { AggregatedDataTable } from "../shared/AggregatedDataTable";

interface CategoryTabProps {
  /** Auction manifest data from API */
  manifestData: ManifestItem[];
}

/**
 * Category tab component - Groups manifest data by category
 * Shows aggregated quantities and extended retail values by category
 */
export const CategoryTab = ({ manifestData }: CategoryTabProps) => {
  // Aggregate data by category
  const aggregatedData = useMemo(() => {
    return aggregateByCategory(manifestData);
  }, [manifestData]);

  return (
    <div className="flex flex-col px-4 lg:px-6">
      <AggregatedDataTable
        data={aggregatedData}
        groupColumnHeader="Category"
        searchPlaceholder="Search categories..."
      />
    </div>
  );
};
