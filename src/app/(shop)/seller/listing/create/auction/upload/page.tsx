import type { Metadata } from "next";

import { AuctionExcelUploadForm } from "@/src/features/seller/components/AuctionExcelUploadForm";

export const metadata: Metadata = {
  title: "Create Auction Listing - Excel Upload",
  description: "Upload Excel files to create auction listings in bulk",
};

export default function AuctionExcelUploadPage() {
  return <AuctionExcelUploadForm />;
}
