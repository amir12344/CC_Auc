'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { Button } from '@/src/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/src/components/ui/sheet"

/**
 * MobileNavigation Component
 * Simple hamburger menu for basic site navigation
 * Separate from HeaderClient user menu functionality
 */
export const MobileNavigation = () => {
  const [isOpen, setIsOpen] = useState(false)

  const navigationLinks = [
    { href: '/', label: 'Home' },
    { href: '/marketplace', label: 'Marketplace' },
    { href: '/collections', label: 'Collections' },
  ]

  return (
    <div className="md:hidden">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon"
            className="h-8 w-8 text-[#D8F4CC] hover:text-[#43CD66] hover:bg-[#43CD66]/10"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent 
          side="left"
          className="bg-[#102D21] border-r border-[#43CD66]/20 text-[#D8F4CC] w-[280px] p-6"
        >
          <SheetHeader className="mb-6">
            <SheetTitle className="text-[#D8F4CC] text-left text-lg">
              Navigation
            </SheetTitle>
            <SheetDescription className="sr-only">
              Mobile navigation menu for site pages
            </SheetDescription>
          </SheetHeader>
          
          <div className="flex flex-col space-y-2">
            {navigationLinks.map((link) => (
              <Link 
                key={link.href}
                href={link.href} 
                className="text-[#D8F4CC] hover:text-[#43CD66] font-medium py-3 px-2 transition-colors duration-300 border-b border-[#43CD66]/20"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
} 