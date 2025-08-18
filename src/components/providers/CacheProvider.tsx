'use client';

import { useEffect } from 'react';
import { initializeCache, cleanupCache } from '@/lib/cacheInit';

interface CacheProviderProps {
  children: React.ReactNode;
}

export function CacheProvider({ children }: CacheProviderProps) {
  useEffect(() => {
    // Only initialize cache system on client side
    if (typeof window !== 'undefined') {
      initializeCache();

      // Cleanup when component unmounts
      return () => {
        cleanupCache();
      };
    }
  }, []);

  return <>{children}</>;
}