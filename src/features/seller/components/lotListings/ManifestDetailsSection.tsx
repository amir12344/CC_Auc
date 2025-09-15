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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { useUserPublicId } from "@/src/features/seller/hooks/useUserPublicId";
import { useToast } from "@/src/hooks/use-toast";

import { LISTING_TYPES } from "../../constants/lotListingsConstants";
import type { LotListingsFormData } from "../../schemas/lotListingsSchema";

interface ManifestDetailsSectionProps {
  form: UseFormReturn<LotListingsFormData>;
  isOpen: boolean;
  onToggleAction: () => void;
}

export const ManifestDetailsSection = React.memo(
  function ManifestDetailsSection({
    form,
    isOpen,
    onToggleAction,
  }: ManifestDetailsSectionProps) {
    const controlClass =
      "w-full h-11 rounded-lg border-neutral-300 focus-visible:ring-2 focus-visible:ring-neutral-900/10 focus-visible:ring-offset-0";
    const listingType = form.watch("manifestDetails.listingType");
    const { toast } = useToast();
    const [manifestFileKey, setManifestFileKey] = useState<string | null>(null);
    const [partialManifestFileKey, setPartialManifestFileKey] = useState<
      string | null
    >(null);
    const [unmanifestedSnapshotFileKey, setUnmanifestedSnapshotFileKey] =
      useState<string | null>(null);
    const { publicId } = useUserPublicId();

    // Helper to remove an object from S3 by its full path key with feedback
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

    // Ensure RHF knows about these fields even if inputs aren't rendered
    useEffect(() => {
      if (form?.register) {
        try {
          form.register("manifestDetails.manifestFileKey");
          form.register("manifestDetails.partialManifestFileKey");
          form.register("manifestDetails.unmanifestedFileKey");
        } catch (e) {
          // noop
        }
      }
    }, [form]);

    // Generate upload paths similar to images (include public_id)
    const manifestPath = ({ identityId }: { identityId?: string }) =>
      `LotListingManifests/private/${identityId || "anonymous"}/${publicId || "unknown"}/manifests/`;
    const partialManifestPath = ({ identityId }: { identityId?: string }) =>
      `LotListingManifests/private/${identityId || "anonymous"}/${publicId || "unknown"}/partial/`;

    // Handle manifest file upload success
    const handleManifestSuccess = useCallback(
      async (event: { key?: string }) => {
        const key = event.key;
        if (!key) {
          return;
        }

        // If a previous manifest exists, delete it first to avoid orphaned objects
        const prev = form.getValues("manifestDetails.manifestFileKey") as
          | string
          | undefined;
        if (prev && prev !== key) {
          await removeFromS3(prev);
        }

        // Persist key to form with validation and dirtiness flags
        form.setValue("manifestDetails.manifestFileKey", key, {
          shouldDirty: true,
          shouldValidate: true,
          shouldTouch: true,
        } as any);
        // Trigger validation for that field
        if (form?.trigger) {
          form.trigger("manifestDetails.manifestFileKey");
        }

        setManifestFileKey(key);

        toast({
          title: "Manifest file uploaded successfully",
        });
      },
      [form, toast, removeFromS3]
    );

    // Handle partial/unmanifested manifest file upload success
    const handlePartialManifestSuccess = useCallback(
      async (event: { key?: string }) => {
        const key = event.key;
        if (!key) {
          return;
        }

        if (listingType === "PARTIALLY_MANIFESTED") {
          const prev = form.getValues(
            "manifestDetails.partialManifestFileKey"
          ) as string | undefined;
          if (prev && prev !== key) {
            await removeFromS3(prev);
          }
          form.setValue("manifestDetails.partialManifestFileKey", key, {
            shouldDirty: true,
            shouldValidate: true,
            shouldTouch: true,
          } as any);
          if (form?.trigger) {
            form.trigger("manifestDetails.partialManifestFileKey");
          }
          setPartialManifestFileKey(key);
          toast({
            title: "Partial manifest uploaded successfully",
          });
        } else if (listingType === "UNMANIFESTED") {
          const prev = form.getValues("manifestDetails.unmanifestedFileKey") as
            | string
            | undefined;
          if (prev && prev !== key) {
            await removeFromS3(prev);
          }
          form.setValue("manifestDetails.unmanifestedFileKey", key, {
            shouldDirty: true,
            shouldValidate: true,
            shouldTouch: true,
          } as any);
          if (form?.trigger) {
            form.trigger("manifestDetails.unmanifestedFileKey");
          }
          setUnmanifestedSnapshotFileKey(key);
          toast({
            title: "Manifest snapshot uploaded successfully",
          });
        } else {
          // Fallback: if type somehow not set yet, just store as partial
          const prev = form.getValues(
            "manifestDetails.partialManifestFileKey"
          ) as string | undefined;
          if (prev && prev !== key) {
            await removeFromS3(prev);
          }
          form.setValue("manifestDetails.partialManifestFileKey", key, {
            shouldDirty: true,
            shouldValidate: true,
            shouldTouch: true,
          } as any);
          setPartialManifestFileKey(key);
        }
      },
      [form, toast, listingType, removeFromS3]
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

    // Clear previously selected/uploaded keys if listing type changes
    useEffect(() => {
      // When type changes, delete any previously uploaded files and reset keys
      const cleanup = async () => {
        try {
          const prevManifest = form.getValues(
            "manifestDetails.manifestFileKey"
          ) as string | undefined;
          const prevPartial = form.getValues(
            "manifestDetails.partialManifestFileKey"
          ) as string | undefined;
          const prevUnmanifested = form.getValues(
            "manifestDetails.unmanifestedFileKey"
          ) as string | undefined;
          await Promise.all([
            removeFromS3(prevManifest),
            removeFromS3(prevPartial),
            removeFromS3(prevUnmanifested),
          ]);
        } finally {
          form.setValue(
            "manifestDetails.manifestFileKey",
            undefined as any,
            { shouldDirty: true } as any
          );
          form.setValue(
            "manifestDetails.partialManifestFileKey",
            undefined as any,
            { shouldDirty: true } as any
          );
          form.setValue(
            "manifestDetails.unmanifestedFileKey",
            undefined as any,
            { shouldDirty: true } as any
          );
          setManifestFileKey(null);
          setPartialManifestFileKey(null);
          setUnmanifestedSnapshotFileKey(null);
        }
      };
      // Only run cleanup if the form has any existing keys
      cleanup();
    }, [listingType, form, removeFromS3]);

    return (
      <Card className="rounded-xl border border-neutral-200 shadow-sm">
        <Collapsible open={isOpen} onOpenChange={onToggleAction}>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer transition-colors hover:bg-neutral-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="grid h-7 w-7 place-items-center rounded-full border border-neutral-300 text-xs font-medium text-neutral-900">
                    2
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-neutral-900">
                      Manifest Details
                    </h3>
                    <p className="text-xs text-neutral-600">
                      Choose listing type and upload manifest
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
            <CardContent className="mt-2 space-y-6 pt-0">
              {/* Listing Type */}
              <FormField
                control={form.control}
                name="manifestDetails.listingType"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="font-medium text-neutral-900">
                      Listing Type <span className="text-red-500">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || undefined}
                    >
                      <FormControl>
                        <SelectTrigger className={controlClass}>
                          <SelectValue placeholder="Select listing type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {LISTING_TYPES.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Conditional Upload Areas - only show after a selection is made */}
              {listingType ? (
                listingType === "MANIFESTED" ? (
                  <FormField
                    control={form.control}
                    name="manifestDetails.manifestFile"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="font-medium text-neutral-900">
                          Upload Manifest File{" "}
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <p className="mb-2 text-sm text-neutral-600">
                          CSV, XLSX, XLS, or PDF file containing your product
                          manifest
                        </p>
                        <FormControl>
                          {publicId ? (
                            <FileUploader
                              aria-label="Manifest file uploader"
                              path={manifestPath}
                              maxFileCount={1}
                              maxFileSize={50000000} // 50MB
                              acceptedFileTypes={[
                                ".csv",
                                ".xlsx",
                                ".xls",
                                ".pdf",
                              ]}
                              isResumable
                              onUploadSuccess={handleManifestSuccess}
                              onUploadError={handleUploadError}
                              onFileRemove={async ({ key }) => {
                                if (!key) return;
                                await removeFromS3(key);
                                const current: string | undefined =
                                  form.getValues(
                                    "manifestDetails.manifestFileKey"
                                  );
                                if (current === key) {
                                  form.setValue(
                                    "manifestDetails.manifestFileKey",
                                    undefined as any,
                                    { shouldDirty: true } as any
                                  );
                                  setManifestFileKey(null);
                                }
                              }}
                            />
                          ) : (
                            <div className="text-sm text-neutral-500">
                              Preparing uploader...
                            </div>
                          )}
                        </FormControl>
                        {manifestFileKey && (
                          <div className="text-sm text-green-600">
                            File uploaded: {manifestFileKey.split("/").pop()}
                          </div>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : (
                  <FormField
                    control={form.control}
                    name="manifestDetails.partialManifestFile"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="font-medium text-neutral-900">
                          {listingType === "PARTIALLY_MANIFESTED" ? (
                            <>
                              Upload Partial Manifest{" "}
                              <span className="text-red-500">*</span>
                            </>
                          ) : (
                            <>
                              Upload Manifest Snapshot{" "}
                              <span className="text-red-500">*</span>
                            </>
                          )}
                        </FormLabel>
                        <p className="mb-2 text-sm text-neutral-600">
                          {listingType === "PARTIALLY_MANIFESTED"
                            ? "Partial manifest file for your partially manifested load"
                            : "Snapshot or representative list for your unmanifested load"}
                        </p>
                        <FormControl>
                          {publicId ? (
                            <FileUploader
                              aria-label="Partial/unmanifested manifest uploader"
                              path={partialManifestPath}
                              maxFileCount={1}
                              maxFileSize={50000000} // 50MB
                              acceptedFileTypes={[
                                ".csv",
                                ".xlsx",
                                ".xls",
                                ".pdf",
                              ]}
                              isResumable
                              onUploadSuccess={handlePartialManifestSuccess}
                              onUploadError={handleUploadError}
                              onFileRemove={async ({ key }) => {
                                if (!key) return;
                                await removeFromS3(key);
                                if (listingType === "PARTIALLY_MANIFESTED") {
                                  const current = form.getValues(
                                    "manifestDetails.partialManifestFileKey"
                                  ) as string | undefined;
                                  if (current === key) {
                                    form.setValue(
                                      "manifestDetails.partialManifestFileKey",
                                      undefined as any,
                                      { shouldDirty: true } as any
                                    );
                                    setPartialManifestFileKey(null);
                                  }
                                } else if (listingType === "UNMANIFESTED") {
                                  const current = form.getValues(
                                    "manifestDetails.unmanifestedFileKey"
                                  ) as string | undefined;
                                  if (current === key) {
                                    form.setValue(
                                      "manifestDetails.unmanifestedFileKey",
                                      undefined as any,
                                      { shouldDirty: true } as any
                                    );
                                    setUnmanifestedSnapshotFileKey(null);
                                  }
                                }
                              }}
                            />
                          ) : (
                            <div className="text-sm text-neutral-500">
                              Preparing uploader...
                            </div>
                          )}
                        </FormControl>
                        {(listingType === "PARTIALLY_MANIFESTED"
                          ? partialManifestFileKey
                          : unmanifestedSnapshotFileKey) && (
                          <div className="text-sm text-green-600">
                            File uploaded:{" "}
                            {(listingType === "PARTIALLY_MANIFESTED"
                              ? partialManifestFileKey
                              : unmanifestedSnapshotFileKey)!
                              .split("/")
                              .pop()}
                          </div>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )
              ) : null}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    );
  }
);
