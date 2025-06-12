"use client";

import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { ArrowLeft, ArrowRight, Star } from "lucide-react";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";

interface Category {
  name: string;
  description: string;
  image: string;
  productCount: number;
  featured?: boolean;
  rating: number;
  reviewCount: number;
  priceRange: string;
  tags: string[];
}

export default function WishlistBanner() {
  return (
    <div className="relative">
    <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/30" />
    <div
      className="relative h-[40vh] min-h-[300px] flex items-center justify-start bg-cover bg-center"
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1523275335684-37898b6baf30')" }}
    >
      <div className="container px-4 mx-auto">
        <div className="max-w-lg space-y-4">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl text-[#102D21]">New Season Collection</h1>
          <p className="text-base md:text-lg text-[#102D21]">
            Discover our latest styles crafted with premium materials for exceptional comfort and timeless elegance.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="default" className="bg-white text-black hover:bg-white/90">
              <Link href="/products">Shop Now</Link>
            </Button>
            <Button asChild size="default" variant="default" className="text-white border-white ">
              <Link href="/products/new">New Arrivals</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  );
}
