import React, { useEffect, useState } from "react";

import { ChevronDown, ChevronUp } from "lucide-react";

interface PriceRangeFilterProps {
  title: string;
  min: number;
  max: number;
  value: { min: number; max: number };
  onChange: (range: { min: number; max: number }) => void;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  className?: string;
}

export const PriceRangeFilter: React.FC<PriceRangeFilterProps> = ({
  title,
  min,
  max,
  value,
  onChange,
  collapsible = true,
  defaultExpanded = true,
  className = "",
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [localMin, setLocalMin] = useState(value.min);
  const [localMax, setLocalMax] = useState(value.max);

  // Update local state when props change
  useEffect(() => {
    setLocalMin(value.min);
    setLocalMax(value.max);
  }, [value.min, value.max]);

  const handleMinChange = (newMin: number) => {
    const clampedMin = Math.max(min, Math.min(newMin, localMax));
    setLocalMin(clampedMin);
    onChange({ min: clampedMin, max: localMax });
  };

  const handleMaxChange = (newMax: number) => {
    const clampedMax = Math.min(max, Math.max(newMax, localMin));
    setLocalMax(clampedMax);
    onChange({ min: localMin, max: clampedMax });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const isRangeModified = localMin !== min || localMax !== max;

  const resetRange = () => {
    setLocalMin(min);
    setLocalMax(max);
    onChange({ min, max });
  };

  if (min >= max) {
    return null;
  }

  return (
    <div className={`border-b border-gray-200 pb-4 ${className}`}>
      {/* Header */}
      <div
        className={`flex items-center justify-between ${collapsible ? "cursor-pointer" : ""}`}
        onClick={collapsible ? () => setIsExpanded(!isExpanded) : undefined}
      >
        {collapsible && (
          <button
            className="flex-shrink-0 p-1 text-gray-600 transition-colors duration-200 hover:text-black"
            type="button"
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
        )}
      </div>

      {/* Content */}
      {(!collapsible || isExpanded) && (
        <div className="mt-3 space-y-3">
          {/* Range Display */}
          <div className="flex items-center justify-between text-sm font-medium text-white">
            <span className="text-gray-400">Range:</span>
            <span className="font-mono">
              {formatCurrency(localMin)} - {formatCurrency(localMax)}
            </span>
          </div>

          {/* Dual Range Slider */}
          <div className="relative px-1">
            <div className="relative h-1.5">
              {/* Track */}
              <div className="absolute h-1.5 w-full rounded-full bg-gray-200" />

              {/* Active Range */}
              <div
                className="absolute h-1.5 rounded-full bg-gradient-to-r from-gray-800 to-black"
                style={{
                  left: `${((localMin - min) / (max - min)) * 100}%`,
                  width: `${((localMax - localMin) / (max - min)) * 100}%`,
                }}
              />

              {/* Min Thumb */}
              <input
                className="absolute h-1.5 w-full cursor-pointer appearance-none bg-transparent focus:ring-2 focus:ring-black/20 focus:ring-offset-0 focus:outline-none [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-black [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:transition-all [&::-moz-range-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-black [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:hover:scale-110"
                max={max}
                min={min}
                onChange={(e) => handleMinChange(Number(e.target.value))}
                step={Math.max(0.01, (max - min) / 1000)}
                type="range"
                value={localMin}
              />

              {/* Max Thumb */}
              <input
                className="absolute h-1.5 w-full cursor-pointer appearance-none bg-transparent focus:ring-2 focus:ring-black/20 focus:ring-offset-0 focus:outline-none [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-black [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:transition-all [&::-moz-range-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-black [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:hover:scale-110"
                max={max}
                min={min}
                onChange={(e) => handleMaxChange(Number(e.target.value))}
                step={Math.max(0.01, (max - min) / 1000)}
                type="range"
                value={localMax}
              />
            </div>
          </div>

          {/* Input Fields */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-400">
                Min
              </label>
              <input
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-black transition-all focus:border-black focus:ring-2 focus:ring-black/10 focus:outline-none"
                max={localMax}
                min={min}
                onChange={(e) => handleMinChange(Number(e.target.value))}
                type="number"
                value={localMin}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-400">
                Max
              </label>
              <input
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-black transition-all focus:border-black focus:ring-2 focus:ring-black/10 focus:outline-none"
                max={max}
                min={localMin}
                onChange={(e) => handleMaxChange(Number(e.target.value))}
                type="number"
                value={localMax}
              />
            </div>
          </div>

          {/* Reset Button */}
          {isRangeModified && (
            <div className="flex justify-end">
              <button
                className="text-xs font-medium text-gray-500 transition-colors duration-200 hover:text-black"
                onClick={resetRange}
                type="button"
              >
                Reset
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
