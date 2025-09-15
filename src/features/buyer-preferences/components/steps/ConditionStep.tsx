"use client";

import React, { useCallback, useMemo, useState } from "react";

import { ChevronDown, Search, X } from "lucide-react";

import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Checkbox } from "@/src/components/ui/checkbox";
import { Input } from "@/src/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";

import { CONDITION_OPTIONS } from "../../data/preferenceOptions";
import type { StepComponentProps } from "../../types/preferences";

/**
 * ConditionStep component for selecting product conditions in buyer preferences
 * Uses shadcn dropdown with multi-select functionality
 */
const ConditionStep: React.FC<StepComponentProps> = ({
  preferences,
  updatePreferences,
}) => {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = useState("");

  const selectedConditions = useMemo(
    () => preferences.conditions || [],
    [preferences.conditions]
  );

  const conditionMap = useMemo(() => {
    return new Map(CONDITION_OPTIONS.map((opt) => [opt.value, opt.label]));
  }, []);

  const handleConditionToggle = useCallback(
    (conditionValue: string) => {
      const isSelected = selectedConditions.includes(conditionValue);
      const newConditions = isSelected
        ? selectedConditions.filter((c) => c !== conditionValue)
        : [...selectedConditions, conditionValue];

      updatePreferences({ conditions: newConditions });
    },
    [selectedConditions, updatePreferences]
  );

  const removeCondition = useCallback(
    (conditionToRemove: string) => {
      const newConditions = selectedConditions.filter(
        (condition) => condition !== conditionToRemove
      );
      updatePreferences({ conditions: newConditions });
    },
    [selectedConditions, updatePreferences]
  );

  const clearAllConditions = useCallback(() => {
    updatePreferences({ conditions: [] });
  }, [updatePreferences]);

  const selectedText = useMemo(() => {
    const count = selectedConditions.length;
    if (count === 0) return "Select conditions...";
    if (count === 1)
      return conditionMap.get(selectedConditions[0]) || selectedConditions[0];
    return `${count} conditions selected`;
  }, [selectedConditions, conditionMap]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return CONDITION_OPTIONS;
    return CONDITION_OPTIONS.filter((c) =>
      c.label.toLowerCase().includes(term)
    );
  }, [search]);

  return (
    <div className="space-y-6">
      {/* Dropdown Selector */}
      <div className="space-y-2">
        <Popover onOpenChange={setOpen} open={open}>
          <PopoverTrigger asChild>
            <Button
              aria-expanded={open}
              className="h-12 w-full justify-between text-left font-normal"
              variant="outline"
            >
              <span className="truncate">{selectedText}</span>
              <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            className="w-[var(--radix-popover-trigger-width)] p-0"
          >
            <div className="bg-background sticky top-0 z-10 border-b p-2">
              <div className="relative">
                <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                <Input
                  className="h-9 w-full pl-9"
                  placeholder="Search conditions..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div
              className="max-h-[300px] overflow-y-auto"
              onWheel={(e) => e.stopPropagation()}
            >
              {filtered.map((c) => {
                const isSelected = selectedConditions.includes(c.value);
                const id = `cond-${c.value}`;
                return (
                  <div
                    key={c.value}
                    className="flex items-center p-3 hover:bg-gray-50"
                  >
                    <Checkbox
                      checked={isSelected}
                      className="mr-3"
                      id={id}
                      onCheckedChange={() => handleConditionToggle(c.value)}
                    />
                    <label
                      className="text-foreground/90 flex-1 cursor-pointer text-sm"
                      htmlFor={id}
                    >
                      {c.label}
                    </label>
                  </div>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Selected Conditions Display */}
      {selectedConditions.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700">
              Selected Conditions ({selectedConditions.length})
            </h3>
            <Button
              className="h-8 text-xs"
              onClick={clearAllConditions}
              size="sm"
              variant="ghost"
            >
              Clear All
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {selectedConditions.map((conditionValue) => (
              <Badge
                className="flex items-center gap-1 px-3 py-1"
                key={conditionValue}
                variant="secondary"
              >
                <span>
                  {conditionMap.get(conditionValue) || conditionValue}
                </span>
                <Button
                  className="text-muted-foreground hover:text-foreground ml-1 h-auto p-0"
                  onClick={() => removeCondition(conditionValue)}
                  size="sm"
                  variant="ghost"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export { ConditionStep };
export default ConditionStep;
