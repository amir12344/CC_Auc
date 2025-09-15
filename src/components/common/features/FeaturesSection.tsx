"use client";

import { ReactNode } from "react";

import { FeatureItem, FeatureItemProps } from "./FeatureItem";

export interface FeaturesSectionProps {
  /**
   * Section title
   */
  title: ReactNode;

  /**
   * Array of features to display
   */
  features: FeatureItemProps[];

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
 * Reusable features section component that displays a title and a list of features
 */
export const FeaturesSection = ({
  title,
  features,
  className = "",
  id,
  beforeFeatures,
  afterFeatures,
}: FeaturesSectionProps) => {
  return (
    <section
      id={id}
      className={`relative z-20 mt-0 w-full bg-white py-16 md:py-20 ${className}`}
    >
      <div className="container mx-auto px-4">
        {/* Section title */}
        <div className="mb-16 text-center">
          <h2 className="text-text-primary mb-4 text-4xl font-bold md:text-5xl">
            {title}
          </h2>
        </div>

        {/* Optional content before features */}
        {beforeFeatures}

        {/* Features list */}
        <div className="space-y-16 md:space-y-24">
          {features.map((feature, index) => (
            <FeatureItem key={index} {...feature} reverse={index % 2 !== 0} />
          ))}
        </div>

        {/* Optional content after features */}
        {afterFeatures}
      </div>
    </section>
  );
};

export default FeaturesSection;
