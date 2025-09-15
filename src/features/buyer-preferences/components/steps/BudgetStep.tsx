"use client";

import type React from "react";

import { DollarSign } from "lucide-react";

import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";

import type { StepComponentProps } from "../../types/preferences";

export const BudgetStep: React.FC<StepComponentProps> = ({
  preferences,
  updatePreferences,
}) => {
  const handleMaxBudgetChange = (value: string) => {
    const numValue = value === "" ? null : Number.parseFloat(value);
    updatePreferences({ maxBudget: numValue });
  };

  return (
    <div className="space-y-6">
      {/* Maximum budget input */}
      <div className="space-y-2">
        <Label
          className="text-sm font-medium text-gray-700"
          htmlFor="max-budget"
        >
          Maximum Budget
        </Label>
        <div className="relative">
          <DollarSign className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
          <Input
            className="h-12 pl-10"
            id="max-budget"
            min="0"
            onChange={(e) => handleMaxBudgetChange(e.target.value)}
            placeholder="Enter your maximum budget"
            step="0.01"
            type="number"
            value={preferences.maxBudget ?? ""}
          />
        </div>
      </div>
    </div>
  );
};
