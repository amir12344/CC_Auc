"use client";

import { useMemo } from "react";

import type { ManifestItem } from "../../types";
import { aggregateBySubcategory } from "../../utils/manifestAggregation";
import { AggregatedDataTable } from "../shared/AggregatedDataTable";

interface SubcategoryTabProps {
  /** Auction manifest data from API */
  manifestData: ManifestItem[];
}

/**
 * Subcategory tab component - Groups manifest data by subcategory
 * Shows aggregated quantities and extended retail values by subcategory
 */
export const SubcategoryTab = ({ manifestData }: SubcategoryTabProps) => {
  // Aggregate data by subcategory
  const aggregatedData = useMemo(() => {
    return aggregateBySubcategory(manifestData);
  }, [manifestData]);

  return (
    <div className="flex flex-col px-4 lg:px-6">
      <AggregatedDataTable
        data={aggregatedData}
        groupColumnHeader="Subcategory"
        searchPlaceholder="Search subcategories..."
      />
    </div>
  );
};
