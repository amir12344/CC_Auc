"use client";

import React, { useCallback } from "react";

import { DollarSign } from "lucide-react";

import { Input } from "@/src/components/ui/input";

interface BudgetInputProps {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
  placeholder: string;
  min?: number;
  max?: number;
}

export const BudgetInput = ({
  label,
  value,
  onChange,
  placeholder,
  min = 0,
  max,
}: BudgetInputProps) => {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      if (inputValue === "") {
        onChange(null);
      } else {
        const numValue = Number.parseFloat(inputValue);
        if (
          !Number.isNaN(numValue) &&
          numValue >= min &&
          (!max || numValue <= max)
        ) {
          onChange(numValue);
        }
      }
    },
    [onChange, min, max]
  );

  return (
    <div className="relative">
      <DollarSign className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
      <Input
        aria-label={label}
        className="h-12 pl-10"
        max={max}
        min={min}
        onChange={handleChange}
        placeholder={placeholder}
        step="0.01"
        type="number"
        value={value ?? ""}
      />
    </div>
  );
};

export default BudgetInput;
