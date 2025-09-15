import Link from "next/link";
import React from "react";

import { ChevronLeft, ChevronRight } from "lucide-react";

import {
  Carousel,
  CarouselNext,
  CarouselPrevious,
} from "@/src/components/ui/carousel";
import { cn } from "@/src/lib/utils";

import { ProductCarousel } from "./ProductCarousel";

interface ProductSectionProps {
  title: string;
  viewAllLink?: string;
  children: React.ReactNode;
  variant?: "light" | "trending" | "custom";
  layout?: "grid" | "carousel";
  darkMode?: boolean;
}

export function ProductSection({
  title,
  viewAllLink,
  children,
  variant = "light",
  layout = "grid",
  darkMode = false,
}: ProductSectionProps) {
  const childrenArray = React.Children.toArray(children);
  const [windowWidth, setWindowWidth] = React.useState<number>(
    typeof window !== "undefined" ? window.innerWidth : 0
  );

  React.useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Visible card counts: mobile (<768px) = 2, tablet (>=768px & <1024px) = 3, desktop (>=1024px) = 5
  const visibleCount = windowWidth >= 1024 ? 5 : windowWidth >= 768 ? 3 : 2;
  const showArrows = childrenArray.length > visibleCount;

  if (!childrenArray.length) return null;

  if (layout === "carousel") {
    return (
      <main className="max-w-8xl mx-auto px-6 py-4 sm:py-12">
        <Carousel
          className="w-full"
          opts={{
            align: "start",
            loop: false,
          }}
        >
          <div className="flex w-full min-w-0 flex-col gap-6">
            <div className="flex items-center justify-between">
              <h2
                className={cn(
                  "text-2xl font-[500] tracking-tighter",
                  darkMode ? "text-white" : "text-gray-900"
                )}
              >
                {title}
              </h2>
              <div className="flex items-center gap-2">
                {viewAllLink && (
                  <Link
                    className={cn(
                      "mr-4 text-sm",
                      darkMode
                        ? "text-gray-300 hover:text-white"
                        : "text-muted-foreground hover:text-primary"
                    )}
                    href={viewAllLink}
                  >
                    View all
                  </Link>
                )}
                {showArrows && (
                  <>
                    <CarouselPrevious
                      className={cn(
                        "relative static top-0 right-0 bottom-0 left-0 h-8 w-8 translate-y-0 border-0 bg-[#43CD66] text-[#1C1E21] hover:bg-[#3ABF5A] hover:text-[#1C1E21]",
                        "focus-visible:ring-2 focus-visible:ring-[#43CD66] focus-visible:ring-offset-2"
                      )}
                      variant="default"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </CarouselPrevious>
                    <CarouselNext
                      className={cn(
                        "relative static top-0 right-0 bottom-0 left-0 h-8 w-8 translate-y-0 border-0 bg-[#43CD66] text-[#1C1E21] hover:bg-[#3ABF5A] hover:text-[#1C1E21]",
                        "focus-visible:ring-2 focus-visible:ring-[#43CD66] focus-visible:ring-offset-2"
                      )}
                      variant="default"
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
    <main className="max-w-8xl mx-auto px-6 py-4 sm:py-12">
      <div className="flex w-full min-w-0 flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2
            className={cn(
              "text-2xl font-[500] tracking-tighter",
              darkMode ? "text-white" : "text-gray-900"
            )}
          >
            {title}
          </h2>
          {viewAllLink && (
            <Link
              className={cn(
                "text-sm",
                darkMode
                  ? "text-gray-300 hover:text-white"
                  : "text-muted-foreground hover:text-primary"
              )}
              href={viewAllLink}
            >
              View all
            </Link>
          )}
        </div>
        <div className="grid w-full grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 md:gap-6 lg:grid-cols-5">
          {childrenArray.map((child, index) => (
            <div className="min-w-0" key={index}>
              {child}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

export default ProductSection;
