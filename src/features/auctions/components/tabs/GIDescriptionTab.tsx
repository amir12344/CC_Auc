"use client";

import { useMemo } from "react";

import type { ManifestItem } from "../../types";
import { aggregateByGIDescription } from "../../utils/manifestAggregation";
import { AggregatedDataTable } from "../shared/AggregatedDataTable";

interface GIDescriptionTabProps {
  /** Auction manifest data from API */
  manifestData: ManifestItem[];
}

/**
 * GI Description tab component - Groups manifest data by general item description
 * Shows aggregated quantities and extended retail values by general item type
 */
export const GIDescriptionTab = ({ manifestData }: GIDescriptionTabProps) => {
  // Aggregate data by GI description
  const aggregatedData = useMemo(() => {
    return aggregateByGIDescription(manifestData);
  }, [manifestData]);

  return (
    <div className="flex flex-col px-4 lg:px-6">
      <AggregatedDataTable
        data={aggregatedData}
        groupColumnHeader="GI Description"
        searchPlaceholder="Search GI descriptions..."
      />
    </div>
  );
};
