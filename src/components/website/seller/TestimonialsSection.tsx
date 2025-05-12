import { motion } from 'framer-motion';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/src/components/ui/carousel";
import { Dispatch, SetStateAction } from 'react';

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

export const TestimonialsSection = ({ testimonials, setApi, canScrollPrev, canScrollNext }: TestimonialsSectionProps) => (
  <section id="testimonials" className="w-full bg-[#F1E9DE] pt-[3rem] pb-[3rem]">
    <div className="mx-auto px-4">
      <div className="flex flex-col items-center justify-center mb-14">
        <h2 className="text-4xl font-semibold md:text-5xl text-center text-[#1C1E21] leading-tight max-w-3xl">
          Trusted by innovators and <span className="text-[#43CD66]">industry leaders</span>
        </h2>
        <div className="h-1 w-24 bg-[#43CD66] rounded-full mt-6 mb-2"></div>
      </div>
      <div className="relative">
        <Carousel
          setApi={setApi}
          className="w-full mx-auto"
          opts={{ align: "start" }}
        >
          <CarouselContent className="-ml-4">
            {testimonials.map((testimonial: Testimonial, index: number) => (
              <CarouselItem key={index} className="pl-4 md:basis-1/2 lg:basis-1/3">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 % 0.3, ease: "easeOut" }}
                  className="h-full"
                >
                  <div className="bg-white border border-gray-200 rounded-xl p-8 h-full flex flex-col transition-all duration-300 hover:-translate-y-1">
                    <div className="mb-4 flex items-center gap-2">
                      <svg className="h-6 w-6 text-[#43CD66]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                      </svg>
                      <span className="text-sm font-medium text-[#1C1E21]">{testimonial.type}</span>
                    </div>
                    <p className="text-[#1C1E21] mb-6 italic leading-relaxed">&quot;{testimonial.quote}&quot;</p>
                    <div className="border-t border-gray-100 pt-4 flex items-center gap-3 mt-auto">
                      <div className="w-10 h-10 bg-white border border-[#43CD66] rounded-full flex items-center justify-center text-[#43CD66] font-bold text-lg">
                        {testimonial.author.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-[#1C1E21] text-sm">{testimonial.author}</p>
                        {testimonial.company && (
                          <p className="text-[#1C1E21] text-xs opacity-70">{testimonial.company}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </CarouselItem>
            ))}
          </CarouselContent>
          {/* Minimal carousel navigation */}
          <div className="flex justify-center mt-8 gap-4">
            <CarouselPrevious
              className="static transform-none h-10 w-10 rounded-full border border-gray-300 bg-white text-[#1C1E21] hover:bg-gray-100 transition-colors z-10 disabled:opacity-40 disabled:cursor-not-allowed"
              variant="outline"
              disabled={!canScrollPrev}
            />
            <CarouselNext
              className="static transform-none h-10 w-10 rounded-full border border-gray-300 bg-white text-[#1C1E21] hover:bg-gray-100 transition-colors z-10 disabled:opacity-40 disabled:cursor-not-allowed"
              variant="outline"
              disabled={!canScrollNext}
            />
          </div>
        </Carousel>
      </div>
    </div>
  </section>
);
