import * as XLSX from "xlsx";

import { currency_code_type } from "../../lambda-layers/core-layer/nodejs/prisma/generated/client";

/**
 * Utility class for extracting currency information from Excel files
 */
export class ExcelCurrencyExtractor {
  /**
   * Extract currency from Excel cell formatting
   */
  static extractCurrencyFromCell(
    worksheet: XLSX.WorkSheet,
    rowIndex: number,
    columnIndex: number,
    fallbackCurrency: currency_code_type = "USD"
  ): currency_code_type {
    try {
      const cellAddress = XLSX.utils.encode_cell({
        r: rowIndex,
        c: columnIndex,
      });
      const cell = worksheet[cellAddress];

      if (!cell) {
        return fallbackCurrency;
      }

      // Method 1: Check number format (cell.z)
      if (cell.z) {
        const currency = this.parseCurrencyFromFormat(cell.z);
        if (currency) {
          return currency;
        }
      }

      // Method 2: Check formatted value (cell.w)
      if (cell.w && typeof cell.w === "string") {
        const currency = this.parseCurrencyFromFormattedValue(cell.w);
        if (currency) {
          return currency;
        }
      }

      // Method 3: Check raw value if it's a string with currency symbol
      if (cell.v && typeof cell.v === "string") {
        const currency = this.parseCurrencyFromFormattedValue(cell.v);
        if (currency) {
          return currency;
        }
      }

      return fallbackCurrency;
    } catch (error) {
      console.warn("Error extracting currency from cell:", error);
      return fallbackCurrency;
    }
  }

  /**
   * Parse currency from Excel number format
   */
  static parseCurrencyFromFormat(format: string): currency_code_type | null {
    // Common Excel currency formats and their mappings
    const currencyFormatMap: Record<string, currency_code_type> = {
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

      // Mexican Peso formats
      "MX$#,##0.00": "MXN",
      '"MX$"#,##0.00': "MXN",

      // Swiss Franc formats
      "CHF#,##0.00": "CHF",
      '"CHF"#,##0.00': "CHF",

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

    // Pattern matching for common currency symbols
    if (
      format.includes("$") &&
      !format.includes("C$") &&
      !format.includes("MX$") &&
      !format.includes("HK$") &&
      !format.includes("S$") &&
      !format.includes("A$") &&
      !format.includes("NZ$")
    ) {
      return "USD";
    }
    if (format.includes("€")) {
      return "EUR";
    }
    if (format.includes("£")) {
      return "GBP";
    }
    if (format.includes("C$")) {
      return "CAD";
    }
    if (format.includes("¥") && !format.includes("CN¥")) {
      return "JPY";
    }
    if (format.includes("CHF")) {
      return "CHF";
    }
    if (format.includes("MX$")) {
      return "MXN";
    }
    if (format.includes("CN¥")) {
      return "CNY";
    }
    if (format.includes("HK$")) {
      return "HKD";
    }
    if (format.includes("S$")) {
      return "SGD";
    }
    if (format.includes("A$")) {
      return "AUD";
    }
    if (format.includes("NZ$")) {
      return "NZD";
    }

    return null;
  }

  /**
   * Parse currency from formatted string value
   */
  static parseCurrencyFromFormattedValue(
    value: string
  ): currency_code_type | null {
    const trimmedValue = value.trim();

    // Currency symbol detection with regional variations
    if (trimmedValue.startsWith("$") || trimmedValue.endsWith("$")) {
      // Check for specific dollar variants first
      if (trimmedValue.startsWith("C$") || trimmedValue.includes("CAD")) {
        return "CAD";
      }
      if (trimmedValue.startsWith("MX$") || trimmedValue.includes("MXN")) {
        return "MXN";
      }
      if (trimmedValue.startsWith("HK$") || trimmedValue.includes("HKD")) {
        return "HKD";
      }
      if (trimmedValue.startsWith("S$") || trimmedValue.includes("SGD")) {
        return "SGD";
      }
      if (trimmedValue.startsWith("A$") || trimmedValue.includes("AUD")) {
        return "AUD";
      }
      if (trimmedValue.startsWith("NZ$") || trimmedValue.includes("NZD")) {
        return "NZD";
      }
      // Default to USD for plain $ symbol
      return "USD";
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
      if (trimmedValue.includes("CN") || trimmedValue.includes("CNY")) {
        return "CNY";
      }
      return "JPY";
    }

    if (trimmedValue.includes("CHF")) {
      return "CHF";
    }

    // ISO currency codes
    const currencyCodePatterns = [
      { pattern: /\bUSD\b/i, code: "USD" as currency_code_type },
      { pattern: /\bCAD\b/i, code: "CAD" as currency_code_type },
      { pattern: /\bMXN\b/i, code: "MXN" as currency_code_type },
      { pattern: /\bEUR\b/i, code: "EUR" as currency_code_type },
      { pattern: /\bGBP\b/i, code: "GBP" as currency_code_type },
      { pattern: /\bJPY\b/i, code: "JPY" as currency_code_type },
      { pattern: /\bCHF\b/i, code: "CHF" as currency_code_type },
      { pattern: /\bDKK\b/i, code: "DKK" as currency_code_type },
      { pattern: /\bCZK\b/i, code: "CZK" as currency_code_type },
      { pattern: /\bRUB\b/i, code: "RUB" as currency_code_type },
      { pattern: /\bTRY\b/i, code: "TRY" as currency_code_type },
      { pattern: /\bINR\b/i, code: "INR" as currency_code_type },
      { pattern: /\bCNY\b/i, code: "CNY" as currency_code_type },
      { pattern: /\bHKD\b/i, code: "HKD" as currency_code_type },
      { pattern: /\bILS\b/i, code: "ILS" as currency_code_type },
      { pattern: /\bKRW\b/i, code: "KRW" as currency_code_type },
      { pattern: /\bSGD\b/i, code: "SGD" as currency_code_type },
      { pattern: /\bAUD\b/i, code: "AUD" as currency_code_type },
      { pattern: /\bNZD\b/i, code: "NZD" as currency_code_type },
    ];

    for (const { pattern, code } of currencyCodePatterns) {
      if (pattern.test(value)) {
        return code;
      }
    }

    return null;
  }

  /**
   * Parse number with currency formatting support
   */
  static parseNumberWithCurrency(value: any, fieldName: string): number {
    if (typeof value === "number") {
      return value;
    }

    if (typeof value === "string") {
      // Remove currency symbols, commas, and spaces but keep decimal points and negative signs
      const cleanedValue = value
        .replace(/[$€£¥¢₹₽¤]/g, "") // Remove common currency symbols
        .replace(/[,\s]/g, "") // Remove commas and spaces
        .replace(/[A-Z]{2,3}\$?/g, "") // Remove currency codes (USD, CAD, AUD, etc.)
        .replace(/MX|HK|CN|NZ|CHF|AUD|SGD/g, "") // Remove remaining prefixes
        .trim();

      const parsed = parseFloat(cleanedValue);
      if (isNaN(parsed)) {
        throw new Error(`${fieldName} must be a valid number`);
      }
      return parsed;
    }

    throw new Error(`${fieldName} must be a number`);
  }

  /**
   * Parse optional number with currency formatting support
   */
  static parseOptionalNumberWithCurrency(value: any): number | undefined {
    if (value === null || value === undefined || value === "") {
      return undefined;
    }

    try {
      return this.parseNumberWithCurrency(value, "optional field");
    } catch {
      return undefined;
    }
  }

  /**
   * Extract currency for a specific field with row and column indices
   */
  static extractFieldCurrency(
    worksheet: XLSX.WorkSheet,
    rowIndex: number,
    columnName: string,
    headerMap: Record<string, number>,
    fallbackCurrency: currency_code_type = "USD"
  ): currency_code_type {
    const columnIndex = headerMap[columnName];
    if (columnIndex === undefined) {
      return fallbackCurrency;
    }

    return this.extractCurrencyFromCell(
      worksheet,
      rowIndex,
      columnIndex,
      fallbackCurrency
    );
  }
}
