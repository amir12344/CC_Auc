"use client";

import { useState } from "react";

import { ChevronDown, Search } from "lucide-react";

import { Button } from "@/src/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { Input } from "@/src/components/ui/input";

interface CollectionFiltersProps {
  onSearchChange?: (searchTerm: string) => void;
  onFilterChange: (filterValue: string) => void;
  placeholder?: string;
  filterOptions?: Array<{
    label: string;
    value: string;
  }>;
  defaultFilter?: string;
}

export function CollectionFilters({
  onSearchChange,
  onFilterChange,
  placeholder = "Search products...",
  filterOptions = [],
  defaultFilter = "all",
}: CollectionFiltersProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState(defaultFilter);
  const [selectedFilterLabel, setSelectedFilterLabel] = useState("All");

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    onSearchChange?.(value);
  };

  const handleFilterSelect = (option: { label: string; value: string }) => {
    setSelectedFilter(option.value);
    setSelectedFilterLabel(option.label);
    onFilterChange(option.value);
  };

  return (
    <div className="flex items-center">
      {/* Search Bar - Only show if onSearchChange is provided */}
      {onSearchChange && (
        <div className="relative mr-4 flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pr-4 pl-10"
          />
        </div>
      )}

      {/* Filter Dropdown - Styled to match reference image */}
      {filterOptions.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="rounded-full border-gray-300 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 focus:outline-none"
            >
              {selectedFilterLabel}
              <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px]">
            {filterOptions.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => handleFilterSelect(option)}
              >
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
