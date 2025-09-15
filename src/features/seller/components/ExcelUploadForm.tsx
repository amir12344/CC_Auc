"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  ArrowLeft,
  CheckCircle,
  Download,
  FileSpreadsheet,
  Upload,
} from "lucide-react";

import { Alert, AlertDescription } from "@/src/components/ui/alert";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";

/**
 * Excel Upload Form Component
 *
 * Simple component for uploading Excel files to create bulk listings
 */
export function ExcelUploadForm() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadSuccess(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);

    // Simulate upload
    setTimeout(() => {
      setIsUploading(false);
      setUploadSuccess(true);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-8xl mx-auto px-6 py-8">
        {/* Go Back Button */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center gap-2 hover:bg-gray-100"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
        </div>

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Upload Excel to Create Listings
            </h1>
            <p className="mt-1 text-gray-600">
              Upload your Excel file to quickly create multiple listings. Make
              sure your file follows our template format.
            </p>
          </div>
          <Badge
            variant="outline"
            className="border-blue-200 bg-blue-50 text-sm text-blue-700"
          >
            Bulk Upload
          </Badge>
        </div>

        <div className="max-w-8xl mx-auto">
          <Card className="border-0 bg-white/90 shadow-lg backdrop-blur-sm">
            <CardContent className="pt-8">
              {/* Template Download */}
              <div className="mb-8">
                <h3 className="mb-4 text-lg font-semibold">
                  Step 1: Download Template
                </h3>
                <Button variant="outline" className="mb-4">
                  <Download className="mr-2 h-4 w-4" />
                  Download Excel Template
                </Button>
                <p className="text-sm text-gray-600">
                  Download our Excel template to ensure your file has the
                  correct format with all required fields.
                </p>
              </div>

              {/* Upload area */}
              <div className="mb-6">
                <h3 className="mb-4 text-lg font-semibold">
                  Step 2: Upload Your File
                </h3>
                <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center transition-colors hover:border-gray-400">
                  <Upload className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                  <h4 className="mb-2 text-lg font-semibold">
                    Upload Excel File
                  </h4>
                  <p className="mb-4 text-gray-600">
                    Select your Excel file to create multiple listings (.xlsx,
                    .xls, .csv)
                  </p>
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="excel-upload"
                  />
                  <label htmlFor="excel-upload">
                    <Button variant="outline" className="cursor-pointer">
                      <Upload className="mr-2 h-4 w-4" />
                      Select File
                    </Button>
                  </label>
                </div>

                {selectedFile && (
                  <div className="mt-6 rounded-lg border bg-gray-50 p-6">
                    <div className="mb-4 flex items-center gap-3">
                      <FileSpreadsheet className="h-8 w-8 text-green-600" />
                      <div>
                        <p className="text-lg font-medium">
                          {selectedFile.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          Size: {(selectedFile.size / 1024 / 1024).toFixed(2)}{" "}
                          MB
                        </p>
                      </div>
                    </div>

                    <Button
                      onClick={handleUpload}
                      disabled={isUploading || uploadSuccess}
                      className="flex min-w-[140px] items-center gap-2 bg-[#43CD66] hover:bg-[#3ab859]"
                    >
                      <Upload className="h-4 w-4" />
                      {isUploading ? "Processing..." : "Create Listings"}
                    </Button>
                  </div>
                )}

                {uploadSuccess && (
                  <Alert className="mt-6 border-green-200 bg-green-50">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <AlertDescription className="text-green-800">
                      <strong>Upload successful!</strong> Your listings have
                      been created and are now live on the marketplace.
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {/* Instructions */}
              <div className="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-6">
                <h4 className="mb-3 font-semibold text-blue-900">
                  Upload Instructions:
                </h4>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li>
                    • Download and fill out our Excel template with your product
                    information
                  </li>
                  <li>
                    • Ensure all required fields (marked with *) are completed
                  </li>
                  <li>• File formats supported: .xlsx, .xls, .csv</li>
                  <li>• Maximum file size: 10MB</li>
                  <li>• You can upload up to 1000 listings at once</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
