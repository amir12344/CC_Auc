'use client';

import { GeistSans } from 'geist/font/sans';
import { useEffect } from 'react';

export const StyleProvider = () => {
  useEffect(() => {
    // Add classes after hydration
    document.documentElement.classList.add(GeistSans.className);
    document.body.classList.add('antialiased');
  }, []);

  return null;
}; 