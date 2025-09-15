"use client";

import { useState } from "react";

import { CheckCircle, ChevronDown, ChevronRight } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/src/components/ui/collapsible";
import { cn } from "@/src/lib/utils";

import { FormSectionProps } from "../../types/forms";

/**
 * Reusable form section component
 *
 * Provides a consistent wrapper for form sections with optional collapsible behavior,
 * completion status, and proper styling using shadcn/ui components.
 */
export function FormSection({
  title,
  description,
  children,
  isRequired = false,
  isComplete = false,
  isCollapsible = false,
  defaultExpanded = true,
  className,
}: FormSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const sectionContent = (
    <Card className={cn("mb-6", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2 text-lg">
              {title}
              {isRequired && <span className="text-sm text-red-500">*</span>}
              {isComplete && <CheckCircle className="h-5 w-5 text-green-600" />}
            </CardTitle>
            {description && (
              <p className="mt-1 text-sm text-gray-600">{description}</p>
            )}
          </div>
          {isCollapsible && (
            <div className="flex items-center">
              {isExpanded ? (
                <ChevronDown className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronRight className="h-5 w-5 text-gray-500" />
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">{children}</CardContent>
    </Card>
  );

  if (isCollapsible) {
    return (
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <Card
            className={cn(
              "mb-6 cursor-pointer transition-shadow hover:shadow-md",
              className
            )}
          >
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    {title}
                    {isRequired && (
                      <span className="text-sm text-red-500">*</span>
                    )}
                    {isComplete && (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    )}
                  </CardTitle>
                  {description && (
                    <p className="mt-1 text-sm text-gray-600">{description}</p>
                  )}
                </div>
                <div className="flex items-center">
                  {isExpanded ? (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-gray-500" />
                  )}
                </div>
              </div>
            </CardHeader>
          </Card>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <Card className={cn("mt-2 mb-6", className)}>
            <CardContent className="pt-6">{children}</CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    );
  }

  return sectionContent;
}
