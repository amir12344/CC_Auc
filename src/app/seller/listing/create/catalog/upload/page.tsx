import type { Metadata } from 'next';
import { CatalogExcelUploadForm } from '@/src/features/seller/components/CatalogExcelUploadForm';

export const metadata: Metadata = {
  title: 'Create Catalog Listing - Excel Upload',
  description: 'Upload Excel files to create catalog listings in bulk',
};

export default function CatalogExcelUploadPage() {
  return (
    <CatalogExcelUploadForm />
  );
} 