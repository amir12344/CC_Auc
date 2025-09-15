/**
 * EXCEL EXPORT SERVICE
 *
 * Creates Excel files with embedded variant images using ExcelJS.
 * Includes summary section with Excel formulas as seen in competitor images.
 */
import type * as ExcelJS from "exceljs";
import { saveAs } from "file-saver";

import {
  fileToDbCategoryBiMap,
  fileToDbConditionBiMap,
  fileToDbPackagingBiMap,
  fileToDbSubcategoryBiMap,
} from "@/amplify/functions/commons/converters/ListingTypeConverter";

import type { OfferCartItem } from "../types";
import type {
  ExcelExportResult,
  ExportConfig,
  ExportProgress,
  VariantExportRow,
} from "../types/export";
import {
  getVariantImageBase64,
  processVariantImages,
} from "./imageProcessingService";

const transformOfferItemsToRows = (
  offerItems: OfferCartItem[],
  processedImages: Map<string, string>
): VariantExportRow[] => {
  return offerItems.map((item) => ({
    productName: item.productName,
    variantName: item.variantName,
    brandName: item.brandName || "N/A",
    variantSku: item.variantSku,
    selectedQuantity: item.selectedQuantity,
    availableQuantity: item.availableQuantity || 0,
    pricePerUnit: item.pricePerUnit,
    totalPrice: item.totalPrice,
    retailPrice: item.retailPrice,
    offerPrice: item.offerPrice || item.pricePerUnit,
    sellerOfferedPercent:
      item.retailPrice > 0
        ? ((item.retailPrice - item.pricePerUnit) / item.retailPrice) * 100
        : 0,
    sellerTotalOffer: item.pricePerUnit * item.selectedQuantity,
    variantImageUrl: item.variantImage,
    variantImageBase64: getVariantImageBase64(item, processedImages),
    identifier: item.identifier,
    identifier_type: item.identifier_type,
    category: fileToDbCategoryBiMap.getKey(item.category as never) || "Null",
    subcategory:
      fileToDbSubcategoryBiMap.getKey(item.subcategory as never) || "Null",
    packaging: fileToDbPackagingBiMap.getKey(item.packaging as never) || "Null",
    product_condition:
      fileToDbConditionBiMap.getKey(item.product_condition as never) || "Null",
    catalogProductId: item.catalogProductId,
  }));
};

const createSummaryHeader = (
  worksheet: ExcelJS.Worksheet,
  catalogId?: string
): void => {
  // Move summary section to above "Your Offer" section
  worksheet.mergeCells("Q1:R1");

  const cellQ1 = worksheet.getCell("Q1");
  cellQ1.value = "Your Offer Total";
  cellQ1.font = { color: { argb: "FF333333" }, size: 14, bold: true };
  cellQ1.alignment = { horizontal: "center" };

  const headerStyle: Partial<ExcelJS.Style> = {
    font: { bold: true, size: 12 },
  };
  worksheet.getCell("Q2").value = "Total Units";
  worksheet.getCell("Q2").style = headerStyle;
  worksheet.getCell("R2").value = "Total Price";
  worksheet.getCell("R2").style = headerStyle;

  const cellQ3 = worksheet.getCell("Q3");
  // Update formula to sum a specific range to avoid including headers
  cellQ3.value = { formula: "SUM(Q8:Q1048576)" };
  cellQ3.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFE8F4FD" },
  };
  cellQ3.numFmt = "#,##0";

  const cellR3 = worksheet.getCell("R3");
  cellR3.value = { formula: "SUM(S:S)" };
  cellR3.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFE8F4FD" },
  };
  cellR3.numFmt = "$#,##0.00";

  // Move the "Upload Offer to AM" link to J2:K2
  worksheet.mergeCells("I2:K2");
  const cellI2 = worksheet.getCell("I2");

  // Use dynamic catalog ID for the hyperlink
  const uploadUrl = catalogId
    ? `${window.location.origin}/marketplace/catalog/${catalogId}/upload-offer`
    : "https://www.commercecentral.io/marketplace"; // Fallback URL

  cellI2.value = {
    text: "Send Offer To Seller",
    hyperlink: uploadUrl,
  };
  cellI2.font = { color: { argb: "FFFFFFFF" }, bold: true, size: 12 };
  cellI2.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF4A90E2" },
  };
  cellI2.alignment = { horizontal: "center", vertical: "middle" };

  worksheet.getRow(1).height = 25;
  worksheet.getRow(2).height = 20;
  worksheet.getRow(3).height = 25;
};

const createTableHeaders = (
  worksheet: ExcelJS.Worksheet,
  startRow: number
): void => {
  const headerRow1 = worksheet.getRow(startRow);
  const headerRow2 = worksheet.getRow(startRow + 1);
  headerRow1.height = 25;
  headerRow2.height = 25;

  const headerBaseStyle: Partial<ExcelJS.Style> = {
    font: { bold: true, color: { argb: "FF000000" } },
    alignment: { horizontal: "center", vertical: "middle" },
    fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFD9E2F3" } },
    border: {
      top: { style: "thin", color: { argb: "FFA6A6A6" } },
      left: { style: "thin", color: { argb: "FFA6A6A6" } },
      bottom: { style: "thin", color: { argb: "FFA6A6A6" } },
      right: { style: "thin", color: { argb: "FFA6A6A6" } },
    },
  };

  const headers = [
    { text: "Image", col: "A", width: 15, rowSpan: 2 },
    { text: "Product Name", col: "B", width: 30, rowSpan: 2 },
    { text: "Variant", col: "C", width: 25, rowSpan: 2 },
    { text: "Brand", col: "D", width: 20, rowSpan: 2 },
    { text: "Category", col: "E", width: 18, rowSpan: 2 },
    { text: "Subcategory", col: "F", width: 18, rowSpan: 2 },
    { text: "ID Type", col: "G", width: 15, rowSpan: 2 },
    { text: "Identifier", col: "H", width: 15, rowSpan: 2 },
    { text: "SKU", col: "I", width: 20, rowSpan: 2 },
    { text: "Packaging", col: "J", width: 15, rowSpan: 2 },
    { text: "Condition", col: "K", width: 15, rowSpan: 2 },
    { text: "MSRP", col: "L", width: 15, rowSpan: 2 },
  ];

  for (const header of headers) {
    const cell = worksheet.getCell(`${header.col}${startRow}`);
    cell.value = header.text;
    cell.style = headerBaseStyle;
    worksheet.getColumn(header.col).width = header.width;
    if (header.rowSpan === 2) {
      worksheet.mergeCells(
        `${header.col}${startRow}:${header.col}${startRow + 1}`
      );
    }
  }

  // Seller Offer Section
  worksheet.mergeCells(`M${startRow}:P${startRow}`);
  const sellerOfferCell = worksheet.getCell(`M${startRow}`);
  sellerOfferCell.value = "Seller's Offer";
  sellerOfferCell.style = {
    ...headerBaseStyle,
    fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFFDE9D8" } }, // Light orange fill
    border: {
      top: { style: "medium", color: { argb: "FFC0504D" } },
      left: { style: "medium", color: { argb: "FFC0504D" } },
      right: { style: "medium", color: { argb: "FFC0504D" } },
      bottom: { style: "thin", color: { argb: "FFA6A6A6" } },
    },
  };

  const sellerOfferSubHeaders = [
    { text: "Seller's Qty", col: "M", width: 15 },
    { text: "Seller's Price/Unit", col: "N", width: 18 },
    { text: "Seller's Total Offer", col: "O", width: 20 },
    { text: "Seller's Offered Discount %", col: "P", width: 28 },
  ];

  for (const subHeader of sellerOfferSubHeaders) {
    const cell = worksheet.getCell(`${subHeader.col}${startRow + 1}`);
    cell.value = subHeader.text;
    cell.style = {
      ...headerBaseStyle,
      fill: {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFFDE9D8" },
      },
      border: {
        top: { style: "thin", color: { argb: "FFA6A6A6" } },
        bottom: { style: "medium", color: { argb: "FFC0504D" } },
        left:
          subHeader.col === "M"
            ? { style: "medium", color: { argb: "FFC0504D" } }
            : { style: "thin", color: { argb: "FFA6A6A6" } },
        right:
          subHeader.col === "P"
            ? { style: "medium", color: { argb: "FFC0504D" } }
            : { style: "thin", color: { argb: "FFA6A6A6" } },
      },
    };
    worksheet.getColumn(subHeader.col).width = subHeader.width;
  }

  // Unhide columns F (Subcategory) and H (Identifier) by default
  worksheet.getColumn("F").hidden = false;
  worksheet.getColumn("H").hidden = false;

  worksheet.mergeCells(`Q${startRow}:T${startRow}`); // Buyer section spans Q-T
  const yourOfferCell = worksheet.getCell(`Q${startRow}`);
  yourOfferCell.value = "Your Offer";
  yourOfferCell.style = {
    ...headerBaseStyle,
    border: {
      top: { style: "medium", color: { argb: "FF4A90E2" } },
      left: { style: "medium", color: { argb: "FF4A90E2" } },
      right: { style: "medium", color: { argb: "FF4A90E2" } },
      bottom: { style: "thin", color: { argb: "FFA6A6A6" } },
    },
  };

  // "Your Offer" sub-headers with thick borders
  const yourOfferSubHeaders = [
    { text: "Selected Qty", col: "Q", width: 15 },
    { text: "Price/Unit", col: "R", width: 15 },
    { text: "Total Price", col: "S", width: 15 },
    { text: "% Off", col: "T", width: 15 },
  ];

  for (const subHeader of yourOfferSubHeaders) {
    const cell = worksheet.getCell(`${subHeader.col}${startRow + 1}`);
    cell.value = subHeader.text;
    cell.style = {
      ...headerBaseStyle,
      border: {
        top: { style: "thin", color: { argb: "FFA6A6A6" } },
        bottom: { style: "medium", color: { argb: "FF4A90E2" } },
        left:
          subHeader.col === "Q"
            ? { style: "medium", color: { argb: "FF4A90E2" } }
            : { style: "thin", color: { argb: "FFA6A6A6" } },
        right:
          subHeader.col === "T"
            ? { style: "medium", color: { argb: "FF4A90E2" } }
            : { style: "thin", color: { argb: "FFA6A6A6" } },
      },
    };
    worksheet.getColumn(subHeader.col).width = subHeader.width;
  }

  // Add instructional text block
  worksheet.mergeCells(`Q${startRow + 2}:T${startRow + 2}`);
  const instructionCell = worksheet.getCell(`Q${startRow + 2}`);
  instructionCell.value =
    "Edit the fields below:\nSpecify a total quantity.\nThen, choose your price per unit.";
  instructionCell.style = {
    font: { color: { argb: "FF000000" }, size: 10 },
    alignment: { horizontal: "center", vertical: "middle", wrapText: true },
    fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFE0FFFF" } },
  };
  worksheet.getRow(startRow + 2).height = 45;
};

const addImageToCell = (
  worksheet: ExcelJS.Worksheet,
  base64Data: string,
  rowIndex: number
): Promise<void> => {
  return new Promise((resolve) => {
    try {
      const imageId = worksheet.workbook.addImage({
        base64: base64Data,
        extension: "png",
      });

      worksheet.addImage(imageId, {
        tl: { col: 0, row: rowIndex - 1 },
        ext: { width: 90, height: 90 },
      });
      worksheet.getRow(rowIndex).height = 70;
    } catch {
      worksheet.getCell(`A${rowIndex}`).value = "Image Error";
    }
    resolve();
  });
};

/**
 * Helper to populate product information cells in a row
 */
const setProductInfoCells = (
  worksheet: ExcelJS.Worksheet,
  row: VariantExportRow,
  rowIndex: number
) => {
  worksheet.getCell(`B${rowIndex}`).value = row.productName;
  worksheet.getCell(`C${rowIndex}`).value = row.variantName;
  worksheet.getCell(`D${rowIndex}`).value = row.brandName;
  worksheet.getCell(`E${rowIndex}`).value = row.category;
  worksheet.getCell(`F${rowIndex}`).value = row.subcategory;
  worksheet.getCell(`G${rowIndex}`).value = row.identifier_type || "N/A";
  worksheet.getCell(`H${rowIndex}`).value = row.identifier || "N/A";
  worksheet.getCell(`I${rowIndex}`).value = row.variantSku;
  worksheet.getCell(`J${rowIndex}`).value = row.packaging || "N/A";
  worksheet.getCell(`K${rowIndex}`).value = row.product_condition || "N/A";
  const msrpCell = worksheet.getCell(`L${rowIndex}`);
  msrpCell.value = row.retailPrice;
  msrpCell.numFmt = "$#,##0.00";
};

/**
 * Helper to populate seller's offer cells in a row
 */
const setSellerOfferCells = (
  worksheet: ExcelJS.Worksheet,
  row: VariantExportRow,
  rowIndex: number
) => {
  // Seller's Qty
  const sellerQtyCell = worksheet.getCell(`M${rowIndex}`);
  sellerQtyCell.value = row.availableQuantity;
  sellerQtyCell.numFmt = "#,##0";

  // Seller's Price/Unit
  const sellerPriceUnitCell = worksheet.getCell(`N${rowIndex}`);
  sellerPriceUnitCell.value = row.pricePerUnit;
  sellerPriceUnitCell.numFmt = "$#,##0.00";

  // Seller's Total Offer
  const sellerTotalOfferCell = worksheet.getCell(`O${rowIndex}`);
  sellerTotalOfferCell.value = { formula: `N${rowIndex}*M${rowIndex}` };
  sellerTotalOfferCell.numFmt = "$#,##0.00";

  // Seller's Offered Discount %
  const sellerOfferedDiscountCell = worksheet.getCell(`P${rowIndex}`);
  sellerOfferedDiscountCell.value = {
    formula: `IFERROR((L${rowIndex}-N${rowIndex})/L${rowIndex}*100, 0)`,
  };
  sellerOfferedDiscountCell.numFmt = '0.00"%"';
};

/**
 * Helper to populate buyer's offer cells in a row, including validation and borders
 */
const setBuyerOfferCells = (
  worksheet: ExcelJS.Worksheet,
  row: VariantExportRow,
  rowIndex: number
) => {
  // Selected Qty
  const selectedQtyCell = worksheet.getCell(`Q${rowIndex}`);
  selectedQtyCell.value = row.selectedQuantity;
  selectedQtyCell.numFmt = "#,##0";
  selectedQtyCell.border = {
    top: { style: "thin", color: { argb: "FFA6A6A6" } },
    bottom: { style: "thin", color: { argb: "FFA6A6A6" } },
    left: { style: "medium", color: { argb: "FF4A90E2" } },
    right: { style: "thin", color: { argb: "FFA6A6A6" } },
  };
  // Restore data validation to prevent entering more units than available
  selectedQtyCell.dataValidation = {
    type: "whole",
    operator: "lessThanOrEqual",
    showErrorMessage: true,
    formulae: [`M${rowIndex}`], // Dynamically references the "Seller's Units" cell
    errorTitle: "Invalid Quantity",
    error: `The quantity cannot exceed the available Seller's Units (${row.availableQuantity}).`,
    errorStyle: "stop",
  };

  // Price/Unit
  const priceUnitCell = worksheet.getCell(`R${rowIndex}`);
  priceUnitCell.value = row.pricePerUnit;
  priceUnitCell.numFmt = "$#,##0.00";
  priceUnitCell.border = {
    top: { style: "thin", color: { argb: "FFA6A6A6" } },
    bottom: { style: "thin", color: { argb: "FFA6A6A6" } },
    left: { style: "thin", color: { argb: "FFA6A6A6" } },
    right: { style: "thin", color: { argb: "FFA6A6A6" } },
  };

  // Total Price
  const totalPriceCell = worksheet.getCell(`S${rowIndex}`);
  totalPriceCell.value = { formula: `Q${rowIndex}*R${rowIndex}` };
  totalPriceCell.numFmt = "$#,##0.00";
  totalPriceCell.border = {
    top: { style: "thin", color: { argb: "FFA6A6A6" } },
    bottom: { style: "thin", color: { argb: "FFA6A6A6" } },
    left: { style: "thin", color: { argb: "FFA6A6A6" } },
    right: { style: "thin", color: { argb: "FFA6A6A6" } },
  };

  // % Off
  const percentOffCell = worksheet.getCell(`T${rowIndex}`);
  percentOffCell.value = {
    formula: `IFERROR((1-R${rowIndex}/L${rowIndex})*100, 0)`,
  };
  percentOffCell.numFmt = '0.00"%"';
  percentOffCell.border = {
    top: { style: "thin", color: { argb: "FFA6A6A6" } },
    bottom: { style: "thin", color: { argb: "FFA6A6A6" } },
    left: { style: "thin", color: { argb: "FFA6A6A6" } },
    right: { style: "medium", color: { argb: "FF4A90E2" } },
  };
};

const populateDataRows = async (
  worksheet: ExcelJS.Worksheet,
  exportRows: VariantExportRow[],
  startRow: number,
  onProgress?: (completed: number, total: number) => void
): Promise<void> => {
  const imagePromises: Promise<void>[] = [];

  for (let i = 0; i < exportRows.length; i++) {
    const row = exportRows[i];
    const rowIndex = startRow + i;

    if (row.variantImageBase64) {
      imagePromises.push(
        addImageToCell(worksheet, row.variantImageBase64, rowIndex)
      );
    } else {
      worksheet.getCell(`A${rowIndex}`).value = "No Image";
    }

    setProductInfoCells(worksheet, row, rowIndex);
    setSellerOfferCells(worksheet, row, rowIndex);
    setBuyerOfferCells(worksheet, row, rowIndex);

    onProgress?.(i + 1, exportRows.length);
  }

  await Promise.all(imagePromises);

  const lastDataRow = startRow + exportRows.length - 1;
  if (lastDataRow >= startRow) {
    // Add thick bottom border to buyer section (Q-T = columns 17-20)
    for (let col = 17; col <= 20; col++) {
      const cell = worksheet.getCell(lastDataRow, col);
      if (cell.border) {
        cell.border.bottom = { style: "medium", color: { argb: "FF4A90E2" } };
      }
    }
  }
};

export const exportOfferToExcel = async (
  offerItems: OfferCartItem[],
  config: ExportConfig,
  onProgress?: (progress: ExportProgress) => void
): Promise<ExcelExportResult> => {
  const startTime = Date.now();

  try {
    if (offerItems.length === 0) {
      return { success: false, error: "No offer items to export" };
    }

    onProgress?.({
      stage: "initializing",
      progress: 5,
      message: "Initializing export...",
    });

    const imageResult = await processVariantImages(
      offerItems,
      (completed, total) => {
        const imageProgress = 10 + (completed / total) * 40;
        onProgress?.({
          stage: "processing_images",
          progress: imageProgress,
          message: `Processing images: ${completed}/${total}`,
          currentOperation: `Processing variant images (${completed}/${total})`,
        });
      }
    );

    onProgress?.({
      stage: "generating_excel",
      progress: 55,
      message: "Creating Excel workbook...",
    });

    const workbook = new (await import("exceljs")).Workbook();
    const worksheet = workbook.addWorksheet(config.sheetName);
    createSummaryHeader(worksheet, config.catalogId);

    onProgress?.({
      stage: "generating_excel",
      progress: 65,
      message: "Adding data headers...",
    });

    const headerRow = 5;
    createTableHeaders(worksheet, headerRow);

    onProgress?.({
      stage: "generating_excel",
      progress: 70,
      message: "Adding offer data...",
    });

    const exportRows = transformOfferItemsToRows(
      offerItems,
      imageResult.processedImages
    );

    const dataStartRow = headerRow + 3; // UPDATED: Start data after instruction row
    await populateDataRows(
      worksheet,
      exportRows,
      dataStartRow,
      (completed, total) => {
        const dataProgress = 70 + (completed / total) * 20;
        onProgress?.({
          stage: "generating_excel",
          progress: dataProgress,
          message: `Adding data: ${completed}/${total} rows`,
        });
      }
    );

    onProgress?.({
      stage: "downloading",
      progress: 95,
      message: "Preparing download...",
    });

    const excelBuffer = await workbook.xlsx.writeBuffer();
    const fileName = `${config.fileNamePrefix || "Offer_Export"}_${new Date().toISOString().split("T")[0]}.xlsx`;

    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blob, fileName);

    onProgress?.({
      stage: "complete",
      progress: 100,
      message: "Export completed successfully!",
    });

    const processingTime = Date.now() - startTime;

    return {
      success: true,
      fileName,
      fileSize: blob.size,
      processingTime,
      warnings:
        imageResult.errors.length > 0
          ? [`${imageResult.failedImages} variant images failed to process`]
          : [],
    };
  } catch (error) {
    onProgress?.({
      stage: "error",
      progress: 0,
      message:
        error instanceof Error ? error.message : "Unknown error occurred",
    });

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};
