'use client';

import { ChevronDown, Loader2, Package, Plus } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { CreateListingDialog } from '@/src/components/seller/CreateListingDialog';
import { Button } from '@/src/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu';

/**
 * Seller Listings dropdown component for header navigation
 * Shows only View Listings and Create Listing options with proper state management
 */
export function SellerListingsDropdown() {
  const router = useRouter();
  const pathname = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleNavigation = (href: string) => {
    startTransition(() => {
      router.push(href);
      setIsDropdownOpen(false); // Close dropdown after navigation
    });
  };

  const isActive = (href: string) => {
    // Only consider exact match or if we're on the main listings page
    return pathname === href || pathname === `${href}/`;
  };

  return (
    <>
      <DropdownMenu onOpenChange={setIsDropdownOpen} open={isDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            className="cursor-pointer font-medium text-[#D8F4CC] text-base transition-colors duration-300 hover:bg-[#43CD66]/10 hover:text-[#43CD66]"
            disabled={isPending}
            size="sm"
            variant="ghost"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                Listings
                <ChevronDown className="ml-1 h-4 w-4" />
              </>
            )}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-56" side="bottom">
          {/* All Listings */}
          <DropdownMenuItem
            className={`cursor-pointer p-3 transition-all duration-200 ${isActive('/seller/listing')
              ? 'bg-[#43CD66]/10 text-[#43CD66]'
              : 'hover:bg-gray-50'
              } ${isPending ? 'pointer-events-none opacity-50' : ''}`}
            disabled={isPending}
            onClick={() => handleNavigation('/seller/listing')}
          >
            <Package className="mr-3 h-4 w-4" />
            <span className="font-medium text-sm">All Listings</span>
            {isPending && <Loader2 className="ml-auto h-4 w-4 animate-spin" />}
          </DropdownMenuItem>

          <DropdownMenuSeparator className="my-1" />

          {/* Create Listing */}
          <DropdownMenuItem
            className={`cursor-pointer p-3 transition-all duration-200 hover:bg-[#43CD66]/10 ${isPending ? 'pointer-events-none opacity-50' : ''}`}
            disabled={isPending}
            onSelect={(e) => {
              e.preventDefault();
              setIsDropdownOpen(false);
              setIsDialogOpen(true);
            }}
          >
            <Plus className="mr-3 h-4 w-4 text-[#43CD66]" />
            <span className="font-medium text-[#43CD66] text-sm">
              Create Listing
            </span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <CreateListingDialog onOpenChange={setIsDialogOpen} open={isDialogOpen} />
    </>
  );
}
