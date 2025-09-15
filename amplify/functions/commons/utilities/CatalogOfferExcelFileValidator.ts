import * as XLSX from "xlsx";

// Define the extracted item type (updated with currency info)
interface ExtractedOfferItem {
  rowNumber: number;
  sku: string;
  productName?: string;
  variant?: string;
  brand?: string;
  category?: string;
  subcategory?: string;
  selectedQuantity: any;
  pricePerUnit: any;
  currency?: string;
  identifier?: string;
  idType?: string;
  msrp: any;
  msrpCurrency?: string;
  packaging?: string;
  condition?: string;
  hasValidOffer: boolean;
  currencyDetectionInfo?: {
    priceFormat?: string;
    priceFormattedValue?: string;
    priceDetectionMethod?: string;
    msrpFormat?: string;
    msrpFormattedValue?: string;
    msrpDetectionMethod?: string;
  };
}

// Define the test result type (updated)
interface ExcelTestResult {
  success: boolean;
  headers: any[];
  subHeaders: any[];
  sampleData: any[];
  headerMapping: Record<string, number>;
  extractedItems: ExtractedOfferItem[];
  errors: string[];
  currencySummary: {
    detectedCurrencies: string[];
    priceColumnCurrencies: Record<number, string>;
    msrpColumnCurrencies: Record<number, string>;
    currencyDetectionMethods: string[];
    totalCurrencyDetections: number;
    currencyConsistency: {
      isConsistent: boolean;
      primaryCurrency?: string;
      inconsistentRows?: number[];
    };
  };
}

/**
 * Validator utility to verify Excel parsing works with the expected file format for catalog offers
 */
export class CatalogOfferExcelFileValidator {
  /**
   * Parse numeric value from string that may contain currency symbols
   */
  private static parseNumericValue(value: any): number {
    if (value === null || value === undefined) {
      return NaN;
    }

    // Convert to string and clean it
    const str = value.toString().trim();

    // Remove currency symbols, commas, and spaces, but keep decimal points and negative signs
    const cleaned = str.replace(/[$€£¥¢₹₽¤,\s]/g, "");

    return Number(cleaned);
  }

  /**
   * Test Excel parsing with the known file structure
   */
  static testExcelParsing(fileBuffer: Buffer): ExcelTestResult {
    const errors: string[] = [];

    try {
      console.log(
        "Testing Excel file parsing with enhanced currency detection..."
      );

      const workbook = XLSX.read(fileBuffer, {
        cellStyles: true,
        cellFormula: true,
        cellDates: true,
        cellNF: true,
        sheetStubs: true,
        raw: false, // Keep formatting for currency detection
      });

      if (workbook.SheetNames.length === 0) {
        errors.push("Excel file contains no sheets");
        return this.createEmptyResult(errors);
      }

      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const data = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        raw: false, // Keep formatting
        rawNumbers: false, // Keep formatted values
        blankrows: false,
      }) as any[][];

      console.log(`Found ${data.length} rows in sheet: ${firstSheetName}`);

      // Find headers row (should contain "SKU" and "Product Name")
      let headerRowIndex = -1;
      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        if (row && row.includes("SKU") && row.includes("Product Name")) {
          headerRowIndex = i;
          break;
        }
      }

      if (headerRowIndex === -1) {
        errors.push("Could not find header row with SKU and Product Name");
        return this.createEmptyResult(errors);
      }

      const headers = data[headerRowIndex];
      const subHeaders = data[headerRowIndex + 1] || [];

      console.log("Headers found at row:", headerRowIndex + 1);
      console.log("Main headers:", headers);
      console.log("Sub headers:", subHeaders);

      // Create header mapping
      const headerMapping = this.createHeaderMapping(headers, subHeaders);
      console.log("Header mapping:", headerMapping);

      // Validate required columns
      const requiredColumns = [
        "SKU",
        "Product Name",
        "Selected Qty",
        "Price/Unit",
      ];
      const missingColumns = requiredColumns.filter(
        (col) => !(col in headerMapping)
      );

      if (missingColumns.length > 0) {
        errors.push(`Missing required columns: ${missingColumns.join(", ")}`);
      }

      // Get data rows
      const dataRows = data
        .slice(headerRowIndex + 2)
        .filter(
          (row) =>
            row &&
            row.length > 0 &&
            row[headerMapping["SKU"]] &&
            row[headerMapping["SKU"]].toString().trim() !== ""
        );

      console.log(`Found ${dataRows.length} data rows with SKU`);

      const currencySummary = {
        detectedCurrencies: new Set<string>(),
        priceColumnCurrencies: {} as Record<number, string>,
        msrpColumnCurrencies: {} as Record<number, string>,
        currencyDetectionMethods: [] as string[],
        totalCurrencyDetections: 0,
        currencyConsistency: {
          isConsistent: true,
          primaryCurrency: undefined as string | undefined,
          inconsistentRows: [] as number[],
        },
      };

      // Extract items with offer data - now with comprehensive currency detection
      const extractedItems: ExtractedOfferItem[] = [];
      dataRows.forEach((row, index) => {
        const sku = row[headerMapping["SKU"]]?.toString()?.trim();
        const selectedQty = row[headerMapping["Selected Qty"]];
        const pricePerUnit = row[headerMapping["Price/Unit"]];
        const msrp = row[headerMapping["MSRP"]];

        // Extract currency information for this row
        const dataRowIndex = headerRowIndex + 2 + index;
        const priceColIndex = headerMapping["Price/Unit"];
        const msrpColIndex = headerMapping["MSRP"];

        let currency: string | undefined;
        let msrpCurrency: string | undefined;
        let currencyDetectionInfo: ExtractedOfferItem["currencyDetectionInfo"] =
          {};

        // Extract currency from Price/Unit column
        if (
          priceColIndex !== undefined &&
          pricePerUnit !== null &&
          pricePerUnit !== undefined
        ) {
          const priceResult = this.extractCurrencyFromCell(
            worksheet,
            dataRowIndex,
            priceColIndex
          );
          currency = priceResult.currency;
          currencyDetectionInfo.priceFormat = priceResult.format;
          currencyDetectionInfo.priceFormattedValue =
            priceResult.formattedValue;
          currencyDetectionInfo.priceDetectionMethod = priceResult.method;

          if (currency) {
            currencySummary.detectedCurrencies.add(currency);
            currencySummary.priceColumnCurrencies[dataRowIndex] = currency;
            currencySummary.currencyDetectionMethods.push(
              `Row ${dataRowIndex + 1}: Price currency detected as ${currency} via ${priceResult.method}`
            );
            currencySummary.totalCurrencyDetections++;

            // Check currency consistency
            if (!currencySummary.currencyConsistency.primaryCurrency) {
              currencySummary.currencyConsistency.primaryCurrency = currency;
            } else if (
              currencySummary.currencyConsistency.primaryCurrency !== currency
            ) {
              currencySummary.currencyConsistency.isConsistent = false;
              currencySummary.currencyConsistency.inconsistentRows!.push(
                dataRowIndex + 1
              );
            }
          }
        }

        // Extract currency from MSRP column
        if (msrpColIndex !== undefined && msrp !== null && msrp !== undefined) {
          const msrpResult = this.extractCurrencyFromCell(
            worksheet,
            dataRowIndex,
            msrpColIndex
          );
          msrpCurrency = msrpResult.currency;
          currencyDetectionInfo.msrpFormat = msrpResult.format;
          currencyDetectionInfo.msrpFormattedValue = msrpResult.formattedValue;
          currencyDetectionInfo.msrpDetectionMethod = msrpResult.method;

          if (msrpCurrency) {
            currencySummary.detectedCurrencies.add(msrpCurrency);
            currencySummary.msrpColumnCurrencies[dataRowIndex] = msrpCurrency;
            currencySummary.currencyDetectionMethods.push(
              `Row ${dataRowIndex + 1}: MSRP currency detected as ${msrpCurrency} via ${msrpResult.method}`
            );
            currencySummary.totalCurrencyDetections++;
          }
        }

        const item: ExtractedOfferItem = {
          rowNumber: headerRowIndex + 3 + index,
          sku: sku || "",
          productName: row[headerMapping["Product Name"]]?.toString()?.trim(),
          variant: row[headerMapping["Variant"]]?.toString()?.trim(),
          brand: row[headerMapping["Brand"]]?.toString()?.trim(),
          category: row[headerMapping["Category"]]?.toString()?.trim(),
          subcategory: row[headerMapping["Subcategory"]]?.toString()?.trim(),
          selectedQuantity: selectedQty,
          pricePerUnit: pricePerUnit,
          currency: currency,
          identifier: row[headerMapping["Identifier"]]?.toString()?.trim(),
          idType: row[headerMapping["ID Type"]]?.toString()?.trim(),
          msrp: msrp,
          msrpCurrency: msrpCurrency,
          packaging: row[headerMapping["Packaging"]]?.toString()?.trim(),
          condition: row[headerMapping["Condition"]]?.toString()?.trim(),
          hasValidOffer: this.isValidOfferData(selectedQty, pricePerUnit),
          currencyDetectionInfo: currencyDetectionInfo,
        };

        extractedItems.push(item);
      });

      const validOfferItems = extractedItems.filter(
        (item) => item.hasValidOffer
      );
      console.log(
        `Found ${validOfferItems.length} items with valid offer data out of ${extractedItems.length} total items`
      );

      console.log("Currency Detection Summary:");
      console.log(
        "- Detected currencies:",
        Array.from(currencySummary.detectedCurrencies)
      );
      console.log(
        "- Total currency detections:",
        currencySummary.totalCurrencyDetections
      );
      console.log(
        "- Currency consistency:",
        currencySummary.currencyConsistency.isConsistent
      );

      if (!currencySummary.currencyConsistency.isConsistent) {
        console.log(
          "- Primary currency:",
          currencySummary.currencyConsistency.primaryCurrency
        );
        console.log(
          "- Inconsistent rows:",
          currencySummary.currencyConsistency.inconsistentRows
        );
      }

      if (validOfferItems.length > 0) {
        console.log("Sample valid offer item with currency:", {
          sku: validOfferItems[0].sku,
          price: validOfferItems[0].pricePerUnit,
          currency: validOfferItems[0].currency,
          detectionMethod:
            validOfferItems[0].currencyDetectionInfo?.priceDetectionMethod,
        });
      }

      return {
        success: errors.length === 0,
        headers,
        subHeaders,
        sampleData: dataRows.slice(0, 3), // First 3 data rows for inspection
        headerMapping,
        extractedItems,
        errors,
        currencySummary: {
          detectedCurrencies: Array.from(currencySummary.detectedCurrencies),
          priceColumnCurrencies: currencySummary.priceColumnCurrencies,
          msrpColumnCurrencies: currencySummary.msrpColumnCurrencies,
          currencyDetectionMethods: currencySummary.currencyDetectionMethods,
          totalCurrencyDetections: currencySummary.totalCurrencyDetections,
          currencyConsistency: {
            isConsistent: currencySummary.currencyConsistency.isConsistent,
            primaryCurrency:
              currencySummary.currencyConsistency.primaryCurrency,
            inconsistentRows:
              currencySummary.currencyConsistency.inconsistentRows,
          },
        },
      };
    } catch (error) {
      errors.push(
        `Excel parsing failed: ${error instanceof Error ? error.message : String(error)}`
      );
      return this.createEmptyResult(errors);
    }
  }

  /**
   * Create empty result structure
   */
  private static createEmptyResult(errors: string[]): ExcelTestResult {
    return {
      success: false,
      headers: [],
      subHeaders: [],
      sampleData: [],
      headerMapping: {},
      extractedItems: [],
      errors,
      currencySummary: {
        detectedCurrencies: [],
        priceColumnCurrencies: {},
        msrpColumnCurrencies: {},
        currencyDetectionMethods: [],
        totalCurrencyDetections: 0,
        currencyConsistency: {
          isConsistent: true,
          primaryCurrency: undefined,
          inconsistentRows: [],
        },
      },
    };
  }

  /**
   * Extract currency from Excel cell
   */
  private static extractCurrencyFromCell(
    worksheet: XLSX.WorkSheet,
    dataRowIndex: number,
    columnIndex: number
  ): {
    currency?: string;
    format?: string;
    formattedValue?: string;
    method: string;
  } {
    try {
      // Convert array indices to Excel cell address
      const cellAddress = XLSX.utils.encode_cell({
        r: dataRowIndex,
        c: columnIndex,
      });
      const cell = worksheet[cellAddress];

      if (!cell) {
        return { method: "no_cell" };
      }

      // Method 1: Check number format (cell.z) - Highest priority
      if (cell.z) {
        const currency = this.parseCurrencyFromFormat(cell.z);
        if (currency) {
          return {
            currency,
            format: cell.z,
            formattedValue: cell.w,
            method: "number_format",
          };
        }
      }

      // Method 2: Check formatted value (cell.w) - Medium priority
      if (cell.w && typeof cell.w === "string") {
        const currency = this.parseCurrencyFromFormattedValue(cell.w);
        if (currency) {
          return {
            currency,
            format: cell.z,
            formattedValue: cell.w,
            method: "formatted_value",
          };
        }
      }

      // Method 3: Check raw value if it's a string with currency symbol - Lowest priority
      if (cell.v && typeof cell.v === "string") {
        const currency = this.parseCurrencyFromFormattedValue(cell.v);
        if (currency) {
          return {
            currency,
            format: cell.z,
            formattedValue: cell.w,
            method: "raw_value",
          };
        }
      }

      return {
        format: cell.z,
        formattedValue: cell.w,
        method: "no_currency_detected",
      };
    } catch (error) {
      return {
        method: "error",
        format: `Error: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  /**
   * Parse currency from Excel number format
   */
  private static parseCurrencyFromFormat(format: string): string | null {
    // Common Excel currency formats and their mappings
    const currencyFormatMap: Record<string, string> = {
      // US Dollar formats
      "$#,##0.00": "USD",
      "$#,##0": "USD",
      "[$-409]$#,##0.00": "USD",
      '"$"#,##0.00': "USD",
      '"$"#,##0': "USD",

      // Euro formats
      "€#,##0.00": "EUR",
      "€#,##0": "EUR",
      "[$-407]€#,##0.00": "EUR",
      '"€"#,##0.00': "EUR",

      // British Pound formats
      "£#,##0.00": "GBP",
      "£#,##0": "GBP",
      "[$-809]£#,##0.00": "GBP",
      '"£"#,##0.00': "GBP",

      // Canadian Dollar formats
      "C$#,##0.00": "CAD",
      "C$#,##0": "CAD",
      '"C$"#,##0.00': "CAD",

      // Japanese Yen formats
      "¥#,##0": "JPY",
      "¥#,##0.00": "JPY",
      '"¥"#,##0': "JPY",

      // Swiss Franc formats
      "CHF#,##0.00": "CHF",
      '"CHF"#,##0.00': "CHF",

      // Mexican Peso formats
      "MX$#,##0.00": "MXN",
      '"MX$"#,##0.00': "MXN",

      // Chinese Yuan formats
      "CN¥#,##0.00": "CNY",
      '"CN¥"#,##0.00': "CNY",

      // Hong Kong Dollar formats
      "HK$#,##0.00": "HKD",
      '"HK$"#,##0.00': "HKD",

      // Singapore Dollar formats
      "S$#,##0.00": "SGD",
      '"S$"#,##0.00': "SGD",

      // Australian Dollar formats
      "A$#,##0.00": "AUD",
      '"A$"#,##0.00': "AUD",

      // New Zealand Dollar formats
      "NZ$#,##0.00": "NZD",
      '"NZ$"#,##0.00': "NZD",
    };

    // Direct format match
    if (currencyFormatMap[format]) {
      return currencyFormatMap[format];
    }

    // Pattern matching for common currency symbols with regional specificity
    if (format.includes("$")) {
      if (format.includes("C$")) return "CAD";
      if (format.includes("MX$")) return "MXN";
      if (format.includes("HK$")) return "HKD";
      if (format.includes("S$")) return "SGD";
      if (format.includes("A$")) return "AUD";
      if (format.includes("NZ$")) return "NZD";
      return "USD"; // Default for plain $ symbol
    }
    if (format.includes("€")) return "EUR";
    if (format.includes("£")) return "GBP";
    if (format.includes("¥")) {
      if (format.includes("CN¥")) return "CNY";
      return "JPY";
    }
    if (format.includes("CHF")) return "CHF";

    return null;
  }

  /**
   * Parse currency from formatted string value
   */
  private static parseCurrencyFromFormattedValue(value: string): string | null {
    const trimmedValue = value.trim();

    // Currency symbol detection with regional variations
    if (trimmedValue.startsWith("$") || trimmedValue.endsWith("$")) {
      // Check for specific dollar variants first
      if (trimmedValue.startsWith("C$") || trimmedValue.includes("CAD"))
        return "CAD";
      if (trimmedValue.startsWith("MX$") || trimmedValue.includes("MXN"))
        return "MXN";
      if (trimmedValue.startsWith("HK$") || trimmedValue.includes("HKD"))
        return "HKD";
      if (trimmedValue.startsWith("S$") || trimmedValue.includes("SGD"))
        return "SGD";
      if (trimmedValue.startsWith("A$") || trimmedValue.includes("AUD"))
        return "AUD";
      if (trimmedValue.startsWith("NZ$") || trimmedValue.includes("NZD"))
        return "NZD";
      return "USD"; // Default to USD for plain $ symbol
    }

    if (
      trimmedValue.startsWith("€") ||
      trimmedValue.endsWith("€") ||
      trimmedValue.includes("EUR")
    ) {
      return "EUR";
    }

    if (
      trimmedValue.startsWith("£") ||
      trimmedValue.endsWith("£") ||
      trimmedValue.includes("GBP")
    ) {
      return "GBP";
    }

    if (trimmedValue.startsWith("¥") || trimmedValue.endsWith("¥")) {
      // Check for Chinese Yuan vs Japanese Yen
      if (trimmedValue.includes("CN") || trimmedValue.includes("CNY"))
        return "CNY";
      return "JPY";
    }

    if (trimmedValue.includes("CHF")) return "CHF";

    // ISO currency codes with word boundaries
    const currencyCodePatterns = [
      { pattern: /\bUSD\b/i, currency: "USD" },
      { pattern: /\bCAD\b/i, currency: "CAD" },
      { pattern: /\bMXN\b/i, currency: "MXN" },
      { pattern: /\bEUR\b/i, currency: "EUR" },
      { pattern: /\bGBP\b/i, currency: "GBP" },
      { pattern: /\bJPY\b/i, currency: "JPY" },
      { pattern: /\bCHF\b/i, currency: "CHF" },
      { pattern: /\bDKK\b/i, currency: "DKK" },
      { pattern: /\bCZK\b/i, currency: "CZK" },
      { pattern: /\bRUB\b/i, currency: "RUB" },
      { pattern: /\bTRY\b/i, currency: "TRY" },
      { pattern: /\bINR\b/i, currency: "INR" },
      { pattern: /\bCNY\b/i, currency: "CNY" },
      { pattern: /\bHKD\b/i, currency: "HKD" },
      { pattern: /\bILS\b/i, currency: "ILS" },
      { pattern: /\bKRW\b/i, currency: "KRW" },
      { pattern: /\bSGD\b/i, currency: "SGD" },
      { pattern: /\bAUD\b/i, currency: "AUD" },
      { pattern: /\bNZD\b/i, currency: "NZD" },
    ];

    for (const { pattern, currency } of currencyCodePatterns) {
      if (pattern.test(value)) {
        return currency;
      }
    }

    return null;
  }

  /**
   * Create header mapping from main headers and sub-headers
   */
  private static createHeaderMapping(
    headers: any[],
    subHeaders: any[]
  ): Record<string, number> {
    const headerMap: Record<string, number> = {};

    // First pass - map main headers
    headers.forEach((header, index) => {
      if (header && typeof header === "string" && header.trim() !== "") {
        headerMap[header.trim()] = index;
      }
    });

    // Second pass - map sub-headers (prioritize them for specific columns we need)
    subHeaders.forEach((subHeader, index) => {
      if (
        subHeader &&
        typeof subHeader === "string" &&
        subHeader.trim() !== ""
      ) {
        const subHeaderKey = subHeader.trim();

        // Always map important sub-headers, even if main header exists
        // This is crucial for "Selected Qty" and "Price/Unit" which are under "Your Offer"
        const importantSubHeaders = [
          "Selected Qty",
          "Price/Unit",
          "Total Price",
          "% Off",
        ];

        if (
          importantSubHeaders.includes(subHeaderKey) ||
          !headers[index] ||
          headers[index] === null ||
          headers[index] === ""
        ) {
          headerMap[subHeaderKey] = index;
        }
      }
    });

    return headerMap;
  }

  /**
   * Check if offer data is valid
   */
  private static isValidOfferData(
    selectedQty: any,
    pricePerUnit: any
  ): boolean {
    if (
      selectedQty === null ||
      selectedQty === undefined ||
      pricePerUnit === null ||
      pricePerUnit === undefined
    ) {
      return false;
    }

    const qty = this.parseNumericValue(selectedQty);
    const price = this.parseNumericValue(pricePerUnit);

    return !isNaN(qty) && !isNaN(price) && qty > 0 && price > 0;
  }

  /**
   * Generate a comprehensive summary report
   */
  static generateSummaryReport(testResult: ExcelTestResult): string {
    const { success, headers, extractedItems, errors, currencySummary } =
      testResult;

    const validOffers = extractedItems.filter((item) => item.hasValidOffer);
    const totalItems = extractedItems.length;
    const itemsWithCurrency = extractedItems.filter(
      (item) => item.currency
    ).length;

    let report = `
Excel File Analysis Summary
===========================

Status: ${success ? "✅ SUCCESS" : "❌ FAILED"}
Total Rows with Data: ${totalItems}
Valid Offer Items: ${validOffers.length}
Success Rate: ${totalItems > 0 ? ((validOffers.length / totalItems) * 100).toFixed(1) : 0}%

Headers Found: ${headers.length}
Required Columns Status:
- SKU: ${testResult.headerMapping["SKU"] !== undefined ? "✅" : "❌"}
- Product Name: ${testResult.headerMapping["Product Name"] !== undefined ? "✅" : "❌"}
- Selected Qty: ${testResult.headerMapping["Selected Qty"] !== undefined ? "✅" : "❌"}
- Price/Unit: ${testResult.headerMapping["Price/Unit"] !== undefined ? "✅" : "❌"}

Currency Detection Summary:
===========================
Detected Currencies: ${currencySummary.detectedCurrencies.join(", ") || "None"}
Items with Currency: ${itemsWithCurrency}/${totalItems} (${totalItems > 0 ? ((itemsWithCurrency / totalItems) * 100).toFixed(1) : 0}%)
Total Currency Detections: ${currencySummary.totalCurrencyDetections}
Currency Consistency: ${currencySummary.currencyConsistency.isConsistent ? "✅ Consistent" : "⚠️ Mixed currencies detected"}

`;

    if (currencySummary.currencyConsistency.primaryCurrency) {
      report += `Primary Currency: ${currencySummary.currencyConsistency.primaryCurrency}\n`;
    }

    if (
      !currencySummary.currencyConsistency.isConsistent &&
      currencySummary.currencyConsistency.inconsistentRows!.length > 0
    ) {
      report += `Inconsistent Currency Rows: ${currencySummary.currencyConsistency.inconsistentRows!.join(", ")}\n`;
    }

    if (currencySummary.currencyDetectionMethods.length > 0) {
      report += `\nCurrency Detection Details:\n`;
      const methodsToShow = currencySummary.currencyDetectionMethods.slice(
        0,
        10
      ); // Show first 10
      methodsToShow.forEach((method) => {
        report += `- ${method}\n`;
      });

      if (currencySummary.currencyDetectionMethods.length > 10) {
        report += `... and ${currencySummary.currencyDetectionMethods.length - 10} more detections\n`;
      }
    }

    if (errors.length > 0) {
      report += `\nErrors:\n${errors.map((e) => `- ${e}`).join("\n")}\n`;
    }

    if (validOffers.length > 0) {
      report += `\nSample Valid Offers with Currency Info:\n`;
      validOffers.slice(0, 5).forEach((item, index) => {
        const currencyInfo = item.currency
          ? `${item.currency} (${item.currencyDetectionInfo?.priceDetectionMethod || "unknown method"})`
          : "Not detected";
        const msrpInfo = item.msrpCurrency
          ? `, MSRP: ${item.msrp} ${item.msrpCurrency}`
          : item.msrp
            ? `, MSRP: ${item.msrp} (no currency)`
            : "";

        report += `${index + 1}. SKU: ${item.sku}\n`;
        report += `   Price: ${item.pricePerUnit} (Currency: ${currencyInfo})${msrpInfo}\n`;
        report += `   Quantity: ${item.selectedQuantity}\n`;
      });
    }

    // Currency validation recommendations
    report += `\nCurrency Validation Recommendations:\n`;
    if (currencySummary.detectedCurrencies.length === 0) {
      report += `⚠️  No currencies detected - verify Excel formatting includes currency symbols\n`;
    } else if (currencySummary.detectedCurrencies.length === 1) {
      report += `✅ Single currency detected - ready for processing\n`;
    } else {
      report += `⚠️  Multiple currencies detected - may need currency conversion or separate processing\n`;
    }

    if (itemsWithCurrency < totalItems && totalItems > 0) {
      const missingCurrencyCount = totalItems - itemsWithCurrency;
      report += `⚠️  ${missingCurrencyCount} items missing currency information - will default to USD\n`;
    }

    return report;
  }

  /**
   * Validate currency consistency across all items
   */
  static validateCurrencyConsistency(testResult: ExcelTestResult): {
    isValid: boolean;
    warnings: string[];
    recommendations: string[];
  } {
    const warnings: string[] = [];
    const recommendations: string[] = [];

    const { currencySummary, extractedItems } = testResult;

    // Check for missing currencies
    const itemsWithoutCurrency = extractedItems.filter(
      (item) => !item.currency
    );
    if (itemsWithoutCurrency.length > 0) {
      warnings.push(
        `${itemsWithoutCurrency.length} items are missing currency information`
      );
      recommendations.push(
        "Ensure Excel cells have proper currency formatting (e.g., $#,##0.00)"
      );
    }

    // Check for mixed currencies
    if (currencySummary.detectedCurrencies.length > 1) {
      warnings.push(
        `Multiple currencies detected: ${currencySummary.detectedCurrencies.join(", ")}`
      );
      recommendations.push(
        "Consider processing each currency separately or implement currency conversion"
      );
    }

    // Check for MSRP currency mismatches
    const msrpMismatches = extractedItems.filter(
      (item) =>
        item.currency &&
        item.msrpCurrency &&
        item.currency !== item.msrpCurrency
    );
    if (msrpMismatches.length > 0) {
      warnings.push(
        `${msrpMismatches.length} items have different currencies for price and MSRP`
      );
      recommendations.push(
        "Verify MSRP and price currencies are consistent within each row"
      );
    }

    // Check detection method reliability
    const unreliableDetections = extractedItems.filter(
      (item) =>
        item.currencyDetectionInfo?.priceDetectionMethod === "raw_value" ||
        item.currencyDetectionInfo?.priceDetectionMethod ===
          "no_currency_detected"
    );
    if (unreliableDetections.length > 0) {
      warnings.push(
        `${unreliableDetections.length} items have low-confidence currency detection`
      );
      recommendations.push(
        "Apply proper Excel number formatting to improve currency detection accuracy"
      );
    }

    const isValid = warnings.length === 0;

    return {
      isValid,
      warnings,
      recommendations,
    };
  }

  /**
   * Generate detailed currency detection report
   */
  static generateCurrencyDetectionReport(testResult: ExcelTestResult): string {
    const { currencySummary, extractedItems } = testResult;

    let report = `
Detailed Currency Detection Report
=================================

Overall Statistics:
- Total items analyzed: ${extractedItems.length}
- Items with currency detected: ${extractedItems.filter((item) => item.currency).length}
- Unique currencies found: ${currencySummary.detectedCurrencies.length}
- Total currency detections: ${currencySummary.totalCurrencyDetections}

`;

    // Detection method breakdown
    const methodCounts = extractedItems.reduce(
      (acc, item) => {
        const method =
          item.currencyDetectionInfo?.priceDetectionMethod || "unknown";
        acc[method] = (acc[method] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    report += `Detection Method Breakdown:\n`;
    Object.entries(methodCounts).forEach(([method, count]) => {
      const percentage = ((count / extractedItems.length) * 100).toFixed(1);
      report += `- ${method}: ${count} items (${percentage}%)\n`;
    });

    // Currency distribution
    if (currencySummary.detectedCurrencies.length > 0) {
      report += `\nCurrency Distribution:\n`;
      currencySummary.detectedCurrencies.forEach((currency) => {
        const itemsWithCurrency = extractedItems.filter(
          (item) => item.currency === currency || item.msrpCurrency === currency
        ).length;
        report += `- ${currency}: ${itemsWithCurrency} occurrences\n`;
      });
    }

    // Consistency analysis
    report += `\nConsistency Analysis:\n`;
    report += `- Currency consistency: ${currencySummary.currencyConsistency.isConsistent ? "✅ Consistent" : "❌ Inconsistent"}\n`;

    if (currencySummary.currencyConsistency.primaryCurrency) {
      report += `- Primary currency: ${currencySummary.currencyConsistency.primaryCurrency}\n`;
    }

    if (
      currencySummary.currencyConsistency.inconsistentRows &&
      currencySummary.currencyConsistency.inconsistentRows.length > 0
    ) {
      report += `- Inconsistent rows: ${currencySummary.currencyConsistency.inconsistentRows.join(", ")}\n`;
    }

    // Sample detections
    const samplesWithCurrency = extractedItems
      .filter((item) => item.currency)
      .slice(0, 3);
    if (samplesWithCurrency.length > 0) {
      report += `\nSample Currency Detections:\n`;
      samplesWithCurrency.forEach((item, index) => {
        report += `${index + 1}. Row ${item.rowNumber}: ${item.sku}\n`;
        report += `   Price: ${item.pricePerUnit} → ${item.currency} (via ${item.currencyDetectionInfo?.priceDetectionMethod})\n`;
        if (item.currencyDetectionInfo?.priceFormat) {
          report += `   Excel format: "${item.currencyDetectionInfo.priceFormat}"\n`;
        }
        if (item.msrp && item.msrpCurrency) {
          report += `   MSRP: ${item.msrp} → ${item.msrpCurrency} (via ${item.currencyDetectionInfo?.msrpDetectionMethod})\n`;
        }
        report += `\n`;
      });
    }

    return report;
  }

  /**
   * Quick validation for production use
   */
  static quickCurrencyValidation(fileBuffer: Buffer): {
    success: boolean;
    primaryCurrency?: string;
    currencyCount: number;
    itemsWithCurrency: number;
    totalItems: number;
    warnings: string[];
  } {
    try {
      const testResult = this.testExcelParsing(fileBuffer);
      const validation = this.validateCurrencyConsistency(testResult);

      return {
        success: testResult.success && validation.isValid,
        primaryCurrency:
          testResult.currencySummary.currencyConsistency.primaryCurrency,
        currencyCount: testResult.currencySummary.detectedCurrencies.length,
        itemsWithCurrency: testResult.extractedItems.filter(
          (item) => item.currency
        ).length,
        totalItems: testResult.extractedItems.length,
        warnings: validation.warnings,
      };
    } catch (error) {
      return {
        success: false,
        currencyCount: 0,
        itemsWithCurrency: 0,
        totalItems: 0,
        warnings: [
          `Validation failed: ${error instanceof Error ? error.message : String(error)}`,
        ],
      };
    }
  }
}
