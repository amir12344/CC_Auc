// Button component types
export interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

// Card component types
export interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  bordered?: boolean;
  elevated?: boolean;
}

// Section component types
export interface SectionProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  background?: 'white' | 'light' | 'primary' | 'gradient';
  paddingY?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

// Container component types
export interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  padding?: boolean;
}


// Icon component types
export interface IconProps {
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'default' | 'primary' | 'secondary' | 'muted';
  className?: string;
}

// Image component types
export interface OptimizedImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none';
  priority?: boolean;
  loading?: 'lazy' | 'eager';
  placeholder?: 'blur-sm' | 'empty';
  blurDataURL?: string;
}

// Navigation types
export interface NavItemProps {
  label: string;
  href: string;
  isActive?: boolean;
  icon?: React.ReactNode;
  children?: NavItemProps[];
}

// Form component types
export interface InputProps {
  id: string;
  name: string;
  type?: string;
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  helperText?: string;
}

// Testimonial types
export interface TestimonialProps {
  quote: string;
  author: {
    name: string;
    title: string;
    company: string;
    avatar?: string;
  };
  rating?: number;
}

// Feature types
export interface FeatureProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  image?: string;
}

// FAQ types
export interface FAQItemProps {
  question: string;
  answer: string;
  isOpen?: boolean;
  onToggle?: () => void;
}

