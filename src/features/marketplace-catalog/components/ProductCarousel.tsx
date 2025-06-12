'use client'

import React from 'react';
import {
  CarouselContent,
  CarouselItem,
} from "@/src/components/ui/carousel";
import { cn } from "@/src/lib/utils";

interface ProductCarouselProps {
  items: React.ReactNode[];
  className?: string;
}

export function ProductCarousel({ items, className }: ProductCarouselProps) {
  if (!items?.length) return null;

  return (
    <CarouselContent className={cn("-ml-6", className)}>
      {items.map((item, index) => (
        <CarouselItem key={index} className="pl-6 basis-1/2 lg:basis-1/4">
          {item}
        </CarouselItem>
      ))}
    </CarouselContent>
  );
}
