import { env } from "$amplify/env/notification-processor";
import type * as ExcelJS from "exceljs";

import {
  CatalogOfferData,
  CatalogOfferExcelRow,
  ExcelExportConfig,
  ExcelExportResult,
  ExcelGenerationProgress,
} from "../types/catalogOfferTypes";
import { S3ImageService } from "./s3ImageService";

const transformOfferItemsToRows = (
  offerData: CatalogOfferData
): CatalogOfferExcelRow[] => {
  return offerData.items.map((item) => {
    const retailPrice = item.catalogProductVariant?.retailPrice || 0;
    const buyerPrice = item.buyerOfferPrice || 0;
    const sellerPrice = item.sellerOfferPrice || 0;
    const quantity = item.requestedQuantity;

    return {
      productName: item.catalogProduct.productName,
      variantName: item.catalogProductVariant?.variantName || "N/A",
      brandName: item.catalogProduct.brandName || "N/A",
      variantSku: item.catalogProductVariant?.variantSku || "N/A",
      requestedQuantity: quantity,
      sellerOfferPrice: sellerPrice,
      sellerOfferPriceCurrency: item.sellerOfferPriceCurrency || "",
      buyerOfferPrice: buyerPrice,
      buyerOfferPriceCurrency: item.buyerOfferPriceCurrency || "",
      retailPrice,
      totalBuyerOffer: buyerPrice * quantity,
      totalSellerOffer: sellerPrice * quantity,
      buyerDiscountPercent:
        retailPrice > 0 ? ((retailPrice - buyerPrice) / retailPrice) * 100 : 0,
      sellerDiscountPercent:
        retailPrice > 0 ? ((retailPrice - sellerPrice) / retailPrice) * 100 : 0,
      negotiationStatus: item.negotiationStatus,
      category: item.catalogProduct.category || "N/A",
      subcategory: item.catalogProduct.subcategory || "N/A",
      packaging: item.catalogProductVariant?.packaging || "N/A",
      condition: item.catalogProductVariant?.condition || "N/A",
      identifier: item.catalogProductVariant?.identifier || "N/A",
      identifierType: item.catalogProductVariant?.identifierType || "N/A",
      imageS3Key: item.catalogProductVariant?.imageS3Key,
    };
  });
};

const createSummaryHeader = (
  worksheet: ExcelJS.Worksheet,
  recipientType: "BUYER" | "SELLER"
): void => {
  // Move summary section to above "Your Offer" section
  worksheet.mergeCells("Q1:R1");

  const cellQ1 = worksheet.getCell("Q1");
  cellQ1.value = recipientType === "BUYER" ? "Your Offer Total" : "Offer Total";
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

  // Add offer details link section for email context
  worksheet.mergeCells("I2:K2");
  const cellI2 = worksheet.getCell("I2");
  cellI2.value = {
    text: "Catalog Offer Details",
    hyperlink: "https://www.commercecentral.io/marketplace",
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
  startRow: number,
  recipientType: "BUYER" | "SELLER"
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
    { text: "Image", col: "A", width: 20, rowSpan: 2 }, // Increased width to accommodate 120px images
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

  // Current Offer Section (what was seller's offer in original)
  worksheet.mergeCells(`M${startRow}:P${startRow}`);
  const currentOfferCell = worksheet.getCell(`M${startRow}`);
  currentOfferCell.value =
    recipientType === "BUYER" ? "Seller's Offer" : "Buyer's Offer";
  currentOfferCell.style = {
    ...headerBaseStyle,
    fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFFDE9D8" } },
    border: {
      top: { style: "medium", color: { argb: "FFC0504D" } },
      left: { style: "medium", color: { argb: "FFC0504D" } },
      right: { style: "medium", color: { argb: "FFC0504D" } },
      bottom: { style: "thin", color: { argb: "FFA6A6A6" } },
    },
  };

  const currentOfferSubHeaders = [
    { text: "Offered Qty", col: "M", width: 15 },
    { text: "Price/Unit", col: "N", width: 18 },
    { text: "Total Offer", col: "O", width: 20 },
    { text: "Discount %", col: "P", width: 28 },
  ];

  for (const subHeader of currentOfferSubHeaders) {
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

  // Your Offer/Counter Offer Section
  worksheet.mergeCells(`Q${startRow}:T${startRow}`);
  const yourOfferCell = worksheet.getCell(`Q${startRow}`);
  yourOfferCell.value =
    recipientType === "BUYER" ? "Your Offer" : "Your Counter Offer";
  yourOfferCell.style = {
    ...headerBaseStyle,
    border: {
      top: { style: "medium", color: { argb: "FF4A90E2" } },
      left: { style: "medium", color: { argb: "FF4A90E2" } },
      right: { style: "medium", color: { argb: "FF4A90E2" } },
      bottom: { style: "thin", color: { argb: "FFA6A6A6" } },
    },
  };

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
    recipientType === "BUYER"
      ? "Review the offer details below\nand respond via the platform."
      : "Edit the fields below:\nSpecify a total quantity.\nThen, choose your price per unit.";
  instructionCell.style = {
    font: { color: { argb: "FF000000" }, size: 10 },
    alignment: { horizontal: "center", vertical: "middle", wrapText: true },
    fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFE0FFFF" } },
  };
  worksheet.getRow(startRow + 2).height = 45;
};

const setProductInfoCells = (
  worksheet: ExcelJS.Worksheet,
  row: CatalogOfferExcelRow,
  rowIndex: number,
  workbook: ExcelJS.Workbook
) => {
  // Handle image embedding
  const imageCell = worksheet.getCell(`A${rowIndex}`);
  if (row.imageBase64) {
    try {
      // Add the image to the workbook
      const imageId = workbook.addImage({
        base64: row.imageBase64,
        extension: "jpeg",
      });

      // Embed the image in the cell
      worksheet.addImage(imageId, {
        tl: { col: 0, row: rowIndex - 1 }, // Top-left corner (0-indexed)
        ext: { width: 120, height: 120 }, // Image dimensions
      });

      imageCell.value = ""; // Clear cell value since image is embedded
      worksheet.getRow(rowIndex).height = 90; // Set row height for image
    } catch (error) {
      console.warn(`Failed to embed image for row ${rowIndex}:`, error);
      imageCell.value = "Image Error";
    }
  } else {
    imageCell.value = row.imageS3Key ? "No Image" : "N/A";
  }

  worksheet.getCell(`B${rowIndex}`).value = row.productName;
  worksheet.getCell(`C${rowIndex}`).value = row.variantName;
  worksheet.getCell(`D${rowIndex}`).value = row.brandName;
  worksheet.getCell(`E${rowIndex}`).value = row.category;
  worksheet.getCell(`F${rowIndex}`).value = row.subcategory;
  worksheet.getCell(`G${rowIndex}`).value = row.identifierType || "N/A";
  worksheet.getCell(`H${rowIndex}`).value = row.identifier || "N/A";
  worksheet.getCell(`I${rowIndex}`).value = row.variantSku;
  worksheet.getCell(`J${rowIndex}`).value = row.packaging || "N/A";
  worksheet.getCell(`K${rowIndex}`).value = row.condition || "N/A";
  const msrpCell = worksheet.getCell(`L${rowIndex}`);
  msrpCell.value = row.retailPrice;
  msrpCell.numFmt = "$#,##0.00";
};

const setCurrentOfferCells = (
  worksheet: ExcelJS.Worksheet,
  row: CatalogOfferExcelRow,
  rowIndex: number,
  recipientType: "BUYER" | "SELLER"
) => {
  // Show the other party's offer
  const offerPrice =
    recipientType === "BUYER" ? row.sellerOfferPrice : row.buyerOfferPrice;
  const offerQuantity = row.requestedQuantity;

  // Offered Qty
  const offerQtyCell = worksheet.getCell(`M${rowIndex}`);
  offerQtyCell.value = offerQuantity;
  offerQtyCell.numFmt = "#,##0";

  // Price/Unit
  const offerPriceUnitCell = worksheet.getCell(`N${rowIndex}`);
  offerPriceUnitCell.value = offerPrice;
  offerPriceUnitCell.numFmt = "$#,##0.00";

  // Total Offer
  const offerTotalCell = worksheet.getCell(`O${rowIndex}`);
  offerTotalCell.value = { formula: `N${rowIndex}*M${rowIndex}` };
  offerTotalCell.numFmt = "$#,##0.00";

  // Discount %
  const offerDiscountCell = worksheet.getCell(`P${rowIndex}`);
  offerDiscountCell.value = {
    formula: `IFERROR((L${rowIndex}-N${rowIndex})/L${rowIndex}*100, 0)`,
  };
  offerDiscountCell.numFmt = '0.00"%"';
};

const setYourOfferCells = (
  worksheet: ExcelJS.Worksheet,
  row: CatalogOfferExcelRow,
  rowIndex: number,
  recipientType: "BUYER" | "SELLER"
) => {
  // Show your own offer
  const yourPrice =
    recipientType === "BUYER" ? row.buyerOfferPrice : row.sellerOfferPrice;
  const yourQuantity = row.requestedQuantity;

  // Selected Qty
  const selectedQtyCell = worksheet.getCell(`Q${rowIndex}`);
  selectedQtyCell.value = yourQuantity;
  selectedQtyCell.numFmt = "#,##0";
  selectedQtyCell.border = {
    top: { style: "thin", color: { argb: "FFA6A6A6" } },
    bottom: { style: "thin", color: { argb: "FFA6A6A6" } },
    left: { style: "medium", color: { argb: "FF4A90E2" } },
    right: { style: "thin", color: { argb: "FFA6A6A6" } },
  };

  // Price/Unit
  const priceUnitCell = worksheet.getCell(`R${rowIndex}`);
  priceUnitCell.value = yourPrice;
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
  workbook: ExcelJS.Workbook,
  exportRows: CatalogOfferExcelRow[],
  startRow: number,
  recipientType: "BUYER" | "SELLER",
  onProgress?: (completed: number, total: number) => void
): Promise<void> => {
  for (let i = 0; i < exportRows.length; i++) {
    const row = exportRows[i];
    const rowIndex = startRow + i;

    setProductInfoCells(worksheet, row, rowIndex, workbook);
    setCurrentOfferCells(worksheet, row, rowIndex, recipientType);
    setYourOfferCells(worksheet, row, rowIndex, recipientType);

    onProgress?.(i + 1, exportRows.length);
  }

  const lastDataRow = startRow + exportRows.length - 1;
  if (lastDataRow >= startRow) {
    // Add thick bottom border to your offer section (Q-T = columns 17-20)
    for (let col = 17; col <= 20; col++) {
      const cell = worksheet.getCell(lastDataRow, col);
      if (cell.border) {
        cell.border.bottom = { style: "medium", color: { argb: "FF4A90E2" } };
      }
    }
  }
};

export class CatalogOfferExcelService {
  /**
   * Generate Excel file for catalog offer in the same format as the original excelExportService
   */
  static async generateOfferExcel(
    offerData: CatalogOfferData,
    config: ExcelExportConfig,
    onProgress?: (progress: ExcelGenerationProgress) => void
  ): Promise<ExcelExportResult> {
    const startTime = Date.now();

    try {
      if (!offerData || offerData.items.length === 0) {
        return { success: false, error: "No offer data to export" };
      }

      onProgress?.({
        stage: "initializing",
        progress: 5,
        message: "Initializing export...",
      });

      const workbook = new (await import("exceljs")).Workbook();
      const worksheet = workbook.addWorksheet(config.sheetName);
      createSummaryHeader(worksheet, config.recipientType);

      // Process images if enabled
      let exportRows = transformOfferItemsToRows(offerData);

      if (config.includeImages) {
        onProgress?.({
          stage: "processing_images",
          progress: 20,
          message: "Processing product images...",
        });

        exportRows = await this.processImages(
          exportRows,
          (completed, total) => {
            const imageProgress = 20 + (completed / total) * 20;
            onProgress?.({
              stage: "processing_images",
              progress: imageProgress,
              message: `Processing images: ${completed}/${total}`,
            });
          }
        );
      }

      onProgress?.({
        stage: "generating_excel",
        progress: 40,
        message: "Adding data headers...",
      });

      const headerRow = 5;
      createTableHeaders(worksheet, headerRow, config.recipientType);

      onProgress?.({
        stage: "generating_excel",
        progress: 70,
        message: "Adding offer data...",
      });

      const dataStartRow = headerRow + 3;
      await populateDataRows(
        worksheet,
        workbook,
        exportRows,
        dataStartRow,
        config.recipientType,
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
        stage: "generating_excel",
        progress: 95,
        message: "Preparing download...",
      });

      const excelBuffer = await workbook.xlsx.writeBuffer();
      const fileName = config.fileName;

      return {
        success: true,
        fileName,
        fileBuffer: Buffer.from(excelBuffer),
        fileSize: excelBuffer.byteLength,
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
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  /**
   * Process images for Excel rows using S3ImageService
   */
  private static async processImages(
    exportRows: CatalogOfferExcelRow[],
    onProgress?: (completed: number, total: number) => void
  ): Promise<CatalogOfferExcelRow[]> {
    try {
      // Extract unique S3 keys that need to be processed
      const s3Keys = exportRows
        .map((row) => row.imageS3Key)
        .filter((key): key is string => Boolean(key && key.trim() !== ""));

      if (s3Keys.length === 0) {
        console.log("No images to process");
        onProgress?.(exportRows.length, exportRows.length);
        return exportRows;
      }

      console.log(`Processing ${s3Keys.length} unique images for Excel`);

      // Get image configuration optimized for Excel
      const imageConfig = S3ImageService.getExcelImageConfig();

      // Batch retrieve images
      const imageResults = await S3ImageService.getMultipleImagesAsBase64(
        s3Keys,
        imageConfig.maxWidth,
        imageConfig.maxHeight,
        imageConfig.quality,
        onProgress
      );

      // Update rows with base64 image data
      const processedRows = exportRows.map((row) => {
        if (row.imageS3Key && imageResults.has(row.imageS3Key)) {
          const imageResult = imageResults.get(row.imageS3Key);
          if (imageResult?.success && imageResult.base64Data) {
            return {
              ...row,
              imageBase64: imageResult.base64Data,
            };
          } else {
            console.warn(
              `Failed to process image for ${row.imageS3Key}: ${imageResult?.error}`
            );
          }
        }
        return row;
      });

      const successCount = Array.from(imageResults.values()).filter(
        (r) => r.success
      ).length;
      console.log(
        `Successfully processed ${successCount}/${s3Keys.length} images`
      );

      return processedRows;
    } catch (error) {
      console.error("Error processing images:", error);
      // Return original rows without images if processing fails
      return exportRows;
    }
  }

  /**
   * Generate appropriate filename for the Excel export
   */
  static generateFileName(
    offerData: CatalogOfferData,
    recipientType: "BUYER" | "SELLER"
  ): string {
    const date = new Date().toISOString().split("T")[0];
    const cleanTitle = offerData.catalogListing.title
      .replace(/[^a-zA-Z0-9\s]/g, "")
      .replace(/\s+/g, "_")
      .substring(0, 30);

    return `Catalog_Offer_${recipientType}_${cleanTitle}_${date}.xlsx`;
  }
}
