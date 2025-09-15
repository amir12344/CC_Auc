"use client";

import { useId, useMemo, useState } from "react";

import { Check, ChevronsUpDown, X } from "lucide-react";

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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";
import { cn } from "@/src/lib/utils";

export interface Option {
  value: string;
  label: string;
}

interface MultiSelectCommandProps {
  options: ReadonlyArray<Option>;
  selected: ReadonlyArray<string>;
  onChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
  label?: string;
  hideLabel?: boolean;
  id?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean | "true" | "false";
}

export function MultiSelectCommand({
  options,
  selected,
  onChange,
  placeholder = "Select options...",
  className,
  label,
  hideLabel = false,
  id,
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
}: MultiSelectCommandProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const fallbackId = useId();
  const controlId = id ?? fallbackId;

  const handleToggle = (value: string) => {
    const newSelected = selected.includes(value)
      ? selected.filter((item) => item !== value)
      : [...selected, value];
    onChange(newSelected);
  };

  const filteredOptions = useMemo(
    () =>
      options.filter((option) =>
        option.label.toLowerCase().includes(query.toLowerCase())
      ),
    [options, query]
  );

  const selectedObjectsMap = useMemo(() => {
    const map = new Map<string, Option>();
    for (const opt of options) {
      if (selected.includes(opt.value)) {
        map.set(opt.value, opt);
      }
    }
    return map;
  }, [selected, options]);

  const selectedObjects = Array.from(selectedObjectsMap.values());

  return (
    <div className="space-y-2">
      {!hideLabel && (
        <label
          className="text-sm font-medium text-gray-900"
          htmlFor={controlId}
        >
          {label}
        </label>
      )}
      <Popover onOpenChange={setOpen} open={open}>
        <PopoverTrigger asChild>
          <Button
            aria-expanded={open}
            aria-describedby={ariaDescribedBy}
            aria-invalid={ariaInvalid}
            className={cn(
              "w-full justify-between text-left font-normal",
              className
            )}
            id={controlId}
            onClick={() => setOpen(!open)}
            variant="outline"
          >
            <span className="truncate text-gray-700">
              {selected.length > 0
                ? `${selected.length} selected`
                : placeholder}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-[--radix-popover-trigger-width] p-0"
          sideOffset={4}
        >
          <Command className="max-h-[300px]" shouldFilter={false}>
            <CommandInput
              className="border-0"
              onValueChange={setQuery}
              placeholder="Search..."
              value={query}
            />
            <CommandList className="max-h-[250px] overflow-auto">
              <CommandEmpty className="py-3 text-center text-sm">
                No results found.
              </CommandEmpty>
              {filteredOptions.length > 0 && (
                <CommandGroup>
                  {filteredOptions.map((option) => (
                    <CommandItem
                      className="flex items-center px-2 aria-selected:bg-gray-100"
                      key={option.value}
                      onSelect={() => handleToggle(option.value)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selected.includes(option.value)
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      {option.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedObjects.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedObjects.map((item) => (
            <Badge
              className="border border-gray-300 bg-gray-100 px-3 py-1.5 text-sm text-gray-700 transition-colors hover:bg-gray-200"
              key={item.value}
              variant="secondary"
            >
              <span className="max-w-[120px] truncate">{item.label}</span>
              <button
                aria-label={`Remove ${item.label}`}
                className="ml-2 transition-colors hover:text-gray-900"
                onClick={() => handleToggle(item.value)}
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
}
