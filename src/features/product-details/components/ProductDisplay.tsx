import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/src/components/ui/button';
import { ShoppingCart, FileText, Heart, ImageIcon } from 'lucide-react';

interface ProductDetails {
  imageUrl: string;
  name: string;
  category: string;
  totalAskingPrice: string;
  msrpPercentage: string;
  leadTime: string;
  description: string;
}

interface ProductDisplayProps {
  product: ProductDetails;
}

export const ProductDisplay = ({ product }: ProductDisplayProps) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Product Image - Better container filling */}
      <div className="w-full md:w-60 h-60 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative">
        {product.imageUrl && !imageError ? (
          <Image 
            src={product.imageUrl} 
            alt={product.name} 
            fill
            className="object-cover p-0"
            priority
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 text-gray-400">
            <ImageIcon className="h-12 w-12 mb-2" />
            <p className="text-sm font-medium">{product.name}</p>
          </div>
        )}
      </div>

      {/* Product Info & Actions */}
      <div className="flex flex-col flex-1">
        {/* Category and Name */}
        <div className="mb-3">
          <h1 className="text-2xl font-bold text-gray-900 mt-1">{product.name}</h1>
        </div>
        
        {/* Product Details */}
        <div className="mb-3">
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-sm font-semibold text-gray-900">{product.totalAskingPrice}</span>
            <span className="text-sm text-gray-600">({product.msrpPercentage})</span>
          </div>
          <p className="text-sm text-gray-700">Lead time: <span className="font-semibold">{product.leadTime}</span></p>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 leading-relaxed mb-4">{product.description}</p>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <Button className="h-10 rounded-full bg-black hover:bg-gray-800 text-white px-6">
            <ShoppingCart className="mr-2 h-4 w-4" />
            Buy All
          </Button>
          <Button variant="outline" className="h-10 rounded-full border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900 px-6">
            <FileText className="mr-2 h-4 w-4" />
            Manifest
          </Button>
        </div>
      </div>
    </div>
  );
}; 