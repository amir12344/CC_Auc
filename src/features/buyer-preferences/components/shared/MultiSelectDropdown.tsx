"use client";

import React, { useMemo, useState } from "react";

import { Check, ChevronDown, X } from "lucide-react";

import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/src/components/ui/command";
import { Label } from "@/src/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";

export type Option = { value: string; label: string };

interface MultiSelectDropdownProps {
  label: string;
  options: Option[];
  selectedItems: string[];
  onToggle: (item: string) => void;
  placeholder?: string;
  isLoading?: boolean;
  error?: string;
}

export const MultiSelectDropdown = ({
  label,
  options,
  selectedItems,
  onToggle,
  placeholder = "Select options...",
  isLoading = false,
  error,
}: MultiSelectDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredOptions = useMemo(() => {
    if (!searchTerm) return options;
    return options.filter((option) =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [options, searchTerm]);

  const selectedText = useMemo(() => {
    const count = selectedItems.length;
    if (isLoading) return "Loading...";
    if (count === 0) return placeholder;
    if (count === 1)
      return (
        options.find((o) => o.value === selectedItems[0])?.label ??
        selectedItems[0]
      );
    return `${count} selected`;
  }, [selectedItems, options, placeholder, isLoading]);

  return (
    <div className="space-y-3">
      <Label className="text-md font-medium text-gray-900">{label}</Label>
      <div className="w-full">
        <Popover onOpenChange={setIsOpen} open={isOpen}>
          <PopoverTrigger asChild>
            <Button
              className="h-12 w-full justify-between border-gray-300 text-left font-normal hover:bg-gray-50 disabled:opacity-50"
              disabled={isLoading}
              variant="outline"
            >
              <span className="truncate text-gray-700">{selectedText}</span>
              <ChevronDown
                className={`h-4 w-4 opacity-50 transition-transform ${isOpen ? "rotate-180" : ""}`}
              />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            className="w-[var(--radix-popover-trigger-width)] p-0"
            onCloseAutoFocus={(e) => e.preventDefault()}
          >
            <Command>
              <CommandInput
                className="h-12"
                onValueChange={setSearchTerm}
                placeholder="Search options..."
              />
              <CommandList>
                <CommandEmpty>No options found.</CommandEmpty>
                <CommandGroup>
                  {filteredOptions.map((option) => {
                    const isSelected = selectedItems.includes(option.value);
                    return (
                      <CommandItem
                        key={option.value}
                        onSelect={() => onToggle(option.value)}
                        value={option.label}
                      >
                        <div
                          className={`border-primary mr-2 flex h-4 w-4 items-center justify-center rounded-sm border ${
                            isSelected
                              ? "bg-primary text-primary-foreground"
                              : "opacity-50 [&_svg]:invisible"
                          }`}
                        >
                          <Check className="h-4 w-4" />
                        </div>
                        <span>{option.label}</span>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600">
          {error}
        </div>
      )}

      {selectedItems.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedItems.map((item) => (
            <Badge
              className="border border-gray-300 bg-gray-100 px-3 py-1.5 text-sm text-gray-700 transition-colors hover:bg-gray-200"
              key={item}
              variant="secondary"
            >
              <span className="max-w-[120px] truncate">
                {options.find((o) => o.value === item)?.label ?? item}
              </span>
              <button
                aria-label={`Remove ${item}`}
                className="ml-2 transition-colors hover:text-gray-900"
                onClick={() => onToggle(item)}
                type="button"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

export default MultiSelectDropdown;
