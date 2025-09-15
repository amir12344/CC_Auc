"use client";

import React from "react";
import { FieldErrors, UseFormRegister, UseFormSetValue } from "react-hook-form";

import { ImageIcon, Upload, Video } from "lucide-react";

import { Badge } from "@/src/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Separator } from "@/src/components/ui/separator";

import { FormField } from "./shared/FormField";

interface MediaSectionProps {
  register: UseFormRegister<any>;
  setValue: UseFormSetValue<any>;
  errors: FieldErrors<any>;
  getErrorMessage: (error: any) => string | undefined;
}

export function MediaSection({
  register,
  setValue,
  errors,
  getErrorMessage,
}: MediaSectionProps) {
  return (
    <Card className="border-0 bg-white/90 shadow-lg backdrop-blur-sm">
      <CardHeader className="pb-6">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-purple-100 p-2">
            <ImageIcon className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <CardTitle className="text-xl text-gray-900">Media</CardTitle>
            <CardDescription>
              Upload images and videos for your auction listing
            </CardDescription>
          </div>
          <Badge className="ml-auto border-red-200 bg-red-100 text-red-700">
            Required
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Listing Images */}
        <div className="space-y-4">
          <div className="mb-4 flex items-center gap-2">
            <h3 className="font-semibold text-gray-900">Listing Images*</h3>
            <Badge className="border-blue-200 bg-blue-100 text-xs text-blue-700">
              Required
            </Badge>
            <Separator className="flex-1" />
          </div>

          <FormField
            label="Listing Images"
            required
            error={getErrorMessage(errors.images)}
          >
            <Input
              {...register("images")}
              type="file"
              multiple
              accept="image/*"
              className="h-12 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100"
            />
            <p className="mt-2 text-xs text-gray-500">
              Upload 3 high-quality images of the product in the warehouse.
              Accepted formats: JPG, PNG, WebP
            </p>
          </FormField>
        </div>

        {/* Video Upload */}
        <div className="space-y-4">
          <div className="mb-4 flex items-center gap-2">
            <h3 className="font-semibold text-gray-700">Video</h3>
            <Badge variant="outline" className="text-xs">
              Optional
            </Badge>
            <Separator className="flex-1" />
          </div>

          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-start gap-3">
              <Video className="mt-0.5 h-5 w-5 text-gray-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Video Upload (Optional)
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  Upload a video showing the product condition and details
                </p>
              </div>
            </div>
          </div>

          <FormField
            label="Product Video"
            error={getErrorMessage(errors.video)}
          >
            <Input
              {...register("video")}
              type="file"
              accept="video/*"
              className="h-12 file:mr-4 file:rounded-lg file:border-0 file:bg-gray-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-gray-700 hover:file:bg-gray-100"
            />
            <p className="mt-2 text-xs text-gray-500">
              Upload a video file (MP4, MOV, AVI). Maximum file size: 100MB
            </p>
          </FormField>
        </div>
      </CardContent>
    </Card>
  );
}
