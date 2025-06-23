'use client';

import { useState, ReactNode } from 'react';
import { usePublicPageAuth } from '@/src/hooks/useAuthState';
import { Button, ButtonProps } from '@/src/components/ui/button';
import { LoginPromptModal } from '@/src/components/auth/LoginPromptModal';
import { Lock, Loader2 } from 'lucide-react';

interface ConditionalActionButtonProps extends Omit<ButtonProps, 'onClick'> {
  /** Action to perform when authenticated */
  onAuthenticatedClick: () => void;
  /** Action that triggers the login prompt */
  triggerAction?: 'view_manifest' | 'place_bid' | 'buy_now' | 'view_details';
  /** Item name for context in login prompt */
  itemName?: string;
  /** Text to show for guests */
  guestText?: string;
  /** Text to show for authenticated users */
  authenticatedText?: string;
  /** Icon for guests */
  guestIcon?: ReactNode;
  /** Icon for authenticated users */
  authenticatedIcon?: ReactNode;
  /** Required user type ('buyer' | 'seller'), if any */
  requiredUserType?: 'buyer' | 'seller';
  /** Message to show for wrong user type */
  wrongUserTypeMessage?: string;
  /** Show loading state */
  isLoading?: boolean;
  /** Whether this is a secondary action (uses outline style for guests) */
  isSecondary?: boolean;
}

/**
 * ConditionalActionButton - Smart button that adapts based on authentication state
 * 
 * - Guests: Shows login prompt with compelling messaging
 * - Wrong user type: Shows appropriate message  
 * - Authenticated: Normal button functionality
 * - Loading: Shows spinner and disabled state
 */
export function ConditionalActionButton({
  onAuthenticatedClick,
  triggerAction = 'view_details',
  itemName,
  guestText,
  authenticatedText,
  guestIcon,
  authenticatedIcon,
  requiredUserType,
  wrongUserTypeMessage,
  isLoading = false,
  isSecondary = false,
  children,
  disabled,
  className,
  ...buttonProps
}: ConditionalActionButtonProps) {
  const { isAuthenticated, userType } = usePublicPageAuth();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  /**
   * Handle button click based on auth state
   */
  const handleClick = () => {
    if (!isAuthenticated) {
      // Show login prompt for guests
      setShowLoginPrompt(true);
      return;
    }

    if (requiredUserType && userType !== requiredUserType) {
      // TODO: Show user type switching message
      // For now, just show alert
      alert(wrongUserTypeMessage || `This action requires a ${requiredUserType} account.`);
      return;
    }

    // User is authenticated and has correct role
    onAuthenticatedClick();
  };

  /**
   * Get button content based on auth state
   */
  const getButtonContent = () => {
    if (isLoading) {
      return (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading...
        </>
      );
    }

    if (!isAuthenticated) {
      return (
        <>
          {guestIcon || <Lock className="mr-2 h-4 w-4" />}
          {guestText || children || 'Sign In Required'}
        </>
      );
    }

    if (requiredUserType && userType !== requiredUserType) {
      return (
        <>
          <Lock className="mr-2 h-4 w-4" />
          {`${requiredUserType} Account Required`}
        </>
      );
    }

    return (
      <>
        {authenticatedIcon}
        {authenticatedText || children}
      </>
    );
  };

  /**
   * Get button variant based on auth state
   */
  const getButtonVariant = () => {
    if (isSecondary && !isAuthenticated) {
      return 'outline';
    }
    return buttonProps.variant || 'default';
  };

  /**
   * Get button classes based on auth state
   */
  const getButtonClasses = () => {
    const baseClasses = className || '';

    if (!isAuthenticated) {
      if (isSecondary) {
        return `${baseClasses} border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300`;
      }
      return `${baseClasses} bg-black hover:bg-gray-800 text-white`;
    }

    if (requiredUserType && userType !== requiredUserType) {
      return `${baseClasses} bg-gray-400 hover:bg-gray-500 text-white cursor-not-allowed`;
    }

    return baseClasses;
  };

  return (
    <>
      <Button
        {...buttonProps}
        variant={getButtonVariant()}
        className={getButtonClasses()}
        onClick={handleClick}
        disabled={disabled || isLoading || (requiredUserType && userType !== requiredUserType)}
      >
        {getButtonContent()}
      </Button>

      <LoginPromptModal
        isOpen={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
        triggerAction={triggerAction}
        itemName={itemName}
        returnUrl={typeof window !== 'undefined' ? window.location.href : undefined}
      />
    </>
  );
} 