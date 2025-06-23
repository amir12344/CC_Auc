'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent } from '@/src/components/ui/card';
import { Alert, AlertDescription } from '@/src/components/ui/alert';
import { Badge } from '@/src/components/ui/badge';
import { Upload, FileSpreadsheet, Download, CheckCircle, ArrowLeft } from 'lucide-react';

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
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </Button>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Upload Excel to Create Listings</h1>
            <p className="text-gray-600 mt-1">
              Upload your Excel file to quickly create multiple listings. Make sure your file follows our template format.
            </p>
          </div>
          <Badge variant="outline" className="text-sm bg-blue-50 text-blue-700 border-blue-200">
            Bulk Upload
          </Badge>
        </div>

        <div className="max-w-8xl mx-auto">
          <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
            <CardContent className="pt-8">
              {/* Template Download */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">Step 1: Download Template</h3>
                <Button variant="outline" className="mb-4">
                  <Download className="w-4 h-4 mr-2" />
                  Download Excel Template
                </Button>
                <p className="text-sm text-gray-600">
                  Download our Excel template to ensure your file has the correct format with all required fields.
                </p>
              </div>

              {/* Upload area */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">Step 2: Upload Your File</h3>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-gray-400 transition-colors">
                  <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <h4 className="text-lg font-semibold mb-2">Upload Excel File</h4>
                  <p className="text-gray-600 mb-4">
                    Select your Excel file to create multiple listings (.xlsx, .xls, .csv)
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
                      <Upload className="w-4 h-4 mr-2" />
                      Select File
                    </Button>
                  </label>
                </div>

                {selectedFile && (
                  <div className="mt-6 p-6 bg-gray-50 rounded-lg border">
                    <div className="flex items-center gap-3 mb-4">
                      <FileSpreadsheet className="w-8 h-8 text-green-600" />
                      <div>
                        <p className="font-medium text-lg">{selectedFile.name}</p>
                        <p className="text-sm text-gray-600">
                          Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>

                    <Button
                      onClick={handleUpload}
                      disabled={isUploading || uploadSuccess}
                      className="bg-[#43CD66] hover:bg-[#3ab859] flex items-center gap-2 min-w-[140px]"
                    >
                      <Upload className="w-4 h-4" />
                      {isUploading ? 'Processing...' : 'Create Listings'}
                    </Button>
                  </div>
                )}

                {uploadSuccess && (
                  <Alert className="mt-6 bg-green-50 border-green-200">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <AlertDescription className="text-green-800">
                      <strong>Upload successful!</strong> Your listings have been created and are now live on the marketplace.
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {/* Instructions */}
              <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-3">Upload Instructions:</h4>
                <ul className="text-sm text-blue-800 space-y-2">
                  <li>• Download and fill out our Excel template with your product information</li>
                  <li>• Ensure all required fields (marked with *) are completed</li>
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
