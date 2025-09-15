/**
 * EXCEL EXPORT HOOK
 *
 * React hook for integrating Excel export functionality with OfferSummarySheet.
 * Provides progress tracking, error handling, and state management.
 */
import { useParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { useSelector } from "react-redux";

import { exportOfferToExcel } from "../services/excelExportService";
import {
  selectCurrentCatalogItems,
  selectCurrentCatalogOffer,
} from "../store/offerCartSlice";
import type { OfferCartItem } from "../types";
import {
  DEFAULT_EXPORT_CONFIG,
  type ExcelExportResult,
  type ExportConfig,
  type ExportProgress,
} from "../types/export";

interface UseExcelExportResult {
  // State
  isExporting: boolean;
  progress: ExportProgress | null;
  lastResult: ExcelExportResult | null;

  // Actions
  exportOffer: (config?: Partial<ExportConfig>) => Promise<void>;
  resetState: () => void;

  // Computed
  canExport: boolean;
  exportStats: {
    totalItems: number;
    totalValue: number;
    variantCount: number;
  };
}

/**
 * Hook for Excel export functionality
 */
export const useExcelExport = (): UseExcelExportResult => {
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState<ExportProgress | null>(null);
  const [lastResult, setLastResult] = useState<ExcelExportResult | null>(null);

  // Get current catalog offer items from Redux
  const offerItems = useSelector(selectCurrentCatalogItems);
  const currentOffer = useSelector(selectCurrentCatalogOffer);
  const params = useParams();
  const catalogId = Array.isArray(params.id) ? params.id[0] : params.id;

  // Computed values
  const canExport = useMemo(() => {
    return offerItems.length > 0 && !isExporting;
  }, [offerItems, isExporting]);

  const exportStats = {
    totalItems: offerItems.length,
    totalValue: offerItems.reduce((sum, item) => sum + item.totalPrice, 0),
    variantCount: offerItems.length, // Each item is a variant
  };

  /**
   * Execute Excel export with progress tracking
   */
  const exportOffer = useCallback(
    async (configOverrides: Partial<ExportConfig> = {}): Promise<void> => {
      if (!canExport) {
        return;
      }

      setIsExporting(true);
      setProgress(null);
      setLastResult(null);

      try {
        // Merge config with defaults
        const finalConfig: ExportConfig = {
          ...DEFAULT_EXPORT_CONFIG,
          ...configOverrides,
          fileNamePrefix: currentOffer?.catalogTitle || "Offer_Export",
          catalogId: catalogId || undefined,
        };

        // Start export with progress tracking
        const result = await exportOfferToExcel(
          offerItems,
          finalConfig,
          (progressUpdate: ExportProgress) => {
            setProgress(progressUpdate);
          }
        );

        setLastResult(result);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";

        setLastResult({
          success: false,
          error: errorMessage,
        });

        setProgress({
          stage: "error",
          progress: 0,
          message: errorMessage,
        });
      } finally {
        setIsExporting(false);
      }
    },
    [offerItems, canExport, currentOffer, catalogId]
  );

  /**
   * Reset export state
   */
  const resetState = useCallback(() => {
    setIsExporting(false);
    setProgress(null);
    setLastResult(null);
  }, []);

  return {
    // State
    isExporting,
    progress,
    lastResult,

    // Actions
    exportOffer,
    resetState,

    // Computed
    canExport,
    exportStats,
  };
};

/**
 * Hook for getting export progress information
 */
export const useExportProgress = () => {
  const formatProgressMessage = useCallback(
    (progress: ExportProgress): string => {
      switch (progress.stage) {
        case "initializing":
          return "Preparing export...";
        case "processing_images":
          return progress.currentOperation || "Processing variant images...";
        case "generating_excel":
          return progress.currentOperation || "Generating Excel file...";
        case "downloading":
          return "Preparing download...";
        case "complete":
          return "Export completed!";
        case "error":
          return `Error: ${progress.message}`;
        default:
          return progress.message;
      }
    },
    []
  );

  const getProgressColor = useCallback(
    (stage: ExportProgress["stage"]): string => {
      switch (stage) {
        case "complete":
          return "text-green-600";
        case "error":
          return "text-red-600";
        default:
          return "text-blue-600";
      }
    },
    []
  );

  const getProgressIcon = useCallback(
    (stage: ExportProgress["stage"]): string => {
      switch (stage) {
        case "initializing":
          return "⚙️";
        case "processing_images":
          return "🖼️";
        case "generating_excel":
          return "📊";
        case "downloading":
          return "⬇️";
        case "complete":
          return "✅";
        case "error":
          return "❌";
        default:
          return "⏳";
      }
    },
    []
  );

  return {
    formatProgressMessage,
    getProgressColor,
    getProgressIcon,
  };
};
