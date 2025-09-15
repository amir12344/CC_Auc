# Offer Export Implementation Blueprint

## 🎯 **PROJECT OVERVIEW**

Implement Excel export functionality for the OfferSummarySheet component that creates an XLSX file with embedded images, similar to competitor solutions. The export should include visible main fields and hidden detailed data, plus a link tile to upload page.

## 📋 **CURRENT STATE ANALYSIS**

### ✅ **What's Already Implemented**

1. **Comprehensive Redux Architecture**: Full catalog-scoped offer management system
2. **Rich Data Structure**: Complete OfferCartItem with all necessary fields
3. **Image Handling**: Three-tier image system (listing, product, variant images)
4. **UI Components**: OfferSummarySheet with "Export Offer" button (non-functional)
5. **Grouping Logic**: Products grouped with expandable variants
6. **State Management**: Persistent localStorage with catalog isolation

### ❌ **What's Missing**

1. **Excel Export Libraries**: No XLSX/CSV libraries in package.json
2. **Export Functionality**: "Export Offer" button has no onClick handler
3. **Image Processing**: No image download/embedding utilities
4. **Upload Page Link**: No blue tile link to marketplace upload
5. **Excel Template**: No standardized export format/styling

### 🚨 **Current Implementation Issues**

1. **No Export Handler**: Button in OfferSummarySheet line 179 has no onClick
2. **Image URL Handling**: Images stored as URLs, need conversion for Excel embedding
3. **File Format Limitation**: CSV cannot embed images - must use XLSX
4. **Missing Dependencies**: Need xlsx/exceljs library for Excel generation
5. **No Error Handling**: No export failure recovery mechanism

## 🏗️ **TECHNICAL ARCHITECTURE PLAN**

### **Phase 1: Library Integration & Setup**

#### **1.1 Excel Library Selection**

- **Chosen**: SheetJS (xlsx) - lighter than ExcelJS, better documentation
- **Alternative**: ExcelJS - more styling options but heavier
- **Rationale**: Based on research, SheetJS is 8x smaller and tree-shakable

#### **1.2 Dependencies to Add**

```json
{
  "dependencies": {
    "xlsx": "^0.18.5",
    "file-saver": "^2.0.5"
  }
}
```

#### **1.3 Image Processing Strategy**

- **Fetch Image Blobs**: Convert image URLs to base64/binary data
- **Embed in Excel**: Use XLSX image embedding capabilities
- **Fallback Handling**: Handle missing/broken images gracefully

### **Phase 2: Export Service Architecture**

#### **2.1 Service Structure**

```
src/features/offer-management/services/
├── excelExportService.ts     # Main export orchestrator
├── imageProcessingService.ts # Image download & processing
├── excelTemplateService.ts   # XLSX template generation
└── types/
    └── export.ts             # Export-specific types
```

#### **2.2 Core Export Flow**

```typescript
// High-level export process
1. User clicks "Export Offer" button
2. Gather offer data from Redux store
3. Download and process images (parallel)
4. Generate Excel workbook with embedded images
5. Apply styling and formatting
6. Trigger file download
7. Show success/error feedback
```

### **Phase 3: Excel Template Design**

#### **3.1 Spreadsheet Structure**

Based on competitor analysis:

**Main Visible Columns:**

- Product Image (embedded)
- Product Name
- Variant Name
- SKU/Identifier
- Quantity
- Price/Unit
- Total Price

**Hidden Columns (with data):**

- Catalog Product ID
- Variant SKU
- Available Quantity
- Retail Price (MSRP)
- Offer Price
- Listing Image URL
- Product Image URL
- Variant Image URL
- Seller Information
- Catalog Title

#### **3.2 Excel Styling**

- Header row with bold formatting
- Alternating row colors
- Currency formatting for price columns
- Number formatting for quantities
- Image sizing (32x32px thumbnails)
- Auto-column width adjustment

#### **3.3 Workbook Structure**

```
Workbook: "[Catalog Name] - Offer Export"
├── Sheet 1: "Offer Summary"
│   ├── Header: Catalog info, totals, date
│   ├── Main Table: Products with embedded images
│   └── Footer: Summary statistics
├── Sheet 2: "Upload Instructions" (Blue tile equivalent)
│   └── Link to marketplace upload page
└── Sheet 3: "Raw Data" (Hidden detailed data)
    └── Complete offer data for processing
```

## 📝 **IMPLEMENTATION PLAN**

### **Task 1: Setup Dependencies and Types**

#### **1.1 Install Required Libraries**

```bash
npm install xlsx file-saver
npm install --save-dev @types/file-saver
```

#### **1.2 Create Export Types**

```typescript
// src/features/offer-management/types/export.ts
interface ExportConfig {
  includeImages: boolean
  includeHiddenData: boolean
  format: 'xlsx' | 'csv'
  sheetName: string
}

interface ImageProcessingResult {
  success: boolean
  imageData?: string // base64
  error?: string
}

interface ExcelExportResult {
  success: boolean
  fileName?: string
  error?: string
  warnings?: string[]
}
```

### **Task 2: Image Processing Service**

#### **2.1 Image Download Utility**

```typescript
// src/features/offer-management/services/imageProcessingService.ts
export const downloadImageAsBase64 = async (
  imageUrl: string
): Promise<ImageProcessingResult> => {
  try {
    const response = await fetch(imageUrl)
    const blob = await response.blob()
    const base64 = await blobToBase64(blob)
    return { success: true, imageData: base64 }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export const processOfferImages = async (
  items: OfferCartItem[]
): Promise<Map<string, string>> => {
  // Parallel image processing for all offer items
  const imageMap = new Map<string, string>()

  const imagePromises = items.map(async (item) => {
    // Process product image
    if (item.productImage) {
      const result = await downloadImageAsBase64(item.productImage)
      if (result.success) {
        imageMap.set(item.productImage, result.imageData!)
      }
    }

    // Process variant image
    if (item.variantImage) {
      const result = await downloadImageAsBase64(item.variantImage)
      if (result.success) {
        imageMap.set(item.variantImage, result.imageData!)
      }
    }
  })

  await Promise.allSettled(imagePromises)
  return imageMap
}
```

### **Task 3: Excel Template Service**

#### **3.1 XLSX Generation**

```typescript
// src/features/offer-management/services/excelTemplateService.ts
import * as XLSX from 'xlsx'

export const createOfferWorkbook = (
  offerData: GroupedProduct[],
  catalogInfo: CatalogOffer,
  imageMap: Map<string, string>
): XLSX.WorkBook => {
  const workbook = XLSX.utils.book_new()

  // Sheet 1: Main offer data
  const mainSheet = createMainOfferSheet(offerData, imageMap)
  XLSX.utils.book_append_sheet(workbook, mainSheet, 'Offer Summary')

  // Sheet 2: Upload instructions
  const uploadSheet = createUploadInstructionsSheet()
  XLSX.utils.book_append_sheet(workbook, uploadSheet, 'Upload Instructions')

  // Sheet 3: Raw data (hidden)
  const rawDataSheet = createRawDataSheet(offerData)
  XLSX.utils.book_append_sheet(workbook, rawDataSheet, 'Raw Data')

  return workbook
}

const createMainOfferSheet = (
  offerData: GroupedProduct[],
  imageMap: Map<string, string>
): XLSX.WorkSheet => {
  // Create header row
  const headers = [
    'Image',
    'Product Name',
    'Variant',
    'SKU',
    'Quantity',
    'Price/Unit',
    'Total Price',
  ]

  // Process data rows
  const rows = []
  offerData.forEach((product) => {
    product.variants.forEach((variant) => {
      rows.push([
        variant.variantImage || variant.productImage, // Image placeholder
        product.productName,
        variant.variantName,
        variant.variantSku,
        variant.selectedQuantity,
        variant.pricePerUnit,
        variant.totalPrice,
      ])
    })
  })

  // Create worksheet
  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows])

  // Apply styling and formatting
  applyExcelStyling(worksheet)

  // Embed images (if supported by chosen library)
  embedImages(worksheet, rows, imageMap)

  return worksheet
}
```

### **Task 4: Main Export Service**

#### **4.1 Export Orchestrator**

```typescript
// src/features/offer-management/services/excelExportService.ts
export const exportOfferToExcel = async (
  catalogId: string,
  config: ExportConfig = {
    includeImages: true,
    includeHiddenData: true,
    format: 'xlsx',
    sheetName: 'Offer Summary',
  }
): Promise<ExcelExportResult> => {
  try {
    // 1. Get offer data from Redux store
    const store = getStore()
    const state = store.getState()
    const catalogOffer = state.offerCart.offersByCatalog[catalogId]
    const groupedProducts = selectCurrentCatalogProductsGrouped(state)

    if (!catalogOffer || !groupedProducts.length) {
      return { success: false, error: 'No offer data found' }
    }

    // 2. Process images (if enabled)
    let imageMap = new Map<string, string>()
    if (config.includeImages) {
      imageMap = await processOfferImages(catalogOffer.items)
    }

    // 3. Create workbook
    const workbook = createOfferWorkbook(
      groupedProducts,
      catalogOffer,
      imageMap
    )

    // 4. Generate file
    const fileName = `${catalogOffer.catalogTitle}_Offer_${
      new Date().toISOString().split('T')[0]
    }.xlsx`

    // 5. Download file
    const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([wbout], { type: 'application/octet-stream' })

    // Use file-saver for cross-browser compatibility
    saveAs(blob, fileName)

    return {
      success: true,
      fileName,
      warnings:
        imageMap.size === 0 && config.includeImages
          ? ['Some images could not be processed']
          : [],
    }
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Export failed',
    }
  }
}
```

### **Task 5: UI Integration**

#### **5.1 Update OfferSummarySheet Component**

```typescript
// Add to OfferSummarySheet.tsx
import { exportOfferToExcel } from '../services/excelExportService'

// Add state for export status
const [isExporting, setIsExporting] = useState(false)

// Add export handler
const handleExportOffer = useCallback(async () => {
  setIsExporting(true)

  try {
    const result = await exportOfferToExcel(currentCatalogId)

    if (result.success) {
      setAlertType('success')
      setAlertMessage(`Offer exported successfully as ${result.fileName}`)
      setAlertOpen(true)
    } else {
      setAlertType('error')
      setAlertMessage(result.error || 'Export failed')
      setAlertOpen(true)
    }
  } catch (error) {
    setAlertType('error')
    setAlertMessage('Export failed: ' + error.message)
    setAlertOpen(true)
  } finally {
    setIsExporting(false)
  }
}, [currentCatalogId])

// Update Export button (line 179)
;<button
  className='flex items-center gap-2 rounded-full border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50'
  onClick={handleExportOffer}
  disabled={isExporting || groupedProducts.length === 0}
  type='button'
>
  <Download size={16} />
  {isExporting ? 'Exporting...' : 'Export Offer'}
</button>
```

#### **5.2 Add Upload Page Link**

```typescript
// Add to "Add more items" section
<div className='flex items-center gap-4'>
  <button
    className='text-gray-600 text-sm transition-colors hover:text-gray-900'
    type='button'
  >
    Reset
  </button>
  <Link
    href='/marketplace'
    className='flex items-center gap-1 rounded-lg bg-blue-50 border border-blue-200 px-3 py-2 text-blue-700 hover:bg-blue-100 text-sm font-medium transition-colors'
  >
    <span className='text-lg'>+</span> Browse Marketplace
  </Link>
  <button
    className='flex items-center gap-1 font-medium text-gray-900 text-sm transition-colors hover:text-gray-600'
    type='button'
  >
    <span className='text-lg'>+</span> Add more items
  </button>
</div>
```

## 🔍 **TECHNICAL CONSIDERATIONS**

### **Image Embedding Challenges**

1. **XLSX Image Support**: Not all XLSX libraries support image embedding
2. **Alternative Approach**: Include image URLs in hidden columns + image references
3. **File Size**: Images significantly increase Excel file size
4. **Cross-Origin Issues**: Some images may not be downloadable due to CORS

### **Fallback Strategies**

1. **Images Fail**: Export without images, include URLs in comments
2. **Excel Fails**: Fall back to CSV export with image URL columns
3. **Large Files**: Compress images or provide download links instead

### **Performance Considerations**

1. **Parallel Processing**: Download images concurrently
2. **Progress Indicators**: Show export progress for large offers
3. **Memory Management**: Stream large Excel files if needed
4. **Timeout Handling**: Set reasonable timeouts for image downloads

## 📋 **IMPLEMENTATION TIMELINE**

### **Phase 1: Foundation (Days 1-2)**

- [ ] Install dependencies (xlsx, file-saver)
- [ ] Create export types and interfaces
- [ ] Set up service file structure

### **Phase 2: Core Services (Days 3-4)**

- [ ] Implement image processing service
- [ ] Create Excel template service
- [ ] Build main export orchestrator

### **Phase 3: UI Integration (Day 5)**

- [ ] Update OfferSummarySheet component
- [ ] Add export button functionality
- [ ] Implement error handling and feedback

### **Phase 4: Enhancement (Day 6)**

- [ ] Add upload page link (blue tile)
- [ ] Implement progress indicators
- [ ] Add export configuration options

### **Phase 5: Testing & Polish (Day 7)**

- [ ] Test with various offer sizes
- [ ] Test image embedding
- [ ] Error handling and edge cases
- [ ] Performance optimization

## 🧪 **TESTING STRATEGY**

### **Unit Tests**

- Image processing utilities
- Excel generation functions
- Data transformation logic

### **Integration Tests**

- Full export flow with mock data
- Redux state integration
- Error handling scenarios

### **Manual Testing**

- Various offer sizes (1 item, 10 items, 100+ items)
- Different image types and sizes
- Network failure scenarios
- Browser compatibility

## 🚀 **SUCCESS CRITERIA**

### **Functional Requirements**

- [ ] Export button generates XLSX file
- [ ] File includes product data and images
- [ ] Hidden columns contain detailed data
- [ ] Blue link tile points to marketplace
- [ ] Error handling for failed exports

### **Performance Requirements**

- [ ] Export completes within 30 seconds for typical offers
- [ ] File size under 50MB for offers with 100+ items
- [ ] UI remains responsive during export

### **User Experience Requirements**

- [ ] Clear progress indication
- [ ] Success/error feedback
- [ ] Intuitive file naming
- [ ] Cross-browser compatibility

## 📚 **ALTERNATIVE APPROACHES CONSIDERED**

### **CSV + Separate Images**

- **Pros**: Simpler implementation, smaller files
- **Cons**: Not competitive with other solutions

### **PDF Export**

- **Pros**: Professional appearance, embedded images
- **Cons**: Not editable by users, different use case

### **Google Sheets Integration**

- **Pros**: Online collaboration
- **Cons**: Requires Google account, more complex

### **Multiple Format Support**

- **Pros**: User choice flexibility
- **Cons**: Increased complexity, maintenance overhead

## 🔧 **MAINTENANCE CONSIDERATIONS**

### **Library Updates**

- Monitor XLSX library updates for new features
- Test compatibility with new versions
- Consider migration to newer libraries if needed

### **Image Handling Evolution**

- Support for additional image formats
- Optimization for different image sizes
- CDN integration for faster downloads

### **Export Format Extensions**

- Additional data fields as offer system evolves
- Custom styling options
- Template customization features

---

**This blueprint provides a comprehensive roadmap for implementing Excel export functionality that matches competitor capabilities while leveraging the existing robust offer management architecture.**
