"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { BookOpen, Headphones, Menu } from "lucide-react";

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

interface MenuItem {
  title: string;
  url: string;
  description?: string;
  icon?: React.ReactNode;
  items?: MenuItem[];
}

// Utility functions for complex/repeated className strings
const getNavbarClasses = (isScrolled: boolean) =>
  `fixed w-full z-50 transition-all duration-300 ${
    isScrolled
      ? "bg-[#102D21]/95 shadow-lg border-b border-[#43CD66]/10"
      : "bg-[#102D21]/90"
  }`;

const earlyAccessButtonClasses =
  "px-6 py-2 rounded-full bg-[#43CD66] text-[#1C1E21] font-medium hover:bg-[#43CD66]/10 hover:text-[#43CD66] transition-all duration-200 shadow-xs border border-transparent hover:border-[#43CD66]";

const navigationTriggerClasses =
  "text-[#D8F4CC] hover:text-[#43CD66] bg-transparent hover:bg-[#43CD66]/10 font-medium text-base transition-colors duration-300 data-[state=open]:bg-[#43CD66]/10 data-[state=open]:text-[#43CD66] focus:bg-[#43CD66]/10 focus:text-[#43CD66]";

const navigationLinkClasses =
  "text-[#D8F4CC] hover:text-[#43CD66] font-medium text-base transition-colors duration-300 inline-flex h-10 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 hover:bg-[#43CD66]/10 focus:bg-[#43CD66]/10 focus:text-[#43CD66] active:bg-[#43CD66]/10";

const getSubMenuLinkClasses = (isMobile: boolean) =>
  `flex items-start gap-4 rounded-xl p-4 leading-none no-underline transition-all duration-300 outline-none select-none group ${
    isMobile ? "text-[#D8F4CC] hover:bg-[#43CD66]/10" : "hover:bg-[#F9F9F9]"
  }`;

const subMenuIconClasses =
  "flex items-center justify-center mt-1 transition-transform duration-300 group-hover:scale-110 text-[#43CD66]";

const getSubMenuTitleClasses = (isMobile: boolean) =>
  `font-semibold text-[18px] mb-1.5 transition-colors duration-300 ${
    isMobile
      ? "text-[#D8F4CC] group-hover:text-[#43CD66]"
      : "text-[#102D21] group-hover:text-[#43CD66]"
  }`;

const getSubMenuDescriptionClasses = (isMobile: boolean) =>
  `text-[16px] font-normal leading-relaxed ${
    isMobile ? "text-[#D8F4CC]/80" : "text-[#475467]"
  }`;

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const menu: MenuItem[] = [
    {
      title: "Sellers",
      url: "/website/seller",
    },
    {
      title: "Buyers",
      url: "/website/buyer",
    },
    {
      title: "Media",
      url: "#",
      items: [
        {
          title: "Podcast",
          description:
            "Learn from industry experts and brands on The ReCommerce Podcast",
          icon: <Headphones className="h-5 w-5 stroke-[2px]" />,
          url: "/website/podcast",
        },
        {
          title: "Buyer Blogs",
          description: "Tips and strategies for inventory buyers",
          icon: <BookOpen className="h-5 w-5 stroke-[2px]" />,
          url: "/website/blog/buyer",
        },
        {
          title: "Seller Blogs",
          description: "Insights for brands and surplus sellers",
          icon: <BookOpen className="h-5 w-5 stroke-[2px]" />,
          url: "/website/blog/seller",
        },
        // {
        //   title: "Meet the team",
        //   description: "Meet the team behind Commerce Central",
        //   icon: <Users className="h-5 w-5 stroke-[2px]" />,
        //   url: "/website/team",
        // },
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

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const renderMobileMenuItem = (item: MenuItem) => {
    if (item.items) {
      return (
        <Accordion
          className="w-full"
          collapsible
          key={item.title}
          type="single"
        >
          <AccordionItem className="border-none" value={item.title}>
            <AccordionTrigger className="px-0 py-4 text-lg font-medium text-[#D8F4CC] decoration-transparent hover:text-[#43CD66] hover:no-underline">
              {item.title}
            </AccordionTrigger>
            <AccordionContent className="px-0 pt-2 pb-4">
              <div className="space-y-4 pl-4">
                {item.items.map((subItem) => (
                  <SubMenuLink
                    isMobile
                    item={subItem}
                    key={subItem.title}
                    onClick={() => setIsOpen(false)}
                  />
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      );
    }

    return (
      <Link
        className="block py-4 text-lg font-medium text-[#D8F4CC] transition-colors duration-300 hover:text-[#43CD66]"
        href={item.url}
        key={item.title}
        onClick={() => setIsOpen(false)}
      >
        {item.title}
      </Link>
    );
  };

  return (
    <header className={getNavbarClasses(isScrolled)}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="py-4">
          {/* Desktop Menu */}
          <nav className="hidden items-center justify-between md:flex">
            {/* Logo */}
            <div>
              {/* Lightweight static logo to keep marketing bundle small; bumped size */}
              <Link href="/">
                <Image
                  alt="Commerce Central Logo"
                  height={40}
                  priority
                  src="/CommerceCentral_logo_Green.svg"
                  width={130}
                  style={{ height: "auto" }}
                />
              </Link>
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
              <Button asChild className={earlyAccessButtonClasses}>
                <Link href="/auth/login">Sign In</Link>
              </Button>
            </div>
          </nav>

          {/* Mobile Menu */}
          <div className="block md:hidden">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <div>
                {/* Lightweight static logo to keep marketing bundle small; bumped size */}
                <Link href="/">
                  <Image
                    alt="Commerce Central Logo"
                    height={36}
                    priority
                    src="/CommerceCentral_logo_Green.svg"
                    width={140}
                    style={{ height: "auto" }}
                  />
                </Link>
              </div>
              <Sheet onOpenChange={setIsOpen} open={isOpen}>
                <SheetTrigger asChild>
                  <Button
                    aria-label="Open navigation menu"
                    className="text-[#D8F4CC] hover:bg-[#43CD66]/10 hover:text-[#43CD66]"
                    size="icon"
                    variant="ghost"
                  >
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  className="w-[300px] overflow-y-auto border-l border-[#43CD66]/20 bg-[#102D21] p-6 text-[#D8F4CC] sm:w-[350px]"
                  side="right"
                >
                  <SheetHeader className="mb-2">
                    <SheetTitle className="text-left text-[#D8F4CC]">
                      <Image
                        alt="Commerce Central Logo"
                        height={32}
                        priority
                        src="/CommerceCentral_logo_Green.svg"
                        width={120}
                        style={{ height: "auto" }}
                      />
                    </SheetTitle>
                    <SheetDescription className="sr-only">
                      Mobile navigation menu with links to different sections of
                      the website
                    </SheetDescription>
                  </SheetHeader>
                  <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-4">
                      {menu.map((item) => renderMobileMenuItem(item))}
                    </div>

                    <div className="border-t border-[#43CD66]/20 pt-6">
                      <Button
                        asChild
                        className={earlyAccessButtonClasses}
                        onClick={() => setIsOpen(false)}
                      >
                        <Link href="/auth/login">Sign In</Link>
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
        <NavigationMenuContent className="w-[350px] rounded-[13.632px] bg-white p-2.5 shadow-xl sm:w-[400px] lg:w-[450px]">
          <div className="space-y-1">
            {item.items.map((subItem, index) => (
              <div key={subItem.title}>
                <NavigationMenuLink asChild>
                  <SubMenuLink item={subItem} />
                </NavigationMenuLink>
                {index < (item.items?.length ?? 0) - 1 && (
                  <div className="mx-4 my-1 h-[1px] bg-[#E0D6C2]/70" />
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
        <Link href={item.url}>{item.title}</Link>
      </NavigationMenuLink>
    </NavigationMenuItem>
  );
};

const SubMenuLink = ({
  item,
  isMobile = false,
  onClick,
}: {
  item: MenuItem;
  isMobile?: boolean;
  onClick?: () => void;
}) => {
  return (
    <Link
      className={getSubMenuLinkClasses(isMobile)}
      href={item.url}
      onClick={onClick}
    >
      <div className={subMenuIconClasses}>{item.icon}</div>
      <div className="flex-1">
        <div className={getSubMenuTitleClasses(isMobile)}>{item.title}</div>
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
