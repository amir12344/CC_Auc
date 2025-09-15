import React, { useState } from "react";

import { ChevronDown, ChevronUp } from "lucide-react";

import type { FilterOption } from "../types/filterTypes";

interface CheckboxFilterProps {
  title: string;
  options: FilterOption[];
  selectedValues: string[];
  onChange: (selectedValues: string[]) => void;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  maxVisibleOptions?: number;
  className?: string;
}

export const CheckboxFilter: React.FC<CheckboxFilterProps> = ({
  title,
  options,
  selectedValues,
  onChange,
  collapsible = true,
  defaultExpanded = false,
  maxVisibleOptions = 5,
  className = "",
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [showAll, setShowAll] = useState(false);

  const handleCheckboxChange = (value: string, checked: boolean) => {
    if (checked) {
      onChange([...selectedValues, value]);
    } else {
      onChange(selectedValues.filter((v) => v !== value));
    }
  };

  const visibleOptions = showAll
    ? options
    : options.slice(0, maxVisibleOptions);
  const hasMoreOptions = options.length > maxVisibleOptions;

  if (options.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      {/* Content - No Header since it's handled in parent */}
      <div className="space-y-3">
        {visibleOptions.map((option) => (
          <div key={option.value} className="group flex items-center">
            <input
              id={`${title}-${option.value}`}
              type="checkbox"
              checked={selectedValues.includes(option.value)}
              onChange={(e) =>
                handleCheckboxChange(option.value, e.target.checked)
              }
              className="h-4 w-4 rounded-none border-gray-300 text-black focus:ring-1 focus:ring-black"
            />
            <label
              htmlFor={`${title}-${option.value}`}
              className="ml-3 cursor-pointer text-sm text-gray-700 transition-colors duration-150 select-none hover:text-black"
            >
              <span className="font-normal">{option.label}</span>
              <span className="ml-1 text-gray-400">({option.count})</span>
            </label>
          </div>
        ))}

        {/* Show More/Less Toggle */}
        {hasMoreOptions && !showAll && (
          <button
            type="button"
            onClick={() => setShowAll(true)}
            className="text-sm font-medium text-gray-500 transition-colors duration-150 hover:text-black"
          >
            + Show {options.length - maxVisibleOptions} more
          </button>
        )}

        {hasMoreOptions && showAll && (
          <button
            type="button"
            onClick={() => setShowAll(false)}
            className="text-sm font-medium text-gray-500 transition-colors duration-150 hover:text-black"
          >
            Show less
          </button>
        )}

        {/* Clear Selection */}
        {selectedValues.length > 0 && (
          <button
            type="button"
            onClick={() => onChange([])}
            className="mt-2 text-xs font-medium tracking-wide text-gray-400 uppercase transition-colors duration-150 hover:text-black"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
};
