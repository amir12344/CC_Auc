import { useCallback, useState } from 'react';

export interface DragState {
  [key: string]: boolean;
}

export interface UseDragAndDropResult {
  dragState: DragState;
  handleDragOver: (e: React.DragEvent, type: string) => void;
  handleDragLeave: (e: React.DragEvent, type: string) => void;
  handleDrop: (e: React.DragEvent, type: string, onFileSelect: (file: File) => void) => void;
  resetDragState: () => void;
}

/**
 * Custom hook for drag and drop functionality
 * Provides drag state management and event handlers
 */
export const useDragAndDrop = (initialKeys: string[]): UseDragAndDropResult => {
  const [dragState, setDragState] = useState<DragState>(() => 
    initialKeys.reduce((acc, key) => ({ ...acc, [key]: false }), {})
  );

  const handleDragOver = useCallback((e: React.DragEvent, type: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragState(prev => ({ ...prev, [type]: true }));
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent, type: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragState(prev => ({ ...prev, [type]: false }));
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, type: string, onFileSelect: (file: File) => void) => {
    e.preventDefault();
    e.stopPropagation();
    setDragState(prev => ({ ...prev, [type]: false }));

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const file = files[0];
      onFileSelect(file);
    }
  }, []);

  const resetDragState = useCallback(() => {
    setDragState(prev => 
      Object.keys(prev).reduce((acc, key) => ({ ...acc, [key]: false }), {})
    );
  }, []);

  return {
    dragState,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    resetDragState,
  };
}; 