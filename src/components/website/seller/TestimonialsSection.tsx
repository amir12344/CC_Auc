import { Dispatch, SetStateAction } from "react";

import { motion } from "framer-motion";

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
  company: string;
  type: string;
}

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
  api?: CarouselApi;
  setApi: Dispatch<SetStateAction<CarouselApi | undefined>>;
  canScrollPrev: boolean;
  canScrollNext: boolean;
}

export const TestimonialsSection = ({
  testimonials,
  setApi,
  canScrollPrev,
  canScrollNext,
}: TestimonialsSectionProps) => (
  <section
    id="testimonials"
    className="w-full bg-[#F1E9DE] pt-[3rem] pb-[3rem]"
  >
    <div className="mx-auto px-4">
      <div className="mb-14 flex flex-col items-center justify-center">
        <h2 className="max-w-3xl text-center text-4xl leading-tight font-semibold text-[#1C1E21] md:text-5xl">
          Trusted by innovators and{" "}
          <span className="text-[#43CD66]">industry leaders</span>
        </h2>
        <div className="mt-6 mb-2 h-1 w-24 rounded-full bg-[#43CD66]"></div>
      </div>
      <div className="relative">
        <Carousel
          setApi={setApi}
          className="mx-auto w-full"
          opts={{ align: "start" }}
        >
          <CarouselContent className="-ml-4">
            {testimonials.map((testimonial: Testimonial, index: number) => (
              <CarouselItem
                key={index}
                className="pl-4 md:basis-1/2 lg:basis-1/3"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.4,
                    delay: (index * 0.1) % 0.3,
                    ease: "easeOut",
                  }}
                  className="h-full"
                >
                  <div className="flex h-full flex-col rounded-xl border border-gray-200 bg-white p-8 transition-all duration-300 hover:-translate-y-1">
                    <div className="mb-4 flex items-center gap-2">
                      <svg
                        className="h-6 w-6 text-[#43CD66]"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                      </svg>
                      <span className="text-sm font-medium text-[#1C1E21]">
                        {testimonial.type}
                      </span>
                    </div>
                    <p className="mb-6 leading-relaxed text-[#1C1E21] italic">
                      &quot;{testimonial.quote}&quot;
                    </p>
                    <div className="mt-auto flex items-center gap-3 border-t border-gray-100 pt-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#43CD66] bg-white text-lg font-bold text-[#43CD66]">
                        {testimonial.author.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#1C1E21]">
                          {testimonial.author}
                        </p>
                        {testimonial.company && (
                          <p className="text-xs text-[#1C1E21] opacity-70">
                            {testimonial.company}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </CarouselItem>
            ))}
          </CarouselContent>
          {/* Minimal carousel navigation */}
          <div className="mt-8 flex justify-center gap-4">
            <CarouselPrevious
              className="static z-10 h-10 w-10 transform-none rounded-full border border-gray-300 bg-white text-[#1C1E21] transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
              variant="outline"
              disabled={!canScrollPrev}
            />
            <CarouselNext
              className="static z-10 h-10 w-10 transform-none rounded-full border border-gray-300 bg-white text-[#1C1E21] transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
              variant="outline"
              disabled={!canScrollNext}
            />
          </div>
        </Carousel>
      </div>
    </div>
  </section>
);
