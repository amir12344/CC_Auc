import * as XLSX from "xlsx";

import {
  currency_code_type,
  PrismaClient,
} from "../../../lambda-layers/core-layer/nodejs/prisma/generated/client";

export interface OfferFileItem {
  sku: string;
  productName: string;
  variant?: string;
  brand: string;
  category: string;
  subcategory: string;
  selectedQuantity: number;
  pricePerUnit: number;
  currency: currency_code_type;
  identifier?: string;
  idType?: string;
  msrp?: number;
  msrpCurrency?: currency_code_type;
  packaging?: string;
  condition?: string;
}

export interface ParsedOfferFile {
  items: OfferFileItem[];
  totalItems: number;
  validItems: number;
  errors: Array<{
    row: number;
    sku?: string;
    error: string;
  }>;
  currenciesDetected: currency_code_type[];
}

export interface VariantLookupResult {
  catalogProductVariantId: string;
  variantSku: string;
  productTitle: string;
  brandName: string;
  availableQuantity: number | null;
  minOrderQuantity: number | null;
  maxOrderQuantity: number | null;
  isActive: boolean;
  catalogListingId: string;
}

export interface ValidatedOfferItem {
  variantData: VariantLookupResult;
  requestedQuantity: number;
  buyerOfferPrice: number;
  buyerOfferPriceCurrency: currency_code_type;
  originalFileData: OfferFileItem;
}

export interface FileValidationResult {
  isValid: boolean;
  errors: Array<{
    code: string;
    message: string;
    details?: any;
  }>;
  validatedItems: ValidatedOfferItem[];
  totalOfferValue: number;
  currency: currency_code_type;
}

export class CatalogOfferUploadOperations {
  constructor(private prisma: PrismaClient) {}

  /**
   * Parse Excel file and extract offer items
   */
  async parseOfferFile(
    fileBuffer: Buffer,
    fileName: string
  ): Promise<ParsedOfferFile> {
    try {
      if (
        !fileName.toLowerCase().endsWith(".xlsx") &&
        !fileName.toLowerCase().endsWith(".xls")
      ) {
        throw new Error("Only Excel files (.xlsx, .xls) are supported");
      }

      const workbook = XLSX.read(fileBuffer, {
        cellStyles: true,
        cellFormula: true,
        cellDates: true,
        cellNF: true,
        sheetStubs: true,
        raw: false, // Set to false to preserve cell formatting
      });

      if (workbook.SheetNames.length === 0) {
        throw new Error("Excel file contains no sheets");
      }

      // Use first sheet
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      // Parse with raw cell access for currency detection
      const data = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        rawNumbers: false, // Keep formatted values for currency detection
        raw: false, // Preserve formatting
        blankrows: false,
      }) as any[][];

      // Pass worksheet for currency extraction
      return this.parseSheetData(data, worksheet);
    } catch (error) {
      throw new Error(
        `Failed to parse Excel file: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Parse sheet data and extract offer items
   * Added worksheet parameter for currency extraction
   */
  private parseSheetData(
    data: any[][],
    worksheet: XLSX.WorkSheet
  ): ParsedOfferFile {
    const result: ParsedOfferFile = {
      items: [],
      totalItems: 0,
      validItems: 0,
      errors: [],
      currenciesDetected: [],
    };

    // Find headers row
    let headerRowIndex = -1;
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      if (row && row.includes("SKU") && row.includes("Product Name")) {
        headerRowIndex = i;
        break;
      }
    }

    if (headerRowIndex === -1) {
      result.errors.push({
        row: 0,
        error:
          "Required headers not found. Expected headers include: SKU, Product Name, Selected Qty, Price/Unit",
      });
      return result;
    }

    const headers = data[headerRowIndex];
    const subHeaders = data[headerRowIndex + 1] || [];

    // Create complete header mapping
    const headerMap = this.createHeaderMapping(headers, subHeaders);

    // Validate required columns
    const requiredColumns = [
      "SKU",
      "Product Name",
      "Selected Qty",
      "Price/Unit",
    ];
    const missingColumns = requiredColumns.filter((col) => !(col in headerMap));

    if (missingColumns.length > 0) {
      result.errors.push({
        row: headerRowIndex,
        error: `Missing required columns: ${missingColumns.join(", ")}`,
      });
      return result;
    }

    // Parse data rows
    const dataRows = data.slice(headerRowIndex + 2);
    const currenciesFound = new Set<currency_code_type>();

    dataRows.forEach((row, index) => {
      const rowNumber = headerRowIndex + 3 + index; // Actual row number in Excel

      if (!row || row.length === 0 || !this.hasValidData(row, headerMap)) {
        return; // Skip empty rows
      }

      try {
        // Pass worksheet and row info for currency extraction
        const item = this.parseDataRow(
          row,
          headerMap,
          rowNumber,
          worksheet,
          headerRowIndex + 2 + index
        );
        if (item) {
          result.items.push(item);
          result.validItems++;

          // Track currencies
          currenciesFound.add(item.currency);
          if (item.msrpCurrency) {
            currenciesFound.add(item.msrpCurrency);
          }
        }
      } catch (error) {
        result.errors.push({
          row: rowNumber,
          sku: row[headerMap["SKU"]]?.toString(),
          error: error instanceof Error ? error.message : String(error),
        });
      }

      result.totalItems++;
    });

    // Set detected currencies
    result.currenciesDetected = Array.from(currenciesFound);

    return result;
  }

  /**
   * Create header mapping from main headers and sub-headers
   */
  private createHeaderMapping(
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
   * Check if row has valid data
   */
  private hasValidData(row: any[], headerMap: Record<string, number>): boolean {
    const sku = row[headerMap["SKU"]];
    return sku && typeof sku === "string" && sku.trim() !== "";
  }

  /**
   * Parse individual data row
   * Added worksheet and dataRowIndex parameters for currency extraction
   */
  private parseDataRow(
    row: any[],
    headerMap: Record<string, number>,
    rowNumber: number,
    worksheet: XLSX.WorkSheet,
    dataRowIndex: number
  ): OfferFileItem | null {
    const sku = row[headerMap["SKU"]]?.toString()?.trim();
    const selectedQuantity = row[headerMap["Selected Qty"]];
    const pricePerUnit = row[headerMap["Price/Unit"]];

    if (!sku) {
      throw new Error("SKU is required");
    }

    // Check if this row has offer data (selected quantity and price)
    if (
      selectedQuantity === null ||
      selectedQuantity === undefined ||
      pricePerUnit === null ||
      pricePerUnit === undefined
    ) {
      return null; // Skip rows without offer data
    }

    const quantity = this.parseNumber(selectedQuantity, "Selected Qty");
    const price = this.parseNumber(pricePerUnit, "Price/Unit");

    if (quantity <= 0) {
      throw new Error("Selected Qty must be greater than 0");
    }

    if (price <= 0) {
      throw new Error("Price/Unit must be greater than 0");
    }

    const productName = row[headerMap["Product Name"]]?.toString()?.trim();
    if (!productName) {
      throw new Error("Product Name is required");
    }

    const brand = row[headerMap["Brand"]]?.toString()?.trim();
    if (!brand) {
      throw new Error("Brand is required");
    }

    const category = row[headerMap["Category"]]?.toString()?.trim();
    if (!category) {
      throw new Error("Category is required");
    }

    const subcategory = row[headerMap["Subcategory"]]?.toString()?.trim();
    if (!subcategory) {
      throw new Error("Subcategory is required");
    }

    // Extract currency from Excel cell formatting
    const priceColumnIndex = headerMap["Price/Unit"];
    const extractedCurrency = this.extractCurrencyFromCell(
      worksheet,
      dataRowIndex,
      priceColumnIndex,
      "USD" // fallback currency
    );

    // Extract MSRP currency if MSRP exists
    let msrpValue: number | undefined;
    let msrpCurrency: currency_code_type | undefined;

    if (headerMap["MSRP"] !== undefined) {
      const msrpRaw = row[headerMap["MSRP"]];
      if (msrpRaw !== null && msrpRaw !== undefined && msrpRaw !== "") {
        msrpValue = this.parseOptionalNumber(msrpRaw);
        if (msrpValue !== undefined) {
          msrpCurrency = this.extractCurrencyFromCell(
            worksheet,
            dataRowIndex,
            headerMap["MSRP"],
            extractedCurrency // use same currency as price by default
          );
        }
      }
    }

    return {
      sku,
      productName,
      variant: row[headerMap["Variant"]]?.toString()?.trim(),
      brand,
      category,
      subcategory,
      selectedQuantity: quantity,
      pricePerUnit: price,
      currency: extractedCurrency, // Use extracted currency
      identifier: row[headerMap["Identifier"]]?.toString()?.trim(),
      idType: row[headerMap["ID Type"]]?.toString()?.trim(),
      msrp: msrpValue,
      msrpCurrency: msrpCurrency, // MSRP currency
      packaging: row[headerMap["Packaging"]]?.toString()?.trim(),
      condition: row[headerMap["Condition"]]?.toString()?.trim(),
    };
  }

  /**
   * Extract currency from Excel cell formatting
   */
  private extractCurrencyFromCell(
    worksheet: XLSX.WorkSheet,
    dataRowIndex: number,
    columnIndex: number,
    fallbackCurrency: currency_code_type = "USD"
  ): currency_code_type {
    try {
      // Convert array indices to Excel cell address
      const cellAddress = XLSX.utils.encode_cell({
        r: dataRowIndex,
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
  private parseCurrencyFromFormat(format: string): currency_code_type | null {
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
  private parseCurrencyFromFormattedValue(
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
      /\bUSD\b/i,
      /\bCAD\b/i,
      /\bMXN\b/i,
      /\bEUR\b/i,
      /\bGBP\b/i,
      /\bJPY\b/i,
      /\bCHF\b/i,
      /\bDKK\b/i,
      /\bCZK\b/i,
      /\bRUB\b/i,
      /\bTRY\b/i,
      /\bINR\b/i,
      /\bCNY\b/i,
      /\bHKD\b/i,
      /\bILS\b/i,
      /\bKRW\b/i,
      /\bSGD\b/i,
      /\bAUD\b/i,
      /\bNZD\b/i,
    ];

    for (const pattern of currencyCodePatterns) {
      const match = value.match(pattern);
      if (match) {
        return match[0].toUpperCase() as currency_code_type;
      }
    }

    return null;
  }

  /**
   * Parse number with validation (handles currency-formatted strings)
   */
  private parseNumber(value: any, fieldName: string): number {
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
   * Parse optional number (handles currency formatting)
   */
  private parseOptionalNumber(value: any): number | undefined {
    if (value === null || value === undefined || value === "") {
      return undefined;
    }

    try {
      return this.parseNumber(value, "optional field");
    } catch {
      return undefined;
    }
  }

  /**
   * Validate offer items against catalog listing
   */
  async validateOfferItems(
    items: OfferFileItem[],
    catalogListingPublicId: string
  ): Promise<FileValidationResult> {
    const result: FileValidationResult = {
      isValid: true,
      errors: [],
      validatedItems: [],
      totalOfferValue: 0,
      currency: "USD",
    };

    try {
      // Get catalog listing
      const catalogListing = await this.prisma.catalog_listings.findUnique({
        where: { public_id: catalogListingPublicId },
        select: {
          catalog_listing_id: true,
          title: true,
          status: true,
          minimum_order_value: true,
          minimum_order_value_currency: true,
        },
      });

      if (!catalogListing) {
        result.isValid = false;
        result.errors.push({
          code: "CATALOG_LISTING_NOT_FOUND",
          message: "Catalog listing not found",
        });
        return result;
      }

      if (catalogListing.status !== "ACTIVE") {
        result.isValid = false;
        result.errors.push({
          code: "CATALOG_LISTING_INACTIVE",
          message: "Catalog listing is not active",
        });
        return result;
      }

      // Validate each item
      for (const item of items) {
        try {
          const variantData = await this.findVariantBySku(
            item.sku,
            catalogListing.catalog_listing_id
          );

          if (!variantData) {
            result.errors.push({
              code: "VARIANT_NOT_FOUND",
              message: `Product variant with SKU '${item.sku}' not found in this catalog listing`,
              details: { sku: item.sku },
            });
            continue;
          }

          // Validate inventory
          if (
            variantData.availableQuantity !== null &&
            item.selectedQuantity > variantData.availableQuantity
          ) {
            result.errors.push({
              code: "INSUFFICIENT_INVENTORY",
              message: `Insufficient inventory for SKU '${item.sku}'. Available: ${variantData.availableQuantity}, Requested: ${item.selectedQuantity}`,
              details: {
                sku: item.sku,
                available: variantData.availableQuantity,
                requested: item.selectedQuantity,
              },
            });
            continue;
          }

          // Validate quantity constraints
          if (
            variantData.minOrderQuantity &&
            item.selectedQuantity < variantData.minOrderQuantity
          ) {
            result.errors.push({
              code: "BELOW_MINIMUM_QUANTITY",
              message: `Quantity for SKU '${item.sku}' is below minimum order quantity. Minimum: ${variantData.minOrderQuantity}, Requested: ${item.selectedQuantity}`,
              details: {
                sku: item.sku,
                minimum: variantData.minOrderQuantity,
                requested: item.selectedQuantity,
              },
            });
            continue;
          }

          if (
            variantData.maxOrderQuantity &&
            item.selectedQuantity > variantData.maxOrderQuantity
          ) {
            result.errors.push({
              code: "ABOVE_MAXIMUM_QUANTITY",
              message: `Quantity for SKU '${item.sku}' exceeds maximum order quantity. Maximum: ${variantData.maxOrderQuantity}, Requested: ${item.selectedQuantity}`,
              details: {
                sku: item.sku,
                maximum: variantData.maxOrderQuantity,
                requested: item.selectedQuantity,
              },
            });
            continue;
          }

          // Create validated item
          const validatedItem: ValidatedOfferItem = {
            variantData,
            requestedQuantity: item.selectedQuantity,
            buyerOfferPrice: item.pricePerUnit,
            buyerOfferPriceCurrency: item.currency,
            originalFileData: item,
          };

          result.validatedItems.push(validatedItem);
          result.totalOfferValue += item.selectedQuantity * item.pricePerUnit;
        } catch (error) {
          result.errors.push({
            code: "VALIDATION_ERROR",
            message: `Error validating SKU '${item.sku}': ${error instanceof Error ? error.message : String(error)}`,
            details: { sku: item.sku },
          });
        }
      }

      // Check minimum order value
      if (
        catalogListing.minimum_order_value &&
        result.totalOfferValue < Number(catalogListing.minimum_order_value)
      ) {
        result.isValid = false;
        result.errors.push({
          code: "BELOW_MINIMUM_ORDER_VALUE",
          message: `Total offer value (${result.totalOfferValue}) is below minimum order value (${Number(catalogListing.minimum_order_value)})`,
          details: {
            totalValue: result.totalOfferValue,
            minimumValue: Number(catalogListing.minimum_order_value),
            currency: catalogListing.minimum_order_value_currency || "USD",
          },
        });
      }

      // Set validation result
      if (result.errors.length > 0 && result.validatedItems.length === 0) {
        result.isValid = false;
      }

      // Set currency from first valid item or default to USD
      if (result.validatedItems.length > 0) {
        result.currency = result.validatedItems[0].buyerOfferPriceCurrency;
      }

      return result;
    } catch (error) {
      result.isValid = false;
      result.errors.push({
        code: "VALIDATION_FAILED",
        message: `Validation failed: ${error instanceof Error ? error.message : String(error)}`,
      });
      return result;
    }
  }

  /**
   * Find variant by SKU in catalog listing
   */
  private async findVariantBySku(
    sku: string,
    catalogListingId: string
  ): Promise<VariantLookupResult | null> {
    const variant = await this.prisma.catalog_product_variants.findFirst({
      where: {
        variant_sku: sku,
        is_active: true,
        catalog_products: {
          catalog_listing_id: catalogListingId,
          status: "ACTIVE",
        },
      },
      include: {
        catalog_products: {
          include: {
            brands: {
              select: {
                brand_name: true,
              },
            },
          },
        },
      },
    });

    if (!variant) {
      return null;
    }

    return {
      catalogProductVariantId: variant.catalog_product_variant_id,
      variantSku: variant.variant_sku,
      productTitle: variant.title || variant.catalog_products.title,
      brandName: variant.catalog_products.brands.brand_name,
      availableQuantity: variant.available_quantity,
      minOrderQuantity: variant.min_order_quantity,
      maxOrderQuantity: variant.max_order_quantity,
      isActive: variant.is_active ?? true,
      catalogListingId: catalogListingId,
    };
  }
}
