'use client';

import { useEffect, useState } from 'react';
import { firestoreService } from '@/services/firestoreService';

interface TranslationProviderProps {
  children: React.ReactNode;
}

interface TranslationStatus {
  isLoading: boolean;
  isReady: boolean;
  error: string | null;
  translationCount: number;
}

export function TranslationProvider({ children }: TranslationProviderProps) {
  const [status, setStatus] = useState<TranslationStatus>({
    isLoading: true,
    isReady: false,
    error: null,
    translationCount: 0
  });

  useEffect(() => {
    // Initialize translation service on app startup
    const initializeTranslations = async () => {
      try {
        console.log('🚀 Translation provider: Starting initialization...');
        setStatus(prev => ({ ...prev, isLoading: true, error: null }));

        await firestoreService.initializeTranslations();
        
        // Get translation count for status using the new locale-based system
        const translationService = firestoreService.getTranslationService();
        
        // For status purposes, check a primary locale (English) to get an idea of available translations
        let translationCount = 0;
        try {
          const englishTranslations = await translationService.getProductTranslationsByLocale('en');
          translationCount = englishTranslations.length;
        } catch (error) {
          console.warn('Could not get translation count, proceeding anyway:', error);
        }
        
        console.log('✅ Translation provider: Initialization complete');
        console.log(`📊 Translation provider: Ready with locale-based translation system (${translationCount} English translations available)`);
        
        setStatus({
          isLoading: false,
          isReady: true,
          error: null,
          translationCount
        });
        
        // Global status for debugging
        (window as any).translationStatus = {
          ready: true,
          count: translationCount,
          service: translationService
        };
        
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        console.error('❌ Translation provider: Failed to initialize translations:', error);
        
        setStatus({
          isLoading: false,
          isReady: false,
          error: errorMsg,
          translationCount: 0
        });
        
        // Global status for debugging
        (window as any).translationStatus = {
          ready: false,
          error: errorMsg,
          count: 0
        };
      }
    };

    initializeTranslations();
  }, []);

  // Show loading state during initialization
  if (status.isLoading) {
    return (
      <div style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        background: 'rgba(0,0,0,0.8)', 
        color: 'white', 
        padding: '10px', 
        textAlign: 'center',
        zIndex: 9999,
        fontSize: '12px'
      }}>
        🔄 Loading translations...
      </div>
    );
  }

  // Show error state if translations failed to load
  if (status.error) {
    console.warn('⚠️  Translation provider: Rendering with error state, translations may not work');
  }

  return <>{children}</>;
}