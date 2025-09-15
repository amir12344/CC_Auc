/*
 * Professional Catalog PDF generator using React-PDF
 * Creates clean, professional PDFs with proper layout and typography
 */

import React from "react";

import { pdf } from "@react-pdf/renderer";

import { defaultMetadata } from "@/src/utils/metadata";

import {
  CatalogPdfTemplate,
  type CatalogPdfData,
} from "../components/CatalogPdfTemplate";

// Internal: read Blob into data URL
async function blobToDataUrl(blob: Blob): Promise<string> {
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// Internal: transcode any image Blob to JPEG using canvas
async function transcodeToJpegDataUrl(blob: Blob): Promise<string | undefined> {
  try {
    // Helper to draw to canvas and export as JPEG
    const drawToCanvas = async (image: HTMLImageElement | ImageBitmap) => {
      const w =
        "naturalWidth" in image && image.naturalWidth
          ? (image as HTMLImageElement).naturalWidth
          : (image as ImageBitmap).width;
      const h =
        "naturalHeight" in image && image.naturalHeight
          ? (image as HTMLImageElement).naturalHeight
          : (image as ImageBitmap).height;
      // Fallback dimensions for SVGs without intrinsic size
      const width = w && w > 0 ? w : 240;
      const height = h && h > 0 ? h : 60;
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return undefined;
      ctx.drawImage(image as unknown as CanvasImageSource, 0, 0, width, height);
      return canvas.toDataURL("image/jpeg", 0.92);
    };

    // Try ImageBitmap path first; if unsupported (e.g., SVG), fall back to HTMLImageElement
    if ("createImageBitmap" in window) {
      try {
        const bitmap = await createImageBitmap(blob);
        const dataUrl = await drawToCanvas(bitmap);
        if (dataUrl) return dataUrl;
      } catch (_) {
        // fall through to HTMLImageElement-based transcode
      }
    }

    // Fallback: use HTMLImageElement + blob URL
    const blobUrl = URL.createObjectURL(blob);
    try {
      const img = new Image();
      img.src = blobUrl;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });
      const dataUrl = await drawToCanvas(img);
      return dataUrl || undefined;
    } finally {
      URL.revokeObjectURL(blobUrl);
    }
  } catch (e) {
    console.warn("Image transcode to JPEG failed:", e);
    return undefined;
  }
}

// Fetch an image URL and return a JPEG/PNG data URL for reliable React-PDF rendering
// If the source is WebP or has an unknown content-type (octet-stream), we transcode to JPEG.
async function fetchImageAsDataUrl(url: string): Promise<string | undefined> {
  try {
    // Direct fetch; rely on base64 embedding to avoid React-PDF URL issues
    const isSameOrigin =
      typeof window !== "undefined" && url.startsWith(window.location.origin);
    const response = await fetch(url, {
      mode: isSameOrigin ? "same-origin" : "cors",
      cache: "no-store",
    });
    if (!response.ok) return undefined;
    const blob = await response.blob();
    const type = (blob.type || "").toLowerCase();

    // If JPEG/PNG, return directly; otherwise transcode to JPEG
    if (type === "image/jpeg" || type === "image/jpg" || type === "image/png") {
      return await blobToDataUrl(blob);
    }

    // Attempt transcode (handles WebP, octet-stream, empty type, etc.)
    const jpegDataUrl = await transcodeToJpegDataUrl(blob);
    if (jpegDataUrl) return jpegDataUrl;

    // Important: React-PDF does not render SVG data URLs reliably; avoid returning SVG as-is
    if (type === "image/svg+xml") return undefined;

    // Fallback for non-SVG types: return original as-is
    return await blobToDataUrl(blob);
  } catch (e) {
    console.warn("Failed to convert image to base64 for PDF:", e);
    return undefined;
  }
}

export interface CatalogPdfOptions {
  listingId: string;
  listingTitle?: string;
  baseUrl?: string;
  catalogData: {
    catalogName: string;
    catalogImage?: string;
    category: string;
    totalAskingPrice: string;
    leadTime: string;
    description: string;
    unitsInListing: number;
    minOrderValue: number;
    location: string;
    averagePrice: string;
    msrpPercentage?: string;
    packaging?: string;
    shippingWindow?: string;
    products: Array<{
      id: string;
      name: string;
      totalUnits: number;
      retailPrice: number;
      offerPrice: number;
      totalPrice: number;
      imageUrl?: string;
      variants?: Array<{
        id: string;
        name: string;
        sku?: string;
        units: number;
        retailPrice: number;
        offerPrice: number;
        totalPrice: number;
        imageUrl?: string;
      }>;
    }>;
  };
}

export async function generateCatalogPdf({
  listingId,
  listingTitle,
  baseUrl,
  catalogData,
}: CatalogPdfOptions) {
  try {
    // Prepare data for PDF template
    // Convert image URLs to base64 data URLs to avoid React-PDF issues with complex signed URLs
    const processedProducts = await Promise.all(
      (catalogData.products || []).map(async (p) => {
        const productImage = p.imageUrl
          ? await fetchImageAsDataUrl(p.imageUrl)
          : undefined;
        const processedVariants = p.variants
          ? await Promise.all(
              p.variants.map(async (v) => ({
                ...v,
                imageUrl: v.imageUrl
                  ? await fetchImageAsDataUrl(v.imageUrl)
                  : undefined,
              }))
            )
          : undefined;
        return { ...p, imageUrl: productImage, variants: processedVariants };
      })
    );

    const catalogHeaderImage = catalogData.catalogImage
      ? await fetchImageAsDataUrl(catalogData.catalogImage)
      : undefined;

    // Header logo: prefer PNG asset for React-PDF reliability; fall back to SVG if needed
    const absolutePngLogoUrl =
      typeof window !== "undefined"
        ? new URL(
            "/CommerceCentral_Logo_pdf.png",
            window.location.origin
          ).toString()
        : "/CommerceCentral_Logo_pdf.png";
    let headerLogo = await fetchImageAsDataUrl(absolutePngLogoUrl);
    if (!headerLogo) {
      const absoluteSvgLogoUrl =
        typeof window !== "undefined"
          ? new URL(
              "/CommerceCentral_logo_Green.svg",
              window.location.origin
            ).toString()
          : "/CommerceCentral_logo_Green.svg";
      headerLogo = await fetchImageAsDataUrl(absoluteSvgLogoUrl);
      if (!headerLogo) {
        console.warn("Header logo failed to prepare for PDF (PNG and SVG).");
      }
    }

    const pdfData: CatalogPdfData = {
      catalogName: catalogData.catalogName,
      catalogImage: catalogHeaderImage || catalogData.catalogImage,
      category: catalogData.category,
      totalAskingPrice: catalogData.totalAskingPrice,
      leadTime: catalogData.leadTime,
      description: catalogData.description,
      unitsInListing: catalogData.unitsInListing,
      minOrderValue: catalogData.minOrderValue,
      location: catalogData.location,
      averagePrice: catalogData.averagePrice,
      msrpPercentage: catalogData.msrpPercentage,
      packaging: catalogData.packaging,
      shippingWindow: catalogData.shippingWindow,
      products: processedProducts,
      listingId,
      baseUrl,
      headerLogo,
      siteTitle:
        (typeof document !== "undefined" && document.title
          ? document.title
          : (defaultMetadata.title as string)) ||
        "Buy & Sell Surplus Inventory | Commerce Central Liquidation Platform",
    };

    // Generate PDF blob using React-PDF
    const pdfDocument = React.createElement(CatalogPdfTemplate, {
      data: pdfData,
    }) as any;
    const blob = await pdf(pdfDocument).toBlob();

    // Create download
    const safeTitle = listingTitle?.trim() || "catalog";
    const filename = `${safeTitle.replace(/[^a-z0-9\-_]+/gi, "-").toLowerCase()}-${listingId}.pdf`;

    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("PDF generation failed:", error);
    throw new Error(
      `Failed to generate PDF: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}
