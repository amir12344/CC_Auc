"use client";

import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { FaQuoteLeft } from "react-icons/fa";

import { motion, useInView } from "framer-motion";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/src/components/ui/carousel";

interface Testimonial {
  quote: string;
  author: string;
  position: string;
  company?: string;
  logoSrc?: string;
  profileSrc: string;
}

const TestimonialsSection: React.FC = () => {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  // State for Shadcn carousel
  const [api, setApi] = useState<CarouselApi>();
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  // Update the scroll buttons state when the carousel changes
  useEffect(() => {
    if (!api) {
      return;
    }

    // Update button states based on carousel position
    const onSelect = () => {
      setCanScrollPrev(api.canScrollPrev());
      setCanScrollNext(api.canScrollNext());
    };

    // Call once and then listen for changes
    onSelect();
    api.on("select", onSelect);
    api.on("reInit", onSelect);

    return () => {
      api.off("select", onSelect);
      api.off("reInit", onSelect);
    };
  }, [api]);

  const testimonials: Testimonial[] = [
    {
      quote:
        "We used to offload excess just to make space — fire drills every quarter. Now it's structured. We recover value without scrambling or hurting the brand.",
      author: "VP of Supply Chain",
      position: "National Retail Brand",
      company: "Brand Co",
      profileSrc:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=300&q=80",
    },
    {
      quote:
        "I've been burned too many times — fake manifests, junk loads, sellers ghosting me. Commerce Central is the first one that feels legit.",
      author: "Discount Store Buyer",
      position: "5 Locations, Midwest",
      company: "Midwest Retail",
      profileSrc:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=300&q=80",
    },
    {
      quote:
        "We were juggling spreadsheets, brokers, and last-minute write-offs. This finally gives us a process that works — and doesn't eat up the whole team's week.",
      author: "Director of Inventory & Returns",
      position: "Home Goods Brand",
      company: "Home Co",
      profileSrc:
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=300&q=80",
    },
    {
      quote:
        "I don't need hype — I need clean inventory I can actually resell. Seeing real manifests and resale terms upfront saves me from bad buys.",
      author: "Amazon FBA Seller",
      position: "Top 2% Electronics",
      company: "Tech Resellers",
      profileSrc:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=300&q=80",
    },
    {
      quote:
        "We thought liquidation was just a sunk cost. Commerce Central helped us turn it into a repeatable process — one Finance can stand behind.",
      author: "VP of Finance",
      position: "Multi-Channel Consumer Brand",
      company: "Consumer Co",
      profileSrc:
        "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=300&q=80",
    },
  ];

  // These functions are no longer needed as the Shadcn carousel handles navigation

  return (
    <section
      id="testimonials"
      ref={ref}
      className="relative overflow-hidden bg-linear-to-b from-white to-gray-50 py-10 md:py-24"
    >
      <div className="relative z-0 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center md:mb-16">
          <motion.h2
            className="mb-4 text-4xl font-bold tracking-tight text-[#1C1E21] md:text-5xl"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            Hear from Commerce Central members
          </motion.h2>
          <motion.p
            className="mx-auto max-w-3xl text-xl text-gray-600"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Commerce Central brings the{" "}
            <span className="font-medium text-[#43CD66]">transparency</span> and{" "}
            <span className="font-medium text-[#43CD66]">trust</span> top brands
            and buyers need to scale their businesses.
          </motion.p>
        </div>

        {/* Shadcn Carousel for all screen sizes */}
        <div className="relative">
          <Carousel
            setApi={setApi}
            className="mx-auto w-full"
            opts={{
              align: "start",
            }}
          >
            <CarouselContent className="-ml-4">
              {testimonials.map((testimonial, index) => (
                <CarouselItem
                  key={index}
                  className="pl-4 md:basis-1/2 lg:basis-1/3"
                >
                  <motion.div
                    className="borde relative flex h-full flex-col rounded-xl bg-white p-8 transition-all duration-300 hover:-translate-y-1"
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
                  >
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-[#43CD66]">
                      <FaQuoteLeft size={20} />
                    </div>

                    <p className="mb-8 grow text-[#1C1E21]">
                      &quot;{testimonial.quote}&quot;
                    </p>

                    <div className="flex items-center">
                      <div className="mr-4 h-12 w-12 overflow-hidden rounded-full ring-2 ring-[#43CD66] ring-offset-2">
                        <Image
                          src={testimonial.profileSrc}
                          alt={testimonial.author}
                          width={48}
                          height={48}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-[600] text-[#1C1E21]">
                          {testimonial.author}
                        </p>
                        <p className="text-sm text-[#1C1E21]">
                          {testimonial.position}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </CarouselItem>
              ))}
            </CarouselContent>

            {/* Navigation buttons positioned on the sides */}
            <CarouselPrevious
              className="absolute top-1/2 left-0 z-10 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full border border-gray-300 bg-white transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
              variant="outline"
              disabled={!canScrollPrev}
            />

            <CarouselNext
              className="absolute top-1/2 right-0 z-10 h-10 w-10 translate-x-1/2 -translate-y-1/2 rounded-full border border-gray-300 bg-white transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
              variant="outline"
              disabled={!canScrollNext}
            />
          </Carousel>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
