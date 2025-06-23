'use client';

import { useRouter, usePathname } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/src/components/ui/dropdown-menu';
import { Button } from '@/src/components/ui/button';
import { Badge } from '@/src/components/ui/badge';
import { ChevronDown, ArrowUpRight } from 'lucide-react';
import { 
  Package, 
  TrendingUp, 
  Edit, 
  ShoppingCart, 
  BarChart3,
  Plus
} from "lucide-react";
import { CreateListingDialog } from '../seller/CreateListingDialog';

const sellerListingsItems = [
  {
    title: "All Listings",
    href: "/seller/listing",
    icon: Package,
    description: "View all your listings",
    count: "1",
  }
];

/**
 * Seller Listings dropdown component for header navigation
 * Shows all seller-specific sections with visual appeal using shadcn components
 */
export function SellerListingsDropdown() {
  const router = useRouter();
  const pathname = usePathname();

  const handleNavigation = (href: string) => {
    router.push(href);
  };

  const isActive = (href: string) => {
    // Remove query parameters for comparison
    const cleanHref = href.split('?')[0];
    return pathname === cleanHref || (cleanHref !== "/seller/listing" && pathname.startsWith(cleanHref));
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-[#D8F4CC] hover:text-[#43CD66] hover:bg-[#43CD66]/10 font-medium transition-colors duration-300 cursor-pointer text-base"
        >
          Listings
          <ChevronDown className="ml-1 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-72 p-2" align="end" side="bottom" sideOffset={8} alignOffset={-8}>
        <DropdownMenuLabel className="px-3 py-2 text-sm font-semibold text-gray-900">
          Seller Portal
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="my-1" />
        
        <div className="space-y-1">
          {sellerListingsItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            
            return (
              <DropdownMenuItem
                key={item.href}
                className={`cursor-pointer p-3 rounded-lg transition-all duration-200 focus:bg-primary/5 ${
                  active 
                    ? 'bg-primary/5 border border-primary/20' 
                    : 'hover:bg-gray-50/80 border border-transparent'
                }`}
                onClick={() => handleNavigation(item.href)}
              >
                <div className="flex items-center w-full">
                  <div className={`p-2 rounded-md mr-3 ${
                    active 
                      ? 'bg-primary/10 text-primary' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-medium ${
                        active ? 'text-primary' : 'text-gray-900'
                      }`}>
                        {item.title}
                      </span>
                      
                      <div className="flex items-center gap-2">
                        {item.count && (
                          <Badge 
                            variant={active ? "default" : "secondary"} 
                            className="text-xs px-2 py-0.5 h-5 min-w-[20px] justify-center"
                          >
                            {item.count}
                          </Badge>
                        )}
                        <ArrowUpRight className={`h-3 w-3 ${
                          active ? 'text-primary' : 'text-gray-400'
                        }`} />
                      </div>
                    </div>
                    
                    <p className="text-xs text-gray-500 mt-0.5 truncate">
                      {item.description}
                    </p>
                  </div>
                </div>
              </DropdownMenuItem>
            );
          })}
        </div>
        
        <DropdownMenuSeparator className="my-2" />
        
        {/* Quick Action - Create Listing */}
        <CreateListingDialog>
          <DropdownMenuItem
            className="cursor-pointer p-3 transition-all duration-200 hover:bg-[#43CD66]/10"
            onSelect={(e) => e.preventDefault()} // Prevent dropdown from closing
          >
            <Plus className="mr-3 h-4 w-4 text-[#43CD66]" />
            <span className="text-sm font-medium text-[#43CD66]">Create Listing</span>
          </DropdownMenuItem>
        </CreateListingDialog>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 