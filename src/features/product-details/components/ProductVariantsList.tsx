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
import { PlusCircle, Plus, ImageIcon, Check } from 'lucide-react';
import { type ProductVariant } from '@/src/features/marketplace-catalog/types';
import { useDispatch, useSelector } from 'react-redux';
import { openOfferModal } from '@/src/features/offer-management/store/offerSlice';
import { addToOffer, removeFromOffer, selectOfferItems } from '@/src/features/offer-management/store/offerCartSlice';

interface ProductVariantsListProps {
  variants: ProductVariant[];
  onImageError: (id: string) => void;
  imageErrors: Record<string, boolean>;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

export const ProductVariantsList = ({ 
  variants,
  onImageError,
  imageErrors
}: ProductVariantsListProps) => {
  const dispatch = useDispatch();
  // Get offer items from the cart
  const offerItems = useSelector(selectOfferItems);

  // Helper to map ProductVariant to OfferVariant (dummy mapping for now)
  const mapToOfferVariant = (variant: ProductVariant) => ({
    id: variant.id,
    name: variant.productName,
    upc: undefined,
    asin: undefined,
    pricePerUnit: variant.pricePerUnit,
    totalUnits: variant.totalUnits,
    totalPrice: variant.totalPrice,
    checked: false, // default unchecked when opening modal
  });

  // Dummy product info for now
  const productId = variants[0]?.id || 'dummy-product-id';
  const productTitle = variants[0]?.productName || 'Product';

  // Check if variant is in cart
  const isInCart = (variantId: string) => {
    return offerItems.some(item => item.variantId === variantId);
  };

  // Handle clicking plus/check icon
  const handleIconClick = (variant: ProductVariant) => {
    const variantId = variant.id;
    
    // If already in cart, remove it
    if (isInCart(variantId)) {
      dispatch(removeFromOffer({
        productId: variant.id,
        variantId: variant.id
      }));
    } 
    // If not in cart, open the offer modal with ONLY this variant
    else {
      // Transform only the clicked variant to offer variant
      const mappedVariant = mapToOfferVariant(variant);
      
      // Open the offer modal with only this variant
      dispatch(openOfferModal({
        productId: variant.id,
        productTitle: variant.productName,
        variants: [mappedVariant],
      }));
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 overflow-hidden">
      <div className="w-full overflow-auto">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow className="border-b border-gray-200">
              <TableHead className="w-[60px] py-3 px-2 text-xs font-medium text-left align-middle text-gray-500"></TableHead>
              <TableHead className="py-3 px-2 text-xs font-medium text-left align-middle text-gray-500">PRODUCT NAME</TableHead>
              <TableHead className="py-3 px-2 text-xs font-medium text-right align-middle text-gray-500">VARIANTS</TableHead>
              <TableHead className="py-3 px-2 text-xs font-medium text-right align-middle text-gray-500">MSRP</TableHead>
              <TableHead className="py-3 px-2 text-xs font-medium text-right align-middle text-gray-500">PRICE/UNIT</TableHead>
              <TableHead className="py-3 px-2 text-xs font-medium text-right align-middle text-gray-500">TOTAL UNITS</TableHead>
              <TableHead className="py-3 px-2 text-xs font-medium text-right align-middle text-gray-500">TOTAL PRICE</TableHead>
              <TableHead className="w-[50px] py-3 px-2 text-xs font-medium text-left align-middle text-gray-500"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {variants.map((variant) => (
              <TableRow key={variant.id} className="border-b border-gray-200 hover:bg-gray-50">
                <TableCell className="py-3 px-2 pl-4">
                  {variant.imageUrl && !imageErrors[variant.id] ? (
                    <div className="w-8 h-8 bg-gray-100 rounded-md overflow-hidden flex items-center justify-center">
                      <Image 
                        src={variant.imageUrl} 
                        alt={variant.productName} 
                        width={32} 
                        height={32} 
                        className="object-contain"
                        onError={() => onImageError(variant.id)}
                      />
                    </div>
                  ) : (
                    <div className="w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center text-gray-400">
                      <ImageIcon className="h-4 w-4" />
                    </div>
                  )}
                </TableCell>
                <TableCell className="py-3 px-2 font-medium text-gray-900">{variant.productName}</TableCell>
                <TableCell className="py-3 px-2 text-right text-gray-700">{variant.variants}</TableCell>
                <TableCell className="py-3 px-2 text-right text-gray-700">{formatCurrency(variant.msrp)}</TableCell>
                <TableCell className="py-3 px-2 text-right text-gray-700">{formatCurrency(variant.pricePerUnit)}</TableCell>
                <TableCell className="py-3 px-2 text-right text-gray-700">{variant.totalUnits.toLocaleString()}</TableCell>
                <TableCell className="py-3 px-2 text-right font-semibold text-gray-900">{formatCurrency(variant.totalPrice)}</TableCell>
                <TableCell className="py-3 px-2 text-right">
                  <button 
                    className={`flex items-center cursor-pointer justify-center rounded-full h-10 w-10 ${isInCart(variant.id) ? 'bg-blue-600 text-white' : 'bg-black text-white'} hover:opacity-90 transition-opacity`} 
                    onClick={() => handleIconClick(variant)}
                  >
                    {isInCart(variant.id) ? (
                      <Check className="h-6 w-6" />
                    ) : (
                      <Plus className="h-6 w-6" />
                    )}
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}; 