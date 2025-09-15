"use client";

import Link from "next/link";
import { useState } from "react";

import { Menu, X } from "lucide-react";

import { Button } from "@/src/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/src/components/ui/sheet";

/**
 * MobileNavigation Component
 * Simple hamburger menu for basic site navigation
 * Separate from HeaderClient user menu functionality
 */
export const MobileNavigation = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navigationLinks = [
    { href: "/", label: "Home" },
    { href: "/marketplace", label: "Marketplace" },
    { href: "/collections", label: "Collections" },
  ];

  return (
    <div className="md:hidden">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-[#D8F4CC] hover:bg-[#43CD66]/10 hover:text-[#43CD66]"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="w-[280px] border-r border-[#43CD66]/20 bg-[#102D21] p-6 text-[#D8F4CC]"
        >
          <SheetHeader className="mb-6">
            <SheetTitle className="text-left text-lg text-[#D8F4CC]">
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
                className="border-b border-[#43CD66]/20 px-2 py-3 font-medium text-[#D8F4CC] transition-colors duration-300 hover:text-[#43CD66]"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};
