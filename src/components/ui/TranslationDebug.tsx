'use client';

import { useEffect, useState } from 'react';
import { firestoreService } from '@/services/firestoreService';
import { useLocale } from 'next-intl';

interface TranslationDebugInfo {
  locale: string;
  translationsLoaded: number;
  sampleTranslation?: any;
  availableLocales: string[];
  cacheInfo: any;
}

export function TranslationDebug() {
  const locale = useLocale();
  const [debugInfo, setDebugInfo] = useState<TranslationDebugInfo | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const refreshDebugInfo = async () => {
    try {
      const translationService = firestoreService.getTranslationService();
      const translations = await translationService.getAllProductTranslations();
      const cacheInfo = translationService.getCacheInfo();
      
      let sampleTranslation = null;
      let availableLocales: string[] = [];
      
      if (translations.length > 0) {
        sampleTranslation = translations[0];
        const allLocales = new Set<string>();
        translations.forEach(t => {
          Object.keys(t.translations || {}).forEach(loc => allLocales.add(loc));
        });
        availableLocales = Array.from(allLocales).sort();
      }

      setDebugInfo({
        locale,
        translationsLoaded: translations.length,
        sampleTranslation,
        availableLocales,
        cacheInfo
      });
    } catch (error) {
      console.error('Failed to get translation debug info:', error);
    }
  };

  useEffect(() => {
    refreshDebugInfo();
  }, [locale]);

  // Test translation function
  const testTranslation = async (productId: string) => {
    const translationService = firestoreService.getTranslationService();
    const translation = translationService.getProductTranslation(productId, locale);
    console.log(`Test translation for product ${productId} in ${locale}:`, translation);
    alert(`Translation test:\nProduct ID: ${productId}\nLocale: ${locale}\nResult: ${JSON.stringify(translation, null, 2)}`);
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        style={{
          position: 'fixed',
          top: '10px',
          right: '10px',
          background: '#007bff',
          color: 'white',
          border: 'none',
          padding: '5px 10px',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '12px',
          zIndex: 9997
        }}
      >
        🔍 Debug
      </button>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        width: '400px',
        maxHeight: '80vh',
        overflow: 'auto',
        background: 'white',
        border: '1px solid #ccc',
        borderRadius: '8px',
        padding: '15px',
        fontSize: '12px',
        zIndex: 9997,
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h3 style={{ margin: 0, fontSize: '14px' }}>🔍 Translation Debug</h3>
        <button
          onClick={() => setIsVisible(false)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}
        >
          ×
        </button>
      </div>
      
      <button
        onClick={refreshDebugInfo}
        style={{
          background: '#28a745',
          color: 'white',
          border: 'none',
          padding: '5px 10px',
          borderRadius: '3px',
          cursor: 'pointer',
          fontSize: '11px',
          marginBottom: '10px'
        }}
      >
        🔄 Refresh
      </button>

      {debugInfo ? (
        <div>
          <div><strong>Current Locale:</strong> {debugInfo.locale}</div>
          <div><strong>Translations Loaded:</strong> {debugInfo.translationsLoaded}</div>
          <div><strong>Available Locales:</strong> {debugInfo.availableLocales.join(', ')}</div>
          
          <div style={{ marginTop: '10px' }}>
            <strong>Cache Info:</strong>
            <pre style={{ fontSize: '10px', background: '#f5f5f5', padding: '5px', borderRadius: '3px' }}>
              {JSON.stringify(debugInfo.cacheInfo, null, 2)}
            </pre>
          </div>

          {debugInfo.sampleTranslation && (
            <div style={{ marginTop: '10px' }}>
              <strong>Sample Translation:</strong>
              <pre style={{ fontSize: '10px', background: '#f5f5f5', padding: '5px', borderRadius: '3px', maxHeight: '200px', overflow: 'auto' }}>
                {JSON.stringify(debugInfo.sampleTranslation, null, 2)}
              </pre>
            </div>
          )}

          <div style={{ marginTop: '10px' }}>
            <strong>Test Translation:</strong>
            <div style={{ marginTop: '5px' }}>
              <input
                type="text"
                placeholder="Enter product ID"
                id="testProductId"
                style={{ width: '200px', padding: '3px', marginRight: '5px' }}
              />
              <button
                onClick={() => {
                  const input = document.getElementById('testProductId') as HTMLInputElement;
                  if (input.value) {
                    testTranslation(input.value);
                  }
                }}
                style={{
                  background: '#ffc107',
                  color: 'black',
                  border: 'none',
                  padding: '3px 8px',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  fontSize: '11px'
                }}
              >
                Test
              </button>
            </div>
          </div>

          <div style={{ marginTop: '10px' }}>
            <strong>Global Debug:</strong>
            <div style={{ fontSize: '10px', marginTop: '5px' }}>
              Check browser console for detailed logs.
              <br />
              Use <code>window.translationStatus</code> in console.
            </div>
          </div>
        </div>
      ) : (
        <div>Loading debug info...</div>
      )}
    </div>
  );
}

// Only show in development
export function TranslationDebugWrapper() {
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  return <TranslationDebug />;
}