"use client";

import React from "react";

import { CarouselContent, CarouselItem } from "@/src/components/ui/carousel";
import { cn } from "@/src/lib/utils";

interface ProductCarouselProps {
  items: React.ReactNode[];
  className?: string;
}

export function ProductCarousel({ items, className }: ProductCarouselProps) {
  if (!items?.length) return null;

  return (
    <CarouselContent className={cn("-ml-8", className)}>
      {items.map((item, index) => (
        <CarouselItem
          key={`carousel-item-${index}`}
          className="basis-1/2 pl-8 md:basis-1/3 lg:basis-1/5"
        >
          {item}
        </CarouselItem>
      ))}
    </CarouselContent>
  );
}
