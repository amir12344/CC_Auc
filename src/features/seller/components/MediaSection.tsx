'use client';

import React from 'react';
import { UseFormRegister, UseFormSetValue, FieldErrors } from 'react-hook-form';
import { Input } from '@/src/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { Separator } from '@/src/components/ui/separator';
import { FormField } from './shared/FormField';
import { Upload, ImageIcon, Video } from 'lucide-react';

interface MediaSectionProps {
  register: UseFormRegister<any>;
  setValue: UseFormSetValue<any>;
  errors: FieldErrors<any>;
  getErrorMessage: (error: any) => string | undefined;
}

export function MediaSection({ register, setValue, errors, getErrorMessage }: MediaSectionProps) {
  return (
    <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
      <CardHeader className="pb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <ImageIcon className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <CardTitle className="text-xl text-gray-900">Media</CardTitle>
            <CardDescription>
              Upload images and videos for your auction listing
            </CardDescription>
          </div>
          <Badge className="ml-auto bg-red-100 text-red-700 border-red-200">Required</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        
        {/* Listing Images */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="font-semibold text-gray-900">Listing Images*</h3>
            <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs">Required</Badge>
            <Separator className="flex-1" />
          </div>
          
          <FormField label="Listing Images" required error={getErrorMessage(errors.images)}>
            <Input 
              {...register('images')} 
              type="file" 
              multiple
              accept="image/*"
              className="h-12 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
            />
            <p className="text-xs text-gray-500 mt-2">
              Upload 3 high-quality images of the product in the warehouse. Accepted formats: JPG, PNG, WebP
            </p>
          </FormField>
        </div>

        {/* Video Upload */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="font-semibold text-gray-700">Video</h3>
            <Badge variant="outline" className="text-xs">Optional</Badge>
            <Separator className="flex-1" />
          </div>
          
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Video className="w-5 h-5 text-gray-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Video Upload (Optional)</p>
                <p className="text-sm text-gray-600 mt-1">
                  Upload a video showing the product condition and details
                </p>
              </div>
            </div>
          </div>

          <FormField label="Product Video" error={getErrorMessage(errors.video)}>
            <Input 
              {...register('video')} 
              type="file" 
              accept="video/*"
              className="h-12 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100" 
            />
            <p className="text-xs text-gray-500 mt-2">
              Upload a video file (MP4, MOV, AVI). Maximum file size: 100MB
            </p>
          </FormField>
        </div>

      </CardContent>
    </Card>
  );
} 
