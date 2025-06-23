'use client';

import { useState } from 'react';
import { FormSectionProps } from '../../types/forms';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/src/components/ui/collapsible';
import { ChevronDown, ChevronRight, CheckCircle } from 'lucide-react';
import { cn } from '@/src/lib/utils';

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
    <Card className={cn('mb-6', className)}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2 text-lg">
              {title}
              {isRequired && (
                <span className="text-red-500 text-sm">*</span>
              )}
              {isComplete && (
                <CheckCircle className="w-5 h-5 text-green-600" />
              )}
            </CardTitle>
            {description && (
              <p className="text-sm text-gray-600 mt-1">
                {description}
              </p>
            )}
          </div>
          {isCollapsible && (
            <div className="flex items-center">
              {isExpanded ? (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-500" />
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {children}
      </CardContent>
    </Card>
  );

  if (isCollapsible) {
    return (
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <Card className={cn('mb-6 cursor-pointer hover:shadow-md transition-shadow', className)}>
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    {title}
                    {isRequired && (
                      <span className="text-red-500 text-sm">*</span>
                    )}
                    {isComplete && (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    )}
                  </CardTitle>
                  {description && (
                    <p className="text-sm text-gray-600 mt-1">
                      {description}
                    </p>
                  )}
                </div>
                <div className="flex items-center">
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-500" />
                  )}
                </div>
              </div>
            </CardHeader>
          </Card>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <Card className={cn('mb-6 mt-2', className)}>
            <CardContent className="pt-6">
              {children}
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    );
  }

  return sectionContent;
} 
