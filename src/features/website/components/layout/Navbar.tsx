'use client';

import { useState, useEffect } from 'react';
import Logo from '../ui/Logo';
import { Headphones, BookOpen, Users, Menu } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/src/components/ui/accordion";
import { Button } from "@/src/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/src/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/src/components/ui/sheet";
import Link from 'next/link';

interface MenuItem {
  title: string;
  url: string;
  description?: string;
  icon?: React.ReactNode;
  items?: MenuItem[];
}

// Utility functions for complex/repeated className strings
const getNavbarClasses = (isScrolled: boolean) =>
  `fixed w-full z-50 transition-all duration-300 ${isScrolled
    ? 'bg-[#102D21]/95 shadow-lg border-b border-[#43CD66]/10'
    : 'bg-[#102D21]/90'
  }`;

const earlyAccessButtonClasses = "px-6 py-2 rounded-full bg-[#43CD66] text-[#1C1E21] font-medium hover:bg-[#43CD66]/10 hover:text-[#43CD66] transition-all duration-200 shadow-xs border border-transparent hover:border-[#43CD66]";

const navigationTriggerClasses = "text-[#D8F4CC] hover:text-[#43CD66] bg-transparent hover:bg-[#43CD66]/10 font-medium text-base transition-colors duration-300 data-[state=open]:bg-[#43CD66]/10 data-[state=open]:text-[#43CD66] focus:bg-[#43CD66]/10 focus:text-[#43CD66]";

const navigationLinkClasses = "text-[#D8F4CC] hover:text-[#43CD66] font-medium text-base transition-colors duration-300 inline-flex h-10 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 hover:bg-[#43CD66]/10 focus:bg-[#43CD66]/10 focus:text-[#43CD66] active:bg-[#43CD66]/10";

const getSubMenuLinkClasses = (isMobile: boolean) =>
  `flex items-start gap-4 rounded-xl p-4 leading-none no-underline transition-all duration-300 outline-none select-none group ${isMobile ? 'text-[#D8F4CC] hover:bg-[#43CD66]/10' : 'hover:bg-[#F9F9F9]'
  }`;

const subMenuIconClasses = "flex items-center justify-center mt-1 transition-transform duration-300 group-hover:scale-110 text-[#43CD66]";

const getSubMenuTitleClasses = (isMobile: boolean) =>
  `font-semibold text-[18px] mb-1.5 transition-colors duration-300 ${isMobile
    ? 'text-[#D8F4CC] group-hover:text-[#43CD66]'
    : 'text-[#102D21] group-hover:text-[#43CD66]'
  }`;

const getSubMenuDescriptionClasses = (isMobile: boolean) =>
  `text-[16px] font-normal leading-relaxed ${isMobile ? 'text-[#D8F4CC]/80' : 'text-[#475467]'
  }`;

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const menu: MenuItem[] = [
    {
      title: "Sellers",
      url: "/website/seller"
    },
    {
      title: "Buyers",
      url: "/website/buyer"
    },
    {
      title: "Media",
      url: "#",
      items: [
        {
          title: "Podcast",
          description: "Learn from industry experts and brands on The ReCommerce Podcast",
          icon: <Headphones className="h-5 w-5 stroke-[2px]" />,
          url: "/website/podcast",
        },
        {
          title: "Blog",
          description: "Articles and resources",
          icon: <BookOpen className="h-5 w-5 stroke-[2px]" />,
          url: "/website/blog",
        },
        {
          title: "Meet the team",
          description: "Meet the team behind Commerce Central",
          icon: <Users className="h-5 w-5 stroke-[2px]" />,
          url: "/website/team",
        },
      ],
    },
  ];

  useEffect(() => {
    const checkInitialScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    checkInitialScroll();

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const renderMobileMenuItem = (item: MenuItem) => {
    if (item.items) {
      return (
        <Accordion
          key={item.title}
          type="single"
          collapsible
          className="w-full"
        >
          <AccordionItem value={item.title} className="border-none">
            <AccordionTrigger className="text-lg font-medium text-[#D8F4CC] hover:text-[#43CD66] hover:no-underline py-4 px-0 decoration-transparent">
              {item.title}
            </AccordionTrigger>
            <AccordionContent className="pt-2 pb-4 px-0">
              <div className="space-y-4 pl-4">
                {item.items.map((subItem) => (
                  <SubMenuLink key={subItem.title} item={subItem} isMobile onClick={() => setIsOpen(false)} />
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      );
    }

    return (
      <Link
        key={item.title}
        href={item.url}
        className="text-lg font-medium text-[#D8F4CC] hover:text-[#43CD66] transition-colors duration-300 py-4 block"
        onClick={() => setIsOpen(false)}
      >
        {item.title}
      </Link>
    );
  };

  return (
    <header className={getNavbarClasses(isScrolled)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-4">
          {/* Desktop Menu */}
          <nav className="hidden md:flex justify-between items-center">
            {/* Logo */}
            <div>
              <Logo showFullOnMobile={true} />
            </div>

            {/* Navigation Items and Early Access - moved to right */}
            <div className="flex items-center gap-6">
              <div className="flex items-center">
                <NavigationMenu>
                  <NavigationMenuList>
                    {menu.map((item) => renderMenuItem(item))}
                  </NavigationMenuList>
                </NavigationMenu>
              </div>
              <Button
                asChild
                className={earlyAccessButtonClasses}
              >
                <Link href="/earlyaccess">Early Access</Link>
              </Button>
            </div>
          </nav>

          {/* Mobile Menu */}
          <div className="block md:hidden">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <div>
                <Logo showFullOnMobile={true} />
              </div>
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-[#D8F4CC] hover:text-[#43CD66] hover:bg-[#43CD66]/10"
                    aria-label="Open navigation menu"
                  >
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="bg-[#102D21] border-l border-[#43CD66]/20 text-[#D8F4CC] overflow-y-auto w-[300px] sm:w-[350px] p-6"
                >
                  <SheetHeader className="mb-8">
                    <SheetTitle className="text-[#D8F4CC] text-left">
                      <Logo showFullOnMobile={true} />
                    </SheetTitle>
                    <SheetDescription className="text-[#D8F4CC]/80 text-sm">
                      Navigate through different sections of Commerce Central
                    </SheetDescription>
                  </SheetHeader>
                  <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-4">
                      {menu.map((item) => renderMobileMenuItem(item))}
                    </div>

                    <div className="pt-6 border-t border-[#43CD66]/20">
                      <Button
                        asChild
                        className={earlyAccessButtonClasses}
                        onClick={() => setIsOpen(false)}
                      >
                        <Link href="/earlyaccess">Early Access</Link>
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

const renderMenuItem = (item: MenuItem) => {
  if (item.items) {
    return (
      <NavigationMenuItem key={item.title}>
        <NavigationMenuTrigger className={navigationTriggerClasses}>
          {item.title}
        </NavigationMenuTrigger>
        <NavigationMenuContent className="bg-white shadow-xl rounded-[13.632px] p-2.5 w-[350px] sm:w-[400px] lg:w-[450px]">
          <div className="space-y-1">
            {item.items.map((subItem, index) => (
              <div key={subItem.title}>
                <NavigationMenuLink asChild>
                  <SubMenuLink item={subItem} />
                </NavigationMenuLink>
                {index < item.items!.length - 1 && (
                  <div className="h-[1px] bg-[#E0D6C2]/70 mx-4 my-1" />
                )}
              </div>
            ))}
          </div>
        </NavigationMenuContent>
      </NavigationMenuItem>
    );
  }

  return (
    <NavigationMenuItem key={item.title}>
      <NavigationMenuLink asChild className={navigationLinkClasses}>
        <Link href={item.url}>
          {item.title}
        </Link>
      </NavigationMenuLink>
    </NavigationMenuItem>
  );
};

const SubMenuLink = ({ item, isMobile = false, onClick }: { item: MenuItem; isMobile?: boolean; onClick?: () => void }) => {
  return (
    <Link
      className={getSubMenuLinkClasses(isMobile)}
      href={item.url}
      onClick={onClick}
    >
      <div className={subMenuIconClasses}>
        {item.icon}
      </div>
      <div className="flex-1">
        <div className={getSubMenuTitleClasses(isMobile)}>
          {item.title}
        </div>
        {item.description && (
          <p className={getSubMenuDescriptionClasses(isMobile)}>
            {item.description}
          </p>
        )}
      </div>
    </Link>
  );
};

export default Navbar;
