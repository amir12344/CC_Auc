# Excel Export Implementation TODO

## 🎯 **PROJECT GOAL**

Implement Excel export functionality for OfferSummarySheet that creates XLSX files with embedded images, similar to competitor solutions shown in user's reference images.

## 📋 **CURRENT STATUS ANALYSIS**

### ✅ **COMPLETED - Existing Architecture**

- [x] **Redux Offer Management**: Comprehensive catalog-scoped offer system
- [x] **Data Structures**: Rich OfferCartItem with all necessary fields
- [x] **Image Handling**: Three-tier image system (listing/product/variant)
- [x] **UI Framework**: OfferSummarySheet component with grouped products
- [x] **State Persistence**: localStorage integration with catalog isolation

### 🚨 **CRITICAL GAPS IDENTIFIED**

- [ ] **No Export Libraries**: Missing XLSX/Excel generation dependencies
- [ ] **Non-functional Export Button**: Button exists but has no onClick handler
- [ ] **Image Processing**: No utilities to download/embed images in Excel
- [ ] **Upload Page Link**: Missing blue tile link to marketplace (as shown in competitor)
- [ ] **Export Format**: No standardized Excel template/styling

## 📝 **IMPLEMENTATION TASKS**

### **PHASE 1: Foundation Setup**

#### **Task 1.1: Install Dependencies**

- [ ] Add `exceljs` library for Excel generation WITH proper image embedding
- [ ] Add `file-saver` for cross-browser file downloads
- [ ] Add TypeScript types for file-saver
- [ ] Update package.json with new dependencies

**Commands:**

```bash
npm install exceljs file-saver
npm install --save-dev @types/file-saver
```

**🔍 Library Comparison for Image Support:**

- **exceljs** (Recommended): Full image embedding with `.addImage()` method
- **xlsx-populate** (User suggestion): Good image support, simpler API
- **xlsx (SheetJS)**: ❌ Cannot display images as actual images in Excel

**Why ExcelJS:**

```javascript
// ExcelJS - Images display as actual images
const imageId = workbook.addImage({
  base64: imageBase64,
  extension: 'png',
})
worksheet.addImage(imageId, 'A1:B3')
```

#### **Task 1.2: Create Export Type Definitions**

- [ ] Create `src/features/offer-management/types/export.ts`
- [ ] Define `ExportConfig` interface
- [ ] Define `ImageProcessingResult` interface
- [ ] Define `ExcelExportResult` interface
- [ ] Add error handling types

**Key Types Needed:**

```typescript
interface ExportConfig {
  includeImages: boolean
  includeHiddenData: boolean
  format: 'xlsx' | 'csv'
  sheetName: string
}
```

### **PHASE 2: Image Processing Service**

#### **Task 2.1: Create Image Processing Service** 🔄

- [ ] Create `src/features/offer-management/services/imageProcessingService.ts`
- [ ] Implement `downloadImageAsBase64()` function
- [ ] Implement `processOfferImages()` for parallel processing
- [ ] Add error handling for failed image downloads
- [ ] Add timeout handling for slow image requests

**📋 Image Processing Clarification:**

1. **Fetch image from URL** (e.g., `https://cdn.example.com/product.jpg`)
2. **Convert to base64 IN MEMORY** (temporary browser processing)
3. **Embed directly in Excel file** (images become part of XLSX)
4. **User downloads final XLSX** (no separate image storage)

**Core Functions:**

- `downloadImageAsBase64(imageUrl: string): Promise<ImageProcessingResult>`
- `processOfferImages(items: OfferCartItem[]): Promise<Map<string, string>>`
- `blobToBase64(blob: Blob): Promise<string>`

**Image Processing Flow:**

```javascript
// 1. Fetch from URL
const response = await fetch(imageUrl)
const blob = await response.blob()

// 2. Convert to base64 (in memory)
const base64 = await blobToBase64(blob)

// 3. Embed in Excel (displays as actual image)
const imageId = workbook.addImage({ base64, extension: 'png' })
worksheet.addImage(imageId, 'A1:B3')
```

#### **Task 2.2: Handle Image Edge Cases**

- [ ] CORS-blocked images fallback
- [ ] Invalid/broken image URLs
- [ ] Large image file handling
- [ ] Image format validation (jpg, png, webp)

### **PHASE 3: Excel Template Service**

#### **Task 3.1: Create Excel Template Service**

- [ ] Create `src/features/offer-management/services/excelTemplateService.ts`
- [ ] Implement `createOfferWorkbook()` main function
- [ ] Create `createMainOfferSheet()` for primary data
- [ ] Create `createUploadInstructionsSheet()` for blue tile equivalent
- [ ] Create `createRawDataSheet()` for hidden detailed data

#### **Task 3.2: Summary Section with Excel Formulas** 🆕

- [ ] Create summary header section (top 3-4 rows)
- [ ] Add "Your Offer Total" and "Updated Offer" headers
- [ ] Implement Excel SUM formulas for total calculations
- [ ] Add AVERAGE formulas for price per unit calculations
- [ ] Format summary section with highlighting and borders

**Summary Structure (Based on Competitor Images):**

```
Row 1: "Your Offer Total" | [space] | "Updated Offer"
Row 2: "Total units" | "Total price" | "Units" | "TTL Price"
Row 3: =SUM(F:F) | =SUM(G:G) | 1,12,187 | $3,08,514.25
```

**Excel Formula Implementation:**

```javascript
// ExcelJS formula syntax
worksheet.getCell('B3').value = { formula: 'SUM(F:F)' } // Total units
worksheet.getCell('C3').value = { formula: 'SUM(G:G)' } // Total price
worksheet.getCell('E3').value = { formula: 'AVERAGE(F:F)' } // Avg per unit
```

#### **Task 3.3: Excel Styling and Formatting**

- [ ] Header row styling (bold, background color)
- [ ] Currency formatting for price columns (\$#,##0.00)
- [ ] Number formatting for quantity columns (#,##0)
- [ ] Alternating row colors
- [ ] Auto-column width adjustment
- [ ] Image cell sizing (32x32px thumbnails)
- [ ] Summary section highlighting (yellow background like competitor)

#### **Task 3.3: Multi-Sheet Structure**

- [ ] **Sheet 1**: "Offer Summary" - Main visible data with images
- [ ] **Sheet 2**: "Upload Instructions" - Link to marketplace upload page
- [ ] **Sheet 3**: "Raw Data" - Complete hidden data for processing

**Visible Columns (Sheet 1):**

- Product Image (embedded)
- Product Name
- Variant Name
- SKU/Identifier
- Quantity
- Price/Unit
- Total Price

**Hidden Columns (Sheet 3):**

- Catalog Product ID
- Variant SKU
- Available Quantity
- Retail Price (MSRP)
- Offer Price
- All image URLs
- Seller Information
- Catalog Title

### **PHASE 4: Main Export Service**

#### **Task 4.1: Create Export Orchestrator**

- [ ] Create `src/features/offer-management/services/excelExportService.ts`
- [ ] Implement `exportOfferToExcel()` main function
- [ ] Add Redux store integration
- [ ] Add progress tracking for large exports
- [ ] Implement error recovery mechanisms

**Export Flow:**

1. Get offer data from Redux store
2. Download and process images (parallel)
3. Generate Excel workbook with embedded images
4. Apply styling and formatting
5. Trigger file download
6. Show success/error feedback

#### **Task 4.2: Export Configuration**

- [ ] Default export settings
- [ ] Optional image inclusion toggle
- [ ] Format selection (XLSX primary, CSV fallback)
- [ ] Custom sheet naming
- [ ] File naming convention: `[CatalogName]_Offer_[YYYY-MM-DD].xlsx`

### **PHASE 5: UI Integration**

#### **Task 5.1: Update OfferSummarySheet Component**

- [ ] Import export service functions
- [ ] Add `isExporting` state for loading indicator
- [ ] Add `handleExportOffer` click handler
- [ ] Update "Export Offer" button with onClick (line ~179)
- [ ] Add loading state and disabled state handling
- [ ] Integrate with existing AlertDialog for feedback

**Button Update:**

```typescript
<button
  className='flex items-center gap-2 rounded-full border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50'
  onClick={handleExportOffer}
  disabled={isExporting || groupedProducts.length === 0}
  type='button'
>
  <Download size={16} />
  {isExporting ? 'Exporting...' : 'Export Offer'}
</button>
```

#### **Task 5.2: Add Upload Page Link (Blue Tile)**

- [ ] Update "Add more items" section in OfferSummarySheet
- [ ] Add blue-styled link to `/marketplace` page
- [ ] Match competitor's blue tile design from reference images
- [ ] Use Next.js Link component for navigation

**Blue Link Design:**

```typescript
<Link
  href='/marketplace'
  className='flex items-center gap-1 rounded-lg bg-blue-50 border border-blue-200 px-3 py-2 text-blue-700 hover:bg-blue-100 text-sm font-medium transition-colors'
>
  <span className='text-lg'>+</span> Browse Marketplace
</Link>
```

#### **Task 5.3: Progress Indicators**

- [ ] Export progress spinner/loading state
- [ ] Success notification with file name
- [ ] Error notification with retry option
- [ ] Progress bar for large exports (optional)

### **PHASE 6: Error Handling & Edge Cases**

#### **Task 6.1: Comprehensive Error Handling**

- [ ] Network failures during image download
- [ ] Excel generation failures
- [ ] File download failures
- [ ] Empty offer data handling
- [ ] Browser compatibility issues

#### **Task 6.2: Fallback Strategies**

- [ ] **Images fail**: Export without images, include URLs in comments
- [ ] **Excel fails**: Fall back to CSV export with image URL columns
- [ ] **Large files**: Compress images or provide download links
- [ ] **CORS issues**: Graceful degradation with image placeholders

### **PHASE 7: Testing & Validation**

#### **Task 7.1: Unit Testing**

- [ ] Image processing utility tests
- [ ] Excel generation function tests
- [ ] Data transformation logic tests
- [ ] Error handling scenario tests

#### **Task 7.2: Integration Testing**

- [ ] Full export flow with mock offer data
- [ ] Redux state integration testing
- [ ] Multiple catalog contexts testing
- [ ] Large dataset performance testing

#### **Task 7.3: Manual Testing Scenarios**

- [ ] **Small offers**: 1-5 products with variants
- [ ] **Medium offers**: 10-25 products
- [ ] **Large offers**: 50+ products (performance test)
- [ ] **Image variety**: Different formats, sizes, sources
- [ ] **Network conditions**: Slow/failing image downloads
- [ ] **Browser compatibility**: Chrome, Firefox, Safari, Edge

## 🔍 **RESEARCH FINDINGS**

### **Library Comparison for Image Support** (UPDATED)

- **ExcelJS**: 251KB gzip, ✅ Full image embedding support
- **xlsx-populate**: ~100KB gzip, ✅ Good image support, simpler API
- **excel-builder-vanilla**: 16.5KB gzip, ✅ Modern ESM, image support
- **SheetJS (xlsx)**: 16.5KB gzip, ❌ NO visual image embedding

**Revised Recommendation**: Use ExcelJS for full feature support, or xlsx-populate for simpler implementation.

### **Alternative Implementation Path (xlsx-populate)**

If you prefer xlsx-populate (your suggestion):

```bash
npm install xlsx-populate file-saver
```

```javascript
// xlsx-populate syntax (simpler)
const workbook = await XlsxPopulate.fromBlankAsync()
workbook
  .sheet(0)
  .cell('A1')
  .value('Product Image')
workbook.sheet(0).addImage('path/to/image.png', 'A2:B4')
```

### **Image Embedding Approaches**

1. **Base64 Embedding**: Convert images to base64 and embed directly
2. **Binary Embedding**: Use image binary data with XLSX image APIs
3. **URL References**: Include image URLs with external references
4. **Hybrid Approach**: Embed thumbnails, link to full images

**Recommendation**: Base64 embedding for small images, URL references as fallback.

### **Competitor Analysis (From User Images)**

- **Main fields visible**: Product name, variant, price, quantity, total
- **Hidden detailed data**: SKUs, availability, multiple price points
- **Blue upload link tile**: Prominent link to upload/browse page
- **Professional styling**: Clean headers, alternating rows, proper formatting

## ⚠️ **RISK MITIGATION**

### **Technical Risks**

- **Large file sizes**: Implement image compression and file size limits
- **Memory usage**: Stream processing for large exports
- **Browser limitations**: Test file download limits across browsers
- **Image access**: Handle CORS and authentication issues

### **User Experience Risks**

- **Long export times**: Show progress indicators and time estimates
- **Failed exports**: Clear error messages and retry mechanisms
- **File compatibility**: Test with various Excel versions
- **Mobile experience**: Ensure export works on mobile devices

## 🎯 **SUCCESS METRICS**

### **Functional Success**

- [ ] Export button generates valid XLSX file
- [ ] File opens correctly in Excel/Google Sheets
- [ ] Images display properly in exported file
- [ ] Hidden data accessible but not prominently visible
- [ ] Blue marketplace link functions correctly

### **Performance Success**

- [ ] Exports complete within 30 seconds for typical offers
- [ ] File sizes under 50MB for offers with 100+ items
- [ ] UI remains responsive during export process
- [ ] No memory leaks or browser crashes

### **User Experience Success**

- [ ] Intuitive export process matching competitor quality
- [ ] Clear feedback on export status and results
- [ ] Professional file appearance and formatting
- [ ] Cross-browser and cross-platform compatibility

## 📋 **IMPLEMENTATION PRIORITY**

### **HIGH PRIORITY (Must Have)**

1. Excel export with basic product data
2. Image embedding functionality
3. Export button integration
4. Error handling and user feedback

### **MEDIUM PRIORITY (Should Have)**

1. Blue marketplace link tile
2. Multi-sheet workbook structure
3. Excel styling and formatting
4. Progress indicators

### **LOW PRIORITY (Nice to Have)**

1. Export configuration options
2. Performance optimizations
3. Advanced image processing
4. Custom templates

---

**🎯 NEXT STEPS**: Start with Phase 1 tasks to establish foundation, then proceed sequentially through phases. Each phase builds on the previous one and can be tested independently.\*\*
