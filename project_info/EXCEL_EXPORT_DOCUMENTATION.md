# Documentation: Excel Export Functionality

## Final Design and Layout (As of August 2024)

The current Excel export features a highly refined layout designed for clarity and ease of use.

### 1. Header and Summary

- **Your Offer Total**: This summary block is positioned directly above the "Your Offer" section (Columns Q-R) for immediate feedback when editing quantities or prices.
- **Upload Link**: An "Upload Offer to AM" hyperlink is located at `J2:K2`. This link is now **dynamic** and points directly to the catalog's specific offer upload page (e.g., `/marketplace/catalog/{catalogId}/upload-offer`).

### 2. Column Structure

The column order has been optimized to group related information logically.

| Col | Header               | Status     | Notes                                 |
| :-- | :------------------- | :--------- | :------------------------------------ |
| A   | Image                | Visible    |                                       |
| B   | Product Name         | Visible    |                                       |
| C   | Variant              | Visible    |                                       |
| D   | Brand                | Visible    | **New**                               |
| E   | Category             | Visible    |                                       |
| F   | Subcategory          | **Hidden** | **New**; Can be unhidden by the user. |
| G   | SKU                  | Visible    |                                       |
| H   | Identifier           | **Hidden** | Can be unhidden by the user.          |
| I   | ID Type              | Visible    |                                       |
| J   | Packaging            | Visible    |                                       |
| K   | Condition            | Visible    |                                       |
| L   | MSRP                 | Visible    |                                       |
| M   | Seller's Units       | Visible    | Reordered & Renamed                   |
| N   | Seller's Offer Price | Visible    | Reordered                             |
| O   | Seller's Offered %   | Visible    | Reordered & **New**                   |
| P   | Seller's Total Offer | Visible    | **New**                               |
| Q-T | Your Offer Section   | Visible    | Outlined with a thick blue border.    |

### 3. Formulas and Calculations

- **Seller's Offered %** (Column O): `=IFERROR((L-N)/L*100, 0)`
- **Seller's Total Offer** (Column P): `=N*M`
- **Your Total Price** (Column S): `=Q*R`
- **Your % Off** (Column T): `=IFERROR((1-R/L)*100, 0)`
- **Summary Total Units** (Cell Q3): `=SUM(Q8:Q1048576)`
- **Summary Total Price** (Cell R3): `=SUM(S8:S1048576)`

### 4. Key Fixes and Features

- **Image Rendering**: An issue with `accessLevel` in the image processing service was fixed, restoring image functionality. The conflicting data validation rule was also removed.
- **Styling**: The "Your Offer" section is clearly delineated with a thick blue border (`#4A90E2`), and the instructional text has a light cyan background for readability.
- **Hidden Columns**: Key data is available without cluttering the main view.

---

## 1. Feature Overview

This document outlines the architecture and implementation of the "Export Offer to Excel" feature. This system allows users to download a `.xlsx` file summarizing their current offer cart.

The exported Excel file is dynamic and includes:

- An "Offer Summary" sheet.
- A summary header with calculated totals (Total Units, Total Price).
- A detailed table of all offer items with embedded product variant images.
- Automatic row-level calculations for "Total Price" based on quantity and price per unit.

## 2. File Architecture

The feature is modular and built across several new files:

| File                        | Location                                    | Purpose                                                                                                                                     |
| :-------------------------- | :------------------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------ |
| `OfferSummarySheet.tsx`     | `src/features/offer-management/components/` | The main UI component where the export is triggered.                                                                                        |
| `useExcelExport.ts`         | `src/features/offer-management/hooks/`      | A React hook that manages the state and logic for the export process (loading, progress, result). It connects the UI to the export service. |
| `excelExportService.ts`     | `src/features/offer-management/services/`   | The core service that uses the **ExcelJS** library to build and generate the `.xlsx` file, including adding data, formulas, and images.     |
| `imageProcessingService.ts` | `src/features/offer-management/services/`   | A dedicated service to handle all image-related operations: fetching, batch processing, and format conversion.                              |
| `export.ts`                 | `src/features/offer-management/types/`      | Contains all TypeScript type definitions for the export feature (`ExportConfig`, `ExportProgress`, `ExcelExportResult`, etc.).              |
| `route.ts`                  | `src/app/api/image-proxy/`                  | A Next.js API route that acts as a server-side proxy to fetch images from S3, bypassing browser CORS restrictions.                          |

## 3. How It Works: The Export Process

The export process is initiated from the `OfferSummarySheet.tsx` component and flows through the services.

**Step-by-step data flow:**

1.  **User Action**: The user clicks the "Export Offer" button in the `OfferSummarySheet`.
2.  **Hook Trigger**: This action calls the `exportOffer` function from the `useExcelExport` hook.
3.  **State Management**: The hook sets `isExporting` to `true` and begins tracking progress, displaying a progress dialog to the user.
4.  **Image Processing**: `exportOfferToExcel` calls the `imageProcessingService` to handle all images. This is a crucial step with a detailed pipeline.
5.  **Excel Generation**: The `excelExportService` uses the data and processed images to build the `.xlsx` file in the browser's memory.
6.  **File Download**: The generated file is converted into a downloadable format and saved to the user's computer.

---

## 4. In-Depth: Image Processing

This section details how the application gets an image from a web URL into the final Excel file.

### What is Base64 and Why Do We Use It?

- **What it is**: **Base64** is a standard way to represent binary data (like an image) as plain text. It encodes the raw data of the image into a long string of ASCII characters.
- **Why we use it**: The ExcelJS library, like most tools that embed files, cannot work with a URL directly. It needs the actual data of the image. Base64 provides a simple, text-based way to hand this data over to the library. Essentially, we are telling ExcelJS, "Here is the text that represents the image you need to embed."

### The Image Processing Pipeline

The service follows a precise pipeline to process each image:

1.  **Fetch via Proxy to Solve CORS**:

    - **The Problem (CORS)**: Browsers enforce a security policy called the **Same-Origin Policy**. This policy prevents a script running on one website (e.g., `http://localhost:3000`) from making a request to a server at a different domain (e.g., `s3.amazonaws.com`). When our code tried to fetch an image directly from S3, the browser blocked it, causing a **CORS (Cross-Origin Resource Sharing) error**.
    - **The Solution (Proxy Pattern)**: To get around this, we use our own backend as a trusted "middleman." Instead of asking the browser to fetch from S3, we ask it to fetch from our own API route: `/api/image-proxy`.
    - **How it Works**:
      1.  The browser makes a request to `/api/image-proxy?url=...`, which is on the **same domain**, so the request is not blocked.
      2.  The API route, which runs on our server, receives this request. Server-to-server requests are **not restricted by CORS**.
      3.  The server fetches the image from the S3 URL.
      4.  The server then sends the image data back to the browser as the response to the original `/api/image-proxy` request.

2.  **Create a Blob**: The raw data received from the proxy is converted into a **Blob** (Binary Large Object). A Blob is a file-like object that represents the image data in the browser's memory.
3.  **Convert AVIF to PNG**: Because Excel does not support modern formats like `.avif` or `.webp`, we check the image type. If it's AVIF, we use the browser's Canvas API to draw the image onto a hidden canvas and then export it as a `.png` Blob. This ensures maximum compatibility.
4.  **Encode to Base64**: The final PNG Blob is read by the `FileReader` API, which converts the binary data into a Base64 text string.
5.  **Store for Excel**: This Base64 string is stored in a `Map`, ready to be passed to the `excelExportService`.

---

## 5. In-Depth: File Download

This section explains how the in-memory Excel file is turned into a real file on the user's computer.

### What is a Blob and How Does the Download Work?

- **What it is**: As mentioned above, a **Blob** is an object that holds raw data in the browser's memory. In this context, once ExcelJS has finished building the workbook, it doesn't exist as a `.xlsx` file yet; it exists as a large chunk of binary data. We place this data into a Blob to manage it.
- **How the download works**: Browsers have strict security policies that prevent web pages from writing files directly to your computer. The `file-saver` library provides a standard way to work around this.
  1.  The ExcelJS workbook is outputted as a data buffer, which is then used to create a Blob. We specify the `type` of the blob as `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`, which is the official MIME type for `.xlsx` files.
  2.  `saveAs(blob, fileName)` is called. This function creates a temporary, invisible link (`<a>`) in the HTML, points its `href` to an object URL representing the Blob, and programmatically "clicks" it.
  3.  This action triggers the browser's standard download prompt, allowing the user to save the Blob data as a normal `.xlsx` file.

---

## 6. Key Technical Decisions & Solutions

- **ExcelJS over xlsx-populate**: `ExcelJS` was chosen for its superior support for embedding images and applying complex styling.
- **CORS Workaround via Proxy**: The `/api/image-proxy` is a critical piece of the architecture. It elegantly solves the browser's Same-Origin Policy restriction without requiring changes to the S3 bucket's CORS policy.
- **PNG for Compatibility**: Images are converted to `.png` because it has the widest support across all versions of Excel. Modern formats like `.webp` are not supported.
- **Decoupled Logic**: The use of a dedicated hook (`useExcelExport`) and separate services for Excel generation and image processing makes the code modular, easier to maintain, and testable.

---

This documentation should provide a clear understanding for any developer looking to work with or extend this feature.
