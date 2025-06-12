'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from "@/src/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { ChevronDown, PlusCircle, Plus, Settings2, ImageIcon } from 'lucide-react';
import { ViewToggle, type ViewMode } from "@/src/components/ui/ViewToggle";
import { ProductVariantsGrid } from './ProductVariantsGrid';
import { ProductVariantsList } from './ProductVariantsList';
import { type ProductVariant } from '@/src/features/marketplace-catalog/types/types';

interface ProductVariantsTableProps {
  variants: ProductVariant[];
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

export const ProductVariantsTable = ({ variants }: ProductVariantsTableProps) => {
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  const handleImageError = (id: string) => {
    setImageErrors(prev => ({ ...prev, [id]: true }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
        <h2 className="text-sm font-semibold text-gray-900">{variants.length} products</h2>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" className="h-9 rounded-lg border-gray-300 text-gray-700 bg-white">
            <Settings2 className="mr-2 h-4 w-4" />
            Show Filters
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-9 rounded-lg border-gray-300 text-gray-700 bg-white">
                Total units (high to low)
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Total units (low to high)</DropdownMenuItem>
              <DropdownMenuItem>Price per unit (high to low)</DropdownMenuItem>
              <DropdownMenuItem>Price per unit (low to high)</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <ViewToggle mode={viewMode} onModeChange={setViewMode} />
          
          <Button className="h-9 rounded-lg bg-black hover:bg-gray-800 text-white">
            <Plus className="mr-2 h-4 w-4" />
            Add all shown
          </Button>
        </div>
      </div>

      {viewMode === 'list' ? (
        <ProductVariantsList 
          variants={variants}
          onImageError={handleImageError}
          imageErrors={imageErrors}
        />
      ) : (
        <ProductVariantsGrid 
          variants={variants}
          onImageError={handleImageError}
          imageErrors={imageErrors}
        />
      )}

      <div className="flex justify-center mt-6">
        <Button variant="outline" className="rounded-full px-6 border-gray-300 text-gray-700 bg-white">
          Load More
        </Button>
      </div>
    </div>
  );
}; 