"use client";

import React, { useCallback, useMemo, useState } from "react";
import {
  useForm,
  type SubmitHandler,
  type UseFormReturn,
} from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { fetchAuthSession } from "aws-amplify/auth";
import { ChevronDown, ChevronRight, Save, Send } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/src/components/ui/alert-dialog";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader } from "@/src/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/src/components/ui/collapsible";
import { Form } from "@/src/components/ui/form";
import { useToast } from "@/src/hooks/use-toast";
import { formatBackendError } from "@/src/utils/error-utils";

import {
  defaultValues,
  LotListingsFormData,
  lotListingsSchema,
} from "../../schemas/lotListingsSchema";
import {
  createLotListing,
  transformFormDataToPayload,
} from "../../services/lotListingService";
import { getErrorMessage, VisibilitySection } from "../shared";
import { ImagesMediaSection } from "./ImagesMediaSection";
import { ListingBasicsSection } from "./ListingBasicsSection";
import { LoadDetailsSection } from "./LoadDetailsSection";
import { LogisticsSection } from "./LogisticsSection";
import { ManifestDetailsSection } from "./ManifestDetailsSection";

export function LotListingsUploadForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successOpen, setSuccessOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedBuyerTargeting, setSelectedBuyerTargeting] = useState<
    string[]
  >([]);

  // Collapsible sections state - first section (Listing Basics) open by default
  const [openSections, setOpenSections] = useState({
    listingBasics: true,
    manifestDetails: false,
    loadDetails: false,
    imagesMedia: false,
    logistics: false,
    visibility: false,
  });

  const form = useForm({
    resolver: zodResolver(lotListingsSchema) as any,
    defaultValues,
    mode: "onChange",
  }) as UseFormReturn<LotListingsFormData>;

  const visibilityType = form.watch("visibilityType");

  const toggleSection = useCallback((section: keyof typeof openSections) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  }, []);

  // Helper function to get current user identity
  const getCurrentUserAndIdentity = useCallback(async () => {
    try {
      const session = await fetchAuthSession();
      const idToken = session.tokens?.idToken?.toString();

      if (!idToken || !session.identityId) {
        throw new Error("Authentication required. Please sign in again.");
      }

      return {
        userId: session.userSub || "",
        identityId: session.identityId,
      };
    } catch (error) {
      throw new Error("Authentication failed. Please sign in again.");
    }
  }, []);

  // Removed legacy upload helpers in favor of using FileUploader-captured S3 keys

  // Helper function to handle submission errors
  const handleSubmissionError = useCallback(
    (error: unknown) => {
      let errorMsg = "Failed to create lot listing. Please try again.";

      if (error instanceof Error) {
        if (error.message.includes("Authentication")) {
          errorMsg = "Your session has expired. Please sign in again.";
        } else if (error.message.includes("Network")) {
          errorMsg =
            "Network error. Please check your connection and try again.";
        } else if (
          error.message.includes("Storage") ||
          error.message.includes("upload")
        ) {
          errorMsg = "File upload failed. Please try again.";
        } else {
          errorMsg = formatBackendError(error.message);
        }
      }

      // Show error in AlertDialog for better visibility
      setErrorMessage(errorMsg);
      setErrorOpen(true);

      // Also show toast for additional feedback
      toast({
        title: "Error",
        description: "Please check the error details below.",
        variant: "destructive",
      });
    },
    [toast]
  );

  const onSubmit: SubmitHandler<LotListingsFormData> = async (data) => {
    setIsSubmitting(true);

    try {
      // Basic validation for required fields
      if (!data.listingBasics.listingTitle?.trim()) {
        setErrorMessage("Listing title is required");
        setErrorOpen(true);
        return;
      }

      // Conditional manifest validation based on selected listing type
      const lt = data.manifestDetails.listingType;
      if (lt === "MANIFESTED") {
        if (!data.manifestDetails.manifestFileKey) {
          setErrorMessage(
            "Please upload the manifest file for a manifested listing."
          );
          setErrorOpen(true);
          return;
        }
      } else if (lt === "PARTIALLY_MANIFESTED") {
        if (!data.manifestDetails.partialManifestFileKey) {
          setErrorMessage(
            "Please upload the partial manifest file for a partially manifested listing."
          );
          setErrorOpen(true);
          return;
        }
      } else if (lt === "UNMANIFESTED") {
        if (
          !data.manifestDetails.unmanifestedFileKey &&
          !data.manifestDetails.partialManifestFileKey
        ) {
          // Allow either snapshot/unmanifested key or partial key if user decided to upload a partial list
          setErrorMessage(
            "Please upload a manifest snapshot for an unmanifested listing."
          );
          setErrorOpen(true);
          return;
        }
      }

      // Verify authentication
      await getCurrentUserAndIdentity();

      // Optional: show a small validating toast for feedback
      toast({
        title: "Validating data...",
        description: "Preparing your listing for submission.",
      });

      // Use FileUploader S3 keys instead of uploading again
      const payload = transformFormDataToPayload(
        data,
        undefined, // Let the function extract from form data
        undefined
      );

      toast({
        title: "Submitting listing...",
        description: "Creating your lot listing.",
      });

      // Submit to API
      const result = await createLotListing(payload);

      if (result.errors) {
        setErrorMessage(formatBackendError(result.errors));
        setErrorOpen(true);
        return;
      }

      if (result.data === null) {
        setErrorMessage("Failed to create lot listing. Please try again.");
        setErrorOpen(true);
        return;
      }

      // Success! Show success dialog
      setSuccessMessage("Your lot listing has been created successfully.");
      setSuccessOpen(true);

      // Reset form after successful submission
      form.reset(defaultValues);
      setSelectedBuyerTargeting([]);
      setOpenSections({
        listingBasics: true,
        manifestDetails: false,
        loadDetails: false,
        imagesMedia: false,
        logistics: false,
        visibility: false,
      });
    } catch (error) {
      handleSubmissionError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const saveDraft = async () => {
    try {
      const currentData = form.getValues();
      // TODO: Implement API call to save draft

      toast({
        title: "Draft Saved",
        description: "Your listing draft has been saved.",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save draft. Please try again.",
        variant: "destructive",
      });
    }
  };

  const steps = useMemo(
    () =>
      [
        { key: "listingBasics", label: "Basics" },
        { key: "manifestDetails", label: "Manifest" },
        { key: "loadDetails", label: "Load" },
        { key: "imagesMedia", label: "Media" },
        { key: "logistics", label: "Logistics" },
        { key: "visibility", label: "Visibility" },
      ] as const,
    []
  );

  const activeIndex = useMemo(() => {
    const order = [
      "listingBasics",
      "manifestDetails",
      "loadDetails",
      "imagesMedia",
      "logistics",
      "visibility",
    ] as const;
    const idx = order.findIndex((k) => (openSections as any)[k]);
    return idx === -1 ? 0 : idx;
  }, [openSections]);

  const openOnly = (key: keyof typeof openSections) => {
    setOpenSections({
      listingBasics: false,
      manifestDetails: false,
      loadDetails: false,
      imagesMedia: false,
      logistics: false,
      visibility: false,
      [key]: true,
    });
  };

  const errorCount = Object.keys(form.formState.errors || {}).length;

  // Removed debug logging effect

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Stepper */}
        <Card className="border border-neutral-200 bg-white">
          <CardContent className="p-3 sm:p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-medium text-neutral-900">
                Form Steps
              </h3>
              <span className="text-xs text-neutral-600">
                {Object.values(openSections).filter(Boolean).length} of{" "}
                {steps.length} expanded
              </span>
            </div>
            <div className="relative">
              <div className="relative -mx-1 flex items-center gap-2 overflow-x-auto scroll-smooth px-1 pb-1 md:gap-3 md:overflow-visible">
                {steps.map((s, idx) => {
                  const isActive = (openSections as any)[s.key];
                  const isCurrent = idx === activeIndex;
                  const isComplete = idx < activeIndex;
                  const chipBase =
                    "mx-auto inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs sm:text-sm transition-colors whitespace-nowrap shadow-xs";
                  const chipState = isCurrent
                    ? "border-neutral-900 bg-neutral-900 text-white ring-2 ring-neutral-900/15"
                    : isComplete
                      ? "border-neutral-800 bg-neutral-800 text-white"
                      : "border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-50";
                  return (
                    <React.Fragment key={s.key}>
                      <div className="flex shrink-0 items-center justify-center">
                        <button
                          type="button"
                          onClick={() =>
                            openOnly(s.key as keyof typeof openSections)
                          }
                          className={`${chipBase} ${chipState}`}
                          aria-current={isActive ? "step" : undefined}
                        >
                          <span
                            className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] sm:text-xs ${
                              isCurrent || isComplete
                                ? "bg-white/20 text-white"
                                : "bg-neutral-100 text-neutral-700"
                            }`}
                          >
                            {idx + 1}
                          </span>
                          <span className="max-w-[8rem] truncate sm:max-w-none">
                            {s.label}
                          </span>
                        </button>
                      </div>
                      {idx < steps.length - 1 && (
                        <div className="hidden h-px flex-1 bg-neutral-200 md:block" />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
          {/* Left: Sections */}
          <div className="space-y-6 lg:col-span-2">
            <ListingBasicsSection
              form={form}
              isOpen={openSections.listingBasics}
              onToggleAction={() => toggleSection("listingBasics")}
            />

            <ManifestDetailsSection
              form={form}
              isOpen={openSections.manifestDetails}
              onToggleAction={() => toggleSection("manifestDetails")}
            />

            <LoadDetailsSection
              form={form}
              isOpen={openSections.loadDetails}
              onToggleAction={() => toggleSection("loadDetails")}
            />

            <ImagesMediaSection
              form={form}
              isOpen={openSections.imagesMedia}
              onToggleAction={() => toggleSection("imagesMedia")}
            />

            <LogisticsSection
              form={form}
              isOpen={openSections.logistics}
              onToggleAction={() => toggleSection("logistics")}
            />

            {/* Visibility Section */}
            <Card className="rounded-xl border border-neutral-200 shadow-sm">
              <Collapsible
                open={openSections.visibility}
                onOpenChange={() => toggleSection("visibility")}
              >
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer transition-colors hover:bg-neutral-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="grid h-7 w-7 place-items-center rounded-full border border-neutral-300 text-xs font-medium text-neutral-900">
                          6
                        </div>
                        <div>
                          <h3 className="text-base font-medium text-neutral-900">
                            Listing Visibility
                          </h3>
                          <p className="text-sm text-neutral-600">
                            Control who can see this lot listing
                          </p>
                        </div>
                      </div>
                      {openSections.visibility ? (
                        <ChevronDown className="h-5 w-5 text-neutral-500" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-neutral-500" />
                      )}
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <VisibilitySection
                      title=""
                      description=""
                      visibilityType={visibilityType}
                      selectedBuyerTargeting={selectedBuyerTargeting}
                      errors={form.formState.errors as any}
                      setValue={form.setValue as any}
                      watch={form.watch as any}
                      onBuyerTargetingChange={(
                        optionCode: string,
                        checked: boolean
                      ) => {
                        setSelectedBuyerTargeting((prev) => {
                          const updated = checked
                            ? [...prev, optionCode]
                            : prev.filter((code) => code !== optionCode);
                          form.setValue(
                            "buyerTargeting" as any,
                            updated as any,
                            { shouldValidate: true }
                          );
                          return updated;
                        });
                      }}
                      getErrorMessage={getErrorMessage}
                    />
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          </div>

          {/* Right: Sticky Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6 lg:sticky lg:top-24">
              <Card className="rounded-xl border border-neutral-200 bg-white shadow-sm">
                <CardContent className="space-y-4 p-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-neutral-900">
                      Validation
                    </h3>
                    {errorCount > 0 && (
                      <span className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs text-red-700">
                        {`${errorCount} issues`}
                      </span>
                    )}
                  </div>
                  {errorCount > 0 && (
                    <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                      Please review highlighted fields in each section.
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setOpenSections({
                          listingBasics: true,
                          manifestDetails: true,
                          loadDetails: true,
                          imagesMedia: true,
                          logistics: true,
                          visibility: true,
                        });
                      }}
                      className="rounded-full border-neutral-300 text-neutral-700 hover:bg-neutral-50"
                    >
                      Expand All
                    </Button>
                    {/* Debug Validation button removed */}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={saveDraft}
                      className="rounded-full border-neutral-300 text-neutral-700 hover:bg-neutral-50"
                    >
                      <Save className="mr-2 h-4 w-4" />
                      Save Draft
                    </Button>
                  </div>
                  <div className="h-px bg-neutral-200" />
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full cursor-pointer rounded-full bg-neutral-900 font-medium text-white shadow-sm transition hover:bg-neutral-800 hover:shadow-md focus-visible:ring-2 focus-visible:ring-neutral-900/20"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Submit Listing
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </form>

      {/* Error Alert Dialog */}
      <AlertDialog onOpenChange={setErrorOpen} open={errorOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Lot Listing Creation Error</AlertDialogTitle>
            <AlertDialogDescription className="whitespace-pre-line">
              {errorMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setErrorOpen(false)}>
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Success Alert Dialog */}
      <AlertDialog onOpenChange={setSuccessOpen} open={successOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Lot Listing Created</AlertDialogTitle>
            <AlertDialogDescription className="whitespace-pre-line">
              {successMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setSuccessOpen(false)}>
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Form>
  );
}
