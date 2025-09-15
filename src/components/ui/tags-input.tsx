"use client";

import React from "react";

import { X } from "lucide-react";

import { Badge } from "@/src/components/ui/badge";
import { Input } from "@/src/components/ui/input";
import { cn } from "@/src/lib/utils";

interface TagsInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
  id?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean | "true" | "false";
  maxTags?: number;
  allowDuplicates?: boolean;
}

export function TagsInput({
  value,
  onChange,
  placeholder = "Type and press Enter",
  className,
  id,
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  maxTags,
  allowDuplicates = false,
}: TagsInputProps) {
  const [inputValue, setInputValue] = React.useState("");

  const addTag = (raw: string) => {
    const tag = raw.trim();
    if (!tag) return;
    if (maxTags && value.length >= maxTags) return;
    if (!allowDuplicates && value.some((t) => t.toLowerCase() === tag.toLowerCase()))
      return;
    onChange([...value, tag]);
  };

  const removeTag = (tag: string) => {
    onChange(value.filter((t) => t !== tag));
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (inputValue.trim() !== "") {
        addTag(inputValue);
        setInputValue("");
      }
    } else if (e.key === "Backspace" && inputValue === "" && value.length > 0) {
      // Backspace removes last tag when input is empty
      e.preventDefault();
      onChange(value.slice(0, -1));
    }
  };

  const handleBlur: React.FocusEventHandler<HTMLInputElement> = () => {
    if (inputValue.trim() !== "") {
      addTag(inputValue);
      setInputValue("");
    }
  };

  const handlePaste: React.ClipboardEventHandler<HTMLInputElement> = (e) => {
    const text = e.clipboardData.getData("text");
    if (text && (text.includes(",") || text.includes("\n"))) {
      e.preventDefault();
      const parts = text
        .split(/[,\n]/)
        .map((p) => p.trim())
        .filter(Boolean);
      if (parts.length) {
        let next = [...value];
        for (const p of parts) {
          if (!allowDuplicates && next.some((t) => t.toLowerCase() === p.toLowerCase()))
            continue;
          next.push(p);
          if (maxTags && next.length >= maxTags) break;
        }
        onChange(next);
      }
    }
  };

  return (
    <div className="space-y-2">
      <Input
        aria-describedby={ariaDescribedBy}
        aria-invalid={ariaInvalid}
        className={cn(className)}
        id={id}
        onBlur={handleBlur}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        placeholder={placeholder}
        value={inputValue}
      />

      {value?.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((tag, idx) => (
            <Badge
              className="border border-gray-300 bg-gray-100 px-3 py-1.5 text-sm text-gray-700 transition-colors hover:bg-gray-200"
              key={`${tag}-${idx}`}
              variant="secondary"
            >
              <span className="max-w-[160px] truncate" title={tag}>
                {tag}
              </span>
              <button
                aria-label={`Remove ${tag}`}
                className="ml-2 transition-colors hover:text-gray-900"
                onClick={() => removeTag(tag)}
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

