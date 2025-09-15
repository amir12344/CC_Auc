"use client";

import Image from "next/image";
import { ReactNode } from "react";

export interface SellerFeatureItemProps {
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

  /**
   * Optional background color for the section
   * @default 'white'
   */
  backgroundColor?: "white" | "gray";
}

/**
 * Specialized feature item component for seller features with more complex layouts
 */
export const SellerFeatureItem = ({
  title,
  description,
  icon,
  imagePath,
  imageAlt,
  reverse = false,
  customContent,
  imageOverlay,
  backgroundColor = "white",
}: SellerFeatureItemProps) => {
  const bgClass = backgroundColor === "gray" ? "bg-gray-50" : "bg-white";

  return (
    <div className={`relative py-16 ${bgClass} mb-32`}>
      {/* Optional background decoration */}
      {backgroundColor === "white" && (
        <div className="bg-primary-50 absolute -top-10 -left-10 -z-10 h-64 w-64 rounded-full blur-[80px]"></div>
      )}

      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center gap-12 lg:flex-row">
          {/* Image section */}
          <div
            className={`w-full lg:w-1/2 ${reverse ? "order-1 lg:order-2" : ""}`}
          >
            <div className="relative overflow-hidden rounded-xl border border-gray-100 shadow-xl">
              <div className="from-primary-50 absolute inset-0 z-0 bg-gradient-to-br to-transparent"></div>
              <Image
                src={imagePath}
                alt={imageAlt}
                width={650}
                height={400}
                quality={90}
                className="relative z-10 w-full"
              />

              {/* Optional image overlay content */}
              {imageOverlay}
            </div>
          </div>

          {/* Content section */}
          <div
            className={`w-full lg:w-1/2 ${reverse ? "order-2 lg:order-1" : ""}`}
          >
            <h2 className="text-text-primary mb-4 text-2xl font-bold sm:text-3xl md:mb-6 md:text-4xl">
              {title}
            </h2>
            <p className="text-text-secondary mb-8 text-lg leading-relaxed">
              {description}
            </p>

            {/* Optional custom content */}
            {customContent}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerFeatureItem;
