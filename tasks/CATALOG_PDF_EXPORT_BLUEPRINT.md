# Catalog PDF Export – Implementation Blueprint

## Objective
Add a “Generate PDF” button on the catalog detail page that generates a PDF of the current catalog listing (hero/details, metrics, and product table). Ensure it works reliably across large listings and fits the existing architecture.

---

## Where this lives in the codebase
- __Catalog Detail Page (App Router):__ `src/app/(shop)/marketplace/catalog/[id]/page.tsx`
  - Fetches listing via `fetchCatalogListingById()` and renders `CatalogDetailClient`.
- __Catalog container (client):__ `src/features/marketplace-catalog/components/CatalogDetailClient.tsx`
  - Computes metrics and renders:
    - `CatalogDisplay` (hero/details) – includes action buttons row
    - `CatalogMetrics` (KPIs)
    - `CatalogProductsTable` (products list/grid)
- __Hero & actions:__ `src/features/marketplace-catalog/components/CatalogDisplay.tsx`
  - Action buttons are defined around lines ~264–295. This is the recommended location to add a “Generate PDF” button.
- __Products table:__ `src/features/marketplace-catalog/components/CatalogProductsTable.tsx`
  - Renders the products list/grid and controls. Root container id: `catalog-products-table`.
- __Services & utils used by the page:__
  - `src/features/marketplace-catalog/services/catalogQueryService.ts` – data fetch
  - `src/features/marketplace-catalog/utils/catalogToOfferTransform.ts` – transforms for UI/offer cart
  - `src/features/marketplace-catalog/types/catalog.ts` – types used throughout

Note: `src/app/(shop)/collections/catalog/*` and `src/features/marketplace-catalog/components/sections/*` are for collection pages and are not directly affected, but can optionally reuse the PDF infra later.

---

## Approaches to generate PDFs in Next.js
- __A. Client-side capture (Recommended MVP)__
  - Use `html2canvas` to rasterize a dedicated on-screen “print container” and `jspdf` (or `pdf-lib`) to compose a multi-page PDF.
  - Pros: zero backend, fast to iterate, works in browser, no hosting constraints.
  - Cons: rasterized (not selectable text), quality depends on device pixel ratio, very large tables can be heavy.

- __B. Server-side rendering (Headless Chromium)__
  - Create a route handler (e.g., `src/app/api/catalog/[id]/pdf/route.ts`) that renders a print-optimized page and uses `puppeteer-core` (+ `@sparticuz/chromium` in serverless) or Playwright to return a PDF.
  - Pros: print-quality, vector text, robust pagination and CSS page breaks, consistent output.
  - Cons: adds infra/deploy complexity and cold-start overhead; extra maintenance.

- __C. Native browser print to PDF__
  - Print-friendly page + `window.print()` to let user “Save as PDF”.
  - Pros: no deps, vector text.
  - Cons: not a true programmatic download; inconsistent UX across browsers; limited control.

__Recommendation__: Start with A (Client-side) for speed and low risk, then add B (Server-side) for a premium export later if needed.

---

## Data and sections to include
- __Catalog hero/details__ from `CatalogDisplay` (uses `catalogListing` + computed displayData):
  - Image (`catalogListing.image_url`), Title, Category, Description
  - Total asking price, MSRP % off, Lead time
- __Metrics__ from `CatalogMetrics` (computed in `CatalogDetailClient`):
  - Total units, MOV, location, avg price/unit, packaging, ship window
- __Products table__ from `CatalogProductsTable`:
  - Name, image, variants, total units, offer price per unit; note: the table can be very long.

Optional: add a small exported-at timestamp and the listing public id for reference.

---

## UI/UX plan
- __Button placement__: In `CatalogDisplay.tsx` action row (next to “Buy All”), add “Generate PDF”.
- __Visibility__: Allow for all users (guest and buyer). If you want to limit, wrap with `ConditionalActionButton` like other actions.
- __Target container__: Wrap the printable content within `CatalogDetailClient` in a dedicated container (e.g., `<div id="catalog-pdf-root">…</div>`), and ensure its children render PDF-friendly markup (avoid Next `<Image>` in the exported render; use `<img>` mirrors when exporting).
- __Loading state__: Show spinner while generating; disable button during work.
- __Result__: Trigger a browser download as `catalog-<public_id>.pdf`.

---

## Client-side (MVP) – Implementation steps
1. __Add a print/export wrapper__
   - In `CatalogDetailClient.tsx`, wrap the three main sections in a container: `id="catalog-pdf-root"`.
   - Consider a lightweight “print snapshot” sub-tree (conditional render) with plain `<img>` tags (for html2canvas), mirroring `CatalogDisplay`, `CatalogMetrics`, and a simplified `CatalogProductsTable` (no sticky UI/controls).

2. __Create a PDF generator utility__
   - New file: `src/features/marketplace-catalog/utils/catalogPdfGenerator.ts`
   - Export `generateCatalogPdf({ catalogListing, metrics, products })` that:
     - Locates `#catalog-pdf-root` (or a hidden, print-optimized mirror DOM) and ensures images are loaded (await `onload`).
     - Uses `html2canvas` to capture the container at sufficient scale (`scale: window.devicePixelRatio` or configurable 2x).
     - Splits the long canvas into multiple PDF pages (A4/Letter), accounting for margins.
     - Saves file via `jsPDF` (filename includes listing public id).

3. __Add the action button__
   - In `CatalogDisplay.tsx` (action row), add a new `Button` labeled “Generate PDF”.
   - On click, call `generateCatalogPdf()` and show loading state; handle errors with the existing alert dialog pattern.

4. __Styling for print capture__
   - Add print/export CSS class (e.g., `.pdf-export`) that ensures consistent backgrounds, resolves gradient issues, and sets `page-break-inside: avoid` for rows/cards.
   - Avoid lazy-loading for images in the export container; set explicit widths/heights.

5. __Dependencies__
   - Add: `html2canvas`, `jspdf`.
   - No Next config changes required.

6. __Performance guardrails__
   - For catalogs with very large product counts, allow an option to export:
     - “Summary only” (hero + metrics + first N items)
     - “Full export (may take longer)”
   - Alternatively, chunk the table into pagination-sized DOMs and render/capture them sequentially to control memory.

---

## Server-side (optional enhancement) – Implementation steps
1. __Dedicated print view__
   - New route: `src/app/(shop)/marketplace/catalog/[id]/print/page.tsx` (RSC), same data loader as detail page but simplified markup for print.
   - Print CSS (A4/Letter sizes), use regular `<img>` tags for full control.

2. __Route handler to generate PDF__
   - New API: `src/app/api/catalog/[id]/pdf/route.ts` that:
     - Accepts `id`, fetches the print URL rendered in headless Chromium (e.g., `https://site/marketplace/catalog/[id]/print`).
     - Calls `page.pdf({ format: 'A4', printBackground: true, margin: {…} })`.
     - Streams the PDF with appropriate headers.

3. __Dependencies__
   - `puppeteer-core` and `@sparticuz/chromium` (for serverless) or Playwright in a full Node environment.
   - Confirm hosting environment supports headless Chromium (Amplify Hosting often does; if not, consider a separate function/Lambda).

4. __Client button wiring__
   - The “Generate PDF” button hits the API route and triggers a download (no heavy client-side work, vector quality preserved).

---

## Integration checkpoints (file-by-file)
- `src/app/(shop)/marketplace/catalog/[id]/page.tsx`
  - No changes needed for MVP; ensure `catalogListing` has all fields the export requires.

- `src/features/marketplace-catalog/components/CatalogDetailClient.tsx`
  - Wrap main sections with `id="catalog-pdf-root"` and add an optional hidden print-only mirror sub-tree if needed for clean export.
  - Keep the current metrics and transformations; reuse these values in the export (avoid recomputation/fetching).

- `src/features/marketplace-catalog/components/CatalogDisplay.tsx`
  - Add “Generate PDF” button in the action row (near “Buy All”).
  - Wire to `generateCatalogPdf()` and provide user feedback using the existing alert dialog pattern.

- `src/features/marketplace-catalog/components/CatalogProductsTable.tsx`
  - No direct change for MVP if you capture the on-screen table; however, for cleaner output consider a simplified print-only version without controls (dropdowns, buttons, toggles) that renders alongside but hidden.

- `src/features/marketplace-catalog/services/catalogQueryService.ts`
  - No changes for MVP. For server-side export, reuse `fetchCatalogListingById()` in the print route.

- `src/features/marketplace-catalog/utils/catalogToOfferTransform.ts`
  - No changes required.

---

## Styling & layout notes for PDF
- Prefer a fixed-width export container (e.g., ~800–1000px) to ensure predictable layout.
- Use solid background colors; gradients/transparencies can render poorly in canvas.
- For long tables, add explicit row heights and avoid sticky headers. Use `page-break-inside: avoid` on product cards/rows.
- Replace Next `<Image>` with `<img>` in the export mirror to avoid canvas issues.

---

## Edge cases & testing
- __Large catalogs__: Verify memory/CPU on client; offer summary-only export option.
- __Image failures__: Fallback to placeholders; pre-load images before capture.
- __Auth/role__: Ensure export button respects marketplace access rules (buyers only if desired).
- __Mobile__: Hide the button on very small screens or confirm it works with long content.
- __File size__: Consider JPEG compression for canvases to reduce output size.

---

## Acceptance criteria
- Button appears on catalog detail page and triggers a downloadable PDF.
- PDF includes hero/details, metrics, and products content for the current catalog.
- Works for typical catalog sizes without crashing the tab.
- No regressions in Buy All, Offer footer bar, or product table UX.

---

## Future enhancements
- Switch to server-side PDF for vector quality and robust pagination.
- Add brand watermarking, page header/footer with page numbers.
- Allow per-section toggles (include/exclude metrics, images, etc.).
- Export CSV alongside PDF from the same container data.
