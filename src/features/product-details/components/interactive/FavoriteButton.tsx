'use client';

import { useState } from 'react';

interface FavoriteButtonProps {
  productId?: string; // Made optional since it's not being used
  isFavorite?: boolean;
  onToggle?: () => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Client Component for the favorite button
 * Handles toggling favorite state with visual feedback
 */
export const FavoriteButton = ({ 
  // productId removed from destructuring since it's not used
  isFavorite: initialFavorite = false, 
  onToggle,
  size = 'md', 
  className = '' 
}: FavoriteButtonProps) => {
  const [isFavoriteState, setIsFavoriteState] = useState(initialFavorite);

  // Determine which favorite state to use - props or internal
  const favoriteStatus = isFavoriteState;

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Update internal state
    setIsFavoriteState(!favoriteStatus);
    
    // Call external handler if provided
    if (onToggle) {
      onToggle();
    }
  };

  // Determine size classes based on size prop
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-7 h-7',
    lg: 'w-9 h-9'
  }[size];

  return (
    <button 
      onClick={toggleFavorite}
      className={`absolute top-2 right-2 z-10 ${className}`}
      aria-label={favoriteStatus ? 'Remove from favorites' : 'Add to favorites'}
    >
      {favoriteStatus ? (
        <svg className={`${sizeClasses} text-gray-500 fill-current`} viewBox="0 0 24 24">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      ) : (
        <svg className={`${sizeClasses} text-white`} viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      )}
    </button>
  );
}; 