'use client';

import React from 'react';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Input } from '@/src/components/ui/input';
import { Upload, FileSpreadsheet, X } from 'lucide-react';

interface FileUploadAreaProps {
  title: string;
  description: string;
  file: File | null;
  fileInputId: string;
  acceptedTypes: string;
  isDragOver: boolean;
  iconColor: 'blue' | 'orange' | 'purple';
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
}

/**
 * Reusable file upload area component with drag and drop functionality
 * Used by both auction and catalog upload forms
 */
export const FileUploadArea: React.FC<FileUploadAreaProps> = ({
  title,
  description,
  file,
  fileInputId,
  acceptedTypes,
  isDragOver,
  iconColor,
  onFileSelect,
  onFileRemove,
  onDragOver,
  onDragLeave,
  onDrop,
}) => {
  const iconColorClasses = {
    blue: 'bg-blue-100 text-blue-600 hover:border-blue-400 border-blue-500 bg-blue-50',
    orange: 'bg-orange-100 text-orange-600 hover:border-orange-400 border-orange-500 bg-orange-50',
    purple: 'bg-purple-100 text-purple-600 hover:border-purple-400 border-purple-500 bg-purple-50',
  };

  const colors = iconColorClasses[iconColor];
  const [bgClass, textClass, hoverClass, dragBorderClass, dragBgClass] = colors.split(' ');

  return (
    <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${bgClass}`}>
            <FileSpreadsheet className={`w-5 h-5 ${textClass}`} />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900">
              {title}
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              {description}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div 
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragOver 
              ? `${dragBorderClass} ${dragBgClass}` 
              : `border-gray-300 ${hoverClass} bg-gray-50`
          }`}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          {!file ? (
            <>
              <p className="text-lg font-medium text-gray-700 mb-2">
                {title}
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Drag and drop your Excel file here or click to browse
              </p>
              <Button
                type="button"
                variant="outline"
                className="mx-auto"
                onClick={() => document.getElementById(fileInputId)?.click()}
              >
                Browse Files
              </Button>
              <Input
                id={fileInputId}
                type="file"
                accept={acceptedTypes}
                onChange={(e) => {
                  const selectedFile = e.target.files?.[0];
                  if (selectedFile) {
                    onFileSelect(selectedFile);
                  }
                }}
                className="hidden"
              />
            </>
          ) : (
            <div className="space-y-3">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-800">
                <FileSpreadsheet className="w-5 h-5 mr-2" />
                <span className="font-medium">{file.name}</span>
                <button
                  type="button"
                  onClick={onFileRemove}
                  className="ml-2 text-green-600 hover:text-green-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-gray-600">File selected successfully</p>
            </div>
          )}
        </div>
        <p className="text-xs text-gray-500 text-center">
          Excel files only (.xlsx, .xls, .csv)
        </p>
      </CardContent>
    </Card>
  );
}; 