'use client';

import { LayoutGrid, List } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/src/lib/utils';

export type ViewMode = 'list' | 'grid';

interface ViewToggleProps {
  mode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
  className?: string;
}

export const ViewToggle = ({ 
  mode, 
  onModeChange,
  className
}: ViewToggleProps) => {
  return (
    <div className={cn("flex items-center rounded-lg border border-gray-300 bg-white", className)}>
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "h-9 w-9 rounded-l-lg",
          mode === 'list' 
            ? "bg-gray-100 text-gray-900" 
            : "text-gray-500 hover:text-gray-700"
        )}
        onClick={() => onModeChange('list')}
        aria-label="List view"
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "h-9 w-9 rounded-r-lg",
          mode === 'grid' 
            ? "bg-gray-100 text-gray-900" 
            : "text-gray-500 hover:text-gray-700"
        )}
        onClick={() => onModeChange('grid')}
        aria-label="Grid view"
      >
        <LayoutGrid className="h-4 w-4" />
      </Button>
    </div>
  );
}; 