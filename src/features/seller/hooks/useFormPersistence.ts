import { useEffect, useCallback } from 'react';

interface UseFormPersistenceProps {
  key: string;
  data: any;
  enabled?: boolean;
}

/**
 * Custom hook for form data persistence
 * 
 * Automatically saves form data to localStorage and provides methods
 * for manual save/load operations
 */
export function useFormPersistence({ 
  key, 
  data, 
  enabled = true 
}: UseFormPersistenceProps) {
  
  // Save data to localStorage
  const saveToStorage = useCallback((dataToSave: any) => {
    if (!enabled) return;
    
    try {
      const serializedData = JSON.stringify({
        data: dataToSave,
        timestamp: Date.now(),
      });
      localStorage.setItem(key, serializedData);
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }, [key, enabled]);

  // Load data from localStorage
  const loadFromStorage = useCallback(() => {
    if (!enabled) return null;
    
    try {
      const serializedData = localStorage.getItem(key);
      if (!serializedData) return null;
      
      const parsed = JSON.parse(serializedData);
      return parsed.data;
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
      return null;
    }
  }, [key, enabled]);

  // Clear data from localStorage
  const clearStorage = useCallback(() => {
    if (!enabled) return;
    
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  }, [key, enabled]);

  // Get last saved timestamp
  const getLastSaved = useCallback(() => {
    if (!enabled) return null;
    
    try {
      const serializedData = localStorage.getItem(key);
      if (!serializedData) return null;
      
      const parsed = JSON.parse(serializedData);
      return new Date(parsed.timestamp);
    } catch (error) {
      console.error('Failed to get timestamp from localStorage:', error);
      return null;
    }
  }, [key, enabled]);

  // Auto-save effect
  useEffect(() => {
    if (!enabled || !data) return;

    const timer = setTimeout(() => {
      // Only save if there's meaningful data
      const hasData = Object.values(data).some(value => 
        value !== undefined && 
        value !== null && 
        value !== '' && 
        (Array.isArray(value) ? value.length > 0 : true)
      );
      
      if (hasData) {
        saveToStorage(data);
      }
    }, 2000); // Debounce auto-save by 2 seconds

    return () => clearTimeout(timer);
  }, [data, saveToStorage, enabled]);

  return {
    saveToStorage,
    loadFromStorage,
    clearStorage,
    getLastSaved,
  };
} 