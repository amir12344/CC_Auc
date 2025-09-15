"use client";

import Image from "next/image";
import { ReactNode } from "react";

import { motion } from "framer-motion";

export interface FeatureItemProps {
  /**
   * Feature title
   */
  title: string;

  /**
   * Feature description
   */
  description: string;

  /**
   * Icon component to display
   */
  icon?: ReactNode;

  /**
   * Path to the feature image
   */
  imagePath: string;

  /**
   * Alt text for the image
   */
  imageAlt: string;

  /**
   * Whether to reverse the layout (image on right vs left)
   * @default false
   */
  reverse?: boolean;

  /**
   * Optional custom content to display below the description
   */
  customContent?: ReactNode;

  /**
   * Optional custom content to overlay on the image
   */
  imageOverlay?: ReactNode;
}

/**
 * Reusable feature item component that displays an image, title, and description
 */
export const FeatureItem = ({
  title,
  description,
  icon,
  imagePath,
  imageAlt,
  reverse = false,
  customContent,
  imageOverlay,
}: FeatureItemProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      viewport={{ once: true, margin: "-100px" }}
      className={`flex flex-col ${reverse ? "md:flex-row-reverse" : "md:flex-row"} items-center gap-8 md:gap-16`}
    >
      {/* Image section */}
      <div className="w-full md:w-1/2">
        <div className="relative aspect-4/3 w-full overflow-hidden rounded-xl">
          <div className="from-primary-50 absolute inset-0 z-0 bg-gradient-to-br to-transparent"></div>
          <Image
            src={imagePath}
            alt={imageAlt}
            fill
            quality={75}
            loading="lazy"
            className="z-10 object-cover"
          />

          {/* Icon badge */}
          {icon && (
            <div
              className={`absolute ${reverse ? "-left-3 md:-left-6" : "-right-3 md:-right-6"} bg-primary -bottom-3 z-20 flex h-10 w-10 items-center justify-center rounded-full shadow-lg md:-bottom-6 md:h-12 md:w-12`}
            >
              <div className="scale-75 text-white md:scale-100">{icon}</div>
            </div>
          )}

          {/* Optional image overlay content */}
          {imageOverlay}
        </div>
      </div>

      {/* Content section */}
      <div className="mt-6 w-full md:mt-0 md:w-1/2">
        <div className="mx-auto max-w-xl md:mx-0">
          <h3 className="text-text-primary mb-3 text-xl font-semibold md:mb-4 md:text-3xl lg:text-4xl">
            {title}
          </h3>
          <p className="text-text-secondary mb-4 text-lg leading-relaxed md:mb-6 md:text-xl">
            {description}
          </p>

          {/* Optional custom content */}
          {customContent}
        </div>
      </div>
    </motion.div>
  );
};

export default FeatureItem;
