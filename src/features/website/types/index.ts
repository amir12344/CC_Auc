// No theme types needed

// SEO types
export interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  openGraph?: {
    title?: string;
    description?: string;
    images?: Array<{
      url: string;
      width?: number;
      height?: number;
      alt?: string;
    }>;
  };
}

// Team member types
export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  image: string;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
    website?: string;
  };
}

// Testimonial types
export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  content: string;
  image: string;
  rating?: number;
}

// FAQ types
export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

// Feature types
export interface Feature {
  id: string;
  title: string;
  description: string;
  icon?: string;
  image?: string;
}

// Stat types
export interface Stat {
  id: string;
  value: number;
  label: string;
  prefix?: string;
  suffix?: string;
}
