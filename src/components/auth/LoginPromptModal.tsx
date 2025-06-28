'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/src/components/ui/dialog';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent } from '@/src/components/ui/card';
import {
  Lock,
  Eye,
  ShoppingCart,
  Gavel,
  ArrowRight,
  X
} from 'lucide-react';
import { authSessionStorage } from '@/src/utils/sessionStorage';

interface LoginPromptModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Function to close the modal */
  onClose: () => void;
  /** The action that triggered the prompt */
  triggerAction?: 'view_manifest' | 'place_bid' | 'buy_now' | 'view_details';
  /** Item name or title for context */
  itemName?: string;
  /** Current page URL for return after login */
  returnUrl?: string;
}

/**
 * LoginPromptModal - Encourages user registration with compelling messaging
 * 
 * Shows when guests try to access restricted content like manifests or bidding
 * Provides clear benefits of registration and smooth login flow
 */
export function LoginPromptModal({
  isOpen,
  onClose,
  triggerAction = 'view_details',
  itemName,
  returnUrl
}: LoginPromptModalProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Handle login navigation with return URL
   */
  const handleLogin = () => {
    setIsLoading(true);

    // Save return URL using the proper auth session storage system
    if (returnUrl) {
      authSessionStorage.saveRedirectUrl(returnUrl);
      // Also pass as query param for immediate access
      router.push(`/auth/login?returnUrl=${encodeURIComponent(returnUrl)}`);
    } else {
      router.push('/auth/login');
    }
  };

  /**
   * Handle signup navigation
   */
  const handleSignup = () => {
    setIsLoading(true);

    // Save return URL using the proper auth session storage system
    if (returnUrl) {
      authSessionStorage.saveRedirectUrl(returnUrl);
      // Also pass as query param for the signup flow
      router.push(`/auth/select-user-type?redirect=${encodeURIComponent(returnUrl)}`);
    } else {
      router.push('/auth/select-user-type');
    }
  };

  /**
   * Get action-specific messaging
   */
  const getActionMessage = () => {
    switch (triggerAction) {
      case 'view_manifest':
        return {
          icon: <Eye className="h-6 w-6 text-blue-600" />,
          title: 'View Complete Manifest',
          description: `See detailed inventory breakdown for ${itemName || 'this lot'}`,
          benefit: 'Access complete product lists, quantities, and estimated values'
        };
      case 'place_bid':
        return {
          icon: <Gavel className="h-6 w-6 text-green-600" />,
          title: 'Place Your Bid',
          description: `Start bidding on ${itemName || 'this auction'}`,
          benefit: 'Participate in auctions and get wholesale prices'
        };
      case 'buy_now':
        return {
          icon: <ShoppingCart className="h-6 w-6 text-purple-600" />,
          title: 'Buy This Product',
          description: `Purchase ${itemName || 'this item'} now`,
          benefit: 'Get instant access to wholesale inventory'
        };
      default:
        return {
          icon: <Lock className="h-6 w-6 text-gray-600" />,
          title: 'Access Premium Content',
          description: 'View exclusive details and pricing information',
          benefit: 'Unlock full access to our marketplace'
        };
    }
  };

  const actionMessage = getActionMessage();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md p-0 gap-0">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none z-10"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>

        {/* Simple Header */}
        <div className="p-6 text-center">
          <DialogTitle className="text-xl font-semibold text-gray-900 mb-2">
            Sign In Required
          </DialogTitle>
          <DialogDescription className="text-gray-600 mb-6">
            Please sign in to access this content
          </DialogDescription>

          {/* Action buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full h-11 bg-black hover:bg-gray-800 text-white font-medium rounded-full"
            >
              {isLoading ? (
                'Redirecting...'
              ) : (
                'Log In'
              )}
            </Button>

            <Button
              onClick={handleSignup}
              disabled={isLoading}
              variant="outline"
              className="w-full h-11 border-gray-300 text-gray-700 hover:bg-gray-50 font-medium rounded-full"
            >
              Create Account
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 