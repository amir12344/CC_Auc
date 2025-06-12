import { cn } from "@/src/lib/utils";
import Link from "next/link";
import React from "react";
import { ProductCarousel } from "./ProductCarousel";
import {
  Carousel,
  CarouselNext,
  CarouselPrevious,
} from "@/src/components/ui/carousel";
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductSectionProps {
  title: string;
  viewAllLink?: string;
  children: React.ReactNode;
  variant?: 'light' | 'trending' | 'custom';
  layout?: 'grid' | 'carousel';
  darkMode?: boolean;
}

export function ProductSection({ 
  title, 
  viewAllLink, 
  children,
  variant = 'light',
  layout = 'grid',
  darkMode = false
}: ProductSectionProps) {
  const childrenArray = React.Children.toArray(children);
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const visibleCount = isMobile ? 2 : 4;
  const showArrows = childrenArray.length > visibleCount;

  if (!childrenArray.length) return null;

  if (layout === 'carousel') {
    return (
      <main className="container mx-auto py-12 px-4">
        <Carousel
          opts={{
            align: "start",
            loop: false,
          }}
          className="w-full"
        >
          <div className="flex flex-col gap-6 min-w-0 w-full">
            <div className="flex items-center justify-between">
              <h2 className={cn("text-2xl font-[500] tracking-tighter", darkMode ? "text-white" : "text-gray-900")}>{title}</h2>
              <div className="flex items-center gap-2">
                {viewAllLink && (
                  <Link 
                    href={viewAllLink}
                    className={cn("text-sm mr-4", darkMode ? "text-gray-300 hover:text-white" : "text-muted-foreground hover:text-primary")}
                  >
                    View all
                  </Link>
                )}
                {showArrows && (
                  <>
                    <CarouselPrevious 
                      variant="default"
                      className={cn(
                        "relative static translate-y-0 left-0 right-0 top-0 bottom-0 h-8 w-8 bg-[#43CD66] text-[#1C1E21] hover:bg-[#3ABF5A] hover:text-[#1C1E21] border-0",
                        "focus-visible:ring-2 focus-visible:ring-[#43CD66] focus-visible:ring-offset-2"
                      )}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </CarouselPrevious>
                    <CarouselNext 
                      variant="default"
                      className={cn(
                        "relative static translate-y-0 left-0 right-0 top-0 bottom-0 h-8 w-8 bg-[#43CD66] text-[#1C1E21] hover:bg-[#3ABF5A] hover:text-[#1C1E21] border-0",
                        "focus-visible:ring-2 focus-visible:ring-[#43CD66] focus-visible:ring-offset-2"
                      )}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </CarouselNext>
                  </>
                )}
              </div>
            </div>
            <ProductCarousel items={childrenArray} />
          </div>
        </Carousel>
      </main>
    );
  }

  // Default to grid layout
  return (
    <main className="container mx-auto py-12 px-4">
      <div className="flex flex-col gap-6 min-w-0 w-full">
        <div className="flex items-center justify-between">
          <h2 className={cn("text-2xl font-[500] tracking-tighter", darkMode ? "text-white" : "text-gray-900")}>{title}</h2>
          {viewAllLink && (
            <Link 
              href={viewAllLink}
              className={cn("text-sm", darkMode ? "text-gray-300 hover:text-white" : "text-muted-foreground hover:text-primary")}
            >
              View all
            </Link>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 w-full">
          {childrenArray.map((child, index) => (
            <div key={index} className="min-w-0">
              {child}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

export default ProductSection;