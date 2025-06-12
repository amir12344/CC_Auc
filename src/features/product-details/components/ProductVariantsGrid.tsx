import Image from 'next/image';
import { Button } from "@/src/components/ui/button";
import { PlusCircle, ImageIcon } from 'lucide-react';
import { type ProductVariant } from '../types';

interface ProductVariantsGridProps {
  variants: ProductVariant[];
  onImageError: (id: string) => void;
  imageErrors: Record<string, boolean>;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

export const ProductVariantsGrid = ({ 
  variants, 
  onImageError,
  imageErrors 
}: ProductVariantsGridProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {variants.map((variant) => (
        <div key={variant.id} className="group relative flex flex-col border border-gray-200 rounded-xl overflow-hidden bg-white hover:border-gray-300 hover:shadow-lg transition-all duration-200">
          <div className="relative aspect-[3/2] bg-gray-50">
            {variant.imageUrl && !imageErrors[variant.id] ? (
              <Image 
                src={variant.imageUrl} 
                alt={variant.productName} 
                fill 
                className="object-cover group-hover:scale-105 transition-transform duration-200"
                onError={() => onImageError(variant.id)}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                <ImageIcon className="h-8 w-8" />
              </div>
            )}
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-2 right-2 rounded-full h-7 w-7 bg-white/80 backdrop-blur-sm shadow-sm text-gray-700 hover:bg-white hover:scale-110 transition-all duration-200 opacity-0 group-hover:opacity-100"
            >
              <PlusCircle className="h-4 w-4" />
            </Button>
          </div>
          <div className="p-3 flex flex-col gap-1">
            <h3 className="font-medium text-sm text-gray-900 line-clamp-2 leading-snug">{variant.productName}</h3>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="font-medium text-gray-900">{formatCurrency(variant.pricePerUnit)}</span>
              <span className="w-1 h-1 rounded-full bg-gray-300"></span>
              <span>{variant.totalUnits.toLocaleString()} units</span>
            </div>
            <div className="mt-1 flex items-center gap-2 text-xs">
              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">{variant.variants} variants</span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-500">MSRP: {formatCurrency(variant.msrp)}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}; 