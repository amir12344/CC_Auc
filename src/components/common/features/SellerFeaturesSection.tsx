"use client";

import { ReactNode } from "react";

import { SellerFeatureItem, SellerFeatureItemProps } from "./SellerFeatureItem";

export interface SellerFeaturesSectionProps {
  /**
   * Section title
   */
  title: ReactNode;

  /**
   * Array of features to display
   */
  features: SellerFeatureItemProps[];

  /**
   * Optional className for the section
   */
  className?: string;

  /**
   * Optional ID for the section
   */
  id?: string;

  /**
   * Optional content to display before the features
   */
  beforeFeatures?: ReactNode;

  /**
   * Optional content to display after the features
   */
  afterFeatures?: ReactNode;
}

/**
 * Specialized features section component for seller features with more complex layouts
 */
export const SellerFeaturesSection = ({
  title,
  features,
  className = "",
  id,
  beforeFeatures,
  afterFeatures,
}: SellerFeaturesSectionProps) => {
  return (
    <section
      id={id}
      className={`relative z-20 mt-0 w-full bg-white py-10 md:py-20 ${className}`}
    >
      <div className="mb-16 text-center">
        <h2 className="text-text-primary mb-4 text-4xl font-bold md:text-5xl">
          {title}
        </h2>
      </div>

      {/* Optional content before features */}
      {beforeFeatures}

      {/* Features list */}
      {features.map((feature, index) => (
        <SellerFeatureItem
          key={index}
          {...feature}
          reverse={index % 2 !== 0}
          backgroundColor={index % 2 !== 0 ? "gray" : "white"}
        />
      ))}

      {/* Optional content after features */}
      {afterFeatures}
    </section>
  );
};

export default SellerFeaturesSection;
