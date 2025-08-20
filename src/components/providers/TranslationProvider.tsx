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
        
        // Get translation count for status
        const translationService = firestoreService.getTranslationService();
        const translations = await translationService.getAllProductTranslations();
        
        console.log('✅ Translation provider: Initialization complete');
        console.log(`📊 Translation provider: Loaded ${translations.length} translation documents`);
        
        setStatus({
          isLoading: false,
          isReady: true,
          error: null,
          translationCount: translations.length
        });
        
        // Global status for debugging
        (window as any).translationStatus = {
          ready: true,
          count: translations.length,
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

  return (
    <>
      {/* Debug indicator */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{ 
          position: 'fixed', 
          bottom: '10px', 
          right: '10px', 
          background: status.isReady ? 'green' : 'orange', 
          color: 'white', 
          padding: '5px 10px', 
          borderRadius: '5px',
          fontSize: '12px',
          zIndex: 9998
        }}>
          🌐 Translations: {status.isReady ? `Ready (${status.translationCount})` : status.error ? 'Error' : 'Loading'}
        </div>
      )}
      {children}
    </>
  );
}