'use client';

import * as React from 'react';
import Link from 'next/link';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/src/lib/utils';

const iconButtonVariants = cva(
  'inline-flex items-center justify-center transition-colors rounded-full focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs',
        primary: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs', // Alias for compatibility
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-xs',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        light: 'bg-neutral-100 text-neutral-700 hover:text-primary hover:bg-primary-50',
      },
      size: {
        default: 'p-2.5 text-base',
        sm: 'p-1.5 text-sm',
        md: 'p-2.5 text-base', // Alias for compatibility
        lg: 'p-3 text-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

type BadgeColorVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'pending';

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof iconButtonVariants> {
  icon: React.ReactNode;
  isLoading?: boolean;
  href?: string;
  badge?: string | number;
  badgeColor?: BadgeColorVariant;
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({
    className,
    variant,
    size,
    icon,
    isLoading = false,
    href,
    badge,
    badgeColor = 'primary',
    disabled,
    ...props
  }, ref) => {
    // Loading styles
    const loadingClass = isLoading ? 'opacity-70 cursor-not-allowed' : '';
    
    // Badge color styles
    const badgeStyles: Record<BadgeColorVariant, string> = {
      primary: 'bg-primary',
      secondary: 'bg-secondary',
      success: 'bg-success-500',
      warning: 'bg-warning-500',
      error: 'bg-error-500',
      pending: 'bg-blue-500',
    };

    // Content with loading spinner or icon and optional badge
    const content = (
      <>
        {isLoading ? (
          <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : (
          icon
        )}
        
        {badge && (
          <span className={cn(
            'absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 rounded-full shadow-xs',
            badgeStyles[badgeColor]
          )}>
            {badge}
          </span>
        )}
      </>
    );

    // Link version - simplified props to avoid hydration mismatches
    if (href) {
      return (
        <Link
          href={href}
          className={cn(iconButtonVariants({ variant, size }), loadingClass, className)}
          aria-disabled={isLoading || disabled}
        >
          {content}
        </Link>
      );
    }
    
    // Button version
    return (
      <button
        ref={ref}
        className={cn(iconButtonVariants({ variant, size }), loadingClass, className)}
        disabled={isLoading || disabled}
        {...props}
      >
        {content}
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';

export { IconButton, iconButtonVariants };
export default IconButton;
