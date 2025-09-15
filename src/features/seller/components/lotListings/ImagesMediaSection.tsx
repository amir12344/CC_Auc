"use client";

import React, { useCallback, useEffect, useState } from "react";
import type { UseFormReturn } from "react-hook-form";

import { FileUploader } from "@aws-amplify/ui-react-storage";

import { remove } from "aws-amplify/storage";
import { ChevronDown, ChevronRight } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/src/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/src/components/ui/collapsible";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/components/ui/form";
import { useUserPublicId } from "@/src/features/seller/hooks/useUserPublicId";
import { useToast } from "@/src/hooks/use-toast";

import type { LotListingsFormData } from "../../schemas/lotListingsSchema";

interface ImagesMediaSectionProps {
  form: UseFormReturn<LotListingsFormData>;
  isOpen: boolean;
  onToggleAction: () => void;
}

export const ImagesMediaSection = React.memo(function ImagesMediaSection({
  form,
  isOpen,
  onToggleAction,
}: ImagesMediaSectionProps) {
  const { toast } = useToast();
  const { publicId } = useUserPublicId();

  // Helper to remove an object from S3 by its full path key
  const removeFromS3 = useCallback(
    async (key?: string) => {
      if (!key) return;
      try {
        await remove({ path: key });
        toast({ title: "File removed" });
      } catch (err) {
        const description =
          err instanceof Error ? err.message : "Unknown error";
        toast({
          title: "Failed to remove file",
          description,
          variant: "destructive",
        });
      }
    },
    [toast]
  );

  // Generate upload paths (keep hero and additional images in the same folder)
  const imagesPath = ({ identityId }: { identityId?: string }) =>
    `LotListingImages/private/${identityId || "anonymous"}/${publicId || "unknown"}/`;
  const videoPath = ({ identityId }: { identityId?: string }) =>
    `LotListingVideos/private/${identityId || "anonymous"}/${publicId || "unknown"}/`;

  // Handle photo upload success for required photos (additional photos only)
  const handleRequiredPhotosSuccess = useCallback(
    (event: { key?: string }) => {
      const key = event.key;
      if (!key) {
        return;
      }

      const currentKeys: string[] =
        form.getValues("imagesMedia.requiredPhotoKeys") || [];
      // Prevent duplicates; do not include hero here
      const next = currentKeys.includes(key)
        ? currentKeys
        : [...currentKeys, key];
      form.setValue("imagesMedia.requiredPhotoKeys", next);

      toast({
        title: "Photo uploaded successfully",
      });
    },
    [form, toast]
  );

  // Handle hero photo upload success (kept separate from requiredPhotoKeys)
  const handleHeroPhotoSuccess = useCallback(
    async (event: { key?: string }) => {
      const key = event.key;
      if (!key) {
        return;
      }

      // If a previous hero exists, delete it first to avoid orphaned objects
      const prevKey: string | undefined = form.getValues(
        "imagesMedia.heroPhotoKey"
      );
      if (prevKey && prevKey !== key) {
        await removeFromS3(prevKey);
      }
      // Save hero key only; additional photos remain separate
      form.setValue("imagesMedia.heroPhotoKey", key);

      toast({
        title: "Hero photo uploaded successfully",
      });
    },
    [form, toast, removeFromS3]
  );

  // Handle video upload success
  const handleVideoSuccess = useCallback(
    async (event: { key?: string }) => {
      const key = event.key;
      if (!key) {
        return;
      }

      // If a previous video exists, delete it first to avoid orphaned objects
      const prevKey: string | undefined = form.getValues(
        "imagesMedia.videoUploadKey"
      );
      if (prevKey && prevKey !== key) {
        await removeFromS3(prevKey);
      }
      form.setValue("imagesMedia.videoUploadKey", key);
      toast({
        title: "Video uploaded successfully",
      });
    },
    [form, toast, removeFromS3]
  );

  // Handle upload errors
  const handleUploadError = useCallback(
    (error: string) => {
      toast({
        title: "Upload failed",
        description: error,
        variant: "destructive",
      });
    },
    [toast]
  );

  return (
    <Card className="rounded-xl border border-neutral-200 shadow-sm">
      <Collapsible open={isOpen} onOpenChange={onToggleAction}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer transition-colors hover:bg-neutral-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="grid h-7 w-7 place-items-center rounded-full border border-neutral-300 text-xs font-medium text-neutral-900">
                  4
                </div>
                <div>
                  <h3 className="text-base font-semibold text-neutral-900">
                    Images / Media
                  </h3>
                  <p className="text-xs text-neutral-600">
                    Visual representation of your listing
                  </p>
                </div>
              </div>
              {isOpen ? (
                <ChevronDown className="h-5 w-5 text-neutral-500" />
              ) : (
                <ChevronRight className="h-5 w-5 text-neutral-500" />
              )}
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="mt-2 space-y-8 pt-0">
            {/* Hero Photo */}
            <div>
              <FormField
                control={form.control}
                name="imagesMedia.heroPhoto"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="font-medium text-neutral-900">
                      Hero Photo <span className="text-red-500">*</span>
                    </FormLabel>
                    <p className="mb-2 text-sm text-neutral-600">
                      AI-generated composite of representative SKUs
                    </p>
                    <FormControl>
                      {publicId ? (
                        <FileUploader
                          aria-label="Hero photo uploader"
                          path={imagesPath}
                          maxFileCount={1}
                          maxFileSize={10000000}
                          acceptedFileTypes={[
                            "image/png",
                            "image/jpeg",
                            "image/jpg",
                            "image/gif",
                          ]}
                          isResumable
                          onUploadSuccess={handleHeroPhotoSuccess}
                          onUploadError={handleUploadError}
                          onFileRemove={async ({ key }) => {
                            if (!key) return;
                            await removeFromS3(key);
                            // Clear form value if the removed key matches current hero
                            const current: string | undefined = form.getValues(
                              "imagesMedia.heroPhotoKey"
                            );
                            if (current === key) {
                              form.setValue("imagesMedia.heroPhotoKey", "");
                            }
                          }}
                        />
                      ) : (
                        <div className="text-sm text-neutral-500">
                          Preparing uploader...
                        </div>
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Additional Photos */}
            <div>
              <FormField
                control={form.control}
                name="imagesMedia.requiredPhotos"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="font-medium text-neutral-900">
                      Additional Photos
                    </FormLabel>
                    <p className="mb-2 text-sm text-neutral-600">
                      Optional. Add up to 5 photos (whole load, sample pallets,
                      close-ups)
                    </p>
                    <FormControl>
                      <div className="space-y-4">
                        {publicId ? (
                          <FileUploader
                            aria-label="Additional photos uploader"
                            path={imagesPath}
                            maxFileCount={5}
                            isResumable
                            acceptedFileTypes={["image/*"]}
                            maxFileSize={10 * 1024 * 1024} // 10MB
                            onUploadSuccess={handleRequiredPhotosSuccess}
                            onUploadError={handleUploadError}
                            onFileRemove={async ({ key }) => {
                              if (!key) return;
                              await removeFromS3(key);
                              const keys: string[] =
                                form.getValues(
                                  "imagesMedia.requiredPhotoKeys"
                                ) || [];
                              const next = keys.filter(
                                (k: string) => k !== key
                              );
                              form.setValue(
                                "imagesMedia.requiredPhotoKeys",
                                next
                              );
                            }}
                          />
                        ) : (
                          <div className="text-sm text-neutral-500">
                            Preparing uploader...
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Video Upload */}
            <div>
              <FormField
                control={form.control}
                name="imagesMedia.videoUpload"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="font-medium text-neutral-900">
                      Video Upload
                    </FormLabel>
                    <p className="mb-2 text-sm text-neutral-600">
                      Optional, recommended for better visibility
                    </p>
                    <FormControl>
                      {publicId ? (
                        <FileUploader
                          aria-label="Video uploader"
                          path={videoPath}
                          maxFileCount={1}
                          maxFileSize={100000000}
                          acceptedFileTypes={[
                            "video/mp4",
                            "video/mpeg",
                            "video/quicktime",
                          ]}
                          isResumable
                          onUploadSuccess={handleVideoSuccess}
                          onUploadError={handleUploadError}
                          onFileRemove={async ({ key }) => {
                            if (!key) return;
                            await removeFromS3(key);
                            const current: string | undefined = form.getValues(
                              "imagesMedia.videoUploadKey"
                            );
                            if (current === key) {
                              form.setValue(
                                "imagesMedia.videoUploadKey",
                                undefined
                              );
                            }
                          }}
                        />
                      ) : (
                        <div className="text-sm text-neutral-500">
                          Preparing uploader...
                        </div>
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
});
