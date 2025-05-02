'use client';

import { useToast } from '@/src/components/ui/ToastContext';
import { ToastType } from '@/src/components/ui/ToastContext';

/**
 * Hook for showing toast notifications
 * Provides a simpler interface for showing different types of toasts
 */
export function useToastNotification() {
  const { showToast } = useToast();
  
  return {
    /**
     * Show a success toast notification
     */
    success: (message: string, duration = 3000) => {
      showToast(message, 'success', duration);
    },
    
    /**
     * Show an error toast notification
     */
    error: (message: string, duration = 5000) => {
      showToast(message, 'destructive', duration);
    },
    
    /**
     * Show an info toast notification
     */
    info: (message: string, duration = 3000) => {
      showToast(message, 'info', duration);
    },
    
    /**
     * Show a warning toast notification
     */
    warning: (message: string, duration = 4000) => {
      showToast(message, 'warning', duration);
    },
    
    /**
     * Show a custom toast notification
     */
    show: (message: string, type: ToastType, duration = 3000) => {
      showToast(message, type, duration);
    }
  };
}
